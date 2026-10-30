/* Bandora fixes:
   1. Listening player: sentence-by-sentence playback (avoids Chrome cutting long speech after ~15 s),
      waits for voices, different voices per speaker, progress bar, Pause / Resume in practice mode.
   2. Speaking: live transcript with speech recognition while recording → automatic band estimate + insights.
   3. Writing: word counter always visible next to "Your response". */
(function () {
  'use strict';
  if (typeof document.getElementById !== 'function' || typeof window.setInterval !== 'function') return;
  const hasTTS = typeof window.speechSynthesis !== 'undefined' && typeof window.SpeechSynthesisUtterance !== 'undefined';

  // ======================= 1. LISTENING PLAYER =======================
  let pausedAt = null;     // { session, part, index }
  let nowIndex = 0, nowTotal = 0, dragging = false;
  let smoothFrac = null, ticker = null, cps = 14; // smooth progress inside a sentence (characters per second, learned while playing)

  function chunksFor(session, part) {
    const d = dataFor('listening', session);
    const raw = (d.parts ? d.parts[part] : d).transcript || '';
    const out = [];
    raw.split(/\n+/).forEach((line) => {
      const m = line.match(/^\s*([A-Za-z][A-Za-z .'-]{0,24}):\s*(.*)$/);
      const speaker = m ? m[1].trim() : '';
      const text = (m ? m[2] : line).trim();
      if (!text) return;
      // split long lines into sentences, then pack into ≤ 220 chars
      const sentences = text.match(/[^.!?]+[.!?]*["’”)]?\s*/g) || [text];
      let buf = '';
      sentences.forEach((s) => {
        if ((buf + s).length > 220 && buf) { out.push({ speaker, text: buf.trim() }); buf = ''; }
        buf += s;
      });
      if (buf.trim()) out.push({ speaker, text: buf.trim() });
    });
    return out;
  }

  // Prefer the most natural voices the device offers (Edge "Natural"/"Online", Google, Apple "Enhanced"/"Premium"),
  // British first, then other English accents. Female/male voices are alternated so speakers sound different.
  const FEMALE = /(female|woman|sonia|libby|maisie|abbie|bella|hollie|olivia|serena|kate|stephanie|susan|hazel|martha|emma|amy|jenny|aria|ava|samantha|karen|moira|tessa|fiona|natasha|zira|google uk english female)/i;
  const MALE = /(male|man\b|ryan|thomas|alfie|elliot|ethan|noah|oliver|george|daniel|arthur|guy|davis|tony|brian|christopher|eric|james|william|liam|aaron|google uk english male)/i;
  function voiceScore(x) {
    let s = 0;
    if (/natural|neural|online|premium|enhanced/i.test(x.name)) s += 50;
    if (/google/i.test(x.name)) s += 30;
    if (/microsoft/i.test(x.name) && !/natural|online/i.test(x.name)) s -= 5;
    if (/espeak|robot|compact|novelty|whisper|bad news|bells|boing|bubbles|cellos|zarvox|trinoids|albert|jester|organ|superstar/i.test(x.name)) s -= 100;
    if (x.lang === 'en-GB') s += 20; else if (/^en-(AU|IE|NZ)/i.test(x.lang)) s += 10; else if (/^en-US/i.test(x.lang)) s += 6;
    if (x.localService === false) s += 4;
    return s;
  }
  function englishVoices() {
    const all = speechSynthesis.getVoices().filter((x) => /^en[-_]/i.test(x.lang) || x.lang === 'en');
    const ranked = all.map((x) => ({ x, s: voiceScore(x) })).filter((o) => o.s > -50).sort((a, b) => b.s - a.s).map((o) => o.x);
    const f = ranked.filter((x) => FEMALE.test(x.name)), m = ranked.filter((x) => MALE.test(x.name) && !FEMALE.test(x.name));
    const rest = ranked.filter((x) => !f.includes(x) && !m.includes(x));
    // interleave best female / best male, then the rest
    const out = [];
    for (let i = 0; i < Math.max(f.length, m.length); i++) { if (f[i]) out.push(f[i]); if (m[i]) out.push(m[i]); }
    return out.concat(rest).length ? out.concat(rest) : all;
  }
  function withVoices(cb) {
    if (speechSynthesis.getVoices().length) { cb(); return; }
    let done = false;
    const go = () => { if (done) return; done = true; cb(); };
    try { speechSynthesis.addEventListener('voiceschanged', go, { once: true }); } catch (e) { speechSynthesis.onvoiceschanged = go; }
    setTimeout(go, 1200);
  }
  function setProgress() {
    const bar = document.querySelector('.bdx-audio-progress i');
    if (dragging) return;
    const pct = (smoothFrac != null ? (smoothFrac * 100).toFixed(2) : (nowTotal ? Math.round((nowIndex / nowTotal) * 100) : 0)) + '%';
    if (bar) bar.style.width = pct;
    const knob = document.querySelector('.bdx-knob'); if (knob) knob.style.left = pct;
  }

  if (hasTTS && typeof playAudio === 'function') {
    playAudio = function (resumeIndex) {
      const resuming = Number.isInteger(resumeIndex);
      if (!resuming && active?.mode === 'exam' && audioHasPlayed()) { toast('Audio plays once in exam mode.'); return; }
      stopAudio();
      pausedAt = null;
      const session = active, part = session?.part || 0, generation = playbackGeneration;
      const current = () => generation === playbackGeneration && active === session && (session?.part || 0) === part;
      const status = (text) => { if (current() && $('#audio-status')) $('#audio-status').textContent = text; };
      const chunks = chunksFor(session, part);
      nowTotal = chunks.length; nowIndex = resuming ? resumeIndex : 0;
      // character offsets so progress moves with the actual amount of speech
      const cum = []; let totalChars = 0;
      chunks.forEach((c) => { cum.push(totalChars); totalChars += c.text.length; });
      totalChars = Math.max(1, totalChars);
      const fracAt = (i) => (i >= chunks.length ? 1 : cum[i] / totalChars);
      smoothFrac = fracAt(nowIndex);
      let chunkStart = 0, boundary = 0;
      if (ticker) clearInterval(ticker);
      ticker = setInterval(() => {
        if (!current() || !audioPlaying) { clearInterval(ticker); ticker = null; return; }
        if (!chunkStart || nowIndex >= chunks.length) return;
        const len = chunks[nowIndex].text.length;
        const rate = session?.mode === 'exam' ? 0.92 : 0.92 * speed;
        const timed = ((performance.now() - chunkStart) / 1000) * cps * rate / 0.92;
        const inside = Math.min(len * 0.97, Math.max(boundary, timed));
        smoothFrac = (cum[nowIndex] + inside) / totalChars;
        setProgress();
        const pct = Math.min(99, Math.floor(smoothFrac * 100));
        status(`Playing… ${pct}%`);
      }, 80);
      audioPlaying = true;
      if (session && !resuming) { markAudioPlayed(session, part, true); persist(); }
      status(resuming ? 'Resuming…' : 'Loading voice…');
      updatePauseButton();
      withVoices(() => {
        if (!current()) return;
        const voices = englishVoices(), speakers = {};
        const voiceFor = (sp) => {
          if (!voices.length) return null;
          if (!(sp in speakers)) speakers[sp] = Object.keys(speakers).length;
          return voices[speakers[sp] % voices.length];
        };
        const speakNext = () => {
          if (!current()) return;
          if (nowIndex >= chunks.length) {
            audioPlaying = false; smoothFrac = 1; setProgress(); updatePauseButton();
            status(session?.mode === 'exam' ? 'Audio complete. Finish your answers; exam mode allows one play.' : 'Audio complete. You can replay it or finish your answers.');
            return;
          }
          const c = chunks[nowIndex];
          const u = new SpeechSynthesisUtterance(c.text);
          u.lang = 'en-GB'; u.rate = session?.mode === 'exam' ? 0.92 : 0.92 * speed;
          const v = voiceFor(c.speaker || '_'); if (v) { u.voice = v; u.lang = v.lang; }
          u.onstart = () => { chunkStart = performance.now(); boundary = 0; };
          u.onboundary = (e) => { if (typeof e.charIndex === 'number') boundary = e.charIndex; };
          u.onend = () => {
            if (!current()) return;
            if (chunkStart) { const secs = (performance.now() - chunkStart) / 1000; const r = u.rate / 0.92; if (secs > 0.4) cps = Math.max(8, Math.min(24, cps * 0.6 + (c.text.length / secs / r) * 0.4)); }
            chunkStart = 0; nowIndex++; smoothFrac = fracAt(nowIndex); setProgress(); speakNext();
          };
          u.onerror = (e) => {
            if (!current()) return;
            if (e.error === 'interrupted' || e.error === 'canceled') return;
            audioPlaying = false; updatePauseButton();
            if (session && nowIndex === 0) { markAudioPlayed(session, part, false); persist(); }
            status('Audio could not play. Check your device sound or try another browser (Chrome, Edge or Safari), then press Play audio again.');
            offerTranscript(session, part);
          };
          smoothFrac = fracAt(nowIndex);
          status(`Playing… ${Math.floor(smoothFrac * 100)}%`);
          setProgress();
          try { speechSynthesis.speak(u); } catch (err) { u.onerror({ error: 'playback-failed' }); }
        };
        speakNext();
      });
    };
  }

  // When the browser has no usable voice, practice mode can read the transcript instead.
  function offerTranscript(session, part) {
    if (!session || session.mode === 'exam') return;
    const st = document.getElementById('audio-status');
    if (!st || document.querySelector('[data-bdx="show-transcript"]')) return;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'btn secondary small-btn'; b.dataset.bdx = 'show-transcript'; b.textContent = 'Read the transcript instead';
    st.insertAdjacentElement('afterend', b);
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-bdx="show-transcript"]');
    if (!b || !active) return;
    const d = dataFor('listening', active), raw = (d.parts ? d.parts[active.part || 0] : d).transcript || '';
    let box = document.querySelector('.bdx-transcript-fallback');
    if (box) { box.remove(); b.textContent = 'Read the transcript instead'; return; }
    box = document.createElement('div'); box.className = 'bdx-transcript-fallback'; box.textContent = raw;
    b.insertAdjacentElement('afterend', box); b.textContent = 'Hide transcript';
  });

  function charFrac(index) {
    const ch = active ? chunksFor(active, active.part || 0) : [];
    let before = 0, total = 0;
    ch.forEach((c, i) => { if (i < index) before += c.text.length; total += c.text.length; });
    return total ? before / total : 0;
  }
  function indexForFrac(f) {
    const ch = active ? chunksFor(active, active.part || 0) : [];
    const total = ch.reduce((a, c) => a + c.text.length, 0) || 1;
    let acc = 0;
    for (let i = 0; i < ch.length; i++) { if ((acc + ch[i].text.length / 2) / total >= f) return i; acc += ch[i].text.length; }
    return Math.max(0, ch.length - 1);
  }
  function pauseAudio() {
    if (!active || active.mode === 'exam' || !audioPlaying) return;
    pausedAt = { session: active, part: active.part || 0, index: nowIndex };
    stopAudio();
    pausedAt.ready = true;
    smoothFrac = charFrac(pausedAt.index); setProgress();
    const s = $('#audio-status'); if (s) s.textContent = `Paused at ${Math.floor(smoothFrac * 100)}%. Resume replays the current sentence.`;
    updatePauseButton();
  }
  function resumeAudio() {
    if (!pausedAt || pausedAt.session !== active || pausedAt.part !== (active.part || 0)) return;
    playAudio(pausedAt.index);
  }
  function updatePauseButton() {
    const b = document.querySelector('[data-bdx="audio-pause"]');
    if (!b) return;
    const isPaused = !!(pausedAt && pausedAt.session === active && pausedAt.part === (active?.part || 0));
    b.textContent = isPaused ? 'Resume' : 'Pause';
    b.disabled = !isPaused && !audioPlaying;
  }

  // Practice-mode controls: back / forward one sentence, click the bar to jump, playback speed.
  const SPEEDS = [0.75, 1, 1.25, 1.5];
  let speed = 1;
  try { const v = parseFloat(localStorage.getItem('bandora-listen-speed')); if (SPEEDS.includes(v)) speed = v; } catch (e) {}
  function practiceOK() { return !!(active && active.type === 'listening' && active.mode !== 'exam'); }
  function seekTo(index) {
    if (!practiceOK()) return;
    const part = active.part || 0;
    const total = chunksFor(active, part).length;
    if (!total) return;
    index = Math.max(0, Math.min(total - 1, index));
    nowTotal = total;
    if (audioPlaying) { playAudio(index); return; }
    stopAudio();
    nowIndex = index;
    pausedAt = { session: active, part, index, ready: true };
    smoothFrac = charFrac(index);
    setProgress(); updatePauseButton();
    const s = $('#audio-status'); if (s) s.textContent = `Moved to ${Math.floor(smoothFrac * 100)}%. Press Resume to listen from here.`;
  }
  function currentIndex() { return (pausedAt && pausedAt.session === active) ? pausedAt.index : nowIndex; }
  function cycleSpeed(btn) {
    speed = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
    try { localStorage.setItem('bandora-listen-speed', String(speed)); } catch (e) {}
    if (btn) btn.textContent = speed + '×';
    if (audioPlaying) playAudio(nowIndex); // restart current sentence at the new speed
  }
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-bdx="audio-back"],[data-bdx="audio-fwd"],[data-bdx="audio-speed"]');
    if (!t || !practiceOK()) return;
    if (t.dataset.bdx === 'audio-back') seekTo(currentIndex() - 1);
    else if (t.dataset.bdx === 'audio-fwd') seekTo(currentIndex() + 1);
    else if (t.dataset.bdx === 'audio-speed') cycleSpeed(t);
  });
  // Drag (or click) the slider to move through the recording.
  document.addEventListener('pointerdown', (e) => {
    const bar = e.target.closest('.bdx-audio-progress.seekable');
    if (!bar || !practiceOK() || e.button > 0) return;
    e.preventDefault();
    const total = chunksFor(active, active.part || 0).length;
    if (!total) return;
    dragging = true; bar.classList.add('dragging');
    const frac = (x) => { const r = bar.getBoundingClientRect(); return Math.max(0, Math.min(1, (x - r.left) / Math.max(1, r.width))); };
    const show = (f) => {
      const pct = Math.round(f * 100) + '%';
      bar.querySelector('i').style.width = pct;
      const k = bar.querySelector('.bdx-knob'); if (k) k.style.left = pct;
      const s = $('#audio-status'); if (s) s.textContent = `Drag to choose a point… ${pct}`;
    };
    show(frac(e.clientX));
    const move = (ev) => show(frac(ev.clientX));
    const up = (ev) => {
      document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); document.removeEventListener('pointercancel', up);
      dragging = false; bar.classList.remove('dragging');
      seekTo(indexForFrac(frac(ev.clientX)));
    };
    document.addEventListener('pointermove', move); document.addEventListener('pointerup', up); document.addEventListener('pointercancel', up);
  });
  // Keyboard: arrows move one sentence when the slider has focus.
  document.addEventListener('keydown', (e) => {
    if (!e.target.closest || !e.target.closest('.bdx-audio-progress.seekable') || !practiceOK()) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); seekTo(currentIndex() - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); seekTo(currentIndex() + 1); }
  });

  // ======================= 2. SPEAKING LIVE ANALYSIS =======================
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec = null, live = null;

  function loadStats() { try { return JSON.parse(active.answers.speechstats || '{}'); } catch (e) { return {}; } }
  function saveLive(st) {
    if (!active || active.type !== 'speaking' || !st) return;
    const text = (st.final + ' ').trim();
    if (!text) return;
    const key = 'speech' + (st.part + 1);
    const prevText = st.base ? st.base + ' ' : '';
    active.answers[key] = (prevText + text).trim().slice(0, 9000);
    const all = loadStats(); all.p = all.p || {};
    const prev = st.baseStats || { s: 0, c: 0, cn: 0, lp: 0 };
    all.p[st.part] = { s: Math.round(prev.s + (Date.now() - st.start) / 1000), c: +(prev.c + st.c).toFixed(3), cn: prev.cn + st.cn, lp: prev.lp + st.lp };
    active.answers.speechstats = JSON.stringify(all);
    persist();
  }
  function startLive(fromRecord) {
    if (!SR) { toast('Live analysis needs Chrome, Edge or Safari.'); return; }
    if (!active || active.type !== 'speaking' || live) return;
    const part = active.part || 0;
    const stats = loadStats();
    const keep = !fromRecord && confirmKeep(part);   // a new recording replaces that part's transcript
    live = { part, start: Date.now(), last: Date.now(), final: '', interim: '', c: 0, cn: 0, lp: 0, running: true,
      base: keep ? (active.answers['speech' + (part + 1)] || '') : '', baseStats: keep && stats.p ? stats.p[part] : null };
    rec = new SR();
    rec.lang = 'en-GB'; rec.continuous = true; rec.interimResults = true;
    const st = live;
    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          const now = Date.now();
          if (st.final && now - st.last > 3000) st.lp++;
          st.last = now;
          st.final += (st.final ? ' ' : '') + r[0].transcript.trim();
          if (r[0].confidence > 0) { st.c += r[0].confidence; st.cn++; }
        } else interim += r[0].transcript;
      }
      st.interim = interim;
      drawLive();
    };
    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { st.running = false; toast('Microphone or speech recognition was blocked. Allow it in the browser to get automatic insights.'); }
      else if (e.error === 'network') { st.running = false; toast('Live analysis needs an internet connection.'); }
    };
    rec.onend = () => {
      if (st.running && live === st) { try { rec.start(); } catch (err) { /* already started */ } return; }
      saveLive(st); drawLive();
    };
    try { rec.start(); } catch (err) { live = null; return; }
    drawLive();
  }
  function confirmKeep(part) { return !!(active.answers['speech' + (part + 1)]); }
  function stopLive() {
    if (!live) return;
    const st = live; st.running = false; live = null;
    saveLive(st);                       // save what we have now (submit may follow immediately)
    try { rec.stop(); } catch (e) { /* ignore */ }
    drawLive();
  }
  function drawLive() {
    const host = document.getElementById('recording-ui');
    if (!host || !active || active.type !== 'speaking') return;
    let box = document.querySelector('.bdx-live');
    if (!box) {
      box = document.createElement('div'); box.className = 'bdx-live';
      box.innerHTML = '<div class="bdx-live-head"><strong><span class="bdx-dot"></span><span class="bdx-live-title"></span></strong><button type="button" class="btn secondary small-btn" data-bdx="live-toggle"></button></div><p class="bdx-live-text" aria-live="polite"></p><span class="bdx-live-meta"></span>';
      host.insertAdjacentElement('afterend', box);
    }
    const part = active.part || 0;
    const savedText = active.answers['speech' + (part + 1)] || '';
    const running = !!(live && live.part === part);
    const text = running ? ((live.base ? live.base + ' ' : '') + live.final) : savedText;
    const words = (text.match(/\S+/g) || []).length;
    const secs = running ? Math.round((Date.now() - live.start) / 1000) : 0;
    box.querySelector('.bdx-dot').classList.toggle('on', running);
    box.querySelector('.bdx-live-title').textContent = 'Live transcript · Part ' + (part + 1);
    const btn = box.querySelector('[data-bdx="live-toggle"]');
    const label = running ? 'Stop live analysis' : 'Start live analysis';
    if (btn.textContent !== label) btn.textContent = label;
    const p = box.querySelector('.bdx-live-text');
    p.innerHTML = (text ? esc(text) : '') + (running && live.interim ? ' <i>' + esc(live.interim) + '</i>' : '') +
      (!text && !(running && live.interim) ? '<i>' + (SR ? 'Start speaking — your words appear here. Recording also starts the analysis.' : 'Live analysis needs Chrome, Edge or Safari.') + '</i>' : '');
    box.querySelector('.bdx-live-meta').textContent = words + ' words' + (running ? ' · ' + secs + ' s · ' + (secs > 5 ? Math.round(words / (secs / 60)) : '—') + ' words/min' : '') + ' · An approximate band appears on your results page.';
  }

  // Start/stop with the app's own Record / Stop buttons, and stop before leaving or submitting.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-action]');
    if (!a) return;
    const act = a.dataset.action;
    if (act === 'record' && active && active.type === 'speaking') setTimeout(() => startLive(true), 250);
    if (['stop-record', 'confirm-submit', 'submit', 'exit', 'part', 'leave-exam', 'nav'].includes(act)) stopLive();
  }, true);

  // ======================= shared click handler =======================
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-bdx]');
    if (!b) return;
    if (b.dataset.bdx === 'audio-pause') { (pausedAt && pausedAt.session === active) ? resumeAudio() : pauseAudio(); }
    if (b.dataset.bdx === 'live-toggle') { live ? stopLive() : startLive(false); }
  });

  // ======================= 3. per-render decorations =======================
  setInterval(() => {
    if (typeof active === 'undefined' || !active || page !== 'exam') { if (live) stopLive(); return; }
    // Listening: pause button + progress bar
    const play = document.querySelector('[data-action="play-audio"]');
    if (play) {
      if (!document.querySelector('.bdx-audio-progress')) {
        const bar = document.createElement('span'); bar.className = 'bdx-audio-progress'; bar.setAttribute('aria-hidden', 'true'); bar.innerHTML = '<i></i>';
        play.parentElement.insertAdjacentElement('afterend', bar); setProgress();
      }
      if (active.mode !== 'exam' && !document.querySelector('[data-bdx="audio-pause"]')) {
        const pb = document.createElement('button'); pb.type = 'button'; pb.className = 'btn secondary small-btn'; pb.dataset.bdx = 'audio-pause'; pb.textContent = 'Pause';
        play.insertAdjacentElement('afterend', pb);
        const mk = (k, txt, title) => { const x = document.createElement('button'); x.type = 'button'; x.className = 'btn secondary small-btn'; x.dataset.bdx = k; x.textContent = txt; x.title = title; x.setAttribute('aria-label', title); return x; };
        const back = mk('audio-back', '« Back', 'Back one sentence');
        const fwd = mk('audio-fwd', 'Skip »', 'Forward one sentence');
        const sp = mk('audio-speed', speed + '×', 'Playback speed');
        pb.insertAdjacentElement('afterend', back); back.insertAdjacentElement('afterend', fwd); fwd.insertAdjacentElement('afterend', sp);
        const bar = document.querySelector('.bdx-audio-progress');
        if (bar) {
          bar.classList.add('seekable'); bar.title = 'Drag to move through the recording'; bar.removeAttribute('aria-hidden');
          bar.setAttribute('role', 'slider'); bar.setAttribute('aria-label', 'Audio position'); bar.tabIndex = 0;
          if (!bar.querySelector('.bdx-knob')) { const k = document.createElement('b'); k.className = 'bdx-knob'; bar.appendChild(k); }
          setProgress();
        }
      }
      updatePauseButton();
    }
    // Speaking: live box + clearer footer text
    if (active.type === 'speaking') {
      if (!document.querySelector('.bdx-live') || live) drawLive();
      const note = document.querySelector('.exam-footer .question-nav .muted');
      if (note && !note.dataset.bdx) { note.dataset.bdx = '1'; note.textContent = 'Record (or start live analysis) to get an approximate band on your results page.'; }
    }
    // Writing: always-visible counter chip
    const essay = document.getElementById('essay');
    const label = document.querySelector('label[for="essay"] h2');
    if (essay && label) {
      let chip = label.querySelector('.bdx-wc-chip');
      if (!chip) { chip = document.createElement('span'); chip.className = 'bdx-wc-chip'; chip.setAttribute('aria-live', 'polite'); label.appendChild(chip); }
      updateChip(essay, chip);
    }
  }, 400);

  function updateChip(essay, chip) {
    const min = Number(((document.querySelector('.word-count') || {}).textContent || '').match(/Minimum (\d+)/)?.[1] || 0);
    const n = wordCount(essay.value);
    chip.textContent = `${n}${min ? ' / ' + min : ''} words`;
    chip.classList.toggle('ok', !!min && n >= min);
  }
  document.addEventListener('input', (e) => {
    if (e.target.id !== 'essay') return;
    const chip = document.querySelector('.bdx-wc-chip');
    if (chip) updateChip(e.target, chip);
    const wc = document.getElementById('word-count');
    if (wc) wc.textContent = wordCount(e.target.value);   // keep the original counter in sync too
  });
})();
