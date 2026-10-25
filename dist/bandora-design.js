/* Bandora — design prototype applied to the real app.
   Overview = the prototype's landing page, filled with the learner's real data.
   Results  = the prototype's score report (band ring, criteria, progress, next focus).
   Exam     = time bar + word-count bar like the prototype's test screens.
   Pricing plans: edit PLANS below. Payments are not connected; the chosen plan is saved to the profile. */
(function () {
  'use strict';
  if (typeof window.Bands === 'undefined') return;

  // ---------- EDIT ME: plans shown in the pricing section ----------
  const PLANS = [
    { id: 'starter', name: 'Starter', price: 'Free', per: '', features: ['All 10 full test tickets', 'Listening + Reading band estimates', 'Mistake notebook & progress'], cta: 'Start practising' },
    { id: 'pro', name: 'Pro', price: '[PRICE]', per: ' / month', badge: 'Most chosen', features: ['Everything in Starter', 'Writing & Speaking criteria reports', 'Band trend for every section', 'Priority access to new tickets'], cta: 'Choose Pro' },
    { id: 'intensive', name: 'Intensive', price: '[PRICE]', per: ' / 30 days', features: ['Everything in Pro', 'Teacher-marked essays (when available)', 'Live speaking sessions (when available)'], cta: 'Choose Intensive' }
  ];

  const B = window.Bands;
  const ORDER = ['listening', 'reading', 'writing', 'speaking'];
  const SAMPLE = { listening: 8, reading: 7.5, writing: 6.5, speaking: 7 };
  const C_RING = 2 * Math.PI * 56;
  let pathStep = 0;

  const fullDone = (setId) => saved.history.some((h) => h.setId === setId && !h.questionIds);
  function nextTicket() {
    return TestTickets.find((t) => ORDER.some((type) => !fullDone(t.sections[type]))) || TestTickets[0];
  }
  function nextSection(ticket) {
    const type = ORDER.find((t) => !fullDone(ticket.sections[t])) || 'listening';
    return { type, set: ticket.sections[type] };
  }
  const startAttrs = (type, set) => `data-type="${type}" data-set="${esc(set)}" data-mode="exam"`;

  function ring(band, opts) {
    const o = Object.assign({ size: 132, stroke: 12, light: true, label: 'OVERALL' }, opts || {});
    const r = 56, frac = band == null ? 0 : band / 9;
    return `<div class="bdx-ring" style="width:${o.size}px;height:${o.size}px" role="img" aria-label="${o.label} band ${B.fmtBand(band)} of 9">
      <svg viewBox="0 0 132 132" aria-hidden="true"><defs><linearGradient id="bdxG${o.size}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${o.light ? '#5B47F5' : '#8B7BFF'}"/><stop offset=".55" stop-color="${o.light ? '#B23BD6' : '#E07AD8'}"/><stop offset="1" stop-color="${o.light ? '#F0703A' : '#FF9A6B'}"/></linearGradient></defs>
      <circle cx="66" cy="66" r="${r}" fill="none" stroke="${o.light ? '#ECECF5' : 'rgba(255,255,255,.14)'}" stroke-width="${o.stroke}"/>
      <circle class="bdx-ring-arc" cx="66" cy="66" r="${r}" fill="none" stroke="url(#bdxG${o.size})" stroke-width="${o.stroke}" stroke-linecap="round" stroke-dasharray="${(C_RING * frac).toFixed(1)} ${C_RING.toFixed(1)}" transform="rotate(-90 66 66)"/></svg>
      <div class="bdx-ring-value"><strong class="bdx-count">${B.fmtBand(band)}</strong><span>${o.label}</span></div></div>`;
  }

  function sectionBars(bands, light) {
    return ORDER.map((type) => {
      const b = bands[type];
      const w = b == null ? 0 : Math.round((b / 9) * 100);
      const warm = b != null && b < 7;
      return `<div class="bdx-bar-row"><span>${names[type]}</span><span class="bdx-bar"><i style="width:${w}%" class="${warm ? 'warm' : ''}"></i></span><b>${B.fmtBand(b)}</b></div>`;
    }).join('');
  }

  function weakest(bandsReal) {
    const entries = ORDER.filter((t) => bandsReal[t]).map((t) => ({ type: t, band: bandsReal[t].band, session: bandsReal[t].session }));
    if (!entries.length) return null;
    entries.sort((a, b) => a.band - b.band);
    const w = entries[0];
    let crit = '';
    if (w.session.rating && B.CRITERIA[w.type]) {
      const c = B.CRITERIA[w.type].slice().sort((a, b) => w.session.rating[a.key] - w.session.rating[b.key])[0];
      crit = ' — ' + c.name;
    }
    return { type: w.type, text: names[w.type] + crit };
  }

  // ======================= OVERVIEW (landing) =======================
  function pathSteps() {
    const full = saved.history.filter((h) => !h.questionIds).length;
    const ticketsDone = TestTickets.filter((t) => ORDER.every((type) => fullDone(t.sections[type]))).length;
    return [
      ['Diagnose', 'Diagnostic mock', 'Sit one full ticket cold. Your report shows which section and which criterion cost you the most.', ['Full timed sections', 'Band per section', 'Weakest area flagged'], full >= 1, 'linear-gradient(135deg,#4B36E8,#8B3FE6)'],
      ['Fix', 'Fix the weakest skill', 'Targeted practice on the one area holding your band back, with explanations after every attempt.', ['Short exercises', 'Mistake notebook', 'Criteria self-review'], full >= 3, 'linear-gradient(135deg,#7A35D9,#C23BB8)'],
      ['Stamina', 'Build test stamina', 'Complete whole tickets so two hours and forty-five minutes stops feeling long.', ['Exam mode timers', 'All four sections', 'Results per section'], ticketsDone >= 1, 'linear-gradient(135deg,#B23BA6,#E0567A)'],
      ['Rehearse', 'Final dress rehearsal', 'A last full ticket in the week before your exam, compared with your first one.', ['Full ticket, exam mode', 'Band trend', 'Exam-date countdown'], ticketsDone >= 2, 'linear-gradient(135deg,#C2417A,#D9542E)']
    ];
  }
  function pathHTML() {
    const steps = pathSteps();
    return `<div class="bdx-path-head bdx-reveal"><div><span class="bdx-eyebrow">YOUR 4-WEEK PATH</span><h2 class="bdx-h2">From diagnostic to test day.</h2></div>
      <div class="bdx-path-controls"><span class="bdx-mono" aria-live="polite"><b>0${pathStep + 1}</b> / 04</span>
      <button type="button" class="bdx-round" data-bdx="step" data-dir="-1" aria-label="Previous step">${icon('arrow')}</button>
      <button type="button" class="bdx-round bdx-round--grad" data-bdx="step" data-dir="1" aria-label="Next step">${icon('arrow')}</button></div></div>
      <div class="bdx-slider bdx-reveal"><div class="bdx-track" style="transform:translateX(-${pathStep * 100}%)">${steps.map((s, i) => `
        <div class="bdx-slide" role="group" aria-roledescription="slide" aria-label="${i + 1} of 4: ${s[1]}">
          <div class="bdx-slide-copy"><span class="bdx-outline-num">0${i + 1}</span><h3>${s[1]}</h3><p>${s[2]}</p>${s[4] ? `<span class="bdx-chip bdx-chip--done">${icon('check')} Done</span>` : ''}</div>
          <div class="bdx-slide-panel" style="background:${s[5]}"><ul>${s[3].map((b) => `<li>${icon('check')}${b}</li>`).join('')}</ul></div>
        </div>`).join('')}</div></div>
      <div class="bdx-segs">${steps.map((s, i) => `<button type="button" data-bdx="go-step" data-step="${i}" aria-label="Go to step ${i + 1}: ${s[1]}" ${i === pathStep ? 'aria-current="step"' : ''}><span><i style="width:${i <= pathStep ? 100 : 0}%"></i></span><b>${s[0]}</b></button>`).join('')}</div>`;
  }

  function reportTitle(real) {
    const latest = ORDER.map((t) => real[t] && real[t].session).filter(Boolean).sort((a, b) => b.date - a.date)[0];
    const t = latest && TestTickets.find((x) => Object.values(x.sections).includes(latest.setId));
    const ids = new Set(ORDER.map((ty) => real[ty] && real[ty].session && real[ty].session.setId).filter(Boolean));
    const tickets = new Set([...ids].map((id) => (TestTickets.find((x) => Object.values(x.sections).includes(id)) || {}).title).filter(Boolean));
    return tickets.size > 1 ? 'Latest sections' : t ? t.title : 'Latest sections';
  }

  dashboard = function () {
    const real = B.latestBands(saved.history);
    const realOverall = B.overall(real);
    const sample = !realOverall;
    const bands = {};
    ORDER.forEach((t) => { bands[t] = sample ? SAMPLE[t] : (real[t] ? real[t].band : null); });
    const ov = sample ? 7.5 : realOverall.band;
    const weak = sample ? { text: 'Writing — Task Response' } : weakest(real);
    const ticket = nextTicket(), next = nextSection(ticket);
    const lastWriting = saved.history.find((h) => h.type === 'writing');
    const plan = saved.plan && saved.plan.id;
    const fullTicket = 30 + 60 + 60 + 14;

    return `<div class="bdx">
    <section class="bdx-hero">
      <div class="bdx-hero-copy">
        <span class="bdx-pill bdx-enter"><b>New</b>Band estimates for every section</span>
        <h1 class="bdx-enter">Know your band<br>before <span class="bdx-grad-text">test day.</span></h1>
        <p class="bdx-lede bdx-enter">Full-length IELTS Academic mock tests in an exam-real interface. Timed sections, instant Listening and Reading scores, and a clear breakdown of what’s holding your band back.</p>
        <div class="bdx-enter"><span class="bdx-q">Which test are you taking?</span>
          <div class="bdx-seg" role="group" aria-label="Test module"><button type="button" aria-pressed="true">Academic</button><button type="button" aria-pressed="false" data-bdx="general">General Training <small class="bdx-soon">soon</small></button></div></div>
        <div class="bdx-actions bdx-enter">
          <button class="bdx-btn bdx-btn--grad" data-action="intro" ${startAttrs(next.type, next.set)}>Start ${esc(ticket.title)} · ${names[next.type]} ${icon('arrow')}</button>
          <button class="bdx-btn bdx-btn--ghost" data-action="nav" data-page="tests">Choose a full ticket</button>
        </div>
        <div class="bdx-ticks bdx-enter"><span>${icon('check')} Free · no sign-up</span><span>${icon('check')} Computer-delivered format</span><span>${icon('check')} Answers saved as you go</span></div>
      </div>
      <div class="bdx-report-wrap">
        <div class="bdx-report">
          <div class="bdx-report-top"><div><span class="bdx-mini">${sample ? 'SAMPLE SCORE REPORT' : 'YOUR LATEST REPORT'}</span><strong>${sample ? 'Mock Test · Academic' : esc(reportTitle(real)) + ' · Academic'}</strong></div>
            ${sample ? '<span class="bdx-chip">Example</span>' : `<span class="bdx-chip bdx-chip--green">${realOverall.count}/4 sections</span>`}</div>
          <div class="bdx-report-mid">${ring(ov)}<p>${weak ? `Your weakest area is <strong>${esc(weak.text)}</strong>. Fix it first for the fastest gain.` : 'Finish a section to see your band.'}</p></div>
          <div class="bdx-bars">${sectionBars(bands, true)}</div>
          ${sample ? '<p class="bdx-note">Example only — take a section to see your own report.</p>' : '<button class="bdx-link" data-action="nav" data-page="progress">Open my progress →</button>'}
        </div>
        <div class="bdx-float bdx-float--a"><span>${icon('pen')}</span><div><b>${lastWriting ? 'Task 2 review ready' : 'Writing criteria review'}</b><small>Task · Coherence · Lexis · Grammar</small></div></div>
        <div class="bdx-float bdx-float--b">${icon('clock')}<span class="bdx-mono">${Math.floor(fullTicket / 60)}:${String(fullTicket % 60).padStart(2, '0')}:00</span></div>
      </div>
    </section>

    <div class="bdx-marquee" aria-hidden="true"><div class="bdx-marquee-track">${[0, 1].map(() => `<div><span>Listening</span><i></i><span class="o">Reading</span><i></i><span class="g">Writing</span><i></i><span class="o">Speaking</span><i></i><span>Band ${esc(saved.target || '7.5')}+</span><i></i></div>`).join('')}</div></div>

    <section class="bdx-strip">
      <div class="bdx-reveal"><b class="bdx-count">4</b> sections<small>Listening, Reading, Writing, Speaking</small></div>
      <div class="bdx-reveal"><b>2h 45m</b><small>Same timing as the real test</small></div>
      <div class="bdx-reveal"><b class="bdx-count">80</b> questions<small>Auto-scored in Listening + Reading</small></div>
      <div class="bdx-reveal"><b>Band 0–9</b><small>Half-band estimate per section</small></div>
    </section>

    <section class="bdx-sections">
      <div class="bdx-sec-head bdx-reveal"><div><span class="bdx-eyebrow">THE FULL EXAM, SECTION BY SECTION</span><h2 class="bdx-h2">Practise every section the way it’s really timed.</h2></div><p>Take a complete ticket in one sitting, or drill a single section when you only have an hour.</p></div>
      <div class="bdx-cards">${[
        ['listening', 'headphones', 'Four recordings, played once in exam mode. Conversations and monologues across everyday and academic contexts.', ['30 min', '40 questions'], 'violet'],
        ['reading', 'book', 'Three long passages from books, journals and magazines, written for a non-specialist reader.', ['60 min', '40 questions'], 'purple'],
        ['writing', 'pen', 'Task 1: describe a chart, table, process or plan. Task 2: a discursive essay.', ['60 min', '2 tasks'], 'magenta'],
        ['speaking', 'mic', 'Three parts: interview, a two-minute long turn from a cue card, and a two-way discussion.', ['11–14 min', '3 parts'], 'coral']
      ].map(([type, ic, text, tags, tone]) => `<button class="bdx-card bdx-card--${tone} bdx-reveal" data-action="intro" ${startAttrs(type, ticket.sections[type])}>
          <span class="bdx-card-ic">${icon(ic)}</span><span class="bdx-card-title">${names[type]}</span><span class="bdx-card-text">${text}</span>
          <span class="bdx-tags">${tags.map((t) => `<span>${t}</span>`).join('')}${real[type] ? `<span class="bdx-tag-band">Band ${B.fmtBand(real[type].band)}</span>` : ''}</span></button>`).join('')}</div>
    </section>

    <section class="bdx-how bdx-reveal"><div class="bdx-how-glow" aria-hidden="true"></div>
      <span class="bdx-eyebrow light">HOW IT WORKS</span><h2 class="bdx-h2">From first mock to target band, in three moves.</h2>
      <div class="bdx-how-grid">
        <div><span class="bdx-mono">01</span><h3>Pick your ticket</h3><p>Ten original Academic tickets. Full ticket or a single section.</p></div>
        <div><span class="bdx-mono">02</span><h3>Sit it under real conditions</h3><p>Strict timers, highlight and notes, flag for review, live word count.</p></div>
        <div><span class="bdx-mono">03</span><h3>Read your band breakdown</h3><p>Band per section and per criterion, with the next skill to work on.</p></div>
      </div>
    </section>

    <section class="bdx-path" id="bdx-path">${pathHTML()}</section>

    <section class="bdx-faq">
      <h2 class="bdx-h2 bdx-center bdx-reveal">Questions, answered</h2>
      <details class="bdx-reveal" open><summary>How accurate is the band score?</summary><p>Listening and Academic Reading use the widely published raw-score-to-band ranges, so a full 40-question section gives a close estimate. Writing and Speaking come from your own rating against the four criteria, with guidance for each level — treat them as a strong guide, not an official result.</p></details>
      <details class="bdx-reveal"><summary>Does it look like the computer-delivered test?</summary><p>Yes — split-screen passages, highlighting, notes, a question navigator, flag for review and a live word counter in Writing.</p></details>
      <details class="bdx-reveal"><summary>Can I pause a full mock?</summary><p>In exam mode the timer keeps running, just like test day. Practice mode lets you pause, take notes and work at your own pace.</p></details>
      <details class="bdx-reveal"><summary>Is my progress saved?</summary><p>Yes — your history, bands, ratings and notes are saved in this browser automatically. Use “Export results” on the Progress page to keep a copy or move it to another device.</p></details>
    </section>

    <section class="bdx-cta bdx-reveal"><h2>Your band, before it counts.</h2><p>Sit a full section tonight and know exactly where you stand by tomorrow.</p>
      <button class="bdx-btn bdx-btn--white" data-action="intro" ${startAttrs(next.type, next.set)}>Start ${names[next.type]} mock ${icon('arrow')}</button></section>

    <div class="bdx-wordmark" aria-hidden="true">bandora</div>
    <p class="bdx-disclaimer">IELTS is a registered trademark of its owners. Bandora is an independent practice platform and is not affiliated with or endorsed by them. Band figures are practice estimates.</p>
    </div>`;
  };

  // ======================= RESULTS =======================
  function speakingInsights(h) {
    const est = B.speakingEstimate(h);
    if (!est) return `<div class="bdx-insight bdx-insight--empty"><strong>No automatic insights for this session.</strong><p>Press <b>Record my response</b> (or <b>Start live analysis</b>) while you answer. Bandora transcribes your speech and estimates your band from pace, fillers, vocabulary, grammar range and clarity. Works in Chrome, Edge and Safari.</p></div>`;
    if (est.tooShort) return `<div class="bdx-insight bdx-insight--empty"><strong>Too short to estimate (${est.words} words recognised).</strong><p>Speak for at least a minute in total — Part 2 alone should be about two minutes.</p></div>`;
    const crit = B.CRITERIA.speaking;
    return `<div class="bdx-insight"><div class="bdx-insight-head"><div><span class="bdx-mini">AUTOMATIC ESTIMATE · APPROXIMATE</span><strong>Speaking level ≈ Band ${B.fmtBand(est.overall)}</strong></div>
        <div class="bdx-stats"><span><b>${est.wpm}</b> words/min</span><span><b>${est.words}</b> words</span><span><b>${est.fillers}</b> fillers</span><span><b>${est.pauses}</b> long pauses</span></div></div>
      ${crit.map((c) => { const v = est.crit[c.key]; return `<div class="bdx-crit"><div class="bdx-crit-head"><strong>${c.name}</strong><b class="bdx-mono">${v == null ? '—' : v + '.0'}</b></div><span class="bdx-bar bdx-bar--lg"><i class="${v != null && v < 7 ? 'warm' : ''}" style="width:${v == null ? 0 : (v / 9) * 100}%"></i></span><p class="bdx-guide">${esc(est.tips[c.key])}</p></div>`; }).join('')}
      <details class="bdx-transcript"><summary>What Bandora heard</summary>${est.data.parts.map((p) => `<p><b>Part ${p.i + 1}:</b> ${esc(p.text)}</p>`).join('')}</details>
      <p class="bdx-note">Estimated from speech recognition — a guide, not an examiner score. Rate yourself below to override it.</p></div>`;
  }

  function ratingForm(h) {
    const crit = B.CRITERIA[h.type];
    const checks = h.type === 'writing' ? dataFor(h.type, h).tasks.map((t) => ({ t, list: B.writingChecks(h.answers[t.id], t.minWords) })) : [];
    return `${h.type === 'speaking' ? speakingInsights(h) + '<h3 class="bdx-subhead">Your own rating (optional)</h3>' : ''}<div class="bdx-rate"><p class="bdx-muted">Rate your ${h.type === 'writing' ? 'essays' : 'answers'} honestly against each criterion. Your band is the average, rounded like the real test.</p>
      ${crit.map((c) => {
        const v = h.rating && h.rating[c.key];
        const g = v ? c.guide[Math.max(5, Math.min(8, v))] : 'Pick the level that fits best.';
        const auto = checks.map((x) => { const k = x.list.find((y) => y.c === c.key); return `<span class="bdx-auto ${k.ok ? 'ok' : 'warn'}" title="${esc(k.tip)}">${esc(x.t.title)}: ${esc(k.label)}</span>`; }).join('');
        return `<div class="bdx-crit"><div class="bdx-crit-head"><strong>${c.name}</strong><b class="bdx-mono">${v ? v + '.0' : '—'}</b></div>
          <div class="bdx-levels" role="radiogroup" aria-label="${c.name}">${[3, 4, 5, 6, 7, 8, 9].map((n) => `<button type="button" role="radio" aria-checked="${v === n}" data-bdx="rate" data-id="${h.id}" data-c="${c.key}" data-v="${n}">${n}</button>`).join('')}</div>
          <p class="bdx-guide">${esc(g)}</p>${auto ? `<div class="bdx-autos">${auto}</div>` : ''}</div>`;
      }).join('')}</div>`;
  }

  function typeBreakdown(h) {
    const rows = {};
    for (const q of questionsFor(h.type, h)) {
      const k = window.IELTSFormats ? IELTSFormats.typeLabel(q) : q.type === 'tfng' ? 'True / False / Not given' : q.options ? 'Multiple choice' : 'Short answers';
      rows[k] = rows[k] || { ok: 0, n: 0 };
      rows[k].n++; if (isCorrect(q, h.answers[q.id])) rows[k].ok++;
    }
    return `<div class="bdx-crits">${Object.entries(rows).map(([k, r]) => {
      const pct = Math.round((r.ok / r.n) * 100);
      return `<div class="bdx-crit"><div class="bdx-crit-head"><strong>${k}</strong><b class="bdx-mono">${r.ok}/${r.n}</b></div><span class="bdx-bar bdx-bar--lg"><i class="${pct < 70 ? 'warm' : ''}" style="width:${pct}%"></i></span><p class="bdx-guide">${pct >= 80 ? 'Strong — keep it up.' : pct >= 60 ? 'Solid, with a few slips to review.' : 'Your biggest gain is here. Review the explanations below.'}</p></div>`;
    }).join('')}</div>`;
  }

  function bandChart(type) {
    const pts = saved.history.filter((x) => x.type === type && B.sessionBand(x) != null).slice(0, 6).reverse();
    if (!pts.length) return '<p class="bdx-muted">Your band trend appears after your first full section.</p>';
    const target = Number(saved.target) || 7.5;
    return `<div class="bdx-chart" role="img" aria-label="${names[type]} band by session: ${pts.map((p) => B.fmtBand(B.sessionBand(p))).join(', ')}. Target ${target}.">
      <div class="bdx-target" style="bottom:${(target / 9) * 100}%"><span>Target ${target.toFixed(1)}</span></div>
      ${pts.map((p, i) => { const b = B.sessionBand(p); return `<div class="bdx-col"><span>${B.fmtBand(b)}</span><i class="${i === pts.length - 1 ? 'last' : ''}" style="height:${(b / 9) * 100}%"></i><small>${new Date(p.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</small></div>`; }).join('')}</div>`;
  }

  const originalResult = renderResult;
  renderResult = function () {
    originalResult();
    const h = saved.history.find((x) => x.id === resultId);
    const main = $('#main'), hero = $('.result-hero');
    if (!h || !main || !hero) return;
    const band = B.sessionBand(h);
    const prev = saved.history.find((x) => x.type === h.type && x.id !== h.id && x.date < h.date && B.sessionBand(x) != null);
    const diff = band != null && prev ? band - B.sessionBand(prev) : null;
    const real = B.latestBands(saved.history);
    const tiles = ORDER.map((t) => ({ t, b: real[t] ? real[t].band : null, raw: real[t] && real[t].session.total ? real[t].session.score + ' / 40' : real[t] ? 'self-rated' : 'not yet' }));
    const actions = hero.querySelector('.row') ? hero.querySelector('.row').outerHTML : '';
    const title = band == null ? (h.total ? `${h.score} of ${h.total} correct.` : h.type === 'speaking' ? 'Record your answers to get a band.' : 'Rate your work to get a band.') : band >= 7 ? `Band ${B.fmtBand(band)} — strong work.` : band >= 6 ? `Band ${B.fmtBand(band)} — solid progress.` : `Band ${B.fmtBand(band)} — a clear place to start.`;
    const over = document.createElement('section');
    over.className = 'bdx-res-hero';
    over.innerHTML = `<div class="bdx-res-glow" aria-hidden="true"></div>
      <div class="bdx-res-main">${ring(band, { size: 180, stroke: 14, light: false, label: names[h.type].toUpperCase() })}
        <div><span class="bdx-mini light">${esc(dataFor(h.type, h).title).toUpperCase()}</span><h1>${title}</h1>
        ${diff != null && diff !== 0 ? `<span class="bdx-delta ${diff > 0 ? 'up' : 'down'}">${diff > 0 ? '+' : ''}${diff.toFixed(1)} since last ${names[h.type]}</span>` : ''}
        <p>${h.total ? `${h.score}/${h.total} correct · ${Math.round(h.score / h.total * 100)}%` : 'Self-review'} · ${Math.max(1, Math.round(h.spent / 60))} min${h.questionIds ? ' · Short exercise (no band for partial sections)' : ''}</p>${actions}</div></div>
      <div class="bdx-res-tiles">${tiles.map((x) => `<div><div><b>${names[x.t]}</b><small>${x.raw}</small></div><strong>${B.fmtBand(x.b)}</strong><span class="bdx-bar bdx-bar--dark"><i style="width:${x.b == null ? 0 : (x.b / 9) * 100}%"></i></span></div>`).join('')}</div>`;
    hero.replaceWith(over);
    main.prepend(over);

    const grid = document.createElement('div');
    grid.className = 'bdx-res-grid';
    const isProductive = h.type === 'writing' || h.type === 'speaking';
    grid.innerHTML = `<section class="bdx-panel bdx-reveal"><div class="bdx-panel-head"><h2>${isProductive ? (h.type === 'speaking' ? 'Speaking insights' : 'Criteria breakdown') : 'Question types'}</h2>${isProductive ? `<span class="bdx-chip">${h.type === 'speaking' && !(h.rating && Object.keys(h.rating).length === 4) ? 'Auto estimate' : 'Self-rated'}</span>` : ''}</div>${isProductive ? ratingForm(h) : typeBreakdown(h)}</section>
      <section class="bdx-panel bdx-reveal"><div class="bdx-panel-head"><h2>Your ${names[h.type]} progress</h2><span class="bdx-muted">Band per session</span></div>${bandChart(h.type)}</section>`;
    over.after(grid);

    const weak = weakest(real);
    const ticket = TestTickets.find((t) => Object.values(t.sections).includes(h.setId)) || nextTicket();
    const nx = nextSection(ticket);
    const focus = document.createElement('section');
    focus.className = 'bdx-focus';
    focus.innerHTML = `<h2 class="bdx-h3">Your next focus</h2><div class="bdx-focus-grid">
      <article class="bdx-focus-card bdx-focus-card--grad bdx-reveal"><div><span class="bdx-chip bdx-chip--grad">Biggest gain</span><h3>${weak ? esc(weak.text) : names[h.type]}</h3><p>${weak ? 'Your lowest band right now. A focused session here moves your overall band fastest.' : 'Finish more sections to find your weakest area.'}</p>
        <button class="bdx-link" data-action="intro" ${startAttrs(weak ? weak.type : h.type, ticket.sections[weak ? weak.type : h.type])}>Practise ${names[weak ? weak.type : h.type]} →</button></div></article>
      <article class="bdx-focus-card bdx-reveal"><span class="bdx-chip">Next section</span><h3>${names[nx.type]} · ${esc(ticket.title)}</h3><p>Keep the ticket going while today’s practice is fresh.</p><button class="bdx-link" data-action="intro" ${startAttrs(nx.type, nx.set)}>Start ${names[nx.type]} →</button></article>
      <article class="bdx-focus-card bdx-reveal"><span class="bdx-chip bdx-chip--warm">Review</span><h3>Mistake notebook</h3><p>Every wrong answer is saved with its explanation, so you can revisit it before test day.</p><button class="bdx-link" data-action="nav" data-page="notebook">Open notebook →</button></article></div>`;
    grid.after(focus);
  };

  // ======================= PROGRESS: estimated band card =======================
  const originalProgress = progressPage;
  progressPage = function () {
    const html = originalProgress();
    const ov = B.overall(B.latestBands(saved.history));
    const card = `<article class="card bdx-progress-band"><span>${icon('target')}</span><small>Estimated overall band</small><strong>${ov ? B.fmtBand(ov.band) : '—'}</strong>${ov ? `<em>${ov.count}/4 sections</em>` : ''}</article>`;
    const n = saved.history.length;
    const reset = `<section class="card bdx-reset"><div><h3>Reset results</h3><p>${n ? `Delete ${n === 1 ? 'your saved session' : `all ${n} saved sessions`}, band estimates and mistake notebook entries on this device. Your target band stays the same.` : 'You have no saved results yet.'}</p></div><button type="button" class="btn bdx-reset-btn" data-bdx="reset-ask" ${n ? '' : 'disabled'}>Reset results</button></section>`;
    return html.replace('<div class="progress-stats">', '<div class="progress-stats bdx-progress-stats">' + card) + reset;
  };

  // ======================= EXAM: time bar + word-count bar =======================
  setInterval(() => {
    if (typeof active === 'undefined' || !active || page !== 'exam') return;
    const timer = $('.exam-top .timer');
    if (timer) {
      let bar = timer.querySelector('.bdx-timebar');
      if (!bar) { bar = document.createElement('span'); bar.className = 'bdx-timebar'; bar.setAttribute('aria-hidden', 'true'); bar.innerHTML = '<i></i>'; timer.appendChild(bar); }
      const total = active.duration || dataFor(active.type).duration || 1;
      bar.firstChild.style.width = Math.max(0, Math.min(100, (remaining() / total) * 100)) + '%';
    }
    const wc = $('.word-count');
    if (wc) {
      const nums = wc.textContent.match(/\d+/g);
      if (nums && nums.length >= 2) {
        const n = Number(nums[0]), min = Number(nums[nums.length - 1]);
        let bar = wc.querySelector('.bdx-wcbar');
        if (!bar) { bar = document.createElement('span'); bar.className = 'bdx-wcbar'; bar.setAttribute('aria-hidden', 'true'); bar.innerHTML = '<i></i>'; wc.appendChild(bar); }
        bar.firstChild.style.width = Math.min(100, (n / min) * 100) + '%';
        wc.classList.toggle('bdx-wc-ok', n >= min);
      }
    }
  }, 500);

  // ======================= interactions =======================
  function rerenderPath() { const el = $('#bdx-path'); if (el) el.innerHTML = pathHTML(); }
  function choosePlan(id) {
    saved.plan = { id, date: Date.now() };
    persist(); closeModal(); render();
    toast(id === 'starter' ? 'You’re on Starter.' : `${PLANS.find((p) => p.id === id).name} saved as your plan.`);
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-bdx]');
    if (!b) return;
    const kind = b.dataset.bdx;
    if (kind === 'reset-ask') {
      const n = saved.history.length;
      modal('Reset all results?', `<p>This permanently deletes <b>${n} saved session${n === 1 ? '' : 's'}</b>, your band estimates and your mistake notebook on this device. It cannot be undone.</p><p class="small muted">Tip: use “Save results” on a result page first if you want a copy.</p>`, `${button('Keep my results', 'close', 'secondary')}<button type="button" class="btn bdx-reset-btn" data-bdx="reset-confirm">Yes, reset everything</button>`);
      return;
    }
    if (kind === 'reset-confirm') {
      saved.history = [];
      if (!active) saved.active = null;
      persist();
      closeModal();
      if (typeof resultId !== 'undefined') resultId = null;
      render();
      toast('All results have been reset. Fresh start!');
      return;
    }
    if (kind === 'step') { pathStep = (pathStep + Number(b.dataset.dir) + 4) % 4; rerenderPath(); }
    else if (kind === 'go-step') { pathStep = Number(b.dataset.step); rerenderPath(); }
    else if (kind === 'general') { toast('General Training tickets are coming soon. All current tickets are Academic.'); }
    else if (kind === 'plan') {
      const p = PLANS.find((x) => x.id === b.dataset.plan);
      if (p.id === 'starter') { choosePlan('starter'); go('tests'); return; }
      modal(`Choose ${esc(p.name)}`, `<p>Online payment isn’t connected yet, so nothing will be charged. We’ll save <strong>${esc(p.name)}</strong> as your chosen plan${currentUser() ? ' on your account' : ' in this browser'}.</p>`,
        `${button('Not now', 'close', 'secondary')}<button class="btn primary" data-bdx="plan-confirm" data-plan="${p.id}">Save ${esc(p.name)}</button>`);
    }
    else if (kind === 'plan-confirm') { choosePlan(b.dataset.plan); }
    else if (kind === 'rate') {
      const h = saved.history.find((x) => x.id === b.dataset.id);
      if (!h) return;
      const wasComplete = !!h.rating && Object.keys(h.rating).length === 4;
      h.rating = Object.assign({}, h.rating, { [b.dataset.c]: Number(b.dataset.v) });
      persist();
      const y = window.scrollY; render(); window.scrollTo(0, y);
      const done = B.sessionBand(h);
      if (done != null && Object.keys(h.rating).length === 4 && !wasComplete) toast(`${names[h.type]} band: ${B.fmtBand(done)}`);
    }
  });

  // Accounts switched off (site-config.js): never show the login screen.
  const accountsOff = () => !(window.BANDORA_CONFIG && window.BANDORA_CONFIG.accounts);
  if (typeof go === 'function') {
    const originalGo = go;
    go = function (p) { return originalGo(p === 'auth' && accountsOff() ? 'overview' : p); };
  }
  if (typeof render === 'function') {
    const originalRender = render;
    render = function () { if (page === 'auth' && accountsOff()) page = 'overview'; return originalRender(); };
  }

  // Boot can finish (guest / no auth config) before the design scripts load, which left the
  // old sidebar layout on screen after a refresh. Re-render once now that every override exists.
  try {
    if (typeof document.getElementById === 'function' && document.getElementById('app') &&
        typeof booting !== 'undefined' && !booting && page !== 'exam') render();
  } catch (e) { /* first render will happen when boot completes */ }
})();
