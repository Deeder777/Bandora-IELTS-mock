/* Original Bandora mock. Parts 1 and 2 reuse our existing focused exercises. */
(function () {
  'use strict';
  const mc = (id, prompt, options, answer, explanation) => ({id,type:'mcq',prompt,options,answer,explanation});
  const text = (id, prompt, answer, explanation, acceptedAnswers=[]) => ({id,type:'text',prompt,answer,explanation,acceptedAnswers});
  const instructions = 'Write no more than TWO WORDS AND/OR A NUMBER for each answer.';
  const discussion = {
    title: 'Planning a student transport study',
    description: 'Two students discuss their research project. Questions 21–26: choose ONE answer. Questions 27–30: write no more than TWO WORDS AND/OR A NUMBER.',
    transcript: `Nina: We need to agree on the design of our transport study before we meet our tutor. At first I wanted to investigate why students choose this university, but that is much too broad.
Omar: Yes. The topic we finally agreed on is the difficulties students face when travelling to campus. We could include their choice of transport, but the main focus should be the problems they experience.
Nina: That will help us keep the project manageable. I had hoped to compare students at three universities, so we could see whether location makes a difference.
Omar: Our tutor said that would be interesting, but we would not have enough time to arrange access to three sites. It was the time limit, rather than the cost of travel, that persuaded me to stay with one university.
Nina: We should think carefully about whom we ask. My first idea was to send the questionnaire to the cycling club. They would probably reply quickly.
Omar: But most of them already cycle regularly. Their experiences might be useful, yet they would not represent students who travel by bus or walk. That is why we should recruit from several courses instead.
Nina: Agreed. Now, when should we collect responses? If we ask only at nine in the morning, we will miss people with later classes.
Omar: Let us collect responses at three different times of day. It will not guarantee a perfect sample, but it should include students with a wider range of schedules. We should keep a record of which time slot each response came from.
Nina: I tested the draft questionnaire on my flatmates. One question asked whether their journey was comfortable and affordable, and they did not know how to answer.
Omar: I can see why. A journey could be comfortable but expensive. We need to split that into two separate questions so that each response has a clear meaning.
Nina: Exactly. There is another issue with asking people about journey times. Some will be remembering a particularly bad day.
Omar: We should ask about their most recent journey, rather than their worst journey. That will make the task clearer. But even then the times will be estimates, not measurements. We need to acknowledge that limitation in our report.
Nina: What should we do before launching the questionnaire?
Omar: Run a pilot with eight students. That is enough for us to find unclear wording and check how long it takes. It is not our final sample size. I can ask some students who will not take part in the main study.
Nina: Our tutor also asked us to give everyone written information. I have drafted a consent form. It explains what the project is for and says that participation is voluntary.
Omar: Good. We should give them that consent form before they answer any questions. We do not need names on the questionnaire itself.
Nina: How shall we store the responses? It would be convenient to use the shared course folder.
Omar: That folder can be opened by everyone in the class. Let us use a password-protected spreadsheet that only we and our tutor can access. We can remove any accidentally included personal details before entering the data.
Nina: Finally, for the presentation, should we compare bus, bicycle and walking journeys using a pie chart?
Omar: A pie chart would show the proportion using each method, but not compare their average journey times clearly. Use a bar chart for those average times. We can add the number of responses for each method beside the bars, so people can see when a group is small.
Nina: That gives us a clear plan. I will revise the two confusing questions tonight, and you can organise the pilot. Then we can discuss the revised version with our tutor.`,
    questions: [
      mc(21,'What is the main focus of the students’ project?',['Problems travelling to campus','Reasons for choosing a university','The cost of running university buses'],'Problems travelling to campus','Omar says the agreed focus is the difficulties students face on journeys to campus.'),
      mc(22,'Why did they decide to study only one university?',['They could not afford travel','They had limited time to arrange access','Other universities refused permission'],'They had limited time to arrange access','The tutor’s concern was time for access arrangements, not travel cost or refusal.'),
      mc(23,'What is the problem with recruiting only from the cycling club?',['Members are unlikely to reply','Members do not travel to campus','Other transport users would be poorly represented'],'Other transport users would be poorly represented','Omar points out that regular cyclists would not represent students who walk or use buses.'),
      mc(24,'Why will they collect responses at different times?',['To include different student schedules','To measure changes in weather','To ask every student three times'],'To include different student schedules','Three time slots should include students whose classes start at different times.'),
      mc(25,'How will they improve the question about comfort and affordability?',['Remove all questions about cost','Split it into two questions','Ask for a longer written answer'],'Split it into two questions','A journey may be comfortable but expensive, so the two ideas need separate responses.'),
      mc(26,'What limitation will they acknowledge about journey times?',['Only bus journeys can be timed','Students will report estimates','They have no way to record responses'],'Students will report estimates','Even asking about the most recent journey produces estimated rather than measured times.'),
      text(27,'The pilot questionnaire will be tested with ______ students.','8','Omar proposes a pilot with eight students, separate from the main sample.',['eight']),
      text(28,'Before answering, participants receive a ______.','consent form','The written consent form explains the project and voluntary participation.'),
      text(29,'Responses will be stored in a password-protected ______.','spreadsheet','They reject the shared course folder and choose a restricted spreadsheet.'),
      text(30,'Average journey times will be compared using a ______.','bar chart','A bar chart is selected for comparing average times; the pie chart would show proportions.')
    ]
  };
  const lecture = {
    title: 'Designing a seed bank',
    description: 'An original lecture about a fictional seed-conservation project. Questions 31–40: write ONE WORD ONLY for each answer.',
    transcript: `Lecturer: Today I will describe the design of a small seed bank in a fictional conservation project. Our purpose is to examine the decisions involved in conserving plant material, rather than to prescribe a method suitable for every species. Different plants require different treatment, and a procedure that works for one collection may be unsuitable for another.
The first decision concerns where to collect seeds. In our project, the team chose several sites within the region. They wanted the collection to represent genetic diversity, rather than simply to contain a large number of seeds from one convenient location. A thousand seeds from a single plant would not necessarily provide the range of variation they were trying to preserve.
At each site, collectors completed a record before taking material away. Alongside the collection date and site code, they noted the habitat in which the parent plants were growing. This context could later help researchers interpret differences between samples. Without those records, the seeds would be much less useful, even if they remained alive in storage.
Back at the centre, each batch was cleaned. Staff removed pieces of leaf and other debris so that the stored material consisted of seeds rather than a mixture of seeds and unwanted fragments. Cleaning also made it easier to examine the batch. However, it did not guarantee that every seed was healthy, so it was followed by additional checks.
For the species selected in this project, the next stage was controlled drying. The team gradually reduced moisture before placing the seeds in storage. They did not assume that all species could tolerate the same degree of drying. Species known to be sensitive to this process were excluded from this particular collection and considered for other conservation methods.
Once the target condition was reached, staff sealed each batch in a container. A unique code on the label was essential because different seeds could look very similar. The code linked the container to the original field record. It was not sufficient to rely on a handwritten plant name, which might be abbreviated inconsistently or become difficult to read.
The containers were then placed in cold storage. A sensor continuously recorded temperature, and staff reviewed the record for unexpected changes. A brief inspection of the room could not reveal everything that had happened overnight. The continuous record therefore helped them detect problems that might otherwise go unnoticed.
The team also needed to know whether stored seeds could still produce seedlings. At scheduled intervals, a small sample was used in a germination test. Staff placed that sample under suitable conditions and recorded how many seeds began to grow. The test used part of the collection, so they had to balance the value of checking it against the need to retain enough material.
To reduce the risk of losing everything in a single accident, a duplicate sample was kept at a second location. Both collections carried the same reference code. This did not eliminate every possible risk, but it meant that a local equipment failure would not automatically destroy the entire stored batch.
The seed bank was not intended to replace conservation in the wild. One planned use of the collection was to support habitat restoration after damage, provided that the material was appropriate for the site. Planting stored seeds without considering local conditions could waste the material or create new problems. Storage was one part of a wider conservation programme.
Finally, the project could not operate indefinitely without support. Beyond the initial cost of freezers and containers, it required reliable funding for staff, monitoring and future testing. A collection that was carefully established but then neglected might lose value over time. The lesson is that maintaining a seed bank involves an ongoing commitment, not merely putting labelled packets into a cold room.`,
    questions: [
      text(31,'Collecting from several sites aimed to preserve genetic ______.','diversity','The lecturer contrasts genetic diversity with simply collecting many seeds from one plant.'),
      text(32,'Field records included the ______ where the parent plants grew.','habitat','Collectors recorded the habitat as well as the date and site code.'),
      text(33,'Cleaning removed leaves and other ______.','debris','The cleaning stage removed unwanted fragments described as debris.'),
      text(34,'Controlled drying reduced the seeds’ ______.','moisture','The team reduced moisture gradually before storage.'),
      text(35,'A unique ______ linked each container to its field record.','code','A reference code connected a container with the original collection information.'),
      text(36,'A sensor continuously measured the storage ______.','temperature','Continuous temperature records could reveal changes that happened overnight.'),
      text(37,'A ______ test checked whether stored seeds could begin to grow.','germination','The lecturer describes a germination test carried out on a small sample.'),
      text(38,'A ______ sample was kept at another location.','duplicate','Keeping a duplicate elsewhere reduced the risk from a local accident.'),
      text(39,'Stored seeds might support habitat ______ after damage.','restoration','Restoration is identified as one planned use, subject to local suitability.'),
      text(40,'Continuing operations required reliable ______ for staff and testing.','funding','The lecture ends by explaining the ongoing funding needed beyond the initial equipment purchase.')
    ]
  };
  const base1=TestLibrary.get('listening','listening-01').data;
  const base2=TestLibrary.get('listening','listening-03').data;
  const parts=[
    {...base1,description:'A volunteer asks about a community garden. '+instructions,questions:base1.questions.map(q=>({...q}))},
    {...base2,description:'A guide welcomes volunteers to a coastal field station. '+instructions,questions:base2.questions.map(q=>({...q,id:q.id+10}))},
    discussion,lecture
  ];
  const data={title:'Listening — Full mock · 40 questions',duration:1800,parts,
    description:'Four parts and 40 questions in one 30-minute session. Browser-generated audio; play each part separately. Parts 1–2 reuse the community garden and field station exercises.',
    questions:parts.flatMap(p=>p.questions),
    transcript:parts.map((p,i)=>`PART ${i+1} — ${p.title}\n\n${p.transcript}`).join('\n\n')};
  TestLibrary.sets.unshift({id:'listening-04',type:'listening',title:data.title,data,minutes:30,count:'40 questions',label:'FULL MOCK',source:'Bandora original',
    description:data.description,footer:'4 parts · Questions 1–40'});
})();
