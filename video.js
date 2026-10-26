/* ───────────── Video ─────────────
   Cihazdaki videoları oynatır: oynatma listesi, kaldığın yerden devam, hız, altyazı (SRT/VTT/ASS), ses yükseltme,
   A-B tekrar, ekran görüntüsü, görüntü oranı ve döndürme, pencere içinde pencere, klavye ve dokunmatik hareketler.
   Giriş yok, internet yok; dosyalar hiçbir yere gönderilmez. Sadece izleme konumları ve küçük resimler bu cihazda hatırlanır. */
'use strict';

window.APP_NAME = 'Video';
window.APP_ICON = 'video-apple.png?v=8';
window.APP_LEAD = 'Cihazındaki videoları oynat: altyazı, hız, kaldığın yerden devam, ses yükseltme. Reklamsız.';

const VSVG = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
Object.assign(IC, {
  videoI: VSVG('<rect x="2.8" y="5" width="18.4" height="14" rx="2.5"/><path d="m10 9 5 3-5 3z" fill="currentColor"/>'),
  oynat: VSVG('<path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/>'),
  duraklat: VSVG('<path d="M8 5v14M16 5v14" stroke-width="3.2"/>'),
  geri10: VSVG('<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 4v4.5h4.5"/><text x="12" y="15.2" text-anchor="middle" font-size="7" font-weight="700" fill="currentColor" stroke="none" font-family="sans-serif">10</text>'),
  ileri10: VSVG('<path d="M20 12a8 8 0 1 1-2.4-5.7L20 8.5"/><path d="M20 4v4.5h-4.5"/><text x="12" y="15.2" text-anchor="middle" font-size="7" font-weight="700" fill="currentColor" stroke="none" font-family="sans-serif">10</text>'),
  onceki: VSVG('<path d="M6 5v14"/><path d="M19 5v14l-10-7z" fill="currentColor"/>'),
  sonraki: VSVG('<path d="M18 5v14"/><path d="M5 5v14l10-7z" fill="currentColor"/>'),
  ses: VSVG('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>'),
  sessiz: VSVG('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>'),
  tamEkran: VSVG('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
  kucukEkran: VSVG('<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>'),
  pip: VSVG('<rect x="2.8" y="4.5" width="18.4" height="15" rx="2"/><rect x="12" y="12" width="7" height="5" rx="1" fill="currentColor"/>'),
  altyazi: VSVG('<rect x="2.8" y="5" width="18.4" height="14" rx="2.5"/><path d="M6.5 13h4M12.5 13h5M6.5 16h7M15.5 16h2"/>'),
  liste: VSVG('<path d="M4 6h11M4 12h11M4 18h7"/><path d="m16 15 5 3-5 3z" fill="currentColor"/>'),
  ayarV: VSVG('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>'),
  kilit: VSVG('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  kilitAcik: VSVG('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>'),
  foto: VSVG('<rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8.5 6 10 4h4l1.5 2"/>'),
  klasor: VSVG('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
  geri: VSVG('<path d="M15 5l-7 7 7 7"/>'),
  sil: VSVG('<path d="M6 6l12 12M18 6 6 18"/>'),
  arti: VSVG('<path d="M12 5v14M5 12h14"/>')
});

const VD = {
  liste: [], sira: -1, url: null, altyazi: null, ayIdx: 0, ayKay: 0, kilitli: false, ab: [null, null],
  gain: null, ctx: null, kaynakSes: null, gizleZaman: null, sonKonumYaz: 0,
  ayar: Object.assign({ hiz: 1, ses: 1, yukselt: 1, sessiz: false, oran: 'sigdir', donme: 0, ayBoyut: 100, ayArka: true, otomatikSonraki: true, devam: true, parlak: 1 }, store.get('videoAyar', {})),
  gecmis: store.get('videoGecmis', [])      // [{ k: anahtar, ad, boy, sure, konum, zaman, resim }]
};
const ayarKaydet = () => store.set('videoAyar', VD.ayar);
const anahtar = f => `${f.name}|${f.size}`;
const zamanYaz = s => { if (!isFinite(s) || s < 0) s = 0; s = Math.floor(s); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, n = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(n).padStart(2, '0'); };
const VIDEO_UZ = /\.(mp4|m4v|webm|mkv|mov|ogv|ogg|avi|wmv|flv|3gp|ts|mts|m2ts|mpg|mpeg)$/i, AY_UZ = /\.(srt|vtt|ass|ssa|sub)$/i;
const dogalSira = (a, b) => a.name.localeCompare(b.name, 'tr', { numeric: true, sensitivity: 'base' });
const v = () => $('#vVideo');

/* ═════════ Son açılan dosyaların tutamakları (destekleyen tarayıcıda tek tıkla yeniden açmak için) ═════════ */
const TUT = (() => {
  let db; const ac = () => db ? Promise.resolve(db) : new Promise((ok, red) => { const r = indexedDB.open('suha-video', 1); r.onupgradeneeded = () => r.result.createObjectStore('tutamak'); r.onsuccess = () => ok(db = r.result); r.onerror = () => red(r.error); });
  const is = async (mod, fn) => { const d = await ac(); return new Promise((ok, red) => { const t = d.transaction('tutamak', mod), r = fn(t.objectStore('tutamak')); t.oncomplete = () => ok(r?.result); t.onerror = () => red(t.error); }); };
  return { koy: (k, h) => is('readwrite', s => s.put(h, k)).catch(() => {}), al: k => is('readonly', s => s.get(k)).catch(() => null), sil: k => is('readwrite', s => s.delete(k)).catch(() => {}) };
})();
const pickerVar = () => typeof window.showOpenFilePicker === 'function' && !window.SUHA_YEREL;

/* ═════════ Başlangıç ═════════ */
document.removeEventListener('DOMContentLoaded', boot);
function videoBaslat() {
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  anaCiz();
  // Bilgisayarda "Birlikte aç → Video" ile açılan dosyalar (yüklenmiş uygulama)
  if ('launchQueue' in window) launchQueue.setConsumer(async p => { if (!p.files?.length) return; const fs = await Promise.all(p.files.map(h => h.getFile())); dosyalariAc(fs, p.files); });
}
showLogin = msg => { if (msg) toast(msg); };
start = () => videoBaslat();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', videoBaslat); else videoBaslat();

/* ═════════ Ana ekran ═════════ */
function anaCiz() {
  document.body.classList.remove('vd-oynuyor');
  document.documentElement.classList.add('vd-html');
  const klasorVar = 'webkitdirectory' in document.createElement('input') && !/iPhone|iPad|Android/i.test(navigator.userAgent);
  const acDugme = pickerVar() ? `data-action="v-sec"` : `data-action="v-girdi"`;
  // Devam edilecek video: en son izlenen, bitmemiş olan
  const devam = VD.gecmis.find(g => g.sure && g.konum > 5 && g.konum < g.sure - 15);
  const digerleri = VD.gecmis.filter(g => g !== devam).slice(0, 24);
  const poster = g => {
    const yuzde = g.sure ? Math.min(100, g.konum / g.sure * 100) : 0, bitti = g.sure && g.konum > g.sure - 15;
    return `<div class="vd-poster" data-action="v-gecmis-ac" data-k="${esc(g.k)}" role="button" tabindex="0">
      <div class="vd-poster-resim">${g.resim ? `<img src="${g.resim}" alt="">` : IC.videoI}<span>${zamanYaz(g.sure)}</span>${yuzde ? `<i style="width:${bitti ? 100 : yuzde}%"></i>` : ''}
        <button class="vd-kart-sil" data-action="v-gecmis-sil" data-k="${esc(g.k)}" title="Listeden çıkar">${IC.sil}</button></div>
      <b title="${esc(g.ad)}">${esc(g.ad)}</b><small>${bitti ? 'İzlendi' : g.konum > 5 ? zamanYaz(g.konum) + '’de kaldın' : 'Başlanmadı'}</small></div>`;
  };
  $('#app').innerHTML = `
  <div class="vd-kabuk">
    <header class="vd-bas"><div class="brand-mark sm">${IC.videoI}</div><h1>Video</h1><div class="spacer"></div>
      <button class="icon-btn" data-action="v-ayar" title="Ayarlar">${IC.gear}</button></header>
    <main class="vd-govde">
      ${devam ? `<div class="vd-hero" data-action="v-gecmis-ac" data-k="${esc(devam.k)}" role="button" tabindex="0">
          ${devam.resim ? `<img src="${devam.resim}" alt="">` : ''}
          <span class="vd-hero-devam">${IC.oynat}Devam et</span>
          <div class="vd-hero-yazi"><small>Kaldığın yer · ${zamanYaz(devam.konum)} / ${zamanYaz(devam.sure)}</small><b>${esc(devam.ad)}</b>
            <div class="vd-hero-cubuk"><i style="width:${Math.min(100, devam.konum / devam.sure * 100)}%"></i></div></div></div>` : ''}
      ${digerleri.length ? `<section class="vd-gecmis"><div class="vd-gecmis-bas"><h2>Son izlenenler</h2><button class="vd-temizle" data-action="v-gecmis-temizle">Temizle</button></div>
        <div class="vd-serit">${digerleri.map(poster).join('')}</div>
        ${pickerVar() ? '' : '<p class="vd-not">Gizlilik gereği tarayıcı dosyalara kendiliğinden ulaşamaz; bir videoya dokununca dosyayı yeniden seçmen istenir. Kaldığın yer hatırlanır.</p>'}</section>` : ''}
      <div class="vd-ac" id="vBirak">
        <button class="vd-ac-ana" ${acDugme}><span class="vd-ac-ic">${IC.arti || '+'}</span><span><b>Video aç</b><small>Dosya seç ya da buraya bırak</small></span></button>
        ${klasorVar ? `<label class="vd-ac-klasor">${IC.klasor}Klasör aç<input type="file" id="vKlasor" webkitdirectory multiple hidden></label>` : ''}
        <input type="file" id="vGirdi" accept="video/*,.mkv,.avi,.wmv,.flv,.ts,.mts,.m2ts,.3gp,.srt,.vtt,.ass,.ssa" multiple hidden>
      </div>
      <p class="vd-not">${IC.alert}<span>Birden çok video seçersen sırayla oynar; aynı adlı altyazıyı (.srt) birlikte seçersen kendiliğinden açılır. MP4, WebM, MOV ve çoğu MKV oynar; AVI, WMV, FLV gibi eski türler ve bazı H.265 videolar açılmayabilir.</span></p>
    </main>
  </div>`;
}

/* ═════════ Dosya seçme ═════════ */
async function dosyalariAc(dosyalar, tutamaklar = []) {
  const vid = dosyalar.filter(f => /^video\//.test(f.type) || VIDEO_UZ.test(f.name) || (/^audio\//.test(f.type) && false));
  const ays = dosyalar.filter(f => AY_UZ.test(f.name));
  if (!vid.length) { if (ays.length && VD.sira >= 0) return altyaziYukle(ays[0]); return toast('Seçilenlerde video yok'); }
  const sirali = vid.map((f, i) => ({ f, h: tutamaklar[dosyalar.indexOf(f)] || null })).sort((a, b) => dogalSira(a.f, b.f));
  VD.liste = sirali.map(x => ({ dosya: x.f, tutamak: x.h, altyazi: ays.find(a => a.name.replace(/\.[^.]+$/, '').toLowerCase().startsWith(x.f.name.replace(/\.[^.]+$/, '').toLowerCase())) || (vid.length === 1 ? ays[0] : null) }));
  for (const x of sirali) if (x.h) TUT.koy(anahtar(x.f), x.h);
  oynatAc(0);
}
async function pickerSec() {
  try {
    const hs = await window.showOpenFilePicker({ multiple: true, types: [{ description: 'Video ve altyazı', accept: { 'video/*': ['.mp4', '.m4v', '.webm', '.mkv', '.mov', '.avi', '.wmv', '.ts', '.3gp'], 'text/plain': ['.srt', '.vtt', '.ass', '.ssa'] } }], excludeAcceptAllOption: false });
    const fs = await Promise.all(hs.map(h => h.getFile()));
    dosyalariAc(fs, hs);
  } catch (e) { if (e.name !== 'AbortError') toast('Açılamadı: ' + e.message); }
}
async function gecmisAc(k) {
  const h = await TUT.al(k);
  if (h) {
    try {
      if ((await h.queryPermission?.({ mode: 'read' })) !== 'granted' && (await h.requestPermission?.({ mode: 'read' })) !== 'granted') throw new Error('izin');
      const f = await h.getFile(); return dosyalariAc([f], [h]);
    } catch (e) { if (e.message !== 'izin') { TUT.sil(k); toast('Dosya bulunamadı (taşınmış ya da silinmiş olabilir). Yeniden seç.'); } }
  }
  // Tutamak yoksa dosyayı yeniden seçtir
  if (pickerVar()) return pickerSec();
  const g = VD.gecmis.find(x => x.k === k); if (g) toast(`"${g.ad}" dosyasını seç; kaldığın yerden devam eder.`, [], 4000);
  $('#vGirdi')?.click();
}

/* ═════════ Oynatıcı ═════════ */
function oynatAc(i) {
  const L = VD.liste[i]; if (!L) return;
  if (VD.sira >= 0 && v()) konumKaydet(true);   // öncekinin kaldığı yer
  VD.sira = i; VD.ab = [null, null]; VD.altyazi = null; VD.ayKay = 0; VD.kilitli = false;
  if (VD.url) URL.revokeObjectURL(VD.url);
  VD.url = URL.createObjectURL(L.dosya);
  document.body.classList.add('vd-oynuyor');
  if (!$('#vSahne')) oynaticiCiz();
  $('#vBaslik').textContent = L.dosya.name;
  const el = v(); el.src = VD.url; el.playbackRate = VD.ayar.hiz;
  sesUygula(); gorunumUygula(); liste();
  if (L.altyazi) altyaziYukle(L.altyazi, true); else ayCiz();
  el.play().catch(() => {});
  history.state?.oyna || history.pushState({ oyna: 1 }, '', location.pathname + location.search + '#oynat');
  medyaOturumu();
  kontrolGoster();
}
function oynaticiCiz() {
  $('#app').innerHTML = `
  <div class="vd-sahne" id="vSahne" tabindex="-1">
    <video id="vVideo" playsinline preload="metadata"></video>
    <div class="vd-altyazi" id="vAy"></div>
    <div class="vd-hareket" id="vHareket"></div>
    <div class="vd-osd" id="vOsd"></div>
    <div class="vd-buyuk-oynat" id="vBuyuk" data-action="v-oynat">${IC.oynat}</div>
    <div class="vd-hata" id="vHata" hidden></div>
    <div class="vd-ust">
      <button class="icon-btn" data-action="v-kapat" title="Geri">${IC.geri}</button>
      <b id="vBaslik"></b>
      <button class="icon-btn" data-action="v-liste" title="Oynatma listesi">${IC.liste}</button>
      <button class="icon-btn" data-action="v-menu" title="Ayarlar">${IC.ayarV}</button>
    </div>
    <button class="vd-kilit-dugme" data-action="v-kilit" title="Ekranı kilitle">${IC.kilit}</button>
    <div class="vd-alt">
      <div class="vd-cubuk" id="vCubuk"><div class="vd-cubuk-arka"><i id="vYuklu"></i><i id="vIlerleme"></i><b id="vAbA"></b><b id="vAbB"></b></div><span class="vd-ipucu" id="vIpucu"></span></div>
      <div class="vd-dugmeler">
        <span class="vd-zaman" id="vZaman">0:00 / 0:00</span>
        <div class="vd-orta">
          <button class="icon-btn" data-action="v-onceki" title="Önceki">${IC.onceki}</button>
          <button class="icon-btn" data-action="v-atla" data-s="-10" title="10 sn geri">${IC.geri10}</button>
          <button class="icon-btn vd-oynat" data-action="v-oynat" id="vOynat" title="Oynat / duraklat">${IC.oynat}</button>
          <button class="icon-btn" data-action="v-atla" data-s="10" title="10 sn ileri">${IC.ileri10}</button>
          <button class="icon-btn" data-action="v-sonraki" title="Sonraki">${IC.sonraki}</button>
        </div>
        <div class="vd-sag">
          <button class="icon-btn vd-hiz" data-action="v-hiz" id="vHiz" title="Hız">1×</button>
          <button class="icon-btn" data-action="v-ay-menu" id="vAyD" title="Altyazı">${IC.altyazi}</button>
          <button class="icon-btn" data-action="v-sessiz" id="vSes" title="Ses">${IC.ses}</button>
          ${document.pictureInPictureEnabled ? `<button class="icon-btn vd-genis" data-action="v-pip" title="Pencere içinde pencere">${IC.pip}</button>` : ''}
          <button class="icon-btn" data-action="v-tam" id="vTam" title="Tam ekran">${IC.tamEkran}</button>
        </div>
      </div>
    </div>
    <aside class="vd-panel" id="vPanel" hidden></aside>
  </div>`;
  const el = v();
  el.addEventListener('timeupdate', zamanGuncelle);
  el.addEventListener('progress', zamanGuncelle);
  el.addEventListener('loadedmetadata', yuklendi);
  el.addEventListener('play', () => { durumCiz(); kontrolGoster(); });
  el.addEventListener('pause', () => { durumCiz(); kontrolGoster(true); konumKaydet(true); });
  el.addEventListener('ended', bitti);
  el.addEventListener('error', hataGoster);
  el.addEventListener('ratechange', () => { if ($('#vHiz')) $('#vHiz').textContent = (+el.playbackRate.toFixed(2)) + '×'; });
  el.addEventListener('volumechange', durumCiz);
  cubukBagla(); hareketBagla();
  requestAnimationFrame(ayDongu);
}
function yuklendi() {
  const el = v(), L = VD.liste[VD.sira], k = anahtar(L.dosya), g = VD.gecmis.find(x => x.k === k);
  $('#vHata').hidden = true;
  if (VD.ayar.devam && g && g.konum > 5 && g.konum < el.duration - 15) {
    el.currentTime = g.konum;
    osd(`Kaldığın yerden: ${zamanYaz(g.konum)}`, [['Baştan başla', () => { el.currentTime = 0; }]]);
  }
  gecmisGuncelle({ sure: el.duration });
  setTimeout(kucukResim, 1200);
  zamanGuncelle();
}
function hataGoster() {
  const L = VD.liste[VD.sira], uz = (L?.dosya.name.match(/\.([^.]+)$/) || [])[1]?.toUpperCase() || '';
  const e = $('#vHata'); e.hidden = false;
  e.innerHTML = `${IC.alert}<b>Bu video bu cihazda oynatılamıyor</b><span>${uz ? uz + ' dosyası ' : 'Dosya '}tarayıcının tanıdığı bir türde değil${/AVI|WMV|FLV|MPG|MPEG/.test(uz) ? ' (eski bir video türü)' : uz === 'MKV' || /HEVC|265/i.test(L?.dosya.name) ? ' ya da içindeki görüntü türü (ör. H.265) bu cihazda desteklenmiyor' : ''}. Videoyu MP4'e çevirip yeniden deneyebilirsin.</span>${VD.liste.length > 1 ? `<button class="btn" data-action="v-sonraki">Sonrakine geç</button>` : `<button class="btn" data-action="v-kapat">Geri dön</button>`}`;
}
function bitti() {
  konumKaydet(true);
  const el = v();
  if (VD.ab[0] != null && VD.ab[1] == null) { el.currentTime = VD.ab[0]; el.play(); return; }
  if (VD.ayar.otomatikSonraki && VD.sira < VD.liste.length - 1) { osd('Sıradaki video'); oynatAc(VD.sira + 1); }
  else { kontrolGoster(true); try { if (document.fullscreenElement) document.exitFullscreen(); } catch {} }
}
function zamanGuncelle() {
  const el = v(); if (!el || !$('#vZaman')) return;
  const d = el.duration || 0, t = el.currentTime || 0;
  $('#vZaman').textContent = `${zamanYaz(t)} / ${zamanYaz(d)}`;
  $('#vIlerleme').style.width = d ? (t / d * 100) + '%' : '0';
  if (el.buffered.length && d) $('#vYuklu').style.width = (el.buffered.end(el.buffered.length - 1) / d * 100) + '%';
  // A-B tekrar
  if (VD.ab[0] != null && VD.ab[1] != null && t >= VD.ab[1]) el.currentTime = VD.ab[0];
  const [a, b] = VD.ab;
  $('#vAbA').style.cssText = a != null && d ? `display:block;left:${a / d * 100}%` : '';
  $('#vAbB').style.cssText = b != null && d ? `display:block;left:${b / d * 100}%` : '';
  if (Date.now() - VD.sonKonumYaz > 5000) konumKaydet();
}
function durumCiz() {
  const el = v(); if (!el || !$('#vOynat')) return;
  $('#vOynat').innerHTML = el.paused ? IC.oynat : IC.duraklat;
  $('#vBuyuk').classList.toggle('gizli', !el.paused);
  $('#vSes').innerHTML = el.muted || VD.ayar.ses === 0 ? IC.sessiz : IC.ses;
  $('#vTam').innerHTML = document.fullscreenElement ? IC.kucukEkran : IC.tamEkran;
  navigator.mediaSession && (navigator.mediaSession.playbackState = el.paused ? 'paused' : 'playing');
}
// Kontroller birkaç saniye sonra gizlensin (oynarken)
function kontrolGoster(kalsin) {
  const s = $('#vSahne'); if (!s) return;
  s.classList.add('kontrol');
  clearTimeout(VD.gizleZaman);
  if (!kalsin && !v().paused && !$('#vPanel:not([hidden])')) VD.gizleZaman = setTimeout(() => s.classList.remove('kontrol'), 3200);
}
function osd(metin, eylemler) {
  const o = $('#vOsd'); if (!o) return;
  o.innerHTML = `<span>${esc(metin)}</span>${(eylemler || []).map((e, i) => `<button class="btn sm" data-osd="${i}">${esc(e[0])}</button>`).join('')}`;
  o.querySelectorAll('[data-osd]').forEach(b => b.onclick = ev => { ev.stopPropagation(); eylemler[+b.dataset.osd][1](); o.classList.remove('gor'); });
  o.classList.add('gor'); clearTimeout(o._z); o._z = setTimeout(() => o.classList.remove('gor'), eylemler?.length ? 6000 : 1200);
}

/* ═════════ Konum, geçmiş, küçük resim ═════════ */
function gecmisGuncelle(ek) {
  const L = VD.liste[VD.sira]; if (!L) return;
  const k = anahtar(L.dosya); let g = VD.gecmis.find(x => x.k === k);
  if (!g) { g = { k, ad: L.dosya.name, boy: L.dosya.size, sure: 0, konum: 0 }; VD.gecmis.unshift(g); }
  Object.assign(g, ek, { zaman: Date.now() });
  VD.gecmis = [g, ...VD.gecmis.filter(x => x !== g)].slice(0, 40);
  try { store.set('videoGecmis', VD.gecmis); } catch { VD.gecmis.forEach((x, i) => { if (i > 10) delete x.resim; }); store.set('videoGecmis', VD.gecmis); }
}
function konumKaydet(simdi) {
  const el = v(); if (!el || !el.duration) return;
  VD.sonKonumYaz = Date.now();
  if (simdi || !el.paused) gecmisGuncelle({ konum: el.currentTime, sure: el.duration });
}
function kucukResim() {
  const el = v(); if (!el?.videoWidth) return;
  try {
    const c = document.createElement('canvas'), k = 320 / el.videoWidth; c.width = 320; c.height = Math.round(el.videoHeight * k);
    c.getContext('2d').drawImage(el, 0, 0, c.width, c.height);
    gecmisGuncelle({ resim: c.toDataURL('image/jpeg', 0.6) });
  } catch {}
}

/* ═════════ Ses: yükseltme (%200'e kadar) ═════════ */
function sesUygula() {
  const el = v(); if (!el) return;
  el.volume = Math.min(1, VD.ayar.ses); el.muted = VD.ayar.sessiz;
  if (VD.ayar.yukselt > 1 && !VD.gain) {
    try {
      VD.ctx = new (window.AudioContext || window.webkitAudioContext)();
      VD.kaynakSes = VD.ctx.createMediaElementSource(el); VD.gain = VD.ctx.createGain();
      VD.kaynakSes.connect(VD.gain).connect(VD.ctx.destination);
    } catch { VD.gain = null; }
  }
  if (VD.gain) { VD.gain.gain.value = VD.ayar.yukselt; VD.ctx.resume?.(); }
}
function sesDegis(fark) {
  const A = VD.ayar;
  // 0–100: normal ses; 100'ün üstü yükseltme
  let toplam = Math.round((A.ses * (A.yukselt > 1 ? A.yukselt : 1)) * 100) + fark;
  toplam = Math.max(0, Math.min(200, toplam));
  A.ses = Math.min(1, toplam / 100); A.yukselt = toplam > 100 ? toplam / 100 : 1; A.sessiz = false;
  ayarKaydet(); sesUygula(); osd(`Ses %${toplam}${toplam > 100 ? ' (yükseltilmiş)' : ''}`);
}

/* ═════════ Görüntü: oran, döndürme, parlaklık ═════════ */
function gorunumUygula() {
  const el = v(); if (!el) return;
  const A = VD.ayar;
  el.style.objectFit = { sigdir: 'contain', doldur: 'cover', uzat: 'fill' }[A.oran] || 'contain';
  const yan = A.donme % 180 !== 0, s = $('#vSahne');
  el.style.transform = A.donme ? `rotate(${A.donme}deg)` : '';
  if (yan && s) { el.style.width = s.clientHeight + 'px'; el.style.height = s.clientWidth + 'px'; } else { el.style.width = ''; el.style.height = ''; }
  el.style.filter = A.parlak !== 1 ? `brightness(${A.parlak})` : '';
}

/* ═════════ Altyazı ═════════ */
async function metinOku(dosya) {
  const b = new Uint8Array(await dosya.arrayBuffer());
  try { return new TextDecoder('utf-8', { fatal: true }).decode(b); } catch { return new TextDecoder('windows-1254').decode(b); }   // eski Türkçe altyazılar
}
const saniye = s => { const m = String(s).trim().replace(',', '.').match(/(?:(\d+):)?(\d+):(\d+(?:\.\d+)?)/); return m ? (+(m[1] || 0)) * 3600 + (+m[2]) * 60 + (+m[3]) : NaN; };
function altyaziCoz(metin, ad) {
  metin = metin.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  const out = [];
  if (/\.(ass|ssa)$/i.test(ad) || /^\[Script Info\]/m.test(metin)) {
    let alanlar = null;
    for (const s of metin.split('\n')) {
      if (/^Format:/i.test(s) && alanlar == null && /Start/i.test(s)) { alanlar = s.slice(7).split(',').map(x => x.trim().toLowerCase()); continue; }
      if (!/^Dialogue:/i.test(s)) continue;
      const p = s.slice(9).split(','), f = alanlar || ['layer', 'start', 'end', 'style', 'name', 'marginl', 'marginr', 'marginv', 'effect', 'text'];
      const yazi = p.slice(f.indexOf('text')).join(',').replace(/\{[^}]*\}/g, '').replace(/\\N/gi, '\n').replace(/\\h/g, ' ');
      out.push({ s: saniye(p[f.indexOf('start')]), e: saniye(p[f.indexOf('end')]), t: yazi });
    }
  } else {
    for (const blok of metin.split(/\n{2,}/)) {
      const satir = blok.split('\n'), i = satir.findIndex(x => x.includes('-->')); if (i < 0) continue;
      const [a, b] = satir[i].split('-->');
      out.push({ s: saniye(a), e: saniye(b.trim().split(/\s/)[0]), t: satir.slice(i + 1).join('\n') });
    }
  }
  return out.filter(x => isFinite(x.s) && isFinite(x.e) && x.t.trim()).sort((a, b) => a.s - b.s);
}
async function altyaziYukle(dosya, sessiz) {
  try {
    const l = altyaziCoz(await metinOku(dosya), dosya.name);
    if (!l.length) throw new Error('içinde altyazı bulunamadı');
    VD.altyazi = { ad: dosya.name, l }; VD.ayKay = 0;
    if (VD.liste[VD.sira]) VD.liste[VD.sira].altyazi = dosya;
    if (!sessiz) osd('Altyazı açıldı: ' + dosya.name); else osd('Altyazı: ' + dosya.name);
  } catch (e) { toast('Altyazı açılamadı: ' + e.message); }
  ayCiz();
}
function ayCiz() { const b = $('#vAyD'); if (b) b.classList.toggle('on', !!VD.altyazi); }
let sonAy = '';
function ayDongu() {
  const el = v(), kutu = $('#vAy');
  if (!el || !kutu) return;
  let yazi = '';
  if (VD.altyazi) {
    const t = el.currentTime - VD.ayKay, l = VD.altyazi.l;
    let lo = 0, hi = l.length - 1, i = -1;
    while (lo <= hi) { const m = (lo + hi) >> 1; if (l[m].s <= t) { i = m; lo = m + 1; } else hi = m - 1; }
    const aktif = []; for (let j = i; j >= 0 && j > i - 6; j--) if (l[j].s <= t && l[j].e > t) aktif.unshift(l[j].t);
    yazi = aktif.join('\n');
  }
  if (yazi !== sonAy) {
    sonAy = yazi;
    kutu.innerHTML = yazi ? yazi.split('\n').map(s => `<span>${esc(s).replace(/&lt;(\/?)(i|b|u)&gt;/gi, '<$1$2>').replace(/&lt;[^&]*&gt;/g, '')}</span>`).join('<br>') : '';
  }
  kutu.style.fontSize = `calc(clamp(16px, 3.6vmin, 34px) * ${VD.ayar.ayBoyut / 100})`;
  kutu.classList.toggle('arka', VD.ayar.ayArka);
  requestAnimationFrame(ayDongu);
}

/* ═════════ İlerleme çubuğu (fare ve parmak) ═════════ */
function cubukBagla() {
  const c = $('#vCubuk'), ip = $('#vIpucu');
  const oran = e => { const r = c.getBoundingClientRect(); return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); };
  let surukle = false;
  c.addEventListener('pointerdown', e => { surukle = true; c.setPointerCapture(e.pointerId); git(e); });
  c.addEventListener('pointermove', e => {
    const d = v().duration || 0, o = oran(e);
    ip.textContent = zamanYaz(o * d); ip.style.left = (o * 100) + '%'; ip.classList.add('gor');
    if (surukle) git(e);
  });
  c.addEventListener('pointerleave', () => ip.classList.remove('gor'));
  const bit = () => { surukle = false; ip.classList.remove('gor'); };
  c.addEventListener('pointerup', bit); c.addEventListener('pointercancel', bit);
  function git(e) { const el = v(); if (el.duration) { el.currentTime = oran(e) * el.duration; zamanGuncelle(); kontrolGoster(); } }
}

/* ═════════ Dokunmatik hareketler ═════════
   Çift dokun: sol yarı 10 sn geri, sağ yarı 10 sn ileri, orta oynat/duraklat. Tek dokun: kontrolleri göster/gizle.
   Sağda yukarı-aşağı: ses; solda: parlaklık. Yatay kaydır: ileri-geri sarma. */
function hareketBagla() {
  const h = $('#vHareket'); let bas = null, sonDokun = 0, tekZaman = null;
  h.addEventListener('pointerdown', e => {
    if (VD.kilitli) { kontrolGoster(); return; }
    bas = { x: e.clientX, y: e.clientY, t: Date.now(), zaman: v().currentTime, ses: Math.round(VD.ayar.ses * VD.ayar.yukselt * 100), parlak: VD.ayar.parlak, tur: null, w: h.clientWidth, hh: h.clientHeight };
  });
  h.addEventListener('pointermove', e => {
    if (!bas || e.pointerType === 'mouse' && e.buttons === 0) return;
    const dx = e.clientX - bas.x, dy = e.clientY - bas.y;
    if (!bas.tur) { if (Math.abs(dx) > 18 && Math.abs(dx) > Math.abs(dy)) bas.tur = 'sar'; else if (Math.abs(dy) > 18) bas.tur = bas.x > bas.w / 2 ? 'ses' : 'parlak'; else return; h.setPointerCapture(e.pointerId); }
    const el = v();
    if (bas.tur === 'sar' && el.duration) { const s = Math.max(0, Math.min(el.duration, bas.zaman + dx / bas.w * Math.min(300, el.duration))); el.currentTime = s; osd(`${zamanYaz(s)} (${dx >= 0 ? '+' : '−'}${zamanYaz(Math.abs(s - bas.zaman))})`); }
    if (bas.tur === 'ses') { const yeni = Math.max(0, Math.min(200, bas.ses - Math.round(dy / bas.hh * 200))); sesDegis(yeni - Math.round(VD.ayar.ses * VD.ayar.yukselt * 100)); }
    if (bas.tur === 'parlak') { VD.ayar.parlak = Math.max(0.2, Math.min(1.6, bas.parlak - dy / bas.hh * 1.4)); gorunumUygula(); osd(`Parlaklık %${Math.round(VD.ayar.parlak * 100)}`); }
  });
  const bit = e => {
    if (!bas) return; const b = bas; bas = null;
    if (b.tur) { ayarKaydet(); return; }
    if (Date.now() - b.t > 500 || VD.kilitli) return;
    const simdi = Date.now(), bolge = b.x < b.w * 0.35 ? -1 : b.x > b.w * 0.65 ? 1 : 0;
    if (simdi - sonDokun < 300) {   // çift dokunma
      clearTimeout(tekZaman); sonDokun = 0;
      if (bolge) atla(bolge * 10); else oynatDuraklat();
      return;
    }
    sonDokun = simdi;
    tekZaman = setTimeout(() => { const s = $('#vSahne'); if (e.pointerType === 'mouse') oynatDuraklat(); else if (s.classList.contains('kontrol')) { clearTimeout(VD.gizleZaman); s.classList.remove('kontrol'); } else kontrolGoster(); }, 260);
  };
  h.addEventListener('pointerup', bit); h.addEventListener('pointercancel', () => { bas = null; });
  h.addEventListener('pointermove', () => { if (matchMedia('(hover: hover)').matches) kontrolGoster(); });
}
function atla(s) { const el = v(); if (!el.duration) return; el.currentTime = Math.max(0, Math.min(el.duration, el.currentTime + s)); osd(`${s > 0 ? '+' : '−'}${Math.abs(s)} sn`); kontrolGoster(); }
function oynatDuraklat() { const el = v(); if (!el) return; if (el.paused) { el.play().catch(e => toast('Oynatılamadı: ' + e.message)); } else el.pause(); }

/* ═════════ Paneller: liste, hız, altyazı, ayarlar ═════════ */
function panel(html) {
  const p = $('#vPanel'); p.innerHTML = `<div class="vd-panel-ic">${html}</div>`; p.hidden = false; kontrolGoster(true);
}
function panelKapat() { const p = $('#vPanel'); if (p) { p.hidden = true; p.innerHTML = ''; } kontrolGoster(); }
function liste() {
  const p = $('#vPanel'); if (!p || p.hidden || !p.querySelector('.vd-liste')) return;
  ACTIONS['v-liste']();
}
function menuCiz() {
  const A = VD.ayar, el = v();
  panel(`<header><b>Ayarlar</b><button class="icon-btn sm" data-action="v-panel-kapat">${IC.close}</button></header>
    <section><h4>Görüntü</h4><div class="seg">${[['sigdir', 'Sığdır'], ['doldur', 'Doldur'], ['uzat', 'Uzat']].map(([k, n]) => `<button class="${A.oran === k ? 'on' : ''}" data-action="v-oran" data-k="${k}">${n}</button>`).join('')}</div>
      <div class="vd-satir"><button class="btn sm" data-action="v-dondur">↻ Döndür${A.donme ? ` (${A.donme}°)` : ''}</button><button class="btn sm" data-action="v-foto">${IC.foto}Ekran görüntüsü</button></div>
      <div class="vd-satir"><span>Parlaklık</span><input type="range" min="0.2" max="1.6" step="0.05" value="${A.parlak}" data-v="parlak"></div></section>
    <section><h4>Ses</h4><div class="vd-satir"><span>Ses</span><input type="range" min="0" max="200" step="5" value="${Math.round(A.ses * A.yukselt * 100)}" data-v="ses"><b id="vSesD">%${Math.round(A.ses * A.yukselt * 100)}</b></div>
      <p class="vd-ipucu-y">100'ün üstü sesi yükseltir; çok kısık kaydedilmiş videolar için.</p></section>
    <section><h4>Tekrar</h4><div class="vd-satir">
      <button class="btn sm ${VD.ab[0] != null ? 'on' : ''}" data-action="v-ab" data-n="0">A: ${VD.ab[0] != null ? zamanYaz(VD.ab[0]) : 'başlangıç'}</button>
      <button class="btn sm ${VD.ab[1] != null ? 'on' : ''}" data-action="v-ab" data-n="1">B: ${VD.ab[1] != null ? zamanYaz(VD.ab[1]) : 'bitiş'}</button>
      ${VD.ab[0] != null || VD.ab[1] != null ? '<button class="btn sm" data-action="v-ab-sil">Kapat</button>' : ''}</div>
      <p class="vd-ipucu-y">İki nokta arasını sürekli tekrarlar. Düğmeye bastığın anki yer işaretlenir.</p></section>
    <section><h4>Oynatma</h4>
      <label class="vd-anahtar"><input type="checkbox" data-v="otomatikSonraki" ${A.otomatikSonraki ? 'checked' : ''}><span>Bitince sıradakini oynat</span></label>
      <label class="vd-anahtar"><input type="checkbox" data-v="devam" ${A.devam ? 'checked' : ''}><span>Kaldığım yerden devam et</span></label></section>
    <p class="vd-ipucu-y">Kısayollar: Boşluk oynat/duraklat · ← → 10 sn · ↑ ↓ ses · F tam ekran · M sessiz · [ ] hız · S ekran görüntüsü · A/B tekrar</p>`);
}
function ayMenu() {
  const A = VD.ayar, Y = VD.altyazi;
  panel(`<header><b>Altyazı</b><button class="icon-btn sm" data-action="v-panel-kapat">${IC.close}</button></header>
    <section>${Y ? `<p class="vd-ay-ad">${IC.altyazi}<span>${esc(Y.ad)}</span><button class="btn sm" data-action="v-ay-kapat">Kapat</button></p>` : '<p class="vd-ipucu-y">Altyazı yok.</p>'}
      <label class="btn sm">${IC.altyazi}Altyazı dosyası seç<input type="file" id="vAyGirdi" accept=".srt,.vtt,.ass,.ssa,text/plain" hidden></label></section>
    ${Y ? `<section><h4>Zamanlama</h4><div class="vd-satir vd-kay"><button class="btn sm" data-action="v-ay-kay" data-s="-0.5">−0,5 sn</button><b id="vAyKay">${VD.ayKay ? (VD.ayKay > 0 ? '+' : '') + VD.ayKay.toFixed(1).replace('.', ',') + ' sn' : 'Kaydırma yok'}</b><button class="btn sm" data-action="v-ay-kay" data-s="0.5">+0,5 sn</button></div>
      <p class="vd-ipucu-y">Yazı konuşmadan önce geliyorsa + ile geciktir, sonra geliyorsa − ile öne al.</p></section>` : ''}
    <section><h4>Görünüm</h4><div class="vd-satir"><span>Boyut</span><input type="range" min="60" max="180" step="10" value="${A.ayBoyut}" data-v="ayBoyut"><b>%${A.ayBoyut}</b></div>
      <label class="vd-anahtar"><input type="checkbox" data-v="ayArka" ${A.ayArka ? 'checked' : ''}><span>Yazının arkası koyu olsun</span></label></section>`);
}
function ekranGoruntusu() {
  const el = v(); if (!el?.videoWidth) return;
  const c = document.createElement('canvas'); c.width = el.videoWidth; c.height = el.videoHeight;
  c.getContext('2d').drawImage(el, 0, 0);
  c.toBlob(b => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(b);
    a.download = `${VD.liste[VD.sira].dosya.name.replace(/\.[^.]+$/, '')} ${zamanYaz(el.currentTime).replace(/:/g, '.')}.png`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 8000);
    osd('Ekran görüntüsü kaydedildi');
  }, 'image/png');
}
function oynaticiKapat() {
  document.documentElement.classList.add('vd-html');
  konumKaydet(true);
  const el = v(); if (el) { el.pause(); el.removeAttribute('src'); el.load(); }
  if (VD.url) URL.revokeObjectURL(VD.url); VD.url = null;
  try { VD.ctx?.close(); } catch {} VD.ctx = null; VD.gain = null;
  try { if (document.fullscreenElement) document.exitFullscreen(); } catch {}
  if (navigator.mediaSession) navigator.mediaSession.metadata = null;
  VD.sira = -1; anaCiz();
}
function medyaOturumu() {
  if (!('mediaSession' in navigator)) return;
  const L = VD.liste[VD.sira];
  try {
    navigator.mediaSession.metadata = new MediaMetadata({ title: L.dosya.name.replace(/\.[^.]+$/, ''), artist: 'Video' });
    navigator.mediaSession.setActionHandler('play', () => v().play());
    navigator.mediaSession.setActionHandler('pause', () => v().pause());
    navigator.mediaSession.setActionHandler('seekbackward', () => atla(-10));
    navigator.mediaSession.setActionHandler('seekforward', () => atla(10));
    navigator.mediaSession.setActionHandler('previoustrack', VD.sira > 0 ? () => oynatAc(VD.sira - 1) : null);
    navigator.mediaSession.setActionHandler('nexttrack', VD.sira < VD.liste.length - 1 ? () => oynatAc(VD.sira + 1) : null);
  } catch {}
}
const HIZLAR = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
function hizAyarla(h) { VD.ayar.hiz = h; ayarKaydet(); v().playbackRate = h; osd(`Hız ${String(h).replace('.', ',')}×`); }

/* ═════════ Ayarlar (ana ekran) ═════════ */
function ayarAc() {
  const t = store.get('theme', 'light');
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet settings"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Ayarlar</h3></header>
    <div class="set-body">
      <section><h4>Görünüm</h4><div class="seg yon-seg">${[['light', 'Cam'], ['dark', 'Koyu'], ['auto', 'Otomatik'], ['flat', 'Düz']].map(([k, n]) => `<button class="${t === k ? 'on' : ''}" data-action="v-tema" data-t="${k}">${n}</button>`).join('')}</div></section>
      <section><h4>Verilerin</h4><div class="set-row"><div><b>Videoların bu cihazdan çıkmaz</b><span>Video internete bağlanmaz. Sadece son izlediklerinin adı, kaldığın yer ve küçük bir resmi bu cihazda hatırlanır.</span></div><button class="btn" data-action="v-gecmis-temizle">Geçmişi sil</button></div></section>
      <section><h4>Uygulama</h4>${typeof aboutRow === 'function' ? aboutRow() : ''}</section>
    </div></div></div>`;
}

/* ═════════ Olaylar ═════════ */
Object.assign(ACTIONS, {
  'v-ayar': () => ayarAc(), settings: () => ayarAc(),
  'v-tema': el => { store.set('theme', el.dataset.t); applyTheme(el.dataset.t); ayarAc(); },
  'v-sec': () => pickerSec(),
  'v-girdi': () => $('#vGirdi')?.click(),
  'v-gecmis-ac': (el, e) => { if (e?.target?.closest('.vd-kart-sil')) return; gecmisAc(el.dataset.k); },
  'v-gecmis-sil': el => { VD.gecmis = VD.gecmis.filter(g => g.k !== el.dataset.k); store.set('videoGecmis', VD.gecmis); TUT.sil(el.dataset.k); anaCiz(); },
  'v-gecmis-temizle': () => { if (!confirm('Son izlenenler listesi ve kaldığın yerler silinsin mi?')) return; VD.gecmis = []; store.set('videoGecmis', []); closeModal(); anaCiz(); },
  'v-kapat': () => { if (history.state?.oyna) history.back(); else oynaticiKapat(); },
  'v-oynat': () => oynatDuraklat(),
  'v-atla': el => atla(+el.dataset.s),
  'v-onceki': () => { const el = v(); if (el.currentTime > 5 || VD.sira === 0) { el.currentTime = 0; } else oynatAc(VD.sira - 1); },
  'v-sonraki': () => { if (VD.sira < VD.liste.length - 1) oynatAc(VD.sira + 1); else osd('Listenin sonu'); },
  'v-sessiz': () => { VD.ayar.sessiz = !VD.ayar.sessiz; ayarKaydet(); sesUygula(); osd(VD.ayar.sessiz ? 'Sessiz' : 'Ses açık'); },
  'v-tam': async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else { await $('#vSahne').requestFullscreen({ navigationUI: 'hide' }); try { await screen.orientation?.lock?.('landscape'); } catch {} } } catch { v().webkitEnterFullscreen?.(); } durumCiz(); },
  'v-pip': async () => { try { if (document.pictureInPictureElement) await document.exitPictureInPicture(); else await v().requestPictureInPicture(); } catch (e) { toast('Açılamadı: ' + e.message); } },
  'v-hiz': () => panel(`<header><b>Hız</b><button class="icon-btn sm" data-action="v-panel-kapat">${IC.close}</button></header><div class="vd-hizlar">${HIZLAR.map(h => `<button class="${v().playbackRate === h ? 'on' : ''}" data-action="v-hiz-sec" data-h="${h}">${String(h).replace('.', ',')}×</button>`).join('')}</div>`),
  'v-hiz-sec': el => { hizAyarla(+el.dataset.h); panelKapat(); },
  'v-liste': () => panel(`<header><b>Oynatma listesi</b><button class="icon-btn sm" data-action="v-panel-kapat">${IC.close}</button></header>
      <div class="vd-liste">${VD.liste.map((L, i) => `<button class="${i === VD.sira ? 'on' : ''}" data-action="v-liste-sec" data-i="${i}"><span>${i + 1}</span><b>${esc(L.dosya.name)}</b>${L.altyazi ? IC.altyazi : ''}</button>`).join('')}</div>
      <label class="btn sm">${IC.videoI}Video ekle<input type="file" id="vEkle" accept="video/*,.mkv,.avi,.ts,.srt,.vtt,.ass" multiple hidden></label>`),
  'v-liste-sec': el => { panelKapat(); oynatAc(+el.dataset.i); },
  'v-menu': () => menuCiz(),
  'v-ay-menu': () => ayMenu(),
  'v-panel-kapat': () => panelKapat(),
  'v-oran': el => { VD.ayar.oran = el.dataset.k; ayarKaydet(); gorunumUygula(); menuCiz(); },
  'v-dondur': () => { VD.ayar.donme = (VD.ayar.donme + 90) % 360; ayarKaydet(); gorunumUygula(); menuCiz(); },
  'v-foto': () => ekranGoruntusu(),
  'v-ab': el => { const n = +el.dataset.n, t = v().currentTime; VD.ab[n] = t; if (VD.ab[0] != null && VD.ab[1] != null && VD.ab[1] <= VD.ab[0]) VD.ab = [VD.ab[1], VD.ab[0]]; osd(n ? 'B noktası: ' + zamanYaz(t) : 'A noktası: ' + zamanYaz(t)); if ($('#vPanel') && !$('#vPanel').hidden) menuCiz(); zamanGuncelle(); },
  'v-ab-sil': () => { VD.ab = [null, null]; menuCiz(); zamanGuncelle(); },
  'v-ay-kapat': () => { VD.altyazi = null; if (VD.liste[VD.sira]) VD.liste[VD.sira].altyazi = null; ayCiz(); ayMenu(); },
  'v-ay-kay': el => { VD.ayKay = Math.round((VD.ayKay + +el.dataset.s) * 10) / 10; ayMenu(); },
  'v-kilit': () => { VD.kilitli = !VD.kilitli; $('#vSahne').classList.toggle('kilitli', VD.kilitli); $('.vd-kilit-dugme').innerHTML = VD.kilitli ? IC.kilitAcik : IC.kilit; osd(VD.kilitli ? 'Ekran kilitlendi · açmak için kilide dokun' : 'Kilit açıldı'); kontrolGoster(); }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'vGirdi' || t.id === 'vKlasor') { const l = [...t.files]; t.value = ''; if (l.length) dosyalariAc(l); }
  if (t.id === 'vEkle') { const l = [...t.files]; t.value = ''; const vid = l.filter(f => VIDEO_UZ.test(f.name) || /^video\//.test(f.type)).sort(dogalSira); VD.liste.push(...vid.map(f => ({ dosya: f, altyazi: l.find(a => AY_UZ.test(a.name) && a.name.replace(/\.[^.]+$/, '') === f.name.replace(/\.[^.]+$/, '')) || null }))); ACTIONS['v-liste'](); }
  if (t.id === 'vAyGirdi') { const f = t.files[0]; t.value = ''; if (f) { altyaziYukle(f); setTimeout(ayMenu, 100); } }
  if (t.dataset?.v && t.type === 'checkbox') { VD.ayar[t.dataset.v] = t.checked; ayarKaydet(); }
});
document.addEventListener('input', e => {
  const t = e.target, k = t.dataset?.v; if (!k || t.type !== 'range') return;
  if (k === 'ses') { sesDegis(+t.value - Math.round(VD.ayar.ses * VD.ayar.yukselt * 100)); const d = $('#vSesD'); if (d) d.textContent = '%' + t.value; return; }
  VD.ayar[k] = +t.value; ayarKaydet();
  if (k === 'parlak') gorunumUygula();
  if (k === 'ayBoyut') t.nextElementSibling.textContent = '%' + t.value;
});
document.addEventListener('keydown', e => {
  if (VD.sira < 0 || !$('#vSahne') || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key, el = v(); let tut = true;
  if (k === ' ' || k === 'k' || k === 'K') oynatDuraklat();
  else if (k === 'ArrowLeft' || k === 'j') atla(e.shiftKey ? -60 : -10);
  else if (k === 'ArrowRight' || k === 'l') atla(e.shiftKey ? 60 : 10);
  else if (k === 'ArrowUp') sesDegis(5);
  else if (k === 'ArrowDown') sesDegis(-5);
  else if (k === 'f' || k === 'F') ACTIONS['v-tam']();
  else if (k === 'm' || k === 'M') ACTIONS['v-sessiz']();
  else if (k === ']') hizAyarla(HIZLAR[Math.min(HIZLAR.length - 1, HIZLAR.indexOf(el.playbackRate) + 1)] || 1);
  else if (k === '[') hizAyarla(HIZLAR[Math.max(0, HIZLAR.indexOf(el.playbackRate) - 1)] || 1);
  else if (k === 's' || k === 'S') ekranGoruntusu();
  else if (k === 'a' || k === 'A') ACTIONS['v-ab']({ dataset: { n: '0' } });
  else if (k === 'b' || k === 'B') ACTIONS['v-ab']({ dataset: { n: '1' } });
  else if (k === 'n' || k === 'N') ACTIONS['v-sonraki']();
  else if (k === 'p' || k === 'P') ACTIONS['v-onceki']();
  else if (k === 'Escape' && !document.fullscreenElement) { if (!$('#vPanel').hidden) panelKapat(); else ACTIONS['v-kapat'](); }
  else if (/^[0-9]$/.test(k) && el.duration) el.currentTime = el.duration * (+k / 10);
  else tut = false;
  if (tut) { e.preventDefault(); kontrolGoster(); }
});
document.addEventListener('dragover', e => { if (e.dataTransfer?.types?.includes('Files')) { e.preventDefault(); document.body.classList.add('vd-surukle'); } });
document.addEventListener('dragleave', e => { if (e.relatedTarget == null) document.body.classList.remove('vd-surukle'); });
document.addEventListener('drop', async e => {
  document.body.classList.remove('vd-surukle');
  if (!e.dataTransfer?.files?.length) return; e.preventDefault();
  const dosyalar = [...e.dataTransfer.files];
  if (VD.sira >= 0 && dosyalar.every(f => AY_UZ.test(f.name))) return altyaziYukle(dosyalar[0]);
  let hs = [];
  try { hs = await Promise.all([...e.dataTransfer.items].map(i => i.getAsFileSystemHandle?.() || null)); } catch {}
  dosyalariAc(dosyalar, hs);
});
document.addEventListener('fullscreenchange', () => { durumCiz(); setTimeout(gorunumUygula, 100); });
window.addEventListener('resize', () => { if (VD.ayar.donme % 180) gorunumUygula(); });
window.addEventListener('popstate', () => { if (VD.sira >= 0) oynaticiKapat(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') konumKaydet(true); });
window.addEventListener('pagehide', () => konumKaydet(true));
document.addEventListener('pointermove', e => { if (VD.sira >= 0 && e.pointerType === 'mouse') kontrolGoster(); });
