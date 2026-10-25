/* Complete test tickets are the default library view. Sections retain their own timers. */
(function(){
  'use strict';
  let view='tickets',query='';
  const focusedPage=testsPage;
  const order=['listening','reading','writing','speaking'];
  const selected=()=>TestTickets.filter(t=>`${t.title} ${t.theme} ${t.topics.join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  function latest(setId){return saved.history.find(h=>h.setId===setId&&(!h.questionIds||h.questionIds.length===40))}
  function ticketCards(){return selected().map(t=>{
    const done=order.filter(type=>latest(t.sections[type])).length;
    const running=active&&order.some(type=>t.sections[type]===active.setId);
    const next=order.find(type=>!latest(t.sections[type]))||'listening';
    return `<article class="ticket-card card"><div class="ticket-card-head"><span class="eyebrow">ACADEMIC IELTS · ORIGINAL MOCK</span><span class="tag green">${done}/4 completed</span></div><div class="ticket-title"><span>${t.number}</span><div><h2>${esc(t.title)}</h2><p>${esc(t.theme)}</p></div></div><p class="ticket-topics">${t.topics.map(esc).join(' · ')}</p><div class="ticket-sections">${order.map(type=>{
      const h=latest(t.sections[type]),s=TestLibrary.get(type,t.sections[type]);
      return `<button data-action="intro" data-type="${type}" data-set="${s.id}" data-mode="exam" class="ticket-section"><span>${icon(modules[type].icon)}<strong>${names[type]}</strong></span><small>${s.count} · ${s.minutes} min</small><em>${h?(h.total?`${h.score}/${h.total} correct`:'Completed · self-review'):'Start section'} ${icon('arrow')}</em></button>`;
    }).join('')}</div><div class="ticket-card-foot"><span>4 sections · 80 scored questions + Writing & Speaking</span>${running?button('Resume ticket '+icon('arrow'),'resume','primary'):button((done===4?'Retake ticket':done?'Continue ticket':'Start full ticket')+' '+icon('arrow'),'intro','primary',`data-type="${next}" data-set="${t.sections[next]}" data-mode="exam"`)}</div></article>`;
  }).join('')||'<div class="card empty"><h2>No ticket matches that topic.</h2><p>Try a ticket number or clear your search.</p></div>'}
  testsPage=function(){
    if(view==='focused')return `<div class="ticket-view-switch"><button class="btn secondary" data-ticket-view="tickets">← Back to 10 full test tickets</button></div>${focusedPage()}`;
    return `<div class="workspace-heading"><div><div class="eyebrow">TEN TICKETS. EVERY SECTION.</div><h1>Choose your full test.</h1><p>Each ticket: Listening 40 · Reading 40 · Writing 2 tasks · Speaking 3 parts.</p></div></div><div class="ticket-guide card"><div><strong>One ticket contains the whole Academic practice test.</strong><p>Listening 30 min → Reading 60 min → Writing 60 min → Speaking 14 min. Start in order, or open any section. Each section saves separately; continue from its result page.</p><p class="small muted">Original practice, not an official IELTS paper. Listening uses generated voices. Writing and Speaking use self-review; Speaking has no live examiner. Section breaks and audio timing differ from a real exam.</p></div><button class="text-link" data-ticket-view="focused">Short exercises & individual sections ${icon('arrow')}</button></div>${active?`<div class="resume-strip card"><div><strong>Your saved session</strong><p>${esc(dataFor(active.type).title)} · ${fmt(remaining())} remaining</p></div>${button('Resume','resume','primary small-btn')}</div>`:''}<label class="library-search ticket-search">${icon('target')}<input id="ticket-query" type="search" value="${esc(query)}" placeholder="Search tickets or topics…" aria-label="Search full test tickets"></label><div id="ticket-cards" class="ticket-grid">${ticketCards()}</div>`;
  };
  const originalResult=renderResult;
  renderResult=function(){
    originalResult();
    const h=saved.history.find(h=>h.id===resultId),ticket=h&&TestTickets.find(t=>Object.values(t.sections).includes(h.setId));
    if(!ticket)return;
    const next=order[order.indexOf(h.type)+1];
    const panel=document.createElement('section');panel.className='ticket-result-next card';
    panel.innerHTML=`<div><span class="eyebrow">${esc(ticket.title)}</span><h2>${next?'Next: '+names[next]:'Speaking section saved'}</h2><p>${next?'Your '+names[h.type].toLowerCase()+' session is saved. Continue this ticket when you are ready.':'Return to the ticket library to see your completed sections and choose another test.'}</p></div>${next?button('Continue to '+names[next]+' '+icon('arrow'),'intro','primary',`data-type="${next}" data-set="${ticket.sections[next]}" data-mode="${h.mode==='exam'?'exam':'practice'}"`):button('View all tickets','nav','primary','data-page="tests"')}`;
    $('#main')?.prepend(panel);
  };
  document.addEventListener('click',e=>{const b=e.target.closest('[data-ticket-view]');if(!b)return;e.preventDefault();view=b.dataset.ticketView;go('tests')});
  document.addEventListener('input',e=>{if(e.target.id!=='ticket-query')return;query=e.target.value;$('#ticket-cards').innerHTML=ticketCards()});
})();
