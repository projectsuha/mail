/* ───────────── El Feneri ─────────────
   Telefonun flaşı ya da ekranın kendisi: sürekli ışık, yanıp sönme, SOS, mors (Türkçe harflerle), zamanlayıcı.
   Giriş yok, reklam yok, internet yok. Kamera yalnızca flaşı yakmak için açılır; görüntü alınmaz, kaydedilmez. */
'use strict';

window.APP_NAME = 'El Feneri';
window.APP_ICON = 'fener-apple.png?v=8';
window.APP_LEAD = 'Flaş, ekran ışığı, yanıp sönme, SOS ve mors. Reklamsız, izin avcılığı yok.';

const FSVG = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
Object.assign(IC, {
  fener: FSVG('<path d="M8 2.8h8l-1 5H9z"/><path d="M9 7.8h6v3.5l-1 1.5v8.4h-4v-8.4l-1-1.5z"/><path d="M12 14.5v2"/>'),
  guc: FSVG('<path d="M12 3v9"/><path d="M6.4 6.6a8 8 0 1 0 11.2 0"/>'),
  ekran: FSVG('<rect x="6" y="2.8" width="12" height="18.4" rx="2.5"/><path d="M10.5 18h3"/>'),
  flas: FSVG('<path d="M13 2.8 5.5 13.5H11L10 21.2l7.5-10.7H12z"/>'),
  isikI: FSVG('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>'),
  sosI: FSVG('<circle cx="4.5" cy="12" r="1.3" fill="currentColor"/><circle cx="8" cy="12" r="1.3" fill="currentColor"/><path d="M11 12h2.5"/><circle cx="16.5" cy="12" r="1.3" fill="currentColor"/><circle cx="20" cy="12" r="1.3" fill="currentColor"/>'),
  morsI: FSVG('<path d="M3 9h2M8 9h5M16 9h5M3 15h5M11 15h2M16 15h5"/>')
});

const MORS = { A: '.-', B: '-...', C: '-.-.', 'Ç': '-.-..', D: '-..', E: '.', F: '..-.', G: '--.', 'Ğ': '--.-.', H: '....', I: '..', 'İ': '.-..-', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', 'Ö': '---.', P: '.--.', Q: '--.-', R: '.-.', S: '...', 'Ş': '.--..', T: '-', U: '..-', 'Ü': '..--', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
  0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--', '/': '-..-.', '@': '.--.-.', '-': '-....-' };
const RENK = [['#ffffff', 'Beyaz'], ['#ffe2b8', 'Sıcak'], ['#ff2a2a', 'Kırmızı (gece)'], ['#5cff8a', 'Yeşil'], ['#7fb2ff', 'Mavi']];

const FN = {
  acik: false,
  ayar: Object.assign({ kaynak: 'flas', mod: 'surekli', hiz: 4, mors: 'SOS', morsBirim: 200, tekrar: true, renk: '#ffffff', parlak: 100, sure: 0, karart: false }, store.get('fenerAyar', {})),
  akis: null, iz: null, flasVar: null, isik: false, zamanlayici: null, desen: null, bitis: 0, kilit: null, saat: null
};
const kaydet = () => store.set('fenerAyar', FN.ayar);
const titret = d => { try { navigator.vibrate?.(d); } catch {} };

/* ═════════ Flaş (kameranın ışığı) ═════════ */
async function flasHazirla() {
  if (FN.iz && FN.iz.readyState === 'live') return true;
  if (!navigator.mediaDevices?.getUserMedia) return false;
  const dene = async kisit => { const a = await navigator.mediaDevices.getUserMedia({ video: kisit, audio: false }); const t = a.getVideoTracks()[0]; return { a, t, var: !!(t.getCapabilities?.().torch) }; };
  let r;
  try { r = await dene({ facingMode: { ideal: 'environment' }, width: { ideal: 640 } }); }
  catch (e) { if (e.name === 'NotAllowedError') throw new Error('izin'); return false; }
  // Bazı telefonlarda flaş başka bir arka kamerada: flaşı olanı bul
  if (!r.var) {
    const kameralar = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'videoinput');
    for (const k of kameralar) {
      if (k.deviceId === r.t.getSettings().deviceId) continue;
      try { const r2 = await dene({ deviceId: { exact: k.deviceId } }); if (r2.var) { r.a.getTracks().forEach(t => t.stop()); r = r2; break; } r2.a.getTracks().forEach(t => t.stop()); } catch {}
    }
  }
  FN.akis = r.a; FN.iz = r.t;
  return r.var || /iPhone|iPad/.test(navigator.userAgent);   // iPhone yeteneği bildirmeyebilir; denemeden bilinmez
}
async function flasYak(ac) {
  if (!FN.iz) return false;
  try { await FN.iz.applyConstraints({ advanced: [{ torch: !!ac }] }); FN.isik = !!ac; return true; } catch { return false; }
}
function flasBirak() { FN.akis?.getTracks().forEach(t => t.stop()); FN.akis = null; FN.iz = null; FN.isik = false; }

/* ═════════ Işık: flaş ya da ekran ═════════ */
async function isikAyarla(ac) {
  if (FN.ayar.kaynak === 'flas') return flasYak(ac);
  const p = $('#fnPerde'); if (p) p.classList.toggle('yandi', !!ac);
  FN.isik = !!ac; return true;
}
// Desenler: [ışık açık ms, kapalı ms, …]
function morsDeseni(metin, b) {
  const out = [];
  const kelimeler = String(metin || '').toLocaleUpperCase('tr').split(/\s+/).filter(Boolean);
  kelimeler.forEach((k, ki) => {
    [...k].forEach((h, hi) => {
      const kod = MORS[h]; if (!kod) return;
      [...kod].forEach((s, si) => { out.push(s === '.' ? b : 3 * b); out.push(si < kod.length - 1 ? b : 0); });
      if (hi < k.length - 1) out[out.length - 1] = 3 * b;
    });
    if (out.length) out[out.length - 1] = 7 * b;
  });
  return out;
}
function desenAl() {
  const A = FN.ayar;
  if (A.mod === 'yanip') { const p = Math.round(1000 / A.hiz / 2); return { adim: [p, p], tekrar: true }; }
  if (A.mod === 'sos') return { adim: morsDeseni('SOS', 220), tekrar: true };
  if (A.mod === 'mors') return { adim: morsDeseni(A.mors, A.morsBirim), tekrar: A.tekrar };
  return null;
}
async function baslat() {
  const A = FN.ayar, d0 = desenAl();
  if (d0 && !d0.adim.length) { toast('Mors için harf ya da rakam içeren bir mesaj yaz'); return false; }
  if (A.kaynak === 'flas') {
    let var0;
    try { var0 = await flasHazirla(); } catch (e) { if (e.message === 'izin') { toast('Kamera izni verilmedi. Flaşı yakmak için kamera izni gerekiyor (görüntü alınmaz). İstersen ekran ışığını kullan.'); return false; } var0 = false; }
    if (!var0 || !(await flasYak(true))) {
      flasBirak(); FN.flasVar = false; ciz();
      toast('Bu cihazda flaşa ulaşılamadı. Ekran ışığına geçildi.', [], 4500);
      A.kaynak = 'ekran'; kaydet();
    } else FN.flasVar = true;
  }
  if (A.kaynak === 'ekran') perdeAc();
  FN.acik = true; titret(30);
  ekranAcikTut(true);
  const d = desenAl();
  if (d) desenOynat(d); else if (!FN.isik) await isikAyarla(true);
  if (A.sure) { FN.bitis = Date.now() + A.sure * 60000; clearTimeout(FN.zamanlayici); FN.zamanlayici = setTimeout(() => { durdur(); toast('Süre doldu, ışık kapandı'); }, A.sure * 60000); } else FN.bitis = 0;
  clearInterval(FN.saat); FN.saat = setInterval(sayacYaz, 1000);
  ciz(); return true;
}
async function durdur() {
  FN.acik = false; clearTimeout(FN.desen); FN.desen = null; clearTimeout(FN.zamanlayici); clearInterval(FN.saat); FN.bitis = 0;
  await isikAyarla(false); flasBirak(); perdeKapat(); ekranAcikTut(false); titret(15); ciz();
}
function desenOynat(d) {
  let i = 0;
  const adim = async () => {
    if (!FN.acik) return;
    if (i >= d.adim.length) { if (!d.tekrar) { durdur(); return; } i = 0; }
    const sure = d.adim[i], isik = i % 2 === 0;
    if (sure > 0) await isikAyarla(isik);
    i++;
    FN.desen = setTimeout(adim, Math.max(sure, 0));
  };
  adim();
}
// Ekranın kendiliğinden kapanmasını engelle (ışık açıkken)
async function ekranAcikTut(ac) {
  try {
    if (ac && 'wakeLock' in navigator) FN.kilit = await navigator.wakeLock.request('screen');
    else { await FN.kilit?.release(); FN.kilit = null; }
  } catch {}
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && FN.acik) { ekranAcikTut(true); if (FN.ayar.kaynak === 'flas' && !FN.desen) { flasHazirla().then(() => flasYak(true)).catch(() => {}); } }
});

/* ═════════ Ekran ışığı perdesi ═════════ */
function perdeAc() {
  let p = $('#fnPerde');
  if (!p) { p = document.createElement('div'); p.id = 'fnPerde'; p.className = 'fn-perde'; document.body.appendChild(p); }
  p.style.setProperty('--renk', FN.ayar.renk); p.style.setProperty('--parlak', FN.ayar.parlak / 100);
  p.innerHTML = `<div class="fn-perde-alt"><span id="fnPerdeSayac"></span><button class="fn-perde-kapat" data-action="f-kapat">${IC.guc}Kapat</button></div>`;
  p.hidden = false;
  try { document.documentElement.requestFullscreen?.({ navigationUI: 'hide' }).catch(() => {}); } catch {}
}
function perdeKapat() {
  const p = $('#fnPerde'); if (p) { p.hidden = true; p.classList.remove('yandi'); }
  try { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); } catch {}
}
// Flaş yanarken ekranı karart (pil için)
function karartma() {
  let k = $('#fnKarart');
  if (FN.acik && FN.ayar.kaynak === 'flas' && FN.ayar.karart) {
    if (!k) { k = document.createElement('div'); k.id = 'fnKarart'; k.className = 'fn-karart'; k.innerHTML = '<span>Flaş açık · kapatmak için dokun</span>'; k.dataset.action = 'f-kapat'; document.body.appendChild(k); }
    k.hidden = false;
  } else if (k) k.hidden = true;
}

/* ═════════ Ekran ═════════ */
document.removeEventListener('DOMContentLoaded', boot);
function fenerBaslat() {
  document.documentElement.classList.add('fn-html');
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  if (!navigator.mediaDevices?.getUserMedia) { FN.flasVar = false; if (FN.ayar.kaynak === 'flas') FN.ayar.kaynak = 'ekran'; }
  ciz();
  if (new URLSearchParams(location.search).has('ac')) baslat();
}
showLogin = msg => { if (msg) toast(msg); };
start = () => fenerBaslat();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fenerBaslat); else fenerBaslat();

function sayacYaz() {
  const t = FN.bitis ? Math.max(0, Math.ceil((FN.bitis - Date.now()) / 1000)) : 0;
  const yazi = t ? `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')} sonra kapanacak` : '';
  const a = $('#fnSayac'); if (a) a.textContent = yazi;
  const b = $('#fnPerdeSayac'); if (b) b.textContent = yazi;
}
const seg = (k, l) => `<div class="seg">${l.map(([v, n]) => `<button class="${String(FN.ayar[k]) === String(v) ? 'on' : ''}" data-action="f-sec" data-k="${k}" data-v="${v}">${n}</button>`).join('')}</div>`;
function ciz() {
  const A = FN.ayar, ekran = A.kaynak === 'ekran';
  document.body.classList.toggle('fn-acik', FN.acik);
  document.body.style.setProperty('--fn-renk', ekran ? A.renk : '#fff3c4');
  $('#app').innerHTML = `
  <div class="fn-kabuk">
    <header class="fn-bas"><div class="brand-mark sm">${IC.fener}</div><h1>El Feneri</h1><div class="spacer"></div>
      <button class="icon-btn" data-action="f-ayar" title="Ayarlar">${IC.gear}</button></header>
    <main class="fn-govde">
      <div class="fn-kaynak">${seg('kaynak', [['flas', 'Flaş'], ['ekran', 'Ekran ışığı']])}</div>
      ${!ekran && FN.flasVar === false ? `<p class="fn-not">${IC.alert}Bu cihazda flaşa ulaşılamadı (bilgisayarlarda ve bazı tarayıcılarda olmaz). Ekran ışığını kullanabilirsin.</p>` : ''}
      <button class="fn-dugme ${FN.acik ? 'acik' : ''}" data-action="f-dugme" aria-pressed="${FN.acik}" aria-label="${FN.acik ? 'Kapat' : 'Aç'}">
        <span class="fn-hale"></span><span class="fn-ic">${IC.guc}</span></button>
      <p class="fn-durum">${FN.acik ? (A.mod === 'surekli' ? 'Açık' : A.mod === 'yanip' ? 'Yanıp sönüyor' : A.mod === 'sos' ? 'SOS gönderiliyor' : 'Mors gönderiliyor') : 'Kapalı'}<span id="fnSayac"></span></p>
      <section class="fn-kart">
        <div class="fn-modlar">${[['surekli', 'Sürekli', IC.isikI], ['yanip', 'Yanıp sön', IC.flas], ['sos', 'SOS', IC.sosI], ['mors', 'Mors', IC.morsI]].map(([v, n, ic]) => `<button class="${A.mod === v ? 'on' : ''}" data-action="f-sec" data-k="mod" data-v="${v}">${ic}<span>${n}</span></button>`).join('')}</div>
        ${A.mod === 'yanip' ? `<div class="fn-satir"><span>Hız</span><input type="range" min="1" max="12" step="1" value="${A.hiz}" data-a="hiz" class="fn-kaydir"><b>${A.hiz} / sn</b></div>` : ''}
        ${A.mod === 'mors' ? `<div class="fn-satir"><span>Mesaj</span><input class="fn-girdi" data-a="mors" value="${esc(A.mors)}" maxlength="60" placeholder="Ör. YARDIM"></div>
          <div class="fn-mors" id="fnMors">${morsGoster(A.mors)}</div>
          <div class="fn-satir"><span>Hız</span>${seg('morsBirim', [[300, 'Yavaş'], [200, 'Normal'], [120, 'Hızlı']])}<label class="fn-anahtar"><input type="checkbox" data-a="tekrar" ${A.tekrar ? 'checked' : ''}><span>Tekrarla</span></label></div>` : ''}
        ${A.mod === 'sos' ? `<p class="fn-ipucu">SOS uluslararası yardım işaretidir: üç kısa, üç uzun, üç kısa (··· ——— ···).</p>` : ''}
        ${ekran ? `<div class="fn-satir"><span>Renk</span><div class="fn-renkler">${RENK.map(([r, n]) => `<button class="fn-renk ${A.renk === r ? 'on' : ''}" style="--r:${r}" data-action="f-renk" data-r="${r}" title="${n}" aria-label="${n}"></button>`).join('')}</div></div>
          <div class="fn-satir"><span>Parlaklık</span><input type="range" min="10" max="100" step="5" value="${A.parlak}" data-a="parlak" class="fn-kaydir"><b>%${A.parlak}</b></div>
          <p class="fn-ipucu">En parlak ışık için telefonun ekran parlaklığını da sonuna kadar aç. Kırmızı ışık gece gözü kamaştırmaz.</p>` : `
          <div class="fn-satir"><span>Ekran</span><label class="fn-anahtar"><input type="checkbox" data-a="karart" ${A.karart ? 'checked' : ''}><span>Flaş yanarken ekranı karart (pil için)</span></label></div>`}
        <div class="fn-satir"><span>Kendiliğinden kapan</span>${seg('sure', [[0, 'Hayır'], [1, '1 dk'], [5, '5 dk'], [15, '15 dk'], [30, '30 dk']])}</div>
      </section>
      ${!ekran ? `<p class="fn-ipucu alt">Flaş için kamera izni istenir; kamera sadece ışığı yakmak için açılır, görüntü alınmaz. Ekran kapanınca ya da uygulamadan çıkınca flaş söner.</p>` : ''}
    </main>
  </div>`;
  sayacYaz(); karartma();
}
function morsGoster(m) {
  return String(m || '').toLocaleUpperCase('tr').split(/\s+/).filter(Boolean).map(k => `<span>${[...k].map(h => MORS[h] ? `<i title="${esc(h)}">${MORS[h].replace(/\./g, '·').replace(/-/g, '—')}</i>` : '').join(' ')}</span>`).join('<b>/</b>') || '<em>Mesaj yaz</em>';
}
function ayarAc() {
  const t = store.get('theme', 'light');
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet settings"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Ayarlar</h3></header>
    <div class="set-body">
      <section><h4>Görünüm</h4><div class="seg yon-seg">${[['light', 'Cam'], ['dark', 'Koyu'], ['auto', 'Otomatik'], ['flat', 'Düz']].map(([k, n]) => `<button class="${t === k ? 'on' : ''}" data-action="f-tema" data-t="${k}">${n}</button>`).join('')}</div></section>
      <section><h4>Verilerin</h4><div class="set-row"><div><b>Hiçbir şey toplanmaz</b><span>El Feneri internete bağlanmaz. Kamera yalnızca flaşı yakmak için açılır; görüntü alınmaz ve kaydedilmez. Sadece son seçtiğin ayarlar bu cihazda hatırlanır.</span></div></div></section>
      <section><h4>Uygulama</h4>${typeof aboutRow === 'function' ? aboutRow() : ''}</section>
    </div></div></div>`;
}

/* ═════════ Olaylar ═════════ */
Object.assign(ACTIONS, {
  'f-ayar': () => ayarAc(), settings: () => ayarAc(),
  'f-tema': el => { store.set('theme', el.dataset.t); applyTheme(el.dataset.t); ayarAc(); },
  'f-dugme': () => FN.acik ? durdur() : baslat(),
  'f-kapat': () => durdur(),
  'f-sec': async el => {
    const k = el.dataset.k, v = el.dataset.v, eski = FN.ayar[k];
    FN.ayar[k] = /^\d+$/.test(v) ? +v : v; kaydet();
    if (FN.acik && (k === 'kaynak' || k === 'mod' || k === 'morsBirim') && eski !== FN.ayar[k]) {
      const k0 = FN.ayar[k]; FN.ayar[k] = eski; await durdur(); FN.ayar[k] = k0; kaydet(); await baslat(); return;
    }
    if (FN.acik && k === 'sure') { FN.ayar.sure = +v; clearTimeout(FN.zamanlayici); if (FN.ayar.sure) { FN.bitis = Date.now() + FN.ayar.sure * 60000; FN.zamanlayici = setTimeout(() => { durdur(); toast('Süre doldu, ışık kapandı'); }, FN.ayar.sure * 60000); } else FN.bitis = 0; }
    ciz();
  },
  'f-renk': el => { FN.ayar.renk = el.dataset.r; kaydet(); const p = $('#fnPerde'); if (p) p.style.setProperty('--renk', FN.ayar.renk); ciz(); }
});
document.addEventListener('input', e => {
  const t = e.target, k = t.dataset.a; if (!k) return;
  if (k === 'mors') { FN.ayar.mors = t.value; kaydet(); const m = $('#fnMors'); if (m) m.innerHTML = morsGoster(t.value); return; }
  if (k === 'hiz' || k === 'parlak') {
    FN.ayar[k] = +t.value; kaydet(); t.nextElementSibling.textContent = k === 'hiz' ? `${t.value} / sn` : `%${t.value}`;
    if (k === 'parlak') { const p = $('#fnPerde'); if (p) p.style.setProperty('--parlak', FN.ayar.parlak / 100); }
    if (k === 'hiz' && FN.acik && FN.ayar.mod === 'yanip') { clearTimeout(FN.desen); desenOynat(desenAl()); }
  }
});
document.addEventListener('change', e => {
  const t = e.target, k = t.dataset.a; if (!k || t.type !== 'checkbox') return;
  FN.ayar[k] = t.checked; kaydet();
  if (k === 'karart') karartma();
});
window.addEventListener('pagehide', () => { if (FN.acik) durdur(); });
