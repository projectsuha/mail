/* ───────────── Kamera ─────────────
   Fotoğraf, video, kare ve seri çekim; fener, yakınlaştırma, zamanlayıcı, ızgara, canlı filtreler.
   Çekilenler doğrudan Galeri'nin depolamasına yazılır (aynı cihaz, ağ yok). Konum hiçbir zaman kaydedilmez. */
'use strict';

window.APP_NAME = 'Kamera';
window.APP_ICON = 'kamera-apple.png?v=2';
window.APP_LEAD = 'Fotoğraf ve video çek; hepsi doğrudan Galeri\'ne düşer. Ücretsiz, reklamsız.';

const CS = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
Object.assign(IC, {
  kam: CS('<path d="M4 8.500A2.500 2.500 0 0 1 6.500 6h1.700l1.300-2h5l1.300 2h1.700A2.500 2.500 0 0 1 20 8.500v8A2.500 2.500 0 0 1 17.500 19h-11A2.500 2.500 0 0 1 4 16.500z"/><circle cx="12" cy="12.500" r="3.500"/>'),
  fener: CS('<path d="M13 3 5 13.500h6L10 21l8-10.500h-6z"/>'),
  izgara: CS('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9.300 4v16M14.700 4v16M4 9.300h16M4 14.700h16"/>'),
  zaman: CS('<circle cx="12" cy="13.500" r="7"/><path d="M12 10v3.500l2.200 1.300M9.500 3h5"/>'),
  filtre: CS('<circle cx="9" cy="10" r="5"/><circle cx="15.500" cy="10" r="5"/><circle cx="12.200" cy="15" r="5"/>'),
  cevir: CS('<path d="M5 9a7.500 7.500 0 0 1 13-2.500M19 4v3.500h-3.500M19 15a7.500 7.500 0 0 1-13 2.500M5 20v-3.500h3.500"/>'),
  ayarK: CS('<path d="M5 7h9M18 7h1M5 17h1M10 17h9"/><circle cx="16" cy="7" r="2.200"/><circle cx="8" cy="17" r="2.200"/>'),
  yildiz: CS('<path d="m12 4 2.400 5 5.400.7-4 3.800 1 5.400-4.800-2.700-4.800 2.700 1-5.400-4-3.800 5.400-.7z"/>'),
  yildizD: CS('<path d="m12 4 2.400 5 5.400.7-4 3.800 1 5.400-4.800-2.700-4.800 2.700 1-5.400-4-3.800 5.400-.7z" fill="currentColor"/>'),
  kalem: CS('<path d="M4 20l1-4L16.500 4.500a2.100 2.100 0 0 1 3 3L8 19z"/><path d="M14.500 6.500l3 3"/>'),
  cop: CS('<path d="M5 7h14M10 7V4.500h4V7M7 7l1 12h8l1-12"/>'),
  paylas: CS('<path d="M12 15V4M7.500 8.500 12 4l4.500 4.500"/><path d="M5 13v5a1.500 1.500 0 0 0 1.500 1.500h11A1.500 1.500 0 0 0 19 18v-5"/>'),
  klasor: CS('<path d="M4 8a2 2 0 0 1 2-2h3.500l2 2.500H18a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/>'),
  sol: CS('<path d="M15 5l-7 7 7 7"/>'), sag: CS('<path d="M9 5l7 7-7 7"/>'),
  resimK: CS('<rect x="4" y="5" width="16" height="14" rx="3"/><circle cx="9" cy="10" r="1.500"/><path d="m5 17 5-4.500 3 2.500 3-3 3 3"/>')
});

const FILTRELER = [['Normal', ''], ['Siyah-beyaz', 'grayscale(1) contrast(1.1)'], ['Sepya', 'sepia(.85) contrast(1.05)'], ['Sıcak', 'sepia(.25) saturate(1.3) hue-rotate(-10deg) brightness(1.05)'], ['Soğuk', 'saturate(1.1) hue-rotate(14deg) contrast(1.05)'], ['Canlı', 'saturate(1.7) contrast(1.08)'], ['Soluk', 'saturate(.7) contrast(.9) brightness(1.1)'], ['Kontrast', 'contrast(1.4) saturate(1.1)']];
const MODLAR = [['foto', 'Foto'], ['video', 'Video'], ['kare', 'Kare'], ['seri', 'Seri'], ['pano', 'Panorama'], ['zaman', 'Zaman atlamalı']];
const BEYAZ = [['oto', 'Otomatik', 0], ['gun', 'Gün ışığı', 5500], ['bulut', 'Bulutlu', 6500], ['golge', 'Gölge', 7500], ['flor', 'Floresan', 4200], ['tung', 'Ampul', 3000]];
const COZ = { oto: [1920, 1080], hd: [1280, 720], fhd: [1920, 1080], uhd: [3840, 2160] };
const FILTRE_VAR = typeof CanvasRenderingContext2D !== 'undefined' && 'filter' in CanvasRenderingContext2D.prototype;
const C = { akis: null, yuz: store.get('cYuz', 'environment'), mod: 'foto', fener: false, izgara: false, zaman: 0, filtre: 0, filtreAcik: false, kap: {}, zoom: 1, kayit: null, kayitSure: 0, mesgul: false, poz: 0, hdr: false, wb: 'oto', aralik: store.get('cAralik', 2), zl: null, pano: null, oturum: [], oi: 0, kilit: null, say: 0, son: null, ayar: Object.assign({ coz: 'oto', kalite: 'yuksek', izgara: false, ayna: true, ses: true, fps: 'oto', vkal: 'oto' }, store.get('cAyar', {})), hata: '', devId: null, lensler: [], man: { odak: null, iso: null, sure: null } };
const pad2 = n => String(n).padStart(2, '0');
const adYap = (uz, ek = '') => { const d = new Date(); return `${uz === 'jpg' ? 'IMG' : 'VID'}_${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}_${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}${ek}.${uz}`; };

/* ═════════ Başlangıç ═════════ */
document.removeEventListener('DOMContentLoaded', boot);
function kBaslat() {
  document.documentElement.classList.add('c-html');
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  C.izgara = !!C.ayar.izgara; kabuk(); ac();
}
showLogin = msg => { if (msg) toast(msg); };
start = () => kBaslat();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', kBaslat); else kBaslat();

function kabuk() {
  $('#app').innerHTML = `<div class="c-kabuk" id="cKabuk">
    <header class="c-ust"><div class="c-ust-s"><button class="c-ib" data-action="c-fener" id="cFener" title="Fener" aria-label="Fener" hidden>${IC.fener}</button><button class="c-ib" data-action="c-izgara" id="cIzgara" title="Izgara" aria-label="Izgara">${IC.izgara}</button><button class="c-ib" data-action="c-zaman" id="cZaman" title="Zamanlayıcı" aria-label="Zamanlayıcı">${IC.zaman}<small id="cZamanE"></small></button>${FILTRE_VAR ? `<button class="c-ib" data-action="c-filtre" id="cFiltre" title="Filtreler" aria-label="Filtreler">${IC.filtre}</button>` : ''}<button class="c-ib" data-action="c-isik" id="cIsik" title="Işık ve renk" aria-label="Işık ve renk">${IC.ayarK}</button></div>
      
      <div class="c-ust-s"><a class="c-ib" href="galeri.html" title="Galeri" aria-label="Galeri">${IC.resimK}</a><button class="c-ib" data-action="c-ayar" title="Ayarlar" aria-label="Ayarlar">${IC.gear}</button></div></header>
    <main class="c-sahne" id="cSahne"><div class="c-vf" id="cVf"><video id="cVid" playsinline muted autoplay></video><div class="c-izgara-k" id="cIz" hidden></div><div class="c-sayac" id="cSayac" hidden></div><div class="c-flas" id="cFlas"></div><div class="c-kayit-z" id="cKayitZ" hidden><i></i><span id="cSure">00:00</span></div><div class="c-odak" id="cOdak" hidden></div><div class="c-kilit" id="cKilit" hidden></div><div class="c-lens" id="cLens" hidden data-say="0"></div><div class="c-pano" id="cPanoK" hidden><div><i id="cPanoI"></i></div><small>Telefonu yavaşça yana çevir</small></div></div>
      <div class="c-poz" id="cPozK" hidden><button data-action="c-poz-k" aria-label="Karart">−</button><input type="range" id="cPozR" min="-2" max="2" step="0.1" value="0" aria-label="Pozlama"><button data-action="c-poz-b" aria-label="Aydınlat">+</button><b id="cPozE">0</b></div><div class="c-hata" id="cHata" hidden></div></main>
    <section class="c-alt">
      <div class="c-zoom" id="cZoom" hidden><button data-action="c-zoom-k" aria-label="Uzaklaştır">−</button><input type="range" id="cZoomR" min="1" max="4" step="0.1" value="1" aria-label="Yakınlaştırma"><button data-action="c-zoom-b" aria-label="Yakınlaştır">+</button><b id="cZoomE">1×</b></div>
      <div class="c-filtreler" id="cFiltreler" hidden>${FILTRELER.map(([n], i) => `<button data-action="c-f" data-i="${i}" class="${i === 0 ? 'on' : ''}"><span class="c-f-o" style="filter:${FILTRELER[i][1] || 'none'}"></span>${n}</button>`).join('')}</div>
      <div class="c-aralik" id="cAralik" hidden>${[1, 2, 5, 10, 30].map(n => `<button data-action="c-aralik" data-n="${n}">${n} sn</button>`).join('')}</div>
      <nav class="c-modlar" id="cModlar">${MODLAR.map(([k, n]) => `<button data-action="c-mod" data-m="${k}" class="${k === C.mod ? 'on' : ''}">${n}</button>`).join('')}</nav>
      <div class="c-alt-s"><button class="c-son" id="cSon" data-action="c-on" aria-label="Son çekimler">${IC.resimK}</button><button class="c-det" id="cDet" data-action="c-cek" aria-label="Çek"><span></span></button><button class="c-ib buyuk" data-action="c-cevir" id="cCevir" aria-label="Kamerayı çevir">${IC.cevir}</button><button class="c-ib buyuk c-dur" data-action="c-dur" id="cDurB" aria-label="Duraklat" hidden>❚❚</button></div></section></div>`;
  $('#cIz').innerHTML = '<i></i><i></i><i></i><i></i>';
  const r = $('#cZoomR'); r.oninput = () => zoomYap(+r.value); $('#cPozR').oninput = e => { C.poz = +e.target.value; pozUygula(); pozGoster(); };
  pinch(); izleDurum();
}
function izleDurum() {
  document.addEventListener('visibilitychange', () => { if (document.hidden) { if (C.kayit) kayitBitir(); kapat(); } else if (!C.akis) ac(); });
}

/* ═════════ Kamera akışı ═════════ */
function kapat() { if (C.akis) { C.akis.getTracks().forEach(t => t.stop()); C.akis = null; } const v = $('#cVid'); if (v) v.srcObject = null; }
async function ac() {
  kapat(); C.hata = ''; C.zoom = 1; C.fener = false;
  if (!navigator.mediaDevices?.getUserMedia) return hataGoster('Bu tarayıcı kamerayı desteklemiyor ya da sayfa güvenli (https) açılmadı.');
  const [w, h] = COZ[C.ayar.coz] || COZ.oto, ses = C.mod === 'video';
  const fps = ses && C.ayar.fps !== 'oto' ? { frameRate: { ideal: +C.ayar.fps } } : {};
  const dene = async (a, kimlik = C.devId) => navigator.mediaDevices.getUserMedia({ video: Object.assign({ width: { ideal: w }, height: { ideal: h } }, fps, kimlik ? { deviceId: { exact: kimlik } } : { facingMode: { ideal: C.yuz } }), audio: a });
  try { try { C.akis = await dene(ses); } catch (e) { if (C.devId && /Overconstrained|NotFound/.test(e?.name)) { C.devId = null; C.akis = await dene(ses); } else { if (!ses) throw e; C.akis = await dene(false); toast('Mikrofon açılamadı; video sessiz çekilecek'); } } }
  catch (e) { return hataGoster(e?.name === 'NotAllowedError' ? 'Kamera izni verilmedi. Tarayıcının adres çubuğundan kamera iznini açıp tekrar dene.' : e?.name === 'NotFoundError' ? 'Bu cihazda kamera bulunamadı.' : 'Kamera açılamadı: ' + (e?.message || e)); }
  $('#cHata').hidden = true;
  const v = $('#cVid'); v.srcObject = C.akis; await v.play().catch(() => {});
  const tr = C.akis.getVideoTracks()[0]; C.kap = tr.getCapabilities?.() || {};
  $('#cFener').hidden = !C.kap.torch; $('#cFener').classList.remove('on');
  const z = $('#cZoom'); if (C.kap.zoom) { const r = $('#cZoomR'); r.min = C.kap.zoom.min || 1; r.max = Math.min(C.kap.zoom.max || 4, 10); r.step = C.kap.zoom.step || .1; r.value = 1; z.hidden = false; $('#cZoomE').textContent = '1×'; } else z.hidden = true;
  v.classList.toggle('on', C.yuz === 'user' && C.ayar.ayna);
  const oranla = () => { if (v.videoWidth) $('#cVf').style.setProperty('--ar', C.mod === 'kare' ? 1 : v.videoWidth / v.videoHeight); };
  v.onloadedmetadata = oranla; oranla(); filtreUygula(); izgaraGoster(); modGoster(); pozUygula(); wbUygula(); manUygula(); lensYenile();
}
function hataGoster(m) { C.hata = m; const h = $('#cHata'); h.hidden = false; h.innerHTML = `<div class="c-hata-i">${IC.kam}</div><p>${esc(m)}</p><button class="btn primary" data-action="c-tekrar">Tekrar dene</button>`; }
async function zoomYap(z) {
  const tr = C.akis?.getVideoTracks()[0]; if (!tr || !C.kap.zoom) return;
  z = Math.min(+$('#cZoomR').max, Math.max(+$('#cZoomR').min, z)); C.zoom = z;
  try { await tr.applyConstraints({ advanced: [{ zoom: z }] }); } catch {}
  $('#cZoomR').value = z; $('#cZoomE').textContent = (Math.round(z * 10) / 10) + '×';
}
function pinch() {
  const vf = $('#cVf'), p = new Map(); let d0 = 0, z0 = 1;
  vf.addEventListener('pointerdown', e => { p.set(e.pointerId, e); if (p.size === 2) { const [a, b] = [...p.values()]; d0 = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); z0 = C.zoom; } });
  vf.addEventListener('pointermove', e => { if (!p.has(e.pointerId)) return; p.set(e.pointerId, e); if (p.size === 2 && d0) { const [a, b] = [...p.values()]; zoomYap(z0 * Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) / d0); } });
  let tap = null; vf.addEventListener('pointerdown', e => { tap = p.size === 1 ? { x: e.clientX, y: e.clientY, t: Date.now() } : null; });
  const bit = e => { if (tap && p.size === 1 && Date.now() - tap.t < 450 && Math.hypot(e.clientX - tap.x, e.clientY - tap.y) < 12 && !e.target.closest('.c-poz')) odakla(e); tap = null; p.delete(e.pointerId); if (p.size < 2) d0 = 0; };
  vf.addEventListener('pointerup', bit); vf.addEventListener('pointercancel', bit);
}
async function fenerYap(a) {
  const tr = C.akis?.getVideoTracks()[0]; if (!tr || !C.kap.torch) return;
  try { await tr.applyConstraints({ advanced: [{ torch: a }] }); C.fener = a; } catch { C.fener = false; toast('Fener açılamadı'); }
  $('#cFener').classList.toggle('on', C.fener);
}
function filtreStr() { const p = []; if (FILTRELER[C.filtre][1]) p.push(FILTRELER[C.filtre][1]); if (C.poz && !C.kap.exposureCompensation) p.push(`brightness(${(1 + C.poz * .25).toFixed(2)})`); if (C.hdr) p.push('contrast(.94) saturate(1.12)'); return p.join(' '); }
function filtreUygula() { const v = $('#cVid'); v.style.filter = C.mod === 'video' ? '' : filtreStr(); $('#cFiltre')?.classList.toggle('on', C.filtre > 0); document.querySelectorAll('#cFiltreler button').forEach((b, i) => b.classList.toggle('on', i === C.filtre)); }
function izgaraGoster() { $('#cIz').hidden = !C.izgara; $('#cIzgara').classList.toggle('on', C.izgara); }
function modGoster() {
  document.querySelectorAll('#cModlar button').forEach(b => { const on = b.dataset.m === C.mod; b.classList.toggle('on', on); if (on) try { const n = $('#cModlar'); n.scrollTo({ left: n.scrollLeft + b.getBoundingClientRect().left - n.getBoundingClientRect().left - (n.clientWidth - b.offsetWidth) / 2, behavior: 'smooth' }); } catch {} });
  $('#cKabuk').dataset.mod = C.mod; $('#cDet').classList.toggle('video', C.mod === 'video');
  $('#cFiltreler').hidden = !C.filtreAcik || C.mod === 'video';
  $('#cAralik').hidden = C.mod !== 'zaman'; document.querySelectorAll('#cAralik button').forEach(b => b.classList.toggle('on', +b.dataset.n === C.aralik));
  const e = C.zaman ? C.zaman + '' : ''; $('#cZamanE').textContent = e; $('#cZaman').classList.toggle('on', !!C.zaman);
}

/* ═════════ Çekim ═════════ */
const bekle = ms => new Promise(r => setTimeout(r, ms));
function bip() { if (!C.ayar.ses) return; try { const a = new (window.AudioContext || window.webkitAudioContext)(), o = a.createOscillator(), g = a.createGain(); o.frequency.value = 1100; g.gain.value = .06; o.connect(g); g.connect(a.destination); o.start(); setTimeout(() => { o.stop(); a.close(); }, 70); } catch {} }
function flas() { const f = $('#cFlas'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); bip(); }
async function cek() {
  if (!C.akis || C.mesgul) return;
  if (C.mod === 'video') return C.kayit ? kayitBitir() : kayitBasla();
  if (C.mod === 'zaman') return C.zl ? zamanBitir() : zamanBasla();
  if (C.mod === 'pano') return C.pano ? panoBitir() : panoBasla();
  C.mesgul = true; document.querySelectorAll('.c-alt button, .c-ust button').forEach(b => b.disabled = true);
  try {
    if (C.zaman) { const s = $('#cSayac'); s.hidden = false; for (let i = C.zaman; i > 0; i--) { s.textContent = i; await bekle(1000); } s.hidden = true; }
    const n = C.mod === 'seri' ? 6 : 1; let kayitli = 0;
    for (let i = 0; i < n; i++) { flas(); const b = await kare(); if (b) { await galeriyeYaz(b, 'foto', adYap('jpg', n > 1 ? `_${i + 1}` : '')); kayitli++; } if (i < n - 1) await bekle(250); }
    if (kayitli) toast(kayitli > 1 ? `${kayitli} fotoğraf Galeri'ye kaydedildi` : 'Galeri\'ye kaydedildi');
  } catch (e) { toast('Kaydedilemedi: ' + (e?.message || e)); }
  finally { C.mesgul = false; document.querySelectorAll('.c-alt button, .c-ust button').forEach(b => b.disabled = false); $('#cSayac').hidden = true; }
}
async function kare() {
  const v = $('#cVid'), W = v.videoWidth, H = v.videoHeight; if (!W) return null;
  const s = C.mod === 'kare' ? Math.min(W, H) : 0, cw = s || W, ch = s || H, sx = s ? (W - s) / 2 : 0, sy = s ? (H - s) / 2 : 0;
  const c = document.createElement('canvas'); c.width = cw; c.height = ch; const g = c.getContext('2d');
  if (FILTRE_VAR && filtreStr()) g.filter = filtreStr();
  if (C.yuz === 'user' && C.ayar.ayna) { g.translate(cw, 0); g.scale(-1, 1); }
  g.drawImage(v, sx, sy, cw, ch, 0, 0, cw, ch);
  if (C.hdr) hdrUygula(c);
  return new Promise(r => c.toBlob(r, 'image/jpeg', C.ayar.kalite === 'yuksek' ? .95 : .8));
}
function kayitTur() { for (const t of ['video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']) if (window.MediaRecorder?.isTypeSupported?.(t)) return t; return ''; }
function kayitBasla() {
  if (!window.MediaRecorder) return toast('Bu tarayıcı video kaydını desteklemiyor');
  const tur = kayitTur(), parcalar = [];
  let mr; const vbit = { yuksek: 10e6, dusuk: 2e6 }[C.ayar.vkal], sec = Object.assign(tur ? { mimeType: tur } : {}, vbit ? { videoBitsPerSecond: vbit } : {}); try { mr = new MediaRecorder(C.akis, Object.keys(sec).length ? sec : undefined); } catch (e) { return toast('Kayıt başlatılamadı'); }
  mr.ondataavailable = e => { if (e.data?.size) parcalar.push(e.data); };
  mr.onstop = async () => {
    const sure = kSure(C.kayit), tip = (mr.mimeType || tur || 'video/webm').split(';')[0], uz = tip.includes('mp4') ? 'mp4' : 'webm';
    const k = C.kayit; clearInterval(k.zm); C.kayit = null; kayitArayuz(false);
    if (!parcalar.length) return toast('Boş kayıt, kaydedilmedi');
    try { await galeriyeYaz(new Blob(parcalar, { type: tip }), 'video', adYap(uz), sure); toast('Video Galeri\'ye kaydedildi'); } catch (e) { toast('Kaydedilemedi: ' + (e?.message || e)); }
  };
  C.kayit = { mr, t0: Date.now(), acc: 0, ts: Date.now(), dur: false, zm: setInterval(() => { const s = Math.floor(kSure(C.kayit)); $('#cSure').textContent = `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`; }, 500) };
  mr.start(1000); kayitArayuz(true); bip();
}
const kSure = k => (k.acc + (k.dur ? 0 : Date.now() - k.ts)) / 1000;
function kayitDurdur() {
  const k = C.kayit; if (!k || C.zl || C.pano) return;
  try {
    if (!k.dur) { k.mr.pause(); k.acc += Date.now() - k.ts; k.dur = true; } else { k.mr.resume(); k.ts = Date.now(); k.dur = false; }
  } catch { return toast('Bu tarayıcı kaydı duraklatamıyor'); }
  $('#cKayitZ').classList.toggle('dur', k.dur); $('#cDurB').innerHTML = k.dur ? IC.oynat || '▶' : '❚❚'; $('#cDurB').setAttribute('aria-label', k.dur ? 'Devam et' : 'Duraklat');
}
function kayitBitir() { if (C.zl) return zamanBitir(); if (C.pano) return panoBitir(); try { C.kayit?.mr.state !== 'inactive' && C.kayit.mr.stop(); } catch {} }
function kayitArayuz(a) {
  $('#cKayitZ').hidden = !a; $('#cSure').textContent = '00:00'; $('#cDet').classList.toggle('kayitta', a);
  document.querySelectorAll('#cModlar button, #cCevir, #cZaman').forEach(b => b.disabled = a);
  const d = $('#cDurB'); if (d) { d.hidden = !(a && C.kayit && !C.zl && !C.pano); $('#cCevir').hidden = !d.hidden; d.innerHTML = '❚❚'; d.setAttribute('aria-label', 'Duraklat'); } $('#cKayitZ').classList.remove('dur'); $('#cLens') && ($('#cLens').hidden = a || $('#cLens').dataset.say < 2);
}

/* ═════════ Galeri'ye yazma ═════════ */
async function galeriyeYaz(blob, tur, dosyaAdi, sure = 0) {
  const f = new File([blob], dosyaAdi, { type: blob.type, lastModified: Date.now() });
  const id = await GE.kimlik(f); let w = 0, h = 0, kucuk = null, sr = sure;
  const r = tur === 'foto' ? await GE.resimOku(f) : await GE.videoOku(f); if (r) { w = r.w; h = r.h; kucuk = r.kucuk; }
  const simdi = Date.now();
  await GE.DB.yaz('dosya', { id, blob: f });
  await GE.DB.yaz('oge', { id, ad: dosyaAdi, tur, tip: blob.type.split(';')[0] || (tur === 'video' ? 'video/mp4' : 'image/jpeg'), boyut: f.size, w, h, sure: sr, tarih: simdi, eklenme: simdi, konum: null, album: '', fav: false, not: '', etk: [], sil: 0, kucuk });
  C.say++; C.oturum.push({ id, tur, ad: dosyaAdi }); sonGoster(kucuk || (tur === 'foto' ? f : null)); return id;
}
function sonGoster(b) {
  const s = $('#cSon'); if (!s) return; if (C.son) URL.revokeObjectURL(C.son);
  if (b) { C.son = URL.createObjectURL(b); s.innerHTML = `<img src="${C.son}" alt=""><b>${C.say}</b>`; } else s.innerHTML = `${IC.resimK}<b>${C.say}</b>`;
}

/* ═════════ Ayarlar ═════════ */
function ayarAc() {
  const sec = (k, l) => `<div class="seg c-seg">${l.map(([v, n]) => `<button class="${C.ayar[k] === v ? 'on' : ''}" data-action="c-a" data-k="${k}" data-v="${v}">${n}</button>`).join('')}</div>`;
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Kamera ayarları</h3></header><div class="set-body c-ayar">
    <section><h4>Çözünürlük</h4>${sec('coz', [['oto', 'Otomatik'], ['hd', 'HD 720'], ['fhd', 'Full HD'], ['uhd', '4K']])}<p class="g-ipucu">Telefon desteklemiyorsa en yakın çözünürlük kullanılır.</p></section>
    <section><h4>Video kare hızı</h4>${sec('fps', [['oto', 'Otomatik'], ['24', '24'], ['30', '30'], ['60', '60']])}<p class="g-ipucu">Telefon desteklemiyorsa en yakın değer kullanılır.</p></section>
    <section><h4>Video kalitesi</h4>${sec('vkal', [['dusuk', 'Küçük dosya'], ['oto', 'Otomatik'], ['yuksek', 'Yüksek']])}</section>
    <section><h4>Fotoğraf kalitesi</h4>${sec('kalite', [['yuksek', 'Yüksek'], ['orta', 'Dengeli (küçük dosya)']])}</section>
    <section><label class="g-sw"><input type="checkbox" data-c="izgara" ${C.ayar.izgara ? 'checked' : ''}><span>Izgarayı hep göster</span></label>
      <label class="g-sw"><input type="checkbox" data-c="ayna" ${C.ayar.ayna ? 'checked' : ''}><span>Ön kamerada aynala (selfie)</span></label>
      <label class="g-sw"><input type="checkbox" data-c="ses" ${C.ayar.ses ? 'checked' : ''}><span>Deklanşör sesi</span></label></section>
    <section><h4>Gizlilik</h4><p class="muted sm">Çekimler yalnızca bu cihazda, Galeri'nin depolamasında durur. Fotoğraflara konum bilgisi hiçbir zaman eklenmez. Uygulama internete bir şey göndermez.</p></section></div></div></div>`;
  $('#modal').querySelectorAll('input[data-c]').forEach(i => i.onchange = () => { C.ayar[i.dataset.c] = i.checked; store.set('cAyar', C.ayar); if (i.dataset.c === 'izgara') { C.izgara = i.checked; izgaraGoster(); } if (i.dataset.c === 'ayna') $('#cVid').classList.toggle('on', C.yuz === 'user' && C.ayar.ayna); });
}

Object.assign(ACTIONS, {
  'c-cek': () => cek(),
  'c-mod': async el => { const m = el.dataset.m; if (m === C.mod || C.kayit || C.zl || C.pano) return; const sesDegis = (m === 'video') !== (C.mod === 'video'); C.mod = m; modGoster(); filtreUygula(); const v = $('#cVid'); if (v.videoWidth) $('#cVf').style.setProperty('--ar', m === 'kare' ? 1 : v.videoWidth / v.videoHeight); if (sesDegis) await ac(); },
  'c-cevir': async () => { C.yuz = C.yuz === 'user' ? 'environment' : 'user'; store.set('cYuz', C.yuz); C.devId = null; C.man = { odak: null, iso: null, sure: null }; await ac(); },
  'c-fener': () => fenerYap(!C.fener),
  'c-izgara': () => { C.izgara = !C.izgara; izgaraGoster(); },
  'c-zaman': () => { C.zaman = C.zaman === 0 ? 3 : C.zaman === 3 ? 10 : 0; modGoster(); toast(C.zaman ? `Zamanlayıcı ${C.zaman} sn` : 'Zamanlayıcı kapalı'); },
  'c-filtre': () => { C.filtreAcik = !C.filtreAcik; modGoster(); if (C.mod === 'video' && C.filtreAcik) toast('Filtreler yalnızca fotoğrafta'); },
  'c-f': el => { C.filtre = +el.dataset.i; filtreUygula(); },
  'c-zoom-b': () => zoomYap(C.zoom + 0.5), 'c-zoom-k': () => zoomYap(C.zoom - 0.5),
  'c-ayar': () => ayarAc(),
  'c-a': el => { C.ayar[el.dataset.k] = el.dataset.v; store.set('cAyar', C.ayar); ayarAc(); if (el.dataset.k === 'coz' || el.dataset.k === 'fps') ac(); },
  'c-tekrar': () => ac(),
  'c-dur': () => kayitDurdur(),
  'c-lens': async el => { const id = el.dataset.id; if (id === C.devId || C.kayit || C.zl || C.pano) return; C.devId = id; C.man = { odak: null, iso: null, sure: null }; C.poz = 0; await ac(); },
  'c-man-oto': el => { C.man[el.dataset.k] = null; manUygula(); isikAc(); },
  'c-kilit-af': () => kilitle('af'), 'c-kilit-ae': () => kilitle('ae')
});
document.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.target.closest('button,a,input,select,textarea') && !$('#modal').firstChild) { e.preventDefault(); cek(); } });

/* ═════════ Dokunarak odak, pozlama, beyaz dengesi, HDR benzeri ═════════ */
const sinirla = (v, a, b) => Math.min(b, Math.max(a, v));
async function kisit(o) { const tr = C.akis?.getVideoTracks()[0]; if (!tr) return false; try { await tr.applyConstraints({ advanced: [o] }); return true; } catch { return false; } }
function pozUygula() {
  if (C.kap.exposureCompensation) { const k = C.kap.exposureCompensation; kisit({ exposureCompensation: sinirla(C.poz, k.min, k.max) }); }
  filtreUygula(); $('#cPozR') && ($('#cPozR').value = C.poz); const e = $('#cPozE'); if (e) e.textContent = (C.poz > 0 ? '+' : '') + (Math.round(C.poz * 10) / 10);
}
function wbUygula() {
  if (!C.kap.colorTemperature) return;
  const w = BEYAZ.find(x => x[0] === C.wb) || BEYAZ[0];
  if (C.wb === 'oto') kisit({ whiteBalanceMode: 'continuous' }); else kisit({ whiteBalanceMode: 'manual', colorTemperature: sinirla(w[2], C.kap.colorTemperature.min, C.kap.colorTemperature.max) });
}
function hdrUygula(c) {
  const g = c.getContext('2d'), im = g.getImageData(0, 0, c.width, c.height), d = im.data, L = new Uint8ClampedArray(256);
  for (let i = 0; i < 256; i++) { const x = i / 255; let y = Math.pow(x, .82); y = y * (1 - .1 * y * y * y); L[i] = Math.round(sinirla(y * 1.04, 0, 1) * 255); }
  for (let i = 0; i < d.length; i += 4) { d[i] = L[d[i]]; d[i + 1] = L[d[i + 1]]; d[i + 2] = L[d[i + 2]]; }
  g.putImageData(im, 0, 0);
}
let pozZm = 0;
function pozGoster() { $('#cPozK').hidden = false; clearTimeout(pozZm); pozZm = setTimeout(() => { $('#cPozK').hidden = true; }, 4000); }
async function odakla(e) {
  const vf = $('#cVf'), r = vf.getBoundingClientRect(); if (!C.akis) return;
  let x = sinirla((e.clientX - r.left) / r.width, 0, 1), y = sinirla((e.clientY - r.top) / r.height, 0, 1);
  const halka = $('#cOdak'); halka.style.left = (x * 100) + '%'; halka.style.top = (y * 100) + '%'; halka.hidden = false; halka.classList.remove('go'); void halka.offsetWidth; halka.classList.add('go'); setTimeout(() => { halka.hidden = true; }, 1100);
  if (C.yuz === 'user' && C.ayar.ayna) x = 1 - x;
  await kisit({ pointsOfInterest: [{ x, y }], focusMode: 'single-shot' }) || await kisit({ pointsOfInterest: [{ x, y }] });
  pozGoster();
}
function isikAc() {
  const wbVar = !!C.kap.colorTemperature;
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Işık ve renk</h3></header><div class="set-body c-ayar">
    <section><h4>Pozlama</h4><div class="c-poz sheetli"><button data-action="c-poz-k">−</button><input type="range" id="cPozR2" min="-2" max="2" step="0.1" value="${C.poz}"><button data-action="c-poz-b">+</button><b id="cPozE2">${C.poz > 0 ? '+' : ''}${Math.round(C.poz * 10) / 10}</b></div><p class="g-ipucu">Ekrana dokununca da parlaklık çubuğu açılır.${C.kap.exposureCompensation ? '' : ' Bu cihazda parlaklık yazılımla ayarlanır.'}</p></section>
    <section><h4>Beyaz dengesi</h4>${wbVar ? `<div class="seg c-seg">${BEYAZ.map(([k, n]) => `<button class="${C.wb === k ? 'on' : ''}" data-action="c-wb" data-k="${k}">${n}</button>`).join('')}</div>` : '<p class="muted sm">Bu cihaz ya da tarayıcı beyaz dengesini dışarıdan ayarlamaya izin vermiyor; otomatik kullanılır.</p>'}</section>
    <section><label class="g-sw"><input type="checkbox" id="cHdr" ${C.hdr ? 'checked' : ''}><span>HDR benzeri (gölgeleri aç, parlamayı yumuşat)</span></label><p class="g-ipucu">Gerçek HDR değil, fotoğraf çekilirken uygulanan yazılım ayarıdır; yalnızca fotoğraflarda çalışır.</p></section>
    ${manHtml()}
    <div class="sticky-actions"><button class="btn" data-action="c-isik-sifirla">Sıfırla</button><button class="btn primary" data-action="close-modal">Tamam</button></div></div></div></div>`;
  $('#cPozR2').oninput = e => { C.poz = +e.target.value; pozUygula(); $('#cPozE2').textContent = $('#cPozE').textContent; };
  $('#cHdr').onchange = e => { C.hdr = e.target.checked; filtreUygula(); };
  manBagla();
}

/* ═════════ Panorama (hareket sensörüyle şeritleri birleştirir) ═════════ */
const PANO_H = 720, FOV = 65;
function griOrnek(c) { const k = document.createElement('canvas'); k.width = 48; k.height = 27; k.getContext('2d').drawImage(c, 0, 0, 48, 27); const d = k.getContext('2d').getImageData(0, 0, 48, 27).data, o = new Float32Array(48 * 27); for (let i = 0; i < o.length; i++) o[i] = (d[i * 4] + d[i * 4 + 1] + d[i * 4 + 2]) / 3; return o; }
function yonBul(a, b, kayma) { // kayma: 0..48 sütun. A'nın sağı = B'nin solu ise kamera sağa dönmüştür (+1)
  const W = 48, Hh = 27, k = Math.max(1, Math.min(W - 6, Math.round(kayma))); const sad = (ax, bx) => { let t = 0, n = 0; for (let y = 0; y < Hh; y++) for (let x = 0; x < W - k; x++) { t += Math.abs(a[y * W + x + ax] - b[y * W + x + bx]); n++; } return t / n; };
  const sag = sad(k, 0), sol = sad(0, k); return Math.abs(sag - sol) < 1.5 ? 0 : (sag < sol ? 1 : -1);
}
async function panoBasla() {
  if (!('DeviceMotionEvent' in window)) return toast('Bu cihazda hareket sensörü yok');
  if (typeof DeviceMotionEvent.requestPermission === 'function') { try { if ((await DeviceMotionEvent.requestPermission()) !== 'granted') return toast('Hareket sensörü izni verilmedi'); } catch { return toast('Hareket sensörü açılamadı'); } }
  const v = $('#cVid'); if (!v.videoWidth) return;
  const sc = PANO_H / v.videoHeight, fw = Math.round(v.videoWidth * sc), ppd = fw / FOV;
  const P = C.pano = { cum: 0, son: null, kareler: [], t: performance.now(), ppd, fw, sc, yon: 0, t0: Date.now(), bit: false };
  const yatay = () => matchMedia('(orientation: landscape)').matches;
  P.dm = e => { const r = e.rotationRate; if (!r) return; const now = performance.now(), dt = Math.min(.1, (now - P.t) / 1000); P.t = now; const hiz = yatay() ? (r.beta || 0) : (r.gamma || 0); P.cum += hiz * dt; };
  addEventListener('devicemotion', P.dm);
  const al = () => { const c = document.createElement('canvas'); c.width = fw; c.height = PANO_H; const g = c.getContext('2d'); if (FILTRE_VAR && filtreStr()) g.filter = filtreStr(); g.drawImage(v, 0, 0, fw, PANO_H); return c; };
  const ilk = al(); P.kareler.push({ cum: 0, c: ilk, g: griOrnek(ilk) }); P.son = 0;
  $('#cPanoK').hidden = false; $('#cPanoI').style.width = '0%'; kayitArayuz(true); bip();
  P.zm = setInterval(() => {
    const aci = Math.abs(P.cum - P.son), toplam = Math.abs(P.cum - P.kareler[0].cum);
    $('#cPanoI').style.width = Math.min(100, toplam / 180 * 100) + '%'; $('#cSure').textContent = Math.round(toplam) + '°';
    if (aci >= 4 && P.kareler.length < 80) { const c = al(); P.kareler.push({ cum: P.cum, c, g: griOrnek(c) }); P.son = P.cum; if (!P.yon && P.kareler.length >= 3) { const a = P.kareler[0], b = P.kareler[P.kareler.length - 1]; P.yon = yonBul(a.g, b.g, Math.abs(b.cum - a.cum) * ppd / sc * 48 / v.videoWidth) || 0; } }
    if (toplam >= 200 || P.kareler.length >= 80 || Date.now() - P.t0 > 40000) panoBitir();
  }, 120);
}
async function panoBitir() {
  const P = C.pano; if (!P || P.bit) return; P.bit = true; clearInterval(P.zm); removeEventListener('devicemotion', P.dm);
  $('#cPanoK').hidden = true; kayitArayuz(false); C.pano = null;
  if (P.kareler.length < 3) return toast('Panorama için telefonu yana doğru çevirmen gerekiyor');
  try {
    const ppd = P.ppd, c0 = P.kareler[0].cum, gidis = Math.sign(P.kareler[P.kareler.length - 1].cum - c0) || 1, dir = P.yon || (gidis < 0 ? 1 : -1);
    const xs = P.kareler.map(k => dir * gidis * (k.cum - c0) * ppd), mn = Math.min(...xs), mx = Math.max(...xs), W = Math.round(mx - mn + P.fw);
    if (W < P.fw * 1.3) return toast('Panorama için biraz daha geniş çevirmelisin');
    const c = document.createElement('canvas'); c.width = Math.min(W, 16000); c.height = PANO_H; const g = c.getContext('2d'), k = c.width / W; g.scale(k, 1);
    const ucta = [0, P.kareler.length - 1]; for (const i of ucta) g.drawImage(P.kareler[i].c, xs[i] - mn, 0);
    for (let i = 1; i < P.kareler.length - 1; i++) { const gap = Math.max(Math.abs(xs[i] - xs[i - 1]), Math.abs(xs[i + 1] - xs[i])) + 6, w = Math.min(P.fw, gap); g.drawImage(P.kareler[i].c, (P.fw - w) / 2, 0, w, PANO_H, xs[i] - mn + (P.fw - w) / 2, 0, w, PANO_H); }
    const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', .9)); flas(); await galeriyeYaz(blob, 'foto', adYap('jpg', '_PANO')); toast('Panorama Galeri\'ye kaydedildi');
  } catch (e) { toast('Panorama kaydedilemedi: ' + (e?.message || e)); }
}

/* ═════════ Zaman atlamalı video ═════════ */
async function zamanBasla() {
  if (!window.MediaRecorder) return toast('Bu tarayıcı video kaydını desteklemiyor');
  const v = $('#cVid'); if (!v.videoWidth) return;
  const sc = Math.min(1, 1920 / Math.max(v.videoWidth, v.videoHeight)), cw = Math.round(v.videoWidth * sc / 2) * 2, ch = Math.round(v.videoHeight * sc / 2) * 2;
  const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch; const g = cv.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, cw, ch);
  const tur = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(t => MediaRecorder.isTypeSupported(t)) || '';
  let mr; try { mr = new MediaRecorder(cv.captureStream(), tur ? { mimeType: tur, videoBitsPerSecond: 6e6 } : { videoBitsPerSecond: 6e6 }); } catch { return toast('Kayıt başlatılamadı'); }
  const parcalar = [], Z = C.zl = { mr, cv, g, kare: 0, t0: Date.now(), dur: false, parcalar, tur, sc, bekleyen: null };
  try { Z.kilit = await navigator.wakeLock?.request('screen'); } catch {}
  mr.ondataavailable = e => { if (e.data?.size) parcalar.push(e.data); };
  mr.onstop = async () => {
    clearInterval(Z.zm); try { Z.kilit?.release(); } catch {} C.zl = null; kayitArayuz(false);
    if (!parcalar.length || !Z.kare) return toast('Kare alınamadı, kaydedilmedi');
    const tip = (mr.mimeType || tur || 'video/webm').split(';')[0], uz = tip.includes('mp4') ? 'mp4' : 'webm';
    try { await galeriyeYaz(new Blob(parcalar, { type: tip }), 'video', adYap(uz, '_ATLAMALI'), Z.kare * .15); toast(`Zaman atlamalı video kaydedildi (${Z.kare} kare)`); } catch (e) { toast('Kaydedilemedi: ' + (e?.message || e)); }
  };
  mr.start(); mr.pause(); kayitArayuz(true); $('#cSure').textContent = '0 kare';
  const al = async () => {
    if (Z.dur || Z.mesgulKare) return; Z.mesgulKare = true;
    try { if (FILTRE_VAR) g.filter = filtreStr() || 'none'; g.drawImage(v, 0, 0, cw, ch); if (C.hdr) hdrUygula(cv); mr.resume(); await bekle(160); mr.pause(); Z.kare++; flasKucuk(); } catch {}
    Z.mesgulKare = false; const s = Math.floor((Date.now() - Z.t0) / 1000); $('#cSure').textContent = `${Z.kare} kare · ${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;
  };
  await al(); Z.zm = setInterval(al, C.aralik * 1000);
}
function flasKucuk() { const f = $('#cFlas'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); }
function zamanBitir() { const Z = C.zl; if (!Z || Z.dur) return; Z.dur = true; clearInterval(Z.zm); const bit = () => { try { Z.mr.state !== 'inactive' && Z.mr.stop(); } catch {} }; Z.mesgulKare ? setTimeout(bit, 250) : bit(); }

/* ═════════ Çekim sonrası önizleme (Galeri kısayolu) ═════════ */
async function onAc(i) {
  if (!C.oturum.length) { location.href = 'galeri.html'; return; }
  C.oi = sinirla(i, 0, C.oturum.length - 1); const it = C.oturum[C.oi];
  const [rec, oge] = await Promise.all([GE.DB.al('dosya', it.id), GE.DB.al('oge', it.id)]);
  if (!rec || !oge) { C.oturum.splice(C.oi, 1); return C.oturum.length ? onAc(0) : onKapat(); }
  let el = $('#cOn'); if (!el) { el = document.createElement('div'); el.id = 'cOn'; el.className = 'c-on'; document.body.appendChild(el); }
  if (C.onUrl) URL.revokeObjectURL(C.onUrl); C.onUrl = URL.createObjectURL(rec.blob);
  el.innerHTML = `<div class="c-on-ust"><button class="c-ib" data-action="c-on-kapat" aria-label="Kapat">${IC.close}</button><b>${C.oi + 1} / ${C.oturum.length}</b><a class="btn sm" href="galeri.html?ac=${encodeURIComponent(it.id)}">Galeri'de aç</a></div>
    <div class="c-on-sahne">${it.tur === 'video' ? `<video src="${C.onUrl}" controls playsinline></video>` : `<img src="${C.onUrl}" alt="">`}${C.oi > 0 ? `<button class="c-on-ok sol" data-action="c-on-git" data-d="-1" aria-label="Önceki">${IC.sol}</button>` : ''}${C.oi < C.oturum.length - 1 ? `<button class="c-on-ok sag" data-action="c-on-git" data-d="1" aria-label="Sonraki">${IC.sag}</button>` : ''}</div>
    <div class="c-on-alt"><button class="c-ib ${oge.fav ? 'on' : ''}" data-action="c-on-fav" aria-label="Favori">${oge.fav ? IC.yildizD : IC.yildiz}</button>${it.tur === 'foto' ? `<a class="c-ib" href="galeri.html?duzenle=${encodeURIComponent(it.id)}" aria-label="Düzenle">${IC.kalem}</a>` : ''}<button class="c-ib" data-action="c-on-paylas" aria-label="Paylaş">${IC.paylas}</button><button class="c-ib" data-action="c-on-album" aria-label="Albüme ekle">${IC.klasor}</button><button class="c-ib" data-action="c-on-sil" aria-label="Sil">${IC.cop}</button></div>`;
}
function onKapat() { $('#cOn')?.remove(); if (C.onUrl) { URL.revokeObjectURL(C.onUrl); C.onUrl = null; } }
async function onOge() { const it = C.oturum[C.oi]; return it ? GE.DB.al('oge', it.id) : null; }

Object.assign(ACTIONS, {
  'c-isik': () => isikAc(),
  'c-isik-sifirla': () => { C.poz = 0; C.hdr = false; C.wb = 'oto'; C.man = { odak: null, iso: null, sure: null }; manUygula(); pozUygula(); wbUygula(); isikAc(); },
  'c-poz-b': () => { C.poz = sinirla(Math.round((C.poz + .3) * 10) / 10, -2, 2); pozUygula(); pozGoster(); const e = $('#cPozE2'); if (e) { e.textContent = $('#cPozE').textContent; $('#cPozR2').value = C.poz; } },
  'c-poz-k': () => { C.poz = sinirla(Math.round((C.poz - .3) * 10) / 10, -2, 2); pozUygula(); pozGoster(); const e = $('#cPozE2'); if (e) { e.textContent = $('#cPozE').textContent; $('#cPozR2').value = C.poz; } },
  'c-wb': el => { C.wb = el.dataset.k; wbUygula(); isikAc(); },
  'c-aralik': el => { C.aralik = +el.dataset.n; store.set('cAralik', C.aralik); modGoster(); },
  'c-on': () => onAc(C.oturum.length - 1),
  'c-on-kapat': () => onKapat(),
  'c-on-git': el => onAc(C.oi + +el.dataset.d),
  'c-on-fav': async () => { const o = await onOge(); if (!o) return; o.fav = !o.fav; await GE.DB.yaz('oge', o); onAc(C.oi); },
  'c-on-paylas': async () => { const it = C.oturum[C.oi], rec = it && await GE.DB.al('dosya', it.id); if (!rec) return; const f = new File([rec.blob], it.ad, { type: rec.blob.type }); if (navigator.canShare?.({ files: [f] })) { try { await navigator.share({ files: [f] }); } catch {} } else { const a = document.createElement('a'); a.href = URL.createObjectURL(f); a.download = it.ad; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 8000); } },
  'c-on-sil': async () => {
    const o = await onOge(); if (!o) return; o.sil = Date.now(); await GE.DB.yaz('oge', o);
    C.oturum.splice(C.oi, 1); C.say = Math.max(0, C.say - 1); toast('Galeri çöp kutusuna taşındı (30 gün geri alınabilir)');
    if (C.oturum.length) onAc(Math.min(C.oi, C.oturum.length - 1)); else { onKapat(); sonGoster(null); }
  },
  'c-on-album': async () => {
    const o = await onOge(); if (!o) return; const al = (await GE.DB.hepsi('album')).filter(a => !a.kilit);
    $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Albüme ekle</h3></header><div class="set-body">${al.length ? al.map(a => `<button class="btn c-alb ${o.album === a.id ? 'primary' : ''}" data-action="c-on-album-sec" data-id="${esc(a.id)}">${IC.klasor} ${esc(a.ad)}</button>`).join('') : '<p class="muted sm">Henüz albümün yok. Galeri uygulamasında albüm oluşturabilirsin.</p>'}</div></div></div>`;
  },
  'c-on-album-sec': async el => { const o = await onOge(); if (!o) return; o.album = el.dataset.id; await GE.DB.yaz('oge', o); closeModal(); toast('Albüme eklendi'); }
});

/* ═════════ Lens seçimi ═════════ */
async function lensYenile() {
  const k = $('#cLens'); if (!k) return;
  try {
    const hepsi = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'videoinput' && d.deviceId);
    const on = /front|user|ön|selfie/i, arka = /back|rear|arka|environment/i;
    let liste = hepsi.filter(d => C.yuz === 'user' ? on.test(d.label) : arka.test(d.label));
    if (!liste.length && !hepsi.some(d => on.test(d.label) || arka.test(d.label))) liste = hepsi;
    C.lensler = liste;
    const ak = C.akis?.getVideoTracks()[0]?.getSettings?.().deviceId;
    k.dataset.say = liste.length; k.hidden = liste.length < 2 || !!C.kayit;
    k.innerHTML = liste.map((d, i) => `<button data-action="c-lens" data-id="${esc(d.deviceId)}" class="${d.deviceId === ak ? 'on' : ''}" aria-label="Lens ${i + 1}">${i + 1}</button>`).join('');
  } catch { k.hidden = true; }
}

/* ═════════ Manuel kontroller ve kilit ═════════ */
const MAN = [['odak', 'Odak mesafesi', 'focusDistance'], ['iso', 'ISO', 'iso'], ['sure', 'Pozlama süresi', 'exposureTime']];
const manAd = (k, v) => k === 'odak' ? (v < .1 ? 'çok yakın' : v.toFixed(2) + ' m') : k === 'iso' ? 'ISO ' + Math.round(v) : (v * 1e-4 >= .3 ? (v * 1e-4).toFixed(1) + ' sn' : '1/' + Math.max(1, Math.round(1e4 / v)) + ' sn');
function manHtml() {
  const vard = MAN.filter(([, , c]) => C.kap[c] && C.kap[c].max > C.kap[c].min);
  const kilit = `<div class="seg c-seg"><button data-action="c-kilit-af" class="${C.man.odak != null ? 'on' : ''}">Odağı kilitle</button><button data-action="c-kilit-ae" class="${C.man.iso != null || C.man.sure != null ? 'on' : ''}">Pozlamayı kilitle</button></div>`;
  if (!vard.length && !C.kap.focusMode && !C.kap.exposureMode) return `<section><h4>Manuel kontroller</h4><p class="muted sm">Bu cihaz ya da tarayıcı manuel odak, ISO ve pozlama süresine izin vermiyor.</p></section>`;
  return `<section><h4>Manuel kontroller</h4>${kilit}${vard.map(([k, ad, c]) => {
    const r = C.kap[c], v = C.man[k] ?? C.akis?.getVideoTracks()[0]?.getSettings?.()[c] ?? r.min, log = k === 'sure';
    const pos = log ? Math.log(v / r.min) / Math.log(r.max / r.min) : (v - r.min) / (r.max - r.min);
    return `<div class="c-man"><div class="c-man-b"><span>${ad}</span><b id="cMan_${k}_e">${C.man[k] == null ? 'Otomatik' : manAd(k, C.man[k])}</b><button class="btn sm" data-action="c-man-oto" data-k="${k}" ${C.man[k] == null ? 'disabled' : ''}>Otomatik</button></div><input type="range" class="c-man-r" data-k="${k}" min="0" max="1" step="0.005" value="${sinirla(pos, 0, 1)}" aria-label="${ad}"></div>`;
  }).join('')}<p class="g-ipucu">Kaydırınca ilgili ayar otomatikten manuele geçer. Telefon bazı ayarları desteklemeyebilir.</p></section>`;
}
function manBagla() {
  document.querySelectorAll('.c-man-r').forEach(r => r.oninput = () => {
    const k = r.dataset.k, c = MAN.find(m => m[0] === k)[2], cap = C.kap[c], t = +r.value;
    let v = k === 'sure' ? cap.min * Math.pow(cap.max / cap.min, t) : cap.min + t * (cap.max - cap.min);
    if (cap.step && k !== 'sure') v = cap.min + Math.round((v - cap.min) / cap.step) * cap.step;
    C.man[k] = v; $('#cMan_' + k + '_e').textContent = manAd(k, v); manUygula();
    r.closest('.c-man').querySelector('button').disabled = false;
  });
}
async function manUygula() {
  if (!C.akis) return;
  const m = C.man, o = {}, fm = C.kap.focusMode || [], em = C.kap.exposureMode || [];
  if (m.odak != null && C.kap.focusDistance) { o.focusMode = 'manual'; o.focusDistance = m.odak; } else if (fm.includes('continuous')) o.focusMode = 'continuous';
  if ((m.iso != null || m.sure != null) && (C.kap.iso || C.kap.exposureTime)) {
    o.exposureMode = 'manual';
    if (m.iso != null && C.kap.iso) o.iso = m.iso; if (m.sure != null && C.kap.exposureTime) o.exposureTime = m.sure;
  } else if (em.includes('continuous')) o.exposureMode = 'continuous';
  if (Object.keys(o).length) await kisit(o);
  kilitGoster();
}
function kilitle(w) {
  const tr = C.akis?.getVideoTracks()[0]; if (!tr) return;
  const st = tr.getSettings?.() || {};
  if (w === 'af') {
    if (C.man.odak != null) C.man.odak = null; else if (C.kap.focusDistance && st.focusDistance != null) C.man.odak = st.focusDistance; else return toast('Bu cihaz odağı kilitlemeye izin vermiyor');
  } else {
    if (C.man.iso != null || C.man.sure != null) { C.man.iso = null; C.man.sure = null; }
    else if ((C.kap.iso && st.iso != null) || (C.kap.exposureTime && st.exposureTime != null)) { C.man.iso = C.kap.iso ? st.iso ?? null : null; C.man.sure = C.kap.exposureTime ? st.exposureTime ?? null : null; }
    else return toast('Bu cihaz pozlamayı kilitlemeye izin vermiyor');
  }
  manUygula(); isikAc();
}
function kilitGoster() {
  const k = $('#cKilit'); if (!k) return;
  const a = []; if (C.man.odak != null) a.push('AF'); if (C.man.iso != null || C.man.sure != null) a.push('AE');
  k.hidden = !a.length; k.textContent = a.join(' · ') + ' kilitli'; $('#cIsik')?.classList.toggle('on', a.length > 0);
}
