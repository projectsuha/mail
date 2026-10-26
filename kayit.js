/* ───────────── Ses Kaydedici ─────────────
   Kaydet (duraklat/devam, işaret koy), dinle (hız, ±15 sn, işaretler), kırp, yeniden adlandır, paylaş/indir.
   Kayıtlar sadece bu cihazda (IndexedDB) saklanır; hiçbir yere gönderilmez. Giriş gerekmez.
   Kayıt sürerken parçalar düzenli kaydedilir: sayfa kapanır ya da çökerse yarım kayıt kurtarılır. */
'use strict';

window.APP_NAME = 'Ses Kaydedici';
window.APP_ICON = 'kayit-apple.png?v=8';
window.APP_LEAD = 'Sesli not ve ses kaydı. Kayıtların sadece bu cihazda kalır. Ücretsiz, reklamsız.';

const KSVG = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
Object.assign(IC, {
  mikrofon: KSVG('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>'),
  oynat: KSVG('<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>'),
  durdur: KSVG('<path d="M8 5.5v13M16 5.5v13" stroke-width="3"/>'),
  bitir: KSVG('<rect x="6.5" y="6.5" width="11" height="11" rx="2" fill="currentColor"/>'),
  geri15: KSVG('<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 4v4.5h4.5"/><text x="12" y="15.2" font-size="7" text-anchor="middle" fill="currentColor" stroke="none" font-weight="700">15</text>'),
  ileri15: KSVG('<path d="M20 12a8 8 0 1 1-2.4-5.7L20 8.5"/><path d="M20 4v4.5h-4.5"/><text x="12" y="15.2" font-size="7" text-anchor="middle" fill="currentColor" stroke="none" font-weight="700">15</text>'),
  isaret: KSVG('<path d="M6 21V4h12l-3 4.5L18 13H6"/>'),
  makas: KSVG('<circle cx="6" cy="6" r="2.6"/><circle cx="6" cy="18" r="2.6"/><path d="M8.2 7.4 20 17M8.2 16.6 20 7"/>'),
  indir: KSVG('<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/>'),
  paylas: KSVG('<path d="M12 15V4M8 7.5 12 3.5l4 4"/><path d="M6.5 11H5.5v9h13v-9h-1"/>'),
  kalem: KSVG('<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/>'),
  yildiz: KSVG('<path d="m12 3.5 2.6 5.3 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z"/>')
});

/* ═════════ Depo (IndexedDB) ═════════ */
const DEPO = (() => {
  let db = null;
  const ac = () => db ? Promise.resolve(db) : new Promise((res, rej) => {
    const r = indexedDB.open('suha-kayit', 1);
    r.onupgradeneeded = () => { const d = r.result; d.createObjectStore('kayitlar', { keyPath: 'id' }); d.createObjectStore('sesler'); d.createObjectStore('yarim'); };
    r.onsuccess = () => { db = r.result; res(db); }; r.onerror = () => rej(r.error);
  });
  const is = (ad, mod, f) => ac().then(d => new Promise((res, rej) => { const t = d.transaction(ad, mod), s = t.objectStore(ad), sonuc = f(s); t.oncomplete = () => res(sonuc && 'result' in sonuc ? sonuc.result : undefined); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error || new Error('İptal')); }));
  return {
    hepsi: () => is('kayitlar', 'readonly', s => s.getAll()),
    koy: k => is('kayitlar', 'readwrite', s => s.put(k)),
    sil: id => ac().then(d => new Promise((res, rej) => { const t = d.transaction(['kayitlar', 'sesler'], 'readwrite'); t.objectStore('kayitlar').delete(id); t.objectStore('sesler').delete(id); t.oncomplete = res; t.onerror = () => rej(t.error); })),
    sesKoy: (id, blob) => is('sesler', 'readwrite', s => s.put(blob, id)),
    ses: id => is('sesler', 'readonly', s => s.get(id)),
    yarimKoy: v => is('yarim', 'readwrite', s => s.put(v, 'son')),
    yarim: () => is('yarim', 'readonly', s => s.get('son')),
    yarimSil: () => is('yarim', 'readwrite', s => s.delete('son'))
  };
})();

/* ═════════ Durum ═════════ */
const KY = {
  liste: [],          // { id, ad, zaman, sure (ms), tur, boyut, tepe: [0..1], isaretler: [ms], yildiz }
  secili: null,
  ara: '',
  ayar: Object.assign({ kalite: 'standart', gurultu: true }, store.get('kayitAyar', {})),
  kayit: null,        // aktif kayıt
  calan: null         // { id, ses (Audio), url }
};
const sayi = (n, b = 0) => Number(n).toLocaleString('tr-TR', { minimumFractionDigits: b, maximumFractionDigits: b });
const iki = n => String(n).padStart(2, '0');
const sureYaz = (ms, ondalik) => { const t = Math.max(0, ms) / 1000, s = Math.floor(t / 3600), d = Math.floor(t / 60) % 60, n = Math.floor(t) % 60; return (s ? s + ':' + iki(d) : d) + ':' + iki(n) + (ondalik ? ',' + Math.floor(t * 10 % 10) : ''); };
const boyutYaz = b => b < 1048576 ? sayi(b / 1024, 0) + ' KB' : sayi(b / 1048576, 1) + ' MB';
const tarihYaz = t => { const d = new Date(t), b = new Date(); const ayni = d.toDateString() === b.toDateString(); b.setDate(b.getDate() - 1); const dun = d.toDateString() === b.toDateString(); return (ayni ? 'Bugün' : dun ? 'Dün' : d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: d.getFullYear() === new Date().getFullYear() ? undefined : 'numeric' })) + ' ' + d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }); };
const sid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const uzanti = tur => /mp4|aac|m4a/.test(tur) ? 'm4a' : /ogg/.test(tur) ? 'ogg' : /wav/.test(tur) ? 'wav' : /mpeg/.test(tur) ? 'mp3' : 'webm';
const guvenliAd = s => String(s || 'kayit').replace(/[\\/:*?"<>|\x00-\x1f]+/g, '-').trim().slice(0, 80) || 'kayit';
function sonrakiAd() {
  const n = KY.liste.reduce((m, k) => { const r = /^Kayıt (\d+)$/.exec(k.ad); return r ? Math.max(m, +r[1]) : m; }, 0);
  return 'Kayıt ' + (n + 1);
}

/* ═════════ Kayıt ═════════ */
function turSec() {
  if (typeof MediaRecorder === 'undefined') return null;
  for (const t of ['audio/webm;codecs=opus', 'audio/mp4;codecs=mp4a.40.2', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/webm']) if (MediaRecorder.isTypeSupported?.(t)) return t;
  return '';
}
async function kayitBaslat() {
  if (KY.kayit) return;
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') return toast('Bu tarayıcı ses kaydını desteklemiyor');
  calmaDurdur();
  let akis;
  try { akis = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: KY.ayar.gurultu, noiseSuppression: KY.ayar.gurultu, autoGainControl: KY.ayar.gurultu, channelCount: 1 } }); }
  catch (e) { return toast(e && e.name === 'NotAllowedError' ? 'Mikrofon izni verilmedi. Tarayıcı ya da telefon ayarlarından izin ver.' : 'Mikrofon açılamadı'); }
  const tur = turSec(), bitHizi = KY.ayar.kalite === 'yuksek' ? 128000 : 48000;
  let kaydedici;
  try { kaydedici = new MediaRecorder(akis, tur ? { mimeType: tur, audioBitsPerSecond: bitHizi } : { audioBitsPerSecond: bitHizi }); }
  catch { kaydedici = new MediaRecorder(akis); }
  const AC = window.AudioContext || window.webkitAudioContext, bag = new AC(), analiz = bag.createAnalyser();
  analiz.fftSize = 1024; bag.createMediaStreamSource(akis).connect(analiz);
  const K = KY.kayit = { id: sid(), ad: sonrakiAd(), zaman: Date.now(), akis, kaydedici, bag, analiz, tampon: new Float32Array(analiz.fftSize), parcalar: [], tepe: [], isaretler: [], birikmis: 0, bas: performance.now(), duraklatildi: false, tur: kaydedici.mimeType || tur || 'audio/webm', sonTepe: 0, enCok: 0, sonYedek: Date.now() };
  kaydedici.ondataavailable = e => { if (e.data && e.data.size) { K.parcalar.push(e.data); yarimYedekle(); } };
  kaydedici.onstop = () => kayitBitti(K);
  kaydedici.start(1000);
  uyanikTut(true); titret(30);
  kayitCiz(); kayitDongu();
}
function kayitSure() { const K = KY.kayit; if (!K) return 0; return K.birikmis + (K.duraklatildi ? 0 : performance.now() - K.bas); }
function kayitDuraklat() {
  const K = KY.kayit; if (!K) return;
  if (K.duraklatildi) { K.kaydedici.resume(); K.bas = performance.now(); K.duraklatildi = false; }
  else { K.kaydedici.pause(); K.birikmis += performance.now() - K.bas; K.duraklatildi = true; }
  kayitCiz();
}
function kayitIsaret() { const K = KY.kayit; if (!K) return; K.isaretler.push(Math.round(kayitSure())); titret(20); toast('İşaret kondu · ' + sureYaz(kayitSure())); kayitCiz(); }
function kayitBitir() { const K = KY.kayit; if (!K) return; K.sure = Math.round(kayitSure()); if (K.duraklatildi) K.kaydedici.resume(); K.kaydedici.stop(); }
function kayitIptal() {
  const K = KY.kayit; if (!K) return;
  K.iptal = true; K.kaydedici.stop();
}
async function kayitBitti(K) {
  K.akis.getTracks().forEach(t => t.stop()); try { K.bag.close(); } catch {}
  KY.kayit = null; uyanikTut(false);
  if (K.iptal) { await DEPO.yarimSil().catch(() => {}); kabukKayitCiz(); toast('Kayıt silindi'); return; }
  const blob = new Blob(K.parcalar, { type: K.tur.split(';')[0] });
  if (!blob.size) { kabukKayitCiz(); return toast('Kayıt boş'); }
  const k = { id: K.id, ad: K.ad, zaman: K.zaman, sure: K.sure || Math.round(kayitSure()), tur: blob.type, boyut: blob.size, tepe: tepeSikistir(K.tepe), isaretler: K.isaretler, yildiz: false };
  try { await DEPO.sesKoy(k.id, blob); await DEPO.koy(k); await DEPO.yarimSil(); }
  catch (e) { toast('Kaydedilemedi: cihazda yer kalmamış olabilir'); return; }
  KY.liste.unshift(k); KY.secili = k.id;
  kalici();
  kabukKayitCiz(); listeCiz(); oynaticiCiz(); titret([20, 40, 20]);
  toast(`${k.ad} kaydedildi · ${sureYaz(k.sure)}`);
}
// Yarım kayıt yedeği: en çok 5 sn'de bir parçaları tek dosya olarak saklar
function yarimYedekle() {
  const K = KY.kayit; if (!K || Date.now() - K.sonYedek < 5000) return; K.sonYedek = Date.now();
  DEPO.yarimKoy({ id: K.id, ad: K.ad, zaman: K.zaman, sure: Math.round(kayitSure()), tur: K.tur.split(';')[0], tepe: tepeSikistir(K.tepe), isaretler: K.isaretler, blob: new Blob(K.parcalar, { type: K.tur.split(';')[0] }) }).catch(() => {});
}
async function yarimKurtar() {
  try {
    const y = await DEPO.yarim(); if (!y || !y.blob || !y.blob.size) return;
    const k = { id: y.id, ad: y.ad + ' (kurtarıldı)', zaman: y.zaman, sure: y.sure, tur: y.tur, boyut: y.blob.size, tepe: y.tepe, isaretler: y.isaretler || [], yildiz: false };
    await DEPO.sesKoy(k.id, y.blob); await DEPO.koy(k); await DEPO.yarimSil();
    KY.liste.unshift(k); listeCiz();
    toast('Yarım kalan bir kayıt kurtarıldı: ' + esc(k.ad), [['Göster', () => sec(k.id)]], 8000);
  } catch {}
}
// Dalga: kayıt sırasında saniyede ~20 tepe değeri; saklarken en çok 600'e indirgenir
function tepeSikistir(l, n = 600) {
  if (l.length <= n) return l.map(v => Math.round(v * 100) / 100);
  const o = l.length / n, r = [];
  for (let i = 0; i < n; i++) { let m = 0; for (let j = Math.floor(i * o); j < Math.floor((i + 1) * o); j++) m = Math.max(m, l[j]); r.push(Math.round(m * 100) / 100); }
  return r;
}
function kayitDongu() {
  const K = KY.kayit; if (!K) return;
  K.analiz.getFloatTimeDomainData(K.tampon);
  let tepe = 0; for (const v of K.tampon) tepe = Math.max(tepe, Math.abs(v));
  K.enCok = Math.max(K.enCok, tepe);
  const t = performance.now();
  if (!K.duraklatildi && t - K.sonTepe >= 50) { K.sonTepe = t; K.tepe.push(Math.min(1, Math.sqrt(K.enCok) * 1.1)); K.enCok = 0; }
  const s = $('#rSure'); if (s) s.textContent = sureYaz(kayitSure(), true);
  canliDalga();
  requestAnimationFrame(kayitDongu);
}
function canliDalga() {
  const c = $('#rDalga'); if (!c) return; const K = KY.kayit;
  const w = c.clientWidth, h = c.clientHeight, dpr = devicePixelRatio || 1;
  if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
  const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
  const ad = 4, n = Math.floor(w / ad), l = K.tepe.slice(-n);
  g.fillStyle = K.duraklatildi ? '#9aa3b0' : '#e5484d';
  l.forEach((v, i) => { const y = Math.max(2, v * h * 0.9); g.fillRect(w - (l.length - i) * ad, (h - y) / 2, ad - 1.5, y); });
  // işaretler
  g.fillStyle = '#3d5afe';
  const birim = 50;   // ms / tepe
  for (const m of K.isaretler) { const i = Math.round(m / birim), x = w - (K.tepe.length - i) * ad; if (x >= 0) g.fillRect(x, 0, 2, h); }
}

/* ═════════ Oynatma ═════════ */
async function calmaHazirla(k) {
  if (KY.calan?.id === k.id) return KY.calan;
  calmaDurdur();
  const blob = await DEPO.ses(k.id); if (!blob) { toast('Ses dosyası bulunamadı'); return null; }
  const url = URL.createObjectURL(blob), ses = new Audio(url);
  ses.preload = 'auto'; ses.playbackRate = store.get('kayitHiz', 1);
  const C = KY.calan = { id: k.id, ses, url, blob, sure: k.sure / 1000 };
  // Chrome'un webm kayıtlarında süre bilinmez (Infinity): bir kez sona atlayınca düzelir
  ses.addEventListener('loadedmetadata', () => { if (!isFinite(ses.duration)) { C.duzeltiliyor = true; ses.currentTime = 1e7; } });
  ses.addEventListener('durationchange', () => { if (C.duzeltiliyor && isFinite(ses.duration)) { C.duzeltiliyor = false; ses.currentTime = 0; } if (isFinite(ses.duration) && ses.duration > 0) C.sure = ses.duration; });
  ses.addEventListener('timeupdate', () => oynaticiTazele());
  ses.addEventListener('play', () => { oynaticiTazele(true); medyaOturumu(k); });
  ses.addEventListener('pause', () => oynaticiTazele(true));
  ses.addEventListener('ended', () => { ses.currentTime = 0; oynaticiTazele(true); });
  return C;
}
function calmaDurdur() { const C = KY.calan; if (!C) return; C.ses.pause(); URL.revokeObjectURL(C.url); KY.calan = null; }
async function calDuraklat(id) {
  const k = KY.liste.find(x => x.id === id); if (!k) return;
  if (KY.kayit) return toast('Önce kaydı bitir');
  const C = await calmaHazirla(k); if (!C) return;
  if (C.ses.paused) { try { await C.ses.play(); } catch { toast('Çalınamadı'); } } else C.ses.pause();
}
function atla(sn) { const C = KY.calan; if (!C) return; C.ses.currentTime = Math.max(0, Math.min(C.sure || 0, C.ses.currentTime + sn)); oynaticiTazele(); }
function konumaGit(oran) { const C = KY.calan; if (!C || !C.sure) return; C.ses.currentTime = Math.max(0, Math.min(C.sure - 0.05, oran * C.sure)); oynaticiTazele(); }
function medyaOturumu(k) {
  if (!('mediaSession' in navigator)) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({ title: k.ad, artist: 'Ses Kaydedici', artwork: [{ src: 'kayit-512.png', sizes: '512x512', type: 'image/png' }] });
    navigator.mediaSession.setActionHandler('play', () => KY.calan?.ses.play());
    navigator.mediaSession.setActionHandler('pause', () => KY.calan?.ses.pause());
    navigator.mediaSession.setActionHandler('seekbackward', () => atla(-15));
    navigator.mediaSession.setActionHandler('seekforward', () => atla(15));
  } catch {}
}

/* ═════════ Görünüm ═════════ */
function kabuk() {
  $('#app').innerHTML = `
  <div class="sk-kabuk">
    <header class="sk-bas">
      <div class="brand-mark sm">${IC.mikrofon}</div><h1>Ses Kaydedici</h1>
      <div class="spacer"></div>
      <button class="icon-btn" data-action="r-ayar" title="Ayarlar">${IC.gear}</button>
    </header>
    <main class="sk-govde">
      <section class="sk-sol">
        <div class="sk-ara-kutu">${IC.search}<input id="rAra" placeholder="Kayıtlarda ara" autocomplete="off"></div>
        <div class="sk-liste" id="rListe"></div>
      </section>
      <section class="sk-sag" id="rOynatici"></section>
    </main>
    <div class="sk-kayit" id="rKayit"></div>
  </div>`;
  $('#rAra').oninput = e => { KY.ara = e.target.value.trim().toLocaleLowerCase('tr'); listeCiz(); };
}
function kabukKayitCiz() {
  document.body.classList.toggle('kaydediyor', !!KY.kayit);
  const el = $('#rKayit'); if (!el) return;
  if (!KY.kayit) {
    el.innerHTML = `<button class="sk-kaydet" data-action="r-kaydet" title="Kaydet" aria-label="Kaydı başlat"><i></i></button>`;
    return;
  }
  kayitCiz();
}
function kayitCiz() {
  const el = $('#rKayit'), K = KY.kayit; if (!el || !K) return;
  el.innerHTML = `<div class="sk-kayit-ic">
    <div class="sk-kayit-bas"><span class="sk-nokta ${K.duraklatildi ? 'dur' : ''}"></span><b>${esc(K.ad)}</b><span class="spacer"></span><span class="muted sm">${K.duraklatildi ? 'Duraklatıldı' : 'Kaydediliyor'}${K.isaretler.length ? ' · ' + K.isaretler.length + ' işaret' : ''}</span></div>
    <canvas id="rDalga" class="sk-canli"></canvas>
    <div class="sk-sure" id="rSure">${sureYaz(kayitSure(), true)}</div>
    <div class="sk-kayit-tus">
      <button class="sk-yan" data-action="r-iptal" title="Sil">${IC.close}<span>Sil</span></button>
      <button class="sk-yan" data-action="r-duraklat">${K.duraklatildi ? IC.mikrofon + '<span>Devam</span>' : IC.durdur + '<span>Duraklat</span>'}</button>
      <button class="sk-bitir" data-action="r-bitir" title="Bitir ve kaydet">${IC.bitir}</button>
      <button class="sk-yan" data-action="r-isaret">${IC.isaret}<span>İşaret</span></button>
      <span class="sk-yan bos"></span>
    </div></div>`;
}
function listeCiz() {
  const el = $('#rListe'); if (!el) return;
  const l = KY.liste.filter(k => !KY.ara || k.ad.toLocaleLowerCase('tr').includes(KY.ara));
  if (!KY.liste.length) { el.innerHTML = `<div class="sk-bos">${IC.mikrofon}<b>Henüz kayıt yok</b><span>Aşağıdaki kırmızı düğmeye bas ve konuş. Kayıtların sadece bu cihazda saklanır.</span></div>`; return; }
  if (!l.length) { el.innerHTML = '<p class="muted sm sk-bos-k">Bulunamadı.</p>'; return; }
  el.innerHTML = l.map(k => `<button class="sk-oge ${k.id === KY.secili ? 'on' : ''}" data-action="r-sec" data-id="${k.id}">
    <span class="sk-oge-m"><b>${k.yildiz ? `<i class="yz">${IC.yildiz}</i>` : ''}${esc(k.ad)}</b><span>${tarihYaz(k.zaman)}</span></span>
    <span class="sk-oge-s">${sureYaz(k.sure)}${k.isaretler?.length ? `<small>${IC.isaret}${k.isaretler.length}</small>` : ''}</span></button>`).join('');
}
function dalgaSvg(tepe, isaretler, sure, kirp) {
  const n = Math.max(1, tepe.length), W = 600, H = 80, gen = W / n;
  const cubuk = tepe.map((v, i) => { const y = Math.max(1.5, v * H * 0.92); return `<rect x="${(i * gen).toFixed(2)}" y="${((H - y) / 2).toFixed(1)}" width="${Math.max(0.8, gen * 0.62).toFixed(2)}" height="${y.toFixed(1)}" rx="0.8"/>`; }).join('');
  const isr = (isaretler || []).map(m => `<line x1="${(m / sure * W).toFixed(1)}" x2="${(m / sure * W).toFixed(1)}" y1="0" y2="${H}" class="isr"/>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" class="sk-dalga-svg"><defs><clipPath id="rIlerleme"><rect id="rIlerlemeR" x="0" y="0" width="0" height="${H}"/></clipPath></defs>
    <g class="arka">${cubuk}</g><g class="on" clip-path="url(#rIlerleme)">${cubuk}</g>${isr}<line id="rImlec" x1="0" x2="0" y1="0" y2="${H}" class="imlec"/>${kirp ? '<rect id="rKirpSol" class="kirp" x="0" y="0" width="0" height="' + H + '"/><rect id="rKirpSag" class="kirp" y="0" width="0" height="' + H + '"/>' : ''}</svg>`;
}
function oynaticiCiz() {
  const el = $('#rOynatici'); if (!el) return;
  const k = KY.liste.find(x => x.id === KY.secili);
  document.body.classList.toggle('sk-acik', !!k);
  if (!k) { el.innerHTML = KY.liste.length ? `<div class="sk-bos sag">${IC.oynat}<span>Dinlemek için soldan bir kayıt seç.</span></div>` : ''; return; }
  const hiz = store.get('kayitHiz', 1);
  el.innerHTML = `<div class="sk-oynatici">
    <div class="sk-o-bas"><button class="icon-btn sk-geri" data-action="r-kapat" title="Listeye dön">${IC.back}</button>
      <div class="sk-o-ad"><b>${esc(k.ad)}</b><span>${tarihYaz(k.zaman)} · ${boyutYaz(k.boyut)} · ${uzanti(k.tur).toUpperCase()}</span></div>
      <button class="icon-btn ${k.yildiz ? 'yildizli' : ''}" data-action="r-yildiz" title="Yıldızla">${IC.yildiz}</button></div>
    <div class="sk-dalga" id="rDalgaO">${dalgaSvg(k.tepe || [], k.isaretler, k.sure, false)}</div>
    <div class="sk-zaman"><span id="rSimdi">0:00</span><span id="rToplam">${sureYaz(k.sure)}</span></div>
    <div class="sk-o-tus">
      <button class="sk-hiz" data-action="r-hiz" title="Hız">${sayi(hiz, hiz % 1 ? (hiz * 100 % 10 ? 2 : 1) : 0)}×</button>
      <button class="icon-btn buyuk" data-action="r-geri">${IC.geri15}</button>
      <button class="sk-oynat" data-action="r-oynat" id="rOynat">${IC.oynat}</button>
      <button class="icon-btn buyuk" data-action="r-ileri">${IC.ileri15}</button>
      <button class="sk-hiz bos"></button>
    </div>
    ${k.isaretler?.length ? `<div class="sk-isaretler"><h4>İşaretler</h4>${k.isaretler.map((m, i) => `<button data-action="r-isarete" data-ms="${m}">${IC.isaret}<span>İşaret ${i + 1}</span><b>${sureYaz(m)}</b></button>`).join('')}</div>` : ''}
    <div class="sk-islem">
      <button class="btn" data-action="r-ad">${IC.kalem}Adını değiştir</button>
      <button class="btn" data-action="r-kirp">${IC.makas}Kırp</button>
      ${navigator.share ? `<button class="btn" data-action="r-paylas">${IC.paylas}Paylaş</button>` : ''}
      <button class="btn" data-action="r-indir">${IC.indir}İndir</button>
      <button class="btn tehlike" data-action="r-sil">${IC.trash}Sil</button>
    </div></div>`;
  // Dalgaya dokunup sürükleyerek ilerle
  const d = $('#rDalgaO');
  let tut = false;
  const git = e => { const r = d.getBoundingClientRect(); konumaGit((e.clientX - r.left) / r.width); };
  d.onpointerdown = async e => { tut = true; d.setPointerCapture(e.pointerId); await calmaHazirla(k); git(e); };
  d.onpointermove = e => { if (tut) git(e); };
  d.onpointerup = d.onpointercancel = () => { tut = false; };
  oynaticiTazele(true);
}
function oynaticiTazele(tus) {
  const C = KY.calan, k = KY.liste.find(x => x.id === KY.secili); if (!k || !$('#rSimdi')) return;
  const ayni = C && C.id === k.id, t = ayni ? C.ses.currentTime : 0, sure = ayni && C.sure ? C.sure : k.sure / 1000;
  const oran = Math.max(0, Math.min(1, sure ? t / sure : 0));
  $('#rSimdi').textContent = sureYaz(t * 1000); $('#rIlerlemeR')?.setAttribute('width', (oran * 600).toFixed(1));
  const im = $('#rImlec'); if (im) { im.setAttribute('x1', (oran * 600).toFixed(1)); im.setAttribute('x2', (oran * 600).toFixed(1)); }
  if (tus) { const b = $('#rOynat'); if (b) b.innerHTML = ayni && !C.ses.paused ? IC.durdur : IC.oynat; }
}

/* ═════════ Kırpma ═════════ */
function kirpAc() {
  const k = KY.liste.find(x => x.id === KY.secili); if (!k) return;
  calmaDurdur();
  let bas = 0, son = 1;
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask sk-kirp-sayfa"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Kırp</h3></header>
    <div class="set-body">
      <p class="muted sm">Tutmak istediğin bölümü kenarlardaki tutamaçları sürükleyerek seç.</p>
      <div class="sk-kirp" id="rKirp">${dalgaSvg(k.tepe || [], k.isaretler, k.sure, true)}<span class="tut sol" id="rTutSol"></span><span class="tut sag" id="rTutSag"></span></div>
      <div class="sk-zaman"><span id="rKBas">0:00</span><b id="rKSure">${sureYaz(k.sure)}</b><span id="rKSon">${sureYaz(k.sure)}</span></div>
      <div class="sk-kirp-tus"><button type="button" class="btn" id="rKDinle">${IC.oynat}Seçimi dinle</button></div>
      <div class="sticky-actions"><div class="spacer"></div><button type="button" class="btn" data-action="close-modal">Vazgeç</button><button type="button" class="btn" id="rKYeni">Yeni kayıt olarak kaydet</button><button type="button" class="btn primary" id="rKTamam">Kırp</button></div>
    </div></div></div>`;
  const kutu = $('#rKirp');
  const tazele = () => {
    $('#rKirpSol').setAttribute('width', (bas * 600).toFixed(1)); $('#rKirpSag').setAttribute('x', (son * 600).toFixed(1)); $('#rKirpSag').setAttribute('width', ((1 - son) * 600).toFixed(1));
    $('#rTutSol').style.left = (bas * 100) + '%'; $('#rTutSag').style.left = (son * 100) + '%';
    $('#rKBas').textContent = sureYaz(bas * k.sure); $('#rKSon').textContent = sureYaz(son * k.sure); $('#rKSure').textContent = sureYaz((son - bas) * k.sure);
  };
  let hangi = null;
  kutu.onpointerdown = e => { const r = kutu.getBoundingClientRect(), x = (e.clientX - r.left) / r.width; hangi = Math.abs(x - bas) < Math.abs(x - son) ? 'bas' : 'son'; kutu.setPointerCapture(e.pointerId); kutu.onpointermove(e); };
  kutu.onpointermove = e => { if (!hangi) return; const r = kutu.getBoundingClientRect(), x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), enAz = 500 / k.sure; if (hangi === 'bas') bas = Math.min(x, son - enAz); else son = Math.max(x, bas + enAz); tazele(); };
  kutu.onpointerup = kutu.onpointercancel = () => { hangi = null; };
  let dinle = null;
  $('#rKDinle').onclick = async () => {
    if (dinle) { dinle.pause(); URL.revokeObjectURL(dinle.src); dinle = null; $('#rKDinle').innerHTML = IC.oynat + 'Seçimi dinle'; return; }
    const blob = await DEPO.ses(k.id); dinle = new Audio(URL.createObjectURL(blob));
    dinle.addEventListener('loadedmetadata', () => { dinle.currentTime = bas * k.sure / 1000; dinle.play(); });
    dinle.addEventListener('timeupdate', () => { if (dinle && dinle.currentTime >= son * k.sure / 1000) $('#rKDinle').click(); });
    $('#rKDinle').innerHTML = IC.durdur + 'Durdur';
  };
  const yap = async yeni => {
    if (dinle) $('#rKDinle').click();
    if (bas < 0.001 && son > 0.999) { closeModal(); return; }
    const b = $('#rKTamam'); b.disabled = true; b.textContent = 'Kırpılıyor…';
    try { await kirp(k, bas, son, yeni); closeModal(); }
    catch (e) { b.disabled = false; b.textContent = 'Kırp'; toast('Kırpılamadı: ' + (e.message || e)); }
  };
  $('#rKTamam').onclick = () => yap(false); $('#rKYeni').onclick = () => yap(true);
  tazele();
}
// Kırpılan bölüm WAV olarak kaydedilir (her cihazda çalar; boyutu biraz büyür)
async function kirp(k, bas, son, yeni) {
  const blob = await DEPO.ses(k.id);
  const AC = window.AudioContext || window.webkitAudioContext, bag = new AC();
  const tampon = await bag.decodeAudioData(await blob.arrayBuffer()); try { bag.close(); } catch {}
  const hz = tampon.sampleRate, i0 = Math.floor(bas * tampon.duration * hz), i1 = Math.min(tampon.length, Math.ceil(son * tampon.duration * hz));
  const kanal = tampon.getChannelData(0).subarray(i0, i1);
  // Boyut için 22,05 kHz'e indir (konuşma için yeterli; yüksek kalitede asıl hız)
  const hedefHz = KY.ayar.kalite === 'yuksek' ? hz : Math.min(hz, 22050), oran = hz / hedefHz, n = Math.floor(kanal.length / oran);
  const ornek = new Float32Array(n); for (let i = 0; i < n; i++) ornek[i] = kanal[Math.floor(i * oran)];
  const wav = wavYap(ornek, hedefHz);
  const msBas = bas * k.sure, msSon = son * k.sure, sure = Math.round(n / hedefHz * 1000);
  const tepeBas = Math.floor(bas * (k.tepe || []).length), tepeSon = Math.ceil(son * (k.tepe || []).length);
  const yeniK = { ...k, sure, tur: 'audio/wav', boyut: wav.size, tepe: (k.tepe || []).slice(tepeBas, tepeSon), isaretler: (k.isaretler || []).filter(m => m >= msBas && m <= msSon).map(m => Math.round(m - msBas)) };
  if (yeni) { yeniK.id = sid(); yeniK.ad = k.ad + ' (kırpılmış)'; yeniK.zaman = Date.now(); KY.liste.unshift(yeniK); }
  else Object.assign(k, yeniK);
  await DEPO.sesKoy(yeniK.id, wav); await DEPO.koy(yeni ? yeniK : k);
  calmaDurdur(); KY.secili = yeniK.id; listeCiz(); oynaticiCiz();
  toast(yeni ? 'Kırpılmış kopya kaydedildi' : 'Kırpıldı · ' + sureYaz(sure));
}
function wavYap(ornek, hz) {
  const b = new ArrayBuffer(44 + ornek.length * 2), v = new DataView(b);
  const yaz = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  yaz(0, 'RIFF'); v.setUint32(4, 36 + ornek.length * 2, true); yaz(8, 'WAVE'); yaz(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, hz, true); v.setUint32(28, hz * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  yaz(36, 'data'); v.setUint32(40, ornek.length * 2, true);
  for (let i = 0; i < ornek.length; i++) { const s = Math.max(-1, Math.min(1, ornek[i])); v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true); }
  return new Blob([b], { type: 'audio/wav' });
}

/* ═════════ İşlemler ═════════ */
function sec(id) { KY.secili = id; listeCiz(); oynaticiCiz(); }
function adDegistir() {
  const k = KY.liste.find(x => x.id === KY.secili); if (!k) return;
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Adını değiştir</h3></header>
    <form class="set-body" id="rAdF"><input class="sk-girdi" id="rAdI" value="${esc(k.ad)}" maxlength="80">
    <div class="sticky-actions"><div class="spacer"></div><button type="button" class="btn" data-action="close-modal">Vazgeç</button><button class="btn primary">Kaydet</button></div></form></div></div>`;
  const i = $('#rAdI'); i.focus(); i.select();
  $('#rAdF').onsubmit = async e => { e.preventDefault(); const ad = i.value.trim(); if (!ad) return; k.ad = ad; await DEPO.koy(k); closeModal(); listeCiz(); oynaticiCiz(); };
}
async function dosyaYap(k) { const blob = await DEPO.ses(k.id); return new File([blob], guvenliAd(k.ad) + '.' + uzanti(k.tur), { type: k.tur }); }
async function indir() {
  const k = KY.liste.find(x => x.id === KY.secili); if (!k) return;
  const f = await dosyaYap(k), url = URL.createObjectURL(f), a = document.createElement('a');
  a.href = url; a.download = f.name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
}
async function paylas() {
  const k = KY.liste.find(x => x.id === KY.secili); if (!k) return;
  const f = await dosyaYap(k);
  try { if (navigator.canShare && !navigator.canShare({ files: [f] })) throw new Error('dosya'); await navigator.share({ files: [f], title: k.ad }); }
  catch (e) { if (e && e.name === 'AbortError') return; toast('Bu cihaz dosya paylaşmıyor; İndir ile kaydedebilirsin'); }
}
async function sil() {
  const k = KY.liste.find(x => x.id === KY.secili); if (!k) return;
  const blob = await DEPO.ses(k.id);
  if (KY.calan?.id === k.id) calmaDurdur();
  await DEPO.sil(k.id);
  const sira = KY.liste.indexOf(k); KY.liste.splice(sira, 1);
  KY.secili = null; listeCiz(); oynaticiCiz();
  toast(`Silindi: ${esc(k.ad)}`, [['Geri al', async () => { await DEPO.sesKoy(k.id, blob); await DEPO.koy(k); KY.liste.splice(sira, 0, k); KY.secili = k.id; listeCiz(); oynaticiCiz(); }]], 7000);
}
async function kalici() { try { if (navigator.storage?.persist && !(await navigator.storage.persisted())) await navigator.storage.persist(); } catch {} }

/* ═════════ Ayarlar ═════════ */
async function ayarAc() {
  const t = store.get('theme', 'light'), A = KY.ayar;
  let yer = '';
  try { const e = await navigator.storage?.estimate?.(); if (e) yer = `Kayıtlar ${boyutYaz(KY.liste.reduce((s, k) => s + (k.boyut || 0), 0))} yer kaplıyor · cihazda yaklaşık ${boyutYaz(Math.max(0, e.quota - e.usage))} boş.`; } catch {}
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet settings"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Ayarlar</h3></header>
    <div class="set-body">
      <section><h4>Kayıt kalitesi</h4><div class="seg yon-seg">${[['standart', 'Standart (konuşma)'], ['yuksek', 'Yüksek (müzik)']].map(([k, n]) => `<button class="${A.kalite === k ? 'on' : ''}" data-action="r-kalite" data-k="${k}">${n}</button>`).join('')}</div>
        <p class="muted sm">Standart: dakikada yaklaşık 0,4 MB. Yüksek: dakikada yaklaşık 1 MB.</p></section>
      <section><h4>Ses iyileştirme</h4><div class="set-row"><div><b>Gürültü ve yankı azaltma</b><span>Konuşmayı netleştirir. Müzik kaydederken kapat.</span></div><label class="sk-anahtar"><input type="checkbox" id="rGurultu" ${A.gurultu ? 'checked' : ''}><i></i></label></div></section>
      <section><h4>Görünüm</h4><div class="seg yon-seg">${[['light', 'Cam'], ['dark', 'Koyu'], ['auto', 'Otomatik'], ['flat', 'Düz']].map(([k, n]) => `<button class="${t === k ? 'on' : ''}" data-action="r-tema" data-t="${k}">${n}</button>`).join('')}</div></section>
      <section><h4>Verilerin</h4><div class="set-row"><div><b>Bu cihazda</b><span>Kayıtlar sadece bu cihazda (bu tarayıcıda ya da programda) saklanır, hiçbir yere gönderilmez. Tarayıcı verilerini silersen kayıtlar da silinir; önemli kayıtları "İndir" ile sakla.${yer ? '<br>' + yer : ''}</span></div></div></section>
      <section><h4>Uygulama</h4>${typeof aboutRow === 'function' ? aboutRow() : ''}</section>
    </div></div></div>`;
  $('#rGurultu').onchange = e => { A.gurultu = e.target.checked; store.set('kayitAyar', A); };
}

/* ═════════ Olaylar ═════════ */
let kilitE = null;
async function uyanikTut(ac) { try { if (ac && !kilitE && navigator.wakeLock) { kilitE = await navigator.wakeLock.request('screen'); kilitE.addEventListener('release', () => { kilitE = null; }); } else if (!ac && kilitE) { await kilitE.release(); kilitE = null; } } catch {} }
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && KY.kayit) uyanikTut(true); });
window.addEventListener('beforeunload', e => { if (KY.kayit) { yarimYedekle(); e.preventDefault(); e.returnValue = ''; } });
const titret = d => { try { navigator.vibrate?.(d); } catch {} };
const HIZLAR = [1, 1.25, 1.5, 2, 0.75];
Object.assign(ACTIONS, {
  'r-ayar': () => ayarAc(), settings: () => ayarAc(),
  'r-tema': el => { store.set('theme', el.dataset.t); applyTheme(el.dataset.t); ayarAc(); },
  'r-kalite': el => { KY.ayar.kalite = el.dataset.k; store.set('kayitAyar', KY.ayar); ayarAc(); },
  'r-kaydet': () => kayitBaslat(),
  'r-duraklat': () => kayitDuraklat(),
  'r-isaret': () => kayitIsaret(),
  'r-bitir': () => kayitBitir(),
  'r-iptal': () => { if (kayitSure() < 3000) return kayitIptal(); toast('Bu kayıt silinsin mi?', [['Sil', () => kayitIptal()], ['Vazgeç', () => {}]], 6000); },
  'r-sec': el => sec(el.dataset.id),
  'r-kapat': () => { KY.secili = null; listeCiz(); oynaticiCiz(); },
  'r-oynat': () => calDuraklat(KY.secili),
  'r-geri': () => atla(-15), 'r-ileri': () => atla(15),
  'r-hiz': () => { const h = store.get('kayitHiz', 1), y = HIZLAR[(HIZLAR.indexOf(h) + 1) % HIZLAR.length]; store.set('kayitHiz', y); if (KY.calan) KY.calan.ses.playbackRate = y; oynaticiCiz(); },
  'r-isarete': async el => { const k = KY.liste.find(x => x.id === KY.secili); const C = await calmaHazirla(k); if (!C) return; C.ses.currentTime = (+el.dataset.ms) / 1000; if (C.ses.paused) C.ses.play().catch(() => {}); },
  'r-yildiz': async () => { const k = KY.liste.find(x => x.id === KY.secili); if (!k) return; k.yildiz = !k.yildiz; await DEPO.koy(k); listeCiz(); oynaticiCiz(); },
  'r-ad': () => adDegistir(),
  'r-kirp': () => kirpAc(),
  'r-indir': () => indir(),
  'r-paylas': () => paylas(),
  'r-sil': () => sil()
});
document.addEventListener('keydown', e => {
  if (e.target.closest('input, textarea') || $('#modal').innerHTML) return;
  if (e.key === ' ' && KY.secili && !KY.kayit) { e.preventDefault(); calDuraklat(KY.secili); }
  else if (e.key === 'r' || e.key === 'R') { e.preventDefault(); KY.kayit ? kayitBitir() : kayitBaslat(); }
  else if (e.key === 'ArrowLeft' && KY.calan) atla(-5); else if (e.key === 'ArrowRight' && KY.calan) atla(5);
});

/* ═════════ Başlangıç ═════════ */
document.removeEventListener('DOMContentLoaded', boot);
async function kayitAcilis() {
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  kabuk(); kabukKayitCiz();
  try { KY.liste = (await DEPO.hepsi()).sort((a, b) => b.zaman - a.zaman); }
  catch { toast('Kayıtlar açılamadı (gizli pencere olabilir)'); }
  listeCiz(); oynaticiCiz();
  yarimKurtar();
  if (new URLSearchParams(location.search).has('kaydet')) setTimeout(kayitBaslat, 300);
}
showLogin = msg => { if (msg) toast(msg); };
start = () => kayitAcilis();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', kayitAcilis); else kayitAcilis();
