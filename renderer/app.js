// Suha Mail kabuğu — servisleri (Gmail/Yandex/Outlook web + IMAP motoru) tek pencerede toplar.
// Her web servisi kendi kalıcı oturumunda (persist:<id>) açılır; IMAP yerel uygulamamızdır.
const $ = s => document.querySelector(s);

const SERVISLER = [
  { id: 'gmail',   ad: 'Gmail',   url: 'https://mail.google.com/',      renk: '#ea4335', harf: 'G', web: true },
  { id: 'yandex',  ad: 'Yandex',  url: 'https://mail.yandex.com/',      renk: '#ff3333', harf: 'Y', web: true },
  { id: 'outlook', ad: 'Outlook', url: 'https://outlook.live.com/mail/', renk: '#0f6cbd', harf: 'O', web: true },
  { id: 'imap',    ad: 'IMAP',    url: null,                             renk: '#2f6bb3', harf: '✉', web: false },
];
const G = {};          // id -> { w, kap }
let aktif = null;

/* Tema */
function tema() { const t = localStorage.getItem('suha-tema') || 'auto'; if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.dataset.theme = t; return t; }
function temaDeg() { const sira = ['auto', 'light', 'dark']; const t = localStorage.getItem('suha-tema') || 'auto'; localStorage.setItem('suha-tema', sira[(sira.indexOf(t) + 1) % 3]); tema(); }

/* Ray */
function rayCiz() {
  $('#ray').innerHTML = SERVISLER.map(s =>
    `<button class="servis" data-id="${s.id}" title="${s.ad}"><span class="rozet" style="background:${s.renk}">${s.harf}</span><span class="ad">${s.ad}</span></button>`
  ).join('') +
    `<div class="bosluk"></div>` +
    `<button class="servis" id="temaBtn" title="Tema değiştir"><span class="rozet" style="background:#5b616e">◑</span><span class="ad">Tema</span></button>`;
  [...document.querySelectorAll('.servis[data-id]')].forEach(b => b.onclick = () => sec(b.dataset.id));
  $('#temaBtn').onclick = temaDeg;
}

/* Webview oluştur (ilk seçildiğinde) */
function olustur(s) {
  const kap = document.createElement('div'); kap.className = 'kap'; kap.dataset.id = s.id; kap.hidden = true;
  const w = document.createElement('webview'); w.dataset.id = s.id;
  if (s.web) {
    w.setAttribute('partition', 'persist:' + s.id);
    w.setAttribute('useragent', window.suha.ua);
    w.setAttribute('allowpopups', '');
    w.setAttribute('src', s.url);
  } else {
    w.setAttribute('partition', 'persist:imap');
    w.setAttribute('preload', window.suha.imapPreload);
    w.setAttribute('webpreferences', 'contextIsolation=yes,sandbox=no');
    w.setAttribute('src', window.suha.imapSrc);
  }
  const yuk = document.createElement('div'); yuk.className = 'yuk'; yuk.innerHTML = '<div class="spin"></div>';
  let bitti = false;
  w.addEventListener('did-stop-loading', () => { if (!bitti) { bitti = true; yuk.remove(); } });
  w.addEventListener('did-fail-load', e => {
    if (e.isMainFrame && e.errorCode !== -3) {
      bitti = true;
      yuk.innerHTML = `<div class="hata">${s.ad} yüklenemedi — internet ya da servis engeli.<br><button class="ib">Tekrar dene</button></div>`;
      yuk.querySelector('.ib').onclick = () => { yuk.innerHTML = '<div class="spin"></div>'; bitti = false; w.reload(); };
    }
  });
  kap.appendChild(w); kap.appendChild(yuk); $('#kaplar').appendChild(kap);
  G[s.id] = { w, kap };
  return G[s.id];
}

/* Üst çubuk (yalnız web servisleri) */
function ubarCiz(s) {
  const bar = $('#ubar');
  if (!s.web) { bar.hidden = true; return; }
  bar.hidden = false;
  bar.innerHTML = `<button class="ib" id="geri" title="Geri">‹</button><button class="ib" id="ileri" title="İleri">›</button><button class="ib" id="yenile" title="Yenile">⟳</button><span class="baslik">${s.ad}</span>`;
  const w = G[s.id].w;
  $('#geri').onclick = () => { try { if (w.canGoBack()) w.goBack(); } catch {} };
  $('#ileri').onclick = () => { try { if (w.canGoForward()) w.goForward(); } catch {} };
  $('#yenile').onclick = () => { try { w.reload(); } catch {} };
}

/* Servis seç */
function sec(id) {
  const s = SERVISLER.find(x => x.id === id); if (!s) return;
  if (!G[id]) olustur(s);
  Object.keys(G).forEach(k => { G[k].kap.hidden = k !== id; });
  aktif = id;
  [...document.querySelectorAll('.servis[data-id]')].forEach(b => b.classList.toggle('on', b.dataset.id === id));
  ubarCiz(s);
  localStorage.setItem('suha-son', id);
}

function init() {
  tema();
  rayCiz();
  sec(localStorage.getItem('suha-son') || 'gmail');
}
init();
