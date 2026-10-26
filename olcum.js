/* ───────────── Ölçüm ─────────────
   Su terazisi, açıölçer (eğim), ekran cetveli, ses seviyesi (desibel). Giriş gerekmez; hiçbir şey dışarı gönderilmez.
   Eğim telefonun hareket algılayıcısından, ses mikrofondan okunur; ses kaydedilmez, sadece anlık seviye hesaplanır. */
'use strict';

window.APP_NAME = 'Ölçüm';
window.APP_ICON = 'olcum-apple.png?v=8';
window.APP_LEAD = 'Su terazisi, açıölçer, cetvel ve ses ölçer. Ücretsiz, reklamsız.';

const OSVG = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
Object.assign(IC, {
  olcum: OSVG('<path d="M3.5 16.5 16.5 3.5l4 4-13 13z"/><path d="M7 13l1.5 1.5M9.5 10.5 12 13M12 8l1.5 1.5M14.5 5.5 17 8"/>'),
  terazi: OSVG('<rect x="2.5" y="8" width="19" height="8" rx="4"/><circle cx="12" cy="12" r="2"/><path d="M8.5 9v6M15.5 9v6"/>'),
  aci: OSVG('<path d="M4 20h16M4 20 16 6"/><path d="M10 20a6 6 0 0 0-1.8-4.3"/>'),
  cetvel: OSVG('<rect x="7" y="2.5" width="10" height="19" rx="1.5"/><path d="M7 6.5h3M7 10h4.5M7 13.5h3M7 17h4.5"/>'),
  ses: OSVG('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>'),
  oynat: OSVG('<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>'),
  durdur: OSVG('<path d="M8 5.5v13M16 5.5v13" stroke-width="3"/>'),
  tut: OSVG('<rect x="5.5" y="10.5" width="13" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>')
});

const OZ = {
  sekme: store.get('olcumSekme', 'terazi'),
  ayar: Object.assign({ titresim: true, sesDuzelt: 0, birim: 'cm' }, store.get('olcumAyar', {})),
  egim: { b: 0, g: 0, var: false },
  sifir: store.get('olcumSifir', { b: 0, g: 0, k: 0, aci: 0 }),
  tutulan: null   // açıölçerde dondurulan değer
};
const kaydet = () => store.set('olcumAyar', OZ.ayar);
const R = Math.PI / 180;
const sayi = (n, b = 0) => Number(n).toLocaleString('tr-TR', { minimumFractionDigits: b, maximumFractionDigits: b });
const titret = d => { if (OZ.ayar.titresim) try { navigator.vibrate?.(d); } catch {} };
const acilis = Date.now();
const yerel = () => window.SUHA_YEREL || {};

/* ═════════ Eğim algılayıcısı ═════════ */
// Yumuşatma: titremesin ama gecikmesin
window.addEventListener('deviceorientation', e => {
  if (e.beta == null || e.gamma == null) return;
  const k = OZ.egim.var ? 0.25 : 1;
  OZ.egim = { b: OZ.egim.b * (1 - k) + e.beta * k, g: OZ.egim.g * (1 - k) + e.gamma * k, var: true };
}, true);
const iosIzinGerek = () => typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function' && !store.get('olcumIosIzin', false);
async function iosIzin() {
  try { if (await DeviceOrientationEvent.requestPermission() === 'granted') store.set('olcumIosIzin', true); else toast('Hareket izni verilmedi'); } catch { toast('İzin istenemedi'); }
  ciz();
}
// Yerçekiminden açılar (telefonun kendi eksenlerine göre)
function acilar() {
  const b = OZ.egim.b * R, g = OZ.egim.g * R;
  return {
    yuzey: Math.acos(Math.max(-1, Math.min(1, Math.cos(b) * Math.cos(g)))) / R,          // ekranın yataydan eğimi (telefon yatarken)
    ekran: Math.atan2(Math.cos(b) * Math.sin(g), Math.sin(b)) / R,                      // dik tutarken ekran düzlemindeki dönüş (0 = dik)
    dik: Math.abs(OZ.egim.b) > 55 || Math.abs(Math.cos(b) * Math.sin(g)) > Math.sin(55 * R)
  };
}
function algilayiciNotu() {
  if (iosIzinGerek()) return `<div class="ol-not">${IC.terazi}<span>Ölçüm için telefonun hareket bilgisine izin ver.</span><button class="btn primary sm" data-action="o-ios-izin">Başlat</button></div>`;
  if (!OZ.egim.var && Date.now() - acilis > 2500) return `<div class="ol-not">${IC.alert}<span>Bu cihazda eğim algılayıcısı bulunamadı (bilgisayarlarda olmaz). Terazi ve açıölçer telefonda çalışır; cetvel ve ses ölçer burada da kullanılabilir.</span></div>`;
  return '';
}

/* ═════════ Kabuk ═════════ */
function kabuk() {
  const S = [['terazi', 'Terazi', 'terazi'], ['aci', 'Açı', 'aci'], ['cetvel', 'Cetvel', 'cetvel'], ['ses', 'Ses', 'ses']];
  $('#app').innerHTML = `
  <div class="ol-kabuk">
    <header class="ol-bas">
      <div class="brand-mark sm">${IC.olcum}</div><h1>Ölçüm</h1>
      <nav class="seg ol-ust-sekme">${S.map(([k, n]) => `<button data-action="o-sekme" data-k="${k}">${n}</button>`).join('')}</nav>
      <div class="spacer"></div>
      <button class="icon-btn" data-action="o-ayar" title="Ayarlar">${IC.gear}</button>
    </header>
    <div class="ol-serit" aria-hidden="true"></div>
    <main class="ol-govde" id="oGovde"></main>
    <nav class="ol-alt-sekme">${S.map(([k, n, ic]) => `<button data-action="o-sekme" data-k="${k}">${IC[ic]}<span>${n}</span></button>`).join('')}</nav>
  </div>`;
}
function ciz() {
  if (OZ.sekme !== 'ses') sesDurdur();
  document.querySelectorAll('[data-action="o-sekme"]').forEach(b => b.classList.toggle('on', b.dataset.k === OZ.sekme));
  document.body.dataset.osekme = OZ.sekme;
  ({ terazi: teraziCiz, aci: aciCiz, cetvel: cetvelCiz, ses: sesCiz }[OZ.sekme] || teraziCiz)();
}

/* ═════════ Su terazisi ═════════ */
let terazideydi = false;
function teraziCiz() {
  const s = OZ.sifir;
  $('#oGovde').innerHTML = `
  <div class="ol-orta">
    <div id="oNot">${algilayiciNotu()}</div>
    <div class="ol-terazi" id="oTerazi">
      <svg viewBox="0 0 300 300" aria-hidden="true"><circle cx="150" cy="150" r="140" class="dis"/><circle cx="150" cy="150" r="70" class="ic"/><circle cx="150" cy="150" r="20" class="hedef"/><path d="M150 10v280M10 150h280" class="arti"/>
      <circle cx="150" cy="150" r="18" id="oKabarcik" class="kabarcik"/></svg>
      <div class="ol-cubuk"><span></span><span></span><i id="oCubukK"></i></div>
    </div>
    <div class="ol-deger"><b id="oEgim">—</b><span id="oEgimAlt">Telefonu düz bir yüzeye koy ya da kenarı üstünde tut</span></div>
    <div class="ol-tuslar"><button class="btn" data-action="o-sifirla">Bu açıyı sıfır yap</button>${s.b || s.g || s.k ? '<button class="btn" data-action="o-sifir-kaldir">Sıfırı kaldır</button>' : ''}</div>
    <p class="muted sm ol-dipnot">Telefon kılıfı ve kamera çıkıntısı ölçümü bozabilir; en doğrusu için bilinen düz bir yüzeyde "Bu açıyı sıfır yap"a bas.</p>
  </div>`;
  teraziTazele();
}
function teraziTazele() {
  const el = $('#oEgim'); if (!el) return;
  if (!OZ.egim.var) { el.textContent = '—'; $('#oEgimAlt').textContent = Date.now() - acilis > 2500 ? 'Eğim algılayıcısı yok' : 'Algılayıcı bekleniyor'; return; }
  const a = acilar(), kutu = $('#oTerazi'); kutu.classList.toggle('kenar', a.dik);
  let duz;
  if (a.dik) {
    // Dik tutarken: telefonun alt kenarı yatayla ne kadar açı yapıyor (90° katlarına göre en yakın kenar)
    let aci = a.ekran - OZ.sifir.k; aci = ((aci + 45) % 90 + 90) % 90 - 45;
    $('#oCubukK').style.transform = `translateX(${Math.max(-110, Math.min(110, -aci * 15)).toFixed(1)}px)`;   // kabarcık yüksek tarafa
    el.textContent = sayi(Math.abs(aci), 1) + '°'; duz = Math.abs(aci) < 0.5;
    $('#oEgimAlt').textContent = duz ? 'Tam düz' : `${aci > 0 ? 'Sağ' : 'Sol'} taraf aşağıda`;
  } else {
    const b = OZ.egim.b - OZ.sifir.b, g = OZ.egim.g - OZ.sifir.g;
    const x = Math.max(-1, Math.min(1, g / 20)), y = Math.max(-1, Math.min(1, b / 20));
    const kab = $('#oKabarcik'); kab.setAttribute('cx', (150 - x * 120).toFixed(1)); kab.setAttribute('cy', (150 - y * 120).toFixed(1));
    const top = Math.hypot(b, g); el.textContent = sayi(top, 1) + '°'; duz = top < 0.5;
    $('#oEgimAlt').textContent = duz ? 'Tam düz' : `Öne-arkaya ${sayi(Math.abs(b), 1)}° · sağa-sola ${sayi(Math.abs(g), 1)}°`;
  }
  kutu.classList.toggle('tamam', duz);
  if (duz && !terazideydi) titret(30);
  terazideydi = duz;
}

/* ═════════ Açıölçer ═════════ */
function aciCiz() {
  $('#oGovde').innerHTML = `
  <div class="ol-orta">
    <div id="oNot">${algilayiciNotu()}</div>
    <div class="ol-aci" id="oAci">
      <svg viewBox="0 0 300 300" aria-hidden="true">
        <circle cx="150" cy="150" r="140" class="dis"/>
        ${Array.from({ length: 72 }, (_, i) => `<line x1="150" y1="${i % 9 === 0 ? 14 : i % 3 === 0 ? 20 : 24}" x2="150" y2="30" transform="rotate(${i * 5} 150 150)" class="${i % 9 === 0 ? 'uz' : ''}"/>`).join('')}
        ${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<text x="150" y="48" transform="rotate(${a} 150 150)">${Math.abs(90 - (a % 180))}°</text>`).join('')}
        <line x1="10" y1="150" x2="290" y2="150" class="yatay"/>
        <g id="oAciKol"><line x1="20" y1="150" x2="280" y2="150" class="kol"/><circle cx="150" cy="150" r="6" class="orta"/></g>
        <path id="oAciYay" class="yay" d=""/>
      </svg>
    </div>
    <div class="ol-deger"><b id="oAciD">—</b><span id="oAciAlt"></span></div>
    <div class="ol-uclu" id="oAciUc"></div>
    <div class="ol-tuslar">
      <button class="btn ${OZ.tutulan ? 'primary' : ''}" data-action="o-tut">${IC.tut}${OZ.tutulan ? 'Bırak' : 'Değeri tut'}</button>
      <button class="btn" data-action="o-aci-sifir">${OZ.sifir.aci ? 'Sıfırı kaldır' : 'Buradan ölç'}</button>
    </div>
    <p class="muted sm ol-dipnot">Telefonun uzun kenarını eğimli yüzeye (rampa, çatı, merdiven, tablo) dayayıp dik tut ya da telefonu yüzeyin üstüne yatır. "Buradan ölç" ile iki yüzey arasındaki açıyı bulursun.</p>
  </div>`;
  aciTazele();
}
function aciDegeri() {
  const a = acilar();
  // Ekran dikçe: telefonun uzun kenarının yatayla açısı (0–90). Telefon yatarken: üstünde durduğu yüzeyin eğimi.
  if (a.yuzey > 45) { const v = Math.abs(OZ.egim.b); return { aci: v > 90 ? 180 - v : v, tur: 'kenar' }; }
  return { aci: a.yuzey, tur: 'yuzey' };
}
function aciTazele() {
  const el = $('#oAciD'); if (!el) return;
  if (!OZ.egim.var && !OZ.tutulan) { el.textContent = '—'; $('#oAciAlt').textContent = Date.now() - acilis > 2500 ? 'Eğim algılayıcısı yok' : 'Algılayıcı bekleniyor'; $('#oAciUc').innerHTML = ''; return; }
  const d = OZ.tutulan || aciDegeri();
  let v = d.aci;
  if (OZ.sifir.aci && !OZ.tutulan) v = Math.abs(d.aci - OZ.sifir.aci);
  el.textContent = sayi(v, 1) + '°';
  $('#oAciAlt').textContent = (OZ.tutulan ? 'Tutulan değer · ' : '') + (OZ.sifir.aci ? `başlangıca göre (${sayi(OZ.sifir.aci, 1)}°)` : d.tur === 'kenar' ? 'Uzun kenarın yatayla açısı' : 'Yüzeyin eğimi');
  const yuzde = v >= 89.95 ? '∞' : '%' + sayi(Math.tan(v * R) * 100, 1), oran = v < 0.05 ? '—' : v >= 89.95 ? '—' : '1 : ' + sayi(1 / Math.tan(v * R), 1);
  const uc = `<div><span>Eğim</span><b>${yuzde}</b></div><div><span>Oran</span><b>${oran}</b></div><div><span>Tümler</span><b>${sayi(90 - Math.min(90, v), 1)}°</b></div>`;
  const u = $('#oAciUc'); if (u.dataset.h !== uc) { u.innerHTML = uc; u.dataset.h = uc; }
  // Çizim: kol açıyı gösterir
  const kolAci = -Math.min(90, v);
  $('#oAciKol').setAttribute('transform', `rotate(${kolAci.toFixed(2)} 150 150)`);
  const r = 70, x = 150 + r * Math.cos(kolAci * R), y = 150 + r * Math.sin(kolAci * R);
  $('#oAciYay').setAttribute('d', `M${150 + r} 150 A${r} ${r} 0 0 0 ${x.toFixed(1)} ${y.toFixed(1)}`);
  $('#oAci').classList.toggle('duz', v < 0.5);
}

/* ═════════ Cetvel ═════════ */
// Ekran ölçüsü cihaza göre değişir: varsayılan tahmin, "Ayarla" ile banka kartına göre kesinleşir.
const varsayilanMmPx = () => matchMedia('(pointer: coarse)').matches ? 6.3 : 3.78;
const mmPx = () => store.get('olcumMmPx', null) || varsayilanMmPx();
let cetvelA = 20, cetvelB = 80;   // mm
function cetvelCiz() {
  const ayarli = !!store.get('olcumMmPx', null);
  $('#oGovde').innerHTML = `
  <div class="ol-cetvel-kutu">
    <div class="ol-cetvel" id="oCetvel"></div>
    <div class="ol-cetvel-yan">
      <div class="ol-deger sol"><b id="oCetD">—</b><span id="oCetAlt"></span></div>
      <div class="seg yon-seg">${[['cm', 'cm'], ['in', 'inç']].map(([k, n]) => `<button class="${OZ.ayar.birim === k ? 'on' : ''}" data-action="o-birim" data-k="${k}">${n}</button>`).join('')}</div>
      ${ayarli ? '' : `<div class="ol-not">${IC.alert}<span>Cetvel bu ekrana göre henüz ayarlanmadı; ölçüler yaklaşık.</span></div>`}
      <button class="btn ${ayarli ? '' : 'primary'}" data-action="o-cetvel-ayar">${IC.cetvel}${ayarli ? 'Yeniden ayarla' : 'Kartla ayarla'}</button>
      <p class="muted sm">Ölçeceğin şeyi ekranın sol kenarına, en üstteki 0 çizgisine daya. Mavi çizgileri sürükleyerek iki nokta arasını ölç.</p>
    </div>
  </div>`;
  cetvelTazele();
  const el = $('#oCetvel');
  let tutulan = null;
  el.onpointerdown = e => {
    const r = el.getBoundingClientRect(), mm = (e.clientY - r.top) / mmPx();
    tutulan = Math.abs(mm - cetvelA) < Math.abs(mm - cetvelB) ? 'A' : 'B';
    el.setPointerCapture(e.pointerId); tasi(e); e.preventDefault();
  };
  const tasi = e => {
    if (!tutulan) return; const r = el.getBoundingClientRect();
    let mm = Math.max(0, (e.clientY - r.top) / mmPx()); mm = Math.round(mm * 2) / 2;   // 0,5 mm adım
    if (tutulan === 'A') cetvelA = mm; else cetvelB = mm; cetvelTazele(true);
  };
  el.onpointermove = tasi;
  el.onpointerup = el.onpointercancel = () => { tutulan = null; };
}
function cetvelTazele(sadeceCizgi) {
  const el = $('#oCetvel'); if (!el) return;
  const p = mmPx(), H = el.clientHeight || 600, inc = OZ.ayar.birim === 'in';
  if (!sadeceCizgi) {
    let s = '';
    if (inc) { const ip = p * 25.4; for (let i = 0; i * ip / 16 <= H; i++) { const y = i * ip / 16, uz = i % 16 === 0 ? 46 : i % 8 === 0 ? 34 : i % 4 === 0 ? 26 : i % 2 === 0 ? 18 : 12; s += `<line x1="0" y1="${y}" x2="${uz}" y2="${y}" class="${i % 16 === 0 ? 'uz' : ''}"/>${i % 16 === 0 && i ? `<text x="52" y="${y + 5}">${i / 16}</text>` : ''}`; } }
    else for (let i = 0; i * p <= H; i++) { const y = i * p, uz = i % 10 === 0 ? 46 : i % 5 === 0 ? 30 : 18; s += `<line x1="0" y1="${y}" x2="${uz}" y2="${y}" class="${i % 10 === 0 ? 'uz' : ''}"/>${i % 10 === 0 && i ? `<text x="52" y="${y + 5}">${i / 10}</text>` : ''}`; }
    el.innerHTML = `<svg width="100%" height="${H}" aria-hidden="true"><g id="oCetCizgi">${s}</g><rect id="oCetAra" x="0" width="100%" class="ara"/><line id="oCetA" x1="0" x2="100%" class="isaret"/><line id="oCetB" x1="0" x2="100%" class="isaret"/></svg>`;
  }
  const ya = cetvelA * p, yb = cetvelB * p;
  $('#oCetA').setAttribute('y1', ya); $('#oCetA').setAttribute('y2', ya); $('#oCetB').setAttribute('y1', yb); $('#oCetB').setAttribute('y2', yb);
  $('#oCetAra').setAttribute('y', Math.min(ya, yb)); $('#oCetAra').setAttribute('height', Math.abs(yb - ya));
  const mm = Math.abs(cetvelB - cetvelA);
  $('#oCetD').textContent = inc ? sayi(mm / 25.4, 2) + ' inç' : mm >= 10 ? sayi(mm / 10, 2) + ' cm' : sayi(mm, 1) + ' mm';
  $('#oCetAlt').textContent = inc ? sayi(mm / 10, 1) + ' cm' : sayi(mm, 1) + ' mm · ' + sayi(mm / 25.4, 2) + ' inç';
}
function cetvelAyarAc() {
  let p = mmPx();
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Cetveli ayarla</h3></header>
    <div class="set-body ol-kart-ayar">
      <p class="muted sm" id="oKartYon"></p>
      <div class="ol-kart-alan"><div class="ol-kart" id="oKart"><span>Kart</span></div></div>
      <div class="ol-kart-tus"><button type="button" class="icon-btn" data-d="-1" title="Küçült">−</button><input type="range" id="oKartR" min="2" max="12" step="0.01" value="${p}"><button type="button" class="icon-btn" data-d="1" title="Büyüt">+</button></div>
      <p class="muted sm">Kart 85,6 mm × 54 mm (bütün banka ve kimlik kartları aynı boydadır).</p>
      <div class="sticky-actions">${store.get('olcumMmPx', null) ? '<button type="button" class="btn" id="oKartSil">Varsayılana dön</button>' : ''}<div class="spacer"></div><button type="button" class="btn" data-action="close-modal">Vazgeç</button><button type="button" class="btn primary" id="oKartTamam">Kaydet</button></div>
    </div></div></div>`;
  // Kart ekrana sığmıyorsa (telefonlar) dik gösterilir: uzun kenar ekranın boyuna
  const goster = () => { const k = $('#oKart'), dik = $('.ol-kart-alan').clientWidth < 85.6 * p + 8; k.style.width = ((dik ? 53.98 : 85.6) * p) + 'px'; k.style.height = ((dik ? 85.6 : 53.98) * p) + 'px'; $('#oKartR').value = p; $('#oKartYon').textContent = dik ? 'Kartı ekrana dik koy; mavi kutunun yüksekliğini kartın uzun kenarına eşitle.' : 'Kartı ekrana yatay koy; mavi kutunun genişliğini kartın uzun kenarına eşitle.'; };
  $('#oKartR').oninput = e => { p = +e.target.value; goster(); };
  document.querySelectorAll('.ol-kart-tus [data-d]').forEach(b => b.onclick = () => { p = Math.max(2, Math.min(12, p + (+b.dataset.d) * 0.02)); goster(); });
  $('#oKartTamam').onclick = () => { store.set('olcumMmPx', p); closeModal(); toast('Cetvel ayarlandı'); cetvelCiz(); };
  if ($('#oKartSil')) $('#oKartSil').onclick = () => { store.set('olcumMmPx', null); closeModal(); cetvelCiz(); };
  goster();
}

/* ═════════ Ses ölçer ═════════ */
const SESD = { akis: null, bag: null, analiz: null, tampon: null, gecmis: [], en: -Infinity, enAz: Infinity, enerji: 0, say: 0, son: 0, db: null };
const SEVIYE = [[30, 'Fısıltı, sessiz oda'], [45, 'Sakin ev'], [60, 'Normal konuşma'], [70, 'Kalabalık ofis, elektrikli süpürge'], [80, 'Yoğun trafik'], [85, 'Uzun süre dinlemek kulağa zarar verir'], [100, 'Konser, matkap'], [120, 'Ağrı eşiği']];
const seviyeAd = db => { let a = SEVIYE[0][1]; for (const [d, n] of SEVIYE) if (db >= d) a = n; return a; };
function sesCiz() {
  const calisiyor = !!SESD.akis;
  $('#oGovde').innerHTML = `
  <div class="ol-orta">
    <div class="ol-ses ${calisiyor ? 'acik' : ''}" id="oSes">
      <svg viewBox="0 0 300 180" aria-hidden="true"><path d="M30 165A120 120 0 0 1 270 165" class="iz"/><path d="M30 165A120 120 0 0 1 270 165" class="dolu" id="oSesYay"/></svg>
      <div class="ol-ses-m"><b id="oSesD">—</b><span>dB</span></div>
    </div>
    <div class="ol-deger"><span id="oSesAd">${calisiyor ? '' : 'Mikrofonu açınca ortamın ses seviyesini gösterir'}</span></div>
    <div class="ol-uclu"><div><span>En az</span><b id="oSesMin">—</b></div><div><span>Ortalama</span><b id="oSesOrt">—</b></div><div><span>En çok</span><b id="oSesMax">—</b></div></div>
    <canvas id="oSesGrafik" class="ol-ses-grafik" height="120"></canvas>
    <div class="ol-tuslar"><button class="btn ${calisiyor ? '' : 'primary'}" data-action="o-ses">${calisiyor ? IC.durdur + 'Durdur' : IC.oynat + 'Ölçmeye başla'}</button>${calisiyor ? '<button class="btn" data-action="o-ses-sifirla">Sıfırla</button>' : ''}</div>
    <p class="muted sm ol-dipnot">Telefon mikrofonları resmî ses ölçer değildir; değerler yaklaşık ±5 dB'dir. Ses kaydedilmez, hiçbir yere gönderilmez. Ayarlar'dan bilinen bir ölçüme göre düzeltebilirsin.</p>
  </div>`;
  sesGrafik();
}
async function sesBaslat() {
  try {
    const akis = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    const AC = window.AudioContext || window.webkitAudioContext, bag = new AC(), kaynak = bag.createMediaStreamSource(akis), analiz = bag.createAnalyser();
    analiz.fftSize = 2048; kaynak.connect(analiz);
    Object.assign(SESD, { akis, bag, analiz, tampon: new Float32Array(analiz.fftSize), gecmis: [], en: -Infinity, enAz: Infinity, enerji: 0, say: 0, db: null });
    sesCiz();
  } catch (e) { toast(e && e.name === 'NotAllowedError' ? 'Mikrofon izni verilmedi' : 'Mikrofon açılamadı'); }
}
function sesDurdur() {
  if (!SESD.akis) return;
  SESD.akis.getTracks().forEach(t => t.stop()); try { SESD.bag.close(); } catch {}
  SESD.akis = SESD.bag = SESD.analiz = null;
}
function sesOlc(t) {
  if (!SESD.analiz) return;
  SESD.analiz.getFloatTimeDomainData(SESD.tampon);
  let top = 0; for (const v of SESD.tampon) top += v * v;
  const rms = Math.sqrt(top / SESD.tampon.length), dbfs = 20 * Math.log10(Math.max(rms, 1e-7));
  const db = Math.max(0, dbfs + 94 + (+OZ.ayar.sesDuzelt || 0));   // telefon mikrofonu için yaklaşık ölçek
  SESD.db = SESD.db == null ? db : SESD.db * 0.8 + db * 0.2;
  if (t - SESD.son > 125) {
    SESD.son = t; const d = SESD.db;
    SESD.en = Math.max(SESD.en, d); SESD.enAz = Math.min(SESD.enAz, d); SESD.enerji += Math.pow(10, d / 10); SESD.say++;
    SESD.gecmis.push(d); if (SESD.gecmis.length > 480) SESD.gecmis.shift();   // son 60 sn
    if (!$('#oSesD')) return;
    $('#oSesD').textContent = sayi(d, 0); $('#oSesAd').textContent = seviyeAd(d);
    $('#oSesMin').textContent = sayi(SESD.enAz, 0); $('#oSesMax').textContent = sayi(SESD.en, 0); $('#oSesOrt').textContent = sayi(10 * Math.log10(SESD.enerji / SESD.say), 0);
    const oran = Math.max(0, Math.min(1, (d - 20) / 100)); const yay = $('#oSesYay'); yay.style.strokeDashoffset = 377 * (1 - oran);
    $('#oSes').dataset.seviye = d >= 85 ? 'yuksek' : d >= 70 ? 'orta' : 'dusuk';
    sesGrafik();
  }
}
function sesGrafik() {
  const c = $('#oSesGrafik'); if (!c) return;
  const w = c.clientWidth || 300, h = 120, dpr = devicePixelRatio || 1;
  if (c.width !== Math.round(w * dpr)) { c.width = Math.round(w * dpr); c.height = h * dpr; }
  const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
  const st = getComputedStyle(document.body), cizgi = st.getPropertyValue('--line').trim() || '#ccc', yazi = st.getPropertyValue('--fg-3').trim() || '#888';
  g.font = '10px system-ui'; g.fillStyle = yazi; g.strokeStyle = cizgi; g.lineWidth = 1;
  for (const d of [40, 60, 80, 100]) { const y = h - (d - 20) / 100 * h; g.beginPath(); g.moveTo(26, y); g.lineTo(w, y); g.stroke(); g.fillText(d, 2, y + 3); }
  const l = SESD.gecmis; if (l.length < 2) return;
  g.beginPath(); l.forEach((d, i) => { const x = 26 + (w - 26) * (i + 480 - l.length) / 479, y = h - Math.max(0, Math.min(1, (d - 20) / 100)) * h; i ? g.lineTo(x, y) : g.moveTo(x, y); });
  g.strokeStyle = '#3d5afe'; g.lineWidth = 2; g.stroke();
}

/* ═════════ Ayarlar ═════════ */
function ayarAc() {
  const t = store.get('theme', 'light'), A = OZ.ayar;
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet settings"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Ayarlar</h3></header>
    <div class="set-body">
      <section><h4>Görünüm</h4><div class="seg yon-seg">${[['light', 'Cam'], ['dark', 'Koyu'], ['auto', 'Otomatik'], ['flat', 'Düz']].map(([k, n]) => `<button class="${t === k ? 'on' : ''}" data-action="o-tema" data-t="${k}">${n}</button>`).join('')}</div></section>
      <section><h4>Ses ölçer düzeltmesi</h4><div class="set-row"><div><b>Düzeltme (dB)</b><span>Gerçek bir ses ölçerle karşılaştırdıysan farkı yaz (ör. telefon 5 dB az gösteriyorsa 5).</span></div><input class="ol-sayi" id="oSesDuz" inputmode="decimal" value="${A.sesDuzelt ? sayi(A.sesDuzelt, 1) : ''}" placeholder="0"></div></section>
      <section><h4>Cetvel</h4><div class="set-row"><div><b>${store.get('olcumMmPx', null) ? 'Ayarlandı' : 'Ayarlanmadı'}</b><span>Ekranın milimetre ölçüsü kartla ayarlanır.</span></div><button class="btn sm" data-action="o-cetvel-ayar">Ayarla</button></div></section>
      <section><h4>Diğer</h4>
        <div class="set-row"><div><b>Titreşim</b><span>Terazi tam düz olunca kısa titreşim.</span></div><label class="ol-anahtar"><input type="checkbox" id="oTitresim" ${A.titresim ? 'checked' : ''}><i></i></label></div>
        <div class="set-row"><div><b>Ekranı açık tut</b><span>Ölçerken ekran kararmasın.</span></div><label class="ol-anahtar"><input type="checkbox" id="oUyanik" ${store.get('olcumUyanik', false) ? 'checked' : ''}><i></i></label></div></section>
      <section><h4>Verilerin</h4><div class="set-row"><div><b>Bu cihazda</b><span>Ayarlar sadece bu cihazda saklanır. Mikrofon sesi kaydedilmez.</span></div></div></section>
      <section><h4>Uygulama</h4>${typeof aboutRow === 'function' ? aboutRow() : ''}</section>
    </div></div></div>`;
  $('#oSesDuz').onchange = e => { const v = e.target.value.trim().replace(',', '.'); if (v === '' || (isFinite(+v) && Math.abs(+v) <= 30)) { A.sesDuzelt = v === '' ? 0 : +v; kaydet(); } else toast('−30 ile 30 arasında yaz'); };
  $('#oTitresim').onchange = e => { A.titresim = e.target.checked; kaydet(); };
  $('#oUyanik').onchange = e => { store.set('olcumUyanik', e.target.checked); uyanikTut(); };
}
let kilitE = null;
async function uyanikTut() {
  const gerek = store.get('olcumUyanik', false) && document.visibilityState === 'visible';
  try { if (gerek && !kilitE && navigator.wakeLock) { kilitE = await navigator.wakeLock.request('screen'); kilitE.addEventListener('release', () => { kilitE = null; }); } else if (!gerek && kilitE) { await kilitE.release(); kilitE = null; } } catch {}
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') uyanikTut(); else if (SESD.akis) { sesDurdur(); if (OZ.sekme === 'ses') sesCiz(); } });

/* ═════════ Ana döngü ═════════ */
function dongu(t) {
  if (DEMO) { const s = Date.now() / 1000; OZ.egim = { b: 2.4 * Math.sin(s / 2), g: 3 * Math.cos(s / 3), var: true }; }
  if (OZ.sekme === 'terazi') teraziTazele();
  else if (OZ.sekme === 'aci') aciTazele();
  else if (OZ.sekme === 'ses') sesOlc(t);
  const n = $('#oNot'); if (n) { const h = algilayiciNotu(); if (n.dataset.h !== h) { n.innerHTML = h; n.dataset.h = h; } }
  requestAnimationFrame(dongu);
}
let boyutT = 0;
window.addEventListener('resize', () => { clearTimeout(boyutT); boyutT = setTimeout(() => { if (OZ.sekme === 'cetvel') cetvelTazele(); }, 150); });

/* ═════════ Olaylar ═════════ */
Object.assign(ACTIONS, {
  'o-sekme': el => { OZ.sekme = el.dataset.k; store.set('olcumSekme', OZ.sekme); ciz(); },
  'o-ayar': () => ayarAc(), settings: () => ayarAc(),
  'o-tema': el => { store.set('theme', el.dataset.t); applyTheme(el.dataset.t); ayarAc(); },
  'o-ios-izin': () => iosIzin(),
  'o-sifirla': () => { if (!OZ.egim.var) return toast('Eğim algılayıcısı yok'); const a = acilar(); Object.assign(OZ.sifir, { b: OZ.egim.b, g: OZ.egim.g, k: a.dik ? a.ekran : 0 }); store.set('olcumSifir', OZ.sifir); toast('Bu açı artık sıfır'); teraziCiz(); },
  'o-sifir-kaldir': () => { Object.assign(OZ.sifir, { b: 0, g: 0, k: 0 }); store.set('olcumSifir', OZ.sifir); teraziCiz(); },
  'o-tut': () => { if (OZ.tutulan) OZ.tutulan = null; else { if (!OZ.egim.var) return toast('Eğim algılayıcısı yok'); const d = aciDegeri(); OZ.tutulan = { ...d, aci: OZ.sifir.aci ? Math.abs(d.aci - OZ.sifir.aci) : d.aci }; titret(20); } aciCiz(); },
  'o-aci-sifir': () => { if (OZ.sifir.aci) OZ.sifir.aci = 0; else { if (!OZ.egim.var) return toast('Eğim algılayıcısı yok'); OZ.sifir.aci = aciDegeri().aci || 0.0001; toast('İkinci yüzeye yasla'); } OZ.tutulan = null; store.set('olcumSifir', OZ.sifir); aciCiz(); },
  'o-birim': el => { OZ.ayar.birim = el.dataset.k; kaydet(); cetvelCiz(); },
  'o-cetvel-ayar': () => cetvelAyarAc(),
  'o-ses': () => { if (SESD.akis) { sesDurdur(); sesCiz(); } else sesBaslat(); },
  'o-ses-sifirla': () => { Object.assign(SESD, { gecmis: [], en: -Infinity, enAz: Infinity, enerji: 0, say: 0 }); sesGrafik(); }
});

/* ═════════ Başlangıç ═════════ */
document.removeEventListener('DOMContentLoaded', boot);
function olcumBaslat() {
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  const u = new URLSearchParams(location.search);
  for (const k of ['terazi', 'aci', 'cetvel', 'ses']) if (u.has(k)) { OZ.sekme = k; history.replaceState(null, '', location.pathname + (DEMO ? '?demo' : '')); }
  kabuk(); ciz(); uyanikTut();
  requestAnimationFrame(dongu);
}
showLogin = msg => { if (msg) toast(msg); };
start = () => olcumBaslat();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', olcumBaslat); else olcumBaslat();
