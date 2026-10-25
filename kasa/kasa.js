// Suha Kasa — uygulama mantığı
import * as K from './kasa-sifre.js';

/* ───────── IndexedDB (tek kayıt: 'depo') ───────── */
const DBAD = 'suha-kasa';
function db() {
  return new Promise((ok, no) => {
    const r = indexedDB.open(DBAD, 1);
    r.onupgradeneeded = () => r.result.createObjectStore('kv');
    r.onsuccess = () => ok(r.result);
    r.onerror = () => no(r.error);
  });
}
async function dGet(k) { const d = await db(); return new Promise((ok, no) => { const t = d.transaction('kv').objectStore('kv').get(k); t.onsuccess = () => ok(t.result); t.onerror = () => no(t.error); }); }
async function dSet(k, v) { const d = await db(); return new Promise((ok, no) => { const t = d.transaction('kv', 'readwrite').objectStore('kv').put(v, k); t.onsuccess = () => ok(); t.onerror = () => no(t.error); }); }
async function dDel(k) { const d = await db(); return new Promise((ok, no) => { const t = d.transaction('kv', 'readwrite').objectStore('kv').delete(k); t.onsuccess = () => ok(); t.onerror = () => no(t.error); }); }

/* ───────── durum ───────── */
let depo = null;            // şifreli (diskte)
let kasa = null;            // çözülmüş (bellekte)
let veriAnahtari = null;    // bellekte
let kilitZaman = null;      // otomatik kilit sayacı
let panoZaman = null;       // pano temizleme sayacı
let aktifFiltre = 'hepsi';
let seciliId = null;        // geniş modda sağ panelde açık kayıt

// geniş (masaüstü) mod: iki panel; dar: tek sütun + modal
const GENIS = () => window.matchMedia('(min-width:900px)').matches;
window.matchMedia('(min-width:900px)').addEventListener('change', () => { if (kasa && $('#liste')) ekranAna(); });

/* ───────── yardımcılar ───────── */
const $ = (s, k = document) => k.querySelector(s);
const kok = $('#kok');
const modalKat = $('#modal-kat');
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const sv = (p, w = 20) => `<svg viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const IC = {
  giris: sv('<circle cx="12" cy="10" r="3"/><path d="M12 13v3"/><path d="M8 20h8"/>'),
  kart: sv('<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/>'),
  not: sv('<path d="M6 3h9l3 3v15H6z"/><path d="M15 3v3h3"/><path d="M9 12h6M9 15h4"/>'),
  wifi: sv('<path d="M5 12.5a10 10 0 0 1 14 0M8 15.5a6 6 0 0 1 8 0"/><circle cx="12" cy="19" r="1.1" fill="currentColor" stroke="none"/>'),
  kimlik: sv('<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="11" r="2"/><path d="M13 10h5M13 13h4M5.2 16a3 3 0 0 1 6.6 0"/>'),
  kopya: sv('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>', 18),
  ayar: sv('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>', 22),
  kilit: sv('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', 22),
  arti: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  goz: sv('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>', 18),
  gozKapali: sv('<path d="M4 4l16 16"/><path d="M9.9 5.2A10 10 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-3.2 3.9M6.2 6.2A18 18 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 3-.45"/><path d="M9.8 9.8a3 3 0 0 0 4.2 4.3"/>', 18),
  uret: sv('<path d="M15 4V2M15 4l-1.5 1.5M15 4l1.5 1.5"/><path d="M4 20l9.5-9.5M14 6l4 4L8.5 19.5 4 20l.5-4.5z"/><path d="M19 11l1 1"/>', 20),
  yenile: sv('<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>', 18),
  geri: sv('<path d="M15 5l-7 7 7 7"/>', 22),
  duzenle: sv('<path d="M4 20l4-1 10-10-3-3L5 16l-1 4z"/><path d="M14 6l3 3"/>', 18),
  yazdir: sv('<path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2"/><rect x="7" y="14" width="10" height="7" rx="1"/>', 18),
  yildiz: sv('<path d="m12 3.3 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.6l-5.2 2.8 1-5.8L3.6 9.4l5.8-.8z"/>', 18),
  bosKasa: sv('<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="11" cy="12" r="3.3"/><path d="M11 8.6v-1M11 16.4v1M7.6 12h-1M15.4 12h1"/><path d="M16.5 10v4"/>', 56),
};
const TURAD = { giris: 'Giriş', kart: 'Kart', not: 'Gizli not', wifi: 'Wi-Fi', kimlik: 'Kimlik' };
const TURRENK = { giris: '#4b9bff', kart: '#f3c54a', not: '#9aa3af', wifi: '#2fd36b', kimlik: '#b794f6' };

// harf avatarı: tür rengiyle, köşede tür ikonu
function avatarHTML(x) {
  const renk = TURRENK[x.tur] || '#9aa3af';
  const harf = esc((x.baslik || '?').trim().charAt(0).toUpperCase() || '?');
  return `<span class="avatar" style="background:${renk}22;color:${renk}">${harf}
    <span class="turik" style="color:${renk}">${IC[x.tur] || IC.not}</span></span>`;
}

// çelik kasa kadranı (SVG) — kurulum/kilit ekranı
function kadranHTML(sinif = '') {
  return `<div class="kadranSar"><svg class="kadran ${sinif}" width="128" height="128" viewBox="0 0 128 128">
    <defs><radialGradient id="celikG" cx="38%" cy="32%" r="75%">
      <stop offset="0%" stop-color="#565d67"/><stop offset="60%" stop-color="#3a4049"/><stop offset="100%" stop-color="#23272d"/>
    </radialGradient></defs>
    <circle class="halkaDis" cx="64" cy="64" r="60"/>
    <circle class="yuz" cx="64" cy="64" r="48"/>
    ${Array.from({ length: 24 }, (_, i) => { const a = i * 15 * Math.PI / 180, r1 = 44, r2 = i % 2 ? 40 : 37; return `<line class="tik" x1="${64 + r1 * Math.sin(a)}" y1="${64 - r1 * Math.cos(a)}" x2="${64 + r2 * Math.sin(a)}" y2="${64 - r2 * Math.cos(a)}"/>`; }).join('')}
    <circle class="knob" cx="64" cy="64" r="15"/>
    <circle class="knobIc" cx="64" cy="64" r="6"/>
    <rect class="kol" x="60" y="20" width="8" height="20" rx="3"/>
    <circle class="isik" cx="98" cy="64" r="5"/>
  </svg></div>`;
}

function toast(m) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = m;
  document.body.appendChild(t); setTimeout(() => t.remove(), 2200);
}

// pano: masaüstü köprüsü varsa onu kullan, yoksa tarayıcı
async function panoYaz(metin) { try { if (window.kasaMasaustu) await kasaMasaustu.panoYaz(metin); else await navigator.clipboard.writeText(metin); return true; } catch { return false; } }
async function panoTemizle() { try { if (window.kasaMasaustu) await kasaMasaustu.panoTemizle(); else await navigator.clipboard.writeText(''); } catch {} }

async function kopyala(metin) {
  if (!(await panoYaz(metin))) { toast('Kopyalanamadı'); return; }
  const sn = (kasa?.ayarlar?.pano ?? 30);
  if (sn > 0) {
    toast(`Kopyalandı. Pano ${sn} sn sonra temizlenecek.`);
    clearTimeout(panoZaman); panoZaman = setTimeout(panoTemizle, sn * 1000);
  } else toast('Kopyalandı');
}

/* ───────── otomatik kilit ───────── */
function kilitKur() {
  clearTimeout(kilitZaman);
  const dk = kasa?.ayarlar?.kilit ?? 5;          // dakika; 0 = hemen değil, "hemen" ayrı
  if (kasa && dk > 0) kilitZaman = setTimeout(kilitle, dk * 60 * 1000);
}
['pointerdown', 'keydown'].forEach(e => document.addEventListener(e, () => { if (kasa) kilitKur(); }, { passive: true }));

function kilitle() {
  kasa = null; veriAnahtari = null; clearTimeout(kilitZaman); panoTemizle();
  ciz();
}

/* ───────── router ───────── */
async function ciz() {
  if (!depo) depo = await dGet('depo');
  if (!depo) return ekranKur();
  if (!kasa) return ekranKilit();
  return ekranAna();
}

/* ───────── 1) kurulum ───────── */
let kurGecici = null; // {depo, kurtarma}
function ekranKur() {
  kok.classList.remove("genis");
  kok.innerHTML = `<div class="merkez"><div class="kart">
    ${kadranHTML()}
    <h2>Kasanı kur</h2>
    <p class="alt">Tüm parolaların bu cihazda, şifreli saklanır. Suha'ya ya da internete hiçbir şey gitmez.</p>
    <label class="alan" for="p1">Ana parola</label>
    <input id="p1" type="password" autocomplete="new-password">
    <div class="guc s0"><i></i><i></i><i></i><i></i></div>
    <div class="guc-ad" id="gad">En az 10 karakter. Bunu unutma — kasanı açan tek anahtar bu.</div>
    <label class="alan" for="p2">Ana parolayı tekrar yaz</label>
    <input id="p2" type="password" autocomplete="new-password">
    <button class="btn ana tam" id="kurBtn" style="margin-top:18px" disabled>Kasayı oluştur</button>
  </div></div>`;
  const p1 = $('#p1'), p2 = $('#p2'), g = $('.guc'), gad = $('#gad'), btn = $('#kurBtn');
  function kontrol() {
    const r = K.parolaGucu(p1.value);
    g.className = 'guc s' + r.puan;
    const uyus = p1.value && p1.value === p2.value;
    if (!p1.value) gad.textContent = 'En az 10 karakter. Bunu unutma — kasanı açan tek anahtar bu.';
    else if (!r.yeterli) gad.textContent = 'Biraz daha uzat. En az "Orta" olmalı. · ' + r.ad;
    else if (p2.value && !uyus) gad.textContent = 'İki parola aynı değil.';
    else gad.textContent = r.ad;
    btn.disabled = !(r.yeterli && uyus);
  }
  p1.oninput = p2.oninput = kontrol;
  btn.onclick = async () => {
    btn.disabled = true; btn.textContent = 'Oluşturuluyor…';
    const baslangic = { v: 1, kayitlar: [], ayarlar: { pano: 30, kilit: 5 } };
    const r = await K.kur(p1.value, baslangic);
    kurGecici = { depo: r.depo, kurtarma: r.kurtarma, veriAnahtari: r.veriAnahtari, kasa: baslangic };
    ekranKurtarma();
  };
}

/* ───────── 2) kurtarma anahtarı ───────── */
function ekranKurtarma() {
  const { kurtarma } = kurGecici;
  const sonGrup = kurtarma.gosterim.split('-').pop();
  kok.innerHTML = `<div class="merkez"><div class="kart">
    <h2>Kurtarma anahtarın</h2>
    <p class="alt">Ana parolanı unutursan kasanı <b>sadece</b> bu anahtarla açabilirsin. Başka yolu yok.</p>
    <div class="kurtarma-kod" id="kk">${esc(kurtarma.gosterim)}</div>
    <div class="uyari">Bunu bir yere yaz ya da yazdır ve güvenli sakla. Bunu ve ana parolanı
      ikisini birden kaybedersen kasandaki hiçbir şey geri gelmez — Suha bile açamaz.</div>
    <button class="btn tam" id="yaz">Yazdır</button>
    <label class="alan" for="son">Kaydettiğinden emin olalım — son grubu yaz</label>
    <input id="son" type="text" autocomplete="off" placeholder="${esc(sonGrup.replace(/./g,'•'))}">
    <div class="guc-ad" id="dh"></div>
    <button class="btn ana tam" id="ac" style="margin-top:14px" disabled>Kasayı aç</button>
  </div></div>`;
  $('#yaz').onclick = () => window.print();
  const inp = $('#son'), ac = $('#ac'), dh = $('#dh');
  inp.oninput = () => {
    const d = inp.value.trim().toUpperCase() === sonGrup;
    ac.disabled = !d;
    dh.textContent = (inp.value && !d) ? 'Son grup eşleşmedi. Anahtarı kontrol et.' : '';
  };
  ac.onclick = async () => {
    await dSet('depo', kurGecici.depo);
    depo = kurGecici.depo;
    kasa = kurGecici.kasa;
    veriAnahtari = kurGecici.veriAnahtari;
    kurGecici = null;
    kilitKur();
    ekranAna();
  };
}

/* ───────── 3) kilit ekranı ───────── */
function ekranKilit() {
  kok.classList.remove("genis");
  kok.innerHTML = `<div class="merkez"><div class="kart">
    ${kadranHTML()}
    <h2>Kasa kilitli</h2>
    <p class="alt">Ana parolanı yaz.</p>
    <input id="kp" type="password" autocomplete="current-password" placeholder="Ana parola">
    <div class="guc-ad" id="kh"></div>
    <button class="btn ana tam" id="acBtn" style="margin-top:14px">Aç</button>
    <button class="btn tam" id="kurtBtn" style="margin-top:10px">Kurtarma anahtarıyla aç</button>
  </div></div>`;
  const kp = $('#kp'), kh = $('#kh'), b = $('#acBtn');
  let bekle = 0;
  async function dene() {
    if (bekle) return;
    b.disabled = true; b.textContent = 'Açılıyor…';
    try {
      const r = await K.acParola(depo, kp.value);
      kasa = r.kasa; veriAnahtari = r.veriAnahtari; kilitKur();
      const kd = $('.kadran'); if (kd) { kd.classList.add('acildi'); await new Promise(f => setTimeout(f, 450)); }
      ekranAna(); return;
    } catch {
      b.disabled = false; b.textContent = 'Aç';
      bekle = Math.min((bekle || 0) + 1, 10);
      let kalan = bekle; kh.textContent = `Parola yanlış. ${kalan} sn bekle.`;
      const say = setInterval(() => { kalan--; if (kalan <= 0) { clearInterval(say); kh.textContent = ''; bekle = 0; } else kh.textContent = `Parola yanlış. ${kalan} sn bekle.`; }, 1000);
    }
  }
  b.onclick = dene;
  kp.onkeydown = e => { if (e.key === 'Enter') dene(); };
  $('#kurtBtn').onclick = ekranKurtarmaAc;
  setTimeout(() => kp.focus(), 50);
}
function ekranKurtarmaAc() {
  kok.innerHTML = `<div class="merkez"><div class="kart">
    <h2>Kurtarma anahtarıyla aç</h2>
    <p class="alt">32 harflik kurtarma anahtarını yaz. Açıldıktan sonra yeni bir ana parola kurarsın.</p>
    <textarea id="rk" autocomplete="off" placeholder="ABCD-EFGH-…"></textarea>
    <div class="guc-ad" id="rh"></div>
    <button class="btn ana tam" id="rb" style="margin-top:12px">Aç</button>
    <button class="btn tam" id="geri" style="margin-top:10px">Geri</button>
  </div></div>`;
  $('#geri').onclick = ekranKilit;
  $('#rb').onclick = async () => {
    try {
      const r = await K.acKurtarma(depo, $('#rk').value);
      kasa = r.kasa; veriAnahtari = r.veriAnahtari;
      yeniParolaEkrani();
    } catch { $('#rh').textContent = 'Kurtarma anahtarı yanlış.'; }
  };
}
function yeniParolaEkrani() {
  kok.innerHTML = `<div class="merkez"><div class="kart">
    <h2>Yeni ana parola</h2>
    <p class="alt">Kasan açıldı. Şimdi yeni bir ana parola belirle.</p>
    <input id="n1" type="password" autocomplete="new-password" placeholder="Yeni ana parola">
    <div class="guc s0"><i></i><i></i><i></i><i></i></div>
    <input id="n2" type="password" autocomplete="new-password" placeholder="Tekrar" style="margin-top:10px">
    <button class="btn ana tam" id="kaydet" style="margin-top:14px" disabled>Kaydet ve devam et</button>
  </div></div>`;
  const n1 = $('#n1'), n2 = $('#n2'), g = $('.guc'), kb = $('#kaydet');
  const k = () => { const r = K.parolaGucu(n1.value); g.className = 'guc s' + r.puan; kb.disabled = !(r.yeterli && n1.value === n2.value); };
  n1.oninput = n2.oninput = k;
  kb.onclick = async () => {
    depo = await K.anaParolaDegistir(depo, veriAnahtari, n1.value);
    await dSet('depo', depo); kilitKur(); ekranAna();
  };
}

/* ───────── 4) ana ekran (kasa listesi) ───────── */
function panelBosHTML() {
  return `<div class="panelBos"><div><div class="bikon">${IC.bosKasa}</div>
    Soldan bir kayıt seç<br>ya da “Ekle” ile yeni oluştur.</div></div>`;
}
// içeriği geniş modda sağ panele, dar modda modala koyar; hedef konteyneri döner
function hedefAc(html) {
  if (GENIS()) { const panel = $('#panel'); if (panel) { panel.innerHTML = html; return panel; } }
  modalAc(html); return modalKat.querySelector('.modal');
}
function hedefKapat() {
  if (GENIS() && $('#panel')) { seciliId = null; $('#panel').innerHTML = panelBosHTML(); isaretleSecili(); }
  else modalKapat();
}
function isaretleSecili() {
  document.querySelectorAll('.satir.secili').forEach(s => s.classList.remove('secili'));
  if (GENIS() && seciliId != null) { const s = document.querySelector(`.satir[data-id="${seciliId}"]`); if (s) s.classList.add('secili'); }
}
const aramaVal = () => ($('#ara')?.value || '');

function ekranAna() {
  const genis = GENIS();
  kok.classList.toggle('genis', genis);
  const sayi = (t) => kasa.kayitlar.filter(x => t === 'hepsi' || x.tur === t).length;
  const solIc = `
    <div class="aracbar">
      <input id="ara" type="search" placeholder="Ara…">
      <button class="btn ana" id="ekleBtn">${IC.arti}<span>Ekle</span></button>
    </div>
    <div class="cipler" id="cipler"></div>
    <div class="liste" id="liste"></div>`;
  kok.innerHTML = `
  <div class="ust">
    <img class="logo" src="simge/kasa-192.png" alt="">
    <h1>Kasa</h1><div class="bosluk"></div>
    <button class="ikonbtn" id="uretBtn" title="Parola üret">${IC.uret}</button>
    <button class="ikonbtn" id="ayarBtn" title="Ayarlar">${IC.ayar}</button>
    <button class="ikonbtn" id="kilitBtn" title="Kilitle">${IC.kilit}</button>
  </div>
  ${genis
      ? `<div class="duzen"><div class="solpane">${solIc}</div>
           <div class="sagpane"><div class="panelic" id="panel">${panelBosHTML()}</div></div></div>`
      : solIc}`;

  const cipler = [['hepsi', 'Hepsi'], ['giris', 'Giriş'], ['kart', 'Kart'], ['not', 'Not'], ['wifi', 'Wi-Fi'], ['kimlik', 'Kimlik']];
  $('#cipler').innerHTML = cipler.map(([k, ad]) => `<button class="cip ${k === aktifFiltre ? 'aktif' : ''}" data-f="${k}">${ad} ${sayi(k) ? `<b style="opacity:.6">${sayi(k)}</b>` : ''}</button>`).join('');
  $('#cipler').onclick = e => { const b = e.target.closest('.cip'); if (b) { aktifFiltre = b.dataset.f; ekranAna(); } };

  $('#ara').oninput = () => listeCiz(aramaVal());
  $('#ekleBtn').onclick = () => detayModal(null);
  $('#uretBtn').onclick = uretModal;
  $('#ayarBtn').onclick = ekranAyarlar;
  $('#kilitBtn').onclick = kilitle;
  listeCiz('');

  if (genis && seciliId != null) {
    const x = kasa.kayitlar.find(k => k.id == seciliId);
    if (x) goruntuModal(x); else seciliId = null;
  }
}

function listeCiz(q) {
  q = (q || '').toLowerCase();
  const l = kasa.kayitlar
    .filter(x => aktifFiltre === 'hepsi' || x.tur === aktifFiltre)
    .filter(x => !q || (x.baslik + ' ' + (x.kadi || '') + ' ' + (x.site || '')).toLowerCase().includes(q))
    .sort((a, b) => (b.yildiz - a.yildiz) || a.baslik.localeCompare(b.baslik, 'tr'));
  const el = $('#liste');
  if (!l.length) {
    el.innerHTML = kasa.kayitlar.length
      ? `<div class="bos-durum">Eşleşen kayıt yok.</div>`
      : `<div class="bos-durum"><div class="bikon">${IC.bosKasa}</div>Kasan boş.<br>Sağ üstten “Ekle” ile ilk kaydını oluştur.</div>`;
    return;
  }
  el.innerHTML = l.map(x => `<div class="satir" data-id="${x.id}">
    ${avatarHTML(x)}
    <div><div class="ad">${esc(x.baslik)} ${x.yildiz ? `<span class="yildiz">${IC.yildiz}</span>` : ''}</div>
      <div class="alt">${esc(altMetin(x))}</div></div>
    <div class="bosluk"></div>
    ${x.parola ? `<button class="ikonbtn kopyala sm" data-kop="${x.id}" title="Parolayı kopyala">${IC.kopya}</button>` : ''}
  </div>`).join('');
  el.onclick = e => {
    const kop = e.target.closest('[data-kop]');
    if (kop) { e.stopPropagation(); const r = kasa.kayitlar.find(k => k.id == kop.dataset.kop); kopyala(r.parola); return; }
    const s = e.target.closest('.satir'); if (s) goruntuModal(kasa.kayitlar.find(k => k.id == s.dataset.id));
  };
  isaretleSecili();
}
function altMetin(x) {
  if (x.tur === 'giris' && x.yontem && x.yontem !== 'parola')
    return YONTEMLER[x.yontem] + (x.bagli ? ' · ' + x.bagli : (x.kadi ? ' · ' + x.kadi : ''));
  return x.kadi || x.site || TURAD[x.tur] || '';
}

/* ───────── kayıt görüntüle (önce oku, sonra düzenle) ───────── */
function vrHTML(ad, v, gizli) {
  return `<div class="vr"><span class="vlabel">${ad}</span>
    <span class="vdeger ${gizli ? 'mono' : ''}" data-ham="${esc(v)}" data-acik="0">${gizli ? '••••••••••' : esc(v)}</span>
    <span class="vact">
      ${gizli ? `<button class="ikonbtn sm" data-goz title="Göster/gizle">${IC.goz}</button>` : ''}
      <button class="ikonbtn sm kopyala" data-kopdeg="${esc(v)}" title="Kopyala">${IC.kopya}</button>
    </span></div>`;
}
function goruntuModal(kayit) {
  const x = kayit;
  seciliId = x.id;
  const sosyal = x.tur === 'giris' && x.yontem && x.yontem !== 'parola';
  const alanlar = (ALANLAR[x.tur] || []).filter(([k]) => k !== 'yontem');
  const rows = alanlar.map(([k, ad, tip]) => {
    if (k === 'totp') return '';                 // canlı kod kutusu aşağıda
    if (k === 'bagli' && !sosyal) return '';
    if (!x[k]) return '';
    const et = (k === 'parola' && sosyal) ? 'Parola' : ad.split(' / ')[0].replace(/ \(.*/, '');
    return vrHTML(et, x[k], tip === 'gizli');
  }).filter(Boolean);
  const govde = `
    <div class="baslikKutu">
      ${avatarHTML(x)}
      <div class="bilgi"><div class="ad">${esc(x.baslik || TURAD[x.tur])}</div>
        <div class="turpill">${TURAD[x.tur]}${sosyal ? ' · ' + YONTEMLER[x.yontem] : ''}</div></div>
      <button class="ikonbtn yildizBtn ${x.yildiz ? 'on' : ''}" id="yild" title="Yıldızla">${IC.yildiz}</button>
    </div>
    ${rows.join('') || '<p class="alt" style="text-align:left;margin:6px 0">Bu kayıtta görüntülenecek alan yok.</p>'}
    ${x.tur === 'giris' && x.totp ? `<div class="totp" id="totpKutu"></div>` : ''}
    ${(x.eskiler && x.eskiler.length) ? `<label class="alan">Eski parolalar (${x.eskiler.length})</label>
      <div class="liste">${x.eskiler.slice().reverse().map(e => `<div class="satir" style="cursor:default">
        <span class="vdeger mono" style="flex:1">${esc(e.parola)}</span>
        <span class="alt">${e.tarih ? new Date(e.tarih).toLocaleDateString('tr') : ''}</span>
        <button class="ikonbtn sm kopyala" data-kopdeg="${esc(e.parola)}">${IC.kopya}</button></div>`).join('')}</div>` : ''}
    <div style="display:flex;gap:10px;margin-top:18px">
      <button class="btn ana" id="duzenle" style="flex:1">${IC.duzenle}<span>Düzenle</span></button>
      <button class="btn" id="kapat">Kapat</button>
    </div>`;
  const c = hedefAc(govde);
  isaretleSecili();
  // satır içi göster/gizle
  c.querySelectorAll('[data-goz]').forEach(b => b.onclick = () => {
    const d = b.closest('.vr').querySelector('.vdeger'); const acik = d.dataset.acik === '1';
    d.dataset.acik = acik ? '0' : '1';
    d.textContent = acik ? '••••••••••' : d.dataset.ham;
    b.innerHTML = acik ? IC.goz : IC.gozKapali;
  });
  c.querySelectorAll('[data-kopdeg]').forEach(b => b.onclick = () => kopyala(b.dataset.kopdeg));
  if (x.tur === 'giris' && x.totp) totpGoster(x.totp);
  $('#yild', c).onclick = async () => { x.yildiz = x.yildiz ? 0 : 1; await sakla(); $('#yild', c).classList.toggle('on', !!x.yildiz); listeCiz(aramaVal()); };
  $('#duzenle', c).onclick = () => detayModal(x);
  $('#kapat', c).onclick = () => { hedefKapat(); if (!GENIS()) ekranAna(); };
}

/* ───────── kayıt düzenle / yeni ───────── */
const YONTEMLER = { parola: 'Parola', google: 'Google ile', apple: 'Apple ile', microsoft: 'Microsoft ile', facebook: 'Facebook ile', eposta: 'E-posta bağlantısı/kod', telefon: 'Telefon/SMS' };
const ALANLAR = {
  giris: [['yontem', 'Giriş yöntemi', 'secim'], ['kadi', 'Kullanıcı adı / e-posta'], ['parola', 'Parola', 'gizli'], ['bagli', 'Bağlı hesap (hangi Google/Apple…)'], ['site', 'Site'], ['totp', 'TOTP (anahtar ya da otpauth)']],
  kart: [['kadi', 'Kart üzerindeki ad'], ['no', 'Kart no'], ['sk', 'Son kullanma'], ['cvv', 'CVV', 'gizli'], ['pin', 'PIN', 'gizli']],
  not: [['metin', 'Not', 'cok']],
  wifi: [['kadi', 'Ağ adı (SSID)'], ['parola', 'Parola', 'gizli']],
  kimlik: [['kadi', 'Ad soyad'], ['no', 'Numara'], ['metin', 'Ek bilgi', 'cok']],
};

function detayModal(kayit) {
  const yeni = !kayit;
  let d = kayit ? { ...kayit } : { id: Date.now(), tur: 'giris', baslik: '', yildiz: 0 };
  function ciz() {
    const alanlar = ALANLAR[d.tur] || [];
    const c = hedefAc(`
      <h3>${yeni ? 'Yeni kayıt' : esc(d.baslik || TURAD[d.tur])}</h3>
      <label class="alan">Tür</label>
      <select id="tur">${Object.entries(TURAD).map(([k, v]) => `<option value="${k}" ${k === d.tur ? 'selected' : ''}>${v}</option>`).join('')}</select>
      <label class="alan">Başlık</label>
      <input id="baslik" type="text" value="${esc(d.baslik || '')}">
      ${alanlar.map(([k, ad, tip]) => {
        const v = esc(d[k] || '');
        const sosyal = d.yontem && d.yontem !== 'parola';
        if (k === 'bagli' && !sosyal) return '';                 // yalnız sosyal girişte
        if (tip === 'secim') return `<label class="alan">${ad}</label>
          <select data-k="${k}" id="yontem">${Object.entries(YONTEMLER).map(([kk, vv]) => `<option value="${kk}" ${(d.yontem || 'parola') === kk ? 'selected' : ''}>${vv}</option>`).join('')}</select>`;
        if (tip === 'cok') return `<label class="alan">${ad}</label><textarea data-k="${k}">${v}</textarea>`;
        const t = tip === 'gizli' ? 'password' : 'text';
        const etiket = (k === 'parola' && sosyal) ? 'Parola (varsa)' : ad;
        return `<label class="alan">${etiket}</label>
          <div class="satir-ic"><input data-k="${k}" type="${t}" value="${v}" autocomplete="off">
          ${k === 'parola' ? `<button class="ikonbtn sm" id="goz" title="Göster">${IC.goz}</button><button class="ikonbtn sm" id="uret" title="Üret">${IC.uret}</button>` : ''}</div>`;
      }).join('')}
      ${d.tur === 'giris' && d.totp ? `<div class="totp" id="totpKutu" style="margin-top:12px"></div>` : ''}
      ${(d.eskiler && d.eskiler.length) ? `<label class="alan">Eski parolalar (${d.eskiler.length})</label>
        <div class="liste">${d.eskiler.slice().reverse().map(e => `<div class="satir">
          <div class="alan-deger" style="flex:1;font-family:ui-monospace,monospace">${esc(e.parola)}</div>
          <div class="alt">${e.tarih ? new Date(e.tarih).toLocaleDateString('tr') : ''}</div>
          <button class="ikonbtn kopyala" data-eski="${esc(e.parola)}">${IC.kopya}</button></div>`).join('')}</div>` : ''}
      <label class="alan"><input type="checkbox" id="yildiz" ${d.yildiz ? 'checked' : ''}> Yıldızla</label>
      <div style="display:flex;gap:10px;margin-top:18px">
        <button class="btn ana" id="kaydet" style="flex:1">Kaydet</button>
        ${yeni ? '' : '<button class="btn tehlike" id="sil">Sil</button>'}
        <button class="btn" id="kapat">Kapat</button>
      </div>`);
    $('#tur', c).onchange = () => { oku(); d.tur = $('#tur', c).value; ciz(); };
    const yont = $('#yontem', c); if (yont) yont.onchange = () => { oku(); ciz(); };
    const goz = $('#goz', c); if (goz) goz.onclick = () => { const i = $('[data-k="parola"]', c); const g = i.type === 'password'; i.type = g ? 'text' : 'password'; goz.innerHTML = g ? IC.gozKapali : IC.goz; };
    const uret = $('#uret', c); if (uret) uret.onclick = () => { $('[data-k="parola"]', c).value = uretRastgele(16); };
    if (d.tur === 'giris' && d.totp) totpGoster(d.totp);
    c.querySelectorAll('[data-eski]').forEach(b => b.onclick = () => kopyala(b.dataset.eski));
    $('#kaydet', c).onclick = async () => {
      const eskiParola = kayit ? kayit.parola : '';
      oku();
      if (!d.baslik) d.baslik = TURAD[d.tur];
      d.yildiz = $('#yildiz', c).checked ? 1 : 0;
      // parola değiştiyse eskisini geçmişe al (en çok 10)
      if (eskiParola && d.parola && eskiParola !== d.parola) {
        d.eskiler = [...(d.eskiler || []), { parola: eskiParola, tarih: kayit.guncel || Date.now() }].slice(-10);
      }
      d.guncel = Date.now();
      const i = kasa.kayitlar.findIndex(x => x.id === d.id);
      if (i >= 0) kasa.kayitlar[i] = d; else kasa.kayitlar.push(d);
      await sakla(); seciliId = d.id;
      if (GENIS() && $('#panel')) { listeCiz(aramaVal()); goruntuModal(d); } else { modalKapat(); ekranAna(); }
    };
    const sil = $('#sil', c); if (sil) sil.onclick = async () => {
      if (!confirm('Bu kaydı silmek istediğine emin misin?')) return;
      kasa.kayitlar = kasa.kayitlar.filter(x => x.id !== d.id); seciliId = null;
      await sakla();
      if (GENIS() && $('#panel')) { listeCiz(aramaVal()); hedefKapat(); } else { modalKapat(); ekranAna(); }
    };
    $('#kapat', c).onclick = () => { if (GENIS() && $('#panel')) { if (yeni) hedefKapat(); else goruntuModal(d); } else modalKapat(); };
    function oku() {
      d.baslik = $('#baslik', c).value.trim();
      c.querySelectorAll('[data-k]').forEach(i => d[i.dataset.k] = i.value);
    }
  }
  ciz();
}

/* ───────── TOTP canlı ───────── */
let totpSay = null;
function totpGoster(anahtar) {
  const kutu = $('#totpKutu'); if (!kutu) return;
  async function tik() {
    try {
      const kod = await K.totp(anahtar.replace(/^otpauth:.*secret=/i, '').split('&')[0]);
      const kalan = 30 - Math.floor(Date.now() / 1000) % 30;
      kutu.innerHTML = `<span class="halka" style="--a:${(30 - kalan) / 30 * 100}%"></span>
        <div style="flex:1"><div class="etk">Tek kullanımlık kod</div>
          <span class="kod">${kod.replace(/(\d{3})(\d{3})/, '$1 $2')}</span></div>
        <span class="etk">${kalan}s</span>
        <button class="ikonbtn sm kopyala" id="totpKop" title="Kodu kopyala">${IC.kopya}</button>`;
      $('#totpKop').onclick = () => kopyala(kod);
    } catch { kutu.innerHTML = '<span style="color:var(--soluk);font-size:13px">TOTP anahtarı geçersiz</span>'; }
  }
  clearInterval(totpSay); tik(); totpSay = setInterval(tik, 1000);
}

/* ───────── parola üretici ───────── */
function uretRastgele(n = 16, { buyuk = true, rakam = true, simge = true } = {}) {
  let hav = 'abcdefghijkmnpqrstuvwxyz';
  if (buyuk) hav += 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  if (rakam) hav += '23456789';
  if (simge) hav += '!@#$%?*-_=+';
  const r = crypto.getRandomValues(new Uint32Array(n));
  return Array.from(r, x => hav[x % hav.length]).join('');
}
const KELIME = ['kedi', 'mavi', 'pencere', 'ruzgar', 'yesil', 'bisiklet', 'deniz', 'kitap', 'yildiz', 'kahve', 'orman', 'nehir', 'bulut', 'anahtar', 'gece', 'sabah'];
function uretAkilda() {
  const r = crypto.getRandomValues(new Uint32Array(4));
  const s = crypto.getRandomValues(new Uint32Array(1))[0] % 90 + 10;
  return Array.from(r, x => KELIME[x % KELIME.length]).join('-') + '-' + s;
}
function uretModal() {
  let mod = 'rastgele', uz = 16;
  function ciz() {
    const p = mod === 'rastgele' ? uretRastgele(uz) : uretAkilda();
    modalAc(`
      <h3>Parola üret</h3>
      <div class="cipler"><button class="cip ${mod === 'rastgele' ? 'aktif' : ''}" data-m="rastgele">Rastgele</button>
        <button class="cip ${mod === 'akilda' ? 'aktif' : ''}" data-m="akilda">Akılda kalır</button></div>
      <div class="kurtarma-kod" id="sonuc">${esc(p)}</div>
      ${mod === 'rastgele' ? `<label class="alan">Uzunluk: <b id="uzd">${uz}</b></label>
        <input id="uz" type="range" min="8" max="40" value="${uz}" style="width:100%">` : ''}
      <div style="display:flex;gap:10px;margin-top:14px">
        <button class="btn ana" id="kop" style="flex:1">Kopyala</button>
        <button class="btn" id="yeni">Yeni üret</button>
        <button class="btn" id="kapat">Kapat</button>
      </div>`);
    modalKat.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { mod = b.dataset.m; ciz(); });
    const u = $('#uz'); if (u) u.oninput = () => { uz = +u.value; $('#uzd').textContent = uz; $('#sonuc').textContent = uretRastgele(uz); };
    $('#yeni').onclick = ciz;
    $('#kop').onclick = () => kopyala($('#sonuc').textContent);
    $('#kapat').onclick = modalKapat;
  }
  ciz();
}

/* ───────── ayarlar ───────── */
function ekranAyarlar() {
  kok.classList.remove("genis");
  const a = kasa.ayarlar;
  const panoSec = [0, 15, 30, 60];
  const kilitSec = [1, 5, 15];
  kok.innerHTML = `
  <div class="ust"><button class="ikonbtn" id="geri" title="Geri">${IC.geri}</button><h1>Ayarlar</h1></div>
  <div class="kart" style="max-width:none">
    <label class="alan">Pano temizleme (kopyalanan parola)</label>
    <select id="pano">${panoSec.map(s => `<option value="${s}" ${((a.pano ?? 30) === s) ? 'selected' : ''}>${s === 0 ? 'Kapalı' : s + ' sn'}</option>`).join('')}</select>
    <div class="uyari" style="margin-top:8px"><b>Pano tam güvenli değil.</b> Kopyaladığın parolayı başka uygulamalar da okuyabilir; bazı sistemler panoyu önizler. Mümkünse az kullan.</div>

    <label class="alan">Otomatik kilit</label>
    <select id="kilit">${kilitSec.map(s => `<option value="${s}" ${((a.kilit ?? 5) === s) ? 'selected' : ''}>${s} dk</option>`).join('')}</select>

    <hr style="border-color:var(--kenar);margin:20px 0">
    <button class="btn tam" id="saglikBtn" style="margin-bottom:10px">Parola sağlığı${saglikRozet()}</button>
    <button class="btn tam" id="parolaBtn" style="margin-bottom:10px">Ana parolayı değiştir</button>
    <button class="btn tam" id="kurtBtn" style="margin-bottom:10px">Kurtarma anahtarını yenile</button>
    <hr style="border-color:var(--kenar);margin:20px 0">
    <button class="btn tam" id="yedekAl" style="margin-bottom:10px">Şifreli yedek al (.suhakasa)</button>
    <button class="btn tam" id="yedekYukle" style="margin-bottom:10px">Yedek yükle</button>
    <button class="btn tam" id="csvAl" style="margin-bottom:10px">Başka yöneticiden getir (CSV)</button>
    <button class="btn tam" id="csvVer" style="margin-bottom:10px">Şifresiz dışa aktar (CSV)</button>
    <hr style="border-color:var(--kenar);margin:20px 0">
    <button class="btn tam tehlike" id="silBtn">Kasayı sil</button>
    <input id="dosya" type="file" accept=".suhakasa,application/json" class="gizli">
    <input id="csvDosya" type="file" accept=".csv,text/csv" class="gizli">
    <p class="alt" style="text-align:center;margin-top:20px;font-size:12px">Bir Suha projesi · Sinan Erdoğan ve Claude</p>
  </div>`;
  $('#geri').onclick = ekranAna;
  $('#pano').onchange = async e => { kasa.ayarlar.pano = +e.target.value; await sakla(); };
  $('#kilit').onchange = async e => { kasa.ayarlar.kilit = +e.target.value; await sakla(); kilitKur(); };
  $('#saglikBtn').onclick = parolaSagligiEkrani;
  $('#parolaBtn').onclick = parolaDegistirModal;
  $('#kurtBtn').onclick = kurtarmaYenileModal;
  $('#yedekAl').onclick = yedekAl;
  $('#yedekYukle').onclick = () => $('#dosya').click();
  $('#dosya').onchange = yedekYukle;
  $('#csvAl').onclick = () => $('#csvDosya').click();
  $('#csvDosya').onchange = csvIceAktar;
  $('#csvVer').onclick = csvDisaAktarModal;
  $('#silBtn').onclick = kasaSilModal;
}

/* ───────── parola sağlığı ───────── */
const YIL = 365 * 24 * 3600 * 1000;
function parolaliKayitlar() { return kasa.kayitlar.filter(x => x.parola); }
function saglikAnaliz() {
  const kl = parolaliKayitlar();
  const sayac = {}; kl.forEach(x => sayac[x.parola] = (sayac[x.parola] || 0) + 1);
  const zayif = kl.filter(x => K.parolaGucu(x.parola).puan < 2);
  const tekrar = kl.filter(x => sayac[x.parola] > 1);
  const eski = kl.filter(x => x.guncel && (Date.now() - x.guncel) > YIL);
  return { zayif, tekrar, eski, toplam: zayif.length + tekrar.length + eski.length };
}
function saglikRozet() {
  if (!kasa?.kayitlar?.length) return '';
  const n = saglikAnaliz().toplam;
  return n ? ` <b style="color:var(--sari)">${n}</b>` : ' <b style="color:var(--yesil)">✓</b>';
}
function parolaSagligiEkrani() {
  kok.classList.remove("genis");
  const a = saglikAnaliz();
  const blok = (baslik, dizi, renk) => !dizi.length ? '' : `
    <label class="alan" style="color:${renk}">${baslik} (${dizi.length})</label>
    <div class="liste">${dizi.map(x => `<div class="satir" data-id="${x.id}">
      ${avatarHTML(x)}
      <div><div class="ad">${esc(x.baslik)}</div><div class="alt">${esc(x.kadi || x.site || '')}</div></div>
    </div>`).join('')}</div>`;
  kok.innerHTML = `
  <div class="ust"><button class="ikonbtn" id="geri" title="Geri">${IC.geri}</button><h1>Parola sağlığı</h1></div>
  <div class="kart" style="max-width:none">
    ${a.toplam ? '' : '<div class="bos-durum">Her şey yolunda. Zayıf, tekrar eden ya da eski parola yok.</div>'}
    ${blok('Zayıf — kolay tahmin edilebilir', a.zayif, 'var(--kirmizi)')}
    ${blok('Tekrar — aynı parola birden çok yerde', a.tekrar, 'var(--sari)')}
    ${blok('Eski — 1 yıldan uzun süredir değişmedi', a.eski, 'var(--soluk)')}
  </div>`;
  $('#geri').onclick = ekranAyarlar;
  kok.querySelectorAll('.satir').forEach(s => s.onclick = () => goruntuModal(kasa.kayitlar.find(k => k.id == s.dataset.id)));
}

/* ───────── CSV ───────── */
function csvCoz(metin) {
  const satir = []; let alan = [], cur = '', tirnak = false;
  for (let i = 0; i < metin.length; i++) {
    const c = metin[i];
    if (tirnak) {
      if (c === '"') { if (metin[i + 1] === '"') { cur += '"'; i++; } else tirnak = false; }
      else cur += c;
    } else if (c === '"') tirnak = true;
    else if (c === ',') { alan.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && metin[i + 1] === '\n') i++; alan.push(cur); satir.push(alan); alan = []; cur = ''; }
    else cur += c;
  }
  if (cur || alan.length) { alan.push(cur); satir.push(alan); }
  return satir.filter(r => r.some(x => x.trim() !== ''));
}
function csvDosyaIsle(metin) {
  const rows = csvCoz(metin); if (rows.length < 2) return [];
  const bas = rows[0].map(h => h.trim().toLowerCase());
  const bul = (...adlar) => { for (const a of adlar) { const i = bas.indexOf(a); if (i >= 0) return i; } return -1; };
  const iBaslik = bul('name', 'title', 'account', 'item name');
  const iKadi = bul('username', 'login_username', 'user', 'email', 'login');
  const iParola = bul('password', 'login_password', 'pass');
  const iSite = bul('url', 'login_uri', 'website', 'uri', 'web site');
  const iTotp = bul('totp', 'login_totp', 'otpauth', 'two-factor');
  const iNot = bul('notes', 'note', 'comment');
  const out = [];
  for (let r = 1; r < rows.length; r++) {
    const s = rows[r];
    const g = (i) => i >= 0 ? (s[i] || '').trim() : '';
    const parola = g(iParola), baslik = g(iBaslik) || g(iSite) || g(iKadi) || 'Kayıt';
    const not = g(iNot);
    if (!parola && !g(iKadi) && !not) continue;
    if (!parola && not && !g(iKadi)) { out.push({ id: Date.now() + r, tur: 'not', baslik, metin: not, guncel: Date.now() }); continue; }
    out.push({ id: Date.now() + r, tur: 'giris', baslik, kadi: g(iKadi), parola, site: g(iSite), totp: g(iTotp), yildiz: 0, guncel: Date.now() });
  }
  return out;
}
async function csvIceAktar(e) {
  const f = e.target.files[0]; if (!f) return; e.target.value = '';
  try {
    const yeni = csvDosyaIsle(await f.text());
    if (!yeni.length) { toast('CSV\'de uygun kayıt bulunamadı'); return; }
    kasa.kayitlar.push(...yeni); await sakla();
    toast(`${yeni.length} kayıt içe aktarıldı`); ekranAyarlar();
    modalAc(`<h3>İçe aktarıldı</h3><p class="alt">${yeni.length} kayıt eklendi.</p>
      <div class="uyari">İçe aktardığın CSV dosyasını sil — içindeki parolalar <b>şifresizdir</b>.</div>
      <button class="btn ana tam" id="kapat">Tamam</button>`);
    $('#kapat').onclick = modalKapat;
  } catch { toast('CSV okunamadı'); }
}
function csvAlan(v) { v = String(v ?? ''); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
function csvDisaAktarModal() {
  modalAc(`<h3>Şifresiz dışa aktar</h3>
    <div class="uyari tehlike">Bu dosya <b>şifresizdir</b>; parolaların düz metin olur. Sadece başka bir yere taşımak için kullan ve hemen sil.</div>
    <label class="alan">Devam etmek için ana parolanı yaz</label>
    <input id="dp" type="password" autocomplete="off">
    <div style="display:flex;gap:10px;margin-top:16px"><button class="btn tehlike" id="ok" style="flex:1">Dışa aktar</button><button class="btn" id="kapat">İptal</button></div>`);
  $('#ok').onclick = async () => {
    try { await K.acParola(depo, $('#dp').value); } catch { toast('Parola yanlış'); return; }
    const bas = ['name', 'url', 'username', 'password', 'totp', 'notes'];
    const satir = [bas.join(',')];
    kasa.kayitlar.forEach(x => satir.push([x.baslik, x.site, x.kadi, x.parola, x.totp, x.metin].map(csvAlan).join(',')));
    indir(new Blob([satir.join('\n')], { type: 'text/csv' }), `suha-kasa-${new Date().toISOString().slice(0, 10)}.csv`);
    modalKapat(); toast('Şifresiz CSV indirildi — dosyayı sil');
  };
  $('#kapat').onclick = modalKapat;
}

function parolaDegistirModal() {
  modalAc(`<h3>Ana parolayı değiştir</h3>
    <input id="y1" type="password" placeholder="Yeni ana parola" autocomplete="new-password">
    <div class="guc s0" style="margin-top:8px"><i></i><i></i><i></i><i></i></div>
    <input id="y2" type="password" placeholder="Tekrar" autocomplete="new-password" style="margin-top:10px">
    <div style="display:flex;gap:10px;margin-top:16px"><button class="btn ana" id="ok" style="flex:1" disabled>Değiştir</button><button class="btn" id="kapat">İptal</button></div>`);
  const y1 = $('#y1'), y2 = $('#y2'), ok = $('#ok'), g = $('.guc', modalKat);
  const k = () => { const r = K.parolaGucu(y1.value); g.className = 'guc s' + r.puan; ok.disabled = !(r.yeterli && y1.value === y2.value); };
  y1.oninput = y2.oninput = k;
  ok.onclick = async () => { depo = await K.anaParolaDegistir(depo, veriAnahtari, y1.value); await dSet('depo', depo); modalKapat(); toast('Ana parola değişti'); };
  $('#kapat').onclick = modalKapat;
}
async function kurtarmaYenileModal() {
  const { depo: yeni, kurtarma } = await K.kurtarmaYenile(depo, veriAnahtari);
  depo = yeni; await dSet('depo', depo);
  modalAc(`<h3>Yeni kurtarma anahtarı</h3>
    <p class="alt">Eski anahtar artık geçersiz. Bunu yaz/yazdır ve sakla.</p>
    <div class="kurtarma-kod">${esc(kurtarma.gosterim)}</div>
    <div style="display:flex;gap:10px;margin-top:16px"><button class="btn" id="yaz">Yazdır</button><button class="btn ana" id="kapat" style="flex:1">Kaydettim</button></div>`);
  $('#yaz').onclick = () => window.print(); $('#kapat').onclick = modalKapat;
}
async function yedekAl() {
  const blob = new Blob([JSON.stringify(depo)], { type: 'application/octet-stream' });
  indir(blob, `suha-kasa-${new Date().toISOString().slice(0, 10)}.suhakasa`);
  toast('Şifreli yedek indirildi');
}
async function yedekYukle(e) {
  const f = e.target.files[0]; if (!f) return;
  try {
    const d = JSON.parse(await f.text());
    if (!d.kutu || !d.sariliMP) throw 0;
    // Birleştirme için yedeği açmak gerekir → ana parola sor
    const p = prompt('Yedeğin ana parolasını yaz:');
    if (p == null) return;
    const r = await K.acParola(d, p);
    const mevcut = new Set(kasa.kayitlar.map(x => x.id));
    let ekle = 0;
    r.kasa.kayitlar.forEach(x => { if (!mevcut.has(x.id)) { kasa.kayitlar.push(x); ekle++; } });
    await sakla(); toast(`${ekle} kayıt eklendi`); ekranAyarlarGuvenli();
  } catch { toast('Yedek açılamadı (dosya ya da parola yanlış)'); }
}
function ekranAyarlarGuvenli() { if (kasa) ekranAyarlar(); }
function kasaSilModal() {
  modalAc(`<h3>Kasayı sil</h3>
    <div class="uyari tehlike">Bu, cihazındaki tüm kasa verisini kalıcı olarak siler. Geri alınamaz. Yedeğin yoksa her şey gider.</div>
    <label class="alan">Silmek için ana parolanı yaz</label>
    <input id="sp" type="password" autocomplete="off">
    <div style="display:flex;gap:10px;margin-top:16px"><button class="btn tehlike" id="ok" style="flex:1">Kalıcı olarak sil</button><button class="btn" id="kapat">İptal</button></div>`);
  $('#ok').onclick = async () => {
    try { await K.acParola(depo, $('#sp').value); } catch { toast('Parola yanlış'); return; }
    await dDel('depo'); depo = kasa = veriAnahtari = null; modalKapat(); ciz();
  };
  $('#kapat').onclick = modalKapat;
}

/* ───────── ortak: sakla, modal, indir ───────── */
async function sakla() { depo = await K.kaydet(depo, veriAnahtari, kasa); await dSet('depo', depo); }
function modalAc(html) { modalKat.innerHTML = `<div class="ortu"><div class="modal">${html}</div></div>`; modalKat.querySelector('.ortu').onclick = e => { if (e.target.classList.contains('ortu')) modalKapat(); }; }
function modalKapat() { clearInterval(totpSay); modalKat.innerHTML = ''; }
function indir(blob, ad) { const u = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = u; a.download = ad; a.click(); setTimeout(() => URL.revokeObjectURL(u), 1000); }

/* ───────── başlat ───────── */
ciz();
