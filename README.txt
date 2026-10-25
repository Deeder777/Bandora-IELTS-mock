BANDORA — IELTS ACADEMIC PRACTICE

This source package runs without a build step or package installation.

START THE WEBSITE
1. Unzip this package.
2. Install Node.js from https://nodejs.org/ if it is not installed.
3. Open a terminal in this folder and run: node server.mjs
4. Open http://127.0.0.1:4317/ in a modern browser.
5. Keep the terminal running; press Ctrl+C to stop the preview.

The server binds to your computer's loopback interface and serves only dist/.
It does not expose setup files or create a public website.

PACKAGE CONTENTS
- dist/: website files ready to serve or upload to an HTTPS static host.
- setup/SUPABASE-SETUP.md: activation instructions for email/password and Google.
- setup/supabase.sql: private, account-scoped progress table and access policies.
- server.mjs: local preview server, with no third-party dependencies.

The separate Bandora-IELTS.html deliverable is a standalone guest preview.
Bandly-IELTS.html is a compatibility copy of that same upgraded preview.
Local CSS and JavaScript are embedded. Google Fonts still need the internet;
system fallback fonts remain available. Sign-in needs HTTP(S), not file://.

ACCOUNTS AND SAVED WORK
Account screens are implemented, but live accounts require your Supabase setup.
Follow setup/SUPABASE-SETUP.md, run its SQL in your project, and configure Email,
Google, redirect URLs, and SMTP. Then edit dist/auth-config.js with your public
project URL and publishable key (or a legacy anon key). Never put private keys,
passwords, or Google client secrets in website files. This package includes no
configured project and does not create external accounts for you.

Once configured, completed history (latest 50), target band, daily practice goal,
and exam date can sync to the signed-in account. Guest progress stays on this
browser and is not automatically uploaded. Unfinished sessions and timers stay
local. Export results for a separate copy. Multiple devices use the last
successful cloud save. Speaking recordings stay in the recording tab until
downloaded; refresh, closing the tab, or starting another session removes them.

PRACTICE CONTENT
- 10 complete Academic test tickets, with all four sections in every ticket.
- Each ticket: Listening 4 parts / 40 questions / 30 minutes; Reading 3 full
  passages / 40 questions / 60 minutes; Writing 2 tasks / 60 minutes; and
  Speaking 3 guided parts / 14 minutes.
- Total across tickets: 800 scored questions, 20 Writing tasks, 30 Speaking parts.
- Writing Task 1 includes tables, bar/line charts, processes and before/after plans.
- Full test tickets is the default library view. Each card shows section progress.
  Start full ticket selects exam mode; results link to the next section.
- Original 12 sessions remain under Short exercises & individual sections.
  Ticket 01 uses existing full Reading/Listening and first Writing/Speaking sets.
- Listening uses generated browser audio, with separate playback per part.
  In exam mode each part plays once; its timer continues while you are away.
- Official Cambridge English, IELTS and British Council resource links are retained.
- Answers, flags, explanations, mistake review, local progress and result exports.

These are original learning materials. Reading and Listening show raw practice
scores, not calibrated IELTS bands. Writing and Speaking use self-review;
neither claims an examiner score. The website is independent of IELTS and its
owners. Browser audio and microphone availability depend on the device/browser.

PUBLISHING
Upload the contents of dist/ to your own HTTPS static host, then set that exact
domain/path in the Supabase and Google redirect settings. No Node server is
needed on a static production host. Do not upload setup/ as web content.
Live hosted publication was not completed: the required source upload was
blocked by the current approval configuration. A reserved URL or private
owner-only Sites preview must not be treated as a public student website.
Supabase configuration does not change the host's access restrictions.

Official test format: https://ielts.org/take-a-test/test-types/ielts-academic-test
