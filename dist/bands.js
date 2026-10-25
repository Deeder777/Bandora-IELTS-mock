/* Bandora band estimates.
   Listening / Academic Reading: raw score out of 40 → band, using the widely published
   IELTS conversion ranges (the official cut-offs vary slightly between papers, so these are estimates).
   Writing / Speaking: the learner's own rating on the four public criteria, averaged.
   Overall: mean of the four section bands, rounded the IELTS way (.25 → .5, .75 → next whole band). */
(function () {
  'use strict';
  const LISTENING = [[39, 9], [37, 8.5], [35, 8], [32, 7.5], [30, 7], [26, 6.5], [23, 6], [18, 5.5], [16, 5], [13, 4.5], [11, 4], [8, 3.5], [6, 3], [4, 2.5], [3, 2], [1, 1], [0, 0]];
  const READING = [[39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [19, 5.5], [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5], [3, 2], [1, 1], [0, 0]];

  const CRITERIA = {
    writing: [
      { key: 'c1', name: 'Task Response', short: 'TR', guide: { 5: 'Answers the task only partly; position or overview is unclear.', 6: 'Covers all parts; position is there but some ideas lack support.', 7: 'Clear position throughout; main ideas extended and supported.', 8: 'Fully developed answer with well-supported, relevant ideas.' } },
      { key: 'c2', name: 'Coherence & Cohesion', short: 'CC', guide: { 5: 'Some organisation, but linking is limited or repetitive.', 6: 'Logical order; linking works but can be mechanical.', 7: 'Clear progression; linkers used flexibly; clear paragraphs.', 8: 'Ideas flow naturally; paragraphing is skilful.' } },
      { key: 'c3', name: 'Lexical Resource', short: 'LR', guide: { 5: 'Limited range; noticeable spelling or word-choice errors.', 6: 'Adequate range; some errors that don’t block meaning.', 7: 'Good range incl. less common words; few collocation slips.', 8: 'Wide, precise vocabulary with rare errors.' } },
      { key: 'c4', name: 'Grammatical Range & Accuracy', short: 'GRA', guide: { 5: 'Mostly simple sentences; frequent errors.', 6: 'Mix of simple and complex forms; some errors.', 7: 'Variety of complex structures; many error-free sentences.', 8: 'Wide range; the majority of sentences are error-free.' } }
    ],
    speaking: [
      { key: 'c1', name: 'Fluency & Coherence', short: 'FC', guide: { 5: 'Keeps going but with repetition, slow speech or self-correction.', 6: 'Speaks at length; some hesitation or loss of coherence.', 7: 'Speaks at length without noticeable effort; flexible linking.', 8: 'Fluent; hesitation is rare and content-related.' } },
      { key: 'c2', name: 'Lexical Resource', short: 'LR', guide: { 5: 'Manages familiar topics; limited flexibility.', 6: 'Enough vocabulary to discuss topics at length; paraphrases.', 7: 'Flexible vocabulary, some idiomatic language.', 8: 'Wide, precise vocabulary; skilful paraphrase.' } },
      { key: 'c3', name: 'Grammatical Range & Accuracy', short: 'GRA', guide: { 5: 'Basic forms fairly accurate; complex forms limited.', 6: 'Mix of forms; errors in complex sentences.', 7: 'Range of complex structures; frequent error-free sentences.', 8: 'Wide range; most sentences error-free.' } },
      { key: 'c4', name: 'Pronunciation', short: 'P', guide: { 5: 'Generally understood, with some mispronunciation.', 6: 'Clear overall; features used with mixed control.', 7: 'Easy to understand; good control of stress and intonation.', 8: 'Easy to understand throughout; accent has little effect.' } }
    ]
  };

  const fromTable = (table, score) => { for (const [min, band] of table) if (score >= min) return band; return 0; };
  const roundBand = (x) => { const f = x - Math.floor(x); return f < 0.25 ? Math.floor(x) : f < 0.75 ? Math.floor(x) + 0.5 : Math.ceil(x); };
  const fmtBand = (b) => (b == null ? '—' : Number(b).toFixed(1));

  function sessionBand(h) {
    if (!h) return null;
    if ((h.type === 'listening' || h.type === 'reading') && h.total === 40 && !h.questionIds) {
      return fromTable(h.type === 'listening' ? LISTENING : READING, h.score);
    }
    if ((h.type === 'writing' || h.type === 'speaking') && h.rating) {
      const vals = ['c1', 'c2', 'c3', 'c4'].map((k) => h.rating[k]).filter((n) => Number.isInteger(n));
      if (vals.length === 4) return roundBand(vals.reduce((a, b) => a + b, 0) / 4);
    }
    if (h.type === 'speaking') { const est = speakingEstimate(h); if (est && est.overall != null) return est.overall; }
    return null;
  }

  function latestBands(history) {
    const out = {};
    for (const type of ['listening', 'reading', 'writing', 'speaking']) {
      const h = (history || []).find((x) => x.type === type && sessionBand(x) != null);
      out[type] = h ? { band: sessionBand(h), session: h } : null;
    }
    return out;
  }

  function overall(bands) {
    const vals = Object.values(bands).filter(Boolean).map((b) => b.band);
    if (!vals.length) return null;
    return { band: roundBand(vals.reduce((a, b) => a + b, 0) / vals.length), count: vals.length };
  }

  // Automatic text checks for a Writing answer (guidance only, not a score).
  const LINKERS = ['however', 'therefore', 'moreover', 'furthermore', 'in addition', 'for example', 'for instance', 'on the other hand', 'in contrast', 'whereas', 'although', 'while', 'as a result', 'consequently', 'overall', 'in conclusion', 'firstly', 'secondly', 'finally', 'similarly', 'nevertheless', 'because', 'since', 'thus'];
  const COMPLEX = /\b(which|who|whom|whose|although|though|whereas|if|unless|because|since|while|when|that)\b/gi;
  function writingChecks(text, minWords) {
    const t = String(text || '');
    const words = t.toLowerCase().match(/[a-z']+/g) || [];
    const paragraphs = (/\n\s*\n/.test(t) ? t.split(/\n\s*\n/) : t.split(/\n/)).map((p) => p.trim()).filter((p) => p.split(/\s+/).length >= 8 || !/\n\s*\n/.test(t)).length;
    const sentences = (t.match(/[^.!?]+[.!?]+/g) || []).length || (t.trim() ? 1 : 0);
    const linkers = LINKERS.filter((l) => t.toLowerCase().includes(l)).length;
    const unique = new Set(words.filter((w) => w.length > 3)).size;
    const longWords = words.filter((w) => w.length > 3).length || 1;
    const variety = Math.round((unique / longWords) * 100);
    const complex = (t.match(COMPLEX) || []).length;
    const avgLen = sentences ? Math.round(words.length / sentences) : 0;
    return [
      { c: 'c1', ok: words.length >= minWords, label: words.length + ' / ' + minWords + ' words', tip: words.length >= minWords ? 'Length is fine.' : 'Short answers lose marks for task response.' },
      { c: 'c2', ok: paragraphs >= (minWords >= 250 ? 4 : 3) && linkers >= 3, label: paragraphs + ' paragraphs · ' + linkers + ' linking phrases', tip: 'Aim for clear paragraphs and varied linking (however, as a result, whereas…).' },
      { c: 'c3', ok: variety >= 55, label: variety + '% word variety', tip: variety >= 55 ? 'Good range of different words.' : 'Repeating the same words — try synonyms and paraphrase.' },
      { c: 'c4', ok: complex >= 4 && avgLen >= 12, label: complex + ' complex clauses · ' + avgLen + ' words per sentence', tip: 'Mix short sentences with relative and conditional clauses.' }
    ];
  }


  // ---------- Speaking: automatic estimate from the live transcript (approximate) ----------
  const FILLERS = /\b(um+|uh+|erm+|er|ah+|hmm+|you know|i mean|sort of|kind of)\b/gi;
  const SPEAK_COMPLEX = /\b(because|although|though|which|who|whose|whereas|while|unless|if|when|since|would|could|might|have been|has been|had been|used to|in order to|so that)\b/gi;
  function speechData(h) {
    if (!h || !h.answers) return null;
    let stats = {};
    try { stats = JSON.parse(h.answers.speechstats || '{}').p || {}; } catch (e) { stats = {}; }
    const parts = [0, 1, 2].map((i) => ({ i, text: String(h.answers['speech' + (i + 1)] || '').trim(), st: stats[i] || null })).filter((p) => p.text);
    if (!parts.length) return null;
    const text = parts.map((p) => p.text).join(' ');
    const words = text.toLowerCase().match(/[a-z']+/g) || [];
    const secs = parts.reduce((a, p) => a + (p.st && p.st.s ? p.st.s : words.length / 2), 0);
    const conf = parts.reduce((a, p) => a + (p.st && p.st.c ? p.st.c : 0), 0);
    const confN = parts.reduce((a, p) => a + (p.st && p.st.cn ? p.st.cn : 0), 0);
    const pauses = parts.reduce((a, p) => a + (p.st && p.st.lp ? p.st.lp : 0), 0);
    const fillerList = text.toLowerCase().match(FILLERS) || [];
    return { parts, text, words, secs: Math.max(1, secs), conf: confN ? conf / confN : null, pauses, fillers: fillerList };
  }
  function speakingEstimate(h) {
    const d = speechData(h);
    if (!d) return null;
    const W = d.words.length;
    if (W < 40) return { tooShort: true, words: W, data: d };
    const min = Math.max(d.secs, W / 3.2) / 60, wpm = Math.round(W / min);   // cap at ~190 wpm if timing is missing
    const fillerRatio = d.fillers.length / W, pausesPerMin = d.pauses / Math.max(min, 0.5);
    const clampB = (x) => Math.max(4, Math.min(9, Math.round(x)));
    let fc = wpm < 60 ? 4.5 : wpm < 80 ? 5.5 : wpm < 100 ? 6 : wpm < 120 ? 6.5 : wpm < 145 ? 7.2 : 7.6;
    if (fillerRatio > 0.08) fc -= 1; else if (fillerRatio > 0.04) fc -= 0.5;
    if (pausesPerMin > 2) fc -= 0.5;
    const longTurn = Math.max(...d.parts.map((p) => (p.text.match(/\S+/g) || []).length));
    if (longTurn >= 150) fc += 0.5;
    const content = d.words.filter((w) => w.length > 3);
    const variety = content.length ? new Set(content).size / content.length : 0;
    const advanced = d.words.filter((w) => w.length >= 8).length / W;
    let lr = variety > 0.75 && advanced > 0.1 ? 8 : variety > 0.65 && advanced > 0.07 ? 7 : variety > 0.55 ? 6 : 5;
    const complex = (d.text.match(SPEAK_COMPLEX) || []).length / W * 100;
    let gra = complex >= 7 ? 8 : complex >= 5 ? 7 : complex >= 3 ? 6 : 5;
    const p = d.conf == null ? null : d.conf >= 0.92 ? 8 : d.conf >= 0.85 ? 7 : d.conf >= 0.75 ? 6 : 5;
    const crit = { c1: clampB(fc), c2: clampB(lr), c3: clampB(gra), c4: p == null ? null : clampB(p) };
    const vals = Object.values(crit).filter((v) => v != null);
    const overall = roundBand(vals.reduce((a, b) => a + b, 0) / vals.length);
    const topFillers = Object.entries(d.fillers.reduce((m, f) => (m[f] = (m[f] || 0) + 1, m), {})).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([f, n]) => `“${f}” ×${n}`).join(', ');
    const tips = {
      c1: wpm < 90 ? `You spoke at about ${wpm} words per minute. Aim for 110–150 by linking ideas instead of stopping between sentences.` : fillerRatio > 0.04 ? `Good pace (${wpm} wpm), but fillers slowed you down${topFillers ? ': ' + topFillers : ''}. Pause silently instead.` : `Good pace (${wpm} wpm) with few fillers.${longTurn < 150 ? ' In Part 2, keep talking for the full two minutes.' : ''}`,
      c2: variety > 0.65 ? `Varied vocabulary (${Math.round(variety * 100)}% different words). Add a few topic-specific or idiomatic phrases to push higher.` : `You repeated many words (${Math.round(variety * 100)}% variety). Paraphrase: instead of repeating a word, use a synonym or describe it.`,
      c3: complex >= 5 ? `Good range of complex structures (${complex.toFixed(1)} per 100 words).` : `Mostly simple sentences. Add “because…”, “which…”, “if I had…”, “I used to…” to show range.`,
      c4: d.conf == null ? 'Not measured — your browser did not report recognition confidence.' : d.conf >= 0.85 ? `Clearly understood by speech recognition (${Math.round(d.conf * 100)}% confidence).` : `Speech recognition was unsure of some words (${Math.round(d.conf * 100)}% confidence). Slow down slightly and stress key words.`
    };
    return { crit, overall, tips, wpm, words: W, variety, complex, fillers: d.fillers.length, pauses: d.pauses, conf: d.conf, data: d };
  }

  window.Bands = { speakingEstimate, speechData, sessionBand, latestBands, overall, roundBand, fmtBand, CRITERIA, writingChecks };
})();
