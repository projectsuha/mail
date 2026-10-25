/* ───────────── Pano (Miro tarzı beyaz tahta) ─────────────
   Sonsuz tuval: yapışkan not, metin, şekil, bağlantı oku, kalem, çerçeve, resim.
   Panolar kullanıcının Google Drive'ında "Suha Pano" klasöründe JSON dosyası olarak durur.
   Program sadece kendi oluşturduğu dosyalara erişir (drive.file izni); Gmail'e dokunmaz. */
'use strict';

window.APP_NAME = 'Pano';
window.APP_ICON = 'pano-apple.png?v=8';
window.APP_LEAD = 'Fikirlerini yapışkan notlar, şekiller ve oklarla sonsuz bir tahtada topla. Panoların kendi Google Drive\'ında saklanır; arada başka bir sunucu yoktur.';
window.AUTH_STATE_PREFIX = 'pano-';
window.APP_SCOPES = 'openid email https://www.googleapis.com/auth/drive.file';
window.APP_NEED_SCOPE = 'https://www.googleapis.com/auth/drive.file';
window.APP_NEED_TEXT = 'Google Drive iznini vermedin. Panolar kendi Drive\'ında saklanır ve program sadece kendi oluşturduğu pano dosyalarına erişebilir. Tekrar girişte kutuyu işaretli bırak.';
Auth.redirectUri = () => location.origin + location.pathname.replace(/[^/]*$/, '');

const PSVG = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
Object.assign(IC, {
  board: PSVG('<rect x="3" y="4.5" width="18" height="15" rx="2.5"/><rect x="6" y="7.5" width="4.5" height="4.5" rx="1"/><rect x="13.5" y="7.5" width="4.5" height="4.5" rx="1"/><path d="M10.5 9.75h3M8.25 12v3.5"/>'),
  cursor: PSVG('<path d="m5 3 14 7-6 1.8L10.2 18z"/>'),
  hand: PSVG('<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11M11 10V4.5a1.5 1.5 0 0 1 3 0V11M14 10.5V6a1.5 1.5 0 0 1 3 0v8a6 6 0 0 1-6 6h-.5a6 6 0 0 1-4.6-2.2L3.5 14.6a1.5 1.5 0 0 1 2.2-2L8 15"/>'),
  sticky: PSVG('<path d="M5 4h14v10l-5 6H5z"/><path d="M14 20v-6h5"/>'),
  textT: PSVG('<path d="M5 6V4.5h14V6M12 4.5v15M9 19.5h6"/>'),
  shapes: PSVG('<rect x="3.5" y="10" width="9" height="9.5" rx="1.5"/><circle cx="16" cy="8" r="4.5"/>'),
  arrow: PSVG('<path d="M5 19 19 5M10 5h9v9"/>'),
  pen: PSVG('<path d="m14.5 4.5 5 5L9 20H4v-5z"/><path d="m12.5 6.5 5 5"/>'),
  eraser: PSVG('<path d="m4 15 8.5-8.5a2 2 0 0 1 2.8 0l3.2 3.2a2 2 0 0 1 0 2.8L13 18H7z"/><path d="M9.5 9.5 16 16M7 18h13"/>'),
  frame: PSVG('<path d="M7 3v18M17 3v18M3 7h18M3 17h18"/>'),
  image: PSVG('<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m4 17 5-4.5 3.5 3 2.5-2 5 3.5"/>'),
  undo: PSVG('<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>'),
  redo: PSVG('<path d="m15 14 5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>'),
  more: PSVG('<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>'),
  share: PSVG('<path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 12v7h14v-7"/>'),
  copy: PSVG('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>'),
  front: PSVG('<rect x="9" y="9" width="11" height="11" rx="1.5" fill="currentColor" fill-opacity=".25"/><path d="M15 5V4H4v11h1"/>'),
  back2: PSVG('<rect x="4" y="4" width="11" height="11" rx="1.5" fill="currentColor" fill-opacity=".25"/><path d="M19 9h1v11H9v-1"/>'),
  grid: PSVG('<circle cx="6" cy="6" r=".8" fill="currentColor"/><circle cx="12" cy="6" r=".8" fill="currentColor"/><circle cx="18" cy="6" r=".8" fill="currentColor"/><circle cx="6" cy="12" r=".8" fill="currentColor"/><circle cx="12" cy="12" r=".8" fill="currentColor"/><circle cx="18" cy="12" r=".8" fill="currentColor"/><circle cx="6" cy="18" r=".8" fill="currentColor"/><circle cx="12" cy="18" r=".8" fill="currentColor"/><circle cx="18" cy="18" r=".8" fill="currentColor"/>'),
  fit: PSVG('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
  download: PSVG('<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M5 19h14"/>'),
  upload: PSVG('<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5"/><path d="M5 19h14"/>'),
  print: PSVG('<path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="7" rx="1.5"/><path d="M7 14h10v6H7z"/>'),
  lock: PSVG('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  template: PSVG('<rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M3.5 9h17M9 9v11"/>'),
  minus: PSVG('<path d="M5 12h14"/>'),
  stampI: PSVG('<circle cx="12" cy="12" r="8.5"/><path d="M8.5 14.5a4 4 0 0 0 7 0"/><circle cx="9.3" cy="10" r=".9" fill="currentColor"/><circle cx="14.7" cy="10" r=".9" fill="currentColor"/>'),
  timer: PSVG('<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 1.5M9.5 3h5M12 3v2.5"/>'),
  play: PSVG('<path d="M7 4.5v15l12-7.5z"/>'),
  comment: PSVG('<path d="M4 5h16v11H9l-5 4z"/>'),
  vote: PSVG('<circle cx="12" cy="12" r="4" fill="currentColor"/><circle cx="12" cy="12" r="8.5"/>'),
  align: PSVG('<path d="M4 4v16"/><rect x="7" y="6" width="11" height="4" rx="1"/><rect x="7" y="14" width="7" height="4" rx="1"/>'),
  route: PSVG('<path d="M5 19c0-8 14-6 14-14"/><circle cx="5" cy="19" r="1.5" fill="currentColor"/><circle cx="19" cy="5" r="1.5" fill="currentColor"/>'),
  mapI: PSVG('<rect x="3.5" y="5" width="17" height="14" rx="2"/><rect x="11" y="10" width="6" height="5" rx="1" fill="currentColor" fill-opacity=".3"/>'),
  noteI: PSVG('<path d="M6 3h9l4 4v14H6z"/><path d="M9.5 11h6M9.5 14.5h6M9.5 18h3.5"/>'),
  mailI: PSVG('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 7 8.5-7"/>'),
  cal: PSVG('<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
  linkI: PSVG('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
  tableI: PSVG('<rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M3.5 10h17M3.5 14.5h17M9.5 5v14M15 5v14"/>'),
  iconsI: PSVG('<circle cx="7.5" cy="7.5" r="3"/><rect x="13.5" y="4.5" width="6" height="6" rx="1"/><path d="m7.5 14 3.5 6h-7z"/><path d="M14 17h6M17 14v6"/>'),
  open: PSVG('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
  sketchI: PSVG('<path d="M4 17c3-1 4-6 7-6s3 5 6 5 3-3 3-3"/><path d="M4 8c2-1 3-3 5-3"/>'),
  keyboard: PSVG('<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6 10h1M9.5 10h1M13 10h1M16.5 10h1M6 14h1M9 14h6M17 14h1"/>'),
  search2: PSVG('<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>')
});

/* ───────── Giriş ekranı ───────── */
showLogin = function (msg) {
  $('#app').innerHTML = `
  <div class="center-screen">
    <div class="brand-mark">${IC.board}</div>
    <h1>Pano</h1>
    <p>Yapışkan notlar, şekiller ve oklarla sonsuz bir tahta. Panoların kendi Google Drive'ında saklanır; program sadece kendi oluşturduğu pano dosyalarını görebilir.</p>
    ${msg ? `<p class="err">${esc(msg)}</p>` : ''}
    <button class="btn primary" data-action="login">Google ile giriş yap</button>
    ${guvenCipleri([[IC.shield, 'Şifren bize gelmez', 'Giriş Google\'ın kendi sayfasında yapılır (accounts.google.com).'], [IC.board, 'Panolar senin Drive\'ında', 'Sunucumuz yok; panolar kendi Google Drive\'ında saklanır.'], [IC.eye || IC.shield, 'Sadece kendi dosyalarını görür', 'Program Drive\'ında sadece kendi oluşturduğu pano dosyalarını görebilir.']])}
    <p class="muted sm" style="margin-top:14px"><a href="?demo">Örnek panolarla dene</a></p>
  </div>`;
};

/* ═════════ Veri katmanı: Google Drive (gerçek) ya da bellek (demo) ═════════ */
if (new URLSearchParams(location.search).has('drive')) { store.set('panoDepo', 'drive'); history.replaceState(null, '', location.pathname); }
const YEREL = !DEMO && store.get('panoDepo', 'yerel') !== 'drive';
const DRIVE = 'https://www.googleapis.com/drive/v3/files', DRIVE_UP = 'https://www.googleapis.com/upload/drive/v3/files';
async function dFetch(url, opt = {}) {
  let tok = Auth.token();
  if (!tok) { Auth.reauth(); throw new AuthError('oturum'); }
  const res = await fetch(url, { ...opt, headers: { Authorization: 'Bearer ' + tok, ...(opt.headers || {}) } });
  if (res.status === 401) { store.del('auth'); Auth.reauth(); throw new AuthError('oturum'); }
  if (!res.ok) { let m = res.status + ''; try { m = (await res.json()).error.message; } catch {} throw new Error(m); }
  return res.status === 204 ? null : (res.headers.get('content-type') || '').includes('json') ? res.json() : res.text();
}
const qs = o => new URLSearchParams(Object.entries(o).filter(([, v]) => v != null)).toString();
function multipart(meta, content) {
  const b = 'pano_' + Math.random().toString(36).slice(2);
  return { body: new Blob([`--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${b}\r\nContent-Type: application/json\r\n\r\n`, content, `\r\n--${b}--`]),
    type: 'multipart/related; boundary=' + b };
}
const PDB_REAL = {
  folderId: null,
  async folder() {
    if (this.folderId) return this.folderId;
    const q = "mimeType='application/vnd.google-apps.folder' and appProperties has { key='suha' and value='pano-klasor' } and trashed=false";
    const r = await dFetch(DRIVE + '?' + qs({ q, fields: 'files(id)', pageSize: 1 }));
    if (r.files?.[0]) return (this.folderId = r.files[0].id);
    const f = await dFetch(DRIVE + '?fields=id', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Suha Pano', mimeType: 'application/vnd.google-apps.folder', appProperties: { suha: 'pano-klasor' } }) });
    return (this.folderId = f.id);
  },
  async list() {
    const q = "appProperties has { key='suha' and value='pano' } and trashed=false";
    const out = []; let pageToken;
    do {
      const r = await dFetch(DRIVE + '?' + qs({ q, fields: 'nextPageToken,files(id,name,modifiedTime,appProperties)', orderBy: 'modifiedTime desc', pageSize: 200, pageToken }));
      (r.files || []).forEach(f => out.push({ id: f.id, title: f.name.replace(/\.pano$/, ''), modified: Date.parse(f.modifiedTime) || 0, color: f.appProperties?.renk || '' }));
      pageToken = r.nextPageToken;
    } while (pageToken && out.length < 1000);
    return out;
  },
  async get(id) { const t = await dFetch(`${DRIVE}/${id}?alt=media`); return typeof t === 'string' ? JSON.parse(t) : t; },
  async create(title, data) {
    const parent = await this.folder();
    const m = multipart({ name: title + '.pano', mimeType: 'application/json', parents: [parent], appProperties: { suha: 'pano' } }, JSON.stringify(data));
    const f = await dFetch(`${DRIVE_UP}?uploadType=multipart&fields=id,modifiedTime`, { method: 'POST', headers: { 'Content-Type': m.type }, body: m.body });
    return { id: f.id, modified: Date.parse(f.modifiedTime) || Date.now() };
  },
  async save(id, title, data) {
    const m = multipart({ name: title + '.pano' }, JSON.stringify(data));
    const f = await dFetch(`${DRIVE_UP}/${id}?uploadType=multipart&fields=id,modifiedTime`, { method: 'PATCH', headers: { 'Content-Type': m.type }, body: m.body });
    return Date.parse(f.modifiedTime) || Date.now();
  },
  rename: (id, title) => dFetch(`${DRIVE}/${id}?fields=id`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: title + '.pano' }) }),
  trash: id => dFetch(`${DRIVE}/${id}?fields=id`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trashed: true }) }),
  untrash: id => dFetch(`${DRIVE}/${id}?fields=id`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trashed: false }) })
};
const PDB_DEMO = (() => {
  const w = (x, ms = 180) => new Promise(r => setTimeout(() => r(JSON.parse(JSON.stringify(x))), ms));
  const boards = [];
  let seq = 0;
  const add = (title, data, ago) => boards.push({ id: 'b' + (++seq), title, modified: Date.now() - ago, data, trashed: false });
  setTimeout(() => {   // şablonlar aşağıda tanımlı; yüklendikten sonra örnekleri kur
    add('Proje panosu', PTPL.find(t => t.id === 'kanban').make(), 2 * 3600e3);
    add('Tatil planı', PTPL.find(t => t.id === 'mind').make('Bozcaada tatili'), 26 * 3600e3);
    add('Beyin fırtınası', PTPL.find(t => t.id === 'brain').make(), 5 * 864e5);
  }, 0);
  return {
    list: () => w(boards.filter(b => !b.trashed).map(({ id, title, modified }) => ({ id, title, modified })).sort((a, b) => b.modified - a.modified), 300),
    get: id => w(boards.find(b => b.id === id).data, 250),
    create: (title, data) => { const id = 'b' + (++seq); boards.push({ id, title, data: JSON.parse(JSON.stringify(data)), modified: Date.now(), trashed: false }); return w({ id, modified: Date.now() }); },
    save: (id, title, data) => { const b = boards.find(x => x.id === id); Object.assign(b, { title, data: JSON.parse(JSON.stringify(data)), modified: Date.now() }); return w(Date.now(), 250); },
    rename: (id, title) => { boards.find(b => b.id === id).title = title; return w({}); },
    trash: id => { boards.find(b => b.id === id).trashed = true; return w({}); },
    untrash: id => { boards.find(b => b.id === id).trashed = false; return w({}); }
  };
})();
/* Cihazda saklama (varsayılan): giriş yok, Drive yok. Panolar bu cihazın IndexedDB'sinde durur. */
const PDB_LOCAL = (() => {
  let db = null;
  const ac = () => db ? Promise.resolve(db) : new Promise((res, rej) => {
    const r = indexedDB.open('suha-pano', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('pano', { keyPath: 'id' });
    r.onsuccess = () => { db = r.result; res(db); }; r.onerror = () => rej(r.error);
  });
  const is = async (mod, fn) => { const d = await ac(); return new Promise((res, rej) => { const t = d.transaction('pano', mod), q = fn(t.objectStore('pano')); t.oncomplete = () => res(q && q.result); t.onerror = t.onabort = () => rej(t.error || new Error('Depolama hatası')); }); };
  const al = id => is('readonly', s => s.get(id));
  const yaz = (id, f) => al(id).then(b => { if (!b) throw new Error('Pano bulunamadı'); return is('readwrite', s => s.put(f(b))); });
  return {
    async list() {
      const hepsi = await is('readonly', s => s.getAll()), simdi = Date.now();
      for (const b of hepsi) if (b.trashed && simdi - (b.trashedAt || 0) > 7 * 864e5) is('readwrite', s => s.delete(b.id)).catch(() => {});   // çöp 7 gün sonra silinir
      return hepsi.filter(b => !b.trashed).map(({ id, title, modified }) => ({ id, title, modified })).sort((a, b) => b.modified - a.modified);
    },
    async get(id) { const b = await al(id); if (!b) throw new Error('Pano bulunamadı'); return JSON.parse(JSON.stringify(b.data)); },
    async create(title, data) { const id = 'y' + uid() + uid(), modified = Date.now(); await is('readwrite', s => s.put({ id, title, data, modified, trashed: false })); return { id, modified }; },
    async save(id, title, data) { const modified = Date.now(); await yaz(id, b => ({ ...b, title, data, modified, trashed: false })); return modified; },
    rename: (id, title) => yaz(id, b => ({ ...b, title })),
    trash: id => yaz(id, b => ({ ...b, trashed: true, trashedAt: Date.now() })),
    untrash: id => yaz(id, b => ({ ...b, trashed: false }))
  };
})();
const PDB = DEMO ? PDB_DEMO : YEREL ? PDB_LOCAL : PDB_REAL;

/* ═════════ Durum ═════════ */
const P = {
  boards: [], q: '', loading: false,
  board: null,                 // { id, title, modified }
  data: null,                  // { v, items, view }
  sel: new Set(), tool: 'select', shape: 'round', penColor: '#1b1d21', penW: 3,
  V: { x: 0, y: 0, z: 1 },
  hist: [], fut: [], dirty: false, saving: false, timer: 0, status: '',
  editing: null, grid: store.get('panoGrid', true), clip: null,
  mini: store.get('panoMini', !matchMedia('(max-width: 700px)').matches), voting: false, guides: null, stamp: '👍'
};
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

/* ═════════ Başlangıç ve pano listesi ═════════ */
start = async function () {
  try {
    let email = '';
    if (YEREL) {   // giriş yok: doğrudan panolar
      try { navigator.storage?.persist?.(); } catch {}
      const u = new URLSearchParams(location.search);
      if (u.has('yeni')) { history.replaceState(null, '', location.pathname); await pListLoad(false); return pNewDialog(); }
      const last = store.get('panoLast');
      await pListLoad();
      if (last && P.boards.some(b => b.id === last) && !matchMedia('(max-width: 700px)').matches && store.get('panoReopen', true)) pOpen(last);
      return;
    }
    if (DEMO) email = 'demo@ornek.com';
    else {
      const b = jwtBody(store.get('idt')?.t || '');
      email = b?.email || '';
      if (!email) { const u = await dFetch('https://openidconnect.googleapis.com/v1/userinfo'); email = u.email || ''; }
    }
    S.email = email;
    if (email) store.set('email', email);
    if (typeof accessGate === 'function' && !(await accessGate(email))) return;
    const u = new URLSearchParams(location.search);
    if (u.has('yeni')) { history.replaceState(null, '', location.pathname + (DEMO ? '?demo' : '')); await pListLoad(false); return pNewDialog(); }
    const last = store.get('panoLast');
    await pListLoad();
    if (await pIntentRun()) return;
    if (last && P.boards.some(b => b.id === last) && !matchMedia('(max-width: 700px)').matches && store.get('panoReopen', true)) pOpen(last);
  } catch (e) {
    if (!(e instanceof AuthError)) showLogin('Drive\'a bağlanılamadı: ' + e.message);
  }
};

async function pListLoad(render = true) {
  P.loading = true;
  if (render) pListShell();
  try { P.boards = await PDB.list(); } catch (e) { if (!(e instanceof AuthError)) toast('Panolar yüklenemedi: ' + e.message); }
  P.loading = false;
  if (render || !P.board) { pListShell(); }
}
let panoSort = store.get('panoSort', 'guncel');
const SORT_ADLAR = { guncel: 'Son düzenlenen', ad: 'Ada göre', eski: 'Önce eski' };
const sortLabel = () => SORT_ADLAR[panoSort] || 'Sırala';
const SORTIC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M7 5v14M7 5l-3 3M7 5l3 3M17 19V5M17 19l-3-3M17 19l3-3"/></svg>';
function pListShell() {
  P.board = null; P.data = null;
  document.body.classList.remove('pano-open');
  $('#app').innerHTML = `
  <div class="pl-wrap">
    <header class="pl-head">
      <div class="brand-mark sm">${IC.board}</div>
      <h1>Pano</h1>
      <div class="spacer"></div>
      <button class="icon-btn" data-action="p-import" title="Pano dosyası aç">${IC.upload}</button>
      <button class="icon-btn" data-action="p-settings" title="Ayarlar">${IC.gear}</button>
      <button class="btn primary" data-action="p-new">${IC.plus}<span>Yeni pano</span></button>
    </header>
    <div class="pl-bar">
      <form class="searchbox pl-search" id="pSearchForm">${IC.search}<input id="pSearch" type="search" placeholder="Panolarda ara" autocomplete="off" value="${esc(P.q)}"></form>
      <button type="button" class="pl-sort" data-action="p-sort" title="Sıralama">${SORTIC}<span id="pSortLbl">${sortLabel()}</span></button>
    </div>
    <div class="pl-grid" id="pGrid"></div>
  </div>`;
  $('#pSearch').addEventListener('input', e => { P.q = e.target.value.trim(); pListRender(); });
  $('#pSearchForm').addEventListener('submit', e => { e.preventDefault(); e.target.querySelector('input').blur(); });
  pListRender();
}
function pListRender() {
  const el = $('#pGrid'); if (!el) return;
  if (P.loading && !P.boards.length) { el.innerHTML = Array.from({ length: 6 }, () => '<div class="pl-card skel"><div class="pl-thumb"></div><div class="pl-meta"><b></b></div></div>').join(''); return; }
  const k = P.q.toLocaleLowerCase('tr');
  const list = P.boards.filter(b => !k || b.title.toLocaleLowerCase('tr').includes(k));
  if (panoSort === 'ad') list.sort((a, b) => a.title.localeCompare(b.title, 'tr'));
  else if (panoSort === 'eski') list.sort((a, b) => (a.modified || 0) - (b.modified || 0));
  else list.sort((a, b) => (b.modified || 0) - (a.modified || 0));
  el.innerHTML = `<button type="button" class="pl-card pl-new" data-action="p-new"><div class="pl-thumb">${IC.plus}</div><div class="pl-meta"><b>Yeni pano</b><span>Boş ya da şablondan</span></div></button>`
    + list.map(b => {
      let th = ''; try { th = localStorage.getItem('panoThumb:' + b.id) || ''; } catch {}
      return `<div class="pl-card" data-action="p-open" data-id="${esc(b.id)}">
        <div class="pl-thumb">${th ? `<img src="${esc(th)}" alt="">` : IC.board}</div>
        <div class="pl-meta"><b>${esc(b.title)}</b><span>${esc(fmtDate(b.modified, true))}</span></div>
        <button type="button" class="icon-btn pl-more" data-action="p-card-menu" data-id="${esc(b.id)}" title="Seçenekler">${IC.more}</button>
      </div>`;
    }).join('')
    + (!list.length && P.q ? '<div class="list-msg">Sonuç bulunamadı</div>' : '');
}
function pCardMenu(el) {
  const b = P.boards.find(x => x.id === el.dataset.id); if (!b) return;
  pPop(el, `${pItem('ren', IC.pen, 'Yeniden adlandır')}${pItem('dup', IC.copy, 'Çoğalt')}${pItem('del', IC.trash, 'Sil', 'data-danger')}`, async v => {
    if (v === 'ren') { const t = await pAsk('Panoyu yeniden adlandır', 'Adı', b.title); if (!t) return; try { await PDB.rename(b.id, t); b.title = t; pListRender(); } catch (e) { if (!(e instanceof AuthError)) toast('Değiştirilemedi: ' + e.message); } }
    if (v === 'dup') { try { const d = await PDB.get(b.id); const r = await PDB.create(b.title + ' (kopya)', d); P.boards.unshift({ id: r.id, title: b.title + ' (kopya)', modified: r.modified }); pListRender(); toast('Pano çoğaltıldı'); } catch (e) { if (!(e instanceof AuthError)) toast('Çoğaltılamadı: ' + e.message); } }
    if (v === 'del') pDeleteBoard(b);
  });
}
async function pDeleteBoard(b) {
  try {
    await PDB.trash(b.id);
    P.boards = P.boards.filter(x => x.id !== b.id);
    try { localStorage.removeItem('panoThumb:' + b.id); } catch {}
    if (P.board?.id === b.id) pListShell(); else pListRender();
    toast(`"${b.title}" silindi`, [['Geri al', async () => { await PDB.untrash(b.id); pListLoad(!P.board); }]], 6000);
  } catch (e) { if (!(e instanceof AuthError)) toast('Silinemedi: ' + e.message); }
}

/* ───────── Küçük açılır menü ve soru penceresi ───────── */
function pPop(anchor, html, onClick, cls = '') {
  document.querySelector('.ppop')?.remove();
  const m = document.createElement('div');
  m.className = 'ctx-menu sched-pop ppop ' + cls;
  m.innerHTML = html;
  document.body.appendChild(m);
  const r = anchor.getBoundingClientRect(), w = m.offsetWidth, h = m.offsetHeight;
  m.style.left = Math.max(8, Math.min(r.left, innerWidth - w - 8)) + 'px';
  m.style.top = (r.bottom + 6 + h < innerHeight ? r.bottom + 6 : Math.max(8, r.top - h - 6)) + 'px';
  m.addEventListener('click', e => { const it = e.target.closest('[data-v]'); if (!it || it.disabled) return; if (!it.dataset.keep) m.remove(); onClick(it.dataset.v, it); });
  setTimeout(() => document.addEventListener('pointerdown', function off(e) { if (!e.target.closest('.ppop')) { m.remove(); document.removeEventListener('pointerdown', off, true); } }, true), 0);
  return m;
}
const pItem = (v, icon, label, extra = '') => `<button type="button" class="ctx-item" data-v="${esc(v)}" ${extra}>${icon || '<i></i>'}<span>${label}</span></button>`;
function pAsk(title, label, value = '', ok = 'Kaydet') {
  return new Promise(res => {
    $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask">
      <header class="sheet-head"><button type="button" class="icon-btn" data-ask="x">${IC.close}</button><h3>${esc(title)}</h3></header>
      <form class="set-body" id="pAskForm"><label class="nask-l">${esc(label)}<input id="pAskIn" value="${esc(value)}" maxlength="80" autocomplete="off" required></label>
      <div class="sticky-actions"><button type="button" class="btn" data-ask="x">Vazgeç</button><button class="btn primary">${esc(ok)}</button></div></form></div></div>`;
    const done = v => { closeModal(); res(v); };
    $('#pAskForm').addEventListener('submit', e => { e.preventDefault(); done($('#pAskIn').value.trim()); });
    $('#modal').querySelectorAll('[data-ask="x"]').forEach(b => b.onclick = () => done(null));
    setTimeout(() => { $('#pAskIn')?.focus(); $('#pAskIn')?.select(); }, 50);
  });
}

/* ═════════ Tuval: veri modeli ve çizim ═════════
   Öğeler: note (yapışkan not), text, shape (rect, round, ellipse, diamond, tri, pill), line (bağlantı/ok),
   pen (serbest çizim), image, frame (çerçeve). Koordinatlar "dünya" biriminde; ekran = dünya × z + kaydırma. */
const NOTE_COLORS = [['sari', '#fff1a6'], ['turuncu', '#ffd6ad'], ['pembe', '#ffcadb'], ['mor', '#dfd3ff'], ['mavi', '#cbe3ff'], ['yesil', '#cdf1cd'], ['gri', '#e4e6ea'], ['beyaz', '#ffffff']];
const INK = ['#4b5563', '#1b1d21', '#e5484d', '#f08c2e', '#e2b714', '#3f9d50', '#4262ff', '#8e4ec6'];
const FILLS = ['#ffffff', '#fff3b0', '#ffdcbf', '#ffd2e1', '#e3dcff', '#d6e4ff', '#d3f2d6', '#e8eaed', 'none'];
// Şekil dolgusuna uygun koyu kenar rengi (FigJam gibi aynı tonun koyusu)
const EDGE = { '#ffffff': '#1b1d21', '#fff3b0': '#c9a200', '#ffdcbf': '#e07a1f', '#ffd2e1': '#d6457a', '#e3dcff': '#7b5ad9', '#d6e4ff': '#4262ff', '#d3f2d6': '#2f9e47', '#e8eaed': '#6b717a', none: '#1b1d21' };
const SHAPES = [['rect', 'Dikdörtgen'], ['round', 'Yuvarlak köşe'], ['ellipse', 'Elips'], ['diamond', 'Eşkenar dörtgen'], ['tri', 'Üçgen'], ['pill', 'Hap'],
  ['star', 'Yıldız'], ['hex', 'Altıgen'], ['pent', 'Beşgen'], ['para', 'Paralelkenar'], ['arrowR', 'Ok'], ['plus', 'Artı'], ['heart', 'Kalp'], ['cloud', 'Bulut'], ['bubble', 'Konuşma balonu'], ['cyl', 'Silindir']];
const POLY = {
  star: () => Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? .42 : 1; return [.5 + .5 * r * Math.cos(a), .53 + .5 * r * Math.sin(a)]; }),
  hex: () => [[.25, 0], [.75, 0], [1, .5], [.75, 1], [.25, 1], [0, .5]],
  pent: () => [[.5, 0], [1, .38], [.81, 1], [.19, 1], [0, .38]],
  para: () => [[.2, 0], [1, 0], [.8, 1], [0, 1]],
  arrowR: () => [[0, .3], [.6, .3], [.6, 0], [1, .5], [.6, 1], [.6, .7], [0, .7]],
  plus: () => [[.35, 0], [.65, 0], [.65, .35], [1, .35], [1, .65], [.65, .65], [.65, 1], [.35, 1], [.35, .65], [0, .65], [0, .35], [.35, .35]]
};
function curvyPath(kind, x, y, w, h) {
  const X = v => +(x + v * w).toFixed(1), Y = v => +(y + v * h).toFixed(1);
  if (kind === 'heart') return `M${X(.5)} ${Y(.95)}C${X(.1)} ${Y(.62)} ${X(0)} ${Y(.38)} ${X(0)} ${Y(.27)}C${X(0)} ${Y(.1)} ${X(.15)} ${Y(0)} ${X(.28)} ${Y(0)}C${X(.4)} ${Y(0)} ${X(.47)} ${Y(.08)} ${X(.5)} ${Y(.16)}C${X(.53)} ${Y(.08)} ${X(.6)} ${Y(0)} ${X(.72)} ${Y(0)}C${X(.85)} ${Y(0)} ${X(1)} ${Y(.1)} ${X(1)} ${Y(.27)}C${X(1)} ${Y(.38)} ${X(.9)} ${Y(.62)} ${X(.5)} ${Y(.95)}Z`;
  if (kind === 'cloud') return `M${X(.25)} ${Y(.88)}C${X(.1)} ${Y(.88)} ${X(0)} ${Y(.77)} ${X(0)} ${Y(.62)}C${X(0)} ${Y(.48)} ${X(.09)} ${Y(.4)} ${X(.22)} ${Y(.37)}C${X(.23)} ${Y(.18)} ${X(.37)} ${Y(.04)} ${X(.53)} ${Y(.04)}C${X(.67)} ${Y(.04)} ${X(.78)} ${Y(.14)} ${X(.81)} ${Y(.29)}C${X(.93)} ${Y(.3)} ${X(1)} ${Y(.42)} ${X(1)} ${Y(.57)}C${X(1)} ${Y(.74)} ${X(.9)} ${Y(.88)} ${X(.75)} ${Y(.88)}Z`;
  if (kind === 'bubble') { const r = Math.min(16, w / 5, h / 4), b = y + h * .8; return `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${b - r}Q${x + w} ${b} ${x + w - r} ${b}H${x + w * .42}L${x + w * .2} ${y + h}L${x + w * .26} ${b}H${x + r}Q${x} ${b} ${x} ${b - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`; }
  if (kind === 'cyl') { const ry = Math.min(h * .16, 18), rx = w / 2; return `M${x} ${y + ry}A${rx} ${ry} 0 0 1 ${x + w} ${y + ry}V${y + h - ry}A${rx} ${ry} 0 0 1 ${x} ${y + h - ry}ZM${x} ${y + ry}A${rx} ${ry} 0 0 0 ${x + w} ${y + ry}`; }
  return '';
}
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const noteFill = c => (NOTE_COLORS.find(x => x[0] === c) || NOTE_COLORS[0])[1];
const items = () => P.data?.items || [];
const grpOf = set => { const gs = new Set(); for (const i of items()) if (set.has(i.id) && i.grp) gs.add(i.grp); if (!gs.size) return set; const out = new Set(set); for (const i of items()) if (i.grp && gs.has(i.grp)) out.add(i.id); return out; };
const byId = id => items().find(i => i.id === id);

// Yazıyı genişliğe göre satırlara böl (dışa aktarmada da aynı görünsün diye SVG <text> ile çiziliyor)
const measureCtx = document.createElement('canvas').getContext('2d');
const wrapCache = new Map();
function wrapText(text, maxW, fs, weight = 400) {
  const F = typeof curFont === 'function' ? curFont() : FONT;
  const key = `${F.length}|${fs}|${weight}|${Math.round(maxW)}|${text}`;
  if (wrapCache.has(key)) return wrapCache.get(key);
  measureCtx.font = `${weight} ${fs}px ${F}`;
  const out = [];
  for (const para of String(text || '').split('\n')) {
    if (!para) { out.push(''); continue; }
    let line = '';
    for (const word of para.split(/(\s+)/)) {
      const t = line + word;
      if (measureCtx.measureText(t).width <= maxW || !line.trim()) {
        if (measureCtx.measureText(t).width > maxW && !line.trim()) {     // tek kelime sığmıyor: harf harf böl
          let piece = '';
          for (const ch of word) { if (measureCtx.measureText(piece + ch).width > maxW && piece) { out.push(piece); piece = ch; } else piece += ch; }
          line = piece;
        } else line = t;
      } else { out.push(line.trimEnd()); line = word.trimStart(); }
    }
    out.push(line.trimEnd());
  }
  if (wrapCache.size > 3000) wrapCache.clear();
  wrapCache.set(key, out);
  return out;
}
// Notta yazı kutuya sığsın diye otomatik küçülür
function fitFont(it, pad = 16) {
  const w = it.w - pad * 2, h = it.h - pad * 2;
  const start = it.fs || 28;
  const words = String(it.text || '').split(/\s+/).filter(Boolean);
  for (let fs = start; fs >= 9; fs -= (fs > 16 ? 2 : 1)) {
    measureCtx.font = `${it.bold ? 650 : 450} ${fs}px ${curFont()}`;
    if (fs > 12 && words.some(wd => measureCtx.measureText(wd).width > w)) continue;   // kelimeyi bölmektense küçült
    const lines = wrapText(it.text, w, fs, it.bold ? 650 : 450);
    if (lines.length * fs * 1.28 <= h) return { fs, lines };
  }
  return { fs: 9, lines: wrapText(it.text, w, 9) };
}
function textSvg(lines, cx, cy, fs, color, anchor = 'middle', x0 = 0, weight = 450, valign = 'middle') {
  const lh = fs * 1.28, total = lines.length * lh;
  const top = valign === 'top' ? cy : cy - total / 2;
  const x = anchor === 'middle' ? cx : x0;
  return `<text x="${x}" y="${top}" font-family='${FONT}' font-size="${fs}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}">${lines.map((l, i) => `<tspan x="${x}" y="${top + lh * i + fs * 0.98}">${esc(l) || ' '}</tspan>`).join('')}</text>`;
}
function bboxOf(it) {
  if (it.t === 'pen') {
    let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    for (let i = 0; i < it.pts.length; i += 2) { x1 = Math.min(x1, it.pts[i]); x2 = Math.max(x2, it.pts[i]); y1 = Math.min(y1, it.pts[i + 1]); y2 = Math.max(y2, it.pts[i + 1]); }
    return { x: x1, y: y1, w: Math.max(1, x2 - x1), h: Math.max(1, y2 - y1) };
  }
  if (it.t === 'line') { const g = lineGeom(it); const xs = g.pts.map(p => p.x), ys = g.pts.map(p => p.y); const x = Math.min(...xs), y = Math.min(...ys); return { x, y, w: Math.max(1, Math.max(...xs) - x), h: Math.max(1, Math.max(...ys) - y) }; }
  if (it.t === 'text') return { x: it.x, y: it.y, w: it.w, h: textHeight(it) };
  if (it.t === 'table') { const L = tableLayout(it); return { x: it.x, y: it.y, w: L.W, h: L.H }; }
  if (it.t === 'todo') return { x: it.x, y: it.y, w: it.w, h: todoLayout(it).H };
  return { x: it.x, y: it.y, w: it.w, h: it.h };
}
const textHeight = it => Math.max(it.fs * 1.28, wrapText(it.text || ' ', it.w, it.fs, it.bold ? 650 : 450).length * it.fs * 1.28);

/* ───────── El çizimi (eskiz) görünümü ───────── */
const FONT_SK = '"Comic Sans MS", "Chalkboard SE", "Segoe Print", "Bradley Hand", "Comic Neue", cursive';
const sketch = () => !!P.data?.sketch;
const curFont = () => sketch() ? FONT_SK : FONT;
function rng(seed) { let h = 2166136261; for (const c of String(seed)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
// Köşeleri verilen çizgiyi elle çizilmiş gibi iki kez, hafif titreyerek çiz
function roughD(pts, closed, seed, amp = 1.6) {
  const R = rng(seed), j = () => (R() - 0.5) * amp * 2;
  const list = closed ? [...pts, pts[0]] : pts;
  let d = '';
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < list.length - 1; i++) {
      const p = list[i], q = list[i + 1], len = Math.hypot(q.x - p.x, q.y - p.y);
      const bow = Math.min(4, len / 60) * (R() - 0.5) * 2;
      const nx = -(q.y - p.y) / (len || 1), ny = (q.x - p.x) / (len || 1);
      const mx = (p.x + q.x) / 2 + nx * bow + j(), my = (p.y + q.y) / 2 + ny * bow + j();
      d += `${i === 0 ? 'M' : (pass ? 'M' : 'L')}${(p.x + j()).toFixed(1)} ${(p.y + j()).toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${(q.x + j()).toFixed(1)} ${(q.y + j()).toFixed(1)}`;
    }
  }
  return d;
}
function shapePoints(kind, x, y, w, h) {
  if (POLY[kind]) return POLY[kind]().map(([a, b]) => ({ x: x + a * w, y: y + b * h }));
  if (kind === 'ellipse' || kind === 'pill' || kind === 'round') {
    if (kind === 'ellipse') return Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2; return { x: x + w / 2 + Math.cos(a) * w / 2, y: y + h / 2 + Math.sin(a) * h / 2 }; });
    const r = kind === 'pill' ? Math.min(w, h) / 2 : Math.min(18, w / 4, h / 4), pts = [];
    for (const [cx, cy, a0] of [[x + w - r, y + r, -90], [x + w - r, y + h - r, 0], [x + r, y + h - r, 90], [x + r, y + r, 180]])
      for (let k = 0; k <= 4; k++) { const a = (a0 + k * 22.5) * Math.PI / 180; pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }); }
    return pts;
  }
  if (kind === 'diamond') return [{ x: x + w / 2, y }, { x: x + w, y: y + h / 2 }, { x: x + w / 2, y: y + h }, { x, y: y + h / 2 }];
  if (kind === 'tri') return [{ x: x + w / 2, y }, { x: x + w, y: y + h }, { x, y: y + h }];
  return [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];
}

/* ───────── Bağlantı okunun yolu: düz, kıvrımlı ya da köşeli ───────── */
function endPoint(e) { if (e.id) { const o = byId(e.id); if (o) { const b = bboxOf(o); return { x: b.x + b.w / 2, y: b.y + b.h / 2 }; } } return { x: e.x, y: e.y }; }
function clipTo(e, p, other) {
  if (!e.id) return p;
  const o = byId(e.id); if (!o) return p;
  const b = bboxOf(o), dx = other.x - p.x, dy = other.y - p.y;
  if (!dx && !dy) return p;
  if (o.t === 'shape' && (o.kind === 'ellipse' || o.kind === 'pill')) {
    const rx = b.w / 2 + 4, ry = b.h / 2 + 4, k = 1 / Math.sqrt((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry));
    return { x: p.x + dx * k, y: p.y + dy * k };
  }
  const hw = b.w / 2 + 4, hh = b.h / 2 + 4;
  const k = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity);
  return { x: p.x + dx * k, y: p.y + dy * k };
}
// Öğenin karşıya bakan kenarının ortası (kıvrımlı ve köşeli oklar için)
function sideAnchor(e, toward) {
  const c = endPoint(e);
  if (!e.id || !byId(e.id)) { const dx = toward.x - c.x, dy = toward.y - c.y; return { p: c, n: Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx) || 1, y: 0 } : { x: 0, y: Math.sign(dy) || 1 }, free: true }; }
  const b = bboxOf(byId(e.id)), dx = toward.x - c.x, dy = toward.y - c.y, g = 5;
  if (Math.abs(dx) / (b.w || 1) > Math.abs(dy) / (b.h || 1)) return dx > 0 ? { p: { x: b.x + b.w + g, y: c.y }, n: { x: 1, y: 0 } } : { p: { x: b.x - g, y: c.y }, n: { x: -1, y: 0 } };
  return dy > 0 ? { p: { x: c.x, y: b.y + b.h + g }, n: { x: 0, y: 1 } } : { p: { x: c.x, y: b.y - g }, n: { x: 0, y: -1 } };
}
function lineGeom(it) {
  const route = it.route || 'straight';
  if (route === 'straight') {
    const pa = endPoint(it.a), pb = endPoint(it.b), a = clipTo(it.a, pa, pb), b = clipTo(it.b, pb, pa);
    return { d: `M${a.x} ${a.y}L${b.x} ${b.y}`, a, b, pts: [a, b], mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } };
  }
  const ca = endPoint(it.a), cb = endPoint(it.b);
  const A = sideAnchor(it.a, cb), B = sideAnchor(it.b, ca);
  if (A.free) A.n = { x: -B.n.x || Math.sign(cb.x - ca.x) || 1, y: -B.n.y };
  if (B.free) B.n = { x: -A.n.x, y: -A.n.y || 0 };
  const a = A.p, b = B.p;
  if (route === 'curve') {
    const k = Math.max(40, Math.hypot(b.x - a.x, b.y - a.y) / 2.4);
    const c1 = { x: a.x + A.n.x * k, y: a.y + A.n.y * k }, c2 = { x: b.x + B.n.x * k, y: b.y + B.n.y * k };
    const bz = t => { const u = 1 - t; return { x: u * u * u * a.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * b.x, y: u * u * u * a.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * b.y }; };
    const pts = Array.from({ length: 9 }, (_, i) => bz(i / 8));
    return { d: `M${a.x} ${a.y}C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${b.x} ${b.y}`, a, b, pts, mid: bz(0.5) };
  }
  // köşeli: yatay/dikey parçalar
  const ha = A.n.x !== 0, hb = B.n.x !== 0, off = 24;
  const a2 = { x: a.x + A.n.x * off, y: a.y + A.n.y * off }, b2 = { x: b.x + B.n.x * off, y: b.y + B.n.y * off };
  let mid = [];
  if (ha && hb) { const mx = (a2.x + b2.x) / 2; mid = [{ x: mx, y: a2.y }, { x: mx, y: b2.y }]; }
  else if (!ha && !hb) { const my = (a2.y + b2.y) / 2; mid = [{ x: a2.x, y: my }, { x: b2.x, y: my }]; }
  else if (ha) mid = [{ x: b2.x, y: a2.y }];
  else mid = [{ x: a2.x, y: b2.y }];
  const pts = [a, a2, ...mid, b2, b].filter((p, i, arr) => !i || Math.hypot(p.x - arr[i - 1].x, p.y - arr[i - 1].y) > 0.5);
  let L = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); seg.push(l); L += l; }
  let acc = 0, m = pts[0]; for (let i = 0; i < seg.length; i++) { if (acc + seg[i] >= L / 2) { const t = (L / 2 - acc) / (seg[i] || 1); m = { x: pts[i].x + (pts[i + 1].x - pts[i].x) * t, y: pts[i].y + (pts[i + 1].y - pts[i].y) * t }; break; } acc += seg[i]; }
  return { d: 'M' + pts.map(p => `${p.x} ${p.y}`).join('L'), a, b, pts, mid: m };
}
const lineEnds = it => { const g = lineGeom(it); return [g.a, g.b]; };
function penPath(pts) {
  if (pts.length < 4) return `M${pts[0]} ${pts[1]}l0.1 0`;
  let d = `M${pts[0]} ${pts[1]}`;
  for (let i = 2; i < pts.length - 2; i += 2) {
    const mx = (pts[i] + pts[i + 2]) / 2, my = (pts[i + 1] + pts[i + 3]) / 2;
    d += ` Q${pts[i]} ${pts[i + 1]} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  return d + ` L${pts[pts.length - 2]} ${pts[pts.length - 1]}`;
}
function shapePath(kind, x, y, w, h) {
  if (POLY[kind]) return `<path d="M${POLY[kind]().map(([a, b]) => `${+(x + a * w).toFixed(1)} ${+(y + b * h).toFixed(1)}`).join('L')}Z" stroke-linejoin="round"`;
  if (/^(heart|cloud|bubble|cyl)$/.test(kind)) return `<path d="${curvyPath(kind, x, y, w, h)}" stroke-linejoin="round"`;
  if (kind === 'ellipse') return `<ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2}" ry="${h / 2}"`;
  if (kind === 'diamond') return `<path d="M${x + w / 2} ${y}L${x + w} ${y + h / 2}L${x + w / 2} ${y + h}L${x} ${y + h / 2}Z"`;
  if (kind === 'tri') return `<path d="M${x + w / 2} ${y}L${x + w} ${y + h}L${x} ${y + h}Z"`;
  const r = kind === 'round' ? Math.min(18, w / 4, h / 4) : kind === 'pill' ? Math.min(w, h) / 2 : 2;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"`;
}

/* ───────── Yapılacaklar kartı ───────── */
function todoLayout(it) {
  const tl = wrapText(it.title || 'Yapılacaklar', it.w - 90, 17, 650).slice(0, 2), barY = 20 + tl.length * 21.8 + 8;
  let y = barY + 20; const rows = [];
  for (const r of it.rows) { const lines = wrapText(r.t || ' ', it.w - 64, 15, 450), h = Math.max(30, lines.length * 19.2 + 12); rows.push({ y, h, lines }); y += h; }
  return { tl, barY, rows, H: Math.max(y + 12, 120) };
}
function pTodoParse(txt, it) {
  const ls = txt.split(/\r?\n/).map(l => l.trim()).filter(Boolean), title = (ls.shift() || 'Yapılacaklar').slice(0, 80);
  it.title = title; it.rows = ls.slice(0, 60).map(l => { const m = l.match(/^\[(x|X| )?\]\s*(.*)$/); return m ? { t: m[2].slice(0, 200), d: /x/i.test(m[1] || '') } : { t: l.replace(/^[-*•]\s*/, '').slice(0, 200), d: false }; }).filter(r => r.t);
}
function pTodoEdit(it) {
  if (!it) return;
  const txt = [it.title, ...it.rows.map(r => `${r.d ? '[x]' : '[ ]'} ${r.t}`)].join('\n');
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Yapılacaklar listesi</h3></header>
    <form class="set-body" id="pTdForm"><p class="muted sm" style="margin:0 0 8px">İlk satır başlık, sonrakiler birer madde. Biten maddenin başına <b>[x]</b> yaz; kutucuğa kartın üstünden de dokunabilirsin.</p>
    <textarea id="pTdIn" rows="9" maxlength="6000" style="width:100%;box-sizing:border-box;font:inherit;font-size:15px;padding:10px 12px;border-radius:12px;border:1px solid var(--line);background:var(--bg);color:var(--fg)">${esc(txt)}</textarea>
    <div class="sticky-actions"><button type="button" class="btn" data-action="close-modal">Vazgeç</button><button class="btn primary">Kaydet</button></div></form></div></div>`;
  $('#pTdForm').addEventListener('submit', e => { e.preventDefault(); pSnap(); pTodoParse($('#pTdIn').value, it); closeModal(); pChanged(); pRender(); });
  setTimeout(() => { const t = $('#pTdIn'); t?.focus(); t?.setSelectionRange(t.value.length, t.value.length); }, 60);
}
function pTodoYeni() {
  const c = pCenter(), it = { id: uid(), t: 'todo', x: r1(c.x - 140), y: r1(c.y - 100), w: 280, title: 'Yapılacaklar', accent: '#2f9e47', rows: [{ t: 'Birinci iş', d: false }, { t: 'İkinci iş', d: false }, { t: 'Üçüncü iş', d: false }] };
  pPlace([it]); setTimeout(() => pTodoEdit(it), 50);
}
/* ───────── Panoda ara ───────── */
async function pAra() {
  const q = await pAsk('Panoda ara', 'Aranacak yazı', '', 'Ara'); if (!q) return;
  const k = q.toLocaleLowerCase('tr'), bul = [];
  for (const i of items()) { const m = [i.text, i.title, i.label, i.snippet, ...(i.rows || []).map(r => r.t), ...(i.cells || []).flat(), ...(i.comments || []).map(c => c.text)].filter(Boolean).join(' ').toLocaleLowerCase('tr'); if (m.includes(k)) bul.push(i.id); }
  if (!bul.length) return toast('Panoda bulunamadı');
  P.sel = new Set(bul); pSetTool('select'); pFit(true, P.sel); toast(`${bul.length} sonuç bulundu`);
}

/* ───────── Tablo yerleşimi ───────── */
function tableLayout(it) {
  const cols = it.cols, rows = it.cells.length, fs = it.fs || 15, lh = fs * 1.28;
  const rowH = it.cells.map((r, ri) => Math.max(40, ...r.map((t, ci) => wrapText(t || ' ', (cols[ci] || 120) - 20, fs, ri === 0 && it.header ? 650 : 450).length * lh + 18)));
  const colX = [0]; cols.forEach(w => colX.push(colX[colX.length - 1] + w));
  const rowY = [0]; rowH.forEach(h => rowY.push(rowY[rowY.length - 1] + h));
  return { colX, rowY, rowH, W: colX[cols.length], H: rowY[rows], fs, lh };
}

/* ───────── Tek bir öğenin SVG'si (ekranda ve dışa aktarmada aynı) ───────── */
function badges(it) {
  const b = bboxOf(it); let h = '';
  if (it.votes) h += `<g class="pbadge"><circle cx="${b.x}" cy="${b.y}" r="13" fill="#e5484d"/><text x="${b.x}" y="${b.y + 4.5}" font-family='${FONT}' font-size="13" font-weight="700" fill="#fff" text-anchor="middle">${it.votes}</text></g>`;
  if (it.comments?.length) h += `<g class="pbadge" data-cm="${it.id}"><path d="M${b.x + b.w - 14} ${b.y - 12}h24a5 5 0 0 1 5 5v12a5 5 0 0 1-5 5h-14l-7 6v-6h-3a5 5 0 0 1-5-5v-12a5 5 0 0 1 5-5z" fill="#2f7de1"/><text x="${b.x + b.w + 3}" y="${b.y + 5}" font-family='${FONT}' font-size="12" font-weight="700" fill="#fff" text-anchor="middle">${it.comments.length}</text></g>`;
  if (it.locked) h += `<g class="pbadge"><circle cx="${b.x + b.w}" cy="${b.y}" r="11" fill="#3b3f46"/><rect x="${b.x + b.w - 5}" y="${b.y - 1}" width="10" height="7" rx="1.5" fill="#fff"/><path d="M${b.x + b.w - 3} ${b.y - 1}v-2.5a3 3 0 0 1 6 0v2.5" fill="none" stroke="#fff" stroke-width="1.6"/></g>`;
  if (it.cal) h += `<text x="${b.x + b.w - 6}" y="${b.y + b.h - 6}" font-size="16" text-anchor="end">📅</text>`;
  return h;
}
const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(v * f).toString(16).padStart(2, '0')).join(''); };
function noteBody(it, forExport) {
  const x = it.x, y = it.y, w = it.w, h = it.h, c = noteFill(it.color), sh = forExport ? '' : 'filter="url(#pshadow)"';
  if (w < 110 || h < 110) return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${c}" ${sh}/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="url(#pgloss)" pointer-events="none"/>`;
  const F = Math.min(26, Math.round(Math.min(w, h) * .13));   // kıvrık köşe
  const d = `M${x + 5} ${y}H${x + w - 5}Q${x + w} ${y} ${x + w} ${y + 5}V${y + h - F}L${x + w - F} ${y + h}H${x + 5}Q${x} ${y + h} ${x} ${y + h - 5}V${y + 5}Q${x} ${y} ${x + 5} ${y}Z`;
  return `<path d="${d}" fill="${c}" ${sh}/><path d="${d}" fill="url(#pgloss)" pointer-events="none"/>
    <path d="M${x + w} ${y + h - F}L${x + w - F} ${y + h}L${x + w - F} ${y + h - F}Z" fill="${shade(c, .86)}"/><path d="M${x + w} ${y + h - F}L${x + w - F} ${y + h - F}L${x + w - F} ${y + h}" fill="none" stroke="rgba(0,0,0,.12)" stroke-width=".8"/>`;
}
function itemSvg(it, forExport) {
  const hide = !forExport && P.editing?.id === it.id;
  const F = curFont(), sk = sketch();
  const bd = forExport ? '' : badges(it);
  const T = (lines, cx, cy, fs, color, anchor, x0, weight, valign) => textSvg(lines, cx, cy, fs, color, anchor, x0, weight, valign).replace(`font-family='${FONT}'`, `font-family='${F}'`);
  if (it.t === 'note') {
    const { fs, lines } = fitFont(it);
    return `<g data-id="${it.id}" class="pi pi-note">${sk ? `<path d="${roughD(shapePoints('rect', it.x, it.y, it.w, it.h), true, it.id, 1.2)}" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="1.2"/><rect x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}" fill="${noteFill(it.color)}"/>`
      : noteBody(it, forExport)}
      ${hide ? '' : T(lines, it.x + it.w / 2, it.y + it.h / 2, fs, '#1b1d21', it.align === 'left' ? 'start' : 'middle', it.x + 16, it.bold ? 650 : 450)}${bd}</g>`;
  }
  if (it.t === 'text') {
    const lines = wrapText(it.text || ' ', it.w, it.fs, it.bold ? 650 : 450);
    return `<g data-id="${it.id}" class="pi pi-text"><rect x="${it.x}" y="${it.y}" width="${it.w}" height="${textHeight(it)}" fill="transparent"/>
      ${hide ? '' : T(lines, it.x + it.w / 2, it.y, it.fs, it.color || '#1b1d21', it.align === 'center' ? 'middle' : 'start', it.x, it.bold ? 650 : 450, 'top')}${bd}</g>`;
  }
  if (it.t === 'shape') {
    const fill = it.fill === 'none' ? 'transparent' : (it.fill || '#ffffff');
    const fs = it.fs || 18, pad = 12;
    const tw = it.kind === 'diamond' || it.kind === 'tri' ? it.w * 0.6 : it.w - pad * 2;
    const lines = it.text ? wrapText(it.text, tw, fs, it.bold ? 650 : 450) : [];
    const cy = it.kind === 'tri' ? it.y + it.h * 0.62 : it.y + it.h / 2;
    const body = sk ? `${shapePath(it.kind, it.x, it.y, it.w, it.h)} fill="${fill}" stroke="none"/><path d="${roughD(shapePoints(it.kind, it.x, it.y, it.w, it.h), true, it.id)}" fill="none" stroke="${it.stroke || '#1b1d21'}" stroke-width="${(it.sw || 2) * 0.85}" stroke-linecap="round"/>`
      : `${shapePath(it.kind, it.x, it.y, it.w, it.h)} fill="${fill}" stroke="${it.stroke || '#1b1d21'}" stroke-width="${it.sw || 2}"/>`;
    return `<g data-id="${it.id}" class="pi pi-shape">${body}
      ${hide || !lines.length ? '' : T(lines, it.x + it.w / 2, cy, fs, it.tc || '#1b1d21', 'middle', 0, it.bold ? 650 : 450)}${bd}</g>`;
  }
  if (it.t === 'line') {
    const g = lineGeom(it);
    const col = it.color || '#1b1d21', w = it.width || 2;
    const dash = it.dash ? `stroke-dasharray="${w * 4} ${w * 3}"` : '';
    const mk = forExport ? 'pex' : 'pm';
    const label = it.text ? (() => { const { x: mx, y: my } = g.mid; const lines = wrapText(it.text, 180, 15); const lw = Math.max(...lines.map(l => (measureCtx.font = `450 15px ${F}`, measureCtx.measureText(l).width))) + 14, lh = lines.length * 15 * 1.28 + 8;
      return `<rect x="${mx - lw / 2}" y="${my - lh / 2}" width="${lw}" height="${lh}" rx="6" style="fill:var(--pano-bg,#fff)" class="pl-label"/>${hide ? '' : T(lines, mx, my, 15, col)}`; })() : '';
    const d = sk && (it.route || 'straight') !== 'curve' ? roughD(g.pts, false, it.id, 1.1) : g.d;
    return `<g data-id="${it.id}" class="pi pi-line"><path d="${g.d}" stroke="transparent" stroke-width="16" fill="none"/>
      <path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${dash}
        ${it.endB !== 'none' && !sk ? `marker-end="url(#${mk}-${col.slice(1)})"` : ''} ${it.endA === 'arrow' && !sk ? `marker-start="url(#${mk}s-${col.slice(1)})"` : ''}/>
      ${sk ? arrowHeadsSk(it, g, col, w) : ''}${label}${bd}</g>`;
  }
  if (it.t === 'pen') {
    const d = penPath(it.pts);
    return `<g data-id="${it.id}" class="pi pi-pen"><path d="${d}" stroke="transparent" stroke-width="${Math.max(14, it.width + 10)}" fill="none" stroke-linecap="round"/>
      <path d="${d}" stroke="${it.color}" stroke-width="${it.width}" fill="none" stroke-linecap="round" stroke-linejoin="round" ${it.hl ? 'stroke-opacity=".38"' : ''}/>${bd}</g>`;
  }
  if (it.t === 'image') return `<g data-id="${it.id}" class="pi pi-image"><image href="${esc(it.src)}" x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}" preserveAspectRatio="xMidYMid slice"/>${bd}</g>`;
  if (it.t === 'frame') {
    if (it.kind === 'section') {
      const acc = it.accent || '#2f7de1';
      measureCtx.font = `650 15px ${F}`; const tw = measureCtx.measureText(it.title || 'Bölüm').width + 26;
      return `<g data-id="${it.id}" class="pi pi-frame"><rect x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}" rx="18" fill="${it.fill || '#eef4ff'}" stroke="${acc}" stroke-opacity=".35" stroke-width="1.5"/>
        ${hide ? '' : `<rect x="${it.x + 14}" y="${it.y - 15}" width="${tw}" height="30" rx="15" fill="${acc}"/><text x="${it.x + 27}" y="${it.y + 5}" font-family='${F}' font-size="15" font-weight="650" fill="#fff" class="pf-title">${esc(it.title || 'Bölüm')}</text>`}${bd}</g>`;
    }
    return `<g data-id="${it.id}" class="pi pi-frame"><rect x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}" rx="8" fill="${it.fill || '#ffffff'}" stroke="#e1e4e8" stroke-width="1" ${forExport ? '' : 'filter="url(#pfshadow)"'}/>
      ${hide ? '' : `<text x="${it.x + 4}" y="${it.y - 10}" font-family='${F}' font-size="14" font-weight="600" fill="#6b717a" class="pf-title">${esc(it.title || 'Çerçeve')}</text>`}${bd}</g>`;
  }
  if (it.t === 'todo') {
    const L = todoLayout(it), acc = it.accent || '#2f9e47', done = it.rows.filter(r => r.d).length, tot = it.rows.length, fw = it.w - 32;
    let h = `<clipPath id="ptc-${it.id}"><rect x="${it.x}" y="${it.y}" width="${it.w}" height="${L.H}" rx="14"/></clipPath><rect x="${it.x}" y="${it.y}" width="${it.w}" height="${L.H}" rx="14" fill="#ffffff" stroke="#dfe3e8" stroke-width="1.2" ${forExport ? '' : 'filter="url(#pshadow)"'}/>
      <rect x="${it.x}" y="${it.y}" width="${it.w}" height="7" fill="${acc}" clip-path="url(#ptc-${it.id})"/>`;
    if (!hide) h += T(L.tl, 0, it.y + 20, 17, '#1b1d21', 'start', it.x + 16, 650, 'top');
    h += `<text x="${it.x + it.w - 16}" y="${it.y + 33}" font-family='${F}' font-size="13" font-weight="600" fill="#8a919a" text-anchor="end">${done}/${tot}</text>`;
    h += `<rect x="${it.x + 16}" y="${it.y + L.barY}" width="${fw}" height="6" rx="3" fill="#eceef1"/>${tot ? `<rect x="${it.x + 16}" y="${it.y + L.barY}" width="${Math.max(6, fw * done / tot)}" height="6" rx="3" fill="${acc}" ${done ? '' : 'opacity="0"'}/>` : ''}`;
    it.rows.forEach((r, i) => {
      const R_ = L.rows[i], y0 = it.y + R_.y, cx = it.x + 16, cy = y0 + 4;
      h += `<g data-todo="${it.id}|${i}" class="ptodo"><rect x="${it.x + 6}" y="${y0 - 2}" width="38" height="${R_.h}" fill="transparent"/>
        <rect x="${cx}" y="${cy}" width="20" height="20" rx="6" fill="${r.d ? acc : '#fff'}" stroke="${r.d ? acc : '#b9bfc7'}" stroke-width="1.6"/>${r.d ? `<path d="m${cx + 5} ${cy + 10.5} 3.6 3.6 6.6-7.4" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>` : ''}</g>`;
      h += T(R_.lines, 0, y0 + 4, 15, r.d ? '#9aa1ab' : '#1b1d21', 'start', it.x + 48, 450, 'top');
      if (r.d) R_.lines.forEach((l, j) => { measureCtx.font = `450 15px ${F}`; const lw = measureCtx.measureText(l).width; h += `<line x1="${it.x + 48}" x2="${it.x + 48 + lw}" y1="${y0 + 4 + j * 19.2 + 11}" y2="${y0 + 4 + j * 19.2 + 11}" stroke="#9aa1ab" stroke-width="1.4"/>`; });
    });
    return `<g data-id="${it.id}" class="pi pi-todo">${h}${bd}</g>`;
  }
  if (it.t === 'emoji') return `<g data-id="${it.id}" class="pi pi-emoji"><rect x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}" fill="transparent"/><text x="${it.x + it.w / 2}" y="${it.y + it.h * 0.84}" font-size="${it.h * 0.86}" text-anchor="middle" font-family='"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'>${esc(it.ch)}</text>${bd}</g>`;
  if (it.t === 'icon') {
    const d = (PICONS.find(x => x[0] === it.name) || PICONS[0])[2];
    return `<g data-id="${it.id}" class="pi pi-icon"><rect x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}" fill="transparent"/><g transform="translate(${it.x} ${it.y}) scale(${it.w / 24} ${it.h / 24})" fill="none" stroke="${it.color || '#1b1d21'}" stroke-width="${1.7}" stroke-linecap="round" stroke-linejoin="round">${d}</g>${bd}</g>`;
  }
  if (it.t === 'table') {
    const L = tableLayout(it), sw = 1.2, line = it.stroke || '#9aa1ab';
    let h = `<rect x="${it.x}" y="${it.y}" width="${L.W}" height="${L.H}" fill="#ffffff" stroke="${line}" stroke-width="${sw}" rx="3"/>`;
    if (it.header) h += `<rect x="${it.x}" y="${it.y}" width="${L.W}" height="${L.rowH[0]}" fill="${it.hfill || '#eef0f3'}" stroke="none"/>`;
    for (let c = 1; c < it.cols.length; c++) h += `<line x1="${it.x + L.colX[c]}" y1="${it.y}" x2="${it.x + L.colX[c]}" y2="${it.y + L.H}" stroke="${line}" stroke-width="${sw}"/>`;
    for (let r = 1; r < it.cells.length; r++) h += `<line x1="${it.x}" y1="${it.y + L.rowY[r]}" x2="${it.x + L.W}" y2="${it.y + L.rowY[r]}" stroke="${line}" stroke-width="${sw}"/>`;
    it.cells.forEach((row, r) => row.forEach((t, c) => {
      if (!t || (hide && P.editing?.cell?.[0] === r && P.editing?.cell?.[1] === c)) return;
      const lines = wrapText(t, it.cols[c] - 20, L.fs, r === 0 && it.header ? 650 : 450);
      h += T(lines, 0, it.y + L.rowY[r] + 9, L.fs, '#1b1d21', 'start', it.x + L.colX[c] + 10, r === 0 && it.header ? 650 : 450, 'top');
    }));
    return `<g data-id="${it.id}" class="pi pi-table">${h}${bd}</g>`;
  }
  if (it.t === 'link' || it.t === 'mail') {
    const isMail = it.t === 'mail', pad = 14;
    const title = wrapText(it.title || it.url || '', it.w - pad * 2 - (isMail ? 30 : 30), 15, 650).slice(0, 2);
    const sub = isMail ? `${it.from || ''}${it.date ? ' · ' + fmtDate(it.date) : ''}` : (it.host || '');
    const snip = isMail && it.snippet ? wrapText(it.snippet, it.w - pad * 2, 12.5).slice(0, Math.max(0, Math.floor((it.h - 70 - title.length * 19) / 16))) : [];
    const ic = isMail ? `<g transform="translate(${it.x + pad} ${it.y + pad}) scale(.9)" fill="none" stroke="#5f6570" stroke-width="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m3 6 9 7 9-7"/></g>`
      : (forExport ? `<g transform="translate(${it.x + pad} ${it.y + pad}) scale(.85)" fill="none" stroke="#5f6570" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></g>`
        : `<image href="https://www.google.com/s2/favicons?domain=${encodeURIComponent(it.host || '')}&sz=64" x="${it.x + pad}" y="${it.y + pad}" width="20" height="20"/>`);
    let h = `<rect x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}" rx="12" fill="#ffffff" stroke="#d5d9df" stroke-width="1.2" ${forExport ? '' : 'filter="url(#pshadow)"'}/>${ic}`;
    h += T(title, 0, it.y + pad, 15, '#1b1d21', 'start', it.x + pad + 30, 650, 'top');
    const subY = it.y + pad + title.length * 19 + 6;
    h += T([sub], 0, subY, 12.5, '#6b717a', 'start', it.x + pad + (isMail ? 0 : 30), 450, 'top');
    if (snip.length) h += T(snip, 0, subY + 20, 12.5, '#4a4f57', 'start', it.x + pad, 450, 'top');
    if (!isMail) h += `<text x="${it.x + it.w - pad}" y="${it.y + it.h - pad + 2}" font-size="14" fill="#9aa1ab" text-anchor="end">↗</text>`;
    return `<g data-id="${it.id}" class="pi pi-${it.t}">${h}${bd}</g>`;
  }
  return '';
}
function arrowHeadsSk(it, g, col, w) {
  const head = (tip, from) => { const a = Math.atan2(tip.y - from.y, tip.x - from.x), L = 10 + w * 2, s = 0.45;
    return `<path d="M${tip.x - L * Math.cos(a - s)} ${tip.y - L * Math.sin(a - s)}L${tip.x} ${tip.y}L${tip.x - L * Math.cos(a + s)} ${tip.y - L * Math.sin(a + s)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`; };
  let h = ''; const P2 = g.pts;
  if (it.endB !== 'none') h += head(g.b, P2[P2.length - 2] || g.a);
  if (it.endA === 'arrow') h += head(g.a, P2[1] || g.b);
  return h;
}
function markerDefs(prefix, cols) {
  const head = c => `<path d="M1 1.2L9.2 5L1 8.8Q2.6 5 1 1.2z" fill="${c}" stroke="${c}" stroke-width="1" stroke-linejoin="round"/>`;
  return [...new Set(cols)].map(c => `<marker id="${prefix}-${c.slice(1)}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.6" markerHeight="4.6" orient="auto-start-reverse">${head(c)}</marker>
    <marker id="${prefix}s-${c.slice(1)}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.6" markerHeight="4.6" orient="auto-start-reverse">${head(c)}</marker>`).join('');
}
// Çizim sırası: çerçeveler en altta, oklar en üstte
const drawOrder = list => [...list.filter(i => i.t === 'frame'), ...list.filter(i => i.t !== 'frame' && i.t !== 'line'), ...list.filter(i => i.t === 'line')];

/* ═════════ Pano ekranı ═════════ */
async function pOpen(id) {
  const meta = P.boards.find(b => b.id === id); if (!meta) return;
  store.set('panoLast', id);
  P.board = { ...meta }; P.data = null; P.sel.clear(); P.hist = []; P.fut = []; P.tool = 'select'; P.editing = null;
  pShell();
  pStatus('Açılıyor…');
  try {
    let data = await PDB.get(id);
    const local = YEREL ? null : store.get('panoLocal:' + id);
    if (local?.dirty && local.at > (meta.modified || 0)) { data = local.data; P.dirty = true; }   // çevrimdışı yapılmış değişiklik
    P.data = pNormalize(data);
    if (P.board?.id !== id) return;
    if (P.data.view) P.V = { ...P.data.view }; else pFit(false);
    pStatus(P.dirty ? 'Kaydedilmedi' : '');
    pRender(); pThumbSoon();
    if (P.dirty) pSaveSoon(200);
  } catch (e) {
    if (e instanceof AuthError) return;
    const local = store.get('panoLocal:' + id);
    if (local) { P.data = pNormalize(local.data); P.V = { ...(P.data.view || { x: 0, y: 0, z: 1 }) }; pRender(); pStatus('Çevrimdışı · bu cihazdaki kopya'); }
    else { toast('Pano açılamadı: ' + e.message); pListShell(); }
  }
}
function pNormalize(d) {
  d = d && typeof d === 'object' ? d : {};
  d.v = 1; d.items = Array.isArray(d.items) ? d.items.filter(i => i && i.id && i.t) : [];
  for (const i of d.items) if (i.t === 'todo') { i.rows = Array.isArray(i.rows) ? i.rows.filter(r => r && typeof r.t === 'string').slice(0, 60).map(r => ({ t: r.t.slice(0, 200), d: !!r.d })) : []; i.w = Math.min(800, Math.max(200, +i.w || 280)); }
  return d;
}
// Araç simgeleri: renkli, Miro/FigJam gibi
const TI = {
  select: '<svg viewBox="0 0 24 24"><path d="M6 3.8 18.6 11l-5.4 1.4-2.6 5.2z" fill="currentColor" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  hand: IC.hand,
  note: '<svg viewBox="0 0 24 24"><path d="M4.5 4.5h15v10.2L14.7 19.5H4.5z" fill="#ffd84d" stroke="#d9a400" stroke-width="1.2" stroke-linejoin="round"/><path d="M14.7 19.5v-4.8h4.8z" fill="#f2b800"/></svg>',
  text: '<svg viewBox="0 0 24 24"><path d="M5.5 7V5h13v2M12 5v14M9.5 19h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  shape: '<svg viewBox="0 0 24 24"><rect x="3.5" y="9.5" width="10" height="10" rx="2.2" fill="#d6e4ff" stroke="#4262ff" stroke-width="1.4"/><circle cx="15.8" cy="8.2" r="4.7" fill="#ffd2e1" stroke="#d6457a" stroke-width="1.4"/></svg>',
  line: '<svg viewBox="0 0 24 24"><path d="M5 19C9 19 9 7 17.5 6.5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="m14.6 3.8 4.4 2.6-3 4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  pen: '<svg viewBox="0 0 24 24"><path d="m15.5 3.8 4.7 4.7L9.4 19.3l-5.6 1 1-5.6z" fill="#e8eaed" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="m3.8 20.3 1-5.6 4.6 4.6z" fill="#4262ff"/></svg>',
  eraser: '<svg viewBox="0 0 24 24"><path d="m4 14.5 8.5-8.5a2 2 0 0 1 2.8 0l3.2 3.2a2 2 0 0 1 0 2.8L12 18.5H8z" fill="#ffd2e1" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 18.5 4 14.5l4-4 8 8M8 18.5h12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/></svg>',
  frame: '<svg viewBox="0 0 24 24"><rect x="5" y="6.5" width="14" height="12" rx="1.8" fill="#fff" stroke="currentColor" stroke-width="1.6"/><path d="M5 3.5h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  stamp: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.6" fill="#ffd84d" stroke="#d9a400" stroke-width="1.2"/><circle cx="9.2" cy="10" r="1.1" fill="#5a3d00"/><circle cx="14.8" cy="10" r="1.1" fill="#5a3d00"/><path d="M8.3 13.6a4.3 4.3 0 0 0 7.4 0" fill="none" stroke="#5a3d00" stroke-width="1.5" stroke-linecap="round"/></svg>',
  insert: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 8.5v7M8.5 12h7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
};
function pShell() {
  document.body.classList.add('pano-open');
  const tool = (t, tip) => `<button type="button" class="pt ${P.tool === t ? 'on' : ''}" data-tool="${t}" title="${tip}">${TI[t]}</button>`;
  $('#app').innerHTML = `
  <div class="pano-shell" id="pShell">
    <div class="pb-stage ${P.grid ? 'grid' : ''}" id="pStage">
      <svg id="pSvg" xmlns="http://www.w3.org/2000/svg"><defs id="pDefs"></defs><g id="pWorld"></g><g id="pOver"></g></svg>
      <div id="pEdit" class="pb-edit" hidden></div>
      <div id="pCtx" class="pb-ctx" hidden></div>
      <div class="pb-island pb-tl">
        <button class="icon-btn" data-action="p-home" title="Panolar">${IC.board}</button>
        <span class="pb-div"></span>
        <input class="pb-title" id="pTitle" value="${esc(P.board.title)}" maxlength="80" spellcheck="false" aria-label="Pano adı">
        <span class="pb-status" id="pStatus"></span>
        <button class="icon-btn" data-action="p-menu" title="Diğer">${IC.more}</button>
      </div>
      <div class="pb-island pb-tr">
        <button class="icon-btn" data-action="p-undo" id="pUndo" title="Geri al (Ctrl+Z)">${IC.undo}</button>
        <button class="icon-btn" data-action="p-redo" id="pRedo" title="Yinele (Ctrl+Y)">${IC.redo}</button>
        <span class="pb-div"></span>
        <button class="icon-btn" data-action="p-timer" title="Zamanlayıcı">${IC.timer}</button>
        <button class="icon-btn" data-action="p-present" title="Sunum">${IC.play}</button>
        <button class="pb-cta" data-action="p-share" title="Dışa aktar">${IC.share}<span>Dışa aktar</span></button>
      </div>
      <div class="pb-island pb-zoom">
        <button type="button" class="icon-btn" data-action="p-zoom-out" title="Uzaklaştır (−)">${IC.minus}</button>
        <button type="button" class="pb-zl" id="pZoomL" data-action="p-zoom-menu" title="Yakınlaştırma">100%</button>
        <button type="button" class="icon-btn" data-action="p-zoom-in" title="Yakınlaştır (+)">${IC.plus}</button>
        <span class="pb-div"></span>
        <button type="button" class="icon-btn" data-action="p-fit" title="Hepsini göster (Shift+1)">${IC.fit}</button>
      </div>
      <div class="pb-mini" id="pMini" hidden><svg id="pMiniSvg"></svg></div>
      <div class="pb-banner" id="pBanner" hidden></div>
      <div class="pb-timer" id="pTimer" hidden></div>
      <div class="pb-present" id="pPres" hidden></div>
      <div class="pb-empty" id="pEmpty" hidden>
        <div class="pe-art">${TI.note}${TI.shape}${TI.stamp}</div>
        <b>Boş bir pano</b>
        <span>Boş bir yere çift tıklayıp not yaz ya da hazır bir şablonla başla.</span>
        <div class="pe-acts"><button type="button" class="btn primary" data-action="p-tpl">Şablon seç</button><button type="button" class="btn" data-action="p-quicknote">Not ekle</button></div>
      </div>
      <nav class="pb-island pb-tools" id="pTools">
        ${tool('select', 'Seç (V)')}
        ${tool('hand', 'Kaydır (H ya da boşluk tuşu)')}
        <span class="pt-sep"></span>
        ${tool('note', 'Yapışkan not (N)')}
        ${tool('text', 'Metin (T)')}
        ${tool('shape', 'Şekil (R)')}
        ${tool('line', 'Bağlantı oku (L)')}
        ${tool('pen', 'Kalem (P)')}
        ${tool('eraser', 'Silgi (E)')}
        ${tool('frame', 'Çerçeve ya da bölüm (F)')}
        ${tool('stamp', 'Damga ve emoji (S)')}
        <span class="pt-sep"></span>
        <button type="button" class="pt" data-tool="insert" title="Ekle: resim, simge, tablo, bağlantı, not, mail, şablon">${TI.insert}</button>
      </nav>
    </div>
  </div>`;
  const ti = $('#pTitle');
  const fitTitle = () => { measureCtx.font = `650 15px ${FONT}`; ti.style.width = Math.min(320, Math.max(60, measureCtx.measureText(ti.value || ' ').width + 22)) + 'px'; };
  fitTitle(); ti.addEventListener('input', fitTitle);
  ti.addEventListener('change', () => pRename(ti.value.trim()));
  ti.addEventListener('keydown', e => { if (e.key === 'Enter') ti.blur(); if (e.key === 'Escape') { ti.value = P.board.title; ti.blur(); } });
  $('#pTools').addEventListener('click', e => { const b = e.target.closest('[data-tool]'); if (b) pToolClick(b.dataset.tool, b); });
  pBindStage();
  pHistBtns();
}
function pStatus(s) { P.status = s; const el = $('#pStatus'); if (el) el.textContent = s; }
async function pRename(t) {
  if (!t || !P.board || t === P.board.title) { if ($('#pTitle')) $('#pTitle').value = P.board?.title || ''; return; }
  P.board.title = t;
  const m = P.boards.find(b => b.id === P.board.id); if (m) m.title = t;
  P.dirty = true; pSaveSoon(300);
}

/* ───────── Görünüm (kaydırma, yakınlaştırma) ───────── */
const stageRect = () => $('#pSvg').getBoundingClientRect();
function toWorld(cx, cy) { const r = stageRect(); return { x: (cx - r.left - P.V.x) / P.V.z, y: (cy - r.top - P.V.y) / P.V.z }; }
const BG_TINTS = [['#f3f4f6', 'Gri'], ['#ffffff', 'Beyaz'], ['#fbf5e6', 'Krem'], ['#eaf6ee', 'Nane'], ['#e9f2fb', 'Gök'], ['#f1edfb', 'Lavanta'], ['#fcedf1', 'Pembe']];
const BG_STILLER = [['dot', 'Noktalı'], ['grid', 'Kareli'], ['line', 'Çizgili'], ['none', 'Düz']];
function bgOf() { const b = P.data?.bg || {}; return { s: b.s || (P.grid ? 'dot' : 'none'), c: /^#[0-9a-f]{6}$/i.test(b.c || '') ? b.c : '#f3f4f6' }; }
function bgDot(c) { const n = parseInt(c.slice(1), 16), f = .82; return `rgb(${Math.round((n >> 16) * f)},${Math.round(((n >> 8) & 255) * f)},${Math.round((n & 255) * f)})`; }
function pApplyBg() {
  const st = $('#pStage'); if (!st) return;
  const { s, c } = bgOf(), d = bgDot(c), g = 24 * P.V.z, g5 = g * 1;
  st.style.setProperty('--pano-bg', c); st.style.backgroundColor = c;
  const kare = `${g}px ${g}px`;
  if (s === 'dot') { st.style.backgroundImage = `radial-gradient(circle, ${d} ${Math.max(1, 1.1 * Math.min(1.6, P.V.z))}px, transparent ${Math.max(1.25, 1.35 * Math.min(1.6, P.V.z))}px)`; st.style.backgroundSize = kare; }
  else if (s === 'grid') { st.style.backgroundImage = `linear-gradient(${d} 1px, transparent 1px), linear-gradient(90deg, ${d} 1px, transparent 1px)`; st.style.backgroundSize = `${kare}, ${kare}`; }
  else if (s === 'line') { st.style.backgroundImage = `linear-gradient(to bottom, transparent calc(100% - 1px), ${d} 0)`; st.style.backgroundSize = `100% ${g * 1.5}px`; }
  else { st.style.backgroundImage = 'none'; }
  st.style.backgroundPosition = `${P.V.x}px ${P.V.y}px`;
}
function pZeminMenu(btn) {
  const b = bgOf();
  pPop(btn, `<div class="ctx-title">Zemin deseni</div><div class="pbgs">${BG_STILLER.map(([k, n]) => `<button type="button" class="pbg ${b.s === k ? 'on' : ''}" data-v="s:${k}" data-keep="1"><i class="pbg-${k}"></i><span>${n}</span></button>`).join('')}</div>
    <div class="ctx-title">Zemin rengi</div><div class="pswatches">${BG_TINTS.map(([c, n]) => `<button type="button" class="psw ${b.c === c ? 'on' : ''}" data-v="c:${c}" data-keep="1" style="--c:${c}" title="${n}"></button>`).join('')}</div>`, (v, el) => {
    pSnap(); P.data.bg = { ...bgOf() }; const [k, val] = v.split(':'); P.data.bg[k] = val; pApplyBg(); pChanged();
    el.closest('.ppop').querySelectorAll(k === 's' ? '.pbg' : '.psw').forEach(x => x.classList.toggle('on', x === el));
  });
}
function pApplyView() {
  const t = `translate(${P.V.x} ${P.V.y}) scale(${P.V.z})`;
  $('#pWorld')?.setAttribute('transform', t);
  $('#pOver')?.setAttribute('transform', t);
  const st = $('#pStage');
  pApplyBg();
  const zl = $('#pZoomL'); if (zl) zl.textContent = Math.round(P.V.z * 100) + '%';
  pPlaceEditor(); pCtxBar(); pViewSaveSoon(); pMiniSoon();
}
function pZoomAt(z, cx, cy) {
  z = Math.min(4, Math.max(0.1, z));
  const r = stageRect();
  if (cx == null) { cx = r.left + r.width / 2; cy = r.top + r.height / 2; }
  const px = cx - r.left, py = cy - r.top;
  P.V.x = px - (px - P.V.x) * (z / P.V.z); P.V.y = py - (py - P.V.y) * (z / P.V.z); P.V.z = z;
  pApplyView(); pRenderOverlay();
}
function pFit(apply = true, ids) {
  const list = ids ? items().filter(i => ids.has(i.id)) : items();
  const r = $('#pSvg') ? stageRect() : { width: innerWidth, height: innerHeight - 120 };
  if (!list.length) { P.V = { x: r.width / 2, y: r.height / 2, z: 1 }; if (apply) pApplyView(); return; }
  const b = unionBox(list.map(bboxOf));
  // yüzen panellerin altında kalmasın: solda araçlar, üstte başlık, altta yakınlaştırma
  const mob = matchMedia('(max-width: 700px)').matches;
  const pl = mob ? 20 : 90, pr = mob ? 20 : 40, pt = mob ? 70 : 80, pb = mob ? 90 : 70;
  const z = Math.min(1.6, Math.max(0.1, Math.min((r.width - pl - pr) / b.w, (r.height - pt - pb) / b.h)));
  P.V = { z, x: pl + (r.width - pl - pr) / 2 - (b.x + b.w / 2) * z, y: pt + (r.height - pt - pb) / 2 - (b.y + b.h / 2) * z };
  if (apply) { pApplyView(); pRenderOverlay(); }
}
const unionBox = bs => { const x1 = Math.min(...bs.map(b => b.x)), y1 = Math.min(...bs.map(b => b.y)), x2 = Math.max(...bs.map(b => b.x + b.w)), y2 = Math.max(...bs.map(b => b.y + b.h)); return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 }; };
let pViewT = 0;
function pViewSaveSoon() { if (!P.data) return; clearTimeout(pViewT); pViewT = setTimeout(() => { if (P.data) { P.data.view = { ...P.V }; pLocalSave(false); } }, 800); }

/* ───────── Çizim ───────── */
const GLOSS = '<linearGradient id="pgloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".06"/></linearGradient>';
const SHADOW = GLOSS + '<filter id="pshadow" x="-15%" y="-15%" width="130%" height="140%"><feDropShadow dx="0" dy="1" stdDeviation=".6" flood-color="#1b1d21" flood-opacity=".10"/><feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#1b1d21" flood-opacity=".10"/></filter>'
  + '<filter id="pfshadow" x="-5%" y="-5%" width="110%" height="115%"><feDropShadow dx="0" dy="2" stdDeviation="5" flood-color="#1b1d21" flood-opacity=".07"/></filter>'
  + '<filter id="phs" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000" flood-opacity=".25"/></filter>';
function pRender() {
  const world = $('#pWorld'); if (!world || !P.data) return;
  const cols = items().filter(i => i.t === 'line').map(i => i.color || '#1b1d21').concat(P.draft?.t === 'line' ? [P.draft.color || '#1b1d21'] : []);
  $('#pDefs').innerHTML = SHADOW + markerDefs('pm', cols.length ? cols : ['#1b1d21']);
  const list = drawOrder(items());
  world.innerHTML = list.map(i => itemSvg(i)).join('') + (P.draft ? itemSvg(P.draft) : '');
  $('#pEmpty').hidden = !!items().length || !!P.draft;
  if (P.seenFor === P.data && P.seen) { for (const g of world.querySelectorAll('.pi[data-id]')) if (!P.seen.has(g.dataset.id) && !P.draft) g.classList.add('pi-new'); }
  P.seenFor = P.data; P.seen = new Set(list.map(i => i.id));
  pApplyView(); pRenderOverlay(); pMiniSoon();
}
function pRenderOverlay() {
  const ov = $('#pOver'); if (!ov) return;
  const z = P.V.z, hs = 9 / z, sw = 1.5 / z;
  let h = '';
  const sel = items().filter(i => P.sel.has(i.id));
  for (const it of sel) {
    if (it.t === 'line') {
      const g = lineGeom(it), a = g.a, b = g.b;
      h += `<path d="${g.d}" fill="none" stroke="#4262ff" stroke-width="${sw * 2}" stroke-opacity=".35" pointer-events="none"/>`;
      if (sel.length === 1) for (const [k, p] of [['a', a], ['b', b]]) h += `<circle data-h="${k}" cx="${p.x}" cy="${p.y}" r="${hs * 0.7}" fill="#fff" stroke="#4262ff" stroke-width="${sw}" class="ph-end"/>`;
      continue;
    }
    const b = bboxOf(it), m = 4 / z;
    h += `<rect x="${b.x - m}" y="${b.y - m}" width="${b.w + m * 2}" height="${b.h + m * 2}" fill="none" stroke="#4262ff" stroke-width="${sw}" rx="${3 / z}" pointer-events="none"/>`;
  }
  if (sel.length === 1 && sel[0].t !== 'line') {
    const it = sel[0], b = bboxOf(it), m = 4 / z;
    const corners = it.t === 'text' ? [['e', b.x + b.w + m, b.y + b.h / 2]] : [['nw', b.x - m, b.y - m], ['ne', b.x + b.w + m, b.y - m], ['sw', b.x - m, b.y + b.h + m], ['se', b.x + b.w + m, b.y + b.h + m]];
    for (const [k, x, y] of corners) h += `<circle data-h="${k}" cx="${x}" cy="${y}" r="${hs * 0.62}" fill="#fff" stroke="#4262ff" stroke-width="${sw * 1.3}" class="ph-${k}" filter="url(#phs)"/>`;
    // Hızlı bağlantı noktaları (Miro'daki gibi): tutup sürükleyince ok çıkar
    if (/^(note|shape|image|text)$/.test(it.t) && !P.drag) {
      const d = 22 / z, r = 5.5 / z;
      for (const [x, y] of [[b.x + b.w / 2, b.y - d], [b.x + b.w + d, b.y + b.h / 2], [b.x + b.w / 2, b.y + b.h + d], [b.x - d, b.y + b.h / 2]])
        h += `<circle data-h="link" cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="#4262ff" stroke-width="${sw * 1.3}" class="ph-link"/><circle cx="${x}" cy="${y}" r="${r * 0.45}" fill="#4262ff" pointer-events="none"/>`;
    }
  } else if (sel.length > 1) {
    const b = unionBox(sel.map(bboxOf)), m = 8 / z;
    h += `<rect x="${b.x - m}" y="${b.y - m}" width="${b.w + m * 2}" height="${b.h + m * 2}" fill="none" stroke="#4262ff" stroke-width="${sw}" stroke-dasharray="${4 / z} ${3 / z}" pointer-events="none"/>`;
  }
  if (P.guides) for (const g of P.guides) h += g.x != null ? `<line x1="${g.x}" y1="${g.y1}" x2="${g.x}" y2="${g.y2}" stroke="#f0508c" stroke-width="${sw}" pointer-events="none"/>` : `<line x1="${g.x1}" y1="${g.y}" x2="${g.x2}" y2="${g.y}" stroke="#f0508c" stroke-width="${sw}" pointer-events="none"/>`;
  if (P.marq) { const q = P.marq; h += `<rect x="${Math.min(q.x0, q.x1)}" y="${Math.min(q.y0, q.y1)}" width="${Math.abs(q.x1 - q.x0)}" height="${Math.abs(q.y1 - q.y0)}" fill="#4262ff" fill-opacity=".08" stroke="#4262ff" stroke-width="${sw}" pointer-events="none"/>`; }
  if (P.hover) { const b = bboxOf(P.hover), m = 6 / z; h += `<rect x="${b.x - m}" y="${b.y - m}" width="${b.w + m * 2}" height="${b.h + m * 2}" fill="none" stroke="#4262ff" stroke-width="${sw * 1.6}" rx="${6 / z}" pointer-events="none"/>`; }
  ov.innerHTML = h;
  pCtxBar();
}

/* ═════════ Geçmiş (geri al / yinele) ve kaydetme ═════════ */
function pSnap() { P.hist.push(JSON.stringify(items())); if (P.hist.length > 100) P.hist.shift(); P.fut = []; pHistBtns(); }
function pUndo() { if (!P.hist.length) return; pEditEnd(); P.fut.push(JSON.stringify(items())); P.data.items = JSON.parse(P.hist.pop()); pAfterHist(); }
function pRedo() { if (!P.fut.length) return; pEditEnd(); P.hist.push(JSON.stringify(items())); P.data.items = JSON.parse(P.fut.pop()); pAfterHist(); }
function pAfterHist() { for (const id of [...P.sel]) if (!byId(id)) P.sel.delete(id); pRender(); pChanged(true); pHistBtns(); }
function pHistBtns() { const u = $('#pUndo'), r = $('#pRedo'); if (u) u.disabled = !P.hist.length; if (r) r.disabled = !P.fut.length; }
function pChanged(noHistBtns) { P.dirty = true; pStatus('Kaydedilmedi'); pLocalSave(true); pSaveSoon(); if (!noHistBtns) pHistBtns(); }
function pLocalSave(dirty) {
  if (YEREL || !P.board || !P.data) return;
  try { store.set('panoLocal:' + P.board.id, { at: Date.now(), dirty: dirty || P.dirty, data: P.data }); }
  catch { /* cihaz deposu doluysa (büyük resimler) sadece Drive'a kaydedilir */ }
}
function pSaveSoon(ms = 1500) { clearTimeout(P.timer); P.timer = setTimeout(pSave, ms); }
async function pSave() {
  if (!P.board || !P.data || !P.dirty) return;
  if (P.saving) return pSaveSoon(800);
  P.saving = true; P.dirty = false; pStatus('Kaydediliyor…');
  const id = P.board.id, title = P.board.title;
  P.data.view = { ...P.V };
  try {
    const mod = await PDB.save(id, title, P.data);
    const m = P.boards.find(b => b.id === id); if (m) { m.modified = mod; m.title = title; }
    if (P.board?.id === id) { P.board.modified = mod; if (!P.dirty) pStatus('Kaydedildi'); }
    if (!YEREL) { try { store.set('panoLocal:' + id, { at: Date.now(), dirty: false, data: P.data }); } catch {} }
    pThumbSoon();
  } catch (e) {
    P.dirty = true;
    if (e instanceof AuthError) { P.saving = false; return; }
    const off = !YEREL && (e instanceof TypeError || !navigator.onLine);
    pStatus(off ? 'Çevrimdışı · bu cihazda saklandı' : 'Kaydedilemedi');
    if (!off) toast(YEREL ? 'Pano kaydedilemedi: cihazın depolama alanı dolmuş olabilir. Büyük resimleri silmeyi dene.' : 'Pano kaydedilemedi: ' + e.message);
    pSaveSoon(off ? 15000 : 6000);
  }
  P.saving = false;
}
window.addEventListener('online', () => { if (P.dirty) pSaveSoon(300); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && P.dirty) pSave(); });
window.addEventListener('beforeunload', e => { if (P.dirty) { pSave(); e.preventDefault(); e.returnValue = ''; } });
let pThumbT = 0;
function pThumbSoon() { clearTimeout(pThumbT); pThumbT = setTimeout(async () => {
  if (!P.board || !P.data) return;
  try { const url = await pRaster(null, 360, 'image/jpeg', 0.72); if (url) localStorage.setItem('panoThumb:' + P.board.id, url); } catch {}
}, 1200); }

/* ═════════ Araçlar ═════════ */
function pSetTool(t) {
  pEditEnd();
  P.tool = t;
  document.querySelectorAll('#pTools .pt').forEach(b => b.classList.toggle('on', b.dataset.tool === t));
  const st = $('#pStage'); if (st) st.dataset.tool = t;
  if (t !== 'select') { P.sel.clear(); pRenderOverlay(); }
}
function pToolClick(t, btn) {
  if (t === 'image') return pPickImage();
  if (t === 'template') return pTemplateDialog(true);
  if (t === 'insert') return pInsertMenu(btn);
  if (t === 'stamp') { pSetTool('stamp'); return pStampMenu(btn); }
  if (t === 'frame' && P.tool === 'frame') return pFrameMenu(btn);
  if (t === 'shape' && P.tool === 'shape') return pShapeMenu(btn);
  if (t === 'pen' && P.tool === 'pen') return pPenMenu(btn);
  pSetTool(t);
  if (t === 'shape') pShapeMenu(btn);
  if (t === 'frame') pFrameMenu(btn);
}
function pShapeMenu(btn) {
  pPop(btn, `<div class="ctx-title">Şekil</div><div class="pshapes">${SHAPES.map(([k, n]) => `<button type="button" class="pshape ${P.shape === k ? 'on' : ''}" data-v="${k}" title="${n}"><svg viewBox="0 0 40 30">${shapePath(k, 4, 4, 32, 22)} fill="none" stroke="currentColor" stroke-width="2"/></svg></button>`).join('')}</div>`, v => { P.shape = v; pSetTool('shape'); }, 'pside');
}
function pPenMenu(btn) {
  pPop(btn, `<div class="ctx-title">Kalem</div><div class="pswatches">${INK.map(c => `<button type="button" class="psw ${P.penColor === c ? 'on' : ''}" data-v="c${c}" data-keep="1" style="--c:${c}"></button>`).join('')}</div>
    <div class="pwidths">${[[2, 'İnce'], [4, 'Orta'], [8, 'Kalın'], [16, 'Fosforlu']].map(([w, n]) => `<button type="button" class="pw ${P.penW === w ? 'on' : ''}" data-v="w${w}" data-keep="1" title="${n}"><i style="height:${Math.min(w, 12)}px"></i></button>`).join('')}</div>
    <button type="button" class="ctx-item prec ${store.get('panoRecog', false) ? 'on' : ''}" data-v="r" data-keep="1">${IC.shapes}<span>Şekil tanıma</span><i class="sw-mini"></i></button>`, (v, el) => {
    if (v === 'r') { const on = !store.get('panoRecog', false); store.set('panoRecog', on); el.classList.toggle('on', on); toast(on ? 'Kalemle çizdiğin kare, daire, üçgen ve çizgiler düzgün şekle dönüşecek' : 'Şekil tanıma kapandı'); return; }
    if (v[0] === 'c') P.penColor = v.slice(1); else P.penW = +v.slice(1);
    el.parentElement.querySelectorAll('.on').forEach(x => x.classList.remove('on')); el.classList.add('on');
  }, 'pside');
}

/* ═════════ İşaretçi (fare, kalem, dokunmatik) ═════════ */
const PT = new Map();          // aktif dokunuşlar (iki parmakla yakınlaştırma için)
let spaceDown = false;
function pBindStage() {
  const svg = $('#pSvg'), st = $('#pStage');
  st.dataset.tool = P.tool;
  svg.addEventListener('pointerdown', pDown);
  svg.addEventListener('pointermove', pMove);
  svg.addEventListener('pointerup', pUp);
  svg.addEventListener('pointercancel', pUp);
  svg.addEventListener('dblclick', pDbl);
  svg.addEventListener('wheel', e => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) pZoomAt(P.V.z * Math.exp(-e.deltaY * (e.deltaMode ? 0.05 : 0.0025) * (e.ctrlKey && !e.metaKey && Math.abs(e.deltaY) < 50 ? 4 : 1)), e.clientX, e.clientY);
    else { P.V.x -= e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX; P.V.y -= e.shiftKey && !e.deltaX ? 0 : e.deltaY; pApplyView(); }
  }, { passive: false });
  svg.addEventListener('contextmenu', e => e.preventDefault());
  st.addEventListener('dragover', e => { if ([...(e.dataTransfer?.items || [])].some(i => i.kind === 'file')) e.preventDefault(); });
  st.addEventListener('drop', e => { const f = [...(e.dataTransfer?.files || [])].filter(f => f.type.startsWith('image/')); if (!f.length) return; e.preventDefault(); const p = toWorld(e.clientX, e.clientY); pAddImages(f, p); });
}
const targetItem = e => { const g = e.target.closest?.('#pWorld [data-id]'); return g ? byId(g.dataset.id) : null; };
// Bir çerçeve sürüklenince içindeki öğeler de gelsin
const inside = (b, f) => b.x >= f.x && b.y >= f.y && b.x + b.w <= f.x + f.w && b.y + b.h <= f.y + f.h;
function pDown(e) {
  if (P.editing) pEditEnd();
  document.querySelector('.ppop')?.remove();
  $('#pSvg').setPointerCapture(e.pointerId);
  PT.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (PT.size === 2) {             // iki parmak: yakınlaştır/kaydır
    if (P.drag?.mode === 'pen' || P.drag?.mode === 'create' || P.drag?.mode === 'line') { P.draft = null; pRender(); }
    else if (P.drag?.mode === 'move' && P.drag.snapped) { pUndoSilent(); }
    const [a, b] = [...PT.values()];
    P.drag = { mode: 'pinch', d0: Math.hypot(a.x - b.x, a.y - b.y), z0: P.V.z, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2, vx: P.V.x, vy: P.V.y };
    P.marq = null; pRenderOverlay();
    return;
  }
  if (PT.size > 2) return;
  const w = toWorld(e.clientX, e.clientY);
  const h = e.target.closest?.('[data-h]')?.dataset.h;
  const it = targetItem(e);
  const td = e.target.closest?.('[data-todo]');
  if (td && P.tool === 'select' && !spaceDown) { const [tid, ri] = td.dataset.todo.split('|'), o = byId(tid); if (o && !o.locked && o.rows[+ri]) { PT.delete(e.pointerId); pSnap(); o.rows[+ri].d = !o.rows[+ri].d; pChanged(); pRender(); return; } }
  const cm = e.target.closest?.('[data-cm]');
  if (cm && P.tool === 'select') { PT.delete(e.pointerId); return pComments(byId(cm.dataset.cm)); }
  if (P.voting && it && P.tool === 'select' && it.t !== 'line' && it.t !== 'frame') {
    pSnap(); it.votes = Math.max(0, (it.votes || 0) + (e.shiftKey || e.button === 2 ? -1 : 1)); if (!it.votes) delete it.votes;
    pChanged(); pRender(); pVoteBanner(); return;
  }
  if (P.tool === 'stamp' && !(spaceDown || e.button === 1)) {
    const sz = 64 / Math.max(0.5, Math.min(2, P.V.z));
    const st = { id: uid(), t: 'emoji', ch: P.stamp || '👍', x: r1(w.x - sz / 2), y: r1(w.y - sz / 2), w: r1(sz), h: r1(sz) };
    pSnap(); P.data.items.push(st); pChanged(); pRender(); return;
  }
  const touch = e.pointerType === 'touch';
  const tool = (spaceDown || e.button === 1) ? 'hand' : P.tool;
  if (e.button === 2) return;
  if (tool === 'hand') { P.drag = { mode: 'pan', sx: e.clientX, sy: e.clientY, vx: P.V.x, vy: P.V.y }; $('#pStage').classList.add('panning'); return; }
  if (tool === 'select') {
    if (h === 'link') { const src = byId([...P.sel][0]); return pLineStart(w, src); }
    if (h === 'a' || h === 'b') { pSnap(); P.drag = { mode: 'end', id: [...P.sel][0], which: h, snapped: true }; return; }
    if (h && byId([...P.sel][0])?.locked) return;
    if (h) { const o = byId([...P.sel][0]); pSnap(); P.drag = { mode: 'resize', id: o.id, h, start: w, orig: JSON.parse(JSON.stringify(o)), box: bboxOf(o), snapped: true }; return; }
    if (it) {
      if (e.shiftKey) { const kume = grpOf(new Set([it.id])); if (P.sel.has(it.id)) kume.forEach(k => P.sel.delete(k)); else kume.forEach(k => P.sel.add(k)); pRenderOverlay(); if (!P.sel.has(it.id)) return; }
      else if (!P.sel.has(it.id)) { P.sel = grpOf(new Set([it.id])); }
      // Taşınacaklar: seçilenler + seçili çerçevelerin içindekiler (kilitliler yerinde kalır)
      const ids = new Set([...P.sel].filter(k => !byId(k)?.locked));
      if (!ids.size) { pRenderOverlay(); return; }
      for (const f of items().filter(i => P.sel.has(i.id) && i.t === 'frame')) for (const o of items()) if (o.t !== 'frame' && o.t !== 'line' && inside(bboxOf(o), f)) ids.add(o.id);
      P.drag = { mode: 'move', start: w, ids, orig: new Map(items().filter(i => ids.has(i.id)).map(i => [i.id, JSON.parse(JSON.stringify(i))])), moved: false, alt: e.altKey };
      pRenderOverlay();
      return;
    }
    // boş alan: dokunmatikte kaydır, farede seçim kutusu
    if (touch) { P.drag = { mode: 'pan', sx: e.clientX, sy: e.clientY, vx: P.V.x, vy: P.V.y, tap: true, w }; return; }
    if (!e.shiftKey) P.sel.clear();
    P.marq = { x0: w.x, y0: w.y, x1: w.x, y1: w.y, add: new Set(P.sel) };
    P.drag = { mode: 'marq' };
    pRenderOverlay();
    return;
  }
  if (tool === 'pen') { P.draft = { id: uid(), t: 'pen', pts: [r1(w.x), r1(w.y)], color: P.penColor, width: P.penW, hl: P.penW >= 16 }; P.drag = { mode: 'pen' }; pRender(); return; }
  if (tool === 'eraser') { P.drag = { mode: 'erase', snapped: false }; pEraseAt(e); return; }
  if (tool === 'line') return pLineStart(w, it && it.t !== 'line' ? it : null);
  if (tool === 'note' || tool === 'text') {
    P.drag = { mode: 'place', w, tool };
    return;
  }
  if (tool === 'shape' || tool === 'frame') {
    P.draft = tool === 'shape' ? { id: uid(), t: 'shape', kind: P.shape, x: w.x, y: w.y, w: 1, h: 1, fill: store.get('panoShapeFill', '#d6e4ff'), stroke: EDGE[store.get('panoShapeFill', '#d6e4ff')] || '#4262ff', sw: 1.5, text: '' }
      : P.frameKind === 'section' ? { id: uid(), t: 'frame', kind: 'section', x: w.x, y: w.y, w: 1, h: 1, title: 'Bölüm ' + (items().filter(i => i.kind === 'section').length + 1), fill: '#eef4ff', accent: '#2f7de1' }
      : { id: uid(), t: 'frame', x: w.x, y: w.y, w: 1, h: 1, title: 'Çerçeve ' + (items().filter(i => i.t === 'frame').length + 1), fill: '#ffffff' };
    P.drag = { mode: 'create', start: w, moved: false };
    return;
  }
}
const r1 = v => Math.round(v * 10) / 10;
function pLineStart(w, from) {
  const a = from ? { id: from.id } : { x: w.x, y: w.y };
  P.draft = { id: uid(), t: 'line', a, b: { x: w.x, y: w.y }, color: '#4b5563', width: 2, endB: 'arrow', endA: 'none', route: store.get('panoRoute', 'straight') };
  P.drag = { mode: 'line', from: from?.id || null };
  pRender();
}
function pMove(e) {
  if (PT.has(e.pointerId)) PT.set(e.pointerId, { x: e.clientX, y: e.clientY });
  const d = P.drag;
  if (!d) {                                         // fare üstündeyken: bağlanacak öğeyi göster (ok aracında)
    if (P.tool === 'line' && e.pointerType === 'mouse') { const it = targetItem(e); const hv = it && it.t !== 'line' ? it : null; if (hv !== P.hover) { P.hover = hv; pRenderOverlay(); } }
    return;
  }
  if (d.mode === 'pinch') {
    if (PT.size < 2) return;
    const [a, b] = [...PT.values()];
    const dist = Math.hypot(a.x - b.x, a.y - b.y), cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
    const r = stageRect(), z = Math.min(4, Math.max(0.1, d.z0 * dist / d.d0));
    const px = d.cx - r.left, py = d.cy - r.top;
    P.V.z = z; P.V.x = px - (px - d.vx) * (z / d.z0) + (cx - d.cx); P.V.y = py - (py - d.vy) * (z / d.z0) + (cy - d.cy);
    pApplyView(); pRenderOverlay();
    return;
  }
  const w = toWorld(e.clientX, e.clientY);
  if (d.mode === 'pan') { if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 6) d.tap = false; P.V.x = d.vx + e.clientX - d.sx; P.V.y = d.vy + e.clientY - d.sy; pApplyView(); return; }
  if (d.mode === 'marq') { P.marq.x1 = w.x; P.marq.y1 = w.y; const q = P.marq, box = { x: Math.min(q.x0, q.x1), y: Math.min(q.y0, q.y1), w: Math.abs(q.x1 - q.x0), h: Math.abs(q.y1 - q.y0) };
    P.sel = new Set(q.add); for (const it of items()) { const b = bboxOf(it); if (b.x < box.x + box.w && b.x + b.w > box.x && b.y < box.y + box.h && b.y + b.h > box.y && !(it.t === 'frame' && !inside(b, box))) P.sel.add(it.id); }
    pRenderOverlay(); return; }
  if (d.mode === 'move') {
    let dx = w.x - d.start.x, dy = w.y - d.start.y;
    if (!d.moved && Math.hypot(dx * P.V.z, dy * P.V.z) < 3) return;
    if (!d.moved) { pSnap(); d.snapped = true; d.moved = true;
      if (d.alt) {                                  // Alt ile sürükle: kopyasını taşı
        const map = new Map(); const copies = [...d.orig.values()].map(o => { const c = JSON.parse(JSON.stringify(o)); c.id = uid(); map.set(o.id, c.id); return c; });
        for (const c of copies) if (c.t === 'line') { if (c.a.id && map.has(c.a.id)) c.a.id = map.get(c.a.id); if (c.b.id && map.has(c.b.id)) c.b.id = map.get(c.b.id); }
        P.data.items.push(...copies); d.orig = new Map(copies.map(c => [c.id, JSON.parse(JSON.stringify(c))])); d.ids = new Set(copies.map(c => c.id)); P.sel = new Set(copies.filter(c => P.sel.has([...map].find(([, v]) => v === c.id)?.[0])).map(c => c.id));
      }
    }
    if (e.shiftKey) { if (Math.abs(dx) > Math.abs(dy)) dy = 0; else dx = 0; }
    if (!(e.ctrlKey || e.metaKey)) [dx, dy] = pSnapMove(d, dx, dy); else P.guides = null;
    for (const [id, o] of d.orig) {
      const it = byId(id); if (!it) continue;
      if (it.t === 'pen') it.pts = o.pts.map((v, i) => r1(v + (i % 2 ? dy : dx)));
      else if (it.t === 'line') { if (!it.a.id) it.a = { x: o.a.x + dx, y: o.a.y + dy }; if (!it.b.id) it.b = { x: o.b.x + dx, y: o.b.y + dy }; }
      else { it.x = r1(o.x + dx); it.y = r1(o.y + dy); }
    }
    pRender(); return;
  }
  if (d.mode === 'resize') pResize(d, w, e.shiftKey);
  if (d.mode === 'end') {
    const it = byId(d.id); const tgt = pHitItem(e, it.id);
    P.hover = tgt; it[d.which] = tgt ? { id: tgt.id } : { x: w.x, y: w.y };
    pRender(); return;
  }
  if (d.mode === 'line') {
    const tgt = pHitItem(e, null, d.from);
    P.hover = tgt; P.draft.b = tgt ? { id: tgt.id } : { x: w.x, y: w.y };
    pRender(); return;
  }
  if (d.mode === 'pen') {
    const p = P.draft.pts, lx = p[p.length - 2], ly = p[p.length - 1];
    if (Math.hypot(w.x - lx, w.y - ly) * P.V.z < 2.5) return;
    p.push(r1(w.x), r1(w.y));
    const g = $('#pWorld').lastElementChild; if (g) g.outerHTML = itemSvg(P.draft); else pRender();
    return;
  }
  if (d.mode === 'erase') return pEraseAt(e);
  if (d.mode === 'create') {
    d.moved = true;
    const x1 = Math.min(d.start.x, w.x), y1 = Math.min(d.start.y, w.y);
    let ww = Math.abs(w.x - d.start.x), hh = Math.abs(w.y - d.start.y);
    if (e.shiftKey) ww = hh = Math.max(ww, hh);
    Object.assign(P.draft, { x: r1(x1), y: r1(y1), w: r1(ww), h: r1(hh) });
    pRender();
  }
}
// İşaretçinin altındaki öğe (bağlantı için); sürüklenen ok hariç
function pHitItem(e, exceptId, fromId) {
  const els = document.elementsFromPoint(e.clientX, e.clientY);
  for (const el of els) { const g = el.closest?.('#pWorld [data-id]'); if (!g) continue; const it = byId(g.dataset.id); if (it && it.id !== exceptId && it.id !== P.draft?.id && it.t !== 'line' && it.t !== 'pen') return it.id === fromId && P.drag?.mode === 'line' ? null : it; }
  return null;
}
function pResize(d, w, keep) {
  const it = byId(d.id), o = d.orig, b = d.box;
  let x1 = b.x, y1 = b.y, x2 = b.x + b.w, y2 = b.y + b.h;
  if (d.h.includes('w')) x1 = w.x; if (d.h.includes('e')) x2 = w.x; if (d.h.includes('n')) y1 = w.y; if (d.h.includes('s')) y2 = w.y;
  let nw = Math.max(20, x2 - x1), nh = Math.max(20, y2 - y1);
  if (d.h === 'e') { it.w = Math.max(40, r1(w.x - it.x)); pRender(); return; }
  if (it.t === 'table') { const k = Math.max(0.3, nw / b.w); it.cols = o.cols.map(c => Math.max(50, r1(c * k))); if (d.h.includes('w')) it.x = r1(b.x + b.w - it.cols.reduce((a, c) => a + c, 0)); pRender(); return; }
  if (keep || it.t === 'image' || it.t === 'pen' || it.t === 'emoji' || it.t === 'icon') { const k = Math.max(nw / b.w, nh / b.h); nw = b.w * k; nh = b.h * k; }
  const nx = d.h.includes('w') ? b.x + b.w - nw : b.x, ny = d.h.includes('n') ? b.y + b.h - nh : b.y;
  if (it.t === 'pen') { const kx = nw / b.w, ky = nh / b.h; it.pts = o.pts.map((v, i) => r1(i % 2 ? ny + (v - b.y) * ky : nx + (v - b.x) * kx)); it.width = Math.max(1, o.width * Math.sqrt(kx * ky)); }
  else Object.assign(it, { x: r1(nx), y: r1(ny), w: r1(nw), h: r1(nh) });
  pRender();
}
function pEraseAt(e) {
  for (const el of document.elementsFromPoint(e.clientX, e.clientY)) {
    const g = el.closest?.('#pWorld [data-id]'); if (!g) continue;
    const it = byId(g.dataset.id); if (!it || (it.t !== 'pen' && !e.shiftKey)) continue;
    if (!P.drag.snapped) { pSnap(); P.drag.snapped = true; }
    pRemove([it.id], true); pRender(); return;
  }
}
function pUp(e) {
  PT.delete(e.pointerId);
  const d = P.drag;
  if (!d) return;
  if (d.mode === 'pinch') { if (PT.size < 2) P.drag = PT.size === 1 ? null : null; return; }
  P.drag = null; P.hover = null;
  $('#pStage')?.classList.remove('panning');
  const w = toWorld(e.clientX, e.clientY);
  if (d.mode === 'pan' && d.tap && P.tool === 'select') { P.sel.clear(); pRenderOverlay(); }
  if (d.mode === 'marq') { P.marq = null; P.sel = grpOf(P.sel); pRenderOverlay(); }
  if (d.mode === 'move') { P.guides = null; if (d.moved) pChanged(); pRenderOverlay(); }
  if (d.mode === 'resize' || d.mode === 'end' || d.mode === 'erase') { if (d.snapped) pChanged(); pRender(); }
  if (d.mode === 'pen') {
    let it = P.draft; P.draft = null;
    if (it) {
      const rec = store.get('panoRecog', false) ? pRecognize(it) : null;
      pSnap(); P.data.items.push(rec || it); pChanged();
      if (rec) toast('Şekle dönüştü', [['Geri al', () => { pUndo(); P.data.items.push(it); pRender(); }]]);
    }
    pRender();
  }
  if (d.mode === 'line') {
    const it = P.draft; P.draft = null;
    const pa = endPoint(it.a), pb = endPoint(it.b);
    if (it.b.id || Math.hypot(pa.x - pb.x, pa.y - pb.y) * P.V.z > 12) { pSnap(); P.data.items.push(it); P.sel = new Set([it.id]); pChanged(); if (P.tool === 'line' && e.pointerType !== 'mouse') pSetTool('select'); P.sel = new Set([it.id]); }
    pRender();
  }
  if (d.mode === 'place') {
    const it = d.tool === 'note' ? { id: uid(), t: 'note', x: r1(w.x - 100), y: r1(w.y - 100), w: 200, h: 200, color: store.get('panoNoteColor', 'sari'), text: '' }
      : { id: uid(), t: 'text', x: r1(w.x), y: r1(w.y - 14), w: 260, fs: 24, text: '', color: '#1b1d21' };
    pSnap(); P.data.items.push(it); pSetTool('select'); P.sel = new Set([it.id]); pRender(); pEditStart(it, true);
  }
  if (d.mode === 'create') {
    const it = P.draft; P.draft = null;
    if (!d.moved || it.w < 8 || it.h < 8) { const sz = it.t === 'frame' ? [640, 420] : [180, 120]; Object.assign(it, { x: r1(d.start.x - sz[0] / 2), y: r1(d.start.y - sz[1] / 2), w: sz[0], h: sz[1] }); }
    pSnap(); P.data.items.push(it); pSetTool('select'); P.sel = new Set([it.id]); pChanged(); pRender();
  }
}
function pUndoSilent() { if (!P.hist.length) return; P.data.items = JSON.parse(P.hist.pop()); pRender(); }
function pDbl(e) {
  if (P.tool !== 'select') return;
  // İşaretçi yakalandığı için hedef tuval olabilir; tıklanan noktadaki öğeyi bul
  let it = null;
  for (const el of document.elementsFromPoint(e.clientX, e.clientY)) { const g = el.closest?.('#pWorld [data-id]'); if (g) { it = byId(g.dataset.id); break; } }
  if (it) {
    if (it.t === 'frame') return pFrameRename(it);
    if (it.locked) return toast('Kilitli: düzenlemek için önce kilidini aç');
    if (it.t === 'todo') return pTodoEdit(it);
    if (/^(note|text|shape|line|link)$/.test(it.t)) { pSnap(); return pEditStart(it, false); }
    if (it.t === 'table') { const w0 = toWorld(e.clientX, e.clientY), L = tableLayout(it); const c = Math.max(0, L.colX.findIndex(x => x > w0.x - it.x) - 1), r = Math.max(0, L.rowY.findIndex(y => y > w0.y - it.y) - 1); pSnap(); return pEditStart(it, false, [Math.min(r, it.cells.length - 1), Math.min(c, it.cols.length - 1)]); }
    if (it.t === 'mail' && it.threadId) return window.open('https://mail.google.com/mail/u/0/#all/' + encodeURIComponent(it.threadId), '_blank', 'noopener');
    return;
  }
  const w = toWorld(e.clientX, e.clientY);       // boş yere çift tık: yeni not
  const n = { id: uid(), t: 'note', x: r1(w.x - 100), y: r1(w.y - 100), w: 200, h: 200, color: store.get('panoNoteColor', 'sari'), text: '' };
  pSnap(); P.data.items.push(n); P.sel = new Set([n.id]); pRender(); pEditStart(n, true);
}
async function pFrameRename(f) {
  const t = await pAsk('Çerçevenin adı', 'Adı', f.title || ''); if (t == null) return;
  pSnap(); f.title = t; pChanged(); pRender();
}

/* ═════════ Yazı düzenleme (notun/şeklin üstünde açılan kutu) ═════════ */
function pEditStart(it, isNew, cell) {
  const ed = $('#pEdit'); if (!ed) return;
  const getT = () => cell ? (it.cells[cell[0]][cell[1]] || '') : it.t === 'link' ? (it.title || '') : (it.text || '');
  const setT = v => { const o = byId(it.id); if (!o) return; if (cell) o.cells[cell[0]][cell[1]] = v; else if (o.t === 'link') o.title = v; else o.text = v; };
  P.editing = { id: it.id, orig: getT(), isNew, cell, getT, setT };
  ed.hidden = false;
  ed.className = 'pb-edit pe-' + it.t;
  try { ed.contentEditable = 'plaintext-only'; } catch { ed.contentEditable = 'true'; }
  if (ed.contentEditable !== 'plaintext-only') ed.contentEditable = 'true';
  ed.textContent = getT();
  ed.oninput = () => { const o = byId(it.id); if (!o) return; setT(ed.innerText.replace(/\n$/, '')); if (o.t === 'table') pRender(); pPlaceEditor(); if (o.t === 'text' || o.t === 'line' || o.t === 'table') pRenderOverlay(); };
  ed.onkeydown = e => {
    if (e.key === 'Escape' || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) { e.preventDefault(); pEditEnd(); }
    if (e.key === 'Tab' && cell) { e.preventDefault(); pEditEnd(); pTableNext(it, cell, e.shiftKey ? -1 : 1); }
    else if (e.key === 'Tab' && pIsMind(it)) { e.preventDefault(); pEditEnd(); pMindChild(it); }
    else if (e.key === 'Enter' && !e.shiftKey && pIsMind(it) && pMindParent(it)) { e.preventDefault(); pEditEnd(); pMindSibling(it); }
    else if (e.key === 'Tab' && it.t === 'note') { e.preventDefault(); pEditEnd(); pNextNote(it, e.shiftKey ? 'y' : 'x'); }
    e.stopPropagation();
  };
  ed.onblur = () => setTimeout(() => { if (P.editing?.id === it.id && document.activeElement !== ed) pEditEnd(); }, 0);
  pRender(); pPlaceEditor();
  ed.focus();
  const r = document.createRange(); r.selectNodeContents(ed); if (!isNew) r.collapse(false); const s = getSelection(); s.removeAllRanges(); s.addRange(r);
}
function pPlaceEditor() {
  const ed = $('#pEdit'), E = P.editing; if (!ed || !E) return;
  const it = byId(E.id); if (!it) return;
  const z = P.V.z;
  const st = $('#pStage').getBoundingClientRect(), sv = stageRect();
  const ox = sv.left - st.left, oy = sv.top - st.top;
  let x, y, w, h, fs, align = 'center', valign = 'center';
  if (it.t === 'note') { const f = fitFont({ ...it, text: it.text || ' ' }); fs = f.fs; x = it.x + 16; y = it.y + 16; w = it.w - 32; h = it.h - 32; align = it.align === 'left' ? 'left' : 'center'; }
  else if (it.t === 'shape') { fs = it.fs || 18; const tw = it.kind === 'diamond' || it.kind === 'tri' ? it.w * 0.6 : it.w - 24; x = it.x + (it.w - tw) / 2; w = tw; y = it.y + 8; h = it.h - 16; }
  else if (it.t === 'text') { fs = it.fs; x = it.x; y = it.y; w = it.w; h = textHeight({ ...it, text: it.text || ' ' }); align = it.align === 'center' ? 'center' : 'left'; valign = 'top'; }
  else if (it.t === 'line') { const m = lineGeom(it).mid; fs = 15; w = 180; x = m.x - 90; h = 60; y = m.y - 30; }
  else if (it.t === 'table' && E.cell) { const L = tableLayout(it), [r, c] = E.cell; fs = L.fs; x = it.x + L.colX[c] + 10; y = it.y + L.rowY[r] + 9; w = it.cols[c] - 20; h = L.rowH[r] - 18; align = 'left'; valign = 'top'; }
  else if (it.t === 'link') { fs = 15; x = it.x + 44; y = it.y + 14; w = it.w - 58; h = 40; align = 'left'; valign = 'top'; }
  Object.assign(ed.style, { left: ox + x * z + P.V.x + 'px', top: oy + y * z + P.V.y + 'px', width: w * z + 'px', height: h * z + 'px', fontSize: fs * z + 'px',
    textAlign: align, justifyContent: valign === 'top' ? 'flex-start' : 'center', fontWeight: it.bold ? 650 : 450, color: it.t === 'text' ? (it.color || '#1b1d21') : it.t === 'shape' ? (it.tc || '#1b1d21') : '#1b1d21' });
}
function pEditEnd() {
  const E = P.editing; if (!E) return;
  P.editing = null;
  const ed = $('#pEdit'); if (ed) { ed.hidden = true; ed.oninput = ed.onkeydown = ed.onblur = null; }
  const it = byId(E.id);
  if (it) {
    const v = (E.getT ? (E.setT(E.getT().replace(/\s+$/, '')), E.getT()) : (it.text || ''));
    if (!v && it.t === 'text') { pRemove([it.id], true); }
    if (v === E.orig && !E.isNew) { if (P.hist.length) P.hist.pop(); pHistBtns(); }
    else pChanged();
  }
  pRender();
}
// Tab: yanına yeni not (Miro gibi hızlı not dizme)
function pNextNote(it, dir) {
  const n = { ...JSON.parse(JSON.stringify(it)), id: uid(), text: '', x: dir === 'x' ? it.x + it.w + 24 : it.x, y: dir === 'y' ? it.y + it.h + 24 : it.y };
  pSnap(); P.data.items.push(n); P.sel = new Set([n.id]); pRender(); pEditStart(n, true);
}

/* ═════════ Seçim işlemleri ═════════ */
function pRemove(ids, silent) {
  const kilit = ids.filter(id => byId(id)?.locked); if (kilit.length) { ids = ids.filter(id => !byId(id)?.locked); if (!silent) toast(kilit.length === 1 ? 'Kilitli öğe silinmez; önce kilidini aç' : 'Kilitli öğeler silinmedi'); if (!ids.length) return; }
  const set = new Set(ids);
  if (!silent) pSnap();
  P.data.items = items().filter(i => !set.has(i.id) && !(i.t === 'line' && ((i.a.id && set.has(i.a.id)) || (i.b.id && set.has(i.b.id)))));
  for (const id of set) P.sel.delete(id);
  if (!silent) { pChanged(); pRender(); }
}
function pCopyItems(ids) {
  const set = new Set(ids);
  const list = items().filter(i => set.has(i.id));
  return JSON.parse(JSON.stringify(list));
}
function pPaste(list, at) {
  if (!list?.length) return;
  const map = new Map(), gmap = new Map(); const copies = list.map(o => { const c = JSON.parse(JSON.stringify(o)); c.id = uid(); map.set(o.id, c.id); if (c.grp) { if (!gmap.has(c.grp)) gmap.set(c.grp, 'g' + uid()); c.grp = gmap.get(c.grp); } delete c.locked; return c; });
  const b = unionBox(copies.map(c => { if (c.t !== 'line') return bboxOf(c); const p = c.a.id ? endPoint(c.a) : c.a, q = c.b.id ? endPoint(c.b) : c.b; return { x: Math.min(p.x, q.x), y: Math.min(p.y, q.y), w: Math.abs(p.x - q.x) || 1, h: Math.abs(p.y - q.y) || 1 }; }));
  const dx = at ? at.x - (b.x + b.w / 2) : 24, dy = at ? at.y - (b.y + b.h / 2) : 24;
  for (const c of copies) {
    if (c.t === 'pen') c.pts = c.pts.map((v, i) => r1(v + (i % 2 ? dy : dx)));
    else if (c.t === 'line') { for (const k of ['a', 'b']) { if (c[k].id) { if (map.has(c[k].id)) c[k].id = map.get(c[k].id); else { const p = endPoint(c[k]); c[k] = { x: p.x + dx, y: p.y + dy }; } } else c[k] = { x: c[k].x + dx, y: c[k].y + dy }; } }
    else { c.x = r1(c.x + dx); c.y = r1(c.y + dy); }
  }
  pSnap(); P.data.items.push(...copies); P.sel = new Set(copies.map(c => c.id)); pChanged(); pRender();
}
function pZ(dir) {
  const set = P.sel; if (!set.size) return;
  pSnap();
  const sel = items().filter(i => set.has(i.id)), rest = items().filter(i => !set.has(i.id));
  P.data.items = dir > 0 ? [...rest, ...sel] : [...sel, ...rest];
  pChanged(); pRender();
}
function pSetProp(fn) { const sel = items().filter(i => P.sel.has(i.id)); if (!sel.length) return; pSnap(); sel.forEach(fn); pChanged(); pRender(); }

/* ═════════ Bağlam çubuğu (seçimin üstünde) ═════════ */
function pCtxBar() {
  const bar = $('#pCtx'); if (!bar) return;
  const sel = items().filter(i => P.sel.has(i.id));
  if (!sel.length || P.drag || P.editing || P.tool !== 'select') { bar.hidden = true; return; }
  const types = new Set(sel.map(i => i.t));
  const one = t => types.size === 1 && types.has(t);
  const b = unionBox(sel.map(bboxOf));
  let h = '';
  const sw = (list, cur, key) => `<span class="pc-sw">${list.map(([v, c]) => `<button type="button" class="psw ${cur === v ? 'on' : ''} ${c === 'none' ? 'none' : ''}" data-pc="${key}" data-v="${esc(v)}" style="--c:${c === 'none' ? 'transparent' : c}" title="${esc(v)}"></button>`).join('')}</span>`;
  const first = sel[0];
  if (one('note')) h += `<button type="button" class="pc-btn" data-pc="pal" data-k="note" title="Renk"><i class="pc-dot" style="--c:${noteFill(first.color)}"></i></button>`;
  if (one('shape')) h += `<button type="button" class="pc-btn" data-pc="pal" data-k="fill" title="Dolgu"><i class="pc-dot" style="--c:${first.fill === 'none' ? 'transparent' : first.fill || '#fff'}"></i></button><button type="button" class="pc-btn" data-pc="pal" data-k="stroke" title="Kenar rengi"><i class="pc-ring" style="--c:${first.stroke || '#1b1d21'}"></i></button><button type="button" class="pc-btn" data-pc="kind" title="Şekli değiştir">${IC.shapes}</button>`;
  if (one('text') || one('line') || one('pen')) h += `<button type="button" class="pc-btn" data-pc="pal" data-k="ink" title="Renk"><i class="pc-dot" style="--c:${first.color || '#1b1d21'}"></i></button>`;
  if (one('frame')) h += `${first.kind === 'section' ? `<button type="button" class="pc-btn" data-pc="pal" data-k="accent" title="Başlık rengi"><i class="pc-dot" style="--c:${first.accent || '#2f7de1'}"></i></button>` : ''}<button type="button" class="pc-btn" data-pc="pal" data-k="frame" title="Arka plan"><i class="pc-dot" style="--c:${first.fill || '#fff'}"></i></button><button type="button" class="pc-btn txt" data-pc="ftitle" title="Adını değiştir">Ad</button>`;
  if ([...types].every(t => /^(note|text|shape)$/.test(t))) h += `<button type="button" class="pc-btn txt" data-pc="size" title="Yazı boyutu">Aa</button><button type="button" class="pc-btn txt ${sel.every(i => i.bold) ? 'on' : ''}" data-pc="bold" title="Kalın"><b>B</b></button>`;
  if ([...types].every(t => t === 'note' || t === 'text')) h += `<button type="button" class="pc-btn txt" data-pc="align" title="Hizala">${first.t === 'note' ? (first.align === 'left' ? '⇤' : '≡') : (first.align === 'center' ? '≡' : '⇤')}</button>`;
  if (one('line')) h += `<button type="button" class="pc-btn txt ${first.dash ? 'on' : ''}" data-pc="dash" title="Kesikli">┄</button><button type="button" class="pc-btn txt" data-pc="ends" title="Ok uçları">${first.endA === 'arrow' ? '⟷' : first.endB === 'none' ? '—' : '⟶'}</button><button type="button" class="pc-btn txt" data-pc="lw" title="Kalınlık">${first.width >= 4 ? '▬' : first.width <= 1.5 ? '─' : '━'}</button><button type="button" class="pc-btn txt" data-pc="label" title="Yazı ekle">T</button>`;
  if (one('pen')) h += `<button type="button" class="pc-btn txt" data-pc="pw" title="Kalınlık">${first.width >= 8 ? '▬' : '━'}</button>${sel.length === 1 ? `<button type="button" class="pc-btn" data-pc="recog" title="Düzgün şekle çevir">${IC.shapes}</button>` : ''}`;
  if (one('line')) h += `<button type="button" class="pc-btn" data-pc="route" title="Yol: düz, kıvrımlı, köşeli">${{ straight: '<b>／</b>', curve: '<b>∿</b>', elbow: '<b>⌐</b>' }[first.route || 'straight']}</button>`;
  if (one('icon') || one('emoji')) h += one('icon') ? `<button type="button" class="pc-btn" data-pc="pal" data-k="ink" title="Renk"><i class="pc-dot" style="--c:${first.color || '#1b1d21'}"></i></button>` : '';
  if (one('table') && sel.length === 1) h += `<button type="button" class="pc-btn txt" data-pc="trow" title="Satır ekle">+ Satır</button><button type="button" class="pc-btn txt" data-pc="tcol" title="Sütun ekle">+ Sütun</button><button type="button" class="pc-btn txt" data-pc="tdel" title="Son satırı ya da sütunu sil">−</button><button type="button" class="pc-btn txt ${first.header ? 'on' : ''}" data-pc="thead" title="Başlık satırı">Başlık</button>`;
  if (sel.length === 1 && (first.t === 'link' || first.t === 'mail' || first.ref)) h += `<button type="button" class="pc-btn" data-pc="open" title="${first.t === 'link' ? 'Bağlantıyı aç' : first.t === 'mail' ? "Gmail'de aç" : "Notlar'da aç"}">${IC.open}</button>`;
  if (sel.length > 1 && sel.filter(i => i.t !== 'line').length > 1) h += `<button type="button" class="pc-btn" data-pc="arrange" title="Hizala ve dağıt">${IC.align}</button>`;
  if (!YEREL && sel.some(i => i.t === 'note')) h += `<button type="button" class="pc-btn" data-pc="tocal" title="Takvim'e ekle">${IC.cal}</button>`;
  if (!YEREL && sel.some(i => /^(note|text|shape)$/.test(i.t) && (i.text || '').trim())) h += `<button type="button" class="pc-btn" data-pc="tonote" title="Notlar'a gönder">${IC.noteI}</button>`;
  if (sel.length === 1 && first.t !== 'line') h += `<button type="button" class="pc-btn ${first.comments?.length ? 'on' : ''}" data-pc="cmt" title="Yorumlar">${IC.comment}</button>`;
  if (one('todo')) h += `<button type="button" class="pc-btn txt" data-pc="todoedit" title="Maddeleri düzenle">Düzenle</button><button type="button" class="pc-btn" data-pc="pal" data-k="accent" title="Renk"><i class="pc-dot" style="--c:${first.accent || '#2f9e47'}"></i></button>`;
  const gruplu = sel.some(i => i.grp);
  if (sel.length > 1 || gruplu) h += `<button type="button" class="pc-btn txt ${gruplu ? 'on' : ''}" data-pc="grup" title="${gruplu ? 'Grubu çöz (Ctrl+Shift+G)' : 'Grupla (Ctrl+G)'}">${gruplu ? 'Grubu çöz' : 'Grupla'}</button>`;
  h += `<button type="button" class="pc-btn ${sel.every(i => i.locked) ? 'on' : ''}" data-pc="kilit" title="${sel.every(i => i.locked) ? 'Kilidi aç' : 'Kilitle'}">${IC.lock}</button>`;
  if (h) h += '<span class="pc-sep"></span>';
  h += `<button type="button" class="pc-btn" data-pc="front" title="Öne getir">${IC.front}</button><button type="button" class="pc-btn" data-pc="back" title="Arkaya gönder">${IC.back2}</button>
    <button type="button" class="pc-btn" data-pc="dup" title="Çoğalt (Ctrl+D)">${IC.copy}</button><button type="button" class="pc-btn danger" data-pc="del" title="Sil (Delete)">${IC.trash}</button>`;
  bar.innerHTML = h; bar.hidden = false;
  // konum: seçimin üstü, sığmazsa altı
  const st = $('#pStage').getBoundingClientRect(), sv = stageRect();
  const sx = sv.left - st.left + b.x * P.V.z + P.V.x, sy = sv.top - st.top + b.y * P.V.z + P.V.y, sw2 = b.w * P.V.z, sh = b.h * P.V.z;
  const bw = bar.offsetWidth, bh = bar.offsetHeight;
  let x = sx + sw2 / 2 - bw / 2, y = sy - bh - 14;
  const topMin = matchMedia('(max-width: 700px)').matches ? 64 : 66;    // üstteki panellerin altında kalsın
  if (y < topMin) y = sy + sh + 14;
  if (y + bh > st.height - 8) y = Math.max(8, Math.min(st.height - bh - 8, sy + 8));
  const leftMin = matchMedia('(max-width: 700px)').matches ? 8 : 74;     // soldaki araç çubuğunun üstüne binmesin
  bar.style.left = Math.max(leftMin, Math.min(st.width - bw - 8, x)) + 'px';
  bar.style.top = y + 'px';
  bar.onclick = e => { const btn = e.target.closest('[data-pc]'); if (btn) pCtxAct(btn.dataset.pc, btn); };
  bar.onpointerdown = e => e.stopPropagation();
}
function pGrupla() {
  const sel = items().filter(i => P.sel.has(i.id)); if (!sel.length) return;
  if (sel.some(i => i.grp)) { pSnap(); const gs = new Set(sel.map(i => i.grp).filter(Boolean)); for (const i of items()) if (gs.has(i.grp)) delete i.grp; pChanged(); pRender(); return toast('Grup çözüldü'); }
  if (sel.length < 2) return toast('Gruplamak için iki ya da daha fazla öğe seç');
  pSnap(); const g = 'g' + uid(); sel.forEach(i => { i.grp = g; }); pChanged(); pRender(); toast('Gruplandı · birlikte taşınır');
}
function pKilitle() {
  const sel = items().filter(i => P.sel.has(i.id)); if (!sel.length) return;
  pSnap(); const ac = sel.every(i => i.locked); sel.forEach(i => { if (ac) delete i.locked; else i.locked = true; }); pChanged(); pRender(); toast(ac ? 'Kilit açıldı' : 'Kilitlendi · taşınmaz ve silinmez');
}
function pCtxAct(a, btn) {
  const sel = items().filter(i => P.sel.has(i.id)); if (!sel.length) return;
  const first = sel[0];
  if (a === 'grup') return pGrupla();
  if (a === 'kilit') return pKilitle();
  if (a === 'todoedit') return pTodoEdit(first);
  if (a === 'pal') {
    const k = btn.dataset.k;
    const TINTS = ['#ffffff', '#eef4ff', '#effaf0', '#fff8e1', '#fdeef3', '#f3f0fb', '#fff1e6', '#f1f3f5'];
    const list = k === 'note' ? NOTE_COLORS : k === 'fill' ? FILLS.map(c => [c, c]) : k === 'frame' ? (first.kind === 'section' ? TINTS : FILLS.filter(c => c !== 'none')).map(c => [c, c]) : INK.map(c => [c, c]);
    const cur = k === 'note' ? first.color : k === 'fill' || k === 'frame' ? first.fill : k === 'stroke' ? first.stroke : k === 'accent' ? first.accent : first.color;
    return pPop(btn, `<div class="pswatches">${list.map(([v, c]) => `<button type="button" class="psw ${cur === v ? 'on' : ''} ${c === 'none' ? 'none' : ''}" data-v="${esc(v)}" style="--c:${c === 'none' ? 'transparent' : c}" title="${v === 'none' ? 'Dolgusuz' : ''}"></button>`).join('')}</div>`, v => {
      pSetProp(i => { if (k === 'note') i.color = v; else if (k === 'fill' || k === 'frame') { if (k === 'fill' && i.t === 'shape' && (!i.stroke || Object.values(EDGE).includes(i.stroke))) i.stroke = EDGE[v] || i.stroke; i.fill = v; } else if (k === 'stroke') i.stroke = v; else if (k === 'accent') i.accent = v; else i.color = v; });
      if (k === 'fill') store.set('panoShapeFill', v);
      if (k === 'note') store.set('panoNoteColor', v);
    });
  }
  if (a === 'kind') return pPop(btn, `<div class="pshapes">${SHAPES.map(([k, n]) => `<button type="button" class="pshape ${first.kind === k ? 'on' : ''}" data-v="${k}" title="${n}"><svg viewBox="0 0 40 30">${shapePath(k, 4, 4, 32, 22)} fill="none" stroke="currentColor" stroke-width="2"/></svg></button>`).join('')}</div>`, v => pSetProp(i => { if (i.t === 'shape') i.kind = v; }));
  if (a === 'size') return pPop(btn, [['Otomatik', 0], ['Küçük', 14], ['Orta', 20], ['Büyük', 32], ['Çok büyük', 48]].map(([n, v]) => pItem(String(v), '<i></i>', n)).join(''), v => pSetProp(i => { const n = +v; if (i.t === 'note') i.fs = n || undefined; else i.fs = n || (i.t === 'text' ? 24 : 18); }));
  if (a === 'bold') { const on = !sel.every(i => i.bold); return pSetProp(i => { i.bold = on; }); }
  if (a === 'align') return pSetProp(i => { if (i.t === 'note') i.align = i.align === 'left' ? 'center' : 'left'; else i.align = i.align === 'center' ? 'left' : 'center'; });
  if (a === 'dash') return pSetProp(i => { i.dash = !first.dash; });
  if (a === 'ends') return pSetProp(i => { const s = first.endA === 'arrow' ? 0 : first.endB === 'none' ? 2 : 1; [i.endA, i.endB] = [['none', 'arrow'], ['arrow', 'arrow'], ['none', 'none']][s]; });
  if (a === 'lw') return pSetProp(i => { i.width = first.width >= 4 ? 1.5 : first.width <= 1.5 ? 2 : 4; });
  if (a === 'pw') return pSetProp(i => { i.width = first.width >= 8 ? 3 : 8; });
  if (a === 'label') { pSnap(); return pEditStart(first, !first.text); }
  if (a === 'route') { const nx = { straight: 'curve', curve: 'elbow', elbow: 'straight' }[first.route || 'straight']; store.set('panoRoute', nx); return pSetProp(i => { if (i.t === 'line') i.route = nx; }); }
  if (a === 'recog') { const r = pRecognize(first); if (!r) return toast('Bu çizim bir şekle benzemiyor'); pSnap(); P.data.items[P.data.items.indexOf(first)] = r; P.sel = new Set([r.id]); pChanged(); return pRender(); }
  if (a === 'trow' || a === 'tcol' || a === 'tdel' || a === 'thead') return pSetProp(i => {
    if (a === 'trow') i.cells.push(i.cols.map(() => ''));
    if (a === 'tcol') { i.cols.push(140); i.cells.forEach(r => r.push('')); }
    if (a === 'tdel') { if (i.cells.length > 1 && (i.cells.length >= i.cols.length || i.cols.length === 1)) i.cells.pop(); else if (i.cols.length > 1) { i.cols.pop(); i.cells.forEach(r => r.pop()); } }
    if (a === 'thead') i.header = !i.header;
  });
  if (a === 'open') {
    if (first.t === 'link') return window.open(first.url, '_blank', 'noopener');
    if (first.t === 'mail') return window.open('https://mail.google.com/mail/u/0/#all/' + encodeURIComponent(first.threadId || ''), '_blank', 'noopener');
    if (first.ref?.kind === 'not') return window.open('notlar.html?not=' + encodeURIComponent(first.ref.uuid) + (DEMO ? '&demo' : ''), '_blank', 'noopener');
  }
  if (a === 'arrange') return pAlignMenu(btn);
  if (a === 'tocal') return pToCalendar(sel.filter(i => i.t === 'note'));
  if (a === 'tonote') return pToNotes(sel);
  if (a === 'cmt') return pComments(first);
  if (a === 'ftitle') return pFrameRename(first);
  if (a === 'front') return pZ(1);
  if (a === 'back') return pZ(-1);
  if (a === 'dup') return pPaste(pCopyItems([...P.sel]));
  if (a === 'del') return pRemove([...P.sel]);
}

/* ═════════ Klavye, kopyala-yapıştır, resim ═════════ */
document.addEventListener('keydown', e => {
  if (!$('#pShell') || $('#modal').innerHTML) return;
  const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
  if (typing) return;
  const k = e.key.toLowerCase(), ctrl = e.ctrlKey || e.metaKey;
  if (e.code === 'Space' && !e.repeat) { spaceDown = true; $('#pStage')?.classList.add('space'); e.preventDefault(); return; }
  if (ctrl && k === 'z') { e.preventDefault(); return e.shiftKey ? pRedo() : pUndo(); }
  if (ctrl && k === 'y') { e.preventDefault(); return pRedo(); }
  if (ctrl && k === 'a') { e.preventDefault(); pSetTool('select'); P.sel = new Set(items().map(i => i.id)); return pRenderOverlay(); }
  if (ctrl && k === 'g') { e.preventDefault(); return pGrupla(); }
  if (ctrl && k === 'l') { e.preventDefault(); return pKilitle(); }
  if (ctrl && k === 'f') { e.preventDefault(); return pAra(); }
  if (ctrl && k === 'd') { e.preventDefault(); return pPaste(pCopyItems([...P.sel])); }
  if (ctrl && k === 's') { e.preventDefault(); P.dirty = true; return pSave(); }
  if (ctrl && (k === '=' || k === '+')) { e.preventDefault(); return pZoomAt(P.V.z * 1.2); }
  if (ctrl && k === '-') { e.preventDefault(); return pZoomAt(P.V.z / 1.2); }
  if (ctrl) return;
  if (k === 'delete' || k === 'backspace') { if (P.sel.size) { e.preventDefault(); pRemove([...P.sel]); } return; }
  if (k === 'escape') { if (P.sel.size) { P.sel.clear(); pRenderOverlay(); } else pSetTool('select'); return; }
  if (k === 'tab' && P.sel.size === 1) { const it = byId([...P.sel][0]); if (it && pIsMind(it)) { e.preventDefault(); return pMindChild(it); } }
  if (k === 'enter' && P.sel.size === 1) { const it = byId([...P.sel][0]); if (it && /^(note|text|shape|line)$/.test(it.t)) { e.preventDefault(); pSnap(); pEditStart(it, false); } return; }
  if (k.startsWith('arrow') && P.sel.size) {
    e.preventDefault(); const st = e.shiftKey ? 20 : 2, dx = k === 'arrowleft' ? -st : k === 'arrowright' ? st : 0, dy = k === 'arrowup' ? -st : k === 'arrowdown' ? st : 0;
    return pSetProp(i => { if (i.t === 'pen') i.pts = i.pts.map((v, j) => v + (j % 2 ? dy : dx)); else if (i.t === 'line') { if (!i.a.id) i.a = { x: i.a.x + dx, y: i.a.y + dy }; if (!i.b.id) i.b = { x: i.b.x + dx, y: i.b.y + dy }; } else { i.x += dx; i.y += dy; } });
  }
  if (e.shiftKey && e.code === 'Digit1') { e.preventDefault(); return pFit(); }
  if (e.shiftKey && e.code === 'Digit2' && P.sel.size) { e.preventDefault(); return pFit(true, P.sel); }
  if (e.shiftKey && e.code === 'Digit0') { e.preventDefault(); return pZoomAt(1); }
  if (k === '+' || k === '=') return pZoomAt(P.V.z * 1.2);
  if (k === '-') return pZoomAt(P.V.z / 1.2);
  const tools = { v: 'select', h: 'hand', n: 'note', t: 'text', r: 'shape', l: 'line', p: 'pen', e: 'eraser', f: 'frame', s: 'stamp' };
  if (tools[k] && !e.altKey) { e.preventDefault(); if (tools[k] === 'stamp') return pToolClick('stamp', $('.pt[data-tool="stamp"]')); return pSetTool(tools[k]); }
  if (k === 'i') return pPickImage();
});
document.addEventListener('keyup', e => { if (e.code === 'Space') { spaceDown = false; $('#pStage')?.classList.remove('space'); } });
// Kopyala/kes: seçilen öğeler panoya (başka bir panoya ya da sekmeye de yapıştırılabilir)
const CLIP_TAG = '[suha-pano]';
for (const ev of ['copy', 'cut']) document.addEventListener(ev, e => {
  if (!$('#pShell') || $('#modal').innerHTML || !P.sel.size) return;
  if (/^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable) return;
  const list = pCopyItems([...P.sel]);
  e.preventDefault();
  e.clipboardData.setData('text/plain', CLIP_TAG + JSON.stringify(list));
  P.clip = list;
  if (ev === 'cut') pRemove([...P.sel]);
});
document.addEventListener('paste', e => {
  if (!$('#pShell') || $('#modal').innerHTML) return;
  if (/^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable) return;
  const files = [...(e.clipboardData?.files || [])].filter(f => f.type.startsWith('image/'));
  const r = stageRect(), c = toWorld(r.left + r.width / 2, r.top + r.height / 2);
  if (files.length) { e.preventDefault(); return pAddImages(files, c); }
  const text = e.clipboardData?.getData('text/plain') || '';
  if (text.startsWith(CLIP_TAG)) { e.preventDefault(); try { return pPaste(JSON.parse(text.slice(CLIP_TAG.length)), c); } catch { return; } }
  if (!text && P.clip?.length) { e.preventDefault(); return pPaste(P.clip, c); }
  if (/^https?:\/\/\S+$/.test(text.trim())) { e.preventDefault(); const card = pLinkCard(text.trim(), c); if (card) return pPlace([card]); }
  if (text.trim()) {
    e.preventDefault();
    // Satır satır yapıştırılan metin: her satır bir not
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean).slice(0, 60);
    const cols = Math.ceil(Math.sqrt(lines.length));
    const made = lines.map((t, i) => ({ id: uid(), t: 'note', x: r1(c.x - (cols * 224) / 2 + (i % cols) * 224), y: r1(c.y - 100 + Math.floor(i / cols) * 224), w: 200, h: 200, color: store.get('panoNoteColor', 'sari'), text: t.slice(0, 500) }));
    pSnap(); P.data.items.push(...made); P.sel = new Set(made.map(m => m.id)); pChanged(); pRender();
    toast(lines.length > 1 ? `${lines.length} not oluşturuldu` : 'Not oluşturuldu');
  }
});
function pPickImage() {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.multiple = true;
  inp.onchange = () => { const r = stageRect(); pAddImages([...inp.files], toWorld(r.left + r.width / 2, r.top + r.height / 2)); };
  inp.click();
}
async function pAddImages(files, at) {
  const made = []; let x = at.x;
  for (const f of files.slice(0, 10)) {
    try {
      const { url, w, h } = await pShrink(f);
      const k = Math.min(1, 480 / Math.max(w, h)) / Math.max(0.5, P.V.z);
      const it = { id: uid(), t: 'image', src: url, x: r1(x - (w * k) / 2), y: r1(at.y - (h * k) / 2), w: r1(w * k), h: r1(h * k) };
      made.push(it); x += w * k + 20;
    } catch { toast(`${f.name} eklenemedi`); }
  }
  if (!made.length) return;
  pSnap(); P.data.items.push(...made); pSetTool('select'); P.sel = new Set(made.map(m => m.id)); pChanged(); pRender();
}
function pShrink(file, max = 1600) {
  return new Promise((res, rej) => {
    const u = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      const g = c.getContext('2d'); g.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
      const png = /png|gif|webp/.test(file.type) && c.width * c.height < 900 * 900;
      if (!png) { g.globalCompositeOperation = 'destination-over'; g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); }
      res({ url: c.toDataURL(png ? 'image/png' : 'image/jpeg', 0.82), w: c.width, h: c.height });
    };
    img.onerror = () => { URL.revokeObjectURL(u); rej(new Error('resim')); };
    img.src = u;
  });
}

/* ═════════ Dışa aktarma: PNG, PDF (yazdır), pano dosyası ═════════ */
function pExportSvg(ids, pad = 40) {
  const list = ids ? items().filter(i => ids.has(i.id)) : items();
  if (!list.length) return null;
  const b = unionBox(list.map(i => { const bb = bboxOf(i); return i.t === 'frame' ? { ...bb, y: bb.y - 28, h: bb.h + 28 } : bb; }));
  const x = b.x - pad, y = b.y - pad, w = b.w + pad * 2, h = b.h + pad * 2;
  const cols = list.filter(i => i.t === 'line').map(i => i.color || '#1b1d21');
  const body = drawOrder(list).map(i => itemSvg(i, true)).join('').replace(/fill:var\(--pano-bg,#fff\)/g, 'fill:#ffffff');
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}"><defs>${GLOSS}${markerDefs('pex', cols.length ? cols : ['#1b1d21'])}</defs><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#ffffff"/>${body}</svg>`, w, h };
}
function pRaster(ids, maxSide = 4000, type = 'image/png', q = 0.92) {
  const ex = pExportSvg(ids); if (!ex) return Promise.resolve(null);
  const k = Math.min(maxSide / Math.max(ex.w, ex.h), type === 'image/png' ? 2 : 1);
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(ex.w * k)); c.height = Math.max(1, Math.round(ex.h * k));
      const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
      try { res(c.toDataURL(type, q)); } catch (e) { rej(e); }
    };
    img.onerror = rej;
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(ex.svg);
  });
}
const pFileName = ext => (P.board?.title || 'Pano').replace(/[\\/:*?"<>|]/g, '-').slice(0, 80) + ext;
function pDownload(href, name) { const a = document.createElement('a'); a.href = href; a.download = name; document.body.appendChild(a); a.click(); a.remove(); }
function pShareMenu(btn) {
  pPop(btn, `${pItem('png', IC.image, 'Resim olarak indir (PNG)')}${P.sel.size ? pItem('pngsel', IC.image, 'Sadece seçileni indir') : ''}${pItem('pdf', IC.print, 'PDF olarak kaydet / yazdır')}${pItem('json', IC.download, 'Pano dosyası indir (.pano)')}`, async v => {
    try {
      if (v === 'png' || v === 'pngsel') { const url = await pRaster(v === 'pngsel' ? P.sel : null); if (!url) return toast('Pano boş'); pDownload(url, pFileName('.png')); }
      if (v === 'pdf') pPrint();
      if (v === 'json') { const url = URL.createObjectURL(new Blob([JSON.stringify({ suha: 'pano', title: P.board.title, ...P.data })], { type: 'application/json' })); pDownload(url, pFileName('.pano')); setTimeout(() => URL.revokeObjectURL(url), 60e3); }
    } catch (e) { toast('Dışa aktarılamadı: ' + (e.message || e)); }
  });
}
function pPrint() {
  const ex = pExportSvg(); if (!ex) return toast('Pano boş');
  const land = ex.w >= ex.h;
  const doc = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>${esc(P.board.title)}</title><style>@page{size:A4 ${land ? 'landscape' : 'portrait'};margin:10mm}html,body{margin:0;height:100%}svg{width:100%;height:100%;display:block}</style></head><body>${ex.svg.replace(/width="[^"]+" height="[^"]+"/, 'preserveAspectRatio="xMidYMid meet"')}</body></html>`;
  const url = URL.createObjectURL(new Blob([doc], { type: 'text/html' }));
  const fr = document.createElement('iframe'); fr.style.cssText = 'position:fixed;width:0;height:0;border:0;opacity:0'; fr.src = url;
  fr.onload = () => { try { fr.contentWindow.focus(); fr.contentWindow.print(); } catch { toast('Yazdırma açılamadı'); } setTimeout(() => { fr.remove(); URL.revokeObjectURL(url); }, 60e3); };
  document.body.appendChild(fr);
  toast('Yazdırma penceresinde "PDF olarak kaydet"i seçebilirsin');
}
function pImport() {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.pano,.json,application/json';
  inp.onchange = async () => {
    const f = inp.files[0]; if (!f) return;
    try {
      const d = JSON.parse(await f.text());
      if (!Array.isArray(d.items)) throw new Error('Bu bir pano dosyası değil');
      const title = (d.title || f.name.replace(/\.(pano|json)$/i, '')).slice(0, 80);
      const data = pNormalize({ items: d.items, view: null });
      const r = await PDB.create(title, data);
      P.boards.unshift({ id: r.id, title, modified: r.modified });
      toast('Pano içe aktarıldı'); pOpen(r.id);
    } catch (e) { if (!(e instanceof AuthError)) toast('Açılamadı: ' + e.message); }
  };
  inp.click();
}

/* ═════════ Şablonlar ═════════ */
const N_ = (x, y, text, color = 'sari', w = 200, h = 200, extra = {}) => ({ id: uid(), t: 'note', x, y, w, h, color, text, ...extra });
const F_ = (x, y, w, h, title, fill = '#ffffff') => ({ id: uid(), t: 'frame', x, y, w, h, title, fill });
const T_ = (x, y, text, fs = 32, w = 600, extra = {}) => ({ id: uid(), t: 'text', x, y, w, fs, text, color: '#1b1d21', bold: true, ...extra });
const S_ = (x, y, w, h, kind, text, fill = '#ffffff', extra = {}) => ({ id: uid(), t: 'shape', kind, x, y, w, h, text, fill, stroke: '#1b1d21', fs: 18, ...extra });
const L_ = (a, b, text = '', extra = {}) => ({ id: uid(), t: 'line', a: { id: a.id }, b: { id: b.id }, color: '#1b1d21', width: 2, endB: 'arrow', endA: 'none', text, ...extra });
const PTPL = [
  { id: 'blank', name: 'Boş pano', desc: 'Sıfırdan başla', make: () => ({ v: 1, items: [] }) },
  { id: 'brain', name: 'Beyin fırtınası', desc: 'Konu ve fikir notları', make: () => {
    const it = [T_(0, -110, 'Konu: …', 36, 700), F_(-20, -40, 1000, 520, 'Fikirler', '#ffffff')];
    const cols = ['sari', 'pembe', 'mavi', 'yesil', 'mor'];
    for (let i = 0; i < 8; i++) it.push(N_(10 + (i % 4) * 240, 0 + Math.floor(i / 4) * 240, i === 0 ? 'Aklına gelen her şeyi yaz' : '', cols[i % cols.length]));
    return { v: 1, items: it };
  } },
  { id: 'kanban', name: 'Kanban', desc: 'Yapılacak · Yapılıyor · Bitti', make: () => {
    const it = [], cols = [['Yapılacak', 'sari'], ['Yapılıyor', 'mavi'], ['Bitti', 'yesil']];
    const sample = [['Gereksinimleri yaz', 'Tasarımı çiz', 'Test planı'], ['Ana sayfa'], ['Proje kurulumu']];
    cols.forEach(([t, c], i) => { it.push(F_(i * 300, 0, 270, 760, t, '#ffffff')); sample[i].forEach((s, j) => it.push(N_(i * 300 + 25, 25 + j * 170, s, c, 220, 150))); });
    return { v: 1, items: it };
  } },
  { id: 'mind', name: 'Zihin haritası', desc: 'Merkezden dallanan fikirler', make: (title = 'Ana fikir') => {
    const c = S_(-110, -45, 220, 90, 'pill', title, '#26282c', { bold: true, tc: '#ffffff', fs: 22 });
    const it = [c];
    const branches = [['Konu 1', 'sari'], ['Konu 2', 'pembe'], ['Konu 3', 'mavi'], ['Konu 4', 'yesil'], ['Konu 5', 'mor'], ['Konu 6', 'turuncu']];
    branches.forEach(([t, col], i) => {
      const a = (i / branches.length) * Math.PI * 2 - Math.PI / 2, x = Math.cos(a) * 380, y = Math.sin(a) * 250;
      const n = S_(r1(x - 85), r1(y - 32), 170, 64, 'round', t, NOTE_COLORS.find(q => q[0] === col)[1]);
      n.stroke = 'transparent'; it.push(n); it.push(L_(c, n, '', { endB: 'none', width: 2.5, color: '#9aa1ab', route: 'curve', mm: true }));
    });
    return { v: 1, items: it };
  } },
  { id: 'retro', name: 'Retrospektif', desc: 'İyi gidenler · Geliştirilecekler · Aksiyonlar', make: () => {
    const it = [], cols = [['İyi gidenler', 'yesil'], ['Geliştirilecekler', 'pembe'], ['Aksiyonlar', 'mavi']];
    cols.forEach(([t, c], i) => { it.push(F_(i * 380, 0, 350, 620, t, '#ffffff')); for (let j = 0; j < 2; j++) it.push(N_(i * 380 + 25 + j * 155, 25, '', c, 145, 145)); });
    return { v: 1, items: it };
  } },
  { id: 'week', name: 'Haftalık plan', desc: 'Pazartesiden pazara', make: () => {
    const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    const it = [];
    days.forEach((d, i) => { it.push(F_(i * 250, 0, 230, 600, d, i > 4 ? '#f3f0fb' : '#ffffff')); it.push(N_(i * 250 + 15, 20, '', i > 4 ? 'mor' : 'sari', 200, 120)); });
    return { v: 1, items: it };
  } },
  { id: 'flow', name: 'Akış şeması', desc: 'Başla → adım → karar → bitir', make: () => {
    const a = S_(0, 0, 180, 64, 'pill', 'Başla', '#cdf1cd'), b = S_(0, 130, 180, 80, 'rect', 'Adım 1'), c = S_(-10, 280, 200, 120, 'diamond', 'Karar?', '#fff1a6');
    const d = S_(-260, 460, 180, 80, 'rect', 'Evetse'), e2 = S_(260, 460, 180, 80, 'rect', 'Hayırsa'), f = S_(0, 620, 180, 64, 'pill', 'Bitir', '#ffcadb');
    return { v: 1, items: [a, b, c, d, e2, f, L_(a, b), L_(b, c), L_(c, d, 'Evet'), L_(c, e2, 'Hayır'), L_(d, f), L_(e2, f)] };
  } },
  { id: 'swot', name: 'SWOT analizi', desc: 'Güçlü · Zayıf · Fırsat · Tehdit', make: () => {
    const q = [['Güçlü yönler', 'yesil'], ['Zayıf yönler', 'pembe'], ['Fırsatlar', 'mavi'], ['Tehditler', 'turuncu']];
    const it = [];
    q.forEach(([t, c], i) => { const x = (i % 2) * 520, y = Math.floor(i / 2) * 440; it.push(F_(x, y, 490, 400, t, '#ffffff')); it.push(N_(x + 25, y + 25, '', c, 180, 160)); });
    return { v: 1, items: it };
  } },
  { id: 'eisen', name: 'Eisenhower matrisi', desc: 'Acil / Önemli önceliklendirme', make: () => {
    const q = [['Yap · Acil + Önemli', 'yesil'], ['Planla · Önemli, acil değil', 'mavi'], ['Devret · Acil, önemli değil', 'sari'], ['Ele · Ne acil ne önemli', 'pembe']];
    const it = [T_(0, -90, 'Öncelik matrisi', 30, 700)];
    q.forEach(([t, c], i) => { const x = (i % 2) * 520, y = Math.floor(i / 2) * 440; it.push(F_(x, y, 490, 400, t, '#ffffff')); it.push(N_(x + 25, y + 25, '', c, 180, 160)); });
    return { v: 1, items: it };
  } },
  { id: 'road', name: 'Yol haritası', desc: 'Şimdi · Sonraki · Sonra', make: () => {
    const cols = [['Şimdi', 'yesil'], ['Sonraki', 'mavi'], ['Sonra', 'mor'], ['İleride', 'gri']];
    const it = [T_(0, -90, 'Yol haritası', 30, 700)];
    cols.forEach(([t, c], i) => { it.push(F_(i * 300, 0, 270, 620, t, '#ffffff')); for (let j = 0; j < 2; j++) it.push(N_(i * 300 + 25, 25 + j * 150, '', c, 220, 135)); });
    return { v: 1, items: it };
  } },
  { id: 'org', name: 'Org şeması', desc: 'Ekip / hiyerarşi', make: () => {
    const top = S_(-90, 0, 180, 70, 'round', 'Yönetici', '#cbe3ff', { bold: true });
    const it = [top]; const kids = ['Ekip 1', 'Ekip 2', 'Ekip 3'];
    kids.forEach((k, i) => { const x = (i - 1) * 240; const n = S_(x - 80, 200, 160, 64, 'round', k, '#ffffff'); it.push(n); it.push(L_(top, n, '', { endB: 'none', width: 2 })); });
    return { v: 1, items: it };
  } },
  { id: 'meet', name: 'Toplantı notu', desc: 'Gündem · Notlar · Kararlar · Aksiyonlar', make: () => {
    const it = [T_(0, -90, 'Toplantı — ' + new Date().toLocaleDateString('tr'), 26, 700)];
    const cols = [['Gündem', 'sari'], ['Notlar', 'mavi'], ['Kararlar', 'yesil'], ['Aksiyonlar', 'pembe']];
    cols.forEach(([t, c], i) => { it.push(F_(i * 300, 0, 270, 620, t, '#ffffff')); it.push(N_(i * 300 + 25, 25, '', c, 220, 160)); });
    return { v: 1, items: it };
  } },
  { id: 'story', name: 'Hikâye haritası', desc: 'Kullanıcı etkinlikleri ve adımları', make: () => {
    const it = [T_(0, -90, 'Hikâye haritası', 28, 700)]; const acts = ['Keşfet', 'Kaydol', 'Kullan', 'Paylaş'];
    acts.forEach((a, i) => { it.push(S_(i * 260, 0, 230, 60, 'rect', a, '#cbe3ff', { bold: true })); for (let j = 0; j < 2; j++) it.push(N_(i * 260, 90 + j * 150, '', i % 2 ? 'sari' : 'yesil', 230, 135)); });
    return { v: 1, items: it };
  } },
  { id: 'month', name: 'Aylık takvim', desc: 'Haftalık ızgara', make: () => {
    const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']; const it = [T_(0, -96, 'Ay planı', 28, 700)]; const cw = 190, ch = 150;
    days.forEach((d, i) => it.push(T_(i * cw + 8, -34, d, 17, cw - 16, { bold: false, color: '#6b717a' })));
    for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) it.push(S_(c * cw, r * ch, cw - 10, ch - 10, 'rect', '', '#ffffff', { fs: 14 }));
    return { v: 1, items: it };
  } }
];
function pTplPreview(t) {
  const data = t.make(); const saved = P.data; P.data = data;
  const ex = pExportSvg(null, 30); P.data = saved;
  return ex ? ex.svg.replace(/width="[^"]+" height="[^"]+"/, 'preserveAspectRatio="xMidYMid meet"') : `<svg viewBox="0 0 10 6"></svg>`;
}
/* Kendi şablonların (localStorage) */
function ozelSablonlar() { try { return JSON.parse(localStorage.getItem('panoOzelSablonlar')) || []; } catch { return []; } }
function ozelSablonYaz(l) { try { localStorage.setItem('panoOzelSablonlar', JSON.stringify(l.slice(0, 40))); } catch {} }
function klonSablon(data) {
  const items = JSON.parse(JSON.stringify(data.items || [])); const map = {};
  for (const it of items) { const o = it.id; it.id = uid(); map[o] = it.id; }
  for (const it of items) { if (it.t === 'line') { if (it.a?.id) it.a.id = map[it.a.id] || it.a.id; if (it.b?.id) it.b.id = map[it.b.id] || it.b.id; } }
  return { v: 1, items, bg: data.bg, sketch: data.sketch };
}
function ozelSablonEntry(o) { return { id: 'ozel:' + o.id, oid: o.id, name: o.name, desc: 'Kendi şablonun', ozel: true, make: () => klonSablon(o.data) }; }
function pSablonKaydet() {
  if (!P.data || !items().length) { toast('Boş pano şablon olamaz'); return; }
  pAsk('Şablon olarak kaydet', 'Şablon adı', P.board?.title || '').then(name => {
    if (!name) return;
    const data = { items: JSON.parse(JSON.stringify(items())), bg: P.data.bg, sketch: P.data.sketch };
    const l = ozelSablonlar(); l.unshift({ id: uid(), name, data }); ozelSablonYaz(l);
    toast('Şablon kaydedildi — "Yeni pano"da görünür');
  });
}
function pTemplateDialog(insert) {
  const TUM = PTPL.concat(ozelSablonlar().map(ozelSablonEntry));
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet ptpl-sheet"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>${insert ? 'Şablon ekle' : 'Yeni pano'}</h3></header>
    <div class="set-body">${insert ? '' : `<label class="nask-l">Panonun adı<input id="pNewTitle" value="" placeholder="Adsız pano" maxlength="80" autocomplete="off"></label>`}
      <form class="searchbox ptpl-search" id="pTplSearchForm">${IC.search}<input id="pTplSearch" type="search" placeholder="Şablon ara" autocomplete="off"></form>
      <div class="ptpl-grid">${TUM.filter(t => !insert || t.id !== 'blank').map(t => `<button type="button" class="ptpl${t.ozel ? ' ptpl-ozel' : ''}" data-tpl="${t.id}" data-ara="${esc((t.name + ' ' + t.desc).toLocaleLowerCase('tr'))}"><div class="ptpl-prev">${t.id === 'blank' ? `<div class="ptpl-blank">${IC.plus}</div>` : pTplPreview(t)}</div><b>${esc(t.name)}</b><span>${esc(t.desc)}</span>${t.ozel ? `<button type="button" class="ptpl-sil" data-sil="${esc(t.oid)}" title="Şablonu sil">${IC.trash}</button>` : ''}</button>`).join('')}</div>
      <div class="ptpl-bos" id="pTplBos" hidden>Eşleşen şablon yok</div>
    </div></div></div>`;
  $('#modal').querySelector('.ptpl-grid').addEventListener('click', async e => {
    const sil = e.target.closest('[data-sil]');
    if (sil) { e.stopPropagation(); ozelSablonYaz(ozelSablonlar().filter(o => o.id !== sil.dataset.sil)); pTemplateDialog(insert); return; }
    const b = e.target.closest('[data-tpl]'); if (!b) return;
    const t = TUM.find(x => x.id === b.dataset.tpl);
    if (insert) { closeModal(); return pInsertTemplate(t); }
    const title = ($('#pNewTitle')?.value || '').trim() || (t.id === 'blank' ? 'Adsız pano' : t.name);
    b.disabled = true;
    try {
      const data = t.make(title); data.view = null;
      const r = await PDB.create(title, data);
      P.boards.unshift({ id: r.id, title, modified: r.modified });
      closeModal(); pOpen(r.id);
    } catch (err) { b.disabled = false; if (!(err instanceof AuthError)) toast('Pano oluşturulamadı: ' + err.message); }
  });
  $('#pTplSearchForm')?.addEventListener('submit', e => e.preventDefault());
  $('#pTplSearch')?.addEventListener('input', e => {
    const q = e.target.value.trim().toLocaleLowerCase('tr');
    let n = 0;
    $('#modal').querySelectorAll('.ptpl').forEach(b => { const g = !q || (b.dataset.ara || '').includes(q); b.hidden = !g; if (g) n++; });
    const bos = $('#pTplBos'); if (bos) bos.hidden = n > 0;
  });
  setTimeout(() => $('#pNewTitle')?.focus(), 60);
}
const pNewDialog = () => pTemplateDialog(false);
function pDosya(ad, icerik, tur) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([icerik], { type: tur })); a.download = ad; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 8000); }
function pInsertTemplate(t) {
  const d = t.make(); const list = d.items;
  const r = stageRect(), c = toWorld(r.left + r.width / 2, r.top + r.height / 2);
  const saved = P.data; P.data = { items: list }; const b = unionBox(list.filter(i => i.t !== 'line').map(bboxOf)); P.data = saved;
  const dx = c.x - (b.x + b.w / 2), dy = c.y - (b.y + b.h / 2);
  for (const i of list) { if (i.t === 'line') continue; i.x = r1(i.x + dx); i.y = r1(i.y + dy); }
  pSnap(); P.data.items.push(...list); pSetTool('select'); P.sel = new Set(list.map(i => i.id)); pChanged(); pRender(); pFit(true, P.sel);
}

/* ═════════ Menüler ═════════ */
function pMenu(btn) {
  pPop(btn, `${pItem('present', IC.play, 'Sunum')}${pItem('vote', IC.vote, P.voting ? 'Oylamayı bitir' : 'Nokta oylaması başlat')}${pItem('timer', IC.timer, 'Zamanlayıcı')}<div class="ctx-sep"></div>
    ${pItem('sketch', IC.sketchI, P.data?.sketch ? 'Düzgün görünüme dön' : 'El çizimi görünümü')}${pItem('mini', IC.mapI, P.mini ? 'Mini haritayı gizle' : 'Mini haritayı göster')}${pItem('grid', IC.grid, 'Zemin deseni ve rengi…')}${pItem('fit', IC.fit, 'Hepsini göster (Shift+1)')}${pItem('find', IC.search2, 'Panoda ara (Ctrl+F)')}${pItem('tpl', IC.template, 'Şablon ekle')}${pItem('savetpl', IC.template, 'Şablon olarak kaydet')}
    ${pItem('keys', IC.keyboard || IC.gear, 'Klavye kısayolları')}<div class="ctx-sep"></div>${pItem('dup', IC.copy, 'Panoyu çoğalt')}${pItem('del', IC.trash, 'Panoyu sil', 'data-danger')}`, async v => {
    if (v === 'savetpl') return pSablonKaydet();
    if (v === 'present') return pPresent();
    if (v === 'vote') return pVoting(!P.voting);
    if (v === 'timer') return pTimerMenu(btn);
    if (v === 'sketch') { pSnap(); P.data.sketch = !P.data.sketch; wrapCache.clear(); pChanged(); pRender(); return; }
    if (v === 'mini') { P.mini = !P.mini; store.set('panoMini', P.mini); return pMiniSoon(); }
    if (v === 'grid') return pZeminMenu(btn);
    if (v === 'fit') pFit();
    if (v === 'find') pAra();
    if (v === 'tpl') pTemplateDialog(true);
    if (v === 'keys') pKeysHelp();
    if (v === 'dup') { await pSave(); try { const r = await PDB.create(P.board.title + ' (kopya)', P.data); P.boards.unshift({ id: r.id, title: P.board.title + ' (kopya)', modified: r.modified }); toast('Pano çoğaltıldı'); pOpen(r.id); } catch (e) { if (!(e instanceof AuthError)) toast('Çoğaltılamadı: ' + e.message); } }
    if (v === 'del') { if (confirm(YEREL ? `"${P.board.title}" silinsin mi? 7 gün içinde geri alınabilir.` : `"${P.board.title}" silinsin mi? Drive'ın çöp kutusuna gider, 30 gün içinde geri alınabilir.`)) pDeleteBoard(P.board); }
  });
}
function pZoomMenu(btn) {
  pPop(btn, `${pItem('in', IC.plus, 'Yakınlaştır')}${pItem('out', IC.minus, 'Uzaklaştır')}${pItem('100', '<i></i>', '%100 (Shift+0)')}${pItem('fit', IC.fit, 'Hepsini göster (Shift+1)')}${P.sel.size ? pItem('sel', IC.fit, 'Seçilene git (Shift+2)') : ''}`, v => {
    if (v === 'in') pZoomAt(P.V.z * 1.25); if (v === 'out') pZoomAt(P.V.z / 1.25); if (v === '100') pZoomAt(1); if (v === 'fit') pFit(); if (v === 'sel') pFit(true, P.sel);
  });
}
const PKEYS = [['V', 'Seç'], ['H ya da Boşluk', 'Kaydır'], ['N', 'Yapışkan not'], ['T', 'Metin'], ['R', 'Şekil'], ['L', 'Bağlantı oku'], ['P', 'Kalem'], ['E', 'Silgi'], ['F', 'Çerçeve'], ['I', 'Resim'],
  ['Çift tık', 'Boş yerde yeni not, öğede yazı'], ['Tab (notta)', 'Yanına yeni not'], ['Ctrl + Z / Y', 'Geri al / Yinele'], ['Ctrl + C / X / V', 'Kopyala / Kes / Yapıştır'], ['Ctrl + D', 'Çoğalt'], ['Ctrl + G', 'Grupla / grubu çöz'], ['Ctrl + L', 'Kilitle / kilidi aç'], ['Ctrl + F', 'Panoda ara'], ['Alt + sürükle', 'Kopyasını sürükle'],
  ['Delete', 'Sil'], ['Oklar', 'Kaydır (Shift ile hızlı)'], ['Ctrl + kaydırma', 'Yakınlaştır'], ['Shift + 1 / 2 / 0', 'Hepsi / seçilen / %100']];
function pKeysHelp() {
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask" style="width:min(560px,100%)"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Klavye kısayolları</h3></header>
    <div class="set-body"><div class="nkeys">${PKEYS.map(([k, d]) => `<div><kbd>${esc(k)}</kbd><span>${esc(d)}</span></div>`).join('')}</div>
    <p class="muted sm">Telefonda: iki parmakla yakınlaştır ve kaydır; tek parmakla boş yerde kaydır.</p></div></div></div>`;
}
function pSettings() {
  const t = store.get('theme', 'light');
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet settings"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Ayarlar</h3></header>
    <div class="set-body">
      <section><h4>Görünüm</h4><div class="seg yon-seg">${[['light', 'Cam'], ['dark', 'Koyu'], ['auto', 'Otomatik'], ['flat', 'Düz']].map(([k, n]) => `<button class="${t === k ? 'on' : ''}" data-action="p-theme" data-t="${k}">${n}</button>`).join('')}</div></section>
      ${YEREL ? `<section><h4>Panoların</h4>
        <div class="set-row"><div><b>Bu cihazda</b><span>${P.boards.length} pano yalnızca bu cihazda saklanır; giriş gerekmez, hiçbir yere gönderilmez. Başka cihaza taşımak için panoyu "Dışa aktar" ile .pano dosyası yapıp orada "Pano dosyası aç" ile aç.</span></div></div>
        <div class="set-row"><div><b>Tüm panoların yedeği</b><span>Bütün panoları tek .json dosyasında indirir.</span></div><button class="btn sm" data-action="p-yedek">${IC.download}Yedek al</button></div>
        <div class="set-row"><div><b>Yedeği geri yükle</b><span>Yedekteki panolar eklenir; mevcut panolara dokunulmaz.</span></div><button class="btn sm" data-action="p-yedek-ac">${IC.upload}Dosya seç</button></div>
        <div class="set-row"><div><b>Eski Google Drive panoların mı var?</b><span>Önceden Drive'a kaydettiğin panoları görmek için Google ile gir; sonra "Cihaza aktar" ile buraya kopyalayabilirsin.</span></div><button class="btn sm" data-action="p-drive-ac">Drive'ı aç</button></div></section>`
      : DEMO ? '' : `<section><h4>Hesap</h4><div class="set-row"><div><b>${esc(S.email || '')}</b><span>Panolar bu hesabın Google Drive'ında, "Suha Pano" klasöründe saklanır. Program Drive'daki başka dosyalarını göremez.</span></div>
        <button class="btn" data-action="logout">${IC.logout}Çıkış yap</button></div>
        <div class="set-row"><div><b>Panoları cihaza aktar</b><span>Drive'daki bütün panoları bu cihaza kopyalar. Sonra Drive'a ihtiyacın kalmaz.</span></div><button class="btn sm" data-action="p-cihaza-aktar">Aktar</button></div>
        <div class="set-row"><div><b>Cihazda saklamaya dön</b><span>Giriş istemeyen varsayılan moda geçer.</span></div><button class="btn sm" data-action="p-yerel-don">Dön</button></div></section>`}
      <section><h4>Uygulama</h4>${typeof aboutRow === 'function' ? aboutRow() : ''}${typeof feedbackRow === 'function' ? feedbackRow() : ''}</section>
    </div></div></div>`;
}

Object.assign(ACTIONS, {
  'p-new': () => pNewDialog(),
  'p-open': (el, e) => { if (e?.target.closest('.pl-more')) return; pOpen(el.dataset.id); },
  'p-card-menu': (el, e) => { e?.stopPropagation(); pCardMenu(el); },
  'p-sort': el => { const onay = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-11"/></svg>'; pPop(el, Object.entries(SORT_ADLAR).map(([v, l]) => pItem(v, panoSort === v ? onay : '<i></i>', l)).join(''), v => { panoSort = v; store.set('panoSort', v); const lbl = $('#pSortLbl'); if (lbl) lbl.textContent = sortLabel(); pListRender(); }); },
  'p-import': () => pImport(),
  'p-settings': () => pSettings(),
  'p-yedek': async () => { try { const l = []; for (const b of P.boards) l.push({ title: b.title, modified: b.modified, data: await PDB.get(b.id) }); pDosya(`Pano yedeği ${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify({ suha: 'pano-yedek', surum: 1, panolar: l }), 'application/json'); toast(`${l.length} pano yedeklendi`); } catch (e) { toast('Yedek alınamadı: ' + e.message); } },
  'p-yedek-ac': () => { const i = document.createElement('input'); i.type = 'file'; i.accept = '.json,application/json'; i.onchange = async () => { const f = i.files[0]; if (!f) return; try { const d = JSON.parse(await f.text()); if (d.suha !== 'pano-yedek' || !Array.isArray(d.panolar)) throw new Error('Bu bir Pano yedeği değil'); let n = 0; for (const p of d.panolar.slice(0, 500)) { const t = String(p.title || 'Pano').slice(0, 80); await PDB.create(t, pNormalize(p.data)); n++; } toast(`${n} pano geri yüklendi`); closeModal(); pListLoad(!P.board); } catch (e) { toast('Yüklenemedi: ' + e.message); } }; i.click(); },
  'p-drive-ac': () => { store.set('panoDepo', 'drive'); location.href = location.pathname; },
  'p-yerel-don': () => { store.set('panoDepo', 'yerel'); location.href = location.pathname; },
  'p-cihaza-aktar': async () => { if (!confirm('Drive\'daki bütün panolar bu cihaza kopyalansın mı?')) return; try { const l = await PDB_REAL.list(); const ac = await new Promise((res, rej) => { const r = indexedDB.open('suha-pano', 1); r.onupgradeneeded = () => r.result.createObjectStore('pano', { keyPath: 'id' }); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); let n = 0; for (const b of l) { const d = await PDB_REAL.get(b.id); await new Promise((res, rej) => { const t = ac.transaction('pano', 'readwrite'); t.objectStore('pano').put({ id: 'y' + uid() + uid(), title: b.title, data: pNormalize(d), modified: b.modified || Date.now(), trashed: false }); t.oncomplete = res; t.onerror = () => rej(t.error); }); n++; } toast(`${n} pano cihaza aktarıldı. "Dön" ile cihazda saklamaya geçebilirsin`, [], 7000); } catch (e) { if (!(e instanceof AuthError)) toast('Aktarılamadı: ' + e.message); } },
  'p-theme': el => { store.set('theme', el.dataset.t); applyTheme(el.dataset.t); pSettings(); },
  'p-home': async () => { pEditEnd(); if (P.dirty) await pSave(); store.del('panoLast'); P.board = null; pListLoad(); },
  'p-undo': () => pUndo(), 'p-redo': () => pRedo(),
  'p-share': el => pShareMenu(el), 'p-menu': el => pMenu(el),
  'p-timer': el => pTimerMenu(el), 'p-present': () => pPresent(),
  'p-fit': () => pFit(), 'p-tpl': () => pTemplateDialog(true),
  'p-quicknote': () => { const c = pCenter(); const n = { id: uid(), t: 'note', x: r1(c.x - 100), y: r1(c.y - 100), w: 200, h: 200, color: store.get('panoNoteColor', 'sari'), text: '' }; pSnap(); P.data.items.push(n); P.sel = new Set([n.id]); pRender(); pEditStart(n, true); },
  'p-zoom-in': () => pZoomAt(P.V.z * 1.25), 'p-zoom-out': () => pZoomAt(P.V.z / 1.25), 'p-zoom-menu': el => pZoomMenu(el),
  settings: () => pSettings()
});
window.addEventListener('resize', () => { if ($('#pShell')) { pApplyView(); pRenderOverlay(); } });

/* ═════════ Simge kütüphanesi (24×24 çizgi simgeler) ═════════ */
const PICONS = [
  ['kisi', 'Kişi', '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4.5 4.5-6 8-6s6.5 1.5 8 6"/>'],
  ['ekip', 'Ekip', '<circle cx="9" cy="8" r="3.5"/><circle cx="17" cy="9" r="2.8"/><path d="M2.5 20c1-4 3.6-5.5 6.5-5.5s5.5 1.5 6.5 5.5M15.5 14.5c2.7 0 4.9 1.3 6 4.5"/>'],
  ['ev', 'Ev', '<path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5.5h4V20"/>'],
  ['bina', 'Bina / şirket', '<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10.5 21v-3h3v3"/>'],
  ['bulut', 'Bulut', '<path d="M7 18a4.5 4.5 0 0 1-.5-9A6 6 0 0 1 18 8.5a4.8 4.8 0 0 1-.5 9.5z"/>'],
  ['sunucu', 'Sunucu', '<rect x="4" y="3.5" width="16" height="7" rx="1.5"/><rect x="4" y="13.5" width="16" height="7" rx="1.5"/><path d="M8 7h.01M8 17h.01M12 7h5M12 17h5"/>'],
  ['veritabani', 'Veri tabanı', '<ellipse cx="12" cy="5.5" rx="7.5" ry="2.8"/><path d="M4.5 5.5v13c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-13M4.5 12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8"/>'],
  ['bilgisayar', 'Bilgisayar', '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/>'],
  ['telefon', 'Telefon', '<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M11 18.5h2"/>'],
  ['eposta', 'E-posta', '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 7 8.5-7"/>'],
  ['takvim', 'Takvim', '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'],
  ['saat', 'Saat', '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>'],
  ['konum', 'Konum', '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>'],
  ['araba', 'Araba', '<path d="M4 16v-3.5l2-5h12l2 5V16z"/><path d="M4 12.5h16"/><circle cx="7.5" cy="16.5" r="1.8"/><circle cx="16.5" cy="16.5" r="1.8"/>'],
  ['ucak', 'Uçak', '<path d="M10.5 3.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5V9l7 4v2l-7-2v4.5l2 1.5v1.5L12 20l-3.5 1.5V20l2-1.5V13l-7 2v-2l7-4z"/>'],
  ['para', 'Para', '<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.2c-.6-1-1.6-1.5-2.8-1.5-1.6 0-2.8.9-2.8 2.1 0 2.9 5.8 1.6 5.8 4.4 0 1.2-1.3 2.1-3 2.1-1.3 0-2.4-.6-3-1.6M12 6v1.7M12 16.3V18"/>'],
  ['kart', 'Kredi kartı', '<rect x="2.5" y="5.5" width="19" height="13" rx="2"/><path d="M2.5 9.5h19M6 15h4"/>'],
  ['sepet', 'Alışveriş sepeti', '<path d="M3 4h2.5l2.2 10.5h10l2.3-7.5H7"/><circle cx="9.5" cy="19" r="1.4"/><circle cx="16.5" cy="19" r="1.4"/>'],
  ['kilit', 'Kilit', '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>'],
  ['anahtar', 'Anahtar', '<circle cx="8" cy="15" r="4.5"/><path d="m11.2 11.8 8.3-8.3M16.5 6.5l2.5 2.5M14 9l2 2"/>'],
  ['ayar', 'Ayar', '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3"/>'],
  ['arama', 'Arama', '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>'],
  ['yildiz', 'Yıldız', '<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"/>'],
  ['kalp', 'Kalp', '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/>'],
  ['bayrak', 'Bayrak', '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'],
  ['fikir', 'Fikir (ampul)', '<path d="M9 17h6M10 20.5h4M8.5 14a6 6 0 1 1 7 0c-.8.6-1 1.5-1 3h-5c0-1.5-.2-2.4-1-3z"/>'],
  ['hedef', 'Hedef', '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>'],
  ['roket', 'Roket', '<path d="M12 3c3 2 4.5 5.5 4.5 9.5L14.5 16h-5l-2-3.5C7.5 8.5 9 5 12 3z"/><circle cx="12" cy="9.5" r="1.6"/><path d="M9.5 16 8 20l2.5-1.5M14.5 16l1.5 4-2.5-1.5"/>'],
  ['grafik', 'Grafik', '<path d="M4 20V4M4 20h16"/><path d="m7 15 4-4 3 3 5-6"/>'],
  ['pasta', 'Pasta grafik', '<path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5H12z"/><path d="M15 2.8A8.5 8.5 0 0 1 21.2 9H15z"/>'],
  ['belge', 'Belge', '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>'],
  ['klasor', 'Klasör', '<path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4.2l2 2.2h8.8A1.5 1.5 0 0 1 21 8.7V18a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18z"/>'],
  ['kamera', 'Kamera', '<path d="M4 8h3l1.5-2.5h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'],
  ['resim', 'Resim', '<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m4 17 5-4.5 3.5 3 2.5-2 5 3.5"/>'],
  ['muzik', 'Müzik', '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>'],
  ['video', 'Video', '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>'],
  ['mesaj', 'Mesaj', '<path d="M4 5h16v11H9l-5 4z"/>'],
  ['wifi', 'Wi-Fi', '<path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19.2" r=".9"/>'],
  ['onay', 'Onay', '<circle cx="12" cy="12" r="8.5"/><path d="m8 12.5 2.8 2.8L16.5 9.5"/>'],
  ['carpi', 'Çarpı', '<circle cx="12" cy="12" r="8.5"/><path d="m9 9 6 6M15 9l-6 6"/>'],
  ['uyari', 'Uyarı', '<path d="M12 3.5 21.5 20h-19z"/><path d="M12 10v4.5M12 17.5h.01"/>'],
  ['bilgi', 'Bilgi', '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8h.01"/>'],
  ['soru', 'Soru', '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1.1.9-1.1 1.7v.5M12 17h.01"/>'],
  ['yenile', 'Yenile', '<path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v4.5h-4.5"/>'],
  ['indir', 'İndir', '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/>'],
  ['paylas', 'Paylaş', '<circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="m8.2 10.8 7.6-4M8.2 13.2l7.6 4"/>'],
  ['kod', 'Kod', '<path d="m8.5 7-5 5 5 5M15.5 7l5 5-5 5M13.5 4.5l-3 15"/>'],
  ['hata', 'Hata (böcek)', '<rect x="7.5" y="8" width="9" height="12" rx="4.5"/><path d="M9.5 8a2.5 2.5 0 0 1 5 0M3.5 13h4M16.5 13h4M4.5 8.5l3.2 1.8M19.5 8.5l-3.2 1.8M4.5 18.5l3.2-1.8M19.5 18.5l-3.2-1.8M12 11v9"/>'],
  ['kupa', 'Kupa', '<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v3.5M8 20.5h8M9.5 17.5h5"/>'],
  ['hediye', 'Hediye', '<rect x="3.5" y="8.5" width="17" height="4" rx="1"/><path d="M5 12.5V20h14v-7.5M12 8.5V20M12 8.5C10 8.5 7.5 7.5 8 5.5s3.5-.5 4 3M12 8.5c2 0 4.5-1 4-3s-3.5-.5-4 3"/>'],
  ['kitap', 'Kitap', '<path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2z"/><path d="M4 20a2 2 0 0 0 2 2h13v-4"/>'],
  ['kalem', 'Kalem', '<path d="m14.5 4.5 5 5L9 20H4v-5z"/><path d="m12.5 6.5 5 5"/>'],
  ['baglanti', 'Bağlantı', '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'],
  ['oklar', 'Döngü', '<path d="M4 12a8 8 0 0 1 13.7-5.7L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.7 5.7L4 15.5M4 20v-4.5h4.5"/>'],
  ['kalkan', 'Güvenlik', '<path d="M12 3 5 6v5c0 4.4 3 8.4 7 10 4-1.6 7-5.6 7-10V6z"/><path d="m9 12 2 2 4-4"/>'],
  ['dunya', 'Dünya', '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5a13 13 0 0 1 0 17M12 3.5a13 13 0 0 0 0 17"/>']
];
const PSTAMPS = ['👍', '👎', '❤️', '⭐', '✅', '❌', '❓', '❗', '💡', '🔥', '🎉', '😀', '😮', '😢', '🙏', '👏', '🚀', '⚠️', '📌', '🏆', '+1', '👀', '💯', '🤔'];

/* ═════════ Pano 2: ekleme menüleri ═════════ */
const pCenter = () => { const r = stageRect(); return toWorld(r.left + r.width / 2, r.top + r.height / 2); };
function pPlace(list) { pSnap(); P.data.items.push(...list); pSetTool('select'); P.sel = new Set(list.map(i => i.id)); pChanged(); pRender(); }
function pInsertMenu(btn) {
  pPop(btn, `${pItem('img', IC.image, 'Resim')}${pItem('icon', IC.iconsI, 'Simge…')}${pItem('table', IC.tableI, 'Tablo')}${pItem('todo', IC.vote, 'Yapılacaklar listesi')}${pItem('link', IC.linkI, 'Bağlantı kartı…')}
    <div class="ctx-sep"></div>${YEREL ? '' : pItem('notes', IC.noteI, "Notlar'dan…") + pItem('mail', IC.mailI, "Mail'den…")}<div class="ctx-sep"></div>${pItem('tpl', IC.template, 'Şablon…')}`, v => {
    if (v === 'img') pPickImage();
    if (v === 'icon') pIconPicker();
    if (v === 'table') { const c = pCenter(); pPlace([{ id: uid(), t: 'table', x: r1(c.x - 210), y: r1(c.y - 60), cols: [140, 140, 140], cells: [['Başlık 1', 'Başlık 2', 'Başlık 3'], ['', '', ''], ['', '', '']], header: true, fs: 15 }]); }
    if (v === 'todo') pTodoYeni();
    if (v === 'link') pLinkAsk();
    if (v === 'notes') pNotesPicker();
    if (v === 'mail') pMailPicker();
    if (v === 'tpl') pTemplateDialog(true);
  }, 'pside');
}
function pStampMenu(btn) {
  pPop(btn, `<div class="ctx-title">Damga · panoya tıkla</div><div class="pstamps">${PSTAMPS.map(c => `<button type="button" class="pstamp ${P.stamp === c ? 'on' : ''}" data-v="${esc(c)}">${esc(c)}</button>`).join('')}</div>`, v => { P.stamp = v; pSetTool('stamp'); }, 'pside');
}
function pFrameMenu(btn) {
  pPop(btn, `${pItem('frame', IC.frame, 'Çerçeve')}${pItem('section', IC.template, 'Bölüm (renkli başlıklı alan)')}`, v => { P.frameKind = v; pSetTool('frame'); }, 'pside');
}
function pIconPicker() {
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask" style="width:min(560px,100%)"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Simge ekle</h3></header>
    <div class="set-body"><input class="nlink-q" id="pIcQ" placeholder="Simge ara (ör. kişi, bulut, para)" autocomplete="off" style="margin:4px 0 10px;width:100%">
    <div class="picons" id="pIcList"></div></div></div></div>`;
  const draw = () => {
    const k = ($('#pIcQ').value || '').toLocaleLowerCase('tr');
    $('#pIcList').innerHTML = PICONS.filter(([n, l]) => !k || l.toLocaleLowerCase('tr').includes(k) || n.includes(k)).map(([n, l, d]) =>
      `<button type="button" class="picon" data-n="${n}" title="${esc(l)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${d}</svg><span>${esc(l)}</span></button>`).join('') || '<div class="nlink-empty">Bulunamadı</div>';
  };
  $('#pIcQ').addEventListener('input', draw);
  $('#pIcList').addEventListener('click', e => { const b = e.target.closest('[data-n]'); if (!b) return; closeModal(); const c = pCenter(); pPlace([{ id: uid(), t: 'icon', name: b.dataset.n, x: r1(c.x - 32), y: r1(c.y - 32), w: 64, h: 64, color: '#1b1d21' }]); });
  draw(); setTimeout(() => $('#pIcQ')?.focus(), 50);
}
function pLinkCard(url, at) {
  let u; try { u = new URL(url); } catch { return null; }
  if (!/^https?:$/.test(u.protocol)) return null;
  const host = u.hostname.replace(/^www\./, '');
  const path = decodeURIComponent(u.pathname).replace(/\/$/, '').split('/').filter(Boolean).pop() || '';
  const title = path ? path.replace(/[-_]+/g, ' ').replace(/\.[a-z0-9]+$/i, '').slice(0, 80) : host;
  return { id: uid(), t: 'link', url: u.href, host, title: title.charAt(0).toLocaleUpperCase('tr') + title.slice(1), x: r1(at.x - 150), y: r1(at.y - 48), w: 300, h: 96 };
}
async function pLinkAsk() {
  const url = await pAsk('Bağlantı kartı', 'Web adresi', 'https://', 'Ekle'); if (!url) return;
  const card = pLinkCard(url.trim(), pCenter()); if (!card) return toast('Geçerli bir web adresi yaz');
  pPlace([card]); toast('Başlığı değiştirmek için karta çift tıkla');
}

/* ═════════ Hizalama: sürüklerken kılavuz çizgileri ═════════ */
function pSnapMove(d, dx, dy) {
  const moving = [...d.orig.values()].filter(o => o.t !== 'line');
  if (!moving.length) { P.guides = null; return [dx, dy]; }
  const mb = unionBox(moving.map(o => { const b = o.t === 'pen' ? (() => { const tmp = { ...o }; return bboxOf(tmp); })() : bboxOf({ ...o, t: o.t === 'table' ? 'table' : o.t }); return b; }));
  const box = { x: mb.x + dx, y: mb.y + dy, w: mb.w, h: mb.h };
  const tol = 6 / P.V.z, r = stageRect();
  const vw = { x: -P.V.x / P.V.z, y: -P.V.y / P.V.z, w: r.width / P.V.z, h: r.height / P.V.z };
  const others = items().filter(i => !d.ids.has(i.id) && i.t !== 'line').map(bboxOf).filter(b => b.x < vw.x + vw.w && b.x + b.w > vw.x && b.y < vw.y + vw.h && b.y + b.h > vw.y);
  let bx = null, by = null;
  const xs = [box.x, box.x + box.w / 2, box.x + box.w], ys = [box.y, box.y + box.h / 2, box.y + box.h];
  for (const o of others) {
    for (const ox of [o.x, o.x + o.w / 2, o.x + o.w]) for (const mx of xs) { const df = ox - mx; if (Math.abs(df) <= tol && (!bx || Math.abs(df) < Math.abs(bx.df))) bx = { df, x: ox, o }; }
    for (const oy of [o.y, o.y + o.h / 2, o.y + o.h]) for (const my of ys) { const df = oy - my; if (Math.abs(df) <= tol && (!by || Math.abs(df) < Math.abs(by.df))) by = { df, y: oy, o }; }
  }
  const g = [];
  if (bx) { dx += bx.df; const y1 = Math.min(box.y + (by?.df || 0), bx.o.y), y2 = Math.max(box.y + box.h + (by?.df || 0), bx.o.y + bx.o.h); g.push({ x: bx.x, y1: y1 - 10, y2: y2 + 10 }); }
  if (by) { dy += by.df; const x1 = Math.min(box.x + (bx?.df || 0), by.o.x), x2 = Math.max(box.x + box.w + (bx?.df || 0), by.o.x + by.o.w); g.push({ y: by.y, x1: x1 - 10, x2: x2 + 10 }); }
  P.guides = g.length ? g : null;
  return [dx, dy];
}
function pAlignMenu(btn) {
  const L = [['left', 'Sola hizala'], ['hcenter', 'Yatay ortala'], ['right', 'Sağa hizala'], ['top', 'Üste hizala'], ['vcenter', 'Dikey ortala'], ['bottom', 'Alta hizala'], ['hdist', 'Yatay eşit dağıt'], ['vdist', 'Dikey eşit dağıt']];
  pPop(btn, L.map(([v, n]) => pItem(v, '<i></i>', n)).join(''), v => {
    const sel = items().filter(i => P.sel.has(i.id) && i.t !== 'line'); if (sel.length < 2) return;
    const U = unionBox(sel.map(bboxOf));
    const moveTo = (i, nx, ny) => { const b = bboxOf(i), ddx = nx - b.x, ddy = ny - b.y; if (i.t === 'pen') i.pts = i.pts.map((q, j) => r1(q + (j % 2 ? ddy : ddx))); else { i.x = r1(i.x + ddx); i.y = r1(i.y + ddy); } };
    pSnap();
    if (v === 'hdist' || v === 'vdist') {
      const k = v === 'hdist' ? 'x' : 'y', s2 = v === 'hdist' ? 'w' : 'h';
      const list = sel.map(i => ({ i, b: bboxOf(i) })).sort((a, b) => a.b[k] - b.b[k]);
      const total = list.reduce((a, q) => a + q.b[s2], 0), gap = (U[s2] - total) / (list.length - 1);
      let pos = U[k]; for (const q of list) { moveTo(q.i, k === 'x' ? pos : q.b.x, k === 'y' ? pos : q.b.y); pos += q.b[s2] + gap; }
    } else for (const i of sel) {
      const b = bboxOf(i);
      const nx = v === 'left' ? U.x : v === 'right' ? U.x + U.w - b.w : v === 'hcenter' ? U.x + U.w / 2 - b.w / 2 : b.x;
      const ny = v === 'top' ? U.y : v === 'bottom' ? U.y + U.h - b.h : v === 'vcenter' ? U.y + U.h / 2 - b.h / 2 : b.y;
      moveTo(i, nx, ny);
    }
    pChanged(); pRender();
  });
}

/* ═════════ Zihin haritası: Tab alt dal, Enter kardeş dal ═════════ */
const mmLines = it => items().filter(l => l.t === 'line' && l.mm && (l.a.id === it.id || l.b.id === it.id));
const pIsMind = it => it && (it.t === 'shape' || (it.t === 'note' && mmLines(it).length > 0));
function pMindParent(it) { const l = items().find(x => x.t === 'line' && x.mm && x.b.id === it.id); return l ? byId(l.a.id) : null; }
function pMindChild(parent) {
  const kids = items().filter(l => l.t === 'line' && l.mm && l.a.id === parent.id).map(l => byId(l.b.id)).filter(Boolean);
  const gp = pMindParent(parent), pb = bboxOf(parent);
  const dir = gp ? Math.sign((pb.x + pb.w / 2) - (bboxOf(gp).x + bboxOf(gp).w / 2)) || 1 : (kids.filter(k => k.x < pb.x).length < kids.filter(k => k.x >= pb.x).length - 1 ? -1 : 1);
  const w = parent.t === 'note' ? 160 : Math.max(140, Math.min(200, pb.w * 0.85)), h = parent.t === 'note' ? 120 : 56;
  const side = kids.filter(k => Math.sign(k.x - pb.x) === dir);
  const x = dir > 0 ? pb.x + pb.w + 90 : pb.x - 90 - w;
  const y = side.length ? Math.max(...side.map(k => bboxOf(k).y + bboxOf(k).h)) + 18 : pb.y + pb.h / 2 - h / 2;
  const palette = ['#fff1a6', '#ffcadb', '#cbe3ff', '#cdf1cd', '#dfd3ff', '#ffd6ad'];
  const fill = palette[kids.length % palette.length];
  const child = parent.t === 'note' ? { id: uid(), t: 'note', x: r1(x), y: r1(y), w, h, color: parent.color, text: '' }
    : { id: uid(), t: 'shape', kind: 'round', x: r1(x), y: r1(y), w, h, fill: gp ? (parent.fill || '#ffffff') : fill, stroke: 'transparent', text: '', fs: 17 };
  const line = { id: uid(), t: 'line', a: { id: parent.id }, b: { id: child.id }, color: '#9aa1ab', width: 2.5, endB: 'none', endA: 'none', route: 'curve', mm: true };
  pSnap(); P.data.items.push(child, line); P.sel = new Set([child.id]); pRender(); pEditStart(child, true);
}
function pMindSibling(it) { const p = pMindParent(it); if (p) pMindChild(p); }
function pTableNext(it, cell, step) {
  let [r, c] = cell; c += step;
  if (c >= it.cols.length) { c = 0; r++; } if (c < 0) { c = it.cols.length - 1; r--; }
  if (r < 0) return;
  if (r >= it.cells.length) { pSnap(); it.cells.push(it.cols.map(() => '')); pChanged(); }
  pSnap(); pEditStart(it, false, [r, c]);
}

/* ═════════ Şekil tanıma: kalemle çizileni düzgün şekle çevir ═════════ */
function pRDP(pts, eps) {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  let idx = 0, dmax = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i], L = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const d = Math.abs((b.y - a.y) * p.x - (b.x - a.x) * p.y + b.x * a.y - b.y * a.x) / L;
    if (d > dmax) { dmax = d; idx = i; }
  }
  if (dmax <= eps) return [a, b];
  return [...pRDP(pts.slice(0, idx + 1), eps).slice(0, -1), ...pRDP(pts.slice(idx), eps)];
}
function pRecognize(pen) {
  const pts = []; for (let i = 0; i < pen.pts.length; i += 2) pts.push({ x: pen.pts[i], y: pen.pts[i + 1] });
  if (pts.length < 6) return null;
  const b = bboxOf(pen), diag = Math.hypot(b.w, b.h);
  if (diag < 30) return null;
  const first = pts[0], last = pts[pts.length - 1], closed = Math.hypot(first.x - last.x, first.y - last.y) < diag * 0.22;
  const style = { stroke: pen.color, sw: Math.max(2, Math.min(4, pen.width)) };
  if (!closed) {
    const simp = pRDP(pts, diag * 0.06);
    if (simp.length === 2) return { id: uid(), t: 'line', a: { x: r1(first.x), y: r1(first.y) }, b: { x: r1(last.x), y: r1(last.y) }, color: pen.color, width: style.sw, endB: 'none', endA: 'none' };
    // ok gibi: düz çizgi + uçta kısa kanca
    if (simp.length >= 3 && simp.length <= 4) {
      const main = Math.hypot(simp[1].x - simp[0].x, simp[1].y - simp[0].y), rest = Math.hypot(last.x - simp[1].x, last.y - simp[1].y);
      if (rest < main * 0.35) return { id: uid(), t: 'line', a: { x: r1(simp[0].x), y: r1(simp[0].y) }, b: { x: r1(simp[1].x), y: r1(simp[1].y) }, color: pen.color, width: style.sw, endB: 'arrow', endA: 'none' };
    }
    return null;
  }
  let area = 0, per = 0;
  for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; area += p.x * q.y - q.x * p.y; per += Math.hypot(q.x - p.x, q.y - p.y); }
  area = Math.abs(area) / 2;
  const circ = 4 * Math.PI * area / (per * per);
  const simp = pRDP([...pts, first], diag * 0.09); const corners = simp.length - 1;
  const base = { id: uid(), t: 'shape', x: r1(b.x), y: r1(b.y), w: r1(b.w), h: r1(b.h), fill: 'none', stroke: style.stroke, sw: style.sw, text: '' };
  if (corners === 3) return { ...base, kind: 'tri' };
  if (corners === 4 && circ < 0.86) {
    const mids = [[b.x + b.w / 2, b.y], [b.x + b.w, b.y + b.h / 2], [b.x + b.w / 2, b.y + b.h], [b.x, b.y + b.h / 2]];
    const nearMid = simp.slice(0, 4).filter(p => mids.some(([mx, my]) => Math.hypot(p.x - mx, p.y - my) < diag * 0.18)).length;
    return { ...base, kind: nearMid >= 3 ? 'diamond' : 'rect' };
  }
  if (circ > 0.72) return { ...base, kind: 'ellipse' };
  if (corners >= 4 && corners <= 6 && circ > 0.55) return { ...base, kind: 'rect' };
  return null;
}

/* ═════════ Sunum: çerçeveler slayt gibi ═════════ */
const PRES = { on: false, list: [], i: 0, view: null };
function pPresent() {
  const frames = items().filter(i => i.t === 'frame');
  if (!frames.length) return toast('Sunum için önce çerçeve ekle (F). Her çerçeve bir slayt olur.');
  // sıra: yukarıdan aşağı satırlar, satır içinde soldan sağa
  frames.sort((a, b) => Math.abs(a.y - b.y) > 120 ? a.y - b.y : a.x - b.x);
  pEditEnd(); P.sel.clear(); pRenderOverlay();
  Object.assign(PRES, { on: true, list: frames.map(f => f.id), i: 0, view: { ...P.V }, laser: false });
  $('#pShell').classList.add('presenting');
  PRES.laserEl = document.createElement('div'); PRES.laserEl.className = 'plaser'; PRES.laserEl.hidden = true; document.body.appendChild(PRES.laserEl);
  PRES.onMove = e => { if (PRES.laser && PRES.laserEl) { PRES.laserEl.hidden = false; PRES.laserEl.style.left = e.clientX + 'px'; PRES.laserEl.style.top = e.clientY + 'px'; } };
  window.addEventListener('pointermove', PRES.onMove);
  try { document.documentElement.requestFullscreen?.(); } catch {}
  setTimeout(() => pPresGo(0), 120);
}
function pPresGo(i) {
  PRES.i = Math.max(0, Math.min(PRES.list.length - 1, i));
  const id = PRES.list[PRES.i], f = byId(id); if (!f) return;
  pFit(true, new Set([id]));
  const el = $('#pPres'); el.hidden = false;
  const laserIc = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2 2M16.4 16.4l2 2M18.4 5.6l-2 2M7.6 16.4l-2 2"/></svg>';
  el.innerHTML = `<button type="button" class="icon-btn" data-pres="prev" ${PRES.i ? '' : 'disabled'}>${IC.chevL || '‹'}</button><span>${esc(f.title || '')} · ${PRES.i + 1}/${PRES.list.length}</span><button type="button" class="icon-btn" data-pres="next" ${PRES.i < PRES.list.length - 1 ? '' : 'disabled'}>${IC.chevR || '›'}</button><button type="button" class="icon-btn ${PRES.laser ? 'on' : ''}" data-pres="laser" title="Lazer işaretçi (L)">${laserIc}</button><button type="button" class="icon-btn" data-pres="end" title="Bitir (Esc)">${IC.close}</button>`;
  el.onclick = e => { const b = e.target.closest('[data-pres]'); if (!b) return; const a = b.dataset.pres; if (a === 'prev') pPresGo(PRES.i - 1); if (a === 'next') pPresGo(PRES.i + 1); if (a === 'laser') pLaserToggle(); if (a === 'end') pPresEnd(); };
}
function pLaserToggle() {
  PRES.laser = !PRES.laser;
  if (!PRES.laser && PRES.laserEl) PRES.laserEl.hidden = true;
  pPresGo(PRES.i);
}
function pPresEnd() {
  if (!PRES.on) return;
  PRES.on = false; $('#pShell')?.classList.remove('presenting'); $('#pPres').hidden = true;
  if (PRES.onMove) { window.removeEventListener('pointermove', PRES.onMove); PRES.onMove = null; }
  PRES.laserEl?.remove(); PRES.laserEl = null; PRES.laser = false;
  if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  if (PRES.view) { P.V = PRES.view; pApplyView(); pRenderOverlay(); }
}
document.addEventListener('keydown', e => {
  if (!PRES.on) return;
  if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); e.stopImmediatePropagation(); pPresGo(PRES.i + 1); }
  else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); e.stopImmediatePropagation(); pPresGo(PRES.i - 1); }
  else if (e.key === 'l' || e.key === 'L') { e.preventDefault(); e.stopImmediatePropagation(); pLaserToggle(); }
  else if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); pPresEnd(); }
}, true);
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && PRES.on) pPresEnd(); });

/* ═════════ Yorumlar ═════════ */
function pComments(it) {
  if (!it) return;
  const draw = () => {
    const list = it.comments || [];
    $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask pcm"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Yorumlar</h3></header>
      <div class="set-body">
        <div class="pcm-list">${list.map(c => `<div class="pcm-item"><div class="pcm-h"><b>${esc((c.who || '').replace(/@.*/, '') || 'Ben')}</b><span>${esc(fmtDate(c.t, true))}</span><button type="button" class="icon-btn" data-del="${esc(c.id)}" title="Sil">${IC.trash}</button></div><div class="pcm-t">${esc(c.text)}</div></div>`).join('') || '<p class="muted sm">Henüz yorum yok.</p>'}</div>
        <form id="pCmForm" class="pcm-form"><textarea id="pCmIn" rows="2" placeholder="Yorum yaz…"></textarea><button class="btn primary">Ekle</button></form>
      </div></div></div>`;
    $('#pCmForm').addEventListener('submit', e => { e.preventDefault(); const t = $('#pCmIn').value.trim(); if (!t) return; pSnap(); (it.comments = it.comments || []).push({ id: uid(), who: S.email || '', t: Date.now(), text: t.slice(0, 2000) }); pChanged(); pRender(); draw(); });
    $('#pCmIn').addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) $('#pCmForm').requestSubmit(); });
    $('#modal').querySelectorAll('[data-del]').forEach(b => b.onclick = () => { pSnap(); it.comments = it.comments.filter(c => c.id !== b.dataset.del); if (!it.comments.length) delete it.comments; pChanged(); pRender(); draw(); });
    setTimeout(() => $('#pCmIn')?.focus(), 40);
  };
  draw();
}

/* ═════════ Nokta oylaması ═════════ */
function pVoting(on) {
  P.voting = on;
  if (on) { pSetTool('select'); P.sel.clear(); pRenderOverlay(); }
  pVoteBanner();
}
function pVoteBanner() {
  const el = $('#pBanner'); if (!el) return;
  if (!P.voting) { el.hidden = true; return; }
  const top = items().filter(i => i.votes).sort((a, b) => b.votes - a.votes).slice(0, 3);
  const name = i => (i.text || i.title || i.ch || ({ image: 'Resim', icon: 'Simge', pen: 'Çizim' }[i.t]) || '').split('\n')[0].slice(0, 24);
  el.hidden = false;
  el.innerHTML = `<b>Oylama</b><span>Fikirlere tıklayarak oy ver · Shift ile geri al</span>${top.length ? `<span class="pv-top">${top.map(i => `${esc(name(i))} <i>${i.votes}</i>`).join(' · ')}</span>` : ''}
    <button type="button" class="btn sm" data-vote="reset">Sıfırla</button><button type="button" class="btn sm primary" data-vote="end">Bitir</button>`;
  el.onclick = e => { const b = e.target.closest('[data-vote]'); if (!b) return; if (b.dataset.vote === 'end') pVoting(false); else { pSnap(); items().forEach(i => delete i.votes); pChanged(); pRender(); pVoteBanner(); } };
}

/* ═════════ Zamanlayıcı ═════════ */
const TMR = { end: 0, left: 0, total: 0, run: false, t: 0 };
function pTimerMenu(btn) {
  const tmrOnay = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 2"/><circle cx="12" cy="13" r="8"/><path d="M9 2h6"/></svg>';
  pPop(btn, `<div class="ctx-title">Zamanlayıcı</div>${pItem('m25', tmrOnay, 'Pomodoro (25 dk)')}${pItem('m5', tmrOnay, 'Kısa mola (5 dk)')}<div class="ctx-sep"></div>${[1, 3, 10, 15, 30].map(m => pItem('m' + m, '<i></i>', `${m} dakika`)).join('')}${pItem('custom', '<i></i>', 'Başka…')}${TMR.total ? pItem('stop', IC.close, 'Durdur') : ''}`, async v => {
    if (v === 'stop') return pTimerStop();
    let m = +v.slice(1);
    if (v === 'custom') { const a = await pAsk('Zamanlayıcı', 'Kaç dakika?', '7', 'Başlat'); m = parseFloat(String(a || '').replace(',', '.')); if (!(m > 0)) return; }
    pTimerStart(Math.min(180, m) * 60e3);
  });
}
function pTimerStart(ms) { Object.assign(TMR, { total: ms, left: ms, end: Date.now() + ms, run: true }); clearInterval(TMR.t); TMR.t = setInterval(pTimerTick, 250); pTimerTick(); }
function pTimerStop() { clearInterval(TMR.t); Object.assign(TMR, { total: 0, run: false }); const el = $('#pTimer'); if (el) el.hidden = true; }
function pTimerTick() {
  const el = $('#pTimer'); if (!el) return;
  if (TMR.run) TMR.left = Math.max(0, TMR.end - Date.now());
  const s = Math.ceil(TMR.left / 1000), mm = Math.floor(s / 60), ss = s % 60;
  el.hidden = false; el.classList.toggle('done', TMR.left <= 0); el.classList.toggle('low', TMR.left > 0 && TMR.left < 10e3);
  el.innerHTML = `<span class="pt-time">${mm}:${String(ss).padStart(2, '0')}</span><i style="--p:${(1 - TMR.left / TMR.total) * 100}%"></i>
    <button type="button" class="icon-btn" data-tm="pause" title="${TMR.run ? 'Duraklat' : 'Devam'}">${TMR.run ? '❚❚' : '▶'}</button><button type="button" class="icon-btn" data-tm="plus" title="+1 dakika">+1</button><button type="button" class="icon-btn" data-tm="stop" title="Kapat">${IC.close}</button>`;
  el.onclick = e => { const b = e.target.closest('[data-tm]'); if (!b) return; const a = b.dataset.tm;
    if (a === 'stop') return pTimerStop();
    if (a === 'plus') { TMR.left += 60e3; TMR.total += 60e3; TMR.end = Date.now() + TMR.left; if (!TMR.run && TMR.left > 0) { TMR.run = true; } }
    if (a === 'pause') { if (TMR.run) { TMR.run = false; } else if (TMR.left > 0) { TMR.run = true; TMR.end = Date.now() + TMR.left; } }
    pTimerTick(); };
  if (TMR.run && TMR.left <= 0) { TMR.run = false; pBeep(); toast('Süre doldu ⏰'); }
}
function pBeep() {
  try { const ac = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.35, 0.7].forEach(t => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = 880; o.connect(g); g.connect(ac.destination); g.gain.setValueAtTime(0.0001, ac.currentTime + t); g.gain.exponentialRampToValueAtTime(0.3, ac.currentTime + t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + t + 0.25); o.start(ac.currentTime + t); o.stop(ac.currentTime + t + 0.3); });
  } catch {}
}

/* ═════════ Mini harita ═════════ */
let pMiniRaf = 0;
function pMiniSoon() { if (pMiniRaf) return; pMiniRaf = requestAnimationFrame(() => { pMiniRaf = 0; pMini(); }); }
function pMini() {
  const box = $('#pMini'), svg = $('#pMiniSvg'); if (!box || !svg) return;
  const list = items();
  if (!P.mini || !list.length || PRES.on) { box.hidden = true; return; }
  box.hidden = false;
  const r = stageRect(), vw = { x: -P.V.x / P.V.z, y: -P.V.y / P.V.z, w: r.width / P.V.z, h: r.height / P.V.z };
  const U = unionBox([...list.map(bboxOf), vw]), pad = Math.max(U.w, U.h) * 0.04;
  const vb = { x: U.x - pad, y: U.y - pad, w: U.w + pad * 2, h: U.h + pad * 2 };
  svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
  const col = i => i.t === 'note' ? noteFill(i.color) : i.t === 'frame' ? (i.fill || '#fff') : i.t === 'shape' ? (i.fill && i.fill !== 'none' ? i.fill : '#d5d9df') : '#c4c9d0';
  svg.innerHTML = drawOrder(list).filter(i => i.t !== 'line').map(i => { const b = bboxOf(i); return `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="${col(i)}" stroke="#aab0b8" stroke-width="${vb.w / 300}"/>`; }).join('')
    + `<rect x="${vw.x}" y="${vw.y}" width="${vw.w}" height="${vw.h}" fill="#4262ff" fill-opacity=".08" stroke="#4262ff" stroke-width="${vb.w / 120}" rx="${vb.w / 150}"/>`;
  box._vb = vb;
  if (!box._bound) {
    box._bound = true;
    const go = e => { const rr = svg.getBoundingClientRect(), v = box._vb; const k = Math.min(rr.width / v.w, rr.height / v.h); const ox = rr.left + (rr.width - v.w * k) / 2, oy = rr.top + (rr.height - v.h * k) / 2;
      const wx = v.x + (e.clientX - ox) / k, wy = v.y + (e.clientY - oy) / k, sr = stageRect();
      P.V.x = sr.width / 2 - wx * P.V.z; P.V.y = sr.height / 2 - wy * P.V.z; pApplyView(); pRenderOverlay(); };
    box.addEventListener('pointerdown', e => { e.stopPropagation(); box.setPointerCapture(e.pointerId); box._drag = true; go(e); });
    box.addEventListener('pointermove', e => { if (box._drag) go(e); });
    box.addEventListener('pointerup', () => { box._drag = false; });
  }
}

/* ═════════ Suha bağlantıları: Notlar, Mail, Takvim ═════════
   Pano normalde sadece Drive izni ister. Notlar/Mail/Takvim ilk kullanıldığında ek izin istenir;
   Mail'i kullanan biri bu izni zaten verdiği için Google genelde tekrar sormaz. */
const SC_GMAIL = 'https://www.googleapis.com/auth/gmail.modify', SC_CAL = 'https://www.googleapis.com/auth/calendar.events';
async function pNeed(scope, act) {
  if (DEMO) return true;
  const t = store.get('auth');
  if (t && (' ' + (t.scope || '') + ' ').includes(' ' + scope + ' ')) return true;
  if (!confirm(scope === SC_CAL ? 'Takvim\'e eklemek için Google Takvim izni gerekiyor. Google\'a yönlendirileceksin; panon kaydedildi.' : 'Bunun için Gmail izni gerekiyor (Notlar ve Mail Gmail\'de durur). Google\'a yönlendirileceksin; panon kaydedildi.')) return false;
  if (P.dirty) await pSave();
  try { sessionStorage.setItem('pIntent', JSON.stringify({ board: P.board?.id, act })); } catch {}
  window.APP_SCOPES = 'openid email https://www.googleapis.com/auth/drive.file ' + scope;
  Auth.login(false);
  return false;
}
async function pIntentRun() {
  let it = null; try { it = JSON.parse(sessionStorage.getItem('pIntent') || 'null'); sessionStorage.removeItem('pIntent'); } catch {}
  if (!it?.board || !P.boards.some(b => b.id === it.board)) return false;
  await pOpen(it.board);
  setTimeout(() => { if (it.act === 'notes') pNotesPicker(); if (it.act === 'mail') pMailPicker(); if (it.act === 'tonote') toast('İzin verildi; Notlar\'a göndermek için seçip tekrar dene'); if (it.act === 'tocal') toast('İzin verildi; Takvim\'e eklemek için notları seçip tekrar dene'); }, 400);
  return true;
}
const GAPI = 'https://gmail.googleapis.com/gmail/v1/users/me/';
async function gCall(path, opt = {}) { return call(GAPI + path, opt); }

// Notlar'dan ekle
const DEMO_NOTES = [{ id: 'dn1', uuid: 'UT', title: 'Tatil fikirleri', snippet: 'Kaş, Kalkan, Bozcaada. Haziran başı uygun.' }, { id: 'dn2', uuid: 'U2', title: 'Alışveriş listesi', snippet: '☐ Süt ☑ Yumurta ☐ Kahve' }, { id: 'dn3', uuid: 'U3', title: 'Toplantı notları', snippet: 'Teslim tarihi 30 Ekim. Tasarım onayı, test, yayın.' }];
async function pNotesPicker() {
  if (!(await pNeed(SC_GMAIL, 'notes'))) return;
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask" style="width:min(560px,100%)"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Notlar'dan ekle</h3></header>
    <div class="set-body"><input class="nlink-q" id="pNq" placeholder="Notlarda ara" autocomplete="off" style="width:100%;margin:4px 0 8px"><div class="ppick" id="pNl"><div class="list-msg">Yükleniyor…</div></div>
    <div class="sticky-actions"><span class="muted sm" id="pNc"></span><button class="btn primary" id="pNadd" disabled>Panoya ekle</button></div></div></div></div>`;
  let notes = [];
  try {
    if (DEMO) notes = DEMO_NOTES;
    else {
      const { labels = [] } = await gCall('labels');
      const root = labels.find(l => l.type === 'user' && /^(notes|notlar)$/i.test(l.name));
      const ls = root ? labels.filter(l => l.id === root.id || l.name.startsWith(root.name + '/')) : [];
      const ids = (await Promise.all(ls.map(l => gCall('messages', { query: { labelIds: [l.id], maxResults: 100 } }).then(r => r.messages || []).catch(() => [])))).flat();
      const ms = await pmap(ids.slice(0, 200), 6, m => gCall('messages/' + m.id, { query: { format: 'metadata', metadataHeaders: ['Subject', 'X-Universally-Unique-Identifier'] } }).catch(() => null));
      notes = ms.filter(Boolean).map(m => ({ id: m.id, uuid: hdr(m, 'X-Universally-Unique-Identifier'), title: hdr(m, 'Subject'), snippet: fixMojibake(decodeEntities(m.snippet || '')), date: +m.internalDate })).sort((a, b) => b.date - a.date);
    }
  } catch (e) { if (!(e instanceof AuthError)) $('#pNl').innerHTML = `<div class="list-msg">Notlar yüklenemedi: ${esc(e.message)}</div>`; return; }
  const pick = new Set();
  const draw = () => {
    const k = ($('#pNq').value || '').toLocaleLowerCase('tr');
    $('#pNl').innerHTML = notes.filter(n => !k || (n.title + ' ' + n.snippet).toLocaleLowerCase('tr').includes(k)).map(n => `<label class="ppick-row"><input type="checkbox" data-id="${esc(n.id)}" ${pick.has(n.id) ? 'checked' : ''}><div><b>${esc(n.title || 'Not')}</b><span>${esc(n.snippet.slice(0, 120))}</span></div></label>`).join('') || '<div class="list-msg">Not bulunamadı</div>';
    $('#pNc').textContent = pick.size ? `${pick.size} not seçildi` : ''; $('#pNadd').disabled = !pick.size;
  };
  $('#pNq').addEventListener('input', draw);
  $('#pNl').addEventListener('change', e => { const c = e.target.closest('[data-id]'); if (!c) return; c.checked ? pick.add(c.dataset.id) : pick.delete(c.dataset.id); $('#pNc').textContent = pick.size ? `${pick.size} not seçildi` : ''; $('#pNadd').disabled = !pick.size; });
  $('#pNadd').onclick = async () => {
    $('#pNadd').disabled = true;
    const chosen = notes.filter(n => pick.has(n.id));
    const full = await pmap(chosen, 4, async n => {
      if (DEMO) return { ...n, body: n.snippet };
      try { const m = await gCall('messages/' + n.id, { query: { format: 'full' } }); const pm = parseMessage(m); return { ...n, body: htmlToText(pm.html || '') || pm.text || n.snippet }; } catch { return { ...n, body: n.snippet }; }
    });
    const c = pCenter(), cols = Math.ceil(Math.sqrt(full.length));
    const made = full.map((n, i) => ({ id: uid(), t: 'note', x: r1(c.x - cols * 125 + (i % cols) * 250), y: r1(c.y - 110 + Math.floor(i / cols) * 250), w: 230, h: 230, color: 'sari', align: 'left', fs: 16,
      text: ((n.title ? n.title + '\n' : '') + n.body.replace(/\n{2,}/g, '\n').trim()).slice(0, 420), ref: { kind: 'not', uuid: n.uuid } }));
    closeModal(); pPlace(made); toast(`${made.length} not panoya eklendi`);
  };
  draw(); setTimeout(() => $('#pNq')?.focus(), 50);
}
// Notlar'a gönder: seçilen yazılar tek bir not olur
async function pToNotes(sel) {
  const texts = sel.filter(i => /^(note|text|shape)$/.test(i.t) && (i.text || '').trim()).sort((a, b) => bboxOf(a).y - bboxOf(b).y || bboxOf(a).x - bboxOf(b).x).map(i => i.text.trim());
  if (!texts.length) return;
  if (!(await pNeed(SC_GMAIL, 'tonote'))) return;
  const title = `${P.board.title} · ${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}`;
  const html = `<ul>${texts.map(t => `<li>${esc(t).replace(/\n/g, '<br>')}</li>`).join('')}</ul><div><i>Pano'dan: ${esc(P.board.title)}</i></div>`;
  if (DEMO) return toast(`"${title}" notu Notlar'a gönderildi (demo)`);
  try {
    const { labels = [] } = await gCall('labels');
    let root = labels.find(l => l.type === 'user' && /^(notes|notlar)$/i.test(l.name));
    if (!root) root = await gCall('labels', { method: 'POST', body: { name: 'Notes', labelListVisibility: 'labelShow', messageListVisibility: 'show' } });
    const n = { title, html, uuid: (crypto.randomUUID ? crypto.randomUUID() : rnd()).toUpperCase(), created: new Date().toUTCString().replace('GMT', '+0000') };
    await gCall('messages', { method: 'POST', query: { internalDateSource: 'dateHeader' }, body: { raw: buildNoteRaw(n).raw, labelIds: [root.id] } });
    toast(`${texts.length} madde Notlar'a gönderildi`, [['Notlar\'da aç', () => window.open('notlar.html', '_blank', 'noopener')]], 5000);
  } catch (e) { if (!(e instanceof AuthError)) toast('Gönderilemedi: ' + e.message); }
}
// Mail'den ekle
async function pMailPicker() {
  if (!(await pNeed(SC_GMAIL, 'mail'))) return;
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask" style="width:min(600px,100%)"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Mail'den ekle</h3></header>
    <div class="set-body"><form id="pMf"><input class="nlink-q" id="pMq" placeholder="Maillerde ara (ör. kargo, from:ali)" autocomplete="off" style="width:100%;margin:4px 0 8px"></form><div class="ppick" id="pMl"><div class="list-msg">Yükleniyor…</div></div>
    <div class="sticky-actions"><span class="muted sm" id="pMc"></span><button class="btn primary" id="pMadd" disabled>Panoya ekle</button></div></div></div></div>`;
  let mails = []; const pick = new Set();
  const load = async q => {
    $('#pMl').innerHTML = '<div class="list-msg">Yükleniyor…</div>';
    try {
      if (DEMO) mails = [{ id: 'm1', threadId: 'm1', subject: 'Siparişin kargoya verildi', from: 'Trendyol', date: Date.now() - 3600e3, snippet: 'Takip numarası 1234567890. Tahmini teslim 2 gün.' }, { id: 'm2', threadId: 'm2', subject: 'Toplantı daveti: Proje', from: 'Ali Veli', date: Date.now() - 864e5, snippet: 'Perşembe 14:00 Zoom üzerinden görüşelim.' }].filter(m => !q || (m.subject + m.snippet).toLocaleLowerCase('tr').includes(q.toLocaleLowerCase('tr')));
      else {
        const r = await gCall('messages', { query: { q: q || 'in:inbox', maxResults: 25 } });
        const ms = await pmap(r.messages || [], 6, m => gCall('messages/' + m.id, { query: { format: 'metadata', metadataHeaders: ['From', 'Subject'] } }).catch(() => null));
        mails = ms.filter(Boolean).map(m => { const f = parseAddress(hdr(m, 'From')); return { id: m.id, threadId: m.threadId, subject: hdr(m, 'Subject') || '(konu yok)', from: f.name || f.email, date: +m.internalDate, snippet: fixMojibake(decodeEntities(m.snippet || '')) }; });
      }
      $('#pMl').innerHTML = mails.map(m => `<label class="ppick-row"><input type="checkbox" data-id="${esc(m.id)}" ${pick.has(m.id) ? 'checked' : ''}><div><b>${esc(m.subject)}</b><span>${esc(m.from)} · ${esc(fmtDate(m.date))} — ${esc(m.snippet.slice(0, 90))}</span></div></label>`).join('') || '<div class="list-msg">Mail bulunamadı</div>';
    } catch (e) { if (!(e instanceof AuthError)) $('#pMl').innerHTML = `<div class="list-msg">Yüklenemedi: ${esc(e.message)}</div>`; }
  };
  $('#pMf').addEventListener('submit', e => { e.preventDefault(); load($('#pMq').value.trim()); });
  $('#pMl').addEventListener('change', e => { const c = e.target.closest('[data-id]'); if (!c) return; c.checked ? pick.add(c.dataset.id) : pick.delete(c.dataset.id); $('#pMc').textContent = pick.size ? `${pick.size} mail seçildi` : ''; $('#pMadd').disabled = !pick.size; });
  $('#pMadd').onclick = () => {
    const chosen = mails.filter(m => pick.has(m.id)); const c = pCenter();
    const made = chosen.map((m, i) => ({ id: uid(), t: 'mail', title: m.subject, from: m.from, date: m.date, snippet: m.snippet, msgId: m.id, threadId: m.threadId, x: r1(c.x - 160 + (i % 3) * 340 - (Math.min(3, chosen.length) - 1) * 170), y: r1(c.y - 70 + Math.floor(i / 3) * 170), w: 320, h: 140 }));
    closeModal(); pPlace(made); toast(`${made.length} mail kartı eklendi · çift tıklayınca Gmail'de açılır`);
  };
  load(''); setTimeout(() => $('#pMq')?.focus(), 50);
}
// Takvim'e ekle: haftalık plandaki gün çerçevesine göre tarih önerilir
const WEEKDAYS = { pazartesi: 1, salı: 2, sali: 2, çarşamba: 3, carsamba: 3, perşembe: 4, persembe: 4, cuma: 5, cumartesi: 6, pazar: 0 };
function pDayOf(note) {
  const b = bboxOf(note);
  const f = items().find(i => i.t === 'frame' && inside(b, i) && WEEKDAYS[(i.title || '').trim().toLocaleLowerCase('tr')] != null);
  return f ? WEEKDAYS[f.title.trim().toLocaleLowerCase('tr')] : null;
}
async function pToCalendar(notes) {
  notes = notes.filter(n => (n.text || '').trim());
  if (!notes.length) return toast('Takvim\'e eklemek için notun yazısı olmalı');
  if (!(await pNeed(SC_CAL, 'tocal'))) return;
  const pad = x => String(x).padStart(2, '0'), ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const week0 = off => { const d = new Date(); d.setHours(0, 0, 0, 0); const k = (d.getDay() + 6) % 7; d.setDate(d.getDate() - k + off * 7); return d; };
  const anyDay = notes.some(n => pDayOf(n) != null);
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Takvim'e ekle</h3></header>
    <form class="set-body" id="pCalF">
      <p class="muted sm">${notes.length} not Google Takvim'ine etkinlik olarak eklenecek.${anyDay ? ' Gün çerçevesindeki notlar o günün tarihine konur.' : ''}</p>
      ${anyDay ? `<label class="nask-l">Hafta<select id="pCalW"><option value="0">Bu hafta</option><option value="1">Gelecek hafta</option></select></label>` : `<label class="nask-l">Tarih<input type="date" id="pCalD" value="${ymd(new Date(Date.now() + 864e5))}"></label>`}
      <label class="nask-l">Saat<input type="time" id="pCalT" value="09:00"></label>
      <label class="nask-l">Süre<select id="pCalL"><option value="30">30 dakika</option><option value="60" selected>1 saat</option><option value="120">2 saat</option><option value="0">Tüm gün</option></select></label>
      <div class="sticky-actions"><button type="button" class="btn" data-action="close-modal">Vazgeç</button><button class="btn primary">${IC.cal}Ekle</button></div>
    </form></div></div>`;
  $('#pCalF').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = e.submitter || $('#pCalF .btn.primary'); btn.disabled = true;
    const [hh, mi] = ($('#pCalT').value || '09:00').split(':').map(Number), dur = +$('#pCalL').value, tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let ok = 0; pSnap();
    for (const n of notes) {
      let d;
      const wd = pDayOf(n);
      if (anyDay && wd != null) { d = week0(+$('#pCalW').value); d.setDate(d.getDate() + ((wd + 6) % 7)); }
      else if (anyDay) { d = new Date(); d.setDate(d.getDate() + 1); d.setHours(0, 0, 0, 0); }
      else { d = new Date($('#pCalD').value + 'T00:00'); }
      const lines = n.text.trim().split('\n'), summary = lines[0].slice(0, 120), description = lines.slice(1).join('\n') + `\n\n— Pano: ${P.board.title}`;
      const ev = dur ? { summary, description, start: { dateTime: new Date(d.getFullYear(), d.getMonth(), d.getDate(), hh, mi).toISOString(), timeZone: tz }, end: { dateTime: new Date(d.getFullYear(), d.getMonth(), d.getDate(), hh, mi + dur).toISOString(), timeZone: tz } }
        : { summary, description, start: { date: ymd(d) }, end: { date: ymd(new Date(d.getTime() + 864e5)) } };
      try { const r = DEMO ? { id: 'ev' + uid() } : await call('https://www.googleapis.com/calendar/v3/calendars/primary/events', { method: 'POST', body: ev }); n.cal = r.id; ok++; }
      catch (err) { if (err instanceof AuthError) return; }
    }
    closeModal(); pChanged(); pRender();
    toast(ok === notes.length ? `${ok} not Takvim'e eklendi` : `${ok}/${notes.length} not eklendi`);
  });
}

/* Cihazda saklama modunda Google girişi hiç istenmez */
if (YEREL) {
  document.removeEventListener('DOMContentLoaded', boot);
  const basla = () => { if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {}); start(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', basla); else basla();
}
