/* Bandora · IELTS question formats
   Renders Cambridge-style question groups: form / note / summary completion with inline gaps,
   plan & map labelling, matching, choose TWO letters, matching headings, matching information,
   summary completion from a word box, True/False/Not given and Yes/No/Not given.
   Content lives in ielts-content.js as `groups` on each listening part / reading passage. */
(function () {
  'use strict';
  if (typeof questionHTML !== 'function' || typeof examBody !== 'function') return;

  const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii'];
  const LABELS = {
    tfng: 'True / False / Not given', ynng: 'Yes / No / Not given', mcq: 'Multiple choice', multi: 'Choose TWO answers',
    text: 'Completion (notes, forms, sentences)', map: 'Plan / map labelling', match: 'Matching', headings: 'Matching headings',
    matchinfo: 'Matching information', wordbox: 'Summary from a word box', endings: 'Sentence endings'
  };
  const LETTER_TYPES = ['map', 'match', 'headings', 'matchinfo', 'wordbox', 'endings', 'multi'];
  function typeLabel(q) { return LABELS[q.type] || (q.options ? LABELS.mcq : LABELS.text); }

  // ---------- data lookup ----------
  function unitsOf(d) { return d ? (d.passages || d.parts || []) : []; }
  function groupFor(q, d) {
    for (const u of unitsOf(d)) for (const g of (u.groups || [])) if (q.id >= g.from && q.id <= g.to) return { g, unit: u };
    return null;
  }
  function questionsIn(unit, g) {
    return unit.questions.filter((q) => q.id >= g.from && q.id <= g.to && (!active.questionIds || active.questionIds.includes(q.id)));
  }
  function optionText(g, key) { const o = (g.options || []).find((x) => x[0] === key); return o ? o[1] : ''; }

  // ---------- small renderers ----------
  const val = (id) => String(active.answers[id] || '');
  function flag(q) {
    return `<button class="flag ${active.flags.includes(q.id) ? 'flagged' : ''}" data-action="flag" data-question="${q.id}" aria-label="Flag question ${q.id}" aria-pressed="${active.flags.includes(q.id)}">${icon('flag')}</button>`;
  }
  function gapInput(q, wide) {
    const v = val(q.id);
    return `<span class="qf-gap" id="question-${q.id}"><b class="qf-n">${q.id}</b><input class="qf-input${wide ? ' qf-input--wide' : ''}" data-answer="${q.id}" value="${esc(v)}" autocomplete="off" spellcheck="false" aria-label="Question ${q.id}"></span>`;
  }
  function gapSelect(q, g) {
    const v = val(q.id);
    const keys = (g.options || []).map((o) => o[0]);
    return `<span class="qf-gap" id="question-${q.id}"><b class="qf-n">${q.id}</b><select class="qf-select" data-answer="${q.id}" aria-label="Question ${q.id}"><option value="">—</option>${keys.map((k) => `<option value="${esc(k)}" ${v === k ? 'selected' : ''}>${esc(k)}</option>`).join('')}</select></span>`;
  }
  function inline(q, g, wide) {
    const gap = g && g.kind === 'wordbox' ? gapSelect(q, g) : gapInput(q, wide);
    const parts = String(q.prompt).split(/_{3,}/);
    if (parts.length < 2) return `${esc(q.prompt)} ${gap}`;
    return esc(parts[0]) + gap + esc(parts.slice(1).join('______'));
  }
  function box(g, title) {
    if (!g.options || !g.options.length || g.noBox || g.kind === 'map' || g.kind === 'multi') return '';
    return `<div class="qf-box">${title ? `<div class="qf-box-title">${esc(title)}</div>` : ''}<dl>${g.options.map(([k, t]) => `<div><dt>${esc(k)}</dt><dd>${esc(t)}</dd></div>`).join('')}</dl></div>`;
  }

  function groupBody(g, unit) {
    const qs = questionsIn(unit, g);
    if (!qs.length) return '';
    const k = g.kind;
    if (k === 'notes' || k === 'form' || k === 'table') {
      const head = g.heading ? `<div class="qf-notes-title">${esc(g.heading)}</div>` : '';
      return `<div class="qf-notes qf-notes--${k}">${head}${qs.map((q) => {
        const sub = g.sub && g.sub[q.id] ? `<div class="qf-sub">${esc(g.sub[q.id])}</div>` : '';
        return `${sub}<div class="qf-line">${inline(q, g)}</div>`;
      }).join('')}</div>`;
    }
    if (k === 'summary' || k === 'wordbox') {
      const head = g.heading ? `<div class="qf-notes-title">${esc(g.heading)}</div>` : '';
      return `${k === 'wordbox' ? box(g) : ''}<div class="qf-summary">${head}<p>${qs.map((q) => inline(q, g)).join(' ')}</p></div>`;
    }
    if (k === 'sentences' || k === 'short') {
      return `<div class="qf-sentences">${qs.map((q) => `<div class="qf-line">${inline(q, g, true)}</div>`).join('')}</div>`;
    }
    if (k === 'tfng' || k === 'ynng') {
      const opts = k === 'tfng' ? [['TRUE', 'True'], ['FALSE', 'False'], ['NOT GIVEN', 'Not given']] : [['YES', 'Yes'], ['NO', 'No'], ['NOT GIVEN', 'Not given']];
      const key = k === 'tfng'
        ? '<div class="qf-key"><span><b>TRUE</b> if the statement agrees with the information</span><span><b>FALSE</b> if the statement contradicts the information</span><span><b>NOT GIVEN</b> if there is no information on this</span></div>'
        : '<div class="qf-key"><span><b>YES</b> if the statement agrees with the claims of the writer</span><span><b>NO</b> if the statement contradicts the claims of the writer</span><span><b>NOT GIVEN</b> if it is impossible to say what the writer thinks about this</span></div>';
      return key + qs.map((q) => `<div class="question qf-row" id="question-${q.id}"><div class="question-title"><span class="q-number">${q.id}</span><p id="label-${q.id}">${esc(q.prompt)}</p>${flag(q)}</div><div class="qf-pills" role="radiogroup" aria-labelledby="label-${q.id}">${opts.map(([lab, v]) => `<label class="qf-pill"><input type="radio" name="q${q.id}" data-answer="${q.id}" value="${v}" ${val(q.id) === v ? 'checked' : ''}><span>${lab}</span></label>`).join('')}</div></div>`).join('');
    }
    if (k === 'mcq') {
      return qs.map((q) => `<div class="question qf-row" id="question-${q.id}"><div class="question-title"><span class="q-number">${q.id}</span><p id="label-${q.id}">${esc(q.prompt)}</p>${flag(q)}</div><div class="options qf-abc" role="radiogroup" aria-labelledby="label-${q.id}">${q.options.map((o, i) => `<label class="option"><input type="radio" name="q${q.id}" data-answer="${q.id}" value="${esc(o)}" ${val(q.id) === o ? 'checked' : ''}><b class="qf-letter">${'ABCDEFG'[i]}</b>${esc(o)}</label>`).join('')}</div></div>`).join('');
    }
    if (k === 'multi') {
      const chosen = qs.map((q) => val(q.id)).filter(Boolean);
      const n = qs.length;
      return `<div class="question qf-row" id="question-${qs[0].id}"><div class="question-title"><span class="q-number">${qs[0].id}–${qs[n - 1].id}</span><p>${esc(g.prompt || qs[0].prompt)}</p>${flag(qs[0])}</div>${qs.slice(1).map((q) => `<span id="question-${q.id}"></span>`).join('')}<div class="options qf-abc" data-multi="${g.from}" data-max="${n}">${g.options.map(([key, t]) => `<label class="option"><input type="checkbox" data-multi-opt="${g.from}" value="${esc(key)}" ${chosen.includes(key) ? 'checked' : ''}><b class="qf-letter">${esc(key)}</b>${esc(t)}</label>`).join('')}</div><p class="small muted qf-count" data-multi-count="${g.from}">${chosen.length} of ${n} chosen</p></div>`;
    }
    // letter-select kinds: map, match, headings, matchinfo, endings
    const art = k === 'map' && g.svg ? `<figure class="qf-map">${g.svg}</figure>` : '';
    const listTitle = g.boxTitle || (k === 'headings' ? 'List of Headings' : k === 'endings' ? '' : '');
    return `${art}${box(g, listTitle)}<div class="qf-select-list">${qs.map((q) => `<div class="qf-select-row" id="question-${q.id}"><span class="q-number">${q.id}</span><span class="qf-select-prompt">${esc(q.prompt)}</span><select class="qf-select" data-answer="${q.id}" aria-label="Question ${q.id}: ${esc(q.prompt)}"><option value="">—</option>${(g.options || []).map(([key]) => `<option value="${esc(key)}" ${val(q.id) === key ? 'selected' : ''}>${esc(key)}</option>`).join('')}</select>${flag(q)}</div>`).join('')}</div>`;
  }

  function groupHTML(g, unit) {
    const qs = questionsIn(unit, g);
    if (!qs.length) return '';
    const range = qs.length > 1 ? `Questions ${qs[0].id}–${qs[qs.length - 1].id}` : `Question ${qs[0].id}`;
    return `<section class="qf-group qf-group--${g.kind}"><h3 class="qf-range">${range}</h3>${g.instruction ? `<p class="qf-instruction">${g.instruction}</p>` : ''}${groupBody(g, unit)}</section>`;
  }

  // ---------- hook into the exam renderer ----------
  const baseQuestionHTML = questionHTML;
  let rendered = new Set();
  questionHTML = function (q) {
    if (typeof active === 'undefined' || !active) return baseQuestionHTML(q);
    const d = dataFor(active.type);
    const hit = groupFor(q, d);
    if (!hit) return baseQuestionHTML(q);
    const key = hit.g.from + ':' + hit.g.to;
    if (rendered.has(key)) return '';
    rendered.add(key);
    return groupHTML(hit.g, hit.unit);
  };
  const baseExamBody = examBody;
  examBody = function () {
    rendered = new Set();
    let html = baseExamBody();
    if (active && active.type === 'reading') {
      const p = dataFor('reading').passages[active.part];
      if (p && p.lettered) {
        p.paragraphs.forEach((t, i) => {
          html = html.replace(`<p>${esc(t)}</p>`, `<p class="qf-para"><b class="qf-para-letter">${'ABCDEFGHIJ'[i]}</b>${esc(t.replace(/^[A-J]\.\s+/, ''))}</p>`);
        });
      }
    }
    return html;
  };

  // ---------- choose-TWO checkboxes ----------
  document.addEventListener('change', (e) => {
    const box = e.target.closest && e.target.closest('[data-multi]');
    if (!box || !active) return;
    const from = +box.dataset.multi, max = +box.dataset.max;
    const checked = [...box.querySelectorAll('input[type=checkbox]:checked')];
    if (checked.length > max) { e.target.checked = false; toast(`Choose ${max === 2 ? 'TWO' : max} answers only.`); return; }
    const letters = checked.map((c) => c.value).sort();
    for (let i = 0; i < max; i++) {
      const id = from + i;
      active.answers[id] = letters[i] || '';
      const nav = document.querySelector(`.question-nav [data-question="${id}"]`);
      if (nav) nav.classList.toggle('answered', !!letters[i]);
    }
    persist();
    const c = document.querySelector(`[data-multi-count="${from}"]`); if (c) c.textContent = `${letters.length} of ${max} chosen`;
    const ac = document.getElementById('answered-count'); if (ac) ac.textContent = Object.values(active.answers).filter((v) => String(v).trim()).length;
  });

  // ---------- results: show what a letter means ----------
  function describe(q, h, a) {
    if (!a) return a;
    const d = dataFor(h.type, h);
    const hit = groupFor(q, d);
    if (!hit || !LETTER_TYPES.includes(hit.g.kind)) return a;
    const t = optionText(hit.g, a);
    return t ? `${a} — ${t}` : a;
  }
  const baseResult = renderResult;
  renderResult = function () {
    baseResult.apply(this, arguments);
    try {
      const h = saved.history.find((x) => x.id === resultId);
      if (!h || !h.total) return;
      const qs = questionsFor(h.type, h);
      const items = document.querySelectorAll('.review-item');
      items.forEach((el, i) => {
        const q = qs[i]; if (!q) return;
        const hit = groupFor(q, dataFor(h.type, h));
        if (!hit) return;
        const tag = document.createElement('span'); tag.className = 'qf-review-type'; tag.textContent = typeLabel(q);
        el.querySelector('.row')?.appendChild(tag);
        if (!LETTER_TYPES.includes(hit.g.kind)) return;
        const strongs = el.querySelectorAll('.small strong');
        if (strongs[0]) strongs[0].textContent = describe(q, h, h.answers[q.id]) || '—';
        if (strongs[1]) strongs[1].textContent = describe(q, h, q.answer);
      });
    } catch (err) { /* review extras are optional */ }
  };

  window.IELTSFormats = { typeLabel, LABELS, ROMAN };
})();
