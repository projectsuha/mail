/* ───────────── Pusula ─────────────
   Pusula, kıble, konum (koordinat, yükseklik, hız), kayıtlı noktalara yol gösterme, güneş ve ay. (Su terazisi ve ölçümler: Ölçüm uygulaması)
   Giriş gerekmez; hiçbir veri dışarı gönderilmez. Konum ve yön telefonun kendi algılayıcılarından okunur. */
'use strict';

window.APP_NAME = 'Pusula';
window.APP_ICON = 'pusula-apple.png?v=8';
window.APP_LEAD = 'Pusula, kıble, konum, güneş ve ay. Ücretsiz, reklamsız.';

const PSVG = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
Object.assign(IC, {
  pusula: PSVG('<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.2 13 13l-3.8 1.8L11 11z" fill="currentColor"/>'),
  kible: PSVG('<path d="M5 9.5 12 6l7 3.5v8L12 21l-7-3.5z"/><path d="M5 9.5 12 13l7-3.5M12 13v8"/><path d="M5.6 12.3 12 15.5l6.4-3.2"/>'),
  konum: PSVG('<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>'),
  kilit: PSVG('<rect x="5.5" y="10.5" width="13" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>'),
  kopya: PSVG('<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/>'),
  paylas: PSVG('<path d="M12 15V4M8 7.5 12 3.5l4 4"/><path d="M6.5 11H5.5v9h13v-9h-1"/>'),
  harita: PSVG('<path d="M9 4.5 3.5 6.5v13L9 17.5l6 2 5.5-2v-13L15 6.5z"/><path d="M9 4.5v13M15 6.5v13"/>'),
  gunes: PSVG('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>'),
  ay: PSVG('<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/>'),
  hedef: PSVG('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4"/>'),
  yonla: PSVG('<path d="M12 3 19 20l-7-4-7 4z"/>')
});

const PZ = {
  sekme: store.get('pusulaSekme', 'pusula'),
  ayar: Object.assign({ kuzey: 'gercek', sapmaElle: null, titresim: true }, store.get('pusulaAyar', {})),
  noktalar: store.get('pusulaNoktalar', []),
  kilit: null,          // kilitlenen yön (derece)
  hedef: null,          // yol gösterilen nokta id
  konum: null,          // { lat, lon, dog, yuk, hiz, yon, zaman, kaynak: 'gps' | 'son' | 'sehir' }
  ham: null,            // algılayıcıdan gelen manyetik yön
  dogruluk: null,       // iOS pusula doğruluğu (derece)
  yonKaynak: null,      // 'mutlak' | 'ios' | null
  sonYon: 0
};
const kaydet = k => store.set({ ayar: 'pusulaAyar', noktalar: 'pusulaNoktalar' }[k], PZ[k]);
const sid = () => Math.random().toString(36).slice(2, 9);
const yerel = () => window.SUHA_YEREL || {};
const R = Math.PI / 180;
const mod = (a, n = 360) => ((a % n) + n) % n;
const fark = (a, b) => { const d = mod(b - a); return d > 180 ? d - 360 : d; };   // a'dan b'ye en kısa dönüş (−180..180)
const sayi = (n, b = 0) => Number(n).toLocaleString('tr-TR', { minimumFractionDigits: b, maximumFractionDigits: b });
const titret = d => { if (PZ.ayar.titresim) try { navigator.vibrate?.(d); } catch {} };

/* ═════════ Yön adları ═════════ */
const YON16 = ['K', 'KKD', 'KD', 'DKD', 'D', 'DGD', 'GD', 'GGD', 'G', 'GGB', 'GB', 'BGB', 'B', 'BKB', 'KB', 'KKB'];
const YON8AD = ['Kuzey', 'Kuzeydoğu', 'Doğu', 'Güneydoğu', 'Güney', 'Güneybatı', 'Batı', 'Kuzeybatı'];
const yonKisa = d => YON16[Math.round(mod(d) / 22.5) % 16];
const yonAd = d => YON8AD[Math.round(mod(d) / 45) % 8];

/* ═════════ Coğrafya ═════════ */
const KABE = { lat: 21.422487, lon: 39.826206 };
function kerteriz(a, b) {   // a'dan b'ye başlangıç yönü (gerçek kuzeye göre)
  const f1 = a.lat * R, f2 = b.lat * R, dl = (b.lon - a.lon) * R;
  return mod(Math.atan2(Math.sin(dl) * Math.cos(f2), Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl)) / R);
}
function mesafe(a, b) {     // metre
  const f1 = a.lat * R, f2 = b.lat * R, df = f2 - f1, dl = (b.lon - a.lon) * R;
  const h = Math.sin(df / 2) ** 2 + Math.cos(f1) * Math.cos(f2) * Math.sin(dl / 2) ** 2;
  return 2 * 6371008.8 * Math.asin(Math.min(1, Math.sqrt(h)));
}
const mesafeYaz = m => m < 1000 ? sayi(Math.round(m)) + ' m' : m < 100000 ? sayi(m / 1000, 1) + ' km' : sayi(Math.round(m / 1000)) + ' km';
function dms(d, poz, neg) {
  const a = Math.abs(d), g = Math.floor(a), dk = Math.floor((a - g) * 60), sn = ((a - g) * 60 - dk) * 60;
  return `${g}° ${dk}′ ${sayi(sn, 1)}″ ${d >= 0 ? poz : neg}`;
}
// Manyetik sapma: Türkiye ve yakın çevresi için yaklaşık değer (2025, yılda ~0,1° artar). Başka yerde elle girilir.
function sapmaTahmin(k) {
  if (!k || k.lat < 34 || k.lat > 44 || k.lon < 24 || k.lon > 46) return null;
  const yil = new Date().getFullYear() + new Date().getMonth() / 12 - 2025;
  return 5.93 + 0.064 * (k.lon - 35) + 0.289 * (k.lat - 39) + 0.1 * yil;
}
function sapma() {
  if (PZ.ayar.sapmaElle != null && isFinite(PZ.ayar.sapmaElle)) return { d: +PZ.ayar.sapmaElle, kaynak: 'elle' };
  const t = sapmaTahmin(PZ.konum);
  return t == null ? { d: 0, kaynak: 'yok' } : { d: t, kaynak: 'oto' };
}
// Ekranda kullanılan yön: gerçek kuzey seçiliyse manyetik yöne sapma eklenir
const gosterilenYon = () => PZ.ham == null ? null : mod(PZ.ham + (PZ.ayar.kuzey === 'gercek' ? sapma().d : 0));
// Gerçek kuzeye göre hesaplanmış bir yönü ekrandaki kuzeye çevir
const ekranAcisi = gercek => mod(gercek - (PZ.ayar.kuzey === 'gercek' ? 0 : sapma().d));

const SEHIRLER = [
  ['İstanbul', 41.0082, 28.9784], ['Ankara', 39.9334, 32.8597], ['İzmir', 38.4237, 27.1428], ['Bursa', 40.1885, 29.061], ['Antalya', 36.8969, 30.7133],
  ['Adana', 37.0, 35.3213], ['Konya', 37.8746, 32.4932], ['Gaziantep', 37.0662, 37.3833], ['Şanlıurfa', 37.1591, 38.7969], ['Kocaeli', 40.7654, 29.9408],
  ['Mersin', 36.8121, 34.6415], ['Diyarbakır', 37.9144, 40.2306], ['Kayseri', 38.7205, 35.4826], ['Eskişehir', 39.7767, 30.5206], ['Samsun', 41.2867, 36.33],
  ['Denizli', 37.7765, 29.0864], ['Malatya', 38.3552, 38.3095], ['Trabzon', 41.0027, 39.7168], ['Erzurum', 39.9043, 41.2679], ['Van', 38.5012, 43.373],
  ['Sakarya', 40.7569, 30.3781], ['Manisa', 38.6191, 27.4289], ['Kahramanmaraş', 37.5858, 36.9371], ['Hatay', 36.2025, 36.1606], ['Balıkesir', 39.6484, 27.8826],
  ['Tekirdağ', 40.9781, 27.5115], ['Muğla', 37.2153, 28.3636], ['Elazığ', 38.681, 39.2264], ['Sivas', 39.7477, 37.0179], ['Edirne', 41.6772, 26.5557],
  ['Çanakkale', 40.1553, 26.4142], ['Rize', 41.0201, 40.5234], ['Lefkoşa', 35.1856, 33.3823], ['Bakü', 40.4093, 49.8671], ['Berlin', 52.52, 13.405],
  ['Köln', 50.9375, 6.9603], ['Amsterdam', 52.3676, 4.9041], ['Londra', 51.5074, -0.1278], ['Paris', 48.8566, 2.3522], ['Viyana', 48.2082, 16.3738], ['New York', 40.7128, -74.006]
];

/* ═════════ Güneş ve ay (SunCalc yöntemi, cihazda hesaplanır) ═════════ */
const GA = (() => {
  const gun = 864e5, J1970 = 2440588, J2000 = 2451545, e = R * 23.4397;
  const gunler = t => t / gun - 0.5 + J1970 - J2000;
  const sag = (l, b) => Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l));
  const dek = (l, b) => Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l));
  const az = (H, f, d) => Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(f) - Math.tan(d) * Math.cos(f));
  const yuk = (H, f, d) => Math.asin(Math.sin(f) * Math.sin(d) + Math.cos(f) * Math.cos(d) * Math.cos(H));
  const yildiz = (d, lw) => R * (280.16 + 360.9856235 * d) - lw;
  function gunesK(d) {
    const M = R * (357.5291 + 0.98560028 * d), C = R * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
    const L = M + C + R * 102.9372 + Math.PI;
    return { dek: dek(L, 0), sag: sag(L, 0) };
  }
  function ayK(d) {
    const L = R * (218.316 + 13.176396 * d), M = R * (134.963 + 13.064993 * d), F = R * (93.272 + 13.22935 * d);
    const l = L + R * 6.289 * Math.sin(M), b = R * 5.128 * Math.sin(F), uz = 385001 - 20905 * Math.cos(M);
    return { sag: sag(l, b), dek: dek(l, b), uz };
  }
  const konumu = (k, t, ay) => {
    const lw = R * -k.lon, f = R * k.lat, d = gunler(t), c = ay ? ayK(d) : gunesK(d), H = yildiz(d, lw) - c.sag;
    let h = yuk(H, f, c.dek);
    if (ay) h += R * 0.017 / Math.tan(h + R * 10.26 / (h / R + 5.10));   // kırılma
    return { yon: mod(az(H, f, c.dek) / R + 180), yuk: h / R };
  };
  function evre(t) {
    const d = gunler(t), s = gunesK(d), m = ayK(d), sd = 149598000;
    const fi = Math.acos(Math.sin(s.dek) * Math.sin(m.dek) + Math.cos(s.dek) * Math.cos(m.dek) * Math.cos(s.sag - m.sag));
    const inc = Math.atan2(sd * Math.sin(fi), m.uz - sd * Math.cos(fi));
    const aci = Math.atan2(Math.cos(s.dek) * Math.sin(s.sag - m.sag), Math.sin(s.dek) * Math.cos(m.dek) - Math.cos(s.dek) * Math.sin(m.dek) * Math.cos(s.sag - m.sag));
    return { oran: (1 + Math.cos(inc)) / 2, evre: 0.5 + 0.5 * inc * (aci < 0 ? -1 : 1) / Math.PI };
  }
  // Doğuş/batış: günü 5 dakikalık adımlarla tarar (yerel gece yarısından gece yarısına)
  function dogusBatis(k, gunBas, ay) {
    const esik = ay ? 0.133 : -0.833; let dogus = null, batis = null, once = konumu(k, gunBas, ay).yuk - esik, hepUst = once > 0, hepAlt = once < 0;
    for (let i = 1; i <= 288; i++) {
      const t = gunBas + i * 300000, h = konumu(k, t, ay).yuk - esik;
      if (h > 0) hepAlt = false; else hepUst = false;
      if (once <= 0 && h > 0 && !dogus) dogus = t - 300000 * h / (h - once);
      if (once > 0 && h <= 0 && !batis) batis = t - 300000 * h / (h - once);
      once = h;
    }
    return { dogus, batis, hepUst, hepAlt };
  }
  return { gunes: (k, t) => konumu(k, t, false), ay: (k, t) => konumu(k, t, true), evre, dogusBatis };
})();
function evreAd(e) {
  const p = e.evre;
  return p < 0.03 || p > 0.97 ? 'Yeni ay' : p < 0.22 ? 'Hilal (büyüyen)' : p < 0.28 ? 'İlk dördün' : p < 0.47 ? 'Şişkin ay (büyüyen)' : p < 0.53 ? 'Dolunay' : p < 0.72 ? 'Şişkin ay (küçülen)' : p < 0.78 ? 'Son dördün' : 'Hilal (küçülen)';
}
const saatYaz = t => t ? new Date(t).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '—';

/* ═════════ Algılayıcılar: yön ═════════ */
let sx = 0, sy = 0, yonVar = false, sonOlay = 0;
function ekranDonus() { return (screen.orientation && typeof screen.orientation.angle === 'number') ? screen.orientation.angle : (window.orientation || 0); }
function yonGeldi(manyetik) {
  if (!isFinite(manyetik)) return;
  const d = mod(manyetik + ekranDonus());
  // Titremesin: açıları birim çember üzerinde yumuşat (359° → 1° geçişinde zıplamaz)
  const k = yonVar ? 0.18 : 1;
  sx = sx * (1 - k) + Math.cos(d * R) * k; sy = sy * (1 - k) + Math.sin(d * R) * k;
  PZ.ham = mod(Math.atan2(sy, sx) / R); yonVar = true; sonOlay = Date.now();
}
window.addEventListener('deviceorientationabsolute', e => { if (e.alpha == null) return; PZ.yonKaynak = 'mutlak'; yonGeldi(360 - e.alpha); }, true);
window.addEventListener('deviceorientation', e => {
  if (e.webkitCompassHeading != null && e.webkitCompassHeading >= 0) { PZ.yonKaynak = 'ios'; PZ.dogruluk = e.webkitCompassAccuracy; yonGeldi(e.webkitCompassHeading); }
  else if (e.absolute && e.alpha != null && PZ.yonKaynak !== 'mutlak') { PZ.yonKaynak = 'mutlak'; yonGeldi(360 - e.alpha); }
}, true);
const iosIzinGerek = () => typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function' && !store.get('pusulaIosIzin', false);
async function iosIzin() {
  try { const c = await DeviceOrientationEvent.requestPermission(); if (c === 'granted') { store.set('pusulaIosIzin', true); toast('Pusula açıldı'); } else toast('Hareket izni verilmedi; pusula çalışmaz'); } catch { toast('İzin istenemedi'); }
  ciz();
}

/* ═════════ Konum ═════════ */
let izleme = null;
function konumBaslat(sor) {
  if (DEMO) return;
  if (!navigator.geolocation) { if (sor) toast('Bu cihaz konum vermiyor'); return; }
  if (izleme != null) return;
  izleme = navigator.geolocation.watchPosition(p => {
    const c = p.coords;
    PZ.konum = { lat: c.latitude, lon: c.longitude, dog: c.accuracy, yuk: c.altitude, yukDog: c.altitudeAccuracy, hiz: c.speed, yon: c.heading, zaman: p.timestamp, kaynak: 'gps' };
    store.set('pusulaSonKonum', { lat: c.latitude, lon: c.longitude, zaman: p.timestamp });
    store.set('pusulaKonumIzin', true);
    konumTazele();
  }, err => {
    izleme && navigator.geolocation.clearWatch(izleme); izleme = null;
    if (sor || err.code === 1) toast(err.code === 1 ? 'Konum izni verilmedi. Kıble için şehir seçebilirsin.' : 'Konum alınamadı');
    if (err.code === 1) store.set('pusulaKonumIzin', false);
    konumTazele();
  }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 30000 });
}
function sehirSecildi(i) {
  const [ad, lat, lon] = SEHIRLER[i];
  PZ.konum = { lat, lon, dog: null, yuk: null, hiz: null, zaman: Date.now(), kaynak: 'sehir', ad };
  store.set('pusulaSehir', i); closeModal(); ciz();
}

/* ═════════ Kabuk ═════════ */
function kabuk() {
  const S = [['pusula', 'Pusula', 'pusula'], ['kible', 'Kıble', 'kible'], ['konum', 'Konum', 'konum']];
  $('#app').innerHTML = `
  <div class="pz-kabuk">
    <header class="pz-bas">
      <div class="brand-mark sm">${IC.pusula}</div><h1>Pusula</h1>
      <nav class="seg pz-ust-sekme">${S.map(([k, n]) => `<button data-action="p-sekme" data-k="${k}">${n}</button>`).join('')}</nav>
      <div class="spacer"></div>
      <button class="icon-btn" data-action="p-ayar" title="Ayarlar">${IC.gear}</button>
    </header>
    <main class="pz-govde" id="pGovde"></main>
    <nav class="pz-alt-sekme">${S.map(([k, n, ic]) => `<button data-action="p-sekme" data-k="${k}">${IC[ic]}<span>${n}</span></button>`).join('')}</nav>
  </div>`;
}
function ciz() {
  document.querySelectorAll('[data-action="p-sekme"]').forEach(b => b.classList.toggle('on', b.dataset.k === PZ.sekme));
  document.body.dataset.psekme = PZ.sekme;
  ({ pusula: pusulaCiz, kible: kibleCiz, konum: konumCiz }[PZ.sekme] || pusulaCiz)();
}

// Kadran: dönen gül (rotate) + sabit üst işaret. İşaretler gülün üstünde, kendi yönlerinde durur.
function kadran(isaretler = '') {
  const cizgi = Array.from({ length: 72 }, (_, i) => {
    const a = i * 5, uzun = a % 30 === 0, orta = a % 10 === 0;
    return `<line x1="150" y1="${uzun ? 22 : orta ? 25 : 27}" x2="150" y2="35" transform="rotate(${a} 150 150)" class="${uzun ? 'uz' : orta ? 'or' : ''}"/>`;
  }).join('');
  const sayilar = Array.from({ length: 12 }, (_, i) => i * 30).filter(a => a % 90).map(a => `<text x="150" y="52" transform="rotate(${a} 150 150)" class="pz-derece">${a}</text>`).join('');
  const harfler = [['K', 0], ['D', 90], ['G', 180], ['B', 270]].map(([h, a]) => `<text x="150" y="58" transform="rotate(${a} 150 150)" class="pz-harf ${h === 'K' ? 'kuzey' : ''}">${h}</text>`).join('');
  const ara = [['KD', 45], ['GD', 135], ['GB', 225], ['KB', 315]].map(([h, a]) => `<text x="150" y="56" transform="rotate(${a} 150 150)" class="pz-ara">${h}</text>`).join('');
  return `<svg class="pz-kadran" viewBox="0 0 300 300" aria-hidden="true">
    <circle cx="150" cy="150" r="146" class="pz-dis"/>
    <g id="pGul">${cizgi}${sayilar}${harfler}${ara}
      <path d="M150 64 158 150 150 158 142 150Z" class="pz-igne-k"/><path d="M150 236 158 150 150 142 142 150Z" class="pz-igne-g"/>
      <g id="pIsaret">${isaretler}</g></g>
    <path d="M150 6 158 20H142Z" class="pz-ust"/><circle cx="150" cy="150" r="5" class="pz-orta"/>
  </svg>`;
}
function isaret(aci, sinif, icerik, r = 112) {   // gülün üzerinde, verilen açıda bir rozet
  const x = 150 + r * Math.sin(aci * R), y = 150 - r * Math.cos(aci * R);
  return `<g class="pz-isaret ${sinif}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" data-aci="${aci}"><circle r="13"/><g transform="rotate(0)" class="dik">${icerik}</g></g>`;
}
const ISARET_IC = {
  kible: '<path d="M-6-2 0-5l6 3v6L0 7l-6-3z" fill="currentColor"/>',
  gunes: '<circle r="5" fill="currentColor"/>',
  ay: '<path d="M4 3A6 6 0 0 1-3-5a6 6 0 1 0 7 8z" fill="currentColor"/>',
  hedef: '<circle r="5" fill="none" stroke="currentColor" stroke-width="2"/><circle r="1.6" fill="currentColor"/>',
  kilit: '<path d="M0-6 5 5 0 2.5-5 5z" fill="currentColor"/>'
};
function isaretler() {
  const k = PZ.konum, t = Date.now(), l = [];
  if (k) {
    l.push(isaret(ekranAcisi(kerteriz(k, KABE)), 'kible', ISARET_IC.kible));
    const g = GA.gunes(k, t); if (g.yuk > -1) l.push(isaret(ekranAcisi(g.yon), 'gunes', ISARET_IC.gunes));
    const a = GA.ay(k, t); if (a.yuk > -1) l.push(isaret(ekranAcisi(a.yon), 'ay', ISARET_IC.ay));
    const h = PZ.noktalar.find(n => n.id === PZ.hedef); if (h) l.push(isaret(ekranAcisi(kerteriz(k, h)), 'hedef', ISARET_IC.hedef));
  }
  if (PZ.kilit != null) l.push(isaret(PZ.kilit, 'kilit', ISARET_IC.kilit, 128));
  return l.join('');
}

/* ═════════ Pusula ═════════ */
function durumNotu() {
  if (iosIzinGerek()) return `<div class="pz-not">${IC.pusula}<span>Pusulanın çalışması için telefonun hareket bilgisine izin ver.</span><button class="btn primary sm" data-action="p-ios-izin">Pusulayı başlat</button></div>`;
  if (!yonVar && Date.now() - acilis > 2500) return `<div class="pz-not">${IC.alert || IC.pusula}<span>Bu cihazda pusula algılayıcısı bulunamadı (bilgisayarlarda olmaz). Kuzey yukarıda sabit gösteriliyor; kıble, güneş ve ay yönleri yine doğru.</span></div>`;
  return '';
}
function pusulaCiz() {
  $('#pGovde').innerHTML = `
  <div class="pz-pusula">
    <div id="pNot">${durumNotu()}</div>
    <div class="pz-kadran-kutu">${kadran(isaretler())}</div>
    <div class="pz-yon"><b id="pDerece">—</b><span id="pYonAd"></span></div>
    <div class="pz-alt" id="pAlt"></div>
    <div class="pz-tuslar">
      <button class="btn" data-action="p-kilit">${IC.kilit}<span id="pKilitYazi">${PZ.kilit == null ? 'Yönü kilitle' : 'Kilidi aç'}</span></button>
      <button class="btn" data-action="p-kalibre">${IC.sifirla || IC.refresh}Ayarla</button>
    </div>
    <div class="pz-ipucu" id="pIpucu"></div>
  </div>`;
  pusulaTazele(true);
}
let gorunenAci = 0;
function gulDondur(yon, ani) {
  // Kısa yoldan dön (359 → 1 arasında tam tur atmasın)
  const hedef = -yon;
  gorunenAci = ani ? hedef : gorunenAci + fark(gorunenAci, hedef);
  const g = $('#pGul'); if (!g) return;
  g.setAttribute('transform', `rotate(${gorunenAci.toFixed(2)} 150 150)`);
  // İşaret simgeleri dik dursun
  g.querySelectorAll('.pz-isaret .dik').forEach(d => d.setAttribute('transform', `rotate(${(-gorunenAci).toFixed(2)})`));
}
function pusulaTazele(ani) {
  const y = gosterilenYon(), s = sapma();
  gulDondur(y ?? 0, ani);
  const der = $('#pDerece'); if (!der) return;
  der.textContent = y == null ? '—' : Math.round(y) % 360 + '°';
  $('#pYonAd').textContent = y == null ? 'Kuzey yukarıda' : `${yonKisa(y)} · ${yonAd(y)}`;
  const k = PZ.konum, parca = [];
  parca.push(PZ.ayar.kuzey === 'gercek' ? (s.kaynak === 'yok' ? 'Manyetik kuzey (sapma bilinmiyor)' : `Gerçek kuzey · sapma ${s.d >= 0 ? '+' : ''}${sayi(s.d, 1)}°`) : 'Manyetik kuzey');
  if (k) parca.push(`${sayi(k.lat, 4)}, ${sayi(k.lon, 4)}`);
  if (k?.yuk != null) parca.push(`${sayi(Math.round(k.yuk))} m yükseklik`);
  $('#pAlt').textContent = parca.join(' · ');
  const ip = [];
  if (PZ.kilit != null && y != null) { const d = fark(y, PZ.kilit); ip.push(Math.abs(d) < 3 ? `<b class="iyi">Kilitli yöndesin (${Math.round(PZ.kilit)}°)</b>` : `Kilitli yön ${Math.round(PZ.kilit)}° · <b>${Math.round(Math.abs(d))}° ${d > 0 ? 'sağa' : 'sola'}</b> dön`); }
  const h = k && PZ.noktalar.find(n => n.id === PZ.hedef);
  if (h) { const yon = kerteriz(k, h), d = y == null ? null : fark(y, ekranAcisi(yon)); ip.push(`<span class="pz-hedef-yazi">${IC.hedef}<b>${esc(h.ad)}</b> · ${mesafeYaz(mesafe(k, h))} · ${Math.round(yon)}° ${yonKisa(yon)}${d == null ? '' : Math.abs(d) < 8 ? ' · <b class="iyi">tam önünde</b>' : ` · ${Math.round(Math.abs(d))}° ${d > 0 ? 'sağda' : 'solda'}`}</span><button class="btn sm" data-action="p-hedef-bitir">Bitir</button>`); }
  if (PZ.dogruluk != null && (PZ.dogruluk < 0 || PZ.dogruluk > 20)) ip.push('Pusula hassas değil: telefonu havada 8 çizerek birkaç kez salla.');
  const el = $('#pIpucu'), html = ip.map(x => `<div>${x}</div>`).join('');
  if (el.dataset.html !== html) { el.innerHTML = html; el.dataset.html = html; }
}

/* ═════════ Kıble ═════════ */
function kibleCiz() {
  const k = PZ.konum;
  const sehirTus = `<button class="btn sm" data-action="p-sehir">${k?.kaynak === 'sehir' ? 'Şehri değiştir' : 'Şehir seç'}</button>`;
  $('#pGovde').innerHTML = `
  <div class="pz-pusula pz-kible">
    <div id="pNot">${durumNotu()}</div>
    ${k ? '' : `<div class="pz-not">${IC.konum}<span>Kıble yönü için konumun gerekiyor.</span><button class="btn primary sm" data-action="p-konum-ac">Konumu aç</button>${sehirTus}</div>`}
    <div class="pz-kadran-kutu">${kadran(k ? isaret(ekranAcisi(kerteriz(k, KABE)), 'kible buyuk', ISARET_IC.kible, 112) : '')}
      <svg class="pz-kible-ok" id="pKibleOk" viewBox="0 0 300 300" aria-hidden="true"><path d="M150 70 166 150 150 140 134 150Z"/></svg></div>
    <div class="pz-yon"><b id="pKibleDurum">—</b><span id="pKibleAlt"></span></div>
    <div class="pz-kart pz-kible-bilgi" id="pKibleBilgi"></div>
    <p class="muted sm pz-dipnot">Telefonu yere paralel tut; demir, mıknatıs, hoparlör ve araba içi pusulayı saptırır. Kıble açısı gerçek kuzeye göre hesaplanır.</p>
  </div>`;
  kibleTazele(true);
}
let kibledeydi = false;
function kibleTazele(ani) {
  const y = gosterilenYon(), k = PZ.konum;
  gulDondur(y ?? 0, ani);
  const durum = $('#pKibleDurum'); if (!durum) return;
  const ok = $('#pKibleOk');
  if (!k) { durum.textContent = '—'; $('#pKibleAlt').textContent = 'Konum bekleniyor'; $('#pKibleBilgi').innerHTML = ''; ok.style.display = 'none'; return; }
  const kib = kerteriz(k, KABE), ekr = ekranAcisi(kib), s = sapma();
  const bilgi = `<div><span>Kıble açısı</span><b>${sayi(kib, 1)}° <small>${yonAd(kib)}</small></b></div><div><span>Kâbe'ye uzaklık</span><b>${mesafeYaz(mesafe(k, KABE))}</b></div>
    <div><span>Konum</span><b>${k.kaynak === 'sehir' ? esc(k.ad) + ' (seçilen şehir)' : k.kaynak === 'son' ? 'Son bilinen konum' : 'GPS' + (k.dog ? ' ±' + sayi(Math.round(k.dog)) + ' m' : '')}</b></div>
    <div><span>Manyetik sapma</span><b>${s.kaynak === 'yok' ? 'bilinmiyor' : (s.d >= 0 ? '+' : '') + sayi(s.d, 1) + '°' + (s.kaynak === 'elle' ? ' (elle)' : '')}</b></div>`;
  const kb = $('#pKibleBilgi'); if (kb.dataset.html !== bilgi) { kb.innerHTML = bilgi; kb.dataset.html = bilgi; }
  if (y == null) { ok.style.display = 'none'; durum.textContent = Math.round(kib) + '°'; $('#pKibleAlt').textContent = 'Kuzeyden saat yönünde · pusula yok'; return; }
  ok.style.display = ''; const d = fark(y, ekr);
  ok.setAttribute('transform', ''); ok.querySelector('path').setAttribute('transform', `rotate(${d.toFixed(1)} 150 150)`);
  const tamam = Math.abs(d) < 3;
  ok.classList.toggle('tamam', tamam); document.querySelector('.pz-kible .pz-kadran-kutu')?.classList.toggle('tamam', tamam);
  durum.textContent = tamam ? 'Kıble yönündesin' : `${Math.round(Math.abs(d))}° ${d > 0 ? 'sağa' : 'sola'} dön`;
  $('#pKibleAlt').textContent = `Kıble ${Math.round(kib)}° · ${yonAd(kib)}`;
  if (tamam && !kibledeydi) titret([40, 60, 40]);
  kibledeydi = tamam;
}

/* ═════════ Konum ═════════ */
function konumCiz() {
  $('#pGovde').innerHTML = `
  <div class="pz-konum">
    <section class="pz-kart" id="pKonumKart"></section>
    <section class="pz-kart" id="pGokKart"></section>
    <section class="pz-kart pz-noktalar">
      <div class="pz-baslik"><h2>Kayıtlı yerler</h2><div class="spacer"></div><button class="btn primary sm" data-action="p-nokta-ekle">${IC.plus}Burayı kaydet</button></div>
      <div id="pNoktalar"></div>
      <p class="muted sm">Arabanı park ettiğin yeri, çadırı ya da buluşma noktasını kaydet; sonra "Yol göster" ile pusula sana yönü ve mesafeyi gösterir.</p>
    </section>
  </div>`;
  konumTazele();
}
function konumTazele() {
  if (PZ.sekme === 'kible') return kibleCiz();
  if (PZ.sekme === 'pusula') { const g = $('#pIsaret'); if (g) { g.innerHTML = isaretler(); gulDondur(gosterilenYon() ?? 0, true); } return; }
  if (PZ.sekme !== 'konum' || !$('#pKonumKart')) return;
  const k = PZ.konum;
  $('#pKonumKart').innerHTML = !k ? `<div class="pz-bos">${IC.konum}<b>Konum yok</b><span>Koordinat, yükseklik ve hız için konum iznine ihtiyaç var.</span><div class="pz-tuslar"><button class="btn primary" data-action="p-konum-ac">Konumu aç</button><button class="btn" data-action="p-sehir">Şehir seç</button></div></div>` : `
    <div class="pz-baslik"><h2>Konumun</h2><span class="muted sm">${k.kaynak === 'gps' ? 'GPS' + (k.dog ? ' · ±' + sayi(Math.round(k.dog)) + ' m' : '') : k.kaynak === 'sehir' ? esc(k.ad) + ' (seçilen şehir)' : 'Son bilinen konum'}</span></div>
    <div class="pz-koordinat"><b>${sayi(k.lat, 6)}, ${sayi(k.lon, 6)}</b><span>${dms(k.lat, 'K', 'G')} · ${dms(k.lon, 'D', 'B')}</span></div>
    <div class="pz-olcum">
      <div><span>Yükseklik</span><b>${k.yuk == null ? '—' : sayi(Math.round(k.yuk)) + ' m'}</b>${k.yukDog ? `<small>±${sayi(Math.round(k.yukDog))} m</small>` : ''}</div>
      <div><span>Hız</span><b>${k.hiz == null ? '—' : sayi(k.hiz * 3.6, 1) + ' km/sa'}</b></div>
      <div><span>Gidiş yönü</span><b>${k.yon == null || isNaN(k.yon) || !k.hiz ? '—' : Math.round(k.yon) + '° ' + yonKisa(k.yon)}</b></div>
    </div>
    <div class="pz-tuslar"><button class="btn" data-action="p-kopyala">${IC.kopya}Kopyala</button>${navigator.share ? `<button class="btn" data-action="p-paylas">${IC.paylas}Paylaş</button>` : ''}<button class="btn" data-action="p-harita">${IC.harita}Haritada aç</button></div>`;
  gokCiz(); noktaCiz();
}
function gokCiz() {
  const el = $('#pGokKart'); if (!el) return; const k = PZ.konum;
  if (!k) { el.innerHTML = `<div class="pz-baslik"><h2>Güneş ve ay</h2></div><p class="muted sm">Konum gelince doğuş-batış saatleri ve yönleri burada görünür.</p>`; return; }
  const t = Date.now(), b = new Date(); b.setHours(0, 0, 0, 0);
  const g = GA.gunes(k, t), a = GA.ay(k, t), gd = GA.dogusBatis(k, +b, false), ad = GA.dogusBatis(k, +b, true), ev = GA.evre(t);
  const satir = (ic, ad2, pos, db, ek) => `<div class="pz-gok"><div class="pz-gok-ic ${ad2 === 'Güneş' ? 'gunes' : 'ay'}">${ic}</div><div class="pz-gok-m"><b>${ad2}</b><span>${pos.yuk > 0 ? `Şu an ${Math.round(pos.yon)}° ${yonAd(pos.yon)}, ufkun ${sayi(pos.yuk, 0)}° üstünde` : 'Şu an ufkun altında'}${ek || ''}</span></div>
    <div class="pz-gok-s"><span>Doğuş <b>${db.hepUst ? 'batmıyor' : db.hepAlt ? 'doğmuyor' : saatYaz(db.dogus)}</b></span><span>Batış <b>${db.hepUst || db.hepAlt ? '—' : saatYaz(db.batis)}</b></span></div></div>`;
  el.innerHTML = `<div class="pz-baslik"><h2>Güneş ve ay</h2><span class="muted sm">bugün</span></div>
    ${satir(IC.gunes, 'Güneş', g, gd)}${satir(IC.ay, 'Ay', a, ad, ` · ${evreAd(ev)} (%${Math.round(ev.oran * 100)})`)}`;
}
function noktaCiz() {
  const el = $('#pNoktalar'); if (!el) return; const k = PZ.konum;
  el.innerHTML = PZ.noktalar.map(n => `<div class="pz-nokta"><div class="pz-nokta-m"><b>${esc(n.ad)}</b><span>${k ? `${mesafeYaz(mesafe(k, n))} · ${Math.round(kerteriz(k, n))}° ${yonKisa(kerteriz(k, n))}` : 'Konum bekleniyor'} · ${new Date(n.zaman).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></div>
    <button class="btn sm ${PZ.hedef === n.id ? 'primary' : ''}" data-action="p-yol" data-id="${n.id}">${IC.yonla}Yol göster</button><button class="icon-btn sm" data-action="p-nokta-sil" data-id="${n.id}" title="Sil">${IC.close}</button></div>`).join('') || '<p class="muted sm pz-bos-k">Henüz kayıtlı yer yok.</p>';
}

/* ═════════ Ayarlar ═════════ */
function ayarAc() {
  const t = store.get('theme', 'light'), A = PZ.ayar, s = sapmaTahmin(PZ.konum);
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet settings"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Ayarlar</h3></header>
    <div class="set-body">
      <section><h4>Kuzey</h4><div class="seg yon-seg">${[['gercek', 'Gerçek kuzey'], ['manyetik', 'Manyetik kuzey']].map(([k, n]) => `<button class="${A.kuzey === k ? 'on' : ''}" data-action="p-kuzey" data-k="${k}">${n}</button>`).join('')}</div>
        <p class="muted sm">Haritalar ve kıble gerçek kuzeye göredir. Manyetik kuzey, klasik iğneli pusulanın gösterdiğidir.</p></section>
      <section><h4>Manyetik sapma</h4><div class="set-row"><div><b>${A.sapmaElle == null ? 'Otomatik' : 'Elle girildi'}</b><span>${s == null ? 'Bulunduğun yer için otomatik değer yok (Türkiye ve çevresinde hesaplanır). Biliyorsan elle gir.' : `Bu konum için yaklaşık +${sayi(s, 1)}°.`}</span></div>
        <input class="pz-sayi-gir" id="pSapma" inputmode="decimal" placeholder="${s == null ? '0' : sayi(s, 1)}" value="${A.sapmaElle == null ? '' : sayi(A.sapmaElle, 1)}" aria-label="Manyetik sapma (derece, doğu artı)"></div>
        <p class="muted sm">Doğu sapması artı, batı sapması eksi yazılır. Boş bırakırsan otomatik kullanılır.</p></section>
      <section><h4>Görünüm</h4><div class="seg yon-seg">${[['light', 'Cam'], ['dark', 'Koyu'], ['auto', 'Otomatik'], ['flat', 'Düz']].map(([k, n]) => `<button class="${t === k ? 'on' : ''}" data-action="p-tema" data-t="${k}">${n}</button>`).join('')}</div></section>
      <section><h4>Diğer</h4>
        <div class="set-row"><div><b>Titreşim</b><span>Kıble yakalanınca kısa titreşim.</span></div><label class="pz-anahtar"><input type="checkbox" id="pTitresim" ${A.titresim ? 'checked' : ''}><i></i></label></div>
        <div class="set-row"><div><b>Ekranı açık tut</b><span>Pusula açıkken ekran kararmasın.</span></div><label class="pz-anahtar"><input type="checkbox" id="pUyanik" ${store.get('pusulaUyanik', false) ? 'checked' : ''}><i></i></label></div></section>
      <section><h4>Verilerin</h4><div class="set-row"><div><b>Bu cihazda</b><span>Konumun ve kayıtlı yerlerin sadece bu cihazda saklanır; hiçbir yere gönderilmez.</span></div></div></section>
      <section><h4>Uygulama</h4>${typeof aboutRow === 'function' ? aboutRow() : ''}</section>
    </div></div></div>`;
  $('#pSapma').onchange = e => {
    const v = e.target.value.trim().replace(',', '.');
    if (v === '') A.sapmaElle = null; else if (isFinite(+v) && Math.abs(+v) <= 60) A.sapmaElle = +v; else { toast('−60 ile 60 arasında bir derece yaz'); return; }
    kaydet('ayar'); ayarAc(); ciz();
  };
  $('#pTitresim').onchange = e => { A.titresim = e.target.checked; kaydet('ayar'); };
  $('#pUyanik').onchange = e => { store.set('pusulaUyanik', e.target.checked); uyanikTut(); };
}
let kilitE = null;
async function uyanikTut() {
  const gerek = store.get('pusulaUyanik', false) && document.visibilityState === 'visible';
  try { if (gerek && !kilitE && navigator.wakeLock) { kilitE = await navigator.wakeLock.request('screen'); kilitE.addEventListener('release', () => { kilitE = null; }); } else if (!gerek && kilitE) { await kilitE.release(); kilitE = null; } } catch {}
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') uyanikTut(); });

function kalibreAc() {
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Pusulayı ayarla</h3></header>
    <div class="set-body pz-kalibre">
      <svg viewBox="0 0 200 110" aria-hidden="true"><path d="M100 55C70 15 25 20 25 55s45 40 75 0 75-40 75 0-45 40-75 0" class="iz"/><rect x="88" y="38" width="24" height="36" rx="5" class="tel"/></svg>
      <ol><li>Telefonu elinde tut, havada <b>8 rakamı</b> çizer gibi 3–4 kez yavaşça salla, bileğini de çevir.</li>
      <li>Demir, mıknatıs, hoparlör, dizüstü bilgisayar ve araba içinden uzaklaş; mıknatıslı kılıf varsa çıkar.</li>
      <li>Yön hâlâ tutmuyorsa telefonun Ayarlar › Konum bölümünde <b>yüksek doğruluk</b> açık olsun.</li></ol>
      ${PZ.dogruluk != null ? `<p class="muted sm">Şu anki hassasiyet: ${PZ.dogruluk < 0 ? 'bilinmiyor' : '±' + Math.round(PZ.dogruluk) + '°'}</p>` : ''}
      <div class="sticky-actions"><div class="spacer"></div><button class="btn primary" data-action="close-modal">Tamam</button></div>
    </div></div></div>`;
}
function sehirSecAc() {
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Şehir seç</h3></header>
    <div class="set-body"><input class="pz-ara" id="pAra" placeholder="Şehir ara" autocomplete="off"><div class="pz-sehir-sec" id="pSehirL"></div>
    <p class="muted sm">Listede yoksa en yakın büyük şehri seç; birkaç yüz kilometre kıble açısını 1°'den az değiştirir.</p></div></div></div>`;
  const l = () => { const q = $('#pAra').value.trim().toLocaleLowerCase('tr'); $('#pSehirL').innerHTML = SEHIRLER.map((s, i) => [s, i]).filter(([s]) => !q || s[0].toLocaleLowerCase('tr').includes(q)).map(([s, i]) => `<button data-i="${i}"><b>${esc(s[0])}</b><em>Kıble ${Math.round(kerteriz({ lat: s[1], lon: s[2] }, KABE))}°</em></button>`).join('') || '<p class="muted sm">Bulunamadı.</p>'; };
  $('#pAra').oninput = l; l();
  $('#pSehirL').onclick = e => { const b = e.target.closest('[data-i]'); if (b) sehirSecildi(+b.dataset.i); };
}
function noktaEkle() {
  const k = PZ.konum;
  if (!k) return toast('Önce konumunu aç');
  if (k.kaynak === 'sehir') return toast('Yer kaydetmek için GPS konumu gerekir');
  const ad0 = PZ.noktalar.some(n => n.ad === 'Arabam') ? 'Yer ' + (PZ.noktalar.length + 1) : 'Arabam';
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Burayı kaydet</h3></header>
    <form class="set-body" id="pNF"><label class="nask-l">Ad<input id="pNAd" value="${esc(ad0)}" maxlength="40"></label>
    <div class="pz-hizli">${['Arabam', 'Otel', 'Çadır', 'Buluşma', 'Ev'].map(a => `<button type="button" data-ad="${a}">${a}</button>`).join('')}</div>
    <p class="muted sm">${sayi(k.lat, 6)}, ${sayi(k.lon, 6)}${k.dog ? ' · ±' + sayi(Math.round(k.dog)) + ' m' : ''}</p>
    <div class="sticky-actions"><div class="spacer"></div><button type="button" class="btn" data-action="close-modal">Vazgeç</button><button class="btn primary">Kaydet</button></div></form></div></div>`;
  document.querySelectorAll('.pz-hizli [data-ad]').forEach(b => b.onclick = () => { $('#pNAd').value = b.dataset.ad; });
  $('#pNAd').select();
  $('#pNF').onsubmit = e => {
    e.preventDefault();
    PZ.noktalar.unshift({ id: sid(), ad: $('#pNAd').value.trim() || ad0, lat: k.lat, lon: k.lon, zaman: Date.now() });
    PZ.noktalar = PZ.noktalar.slice(0, 50); kaydet('noktalar'); closeModal(); konumTazele(); toast('Kaydedildi');
  };
}
async function kopyala(m) { try { await navigator.clipboard.writeText(m); toast('Kopyalandı'); } catch { toast('Kopyalanamadı'); } }

/* ═════════ Ana döngü ═════════ */
const acilis = Date.now();
let sonGok = 0;
function dongu() {
  if (DEMO) { const t = Date.now() / 1000; PZ.ham = mod(200 + 70 * Math.sin(t / 4)); yonVar = true; PZ.yonKaynak = 'demo'; }
  if (PZ.sekme === 'pusula') pusulaTazele();
  else if (PZ.sekme === 'kible') kibleTazele();
  const nt = $('#pNot'); if (nt) { const h = durumNotu(); if (nt.dataset.html !== h) { nt.innerHTML = h; nt.dataset.html = h; } }
  if (Date.now() - sonGok > 60000) { sonGok = Date.now(); if (PZ.sekme === 'konum') gokCiz(); else if (PZ.sekme === 'pusula') { const g = $('#pIsaret'); if (g) { g.innerHTML = isaretler(); gulDondur(gosterilenYon() ?? 0, true); } } }
  requestAnimationFrame(dongu);
}

/* ═════════ Olaylar ═════════ */
Object.assign(ACTIONS, {
  'p-sekme': el => { PZ.sekme = el.dataset.k; store.set('pusulaSekme', PZ.sekme); ciz(); },
  'p-ayar': () => ayarAc(), settings: () => ayarAc(),
  'p-tema': el => { store.set('theme', el.dataset.t); applyTheme(el.dataset.t); ayarAc(); },
  'p-kuzey': el => { PZ.ayar.kuzey = el.dataset.k; kaydet('ayar'); ayarAc(); ciz(); },
  'p-ios-izin': () => iosIzin(),
  'p-kilit': () => {
    const y = gosterilenYon();
    if (PZ.kilit != null) PZ.kilit = null; else if (y == null) return toast('Kilitlemek için pusula algılayıcısı gerekir'); else { PZ.kilit = Math.round(y); titret(20); }
    pusulaCiz();
  },
  'p-kalibre': () => kalibreAc(),
  'p-konum-ac': () => konumBaslat(true),
  'p-sehir': () => sehirSecAc(),
  'p-kopyala': () => { const k = PZ.konum; if (k) kopyala(`${k.lat.toFixed(6)}, ${k.lon.toFixed(6)}`); },
  'p-paylas': async () => { const k = PZ.konum; if (!k) return; try { await navigator.share({ title: 'Konumum', text: `Konumum: ${k.lat.toFixed(6)}, ${k.lon.toFixed(6)}\nhttps://www.google.com/maps?q=${k.lat.toFixed(6)},${k.lon.toFixed(6)}` }); } catch {} },
  'p-harita': () => { const k = PZ.konum; if (k) window.open(`https://www.google.com/maps?q=${k.lat.toFixed(6)},${k.lon.toFixed(6)}`, '_blank', 'noopener'); },
  'p-nokta-ekle': () => noktaEkle(),
  'p-nokta-sil': el => { const n = PZ.noktalar.find(x => x.id === el.dataset.id); PZ.noktalar = PZ.noktalar.filter(x => x.id !== el.dataset.id); if (PZ.hedef === el.dataset.id) PZ.hedef = null; kaydet('noktalar'); noktaCiz(); if (n) toast('Silindi: ' + n.ad); },
  'p-yol': el => { PZ.hedef = el.dataset.id; PZ.sekme = 'pusula'; store.set('pusulaSekme', 'pusula'); ciz(); },
  'p-hedef-bitir': () => { PZ.hedef = null; pusulaCiz(); }
});

/* ═════════ Başlangıç ═════════ */
document.removeEventListener('DOMContentLoaded', boot);
function pusulaBaslat() {
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  const u = new URLSearchParams(location.search);
  for (const k of ['pusula', 'kible', 'konum']) if (u.has(k)) { PZ.sekme = k; history.replaceState(null, '', location.pathname + (DEMO ? '?demo' : '')); }
  if (DEMO) {
    PZ.konum = { lat: 41.0082, lon: 28.9784, dog: 6, yuk: 42, yukDog: 4, hiz: 1.3, yon: 210, zaman: Date.now(), kaynak: 'gps' };
    if (!PZ.noktalar.length) PZ.noktalar = [{ id: sid(), ad: 'Arabam', lat: 41.0115, lon: 28.9752, zaman: Date.now() - 3600e3 }];
  } else {
    const son = store.get('pusulaSonKonum', null), si = store.get('pusulaSehir', null);
    if (son) PZ.konum = { lat: son.lat, lon: son.lon, dog: null, yuk: null, hiz: null, zaman: son.zaman, kaynak: 'son' };
    else if (si != null && SEHIRLER[si]) PZ.konum = { lat: SEHIRLER[si][1], lon: SEHIRLER[si][2], zaman: Date.now(), kaynak: 'sehir', ad: SEHIRLER[si][0] };
    // Daha önce izin verildiyse konumu hemen başlat; yoksa kullanıcı "Konumu aç"a basınca sorulur
    if (store.get('pusulaKonumIzin', false) || yerel().android) konumBaslat(false);
    else if (navigator.permissions?.query) navigator.permissions.query({ name: 'geolocation' }).then(p => { if (p.state === 'granted') konumBaslat(false); }).catch(() => {});
  }
  kabuk(); ciz(); uyanikTut();
  requestAnimationFrame(dongu);
}
showLogin = msg => { if (msg) toast(msg); };
start = () => pusulaBaslat();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pusulaBaslat); else pusulaBaslat();
