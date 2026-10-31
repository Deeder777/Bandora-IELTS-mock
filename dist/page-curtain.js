/* Bandora · curtain wipe with the Bandora name when switching pages from the navbar */
(function () {
  'use strict';
  if (typeof go !== 'function' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const curtain = document.createElement('div');
  curtain.className = 'pfx-curtain'; curtain.setAttribute('aria-hidden', 'true');
  curtain.innerHTML = '<b>Bandora</b>';
  document.body.appendChild(curtain);
  const baseGo = go;
  go = function (to) {
    const from = typeof page !== 'undefined' ? page : null;
    const out = baseGo.apply(this, arguments);
    if (to && to !== from && to !== 'exam') { curtain.classList.remove('run'); void curtain.offsetWidth; curtain.classList.add('run'); }
    return out;
  };
})();
