/* ───────────── PDF ─────────────
   PDF araçları: birleştir, böl, sayfa düzenle, fotoğraftan PDF, PDF'ten resim, sayfa numarası, filigran, üst/alt bilgi,
   kırp, A4'e çevir, 2'si/4'ü 1 arada, gri tonlama, yazıyı ve resimleri çıkar, form doldur, belge bilgilerini temizle.
   Giriş gerekmez. Dosyalar bu cihazdan hiç çıkmaz; hiçbir şey kaydedilmez (sadece son seçtiğin ayarlar hatırlanır). */
'use strict';

window.APP_NAME = 'PDF';
window.APP_ICON = 'pdf-apple.png?v=8';
window.APP_LEAD = 'Birleştir, böl, sayfaları düzenle, fotoğraftan PDF yap, numara ve filigran ekle, form doldur. Dosyaların cihazından çıkmaz. Ücretsiz, reklamsız.';

const PSVG = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
Object.assign(IC, {
  pdfI: PSVG('<path d="M6 2.8h8.5L19 7.3v13.9H6z"/><path d="M14.3 2.8v4.7H19"/><path d="M8.6 12.2h6.8M8.6 15.4h6.8M8.6 18.6h4"/>'),
  birlestir: PSVG('<rect x="3" y="3" width="8" height="10.5" rx="1.3"/><rect x="13" y="3" width="8" height="10.5" rx="1.3"/><path d="M7 16v2.2a1.8 1.8 0 0 0 1.8 1.8h6.4a1.8 1.8 0 0 0 1.8-1.8V16M12 17.5V22"/>'),
  bol: PSVG('<rect x="4" y="2.8" width="16" height="18.4" rx="1.6"/><path d="M2 12h3M8 12h2.5M13.5 12H16M19 12h3" stroke-width="2"/>'),
  duzenle: PSVG('<rect x="3" y="3" width="7.5" height="7.5" rx="1.3"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.3"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.3"/><path d="M17.25 14v6.5M14 17.25h6.5"/>'),
  foto: PSVG('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>'),
  resimI: PSVG('<path d="M6 2.8h8.5L19 7.3v6"/><path d="M6 13V2.8"/><rect x="3" y="13" width="12" height="8.5" rx="1.4"/><path d="m15 19-3-2.7-6 5.2"/><path d="M19 15v6M16.5 18.5 19 21l2.5-2.5"/>'),
  numara: PSVG('<path d="M6 2.8h8.5L19 7.3v13.9H6z"/><path d="M10.5 17.5h4M11.5 13.5l1.5-1.2v5.2"/>'),
  filigran: PSVG('<path d="M6 2.8h8.5L19 7.3v13.9H6z"/><path d="m8.5 17.5 7-7"/><path d="m10 19 7-7" opacity=".45"/>'),
  ustAlt: PSVG('<path d="M6 2.8h12v18.4H6z"/><path d="M8.5 5.8h7M8.5 18.2h7" stroke-width="2.2"/><path d="M8.5 10h7M8.5 13h5" opacity=".45"/>'),
  kirp: PSVG('<path d="M6 2v16h16"/><path d="M2 6h16v16"/>'),
  a4: PSVG('<rect x="5" y="2.8" width="14" height="18.4" rx="1.4"/><path d="M9 15l2-6 2 6M9.7 13h2.6M14.5 9v6"/>'),
  iki: PSVG('<rect x="2.5" y="5" width="19" height="14" rx="1.6"/><path d="M12 5v14"/><path d="M5 9h4.5M5 12h4.5M14.5 9H19M14.5 12H19" opacity=".55"/>'),
  gri: PSVG('<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>'),
  metinI: PSVG('<path d="M6 2.8h8.5L19 7.3v13.9H6z"/><path d="M9 11h6M12 11v7"/>'),
  form: PSVG('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 8h10M7 12.5h3"/><rect x="12" y="11" width="5" height="3" rx=".8"/><path d="m7 16.8 1.3 1.2L11 15.5"/>'),
  temizle: PSVG('<path d="M12 2.8 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.7 4.3-1.3 7.5-5.1 7.5-9.7V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>'),
  geri: PSVG('<path d="M15 5l-7 7 7 7"/>'),
  yukari: PSVG('<path d="M12 19V5M6 11l6-6 6 6"/>'), geriAlI: PSVG('<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>'), solOk: PSVG('<path d="M19 12H5M11 6l-6 6 6 6"/>'), sagOk: PSVG('<path d="M5 12h14M13 6l6 6-6 6"/>'), asagi: PSVG('<path d="M12 5v14M6 13l6 6 6-6"/>'),
  tut: PSVG('<circle cx="9" cy="6" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="6" r="1.2" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="18" r="1.2" fill="currentColor" stroke="none"/>'),
  dondurSag: PSVG('<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>'),
  dondurSol: PSVG('<path d="M4 11a8 8 0 1 1 2.3 5.7"/><path d="M4 4v7h7"/>'),
  sil: PSVG('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
  arti: PSVG('<path d="M12 5v14M5 12h14"/>'),
  indir: PSVG('<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M5 19h14"/>'),
  paylas: PSVG('<path d="M12 3v12M7.5 7.5 12 3l4.5 4.5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>'),
  devam: PSVG('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  yukle: PSVG('<path d="M12 16V4M7.5 8.5 12 4l4.5 4.5"/><path d="M5 15v4h14v-4"/>'),
  kopya: PSVG('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>'),
  kilitI: PSVG('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  bulI: PSVG('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.4-4.4"/>')
});

/* ═════════ Araç listesi ═════════ */
const GRUPLAR = [['duzen', 'Sayfalar'], ['ekle', 'Üzerine ekle'], ['donustur', 'Dönüştür'], ['gizli', 'Gizlilik']];
const ARAC = {
  birlestir: { ad: 'Birleştir', grup: 'duzen', ic: 'birlestir', acik: 'Birden çok PDF\'i (ve fotoğrafı) tek dosyada topla.', kabul: ['pdf', 'resim'], coklu: true, dugme: 'Birleştir' },
  bol: { ad: 'Böl / sayfa al', grup: 'duzen', ic: 'bol', acik: 'İstediğin sayfaları ayrı PDF yap ya da belgeyi parçalara ayır.', kabul: ['pdf'], dugme: 'Ayır' },
  duzenle: { ad: 'Sayfaları düzenle', grup: 'duzen', ic: 'duzenle', acik: 'Sırala, döndür, sil, boş sayfa ekle.', kabul: ['pdf'], dugme: 'Kaydet' },
  kirp: { ad: 'Kenar kırp', grup: 'duzen', ic: 'kirp', acik: 'Sayfa kenarlarındaki boşluğu ya da istemediğin kısmı kes.', kabul: ['pdf'], dugme: 'Kırp' },
  a4: { ad: 'A4\'e çevir', grup: 'duzen', ic: 'a4', acik: 'Farklı boyutlardaki sayfaları A4 kâğıda sığdır.', kabul: ['pdf'], dugme: 'A4\'e çevir' },
  coklu: { ad: '2\'si 1 arada', grup: 'duzen', ic: 'iki', acik: 'İki ya da dört sayfayı tek kâğıda yerleştir, kâğıttan tasarruf et.', kabul: ['pdf'], dugme: 'Yerleştir' },
  numara: { ad: 'Sayfa numarası', grup: 'ekle', ic: 'numara', acik: 'Her sayfaya numara ekle: 1, 1 / 10, Sayfa 1…', kabul: ['pdf'], dugme: 'Numara ekle' },
  filigran: { ad: 'Filigran', grup: 'ekle', ic: 'filigran', acik: '"KOPYA", "Sadece … başvurusu içindir" gibi bir yazıyı sayfalara bas.', kabul: ['pdf'], dugme: 'Filigran ekle' },
  ustalt: { ad: 'Üst ve alt bilgi', grup: 'ekle', ic: 'ustAlt', acik: 'Sayfaların üstüne ve altına yazı, tarih, dosya adı ekle.', kabul: ['pdf'], dugme: 'Ekle' },
  form: { ad: 'Form doldur', grup: 'ekle', ic: 'form', acik: 'Doldurulabilir alanları olan PDF\'leri (dilekçe, başvuru) doldur.', kabul: ['pdf'], dugme: 'Kaydet' },
  foto: { ad: 'Fotoğraftan PDF', grup: 'donustur', ic: 'foto', acik: 'Fotoğrafları tek bir PDF dosyası yap.', kabul: ['resim'], coklu: true, dugme: 'PDF yap' },
  resim: { ad: 'PDF\'ten resim', grup: 'donustur', ic: 'resimI', acik: 'Sayfaları JPG ya da PNG resim olarak kaydet.', kabul: ['pdf'], dugme: 'Resme çevir' },
  gri: { ad: 'Gri tonlama', grup: 'donustur', ic: 'gri', acik: 'Renkli belgeyi siyah-beyaz yap (yazıcı mürekkebi için).', kabul: ['pdf'], dugme: 'Griye çevir' },
  metin: { ad: 'Yazıyı çıkar', grup: 'donustur', ic: 'metinI', acik: 'PDF\'teki yazıyı kopyalanabilir metin olarak al.', kabul: ['pdf'], dugme: 'Yazıyı çıkar' },
  resimler: { ad: 'Resimleri çıkar', grup: 'donustur', ic: 'foto', acik: 'PDF\'in içindeki fotoğrafları ve görselleri ayrı dosya olarak al.', kabul: ['pdf'], dugme: 'Resimleri çıkar' },
  bilgi: { ad: 'Bilgileri temizle', grup: 'gizli', ic: 'temizle', acik: 'Yazar adı, kullanılan program, tarihler gibi gizli belge bilgilerini gör ve sil.', kabul: ['pdf'], dugme: 'Temizle ve kaydet' }
};

const P = {
  arac: null, dosyalar: [], sonuc: null, elde: null, calisiyor: false, iptal: false,
  secim: store.get('pdfSecim', {}),
  plan: null, secili: new Set(), geriAl: [],      // sayfa düzenle
  bolSecili: new Set(),                             // böl
  form: null, bilgi: null                           // form doldur, bilgiler
};
const S0 = {
  bol: { mod: 'sec', n: 1, aralik: '' },
  kirp: { ust: 10, sag: 10, alt: 10, sol: 10, kapsam: 'hepsi', aralik: '', sil: false },
  a4: { yon: 'otomatik', kenar: 0 },
  coklu: { adet: 2, cizgi: true, kenar: 8 },
  numara: { konum: 'ao', bicim: 'n/N', baslangic: 1, atla: false, boyut: 10 },
  filigran: { metin: 'KOPYA', konum: 'orta', aci: 45, saydam: 20, renk: 'kirmizi', kapsam: 'hepsi', aralik: '' },
  ustalt: { us: '', uo: '', ua: '', as: '', ao: '', aa: 'Sayfa {sayfa} / {toplam}', boyut: 9, kenar: 10 },
  foto: { boyut: 'a4', kenar: 'ince', kalite: 'yuksek' },
  resim: { tur: 'jpg', dpi: 150, kapsam: 'hepsi', aralik: '' },
  gri: { dpi: 150 },
  form: { duzlestir: false },
  bilgi: { hepsiniSil: true }
};
const sec = () => (P.secim[P.arac] = Object.assign({}, S0[P.arac] || {}, P.secim[P.arac] || {}));
const secKaydet = () => store.set('pdfSecim', P.secim);
const boyutYaz = n => n >= 1048576 ? (n / 1048576).toLocaleString('tr-TR', { maximumFractionDigits: 1 }) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
const tabanAd = ad => String(ad || 'belge').replace(/\.(pdf|jpe?g|png|webp|heic|heif|gif|bmp)$/i, '');
const pdfMi = f => f.type === 'application/pdf' || /\.pdf$/i.test(f.name);
const resimMi = f => /^image\//.test(f.type) || /\.(jpe?g|png|webp|heic|heif|gif|bmp)$/i.test(f.name);
let sira = 0;

/* ═════════ Başlangıç (giriş gerekmez) ═════════ */
document.removeEventListener('DOMContentLoaded', boot);
function pdfBaslat() {
  document.documentElement.classList.add('pa-html');
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  kabuk();
  const u = new URLSearchParams(location.search), a = u.get('arac');
  if (a && ARAC[a]) { history.replaceState(null, '', location.pathname + (DEMO ? '?demo' : '')); aracAc(a, true); }
  else anaCiz();
}
showLogin = msg => { if (msg) toast(msg); };
start = () => pdfBaslat();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pdfBaslat); else pdfBaslat();

function kabuk() {
  $('#app').innerHTML = `
  <div class="pa-kabuk">
    <header class="pa-bas">
      <button class="icon-btn pa-geri" data-action="p-ana" title="Araçlar">${IC.geri}</button>
      <div class="brand-mark sm">${IC.pdfI}</div><h1 id="paBaslik">PDF</h1>
      <div class="spacer"></div>
      <button class="icon-btn" data-action="p-ayar" title="Ayarlar">${IC.gear}</button>
    </header>
    <main class="pa-govde" id="pGovde"></main>
  </div>`;
}

/* ═════════ Ana ekran: araçlar ═════════ */
const ARAC_RENK = { birlestir: '#3d5afe', bol: '#0e9f6e', duzenle: '#d97706', kirp: '#0891b2', a4: '#475569', coklu: '#7c3aed', numara: '#6366f1', filigran: '#0d9488', ustalt: '#2563eb', form: '#9333ea',
  foto: '#db2777', resim: '#e11d48', gri: '#52525b', metin: '#ca8a04', resimler: '#c026d3', bilgi: '#334155' };
const HIZLI = ['birlestir', 'bol', 'duzenle', 'foto'];
const KISA_AD = { birlestir: 'Birleştir', bol: 'Böl', duzenle: 'Düzenle', foto: 'Fotoğraftan' };
function anaCiz() {
  P.arac = null; document.body.dataset.ekran = 'ana';
  $('#paBaslik').textContent = 'PDF';
  const satir = ([k, a]) => {
    const uygun = !P.elde || a.kabul.includes('pdf');
    return `<button class="pa-satir-arac ${uygun ? '' : 'soluk'}" data-action="p-arac" data-k="${k}"><i style="--r:${ARAC_RENK[k]}">${IC[a.ic]}</i><span><b>${a.ad}</b><small>${a.acik}</small></span><em>›</em></button>`;
  };
  const hero = P.elde
    ? `<div class="pa-hero elde"><div class="pa-hero-yazi"><small>Elindeki dosya</small><b>${esc(P.elde.ad)}</b><span>Bu dosyayla ne yapalım? Aşağıdan bir araç seç.</span>
        <button class="pa-hero-dugme" data-action="p-elde-birak">Başka dosya seç</button></div><div class="pa-hero-kagit"></div></div>`
    : `<div class="pa-hero" id="paHeroAlan"><div class="pa-hero-yazi"><b>PDF'ini seç</b><span>Ne yapmak istediğini sonra seçersin.<br>Dosya cihazından çıkmaz, internet gerekmez.</span>
        <label class="pa-hero-dugme">${IC.yukle}Dosya seç<input type="file" id="paHero" accept="application/pdf,.pdf,image/*" multiple hidden></label></div><div class="pa-hero-kagit"></div></div>`;
  $('#pGovde').innerHTML = `${hero}
    <div class="pa-hizli">${HIZLI.map(k => `<button data-action="p-arac" data-k="${k}" class="${P.elde && !ARAC[k].kabul.includes('pdf') ? 'soluk' : ''}"><i style="--r:${ARAC_RENK[k]}">${IC[ARAC[k].ic]}</i><span>${KISA_AD[k]}</span></button>`).join('')}</div>
    <div class="pa-gruplar-iki">${GRUPLAR.map(([g, n]) => `<section class="pa-grup"><h2>${n}</h2><div class="pa-liste">${Object.entries(ARAC).filter(([k, a]) => a.grup === g).map(satir).join('')}</div></section>`).join('')}</div>
    <p class="pa-giris">${IC.kilitI}<span>Dosyaların bu cihazdan hiç çıkmaz. İnternet olmadan da çalışır, sınır yok.</span></p>`;
  window.scrollTo(0, 0);
}
// Ana ekrandan dosya seçilince: fotoğraflar → Fotoğraftan PDF, birden çok PDF → Birleştir, tek PDF → araç seçtir
async function anaDosya(liste) {
  const pdfler = liste.filter(pdfMi), resimler = liste.filter(f => !pdfMi(f) && resimMi(f));
  if (!pdfler.length && !resimler.length) return toast('PDF ya da fotoğraf seç');
  if (!pdfler.length) { aracAc('foto'); return dosyaEkle(resimler); }
  if (pdfler.length > 1 || resimler.length) { aracAc('birlestir'); return dosyaEkle([...pdfler, ...resimler]); }
  const f = pdfler[0];
  P.elde = { ad: f.name, bytes: new Uint8Array(await f.arrayBuffer()) };
  anaCiz();
}

/* ═════════ Araç ekranı ═════════ */
function aracAc(k, ilk) {
  P.arac = k; P.dosyalar.forEach(dosyaKapat); P.dosyalar = []; P.sonuc = null; P.plan = null; P.secili = new Set(); P.geriAl = []; P.bolSecili = new Set(); P.form = null; P.bilgi = null;
  if (!ilk) history.pushState({ arac: k }, '', location.pathname + location.search + '#' + k);
  if (P.elde && ARAC[k].kabul.includes('pdf')) { const e = P.elde; P.elde = null; dosyaEkle([new File([e.bytes], e.ad, { type: 'application/pdf' })]); }
  aracCiz(); window.scrollTo(0, 0);
}
function aracCiz() {
  const A = ARAC[P.arac]; document.body.dataset.ekran = 'arac';
  $('#paBaslik').textContent = A.ad;
  const hazir = P.dosyalar.length > 0, bekliyor = P.dosyalar.some(d => d.yukleniyor);
  $('#pGovde').innerHTML = `
    <div class="pa-arac" id="paArac">
      <p class="pa-acik">${A.acik}</p>
      <section class="pa-dosya-alan" id="paDosyaAlan">${dosyaAlani()}</section>
      ${hazir && !bekliyor ? `<section class="pa-ayarlar" id="paAyar">${ayarCiz()}</section>
      <div class="pa-eylem"><button class="btn primary pa-yap" data-action="p-yap" ${P.calisiyor ? 'disabled' : ''}>${IC[A.ic]}${A.dugme}</button></div>` : ''}
      <section class="pa-sonuc" id="paSonuc">${sonucCiz()}</section>
      <div class="pa-ilerle" id="paIlerle" hidden><div class="pa-ilerle-in"><b id="paIlerleYazi">Hazırlanıyor…</b><div class="pa-cubuk"><i id="paCubuk"></i></div><button class="btn sm" data-action="p-iptal">İptal</button></div></div>
    </div>`;
  sonrakiCizim();
}
// Çizimden sonra: küçük resimler, önizlemeler
function sonrakiCizim() {
  kucukleriBagla();
  if (P.arac === 'kirp') kirpOnizle();
  if (P.arac === 'form' && P.form) formSayfalariCiz();
  if (P.sonuc?.onizle) sonucOnizle();
}

/* ═════════ Dosyalar ═════════ */
function dosyaAlani() {
  const A = ARAC[P.arac], kabulYazi = A.kabul.map(k => k === 'pdf' ? 'PDF' : 'fotoğraf').join(' ya da ');
  const secDugme = (metin, ana) => `<label class="btn ${ana ? 'primary' : ''} pa-sec">${IC.yukle}${metin}<input type="file" id="paGirdi" ${A.coklu ? 'multiple' : ''} accept="${A.kabul.map(k => k === 'pdf' ? 'application/pdf,.pdf' : 'image/*').join(',')}" hidden></label>`;
  if (!P.dosyalar.length) return `<div class="pa-birak" id="paBirak">
      ${IC.yukle}<b>${A.coklu ? 'Dosyaları' : 'Dosyayı'} buraya bırak</b><span>ya da</span>${secDugme(A.coklu ? 'Dosya seç' : 'Dosya seç', true)}
      <small>${kabulYazi}${A.coklu ? ' · birden çok seçebilirsin' : ''}</small></div>`;
  const liste = P.dosyalar.map((d, i) => `
    <div class="pa-dosya" data-i="${i}">
      ${A.coklu ? `<span class="pa-tutamak" data-tut="${i}" title="Sürükleyerek sırala">${IC.tut}</span>` : ''}
      <div class="pa-dosya-kucuk">${d.tur === 'resim' ? `<img src="${d.url}" alt="">` : d.yukleniyor ? '<i class="pa-don"></i>' : `<canvas class="pa-kucuk" data-d="${d.id}" data-no="1" data-g="64"></canvas>`}</div>
      <div class="pa-dosya-bilgi"><b>${esc(d.ad)}</b><span>${d.hata ? `<em class="pa-hata">${esc(d.hata)}</em>` : d.yukleniyor ? 'Açılıyor…' : `${d.tur === 'pdf' ? d.sayfa + ' sayfa · ' : ''}${boyutYaz(d.boy)}`}</span></div>
      ${A.coklu && P.dosyalar.length > 1 ? `<button class="icon-btn sm" data-action="p-yukari" data-i="${i}" title="Yukarı" ${i === 0 ? 'disabled' : ''}>${IC.yukari}</button><button class="icon-btn sm" data-action="p-asagi" data-i="${i}" title="Aşağı" ${i === P.dosyalar.length - 1 ? 'disabled' : ''}>${IC.asagi}</button>` : ''}
      <button class="icon-btn sm" data-action="p-dosya-sil" data-i="${i}" title="Çıkar">${IC.close}</button>
    </div>`).join('');
  return `<div class="pa-dosyalar" id="paDosyalar">${liste}</div>
    <div class="pa-dosya-alt">${A.coklu ? secDugme('Dosya ekle') : secDugme('Başka dosya seç')}${A.coklu && P.dosyalar.length > 1 ? `<span class="muted sm">${P.dosyalar.length} dosya · sırayı oklarla ya da sürükleyerek değiştir</span>` : ''}</div>`;
}
function dosyaKapat(d) { try { d.gor?.then(g => g?.loadingTask?.destroy?.()); } catch {} if (d.url) URL.revokeObjectURL(d.url); }
async function dosyaEkle(liste) {
  const A = ARAC[P.arac]; if (!A) return;
  let atlanan = 0; const yeniler = [];
  for (const f of liste) {
    const tur = pdfMi(f) ? 'pdf' : resimMi(f) ? 'resim' : null;
    if (!tur || !A.kabul.includes(tur)) { atlanan++; continue; }
    yeniler.push({ id: ++sira, ad: f.name || (tur === 'pdf' ? 'belge.pdf' : 'resim.jpg'), boy: f.size, tur, dosya: f, yukleniyor: tur === 'pdf', url: tur === 'resim' ? URL.createObjectURL(f) : null });
  }
  if (atlanan) toast(A.kabul.includes('resim') && !A.kabul.includes('pdf') ? 'Sadece fotoğraf seçebilirsin' : A.kabul.includes('resim') ? 'Sadece PDF ve fotoğraf eklenebilir' : 'Bu araç sadece PDF dosyalarıyla çalışır');
  if (!yeniler.length) return;
  if (!A.coklu) { P.dosyalar.forEach(dosyaKapat); P.dosyalar = [yeniler[0]]; } else P.dosyalar.push(...yeniler);
  P.sonuc = null; P.plan = null; P.form = null; P.bilgi = null; P.bolSecili = new Set();
  aracCiz();
  for (const d of yeniler.filter(x => x.tur === 'pdf')) {
    try {
      if (d.boy > 300 * 1048576) toast('Dosya çok büyük; telefonda yavaş çalışabilir');
      d.bytes = new Uint8Array(await d.dosya.arrayBuffer());
      d.gor = PDFIS.goruntuAc(d.bytes);
      const g = await d.gor; d.sayfa = g.numPages;
      await PDFIS.ac(d.bytes);   // korumalı mı? (pdf-lib açabiliyor mu)
    } catch (e) { d.hata = e.message || 'Açılamadı'; }
    d.yukleniyor = false;
  }
  if (P.dosyalar.some(d => d.hata) && !A.coklu) { /* hata dosya satırında görünür */ }
  if (P.arac === 'form' && P.dosyalar[0] && !P.dosyalar[0].hata) await formHazirla();
  if (P.arac === 'bilgi' && P.dosyalar[0] && !P.dosyalar[0].hata) { try { P.bilgi = await PDFIS.bilgi(P.dosyalar[0].bytes); } catch (e) { P.dosyalar[0].hata = e.message; } }
  if (P.arac === 'duzenle' && P.dosyalar[0] && !P.dosyalar[0].hata) P.plan = Array.from({ length: P.dosyalar[0].sayfa }, (_, i) => ({ k: i, d: 0, id: ++sira }));
  aracCiz();
}

/* ═════════ Küçük sayfa resimleri (görünür olunca çizilir) ═════════ */
let gozcu = null;
const kuyruk = []; let ciziyor = false;
function kucukleriBagla() {
  gozcu?.disconnect();
  gozcu = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { gozcu.unobserve(e.target); kuyruk.push(e.target); kuyrukIsle(); } }), { rootMargin: '300px' });
  document.querySelectorAll('canvas.pa-kucuk:not([data-ok])').forEach(c => gozcu.observe(c));
}
async function kuyrukIsle() {
  if (ciziyor) return; ciziyor = true;
  while (kuyruk.length) {
    const c = kuyruk.shift(); if (!c.isConnected) continue;
    const d = P.dosyalar.find(x => x.id === +c.dataset.d); if (!d?.gor) continue;
    try {
      const pdf = await d.gor, no = +c.dataset.no, p = await pdf.getPage(no), v1 = p.getViewport({ scale: 1 });
      const hedef = (+c.dataset.g || 140) * Math.min(2, devicePixelRatio || 1), s = hedef / Math.max(v1.width, v1.height), v = p.getViewport({ scale: s });
      c.width = Math.round(v.width); c.height = Math.round(v.height);
      const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
      await p.render({ canvasContext: g, viewport: v }).promise; p.cleanup();
      c.dataset.ok = 1; c.classList.add('hazir');
    } catch { c.dataset.ok = 1; }
  }
  ciziyor = false;
}

/* ═════════ Sayfa aralığı girişi ═════════ */
const kapsamCiz = (s, etiket = 'Hangi sayfalar') => `
  <div class="pa-satir"><span class="pa-et">${etiket}</span>
    <div class="seg">${[['hepsi', 'Hepsi'], ['secili', 'Seçtiklerim']].map(([k, n]) => `<button class="${s.kapsam === k ? 'on' : ''}" data-action="p-sec" data-k="kapsam" data-v="${k}">${n}</button>`).join('')}</div>
    ${s.kapsam === 'secili' ? `<input class="pa-girdi" data-s="aralik" value="${esc(s.aralik)}" placeholder="Ör. 1-3, 5, 8-" inputmode="numeric">` : ''}</div>`;
function kapsamAl(s, toplam) {
  if (s.kapsam !== 'secili') return null;
  const l = PDFIS.aralikCoz(s.aralik, toplam);
  if (!l?.length) throw new PDFIS.PdfHata('Hangi sayfalar olacağını yaz (ör. 1-3, 5)');
  return l;
}
const segCiz = (s, k, secenekler) => `<div class="seg">${secenekler.map(([v, n]) => `<button class="${String(s[k]) === String(v) ? 'on' : ''}" data-action="p-sec" data-k="${k}" data-v="${v}">${n}</button>`).join('')}</div>`;
const satir = (etiket, ic, not) => `<div class="pa-satir"><span class="pa-et">${etiket}</span>${ic}${not ? `<small class="pa-not">${not}</small>` : ''}</div>`;

/* ═════════ Araç ayarları ═════════ */
function ayarCiz() {
  const s = sec(), d = P.dosyalar[0];
  if (P.dosyalar.some(x => x.hata) && !ARAC[P.arac].coklu) return `<div class="pa-uyari">${IC.alert || ''}<span>${esc(d.hata)}</span></div>`;
  switch (P.arac) {
    case 'birlestir': return P.dosyalar.length < 2 ? `<p class="muted sm pa-ipucu">Birleştirmek için en az iki dosya ekle. Fotoğraf eklersen A4 sayfa olarak girer.</p>` : `<p class="muted sm pa-ipucu">Dosyalar bu sırayla tek PDF olacak: toplam ${P.dosyalar.reduce((t, x) => t + (x.tur === 'pdf' ? x.sayfa || 0 : 1), 0)} sayfa.</p>`;
    case 'bol': return bolAyar(s, d);
    case 'duzenle': return duzenleAyar(d);
    case 'kirp': return `
      <div class="pa-kirp">
        <div class="pa-kirp-on"><canvas id="paKirpTuval"></canvas><div class="pa-kirp-cerceve" id="paKirpCerceve"></div></div>
        <div class="pa-kirp-ayar">
          <div class="pa-kirp-izgara">${[['ust', 'Üst'], ['sol', 'Sol'], ['sag', 'Sağ'], ['alt', 'Alt']].map(([k, n]) => `<label class="pa-mm"><span>${n}</span><input type="number" min="0" max="300" step="1" data-s="${k}" value="${s[k]}"><i>mm</i></label>`).join('')}</div>
          <button class="btn sm" data-action="p-bos-bul">${IC.bulI}Boşlukları otomatik bul</button>
          ${kapsamCiz(s)}
          <label class="pa-anahtar"><input type="checkbox" data-s="sil" ${s.sil ? 'checked' : ''}><span>Kesilen kısmı dosyadan da sil</span></label>
          <p class="pa-not">${s.sil
            ? 'Kesilen kısım dosyadan tamamen silinir, kimse geri getiremez. Bunun için sayfa resme dönüşür: yazılar seçilemez ve aranamaz olur. Kimlik numarası gibi gizli bir şeyi kesip atmak için bunu kullan.'
            : 'Kesilen kısım gizlenir ama dosyanın içinde durur; başka bir programla geri getirilebilir. Yazılar seçilebilir kalır. Gizli bir bilgiyi kesip atacaksan “Kesilen kısmı dosyadan da sil”i seç.'}</p>
        </div>
      </div>`;
    case 'a4': return satir('Yön', segCiz(s, 'yon', [['otomatik', 'Otomatik'], ['dikey', 'Dikey'], ['yatay', 'Yatay']]), 'Otomatik: yatay sayfalar yatay A4\'e, dikeyler dikey A4\'e.')
      + satir('Kenar boşluğu', segCiz(s, 'kenar', [[0, 'Yok'], [5, 'İnce'], [12, 'Normal']]));
    case 'coklu': return satir('Bir kâğıtta', segCiz(s, 'adet', [[2, '2 sayfa'], [4, '4 sayfa']]), s.adet == 2 ? 'A4 yatay kâğıda yan yana iki sayfa.' : 'A4 dikey kâğıda 2×2 dört sayfa.')
      + satir('Sayfa çerçevesi', `<label class="pa-anahtar"><input type="checkbox" data-s="cizgi" ${s.cizgi ? 'checked' : ''}><span>İnce çizgi çiz</span></label>`)
      + `<p class="muted sm pa-ipucu">${d.sayfa} sayfa → ${Math.ceil(d.sayfa / s.adet)} kâğıt.</p>`;
    case 'numara': {
      const ornek = numaraOrnek(s, 1, d.sayfa);
      return satir('Yer', konumSecici(s.konum))
        + satir('Biçim', segCiz(s, 'bicim', [['n', '1'], ['n/N', '1 / ' + d.sayfa], ['Sn', 'Sayfa 1'], ['Sn/N', 'Sayfa 1 / ' + d.sayfa]]))
        + satir('Boyut', segCiz(s, 'boyut', [[8, 'Küçük'], [10, 'Orta'], [13, 'Büyük']]))
        + satir('Başlangıç', `<input class="pa-girdi kisa" type="number" min="0" max="9999" data-s="baslangic" value="${s.baslangic}">`)
        + satir('Kapak', `<label class="pa-anahtar"><input type="checkbox" data-s="atla" ${s.atla ? 'checked' : ''}><span>İlk sayfaya numara koyma</span></label>`)
        + `<p class="muted sm pa-ipucu">Örnek: “${esc(ornek)}”</p>`;
    }
    case 'filigran': {
      const oneriler = ['KOPYA', 'ASLI GİBİDİR', 'Sadece … başvurusu içindir', 'TASLAK', 'GİZLİ', new Date().toLocaleDateString('tr-TR') + ' tarihli işlem içindir'];
      return satir('Yazı', `<input class="pa-girdi genis" data-s="metin" value="${esc(s.metin)}" maxlength="80" placeholder="Filigran yazısı">`)
        + `<div class="pa-cipler">${oneriler.map(o => `<button class="pa-cip" data-action="p-filigran-oner" data-v="${esc(o)}">${esc(o)}</button>`).join('')}</div>`
        + satir('Yerleşim', segCiz(s, 'konum', [['orta', 'Ortada tek'], ['doseli', 'Sayfaya yayılmış']]))
        + satir('Açı', segCiz(s, 'aci', [[45, 'Çapraz'], [0, 'Yatay']]))
        + satir('Renk', `<div class="pa-renkler">${Object.entries(RENK).map(([k, [ad, r]]) => `<button class="pa-renk ${s.renk === k ? 'on' : ''}" style="--r:rgb(${r.map(x => Math.round(x * 255)).join(',')})" data-action="p-sec" data-k="renk" data-v="${k}" title="${ad}"></button>`).join('')}</div>`)
        + satir('Saydamlık', `<input type="range" min="8" max="70" step="1" data-s="saydam" value="${s.saydam}" class="pa-kaydirac"><b class="pa-deger" id="paSaydam">%${s.saydam}</b>`)
        + kapsamCiz(s);
    }
    case 'ustalt': return `<div class="pa-ustalt">
        ${[['us', 'Üst sol'], ['uo', 'Üst orta'], ['ua', 'Üst sağ'], ['as', 'Alt sol'], ['ao', 'Alt orta'], ['aa', 'Alt sağ']].map(([k, n]) => `<label><span>${n}</span><input class="pa-girdi" data-s="${k}" value="${esc(s[k])}" maxlength="120" data-yer="${k}"></label>`).join('')}
      </div>
      <div class="pa-cipler"><span class="muted sm">Eklenebilir:</span>${[['{sayfa}', 'Sayfa no'], ['{toplam}', 'Toplam sayfa'], ['{tarih}', 'Bugünün tarihi'], ['{dosya}', 'Dosya adı']].map(([v, n]) => `<button class="pa-cip" data-action="p-yer-tutucu" data-v="${v}">${n}</button>`).join('')}</div>`
      + satir('Yazı boyutu', segCiz(s, 'boyut', [[7, 'Küçük'], [9, 'Orta'], [12, 'Büyük']]))
      + satir('Kenardan uzaklık', segCiz(s, 'kenar', [[6, 'Yakın'], [10, 'Normal'], [16, 'Uzak']]));
    case 'form': return formAyar();
    case 'foto': return satir('Sayfa boyutu', segCiz(s, 'boyut', [['a4', 'A4'], ['resim', 'Fotoğraf kadar']]))
      + satir('Kenar boşluğu', segCiz(s, 'kenar', [['yok', 'Yok'], ['ince', 'İnce'], ['genis', 'Geniş']]))
      + satir('Kalite', segCiz(s, 'kalite', [['yuksek', 'Yüksek'], ['kucuk', 'Küçük dosya']]))
      + `<p class="muted sm pa-ipucu">${P.dosyalar.length} fotoğraf → ${P.dosyalar.length} sayfa. Fotoğraflar çekildikleri yöne göre düzeltilir.</p>`;
    case 'resim': return satir('Biçim', segCiz(s, 'tur', [['jpg', 'JPG'], ['png', 'PNG']]), s.tur === 'png' ? 'PNG daha net ama dosyası büyük.' : 'JPG küçük ve her yerde açılır.')
      + satir('Netlik', segCiz(s, 'dpi', [[100, 'Normal'], [150, 'İyi'], [300, 'Yüksek (baskı)']]))
      + kapsamCiz(s);
    case 'gri': return satir('Netlik', segCiz(s, 'dpi', [[100, 'Küçük dosya'], [150, 'İyi'], [300, 'Yüksek']]))
      + `<div class="pa-uyari">${IC.alert || ''}<span>Sayfalar resme dönüşür: yazılar seçilemez ve aranamaz hâle gelir. Belgenin aslını sakla.</span></div>`;
    case 'metin': case 'resimler': return '';
    case 'bilgi': return bilgiAyar(s);
  }
  return '';
}
const RENK = { kirmizi: ['Kırmızı', [0.7, 0.1, 0.1]], gri: ['Gri', [0.45, 0.45, 0.45]], mavi: ['Mavi', [0.1, 0.25, 0.65]], siyah: ['Siyah', [0, 0, 0]] };
function konumSecici(k) {
  const y = [['us', 'Üst sol'], ['uo', 'Üst orta'], ['ua', 'Üst sağ'], ['as', 'Alt sol'], ['ao', 'Alt orta'], ['aa', 'Alt sağ']];
  return `<div class="pa-konum">${y.map(([v, n]) => `<button class="${k === v ? 'on' : ''}" data-action="p-sec" data-k="konum" data-v="${v}" title="${n}" aria-label="${n}"><i></i></button>`).join('')}</div>`;
}
const numaraSablon = s => ({ 'n': '{sayfa}', 'n/N': '{sayfa} / {toplam}', 'Sn': 'Sayfa {sayfa}', 'Sn/N': 'Sayfa {sayfa} / {toplam}' }[s.bicim] || '{sayfa}');
function numaraOrnek(s, i, n) { const b = +s.baslangic || 0, top = (s.atla ? n - 1 : n) + b - 1; return numaraSablon(s).replace('{sayfa}', b + i - 1).replace('{toplam}', top); }

/* ═════════ Böl ═════════ */
function bolAyar(s, d) {
  const n = d.sayfa;
  let ic = satir('Nasıl', segCiz(s, 'mod', [['sec', 'Sayfa seç'], ['her', 'Her sayfa ayrı'], ['n', 'Her N sayfada'], ['aralik', 'Aralıklar']]));
  if (s.mod === 'sec') {
    const l = [...P.bolSecili].sort((a, b) => a - b);
    ic += `<div class="pa-sec-bar"><input class="pa-girdi" id="paBolYazi" value="${esc(PDFIS.araliktanYazi(l))}" placeholder="Sayfalara dokun ya da yaz: 1-3, 5"><button class="btn sm" data-action="p-bol-hepsi">Hepsini seç</button><button class="btn sm" data-action="p-bol-temizle">Temizle</button></div>
      <div class="pa-izgara">${Array.from({ length: n }, (_, i) => `<button class="pa-sayfa ${P.bolSecili.has(i) ? 'secili' : ''}" data-action="p-bol-sec" data-i="${i}"><canvas class="pa-kucuk" data-d="${d.id}" data-no="${i + 1}" data-g="140"></canvas><span>${i + 1}</span></button>`).join('')}</div>
      <p class="muted sm pa-ipucu">${l.length ? `${l.length} sayfa seçildi → tek PDF` : 'Yeni dosyaya girecek sayfalara dokun.'}</p>`;
  } else if (s.mod === 'her') ic += `<p class="muted sm pa-ipucu">${n} ayrı PDF olacak; hepsi tek .zip dosyasında iner.</p>`;
  else if (s.mod === 'n') ic += satir('Kaç sayfada bir', `<input class="pa-girdi kisa" type="number" min="1" max="${n}" data-s="n" value="${s.n}">`) + `<p class="muted sm pa-ipucu">${Math.ceil(n / Math.max(1, +s.n || 1))} parça olacak.</p>`;
  else ic += satir('Parçalar', `<input class="pa-girdi genis" data-s="aralik" value="${esc(s.aralik)}" placeholder="Ör. 1-3, 4-10, 11-">`, 'Virgülle ayırdığın her aralık ayrı bir PDF olur.');
  return ic;
}

/* ═════════ Sayfaları düzenle ═════════ */
function duzenleAyar(d) {
  if (!P.plan) return '';
  const n = P.secili.size;
  const tus = (eylem, a, ic, ad, kapali, sinif = '') => `<button class="pa-tus ${sinif}" data-action="${eylem}" ${a != null ? `data-a="${a}"` : ''} ${kapali ? 'disabled' : ''}>${IC[ic]}<span>${ad}</span></button>`;
  return `<div class="pa-arac-cubuk">
      <div class="pa-cubuk-ust">
        <span class="pa-secili-say">${n ? `<b>${n}</b> sayfa seçili` : 'Düzenlemek için sayfalara dokun'}</span>
        <button class="btn sm" data-action="p-d-hepsi">${n === P.plan.length ? 'Seçimi kaldır' : 'Hepsini seç'}</button>
        <button class="btn sm" data-action="p-d-geri" ${P.geriAl.length ? '' : 'disabled'}>${IC.geriAlI}Geri al</button>
      </div>
      <div class="pa-cubuk-tuslar">
        ${tus('p-d-dondur', -90, 'dondurSol', 'Sola çevir', !n)}
        ${tus('p-d-dondur', 90, 'dondurSag', 'Sağa çevir', !n)}
        ${tus('p-d-tasi', -1, 'solOk', 'Önceye al', !n)}
        ${tus('p-d-tasi', 1, 'sagOk', 'Sonraya al', !n)}
        ${tus('p-d-bos', null, 'arti', 'Boş sayfa', false)}
        ${tus('p-d-sil', null, 'sil', 'Sil', !n, 'tehlike')}
      </div>
    </div>
    <div class="pa-izgara duzen" id="paDuzen">${P.plan.map((p, i) => `
      <div class="pa-sayfa ${P.secili.has(p.id) ? 'secili' : ''}" data-action="p-d-sec" data-id="${p.id}">
        <div class="pa-sayfa-ic ${p.d % 180 ? 'yan' : ''}" style="--d:${p.d}deg">${p.k == null ? '<div class="pa-bos-sayfa">Boş</div>' : `<canvas class="pa-kucuk" data-d="${d.id}" data-no="${p.k + 1}" data-g="140"></canvas>`}</div>
        <span>${i + 1}${p.k != null && p.k !== i ? `<small> (eski ${p.k + 1})</small>` : ''}</span>
        <i class="pa-sayfa-tut" data-tut-sayfa="${p.id}" title="Sürükle">${IC.tut}</i>
      </div>`).join('')}</div>
    <p class="muted sm pa-ipucu">${P.plan.length} sayfa · Sayfaları tutamağından sürükleyerek de sıralayabilirsin.</p>`;
}
function planDegis(fn) { P.geriAl.push(P.plan.map(p => ({ ...p }))); if (P.geriAl.length > 50) P.geriAl.shift(); fn(); P.sonuc = null; ayarYenile(); }
function ayarYenile() {
  if (P.arac === 'form' && P.form) formDegerleriniAl();
  const el = $('#paAyar'); if (!el) return aracCiz();
  const y = window.scrollY; el.innerHTML = ayarCiz(); $('#paSonuc').innerHTML = sonucCiz(); window.scrollTo(0, y); sonrakiCizim();
}

/* ═════════ Form doldur ═════════ */
async function formHazirla() {
  const d = P.dosyalar[0];
  try { P.form = await PDFIS.formBilgi(d.bytes); P.form.degerler = Object.fromEntries(P.form.alanlar.map(a => [a.ad, a.deger])); }
  catch (e) { d.hata = e.message; }
}
function formAyar() {
  const F = P.form, s = sec();
  if (!F) return '';
  if (!F.alanlar.length) return `<div class="pa-uyari">${IC.alert || ''}<span>Bu PDF'te doldurulabilir alan yok. Kâğıt gibi basılmış bir form olabilir; böyle formlara yazı eklemek bir sonraki sürümde gelecek. Şimdilik “Üst ve alt bilgi” aracıyla yazı ekleyebilirsin.</span></div>`;
  return `${F.xfa ? `<div class="pa-uyari">${IC.alert || ''}<span>Bu form özel bir türde (XFA) hazırlanmış. Alanlar doldurulabilir ama bazı programlarda farklı görünebilir.</span></div>` : ''}
    <p class="muted sm pa-ipucu">${F.alanlar.length} alan bulundu. Doğrudan sayfanın üzerinde doldur.</p>
    <div class="pa-form-sayfalar" id="paFormSayfalar">${Array.from({ length: P.dosyalar[0].sayfa }, (_, i) => F.alanlar.some(a => a.widget.some(w => w.s === i)) ? `<div class="pa-form-sayfa" data-s="${i}"><canvas></canvas><div class="pa-form-katman"></div><span class="pa-form-no">${i + 1}. sayfa</span></div>` : '').join('')}</div>
    ${F.alanlar.some(a => a.widget.every(w => w.s == null || w.s < 0)) ? `<div class="pa-form-liste">${F.alanlar.filter(a => a.widget.every(w => w.s == null || w.s < 0)).map(a => `<label><span>${esc(a.ad)}</span>${formGirdi(a, null, true)}</label>`).join('')}</div>` : ''}
    ${satir('Sonra', `<label class="pa-anahtar"><input type="checkbox" data-s="duzlestir" ${s.duzlestir ? 'checked' : ''}><span>Alanları kilitle (düzleştir)</span></label>`, 'Kilitlersen yazdıkların sayfanın parçası olur, sonradan değiştirilemez. Göndereceğin formlar için iyi.')}`;
}
function formGirdi(a, w, liste) {
  const v = P.form.degerler[a.ad], dis = a.salt ? 'disabled' : '', ad = esc(a.ad);
  if (a.tur === 'yazi') return a.cok ? `<textarea data-alan="${ad}" ${dis} ${a.max ? `maxlength="${a.max}"` : ''}>${esc(v)}</textarea>` : `<input data-alan="${ad}" value="${esc(v)}" ${dis} ${a.max ? `maxlength="${a.max}"` : ''}>`;
  if (a.tur === 'kutu') return `<input type="checkbox" data-alan="${ad}" ${v ? 'checked' : ''} ${dis}>`;
  if (a.tur === 'liste' || a.tur === 'secim') return `<select data-alan="${ad}" ${dis}><option value=""></option>${a.secenek.map(o => `<option ${o === v ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
  if (a.tur === 'radyo') {
    if (liste) return `<select data-alan="${ad}" ${dis}><option value=""></option>${a.secenek.map(o => `<option ${o === v ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
    return `<input type="radio" name="r-${ad}" data-alan="${ad}" value="${esc(w.deger)}" ${w.deger === v ? 'checked' : ''} ${dis}>`;
  }
  return '';
}
async function formSayfalariCiz() {
  const d = P.dosyalar[0], pdf = await d.gor, kap = $('#paFormSayfalar'); if (!kap) return;
  for (const el of kap.querySelectorAll('.pa-form-sayfa')) {
    const i = +el.dataset.s, p = await pdf.getPage(i + 1), v1 = p.getViewport({ scale: 1 });
    const gen = el.clientWidth || 600, s = gen / v1.width, v = p.getViewport({ scale: s }), c = el.querySelector('canvas'), dpr = Math.min(2, devicePixelRatio || 1);
    c.width = Math.round(v.width * dpr); c.height = Math.round(v.height * dpr); c.style.height = v.height + 'px';
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
    await p.render({ canvasContext: g, viewport: p.getViewport({ scale: s * dpr }), annotationMode: 0 }).promise;   // alanların eski görünümü çizilmesin, üstüne kutular gelecek
    const kat = el.querySelector('.pa-form-katman'); kat.style.height = v.height + 'px';
    kat.innerHTML = P.form.alanlar.flatMap(a => a.widget.filter(w => w.s === i).map(w => {
      const [x1, y1] = v.convertToViewportPoint(w.x, w.y), [x2, y2] = v.convertToViewportPoint(w.x + w.w, w.y + w.h);
      const L = Math.min(x1, x2), T = Math.min(y1, y2), W = Math.abs(x2 - x1), H = Math.abs(y2 - y1);
      return `<div class="pa-alan t-${a.tur}" style="left:${L}px;top:${T}px;width:${W}px;height:${H}px;--fs:${Math.max(9, Math.min(15, H * 0.62))}px" title="${esc(a.ad)}">${formGirdi(a, w)}</div>`;
    })).join('');
    p.cleanup();
  }
}

/* ═════════ Belge bilgileri ═════════ */
function bilgiAyar(s) {
  const B = P.bilgi; if (!B) return '';
  const sat = (n, v) => `<div class="pa-bilgi-sat"><span>${n}</span><b>${v ? esc(v) : '<em>yok</em>'}</b></div>`;
  const gizli = [B.olusturan, B.uretici, B.olusma, B.degisme].filter(Boolean).length + (B.xmp ? 1 : 0) + B.diger.length;
  return `<div class="pa-bilgi">
      <h3>Dosyada şu an saklı olanlar</h3>
      ${sat('Başlık', B.baslik)}${sat('Yazar', B.yazar)}${sat('Konu', B.konu)}${sat('Anahtar kelimeler', B.anahtar)}
      ${sat('Oluşturan program', B.olusturan)}${sat('Dönüştüren program', B.uretici)}${sat('Oluşturulma', B.olusma)}${sat('Son değişiklik', B.degisme)}
      ${B.xmp ? sat('Ek bilgi bloğu (XMP)', 'Var — programların sakladığı ayrıntılı bilgiler') : ''}
      ${B.diger.length ? sat('Diğer alanlar', B.diger.join(', ')) : ''}
    </div>
    <div class="pa-bilgi-yeni">
      <h3>Yeni hâli</h3>
      ${[['baslik', 'Başlık'], ['yazar', 'Yazar'], ['konu', 'Konu'], ['anahtar', 'Anahtar kelimeler']].map(([k, n]) => `<label><span>${n}</span><input class="pa-girdi" data-b="${k}" value="${esc(P.bilgi.yeni?.[k] ?? (s.hepsiniSil ? '' : B[k]))}" placeholder="boş bırakılırsa silinir"></label>`).join('')}
      <label class="pa-anahtar"><input type="checkbox" data-s="hepsiniSil" ${s.hepsiniSil ? 'checked' : ''}><span>Program adı, tarihler ve diğer gizli bilgileri de sil</span></label>
      <p class="muted sm">${gizli ? `${gizli} gizli bilgi bulundu.` : 'Gizli bilgi bulunmadı.'} Sayfalardaki yazı ve resimlere dokunulmaz.</p>
    </div>`;
}

/* ═════════ Kırp önizleme ═════════ */
let kirpBoyut = null;
async function kirpOnizle() {
  const d = P.dosyalar[0], c = $('#paKirpTuval'); if (!c || !d?.gor || d.hata) return;
  try {
    const pdf = await d.gor, p = await pdf.getPage(1), v1 = p.getViewport({ scale: 1 }), gen = Math.min(320, c.parentElement.clientWidth || 320);
    const s = gen / v1.width, dpr = Math.min(2, devicePixelRatio || 1), v = p.getViewport({ scale: s * dpr });
    c.width = v.width; c.height = v.height; c.style.width = gen + 'px'; c.style.height = v1.height * s + 'px';
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
    await p.render({ canvasContext: g, viewport: v }).promise; p.cleanup();
    kirpBoyut = { s, w: v1.width, h: v1.height };
    kirpCerceve();
  } catch {}
}
function kirpCerceve() {
  const el = $('#paKirpCerceve'); if (!el || !kirpBoyut) return;
  const s = sec(), k = kirpBoyut.s * PDFIS.MM;
  el.style.cssText = `top:${(+s.ust || 0) * k}px;left:${(+s.sol || 0) * k}px;right:${(+s.sag || 0) * k}px;bottom:${(+s.alt || 0) * k}px`;
}

/* ═════════ Çalıştır ═════════ */
function ilerle(i, n, yazi) {
  const el = $('#paIlerle'); if (!el) return;
  el.hidden = false; $('#paIlerleYazi').textContent = yazi || (n > 1 ? `İşleniyor… ${Math.min(i + 1, n)} / ${n}` : 'İşleniyor…');
  $('#paCubuk').style.width = n ? Math.round(((i + 0.5) / n) * 100) + '%' : '40%';
}
const pdfSonuc = (ad, bytes, ek = {}) => ({ dosyalar: [{ ad, blob: new Blob([bytes], { type: 'application/pdf' }) }], onizle: true, ...ek });
async function yap() {
  if (P.calisiyor) return;
  const A = ARAC[P.arac], s = sec(), d = P.dosyalar[0];
  if (P.dosyalar.some(x => x.hata)) return toast('Açılamayan dosyayı çıkar ya da başka bir dosya seç');
  P.calisiyor = true; P.iptal = false; P.sonuc = null;
  $('#paSonuc').innerHTML = ''; const btn = $('.pa-yap'); if (btn) btn.disabled = true;
  ilerle(0, 0, 'Hazırlanıyor…');
  const iptal = () => P.iptal, taban = tabanAd(d?.ad), ilkBoy = d?.boy;
  try {
    let r;
    switch (P.arac) {
      case 'birlestir': {
        if (P.dosyalar.length < 2) throw new PDFIS.PdfHata('En az iki dosya ekle');
        const b = await PDFIS.birlestir(P.dosyalar.map(x => x.tur === 'pdf' ? { tur: 'pdf', bytes: x.bytes } : { tur: 'resim', blob: x.dosya }), ilerle);
        r = pdfSonuc(`${taban} ve ${P.dosyalar.length - 1} dosya (birleştirildi).pdf`, b); break;
      }
      case 'bol': {
        const n = d.sayfa; let gruplar;
        if (s.mod === 'sec') { const l = [...P.bolSecili].sort((a, b) => a - b); if (!l.length) throw new PDFIS.PdfHata('Önce sayfaları seç'); gruplar = [l]; }
        else if (s.mod === 'her') gruplar = Array.from({ length: n }, (_, i) => [i]);
        else if (s.mod === 'n') { const k = Math.max(1, +s.n || 1); gruplar = []; for (let i = 0; i < n; i += k) gruplar.push(Array.from({ length: Math.min(k, n - i) }, (_, j) => i + j)); }
        else {
          const parcalar = String(s.aralik || '').split(/[,;]/).map(x => x.trim()).filter(Boolean);
          if (!parcalar.length) throw new PDFIS.PdfHata('Parçaları yaz (ör. 1-3, 4-10)');
          gruplar = parcalar.map(p => PDFIS.aralikCoz(p, n));
        }
        const out = await PDFIS.bol(d.bytes, gruplar, ilerle);
        r = { dosyalar: out.map((b, i) => ({ ad: `${taban} - ${gruplar[i].length === 1 ? 'sayfa ' + (gruplar[i][0] + 1) : 'sayfa ' + PDFIS.araliktanYazi(gruplar[i]).replace(/, /g, ',')}.pdf`, blob: new Blob([b], { type: 'application/pdf' }) })), onizle: out.length === 1 };
        break;
      }
      case 'duzenle': r = pdfSonuc(`${taban} (düzenlendi).pdf`, await PDFIS.duzenle(d.bytes, P.plan)); break;
      case 'kirp': {
        const k = { ust: +s.ust || 0, sag: +s.sag || 0, alt: +s.alt || 0, sol: +s.sol || 0 };
        r = pdfSonuc(`${taban} (kırpıldı).pdf`, s.sil ? await PDFIS.kirpSil(d.bytes, k, kapsamAl(s, d.sayfa), { iptal }, ilerle) : await PDFIS.kirp(d.bytes, k, kapsamAl(s, d.sayfa))); break;
      }
      case 'a4': r = pdfSonuc(`${taban} (A4).pdf`, await PDFIS.a4(d.bytes, { yon: s.yon, kenar: +s.kenar })); break;
      case 'coklu': r = pdfSonuc(`${taban} (${s.adet}'${s.adet == 2 ? 'si' : 'ü'} 1 arada).pdf`, await PDFIS.cokluSayfa(d.bytes, { adet: +s.adet, cizgi: !!s.cizgi, kenar: +s.kenar || 8 })); break;
      case 'numara': {
        const sayfalar = s.atla ? Array.from({ length: d.sayfa - 1 }, (_, i) => i + 1) : null;
        r = pdfSonuc(`${taban} (numaralı).pdf`, await PDFIS.damga(d.bytes, { alanlar: { [s.konum]: numaraSablon(s) }, boyut: +s.boyut, sayfalar, baslangic: +s.baslangic || 0, kenar: 10 })); break;
      }
      case 'filigran': {
        if (!String(s.metin || '').trim()) throw new PDFIS.PdfHata('Filigran yazısını yaz');
        r = pdfSonuc(`${taban} (filigranlı).pdf`, await PDFIS.filigran(d.bytes, { metin: s.metin.trim(), konum: s.konum, aci: +s.aci, saydam: (+s.saydam || 20) / 100, renk: RENK[s.renk]?.[1], sayfalar: kapsamAl(s, d.sayfa) })); break;
      }
      case 'ustalt': {
        const alanlar = Object.fromEntries(['us', 'uo', 'ua', 'as', 'ao', 'aa'].map(k => [k, String(s[k] || '').trim()]));
        if (!Object.values(alanlar).some(Boolean)) throw new PDFIS.PdfHata('En az bir kutuya yazı yaz');
        r = pdfSonuc(`${taban} (üst-alt bilgili).pdf`, await PDFIS.damga(d.bytes, { alanlar, boyut: +s.boyut, kenar: +s.kenar, dosya: d.ad })); break;
      }
      case 'form': {
        formDegerleriniAl();
        r = pdfSonuc(`${taban} (doldurulmuş).pdf`, await PDFIS.formDoldur(d.bytes, P.form.degerler, { duzlestir: !!s.duzlestir })); break;
      }
      case 'foto': {
        const b = await PDFIS.resimdenPdf(P.dosyalar.map(x => x.dosya), { boyut: s.boyut, kenar: { yok: 0, ince: 18, genis: 40 }[s.kenar] ?? 18, kalite: s.kalite }, ilerle);
        r = pdfSonuc(`${P.dosyalar.length > 1 ? 'Fotoğraflar' : taban}.pdf`, b); break;
      }
      case 'resim': {
        const out = await PDFIS.resmeCevir(d.bytes, { tur: s.tur, dpi: +s.dpi, sayfalar: kapsamAl(s, d.sayfa), ad: taban, iptal }, ilerle);
        r = { dosyalar: out, resimler: true }; break;
      }
      case 'gri': r = pdfSonuc(`${taban} (gri).pdf`, await PDFIS.griTon(d.bytes, { dpi: +s.dpi, iptal }, ilerle)); break;
      case 'metin': {
        const sayfalar = await PDFIS.metin(d.bytes, ilerle), metin = sayfalar.map((t, i) => sayfalar.length > 1 ? `— Sayfa ${i + 1} —\n${t}` : t).join('\n\n');
        const harf = sayfalar.join('').replace(/\s/g, '').length;
        r = { metin, az: harf < sayfalar.length * 20, dosyalar: [{ ad: taban + '.txt', blob: new Blob([metin], { type: 'text/plain;charset=utf-8' }) }] }; break;
      }
      case 'resimler': {
        const out = await PDFIS.resimler(d.bytes, { iptal }, ilerle);
        if (!out.length) throw new PDFIS.PdfHata('Bu PDF\'te ayrı bir resim bulunamadı. Taranmış bir belgeyse sayfaların kendisini almak için “PDF\'ten resim” aracını kullan.');
        r = { dosyalar: out, resimler: true }; break;
      }
      case 'bilgi': {
        const yeni = Object.fromEntries([...document.querySelectorAll('[data-b]')].map(i => [i.dataset.b, i.value.trim()]));
        P.bilgi.yeni = yeni;
        r = pdfSonuc(`${taban} (temiz).pdf`, await PDFIS.bilgiYaz(d.bytes, { ...yeni, hepsiniSil: !!s.hepsiniSil })); break;
      }
    }
    if (r?.dosyalar?.length === 1 && ilkBoy && r.dosyalar[0].blob.type === 'application/pdf') r.once = ilkBoy;
    P.sonuc = r;
  } catch (e) {
    console.error(e);
    P.sonuc = { hata: e instanceof PDFIS.PdfHata ? e.message : 'Bir sorun çıktı: ' + (e.message || e) };
  } finally {
    P.calisiyor = false;
    const el = $('#paIlerle'); if (el) el.hidden = true;
    const b2 = $('.pa-yap'); if (b2) b2.disabled = false;
  }
  $('#paSonuc').innerHTML = sonucCiz();
  if (P.sonuc?.onizle) sonucOnizle();
  $('#paSonuc').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function formDegerleriniAl() {
  document.querySelectorAll('[data-alan]').forEach(el => {
    const ad = el.dataset.alan;
    if (el.type === 'checkbox') P.form.degerler[ad] = el.checked;
    else if (el.type === 'radio') { if (el.checked) P.form.degerler[ad] = el.value; }
    else P.form.degerler[ad] = el.value;
  });
}

/* ═════════ Sonuç ═════════ */
function sonucCiz() {
  const R = P.sonuc; if (!R) return '';
  if (R.hata) return `<div class="pa-uyari hata">${IC.alert || ''}<span>${esc(R.hata)}</span></div>`;
  const tek = R.dosyalar.length === 1, f = R.dosyalar[0], paylasVar = !!navigator.share;
  const toplam = R.dosyalar.reduce((t, x) => t + x.blob.size, 0);
  let ust = '';
  if (R.metin != null) ust = `${R.az ? `<div class="pa-uyari">${IC.alert || ''}<span>Bu PDF'te neredeyse hiç yazı yok; taranmış (fotoğraf) bir belge olabilir. Fotoğraftaki yazıyı okumak için <a href="tara.html">Tara</a> uygulamasını kullan.</span></div>` : ''}
      <textarea class="pa-metin" id="paMetin" readonly>${esc(R.metin)}</textarea>`;
  if (R.resimler) ust = `<div class="pa-resimler">${R.dosyalar.slice(0, 60).map((x, i) => `<a class="pa-resim" data-action="p-indir" data-i="${i}" href="#" title="${esc(x.ad)}"><img src="${R.url?.[i] || (R.url = R.url || [], R.url[i] = URL.createObjectURL(x.blob))}" alt=""><span>${esc(x.ad)}</span></a>`).join('')}${R.dosyalar.length > 60 ? `<p class="muted sm">… ve ${R.dosyalar.length - 60} resim daha (hepsi zip'te)</p>` : ''}</div>`;
  const degisim = R.once && tek ? `<span>${boyutYaz(R.once)} → ${boyutYaz(f.blob.size)}</span>` : '';
  return `<div class="pa-sonuc-kart">
      <div class="pa-sonuc-bas">${R.onizle ? '<canvas class="pa-sonuc-on" id="paSonucOn"></canvas>' : `<div class="pa-sonuc-ikon">${IC.check || IC.pdfI}</div>`}
        <div class="pa-sonuc-bilgi"><b>Hazır</b>
          <span>${tek ? esc(f.ad) : `${R.dosyalar.length} dosya · ${boyutYaz(toplam)}`}</span>${tek ? `<span>${boyutYaz(f.blob.size)}${R.sayfa ? ' · ' + R.sayfa + ' sayfa' : ''}</span>` : ''}${degisim}</div></div>
      ${ust}
      <div class="pa-sonuc-dugmeler">
        ${R.metin != null ? `<button class="btn primary" data-action="p-metin-kopyala">${IC.kopya}Kopyala</button>` : ''}
        <button class="btn ${R.metin != null ? '' : 'primary'}" data-action="p-indir" data-i="${tek ? 0 : -1}">${IC.indir}${tek ? 'İndir' : 'Hepsini indir (.zip)'}</button>
        ${paylasVar ? `<button class="btn" data-action="p-paylas">${IC.paylas}Paylaş</button>` : ''}
        ${tek && f.blob.type === 'application/pdf' ? `<button class="btn" data-action="p-devam">${IC.devam}Başka araçla devam et</button>` : ''}
      </div>
      ${!tek && !R.resimler ? `<div class="pa-sonuc-liste">${R.dosyalar.map((x, i) => `<div><span>${esc(x.ad)}</span><small>${boyutYaz(x.blob.size)}</small><button class="icon-btn sm" data-action="p-indir" data-i="${i}" title="İndir">${IC.indir}</button></div>`).join('')}</div>` : ''}
    </div>`;
}
async function sonucOnizle() {
  const c = $('#paSonucOn'), R = P.sonuc; if (!c || !R?.dosyalar?.[0]) return;
  try {
    const pdf = await PDFIS.goruntuAc(new Uint8Array(await R.dosyalar[0].blob.arrayBuffer()));
    R.sayfa = pdf.numPages;
    const p = await pdf.getPage(1), v1 = p.getViewport({ scale: 1 }), s = 150 * Math.min(2, devicePixelRatio || 1) / Math.max(v1.width, v1.height), v = p.getViewport({ scale: s });
    c.width = v.width; c.height = v.height;
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
    await p.render({ canvasContext: g, viewport: v }).promise; c.classList.add('hazir');
    pdf.loadingTask?.destroy?.();
    const b = c.closest('.pa-sonuc-kart')?.querySelector('.pa-sonuc-bilgi span:nth-of-type(2)');
    if (b && !/sayfa/.test(b.textContent)) b.textContent += ' · ' + R.sayfa + ' sayfa';
  } catch {}
}
function indir(blob, ad) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = ad; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 8000); }
async function hepsiZip() {
  const R = P.sonuc, d = P.dosyalar[0];
  return new File([await PDFIS.zip(R.dosyalar)], `${tabanAd(d?.ad)} - ${ARAC[P.arac].ad.replace(/\s*\/\s*/g, ' - ').replace(/[\\:*?"<>|']/g, '')}.zip`, { type: 'application/zip' });
}

/* ═════════ Sürükle-bırak ve sıralama ═════════ */
document.addEventListener('dragover', e => { if (!e.dataTransfer?.types?.includes('Files')) return; e.preventDefault(); document.body.classList.add('pa-surukle'); });
document.addEventListener('dragleave', e => { if (e.relatedTarget == null) document.body.classList.remove('pa-surukle'); });
document.addEventListener('drop', e => {
  document.body.classList.remove('pa-surukle');
  if (!e.dataTransfer?.files?.length) return;
  e.preventDefault(); if (!P.arac) anaDosya([...e.dataTransfer.files]); else dosyaEkle([...e.dataTransfer.files]);
});
document.addEventListener('change', e => {
  if (e.target.id === 'paGirdi') { const l = [...e.target.files]; e.target.value = ''; dosyaEkle(l); }
  else if (e.target.id === 'paHero') { const l = [...e.target.files]; e.target.value = ''; anaDosya(l); }
  else if (e.target.dataset.s != null) ayarGirdi(e.target, true);
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.s != null) ayarGirdi(t, false);
  if (t.id === 'paBolYazi') {
    try { const l = PDFIS.aralikCoz(t.value, P.dosyalar[0].sayfa) || []; P.bolSecili = new Set(l); t.classList.remove('yanlis');
      document.querySelectorAll('[data-action="p-bol-sec"]').forEach(b => b.classList.toggle('secili', P.bolSecili.has(+b.dataset.i)));
      const ip = t.closest('.pa-ayarlar')?.querySelector('.pa-ipucu'); if (ip) ip.textContent = l.length ? `${P.bolSecili.size} sayfa seçildi → tek PDF` : 'Yeni dosyaya girecek sayfalara dokun.';
    } catch { t.classList.add('yanlis'); }
  }
});
function ayarGirdi(t, bitti) {
  const s = sec(), k = t.dataset.s;
  s[k] = t.type === 'checkbox' ? t.checked : t.type === 'number' || t.type === 'range' ? +t.value : t.value;
  secKaydet(); P.sonuc = null; $('#paSonuc') && ($('#paSonuc').innerHTML = '');
  if (P.arac === 'kirp') kirpCerceve();
  if (k === 'saydam') { const el = $('#paSaydam'); if (el) el.textContent = '%' + t.value; }
  // Metin kutuları yazarken yeniden çizilmesin; seçim kutuları anında
  if (bitti && (t.type === 'checkbox' || t.type === 'number') && !['ust', 'sag', 'alt', 'sol', 'duzlestir', 'hepsiniSil', 'cizgi'].includes(k)) ayarYenile();
}
// Dosya listesi ve sayfa ızgarası için tutamaktan sürükleyerek sıralama (fare ve dokunmatik)
let surukle = null;
document.addEventListener('pointerdown', e => {
  const tut = e.target.closest('[data-tut], [data-tut-sayfa]'); if (!tut) return;
  const oge = tut.closest('.pa-dosya, .pa-sayfa'), kap = oge?.parentElement; if (!oge || !kap) return;
  e.preventDefault();
  const r = oge.getBoundingClientRect();
  surukle = { oge, kap, x0: e.clientX, y0: e.clientY, dx: e.clientX - r.left, dy: e.clientY - r.top, basladi: false, tur: tut.dataset.tut != null ? 'dosya' : 'sayfa' };
  tut.setPointerCapture?.(e.pointerId);
});
document.addEventListener('pointermove', e => {
  if (!surukle) return;
  const S = surukle;
  if (!S.basladi) { if (Math.hypot(e.clientX - S.x0, e.clientY - S.y0) < 5) return; S.basladi = true; S.oge.classList.add('tasiniyor'); document.body.classList.add('pa-tasiyor'); }
  S.oge.style.transform = `translate(${e.clientX - S.x0}px, ${e.clientY - S.y0}px)`;
  S.oge.style.pointerEvents = 'none';
  const alt = document.elementFromPoint(e.clientX, e.clientY)?.closest('.pa-dosya, .pa-sayfa');
  if (alt && alt !== S.oge && alt.parentElement === S.kap) {
    const r = alt.getBoundingClientRect(), once = S.tur === 'dosya' ? e.clientY < r.top + r.height / 2 : e.clientX < r.left + r.width / 2;
    const r0 = S.oge.getBoundingClientRect();
    S.kap.insertBefore(S.oge, once ? alt : alt.nextSibling);
    const r1 = S.oge.getBoundingClientRect();   // yer değişince parmak altında kalsın
    S.x0 += r1.left - r0.left; S.y0 += r1.top - r0.top;
    S.oge.style.transform = `translate(${e.clientX - S.x0}px, ${e.clientY - S.y0}px)`;
  }
  // Kenara gelince sayfayı kaydır
  if (e.clientY < 70) window.scrollBy(0, -12); else if (e.clientY > innerHeight - 70) window.scrollBy(0, 12);
});
function surukleBitir() {
  if (!surukle) return; const S = surukle; surukle = null;
  S.oge.style.transform = ''; S.oge.style.pointerEvents = ''; S.oge.classList.remove('tasiniyor'); document.body.classList.remove('pa-tasiyor');
  if (!S.basladi) return;
  if (S.tur === 'dosya') {
    const sira2 = [...S.kap.querySelectorAll('.pa-dosya')].map(el => P.dosyalar[+el.dataset.i]);
    P.dosyalar = sira2; P.sonuc = null; aracCiz();
  } else {
    const ids = [...S.kap.querySelectorAll('.pa-sayfa')].map(el => +el.dataset.id);
    const eski = P.plan; if (ids.join() === eski.map(p => p.id).join()) return;
    planDegis(() => { P.plan = ids.map(id => eski.find(p => p.id === id)); });
  }
  surukle_tikEngel = Date.now();
}
let surukle_tikEngel = 0;
document.addEventListener('pointerup', surukleBitir);
document.addEventListener('pointercancel', surukleBitir);
window.addEventListener('popstate', () => { if (P.calisiyor) { P.iptal = true; } if (P.arac) { P.dosyalar.forEach(dosyaKapat); P.dosyalar = []; anaCiz(); } });
window.addEventListener('resize', () => { clearTimeout(window._paBoy); window._paBoy = setTimeout(() => { if (P.arac === 'form' && P.form) { formDegerleriniAl(); formSayfalariCiz(); } if (P.arac === 'kirp') kirpOnizle(); }, 250); });

/* ═════════ Ayarlar ═════════ */
function ayarAc() {
  const t = store.get('theme', 'light');
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet settings"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Ayarlar</h3></header>
    <div class="set-body">
      <section><h4>Görünüm</h4><div class="seg yon-seg">${[['light', 'Cam'], ['dark', 'Koyu'], ['auto', 'Otomatik'], ['flat', 'Düz']].map(([k, n]) => `<button class="${t === k ? 'on' : ''}" data-action="p-tema" data-t="${k}">${n}</button>`).join('')}</div></section>
      <section><h4>Verilerin</h4><div class="set-row"><div><b>Dosyaların bu cihazdan çıkmaz</b><span>Bütün işlemler bu cihazın içinde yapılır; dosyalar hiçbir sunucuya gönderilmez ve hiçbir yerde saklanmaz. Sadece araçlarda son seçtiğin ayarlar hatırlanır.</span></div><button class="btn" data-action="p-ayar-sil">Ayarları sıfırla</button></div></section>
      <section><h4>Uygulama</h4>${typeof aboutRow === 'function' ? aboutRow() : ''}
        <p class="muted sm">PDF işlemleri pdf-lib ve PDF.js ile yapılır (ikisi de açık kaynak, bu cihazda çalışır). <a href="tara-lib/LISANSLAR.txt" target="_blank" rel="noopener">Lisanslar</a></p></section>
    </div></div></div>`;
}

/* ═════════ Olaylar ═════════ */
Object.assign(ACTIONS, {
  'p-ayar': () => ayarAc(), settings: () => ayarAc(),
  'p-tema': el => { store.set('theme', el.dataset.t); applyTheme(el.dataset.t); ayarAc(); },
  'p-ayar-sil': () => { P.secim = {}; store.del('pdfSecim'); closeModal(); toast('Ayarlar sıfırlandı'); if (P.arac) ayarYenile(); },
  'p-ana': () => { if (P.arac) history.state?.arac ? history.back() : (P.dosyalar.forEach(dosyaKapat), P.dosyalar = [], anaCiz()); },
  'p-arac': el => aracAc(el.dataset.k),
  'p-elde-birak': () => { P.elde = null; anaCiz(); setTimeout(() => $('#paHero')?.click(), 50); },
  'p-yap': () => yap(),
  'p-iptal': () => { P.iptal = true; $('#paIlerleYazi').textContent = 'Durduruluyor…'; },
  'p-dosya-sil': el => { const d = P.dosyalar.splice(+el.dataset.i, 1)[0]; if (d) dosyaKapat(d); P.sonuc = null; P.plan = null; P.form = null; P.bilgi = null; aracCiz(); },
  'p-yukari': el => { const i = +el.dataset.i; if (i > 0) { [P.dosyalar[i - 1], P.dosyalar[i]] = [P.dosyalar[i], P.dosyalar[i - 1]]; P.sonuc = null; aracCiz(); } },
  'p-asagi': el => { const i = +el.dataset.i; if (i < P.dosyalar.length - 1) { [P.dosyalar[i + 1], P.dosyalar[i]] = [P.dosyalar[i], P.dosyalar[i + 1]]; P.sonuc = null; aracCiz(); } },
  'p-sec': el => { const s = sec(), v = el.dataset.v; s[el.dataset.k] = /^-?\d+(\.\d+)?$/.test(v) ? +v : v; secKaydet(); P.sonuc = null; ayarYenile(); },
  'p-filigran-oner': el => { sec().metin = el.dataset.v; secKaydet(); ayarYenile(); const i = document.querySelector('[data-s="metin"]'); if (i && /…/.test(i.value)) { i.focus(); const p = i.value.indexOf('…'); i.setSelectionRange(p, p + 1); } },
  'p-yer-tutucu': el => {
    const i = document.activeElement?.dataset?.yer ? document.activeElement : (window._paSonYer || document.querySelector('[data-yer="aa"]'));
    const p = i.selectionStart ?? i.value.length; i.value = i.value.slice(0, p) + el.dataset.v + i.value.slice(i.selectionEnd ?? p); i.focus();
    ayarGirdi(i, false);
  },
  'p-bos-bul': async () => {
    const d = P.dosyalar[0]; try {
      const k = await PDFIS.bosKenar(await d.gor, 1); if (!k) return toast('Sayfa tamamen boş görünüyor');
      const s = sec(); ['ust', 'sag', 'alt', 'sol'].forEach(x => s[x] = Math.floor(k[x])); secKaydet(); ayarYenile(); toast('Boşluklar bulundu (ilk sayfaya göre)');
    } catch { toast('Bulunamadı'); }
  },
  'p-bol-sec': el => { const i = +el.dataset.i; P.bolSecili.has(i) ? P.bolSecili.delete(i) : P.bolSecili.add(i); el.classList.toggle('secili'); const y = $('#paBolYazi'); if (y) y.value = PDFIS.araliktanYazi([...P.bolSecili]); const ip = el.closest('.pa-ayarlar')?.querySelector('.pa-ipucu'); if (ip) ip.textContent = P.bolSecili.size ? `${P.bolSecili.size} sayfa seçildi → tek PDF` : 'Yeni dosyaya girecek sayfalara dokun.'; P.sonuc = null; $('#paSonuc').innerHTML = ''; },
  'p-bol-hepsi': () => { P.bolSecili = new Set(Array.from({ length: P.dosyalar[0].sayfa }, (_, i) => i)); ayarYenile(); },
  'p-bol-temizle': () => { P.bolSecili = new Set(); ayarYenile(); },
  'p-d-sec': (el, e) => { if (Date.now() - surukle_tikEngel < 300 || e?.target?.closest('[data-tut-sayfa]')) return; const id = +el.dataset.id; P.secili.has(id) ? P.secili.delete(id) : P.secili.add(id); ayarYenile(); },
  'p-d-hepsi': () => { P.secili = P.secili.size === P.plan.length ? new Set() : new Set(P.plan.map(p => p.id)); ayarYenile(); },
  'p-d-dondur': el => planDegis(() => P.plan.forEach(p => { if (P.secili.has(p.id)) p.d = ((p.d + +el.dataset.a) % 360 + 360) % 360; })),
  'p-d-sil': () => {
    if (P.secili.size >= P.plan.length) return toast('Bütün sayfaları silemezsin; en az bir sayfa kalmalı');
    planDegis(() => { P.plan = P.plan.filter(p => !P.secili.has(p.id)); P.secili = new Set(); });
  },
  'p-d-bos': () => planDegis(() => {
    const son = P.plan.reduce((m, p, i) => P.secili.has(p.id) ? i : m, P.plan.length - 1);
    const yeni = { k: null, d: 0, id: ++sira }; P.plan.splice(son + 1, 0, yeni); P.secili = new Set([yeni.id]);
  }),
  'p-d-tasi': el => planDegis(() => {
    const a = +el.dataset.a, l = P.plan;
    const idx = l.map((p, i) => P.secili.has(p.id) ? i : -1).filter(i => i >= 0);
    if (a < 0) { for (const i of idx) if (i > 0 && !P.secili.has(l[i - 1].id)) [l[i - 1], l[i]] = [l[i], l[i - 1]]; }
    else { for (const i of idx.reverse()) if (i < l.length - 1 && !P.secili.has(l[i + 1].id)) [l[i + 1], l[i]] = [l[i], l[i + 1]]; }
  }),
  'p-d-geri': () => { const g = P.geriAl.pop(); if (g) { P.plan = g; P.sonuc = null; ayarYenile(); } },
  'p-indir': async el => {
    const R = P.sonuc; if (!R?.dosyalar) return; const i = +el.dataset.i;
    if (i >= 0) return indir(R.dosyalar[i].blob, R.dosyalar[i].ad);
    try { const z = await hepsiZip(); indir(z, z.name); } catch (e) { toast('Zip hazırlanamadı: ' + e.message); }
  },
  'p-paylas': async () => {
    const R = P.sonuc; if (!R?.dosyalar) return;
    let dosyalar = R.dosyalar.map(x => new File([x.blob], x.ad, { type: x.blob.type }));
    if (dosyalar.length > 10) dosyalar = [await hepsiZip()];
    if (navigator.canShare && !navigator.canShare({ files: dosyalar })) { toast('Bu cihaz dosya paylaşmayı desteklemiyor; indir düğmesini kullan'); return; }
    try { await navigator.share({ files: dosyalar, title: dosyalar[0].name }); } catch (e) { if (e.name !== 'AbortError') toast('Paylaşılamadı: ' + e.message); }
  },
  'p-devam': async () => {
    const f = P.sonuc?.dosyalar?.[0]; if (!f) return;
    P.elde = { ad: f.ad, bytes: new Uint8Array(await f.blob.arrayBuffer()) };
    if (history.state?.arac) history.back(); else { P.dosyalar.forEach(dosyaKapat); P.dosyalar = []; anaCiz(); }
    setTimeout(() => { if (!P.arac) anaCiz(); }, 60);
  },
  'p-metin-kopyala': async () => { const t = P.sonuc?.metin || ''; try { await navigator.clipboard.writeText(t); toast('Yazı kopyalandı'); } catch { const a = $('#paMetin'); a?.select(); toast('Seçildi; kopyala komutunu kullan'); } }
});
document.addEventListener('focusin', e => { if (e.target.dataset?.yer) window._paSonYer = e.target; });
