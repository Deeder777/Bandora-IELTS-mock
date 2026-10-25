// Bandora · AI examiner feedback (Netlify Function)
// POST /api/assess  { type: 'writing' | 'speaking', tasks | parts }
// Keys live ONLY in Netlify environment variables. The first one that is set is used:
//   GROQ_API_KEY      – free tier (default model openai/gpt-oss-120b, override with GROQ_MODEL)
//   GEMINI_API_KEY    – free tier (default model gemini-3.5-flash-lite, override with GEMINI_MODEL)
//   ANTHROPIC_API_KEY – paid (default model claude-sonnet-5-5, override with ANTHROPIC_MODEL)
// Optional: BANDORA_HOURLY_LIMIT (default 12 checks per visitor per hour).

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

function provider() {
  if (process.env.GROQ_API_KEY) return { name: 'groq', key: process.env.GROQ_API_KEY, model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b' };
  if (process.env.GEMINI_API_KEY) return { name: 'gemini', key: process.env.GEMINI_API_KEY, model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite' };
  if (process.env.ANTHROPIC_API_KEY) return { name: 'anthropic', key: process.env.ANTHROPIC_API_KEY, model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5' };
  return null;
}

// JSON instructions for providers without tool calling.
const SHAPE = (keys) => `{"bands":{${keys.map((k) => `"${k}":<integer 0-9>`).join(',')}},"comments":{${keys.map((k) => `"${k}":"<1-2 sentences>"`).join(',')}},"strengths":["<up to 3>"],"corrections":[{"original":"<exact text from the answer>","improved":"<corrected version>","reason":"<short>"}],"vocabulary":[{"instead_of":"<word used>","try":"<better word or phrase>"}],"next_step":"<one sentence>"}`;
const JSON_RULES = (type) => type === 'writing'
  ? `\n\nReply with ONLY a JSON object, no other text, in this exact shape: {"tasks":[{"task":<1 or 2>,${SHAPE(['c1', 'c2', 'c3', 'c4']).slice(1)}]} – one item per task above. At most 6 corrections and 5 vocabulary items per task.`
  : `\n\nReply with ONLY a JSON object, no other text, in this exact shape: ${SHAPE(['c1', 'c2', 'c3'])}. At most 6 corrections and 5 vocabulary items.`;

const int = (v) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.max(0, Math.min(9, n)) : null; };
const str = (v, n = 400) => (typeof v === 'string' ? v.slice(0, n) : '');
function cleanOne(r, keys) {
  if (!r || typeof r !== 'object' || !r.bands) return null;
  const bands = {}, comments = {};
  for (const k of keys) { bands[k] = int(r.bands[k]); comments[k] = str(r.comments && r.comments[k]); if (bands[k] == null) return null; }
  return {
    bands, comments,
    strengths: (Array.isArray(r.strengths) ? r.strengths : []).map((x) => str(x, 200)).filter(Boolean).slice(0, 3),
    corrections: (Array.isArray(r.corrections) ? r.corrections : []).filter((c) => c && c.original && c.improved).map((c) => ({ original: str(c.original, 300), improved: str(c.improved, 300), reason: str(c.reason, 200) })).slice(0, 6),
    vocabulary: (Array.isArray(r.vocabulary) ? r.vocabulary : []).filter((v) => v && v.instead_of && v.try).map((v) => ({ instead_of: str(v.instead_of, 80), try: str(v.try, 120) })).slice(0, 5),
    next_step: str(r.next_step, 300)
  };
}
function clean(type, r) {
  if (type === 'speaking') return cleanOne(r, ['c1', 'c2', 'c3']);
  const tasks = (r && Array.isArray(r.tasks) ? r.tasks : []).map((t) => { const c = cleanOne(t, ['c1', 'c2', 'c3', 'c4']); return c && (t.task === 1 || t.task === 2 || t.task === '1' || t.task === '2') ? Object.assign({ task: Number(t.task) }, c) : null; }).filter(Boolean);
  return tasks.length ? { tasks } : null;
}
function parseJSON(text) {
  const t = String(text || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/, '');
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  try { return JSON.parse(a >= 0 ? t.slice(a, b + 1) : t); } catch { return null; }
}

async function callProvider(p, type, user, tool) {
  if (p.name === 'groq') {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + p.key },
      body: JSON.stringify({ model: p.model, temperature: 0.2, max_completion_tokens: 4000, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: user + JSON_RULES(type) }] })
    });
    if (!r.ok) return { status: r.status, text: await r.text() };
    const d = await r.json();
    return { report: parseJSON(d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) };
  }
  if (p.name === 'gemini') {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(p.model)}:generateContent`, {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': p.key },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM }] }, contents: [{ role: 'user', parts: [{ text: user + JSON_RULES(type) }] }], generationConfig: { temperature: 0.2, responseMimeType: 'application/json', maxOutputTokens: 4000 } })
    });
    if (!r.ok) return { status: r.status, text: await r.text() };
    const d = await r.json();
    const parts = d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts || [];
    return { report: parseJSON(parts.map((x) => x.text || '').join('')) };
  }
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': p.key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: p.model, max_tokens: 2500, system: SYSTEM, tools: [tool], tool_choice: { type: 'tool', name: 'report' }, messages: [{ role: 'user', content: user }] })
  });
  if (!r.ok) return { status: r.status, text: await r.text() };
  const d = await r.json();
  const out = (d.content || []).find((c) => c.type === 'tool_use');
  return { report: out && out.input };
}

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'method' });
  const prov = provider();
  if (!prov) return json(503, { error: 'not_configured' });

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
    user = writingPrompt(tasks) + '\n\nAssess each task separately. Criteria: c1 = Task Achievement (Task 1) or Task Response (Task 2), c2 = Coherence and Cohesion, c3 = Lexical Resource, c4 = Grammatical Range and Accuracy.';
    const item = feedbackShape(['c1', 'c2', 'c3', 'c4']);
    item.properties.task = { type: 'integer', enum: [1, 2] }; item.required.unshift('task');
    tool = { name: 'report', description: 'Return the examiner report.', input_schema: { type: 'object', properties: { tasks: { type: 'array', items: item, minItems: 1, maxItems: 2 } }, required: ['tasks'] } };
  } else if (type === 'speaking') {
    const parts = (Array.isArray(body.parts) ? body.parts : []).filter((p) => p && words(p.transcript) >= 10).slice(0, 3);
    const total = parts.reduce((a, p) => a + words(p.transcript), 0);
    if (total < 60) return json(400, { error: 'too_short' });
    user = speakingPrompt(parts) + '\n\nAssess the whole speaking test. Criteria: c1 = Fluency and Coherence, c2 = Lexical Resource, c3 = Grammatical Range and Accuracy.';
    tool = { name: 'report', description: 'Return the examiner report.', input_schema: feedbackShape(['c1', 'c2', 'c3']) };
  } else return json(400, { error: 'bad_type' });

  try {
    const out = await callProvider(prov, type, user, tool);
    if (out.status) { console.error(prov.name, out.status, String(out.text).slice(0, 300)); return json(out.status === 429 ? 429 : 502, { error: out.status === 429 ? 'provider_busy' : 'upstream', status: out.status }); }
    const report = clean(type, out.report);
    if (!report) return json(502, { error: 'no_report' });
    return json(200, { type, model: prov.model, provider: prov.name, report });
  } catch (e) {
    console.error(e);
    return json(502, { error: 'network' });
  }
};

export const config = { path: '/api/assess' };
