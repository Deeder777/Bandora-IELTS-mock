// Copy to auth-config.js and fill in your Supabase PUBLIC project settings.
// This file is intentionally safe to serve to the browser. Never add a secret
// key, service_role key, Google client secret, database password, or SMTP secret.
window.BANDORA_AUTH = {
  url: '', // Example: https://your-project.supabase.co
  publishableKey: '' // Example: sb_publishable_... (legacy anon keys also work)
};
// In Supabase Auth, enable Email and Google. Configure Google's client secret
// only in the Supabase dashboard, never in this file. Add this website's exact
// callback URLs (?auth=callback and ?auth=reset) to Auth > URL Configuration.
// All redirect flows use S256 PKCE. Email links must be opened in the browser
// tab where they were requested; the verifier and session tokens are held in
// sessionStorage. Configure production SMTP for confirmation/recovery emails.
