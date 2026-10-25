/* Bandora · authored Reading tasks (matching headings, word-box summaries, matching information, Yes / No / Not given).
   passage: 0-based index. from: first question number. Items: [prompt, answer, explanation]. */
window.BandoraReadingTasks = (function () {
  const H = (from, headings, answers, why) => ({ passage: 1, from, kind: 'headings', headings, items: answers.map((a, i) => ['Paragraph ' + 'ABCDEFGH'[i], a, why[i]]) });
  const W = (from, heading, words, items) => ({ passage: 1, from, kind: 'wordbox', heading, words, items });
  const I = (from, items) => ({ passage: 2, from, kind: 'matchinfo', items });
  const Y = (from, items) => ({ passage: 2, from, kind: 'ynng', items });
  return {
    1: [
      H(14, ['Mixing different types of problem', 'Why rereading should be avoided completely', 'Turning the ideas into a simple routine', 'The gap between feeling familiar and being able to recall', 'How checking answers gives practice direction', 'The benefits of digital study tools', 'Spreading practice over time', 'Preparing for the way knowledge will be used', 'What counts as retrieval practice', 'Measuring memory in the laboratory'],
        ['iv', 'ix', 'v', 'vii', 'i', 'viii', 'iii'],
        ['Familiarity versus retrieval; ease is an imperfect guide.', 'Defines retrieval practice: an attempt before consulting the material.', 'Feedback and comparison with a reliable source give the cycle direction.', 'Spaced practice distributes study across time.', 'Interleaving mixes examples of different types.', 'Practice should match the eventual task (using a concept in new situations).', 'A practical routine combining the ideas.']),
      W(23, 'Learning that lasts', ['shorter', 'reliable', 'distributed', 'contrasting', 'longer', 'digital', 'concentrated', 'similar'], [
        ['If the delay before practice is so long that nothing can be recalled, a ______ interval may help.', 'shorter', 'Paragraph D: additional study or a shorter interval may help.'],
        ['Answers produced from memory should be checked against a ______ source, so that mistakes and omissions are found.', 'reliable', 'Paragraph C: comparing an answer with a reliable source.'],
        ['Study opportunities work better when they are ______ across time rather than concentrated in one session.', 'distributed', 'Paragraph D: "distributed across time rather than concentrated".'],
        ['Learners can study ______ examples to see why a concept applies to one case but not another.', 'contrasting', 'Paragraph F: examine contrasting examples.']]),
      I(27, [
        ['a description of how one system covers a wide strip of seabed on each pass', 'C', 'Paragraph C: a multibeam system maps a swath.'],
        ['a reference to the work involved in handling large amounts of data', 'E', 'Paragraph E: more data to collect, process and store.'],
        ['the reason why a measured travel time represents twice the distance', 'B', 'Paragraph B: the pulse travels down and back.'],
        ['the importance of recording how and when measurements were made', 'F', 'Paragraph F: metadata.'],
        ['a description of mapping as a process that is never finished', 'G', 'Paragraph G: an ongoing process of improvement.']]),
      Y(36, [
        ['Readers of an ocean map should consider how its information was gathered.', 'Yes', 'Paragraph A: it requires asking how the underlying information was collected.'],
        ['Satellite data has made surveys by ships unnecessary.', 'No', 'Paragraph D: a detailed local investigation may still require a vessel.'],
        ['Unusual measurements should always be removed from survey data.', 'No', 'Paragraph F: removing every irregularity would be unwise.'],
        ['Multibeam surveys cost more than single-beam surveys.', 'Not given', 'Cost is never compared.'],
        ['Values estimated by software should look the same as measured values.', 'No', 'Paragraph G: a useful map distinguishes measured from estimated information.']])
    ],
    2: [
      H(14, ['Using the memories of former workers', 'Why ceremonial dress attracted more attention', 'Weighing the cost of taking samples', 'What a garment can and cannot tell us', 'The limits of photographing garments', 'Restoring garments to their original appearance', 'Recording objects before interpreting them', 'A new approach to accepting donations', 'When written accounts change the story', 'Looking closely without causing damage'],
        ['iv', 'vii', 'x', 'iii', 'ix', 'v', 'i', 'viii'],
        ['Details do not explain themselves; material versus appealing story.', 'Individual records first, interpretations added separately.', 'Examination without cutting or dismantling.', 'Sampling removes part of the object, so it must be justified.', 'A letter changed the interpretation of a pocket.', 'Photographs hide linings and cannot be trusted for colour.', 'Former garment workers commented on objects.', 'The collecting policy changed what donors were asked.']),
      W(22, 'Examining working clothes', ['storage', 'label', 'magnification', 'scale', 'texture', 'location', 'ownership', 'colour', 'sunlight'], [
        ['Staff used lighting and ______ to examine stitching closely.', 'magnification', 'Paragraph C.'],
        ['A record was kept of every ______ from which material was sampled.', 'location', 'Paragraph D: the archive kept a record of every location sampled.'],
        ['A ______ in each photograph helped viewers judge size.', 'scale', 'Paragraph F.'],
        ['Digital images were not a reliable replacement for direct ______ comparison.', 'colour', 'Paragraph F.'],
        ['New questions for donors covered repair, reuse and ______.', 'storage', 'Paragraph H.']]),
      I(27, [
        ['examples of the invented services used in the study', 'B', 'Paragraph B: a bicycle loan scheme and a community workshop.'],
        ['a need to separate acceptable alternative wording from mistakes', 'F', 'Paragraph F: legitimate alternative wording also needed to be distinguished.'],
        ['a list of details that reviewers were asked to check', 'E', 'Paragraph E: names, numbers, conditions and relationships.'],
        ['a recommendation about reporting suspected problems', 'G', 'Paragraph G: staff need a clear route for reporting problems.']]),
      Y(36, [
        ['A fluent translation is not necessarily an accurate one.', 'Yes', 'Paragraph A: fluency and faithfulness are different qualities.'],
        ['Readers in the study preferred inaccurate texts as long as they were fluent.', 'No', 'Paragraph D: this did not mean that readers preferred inaccuracy.'],
        ['A checklist guarantees that bilingual reviewers will find every error.', 'No', 'Paragraph E: the checklist was not a mechanical guarantee.'],
        ['Automated translation will soon replace professional translators.', 'Not given', 'The writer makes no prediction about this.'],
        ['Trust in a translation should be based on evidence about its meaning.', 'Yes', 'Paragraph H: confidence is better justified when it rests on evidence about meaning.']])
    ],
    3: [
      H(14, ['Comparing two records', 'Describing before explaining', 'How real ice cores are collected', 'A misleading signal from the equipment', 'Judging reports on more than accuracy', 'Why every sample\'s location must be recorded', 'Using an artificial record to teach interpretation', 'The cost of laboratory equipment', 'Problems with counting layers as equal units', 'Balancing detail against preservation'],
        ['vii', 'ii', 'vi', 'x', 'iv', 'ix', 'i', 'v'],
        ['An artificial core tests how students separate observation from conclusion.', 'Students first described what they saw without dates or causes.', 'A measurement detached from its location cannot be placed.', 'Thin versus thick samples: detail against material used.', 'The signal came from residue in a container.', 'Treating every boundary as the same unit of time failed.', 'Two artificial cores were compared.', 'The best reports were judged on method and caution, not just closeness.']),
      W(22, 'Studying the artificial core', ['residue', 'thickness', 'scale', 'accuracy', 'position', 'dust', 'spacing', 'independence', 'colour'], [
        ['Photographs included a ______ to show the dimensions of the core.', 'scale', 'Paragraph C.'],
        ['A sample\'s ______ in the core was essential for interpreting its result.', 'position', 'Paragraph C.'],
        ['Students had to justify their chosen sampling ______.', 'spacing', 'Paragraph D.'],
        ['The unexpected signal came from ______ left in a container.', 'residue', 'Paragraph E.'],
        ['Agreement between cores was useful only when their ______ was understood.', 'independence', 'Paragraph G.']]),
      I(27, [
        ['an example of a problem caused by lighting', 'G', 'Paragraph G: reflections from a nearby light obscured a panel.'],
        ['a reason why the time visitors spent at a display was hard to interpret', 'B', 'Paragraph B: a long pause might mean interest, confusion or conversation.'],
        ['a list of the different jobs a label has to do', 'A', 'Paragraph A: identify, explain why it matters, invite noticing.'],
        ['a check on whether the questions visitors asked guides had changed', 'F', 'Paragraph F.']]),
      Y(36, [
        ['Accuracy alone is enough to make a museum label useful.', 'No', 'Paragraph A: accuracy alone did not guarantee accessibility.'],
        ['Making labels as short as possible should be the main goal.', 'No', 'Paragraph D: shortening was not an end in itself.'],
        ['Testing labels in the places where they will be displayed is worthwhile.', 'Yes', 'Paragraph G: moving a panel solved a problem no rewording could.'],
        ['Visitors generally prefer audio guides to printed labels.', 'Not given', 'No comparison of preferences is given.'],
        ['Curatorial knowledge remains important when labels are written.', 'Yes', 'Paragraph H: curatorial knowledge remained central.']])
    ],
    4: [
      H(14, ['Checking surprising reports', 'Buying better telescopes for volunteers', 'Two outcomes from one project', 'Training that also improved the instructions', 'Why exact timing was preserved', 'Organisation as a central part of the science', 'Competition between regional groups', 'Keeping volunteers involved', 'Recording the context of each observation', 'Separating equipment changes from changes in the stars'],
        ['vi', 'iv', 'ix', 'x', 'v', 'i', 'viii', 'iii'],
        ['Coordination, documentation and checks were central from the start.', 'Practice tasks revealed unclear wording, so the guide was revised.', 'Date, time, location, equipment and conditions were recorded.', 'Camera settings could imitate a change in the star.', 'Original time information was kept, not averaged.', 'Unexpected dips were checked before any claims.', 'Summaries, credit and flexible participation.', 'A dataset and a record of how it was made.']),
      W(22, 'Running a volunteer sky network', ['conditions', 'telescopes', 'images', 'publicity', 'calibration', 'schedules', 'identification', 'brightness', 'embarrassment'], [
        ['Practice tasks used example ______ with known features.', 'images', 'Paragraph B.'],
        ['Volunteers recorded cloud and other observing ______.', 'conditions', 'Paragraph C.'],
        ['The team provided a ______ procedure for comparing equipment.', 'calibration', 'Paragraph D.'],
        ['A suspected change in brightness led to checks of target ______.', 'identification', 'Paragraph F.'],
        ['The network encouraged correction without causing unnecessary ______.', 'embarrassment', 'Paragraph F.']]),
      I(27, [
        ['a description of how apprentices were trained before the changes', 'B', 'Paragraph B: demonstration followed by repetition.'],
        ['the use of photographs to support later discussion', 'G', 'Paragraph G: annotated photographs.'],
        ['a statement that unnecessary complexity was not rewarded', 'F', 'Paragraph F.'],
        ['a difficulty experts had in putting their knowledge into words', 'D', 'Paragraph D: experts struggled to describe sensations obvious through touch.']]),
      Y(36, [
        ['An expert\'s quick movements can hide the judgement behind them.', 'Yes', 'Paragraph A.'],
        ['Repeating a demonstration is enough for apprentices to learn the key decisions.', 'No', 'Paragraph B: repetition did not reveal those decisions.'],
        ['Trainers should spend the same amount of time checking every step.', 'No', 'Paragraph E: more time is spent where a choice is hard to reverse.'],
        ['Apprentices trained at Alder earn more than those trained elsewhere.', 'Not given', 'Pay is not discussed.'],
        ['Some judgement can only develop through varied experience over time.', 'Yes', 'Paragraph H.']])
    ],
    5: [
      H(14, ['A misleading description of a backup', 'Why the straight route was rejected', 'Residents who campaigned against the project', 'Keeping a connection useful over time', 'Waiting that looked like failure', 'Infrastructure as a chain of decisions', 'The cost of a cable compared with satellite links', 'What a repair really depended on', 'Combining different kinds of record', 'How the route on land affected the choice of beach'],
        ['vi', 'ii', 'x', 'v', 'viii', 'i', 'ix', 'iv'],
        ['The project needed a long chain of decisions.', 'The shortest route crossed an anchoring area and uneven seabed.', 'The land route from the beach changed the assessment.', 'Planned waiting for a tide looked like delay.', 'Repair depended on vessels, depots, supplies and weather.', '"Two independent links" was misleading.', 'Proposals, drawings, contracts and interviews were compared.', 'Continuity: inspection, agreements and rehearsal.']),
      W(22, 'Connecting Elsin', ['depot', 'novelty', 'corridor', 'drawings', 'essential', 'harbour', 'continuity', 'emergency', 'agreements'], [
        ['The second beach connected conveniently to an existing utility ______.', 'corridor', 'Paragraph C.'],
        ['The repair arrangements included access to a mainland ______.', 'depot', 'Paragraph E.'],
        ['During reduced operation, ______ services received priority.', 'essential', 'Paragraph F.'],
        ['Maintenance ______ revealed obligations missing from many public accounts.', 'agreements', 'Paragraph G: contracts revealed obligations.'],
        ['The final paragraph stresses ______ as much as innovation.', 'continuity', 'Paragraph H.']]),
      I(27, [
        ['the use of a short questionnaire after the interval', 'D', 'Paragraph D.'],
        ['a description of how office staff recorded their experiences', 'F', 'Paragraph F: a diary.'],
        ['a statement that some people did better after the puzzles', 'E', 'Paragraph E: some people improved after puzzles.'],
        ['a change that made clear which messages needed an immediate answer', 'G', 'Paragraph G: an availability signal and agreed urgent requests.']]),
      Y(36, [
        ['It was sensible to avoid calling every interval a "break" at the start of the study.', 'Yes', 'Paragraph A: the label implied a benefit before any evidence.'],
        ['Lim\'s experiment tested the effect of real outdoor environments.', 'No', 'Paragraph E: the study did not test real outdoor environments.'],
        ['The availability signal was proven to improve attention.', 'No', 'Paragraph G: it was not presented as a proven treatment for attention.'],
        ['Most office workers prefer looking at photographs to solving puzzles.', 'Not given', 'No such preference is reported.'],
        ['Diaries alone can establish a complete theory of recovery.', 'No', 'Paragraph H: none alone establishes a complete theory.']])
    ],
    6: [
      H(14, ['Working and observing in pairs', 'Choosing the best clay for beginners', 'The drawbacks of the new approach', 'Breaking a demonstration into stages', 'What the experience does and does not prove', 'Creating a shared sense of touch', 'Judgement rather than a fixed routine', 'Selling students\' work to the public', 'Testing learners with unfamiliar material', 'Learning from prepared mistakes'],
        ['vii', 'iv', 'x', 'vi', 'i', 'ix', 'iii', 'v'],
        ['Learners should develop judgement about changing conditions.', 'The demonstration was divided into short stages with predictions.', 'Prepared examples with known faults.', 'Reference samples gave a shared starting point for touch.', 'One student works while the other records.', 'Evaluation with unfamiliar clay.', 'Costs: preparation time, discomfort, frustration.', 'A small study in one setting; not proof about all learning.']),
      W(22, 'Teaching judgement at the wheel', ['roles', 'temperature', 'pocket', 'listening', 'portion', 'crack', 'moisture', 'wheels', 'noticing'], [
        ['One prepared faulty pot contained an air ______.', 'pocket', 'Paragraph C.'],
        ['The reference samples had different ______ levels.', 'moisture', 'Paragraph D.'],
        ['Partners exchanged ______ after observing one another.', 'roles', 'Paragraph E.'],
        ['Students were more likely to test a small ______ of unfamiliar clay first.', 'portion', 'Paragraph F.'],
        ['The teachers called their course an apprenticeship in ______.', 'noticing', 'Paragraph H.']]),
      I(27, [
        ['a comparison of narrow and wide spacing between columns', 'C', 'Paragraph C.'],
        ['the problems of installing more equipment than is needed', 'D', 'Paragraph D: unused equipment consumes space and needs upkeep.'],
        ['a description of the different needs of future users', 'B', 'Paragraph B: music teacher, health group, exhibition organiser.'],
        ['examples of buildings that have changed their use', 'A', 'Paragraph A: a warehouse becomes a studio, a school becomes housing.']]),
      Y(35, [
        ['Adapting an old building is usually as simple as removing internal walls.', 'No', 'Paragraph A: it is rarely as simple as removing partitions.'],
        ['Flexibility depends on the whole design, not only on movable walls.', 'Yes', 'Paragraph C.'],
        ['The largest possible service system is always the sensible choice.', 'No', 'Paragraph D.'],
        ['Information about materials is a valuable part of a building.', 'Yes', 'Paragraph E: the inventory is part of the building\'s useful equipment.'],
        ['A building\'s adaptability is best judged on the day it opens.', 'No', 'Paragraph H: the report warned against judging solely at opening.'],
        ['Flexible buildings are cheaper to heat than conventional buildings.', 'Not given', 'Heating costs are not mentioned.']])
    ],
    7: [
      H(14, ['A loud site that was not richer in wildlife', 'Identifying every bird species at the site', 'Moving recorders away from paths', 'Organising files for later use', 'What a numerical index cannot reveal', 'A new problem created by automatic recording', 'Why dawn is the only useful time to record', 'Checking that the devices behaved alike', 'A cautious conclusion about habitats', 'Keeping difficult recordings instead of deleting them'],
        ['vi', 'iii', 'viii', 'x', 'v', 'i', 'iv', 'ix'],
        ['Thousands of minutes created the problem of interpretation.', 'Paths might affect the sound, so recording lines were used.', 'Recorders were tested together and rotated.', 'Weather codes were assigned and original files kept.', 'The activity index could not identify sources.', 'Machinery, not richer wildlife, caused the high score.', 'Filenames, logs and copies.', 'A cautious conclusion; the method was the success.']),
      W(22, 'Recording at the forest edge', ['cards', 'paths', 'wind', 'mammals', 'lines', 'batteries', 'insects', 'traffic', 'time'], [
        ['The revised design used three ______ running into the woodland.', 'lines', 'Paragraph B.'],
        ['Heavy rain and ______ could mask sounds of interest.', 'wind', 'Paragraph D.'],
        ['Students sorted sounds into categories including traffic, birds and ______.', 'insects', 'Paragraph E.'],
        ['Each filename contained a site code, date and start ______.', 'time', 'Paragraph G.'],
        ['Copies were stored in two places before memory ______ were reused.', 'cards', 'Paragraph G.']]),
      I(27, [
        ['how pupils were chosen to test the new arrangements', 'E', 'Paragraph E: the report stated how they had been recruited.'],
        ['a problem with displays that took too long to update', 'G', 'Paragraph G.'],
        ['a statement that a borrowed book is not necessarily read', 'F', 'Paragraph F.'],
        ['a reason why books still needed fixed places on the shelves', 'C', 'Paragraph C: so staff and pupils could return to them reliably.']]),
      Y(35, [
        ['The number of books a library owns says little about how well it is used.', 'Yes', 'Paragraph A.'],
        ['Choosing an easier book shows that a pupil is avoiding effort.', 'No', 'Paragraph D: not automatically interpreted as avoiding effort.'],
        ['The pupils in the test group represented the views of every child in the school.', 'No', 'Paragraph E: their role was not to speak for every child.'],
        ['Changes only last if they do not depend on constant extra effort.', 'Yes', 'Paragraph G.'],
        ['Pupils at Brook now read more at home than before.', 'Not given', 'Reading at home is not discussed.'],
        ['The project proved that pupils\' literacy had improved.', 'No', 'Paragraph H: the school did not claim this.']])
    ],
    8: [
      H(14, ['A shortage caused inside the business', 'Making collection more convenient', 'Designing a box that never wears out', 'Reuse as a system, not a material', 'Measuring the costs of cleaning separately', 'Deciding how many box sizes to use', 'Why environmental claims depend on circulation', 'Customers who refused to pay a deposit', 'What a deposit can and cannot achieve', 'Turning a possibility into ordinary practice'],
        ['iv', 'vi', 'ix', 'ii', 'v', 'vii', 'i', 'x'],
        ['Reuse is a system of movements and decisions.', 'Two sizes chosen after examining orders.', 'A deposit does not guarantee return.', 'Sheltered drop-off locations.', 'Water, energy and labour measured separately.', 'Benefits depend on completed cycles.', 'Early packing tied up boxes in the shop.', 'Organising reuse makes it ordinary practice.']),
      W(22, 'The returnable box trial', ['cycles', 'outdoor', 'deposit', 'packed', 'washing', 'subscription', 'sheltered', 'inspection', 'stacked'], [
        ['Customers paid a refundable ______ with their first delivery.', 'deposit', 'Paragraph C.'],
        ['Empty boxes could be left at agreed ______ locations.', 'sheltered', 'Paragraph D.'],
        ['Damaged boxes were separated before routine ______.', 'washing', 'Paragraph E.'],
        ['The team checked that boxes were fully dry before being ______.', 'stacked', 'Paragraph E.'],
        ['Environmental comparisons depended on the number of completed ______.', 'cycles', 'Paragraph F.']]),
      I(27, [
        ['an example of a schedule change that left some notices out of date', 'G', 'Paragraph G: the completion date changed.'],
        ['a reason why some readers misread a map', 'C', 'Paragraph C: limited colour discrimination.'],
        ['a problem with the telephone number on the original notice', 'F', 'Paragraph F: a general number meant explaining several times.'],
        ['the range of people who took part in testing', 'E', 'Paragraph E: age, language background and familiarity with the area.']]),
      Y(35, [
        ['A notice can contain correct facts and still be ineffective.', 'Yes', 'Paragraph A.'],
        ['Plain communication means removing all legal detail.', 'No', 'Paragraph B: legal information remained available.'],
        ['Multilingual communication can improve the original message.', 'Yes', 'Paragraph D.'],
        ['A map can replace the need for written instructions.', 'No', 'Paragraph C: the map supported the text rather than replacing explicit instructions.'],
        ['Most Greyford residents prefer printed notices to online information.', 'Not given', 'No preference is reported.'],
        ['One template should be used for every public notice.', 'No', 'Paragraph H: no universal template.']])
    ],
    9: [
      H(14, ['Protecting improvements from routine repairs', 'Switching off all lights after midnight', 'Changing placement and timing at a warehouse', 'Measuring how residents felt', 'A change in the terms of debate', 'A new telescope for the observatory', 'A demand that failed to win support', 'Comparing nights fairly', 'A complaint with an unexpected cause', 'Building a consistent baseline'],
        ['vii', 'x', 'iii', 'ix', 'viii', 'iv', 'i', 'v'],
        ['The switch-off petition attracted attention but little agreement.', 'Fixed positions gave a consistent baseline.', 'Shields and a timer at the warehouse.', 'The crossing was hidden by a tree branch.', 'Comparisons under similar conditions.', 'Questionnaire on comfort and incidents.', 'The specification was amended for repairs.', 'Light versus darkness became practical decisions.']),
      W(22, 'Merrow\'s lighting trial', ['timer', 'lenses', 'baseline', 'bright', 'specification', 'switch', 'shields', 'survey', 'reference'], [
        ['Repeated measurements gave a consistent ______ for later comparisons.', 'baseline', 'Paragraph B.'],
        ['The warehouse tested ______ to direct light onto its yard.', 'shields', 'Paragraph C.'],
        ['A decorative sign was controlled by a ______ that staff adjusted.', 'timer', 'Paragraph C.'],
        ['Volunteers used a fixed list of faint ______ stars.', 'reference', 'Paragraph E.'],
        ['The council amended its lighting ______ to guide replacements.', 'specification', 'Paragraph G.']]),
      I(27, [
        ['an example of a conclusion readers should not draw', 'G', 'Paragraph G: neighbouring blocks should not be precisely ranked.'],
        ['the reason why later testers had not seen earlier versions', 'C', 'Paragraph C: familiarity could make an unclear symbol seem obvious.'],
        ['a question about choosing a site for a temporary shelter', 'E', 'Paragraph E.'],
        ['why the first prototype gave a false impression', 'B', 'Paragraph B: viewers assumed every street had a sensor.']]),
      Y(36, [
        ['Sharp lines on maps can suggest more certainty than the evidence supports.', 'Yes', 'Paragraph A.'],
        ['A mathematical model can turn unmeasured locations into observed ones.', 'No', 'Paragraph B: the estimates did not turn unmeasured locations into observed ones.'],
        ['Limited evidence is a good reason to take no action.', 'No', 'Paragraph F: limited evidence did not justify doing nothing.'],
        ['Urban heat is the most serious environmental problem in Westport.', 'Not given', 'No ranking of problems is given.'],
        ['Community organisations helped improve the map\'s labels.', 'Yes', 'Paragraph G: several labels were changed before release.']])
    ],
    10: [
      H(14, ['Recreating a sound that was never recorded', 'Why the market finally closed', 'Designing how visitors listen', 'Why each recording was originally made', 'An archive without one definitive sound', 'Handling uncertain memories', 'Selling recordings to raise funds', 'The costs and benefits of cleaning a recording', 'Who may give permission to share a recording', 'What a photograph cannot show'],
        ['x', 'iv', 'viii', 'vi', 'i', 'ix', 'iii', 'v'],
        ['A photograph cannot reveal how the place sounded.', 'The value of each recording depended on its original purpose.', 'Removing hiss could remove faint details.', 'Remembered dates, interview dates and documents were kept apart.', 'A handcart was recorded as a reconstruction.', 'The donor could not speak for everyone audible.', 'Listening stations, labels and transcripts.', 'No single definitive sound; distinctions preserved.']),
      W(22, 'Building a sound archive', ['transcripts', 'catalogue', 'schedules', 'public', 'paving', 'headphones', 'log', 'gravel', 'restricted'], [
        ['Every sound-processing step was entered in a ______.', 'log', 'Paragraph C: a processing log.'],
        ['Old work ______ helped support discussion of remembered events.', 'schedules', 'Paragraph D.'],
        ['The reconstructed handcart moved across old ______.', 'paving', 'Paragraph E.'],
        ['The full recording with a private conversation was kept under ______ access.', 'restricted', 'Paragraph F.'],
        ['Optional ______ gave access to the spoken content of recordings.', 'transcripts', 'Paragraph G.']]),
      I(27, [
        ['a decision to agree acceptable differences in advance', 'D', 'Paragraph D.'],
        ['an admission that the instrument will eventually need replacing', 'H', 'Paragraph H.'],
        ['the reason why the existing instrument was not replaced', 'A', 'Paragraph A: expensive and disruptive to a long-running study.'],
        ['an arrangement for taking responsibility for future updates', 'G', 'Paragraph G: a named service owner.']]),
      Y(36, [
        ['Information from former staff should be checked by independent observation.', 'Yes', 'Paragraph B.'],
        ['Agreement on an average value is enough to validate a new interface.', 'No', 'Paragraph D: repeatability also mattered.'],
        ['Saving the source code is enough to keep software usable.', 'No', 'Paragraph F: preservation involved more than saving source code.'],
        ['Most research centres now use the same type of spectrometer.', 'Not given', 'Other centres are not discussed.'],
        ['The project made the old instrument usable forever.', 'No', 'Paragraph H: Cole did not describe it as immortal.']])
    ]
  };
})();
