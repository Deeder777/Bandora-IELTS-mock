/* Bandora · AI examiner feedback on the Writing and Speaking result pages.
   Calls the site's own /api/assess function (Netlify). No keys live in this file. */
(function () {
  'use strict';
  if (typeof renderResult !== 'function') return;
  const ENDPOINT = (window.BANDORA_CONFIG && window.BANDORA_CONFIG.aiEndpoint) || '/api/assess';
  const NAMES = {
    writing: { c1: 'Task Achievement / Response', c2: 'Coherence & Cohesion', c3: 'Lexical Resource', c4: 'Grammatical Range & Accuracy' },
    speaking: { c1: 'Fluency & Coherence', c2: 'Lexical Resource', c3: 'Grammatical Range & Accuracy' }
  };
  const busy = new Set(), errors = new Map();
  const B = window.Bands;
  const roundB = (x) => (B ? B.roundBand(x) : Math.round(x * 2) / 2);
  const fmt = (x) => (B ? B.fmtBand(x) : String(x));

  function payload(h) {
    const d = dataFor(h.type, h);
    if (h.type === 'writing') {
      return { type: 'writing', tasks: d.tasks.map((t) => ({ id: t.id, minWords: t.minWords, prompt: t.prompt, visual: t.chart ? JSON.stringify(t.chart) : t.table ? JSON.stringify(t.table) : '', response: String(h.answers[t.id] || '') })) };
    }
    let stats = {};
    try { stats = JSON.parse(h.answers.speechstats || '{}').p || {}; } catch (e) { stats = {}; }
    return { type: 'speaking', parts: d.parts.map((p, i) => ({ title: p.title, prompts: p.prompts, transcript: String(h.answers['speech' + (i + 1)] || ''), seconds: stats[i] && stats[i].s })) };
  }
  function wordsOf(h) {
    const p = payload(h);
    const list = h.type === 'writing' ? p.tasks.map((t) => t.response) : p.parts.map((x) => x.transcript);
    return list.join(' ').split(/\s+/).filter(Boolean).length;
  }

  // Combine the report into criterion bands (Writing Task 2 counts double, like the real test).
  function combined(h) {
    const rep = h.ai && h.ai.report;
    if (!rep) return null;
    if (h.type === 'writing') {
      const t1 = (rep.tasks || []).find((t) => t.task === 1), t2 = (rep.tasks || []).find((t) => t.task === 2);
      const out = {};
      ['c1', 'c2', 'c3', 'c4'].forEach((k) => {
        const a = t1 ? t1.bands[k] : null, b = t2 ? t2.bands[k] : null;
        out[k] = a != null && b != null ? Math.round((a + 2 * b) / 3) : (b != null ? b : a);
      });
      return { crit: out, partial: !(t1 && t2) };
    }
    const out = { c1: rep.bands.c1, c2: rep.bands.c2, c3: rep.bands.c3 };
    const est = B && B.speakingEstimate(h);
    out.c4 = est && est.crit && est.crit.c4 != null ? est.crit.c4 : Math.round((out.c1 + out.c2 + out.c3) / 3);
    return { crit: out, partial: false, pronFromEstimate: true };
  }

  function listHTML(title, items, render) {
    if (!items || !items.length) return '';
    return `<div class="ai-block"><h4>${title}</h4><ul>${items.map(render).join('')}</ul></div>`;
  }
  function reportHTML(kind, r, label) {
    const keys = Object.keys(NAMES[kind]).filter((k) => r.bands[k] != null);
    return `${label ? `<h3 class="ai-task">${label}</h3>` : ''}<div class="ai-crits">${keys.map((k) => `<div class="ai-crit"><div class="ai-crit-head"><span>${k === 'c1' && kind === 'writing' && label ? (label === 'Task 1' ? 'Task Achievement' : 'Task Response') : NAMES[kind][k]}</span><b>${r.bands[k]}</b></div><span class="ai-bar"><i style="width:${(r.bands[k] / 9) * 100}%"></i></span><p>${esc(r.comments[k] || '')}</p></div>`).join('')}</div>
      ${listHTML('What you did well', r.strengths, (s) => `<li>${esc(s)}</li>`)}
      ${listHTML('Corrections', r.corrections, (c) => `<li class="ai-fix"><s>${esc(c.original)}</s><span>→ ${esc(c.improved)}</span><small>${esc(c.reason)}</small></li>`)}
      ${listHTML('Better word choices', r.vocabulary, (v) => `<li><s>${esc(v.instead_of)}</s> → <b>${esc(v.try)}</b></li>`)}
      ${r.next_step ? `<p class="ai-next"><b>Next step:</b> ${esc(r.next_step)}</p>` : ''}`;
  }

  function panelHTML(h) {
    const kind = h.type;
    if (h.ai && h.ai.report) {
      const rep = h.ai.report, c = combined(h);
      const ov = c ? roundB(Object.values(c.crit).reduce((a, b) => a + b, 0) / 4) : null;
      const applied = h.rating && c && Object.keys(c.crit).every((k) => h.rating[k] === c.crit[k]);
      const body = kind === 'writing'
        ? (rep.tasks || []).sort((a, b) => a.task - b.task).map((t) => reportHTML('writing', t, 'Task ' + t.task)).join('')
        : reportHTML('speaking', rep, '');
      return `<section class="bdx-panel ai-panel bdx-reveal" id="ai-panel"><div class="bdx-panel-head"><h2>AI examiner feedback</h2><span class="bdx-chip bdx-chip--grad">Band ${fmt(ov)}</span></div>
        <p class="ai-lede">${kind === 'writing' ? (c.partial ? 'Only one task was long enough to assess, so this band is based on that task.' : 'Task 2 counts twice as much as Task 1, as in the real test.') : 'Based on your speech transcript. Pronunciation comes from Bandora’s own estimate, because it cannot be judged from text.'}</p>
        <div class="ai-actions">${applied ? '<span class="bdx-chip bdx-chip--green">Used for your band</span>' : `<button class="bdx-btn bdx-btn--grad ai-apply" data-ai="apply" data-id="${h.id}">Use these bands for my score</button>`}<button class="bdx-link" data-ai="run" data-id="${h.id}">Check again</button></div>
        ${body}
        <p class="ai-note">AI feedback is an estimate to guide practice, not an official IELTS score.</p></section>`;
    }
    const w = wordsOf(h), need = kind === 'writing' ? 20 : 60;
    const err = errors.get(h.id) ? `<p class="ai-error">${esc(errors.get(h.id))}</p>` : '';
    return `<section class="bdx-panel ai-panel ai-panel--empty bdx-reveal" id="ai-panel"><div class="bdx-panel-head"><h2>AI examiner feedback</h2><span class="bdx-chip">New</span></div>
      <p class="ai-lede">${kind === 'writing' ? 'Get a band for each criterion, corrected sentences and better word choices, marked against the IELTS band descriptors.' : 'Get examiner-style feedback on fluency, vocabulary and grammar from your speech transcript.'}</p>
      ${w < need ? `<p class="ai-error">${kind === 'writing' ? 'Write at least 20 words in a task to get AI feedback.' : 'Use live analysis while you speak so Bandora has a transcript (at least 60 words) to check.'}</p>` : `<button class="bdx-btn bdx-btn--grad" data-ai="run" data-id="${h.id}" ${busy.has(h.id) ? 'disabled' : ''}>${busy.has(h.id) ? '<span class="ai-spin"></span> Checking… about 20 seconds' : 'Check my ' + (kind === 'writing' ? 'writing' : 'speaking') + ' with AI'}</button>`}
      ${err}</section>`;
  }

  function mount() {
    const h = saved.history.find((x) => x.id === resultId);
    if (!h || (h.type !== 'writing' && h.type !== 'speaking')) return;
    const old = document.getElementById('ai-panel'); if (old) old.remove();
    const holder = document.createElement('div');
    holder.innerHTML = panelHTML(h);
    const anchor = document.querySelector('.bdx-res-grid') || document.querySelector('.result-review') || document.getElementById('main');
    if (!anchor) return;
    if (anchor.id === 'main') anchor.appendChild(holder.firstElementChild); else anchor.after(holder.firstElementChild);
  }
  const base = renderResult;
  renderResult = function () { base.apply(this, arguments); try { mount(); } catch (e) { /* optional */ } };

  const MESSAGES = {
    not_configured: 'AI checking is not switched on for this site yet. (The site owner needs to add an API key in Netlify.)',
    rate_limited: 'You have used AI checking a lot this hour. Please try again later.',
    too_short: 'Your answer is too short to assess.',
    upstream: 'The AI service is busy right now. Please try again in a minute.',
    network: 'Could not reach the AI service. Please try again.'
  };
  async function run(h) {
    if (busy.has(h.id)) return;
    busy.add(h.id); errors.delete(h.id); mount();
    try {
      const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload(h)) });
      let data = {};
      try { data = await r.json(); } catch (e) { data = {}; }
      if (!r.ok || !data.report) {
        errors.set(h.id, r.status === 404 ? MESSAGES.not_configured : (MESSAGES[data.error] || 'Something went wrong. Please try again.'));
      } else {
        h.ai = { at: Date.now(), model: data.model, report: data.report };
        persist();
        toast('AI feedback is ready.');
      }
    } catch (e) {
      errors.set(h.id, MESSAGES.network);
    }
    busy.delete(h.id);
    if (page === 'result' && resultId === h.id) { const y = window.scrollY; render(); window.scrollTo(0, y); }
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ai]');
    if (!b) return;
    const h = saved.history.find((x) => x.id === b.dataset.id);
    if (!h) return;
    if (b.dataset.ai === 'run') run(h);
    if (b.dataset.ai === 'apply') {
      const c = combined(h); if (!c) return;
      h.rating = Object.assign({}, c.crit);
      persist();
      const y = window.scrollY; render(); window.scrollTo(0, y);
      const band = B && B.sessionBand(h);
      toast(`${h.type === 'writing' ? 'Writing' : 'Speaking'} band set to ${fmt(band)} from AI feedback.`);
    }
  });

  window.BandoraAI = { payload, combined };
})();
