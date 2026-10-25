/* Bandora motion layer: watches #app renders and adds the design's animations.
   No changes to the practice engine. Remove this file + motion.css to disable. */
(function () {
  'use strict';
  // Bail out quietly outside a real browser (tests, old browsers) or when motion is reduced.
  if (typeof window.matchMedia !== 'function' || typeof window.IntersectionObserver !== 'function' ||
      typeof window.MutationObserver !== 'function' || typeof document.getElementById !== 'function') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const app = document.getElementById('app');
  if (!app || !app.classList || typeof app.querySelectorAll !== 'function') return;
  document.documentElement.classList.add('mo-ready');

  // Blocks that rise in once, when the page changes and they are on screen.
  const ENTER = [
    '.bd-hero-copy > *', '.ba-story-copy > *', '.ba-form-area > *',
    '.workspace-heading', '.exam-heading', '.exam-tabs', '.result-hero > *', '.results header', '.bdx-enter', '.bdx-res-main', '.bdx-res-tiles > *'
  ].join(',');
  const ENTER_SCALE = ['.bdx-report', '.bd-snapshot', '.ba-visual', '.passage-panel', '.question-panel'].join(',');
  // Blocks that reveal while scrolling.
  const REVEAL = [
    '.bd-stat-band > div', '.section-heading', '.skill-card', '.bd-how > div', '.bd-how li',
    '.activity-card', '.next-step-card', '.bd-honesty', '.ticket-guide', '.library-search', '.ticket-card',
    '.progress-stats > *', '.analytics-card', '.history-section', '.breakdown-list > *',
    '.result-review > *', '.card:not(.result-hero):not(.passage-panel)', '.bdx-reveal'
  ].join(',');
  const MASK = '.section-heading h2, .bd-how h2';
  // Numbers that count up from zero when they appear.
  const COUNT = ['.bdx-count', '.bd-stat-band strong', '.bd-progress-ring strong', '.bd-auth-number', '.result-score', '.progress-stats strong', '.ticket-card-head strong'].join(',');

  let lastKey = '';
  let firstRender = true;

  const io = new IntersectionObserver((entries) => {
    let batch = 0;
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      io.unobserve(el);
      if (el.matches(COUNT)) countUp(el);
      if (el.classList.contains('mo-reveal') || el.classList.contains('mo-mask')) {
        el.style.setProperty('--mo-i', Math.min(batch++, 6));
        el.classList.add('mo-in');
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  function viewKey() {
    const nav = app.querySelector('[aria-current="page"]');
    const head = app.querySelector('h1, h2');
    const tab = app.querySelector('.exam-tabs .active');
    return [app.firstElementChild && app.firstElementChild.className, nav && nav.dataset.page, head && head.textContent.slice(0, 60), tab && tab.textContent].join('|');
  }

  function countUp(el) {
    // Animate the first text node that is a plain number ("10", "800", "3/4" keeps its <small>).
    const node = [...el.childNodes].find((n) => n.nodeType === 3 && /\d/.test(n.data));
    if (!node || node.__mo) return;
    const m = node.data.match(/^(\s*)(\d+(?:\.\d+)?)(.*)$/s);
    if (!m) return;
    node.__mo = true;
    const target = parseFloat(m[2]);
    const decimals = (m[2].split('.')[1] || '').length;
    const start = performance.now(), dur = 1400, delay = 200;
    const tick = (now) => {
      const t = Math.min(1, Math.max(0, (now - start - delay) / dur));
      const v = target * (1 - Math.pow(1 - t, 3));
      node.data = m[1] + (t >= 1 ? m[2] : v.toFixed(decimals)) + m[3];
      if (t < 1) requestAnimationFrame(tick);
    };
    node.data = m[1] + (0).toFixed(decimals) + m[3];
    requestAnimationFrame(tick);
  }

  function addProgressBar() {
    const header = app.querySelector('.bd-header');
    if (!header || header.querySelector('.mo-progress')) return;
    const bar = document.createElement('div');
    bar.className = 'mo-progress';
    bar.setAttribute('aria-hidden', 'true');
    header.appendChild(bar);
    if (firstRender) header.classList.add('mo-first');
  }

  function decorate() {
    const key = viewKey();
    const changed = key !== lastKey;
    lastKey = key;
    addProgressBar();
    if (!changed) return; // same page re-rendered (e.g. timer/answers): don't replay entrances

    app.querySelectorAll(ENTER).forEach((el, i) => { el.classList.remove('mo-enter'); void el.offsetWidth; el.style.setProperty('--mo-i', Math.min(i, 8)); el.classList.add('mo-enter'); });
    app.querySelectorAll(ENTER_SCALE).forEach((el, i) => { el.style.setProperty('--mo-i', i); el.classList.add('mo-enter-scale'); });

    const isExam = !!app.querySelector('.exam-shell');
    if (isExam) {
      app.querySelectorAll('.question-panel .question').forEach((q, i) => { if (i < 8) { q.style.setProperty('--mo-i', i + 2); q.classList.add('mo-enter'); } });
    } else {
      app.querySelectorAll(REVEAL).forEach((el) => {
        if (el.closest('.mo-reveal') && el.closest('.mo-reveal') !== el) return; // avoid nested double reveals
        if (el.matches(ENTER) || el.matches(ENTER_SCALE)) return;
        el.classList.add('mo-reveal');
        io.observe(el);
      });
      app.querySelectorAll(MASK).forEach((h) => { h.classList.add('mo-mask'); io.observe(h); });
    }
    app.querySelectorAll(COUNT).forEach((el) => io.observe(el));
    firstRender = false;
  }

  // Header scroll progress.
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const bar = app.querySelector('.mo-progress');
      if (!bar) return;
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, scrollY / max) : 0) + ')';
    });
  }, { passive: true });

  // Low-time pulse on the exam timer (last 5 minutes).
  setInterval(() => {
    const t = app.querySelector('.exam-top .timer');
    if (!t) return;
    const m = t.textContent.match(/(\d+):(\d{2})/);
    t.classList.toggle('mo-low', !!m && Number(m[1]) < 5);
  }, 1000);

  new MutationObserver(decorate).observe(app, { childList: true });
  decorate();
})();
