/* ───────────── Müzik ─────────────
   Kendi müzik dosyalarını cihazında (IndexedDB) saklar ve çalar: şarkılar, albümler, sanatçılar, çalma listeleri, favoriler,
   kuyruk, karıştır/tekrarla, uyku zamanlayıcı, ekolayzır, kilit ekranı kontrolü. Giriş gerekmez, ağ isteği yapmaz. Motor muzik-is.js'te. */
'use strict';

window.APP_NAME = 'Müzik';
window.APP_ICON = 'muzik-apple.png?v=1';
window.APP_LEAD = 'Kendi müzik dosyalarını çal; albüm, sanatçı ve çalma listeleriyle düzenle. Hepsi cihazında kalır. Ücretsiz, reklamsız.';

const { DB, bayt, sureYaz, pad } = ME;
const MS = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
Object.assign(IC, {
  yerim: MS('<path d="M7 4h10v16l-5-3.500L7 20z"/>'),
  kopyaM: MS('<rect x="8" y="8" width="12" height="12" rx="2.500"/><path d="M16 8V6.500A2.500 2.500 0 0 0 13.500 4h-7A2.500 2.500 0 0 0 4 6.500v7A2.500 2.500 0 0 0 6.500 16H8"/>'),
  muzik: MS('<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>'),
  sarki: MS('<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'),
  album: MS('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.4"/><path d="M12 3.5v2M20.5 12h-2"/>'),
  kisi: MS('<circle cx="12" cy="8.5" r="3.6"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/>'),
  liste: MS('<path d="M4 6h12M4 11h12M4 16h7"/><path d="M18 14v6M15 17h6"/>'),
  oynat: MS('<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>'),
  durdur: MS('<path d="M8 5.5v13M16 5.5v13" stroke-width="2.6"/>'),
  ileriM: MS('<path d="M6 6v12l9-6z" fill="currentColor"/><path d="M18 6v12"/>'),
  geriM: MS('<path d="M18 6v12l-9-6z" fill="currentColor"/><path d="M6 6v12"/>'),
  karistir: MS('<path d="M4 7h3c5 0 5 10 10 10h3M4 17h3c1.8 0 3-1 4-2.3M13 9.3C14 8 15.200 7 17 7h3"/><path d="m18 4 2.500 3L18 10M18 14l2.500 3-2.500 3"/>'),
  tekrar: MS('<path d="M4 11V9a3 3 0 0 1 3-3h12M20 13v2a3 3 0 0 1-3 3H5"/><path d="m16 3 3.500 3L16 9M8 15l-3.500 3L8 21"/>'),
  tekrarBir: MS('<path d="M4 11V9a3 3 0 0 1 3-3h12M20 13v2a3 3 0 0 1-3 3H5"/><path d="m16 3 3.500 3L16 9M8 15l-3.500 3L8 21"/><path d="M11 10.500l1.500-1v5" stroke-width="1.600"/>'),
  kalp: MS('<path d="M12 19.500S4 14.600 4 9.200A4.200 4.200 0 0 1 8.200 5c1.500 0 2.900.8 3.800 2 .9-1.200 2.300-2 3.800-2A4.200 4.200 0 0 1 20 9.200c0 5.400-8 10.300-8 10.300z"/>'),
  kalpDolu: MS('<path d="M12 19.500S4 14.600 4 9.200A4.200 4.200 0 0 1 8.200 5c1.500 0 2.900.8 3.800 2 .9-1.200 2.300-2 3.800-2A4.200 4.200 0 0 1 20 9.200c0 5.400-8 10.300-8 10.300z" fill="currentColor"/>'),
  more: MS('<circle cx="12" cy="5" r="1.300"/><circle cx="12" cy="12" r="1.300"/><circle cx="12" cy="19" r="1.300"/>'),
  ileri: MS('<path d="M9 5l7 7-7 7"/>'),
  asagi: MS('<path d="m6 9 6 6 6-6"/>'),
  geri: MS('<path d="M15 5l-7 7 7 7"/>'),
  kuyruk: MS('<path d="M4 6h13M4 11h13M4 16h7"/><path d="m16 14 5 3-5 3z" fill="currentColor"/>'),
  ay: MS('<path d="M20 14.500A8.500 8.500 0 1 1 9.500 4a7 7 0 0 0 10.500 10.500z"/>'),
  eq: MS('<path d="M6 4v16M12 4v16M18 4v16"/><circle cx="6" cy="14" r="2" fill="var(--bg,#fff)"/><circle cx="12" cy="8" r="2" fill="var(--bg,#fff)"/><circle cx="18" cy="15" r="2" fill="var(--bg,#fff)"/>'),
  hiz: MS('<path d="M4.500 17a8.500 8.500 0 1 1 15 0"/><path d="m12 13 4-4"/>'),
  indirM: MS('<path d="M12 4v11M7.500 10.500 12 15l4.500-4.500"/><path d="M5 19h14"/>'),
  copM: MS('<path d="M5 7h14M10 7V4.500h4V7M7 7l1 12h8l1-12"/>'),
  kalemM: MS('<path d="M4 20l1-4L16.500 4.500a2.100 2.100 0 0 1 3 3L8 19z"/><path d="M14.500 6.500l3 3"/>'),
  secM: MS('<path d="M5 12.500l4.500 4.500L19 7.500"/>')
});

const M = { s: [], l: [], gor: store.get('mGor', 'sarki'), alb: null, san: null, lis: null, q: '', sira: store.get('mSira', 'ad'), kuyruk: [], orj: [], i: -1, kar: !!store.get('mKar', false), tek: store.get('mTek', 'kapali'),
  ayar: Object.assign({ eq: 'duz', bant: [0, 0, 0, 0, 0], hiz: 1, devam: '10', dengele: true, gecis: 0 }, store.get('mAyar', {})), kazanc: 1, solma: 1, geciste: false, konum: store.get('mKonum', {}), sonKonum: 0, uyku: { bit: 0, sarki: false }, url: '', kap: new Map(), calSay: false, mesgul: false, hata: '' };
const HIZLAR = [.75, 1, 1.25, 1.5, 2];
const EQ_F = [60, 230, 910, 3600, 14000], EQ_AD = ['60 Hz', '230 Hz', '910 Hz', '3,6 kHz', '14 kHz'];
const EQ_ON = { duz: ['Düz', [0, 0, 0, 0, 0]], bas: ['Bas', [6, 4, 0, -1, -2]], tiz: ['Tiz', [-2, -1, 0, 4, 6]], vokal: ['Vokal', [-2, 0, 4, 3, 0]], rock: ['Rock', [4, 2, -2, 2, 4]], pop: ['Pop', [-1, 2, 4, 2, -1]], klasik: ['Klasik', [3, 2, -1, 2, 3]] };
let aud = null;

const kisalt = (s, n) => String(s ?? '').slice(0, n);
const sTemiz = o => {
  if (!o || typeof o !== 'object' || !o.id) return null; const s = ME.sayi;
  return { id: kisalt(o.id, 40), ad: kisalt(o.ad, 200), baslik: kisalt(o.baslik, 200) || 'Adsız', sanatci: kisalt(o.sanatci, 150), album: kisalt(o.album, 150), no: s(o.no, 0, 9999, 0) | 0, sure: s(o.sure, 0, 1e6, 0), boyut: s(o.boyut, 0, 1e12, 0), tip: kisalt(o.tip, 80),
    eklenme: s(o.eklenme, 0, 4e12, Date.now()), fav: !!o.fav, calma: s(o.calma, 0, 1e7, 0) | 0, son: s(o.son, 0, 4e12, 0), kapak: o.kapak instanceof Blob ? o.kapak : null,
    rms: s(o.rms, -120, 0, 0), yim: (Array.isArray(o.yim) ? o.yim : []).slice(0, 100).map(y => ({ t: s(y?.t, 0, 1e6, 0), ad: kisalt(y?.ad, 60) })).sort((a, b) => a.t - b.t) };
};
const lTemiz = o => (!o || typeof o !== 'object' || !o.id) ? null : { id: kisalt(o.id, 40), ad: kisalt(o.ad, 60) || 'Liste', ids: Array.isArray(o.ids) ? o.ids.slice(0, 20000).map(x => kisalt(x, 40)) : [], olusturma: ME.sayi(o.olusturma, 0, 4e12, Date.now()) };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const sarki = id => M.s.find(x => x.id === id);
const tr = (a, b) => String(a).localeCompare(String(b), 'tr');
const dar = () => matchMedia('(max-width: 700px)').matches;

/* ═════════ Başlangıç ═════════ */
document.removeEventListener('DOMContentLoaded', boot);
async function mBaslat() {
  document.documentElement.classList.add('m-html');
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  kabuk();
  try { M.s = (await DB.hepsi('sarki')).map(sTemiz).filter(Boolean); M.l = (await DB.hepsi('liste')).map(lTemiz).filter(Boolean); }
  catch { M.hata = 'Bu tarayıcıda müzik depolanamıyor (özel pencere olabilir).'; }
  if (!['sarki', 'album', 'san', 'liste'].includes(M.gor)) M.gor = 'sarki';
  ciz(); durumYukle();
}
showLogin = msg => { if (msg) toast(msg); };
start = () => mBaslat();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mBaslat); else mBaslat();

function kabuk() {
  $('#app').innerHTML = `
  <div class="m-kabuk" id="mKabuk">
    <header class="m-bas">
      <div class="m-bas1"><div class="brand-mark sm" id="mBrand">${IC.muzik}</div><h1 id="mBaslik">Müzik</h1><div class="spacer"></div>
        <button class="icon-btn" data-action="m-ayar" title="Ayarlar" aria-label="Ayarlar">${IC.gear}</button>
        <button class="btn primary sm" data-action="m-ekle">${IC.plus}<span>Ekle</span></button></div>
      <nav class="seg m-sek" id="mSek">${[['sarki', IC.sarki, 'Şarkılar'], ['album', IC.album, 'Albümler'], ['san', IC.kisi, 'Sanatçılar'], ['liste', IC.liste, 'Listeler']].map(([k, i, n]) => `<button data-action="m-gor" data-k="${k}">${i}<span>${n}</span></button>`).join('')}</nav>
      <div class="m-ara" id="mAra"><label class="m-ara-i">${IC.search}<input id="mAraIn" type="search" placeholder="Şarkı, sanatçı ya da albüm ara…" autocomplete="off" enterkeyhint="search"></label>
        <div class="m-chips" id="mChips">${[['ad', 'Ada göre'], ['san', 'Sanatçıya göre'], ['yeni', 'Son eklenen'], ['cok', 'Çok çalınan']].map(([k, n]) => `<button data-action="m-sira" data-s="${k}">${n}</button>`).join('')}</div></div>
    </header>
    <main class="m-govde" id="mGovde"></main>
    <div class="m-mini" id="mMini" hidden></div>
    <div class="m-birak" id="mBirak" hidden><div>${IC.plus}<b>Bırak, müziğe eklensin</b></div></div>
  </div>
  <div class="m-oyn" id="mOyn" hidden></div>
  <audio id="mAudio" preload="metadata"></audio>
  <input type="file" id="mDosya" accept="audio/*,.mp3,.m4a,.aac,.flac,.ogg,.opus,.wav" multiple hidden>
  <input type="file" id="mKlasor" webkitdirectory multiple hidden>
  <input type="file" id="mKapakIn" accept="image/*" hidden>
  <input type="file" id="mYedekDosya" accept=".zip,application/zip" hidden>`;
  aud = $('#mAudio');
  $('#mDosya').onchange = e => { const l = [...e.target.files]; e.target.value = ''; ekle(l); };
  $('#mKlasor').onchange = e => { const l = [...e.target.files]; e.target.value = ''; ekle(l); };
  $('#mYedekDosya').onchange = e => { const f = e.target.files[0]; e.target.value = ''; if (f) yedekYukle(f); };
  let z = 0; $('#mAraIn').addEventListener('input', e => { clearTimeout(z); z = setTimeout(() => { M.q = e.target.value; ciz(); }, 150); });
  let sy = 0; const dosyaMi = e => [...(e.dataTransfer?.types || [])].includes('Files');
  document.addEventListener('dragenter', e => { if (!dosyaMi(e)) return; e.preventDefault(); sy++; $('#mBirak').hidden = false; });
  document.addEventListener('dragover', e => { if (dosyaMi(e)) e.preventDefault(); });
  document.addEventListener('dragleave', e => { if (!dosyaMi(e)) return; sy = Math.max(0, sy - 1); if (!sy) $('#mBirak').hidden = true; });
  document.addEventListener('drop', e => { sy = 0; $('#mBirak').hidden = true; if (!e.dataTransfer?.files?.length) return; e.preventDefault(); ekle([...e.dataTransfer.files]); });
  sesBagla(aud); document.addEventListener('visibilitychange', () => { if (document.hidden) konumKaydet(true); }); addEventListener('pagehide', () => konumKaydet(true));
  olcBasla();
  setInterval(uykuKontrol, 1000); setInterval(durumKaydet, 5000);
  addEventListener('pagehide', durumKaydet);
}

/* ═════════ Listeler ═════════ */
const albumAnahtar = s => (s.album || '').toLocaleLowerCase('tr');
function suz(l) { const q = M.q.trim().toLocaleLowerCase('tr'); return q ? l.filter(s => q.split(/\s+/).every(w => `${s.baslik} ${s.sanatci} ${s.album}`.toLocaleLowerCase('tr').includes(w))) : l; }
function sirala(l, kip = M.sira) {
  const a = l.slice();
  if (kip === 'san') a.sort((x, y) => tr(x.sanatci || '~', y.sanatci || '~') || tr(x.album, y.album) || x.no - y.no || tr(x.baslik, y.baslik));
  else if (kip === 'yeni') a.sort((x, y) => y.eklenme - x.eklenme);
  else if (kip === 'cok') a.sort((x, y) => y.calma - x.calma || tr(x.baslik, y.baslik));
  else if (kip === 'album') a.sort((x, y) => x.no - y.no || tr(x.baslik, y.baslik));
  else a.sort((x, y) => tr(x.baslik, y.baslik));
  return a;
}
function albumler() {
  const g = new Map();
  for (const s of M.s) { const k = albumAnahtar(s); (g.get(k) || g.set(k, []).get(k)).push(s); }
  return [...g].map(([k, l]) => { const san = [...new Set(l.map(x => x.sanatci).filter(Boolean))]; return { k, ad: l[0].album || 'Bilinmeyen albüm', san: san.length === 1 ? san[0] : san.length ? 'Çeşitli sanatçılar' : '', l, kap: l.find(x => x.kapak) || l[0] }; }).sort((a, b) => (a.k === '') - (b.k === '') || tr(a.ad, b.ad));
}
function sanatcilar() {
  const g = new Map();
  for (const s of M.s) { const k = s.sanatci || ''; (g.get(k) || g.set(k, []).get(k)).push(s); }
  return [...g].map(([k, l]) => ({ k, ad: k || 'Bilinmeyen sanatçı', l, kap: l.find(x => x.kapak) || l[0] })).sort((a, b) => (a.k === '') - (b.k === '') || tr(a.ad, b.ad));
}
const AKILLI = { fav: ['Favoriler', 'kalp', () => M.s.filter(s => s.fav)], son: ['Son eklenenler', 'sarki', () => M.s.filter(s => s.eklenme > Date.now() - 30 * 864e5)], cok: ['Çok çalınanlar', 'oynat', () => M.s.filter(s => s.calma > 0)] };
function aktifListe() {   // şu an ekranda gösterilen şarkılar (çalma sırası)
  if (M.gor === 'sarki') return sirala(suz(M.s));
  if (M.gor === 'album' && M.alb != null) return sirala(suz(albumler().find(a => a.k === M.alb)?.l || []), 'album');
  if (M.gor === 'san' && M.san != null) return sirala(suz(sanatcilar().find(a => a.k === M.san)?.l || []), 'san');
  if (M.gor === 'liste' && M.lis) {
    if (AKILLI[M.lis]) { const l = AKILLI[M.lis][2](); return suz(M.lis === 'cok' ? sirala(l, 'cok') : M.lis === 'son' ? sirala(l, 'yeni') : sirala(l)); }
    const li = M.l.find(x => x.id === M.lis); return suz((li?.ids || []).map(sarki).filter(Boolean));
  }
  return [];
}

/* ═════════ Çizim ═════════ */
function kapUrl(s) { if (!s?.kapak) return ''; let u = M.kap.get(s.id); if (!u) { u = URL.createObjectURL(s.kapak); M.kap.set(s.id, u); } return u; }
const ton = s => { let h = 0; for (const c of (s.album || s.baslik || '')) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
const kapHtml = (s, sinif = '') => { const u = kapUrl(s); return u ? `<img class="${sinif}" src="${u}" alt="" draggable="false">` : `<div class="m-kv ${sinif}" style="--h:${ton(s || {})}">${IC.muzik}</div>`; };
function satir(s, i) {
  const c = M.kuyruk[M.i] === s.id;
  return `<div class="m-satir ${c ? 'calan' : ''}" data-action="m-cal" data-i="${i}" data-id="${esc(s.id)}" role="button" tabindex="0"><div class="m-kap">${kapHtml(s)}${c ? `<span class="m-eqim ${aud && !aud.paused ? 'ac' : ''}"><i></i><i></i><i></i></span>` : ''}</div>
    <div class="m-sat-t"><b>${esc(s.baslik)}</b><span>${esc(s.sanatci || 'Bilinmeyen sanatçı')}${s.album ? ' · ' + esc(s.album) : ''}${devamKonum(s) ? ` · <em class="m-kaldi">${sureYaz(devamKonum(s))}'te kaldı</em>` : ''}</span></div><span class="m-sure">${sureYaz(s.sure)}</span>
    <button class="icon-btn m-kalp ${s.fav ? 'on' : ''}" data-action="m-fav" data-id="${esc(s.id)}" aria-label="Favori">${s.fav ? IC.kalpDolu : IC.kalp}</button>
    <button class="icon-btn" data-action="m-menu" data-id="${esc(s.id)}" aria-label="Diğer">${IC.more}</button></div>`;
}
function bos(ic, baslik, metin, dugme) { return `<div class="m-bos"><div class="m-bos-ic">${ic}</div><b>${baslik}</b><p>${metin}</p>${dugme || ''}</div>`; }
function ciz() {
  const g = $('#mGovde'); if (!g) return;
  document.querySelectorAll('#mSek button').forEach(b => b.classList.toggle('on', b.dataset.k === M.gor));
  document.querySelectorAll('#mChips button').forEach(b => b.classList.toggle('on', b.dataset.s === M.sira));
  const detay = (M.gor === 'album' && M.alb != null) || (M.gor === 'san' && M.san != null) || (M.gor === 'liste' && M.lis);
  const liste = M.gor === 'sarki' || detay;
  $('#mAra').hidden = !liste; $('#mChips').hidden = M.gor !== 'sarki';
  const bm = $('#mBrand'); bm.innerHTML = detay ? IC.geri : IC.muzik; bm.dataset.action = detay ? 'm-geri' : ''; bm.classList.toggle('geri', !!detay);
  $('#mBaslik').textContent = baslikAd(detay);
  $('#mKabuk').classList.toggle('mini-var', M.i >= 0);
  if (M.hata) { g.innerHTML = bos(IC.muzik, 'Depolama yok', esc(M.hata)); return; }
  if (!M.s.length) { g.innerHTML = bos(IC.muzik, 'Müziğin burada olacak', 'Telefonundaki ya da bilgisayarındaki müzik dosyalarını ekle. Hiçbir yere yüklenmez; hepsi cihazında kalır.', `<button class="btn primary" data-action="m-ekle">${IC.plus} Müzik ekle</button>`); return; }
  if (liste) {
    const l = aktifListe(), toplam = l.reduce((t, s) => t + s.sure, 0);
    let ust = '';
    if (detay) ust = `<div class="m-aks"><button class="btn primary" data-action="m-hepsi" ${l.length ? '' : 'disabled'}>${IC.oynat} Çal</button><button class="btn" data-action="m-hepsi" data-k="1" ${l.length ? '' : 'disabled'}>${IC.karistir} Karıştır</button><span class="m-top">${l.length} şarkı${toplam ? ' · ' + sureUzun(toplam) : ''}</span>${(M.gor === 'album' || M.gor === 'san') && l.length ? `<button class="icon-btn" data-action="m-toplu" aria-label="Toplu düzenle">${IC.kalemM}</button>` : ''}${liseMenu()}</div>`;
    else ust = `<div class="m-aks"><button class="btn primary" data-action="m-hepsi" ${l.length ? '' : 'disabled'}>${IC.karistir} Hepsini karıştır</button><span class="m-top">${l.length} şarkı${M.q ? ' bulundu' : ''}</span></div>`;
    g.innerHTML = ust + (l.length ? `<div class="m-liste">${l.map(satir).join('')}</div>` : bos(IC.sarki, M.q ? 'Sonuç yok' : 'Bu listede şarkı yok', M.q ? 'Başka bir şey yazmayı dene.' : 'Şarkıların yanındaki ⋮ menüsünden "Listeye ekle" diyebilirsin.'));
  } else if (M.gor === 'album') {
    g.innerHTML = `<div class="m-izg">${albumler().map(a => `<button class="m-alb" data-action="m-alb" data-k="${esc(a.k)}"><div class="m-alb-k">${kapHtml(a.kap)}</div><b>${esc(a.ad)}</b><span>${esc(a.san)}${a.san ? ' · ' : ''}${a.l.length} şarkı</span></button>`).join('')}</div>`;
  } else if (M.gor === 'san') {
    g.innerHTML = `<div class="m-liste">${sanatcilar().map(a => `<button class="m-san" data-action="m-san" data-k="${esc(a.k)}"><div class="m-kap yuvarlak">${kapHtml(a.kap)}</div><div class="m-sat-t"><b>${esc(a.ad)}</b><span>${a.l.length} şarkı</span></div>${IC.ileri || ''}</button>`).join('')}</div>`;
  } else {
    const ak = Object.entries(AKILLI).map(([k, [ad, ic, f]]) => `<button class="m-kol" data-action="m-lis" data-k="${k}">${IC[ic]}<b>${ad}</b><span>${f().length}</span></button>`).join('');
    g.innerHTML = `<div class="m-kolg">${ak}</div><h3 class="m-bol">Listelerim</h3><div class="m-liste">${M.l.slice().sort((a, b) => tr(a.ad, b.ad)).map(li => `<button class="m-san" data-action="m-lis" data-k="${esc(li.id)}"><div class="m-kap">${kapHtml(sarki(li.ids.find(id => sarki(id)?.kapak)) || sarki(li.ids[0]) || { baslik: li.ad })}</div><div class="m-sat-t"><b>${esc(li.ad)}</b><span>${li.ids.filter(sarki).length} şarkı</span></div></button>`).join('')}<button class="m-san yeni" data-action="m-lis-yeni"><div class="m-kap">${IC.plus}</div><div class="m-sat-t"><b>Yeni çalma listesi</b><span>Şarkılarını bir araya getir</span></div></button></div>`;
  }
  miniCiz();
}
const sureUzun = s => { const sa = Math.floor(s / 3600), d = Math.round(s % 3600 / 60); return sa ? `${sa} sa ${d} dk` : `${Math.max(1, d)} dk`; };
function baslikAd(detay) {
  if (!detay) return { sarki: 'Şarkılar', album: 'Albümler', san: 'Sanatçılar', liste: 'Listeler' }[M.gor];
  if (M.gor === 'album') return albumler().find(a => a.k === M.alb)?.ad || 'Albüm';
  if (M.gor === 'san') return sanatcilar().find(a => a.k === M.san)?.ad || 'Sanatçı';
  return AKILLI[M.lis]?.[0] || M.l.find(x => x.id === M.lis)?.ad || 'Liste';
}
const liseMenu = () => (M.gor === 'liste' && M.lis && !AKILLI[M.lis]) ? `<button class="icon-btn" data-action="m-lis-menu" aria-label="Liste menüsü">${IC.more}</button>` : '';

/* ═════════ Ekleme ═════════ */
const SES = /\.(mp3|m4a|aac|flac|ogg|oga|opus|wav|weba|mp4)$/i, EN_BUYUK = 600 * 1048576;
function ilerleme() {
  let el = $('#mIlerle');
  return (i, n, ad) => {
    el = $('#mIlerle'); if (i == null) { el?.remove(); return; }
    if (!el) { el = document.createElement('div'); el.id = 'mIlerle'; el.className = 'm-ilerle'; document.body.appendChild(el); }
    el.innerHTML = `<b>${i + 1} / ${n}</b><span>${esc(kisalt(ad, 40))}</span><i style="--p:${Math.round(i / n * 100)}%"></i>`;
  };
}
async function ekle(dosyalar) {
  if (M.mesgul) return toast('Önceki ekleme sürüyor…');
  const adaylar = dosyalar.filter(f => /^audio\//.test(f.type) || SES.test(f.name));
  if (!adaylar.length) return toast('Müzik dosyası bulunamadı');
  M.mesgul = true; let tamam = 0, atla = 0, hata = 0; const bar = ilerleme();
  try {
    for (let i = 0; i < adaylar.length; i++) {
      const f = adaylar[i]; bar(i, adaylar.length, f.name);
      try {
        if (f.size > EN_BUYUK) { hata++; continue; }
        const id = await ME.kimlik(f); if (sarki(id)) { atla++; continue; }
        const et = await ME.etiketOku(f), sure = await ME.sureOku(f); if (sure < 0) { hata++; continue; }
        const kapak = await ME.kapakKucult(et.kapak);
        await DB.yaz('dosya', { id, blob: f });
        const rec = { id, ad: f.name, baslik: et.baslik, sanatci: et.sanatci, album: et.album, no: et.no, sure, boyut: f.size, tip: f.type || 'audio/mpeg', eklenme: Date.now() + i, fav: false, calma: 0, son: 0, kapak };
        await DB.yaz('sarki', rec); M.s.push(sTemiz(rec)); tamam++;
      } catch (e) { hata++; if (e?.name === 'QuotaExceededError') { toast('Depolama dolu: bazı dosyalar eklenemedi'); break; } }
    }
  } finally { M.mesgul = false; bar(null); olcBasla(); }
  navigator.storage?.persist?.().catch(() => {});
  ciz(); toast(`${tamam} şarkı eklendi${atla ? ` · ${atla} zaten vardı` : ''}${hata ? ` · ${hata} eklenemedi` : ''}`);
}

/* ═════════ Çalma ═════════ */
function karistirDizi(a, ilk) { const b = a.filter(x => x !== ilk); for (let i = b.length - 1; i > 0; i--) { const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1); [b[i], b[j]] = [b[j], b[i]]; } return ilk ? [ilk, ...b] : b; }
function cal(ids, index, karistir) {
  if (!ids.length) return;
  M.orj = ids.slice();
  if (karistir != null) M.kar = karistir; store.set('mKar', M.kar);
  if (M.kar) { const ilk = karistir ? ids[Math.floor(Math.random() * ids.length)] : ids[index]; M.kuyruk = karistirDizi(ids, ilk); M.i = 0; } else { M.kuyruk = ids.slice(); M.i = index; }
  yukle(true);
}
async function yukle(oynat) {
  const id = M.kuyruk[M.i], s = sarki(id); if (!s) return; if (M.geciste) gecisIptal();
  const sira = ++M.yukSira;
  try {
    const rec = await DB.al('dosya', id); if (!rec?.blob) throw new Error('yok'); if (sira !== M.yukSira) return;
    if (M.url) URL.revokeObjectURL(M.url);
    M.url = URL.createObjectURL(rec.blob); aud.src = M.url; aud.playbackRate = M.ayar.hiz; M.calSay = false; M.kazanc = kazancHesapla(s); sesAyarla();
    if (M.yimGit != null) { M.bekle = M.yimGit; M.yimGit = null; } else if (!M.bekle && oynat) { const t = devamKonum(s); if (t) { M.bekle = t; toast(`Kaldığın yerden devam: ${sureYaz(t)}`, [['Baştan', () => { aud.currentTime = 0; konumSil(s.id); }]]); } }
    if (oynat) { ctxDevam(); await aud.play().catch(() => {}); }
  } catch { toast('Dosya açılamadı: ' + s.baslik); }
  miniCiz(); oynCiz(); medyaOturumu(); satirlariYenile(); $('#mKabuk')?.classList.add('mini-var'); durumKaydet();
}
M.yukSira = 0;
function oynatDurdur() { if (M.i < 0) return; if (aud.paused) { ctxDevam(); aud.play().catch(() => {}); } else aud.pause(); }
function sonraki(otomatik) {
  if (M.i < 0) return;
  if (otomatik && M.tek === 'bir') { aud.currentTime = 0; aud.play().catch(() => {}); return; }
  if (M.i + 1 < M.kuyruk.length) { M.i++; yukle(true); }
  else if (M.tek === 'hepsi' || (!otomatik && M.kuyruk.length > 1 && M.tek !== 'kapali' && false)) { if (M.kar) M.kuyruk = karistirDizi(M.orj); M.i = 0; yukle(true); }
  else if (otomatik) { aud.pause(); aud.currentTime = 0; durumCiz(); }
}
function onceki() { if (M.i < 0) return; if (aud.currentTime > 3 || M.i === 0) { aud.currentTime = 0; return; } M.i--; yukle(true); }
function bitti() {
  if (M.geciste) return; sayacArttir(true); konumSil(M.kuyruk[M.i]);
  if (M.uyku.sarki) { M.uyku = { bit: 0, sarki: false }; aud.pause(); aud.currentTime = 0; oynCiz(); return; }
  sonraki(true);
}
function sayacArttir(son) {
  const s = sarki(M.kuyruk[M.i]); if (!s || M.calSay) return; if (!son && !(aud.duration > 0 && aud.currentTime > aud.duration * .5)) return;
  M.calSay = true; s.calma++; s.son = Date.now(); DB.yaz('sarki', kayit(s)).catch(() => {});
}
const kayit = s => ({ id: s.id, ad: s.ad, baslik: s.baslik, sanatci: s.sanatci, album: s.album, no: s.no, sure: s.sure, boyut: s.boyut, tip: s.tip, eklenme: s.eklenme, fav: s.fav, calma: s.calma, son: s.son, kapak: s.kapak, yim: s.yim || [], rms: s.rms || 0 });
function zamanGuncelle() {
  sayacArttir(false); konumKaydet(false); gecisKontrol();
  const sr = $('#mSeek'); if (sr && !M.surukle) { sr.max = aud.duration || 0; sr.value = aud.currentTime; sr.style.setProperty('--p', (aud.duration ? aud.currentTime / aud.duration * 100 : 0) + '%'); }
  const a = $('#mT1'), b = $('#mT2'); if (a) a.textContent = sureYaz(aud.currentTime); if (b) b.textContent = '-' + sureYaz(Math.max(0, (aud.duration || 0) - aud.currentTime));
  const mi = $('#mMiniBar'); if (mi) mi.style.width = (aud.duration ? aud.currentTime / aud.duration * 100 : 0) + '%';
  if ('mediaSession' in navigator && aud.duration > 0 && Math.floor(aud.currentTime) % 5 === 0) { try { navigator.mediaSession.setPositionState({ duration: aud.duration, playbackRate: aud.playbackRate, position: Math.min(aud.currentTime, aud.duration) }); } catch { /* */ } }
}
function durumCiz() {
  const p = !aud.paused; document.querySelectorAll('[data-oyn]').forEach(b => { b.innerHTML = p ? IC.durdur : IC.oynat; b.setAttribute('aria-label', p ? 'Duraklat' : 'Çal'); });
  document.querySelectorAll('.m-eqim').forEach(e => e.classList.toggle('ac', p));
  if ('mediaSession' in navigator) navigator.mediaSession.playbackState = p ? 'playing' : 'paused';
}
function satirlariYenile() { const id = M.kuyruk[M.i]; document.querySelectorAll('.m-satir').forEach(r => { const c = r.dataset.id === id; r.classList.toggle('calan', c); const k = r.querySelector('.m-kap'); let e = k.querySelector('.m-eqim'); if (c && !e) k.insertAdjacentHTML('beforeend', `<span class="m-eqim ${!aud.paused ? 'ac' : ''}"><i></i><i></i><i></i></span>`); else if (!c && e) e.remove(); }); }
function durumKaydet() { if (M.i < 0) return; store.set('mDurum', { k: M.kuyruk.slice(0, 5000), o: M.orj.slice(0, 5000), i: M.i, t: Math.round(aud.currentTime || 0) }); }
function durumYukle() {
  const d = store.get('mDurum', null); if (!d || !Array.isArray(d.k)) return;
  const ok = d.k.filter(sarki); if (!ok.length) return;
  const mevcut = d.k[d.i]; M.kuyruk = ok; M.orj = (d.o || ok).filter(sarki); M.i = Math.max(0, ok.indexOf(mevcut)); M.bekle = +d.t || 0;
  const s = sarki(M.kuyruk[M.i]); if (!s) { M.i = -1; return; }
  DB.al('dosya', s.id).then(rec => { if (rec?.blob && M.i >= 0) { M.url = URL.createObjectURL(rec.blob); aud.src = M.url; aud.playbackRate = M.ayar.hiz; M.kazanc = kazancHesapla(s); sesAyarla(); ciz(); miniCiz(); medyaOturumu(); } }).catch(() => {});
}

/* ═════════ Kilit ekranı (Media Session) ═════════ */
function medyaOturumu() {
  if (!('mediaSession' in navigator)) return; const s = sarki(M.kuyruk[M.i]); if (!s) return;
  const u = kapUrl(s);
  try { navigator.mediaSession.metadata = new MediaMetadata({ title: s.baslik, artist: s.sanatci, album: s.album, artwork: u ? [{ src: u, sizes: '400x400', type: 'image/jpeg' }] : [] }); } catch { /* */ }
  const e = (a, f) => { try { navigator.mediaSession.setActionHandler(a, f); } catch { /* */ } };
  e('play', () => oynatDurdur()); e('pause', () => aud.pause()); e('previoustrack', () => onceki()); e('nexttrack', () => sonraki(false));
  e('seekto', d => { aud.currentTime = d.seekTime; }); e('seekbackward', d => { aud.currentTime = Math.max(0, aud.currentTime - (d.seekOffset || 10)); }); e('seekforward', d => { aud.currentTime = Math.min(aud.duration || 0, aud.currentTime + (d.seekOffset || 10)); });
}

/* ═════════ Mini oynatıcı ve tam ekran ═════════ */
function miniCiz() {
  const m = $('#mMini'); if (!m) return; const s = sarki(M.kuyruk[M.i]);
  m.hidden = !s; if (!s) return;
  m.innerHTML = `<div class="m-mini-bar"><i id="mMiniBar"></i></div><button class="m-mini-bil" data-action="m-oyn-ac"><div class="m-kap">${kapHtml(s)}</div><div class="m-sat-t"><b>${esc(s.baslik)}</b><span>${esc(s.sanatci || 'Bilinmeyen sanatçı')}</span></div></button>
    <button class="icon-btn" data-action="m-onceki" aria-label="Önceki">${IC.geriM}</button><button class="icon-btn m-oyn-d" data-oyn data-action="m-oynat" aria-label="Çal">${aud.paused ? IC.oynat : IC.durdur}</button><button class="icon-btn" data-action="m-sonraki" aria-label="Sonraki">${IC.ileriM}</button>`;
}
function oynAc() { const o = $('#mOyn'); if (!o || M.i < 0) return; o.hidden = false; M.kuyrukAcik = false; document.documentElement.classList.add('m-acik'); oynCiz(); }
function oynKapat() { const o = $('#mOyn'); if (o) { o.hidden = true; o.innerHTML = ''; } document.documentElement.classList.remove('m-acik'); }
function oynCiz() {
  const o = $('#mOyn'); if (!o || o.hidden) return; const s = sarki(M.kuyruk[M.i]); if (!s) return oynKapat();
  const u = kapUrl(s); o.style.setProperty('--m-bg', u ? `url(${u})` : 'none'); o.style.setProperty('--h', ton(s));
  const sr = Math.abs(M.ayar.hiz - 1) > .01 ? M.ayar.hiz + '×' : '1×', uy = M.uyku.sarki ? 'Şarkı sonu' : M.uyku.bit ? Math.max(1, Math.ceil((M.uyku.bit - Date.now()) / 60000)) + ' dk' : '';
  o.innerHTML = `<div class="m-oyn-ust"><button class="icon-btn" data-action="m-oyn-kapat" aria-label="Küçült">${IC.asagi}</button><b>${M.kuyrukAcik ? 'Sıradakiler' : 'Çalıyor'}</b><button class="icon-btn" data-action="m-menu" data-id="${esc(s.id)}" aria-label="Diğer">${IC.more}</button></div>
    ${M.kuyrukAcik ? `<div class="m-kuyruk">${M.kuyruk.map((id, i) => { const x = sarki(id); return x ? `<div class="m-satir ${i === M.i ? 'calan' : ''}" data-action="m-kuyruk-git" data-i="${i}" role="button" tabindex="0"><div class="m-kap">${kapHtml(x)}</div><div class="m-sat-t"><b>${esc(x.baslik)}</b><span>${esc(x.sanatci)}</span></div><button class="icon-btn" data-action="m-kuyruk-cikar" data-i="${i}" aria-label="Kuyruktan çıkar">${IC.close}</button></div>` : ''; }).join('')}</div>`
    : `<div class="m-oyn-kapak">${kapHtml(s)}</div><div class="m-oyn-bilgi"><div class="m-sat-t"><b>${esc(s.baslik)}</b><span>${esc(s.sanatci || 'Bilinmeyen sanatçı')}${s.album ? ' · ' + esc(s.album) : ''}</span></div><button class="icon-btn m-kalp ${s.fav ? 'on' : ''}" data-action="m-fav" data-id="${esc(s.id)}" aria-label="Favori">${s.fav ? IC.kalpDolu : IC.kalp}</button></div>`}
    <div class="m-oyn-alt"><div class="m-seek"><input id="mSeek" type="range" min="0" max="${aud.duration || 0}" step="0.1" value="${aud.currentTime || 0}" aria-label="Konum"><div class="m-zaman"><span id="mT1">${sureYaz(aud.currentTime)}</span><span id="mT2">-${sureYaz(Math.max(0, (aud.duration || s.sure) - aud.currentTime))}</span></div></div>
      <div class="m-ctl"><button class="icon-btn ${M.kar ? 'on' : ''}" data-action="m-kar" aria-label="Karıştır">${IC.karistir}</button><button class="icon-btn buyuk" data-action="m-onceki" aria-label="Önceki">${IC.geriM}</button><button class="icon-btn m-oyn-d" data-oyn data-action="m-oynat" aria-label="Çal">${aud.paused ? IC.oynat : IC.durdur}</button><button class="icon-btn buyuk" data-action="m-sonraki" aria-label="Sonraki">${IC.ileriM}</button><button class="icon-btn ${M.tek !== 'kapali' ? 'on' : ''}" data-action="m-tek" aria-label="Tekrarla">${M.tek === 'bir' ? IC.tekrarBir : IC.tekrar}</button></div>
      <div class="m-ek"><button class="m-ek-d ${sr !== '1×' ? 'on' : ''}" data-action="m-hiz">${IC.hiz}<span>${sr}</span></button><button class="m-ek-d ${uy ? 'on' : ''}" data-action="m-uyku">${IC.ay}<span>${uy || 'Uyku'}</span></button><button class="m-ek-d ${M.ayar.eq !== 'duz' ? 'on' : ''}" data-action="m-eq">${IC.eq}<span>Ekolayzır</span></button><button class="m-ek-d ${s.yim?.length ? 'on' : ''}" data-action="m-yim" data-id="${esc(s.id)}">${IC.yerim}<span>Yer imi</span></button><button class="m-ek-d ${M.kuyrukAcik ? 'on' : ''}" data-action="m-kuyruk">${IC.kuyruk}<span>Sıra</span></button></div></div>`;
  const sk = $('#mSeek');
  sk.style.setProperty('--p', (aud.duration ? aud.currentTime / aud.duration * 100 : 0) + '%');
  sk.addEventListener('input', () => { M.surukle = true; sk.style.setProperty('--p', (sk.max > 0 ? sk.value / sk.max * 100 : 0) + '%'); $('#mT1').textContent = sureYaz(sk.value); });
  sk.addEventListener('change', () => { aud.currentTime = +sk.value; M.surukle = false; });
}

/* ═════════ Uyku zamanlayıcı ═════════ */
function uykuKontrol() {
  if (!M.uyku.bit) return;
  const kalan = M.uyku.bit - Date.now();
  if (kalan <= 6000 && !aud.paused) { M.solma = Math.max(0, kalan / 6000); sesAyarla(); }
  if (kalan <= 0) { aud.pause(); M.solma = 1; sesAyarla(); M.uyku = { bit: 0, sarki: false }; oynCiz(); toast('Uyku zamanlayıcı müziği durdurdu'); }
  else if (kalan % 60000 < 1000) { const e = document.querySelector('[data-action="m-uyku"] span'); if (e) e.textContent = Math.max(1, Math.ceil(kalan / 60000)) + ' dk'; }
}

/* ═════════ Ekolayzır (yalnız açılınca devreye girer; böylece arka planda çalma en güvenilir hâlinde kalır) ═════════ */
function eqUygula() {
  const duz = M.ayar.bant.every(x => !x);
  if (!M.eq && duz) return;
  if (!M.eq) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext, ctx = new AC(), src = ctx.createMediaElementSource(aud);
      const f = EQ_F.map((hz, i) => { const b = ctx.createBiquadFilter(); b.type = i === 0 ? 'lowshelf' : i === EQ_F.length - 1 ? 'highshelf' : 'peaking'; b.frequency.value = hz; b.Q.value = 1; return b; });
      src.connect(f[0]); f.forEach((b, i) => i && f[i - 1].connect(b)); f[f.length - 1].connect(ctx.destination); M.eq = { ctx, f };
    } catch { toast('Bu tarayıcı ekolayzırı desteklemiyor'); return; }
  }
  M.eq.f.forEach((b, i) => { b.gain.value = M.ayar.bant[i]; });
}
const ctxDevam = () => { if (M.eq?.ctx.state === 'suspended') M.eq.ctx.resume().catch(() => {}); };
const ayarKaydet = () => store.set('mAyar', M.ayar);

/* ═════════ Pencereler ve menüler ═════════ */
function mSor(baslik, alanlar, tamam = 'Kaydet') {
  return new Promise(res => {
    $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-ask="x">${IC.close}</button><h3>${esc(baslik)}</h3></header>
      <form class="set-body" id="mSorForm">${alanlar.map((a, i) => `<label class="nask-l">${esc(a[0])}<input name="a${i}" value="${esc(a[1] || '')}" maxlength="${a[2] || 150}" autocomplete="off" ${i === 0 && a[3] !== false ? 'required' : ''}></label>`).join('')}
      <div class="sticky-actions"><button type="button" class="btn" data-ask="x">Vazgeç</button><button class="btn primary">${esc(tamam)}</button></div></form></div></div>`;
    const bit = v => { closeModal(); res(v); };
    $('#mSorForm').addEventListener('submit', e => { e.preventDefault(); bit(alanlar.map((_, i) => e.target.elements['a' + i].value.trim())); });
    $('#modal').querySelectorAll('[data-ask="x"]').forEach(b => b.onclick = () => bit(null)); setTimeout(() => $('#mSorForm input')?.select(), 50);
  });
}
function onay(baslik, metin, tamam = 'Tamam', tehlike = false) {
  return new Promise(res => {
    $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-ask="x">${IC.close}</button><h3>${esc(baslik)}</h3></header>
      <div class="set-body"><p class="muted sm" style="margin-top:0">${metin}</p><div class="sticky-actions"><button type="button" class="btn" data-ask="x">Vazgeç</button><button type="button" class="btn ${tehlike ? 'tehlike' : 'primary'}" data-ask="ok">${esc(tamam)}</button></div></div></div></div>`;
    $('#modal').querySelectorAll('[data-ask]').forEach(b => b.onclick = () => { closeModal(); res(b.dataset.ask === 'ok'); });
  });
}
function mPop(anchor, html, onClick) {
  document.querySelector('.mpop')?.remove();
  const m = document.createElement('div'); m.className = 'ctx-menu sched-pop mpop'; m.innerHTML = html; document.body.appendChild(m);
  const r = anchor.getBoundingClientRect(), w = m.offsetWidth, h = m.offsetHeight;
  m.style.left = Math.max(8, Math.min(r.right - w, innerWidth - w - 8)) + 'px'; m.style.top = (r.bottom + 6 + h < innerHeight ? r.bottom + 6 : Math.max(8, r.top - h - 6)) + 'px'; m.style.zIndex = 500;
  m.addEventListener('click', e => { const it = e.target.closest('[data-v]'); if (!it) return; m.remove(); onClick(it.dataset.v); });
  setTimeout(() => document.addEventListener('mousedown', function off(e) { if (!e.target.closest('.mpop')) { m.remove(); document.removeEventListener('mousedown', off); } }), 0);
}
const mItem = (v, ic, ad, ek = '') => `<button type="button" class="ctx-item" data-v="${esc(v)}" ${ek}>${ic || '<i></i>'}<span>${ad}</span></button>`;
async function listeSec(anchor, ids) {
  mPop(anchor, `<div class="ctx-title">Listeye ekle</div>${M.l.slice().sort((a, b) => tr(a.ad, b.ad)).map(l => mItem('l:' + l.id, IC.liste, esc(l.ad))).join('')}${mItem('yeni', IC.plus, 'Yeni liste…')}`, async v => {
    let li;
    if (v === 'yeni') { const r = await mSor('Yeni çalma listesi', [['Listenin adı', '', 60]]); if (!r) return; li = { id: uid(), ad: r[0], ids: [], olusturma: Date.now() }; M.l.push(li); }
    else li = M.l.find(x => x.id === v.slice(2)); if (!li) return;
    const yeni = ids.filter(id => !li.ids.includes(id)); li.ids.push(...yeni); await DB.yaz('liste', li); toast(`"${li.ad}" listesine ${yeni.length} şarkı eklendi`); ciz();
  });
}
async function favDegis(s) { s.fav = !s.fav; await DB.yaz('sarki', kayit(s)); }
async function sarkiSil(s) {
  if (!(await onay('Şarkı silinsin mi?', `"${esc(s.baslik)}" bu cihazdan silinir. Orijinal dosyan (varsa) etkilenmez.`, 'Sil', true))) return false;
  await DB.sil('dosya', s.id); await DB.sil('sarki', s.id); M.s = M.s.filter(x => x.id !== s.id);
  const u = M.kap.get(s.id); if (u) { URL.revokeObjectURL(u); M.kap.delete(s.id); }
  for (const l of M.l) if (l.ids.includes(s.id)) { l.ids = l.ids.filter(x => x !== s.id); await DB.yaz('liste', l); }
  const idx = M.kuyruk.indexOf(s.id); M.orj = M.orj.filter(x => x !== s.id);
  if (idx >= 0) { const calan = idx === M.i; M.kuyruk.splice(idx, 1); if (idx < M.i) M.i--; if (!M.kuyruk.length) { aud.pause(); aud.removeAttribute('src'); M.i = -1; oynKapat(); } else if (calan) { M.i = Math.min(M.i, M.kuyruk.length - 1); yukle(!aud.paused); } }
  return true;
}

/* ═════════ Yedek ═════════ */
async function yedekAl() {
  if (!M.s.length) return toast('Yedeklenecek şarkı yok'); const bar = ilerleme();
  try {
    const dosyalar = [], meta = { surum: 1, tarih: Date.now(), sarkilar: M.s.map(s => ({ ...kayit(s), kapak: undefined })), listeler: M.l };
    for (let i = 0; i < M.s.length; i++) { const s = M.s[i]; bar(i, M.s.length, s.baslik); const r = await DB.al('dosya', s.id); if (!r?.blob) continue; dosyalar.push({ ad: `dosyalar/${s.id}`, blob: r.blob }); if (s.kapak) dosyalar.push({ ad: `kapaklar/${s.id}`, blob: s.kapak }); }
    dosyalar.unshift({ ad: 'muzik.json', blob: new Blob([JSON.stringify(meta)], { type: 'application/json' }) });
    const blob = await GE.zipYaz(dosyalar), a = document.createElement('a'); a.href = URL.createObjectURL(blob); const t = new Date(); a.download = `Müzik yedeği ${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}.zip`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 8000);
    toast('Yedek indirildi');
  } catch (e) { toast('Yedek alınamadı: ' + e.message); } finally { bar(null); }
}
async function yedekYukle(file) {
  M.mesgul = true; const bar = ilerleme();
  try {
    const liste = await GE.zipOku(file), jf = liste.find(f => f.ad === 'muzik.json'); if (!jf) throw new Error('Bu dosya bir Müzik yedeği değil');
    const meta = JSON.parse(await (await jf.oku()).text()); if (!meta || !Array.isArray(meta.sarkilar) || meta.sarkilar.length > 200000) throw new Error('Yedek bozuk');
    const dos = new Map(liste.map(f => [f.ad, f])); let n = 0, zaten = 0;
    for (let i = 0; i < meta.sarkilar.length; i++) {
      const m = sTemiz(meta.sarkilar[i]); if (!m) continue; bar(i, meta.sarkilar.length, m.baslik); if (sarki(m.id)) { zaten++; continue; }
      const f = dos.get(`dosyalar/${m.id}`); if (!f) continue; const k = dos.get(`kapaklar/${m.id}`);
      const blob = new File([await f.oku()], m.ad || 'muzik', { type: m.tip }); m.kapak = k ? new Blob([await k.oku()], { type: 'image/jpeg' }) : null;
      await DB.yaz('dosya', { id: m.id, blob }); await DB.yaz('sarki', kayit(m)); M.s.push(m); n++;
    }
    for (const l of (meta.listeler || []).map(lTemiz).filter(Boolean)) { const var0 = M.l.find(x => x.id === l.id); if (var0) { var0.ids = [...new Set([...var0.ids, ...l.ids])]; await DB.yaz('liste', var0); } else { M.l.push(l); await DB.yaz('liste', l); } }
    toast(`${n} şarkı geri yüklendi${zaten ? ` · ${zaten} zaten vardı` : ''}`);
  } catch (e) { toast('Geri yüklenemedi: ' + e.message); } finally { M.mesgul = false; bar(null); ciz(); }
}
async function ayarAc() {
  const toplam = M.s.reduce((a, s) => a + s.boyut, 0), tema = store.get('theme', 'auto'); let kota = '';
  try { const e = await navigator.storage?.estimate?.(); if (e?.quota) kota = ` · tarayıcı payı ${bayt(e.quota)}`; } catch { /* */ }
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Müzik ayarları</h3></header>
    <div class="set-body m-ayar"><section><h4>Depolama</h4><p class="muted sm">${M.s.length} şarkı · ${bayt(toplam)}${kota}</p></section>
      <section><h4>Görünüm</h4><div class="seg yon-seg">${[['light', 'Açık'], ['dark', 'Koyu'], ['auto', 'Otomatik']].map(([k, n]) => `<button class="${tema === k ? 'on' : ''}" data-action="m-tema" data-t="${k}">${n}</button>`).join('')}</div></section>
      <section><h4>Kaldığı yerden devam</h4><p class="muted sm">Uzun kayıtlarda (ders, sesli kitap, podcast) bıraktığın saniyeyi hatırlar.</p><div class="seg yon-seg">${[['hepsi', 'Hepsi'], ['5', '5 dk+'], ['10', '10 dk+'], ['kapali', 'Kapalı']].map(([k, n]) => `<button class="${M.ayar.devam === k ? 'on' : ''}" data-action="m-devam" data-k="${k}">${n}</button>`).join('')}</div></section>
      <section><h4>Ses</h4><label class="g-sw"><input type="checkbox" id="mDengele" ${M.ayar.dengele ? 'checked' : ''}><span>Ses seviyesini dengele (yüksek sesli parçaları kıs)</span></label><p class="muted sm">Şarkılar arka planda ölçülür; ${M.s.filter(x => x.rms).length}/${M.s.length} ölçüldü. Çok uzun kayıtlar (15 dk+) ölçülmez.</p>
        <h4 style="margin-top:14px">Geçişli çalma</h4><div class="seg yon-seg">${[[0, 'Kapalı'], [2, '2 sn'], [4, '4 sn'], [6, '6 sn'], [10, '10 sn']].map(([k, n]) => `<button class="${M.ayar.gecis === k ? 'on' : ''}" data-action="m-gecis" data-k="${k}">${n}</button>`).join('')}</div><p class="muted sm">Şarkı bitmeden sonrakine yumuşak geçer. Ekolayzır açıkken çalışmaz.</p></section>
      <section><h4>Kütüphane</h4><div class="m-satir-b"><button class="btn" data-action="m-kopya">${IC.kopyaM} Kopya şarkıları bul</button></div></section>
      <section><h4>Yedek</h4><p class="muted sm">Bütün şarkılar, kapaklar ve listelerin tek bir ZIP dosyasına yedeklenir.</p><div class="m-satir-b"><button class="btn" data-action="m-yedek">${IC.indirM} Yedek al</button><button class="btn" data-action="m-yedek-yukle">${IC.plus} Yedekten yükle</button></div></section>
      <section><h4>Tehlikeli bölge</h4><button class="btn tehlike" data-action="m-hepsini-sil">Tüm müziği sil</button></section></div></div></div>`;
  $('#mDengele').onchange = e => { M.ayar.dengele = e.target.checked; ayarKaydet(); if (M.i >= 0) { M.kazanc = kazancHesapla(sarki(M.kuyruk[M.i])); sesAyarla(); } if (M.ayar.dengele) olcBasla(); };
}

/* ═════════ Eylemler ═════════ */
const git = k => { M.q = ''; const i = $('#mAraIn'); if (i) i.value = ''; M.gor = k; M.alb = M.san = M.lis = null; store.set('mGor', k); ciz(); $('#mGovde').scrollTop = 0; };
Object.assign(ACTIONS, {
  'm-gor': el => git(el.dataset.k),
  'm-geri': () => { M.q = ''; const i = $('#mAraIn'); if (i) i.value = ''; M.alb = M.san = M.lis = null; ciz(); },
  'm-sira': el => { M.sira = el.dataset.s; store.set('mSira', M.sira); ciz(); },
  'm-ekle': el => mPop(el, `${mItem('d', IC.sarki, 'Müzik dosyası seç…')}${dar() ? '' : mItem('k', IC.liste, 'Klasörden ekle…')}`, v => (v === 'k' ? $('#mKlasor') : $('#mDosya')).click()),
  'm-ayar': () => ayarAc(),
  'm-tema': el => { store.set('theme', el.dataset.t); applyTheme(el.dataset.t); ayarAc(); },
  'm-yedek': () => { closeModal(); yedekAl(); }, 'm-yedek-yukle': () => { closeModal(); $('#mYedekDosya').click(); },
  'm-hepsini-sil': async () => {
    closeModal(); if (!(await onay('Tüm müzik silinsin mi?', 'Bütün şarkı ve listeler bu cihazdan <b>kalıcı olarak</b> silinir. Önce yedek almanı öneririz.', 'Hepsini sil', true))) return;
    aud.pause(); aud.removeAttribute('src'); M.i = -1; M.kuyruk = []; M.orj = []; oynKapat();
    await DB.temizle('sarki'); await DB.temizle('dosya'); await DB.temizle('liste'); M.kap.forEach(u => URL.revokeObjectURL(u)); M.kap.clear(); M.s = []; M.l = []; store.set('mDurum', null); ciz(); toast('Müzik silindi');
  },
  'm-cal': (el, e) => {
    if (e?.target.closest('button')) return; const l = aktifListe(), ids = l.map(s => s.id), i = ids.indexOf(el.dataset.id); if (i < 0) return;
    if (M.kuyruk[M.i] === el.dataset.id && ids.length === M.orj.length) { oynatDurdur(); return; }
    cal(ids, i, null);
  },
  'm-hepsi': el => { const ids = aktifListe().map(s => s.id); if (ids.length) cal(ids, 0, !!el.dataset.k); },
  'm-fav': async el => { const s = sarki(el.dataset.id); if (!s) return; await favDegis(s); document.querySelectorAll(`.m-kalp[data-id="${CSS.escape(s.id)}"]`).forEach(b => { b.classList.toggle('on', s.fav); b.innerHTML = s.fav ? IC.kalpDolu : IC.kalp; }); if (M.gor === 'liste' && M.lis === 'fav') ciz(); },
  'm-menu': async el => {
    const s = sarki(el.dataset.id); if (!s) return;
    mPop(el, `${mItem('kapak', IC.sarki, 'Kapak resmini değiştir…')}${s.kapak ? mItem('kapaksil', IC.close, 'Kapak resmini kaldır') : ''}${mItem('yim', IC.yerim, `Yer imleri${s.yim?.length ? ' (' + s.yim.length + ')' : ''}…`)}${mItem('sira', IC.kuyruk, 'Sıradaki yap')}${mItem('kuyruk', IC.kuyruk, 'Kuyruğa ekle')}${mItem('liste', IC.liste, 'Listeye ekle…')}${M.gor === 'liste' && M.lis && !AKILLI[M.lis] ? mItem('cikar', IC.close, 'Listeden çıkar') : ''}${mItem('duzen', IC.kalemM, 'Bilgileri düzenle…')}${mItem('indir', IC.indirM, 'Dosyayı indir')}${mItem('sil', IC.copM, 'Sil…', 'data-danger')}`, async v => {
      if (v === 'sira' || v === 'kuyruk') { if (M.i < 0) { cal([s.id], 0, false); return; } M.kuyruk = M.kuyruk.filter((x, i) => i === M.i || x !== s.id); const yer = v === 'sira' ? M.i + 1 : M.kuyruk.length; M.kuyruk.splice(yer, 0, s.id); M.orj.push(s.id); toast(v === 'sira' ? 'Sıradaki şarkı yapıldı' : 'Kuyruğa eklendi'); if (M.kuyrukAcik) oynCiz(); }
      if (v === 'yim') yimAc(s.id);
      if (v === 'kapak') kapakSec([s.id]);
      if (v === 'kapaksil') { s.kapak = null; await DB.yaz('sarki', kayit(s)); kapakYenile(); }
      if (v === 'liste') listeSec(el, [s.id]);
      if (v === 'cikar') { const li = M.l.find(x => x.id === M.lis); if (li) { li.ids = li.ids.filter(x => x !== s.id); await DB.yaz('liste', li); ciz(); } }
      if (v === 'duzen') { const r = await mSor('Bilgileri düzenle', [['Şarkı adı', s.baslik, 200], ['Sanatçı', s.sanatci, 150, false], ['Albüm', s.album, 150, false]]); if (!r) return; Object.assign(s, { baslik: r[0] || s.baslik, sanatci: r[1], album: r[2] }); await DB.yaz('sarki', kayit(s)); ciz(); oynCiz(); medyaOturumu(); }
      if (v === 'indir') { const r = await DB.al('dosya', s.id); if (r?.blob) { const a = document.createElement('a'); a.href = URL.createObjectURL(r.blob); a.download = (s.ad || s.baslik).replace(/[\\/:*?"<>|]/g, '_'); document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 8000); } }
      if (v === 'sil') { if (await sarkiSil(s)) { ciz(); oynCiz(); } }
    });
  },
  'm-alb': el => { M.q = ''; M.alb = el.dataset.k; ciz(); $('#mGovde').scrollTop = 0; },
  'm-san': el => { M.q = ''; M.san = el.dataset.k; ciz(); $('#mGovde').scrollTop = 0; },
  'm-lis': el => { M.q = ''; M.lis = el.dataset.k; ciz(); $('#mGovde').scrollTop = 0; },
  'm-lis-yeni': async () => { const r = await mSor('Yeni çalma listesi', [['Listenin adı', '', 60]]); if (!r) return; const li = { id: uid(), ad: r[0], ids: [], olusturma: Date.now() }; M.l.push(li); await DB.yaz('liste', li); M.lis = li.id; ciz(); },
  'm-lis-menu': el => {
    const li = M.l.find(x => x.id === M.lis); if (!li) return;
    mPop(el, `${mItem('ad', IC.kalemM, 'Yeniden adlandır…')}${mItem('sil', IC.copM, 'Listeyi sil…', 'data-danger')}`, async v => {
      if (v === 'ad') { const r = await mSor('Listeyi adlandır', [['Listenin adı', li.ad, 60]]); if (r) { li.ad = r[0]; await DB.yaz('liste', li); ciz(); } }
      if (v === 'sil' && await onay('Liste silinsin mi?', `"${esc(li.ad)}" silinir; şarkıların kütüphanende kalır.`, 'Sil', true)) { await DB.sil('liste', li.id); M.l = M.l.filter(x => x !== li); M.lis = null; ciz(); }
    });
  },
  /* oynatıcı */
  'm-oyn-ac': () => oynAc(), 'm-oyn-kapat': () => oynKapat(),
  'm-oynat': () => oynatDurdur(), 'm-onceki': () => onceki(), 'm-sonraki': () => sonraki(false),
  'm-kar': () => { M.kar = !M.kar; store.set('mKar', M.kar); const ilk = M.kuyruk[M.i]; if (M.kar) M.kuyruk = karistirDizi(M.kuyruk, ilk); else { const t = M.orj.filter(sarki); M.kuyruk = t.length ? t : M.kuyruk; } M.i = Math.max(0, M.kuyruk.indexOf(ilk)); oynCiz(); },
  'm-tek': () => { M.tek = { kapali: 'hepsi', hepsi: 'bir', bir: 'kapali' }[M.tek]; store.set('mTek', M.tek); oynCiz(); toast({ kapali: 'Tekrar kapalı', hepsi: 'Tüm listeyi tekrarla', bir: 'Bu şarkıyı tekrarla' }[M.tek]); },
  'm-hiz': () => { const i = HIZLAR.findIndex(x => Math.abs(x - M.ayar.hiz) < .01); M.ayar.hiz = HIZLAR[(i + 1) % HIZLAR.length]; aud.playbackRate = M.ayar.hiz; ayarKaydet(); oynCiz(); },
  'm-kuyruk': () => { M.kuyrukAcik = !M.kuyrukAcik; oynCiz(); if (M.kuyrukAcik) $('.m-kuyruk .calan')?.scrollIntoView({ block: 'center' }); },
  'm-kuyruk-git': (el, e) => { if (e?.target.closest('[data-action="m-kuyruk-cikar"]')) return; M.i = +el.dataset.i; yukle(true); },
  'm-kuyruk-cikar': el => { const i = +el.dataset.i; if (i === M.i) return toast('Çalan şarkı çıkarılamaz'); const id = M.kuyruk[i]; M.kuyruk.splice(i, 1); M.orj = M.orj.filter(x => x !== id); if (i < M.i) M.i--; oynCiz(); },
  'm-uyku': el => mPop(el, `<div class="ctx-title">Uyku zamanlayıcı</div>${[15, 30, 45, 60].map(n => mItem('d:' + n, IC.ay, n + ' dakika sonra')).join('')}${mItem('sarki', IC.ay, 'Bu şarkı bitince')}${M.uyku.bit || M.uyku.sarki ? mItem('kapat', IC.close, 'Zamanlayıcıyı kapat') : ''}`, v => {
    M.solma = 1; sesAyarla(); if (v === 'kapat') M.uyku = { bit: 0, sarki: false }; else if (v === 'sarki') M.uyku = { bit: 0, sarki: true }; else M.uyku = { bit: Date.now() + +v.slice(2) * 60000, sarki: false };
    oynCiz(); if (v !== 'kapat') toast('Uyku zamanlayıcı kuruldu');
  }),
  'm-eq': () => {
    const bar = () => `<div class="m-eq-on">${Object.entries(EQ_ON).map(([k, [ad]]) => `<button class="${M.ayar.eq === k ? 'on' : ''}" data-action="m-eq-on" data-k="${k}">${ad}</button>`).join('')}</div>`;
    $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Ekolayzır</h3></header><div class="set-body m-eq">${bar()}
      ${EQ_AD.map((ad, i) => `<label class="m-eq-b"><span>${ad}</span><input type="range" min="-12" max="12" step="1" value="${M.ayar.bant[i]}" data-eq="${i}"><output>${M.ayar.bant[i] > 0 ? '+' : ''}${M.ayar.bant[i]}</output></label>`).join('')}
      <p class="g-ipucu muted sm">Ekolayzırı açınca bazı telefonlarda ekran kapalıyken çalma kesilebilir. Sorun yaşarsan "Düz"e getir.</p></div></div></div>`;
    $('#modal').querySelectorAll('input[data-eq]').forEach(r => r.oninput = () => { M.ayar.bant[+r.dataset.eq] = +r.value; M.ayar.eq = 'ozel'; r.nextElementSibling.textContent = (r.value > 0 ? '+' : '') + r.value; $('.m-eq-on .on')?.classList.remove('on'); ayarKaydet(); eqUygula(); });
  },
  'm-eq-on': el => { M.ayar.eq = el.dataset.k; M.ayar.bant = EQ_ON[el.dataset.k][1].slice(); ayarKaydet(); eqUygula(); ACTIONS['m-eq'](); oynCiz(); }
});
document.addEventListener('keydown', e => {
  if (e.target.closest?.('input,textarea,select') || M.i < 0 || $('#modal .modal-bg')) return; const k = e.key;
  if (k === ' ' && !e.target.closest('button')) { e.preventDefault(); oynatDurdur(); }
  else if (k === 'ArrowRight') { e.shiftKey ? sonraki(false) : (aud.currentTime = Math.min(aud.duration || 0, aud.currentTime + 5)); }
  else if (k === 'ArrowLeft') { e.shiftKey ? onceki() : (aud.currentTime = Math.max(0, aud.currentTime - 5)); }
  else if (k === 'Escape' && !$('#mOyn').hidden) oynKapat();
});

/* ═════════ Kaldığı yerden devam ve yer imleri ═════════ */
function devamUygun(s) { const d = M.ayar.devam; if (d === 'kapali') return false; if (d === 'hepsi') return true; return (s.sure || aud?.duration || 0) >= (+d || 10) * 60; }
function devamKonum(s) { const t = M.konum[s.id]; return t && devamUygun(s) && t > 5 && t < (s.sure || 1e9) - 10 ? Math.floor(t) : 0; }
function konumSil(id) { if (id && M.konum[id] != null) { delete M.konum[id]; store.set('mKonum', M.konum); } }
function konumKaydet(zorla) {
  if (M.i < 0 || !aud?.duration || aud.readyState < 1 || M.bekle) return; const s = sarki(M.kuyruk[M.i]); if (!s || !devamUygun(s)) return;
  const simdi = Date.now(); if (!zorla && simdi - M.sonKonum < 5000) return; M.sonKonum = simdi;
  const t = Math.floor(aud.currentTime);
  if (t <= 5 || t >= aud.duration - 10) { konumSil(s.id); return; }
  M.konum[s.id] = t; const ks = Object.keys(M.konum); if (ks.length > 600) delete M.konum[ks[0]]; store.set('mKonum', M.konum);
}
function yimAc(id) {
  const s = sarki(id); if (!s) return; const cal = M.kuyruk[M.i] === id, yim = s.yim || [];
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Yer imleri</h3></header><div class="set-body">
    <p class="muted sm" style="margin-top:0">${esc(s.baslik)}</p>
    ${cal ? `<button class="btn primary" data-action="m-yim-ekle" data-id="${esc(id)}">${IC.yerim} Şu ana yer imi ekle (${sureYaz(aud.currentTime)})</button>` : '<p class="muted sm">Yer imi eklemek için önce bu şarkıyı çal.</p>'}
    <div class="m-yim-l">${yim.length ? yim.map((y, i) => `<div class="m-yim"><button class="m-yim-g" data-action="m-yim-git" data-id="${esc(id)}" data-i="${i}">${IC.oynat}<b>${sureYaz(y.t)}</b><span>${esc(y.ad || 'Yer imi')}</span></button><button class="icon-btn" data-action="m-yim-sil" data-id="${esc(id)}" data-i="${i}" aria-label="Sil">${IC.close}</button></div>`).join('') : '<p class="muted sm" style="margin-top:14px">Henüz yer imi yok.</p>'}</div></div></div></div>`;
}

/* ═════════ Kopya şarkı bulucu ═════════ */
const kopyaAnahtar = s => (s.baslik + '|' + (s.sanatci || '')).toLocaleLowerCase('tr').replace(/[\(\[][^\)\]]*[\)\]]/g, '').replace(/[^\p{L}\p{N}]+/gu, '');
function kopyaGruplari() {
  const ata = M.s.map((_, i) => i), bul = i => { while (ata[i] !== i) { ata[i] = ata[ata[i]]; i = ata[i]; } return i; }, bir = (a, b) => { ata[bul(a)] = bul(b); };
  const ad = new Map(), boy = new Map();
  M.s.forEach((s, i) => {
    const k = kopyaAnahtar(s); if (k.length >= 3 && s.baslik !== 'Adsız') { const l = ad.get(k) || []; for (const j of l) if (Math.abs(M.s[j].sure - s.sure) <= 3) bir(i, j); l.push(i); ad.set(k, l); }
    const bk = s.boyut + ':' + Math.round(s.sure); if (s.boyut > 0) { if (boy.has(bk)) bir(i, boy.get(bk)); else boy.set(bk, i); }
  });
  const g = new Map(); M.s.forEach((s, i) => { const r = bul(i); (g.get(r) || g.set(r, []).get(r)).push(s); });
  const puan = s => (s.sure ? s.boyut / s.sure : 0) + (s.kapak ? 1e4 : 0) + s.calma * 10 + (s.fav ? 5e3 : 0);
  return [...g.values()].filter(x => x.length > 1).map(x => x.sort((a, b) => puan(b) - puan(a)));
}
function kopyaAc() {
  const gr = kopyaGruplari(); M.kopya = gr;
  const kb = s => s.sure ? Math.round(s.boyut * 8 / s.sure / 1000) + ' kb/sn' : bayt(s.boyut);
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Kopya şarkılar</h3></header><div class="set-body">${gr.length ? `<p class="muted sm" style="margin-top:0">Aynı ad ve sanatçıya (süre farkı 3 sn'den az) ya da aynı boyuta sahip ${gr.length} grup bulundu. En iyi kopya (yüksek kalite, kapaklı, çok çalınan) seçili kalır; favori, çalma sayısı ve listeler ona taşınır. Silmeden önce bir bak.</p>
    ${gr.map((g, gi) => `<div class="m-kop"><div class="m-kop-b">${g.map((s, i) => `<label class="m-kop-s"><input type="checkbox" data-g="${gi}" data-s="${esc(s.id)}" ${i > 0 ? 'checked' : ''}><span class="m-sat-t"><b>${esc(s.baslik)}</b><span>${esc(s.sanatci || '—')} · ${sureYaz(s.sure)} · ${kb(s)} · ${bayt(s.boyut)}${i === 0 ? ' · <em class="m-kaldi">tutulacak</em>' : ''}</span></span></label>`).join('')}</div><button class="btn sm primary" data-action="m-kopya-sil" data-g="${gi}">İşaretlileri sil</button></div>`).join('')}
    <div class="sticky-actions"><button type="button" class="btn" data-action="close-modal">Kapat</button><button type="button" class="btn primary" data-action="m-kopya-hepsi">Hepsini temizle (${gr.reduce((a, g) => a + g.length - 1, 0)} şarkı)</button></div>`
    : `<div class="m-bos" style="text-align:center;padding:24px 0"><b>Kopya bulunamadı</b><p class="muted sm">Kütüphanen temiz görünüyor.</p></div><div class="sticky-actions"><button type="button" class="btn primary" data-action="close-modal">Tamam</button></div>`}</div></div></div>`;
}
async function kopyaTemizle(g, silinecek) {   // g: grup (en iyi ilk), silinecek: id kümesi
  const tut = g.find(s => !silinecek.has(s.id)); if (!tut) return 0; let n = 0;
  for (const s of g) {
    if (!silinecek.has(s.id) || s === tut) continue;
    tut.fav = tut.fav || s.fav; tut.calma += s.calma; tut.son = Math.max(tut.son, s.son); if (!tut.kapak && s.kapak) tut.kapak = s.kapak; if (!tut.sanatci && s.sanatci) tut.sanatci = s.sanatci; if (!tut.album && s.album) tut.album = s.album;
    tut.yim = [...(tut.yim || []), ...(s.yim || []).filter(y => !(tut.yim || []).some(z => Math.abs(z.t - y.t) < 2))].sort((a, b) => a.t - b.t);
    for (const l of M.l) if (l.ids.includes(s.id)) { l.ids = l.ids.includes(tut.id) ? l.ids.filter(x => x !== s.id) : l.ids.map(x => x === s.id ? tut.id : x); await DB.yaz('liste', l); }
    const idx = M.kuyruk.indexOf(s.id); if (idx >= 0) { if (idx === M.i) { M.kuyruk[idx] = tut.id; M.yukSira++; const t = aud.currentTime, c = !aud.paused; M.bekle = t; yukle(c); } else M.kuyruk[idx] = tut.id; }
    M.orj = M.orj.map(x => x === s.id ? tut.id : x);
    await DB.sil('dosya', s.id); await DB.sil('sarki', s.id); M.s = M.s.filter(x => x !== s); const u = M.kap.get(s.id); if (u) { URL.revokeObjectURL(u); M.kap.delete(s.id); } konumSil(s.id); n++;
  }
  await DB.yaz('sarki', kayit(tut)); return n;
}
Object.assign(ACTIONS, {
  'm-devam': el => { M.ayar.devam = el.dataset.k; store.set('mAyar', M.ayar); ayarAc(); ciz(); },
  'm-yim': el => yimAc(el.dataset.id),
  'm-yim-ekle': async el => {
    const s = sarki(el.dataset.id); if (!s) return; const t = Math.floor(aud.currentTime), r = await mSor('Yer imi', [['Ad (isteğe bağlı)', `Yer imi ${(s.yim?.length || 0) + 1}`, 60, false]], 'Ekle'); if (!r) return yimAc(s.id);
    s.yim = [...(s.yim || []), { t, ad: r[0] }].sort((a, b) => a.t - b.t).slice(0, 100); await DB.yaz('sarki', kayit(s)); oynCiz(); yimAc(s.id);
  },
  'm-yim-git': el => { const s = sarki(el.dataset.id), y = s?.yim?.[+el.dataset.i]; if (!y) return; closeModal(); if (M.kuyruk[M.i] === s.id) { aud.currentTime = y.t; ctxDevam(); aud.play().catch(() => {}); } else { M.yimGit = y.t; cal([s.id], 0, false); } },
  'm-yim-sil': async el => { const s = sarki(el.dataset.id); if (!s?.yim) return; s.yim.splice(+el.dataset.i, 1); await DB.yaz('sarki', kayit(s)); oynCiz(); yimAc(s.id); },
  'm-kopya': () => kopyaAc(),
  'm-kopya-sil': async el => {
    const g = M.kopya?.[+el.dataset.g]; if (!g) return; const sec = new Set([...document.querySelectorAll(`input[data-g="${el.dataset.g}"]:checked`)].map(i => i.dataset.s)); if (!sec.size) return toast('Silinecek şarkı işaretli değil');
    if (sec.size === g.length) return toast('En az bir kopya kalmalı');
    const n = await kopyaTemizle(g, sec); ciz(); oynCiz(); kopyaAc(); toast(`${n} kopya silindi`);
  },
  'm-kopya-hepsi': async () => {
    const gr = M.kopya || []; if (!(await onay('Kopyalar silinsin mi?', `${gr.reduce((a, g) => a + g.length - 1, 0)} kopya şarkı bu cihazdan silinir; her grupta en iyi kopya kalır. Favori, çalma sayısı ve listeler korunur.`, 'Temizle', true))) return kopyaAc();
    let n = 0; for (const g of gr) n += await kopyaTemizle(g, new Set(g.slice(1).map(s => s.id))); ciz(); oynCiz(); closeModal(); toast(`${n} kopya silindi`);
  }
});

/* ═════════ Ses elemanı olayları (geçişli çalmada iki eleman değişimli kullanılır) ═════════ */
function sesBagla(el) {
  const benim = f => e => { if (e.target === aud) f(e); };
  el.addEventListener('timeupdate', benim(zamanGuncelle)); el.addEventListener('ended', benim(bitti));
  el.addEventListener('play', benim(() => { durumCiz(); if (M.geciste && aud2) aud2.play().catch(() => {}); }));
  el.addEventListener('pause', benim(() => { durumCiz(); konumKaydet(true); if (M.geciste && aud2) aud2.pause(); }));
  el.addEventListener('error', benim(() => { if (M.i >= 0) toast('Bu dosya çalınamadı'); }));
  el.addEventListener('loadedmetadata', benim(() => { if (M.bekle) { aud.currentTime = Math.min(M.bekle, Math.max(0, aud.duration - 1)); M.bekle = 0; } }));
}

/* ═════════ Ses seviyesi dengeleme (ölçüm arka planda; kazanç yalnızca kısar, böylece arka planda çalma değişmez) ═════════ */
const HEDEF_DB = -18;
function kazancHesapla(s) { if (!M.ayar.dengele || !s?.rms || s.rms <= -119) return 1; return Math.min(1, Math.max(.15, Math.pow(10, (HEDEF_DB - s.rms) / 20))); }
function sesAyarla() { if (aud) aud.volume = Math.min(1, Math.max(0, M.kazanc * M.solma)); }
async function rmsOlc(blob) {
  const ab = await blob.arrayBuffer(), Off = window.OfflineAudioContext || window.webkitOfflineAudioContext, ctx = new Off(1, 1, 8000);
  const buf = await new Promise((res, rej) => { const p = ctx.decodeAudioData(ab, res, rej); p?.then?.(res, rej); });
  const k0 = buf.getChannelData(0), k1 = buf.numberOfChannels > 1 ? buf.getChannelData(1) : null, pen = 3200;   // 0,4 sn pencere
  let top = 0, n = 0;
  for (let i = 0; i + pen <= k0.length; i += pen) { let g = 0; for (let j = i; j < i + pen; j++) { const x = k1 ? (k0[j] + k1[j]) / 2 : k0[j]; g += x * x; } g /= pen; if (g > 1e-6) { top += g; n++; } }   // -60 dB altı sessizlik sayılmaz
  if (!n) return -120; return Math.max(-119, Math.min(-1, 10 * Math.log10(top / n)));
}
let olcCalisiyor = false;
async function olcBasla() {
  if (olcCalisiyor || !M.ayar.dengele) return; olcCalisiyor = true;
  try {
    for (;;) {
      if (!M.ayar.dengele) break; await new Promise(r => setTimeout(r, 400));
      const s = M.s.find(x => !x.rms && !x.olcDenendi); if (!s) break; s.olcDenendi = true;
      if (s.sure > 900 || s.boyut > 60 * 1048576) { s.rms = -120; DB.yaz('sarki', kayit(s)).catch(() => {}); continue; }
      try { const rec = await DB.al('dosya', s.id); s.rms = rec?.blob ? await rmsOlc(rec.blob) : -120; } catch { s.rms = -120; }
      DB.yaz('sarki', kayit(s)).catch(() => {});
      if (M.kuyruk[M.i] === s.id && !M.geciste) { M.kazanc = kazancHesapla(s); sesAyarla(); }
    }
  } finally { olcCalisiyor = false; }
}

/* ═════════ Geçişli çalma (iki ses elemanı; ekolayzır açıkken kullanılmaz) ═════════ */
let aud2 = null;
function sonrakiIndeks() { if (M.i + 1 < M.kuyruk.length) return M.i + 1; if (M.tek === 'hepsi' && !M.kar && M.kuyruk.length > 1) return 0; return -1; }
function gecisKontrol() {
  const g = M.ayar.gecis; if (!g || M.geciste || M.eq || M.tek === 'bir' || M.uyku.sarki || aud.paused || !aud.duration) return;
  const kalan = aud.duration - aud.currentTime; if (kalan > g + .25 || kalan < .6 || aud.duration < g * 2 + 2) return;
  const ni = sonrakiIndeks(); if (ni < 0 || !sarki(M.kuyruk[ni])) return;
  gecisBasla(ni);
}
async function gecisBasla(ni) {
  M.geciste = true; const sira = ++M.yukSira, s2 = sarki(M.kuyruk[ni]);
  try {
    const rec = await DB.al('dosya', s2.id); if (!rec?.blob || sira !== M.yukSira || !M.geciste) throw new Error('iptal');
    if (!aud2) { aud2 = new Audio(); aud2.preload = 'auto'; sesBagla(aud2); }
    const url2 = URL.createObjectURL(rec.blob); aud2.src = url2; aud2.playbackRate = M.ayar.hiz; const k2 = kazancHesapla(s2), k1 = M.kazanc; aud2.volume = 0; M.gecisUrl = url2;
    await aud2.play(); const sure = Math.max(500, Math.min(M.ayar.gecis * 1000, (aud.duration - aud.currentTime) * 1000 - 150)), t0 = Date.now(); M.solma = 1;
    M.gecisZm = setInterval(() => {
      const p = Math.min(1, (Date.now() - t0) / sure), a = Math.cos(p * Math.PI / 2), b = Math.sin(p * Math.PI / 2);
      aud.volume = Math.min(1, k1 * a); aud2.volume = Math.min(1, k2 * b);
      if (p >= 1) gecisBitir(ni, k2);
    }, 80);
  } catch { gecisIptal(); }
}
function gecisBitir(ni, k2) {
  clearInterval(M.gecisZm); const eski = aud, sEski = sarki(M.kuyruk[M.i]);
  sayacArttir(true); if (sEski) konumSil(sEski.id);
  const eskiUrl = M.url; M.url = M.gecisUrl; M.gecisUrl = ''; aud = aud2; aud2 = eski; M.i = ni; M.geciste = false; M.calSay = false; M.kazanc = k2; sesAyarla();
  eski.pause(); eski.removeAttribute('src'); eski.load(); if (eskiUrl) URL.revokeObjectURL(eskiUrl);
  miniCiz(); oynCiz(); medyaOturumu(); satirlariYenile(); durumKaydet(); durumCiz();
}
function gecisIptal() {
  clearInterval(M.gecisZm); M.geciste = false; if (aud2) { try { aud2.pause(); aud2.removeAttribute('src'); aud2.load(); } catch {} } if (M.gecisUrl) { URL.revokeObjectURL(M.gecisUrl); M.gecisUrl = ''; }
  M.solma = 1; sesAyarla();
}

/* ═════════ Kapak resmi ve toplu düzenleme ═════════ */
function kapakYenile() { M.kap.forEach(u => URL.revokeObjectURL(u)); M.kap.clear(); ciz(); oynCiz(); miniCiz(); medyaOturumu(); }
function kapakSec(ids) { M.kapakHedef = ids; $('#mKapakIn').click(); }
document.addEventListener('change', async e => {
  if (e.target.id !== 'mKapakIn') return; const f = e.target.files[0]; e.target.value = ''; if (!f || !M.kapakHedef?.length) return;
  const b = await ME.kapakKucult(f); if (!b) return toast('Resim okunamadı');
  for (const id of M.kapakHedef) { const s = sarki(id); if (s) { s.kapak = b; await DB.yaz('sarki', kayit(s)); } }
  const n = M.kapakHedef.length; M.kapakHedef = null; kapakYenile(); toast(n > 1 ? `${n} şarkının kapağı değişti` : 'Kapak değişti');
});
function ortak(l, k) { const v = [...new Set(l.map(s => s[k]))]; return v.length === 1 ? v[0] : ''; }
function topluAc() {
  const l = aktifListe(), alb = M.gor === 'album';
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>${alb ? 'Albümü' : 'Sanatçıyı'} düzenle · ${l.length} şarkı</h3></header>
    <form class="set-body" id="mTopluForm"><p class="muted sm" style="margin-top:0">Boş bıraktığın alan değişmez. Doldurduğun alan bütün şarkılara yazılır.</p>
    ${alb ? `<label class="nask-l">Albüm adı<input name="album" value="${esc(ortak(l, 'album'))}" maxlength="150" autocomplete="off"></label>` : ''}
    <label class="nask-l">Sanatçı<input name="sanatci" value="${esc(ortak(l, 'sanatci'))}" maxlength="150" autocomplete="off"></label>
    <div class="m-satir-b"><button type="button" class="btn" data-action="m-toplu-kapak">${IC.sarki} Kapak resmi seç…</button><button type="button" class="btn" data-action="m-toplu-kapaksil">Kapakları kaldır</button></div>
    <div class="sticky-actions"><button type="button" class="btn" data-action="close-modal">Vazgeç</button><button class="btn primary">Kaydet</button></div></form></div></div>`;
  $('#mTopluForm').addEventListener('submit', async e => {
    e.preventDefault(); const f = e.target.elements, ad = f.album?.value.trim(), san = f.sanatci.value.trim();
    for (const s of l) { if (ad) s.album = ad; if (san) s.sanatci = san; await DB.yaz('sarki', kayit(s)); }
    closeModal(); M.alb = M.san = null; ciz(); oynCiz(); medyaOturumu(); toast(`${l.length} şarkı güncellendi`);
  });
}
Object.assign(ACTIONS, {
  'm-gecis': el => { M.ayar.gecis = +el.dataset.k; ayarKaydet(); if (!M.ayar.gecis && M.geciste) gecisIptal(); ayarAc(); if (M.ayar.gecis && M.eq) toast('Ekolayzır açıkken geçişli çalma kullanılmaz'); },
  'm-toplu': () => topluAc(),
  'm-toplu-kapak': () => { const ids = aktifListe().map(s => s.id); closeModal(); kapakSec(ids); },
  'm-toplu-kapaksil': async () => { const l = aktifListe(); for (const s of l) { s.kapak = null; await DB.yaz('sarki', kayit(s)); } closeModal(); kapakYenile(); toast('Kapaklar kaldırıldı'); }
});
