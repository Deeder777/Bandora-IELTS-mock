/* Account progress only. AuthUI owns sessions; this module never persists tokens. */
(function () {
  'use strict';

  const LOCAL = 'Saved on this browser';
  const UNAVAILABLE = 'Saved on this browser · Sync unavailable';
  const TYPES = ['reading', 'listening', 'writing', 'speaking'];
  const GOALS = [10, 20, 30, 45, 60];
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  let message = LOCAL, messageOwner = null, queue = Promise.resolve(), revision = 0;

  function currentUserId() {
    try {
      const id = window.AuthUI?.user()?.id;
      return typeof id === 'string' && UUID.test(id) ? id : null;
    } catch { return null; }
  }

  function config() {
    const value = window.BANDORA_AUTH || window.BANDLY_AUTH;
    if (!value || typeof value.url !== 'string' || typeof value.publishableKey !== 'string') return null;
    try {
      const url = new URL(value.url);
      // This is deployment configuration, never a URL accepted from a learner.
      // Custom Supabase domains are supported, but no credentials, query, or path.
      if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || !['', '/'].includes(url.pathname)) return null;
      const key = value.publishableKey.trim();
      if (key.startsWith('sb_secret_') || key.length > 4096) return null;
      if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) {
        const pieces = key.split('.');
        if (pieces.length !== 3) return null;
        const encoded = pieces[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=')));
        if (payload.role !== 'anon') return null;
      }
      return { origin: url.origin, key };
    } catch { return null; }
  }

  function setStatus(owner, text) {
    if (currentUserId() !== owner) return;
    messageOwner = owner;
    message = text;
  }

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function number(value, min, max, fallback = 0) {
    return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max ? value : fallback;
  }

  function answerLimit(type) { return type === 'reading' ? 40 : type === 'listening' ? 40 : type === 'writing' ? 2 : 0; }

  function answers(value, type) {
    const output = {};
    if (!isObject(value)) return output;
    const keys = type === 'speaking' ? ['notes', 'speech1', 'speech2', 'speech3', 'speechstats'] : Array.from({ length: answerLimit(type) }, (_, i) => String(i + 1));
    const maxLength = type === 'writing' ? 20000 : type === 'speaking' ? 10000 : 500;
    keys.forEach(key => {
      if (Object.prototype.hasOwnProperty.call(value, key) && typeof value[key] === 'string') output[key] = value[key].slice(0, maxLength);
    });
    return output;
  }

  function session(value) {
    if (!isObject(value) || !TYPES.includes(value.type) || typeof value.id !== 'string' || !/^[A-Za-z0-9_-]{1,100}$/.test(value.id)) return null;
    const type = value.type;
    const maxTotal = type === 'reading' ? 40 : type === 'listening' ? 40 : 0;
    const total = Math.floor(number(value.total, 0, maxTotal));
    const result = {
      id: value.id, type,
      date: Math.floor(number(value.date, 0, 4102444800000)),
      spent: Math.floor(number(value.spent, 0, 86400)),
      answers: answers(value.answers, type),
      score: Math.floor(number(value.score, 0, total)), total,
      expired: value.expired === true,
      mode: value.mode === 'exam' ? 'exam' : 'practice'
    };
    if (typeof value.setId === 'string' && new RegExp('^' + type + '-[0-9]{2,4}$').test(value.setId)) result.setId = value.setId;
    // Self-assessment against the four criteria (Writing / Speaking only), whole bands 1–9.
    if (!maxTotal && isObject(value.rating)) {
      const rating = {};
      for (const key of ['c1', 'c2', 'c3', 'c4']) {
        const n = Number(value.rating[key]);
        if (Number.isInteger(n) && n >= 1 && n <= 9) rating[key] = n;
      }
      if (Object.keys(rating).length) result.rating = rating;
    }
    if (Array.isArray(value.questionIds) && maxTotal) {
      result.questionIds = [...new Set(value.questionIds.filter(id => Number.isInteger(id) && id > 0 && id <= maxTotal))].slice(0, maxTotal);
    }
    return result;
  }

  function cleanProfile(value) {
    if (!isObject(value) || !Array.isArray(value.history)) return null;
    const seen = new Set();
    const history = value.history.slice(0, 50).map(session).filter(item => {
      if (!item || seen.has(item.id)) return false;
      seen.add(item.id); return true;
    });
    const targetNumber = Number(value.target);
    const target = Number.isFinite(targetNumber) && targetNumber >= 5 && targetNumber <= 9 && targetNumber * 2 === Math.floor(targetNumber * 2) ? targetNumber.toFixed(1) : '7.5';
    let examDate = null;
    if (typeof value.examDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.examDate)) {
      const stamp = new Date(value.examDate + 'T00:00:00Z');
      if (Number.isFinite(stamp.getTime()) && stamp.toISOString().slice(0, 10) === value.examDate) examDate = value.examDate;
    }
    // Allowlist only these fields. In-progress timers and recordings stay local.
    const profile = { history, target, dailyGoal: GOALS.includes(value.dailyGoal) ? value.dailyGoal : 20, examDate };
    // Optional chosen plan (no payment data — just the plan id and when it was chosen).
    if (isObject(value.plan) && ['starter', 'pro', 'intensive'].includes(value.plan.id)) {
      profile.plan = { id: value.plan.id, date: Math.floor(number(value.plan.date, 0, 4102444800000)) };
    }
    return profile;
  }

  async function request(owner, settings, token, path, init = {}) {
    if (currentUserId() !== owner) return null;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(settings.origin + '/rest/v1/practice_progress' + path, {
        ...init,
        credentials: 'omit', redirect: 'error', cache: 'no-store', signal: controller.signal,
        headers: { apikey: settings.key, Authorization: 'Bearer ' + token, ...init.headers }
      });
      if (currentUserId() !== owner) return null;
      if (!response.ok) throw new Error('Progress sync unavailable');
      if (init.method === 'POST') return true;
      const data = await response.json();
      return currentUserId() === owner ? data : null;
    } finally { clearTimeout(timeout); }
  }

  async function load() {
    const owner = currentUserId(), settings = config(), startedRevision = revision;
    if (!owner) return null;
    if (!settings) { setStatus(owner, UNAVAILABLE); return null; }
    setStatus(owner, 'Syncing progress…');
    try {
      if (currentUserId() !== owner) return null;
      const token = await window.AuthUI.getAccessToken();
      if (currentUserId() !== owner) return null;
      if (!token) { setStatus(owner, UNAVAILABLE); return null; }
      const rows = await request(owner, settings, token, '?select=data&user_id=eq.' + encodeURIComponent(owner) + '&limit=1');
      // A local save begun during loading takes precedence over this older read.
      if (currentUserId() !== owner || startedRevision !== revision) return null;
      if (!Array.isArray(rows)) throw new Error('Progress sync unavailable');
      const profile = rows.length ? cleanProfile(rows[0].data) : null;
      if (rows.length && !profile) throw new Error('Progress sync unavailable');
      setStatus(owner, rows.length ? 'Progress synced' : LOCAL);
      return profile;
    } catch {
      if (startedRevision === revision) setStatus(owner, UNAVAILABLE);
      return null;
    }
  }

  function save(saved) {
    const owner = currentUserId(), settings = config();
    let data;
    try { data = cleanProfile(saved); } catch { data = null; }
    if (!owner) return Promise.resolve();
    if (!settings || !data) { setStatus(owner, UNAVAILABLE); return Promise.resolve(); }
    const savedRevision = ++revision;
    setStatus(owner, 'Syncing progress…');
    // Queue writes so slow earlier requests cannot overwrite a newer local save.
    queue = queue.catch(() => {}).then(async () => {
      if (currentUserId() !== owner || savedRevision !== revision) return;
      try {
        const token = await window.AuthUI.getAccessToken();
        if (currentUserId() !== owner || savedRevision !== revision) return;
        if (!token) { setStatus(owner, UNAVAILABLE); return; }
        const result = await request(owner, settings, token, '?on_conflict=user_id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
          body: JSON.stringify({ user_id: owner, data, updated_at: new Date().toISOString() })
        });
        if (result && savedRevision === revision) setStatus(owner, 'Progress synced');
      } catch {
        if (savedRevision === revision) setStatus(owner, UNAVAILABLE);
      }
    });
    return queue;
  }

  // Invalidate stale operations even if an account changes A → B → A while
  // a request is pending. Token refresh alone must not discard an edit.
  let observedUserId = currentUserId();
  window.addEventListener('bandly:auth-change', () => {
    const next = currentUserId();
    if (next !== observedUserId) {
      observedUserId = next;
      revision++;
      message = LOCAL;
      messageOwner = null;
    }
  });

  window.ProfileSync = Object.freeze({
    load, save,
    status: () => currentUserId() && currentUserId() === messageOwner ? message : LOCAL
  });
})();
