# Bandora practice library

Updated 23 October 2026.

All questions, passages and listening scripts inside Bandora are original learning
exercises. The new Reading case studies describe fictional projects. They are
not copied from Cambridge books or official sample papers, and the website is
not affiliated with Cambridge English, IELTS or the British Council.

## On-site inventory

The default library now contains **10 complete Academic test tickets**. Each
has Listening (4 parts, 40 questions, 30 minutes), Reading (3 full passages,
40 questions, 60 minutes), Writing (2 tasks, 60 minutes) and Speaking
(3 guided parts, 14 minutes). Across the ten tickets there are 800 scored
Reading/Listening questions, 20 Writing tasks and 30 Speaking parts.

Ticket section IDs are `listening-101` through `listening-110`, with equivalent
`reading-`, `writing-` and `speaking-` IDs. Ticket 01 reuses the existing full
Reading and Listening sets and first Writing and Speaking sets. Tickets 02–10
add distinct Reading passages, Listening scripts and Writing tasks. Speaking
tickets 02–04 expand the existing topic sets; 05–10 introduce additional topics.
Writing visuals include charts, tables, processes and before/after plans.

The original twelve sessions below remain under **Short exercises & individual
sections**. They are additional entry points, not additional unique full tests.

| Skill | Stable set ID | Topic | Duration | Content |
|---|---|---|---|---|
| Reading | reading-01 | Urban forests, memory and ocean mapping | 60 min | 3 passages, 40 questions |
| Reading | reading-02 | Repair cafés: more than a quick fix | 20 min | 1 passage, 12 questions |
| Reading | reading-03 | The city after dark | 20 min | 1 passage, 12 questions |
| Listening | listening-01 | The community garden | 10 min | 10 questions |
| Listening | listening-02 | Booking a photography workshop | 10 min | 10 questions |
| Listening | listening-03 | Welcome to the coastal field station | 10 min | 10 questions |
| Listening | listening-04 | Full Listening mock | 30 min | 4 parts, 40 questions |
| Writing | writing-01 | Chart report and discussion essay | 60 min | 2 tasks |
| Speaking | speaking-01 | Neighbourhoods and practical skills | 14 min | 3 guided parts |
| Speaking | speaking-02 | Places and journeys | 14 min | 3 guided parts |
| Speaking | speaking-03 | Technology and everyday decisions | 14 min | 3 guided parts |
| Speaking | speaking-04 | Community and shared spaces | 14 min | 3 guided parts |

Starting a skill from the dashboard or study plan selects ticket 01's section.
The original full Listening mock and ticket 01 share the community garden,
coastal field station, student transport discussion and seed-bank lecture.
The legacy library has 114 unique automatically checked questions; 80 are
also in ticket 01, leaving 34 additional unique questions beyond the tickets.
Scores are
raw practice results, not calibrated IELTS band estimates. Speaking and Writing
use self-review, not automated examiner scoring.

Listening uses the browser's generated English voice, not a recording of human
speakers. The ten-minute sessions are focused exercises. The 40-question mock
has a 30-minute shared timer, four part tabs, separate playback per part and
one play per part in exam mode. It is not a reproduction of official recordings
or their exact timing. Speaking recording remains optional and local to the tab.
Sections save separately, and result pages offer the next section in that ticket.
Section breaks are allowed. This is a structured practice simulation, not an
exact reproduction of a live exam or an examiner-led Speaking interview.

The [official IELTS Listening format](https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening)
describes four parts with ten questions each and approximately 30 minutes.
The [Academic test overview](https://ielts.org/take-a-test/test-types/ielts-academic-test)
was checked again on 23 October 2026 for section timings.

## Official external resources

The resources page links directly to these provider pages, verified on
20 October 2026:

- [Cambridge English IELTS preparation](https://www.cambridgeenglish.org/exams-and-tests/ielts/preparation/)
  — free sample paper, guidance and published preparation materials.
- [IELTS Academic sample tasks](https://ielts.org/take-a-test/preparation-resources/sample-test-questions/academic-test)
  — official sample tasks and supporting materials by skill.
- [British Council free practice and sample tests](https://takeielts.britishcouncil.org/prepare/ielts-free-practice-mock-tests)
  — practice and preparation resources.

These open in a new tab. External answers and scores are not imported into
Bandora. Materials remain on the providers' websites; access and availability
are controlled by those providers.

## Maintaining the library

`dist/content-library.js` registers the sets and official resource links.
Original baseline content remains in `reading.js` and `practice.js`.
`dist/full-listening.js` adds the 40-question mock after the library loads.
The `ticket-reading-a.js`, `ticket-reading-b.js`, `ticket-listening.js`,
`ticket-listening-extra-a.js`, `ticket-listening-extra-b.js` and
`ticket-productive.js` files provide original ticket content. `test-tickets.js`
registers all forty sections; `ticket-ui.js` groups them into tickets.
`writing-visuals.js` renders and exports the Writing Task 1 data.
Keep set IDs stable: saved sessions, cloud history and mistake reviews depend
on them. Historical sessions without a set ID map to the original `-01` set.
Within a set, keep numeric question IDs stable and unique.

The new content has been checked for answer-key consistency and supported
question types. Source-level integration checks cover set selection, timers,
grading, playback text, repeat actions, history, filtering, notebook isolation,
exports and mocked cloud persistence. A fresh visual browser check was
unavailable because of the browser-access restriction.
