/* ───────────── Saat ─────────────
   Dünya saati, alarm, kronometre, zamanlayıcı, odak (pomodoro). Giriş gerekmez; her şey bu cihazda kalır.
   Sesler cihazda üretilir (dosya indirilmez). Tarayıcıda alarm, sayfa açıkken çalar; Android programında
   telefon kilitliyken de bildirimle çalar (window.SUHA_YEREL.bildirimPlanla). */
'use strict';

window.APP_NAME = 'Saat';
window.APP_ICON = 'saat-apple.png?v=8';
window.APP_LEAD = 'Dünya saati, alarm, kronometre, zamanlayıcı ve odak sayacı. Ücretsiz, reklamsız.';

const SSVG = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
Object.assign(IC, {
  dunya: SSVG('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 3.6 5.4 3.6 8.5s-1.1 5.9-3.6 8.5c-2.5-2.6-3.6-5.4-3.6-8.5s1.1-5.9 3.6-8.5z"/>'),
  alarm2: SSVG('<circle cx="12" cy="13" r="7"/><path d="M12 9.5V13l2.5 1.5M4.5 5.5l3-2.5M19.5 5.5l-3-2.5"/>'),
  krono: SSVG('<circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V9.5M10 2.5h4M12 2.5V6M18.5 7l1.5-1.5"/>'),
  sayac: SSVG('<path d="M7 3h10M7 21h10M8 3c0 4.5 8 4.5 8 9s-8 4.5-8 9M16 3c0 4.5-8 4.5-8 9s8 4.5 8 9"/>'),
  odak: SSVG('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>'),
  oynat: SSVG('<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>'),
  durdur: SSVG('<path d="M8 5.5v13M16 5.5v13" stroke-width="3"/>'),
  bayrak: SSVG('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'),
  sifirla: SSVG('<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 4v4.5h4.5"/>'),
  zil: SSVG('<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>')
});

const ZS = {
  sekme: store.get('saatSekme', 'dunya'),
  sehirler: store.get('saatSehirler', ['Europe/London', 'America/New_York', 'Asia/Tokyo', 'Europe/Berlin']),
  alarmlar: store.get('saatAlarmlar', []),
  krono: store.get('saatKrono', { bas: null, birikmis: 0, turlar: [] }),
  sayaclar: store.get('saatSayaclar', []),
  odak: store.get('saatOdak', { calisma: 25, kisa: 5, uzun: 15, aralik: 4, faz: 'calisma', bitis: null, kalan: null, tamam: 0, tarih: '' }),
  calan: null   // { tur, baslik, metin, id }
};
const kaydet = k => store.set({ sehirler: 'saatSehirler', alarmlar: 'saatAlarmlar', krono: 'saatKrono', sayaclar: 'saatSayaclar', odak: 'saatOdak' }[k], ZS[k]);
const sid = () => Math.random().toString(36).slice(2, 9);
const iki = n => String(n).padStart(2, '0');
const GUNLER = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];   // görüntü sırası; Date.getDay ile: (i + 1) % 7
const yerel = () => window.SUHA_YEREL || {};

/* ═════════ Şehirler ═════════ */
const SEHIR = [
  ['Europe/Istanbul', 'İstanbul', 'Türkiye'], ['Europe/London', 'Londra', 'Birleşik Krallık'], ['Europe/Berlin', 'Berlin', 'Almanya'], ['Europe/Paris', 'Paris', 'Fransa'],
  ['Europe/Amsterdam', 'Amsterdam', 'Hollanda'], ['Europe/Brussels', 'Brüksel', 'Belçika'], ['Europe/Vienna', 'Viyana', 'Avusturya'], ['Europe/Zurich', 'Zürih', 'İsviçre'],
  ['Europe/Rome', 'Roma', 'İtalya'], ['Europe/Madrid', 'Madrid', 'İspanya'], ['Europe/Lisbon', 'Lizbon', 'Portekiz'], ['Europe/Stockholm', 'Stockholm', 'İsveç'],
  ['Europe/Oslo', 'Oslo', 'Norveç'], ['Europe/Copenhagen', 'Kopenhag', 'Danimarka'], ['Europe/Helsinki', 'Helsinki', 'Finlandiya'], ['Europe/Warsaw', 'Varşova', 'Polonya'],
  ['Europe/Prague', 'Prag', 'Çekya'], ['Europe/Budapest', 'Budapeşte', 'Macaristan'], ['Europe/Athens', 'Atina', 'Yunanistan'], ['Europe/Sofia', 'Sofya', 'Bulgaristan'],
  ['Europe/Bucharest', 'Bükreş', 'Romanya'], ['Europe/Kyiv', 'Kiev', 'Ukrayna'], ['Europe/Moscow', 'Moskova', 'Rusya'], ['Asia/Nicosia', 'Lefkoşa', 'Kıbrıs'],
  ['Asia/Baku', 'Bakü', 'Azerbaycan'], ['Asia/Tbilisi', 'Tiflis', 'Gürcistan'], ['Asia/Tehran', 'Tahran', 'İran'], ['Asia/Baghdad', 'Bağdat', 'Irak'],
  ['Asia/Riyadh', 'Riyad', 'Suudi Arabistan'], ['Asia/Dubai', 'Dubai', 'BAE'], ['Asia/Qatar', 'Doha', 'Katar'], ['Africa/Cairo', 'Kahire', 'Mısır'],
  ['Asia/Jerusalem', 'Kudüs', 'İsrail/Filistin'], ['Asia/Almaty', 'Almatı', 'Kazakistan'], ['Asia/Tashkent', 'Taşkent', 'Özbekistan'], ['Asia/Bishkek', 'Bişkek', 'Kırgızistan'],
  ['Asia/Ashgabat', 'Aşkabat', 'Türkmenistan'], ['Asia/Karachi', 'Karaçi', 'Pakistan'], ['Asia/Kolkata', 'Yeni Delhi', 'Hindistan'], ['Asia/Dhaka', 'Dakka', 'Bangladeş'],
  ['Asia/Bangkok', 'Bangkok', 'Tayland'], ['Asia/Jakarta', 'Cakarta', 'Endonezya'], ['Asia/Singapore', 'Singapur', 'Singapur'], ['Asia/Kuala_Lumpur', 'Kuala Lumpur', 'Malezya'],
  ['Asia/Shanghai', 'Pekin', 'Çin'], ['Asia/Hong_Kong', 'Hong Kong', 'Çin'], ['Asia/Taipei', 'Taipei', 'Tayvan'], ['Asia/Seoul', 'Seul', 'Güney Kore'],
  ['Asia/Tokyo', 'Tokyo', 'Japonya'], ['Australia/Sydney', 'Sidney', 'Avustralya'], ['Australia/Perth', 'Perth', 'Avustralya'], ['Pacific/Auckland', 'Auckland', 'Yeni Zelanda'],
  ['Africa/Lagos', 'Lagos', 'Nijerya'], ['Africa/Nairobi', 'Nairobi', 'Kenya'], ['Africa/Johannesburg', 'Johannesburg', 'Güney Afrika'], ['Africa/Casablanca', 'Kazablanka', 'Fas'],
  ['America/New_York', 'New York', 'ABD'], ['America/Chicago', 'Chicago', 'ABD'], ['America/Denver', 'Denver', 'ABD'], ['America/Los_Angeles', 'Los Angeles', 'ABD'],
  ['America/Anchorage', 'Anchorage', 'ABD'], ['Pacific/Honolulu', 'Honolulu', 'ABD'], ['America/Toronto', 'Toronto', 'Kanada'], ['America/Vancouver', 'Vancouver', 'Kanada'],
  ['America/Mexico_City', 'Meksiko', 'Meksika'], ['America/Bogota', 'Bogota', 'Kolombiya'], ['America/Lima', 'Lima', 'Peru'], ['America/Santiago', 'Santiago', 'Şili'],
  ['America/Sao_Paulo', 'São Paulo', 'Brezilya'], ['America/Argentina/Buenos_Aires', 'Buenos Aires', 'Arjantin'], ['Atlantic/Reykjavik', 'Reykjavik', 'İzlanda'], ['UTC', 'UTC', 'Eş güdümlü evrensel saat']
];
const yerelTz = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return 'Europe/Istanbul'; } })();
function tzParca(tz, t = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(t).map(x => [x.type, x.value]));
  return { y: +p.year, ay: +p.month, g: +p.day, s: +p.hour, d: +p.minute, sn: +p.second };
}
function tzFark(tz, t = new Date()) {   // yerel saate göre dakika farkı
  const a = tzParca(tz, t), b = tzParca(yerelTz, t);
  return Math.round((Date.UTC(a.y, a.ay - 1, a.g, a.s, a.d) - Date.UTC(b.y, b.ay - 1, b.g, b.s, b.d)) / 60000);
}
const sehirAd = tz => (SEHIR.find(s => s[0] === tz) || [tz, tz.split('/').pop().replace(/_/g, ' '), ''])[1];
const farkYaz = dk => { if (!dk) return 'Aynı saat'; const s = Math.trunc(Math.abs(dk) / 60), d = Math.abs(dk) % 60; return `${s ? s + ' sa' : ''}${s && d ? ' ' : ''}${d ? d + ' dk' : ''} ${dk > 0 ? 'ileri' : 'geri'}`; };

/* ═════════ Ses (cihazda üretilir) ═════════ */
const SES = {
  ctx: null,
  hazirla() { if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } } if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); return this.ctx; },
  nota(f, bas, sure, tur = 'sine', ses = 0.22) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = tur; o.frequency.value = f; g.gain.setValueAtTime(0, bas); g.gain.linearRampToValueAtTime(ses, bas + 0.015); g.gain.exponentialRampToValueAtTime(0.0008, bas + sure);
    o.connect(g).connect(c.destination); o.start(bas); o.stop(bas + sure + 0.05);
  },
  CESIT: {
    klasik: { ad: 'Klasik', cal(s, t) { for (let i = 0; i < 4; i++) s.nota(880, t + i * 0.18, 0.12, 'square', 0.12); } , aralik: 1.2 },
    yumusak: { ad: 'Yumuşak', cal(s, t) { [523.25, 659.25, 783.99].forEach((f, i) => s.nota(f, t + i * 0.22, 0.9)); }, aralik: 2 },
    zil: { ad: 'Zil', cal(s, t) { [1318.5, 987.77].forEach((f, i) => { s.nota(f, t + i * 0.3, 1.2, 'triangle', 0.18); s.nota(f * 2.01, t + i * 0.3, 0.6, 'sine', 0.05); }); }, aralik: 1.6 },
    sabah: { ad: 'Sabah', cal(s, t) { [392, 493.88, 587.33, 783.99, 587.33, 783.99].forEach((f, i) => s.nota(f, t + i * 0.16, 0.35, 'sine', 0.18)); }, aralik: 2.2 },
    kisa: { ad: 'Kısa bip', cal(s, t) { s.nota(1046.5, t, 0.15, 'sine', 0.25); s.nota(1046.5, t + 0.25, 0.15, 'sine', 0.25); }, aralik: 3 }
  },
  calan: null,
  baslat(cesit = 'klasik') {
    const c = this.hazirla(); if (!c) return; this.durdur();
    const C = this.CESIT[cesit] || this.CESIT.klasik, bir = () => C.cal(this, c.currentTime + 0.02);
    bir(); this.calan = setInterval(bir, C.aralik * 1000);
    if (navigator.vibrate) navigator.vibrate([400, 200, 400, 200, 400]);
    this.zaman = setTimeout(() => this.durdur(), 10 * 60000);   // en çok 10 dakika çalar
  },
  dene(cesit) { const c = this.hazirla(); if (c) (this.CESIT[cesit] || this.CESIT.klasik).cal(this, c.currentTime + 0.02); },
  durdur() { clearInterval(this.calan); clearTimeout(this.zaman); this.calan = null; if (navigator.vibrate) navigator.vibrate(0); }
};
// Tarayıcı sesi ancak bir dokunuştan sonra açar: ilk dokunuşta hazırla
document.addEventListener('pointerdown', () => SES.hazirla(), { once: true, capture: true });
document.addEventListener('keydown', () => SES.hazirla(), { once: true, capture: true });

/* ═════════ Başlangıç ═════════ */
document.removeEventListener('DOMContentLoaded', boot);
function saatBaslat() {
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  const u = new URLSearchParams(location.search);
  for (const k of ['dunya', 'alarm', 'krono', 'sayac', 'odak']) if (u.has(k)) { ZS.sekme = k; history.replaceState(null, '', location.pathname + (DEMO ? '?demo' : '')); }
  if (DEMO && !ZS.alarmlar.length) ZS.alarmlar = [{ id: sid(), s: 7, d: 0, gunler: [0, 1, 2, 3, 4], ad: 'İşe kalk', ses: 'sabah', acik: true }, { id: sid(), s: 9, d: 30, gunler: [5, 6], ad: 'Hafta sonu', ses: 'yumusak', acik: false }];
  kabuk(); sekmeCiz();
  setInterval(tik, 250); tik();
  bildirimPlanla();
}
showLogin = msg => { if (msg) toast(msg); };
start = () => saatBaslat();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', saatBaslat); else saatBaslat();

function kabuk() {
  const S = [['dunya', 'Dünya', 'dunya'], ['alarm', 'Alarm', 'alarm2'], ['krono', 'Kronometre', 'krono'], ['sayac', 'Zamanlayıcı', 'sayac'], ['odak', 'Odak', 'odak']];
  $('#app').innerHTML = `
  <div class="zs-kabuk">
    <header class="zs-bas">
      <div class="brand-mark sm">${IC.alarm2}</div><h1>Saat</h1>
      <nav class="seg zs-ust-sekme">${S.map(([k, n]) => `<button data-action="z-sekme" data-k="${k}">${n}</button>`).join('')}</nav>
      <div class="spacer"></div>
      <button class="icon-btn" data-action="z-ayar" title="Ayarlar">${IC.gear}</button>
    </header>
    <main class="zs-govde" id="zGovde"></main>
    <nav class="zs-alt-sekme">${S.map(([k, n, ic]) => `<button data-action="z-sekme" data-k="${k}">${IC[ic]}<span>${n === 'Kronometre' ? 'Krono' : n === 'Zamanlayıcı' ? 'Sayaç' : n}</span></button>`).join('')}</nav>
    <div class="zs-calan" id="zCalan" hidden></div>
  </div>`;
}
function sekmeCiz() {
  document.querySelectorAll('[data-action="z-sekme"]').forEach(b => b.classList.toggle('on', b.dataset.k === ZS.sekme));
  document.body.dataset.zsekme = ZS.sekme;
  ({ dunya: dunyaCiz, alarm: alarmCiz, krono: kronoCiz, sayac: sayacCiz, odak: odakCiz }[ZS.sekme] || dunyaCiz)();
}

/* ═════════ Ana döngü: ekranı tazele, zamanı gelenleri çal ═════════ */
let sonBakis = 0;
function tik() {
  const simdi = new Date(), t = +simdi;
  // Ekran
  if (ZS.sekme === 'dunya') dunyaTazele(simdi);
  if (ZS.sekme === 'alarm') alarmUstTazele(simdi);
  if (ZS.sekme === 'sayac') sayacTazele(t);
  if (ZS.sekme === 'odak') odakTazele(t);
  // Alarmlar: son bakıştan bu yana zamanı gelen var mı (sekme uyuyup geç uyansa da 5 dakikaya kadar yakalar)
  const once = sonBakis || t - 1000; sonBakis = t;
  if (t - once < 5 * 60000) for (const a of ZS.alarmlar) {
    if (!a.acik) continue;
    if (a.ertele && t - a.ertele > 5 * 60000) { delete a.ertele; if (!a.gunler.length) a.acik = false; kaydet('alarmlar'); continue; }   // kaçmış erteleme
    const n = sonrakiCalma(a, new Date(once));
    if (!n || +n > t) continue;
    if (a.ertele) delete a.ertele;
    else if (!a.gunler.length) a.acik = false;   // tek seferlik alarm çaldıktan sonra kapanır
    kaydet('alarmlar'); cal({ tur: 'alarm', id: a.id, baslik: `${iki(a.s)}:${iki(a.d)}`, metin: a.ad || 'Alarm', ses: a.ses });
    if (ZS.sekme === 'alarm') alarmCiz();
  }
  // Zamanlayıcılar
  for (const s of ZS.sayaclar) if (s.bitis && t >= s.bitis) { s.bitis = null; s.kalan = 0; s.bitti = true; kaydet('sayaclar'); cal({ tur: 'sayac', id: s.id, baslik: 'Süre doldu', metin: s.ad || sureYaz(s.sure), ses: s.ses || 'zil' }); if (ZS.sekme === 'sayac') sayacCiz(); }
  // Odak
  const O = ZS.odak;
  if (O.bitis && t >= O.bitis) { odakGec(true); }
}
function cal(c) {
  ZS.calan = c; SES.baslat(c.ses);
  const el = $('#zCalan'); el.hidden = false;
  el.innerHTML = `<div class="zs-calan-ic"><div class="zs-calan-ikon">${c.tur === 'alarm' ? IC.alarm2 : c.tur === 'odak' ? IC.odak : IC.sayac}</div><b>${esc(c.baslik)}</b><span>${esc(c.metin)}</span>
    <div class="zs-calan-tus">${c.tur === 'alarm' ? `<button class="btn" data-action="z-ertele" data-dk="5">5 dk ertele</button><button class="btn" data-action="z-ertele" data-dk="10">10 dk</button>` : ''}<button class="btn primary" data-action="z-sustur">Kapat</button></div></div>`;
  document.title = '⏰ ' + c.baslik;
  if (document.hidden && 'Notification' in window && Notification.permission === 'granted') { try { new Notification(c.baslik, { body: c.metin, tag: 'suha-saat', requireInteraction: true }); } catch {} }
  bildirimPlanla();
}
function sustur() { SES.durdur(); ZS.calan = null; const el = $('#zCalan'); el.hidden = true; el.innerHTML = ''; document.title = 'Saat'; }

/* ═════════ Dünya saati ═════════ */
function analog(id) {
  const cizgi = Array.from({ length: 60 }, (_, i) => { const a = i * 6 * Math.PI / 180, uzun = i % 5 === 0, r1 = uzun ? 40 : 43; return `<line x1="${50 + r1 * Math.sin(a)}" y1="${50 - r1 * Math.cos(a)}" x2="${50 + 46 * Math.sin(a)}" y2="${50 - 46 * Math.cos(a)}" class="${uzun ? 'uz' : ''}"/>`; }).join('');
  return `<svg class="zs-analog" id="${id}" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="49" class="kadran"/>${cizgi}
    <line class="ak-s" x1="50" y1="50" x2="50" y2="26"/><line class="ak-d" x1="50" y1="50" x2="50" y2="14"/><line class="ak-sn" x1="50" y1="58" x2="50" y2="10"/><circle cx="50" cy="50" r="2.2" class="orta"/></svg>`;
}
function akrep(svg, s, d, sn) {
  if (!svg) return;
  const r = (el, der) => el.setAttribute('transform', `rotate(${der} 50 50)`);
  r(svg.querySelector('.ak-s'), (s % 12) * 30 + d * 0.5); r(svg.querySelector('.ak-d'), d * 6 + sn * 0.1); r(svg.querySelector('.ak-sn'), sn * 6);
}
function dunyaCiz() {
  $('#zGovde').innerHTML = `
  <div class="zs-dunya">
    <section class="zs-kart zs-yerel">
      ${analog('zAnalog')}
      <div class="zs-yerel-m"><span class="zs-yer">${esc(sehirAd(yerelTz))} · yerel saat</span><b class="zs-dijital" id="zDijital"></b><span class="zs-tarih" id="zTarih"></span></div>
    </section>
    <section class="zs-sehirler">
      <div class="zs-baslik"><h2>Şehirler</h2><div class="spacer"></div><button class="btn sm" data-action="z-sehir-ekle">${IC.plus}Şehir ekle</button></div>
      <div class="zs-sehir-l" id="zSehirler">${ZS.sehirler.map(tz => `<div class="zs-sehir" data-tz="${esc(tz)}"><div class="zs-gece-gunduz"></div><div class="zs-sehir-m"><b>${esc(sehirAd(tz))}</b><span class="zs-fark"></span></div><b class="zs-sehir-saat"></b><button class="icon-btn sm" data-action="z-sehir-sil" data-tz="${esc(tz)}" title="Kaldır">${IC.close}</button></div>`).join('') || '<p class="muted sm zs-bos">Şehir ekleyerek farklı ülkelerdeki saati görebilirsin.</p>'}</div>
    </section>
  </div>`;
  dunyaTazele(new Date());
}
let sonSaniye = -1;
function dunyaTazele(simdi) {
  if (simdi.getSeconds() === sonSaniye && $('#zDijital')?.textContent) return; sonSaniye = simdi.getSeconds();
  const el = $('#zDijital'); if (!el) return;
  el.innerHTML = `${iki(simdi.getHours())}:${iki(simdi.getMinutes())}<small>${iki(simdi.getSeconds())}</small>`;
  $('#zTarih').textContent = simdi.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  akrep($('#zAnalog'), simdi.getHours(), simdi.getMinutes(), simdi.getSeconds());
  const bugun = tzParca(yerelTz, simdi);
  document.querySelectorAll('.zs-sehir[data-tz]').forEach(r => {
    const tz = r.dataset.tz, p = tzParca(tz, simdi), f = tzFark(tz, simdi);
    const gunFark = Math.round((Date.UTC(p.y, p.ay - 1, p.g) - Date.UTC(bugun.y, bugun.ay - 1, bugun.g)) / 864e5);
    r.querySelector('.zs-sehir-saat').textContent = `${iki(p.s)}:${iki(p.d)}`;
    r.querySelector('.zs-fark').textContent = (gunFark ? (gunFark > 0 ? 'Yarın · ' : 'Dün · ') : 'Bugün · ') + farkYaz(f);
    r.querySelector('.zs-gece-gunduz').className = 'zs-gece-gunduz ' + (p.s >= 7 && p.s < 19 ? 'gunduz' : 'gece');
  });
}
function sehirSec() {
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Şehir ekle</h3></header>
    <div class="set-body"><input class="zs-ara" id="zAra" placeholder="Şehir ya da ülke ara" autocomplete="off"><div class="zs-sehir-sec" id="zSecL"></div></div></div></div>`;
  const ciz = () => {
    const q = $('#zAra').value.toLocaleLowerCase('tr').trim();
    $('#zSecL').innerHTML = SEHIR.filter(([tz, ad, ul]) => !ZS.sehirler.includes(tz) && (!q || (ad + ' ' + ul).toLocaleLowerCase('tr').includes(q)))
      .map(([tz, ad, ul]) => `<button data-tz="${tz}"><span><b>${esc(ad)}</b> ${esc(ul)}</span><em>${farkYaz(tzFark(tz))}</em></button>`).join('') || '<p class="muted sm zs-bos">Bulunamadı.</p>';
    document.querySelectorAll('#zSecL [data-tz]').forEach(b => b.onclick = () => { ZS.sehirler.push(b.dataset.tz); kaydet('sehirler'); closeModal(); dunyaCiz(); });
  };
  $('#zAra').addEventListener('input', ciz); ciz(); setTimeout(() => $('#zAra')?.focus(), 50);
}

/* ═════════ Alarm ═════════ */
function sonrakiCalma(a, simdi = new Date()) {
  if (a.ertele) return new Date(a.ertele);
  for (let i = 0; i < 8; i++) {
    const g = new Date(simdi); g.setDate(g.getDate() + i); g.setHours(a.s, a.d, 0, 0);
    if (g <= simdi) continue;
    if (!a.gunler.length || a.gunler.includes((g.getDay() + 6) % 7)) return g;
  }
  return null;
}
function kalanYaz(ms) { const dk = Math.ceil(ms / 60000), s = Math.floor(dk / 60), g = Math.floor(s / 24); return g ? `${g} gün ${s % 24} saat sonra` : s ? `${s} saat ${dk % 60} dakika sonra` : `${dk} dakika sonra`; }
function alarmCiz() {
  const yerelMi = !!yerel().android;
  $('#zGovde').innerHTML = `
  <div class="zs-alarm">
    <div class="zs-baslik"><h2>Alarmlar</h2><span class="muted sm" id="zSonraki"></span><div class="spacer"></div><button class="btn primary" data-action="z-alarm-yeni">${IC.plus}Alarm ekle</button></div>
    ${yerelMi ? '' : yerel().platform === 'windows' ? `<div class="zs-not">${IC.zil}<span>Alarm, program açıkken çalar (küçültülmüş olsa da). Bilgisayar uykudayken çalmaz.</span></div>` : `<div class="zs-not">${IC.zil}<span>Alarm bu sayfa açıkken çalar. Telefon kilitliyken de çalması için <b>Suha Saat Android programını</b> kullan.${'Notification' in window && Notification.permission === 'default' ? ' <button class="btn sm" data-action="z-bildirim-izin">Bildirim izni ver</button>' : ''}</span></div>`}
    <div class="zs-alarm-l">${ZS.alarmlar.map(a => {
      const gun = !a.gunler.length ? 'Bir kez' : a.gunler.length === 7 ? 'Her gün' : JSON.stringify(a.gunler) === '[0,1,2,3,4]' ? 'Hafta içi' : JSON.stringify(a.gunler) === '[5,6]' ? 'Hafta sonu' : a.gunler.map(i => GUNLER[i]).join(' ');
      return `<div class="zs-alarm-s ${a.acik ? '' : 'kapali'}" data-action="z-alarm-duzenle" data-id="${a.id}"><div><b class="zs-alarm-saat">${iki(a.s)}:${iki(a.d)}</b><span>${esc(a.ad || 'Alarm')} · ${gun}${a.ertele ? ' · ertelendi' : ''}</span></div><label class="zs-anahtar"><input type="checkbox" data-alarm-ac="${a.id}" ${a.acik ? 'checked' : ''}><i></i></label></div>`;
    }).join('') || `<div class="zs-bos-buyuk">${IC.alarm2}<b>Alarm yok</b><span>Bir alarm ekle; bir kez ya da seçtiğin günlerde çalar.</span></div>`}</div>
  </div>`;
  document.querySelectorAll('.zs-alarm-s .zs-anahtar').forEach(l => l.addEventListener('click', e => e.stopPropagation()));
  document.querySelectorAll('[data-alarm-ac]').forEach(i => i.addEventListener('change', e => { e.stopPropagation(); const a = ZS.alarmlar.find(x => x.id === i.dataset.alarmAc); a.acik = i.checked; delete a.ertele; kaydet('alarmlar'); bildirimPlanla(); alarmCiz(); if (a.acik) { const n = sonrakiCalma(a); if (n) toast('Alarm ' + kalanYaz(n - new Date()) + ' çalacak'); } }));
  alarmUstTazele(new Date());
}
function alarmUstTazele(simdi) {
  const el = $('#zSonraki'); if (!el || simdi.getSeconds() % 15 && el.textContent) return;
  const s = ZS.alarmlar.filter(a => a.acik).map(a => sonrakiCalma(a, simdi)).filter(Boolean).sort((a, b) => a - b)[0];
  el.textContent = s ? 'Sıradaki: ' + kalanYaz(s - simdi) : '';
}
function alarmDuzenle(id) {
  const a = ZS.alarmlar.find(x => x.id === id) || { id: sid(), s: (new Date().getHours() + 1) % 24, d: 0, gunler: [], ad: '', ses: 'klasik', acik: true, yeni: true };
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>${a.yeni ? 'Yeni alarm' : 'Alarmı düzenle'}</h3></header>
    <form class="set-body zs-form" id="zAF">
      <div class="zs-saat-sec"><input type="number" id="zAS" min="0" max="23" value="${iki(a.s)}" inputmode="numeric" aria-label="Saat"><span>:</span><input type="number" id="zAD" min="0" max="59" value="${iki(a.d)}" inputmode="numeric" aria-label="Dakika"></div>
      <div class="zs-gunler">${GUNLER.map((g, i) => `<button type="button" class="${a.gunler.includes(i) ? 'on' : ''}" data-gun="${i}">${g}</button>`).join('')}</div>
      <div class="zs-hizli"><button type="button" data-hazir="hi">Hafta içi</button><button type="button" data-hazir="hs">Hafta sonu</button><button type="button" data-hazir="her">Her gün</button><button type="button" data-hazir="bir">Bir kez</button></div>
      <label class="nask-l">Ad<input id="zAAd" value="${esc(a.ad)}" maxlength="40" placeholder="Alarm"></label>
      <label class="nask-l">Ses<div class="zs-ses-sec"><select id="zASes">${Object.entries(SES.CESIT).map(([k, v]) => `<option value="${k}" ${a.ses === k ? 'selected' : ''}>${v.ad}</option>`).join('')}</select><button type="button" class="btn sm" id="zDene">${IC.oynat}Dinle</button></div></label>
      <p class="muted sm" id="zAKalan"></p>
      <div class="sticky-actions">${a.yeni ? '' : '<button type="button" class="btn tehlike" id="zASil">Sil</button><div class="spacer"></div>'}<button type="button" class="btn" data-action="close-modal">Vazgeç</button><button class="btn primary">Kaydet</button></div>
    </form></div></div>`;
  let gunler = [...a.gunler];
  const tazele = () => {
    document.querySelectorAll('[data-gun]').forEach(b => b.classList.toggle('on', gunler.includes(+b.dataset.gun)));
    const s = Math.min(23, Math.max(0, +$('#zAS').value || 0)), d = Math.min(59, Math.max(0, +$('#zAD').value || 0)), n = sonrakiCalma({ s, d, gunler });
    $('#zAKalan').textContent = n ? 'Bu alarm ' + kalanYaz(n - new Date()) + ' çalacak.' : '';
  };
  document.querySelectorAll('[data-gun]').forEach(b => b.onclick = () => { const g = +b.dataset.gun; gunler = gunler.includes(g) ? gunler.filter(x => x !== g) : [...gunler, g].sort(); tazele(); });
  document.querySelectorAll('[data-hazir]').forEach(b => b.onclick = () => { gunler = { hi: [0, 1, 2, 3, 4], hs: [5, 6], her: [0, 1, 2, 3, 4, 5, 6], bir: [] }[b.dataset.hazir]; tazele(); });
  ['#zAS', '#zAD'].forEach(s => { $(s).addEventListener('input', tazele); $(s).addEventListener('blur', e => { const i = e.target; i.value = iki(Math.min(+i.max, Math.max(0, +i.value || 0))); }); $(s).addEventListener('focus', e => e.target.select()); });
  $('#zDene').onclick = () => SES.dene($('#zASes').value);
  if ($('#zASil')) $('#zASil').onclick = () => { ZS.alarmlar = ZS.alarmlar.filter(x => x.id !== a.id); kaydet('alarmlar'); bildirimPlanla(); closeModal(); alarmCiz(); };
  $('#zAF').addEventListener('submit', e => {
    e.preventDefault();
    Object.assign(a, { s: Math.min(23, Math.max(0, +$('#zAS').value || 0)), d: Math.min(59, Math.max(0, +$('#zAD').value || 0)), gunler, ad: $('#zAAd').value.trim(), ses: $('#zASes').value, acik: true });
    delete a.ertele;
    if (a.yeni) { delete a.yeni; ZS.alarmlar.push(a); }
    ZS.alarmlar.sort((x, y) => x.s * 60 + x.d - (y.s * 60 + y.d)); kaydet('alarmlar'); bildirimPlanla(); closeModal(); alarmCiz();
    const n = sonrakiCalma(a); if (n) toast('Alarm ' + kalanYaz(n - new Date()) + ' çalacak');
    if (yerel().android) yerel().bildirimIzni?.();
  });
  tazele();
}

/* ═════════ Kronometre ═════════ */
const kronoSure = () => ZS.krono.birikmis + (ZS.krono.bas ? Date.now() - ZS.krono.bas : 0);
function kronoYaz(ms, kisa) { const t = Math.floor(ms / 10), cs = t % 100, sn = Math.floor(t / 100) % 60, dk = Math.floor(t / 6000) % 60, sa = Math.floor(t / 360000); return `${sa ? sa + ':' + iki(dk) : iki(dk)}:${iki(sn)}${kisa ? '' : '<small>,' + iki(cs) + '</small>'}`; }
function kronoCiz() {
  const K = ZS.krono, calisiyor = !!K.bas, sure = kronoSure();
  const turSureleri = K.turlar.map((t, i) => t - (K.turlar[i - 1] || 0)), enIyi = Math.min(...turSureleri), enKotu = Math.max(...turSureleri);
  $('#zGovde').innerHTML = `
  <div class="zs-krono">
    <div class="zs-buyuk-saat" id="zKrono">${kronoYaz(sure)}</div>
    <div class="zs-buyuk-tus">
      <button class="zs-yuvarlak" data-action="${calisiyor ? 'z-krono-tur' : 'z-krono-sifirla'}" ${!calisiyor && !sure ? 'disabled' : ''}>${calisiyor ? IC.bayrak + '<span>Tur</span>' : IC.sifirla + '<span>Sıfırla</span>'}</button>
      <button class="zs-yuvarlak ana ${calisiyor ? 'dur' : ''}" data-action="z-krono-bas">${calisiyor ? IC.durdur + '<span>Durdur</span>' : IC.oynat + '<span>' + (sure ? 'Devam' : 'Başlat') + '</span>'}</button>
    </div>
    ${K.turlar.length ? `<div class="zs-turlar"><div class="zs-tur bas"><span>Tur</span><span>Tur süresi</span><span>Toplam</span></div>${K.turlar.map((t, i) => [i, t]).reverse().map(([i, t]) => { const ts = turSureleri[i]; return `<div class="zs-tur ${K.turlar.length > 2 && ts === enIyi ? 'iyi' : ''} ${K.turlar.length > 2 && ts === enKotu ? 'kotu' : ''}"><span>${i + 1}</span><span>${kronoYaz(ts)}</span><span>${kronoYaz(t)}</span></div>`; }).join('')}</div>` : ''}
  </div>`;
}
let kronoRaf = 0;
function kronoDongu() { cancelAnimationFrame(kronoRaf); const f = () => { const el = $('#zKrono'); if (!el || !ZS.krono.bas) return; el.innerHTML = kronoYaz(kronoSure()); kronoRaf = requestAnimationFrame(f); }; kronoRaf = requestAnimationFrame(f); }

/* ═════════ Zamanlayıcı ═════════ */
function sureYaz(ms) { const sn = Math.ceil(ms / 1000), s = Math.floor(sn / 3600), d = Math.floor(sn / 60) % 60, n = sn % 60; return s ? `${s}:${iki(d)}:${iki(n)}` : `${iki(d)}:${iki(n)}`; }
const HAZIR = [[60, '1 dk'], [180, '3 dk'], [300, '5 dk'], [600, '10 dk'], [900, '15 dk'], [1800, '30 dk'], [3600, '1 saat'], [420, 'Yumurta (7 dk)'], [900, 'Çay demleme'], [240, 'Türk kahvesi dinlenme'], [1200, 'Şekerleme (20 dk)']];
function sayacCiz() {
  $('#zGovde').innerHTML = `
  <div class="zs-sayac">
    <section class="zs-kart zs-sayac-yeni">
      <div class="zs-saat-sec buyuk"><input type="number" id="zSS" min="0" max="99" value="00" inputmode="numeric" aria-label="Saat"><span>:</span><input type="number" id="zSD" min="0" max="59" value="05" inputmode="numeric" aria-label="Dakika"><span>:</span><input type="number" id="zSN" min="0" max="59" value="00" inputmode="numeric" aria-label="Saniye"></div>
      <input class="zs-ara" id="zSAd" maxlength="30" placeholder="Ad (isteğe bağlı): Fırın, ders…">
      <div class="zs-hazir">${HAZIR.map(([s, n]) => `<button data-sn="${s}" data-ad="${/\(|demleme|kahvesi/.test(n) ? esc(n.replace(/ \(.+\)/, '')) : ''}">${n}</button>`).join('')}</div>
      <button class="btn primary zs-genis" data-action="z-sayac-yeni">${IC.oynat}Başlat</button>
    </section>
    <section class="zs-sayac-l" id="zSayaclar">${ZS.sayaclar.map(s => sayacKart(s)).join('')}</section>
  </div>`;
  ['#zSS', '#zSD', '#zSN'].forEach(s => { $(s).addEventListener('blur', e => { const i = e.target; i.value = iki(Math.min(+i.max, Math.max(0, +i.value || 0))); }); $(s).addEventListener('focus', e => e.target.select()); });
  document.querySelectorAll('.zs-hazir button').forEach(b => b.onclick = () => { const sn = +b.dataset.sn; sayacBaslat(sn * 1000, b.dataset.ad || ''); });
  sayacTazele(Date.now());
}
function sayacKart(s) {
  const kalan = s.bitis ? s.bitis - Date.now() : s.kalan ?? s.sure, oran = Math.max(0, Math.min(1, kalan / s.sure));
  return `<div class="zs-sayac-k ${s.bitti ? 'bitti' : ''}" data-id="${s.id}">
    <svg viewBox="0 0 120 120" class="zs-halka"><circle cx="60" cy="60" r="54" class="iz"/><circle cx="60" cy="60" r="54" class="dolu" style="stroke-dashoffset:${339.29 * (1 - oran)}"/></svg>
    <div class="zs-sayac-m"><b class="zs-kalan">${s.bitti ? '00:00' : sureYaz(kalan)}</b><span>${esc(s.ad || sureYaz(s.sure))}</span></div>
    <div class="zs-sayac-tus">${s.bitti ? `<button class="icon-btn" data-action="z-sayac-tekrar" data-id="${s.id}" title="Yeniden başlat">${IC.sifirla}</button>`
      : `<button class="icon-btn" data-action="z-sayac-dur" data-id="${s.id}" title="${s.bitis ? 'Duraklat' : 'Devam'}">${s.bitis ? IC.durdur : IC.oynat}</button><button class="icon-btn" data-action="z-sayac-ekle" data-id="${s.id}" title="1 dakika ekle">+1</button>`}
      <button class="icon-btn" data-action="z-sayac-sil" data-id="${s.id}" title="Kaldır">${IC.close}</button></div></div>`;
}
function sayacTazele(t) {
  for (const s of ZS.sayaclar) {
    const k = document.querySelector(`.zs-sayac-k[data-id="${s.id}"]`); if (!k || !s.bitis) continue;
    const kalan = Math.max(0, s.bitis - t);
    k.querySelector('.zs-kalan').textContent = sureYaz(kalan); k.querySelector('.dolu').style.strokeDashoffset = 339.29 * (1 - kalan / s.sure);
  }
}
function sayacBaslat(ms, ad) {
  if (!(ms >= 1000)) return toast('Süre en az 1 saniye olmalı');
  ZS.sayaclar.unshift({ id: sid(), ad, sure: ms, bitis: Date.now() + ms, ses: 'zil' }); kaydet('sayaclar'); bildirimPlanla(); sayacCiz(); yerel().bildirimIzni?.();
}

/* ═════════ Odak (pomodoro) ═════════ */
const FAZ = { calisma: 'Çalışma', kisa: 'Kısa mola', uzun: 'Uzun mola' };
function odakBugun() { const O = ZS.odak, b = new Date().toDateString(); if (O.tarih !== b) { O.tarih = b; O.tamam = 0; kaydet('odak'); } }
function odakCiz() {
  odakBugun();
  const O = ZS.odak, sure = O[O.faz] * 60000, kalan = O.bitis ? O.bitis - Date.now() : O.kalan ?? sure;
  $('#zGovde').innerHTML = `
  <div class="zs-odak faz-${O.faz}">
    <div class="seg zs-faz">${Object.entries(FAZ).map(([k, n]) => `<button class="${O.faz === k ? 'on' : ''}" data-action="z-odak-faz" data-k="${k}">${n}</button>`).join('')}</div>
    <div class="zs-odak-halka"><svg viewBox="0 0 120 120" class="zs-halka"><circle cx="60" cy="60" r="54" class="iz"/><circle cx="60" cy="60" r="54" class="dolu" id="zOHalka" style="stroke-dashoffset:${339.29 * (1 - Math.max(0, kalan) / sure)}"/></svg>
      <div class="zs-odak-m"><b id="zOKalan">${sureYaz(Math.max(0, kalan))}</b><span>${FAZ[O.faz]}</span></div></div>
    <div class="zs-buyuk-tus">
      <button class="zs-yuvarlak" data-action="z-odak-sifirla">${IC.sifirla}<span>Sıfırla</span></button>
      <button class="zs-yuvarlak ana ${O.bitis ? 'dur' : ''}" data-action="z-odak-bas">${O.bitis ? IC.durdur + '<span>Duraklat</span>' : IC.oynat + '<span>Başlat</span>'}</button>
      <button class="zs-yuvarlak" data-action="z-odak-atla">${IC.forward || '»'}<span>Atla</span></button>
    </div>
    <div class="zs-odak-alt"><div class="zs-noktalar">${Array.from({ length: O.aralik }, (_, i) => `<i class="${i < O.tamam % O.aralik ? 'on' : ''}"></i>`).join('')}</div><span>Bugün <b>${O.tamam}</b> çalışma bitti · ${O.tamam * O.calisma} dk odak</span></div>
    <details class="zs-odak-ayar"><summary>Süreler</summary><div class="zs-odak-izgara">
      ${[['calisma', 'Çalışma (dk)'], ['kisa', 'Kısa mola (dk)'], ['uzun', 'Uzun mola (dk)'], ['aralik', 'Uzun mola her']].map(([k, n]) => `<label class="nask-l">${n}<input type="number" min="1" max="${k === 'aralik' ? 10 : 180}" data-oa="${k}" value="${O[k]}"></label>`).join('')}</div></details>
  </div>`;
  document.querySelectorAll('[data-oa]').forEach(i => i.addEventListener('change', () => { O[i.dataset.oa] = Math.max(1, Math.min(i.dataset.oa === 'aralik' ? 10 : 180, +i.value || 1)); if (!O.bitis) O.kalan = null; kaydet('odak'); odakCiz(); }));
}
function odakTazele(t) {
  const O = ZS.odak; if (!O.bitis) return; const el = $('#zOKalan'); if (!el) return;
  const kalan = Math.max(0, O.bitis - t), sure = O[O.faz] * 60000; el.textContent = sureYaz(kalan); $('#zOHalka').style.strokeDashoffset = 339.29 * (1 - kalan / sure);
  document.title = sureYaz(kalan) + ' · ' + FAZ[O.faz];
}
function odakGec(bitti) {
  const O = ZS.odak; odakBugun();
  if (bitti && O.faz === 'calisma') O.tamam++;
  const onceki = O.faz;
  O.faz = O.faz === 'calisma' ? (O.tamam % O.aralik === 0 && O.tamam ? 'uzun' : 'kisa') : 'calisma';
  O.bitis = null; O.kalan = null;
  if (bitti) { O.bitis = Date.now() + O[O.faz] * 60000; cal({ tur: 'odak', baslik: onceki === 'calisma' ? 'Mola zamanı' : 'Çalışma zamanı', metin: `${FAZ[O.faz]} başladı · ${O[O.faz]} dk`, ses: 'yumusak' }); setTimeout(() => { if (ZS.calan?.tur === 'odak') sustur(); }, 6000); }
  kaydet('odak'); bildirimPlanla(); if (ZS.sekme === 'odak') odakCiz(); else document.title = 'Saat';
}

/* ═════════ Android: telefon kilitliyken bildirimle çalsın ═════════ */
let planT = 0;
function bildirimPlanla() {
  clearTimeout(planT);
  planT = setTimeout(() => {
    const Y = yerel(); if (typeof Y.bildirimPlanla !== 'function') return;
    const liste = [], simdi = new Date();
    for (const a of ZS.alarmlar) {
      if (!a.acik) continue;
      let t = new Date(simdi);
      for (let i = 0; i < 14; i++) { const n = sonrakiCalma(a, t); if (!n) break; liste.push({ zaman: +n, baslik: `${a.ad || 'Alarm'} · ${iki(a.s)}:${iki(a.d)}`, metin: 'Alarm', tur: 'alarm' }); if (a.ertele || !a.gunler.length) break; t = new Date(+n + 1000); }
    }
    for (const s of ZS.sayaclar) if (s.bitis) liste.push({ zaman: s.bitis, baslik: 'Süre doldu', metin: s.ad || sureYaz(s.sure), tur: 'sayac' });
    if (ZS.odak.bitis) liste.push({ zaman: ZS.odak.bitis, baslik: ZS.odak.faz === 'calisma' ? 'Mola zamanı' : 'Çalışma zamanı', metin: FAZ[ZS.odak.faz] + ' bitti', tur: 'odak' });
    Y.bildirimPlanla(liste.filter(x => x.zaman > Date.now() + 1000).sort((a, b) => a.zaman - b.zaman).slice(0, 60));
  }, 300);
}

/* ═════════ Ayarlar ═════════ */
function ayarAc() {
  const t = store.get('theme', 'light');
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet settings"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Ayarlar</h3></header>
    <div class="set-body">
      <section><h4>Görünüm</h4><div class="seg yon-seg">${[['light', 'Cam'], ['dark', 'Koyu'], ['auto', 'Otomatik'], ['flat', 'Düz']].map(([k, n]) => `<button class="${t === k ? 'on' : ''}" data-action="z-tema" data-t="${k}">${n}</button>`).join('')}</div></section>
      <section><h4>Ekran</h4><div class="set-row"><div><b>Ekranı açık tut</b><span>Kronometre, zamanlayıcı ya da odak çalışırken ekran kararmasın.</span></div><label class="zs-anahtar"><input type="checkbox" id="zUyanik" ${store.get('saatUyanik', false) ? 'checked' : ''}><i></i></label></div></section>
      <section><h4>Verilerin</h4><div class="set-row"><div><b>Bu cihazda</b><span>Alarmlar, şehirler, sayaçlar ve odak geçmişi sadece bu cihazda saklanır.</span></div></div></section>
      <section><h4>Uygulama</h4>${typeof aboutRow === 'function' ? aboutRow() : ''}</section>
    </div></div></div>`;
  $('#zUyanik').onchange = e => { store.set('saatUyanik', e.target.checked); uyanikTut(); };
}
let kilit = null;
async function uyanikTut() {
  const gerek = store.get('saatUyanik', false) && (ZS.krono.bas || ZS.sayaclar.some(s => s.bitis) || ZS.odak.bitis);
  try { if (gerek && !kilit && navigator.wakeLock) { kilit = await navigator.wakeLock.request('screen'); kilit.addEventListener('release', () => { kilit = null; }); } else if (!gerek && kilit) { await kilit.release(); kilit = null; } } catch {}
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { uyanikTut(); tik(); } });

/* ═════════ Olaylar ═════════ */
Object.assign(ACTIONS, {
  'z-sekme': el => { ZS.sekme = el.dataset.k; store.set('saatSekme', ZS.sekme); document.title = 'Saat'; sekmeCiz(); if (ZS.sekme === 'krono' && ZS.krono.bas) kronoDongu(); },
  'z-ayar': () => ayarAc(), settings: () => ayarAc(),
  'z-tema': el => { store.set('theme', el.dataset.t); applyTheme(el.dataset.t); ayarAc(); },
  'z-sustur': () => sustur(),
  'z-ertele': el => {
    const c = ZS.calan, a = c && ZS.alarmlar.find(x => x.id === c.id); sustur();
    if (a) { a.ertele = Date.now() + (+el.dataset.dk) * 60000; a.acik = true; kaydet('alarmlar'); bildirimPlanla(); toast(`${el.dataset.dk} dakika sonra yeniden çalacak`); if (ZS.sekme === 'alarm') alarmCiz(); }
  },
  'z-bildirim-izin': async () => { try { await Notification.requestPermission(); } catch {} alarmCiz(); },
  'z-sehir-ekle': () => sehirSec(),
  'z-sehir-sil': el => { ZS.sehirler = ZS.sehirler.filter(x => x !== el.dataset.tz); kaydet('sehirler'); dunyaCiz(); },
  'z-alarm-yeni': () => alarmDuzenle(null),
  'z-alarm-duzenle': el => alarmDuzenle(el.dataset.id),
  'z-krono-bas': () => { const K = ZS.krono; if (K.bas) { K.birikmis += Date.now() - K.bas; K.bas = null; } else K.bas = Date.now(); kaydet('krono'); kronoCiz(); kronoDongu(); uyanikTut(); },
  'z-krono-tur': () => { ZS.krono.turlar.push(kronoSure()); kaydet('krono'); kronoCiz(); kronoDongu(); },
  'z-krono-sifirla': () => { ZS.krono = { bas: null, birikmis: 0, turlar: [] }; kaydet('krono'); kronoCiz(); uyanikTut(); },
  'z-sayac-yeni': () => { const ms = ((+$('#zSS').value || 0) * 3600 + (+$('#zSD').value || 0) * 60 + (+$('#zSN').value || 0)) * 1000; sayacBaslat(ms, $('#zSAd').value.trim()); uyanikTut(); },
  'z-sayac-dur': el => { const s = ZS.sayaclar.find(x => x.id === el.dataset.id); if (!s) return; if (s.bitis) { s.kalan = s.bitis - Date.now(); s.bitis = null; } else { s.bitis = Date.now() + (s.kalan ?? s.sure); s.kalan = null; } kaydet('sayaclar'); bildirimPlanla(); sayacCiz(); uyanikTut(); },
  'z-sayac-ekle': el => { const s = ZS.sayaclar.find(x => x.id === el.dataset.id); if (!s) return; if (s.bitis) s.bitis += 60000; else s.kalan = (s.kalan ?? s.sure) + 60000; s.sure += 60000; kaydet('sayaclar'); bildirimPlanla(); sayacCiz(); },
  'z-sayac-tekrar': el => { const s = ZS.sayaclar.find(x => x.id === el.dataset.id); if (!s) return; s.bitti = false; s.bitis = Date.now() + s.sure; s.kalan = null; kaydet('sayaclar'); bildirimPlanla(); sayacCiz(); },
  'z-sayac-sil': el => { ZS.sayaclar = ZS.sayaclar.filter(x => x.id !== el.dataset.id); kaydet('sayaclar'); bildirimPlanla(); sayacCiz(); uyanikTut(); },
  'z-odak-bas': () => { const O = ZS.odak; if (O.bitis) { O.kalan = O.bitis - Date.now(); O.bitis = null; document.title = 'Saat'; } else { O.bitis = Date.now() + (O.kalan ?? O[O.faz] * 60000); O.kalan = null; yerel().bildirimIzni?.(); } kaydet('odak'); bildirimPlanla(); odakCiz(); uyanikTut(); },
  'z-odak-sifirla': () => { const O = ZS.odak; O.bitis = null; O.kalan = null; kaydet('odak'); bildirimPlanla(); document.title = 'Saat'; odakCiz(); uyanikTut(); },
  'z-odak-atla': () => odakGec(false),
  'z-odak-faz': el => { const O = ZS.odak; O.faz = el.dataset.k; O.bitis = null; O.kalan = null; kaydet('odak'); bildirimPlanla(); document.title = 'Saat'; odakCiz(); }
});
if (ZS.krono.bas) setTimeout(kronoDongu, 50);
