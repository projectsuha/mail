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

/* ───────── yardımcılar ───────── */
const $ = (s, k = document) => k.querySelector(s);
const kok = $('#kok');
const modalKat = $('#modal-kat');
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const IC = {
  giris: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M12 15v3"/></svg>',
  kart: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/></svg>',
  not: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h9l3 3v15H6z"/><path d="M15 3v3h3"/></svg>',
  wifi: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12.5a10 10 0 0 1 14 0M8 15.5a6 6 0 0 1 8 0"/><circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none"/></svg>',
  kimlik: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="11" r="2"/><path d="M13 10h5M13 13h4M5 16a3 3 0 0 1 7 0"/></svg>',
  kopya: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>',
  ayar: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>',
  kilit: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  arti: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
};
const TURAD = { giris: 'Giriş', kart: 'Kart', not: 'Gizli not', wifi: 'Wi-Fi', kimlik: 'Kimlik' };

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
  kok.innerHTML = `<div class="merkez"><div class="kart">
    <img class="kasasimge" src="simge/kasa-512.png" alt="">
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
  kok.innerHTML = `<div class="merkez"><div class="kart">
    <img class="kasasimge" src="simge/kasa-512.png" alt="">
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
      kasa = r.kasa; veriAnahtari = r.veriAnahtari; kilitKur(); ekranAna();
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
function ekranAna() {
  const sayi = (t) => kasa.kayitlar.filter(x => t === 'hepsi' || x.tur === t).length;
  kok.innerHTML = `
  <div class="ust">
    <img class="logo" src="simge/kasa-192.png" alt="">
    <h1>Kasa</h1><div class="bosluk"></div>
    <button class="ikonbtn" id="uretBtn" title="Parola üret">🎲</button>
    <button class="ikonbtn" id="ayarBtn" title="Ayarlar">${IC.ayar}</button>
    <button class="ikonbtn" id="kilitBtn" title="Kilitle">${IC.kilit}</button>
  </div>
  <div class="aracbar">
    <input id="ara" type="search" placeholder="Ara…">
    <button class="btn ana" id="ekleBtn">${IC.arti}<span>Ekle</span></button>
  </div>
  <div class="cipler" id="cipler"></div>
  <div class="liste" id="liste"></div>`;

  const cipler = [['hepsi', 'Hepsi'], ['giris', 'Giriş'], ['kart', 'Kart'], ['not', 'Not'], ['wifi', 'Wi-Fi'], ['kimlik', 'Kimlik']];
  $('#cipler').innerHTML = cipler.map(([k, ad]) => `<button class="cip ${k === aktifFiltre ? 'aktif' : ''}" data-f="${k}">${ad} ${sayi(k) ? `<b style="opacity:.6">${sayi(k)}</b>` : ''}</button>`).join('');
  $('#cipler').onclick = e => { const b = e.target.closest('.cip'); if (b) { aktifFiltre = b.dataset.f; ekranAna(); } };

  $('#ara').oninput = () => listeCiz($('#ara').value);
  $('#ekleBtn').onclick = () => detayModal(null);
  $('#uretBtn').onclick = uretModal;
  $('#ayarBtn').onclick = ekranAyarlar;
  $('#kilitBtn').onclick = kilitle;
  listeCiz('');
}

function listeCiz(q) {
  q = (q || '').toLowerCase();
  const l = kasa.kayitlar
    .filter(x => aktifFiltre === 'hepsi' || x.tur === aktifFiltre)
    .filter(x => !q || (x.baslik + ' ' + (x.kadi || '') + ' ' + (x.site || '')).toLowerCase().includes(q))
    .sort((a, b) => (b.yildiz - a.yildiz) || a.baslik.localeCompare(b.baslik, 'tr'));
  const el = $('#liste');
  if (!l.length) { el.innerHTML = `<div class="bos-durum">${kasa.kayitlar.length ? 'Eşleşen kayıt yok.' : 'Kasan boş. Sağ üstten “Ekle” ile başla.'}</div>`; return; }
  const altMetin = (x) => {
    if (x.tur === 'giris' && x.yontem && x.yontem !== 'parola')
      return YONTEMLER[x.yontem] + (x.bagli ? ' · ' + x.bagli : (x.kadi ? ' · ' + x.kadi : ''));
    return x.kadi || x.site || TURAD[x.tur] || '';
  };
  el.innerHTML = l.map(x => `<div class="satir" data-id="${x.id}">
    <span class="rozet">${IC[x.tur] || IC.not}</span>
    <div><div class="ad">${esc(x.baslik)} ${x.yildiz ? '<span class="yildiz">★</span>' : ''}</div>
      <div class="alt">${esc(altMetin(x))}</div></div>
    <div class="bosluk"></div>
    ${x.parola ? `<button class="ikonbtn kopyala" data-kop="${x.id}" title="Parolayı kopyala">${IC.kopya}</button>` : ''}
  </div>`).join('');
  el.onclick = e => {
    const kop = e.target.closest('[data-kop]');
    if (kop) { e.stopPropagation(); const r = kasa.kayitlar.find(k => k.id == kop.dataset.kop); kopyala(r.parola); return; }
    const s = e.target.closest('.satir'); if (s) detayModal(kasa.kayitlar.find(k => k.id == s.dataset.id));
  };
}

/* ───────── kayıt detay / düzenle ───────── */
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
    modalAc(`
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
          ${k === 'parola' ? `<button class="ikonbtn" id="goz" title="Göster">👁</button><button class="ikonbtn" id="uret" title="Üret">🎲</button>` : ''}</div>`;
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
    $('#tur').onchange = () => { oku(); d.tur = $('#tur').value; ciz(); };
    const yont = $('#yontem'); if (yont) yont.onchange = () => { oku(); ciz(); };
    const goz = $('#goz'); if (goz) goz.onclick = () => { const i = $('[data-k="parola"]'); i.type = i.type === 'password' ? 'text' : 'password'; };
    const uret = $('#uret'); if (uret) uret.onclick = () => { $('[data-k="parola"]').value = uretRastgele(16); };
    if (d.tur === 'giris' && d.totp) totpGoster(d.totp);
    modalKat.querySelectorAll('[data-eski]').forEach(b => b.onclick = () => kopyala(b.dataset.eski));
    $('#kaydet').onclick = async () => {
      const eskiParola = kayit ? kayit.parola : '';
      oku();
      if (!d.baslik) d.baslik = TURAD[d.tur];
      d.yildiz = $('#yildiz').checked ? 1 : 0;
      // parola değiştiyse eskisini geçmişe al (en çok 10)
      if (eskiParola && d.parola && eskiParola !== d.parola) {
        d.eskiler = [...(d.eskiler || []), { parola: eskiParola, tarih: kayit.guncel || Date.now() }].slice(-10);
      }
      d.guncel = Date.now();
      const i = kasa.kayitlar.findIndex(x => x.id === d.id);
      if (i >= 0) kasa.kayitlar[i] = d; else kasa.kayitlar.push(d);
      await sakla(); modalKapat(); ekranAna();
    };
    const sil = $('#sil'); if (sil) sil.onclick = async () => {
      if (!confirm('Bu kaydı silmek istediğine emin misin?')) return;
      kasa.kayitlar = kasa.kayitlar.filter(x => x.id !== d.id);
      await sakla(); modalKapat(); ekranAna();
    };
    $('#kapat').onclick = modalKapat;
    function oku() {
      d.baslik = $('#baslik').value.trim();
      modalKat.querySelectorAll('[data-k]').forEach(i => d[i.dataset.k] = i.value);
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
        <span class="kod">${kod.replace(/(\d{3})(\d{3})/, '$1 $2')}</span>
        <span style="color:var(--soluk);font-size:13px">${kalan}s</span>
        <button class="ikonbtn kopyala" id="totpKop">${IC.kopya}</button>`;
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
  const a = kasa.ayarlar;
  const panoSec = [0, 15, 30, 60];
  const kilitSec = [1, 5, 15];
  kok.innerHTML = `
  <div class="ust"><button class="ikonbtn" id="geri">‹</button><h1>Ayarlar</h1></div>
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
  const a = saglikAnaliz();
  const blok = (baslik, dizi, renk) => !dizi.length ? '' : `
    <label class="alan" style="color:${renk}">${baslik} (${dizi.length})</label>
    <div class="liste">${dizi.map(x => `<div class="satir" data-id="${x.id}">
      <span class="rozet">${IC[x.tur] || IC.not}</span>
      <div><div class="ad">${esc(x.baslik)}</div><div class="alt">${esc(x.kadi || x.site || '')}</div></div>
    </div>`).join('')}</div>`;
  kok.innerHTML = `
  <div class="ust"><button class="ikonbtn" id="geri">‹</button><h1>Parola sağlığı</h1></div>
  <div class="kart" style="max-width:none">
    ${a.toplam ? '' : '<div class="bos-durum">Her şey yolunda. Zayıf, tekrar eden ya da eski parola yok.</div>'}
    ${blok('Zayıf — kolay tahmin edilebilir', a.zayif, 'var(--kirmizi)')}
    ${blok('Tekrar — aynı parola birden çok yerde', a.tekrar, 'var(--sari)')}
    ${blok('Eski — 1 yıldan uzun süredir değişmedi', a.eski, 'var(--soluk)')}
  </div>`;
  $('#geri').onclick = ekranAyarlar;
  kok.querySelectorAll('.satir').forEach(s => s.onclick = () => detayModal(kasa.kayitlar.find(k => k.id == s.dataset.id)));
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
