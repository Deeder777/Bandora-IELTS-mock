/* Original Academic Writing and Speaking tasks for complete tickets. All chart data are fictional. */
(function(){
  'use strict';
  const checklist=['Task 1: Identify and summarise the key features; include a clear overview.','Task 1: Make accurate comparisons or describe the main stages without inventing information.','Task 2: Address every part of the question and support your position with reasons and examples.','Use clear paragraphs, varied vocabulary and a range of sentence structures.','Check grammar, spelling and punctuation. Task 1 needs at least 150 words; Task 2 at least 250.'];
  const chart=(title,labels,series,unit,kind='bar',suffix='%')=>({title,labels,series:series.map(([name,values])=>({name,values})),unit,kind,suffix,categoryLabel:'Category'});
  const instructions='Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words. Figures are invented for this practice task.';
  const essayEnd=' Give reasons for your answer and include relevant examples from your own knowledge or experience. Write at least 250 words.';
  const specifications=[
    [2,'The table shows the percentage of adults using three library services in the fictional town of Westhaven in 2010, 2018 and 2025.',
      chart('Library services in Westhaven',['2010','2018','2025'],[['Borrowing printed books',[68,54,46]],['Using study spaces',[22,35,49]],['Borrowing digital books',[5,28,57]]],'% of surveyed adults','table'),
      'Some people believe public libraries should mainly provide books. Others think they should offer a wide range of community services. Discuss both views and give your own opinion.'],
    [3,'The line graph shows the number of visitors to three museums in a fictional region between 2015 and 2025.',
      chart('Annual museum visitors',['2015','2017','2019','2021','2023','2025'],[['History museum',[120,125,140,80,145,160]],['Science museum',[80,105,135,70,170,210]],['Art museum',[150,145,155,90,140,145]]],'thousands of visitors','line',''),
      'Museums and art galleries should offer free admission to everyone. To what extent do you agree or disagree?'],
    [4,'The bar chart compares the percentage of households in a fictional country using three energy-saving measures in 2012 and 2025.',
      chart('Household energy-saving measures',['2012','2025'],[['Roof insulation',[35,62]],['Efficient lighting',[48,88]],['Solar water heating',[12,31]]],'% of households'),
      'In many places, households are being encouraged to use less energy. What difficulties can prevent people from doing this, and what measures could help?'],
    [5,'The diagram shows how used paper is processed into new cardboard at a fictional recycling facility. Describe the main stages of the process.',
      {process:{title:'From used paper to new cardboard',stages:['Collect used paper from homes and offices','Sort paper; remove plastic and metal','Mix sorted paper with water to produce pulp','Pass pulp through screens to remove remaining impurities','Press pulp between rollers to remove excess water','Heat and dry the sheets','Cut sheets and package the new cardboard']}},
      'Some people think manufacturers should be responsible for reducing packaging waste. Others believe consumers should make better choices when shopping. Discuss both views and give your own opinion.'],
    [6,'The two plans show a fictional community centre before and after redevelopment. Describe the main changes.',
      {plans:{title:'Elm Community Centre',before:{label:'Before redevelopment',cells:['Storage','Small classroom','Office','Main hall','Main hall','Kitchen','Entrance','Car park','Car park']},after:{label:'After redevelopment',cells:['Library room','Large classroom','Large classroom','Main hall','Main hall','Café','Entrance','Garden','Bicycle parking']},note:'Both plans have north at the top. The site boundary and main entrance remain unchanged. Adjacent repeated labels form one larger space.'}},
      'Local governments should spend more money improving existing public buildings than constructing new ones. To what extent do you agree or disagree?'],
    [7,'The table compares average weekly hours spent on three activities by adults in four age groups in a fictional survey.',
      chart('Weekly time use by age group',['18–29','30–44','45–59','60+'],[['Paid work',[30,38,34,8]],['Household tasks',[8,14,16,18]],['Leisure activities',[22,14,18,32]]],'hours per week','table',''),
      'More employers now allow staff to work from home for part of the week. Do the advantages of this development outweigh the disadvantages?'],
    [8,'The line graph shows the percentage of households with access to three communication services in a fictional country between 2005 and 2025.',
      chart('Household communication access',['2005','2010','2015','2020','2025'],[['Fixed telephone',[82,75,61,43,28]],['Broadband internet',[24,46,68,85,94]],['Mobile internet',[3,18,49,79,96]]],'% of households','line'),
      'Easy access to information on the internet means that memorising facts is no longer important in education. To what extent do you agree or disagree?'],
    [9,'The diagram shows a fictional system that collects rainwater from a school roof and prepares it for use in the school garden. Describe how the system works.',
      {process:{title:'Rainwater for a school garden',stages:['Rain falls on the school roof','Gutters carry water to a collection pipe','A mesh filter removes leaves and large debris','Water enters a covered storage tank','A pump moves water through a second filter','Water reaches drip irrigation pipes','Plants in the school garden receive the water'],note:'If the tank is full, excess water leaves through an overflow pipe and enters a soakaway. The treated water is used for irrigation, not drinking.'}},
      'Urban schools should give every student opportunities to learn outdoors. Why might this be useful, and what problems could schools face when providing such opportunities?'],
    [10,'The bar chart compares how students at a fictional university travelled to campus in 2010, 2018 and 2025. The percentages total 100 in each year.',
      chart('Main method of travelling to campus',['2010','2018','2025'],[['Car',[50,38,25]],['Bus or train',[30,37,40]],['Walking or cycling',[20,25,35]]],'% of students'),
      'Some people believe that cities should limit private car use in their centres. Others think people should be free to drive wherever they choose. Discuss both views and give your own opinion.']
  ];
  window.TicketWriting={};
  for(const [number,prompt,visual,essay] of specifications){
    const task={id:1,title:'Task 1',minutes:20,minWords:150,prompt:prompt+' '+instructions};
    if(visual.series)task.chart=visual;else Object.assign(task,visual);
    TicketWriting[number]={title:'Academic Writing',duration:3600,tasks:[task,{id:2,title:'Task 2',minutes:40,minWords:250,prompt:essay+essayEnd}],checklist};
  }
  window.TicketSpeaking={};
  const speech=[
    [5,'Books and stories',
      ['Do you work or study?','What kinds of things do you enjoy reading?','When do you usually have time to read?','Do you prefer printed books or reading on a screen? Why?','Did you enjoy listening to stories as a child?','Do you ever recommend books or films to friends?'],
      'Describe a story that you enjoyed reading or listening to.',
      ['Say what the story was about.','Explain when and how you discovered it.','Describe a character or event that you remember.','Explain why the story made an impression on you.'],
      'Would you like to read or hear this story again?',
      ['Why do people enjoy stories about imaginary worlds?','How can stories help children understand other people?','What makes an effective storyteller?','Do films encourage people to read the books they are based on?','Should schools let students choose all the books they study?','How might the ways people share stories change in the future?']],
    [6,'Food and traditions',
      ['What is your home town like?','Do you enjoy preparing food?','What food do you usually have when you are busy?','Did anyone teach you to cook when you were younger?','Do you prefer eating at home or in a restaurant?','Are there any foods you would like to learn to prepare?'],
      'Describe a meal that you shared with other people on a special occasion.',
      ['Say what the occasion was.','Explain where the meal took place and who was there.','Describe what was served.','Explain why you remember this meal.'],
      'Would you choose the same kind of meal for another celebration?',
      ['Why is food important at celebrations?','How have eating habits changed in recent decades?','Should children learn cooking at school?','What are the benefits of preserving traditional recipes?','Why do people sometimes choose convenience over healthy eating?','How can restaurants reduce the amount of food they waste?']],
    [7,'Work and achievement',
      ['Do you currently work or study?','Which part of your daily routine do you enjoy most?','Do you usually make plans for the week?','How do you feel when your plans change unexpectedly?','Do you prefer working alone or with a group?','What is something you would like to become better at?'],
      'Describe a goal that required you to work hard.',
      ['Say what you wanted to achieve.','Explain why the goal mattered to you.','Describe the steps you took and any difficulties.','Explain how you felt about the result.'],
      'Would you approach this goal differently if you started again?',
      ['How do people decide which goals are worth pursuing?','Is competition always a useful source of motivation?','What can employers do to recognise good work?','Why might a team achieve more than an individual?','Should schools place more emphasis on effort or results?','How can people learn from a goal they did not achieve?']],
    [8,'Nature and observation',
      ['Where do you live at the moment?','Is there a park or natural area near your home?','How often do you spend time outdoors?','What kind of weather do you enjoy most?','Did you learn about plants or animals as a child?','Would you like to spend more time in the countryside?'],
      'Describe an occasion when you noticed something interesting in nature.',
      ['Say where and when it happened.','Describe what you noticed.','Explain who was with you, if anyone.','Explain why the experience interested you.'],
      'Have you told anyone else about that experience?',
      ['Why do some people pay more attention to nature than others?','What can cities do to provide access to green spaces?','How useful are television programmes for teaching people about wildlife?','Should visitors be restricted in environmentally sensitive places?','What responsibilities do local communities have for protecting nature?','How could technology help people observe nature without disturbing it?']],
    [9,'Music and creativity',
      ['Do you work or study?','What kinds of music do you listen to?','When do you usually listen to music?','Have your musical tastes changed since childhood?','Do you enjoy making things by hand?','Is there a creative activity you would like to try?'],
      'Describe something creative that you made or helped to make.',
      ['Say what you made.','Explain why you decided to make it.','Describe the process and any help you received.','Explain how you felt when it was finished.'],
      'Do you still have or use what you made?',
      ['Why do people enjoy making things themselves?','Can creativity be taught?','How important are arts subjects in schools?','What effect can new technology have on traditional crafts?','Should public money support artists whose work is not commercially successful?','What makes a creative work meaningful to an audience?']],
    [10,'Learning and change',
      ['What do you like about the place where you live?','Do you enjoy trying new activities?','How do you usually learn how to do something unfamiliar?','Do you prefer written instructions or a demonstration?','What subject did you particularly enjoy at school?','Is there something you plan to learn in the next year?'],
      'Describe a change that improved your daily life.',
      ['Say what you changed.','Explain why you decided to make the change.','Describe any difficulties at first.','Explain how your life became better afterwards.'],
      'Would you recommend this change to someone else?',
      ['Why do people sometimes resist changes that could benefit them?','How can organisations help people adapt to new ways of working?','Is advice from older people always useful when making changes?','How do major technological changes affect education?','Should governments encourage people to change their daily habits?','What is the difference between a temporary trend and a lasting change?']]
  ];
  for(const [number,title,part1,cue,points,follow,discussion] of speech){
    TicketSpeaking[number]={title,duration:840,parts:[
      {title:'Part 1 · Introduction and familiar topics',duration:300,prompts:part1},
      {title:'Part 2 · Individual long turn',duration:240,prompts:[cue,...points,'Take one minute to prepare notes, then speak for one to two minutes.','Follow-up: '+follow]},
      {title:'Part 3 · Discussion',duration:300,prompts:discussion}
    ],checklist:[...PRACTICE.speaking.checklist]};
  }
})();
