(function () {
  'use strict';
  const LEVELS = [
    { start: 0, end: 1000, power: 1, rageMs: 5000, photo: 'normalPhoto' },
    { start: 1000, end: 5000, power: 2, rageMs: 2000, photo: 'level2Photo' },
    { start: 5000, end: 20000, power: 4, rageMs: 0, photo: 'level3Photo' }
  ];
  const MAX = 20000, STEP = 100, KEY = 'clicker-v4-state';
  const byId = id => document.getElementById(id);
  const tap = byId('tap');
  const photos = ['normalPhoto', 'level2Photo', 'level3Photo', 'ragePhoto'].map(byId);
  const scoreEl = byId('score'), bar = byId('bar'), statusText = byId('statusText');
  const timer = byId('timer'), finish = byId('finish');
  function read(key) { try { return localStorage.getItem(key); } catch (_) { return null; } }
  function write(key, value) { try { localStorage.setItem(key, value); return true; } catch (_) { return false; } }
  function number(value, fallback, min, max) {
    if (value === null || value === undefined || value === '') return fallback;
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.floor(n))) : fallback;
  }
  function load(key) {
    try { const s = JSON.parse(read(key) || 'null'); return s && typeof s === 'object' && !Array.isArray(s) ? s : null; }
    catch (_) { return null; }
  }
  function newRun() {
    return 'r' + (globalThis.crypto && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2));
  }
  const current = load(KEY), saved = current || load('clicker-v3-state');
  let score = number(saved ? saved.score : read('clicker-level1'), 0, 0, current ? MAX : 1000);
  function level() { return score >= 5000 ? 3 : score >= 1000 ? 2 : 1; }
  function config() { return LEVELS[level() - 1]; }
  let next = number(saved && saved.next, (Math.floor(score / STEP) + 1) * STEP, STEP, MAX);
  next = Math.min(config().end, Math.max((Math.floor(score / STEP) + 1) * STEP, Math.ceil(next / STEP) * STEP));
  let pending = number(saved && saved.pending, 0, 0, 48);
  let until = number(saved && saved.until, 0, 0, Date.now() + config().rageMs);
  let rewardRun = saved && typeof saved.rewardRun === 'string' && /^r[a-z0-9-]{5,80}$/.test(saved.rewardRun) ? saved.rewardRun : newRun();
  if (until <= Date.now()) until = 0;
  if (!current && score >= 1000) { pending = 0; until = 0; next = 1100; }
  // Level 3 never inherits an active or queued RAGE, including after reload.
  if (config().rageMs === 0 || score >= MAX) { until = 0; pending = 0; next = MAX; }
  let ready = false, pressTimer = 0, toastTimer = 0;
  function active() { return config().rageMs > 0 && until > Date.now() && score < MAX; }
  function save() {
    const ok = write(KEY, JSON.stringify({ score, next, pending, until, rewardRun, version: 9 }));
    write('clicker-level1', String(Math.min(score, 1000)));
    return ok;
  }
  function claimCompleted() {
    if (score < 1000) return 0;
    if (!save() || !window.ClickerShop) return -1;
    let added = 0;
    for (let i = 0; i < LEVELS.length; i++) {
      if (score < LEVELS[i].end) break;
      const result = window.ClickerShop.grantLevel(rewardRun, i + 1);
      if (result < 0) return -1;
      added += result;
    }
    return added;
  }
  function draw() {
    const lv = level(), cfg = config(), boosted = active();
    document.body.dataset.level = String(lv);
    document.body.classList.toggle('rage', boosted);
    byId('levelTitle').textContent = 'Nivelul ' + lv;
    byId('powerText').textContent = cfg.rageMs ? 'Normal +' + cfg.power + ' · RAGE +' + (cfg.power * 2) + ' (' + cfg.rageMs / 1000 + 's)' : 'Normal +4 · Fără RAGE';
    scoreEl.textContent = score;
    byId('target').textContent = cfg.end;
    byId('totalText').textContent = 'Nivelul ' + lv + ': ' + cfg.start + ' → ' + cfg.end;
    bar.style.width = ((score - cfg.start) / (cfg.end - cfg.start) * 100) + '%';
    bar.parentElement.setAttribute('aria-valuemin', String(cfg.start));
    bar.parentElement.setAttribute('aria-valuemax', String(cfg.end));
    bar.parentElement.setAttribute('aria-valuenow', String(score));
    timer.hidden = !boosted;
    if (boosted) timer.textContent = Math.max(1, Math.ceil((until - Date.now()) / 1000)) + 's';
    if (score >= MAX) statusText.textContent = 'Toate cele 3 niveluri sunt complete!';
    else if (!ready) statusText.textContent = 'Se încarcă pozele…';
    else if (cfg.rageMs === 0) statusText.textContent = 'Fără RAGE · +1 trofeu la 20000';
    else if (boosted) statusText.textContent = '🔥 RAGE · +' + (cfg.power * 2) + ' / apăsare';
    else if (pending > 0) statusText.textContent = '🔥 RAGE pregătit pentru următoarea apăsare';
    else if (next === cfg.end) statusText.textContent = 'La ' + cfg.end + ': Nivelul ' + (lv + 1) + ' și +1 trofeu!';
    else statusText.textContent = 'Următorul RAGE la ' + next + ' clickuri';
    finish.hidden = score < MAX;
    tap.disabled = !ready || score >= MAX;
    tap.setAttribute('aria-label', 'Apasă pe poză: +' + (cfg.power * (boosted ? 2 : 1)) + ' clickuri');
    const visible = boosted ? 'ragePhoto' : cfg.photo;
    photos.forEach(img => img.setAttribute('aria-hidden', String(img.id !== visible)));
  }
  function expire() {
    if (until && (Date.now() >= until || config().rageMs === 0)) { until = 0; save(); }
    draw();
  }
  function start() {
    if (!config().rageMs || active() || pending < 1 || score >= MAX) return;
    pending--;
    until = Date.now() + config().rageMs;
  }
  function toast(text) {
    const el = byId('levelToast');
    clearTimeout(toastTimer); el.textContent = text; el.classList.add('show');
    toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
  }
  function pop(amount, boosted, e) {
    const rect = tap.getBoundingClientRect(), p = document.createElement('span');
    p.className = 'plus' + (boosted ? ' boost' : ''); p.textContent = '+' + amount;
    p.style.left = (e.clientX || rect.left + rect.width / 2) + 'px';
    p.style.top = (e.clientY || rect.top + rect.height / 2) + 'px';
    p.setAttribute('aria-hidden', 'true'); document.body.appendChild(p);
    setTimeout(() => p.remove(), 700);
  }
  tap.addEventListener('click', function (e) {
    if (!ready || score >= MAX) return;
    expire();
    const beforeLevel = level(), cfg = config(), boosted = active();
    const amount = Math.min(cfg.power * (boosted ? 2 : 1), cfg.end - score);
    score += amount;
    if (level() !== beforeLevel) {
      until = 0; pending = 0;
      next = config().rageMs ? (Math.floor(score / STEP) + 1) * STEP : MAX;
      const awarded = claimCompleted(), label = 'Nivelul ' + level() + ' deblocat!';
      toast(awarded > 0 ? '🏆 +1 trofeu! ' + label : awarded < 0 ? label + ' Trofeul așteaptă salvarea.' : '🎉 ' + label);
    } else if (score >= MAX) {
      until = 0; pending = 0;
      const awarded = claimCompleted();
      byId('rewardNotice').textContent = awarded < 0 ? 'Trofeul nu s-a salvat încă. Reîncarcă pentru a reîncerca.' : '🏆 Nivelul 3 terminat: +1 trofeu!';
    } else if (cfg.rageMs > 0) {
      while (next < cfg.end && score >= next) { pending++; next += STEP; }
      if (!active()) start();
    }
    save(); draw(); pop(amount, boosted, e);
    clearTimeout(pressTimer); tap.classList.add('pressed');
    pressTimer = setTimeout(() => tap.classList.remove('pressed'), 80);
  });
  byId('again').addEventListener('click', function () {
    if (claimCompleted() < 0) {
      byId('rewardNotice').textContent = 'Salvarea nu este disponibilă. Reîncarcă înainte de o rundă nouă, ca să păstrezi trofeele.';
      return;
    }
    score = 0; next = STEP; pending = 0; until = 0; rewardRun = newRun();
    clearTimeout(toastTimer); byId('levelToast').classList.remove('show');
    save(); draw(); tap.focus({ preventScroll: true });
  });
  byId('reload').addEventListener('click', () => location.reload());
  function checkImages() {
    ready = photos.every(img => img.complete && img.naturalWidth > 0);
    const failed = photos.some(img => img.complete && img.naturalWidth === 0);
    byId('imageError').hidden = !failed; byId('reload').hidden = !failed;
    draw();
  }
  photos.forEach(img => { img.addEventListener('load', checkImages); img.addEventListener('error', checkImages); });
  checkImages(); save();
  const recovered = claimCompleted();
  if (recovered > 0 && score < MAX) toast('🏆 +' + recovered + (recovered === 1 ? ' trofeu' : ' trofee') + ' pentru nivelurile terminate!');
  if (score >= MAX) byId('rewardNotice').textContent = recovered < 0 ? 'Trofeele așteaptă salvarea. Reîncarcă pentru a reîncerca.' : '🏆 Cele 3 trofee ale acestei runde au fost acordate.';
  setInterval(expire, 100);
  document.addEventListener('visibilitychange', expire);
  window.addEventListener('pagehide', save);
})();
