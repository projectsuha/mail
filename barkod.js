/* ───────────── Barkod ─────────────
   Barkod oluşturma ve etiket basma. Tek barkod (PNG/SVG/PDF), etiket tasarımı (sürükle-bırak), hazır şablonlar,
   A4 etiket kâğıtları ve termal rulo, toplu basım (liste/CSV, sayaç), mağaza içi numara, terazi barkodu,
   GS1 rehberi, basmadan önce okuyucuyla doğrulama. Giriş gerekmez; her şey bu cihazda kalır. */
'use strict';

window.APP_NAME = 'Barkod';
window.APP_ICON = 'barkod-apple.png?v=1';
window.APP_LEAD = 'Barkod ve etiket oluştur, A4 etiket kâğıdına ya da termal yazıcıya bas. Ücretsiz, filigransız.';

const BSVG2 = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
Object.assign(IC, {
  barkod: BSVG2('<path d="M4 6v12M7 6v12M10 6v9M12.5 6v9M15 6v12M18 6v9M20 6v12"/>'),
  etiket: BSVG2('<path d="M3.5 12.3V4.5a1 1 0 0 1 1-1h7.8l8.2 8.2a1.4 1.4 0 0 1 0 2l-6.6 6.6a1.4 1.4 0 0 1-2 0z"/><circle cx="8" cy="8" r="1.3"/>'),
  arac: BSVG2('<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3z"/><path d="m5 5 3 3"/>'),
  indir: BSVG2('<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M5 19h14"/>'),
  paylas: BSVG2('<path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 12v7h14v-7"/>'),
  kopya: BSVG2('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>'),
  yazici: BSVG2('<path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="7" rx="1.5"/><path d="M7 14h10v6H7z"/>'),
  yaziI: BSVG2('<path d="M5 6V4.5h14V6M12 4.5v15M9 19.5h6"/>'),
  cizgiI: BSVG2('<path d="M4 20 20 4"/>'), kutuI: BSVG2('<rect x="4" y="5" width="16" height="14" rx="2"/>'),
  resimI: BSVG2('<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m4 17 5-4.5 3.5 3 2.5-2 5 3.5"/>'),
  alanI: BSVG2('<path d="M8 5H6a2 2 0 0 0-2 2v3l-1.5 2L4 14v3a2 2 0 0 0 2 2h2M16 5h2a2 2 0 0 1 2 2v3l1.5 2-1.5 2v3a2 2 0 0 1-2 2h-2"/>'),
  daha: BSVG2('<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>'),
  onay: BSVG2('<path d="m5 12.5 4.5 4.5L19 7.5"/>'), uyari: BSVG2('<path d="M12 4 2.5 20h19z"/><path d="M12 10v4M12 17v.2"/>'),
  sihir: BSVG2('<path d="m4 20 11-11M14 4v3M12.5 5.5h3M19 9v3M17.5 10.5h3"/>'),
  terazi: BSVG2('<path d="M12 4v16M6 20h12M5 8h14"/><path d="m5 8-3 6a3 3 0 0 0 6 0zM19 8l-3 6a3 3 0 0 0 6 0z"/>'),
  magaza: BSVG2('<path d="M4 10v10h16V10M3 6l2-3h14l2 3v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z"/>'),
  bilgi: BSVG2('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.2"/>'),
  ust: BSVG2('<rect x="9" y="9" width="11" height="11" rx="1.5" fill="currentColor" fill-opacity=".25"/><path d="M15 5V4H4v11h1"/>'),
  csv: BSVG2('<path d="M6 3h9l4 4v14H6z"/><path d="M9 12h6M9 15.5h6M12 10v8"/>')
});

/* ═════════ Depo (IndexedDB) ═════════ */
const BDepo = {
  db: null,
  ac() { if (this.db) return Promise.resolve(this.db); return new Promise((res, rej) => { const r = indexedDB.open('barkod', 1); r.onupgradeneeded = () => r.result.createObjectStore('tasarimlar', { keyPath: 'id' }); r.onsuccess = () => res(this.db = r.result); r.onerror = () => rej(r.error); }); },
  async is(kip, f) { const d = await this.ac(); return new Promise((res, rej) => { const t = d.transaction('tasarimlar', kip), s = t.objectStore('tasarimlar'), r = f(s); t.oncomplete = () => res(r?.result); t.onerror = () => rej(t.error); }); },
  hepsi() { return this.is('readonly', s => s.getAll()); }, koy(v) { return this.is('readwrite', s => s.put(v)); }, sil(id) { return this.is('readwrite', s => s.delete(id)); }
};
const bId = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
const sayiTR = (n, d = 1) => (+n).toLocaleString('tr-TR', { maximumFractionDigits: d });

/* ═════════ Durum ═════════ */
const K = {
  sekme: store.get('barkodSekme', 'olustur'), tasarimlar: [],
  tek: store.get('barkodTek', { tur: 'ean13', veri: '', modul: 0.33, yukseklik: 22, yazi: true, renk: '#000000', kontrol: false, qrHata: 'M' }),
  duz: null,   // { t (tasarım), sec, zoom, gecmis[] }
};

/* ═════════ Başlangıç (giriş gerekmez) ═════════ */
document.removeEventListener('DOMContentLoaded', boot);
async function barkodBaslat() {
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  if (location.hash.includes('state=')) history.replaceState(null, '', location.pathname + location.search);
  S.email = store.get('email') || '';
  zxingYukle().catch(() => {});
  try { K.tasarimlar = (await BDepo.hepsi()).map(tasarimTemizle).filter(Boolean); } catch { K.tasarimlar = []; }
  if (DEMO && !K.tasarimlar.length) { for (const id of ['raf', 'urun', 'demirbas']) await tasarimYeni(id, true); }
  K.tasarimlar.sort((a, b) => b.degisti - a.degisti);
  const u = new URLSearchParams(location.search);
  if (u.has('etiket')) K.sekme = 'etiketler';
  if (u.has('etiket') || u.has('olustur')) history.replaceState(null, '', location.pathname + (DEMO ? '?demo' : ''));
  kabuk(); sekmeCiz();
}
showLogin = msg => { if (msg) toast(msg); };
start = () => barkodBaslat();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', barkodBaslat); else barkodBaslat();
let zxingYuk = null;
function zxingYukle() {
  if (window.ZXing) return Promise.resolve(window.ZXing);
  if (!zxingYuk) zxingYuk = new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'qr-lib/zxing.js'; s.onload = () => res(window.ZXing); s.onerror = () => { zxingYuk = null; rej(new Error('yüklenemedi')); }; document.head.appendChild(s); });
  return zxingYuk;
}

function kabuk() {
  document.body.classList.add('bk-on');
  $('#app').innerHTML = `
  <div class="bk-kabuk">
    <header class="bk-bas">
      <div class="brand-mark sm">${IC.barkod}</div><h1>Barkod</h1>
      <nav class="seg bk-ust-sekme">${[['olustur', 'Barkod'], ['etiketler', 'Etiketler'], ['araclar', 'Araçlar']].map(([k, n]) => `<button data-action="k-sekme" data-k="${k}">${n}</button>`).join('')}</nav>
      <div class="spacer"></div>
      <button class="icon-btn" data-action="k-ayar" title="Ayarlar">${IC.gear}</button>
    </header>
    <main class="bk-govde" id="kGovde"></main>
    <nav class="bk-alt-sekme">${[['olustur', 'Barkod', 'barkod'], ['etiketler', 'Etiketler', 'etiket'], ['araclar', 'Araçlar', 'arac']].map(([k, n, ic]) => `<button data-action="k-sekme" data-k="${k}">${IC[ic]}<span>${n}</span></button>`).join('')}</nav>
  </div>`;
}
function sekmeCiz() {
  document.querySelectorAll('[data-action="k-sekme"]').forEach(b => b.classList.toggle('on', b.dataset.k === K.sekme));
  ({ olustur: olusturCiz, etiketler: etiketlerCiz, araclar: araclarCiz }[K.sekme] || olusturCiz)();
}

/* ═════════ Doğrulama: barkodu okuyucuyla oku ═════════ */
const DOGRULANAMAZ = { upce: 'UPC-E', codabar: 'Codabar' };
async function dogrula(lay, tur) {
  if (DOGRULANAMAZ[tur]) return { durum: 'yok', mesaj: `${DOGRULANAMAZ[tur]} bu cihazdaki okuyucuyla kontrol edilemiyor (kodlama standarda göre yapıldı).` };
  const Z = await zxingYukle();
  const X = Math.max(0.05, lay.X || Math.min(...lay.cubuklar.map(c => c.w))), k = 4 / X, pad = 24;   // modül başına tam 4 piksel: kenar yumuşatması okumayı bozmasın
  const c = document.createElement('canvas'); c.width = Math.ceil(lay.w * k) + pad * 2; c.height = Math.ceil(lay.h * k) + pad * 2;
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); tuvaleCiz(g, lay, pad / k, pad / k, k);
  const bm = () => new Z.BinaryBitmap(new Z.HybridBinarizer(new Z.HTMLCanvasElementLuminanceSource(c)));
  const denemeler = [() => { const r = new Z.MultiFormatReader(), h = new Map(); h.set(Z.DecodeHintType.TRY_HARDER, true); r.setHints(h); return r.decodeWithState(bm()); }];
  if (/datamatrix|gs1/.test(tur) || tur === 'datamatrix') denemeler.unshift(() => new Z.DataMatrixReader().decode(bm(), new Map([[Z.DecodeHintType.PURE_BARCODE, true]])));
  for (const d of denemeler) { try { const r = d(); return { durum: 'iyi', metin: r.getText() }; } catch {} }
  return { durum: 'kotu', mesaj: 'Okuyucu bu barkodu okuyamadı. Boyutu büyütmeyi ya da yüksekliği artırmayı dene.' };
}
// Boyut uyarıları (GS1 ve yaygın yazıcı önerileri)
function boyutUyarilari(tur, X, h, lay) {
  const u = [];
  if (/^(ean13|upca|isbn|issn)$/.test(tur)) { const oran = X / 0.33; if (oran < 0.8) u.push(`Market barkodu için çok küçük (%${Math.round(oran * 100)}). En az %80 (çubuk 0,264 mm) olmalı; kasada okunmayabilir.`); if (oran > 2) u.push('Standarttan büyük (%200 üstü).'); }
  else if (/^(code128|gs1128|code39|itf|itf14|codabar|ean8|upce)$/.test(tur) && X < 0.25) u.push(`İnce çubuk ${sayiTR(X, 3)} mm. Termal ve mürekkep yazıcılarda 0,25 mm altı okunmayabilir.`);
  if (/^(datamatrix|qr)$/.test(tur) && X < 0.3) u.push(`Kare başına ${sayiTR(X, 2)} mm. Telefon kamerası için en az 0,3 mm önerilir.`);
  if (lay && lay.w < 15 && !/^(datamatrix|qr)$/.test(tur)) u.push('Barkod çok dar; okuyucu tutturamayabilir.');
  if (tur !== 'qr' && tur !== 'datamatrix' && h && h < 8) u.push('Yükseklik çok kısa; 10 mm ve üstü daha rahat okunur.');
  return u;
}

/* ═════════ Tek barkod ═════════ */
function olusturCiz() {
  const T = K.tek, t = TURLER[T.tur];
  $('#kGovde').innerHTML = `
  <div class="bk-sayfa bk-tek">
    <section class="bk-kart bk-form">
      <div class="bk-baslik"><h2>Barkod oluştur</h2><button class="btn sm" data-action="k-sihirbaz">${IC.sihir}Hangisini seçeyim?</button></div>
      <div class="bk-turler">${Object.entries(TURLER).map(([k, v]) => `<button class="bk-tur ${T.tur === k ? 'on' : ''}" data-action="k-tur" data-k="${k}"><b>${v.ad}</b><span>${v.aciklama}</span></button>`).join('')}</div>
      <label class="bk-l">Veri<div class="bk-girdi"><input id="kVeri" value="${esc(T.veri)}" placeholder="${esc(t.ornek)}" autocomplete="off" spellcheck="false" ${t.rakam ? 'inputmode="numeric"' : ''}><button class="btn sm" data-action="k-ornek">Örnek</button></div></label>
      ${/gs1128|datamatrix/.test(T.tur) ? `<button class="btn sm bk-gs1-ac" data-action="k-gs1">${IC.alanI}GS1 alanlarıyla doldur (GTIN, son kullanma, parti, seri)</button>` : ''}
      <div class="bk-mesaj" id="kMesaj"></div>
      <div class="bk-ayar-izgara">
        ${!/qr|datamatrix/.test(T.tur) ? `<label class="bk-l">Çubuk genişliği<select id="kModul">${[[0.264, '0,264 mm (%80)'], [0.3, '0,30 mm'], [0.33, '0,33 mm (%100, standart)'], [0.4, '0,40 mm'], [0.5, '0,50 mm'], [0.66, '0,66 mm (%200)']].map(([v, n]) => `<option value="${v}" ${+T.modul === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
          <label class="bk-l">Yükseklik (mm)<input id="kYuk" type="number" min="5" max="200" step="1" value="${T.yukseklik}"></label>
          <label class="bk-kutu"><input type="checkbox" id="kYazi" ${T.yazi ? 'checked' : ''}> Rakamları altına yaz</label>`
        : `<label class="bk-l">Kare boyu<select id="kModul">${[[0.3, '0,30 mm'], [0.4, '0,40 mm'], [0.5, '0,50 mm'], [0.75, '0,75 mm'], [1, '1 mm']].map(([v, n]) => `<option value="${v}" ${+T.modul === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
          ${T.tur === 'qr' ? `<label class="bk-l">Hata düzeltme<select id="kQrHata">${[['L', 'Düşük'], ['M', 'Orta'], ['Q', 'Yüksek'], ['H', 'En yüksek']].map(([v, n]) => `<option value="${v}" ${T.qrHata === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label>` : ''}`}
        ${T.tur === 'code39' ? `<label class="bk-kutu"><input type="checkbox" id="kKontrol" ${T.kontrol ? 'checked' : ''}> Kontrol karakteri ekle</label>` : ''}
        <label class="bk-l">Renk<input id="kRenk" type="color" value="${T.renk}"></label>
      </div>
    </section>
    <section class="bk-kart bk-onizleme">
      <div class="bk-on-kutu" id="kOn"></div>
      <div class="bk-boyut" id="kBoyut"></div>
      <div class="bk-dogrula" id="kDogrula"></div>
      <div class="bk-uyarilar" id="kUyari"></div>
      <div class="bk-eylemler">
        <button class="btn primary" data-action="k-png">${IC.indir}PNG</button>
        <button class="btn" data-action="k-svg">${IC.indir}SVG</button>
        <button class="btn" data-action="k-pdf">${IC.indir}PDF</button>
        ${navigator.share ? `<button class="btn" data-action="k-paylas">${IC.paylas}Paylaş</button>` : ''}
        <button class="btn" data-action="k-etikete">${IC.etiket}Etiket yap</button>
      </div>
    </section>
  </div>`;
  const kaydetGuncelle = () => { store.set('barkodTek', K.tek); tekGuncelle(); };
  $('#kVeri').addEventListener('input', e => { T.veri = e.target.value; kaydetGuncelle(); });
  [['#kModul', 'modul', v => +v], ['#kYuk', 'yukseklik', v => +v], ['#kRenk', 'renk', v => v], ['#kQrHata', 'qrHata', v => v]].forEach(([s, k, f]) => $(s)?.addEventListener('input', e => { T[k] = f(e.target.value); kaydetGuncelle(); }));
  [['#kYazi', 'yazi'], ['#kKontrol', 'kontrol']].forEach(([s, k]) => $(s)?.addEventListener('change', e => { T[k] = e.target.checked; kaydetGuncelle(); }));
  if (T.tur === 'qr') zxingYukle().then(tekGuncelle); else tekGuncelle();
}
let tekSon = null, dogrulaT = 0;
function tekModel() {
  const T = K.tek, v = T.veri.trim() || TURLER[T.tur].ornek;
  const m = kodla(T.tur, v, { kontrol: T.kontrol, hata: T.qrHata });
  if (m.hata) return { m, v };
  const X = T.modul || 0.33, lay = yerlesim(m, { modul: X, yukseklik: m.tur === '2b' ? undefined : T.yukseklik, yazi: T.yazi, altMetin: '' });
  return { m, v, lay, X };
}
function tekGuncelle() {
  const T = K.tek, r = tekModel(), msj = $('#kMesaj'); if (!msj) return;
  tekSon = r;
  if (r.m.hata) {
    msj.className = 'bk-mesaj hata'; msj.innerHTML = `${IC.uyari}<span>${esc(r.m.hata)}</span>${r.m.oneri ? `<button class="btn sm" data-action="k-duzelt" data-v="${esc(r.m.oneri)}">Düzelt: ${esc(r.m.oneri)}</button>` : ''}`;
    $('#kOn').innerHTML = `<div class="bk-bos-on">${IC.barkod}<span>${r.m.yukle ? 'Hazırlanıyor…' : 'Barkod oluşturulamadı'}</span></div>`; $('#kBoyut').textContent = ''; $('#kDogrula').innerHTML = ''; $('#kUyari').innerHTML = '';
    document.querySelectorAll('.bk-onizleme .btn').forEach(b => b.disabled = true); return;
  }
  document.querySelectorAll('.bk-onizleme .btn').forEach(b => b.disabled = false);
  const bilgi = [];
  if (!T.veri.trim()) bilgi.push(`Örnek gösteriliyor: <b>${esc(r.v)}</b>`);
  if (r.m.eklendi) bilgi.push(`Kontrol hanesi eklendi: <b>${esc(r.m.numara)}</b>`);
  if (T.tur === 'ean13' && /^2/.test(r.m.numara)) bilgi.push('2 ile başlıyor: <b>mağaza içi numara</b> (sadece kendi dükkânında geçerli).');
  if (T.tur === 'ean13' && /^86[89]/.test(r.m.numara)) bilgi.push('869/868: GS1 Türkiye numarası. Bu numaranın senin firmana ait olduğundan emin ol.');
  if (r.m.gs1 && TURLER[T.tur]) { const p = gs1Ayristir(T.veri.trim() || r.v); if (p.parcalar) bilgi.push(p.parcalar.map(x => `<span class="bk-ai">(${x.ai}) ${esc(x.ad)}: <b>${esc(x.deger)}</b></span>`).join(' ')); }
  msj.className = 'bk-mesaj' + (bilgi.length ? ' bilgi' : ''); msj.innerHTML = bilgi.length ? `${IC.bilgi}<span>${bilgi.join('<br>')}</span>` : '';
  $('#kOn').innerHTML = olcusuz(svgYap(r.lay, T.renk, '#fff')).replace('<svg ', '<svg class="bk-svg" ');
  $('#kBoyut').textContent = `${sayiTR(r.lay.w)} × ${sayiTR(r.lay.h)} mm · ${r.m.tur === '2b' ? `${r.m.n}×${r.m.n} kare` : `${r.m.moduller.length} modül`}`;
  const u = boyutUyarilari(T.tur, r.X, T.yukseklik, r.lay);
  if (T.renk && parlaklik(T.renk) > 0.45) u.push('Açık renkli çubuklar okunmayabilir; koyu renk (siyah, lacivert, koyu yeşil) kullan.');
  if (/^#?(ff0000|f00|e.0000)/i.test(T.renk)) u.push('Kırmızı çubuklar lazer okuyucularda görünmez.');
  $('#kUyari').innerHTML = u.map(x => `<div>${IC.uyari}<span>${esc(x)}</span></div>`).join('');
  $('#kDogrula').innerHTML = '<span class="bk-dg bekle">Kontrol ediliyor…</span>';
  clearTimeout(dogrulaT); dogrulaT = setTimeout(async () => {
    const d = await dogrula(r.lay, T.tur).catch(() => ({ durum: 'yok', mesaj: 'Kontrol edilemedi' }));
    if (tekSon !== r || !$('#kDogrula')) return;
    $('#kDogrula').innerHTML = d.durum === 'iyi' ? `<span class="bk-dg iyi">${IC.onay}Okuyucu doğruladı: ${esc(kisalt(d.metin.replace(/\x1d/g, '␝'), 60))}</span>` : `<span class="bk-dg ${d.durum}">${d.durum === 'kotu' ? IC.uyari : IC.bilgi}${esc(d.mesaj)}</span>`;
  }, 250);
}
const olcusuz = svg => svg.replace(/ width="[^"]*mm" height="[^"]*mm"/, '');
const parlaklik = h => { const n = parseInt(String(h).replace('#', ''), 16); return ((n >> 16 & 255) * 0.299 + (n >> 8 & 255) * 0.587 + (n & 255) * 0.114) / 255; };
const kisalt = (s, n) => s.length > n ? s.slice(0, n - 1) + '…' : s;
function dosyaAdi() { const r = tekSon; return (TURLER[K.tek.tur].ad + '-' + (r?.m?.numara || 'barkod')).replace(/[^\wğüşıöçĞÜŞİÖÇ.-]+/g, '-').slice(0, 60); }
async function tekPng(dpi = 600) {
  const r = tekSon, k = dpi / 25.4, c = document.createElement('canvas'); c.width = Math.ceil(r.lay.w * k); c.height = Math.ceil(r.lay.h * k);
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); tuvaleCiz(g, r.lay, 0, 0, k, K.tek.renk);
  return new Promise(res => c.toBlob(res, 'image/png'));
}
function indir(blob, ad) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = ad; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000); }
// Tek barkodu etikete çevir: barkodun ölçüsünde bir etiket tasarımı
async function tekEtiket() {
  const r = tekSon, T = K.tek; if (!r?.lay) return;
  const w = Math.ceil(r.lay.w + 4), h = Math.ceil(r.lay.h + 4);
  const t = { id: bId(), ad: TURLER[T.tur].ad + ' ' + (r.m.numara || ''), w, h, alanlar: { barkod: T.veri.trim() || r.v }, ogeler: [{ id: bId(), tip: 'barkod', x: 2, y: 2, w: r.lay.w, h: r.lay.h, tur: T.tur, veri: '{{barkod}}', renk: T.renk, yazi: T.yazi, modul: r.m.tur === '1b' ? r.X : undefined }], olustu: Date.now(), degisti: Date.now() };
  await BDepo.koy(t); K.tasarimlar.unshift(t); duzenleAc(t.id);
}

/* ═════════ "Hangi barkodu kullanmalıyım?" ═════════ */
const SIHIRBAZ = [
  ['Markette ya da internette satacağım bir ürün', 'ean13', 'EAN-13 kullan. Ama numarayı uyduramazsın: GS1 Türkiye\'den firma öneki alıp ürünlerine numara vermen gerekir (Trendyol, Amazon ve zincir marketler bunu ister). Araçlar sekmesinde GS1 rehberi var.'],
  ['Sadece kendi dükkânımda/kasamda kullanacağım ürün', 'ean13', 'EAN-13, ama 2 ile başlayan "mağaza içi" numara kullan. Araçlar > Mağaza içi numara bunu senin için üretir ve tekrar etmesini önler.'],
  ['Tartılı ürün (şarküteri, manav, kasap)', 'ean13', 'Terazi barkodu (EAN-13, ağırlık ya da fiyat içinde). Araçlar > Terazi barkodu.'],
  ['Depo, stok kodu, raf, ürün kodu (harf ve rakam)', 'code128', 'Code 128: kısa, yoğun, her okuyucu okur. Harf, rakam ve tire kullanabilirsin (Türkçe harf olmaz).'],
  ['Demirbaş, envanter, personel kartı', 'code128', 'Code 128 önerilir (daha kısa). Eski sistemin Code 39 istiyorsa Code 39 seç.'],
  ['Koli, palet, sevkiyat', 'itf14', 'Koliye ITF-14 (ürünün GTIN\'inden türetilir). Tarih, parti, seri de gerekiyorsa GS1-128.'],
  ['Son kullanma tarihi, parti ve seri numarası olan ürün (ilaç, gıda, kozmetik)', 'datamatrix', 'GS1 Data Matrix (karekod): küçük yerde çok bilgi taşır. "GS1 alanlarıyla doldur" düğmesini kullan.'],
  ['Kitap', 'isbn', 'ISBN barkodu (978/979 ile başlar). ISBN numarasını Kültür ve Turizm Bakanlığı verir.'],
  ['Dergi, gazete', 'issn', 'ISSN barkodu (977 ile başlar).'],
  ['Web adresi, menü, iletişim bilgisi', 'qr', 'QR kod. Daha çok seçenek için QR uygulamasını kullanabilirsin.']
];
function sihirbaz() {
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask bk-sihir"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Barkodu ne için kullanacaksın?</h3></header>
    <div class="set-body"><div class="bk-sihir-l">${SIHIRBAZ.map(([s], i) => `<button class="bk-sihir-s" data-i="${i}">${esc(s)}</button>`).join('')}</div><div id="kSihirSonuc"></div></div></div></div>`;
  document.querySelectorAll('.bk-sihir-s').forEach(b => b.onclick = () => {
    const [s, tur, acik] = SIHIRBAZ[+b.dataset.i];
    document.querySelectorAll('.bk-sihir-s').forEach(x => x.classList.toggle('on', x === b));
    $('#kSihirSonuc').innerHTML = `<div class="bk-sihir-sonuc"><b>${TURLER[tur].ad}</b><p>${esc(acik)}</p><div class="bk-eylemler"><button class="btn primary" id="kSihirSec">Bu türle oluştur</button>${/Mağaza içi|Terazi|GS1 Türkiye/.test(acik) ? `<button class="btn" id="kSihirArac">Araçlara git</button>` : ''}</div></div>`;
    $('#kSihirSec').onclick = () => { K.tek.tur = tur; K.tek.veri = ''; store.set('barkodTek', K.tek); closeModal(); K.sekme = 'olustur'; sekmeCiz(); };
    if ($('#kSihirArac')) $('#kSihirArac').onclick = () => { closeModal(); K.sekme = 'araclar'; sekmeCiz(); };
  });
}
function gs1Doldur(hedef) {
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>GS1 alanları</h3></header>
    <form class="set-body bk-f" id="kGF">
      <label class="nask-l">Ürün numarası (GTIN, 13 ya da 14 hane)<input name="01" inputmode="numeric" placeholder="8690504000013" required></label>
      <label class="nask-l">Son kullanma tarihi<input name="17" type="date"></label>
      <label class="nask-l">Üretim tarihi<input name="11" type="date"></label>
      <label class="nask-l">Parti / lot<input name="10" maxlength="20"></label>
      <label class="nask-l">Seri numarası<input name="21" maxlength="20"></label>
      <label class="nask-l">Adet<input name="30" inputmode="numeric" maxlength="8"></label>
      <div class="sticky-actions"><button type="button" class="btn" data-action="close-modal">Vazgeç</button><button class="btn primary">Uygula</button></div>
    </form></div></div>`;
  $('#kGF').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target), tarih = v => v ? v.slice(2, 4) + v.slice(5, 7) + v.slice(8, 10) : '';
    let g = String(f.get('01')).replace(/\D/g, ''); if (g.length === 12) g = '0' + g; if (g.length === 13) g = '0' + g;
    if (g.length === 14 && +g[13] !== mod10(g.slice(0, 13))) return toast('GTIN kontrol hanesi yanlış');
    if (g.length !== 14) return toast('GTIN 13 ya da 14 hane olmalı');
    let s = `(01)${g}`;
    if (f.get('11')) s += `(11)${tarih(f.get('11'))}`; if (f.get('17')) s += `(17)${tarih(f.get('17'))}`;
    // Değişken uzunluklu alanlar sona (ayraç gerektirmesin diye seri en sonda)
    if (f.get('30')) s += `(30)${f.get('30')}`; if (f.get('10')) s += `(10)${f.get('10')}`; if (f.get('21')) s += `(21)${f.get('21')}`;
    closeModal(); hedef(s);
  });
}

/* ═════════ Etiketler ═════════ */
function etiketlerCiz() {
  $('#kGovde').innerHTML = `
  <div class="bk-sayfa">
    <div class="bk-baslik"><h2>Etiketler</h2><div class="spacer"></div><button class="btn primary" data-action="k-yeni">${IC.plus}Yeni etiket</button></div>
    <div class="bk-izgara">${K.tasarimlar.map(t => `
      <div class="bk-etiket-kart" data-action="k-ac" data-id="${esc(t.id)}">
        <div class="bk-ek-on">${etiketSvg(t, t.alanlar, {})}</div>
        <div class="bk-ek-m"><b>${esc(t.ad)}</b><span>${sayiTR(t.w)} × ${sayiTR(t.h)} mm · ${esc(new Date(t.degisti).toLocaleDateString('tr-TR'))}</span></div>
        <button class="icon-btn bk-ek-menu" data-action="k-ek-menu" data-id="${esc(t.id)}" title="Seçenekler">${IC.daha}</button>
      </div>`).join('') || `<div class="bk-bos">${IC.etiket}<b>Henüz etiket yok</b><span>Hazır şablonla başla: raf etiketi, ürün/fiyat, kargo, demirbaş, kitap, koli ya da ilaç karekodu. Etiketlerin sadece bu cihazda saklanır.</span><button class="btn primary" data-action="k-yeni">${IC.plus}Yeni etiket</button></div>`}</div>
  </div>`;
}
function yeniEtiketSec() {
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet bk-sablon"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Yeni etiket</h3></header>
    <div class="set-body"><div class="bk-sablonlar">${SABLONLAR.map(s => `<button class="bk-sablon-k" data-s="${s.id}"><div class="bk-ek-on">${s.ogeler.length ? etiketSvg({ ...s, ogeler: s.ogeler }, s.alanlar, {}) : `<div class="bk-bos-sablon">${IC.plus}</div>`}</div><b>${esc(s.ad)}</b><span>${esc(s.aciklama)} · ${sayiTR(s.w)}×${sayiTR(s.h)} mm</span></button>`).join('')}</div></div></div></div>`;
  document.querySelectorAll('[data-s]').forEach(b => b.onclick = async () => { closeModal(); const t = await tasarimYeni(b.dataset.s); duzenleAc(t.id); });
}
async function tasarimYeni(sablonId, sessiz) {
  const s = SABLONLAR.find(x => x.id === sablonId) || SABLONLAR[0];
  const t = { id: bId(), ad: s.id === 'bos' ? 'Yeni etiket' : s.ad, w: s.w, h: s.h, alanlar: { ...s.alanlar }, ogeler: s.ogeler.map(o => ({ id: bId(), ...o })), olustu: Date.now(), degisti: Date.now(), kagit: s.w === 100 && s.h === 150 ? 'r-100x150' : s.w === 70 && s.h === 37 ? 'a4-24' : null };
  await BDepo.koy(t); K.tasarimlar.unshift(t);
  return t;
}
function etiketMenu(el) {
  const t = K.tasarimlar.find(x => x.id === el.dataset.id); if (!t) return;
  kPop(el, [['ac', IC.etiket, 'Düzenle'], ['yazdir', IC.yazici, 'Yazdır / PDF'], ['cogalt', IC.kopya, 'Çoğalt'], ['sil', IC.trash, 'Sil', true]], async v => {
    if (v === 'ac') duzenleAc(t.id);
    if (v === 'yazdir') { K.duz = { t }; yazdirAc(t); }
    if (v === 'cogalt') { const y = JSON.parse(JSON.stringify(t)); y.id = bId(); y.ad += ' (kopya)'; y.olustu = y.degisti = Date.now(); y.ogeler.forEach(o => o.id = bId()); await BDepo.koy(y); K.tasarimlar.unshift(y); etiketlerCiz(); }
    if (v === 'sil') { if (!confirm(`"${t.ad}" silinsin mi?`)) return; await BDepo.sil(t.id); K.tasarimlar = K.tasarimlar.filter(x => x !== t); etiketlerCiz(); }
  });
}

/* ═════════ Etiket tasarımcısı ═════════ */
function duzenleAc(id) {
  const t = K.tasarimlar.find(x => x.id === id); if (!t) return;
  K.duz = { t, sec: null, gecmis: [JSON.stringify(t)], ileri: [] };
  document.body.classList.add('bk-duz-acik');
  $('#app').innerHTML = `
  <div class="bk-duz">
    <header class="bk-duz-bas">
      <button class="icon-btn" data-action="k-duz-kapat" title="Geri">${IC.back}</button>
      <input class="bk-ad" id="kAd" value="${esc(t.ad)}" maxlength="80" aria-label="Etiketin adı">
      <button class="icon-btn" data-action="k-geri-al" title="Geri al">${IC.undo || '↶'}</button>
      <div class="spacer"></div>
      <button class="btn primary" data-action="k-yazdir">${IC.yazici}<span>Yazdır / PDF</span></button>
    </header>
    <div class="bk-duz-govde">
      <div class="bk-araclar">${[['barkod', 'Barkod', 'barkod'], ['yazi', 'Yazı', 'yaziI'], ['alan', 'Alan', 'alanI'], ['cizgi', 'Çizgi', 'cizgiI'], ['kutu', 'Kutu', 'kutuI'], ['resim', 'Logo', 'resimI']].map(([k, n, ic]) => `<button data-action="k-ekle" data-k="${k}" title="${n} ekle">${IC[ic]}<span>${n}</span></button>`).join('')}</div>
      <div class="bk-tuval" id="kTuval"><div class="bk-etiket" id="kEtiket"><div class="bk-etiket-svg" id="kSvg"></div><div class="bk-katman" id="kKatman"></div></div></div>
      <aside class="bk-ozellik" id="kOz"></aside>
    </div>
  </div>`;
  $('#kAd').addEventListener('change', e => { t.ad = e.target.value.trim() || 'Etiket'; kaydet(); });
  duzCiz(); ozellikCiz();
  tuvalOlaylari();
}
let kaydetT = 0;
function kaydet(gecmiseEkle = true) {
  const D = K.duz, t = D.t; t.degisti = Date.now();
  if (gecmiseEkle) { const s = JSON.stringify(t); if (D.gecmis[D.gecmis.length - 1] !== s) { D.gecmis.push(s); if (D.gecmis.length > 80) D.gecmis.shift(); } }
  clearTimeout(kaydetT); kaydetT = setTimeout(() => BDepo.koy(t), 400);
}
function olcek() { const tv = $('#kTuval'), t = K.duz.t; return Math.max(2, Math.min((tv.clientWidth - 48) / t.w, (tv.clientHeight - 48) / t.h, 14)); }
function duzCiz() {
  const D = K.duz, t = D.t, k = D.k = olcek(), et = $('#kEtiket');
  et.style.width = t.w * k + 'px'; et.style.height = t.h * k + 'px';
  et.style.setProperty('--mm', k + 'px');
  $('#kSvg').innerHTML = etiketSvg(t, t.alanlar, { ekran: true });
  $('#kKatman').innerHTML = t.ogeler.map(o => {
    const cizgi = o.tip === 'cizgi', x = Math.min(o.x, o.x + o.w), y = Math.min(o.y, o.y + o.h), w = Math.max(Math.abs(o.w), cizgi ? 1.5 : 0), h = Math.max(Math.abs(o.h), cizgi ? 1.5 : 0);
    return `<div class="bk-oge ${D.sec === o.id ? 'secili' : ''} ${o.kilit ? 'kilit' : ''}" data-id="${o.id}" style="left:${(cizgi && !o.w ? x - 0.75 : x) * k}px;top:${(cizgi && !o.h ? y - 0.75 : y) * k}px;width:${w * k}px;height:${h * k}px">${D.sec === o.id && !o.kilit ? '<i class="bk-tut" data-t="br"></i><i class="bk-tut" data-t="r"></i><i class="bk-tut" data-t="b"></i>' : ''}</div>`;
  }).join('');
}
window.addEventListener('resize', () => { if (K.duz && $('#kEtiket')) duzCiz(); });
function tuvalOlaylari() {
  const kat = $('#kKatman'), tv = $('#kTuval'); let is = null;
  const yuvarla = v => Math.round(v * 2) / 2;
  tv.addEventListener('pointerdown', e => {
    const D = K.duz, el = e.target.closest('.bk-oge');
    if (!el) { if (e.target === tv || e.target.closest('#kSvg')) { D.sec = null; duzCiz(); ozellikCiz(); } return; }
    const o = D.t.ogeler.find(x => x.id === el.dataset.id); if (!o) return;
    if (D.sec !== o.id) { D.sec = o.id; duzCiz(); ozellikCiz(); }
    if (o.kilit) return;
    const tut = e.target.closest('.bk-tut')?.dataset.t;
    is = { o, tut, x: e.clientX, y: e.clientY, ox: o.x, oy: o.y, ow: o.w, oh: o.h, tasindi: false };
    tv.setPointerCapture(e.pointerId); e.preventDefault();
  });
  tv.addEventListener('pointermove', e => {
    if (!is) return;
    const k = K.duz.k, dx = (e.clientX - is.x) / k, dy = (e.clientY - is.y) / k, o = is.o, t = K.duz.t;
    if (Math.abs(dx) + Math.abs(dy) > 0.2) is.tasindi = true;
    if (!is.tut) { o.x = yuvarla(Math.min(t.w - 1, Math.max(-o.w + 1, is.ox + dx))); o.y = yuvarla(Math.min(t.h - 1, Math.max(-o.h + 1, is.oy + dy))); }
    else {
      if (is.tut.includes('r')) o.w = Math.max(o.tip === 'cizgi' ? -999 : 2, yuvarla(is.ow + dx));
      if (is.tut.includes('b')) o.h = Math.max(o.tip === 'cizgi' ? -999 : 2, yuvarla(is.oh + dy));
      if (is.tut === 'br' && o.tip === 'barkod' && /qr|datamatrix/.test(o.tur)) o.h = o.w;
    }
    duzCiz(); ozellikDegerleri();
  });
  const bitir = () => { if (is?.tasindi) kaydet(); is = null; };
  tv.addEventListener('pointerup', bitir); tv.addEventListener('pointercancel', bitir);
}
document.addEventListener('keydown', e => {
  const D = K.duz; if (!D || !$('#kEtiket') || $('#modal').innerHTML || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) return;
  const o = D.t.ogeler.find(x => x.id === D.sec);
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); geriAl(); return; }
  if (!o) return;
  const adim = e.shiftKey ? 1 : 0.5;
  if (e.key === 'ArrowLeft') o.x -= adim; else if (e.key === 'ArrowRight') o.x += adim; else if (e.key === 'ArrowUp') o.y -= adim; else if (e.key === 'ArrowDown') o.y += adim;
  else if (e.key === 'Delete' || e.key === 'Backspace') { D.t.ogeler = D.t.ogeler.filter(x => x !== o); D.sec = null; kaydet(); duzCiz(); ozellikCiz(); return; }
  else return;
  e.preventDefault(); kaydet(); duzCiz(); ozellikDegerleri();
});
function geriAl() { const D = K.duz; if (D.gecmis.length < 2) return; D.gecmis.pop(); const t = JSON.parse(D.gecmis[D.gecmis.length - 1]); Object.assign(D.t, t); D.sec = D.t.ogeler.some(o => o.id === D.sec) ? D.sec : null; BDepo.koy(D.t); $('#kAd').value = D.t.ad; duzCiz(); ozellikCiz(); }
function ogeEkle(tip) {
  const D = K.duz, t = D.t, cx = t.w / 2, cy = t.h / 2;
  const o = { id: bId(), tip };
  if (tip === 'barkod') Object.assign(o, { w: Math.min(t.w - 4, 40), h: Math.min(t.h - 4, 18), tur: 'code128', veri: '{{kod}}' }), t.alanlar.kod ??= 'ABC-123';
  if (tip === 'yazi') Object.assign(o, { w: Math.min(t.w - 4, 30), h: 6, metin: 'Yazı', boy: 10, hiza: 'orta' });
  if (tip === 'alan') { o.tip = 'yazi'; const ad = prompt('Alanın adı (ör. fiyat, ad, stokKodu):', 'fiyat'); if (!ad) return; const a = ad.trim().replace(/[{}\s]+/g, ''); t.alanlar[a] ??= 'Örnek'; Object.assign(o, { w: Math.min(t.w - 4, 30), h: 6, metin: `{{${a}}}`, boy: 10, hiza: 'orta' }); }
  if (tip === 'cizgi') Object.assign(o, { w: Math.min(t.w - 4, 30), h: 0, kalinlik: 0.3 });
  if (tip === 'kutu') Object.assign(o, { w: Math.min(t.w - 4, 30), h: Math.min(t.h - 4, 15), kalinlik: 0.3, kose: 1 });
  if (tip === 'resim') { return resimSec(src => { const im = new Image(); im.onload = () => { const w = Math.min(t.w - 4, 20), h = w * im.height / im.width; Object.assign(o, { w, h: Math.min(h, t.h - 4), src }); o.x = cx - o.w / 2; o.y = cy - o.h / 2; t.ogeler.push(o); D.sec = o.id; kaydet(); duzCiz(); ozellikCiz(); }; im.src = src; }); }
  o.x = Math.round((cx - o.w / 2) * 2) / 2; o.y = Math.round((cy - (o.h || 0) / 2) * 2) / 2;
  t.ogeler.push(o); D.sec = o.id; kaydet(); duzCiz(); ozellikCiz();
}
function resimSec(cb) {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = () => { const f = inp.files[0]; if (!f) return; const im = new Image(), u = URL.createObjectURL(f); im.onload = () => { const k = Math.min(1, 800 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); cb(c.toDataURL('image/png')); }; im.src = u; };
  inp.click();
}
// Özellik paneli
function ozellikCiz() {
  const D = K.duz, t = D.t, o = t.ogeler.find(x => x.id === D.sec), el = $('#kOz'); if (!el) return;
  const sayi = (ad, k, v, adim = 0.5, min) => `<label class="bk-l kucuk">${ad}<input type="number" step="${adim}" ${min != null ? `min="${min}"` : ''} data-oz="${k}" value="${+(+v).toFixed(2)}"></label>`;
  const alanlar = alanlariBul(t);
  if (!o) {
    el.innerHTML = `<h3>Etiket</h3>
      <div class="bk-iki">${sayi('Genişlik (mm)', 'tw', t.w, 1, 5)}${sayi('Yükseklik (mm)', 'th', t.h, 1, 5)}</div>
      <label class="bk-l kucuk">Köşe (sadece önizleme)<input type="number" step="0.5" min="0" data-oz="tkose" value="${t.kose || 0}"></label>
      <h3>Alanlar <small>örnek değerler</small></h3>
      <p class="muted sm">Yazı ve barkodlarda {{alan}} şeklinde yazılan yerler basarken listeden ya da sayaçtan doldurulur. {{tarih}} bugünün tarihidir.</p>
      ${alanlar.map(a => `<label class="bk-l kucuk">{{${esc(a)}}}<input data-alan="${esc(a)}" value="${esc(t.alanlar[a] ?? '')}"></label>`).join('') || '<p class="muted sm">Henüz alan yok. "Alan" düğmesiyle ekleyebilirsin.</p>'}
      <p class="muted sm">Bir öğeyi seçip ayarlarını değiştirebilir, ok tuşlarıyla 0,5 mm kaydırabilirsin.</p>`;
  } else {
    let ozel = '';
    if (o.tip === 'barkod') ozel = `
      <label class="bk-l kucuk">Tür<select data-oz="tur">${Object.entries(TURLER).map(([k, v]) => `<option value="${k}" ${o.tur === k ? 'selected' : ''}>${v.ad}</option>`).join('')}</select></label>
      <label class="bk-l kucuk">Veri <small>(sabit ya da {{alan}})</small><input data-oz="veri" value="${esc(o.veri)}" spellcheck="false"></label>
      ${alanSecici(t, 'veri')}
      ${/qr|datamatrix/.test(o.tur) ? '' : `<label class="bk-kutu"><input type="checkbox" data-ozk="yazi" ${o.yazi !== false ? 'checked' : ''}> Rakamları yaz</label>
      <label class="bk-l kucuk">Çubuk genişliği<select data-oz="modul"><option value="">Kutuya sığdır</option>${[0.25, 0.264, 0.3, 0.33, 0.4, 0.5].map(v => `<option value="${v}" ${+o.modul === v ? 'selected' : ''}>${sayiTR(v, 3)} mm</option>`).join('')}</select></label>`}
      <label class="bk-l kucuk">Renk<input type="color" data-oz="renk" value="${o.renk || '#000000'}"></label>
      <div class="bk-dg-k" id="kOgeDog"></div>`;
    if (o.tip === 'yazi') ozel = `
      <label class="bk-l kucuk">Yazı <small>({{alan}} kullanabilirsin)</small><textarea data-oz="metin" rows="2">${esc(o.metin)}</textarea></label>
      ${alanSecici(t, 'metin')}
      <div class="bk-iki"><label class="bk-l kucuk">Yazı tipi<select data-oz="font">${Object.entries(YAZI_TIPI).map(([k, v]) => `<option value="${k}" ${(o.font || 'sans') === k ? 'selected' : ''}>${v.ad}</option>`).join('')}</select></label>${sayi('Boyut (punto)', 'boy', o.boy || 10, 0.5, 3)}</div>
      <div class="bk-dugmeler">${[['sol', '⯇ Sol'], ['orta', 'Orta'], ['sag', 'Sağ ⯈']].map(([k, n]) => `<button class="${(o.hiza || 'sol') === k ? 'on' : ''}" data-hiza="${k}">${n}</button>`).join('')}<button class="${o.kalin ? 'on' : ''}" data-ac="kalin"><b>K</b></button><button class="${o.italik ? 'on' : ''}" data-ac="italik"><i>İ</i></button></div>
      <div class="bk-dugmeler">${[['ust', 'Üst'], ['orta', 'Orta'], ['alt', 'Alt']].map(([k, n]) => `<button class="${(o.dikey || 'orta') === k ? 'on' : ''}" data-dikey="${k}">${n}</button>`).join('')}</div>
      <label class="bk-kutu"><input type="checkbox" data-ozk="sigdir" ${o.sigdir !== false ? 'checked' : ''}> Kutuya sığmazsa küçült</label>
      <label class="bk-l kucuk">Renk<input type="color" data-oz="renk" value="${o.renk || '#000000'}"></label>`;
    if (o.tip === 'cizgi') ozel = `${sayi('Kalınlık (mm)', 'kalinlik', o.kalinlik || 0.3, 0.1, 0.1)}<label class="bk-l kucuk">Renk<input type="color" data-oz="renk" value="${o.renk || '#000000'}"></label>`;
    if (o.tip === 'kutu') ozel = `<div class="bk-iki">${sayi('Kenar (mm)', 'kalinlik', o.kalinlik ?? 0.3, 0.1, 0)}${sayi('Köşe (mm)', 'kose', o.kose || 0, 0.5, 0)}</div>
      <label class="bk-l kucuk">Kenar rengi<input type="color" data-oz="renk" value="${o.renk || '#000000'}"></label>
      <label class="bk-kutu"><input type="checkbox" data-ozk="dolu" ${o.dolgu ? 'checked' : ''}> İçini doldur</label>${o.dolgu ? `<label class="bk-l kucuk">Dolgu<input type="color" data-oz="dolgu" value="${o.dolgu}"></label>` : ''}`;
    if (o.tip === 'resim') ozel = `<button class="btn sm" data-action="k-resim-degis">${IC.resimI}Resmi değiştir</button><p class="muted sm">Logo yazıcıda net çıksın diye siyah-beyaz ve sade olması önerilir.</p>`;
    el.innerHTML = `<h3>${{ barkod: 'Barkod', yazi: 'Yazı', cizgi: 'Çizgi', kutu: 'Kutu', resim: 'Logo / resim' }[o.tip]}</h3>
      <div class="bk-iki">${sayi('X (mm)', 'x', o.x)}${sayi('Y (mm)', 'y', o.y)}${sayi(o.tip === 'cizgi' ? 'Uzunluk X' : 'Genişlik', 'w', o.w)}${sayi(o.tip === 'cizgi' ? 'Uzunluk Y' : 'Yükseklik', 'h', o.h)}</div>
      ${ozel}
      <div class="bk-dugmeler alt"><button data-ac2="ortala-y" title="Yatayda ortala">↔</button><button data-ac2="ortala-d" title="Dikeyde ortala">↕</button><button data-ac2="kopya">Çoğalt</button><button data-ac2="kilit">${o.kilit ? 'Kilidi aç' : 'Kilitle'}</button><button data-ac2="sil" class="tehlike">Sil</button></div>`;
    if (o.tip === 'barkod') ogeDogrula(o);
  }
  // Olaylar
  el.querySelectorAll('[data-oz]').forEach(i => i.addEventListener('input', () => {
    const k = i.dataset.oz, v = i.type === 'number' ? +i.value : i.value;
    if (k === 'tw') t.w = Math.max(5, v); else if (k === 'th') t.h = Math.max(5, v); else if (k === 'tkose') t.kose = v;
    else if (k === 'modul') o.modul = v ? +v : undefined;
    else { o[k] = v; if (k === 'tur' && /qr|datamatrix/.test(v)) { o.h = o.w = Math.min(o.w, o.h); } }
    kaydet(); duzCiz(); if (k === 'tur') ozellikCiz(); else if (o?.tip === 'barkod') ogeDogrula(o);
  }));
  el.querySelectorAll('[data-ozk]').forEach(i => i.addEventListener('change', () => { const k = i.dataset.ozk; if (k === 'dolu') o.dolgu = i.checked ? '#eeeeee' : null; else o[k] = i.checked; kaydet(); duzCiz(); ozellikCiz(); }));
  el.querySelectorAll('[data-alan]').forEach(i => i.addEventListener('input', () => { t.alanlar[i.dataset.alan] = i.value; kaydet(); duzCiz(); }));
  el.querySelectorAll('[data-hiza]').forEach(b => b.onclick = () => { o.hiza = b.dataset.hiza; kaydet(); duzCiz(); ozellikCiz(); });
  el.querySelectorAll('[data-dikey]').forEach(b => b.onclick = () => { o.dikey = b.dataset.dikey; kaydet(); duzCiz(); ozellikCiz(); });
  el.querySelectorAll('[data-ac]').forEach(b => b.onclick = () => { o[b.dataset.ac] = !o[b.dataset.ac]; kaydet(); duzCiz(); ozellikCiz(); });
  el.querySelectorAll('[data-alan-ekle]').forEach(s => s.onchange = () => { if (!s.value) return; const k = s.dataset.alanEkle; if (s.value === '+') { const a = prompt('Yeni alanın adı:'); if (!a) { s.value = ''; return; } const ad = a.trim().replace(/[{}\s]+/g, ''); t.alanlar[ad] ??= 'Örnek'; o[k] = (k === 'veri' ? '' : (o[k] || '') + (o[k] ? ' ' : '')) + `{{${ad}}}`; } else o[k] = (k === 'veri' ? '' : (o[k] || '') + (o[k] ? ' ' : '')) + `{{${s.value}}}`; kaydet(); duzCiz(); ozellikCiz(); });
  el.querySelectorAll('[data-ac2]').forEach(b => b.onclick = async () => {
    const a = b.dataset.ac2;
    if (a === 'ortala-y') o.x = Math.round((t.w - o.w) / 2 * 2) / 2;
    if (a === 'ortala-d') o.y = Math.round((t.h - o.h) / 2 * 2) / 2;
    if (a === 'kopya') { const y = { ...o, id: bId(), x: o.x + 2, y: o.y + 2 }; t.ogeler.push(y); D.sec = y.id; }
    if (a === 'kilit') o.kilit = !o.kilit;
    if (a === 'sil') { t.ogeler = t.ogeler.filter(x => x !== o); D.sec = null; }
    kaydet(); duzCiz(); ozellikCiz();
  });
}
function alanSecici(t, hedef) { const a = Object.keys(t.alanlar); return `<select class="bk-alan-sec" data-alan-ekle="${hedef}"><option value="">{{alan}} ekle…</option>${a.map(x => `<option value="${esc(x)}">{{${esc(x)}}}</option>`).join('')}<option value="tarih">{{tarih}} (bugün)</option><option value="+">+ Yeni alan…</option></select>`; }
function ozellikDegerleri() { const D = K.duz, o = D.t.ogeler.find(x => x.id === D.sec); if (!o) return; document.querySelectorAll('#kOz [data-oz]').forEach(i => { if (['x', 'y', 'w', 'h'].includes(i.dataset.oz)) i.value = +(+o[i.dataset.oz]).toFixed(2); }); }
let ogeDogT = 0;
function ogeDogrula(o) {
  clearTimeout(ogeDogT);
  ogeDogT = setTimeout(async () => {
    const el = $('#kOgeDog'); if (!el) return;
    const b = barkodYerlesim(o, K.duz.t.alanlar);
    if (b.hata) { el.innerHTML = `<span class="bk-dg kotu">${IC.uyari}${esc(b.hata)}</span>`; return; }
    const u = boyutUyarilari(o.tur, b.X, o.h, b.lay), d = await dogrula(b.lay, o.tur).catch(() => ({ durum: 'yok', mesaj: '' }));
    if (!$('#kOgeDog')) return;
    $('#kOgeDog').innerHTML = (d.durum === 'iyi' ? `<span class="bk-dg iyi">${IC.onay}Okunuyor · çubuk ${sayiTR(b.X, 3)} mm</span>` : `<span class="bk-dg ${d.durum}">${d.durum === 'kotu' ? IC.uyari : IC.bilgi}${esc(d.mesaj)}</span>`) + u.map(x => `<span class="bk-dg uyari">${IC.uyari}${esc(x)}</span>`).join('');
  }, 300);
}

/* ═════════ Yazdırma ═════════ */
function kagitAl(t) {
  const ozel = store.get('barkodOzelKagit', { a4: true, sutun: 3, satir: 8, ew: t.w, eh: t.h, ust: 10, sol: 5, ay: 2, dy: 2 });
  const id = t.kagit || store.get('barkodSonKagit') || 'a4-24';
  const k = id === 'ozel' ? { ...KAGITLAR.find(x => x.id === 'ozel'), ...ozel } : KAGITLAR.find(x => x.id === id) || KAGITLAR[0];
  return { ...k, id: k.id || id };
}
function yazdirAc(t) {
  const barkodAlani = (t.ogeler.find(o => o.tip === 'barkod' && /\{\{\s*([^}\s]+)\s*\}\}/.test(o.veri || ''))?.veri.match(/\{\{\s*([^}\s]+)\s*\}\}/) || [])[1];
  const Y = store.get('barkodYazdir_' + t.id, { tur: 'tek', adet: 1, satirlar: [], sayac: { alan: barkodAlani || alanlariBul(t)[0] || 'kod', onek: '', baslangic: 1, adim: 1, adet: 24, hane: 4, sonek: '', tekrar: 1 } });
  const ayar = { ...store.get('barkodYaziciAyar', { kaymaX: 0, kaymaY: 0, kesim: false }), atla: 0 };   // atlama her basımda sıfırdan (unutulup boş sayfa basılmasın)
  const alanlar = alanlariBul(t);
  let kagit = kagitAl(t);
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet bk-yazdir"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Yazdır / PDF — ${esc(t.ad)}</h3></header>
    <div class="bk-yaz-govde">
      <div class="bk-yaz-sol">
        <section><h4>Ne basılacak?</h4>
          <div class="seg bk-seg" id="kYTur">${[['tek', 'Aynı etiket'], ['liste', 'Liste / Excel'], ['sayac', 'Sıra numarası']].map(([k, n]) => `<button class="${Y.tur === k ? 'on' : ''}" data-k="${k}">${n}</button>`).join('')}</div>
          <div id="kYVeri"></div>
        </section>
        <section><h4>Kâğıt</h4>
          <select id="kKagit">${KAGITLAR.map(x => `<option value="${x.id}" ${kagit.id === x.id ? 'selected' : ''}>${esc(x.ad)}</option>`).join('')}</select>
          <div id="kOzelKagit"></div>
          <div class="bk-uyari-k" id="kKagitUyari"></div>
        </section>
        <section><h4>Yazıcı ayarı</h4>
          <div class="bk-iki"><label class="bk-l kucuk">Sağa kaydır (mm)<input type="number" step="0.5" id="kKX" value="${ayar.kaymaX}"></label><label class="bk-l kucuk">Aşağı kaydır (mm)<input type="number" step="0.5" id="kKY" value="${ayar.kaymaY}"></label></div>
          <label class="bk-l kucuk">İlk sayfada atlanacak etiket (yarım kullanılmış kâğıt)<input type="number" min="0" step="1" id="kAtla" value="${ayar.atla}"></label>
          <label class="bk-kutu"><input type="checkbox" id="kKesim" ${ayar.kesim ? 'checked' : ''}> Etiket kenarlarını çiz (kesim çizgisi)</label>
          <button class="btn sm" id="kDeneme">${IC.yazici}Hizalama deneme sayfası (PDF)</button>
          <p class="muted sm">Yazdırırken ölçeği <b>%100 / Gerçek boyut</b> seç, "sayfaya sığdır"ı kapat. Etiketler kayıyorsa önce deneme sayfasını bas, farkı yukarıya yaz.</p>
        </section>
      </div>
      <div class="bk-yaz-sag">
        <div class="bk-yaz-ozet" id="kYOzet"></div>
        <div class="bk-sayfalar" id="kSayfalar"></div>
        <div class="bk-ilerleme" id="kIl" hidden><i></i><span></span></div>
        <div class="bk-eylemler"><button class="btn primary" id="kPdf">${IC.indir}PDF oluştur</button>${navigator.share ? `<button class="btn" id="kPdfPaylas">${IC.paylas}Paylaş</button>` : ''}</div>
      </div>
    </div></div></div>`;
  const kaydetY = () => { store.set('barkodYazdir_' + t.id, Y); store.set('barkodYaziciAyar', ayar); };
  const veriCiz = () => {
    const el = $('#kYVeri');
    if (Y.tur === 'tek') el.innerHTML = `${alanlar.map(a => `<label class="bk-l kucuk">${esc(a)}<input data-tek="${esc(a)}" value="${esc((Y.veri || {})[a] ?? t.alanlar[a] ?? '')}"></label>`).join('')}<label class="bk-l kucuk">Adet<input type="number" min="1" max="5000" id="kAdet" value="${Y.adet || 1}"></label>`;
    if (Y.tur === 'liste') el.innerHTML = `<div class="bk-eylemler"><button class="btn sm" id="kCsv">${IC.csv}Excel / CSV aç</button><button class="btn sm" id="kCsvOrnek">${IC.indir}Örnek dosya</button><button class="btn sm" id="kSatirEkle">${IC.plus}Satır</button></div>
      <p class="muted sm">Sütun adları alanlarla aynı olmalı: ${[...alanlar, 'adet'].map(a => `<b>${esc(a)}</b>`).join(', ')}. "adet" sütunu her satırdan kaç tane basılacağını belirler. Excel'de "Farklı kaydet → CSV" seç.</p>
      <div class="bk-tablo-k"><table class="bk-tablo"><thead><tr>${[...alanlar, 'adet'].map(a => `<th>${esc(a)}</th>`).join('')}<th></th></tr></thead><tbody>${(Y.satirlar || []).map((s, i) => `<tr>${[...alanlar, 'adet'].map(a => `<td><input data-h="${i}" data-a="${esc(a)}" value="${esc(s[a] ?? (a === 'adet' ? 1 : ''))}"></td>`).join('')}<td><button class="icon-btn sm" data-sil="${i}">×</button></td></tr>`).join('')}</tbody></table></div>
      ${!(Y.satirlar || []).length ? '<p class="muted sm">Liste boş. CSV aç ya da satır ekle.</p>' : ''}`;
    if (Y.tur === 'sayac') { const S = Y.sayac; el.innerHTML = `<label class="bk-l kucuk">Hangi alan sayılsın?<select id="kSAlan">${(alanlar.length ? alanlar : ['kod']).map(a => `<option ${S.alan === a ? 'selected' : ''}>${esc(a)}</option>`).join('')}</select></label>
      <div class="bk-iki"><label class="bk-l kucuk">Önek<input data-s="onek" value="${esc(S.onek)}" placeholder="DMR-"></label><label class="bk-l kucuk">Sonek<input data-s="sonek" value="${esc(S.sonek)}"></label>
      <label class="bk-l kucuk">Başlangıç<input type="number" data-s="baslangic" value="${S.baslangic}"></label><label class="bk-l kucuk">Adım<input type="number" data-s="adim" value="${S.adim}"></label>
      <label class="bk-l kucuk">Kaç etiket<input type="number" min="1" max="5000" data-s="adet" value="${S.adet}"></label><label class="bk-l kucuk">Hane (sıfır doldur)<input type="number" min="0" max="12" data-s="hane" value="${S.hane}"></label>
      <label class="bk-l kucuk">Her numaradan<input type="number" min="1" max="20" data-s="tekrar" value="${S.tekrar || 1}"></label></div>
      <p class="muted sm" id="kSOrnek"></p>`; }
    bagla();
  };
  const bagla = () => {
    document.querySelectorAll('[data-tek]').forEach(i => i.oninput = () => { (Y.veri ||= {})[i.dataset.tek] = i.value; guncelle(); });
    if ($('#kAdet')) $('#kAdet').oninput = e => { Y.adet = Math.max(1, Math.min(5000, +e.target.value || 1)); guncelle(); };
    document.querySelectorAll('[data-h]').forEach(i => i.oninput = () => { Y.satirlar[+i.dataset.h][i.dataset.a] = i.value; guncelle(); });
    document.querySelectorAll('[data-sil]').forEach(b => b.onclick = () => { Y.satirlar.splice(+b.dataset.sil, 1); veriCiz(); guncelle(); });
    if ($('#kSatirEkle')) $('#kSatirEkle').onclick = () => { (Y.satirlar ||= []).push({ ...Object.fromEntries(alanlar.map(a => [a, t.alanlar[a] ?? ''])), adet: 1 }); veriCiz(); guncelle(); };
    if ($('#kCsv')) $('#kCsv').onclick = () => csvAc(rows => {
      const sut = Object.keys(rows[0] || {}), eksik = alanlar.filter(a => !sut.includes(a)), fazla = sut.filter(x => x !== 'adet' && !alanlar.includes(x));
      Y.satirlar = rows; veriCiz(); guncelle();
      toast(eksik.length ? `${rows.length} satır alındı · eşleşmeyen sütun: ${fazla.join(', ') || '-'} · boş kalan alan: ${eksik.join(', ')}` : `${rows.length} satır alındı`);
    });
    if ($('#kCsvOrnek')) $('#kCsvOrnek').onclick = () => indir(new Blob(['﻿' + [[...alanlar, 'adet'].join(';'), [...alanlar.map(a => t.alanlar[a] ?? ''), 1].join(';')].join('\n')], { type: 'text/csv;charset=utf-8' }), 'etiket-listesi.csv');
    if ($('#kSAlan')) $('#kSAlan').onchange = e => { Y.sayac.alan = e.target.value; guncelle(); };
    document.querySelectorAll('[data-s]').forEach(i => i.oninput = () => { const k = i.dataset.s; Y.sayac[k] = i.type === 'number' ? +i.value : i.value; guncelle(); });
  };
  const kagitCiz = () => {
    const el = $('#kOzelKagit');
    if (kagit.id !== 'ozel') { el.innerHTML = ''; return; }
    el.innerHTML = `<div class="bk-iki">${[['sutun', 'Sütun', 1], ['satir', 'Satır', 1], ['ew', 'Etiket gen. (mm)', 0.1], ['eh', 'Etiket yük. (mm)', 0.1], ['sol', 'Sol kenar (mm)', 0.1], ['ust', 'Üst kenar (mm)', 0.1], ['ay', 'Yatay aralık (mm)', 0.1], ['dy', 'Dikey aralık (mm)', 0.1]].map(([k, n, s]) => `<label class="bk-l kucuk">${n}<input type="number" step="${s}" min="0" data-k="${k}" value="${kagit[k]}"></label>`).join('')}</div>
      <label class="bk-kutu"><input type="checkbox" id="kOzelRulo" ${kagit.rulo ? 'checked' : ''}> Rulo (her etiket ayrı sayfa)</label>`;
    el.querySelectorAll('[data-k]').forEach(i => i.oninput = () => { kagit[i.dataset.k] = +i.value; store.set('barkodOzelKagit', kagit); guncelle(); });
    $('#kOzelRulo').onchange = e => { kagit.rulo = e.target.checked; kagit.a4 = !kagit.rulo; store.set('barkodOzelKagit', kagit); guncelle(); };
  };
  let sayfalar = [];
  const guncelle = () => {
    kaydetY();
    const plan = sayfaPlani(kagit), etiketler = etiketListesi(Y, t);
    sayfalar = sayfalaraBol(etiketler, plan, kagit.rulo ? 0 : ayar.atla);
    const hatali = etiketler.filter(v => t.ogeler.some(o => o.tip === 'barkod' && barkodYerlesim(o, v).hata)).length;
    const uy = [];
    if (t.w > kagit.ew + 0.01 || t.h > kagit.eh + 0.01) uy.push(`Etiket (${sayiTR(t.w)}×${sayiTR(t.h)} mm) kâğıttaki etiketten (${sayiTR(kagit.ew)}×${sayiTR(kagit.eh)} mm) büyük; kenarlar kesilir. Tasarımda ölçüyü değiştir.`);
    else if (Math.abs(t.w - kagit.ew) > 1 || Math.abs(t.h - kagit.eh) > 1) uy.push(`Etiket kâğıttaki yerinden küçük; ortalanarak basılır.`);
    if (!kagit.rulo && (plan.hucreler.some(h => h.x + kagit.ew > plan.sw + 0.1 || h.y + kagit.eh > plan.sh + 0.1))) uy.push('Etiketler sayfanın dışına taşıyor; ölçüleri kontrol et.');
    $('#kKagitUyari').innerHTML = uy.map(x => `<div>${IC.uyari}<span>${esc(x)}</span></div>`).join('');
    if (Y.tur === 'sayac' && $('#kSOrnek')) { const S = Y.sayac, f = n => (S.onek || '') + String(n).padStart(S.hane || 0, '0') + (S.sonek || ''); $('#kSOrnek').innerHTML = `Örnek: <b>${esc(f(S.baslangic))}</b>, <b>${esc(f(S.baslangic + S.adim))}</b> … <b>${esc(f(S.baslangic + (S.adet - 1) * S.adim))}</b>`; }
    $('#kYOzet').innerHTML = `<b>${etiketler.length}</b> etiket · <b>${sayfalar.length}</b> sayfa · ${esc(kagit.ad || 'Özel ölçü')}${hatali ? ` <span class="bk-kirmizi">· ${hatali} etikette barkod hatalı (boş ya da geçersiz veri)</span>` : ''}`;
    const goster = sayfalar.slice(0, 6);
    $('#kSayfalar').innerHTML = goster.map((s, i) => `<div class="bk-sayfa-on ${kagit.rulo ? 'rulo' : ''}"><div class="bk-kagit" style="aspect-ratio:${plan.sw}/${plan.sh}">${sayfaSvg(t, plan, kagit, s, { kaymaX: ayar.kaymaX, kaymaY: ayar.kaymaY })}</div><span>${i + 1}</span></div>`).join('') + (sayfalar.length > 6 ? `<div class="bk-sayfa-on daha">+${sayfalar.length - 6} sayfa</div>` : '');
    document.querySelectorAll('#kPdf, #kPdfPaylas').forEach(b => b.disabled = !etiketler.length);
  };
  document.querySelectorAll('#kYTur button').forEach(b => b.onclick = () => { Y.tur = b.dataset.k; document.querySelectorAll('#kYTur button').forEach(x => x.classList.toggle('on', x === b)); veriCiz(); guncelle(); });
  $('#kKagit').onchange = e => { const id = e.target.value; kagit = id === 'ozel' ? { ...KAGITLAR.find(x => x.id === 'ozel'), ...store.get('barkodOzelKagit', { a4: true, sutun: 3, satir: 8, ew: t.w, eh: t.h, ust: 10, sol: 5, ay: 2, dy: 2 }), id: 'ozel' } : KAGITLAR.find(x => x.id === id); t.kagit = id; store.set('barkodSonKagit', id); BDepo.koy(t); kagitCiz(); guncelle(); };
  [['#kKX', 'kaymaX'], ['#kKY', 'kaymaY'], ['#kAtla', 'atla']].forEach(([s, k]) => $(s).oninput = e => { ayar[k] = +e.target.value || 0; guncelle(); });
  $('#kKesim').onchange = e => { ayar.kesim = e.target.checked; kaydetY(); };
  const uret = async (deneme) => {
    const il = $('#kIl'), ilerle = (oran, yazi) => { il.hidden = false; il.querySelector('i').style.width = Math.round(oran * 100) + '%'; il.querySelector('span').textContent = yazi; };
    document.querySelectorAll('.bk-yazdir .btn').forEach(b => b.disabled = true);
    try {
      await zxingYukle().catch(() => {});
      const pdf = await pdfUret(t, kagit, deneme ? [[]] : sayfalar, { ...ayar, deneme, ilerle });
      il.querySelector('span').textContent = `Hazır · ${pdf.size < 1048576 ? Math.max(1, Math.round(pdf.size / 1024)) + ' KB' : (pdf.size / 1048576).toLocaleString('tr-TR', { maximumFractionDigits: 1 }) + ' MB'}`;
      return new File([pdf], (deneme ? 'hizalama-deneme' : t.ad.replace(/[\\/:*?"<>|]/g, '-')) + '.pdf', { type: 'application/pdf' });
    } catch (e) { toast('PDF oluşturulamadı: ' + e.message); return null; }
    finally { document.querySelectorAll('.bk-yazdir .btn').forEach(b => b.disabled = false); }
  };
  $('#kPdf').onclick = async () => { const f = await uret(false); if (f) { indir(f, f.name); toast('PDF indirildi · Yazdırırken ölçek %100 olsun'); } };
  if ($('#kPdfPaylas')) $('#kPdfPaylas').onclick = async () => { const f = await uret(false); if (f) { try { await navigator.share({ files: [f], title: t.ad }); } catch {} } };
  $('#kDeneme').onclick = async () => { const f = await uret(true); if (f) indir(f, f.name); };
  veriCiz(); kagitCiz(); guncelle();
}
function csvAc(cb) {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.csv,text/csv,.txt';
  inp.onchange = async () => {
    const f = inp.files[0]; if (!f) return;
    let metin = await f.text(); if (/�/.test(metin)) { metin = new TextDecoder('windows-1254').decode(await f.arrayBuffer()); }   // Excel'in Türkçe kodlaması
    metin = metin.replace(/^﻿/, '');
    const ilk = metin.split(/\r?\n/)[0], ayr = (ilk.match(/;/g) || []).length >= (ilk.match(/,/g) || []).length ? ';' : ilk.includes('\t') ? '\t' : ',';
    const satirlar = []; let s = [], h = '', q = false;
    for (let i = 0; i < metin.length; i++) {
      const c = metin[i];
      if (q) { if (c === '"' && metin[i + 1] === '"') { h += '"'; i++; } else if (c === '"') q = false; else h += c; }
      else if (c === '"') q = true; else if (c === ayr) { s.push(h); h = ''; } else if (c === '\n' || c === '\r') { if (c === '\r' && metin[i + 1] === '\n') i++; s.push(h); h = ''; if (s.some(x => x.trim())) satirlar.push(s); s = []; } else h += c;
    }
    s.push(h); if (s.some(x => x.trim())) satirlar.push(s);
    if (satirlar.length < 2) return toast('CSV\'de başlık satırı ve en az bir veri satırı olmalı');
    const bas = satirlar.shift().map(x => x.trim());
    cb(satirlar.slice(0, 5000).map(r => Object.fromEntries(bas.map((b, i) => [b, (r[i] ?? '').trim()]))));
  };
  inp.click();
}

/* ═════════ Araçlar ═════════ */
function araclarCiz() {
  const M = store.get('barkodMagaza', { onek: '20', sayac: 1, verilen: [] }), Tz = store.get('barkodTerazi', { onek: '27', pluHane: 5, tur: 'agirlik', degerHane: 5 });
  $('#kGovde').innerHTML = `
  <div class="bk-sayfa bk-araclar-s">
    <section class="bk-kart">
      <div class="bk-baslik"><span class="bk-ic">${IC.magaza}</span><h3>Mağaza içi numara</h3></div>
      <p class="muted sm">GS1 numarası olmayan, sadece <b>kendi dükkânında</b> kasada okutacağın ürünler için. 2 ile başlayan EAN-13'ler bu iş için ayrılmıştır; başka mağazada ya da internette geçmez. Verilen numaralar kaydedilir, aynısı tekrar verilmez.</p>
      <div class="bk-iki"><label class="bk-l kucuk">Önek<select id="kMOnek">${['20', '21', '22', '23', '24', '25', '26'].map(x => `<option ${M.onek === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label><label class="bk-l kucuk">Ürün adı (isteğe bağlı)<input id="kMAd" placeholder="Ev yapımı reçel"></label></div>
      <div class="bk-eylemler"><button class="btn primary" data-action="k-magaza-yeni">${IC.plus}Yeni numara ver</button></div>
      <div id="kMSonuc"></div>
      ${M.verilen.length ? `<details class="bk-verilen"><summary>Verilen numaralar (${M.verilen.length})</summary><div class="bk-tablo-k"><table class="bk-tablo"><tbody>${M.verilen.slice().reverse().map(v => `<tr><td><b>${esc(v.n)}</b></td><td>${esc(v.ad || '')}</td><td>${esc(new Date(v.t).toLocaleDateString('tr-TR'))}</td><td><button class="btn sm" data-action="k-kullan" data-tur="ean13" data-v="${esc(v.n)}">Barkod</button></td></tr>`).join('')}</tbody></table></div><button class="btn sm" data-action="k-magaza-csv">${IC.indir}CSV indir</button></details>` : ''}
    </section>
    <section class="bk-kart">
      <div class="bk-baslik"><span class="bk-ic">${IC.terazi}</span><h3>Terazi barkodu</h3></div>
      <p class="muted sm">Tartılı ürünler için içinde ağırlık ya da fiyat taşıyan EAN-13. Yapısı terazinin ayarıyla aynı olmalı (terazinin kılavuzunda "barkod formatı" diye geçer).</p>
      <div class="bk-iki">
        <label class="bk-l kucuk">Önek (2 hane)<input id="kTOnek" maxlength="2" inputmode="numeric" value="${esc(Tz.onek)}"></label>
        <label class="bk-l kucuk">İçindeki değer<select id="kTTur"><option value="agirlik" ${Tz.tur === 'agirlik' ? 'selected' : ''}>Ağırlık (gram)</option><option value="fiyat" ${Tz.tur === 'fiyat' ? 'selected' : ''}>Fiyat (kuruş)</option></select></label>
        <label class="bk-l kucuk">Ürün kodu (PLU) hane<select id="kTPlu">${[4, 5, 6].map(x => `<option ${Tz.pluHane === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label>
        <label class="bk-l kucuk">Değer hanesi<input disabled value="${10 - Tz.pluHane}"></label>
        <label class="bk-l kucuk">Ürün kodu (PLU)<input id="kTP" inputmode="numeric" placeholder="00125"></label>
        <label class="bk-l kucuk">${Tz.tur === 'agirlik' ? 'Ağırlık (kg)' : 'Fiyat (₺)'}<input id="kTD" inputmode="decimal" placeholder="${Tz.tur === 'agirlik' ? '0,750' : '45,90'}"></label>
      </div>
      <div class="bk-terazi-on" id="kTOn"></div>
      <details class="bk-verilen"><summary>Okutulan terazi barkodunu çöz</summary><label class="bk-l kucuk">13 haneli barkod<input id="kTCoz" inputmode="numeric" placeholder="2700125007503"></label><div id="kTCozS" class="muted sm"></div></details>
    </section>
    <section class="bk-kart">
      <div class="bk-baslik"><span class="bk-ic">${IC.bilgi}</span><h3>GS1 Türkiye rehberi</h3></div>
      <ul class="bk-liste">
        <li><b>Neden gerekli?</b> Zincir marketler, Trendyol, Hepsiburada ve Amazon gibi yerlerde satılan ürünlerin barkodu GS1'den alınmış olmalı. Rastgele numara başka bir firmanın ürünüyle çakışabilir.</li>
        <li><b>Türkiye'de zorunlu mu?</b> Kanunen değil; ama satış yapacağın yer ister.</li>
        <li><b>Nasıl alınır?</b> GS1 Türkiye'ye çevrim içi başvuru: başvuru formu, noter onaylı taahhütname, faaliyet belgesi, gelir tablosu ya da ticaret sicil gazetesi, ödeme dekontu. Genelde 7-15 iş gününde firma öneki verilir.</li>
        <li><b>Ücret?</b> Kaç ürüne numara vereceğine göre değişir; güncel tutarı GS1 Türkiye'nin sitesinden hesapla.</li>
        <li><b>Sonra?</b> Firma önekinin ardına kendi ürün numaranı ekle; son haneyi bu uygulama hesaplar. Her renk, beden, tat için ayrı numara gerekir.</li>
      </ul>
      <a class="btn" href="https://www.gs1tr.org" target="_blank" rel="noopener">GS1 Türkiye sitesi</a>
    </section>
    <section class="bk-kart">
      <div class="bk-baslik"><span class="bk-ic">${IC.onay}</span><h3>Kontrol hanesi hesapla</h3></div>
      <p class="muted sm">EAN-13, EAN-8, UPC, ITF-14 ve GTIN için son haneyi hesaplar ya da yazdığın numarayı kontrol eder.</p>
      <label class="bk-l kucuk">Numara<input id="kKH" inputmode="numeric" placeholder="869050400001"></label><div id="kKHS"></div>
    </section>
  </div>`;
  $('#kMOnek').onchange = e => { const m = store.get('barkodMagaza', M); m.onek = e.target.value; store.set('barkodMagaza', m); };
  const tKaydet = () => { store.set('barkodTerazi', Tz); };
  $('#kTOnek').oninput = e => { Tz.onek = e.target.value.replace(/\D/g, '').slice(0, 2); tKaydet(); teraziOn(Tz); };
  $('#kTTur').onchange = e => { Tz.tur = e.target.value; tKaydet(); araclarCiz(); };
  $('#kTPlu').onchange = e => { Tz.pluHane = +e.target.value; tKaydet(); araclarCiz(); };
  ['#kTP', '#kTD'].forEach(s => $(s).oninput = () => teraziOn(Tz));
  $('#kTCoz').oninput = e => {
    const v = e.target.value.replace(/\D/g, ''), el = $('#kTCozS');
    if (v.length !== 13) { el.textContent = ''; return; }
    if (+v[12] !== mod10(v.slice(0, 12))) { el.textContent = 'Kontrol hanesi tutmuyor; yanlış okunmuş olabilir.'; return; }
    const plu = v.slice(2, 2 + Tz.pluHane), d = +v.slice(2 + Tz.pluHane, 12);
    el.innerHTML = `Önek <b>${v.slice(0, 2)}</b> · ürün kodu <b>${plu}</b> · ${Tz.tur === 'agirlik' ? `ağırlık <b>${(d / 1000).toLocaleString('tr-TR', { minimumFractionDigits: 3 })} kg</b>` : `fiyat <b>${(d / 100).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</b>`}`;
  };
  $('#kKH').oninput = e => {
    const v = e.target.value.replace(/\D/g, ''), el = $('#kKHS'); if (v.length < 7 || v.length > 17) { el.innerHTML = ''; return; }
    const AD = { 8: 'EAN-8', 12: 'UPC-A', 13: 'EAN-13', 14: 'ITF-14 / GTIN-14' };
    const kontrol = (ikincil) => { if (!AD[v.length]) return ''; const govde = v.slice(0, -1), k = mod10(govde); return +v.slice(-1) === k ? `<span class="bk-dg iyi">${IC.onay}${AD[v.length]} olarak doğru (kontrol hanesi ${k})</span>` : `<span class="bk-dg ${ikincil ? 'yok' : 'kotu'}">${ikincil ? IC.bilgi : IC.uyari}${AD[v.length]} olarak yanlış: son hane ${k} olmalı → <b>${govde + k}</b></span>`; };
    const ekle = () => { const k = mod10(v), hedef = AD[v.length + 1]; return `<span class="bk-dg ${hedef ? 'iyi' : 'yok'}">${hedef ? IC.onay : IC.bilgi}${hedef ? hedef + ' için k' : 'K'}ontrol hanesi <b>${k}</b> → <b>${v + k}</b></span>`; };
    el.innerHTML = v.length === 12 || !AD[v.length] ? ekle() + kontrol(true) : kontrol() + (AD[v.length + 1] ? ekle() : '');
  };

}
function teraziOn(Tz) {
  const el = $('#kTOn'), p = $('#kTP').value.replace(/\D/g, ''), dr = $('#kTD').value.replace(',', '.'), dh = 10 - Tz.pluHane;
  if (!p || !dr || Tz.onek.length !== 2) { el.innerHTML = ''; return; }
  const deger = Math.round(+dr * (Tz.tur === 'agirlik' ? 1000 : 100));
  if (p.length > Tz.pluHane) { el.innerHTML = `<span class="bk-dg kotu">${IC.uyari}Ürün kodu en fazla ${Tz.pluHane} hane</span>`; return; }
  if (!isFinite(deger) || deger < 0 || String(deger).length > dh) { el.innerHTML = `<span class="bk-dg kotu">${IC.uyari}Değer ${dh} haneye sığmıyor</span>`; return; }
  const govde = Tz.onek + p.padStart(Tz.pluHane, '0') + String(deger).padStart(dh, '0'), m = ean13(govde);
  el.innerHTML = `<div class="bk-on-kutu kucuk">${olcusuz(svgYap(yerlesim(m, { modul: 0.33, yukseklik: 22 })))}</div><div><b>${m.numara}</b> <button class="btn sm" data-action="k-kullan" data-tur="ean13" data-v="${m.numara}">Barkod sayfasında aç</button></div>`;
}

/* ═════════ Ayarlar ve yardımcılar ═════════ */
function ayarAc() {
  const t = store.get('theme', 'light');
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet settings"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Ayarlar</h3></header>
    <div class="set-body">
      <section><h4>Görünüm</h4><div class="seg yon-seg">${[['light', 'Cam'], ['dark', 'Koyu'], ['auto', 'Otomatik'], ['flat', 'Düz']].map(([k, n]) => `<button class="${t === k ? 'on' : ''}" data-action="k-tema" data-t="${k}">${n}</button>`).join('')}</div></section>
      <section><h4>Verilerin</h4><div class="set-row"><div><b>Bu cihazda</b><span>${K.tasarimlar.length} etiket tasarımı. Giriş yok; hiçbir şey sunucuya gönderilmez. Tarayıcı verilerini silersen tasarımlar da silinir.</span></div><button class="btn" data-action="k-yedek">${IC.indir}Yedek indir</button></div>
        <div class="set-row"><div><b>Yedekten geri yükle</b><span>Daha önce indirdiğin yedek dosyasını seç.</span></div><button class="btn" data-action="k-yedek-yukle">Seç</button></div></section>
      <section><h4>Uygulama</h4>${typeof aboutRow === 'function' ? aboutRow() : ''}
        <p class="muted sm">Barkodlar uluslararası standartlara göre bu cihazda çizilir. Doğrulama için açık kaynak ZXing okuyucusu kullanılır (Apache 2.0).</p></section>
    </div></div></div>`;
}
function kPop(el, ogeler, sec) {
  document.querySelector('.bk-pop')?.remove();
  const p = document.createElement('div'); p.className = 'bk-pop';
  p.innerHTML = ogeler.map(([v, ic, ad, tehlike]) => `<button data-v="${v}" ${tehlike ? 'class="tehlike"' : ''}>${ic || ''}<span>${esc(ad)}</span></button>`).join('');
  document.body.appendChild(p);
  const r = el.getBoundingClientRect(), w = p.offsetWidth, h = p.offsetHeight;
  p.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.right - w)) + 'px'; p.style.top = (r.bottom + h + 8 > innerHeight ? Math.max(8, r.top - h - 4) : r.bottom + 4) + 'px';
  const kapat = e => { if (e && p.contains(e.target)) return; p.remove(); document.removeEventListener('pointerdown', kapat, true); };
  setTimeout(() => document.addEventListener('pointerdown', kapat, true), 0);
  p.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; kapat(); sec(b.dataset.v); });
}

/* ═════════ Olaylar ═════════ */
Object.assign(ACTIONS, {
  'k-sekme': el => { K.sekme = el.dataset.k; store.set('barkodSekme', K.sekme); sekmeCiz(); },
  'k-ayar': () => ayarAc(), settings: () => ayarAc(),
  'k-tema': el => { store.set('theme', el.dataset.t); applyTheme(el.dataset.t); ayarAc(); },
  'k-tur': el => { K.tek.tur = el.dataset.k; K.tek.veri = ''; if (/qr|datamatrix/.test(el.dataset.k)) K.tek.modul = Math.max(0.4, K.tek.modul); else if (K.tek.modul > 0.66) K.tek.modul = 0.33; store.set('barkodTek', K.tek); olusturCiz(); },
  'k-ornek': () => { K.tek.veri = TURLER[K.tek.tur].ornek; $('#kVeri').value = K.tek.veri; store.set('barkodTek', K.tek); tekGuncelle(); },
  'k-duzelt': el => { K.tek.veri = el.dataset.v; $('#kVeri').value = el.dataset.v; store.set('barkodTek', K.tek); tekGuncelle(); },
  'k-sihirbaz': () => sihirbaz(),
  'k-gs1': () => gs1Doldur(s => { K.tek.veri = s; store.set('barkodTek', K.tek); olusturCiz(); }),
  'k-png': async () => indir(await tekPng(600), dosyaAdi() + '.png'),
  'k-svg': () => indir(new Blob([svgYap(tekSon.lay, K.tek.renk, '#fff')], { type: 'image/svg+xml' }), dosyaAdi() + '.svg'),
  'k-pdf': async () => {   // Barkodun gerçek ölçüsünde tek sayfa
    const L = tekSon.lay, t = { ad: dosyaAdi(), w: L.w + 4, h: L.h + 4, ogeler: [], alanlar: {} };
    const doc = await PDFLib.PDFDocument.create(), p = doc.addPage([t.w * MM_PT, t.h * MM_PT]), png = await doc.embedPng(await (await tekPng(600)).arrayBuffer());
    p.drawImage(png, { x: 2 * MM_PT, y: 2 * MM_PT, width: L.w * MM_PT, height: L.h * MM_PT });
    indir(new Blob([await doc.save()], { type: 'application/pdf' }), dosyaAdi() + '.pdf');
  },
  'k-paylas': async () => { const f = new File([await tekPng(600)], dosyaAdi() + '.png', { type: 'image/png' }); try { await navigator.share({ files: [f] }); } catch {} },
  'k-etikete': () => tekEtiket(),
  'k-yeni': () => yeniEtiketSec(),
  'k-ac': (el, e) => { if (e?.target.closest('.bk-ek-menu')) return; duzenleAc(el.dataset.id); },
  'k-ek-menu': (el, e) => { e?.stopPropagation(); etiketMenu(el); },
  'k-duz-kapat': async () => { await BDepo.koy(K.duz.t); K.duz = null; document.body.classList.remove('bk-duz-acik'); K.tasarimlar.sort((a, b) => b.degisti - a.degisti); K.sekme = 'etiketler'; kabuk(); sekmeCiz(); },
  'k-geri-al': () => geriAl(),
  'k-ekle': el => ogeEkle(el.dataset.k),
  'k-resim-degis': () => { const D = K.duz, o = D.t.ogeler.find(x => x.id === D.sec); resimSec(src => { o.src = src; kaydet(); duzCiz(); }); },
  'k-yazdir': () => { BDepo.koy(K.duz.t); yazdirAc(K.duz.t); },
  'k-magaza-yeni': () => {
    const M = store.get('barkodMagaza', { onek: '20', sayac: 1, verilen: [] }), onek = $('#kMOnek').value;
    let n, g = 0; do { const govde = onek + String(M.sayac++).padStart(10, '0'); n = govde + mod10(govde); g++; } while (M.verilen.some(v => v.n === n) && g < 1000);
    M.verilen.push({ n, ad: $('#kMAd').value.trim(), t: Date.now() }); M.onek = onek; store.set('barkodMagaza', M);
    const m = ean13(n);
    araclarCiz();
    $('#kMSonuc').innerHTML = `<div class="bk-terazi-on"><div class="bk-on-kutu kucuk">${olcusuz(svgYap(yerlesim(m, { modul: 0.33, yukseklik: 22 })))}</div><div><b>${n}</b> verildi. <button class="btn sm" data-action="k-kullan" data-tur="ean13" data-v="${n}">Barkod sayfasında aç</button></div></div>`;
  },
  'k-magaza-csv': () => { const M = store.get('barkodMagaza', { verilen: [] }); indir(new Blob(['﻿' + [['numara', 'urun', 'tarih'], ...M.verilen.map(v => [v.n, v.ad || '', new Date(v.t).toLocaleDateString('tr-TR')])].map(r => r.join(';')).join('\n')], { type: 'text/csv;charset=utf-8' }), 'magaza-ici-numaralar.csv'); },
  'k-kullan': el => { K.tek.tur = el.dataset.tur; K.tek.veri = el.dataset.v; store.set('barkodTek', K.tek); K.sekme = 'olustur'; store.set('barkodSekme', 'olustur'); sekmeCiz(); },
  'k-yedek': () => indir(new Blob([JSON.stringify({ surum: 1, tasarimlar: K.tasarimlar, magaza: store.get('barkodMagaza'), terazi: store.get('barkodTerazi') }, null, 1)], { type: 'application/json' }), 'barkod-yedek.json'),
  'k-yedek-yukle': () => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json'; inp.onchange = async () => { try { const j = JSON.parse(await inp.files[0].text()); let n = 0; for (const t of (Array.isArray(j.tasarimlar) ? j.tasarimlar : []).slice(0, 500)) { const tt = tasarimTemizle(t); if (!tt) continue; await BDepo.koy(tt); n++; } if (j.magaza && Array.isArray(j.magaza.verilen)) store.set('barkodMagaza', { onek: /^2[0-6]$/.test(j.magaza.onek) ? j.magaza.onek : '20', sayac: Math.max(1, parseInt(j.magaza.sayac, 10) || 1), verilen: j.magaza.verilen.filter(v => v && /^\d{13}$/.test(v.n)).map(v => ({ n: v.n, ad: String(v.ad || '').slice(0, 80), t: +v.t || Date.now() })) }); if (j.terazi && typeof j.terazi === 'object') store.set('barkodTerazi', { onek: /^\d{2}$/.test(j.terazi.onek) ? j.terazi.onek : '27', pluHane: [4, 5, 6].includes(+j.terazi.pluHane) ? +j.terazi.pluHane : 5, tur: j.terazi.tur === 'fiyat' ? 'fiyat' : 'agirlik' }); K.tasarimlar = (await BDepo.hepsi()).map(tasarimTemizle).filter(Boolean); closeModal(); toast(`${n} tasarım geri yüklendi`); sekmeCiz(); } catch { toast('Yedek dosyası okunamadı'); } }; inp.click(); }
});
