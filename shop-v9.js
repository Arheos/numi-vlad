(function () {
  'use strict';
  const KEY = 'clicker-shop-v1';
  const items = [
    { id: 'g2-pro', name: 'KUKIRIN G2 PRO', price: 100, image: 'shop-g2-v7.webp', label: 'ELECTRICĂ', badge: 'G2 PRO' },
    { id: 'normal', name: 'Trotinetă normală', price: 10, image: 'shop-normal-v7.webp', label: 'CLASICĂ', badge: 'ORIGINAL' },
    { id: 'parkside', name: 'Adidași Parkside', price: 3, image: 'shop-parkside-v10.webp', label: 'ÎNCĂLȚĂMINTE', badge: 'NOU' }
  ];
  const trophy = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 3h10v5a5 5 0 0 1-10 0V3Z" fill="currentColor"/><path d="M7 5H4v2a4 4 0 0 0 4 4M17 5h3v2a4 4 0 0 1-4 4M12 13v5M8 21h8M9 18h6v3H9z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const bag = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 8h14l1 13H4L5 8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 9V6a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  const css = document.createElement('style');
  css.textContent = `
body.shop-enabled{padding-top:calc(max(14px,env(safe-area-inset-top)) + 78px)}
.shop-launch{position:fixed;z-index:35;top:max(14px,env(safe-area-inset-top));right:max(16px,env(safe-area-inset-right));width:66px;height:66px;padding:8px 0;border:3px solid #fff;border-radius:50%;background:linear-gradient(145deg,#ffa735,#f16c16);color:#16100b;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1px;font-size:12px;line-height:1;font-weight:900;letter-spacing:.8px;box-shadow:0 5px 0 #ba4813,0 10px 24px #bc561133;transition:transform .15s,box-shadow .15s}
.shop-launch svg{width:23px;height:23px;margin-bottom:4px}.shop-launch:hover{transform:translateY(-2px)}.shop-launch:active{transform:translateY(3px);box-shadow:0 2px 0 #ba4813,0 5px 12px #bc561133}
.shop-wallet{position:fixed;top:calc(max(14px,env(safe-area-inset-top)) + 12px);left:max(18px,env(safe-area-inset-left));z-index:30;display:flex;align-items:center;gap:10px;height:42px;padding:0 14px;border-radius:16px;background:#fff9ed;border:1px solid #f4e3bd;box-shadow:0 4px 15px #00000008;color:#24201a;font-weight:800;font-size:16px}.shop-wallet svg{width:23px;height:23px;color:#d89410}.shop-wallet small{font-size:11px;font-weight:700;color:#786c57}
body.shop-open{overflow:hidden}
#scooterShop{position:fixed;inset:0;margin:auto;width:min(100%,510px);height:min(96dvh,1000px);max-height:100%;max-width:100%;padding:0;border:1px solid #ffffff20;border-radius:28px;background:#111214;color:#f8f8f8;font-family:Arial,sans-serif;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#56504a #151515}
#scooterShop:not([open]){display:none}#scooterShop::backdrop{background:#050505b8;backdrop-filter:blur(9px)}#scooterShop[open]{animation:shopEnter .26s ease-out}@keyframes shopEnter{from{opacity:0;transform:translateY(18px) scale(.98)}to{opacity:1;transform:none}}
.shop-shell{padding:22px 22px 18px;max-width:500px;margin:auto;position:relative}.shop-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:16px}.shop-eyebrow{margin:0 0 7px;font-size:10px;font-weight:800;letter-spacing:2px;color:#fd9b42;display:flex;align-items:center;gap:6px}.shop-eyebrow:before{content:'';width:6px;height:6px;border-radius:50%;background:#fd9b42}
.shop-title{font-size:42px;line-height:1;font-weight:900;letter-spacing:-1.8px;margin:0;color:#fff}.shop-subtitle{font-size:12px;line-height:1.5;color:#aba9a7;margin:8px 0 0}.shop-close{flex:0 0 auto;width:42px;height:42px;display:grid;place-items:center;border-radius:50%;border:1px solid #ffffff23;background:#202225;color:#fff;font-size:27px;font-weight:400;line-height:1}.shop-close:hover{background:#33363a}
.shop-balance{display:flex;align-items:center;justify-content:space-between;padding:12px 15px;margin-bottom:14px;border:1px solid #7c532b;background:linear-gradient(115deg,#302317,#1d1d1e);border-radius:17px;gap:12px}.shop-balance-label{color:#d5c9ba;font-size:11px;letter-spacing:1px;font-weight:700}.shop-balance-value{display:flex;align-items:center;gap:8px;font-size:23px;font-weight:900;color:#ffc66b;font-variant-numeric:tabular-nums}.shop-balance svg{width:23px;height:23px}.shop-balance-value small{font-size:12px;font-weight:700}
.shop-list{display:grid;gap:15px}.shop-item{padding:16px 16px 12px;border-radius:22px;background:linear-gradient(145deg,#202123,#191a1c);border:1px solid #ffffff19;position:relative;overflow:hidden}.shop-item:first-child{border-color:#ab632c;box-shadow:inset 0 1px 0 #ffd1a022,0 8px 28px #0002}.shop-item:first-child:before{content:'';position:absolute;top:0;left:18px;width:60px;height:3px;border-radius:0 0 5px 5px;background:#ff982e}
.shop-item-head{display:flex;align-items:center;justify-content:space-between;gap:8px}.shop-category{margin:0;color:#a7a6a4;font-size:9px;font-weight:800;letter-spacing:1.5px}.shop-badge{font-size:9px;font-weight:900;letter-spacing:1px;white-space:nowrap;color:#c9c8c5;border:1px solid #ffffff26;background:#ffffff08;border-radius:7px;padding:4px 7px}.shop-item:first-child .shop-badge{color:#ffc185;background:#5c331633;border-color:#b76b3255}.shop-item:last-child .shop-badge{color:#b8e7c3;background:#1c3827;border-color:#43644b}
.shop-item h3{margin:7px 0 11px;color:#fff;font-size:21px;line-height:1.1;letter-spacing:-.4px;font-weight:900}.shop-stage{height:176px;border-radius:15px;position:relative;display:grid;place-items:center;overflow:hidden;background:#171715;margin-bottom:13px}.shop-stage:after{content:'';position:absolute;bottom:0;left:20%;right:20%;height:1px;background:linear-gradient(90deg,transparent,#ffab4945,transparent)}.shop-stage img{position:absolute;inset:0;display:block;max-width:100%;width:100%;height:100%;object-fit:contain;pointer-events:none;-webkit-user-drag:none;transition:transform .22s}.shop-item:hover .shop-stage img{transform:scale(1.03)}
.shop-item-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;border-top:1px solid #ffffff12;padding-top:12px}.shop-price{display:flex;align-items:center;gap:8px}.shop-price svg{width:26px;height:26px;color:#ffc56b}.shop-price strong{font-size:25px;line-height:1;color:#ffce84}.shop-price small{display:block;font-size:9px;font-weight:800;color:#aaa299;margin-top:4px;letter-spacing:1.4px}
.shop-buy{min-height:43px;padding:0 20px;border:0;border-radius:12px;background:linear-gradient(125deg,#ffb048,#fa812b);box-shadow:0 3px 0 #a74619;color:#19120a;font-size:12px;font-weight:900;letter-spacing:.2px}.shop-buy:active:not(:disabled){transform:translateY(2px);box-shadow:0 1px 0 #a74619}.shop-buy:disabled{background:#383430;box-shadow:none;color:#b5a89a;cursor:not-allowed}.shop-buy.owned{color:#a4e8bd;background:#1a3827}
.shop-item-note{margin:9px 0 0;text-align:right;min-height:13px;color:#a19c96;font-size:10px;line-height:1.35}.shop-message{font-size:12px;line-height:1.5;color:#ffc87f;margin:12px 3px 0}.shop-message:empty{display:none}.shop-footer{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:17px 3px 2px}.shop-collection{color:#aba8a3;font-size:10px;font-weight:700;letter-spacing:.5px}.shop-back{background:none;border:0;padding:10px 0;color:#ffd298;font-size:12px;font-weight:800}.shop-save-note{font-size:10px;color:#898887;text-align:center;line-height:1.6;margin:10px 0 0}.shop-reward-rule{padding:10px 12px;border:1px solid #f6ac4933;border-radius:12px;background:#f6ac490c;color:#ffd28d;font-size:12px;line-height:1.5;margin:0 0 16px}
#scooterShop button:focus-visible{outline:2px solid #ffbe60;outline-offset:4px}
@media(max-width:600px){#scooterShop{width:100%;height:100%;height:100dvh;max-height:100dvh;border:0;border-radius:0}.shop-shell{padding:max(22px,env(safe-area-inset-top)) 20px max(20px,env(safe-area-inset-bottom))}.shop-stage{height:134px}.shop-title{font-size:38px}}
@media(max-width:360px){.shop-shell{padding-left:14px;padding-right:14px}.shop-item{padding:14px 13px 10px}.shop-stage{height:145px}.shop-item h3{font-size:20px}.shop-subtitle{font-size:11px}}
@media(prefers-reduced-motion:reduce){#scooterShop[open]{animation:none}.shop-stage img,.shop-launch{transition:none}}
`;
  document.head.appendChild(css);
  const mount = document.createElement('div');
  mount.id = 'shopMount';
  mount.innerHTML = `
<div class="shop-wallet" aria-label="Soldul tău în trofee">${trophy}<span id="gameTrophies">0</span><small>trofee</small></div>
<button id="openShop" class="shop-launch" aria-label="Deschide SHOP" aria-haspopup="dialog" aria-controls="scooterShop">${bag}<span>SHOP</span></button>
<dialog id="scooterShop" aria-labelledby="shopTitle" aria-describedby="shopSubtitle">
 <div class="shop-shell">
  <header class="shop-head"><div><p class="shop-eyebrow">COLECȚIA TA</p><h2 class="shop-title" id="shopTitle">SHOP</h2><p class="shop-subtitle" id="shopSubtitle">Trotinete și adidași. Completează-ți colecția.</p></div><button id="closeShop" class="shop-close" aria-label="Închide magazinul" autofocus>×</button></header>
  <div class="shop-balance"><span class="shop-balance-label">TROFEELE TALE</span><span class="shop-balance-value">${trophy}<span id="shopTrophies">0</span><small>trofee</small></span></div>
  <p class="shop-reward-rule">🏆 +1 trofeu pentru fiecare nivel terminat.<br>Rejoacă nivelurile ca să strângi mai multe!</p>
  <div class="shop-list">${items.map((item, i) => `<article class="shop-item" aria-labelledby="name-${item.id}"><div class="shop-item-head"><p class="shop-category">0${i + 1} / ${item.label}</p><span class="shop-badge">${item.badge}</span></div><h3 id="name-${item.id}">${item.name}</h3><div class="shop-stage"><img id="scooter-${item.id}" src="${item.image}" alt="${item.name}" loading="eager" draggable="false"></div><div class="shop-item-foot"><div class="shop-price" aria-label="${item.price} trofee">${trophy}<div><strong>${item.price}</strong><small>TROFEE</small></div></div><button class="shop-buy" data-buy="${item.id}" aria-describedby="note-${item.id}">Cumpără</button></div><p class="shop-item-note" id="note-${item.id}"></p></article>`).join('')}</div>
  <p id="shopMessage" class="shop-message" role="status" aria-live="polite"></p>
  <footer class="shop-footer"><span class="shop-collection">COLECȚIE · <span id="ownedCount">0</span> / ${items.length}</span><button id="backToGame" class="shop-back">← Înapoi la joc</button></footer>
  <p class="shop-save-note">Trofeele și cumpărăturile se păstrează și când începi o rundă nouă.<br>V10 · Adidași Parkside</p>
 </div>
</dialog>`;
  document.body.appendChild(mount);
  document.body.classList.add('shop-enabled');
  document.title = 'Clicker V10 — SHOP';
  const version = document.querySelector('.game .version:last-of-type');
  if (version) version.textContent = 'V10 · 3 niveluri · SHOP · Adidași Parkside';
  const id = value => document.getElementById(value);
  const dialog = id('scooterShop'), launcher = id('openShop');
  let memory = { balance: 0, owned: [], levelClaims: [] }, storageOK = true;
  function readState() {
    try {
      const raw = localStorage.getItem(KEY);
      storageOK = true;
      if (!raw) return { balance: 0, owned: [], levelClaims: [] };
      const saved = JSON.parse(raw);
      if (!saved || typeof saved !== 'object' || Array.isArray(saved)) throw new Error('Invalid saved shop');
      const balance = Number(saved.balance);
      return { ...saved, balance: Number.isSafeInteger(balance) && balance >= 0 ? balance : 0,
        owned: Array.isArray(saved.owned) ? Array.from(new Set(saved.owned.filter(value => items.some(item => item.id === value)))) : [],
        levelClaims: Array.isArray(saved.levelClaims) ? Array.from(new Set(saved.levelClaims.filter(value => typeof value === 'string' && /^r[a-z0-9-]{5,80}:[123]$/.test(value)))) : [] };
    } catch (_) { storageOK = false; return memory; }
  }
  function drawShop() {
    memory = readState();
    id('gameTrophies').textContent = memory.balance;
    id('shopTrophies').textContent = memory.balance;
    id('ownedCount').textContent = memory.owned.length;
    items.forEach(item => {
      const owned = memory.owned.includes(item.id), missing = Math.max(0, item.price - memory.balance);
      const button = dialog.querySelector('[data-buy="' + item.id + '"]');
      button.disabled = owned || missing > 0 || !storageOK;
      button.classList.toggle('owned', owned);
      button.textContent = owned ? '✓ Cumpărat' : 'Cumpără';
      button.setAttribute('aria-label', owned ? item.name + ' este în colecție' : 'Cumpără ' + item.name + ' pentru ' + item.price + ' trofee');
      id('note-' + item.id).textContent = owned ? 'Salvat în colecția ta.' : missing ? 'Îți mai lipsesc ' + missing + (missing === 1 ? ' trofeu.' : ' trofee.') : 'Poți cumpăra acest produs.';
    });
    if (!storageOK) id('shopMessage').textContent = 'Salvarea nu este disponibilă în acest browser.';
  }
  function grantLevel(runId, level) {
    if (typeof runId !== 'string' || !/^r[a-z0-9-]{5,80}$/.test(runId) || ![1, 2, 3].includes(level)) return -1;
    const state = readState(), receipt = runId + ':' + level;
    if (!storageOK) return -1;
    if (state.levelClaims.includes(receipt)) return 0;
    if (state.balance >= Number.MAX_SAFE_INTEGER) return -1;
    const updated = { ...state, balance: state.balance + 1, levelClaims: state.levelClaims.concat(receipt) };
    try { localStorage.setItem(KEY, JSON.stringify(updated)); memory = updated; }
    catch (_) { storageOK = false; return -1; }
    drawShop(); return 1;
  }
  window.ClickerShop = Object.freeze({ grantLevel });
  function openShop() { drawShop(); if (!dialog.open) dialog.showModal(); document.body.classList.add('shop-open'); }
  function closeShop() { dialog.close(); }
  launcher.addEventListener('click', openShop);
  id('closeShop').addEventListener('click', closeShop);
  id('backToGame').addEventListener('click', closeShop);
  dialog.addEventListener('close', () => { document.body.classList.remove('shop-open'); launcher.focus({ preventScroll: true }); });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeShop();
    }
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest('[data-buy]');
    if (!button || button.disabled) return;
    const item = items.find(value => value.id === button.dataset.buy);
    const state = readState();
    if (!storageOK || !item || state.owned.includes(item.id) || state.balance < item.price) { drawShop(); return; }
    const updated = { ...state, balance: state.balance - item.price, owned: state.owned.concat(item.id) };
    try { localStorage.setItem(KEY, JSON.stringify(updated)); memory = updated; storageOK = true; }
    catch (_) { id('shopMessage').textContent = 'Achiziția nu a putut fi salvată. Nu s-au scăzut trofee.'; return; }
    drawShop(); id('shopMessage').textContent = '✓ ' + item.name + ': cumpărat! −' + item.price + ' trofee.';
  });
  items.forEach(item => id('scooter-' + item.id).addEventListener('error', () => { id('shopMessage').textContent = 'O poză nu s-a încărcat. Reîncarcă pagina pentru a o vedea.'; }));
  window.addEventListener('storage', event => { if (event.key === KEY || event.key === null) drawShop(); });
  drawShop();
})();
