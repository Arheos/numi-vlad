(function () {
  'use strict';
  const PER_LEVEL = 1000, MAX = 2000, STEP = 100, RAGE_MS = 5000;
  const KEY = 'clicker-v4-state';
  const byId = id => document.getElementById(id);
  const tap = byId('tap'), photos = [byId('normalPhoto'), byId('level2Photo'), byId('ragePhoto')];
  const scoreEl = byId('score'), bar = byId('bar'), statusText = byId('statusText');
  const timer = byId('timer'), finish = byId('finish');
  function read(key) { try { return localStorage.getItem(key); } catch (_) { return null; } }
  function write(key, value) { try { localStorage.setItem(key, value); } catch (_) {} }
  function number(value, fallback, min, max) {
    if (value === null || value === undefined || value === '') return fallback;
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.floor(n))) : fallback;
  }
  function load(key) {
    try { const s = JSON.parse(read(key) || 'null'); return s && typeof s === 'object' && !Array.isArray(s) ? s : null; }
    catch (_) { return null; }
  }
  const current = load(KEY), previous = current ? null : load('clicker-v3-state');
  const saved = current || previous;
  let score = number(saved ? saved.score : read('clicker-level1'), 0, 0, current ? MAX : PER_LEVEL);
  let next = number(saved && saved.next, (Math.floor(score / STEP) + 1) * STEP, STEP, MAX);
  next = Math.min(MAX, Math.max((Math.floor(score / STEP) + 1) * STEP, Math.ceil(next / STEP) * STEP));
  let pending = number(saved && saved.pending, 0, 0, 19);
  let until = number(saved && saved.until, 0, 0, Date.now() + RAGE_MS);
  if (until <= Date.now() || score >= MAX) until = 0;
  if (!current && score >= PER_LEVEL) { pending = 0; until = 0; next = 1100; }
  if (score >= MAX) pending = 0;
  let ready = false, pressTimer = 0, toastTimer = 0;
  function level() { return score >= PER_LEVEL ? 2 : 1; }
  function active() { return until > Date.now(); }
  function base() { return level() === 2 ? 2 : 1; }
  function save() {
    write(KEY, JSON.stringify({ score, next, pending, until }));
    write('clicker-level1', String(Math.min(score, PER_LEVEL)));
  }
  function draw() {
    const lv = level(), boosted = active(), localScore = score - (lv - 1) * PER_LEVEL;
    document.body.dataset.level = String(lv);
    document.body.classList.toggle('rage', boosted);
    byId('levelTitle').textContent = 'Nivelul ' + lv;
    byId('powerText').textContent = 'Normal +' + base() + ' · RAGE +' + (base() * 2);
    scoreEl.textContent = localScore;
    byId('totalText').textContent = 'Total: ' + score;
    bar.style.width = (localScore / PER_LEVEL * 100) + '%';
    bar.parentElement.setAttribute('aria-valuenow', String(localScore));
    timer.hidden = !boosted;
    if (boosted) timer.textContent = Math.max(1, Math.ceil((until - Date.now()) / 1000)) + 's';
    if (score >= MAX) statusText.textContent = 'Ambele niveluri sunt complete!';
    else if (!ready) statusText.textContent = 'Se încarcă pozele…';
    else if (boosted) statusText.textContent = '🔥 RAGE · +' + (base() * 2) + ' / apăsare';
    else if (pending > 0) statusText.textContent = '🔥 RAGE pregătit pentru următoarea apăsare';
    else if (next === PER_LEVEL) statusText.textContent = 'La 1000 deblochezi Nivelul 2!';
    else if (next === MAX) statusText.textContent = 'Încă ' + (MAX - score) + ' până termini!';
    else statusText.textContent = 'Următorul RAGE la ' + (next - (lv - 1) * PER_LEVEL) + ' clickuri';
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
    toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
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
    const amount = Math.min(base() * (boosted ? 2 : 1), MAX - score);
    score += amount;
    if (level() !== beforeLevel) {
      // The new level starts immediately with its normal photo and +2 taps.
      until = 0; pending = 0; next = (Math.floor(score / STEP) + 1) * STEP;
      toast('🎉 Nivelul 2 deblocat! +2 normal · +4 RAGE');
    } else if (score >= MAX) {
      until = 0; pending = 0;
    } else {
      // Remember each crossed hundred, including those crossed during RAGE.
      // A level's final threshold belongs to level completion, not a new bonus.
      const end = level() * PER_LEVEL;
      while (next < end && score >= next) { pending++; next += STEP; }
      if (!active()) start();
    }
    save(); draw(); pop(amount, boosted, e);
    clearTimeout(pressTimer); tap.classList.add('pressed');
    pressTimer = setTimeout(() => tap.classList.remove('pressed'), 80);
  });
  byId('again').addEventListener('click', function () {
    score = 0; next = STEP; pending = 0; until = 0;
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
  checkImages(); save(); setInterval(expire, 100);
  document.addEventListener('visibilitychange', expire);
  window.addEventListener('pagehide', save);
})();
