/* Bandora original exercises. Fictional case studies; no Cambridge test content is reproduced. */
(function () {
  'use strict';
  const text = (id, prompt, answer, explanation, acceptedAnswers = []) => ({ id, type: 'text', prompt, answer, explanation, acceptedAnswers });
  const tf = (id, prompt, answer, explanation) => ({ id, type: 'tfng', prompt, answer, explanation });
  const mc = (id, prompt, options, answer, explanation) => ({ id, type: 'mcq', prompt, options, answer, explanation });
  const sets = [];
  function add(id, type, data, description, label) {
    sets.push({ id, type, data, title: data.title, description, label, minutes: data.duration / 60,
      count: type === 'reading' ? `${data.passages.reduce((n, p) => n + p.questions.length, 0)} questions` : type === 'listening' ? `${data.questions.length} questions` : type === 'writing' ? '2 tasks' : '3 parts',
      source: 'Bandora original' });
  }
  add('reading-01', 'reading', window.READING, 'Urban forests, memory and ocean mapping. Three passages with answer explanations.', 'FULL SECTION');
  add('listening-01', 'listening', window.PRACTICE.listening, 'Follow a volunteer’s enquiry about joining a community garden.', 'FOCUSED PRACTICE');
  add('writing-01', 'writing', window.PRACTICE.writing, 'A chart report and discussion essay with word counts and self-review.', 'FULL SECTION');
  add('speaking-01', 'speaking', window.PRACTICE.speaking, 'Your neighbourhood, learning practical skills and lifelong education.', 'GUIDED PRACTICE');

  add('reading-02', 'reading', {
    title: 'Repair cafés: more than a quick fix', duration: 1200,
    passages: [{
      title: 'Repair cafés: more than a quick fix',
      subtitle: 'An original fictional case study. Questions 1–4: True / False / Not given. Questions 5–8: choose one answer. Questions 9–12: use ONE WORD ONLY from the passage.',
      paragraphs: [
        'When a household appliance stops working, buying a replacement can appear easier than arranging a repair. Yet the price of a new product is not the only consideration. Some owners want to understand why an object failed, while others attach personal value to something they have used for years. Repair cafés bring these owners together with volunteers who know how to diagnose faults. The visitors usually stay during the repair, making the event an opportunity to learn rather than simply a collection point for broken goods.',
        'In the fictional town of Bellford, a neighbourhood group opened a monthly repair café in a library meeting room. The organisers initially considered charging a fixed entrance fee to cover materials. They rejected that idea because it could discourage people from bringing inexpensive objects. Instead, entry remained free, with a box for voluntary donations. The library provided the room without charge. Visitors booked appointments to reduce queues, although a few spaces were reserved for people who arrived without booking.',
        'The group soon discovered that the number of objects repaired was an incomplete measure of success. A damaged radio might require a replacement component that was no longer available. Even so, its owner could leave with a diagnosis, an explanation of the problem and advice on avoiding similar damage. Volunteers therefore recorded three outcomes separately: completed repairs, diagnoses without repairs and referrals to specialist services. Counting all three as successful repairs would have made the café look more effective than it was.',
        'Safety also shaped the work. Before any electrical item was plugged in, a qualified volunteer inspected its cable and casing. Volunteers did not accept microwave ovens because of the hazards associated with their internal components. They also declined work for which they lacked suitable equipment. These limits sometimes disappointed visitors, but organisers explained that enthusiasm was no substitute for training. A sign at the booking desk listed the categories of objects that could be assessed.',
        'A survey after six months found that visitors particularly valued the explanations volunteers gave them. Several respondents said they now checked simple causes, such as loose connections, before assuming an appliance needed replacing. The survey did not establish whether these habits continued over subsequent years. Nor could it show how many new purchases had actually been avoided: a repaired object might otherwise have remained unused in a cupboard rather than been replaced. For this reason, the organisers resisted converting repair totals into precise estimates of environmental savings.',
        'The café also faced a less visible problem: knowledge was concentrated in a small number of experienced volunteers. When two regular repairers were absent, waiting times increased sharply. In response, organisers introduced paired sessions in which a newcomer worked beside an experienced volunteer. They created a notebook of common faults and useful diagnostic steps, but avoided treating it as a universal instruction manual. Two appliances that looked identical could have different internal designs.',
        'Bellford’s experience suggests that the value of a repair café cannot be captured by a single total. Repairing objects matters, but so do the skills participants develop and the limits they learn to recognise. The organisers planned to repeat their visitor survey and compare appointment records across different seasons. Their aim was to understand where the café helped most, rather than to claim that volunteer repair could replace every professional service.'
      ],
      questions: [
        tf(1, 'Visitors usually leave their objects at repair cafés and return after the work is finished.', 'False', 'Paragraph 1 says visitors usually stay during the repair.'),
        tf(2, 'Bellford’s organisers decided not to charge a fixed entrance fee.', 'True', 'Paragraph 2 explains that they rejected a fixed fee and kept entry free.'),
        tf(3, 'The library’s room was larger than the organisers’ first choice of venue.', 'Not given', 'The passage identifies the venue but does not compare room sizes.'),
        tf(4, 'Every object assessed at Bellford was successfully repaired.', 'False', 'Paragraph 3 separates repairs from diagnoses without repairs and specialist referrals.'),
        mc(5, 'Why did organisers record three different outcomes?', ['To describe the work more accurately', 'To calculate a fee for each visitor', 'To identify the most popular appliance brand'], 'To describe the work more accurately', 'Paragraph 3 says treating all outcomes as repairs would overstate the café’s effectiveness.'),
        mc(6, 'What does the passage say about electrical safety?', ['Owners inspected their own items', 'Inspection occurred before an item was plugged in', 'Only recently purchased items were accepted'], 'Inspection occurred before an item was plugged in', 'Paragraph 4 puts the qualified volunteer’s inspection before connection to power.'),
        mc(7, 'Why were precise environmental savings not calculated?', ['Visitors refused to complete the survey', 'The café had repaired too few items', 'It was unclear how many replacement purchases had been prevented'], 'It was unclear how many replacement purchases had been prevented', 'Paragraph 5 explains that an unrepaired object might have stayed in a cupboard rather than been replaced.'),
        mc(8, 'What was the main purpose of paired sessions?', ['To share expertise with newer volunteers', 'To let visitors repair two objects at once', 'To remove the need for safety training'], 'To share expertise with newer volunteers', 'Paragraph 6 describes newcomers working beside experienced repairers after absences exposed a concentration of knowledge.'),
        text(9, 'Free entry was supported by voluntary ______.', 'donations', 'Paragraph 2 mentions a box for voluntary donations.'),
        text(10, 'Microwave ______ were not accepted for repair.', 'ovens', 'Paragraph 4 identifies microwave ovens as excluded because of internal hazards.'),
        text(11, 'Common faults and diagnostic steps were recorded in a ______.', 'notebook', 'Paragraph 6 describes the notebook created to share practical knowledge.'),
        text(12, 'Organisers planned to compare appointment records across different ______.', 'seasons', 'The final paragraph specifies comparisons across seasons.')
      ]
    }]
  }, 'A fictional community repair project. Practise evidence, inference and one-word completion.', 'FOCUSED READING');

  add('reading-03', 'reading', {
    title: 'The city after dark', duration: 1200,
    passages: [{
      title: 'The city after dark',
      subtitle: 'An original fictional case study. Questions 1–4: True / False / Not given. Questions 5–8: choose one answer. Questions 9–12: use ONE WORD ONLY from the passage.',
      paragraphs: [
        'A brightly lit street may seem reassuring, but the amount of light alone does not determine how well people can see. Its direction, distribution and contrast with the surrounding area also matter. A lamp that shines directly into someone’s eyes can make a darker patch beyond it harder to distinguish. This means that reducing unnecessary light and improving visibility are not always opposing goals. The challenge is to illuminate the places where people need to see while avoiding light that serves little practical purpose.',
        'The fictional city of Norchester explored this challenge through a small lighting trial. Planners selected two residential streets with similar layouts. On one street, old lamps were replaced with shielded fittings that directed light downwards. The second street retained its existing lamps for comparison. The council kept the lighting schedule unchanged on both streets so that any differences would not simply reflect one street having fewer hours of illumination. The trial ran for twelve weeks during autumn.',
        'Before work began, researchers asked residents to mark areas where they found it difficult to see the pavement. Complaints were not always about darkness. Some residents described bright light entering bedrooms; others said the contrast between lamps and the spaces between them was uncomfortable. The new fittings were therefore selected for a more even spread of light. The project was not designed to make every point on the street equally bright, but to reduce abrupt changes along the walking route.',
        'Electricity use fell on the street with the new fittings. However, the researchers cautioned against treating this as a result of shielding alone. The replacement lamps were also more efficient than the old ones, and the trial did not isolate the contribution of each change. A future experiment would need to compare fittings with the same efficiency but different shielding. This distinction mattered because the council wanted to understand which changes delivered which benefits before investing in a wider programme.',
        'Residents’ responses were mixed. Many welcomed the reduction in light entering their bedrooms, while a smaller group felt that the new street looked less welcoming from a distance. During guided walks, participants could generally identify pavement obstacles at least as well as before. Nevertheless, the sample was too small to establish whether the change affected road accidents. Researchers also warned that a short autumn study could not predict residents’ experiences throughout the year.',
        'The team monitored insects near the lamps on selected evenings. Counts varied greatly with temperature and wind, so a low count on a single evening could not be attributed confidently to a particular fitting. To make comparisons more useful, observations were taken on both streets on the same nights. Even then, researchers avoided claiming that the results represented every insect species in the city. Their findings applied to the locations and observation periods actually studied.',
        'The council’s next step was consultation rather than immediate replacement of every street lamp. Planners shared electricity records, walking observations and resident comments at a public meeting. They also invited residents who had not joined the guided walks to respond. The trial showed the value of combining measured performance with people’s experience: neither electricity bills nor opinions alone could answer every question about a city’s lighting.'
      ],
      questions: [
        tf(1, 'Increasing the amount of light always improves visibility.', 'False', 'Paragraph 1 explains that glare can make darker areas harder to distinguish.'),
        tf(2, 'The two trial streets followed the same lighting schedule.', 'True', 'Paragraph 2 states that the schedule remained unchanged on both streets.'),
        tf(3, 'Most Norchester residents preferred warm-coloured lamps.', 'Not given', 'The passage gives no preference survey about the colour of light.'),
        tf(4, 'The trial demonstrated that shielding alone caused the reduction in electricity use.', 'False', 'Paragraph 4 says improved efficiency was another change and its contribution was not isolated.'),
        mc(5, 'Why was a second street included?', ['To provide a comparison', 'To test a different lighting schedule', 'To accommodate residents who moved away'], 'To provide a comparison', 'The second street retained existing lamps for comparison.'),
        mc(6, 'What was one aim when selecting the new fittings?', ['To make every location equally bright', 'To reduce sudden changes in brightness along the pavement', 'To illuminate the interiors of nearby homes'], 'To reduce sudden changes in brightness along the pavement', 'Paragraph 3 distinguishes a more even spread from making every point equally bright.'),
        mc(7, 'What could the guided walks establish?', ['That road accidents had become less common', 'That every resident preferred the new fittings', 'That participants generally identified obstacles at least as well as before'], 'That participants generally identified obstacles at least as well as before', 'Paragraph 5 describes obstacle identification but says the sample could not establish an effect on accidents.'),
        mc(8, 'What is the main point of the final paragraph?', ['Residents’ opinions should replace measurements', 'Several kinds of evidence should inform lighting decisions', 'The council should immediately replace all lamps'], 'Several kinds of evidence should inform lighting decisions', 'The council combined measured performance with residents’ experiences before deciding on wider changes.'),
        text(9, 'The new shielded fittings directed light ______.', 'downwards', 'Paragraph 2 specifies the direction of light from shielded fittings.'),
        text(10, 'The twelve-week trial took place during ______.', 'autumn', 'Paragraph 2 gives both the duration and the season.'),
        text(11, 'Insect counts varied with wind and ______.', 'temperature', 'Paragraph 6 names temperature and wind as influences on counts.'),
        text(12, 'The next step chosen by the council was ______.', 'consultation', 'The final paragraph says consultation preceded any city-wide replacement.')
      ]
    }]
  }, 'Evaluate a fictional street-lighting trial through True / False / Not given, multiple choice and completion.', 'FOCUSED READING');

  const listeningDescription = 'Original focused listening with browser-generated English audio. Read the questions first. Write no more than TWO WORDS AND/OR A NUMBER for each answer.';
  add('listening-02', 'listening', {
    title: 'Booking a photography workshop', duration: 600, description: listeningDescription,
    transcript: `Receptionist: Good afternoon, Northbank Arts Centre. How can I help?
Caller: Hello. I would like to join a beginner photography workshop. I found a leaflet, but I think it might be out of date.
Receptionist: It could be. We have moved some sessions. What would you like to know?
Caller: First, which day is the beginner class? The leaflet says Thursday.
Receptionist: It was Thursday last term. The beginner workshop is now on Tuesday. Thursday is for the advanced group, so make sure you choose the Tuesday session.
Caller: That works for me. Is it an evening class?
Receptionist: Yes. Doors open at six, but teaching starts at six thirty. Please arrive a little earlier if you need help setting up your camera. We finish at eight.
Caller: Which room should I go to?
Receptionist: Studio four. Studio two is being painted, so we have moved upstairs. There are signs beside the lift, and someone at reception can show you the way.
Caller: How much does the workshop cost?
Receptionist: The standard price is forty-five pounds. If you have a valid student card, it is thirty pounds instead.
Caller: I am not a student, so I will pay the standard price. Is any equipment included?
Receptionist: You can borrow a camera at no extra charge. We have six available, but you must reserve one when you book. You do need to bring your own memory card, because we want you to take your photographs home afterwards.
Caller: I have a camera, but no stand. Will that be a problem?
Receptionist: No. We provide a tripod for each pair of learners during the practical activities. You will not need to bring one. We also have spare batteries for our loan cameras.
Caller: How many people will be in the group?
Receptionist: We used to accept fifteen, but that was too many for everyone to get individual help. There is now a maximum of twelve participants. We already have eight bookings for next week.
Caller: What is the first practical exercise?
Receptionist: You will begin by photographing shadows. It is a useful way to notice the direction of light. Portraits come later, after you have practised controlling exposure. There is no homework before the first session.
Caller: Do you go outside at all?
Receptionist: Yes, if the weather is reasonable, the group walks to the riverside to take photographs. The park is further away and would take too much of the session to reach. If it rains heavily, we have indoor exercises instead.
Caller: I would like to book. What if I need to cancel?
Receptionist: Please let us know at least two days before the workshop to receive a refund. With less notice, we can move your booking to a later date if a place is available, but we cannot refund it.
Caller: That is clear. I will use the booking form this afternoon.
Receptionist: Thank you. Remember to bring your memory card and arrive before the teaching starts.`,
    questions: [
      text(1, 'The beginner workshop is now held on ______.', 'Tuesday', 'The receptionist corrects the old Thursday schedule to Tuesday.'),
      text(2, 'Teaching begins at ______ in the evening.', '6:30', 'Doors open at six; teaching starts at six thirty.', ['6.30', 'six thirty', '18:30', '18.30', '6:30 pm', '6.30 pm']),
      text(3, 'The class meets in Studio ______.', '4', 'Studio four is used while Studio two is being painted.', ['four']),
      text(4, 'The standard workshop price is £______.', '45', 'Forty-five pounds is the standard fee; thirty pounds is the student rate.', ['forty-five', 'forty five', '45.00']),
      text(5, 'Learners must bring their own ______ to store their photographs.', 'memory card', 'A memory card must be brought so learners can take their photographs home.'),
      text(6, 'Each pair of learners can use a provided ______ to support the camera.', 'tripod', 'The receptionist says a tripod is provided for each pair.'),
      text(7, 'The maximum number of participants is ______.', '12', 'The limit was reduced from fifteen to twelve; eight is the current number of bookings.', ['twelve']),
      text(8, 'The first practical exercise involves photographing ______.', 'shadows', 'Learners begin with shadows; portraits come later.'),
      text(9, 'In suitable weather, the group walks to the ______.', 'riverside', 'The riverside is used because the park is too far away.'),
      text(10, 'A refund requires cancellation at least ______ before the workshop.', 'two days', 'At least two days’ notice is needed for a refund.', ['2 days'])
    ]
  }, 'A booking enquiry with corrected dates, prices and equipment details. Ten completion questions.', 'FOCUSED LISTENING');

  add('listening-03', 'listening', {
    title: 'Welcome to the coastal field station', duration: 600, description: listeningDescription,
    transcript: `Guide: Welcome to the coastal field station. Before you begin your first day of volunteering, I will explain our schedule and a few practical arrangements. There is quite a lot to remember, so you may want to take notes.
We start each morning with a briefing at nine fifteen. Breakfast is available earlier, from eight, but please be ready for the briefing by nine fifteen. That is when we assign groups and explain any changes caused by the weather.
Meet your team in the courtyard. We previously gathered in the dining room, but it became too crowded when the kitchen staff were clearing breakfast. The courtyard has enough space for everyone and a covered area if it is raining.
Today you will be working on the beach. Please wear waterproof boots. Ordinary trainers become wet very quickly, even when the weather looks dry. We have a small number of spare boots, but cannot guarantee that every size will be available.
You will work in teams of three. One person records observations while the other two search the marked area. Rotate these roles during the session so that everyone gains experience of recording as well as collecting.
The main task today is counting plastic fragments. We are not collecting shells for the display or measuring sand depth; those are projects for another group. Use the marked squares to keep your search area consistent.
For each square, record your count on the green sheet. There are blue sheets in your folder too, but those are for tomorrow’s water observations. Please do not mix the two, because the columns are arranged differently.
At the end of the morning, take labelled samples to the laboratory. Do not leave them in the classroom, even if you are going there after lunch. Laboratory staff will check the labels and explain how the samples will be stored.
Lunch is at twelve thirty. It was originally planned for one, but the afternoon tide means we need to start the second session earlier. If you have any dietary requirements that you have not already told us about, speak to the kitchen team this morning.
The afternoon activity depends on the wind. If it is too windy for work on the shore, we will sort photographs indoors. This is useful work rather than spare time: the photographs help us compare the beach at different points during the year.
Finally, if you become separated from your group or need assistance, contact the duty officer. The number is printed on the card inside your folder. Please save it on your phone now. Your team leader is your usual contact for questions about the task, but the duty officer coordinates help when it is needed.
That is everything for the moment. Please check your boots, collect your folder, and make sure you know which team you are in. We will meet in the courtyard shortly.`,
    questions: [
      text(1, 'The daily briefing starts at ______.', '9:15', 'The briefing is at nine fifteen; eight is the start of breakfast.', ['9.15', 'nine fifteen', '09:15', '9:15 am', '9.15 am']),
      text(2, 'Teams meet in the ______.', 'courtyard', 'The meeting point moved from the dining room to the courtyard.'),
      text(3, 'Volunteers should wear waterproof ______.', 'boots', 'Waterproof boots are required because trainers get wet.'),
      text(4, 'Each team contains ______ people.', '3', 'Teams consist of three people who rotate roles.', ['three']),
      text(5, 'Today’s main task is counting ______.', 'plastic fragments', 'The guide distinguishes plastic fragments from shells and sand-depth measurements.'),
      text(6, 'Counts should be recorded on the ______ sheet.', 'green', 'Green sheets are used today; blue sheets are for tomorrow’s water observations.'),
      text(7, 'Labelled samples must be taken to the ______.', 'laboratory', 'Samples go to the laboratory, not the classroom.', ['lab']),
      text(8, 'Lunch has been moved to ______.', '12:30', 'Lunch is now twelve thirty rather than one.', ['12.30', 'twelve thirty', '12:30 pm', '12.30 pm']),
      text(9, 'In strong wind, volunteers will sort ______ indoors.', 'photographs', 'Sorting photographs is the indoor alternative when wind prevents shore work.', ['photos']),
      text(10, 'Volunteers needing assistance should contact the ______.', 'duty officer', 'The duty officer coordinates help; the team leader normally handles task questions.')
    ]
  }, 'Follow a volunteer briefing and complete notes about schedules, equipment and fieldwork.', 'FOCUSED LISTENING');

  function speaking(id, title, part1, cue, detail, part3) {
    add(id, 'speaking', { title, duration: 840, checklist: [...window.PRACTICE.speaking.checklist],
      parts: [
        { title: 'Part 1 · Familiar topics', duration: 300, prompts: part1 },
        { title: 'Part 2 · Long turn', duration: 240, prompts: [cue, ...detail, 'Take one minute to prepare, then speak for one to two minutes.'] },
        { title: 'Part 3 · Discussion', duration: 300, prompts: part3 }
      ] }, `${title}. Original prompts across all three parts, with optional recording and self-review.`, 'GUIDED SPEAKING');
  }
  speaking('speaking-02', 'Places and journeys',
    ['How do you usually travel to work or study?', 'What do you enjoy about your daily journey?', 'Do you prefer visiting familiar places or new places? Why?', 'Is there somewhere nearby you would like to visit more often?'],
    'Describe a place you visited that was different from what you expected.',
    ['Say where it was and why you went there.', 'Describe what you expected before the visit.', 'Explain what surprised you and how you felt about it.'],
    ['Why do people sometimes have unrealistic expectations of destinations?', 'How can tourism affect the lives of local residents?', 'Should cities invest more in transport for visitors or for residents?', 'How might the way people travel change in the future?', 'Can an ordinary journey be as memorable as an expensive holiday? Why?']);
  speaking('speaking-03', 'Technology and everyday decisions',
    ['What device do you use most often during the day?', 'When do you prefer doing something without technology?', 'How do you usually decide which new product to buy?', 'Do you enjoy explaining technology to other people?'],
    'Describe a time when you found a simple solution to an everyday problem.',
    ['Say what the problem was and when it happened.', 'Explain how you found the solution.', 'Describe why the solution worked and what you learned.'],
    ['Why do people sometimes choose complicated solutions when simple ones exist?', 'How can schools help students become better problem solvers?', 'Does easy access to information make people more independent?', 'Who should help people who find new technology difficult to use?', 'What are the advantages and disadvantages of relying on automated decisions?']);
  speaking('speaking-04', 'Community and shared spaces',
    ['What public place do you use most often?', 'Do you prefer quiet places or lively places when meeting friends?', 'Have the public spaces near your home changed recently?', 'What would you like to improve in your neighbourhood?'],
    'Describe a public place where you enjoyed spending time.',
    ['Say where the place was and when you went there.', 'Describe what you did and who was with you.', 'Explain what made the experience enjoyable.'],
    ['Why are shared public spaces important in cities?', 'How should a city decide between building a park and a car park?', 'Who should be responsible for keeping public spaces clean?', 'How can public spaces meet the needs of different age groups?', 'Do online communities reduce the need for places where people can meet in person?']);

  window.TestLibrary = Object.freeze({
    sets,
    get(type, id) { return sets.find(s => s.type === type && s.id === id) || sets.find(s => s.type === type && s.id === type + '-01'); },
    key(record) { return this.get(record.type, record.setId)?.id || record.type; }
  });
  window.OfficialResources = [
    { provider: 'Cambridge English', title: 'IELTS preparation & sample paper', skills: 'Reading · Listening · Speaking · Writing', description: 'Cambridge’s preparation hub includes a free sample paper, a test-taker guide and links to its published preparation materials.', url: 'https://www.cambridgeenglish.org/exams-and-tests/ielts/preparation/' },
    { provider: 'IELTS', title: 'Official Academic sample tasks', skills: 'Reading · Listening · Speaking · Writing', description: 'Explore official sample tasks, answer keys and Listening materials. Choose your skill on the IELTS page.', url: 'https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test' },
    { provider: 'British Council', title: 'Free practice & sample tests', skills: 'Reading · Listening · Speaking · Writing', description: 'Find free practice resources and test preparation options from the British Council.', url: 'https://takeielts.britishcouncil.org/prepare/ielts-free-practice-mock-tests' }
  ];
})();
