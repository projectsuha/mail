/* ───────────── Kitaplık ─────────────
   EPUB, PDF ve yazı (.txt) dosyalarını okuma; vurgu, not, ayraç, sesli okuma, okuma günlüğü, alıntı defteri.
   Giriş gerekmez; kitaplar ve notlar yalnızca bu cihazda (IndexedDB) kalır. Motor kitap-is.js'te. */
'use strict';

window.APP_NAME = 'Kitaplık';
window.APP_ICON = 'kitap-apple.png?v=2';
window.APP_LEAD = 'EPUB, PDF ve yazı dosyalarını oku; vurgula, not al, sesli dinle. Her şey cihazında kalır. Ücretsiz, reklamsız.';

const { pad, bugunStr, gunFark, gunEkle, sureYaz } = KB;
const KSVG = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
Object.assign(IC, {
  kitap: KSVG('<path d="M4.5 5.5c2.6-.9 5.3-.6 7.5 1 2.2-1.6 4.9-1.9 7.5-1v12.5c-2.6-.9-5.3-.6-7.5 1-2.2-1.6-4.9-1.9-7.5-1z"/><path d="M12 6.5V19"/>'),
  ara3: KSVG('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.4-4.4"/>'),
  liste: KSVG('<path d="M8.5 6.5H20M8.5 12H20M8.5 17.5H20"/><circle cx="4.5" cy="6.5" r="1" fill="currentColor"/><circle cx="4.5" cy="12" r="1" fill="currentColor"/><circle cx="4.5" cy="17.5" r="1" fill="currentColor"/>'),
  im: KSVG('<path d="M7 4h10v16l-5-3.8L7 20z"/>'),
  imDolu: KSVG('<path d="M7 4h10v16l-5-3.8L7 20z" fill="currentColor"/>'),
  yaz: KSVG('<path d="M5 19l1-4L16.5 4.5a2 2 0 0 1 3 3L9 18z"/><path d="M14.5 6.5l3 3"/>'),
  oynat: KSVG('<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>'),
  durdur: KSVG('<path d="M8 5.5v13M16 5.5v13"/>'),
  dur: KSVG('<rect x="6.5" y="6.5" width="11" height="11" rx="2" fill="currentColor"/>'),
  ses: KSVG('<path d="M4 10v4h3.5L12 18V6L7.5 10z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>'),
  harf: KSVG('<path d="M4 19 9 5l5 14M5.8 14.5h6.4M15.5 19l3-8 2.5 8M16.5 16.5h3.8"/>'),
  indir2: KSVG('<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M5 19h14"/>'),
  yukle2: KSVG('<path d="M12 16V4M7.5 8.5 12 4l4.5 4.5"/><path d="M5 15v4h14v-4"/>'),
  alinti: KSVG('<path d="M6 17c-1.2-1-2-2.5-2-4.5C4 9 6 7 9 6.5M15 17c-1.2-1-2-2.5-2-4.5 0-3.5 2-5.5 5-6"/>'),
  alev: KSVG('<path d="M12 3c1 3 4.5 5 4.5 9.2A4.5 4.5 0 0 1 12 17a4.5 4.5 0 0 1-4.5-4.8c0-1.8.8-3 1.8-4 .3 1.2 1 1.9 1.7 2.1C11 8 11 5.5 12 3z"/>'),
  kopya: KSVG('<rect x="8" y="8" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>'),
  cop: KSVG('<path d="M5 7h14M10 7V4.5h4V7M7 7l1 12h8l1-12"/>'),
  yildiz: KSVG('<path d="m12 3.8 2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.8 6.9 19.5l1-5.7-4.1-4 5.7-.8z"/>'),
  kalem: KSVG('<path d="M5 19l1-4L16.5 4.5a2 2 0 0 1 3 3L9 18z"/>')
});

const dar = () => window.matchMedia('(max-width: 700px)').matches;
const yerelK = () => window.SUHA_YEREL || {};
const VURGU_RENK = ['#f5d547', '#7fd18b', '#74b9f2', '#f29bb8'];
const DURUM = { okuyacak: 'Okuyacak', okuyor: 'Okuyor', bitti: 'Bitti' };
const FONTLAR = { serif: 'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif', sans: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif', okuma: '"Atkinson Hyperlegible", Verdana, Tahoma, sans-serif' };
const TEMALAR = [['acik', 'Açık'], ['sepya', 'Sepya'], ['koyu', 'Koyu'], ['siyah', 'Siyah']];

/* ═════════ Depo (IndexedDB) ═════════ */
const DB = {
  db: null,
  ac() {
    return this.db ? Promise.resolve(this.db) : new Promise((res, rej) => {
      const r = indexedDB.open('suha-kitaplik', 1);
      r.onupgradeneeded = () => { r.result.createObjectStore('kitap', { keyPath: 'id' }); r.result.createObjectStore('dosya'); };
      r.onsuccess = () => { this.db = r.result; res(this.db); };
      r.onerror = () => rej(r.error);
    });
  },
  async is(depo, mod, fn) {
    const db = await this.ac();
    return new Promise((res, rej) => { const t = db.transaction(depo, mod), s = t.objectStore(depo), q = fn(s); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); });
  },
  al: (d, k) => DB.is(d, 'readonly', s => s.get(k)),
  hepsi: d => DB.is(d, 'readonly', s => s.getAll()),
  yaz: (d, k, v) => DB.is(d, 'readwrite', s => (d === 'kitap' ? s.put(v) : s.put(v, k))),
  sil: (d, k) => DB.is(d, 'readwrite', s => s.delete(k)),
  temizle: d => DB.is(d, 'readwrite', s => s.clear())
};

/* ═════════ Durum ═════════ */
const KS = {
  gor: 'kutuphane', kitaplar: [], filtre: 'hepsi', ara: '', sirala: store.get('kitapSira', 'son'),
  gun: (() => { const g = store.get('kitapGun', {}); return g && typeof g === 'object' ? g : {}; })(),
  ayar: Object.assign({ hedefDk: 20, yilHedef: 12 }, store.get('kitapAyar', {})),
  oku: Object.assign({ boyut: 19, font: 'serif', satir: 1.7, kenar: 24, iki: true, mod: 'kaydir', tema: 'acik', ses: 1, sesAd: '' }, store.get('kitapOkuma', {})),
  kapak: {}, hata: ''
};
const gunKaydet = () => store.set('kitapGun', KS.gun);
const ayarKaydet = () => store.set('kitapAyar', KS.ayar);
const okuKaydet = () => store.set('kitapOkuma', KS.oku);
const sayi = (v, a, b, d) => { v = +v; return Number.isFinite(v) ? Math.min(b, Math.max(a, v)) : d; };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const tarihOk = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '') ? s : '';
const trTarih = s => { if (!tarihOk(s)) return ''; const AYL = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']; return `${+s.slice(8)} ${AYL[+s.slice(5, 7) - 1]} ${s.slice(0, 4)}`; };
const kisalt = (s, n) => { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; };

function kitapTemizle(k) {   // dış kaynaktan (yedek) gelen kaydı güvenli biçime sok
  if (!k || typeof k !== 'object' || !/^[0-9a-f]{16}$/.test(k.id)) return null;
  const tur = ['epub', 'pdf', 'txt'].includes(k.tur) ? k.tur : 'epub';
  const m = {
    id: k.id, tur, ad: kisalt(k.ad, 200) || 'Adsız', yazar: kisalt(k.yazar, 200), ekle: tarihOk(k.ekle) || bugunStr(),
    durum: DURUM[k.durum] ? k.durum : 'okuyacak', puan: sayi(k.puan, 0, 5, 0) | 0, ilerleme: sayi(k.ilerleme, 0, 1, 0),
    konum: { b: sayi(k.konum?.b, 0, 100000, 0) | 0, o: sayi(k.konum?.o, 0, 1, 0) }, bas: tarihOk(k.bas), bit: tarihOk(k.bit), sure: sayi(k.sure, 0, 1e8, 0) | 0, son: sayi(k.son, 0, 4e12, 0),
    boyut: sayi(k.boyut, 0, 1e12, 0), dil: kisalt(k.dil, 20), dosyaYok: !!k.dosyaYok, kapak: k.kapak instanceof Blob ? k.kapak : null,
    vurgu: (Array.isArray(k.vurgu) ? k.vurgu : []).slice(0, 5000).map(v => v && typeof v === 'object' && v.id ? ({ id: kisalt(v.id, 40), b: sayi(v.b, 0, 100000, 0) | 0, s: sayi(v.s, 0, 1e9, 0) | 0, e: sayi(v.e, 0, 1e9, 0) | 0, t: kisalt(v.t, 2000), renk: sayi(v.renk, 0, 3, 0) | 0, not: kisalt(v.not, 4000), z: sayi(v.z, 0, 4e12, 0), ad: kisalt(v.ad, 160) }) : null).filter(v => v && v.e > v.s),
    imler: (Array.isArray(k.imler) ? k.imler : []).slice(0, 2000).map(v => v && typeof v === 'object' && v.id ? ({ id: kisalt(v.id, 40), b: sayi(v.b, 0, 100000, 0) | 0, o: sayi(v.o, 0, 1, 0), ad: kisalt(v.ad, 160), z: sayi(v.z, 0, 4e12, 0), ozet: kisalt(v.ozet, 200) }) : null).filter(Boolean)
  };
  return m;
}
const meta = id => KS.kitaplar.find(k => k.id === id);
const metaKaydet = k => DB.yaz('kitap', k.id, k).catch(() => toast('Kaydedilemedi: depolama dolu olabilir'));
function kapakUrl(k) { if (!k.kapak) return ''; return KS.kapak[k.id] || (KS.kapak[k.id] = URL.createObjectURL(k.kapak)); }
const renkTon = s => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h % 360; };

/* ═════════ Başlangıç ═════════ */
document.removeEventListener('DOMContentLoaded', boot);
async function ktBaslat() {
  document.documentElement.classList.add('kt-html');
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  kabuk();
  try { KS.kitaplar = (await DB.hepsi('kitap')).map(kitapTemizle).filter(Boolean); } catch { KS.hata = 'Bu tarayıcıda kitap depolanamıyor (özel pencere olabilir).'; }
  const u = new URLSearchParams(location.search); if (u.has('gunluk')) KS.gor = 'gunluk';
  ciz();
  if ('launchQueue' in window) launchQueue.setConsumer(async p => { for (const h of p.files || []) { try { await dosyaEkle(await h.getFile()); } catch { /* geç */ } } });
}
showLogin = msg => { if (msg) toast(msg); };
start = () => ktBaslat();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ktBaslat); else ktBaslat();

function kabuk() {
  $('#app').innerHTML = `
  <div class="kt-kabuk">
    <header class="kt-bas">
      <div class="kt-bas1"><div class="brand-mark sm">${IC.kitap}</div><h1>Kitaplık</h1><div class="spacer"></div>
        <button class="btn primary sm" data-action="kt-ekle">${IC.plus}<span>Kitap ekle</span></button>
        <button class="icon-btn" data-action="kt-ayar" title="Ayarlar" aria-label="Ayarlar">${IC.gear}</button></div>
      <nav class="seg kt-sek">${[['kutuphane', 'Kitaplık'], ['gunluk', 'Günlük'], ['alinti', 'Alıntılar']].map(([k, n]) => `<button data-action="kt-gor" data-k="${k}">${n}</button>`).join('')}</nav>
    </header>
    <main class="kt-govde" id="ktGovde"></main>
  </div>
  <input type="file" id="ktDosya" accept=".epub,.pdf,.txt,application/epub+zip,application/pdf,text/plain" multiple hidden>
  <div id="okuyucu" hidden></div>`;
  $('#ktDosya').onchange = async e => { const l = [...e.target.files]; e.target.value = ''; for (const f of l) await dosyaEkle(f); };
  const g = $('#ktGovde');
  ['dragover', 'dragenter'].forEach(o => document.addEventListener(o, e => { if ([...(e.dataTransfer?.types || [])].includes('Files')) { e.preventDefault(); } }));
  document.addEventListener('drop', async e => { if (!e.dataTransfer?.files?.length) return; e.preventDefault(); for (const f of e.dataTransfer.files) await dosyaEkle(f); });
}

function ciz() {
  document.querySelectorAll('.kt-sek button').forEach(b => b.classList.toggle('on', b.dataset.k === KS.gor));
  const g = $('#ktGovde'); if (!g) return;
  if (KS.gor === 'kutuphane') kutuphaneCiz(g); else if (KS.gor === 'gunluk') gunlukCiz(g); else alintiCiz(g);
}

/* ═════════ Kitaplık ═════════ */
function kapakHtml(k) {
  const u = kapakUrl(k);
  if (u) return `<img src="${u}" alt="" loading="lazy">`;
  const h = renkTon(k.ad);
  return `<div class="kt-uk" style="--h:${h}"><b>${esc(kisalt(k.ad, 60))}</b><span>${esc(kisalt(k.yazar, 40))}</span><em>${k.tur.toUpperCase()}</em></div>`;
}
function kitapSirala(l) {
  const s = KS.sirala;
  return l.sort((a, b) => s === 'ad' ? a.ad.localeCompare(b.ad, 'tr') : s === 'yazar' ? (a.yazar || '~').localeCompare(b.yazar || '~', 'tr') : s === 'ekle' ? (b.ekle.localeCompare(a.ekle) || b.son - a.son) : ((b.son || 0) - (a.son || 0)));
}
function kutuphaneCiz(g) {
  const q = KS.ara.toLowerCase(), say = d => KS.kitaplar.filter(k => d === 'hepsi' || k.durum === d).length;
  const bul = k => !q || [k.ad, k.yazar].some(x => (x || '').toLowerCase().includes(q)) || k.vurgu.some(v => (v.t + ' ' + v.not).toLowerCase().includes(q));
  const liste = kitapSirala(KS.kitaplar.filter(k => (KS.filtre === 'hepsi' || k.durum === KS.filtre) && bul(k)));
  const sur = KS.kitaplar.filter(k => k.durum === 'okuyor').sort((a, b) => (b.son || 0) - (a.son || 0))[0];
  g.innerHTML = `
    ${KS.hata ? `<p class="kt-uyari">${esc(KS.hata)}</p>` : ''}
    ${sur && !q && KS.filtre === 'hepsi' ? `<button class="kt-devam" data-action="kt-ac" data-id="${sur.id}"><div class="kt-devam-k">${kapakHtml(sur)}</div><div><small>Okumaya devam et</small><b>${esc(sur.ad)}</b><span>${esc(sur.yazar)}</span><div class="kt-bar"><i style="width:${Math.round(sur.ilerleme * 100)}%"></i></div><small>%${Math.round(sur.ilerleme * 100)}${sur.sure ? ' · ' + sureYaz(sur.sure) + ' okundu' : ''}</small></div></button>` : ''}
    <div class="kt-arac">
      <input id="ktAra" type="search" placeholder="Kitap, yazar ya da alıntı ara" maxlength="100" value="${esc(KS.ara)}" autocomplete="off">
      <select id="ktSira" aria-label="Sırala">${[['son', 'Son okunan'], ['ekle', 'Eklenme'], ['ad', 'Ad'], ['yazar', 'Yazar']].map(([k, n]) => `<option value="${k}" ${KS.sirala === k ? 'selected' : ''}>${n}</option>`).join('')}</select>
    </div>
    <div class="kt-filtre">${[['hepsi', 'Hepsi'], ['okuyor', 'Okuyor'], ['okuyacak', 'Okuyacak'], ['bitti', 'Bitti']].map(([k, n]) => `<button class="${KS.filtre === k ? 'on' : ''}" data-action="kt-filtre" data-k="${k}">${n} <small>${say(k)}</small></button>`).join('')}</div>
    ${KS.kitaplar.length ? `<div class="kt-izgara">${liste.map(k => `<div class="kt-kart">
        <button class="kt-kapak" data-action="kt-ac" data-id="${k.id}" aria-label="${esc(k.ad)} aç">${kapakHtml(k)}${k.dosyaYok ? '<i class="kt-yok">Dosya yok</i>' : ''}${k.durum === 'bitti' ? '<i class="kt-bitti">✓</i>' : ''}</button>
        <div class="kt-kb"><b title="${esc(k.ad)}">${esc(k.ad)}</b><span>${esc(k.yazar) || '&nbsp;'}</span>
        <div class="kt-bar"><i style="width:${Math.round(k.ilerleme * 100)}%"></i></div></div>
        <button class="icon-btn kt-dty" data-action="kt-detay" data-id="${k.id}" aria-label="Ayrıntılar">${IC.dots || '⋯'}</button></div>`).join('') || '<p class="muted kt-bos">Aramana uyan kitap yok.</p>'}</div>`
      : `<div class="kt-bosekran"><div class="kt-bosk">${IC.kitap}</div><h2>Kitaplığın boş</h2><p class="muted">EPUB, PDF ya da .txt dosyalarını ekle. Kitaplar bu cihazdan hiçbir yere gönderilmez.</p><button class="btn primary" data-action="kt-ekle">${IC.plus}Kitap ekle</button><p class="muted sm">Dosyaları buraya sürükleyip bırakabilirsin.<br>Kindle/Kobo gibi DRM korumalı kitaplar açılamaz.</p></div>`}`;
  const a = $('#ktAra'); a.oninput = () => { KS.ara = a.value.trim(); const p = a.selectionStart; kutuphaneCiz(g); const n = $('#ktAra'); n.focus(); n.setSelectionRange(p, p); };
  $('#ktSira').onchange = e => { KS.sirala = e.target.value; store.set('kitapSira', KS.sirala); ciz(); };
}

/* ═════════ Kitap ekleme ═════════ */
async function dosyaEkle(f) {
  const ad = f.name || 'kitap', uz = KB.uzanti(ad), tur = uz === 'epub' ? 'epub' : uz === 'pdf' ? 'pdf' : (uz === 'txt' || f.type === 'text/plain') ? 'txt' : '';
  if (!tur) return toast(`“${esc(kisalt(ad, 40))}” desteklenmiyor (EPUB, PDF ya da TXT)`);
  if (f.size > 400 * 1024 * 1024) return toast('Dosya çok büyük (en çok 400 MB)');
  toast(`“${esc(kisalt(ad, 40))}” ekleniyor…`, [], 1500);
  try {
    const buf = await f.arrayBuffer(), id = await KB.kimlik(buf);
    const var_ = meta(id);
    if (var_ && !var_.dosyaYok) return toast('Bu kitap zaten kitaplığında');
    const bilgi = await kitapBilgi(tur, buf, ad);
    const k = var_ || kitapTemizle({ id, tur, ad: '', ekle: bugunStr() });
    Object.assign(k, { tur, ad: bilgi.ad || k.ad, yazar: bilgi.yazar || k.yazar, dil: bilgi.dil || k.dil, boyut: buf.byteLength, dosyaYok: false });
    if (!var_ || !var_.ad || var_.ad === 'Adsız') k.ad = bilgi.ad || KB.dosyaAdi(ad);
    if (bilgi.kapak && !k.kapak) k.kapak = bilgi.kapak;
    await DB.yaz('dosya', id, buf);
    if (!var_) { k.son = Date.now(); KS.kitaplar.push(k); }
    await metaKaydet(k);
    toast(var_ ? 'Dosya kitabına yeniden bağlandı' : `Eklendi: ${esc(kisalt(k.ad, 50))}`);
    ciz();
  } catch (e) { toast('Eklenemedi: ' + esc(e.message || 'dosya okunamadı')); }
}
async function kitapBilgi(tur, buf, ad) {
  if (tur === 'epub') { const e = await KB.epubAc(buf); return { ad: e.meta.ad, yazar: e.meta.yazar, dil: e.meta.dil, kapak: e.kapak }; }
  if (tur === 'txt') return { ad: KB.dosyaAdi(ad) };
  const L = await pdfLib(), pdf = await L.getDocument({ data: new Uint8Array(buf.slice(0)), isEvalSupported: false }).promise;
  let b = {}; try { const m = (await pdf.getMetadata()).info || {}; b = { ad: String(m.Title || '').trim(), yazar: String(m.Author || '').trim() }; } catch { /* üstveri yok */ }
  try {
    const p = await pdf.getPage(1), v0 = p.getViewport({ scale: 1 }), v = p.getViewport({ scale: 260 / v0.width }), c = document.createElement('canvas');
    c.width = Math.round(v.width); c.height = Math.round(v.height);
    await p.render({ canvasContext: c.getContext('2d'), viewport: v }).promise;
    b.kapak = await new Promise(r => c.toBlob(r, 'image/jpeg', .78));
  } catch { /* kapaksız */ }
  pdf.destroy?.(); return b;
}
let pdfjs = null;
async function pdfLib() {
  if (!pdfjs) { pdfjs = await import('./tara-lib/pdf.min.mjs'); pdfjs.GlobalWorkerOptions.workerSrc = 'tara-lib/pdf.worker.min.mjs'; }
  return pdfjs;
}

/* ═════════ Kitap ayrıntıları ═════════ */
function detayAc(id) {
  const k = meta(id); if (!k) return;
  const yildiz = [1, 2, 3, 4, 5].map(i => `<button class="kt-y ${k.puan >= i ? 'on' : ''}" data-action="kt-puan" data-id="${id}" data-p="${i}" aria-label="${i} yıldız">${IC.yildiz}</button>`).join('');
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask kt-sheet"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal" aria-label="Kapat">${IC.close}</button><h3>Kitap</h3></header>
    <div class="kt-form">
      <div class="kt-dk"><div class="kt-devam-k">${kapakHtml(k)}</div><div class="kt-dmeta"><small>${k.tur.toUpperCase()} · ${k.boyut ? (k.boyut / 1048576).toFixed(1) + ' MB' : ''}</small><small>Eklendi: ${trTarih(k.ekle)}</small>${k.sure ? `<small>Okuma süresi: ${sureYaz(k.sure)}</small>` : ''}<small>${k.vurgu.length} vurgu · ${k.imler.length} ayraç</small></div></div>
      <label>Ad<input id="kdAd" maxlength="200" value="${esc(k.ad)}"></label>
      <label>Yazar<input id="kdYazar" maxlength="200" value="${esc(k.yazar)}"></label>
      <div class="kt-satir"><label>Durum<select id="kdDurum">${Object.entries(DURUM).map(([a, n]) => `<option value="${a}" ${k.durum === a ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
        <label>Başladığı gün<input type="date" id="kdBas" value="${k.bas}"></label><label>Bitirdiği gün<input type="date" id="kdBit" value="${k.bit}"></label></div>
      <div class="kt-puan">Puan <span>${yildiz}</span></div>
      <div class="kt-btns"><button class="btn primary" data-action="kt-dkaydet" data-id="${id}">Kaydet</button>
        ${k.dosyaYok ? `<button class="btn" data-action="kt-ekle">Dosyayı yeniden ekle</button>` : ''}
        <button class="btn tehlike" data-action="kt-sil" data-id="${id}">${IC.cop}Sil</button></div>
    </div></div></div>`;
}
function detayKaydet(id) {
  const k = meta(id); if (!k) return;
  k.ad = kisalt($('#kdAd').value.trim(), 200) || k.ad; k.yazar = kisalt($('#kdYazar').value.trim(), 200);
  const d = $('#kdDurum').value; durumDegis(k, d, tarihOk($('#kdBas').value), tarihOk($('#kdBit').value));
  metaKaydet(k); closeModal(); ciz();
}
function durumDegis(k, d, bas, bit) {
  k.durum = d;
  if (d === 'okuyor' && !k.bas) k.bas = bugunStr();
  if (d === 'bitti') { k.bit = bit || k.bit || bugunStr(); if (!k.bas) k.bas = k.bit; k.ilerleme = 1; } else if (bit === '' ) k.bit = '';
  if (bas !== undefined && bas !== null) k.bas = bas || k.bas;
}

/* ═════════ Okuma günlüğü ═════════ */
function haftaBas(g) { const t = new Date(+g.slice(0, 4), +g.slice(5, 7) - 1, +g.slice(8, 10)); const w = (t.getDay() + 6) % 7; return gunEkle(g, -w); }
function gunlukCiz(g) {
  const b = bugunStr(), hedef = KS.ayar.hedefDk, bsn = KS.gun[b] || 0, yuz = Math.min(1, bsn / (hedef * 60));
  const seri = KB.seri(KS.gun, b, hedef), yil = b.slice(0, 4);
  const bitenler = KS.kitaplar.filter(k => k.durum === 'bitti').sort((a, c) => (c.bit || '').localeCompare(a.bit || ''));
  const buYil = bitenler.filter(k => (k.bit || '').startsWith(yil)).length;
  const son14 = Array.from({ length: 14 }, (_, i) => gunEkle(b, i - 13)), mx = Math.max(hedef * 60, ...son14.map(d => KS.gun[d] || 0));
  const hs = haftaBas(b); const hafta = Array.from({ length: 7 }, (_, i) => gunEkle(hs, i)).reduce((a, d) => a + (KS.gun[d] || 0), 0);
  const ay = Object.entries(KS.gun).filter(([d]) => d.startsWith(b.slice(0, 7))).reduce((a, [, s]) => a + s, 0);
  const toplam = Object.values(KS.gun).reduce((a, s) => a + s, 0), HG = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const R_ = 44, C_ = 2 * Math.PI * R_;
  g.innerHTML = `<div class="kt-gunluk">
    <section class="kt-halka"><svg viewBox="0 0 110 110" aria-hidden="true"><circle cx="55" cy="55" r="${R_}" class="iz"/><circle cx="55" cy="55" r="${R_}" class="ilr" style="stroke-dasharray:${(C_ * yuz).toFixed(1)} ${C_.toFixed(1)}"/></svg>
      <div><b>${sureYaz(bsn)}</b><span>bugün · hedef ${hedef} dk</span>${seri ? `<em>${IC.alev}${seri} günlük seri</em>` : '<em class="sol">Bugün biraz oku, seri başlasın</em>'}</div></section>
    <section class="kt-ist"><div><b>${sureYaz(hafta)}</b><span>bu hafta</span></div><div><b>${sureYaz(ay)}</b><span>bu ay</span></div><div><b>${sureYaz(toplam)}</b><span>toplam</span></div></section>
    <section class="kt-kart2"><h3>Son 14 gün</h3><div class="kt-cubuk">${son14.map(d => { const s = KS.gun[d] || 0, t = new Date(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8)); return `<div title="${trTarih(d)}: ${sureYaz(s)}"><i class="${s >= hedef * 60 ? 'ok' : ''}" style="height:${Math.max(3, Math.round(s / mx * 100))}%"></i><small>${HG[(t.getDay() + 6) % 7][0]}</small></div>`; }).join('')}</div></section>
    <section class="kt-kart2"><h3>${yil} okuma hedefi</h3><div class="kt-yilh"><b>${buYil}</b><span>/ ${KS.ayar.yilHedef} kitap</span></div><div class="kt-bar lg"><i style="width:${Math.min(100, Math.round(buYil / Math.max(1, KS.ayar.yilHedef) * 100))}%"></i></div>
      <small class="muted">Hedefi Ayarlar'dan değiştirebilirsin.</small></section>
    <section class="kt-kart2"><h3>Bitirilen kitaplar <small>${bitenler.length}</small></h3>
      ${bitenler.length ? bitenler.map(k => `<button class="kt-bsatir" data-action="kt-detay" data-id="${k.id}"><div class="kt-mini">${kapakHtml(k)}</div><div><b>${esc(k.ad)}</b><span>${esc(k.yazar)}</span><small>${k.bit ? trTarih(k.bit) : ''}${k.puan ? ' · ' + '★'.repeat(k.puan) : ''}${k.sure ? ' · ' + sureYaz(k.sure) : ''}</small></div></button>`).join('') : '<p class="muted sm">Bitirdiğin kitaplar burada listelenir. Bir kitabın durumunu “Bitti” yapman yeter.</p>'}</section></div>`;
}

/* ═════════ Alıntı defteri ═════════ */
KS.alintiAra = '';
function tumAlintilar() {
  const q = KS.alintiAra.toLowerCase(), c = [];
  for (const k of KS.kitaplar) for (const v of k.vurgu) if (!q || (v.t + ' ' + v.not + ' ' + k.ad).toLowerCase().includes(q)) c.push({ k, v });
  return c.sort((a, b) => b.v.z - a.v.z);
}
function alintiCiz(g) {
  const l = tumAlintilar(), grup = new Map();
  for (const x of l) { if (!grup.has(x.k.id)) grup.set(x.k.id, []); grup.get(x.k.id).push(x.v); }
  const toplam = KS.kitaplar.reduce((a, k) => a + k.vurgu.length, 0);
  g.innerHTML = `<div class="kt-alinti"><div class="kt-arac"><input id="ktAAra" type="search" placeholder="Alıntılarda ve notlarda ara" maxlength="100" value="${esc(KS.alintiAra)}" autocomplete="off">
    ${toplam ? `<button class="btn sm" data-action="kt-md">${IC.indir2}Markdown</button>` : ''}</div>
    ${toplam ? [...grup].map(([id, vs]) => { const k = meta(id); return `<section class="kt-kart2"><h3>${esc(k.ad)} <small>${esc(k.yazar)}</small></h3>${vs.sort((a, b) => a.b - b.b || a.s - b.s).map(v => `<blockquote class="kt-aq" style="--r:${VURGU_RENK[v.renk]}"><p>${esc(v.t)}</p>${v.not ? `<div class="kt-an">${IC.kalem}<span>${esc(v.not)}</span></div>` : ''}<footer><small>${esc(v.ad)}${v.ad ? ' · ' : ''}${trTarih(new Date(v.z).toISOString().slice(0, 10))}</small>
      <span><button class="icon-btn" data-action="kt-akopya" data-id="${id}" data-v="${esc(v.id)}" aria-label="Kopyala" title="Kopyala">${IC.kopya}</button>${k.dosyaYok ? '' : `<button class="btn sm" data-action="kt-agit" data-id="${id}" data-v="${esc(v.id)}">Kitapta aç</button>`}</span></footer></blockquote>`).join('')}</section>`; }).join('') || '<p class="muted kt-bos">Aramana uyan alıntı yok.</p>'
      : `<div class="kt-bosekran"><div class="kt-bosk">${IC.alinti}</div><h2>Henüz alıntı yok</h2><p class="muted">Okurken bir yeri seçip vurguladığında ya da not aldığında burada toplanır.</p></div>`}</div>`;
  const a = $('#ktAAra'); if (a) a.oninput = () => { KS.alintiAra = a.value.trim(); const p = a.selectionStart; alintiCiz(g); const n = $('#ktAAra'); n.focus(); n.setSelectionRange(p, p); };
}
const alintiMetni = (k, v) => `“${v.t}”\n— ${k.ad}${k.yazar ? ', ' + k.yazar : ''}${v.not ? '\n\nNot: ' + v.not : ''}`;
function markdownYap() {
  let s = '# Alıntılarım\n\n';
  for (const k of KS.kitaplar) { if (!k.vurgu.length) continue; s += `## ${k.ad}${k.yazar ? ' — ' + k.yazar : ''}\n\n`; for (const v of k.vurgu.slice().sort((a, b) => a.b - b.b || a.s - b.s)) s += `> ${v.t.replace(/\n+/g, '\n> ')}\n${v.not ? `\n**Not:** ${v.not}\n` : ''}\n`; }
  return s;
}

/* ═════════ Ayarlar ═════════ */
function ayarAc() {
  const t = store.get('theme', 'light');
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet settings"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal" aria-label="Kapat">${IC.close}</button><h3>Ayarlar</h3></header>
    <div class="set-body">
      <section><h4>Görünüm</h4><div class="seg yon-seg">${[['light', 'Cam'], ['dark', 'Koyu'], ['auto', 'Otomatik'], ['flat', 'Düz']].map(([k, n]) => `<button class="${t === k ? 'on' : ''}" data-action="kt-tema" data-t="${k}">${n}</button>`).join('')}</div></section>
      <section><h4>Okuma hedefleri</h4>
        <div class="set-row"><div><b>Günlük hedef</b><span>Her gün en az bu kadar oku, seri sürsün.</span></div><select id="kaHedef" class="kt-sel">${[5, 10, 15, 20, 30, 45, 60, 90].map(n => `<option value="${n}" ${KS.ayar.hedefDk === n ? 'selected' : ''}>${n} dakika</option>`).join('')}</select></div>
        <div class="set-row"><div><b>Yıllık hedef</b><span>Bu yıl kaç kitap bitirmek istiyorsun?</span></div><select id="kaYil" class="kt-sel">${[3, 6, 12, 18, 24, 36, 52, 100].map(n => `<option value="${n}" ${KS.ayar.yilHedef === n ? 'selected' : ''}>${n} kitap</option>`).join('')}</select></div></section>
      <section><h4>Verilerin</h4>
        <div class="set-row"><div><b>Bu cihazda</b><span>${KS.kitaplar.length} kitap, ${KS.kitaplar.reduce((a, k) => a + k.vurgu.length, 0)} vurgu, ${KS.kitaplar.reduce((a, k) => a + k.imler.length, 0)} ayraç yalnızca bu cihazda saklanır; hiçbir yere gönderilmez.</span></div></div>
        <div class="set-row"><div><b>Yedek dosyası (.json)</b><span>Notların, vurguların, ayraçların ve okuma günlüğün. Kitap dosyaları yedeğe girmez; aynı dosyayı yeniden eklediğinde notların geri bağlanır.</span></div><button class="btn sm" data-action="kt-yedek">${IC.indir2}Yedek al</button></div>
        <div class="set-row"><div><b>Yedeği geri yükle</b><span>Aynı kayıt iki kez eklenmez.</span></div><button class="btn sm" data-action="kt-yedek-ac">${IC.yukle2}Dosya seç</button></div>
        <input type="file" id="kaYedekDosya" accept=".json,application/json" hidden>
        <div class="set-row"><div><b>Her şeyi sil</b><span>Kitaplar, notlar ve günlük silinir. Geri alınamaz; önce yedek al.</span></div><button class="btn sm tehlike" data-action="kt-hepsini-sil">Sil</button></div></section>
      <section><h4>Uygulama</h4>${typeof aboutRow === 'function' ? aboutRow() : ''}</section>
    </div></div></div>`;
  $('#kaHedef').onchange = e => { KS.ayar.hedefDk = +e.target.value; ayarKaydet(); ciz(); };
  $('#kaYil').onchange = e => { KS.ayar.yilHedef = +e.target.value; ayarKaydet(); ciz(); };
  $('#kaYedekDosya').onchange = async e => { const f = e.target.files[0]; e.target.value = ''; if (f) await yedekAl(f); };
}
function indirDosya(ad, icerik, tur) {
  const b = new Blob([icerik], { type: tur }), a = document.createElement('a');
  a.href = URL.createObjectURL(b); a.download = ad; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 8000);
}
function yedekYap() {
  const kl = KS.kitaplar.map(k => { const { kapak, ...r } = k; return r; });
  return JSON.stringify({ suha: 'kitaplik', surum: 1, tarih: new Date().toISOString(), kitaplar: kl, gun: KS.gun, ayar: KS.ayar });
}
async function yedekAl(f) {
  if (f.size > 60 * 1024 * 1024) return toast('Yedek dosyası çok büyük');
  let d; try { d = JSON.parse(await f.text()); } catch { return toast('Bu dosya okunamadı'); }
  if (!d || d.suha !== 'kitaplik' || !Array.isArray(d.kitaplar)) return toast('Bu bir Kitaplık yedeği değil');
  let yeni = 0, birlesen = 0;
  for (const ham of d.kitaplar.slice(0, 5000)) {
    const t = kitapTemizle(ham); if (!t) continue;
    const var_ = meta(t.id);
    if (var_) {
      const vv = new Set(var_.vurgu.map(v => v.id)), ii = new Set(var_.imler.map(v => v.id));
      for (const v of t.vurgu) if (!vv.has(v.id)) var_.vurgu.push(v);
      for (const v of t.imler) if (!ii.has(v.id)) var_.imler.push(v);
      var_.sure = Math.max(var_.sure, t.sure); if (!var_.puan) var_.puan = t.puan;
      if (t.ilerleme > var_.ilerleme) { var_.ilerleme = t.ilerleme; var_.konum = t.konum; }
      await metaKaydet(var_); birlesen++;
    } else { t.dosyaYok = true; KS.kitaplar.push(t); await metaKaydet(t); yeni++; }
  }
  if (d.gun && typeof d.gun === 'object') for (const [g, s] of Object.entries(d.gun)) if (tarihOk(g) && Number.isFinite(+s)) KS.gun[g] = Math.max(KS.gun[g] || 0, Math.min(86400, +s));
  gunKaydet(); toast(`Yedek yüklendi: ${yeni} yeni kitap kaydı, ${birlesen} kitap birleştirildi`); closeModal(); ciz();
}

/* ═════════ OKUYUCU ═════════ */
const R = { k: null, kit: null, b: 0, ic: null, kap: null, url: [], ac: false, kaydetZ: 0, etkin: 0, tts: null, metinler: null, pdf: null, secim: null, sayfaNo: 0, sayfaToplam: 1 };
const rel = () => $('#okuyucu');
const sayfali = () => R.k && R.k.tur !== 'pdf' && KS.oku.mod === 'sayfa';

async function kitapAc(id, hedef) {
  const k = meta(id); if (!k) return;
  if (k.dosyaYok) { detayAc(id); return toast('Bu kitabın dosyası yok; dosyayı yeniden ekle'); }
  let buf; try { buf = await DB.al('dosya', id); } catch { buf = null; }
  if (!buf) return toast('Kitap dosyası bulunamadı');
  toast('Kitap açılıyor…', [], 1200);
  try {
    if (k.tur === 'epub') R.kit = await KB.epubAc(buf);
    else if (k.tur === 'txt') { const par = KB.metinBol(KB.metinCoz(buf)); R.kit = { tur: 'txt', bolumler: par.map(p => ({ ad: p.ad, metin: p.metin, boyut: Math.max(200, p.metin.length * 1.2) })), icindekiler: par.map((p, i) => ({ ad: p.ad, b: i, a: '' })), bolumAd: i => par[i]?.ad || '' }; }
    else { const L = await pdfLib(); R.pdf = await L.getDocument({ data: new Uint8Array(buf.slice(0)), isEvalSupported: false }).promise; R.kit = { tur: 'pdf', n: R.pdf.numPages, bolumler: Array.from({ length: R.pdf.numPages }, () => ({ boyut: 1 })), icindekiler: [], bolumAd: i => `Sayfa ${i + 1}` }; }
  } catch (e) { return toast('Kitap açılamadı: ' + esc(e.message || 'bozuk dosya')); }
  R.k = k; R.metinler = null; R.tts = null; R.ac = true;
  if (k.durum !== 'bitti') { if (k.durum !== 'okuyor') { k.durum = 'okuyor'; if (!k.bas) k.bas = bugunStr(); } }
  k.son = Date.now(); metaKaydet(k);
  okuyucuKur();
  if (k.tur === 'pdf') await pdfKur(hedef); else await bolumAc(Math.min(k.konum.b, R.kit.bolumler.length - 1), hedef || { o: k.konum.o });
  R.etkin = Date.now(); clearTimeout(R.barZ); R.barZ = setTimeout(() => { if (R.ac) barlar(false); }, 2600);
}
function okuyucuKur() {
  const o = rel(); o.hidden = false; document.documentElement.classList.add('kt-okuyor');
  o.className = 't-' + KS.oku.tema + (sayfali() ? ' sayfali' : '');
  o.innerHTML = `<header class="ko-ust ac"><button class="icon-btn" data-action="ko-kapat" aria-label="Kitaplığa dön">${IC.chevL}</button>
      <div class="ko-baslik"><b>${esc(R.k.ad)}</b><span id="koBolum"></span></div>
      <button class="icon-btn" data-action="ko-ara" aria-label="Kitapta ara" title="Ara">${IC.ara3}</button>
      <button class="icon-btn" data-action="ko-ses" aria-label="Sesli oku" title="Sesli oku">${IC.ses}</button>
      <button class="icon-btn" id="koIm" data-action="ko-im" aria-label="Ayraç ekle" title="Ayraç">${IC.im}</button>
      <button class="icon-btn" data-action="ko-icindekiler" aria-label="İçindekiler" title="İçindekiler">${IC.liste}</button>
      <button class="icon-btn" data-action="ko-ayar" aria-label="Okuma ayarları" title="Görünüm">${IC.harf}</button></header>
    <div class="ko-kap" id="koKap" tabindex="-1"></div>
    <div class="ko-tts" id="koTts" hidden></div>
    <footer class="ko-alt ac"><input type="range" id="koKay" min="0" max="1000" step="1" value="0" aria-label="Kitapta konum"><div class="ko-yuzde"><span id="koYuzde">%0</span><span id="koKalan"></span></div></footer>
    <div class="ko-secim" id="koSecim" hidden></div>`;
  R.kap = $('#koKap'); $('#koSecim').addEventListener('mousedown', e => e.preventDefault());
  $('#koKay').oninput = e => atla(+e.target.value / 1000);
  R.kap.addEventListener('scroll', () => { if (!sayfali()) konumGuncelle(); }, { passive: true });
  R.kap.addEventListener('click', kapTik);
  document.addEventListener('selectionchange', secimIzle);
  document.addEventListener('keydown', okTus);
  document.addEventListener('visibilitychange', sureDur);
  R.zaman = setInterval(sureSay, 5000);
  ['pointerdown', 'wheel', 'touchstart'].forEach(a => R.kap.addEventListener(a, () => { R.etkin = Date.now(); }, { passive: true }));
}
function okuyucuKapat() {
  if (!R.ac) return;
  konumKaydet(true); sesDur(); clearInterval(R.zaman);
  document.removeEventListener('selectionchange', secimIzle); document.removeEventListener('keydown', okTus); document.removeEventListener('visibilitychange', sureDur);
  R.url.forEach(u => URL.revokeObjectURL(u)); R.url = []; R.pdf?.destroy?.(); R.pdf = null; R.kit = null; R.ic = null; R.kap = null; R.ac = false; R.pgObs?.disconnect?.();
  const o = rel(); o.hidden = true; o.innerHTML = ''; document.documentElement.classList.remove('kt-okuyor'); closeModal();
  ciz();
}
function sureSay() {
  if (!R.ac || document.hidden) return;
  if (Date.now() - R.etkin > 90000 && !(R.tts && R.tts.calisiyor)) return;
  const b = bugunStr(); KS.gun[b] = (KS.gun[b] || 0) + 5; R.k.sure += 5;
  if (++R.sayac % 6 === 0) { gunKaydet(); }
}
R.sayac = 0;
function sureDur() { if (document.hidden && R.ac) { gunKaydet(); konumKaydet(true); } }

/* ── bölüm gösterme (EPUB/TXT) ── */
async function bolumAc(b, hedef) {
  const kit = R.kit; if (b < 0 || b >= kit.bolumler.length) return;
  sesDur(); R.b = b;
  R.url.forEach(u => URL.revokeObjectURL(u)); R.url = [];
  const kap = R.kap; kap.innerHTML = '';
  const ic = document.createElement('div'); ic.className = 'ko-metin'; ic.setAttribute('lang', (R.k.dil || 'tr').slice(0, 8));
  kap.appendChild(ic); R.ic = ic;
  if (kit.tur === 'epub') {
    try { const r = await KB.epubBolum(kit, b, document); R.url = r.url; ic.appendChild(r.parca); }
    catch (e) { ic.textContent = 'Bu bölüm okunamadı: ' + (e.message || ''); }
  } else ic.appendChild(KB.metinParcasi(kit.bolumler[b], document));
  if (!ic.textContent.trim() && !ic.querySelector('img')) { const p = document.createElement('p'); p.className = 'ko-bos'; p.textContent = '(Bu bölümde gösterilecek içerik yok)'; ic.appendChild(p); }
  ic.addEventListener('click', icTik);
  if (!sayfali()) {
    const nav = document.createElement('div'); nav.className = 'ko-nav';
    nav.innerHTML = `${b > 0 ? '<button class="btn" data-action="ko-onceki">‹ Önceki bölüm</button>' : '<span></span>'}${b < kit.bolumler.length - 1 ? '<button class="btn primary" data-action="ko-sonraki">Sonraki bölüm ›</button>' : '<button class="btn primary" data-action="ko-bitir">Kitabı bitirdim</button>'}`;
    kap.appendChild(nav);
  }
  vurguUygula(); biçimUygula();
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  konumaGit(hedef || { o: 0 });
  konumGuncelle(true);
  $('#koBolum').textContent = kit.bolumAd(b) || '';
}
function sayfaBilgi() {
  const ic = R.ic, adim = ic.clientWidth + R.bosluk;
  R.adim = Math.max(1, adim); R.sayfaToplam = Math.max(1, Math.round((ic.scrollWidth + R.bosluk) / R.adim)); R.sayfaNo = Math.min(R.sayfaToplam - 1, Math.round(ic.scrollLeft / R.adim));
}
function biçimUygula() {
  const o = rel(), s = KS.oku;
  o.className = 't-' + s.tema + (sayfali() ? ' sayfali' : '') + (R.k.tur === 'pdf' ? ' pdf' : '');
  o.style.setProperty('--ko-boyut', s.boyut + 'px'); o.style.setProperty('--ko-font', FONTLAR[s.font] || FONTLAR.serif);
  o.style.setProperty('--ko-satir', s.satir); o.style.setProperty('--ko-kenar', s.kenar + 'px'); o.style.setProperty('--ko-hiza', s.iki ? 'justify' : 'left');
  R.bosluk = Math.max(24, s.kenar * 2);
  o.style.setProperty('--ko-bosluk', R.bosluk + 'px');
  if (sayfali() && R.kap) { const w = R.kap.clientWidth - s.kenar * 2; o.style.setProperty('--ko-kw', (w >= 860 ? Math.floor((w - R.bosluk) / 2) : w) + 'px'); }
}
/* aranan konuma git: {o:0..1} | {a:'bolum-ici-baglanti'} | {ofs:karakter} | {son:true} */
function konumaGit(h) {
  const kap = R.kap, ic = R.ic; if (!ic) return;
  const dikey = !sayfali();
  const hedefY = el => { const r = el.getBoundingClientRect(), kr = (dikey ? kap : ic).getBoundingClientRect(); return dikey ? kap.scrollTop + r.top - kr.top - 70 : ic.scrollLeft + r.left - kr.left; };
  const git = v => { if (dikey) kap.scrollTop = Math.max(0, v); else { sayfaBilgi(); ic.scrollLeft = Math.max(0, Math.min(R.sayfaToplam - 1, Math.floor((v + 2) / R.adim))) * R.adim; } };
  if (h.a) { const el = ic.querySelector(`[data-a="${CSS.escape(h.a)}"]`); if (el) return git(hedefY(el)); }
  if (h.ofs != null) {
    const hm = KB.metinHaritasi(ic), x = hm.h.find(n => n.son > h.ofs) || hm.h[hm.h.length - 1];
    if (x) { const r = document.createRange(); r.setStart(x.d, Math.min(x.d.nodeValue.length, Math.max(0, h.ofs - x.bas))); r.collapse(true); const rr = r.getBoundingClientRect(), kr = (dikey ? kap : ic).getBoundingClientRect(); return git(dikey ? kap.scrollTop + rr.top - kr.top - 90 : ic.scrollLeft + rr.left - kr.left); }
  }
  if (h.son) { if (dikey) kap.scrollTop = kap.scrollHeight; else { sayfaBilgi(); ic.scrollLeft = (R.sayfaToplam - 1) * R.adim; } return; }
  const o = sayi(h.o, 0, 1, 0);
  if (dikey) kap.scrollTop = o * Math.max(0, kap.scrollHeight - kap.clientHeight);
  else { sayfaBilgi(); ic.scrollLeft = Math.round(o * Math.max(0, R.sayfaToplam - 1)) * R.adim; }
}
function bolumIci() {   // 0..1
  if (R.k.tur === 'pdf') return 0;
  if (!sayfali()) { const m = R.kap.scrollHeight - R.kap.clientHeight; return m > 4 ? sayi(R.kap.scrollTop / m, 0, 1, 0) : 0; }
  sayfaBilgi(); return R.sayfaToplam > 1 ? R.sayfaNo / (R.sayfaToplam - 1) : 0;
}
function genelOran() {
  const bl = R.kit.bolumler;
  if (R.k.tur === 'pdf') return R.sayfaIdx != null ? (R.sayfaIdx + (R.pdfIc || 0)) / bl.length : 0;
  const top = bl.reduce((a, x) => a + x.boyut, 0); let once = 0; for (let i = 0; i < R.b; i++) once += bl[i].boyut;
  return sayi((once + bolumIci() * bl[R.b].boyut) / top, 0, 1, 0);
}
function konumGuncelle(zorla) {
  if (!R.ac) return;
  const o = genelOran(), yuz = Math.round(o * 100);
  $('#koYuzde').textContent = '%' + yuz; $('#koKay').value = Math.round(o * 1000);
  if (R.k.tur === 'pdf') $('#koKalan').textContent = `${(R.sayfaIdx || 0) + 1} / ${R.kit.n}`;
  else if (sayfali()) { sayfaBilgi(); $('#koKalan').textContent = `Sayfa ${R.sayfaNo + 1} / ${R.sayfaToplam}`; }
  else $('#koKalan').textContent = `Bölüm ${R.b + 1} / ${R.kit.bolumler.length}`;
  const im = $('#koIm'); if (im) { const var_ = R.k.imler.some(x => x.b === R.b && Math.abs(x.o - (R.k.tur === 'pdf' ? 0 : bolumIci())) < (R.k.tur === 'pdf' ? .01 : .04)) && (R.k.tur !== 'pdf' || R.k.imler.some(x => x.b === R.sayfaIdx)); im.innerHTML = var_ ? IC.imDolu : IC.im; im.classList.toggle('on', var_); }
  R.k.ilerleme = o; R.k.konum = R.k.tur === 'pdf' ? { b: R.sayfaIdx || 0, o: 0 } : { b: R.b, o: bolumIci() };
  if (R.k.tur !== 'pdf') $('#koBolum').textContent = R.kit.bolumAd(R.b) || '';
  clearTimeout(R.kaydetZ); R.kaydetZ = setTimeout(() => konumKaydet(), zorla ? 300 : 900);
}
function konumKaydet(simdi) { if (!R.k) return; clearTimeout(R.kaydetZ); R.k.son = Date.now(); metaKaydet(R.k); if (simdi) gunKaydet(); }
function atla(oran) {
  const bl = R.kit.bolumler;
  if (R.k.tur === 'pdf') { const i = Math.min(bl.length - 1, Math.floor(oran * bl.length)); return pdfGit(i); }
  const top = bl.reduce((a, x) => a + x.boyut, 0); let hedef = oran * top, b = 0;
  while (b < bl.length - 1 && hedef > bl[b].boyut) { hedef -= bl[b].boyut; b++; }
  const o = sayi(hedef / bl[b].boyut, 0, 1, 0);
  if (b === R.b) { konumaGit({ o }); konumGuncelle(); } else bolumAc(b, { o });
}

/* ── gezinme: sayfa çevirme, tuşlar, dokunma ── */
function sonrakiSayfa(yon) {
  if (R.k.tur === 'pdf') { R.kap.scrollBy({ top: yon * R.kap.clientHeight * .9, behavior: 'smooth' }); return; }
  if (!sayfali()) {
    const kap = R.kap, m = kap.scrollHeight - kap.clientHeight;
    if (yon > 0 && kap.scrollTop >= m - 4) return R.b < R.kit.bolumler.length - 1 ? bolumAc(R.b + 1, { o: 0 }) : null;
    if (yon < 0 && kap.scrollTop <= 4) return R.b > 0 ? bolumAc(R.b - 1, { son: true }) : null;
    kap.scrollBy({ top: yon * kap.clientHeight * .88, behavior: 'smooth' }); return;
  }
  sayfaBilgi();
  if (yon > 0) { if (R.sayfaNo >= R.sayfaToplam - 1) { if (R.b < R.kit.bolumler.length - 1) bolumAc(R.b + 1, { o: 0 }); else toast('Kitabın sonu'); return; } R.ic.scrollLeft = (R.sayfaNo + 1) * R.adim; }
  else { if (R.sayfaNo <= 0) { if (R.b > 0) bolumAc(R.b - 1, { son: true }); return; } R.ic.scrollLeft = (R.sayfaNo - 1) * R.adim; }
  konumGuncelle();
}
function barlar(ac) { const o = rel(); o.querySelectorAll('.ko-ust, .ko-alt').forEach(e => e.classList.toggle('ac', ac)); }
const barAcik = () => rel().querySelector('.ko-ust').classList.contains('ac');
function kapTik(e) {
  R.etkin = Date.now();
  if (e.target.closest('button, a, .k-v, input')) return;
  const s = getSelection(); if (s && !s.isCollapsed) return;
  if ($('#koSecim') && !$('#koSecim').hidden) { secimKapat(); return; }
  const w = R.kap.clientWidth, x = e.clientX - R.kap.getBoundingClientRect().left;
  if (sayfali() && x < w * .22) return sonrakiSayfa(-1);
  if (sayfali() && x > w * .78) return sonrakiSayfa(1);
  barlar(!barAcik());
}
function okTus(e) {
  if (!R.ac || $('#modal').innerHTML || /input|textarea|select/i.test(e.target.tagName)) return;
  R.etkin = Date.now();
  const k = e.key;
  if (k === 'Escape') { if (!$('#koSecim').hidden) secimKapat(); else okuyucuKapat(); }
  else if (k === 'ArrowRight' || k === 'PageDown' || (k === ' ' && !e.shiftKey)) { e.preventDefault(); sonrakiSayfa(1); }
  else if (k === 'ArrowLeft' || k === 'PageUp' || (k === ' ' && e.shiftKey)) { e.preventDefault(); sonrakiSayfa(-1); }
  else if (k === 'ArrowDown' && sayfali()) { e.preventDefault(); sonrakiSayfa(1); }
  else if (k === 'ArrowUp' && sayfali()) { e.preventDefault(); sonrakiSayfa(-1); }
  else if (k === '+' || k === '=') { KS.oku.boyut = Math.min(40, KS.oku.boyut + 1); okuKaydet(); yenidenDuzen(); }
  else if (k === '-') { KS.oku.boyut = Math.max(12, KS.oku.boyut - 1); okuKaydet(); yenidenDuzen(); }
}
function yenidenDuzen() {   // yazı ölçüsü/kenar vs. değişince aynı yerde kal
  if (R.k.tur === 'pdf') { pdfYeniden(); return; }
  const o = bolumIci(); biçimUygula(); requestAnimationFrame(() => { konumaGit({ o }); konumGuncelle(); });
}
let yenidenZ = 0;
window.addEventListener('resize', () => { if (!R.ac) return; clearTimeout(yenidenZ); yenidenZ = setTimeout(() => { if (R.k.tur === 'pdf') pdfYeniden(); else yenidenDuzen(); }, 200); });

/* ── bölüm içi bağlantılar ── */
function icTik(e) {
  const a = e.target.closest('a'); if (!a) return;
  e.preventDefault();
  const ic = a.getAttribute('data-ic'), dis = a.getAttribute('data-dis');
  if (ic != null) {
    if (ic.startsWith('#')) { const m = a.classList.contains('k-dipnot'); const hedef = R.ic.querySelector(`[data-a="${CSS.escape(ic.slice(1))}"]`); if (hedef) { if (m) { dipnotGoster(hedef); return; } konumaGit({ a: ic.slice(1) }); konumGuncelle(); } return; }
    const [yol, f] = ic.split('#'), b = R.kit.idx.get(yol); if (b != null) bolumAc(b, f ? { a: f } : { o: 0 });
  } else if (dis) {
    $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal" aria-label="Kapat">${IC.close}</button><h3>Dış bağlantı</h3></header><div class="kt-form"><p>Bu bağlantı kitabın dışına, internete çıkar:</p><p class="kt-url">${esc(dis)}</p><p class="muted sm">Kitaplık çevrimdışı çalışır; bağlantı tarayıcında açılır.</p><div class="kt-btns"><button class="btn primary" data-action="ko-dis-ac" data-u="${esc(dis)}">Aç</button><button class="btn" data-action="close-modal">Vazgeç</button></div></div></div></div>`;
  }
}
function dipnotGoster(el) {
  const t = (el.closest('li, aside, p, div') || el).textContent.replace(/\s+/g, ' ').trim();
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal" aria-label="Kapat">${IC.close}</button><h3>Dipnot</h3></header><div class="kt-form"><p>${esc(kisalt(t, 1500))}</p></div></div></div>`;
}

/* ═════════ Vurgu ve notlar ═════════ */
function vurguUygula() {
  const ic = R.ic; if (!ic || R.k.tur === 'pdf') return;
  KB.aralikDuzenle(ic, 'mark.k-v');
  const tam = KB.metinHaritasi(ic).h.map(x => x.d.nodeValue).join('');
  for (const v of R.k.vurgu.filter(x => x.b === R.b).sort((a, c) => c.s - a.s)) {
    if (tam.slice(v.s, v.e).replace(/\s+/g, ' ').trim() !== v.t.replace(/\s+/g, ' ').trim().slice(0, 2000)) continue;   // metin değişmişse atla
    KB.aralikSar(ic, v.s, v.e, { class: 'k-v r' + v.renk + (v.not ? ' notlu' : ''), 'data-v': v.id });
  }
}
function secimIzle() {
  if (!R.ac) return;
  clearTimeout(R.secZ);
  R.secZ = setTimeout(() => {
    const s = getSelection(), pop = $('#koSecim'); if (!pop) return;
    if (!s || s.isCollapsed || !R.ic || !R.ic.contains(s.getRangeAt(0).commonAncestorContainer)) { if (!pop.dataset.kalici) pop.hidden = true; return; }
    const r = s.getRangeAt(0), rect = r.getBoundingClientRect(); if (!rect.width && !rect.height) return;
    const h = KB.metinHaritasi(R.ic), bas = nokta(h, r.startContainer, r.startOffset), son = nokta(h, r.endContainer, r.endOffset);
    if (bas < 0 || son <= bas) return;
    const tam = h.h.map(x => x.d.nodeValue).join(''); let a = bas, b = son;
    while (a < b && /\s/.test(tam[a])) a++; while (b > a && /\s/.test(tam[b - 1])) b--;
    if (b - a < 1) return;
    R.secim = { s: a, e: Math.min(b, a + 3000), t: tam.slice(a, Math.min(b, a + 3000)) };
    popAc(pop, `${VURGU_RENK.map((c, i) => `<button class="ko-renk" style="--r:${c}" data-action="ko-vurgula" data-r="${i}" aria-label="Vurgula ${i + 1}"></button>`).join('')}<button data-action="ko-not-yeni" title="Not ekle">${IC.kalem}<span>Not</span></button><button data-action="ko-kopya" title="Kopyala">${IC.kopya}</button><button data-action="ko-oku-sec" title="Buradan oku">${IC.ses}</button>`, rect);
  }, 180);
}
function nokta(h, n, o) {
  if (n.nodeType === 3) return KB.konumBul(h, n, o);
  if (o < n.childNodes.length) { const c = n.childNodes[o], t = c.nodeType === 3 ? c : document.createTreeWalker(c, NodeFilter.SHOW_TEXT).nextNode(); if (t) return KB.konumBul(h, t, 0); }
  const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT); let son = null, t; while ((t = w.nextNode())) son = t;
  return son ? KB.konumBul(h, son, son.nodeValue.length) : -1;
}
function popAc(pop, html, rect) {
  pop.innerHTML = html; pop.hidden = false;
  const W = innerWidth, pw = pop.offsetWidth || 260, ph = pop.offsetHeight || 46;
  let x = Math.min(W - pw - 8, Math.max(8, rect.left + rect.width / 2 - pw / 2)), y = rect.top - ph - 10; if (y < 70) y = rect.bottom + 14;
  pop.style.left = x + 'px'; pop.style.top = Math.min(innerHeight - ph - 8, y) + 'px';
}
function secimKapat() { const p = $('#koSecim'); if (p) { p.hidden = true; delete p.dataset.kalici; } getSelection()?.removeAllRanges(); R.secim = null; R.duzenle = null; }
function vurguEkle(renk, not) {
  const s = R.secim; if (!s) return;
  const v = { id: uid(), b: R.b, s: s.s, e: s.e, t: s.t, renk, not: not || '', z: Date.now(), ad: kisalt(R.kit.bolumAd(R.b), 100) };
  R.k.vurgu.push(v); metaKaydet(R.k); secimKapat(); vurguUygula(); toast(not ? 'Not kaydedildi' : 'Vurgulandı');
}
function vurguTik(v) {
  const x = R.k.vurgu.find(i => i.id === v); if (!x) return;
  R.duzenle = x; const el = R.ic.querySelector(`[data-v="${CSS.escape(v)}"]`), pop = $('#koSecim');
  pop.dataset.kalici = '1';
  popAc(pop, `${VURGU_RENK.map((c, i) => `<button class="ko-renk ${x.renk === i ? 'on' : ''}" style="--r:${c}" data-action="ko-renk-degis" data-r="${i}" aria-label="Renk"></button>`).join('')}<button data-action="ko-not-duzenle" title="Not">${IC.kalem}<span>${x.not ? 'Notu aç' : 'Not'}</span></button><button data-action="ko-kopya2" title="Kopyala">${IC.kopya}</button><button data-action="ko-vurgu-sil" title="Vurguyu kaldır">${IC.cop}</button>`, el.getBoundingClientRect());
}
R.kap_ = null;
document.addEventListener('click', e => { const m = e.target.closest?.('mark.k-v'); if (m && R.ac && R.ic?.contains(m)) { e.stopPropagation(); vurguTik(m.dataset.v); } }, true);
function notPenceresi(baslik, metin, kaydet) {
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask kt-sheet"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal" aria-label="Kapat">${IC.close}</button><h3>${esc(baslik)}</h3></header><div class="kt-form">
    <blockquote class="kt-aq" style="--r:${VURGU_RENK[R.duzenle ? R.duzenle.renk : 0]}"><p>${esc(kisalt((R.duzenle || R.secim).t, 400))}</p></blockquote>
    <label>Notun<textarea id="ktNot" rows="5" maxlength="4000" placeholder="Bu yer hakkında düşüncelerin…">${esc(metin)}</textarea></label>
    <div class="kt-btns"><button class="btn primary" id="ktNotK">Kaydet</button></div></div></div></div>`;
  $('#ktNotK').onclick = () => { const t = $('#ktNot').value.trim(); closeModal(); kaydet(t); };
  setTimeout(() => $('#ktNot')?.focus(), 80);
}

/* ═════════ Ayraç, içindekiler, vurgular ═════════ */
function imToggle() {
  const k = R.k, pdf = k.tur === 'pdf', o = pdf ? 0 : bolumIci(), b = pdf ? R.sayfaIdx : R.b;
  const var_ = k.imler.find(x => x.b === b && (pdf || Math.abs(x.o - o) < .04));
  if (var_) { k.imler = k.imler.filter(x => x !== var_); toast('Ayraç kaldırıldı'); }
  else {
    let ozet = ''; if (!pdf) { const bk = R.kap.getBoundingClientRect(); const el = document.elementFromPoint(bk.left + bk.width / 2, bk.top + 110); ozet = kisalt((el?.closest?.('p, li, h1, h2, h3, blockquote') || el)?.textContent?.replace(/\s+/g, ' ').trim(), 120); }
    k.imler.push({ id: uid(), b, o, ad: kisalt(R.kit.bolumAd(b), 100), z: Date.now(), ozet }); toast('Ayraç eklendi');
  }
  metaKaydet(k); konumGuncelle();
}
function icindekilerAc(sek) {
  sek = sek || 'ic';
  const k = R.k, kit = R.kit;
  const tabs = [['ic', 'İçindekiler'], ['im', `Ayraçlar${k.imler.length ? ' ' + k.imler.length : ''}`], ['vu', `Vurgular${k.vurgu.length ? ' ' + k.vurgu.length : ''}`]];
  let ic = '';
  if (sek === 'ic') ic = kit.icindekiler.length ? kit.icindekiler.map(x => `<button class="ko-satir" style="padding-left:${14 + x.der * 16}px" data-action="ko-git" data-b="${x.b}" data-a="${esc(x.a || '')}"><span>${esc(x.ad)}</span>${x.b === R.b && k.tur !== 'pdf' ? '<i>●</i>' : ''}</button>`).join('')
    : (k.tur === 'pdf' ? `<p class="muted kt-bos">Bu PDF'de içindekiler yok. Alttaki çubukla sayfalar arasında gezebilirsin.</p>` : kit.bolumler.map((x, i) => `<button class="ko-satir" data-action="ko-git" data-b="${i}"><span>${esc(kit.bolumAd(i) || 'Bölüm ' + (i + 1))}</span></button>`).join(''));
  else if (sek === 'im') ic = k.imler.length ? k.imler.slice().sort((a, c) => a.b - c.b || a.o - c.o).map(x => `<div class="ko-satir2"><button data-action="ko-im-git" data-id="${x.id}"><b>${esc(k.tur === 'pdf' ? 'Sayfa ' + (x.b + 1) : x.ad || 'Bölüm ' + (x.b + 1))}${k.tur !== 'pdf' ? ` <small>%${Math.round(x.o * 100)}</small>` : ''}</b><span>${esc(x.ozet)}</span></button><button class="icon-btn" data-action="ko-im-sil" data-id="${x.id}" aria-label="Sil">${IC.cop}</button></div>`).join('') : '<p class="muted kt-bos">Henüz ayraç yok. Üstteki ayraç simgesine dokunarak bulunduğun yere ayraç koy.</p>';
  else ic = k.vurgu.length ? k.vurgu.slice().sort((a, c) => a.b - c.b || a.s - c.s).map(x => `<div class="ko-satir2"><button data-action="ko-vurgu-git" data-id="${x.id}"><span class="ko-nokta" style="--r:${VURGU_RENK[x.renk]}"></span><b>${esc(kisalt(x.t, 140))}</b>${x.not ? `<span class="ko-vn">${esc(kisalt(x.not, 120))}</span>` : ''}<small>${esc(x.ad)}</small></button></div>`).join('') : '<p class="muted kt-bos">Okurken bir yeri seçip vurgulayabilirsin.</p>';
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask kt-sheet kt-liste"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal" aria-label="Kapat">${IC.close}</button><h3>${esc(kisalt(k.ad, 40))}</h3></header>
    <nav class="seg kt-sek2">${tabs.map(([a, n]) => `<button class="${sek === a ? 'on' : ''}" data-action="ko-sek" data-s="${a}">${n}</button>`).join('')}</nav><div class="ko-liste">${ic}</div></div></div>`;
  const on = $('#modal .ko-satir i'); if (on) on.closest('button').scrollIntoView({ block: 'center' });
}

/* ═════════ Okuma görünümü ayarları ═════════ */
function okumaAyarAc() {
  const s = KS.oku, pdf = R.k.tur === 'pdf';
  $('#modal').innerHTML = `<div class="modal-bg ko-mbg"><div class="sheet nask kt-sheet ko-ayar"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal" aria-label="Kapat">${IC.close}</button><h3>Görünüm</h3></header><div class="kt-form">
    <div class="ko-temalar">${TEMALAR.map(([k, n]) => `<button class="ko-tema t-${k} ${s.tema === k ? 'on' : ''}" data-action="ko-tema" data-t="${k}"><b>Aa</b><span>${n}</span></button>`).join('')}</div>
    ${pdf ? '<p class="muted sm">PDF sayfaları orijinal haliyle gösterilir. Koyu temalarda renkler çevrilir; yakınlaştırmak için A+ kullan.</p>' : ''}
    <div class="ko-sl"><span>Yazı boyutu</span><button class="btn sm" data-action="ko-boyut" data-d="-1">A−</button><b id="koBy">${s.boyut}</b><button class="btn sm" data-action="ko-boyut" data-d="1">A+</button></div>
    ${pdf ? '' : `<div class="ko-sl"><span>Yazı tipi</span><select id="koFont">${[['serif', 'Serif (Georgia)'], ['sans', 'Sans (sistem)'], ['okuma', 'Okunaklı']].map(([k, n]) => `<option value="${k}" ${s.font === k ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
    <div class="ko-sl"><span>Satır aralığı</span><input type="range" id="koSatir" min="1.3" max="2.2" step="0.1" value="${s.satir}"></div>
    <div class="ko-sl"><span>Kenar boşluğu</span><input type="range" id="koKenar" min="8" max="72" step="4" value="${s.kenar}"></div>
    <div class="ko-sl"><span>İki yana yasla</span><label class="tk-anahtar"><input type="checkbox" id="koIki" ${s.iki ? 'checked' : ''}><i></i></label></div>
    <div class="ko-sl"><span>Sayfa düzeni</span><div class="seg">${[['kaydir', 'Kaydır'], ['sayfa', 'Sayfa']].map(([k, n]) => `<button class="${s.mod === k ? 'on' : ''}" data-action="ko-mod" data-m="${k}">${n}</button>`).join('')}</div></div>`}
  </div></div></div>`;
  const al = (id, f) => { const e = $('#' + id); if (e) e.oninput = e.onchange = () => { f(e); okuKaydet(); yenidenDuzen(); }; };
  al('koFont', e => { s.font = e.value; }); al('koSatir', e => { s.satir = +e.value; }); al('koKenar', e => { s.kenar = +e.value; }); al('koIki', e => { s.iki = e.checked; });
}

/* ═════════ Kitapta arama ═════════ */
async function metinleriHazirla() {
  if (R.metinler) return R.metinler;
  const kit = R.kit, m = [];
  if (kit.tur === 'txt') kit.bolumler.forEach(b => m.push(b.metin));
  else if (kit.tur === 'epub') {
    for (let i = 0; i < kit.bolumler.length; i++) {
      try { const s = await kit.zip.metin(kit.bolumler[i].yol); let d = new DOMParser().parseFromString(s, 'application/xhtml+xml'); if (d.querySelector('parsererror')) d = new DOMParser().parseFromString(s, 'text/html'); d.querySelectorAll('script,style,head').forEach(x => x.remove()); m.push((d.body || d.documentElement).textContent); } catch { m.push(''); }
    }
  } else {
    for (let i = 1; i <= kit.n; i++) { try { const p = await R.pdf.getPage(i), t = await p.getTextContent(); m.push(KB.pdfSatirlari(t.items).map(x => x.s).join(' ')); } catch { m.push(''); } }
  }
  return (R.metinler = m);
}
function aramaAc() {
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask kt-sheet kt-liste"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal" aria-label="Kapat">${IC.close}</button><h3>Kitapta ara</h3></header>
    <div class="kt-form"><input id="koAra" type="search" placeholder="Aranacak kelime ya da cümle" maxlength="100" autocomplete="off"></div><div class="ko-liste" id="koSonuc"><p class="muted kt-bos">En az 2 harf yaz.</p></div></div></div>`;
  const inp = $('#koAra'); let z = 0;
  inp.oninput = () => { clearTimeout(z); z = setTimeout(() => aramaYap(inp.value.trim()), 250); };
  setTimeout(() => inp.focus(), 80);
}
async function aramaYap(q) {
  const kutu = $('#koSonuc'); if (!kutu) return;
  if (q.length < 2) { kutu.innerHTML = '<p class="muted kt-bos">En az 2 harf yaz.</p>'; return; }
  kutu.innerHTML = '<p class="muted kt-bos">Aranıyor…</p>';
  const ml = await metinleriHazirla(), tr = s => s.toLocaleLowerCase('tr'), qq = tr(q), son = [];
  outer: for (let b = 0; b < ml.length; b++) {
    const t = ml[b], tl = tr(t); let i = 0;
    while ((i = tl.indexOf(qq, i)) >= 0) {
      son.push({ b, i, a: t.slice(Math.max(0, i - 40), i).replace(/\s+/g, ' '), m: t.slice(i, i + q.length), z: t.slice(i + q.length, i + q.length + 60).replace(/\s+/g, ' ') });
      i += qq.length; if (son.length >= 200) break outer;
    }
  }
  if (!$('#koSonuc')) return;
  $('#koSonuc').innerHTML = son.length ? son.map((x, n) => `<button class="ko-satir ko-bul" data-action="ko-bul-git" data-n="${n}"><span>…${esc(x.a)}<mark>${esc(x.m)}</mark>${esc(x.z)}…</span><small>${esc(R.kit.bolumAd(x.b) || 'Bölüm ' + (x.b + 1))}</small></button>`).join('') + (son.length >= 200 ? '<p class="muted sm kt-bos">İlk 200 sonuç gösteriliyor.</p>' : '') : '<p class="muted kt-bos">Sonuç bulunamadı.</p>';
  R.bulunan = son;
}

/* ═════════ Sesli okuma ═════════ */
const sesler = () => (window.speechSynthesis ? speechSynthesis.getVoices() : []);
function sesPaneli() {
  if (!window.speechSynthesis) return toast('Bu cihazda sesli okuma yok');
  const dil = (R.k.dil || 'tr').slice(0, 2).toLowerCase(), tum = sesler();
  const uygun = tum.filter(v => v.lang.slice(0, 2).toLowerCase() === dil), liste = uygun.length ? uygun : tum;
  const s = KS.oku;
  $('#modal').innerHTML = `<div class="modal-bg ko-mbg"><div class="sheet nask kt-sheet"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal" aria-label="Kapat">${IC.close}</button><h3>Sesli oku</h3></header><div class="kt-form">
    ${liste.length ? '' : '<p class="kt-uyari">Bu cihazda ses bulunamadı. Cihaz ayarlarından bir konuşma sesi yüklemen gerekebilir.</p>'}
    <label>Ses<select id="koSes">${liste.map(v => `<option value="${esc(v.name)}" ${s.sesAd === v.name ? 'selected' : ''}>${esc(v.name)} (${esc(v.lang)})${v.localService ? '' : ' · çevrimiçi'}</option>`).join('')}</select></label>
    <p class="muted sm" id="koSesNot"></p>
    <label>Hız <b id="koHizY">${s.ses}×</b><input type="range" id="koHiz" min="0.6" max="2" step="0.1" value="${s.ses}"></label>
    <div class="kt-btns"><button class="btn primary" data-action="ko-ses-basla">${IC.oynat}Okumaya başla</button></div></div></div></div>`;
  const sel = $('#koSes'), uyar = () => { const v = tum.find(x => x.name === sel.value); $('#koSesNot').textContent = v && !v.localService ? 'Bu ses çevrimiçi çalışır; metin, sesi üreten servise gönderilebilir. Gizlilik için “çevrimiçi” yazmayan bir ses seç.' : 'Bu ses cihazında çalışır, metin dışarı gönderilmez.'; };
  sel.onchange = uyar; uyar();
  $('#koHiz').oninput = e => { $('#koHizY').textContent = e.target.value + '×'; };
}
async function sesBasla(kaynak) {
  const s = KS.oku, tum = sesler(); s.sesAd = $('#koSes')?.value || s.sesAd; s.ses = +($('#koHiz')?.value || s.ses); okuKaydet(); closeModal(); barlar(false);
  R.tts = { calisiyor: true, i: 0, liste: [], ses: tum.find(v => v.name === s.sesAd) || null };
  await sesListe(kaynak); sesPaneliGoster(); sesSoyle();
}
async function sesListe(kaynak) {
  const t = R.tts;
  if (R.k.tur === 'pdf') {
    const p = await R.pdf.getPage((R.sayfaIdx || 0) + 1), ic = await p.getTextContent(); t.sayfa = R.sayfaIdx || 0;
    t.liste = KB.pdfParagraflar(KB.pdfSatirlari(ic.items)).map(x => ({ metin: x }));
  } else {
    const ogeler = [...R.ic.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6, blockquote, dd, dt, figcaption, td')].filter(e => e.textContent.trim() && !e.querySelector('p, li, blockquote, td'));
    let bas = 0;
    if (kaynak === 'secim' && R.secimOku) { bas = Math.max(0, ogeler.findIndex(e => e.contains(R.secimOku.startContainer) || e.contains(R.secimOku.startContainer.parentNode))); }
    else { const kr = R.kap.getBoundingClientRect(); const i = ogeler.findIndex(e => { const r = e.getBoundingClientRect(); return sayfali() ? r.left >= kr.left - 2 && r.right > kr.left && r.right <= kr.right + 200 && r.bottom > kr.top : r.bottom > kr.top + 60; }); bas = i < 0 ? 0 : i; }
    t.liste = ogeler.slice(bas).map(e => ({ el: e, metin: e.textContent.replace(/\s+/g, ' ').trim() }));
  }
}
function sesSoyle() {
  const t = R.tts; if (!t || !t.calisiyor) return;
  if (t.i >= t.liste.length) { return sesSonraki(); }
  const o = t.liste[t.i]; R.kap.querySelectorAll('.ko-oku').forEach(e => e.classList.remove('ko-oku'));
  if (o.el) { o.el.classList.add('ko-oku'); sesGorunur(o.el); }
  const parcalar = o.metin.match(/[^.!?…]+[.!?…]*\s*/g) || [o.metin], parca = []; let cur = '';
  for (const p of parcalar) { if ((cur + p).length > 220 && cur) { parca.push(cur); cur = p; } else cur += p; } if (cur.trim()) parca.push(cur);
  let k = 0; const sonraki = () => {
    if (!R.tts || R.tts !== t || !t.calisiyor) return;
    if (k >= parca.length) { t.i++; return sesSoyle(); }
    const u = new SpeechSynthesisUtterance(parca[k++].trim()); if (t.ses) { u.voice = t.ses; u.lang = t.ses.lang; } else u.lang = R.k.dil || 'tr-TR';
    u.rate = KS.oku.ses; u.onend = () => { if (R.tts === t && !t.duraklat) sonraki(); }; u.onerror = ev => { if (ev.error !== 'canceled' && ev.error !== 'interrupted') { toast('Sesli okuma durdu'); sesDur(); } };
    t.u = u; speechSynthesis.speak(u);
  };
  speechSynthesis.cancel(); sonraki();
}
function sesGorunur(el) {
  const r = el.getBoundingClientRect(), kr = R.kap.getBoundingClientRect();
  if (sayfali()) { if (r.left > kr.right - 5 || r.right < kr.left + 5) { sayfaBilgi(); const sol = R.ic.scrollLeft + r.left - R.ic.getBoundingClientRect().left; R.ic.scrollLeft = Math.floor((sol + 2) / R.adim) * R.adim; konumGuncelle(); } }
  else if (r.bottom > kr.bottom - 80 || r.top < kr.top + 40) { R.kap.scrollTo({ top: R.kap.scrollTop + r.top - kr.top - 120, behavior: 'smooth' }); }
}
async function sesSonraki() {
  const t = R.tts; if (!t) return;
  if (R.k.tur === 'pdf') { if ((t.sayfa + 1) >= R.kit.n) return sesDur(); await pdfGit(t.sayfa + 1); }
  else { if (R.b >= R.kit.bolumler.length - 1) { sesDur(); return toast('Kitabın sonu'); } await bolumAc(R.b + 1, { o: 0 }); R.tts = t; t.calisiyor = true; }
  t.i = 0; await sesListe('basit'); if (R.tts === t) sesSoyle();
}
function sesPaneliGoster() {
  const p = $('#koTts'); p.hidden = false; const t = R.tts;
  p.innerHTML = `<button class="icon-btn" data-action="ko-ses-dur" aria-label="${t.duraklat ? 'Sürdür' : 'Duraklat'}">${t.duraklat ? IC.oynat : IC.durdur}</button><button class="icon-btn" data-action="ko-ses-geri" aria-label="Önceki paragraf">${IC.chevL}</button><button class="icon-btn" data-action="ko-ses-ileri" aria-label="Sonraki paragraf">${IC.chevR}</button><span>Sesli okuyor…</span><button class="icon-btn" data-action="ko-ses-bitir" aria-label="Durdur">${IC.dur}</button>`;
}
function sesDur() {
  if (window.speechSynthesis) speechSynthesis.cancel();
  if (R.tts) R.tts.calisiyor = false; R.tts = null;
  const p = $('#koTts'); if (p) { p.hidden = true; p.innerHTML = ''; }
  R.kap?.querySelectorAll?.('.ko-oku').forEach(e => e.classList.remove('ko-oku'));
}

/* ═════════ PDF ═════════ */
async function pdfKur(hedef) {
  const kap = R.kap, n = R.kit.n;
  kap.innerHTML = '<div class="ko-pdf" id="koPdf"></div>';
  const p1 = await R.pdf.getPage(1), v = p1.getViewport({ scale: 1 });
  R.pdfOran = v.height / v.width; R.pdfZoom = R.pdfZoom || 1; R.pdfCiz = new Map();
  const kut = $('#koPdf'); kut.style.setProperty('--oran', R.pdfOran);
  for (let i = 0; i < n; i++) { const d = document.createElement('div'); d.className = 'ko-pg'; d.dataset.i = i; d.innerHTML = `<canvas></canvas><i>${i + 1}</i>`; kut.appendChild(d); }
  pdfBoyutla();
  R.pgObs = new IntersectionObserver(es => { for (const e of es) if (e.isIntersecting) pdfSayfaCiz(+e.target.dataset.i); }, { root: kap, rootMargin: '120% 0px' });
  kut.querySelectorAll('.ko-pg').forEach(d => R.pgObs.observe(d));
  kap.addEventListener('scroll', pdfKaydir, { passive: true });
  R.sayfaIdx = Math.min(n - 1, R.k.konum.b || 0); biçimUygula();
  const h_ = hedef && hedef.b != null ? hedef.b : R.sayfaIdx; await pdfGit(h_, true);
}
function pdfBoyutla() {
  const kap = R.kap, kut = $('#koPdf'), w = Math.min(kap.clientWidth - 16, 1100) * R.pdfZoom;
  kut.style.setProperty('--gen', Math.max(120, w) + 'px');
  R.pdfBoy = Math.max(120, w) * R.pdfOran + 14;
}
function pdfYeniden() { const i = R.sayfaIdx || 0; R.pdfCiz.clear(); document.querySelectorAll('.ko-pg').forEach(d => { const c = d.querySelector('canvas'); c.width = c.height = 0; d.classList.remove('hazir'); }); pdfBoyutla(); pdfGit(i, true); }
async function pdfSayfaCiz(i) {
  const d = document.querySelector(`.ko-pg[data-i="${i}"]`); if (!d || R.pdfCiz.has(i) || !R.pdf) return;
  R.pdfCiz.set(i, 1);
  try {
    const p = await R.pdf.getPage(i + 1), w = d.clientWidth || 600, v0 = p.getViewport({ scale: 1 }), olcek = w / v0.width * Math.min(2, window.devicePixelRatio || 1), v = p.getViewport({ scale: olcek }), c = d.querySelector('canvas');
    c.width = Math.round(v.width); c.height = Math.round(v.height); c.style.aspectRatio = `${v0.width} / ${v0.height}`; d.style.aspectRatio = `${v0.width} / ${v0.height}`;
    await p.render({ canvasContext: c.getContext('2d'), viewport: v }).promise; d.classList.add('hazir');
    // uzaktaki sayfaları bellekten at
    if (R.pdfCiz.size > 10) for (const [j] of R.pdfCiz) if (Math.abs(j - i) > 5) { const e = document.querySelector(`.ko-pg[data-i="${j}"] canvas`); if (e) { e.width = e.height = 0; } document.querySelector(`.ko-pg[data-i="${j}"]`)?.classList.remove('hazir'); R.pdfCiz.delete(j); }
  } catch { R.pdfCiz.delete(i); }
}
function pdfKaydir() {
  if (!R.ac || R.k.tur !== 'pdf') return;
  const kap = R.kap, ort = kap.getBoundingClientRect().top + kap.clientHeight * .3; let en = R.sayfaIdx || 0;
  const pgs = kap.querySelectorAll('.ko-pg');
  for (let i = Math.max(0, en - 3); i < Math.min(pgs.length, en + 6); i++) { const r = pgs[i].getBoundingClientRect(); if (r.top <= ort && r.bottom > ort) { en = i; R.pdfIc = sayi((ort - r.top) / r.height, 0, 1, 0); break; } }
  R.sayfaIdx = en; konumGuncelle();
}
async function pdfGit(i, ilk) {
  i = Math.max(0, Math.min(R.kit.n - 1, i)); const d = document.querySelector(`.ko-pg[data-i="${i}"]`); if (!d) return;
  R.kap.scrollTop = d.offsetTop - R.kap.offsetTop - 6; R.sayfaIdx = i; R.pdfIc = 0; pdfSayfaCiz(i); konumGuncelle(!!ilk);
}

/* ═════════ Olaylar ═════════ */
Object.assign(ACTIONS, {
  'kt-gor': el => { KS.gor = el.dataset.k; ciz(); },
  'kt-filtre': el => { KS.filtre = el.dataset.k; ciz(); },
  'kt-ekle': () => { closeModal(); $('#ktDosya').click(); },
  'kt-ac': el => kitapAc(el.dataset.id),
  'kt-detay': el => detayAc(el.dataset.id),
  'kt-puan': el => { const k = meta(el.dataset.id); k.puan = k.puan === +el.dataset.p ? 0 : +el.dataset.p; metaKaydet(k); document.querySelectorAll('.kt-y').forEach(b => b.classList.toggle('on', k.puan >= +b.dataset.p)); },
  'kt-dkaydet': el => detayKaydet(el.dataset.id),
  'kt-sil': async el => {
    const k = meta(el.dataset.id); if (!k) return;
    if (!confirm(`“${k.ad}” silinsin mi? Notların ve vurguların da silinir.`)) return;
    await DB.sil('kitap', k.id); await DB.sil('dosya', k.id); KS.kitaplar = KS.kitaplar.filter(x => x !== k); closeModal(); ciz(); toast('Silindi');
  },
  'kt-ayar': ayarAc,
  'kt-tema': el => { store.set('theme', el.dataset.t); applyTheme(el.dataset.t); ayarAc(); },
  'kt-yedek': () => { indirDosya(`Kitaplık yedeği ${bugunStr()}.json`, yedekYap(), 'application/json'); toast('Yedek dosyası hazırlandı'); },
  'kt-yedek-ac': () => $('#kaYedekDosya').click(),
  'kt-hepsini-sil': async () => {
    if (!confirm('Tüm kitaplar, notlar ve okuma günlüğü silinsin mi? Bu işlem geri alınamaz.')) return;
    await DB.temizle('kitap'); await DB.temizle('dosya'); KS.kitaplar = []; KS.gun = {}; gunKaydet(); closeModal(); ciz(); toast('Her şey silindi');
  },
  'kt-md': () => { indirDosya(`Alıntılarım ${bugunStr()}.md`, markdownYap(), 'text/markdown'); toast('Markdown dosyası hazırlandı'); },
  'kt-akopya': async el => { const k = meta(el.dataset.id), v = k.vurgu.find(x => x.id === el.dataset.v); try { await navigator.clipboard.writeText(alintiMetni(k, v)); toast('Kopyalandı'); } catch { toast('Kopyalanamadı'); } },
  'kt-agit': el => { const k = meta(el.dataset.id), v = k.vurgu.find(x => x.id === el.dataset.v); kitapAc(k.id, { b: v.b, ofs: v.s }); },
  /* okuyucu */
  'ko-kapat': okuyucuKapat,
  'ko-onceki': () => bolumAc(R.b - 1, { o: 0 }),
  'ko-sonraki': () => bolumAc(R.b + 1, { o: 0 }),
  'ko-bitir': () => { const k = R.k; durumDegis(k, 'bitti'); metaKaydet(k); toast('Tebrikler! Kitap “Bitti” olarak işaretlendi'); okuyucuKapat(); },
  'ko-im': imToggle,
  'ko-icindekiler': () => icindekilerAc('ic'),
  'ko-sek': el => icindekilerAc(el.dataset.s),
  'ko-git': el => { closeModal(); if (R.k.tur === 'pdf') return; const a = el.dataset.a, b = +el.dataset.b; bolumAc(b, a ? { a } : { o: 0 }); },
  'ko-im-git': el => { const x = R.k.imler.find(i => i.id === el.dataset.id); closeModal(); if (!x) return; if (R.k.tur === 'pdf') pdfGit(x.b); else if (x.b === R.b) { konumaGit({ o: x.o }); konumGuncelle(); } else bolumAc(x.b, { o: x.o }); },
  'ko-im-sil': el => { R.k.imler = R.k.imler.filter(i => i.id !== el.dataset.id); metaKaydet(R.k); icindekilerAc('im'); konumGuncelle(); },
  'ko-vurgu-git': el => { const v = R.k.vurgu.find(i => i.id === el.dataset.id); closeModal(); if (!v) return; if (v.b === R.b) { konumaGit({ ofs: v.s }); konumGuncelle(); } else bolumAc(v.b, { ofs: v.s }); },
  'ko-ayar': okumaAyarAc,
  'ko-tema': el => { KS.oku.tema = el.dataset.t; okuKaydet(); biçimUygula(); document.querySelectorAll('.ko-tema').forEach(b => b.classList.toggle('on', b.dataset.t === KS.oku.tema)); },
  'ko-boyut': el => { if (R.k.tur === 'pdf') { R.pdfZoom = sayi((R.pdfZoom || 1) + (+el.dataset.d) * .15, .6, 3, 1); $('#koBy').textContent = Math.round(R.pdfZoom * 100) + '%'; pdfYeniden(); return; } KS.oku.boyut = sayi(KS.oku.boyut + (+el.dataset.d), 12, 40, 19); okuKaydet(); $('#koBy').textContent = KS.oku.boyut; yenidenDuzen(); },
  'ko-mod': el => { const o = bolumIci(); KS.oku.mod = el.dataset.m; okuKaydet(); document.querySelectorAll('.ko-ayar .seg button').forEach(b => b.classList.toggle('on', b.dataset.m === KS.oku.mod)); const b = R.b; bolumAc(b, { o }); },
  'ko-ara': aramaAc,
  'ko-bul-git': el => { const x = R.bulunan[+el.dataset.n]; closeModal(); if (!x) return; if (R.k.tur === 'pdf') return pdfGit(x.b); if (x.b === R.b) { konumaGit({ ofs: x.i }); konumGuncelle(); } else bolumAc(x.b, { ofs: x.i }); },
  'ko-ses': () => { if (R.tts) return sesDur(); sesPaneli(); },
  'ko-ses-basla': () => sesBasla('basit'),
  'ko-ses-dur': () => { const t = R.tts; if (!t) return; if (t.duraklat) { t.duraklat = false; speechSynthesis.resume(); if (!speechSynthesis.speaking) sesSoyle(); } else { t.duraklat = true; speechSynthesis.pause(); } sesPaneliGoster(); },
  'ko-ses-geri': () => { const t = R.tts; if (t) { t.i = Math.max(0, t.i - 1); t.duraklat = false; sesSoyle(); sesPaneliGoster(); } },
  'ko-ses-ileri': () => { const t = R.tts; if (t) { t.i++; t.duraklat = false; sesSoyle(); sesPaneliGoster(); } },
  'ko-ses-bitir': sesDur,
  'ko-dis-ac': el => { closeModal(); const u = el.dataset.u; if (/^https?:\/\//i.test(u)) window.open(u, '_blank', 'noopener,noreferrer'); },
  'ko-vurgula': el => vurguEkle(+el.dataset.r, ''),
  'ko-not-yeni': () => { const s = R.secim; if (!s) return; notPenceresi('Not ekle', '', t => { R.secim = s; vurguEkle(0, t); }); },
  'ko-kopya': async () => { const t = R.secim?.t || String(getSelection()); try { await navigator.clipboard.writeText(t); toast('Kopyalandı'); } catch { toast('Kopyalanamadı'); } secimKapat(); },
  'ko-oku-sec': () => { const s = getSelection(); R.secimOku = s.rangeCount ? s.getRangeAt(0).cloneRange() : null; secimKapat(); if (!window.speechSynthesis) return toast('Bu cihazda sesli okuma yok'); sesBasla('secim'); },
  'ko-renk-degis': el => { const v = R.duzenle; if (!v) return; v.renk = +el.dataset.r; metaKaydet(R.k); secimKapat(); vurguUygula(); },
  'ko-not-duzenle': () => { const v = R.duzenle; if (!v) return; $('#koSecim').hidden = true; notPenceresi('Not', v.not, t => { v.not = t; metaKaydet(R.k); secimKapat(); vurguUygula(); }); },
  'ko-kopya2': async () => { const v = R.duzenle; if (v) { try { await navigator.clipboard.writeText(alintiMetni(R.k, v)); toast('Kopyalandı'); } catch { toast('Kopyalanamadı'); } } secimKapat(); },
  'ko-vurgu-sil': () => { const v = R.duzenle; if (!v) return; R.k.vurgu = R.k.vurgu.filter(x => x !== v); metaKaydet(R.k); secimKapat(); vurguUygula(); toast('Vurgu kaldırıldı'); }
});
document.addEventListener('visibilitychange', () => { if (document.hidden) gunKaydet(); });
window.addEventListener('pagehide', () => { gunKaydet(); if (R.ac) konumKaydet(true); });
if (window.speechSynthesis) speechSynthesis.onvoiceschanged = () => { /* ses listesi sonradan dolar */ };
