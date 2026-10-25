/* Bandora site switches. Edit and redeploy.
   accounts: false → no login screen, everyone practises as a guest (progress saved in this browser).
                     Set to true after filling in auth-config.js (Supabase) to bring sign-in back. */
window.BANDORA_CONFIG = { accounts: false };
(function () {
  if (window.BANDORA_CONFIG.accounts) return;
  try { sessionStorage.setItem('bandora-guest', 'yes'); } catch (e) { /* storage blocked: guest is still chosen below */ }
  try { document.documentElement.classList.add('bd-no-accounts'); } catch (e) { /* not a browser */ }
})();
