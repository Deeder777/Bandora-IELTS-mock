# Enable student accounts and progress sync

The website includes email/password registration, sign-in, password recovery, Google sign-in, and private progress sync. They become live after you connect your own Supabase project. The delivered files do not contain a working project or secret credentials.

1. **Create your Supabase project.** In the [Supabase dashboard](https://supabase.com/dashboard), create a project you own. Keep the database password in your password manager. From the project's Connect dialog or API settings, copy its project URL and **publishable** key. A legacy **anon** key is also supported. Do not use a secret key, `service_role` key, database password, or Google client secret in website files. Public keys are designed for browser use; database access is controlled by the policies below. [API key guidance](https://supabase.com/docs/guides/getting-started/api-keys).

2. **Create the private progress table.** Open the project's SQL Editor and run the complete adjacent `supabase.sql` file. It is intended for a new `public.practice_progress` table. It creates one row per account, enables Row Level Security, removes anonymous access, and grants authenticated accounts only SELECT, INSERT, and UPDATE on their own row. It does not grant browser DELETE access. Do not disable RLS to resolve a connection error. If your project already has a table with this name, review its existing schema and policies before applying this setup. [RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security).

3. **Connect the website.** Edit `dist/auth-config.js` in the source package:

   ```js
   window.BANDLY_AUTH = {
     url: 'https://YOUR_PROJECT_REF.supabase.co',
     publishableKey: 'sb_publishable_YOUR_PUBLIC_KEY'
   };
   ```

   `window.BANDORA_AUTH` is an accepted alias; set one configuration object, not both. Use the HTTPS origin only, without `/auth/v1`, a path, query, or trailing credentials. A configured Supabase custom HTTPS domain is supported. Serve `dist` through the local web server or your production HTTPS host. A downloaded `file://` HTML preview supports guest practice, but cannot complete account authentication.

4. **Set the application return URLs.** In Supabase Authentication → URL Configuration, set the Site URL to the final website root, for example `https://practice.example.com/`. Add these exact allowed return URLs, replacing the example production host with your own:

   ```text
   http://127.0.0.1:4317/?auth=callback
   http://127.0.0.1:4317/?auth=reset
   http://localhost:4317/?auth=callback
   http://localhost:4317/?auth=reset
   https://practice.example.com/?auth=callback
   https://practice.example.com/?auth=reset
   ```

   The application preserves its current pathname when constructing these URLs. If you host under a subdirectory or open `/index.html`, allowlist that exact path with both query values too. Remove local development entries when no longer needed. [Redirect URL guidance](https://supabase.com/docs/guides/auth/redirect-urls).

5. **Enable email and password accounts.** In Authentication → Sign In / Providers, enable Email and account signup. Keep email confirmation enabled. Configure a custom SMTP provider before inviting students: Supabase's default sender is restricted to pre-authorized organization member addresses and has tight limits. Configure your sender domain and send a real confirmation and reset email to verify delivery. The PKCE confirmation and recovery links must complete in the same browser tab that requested them; copy the email link into that original tab if needed. [Password authentication](https://supabase.com/docs/guides/auth/passwords), [SMTP setup](https://supabase.com/docs/guides/auth/auth-smtp), [PKCE flow](https://supabase.com/docs/guides/auth/sessions/pkce-flow).

6. **Enable Google sign-in.** In your Google Cloud project's Google Auth Platform, configure the consent screen, audience, and basic identity scopes (`openid`, email, profile). Create an OAuth client with type **Web application**. Add your production website origin and development origins as authorized JavaScript origins. Add the exact callback URL shown in Supabase's Google provider screen as an authorized redirect URI. For a hosted Supabase project this is normally:

   ```text
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```

   This Google callback goes to Supabase; the URLs in step 4 bring the learner back to your website. Even when the website runs on localhost, use the hosted project's Supabase callback. Save the Google client ID and secret in Supabase's Google provider settings and enable the provider. The secret stays there, never in the browser. While Google's app is in testing, add your intended test accounts. Complete Google's publishing/verification requirements before opening sign-in to students. [Google provider setup](https://supabase.com/docs/guides/auth/social-login/auth-google).

7. **Verify with two test accounts.** On the served website, register account A, confirm its email, sign in, finish a short practice, and set a target. Confirm the page reports progress synced. Open a separate browser profile, sign in to A, and verify its completed history and settings appear. Sign out and sign in as account B: A's history must not appear. Verify Google sign-in, wrong-password handling, password recovery, and that guest practice still works. In a development project, verify the Data API denies anonymous access and does not let B select or update A's row; a cross-user SELECT should expose no rows, and a cross-user INSERT must be denied. Test RLS before student launch. [Database testing](https://supabase.com/docs/guides/database/testing).

8. **Publish the configured files on your student-facing host.** Upload the contents of `dist` to a host/domain you control and repeat the account checks on its HTTPS URL. A private owner-only Sites preview is not a public student website; adding Supabase login does not change the hosting access policy. This package prepares authentication, but does not create external accounts or deploy those settings for you.

Completed sessions (up to 50), target band, daily practice goal, and exam date sync. Unfinished sessions and timers stay on their current browser. Speaking recordings stay in the recording tab and are never uploaded. Guest work is not automatically copied into an account. Cloud profiles contain no access tokens or passwords. Writing responses are bounded to 20,000 characters per task, speaking notes to 10,000, and short answers to 500. Concurrent edits on separate devices use the last successful save; avoid editing the same account on two devices at once.

Network failures keep local practice available and show “Saved on this browser · Sync unavailable.” The SQL and application are provided for setup; live account, SMTP, OAuth, and database isolation checks still require your configured project. Practice scores are learner progress data, not certified exam scores.
