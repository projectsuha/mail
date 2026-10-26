/* ───────────── Borsa ─────────────
   Piyasa özeti, izleme listeleri, hisse sayfası (grafik, göstergeler, temettü, haber), portföy ve gerçek getiri,
   karşılaştırma, hisse tarama ve fiyat alarmları. Fiyatlar 15-20 dakika gecikmelidir; uygulama alım-satım yapmaz
   ve yatırım tavsiyesi vermez. Kişisel veriler (liste, portföy, alarm) kullanıcının kendi Google Drive'ında durur. */
'use strict';

window.APP_NAME = 'Borsa';
window.APP_ICON = 'borsa-apple.png?v=8';
window.APP_LEAD = 'Hisselerini, döviz ve altını takip et; portföyünün gerçek getirisini gör. Verilerin kendi Google Drive\'ında saklanır.';
window.AUTH_STATE_PREFIX = 'brs-';
window.APP_SCOPES = 'openid email https://www.googleapis.com/auth/drive.file';
window.APP_NEED_SCOPE = 'https://www.googleapis.com/auth/drive.file';
window.APP_NEED_TEXT = 'Google Drive iznini vermedin. İzleme listelerin ve portföyün kendi Drive\'ında saklanır; program sadece kendi oluşturduğu dosyalara erişebilir. Tekrar girişte kutuyu işaretli bırak.';
Auth.redirectUri = () => location.origin + location.pathname.replace(/[^/]*$/, '');

const BSVG = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
Object.assign(IC, {
  borsa: BSVG('<path d="M4 19.5h16"/><path d="m4.5 15 4.5-4.5 3.5 3L19.5 6"/><path d="M15 6h4.5v4.5"/>'),
  pulse: BSVG('<path d="M3 12h4l2.5-6 4 12 2.5-6H21"/>'),
  listI: BSVG('<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.8" cy="6.5" r="1" fill="currentColor"/><circle cx="4.8" cy="12" r="1" fill="currentColor"/><circle cx="4.8" cy="17.5" r="1" fill="currentColor"/>'),
  wallet: BSVG('<path d="M4 7.5V18a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-3"/><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H17v2.5"/><path d="M4 7.5h15a1 1 0 0 1 1 1V12"/><path d="M15.5 12H21v4h-5.5a2 2 0 0 1 0-4z"/>'),
  compare: BSVG('<path d="M4 18 9 11l4 3 7-9"/><path d="M4 13l5-3 4 5 7-4" stroke-dasharray="2 2.5"/>'),
  scan: BSVG('<path d="M4 5h16l-6 7.5V19l-4-2v-4.5z"/>'),
  bell: BSVG('<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>'),
  bellOn: BSVG('<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z" fill="currentColor" fill-opacity=".2"/><path d="M10 20.5a2 2 0 0 0 4 0M3 7.5a9 9 0 0 1 2.5-4M21 7.5a9 9 0 0 0-2.5-4"/>'),
  star: BSVG('<path d="m12 3.8 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5 2.7.9-5.6-4-3.9 5.6-.8z"/>'),
  starOn: BSVG('<path d="m12 3.8 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5 2.7.9-5.6-4-3.9 5.6-.8z" fill="currentColor"/>'),
  eye: BSVG('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>'),
  eyeOff: BSVG('<path d="M4 4l16 16M10.6 6a9.8 9.8 0 0 1 1.4-.1C18 5.9 21.5 12 21.5 12a17 17 0 0 1-2.6 3.4M6.6 7.2C4 9 2.5 12 2.5 12S6 18.5 12 18.5a9 9 0 0 0 4.4-1.1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>'),
  refresh: BSVG('<path d="M20 11a8 8 0 0 0-14.3-4.6L4 8.5"/><path d="M4 4v4.5h4.5"/><path d="M4 13a8 8 0 0 0 14.3 4.6L20 15.5"/><path d="M20 20v-4.5h-4.5"/>'),
  news: BSVG('<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M7 8.5h6M7 12h10M7 15.5h10"/>'),
  noteI: BSVG('<path d="M6 3h9l4 4v14H6z"/><path d="M9.5 11h6M9.5 14.5h6M9.5 18h3.5"/>'),
  cal: BSVG('<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
  copy: BSVG('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>'),
  more: BSVG('<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>'),
  pen: BSVG('<path d="m14.5 4.5 5 5L9 20H4v-5z"/>'),
  download: BSVG('<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M5 19h14"/>'),
  upload: BSVG('<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5"/><path d="M5 19h14"/>'),
  upI: BSVG('<path d="m6 15 6-6 6 6"/>'), downI: BSVG('<path d="m6 9 6 6 6-6"/>'),
  info: BSVG('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.2"/>'),
  candle: BSVG('<path d="M7 3.5v3M7 15.5v4M17 5v3M17 17v2.5"/><rect x="5" y="6.5" width="4" height="9" rx="1"/><rect x="15" y="8" width="4" height="9" rx="1"/>'),
  line: BSVG('<path d="m3.5 17 5-6 4 3.5 8-9"/>'),
  plusI: BSVG('<path d="M12 5v14M5 12h14"/>')
});

/* ───────── Giriş ekranı ───────── */
showLogin = function (msg) {
  $('#app').innerHTML = `
  <div class="center-screen">
    <div class="brand-mark">${IC.borsa}</div>
    <h1>Borsa</h1>
    <p>Borsa İstanbul, ABD hisseleri, döviz, altın ve kripto. İzleme listeleri, portföy ve gerçek getiri, fiyat alarmları. Listelerin ve portföyün kendi Google Drive'ında saklanır.</p>
    ${msg ? `<p class="err">${esc(msg)}</p>` : ''}
    <button class="btn primary" data-action="login">Google ile giriş yap</button>
    <p class="muted sm" style="margin-top:14px"><a href="?demo">Örnek verilerle dene</a></p>
    <p class="muted sm br-yasal">Fiyatlar 15-20 dakika gecikmelidir. Bu uygulama yatırım tavsiyesi vermez.</p>
  </div>`;
};

/* ═════════ Kullanıcı verisi: Drive'da "Suha Borsa.json" ═════════ */
const BOS = () => ({
  v: 1,
  listeler: [{ id: 'fav', ad: 'Favoriler', s: ['XU100.IS', 'USDTRY=X', 'GRAM-ALTIN', 'THYAO.IS', 'ASELS.IS', 'BIMAS.IS', 'AAPL', 'BTC-USD'] }],
  islemler: [], alarmlar: [], ozel: {}, ayar: { yenile: 120, temettuOto: true }
});
const BDB_REAL = {
  id: null,
  async bul() {
    if (this.id) return this.id;
    const q = "appProperties has { key='suha' and value='borsa' } and trashed=false";
    const r = await dFetch(DRIVE + '?' + qs({ q, fields: 'files(id)', pageSize: 1 }));
    return (this.id = r.files?.[0]?.id || null);
  },
  async yukle() {
    const id = await this.bul(); if (!id) return null;
    const t = await dFetch(`${DRIVE}/${id}?alt=media`);
    return typeof t === 'string' ? JSON.parse(t) : t;
  },
  async kaydet(data) {
    const id = await this.bul(), b = 'borsa_' + Math.random().toString(36).slice(2);
    const meta = id ? { name: 'Suha Borsa.json' } : { name: 'Suha Borsa.json', mimeType: 'application/json', appProperties: { suha: 'borsa' }, description: 'Borsa uygulamasının izleme listeleri, portföy işlemleri ve alarmları.' };
    const body = new Blob([`--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${b}\r\nContent-Type: application/json\r\n\r\n`, JSON.stringify(data), `\r\n--${b}--`]);
    const f = await dFetch(`${DRIVE_UP}${id ? '/' + id : ''}?uploadType=multipart&fields=id`, { method: id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'multipart/related; boundary=' + b }, body });
    this.id = f.id;
  }
};
const BDB_DEMO = {
  async yukle() {
    await sleep(150);
    const d = BOS(), g = (y, m, dd) => new Date(y, m - 1, dd, 12).getTime(), id = () => Math.random().toString(36).slice(2, 10);
    d.listeler.push({ id: 'banka', ad: 'Bankalar', s: ['GARAN.IS', 'AKBNK.IS', 'YKBNK.IS', 'ISCTR.IS', 'HALKB.IS', 'VAKBN.IS'] },
      { id: 'abd', ad: 'ABD teknoloji', s: ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META', 'AMZN', 'TSLA'] });
    d.islemler = [
      { id: id(), s: 'THYAO.IS', tip: 'al', t: g(2024, 3, 12), adet: 100, fiyat: 272, kom: 50 },
      { id: id(), s: 'ASELS.IS', tip: 'al', t: g(2023, 6, 20), adet: 150, fiyat: 46, kom: 35 },
      { id: id(), s: 'BIMAS.IS', tip: 'al', t: g(2025, 1, 15), adet: 20, fiyat: 470, kom: 25 },
      { id: id(), s: 'THYAO.IS', tip: 'sat', t: g(2025, 9, 2), adet: 40, fiyat: 318, kom: 20 },
      { id: id(), s: 'AAPL', tip: 'al', t: g(2024, 9, 10), adet: 12, fiyat: 220, kom: 3 },
      { id: id(), s: 'GRAM-ALTIN', tip: 'al', t: g(2025, 5, 5), adet: 25, fiyat: 4050, kom: 0 },
      { id: id(), s: 'TUPRS.IS', tip: 'al', t: g(2025, 11, 3), adet: 120, fiyat: 158, kom: 30 }
    ];
    d.alarmlar = [
      { id: id(), s: 'THYAO.IS', tip: 'ust', d: 330, olustu: Date.now() - 2 * 864e5, tetik: 0 },
      { id: id(), s: 'USDTRY=X', tip: 'ust', d: 42.5, olustu: Date.now() - 5 * 864e5, tetik: 0 },
      { id: id(), s: 'BIMAS.IS', tip: 'alt', d: 560, olustu: Date.now() - 9 * 864e5, tetik: Date.now() - 3 * 864e5 }
    ];
    return d;
  },
  async kaydet() { await sleep(80); }
};
const BDB = DEMO ? BDB_DEMO : BDB_REAL;

/* ═════════ Durum ═════════ */
const B = {
  data: null, sekme: store.get('borsaSekme', 'piyasa'), liste: store.get('borsaListe', 'fav'), detay: null,
  aralik: store.get('borsaAralik', '1Y'), tip: store.get('borsaTip', 'alan'), gost: new Set(store.get('borsaGost', ['hacim'])),
  rozet: store.get('borsaRozet', 'yuzde'), gizle: store.get('borsaGizle', false), isi: store.get('borsaIsi', 'bist'),
  psekme: 'varliklar', kars: store.get('borsaKars', ['XU100.IS', 'USDTRY=X', 'GRAM-ALTIN']), karsAralik: '1Y',
  tara: { piyasa: 'bist', sek: '', fk: '', deg: '', zirve: '', sira: 'pd', ters: true },
  grafik: null, kayitT: 0, kaydediliyor: false, yenileT: 0, yenileniyor: false, splMap: {}, tabloHata: '', kaydetHata: ''
};
const yeniId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-3);
const ayar = (k, d) => B.data?.ayar?.[k] ?? d;
function degisti() {
  store.set('borsaVeri', B.data);
  clearTimeout(B.kayitT); B.kayitT = setTimeout(kaydet, 1200);
}
async function kaydet() {
  if (B.kaydediliyor) { clearTimeout(B.kayitT); B.kayitT = setTimeout(kaydet, 800); return; }
  B.kaydediliyor = true;
  try { await BDB.kaydet(B.data); B.kaydetHata = ''; store.del('borsaKayitBekliyor'); }
  catch (e) { if (!(e instanceof AuthError)) { B.kaydetHata = e.message; store.set('borsaKayitBekliyor', 1); toast('Drive\'a kaydedilemedi; internet gelince tekrar denenecek'); } }
  B.kaydediliyor = false;
}

/* ═════════ Başlangıç ═════════ */
start = async function () {
  if (!window.SUHA_PROGRAM) return window.suhaKapi();
  try {
    let email = '';
    if (DEMO) email = 'demo@ornek.com';
    else {
      email = jwtBody(store.get('idt')?.t || '')?.email || '';
      if (!email) { const u = await dFetch('https://openidconnect.googleapis.com/v1/userinfo'); email = u.email || ''; }
    }
    S.email = email;
    if (email) store.set('email', email);
    if (typeof accessGate === 'function' && !(await accessGate(email))) return;
    const yerel = store.get('borsaVeri');
    let d = null;
    try { d = await BDB.yukle(); } catch (e) { if (e instanceof AuthError) return; if (!yerel) throw e; toast('Drive\'a ulaşılamadı; son kaydedilen hâli gösteriliyor'); }
    if (!DEMO && yerel && store.get('borsaKayitBekliyor')) d = yerel;   // kaydedilemeyen değişiklikler önce
    B.data = Object.assign(BOS(), d || {});
    B.data.ayar = Object.assign(BOS().ayar, B.data.ayar || {});
    if (!d && !DEMO) degisti();
    if (!B.data.listeler.some(l => l.id === B.liste)) B.liste = B.data.listeler[0]?.id;
    const u = new URLSearchParams(location.search);
    if (u.get('s')) B.detay = u.get('s');
    if (u.get('sekme')) B.sekme = u.get('sekme');
    if (u.has('s') || u.has('sekme')) history.replaceState(null, '', location.pathname + (DEMO ? '?demo' : ''));
    kabuk(); goster();
    yenile(true);
    if (!DEMO) alarmSenkron();
  } catch (e) {
    if (!(e instanceof AuthError)) showLogin('Drive\'a bağlanılamadı: ' + e.message);
  }
};
setInterval(() => { if (document.visibilityState === 'visible' && B.data && Date.now() - Veri.zaman > ayar('yenile', 120) * 1000 - 2000) yenile(); }, 15000);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && B.data && Date.now() - Veri.zaman > 60000) yenile(); });

/* ═════════ Kabuk ═════════ */
const SEKMELER = [['piyasa', 'Piyasa', 'pulse'], ['listeler', 'Listeler', 'listI'], ['portfoy', 'Portföy', 'wallet'], ['karsilastir', 'Karşılaştır', 'compare'], ['tarama', 'Tarama', 'scan'], ['alarmlar', 'Alarmlar', 'bell']];
function kabuk() {
  document.body.classList.add('br-on');
  $('#app').innerHTML = `
  <div class="br-shell" id="bShell">
    <aside class="sidebar br-side">
      <div class="side-head"><div class="brand-mark sm">${IC.borsa}</div><div class="acct"><b>Borsa</b><span>${esc(S.email || '')}</span></div></div>
      <nav id="bNav"></nav>
      <div class="br-side-alt"><span id="bDurum2"></span><span>Fiyatlar 15-20 dk gecikmeli. Yatırım tavsiyesi değildir.</span></div>
    </aside>
    <main class="listpane br-main">
      <header class="br-top">
        <div class="brand-mark sm br-mob">${IC.borsa}</div>
        <button type="button" class="searchbox br-ara" data-action="b-ara">${IC.search}<span>Hisse, döviz, kripto ara</span><kbd>/</kbd></button>
        <span class="br-durum" id="bDurum"></span>
        <button class="icon-btn" data-action="b-yenile" title="Yenile">${IC.refresh}</button>
        <button class="icon-btn" data-action="b-ayar" title="Ayarlar">${IC.gear}</button>
      </header>
      <div class="br-bant" aria-hidden="true"><div class="br-bant-ic" id="bBant"></div></div>
      <div class="br-view" id="bView"></div>
    </main>
    <nav class="br-tabbar" id="bTab"></nav>
  </div>`;
  bantCiz();
  navCiz();
}
// Karakter: üstte kayan fiyat bandı (fiyatGuncelle data-qf/data-qd ile tazeler)
function bantCiz() {
  const el = $('#bBant'); if (!el) return;
  const ids = [...new Set([...OZET, ...KAT.filter(x => /^(endeks|doviz|emtia|kripto)$/.test(x.tur)).map(x => x.id)])].slice(0, 14);
  const parca = ids.map(id => `<span class="br-bant-o"><b>${esc(inst(id).kod)}</b>${fiyatSpan(id)}${degSpan(id, 'br-bant-d')}</span>`).join('');
  el.innerHTML = parca + parca;
}
function navCiz() {
  const alarmSay = (B.data.alarmlar || []).filter(a => !a.tetik).length;
  const item = ([k, ad, ic]) => `<div class="nav-item ${!B.detay && B.sekme === k ? 'active' : ''}" data-action="b-sekme" data-t="${k}" style="--d:0">${IC[ic]}<span class="nav-name">${ad}</span>${k === 'alarmlar' && alarmSay ? `<span class="count">${alarmSay}</span>` : k === 'listeler' ? `<span class="count">${B.data.listeler.length}</span>` : ''}</div>`;
  $('#bNav').innerHTML = SEKMELER.map(item).join('');
  $('#bTab').innerHTML = SEKMELER.filter(s => s[0] !== 'karsilastir').map(([k, ad, ic]) => `<button class="${!B.detay && B.sekme === k ? 'on' : ''}" data-action="b-sekme" data-t="${k}">${IC[ic]}<span>${ad}</span></button>`).join('');
}
function durumCiz() {
  const z = Veri.zaman, t = z ? new Date(z).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '';
  const s = B.yenileniyor ? 'Güncelleniyor…' : z ? `Son: ${t}` : '';
  if ($('#bDurum')) $('#bDurum').textContent = s;
  if ($('#bDurum2')) $('#bDurum2').textContent = z ? `Fiyatlar ${t} itibarıyla` : '';
}
function goster() {
  if (B.grafik) { B.grafik.yokEt(); B.grafik = null; }
  navCiz();
  const v = $('#bView'); if (!v) return;
  v.scrollTop = 0;
  if (B.detay) return detayCiz();
  ({ piyasa: piyasaCiz, listeler: listelerCiz, portfoy: portfoyCiz, karsilastir: karsCiz, tarama: taramaCiz, alarmlar: alarmlarCiz }[B.sekme] || piyasaCiz)();
}

/* ═════════ Fiyat yenileme ═════════ */
function gorunenler() {
  const ids = new Set(OZET);
  if (B.detay) ids.add(B.detay);
  B.data.listeler.forEach(l => l.s.forEach(x => ids.add(x)));
  B.data.islemler.forEach(x => ids.add(x.s));
  B.data.alarmlar.forEach(a => ids.add(a.s));
  B.kars.forEach(x => ids.add(x));
  ids.add('USDTRY=X'); ids.add('EURTRY=X');
  if (B.sekme === 'piyasa' || B.sekme === 'tarama') KAT.filter(x => x.tur === (B.sekme === 'tarama' ? B.tara.piyasa : B.isi)).forEach(x => ids.add(x.id));
  return [...ids];
}
async function yenile(ilk) {
  if (B.yenileniyor) return;
  B.yenileniyor = true; durumCiz();
  try {
    await Veri.fiyatlar(gorunenler());
    fiyatGuncelle();
    alarmKontrol();
    if (ilk && B.sekme === 'piyasa' && !B.detay) piyasaCiz();
    else if (!B.detay && /^(portfoy|tarama|piyasa)$/.test(B.sekme)) ({ portfoy: portfoyOzetGuncelle, tarama: taramaTablo, piyasa: piyasaGuncelle })[B.sekme]();
  } catch (e) { if (!(e instanceof AuthError)) toast('Fiyatlar alınamadı: ' + e.message); }
  B.yenileniyor = false; durumCiz();
}
// Ekrandaki fiyat ve değişimleri yerinde günceller (grafikler yeniden çizilmez)
function fiyatGuncelle() {
  document.querySelectorAll('[data-qf]').forEach(el => { const id = el.dataset.qf, q = Veri.q[id]; if (q?.fiyat != null) el.textContent = fFiyat(q.fiyat, q.para || inst(id).para); });
  document.querySelectorAll('[data-qd]').forEach(el => {
    const id = el.dataset.qd, q = Veri.q[id], p = Veri.deg(id), mod = el.dataset.mod || 'yuzde';
    el.className = el.className.replace(/\b(up|down|flat)\b/g, '').trim() + ' ' + renkSinif(p);
    el.textContent = mod === 'deger' ? (q?.fiyat && q?.onceki ? (q.fiyat - q.onceki > 0 ? '+' : '') + fN(q.fiyat - q.onceki, Math.abs(q.fiyat) < 1 ? 4 : 2) : '—') : mod === 'pd' ? fBuyuk(q?.pd, q?.para || inst(id).para) : fPct(p);
  });
}
const fiyatSpan = (id, cls = '') => { const q = Veri.q[id]; return `<span class="${cls}" data-qf="${esc(id)}">${fFiyat(q?.fiyat, q?.para || inst(id).para)}</span>`; };
const degSpan = (id, cls = 'br-deg', mod = 'yuzde') => { const p = Veri.deg(id); return `<span class="${cls} ${renkSinif(p)}" data-qd="${esc(id)}" data-mod="${mod}">${mod === 'yuzde' ? fPct(p) : ''}</span>`; };

// Küçük grafikler (1 aylık) gerektiğinde yüklenir
const sparkBekliyor = new Set();
async function sparkDoldur(kok = document) {
  const els = [...kok.querySelectorAll('[data-sp]')];
  const ids = [...new Set(els.map(e => e.dataset.sp))];
  await pmap(ids, 4, async id => {
    if (sparkBekliyor.has(id)) return;
    sparkBekliyor.add(id);
    try {
      const s = await Veri.seri(id, '1A');
      document.querySelectorAll(`[data-sp="${CSS.escape(id)}"]`).forEach(el => { el.innerHTML = spark(s?.c, +el.dataset.w || 76, +el.dataset.h || 26); });
    } catch {} finally { sparkBekliyor.delete(id); }
  });
}
const sparkKutu = (id, w = 76, h = 26) => `<span class="br-spark" data-sp="${esc(id)}" data-w="${w}" data-h="${h}">${Veri.gecmis[id + '|1A'] ? spark(Veri.gecmis[id + '|1A'].s.c, w, h) : ''}</span>`;
const gizli = v => B.gizle ? '••••' : v;

/* ═════════ Piyasa ═════════ */
function piyasaCiz() {
  const v = $('#bView');
  v.innerHTML = `
    <div class="br-page">
      <div class="br-h1"><h2>Piyasa</h2><span class="muted sm">${new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</span><div class="spacer"></div><button class="btn br-mob-kars" data-action="b-sekme" data-t="karsilastir">${IC.compare}<span>Karşılaştır</span></button></div>
      <div class="br-ozet">${OZET.map(id => { const x = inst(id); return `
        <div class="br-kart" data-action="b-detay" data-id="${esc(id)}">
          <div class="br-kart-ust"><b>${esc(x.kod)}</b>${degSpan(id)}</div>
          ${fiyatSpan(id, 'br-kart-fiyat')}
          ${sparkKutu(id, 160, 34)}
        </div>`; }).join('')}</div>
      <section class="br-blok">
        <div class="br-blok-bas"><h3>Isı haritası</h3><div class="seg">${[['bist', 'Borsa İstanbul'], ['abd', 'ABD']].map(([k, n]) => `<button class="${B.isi === k ? 'on' : ''}" data-action="b-isi" data-k="${k}">${n}</button>`).join('')}</div></div>
        <div class="br-isi" id="bIsi"></div>
        <p class="muted sm">Kutu büyüklüğü piyasa değerini, renk günlük değişimi gösterir. Sektörlere göre gruplanmıştır.</p>
      </section>
      <div class="br-iki">
        <section class="br-blok"><h3>En çok yükselenler</h3><div id="bYuk"></div></section>
        <section class="br-blok"><h3>En çok düşenler</h3><div id="bDus"></div></section>
      </div>
      <section class="br-blok"><h3>Döviz, emtia ve kripto</h3><div class="br-satirlar">${KAT.filter(x => /^(doviz|emtia|kripto)$/.test(x.tur)).map(x => satir(x.id)).join('')}</div></section>
      <section class="br-blok"><h3>Endeksler</h3><div class="br-satirlar">${KAT.filter(x => x.tur === 'endeks').map(x => satir(x.id)).join('')}</div></section>
    </div>`;
  piyasaGuncelle();
  sparkDoldur(v);
}
function piyasaGuncelle() {
  if (!$('#bIsi')) return;
  fiyatGuncelle();
  isiCiz();
  const liste = KAT.filter(x => x.tur === B.isi && Veri.deg(x.id) != null).sort((a, b) => Veri.deg(b.id) - Veri.deg(a.id));
  const kisa = id => satir(id, { spark: false });
  $('#bYuk').innerHTML = liste.slice(0, 5).map(x => kisa(x.id)).join('') || '<div class="list-msg">Veri bekleniyor</div>';
  $('#bDus').innerHTML = liste.slice(-5).reverse().map(x => kisa(x.id)).join('') || '<div class="list-msg">Veri bekleniyor</div>';
}
function isiCiz() {
  const kutu = $('#bIsi'); if (!kutu) return;
  const W = kutu.clientWidth, H = Math.max(260, Math.min(460, W * 0.55));
  kutu.style.height = H + 'px';
  const hisseler = KAT.filter(x => x.tur === B.isi);
  const gruplar = {};
  hisseler.forEach(x => { const q = Veri.q[x.id]; const v = q?.pd || (q?.fiyat ? 1e9 : 0) || 1e9; (gruplar[x.sek] ||= []).push({ id: x.id, kod: x.kod, v, p: Veri.deg(x.id) }); });
  const sek = Object.entries(gruplar).map(([ad, l]) => ({ ad, l, v: l.reduce((a, o) => a + o.v, 0) }));
  const dis = kareYerlesim(sek, 0, 0, W, H);
  kutu.innerHTML = dis.map(g => {
    const ic = kareYerlesim(g.l, g.x + 1, g.y + 16, g.w - 2, Math.max(1, g.h - 17));
    return `<div class="br-isi-sek" style="left:${g.x}px;top:${g.y}px;width:${g.w}px;height:${g.h}px"><span>${g.w > 60 ? esc(g.ad) : ''}</span></div>`
      + ic.map(o => `<div class="br-isi-k ${Math.abs(o.p || 0) > 2 ? 'koyu' : ''}" data-action="b-detay" data-id="${esc(o.id)}" title="${esc(o.kod)} ${fPct(o.p)}" style="left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px;background:${isiRenk(o.p)}">${o.w > 38 && o.h > 26 ? `<b>${esc(o.kod)}</b>${o.h > 40 ? `<span>${fPct(o.p)}</span>` : ''}` : ''}</div>`).join('');
  }).join('');
}
window.addEventListener('resize', () => { if ($('#bIsi')) isiCiz(); });

// Ortak satır görünümü: kod, ad, küçük grafik, fiyat, değişim rozeti
function satir(id, o = {}) {
  const x = inst(id), aktif = o.mod || 'yuzde';
  return `<div class="br-satir" data-action="b-detay" data-id="${esc(id)}">
    <div class="br-satir-ad"><b>${esc(x.kod)}</b><span>${esc(x.ad)}</span></div>
    ${o.spark === false ? '' : sparkKutu(id)}
    <div class="br-satir-sag">${fiyatSpan(id, 'br-fiyat')}${degSpan(id, 'br-rozet', aktif)}</div>
    ${o.menu ? `<button class="icon-btn br-satir-m" data-action="b-satir-menu" data-id="${esc(id)}" title="Seçenekler">${IC.more}</button>` : ''}
  </div>`;
}

/* ═════════ Listeler ═════════ */
function listelerCiz() {
  const L = B.data.listeler.find(l => l.id === B.liste) || B.data.listeler[0];
  if (L) B.liste = L.id;
  $('#bView').innerHTML = `
    <div class="br-page">
      <div class="br-h1"><h2>Listeler</h2><div class="spacer"></div>
        <button class="btn" data-action="b-rozet" title="Değişimi yüzde, fark ya da piyasa değeri olarak göster">${{ yuzde: '% değişim', deger: 'Fark', pd: 'Piyasa değeri' }[B.rozet]}</button>
        <button class="btn primary" data-action="b-liste-ekle-sembol">${IC.plusI}<span>Ekle</span></button></div>
      <div class="br-cipler">${B.data.listeler.map(l => `<button class="br-cip ${l.id === B.liste ? 'on' : ''}" data-action="b-liste-sec" data-id="${esc(l.id)}">${esc(l.ad)} <span>${l.s.length}</span></button>`).join('')}
        <button class="br-cip yeni" data-action="b-liste-yeni">${IC.plusI}Yeni liste</button>
        ${L ? `<button class="icon-btn" data-action="b-liste-menu" title="Liste seçenekleri">${IC.more}</button>` : ''}</div>
      <div class="br-satirlar" id="bListe">${L && L.s.length ? L.s.map(id => satir(id, { menu: true, mod: B.rozet })).join('') : `<div class="br-bos">${IC.listI}<b>Liste boş</b><span>Takip etmek istediğin hisseleri, döviz ya da kriptoyu ekle.</span><button class="btn primary" data-action="b-liste-ekle-sembol">${IC.plusI}Sembol ekle</button></div>`}</div>
    </div>`;
  fiyatGuncelle();
  sparkDoldur($('#bView'));
}
function listeyeEkle(id, listeId = B.liste) {
  const L = B.data.listeler.find(l => l.id === listeId); if (!L) return;
  if (L.s.includes(id)) return toast(`${inst(id).kod} zaten "${L.ad}" listesinde`);
  L.s.push(id); ozelKaydet(id); degisti();
  toast(`${inst(id).kod} "${L.ad}" listesine eklendi`);
  if (!Veri.q[id]) Veri.fiyatlar([id]).then(fiyatGuncelle).catch(() => {});
}
function ozelKaydet(id) { if (!KAT_BY[id]) { const x = inst(id); B.data.ozel[id] = { id: x.id, kod: x.kod, ad: x.ad, tur: x.tur, gf: x.gf, para: x.para, sek: x.sek || 'Diğer' }; } }
function satirMenu(el) {
  const id = el.dataset.id, L = B.data.listeler.find(l => l.id === B.liste), i = L?.s.indexOf(id);
  bPop(el, [['ac', IC.borsa, 'Aç'], ['yukari', IC.upI, 'Yukarı taşı', i <= 0], ['asagi', IC.downI, 'Aşağı taşı', i >= L.s.length - 1], ['alarm', IC.bell, 'Alarm kur'], ['islem', IC.wallet, 'Portföye işlem ekle'], ['sil', IC.trash, 'Listeden çıkar', false, true]], v => {
    if (v === 'ac') detayAc(id);
    if (v === 'yukari' || v === 'asagi') { const j = i + (v === 'yukari' ? -1 : 1); [L.s[i], L.s[j]] = [L.s[j], L.s[i]]; degisti(); listelerCiz(); }
    if (v === 'alarm') alarmForm({ s: id });
    if (v === 'islem') islemForm({ s: id });
    if (v === 'sil') { L.s.splice(i, 1); degisti(); listelerCiz(); toast(`${inst(id).kod} listeden çıkarıldı`, [['Geri al', () => { L.s.splice(i, 0, id); degisti(); listelerCiz(); }]]); }
  });
}
function listeMenu(el) {
  const L = B.data.listeler.find(l => l.id === B.liste); if (!L) return;
  bPop(el, [['ad', IC.pen, 'Yeniden adlandır'], ['sirala', IC.listI, 'Değişime göre sırala'], ['kars', IC.compare, 'Karşılaştır (ilk 5)'], ['sil', IC.trash, 'Listeyi sil', B.data.listeler.length < 2, true]], async v => {
    if (v === 'ad') { const t = await bSor('Listeyi yeniden adlandır', 'Adı', L.ad); if (t) { L.ad = t.slice(0, 40); degisti(); listelerCiz(); } }
    if (v === 'sirala') { L.s.sort((a, b) => (Veri.deg(b) ?? -1e9) - (Veri.deg(a) ?? -1e9)); degisti(); listelerCiz(); }
    if (v === 'kars') { B.kars = L.s.slice(0, 5); store.set('borsaKars', B.kars); B.sekme = 'karsilastir'; goster(); }
    if (v === 'sil') { if (!confirm(`"${L.ad}" listesi silinsin mi?`)) return; B.data.listeler = B.data.listeler.filter(x => x !== L); B.liste = B.data.listeler[0].id; degisti(); listelerCiz(); }
  });
}

/* ═════════ Arama ═════════ */
function aramaAc(o = {}) {
  const baslik = o.baslik || 'Ara';
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet br-arama"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>${esc(baslik)}</h3></header>
    <form class="searchbox" id="bAraF">${IC.search}<input id="bAraQ" type="search" placeholder="THYAO, Apple, dolar, altın, bitcoin…" autocomplete="off" enterkeyhint="search"></form>
    <div class="br-ara-sonuc" id="bAraS"></div></div></div>`;
  const ciz = (liste, yukleniyor) => {
    const grup = {};
    liste.forEach(x => (grup[TUR_AD[x.tur] || 'Diğer'] ||= []).push(x));
    $('#bAraS').innerHTML = Object.entries(grup).map(([g, l]) => `<div class="br-ara-g">${esc(g)}</div>` + l.map(x => `
      <button class="br-ara-s" data-id="${esc(x.id)}" data-ad="${esc(x.ad)}" data-borsa="${esc(x.borsaAd || '')}"><b>${esc(x.kod)}</b><span>${esc(x.ad)}${x.tahmin ? ' · Borsa İstanbul kodu olarak dene' : x.borsaAd ? ' · ' + esc(x.borsaAd) : ''}</span>${Veri.q[x.id] ? `<em>${fFiyat(Veri.q[x.id].fiyat, Veri.q[x.id].para || x.para)}</em>` : ''}</button>`).join('')).join('')
      + (yukleniyor ? '<div class="list-msg">Aranıyor…</div>' : !liste.length ? '<div class="list-msg">Sonuç yok. Borsa İstanbul kodunu (ör. KONTR) ya da ABD sembolünü (ör. AAPL) yazabilirsin.</div>' : '');
  };
  const onerilen = () => ciz((o.oneriler || ['THYAO.IS', 'ASELS.IS', 'GARAN.IS', 'BIMAS.IS', 'AAPL', 'NVDA', 'USDTRY=X', 'GRAM-ALTIN', 'BTC-USD']).map(inst));
  onerilen();
  let t = 0, no = 0;
  $('#bAraQ').addEventListener('input', e => {
    const q = e.target.value.trim(); clearTimeout(t);
    if (!q) return onerilen();
    const yerel = katAra(arNorm(q));
    ciz(yerel, true);
    const n = ++no;
    t = setTimeout(async () => { const r = await Veri.ara(q); if (n === no) ciz(r); }, 350);
  });
  $('#bAraF').addEventListener('submit', e => { e.preventDefault(); $('#bAraS .br-ara-s')?.click(); });
  $('#bAraS').addEventListener('click', e => {
    const b = e.target.closest('.br-ara-s'); if (!b) return;
    const id = b.dataset.id;
    if (!KAT_BY[id] && !B.data.ozel[id]) B.data.ozel[id] = (({ id, kod, ad, tur, gf, para, sek }) => ({ id, kod, ad, tur, gf, para, sek: sek || 'Diğer' }))(yeniInst(id, b.dataset.ad, b.dataset.borsa));
    closeModal(); (o.sec || detayAc)(id);
  });
  setTimeout(() => $('#bAraQ')?.focus(), 60);
}

/* ═════════ Hisse sayfası ═════════ */
function detayAc(id) { B.detay = id; ozelKaydet(id); goster(); if (!Veri.q[id] || Date.now() - (Veri.q[id].zaman || 0) > 60000) Veri.fiyatlar([id]).then(() => { fiyatGuncelle(); detayIstatistik(); }).catch(() => {}); }
const GOSTERGE = [['ma20', 'Ort. 20', '#f59e0b'], ['ma50', 'Ort. 50', '#8b5cf6'], ['ma200', 'Ort. 200', '#06b6d4'], ['boll', 'Bollinger', '#94a3b8'], ['hacim', 'Hacim'], ['rsi', 'RSI'], ['macd', 'MACD']];
function detayCiz() {
  const id = B.detay, x = inst(id), listede = B.data.listeler.some(l => l.s.includes(id)), alarmVar = B.data.alarmlar.some(a => a.s === id && !a.tetik);
  $('#bView').innerHTML = `
    <div class="br-page br-detay">
      <div class="br-d-ust">
        <button class="icon-btn" data-action="b-geri" title="Geri">${IC.back}</button>
        <div class="br-d-ad"><b>${esc(x.kod)}</b><span>${esc(KAT_BY[id] ? x.ad : Veri.q[id]?.ad || x.ad)} · ${esc(TUR_AD[x.tur] || '')}${x.para ? ' · ' + esc(x.para) : ''}</span></div>
        <button class="icon-btn ${listede ? 'on' : ''}" data-action="b-yildiz" title="Listeye ekle">${listede ? IC.starOn : IC.star}</button>
        <button class="icon-btn ${alarmVar ? 'on' : ''}" data-action="b-d-alarm" title="Alarm kur">${alarmVar ? IC.bellOn : IC.bell}</button>
        <button class="icon-btn" data-action="b-d-menu" title="Diğer">${IC.more}</button>
      </div>
      <div class="br-d-fiyat"><span id="bDF">${fiyatSpan(id, 'br-buyuk')}</span><span id="bDD">${degSpan(id, 'br-deg buyuk')}</span><span class="muted sm" id="bDT">Gecikmeli · ${Veri.q[id]?.zaman ? new Date(Veri.q[id].zaman).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}</span></div>
      <div class="br-d-izgara">
        <div class="br-d-sol">
          <div class="br-grafik-arac">
            <div class="seg br-aralik">${Object.keys(ARALIK).map(k => `<button class="${B.aralik === k ? 'on' : ''}" data-action="b-aralik" data-k="${k}">${k === 'T' ? 'Tümü' : k}</button>`).join('')}</div>
            <div class="seg">${[['alan', IC.line, 'Çizgi'], ['mum', IC.candle, 'Mum']].map(([k, ic, n]) => `<button class="${B.tip === k ? 'on' : ''}" data-action="b-tip" data-k="${k}" title="${n}">${ic}</button>`).join('')}</div>
          </div>
          <div class="br-gost">${GOSTERGE.map(([k, n, r]) => `<button class="br-cip sm ${B.gost.has(k) ? 'on' : ''}" data-action="b-gost" data-k="${k}">${r ? `<i style="background:${r}"></i>` : ''}${n}</button>`).join('')}</div>
          <div class="br-grafik" id="bGrafik"></div>
          <div class="br-d-eylem">
            <button class="btn" data-action="b-d-islem">${IC.wallet}İşlem ekle</button>
            <button class="btn" data-action="b-d-alarm">${IC.bell}Alarm</button>
            <button class="btn" data-action="b-d-kars">${IC.compare}Karşılaştır</button>
            <button class="btn" data-action="b-d-not">${IC.noteI}Not al</button>
            <button class="btn" data-action="b-d-kopya">${IC.copy}Grafiği kopyala</button>
          </div>
          <section class="br-blok"><h3>İstatistikler</h3><div class="br-ist" id="bIst"></div></section>
          <section class="br-blok" id="bPoz"></section>
          <section class="br-blok"><h3>Teknik görünüm <button class="icon-btn sm" data-action="b-teknik-bilgi" title="Bu nedir?">${IC.info}</button></h3><div id="bTek"><div class="list-msg">Hesaplanıyor…</div></div></section>
        </div>
        <div class="br-d-sag">
          <section class="br-blok" id="bTem"><h3>Temettü ve bölünmeler</h3><div class="list-msg">Yükleniyor…</div></section>
          <section class="br-blok"><h3>Haberler</h3><div id="bHaber"><div class="list-msg">Yükleniyor…</div></div></section>
        </div>
      </div>
    </div>`;
  B.grafik = new Grafik($('#bGrafik'), { onHover: i => detayImlec(i) });
  detayIstatistik();
  detayPozisyon();
  grafikYukle();
  detayUzun();
  Veri.haber(id).then(h => { if (B.detay !== id) return; $('#bHaber').innerHTML = h.length ? h.map(n => `<a class="br-haber" href="${esc(n.link)}" target="_blank" rel="noopener noreferrer"><b>${esc(n.baslik)}</b><span>${esc(n.kaynak || '')}${n.tarih ? ' · ' + esc(fmtDate(n.tarih)) : ''}</span></a>`).join('') : '<div class="list-msg">Haber bulunamadı</div>'; })
    .catch(e => { if ($('#bHaber')) $('#bHaber').innerHTML = `<div class="list-msg">${esc(servisMesaj(e))}</div>`; });
}
function servisMesaj(e) {
  return servisDurum === 'yok' ? 'Suha Servis bağlı değil.' : servisDurum === 'eski' || /islem|güncel/i.test(e.message) ? 'Suha Servis henüz Borsa için güncellenmedi.' : servisDurum === 'yetki' ? 'Oturum süresi doldu; sayfayı yenileyince düzelir.' : 'Şu an alınamadı.';
}
let grafikSeri = null;
async function grafikYukle() {
  const id = B.detay, ar = B.aralik;
  B.grafik.set({ seriler: [], mesaj: 'Yükleniyor…' });
  try {
    const s = await Veri.seri(id, ar);
    if (B.detay !== id || B.aralik !== ar || !B.grafik) return;
    grafikSeri = s;
    grafikCiz();
  } catch (e) { if (B.grafik) B.grafik.set({ seriler: [], mesaj: 'Grafik alınamadı: ' + servisMesaj(e) }); }
}
function grafikCiz() {
  const s = grafikSeri; if (!s || !B.grafik) return;
  const ar = B.aralik, gunici = /^(1G|1H)$/.test(ar), c = s.c;
  const yon = c[c.length - 1] >= (ar === '1G' ? (Veri.q[B.detay]?.onceki ?? c[0]) : c[0]) ? RENK.up : RENK.down;
  const katman = [], panel = [];
  if (B.gost.has('ma20')) katman.push({ d: TA.sma(c, 20), renk: '#f59e0b' });
  if (B.gost.has('ma50')) katman.push({ d: TA.sma(c, 50), renk: '#8b5cf6' });
  if (B.gost.has('ma200')) katman.push({ d: TA.sma(c, 200), renk: '#06b6d4' });
  if (B.gost.has('boll')) { const b = TA.boll(c); katman.push({ d: b.ust, renk: '#94a3b8', kesik: true }, { d: b.alt, renk: '#94a3b8', kesik: true }); }
  if (B.gost.has('rsi')) panel.push({ ad: 'RSI (14)', min: 0, max: 100, cizgiler: [30, 70], seriler: [{ d: TA.rsi(c), renk: '#8b5cf6' }] });
  if (B.gost.has('macd')) { const m = TA.macd(c); panel.push({ ad: 'MACD (12, 26, 9)', seriler: [{ d: m.m, renk: '#4262ff' }, { d: m.sig, renk: '#f59e0b' }], cubuk: m.hist }); }
  const fmtT = ar === '1G' ? t => new Date(t).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    : ar === '1H' ? t => new Date(t).toLocaleDateString('tr-TR', { weekday: 'short' })
    : /^(1A|3A)$/.test(ar) ? t => new Date(t).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
    : ar === '1Y' ? t => new Date(t).toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' }) : t => String(new Date(t).getFullYear());
  const imlec = gunici ? t => new Date(t).toLocaleString('tr-TR', { weekday: 'short', hour: '2-digit', minute: '2-digit' }) : t => new Date(t).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
  const olaylar = [...(s.div || []).map(([t]) => ({ t, renk: '#10b981' })), ...(s.spl || []).map(([t]) => ({ t, renk: '#8b5cf6' }))].filter(o => o.t >= s.t[0]);
  B.grafik.set({ seriler: [{ ...s, renk: yon }], tip: B.tip === 'mum' ? 'mum' : 'alan', katmanlar: katman, paneller: panel, hacim: B.gost.has('hacim') && s.v?.some(v => v > 0),
    taban: ar === '1G' ? Veri.q[B.detay]?.onceki : null, zamanEtiket: fmtT, imlecEtiket: imlec, olaylar });
  detayImlec(null);
}
function detayImlec(i) {
  const id = B.detay, q = Veri.q[id], s = grafikSeri, x = inst(id);
  if (i == null || !s) {
    $('#bDF').innerHTML = fiyatSpan(id, 'br-buyuk');
    // Seçili aralıktaki değişim
    if (s && B.aralik !== '1G' && s.c.length > 1) {
      const son = q?.fiyat ?? s.c[s.c.length - 1], p = (son / s.c[0] - 1) * 100;
      $('#bDD').innerHTML = `${degSpan(id, 'br-deg buyuk')}<span class="br-deg ${renkSinif(p)} ince">${fPct(p)} · ${ARALIK[B.aralik].ad}</span>`;
    } else $('#bDD').innerHTML = degSpan(id, 'br-deg buyuk');
    $('#bDT').textContent = 'Gecikmeli · ' + (q?.zaman ? new Date(q.zaman).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '');
    return;
  }
  const v = s.c[i], bas = B.aralik === '1G' ? (q?.onceki ?? s.c[0]) : s.c[0], p = (v / bas - 1) * 100;
  $('#bDF').innerHTML = `<span class="br-buyuk">${fFiyat(v, q?.para || x.para)}</span>`;
  $('#bDD').innerHTML = `<span class="br-deg buyuk ${renkSinif(p)}">${fPct(p)}</span>${B.tip === 'mum' ? `<span class="muted sm">A ${kisaSayi(s.o[i])} · Y ${kisaSayi(s.h[i])} · D ${kisaSayi(s.l[i])}</span>` : ''}`;
  $('#bDT').textContent = /^(1G|1H)$/.test(B.aralik) ? new Date(s.t[i]).toLocaleString('tr-TR', { weekday: 'long', hour: '2-digit', minute: '2-digit' }) : fTarih(s.t[i], true);
}
function detayIstatistik() {
  const el = $('#bIst'); if (!el) return;
  const id = B.detay, q = Veri.q[id] || {}, p = q.para || inst(id).para, hisse = /^(bist|abd)$/.test(inst(id).tur);
  const kutu = (ad, v) => `<div><span>${ad}</span><b>${v}</b></div>`;
  const ara = q.y52 && q.d52 && q.fiyat ? Math.max(0, Math.min(100, (q.fiyat - q.d52) / (q.y52 - q.d52) * 100)) : null;
  el.innerHTML = kutu('Açılış', fFiyat(q.acilis, p)) + kutu('Gün içi yüksek', fFiyat(q.yuksek, p)) + kutu('Gün içi düşük', fFiyat(q.dusuk, p)) + kutu('Önceki kapanış', fFiyat(q.onceki, p))
    + (q.hacim ? kutu('Hacim', fBuyuk(q.hacim)) : '') + (hisse ? kutu('Piyasa değeri', fBuyuk(q.pd, p)) + kutu('F/K', q.fk ? fN(q.fk) : '—') + kutu('Hisse başı kâr', fFiyat(q.hbk, p)) : '')
    + (ara != null ? `<div class="br-52"><span>52 haftalık aralık</span><div class="br-52-bar"><i style="left:${ara}%"></i></div><div class="br-52-uc"><em>${fFiyat(q.d52, p)}</em><em>${fFiyat(q.y52, p)}</em></div></div>` : '');
}
function detayPozisyon() {
  const el = $('#bPoz'); if (!el) return;
  const id = B.detay, h = portfoyHesap(B.data.islemler.filter(x => x.s === id), B.splMap).find(p => p.s === id);
  if (!h || (!h.adet && !h.gerceklesen)) { el.innerHTML = ''; el.style.display = 'none'; return; }
  el.style.display = '';
  const q = Veri.q[id], p = q?.para || inst(id).para, deger = h.adet * (q?.fiyat || 0), kz = deger - h.maliyet;
  el.innerHTML = `<h3>Portföyündeki durum</h3><div class="br-ist">
    <div><span>Adet</span><b>${gizli(fN(h.adet, h.adet % 1 ? 4 : 0))}</b></div><div><span>Ortalama maliyet</span><b>${h.adet ? fFiyat(h.maliyet / h.adet, p) : '—'}</b></div>
    <div><span>Değer</span><b>${gizli(fFiyat(deger, p))}</b></div><div><span>Kâr / zarar</span><b class="${renkSinif(kz)}">${gizli(fFiyat(kz, p))} ${h.maliyet ? `<small>${fPct(kz / h.maliyet * 100)}</small>` : ''}</b></div>
    ${h.gerceklesen ? `<div><span>Satışlardan</span><b class="${renkSinif(h.gerceklesen)}">${gizli(fFiyat(h.gerceklesen, p))}</b></div>` : ''}
  </div>${h.bolunme && h.bolunme !== 1 ? `<p class="muted sm">Bölünme / bedelsiz hesaba katıldı (×${fN(h.bolunme, 2)}).</p>` : ''}`;
}
// 5 yıllık günlük veri: teknik görünüm, temettü ve bölünmeler
async function detayUzun() {
  const id = B.detay;
  try {
    const s = await Veri.seri(id, '5Y');
    if (B.detay !== id) return;
    if (s.spl?.length) { B.splMap[id] = s.spl; detayPozisyon(); }
    const c = s.c, n = c.length, son = Veri.q[id]?.fiyat ?? c[n - 1], rsi = TA.rsi(c).at(-1), m50 = TA.sma(c, 50).at(-1), m200 = TA.sma(c, 200).at(-1);
    const y1 = c[Math.max(0, n - 252)], getiri = (son / y1 - 1) * 100;
    const satir_ = (ad, v, aciklama) => `<div class="br-tek"><span>${ad}</span><b>${v}</b><em>${aciklama}</em></div>`;
    $('#bTek').innerHTML = (rsi != null ? satir_('RSI (14)', fN(rsi, 1), rsi > 70 ? 'Aşırı alım bölgesinde (70 üstü)' : rsi < 30 ? 'Aşırı satım bölgesinde (30 altı)' : 'Nötr bölgede (30–70)') : '')
      + (m50 ? satir_('50 günlük ortalama', fFiyat(m50, Veri.q[id]?.para || inst(id).para), son >= m50 ? `Fiyat ortalamanın %${fN((son / m50 - 1) * 100)} üstünde` : `Fiyat ortalamanın %${fN((1 - son / m50) * 100)} altında`) : '')
      + (m200 ? satir_('200 günlük ortalama', fFiyat(m200, Veri.q[id]?.para || inst(id).para), son >= m200 ? `Fiyat ortalamanın %${fN((son / m200 - 1) * 100)} üstünde` : `Fiyat ortalamanın %${fN((1 - son / m200) * 100)} altında`) : '')
      + (m50 && m200 ? satir_('Ortalamalar', m50 > m200 ? '50 > 200' : '50 < 200', m50 > m200 ? 'Kısa vadeli ortalama uzun vadelinin üstünde' : 'Kısa vadeli ortalama uzun vadelinin altında') : '')
      + (n > 250 ? satir_('1 yıllık değişim', fPct(getiri), 'Son 252 işlem günü') : '')
      + '<p class="muted sm">Bu bilgiler geçmiş fiyatlardan hesaplanır, gelecek hakkında bir şey söylemez ve yatırım tavsiyesi değildir.</p>';
    const yilOnce = Date.now() - 365 * 864e5, son12 = (s.div || []).filter(([t]) => t >= yilOnce).reduce((a, [, v]) => a + v, 0), p = Veri.q[id]?.para || inst(id).para;
    $('#bTem').innerHTML = `<h3>Temettü ve bölünmeler</h3>`
      + (s.div?.length ? `<div class="br-ist"><div><span>Son 12 ayda hisse başı</span><b>${fFiyat(son12, p)}</b></div><div><span>Temettü verimi</span><b>${son ? fPct(son12 / son * 100, false) : '—'}</b></div></div>
        <div class="br-tem-l">${[...s.div].reverse().slice(0, 8).map(([t, v]) => `<div><span>${fTarih(t)}</span><b>${fFiyat(v, p)}</b></div>`).join('')}</div>
        <button class="btn sm" data-action="b-d-takvim">${IC.cal}Sonraki temettü tarihini Takvim'e ekle</button>` : '<p class="muted sm">Son 5 yılda temettü kaydı yok.</p>')
      + (s.spl?.length ? `<div class="br-tem-l">${s.spl.map(([t, a, b]) => `<div><span>${fTarih(t)} · ${a > b ? 'bölünme / bedelsiz' : 'birleşme'}</span><b>${b} hisse → ${a} hisse</b></div>`).join('')}</div>` : '')
      + '<p class="muted sm">Tutarlar brüttür ve bölünmelere göre düzeltilmiştir.</p>';
  } catch (e) {
    if ($('#bTek')) $('#bTek').innerHTML = `<div class="list-msg">${esc(servisMesaj(e))}</div>`;
    if ($('#bTem')) $('#bTem').innerHTML = `<h3>Temettü ve bölünmeler</h3><div class="list-msg">${esc(servisMesaj(e))}</div>`;
  }
}
function detayMenu(el) {
  const id = B.detay, x = inst(id);
  bPop(el, [...(x.tur === 'bist' ? [['kap', IC.news, 'KAP haberleri']] : []), ['takvim', IC.cal, 'Takvim\'e hatırlatma ekle'], ['paylas', IC.share || IC.upload, 'Paylaş'], ['link', IC.copy, 'Bağlantıyı kopyala']], async v => {
    if (v === 'kap') window.open('https://news.google.com/search?' + new URLSearchParams({ q: `${x.kod} KAP`, hl: 'tr', gl: 'TR', ceid: 'TR:tr' }), '_blank', 'noopener');
    if (v === 'takvim') takvimEkle(`${x.kod} – kontrol et`, '');
    if (v === 'paylas' || v === 'link') {
      const url = location.origin + location.pathname + '?s=' + encodeURIComponent(id), q = Veri.q[id];
      const metin = `${x.kod} (${x.ad}): ${fFiyat(q?.fiyat, q?.para || x.para)} ${fPct(Veri.deg(id))}`;
      if (v === 'paylas' && navigator.share) { try { await navigator.share({ title: x.kod, text: metin, url }); } catch {} return; }
      try { await navigator.clipboard.writeText(metin + '\n' + url); toast('Bağlantı kopyalandı'); } catch { toast('Kopyalanamadı'); }
    }
  });
}
function notAl() {
  const id = B.detay, x = inst(id), q = Veri.q[id], tarih = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  const text = `${x.ad}\nFiyat: ${fFiyat(q?.fiyat, q?.para || x.para)} (${fPct(Veri.deg(id))}) · ${tarih}\n\n`;
  window.open('notlar.html?' + new URLSearchParams({ title: `${x.kod} notları`, text, url: location.origin + location.pathname + '?s=' + encodeURIComponent(id) }) + (DEMO ? '&demo' : ''), '_blank', 'noopener');
}
function takvimEkle(baslik, aciklama) {
  const ymd = d => d.toISOString().slice(0, 10).replace(/-/g, ''), d = new Date(Date.now() + 864e5);
  const url = 'https://calendar.google.com/calendar/render?' + new URLSearchParams({ action: 'TEMPLATE', text: baslik, details: (aciklama ? aciklama + '\n\n' : '') + 'Suha Borsa: ' + location.origin + location.pathname + '?s=' + encodeURIComponent(B.detay || ''), dates: ymd(d) + '/' + ymd(new Date(d.getTime() + 864e5)) });
  window.open(url, '_blank', 'noopener');
  toast('Takvim açıldı; tarihi seçip kaydet');
}
async function grafikKopyala() {
  if (!B.grafik) return;
  try {
    const blob = await B.grafik.png();
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    toast('Grafik kopyalandı · Pano\'da ya da bir mailde yapıştırabilirsin');
  } catch {
    const blob = await B.grafik.png(), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `${inst(B.detay).kod}-grafik.png`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast('Kopyalanamadı; resim olarak indirildi');
  }
}

/* ═════════ Portföy ═════════ */
function kur(para, t) {   // para biriminden TL'ye
  if (!para || para === 'TRY') return 1;
  const id = para === 'USD' ? 'USDTRY=X' : para === 'EUR' ? 'EURTRY=X' : para === 'GBP' ? 'GBPTRY=X' : null;
  if (!id) return 1;
  if (t != null) { const s = Veri.gecmis[id + '|5Y']?.s || Veri.gecmis[id + '|T']?.s; const v = seriDeger(s, t); if (v) return v; }
  return Veri.q[id]?.fiyat || 1;
}
function portfoyVarlik() {
  const H = portfoyHesap(B.data.islemler, B.splMap);
  return H.map(h => {
    const x = inst(h.s), q = Veri.q[h.s], para = q?.para || x.para, k = kur(para), fiyat = q?.fiyat;
    const deger = fiyat != null ? h.adet * fiyat : null, kz = deger != null ? deger - h.maliyet : null;
    const gun = fiyat != null && q?.onceki ? h.adet * (fiyat - q.onceki) : 0;
    return { ...h, x, para, k, fiyat, deger, kz, degerTL: deger != null ? deger * k : null, maliyetTL: h.maliyet * k, kzTL: kz != null ? kz * k : null, gunTL: gun * k, gercekTL: h.gerceklesen * k };
  });
}
function portfoyCiz() {
  $('#bView').innerHTML = `
    <div class="br-page">
      <div class="br-h1"><h2>Portföy</h2><div class="spacer"></div>
        <button class="icon-btn" data-action="b-gizle" title="${B.gizle ? 'Tutarları göster' : 'Tutarları gizle'}">${B.gizle ? IC.eyeOff : IC.eye}</button>
        <button class="btn primary" data-action="b-islem-yeni">${IC.plusI}<span>İşlem ekle</span></button></div>
      <div class="br-p-ozet" id="bPOzet"></div>
      <div class="seg br-psekme">${[['varliklar', 'Varlıklar'], ['islemler', 'İşlemler'], ['getiri', 'Gerçek getiri'], ['temettu', 'Temettü']].map(([k, n]) => `<button class="${B.psekme === k ? 'on' : ''}" data-action="b-psekme" data-k="${k}">${n}</button>`).join('')}</div>
      <div id="bPIc"></div>
    </div>`;
  portfoyOzetGuncelle();
  portfoyIcCiz();
  bolunmeleriYukle();
}
// Elde tutulan semboller için 5 yıllık geçmiş: bölünme düzeltmesi, getiri ve temettü hesapları için
async function bolunmeleriYukle() {
  const semboller = [...new Set(B.data.islemler.map(x => x.s))].filter(s => !B.splMap[s + ':y']);
  if (!semboller.length) return;
  await pmap(semboller, 3, async s => { try { const g = await Veri.seri(s, '5Y'); B.splMap[s] = g.spl || []; B.splMap[s + ':y'] = 1; } catch {} });
  if (B.sekme === 'portfoy' && !B.detay) { portfoyOzetGuncelle(); if (B.psekme !== 'getiri') portfoyIcCiz(); }
}
function portfoyOzetGuncelle() {
  const el = $('#bPOzet'); if (!el) return;
  const V = portfoyVarlik(), top = V.reduce((a, v) => a + (v.degerTL || 0), 0), mal = V.filter(v => v.adet > 0).reduce((a, v) => a + v.maliyetTL, 0);
  const kz = V.filter(v => v.adet > 0).reduce((a, v) => a + (v.kzTL || 0), 0), gun = V.reduce((a, v) => a + v.gunTL, 0), gercek = V.reduce((a, v) => a + v.gercekTL, 0);
  const dolar = Veri.q['USDTRY=X']?.fiyat;
  el.innerHTML = `
    <div class="br-p-ana"><span>Toplam değer</span><b>${gizli(fFiyat(top, 'TRY'))}</b>${dolar ? `<em>${gizli('≈ ' + fFiyat(top / dolar, 'USD'))}</em>` : ''}</div>
    <div class="br-p-k"><span>Bugün</span><b class="${renkSinif(gun)}">${gizli((gun > 0 ? '+' : '') + fFiyat(gun, 'TRY'))}</b><em class="${renkSinif(gun)}">${top - gun ? fPct(gun / (top - gun) * 100) : '—'}</em></div>
    <div class="br-p-k"><span>Açık kâr / zarar</span><b class="${renkSinif(kz)}">${gizli((kz > 0 ? '+' : '') + fFiyat(kz, 'TRY'))}</b><em class="${renkSinif(kz)}">${mal ? fPct(kz / mal * 100) : '—'}</em></div>
    <div class="br-p-k"><span>Satışlardan (gerçekleşen)</span><b class="${renkSinif(gercek)}">${gizli((gercek > 0 ? '+' : '') + fFiyat(gercek, 'TRY'))}</b><em>Maliyet: ${gizli(fFiyat(mal, 'TRY'))}</em></div>`;
  if (B.psekme === 'varliklar') varliklarTablo();
}
function portfoyIcCiz() {
  const el = $('#bPIc'); if (!el) return;
  if (!B.data.islemler.length) {
    el.innerHTML = `<div class="br-bos">${IC.wallet}<b>Henüz işlem yok</b><span>Aldığın hisseleri, altını ya da dövizi ekle; ortalama maliyetin, kâr/zararın ve gerçek getirin hesaplansın. Bölünme ve bedelsizler otomatik düzeltilir.</span>
      <div class="br-bos-b"><button class="btn primary" data-action="b-islem-yeni">${IC.plusI}İşlem ekle</button><button class="btn" data-action="b-csv-al">${IC.upload}CSV'den aktar</button></div></div>`;
    return;
  }
  if (B.psekme === 'varliklar') { el.innerHTML = '<div id="bVar"></div>'; varliklarTablo(); }
  if (B.psekme === 'islemler') islemlerCiz();
  if (B.psekme === 'getiri') getiriCiz();
  if (B.psekme === 'temettu') temettuCiz();
}
function varliklarTablo() {
  const el = $('#bVar'); if (!el) return;
  const V = portfoyVarlik().filter(v => v.adet > 0).sort((a, b) => (b.degerTL || 0) - (a.degerTL || 0));
  const top = V.reduce((a, v) => a + (v.degerTL || 0), 0) || 1;
  const turlar = {}; V.forEach(v => { const k = TUR_AD[v.x.tur] || 'Diğer'; turlar[k] = (turlar[k] || 0) + (v.degerTL || 0); });
  const kapali = portfoyVarlik().filter(v => !v.adet && v.gerceklesen);
  el.innerHTML = `
    <div class="br-dagilim">
      <div class="br-halka">${halka(V.map((v, i) => ({ v: v.degerTL || 0, ad: v.x.kod, renk: PALET[i % PALET.length] })), 156, 24)}<div><b>${V.length}</b><span>varlık</span></div></div>
      <div class="br-lejant">${V.slice(0, 8).map((v, i) => `<div><i style="background:${PALET[i % PALET.length]}"></i><span>${esc(v.x.kod)}</span><b>${fPct((v.degerTL || 0) / top * 100, false)}</b></div>`).join('')}
        <div class="br-lejant-ayir"></div>${Object.entries(turlar).map(([k, v]) => `<div><span>${esc(k)}</span><b>${fPct(v / top * 100, false)}</b></div>`).join('')}</div>
    </div>
    <div class="br-tablo-k"><table class="br-tablo">
      <thead><tr><th>Varlık</th><th>Adet</th><th>Ort. maliyet</th><th>Fiyat</th><th>Değer (₺)</th><th>Kâr / zarar</th><th>Pay</th></tr></thead>
      <tbody>${V.map(v => `<tr data-action="b-detay" data-id="${esc(v.s)}">
        <td><b>${esc(v.x.kod)}</b><span>${esc(v.x.ad)}</span></td>
        <td>${gizli(fN(v.adet, v.adet % 1 ? 4 : 0))}</td>
        <td>${fFiyat(v.maliyet / v.adet, v.para)}</td>
        <td>${fFiyat(v.fiyat, v.para)}<small class="${renkSinif(Veri.deg(v.s))}">${fPct(Veri.deg(v.s))}</small></td>
        <td>${gizli(fFiyat(v.degerTL, 'TRY'))}</td>
        <td class="${renkSinif(v.kz)}">${gizli(fFiyat(v.kzTL, 'TRY'))}<small>${v.maliyet ? fPct(v.kz / v.maliyet * 100) : ''}</small></td>
        <td>${fPct((v.degerTL || 0) / top * 100, false)}</td></tr>`).join('')}</tbody>
    </table></div>
    ${kapali.length ? `<p class="muted sm">Tamamı satılmış: ${kapali.map(v => `${esc(v.x.kod)} (${gizli(fFiyat(v.gercekTL, 'TRY'))})`).join(', ')}</p>` : ''}
    ${V.some(v => v.para !== 'TRY') ? '<p class="muted sm">Yabancı para birimindeki varlıklar güncel kurla TL\'ye çevrilmiştir. Kâr/zarar kendi para biriminde hesaplanıp güncel kurla gösterilir; kur farkını görmek için "Gerçek getiri" bölümüne bak.</p>' : ''}`;
}
function islemlerCiz() {
  const L = [...B.data.islemler].sort((a, b) => b.t - a.t);
  $('#bPIc').innerHTML = `
    <div class="br-p-arac"><button class="btn" data-action="b-csv-al">${IC.upload}CSV'den aktar</button><button class="btn" data-action="b-csv-ver">${IC.download}CSV olarak indir</button></div>
    <div class="br-tablo-k"><table class="br-tablo">
      <thead><tr><th>Tarih</th><th>Varlık</th><th>İşlem</th><th>Adet</th><th>Fiyat</th><th>Tutar</th><th></th></tr></thead>
      <tbody>${L.map(x => { const i = inst(x.s), tut = x.tip === 'temettu' ? (+x.tutar || x.adet * x.fiyat) : x.adet * x.fiyat; return `<tr>
        <td>${fTarih(x.t)}</td><td><b>${esc(i.kod)}</b></td>
        <td><span class="br-etiket ${x.tip}">${{ al: 'Alış', sat: 'Satış', temettu: 'Temettü' }[x.tip]}</span></td>
        <td>${x.tip === 'temettu' ? '' : gizli(fN(x.adet, x.adet % 1 ? 4 : 0))}</td><td>${x.tip === 'temettu' ? '' : fFiyat(x.fiyat, i.para)}</td>
        <td>${gizli(fFiyat(tut, i.para))}${x.kom ? `<small>Kom. ${fFiyat(x.kom, i.para)}</small>` : ''}</td>
        <td><button class="icon-btn sm" data-action="b-islem-duz" data-id="${esc(x.id)}" title="Düzenle">${IC.pen}</button></td></tr>`; }).join('')}</tbody>
    </table></div>`;
}
function islemForm(o = {}) {
  const x0 = o.id ? B.data.islemler.find(x => x.id === o.id) : null;
  const d = x0 ? { ...x0 } : { tip: 'al', s: o.s || B.detay || '', t: Date.now(), adet: '', fiyat: '', kom: '', not: '' };
  const ymd = t => { const z = new Date(t); return `${z.getFullYear()}-${String(z.getMonth() + 1).padStart(2, '0')}-${String(z.getDate()).padStart(2, '0')}`; };
  const ciz = () => {
    const i = d.s ? inst(d.s) : null, q = d.s ? Veri.q[d.s] : null;
    $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask br-form"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>${x0 ? 'İşlemi düzenle' : 'İşlem ekle'}</h3></header>
      <form class="set-body" id="bIF">
        <div class="seg br-tipseg">${[['al', 'Alış'], ['sat', 'Satış'], ['temettu', 'Temettü']].map(([k, n]) => `<button type="button" class="${d.tip === k ? 'on' : ''}" data-tip="${k}">${n}</button>`).join('')}</div>
        <label class="nask-l">Varlık<button type="button" class="btn br-sec" id="bISec">${i ? `<b>${esc(i.kod)}</b> ${esc(i.ad)}` : 'Seç…'}</button></label>
        <label class="nask-l">Tarih<input type="date" id="bIT" value="${ymd(d.t)}" max="${ymd(Date.now())}" required></label>
        ${d.tip === 'temettu' ? `<label class="nask-l">Alınan toplam tutar${i?.para ? ' (' + esc(i.para) + ')' : ''}<input type="number" step="any" min="0" id="bITut" value="${esc(d.tutar ?? '')}" required inputmode="decimal"></label>`
        : `<label class="nask-l">Adet<input type="number" step="any" min="0" id="bIA" value="${esc(d.adet)}" required inputmode="decimal" placeholder="Ör. 100"></label>
           <label class="nask-l">Birim fiyat${i?.para ? ' (' + esc(i.para) + ')' : ''}<input type="number" step="any" min="0" id="bIFi" value="${esc(d.fiyat)}" data-oto="${esc(d.oto || '')}" required inputmode="decimal" placeholder="${q?.fiyat ? 'Güncel: ' + fN(q.fiyat, 4) : ''}"></label>
           <label class="nask-l">Komisyon (isteğe bağlı)<input type="number" step="any" min="0" id="bIK" value="${esc(d.kom || '')}" inputmode="decimal"></label>`}
        <label class="nask-l">Not<input id="bIN" value="${esc(d.not || '')}" maxlength="120" placeholder="İsteğe bağlı"></label>
        <p class="muted sm" id="bIBilgi"></p>
        <div class="sticky-actions">${x0 ? `<button type="button" class="btn danger" id="bISil">${IC.trash}Sil</button>` : ''}<div class="spacer"></div><button type="button" class="btn" data-action="close-modal">Vazgeç</button><button class="btn primary">Kaydet</button></div>
      </form></div></div>`;
    $('#bIF').querySelectorAll('[data-tip]').forEach(b => b.onclick = () => { topla(); d.tip = b.dataset.tip; ciz(); });
    $('#bISec').onclick = () => { topla(); aramaAc({ baslik: 'Varlık seç', sec: id => { d.s = id; ozelKaydet(id); ciz(); fiyatOner(); } }); };
    $('#bIT').addEventListener('change', () => { topla(); fiyatOner(); });
    if ($('#bISil')) $('#bISil').onclick = () => { if (!confirm('Bu işlem silinsin mi?')) return; B.data.islemler = B.data.islemler.filter(x => x !== x0); degisti(); closeModal(); portfoyYenidenCiz(); toast('İşlem silindi'); };
    $('#bIF').addEventListener('submit', e => {
      e.preventDefault(); topla();
      if (!d.s) return toast('Varlık seç');
      const kayit = { id: x0?.id || yeniId(), s: d.s, tip: d.tip, t: d.t, not: d.not || undefined };
      if (d.tip === 'temettu') { kayit.tutar = +d.tutar; kayit.adet = 0; kayit.fiyat = 0; }
      else { kayit.adet = +d.adet; kayit.fiyat = +d.fiyat; if (+d.kom) kayit.kom = +d.kom; }
      if (d.tip === 'sat') {
        const elde = eldekiAdet(B.data.islemler.filter(x => x.id !== kayit.id), d.s, d.t + 1, B.splMap[d.s]) / bolunmeCarpani(B.splMap[d.s], d.t);
        if (kayit.adet > elde + 1e-9 && !confirm(`O tarihte elinde ${fN(elde, 4)} adet görünüyor. Yine de kaydedilsin mi?`)) return;
      }
      if (x0) Object.keys(x0).forEach(k => delete x0[k]), Object.assign(x0, kayit); else B.data.islemler.push(kayit);
      ozelKaydet(d.s); degisti(); closeModal(); portfoyYenidenCiz();
      toast(x0 ? 'İşlem güncellendi' : 'İşlem eklendi');
      if (!Veri.q[d.s]) Veri.fiyatlar([d.s]).then(portfoyYenidenCiz).catch(() => {});
    });
  };
  const topla = () => {
    const v = s => $(s)?.value;
    if (v('#bIT')) d.t = new Date(v('#bIT') + 'T12:00').getTime();
    if ($('#bIA')) { d.adet = v('#bIA'); d.fiyat = v('#bIFi'); d.kom = v('#bIK'); }
    if ($('#bITut')) d.tutar = v('#bITut');
    d.not = v('#bIN') || '';
  };
  // Seçilen tarihteki kapanış fiyatını öner (bölünme öncesi gerçek fiyata çevrilir)
  const fiyatOner = async () => {
    if (!d.s || d.tip === 'temettu' || !$('#bIFi')) return;
    try {
      const gun = gunBasi(d.t) === gunBasi(Date.now());
      const s = gun ? null : await Veri.seri(d.s, Date.now() - d.t > 4.5 * 365 * 864e5 ? 'T' : '5Y');
      const v = gun ? Veri.q[d.s]?.fiyat : seriDeger(s, d.t) * bolunmeCarpani(s?.spl, d.t);
      const el = $('#bIFi');
      if (v && el && (!el.value || el.value === el.dataset.oto)) { el.value = +v.toFixed(v < 1 ? 6 : 4); el.dataset.oto = d.oto = el.value; d.fiyat = el.value; }
      if (v && $('#bIBilgi')) $('#bIBilgi').textContent = `${fTarih(d.t, true)} kapanışı yaklaşık ${fFiyat(v, inst(d.s).para)}. Gerçek alım fiyatını yazabilirsin.`;
    } catch {}
  };
  ciz(); if (!x0) fiyatOner();
}
function portfoyYenidenCiz() {
  B.splMap = Object.fromEntries(Object.entries(B.splMap).filter(([k]) => !k.endsWith(':y')).map(([k, v]) => [k, v]));
  if (B.detay) { detayPozisyon(); return; }
  if (B.sekme === 'portfoy') portfoyCiz();
}
// Gerçek getiri: aynı paraları aynı günlerde dolara, euroya, altına ya da BIST 100'e yatırsaydın ne olurdu?
async function getiriCiz() {
  const el = $('#bPIc');
  el.innerHTML = `<div class="br-blok"><div class="br-grafik orta" id="bGG"></div><div id="bGT"><div class="list-msg">Geçmiş fiyatlar yükleniyor…</div></div></div>`;
  const islem = [...B.data.islemler].sort((a, b) => a.t - b.t), ilk = islem[0].t, uzun = Date.now() - ilk > 4.5 * 365 * 864e5 ? 'T' : '5Y';
  const semboller = [...new Set(islem.map(x => x.s))], kiyas = ['USDTRY=X', 'EURTRY=X', 'GRAM-ALTIN', 'XU100.IS'];
  const S_ = {};
  try {
    await pmap([...new Set([...semboller, ...kiyas])], 3, async s => { try { S_[s] = await Veri.seri(s, uzun); } catch { S_[s] = null; } });
  } catch {}
  if (B.psekme !== 'getiri' || !$('#bGT')) return;
  if (!S_['USDTRY=X']) { $('#bGT').innerHTML = `<div class="list-msg">Geçmiş fiyatlar alınamadı: ${esc(servisMesaj(new Error('')))}</div>`; return; }
  semboller.forEach(s => { if (S_[s]?.spl) B.splMap[s] = S_[s].spl; });
  const kurT = (para, t) => !para || para === 'TRY' ? 1 : seriDeger(S_[para === 'USD' ? 'USDTRY=X' : 'EURTRY=X'], t) || kur(para);
  // Nakit akışları (TL): alış +, satış −, temettü −
  const akis = islem.map(x => { const i = inst(x.s), k = kurT(i.para, x.t); const tut = x.tip === 'temettu' ? (+x.tutar || 0) : (+x.adet * +x.fiyat); return { t: x.t, tl: (x.tip === 'al' ? tut + (+x.kom || 0) : -(tut - (+x.kom || 0))) * k, tip: x.tip }; });
  // Gün listesi: ilk işlemden bugüne, dolar serisinin günleri
  const gunler = S_['USDTRY=X'].t.filter(t => t >= gunBasi(ilk));
  if (!gunler.length || gunler[gunler.length - 1] < gunBasi(Date.now())) gunler.push(Date.now());
  const deger = [], yatirim = [], kSeri = Object.fromEntries(kiyas.map(k => [k, []])), enf = [];
  const birim = Object.fromEntries(kiyas.map(k => [k, 0])); let net = 0, enfD = 0, ai = 0, nakit = 0;
  gunler.forEach(t => {
    while (ai < akis.length && akis[ai].t <= t + 12 * 3600e3) {
      const a = akis[ai++]; net += a.tl; if (a.tl < 0) nakit += -a.tl;
      kiyas.forEach(k => { const p = seriDeger(S_[k], a.t); if (p) birim[k] += a.tl / p; });
      const tf = TUFE.deger(a.t); if (tf) enfD += a.tl / tf;
    }
    let v = 0;
    semboller.forEach(s => { const adet = eldekiAdet(islem, s, t + 12 * 3600e3, S_[s]?.spl || B.splMap[s]); if (adet > 0) { const p = t === gunler[gunler.length - 1] && Veri.q[s]?.fiyat ? Veri.q[s].fiyat : seriDeger(S_[s], t); v += adet * (p || 0) * kurT(inst(s).para, t); } });
    deger.push(v + nakit); yatirim.push(net + nakit);
    kiyas.forEach(k => kSeri[k].push(birim[k] * (seriDeger(S_[k], t) || 0) + nakit));
    const tf = TUFE.deger(Math.min(t, TUFE.sonAy.getTime() + 31 * 864e5)); enf.push(tf ? enfD * tf + nakit : null);
  });
  const son = deger.length - 1, P = deger[son];
  const sen = [['Dolar', 'USDTRY=X'], ['Euro', 'EURTRY=X'], ['Gram altın', 'GRAM-ALTIN'], ['BIST 100', 'XU100.IS']].map(([ad, k]) => ({ ad, v: kSeri[k][son], seri: kSeri[k] }));
  sen.push({ ad: 'Enflasyon (TÜFE)', v: enf[son], seri: enf });
  const renkler = { 'Portföyün': '#4262ff', 'Dolar': '#16a34a', 'Euro': '#0ea5e9', 'Gram altın': '#d4a017', 'BIST 100': '#8b5cf6', 'Enflasyon (TÜFE)': '#ef4444' };
  const g = B.grafik = new Grafik($('#bGG'), { onHover: i => {
    const t = $('#bGLeg'); if (!t) return;
    const j = i ?? son;
    t.innerHTML = `<span class="muted sm">${fTarih(gunler[j], true)}</span>` + [['Portföyün', deger[j]], ...sen.map(s => [s.ad, s.seri[j]])].map(([a, v]) => `<span><i style="background:${renkler[a]}"></i>${a} <b>${gizli(fBuyuk(v, 'TRY'))}</b></span>`).join('');
  } });
  g.set({ seriler: [{ t: gunler, c: deger, renk: renkler['Portföyün'] }, ...sen.map(s => ({ t: gunler, c: s.seri.map(v => v ?? null), renk: renkler[s.ad] }))], tip: 'cizgi',
    zamanEtiket: t => new Date(t).toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' }), imlecEtiket: t => fTarih(t) });
  const fark = v => v ? (P / v - 1) * 100 : null;
  $('#bGT').innerHTML = `<div class="br-g-leg" id="bGLeg"></div>
    <div class="br-tablo-k"><table class="br-tablo br-gt">
      <thead><tr><th>Aynı paralar şuraya gitseydi</th><th>Bugünkü değeri</th><th>Portföyün buna göre</th></tr></thead>
      <tbody><tr class="vurgu"><td><b>Portföyün</b><span>Bugünkü değer + satış ve temettü gelirleri</span></td><td>${gizli(fFiyat(P, 'TRY'))}</td><td></td></tr>
      ${sen.map(s => { const f = fark(s.v); return `<tr><td><i class="br-nokta" style="background:${renkler[s.ad]}"></i>${s.ad}</td><td>${gizli(fFiyat(s.v, 'TRY'))}</td><td class="${renkSinif(f)}">${f == null ? '—' : f >= 0 ? `${fPct(f, false)} daha iyi` : `${fPct(-f, false)} daha kötü`}</td></tr>`; }).join('')}
      </tbody></table></div>
    <div class="br-ozet-cumle">${(() => { const e = fark(enf[son]), d = fark(sen[0].v); return `<p>Enflasyondan arındırılmış (reel) getirin: <b class="${renkSinif(e)}">${fPct(e)}</b>. Dolar bazında: <b class="${renkSinif(d)}">${fPct(d)}</b>.</p>`; })()}
      <p class="muted sm">Hesap: her alışta ödediğin TL ile aynı gün dolar, euro, gram altın ya da BIST 100 alınsaydı; her satışta aynı TL tutarı geri çekilseydi bugün elinde ne olurdu. Enflasyon, TÜİK aylık TÜFE verisiyle (${TUFE.sonAy.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}'a kadar) hesaplanır. Vergi ve stopaj dahil değildir.</p></div>`;
  g.opt.onHover(null);
}
// Temettüler: elle girilenler + geçmiş verisinden otomatik bulunanlar (o gün elde tutulan adetle)
async function temettuCiz() {
  const el = $('#bPIc');
  el.innerHTML = '<div class="list-msg">Temettü geçmişi yükleniyor…</div>';
  const semboller = [...new Set(B.data.islemler.filter(x => x.tip !== 'temettu').map(x => x.s))].filter(s => /^(bist|abd)$/.test(inst(s).tur));
  const S_ = {};
  await pmap(semboller, 3, async s => { try { S_[s] = await Veri.seri(s, '5Y'); } catch {} });
  if (B.psekme !== 'temettu' || !$('#bPIc')) return;
  const oto = ayar('temettuOto', true), L = [];
  B.data.islemler.filter(x => x.tip === 'temettu').forEach(x => L.push({ t: x.t, s: x.s, tutar: +x.tutar || 0, para: inst(x.s).para, elle: true, id: x.id }));
  if (oto) semboller.forEach(s => (S_[s]?.div || []).forEach(([t, v]) => {
    const adet = eldekiAdet(B.data.islemler, s, t - 864e5, S_[s].spl);
    if (adet > 0 && !L.some(z => z.elle && z.s === s && Math.abs(z.t - t) < 45 * 864e5)) L.push({ t, s, tutar: adet * v, para: inst(s).para, hisseBasi: v, adet });
  }));
  L.sort((a, b) => b.t - a.t);
  const yil = {}; L.forEach(z => { const y = new Date(z.t).getFullYear(); yil[y] = (yil[y] || 0) + z.tutar * kur(z.para, z.t); });
  const yillar = Object.keys(yil).sort(), mx = Math.max(...Object.values(yil), 1);
  el.innerHTML = `
    <div class="br-p-arac"><label class="br-anahtar"><input type="checkbox" id="bTO" ${oto ? 'checked' : ''}> Geçmiş verisinden otomatik bul</label><button class="btn" data-action="b-temettu-yeni">${IC.plusI}Temettü ekle</button></div>
    ${yillar.length ? `<div class="br-yil">${yillar.map(y => `<div><i style="height:${Math.max(4, yil[y] / mx * 100)}%"></i><b>${gizli(fBuyuk(yil[y], 'TRY'))}</b><span>${y}</span></div>`).join('')}</div>` : ''}
    <div class="br-tablo-k"><table class="br-tablo"><thead><tr><th>Tarih</th><th>Varlık</th><th>Hisse başı</th><th>Adet</th><th>Tutar</th><th></th></tr></thead>
    <tbody>${L.map(z => `<tr><td>${fTarih(z.t)}</td><td><b>${esc(inst(z.s).kod)}</b></td><td>${z.hisseBasi ? fFiyat(z.hisseBasi, z.para) : ''}</td><td>${z.adet ? gizli(fN(z.adet, z.adet % 1 ? 2 : 0)) : ''}</td>
      <td>${gizli(fFiyat(z.tutar, z.para))}</td><td>${z.elle ? `<button class="icon-btn sm" data-action="b-islem-duz" data-id="${esc(z.id)}">${IC.pen}</button>` : '<span class="br-etiket oto">otomatik</span>'}</td></tr>`).join('') || '<tr><td colspan="6"><div class="list-msg">Temettü bulunamadı</div></td></tr>'}</tbody></table></div>
    <p class="muted sm">Otomatik bulunan tutarlar brüttür (stopaj düşülmemiştir) ve hak kullanım tarihinde elinde olan adede göre hesaplanır.</p>`;
  $('#bTO').onchange = e => { B.data.ayar.temettuOto = e.target.checked; degisti(); temettuCiz(); };
}
function csvVer() {
  const satirlar = [['tarih', 'sembol', 'islem', 'adet', 'fiyat', 'komisyon', 'tutar', 'not'], ...[...B.data.islemler].sort((a, b) => a.t - b.t).map(x => [new Date(x.t).toISOString().slice(0, 10), x.s, x.tip, x.adet || '', x.fiyat || '', x.kom || '', x.tutar || '', x.not || ''])];
  const csv = '﻿' + satirlar.map(r => r.map(v => /[;"\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v).join(';')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = 'portfoy-islemleri.csv'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
function csvAl() {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.csv,text/csv';
  inp.onchange = async () => {
    const f = inp.files[0]; if (!f) return;
    const metin = (await f.text()).replace(/^﻿/, ''), ayr = metin.split('\n')[0].includes(';') ? ';' : ',';
    const satir = metin.split(/\r?\n/).filter(Boolean).map(l => { const o = []; let c = '', q = false; for (const ch of l) { if (ch === '"') q = !q; else if (ch === ayr && !q) { o.push(c); c = ''; } else c += ch; } o.push(c); return o.map(s => s.trim()); });
    const bas = satir.shift().map(h => h.toLowerCase());
    const col = (...a) => bas.findIndex(h => a.some(x => h.includes(x)));
    const ci = { t: col('tarih', 'date'), s: col('sembol', 'symbol', 'kod'), tip: col('islem', 'işlem', 'type', 'tür'), a: col('adet', 'miktar', 'quantity'), f: col('fiyat', 'price'), k: col('komisyon', 'fee'), tut: col('tutar', 'amount'), n: col('not', 'note') };
    if (ci.t < 0 || ci.s < 0) return toast('CSV\'de en az "tarih" ve "sembol" sütunları olmalı');
    const sayi = v => +String(v || '').replace(/\s/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.') || 0;
    let n = 0;
    satir.forEach(r => {
      let s = (r[ci.s] || '').toUpperCase(); if (!s) return;
      if (!/[.=^-]/.test(s) && !ABD.some(a => a[0] === s) && /^[A-Z0-9]{4,6}$/.test(s)) s += '.IS';
      const tipH = (r[ci.tip] || 'al').toLowerCase(), tip = /sat|sell/.test(tipH) ? 'sat' : /tem|div/.test(tipH) ? 'temettu' : 'al';
      const t = new Date(/^\d{1,2}[./]\d{1,2}[./]\d{4}$/.test(r[ci.t]) ? r[ci.t].replace(/^(\d+)[./](\d+)[./](\d+)$/, '$3-$2-$1') : r[ci.t]).getTime() + 12 * 3600e3;
      if (!isFinite(t)) return;
      B.data.islemler.push({ id: yeniId(), s, tip, t, adet: sayi(r[ci.a]), fiyat: sayi(r[ci.f]), ...(sayi(r[ci.k]) ? { kom: sayi(r[ci.k]) } : {}), ...(tip === 'temettu' ? { tutar: sayi(r[ci.tut]) || sayi(r[ci.a]) * sayi(r[ci.f]) } : {}), ...(r[ci.n] ? { not: r[ci.n] } : {}) });
      ozelKaydet(s); n++;
    });
    degisti(); portfoyYenidenCiz(); yenile();
    toast(`${n} işlem aktarıldı`);
  };
  inp.click();
}

/* ═════════ Karşılaştır ═════════ */
function karsCiz() {
  $('#bView').innerHTML = `
    <div class="br-page">
      <div class="br-h1"><h2>Karşılaştır</h2><span class="muted sm">En fazla 6 varlık · başlangıca göre % değişim</span></div>
      <div class="br-cipler">${B.kars.map((id, i) => `<span class="br-cip on renkli" style="--r:${PALET[i]}"><i></i>${esc(inst(id).kod)}<button data-action="b-kars-sil" data-id="${esc(id)}" title="Çıkar">×</button></span>`).join('')}
        ${B.kars.length < 6 ? `<button class="br-cip yeni" data-action="b-kars-ekle">${IC.plusI}Ekle</button>` : ''}</div>
      <div class="br-grafik-arac"><div class="seg br-aralik">${Object.keys(ARALIK).filter(k => k !== '1G').map(k => `<button class="${B.karsAralik === k ? 'on' : ''}" data-action="b-kars-aralik" data-k="${k}">${k === 'T' ? 'Tümü' : k}</button>`).join('')}</div></div>
      <div class="br-grafik" id="bKG"></div>
      <div class="br-k-sonuc" id="bKS"></div>
      <p class="muted sm">Farklı para birimindeki varlıklar kendi para birimlerinde karşılaştırılır. Örneğin TL'deki bir hisseyi dolarla karşılaştırmak için listeye "Dolar"ı da ekle.</p>
    </div>`;
  B.grafik = new Grafik($('#bKG'), { onHover: i => karsSonuc(i) });
  karsYukle();
}
let karsVeri = [];
async function karsYukle() {
  B.grafik.set({ seriler: [], mesaj: B.kars.length ? 'Yükleniyor…' : 'Karşılaştırmak için varlık ekle' });
  if (!B.kars.length) { $('#bKS').innerHTML = ''; return; }
  const ar = B.karsAralik;
  const veriler = await Promise.all(B.kars.map(id => Veri.seri(id, ar).catch(() => null)));
  if (B.karsAralik !== ar || !B.grafik) return;
  const t0 = Math.max(...veriler.filter(Boolean).map(s => s.t[0]));
  karsVeri = B.kars.map((id, i) => {
    const s = veriler[i]; if (!s?.c?.length) return null;
    const j = Math.max(0, s.t.findIndex(t => t >= t0)), t = s.t.slice(j), c = s.c.slice(j), b = c[0];
    return { id, t, c, y: c.map(v => (v / b - 1) * 100), renk: PALET[i] };
  });
  const ok = karsVeri.filter(Boolean);
  if (!ok.length) { B.grafik.set({ seriler: [], mesaj: 'Veri alınamadı: ' + servisMesaj(new Error('')) }); return; }
  const fmt = /^(1H)$/.test(ar) ? t => new Date(t).toLocaleDateString('tr-TR', { weekday: 'short' }) : /^(1A|3A)$/.test(ar) ? t => new Date(t).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : ar === '1Y' ? t => new Date(t).toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' }) : t => String(new Date(t).getFullYear());
  B.grafik.set({ seriler: ok, tip: 'cizgi', yuzde: true, zamanX: true, zamanEtiket: fmt, imlecEtiket: t => fTarih(t) });
  karsSonuc(null);
}
function karsSonuc(i) {
  const el = $('#bKS'); if (!el) return;
  const ok = karsVeri.filter(Boolean), t = i != null && ok[0] ? ok[0].t[i] : null;
  el.innerHTML = ok.map(k => { const j = t != null ? enYakin(k.t, t) : k.y.length - 1, v = k.y[j]; return `<div class="br-k-s" data-action="b-detay" data-id="${esc(k.id)}"><i style="background:${k.renk}"></i><b>${esc(inst(k.id).kod)}</b><span class="br-deg ${renkSinif(v)}">${fPct(v)}</span></div>`; }).join('')
    + (t != null ? `<span class="muted sm">${fTarih(t, true)}</span>` : '');
}

/* ═════════ Tarama ═════════ */
const TARA_SUTUN = [['kod', 'Varlık'], ['sek', 'Sektör'], ['fiyat', 'Fiyat'], ['deg', 'Gün'], ['pd', 'Piyasa değeri'], ['fk', 'F/K'], ['zirve', '52h zirveye'], ['ara', '52h aralıkta']];
function taramaCiz() {
  const T = B.tara, sekler = [...new Set(KAT.filter(x => x.tur === T.piyasa).map(x => x.sek))].sort((a, b) => a.localeCompare(b, 'tr'));
  $('#bView').innerHTML = `
    <div class="br-page">
      <div class="br-h1"><h2>Hisse tarama</h2><div class="seg">${[['bist', 'Borsa İstanbul'], ['abd', 'ABD']].map(([k, n]) => `<button class="${T.piyasa === k ? 'on' : ''}" data-action="b-tara-piyasa" data-k="${k}">${n}</button>`).join('')}</div></div>
      <form class="br-filtre" id="bTF">
        <label>Sektör<select name="sek"><option value="">Hepsi</option>${sekler.map(s => `<option ${T.sek === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select></label>
        <label>F/K en fazla<input name="fk" type="number" step="any" min="0" value="${esc(T.fk)}" placeholder="Ör. 10" inputmode="decimal"></label>
        <label>Günlük değişim en az<input name="deg" type="number" step="any" value="${esc(T.deg)}" placeholder="Ör. 2 ya da -3" inputmode="decimal"></label>
        <label>52h zirveye en fazla uzak (%)<input name="zirve" type="number" step="any" min="0" value="${esc(T.zirve)}" placeholder="Ör. 10" inputmode="decimal"></label>
        <button type="button" class="btn" data-action="b-tara-temizle">Temizle</button>
      </form>
      <div class="br-tablo-k"><table class="br-tablo br-tara"><thead><tr>${TARA_SUTUN.map(([k, n]) => `<th data-action="b-tara-sira" data-k="${k}" class="${T.sira === k ? 'sirali' : ''}">${n}${T.sira === k ? (T.ters ? ' ↓' : ' ↑') : ''}</th>`).join('')}</tr></thead><tbody id="bTB"></tbody></table></div>
      <p class="muted sm">Liste, Borsa İstanbul ve ABD'nin büyük şirketlerinden oluşur. Başka hisseleri arama ile bulabilirsin. Veriler gecikmelidir; tarama sonucu tavsiye değildir.</p>
    </div>`;
  $('#bTF').addEventListener('input', e => { const f = e.target; if (!f.name) return; T[f.name] = f.value; taramaTablo(); });
  $('#bTF').addEventListener('submit', e => e.preventDefault());
  taramaTablo();
  if (KAT.filter(x => x.tur === T.piyasa).some(x => !Veri.q[x.id])) yenile();
}
function taramaTablo() {
  const tb = $('#bTB'); if (!tb) return;
  const T = B.tara;
  let L = KAT.filter(x => x.tur === T.piyasa).map(x => {
    const q = Veri.q[x.id] || {};
    return { x, kod: x.kod, sek: x.sek, fiyat: q.fiyat, deg: Veri.deg(x.id), pd: q.pd, fk: q.fk, zirve: q.y52 && q.fiyat ? (1 - q.fiyat / q.y52) * 100 : null, ara: q.y52 && q.d52 && q.fiyat ? (q.fiyat - q.d52) / (q.y52 - q.d52) * 100 : null, para: q.para || x.para };
  });
  if (T.sek) L = L.filter(r => r.sek === T.sek);
  if (T.fk !== '') L = L.filter(r => r.fk != null && r.fk > 0 && r.fk <= +T.fk);
  if (T.deg !== '') L = L.filter(r => r.deg != null && r.deg >= +T.deg);
  if (T.zirve !== '') L = L.filter(r => r.zirve != null && r.zirve <= +T.zirve);
  const k = T.sira;
  L.sort((a, b) => { const x = a[k], y = b[k]; if (x == null) return 1; if (y == null) return -1; const r = typeof x === 'string' ? x.localeCompare(y, 'tr') : x - y; return T.ters ? -r : r; });
  tb.innerHTML = L.map(r => `<tr data-action="b-detay" data-id="${esc(r.x.id)}">
    <td><b>${esc(r.kod)}</b><span>${esc(r.x.ad)}</span></td><td>${esc(r.sek)}</td><td>${fFiyat(r.fiyat, r.para)}</td>
    <td class="${renkSinif(r.deg)}">${fPct(r.deg)}</td><td>${fBuyuk(r.pd, r.para)}</td><td>${r.fk ? fN(r.fk, 1) : '—'}</td>
    <td>${r.zirve == null ? '—' : '%' + fN(r.zirve, 1)}</td><td>${r.ara == null ? '—' : `<div class="br-mini-bar"><i style="left:${Math.max(0, Math.min(100, r.ara))}%"></i></div>`}</td></tr>`).join('')
    || `<tr><td colspan="8"><div class="list-msg">${Object.keys(Veri.q).length ? 'Bu filtrelere uyan hisse yok' : 'Fiyatlar yükleniyor…'}</div></td></tr>`;
}

/* ═════════ Alarmlar ═════════ */
function alarmlarCiz() {
  const L = [...B.data.alarmlar].sort((a, b) => (a.tetik ? 1 : 0) - (b.tetik ? 1 : 0) || b.olustu - a.olustu);
  const izin = 'Notification' in window ? Notification.permission : 'yok';
  $('#bView').innerHTML = `
    <div class="br-page">
      <div class="br-h1"><h2>Fiyat alarmları</h2><div class="spacer"></div><button class="btn primary" data-action="b-alarm-yeni">${IC.plusI}<span>Alarm kur</span></button></div>
      <div class="br-bilgi">${IC.info}<div><b>Nasıl çalışır?</b><span>Fiyat seviyeni geçince ${DEMO || !S.email ? 'e-posta adresine' : esc(S.email) + ' adresine'} mail gelir (yaklaşık 10 dakikada bir kontrol edilir, uygulama kapalıyken de). Uygulama açıkken ayrıca bildirim görürsün.</span>
        ${izin === 'default' ? `<button class="btn sm" data-action="b-bildirim-izin">Bildirimlere izin ver</button>` : ''}${!DEMO && !SERVIS() ? '<em>Suha Servis bağlı olmadığı için alarmlar sadece uygulama açıkken çalışır.</em>' : ''}</div></div>
      <div class="br-satirlar">${L.map(a => { const x = inst(a.s), q = Veri.q[a.s], uz = q?.fiyat ? (a.d / q.fiyat - 1) * 100 : null; return `
        <div class="br-alarm ${a.tetik ? 'oldu' : ''}">
          <div class="br-alarm-ic">${a.tetik ? IC.check || IC.bell : IC.bell}</div>
          <div class="br-satir-ad" data-action="b-detay" data-id="${esc(a.s)}"><b>${esc(x.kod)} ${a.tip === 'ust' ? '≥' : '≤'} ${fFiyat(a.d, q?.para || x.para)}</b>
            <span>${a.tetik ? `Çalıştı · ${esc(fmtDate(a.tetik, true))}` : `Bekliyor · şu an ${fFiyat(q?.fiyat, q?.para || x.para)}${uz != null ? ` (seviyeye %${fN(Math.abs(uz), 1)})` : ''}`}${a.not ? ' · ' + esc(a.not) : ''}</span></div>
          ${a.tetik ? `<button class="btn sm" data-action="b-alarm-kur" data-id="${esc(a.id)}">Yeniden kur</button>` : ''}
          <button class="icon-btn sm" data-action="b-alarm-duz" data-id="${esc(a.id)}" title="Düzenle">${IC.pen}</button>
        </div>`; }).join('') || `<div class="br-bos">${IC.bell}<b>Alarm yok</b><span>"THYAO 300 TL'yi geçerse haber ver" gibi bir alarm kur.</span><button class="btn primary" data-action="b-alarm-yeni">${IC.plusI}Alarm kur</button></div>`}</div>
    </div>`;
}
function alarmForm(o = {}) {
  const a0 = o.id ? B.data.alarmlar.find(a => a.id === o.id) : null;
  const d = a0 ? { ...a0 } : { s: o.s || B.detay || '', tip: 'ust', d: '', not: '' };
  const ciz = () => {
    const x = d.s ? inst(d.s) : null, q = d.s ? Veri.q[d.s] : null;
    if (d.d === '' && q?.fiyat) d.d = +(q.fiyat * (d.tip === 'ust' ? 1.05 : 0.95)).toPrecision(5);
    $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask br-form"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>${a0 ? 'Alarmı düzenle' : 'Alarm kur'}</h3></header>
      <form class="set-body" id="bAF">
        <label class="nask-l">Varlık<button type="button" class="btn br-sec" id="bASec">${x ? `<b>${esc(x.kod)}</b> ${esc(x.ad)}` : 'Seç…'}</button></label>
        ${q?.fiyat ? `<p class="muted sm">Şu anki fiyat: ${fFiyat(q.fiyat, q.para || x.para)}</p>` : ''}
        <div class="seg br-tipseg">${[['ust', 'Üstüne çıkınca'], ['alt', 'Altına inince']].map(([k, n]) => `<button type="button" class="${d.tip === k ? 'on' : ''}" data-tip="${k}">${n}</button>`).join('')}</div>
        <label class="nask-l">Seviye${x?.para ? ' (' + esc(x.para) + ')' : ''}<input type="number" step="any" min="0" id="bAD" value="${esc(d.d)}" required inputmode="decimal"></label>
        <div class="br-hizli">${[-10, -5, 5, 10].map(p => `<button type="button" class="br-cip sm" data-p="${p}">${p > 0 ? '+' : ''}${p}%</button>`).join('')}</div>
        <label class="nask-l">Not<input id="bAN" value="${esc(d.not || '')}" maxlength="60" placeholder="İsteğe bağlı"></label>
        <div class="sticky-actions">${a0 ? `<button type="button" class="btn danger" id="bASil">${IC.trash}Sil</button>` : ''}<div class="spacer"></div><button type="button" class="btn" data-action="close-modal">Vazgeç</button><button class="btn primary">Kaydet</button></div>
      </form></div></div>`;
    $('#bAF').querySelectorAll('[data-tip]').forEach(b => b.onclick = () => { d.d = $('#bAD').value; d.not = $('#bAN').value; d.tip = b.dataset.tip; ciz(); });
    $('#bAF').querySelectorAll('[data-p]').forEach(b => b.onclick = () => { if (q?.fiyat) { const v = q.fiyat * (1 + b.dataset.p / 100); $('#bAD').value = +v.toPrecision(5); d.tip = v >= q.fiyat ? 'ust' : 'alt'; d.d = $('#bAD').value; d.not = $('#bAN').value; ciz(); } });
    $('#bASec').onclick = () => { d.not = $('#bAN').value; aramaAc({ baslik: 'Varlık seç', sec: id => { d.s = id; d.d = ''; ozelKaydet(id); if (!Veri.q[id]) Veri.fiyatlar([id]).then(ciz).catch(() => {}); ciz(); } }); };
    if ($('#bASil')) $('#bASil').onclick = () => { B.data.alarmlar = B.data.alarmlar.filter(a => a !== a0); degisti(); alarmSenkron(); closeModal(); goster(); toast('Alarm silindi'); };
    $('#bAF').addEventListener('submit', e => {
      e.preventDefault();
      if (!d.s) return toast('Varlık seç');
      if (B.data.alarmlar.filter(a => !a.tetik).length >= 30 && !a0) return toast('En fazla 30 alarm kurulabilir');
      const k = { id: a0?.id || yeniId(), s: d.s, tip: d.tip, d: +$('#bAD').value, not: $('#bAN').value.trim() || undefined, olustu: a0?.olustu || Date.now(), tetik: 0, yeniden: !!a0?.tetik };
      if (a0) Object.assign(a0, k); else B.data.alarmlar.push(k);
      degisti(); alarmSenkron(); closeModal(); goster();
      toast(`Alarm kuruldu: ${inst(d.s).kod} ${d.tip === 'ust' ? '≥' : '≤'} ${fN(k.d, 4)}`);
    });
  };
  ciz();
}
// Alarmları Suha Servis'e gönder (uygulama kapalıyken mail ile haber vermesi için)
let alarmT = 0;
function alarmSenkron() {
  if (DEMO || !SERVIS()) return;
  clearTimeout(alarmT);
  alarmT = setTimeout(async () => {
    try {
      const j = await servis('borsa-alarm', { alarmlar: B.data.alarmlar.map(a => ({ id: a.id, s: KAT_BY[a.s]?.tureyen ? null : a.s, ad: inst(a.s).kod, tip: a.tip, d: a.d, tetik: a.tetik || 0, yeniden: a.yeniden })).filter(a => a.s) });
      let degis = false;
      (j.alarmlar || []).forEach(s => { const a = B.data.alarmlar.find(x => x.id === s.id); if (a && s.tetik && !a.tetik) { a.tetik = s.tetik; degis = true; } });
      B.data.alarmlar.forEach(a => { if (a.yeniden) { delete a.yeniden; degis = true; } });
      if (degis) { degisti(); if (B.sekme === 'alarmlar' && !B.detay) alarmlarCiz(); navCiz(); }
    } catch (e) { console.warn('alarm senkron', e.message); }
  }, 600);
}
// Uygulama açıkken: seviye geçildiyse bildirim
function alarmKontrol() {
  let degis = false;
  B.data.alarmlar.forEach(a => {
    if (a.tetik) return; const q = Veri.q[a.s]; if (!q?.fiyat) return;
    if ((a.tip === 'ust' && q.fiyat >= a.d) || (a.tip === 'alt' && q.fiyat <= a.d)) {
      a.tetik = Date.now(); degis = true;
      const x = inst(a.s), m = `${x.kod} ${fFiyat(q.fiyat, q.para || x.para)} — ${a.tip === 'ust' ? 'seviyenin üstüne çıktı' : 'seviyenin altına indi'} (${fN(a.d, 4)})`;
      toast('Alarm: ' + m, [], 8000);
      try { if ('Notification' in window && Notification.permission === 'granted') new Notification('Borsa alarmı', { body: m, icon: 'borsa-192.png', tag: 'borsa-' + a.id }); } catch {}
    }
  });
  if (degis) { degisti(); navCiz(); if (B.sekme === 'alarmlar' && !B.detay) alarmlarCiz(); }
}

/* ═════════ Ayarlar ═════════ */
function ayarlarAc() {
  const t = store.get('theme', 'light'), y = ayar('yenile', 120), tablo = store.get('borsaTablo');
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet settings"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Ayarlar</h3></header>
    <div class="set-body">
      <section><h4>Görünüm</h4><div class="seg yon-seg">${[['light', 'Cam'], ['dark', 'Koyu'], ['auto', 'Otomatik'], ['flat', 'Düz']].map(([k, n]) => `<button class="${t === k ? 'on' : ''}" data-action="b-tema" data-t="${k}">${n}</button>`).join('')}</div></section>
      <section><h4>Fiyatlar</h4>
        <div class="set-row"><div><b>Otomatik yenileme</b><span>Uygulama açıkken fiyatlar bu aralıkla güncellenir. Kaynak verileri zaten 15-20 dakika gecikmelidir.</span></div>
          <select id="bYen">${[[60, '1 dakika'], [120, '2 dakika'], [300, '5 dakika'], [600, '10 dakika']].map(([v, n]) => `<option value="${v}" ${y === v ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
        ${DEMO ? '' : `<div class="set-row"><div><b>Fiyat tablosu</b><span>Fiyatlar Drive'ındaki "Suha Borsa Fiyatlar" tablosunda Google Finance ile hesaplanır.${B.tabloHata ? ' Son hata: ' + esc(B.tabloHata) : ''}</span></div>${tablo ? `<a class="btn" href="https://docs.google.com/spreadsheets/d/${esc(tablo)}" target="_blank" rel="noopener">Aç</a>` : ''}</div>
        <div class="set-row"><div><b>Suha Servis</b><span id="bSD">Grafik geçmişi, haberler, arama ve alarm mailleri buradan gelir. ${SERVIS() ? '' : 'Bağlı değil.'}</span></div>${SERVIS() ? '<button class="btn" data-action="b-servis-test">Dene</button>' : ''}</div>`}
      </section>
      <section><h4>Gizlilik</h4><div class="set-row"><div><b>Tutarları gizle</b><span>Portföydeki tutar ve adetler •••• olarak görünür (fiyatlar görünmeye devam eder).</span></div><button type="button" class="switch ${B.gizle ? 'on' : ''}" id="bGz" aria-label="Tutarları gizle"><i></i></button></div></section>
      <section><h4>Verilerin</h4><div class="set-row"><div><b>Yedek</b><span>Listeler, işlemler ve alarmlar ${DEMO ? 'örnek modda kaydedilmez' : 'Drive\'ında "Suha Borsa.json" dosyasında durur'}.</span></div><button class="btn" data-action="b-yedek">${IC.download}İndir</button></div></section>
      <section><h4>Hesap</h4><div class="set-row"><div><b>${esc(S.email || '')}</b><span>Program Drive'daki başka dosyalarını göremez; sadece kendi oluşturduğu iki dosyayı kullanır.</span></div>
        <button class="btn" data-action="logout">${IC.logout}Çıkış yap</button></div></section>
      <section><h4>Uygulama</h4>${typeof aboutRow === 'function' ? aboutRow() : ''}${typeof feedbackRow === 'function' ? feedbackRow() : ''}
        <p class="muted sm">Fiyatlar Google Finance ve Yahoo Finance kaynaklıdır ve 15-20 dakika gecikmelidir; hatalı olabilir. Haberler Google Haberler'den gelir. Enflasyon verisi TÜİK'tir. Bu uygulama alım-satım yapmaz ve yatırım tavsiyesi vermez.</p></section>
    </div></div></div>`;
  $('#bYen').onchange = e => { B.data.ayar.yenile = +e.target.value; degisti(); };
  $('#bGz').onclick = e => { B.gizle = !B.gizle; store.set('borsaGizle', B.gizle); e.currentTarget.classList.toggle('on', B.gizle); goster(); };
}

/* ═════════ Küçük yardımcılar: açılır menü, soru ═════════ */
function bPop(el, ogeler, sec) {
  document.querySelector('.br-pop')?.remove();
  const p = document.createElement('div'); p.className = 'br-pop';
  p.innerHTML = ogeler.map(([v, ic, ad, kapali, tehlike]) => `<button data-v="${v}" ${kapali ? 'disabled' : ''} ${tehlike ? 'class="tehlike"' : ''}>${ic || ''}<span>${esc(ad)}</span></button>`).join('');
  document.body.appendChild(p);
  const r = el.getBoundingClientRect(), w = p.offsetWidth, h = p.offsetHeight;
  p.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.right - w)) + 'px';
  p.style.top = (r.bottom + h + 8 > innerHeight ? Math.max(8, r.top - h - 4) : r.bottom + 4) + 'px';
  const kapat = e => { if (e && p.contains(e.target)) return; p.remove(); document.removeEventListener('pointerdown', kapat, true); };
  setTimeout(() => document.addEventListener('pointerdown', kapat, true), 0);
  p.addEventListener('click', e => { const b = e.target.closest('button'); if (!b || b.disabled) return; kapat(); sec(b.dataset.v); });
}
function bSor(baslik, etiket, deger = '') {
  return new Promise(res => {
    $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>${esc(baslik)}</h3></header>
      <form class="set-body" id="bSF"><label class="nask-l">${esc(etiket)}<input id="bSQ" value="${esc(deger)}" maxlength="40" required></label>
      <div class="sticky-actions"><button type="button" class="btn" data-action="close-modal">Vazgeç</button><button class="btn primary">Tamam</button></div></form></div></div>`;
    $('#bSF').addEventListener('submit', e => { e.preventDefault(); const v = $('#bSQ').value.trim(); closeModal(); res(v); });
    setTimeout(() => { $('#bSQ').focus(); $('#bSQ').select(); }, 50);
    const gozle = new MutationObserver(() => { if (!$('#bSF')) { gozle.disconnect(); res(''); } }); gozle.observe($('#modal'), { childList: true });
  });
}

/* ═════════ Olaylar ═════════ */
Object.assign(ACTIONS, {
  'b-sekme': el => { B.detay = null; B.sekme = el.dataset.t; store.set('borsaSekme', B.sekme); goster(); if (B.sekme === 'piyasa' || B.sekme === 'tarama') yenile(); },
  'b-detay': (el, e) => { if (e?.target.closest('.br-satir-m')) return; detayAc(el.dataset.id); },
  'b-geri': () => { B.detay = null; goster(); },
  'b-ara': () => aramaAc({ baslik: 'Ara' }),
  'b-yenile': () => { Veri.gecmis = {}; yenile(); if (B.detay) grafikYukle(); },
  'b-ayar': () => ayarlarAc(), settings: () => ayarlarAc(),
  'b-tema': el => { store.set('theme', el.dataset.t); applyTheme(el.dataset.t); ayarlarAc(); },
  'b-isi': el => { B.isi = el.dataset.k; store.set('borsaIsi', B.isi); piyasaGuncelle(); $('#bView').querySelectorAll('[data-action="b-isi"]').forEach(b => b.classList.toggle('on', b === el)); if (KAT.filter(x => x.tur === B.isi).some(x => !Veri.q[x.id])) yenile(); },
  'b-rozet': () => { B.rozet = { yuzde: 'deger', deger: 'pd', pd: 'yuzde' }[B.rozet]; store.set('borsaRozet', B.rozet); listelerCiz(); },
  'b-liste-sec': el => { B.liste = el.dataset.id; store.set('borsaListe', B.liste); listelerCiz(); },
  'b-liste-yeni': async () => { const ad = await bSor('Yeni liste', 'Listenin adı', ''); if (!ad) return; const L = { id: yeniId(), ad: ad.slice(0, 40), s: [] }; B.data.listeler.push(L); B.liste = L.id; degisti(); listelerCiz(); },
  'b-liste-menu': el => listeMenu(el),
  'b-liste-ekle-sembol': () => aramaAc({ baslik: 'Listeye ekle', sec: id => { listeyeEkle(id); listelerCiz(); } }),
  'b-satir-menu': (el, e) => { e?.stopPropagation(); satirMenu(el); },
  'b-yildiz': el => {
    const id = B.detay;
    bPop(el, [...B.data.listeler.map(l => [l.id, l.s.includes(id) ? IC.starOn : IC.star, (l.s.includes(id) ? '✓ ' : '') + l.ad]), ['+yeni', IC.plusI, 'Yeni liste…']], async v => {
      if (v === '+yeni') { const ad = await bSor('Yeni liste', 'Listenin adı', ''); if (!ad) return; const L = { id: yeniId(), ad, s: [id] }; B.data.listeler.push(L); degisti(); toast(`"${ad}" listesi oluşturuldu`); }
      else { const L = B.data.listeler.find(l => l.id === v); if (L.s.includes(id)) { L.s = L.s.filter(x => x !== id); degisti(); toast(`"${L.ad}" listesinden çıkarıldı`); } else listeyeEkle(id, v); }
      const on = B.data.listeler.some(l => l.s.includes(id)); el.classList.toggle('on', on); el.innerHTML = on ? IC.starOn : IC.star;
    });
  },
  'b-d-alarm': () => alarmForm({ s: B.detay }), 'b-d-islem': () => islemForm({ s: B.detay }),
  'b-d-kars': () => { const id = B.detay; if (!B.kars.includes(id)) B.kars = [id, ...B.kars].slice(0, 6); store.set('borsaKars', B.kars); B.detay = null; B.sekme = 'karsilastir'; goster(); },
  'b-d-not': () => notAl(), 'b-d-kopya': () => grafikKopyala(), 'b-d-menu': el => detayMenu(el),
  'b-d-takvim': () => takvimEkle(`${inst(B.detay).kod} temettü`, 'Temettü hak kullanım tarihi (KAP duyurusundan kontrol et).'),
  'b-teknik-bilgi': () => toast('RSI son 14 günün yükseliş ve düşüşlerini ölçer (0–100). Hareketli ortalama, son N günün ortalama kapanışıdır. İkisi de geçmişi özetler; geleceği göstermez.', [], 9000),
  'b-aralik': el => { B.aralik = el.dataset.k; store.set('borsaAralik', B.aralik); el.parentNode.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === el)); grafikYukle(); },
  'b-tip': el => { B.tip = el.dataset.k; store.set('borsaTip', B.tip); el.parentNode.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === el)); grafikCiz(); },
  'b-gost': el => { const k = el.dataset.k; B.gost.has(k) ? B.gost.delete(k) : B.gost.add(k); store.set('borsaGost', [...B.gost]); el.classList.toggle('on', B.gost.has(k)); grafikCiz(); },
  'b-gizle': () => { B.gizle = !B.gizle; store.set('borsaGizle', B.gizle); portfoyCiz(); },
  'b-psekme': el => { B.psekme = el.dataset.k; if (B.grafik) { B.grafik.yokEt(); B.grafik = null; } el.parentNode.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === el)); portfoyIcCiz(); },
  'b-islem-yeni': () => islemForm({}), 'b-islem-duz': el => islemForm({ id: el.dataset.id }),
  'b-temettu-yeni': () => { islemForm({}); setTimeout(() => $('#bIF [data-tip="temettu"]')?.click(), 0); },
  'b-csv-ver': () => csvVer(), 'b-csv-al': () => csvAl(),
  'b-kars-ekle': () => aramaAc({ baslik: 'Karşılaştırmaya ekle', sec: id => { if (!B.kars.includes(id)) B.kars.push(id); store.set('borsaKars', B.kars); karsCiz(); } }),
  'b-kars-sil': el => { B.kars = B.kars.filter(x => x !== el.dataset.id); store.set('borsaKars', B.kars); karsCiz(); },
  'b-kars-aralik': el => { B.karsAralik = el.dataset.k; el.parentNode.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === el)); karsYukle(); },
  'b-tara-piyasa': el => { B.tara.piyasa = el.dataset.k; B.tara.sek = ''; taramaCiz(); },
  'b-tara-sira': el => { const k = el.dataset.k; if (B.tara.sira === k) B.tara.ters = !B.tara.ters; else { B.tara.sira = k; B.tara.ters = !/^(kod|sek|fk|zirve)$/.test(k); } taramaCiz(); },
  'b-tara-temizle': () => { Object.assign(B.tara, { sek: '', fk: '', deg: '', zirve: '' }); taramaCiz(); },
  'b-alarm-yeni': () => alarmForm({}), 'b-alarm-duz': el => alarmForm({ id: el.dataset.id }),
  'b-alarm-kur': el => { const a = B.data.alarmlar.find(x => x.id === el.dataset.id); if (!a) return; a.tetik = 0; a.yeniden = true; a.olustu = Date.now(); degisti(); alarmSenkron(); alarmlarCiz(); navCiz(); toast('Alarm yeniden kuruldu'); },
  'b-bildirim-izin': async () => { try { await Notification.requestPermission(); } catch {} alarmlarCiz(); },
  'b-servis-test': async () => { const el = $('#bSD'); el.textContent = 'Deneniyor…'; try { const j = await servis('borsa-ara', { q: 'THY' }); el.textContent = `Çalışıyor (${(j.a || []).length} sonuç).`; } catch (e) { el.textContent = 'Çalışmıyor: ' + servisMesaj(e); } },
  'b-yedek': () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(B.data, null, 2)], { type: 'application/json' })); a.download = 'suha-borsa-yedek.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
});
document.addEventListener('keydown', e => {
  if (!B.data || $('#modal').innerHTML || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) return;
  if (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) { e.preventDefault(); aramaAc({ baslik: 'Ara' }); }
  if (e.key === 'Escape' && B.detay) { B.detay = null; goster(); }
});
window.addEventListener('popstate', () => {});
