/* ───────────── Tara ─────────────
   Belge tarayıcı: kamerayla ya da galeriden tarama, kenar bulma, perspektif düzeltme, filtreler, çok sayfa,
   kimlik/kitap/beyaz tahta modları, yazıyı okuma (OCR, aranabilir PDF), imza, yazı, filigran, kalem,
   PDF/JPG/PNG, Drive, Gmail, Notlar, Pano, paylaş. (QR ve barkod okuma ayrı uygulamada: qr.html.) Ücretsiz, filigransız, reklamsız.
   Belgeler bu cihazda kalır; Google'a yalnızca kullanıcı istediğinde (Drive'a kaydet, mail gönder) gider. */
'use strict';

window.APP_NAME = 'Tara';
window.APP_ICON = 'tara-apple.png?v=1';
window.APP_LEAD = 'Belgelerini tara, PDF yap, yazısını oku. Ücretsiz, filigransız; taramalar senin cihazında işlenir.';
window.AUTH_STATE_PREFIX = 'tara-';
window.APP_SCOPES = 'openid email ' + SC_DRIVE;
window.APP_NEED_SCOPE = SC_DRIVE;
Auth.redirectUri = () => location.origin + location.pathname.replace(/[^/]*$/, '');

const TSVG = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
Object.assign(IC, {
  tara: TSVG('<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"/><path d="M4 12h16"/>'),
  kamera: TSVG('<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.5-2h5.6l1.5 2h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="12.8" r="3.4"/>'),
  galeri: TSVG('<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m4 17 5-4.5 3.5 3 2.5-2 5 3.5"/>'),
  qr: TSVG('<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2v2h-2zM18 14h2M14 18h2v2M18 18h2v2h-2"/>'),
  pdf: TSVG('<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9 13h1.5a1.5 1.5 0 0 1 0 3H9v-3zM9 16v2"/>'),
  kirp: TSVG('<path d="M7 3v14h14"/><path d="M3 7h14v14"/>'),
  filtreI: TSVG('<circle cx="9" cy="9" r="5"/><circle cx="15" cy="9" r="5"/><circle cx="12" cy="14.5" r="5"/>'),
  ayarI: TSVG('<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>'),
  dondurI: TSVG('<path d="M20 11a8 8 0 1 0-2.4 5.7"/><path d="M20 5v6h-6"/>'),
  silgi: TSVG('<path d="m4 15 8.5-8.5a2 2 0 0 1 2.8 0l3.2 3.2a2 2 0 0 1 0 2.8L13 18H7z"/><path d="M9.5 9.5 16 16M7 18h13"/>'),
  kalem: TSVG('<path d="m14.5 4.5 5 5L9 20H4v-5z"/><path d="m12.5 6.5 5 5"/>'),
  imza: TSVG('<path d="M3 17c2.5 0 3.5-9 6-9s-1 10 2 10 3-6 5-6 1.5 4 5 4"/><path d="M3 21h18"/>'),
  yazi: TSVG('<path d="M5 6V4.5h14V6M12 4.5v15M9 19.5h6"/>'),
  metinI: TSVG('<path d="M4 6h16M4 10h16M4 14h10M4 18h7"/>'),
  sayfaEkle: TSVG('<path d="M6 3h9l4 4v14H6z"/><path d="M12.5 10v7M9 13.5h7"/>'),
  klasor: TSVG('<path d="M3.5 7V5.5A1.5 1.5 0 0 1 5 4h4l2 2.5h8A1.5 1.5 0 0 1 20.5 8v10a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18z"/>'),
  etiket: TSVG('<path d="M3.5 12.3V4.5a1 1 0 0 1 1-1h7.8l8.2 8.2a1.4 1.4 0 0 1 0 2l-6.6 6.6a1.4 1.4 0 0 1-2 0z"/><circle cx="8" cy="8" r="1.3"/>'),
  filigran: TSVG('<path d="M6 3h9l4 4v14H6z"/><path d="m8.5 16 7-7M8.5 12l3-3"/>'),
  birlestir: TSVG('<path d="M8 4v5a3 3 0 0 0 3 3h2a3 3 0 0 1 3 3v5M16 4v5a3 3 0 0 1-3 3"/>'),
  bol: TSVG('<path d="M6 3h12v8H6zM6 13h12v8H6z"/>'),
  drive: TSVG('<path d="m8 4 8 0 5 9-4 7H7l-4-7z"/><path d="m8 4 5 9h8M13 13l-6 7M3 13h10"/>'),
  paylas: TSVG('<path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 12v7h14v-7"/>'),
  indir: TSVG('<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M5 19h14"/>'),
  kopya: TSVG('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>'),
  daha: TSVG('<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>'),
  sol: TSVG('<path d="m15 5-7 7 7 7"/>'), sag: TSVG('<path d="m9 5 7 7-7 7"/>'),
  geriAl: TSVG('<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>'),
  sihir: TSVG('<path d="m4 20 11-11M14 4v3M12.5 5.5h3M19 9v3M17.5 10.5h3M18 3v2M17 4h2"/>'),
  tam: TSVG('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
  kimlik: TSVG('<rect x="3" y="5.5" width="18" height="13" rx="2"/><circle cx="8.5" cy="11" r="2"/><path d="M5.5 16c.6-1.6 1.7-2.4 3-2.4s2.4.8 3 2.4M14 10h4M14 13h3"/>'),
  kitap: TSVG('<path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5zM12 6.5v13"/>'),
  tahta: TSVG('<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20l2-4M16 20l-2-4M7 9l3 2 3-3 4 3"/>'),
  belgeI: TSVG('<path d="M6 3h9l4 4v14H6z"/><path d="M9.5 11h6M9.5 14.5h6M9.5 18h3.5"/>'),
  otomatik: TSVG('<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>'),
  isik: TSVG('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z"/>')
});

/* ═════════ Durum ═════════ */
const T = {
  belgeler: [], q: '', klasor: 'tum', etiket: '', secim: new Set(),
  belge: null, sayfalar: [], sayfaSecim: null,
  duz: null,                 // { i, mod }
  kamera: null,              // { akis, mod, cekilen: [], ... }
  urller: new Set()
};
const url = blob => { const u = URL.createObjectURL(blob); T.urller.add(u); return u; };
function urlTemizle() { T.urller.forEach(u => URL.revokeObjectURL(u)); T.urller.clear(); }
const tarihKisa = ms => new Date(ms).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
const varsayilanAd = () => 'Tarama ' + new Date().toLocaleString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const FILTRELER = [['belge', 'Belge'], ['sb', 'Siyah-beyaz'], ['gri', 'Gri'], ['renkli', 'Renkli'], ['tahta', 'Tahta'], ['orijinal', 'Orijinal']];

/* ═════════ Başlangıç: giriş istemeden açılır ═════════ */
document.removeEventListener('DOMContentLoaded', boot);
async function taraBaslat() {
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  document.body.classList.add('tr-on');
  let niyet = null;
  if (location.hash.includes('state=')) {
    try { niyet = JSON.parse(sessionStorage.getItem('taraNiyet') || 'null'); sessionStorage.removeItem('taraNiyet'); } catch {}
    if (niyet?.sc) { window.APP_SCOPES = 'openid email ' + niyet.sc; window.APP_NEED_SCOPE = niyet.sc; }
    const r = Auth.handleRedirect();
    if (r === 'ok') {
      const v = await Auth.verify();
      if (v !== 'ok') { store.del('auth'); niyet = null; toast(v === 'izin' ? 'İzin verilmedi; o işlem yapılamadı.' : 'Giriş doğrulanamadı.'); }
      else {
        const email = jwtBody(store.get('idt')?.t || '')?.email || '';
        if (email) { S.email = email; store.set('email', email); }
        if (typeof accessGate === 'function' && email && !(await accessGate(email))) return;
      }
    } else if (r && r !== 'state') { niyet = null; toast(r === 'access_denied' ? 'Giriş iptal edildi.' : 'Giriş tamamlanamadı.'); }
  }
  S.email = S.email || store.get('email') || '';
  await kitaplikYukle();
  const u = new URLSearchParams(location.search);
  if (u.has('tara')) { history.replaceState(null, '', location.pathname + (DEMO ? '?demo' : '')); return kameraAc({ mod: 'belge' }); }
  if (niyet?.belge && T.belgeler.some(b => b.id === niyet.belge)) {
    await belgeAc(niyet.belge);
    setTimeout(() => { if (niyet.islem === 'drive') disaAktar({ hedef: 'drive' }); if (niyet.islem === 'mail') disaAktar({ hedef: 'mail' }); }, 300);
    return;
  }
  kitaplikCiz();
}
showLogin = msg => { if (msg) toast(msg); if (!T.ekran) kitaplikCiz(); };
start = () => taraBaslat();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', taraBaslat); else taraBaslat();

/* ═════════ Kitaplık ═════════ */
async function kitaplikYukle() {
  try { T.belgeler = await TDB.hepsi('belgeler'); }
  catch (e) { T.belgeler = []; toast('Cihazdaki depo açılamadı: ' + e.message); }
  if (DEMO && !T.belgeler.length) await ornekBelgeler();
  T.belgeler.sort((a, b) => b.degisti - a.degisti);
}
function kitaplikCiz() {
  T.ekran = 'kitaplik'; T.belge = null; kameraKapat(); urlTemizle();
  const klasorler = [...new Set(T.belgeler.map(b => b.klasor).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'tr'));
  const etiketler = [...new Set(T.belgeler.flatMap(b => b.etiketler || []))].sort((a, b) => a.localeCompare(b, 'tr'));
  $('#app').innerHTML = `
  <div class="tr-kitap">
    <header class="tr-bas">
      <div class="brand-mark sm">${IC.tara}</div><h1>Tara</h1><div class="spacer"></div>
      <button class="icon-btn" data-action="t-ayar" title="Ayarlar">${IC.gear}</button>
    </header>
    <form class="searchbox tr-ara" id="tAraF">${IC.search}<input id="tAra" type="search" placeholder="Belgelerde ara (adı, etiketi, içindeki yazı)" value="${esc(T.q)}" autocomplete="off"></form>
    <div class="tr-cipler">
      <button class="tr-cip ${T.klasor === 'tum' && !T.etiket ? 'on' : ''}" data-action="t-klasor" data-k="tum">Tümü <span>${T.belgeler.length}</span></button>
      ${klasorler.map(k => `<button class="tr-cip ${T.klasor === k ? 'on' : ''}" data-action="t-klasor" data-k="${esc(k)}">${IC.klasor}${esc(k)} <span>${T.belgeler.filter(b => b.klasor === k).length}</span></button>`).join('')}
      ${etiketler.map(e => `<button class="tr-cip etiket ${T.etiket === e ? 'on' : ''}" data-action="t-etiket" data-k="${esc(e)}">#${esc(e)}</button>`).join('')}
    </div>
    <div class="tr-izgara" id="tIzgara"></div>
    <div class="tr-fab">
      <button class="tr-fab-k" data-action="t-ice-aktar" title="Galeriden ya da PDF'ten">${IC.galeri}<span>İçe aktar</span></button>
      <button class="tr-fab-b" data-action="t-tara">${IC.kamera}<span>Tara</span></button>
    </div>
    <div class="tr-secim-cubuk" id="tSecim"></div>
  </div>`;
  $('#tAra').addEventListener('input', e => { T.q = e.target.value; izgaraCiz(); });
  $('#tAraF').addEventListener('submit', e => { e.preventDefault(); e.target.querySelector('input').blur(); });
  izgaraCiz();
}
const arNorm = s => String(s || '').toLocaleLowerCase('tr').replace(/ı/g, 'i').normalize('NFD').replace(/[̀-ͯ]/g, '');
function izgaraCiz() {
  const el = $('#tIzgara'); if (!el) return;
  const q = arNorm(T.q.trim());
  const L = T.belgeler.filter(b => (T.klasor === 'tum' || b.klasor === T.klasor) && (!T.etiket || (b.etiketler || []).includes(T.etiket))
    && (!q || arNorm(b.ad + ' ' + (b.etiketler || []).join(' ') + ' ' + (b.klasor || '') + ' ' + (b.metin || '')).includes(q)));
  el.innerHTML = L.map(b => {
    const eslesme = q && !arNorm(b.ad).includes(q) && b.metin && arNorm(b.metin).includes(q) ? (() => { const n = arNorm(b.metin), i = n.indexOf(q); return b.metin.slice(Math.max(0, i - 30), i + q.length + 40).replace(/\s+/g, ' '); })() : '';
    return `<div class="tr-kart ${T.secim.has(b.id) ? 'secili' : ''}" data-action="t-belge" data-id="${esc(b.id)}">
      <div class="tr-kart-r">${b.ikon ? `<img src="${esc(b.ikon)}" alt="" loading="lazy">` : IC.belgeI}<span class="tr-sayi">${b.sayfaSayisi || 0}</span>${b.driveId ? `<span class="tr-bulut" title="Drive'a kaydedildi">${IC.drive}</span>` : ''}</div>
      <div class="tr-kart-m"><b>${esc(b.ad)}</b><span>${esc(tarihKisa(b.degisti))}${b.klasor ? ' · ' + esc(b.klasor) : ''}</span>
        ${eslesme ? `<em>…${esc(eslesme)}…</em>` : (b.etiketler || []).length ? `<i>${b.etiketler.map(e => '#' + esc(e)).join(' ')}</i>` : ''}</div>
      <button class="icon-btn tr-kart-sec" data-action="t-sec" data-id="${esc(b.id)}" title="Seç">${T.secim.has(b.id) ? IC.check : '<i class="tr-daire"></i>'}</button>
    </div>`;
  }).join('') + (!L.length ? (T.belgeler.length ? '<div class="list-msg">Sonuç yok</div>'
    : `<div class="tr-bos">${IC.tara}<b>Henüz tarama yok</b><span>Kâğıdı düz bir yere koy, "Tara"ya bas. Kenarları kendisi bulur, eğriliği düzeltir, gölgeyi siler. Tamamen ücretsiz; filigran yok, reklam yok. Taramaların bu cihazda kalır.</span></div>`) : '');
  secimCubugu();
}
function secimCubugu() {
  const el = $('#tSecim'); if (!el) return;
  el.classList.toggle('acik', T.secim.size > 0);
  el.innerHTML = T.secim.size ? `<span>${T.secim.size} belge seçildi</span><div class="spacer"></div>
    ${T.secim.size > 1 ? `<button class="btn" data-action="t-birlestir">${IC.birlestir}Birleştir</button>` : ''}
    <button class="btn" data-action="t-sec-klasor">${IC.klasor}Klasöre</button>
    <button class="btn danger" data-action="t-sec-sil">${IC.trash}Sil</button>
    <button class="icon-btn" data-action="t-sec-bitir" title="Vazgeç">${IC.close}</button>` : '';
}
async function belgeKaydet(b) {
  const ss = T.belge?.id === b.id ? T.sayfalar : null;
  if (ss) { b.sayfalar = ss.map(s => s.id); b.sayfaSayisi = ss.length; b.ikon = ss[0]?.ikon || ''; b.metin = ss.map(s => s.metin || '').filter(Boolean).join('\n\n'); }
  b.degisti = Date.now();
  await TDB.koy('belgeler', b);
  const i = T.belgeler.findIndex(x => x.id === b.id); if (i >= 0) T.belgeler[i] = b; else T.belgeler.unshift(b);
}
async function belgeSil(id) {
  const b = T.belgeler.find(x => x.id === id); if (!b) return;
  for (const sid of b.sayfalar || []) await TDB.sil('sayfalar', sid);
  await TDB.sil('belgeler', id);
  T.belgeler = T.belgeler.filter(x => x.id !== id);
}

/* ═════════ Belge ═════════ */
async function belgeAc(id) {
  const b = T.belgeler.find(x => x.id === id); if (!b) return kitaplikCiz();
  T.belge = b; T.sayfaSecim = null;
  T.sayfalar = (await Promise.all((b.sayfalar || []).map(sid => TDB.al('sayfalar', sid)))).filter(Boolean);
  belgeCiz();
  // İşlenmemiş sayfalar arka planda hazırlansın
  for (const s of T.sayfalar) if (!s.islenmis || s.islemAnahtar !== islemAnahtari(s)) { await sayfaHazirla(s); if (T.belge?.id === id && T.ekran === 'belge') sayfaKartGuncelle(s); }
  if (T.belge?.id === id) await belgeKaydet(b);
}
function belgeCiz() {
  T.ekran = 'belge'; kameraKapat();
  const b = T.belge, sec = T.sayfaSecim;
  $('#app').innerHTML = `
  <div class="tr-belge">
    <header class="tr-bas">
      <button class="icon-btn" data-action="t-kitaplik" title="Kitaplık">${IC.back}</button>
      <input class="tr-ad" id="tAd" value="${esc(b.ad)}" maxlength="120" aria-label="Belgenin adı">
      <button class="icon-btn" data-action="t-belge-menu" title="Diğer">${IC.daha}</button>
    </header>
    <div class="tr-belge-bilgi">${b.sayfalar.length} sayfa${b.klasor ? ` · ${IC.klasor}${esc(b.klasor)}` : ''}${(b.etiketler || []).map(e => ` <span class="tr-et">#${esc(e)}</span>`).join('')}${b.filigran?.metin ? ` · <span class="tr-et">Filigran: ${esc(b.filigran.metin)}</span>` : ''}
      ${sec ? '' : `<button class="btn sm" data-action="t-sayfa-sec">Sayfa seç</button>`}</div>
    ${sec ? `<div class="tr-sayfa-secim"><span>${sec.size} sayfa seçildi</span><div class="spacer"></div>
      <button class="btn sm" data-action="t-sayfa-bol" ${sec.size ? '' : 'disabled'}>${IC.bol}Yeni belgeye ayır</button>
      <button class="btn sm danger" data-action="t-sayfa-coklu-sil" ${sec.size ? '' : 'disabled'}>${IC.trash}Sil</button>
      <button class="btn sm" data-action="t-sayfa-sec-bitir">Bitti</button></div>` : ''}
    <div class="tr-sayfalar" id="tSayfalar">${T.sayfalar.map((s, i) => sayfaKart(s, i)).join('')}
      <button class="tr-sayfa yeni" data-action="t-sayfa-ekle">${IC.sayfaEkle}<span>Sayfa ekle</span></button></div>
    <div class="tr-belge-alt">
      <button class="btn" data-action="t-oku">${IC.metinI}<span>Yazıyı oku</span></button>
      <button class="btn" data-action="t-sayfa-ekle">${IC.kamera}<span>Sayfa ekle</span></button>
      <button class="btn primary" data-action="t-disa">${IC.paylas}<span>Paylaş / Kaydet</span></button>
    </div>
  </div>`;
  $('#tAd').addEventListener('change', async e => { b.ad = e.target.value.trim() || varsayilanAd(); await belgeKaydet(b); });
  sayfaSurukle();
}
function sayfaKart(s, i) {
  const sec = T.sayfaSecim;
  return `<div class="tr-sayfa ${sec?.has(s.id) ? 'secili' : ''}" data-action="t-sayfa" data-id="${esc(s.id)}" data-i="${i}">
    <div class="tr-sayfa-r">${s.ikon ? `<img src="${esc(s.ikon)}" alt="" draggable="false">` : '<div class="tr-yukleniyor"></div>'}${s.metin ? `<span class="tr-ocr" title="Yazısı okundu">Aa</span>` : ''}</div>
    <span class="tr-no">${i + 1}</span>${sec ? `<span class="tr-sec-isaret">${sec.has(s.id) ? IC.check : ''}</span>` : ''}
  </div>`;
}
function sayfaKartGuncelle(s) {
  const el = document.querySelector(`.tr-sayfa[data-id="${CSS.escape(s.id)}"]`); if (!el) return;
  const i = T.sayfalar.indexOf(s); el.outerHTML = sayfaKart(s, i);
}
// Sayfaları sürükleyerek sırala (uzun bas ya da fareyle sürükle)
function sayfaSurukle() {
  const kap = $('#tSayfalar'); if (!kap) return;
  let tasinan = null, bas = null, zamanlayici = 0, hayalet = null;
  kap.addEventListener('pointerdown', e => {
    const el = e.target.closest('.tr-sayfa[data-id]'); if (!el || T.sayfaSecim) return;
    bas = { x: e.clientX, y: e.clientY, el, id: el.dataset.id, pid: e.pointerId };
    zamanlayici = setTimeout(() => basla(), e.pointerType === 'mouse' ? 160 : 380);
  });
  const basla = () => {
    if (!bas) return; tasinan = bas; tasinan.el.classList.add('tasiniyor');
    try { kap.setPointerCapture(bas.pid); } catch {}
    hayalet = tasinan.el.cloneNode(true); hayalet.className = 'tr-sayfa tr-hayalet'; document.body.appendChild(hayalet);
    const r = tasinan.el.getBoundingClientRect(); hayalet.style.width = r.width + 'px'; tasinan.dx = bas.x - r.left; tasinan.dy = bas.y - r.top;
    konum(bas.x, bas.y); navigator.vibrate?.(10);
  };
  const konum = (x, y) => { if (hayalet) { hayalet.style.left = x - tasinan.dx + 'px'; hayalet.style.top = y - tasinan.dy + 'px'; } };
  kap.addEventListener('pointermove', e => {
    if (!bas) return;
    if (!tasinan) { if (Math.hypot(e.clientX - bas.x, e.clientY - bas.y) > 8) { clearTimeout(zamanlayici); bas = null; } return; }
    e.preventDefault(); konum(e.clientX, e.clientY);
    const hedef = document.elementsFromPoint(e.clientX, e.clientY).find(x => x.matches?.('.tr-sayfa[data-id]') && x !== tasinan.el);
    if (hedef) { const r = hedef.getBoundingClientRect(), once = e.clientX < r.left + r.width / 2; kap.insertBefore(tasinan.el, once ? hedef : hedef.nextSibling); }
  });
  const bitir = async () => {
    clearTimeout(zamanlayici);
    if (tasinan) {
      tasinan.el.classList.remove('tasiniyor'); hayalet?.remove(); hayalet = null;
      const sira = [...kap.querySelectorAll('.tr-sayfa[data-id]')].map(x => x.dataset.id);
      T.sayfalar.sort((a, b) => sira.indexOf(a.id) - sira.indexOf(b.id));
      await belgeKaydet(T.belge); belgeCiz();
      tasinan.surukledi = true; setTimeout(() => { tasinan = null; }, 0);
    }
    bas = null;
  };
  kap.addEventListener('pointerup', bitir); kap.addEventListener('pointercancel', bitir);
  kap.addEventListener('click', e => { if (tasinan?.surukledi) { e.stopPropagation(); e.preventDefault(); } }, true);
}
function belgeMenu(el) {
  const b = T.belge;
  tPop(el, [['ad', IC.kalem, 'Yeniden adlandır'], ['klasor', IC.klasor, 'Klasöre taşı'], ['etiket', IC.etiket, 'Etiketler'], ['filigran', IC.filigran, 'Filigran'], ['metin', IC.metinI, 'Okunan yazıyı göster'], ['sil', IC.trash, 'Belgeyi sil', false, true]], async v => {
    if (v === 'ad') { $('#tAd').focus(); $('#tAd').select(); }
    if (v === 'klasor') klasorSor([b.id]);
    if (v === 'etiket') etiketSor(b);
    if (v === 'filigran') filigranAc();
    if (v === 'metin') metinGoster();
    if (v === 'sil') { if (!confirm(`"${b.ad}" silinsin mi? Bu cihazdan kaldırılır${b.driveId ? ' (Drive\'daki kopyası kalır)' : ''}.`)) return; await belgeSil(b.id); kitaplikCiz(); toast('Belge silindi'); }
  });
}
async function klasorSor(ids) {
  const mevcut = [...new Set(T.belgeler.map(b => b.klasor).filter(Boolean))];
  const ad = await tSor('Klasöre taşı', 'Klasörün adı (boş bırakırsan klasörden çıkar)', T.belgeler.find(b => b.id === ids[0])?.klasor || '', mevcut);
  if (ad == null) return;
  for (const id of ids) { const b = T.belgeler.find(x => x.id === id); if (b) { b.klasor = ad.trim().slice(0, 40); await TDB.koy('belgeler', b); } }
  toast(ad.trim() ? `"${ad.trim()}" klasörüne taşındı` : 'Klasörden çıkarıldı');
  T.ekran === 'belge' ? belgeCiz() : (T.secim.clear(), kitaplikCiz());
}
async function etiketSor(b) {
  const tum = [...new Set(T.belgeler.flatMap(x => x.etiketler || []))];
  const v = await tSor('Etiketler', 'Virgülle ayır (ör. fatura, 2026, ev)', (b.etiketler || []).join(', '), tum);
  if (v == null) return;
  b.etiketler = [...new Set(v.split(',').map(x => x.trim().replace(/^#/, '')).filter(Boolean))].slice(0, 12);
  await belgeKaydet(b); belgeCiz();
}

/* ═════════ Sayfa ekleme: kamera, galeri, PDF ═════════ */
async function yeniSayfa(blob, o = {}) {
  const orijinal = await orijinalHazirla(blob);
  const s = { id: tId(), olustu: Date.now(), orijinal, kose: o.kose, filtre: o.filtre || store.get('taraFiltre', 'belge'), don: 0, parlak: 0, kontrast: 0, leke: [], cizim: [], ogeler: [] };
  if (!s.kose) { const k = o.tamami ? { kose: [[0, 0], [1, 0], [1, 1], [0, 1]] } : await kagitBulBlob(orijinal); s.kose = k.kose; }
  return s;
}
async function sayfalariEkle(sayfalar, hedef) {
  let b = hedef || T.belge;
  if (!b) { b = { id: tId(), ad: varsayilanAd(), olustu: Date.now(), degisti: Date.now(), sayfalar: [], etiketler: [], klasor: T.klasor !== 'tum' ? T.klasor : '' }; }
  for (const s of sayfalar) { await sayfaHazirla(s, false); s.belge = b.id; await TDB.koy('sayfalar', s); }
  const mevcut = T.belge?.id === b.id ? T.sayfalar : (await Promise.all((b.sayfalar || []).map(id => TDB.al('sayfalar', id)))).filter(Boolean);
  T.belge = b;
  T.sayfalar = [...mevcut, ...sayfalar];
  await belgeKaydet(b);
  return b;
}
function dosyaSec(kabul, coklu = true) {
  return new Promise(res => {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = kabul; inp.multiple = coklu;
    inp.onchange = () => res([...inp.files]); inp.click();
  });
}
async function iceAktar(hedef) {
  const dosyalar = await dosyaSec('image/*,application/pdf');
  if (!dosyalar.length) return;
  const yeni = [];
  yukleniyorGoster('İçe aktarılıyor…');
  try {
    for (const f of dosyalar) {
      if (f.type === 'application/pdf' || /\.pdf$/i.test(f.name)) {
        const resimler = await pdfSayfalari(f, (i, n) => yukleniyorGoster(`PDF sayfası ${i}/${n}`));
        for (const r of resimler) yeni.push(await yeniSayfa(r, { tamami: true, filtre: 'orijinal' }));
      } else if (f.type.startsWith('image/')) {
        yukleniyorGoster(`Fotoğraf işleniyor (${yeni.length + 1}/${dosyalar.length})`);
        yeni.push(await yeniSayfa(f));
      }
    }
    if (!yeni.length) return toast('Resim ya da PDF seçilmedi');
    const b = await sayfalariEkle(yeni, hedef);
    if (!hedef && dosyalar.length === 1 && dosyalar[0].name) { b.ad = dosyalar[0].name.replace(/\.[^.]+$/, '').slice(0, 80) || b.ad; await belgeKaydet(b); }
    belgeCiz();
    toast(`${yeni.length} sayfa eklendi`);
  } catch (e) { toast('İçe aktarılamadı: ' + e.message); }
  finally { yukleniyorKapat(); }
}

/* ═════════ Kamera ═════════ */
const MODLAR = [['belge', 'Belge', 'belgeI'], ['kimlik', 'Kimlik', 'kimlik'], ['kitap', 'Kitap', 'kitap'], ['tahta', 'Tahta', 'tahta']];
async function kameraAc(o = {}) {
  T.ekran = 'kamera';
  const istenen = o.mod || store.get('taraMod', 'belge');
  const K = T.kamera = { mod: MODLAR.some(m => m[0] === istenen) ? istenen : 'belge', hedef: o.hedef || null, cekilen: [], oto: store.get('taraOto', true), kose: null, sabit: 0, kimlikOn: null, isleniyor: false };
  $('#app').innerHTML = `
  <div class="tr-kamera">
    <video id="tVid" playsinline muted autoplay></video>
    <svg class="tr-kat" id="tKat" preserveAspectRatio="none"><polygon id="tPoli" points=""/></svg>
    <div class="tr-k-ust">
      <button class="icon-btn" data-action="t-kamera-kapat" title="Kapat">${IC.close}</button>
      <div class="tr-k-ipucu" id="tIpucu">Kamera açılıyor…</div>
      <button class="icon-btn ${K.oto ? 'on' : ''}" data-action="t-oto" title="Otomatik çek">${IC.otomatik}<span>Oto</span></button>
    </div>
    <div class="tr-k-modlar">${MODLAR.map(([k, n]) => `<button class="${K.mod === k ? 'on' : ''}" data-action="t-mod" data-k="${k}">${n}</button>`).join('')}</div>
    <div class="tr-k-alt">
      <button class="tr-k-galeri" data-action="t-kamera-galeri" title="Galeriden">${IC.galeri}</button>
      <button class="tr-deklansor" data-action="t-cek" id="tCek" title="Çek"><i></i></button>
      <button class="tr-k-bitti" data-action="t-kamera-bitti" id="tBitti" disabled><span class="tr-k-thumb" id="tThumb"></span><b id="tSay">0</b><em>Bitti</em></button>
    </div>
    <div class="tr-flas" id="tFlas"></div>
  </div>`;
  modIpucu();
  try {
    K.akis = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 3840 }, height: { ideal: 2160 } }, audio: false });
    const v = $('#tVid'); v.srcObject = K.akis; await v.play().catch(() => {});
    try { K.yakala = 'ImageCapture' in window ? new ImageCapture(K.akis.getVideoTracks()[0]) : null; } catch { K.yakala = null; }
    modIpucu();
    canliBul();
  } catch (e) {
    $('#tIpucu').textContent = 'Kamera açılamadı. Galeriden seçebilirsin.';
    toast(e.name === 'NotAllowedError' ? 'Kamera izni verilmedi. Tarayıcı ayarlarından izin verebilir ya da galeriden seçebilirsin.' : 'Bu cihazda kamera kullanılamıyor; galeriden seçebilirsin.', [], 6000);
  }
}
function modIpucu() {
  const K = T.kamera, el = $('#tIpucu'); if (!el || !K) return;
  el.textContent = K.mod === 'kimlik' ? (K.kimlikOn ? 'Şimdi kartın ARKA yüzünü çek' : 'Kimlik kartının ÖN yüzünü çek') : K.mod === 'kitap' ? 'Açık kitabı iki sayfa birden görünecek şekilde çek' : K.mod === 'tahta' ? 'Tahtanın tamamı görünsün' : 'Kâğıdı koyu bir zeminin üstüne koy';
  document.querySelector('.tr-kamera')?.classList.toggle('kitap', K.mod === 'kitap');
}
function kameraKapat() {
  const K = T.kamera; if (!K) return;
  K.kapandi = true; clearTimeout(K.t);
  K.akis?.getTracks().forEach(t => t.stop());
  T.kamera = null;
}
// Canlı kenar bulma: küçük karelerde ~5 kez/sn; köşeler sabitlenince otomatik çeker
function canliBul() {
  const K = T.kamera; if (!K || K.kapandi) return;
  const v = $('#tVid');
  const dongu = () => {
    if (!T.kamera || K.kapandi) return;
    if (v.videoWidth && !K.isleniyor && document.visibilityState === 'visible') {
      const k = 360 / Math.max(v.videoWidth, v.videoHeight), c = K.kucuk || (K.kucuk = document.createElement('canvas'));
      c.width = Math.round(v.videoWidth * k); c.height = Math.round(v.videoHeight * k);
      const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(v, 0, 0, c.width, c.height);
      const r = TaraGoruntu.kagitBul(g.getImageData(0, 0, c.width, c.height));
      poligonCiz(r.bulundu ? r.kose : null);
      if (r.bulundu && K.mod !== 'kitap') {
        const fark = K.kose ? Math.max(...r.kose.map((p, i) => Math.hypot(p[0] - K.kose[i][0], p[1] - K.kose[i][1]))) : 1;
        K.sabit = fark < 0.025 ? K.sabit + 1 : 0; K.kose = r.kose;
        const el = $('#tPoli'); el?.classList.toggle('hazir', K.sabit >= 3);
        if (K.oto && K.sabit >= 6 && Date.now() - (K.sonCekim || 0) > 2500) { K.sabit = 0; cek(); }
      } else { K.kose = r.bulundu ? r.kose : null; K.sabit = 0; }
    }
    K.t = setTimeout(dongu, 180);
  };
  dongu();
}
function poligonCiz(kose) {
  const v = $('#tVid'), svg = $('#tKat'), p = $('#tPoli'); if (!v || !p) return;
  if (!kose) { p.setAttribute('points', ''); return; }
  // video "cover" ile yerleşir: ekrandaki konumu hesapla
  const W = svg.clientWidth, H = svg.clientHeight, vw = v.videoWidth, vh = v.videoHeight, k = Math.max(W / vw, H / vh), ox = (W - vw * k) / 2, oy = (H - vh * k) / 2;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  p.setAttribute('points', kose.map(([x, y]) => `${ox + x * vw * k},${oy + y * vh * k}`).join(' '));
}
async function kareYakala() {
  const K = T.kamera, v = $('#tVid');
  if (K.yakala) {
    try { return await Promise.race([K.yakala.takePhoto(), sleep(2500).then(() => { throw new Error('zaman'); })]); } catch {}
  }
  const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight;
  c.getContext('2d').drawImage(v, 0, 0);
  return tuvaldenBlob(c, 'image/jpeg', 0.92);
}
async function cek() {
  const K = T.kamera; if (!K || K.isleniyor) return;
  const v = $('#tVid'); if (!v?.videoWidth) return toast('Kamera hazır değil');
  K.isleniyor = true; K.sonCekim = Date.now();
  const fl = $('#tFlas'); fl.classList.add('on'); setTimeout(() => fl.classList.remove('on'), 140); navigator.vibrate?.(15);
  try {
    const blob = await kareYakala();
    if (K.mod === 'kitap') {
      const s = await yeniSayfa(blob, { filtre: 'belge' });
      // Kâğıdı iki yarıya böl: üst ve alt kenarların ortasından
      const [a, b, c, d] = s.kose, ort = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], ust = ort(a, b), alt = ort(d, c);
      const sag = { ...s, id: tId(), kose: [ust, b, c, alt] };
      s.kose = [a, ust, alt, d];
      K.cekilen.push(s, sag);
    } else if (K.mod === 'kimlik') {
      const s = await yeniSayfa(blob);
      if (!K.kimlikOn) { K.kimlikOn = s; toast('Ön yüz alındı. Kartı çevir ve arka yüzü çek.'); modIpucu(); }
      else { yukleniyorGoster('Kimlik sayfası hazırlanıyor…'); K.cekilen.push(await kimlikSayfasi(K.kimlikOn, s)); K.kimlikOn = null; yukleniyorKapat(); modIpucu(); toast('Kimlik kartı tek sayfada hazır'); }
    } else {
      K.cekilen.push(await yeniSayfa(blob, { filtre: K.mod === 'tahta' ? 'tahta' : undefined }));
    }
    const son = K.cekilen[K.cekilen.length - 1];
    if (son) { const ik = await kucukResim(son.orijinal, 120); $('#tThumb').innerHTML = `<img src="${ik}" alt="">`; }
    $('#tSay').textContent = K.cekilen.length; $('#tBitti').disabled = !K.cekilen.length;
  } catch (e) { toast('Çekilemedi: ' + e.message); }
  finally { if (T.kamera) K.isleniyor = false; }
}
// Kimlik: iki yüz, gerçek kart ölçüsünde (85,6 × 54 mm) A4 sayfaya alt alta
async function kimlikSayfasi(on, arka) {
  const A4W = 1654, A4H = 2339, mm = A4W / 210, kw = Math.round(85.6 * mm), kh = Math.round(54 * mm);
  const c = document.createElement('canvas'); c.width = A4W; c.height = A4H; const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, A4W, A4H);
  const yerles = async (s, y) => {
    const r = await parcaDuzelt(s.orijinal, s.kose, 'renkli', 1400), bmp = await createImageBitmap(r.blob);
    // Dikey çekilmiş kart yan yatırılır; ekranda her zaman kw × kh görünür
    const dikey = bmp.height > bmp.width;
    g.save(); g.translate(A4W / 2, y);
    if (dikey) { g.rotate(-Math.PI / 2); g.drawImage(bmp, -kh / 2, -kw / 2, kh, kw); }
    else g.drawImage(bmp, -kw / 2, -kh / 2, kw, kh);
    g.restore(); bmp.close?.();
    g.strokeStyle = '#d0d4da'; g.lineWidth = 2; g.strokeRect(A4W / 2 - kw / 2, y - kh / 2, kw, kh);
  };
  await yerles(on, A4H * 0.28); await yerles(arka, A4H * 0.62);
  const blob = await tuvaldenBlob(c, 'image/jpeg', 0.92);
  return { id: tId(), olustu: Date.now(), orijinal: blob, kose: [[0, 0], [1, 0], [1, 1], [0, 1]], filtre: 'orijinal', don: 0, parlak: 0, kontrast: 0, leke: [], cizim: [], ogeler: [], kimlik: true };
}
async function kameraBitti() {
  const K = T.kamera; if (!K?.cekilen.length) return;
  const sayfalar = K.cekilen, hedef = K.hedef ? T.belgeler.find(b => b.id === K.hedef) : null;
  kameraKapat();
  yukleniyorGoster('Sayfalar hazırlanıyor…');
  try {
    if (K.yerine && hedef) {   // "Bu sayfayı yeniden çek": eski sayfanın yerine geçer
      const ilk = sayfalar.shift(); ilk.belge = hedef.id; await sayfaHazirla(ilk, false); await TDB.koy('sayfalar', ilk);
      const i = T.sayfalar.findIndex(x => x.id === K.yerine);
      if (i >= 0) { await TDB.sil('sayfalar', K.yerine); T.sayfalar[i] = ilk; } else T.sayfalar.push(ilk);
      await belgeKaydet(hedef);
      if (!sayfalar.length) { duzenleAc(Math.max(0, i), 'kirp'); return; }
    }
    const b = await sayfalariEkle(sayfalar, hedef);
    if (!hedef && K.mod === 'kimlik') { b.ad = 'Kimlik ' + new Date().toLocaleDateString('tr-TR'); await belgeKaydet(b); }
    belgeCiz();
    if (store.get('taraOtoOku', false)) belgeOku();
  } finally { yukleniyorKapat(); }
}

/* ═════════ Sayfa düzenleyici ═════════ */
const ARACLAR = [['kirp', 'Kırp', 'kirp'], ['filtre', 'Filtre', 'filtreI'], ['ayar', 'Ayar', 'ayarI'], ['dondur', 'Döndür', 'dondurI'], ['temizle', 'Temizle', 'silgi'], ['kalem', 'Kalem', 'kalem'], ['imza', 'İmza', 'imza'], ['yazi', 'Yazı', 'yazi']];
async function duzenleAc(i, mod = 'filtre') {
  T.ekran = 'duzenle'; T.duz = { i, mod, gecmis: [], kalemRenk: store.get('taraKalemRenk', '#1d4ed8'), kalemTip: 'kalem', kalemK: 0.004, firca: 0.025 };
  duzenleCiz();
}
function duzSayfa() { return T.sayfalar[T.duz.i]; }
function duzenleCiz() {
  const D = T.duz, s = duzSayfa(); if (!s) return belgeCiz();
  $('#app').innerHTML = `
  <div class="tr-duz">
    <header class="tr-bas koyu">
      <button class="icon-btn" data-action="t-duz-geri" title="Geri">${IC.back}</button>
      <div class="tr-duz-baslik"><button class="icon-btn" data-action="t-duz-onceki" ${D.i ? '' : 'disabled'}>${IC.sol}</button><span>Sayfa ${D.i + 1} / ${T.sayfalar.length}</span><button class="icon-btn" data-action="t-duz-sonraki" ${D.i < T.sayfalar.length - 1 ? '' : 'disabled'}>${IC.sag}</button></div>
      <button class="icon-btn" data-action="t-duz-menu" title="Diğer">${IC.daha}</button>
    </header>
    <div class="tr-sahne" id="tSahne"><div class="tr-sahne-ic" id="tSahneIc"><div class="tr-yukleniyor buyuk"></div></div></div>
    <div class="tr-arac-panel" id="tPanel"></div>
    <nav class="tr-araclar">${ARACLAR.map(([k, n, ic]) => `<button class="${D.mod === k ? 'on' : ''}" data-action="t-arac" data-k="${k}">${IC[ic]}<span>${n}</span></button>`).join('')}</nav>
  </div>`;
  aracCiz();
}
async function aracCiz() {
  const D = T.duz, s = duzSayfa(), p = $('#tPanel'); if (!p) return;
  document.querySelectorAll('.tr-araclar button').forEach(b => b.classList.toggle('on', b.dataset.k === D.mod));
  if (D.mod === 'kirp') return kirpCiz();
  await sahneCiz();
  if (D.mod === 'filtre') {
    p.innerHTML = `<div class="tr-filtreler">${FILTRELER.map(([k, n]) => `<button class="${s.filtre === k ? 'on' : ''}" data-action="t-filtre" data-k="${k}"><span class="tr-f-ornek" data-f="${k}">${s.ikon ? `<img src="${s.ikon}" alt="">` : ''}</span>${n}</button>`).join('')}</div>
      <label class="tr-anahtar"><input type="checkbox" id="tHepsine"> Tüm sayfalara uygula</label>`;
    filtreOrnekleri();
  }
  if (D.mod === 'ayar') {
    p.innerHTML = `<label class="tr-kaydir">Parlaklık<input type="range" min="-60" max="60" value="${s.parlak || 0}" id="tParlak"><output>${s.parlak || 0}</output></label>
      <label class="tr-kaydir">Kontrast<input type="range" min="-50" max="80" value="${s.kontrast || 0}" id="tKontrast"><output>${s.kontrast || 0}</output></label>
      <button class="btn sm" data-action="t-ayar-sifirla">Sıfırla</button>`;
    const bagla = (id, alan) => { const el = $(id); el.oninput = () => { el.nextElementSibling.textContent = el.value; }; el.onchange = async () => { s[alan] = +el.value; await sayfaYenile(); }; };
    bagla('#tParlak', 'parlak'); bagla('#tKontrast', 'kontrast');
  }
  if (D.mod === 'dondur') p.innerHTML = `<div class="tr-satir-dug"><button class="btn" data-action="t-don" data-a="-90">${IC.dondurI}Sola</button><button class="btn" data-action="t-don" data-a="90">${IC.dondurI}Sağa</button><button class="btn" data-action="t-don" data-a="180">Ters çevir</button></div>`;
  if (D.mod === 'temizle') p.innerHTML = `<div class="tr-satir-dug"><span class="muted sm">Leke, parmak izi ya da zımba deliğinin üstünü parmağınla boya; kâğıt rengiyle kapanır.</span></div>
    <div class="tr-satir-dug"><label class="tr-kaydir">Fırça<input type="range" min="0.008" max="0.07" step="0.002" value="${D.firca}" id="tFirca"></label><button class="btn sm" data-action="t-leke-geri" ${s.leke?.length ? '' : 'disabled'}>${IC.geriAl}Geri al</button></div>`;
  if (D.mod === 'kalem') p.innerHTML = `<div class="tr-satir-dug">
      <div class="seg">${[['kalem', 'Kalem'], ['vurgu', 'Fosforlu']].map(([k, n]) => `<button class="${D.kalemTip === k ? 'on' : ''}" data-action="t-kalem-tip" data-k="${k}">${n}</button>`).join('')}</div>
      ${['#1d4ed8', '#111111', '#dc2626', '#16a34a', '#facc15', '#f472b6'].map(r => `<button class="tr-renk ${D.kalemRenk === r ? 'on' : ''}" style="--r:${r}" data-action="t-kalem-renk" data-k="${r}" title="Renk"></button>`).join('')}
      <button class="btn sm" data-action="t-cizim-geri" ${s.cizim?.length ? '' : 'disabled'}>${IC.geriAl}Geri al</button></div>`;
  if (D.mod === 'imza') p.innerHTML = imzaPanel();
  if (D.mod === 'yazi') p.innerHTML = `<div class="tr-satir-dug"><button class="btn" data-action="t-yazi-ekle">${IC.yazi}Yazı ekle</button><button class="btn" data-action="t-tarih-ekle">${IC.cal || ''}Bugünün tarihi</button><button class="btn" data-action="t-isaret-ekle">✓ İşaret</button></div>
    <span class="muted sm">Formdaki boşluğa yazı ekle; sürükleyerek yerleştir, köşeden büyüt.</span>`;
  if (D.mod === 'temizle' && $('#tFirca')) $('#tFirca').oninput = e => { D.firca = +e.target.value; };
}
// Sahne: işlenmiş sayfa + düzenlenebilir üst katman
async function sahneCiz() {
  const D = T.duz, s = duzSayfa(), ic = $('#tSahneIc'); if (!ic) return;
  if (!s.islenmis || s.islemAnahtar !== islemAnahtari(s)) { ic.innerHTML = '<div class="tr-yukleniyor buyuk"></div>'; await sayfaHazirla(s); if (T.duz !== D || duzSayfa() !== s) return; }
  const sahne = $('#tSahne'), W = sahne.clientWidth - 24, H = sahne.clientHeight - 24, k = Math.min(W / s.w, H / s.h);
  const w = Math.round(s.w * k), h = Math.round(s.h * k);
  ic.style.width = w + 'px'; ic.style.height = h + 'px';
  ic.innerHTML = `<img src="${url(s.islenmis)}" alt="" draggable="false"><canvas id="tKatman" width="${Math.round(w * devicePixelRatio)}" height="${Math.round(h * devicePixelRatio)}"></canvas><div class="tr-ogeler" id="tOgeler"></div>`;
  katmanGuncelle();
  cizimOlaylari();
}
async function katmanGuncelle() {
  const c = $('#tKatman'); if (!c) return;
  const s = duzSayfa(), g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height);
  await katmanCiz(g, c.width, c.height, { ...s, ogeler: [] }, T.belge);
  ogelerCiz();
}
// İmza ve yazı öğeleri: sürüklenebilir kutular
function ogelerCiz() {
  const el = $('#tOgeler'), s = duzSayfa(); if (!el) return;
  const aktif = T.duz.mod === 'imza' || T.duz.mod === 'yazi';
  el.classList.toggle('aktif', aktif);
  el.innerHTML = (s.ogeler || []).map(o => `<div class="tr-oge ${o.tip} ${T.duz.secOge === o.id ? 'secili' : ''}" data-id="${o.id}" style="left:${o.x * 100}%;top:${o.y * 100}%;${o.tip === 'imza' ? `width:${o.w * 100}%;height:${o.h * 100}%` : ''}">
    ${o.tip === 'imza' ? `<img src="${esc(o.src)}" alt="İmza" draggable="false">` : `<div class="tr-oge-yazi" ${aktif ? 'contenteditable="plaintext-only"' : ''} spellcheck="false" style="color:${esc(o.renk || '#111')};font-size:calc(${o.boyut} * var(--W));${o.kalin ? 'font-weight:700' : ''}">${esc(o.metin)}</div>`}
    ${aktif ? `<span class="tr-oge-tasi" data-tasi="${o.id}" title="Taşı">✥</span><button class="tr-oge-sil" data-sil="${o.id}" title="Kaldır">×</button><span class="tr-oge-boy" data-boy="${o.id}"></span>${o.tip === 'yazi' ? `<span class="tr-oge-renk"><button data-yrenk="#111111" style="--r:#111"></button><button data-yrenk="#1d4ed8" style="--r:#1d4ed8"></button><button data-yrenk="#dc2626" style="--r:#dc2626"></button><button data-ykalin="1">B</button></span>` : ''}` : ''}
  </div>`).join('');
  el.style.setProperty('--W', el.clientWidth + 'px');
  if (!aktif) return;
  el.querySelectorAll('.tr-oge-yazi').forEach(y => {
    y.addEventListener('input', () => { const o = s.ogeler.find(x => x.id === y.parentNode.dataset.id); o.metin = y.innerText.replace(/\n$/, ''); });
    y.addEventListener('blur', () => sayfaKaydetGec());
  });
}
let kaydetT = 0;
function sayfaKaydetGec() { clearTimeout(kaydetT); kaydetT = setTimeout(async () => { const s = duzSayfa(); if (s) { await TDB.koy('sayfalar', s); } }, 500); }
function cizimOlaylari() {
  const ic = $('#tSahneIc'), D = T.duz, s = duzSayfa();
  let cizgi = null, ogeIs = null;
  const nokta = e => { const r = ic.getBoundingClientRect(); return [Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))]; };
  ic.onpointerdown = e => {
    const sil = e.target.closest('[data-sil]'), boy = e.target.closest('[data-boy]'), oge = e.target.closest('.tr-oge'), yrenk = e.target.closest('[data-yrenk]'), ykalin = e.target.closest('[data-ykalin]');
    if (sil) { e.preventDefault(); s.ogeler = s.ogeler.filter(o => o.id !== sil.dataset.sil); sayfaKaydetGec(); ogelerCiz(); return; }
    if (yrenk || ykalin) { e.preventDefault(); const o = s.ogeler.find(x => x.id === (yrenk || ykalin).closest('.tr-oge').dataset.id); if (yrenk) o.renk = yrenk.dataset.yrenk; else o.kalin = !o.kalin; sayfaKaydetGec(); ogelerCiz(); return; }
    if ((D.mod === 'imza' || D.mod === 'yazi') && oge) {
      const o = s.ogeler.find(x => x.id === oge.dataset.id); D.secOge = o.id;
      if (e.target.closest('.tr-oge-yazi') && !boy && document.activeElement === e.target.closest('.tr-oge-yazi')) return;   // yazarken imleç (taşımak için ✥ tutamacı)
      if (e.target.closest('[data-tasi]')) document.activeElement?.blur();
      const r = ic.getBoundingClientRect();
      ogeIs = { o, boy: !!boy, x: e.clientX, y: e.clientY, ox: o.x, oy: o.y, ow: o.w, oh: o.h, ob: o.boyut, r, tasindi: false };
      ic.setPointerCapture(e.pointerId); e.preventDefault(); return;
    }
    if (D.mod === 'kalem') { cizgi = { tip: D.kalemTip, renk: D.kalemRenk, k: D.kalemTip === 'vurgu' ? 0.018 : D.kalemK, n: [nokta(e)] }; (s.cizim ||= []).push(cizgi); }
    else if (D.mod === 'temizle') { cizgi = { r: D.firca, n: [nokta(e)] }; D.lekeCizgi = cizgi; }
    else return;
    ic.setPointerCapture(e.pointerId); e.preventDefault(); onizleCiz(cizgi);
  };
  ic.onpointermove = e => {
    if (ogeIs) {
      const dx = (e.clientX - ogeIs.x) / ogeIs.r.width, dy = (e.clientY - ogeIs.y) / ogeIs.r.height, o = ogeIs.o;
      if (Math.abs(dx) + Math.abs(dy) > 0.004) ogeIs.tasindi = true;
      if (ogeIs.boy) { if (o.tip === 'imza') { const k = Math.max(0.3, 1 + dx / ogeIs.ow); o.w = ogeIs.ow * k; o.h = ogeIs.oh * k; } else o.boyut = Math.max(0.01, ogeIs.ob + dx * 0.25); }
      else { o.x = Math.min(0.98, Math.max(-0.05, ogeIs.ox + dx)); o.y = Math.min(0.98, Math.max(-0.05, ogeIs.oy + dy)); }
      const el = document.querySelector(`.tr-oge[data-id="${o.id}"]`);
      if (el) { el.style.left = o.x * 100 + '%'; el.style.top = o.y * 100 + '%'; if (o.tip === 'imza') { el.style.width = o.w * 100 + '%'; el.style.height = o.h * 100 + '%'; } else el.querySelector('.tr-oge-yazi').style.fontSize = `calc(${o.boyut} * var(--W))`; }
      return;
    }
    if (!cizgi) return;
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    evs.forEach(ev => cizgi.n.push(nokta(ev)));
    onizleCiz(cizgi);
  };
  const bitir = async () => {
    if (ogeIs) {
      const o = ogeIs.o, tasindi = ogeIs.tasindi; ogeIs = null; sayfaKaydetGec();
      if (!tasindi && o.tip === 'yazi') { const y = document.querySelector(`.tr-oge[data-id="${o.id}"] .tr-oge-yazi`); y?.focus(); }
      document.querySelectorAll('.tr-oge').forEach(el => el.classList.toggle('secili', el.dataset.id === o.id));
      return;
    }
    if (!cizgi) return;
    const c = cizgi; cizgi = null;
    if (D.mod === 'kalem') { await TDB.koy('sayfalar', s); katmanGuncelle(); aracDugmeGuncelle(); }
    if (D.mod === 'temizle') { (s.leke ||= []).push(c); D.lekeCizgi = null; await sayfaYenile(); }
  };
  ic.onpointerup = bitir; ic.onpointercancel = bitir;
}
function aracDugmeGuncelle() { const s = duzSayfa(), b = document.querySelector('[data-action="t-cizim-geri"]'); if (b) b.disabled = !s.cizim?.length; }
function onizleCiz(c) {
  const cv = $('#tKatman'); if (!cv) return;
  const g = cv.getContext('2d'), W = cv.width, H = cv.height;
  if (T.duz.mod === 'kalem') {
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = c.renk; g.lineWidth = Math.max(1, c.k * W);
    if (c.tip === 'vurgu') { g.globalAlpha = 0.35; g.lineCap = 'square'; }
    const n = c.n, a = n[Math.max(0, n.length - 2)], b = n[n.length - 1];
    g.beginPath(); g.moveTo(a[0] * W, a[1] * H); g.lineTo(b[0] * W + 0.01, b[1] * H); g.stroke(); g.restore();
  } else {
    g.save(); g.fillStyle = 'rgba(255,90,90,.35)';
    const r = c.r * Math.max(W, H), b = c.n[c.n.length - 1]; g.beginPath(); g.arc(b[0] * W, b[1] * H, r, 0, 7); g.fill(); g.restore();
  }
}
async function sayfaYenile() {
  const s = duzSayfa();
  $('#tSahneIc')?.classList.add('isleniyor');
  await sayfaHazirla(s);
  await sahneCiz();
  $('#tSahneIc')?.classList.remove('isleniyor');
  if (T.duz.mod === 'temizle') aracCiz();
}
async function filtreOrnekleri() {
  const s = duzSayfa(); if (!s?.orijinal) return;
  for (const [k] of FILTRELER) {
    const el = document.querySelector(`.tr-f-ornek[data-f="${k}"]`); if (!el) continue;
    if (!s._ornek) s._ornek = {};
    if (!s._ornek[k]) { try { const r = await sayfaIsleBlob(s.orijinal, { ...s, filtre: k, leke: [] }, 220, 0.7); s._ornek[k] = URL.createObjectURL(r.blob); } catch { continue; } }
    const el2 = document.querySelector(`.tr-f-ornek[data-f="${k}"]`); if (el2) el2.innerHTML = `<img src="${s._ornek[k]}" alt="">`;
  }
}
// Kırpma: orijinal fotoğraf üstünde dört köşe + büyüteç
async function kirpCiz() {
  const D = T.duz, s = duzSayfa(), ic = $('#tSahneIc'), p = $('#tPanel');
  p.innerHTML = `<div class="tr-satir-dug"><button class="btn" data-action="t-kirp-oto">${IC.sihir}Otomatik bul</button><button class="btn" data-action="t-kirp-tam">${IC.tam}Tamamı</button><div class="spacer"></div><button class="btn primary" data-action="t-kirp-uygula">Uygula</button></div>`;
  const bmp = await createImageBitmap(s.orijinal), sahne = $('#tSahne'), W = sahne.clientWidth - 40, H = sahne.clientHeight - 40, k = Math.min(W / bmp.width, H / bmp.height);
  const w = Math.round(bmp.width * k), h = Math.round(bmp.height * k); bmp.close?.();
  D.kose = (D.kose && D.kirpSayfa === s.id) ? D.kose : s.kose.map(p => p.slice()); D.kirpSayfa = s.id;
  ic.style.width = w + 'px'; ic.style.height = h + 'px';
  ic.innerHTML = `<img src="${url(s.orijinal)}" alt="" draggable="false"><svg class="tr-kirp" viewBox="0 0 ${w} ${h}"><path id="tKirpMaske" fill-rule="evenodd"/><polygon id="tKirpPoli"/></svg>
    ${[0, 1, 2, 3].map(i => `<span class="tr-tutamac" data-k="${i}"></span>`).join('')}<canvas class="tr-buyutec" id="tBuyutec" width="220" height="220"></canvas>`;
  const ciz = () => {
    const P = D.kose.map(([x, y]) => [x * w, y * h]);
    $('#tKirpPoli').setAttribute('points', P.map(p => p.join(',')).join(' '));
    $('#tKirpMaske').setAttribute('d', `M0 0H${w}V${h}H0z M${P.map(p => p.join(' ')).join(' L')}z`);
    ic.querySelectorAll('.tr-tutamac').forEach(t => { const [x, y] = P[+t.dataset.k]; t.style.left = x + 'px'; t.style.top = y + 'px'; });
  };
  ciz();
  const img = await resimYukle(url(s.orijinal)), buy = $('#tBuyutec'), bg = buy.getContext('2d');
  let tut = null;
  ic.onpointerdown = e => { const t = e.target.closest('.tr-tutamac'); if (!t) return; tut = +t.dataset.k; ic.setPointerCapture(e.pointerId); e.preventDefault(); buy.classList.add('on'); };
  ic.onpointermove = e => {
    if (tut == null) return;
    const r = ic.getBoundingClientRect(), x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    D.kose[tut] = [x, y]; ciz();
    // Büyüteç: parmağın altını 3 kat büyütür
    const sx = x * img.naturalWidth, sy = y * img.naturalHeight, z = 110 / (3 * k);
    bg.clearRect(0, 0, 220, 220); bg.drawImage(img, sx - z, sy - z, z * 2, z * 2, 0, 0, 220, 220);
    bg.strokeStyle = '#4262ff'; bg.lineWidth = 2; bg.beginPath(); bg.moveTo(110, 90); bg.lineTo(110, 130); bg.moveTo(90, 110); bg.lineTo(130, 110); bg.stroke();
    buy.style.left = (x * w < w / 2 ? w - 120 : 10) + 'px'; buy.style.top = '10px';
  };
  const bit = () => { tut = null; buy.classList.remove('on'); };
  ic.onpointerup = bit; ic.onpointercancel = bit;
}
function imzaPanel() {
  const L = store.get('taraImzalar', []);
  return `<div class="tr-imzalar">${L.map((src, i) => `<button class="tr-imza" data-action="t-imza-koy" data-i="${i}"><img src="${esc(src)}" alt="İmza"><span data-action="t-imza-sil" data-i="${i}" title="Sil">×</span></button>`).join('')}
    <button class="tr-imza yeni" data-action="t-imza-yeni">${IC.plus}<span>Yeni imza</span></button></div>
    <span class="muted sm">İmzan sadece bu cihazda saklanır. Eklediğin imzayı sürükleyip köşesinden büyütebilirsin.</span>`;
}
function imzaCizAc() {
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask tr-imza-ped"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>İmzanı çiz</h3></header>
    <div class="set-body"><canvas id="tPed" width="900" height="360"></canvas>
      <div class="tr-satir-dug">${['#111111', '#1d4ed8'].map((r, i) => `<button class="tr-renk ${i ? '' : 'on'}" style="--r:${r}" data-r="${r}"></button>`).join('')}<div class="spacer"></div><button class="btn" id="tPedTemizle">Temizle</button><button class="btn primary" id="tPedKaydet">Kaydet</button></div></div></div></div>`;
  const c = $('#tPed'), g = c.getContext('2d'); let renk = '#111111', ciz = false, son = null, bos = true;
  g.lineCap = 'round'; g.lineJoin = 'round';
  const p = e => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) * c.width / r.width, (e.clientY - r.top) * c.height / r.height]; };
  c.onpointerdown = e => { ciz = true; son = p(e); c.setPointerCapture(e.pointerId); bos = false; };
  c.onpointermove = e => { if (!ciz) return; (e.getCoalescedEvents?.() || [e]).forEach(ev => { const q = p(ev); g.strokeStyle = renk; g.lineWidth = 5 + Math.min(3, (ev.pressure || 0.5) * 4); g.beginPath(); g.moveTo(...son); g.lineTo(...q); g.stroke(); son = q; }); };
  c.onpointerup = c.onpointercancel = () => { ciz = false; };
  document.querySelectorAll('#modal [data-r]').forEach(b => b.onclick = () => { renk = b.dataset.r; document.querySelectorAll('#modal [data-r]').forEach(x => x.classList.toggle('on', x === b)); });
  $('#tPedTemizle').onclick = () => { g.clearRect(0, 0, c.width, c.height); bos = true; };
  $('#tPedKaydet').onclick = () => {
    if (bos) return toast('Önce imzanı çiz');
    // Boşlukları kırp
    const d = g.getImageData(0, 0, c.width, c.height).data; let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 10) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const o = document.createElement('canvas'); o.width = x1 - x0 + 12; o.height = y1 - y0 + 12; o.getContext('2d').drawImage(c, x0 - 6, y0 - 6, o.width, o.height, 0, 0, o.width, o.height);
    const L = store.get('taraImzalar', []); L.unshift(o.toDataURL('image/png')); store.set('taraImzalar', L.slice(0, 6));
    closeModal(); imzaKoy(0);
  };
}
function imzaKoy(i) {
  const src = store.get('taraImzalar', [])[i], s = duzSayfa(); if (!src) return;
  const img = new Image(); img.onload = () => {
    const w = 0.32, h = w * (img.height / img.width) * (s.w / s.h);
    const o = { id: tId(), tip: 'imza', src, x: 0.6, y: 0.78, w, h };
    (s.ogeler ||= []).push(o); T.duz.secOge = o.id; sayfaKaydetGec(); ogelerCiz(); aracCiz();
  }; img.src = src;
}
function yaziEkle(metin, o = {}) {
  const s = duzSayfa(), y = { id: tId(), tip: 'yazi', metin, x: o.x ?? 0.1, y: o.y ?? 0.1 + ((s.ogeler || []).filter(x => x.tip === 'yazi').length % 8) * 0.06, boyut: o.boyut || 0.028, renk: '#111111' };
  (s.ogeler ||= []).push(y); T.duz.secOge = y.id; sayfaKaydetGec(); ogelerCiz();
  setTimeout(() => { const el = document.querySelector(`.tr-oge[data-id="${y.id}"] .tr-oge-yazi`); if (el && !o.odaksiz) { el.focus(); document.getSelection().selectAllChildren(el); } }, 30);
}
function duzMenu(el) {
  const s = duzSayfa();
  tPop(el, [['oku', IC.metinI, 'Bu sayfanın yazısını oku'], ['pano', IC.kopya, 'Resmi kopyala (Pano\'ya yapıştır)'], ['jpg', IC.indir, 'Resim olarak indir'], ['yineleme', IC.kamera, 'Bu sayfayı yeniden çek'], ['sil', IC.trash, 'Sayfayı sil', false, true]], async v => {
    if (v === 'oku') { await sayfalariOku([s]); metinGoster([s]); }
    if (v === 'pano') panoyaKopyala(s);
    if (v === 'jpg') { const c = await sayfaBirlestir(s, T.belge); indir(await tuvaldenBlob(c, 'image/jpeg', 0.9), `${T.belge.ad} - ${T.duz.i + 1}.jpg`); }
    if (v === 'yineleme') { const i = T.duz.i; kameraAc({ mod: 'belge', hedef: T.belge.id }); T.kamera.yerine = s.id; T.kamera.yerineI = i; }
    if (v === 'sil') { if (!confirm('Bu sayfa silinsin mi?')) return; await sayfaSilBelgeden([s.id]); if (!T.sayfalar.length) return belgeCiz(); T.duz.i = Math.min(T.duz.i, T.sayfalar.length - 1); duzenleCiz(); }
  });
}
async function sayfaSilBelgeden(ids) {
  for (const id of ids) await TDB.sil('sayfalar', id);
  T.sayfalar = T.sayfalar.filter(s => !ids.includes(s.id));
  if (!T.sayfalar.length) { await belgeSil(T.belge.id); toast('Son sayfa silindi; belge kaldırıldı'); return kitaplikCiz(); }
  await belgeKaydet(T.belge);
}
async function panoyaKopyala(s) {
  try {
    const c = await sayfaBirlestir(s, T.belge, 1800), blob = await tuvaldenBlob(c, 'image/png');
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    toast('Kopyalandı · Pano\'da ya da bir mailde yapıştırabilirsin');
  } catch { toast('Bu tarayıcı resim kopyalamaya izin vermiyor; "Resim olarak indir"i kullan'); }
}

/* ═════════ Yazıyı okuma ═════════ */
async function sayfalariOku(sayfalar) {
  let i = 0;
  yukleniyorGoster('Yazı okunuyor…');
  try {
    for (const s of sayfalar) {
      i++;
      await sayfaOku(s, p => yukleniyorGoster(`${p.durum}${sayfalar.length > 1 ? ` · sayfa ${i}/${sayfalar.length}` : ''}`, p.oran));
      if (T.ekran === 'belge') sayfaKartGuncelle(s);
    }
    await belgeKaydet(T.belge);
  } catch (e) { toast('Yazı okunamadı: ' + e.message); throw e; }
  finally { yukleniyorKapat(); }
}
async function belgeOku() { await sayfalariOku(T.sayfalar).catch(() => {}); metinGoster(); }
function metinGoster(sayfalar = T.sayfalar) {
  const metin = sayfalar.map((s, i) => (sayfalar.length > 1 ? `— Sayfa ${T.sayfalar.indexOf(s) + 1} —\n` : '') + (s.metin || '')).join('\n\n').trim();
  const okunmamis = sayfalar.filter(s => !s.ocrAnahtar).length;
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet tr-metin"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Okunan yazı</h3></header>
    <div class="set-body">
      ${okunmamis ? `<div class="tr-uyari">${okunmamis} sayfanın yazısı henüz okunmadı. <button class="btn sm" id="tMOku">Şimdi oku</button></div>` : ''}
      <textarea id="tMetin" spellcheck="false">${esc(metin)}</textarea>
      <p class="muted sm">Basılı yazıda iyi sonuç verir; el yazısında hata olabilir. Metni burada düzeltip kopyalayabilirsin.</p>
      <div class="sticky-actions"><button class="btn" id="tMKop">${IC.kopya}Kopyala</button><button class="btn" id="tMIndir">${IC.indir}.txt indir</button><button class="btn primary" id="tMNot">${IC.belgeI}Notlar'a gönder</button></div>
    </div></div></div>`;
  $('#tMKop').onclick = async () => { try { await navigator.clipboard.writeText($('#tMetin').value); toast('Kopyalandı'); } catch { $('#tMetin').select(); toast('Seçildi; kopyala'); } };
  $('#tMIndir').onclick = () => indir(new Blob([$('#tMetin').value], { type: 'text/plain;charset=utf-8' }), (T.belge?.ad || 'metin') + '.txt');
  $('#tMNot').onclick = () => { const t = $('#tMetin').value.slice(0, 20000); window.open('notlar.html?' + new URLSearchParams({ title: T.belge?.ad || 'Tarama', text: t }) + (DEMO ? '&demo' : ''), '_blank', 'noopener'); };
  if ($('#tMOku')) $('#tMOku').onclick = async () => { closeModal(); await sayfalariOku(sayfalar.filter(s => !s.ocrAnahtar)).catch(() => {}); metinGoster(sayfalar); };
}

/* ═════════ Filigran ═════════ */
function filigranAc() {
  const b = T.belge, f = b.filigran || { metin: '', renk: '#c0392b', opak: 0.22, boyut: 0.06 };
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Filigran</h3></header>
    <form class="set-body tr-form" id="tFF">
      <p class="muted sm">Kimlik ya da belge fotokopisi verirken üstüne amacını yaz; başka yerde kullanılmasını zorlaştırır.</p>
      <label class="nask-l">Yazı<input id="tFM" value="${esc(f.metin)}" maxlength="60" placeholder="Ör. Sadece X kira sözleşmesi içindir"></label>
      <div class="tr-oneriler">${['Sadece … başvurusu içindir', 'Aslı gibidir', 'Fotokopidir', 'Kopyalanamaz', new Date().toLocaleDateString('tr-TR') + ' tarihli işlem içindir'].map(x => `<button type="button" class="tr-cip sm" data-o="${esc(x)}">${esc(x)}</button>`).join('')}</div>
      <div class="tr-satir-dug">${['#c0392b', '#1d4ed8', '#111111', '#6b7280'].map(r => `<button type="button" class="tr-renk ${f.renk === r ? 'on' : ''}" style="--r:${r}" data-r="${r}"></button>`).join('')}</div>
      <label class="tr-kaydir">Görünürlük<input type="range" min="0.08" max="0.6" step="0.02" value="${f.opak}" id="tFO"></label>
      <label class="tr-kaydir">Büyüklük<input type="range" min="0.03" max="0.12" step="0.005" value="${f.boyut}" id="tFB"></label>
      <canvas id="tFOn" class="tr-f-onizleme" width="420" height="560"></canvas>
      <div class="sticky-actions">${b.filigran?.metin ? `<button type="button" class="btn danger" id="tFKaldir">Kaldır</button>` : ''}<div class="spacer"></div><button type="button" class="btn" data-action="close-modal">Vazgeç</button><button class="btn primary">Uygula</button></div>
    </form></div></div>`;
  const d = { ...f };
  const onizle = async () => {
    const c = $('#tFOn'); if (!c) return; const g = c.getContext('2d'), s = T.sayfalar[0];
    g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
    if (s?.ikon) { const i = await resimYukle(s.ikon); const k = Math.min(c.width / i.width, c.height / i.height); g.drawImage(i, (c.width - i.width * k) / 2, (c.height - i.height * k) / 2, i.width * k, i.height * k); }
    await katmanCiz(g, c.width, c.height, { cizim: [], ogeler: [] }, { filigran: d });
  };
  $('#tFM').oninput = e => { d.metin = e.target.value; onizle(); };
  document.querySelectorAll('#tFF [data-o]').forEach(x => x.onclick = () => { $('#tFM').value = x.dataset.o; d.metin = x.dataset.o; onizle(); $('#tFM').focus(); });
  document.querySelectorAll('#tFF [data-r]').forEach(x => x.onclick = () => { d.renk = x.dataset.r; document.querySelectorAll('#tFF [data-r]').forEach(y => y.classList.toggle('on', y === x)); onizle(); });
  $('#tFO').oninput = e => { d.opak = +e.target.value; onizle(); };
  $('#tFB').oninput = e => { d.boyut = +e.target.value; onizle(); };
  if ($('#tFKaldir')) $('#tFKaldir').onclick = async () => { delete b.filigran; await belgeKaydet(b); closeModal(); belgeCiz(); toast('Filigran kaldırıldı'); };
  $('#tFF').addEventListener('submit', async e => { e.preventDefault(); d.metin = d.metin.trim(); if (!d.metin) return toast('Filigran yazısını gir'); b.filigran = d; await belgeKaydet(b); closeModal(); belgeCiz(); toast('Filigran eklendi; tüm sayfalarda ve dışa aktarırken görünür'); });
  onizle();
}

/* ═════════ Dışa aktarma ve paylaşma ═════════ */
function disaAktar(o = {}) {
  const b = T.belge, ayar = store.get('taraDisa', { bicim: 'pdf', kalite: 'orta', ocr: true, boyut: 'oto' });
  const hepsiOkundu = T.sayfalar.every(s => s.ocrAnahtar === s.islemAnahtar);
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask tr-disa"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Paylaş ve kaydet</h3></header>
    <div class="set-body tr-form">
      <div class="tr-satir-dug"><span class="tr-et-ad">Biçim</span><div class="seg" id="tDBicim">${[['pdf', 'PDF'], ['jpg', 'JPG'], ['png', 'PNG']].map(([k, n]) => `<button class="${ayar.bicim === k ? 'on' : ''}" data-k="${k}">${n}</button>`).join('')}</div></div>
      <div class="tr-satir-dug"><span class="tr-et-ad">Kalite</span><div class="seg" id="tDKalite">${Object.entries(KALITE).map(([k, v]) => `<button class="${ayar.kalite === k ? 'on' : ''}" data-k="${k}">${v.ad.replace(' (mail için)', '')}</button>`).join('')}</div><span class="muted sm" id="tDBoyut"></span></div>
      <div class="tr-pdf-ayar">
        <label class="tr-anahtar"><input type="checkbox" id="tDOcr" ${ayar.ocr ? 'checked' : ''}> Aranabilir PDF (yazıyı oku${hepsiOkundu ? ', hazır' : ''})</label>
        <label class="tr-anahtar"><input type="checkbox" id="tDA4" ${ayar.boyut === 'a4' ? 'checked' : ''}> Sayfaları A4 yap</label>
      </div>
      <div class="tr-hedefler">
        ${navigator.share ? `<button class="tr-hedef" data-h="paylas">${IC.paylas}<b>Paylaş</b><span>WhatsApp, mail, dosyalar…</span></button>` : ''}
        <button class="tr-hedef" data-h="indir">${IC.indir}<b>İndir</b><span>Cihaza kaydet</span></button>
        <button class="tr-hedef" data-h="drive">${IC.drive}<b>Drive'a kaydet</b><span>${b.driveId ? 'Güncellenir' : '"Suha Tara" klasörüne'}</span></button>
        <button class="tr-hedef" data-h="mail">${IC.mailI || IC.mail}<b>Mail ile gönder</b><span>Gmail hesabından</span></button>
        <button class="tr-hedef" data-h="notlar">${IC.belgeI}<b>Notlar'a</b><span>Okunan yazı not olur</span></button>
        <button class="tr-hedef" data-h="pano">${IC.kopya}<b>Pano için kopyala</b><span>İlk sayfanın resmi</span></button>
      </div>
      <div class="tr-ilerleme" id="tDIl" hidden><i></i><span></span></div>
    </div></div></div>`;
  const al = () => ({ bicim: $('#tDBicim .on').dataset.k, kalite: $('#tDKalite .on').dataset.k, ocr: $('#tDOcr').checked, boyut: $('#tDA4').checked ? 'a4' : 'oto' });
  const segBagla = id => document.querySelectorAll(`#${id} button`).forEach(x => x.onclick = () => { document.querySelectorAll(`#${id} button`).forEach(y => y.classList.toggle('on', y === x)); store.set('taraDisa', al()); goster(); });
  const goster = () => { const a = al(); document.querySelector('.tr-pdf-ayar').style.display = a.bicim === 'pdf' ? '' : 'none'; $('#tDBoyut').textContent = ''; };
  segBagla('tDBicim'); segBagla('tDKalite'); goster();
  ['#tDOcr', '#tDA4'].forEach(s => $(s).onchange = () => store.set('taraDisa', al()));
  document.querySelectorAll('.tr-hedef').forEach(x => x.onclick = () => hedefCalistir(x.dataset.h, al()));
  if (o.hedef) setTimeout(() => hedefCalistir(o.hedef, al()), 100);
}
let disaMesgul = false;
async function dosyalarHazirla(a) {
  const b = T.belge, il = $('#tDIl'), ilerle = (oran, yazi) => { if (!il) return; il.hidden = false; il.querySelector('i').style.width = Math.round(oran * 100) + '%'; il.querySelector('span').textContent = yazi || ''; };
  const ad = (b.ad || 'Tarama').replace(/[\\/:*?"<>|]/g, '-');
  if (a.bicim === 'pdf') {
    const pdf = await pdfYap(b, T.sayfalar, { kalite: a.kalite, ocr: a.ocr, boyut: a.boyut, ilerle });
    if (a.ocr) await belgeKaydet(b);
    if ($('#tDBoyut')) $('#tDBoyut').textContent = boyutYaz(pdf.size);
    return [new File([pdf], ad + '.pdf', { type: 'application/pdf' })];
  }
  const K = KALITE[a.kalite], out = [];
  for (let i = 0; i < T.sayfalar.length; i++) {
    ilerle(i / T.sayfalar.length, `Sayfa ${i + 1}/${T.sayfalar.length}`);
    const c = await sayfaBirlestir(T.sayfalar[i], b, K.boy), tur = a.bicim === 'png' ? 'image/png' : 'image/jpeg';
    const blob = await tuvaldenBlob(c, tur, K.q);
    out.push(new File([blob], `${ad}${T.sayfalar.length > 1 ? ' - ' + (i + 1) : ''}.${a.bicim}`, { type: tur }));
  }
  ilerle(1, ''); if ($('#tDBoyut')) $('#tDBoyut').textContent = boyutYaz(out.reduce((x, f) => x + f.size, 0));
  return out;
}
const boyutYaz = n => n > 1e6 ? (n / 1e6).toLocaleString('tr-TR', { maximumFractionDigits: 1 }) + ' MB' : Math.round(n / 1e3) + ' KB';
async function hedefCalistir(h, a) {
  if (disaMesgul) return; const b = T.belge;
  if (h === 'notlar') { await sayfalariOku(T.sayfalar.filter(s => s.ocrAnahtar !== s.islemAnahtar)).catch(() => {}); const t = T.sayfalar.map(s => s.metin || '').join('\n\n').trim().slice(0, 20000); window.open('notlar.html?' + new URLSearchParams({ title: b.ad, text: t || '(yazı bulunamadı)' }) + (DEMO ? '&demo' : ''), '_blank', 'noopener'); return; }
  if (h === 'pano') return panoyaKopyala(T.sayfalar[0]);
  if (h === 'drive' && !tIzinIste(SC_DRIVE, { belge: b.id, islem: 'drive' }, 'Drive\'a kaydetmek için Google girişi ve Drive izni gerekiyor. Program sadece kendi oluşturduğu "Suha Tara" klasörünü görebilir. Google\'a yönlendirileceksin; taramaların bu cihazda kalır.')) return;
  if (h === 'mail' && !tIzinIste(SC_GMAIL_GONDER, { belge: b.id, islem: 'mail' }, 'Mail göndermek için Google girişi ve "Gmail ile gönder" izni gerekiyor. Program maillerini okuyamaz, sadece senin yazdığın maili gönderir. Google\'a yönlendirileceksin.')) return;
  if (h === 'mail' && a.bicim !== 'pdf') a = { ...a, bicim: 'pdf' };
  disaMesgul = true;
  document.querySelectorAll('.tr-hedef').forEach(x => x.disabled = true);
  try {
    const dosyalar = await dosyalarHazirla(a);
    if (h === 'indir') { dosyalar.forEach((f, i) => setTimeout(() => indir(f, f.name), i * 350)); toast(dosyalar.length > 1 ? `${dosyalar.length} dosya indiriliyor` : 'İndirildi'); }
    if (h === 'paylas') {
      if (navigator.canShare && !navigator.canShare({ files: dosyalar })) { dosyalar.forEach(f => indir(f, f.name)); toast('Bu cihaz dosya paylaşmayı desteklemiyor; indirildi'); }
      else { try { await navigator.share({ files: dosyalar, title: b.ad }); } catch (e) { if (e.name !== 'AbortError') toast('Paylaşılamadı: ' + e.message); } }
    }
    if (h === 'drive') {
      if (DEMO) { await sleep(500); b.driveId = 'demo'; await belgeKaydet(b); closeModal(); toast('Örnek modda Drive\'a kaydedilmiş gibi gösterildi'); return; }
      const f = await driveKaydet(b, dosyalar[0], T.sayfalar.map(s => s.metin || '').join('\n'));
      b.driveId = f.id; await belgeKaydet(b); closeModal();
      toast('Drive\'a kaydedildi', f.webViewLink ? [['Aç', () => window.open(f.webViewLink, '_blank', 'noopener')]] : [], 6000);
    }
    if (h === 'mail') mailYaz(dosyalar[0]);
  } catch (e) { toast('Olmadı: ' + e.message, [], 6000); }
  finally { disaMesgul = false; document.querySelectorAll('.tr-hedef').forEach(x => x.disabled = false); }
}
function mailYaz(dosya) {
  const b = T.belge, buyuk = dosya.size > 24e6;
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Mail ile gönder</h3></header>
    <form class="set-body tr-form" id="tMF">
      <label class="nask-l">Kime<input id="tMKime" type="email" multiple required placeholder="ornek@gmail.com" autocomplete="email"></label>
      <label class="nask-l">Konu<input id="tMKonu" value="${esc(b.ad)}" required maxlength="200"></label>
      <label class="nask-l">Mesaj<textarea id="tMMesaj" rows="4">Merhaba,\n\nTaranmış belge ektedir.\n</textarea></label>
      <div class="tr-ek">${IC.pdf}<b>${esc(dosya.name)}</b><span>${boyutYaz(dosya.size)}</span></div>
      ${buyuk ? '<div class="tr-uyari">Dosya Gmail için büyük olabilir (25 MB). Kaliteyi "Küçük" seçip tekrar dene.</div>' : ''}
      <div class="sticky-actions"><button type="button" class="btn" data-action="close-modal">Vazgeç</button><button class="btn primary" id="tMGonder">${IC.send || ''}Gönder</button></div>
    </form></div></div>`;
  $('#tMF').addEventListener('submit', async e => {
    e.preventDefault(); const btn = $('#tMGonder'); btn.disabled = true; btn.textContent = 'Gönderiliyor…';
    try {
      if (DEMO) await sleep(600);
      else await gmailGonder({ kime: $('#tMKime').value.trim(), konu: $('#tMKonu').value.trim(), metin: $('#tMMesaj').value, dosya, dosyaAdi: dosya.name });
      closeModal(); toast(DEMO ? 'Örnek modda gönderilmiş gibi gösterildi' : 'Mail gönderildi');
    } catch (err) { btn.disabled = false; btn.textContent = 'Gönder'; toast('Gönderilemedi: ' + err.message, [], 6000); }
  });
  setTimeout(() => $('#tMKime')?.focus(), 60);
}
function indir(blob, ad) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = ad; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000); }

/* ═════════ Birleştir / ayır ═════════ */
async function birlestir(ids) {
  const L = ids.map(id => T.belgeler.find(b => b.id === id)).filter(Boolean).sort((a, b) => a.olustu - b.olustu);
  if (L.length < 2) return;
  const yeni = { id: tId(), ad: L[0].ad + ' (birleşik)', olustu: Date.now(), degisti: Date.now(), sayfalar: [], etiketler: [...new Set(L.flatMap(b => b.etiketler || []))], klasor: L[0].klasor || '' };
  const sayfalar = [];
  for (const b of L) for (const sid of b.sayfalar) { const s = await TDB.al('sayfalar', sid); if (s) sayfalar.push({ ...s, id: tId(), belge: yeni.id }); }
  for (const s of sayfalar) await TDB.koy('sayfalar', s);
  yeni.sayfalar = sayfalar.map(s => s.id); yeni.sayfaSayisi = sayfalar.length; yeni.ikon = sayfalar[0]?.ikon || ''; yeni.metin = sayfalar.map(s => s.metin || '').filter(Boolean).join('\n\n');
  await TDB.koy('belgeler', yeni); T.belgeler.unshift(yeni);
  T.secim.clear();
  toast(`${L.length} belge birleştirildi (asılları duruyor)`, [['Aç', () => belgeAc(yeni.id)]]);
  kitaplikCiz();
}
async function sayfalariAyir() {
  const sec = [...T.sayfaSecim]; if (!sec.length) return;
  const b = T.belge, tasinan = T.sayfalar.filter(s => sec.includes(s.id));
  if (tasinan.length === T.sayfalar.length) return toast('Tüm sayfaları ayıramazsın; en az biri kalmalı');
  const yeni = { id: tId(), ad: b.ad + ' (ayrılan)', olustu: Date.now(), degisti: Date.now(), sayfalar: tasinan.map(s => s.id), sayfaSayisi: tasinan.length, ikon: tasinan[0].ikon, etiketler: [...(b.etiketler || [])], klasor: b.klasor || '', metin: tasinan.map(s => s.metin || '').join('\n\n') };
  for (const s of tasinan) { s.belge = yeni.id; await TDB.koy('sayfalar', s); }
  await TDB.koy('belgeler', yeni); T.belgeler.unshift(yeni);
  T.sayfalar = T.sayfalar.filter(s => !sec.includes(s.id)); T.sayfaSecim = null;
  await belgeKaydet(b); belgeCiz();
  toast(`${tasinan.length} sayfa yeni belgeye ayrıldı`, [['Aç', () => belgeAc(yeni.id)]]);
}

/* ═════════ Ayarlar ═════════ */
async function ayarAc() {
  const t = store.get('theme', 'light'), tah = navigator.storage?.estimate ? await navigator.storage.estimate().catch(() => null) : null;
  const kalici = navigator.storage?.persisted ? await navigator.storage.persisted().catch(() => false) : false;
  const girisli = !!store.get('auth') && !!S.email;
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet settings"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Ayarlar</h3></header>
    <div class="set-body">
      <section><h4>Görünüm</h4><div class="seg yon-seg">${[['light', 'Cam'], ['dark', 'Koyu'], ['auto', 'Otomatik'], ['flat', 'Düz']].map(([k, n]) => `<button class="${t === k ? 'on' : ''}" data-action="t-tema" data-t="${k}">${n}</button>`).join('')}</div></section>
      <section><h4>Tarama</h4>
        <div class="set-row"><div><b>Varsayılan filtre</b><span>Yeni sayfalara uygulanır.</span></div><select id="tAF">${FILTRELER.map(([k, n]) => `<option value="${k}" ${store.get('taraFiltre', 'belge') === k ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
        <div class="set-row"><div><b>Otomatik çek</b><span>Kâğıt sabit durunca kendiliğinden çeker.</span></div><button type="button" class="switch ${store.get('taraOto', true) ? 'on' : ''}" data-ayar="taraOto"><i></i></button></div>
        <div class="set-row"><div><b>Taradıktan sonra yazıyı oku</b><span>Arama için belgedeki yazıyı otomatik okur (biraz pil harcar).</span></div><button type="button" class="switch ${store.get('taraOtoOku', false) ? 'on' : ''}" data-ayar="taraOtoOku"><i></i></button></div>
        <div class="set-row"><div><b>Yazı dili</b><span>Okuma için kullanılan dil verisi (ilk kullanımda indirilir).</span></div><select id="tAD">${[['tur+eng', 'Türkçe + İngilizce'], ['tur', 'Türkçe'], ['eng', 'İngilizce']].map(([k, n]) => `<option value="${k}" ${ocrDil() === k ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
      </section>
      <section><h4>Depolama</h4>
        <div class="set-row"><div><b>Bu cihazda</b><span>${T.belgeler.length} belge${tah ? ` · ${boyutYaz(tah.usage || 0)} kullanılıyor` : ''}. Taramalar sadece bu cihazda durur; tarayıcı verilerini silersen gider. Önemli belgeleri Drive'a kaydet.</span></div></div>
        ${navigator.storage?.persist ? `<div class="set-row"><div><b>Kalıcı depolama</b><span>${kalici ? 'Açık: tarayıcı yer açmak için taramaları silmez.' : 'Tarayıcıdan, yer darlığında taramaları silmemesini iste.'}</span></div>${kalici ? '' : '<button class="btn" data-action="t-kalici">İste</button>'}</div>` : ''}
      </section>
      <section><h4>Hesap</h4><div class="set-row"><div><b>${girisli ? esc(S.email) : 'Giriş yapılmadı'}</b><span>Tara giriş yapmadan çalışır. Google hesabı sadece Drive'a kaydederken ya da mail gönderirken istenir.</span></div>
        ${girisli ? `<button class="btn" data-action="logout">${IC.logout}Çıkış yap</button>` : ''}</div></section>
      <section><h4>Uygulama</h4>${typeof aboutRow === 'function' ? aboutRow() : ''}${typeof feedbackRow === 'function' && girisli ? feedbackRow() : ''}
        <p class="muted sm">Yazı okuma Tesseract, PDF işlemleri pdf-lib ve PDF.js ile yapılır (hepsi açık kaynak, bu cihazda çalışır). <a href="tara-lib/LISANSLAR.txt" target="_blank" rel="noopener">Lisanslar</a></p></section>
    </div></div></div>`;
  $('#tAF').onchange = e => store.set('taraFiltre', e.target.value);
  $('#tAD').onchange = e => store.set('taraDil', e.target.value);
  document.querySelectorAll('[data-ayar]').forEach(b => b.onclick = () => { const k = b.dataset.ayar, v = !store.get(k, k === 'taraOto'); store.set(k, v); b.classList.toggle('on', v); });
}

/* ═════════ Yardımcılar: açılır menü, soru, bekleme ═════════ */
function tPop(el, ogeler, sec) {
  document.querySelector('.tr-pop')?.remove();
  const p = document.createElement('div'); p.className = 'tr-pop';
  p.innerHTML = ogeler.map(([v, ic, ad, kapali, tehlike]) => `<button data-v="${v}" ${kapali ? 'disabled' : ''} ${tehlike ? 'class="tehlike"' : ''}>${ic || ''}<span>${esc(ad)}</span></button>`).join('');
  document.body.appendChild(p);
  const r = el.getBoundingClientRect(), w = p.offsetWidth, h = p.offsetHeight;
  p.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.right - w)) + 'px';
  p.style.top = (r.bottom + h + 8 > innerHeight ? Math.max(8, r.top - h - 4) : r.bottom + 4) + 'px';
  const kapat = e => { if (e && p.contains(e.target)) return; p.remove(); document.removeEventListener('pointerdown', kapat, true); };
  setTimeout(() => document.addEventListener('pointerdown', kapat, true), 0);
  p.addEventListener('click', e => { const b = e.target.closest('button'); if (!b || b.disabled) return; kapat(); sec(b.dataset.v); });
}
function tSor(baslik, etiket, deger = '', oneriler = []) {
  return new Promise(res => {
    $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>${esc(baslik)}</h3></header>
      <form class="set-body tr-form" id="tSF"><label class="nask-l">${esc(etiket)}<input id="tSQ" value="${esc(deger)}" maxlength="120"></label>
      ${oneriler.length ? `<div class="tr-oneriler">${oneriler.slice(0, 12).map(o => `<button type="button" class="tr-cip sm" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div>` : ''}
      <div class="sticky-actions"><button type="button" class="btn" data-action="close-modal">Vazgeç</button><button class="btn primary">Tamam</button></div></form></div></div>`;
    let bitti = false;
    $('#tSF').addEventListener('submit', e => { e.preventDefault(); bitti = true; const v = $('#tSQ').value; closeModal(); res(v); });
    document.querySelectorAll('#tSF [data-o]').forEach(b => b.onclick = () => { const i = $('#tSQ'); if (etiket.includes('Virgül')) { const L = i.value.split(',').map(x => x.trim()).filter(Boolean); if (!L.includes(b.dataset.o)) L.push(b.dataset.o); i.value = L.join(', '); } else i.value = b.dataset.o; i.focus(); });
    setTimeout(() => { $('#tSQ')?.focus(); $('#tSQ')?.select(); }, 50);
    const gozle = new MutationObserver(() => { if (!$('#tSF')) { gozle.disconnect(); if (!bitti) res(null); } }); gozle.observe($('#modal'), { childList: true });
  });
}
function yukleniyorGoster(yazi, oran) {
  let el = document.querySelector('.tr-bekle');
  if (!el) { el = document.createElement('div'); el.className = 'tr-bekle'; el.innerHTML = '<div><div class="tr-yukleniyor"></div><span></span><i><b></b></i></div>'; document.body.appendChild(el); }
  el.querySelector('span').textContent = yazi || '';
  el.querySelector('i').style.display = oran != null ? '' : 'none'; if (oran != null) el.querySelector('b').style.width = Math.round(oran * 100) + '%';
}
function yukleniyorKapat() { document.querySelector('.tr-bekle')?.remove(); }

/* ═════════ Örnek mod (giriş ve kamera olmadan denemek için) ═════════ */
async function ornekBelgeler() {
  const yap = async (satirlar, o = {}) => {
    const W = 1600, H = 1200, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#6b5444'); bg.addColorStop(1, '#3a2c22'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.save(); g.setTransform(0.52, o.egim || 0.05, -0.08, 0.52, 430, 70); g.fillStyle = '#f3efe6'; g.fillRect(0, 0, 1240, 1754);
    g.fillStyle = '#1b1b1b'; g.font = 'bold 62px Georgia, serif'; g.fillText(satirlar[0], 110, 190); g.font = '40px Georgia, serif';
    satirlar.slice(1).forEach((t, i) => g.fillText(t, 110, 330 + i * 92)); g.restore();
    const sh = g.createLinearGradient(0, 0, W, 0); sh.addColorStop(0.5, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.35)'); g.fillStyle = sh; g.fillRect(0, 0, W, H);
    return tuvaldenBlob(c, 'image/jpeg', 0.9);
  };
  const ornek = [
    { ad: 'Elektrik faturası Eylül', klasor: 'Faturalar', etiketler: ['fatura', '2026'], sayfalar: [['ELEKTRİK FATURASI', 'Abone no: 4021 7781', 'Dönem: Eylül 2026', 'Tüketim: 212 kWh', 'Ödenecek tutar: 1.284,60 TL', 'Son ödeme tarihi: 20.10.2026']] },
    { ad: 'Kira sözleşmesi', klasor: 'Ev', etiketler: ['sözleşme'], sayfalar: [['KİRA SÖZLEŞMESİ', 'Kiraya veren: ...', 'Kiracı: Sinan Erdoğan', 'Aylık kira bedeli: 18.000 TL', 'Başlangıç: 1 Eylül 2026', 'Süre: 1 yıl'], ['MADDE 4 - ÖDEME', 'Kira her ayın 5. günü', 'banka hesabına yatırılır.', 'Depozito: 36.000 TL', '', 'İmzalar']] },
    { ad: 'Garanti belgesi - bulaşık makinesi', klasor: '', etiketler: ['garanti'], sayfalar: [['GARANTİ BELGESİ', 'Ürün: Bulaşık makinesi', 'Seri no: BM-9921-TR', 'Satış tarihi: 3 Mart 2025', 'Garanti süresi: 2 yıl']] }
  ];
  let t = Date.now() - 864e5 * 6;
  for (const o of ornek) {
    const b = { id: tId(), ad: o.ad, klasor: o.klasor, etiketler: o.etiketler, olustu: t, degisti: t, sayfalar: [] };
    const ss = [];
    for (const satir of o.sayfalar) { const s = await yeniSayfa(await yap(satir, { egim: 0.03 + Math.random() * 0.05 })); s.belge = b.id; await sayfaHazirla(s, false); await TDB.koy('sayfalar', s); ss.push(s); }
    b.sayfalar = ss.map(s => s.id); b.sayfaSayisi = ss.length; b.ikon = ss[0].ikon;
    await TDB.koy('belgeler', b); T.belgeler.push(b); t += 864e5 * 2;
  }
}

/* ═════════ Olaylar ═════════ */
Object.assign(ACTIONS, {
  't-tara': () => kameraAc({ mod: store.get('taraMod', 'belge') }),
  't-ice-aktar': () => iceAktar(null),
  't-ayar': () => ayarAc(), settings: () => ayarAc(),
  't-tema': el => { store.set('theme', el.dataset.t); applyTheme(el.dataset.t); ayarAc(); },
  't-kalici': async () => { const ok = await navigator.storage.persist().catch(() => false); toast(ok ? 'Kalıcı depolama açıldı' : 'Tarayıcı izin vermedi (ana ekrana eklenince genelde verir)'); ayarAc(); },
  't-klasor': el => { T.klasor = el.dataset.k; T.etiket = ''; kitaplikCiz(); },
  't-etiket': el => { T.etiket = T.etiket === el.dataset.k ? '' : el.dataset.k; T.klasor = 'tum'; kitaplikCiz(); },
  't-belge': (el, e) => { if (e?.target.closest('.tr-kart-sec')) return; if (T.secim.size) { const id = el.dataset.id; T.secim.has(id) ? T.secim.delete(id) : T.secim.add(id); return izgaraCiz(); } belgeAc(el.dataset.id); },
  't-sec': (el, e) => { e?.stopPropagation(); const id = el.dataset.id; T.secim.has(id) ? T.secim.delete(id) : T.secim.add(id); izgaraCiz(); },
  't-sec-bitir': () => { T.secim.clear(); izgaraCiz(); },
  't-birlestir': () => birlestir([...T.secim]),
  't-sec-klasor': () => klasorSor([...T.secim]),
  't-sec-sil': async () => { const n = T.secim.size; if (!confirm(`${n} belge bu cihazdan silinsin mi?`)) return; for (const id of T.secim) await belgeSil(id); T.secim.clear(); kitaplikCiz(); toast(`${n} belge silindi`); },
  't-kitaplik': () => kitaplikCiz(),
  't-belge-menu': el => belgeMenu(el),
  't-sayfa': (el, e) => { if (T.sayfaSecim) { const id = el.dataset.id; T.sayfaSecim.has(id) ? T.sayfaSecim.delete(id) : T.sayfaSecim.add(id); return belgeCiz(); } duzenleAc(+el.dataset.i); },
  't-sayfa-ekle': el => tPop(el, [['kamera', IC.kamera, 'Kamerayla çek'], ['galeri', IC.galeri, 'Galeriden ya da PDF\'ten']], v => v === 'kamera' ? kameraAc({ mod: 'belge', hedef: T.belge.id }) : iceAktar(T.belge)),
  't-sayfa-sec': () => { T.sayfaSecim = new Set(); belgeCiz(); },
  't-sayfa-sec-bitir': () => { T.sayfaSecim = null; belgeCiz(); },
  't-sayfa-bol': () => sayfalariAyir(),
  't-sayfa-coklu-sil': async () => { const ids = [...T.sayfaSecim]; if (!ids.length || !confirm(`${ids.length} sayfa silinsin mi?`)) return; T.sayfaSecim = null; await sayfaSilBelgeden(ids); if (T.belge && T.ekran !== 'kitaplik') belgeCiz(); },
  't-oku': () => belgeOku(),
  't-disa': () => disaAktar(),
  't-kamera-kapat': () => { const K = T.kamera; kameraKapat(); K?.cekilen?.length ? kameraBittiSor(K) : (T.belge ? belgeCiz() : kitaplikCiz()); },
  't-kamera-bitti': () => kameraBitti(),
  't-kamera-galeri': async () => { const hedef = T.kamera?.hedef ? T.belgeler.find(b => b.id === T.kamera.hedef) : null; kameraKapat(); await iceAktar(hedef); if (T.ekran === 'kamera') kitaplikCiz(); },
  't-cek': () => cek(),
  't-oto': el => { const K = T.kamera; K.oto = !K.oto; store.set('taraOto', K.oto); el.classList.toggle('on', K.oto); toast(K.oto ? 'Otomatik çekim açık' : 'Otomatik çekim kapalı'); },
  't-mod': el => { const k = el.dataset.k; store.set('taraMod', k); if (T.kamera) { T.kamera.mod = k; T.kamera.kimlikOn = null; document.querySelectorAll('.tr-k-modlar button').forEach(b => b.classList.toggle('on', b === el)); modIpucu(); } else kameraAc({ mod: k }); },
  't-duz-geri': async () => { await TDB.koy('sayfalar', duzSayfa()); await belgeKaydet(T.belge); T.duz = null; belgeCiz(); },
  't-duz-onceki': () => { T.duz.i--; T.duz.kose = null; duzenleCiz(); }, 't-duz-sonraki': () => { T.duz.i++; T.duz.kose = null; duzenleCiz(); },
  't-duz-menu': el => duzMenu(el),
  't-arac': el => { T.duz.mod = el.dataset.k; T.duz.secOge = null; if (el.dataset.k !== 'kirp') T.duz.kose = null; aracCiz(); },
  't-filtre': async el => {
    const k = el.dataset.k, hepsi = $('#tHepsine')?.checked, s = duzSayfa();
    document.querySelectorAll('.tr-filtreler button').forEach(b => b.classList.toggle('on', b === el));
    if (hepsi) { for (const x of T.sayfalar) { x.filtre = k; } T.sayfalar.filter(x => x !== s).forEach(x => TDB.koy('sayfalar', x)); }
    s.filtre = k; store.set('taraFiltre', k); await sayfaYenile();
  },
  't-ayar-sifirla': async () => { const s = duzSayfa(); s.parlak = 0; s.kontrast = 0; await sayfaYenile(); aracCiz(); },
  't-don': async el => { const s = duzSayfa(); s.don = (((s.don || 0) + +el.dataset.a) % 360 + 360) % 360; await sayfaYenile(); },
  't-leke-geri': async () => { const s = duzSayfa(); s.leke?.pop(); await sayfaYenile(); },
  't-kalem-tip': el => { T.duz.kalemTip = el.dataset.k; aracCiz(); },
  't-kalem-renk': el => { T.duz.kalemRenk = el.dataset.k; store.set('taraKalemRenk', el.dataset.k); aracCiz(); },
  't-cizim-geri': async () => { const s = duzSayfa(); s.cizim?.pop(); await TDB.koy('sayfalar', s); katmanGuncelle(); aracDugmeGuncelle(); },
  't-kirp-oto': async () => { const s = duzSayfa(); const r = await kagitBulBlob(s.orijinal); T.duz.kose = r.kose; kirpCiz(); if (!r.bulundu) toast('Kenar bulunamadı; köşeleri elle sürükle'); },
  't-kirp-tam': () => { T.duz.kose = [[0, 0], [1, 0], [1, 1], [0, 1]]; kirpCiz(); },
  't-kirp-uygula': async () => { const s = duzSayfa(); s.kose = T.duz.kose.map(p => p.slice()); T.duz.kose = null; s._ornek = null; T.duz.mod = 'filtre'; await sayfaHazirla(s); aracCiz(); },
  't-imza-yeni': () => imzaCizAc(),
  't-imza-koy': (el, e) => { if (e?.target.closest('[data-action="t-imza-sil"]')) return; imzaKoy(+el.dataset.i); },
  't-imza-sil': (el, e) => { e?.stopPropagation(); const L = store.get('taraImzalar', []); L.splice(+el.dataset.i, 1); store.set('taraImzalar', L); aracCiz(); },
  't-yazi-ekle': () => yaziEkle('Yazı'),
  't-tarih-ekle': () => yaziEkle(new Date().toLocaleDateString('tr-TR'), { odaksiz: true }),
  't-isaret-ekle': () => yaziEkle('✓', { boyut: 0.04, odaksiz: true })
});
function kameraBittiSor(K) {
  if (confirm(`${K.cekilen.length} çekilen sayfa kaydedilsin mi?`)) { T.kamera = K; K.kapandi = true; kameraBitti(); }
  else T.belge ? belgeCiz() : kitaplikCiz();
}
window.addEventListener('resize', () => { if (T.ekran === 'duzenle' && T.duz && T.duz.mod !== 'kirp') sahneCiz(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && T.ekran === 'duzenle' && duzSayfa()) TDB.koy('sayfalar', duzSayfa()); });
window.addEventListener('keydown', e => {
  if ($('#modal').innerHTML || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable) return;
  if (T.ekran === 'kamera' && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); cek(); }
  if (T.ekran === 'duzenle' && e.key === 'ArrowLeft' && T.duz.i > 0) ACTIONS['t-duz-onceki']();
  if (T.ekran === 'duzenle' && e.key === 'ArrowRight' && T.duz.i < T.sayfalar.length - 1) ACTIONS['t-duz-sonraki']();
});
