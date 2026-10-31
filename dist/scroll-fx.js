/* Bandora · scroll animations on the Overview page
   1. "Papers become your band": answer sheets fly in and build the number 9.0
   2. Ticket carousel: a 3D ring of the 10 real tickets that turns with scroll (real progress, real Start buttons)
   3. "Words become an essay": linking-word cards gather into a Task 2 paragraph
   4. Results: band numbers roll like a slot machine
   5. Cards tilt slightly towards the mouse */
(function () {
  'use strict';
  if (typeof dashboard !== 'function' || !window.TestTickets) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const smooth = (t) => t * t * (3 - 2 * t);
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const n2 = (i) => String(i).padStart(2, '0');
  const ORDER = ['listening', 'reading', 'writing', 'speaking'];
  const COVERS = [['#0593C6', '#FFB199', '#D83995', '#0B2B5A'], ['#0A86B8', '#7FD3F0', '#2E5BD8', '#D83995'], ['#078AB8', '#FFD3A8', '#FF7A59', '#0B2B5A'], ['#0593C6', '#FFC2DE', '#D83995', '#3B1E6E'], ['#0C7FAE', '#B8F1E2', '#19B8A6', '#0B2B5A'], ['#06516F', '#FFB199', '#D83995', '#0A1B3A'], ['#0A92BF', '#E8F7A8', '#5CC98A', '#0B2B5A'], ['#0A86B8', '#FFD6EC', '#B04ADB', '#1A1446'], ['#0B8FC0', '#FFE0B0', '#F28C4B', '#3A1E14'], ['#0593C6', '#BDEBFF', '#2BA3E0', '#0B2B5A']];

  // ---------- 1 · papers → 9.0 ----------
  let BAND_POINTS = null;
  function bandPoints(text) {
    const c = document.createElement('canvas'); c.width = 360; c.height = 200;
    const g = c.getContext('2d'); g.fillStyle = '#000'; g.font = '800 190px "Plus Jakarta Sans", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, 180, 108);
    const d = g.getImageData(0, 0, 360, 200).data, pts = [];
    for (let y = 6; y < 200; y += 15) for (let x = 6; x < 360; x += 13) if (d[(y * 360 + x) * 4 + 3] > 128) pts.push([x - 180, y - 100]);
    return pts;
  }
  function papersHTML() {
    const real = window.Bands && Bands.overall(Bands.latestBands(saved.history));
    const band = real ? Bands.fmtBand(real.band) : '9.0';
    BAND_POINTS = bandPoints(band);
    let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const papers = BAND_POINTS.map(([x, y], i) => {
      const sx = (rnd() - .5) * 1600, sy = (rnd() - .5) * 900 - 200, sz = rnd() * -900, rz = (rnd() - .5) * 140, rx = (rnd() - .5) * 120;
      const hue = ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFE3F1', '#E3F6FD'][i % 5];
      return `<i style="--tx:${x * 1.9}px;--ty:${y * 1.9}px;--sx:${sx}px;--sy:${sy}px;--sz:${sz}px;--rz:${rz}deg;--rx:${rx}deg;--d:${(i % 13) / 13};background:${hue}"></i>`;
    }).join('');
    return `<section class="sfx-papers" data-sfx="papers"><div class="sfx-sticky">
      <div class="sfx-papers-copy"><span class="sfx-eyebrow">${real ? 'YOUR CURRENT ESTIMATE' : 'EVERY ANSWER COUNTS'}</span><h2>Every sheet you finish builds your band.</h2><p>${real ? `Your sessions so far add up to an estimated band of ${band}.` : 'Eighty questions, two essays and three speaking parts per ticket. Bandora turns them into one clear number.'}</p></div>
      <div class="sfx-papers-stage" aria-hidden="true"><div class="sfx-papers-field">${papers}</div><b class="sfx-papers-label">${band}</b></div>
    </div></section>`;
  }
  function drawPapers(sec, p) {
    const a = ease(clamp(p / .7));
    sec.style.setProperty('--a', a.toFixed(4));
    sec.querySelector('.sfx-papers-label').style.opacity = clamp((p - .72) / .15);
    sec.querySelector('.sfx-papers-field').style.opacity = 1 - clamp((p - .82) / .15) * .85;
  }

  // ---------- 2 · ticket carousel ----------
  function ticketState(t) {
    const done = ORDER.map((type) => saved.history.some((h) => h.setId === t.sections[type] && !h.questionIds));
    const next = ORDER[done.indexOf(false)] || 'listening';
    let listening = '';
    try { listening = TestLibrary.get('listening', t.sections.listening).data.parts[0].title; } catch (e) { listening = ''; }
    return { done, next, listening };
  }
  function carouselHTML() {
    const cards = TestTickets.map((t, i) => {
      const s = ticketState(t), c = COVERS[i % COVERS.length], count = s.done.filter(Boolean).length;
      return `<article class="sfx-card" style="--c0:${c[0]};--c1:${c[1]};--c2:${c[2]};--c3:${c[3]};--x:${45 + (i * 17) % 30}%">
        <div class="sfx-cover"><span class="sfx-badge">${count === 4 ? 'COMPLETED' : count ? count + '/4 DONE' : 'ACADEMIC'}</span><span class="sfx-num ${i % 2 ? 'solid' : ''}">${t.number}</span></div>
        <div class="sfx-cbody"><span class="sfx-k">TICKET ${t.number}</span><h3>${esc(t.topics[0])}</h3>
        <div class="sfx-secs">${['L', 'R', 'W', 'S'].map((x, k) => `<i class="${s.done[k] ? 'done' : ''}">${x}</i>`).join('')}</div>
        <div class="sfx-meta"><span>2h 45m</span><span>40 + 40 questions</span></div></div></article>`;
    }).join('');
    return `<section class="sfx-tickets" data-sfx="tickets"><div class="sfx-sticky sfx-tk-stage">
      <div class="sfx-tk-head"><div><span class="sfx-eyebrow light">TEN FULL ACADEMIC TESTS</span><h2>Pick the ticket you’ll sit tonight.</h2></div><div class="sfx-count"><b data-sfx-cur>01</b> / ${n2(TestTickets.length)}</div></div>
      <div class="sfx-world" aria-hidden="true"><div class="sfx-ring">${cards}</div></div>
      <div class="sfx-panel"><div><div class="sfx-plbl" data-sfx-lbl></div><div class="sfx-pt" data-sfx-title></div><div class="sfx-ps" data-sfx-sub></div></div>
        <button class="sfx-go" type="button" data-action="intro" data-sfx-go>Start</button>
        <div class="sfx-pips">${TestTickets.map(() => '<i><b></b></i>').join('')}</div></div>
    </div></section>`;
  }
  let lastTicket = -1;
  // the ring glides towards the scroll target, so wheel steps never make it jump
  function drawTickets(sec, p) {
    const N = TestTickets.length, t = p * (N - 1), k = Math.floor(t), f = t - k;
    sec._target = Math.min(N - 1, k + smooth(clamp((f - .2) / .6)));
    if (sec._pos == null) sec._pos = sec._target;
    if (!sec._anim) { sec._anim = true; requestAnimationFrame(() => glide(sec)); }
  }
  function glide(sec) {
    const d = sec._target - sec._pos;
    sec._pos = Math.abs(d) < .002 ? sec._target : sec._pos + d * .12;
    paintTickets(sec, sec._pos);
    if (sec._pos !== sec._target && sec.isConnected) requestAnimationFrame(() => glide(sec)); else sec._anim = false;
  }
  function paintTickets(sec, pos) {
    const N = TestTickets.length;
    const radius = innerWidth < 760 ? 320 : 500, step = 360 / N;
    sec.querySelector('.sfx-ring').style.transform = `translateZ(${-radius}px) rotateX(-7deg) rotateY(${-pos * step}deg)`;
    sec.querySelectorAll('.sfx-card').forEach((c, i) => {
      let a = ((i - pos) * step) % 360; if (a > 180) a -= 360; if (a < -180) a += 360;
      const front = Math.max(0, Math.cos(a * Math.PI / 180)), lift = Math.pow(front, 6);
      c.style.transform = `rotateY(${i * step}deg) translateZ(${radius}px) translateY(${-lift * 18}px) scale(${.86 + lift * .2})`;
      c.style.filter = `brightness(${.62 + .38 * front}) saturate(${.7 + .3 * front}) blur(${(1 - front) * 1.6}px)`;
    });
    const cur = Math.round(pos);
    sec.querySelectorAll('.sfx-pips b').forEach((b, i) => { b.style.width = i <= cur ? '100%' : '0'; });
    if (cur === lastTicket && sec.dataset.drawn) return;
    lastTicket = cur; sec.dataset.drawn = '1';
    const t0 = TestTickets[cur], s = ticketState(t0), count = s.done.filter(Boolean).length;
    sec.querySelector('[data-sfx-cur]').textContent = t0.number;
    sec.querySelector('[data-sfx-lbl]').textContent = `TICKET ${t0.number} · ${count}/4 SECTIONS DONE`;
    sec.querySelector('[data-sfx-title]').textContent = t0.topics[0];
    sec.querySelector('[data-sfx-sub]').textContent = s.listening ? `Listening opens with: ${s.listening}` : 'Listening, Reading, Writing and Speaking';
    const go = sec.querySelector('[data-sfx-go]');
    go.dataset.type = s.next; go.dataset.set = t0.sections[s.next]; go.dataset.mode = 'exam';
    go.textContent = count === 4 ? `Retake Ticket ${t0.number} →` : `${count ? 'Continue' : 'Start'} Ticket ${t0.number} · ${s.next[0].toUpperCase() + s.next.slice(1)} →`;
  }

  // ---------- 3 · words → essay ----------
  const ESSAY = [
    ['Museums', 0], ['should', 0], ['remain', 0], ['free', 1], ['for', 0], ['everyone.', 0],
    ['Admission', 0], ['charges', 0], ['may', 0], ['fund', 0], ['repairs;', 0], ['however,', 2], ['they', 0], ['also', 0], ['exclude', 1], ['families', 0], ['on', 0], ['low', 0], ['incomes.', 0],
    ['In', 2], ['contrast,', 2], ['free', 0], ['entry', 0], ['broadens', 1], ['access', 0], ['and,', 0], ['as', 2], ['a', 2], ['result,', 2], ['encourages', 0], ['repeat', 0], ['visits.', 0]
  ];
  function essayHTML() {
    let seed = 3; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const words = ESSAY.map(([w, k]) => `<span class="sfx-w ${k === 1 ? 'lex' : k === 2 ? 'link' : ''}" style="--sx:${(rnd() - .5) * 900}px;--sy:${(rnd() - .5) * 520}px;--rz:${(rnd() - .5) * 50}deg;--sz:${rnd() * 300}px">${w}</span>`).join(' ');
    return `<section class="sfx-essay" data-sfx="essay"><div class="sfx-sticky">
      <div class="sfx-essay-copy"><span class="sfx-eyebrow">WRITING · TASK 2</span><h2>Scattered ideas become a Band 7 paragraph.</h2>
        <ul><li><i class="link"></i>Linking words</li><li><i class="lex"></i>Less common vocabulary</li></ul>
        <p>AI feedback marks both, so you can see exactly what moved your band.</p></div>
      <div class="sfx-essay-sheet"><div class="sfx-essay-head"><b>Task 2</b><span data-sfx-wc>0 words</span></div><p>${words}</p></div>
    </div></section>`;
  }
  function drawEssay(sec, p) {
    const ws = sec.querySelectorAll('.sfx-w');
    let placed = 0;
    ws.forEach((w, i) => { const a = ease(clamp((p - i * .018) / .3)); w.style.setProperty('--a', a.toFixed(3)); if (a > .98) placed++; });
    sec.querySelector('[data-sfx-wc]').textContent = `${placed} words`;
    sec.classList.toggle('lit', p > .75);
  }

  // ---------- mount on Overview ----------
  const baseDash = dashboard;
  dashboard = function () {
    let html = baseDash();
    if (reduce) return html;
    const papers = papersHTML(), tickets = carouselHTML(), essay = essayHTML();
    html = html.replace('<div class="bdx-marquee"', papers + '<div class="bdx-marquee"');
    html = html.includes('<section class="bdx-sections">') ? html.replace('<section class="bdx-sections">', tickets + '<section class="bdx-sections">') : html + tickets;
    html = html.includes('<section class="bdx-how') ? html.replace('<section class="bdx-how', essay + '<section class="bdx-how') : html + essay;
    return html;
  };

  const DRAW = { papers: drawPapers, tickets: drawTickets, essay: drawEssay };
  function frame() {
    const vh = innerHeight;
    document.querySelectorAll('[data-sfx]').forEach((sec) => {
      const r = sec.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) { if (sec.dataset.drawn) return; }
      const p = clamp(-r.top / Math.max(1, r.height - vh));
      DRAW[sec.dataset.sfx](sec, p);
    });
  }
  let raf = 0;
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; frame(); }); }, { passive: true });
  addEventListener('resize', frame);
  new MutationObserver(() => { lastTicket = -1; requestAnimationFrame(frame); }).observe(document.getElementById('app') || document.body, { childList: true });

  // ---------- 4 · results: band numbers roll like a slot machine ----------
  if (typeof renderResult === 'function') {
    const baseResult = renderResult;
    renderResult = function () {
      baseResult.apply(this, arguments);
      if (reduce) return;
      document.querySelectorAll('.bdx-res-tiles strong').forEach((el, i) => {
        const final = el.textContent.trim();
        if (!/^\d/.test(final)) return;
        const target = parseFloat(final), start = performance.now(), dur = 900 + i * 350;
        el.classList.add('sfx-roll');
        (function tick(now) {
          const t = clamp((now - start) / dur);
          if (t < 1) { el.textContent = (Math.floor(Math.random() * 18) / 2).toFixed(1); requestAnimationFrame(tick); }
          else { el.textContent = target.toFixed(1); el.classList.remove('sfx-roll'); el.classList.add('sfx-landed'); }
        })(start);
      });
    };
  }

  // ---------- 5 · cards tilt towards the mouse ----------
  if (!reduce && matchMedia('(hover: hover)').matches) {
    const SEL = '.bdx-card,.st-drill,.bdx-focus-card';
    document.addEventListener('pointermove', (e) => {
      const c = e.target.closest && e.target.closest(SEL); if (!c) return;
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      c.style.transform = `perspective(800px) rotateX(${-y * 7}deg) rotateY(${x * 9}deg) translateY(-3px)`;
      c.style.setProperty('--mx', (x + .5) * 100 + '%'); c.style.setProperty('--my', (y + .5) * 100 + '%');
    });
    document.addEventListener('pointerout', (e) => { const c = e.target.closest && e.target.closest(SEL); if (c && !c.contains(e.relatedTarget)) c.style.transform = ''; });
  }

  try { if (document.getElementById('app') && typeof booting !== 'undefined' && !booting && page !== 'exam') render(); } catch (e) { /* boot renders later */ }
})();
