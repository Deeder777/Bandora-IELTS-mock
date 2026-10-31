/* Bandora · showcase animations (demo round 3)
   A. Departure board: exam timetable on split-flap letters
   B. Band gauge: needle sweeps 3 → 9 with the IELTS band names
   C. Listening karaoke: waveform + transcript highlight, answers drop into the gaps
   D. Reading highlighter: marker sweeps key phrases, a heading drops into its paragraph
   E. Mistake flashcards: cards flip to the correction and move to a "fixed" pile
 */
(function () {
  'use strict';
  if (typeof dashboard !== 'function') return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const escH = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  // ---------- A · departure board ----------
  const ROWS = [['09:00', 'LISTENING', '30 MIN', '40 Q', 'BOARDING'], ['09:35', 'READING', '60 MIN', '40 Q', 'ON TIME'], ['10:40', 'WRITING', '60 MIN', '2 TASKS', 'ON TIME'], ['13:00', 'SPEAKING', '14 MIN', '3 PARTS', 'LATER']];
  const W = [5, 9, 6, 7, 8];
  function boardHTML() {
    const cells = (txt, w) => [...txt.padEnd(w, ' ')].map((c) => `<i data-to="${c === ' ' ? ' ' : escH(c)}"> </i>`).join('');
    return `<section class="shx-board" data-shx="board"><div class="shx-in">
      <div class="shx-copy"><span class="shx-eyebrow">YOUR EXAM DAY</span><h2 class="bdx-h2">The whole test, on one timetable.</h2><p>Same order and timing as the real Academic test. Bandora runs the clock so you can focus on answers.</p></div>
      <div class="shx-flap" role="table" aria-label="Exam timetable">
        <div class="shx-flap-head" role="row"><span>TIME</span><span>SECTION</span><span>LENGTH</span><span>TASKS</span><span>STATUS</span></div>
        ${ROWS.map((r) => `<div class="shx-flap-row" role="row" aria-label="${r.join(' ')}">${r.map((c, k) => `<span class="shx-cells ${k === 4 ? 'st st-' + c.replace(/\s/g, '') : ''}">${cells(c, W[k])}</span>`).join('')}</div>`).join('')}
      </div></div></section>`;
  }
  const FLAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:';
  function runBoard(sec) {
    if (sec.dataset.ran) return; sec.dataset.ran = '1';
    sec.querySelectorAll('.shx-flap-row').forEach((row, ri) => {
      row.querySelectorAll('i').forEach((cell, ci) => {
        setTimeout(() => { cell.textContent = cell.dataset.to; cell.classList.add('f'); }, ri * 140 + ci * 22);
      });
    });
  }

  // ---------- B · band gauge ----------
  const NAMES = { 3: 'Extremely limited user', 4: 'Limited user', 5: 'Modest user', 6: 'Competent user', 7: 'Good user', 8: 'Very good user', 9: 'Expert user' };
  function gaugeHTML() {
    const ticks = [];
    for (let b = 0; b <= 18; b++) { const v = b / 2, a = -90 + (v / 9) * 180; ticks.push(`<line x1="0" y1="-150" x2="0" y2="${b % 2 ? -140 : -128}" transform="rotate(${a})" class="${b % 2 ? 'h' : ''}"/>${b % 2 ? '' : `<text transform="rotate(${a}) translate(0,-108) rotate(${-a})">${v}</text>`}`); }
    return `<section class="shx-gauge" data-shx="gauge"><div class="shx-sticky">
      <div class="shx-copy"><span class="shx-eyebrow">WHAT YOUR BAND MEANS</span><h2 class="bdx-h2">From “modest” to “expert”, one half band at a time.</h2><p>These are the official names IELTS gives each band. Scroll to move the needle.</p></div>
      <div class="shx-dial"><svg viewBox="-180 -175 360 200" aria-hidden="true"><defs><linearGradient id="shxg" x1="0" x2="1"><stop offset="0" stop-color="#7FD3F0"/><stop offset=".55" stop-color="#0593C6"/><stop offset="1" stop-color="#D83995"/></linearGradient></defs>
        <path d="M-150 0 A150 150 0 0 1 150 0" class="trk"/><path d="M-150 0 A150 150 0 0 1 150 0" class="val" pathLength="100"/>${ticks.join('')}
        <g class="ndl"><path d="M-6 0 L0 -132 L6 0 Z"/><circle r="12"/></g></svg>
        <div class="shx-dial-read"><b data-shx-band>3.0</b><span data-shx-name>Extremely limited user</span></div></div>
    </div></section>`;
  }
  function drawGauge(sec, p) {
    const band = 3 + ease(clamp(p / .85)) * 6, shown = Math.round(band * 2) / 2;
    sec.querySelector('.ndl').setAttribute('transform', `rotate(${-90 + (band / 9) * 180})`);
    sec.querySelector('.val').style.strokeDashoffset = 100 - (band / 9) * 100;
    sec.querySelector('[data-shx-band]').textContent = shown.toFixed(1);
    sec.querySelector('[data-shx-name]').textContent = NAMES[Math.floor(shown)] || 'Expert user';
  }

  // ---------- C · listening karaoke ----------
  const LINES = [['Caller:', 'We', 'expect', 'twenty', 'people,', 'although', 'a', 'few', 'may', 'not', 'come.'], ['Manager:', 'The', 'teaching', 'kitchen', 'is', 'free', 'on', 'Saturday', 'afternoon,', 'from', 'two', 'until', 'six.'], ['Manager:', 'Please', 'bring', 'your', 'own', 'containers', 'for', 'taking', 'food', 'home.']];
  const KEYS = { twenty: 0, Saturday: 1, containers: 2 };
  function karaokeHTML() {
    const bars = Array.from({ length: 72 }, (_, i) => `<i style="--h:${(18 + Math.abs(Math.sin(i * 1.7) * 60 + Math.sin(i * .37) * 22)).toFixed(0)}%"></i>`).join('');
    let wi = 0;
    const text = LINES.map((l) => `<p>${l.map((w, k) => k === 0 ? `<b>${w}</b>` : `<span data-i="${wi++}" class="${w.replace(/[,.]/g, '') in KEYS ? 'key' : ''}">${w}</span>`).join(' ')}</p>`).join('');
    return `<section class="shx-karaoke" data-shx="karaoke"><div class="shx-sticky">
      <div class="shx-k-left"><span class="shx-eyebrow light">LISTENING · PART 1</span><h2 class="bdx-h2">Hear it, catch it, write it.</h2>
        <div class="shx-wave">${bars}<span class="shx-head"></span></div><div class="shx-trans">${text}</div></div>
      <div class="shx-k-card"><div class="shx-k-title">Complete the form · NO MORE THAN TWO WORDS AND/OR A NUMBER</div>
        ${['Group size', 'Day of booking', 'Bring your own'].map((l, i) => `<div class="shx-k-row"><span>${l}</span><em data-k="${i}"><b>${['20', 'Saturday', 'containers'][i]}</b></em></div>`).join('')}</div>
    </div></section>`;
  }
  function drawKaraoke(sec, p) {
    const a = clamp((p - .05) / .85);
    const bars = sec.querySelectorAll('.shx-wave i'), n = Math.floor(a * bars.length);
    bars.forEach((b, i) => b.classList.toggle('on', i < n));
    sec.querySelector('.shx-head').style.left = (a * 100) + '%';
    const words = sec.querySelectorAll('.shx-trans span'), m = Math.floor(a * words.length);
    words.forEach((w, i) => { w.classList.toggle('said', i < m); w.classList.toggle('now', i === m); });
    sec.querySelectorAll('.shx-trans span.key').forEach((w) => { const k = KEYS[w.textContent.replace(/[,.]/g, '')]; sec.querySelector(`[data-k="${k}"]`).classList.toggle('in', w.classList.contains('said')); });
  }

  // ---------- D · reading highlighter ----------
  function readingHTML() {
    return `<section class="shx-read" data-shx="read"><div class="shx-sticky">
      <div class="shx-copy"><span class="shx-eyebrow">READING · MATCHING HEADINGS</span><h2 class="bdx-h2">Find the idea, not the keyword.</h2><p>Highlight the evidence, then drag the heading that fits. Bandora keeps your highlights in the passage.</p>
        <div class="shx-heads"><span class="hd wrong">ii&nbsp; Why ceremonial dress attracted more attention</span><span class="hd right" data-shx-hd>iv&nbsp; What a garment can and cannot tell us</span><span class="hd">vii&nbsp; Recording objects before interpreting them</span></div></div>
      <article class="shx-passage"><div class="shx-slot"><b>A</b><span data-shx-slot>Heading ______</span></div>
        <p>A museum garment can communicate far more than the appearance of a particular period. <mark>A carefully placed patch may reveal how its owner extended its useful life</mark>; uneven fading can suggest which parts were exposed to sunlight. <mark>None of these details explains itself.</mark> Curators must distinguish <mark>what the material supports from what an appealing story merely suggests</mark>.</p></article>
    </div></section>`;
  }
  function drawRead(sec, p) {
    const marks = sec.querySelectorAll('mark');
    marks.forEach((m, i) => m.style.setProperty('--m', clamp((p - .08 - i * .17) / .17).toFixed(3)));
    const fly = ease(clamp((p - .62) / .22)), hd = sec.querySelector('[data-shx-hd]'), slot = sec.querySelector('[data-shx-slot]');
    hd.style.setProperty('--fly', fly.toFixed(3));
    const r1 = hd.getBoundingClientRect(), r2 = slot.getBoundingClientRect();
    if (!hd._dx || fly === 0) { hd._dx = r2.left - r1.left; hd._dy = r2.top - r1.top; }
    hd.style.transform = `translate(${hd._dx * fly}px,${hd._dy * fly}px) scale(${1 - fly * .1})`;
    slot.classList.toggle('filled', fly > .98);
    slot.textContent = fly > .98 ? 'iv  What a garment can and cannot tell us' : 'Heading ______';
    hd.style.opacity = fly > .98 ? 0 : 1;
  }

  // ---------- E · mistake flashcards ----------
  const CARDS = [['Q27 · Listening', 'The pilot will be tested with ____ students.', 'you wrote: 18', '8 — “Run a pilot with eight students.”'], ['Q14 · Reading', 'Paragraph A heading', 'you chose: ii', 'iv — the paragraph is about what clothes can and cannot tell us'], ['Q36 · Reading', 'Accuracy alone makes a label useful.', 'you chose: NOT GIVEN', 'NO — the writer says accuracy alone did not guarantee access'], ['Q16 · Listening', 'Café on the map', 'you chose: A', 'B — “on your right as you set off up the main path”'], ['Task 2 · Writing', '“more better results”', 'grammar', '“better results” — never use more with a comparative']];
  function cardsHTML() {
    return `<section class="shx-cards" data-shx="cards"><div class="shx-sticky">
      <div class="shx-copy"><span class="shx-eyebrow">MISTAKE NOTEBOOK</span><h2 class="bdx-h2">Every wrong answer becomes a card you can beat.</h2><p>Flip a card, read the evidence, and it moves to your fixed pile. <b data-shx-fixed>0</b> of ${CARDS.length} fixed.</p></div>
      <div class="shx-deck">${CARDS.map((c, i) => `<div class="shx-fc" style="--i:${i}"><div class="f"><span>${c[0]}</span><h4>${escH(c[1])}</h4><em>${escH(c[2])}</em><small>Tap to see why</small></div><div class="b"><span>CORRECT ANSWER</span><h4>${escH(c[3])}</h4><small>✓ Moved to fixed</small></div></div>`).join('')}</div>
    </div></section>`;
  }
  function drawCards(sec, p) {
    const cs = [...sec.querySelectorAll('.shx-fc')], N = cs.length;
    let fixed = 0; const sm = innerWidth < 860, DX = sm ? 30 : 260, DY = sm ? 150 : 40;
    cs.forEach((c, i) => {
      const order = N - 1 - i; // top card first
      const t = clamp((p - .06 - order * .17) / .17);
      const flip = ease(clamp(t / .55)), away = ease(clamp((t - .55) / .45));
      if (away > .99) fixed++;
      const stack = i * 1;
      c.style.transform = `translate(${away * DX}px,${-stack * 6 + away * (DY + order * 10)}px) rotate(${(i - 2) * 2.2 + away * (sm ? 4 : 10)}deg) rotateY(${flip * 180}deg) scale(${1 - away * .18})`;
      c.style.zIndex = away > .5 ? 1 + order : 10 + i;
    });
    sec.querySelector('[data-shx-fixed]').textContent = fixed;
  }

  // ---------- mount ----------
  const baseDash = dashboard;
  dashboard = function () {
    let html = baseDash();
    const block = boardHTML() + gaugeHTML() + karaokeHTML() + readingHTML() + cardsHTML();
    const at = html.indexOf('<section class="bdx-strip">');
    return at >= 0 ? html.slice(0, at) + block + html.slice(at) : html + block;
  };
  const DRAW = { gauge: drawGauge, karaoke: drawKaraoke, read: drawRead, cards: drawCards };
  function frame() {
    raf = 0; const vh = innerHeight;
    document.querySelectorAll('[data-shx]').forEach((sec) => {
      const r = sec.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      if (sec.dataset.shx === 'board') { if (r.top < vh * .7) runBoard(sec); return; }
      DRAW[sec.dataset.shx](sec, clamp(-r.top / Math.max(1, r.height - vh)));
    });
  }
  let raf = 0;
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(frame); }, { passive: true });
  addEventListener('resize', () => requestAnimationFrame(frame));
  new MutationObserver(() => requestAnimationFrame(frame)).observe(document.getElementById('app') || document.body, { childList: true });
  try { if (document.getElementById('app') && typeof booting !== 'undefined' && !booting && page !== 'exam') render(); } catch (e) { /* boot renders later */ }
  requestAnimationFrame(frame);
})();
