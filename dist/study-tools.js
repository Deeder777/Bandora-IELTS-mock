/* Bandora · study plan, streaks, "Practise my mistakes" and short skill drills.
   Everything is stored in the same browser save as the rest of the app (saved.examDate). */
(function () {
  'use strict';
  if (typeof dashboard !== 'function' || typeof progressPage !== 'function' || !window.TestTickets) return;
  const DAY = 864e5;
  const NAMES = { listening: 'Listening', reading: 'Reading', writing: 'Writing', speaking: 'Speaking' };
  const dayKey = (t) => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const today = () => dayKey(Date.now());
  const ticketOf = (setId) => TestTickets.find((t) => Object.values(t.sections).includes(setId));
  const setTitle = (h) => { const t = ticketOf(h.setId); return (t ? 'Ticket ' + t.number : dataFor(h.type, h).title); };

  // ---------------- drills ----------------
  const DRILLS = [
    { id: 'l-map', type: 'listening', label: 'Map & plan labelling', unit: 1, pick: (q) => q.type === 'map', minutes: 10, icon: 'headphones', note: 'Part 2 · 5 questions' },
    { id: 'l-form', type: 'listening', label: 'Form completion', unit: 0, pick: (q) => q.type === 'text', minutes: 10, icon: 'headphones', note: 'Part 1 · 10 questions' },
    { id: 'l-match', type: 'listening', label: 'Matching & choose TWO', unit: 2, pick: (q) => q.type === 'match' || q.type === 'multi', minutes: 10, icon: 'headphones', note: 'Part 3 · 4 questions' },
    { id: 'r-headings', type: 'reading', label: 'Matching headings', unit: 1, pick: (q) => q.type === 'headings', minutes: 15, icon: 'book', note: 'Passage 2 · 7–8 questions' },
    { id: 'r-tfng', type: 'reading', label: 'True / False / Not given', unit: 0, pick: (q) => q.type === 'tfng', minutes: 10, icon: 'book', note: 'Passage 1 · 4–5 questions' },
    { id: 'r-ynng', type: 'reading', label: 'Yes / No / Not given', unit: 2, pick: (q) => q.type === 'ynng', minutes: 12, icon: 'book', note: 'Passage 3 · 5–6 questions' },
    { id: 'r-matchinfo', type: 'reading', label: 'Matching information', unit: 2, pick: (q) => q.type === 'matchinfo', minutes: 10, icon: 'book', note: 'Passage 3 · 4–5 questions' },
    { id: 'r-wordbox', type: 'reading', label: 'Summary from a word box', unit: 1, pick: (q) => q.type === 'wordbox', minutes: 10, icon: 'book', note: 'Passage 2 · 4–5 questions' }
  ];
  const TYPE_OF_DRILL = { map: 'l-map', match: 'l-match', multi: 'l-match', headings: 'r-headings', tfng: 'r-tfng', ynng: 'r-ynng', matchinfo: 'r-matchinfo', wordbox: 'r-wordbox' };
  function drillIds(drill, setId) {
    const d = TestLibrary.get(drill.type, setId).data;
    const unit = (d.passages || d.parts)[drill.unit];
    return unit ? unit.questions.filter(drill.pick).map((q) => q.id) : [];
  }
  function drillSet(drill) {
    // the ticket where this drill was done least recently (never first)
    const last = {};
    saved.history.forEach((h) => { if (h.drill === drill.id && !(h.setId in last)) last[h.setId] = h.date; });
    const sets = TestTickets.map((t) => t.sections[drill.type]).filter((id) => drillIds(drill, id).length);
    sets.sort((a, b) => (last[a] || 0) - (last[b] || 0));
    return sets[0];
  }
  function startFocused(type, setId, ids, minutes, label, drillId) {
    if (!ids.length) return;
    const prev = window.selectedPracticeMode;
    window.selectedPracticeMode = 'practice';
    start(type, setId);
    window.selectedPracticeMode = prev;
    const d = dataFor(type);
    const units = d.passages || d.parts || [];
    const part = Math.max(0, units.findIndex((u) => u.questions.some((q) => q.id === ids[0])));
    Object.assign(active, { questionIds: ids.slice().sort((a, b) => a - b), part, duration: minutes * 60, remaining: minutes * 60, deadline: Date.now() + minutes * 60000, focusLabel: label, drill: drillId || null });
    persist(); render(); window.scrollTo(0, 0);
  }
  function startDrill(id) {
    const drill = DRILLS.find((x) => x.id === id); if (!drill) return;
    const setId = drillSet(drill); if (!setId) return;
    startFocused(drill.type, setId, drillIds(drill, setId), drill.minutes, drill.label, drill.id);
  }

  // keep the drill id on the saved result so the next drill picks another ticket
  const baseSubmit = submit;
  submit = function () {
    const drill = active && active.drill, label = active && active.focusLabel;
    baseSubmit.apply(this, arguments);
    const h = saved.history[0];
    if (h && (drill || label)) { if (drill) h.drill = drill; if (label) h.focusLabel = label; persist(); }
  };

  // In a focused session, hide parts/passages that have no questions and show a banner.
  const baseExam = examBody;
  examBody = function () {
    let html = baseExam();
    if (!active || !active.questionIds || !(active.type === 'reading' || active.type === 'listening')) return html;
    const d = dataFor(active.type), units = d.passages || d.parts || [];
    units.forEach((u, i) => {
      if (u.questions.some((q) => active.questionIds.includes(q.id))) return;
      html = html.replace(new RegExp(`<button class="[^"]*" data-action="part" data-part="${i}"[\\s\\S]*?</button>`, 'g'), '');
    });
    const ids = active.questionIds;
    const note = active.type === 'listening' ? ' Play the whole part, but answer only these questions.' : '';
    return `<div class="st-focus-banner"><b>${esc(active.focusLabel || 'Focused practice')}</b><span>Questions ${ids.length > 1 ? ids[0] + '–' + ids[ids.length - 1] : ids[0]} · ${ids.length} question${ids.length === 1 ? '' : 's'}.${note}</span></div>` + html;
  };

  // ---------------- mistakes ----------------
  function mistakeSets() {
    const seen = new Set(), bySet = {};
    for (const h of saved.history) {
      if (!h.total || (h.type !== 'reading' && h.type !== 'listening')) continue;
      for (const q of questionsFor(h.type, h)) {
        const key = h.setId + ':' + q.id;
        if (seen.has(key)) continue;
        seen.add(key);
        if (!isCorrect(q, h.answers[q.id])) (bySet[h.setId] = bySet[h.setId] || { h, ids: [] }).ids.push(q.id);
      }
    }
    return Object.values(bySet).sort((a, b) => b.ids.length - a.ids.length);
  }
  function retryMistakes(setId) {
    const m = mistakeSets().find((x) => x.h.setId === setId); if (!m) return;
    const units = (dataFor(m.h.type, m.h).passages || dataFor(m.h.type, m.h).parts || []);
    // keep a manageable set: the passage/part with the most mistakes
    const counts = units.map((u) => u.questions.filter((q) => m.ids.includes(q.id)).length);
    const best = counts.indexOf(Math.max(...counts));
    const ids = units[best].questions.filter((q) => m.ids.includes(q.id)).map((q) => q.id);
    startFocused(m.h.type, setId, ids, Math.max(6, Math.min(20, Math.ceil(ids.length * 1.6) + (m.h.type === 'listening' ? 6 : 2))), 'Practise my mistakes');
  }

  // ---------------- streaks & plan ----------------
  function streak() {
    const days = new Set(saved.history.map((h) => dayKey(h.date)));
    let n = 0, t = Date.now();
    if (!days.has(dayKey(t))) t -= DAY; // a streak survives until the end of today
    while (days.has(dayKey(t))) { n++; t -= DAY; }
    let best = 0, run = 0;
    [...days].sort().forEach((k, i, arr) => { run = i && (new Date(k) - new Date(arr[i - 1])) <= DAY * 1.5 ? run + 1 : 1; best = Math.max(best, run); });
    return { n, best, doneToday: days.has(today()), days };
  }
  function daysLeft() {
    if (!saved.examDate) return null;
    const d = new Date(saved.examDate + 'T00:00:00'); if (isNaN(d)) return null;
    return Math.ceil((d - new Date(today() + 'T00:00:00')) / DAY);
  }
  function typeAccuracy() {
    const acc = {}, seen = new Set();
    for (const h of saved.history) {
      if (!h.total) continue;
      for (const q of questionsFor(h.type, h)) {
        const k = h.setId + ':' + q.id; if (seen.has(k)) continue; seen.add(k);
        if (!TYPE_OF_DRILL[q.type]) continue;
        const a = (acc[q.type] = acc[q.type] || { ok: 0, n: 0 }); a.n++; if (isCorrect(q, h.answers[q.id])) a.ok++;
      }
    }
    return acc;
  }
  function recommendation() {
    const left = daysLeft();
    const nextFull = (() => {
      for (const t of TestTickets) for (const type of ['listening', 'reading', 'writing', 'speaking']) {
        if (!saved.history.some((h) => h.setId === t.sections[type] && !h.questionIds)) return { t, type };
      }
      return null;
    })();
    if (left != null && left <= 14 && nextFull) {
      return { title: `Full ${NAMES[nextFull.type]} test`, text: `Your exam is close, so practise under real timing: ${NAMES[nextFull.type]} from Ticket ${nextFull.t.number}.`, button: `<button class="bdx-btn bdx-btn--grad" data-action="intro" data-type="${nextFull.type}" data-set="${esc(TestLibrary.key({ type: nextFull.type, setId: nextFull.t.sections[nextFull.type] }))}">Start ${NAMES[nextFull.type]} ${icon('arrow')}</button>` };
    }
    const acc = typeAccuracy();
    const weak = Object.entries(acc).filter(([, a]) => a.n >= 3).sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n)[0];
    const drill = weak ? DRILLS.find((d) => d.id === TYPE_OF_DRILL[weak[0]]) : DRILLS[(new Date().getDate()) % DRILLS.length];
    const why = weak ? `Your accuracy on this question type is ${Math.round((weak[1].ok / weak[1].n) * 100)}% — the lowest of all types.` : 'A short drill keeps your streak going and trains one skill at a time.';
    return { title: drill.label + ' drill', text: `${why} About ${drill.minutes} minutes.`, button: `<button class="bdx-btn bdx-btn--grad" data-st="drill" data-drill="${drill.id}">Start drill ${icon('arrow')}</button>` };
  }

  function planHTML() {
    const s = streak(), left = daysLeft(), rec = recommendation();
    const week = Array.from({ length: 7 }, (_, i) => { const t = Date.now() - (6 - i) * DAY; return { k: dayKey(t), l: new Date(t).toLocaleDateString('en-GB', { weekday: 'narrow' }), on: s.days.has(dayKey(t)), now: i === 6 }; });
    const examLine = left == null ? `<label class="st-date"><span>When is your exam?</span><input type="date" data-st="exam-date" min="${today()}"></label>`
      : left < 0 ? `<p class="st-exam">Your exam date has passed. <button class="bdx-link" data-st="clear-date">Set a new date</button></p>`
      : `<p class="st-exam"><b>${left === 0 ? 'Exam day — good luck!' : left + (left === 1 ? ' day' : ' days') + ' until your exam'}</b><span>${new Date(saved.examDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · <button class="bdx-link" data-st="clear-date">change</button></span></p>`;
    return `<section class="st-plan bdx-reveal" id="study-plan">
      <div class="st-plan-main">
        <span class="bdx-eyebrow">YOUR STUDY PLAN</span>
        ${examLine}
        <div class="st-today ${s.doneToday ? 'done' : ''}"><span class="st-today-tag">${s.doneToday ? '✓ Today’s goal done' : 'Today'}</span><h3>${esc(rec.title)}</h3><p>${esc(rec.text)}</p>${rec.button}</div>
      </div>
      <div class="st-streak">
        <div class="st-flame"><b class="bdx-count">${s.n}</b><span>day streak</span></div>
        <div class="st-week">${week.map((d) => `<i class="${d.on ? 'on' : ''} ${d.now ? 'now' : ''}" title="${d.k}"><em>${d.l}</em></i>`).join('')}</div>
        <small>${s.best > s.n ? `Best: ${s.best} days · ` : ''}One session a day keeps it going.</small>
      </div>
    </section>`;
  }
  function mistakesHTML(compact) {
    const list = mistakeSets();
    const total = list.reduce((a, m) => a + m.ids.length, 0);
    if (!total) return compact ? '' : `<section class="card st-mistakes"><h3>Practise my mistakes</h3><p class="muted">No mistakes to practise yet. Finish a Listening or Reading session and your wrong answers will appear here.</p></section>`;
    return `<section class="card st-mistakes bdx-reveal"><div class="st-head"><div><h3>Practise my mistakes</h3><p>${total} question${total === 1 ? '' : 's'} you got wrong or left blank. Retry them until they are right — each correct retry removes it.</p></div><button class="bdx-link" data-action="nav" data-page="notebook">Open notebook →</button></div>
      <div class="st-mist-list">${list.slice(0, compact ? 3 : 6).map((m) => `<div class="st-mist"><span class="st-mist-ic">${icon(m.h.type === 'reading' ? 'book' : 'headphones')}</span><div><b>${NAMES[m.h.type]} · ${esc(setTitle(m.h))}</b><small>${m.ids.length} to fix</small></div><button class="bdx-btn bdx-btn--ghost st-small" data-st="retry" data-set="${esc(m.h.setId)}">Retry</button></div>`).join('')}</div></section>`;
  }
  function drillsHTML() {
    const acc = typeAccuracy();
    const pct = (d) => { const types = Object.keys(TYPE_OF_DRILL).filter((t) => TYPE_OF_DRILL[t] === d.id); const a = types.reduce((s, t) => ({ ok: s.ok + (acc[t] ? acc[t].ok : 0), n: s.n + (acc[t] ? acc[t].n : 0) }), { ok: 0, n: 0 }); return a.n ? Math.round((a.ok / a.n) * 100) : null; };
    return `<section class="st-drills" id="skill-drills"><div class="bdx-sec-head bdx-reveal"><div><span class="bdx-eyebrow">SHORT ON TIME?</span><h2 class="bdx-h2">10-minute skill drills.</h2></div><p>Train one IELTS question type at a time, using real ticket material. Each drill picks a ticket you haven’t drilled yet.</p></div>
      <div class="st-drill-grid">${DRILLS.map((d) => { const p = pct(d); return `<button class="st-drill bdx-reveal" data-st="drill" data-drill="${d.id}"><span class="st-drill-ic">${icon(d.icon)}</span><b>${d.label}</b><small>${NAMES[d.type]} · ${d.note}</small><span class="st-drill-foot"><span>${d.minutes} min</span>${p == null ? '' : `<em class="${p < 60 ? 'low' : ''}">${p}% correct</em>`}</span></button>`; }).join('')}</div></section>`;
  }

  // ---------------- mount ----------------
  const baseDash = dashboard;
  dashboard = function () {
    const html = baseDash();
    const block = `<div class="st-wrap">${planHTML()}${mistakesHTML(true)}${drillsHTML()}</div>`;
    return html.includes('<section class="bdx-strip">') ? html.replace('<section class="bdx-strip">', block + '<section class="bdx-strip">') : html + block;
  };
  const baseProgress = progressPage;
  progressPage = function () {
    const html = baseProgress();
    const block = `<div class="st-wrap st-wrap--progress">${planHTML()}${mistakesHTML(false)}</div>`;
    const at = html.indexOf('<section class="card bdx-reset">');
    return at >= 0 ? html.slice(0, at) + block + html.slice(at) : html + block;
  };

  if (typeof studyPlan === 'function') {
    const basePlan = studyPlan;
    studyPlan = function () {
      const html = basePlan();
      const block = `<div class="st-wrap st-wrap--progress">${planHTML()}${mistakesHTML(true)}</div>`;
      const i = html.indexOf('</div></div>');
      return i >= 0 && html.startsWith('<div class="workspace-heading">') ? html.slice(0, i + 12) + block + html.slice(i + 12) : block + html;
    };
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-st]');
    if (!b) return;
    const k = b.dataset.st;
    if (k === 'drill') startDrill(b.dataset.drill);
    else if (k === 'retry') retryMistakes(b.dataset.set);
    else if (k === 'clear-date') { delete saved.examDate; persist(); const y = scrollY; render(); scrollTo(0, y); }
  });
  document.addEventListener('change', (e) => {
    if (!e.target.matches || !e.target.matches('[data-st="exam-date"]') || !e.target.value) return;
    saved.examDate = e.target.value; persist();
    const y = scrollY; render(); scrollTo(0, y);
    const left = daysLeft();
    toast(left > 0 ? `Plan set: ${left} days to go. Do one session a day.` : 'Exam date saved.');
  });

  window.BandoraStudy = { startDrill, retryMistakes, mistakeSets, streak, DRILLS };
  // Boot may have rendered before this file loaded: render again so the new sections appear.
  try {
    if (document.getElementById('app') && typeof booting !== 'undefined' && !booting && page !== 'exam') render();
  } catch (e) { /* first render happens when boot completes */ }
})();
