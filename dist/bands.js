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
  // Strict, examiner-style estimate. Calibrated so that only clearly advanced speech reaches 7+.
  const COMMON_ERRORS = [
    /\b(he|she|it) (don't|have|do not|go|want|like|make|think)\b/g, /\bi (is|are|has|goes|wants|likes)\b/g, /\b(they|we|you) (is|was|has|goes)\b/g,
    /\bi am agree\b/g, /\bmore (better|easier|bigger|faster|cheaper|worse)\b/g, /\b(informations|advices|furnitures|knowledges|equipments|homeworks|peoples|childrens|stuffs)\b/g,
    /\b(did|didn't|does|doesn't|can|can't|will|should|must) (went|goes|came|saw|was|did|made|bought|had)\b/g, /\bmost (best|biggest|important thing)\b/g,
    /\bi (go|went) to (home)\b/g, /\b(very|so) (much )?(enjoy|like)\b/g, /\bexplain me\b/g, /\bdiscuss about\b/g
  ];
  const STRUCTURES = {
    relative: /\b(which|who|whom|whose|where) \w+/,
    conditional: /\bif (i|you|we|they|he|she|it|people|someone)\b.*?\b(would|will|could|might|had)\b|\bif i were\b|\bunless\b/,
    perfect: /\b(have|has|had|'ve|'d) (been|got|made|seen|done|gone|had|lived|worked|studied|learned|learnt|tried|never|always|already|just|\w+ed)\b/,
    passive: /\b(is|are|was|were|be|been|being) (\w+ed|made|done|seen|known|built|given|taken|taught|held|told|brought)\b/,
    modal: /\b(might|could|should|would|must) (have|be|probably|definitely|\w+)\b/,
    contrast: /\b(although|though|whereas|even though|despite|in spite of|on the other hand|however)\b/,
    habit: /\b(used to|tend to|would usually|i'd usually)\b/,
    purpose: /\b(in order to|so that|so as to)\b/,
    cleft: /\b(what i (really )?(like|love|mean|find)|the (thing|reason|main reason) (is|why))\b/,
    comparison: /\b(\w+er than|more \w+ than|less \w+ than|as \w+ as|the (most|least) \w+)\b/
  };
  const IDIOMS = /\b(to be honest|as far as i('m| am) concerned|on the whole|by and large|it goes without saying|when it comes to|a great deal of|in the long run|it depends on|from my perspective|tend to|to some extent|i'd say|nowadays|broaden (my|their|our) horizons|time-consuming|cutting-edge|work-life balance|in a nutshell|first and foremost|all in all|not to mention|let alone|the thing is|i'm (really )?keen on|over the moon|once in a blue moon|hit the books|a piece of cake|keep in touch|look forward to|get the hang of|make the most of|take for granted|on the go)\b/g;
  const BASIC = new Set('the a an and but or so because very really good bad nice thing things like just also too much many lot lots of is are was were be been have has had do does did go goes went get got make made it this that these those i you he she we they my your our their me him her us them there here what when where why how yes no not can will would could should people time day place big small happy sad important interesting beautiful'.split(' '));
  function mattr(words, win) {
    if (words.length <= win) return new Set(words).size / Math.max(1, words.length);
    let sum = 0, n = 0;
    for (let i = 0; i + win <= words.length; i += 5) { sum += new Set(words.slice(i, i + win)).size / win; n++; }
    return sum / n;
  }
  function speakingEstimate(h) {
    const d = speechData(h);
    if (!d) return null;
    const W = d.words.length;
    if (W < 60) return { tooShort: true, words: W, data: d };
    const lower = d.text.toLowerCase();
    const timed = d.parts.some((p) => p.st && p.st.s > 5);
    const min = timed ? Math.max(d.secs, W / 3.2) / 60 : null;
    const wpm = timed ? Math.round(W / min) : null;
    const fillerRatio = d.fillers.length / W;
    const pausesPerMin = timed ? d.pauses / Math.max(min, 0.5) : 0;
    const longTurn = Math.max(...d.parts.map((p) => (p.text.match(/\S+/g) || []).length));
    const partsDone = d.parts.length;

    // Fluency & coherence
    let fc = !timed ? 4.5 : wpm < 70 ? 4 : wpm < 90 ? 4.5 : wpm < 105 ? 5 : wpm < 120 ? 5.5 : wpm < 135 ? 6 : wpm < 150 ? 6.5 : 7;
    if (fillerRatio > 0.06) fc -= 1; else if (fillerRatio > 0.03) fc -= 0.5;
    if (pausesPerMin > 1.5) fc -= 1; else if (pausesPerMin > 0.7) fc -= 0.5;
    const linkers = (lower.match(/\b(firstly|secondly|moreover|furthermore|however|on the other hand|as a result|for example|for instance|in addition|apart from that|having said that|what's more|in contrast|consequently|overall|actually|i mean)\b/g) || []).length;
    if (linkers / W * 100 >= 1.5 && fc >= 6) fc += 0.5;
    if (longTurn >= 220) fc += 0.5; else if (longTurn < 120) fc = Math.min(fc, 5.5);

    // Lexical resource
    const mt = mattr(d.words, 50);
    const content = d.words.filter((w) => w.length > 3 && !BASIC.has(w));
    const advShare = content.filter((w) => w.length >= 8).length / W;
    const basicShare = d.words.filter((w) => BASIC.has(w)).length / W;
    const idioms = (lower.match(IDIOMS) || []).length;
    let lr = mt < 0.62 ? 4 : mt < 0.68 ? 4.5 : mt < 0.73 ? 5 : mt < 0.77 ? 5.5 : mt < 0.81 ? 6 : mt < 0.85 ? 6.5 : mt < 0.88 ? 7 : 7.5;
    if (advShare >= 0.18) lr += 0.5; else if (advShare < 0.08) lr -= 0.5;
    if (basicShare > 0.6) lr -= 0.5;
    if (idioms >= 3) lr += 0.5; else if (idioms === 0) lr = Math.min(lr, 6);

    // Grammatical range & accuracy
    const sentencesLike = lower.split(/[.!?]+|\b(?:and then|and|but|so)\b/);
    const found = Object.keys(STRUCTURES).filter((k) => sentencesLike.some((x) => STRUCTURES[k].test(x)) || STRUCTURES[k].test(lower));
    const kinds = found.length;
    let gra = kinds <= 3 ? 4.5 : kinds === 4 ? 5 : kinds === 5 ? 5.5 : kinds === 6 ? 6 : kinds === 7 ? 6.5 : kinds === 8 ? 7 : kinds === 9 ? 7.5 : 8;
    const errors = COMMON_ERRORS.reduce((a, re) => a + (lower.match(re) || []).length, 0);
    const errRate = errors / W * 100;
    if (errRate >= 2) gra -= 1.5; else if (errRate >= 1) gra -= 1; else if (errors >= 2) gra -= 0.5;

    // Pronunciation (speech-recognition confidence is a weak signal; never let it carry the score)
    let p = d.conf == null ? null : d.conf >= 0.95 ? 7 : d.conf >= 0.9 ? 6.5 : d.conf >= 0.83 ? 6 : d.conf >= 0.75 ? 5.5 : d.conf >= 0.65 ? 5 : 4.5;
    if (p != null) p = Math.min(p, fc + 1);

    // Global caps: not enough speech or skipped parts cannot score high
    let cap = 9;
    if (W < 150) cap = 5; else if (W < 250) cap = 5.5; else if (W < 400) cap = 6.5;
    if (partsDone < 3) cap = Math.min(cap, partsDone === 1 ? 5 : 6);
    const crit = {};
    [['c1', fc], ['c2', lr], ['c3', gra], ['c4', p]].forEach(([k, v]) => { crit[k] = v == null ? null : Math.max(4, Math.min(8, Math.floor(v + 0.25))); });
    const vals = Object.values(crit).filter((v) => v != null);
    let overall = roundBand(vals.reduce((a, b) => a + b, 0) / vals.length);
    overall = Math.min(overall, cap);

    const topFillers = Object.entries(d.fillers.reduce((m, f) => (m[f] = (m[f] || 0) + 1, m), {})).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([f, n]) => `“${f}” ×${n}`).join(', ');
    const missing = Object.keys(STRUCTURES).filter((k) => !found.includes(k));
    const capNote = cap < 9 ? ` Score capped at ${cap}: ${W < 400 ? `only ${W} words recognised (a full test is usually 400+).` : ''}${partsDone < 3 ? ` Only ${partsDone} of 3 parts answered.` : ''}` : '';
    const tips = {
      c1: (!timed ? 'Speaking time was not measured, so pace could not be rewarded. Use live analysis while you answer. ' : `About ${wpm} words per minute${pausesPerMin > 0.7 ? `, with ${d.pauses} long pauses` : ''}. Band 7+ needs 130–160 wpm with almost no hesitation. `) + (fillerRatio > 0.03 ? `Too many fillers${topFillers ? ' (' + topFillers + ')' : ''}. ` : '') + (longTurn < 220 ? `Your longest answer was ${longTurn} words; a strong Part 2 is about 250–300.` : 'Good extended Part 2 answer.') + capNote,
      c2: `Word variety ${Math.round(mt * 100)}% (band 7 needs ~85%+), ${Math.round(advShare * 100)}% less-common words, ${idioms} idiomatic phrase${idioms === 1 ? '' : 's'}. ` + (idioms < 3 ? 'Use natural collocations like “when it comes to”, “to some extent”, “make the most of”.' : 'Keep using precise, less common vocabulary.'),
      c3: `${kinds} of 10 structure types used${errors ? `, ${errors} likely grammar error${errors === 1 ? '' : 's'} detected` : ''}. ` + (missing.length ? `Missing: ${missing.slice(0, 4).join(', ')}. Band 7 needs a wide mix used accurately.` : 'Wide range — focus on accuracy.'),
      c4: d.conf == null ? 'Not measured — your browser did not report recognition confidence.' : `Speech recognition confidence ${Math.round(d.conf * 100)}%. This is only a rough signal; work on word stress, intonation and clear word endings.`
    };
    return { crit, overall, tips, wpm: wpm == null ? '—' : wpm, words: W, variety: mt, complex: kinds, fillers: d.fillers.length, pauses: d.pauses, conf: d.conf, cap, data: d };
  }

  window.Bands = { speakingEstimate, speechData, sessionBand, latestBands, overall, roundBand, fmtBand, CRITERIA, writingChecks };
})();
