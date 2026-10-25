# Bandora design adaptation

The website now uses the visual direction from the user-provided
`bandora-website.zip`: a pale lavender surface, purple/pink/orange gradients,
the Bandora monogram, rounded cards and dark exam headers.

Typography uses Bricolage Grotesque for headings, Plus Jakarta Sans for the
interface, IBM Plex Mono for timers and numbers, and Source Serif 4 for long
reading and writing text. Fonts load from Google Fonts; local system fonts
are available as fallbacks.

`dist/reference-design.css` styles the application. `reference-design.js`
provides the navigation and dashboard connected to saved practice data.
The supplied logo SVGs are retained in `dist/assets/`, with the prototype's
inline white mark used in the application and an embedded favicon for the
standalone HTML file.

All ten complete tickets use the existing practice engine, timers, answer
keys, notebook, recording controls and progress storage. Dashboard results
come from the learner's history. The supplied prototype's simulated audio,
recording controls, sample scores and placeholder prices are not used.

Automated checks cover all six workspace pages, forty ticket sections,
grading, result exports, next-section navigation and mocked authentication.
A new visual browser check was unavailable under the browser-access restriction.

## Motion layer

`dist/motion.css` and `dist/motion.js` add the prototype's animations without
changing the practice engine:

- **Page change:** the header slides in and hero copy rises in a staggered sequence.
- **Snapshot card:** the snapshot card, passage panel and question panel scale in.
- **Scrolling:** stat tiles, skill cards, ticket cards and other cards reveal in sequence. Section headings reveal behind a mask.
- **Header progress line:** a gradient line along the bottom of the header fills as you scroll.
- **Numbers:** they count up when they appear. This covers the stat band, the ticket ring and the result score.
- **Bars and ring:** the ticket progress ring fills, and the progress breakdown bars grow.
- **Ambient effects:** the hero gradient text shifts, the hero glow drifts slowly, and the announcement pill floats.
- **Hover and press:** cards lift on hover, and buttons lift and press.
- **Exam screen:** questions rise in. A selected answer "pops". The timer pulses gently under five minutes.
- **Modals and toasts:** modals pop in with a fading backdrop, and toasts slide up.

Entrances replay only when the page actually changes, not on timer ticks or when an answer is saved.
Everything is skipped under "reduce motion" and outside real browsers (the vm-based tests).
To turn it off, remove the two `motion` tags from `dist/index.html`.

## Prototype applied 1:1 (bandora-design.js / .css / bands.js)

**Overview** is now the prototype landing page, filled with real data:

- **Hero:** includes the Academic / General Training switch; General shows a "coming soon" note.
- **Live score report card:** shows your overall band, the four section bars and your weakest area. A labelled example report appears until a section is completed.
- **Below the hero:** the marquee, the format strip and the four section cards (each starts that section of your next ticket).
- **Dark "How it works":** the three steps.
- **4-week path slider:** steps are marked Done from your history.
- **Further down:** pricing, FAQ, the gradient call to action and the big wordmark.

**Band estimates (`bands.js`):**

- **Listening and Academic Reading:** a full 40-question section is converted with the published raw-score ranges.
- **Writing and Speaking:** the learner rates the four criteria (guidance text per level, plus automatic text checks for Writing). The band is their average.
- **Overall:** the mean of the four section bands, rounded like IELTS (.25 → .5, .75 → next band).
- **Short exercises:** they get no band.

**Results:**

- **Overview card:** a dark card with the band ring, the change since the last attempt, and four section tiles.
- **Breakdown:** criteria ratings, or question-type bars for Listening and Reading.
- **Band trend:** a chart with your target line.
- **"Your next focus":** three cards. Answer explanations are kept below.

**Progress:** an "Estimated overall band" card is added.

**Exam screens:** a time-remaining bar in the header, a word-count progress bar in Writing, a dark selected answer, and dark/orange navigator states.

**Pricing:** edit `PLANS` at the top of `dist/bandora-design.js`.

- No payment provider is connected.
- Choosing a plan saves `{id, date}` to the profile, which syncs to Supabase for signed-in users.

**Backend changes:**

- **`profile-sync.js`:** keeps `rating` (c1–c4, 1–9) on Writing/Speaking history items and an optional `plan`.
- **`supabase.sql`:** allows the `plan` key.
- **Existing projects:** run `setup/supabase-migration-design-update.sql` once.

## Site switches (dist/site-config.js)

- `accounts: false` (current setting): no login screen and no "Log in" button. Everyone practises as a guest, and progress is saved in their browser. To turn sign-in on, fill in `auth-config.js` with your Supabase details, set `accounts: true` and redeploy.
- The pricing section has been removed from the overview. The plan code (`PLANS` in `bandora-design.js` and the `plan` profile field) is kept, so pricing can be brought back later.
- Listening in practice mode: if the browser cannot play the generated audio, a "Read the transcript instead" button appears.
