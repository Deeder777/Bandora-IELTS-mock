# Turning on AI examiner feedback (free)

Bandora's Writing and Speaking result pages have a **Check with AI** button. It calls a small
Netlify Function (`netlify/functions/assess.mjs`). The key is stored **only in Netlify's
environment variables** — never in the website files, so visitors cannot see it.

## Free option: Groq (recommended)
1. Go to https://console.groq.com and sign up (Google account is fine).
2. Open **API Keys → Create API Key**, name it `bandora`, copy it.
3. Netlify → **bandora-ielts → Site configuration → Environment variables → Add a variable**
   - Key: `GROQ_API_KEY`  Value: your key  → Save.
4. **Deploys → Trigger deploy → Deploy site.**

The free plan has daily request limits. If many students check at once the button shows
"busy, try again in a few minutes".

## Other options
- `GEMINI_API_KEY` – Google AI Studio free tier (https://aistudio.google.com/apikey). Small daily limits;
  Google may use free-tier prompts to improve its products, and its terms say the API must not be used
  by services for people under 18.
- `ANTHROPIC_API_KEY` – paid Claude API, best feedback quality.

If several keys are set, Groq is used first, then Gemini, then Anthropic.
Optional overrides: `GROQ_MODEL` (default `openai/gpt-oss-120b`), `GEMINI_MODEL`, `ANTHROPIC_MODEL`,
`BANDORA_HOURLY_LIMIT` (checks per visitor per hour, default 12).

## Notes
- Functions only run when Netlify builds from the GitHub repo (already set up).
- Local preview: `GROQ_API_KEY=your-key node server.mjs`.
