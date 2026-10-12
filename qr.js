/* ───────────── QR ─────────────
   QR kod ve barkod okuyucu / oluşturucu. Kamera ya da resimden okur; bağlantı güvenlik kontrolü, Wi-Fi,
   kişi kartı, etkinlik, konum, ödeme karekodu, ilaç karekodu (GS1: son kullanma tarihi), ürün barkodu (Open Food Facts),
   geçmiş, favoriler, toplu okuma (sayım listesi, CSV) ve QR oluşturma. Giriş gerekmez; her şey bu cihazda kalır.
   Ürün bilgisi açıksa sadece barkod numarası Open Food Facts'e sorulur. */
'use strict';

window.APP_NAME = 'QR';
window.APP_ICON = 'qr-apple.png?v=1';
window.APP_LEAD = 'QR kod ve barkod okuyucu. Bağlantıları açmadan önce kontrol eder; QR kod da oluşturur.';

const QSVG = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
Object.assign(IC, {
  qr: QSVG('<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2v2h-2zM18 14h2M14 18h2v2M18 18h2v2h-2"/>'),
  okut: QSVG('<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"/><path d="M4 12h16"/>'),
  gecmis: QSVG('<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/><path d="M12 8v4l3 2"/>'),
  olustur: QSVG('<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><path d="M17 14v6M14 17h6"/>'),
  galeri: QSVG('<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m4 17 5-4.5 3.5 3 2.5-2 5 3.5"/>'),
  fener: QSVG('<path d="M8 3h8v4l-2 3v10h-4V10L8 7z"/><path d="M12 13v2"/>'),
  liste: QSVG('<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.8" cy="6.5" r="1" fill="currentColor"/><circle cx="4.8" cy="12" r="1" fill="currentColor"/><circle cx="4.8" cy="17.5" r="1" fill="currentColor"/>'),
  baglanti: QSVG('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
  wifi: QSVG('<path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.7 16a5 5 0 0 1 6.6 0"/><circle cx="12" cy="19.2" r="1" fill="currentColor"/>'),
  kisi: QSVG('<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4.5 4.5-6 8-6s6.5 1.5 8 6"/>'),
  telefon: QSVG('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
  eposta: QSVG('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 7 8.5-7"/>'),
  sms: QSVG('<path d="M4 5h16v11H9l-5 4z"/>'),
  konum: QSVG('<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
  takvim: QSVG('<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
  urun: QSVG('<path d="M4 6v12M7 6v12M10 6v12M14 6v12M17 6v12M20 6v12"/>'),
  ilac: QSVG('<rect x="3" y="8" width="18" height="8" rx="4"/><path d="M12 8v8"/>'),
  odeme: QSVG('<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 15h3"/>'),
  metin: QSVG('<path d="M4 6h16M4 10h16M4 14h10M4 18h7"/>'),
  kitap: QSVG('<path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5zM12 6.5v13"/>'),
  kalkan: QSVG('<path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/>'),
  uyari: QSVG('<path d="M12 4 2.5 20h19z"/><path d="M12 10v4M12 17v.2"/>'),
  yildiz: QSVG('<path d="m12 3.8 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5 2.7.9-5.6-4-3.9 5.6-.8z"/>'),
  yildizDolu: QSVG('<path d="m12 3.8 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5 2.7.9-5.6-4-3.9 5.6-.8z" fill="currentColor"/>'),
  kopya: QSVG('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>'),
  paylas: QSVG('<path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 12v7h14v-7"/>'),
  indir: QSVG('<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M5 19h14"/>'),
  ac: QSVG('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
  araI: QSVG('<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>'),
  eksi: QSVG('<path d="M5 12h14"/>'), arti: QSVG('<path d="M12 5v14M5 12h14"/>'),
  daha: QSVG('<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>')
});

/* ═════════ Durum ve ayarlar ═════════ */
const Q = { sekme: 'okut', kamera: null, toplu: store.get('qrTopluAcik', false), q: '', filtre: 'tum', olus: { tur: 'baglanti', v: {} } };
const ayar = (k, d) => store.get('qr_' + k, d);
const ayarYaz = (k, v) => store.set('qr_' + k, v);
const gecmis = () => store.get('qrGecmis', []);
const gecmisYaz = L => store.set('qrGecmis', L.slice(0, 500));
const topluListe = () => store.get('qrToplu', []);
const topluYaz = L => store.set('qrToplu', L);
const qId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-3);
const zaman = ms => new Date(ms).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/* ═════════ Başlangıç (giriş gerekmez) ═════════ */
document.removeEventListener('DOMContentLoaded', boot);
function qrBaslat() {
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  if (location.hash.includes('state=')) history.replaceState(null, '', location.pathname + location.search);
  S.email = store.get('email') || '';
  const u = new URLSearchParams(location.search);
  if (u.has('olustur')) Q.sekme = 'olustur'; else if (u.has('gecmis')) Q.sekme = 'gecmis';
  if (u.has('olustur') || u.has('gecmis') || u.has('okut')) history.replaceState(null, '', location.pathname + (DEMO ? '?demo' : ''));
  if (DEMO && !gecmis().length) ornekGecmis();
  kabuk(); sekmeCiz();
}
showLogin = msg => { if (msg) toast(msg); };
start = () => qrBaslat();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', qrBaslat); else qrBaslat();

function kabuk() {
  document.body.classList.add('qr-on');
  $('#app').innerHTML = `
  <div class="qr-kabuk">
    <header class="qr-bas">
      <div class="brand-mark sm">${IC.qr}</div><h1>QR</h1>
      <nav class="qr-ust-sekme seg">${[['okut', 'Okut'], ['gecmis', 'Geçmiş'], ['olustur', 'Oluştur']].map(([k, n]) => `<button data-action="q-sekme" data-k="${k}">${n}</button>`).join('')}</nav>
      <div class="spacer"></div>
      <button class="icon-btn" data-action="q-ayar" title="Ayarlar">${IC.gear}</button>
    </header>
    <main class="qr-govde" id="qGovde"></main>
    <nav class="qr-alt-sekme">${[['okut', 'Okut', 'okut'], ['gecmis', 'Geçmiş', 'gecmis'], ['olustur', 'Oluştur', 'olustur']].map(([k, n, ic]) => `<button data-action="q-sekme" data-k="${k}">${IC[ic]}<span>${n}</span></button>`).join('')}</nav>
  </div>`;
}
function sekmeCiz() {
  document.querySelectorAll('[data-action="q-sekme"]').forEach(b => b.classList.toggle('on', b.dataset.k === Q.sekme));
  document.body.dataset.qsekme = Q.sekme;
  if (Q.sekme !== 'okut') kameraKapat();
  ({ okut: okutCiz, gecmis: gecmisCiz, olustur: olusturCiz })[Q.sekme]();
}

/* ═════════ Okuma motoru ═════════ */
let yerel = null, zxing = null;
async function yerelOkuyucu() {
  if (yerel !== null) return yerel;
  try { if ('BarcodeDetector' in window) { const f = await BarcodeDetector.getSupportedFormats(); if (f.length) return (yerel = new BarcodeDetector({ formats: f })); } } catch {}
  return (yerel = false);
}
let zxingYuk = null;
function zxingYukle() {
  if (!zxingYuk) zxingYuk = new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'qr-lib/zxing.js'; s.onload = () => res(window.ZXing); s.onerror = () => { zxingYuk = null; rej(new Error('Okuyucu yüklenemedi')); }; document.head.appendChild(s); });
  return zxingYuk;
}
async function zxingOkuyucu() {
  if (zxing) return zxing;
  const Z = await zxingYukle(), r = new Z.MultiFormatReader(), h = new Map();
  h.set(Z.DecodeHintType.TRY_HARDER, true);
  h.set(Z.DecodeHintType.POSSIBLE_FORMATS, ['QR_CODE', 'DATA_MATRIX', 'AZTEC', 'PDF_417', 'EAN_13', 'EAN_8', 'UPC_A', 'UPC_E', 'CODE_128', 'CODE_39', 'CODE_93', 'ITF', 'CODABAR'].map(f => Z.BarcodeFormat[f]).filter(x => x != null));
  r.setHints(h);
  return (zxing = { Z, r });
}
const tuval = document.createElement('canvas');
// Kaynak: video, resim ya da tuval. merkez: sadece ortadaki bölgeye bak (canlı okumada hız için)
async function coz(kaynak, merkez) {
  const y = await yerelOkuyucu();
  if (y) {
    const r = await y.detect(kaynak).catch(() => []);
    if (r[0]) return { metin: r[0].rawValue, bicim: r[0].format };
    if (merkez) return null;
  }
  const { Z, r } = await zxingOkuyucu();
  const w = kaynak.videoWidth || kaynak.naturalWidth || kaynak.width, h = kaynak.videoHeight || kaynak.naturalHeight || kaynak.height;
  if (!w || !h) return null;
  let sx = 0, sy = 0, sw = w, sh = h;
  if (merkez) { const k = Math.min(w, h) * 0.8; sw = Math.min(w, k * 1.4); sh = k; sx = (w - sw) / 2; sy = (h - sh) / 2; }
  const k = Math.min(1, (merkez ? 900 : 1600) / Math.max(sw, sh));
  tuval.width = Math.round(sw * k); tuval.height = Math.round(sh * k);
  const g = tuval.getContext('2d', { willReadFrequently: true }); g.drawImage(kaynak, sx, sy, sw, sh, 0, 0, tuval.width, tuval.height);
  const dene = c => { try { const res = r.decodeWithState(new Z.BinaryBitmap(new Z.HybridBinarizer(new Z.HTMLCanvasElementLuminanceSource(c)))); return { metin: res.getText(), bicim: String(Z.BarcodeFormat[res.getBarcodeFormat()] || '').toLowerCase() }; } catch { return null; } };
  let sonuc = dene(tuval);
  if (!sonuc && !merkez) {   // ters renkli (siyah zemin üstüne beyaz) kodlar için bir deneme daha
    const d = g.getImageData(0, 0, tuval.width, tuval.height); for (let i = 0; i < d.data.length; i += 4) { d.data[i] = 255 - d.data[i]; d.data[i + 1] = 255 - d.data[i + 1]; d.data[i + 2] = 255 - d.data[i + 2]; }
    g.putImageData(d, 0, 0); sonuc = dene(tuval);
  }
  return sonuc;
}

/* ═════════ Okut ekranı ═════════ */
function okutCiz() {
  $('#qGovde').innerHTML = `
  <div class="qr-okut">
    <div class="qr-kamera" id="qKamera">
      <video id="qVid" playsinline muted autoplay></video>
      <div class="qr-cerceve"><i></i><b></b></div>
      <div class="qr-ipucu" id="qIpucu">Kamera açılıyor…</div>
      <div class="qr-k-alt">
        <button class="qr-yuvarlak" data-action="q-resim" title="Resimden oku">${IC.galeri}<span>Resimden</span></button>
        <button class="qr-yuvarlak" data-action="q-fener" id="qFener" hidden title="Fener">${IC.fener}<span>Fener</span></button>
        <button class="qr-yuvarlak ${Q.toplu ? 'on' : ''}" data-action="q-toplu" title="Toplu okut (sayım listesi)">${IC.liste}<span>Toplu</span></button>
      </div>
      <input type="range" class="qr-zum" id="qZum" hidden min="1" max="1" step="0.1" value="1" aria-label="Yakınlaştır">
    </div>
    <div class="qr-toplu" id="qToplu" ${Q.toplu ? '' : 'hidden'}></div>
  </div>`;
  if (Q.toplu) topluCiz();
  kameraAc();
}
async function kameraAc() {
  kameraKapat();
  const K = Q.kamera = { kapandi: false, son: '', sonT: 0 };
  try {
    K.akis = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
    if (K.kapandi) { K.akis.getTracks().forEach(t => t.stop()); return; }
    const v = $('#qVid'); v.srcObject = K.akis; await v.play().catch(() => {});
    const iz = K.akis.getVideoTracks()[0], yet = iz.getCapabilities ? iz.getCapabilities() : {};
    K.iz = iz;
    if (yet.torch) $('#qFener').hidden = false;
    if (yet.zoom && yet.zoom.max > yet.zoom.min) { const z = $('#qZum'); z.hidden = false; z.min = yet.zoom.min; z.max = Math.min(yet.zoom.max, 8); z.step = yet.zoom.step || 0.1; z.value = iz.getSettings().zoom || yet.zoom.min; z.oninput = () => iz.applyConstraints({ advanced: [{ zoom: +z.value }] }).catch(() => {}); }
    $('#qIpucu').textContent = 'QR kodu ya da barkodu çerçeveye getir';
    const yerelVar = await yerelOkuyucu();
    const dongu = async () => {
      if (K.kapandi || Q.kamera !== K) return;
      if (v.videoWidth && !K.duraklat && document.visibilityState === 'visible') {
        try {
          const r = await coz(v, true);
          if (r && !(r.metin === K.son && Date.now() - K.sonT < (Q.toplu ? 2500 : 4000))) { K.son = r.metin; K.sonT = Date.now(); okundu(r, 'kamera'); }
        } catch (e) { console.warn(e); }
      }
      K.t = setTimeout(dongu, yerelVar ? 140 : 220);
    };
    dongu();
  } catch (e) {
    const el = $('#qIpucu'); if (el) el.innerHTML = e.name === 'NotAllowedError' ? 'Kamera izni verilmedi. Tarayıcı ayarlarından izin verebilir ya da <b>Resimden</b> okutabilirsin.' : 'Kamera açılamadı. <b>Resimden</b> okutabilirsin.';
    $('#qKamera')?.classList.add('kapali');
  }
}
function kameraKapat() { const K = Q.kamera; if (!K) return; K.kapandi = true; clearTimeout(K.t); K.akis?.getTracks().forEach(t => t.stop()); Q.kamera = null; }
document.addEventListener('visibilitychange', () => { if (Q.sekme !== 'okut' || !$('#qVid')) return; if (document.visibilityState === 'hidden') kameraKapat(); else if (!Q.kamera) kameraAc(); });
function okundu(r, kaynak) {
  if (ayar('ses', true)) bip();
  if (ayar('titresim', true)) navigator.vibrate?.(Q.toplu ? 20 : 40);
  $('#qKamera')?.classList.add('buldu'); setTimeout(() => $('#qKamera')?.classList.remove('buldu'), 350);
  const kayit = gecmiseEkle(r.metin, r.bicim, kaynak);
  if (Q.toplu && kaynak === 'kamera') return topluEkle(r);
  if (Q.kamera) Q.kamera.duraklat = true;
  sonucGoster(kayit, () => { if (Q.kamera) Q.kamera.duraklat = false; });
}
let ses = null;
function bip() { try { ses = ses || new (window.AudioContext || window.webkitAudioContext)(); const o = ses.createOscillator(), g = ses.createGain(); o.frequency.value = 1760; g.gain.setValueAtTime(0.12, ses.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ses.currentTime + 0.12); o.connect(g).connect(ses.destination); o.start(); o.stop(ses.currentTime + 0.13); } catch {} }
function gecmiseEkle(metin, bicim, kaynak) {
  const L = gecmis(), var_ = L.find(x => x.metin === metin && x.bicim === bicim);
  const k = var_ || { id: qId(), metin, bicim, fav: false };
  k.t = Date.now(); k.kaynak = kaynak; k.sayi = (var_?.sayi || 0) + 1;
  if (ayar('gecmis', true) || k.fav) gecmisYaz([k, ...L.filter(x => x !== var_)]);
  return k;
}
async function resimdenOku() {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = async () => {
    const f = inp.files[0]; if (!f) return;
    const u = URL.createObjectURL(f), img = new Image();
    img.onload = async () => {
      let r = null; try { r = await coz(img, false); } catch (e) { console.warn(e); }
      URL.revokeObjectURL(u);
      if (!r) return toast('Resimde QR kod ya da barkod bulunamadı');
      if (Q.kamera) Q.kamera.duraklat = true;
      okundu(r, 'resim');
    };
    img.src = u;
  };
  inp.click();
}

/* ═════════ Toplu okuma (sayım) ═════════ */
function topluEkle(r) {
  const L = topluListe(), x = L.find(y => y.metin === r.metin);
  if (x) { x.adet++; x.t = Date.now(); } else L.unshift({ metin: r.metin, bicim: r.bicim, adet: 1, t: Date.now() });
  topluYaz(L); topluCiz(r.metin);
}
function topluCiz(vurgu) {
  const el = $('#qToplu'); if (!el) return;
  const L = topluListe(), top = L.reduce((a, x) => a + x.adet, 0);
  el.innerHTML = `<div class="qr-toplu-bas"><b>Toplu okuma</b><span>${L.length} farklı kod · ${top} adet</span><div class="spacer"></div>
      <button class="btn sm" data-action="q-toplu-csv" ${L.length ? '' : 'disabled'}>${IC.indir}CSV</button>
      <button class="btn sm" data-action="q-toplu-temizle" ${L.length ? '' : 'disabled'}>Temizle</button></div>
    <div class="qr-toplu-l">${L.map((x, i) => `<div class="qr-toplu-s ${x.metin === vurgu ? 'yeni' : ''}"><span class="qr-ic">${IC[cozumle(x.metin, x.bicim).ikon]}</span><div><b>${esc(kisalt(kisaAd(x), 60))}</b><em>${esc(bicimAd(x.bicim))}</em></div>
      <button class="icon-btn sm" data-action="q-adet" data-i="${i}" data-d="-1">${IC.eksi}</button><b class="qr-adet">${x.adet}</b><button class="icon-btn sm" data-action="q-adet" data-i="${i}" data-d="1">${IC.arti}</button></div>`).join('') || '<div class="list-msg">Kodları art arda okut; aynı kod tekrar okununca adedi artar.</div>'}</div>`;
}
function csvIndir(satirlar, ad) {
  const csv = '﻿' + satirlar.map(r => r.map(v => /[;"\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v).join(';')).join('\n');
  indir(new Blob([csv], { type: 'text/csv;charset=utf-8' }), ad);
}
function indir(blob, ad) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = ad; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000); }
const kisalt = (s, n) => { s = String(s).replace(/\s+/g, ' '); return s.length > n ? s.slice(0, n - 1) + '…' : s; };

/* ═════════ Kodun anlamı ═════════ */
const BICIM_AD = { qr_code: 'QR kod', data_matrix: 'Data Matrix (karekod)', aztec: 'Aztec', pdf417: 'PDF417', pdf_417: 'PDF417', ean_13: 'EAN-13', ean_8: 'EAN-8', upc_a: 'UPC-A', upc_e: 'UPC-E', code_128: 'Code 128', code_39: 'Code 39', code_93: 'Code 93', itf: 'ITF', codabar: 'Codabar', olusturulan: 'QR kod' };
const bicimAd = b => BICIM_AD[b] || (b ? b.toUpperCase().replace(/_/g, '-') : 'Kod');
// GS1 uygulama tanımlayıcıları (ilaç karekodu, lojistik)
const GS1 = { '00': ['SSCC', 18], '01': ['Ürün numarası (GTIN)', 14], '02': ['İçerik GTIN', 14], '10': ['Parti / lot', 0], '11': ['Üretim tarihi', 6], '15': ['Tavsiye edilen son tüketim', 6], '17': ['Son kullanma tarihi', 6], '21': ['Seri numarası', 0], '30': ['Adet', 0], '37': ['Adet', 0], '240': ['Ek ürün kodu', 0], '250': ['İkincil seri no', 0] };
function gs1Coz(m) {
  let s = m.replace(/^\]d2|^\]C1|^\]Q3/, ''); if (s[0] === '\u001d') s = s.slice(1);
  if (!/^(00|01|02|10|11|17|21)/.test(s)) return null;
  const out = []; let i = 0, g = 0;
  while (i < s.length && g++ < 20) {
    const ai = ['240', '250'].find(a => s.startsWith(a, i)) || s.substr(i, 2); const t = GS1[ai];
    if (!t) return out.length >= 2 ? out : null;
    i += ai.length;
    let v; if (t[1]) { v = s.substr(i, t[1]); i += t[1]; } else { const j = s.indexOf('\u001d', i); v = j < 0 ? s.slice(i) : s.slice(i, j); i = j < 0 ? s.length : j + 1; }
    if (s[i] === '\u001d') i++;
    out.push({ ai, ad: t[0], v });
  }
  return out.length >= 2 ? out : null;
}
const gs1Tarih = v => { const y = 2000 + +v.slice(0, 2), a = +v.slice(2, 4), g = +v.slice(4, 6) || new Date(y, a, 0).getDate(); return new Date(y, a - 1, g); };
// EMV ödeme karekodu (TR Karekod dahil)
function emvCoz(m) {
  if (!/^000201/.test(m)) return null;
  const tlv = s => { const o = {}; let i = 0; while (i + 4 <= s.length) { const id = s.substr(i, 2), n = +s.substr(i + 2, 2); if (isNaN(n)) break; o[id] = s.substr(i + 4, n); i += 4 + n; } return o; };
  const t = tlv(m); if (!t['59'] && !t['54']) return null;
  const para = { 949: 'TL', 840: 'USD', 978: 'EUR' }[t['53']] || t['53'] || '';
  return { isyeri: t['59'], sehir: t['60'], tutar: t['54'] ? t['54'] + ' ' + para : '', ulke: t['58'] };
}
function cozumle(m, bicim = '') {
  const s = String(m || '').trim(), kucuk = s.toLowerCase();
  if (/^https?:\/\//i.test(s) || /^www\.[^\s]+\.[a-z]{2,}/i.test(s)) return { tur: 'baglanti', ad: 'Bağlantı', ikon: 'baglanti' };
  if (/^WIFI:/i.test(s)) return { tur: 'wifi', ad: 'Wi-Fi', ikon: 'wifi' };
  if (/^BEGIN:VCARD/i.test(s) || /^MECARD:/i.test(s)) return { tur: 'kisi', ad: 'Kişi kartı', ikon: 'kisi' };
  if (/BEGIN:VEVENT/i.test(s)) return { tur: 'etkinlik', ad: 'Etkinlik', ikon: 'takvim' };
  if (/^tel:/i.test(s)) return { tur: 'telefon', ad: 'Telefon', ikon: 'telefon' };
  if (/^(smsto|sms|mms):/i.test(s)) return { tur: 'sms', ad: 'SMS', ikon: 'sms' };
  if (/^mailto:/i.test(s) || /^MATMSG:/i.test(s)) return { tur: 'eposta', ad: 'E-posta', ikon: 'eposta' };
  if (/^geo:/i.test(s)) return { tur: 'konum', ad: 'Konum', ikon: 'konum' };
  if (emvCoz(s)) return { tur: 'odeme', ad: 'Ödeme karekodu', ikon: 'odeme' };
  if ((bicim === 'data_matrix' || /^\]d2|\u001d/.test(s) || /^01\d{14}(17|21|10)/.test(s)) && gs1Coz(s)) return { tur: 'gs1', ad: 'Ürün karekodu (ilaç / GS1)', ikon: 'ilac' };
  if (/^(97[89])\d{10}$/.test(s)) return { tur: 'isbn', ad: 'Kitap (ISBN)', ikon: 'kitap' };
  if (/^\d{8}$|^\d{12,14}$/.test(s) && /ean|upc|itf/.test(bicim || 'ean')) return { tur: 'urun', ad: 'Ürün barkodu', ikon: 'urun' };
  if (/^[\w.+-]+@[\w-]+\.[\w.]{2,}$/.test(s)) return { tur: 'eposta', ad: 'E-posta', ikon: 'eposta' };
  if (/^\+?\d[\d\s()-]{7,}$/.test(s) && !/^\d+$/.test(s)) return { tur: 'telefon', ad: 'Telefon', ikon: 'telefon' };
  return { tur: 'metin', ad: kucuk.length < 30 && /^\d+$/.test(s) ? 'Barkod' : 'Metin', ikon: /^\d+$/.test(s) ? 'urun' : 'metin' };
}

/* ═════════ Bağlantı güvenlik kontrolü ═════════
   Bu cihazda yapılır (adres hiçbir yere gönderilmez). Kesin karar değildir; şüpheli işaretleri gösterir. */
const KISALTICI = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'cutt.ly', 'rb.gy', 'shorturl.at', 'ow.ly', 's.id', 't.ly', 'tiny.cc', 'v.gd', 'qrco.de', 'bl.ink', 'rebrand.ly', 'lnkd.in', 'shorturl.com', 'buff.ly'];
const RESMI = { edevlet: ['turkiye.gov.tr'], 'e-devlet': ['turkiye.gov.tr'], turkiye: ['turkiye.gov.tr'], ziraat: ['ziraatbank.com.tr', 'ziraat.com.tr'], garanti: ['garantibbva.com.tr', 'garanti.com.tr'], akbank: ['akbank.com'], isbank: ['isbank.com.tr'], yapikredi: ['yapikredi.com.tr'], halkbank: ['halkbank.com.tr'], vakifbank: ['vakifbank.com.tr'], enpara: ['enpara.com'], qnb: ['qnb.com.tr'], denizbank: ['denizbank.com'], paypal: ['paypal.com'], apple: ['apple.com', 'icloud.com'], google: ['google.com', 'google.com.tr', 'goo.gl', 'youtube.com'], microsoft: ['microsoft.com', 'live.com', 'office.com'], ptt: ['ptt.gov.tr', 'pttavm.com'], trendyol: ['trendyol.com'], hepsiburada: ['hepsiburada.com'], sahibinden: ['sahibinden.com'], whatsapp: ['whatsapp.com', 'wa.me'], instagram: ['instagram.com'], facebook: ['facebook.com'], netflix: ['netflix.com'], amazon: ['amazon.com', 'amazon.com.tr'], getir: ['getir.com'], yemeksepeti: ['yemeksepeti.com'], turkcell: ['turkcell.com.tr'], vodafone: ['vodafone.com.tr'], turktelekom: ['turktelekom.com.tr'], sgk: ['sgk.gov.tr'], gib: ['gib.gov.tr'], 'e-nabiz': ['enabiz.gov.tr'], enabiz: ['enabiz.gov.tr'] };
function guvenlik(adres) {
  let u; try { u = new URL(/^https?:\/\//i.test(adres) ? adres : 'https://' + adres); } catch { return { seviye: 'riskli', notlar: ['Adres düzgün biçimde değil.'] }; }
  const host = u.hostname.toLowerCase().replace(/^www\./, ''), notlar = []; let puan = 0;
  const kok = host.split('.').slice(-3).join('.');
  if (u.protocol === 'http:') { notlar.push('Bağlantı şifreli değil (https değil). Bu sayfaya bilgi girme.'); puan += 2; }
  if (/(^|\.)xn--/.test(host)) { notlar.push('Adreste farklı alfabeden benzer harfler var; bilinen bir sitenin taklidi olabilir.'); puan += 3; }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(':')) { notlar.push('Site adı yerine çıplak bir sayı adresi (IP) kullanılmış.'); puan += 3; }
  if (KISALTICI.includes(host)) { notlar.push('Kısaltılmış bağlantı: gerçekte hangi siteye gideceği görünmüyor.'); puan += 1; }
  if (u.username || u.password) { notlar.push('Adreste "@" hilesi var; gerçek site "@" işaretinden sonraki kısımdır.'); puan += 3; }
  const temiz = host.replace(/[-.]/g, '');
  for (const [ad, resmi] of Object.entries(RESMI)) {
    if ((host.includes(ad) || temiz.includes(ad.replace(/-/g, ''))) && !resmi.some(r => host === r || host.endsWith('.' + r))) { notlar.push(`Adreste "${ad}" geçiyor ama ${resmi[0]} değil; resmî site olmayabilir.`); puan += 3; break; }
  }
  if (/\.(apk|exe|msi|scr|bat|dmg|pkg|ipa)(\?|$)/i.test(u.pathname)) { notlar.push('Bağlantı bir program dosyası indiriyor. Tanımadığın yerden program kurma.'); puan += 3; }
  if (/\.(zip|rar|top|xyz|click|loan|work|rest|tk|ml|ga|cf|gq)$/.test(host)) { notlar.push('Bu alan adı uzantısı dolandırıcılıkta sık kullanılıyor.'); puan += 1; }
  if (host.split('.').length > 4) { notlar.push('Adres çok sayıda alt bölümden oluşuyor; gerçek site adı sondaki kısımdır: ' + kok); puan += 1; }
  return { seviye: puan >= 3 ? 'riskli' : puan >= 1 ? 'dikkat' : 'iyi', notlar, host, kok };
}

/* ═════════ Sonuç ═════════ */
function alanlarVeEylemler(k) {
  const s = String(k.metin), c = cozumle(s, k.bicim), alan = [], ey = [];
  const kopya = (et, v) => ey.push(['kopya', IC.kopya, et || 'Kopyala', v ?? s]);
  if (c.tur === 'baglanti') {
    const adres = /^https?:/i.test(s) ? s : 'https://' + s, g = guvenlik(adres);
    alan.push(['Site', g.host || '']);
    ey.push(['ac', IC.ac, 'Aç', adres]); kopya(); ey.push(['paylas', IC.paylas, 'Paylaş', adres]);
    return { c, alan, ey, guvenlik: g };
  }
  if (c.tur === 'wifi') {
    const w = Object.fromEntries([...s.slice(5).matchAll(/([STPH]):((?:\\.|[^;])*)/g)].map(x => [x[1], x[2].replace(/\\(.)/g, '$1')]));
    alan.push(['Ağ adı', w.S || ''], ['Şifre', w.P || '(şifresiz)'], ['Güvenlik', w.T || 'yok'], ...(w.H === 'true' ? [['Gizli ağ', 'evet']] : []));
    if (w.P) kopya('Şifreyi kopyala', w.P); kopya('Ağ adını kopyala', w.S || '');
    return { c, alan, ey, not: 'Telefonun ayarlarında bu ağı seçip şifreyi yapıştır. (Tarayıcıdaki uygulamalar Wi-Fi\'a kendisi bağlanamaz.)' };
  }
  if (c.tur === 'kisi') {
    let ad = '', tel = [], mail = [], org = '', web = '';
    if (/^MECARD:/i.test(s)) { const f = Object.fromEntries([...s.slice(7).matchAll(/([A-Z]+):((?:\\.|[^;])*)/g)].map(x => [x[1], x[2]])); ad = (f.N || '').replace(',', ' '); tel = f.TEL ? [f.TEL] : []; mail = f.EMAIL ? [f.EMAIL] : []; web = f.URL || ''; org = f.ORG || ''; }
    else { const sat = s.split(/\r?\n/); ad = (sat.find(l => /^FN[:;]/i.test(l)) || '').replace(/^FN[^:]*:/i, ''); tel = sat.filter(l => /^TEL[:;]/i.test(l)).map(l => l.replace(/^TEL[^:]*:/i, '')); mail = sat.filter(l => /^EMAIL[:;]/i.test(l)).map(l => l.replace(/^EMAIL[^:]*:/i, '')); org = (sat.find(l => /^ORG[:;]/i.test(l)) || '').replace(/^ORG[^:]*:/i, '').replace(/;/g, ' '); web = (sat.find(l => /^URL[:;]/i.test(l)) || '').replace(/^URL[^:]*:/i, ''); }
    alan.push(['Ad', ad], ...tel.map(t => ['Telefon', t]), ...mail.map(m => ['E-posta', m]), ...(org ? [['Kurum', org]] : []), ...(web ? [['Web', web]] : []));
    const vcf = /^MECARD:/i.test(s) ? `BEGIN:VCARD\nVERSION:3.0\nFN:${ad}\n${tel.map(t => 'TEL:' + t + '\n').join('')}${mail.map(m => 'EMAIL:' + m + '\n').join('')}${org ? 'ORG:' + org + '\n' : ''}${web ? 'URL:' + web + '\n' : ''}END:VCARD` : s;
    ey.push(['vcf', IC.kisi, 'Rehbere kaydet', vcf]); if (tel[0]) ey.push(['link', IC.telefon, 'Ara', 'tel:' + tel[0].replace(/\s/g, '')]); kopya();
    return { c, alan, ey };
  }
  if (c.tur === 'etkinlik') {
    const al = k2 => (s.split(/\r?\n/).find(l => new RegExp('^' + k2 + '[:;]', 'i').test(l)) || '').replace(/^[^:]*:/, '');
    const tarih = v => { const m = v.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?/); return m ? new Date(+m[1], m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0)) : null; };
    const bas = tarih(al('DTSTART')), bit = tarih(al('DTEND'));
    alan.push(['Başlık', al('SUMMARY')], ['Başlangıç', bas ? bas.toLocaleString('tr-TR') : al('DTSTART')], ...(bit ? [['Bitiş', bit.toLocaleString('tr-TR')]] : []), ...(al('LOCATION') ? [['Yer', al('LOCATION')]] : []));
    const ics = /BEGIN:VCALENDAR/i.test(s) ? s : `BEGIN:VCALENDAR\nVERSION:2.0\n${s}\nEND:VCALENDAR`;
    const g = 'https://calendar.google.com/calendar/render?' + new URLSearchParams({ action: 'TEMPLATE', text: al('SUMMARY'), dates: (al('DTSTART') || '') + '/' + (al('DTEND') || al('DTSTART') || ''), location: al('LOCATION'), details: al('DESCRIPTION') });
    ey.push(['ac', IC.takvim, 'Google Takvim\'e ekle', g], ['ics', IC.indir, '.ics indir', ics]); kopya();
    return { c, alan, ey };
  }
  if (c.tur === 'telefon') { const t = s.replace(/^tel:/i, ''); alan.push(['Numara', t]); ey.push(['link', IC.telefon, 'Ara', 'tel:' + t.replace(/\s/g, '')]); kopya('Numarayı kopyala', t); return { c, alan, ey }; }
  if (c.tur === 'sms') { const m = s.match(/^(?:smsto|sms|mms):([^:?]*)[:?]?(?:body=)?(.*)$/i) || []; alan.push(['Numara', m[1] || ''], ['Mesaj', decodeURIComponent(m[2] || '')]); ey.push(['link', IC.sms, 'SMS yaz', `sms:${m[1] || ''}${m[2] ? '?body=' + encodeURIComponent(decodeURIComponent(m[2])) : ''}`]); kopya(); return { c, alan, ey }; }
  if (c.tur === 'eposta') {
    let kime = s, konu = '', govde = '';
    if (/^MATMSG:/i.test(s)) { const f = Object.fromEntries([...s.slice(7).matchAll(/(TO|SUB|BODY):((?:\\.|[^;])*)/g)].map(x => [x[1], x[2]])); kime = f.TO || ''; konu = f.SUB || ''; govde = f.BODY || ''; }
    else if (/^mailto:/i.test(s)) { const u = new URL(s); kime = decodeURIComponent(u.pathname); konu = u.searchParams.get('subject') || ''; govde = u.searchParams.get('body') || ''; }
    alan.push(['Kime', kime], ...(konu ? [['Konu', konu]] : []), ...(govde ? [['Mesaj', govde]] : []));
    ey.push(['link', IC.eposta, 'Mail yaz', `mailto:${kime}?` + new URLSearchParams({ ...(konu ? { subject: konu } : {}), ...(govde ? { body: govde } : {}) }).toString().replace(/\+/g, '%20')]); kopya('Adresi kopyala', kime);
    return { c, alan, ey };
  }
  if (c.tur === 'konum') { const m = s.match(/^geo:([-\d.]+),([-\d.]+)/i) || []; alan.push(['Enlem', m[1] || ''], ['Boylam', m[2] || '']); ey.push(['ac', IC.konum, 'Haritada aç', `https://www.google.com/maps?q=${m[1]},${m[2]}`]); kopya(); return { c, alan, ey }; }
  if (c.tur === 'odeme') { const e = emvCoz(s); alan.push(['İşyeri', e.isyeri || ''], ...(e.sehir ? [['Şehir', e.sehir]] : []), ...(e.tutar ? [['Tutar', e.tutar]] : [])); kopya(); return { c, alan, ey, not: 'Bu bir ödeme karekodu. Ödemeyi bankanın kendi uygulamasıyla okutarak yap; işyeri adının doğru olduğunu kontrol et.' }; }
  if (c.tur === 'gs1') {
    const L = gs1Coz(s); let skt = null;
    L.forEach(x => { let v = x.v; if (/^(11|15|17)$/.test(x.ai)) { const d = gs1Tarih(v); v = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }); if (x.ai === '17') skt = d; } alan.push([x.ad, v]); });
    const gtin = L.find(x => x.ai === '01')?.v;
    if (gtin) ey.push(['ac', IC.araI, 'İnternette ara', 'https://www.google.com/search?q=' + gtin.replace(/^0/, '')]);
    kopya();
    const kalan = skt ? Math.ceil((skt - Date.now()) / 864e5) : null;
    return { c, alan, ey, skt: kalan, not: gtin && /^0?86[89]/.test(gtin) ? 'Türkiye\'de kayıtlı ürün numarası (GS1 Türkiye).' : '' };
  }
  if (c.tur === 'isbn') { alan.push(['ISBN', s]); ey.push(['ac', IC.kitap, 'Kitabı ara', 'https://www.google.com/search?tbm=bks&q=isbn:' + s]); kopya(); return { c, alan, ey }; }
  if (c.tur === 'urun') {
    alan.push(['Barkod', s], ['Tür', bicimAd(k.bicim)]);
    const ulke = /^86[89]/.test(s) ? 'Türkiye (GS1 Türkiye)' : /^(0|1[0-3])/.test(s) && s.length >= 12 ? 'ABD / Kanada' : /^(40|41|42|43|44)/.test(s) ? 'Almanya' : /^(30|31|32|33|34|35|36|37)/.test(s) ? 'Fransa' : /^(80|81|82|83)/.test(s) ? 'İtalya' : /^(84)/.test(s) ? 'İspanya' : /^(690|691|692|693|694|695|696|697|698|699)/.test(s) ? 'Çin' : /^(50)/.test(s) ? 'Birleşik Krallık' : '';
    if (ulke) alan.push(['Barkodun kayıtlı olduğu yer', ulke]);
    ey.push(['ac', IC.araI, 'İnternette ara', 'https://www.google.com/search?q=' + s], ['ac', IC.urun, 'Fiyat karşılaştır', 'https://www.akakce.com/arama/?q=' + s]); kopya();
    return { c, alan, ey, urun: ayar('urunBilgi', true) ? s : null, not: 'Barkodun kayıtlı olduğu yer, ürünün üretildiği ülke anlamına gelmez.' };
  }
  ey.push(['ac', IC.araI, 'İnternette ara', 'https://www.google.com/search?q=' + encodeURIComponent(s.slice(0, 200))]); kopya(); if (navigator.share) ey.push(['paylas', IC.paylas, 'Paylaş', s]);
  return { c, alan, ey };
}
// Adreste gerçek site adı kalın gösterilir (taklit adresleri fark etmek için)
function adresVurgu(m, host) {
  const t = m.replace(/^https?:\/\//i, ''), i = host ? t.toLowerCase().indexOf(host) : -1;
  return i < 0 ? esc(t) : esc(t.slice(0, i)) + `<b>${esc(t.slice(i, i + host.length))}</b>` + esc(t.slice(i + host.length));
}
// Listede gösterilecek kısa ad
function kisaAd(x) {
  const c = cozumle(x.metin, x.bicim), m = String(x.metin);
  if (c.tur === 'wifi') return 'Wi-Fi: ' + ((m.match(/S:((?:\\.|[^;])*)/) || [])[1] || '').replace(/\\(.)/g, '$1');
  if (c.tur === 'kisi') return 'Kişi: ' + (((m.match(/^FN[^:]*:(.*)$/mi) || m.match(/^MECARD:N:([^;]*)/i) || [])[1]) || '').replace(',', ' ');
  if (c.tur === 'gs1') { const L = gs1Coz(m) || [], gt = L.find(y => y.ai === '01'), sk = L.find(y => y.ai === '17'); return 'Karekod: ' + (gt ? gt.v : '') + (sk ? ' · SKT ' + gs1Tarih(sk.v).toLocaleDateString('tr-TR') : ''); }
  if (c.tur === 'etkinlik') return 'Etkinlik: ' + ((m.match(/^SUMMARY[^:]*:(.*)$/mi) || [])[1] || '');
  if (c.tur === 'odeme') return 'Ödeme: ' + (emvCoz(m)?.isyeri || '');
  return m.replace(/[\u0000-\u001f]/g, ' ');
}
function sonucGoster(k, kapaninca) {
  const r = alanlarVeEylemler(k), g = r.guvenlik;
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask qr-sonuc"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button>
      <span class="qr-ic buyuk">${IC[r.c.ikon]}</span><h3>${esc(r.c.ad)}</h3>
      <button class="icon-btn ${k.fav ? 'on' : ''}" id="qFav" title="Favorilere ekle">${k.fav ? IC.yildizDolu : IC.yildiz}</button></header>
    <div class="set-body">
      ${g ? `<div class="qr-guv ${g.seviye}">${g.seviye === 'iyi' ? IC.kalkan : IC.uyari}<div><b>${g.seviye === 'iyi' ? 'Belirgin bir tehlike işareti yok' : g.seviye === 'dikkat' ? 'Dikkat' : 'Şüpheli bağlantı'}</b>
        ${g.notlar.length ? `<ul>${g.notlar.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : '<span>Yine de tanımadığın sitelere şifre ya da kart bilgisi girme.</span>'}</div></div>` : ''}
      ${r.skt != null ? `<div class="qr-guv ${r.skt < 0 ? 'riskli' : r.skt < 60 ? 'dikkat' : 'iyi'}">${r.skt < 0 ? IC.uyari : IC.kalkan}<div><b>${r.skt < 0 ? `Son kullanma tarihi ${-r.skt} gün önce geçmiş` : `Son kullanma tarihine ${r.skt} gün var`}</b></div></div>` : ''}
      <div class="qr-icerik">${g ? `<div class="qr-adres">${adresVurgu(String(k.metin), g.host)}</div>` : ''}
        ${r.alan.length ? `<dl class="qr-alanlar">${r.alan.map(([a, v]) => `<div><dt>${esc(a)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
        ${!r.alan.length || r.c.tur === 'metin' ? `<pre class="qr-ham">${esc(String(k.metin).replace(/\u001d/g, '␝'))}</pre>` : `<details class="qr-ham-d"><summary>Kodun içeriği</summary><pre class="qr-ham">${esc(String(k.metin).replace(/\u001d/g, '␝'))}</pre></details>`}
      </div>
      <div id="qUrun"></div>
      ${r.not ? `<p class="muted sm">${esc(r.not)}</p>` : ''}
      <div class="qr-eylemler">${r.ey.map(([t, ic, ad], i) => `<button class="btn ${i === 0 ? 'primary' : ''}" data-ey="${i}">${ic}${esc(ad)}</button>`).join('')}</div>
      <p class="muted sm qr-alt-bilgi">${esc(bicimAd(k.bicim))} · ${esc(zaman(k.t || Date.now()))}${k.sayi > 1 ? ` · ${k.sayi}. kez okundu` : ''}</p>
    </div></div></div>`;
  document.querySelectorAll('[data-ey]').forEach(b => b.onclick = () => eylem(r.ey[+b.dataset.ey], r, k));
  $('#qFav').onclick = () => { k.fav = !k.fav; const L = gecmis(), x = L.find(y => y.id === k.id); if (x) x.fav = k.fav; else if (k.fav) L.unshift(k); gecmisYaz(L); $('#qFav').innerHTML = k.fav ? IC.yildizDolu : IC.yildiz; $('#qFav').classList.toggle('on', k.fav); if (Q.sekme === 'gecmis') gecmisListe(); };
  if (r.urun) urunBilgisi(r.urun);
  if (kapaninca) { const gozle = new MutationObserver(() => { if (!$('#modal').innerHTML) { gozle.disconnect(); kapaninca(); } }); gozle.observe($('#modal'), { childList: true }); }
}
async function eylem([tur, , ad, deger], r) {
  if (tur === 'kopya') { try { await navigator.clipboard.writeText(deger); toast('Kopyalandı'); } catch { toast('Kopyalanamadı'); } return; }
  if (tur === 'ac') {
    if (r.guvenlik?.seviye === 'riskli' && !confirm('Bu bağlantı şüpheli görünüyor. Yine de açılsın mı?')) return;
    window.open(deger, '_blank', 'noopener,noreferrer'); return;
  }
  if (tur === 'link') { location.href = deger; return; }
  if (tur === 'paylas') { try { await navigator.share(/^https?:/.test(deger) ? { url: deger } : { text: deger }); } catch {} return; }
  if (tur === 'vcf') { const f = new File([deger.replace(/\n/g, '\r\n')], 'kisi.vcf', { type: 'text/vcard' }); if (navigator.canShare?.({ files: [f] })) { try { await navigator.share({ files: [f] }); return; } catch (e) { if (e.name === 'AbortError') return; } } indir(f, 'kisi.vcf'); toast('Kişi kartı indirildi; açınca rehbere eklenir'); return; }
  if (tur === 'ics') { indir(new Blob([deger.replace(/\n/g, '\r\n')], { type: 'text/calendar' }), 'etkinlik.ics'); }
}
// Ürün bilgisi: Open Food Facts (ücretsiz, açık veri). Sadece barkod numarası gönderilir.
async function urunBilgisi(kod) {
  const el = $('#qUrun'); if (!el) return;
  if (DEMO) { el.innerHTML = urunKart({ product_name: 'Örnek süzme yoğurt', brands: 'Örnek Marka', quantity: '1 kg', nutriscore_grade: 'b' }); return; }
  el.innerHTML = '<div class="qr-urun yuk">Ürün bilgisi aranıyor…</div>';
  try {
    const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(kod)}.json?fields=product_name,product_name_tr,brands,quantity,image_front_small_url,nutriscore_grade,allergens_tags,categories_tags_tr`);
    const j = await r.json();
    if (!$('#qUrun')) return;
    $('#qUrun').innerHTML = j.status === 1 && j.product ? urunKart(j.product) : '<div class="qr-urun yok">Ürün bilgisi bulunamadı (açık ürün veritabanında kayıtlı değil). Daha çok gıda ürünlerinde bulunur.</div>';
  } catch { if ($('#qUrun')) $('#qUrun').innerHTML = '<div class="qr-urun yok">Ürün bilgisine ulaşılamadı.</div>'; }
}
function urunKart(p) {
  const ns = (p.nutriscore_grade || '').toUpperCase(), alerji = (p.allergens_tags || []).map(a => a.replace(/^\w+:/, '')).slice(0, 6);
  return `<div class="qr-urun">${p.image_front_small_url ? `<img src="${esc(p.image_front_small_url)}" alt="" referrerpolicy="no-referrer">` : `<span class="qr-ic">${IC.urun}</span>`}
    <div><b>${esc(p.product_name_tr || p.product_name || 'Adı yok')}</b><span>${esc([p.brands, p.quantity].filter(Boolean).join(' · '))}</span>
    ${/^[A-E]$/.test(ns) ? `<em class="qr-ns ns-${ns}">Nutri-Score ${ns}</em>` : ''}${alerji.length ? `<i>Alerjenler: ${esc(alerji.join(', '))}</i>` : ''}<small>Kaynak: Open Food Facts</small></div></div>`;
}

/* ═════════ Geçmiş ═════════ */
const FILTRE = [['tum', 'Tümü'], ['fav', 'Favoriler'], ['baglanti', 'Bağlantı'], ['urun', 'Ürün'], ['wifi', 'Wi-Fi'], ['kisi', 'Kişi'], ['olusturulan', 'Oluşturduklarım']];
function gecmisCiz() {
  $('#qGovde').innerHTML = `
  <div class="qr-sayfa">
    <div class="qr-h"><h2>Geçmiş</h2><div class="spacer"></div>
      <button class="btn sm" data-action="q-gecmis-csv">${IC.indir}CSV</button><button class="btn sm" data-action="q-gecmis-temizle">Temizle</button></div>
    <form class="searchbox qr-ara" id="qAraF">${IC.search}<input id="qAra" type="search" placeholder="Geçmişte ara" value="${esc(Q.q)}" autocomplete="off"></form>
    <div class="qr-cipler">${FILTRE.map(([k, n]) => `<button class="qr-cip ${Q.filtre === k ? 'on' : ''}" data-action="q-filtre" data-k="${k}">${n}</button>`).join('')}</div>
    <div class="qr-liste" id="qListe"></div>
    ${ayar('gecmis', true) ? '' : '<p class="muted sm">Geçmiş kaydı ayarlardan kapalı; sadece favoriler saklanıyor.</p>'}
  </div>`;
  $('#qAra').addEventListener('input', e => { Q.q = e.target.value; gecmisListe(); });
  $('#qAraF').addEventListener('submit', e => { e.preventDefault(); e.target.querySelector('input').blur(); });
  gecmisListe();
}
function gecmisListe() {
  const el = $('#qListe'); if (!el) return;
  const q = Q.q.toLocaleLowerCase('tr');
  const L = gecmis().filter(x => {
    if (q && !String(x.metin).toLocaleLowerCase('tr').includes(q) && !(x.not || '').toLocaleLowerCase('tr').includes(q)) return false;
    if (Q.filtre === 'fav') return x.fav; if (Q.filtre === 'olusturulan') return x.kaynak === 'olusturulan';
    if (Q.filtre !== 'tum') { const t = cozumle(x.metin, x.bicim).tur; return Q.filtre === 'urun' ? /urun|isbn|gs1/.test(t) : t === Q.filtre; }
    return true;
  });
  el.innerHTML = L.map(x => { const c = cozumle(x.metin, x.bicim); return `<div class="qr-satir" data-action="q-ac" data-id="${esc(x.id)}">
    <span class="qr-ic">${IC[c.ikon]}</span>
    <div class="qr-satir-m"><b>${esc(kisalt(kisaAd(x), 80))}</b><span>${esc(c.ad)} · ${esc(zaman(x.t))}${x.kaynak === 'olusturulan' ? ' · oluşturuldu' : ''}${x.sayi > 1 ? ` · ${x.sayi} kez` : ''}</span></div>
    ${x.fav ? `<span class="qr-fav">${IC.yildizDolu}</span>` : ''}
    <button class="icon-btn sm" data-action="q-sil" data-id="${esc(x.id)}" title="Sil">${IC.trash}</button></div>`; }).join('')
    || `<div class="qr-bos">${IC.gecmis}<b>${gecmis().length ? 'Sonuç yok' : 'Henüz bir şey okutmadın'}</b><span>Okuttuğun ve oluşturduğun kodlar burada listelenir; sadece bu cihazda saklanır.</span></div>`;
}

/* ═════════ QR oluştur ═════════ */
const OLUS = [['baglanti', 'Bağlantı', 'baglanti'], ['metin', 'Metin', 'metin'], ['wifi', 'Wi-Fi', 'wifi'], ['kisi', 'Kişi', 'kisi'], ['eposta', 'E-posta', 'eposta'], ['sms', 'SMS', 'sms'], ['telefon', 'Telefon', 'telefon'], ['konum', 'Konum', 'konum']];
const ALANLAR = {
  baglanti: [['url', 'Adres', 'https://', 'url']],
  metin: [['metin', 'Metin', 'Yazmak istediğin şey', 'textarea']],
  wifi: [['ssid', 'Ağ adı', 'Ev_WiFi'], ['sifre', 'Şifre', ''], ['tur', 'Güvenlik', 'WPA', 'select:WPA|WEP|nopass'], ['gizli', 'Gizli ağ', '', 'checkbox']],
  kisi: [['ad', 'Ad soyad', ''], ['tel', 'Telefon', '+90 ', 'tel'], ['mail', 'E-posta', '', 'email'], ['kurum', 'Kurum', ''], ['web', 'Web sitesi', 'https://', 'url']],
  eposta: [['kime', 'Kime', '', 'email'], ['konu', 'Konu', ''], ['mesaj', 'Mesaj', '', 'textarea']],
  sms: [['no', 'Numara', '+90 ', 'tel'], ['mesaj', 'Mesaj', '', 'textarea']],
  telefon: [['no', 'Numara', '+90 ', 'tel']],
  konum: [['enlem', 'Enlem', '41.0082'], ['boylam', 'Boylam', '28.9784']]
};
const kac = s => String(s || '').replace(/([\\;,:"])/g, '\\$1');
function icerikYap(t, v) {
  if (t === 'baglanti') { const u = (v.url || '').trim(); return u && !/^[a-z]+:/i.test(u) ? 'https://' + u : u; }
  if (t === 'metin') return v.metin || '';
  if (t === 'wifi') return v.ssid ? `WIFI:T:${v.tur || 'WPA'};S:${kac(v.ssid)};${v.tur === 'nopass' ? '' : `P:${kac(v.sifre)};`}${v.gizli ? 'H:true;' : ''};` : '';
  if (t === 'kisi') return v.ad || v.tel ? ['BEGIN:VCARD', 'VERSION:3.0', `N:${(v.ad || '').split(' ').slice(-1)[0]};${(v.ad || '').split(' ').slice(0, -1).join(' ')}`, `FN:${v.ad || ''}`, v.tel && `TEL;TYPE=CELL:${v.tel}`, v.mail && `EMAIL:${v.mail}`, v.kurum && `ORG:${v.kurum}`, v.web && `URL:${v.web}`, 'END:VCARD'].filter(Boolean).join('\n') : '';
  if (t === 'eposta') return v.kime ? `mailto:${v.kime}` + (v.konu || v.mesaj ? '?' + new URLSearchParams({ ...(v.konu ? { subject: v.konu } : {}), ...(v.mesaj ? { body: v.mesaj } : {}) }).toString().replace(/\+/g, '%20') : '') : '';
  if (t === 'sms') return v.no ? `SMSTO:${v.no.replace(/\s/g, '')}:${v.mesaj || ''}` : '';
  if (t === 'telefon') return v.no ? `tel:${v.no.replace(/\s/g, '')}` : '';
  if (t === 'konum') return v.enlem && v.boylam ? `geo:${v.enlem},${v.boylam}` : '';
  return '';
}
function olusturCiz() {
  const O = Q.olus, sec = ALANLAR[O.tur], tasarim = store.get('qrTasarim', { on: '#111111', arka: '#ffffff', hata: 'M', ortadaki: '' });
  $('#qGovde').innerHTML = `
  <div class="qr-sayfa qr-olus">
    <div class="qr-h"><h2>QR oluştur</h2></div>
    <div class="qr-cipler">${OLUS.map(([k, n, ic]) => `<button class="qr-cip ${O.tur === k ? 'on' : ''}" data-action="q-olus-tur" data-k="${k}">${IC[ic]}${n}</button>`).join('')}</div>
    <div class="qr-olus-izgara">
      <form class="qr-form" id="qOF">${sec.map(([k, ad, ph, tip = 'text']) => tip === 'textarea' ? `<label>${ad}<textarea name="${k}" rows="3" placeholder="${esc(ph)}">${esc(O.v[k] || '')}</textarea></label>`
        : tip.startsWith('select:') ? `<label>${ad}<select name="${k}">${tip.slice(7).split('|').map(o => `<option value="${o}" ${(O.v[k] || 'WPA') === o ? 'selected' : ''}>${o === 'nopass' ? 'Şifresiz' : o}</option>`).join('')}</select></label>`
        : tip === 'checkbox' ? `<label class="qr-kutu"><input type="checkbox" name="${k}" ${O.v[k] ? 'checked' : ''}> ${ad}</label>`
        : `<label>${ad}<input name="${k}" type="${tip}" placeholder="${esc(ph)}" value="${esc(O.v[k] || '')}" autocomplete="off"></label>`).join('')}
        ${O.tur === 'konum' ? `<button type="button" class="btn sm" data-action="q-konumum">${IC.konum}Bulunduğum yer</button>` : ''}
        <details class="qr-tasarim"><summary>Görünüm</summary>
          <div class="qr-tas-ic">
            <label>Kod rengi<input type="color" name="on" value="${tasarim.on}"></label>
            <label>Arka plan<input type="color" name="arka" value="${tasarim.arka}"></label>
            <label>Hata düzeltme<select name="hata">${[['L', 'Düşük'], ['M', 'Orta'], ['Q', 'Yüksek'], ['H', 'En yüksek']].map(([k, n]) => `<option value="${k}" ${tasarim.hata === k ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
            <label>Ortada yazı / emoji<input name="ortadaki" maxlength="4" value="${esc(tasarim.ortadaki)}" placeholder="Ör. ☕"></label>
          </div>
          <p class="muted sm">Koyu renkli kod + açık arka plan en iyi okunur. Ortaya yazı koyarsan hata düzeltme otomatik "En yüksek" olur.</p>
        </details>
      </form>
      <div class="qr-onizleme">
        <canvas id="qCan" width="600" height="600"></canvas>
        <p class="muted sm" id="qBilgi">Bilgileri doldur; kod burada oluşur.</p>
        <div class="qr-eylemler">
          <button class="btn primary" data-action="q-png" disabled>${IC.indir}PNG</button>
          <button class="btn" data-action="q-svg" disabled>${IC.indir}SVG</button>
          ${navigator.share ? `<button class="btn" data-action="q-paylas-qr" disabled>${IC.paylas}Paylaş</button>` : ''}
          <button class="btn" data-action="q-kaydet" disabled>${IC.yildiz}Kaydet</button>
        </div>
      </div>
    </div>
  </div>`;
  const f = $('#qOF');
  f.addEventListener('input', () => { olusturGuncelle(); });
  olusturGuncelle();
}
let qrMatris = null, qrIcerik = '';
async function olusturGuncelle() {
  const f = $('#qOF'); if (!f) return;
  const v = {}; sec_(f).forEach(el => { v[el.name] = el.type === 'checkbox' ? el.checked : el.value; });
  const tas = { on: v.on, arka: v.arka, hata: v.hata, ortadaki: v.ortadaki }; store.set('qrTasarim', tas);
  ['on', 'arka', 'hata', 'ortadaki'].forEach(k => delete v[k]); Q.olus.v = v;
  qrIcerik = icerikYap(Q.olus.tur, v);
  const c = $('#qCan'), g = c.getContext('2d'), dugmeler = document.querySelectorAll('.qr-onizleme .btn');
  dugmeler.forEach(b => b.disabled = !qrIcerik);
  if (!qrIcerik) { g.clearRect(0, 0, c.width, c.height); g.fillStyle = 'rgba(128,128,128,.12)'; g.fillRect(0, 0, c.width, c.height); $('#qBilgi').textContent = 'Bilgileri doldur; kod burada oluşur.'; qrMatris = null; return; }
  try {
    const { Z } = await zxingOkuyucu(), h = new Map();
    h.set(Z.EncodeHintType.CHARACTER_SET, 'UTF-8');
    const seviye = tas.ortadaki ? 'H' : tas.hata;
    const kod = Z.QRCodeEncoder.encode(qrIcerik, Z.QRCodeDecoderErrorCorrectionLevel.fromString(seviye), h), m = kod.getMatrix();
    qrMatris = { n: m.getWidth(), d: (x, y) => m.get(x, y) === 1 };
    qrCiz(c, qrMatris, tas);
    const kontrast = parlaklik(tas.arka) - parlaklik(tas.on);
    $('#qBilgi').textContent = `${qrMatris.n}×${qrMatris.n} modül · ${new TextEncoder().encode(qrIcerik).length} bayt` + (kontrast < 0.35 ? ' · Uyarı: renkler birbirine yakın, okunmayabilir' : '');
  } catch (e) { $('#qBilgi').textContent = 'Oluşturulamadı: ' + (/data too big|too long/i.test(e.message || '') ? 'içerik çok uzun' : e.message); qrMatris = null; dugmeler.forEach(b => b.disabled = true); }
}
const sec_ = f => [...f.querySelectorAll('input[name], textarea[name], select[name]')];
const parlaklik = hex => { const n = parseInt(hex.slice(1), 16); return ((n >> 16 & 255) * 0.299 + (n >> 8 & 255) * 0.587 + (n & 255) * 0.114) / 255; };
function qrCiz(c, M, tas, boyut = c.width) {
  const g = c.getContext('2d'), kenar = 4, n = M.n + kenar * 2, k = boyut / n;
  c.width = c.height = boyut;
  g.fillStyle = tas.arka; g.fillRect(0, 0, boyut, boyut); g.fillStyle = tas.on;
  for (let y = 0; y < M.n; y++) for (let x = 0; x < M.n; x++) if (M.d(x, y)) g.fillRect(Math.floor((x + kenar) * k), Math.floor((y + kenar) * k), Math.ceil(k), Math.ceil(k));
  if (tas.ortadaki) {
    const r = boyut * 0.11; g.fillStyle = tas.arka; g.beginPath(); g.arc(boyut / 2, boyut / 2, r, 0, 7); g.fill();
    g.fillStyle = tas.on; g.font = `bold ${r * (tas.ortadaki.length > 2 ? 0.7 : 1.1)}px -apple-system, "Segoe UI", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(tas.ortadaki, boyut / 2, boyut / 2 + r * 0.06);
  }
}
function qrSvg(M, tas) {
  const kenar = 4, n = M.n + kenar * 2; let p = '';
  for (let y = 0; y < M.n; y++) for (let x = 0; x < M.n; x++) if (M.d(x, y)) p += `M${x + kenar} ${y + kenar}h1v1h-1z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges"><rect width="${n}" height="${n}" fill="${tas.arka}"/><path d="${p}" fill="${tas.on}"/>${tas.ortadaki ? `<circle cx="${n / 2}" cy="${n / 2}" r="${n * 0.11}" fill="${tas.arka}"/><text x="${n / 2}" y="${n / 2}" font-size="${n * 0.12}" text-anchor="middle" dominant-baseline="central" fill="${tas.on}" font-family="sans-serif" font-weight="bold">${esc(tas.ortadaki)}</text>` : ''}</svg>`;
}
async function qrPng() { const c = document.createElement('canvas'); qrCiz(c, qrMatris, store.get('qrTasarim'), 1200); return new Promise(r => c.toBlob(r, 'image/png')); }
const qrAdi = () => 'qr-' + (OLUS.find(o => o[0] === Q.olus.tur)?.[1] || 'kod').toLocaleLowerCase('tr').replace(/[^a-z0-9ğüşıöç]+/g, '-');

/* ═════════ Ayarlar ═════════ */
function ayarAc() {
  const t = store.get('theme', 'light');
  const sw = (k, d, ad, acik) => `<div class="set-row"><div><b>${ad}</b><span>${acik}</span></div><button type="button" class="switch ${ayar(k, d) ? 'on' : ''}" data-ayar="${k}" data-d="${d}"><i></i></button></div>`;
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet settings"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Ayarlar</h3></header>
    <div class="set-body">
      <section><h4>Görünüm</h4><div class="seg yon-seg">${[['light', 'Cam'], ['dark', 'Koyu'], ['auto', 'Otomatik'], ['flat', 'Düz']].map(([k, n]) => `<button class="${t === k ? 'on' : ''}" data-action="q-tema" data-t="${k}">${n}</button>`).join('')}</div></section>
      <section><h4>Okuma</h4>
        ${sw('ses', true, 'Ses', 'Kod okununca kısa bir bip sesi.')}
        ${sw('titresim', true, 'Titreşim', 'Kod okununca telefon kısa titrer (destekleyen cihazlarda).')}
        ${sw('gecmis', true, 'Geçmişi kaydet', 'Okuttuğun kodlar bu cihazda saklanır. Kapalıyken sadece favoriler saklanır.')}
        ${sw('urunBilgi', true, 'Ürün bilgisini getir', 'Ürün barkodlarında ad ve içerik bilgisini Open Food Facts\'ten (açık, ücretsiz veritabanı) sorar. Sadece barkod numarası gönderilir.')}
      </section>
      <section><h4>Gizlilik</h4><p class="muted sm">QR giriş istemez. Kamera görüntüsü bu cihazda işlenir, hiçbir yere gönderilmez. Bağlantıların güvenlik kontrolü de bu cihazda yapılır.</p></section>
      <section><h4>Uygulama</h4>${typeof aboutRow === 'function' ? aboutRow() : ''}${typeof feedbackRow === 'function' && store.get('auth') && S.email ? feedbackRow() : ''}
        <p class="muted sm">Kod okuma ve oluşturma ZXing ile yapılır (açık kaynak, Apache 2.0). <a href="qr-lib/LISANS.txt" target="_blank" rel="noopener">Lisans</a></p></section>
    </div></div></div>`;
  document.querySelectorAll('[data-ayar]').forEach(b => b.onclick = () => { const k = b.dataset.ayar, v = !ayar(k, b.dataset.d === 'true'); ayarYaz(k, v); b.classList.toggle('on', v); });
}

/* ═════════ Örnek mod ═════════ */
function ornekGecmis() {
  const t = Date.now();
  gecmisYaz([
    { id: qId(), metin: 'https://www.turkiye.gov.tr', bicim: 'qr_code', t: t - 3600e3, kaynak: 'kamera', fav: true, sayi: 1 },
    { id: qId(), metin: 'WIFI:T:WPA;S:Kafe_Misafir;P:kahve2026;;', bicim: 'qr_code', t: t - 5 * 3600e3, kaynak: 'kamera', sayi: 2 },
    { id: qId(), metin: '8690504000013', bicim: 'ean_13', t: t - 26 * 3600e3, kaynak: 'kamera', sayi: 1 },
    { id: qId(), metin: '\u001d0108699546030014172712311021A45B\u001d21X9K2M7', bicim: 'data_matrix', t: t - 50 * 3600e3, kaynak: 'kamera', sayi: 1 },
    { id: qId(), metin: 'http://garanti-bonus-puan.xyz/giris', bicim: 'qr_code', t: t - 3 * 864e5, kaynak: 'resim', sayi: 1 },
    { id: qId(), metin: 'BEGIN:VCARD\nVERSION:3.0\nFN:Ayşe Yılmaz\nTEL:+90 532 000 00 00\nEMAIL:ayse@ornek.com\nORG:Örnek A.Ş.\nEND:VCARD', bicim: 'qr_code', t: t - 5 * 864e5, kaynak: 'kamera', sayi: 1 }
  ]);
}

/* ═════════ Olaylar ═════════ */
Object.assign(ACTIONS, {
  'q-sekme': el => { Q.sekme = el.dataset.k; sekmeCiz(); },
  'q-ayar': () => ayarAc(), settings: () => ayarAc(),
  'q-tema': el => { store.set('theme', el.dataset.t); applyTheme(el.dataset.t); ayarAc(); },
  'q-resim': () => resimdenOku(),
  'q-fener': async el => { const K = Q.kamera; if (!K?.iz) return; K.fener = !K.fener; try { await K.iz.applyConstraints({ advanced: [{ torch: K.fener }] }); el.classList.toggle('on', K.fener); } catch { toast('Fener açılamadı'); } },
  'q-toplu': el => { Q.toplu = !Q.toplu; store.set('qrTopluAcik', Q.toplu); el.classList.toggle('on', Q.toplu); $('#qToplu').hidden = !Q.toplu; if (Q.toplu) topluCiz(); toast(Q.toplu ? 'Toplu okuma: kodları art arda okut, liste aşağıda birikir' : 'Tek tek okuma'); },
  'q-adet': el => { const L = topluListe(), x = L[+el.dataset.i]; if (!x) return; x.adet += +el.dataset.d; if (x.adet <= 0) L.splice(+el.dataset.i, 1); topluYaz(L); topluCiz(); },
  'q-toplu-csv': () => csvIndir([['kod', 'tur', 'adet', 'son_okuma'], ...topluListe().map(x => [x.metin, bicimAd(x.bicim), x.adet, new Date(x.t).toLocaleString('tr-TR')])], 'toplu-okuma.csv'),
  'q-toplu-temizle': () => { if (!confirm('Toplu okuma listesi temizlensin mi?')) return; topluYaz([]); topluCiz(); },
  'q-filtre': el => { Q.filtre = el.dataset.k; document.querySelectorAll('.qr-cip[data-action="q-filtre"]').forEach(b => b.classList.toggle('on', b === el)); gecmisListe(); },
  'q-ac': (el, e) => { if (e?.target.closest('[data-action="q-sil"]')) return; const k = gecmis().find(x => x.id === el.dataset.id); if (k) sonucGoster(k); },
  'q-sil': (el, e) => { e?.stopPropagation(); const L = gecmis(), i = L.findIndex(x => x.id === el.dataset.id); if (i < 0) return; const [x] = L.splice(i, 1); gecmisYaz(L); gecmisListe(); toast('Silindi', [['Geri al', () => { const M = gecmis(); M.splice(i, 0, x); gecmisYaz(M); gecmisListe(); }]]); },
  'q-gecmis-csv': () => csvIndir([['tarih', 'tur', 'bicim', 'icerik', 'favori'], ...gecmis().map(x => [new Date(x.t).toLocaleString('tr-TR'), cozumle(x.metin, x.bicim).ad, bicimAd(x.bicim), x.metin, x.fav ? 'evet' : ''])], 'qr-gecmis.csv'),
  'q-gecmis-temizle': () => { const fav = gecmis().filter(x => x.fav); if (!confirm(`Geçmiş temizlensin mi?${fav.length ? ` (${fav.length} favori kalır)` : ''}`)) return; gecmisYaz(fav); gecmisListe(); },
  'q-olus-tur': el => { Q.olus = { tur: el.dataset.k, v: {} }; olusturCiz(); },
  'q-konumum': () => navigator.geolocation?.getCurrentPosition(p => { const f = $('#qOF'); f.enlem.value = p.coords.latitude.toFixed(6); f.boylam.value = p.coords.longitude.toFixed(6); olusturGuncelle(); }, () => toast('Konum alınamadı'), { enableHighAccuracy: true, timeout: 10000 }),
  'q-png': async () => { if (qrMatris) indir(await qrPng(), qrAdi() + '.png'); },
  'q-svg': () => { if (qrMatris) indir(new Blob([qrSvg(qrMatris, store.get('qrTasarim'))], { type: 'image/svg+xml' }), qrAdi() + '.svg'); },
  'q-paylas-qr': async () => { if (!qrMatris) return; const f = new File([await qrPng()], qrAdi() + '.png', { type: 'image/png' }); try { await navigator.share({ files: [f] }); } catch {} },
  'q-kaydet': () => { if (!qrIcerik) return; const L = gecmis(); L.unshift({ id: qId(), metin: qrIcerik, bicim: 'qr_code', t: Date.now(), kaynak: 'olusturulan', fav: true, sayi: 0 }); gecmisYaz(L); toast('Kaydedildi · Geçmiş > Oluşturduklarım'); }
});
