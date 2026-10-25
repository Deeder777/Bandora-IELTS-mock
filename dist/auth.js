/* Bandora Auth: Supabase REST + S256 PKCE. Only public publishable/anon keys belong here.
   Docs: https://supabase.com/docs/guides/auth/sessions/pkce-flow
   API: https://github.com/supabase/auth/blob/master/openapi.yaml */
(function () {
  'use strict';
  const SESSION_KEY = 'bandora.auth.session.v1';
  const FLOW_KEY = 'bandora.auth.pkce.v1';
  const modes = ['login', 'register', 'forgot', 'reset'];
  let session = null, verified = false, refreshJob = null, refreshTimer = null;
  let initialMode = null, initialMessage = '', recovery = false, initJob = null;
  const escape = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = name => '<svg viewBox="0 0 24 24" aria-hidden="true" class="ba-icon" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + ({arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',back:'<path d="m14 6-6 6 6 6"/>',eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',lock:'<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',check:'<path d="m5 12 4 4L19 6"/>',mail:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',spark:'<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4Z"/>'}[name] || '') + '</svg>';
  const google = '<svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.42l-3.24-2.5c-.9.6-2.05.96-3.37.96-2.61 0-4.82-1.76-5.61-4.12H3.04v2.59A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.39 13.92A6 6 0 0 1 6.07 12c0-.67.12-1.32.32-1.92V7.49H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.51l3.35-2.59Z"/><path fill="#EA4335" d="M12 5.96c1.47 0 2.79.5 3.82 1.5l2.86-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.96 5.49l3.35 2.59C7.18 7.72 9.39 5.96 12 5.96Z"/></svg>';
  function storageGet(key) { try { return JSON.parse(sessionStorage.getItem(key)); } catch (_) { return null; } }
  function storageSet(key, value, required) { try { sessionStorage.setItem(key, JSON.stringify(value)); } catch (_) { if (required) throw new Error('Allow session storage in your browser to sign in securely.'); } }
  function storageRemove(key) { try { sessionStorage.removeItem(key); } catch (_) {} }
  function config() {
    const raw = window.BANDORA_AUTH || window.BANDLY_AUTH || {};
    const key = String(raw.publishableKey || raw.anonKey || '').trim();
    let url;
    try { url = new URL(String(raw.url || '').trim()); } catch (_) { return null; }
    if (!(url.protocol === 'https:' || (url.protocol === 'http:' && ['localhost','127.0.0.1','[::1]'].includes(url.hostname))) || url.username || url.password || url.search || url.hash) return null;
    let publicKey = /^sb_publishable_[A-Za-z0-9_-]+$/.test(key);
    if (!publicKey && key.split('.').length === 3) {
      try { const part = key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'); publicKey = JSON.parse(atob(part.padEnd(Math.ceil(part.length/4)*4,'='))).role === 'anon'; } catch (_) {}
    }
    if (!publicKey) return null;
    return {url:url.origin, key};
  }
  function configured() { return !!config() && ['http:','https:'].includes(window.location.protocol); }
  function unavailable() { return window.location.protocol === 'file:' ? 'Sign-in needs the hosted website. You can still explore the practice space as a guest.' : 'Account sign-in is not available yet. Explore the practice space as a guest for now.'; }
  function ensureConfigured() { if (!configured()) throw new Error(unavailable()); return config(); }
  function user() { return verified && session && session.user ? JSON.parse(JSON.stringify(session.user)) : null; }
  function emit(type) { window.dispatchEvent(new CustomEvent('bandly:auth-change', {detail:{type,user:user()}})); }
  function clearSession() { session = null; verified = false; recovery = false; clearTimeout(refreshTimer); storageRemove(SESSION_KEY); }
  function scheduleRefresh(delay) {
    clearTimeout(refreshTimer);
    if (!session) return;
    refreshTimer = setTimeout(() => refresh().catch(error => {
      if (session && ![400,401,403].includes(error.status)) scheduleRefresh(30000);
    }), delay == null ? Math.max(1000, session.expires_at*1000-Date.now()-60000) : delay);
  }
  function adopt(data, isRecovery) {
    if (!data || !data.access_token || !data.refresh_token || !data.user || !data.user.id) throw new Error('Sign-in did not return a valid session. Please try again.');
    session = {access_token:data.access_token, refresh_token:data.refresh_token, expires_at:Number(data.expires_at)||Math.floor(Date.now()/1000)+Number(data.expires_in||3600), user:data.user, project:config().url, recovery:!!isRecovery};
    verified = true; recovery = !!isRecovery;
    storageSet(SESSION_KEY,session,false); scheduleRefresh();
  }
  function apiError(data, status) {
    const code = data && (data.error_code || data.code || data.error);
    const map = {invalid_credentials:'The email or password is incorrect. Please try again.',email_not_confirmed:'Please confirm your email before signing in.',user_already_exists:'Please sign in or reset your password to continue.',weak_password:'Choose a stronger password with at least 8 characters.',same_password:'Choose a password you have not used before.',over_email_send_rate_limit:'Too many emails requested. Please wait a few minutes before trying again.',over_request_rate_limit:'Too many attempts. Please wait a few minutes and try again.',captcha_failed:'Account protection requires additional verification. Contact the site owner to enable sign-in.',provider_disabled:'Google sign-in is not enabled yet. Please use email and password.',email_provider_disabled:'Email sign-in is not enabled yet.',signup_disabled:'New accounts are not available right now.',bad_code_verifier:'This link belongs to another browser tab. Open it in the tab where you requested it.',flow_state_expired:'This sign-in link has expired. Please request a new one.',otp_expired:'This link has expired or has already been used. Please request a new one.'};
    const error = new Error(map[code] || (status === 429 ? 'Too many attempts. Please wait a few minutes and try again.' : status >= 500 ? 'The sign-in service is temporarily unavailable. Please try again shortly.' : 'We could not complete that request. Check your details and try again.'));
    error.status = status; return error;
  }
  async function request(path, options) {
    const c = ensureConfigured(), opts = options || {};
    const headers = {'apikey':c.key,'Content-Type':'application/json'};
    if (opts.token) headers.Authorization = 'Bearer ' + opts.token;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(c.url+'/auth/v1'+path, {method:opts.method||'POST',headers,body:opts.body ? JSON.stringify(opts.body) : undefined,signal:controller.signal,credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer'});
      let data = {}; try { data = await response.json(); } catch (_) {}
      if (!response.ok) throw apiError(data,response.status);
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('The request timed out. Please try again.');
      if (error instanceof TypeError) throw new Error('We could not connect. Check your internet connection and try again.');
      throw error;
    } finally { clearTimeout(timeout); }
  }
  async function refresh() {
    if (!session) return null;
    if (refreshJob) return refreshJob;
    const current = session;
    refreshJob = (async () => {
      try {
        const data = await request('/token?grant_type=refresh_token',{body:{refresh_token:current.refresh_token}});
        // A sign-out or a new sign-in may have happened while the request was in flight.
        if (session !== current) return null;
        adopt(data,recovery); emit('TOKEN_REFRESHED'); return session.access_token;
      } catch (error) {
        if ([400,401,403].includes(error.status) && session === current) { clearSession(); emit('SIGNED_OUT'); }
        throw error;
      } finally { refreshJob = null; }
    })();
    return refreshJob;
  }
  async function getAccessToken() {
    if (!session || !verified) return null;
    if (session.expires_at*1000-Date.now() < 60000) return refresh();
    return session.access_token;
  }
  function base64url(bytes) { return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
  async function beginFlow(purpose) {
    ensureConfigured();
    if (!window.crypto || !window.crypto.subtle) throw new Error('Secure sign-in needs HTTPS or localhost. Please open the hosted website.');
    const verifier = base64url(crypto.getRandomValues(new Uint8Array(48)));
    const digest = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier));
    storageSet(FLOW_KEY,{verifier,purpose,created:Date.now(),project:config().url},true);
    return {code_challenge:base64url(new Uint8Array(digest)),code_challenge_method:'s256'};
  }
  function callbackURL(purpose) { const url = new URL(window.location.href); url.search=''; url.hash=''; url.searchParams.set('auth',purpose === 'recovery' ? 'reset' : 'callback'); return url.href; }
  async function signIn(email,password) { const data = await request('/token?grant_type=password',{body:{email,password}}); adopt(data,false); initialMessage=''; emit('SIGNED_IN'); return user(); }
  async function signUp(email,password,name) {
    const challenge = await beginFlow('signup');
    const data = await request('/signup?redirect_to='+encodeURIComponent(callbackURL('signup')),{body:{email,password,data:{full_name:name},...challenge}});
    if (data.access_token) { storageRemove(FLOW_KEY); adopt(data,false); emit('SIGNED_IN'); return {user:user()}; }
    return {confirmation:true};
  }
  async function sendRecovery(email) {
    const challenge = await beginFlow('recovery');
    await request('/recover?redirect_to='+encodeURIComponent(callbackURL('recovery')),{body:{email,...challenge}});
  }
  async function signInGoogle() {
    const c = ensureConfigured(), challenge = await beginFlow('oauth');
    const url = new URL(c.url+'/auth/v1/authorize');
    url.search = new URLSearchParams({provider:'google',redirect_to:callbackURL('oauth'),...challenge}).toString();
    window.location.assign(url.href);
  }
  async function changePassword(password) {
    const token = await getAccessToken();
    if (!token || !recovery) throw new Error('Request a new reset link before changing your password.');
    const updatedUser = await request('/user',{method:'PUT',token,body:{password}});
    session.user=updatedUser; session.recovery=false; recovery=false; storageSet(SESSION_KEY,session,false);
    emit('USER_UPDATED'); return user();
  }
  async function signOut() {
    const old=session; clearSession(); storageRemove(FLOW_KEY); emit('SIGNED_OUT');
    if (!old) return {remoteRevoked:true};
    try { await request('/logout?scope=local',{token:old.access_token}); return {remoteRevoked:true}; }
    catch (_) { return {remoteRevoked:false}; }
  }
  async function initialize() {
    const url = new URL(window.location.href);
    const hash = new URLSearchParams(url.hash.slice(1));
    const authCode = url.searchParams.get('code');
    const callbackError = url.searchParams.get('error') || hash.get('error');
    const hasImplicitTokens = hash.has('access_token') || hash.has('refresh_token');
    const hasCallback = !!authCode || !!callbackError || hasImplicitTokens;
    const requestedReset = url.searchParams.get('auth') === 'reset';
    // Strip authentication material before rendering, networking, or loading other pages.
    if (hasCallback || url.searchParams.has('auth')) {
      ['code','auth','error','error_code','error_description'].forEach(key => url.searchParams.delete(key));
      if (hasImplicitTokens || callbackError) url.hash='';
      try { window.history.replaceState({},'',url.pathname+url.search+url.hash); } catch (_) {}
    }
    if (!configured()) { initialMode=hasCallback?'login':null; initialMessage=hasCallback?unavailable():''; return {user:null,mode:initialMode,message:initialMessage}; }
    try {
      if (callbackError) { storageRemove(FLOW_KEY); throw new Error('Sign-in was cancelled or the link has expired. Please try again.'); }
      if (hasImplicitTokens) throw new Error('This link uses an older sign-in flow. Please request a fresh link from this page.');
      if (authCode) {
        const flow = storageGet(FLOW_KEY); storageRemove(FLOW_KEY);
        if (!flow || !flow.verifier || flow.project!==config().url || Date.now()-flow.created>86400000) throw new Error('Open this link in the same browser tab where you requested it, or request a new link.');
        const data = await request('/token?grant_type=pkce',{body:{auth_code:authCode,code_verifier:flow.verifier}});
        adopt(data,flow.purpose==='recovery'); initialMode = recovery ? 'reset' : null; emit('SIGNED_IN');
      } else {
        const saved = storageGet(SESSION_KEY);
        if (saved && saved.project===config().url && saved.access_token && saved.refresh_token) {
          session=saved; recovery=!!saved.recovery;
          if (Number(saved.expires_at)*1000-Date.now()<60000) await refresh();
          else {
            const validUser = await request('/user',{method:'GET',token:saved.access_token});
            if (!validUser.id) throw new Error('Your session has expired. Please sign in again.');
            session.user=validUser; verified=true; storageSet(SESSION_KEY,session,false); scheduleRefresh();
          }
          if (recovery) initialMode='reset';
        } else if (requestedReset) throw new Error('Request a new password reset link to continue.');
      }
    } catch (error) { clearSession(); initialMode='login'; initialMessage=error.message; }
    return {user:user(),mode:initialMode,message:initialMessage};
  }
  function init() { if (!initJob) initJob=initialize(); return initJob; }
  function passwordField(label,confirm) {
    const id=confirm?'ba-confirm':'ba-password';
    return '<div class="ba-field"><label for="'+id+'">'+label+'</label><div class="ba-password-wrap"><input id="'+id+'" name="'+(confirm?'confirm':'password')+'" type="password" autocomplete="'+(label==='Password'?'current-password':'new-password')+'" placeholder="'+(confirm?'Repeat your password':'Enter your password')+'" required '+(label==='Password'?'':'minlength="8" ')+'maxlength="128"><button type="button" class="ba-eye" data-ba-reveal="'+id+'" aria-label="Show '+label.toLowerCase()+'" aria-pressed="false">'+icon('eye')+'</button></div></div>';
  }
  function render(mode) {
    mode=modes.includes(mode)?mode:(initialMode||'login');
    const register=mode==='register', forgot=mode==='forgot', reset=mode==='reset';
    const title=register?'Make room for your ambition.':forgot?'A fresh start.':reset?'Set a new password.':'Your next chapter starts here.';
    const subtitle=register?'Create your account and make every practice session count.':forgot?'Enter your email and we’ll send you a password reset link.':reset?'Choose a strong password to keep your account secure.':'Welcome back. Let’s take one more step towards your target band.';
    const button=register?'Create account':forgot?'Send reset link':reset?'Save new password':'Log in';
    const email='<div class="ba-field"><label for="ba-email">Email address</label><input id="ba-email" name="email" type="email" autocomplete="email" inputmode="email" placeholder="you@example.com" maxlength="254" required></div>';
    return '<section class="ba-page" aria-label="Account access"><aside class="ba-story"><button type="button" class="ba-brand" data-ba-guest aria-label="Bandora home"><span class="ba-brand-mark">'+window.BandoraMark+'</span>Bandora</button><div class="ba-story-copy"><span class="ba-kicker">FOUR SKILLS. ONE CONNECTED WORKSPACE.</span><h1>Your next chapter.<br><span>Starts right here.</span></h1><p>Ten complete Academic test tickets. Four skills. A little more confidence with every session.</p></div><div class="ba-visual" aria-hidden="true">'+window.BandoraArtwork('4','CONNECTED SKILLS')+'</div><div class="ba-story-foot"><span>Reading</span><i></i><span>Listening</span><i></i><span>Writing</span><i></i><span>Speaking</span></div></aside><div class="ba-access"><header class="ba-access-top"><button type="button" class="ba-back" data-ba-guest>'+icon('back')+' Back to practice</button><span>ACADEMIC IELTS</span></header><div class="ba-form-area"><div class="ba-form-eyebrow">'+(register?'YOUR JOURNEY, YOUR PACE':forgot||reset?'ACCOUNT RECOVERY':'GOOD TO SEE YOU AGAIN')+'</div><h2 tabindex="-1" class="ba-title">'+title+'</h2><p class="ba-subtitle">'+subtitle+'</p>'+(!configured()?'<div class="ba-setup-note">'+icon('lock')+'<p>'+escape(unavailable())+'</p></div>':'')+'<div class="ba-feedback" role="status" aria-live="polite" tabindex="-1"'+(!initialMessage?' hidden':'')+'>'+escape(initialMessage)+'</div>'+(!forgot&&!reset?'<button type="button" class="ba-google" data-ba-google'+(!configured()?' aria-disabled="true"':'')+'>'+google+' Continue with Google</button><div class="ba-divider"><span>or continue with email</span></div>':'')+'<form data-ba-form data-mode="'+mode+'" novalidate>'+(register?'<div class="ba-field"><label for="ba-name">Your name</label><input id="ba-name" name="name" autocomplete="name" placeholder="How should we call you?" maxlength="80" required></div>':'')+(!reset?email:'')+(!forgot?passwordField(register||reset?'Create password':'Password',false):'')+(reset?passwordField('Confirm password',true):'')+(register||reset?'<p class="ba-field-hint">Use at least 8 characters. A longer, unique password is best.</p>':'')+(!forgot&&!reset&&!register?'<div class="ba-forgot"><button type="button" data-ba-mode="forgot">Forgot password?</button></div>':'')+'<button class="ba-submit" type="submit"'+(!configured()?' aria-disabled="true"':'')+'><span>'+button+'</span>'+icon('arrow')+'</button></form><div class="ba-switch">'+(register?'Already have an account? <button type="button" data-ba-mode="login">Log in</button>':forgot||reset?'<button type="button" data-ba-mode="login">Back to log in</button>':'New here? <button type="button" data-ba-mode="register">Create an account</button>')+'</div><button type="button" class="ba-guest" data-ba-guest>Continue as guest '+icon('arrow')+'</button><p class="ba-private">'+icon('lock')+' Passwords are never stored in this app.</p></div><footer class="ba-access-foot">A little closer, every day.<span>Independent IELTS practice</span></footer></div></section>';
  }
  function bind(container,onAuth) {
    const root=container.querySelector('.ba-page'); if (!root) return;
    const feedback=root.querySelector('.ba-feedback');
    const notify=(message,success) => { feedback.hidden=false; feedback.classList.toggle('ba-success',!!success); feedback.textContent=message; feedback.focus(); };
    const switchMode=mode => { initialMessage=''; container.innerHTML=render(mode); bind(container,onAuth); const title=container.querySelector('.ba-title'); if(title)title.focus(); };
    const complete=type => { if(typeof onAuth==='function') onAuth({type,user:user()}); };
    root.querySelectorAll('[data-ba-mode]').forEach(button => button.addEventListener('click',() => switchMode(button.dataset.baMode)));
    root.querySelectorAll('[data-ba-guest]').forEach(button => button.addEventListener('click',() => complete('guest')));
    root.querySelectorAll('[data-ba-reveal]').forEach(button => button.addEventListener('click',() => { const input=root.querySelector('#'+button.dataset.baReveal); const show=input.type==='password'; input.type=show?'text':'password'; button.setAttribute('aria-pressed',String(show)); button.setAttribute('aria-label',(show?'Hide':'Show')+' password'); }));
    const setLoading=loading => { root.querySelectorAll('button,input').forEach(el => el.disabled=loading); root.setAttribute('aria-busy',String(loading)); };
    const oauth=root.querySelector('[data-ba-google]');
    if(oauth)oauth.addEventListener('click',async() => { if(!configured()){notify(unavailable());return;} setLoading(true); try{await signInGoogle();}catch(error){notify(error.message);setLoading(false);} });
    const form=root.querySelector('[data-ba-form]');
    form.addEventListener('submit',async event => {
      event.preventDefault(); if(!configured()){notify(unavailable());return;}
      if(!form.reportValidity()) return;
      const data=new FormData(form), mode=form.dataset.mode;
      const email=String(data.get('email')||'').trim(), name=String(data.get('name')||'').trim();
      let password=String(data.get('password')||'');
      if(mode==='register'&&!name){notify('Please enter your name.');return;}
      if((mode==='register'||mode==='reset')&&password.length<8){notify('Use at least 8 characters for your password.');return;}
      if(mode==='reset'&&password!==data.get('confirm')){notify('The passwords do not match. Please try again.');return;}
      feedback.hidden=true; setLoading(true);
      const submit=form.querySelector('.ba-submit span'), originalLabel=submit.textContent; submit.textContent='Please wait…';
      try {
        if(mode==='login'){await signIn(email,password);form.reset();complete('signed-in');}
        else if(mode==='register'){
          const result=await signUp(email,password,name);
          form.querySelector('[name="password"]').value='';
          if(result.user)complete('signed-in');
          else notify('Check your email to confirm your account. Open the confirmation link in this same browser tab. If you already have an account, use Log in instead.',true);
        } else if(mode==='forgot') {
          await sendRecovery(email);
          notify('If an account exists for this email, a reset link is on its way. Open the link in this same browser tab to choose a new password.',true);
        } else if(mode==='reset') {
          await changePassword(password); form.reset(); initialMessage=''; complete('signed-in');
        }
      } catch(error) { notify(error.message); }
      finally { password=''; setLoading(false); submit.textContent=originalLabel; }
    });
  }
  window.AuthUI=Object.freeze({init,render,bind,user,configured,signOut,getAccessToken});
})();
