(function () {
  'use strict';
  const LEVEL2_START = 1000, MAX = 5000, STEP = 100, RAGE_MS = 5000;
  const KEY = 'clicker-v4-state';
  const byId = id => document.getElementById(id);
  const tap = byId('tap'), photos = [byId('normalPhoto'), byId('level2Photo'), byId('ragePhoto')];
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
  const current = load(KEY), previous = current ? null : load('clicker-v3-state');
  const saved = current || previous;
  let score = number(saved ? saved.score : read('clicker-level1'), 0, 0, current ? MAX : LEVEL2_START);
  let next = number(saved && saved.next, (Math.floor(score / STEP) + 1) * STEP, STEP, MAX);
  next = Math.min(MAX, Math.max((Math.floor(score / STEP) + 1) * STEP, Math.ceil(next / STEP) * STEP));
  let pending = number(saved && saved.pending, 0, 0, 48);
  let until = number(saved && saved.until, 0, 0, Date.now() + RAGE_MS);
  let rewardRun = saved && typeof saved.rewardRun === 'string' && /^r[a-z0-9-]{5,80}$/.test(saved.rewardRun) ? saved.rewardRun : newRun();
  if (until <= Date.now() || score >= MAX) until = 0;
  if (!current && score >= LEVEL2_START) { pending = 0; until = 0; next = LEVEL2_START + STEP; }
  if (score >= MAX) pending = 0;
  let ready = false, pressTimer = 0, toastTimer = 0;
  function level() { return score >= LEVEL2_START ? 2 : 1; }
  function levelEnd() { return level() === 2 ? MAX : LEVEL2_START; }
  function active() { return until > Date.now(); }
  function base() { return level() === 2 ? 2 : 1; }
  function save() {
    const ok = write(KEY, JSON.stringify({ score, next, pending, until, rewardRun }));
    write('clicker-level1', String(Math.min(score, LEVEL2_START)));
    return ok;
  }
  function claimCompleted() {
    // Persist the round ID before paying. A wallet receipt prevents reloading
    // or buying a scooter from paying the same completion more than once.
    if (score < LEVEL2_START) return 0;
    if (!save() || !window.ClickerShop) return -1;
    let added = 0;
    for (let lv = 1; lv <= (score >= MAX ? 2 : 1); lv++) {
      const result = window.ClickerShop.grantLevel(rewardRun, lv);
      if (result < 0) return -1;
      added += result;
    }
    return added;
  }
  function draw() {
    const lv = level(), boosted = active();
    const start = lv === 2 ? LEVEL2_START : 0, end = levelEnd();
    document.body.dataset.level = String(lv);
    document.body.classList.toggle('rage', boosted);
    byId('levelTitle').textContent = 'Nivelul ' + lv;
    byId('powerText').textContent = 'Normal +' + base() + ' · RAGE +' + (base() * 2);
    scoreEl.textContent = score;
    byId('target').textContent = end;
    byId('totalText').textContent = 'Nivelul ' + lv + ': ' + start + ' → ' + end;
    bar.style.width = ((score - start) / (end - start) * 100) + '%';
    bar.parentElement.setAttribute('aria-valuemin', String(start));
    bar.parentElement.setAttribute('aria-valuemax', String(end));
    bar.parentElement.setAttribute('aria-valuenow', String(score));
    timer.hidden = !boosted;
    if (boosted) timer.textContent = Math.max(1, Math.ceil((until - Date.now()) / 1000)) + 's';
    if (score >= MAX) statusText.textContent = 'Ambele niveluri sunt complete!';
    else if (!ready) statusText.textContent = 'Se încarcă pozele…';
    else if (boosted) statusText.textContent = '🔥 RAGE · +' + (base() * 2) + ' / apăsare';
    else if (pending > 0) statusText.textContent = '🔥 RAGE pregătit pentru următoarea apăsare';
    else if (next === LEVEL2_START) statusText.textContent = 'La 1000: Nivelul 2 și +1 trofeu!';
    else if (next === MAX) statusText.textContent = 'Încă ' + (MAX - score) + ' până la +1 trofeu!';
    else statusText.textContent = 'Următorul RAGE la ' + next + ' clickuri';
    finish.hidden = score < MAX;
    tap.disabled = !ready || score >= MAX;
    tap.setAttribute('aria-label', 'Apasă pe poză: +' + (base() * (boosted ? 2 : 1)) + ' clickuri');
    photos.forEach((img, i) => img.setAttribute('aria-hidden', String(boosted ? i !== 2 : i !== lv - 1)));
  }
  function expire() {
    if (until && Date.now() >= until) { until = 0; save(); }
    draw();
  }
  function start() {
    if (active() || pending < 1 || score >= MAX) return;
    pending--;
    until = Date.now() + RAGE_MS;
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
    const beforeLevel = level(), boosted = active();
    const amount = Math.min(base() * (boosted ? 2 : 1), levelEnd() - score);
    score += amount;
    if (level() !== beforeLevel) {
      until = 0; pending = 0; next = LEVEL2_START + STEP;
      const awarded = claimCompleted();
      toast(awarded > 0 ? '🏆 +1 trofeu! Nivelul 2 deblocat!' : awarded < 0 ? 'Nivelul 2 deblocat. Trofeul așteaptă salvarea.' : '🎉 Nivelul 2 deblocat!');
    } else if (score >= MAX) {
      until = 0; pending = 0;
      const awarded = claimCompleted();
      byId('rewardNotice').textContent = awarded < 0 ? 'Trofeul nu s-a salvat încă. Reîncarcă pentru a reîncerca.' : '🏆 Nivelul 2 terminat: +1 trofeu!';
    } else {
      const end = levelEnd();
      while (next < end && score >= next) { pending++; next += STEP; }
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
    // Only the score restarts. The SHOP wallet and owned scooters are kept.
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
  if (recovered > 0 && score < MAX) toast('🏆 +' + recovered + ' trofeu pentru nivelul deja terminat!');
  if (score >= MAX) byId('rewardNotice').textContent = recovered < 0 ? 'Trofeele așteaptă salvarea. Reîncarcă pentru a reîncerca.' : '🏆 Cele 2 trofee ale acestei runde au fost acordate.';
  setInterval(expire, 100);
  document.addEventListener('visibilitychange', expire);
  window.addEventListener('pagehide', save);
})();
