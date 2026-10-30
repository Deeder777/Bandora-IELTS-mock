/* Bandora · Cambridge-style task formats for all ten tickets.
   - Groups every Listening part and Reading passage into IELTS-style question blocks with official-style instructions.
   - Listening Part 2 (Q16–20): plan / map labelling with a new recording section.
   - Listening Part 3 (Q27–30): matching or "choose TWO" with a new recording section.
   - Reading: matching headings, summary from a word box, matching information and Yes / No / Not given.
   Everything here is original Bandora material (fictional places and people). */
(function () {
  'use strict';
  if (!window.TestLibrary || !Array.isArray(TestLibrary.sets)) return;
  const setFor = (type, n) => TestLibrary.sets.find((s) => s.type === type && s.ticket === n);
  const LETTERS = 'ABCDEFGHIJ';
  const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii'];

  // ---------------- map drawing ----------------
  const C = { land: '#F5FBFD', line: '#D3E7EE', path: '#DDF0F7', water: '#DCF2FA', waterInk: '#4F9CB8', room: '#FFFFFF', ink: '#1B4C5E', soft: '#5D7F8C', accent: '#127FA6' };
  function svgEsc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function drawMap(m) {
    const W = 560, H = 380;
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${svgEsc(m.title)}" xmlns="http://www.w3.org/2000/svg" font-family="Plus Jakarta Sans, Arial, sans-serif">`;
    s += `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14" fill="${C.land}" stroke="${C.line}"/>`;
    (m.water || []).forEach((w) => {
      s += w.ellipse ? `<ellipse cx="${w.ellipse[0]}" cy="${w.ellipse[1]}" rx="${w.ellipse[2]}" ry="${w.ellipse[3]}" fill="${C.water}"/>` : `<rect x="${w.rect[0]}" y="${w.rect[1]}" width="${w.rect[2]}" height="${w.rect[3]}" rx="${w.r || 0}" fill="${C.water}"/>`;
      if (w.label) s += `<text x="${w.label[1]}" y="${w.label[2]}" font-size="13" font-style="italic" fill="${C.waterInk}" text-anchor="middle">${svgEsc(w.label[0])}</text>`;
    });
    (m.paths || []).forEach((p) => { s += `<polyline points="${p.join(' ')}" fill="none" stroke="${C.path}" stroke-width="${m.pathWidth || 20}" stroke-linecap="round" stroke-linejoin="round"/>`; });
    (m.dashed || []).forEach((p) => { s += `<polyline points="${p.join(' ')}" fill="none" stroke="${C.soft}" stroke-width="3" stroke-dasharray="10 7"/>`; });
    (m.rooms || []).forEach((r) => { s += `<rect x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}" rx="8" fill="${C.room}" stroke="${C.line}" stroke-width="2"/>`; });
    (m.fixed || []).forEach((f) => {
      if (f.box) s += `<rect x="${f.box[0]}" y="${f.box[1]}" width="${f.box[2]}" height="${f.box[3]}" rx="8" fill="#E6F8FF" stroke="#BFE4F2" stroke-width="2"/>`;
      if (f.circle) s += `<circle cx="${f.circle[0]}" cy="${f.circle[1]}" r="${f.circle[2]}" fill="#E6F8FF" stroke="#BFE4F2" stroke-width="2"/>`;
      String(f.label).split('|').forEach((line, i, arr) => { s += `<text x="${f.at[0]}" y="${f.at[1] + (i - (arr.length - 1) / 2) * 15}" font-size="12.5" font-weight="600" fill="${C.ink}" text-anchor="middle" dominant-baseline="middle">${svgEsc(line)}</text>`; });
    });
    (m.letters || []).forEach(([l, x, y]) => {
      s += `<g><rect x="${x - 15}" y="${y - 15}" width="30" height="30" rx="8" fill="#fff" stroke="${C.accent}" stroke-width="2.5"/><text x="${x}" y="${y + 1}" font-size="15" font-weight="800" fill="${C.accent}" text-anchor="middle" dominant-baseline="middle">${l}</text></g>`;
    });
    if (m.here) {
      const [x, y, label] = m.here;
      s += `<circle cx="${x}" cy="${y}" r="8" fill="#F27ABE" stroke="#fff" stroke-width="3"/><text x="${x + (m.hereAlign === 'start' ? 14 : 0)}" y="${y - 16}" font-size="12" font-weight="700" fill="#B8287A" text-anchor="${m.hereAlign || 'middle'}">${svgEsc(label || 'You are here')}</text>`;
    }
    s += `<g transform="translate(${W - 34},40)"><path d="M0 -18 L7 6 L0 1 L-7 6 Z" fill="${C.ink}"/><text x="0" y="20" font-size="11" font-weight="700" fill="${C.ink}" text-anchor="middle">N</text></g>`;
    s += `<text x="18" y="${H - 14}" font-size="12" font-weight="700" fill="${C.soft}">${svgEsc(m.title)}</text>`;
    return s + '</svg>';
  }

  // ---------------- helpers ----------------
  function limitFrom(text, fallback) {
    const m = String(text || '').match(/(NO MORE THAN [A-Z ]+?WORDS?(?: AND\/OR A NUMBER)?|ONE WORD ONLY|ONE WORD AND\/OR A NUMBER|TWO WORDS AND\/OR A NUMBER|THREE WORDS AND\/OR A NUMBER)/i);
    if (!m) return fallback;
    const t = m[1].toUpperCase();
    return /^NO MORE/.test(t) || /ONLY$/.test(t) ? t : 'NO MORE THAN ' + t;
  }
  function splitParas(t) { const a = t.split('\n\n'); return a.length >= 6 ? { parts: a, sep: '\n\n' } : { parts: t.split('\n'), sep: '\n' }; }
  function replaceSegments(part, from, to, segments) {
    const sp = splitParas(part.transcript);
    sp.parts.splice(from, to - from + 1, ...segments);
    part.transcript = sp.parts.join(sp.sep);
  }
  function setQuestion(data, unit, q) {
    const i = unit.questions.findIndex((x) => x.id === q.id);
    if (i >= 0) unit.questions[i] = q;
    if (Array.isArray(data.questions)) { const j = data.questions.findIndex((x) => x.id === q.id); if (j >= 0) data.questions[j] = q; }
  }
  function runs(qs) {
    const out = [];
    qs.forEach((q) => { const t = q.type === 'tfng' ? 'tfng' : q.options ? 'mcq' : 'text'; const last = out[out.length - 1]; if (last && last.t === t) last.qs.push(q); else out.push({ t, qs: [q] }); });
    return out;
  }
  const range = (g) => `${g.from}–${g.to}`;

  // ---------------- Listening ----------------
  function listeningGroups(part, index) {
    const limit = limitFrom(part.description, 'NO MORE THAN TWO WORDS AND/OR A NUMBER');
    return runs(part.questions).map((r) => {
      const g = { from: r.qs[0].id, to: r.qs[r.qs.length - 1].id };
      if (r.t === 'mcq') return Object.assign(g, { kind: 'mcq', instruction: 'Choose the correct letter, <b>A, B or C</b>.' });
      if (r.qs.some((q) => !/_{3,}/.test(q.prompt))) return Object.assign(g, { kind: 'short', instruction: `Answer the questions below.<br>Write <b>${limit}</b> for each answer.` });
      const kind = index === 0 ? 'form' : index === 3 ? 'notes' : r.qs.length >= 3 ? 'notes' : 'sentences';
      const what = kind === 'form' ? 'form' : kind === 'notes' ? 'notes' : 'sentences';
      return Object.assign(g, { kind, heading: kind === 'sentences' ? '' : part.title, instruction: `Complete the ${what} below.<br>Write <b>${limit}</b> for each answer.` });
    });
  }
  function describe(groups) {
    return groups.map((g) => `Questions ${range(g)}: ${g.kind === 'mcq' ? 'multiple choice' : g.kind === 'map' ? 'label the ' + (g.planWord || 'map') : g.kind === 'match' ? 'matching' : g.kind === 'multi' ? 'choose TWO letters' : g.kind === 'short' ? 'short answers' : 'complete the ' + (g.kind === 'form' ? 'form' : g.kind === 'notes' ? 'notes' : 'sentences')}.`).join(' ') + ' Read the questions before you play the audio.';
  }

  const MAPS = {
    1: { title: 'Coastal field station', planWord: 'map', speaker: 'Guide',
      map: { title: 'Coastal field station', water: [{ rect: [2, 2, 556, 46], r: 12, label: ['Sea', 280, 30] }], paths: [[280, 345, 280, 70], [60, 190, 500, 190]], fixed: [{ box: [215, 160, 130, 60], at: [280, 190], label: 'Courtyard' }, { at: [55, 168], label: 'Beach|steps' }, { box: [455, 280, 90, 60], at: [500, 310], label: 'Car park' }], letters: [['A', 190, 300], ['B', 370, 300], ['C', 150, 120], ['D', 410, 120], ['E', 280, 85], ['F', 130, 235], ['G', 420, 235], ['H', 200, 250]], here: [280, 352, 'Entrance gate'] },
      segments: [
        'Guide: Now, a few of you have asked where things are, so please look at the map in your folder. We are at the entrance gate, at the bottom of the map. The laboratory is the first building on your right as you come through the gate. It is the one nearest the gate on that side.',
        'Guide: Spare boots are kept in the boot store, which is directly opposite the laboratory, on the other side of the main path.',
        'Guide: The dining room is beyond the courtyard. Walk straight through the courtyard towards the sea, and it is the building right in front of you, between the courtyard and the beach.',
        'Guide: If you need the first-aid room, take the path that leads west out of the courtyard, towards the beach steps. The first-aid room is on the left-hand side of that path, so on the south side, not far from the courtyard.',
        'Guide: Finally, wet clothes go in the drying room. Go into the courtyard and turn right along the path to the car park. The drying room is on the north side of that path, in the corner closest to the sea.'
      ],
      qs: [['Laboratory', 'B', 'First building on the right through the gate.'], ['Boot store', 'A', 'Directly opposite the laboratory across the main path.'], ['Dining room', 'E', 'Straight through the courtyard towards the sea.'], ['First-aid room', 'F', 'West path, left-hand (south) side.'], ['Drying room', 'D', 'East path, north side, nearest the sea.']] },
    2: { title: 'Bracken Nature Reserve',
      map: { title: 'Bracken Nature Reserve', water: [{ rect: [2, 135, 556, 26], label: ['stream', 470, 152] }, { ellipse: [110, 75, 70, 38], label: ['Pond', 110, 80] }], paths: [[280, 345, 280, 40], [60, 250, 500, 250]], fixed: [{ box: [250, 128, 60, 40], at: [280, 148], label: 'Bridge' }, { box: [430, 280, 100, 55], at: [480, 307], label: 'Orchard' }, { box: [30, 300, 100, 50], at: [80, 325], label: 'Car park' }], letters: [['A', 210, 300], ['B', 350, 300], ['C', 150, 205], ['D', 380, 205], ['E', 220, 85], ['F', 400, 85], ['G', 520, 205], ['H', 470, 60]], here: [280, 352, 'Visitor centre'] },
      segments: [
        'Let me show you where a few things are on the map. We are in the visitor centre, at the bottom. The café is not inside this building. It is the small building just outside, on your right as you set off up the main path, before you reach the crossroads.',
        'If you see any damaged fencing, report it to the ranger. Her office is across the main path from the café, so on the left as you walk up.',
        'Dogs must stay on leads, and they are not allowed in the meadow at all. To find the meadow, walk up to the crossroads and turn left. The meadow is on your right after you turn, between that path and the stream.',
        'The bird hide is on the far side of the stream. Cross the bridge, and it is just ahead of you on the left, looking out over the pond.',
        'Finally, today\'s children\'s activity on animal tracks is in a tent. Turn right at the crossroads, and the tent is on your left, just before you reach the orchard.'
      ],
      qs: [['Café', 'B', 'Just outside, on the right of the main path before the crossroads.'], ['Ranger\'s office', 'A', 'Across the main path from the café.'], ['Meadow', 'C', 'Left at the crossroads, on the right between the path and the stream.'], ['Bird hide', 'E', 'Over the bridge, on the left by the pond.'], ['Children\'s activity tent', 'D', 'Right at the crossroads, on the left before the orchard.']] },
    3: { title: 'Southmere Sailing Club', speaker: 'Organiser',
      map: { title: 'Southmere Sailing Club', water: [{ rect: [2, 2, 556, 95], r: 12, label: ['Southmere Lake', 280, 50] }], paths: [[280, 345, 280, 125], [40, 125, 520, 125]], fixed: [{ box: [70, 215, 110, 45], at: [125, 237], label: 'Terrace' }, { box: [250, 92, 60, 26], at: [280, 105], label: 'Slipway' }, { box: [430, 290, 110, 60], at: [485, 320], label: 'Car park' }], letters: [['A', 360, 300], ['B', 200, 310], ['C', 370, 180], ['D', 215, 180], ['E', 525, 160], ['F', 40, 160], ['G', 485, 240], ['H', 120, 310]], here: [280, 352, 'Reception'] },
      segments: [
        'Organiser: Now, let me show you where everything is on the plan. We are at reception, at the bottom. The workshop, where the sail-repair demonstration takes place, is the first building on your right as you walk towards the lake.',
        'Organiser: Lunch is sold from a stall next to the terrace. The terrace is on the left of the main path, and the stall is just to the north of it, close to the main path.',
        'Organiser: For the race, please do not stand on the slipway. Follow the shore path all the way to the right, to the east bank. There is a viewing point at the very end.',
        'Organiser: The membership talk is in the training room. That is in the building on the right of the main path, just before you reach the shore.',
        'Organiser: If you are going out on a boat, the changing rooms are next to the car park, on the side that faces the lake.'
      ],
      qs: [['Workshop', 'A', 'First building on the right towards the lake.'], ['Lunch stall', 'D', 'Just north of the terrace, close to the main path.'], ['Viewing point', 'E', 'End of the shore path on the east bank.'], ['Training room', 'C', 'Right of the main path, just before the shore.'], ['Changing rooms', 'G', 'Beside the car park, facing the lake.']] },
    4: { title: 'Riverside Food Market', speaker: 'Coordinator',
      map: { title: 'Riverside Food Market', water: [{ rect: [490, 2, 68, 376], r: 12, label: ['River', 524, 200] }], paths: [[60, 300, 480, 300], [150, 300, 150, 110, 410, 110, 410, 300]], fixed: [{ box: [185, 140, 190, 120], at: [280, 200], label: 'Food stalls' }, { box: [455, 92, 70, 34], at: [490, 109], label: 'Bridge' }, { box: [30, 30, 100, 44], at: [80, 52], label: 'Delivery gate' }], letters: [['A', 230, 340], ['B', 300, 278], ['C', 100, 200], ['D', 455, 200], ['E', 280, 75], ['F', 455, 340], ['G', 100, 110], ['H', 340, 340]], here: [60, 300, 'Duty board'], hereAlign: 'start' },
      segments: [
        'Coordinator: Please look at the site plan. We are at the duty board, on the left. Used plates go to the washing station, which is at the far end of the main avenue. It is on your right as you face the river, in the corner beside the riverside path.',
        'Coordinator: Lost property goes to the information tent. Walk along the avenue, and it is the first tent you come to on the right-hand side.',
        'Coordinator: Volunteers take their breaks in the rest area. It is beside the west path, on the side away from the stalls, about halfway up.',
        'Coordinator: The recycling point, where cardboard should be flattened, is behind the stalls. Go along the northern path, and it is opposite the middle of the stall block.',
        'Coordinator: Finally, the first-aid post is on the east path, between the path and the river, so that an ambulance can reach it from the bridge.'
      ],
      qs: [['Washing station', 'F', 'Far end of the avenue, on the right facing the river.'], ['Information tent (lost property)', 'A', 'First tent on the right along the avenue.'], ['Volunteer rest area', 'C', 'West path, away from the stalls, halfway up.'], ['Recycling point', 'E', 'Northern path, opposite the middle of the stalls.'], ['First-aid post', 'D', 'East path, between the path and the river.']] },
    5: { title: 'River and Railway Trail',
      map: { title: 'River and Railway Trail', water: [{ rect: [2, 2, 556, 62], r: 12, label: ['River Lynn', 140, 36] }], paths: [[70, 300, 300, 300, 300, 92, 520, 92]], dashed: [[30, 200, 530, 200]], fixed: [{ at: [470, 186], label: 'old railway line' }, { box: [272, 186, 56, 28], at: [300, 200], label: 'Crossing' }], letters: [['A', 180, 262], ['B', 180, 338], ['C', 360, 255], ['D', 240, 148], ['E', 360, 148], ['F', 430, 128], ['G', 520, 145], ['H', 430, 335]], here: [70, 300, 'Start: Station Square'], hereAlign: 'start' },
      segments: [
        'Have a look at the trail map. You start here, in Station Square. The old signal box is right beside the level crossing. It is on your right just after you cross the railway line.',
        'The picnic area is the quietest spot on the route. It is on the first stretch of the trail, on your left, facing the railway.',
        'Just before you reach the level crossing, on your right, you will pass the old goods shed, which is now a small café.',
        'When you reach the river, turn right. The viewpoint is about halfway along the river path, on the side away from the water.',
        'Public toilets are on the left of the trail just after the railway crossing, opposite the signal box.'
      ],
      qs: [['Signal box', 'E', 'Right of the trail, just after the crossing.'], ['Picnic area', 'A', 'First stretch, on the left facing the railway.'], ['Café (old goods shed)', 'C', 'On the right just before the crossing.'], ['Viewpoint', 'F', 'River path, on the side away from the water.'], ['Toilets', 'D', 'Left of the trail after the crossing, opposite the signal box.']] },
    6: { title: 'Ridge Planetarium (ground floor)', planWord: 'plan',
      map: { title: 'Ridge Planetarium · ground floor', pathWidth: 50, paths: [[280, 350, 280, 175], [60, 225, 500, 225]], rooms: [[390, 250, 140, 95], [40, 150, 150, 55], [390, 150, 140, 55], [40, 40, 150, 90], [390, 40, 140, 90], [195, 262, 55, 83], [312, 262, 68, 83]], fixed: [{ box: [40, 250, 150, 95], at: [115, 297], label: 'Discovery|room' }, { circle: [280, 105, 62], at: [280, 105], label: 'Dome' }], letters: [['A', 460, 297], ['B', 115, 177], ['C', 460, 177], ['D', 115, 85], ['E', 460, 85], ['F', 346, 303], ['G', 222, 303]], here: [280, 355, 'Main entrance'] },
      segments: [
        'Here is a plan of the ground floor. We are standing in the main entrance, at the bottom. Pupils should leave school bags in the lockers, which are in the small room immediately on your right as you come in.',
        'The afternoon workshop takes place in the large room in the bottom right-hand corner, opposite the discovery room.',
        'You will eat lunch in the room on the left of the cross corridor. That is the room directly above the discovery room on the plan.',
        'The gift shop is in the top right-hand corner, to the right of the dome.',
        'If anyone needs help, the education office is the room on the right of the cross corridor, between the workshop and the gift shop.'
      ],
      qs: [['Lockers', 'F', 'Small room immediately on the right of the entrance.'], ['Workshop room', 'A', 'Bottom right corner, opposite the discovery room.'], ['Lunch room', 'B', 'Left of the cross corridor, above the discovery room.'], ['Gift shop', 'E', 'Top right corner, to the right of the dome.'], ['Education office', 'C', 'Right of the cross corridor, between workshop and shop.']] },
    7: { title: 'Harbour Community Radio', planWord: 'plan',
      map: { title: 'Harbour Community Radio · floor plan', pathWidth: 34, paths: [[110, 230, 475, 230, 475, 60]], rooms: [[190, 252, 150, 93], [350, 252, 100, 93], [40, 130, 140, 78], [190, 130, 150, 78], [350, 130, 100, 78], [40, 35, 160, 80], [210, 35, 240, 80]], fixed: [{ box: [40, 252, 140, 93], at: [110, 300], label: 'Reception' }], letters: [['A', 265, 298], ['B', 400, 298], ['C', 110, 169], ['D', 265, 169], ['E', 400, 169], ['F', 120, 75], ['G', 330, 75]], here: [110, 352, 'Entrance'] },
      segments: [
        'Let me show you the layout on this floor plan. We are in reception, in the bottom left-hand corner. Our live studio is the first room on your right as you walk along the corridor.',
        'Refreshments are in the kitchen, which is directly opposite the live studio, across the corridor.',
        'The editing suite is at the end of the corridor on the right, just before the corridor turns left towards the back of the building.',
        'Portable recorders are kept in the equipment store. That is the small room on the left just before the corner.',
        'The lunchtime discussion is in the meeting room. It is the big room at the back of the building, at the top of the plan, reached from the end of the corridor.'
      ],
      qs: [['Live studio', 'A', 'First room on the right along the corridor.'], ['Kitchen', 'D', 'Opposite the live studio.'], ['Editing suite', 'B', 'End of the corridor on the right, before it turns.'], ['Equipment store', 'E', 'Small room on the left before the corner.'], ['Meeting room', 'G', 'Big room at the back, from the end of the corridor.']] },
    8: { title: 'Westhaven waterfront', speaker: 'Guide',
      map: { title: 'Westhaven waterfront walk', water: [{ rect: [2, 2, 556, 70], r: 12, label: ['Harbour', 160, 40] }], paths: [[70, 300, 420, 300, 420, 110, 60, 110]], fixed: [{ box: [110, 222, 100, 50], at: [160, 247], label: 'Stone|warehouse' }, { box: [410, 20, 22, 70], at: [470, 30], label: 'Pier' }], letters: [['A', 270, 255], ['B', 270, 340], ['C', 370, 200], ['D', 475, 200], ['E', 300, 150], ['F', 150, 150], ['G', 421, 45], ['H', 60, 200]], here: [70, 300, 'Start'], hereAlign: 'start' },
      segments: [
        'Guide: Here is our route on the map. We start here, at the bottom left. We walk east past the stone warehouse, and the boat club is the next building on the same side. That is where we will stop for the toilets.',
        'Guide: The old railway yard is on the opposite side of the path from the boat club. Please stay on the marked path there.',
        'Guide: At the end of this road we turn left and walk towards the harbour. The harbour office is on the right of that road, near the top.',
        'Guide: When we reach the quay, we turn left again. The old crane stands at the end of the pier that sticks out into the water, right at that corner.',
        'Guide: Our final stop is the net loft, where you will have a hot drink. Walk west along the quay, and it is the second building on the left.'
      ],
      qs: [['Boat club', 'A', 'Next building after the stone warehouse, same side.'], ['Railway yard', 'B', 'Opposite the boat club.'], ['Harbour office', 'D', 'Right of the road to the harbour, near the top.'], ['Old crane', 'G', 'End of the pier at the corner.'], ['Net loft (final stop)', 'F', 'Second building on the left along the quay.']] },
    9: { title: 'Bell Street Toy Museum', planWord: 'plan', speaker: 'Coordinator',
      map: { title: 'Bell Street Toy Museum · ground floor', rooms: [[40, 260, 160, 85], [360, 260, 170, 85], [40, 130, 160, 80], [370, 130, 160, 80], [40, 30, 240, 85], [290, 30, 240, 85]], fixed: [{ box: [210, 260, 140, 85], at: [280, 302], label: 'Entrance|hall' }, { box: [210, 130, 150, 80], at: [285, 170], label: 'Main|gallery' }], letters: [['A', 120, 302], ['B', 445, 302], ['C', 120, 170], ['D', 450, 170], ['E', 160, 72], ['F', 410, 72]], here: [280, 355, 'Entrance'] },
      segments: [
        'Coordinator: This is a plan of the ground floor. We are in the entrance hall. School groups leave their bags on the labelled trolleys in the cloakroom, which is through the door on your left as you face into the museum.',
        'Coordinator: The shop is the room on the other side of the entrance hall from the cloakroom.',
        'Coordinator: Hot drinks must stay in the café. Go through the main gallery, and the café is the room on your right, above the shop.',
        'Coordinator: The mechanical theatre demonstration happens in the large room at the back of the building, in the corner furthest from the cloakroom.',
        'Coordinator: The activity room is the smaller room on the left of the main gallery, directly above the cloakroom.'
      ],
      qs: [['Cloakroom (bag trolleys)', 'A', 'Through the door on the left of the entrance hall.'], ['Shop', 'B', 'Across the entrance hall from the cloakroom.'], ['Café', 'D', 'Right of the main gallery, above the shop.'], ['Mechanical theatre', 'F', 'Back corner furthest from the cloakroom.'], ['Activity room', 'C', 'Left of the main gallery, above the cloakroom.']] },
    10: { title: 'Green Lane Repair Festival', planWord: 'plan', speaker: 'Organiser',
      map: { title: 'Green Lane community hall', rooms: [[90, 115, 80, 50], [240, 125, 80, 50], [390, 115, 80, 50], [90, 225, 80, 50], [240, 235, 80, 50], [390, 225, 80, 50], [495, 160, 50, 70]], fixed: [{ box: [170, 25, 220, 50], at: [280, 50], label: 'Stage' }, { box: [30, 300, 110, 40], at: [85, 320], label: 'Registration' }, { box: [440, 320, 100, 40], at: [490, 340], label: 'Exit doors' }], letters: [['A', 130, 250], ['B', 280, 260], ['C', 430, 250], ['D', 130, 140], ['E', 280, 150], ['F', 430, 140], ['G', 520, 195]], here: [40, 360, 'Entrance'], hereAlign: 'start' },
      segments: [
        'Organiser: Here is the layout of the hall. Visitors come in through the entrance in the bottom left-hand corner and register at the desk just inside. The electrical repairs station is the table nearest the stage, right in the middle.',
        'Organiser: Bikes need more space, so bike repairs are in the bottom right-hand corner of the tables, close to the exit doors.',
        'Organiser: The textile station is in the left-hand corner next to the stage.',
        'Organiser: Spare materials should be returned to the spare parts table. That is in the centre of the hall, between the entrance and the exit.',
        'Organiser: Finally, the café is the table in the top right-hand corner, beside the stage.'
      ],
      qs: [['Electrical repairs', 'E', 'Table nearest the stage, in the middle.'], ['Bike repairs', 'C', 'Bottom right corner near the exit.'], ['Textile station', 'D', 'Left corner next to the stage.'], ['Spare parts table', 'B', 'Centre, between entrance and exit.'], ['Café', 'F', 'Top right corner beside the stage.']] }
  };

  // Part 3, Questions 27–30
  const P3 = {
    1: { kind: 'match', speakerSplit: true, lines: [12, 19],
      instruction: 'What do the students decide to do about each stage of the project?<br>Choose <b>FOUR</b> answers from the box and write the correct letter, <b>A–F</b>, next to Questions 27–30.', boxTitle: 'Decisions',
      options: [['A', 'use an existing university system'], ['B', 'get advice from the tutor first'], ['C', 'leave it out of the presentation'], ['D', 'do it together'], ['E', 'divide it between them'], ['F', 'delay it until after the survey']],
      segments: ['Nina: What about the pilot? Shall we each run it with a few friends?', 'Omar: I would rather we did it together, in one session. Then we will both see where people hesitate, and we will not argue later about what went wrong.', 'Nina: Fine. The consent forms are trickier. I am not sure whether we need the university\'s official wording.', 'Omar: Neither am I. Let us not guess. We will check with our tutor before we print anything.', 'Nina: And storing the responses? I thought about the shared course folder, but anyone in the class can open it.', 'Omar: The university already has secure storage for research data. We will use that, rather than setting up anything new ourselves.', 'Nina: Last thing: the charts. I had planned a pie chart and a bar chart for every question.', 'Omar: That is far too many. Let us drop the charts from the presentation altogether and show the key figures on one slide.'],
      qs: [['Running the pilot', 'D', 'Omar: "I would rather we did it together, in one session."'], ['The consent forms', 'B', 'They will check with their tutor before printing.'], ['Storing the responses', 'A', 'They will use the university\'s existing secure storage.'], ['The charts', 'C', 'They will drop the charts from the presentation.']] },
    2: { kind: 'multi', segments: [
        'Mara: For the presentation, I think photographs of the library would help. People who have not been there can picture the space.\nJon: Agreed, as long as no users can be identified. I would also like to include some short quotations from the people we interviewed. They make the findings feel real.\nMara: Yes, let us use a few of those.',
        'Jon: What about the full survey results?\nMara: There is no time for those; they can go in the handout. And I have dropped the idea of comparing it with the library in Northgate. We never visited it properly.\nJon: True. And a town map is not really needed either. Everyone knows where the library is.',
        'Mara: Now, recommendations. Lots of people complained about the opening hours, but the council has already agreed to extend them next year, so there is no point.\nJon: Right. The noise in the study area came up again and again, though. That definitely needs a recommendation.',
        'Mara: And printing costs?\nJon: Only two people mentioned them. But several people said they could not find the reference section because the signs are confusing. I think we should recommend new signs.\nMara: Agreed. The children\'s section was popular, so we will just mention it as a strength.'],
      pairs: [
        { prompt: 'Which TWO things do the students agree to include in their presentation?', options: [['A', 'photographs of the library'], ['B', 'a map of the town'], ['C', 'quotations from users'], ['D', 'the full survey results'], ['E', 'a comparison with another library']], answer: ['A', 'C'], why: 'Photographs (Mara) and short quotations (Jon) are agreed; the survey goes in the handout, the comparison and map are dropped.' },
        { prompt: 'Which TWO problems will the students recommend changes for?', options: [['A', 'opening hours'], ['B', 'noise in the study area'], ['C', 'the cost of printing'], ['D', 'the children\'s section'], ['E', 'signs inside the building']], answer: ['B', 'E'], why: 'Noise "definitely needs a recommendation" and they will recommend new signs. Opening hours are already being extended.' }] },
    3: { kind: 'match', instruction: 'Who will be responsible for each task?<br>Write the correct letter, <b>A–D</b>, next to Questions 27–30.', boxTitle: 'People',
      options: [['A', 'Alex'], ['B', 'Rina'], ['C', 'both Alex and Rina'], ['D', 'a member of the museum staff']],
      segments: ['Rina: Who is going to write the script? You are better at writing than I am.\nAlex: I do not mind drafting it, but it would be better if we both wrote it, sitting together, so that the tone stays the same throughout.\nRina: OK, we will do that.', 'Alex: And the narration? I really do not like the sound of my own voice.\nRina: I have done some radio work, so I will record it.', 'Rina: Then testing it with visitors. Could we ask the gallery staff to hand out the guide?\nAlex: They are far too busy. I will do the testing myself on Saturday; I am there anyway.', 'Rina: Finally, the proposal has to reach the museum committee. Shall I email it?\nAlex: Actually, the education officer said she would forward it to the committee herself once she has seen our draft. So we just give it to her.'],
      qs: [['writing the script', 'C', 'They will write it together so the tone stays the same.'], ['recording the narration', 'B', 'Rina has radio experience and will record it.'], ['testing the guide with visitors', 'A', 'Alex will do the testing on Saturday.'], ['sending the proposal to the committee', 'D', 'The education officer will forward it herself.']] },
    4: { kind: 'multi', segments: [
        'Sofia: For each diary entry, I would like people to note where they ate: at their desk, in a canteen or outside.\nBen: Definitely. And how long the break actually lasted, because that is our main question.\nSofia: Should we ask what they ate too?',
        'Ben: I would leave that out. It is not our focus, and people may feel judged. Cost is the same; some people will not want to share it.\nSofia: And who they ate with? That would be nice, but it makes the diary longer. Let us keep it to two items.',
        'Ben: Now, recruitment. The business park has hundreds of office workers, so let us start there.\nSofia: Yes. Hospital workers would be interesting, but their shift patterns are too complicated for a first study.',
        'Ben: What about cleaners? Their breaks are often at unusual times.\nSofia: That is exactly why we should include them from the start. Shop assistants could come later.'],
      pairs: [
        { prompt: 'Which TWO pieces of information will each diary entry include?', options: [['A', 'where lunch was eaten'], ['B', 'the cost of the meal'], ['C', 'how long the break lasted'], ['D', 'who the person ate with'], ['E', 'what the person ate']], answer: ['A', 'C'], why: 'Place and length of break are kept; food, cost and company are left out.' },
        { prompt: 'Which TWO groups will the students invite first?', options: [['A', 'office workers at the business park'], ['B', 'hospital workers'], ['C', 'university staff'], ['D', 'shop assistants'], ['E', 'cleaners']], answer: ['A', 'E'], why: 'They start at the business park and include cleaners from the start; shop assistants come later.' }] },
    5: { kind: 'match', instruction: 'What does the tutor say about each section of the report?<br>Choose <b>FOUR</b> answers from the box and write the correct letter, <b>A–F</b>, next to Questions 27–30.', boxTitle: 'Comments',
      options: [['A', 'It should be shorter.'], ['B', 'It needs more evidence.'], ['C', 'Part of it should go in the appendix.'], ['D', 'It is already well organised.'], ['E', 'It should include a diagram.'], ['F', 'It should be written in a different tense.']],
      segments: ['Owen: Could we go through the draft section by section? We started with the introduction.\nTutor: Your introduction is twice as long as it needs to be. Cut the history of plastic bottles and get to your question within a page.', 'Nadia: And the methods?\nTutor: The methods are clear, but readers will not be able to picture where the stations are. Add a simple drawing of the campus showing your observation points.', 'Owen: The results section has all the tally sheets in it.\nTutor: Those raw tallies belong at the end of the report, in the appendix. Keep the summary table in the main text.', 'Nadia: Finally, the recommendations.\nTutor: You say students prefer refill stations near the library, but only two comments support that. Find more support before you make that claim.'],
      qs: [['Introduction', 'A', 'It is "twice as long as it needs to be".'], ['Methods', 'E', 'Add a drawing of the campus showing observation points.'], ['Results', 'C', 'Raw tallies belong in the appendix.'], ['Recommendations', 'B', 'Only two comments support the claim.']] },
    6: { kind: 'multi', segments: [
        'Iris: The first trial showed that the audio descriptions were too long. People stopped listening halfway through. We will cut each one to about a minute.\nSam: And several participants asked for a tactile map at the start, so they could understand the layout before walking around. We will make one.',
        'Iris: Some people mentioned the print size, but we are already using the largest size the museum allows. And the colours were fine.\nSam: We considered adding more seating stops, but the museum says there is no room for extra benches.',
        'Supervisor: For the next trial, time each stop. If people are spending five minutes at one exhibit, you need to know.\nSam: Should we record ages too?\nSupervisor: No, that is not relevant to your question.',
        'Supervisor: But do note every time someone asks for help. That tells you where the guide is not working. Photographs and comments about lighting are less important for now.'],
      pairs: [
        { prompt: 'Which TWO changes will the students make to the guide?', options: [['A', 'larger print'], ['B', 'shorter audio descriptions'], ['C', 'more seating stops'], ['D', 'a tactile map'], ['E', 'a different colour scheme']], answer: ['B', 'D'], why: 'Descriptions will be cut to a minute and a tactile map will be made; print, colours and seating will not change.' },
        { prompt: 'Which TWO things does the supervisor tell them to record in the next trial?', options: [['A', 'how long each stop takes'], ['B', 'visitors\' ages'], ['C', 'requests for help'], ['D', 'which exhibits are photographed'], ['E', 'comments about lighting']], answer: ['A', 'C'], why: '"Time each stop" and "note every time someone asks for help".' }] },
    7: { kind: 'match', instruction: 'What problem did the students find with each packaging design?<br>Choose <b>FOUR</b> answers from the box and write the correct letter, <b>A–F</b>, next to Questions 27–30.', boxTitle: 'Problems',
      options: [['A', 'It was too heavy to send back cheaply.'], ['B', 'It was hard to fold flat.'], ['C', 'Its corners were damaged.'], ['D', 'Customers forgot to return it.'], ['E', 'Its label could not be removed.'], ['F', 'It was difficult to clean.']],
      segments: ['Lena: Let us summarise the four designs for the tutor. The folding box was popular, but after a few trips its corners were badly damaged.\nArun: Yes, our photographs show that clearly.', 'Arun: The padded pouch survived well, but the inside lining trapped dirt, and the cleaning team could not get it properly clean.', 'Lena: The rigid crate was the strongest, but it was so heavy that sending it back cost customers more than the product.', 'Arun: And the paper sleeve?\nTutor: Remind me what went wrong there.\nLena: Nothing physical. Most customers simply forgot to send it back.\nTutor: Then the return process is your problem, not the material.'],
      qs: [['The folding box', 'C', 'Its corners were badly damaged after a few trips.'], ['The padded pouch', 'F', 'The lining trapped dirt and could not be cleaned.'], ['The rigid crate', 'A', 'Too heavy: returning it cost more than the product.'], ['The paper sleeve', 'D', 'Customers forgot to send it back.']] },
    8: { kind: 'multi', segments: [
        'Maya: During each journey, I will note every point where the participant hesitates, even briefly.\nOwen: And any wrong turns, of course. That is the clearest evidence that a sign is not working.',
        'Maya: Timing each section would be nice, but one observer cannot time and write notes at once.\nOwen: Agreed. The weather we can note once a day, not for every journey. And we do not need ages.',
        'Owen: Now the route. The market square is essential. There are five signs there, and they point in different directions.\nMaya: Yes. The bus station would be good, but it is being rebuilt, so the signs there are temporary.',
        'Owen: The hospital entrance should be included. Visitors there are often in a hurry and unfamiliar with the area.\nMaya: Agreed. The library and the river path are well signed already, so we will leave them out.'],
      pairs: [
        { prompt: 'Which TWO things will the observers write down during each journey?', options: [['A', 'every point where the participant hesitates'], ['B', 'the participant\'s age'], ['C', 'the time taken for each section'], ['D', 'the weather'], ['E', 'any wrong turns']], answer: ['A', 'E'], why: 'Hesitations and wrong turns are noted on every journey; timing is impractical, weather is noted daily, ages are not needed.' },
        { prompt: 'Which TWO places will be included in the route?', options: [['A', 'the bus station'], ['B', 'the library'], ['C', 'the market square'], ['D', 'the hospital entrance'], ['E', 'the river path']], answer: ['C', 'D'], why: 'The market square is "essential" and the hospital entrance "should be included".' }] },
    9: { kind: 'match', instruction: 'What do the students say about each source of information?<br>Choose <b>FOUR</b> answers from the box and write the correct letter, <b>A–F</b>, next to Questions 27–30.', boxTitle: 'Comments',
      options: [['A', 'It was the most reliable source.'], ['B', 'It was difficult to obtain.'], ['C', 'It contradicted the interviews.'], ['D', 'It was too small to be useful.'], ['E', 'It was collected too late.'], ['F', 'It supported what mentors had said.']],
      segments: ['Leena: The attendance records were hard work. We had to ask three different offices before anyone could give them to us.\nRafi: But they were worth getting in the end.', 'Rafi: The online survey surprised me. In the interviews, students said meetings were too short, but in the survey most said the length was fine.\nTutor: That is worth discussing in your report.', 'Leena: Only four mentors kept diaries, so we cannot really say anything from them.', 'Rafi: And the coordinator\'s report from last year matched almost exactly what the mentors told us about their training.\nTutor: Good. Then you can use it as supporting evidence.'],
      qs: [['Attendance records', 'B', 'They had to ask three offices before getting them.'], ['Online survey', 'C', 'Survey answers about meeting length disagreed with the interviews.'], ['Mentors\' diaries', 'D', 'Only four mentors kept diaries.'], ['Coordinator\'s report', 'F', 'It matched what mentors said about training.']] },
    10: { kind: 'multi', segments: [
        'Nora: Everyone must read exactly the same passage, otherwise we are comparing different texts.\nSam: And the volume must be identical. I will set the speaker level once and tape over the controls.',
        'Nora: What about the time of day?\nSam: We cannot control that; volunteers come when they are free. We will just record it. And the music itself will be different for the two groups, of course. Seat position does not matter in a small room.',
        'Nora: Then the background questions. We should ask whether they usually study with music, because that could affect how they react.\nSam: Definitely. And whether English is their first language, because that will affect reading scores.',
        'Nora: Age?\nSam: Everyone is a student of a similar age, so it will not tell us much. Course of study is not relevant either, and reading speed is measured in the task itself.'],
      pairs: [
        { prompt: 'Which TWO things will be kept the same for every participant?', options: [['A', 'the reading passage'], ['B', 'the time of day'], ['C', 'the volume of the sound'], ['D', 'the type of music'], ['E', 'the seat position']], answer: ['A', 'C'], why: 'Same passage and identical volume; time of day cannot be controlled and music differs by group.' },
        { prompt: 'Which TWO pieces of information will be collected about each volunteer?', options: [['A', 'their course of study'], ['B', 'whether they usually study with music'], ['C', 'their age'], ['D', 'their reading speed'], ['E', 'whether English is their first language']], answer: ['B', 'E'], why: 'Study habits with music and first language are asked; age and course are not relevant.' }] }
  };

  for (let n = 1; n <= 10; n++) {
    const set = setFor('listening', n);
    if (!set) continue;
    const d = set.data;
    d.parts.forEach((p, i) => { p.groups = listeningGroups(p, i); });

    // Part 2 · map / plan labelling (Q16–20)
    const M = MAPS[n], p2 = d.parts[1];
    if (M && p2) {
      const keys = M.opts || M.map.letters.map((l) => l[0]);
      replaceSegments(p2, 6, 10, M.segments);
      M.qs.forEach(([place, ans, why], i) => setQuestion(d, p2, { id: 16 + i, type: 'map', prompt: place, answer: ans, explanation: why }));
      p2.groups = p2.groups.filter((g) => g.from < 16).map((g) => (g.to > 15 ? Object.assign(g, { to: 15 }) : g));
      p2.groups.push({ from: 16, to: 20, kind: 'map', planWord: M.planWord || 'map', svg: drawMap(M.map), options: keys.map((k) => [k, '']),
        instruction: `Label the ${M.planWord || 'map'} below.<br>Write the correct letter, <b>${keys[0]}–${keys[keys.length - 1]}</b>, next to Questions 16–20.` });
    }

    // Part 3 · matching or choose TWO (Q27–30)
    const P = P3[n], p3 = d.parts[2];
    if (P && p3) {
      if (P.lines) { replaceSegments(p3, P.lines[0], P.lines[1], P.segments); } else replaceSegments(p3, 7, 10, P.segments);
      p3.groups = p3.groups.filter((g) => g.from < 27).map((g) => (g.to > 26 ? Object.assign(g, { to: 26 }) : g));
      if (P.kind === 'match') {
        P.qs.forEach(([item, ans, why], i) => setQuestion(d, p3, { id: 27 + i, type: 'match', prompt: item, answer: ans, explanation: why }));
        p3.groups.push({ from: 27, to: 30, kind: 'match', options: P.options, boxTitle: P.boxTitle, instruction: P.instruction });
      } else {
        P.pairs.forEach((pair, k) => {
          const a = 27 + k * 2;
          [a, a + 1].forEach((id) => setQuestion(d, p3, { id, type: 'multi', prompt: pair.prompt, answer: pair.answer[0], acceptedAnswers: [pair.answer[1]], explanation: `Answers: ${pair.answer.join(' and ')} (in either order). ${pair.why}` }));
          p3.groups.push({ from: a, to: a + 1, kind: 'multi', prompt: pair.prompt, options: pair.options, instruction: `Choose <b>TWO</b> letters, <b>A–E</b>.` });
        });
      }
    }
    d.parts.forEach((p) => { p.description = describe(p.groups); });
    d.transcript = d.parts.map((p, i) => `PART ${i + 1} — ${p.title}\n\n${p.transcript}`).join('\n\n');
  }

  // ---------------- Reading ----------------
  // Default grouping for every passage; authored tasks below replace some blocks.
  function readingGroups(passage, pi) {
    const limit = limitFrom(passage.subtitle, 'ONE WORD ONLY');
    return runs(passage.questions).map((r) => {
      const g = { from: r.qs[0].id, to: r.qs[r.qs.length - 1].id };
      if (r.t === 'tfng') return Object.assign(g, { kind: 'tfng', instruction: `Do the following statements agree with the information given in Reading Passage ${pi + 1}?<br>Write <b>TRUE</b>, <b>FALSE</b> or <b>NOT GIVEN</b>.` });
      if (r.t === 'mcq') { const n = r.qs[0].options.length; return Object.assign(g, { kind: 'mcq', instruction: `Choose the correct letter, <b>${'ABCDEFG'.slice(0, n - 1).split('').join(', ')} or ${'ABCDEFG'[n - 1]}</b>.` }); }
      if (r.qs.some((q) => !/_{3,}/.test(q.prompt))) return Object.assign(g, { kind: 'short', instruction: `Answer the questions below.<br>Choose <b>${limit}</b> from the passage for each answer.` });
      return Object.assign(g, { kind: pi === 0 ? 'notes' : 'sentences', heading: pi === 0 ? passage.title : '', instruction: `Complete the ${pi === 0 ? 'notes' : 'sentences'} below.<br>Choose <b>${limit}</b> from the passage for each answer.` });
    });
  }
  window.BandoraReadingTasks = window.BandoraReadingTasks || {};
  for (let n = 1; n <= 10; n++) {
    const set = setFor('reading', n);
    if (!set) continue;
    const d = set.data;
    d.passages.forEach((p, i) => { p.groups = readingGroups(p, i); });
    const T = window.BandoraReadingTasks[n];
    if (!T) continue;
    T.forEach((task) => applyReadingTask(d, task));
  }
  function applyReadingTask(d, t) {
    const p = d.passages[t.passage];
    const ids = t.items.map((_, i) => t.from + i);
    const to = ids[ids.length - 1];
    // remove/trim overlapping default groups
    p.groups = p.groups.flatMap((g) => {
      if (g.to < t.from || g.from > to) return [g];
      const keep = [];
      if (g.from < t.from) keep.push(Object.assign({}, g, { to: t.from - 1 }));
      if (g.to > to) keep.push(Object.assign({}, g, { from: to + 1 }));
      return keep;
    });
    if (t.kind === 'headings' || t.kind === 'matchinfo') p.lettered = true;
    const n = p.paragraphs.length;
    t.items.forEach((it, i) => {
      const q = { id: ids[i], prompt: it[0], answer: t.kind === 'wordbox' ? LETTERS[t.words.indexOf(it[1])] : it[1], explanation: it[2] };
      if (t.kind === 'wordbox' && t.words.indexOf(it[1]) < 0) console.warn('wordbox answer missing', it);
      q.type = t.kind;
      if (t.kind === 'ynng') q.answer = it[1];
      setQuestion(d, p, q);
    });
    const g = { from: t.from, to, kind: t.kind };
    if (t.kind === 'headings') {
      g.options = t.headings.map((h, i) => [ROMAN[i], h]);
      g.boxTitle = 'List of Headings';
      g.instruction = `Reading Passage ${t.passage + 1} has ${n} paragraphs, <b>A–${LETTERS[n - 1]}</b>.<br>Choose the correct heading for each paragraph from the list of headings below. Write the correct number, <b>i–${ROMAN[t.headings.length - 1]}</b>.`;
    } else if (t.kind === 'matchinfo') {
      g.options = LETTERS.slice(0, n).split('').map((l) => [l, 'Paragraph ' + l]);
      g.instruction = `Reading Passage ${t.passage + 1} has ${n} paragraphs, <b>A–${LETTERS[n - 1]}</b>.<br>Which paragraph contains the following information? Write the correct letter, <b>A–${LETTERS[n - 1]}</b>.${t.reuse ? '<br><b>NB</b> You may use any letter more than once.' : ''}`;
      g.noBox = true;
    } else if (t.kind === 'wordbox') {
      g.options = t.words.map((w, i) => [LETTERS[i], w]);
      g.heading = t.heading || '';
      g.instruction = `Complete the summary using the list of words, <b>A–${LETTERS[t.words.length - 1]}</b>, below.`;
    } else if (t.kind === 'ynng') {
      g.instruction = `Do the following statements agree with the claims of the writer in Reading Passage ${t.passage + 1}?<br>Write <b>YES</b>, <b>NO</b> or <b>NOT GIVEN</b>.`;
    } else if (t.kind === 'endings') {
      g.options = t.endings.map((e, i) => [LETTERS[i], e]);
      g.instruction = `Complete each sentence with the correct ending, <b>A–${LETTERS[t.endings.length - 1]}</b>, below.`;
    }
    p.groups.push(g);
    p.groups.sort((a, b) => a.from - b.from);
    // keep the passage subtitle short and accurate
    p.subtitle = 'Original fictional text written for Bandora practice.';
  }
  window.BandoraApplyReadingTask = applyReadingTask;
})();
