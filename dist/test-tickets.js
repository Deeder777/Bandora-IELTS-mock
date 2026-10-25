/* Stable IDs keep all ten tickets and their saved answers separate. */
(function(){
  'use strict';
  const clone=value=>JSON.parse(JSON.stringify(value));
  Object.assign(TicketListening,window.TicketListeningExtraA,window.TicketListeningExtraB);
  window.TestTickets=[];
  for(let n=1;n<=10;n++){
    const number=String(n).padStart(2,'0'),code=String(100+n);
    const reading=n===1?clone(READING):clone((window.TicketReadingA||{})[n]||(window.TicketReadingB||{})[n]);
    const listening=n===1?clone(TestLibrary.get('listening','listening-04').data):clone(TicketListening[n]);
    const writing=n===1?clone(PRACTICE.writing):clone(TicketWriting[n]);
    const speaking=n<=4?clone(TestLibrary.get('speaking','speaking-'+String(n).padStart(2,'0')).data):clone(TicketSpeaking[n]);
    if(n>=2&&n<=4){
      const extra={
        2:[['Do you usually plan a journey in advance?','What do you enjoy about the area where you live?'],'Would you recommend visiting this place to a friend?','How can travellers learn about a place without visiting it?'],
        3:[['Did you enjoy solving puzzles when you were younger?','Who do you usually ask when you need practical advice?'],'Have you used this solution again since then?','Why can experience sometimes be more useful than specialist knowledge?'],
        4:[['Do you know many people in your neighbourhood?','What kind of place do you choose when you want to relax?'],'Would you like to visit this public place again?','Should local residents have a say in how public spaces are designed?']
      }[n];
      speaking.parts[0].prompts.push(...extra[0]);speaking.parts[1].prompts.push('Follow-up: '+extra[1]);speaking.parts[2].prompts.push(extra[2]);
    }
    const sections={};
    for(const [type,data] of Object.entries({listening,reading,writing,speaking})){
      const id=type+'-'+code;
      data.title=`Ticket ${number} · ${type==='writing'?'Academic Writing':type==='reading'?'Academic Reading':type[0].toUpperCase()+type.slice(1)}`;
      const count=type==='reading'||type==='listening'?'40 questions':type==='writing'?'2 tasks':'3 parts';
      TestLibrary.sets.push({id,type,data,title:data.title,count,minutes:data.duration/60,label:'COMPLETE TICKET SECTION',source:'Bandora original',ticket:n,description:type==='reading'?data.passages.map(p=>p.title).join(' · '):type==='listening'?data.parts.map(p=>p.title).join(' · '):type==='writing'?'Two complete Academic tasks with visual information and an essay prompt.':'Familiar topics, a cue card and a connected discussion.',footer:type==='listening'?'4 parts · Generated audio':type==='reading'?'3 full passages':'Self-review'});
      sections[type]=id;
    }
    TestTickets.push({number,title:'Test ticket '+number,theme:'All four Academic IELTS skills in one place',topics:reading.passages.map(p=>p.title),sections});
  }
})();
