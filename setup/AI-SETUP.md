# Turning on AI examiner feedback

Bandora's Writing and Speaking result pages have a **Check with AI** button. It calls a small
Netlify Function (`netlify/functions/assess.mjs`) that sends the answer to the Claude API and
returns criterion bands, corrections and vocabulary tips.

The API key is stored **only in Netlify's environment variables**. It is never in the website
files, so visitors cannot see it.

## 1. Create an API key
1. Go to https://console.anthropic.com and sign in.
2. Add a little credit under **Billing** (each check costs roughly 1–3 US cents).
3. Open **API Keys → Create Key**, name it `bandora`, and copy it.

## 2. Add it to Netlify
1. Netlify → your site (**bandora-ielts**) → **Site configuration → Environment variables**.
2. **Add a variable**: Key `ANTHROPIC_API_KEY`, Value = your key. Scope: Functions.
3. Optional:
   - `ANTHROPIC_MODEL` – default `claude-sonnet-5-5`. Use `claude-haiku-5-5` for cheaper, simpler feedback.
   - `BANDORA_HOURLY_LIMIT` – checks per visitor per hour (default 12).

## 3. Deploy from GitHub
Functions only run when Netlify builds the site from the GitHub repository
(**Site configuration → Build & deploy → Link repository**, publish directory `dist`).
Drag-and-drop deploys of the `dist` folder do **not** include functions.

After the next deploy, open a Writing result and press **Check my writing with AI**.

## Cost control
- Set a monthly spend limit in the Anthropic console (**Billing → Limits**).
- The function refuses very short answers and limits each visitor per hour.

## Local preview
`ANTHROPIC_API_KEY=your-key node server.mjs` – the local server also answers `/api/assess`.
