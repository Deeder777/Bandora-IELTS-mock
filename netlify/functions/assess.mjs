// Bandora · AI examiner feedback (Netlify Function)
// POST /api/assess  { type: 'writing' | 'speaking', tasks | parts }
// The Anthropic API key lives ONLY in Netlify environment variables (ANTHROPIC_API_KEY).
// Optional: ANTHROPIC_MODEL (default claude-sonnet-5-5), BANDORA_HOURLY_LIMIT (default 12 per visitor).

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';
const LIMIT = Number(process.env.BANDORA_HOURLY_LIMIT || 12);
const hits = new Map(); // best-effort, per warm instance

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const clip = (s, n) => String(s || '').replace(/\s+\n/g, '\n').trim().slice(0, n);
const words = (s) => (String(s || '').match(/[A-Za-z0-9'’-]+/g) || []).length;

const band = { type: 'integer', minimum: 0, maximum: 9 };
const fix = { type: 'object', properties: { original: { type: 'string' }, improved: { type: 'string' }, reason: { type: 'string' } }, required: ['original', 'improved', 'reason'] };
const vocab = { type: 'object', properties: { instead_of: { type: 'string' }, try: { type: 'string' } }, required: ['instead_of', 'try'] };
const feedbackShape = (keys) => ({
  type: 'object',
  properties: {
    bands: { type: 'object', properties: Object.fromEntries(keys.map((k) => [k, band])), required: keys },
    comments: { type: 'object', properties: Object.fromEntries(keys.map((k) => [k, { type: 'string' }])), required: keys },
    strengths: { type: 'array', items: { type: 'string' }, maxItems: 3 },
    corrections: { type: 'array', items: fix, maxItems: 6 },
    vocabulary: { type: 'array', items: vocab, maxItems: 5 },
    next_step: { type: 'string' }
  },
  required: ['bands', 'comments', 'corrections', 'vocabulary', 'next_step']
});

const SYSTEM = `You are a strict, experienced IELTS examiner. Assess the candidate using the public IELTS band descriptors.
Rules:
- Give whole-number criterion bands (0-9). Be honest: do not inflate. Off-topic, memorised or very short answers must score low.
- Under-length writing is penalised in Task Achievement / Task Response.
- Every "original" in corrections must be copied exactly from the candidate's text. "improved" is a corrected, natural version. Keep "reason" to one short sentence.
- Vocabulary suggestions replace words the candidate actually used with more precise or less common alternatives.
- Comments: one or two plain sentences each, addressed to the candidate as "you", saying what limits the band and how to reach the next band.
- Write simple, clear English (the reader is a learner).`;

function writingPrompt(tasks) {
  return tasks.map((t) => `### Writing Task ${t.id} (minimum ${t.minWords} words; candidate wrote ${words(t.response)} words)
Question:
${clip(t.prompt, 1500)}${t.visual ? `\nData shown to the candidate (JSON): ${clip(t.visual, 1500)}` : ''}

Candidate's response:
"""
${clip(t.response, 9000)}
"""`).join('\n\n');
}
function speakingPrompt(parts) {
  return `The text below is an automatic speech-recognition transcript, so punctuation, capitals and some words may be wrong. Do NOT penalise punctuation or spelling. Pronunciation cannot be judged from text, so it is not assessed.

${parts.map((p) => `### Speaking ${p.title}
Questions asked:
${(p.prompts || []).slice(0, 8).map((q) => '- ' + clip(q, 200)).join('\n')}
Transcript (${words(p.transcript)} words${p.seconds ? `, about ${Math.round(p.seconds)} seconds` : ''}):
"""
${clip(p.transcript, 6000)}
"""`).join('\n\n')}`;
}

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'method' });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return json(503, { error: 'not_configured' });

  const ip = req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-forwarded-for') || 'anon';
  const now = Date.now(), list = (hits.get(ip) || []).filter((t) => now - t < 3600e3);
  if (list.length >= LIMIT) return json(429, { error: 'rate_limited' });
  list.push(now); hits.set(ip, list);

  let body;
  try { body = await req.json(); } catch { return json(400, { error: 'bad_json' }); }
  const type = body && body.type;
  let user, tool;
  if (type === 'writing') {
    const tasks = (Array.isArray(body.tasks) ? body.tasks : []).filter((t) => t && (t.id === 1 || t.id === 2) && words(t.response) >= 20).slice(0, 2);
    if (!tasks.length) return json(400, { error: 'too_short' });
    user = writingPrompt(tasks) + '\n\nAssess each task separately with the report tool. Criteria: c1 = Task Achievement (Task 1) or Task Response (Task 2), c2 = Coherence and Cohesion, c3 = Lexical Resource, c4 = Grammatical Range and Accuracy.';
    const item = feedbackShape(['c1', 'c2', 'c3', 'c4']);
    item.properties.task = { type: 'integer', enum: [1, 2] }; item.required.unshift('task');
    tool = { name: 'report', description: 'Return the examiner report.', input_schema: { type: 'object', properties: { tasks: { type: 'array', items: item, minItems: 1, maxItems: 2 } }, required: ['tasks'] } };
  } else if (type === 'speaking') {
    const parts = (Array.isArray(body.parts) ? body.parts : []).filter((p) => p && words(p.transcript) >= 10).slice(0, 3);
    const total = parts.reduce((a, p) => a + words(p.transcript), 0);
    if (total < 60) return json(400, { error: 'too_short' });
    user = speakingPrompt(parts) + '\n\nAssess the whole speaking test with the report tool. Criteria: c1 = Fluency and Coherence, c2 = Lexical Resource, c3 = Grammatical Range and Accuracy.';
    tool = { name: 'report', description: 'Return the examiner report.', input_schema: feedbackShape(['c1', 'c2', 'c3']) };
  } else return json(400, { error: 'bad_type' });

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 2500, system: SYSTEM, tools: [tool], tool_choice: { type: 'tool', name: 'report' }, messages: [{ role: 'user', content: user }] })
    });
    if (!r.ok) { const t = await r.text(); console.error('anthropic', r.status, t.slice(0, 300)); return json(502, { error: 'upstream', status: r.status }); }
    const data = await r.json();
    const out = (data.content || []).find((c) => c.type === 'tool_use');
    if (!out) return json(502, { error: 'no_report' });
    return json(200, { type, model: MODEL, report: out.input });
  } catch (e) {
    console.error(e);
    return json(502, { error: 'network' });
  }
};

export const config = { path: '/api/assess' };
