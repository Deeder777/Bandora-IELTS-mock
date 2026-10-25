/* Reading tools and a review notebook. All learner text is stored locally as text. */
(function () {
  'use strict';
  const PREFIX = 'bandly-practice-tools-v1:';
  const $ = (selector, root = document) => root.querySelector(selector);
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const hash = value => { let n = 2166136261; for (const char of String(value)) { n ^= char.charCodeAt(0); n = Math.imul(n, 16777619); } return (n >>> 0).toString(36); };
  const storageKey = (scope, name) => PREFIX + encodeURIComponent(String(scope || 'guest')) + ':' + name;
  const read = (key, fallback) => { try { const value = JSON.parse(localStorage.getItem(key)); return value == null ? fallback : value; } catch { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } };
  let mountedController = null;
  let notebookController = null;

  function normalize(value) {
    const normalized = String(value || '').normalize('NFKC').toLowerCase().replace(/[’']/g, "'").trim().replace(/[.,;!?]+$/, '').replace(/[-–]/g, ' ').replace(/\s+/g, ' ');
    return ({ 'twenty four': '24', sixteen: '16' })[normalized] || normalized;
  }

  function correct(question, answer, checker) {
    if (typeof checker === 'function') return checker(question, answer);
    return [question.answer, ...(question.acceptedAnswers || [])].some(value => normalize(value) === normalize(answer));
  }

  function mergeRanges(ranges, length) {
    const sorted = (Array.isArray(ranges) ? ranges : []).filter(range => Array.isArray(range) && Number.isInteger(range[0]) && Number.isInteger(range[1]) && range[0] >= 0 && range[1] <= length && range[1] > range[0]).map(range => [range[0], range[1]]).sort((a, b) => a[0] - b[0]);
    const merged = [];
    for (const range of sorted) {
      const last = merged[merged.length - 1];
      if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
      else merged.push(range);
    }
    return merged;
  }

  function textPosition(element, offset) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node;
    let count = 0;
    let last = null;
    while ((node = walker.nextNode())) {
      last = node;
      if (offset <= count + node.length) return [node, offset - count];
      count += node.length;
    }
    return last && offset === count ? [last, last.length] : null;
  }

  function restoreRanges(paragraph, ranges, originalText) {
    // Never accept saved markup. Restore only offsets against the exact source text.
    paragraph.querySelectorAll('mark[data-practice-highlight]').forEach(mark => mark.replaceWith(...mark.childNodes));
    paragraph.normalize();
    if (paragraph.textContent !== originalText) return;
    for (const [start, end] of [...ranges].reverse()) {
      const from = textPosition(paragraph, start);
      const to = textPosition(paragraph, end);
      if (!from || !to) continue;
      const range = document.createRange();
      range.setStart(...from);
      range.setEnd(...to);
      const mark = document.createElement('mark');
      mark.dataset.practiceHighlight = '';
      mark.append(range.extractContents());
      range.insertNode(mark);
    }
  }

  function selectionRanges(paragraphs) {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) return [];
    const range = selection.getRangeAt(0);
    return paragraphs.flatMap((paragraph, index) => {
      if (!range.intersectsNode(paragraph)) return [];
      let start = 0;
      let end = paragraph.textContent.length;
      if (paragraph.contains(range.startContainer)) {
        const prefix = document.createRange();
        prefix.selectNodeContents(paragraph);
        prefix.setEnd(range.startContainer, range.startOffset);
        start = prefix.toString().length;
      }
      if (paragraph.contains(range.endContainer)) {
        const prefix = document.createRange();
        prefix.selectNodeContents(paragraph);
        prefix.setEnd(range.endContainer, range.endOffset);
        end = prefix.toString().length;
      }
      return end > start ? [{ index, range: [start, end] }] : [];
    });
  }

  function mount(context = {}) {
    mountedController?.abort();
    document.querySelectorAll('[data-practice-tools-ui]').forEach(element => element.remove());
    const active = context.active;
    const shell = $('.exam-shell');
    if (!active || active.paused || !shell) return;
    mountedController = new AbortController();
    const { signal } = mountedController;
    const scope = context.storageScope || 'guest';
    const preferencesKey = storageKey(scope, 'preferences');
    const preferences = read(preferencesKey, {});
    const safePreferences = preferences && typeof preferences === 'object' && !Array.isArray(preferences) ? preferences : {};
    const panels = [$('.passage-panel', shell), $('.question-panel', shell)].filter(Boolean);

    panels.forEach((panel, index) => {
      const paneName = panel.classList.contains('passage-panel') ? 'passage' : 'questions';
      const label = paneName === 'passage' ? (active.type === 'reading' ? 'Passage text size' : 'Task text size') : 'Response text size';
      const toolbar = document.createElement('div');
      toolbar.className = 'pt-pane-tools';
      toolbar.dataset.practiceToolsUi = '';
      toolbar.innerHTML = `<label for="pt-size-${index}"><span aria-hidden="true">Aa</span><span class="pt-visually-hidden">${label}</span></label><select id="pt-size-${index}" aria-label="${label}"><option value="1">Standard text</option><option value="1.15">Larger text</option><option value="1.3">Largest text</option></select>`;
      const select = $('select', toolbar);
      select.value = ['1', '1.15', '1.3'].includes(String(safePreferences[paneName])) ? String(safePreferences[paneName]) : '1';
      panel.style.setProperty('--pt-text-scale', select.value);
      panel.classList.add('pt-font-panel');
      select.addEventListener('change', () => {
        panel.style.setProperty('--pt-text-scale', select.value);
        safePreferences[paneName] = select.value;
        write(preferencesKey, safePreferences);
      }, { signal });
      panel.prepend(toolbar);
    });

    const notesKey = storageKey(scope, `notes:${active.type}:${active.started || active.id || 'current'}:${active.part || 0}`);
    const notes = read(notesKey, '');
    const noteButton = document.createElement('button');
    noteButton.type = 'button';
    noteButton.className = 'pt-notes-trigger';
    noteButton.dataset.practiceToolsUi = '';
    noteButton.setAttribute('aria-haspopup', 'dialog');
    noteButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h14v18H5zM8 8h8M8 12h8M8 16h5"/></svg>My notes<span class="pt-note-dot" hidden></span>';
    const notesHost = $('.exam-heading', shell) || shell;
    notesHost.append(noteButton);
    const dialog = document.createElement('dialog');
    dialog.className = 'pt-notes-drawer';
    dialog.dataset.practiceToolsUi = '';
    dialog.setAttribute('aria-labelledby', 'pt-notes-title');
    const partName = active.type === 'reading' ? `Passage ${Number(active.part || 0) + 1}` : active.type === 'writing' ? `Task ${Number(active.part || 0) + 1}` : active.type === 'speaking' ? `Part ${Number(active.part || 0) + 1}` : 'Listening practice';
    dialog.innerHTML = `<div class="pt-drawer-head"><div><span class="eyebrow muted">YOUR WORKING SPACE</span><h2 id="pt-notes-title">My notes</h2></div><button type="button" class="pt-close" aria-label="Close notes">×</button></div><p class="pt-notes-context">${escapeHTML(partName)} · This session</p><label for="pt-notes-text">Key words, evidence, and ideas</label><textarea id="pt-notes-text" maxlength="20000" placeholder="Keep a useful phrase, note a question, or plan your answer…"></textarea><div class="pt-notes-foot"><span role="status" id="pt-notes-status">Saved on this browser</span><span id="pt-notes-count"></span></div><p class="pt-notes-tip">These private notes are saved separately from your answers. The test timer keeps running while you write.</p>`;
    shell.append(dialog);
    const textarea = $('textarea', dialog);
    textarea.value = typeof notes === 'string' ? notes : '';
    const updateNotes = () => {
      $('.pt-note-dot', noteButton).hidden = !textarea.value.trim();
      $('#pt-notes-count', dialog).textContent = `${textarea.value.length.toLocaleString()} / 20,000`;
    };
    updateNotes();
    noteButton.addEventListener('click', () => { dialog.showModal(); textarea.focus(); }, { signal });
    $('.pt-close', dialog).addEventListener('click', () => dialog.close(), { signal });
    dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } }, { signal });
    textarea.addEventListener('input', () => {
      $('#pt-notes-status', dialog).textContent = write(notesKey, textarea.value) ? 'Saved on this browser' : 'Storage unavailable. Keep this tab open.';
      updateNotes();
    }, { signal });

    if (active.type !== 'reading') return;
    const panel = $('.passage-panel', shell);
    const passage = (context.passages || window.READING?.passages)?.[active.part || 0];
    if (!panel || !passage?.paragraphs) return;
    const candidates = Array.from(panel.children).filter(element => element.tagName === 'P');
    const paragraphs = passage.paragraphs.map(text => candidates.find(paragraph => paragraph.textContent === text));
    if (paragraphs.some(paragraph => !paragraph)) return;
    const signature = JSON.stringify([passage.title, passage.paragraphs]);
    const highlightsKey = storageKey(scope, `passage:${hash(signature)}`);
    const stored = read(highlightsKey, {});
    const ranges = passage.paragraphs.map((text, index) => mergeRanges(stored?.signature === signature ? stored.ranges?.[index] : [], text.length));
    let pending = [];
    const toolbar = document.createElement('div');
    toolbar.className = 'pt-highlight-toolbar';
    toolbar.dataset.practiceToolsUi = '';
    toolbar.setAttribute('role', 'group');
    toolbar.setAttribute('aria-label', 'Reading highlights');
    toolbar.innerHTML = '<div class="pt-highlight-actions"><button type="button" class="pt-highlight-add" disabled><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 17 3 3 12-12-3-3zM2 22h12M12 9l3 3"/></svg>Highlight selection</button><button type="button" class="pt-highlight-clear">Clear highlights</button></div><span class="pt-highlight-hint" role="status">Select passage text to keep a highlight.</span>';
    const paneToolbar = $('.pt-pane-tools', panel);
    paneToolbar.insertAdjacentElement('afterend', toolbar);
    const addButton = $('.pt-highlight-add', toolbar);
    const clearButton = $('.pt-highlight-clear', toolbar);
    const hint = $('.pt-highlight-hint', toolbar);
    const restore = () => {
      paragraphs.forEach((paragraph, index) => restoreRanges(paragraph, ranges[index], passage.paragraphs[index]));
      clearButton.disabled = !ranges.some(items => items.length);
    };
    const storeHighlights = () => write(highlightsKey, { signature, ranges });
    restore();
    const updateSelection = () => {
      if (!panel.isConnected || dialog.open) return;
      const next = selectionRanges(paragraphs);
      if (!next.length && toolbar.contains(document.activeElement)) return;
      pending = next;
      addButton.disabled = !pending.length;
      toolbar.classList.toggle('has-selection', Boolean(pending.length));
      hint.textContent = pending.length ? 'Selection ready. Choose Highlight selection to save it.' : 'Select passage text to keep a highlight.';
    };
    document.addEventListener('selectionchange', updateSelection, { signal });
    [addButton, clearButton].forEach(button => button.addEventListener('pointerdown', event => event.preventDefault(), { signal }));
    addButton.addEventListener('click', () => {
      if (!pending.length) return;
      pending.forEach(({ index, range }) => { ranges[index] = mergeRanges([...ranges[index], range], passage.paragraphs[index].length); });
      restore();
      const storedOK = storeHighlights();
      pending = [];
      window.getSelection()?.removeAllRanges();
      addButton.disabled = true;
      toolbar.classList.remove('has-selection');
      hint.textContent = storedOK ? 'Highlight saved. It will be here when you return.' : 'Highlight added. Browser storage is unavailable.';
    }, { signal });
    clearButton.addEventListener('click', () => {
      ranges.forEach(items => items.splice(0));
      restore();
      hint.textContent = storeHighlights() ? 'Highlights cleared for this passage.' : 'Highlights cleared here. Browser storage is unavailable.';
    }, { signal });
  }

  function notebookItems(context) {
    const histories = (Array.isArray(context.history) ? context.history : []).filter(item => item && ['reading', 'listening'].includes(item.type)).slice().sort((a, b) => (Number(b.date) || 0) - (Number(a.date) || 0));
    const seen = new Set();
    const items = [];
    
    for (const history of histories) {
      const questions = typeof context.questionsFor === 'function' ? context.questionsFor(history.type, history) : [];
      for (const question of questions) {
        // A focused retry only updates questions that were actually in that session.
        if (Array.isArray(history.questionIds) && !history.questionIds.includes(question.id)) continue;
        const questionKey = `${history.type}:${history.setId && !history.setId.endsWith('-01') ? history.setId + ':' : ''}${question.id}:${hash(question.prompt)}`;
        if (seen.has(questionKey)) continue;
        seen.add(questionKey);
        const answer = history.answers?.[question.id];
        if (correct(question, answer, context.isCorrect)) continue;
        items.push({ question, answer: String(answer ?? ''), type: history.type, date: Number(history.date) || 0, key: `${questionKey}:${hash(history.id || history.date || '')}` });
      }
    }
    return { items, sessions: histories.length };
  }

  function reviewNotebookHTML(context = {}) {
    const { items, sessions } = notebookItems(context);
    const scope = context.storageScope || 'guest';
    const stored = read(storageKey(scope, 'reviewed'), {});
    const reviewed = stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
    const reviewedCount = items.filter(item => reviewed[item.key] === true).length;
    const pendingCount = items.length - reviewedCount;
    return `<section class="pt-notebook" data-review-notebook data-storage-scope="${escapeHTML(scope)}"><div class="page-intro"><div class="eyebrow muted">YOUR REVIEW NOTEBOOK</div><h1>Make the next answer stronger.</h1><p>Bring your missed answers together. Understand the evidence, then try again.</p></div><div class="pt-notebook-stats"><div class="card"><span>To revisit</span><strong data-notebook-pending>${pendingCount}</strong><small>A clear place to start</small></div><div class="card"><span>Reviewed</span><strong data-notebook-reviewed>${reviewedCount}</strong><small>Ideas you have revisited</small></div><div class="card"><span>Practice sessions</span><strong>${sessions}</strong><small>Reading and Listening</small></div></div>${items.length ? `<div class="pt-notebook-controls"><div class="pt-notebook-filters" role="group" aria-label="Filter notebook by skill"><button type="button" data-notebook-skill="all" aria-pressed="true" class="active">All skills</button><button type="button" data-notebook-skill="reading" aria-pressed="false">Reading</button><button type="button" data-notebook-skill="listening" aria-pressed="false">Listening</button></div><label>Show<select data-notebook-status aria-label="Filter notebook by review status"><option value="pending"${pendingCount ? ' selected' : ''}>To revisit</option><option value="reviewed">Reviewed</option><option value="all"${pendingCount ? '' : ' selected'}>All answers</option></select></label></div><p class="pt-notebook-explainer">Each question appears from your latest attempt. A correct answer on a later attempt removes it from this notebook.</p><div class="pt-notebook-list">${items.map(item => {
      const isReviewed = reviewed[item.key] === true;
      const date = item.date ? new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recent practice';
      return `<article class="pt-notebook-item card${isReviewed ? ' is-reviewed' : ''}" data-notebook-item data-skill="${item.type}" data-reviewed="${isReviewed}" data-review-key="${escapeHTML(item.key)}"><div class="pt-notebook-item-head"><div><span class="pt-skill-label ${item.type}">${item.type === 'reading' ? 'Reading' : 'Listening'}</span><span class="pt-question-label">Question ${escapeHTML(item.question.id)} · ${escapeHTML(date)}</span></div><span class="pt-review-status">${isReviewed ? 'Reviewed' : 'To revisit'}</span></div><h2>${escapeHTML(item.question.prompt)}</h2><div class="pt-answer-compare"><div><span>Your answer</span><p>${escapeHTML(item.answer.trim() ? item.answer : 'Not answered')}</p></div><div><span>Correct answer</span><p>${escapeHTML(item.question.answer)}</p></div></div><div class="pt-evidence"><strong>Why this answer works</strong><p>${escapeHTML(item.question.explanation || 'Review the source material and compare it with the question.')}</p></div><div class="pt-notebook-item-foot"><span>Understand it. Apply it. Keep going.</span><button type="button" class="pt-review-toggle" data-review-toggle aria-pressed="${isReviewed}">${isReviewed ? '↶ Revisit this answer' : '✓ Mark reviewed'}</button></div></article>`;
    }).join('')}</div><div class="pt-notebook-filter-empty card" data-notebook-empty hidden><strong>No answers in this view.</strong><p>Choose another skill or review status to see more.</p></div><p class="pt-notebook-count" data-notebook-count role="status"></p>` : `<div class="pt-notebook-empty card"><div class="pt-notebook-empty-icon" aria-hidden="true">✓</div><h2>${sessions ? 'A fresh page. Well earned.' : 'Every mistake can teach you something.'}</h2><p>${sessions ? 'Your latest Reading and Listening answers are all correct. New missed answers will appear here after your next practice.' : 'Complete a Reading or Listening practice. Your missed and unanswered questions will appear here with the answer and explanation.'}</p><button class="btn primary" data-action="nav" data-page="tests">Explore practice tests <span aria-hidden="true">→</span></button></div>`}<p class="pt-notebook-storage">Review marks are saved on this browser. Marking an answer reviewed does not change your score.</p></section>`;
  }

  function bindNotebook() {
    notebookController?.abort();
    const root = $('[data-review-notebook]');
    if (!root) return;
    notebookController = new AbortController();
    const { signal } = notebookController;
    const key = storageKey(root.dataset.storageScope, 'reviewed');
    const stored = read(key, {});
    const reviewed = stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
    let skill = 'all';
    const rows = Array.from(root.querySelectorAll('[data-notebook-item]'));
    const filterSelect = $('[data-notebook-status]', root);
    if (!filterSelect) return;
    const filter = () => {
      let visible = 0;
      for (const row of rows) {
        const statusMatch = filterSelect.value === 'all' || (filterSelect.value === 'reviewed') === (row.dataset.reviewed === 'true');
        row.hidden = !(statusMatch && (skill === 'all' || row.dataset.skill === skill));
        if (!row.hidden) visible++;
      }
      const reviewedCount = rows.filter(row => row.dataset.reviewed === 'true').length;
      $('[data-notebook-pending]', root).textContent = rows.length - reviewedCount;
      $('[data-notebook-reviewed]', root).textContent = reviewedCount;
      $('[data-notebook-empty]', root).hidden = visible > 0;
      $('[data-notebook-count]', root).textContent = `${visible} ${visible === 1 ? 'answer' : 'answers'} in this view`;
    };
    root.addEventListener('click', event => {
      const skillButton = event.target.closest('[data-notebook-skill]');
      if (skillButton) {
        skill = skillButton.dataset.notebookSkill;
        root.querySelectorAll('[data-notebook-skill]').forEach(button => { const selected = button === skillButton; button.classList.toggle('active', selected); button.setAttribute('aria-pressed', String(selected)); });
        filter();
      }
      const toggle = event.target.closest('[data-review-toggle]');
      if (!toggle) return;
      const row = toggle.closest('[data-notebook-item]');
      const nowReviewed = row.dataset.reviewed !== 'true';
      reviewed[row.dataset.reviewKey] = nowReviewed;
      const savedOK = write(key, reviewed);
      row.dataset.reviewed = String(nowReviewed);
      row.classList.toggle('is-reviewed', nowReviewed);
      toggle.setAttribute('aria-pressed', String(nowReviewed));
      toggle.textContent = nowReviewed ? '↶ Revisit this answer' : '✓ Mark reviewed';
      $('.pt-review-status', row).textContent = nowReviewed ? 'Reviewed' : 'To revisit';
      filter();
      // Keep keyboard focus usable when the current filter hides the reviewed card.
      if (row.hidden) (rows.find(item => !item.hidden)?.querySelector('[data-review-toggle]') || filterSelect).focus();
      if (!savedOK) $('[data-notebook-count]', root).textContent += ' · Browser storage is unavailable; this review mark lasts for this view.';
    }, { signal });
    filterSelect.addEventListener('change', filter, { signal });
    filter();
  }

  window.PracticeTools = { mount, reviewNotebookHTML, bindNotebook };
})();
