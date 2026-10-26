/* ───────────── Kişiler ─────────────
   Kendi rehberin: kişiler, gruplar, favoriler, doğum günleri, arama/mesaj/WhatsApp/e-posta kısayolları, telefon rehberinden seçerek ya da .vcf ile
   içe aktarma, .vcf ile dışa aktarma ve yedek, kopya kişileri birleştirme. Giriş gerekmez, ağ isteği yapmaz. Motor kisiler-is.js'te. */
'use strict';

window.APP_NAME = 'Kişiler';
window.APP_ICON = 'kisiler-apple.png?v=1';
window.APP_LEAD = 'Kişilerini, gruplarını ve doğum günlerini tek yerde tut. Hepsi cihazında kalır. Ücretsiz, reklamsız.';

const { DB, rakam, son10, ulkeli, sonrakiDogum, pad } = KE;
const KS = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
Object.assign(IC, {
  kisi: KS('<circle cx="12" cy="8.500" r="3.700"/><path d="M5 20c.8-3.700 3.600-5.600 7-5.600s6.200 1.900 7 5.600"/>'),
  grup: KS('<circle cx="9" cy="9" r="3.200"/><path d="M3 19c.6-3 3-4.600 6-4.600s5.400 1.600 6 4.600"/><circle cx="17" cy="8" r="2.600"/><path d="M17 13.200c2.400 0 3.900 1.300 4.400 3.800"/>'),
  pasta: KS('<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M8 8c0-2 1-3 2.500-3h3C15 5 16 6 16 8M12 12.500v3M4 13.500c3 1.800 5.500 2.500 8 2.500s5-.7 8-2.500"/>'),
  telefon: KS('<path d="M6.600 4h3l1.500 4-2 1.300a11 11 0 0 0 5.600 5.600l1.300-2 4 1.500v3a2 2 0 0 1-2.200 2A15.500 15.500 0 0 1 4.600 6.200 2 2 0 0 1 6.600 4z"/>'),
  mesaj: KS('<path d="M4 6.500A2.500 2.500 0 0 1 6.500 4h11A2.500 2.500 0 0 1 20 6.500v7a2.500 2.500 0 0 1-2.500 2.500H11l-4.500 3.500V16A2.500 2.500 0 0 1 4 13.500z"/>'),
  wa: KS('<path d="M4 20l1.200-4.200A8 8 0 1 1 8.300 18.800z"/><path d="M9 9c.2 2.600 2.400 4.800 5 5l1-1.400-1.800-1-.9.800a3.600 3.600 0 0 1-1.700-1.700l.8-.9-1-1.800z" fill="currentColor"/>'),
  posta: KS('<rect x="3.500" y="5.500" width="17" height="13" rx="2.500"/><path d="m4 8 8 5.500L20 8"/>'),
  pasta2: KS('<path d="M5 20V10l7-5 7 5v10z"/><path d="M10 20v-5h4v5"/>'),
  pasta3: KS('<path d="M12 3c1.500 2 3 3 3 5a3 3 0 0 1-6 0c0-2 1.500-3 3-5z"/><rect x="5" y="12" width="14" height="8" rx="2"/><path d="M5 15.500c2 1 3.500 1 7 0s5 1 7 0"/>'),
  yildiz: KS('<path d="m12 4 2.400 5 5.400.7-4 3.800 1 5.400-4.800-2.700-4.800 2.700 1-5.400-4-3.800 5.400-.7z"/>'),
  yildizD: KS('<path d="m12 4 2.400 5 5.400.7-4 3.800 1 5.400-4.800-2.700-4.800 2.700 1-5.400-4-3.800 5.400-.7z" fill="currentColor"/>'),
  kalemK: KS('<path d="M4 20l1-4L16.500 4.500a2.100 2.100 0 0 1 3 3L8 19z"/><path d="M14.500 6.500l3 3"/>'),
  copK: KS('<path d="M5 7h14M10 7V4.500h4V7M7 7l1 12h8l1-12"/>'),
  indirK: KS('<path d="M12 4v11M7.500 10.500 12 15l4.500-4.500"/><path d="M5 19h14"/>'),
  yukK: KS('<path d="M12 15V4M7.500 8.500 12 4l4.500 4.500"/><path d="M5 19h14"/>'),
  birlesK: KS('<path d="M6 4v5a4 4 0 0 0 4 4h4a4 4 0 0 1 4 4v3M18 4v5a4 4 0 0 1-4 4"/><path d="m15 17 3 3 3-3"/>'),
  geriK: KS('<path d="M15 5l-7 7 7 7"/>'),
  ileriK: KS('<path d="M9 5l7 7-7 7"/>'),
  kopyaK: KS('<rect x="8" y="8" width="12" height="12" rx="2.500"/><path d="M16 8V6.500A2.500 2.500 0 0 0 13.500 4h-7A2.500 2.500 0 0 0 4 6.500v7A2.500 2.500 0 0 0 6.500 16H8"/>'),
  moreK: KS('<circle cx="12" cy="5" r="1.300"/><circle cx="12" cy="12" r="1.300"/><circle cx="12" cy="19" r="1.300"/>')
});

const K = { k: [], g: [], gor: store.get('kGor', 'kisi'), q: '', grup: null, ayar: Object.assign({ ulke: '90', soyadaGore: false }, store.get('kAyar', {})), foto: new Map(), hata: '', mesgul: false, cop: [], sec: null };
const TIPLER = [['cep', 'Cep'], ['ev', 'Ev'], ['is', 'İş'], ['diger', 'Diğer']];
const kisalt = (s, n) => String(s ?? '').slice(0, n);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const tr = (a, b) => String(a).localeCompare(String(b), 'tr');
const dar = () => matchMedia('(max-width: 700px)').matches;
const kisi = id => K.k.find(x => x.id === id);
const grupAd = id => K.g.find(x => x.id === id)?.ad;
const tipTemiz = t => TIPLER.some(x => x[0] === t) ? t : 'diger';
const kTemiz = o => {
  if (!o || typeof o !== 'object' || !o.id) return null;
  return { id: kisalt(o.id, 40), ad: kisalt(o.ad, 80), soyad: kisalt(o.soyad, 80), sirket: kisalt(o.sirket, 120), unvan: kisalt(o.unvan, 120),
    tel: (Array.isArray(o.tel) ? o.tel : []).slice(0, 20).map(t => ({ t: tipTemiz(t?.t), n: kisalt(t?.n, 40) })).filter(t => t.n.trim()),
    eposta: (Array.isArray(o.eposta) ? o.eposta : []).slice(0, 20).map(t => ({ t: tipTemiz(t?.t), e: kisalt(t?.e, 120) })).filter(t => t.e.trim()),
    adres: kisalt(o.adres, 300), dogum: KE.dogumAyrac(o.dogum) ? kisalt(o.dogum, 10) : '', not: kisalt(o.not, 1000), grup: (Array.isArray(o.grup) ? o.grup : []).slice(0, 30).map(x => kisalt(x, 40)),
    fav: !!o.fav, olusturma: KE.sayi(o.olusturma, 0, 4e12, Date.now()), guncelleme: KE.sayi(o.guncelleme, 0, 4e12, Date.now()), foto: o.foto instanceof Blob ? o.foto : null, silindi: o.silindi ? KE.sayi(o.silindi, 0, 4e12, Date.now()) : 0 };
};
const gTemiz = o => (!o || typeof o !== 'object' || !o.id) ? null : { id: kisalt(o.id, 40), ad: kisalt(o.ad, 40) || 'Grup' };
const tamAd = k => [k.ad, k.soyad].filter(Boolean).join(' ') || k.sirket || k.tel[0]?.n || k.eposta[0]?.e || 'İsimsiz';
const siraAd = k => (K.ayar.soyadaGore ? [k.soyad, k.ad] : [k.ad, k.soyad]).filter(Boolean).join(' ') || k.sirket || k.tel[0]?.n || k.eposta[0]?.e || '~';
const harf = k => { const c = siraAd(k).trim().charAt(0).toLocaleUpperCase('tr'); return /\p{L}/u.test(c) ? c : '#'; };
const bas2 = k => ((k.ad || k.sirket || '?').charAt(0) + (k.ad && k.soyad ? k.soyad.charAt(0) : '')).toLocaleUpperCase('tr');
const ton = k => { let h = 0; for (const c of tamAd(k)) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };

/* ═════════ Başlangıç ═════════ */
document.removeEventListener('DOMContentLoaded', boot);
async function kBaslat() {
  document.documentElement.classList.add('k-html');
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  kabuk();
  try { const tum = (await DB.hepsi('kisi')).map(kTemiz).filter(Boolean), sinir = Date.now() - 30 * 864e5; for (const x of tum.filter(x => x.silindi && x.silindi < sinir)) await DB.sil('kisi', x.id); K.cop = tum.filter(x => x.silindi && x.silindi >= sinir); K.k = tum.filter(x => !x.silindi); K.g = (await DB.hepsi('grup')).map(gTemiz).filter(Boolean); }
  catch { K.hata = 'Bu tarayıcıda kişiler saklanamıyor (özel pencere olabilir).'; }
  if (!['kisi', 'fav', 'grup', 'dogum'].includes(K.gor)) K.gor = 'kisi';
  ciz();
}
showLogin = msg => { if (msg) toast(msg); };
start = () => kBaslat();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', kBaslat); else kBaslat();

function kabuk() {
  $('#app').innerHTML = `
  <div class="k-kabuk" id="kKabuk">
    <header class="k-bas">
      <div class="k-bas1"><div class="brand-mark sm" id="kBrand">${IC.kisi}</div><h1 id="kBaslik">Kişiler</h1><div class="spacer"></div>
        <button class="icon-btn" data-action="k-menu" title="Aktar ve araçlar" aria-label="Aktar ve araçlar">${IC.moreK}</button>
        <button class="icon-btn" data-action="k-ayar" title="Ayarlar" aria-label="Ayarlar">${IC.gear}</button>
        <button class="btn primary sm" data-action="k-yeni">${IC.plus}<span>Yeni</span></button></div>
      <nav class="seg k-sek" id="kSek">${[['kisi', IC.kisi, 'Kişiler'], ['fav', IC.yildiz, 'Favoriler'], ['grup', IC.grup, 'Gruplar'], ['dogum', IC.pasta3, 'Doğum']].map(([k, i, n]) => `<button data-action="k-gor" data-k="${k}">${i}<span>${n}</span></button>`).join('')}</nav>
      <label class="k-ara" id="kAra">${IC.search}<input id="kAraIn" type="search" placeholder="Ad, numara, e-posta ya da şirket ara…" autocomplete="off" enterkeyhint="search"></label>
    </header>
    <main class="k-govde" id="kGovde"></main>
    <nav class="k-harf" id="kHarf" hidden></nav>
  </div>
  <div class="k-detay" id="kDetay" hidden></div>
  <div class="k-form" id="kForm" hidden></div>
  <input type="file" id="kVcf" accept=".vcf,text/vcard,text/x-vcard,text/directory" multiple hidden>
  <input type="file" id="kFotoIn" accept="image/*" hidden>`;
  $('#kVcf').onchange = async e => { const l = [...e.target.files]; e.target.value = ''; let t = ''; for (const f of l) { if (f.size > 60e6) continue; t += '\n' + await f.text(); } if (t.trim()) iceAktar(KE.vcfOku(t)); };
  let z = 0; $('#kAraIn').addEventListener('input', e => { clearTimeout(z); z = setTimeout(() => { K.q = e.target.value; ciz(); }, 150); });
  addEventListener('dragover', e => { if ([...(e.dataTransfer?.types || [])].includes('Files')) e.preventDefault(); });
  addEventListener('drop', async e => { const l = [...(e.dataTransfer?.files || [])].filter(f => /\.vcf$/i.test(f.name)); if (!l.length) return; e.preventDefault(); let t = ''; for (const f of l) t += '\n' + await f.text(); iceAktar(KE.vcfOku(t)); });
}

/* ═════════ Listeler ═════════ */
function ara(l) {
  const q = K.q.trim().toLocaleLowerCase('tr'), qd = rakam(K.q); if (!q) return l;
  return l.filter(k => { const m = `${k.ad} ${k.soyad} ${k.sirket} ${k.unvan} ${k.eposta.map(e => e.e).join(' ')} ${k.not}`.toLocaleLowerCase('tr'); return q.split(/\s+/).every(w => m.includes(w)) || (qd.length >= 3 && k.tel.some(t => rakam(t.n).includes(qd))); });
}
const sirali = l => l.slice().sort((a, b) => tr(siraAd(a), siraAd(b)));
function aktif() {
  if (K.gor === 'fav') return sirali(ara(K.k.filter(k => k.fav)));
  if (K.gor === 'grup' && K.grup) return sirali(ara(K.k.filter(k => k.grup.includes(K.grup))));
  return sirali(ara(K.k));
}
function avatar(k, b = '') {
  const u = fotoUrl(k); return u ? `<span class="k-av ${b}"><img src="${u}" alt="" draggable="false"></span>` : `<span class="k-av ${b}" style="--h:${ton(k)}">${esc(bas2(k))}</span>`;
}
function fotoUrl(k) { if (!k.foto) return ''; let u = K.foto.get(k.id + ':' + k.guncelleme); if (!u) { u = URL.createObjectURL(k.foto); K.foto.set(k.id + ':' + k.guncelleme, u); } return u; }
function satir(k) {
  const alt = k.sirket && (k.ad || k.soyad) ? k.sirket : k.tel[0]?.n || k.eposta[0]?.e || '';
  return `<button class="k-satir ${K.sec?.has(k.id) ? 'secili' : ''}" data-action="k-ac" data-id="${esc(k.id)}">${K.sec ? `<span class="k-kutu ${K.sec.has(k.id) ? 'on' : ''}">${K.sec.has(k.id) ? '✓' : ''}</span>` : ''}${avatar(k)}<span class="k-sat-t"><b>${esc(tamAd(k))}</b>${alt ? `<span>${esc(alt)}</span>` : ''}</span>${k.fav ? `<span class="k-yil">${IC.yildizD}</span>` : ''}</button>`;
}
function bos(ic, b, m, d) { return `<div class="k-bos"><div class="k-bos-ic">${ic}</div><b>${b}</b><p>${m}</p>${d || ''}</div>`; }
function ciz() {
  const g = $('#kGovde'); if (!g) return;
  document.querySelectorAll('#kSek button').forEach(b => b.classList.toggle('on', b.dataset.k === K.gor));
  const detay = K.gor === 'grup' && K.grup;
  const ara0 = K.gor === 'kisi' || K.gor === 'fav' || detay;
  $('#kAra').hidden = !ara0;
  const bm = $('#kBrand'); bm.innerHTML = detay ? IC.geriK : IC.kisi; bm.dataset.action = detay ? 'k-geri' : ''; bm.classList.toggle('geri', !!detay);
  $('#kBaslik').textContent = detay ? (grupAd(K.grup) || 'Grup') : { kisi: 'Kişiler', fav: 'Favoriler', grup: 'Gruplar', dogum: 'Doğum günleri' }[K.gor];
  $('#kHarf').hidden = true; secBar();
  if (K.hata) { g.innerHTML = bos(IC.kisi, 'Depolama yok', esc(K.hata)); return; }
  if (!K.k.length && K.gor !== 'grup') { g.innerHTML = bos(IC.pasta, 'Rehberin burada olacak', 'İlk kişini ekle ya da telefonundaki rehberden seçerek getir. Hiçbir yere yüklenmez; hepsi cihazında kalır.', `<div class="k-bos-d"><button class="btn primary" data-action="k-yeni">${IC.plus} Kişi ekle</button><button class="btn" data-action="k-menu">${IC.yukK} İçe aktar</button></div>`); return; }
  if (K.gor === 'kisi' || K.gor === 'fav' || detay) {
    const l = aktif(); let h = '';
    if (K.gor === 'kisi') h += dogumSeridi();
    if (detay) { const gk = K.k.filter(k => k.grup.includes(K.grup)); h += `<div class="k-aks"><button class="btn primary" data-action="k-grup-ekle">${IC.plus} Kişi ekle</button>${gk.some(k => k.tel.length) ? `<button class="btn" data-action="k-grup-sms">${IC.mesaj} Toplu mesaj</button>` : ''}<button class="btn" data-action="k-grup-menu" aria-label="Grup menüsü">${IC.moreK}</button><span class="k-top">${gk.length} kişi</span></div>`; }
    if (!l.length) { g.innerHTML = h + bos(IC.kisi, K.q ? 'Sonuç yok' : K.gor === 'fav' ? 'Favori yok' : 'Bu grupta kimse yok', K.q ? 'Başka bir şey yazmayı dene.' : K.gor === 'fav' ? 'Bir kişiyi açıp yıldıza dokunarak favorile.' : '"Kişi ekle" ile gruba kişi kat.'); return; }
    let son = '', sat = '';
    for (const k of l) { const hf = harf(k); if (K.gor !== 'fav' && hf !== son) { son = hf; sat += `<div class="k-harf-b" data-h="${esc(hf)}">${esc(hf)}</div>`; } sat += satir(k); }
    g.innerHTML = h + `<div class="k-liste">${sat}</div><p class="k-say">${l.length} kişi</p>`;
    if (K.gor !== 'fav' && l.length > 15) { const hl = [...new Set(l.map(harf))]; const n = $('#kHarf'); n.hidden = false; n.innerHTML = hl.map(x => `<button data-action="k-harfe" data-h="${esc(x)}">${esc(x)}</button>`).join(''); }
  } else if (K.gor === 'grup') {
    g.innerHTML = `<div class="k-liste">${K.g.slice().sort((a, b) => tr(a.ad, b.ad)).map(x => `<button class="k-satir" data-action="k-grup" data-id="${esc(x.id)}"><span class="k-av k-grup-av">${IC.grup}</span><span class="k-sat-t"><b>${esc(x.ad)}</b><span>${K.k.filter(k => k.grup.includes(x.id)).length} kişi</span></span></button>`).join('')}<button class="k-satir yeni" data-action="k-grup-yeni"><span class="k-av k-grup-av">${IC.plus}</span><span class="k-sat-t"><b>Yeni grup</b><span>Aile, iş, arkadaşlar…</span></span></button></div>`;
  } else {
    const l = K.k.map(k => ({ k, d: sonrakiDogum(k.dogum) })).filter(x => x.d).sort((a, b) => a.d.gun - b.d.gun);
    g.innerHTML = l.length ? `<div class="k-liste">${l.map(({ k, d }) => `<button class="k-satir" data-action="k-ac" data-id="${esc(k.id)}">${avatar(k)}<span class="k-sat-t"><b>${esc(tamAd(k))}</b><span>${d.tarih.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}${d.yas ? ` · ${d.yas}. yaş` : ''}</span></span><span class="k-gun ${d.gun === 0 ? 'bugun' : d.gun <= 7 ? 'yakin' : ''}">${d.gun === 0 ? 'Bugün 🎂' : d.gun === 1 ? 'Yarın' : d.gun + ' gün'}</span></button>`).join('')}</div>` : bos(IC.pasta3, 'Doğum günü yok', 'Bir kişiyi düzenleyip doğum gününü yazarsan burada yaklaşanları görürsün.');
  }
}
function dogumSeridi() {
  const l = K.k.map(k => ({ k, d: sonrakiDogum(k.dogum) })).filter(x => x.d && x.d.gun <= 7).sort((a, b) => a.d.gun - b.d.gun).slice(0, 4);
  if (!l.length) return '';
  return `<div class="k-seridi">${IC.pasta3}<div>${l.map(({ k, d }) => `<button data-action="k-ac" data-id="${esc(k.id)}"><b>${esc(tamAd(k))}</b> ${d.gun === 0 ? 'bugün doğum günü 🎂' : d.gun === 1 ? 'yarın' : d.gun + ' gün sonra'}</button>`).join('')}</div></div>`;
}

/* ═════════ Pencere yardımcıları ═════════ */
function kSor(baslik, alanlar, tamam = 'Kaydet') {
  return new Promise(res => {
    $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-ask="x">${IC.close}</button><h3>${esc(baslik)}</h3></header>
      <form class="set-body" id="kSorForm">${alanlar.map((a, i) => `<label class="nask-l">${esc(a[0])}<input name="a${i}" value="${esc(a[1] || '')}" maxlength="${a[2] || 60}" autocomplete="off" required></label>`).join('')}
      <div class="sticky-actions"><button type="button" class="btn" data-ask="x">Vazgeç</button><button class="btn primary">${esc(tamam)}</button></div></form></div></div>`;
    const bit = v => { closeModal(); res(v); };
    $('#kSorForm').addEventListener('submit', e => { e.preventDefault(); bit(alanlar.map((_, i) => e.target.elements['a' + i].value.trim())); });
    $('#modal').querySelectorAll('[data-ask="x"]').forEach(b => b.onclick = () => bit(null)); setTimeout(() => $('#kSorForm input')?.select(), 50);
  });
}
function onay(baslik, metin, tamam = 'Tamam', tehlike = false) {
  return new Promise(res => {
    $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-ask="x">${IC.close}</button><h3>${esc(baslik)}</h3></header>
      <div class="set-body"><p class="muted sm" style="margin-top:0">${metin}</p><div class="sticky-actions"><button type="button" class="btn" data-ask="x">Vazgeç</button><button type="button" class="btn ${tehlike ? 'tehlike' : 'primary'}" data-ask="ok">${esc(tamam)}</button></div></div></div></div>`;
    $('#modal').querySelectorAll('[data-ask]').forEach(b => b.onclick = () => { closeModal(); res(b.dataset.ask === 'ok'); });
  });
}
function kPop(anchor, html, onClick) {
  document.querySelector('.kpop')?.remove();
  const m = document.createElement('div'); m.className = 'ctx-menu sched-pop kpop'; m.innerHTML = html; document.body.appendChild(m);
  const r = anchor.getBoundingClientRect(), w = m.offsetWidth, h = m.offsetHeight;
  m.style.left = Math.max(8, Math.min(r.right - w, innerWidth - w - 8)) + 'px'; m.style.top = (r.bottom + 6 + h < innerHeight ? r.bottom + 6 : Math.max(8, r.top - h - 6)) + 'px'; m.style.zIndex = 600;
  m.addEventListener('click', e => { const it = e.target.closest('[data-v]'); if (!it) return; m.remove(); onClick(it.dataset.v); });
  setTimeout(() => document.addEventListener('mousedown', function off(e) { if (!e.target.closest('.kpop')) { m.remove(); document.removeEventListener('mousedown', off); } }), 0);
}
const kItem = (v, ic, ad, ek = '') => `<button type="button" class="ctx-item" data-v="${esc(v)}" ${ek}>${ic || '<i></i>'}<span>${ad}</span></button>`;
async function copeAt(l) { for (const k of l) { k.silindi = Date.now(); await DB.yaz('kisi', k); K.k = K.k.filter(x => x !== k); K.cop.push(k); } }
async function geriAl(l) { for (const k of l) { k.silindi = 0; await DB.yaz('kisi', k); K.cop = K.cop.filter(x => x !== k); K.k.push(k); } }
const kayit = async k => { k.guncelleme = Date.now(); await DB.yaz('kisi', k); };

/* ═════════ Kişi ayrıntısı ═════════ */
function detayAc(id) {
  const k = kisi(id), d = $('#kDetay'); if (!k) return;
  const tn = t => TIPLER.find(x => x[0] === t)?.[1] || 'Diğer', dg = KE.sonrakiDogum(k.dogum), b = KE.dogumAyrac(k.dogum);
  d.hidden = false; d.dataset.id = id; document.documentElement.classList.add('k-acik');
  const ilkTel = k.tel[0]?.n, ilkMail = k.eposta[0]?.e;
  d.innerHTML = `<div class="k-d-ust"><button class="icon-btn" data-action="k-d-kapat" aria-label="Geri">${IC.geriK}</button><div class="spacer"></div>
      <button class="icon-btn ${k.fav ? 'on' : ''}" data-action="k-fav" data-id="${esc(id)}" aria-label="Favori">${k.fav ? IC.yildizD : IC.yildiz}</button><button class="icon-btn" data-action="k-duzenle" data-id="${esc(id)}" aria-label="Düzenle">${IC.kalemK}</button><button class="icon-btn" data-action="k-d-menu" data-id="${esc(id)}" aria-label="Diğer">${IC.moreK}</button></div>
    <div class="k-d-baslik">${avatar(k, 'buyuk')}<h2>${esc(tamAd(k))}</h2>${k.sirket || k.unvan ? `<p>${esc([k.unvan, k.sirket].filter(Boolean).join(' · '))}</p>` : ''}</div>
    <div class="k-d-hizli">${[['telefon', 'Ara', ilkTel ? `tel:${esc(ilkTel.replace(/[^\d+*#]/g, ''))}` : '', 'a'], ['mesaj', 'Mesaj', ilkTel ? `sms:${esc(ilkTel.replace(/[^\d+*#]/g, ''))}` : '', 'a'], ['wa', 'WhatsApp', ilkTel ? 'wa' : '', 'b'], ['posta', 'E-posta', ilkMail ? `mailto:${esc(ilkMail)}` : '', 'a']].map(([ic, n, h, tip]) => !h ? `<span class="k-hz pasif">${IC[ic]}<small>${n}</small></span>` : tip === 'a' ? `<a class="k-hz" href="${h}">${IC[ic]}<small>${n}</small></a>` : `<button class="k-hz" data-action="k-wa" data-n="${esc(ilkTel)}">${IC[ic]}<small>${n}</small></button>`).join('')}</div>
    <div class="k-d-kart">
      ${k.tel.map(t => `<div class="k-alan"><small>${tn(t.t)}</small><div><a href="tel:${esc(t.n.replace(/[^\d+*#]/g, ''))}">${esc(t.n)}</a><span><button class="icon-btn" data-action="k-sms" data-n="${esc(t.n)}" aria-label="Mesaj">${IC.mesaj}</button><button class="icon-btn" data-action="k-wa" data-n="${esc(t.n)}" aria-label="WhatsApp">${IC.wa}</button><button class="icon-btn" data-action="k-kopya" data-t="${esc(t.n)}" aria-label="Kopyala">${IC.kopyaK}</button></span></div></div>`).join('')}
      ${k.eposta.map(t => `<div class="k-alan"><small>E-posta · ${tn(t.t)}</small><div><a href="mailto:${esc(t.e)}">${esc(t.e)}</a><span><button class="icon-btn" data-action="k-kopya" data-t="${esc(t.e)}" aria-label="Kopyala">${IC.kopyaK}</button></span></div></div>`).join('')}
      ${k.adres ? `<div class="k-alan"><small>Adres</small><div><span class="k-metin">${esc(k.adres)}</span><span><button class="icon-btn" data-action="k-kopya" data-t="${esc(k.adres)}" aria-label="Kopyala">${IC.kopyaK}</button></span></div></div>` : ''}
      ${k.dogum && b ? `<div class="k-alan"><small>Doğum günü</small><div><span class="k-metin">${dg.tarih.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}${b.y ? ' ' + b.y : ''}${dg.gun === 0 ? ' · bugün 🎂' : ` · ${dg.gun} gün sonra${dg.yas ? ` (${dg.yas}. yaş)` : ''}`}</span></div></div>` : ''}
      ${k.grup.length ? `<div class="k-alan"><small>Gruplar</small><div class="k-chips">${k.grup.map(g => grupAd(g)).filter(Boolean).map(a => `<span>${esc(a)}</span>`).join('')}</div></div>` : ''}
      ${k.not ? `<div class="k-alan"><small>Not</small><div><span class="k-metin">${esc(k.not)}</span></div></div>` : ''}
      ${!k.tel.length && !k.eposta.length && !k.adres && !k.dogum && !k.not ? '<p class="muted sm" style="padding:6px 4px">Ek bilgi yok. Kalem simgesiyle ekleyebilirsin.</p>' : ''}</div>`;
}
const detayKapat = () => { const d = $('#kDetay'); d.hidden = true; d.innerHTML = ''; document.documentElement.classList.remove('k-acik'); };

/* ═════════ Ekleme / düzenleme formu ═════════ */
let F = null;
function formAc(id, ilk = {}) {
  const k = id ? kisi(id) : null;
  F = { id: id || null, foto: k?.foto || null, fotoDegisti: false, tel: (k?.tel || ilk.tel || []).map(x => ({ ...x })), eposta: (k?.eposta || []).map(x => ({ ...x })), grup: new Set(k?.grup || (K.gor === 'grup' && K.grup ? [K.grup] : [])) };
  if (!F.tel.length) F.tel.push({ t: 'cep', n: '' }); if (!F.eposta.length) F.eposta.push({ t: 'cep', e: '' });
  const f = $('#kForm'); f.hidden = false; document.documentElement.classList.add('k-acik');
  const v = (a, b) => esc(k?.[a] ?? ilk[a] ?? b ?? '');
  f.innerHTML = `<form id="kFormEl" autocomplete="off"><div class="k-d-ust"><button type="button" class="icon-btn" data-action="k-f-kapat" aria-label="Vazgeç">${IC.close}</button><b>${k ? 'Kişiyi düzenle' : 'Yeni kişi'}</b><div class="spacer"></div><button class="btn primary sm">Kaydet</button></div>
    <div class="k-f-govde"><div class="k-f-foto"><button type="button" data-action="k-f-foto" id="kFFoto">${fotoOnizle()}</button><button type="button" class="btn sm" data-action="k-f-foto-sil" ${F.foto ? '' : 'hidden'} id="kFFotoSil">Fotoğrafı kaldır</button></div>
      <div class="k-f-iki"><label class="nask-l">Ad<input name="ad" value="${v('ad')}" maxlength="80"></label><label class="nask-l">Soyad<input name="soyad" value="${v('soyad')}" maxlength="80"></label></div>
      <div class="k-f-iki"><label class="nask-l">Şirket<input name="sirket" value="${v('sirket')}" maxlength="120"></label><label class="nask-l">Unvan<input name="unvan" value="${v('unvan')}" maxlength="120"></label></div>
      <div class="k-f-bol"><h4>Telefon</h4><div id="kFTel"></div><button type="button" class="btn sm" data-action="k-f-tel-ekle">${IC.plus} Numara ekle</button></div>
      <div class="k-f-bol"><h4>E-posta</h4><div id="kFPosta"></div><button type="button" class="btn sm" data-action="k-f-posta-ekle">${IC.plus} E-posta ekle</button></div>
      <label class="nask-l">Adres<input name="adres" value="${v('adres')}" maxlength="300"></label>
      <label class="nask-l">Doğum günü<input type="date" name="dogum" value="${/^\d{4}-/.test(k?.dogum || '') ? esc(k.dogum) : ''}"><span class="g-ipucu">${/^--/.test(k?.dogum || '') ? 'Kayıtlı gün: ' + esc(k.dogum.slice(2)) + ' (yıl yok)' : 'Yılı bilmiyorsan boş bırak.'}</span></label>
      <div class="k-f-bol"><h4>Gruplar</h4><div class="k-chips sec" id="kFGrup"></div></div>
      <label class="nask-l">Not<textarea name="not" rows="3" maxlength="1000">${v('not')}</textarea></label>
      <p class="g-ipucu" id="kFHata" role="alert" style="color:#d4453a"></p></div></form>`;
  telCiz(); grupCiz();
  $('#kFormEl').addEventListener('submit', e => { e.preventDefault(); formKaydet(); });
  $('#kFormEl').addEventListener('input', e => { const el = e.target; if (el.dataset.ti != null) F.tel[+el.dataset.ti].n = el.value; else if (el.dataset.ei != null) F.eposta[+el.dataset.ei].e = el.value; });
  $('#kFormEl').addEventListener('change', e => { const el = e.target; if (el.dataset.tt != null) F.tel[+el.dataset.tt].t = el.value; else if (el.dataset.et != null) F.eposta[+el.dataset.et].t = el.value; });
  setTimeout(() => $('#kFormEl [name=ad]')?.focus(), 80);
}
const fotoOnizle = () => F.foto ? `<span class="k-av buyuk"><img src="${URL.createObjectURL(F.foto)}" alt=""></span>` : `<span class="k-av buyuk ekle">${IC.kisi}<small>Fotoğraf</small></span>`;
const tipSec = (t, a) => `<select ${a} aria-label="Tür">${TIPLER.map(([k, n]) => `<option value="${k}" ${k === t ? 'selected' : ''}>${n}</option>`).join('')}</select>`;
function telCiz() {
  $('#kFTel').innerHTML = F.tel.map((t, i) => `<div class="k-f-sat">${tipSec(t.t, `data-tt="${i}"`)}<input type="tel" inputmode="tel" value="${esc(t.n)}" data-ti="${i}" placeholder="05xx xxx xx xx" maxlength="40" aria-label="Numara"><button type="button" class="icon-btn" data-action="k-f-tel-sil" data-i="${i}" aria-label="Sil">${IC.close}</button></div>`).join('');
  $('#kFPosta').innerHTML = F.eposta.map((t, i) => `<div class="k-f-sat">${tipSec(t.t, `data-et="${i}"`)}<input type="email" value="${esc(t.e)}" data-ei="${i}" placeholder="ad@örnek.com" maxlength="120" aria-label="E-posta"><button type="button" class="icon-btn" data-action="k-f-posta-sil" data-i="${i}" aria-label="Sil">${IC.close}</button></div>`).join('');
}
function grupCiz() {
  const el = $('#kFGrup'); if (!el) return;
  el.innerHTML = K.g.slice().sort((a, b) => tr(a.ad, b.ad)).map(g => `<button type="button" class="${F.grup.has(g.id) ? 'on' : ''}" data-action="k-f-grup" data-id="${esc(g.id)}">${esc(g.ad)}</button>`).join('') + `<button type="button" class="yeni" data-action="k-f-grup-yeni">${IC.plus} Yeni grup</button>`;
}
async function formKaydet() {
  const fm = $('#kFormEl').elements, e = $('#kFHata');
  const o = kTemiz({ id: F.id || uid(), ad: fm.ad.value.trim(), soyad: fm.soyad.value.trim(), sirket: fm.sirket.value.trim(), unvan: fm.unvan.value.trim(), tel: F.tel.filter(t => t.n.trim()), eposta: F.eposta.filter(t => t.e.trim()),
    adres: fm.adres.value.trim(), dogum: fm.dogum.value || (F.id && /^--/.test(kisi(F.id)?.dogum || '') ? kisi(F.id).dogum : ''), not: fm.not.value.trim(), grup: [...F.grup], foto: F.foto });
  if (!o.ad && !o.soyad && !o.sirket && !o.tel.length && !o.eposta.length) { e.textContent = 'En az bir ad, şirket, numara ya da e-posta yaz.'; return; }
  const eski = F.id ? kisi(F.id) : null;
  if (eski) { o.fav = eski.fav; o.olusturma = eski.olusturma; }
  if (!eski) { const kopya = K.k.find(x => o.tel.some(t => t.n && x.tel.some(y => son10(y.n) === son10(t.n) && son10(t.n).length >= 7))); if (kopya && !(await onay('Bu numara zaten var', `"${esc(tamAd(kopya))}" kişisinde aynı numara kayıtlı. Yine de yeni kişi olarak eklensin mi?`, 'Yine de ekle'))) return; }
  await kayit(o);
  if (eski) K.k[K.k.indexOf(eski)] = o; else K.k.push(o);
  formKapat(); ciz(); if (!$('#kDetay').hidden || eski) detayAc(o.id); toast(eski ? 'Kişi güncellendi' : 'Kişi eklendi');
}
const formKapat = () => { const f = $('#kForm'); f.hidden = true; f.innerHTML = ''; F = null; if ($('#kDetay').hidden) document.documentElement.classList.remove('k-acik'); };

/* ═════════ İşlemler ═════════ */
async function favDegis(k) { k.fav = !k.fav; await kayit(k); }
async function kisiSil(k) {
  if (!(await onay('Kişi silinsin mi?', `"${esc(tamAd(k))}" çöp kutusuna taşınır, 30 gün içinde geri alabilirsin. Telefonunun kendi rehberi etkilenmez.`, 'Sil', true))) return false;
  await copeAt([k]); return true;
}
async function waAc(n) {
  const num = ulkeli(n, K.ayar.ulke); if (!num) return toast('Numara geçersiz');
  if (!(await onay('WhatsApp açılsın mı?', `"+${esc(num)}" numarasıyla WhatsApp sohbeti açılır. Numara yalnızca WhatsApp'a (wa.me bağlantısı) iletilir.`, 'Aç'))) return;
  window.open(`https://wa.me/${num}`, '_blank', 'noopener');
}
function indirDosya(blob, ad) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = ad.replace(/[\\/:*?"<>|]/g, '_'); document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 8000); }
const bugun = () => { const t = new Date(); return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`; };
async function disaAktar(l, ad) { if (!l.length) return toast('Aktarılacak kişi yok'); indirDosya(await KE.vcfYaz(l, grupAd), `${ad} ${bugun()}.vcf`); toast(`${l.length} kişi .vcf olarak indirildi`); }
async function paylasVcf(k) {
  const f = new File([await KE.vcfYaz([k], grupAd)], `${tamAd(k)}.vcf`, { type: 'text/vcard' });
  if (navigator.canShare?.({ files: [f] })) { try { await navigator.share({ files: [f] }); } catch (e) { if (e?.name !== 'AbortError') indirDosya(f, f.name); } } else indirDosya(f, f.name);
}
async function iceAktar(liste) {
  if (!liste.length) return toast('İçe aktarılacak kişi bulunamadı');
  if (K.mesgul) return; K.mesgul = true; let yeni = 0, atla = 0, gruplar = 0;
  try {
    const grupId = new Map(K.g.map(g => [g.ad.toLocaleLowerCase('tr'), g.id])), eklenecek = [];
    for (const v of liste) {
      const o = kTemiz({ id: uid(), ad: v.ad, soyad: v.soyad, sirket: v.sirket, unvan: v.unvan, tel: v.tel, eposta: v.eposta, adres: v.adres, dogum: v.dogum, not: v.not, grup: [], foto: v.foto ? await KE.fotoKucult(v.foto) : null });
      if (!o) continue;
      const var0 = [...K.k, ...eklenecek].some(x => (o.tel.some(t => son10(t.n).length >= 7 && x.tel.some(y => son10(y.n) === son10(t.n)))) || (tamAd(x).toLocaleLowerCase('tr') === tamAd(o).toLocaleLowerCase('tr') && !o.tel.length && !x.tel.length));
      if (var0) { atla++; continue; }
      for (const ga of v.grupAd || []) { const key = ga.toLocaleLowerCase('tr'); let id = grupId.get(key); if (!id) { id = uid(); const g = { id, ad: ga }; K.g.push(g); await DB.yaz('grup', g); grupId.set(key, id); gruplar++; } o.grup.push(id); }
      eklenecek.push(o);
    }
    await DB.cokYaz('kisi', eklenecek); K.k.push(...eklenecek); yeni = eklenecek.length;
  } catch (e) { toast('İçe aktarılamadı: ' + e.message); } finally { K.mesgul = false; }
  ciz(); toast(`${yeni} kişi eklendi${atla ? ` · ${atla} zaten vardı` : ''}${gruplar ? ` · ${gruplar} yeni grup` : ''}`);
}
async function rehberdenSec() {
  if (!('contacts' in navigator && 'ContactsManager' in window)) return toast('Bu tarayıcı rehber seçiciyi desteklemiyor. Rehber uygulamandan .vcf dışa aktarıp buraya içe aktarabilirsin.');
  try {
    const ozel = await navigator.contacts.getProperties?.().catch(() => null), alan = ['name', 'tel', 'email', 'address', 'icon'].filter(a => !ozel || ozel.includes(a));
    const sec = await navigator.contacts.select(alan, { multiple: true }); if (!sec?.length) return;
    const l = [];
    for (const c of sec) {
      const ad = (c.name?.[0] || '').trim().split(/\s+/), soyad = ad.length > 1 ? ad.pop() : '', a = c.address?.[0];
      l.push({ ad: ad.join(' '), soyad, sirket: '', unvan: '', tel: (c.tel || []).map(n => ({ t: 'cep', n })), eposta: (c.email || []).map(e => ({ t: 'cep', e })), adres: a ? [...(a.addressLine || []), a.city, a.region, a.country].filter(Boolean).join(', ') : '', dogum: '', not: '', grupAd: [], foto: c.icon?.[0] || null });
    }
    await iceAktar(l);
  } catch (e) { if (e?.name !== 'AbortError') toast('Rehber seçilemedi: ' + e.message); }
}
/* kopya birleştirme */
function kopyaGruplari() {
  const ata = K.k.map((_, i) => i), bul = i => { while (ata[i] !== i) { ata[i] = ata[ata[i]]; i = ata[i]; } return i; }, kayitli = new Map();
  K.k.forEach((k, i) => { const anahtar = [...k.tel.map(t => 'n' + son10(t.n)).filter(x => x.length >= 8), ...k.eposta.map(e => 'e' + e.e.trim().toLowerCase()), ...((k.ad || k.soyad) ? ['a' + tamAd(k).toLocaleLowerCase('tr')] : [])]; for (const a of anahtar) { if (kayitli.has(a)) ata[bul(i)] = bul(kayitli.get(a)); else kayitli.set(a, i); } });
  const gr = new Map(); K.k.forEach((k, i) => { const r = bul(i); (gr.get(r) || gr.set(r, []).get(r)).push(k); });
  return [...gr.values()].filter(g => g.length > 1);
}
async function birlestir(g) {
  const [ana, ...diger] = g.slice().sort((a, b) => (b.tel.length + b.eposta.length + (b.foto ? 1 : 0)) - (a.tel.length + a.eposta.length + (a.foto ? 1 : 0)));
  for (const x of diger) {
    for (const t of x.tel) if (!ana.tel.some(y => son10(y.n) === son10(t.n))) ana.tel.push(t);
    for (const e of x.eposta) if (!ana.eposta.some(y => y.e.toLowerCase() === e.e.toLowerCase())) ana.eposta.push(e);
    for (const a of ['sirket', 'unvan', 'adres', 'dogum']) if (!ana[a] && x[a]) ana[a] = x[a];
    if (x.not && !ana.not.includes(x.not)) ana.not = [ana.not, x.not].filter(Boolean).join('\n');
    ana.grup = [...new Set([...ana.grup, ...x.grup])]; ana.fav = ana.fav || x.fav; if (!ana.foto && x.foto) ana.foto = x.foto;
    await DB.sil('kisi', x.id); K.k = K.k.filter(y => y !== x);
  }
  await kayit(ana);
}
function birlestirAc() {
  const gr = kopyaGruplari();
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Kopya kişiler</h3></header><div class="set-body">${gr.length ? `<p class="muted sm" style="margin-top:0">Aynı numara, e-posta ya da ada sahip ${gr.length} grup bulundu. Birleştirince numara, e-posta, grup ve notlar tek kişide toplanır.</p>
    ${gr.map((g, i) => `<div class="k-kop"><div>${g.map(k => `<div class="k-kop-k">${avatar(k)}<span class="k-sat-t"><b>${esc(tamAd(k))}</b><span>${esc(k.tel.map(t => t.n).join(', ') || k.eposta[0]?.e || '')}</span></span></div>`).join('')}</div><button class="btn sm primary" data-action="k-birlestir" data-i="${i}">Birleştir</button></div>`).join('')}
    <div class="sticky-actions"><button type="button" class="btn" data-action="close-modal">Kapat</button><button type="button" class="btn primary" data-action="k-birlestir-hepsi">${IC.birlesK} Hepsini birleştir (${gr.length})</button></div>` : `<div class="k-bos" style="padding:20px 0"><b>Kopya bulunamadı</b><p>Rehberin temiz görünüyor.</p></div><div class="sticky-actions"><button type="button" class="btn primary" data-action="close-modal">Tamam</button></div>`}</div></div></div>`;
  K.kop = gr;
}
async function ayarAc() {
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Kişiler ayarları</h3></header>
    <div class="set-body k-ayar"><section><h4>Rehber</h4><p class="muted sm">${K.k.length} kişi · ${K.g.length} grup</p></section>
      <section><h4>Sıralama ve görünüm</h4><label class="g-sw"><input type="checkbox" id="kSoyad" ${K.ayar.soyadaGore ? 'checked' : ''}><span>Soyadına göre sırala</span></label><div class="seg yon-seg" style="margin-top:10px">${[['light', 'Açık'], ['dark', 'Koyu'], ['auto', 'Otomatik']].map(([k, n]) => `<button class="${store.get('theme', 'auto') === k ? 'on' : ''}" data-action="k-tema" data-t="${k}">${n}</button>`).join('')}</div></section>
      <section><h4>WhatsApp</h4><label class="nask-l">Varsayılan ülke kodu<input id="kUlke" value="${esc(K.ayar.ulke)}" inputmode="numeric" maxlength="4"><span class="g-ipucu">Başında 0 olan ya da ülke kodsuz numaralarda kullanılır (Türkiye: 90).</span></label></section>
      <section><h4>Yedek</h4><p class="muted sm">Yedek, bütün kişilerini (gruplar ve fotoğraflar dahil) tek bir .vcf dosyasına yazar. Aynı dosyayı geri yükleyebilir ya da başka telefona taşıyabilirsin.</p><div class="k-satir-b"><button class="btn" data-action="k-hepsi-ver">${IC.indirK} Yedek al (.vcf)</button><button class="btn" data-action="k-vcf-sec">${IC.yukK} Yedekten yükle</button></div></section>
      <section><h4>Çöp kutusu</h4><p class="muted sm">Silinen kişiler 30 gün burada bekler.</p><button class="btn" data-action="k-cop">${IC.copK} Çöp kutusu (${K.cop.length})</button></section>
      <section><h4>Tehlikeli bölge</h4><button class="btn tehlike" data-action="k-hepsini-sil">Tüm rehberi sil</button></section></div></div></div>`;
  $('#kSoyad').onchange = e => { K.ayar.soyadaGore = e.target.checked; store.set('kAyar', K.ayar); ciz(); };
  $('#kUlke').oninput = e => { K.ayar.ulke = e.target.value.replace(/\D/g, '') || '90'; store.set('kAyar', K.ayar); };
}

/* ═════════ Çoklu seçim, çöp kutusu, QR ═════════ */
function secBar() {
  let b = $('#kSecBar'); if (!K.sec) { b?.remove(); return; }
  if (!b) { b = document.createElement('div'); b.id = 'kSecBar'; b.className = 'k-secbar'; $('#kKabuk').appendChild(b); }
  const n = K.sec.size, d = n ? '' : 'disabled';
  b.innerHTML = `<b>${n} seçili</b><button class="btn sm" data-action="k-s-hepsi">Tümü</button><button class="btn sm" data-action="k-s-grup" ${d}>${IC.grup} Gruba</button><button class="btn sm" data-action="k-s-fav" ${d}>${IC.yildiz} Favori</button><button class="btn sm" data-action="k-s-vcf" ${d}>${IC.indirK} .vcf</button><button class="btn sm tehlike" data-action="k-s-sil" ${d}>${IC.copK} Sil</button><button class="btn sm" data-action="k-s-bitir">Bitti</button>`;
}
const seciliKisiler = () => K.k.filter(k => K.sec?.has(k.id));
function copAc() {
  const l = K.cop.slice().sort((a, b) => b.silindi - a.silindi);
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Çöp kutusu</h3></header><div class="set-body">${l.length ? `<p class="muted sm" style="margin-top:0">Silinenler 30 gün sonra kalıcı olarak yok olur.</p>${l.map(k => `<div class="k-kop"><div class="k-kop-k">${avatar(k)}<span class="k-sat-t"><b>${esc(tamAd(k))}</b><span>${Math.max(0, 30 - Math.floor((Date.now() - k.silindi) / 864e5))} gün kaldı</span></span></div><button class="btn sm primary" data-action="k-cop-geri" data-id="${esc(k.id)}">Geri al</button><button class="icon-btn tehlike" data-action="k-cop-sil" data-id="${esc(k.id)}" aria-label="Kalıcı sil">${IC.close}</button></div>`).join('')}<div class="sticky-actions"><button type="button" class="btn" data-action="close-modal">Kapat</button><button type="button" class="btn tehlike" data-action="k-cop-bosalt">Çöpü boşalt</button></div>` : `<div class="k-bos" style="padding:20px 0"><b>Çöp kutusu boş</b></div><div class="sticky-actions"><button type="button" class="btn primary" data-action="close-modal">Tamam</button></div>`}</div></div></div>`;
}
async function qrGoster(k) {
  try {
    const metin = await (await KE.vcfYaz([{ ...k, foto: null, not: '', grup: [] }], grupAd)).text();
    if (!window.ZXing) await new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'qr-lib/zxing.js'; s.onload = res; s.onerror = () => rej(new Error('QR kitaplığı yüklenemedi')); document.head.appendChild(s); });
    const Z = window.ZXing, h = new Map(); h.set(Z.EncodeHintType.CHARACTER_SET, 'UTF-8');
    const m = Z.QRCodeEncoder.encode(metin, Z.QRCodeDecoderErrorCorrectionLevel.fromString('L'), h).getMatrix(), n = m.getWidth(), kenar = 4, px = 6, boy = (n + kenar * 2) * px;
    $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>${esc(tamAd(k))}</h3></header><div class="set-body" style="text-align:center"><canvas id="kQr" width="${boy}" height="${boy}" style="width:min(300px,100%);image-rendering:pixelated;border-radius:12px"></canvas><p class="muted sm">Başka telefonun kamerası ya da QR okuyucusu bunu okutunca kişi kartı açılır. Not ve fotoğraf eklenmez.</p><div class="sticky-actions"><button type="button" class="btn primary" data-action="close-modal">Tamam</button></div></div></div></div>`;
    const g = $('#kQr').getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, boy, boy); g.fillStyle = '#000';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (m.get(x, y) === 1) g.fillRect((x + kenar) * px, (y + kenar) * px, px, px);
  } catch (e) { toast('QR oluşturulamadı: ' + (e.message.includes('too') || e.message.includes('Data') ? 'kişi bilgisi çok uzun' : e.message)); }
}

/* ═════════ Eylemler ═════════ */
const git = k => { K.q = ''; const i = $('#kAraIn'); if (i) i.value = ''; K.gor = k; K.grup = null; store.set('kGor', k); ciz(); $('#kGovde').scrollTop = 0; };
Object.assign(ACTIONS, {
  'k-s-hepsi': () => { const l = aktif(); K.sec = new Set(K.sec.size === l.length ? [] : l.map(k => k.id)); ciz(); },
  'k-s-bitir': () => { K.sec = null; ciz(); },
  'k-s-fav': async () => { const l = seciliKisiler(), hepsi = l.every(k => k.fav); for (const k of l) { k.fav = !hepsi; await kayit(k); } toast(hepsi ? 'Favoriden çıkarıldı' : 'Favorilere eklendi'); K.sec = null; ciz(); },
  'k-s-vcf': () => { const l = seciliKisiler(); disaAktar(sirali(l), 'Seçilen kişiler'); },
  'k-s-sil': async () => { const l = seciliKisiler(); if (!(await onay(`${l.length} kişi silinsin mi?`, 'Seçilenler çöp kutusuna taşınır, 30 gün içinde geri alabilirsin.', 'Sil', true))) return; await copeAt(l); K.sec = null; ciz(); toast(`${l.length} kişi çöp kutusunda`, [['Geri al', async () => { await geriAl(l); ciz(); }]]); },
  'k-s-grup': () => {
    const gl = K.g.slice().sort((a, b) => tr(a.ad, b.ad));
    $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Gruba ekle</h3></header><div class="set-body"><div class="k-chips sec">${gl.map(g => `<button type="button" data-action="k-s-grup-ekle" data-id="${esc(g.id)}">${esc(g.ad)}</button>`).join('')}<button type="button" class="yeni" data-action="k-s-grup-yeni">${IC.plus} Yeni grup</button></div></div></div></div>`;
  },
  'k-s-grup-ekle': async el => { const id = el.dataset.id, l = seciliKisiler(); for (const k of l) if (!k.grup.includes(id)) { k.grup = [...k.grup, id]; await kayit(k); } closeModal(); K.sec = null; ciz(); toast(`${l.length} kişi "${grupAd(id)}" grubuna eklendi`); },
  'k-s-grup-yeni': async () => { const r = await kSor('Yeni grup', [['Grubun adı', '', 40]]); if (!r) return; const g = { id: uid(), ad: r[0] }; K.g.push(g); await DB.yaz('grup', g); const l = seciliKisiler(); for (const k of l) { k.grup = [...k.grup, g.id]; await kayit(k); } K.sec = null; ciz(); toast(`${l.length} kişi "${g.ad}" grubuna eklendi`); },
  'k-cop': () => copAc(),
  'k-cop-geri': async el => { const k = K.cop.find(x => x.id === el.dataset.id); if (k) { await geriAl([k]); ciz(); copAc(); toast('Geri alındı'); } },
  'k-cop-sil': async el => { const k = K.cop.find(x => x.id === el.dataset.id); if (k) { await DB.sil('kisi', k.id); K.cop = K.cop.filter(x => x !== k); copAc(); } },
  'k-cop-bosalt': async () => { for (const k of K.cop) await DB.sil('kisi', k.id); K.cop = []; copAc(); toast('Çöp boşaltıldı'); },
  'k-gor': el => git(el.dataset.k),
  'k-geri': () => { K.q = ''; const i = $('#kAraIn'); if (i) i.value = ''; K.grup = null; ciz(); },
  'k-ac': el => { if (K.sec) { const i = el.dataset.id; K.sec.has(i) ? K.sec.delete(i) : K.sec.add(i); ciz(); } else detayAc(el.dataset.id); },
  'k-d-kapat': () => detayKapat(),
  'k-yeni': () => formAc(null),
  'k-duzenle': el => formAc(el.dataset.id),
  'k-fav': async el => { const k = kisi(el.dataset.id); if (!k) return; await favDegis(k); detayAc(k.id); ciz(); },
  'k-kopya': async el => { try { await navigator.clipboard.writeText(el.dataset.t); toast('Kopyalandı'); } catch { toast('Kopyalanamadı'); } },
  'k-sms': el => { location.href = 'sms:' + el.dataset.n.replace(/[^\d+*#]/g, ''); },
  'k-wa': el => waAc(el.dataset.n),
  'k-harfe': el => { $(`.k-harf-b[data-h="${CSS.escape(el.dataset.h)}"]`)?.scrollIntoView({ block: 'start' }); },
  'k-d-menu': el => {
    const k = kisi(el.dataset.id); if (!k) return;
    kPop(el, `${kItem('qr', IC.kopyaK, 'QR kod olarak göster')}${kItem('paylas', IC.yukK, '.vcf olarak paylaş')}${kItem('sil', IC.copK, 'Kişiyi sil…', 'data-danger')}`, async v => {
      if (v === 'paylas') paylasVcf(k); if (v === 'qr') qrGoster(k);
      if (v === 'sil' && await kisiSil(k)) { detayKapat(); ciz(); toast('Çöp kutusuna taşındı', [['Geri al', async () => { await geriAl([k]); ciz(); }]]); }
    });
  },
  /* form */
  'k-f-kapat': () => formKapat(),
  'k-f-foto': () => $('#kFotoIn').click(),
  'k-f-foto-sil': () => { F.foto = null; $('#kFFoto').innerHTML = fotoOnizle(); $('#kFFotoSil').hidden = true; },
  'k-f-tel-ekle': () => { F.tel.push({ t: 'cep', n: '' }); telCiz(); },
  'k-f-posta-ekle': () => { F.eposta.push({ t: 'cep', e: '' }); telCiz(); },
  'k-f-tel-sil': el => { F.tel.splice(+el.dataset.i, 1); if (!F.tel.length) F.tel.push({ t: 'cep', n: '' }); telCiz(); },
  'k-f-posta-sil': el => { F.eposta.splice(+el.dataset.i, 1); if (!F.eposta.length) F.eposta.push({ t: 'cep', e: '' }); telCiz(); },
  'k-f-grup': el => { const id = el.dataset.id; if (F.grup.has(id)) F.grup.delete(id); else F.grup.add(id); grupCiz(); },
  'k-f-grup-yeni': async () => { const r = await kSor('Yeni grup', [['Grubun adı', '', 40]]); if (!r) return; const g = { id: uid(), ad: r[0] }; K.g.push(g); await DB.yaz('grup', g); F?.grup.add(g.id); grupCiz(); },
  /* gruplar */
  'k-grup': el => { K.q = ''; K.grup = el.dataset.id; ciz(); $('#kGovde').scrollTop = 0; },
  'k-grup-yeni': async () => { const r = await kSor('Yeni grup', [['Grubun adı', '', 40]]); if (!r) return; const g = { id: uid(), ad: r[0] }; K.g.push(g); await DB.yaz('grup', g); K.grup = g.id; ciz(); },
  'k-grup-menu': el => {
    const g = K.g.find(x => x.id === K.grup); if (!g) return;
    kPop(el, `${kItem('ad', IC.kalemK, 'Yeniden adlandır…')}${kItem('ver', IC.indirK, 'Grubu .vcf olarak indir')}${kItem('sil', IC.copK, 'Grubu sil…', 'data-danger')}`, async v => {
      if (v === 'ad') { const r = await kSor('Grubu adlandır', [['Grubun adı', g.ad, 40]]); if (r) { g.ad = r[0]; await DB.yaz('grup', g); ciz(); } }
      if (v === 'ver') disaAktar(K.k.filter(k => k.grup.includes(g.id)), g.ad);
      if (v === 'sil' && await onay('Grup silinsin mi?', `"${esc(g.ad)}" grubu silinir; içindeki kişiler rehberinde kalır.`, 'Sil', true)) { for (const k of K.k.filter(k => k.grup.includes(g.id))) { k.grup = k.grup.filter(x => x !== g.id); await kayit(k); } await DB.sil('grup', g.id); K.g = K.g.filter(x => x !== g); K.grup = null; ciz(); }
    });
  },
  'k-grup-sms': () => { const n = K.k.filter(k => k.grup.includes(K.grup) && k.tel[0]).map(k => k.tel[0].n.replace(/[^\d+*#]/g, '')); if (n.length) location.href = 'sms:' + n.join(','); },
  'k-grup-ekle': () => {
    const g = K.g.find(x => x.id === K.grup); if (!g) return;
    $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>"${esc(g.ad)}" grubuna kişi ekle</h3></header><div class="set-body"><div class="k-sec-l">${sirali(K.k).map(k => `<label class="k-sec"><input type="checkbox" value="${esc(k.id)}" ${k.grup.includes(g.id) ? 'checked' : ''}>${avatar(k)}<span class="k-sat-t"><b>${esc(tamAd(k))}</b></span></label>`).join('')}</div>
      <div class="sticky-actions"><button type="button" class="btn" data-action="close-modal">Vazgeç</button><button type="button" class="btn primary" data-action="k-grup-kaydet">Kaydet</button></div></div></div></div>`;
  },
  'k-grup-kaydet': async () => {
    const sec = new Set([...document.querySelectorAll('.k-sec input:checked')].map(i => i.value));
    for (const k of K.k) { const var0 = k.grup.includes(K.grup), ist = sec.has(k.id); if (var0 !== ist) { k.grup = ist ? [...k.grup, K.grup] : k.grup.filter(x => x !== K.grup); await kayit(k); } }
    closeModal(); ciz();
  },
  /* aktar, araçlar */
  'k-menu': el => kPop(el, `${kItem('sec', IC.kisi, 'Telefon rehberinden seç…')}${kItem('vcf', IC.yukK, '.vcf dosyası içe aktar…')}${kItem('ver', IC.indirK, 'Tüm kişileri .vcf olarak indir')}${kItem('birlestir', IC.birlesK, 'Kopya kişileri birleştir…')}${kItem('coklu', IC.kisi, 'Çoklu seç')}${kItem('cop', IC.copK, `Çöp kutusu (${K.cop.length})`)}`, v => {
    if (v === 'sec') rehberdenSec(); if (v === 'vcf') $('#kVcf').click(); if (v === 'ver') disaAktar(sirali(K.k), 'Kişiler'); if (v === 'birlestir') birlestirAc(); if (v === 'coklu') { K.sec = new Set(); ciz(); } if (v === 'cop') copAc();
  }),
  'k-vcf-sec': () => { closeModal(); $('#kVcf').click(); },
  'k-hepsi-ver': () => { closeModal(); disaAktar(sirali(K.k), 'Kişiler yedeği'); },
  'k-birlestir': async el => { const g = K.kop?.[+el.dataset.i]; if (!g) return; await birlestir(g); ciz(); birlestirAc(); toast('Birleştirildi'); },
  'k-birlestir-hepsi': async () => { const gr = K.kop || []; for (const g of gr) await birlestir(g); closeModal(); ciz(); toast(`${gr.length} grup birleştirildi`); },
  'k-ayar': () => ayarAc(),
  'k-tema': el => { store.set('theme', el.dataset.t); applyTheme(el.dataset.t); ayarAc(); },
  'k-hepsini-sil': async () => {
    closeModal(); if (!(await onay('Tüm rehber silinsin mi?', 'Bütün kişi ve gruplar bu cihazdan <b>kalıcı olarak</b> silinir. Önce yedek almanı öneririz.', 'Hepsini sil', true))) return;
    await DB.temizle('kisi'); await DB.temizle('grup'); K.foto.forEach(u => URL.revokeObjectURL(u)); K.foto.clear(); K.k = []; K.cop = []; K.g = []; K.grup = null; ciz(); toast('Rehber silindi');
  }
});
document.addEventListener('change', async e => {
  if (e.target.id !== 'kFotoIn') return; const f = e.target.files[0]; e.target.value = ''; if (!f || !F) return;
  const b = await KE.fotoKucult(f); if (!b) return toast('Fotoğraf okunamadı'); F.foto = b; F.fotoDegisti = true; $('#kFFoto').innerHTML = fotoOnizle(); $('#kFFotoSil').hidden = false;
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!$('#kForm').hidden) formKapat(); else if (!$('#kDetay').hidden) detayKapat();
});
