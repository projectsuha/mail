/* ───────────── Galeri ─────────────
   Özel albüm: seçtiğin fotoğraf ve videoları cihazında (IndexedDB) saklar. Albümler, favoriler, slayt gösterisi,
   tarih ve yer gezintisi, parolalı (şifreli) albüm, silinenler, yedek. Giriş gerekmez, ağ isteği yapılmaz. Motor galeri-is.js'te. */
'use strict';

window.APP_NAME = 'Galeri';
window.APP_ICON = 'galeri-apple.png?v=1';
window.APP_LEAD = 'Fotoğraf ve videolarını albümlere ayır, favorile, slayt gösterisi izle; istediğin albümü parolayla kilitle. Hepsi cihazında kalır. Ücretsiz, reklamsız.';

const { DB, bayt, sureYaz, pad } = GE;
const GS = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
Object.assign(IC, {
  foto: GS('<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.7"/><path d="m4 17.5 5-4.5 3.5 3 2.5-2 5 3.5"/>'),
  album: GS('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M4 14.5l4-3.5 4 3.5 3-2.5 5 4"/>'),
  yer: GS('<path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 0 0-13 0C5.5 15.4 12 21 12 21z"/><circle cx="12" cy="10" r="2.3"/>'),
  kalp: GS('<path d="M12 19.5S4 14.6 4 9.2A4.2 4.2 0 0 1 8.2 5c1.5 0 2.9.8 3.8 2 .9-1.2 2.3-2 3.8-2A4.2 4.2 0 0 1 20 9.2c0 5.4-8 10.3-8 10.3z"/>'),
  kalpDolu: GS('<path d="M12 19.5S4 14.6 4 9.2A4.2 4.2 0 0 1 8.2 5c1.5 0 2.9.8 3.8 2 .9-1.2 2.3-2 3.8-2A4.2 4.2 0 0 1 20 9.2c0 5.4-8 10.3-8 10.3z" fill="currentColor"/>'),
  oynat: GS('<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>'),
  durdur: GS('<path d="M8.5 5.5v13M15.5 5.5v13"/>'),
  kilit: GS('<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/><circle cx="12" cy="15.2" r="1.1" fill="currentColor"/>'),
  secK: GS('<rect x="4" y="4" width="16" height="16" rx="3.5"/><path d="m8.5 12 2.5 2.5 4.5-5"/>'),
  bilgi: GS('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.4"/>'),
  indirG: GS('<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M5 19h14"/>'),
  paylasG: GS('<path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 12v7h14v-7"/>'),
  copG: GS('<path d="M5 7h14M10 7V4.5h4V7M7 7l1 12h8l1-12"/>'),
  takvim: GS('<rect x="4" y="5.5" width="16" height="14" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>'),
  yogun: GS('<rect x="4" y="4" width="6.5" height="6.5" rx="1.2"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2"/>'),
  more: GS('<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>'),
  geri: GS('<path d="M15 5l-7 7 7 7"/>'),
  ileri: GS('<path d="M9 5l7 7-7 7"/>'),
  tam: GS('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>')
});

const G = { ogeler: [], albumler: [], gor: store.get('gGor', 'foto'), alb: null, yer: null, sec: false, secili: new Set(), url: new Map(), kilit: {}, yog: +store.get('gYog', 1) || 1, hata: '', ayar: store.get('gAyar', { konumSil: true, kare: false }), mesgul: false, q: '', suzT: 'all', kol: null, son: '' };
const YOG = [80, 104, 160];
const dar = () => window.matchMedia('(max-width: 700px)').matches;
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const aylik = t => new Date(t).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
const gunluk = t => new Date(t).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
const ayAnahtar = t => { const d = new Date(t); return d.getFullYear() + '-' + pad(d.getMonth() + 1); };
const alb = id => G.albumler.find(a => a.id === id);
const oge = id => { for (const k of Object.values(G.kilit)) { const x = k.ogeler.find(o => o.id === id); if (x) return x; } return G.ogeler.find(o => o.id === id); };   // kilitli albümde çözülmüş görünüm önce
const gorunur = o => !o.sil && !o.sifreli;

/* ═════════ Temizleme: veritabanından gelen kayıt hiçbir zaman olduğu gibi kullanılmaz ═════════ */
const kisalt = (s, n) => String(s ?? '').slice(0, n);
function konumTemiz(k) { const la = +k?.la, lo = +k?.lo; return Number.isFinite(la) && Number.isFinite(lo) && Math.abs(la) <= 90 && Math.abs(lo) <= 180 ? { la, lo } : null; }
const etkTemiz = a => Array.isArray(a) ? [...new Set(a.map(x => kisalt(String(x ?? '').trim().toLocaleLowerCase('tr').replace(/^#/, ''), 30)).filter(Boolean))].slice(0, 20) : [];
function ogeTemiz(o) {
  if (!o || typeof o !== 'object' || !o.id) return null;
  const s = GE.sayi;
  return { id: kisalt(o.id, 40), ad: kisalt(o.ad, 200), tur: o.tur === 'video' ? 'video' : 'foto', tip: kisalt(o.tip, 80), boyut: s(o.boyut, 0, 1e12, 0), w: s(o.w, 0, 1e5, 0) | 0, h: s(o.h, 0, 1e5, 0) | 0,
    sure: s(o.sure, 0, 1e7, 0), tarih: s(o.tarih, 0, 4e12, Date.now()), eklenme: s(o.eklenme, 0, 4e12, Date.now()), konum: konumTemiz(o.konum), album: kisalt(o.album, 40), fav: !!o.fav,
    not: kisalt(o.not, 600), etk: etkTemiz(o.etk), sil: o.sil ? s(o.sil, 0, 4e12, Date.now()) : 0, sifreli: !!o.sifreli, kucuk: o.kucuk instanceof Blob ? o.kucuk : null, e: o.e instanceof ArrayBuffer ? o.e : null, kucukE: o.kucukE instanceof ArrayBuffer ? o.kucukE : null };
}
function albumTemiz(a) {
  if (!a || typeof a !== 'object' || !a.id) return null;
  const kilit = a.kilit && typeof a.kilit.salt === 'string' && typeof a.kilit.dogr === 'string' ? { salt: kisalt(a.kilit.salt, 40), dogr: kisalt(a.kilit.dogr, 200) } : null;
  return { id: kisalt(a.id, 40), ad: kisalt(a.ad, 60) || 'Albüm', olusturma: GE.sayi(a.olusturma, 0, 4e12, Date.now()), kapak: kisalt(a.kapak, 40), kilit };
}

/* ═════════ Başlangıç ═════════ */
document.removeEventListener('DOMContentLoaded', boot);
async function gBaslat() {
  document.documentElement.classList.add('g-html');
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  kabuk();
  try {
    G.ogeler = (await DB.hepsi('oge')).map(ogeTemiz).filter(Boolean);
    G.albumler = (await DB.hepsi('album')).map(albumTemiz).filter(Boolean);
    await copuTemizle();
  } catch { G.hata = 'Bu tarayıcıda fotoğraf depolanamıyor (özel pencere olabilir).'; }
  if (new URLSearchParams(location.search).has('album')) G.gor = 'album';
  if (!['foto', 'album', 'yer', 'fav'].includes(G.gor)) G.gor = 'foto';
  ciz();
  { const q = new URLSearchParams(location.search), id = q.get('duzenle') || q.get('ac'), ob = id && oge(id); if (ob && !ob.sil) { if (q.get('duzenle') && typeof duzenleAc === 'function') duzenleAc(ob); else { const [c, a] = ctxNow(); ac(ob.id, c, a); } } }
}
async function copuTemizle() {
  const eski = Date.now() - 30 * 864e5;
  for (const o of G.ogeler.filter(o => o.sil && o.sil < eski)) await kalici(o, true);
}
showLogin = msg => { if (msg) toast(msg); };
start = () => gBaslat();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', gBaslat); else gBaslat();

function kabuk() {
  $('#app').innerHTML = `
  <div class="g-kabuk" id="gKabuk">
    <header class="g-bas">
      <div class="g-bas1"><div class="brand-mark sm">${IC.foto}</div><div class="g-bas-m"><h1 id="gBaslik">Galeri</h1><small id="gAlt" hidden></small></div><div class="spacer"></div>
        <button class="icon-btn" data-action="g-sec" title="Seç" aria-label="Seç">${IC.secK}</button>
        <button class="icon-btn" data-action="g-yog" title="Kare boyutu" aria-label="Kare boyutu">${IC.yogun}</button>
        <button class="icon-btn" data-action="g-ayar" title="Ayarlar" aria-label="Ayarlar">${IC.gear}</button>
        <button class="btn primary sm" data-action="g-ekle">${IC.plus}<span>Ekle</span></button></div>
      <nav class="seg g-sek" id="gSek">${[['foto', IC.foto, 'Fotoğraflar'], ['album', IC.album, 'Albümler'], ['yer', IC.yer, 'Yerler'], ['fav', IC.kalp, 'Favoriler']].map(([k, i, n]) => `<button data-action="g-gor" data-k="${k}">${i}<span>${n}</span></button>`).join('')}</nav>
      <div class="g-ara" id="gAra" hidden><label class="g-ara-i">${IC.search}<input id="gAraIn" type="search" placeholder="Ara: yer, ay, yıl, video, favori…" autocomplete="off" enterkeyhint="search"></label>
        <div class="g-chips" id="gChips">${[['all', 'Tümü'], ['foto', 'Fotoğraf'], ['video', 'Video'], ['konum', 'Konumlu']].map(([k, n]) => `<button data-action="g-suz" data-s="${k}">${n}</button>`).join('')}<span id="gEtk" class="g-etk-chips"></span></div></div>
    </header>
    <main class="g-govde" id="gGovde"></main>
    <nav class="g-ys" id="gYs" hidden></nav>
    <div class="g-birak" id="gBirak" hidden><div>${IC.plus}<b>Bırak, galeriye eklensin</b></div></div>
    <div class="g-islem" id="gIslem" hidden></div>
  </div>
  <div id="gGoruntu" class="g-gor" hidden></div>
  <input type="file" id="gDosya" accept="image/*,video/*,.heic,.heif" multiple hidden>
  <input type="file" id="gKlasor" webkitdirectory multiple hidden>
  <input type="file" id="gYedekDosya" accept=".zip,.galeripaket,application/zip,application/octet-stream" hidden>`;
  $('#gDosya').onchange = e => { const l = [...e.target.files]; e.target.value = ''; ekle(l, G.gor === 'album' ? G.alb : ''); };
  $('#gKlasor').onchange = e => { const l = [...e.target.files]; e.target.value = ''; ekle(l, G.gor === 'album' ? G.alb : ''); };
  $('#gYedekDosya').onchange = e => { const f = e.target.files[0]; e.target.value = ''; if (f) yedekYukle(f); };
  let aramaZ = 0;
  $('#gAraIn').addEventListener('input', e => { clearTimeout(aramaZ); aramaZ = setTimeout(() => { G.q = e.target.value; ciz(); }, 160); });
  const gv = $('#gGovde');
  gv.addEventListener('scroll', () => { cancelAnimationFrame(G.raf); G.raf = requestAnimationFrame(yilVurgu); }, { passive: true });
  const uzunBas = id => { if (G.sec && G.secili.has(id)) return; if (!G.sec) { G.sec = true; G.secili = new Set(); } G.secili.add(id); G.son = id; G.lp = Date.now(); ciz(); navigator.vibrate?.(12); };
  gv.addEventListener('contextmenu', e => { const k = e.target.closest('.g-k'); if (!k) return; e.preventDefault(); uzunBas(k.dataset.id); });
  let lpT = 0, lpX = 0, lpY = 0;
  gv.addEventListener('pointerdown', e => { const k = e.target.closest('.g-k'); if (!k || e.pointerType === 'mouse' || e.target.closest('.g-hf')) return; lpX = e.clientX; lpY = e.clientY; clearTimeout(lpT); lpT = setTimeout(() => uzunBas(k.dataset.id), 480); });
  ['pointerup', 'pointercancel', 'scroll'].forEach(t => gv.addEventListener(t, () => clearTimeout(lpT), { passive: true }));
  gv.addEventListener('pointermove', e => { if (Math.hypot(e.clientX - lpX, e.clientY - lpY) > 9) clearTimeout(lpT); });
  let surukle = 0;
  const dosyaMi = e => [...(e.dataTransfer?.types || [])].includes('Files');
  document.addEventListener('dragenter', e => { if (!dosyaMi(e)) return; e.preventDefault(); surukle++; $('#gBirak').hidden = false; });
  document.addEventListener('dragover', e => { if (dosyaMi(e)) e.preventDefault(); });
  document.addEventListener('dragleave', e => { if (!dosyaMi(e)) return; surukle = Math.max(0, surukle - 1); if (!surukle) $('#gBirak').hidden = true; });
  document.addEventListener('drop', e => { surukle = 0; $('#gBirak').hidden = true; if (!e.dataTransfer?.files?.length) return; e.preventDefault(); ekle([...e.dataTransfer.files], G.gor === 'album' ? G.alb : ''); });
}

/* ═════════ Listeler ═════════ */
const aramaMetni = o => `${o.ad} ${o.not || ''} ${(o.etk || []).join(' ')} ${o.album && alb(o.album) ? alb(o.album).ad : ''} ${aylik(o.tarih)} ${new Date(o.tarih).getFullYear()} ${o.konum ? GE.yerAdi(o.konum) : ''} ${o.tur === 'video' ? 'video' : 'fotoğraf'}${o.fav ? ' favori' : ''}`.toLocaleLowerCase('tr');
function suz(l) {
  let r = l;
  if (G.suzT === 'foto') r = r.filter(o => o.tur === 'foto'); else if (G.suzT === 'video') r = r.filter(o => o.tur === 'video'); else if (G.suzT === 'konum') r = r.filter(o => o.konum);
  const q = G.q.trim().toLocaleLowerCase('tr'); if (q) r = r.filter(o => q.split(/\s+/).every(w => aramaMetni(o).includes(w)));
  return r;
}
const KOLEKSIYON = { video: ['Videolar', 'oynat', o => o.tur === 'video'], konum: ['Konumlu', 'yer', o => !!o.konum], son: ['Son 30 gün', 'takvim', o => o.eklenme > Date.now() - 30 * 864e5], buyuk: ['Büyük dosyalar', 'indirG', o => o.boyut > 10 * 1048576] };
function animlar() {
  const bu = new Date(), gr = new Map();
  for (const o of G.ogeler.filter(gorunur)) { const d = new Date(o.tarih); if (d.getFullYear() >= bu.getFullYear() || d.getMonth() !== bu.getMonth() || Math.abs(d.getDate() - bu.getDate()) > 3) continue; const y = d.getFullYear(); (gr.get(y) || gr.set(y, []).get(y)).push(o); }
  return [...gr].sort((a, b) => b[0] - a[0]).slice(0, 4).map(([y, l]) => ({ y, l: sirala(l) }));
}
const sirala = l => l.sort((a, b) => b.tarih - a.tarih || b.eklenme - a.eklenme);
function liste(ctx, arg) {
  if (ctx === 'foto') return sirala(suz(G.ogeler.filter(gorunur)));
  if (ctx === 'fav') return sirala(suz(G.ogeler.filter(o => gorunur(o) && o.fav)));
  if (ctx === 'kol') return sirala(suz(G.ogeler.filter(o => gorunur(o) && KOLEKSIYON[arg]?.[2](o))));
  if (ctx === 'ani') return sirala((animlar().find(a => a.y === +arg)?.l || []).slice());
  if (ctx === 'sil') return G.ogeler.filter(o => o.sil && !o.sifreli).sort((a, b) => b.sil - a.sil);
  if (ctx === 'yer') return sirala(suz(G.ogeler.filter(o => gorunur(o) && o.konum && GE.yerAdi(o.konum) === arg)));
  if (ctx === 'album') { const a = alb(arg); if (!a) return []; return a.kilit ? sirala(suz((G.kilit[arg]?.ogeler || []).slice())) : sirala(suz(G.ogeler.filter(o => gorunur(o) && o.album === arg))); }
  return [];
}
const ctxNow = () => G.gor === 'album' ? (G.kol ? ['kol', G.kol] : ['album', G.alb]) : G.gor === 'yer' ? ['yer', G.yer] : G.gor === 'sil' ? ['sil'] : [G.gor];

/* ═════════ Küçük resim adresleri (gerektikçe) ═════════ */
function kucukUrl(o) {
  const b = o.sifreli ? o._kucuk : o.kucuk;
  if (!(b instanceof Blob)) return '';
  let u = G.url.get(o.id); if (!u) { u = URL.createObjectURL(b); G.url.set(o.id, u); }
  return u;
}
function urlTemizle(ids) { for (const id of ids) { const u = G.url.get(id); if (u) { URL.revokeObjectURL(u); G.url.delete(id); } } }
let gIO = null;
function tembel(kok) {
  gIO?.disconnect();
  gIO = new IntersectionObserver(es => { for (const e of es) if (e.isIntersecting) { const im = e.target, o = oge(im.dataset.id); if (o) { const u = kucukUrl(o); if (u) im.src = u; } gIO.unobserve(im); } }, { root: $('#gGovde'), rootMargin: '400px' });
  kok.querySelectorAll('img[data-id]').forEach(im => gIO.observe(im));
}

/* ═════════ Çizim ═════════ */
function ciz() {
  document.querySelectorAll('#gSek button').forEach(b => b.classList.toggle('on', b.dataset.k === (G.gor === 'sil' ? '' : G.gor)));
  const g = $('#gGovde'); if (!g) return;
  document.documentElement.style.setProperty('--satir', Math.round(YOG[G.yog] * (dar() ? .95 : 1.25)) + 'px');
  $('#gKabuk').classList.toggle('secim', G.sec);
  const aramaVar = G.gor === 'foto' || G.gor === 'fav' || (G.gor === 'album' && (G.alb || G.kol)) || (G.gor === 'yer' && G.yer);
  $('#gAra').hidden = !aramaVar;
  document.querySelectorAll('#gChips button').forEach(b => b.classList.toggle('on', b.dataset.s === G.suzT));
  if (G.hata) { g.innerHTML = `<div class="g-bos"><p>${esc(G.hata)}</p></div>`; return; }
  $('#gYs').hidden = true;
  if (G.gor === 'foto') izgara(g, 'foto', null, 'Galeri', true);
  else if (G.gor === 'fav') izgara(g, 'fav', null, 'Favoriler', false);
  else if (G.gor === 'sil') izgara(g, 'sil', null, 'Silinenler', false);
  else if (G.gor === 'yer') G.yer ? izgara(g, 'yer', G.yer, G.yer, false) : yerlerCiz(g);
  else if (G.gor === 'album') G.kol ? izgara(g, 'kol', G.kol, KOLEKSIYON[G.kol][0], false) : G.alb ? izgara(g, 'album', G.alb, alb(G.alb)?.ad || 'Albüm', false) : albumlerCiz(g);
  if (window.etiketChips) etiketChips();
  islemCubugu();
}
function ustBaslik(ad, geri) {
  $('#gBaslik').textContent = ad;
  const bm = $('.g-bas1 .brand-mark');
  bm.innerHTML = geri ? IC.geri : IC.foto; bm.dataset.action = geri ? 'g-geri' : ''; bm.classList.toggle('geri', !!geri);
  const alt = $('#gAlt');
  if (G.gor === 'foto' && !geri) {
    const f = G.ogeler.filter(o => gorunur(o) && o.tur === 'foto').length, v = G.ogeler.filter(o => gorunur(o) && o.tur === 'video').length, boy = G.ogeler.filter(gorunur).reduce((a, o) => a + (o.boyut || 0), 0);
    alt.textContent = f || v ? `${f} fotoğraf · ${v} video · ${bayt(boy)}` : ''; alt.hidden = !(f || v);
  } else alt.hidden = true;
}
function izgara(g, ctx, arg, baslik, tarihGit) {
  const l = liste(ctx, arg), geri = ctx === 'sil' || ctx === 'yer' || ctx === 'album' || ctx === 'kol';
  ustBaslik(baslik, geri);
  const a = ctx === 'album' ? alb(arg) : null, suzuk = !!(G.q || G.suzT !== 'all');
  let ust = '';
  if (ctx === 'album' && a) ust = `<div class="g-ust"><span>${l.length} öğe${a.kilit ? ' · ' + IC.kilit + ' kilitli albüm' : ''}</span><div class="spacer"></div><button class="btn sm" data-action="g-alb-menu">${IC.more} Albüm</button></div>`;
  else if (ctx === 'foto' && l.length) ust = `<div class="g-ust"><span>${suzuk ? l.length + ' sonuç' : ''}</span><div class="spacer"></div><button class="btn sm" data-action="g-tarih">${IC.takvim} Tarihe git</button></div>`;
  else if (ctx === 'sil') ust = `<div class="g-ust"><span>Silinenler 30 gün sonra kalıcı olarak silinir</span><div class="spacer"></div>${l.length ? `<button class="btn sm tehlike" data-action="g-sil-bosalt">Boşalt</button>` : ''}</div>`;
  else if (suzuk) ust = `<div class="g-ust"><span>${l.length} sonuç</span></div>`;
  let anilar = '';
  if (ctx === 'foto' && !suzuk) {
    const an = animlar();
    if (an.length) anilar = `<section class="g-anilar"><h3>Anılar</h3><div class="g-ani-sirasi">${an.map(x => { const kap = x.l.find(o => o.kucuk) || x.l[0]; const yil = new Date().getFullYear() - x.y; return `<button class="g-ani" data-action="g-ani" data-y="${x.y}">${kap?.kucuk ? `<img data-id="${esc(kap.id)}" alt="">` : ''}<span class="g-ani-t"><b>${yil} yıl önce</b><small>${esc(aylik(x.l[0].tarih))} · ${x.l.length} öğe</small></span></button>`; }).join('')}</div></section>`;
  }
  if (!l.length) { g.innerHTML = ust + (suzuk ? `<div class="g-bos"><div class="g-bos-ic">${IC.foto}</div><b>Sonuç yok</b><p>Aramayı ya da süzgeci değiştir.</p></div>` : bosEkran(ctx, a)); return; }
  const kare = G.ayar.kare ? ' kare' : '';
  let h = ust + anilar + `<div class="g-izg${kare}">`, son = '';
  const yillar = new Map();
  for (const o of l) {
    const k = ctx === 'sil' ? '' : ayAnahtar(o.tarih);
    if (k !== son) { son = k; if (k) { h += `</div><h3 class="g-ay" data-ay="${k}"><span>${esc(aylik(o.tarih))}</span></h3><div class="g-izg${kare}">`; const y = new Date(o.tarih).getFullYear(); if (!yillar.has(y)) yillar.set(y, k); } }
    h += karo(o, ctx, arg);
  }
  g.innerHTML = h + '</div>';
  tembel(g);
  if (ctx === 'foto' && yillar.size > 1) { const ys = $('#gYs'); ys.hidden = false; ys.innerHTML = [...yillar].map(([y, k]) => `<button data-action="g-yil" data-ay="${k}" data-y="${y}">${y}</button>`).join(''); yilVurgu(); }
}
function yilVurgu() {
  const g = $('#gGovde'), ys = $('#gYs'); if (!g || !ys || ys.hidden) return;
  let akt = null; for (const h of g.querySelectorAll('.g-ay')) { if (h.offsetTop - g.scrollTop <= 80) akt = h.dataset.ay.slice(0, 4); else break; }
  ys.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.y === (akt || ys.firstChild?.dataset.y)));
}
function karo(o, ctx, arg) {
  const sec = G.secili.has(o.id), ar = o.w && o.h ? Math.max(.5, Math.min(2.4, o.w / o.h)) : 1;
  return `<button type="button" class="g-k ${sec ? 'sec' : ''}" style="--ar:${ar.toFixed(3)}" data-action="g-ac" data-id="${esc(o.id)}" aria-label="${esc(o.ad || 'Öğe')}"><i></i>
    ${o.kucuk || o._kucuk ? `<img data-id="${esc(o.id)}" alt="" draggable="false">` : `<span class="g-yok">${esc((o.ad.split('.').pop() || '').slice(0, 5).toUpperCase())}</span>`}
    ${o.tur === 'video' ? `<span class="g-vid">${IC.oynat}${o.sure ? sureYaz(o.sure) : ''}</span>` : ''}
    ${!G.sec && !o.sifreli && !o.sil ? `<span class="g-hf ${o.fav ? 'on' : ''}" data-action="g-k-fav" data-id="${esc(o.id)}" role="button" aria-label="Favori">${o.fav ? IC.kalpDolu : IC.kalp}</span>` : o.fav ? `<span class="g-fav">${IC.kalpDolu}</span>` : ''}
    ${G.sec ? `<span class="g-cb ${sec ? 'on' : ''}">${sec ? IC.check : ''}</span>` : ''}</button>`;
}
function bosEkran(ctx, a) {
  const m = { foto: ['Henüz fotoğraf yok', 'Telefondan ya da bilgisayardan fotoğraf ve video ekle. Dosyalar yalnızca bu cihazda saklanır.'], fav: ['Favori yok', 'Bir fotoğrafı açıp kalbe dokun.'], sil: ['Silinen yok', ''], yer: ['Bu yerde öğe yok', ''], album: [a?.kilit ? 'Bu albüm boş' : 'Bu albüm boş', 'Ekle düğmesiyle bu albüme fotoğraf ekleyebilirsin.'] }[ctx];
  return `<div class="g-bos"><div class="g-bos-ic">${IC.foto}</div><b>${m[0]}</b><p>${m[1]}</p>${ctx === 'foto' || ctx === 'album' ? `<button class="btn primary" data-action="g-ekle">${IC.plus} Fotoğraf ekle</button>` : ''}</div>`;
}
function albumKolaj(a) {
  if (a.kilit) return `<div class="g-alb-kilit"><span class="g-alb-ik">${IC.kilit}</span></div>`;
  const l = sirala(G.ogeler.filter(o => gorunur(o) && o.album === a.id && o.kucuk)).slice(0, 4);
  if (!l.length) return `<span class="g-alb-ik">${IC.album}</span>`;
  return `<div class="g-kolaj k${l.length >= 4 ? 4 : l.length >= 2 ? 2 : 1}">${(l.length >= 4 ? l : l.length >= 2 ? l.slice(0, 2) : l).map(o => `<img data-id="${esc(o.id)}" alt="">`).join('')}</div>`;
}
function albumlerCiz(g) {
  ustBaslik('Albümler', false);
  const kol = Object.entries(KOLEKSIYON).map(([k, [ad, ic, f]]) => { const l = G.ogeler.filter(o => gorunur(o) && f(o)); return { k, ad, ic, n: l.length }; }).filter(x => x.n);
  let h = kol.length ? `<h3 class="g-bol">Akıllı koleksiyonlar</h3><div class="g-kol">${kol.map(x => `<button class="g-kol-k" data-action="g-kol" data-k="${x.k}">${IC[x.ic]}<b>${x.ad}</b><span>${x.n}</span></button>`).join('')}</div>` : '';
  h += `<h3 class="g-bol">Albümlerim</h3><div class="g-alb-izg">`;
  for (const a of G.albumler.slice().sort((x, y) => x.ad.localeCompare(y.ad, 'tr'))) {
    const n = a.kilit ? G.ogeler.filter(o => o.album === a.id && !o.sil).length : G.ogeler.filter(o => gorunur(o) && o.album === a.id).length;
    h += `<button class="g-alb ${a.kilit ? 'kilitli' : ''}" data-action="g-alb-ac" data-id="${esc(a.id)}"><div class="g-alb-k">${albumKolaj(a)}</div><b>${esc(a.ad)}</b><span>${a.kilit ? IC.kilit : ''}${n} öğe</span></button>`;
  }
  h += `<button class="g-alb yeni" data-action="g-alb-yeni"><div class="g-alb-k"><span class="g-alb-ik">${IC.plus}</span></div><b>Yeni albüm</b><span>İstersen parolayla kilitle</span></button></div>`;
  const sil = G.ogeler.filter(o => o.sil && !o.sifreli).length;
  h += `<div class="g-alt"><button class="btn" data-action="g-benzer">${IC.kopya} Benzer fotoğraflar</button><button class="btn" data-action="g-sil-ac">${IC.copG} Silinenler${sil ? ` (${sil})` : ''}</button></div>`;
  g.innerHTML = h; tembel(g);
}
function yerlerCiz(g) {
  ustBaslik('Yerler', false);
  const m = new Map();
  for (const o of G.ogeler.filter(o => gorunur(o) && o.konum)) { const ad = GE.yerAdi(o.konum); const e = m.get(ad) || { ad, n: 0, kap: null }; e.n++; if (!e.kap || (o.kucuk && o.tarih > e.kap.tarih)) e.kap = o; m.set(ad, e); }
  if (!m.size) { g.innerHTML = `<div class="g-bos"><div class="g-bos-ic">${IC.yer}</div><b>Konumlu fotoğraf yok</b><p>Konum bilgisi, çekim yeri kayıtlı fotoğraflarda görünür. Yer adları internetsiz, cihazında hesaplanır; konum hiçbir yere gönderilmez.</p></div>`; return; }
  g.innerHTML = '<div class="g-alb-izg">' + [...m.values()].sort((a, b) => b.n - a.n).map(e => `<button class="g-alb" data-action="g-yer-ac" data-ad="${esc(e.ad)}"><div class="g-alb-k yer">${e.kap?.kucuk ? `<img data-id="${esc(e.kap.id)}" alt="">` : `<span class="g-alb-ik">${IC.yer}</span>`}<span class="g-yer-r">${IC.yer}${e.n}</span></div><b>${esc(e.ad)}</b><span>${e.n} öğe</span></button>`).join('') + '</div>';
  tembel(g);
}

/* ═════════ İçe aktarma ═════════ */
const RESIM_UZ = /\.(jpe?g|png|webp|gif|avif|heic|heif|bmp)$/i, VIDEO_UZ = /\.(mp4|m4v|mov|webm|mkv|3gp|ogv)$/i;
const turu = f => f.type.startsWith('image/') || RESIM_UZ.test(f.name) ? 'foto' : f.type.startsWith('video/') || VIDEO_UZ.test(f.name) ? 'video' : '';
const EN_BUYUK = 400 * 1048576;
async function ekle(dosyalar, albumId) {
  if (G.mesgul) return toast('Önceki ekleme sürüyor…');
  const a = albumId ? alb(albumId) : null;
  if (a?.kilit && !G.kilit[a.id]) { if (!(await albumAc(a.id, true))) return; }
  const adaylar = dosyalar.filter(f => turu(f));
  if (!adaylar.length) return toast('Fotoğraf ya da video bulunamadı');
  G.mesgul = true;
  let tamam = 0, atla = 0, hata = 0;
  const bar = ilerleme(0, adaylar.length);
  try {
    for (let i = 0; i < adaylar.length; i++) {
      const f = adaylar[i]; bar(i, adaylar.length, f.name);
      try {
        if (f.size > EN_BUYUK) { hata++; continue; }
        const id = await GE.kimlik(f);
        if (G.ogeler.some(o => o.id === id) || Object.values(G.kilit).some(k => k.ogeler.some(o => o.id === id))) { atla++; continue; }
        const tur = turu(f); let tarih = f.lastModified || Date.now(), konum = null, w = 0, h = 0, sure = 0, kucuk = null;
        if (tur === 'foto') {
          if (/jpe?g/i.test(f.type) || /\.jpe?g$/i.test(f.name)) { const x = GE.exifOku(await f.slice(0, 262144).arrayBuffer()); if (x.tarih) tarih = x.tarih; if (x.konum) konum = x.konum; }
          const r = await GE.resimOku(f); if (r) ({ w, h, kucuk } = r);
        } else { const r = await GE.videoOku(f); if (r) ({ w, h, sure, kucuk } = r); }
        await yaz({ id, ad: f.name, tur, tip: f.type || (tur === 'video' ? 'video/mp4' : 'image/jpeg'), boyut: f.size, w, h, sure, tarih, eklenme: Date.now(), konum, fav: false, blob: f, kucuk }, albumId || '');
        tamam++;
      } catch (e) { hata++; if (e?.name === 'QuotaExceededError') { toast('Depolama dolu: bazı dosyalar eklenemedi'); break; } }
    }
  } finally { G.mesgul = false; bar(null); }
  navigator.storage?.persist?.().catch(() => {});
  ciz();
  toast(`${tamam} öğe eklendi${atla ? ` · ${atla} zaten vardı` : ''}${hata ? ` · ${hata} eklenemedi` : ''}`);
}
function ilerleme(i, n) {
  let el = $('#gIlerle');
  return (i, n, ad) => {
    el = $('#gIlerle');
    if (i == null) { el?.remove(); return; }
    if (!el) { el = document.createElement('div'); el.id = 'gIlerle'; el.className = 'g-ilerle'; document.body.appendChild(el); }
    el.innerHTML = `<b>${i + 1} / ${n}</b><span>${esc(kisalt(ad, 40))}</span><i style="--p:${Math.round((i / n) * 100)}%"></i>`;
  };
}

/* ═════════ Kayıt: öğeyi düz ya da şifreli yaz ═════════ */
async function yaz(p, albumId) {
  const a = albumId ? alb(albumId) : null;
  const sil = G.ogeler.findIndex(o => o.id === p.id);
  if (a?.kilit) {
    const k = G.kilit[a.id]; if (!k) throw new Error('Albüm kilitli');
    const meta = metaYap(p);
    const e = await GE.jsonSifrele(k.key, meta);
    const kucukE = p.kucuk ? await GE.sifrele(k.key, await p.kucuk.arrayBuffer()) : null;
    const buf = await GE.sifrele(k.key, await p.blob.arrayBuffer());
    await DB.yaz('dosya', { id: p.id, buf });
    await DB.yaz('oge', { id: p.id, album: a.id, sifreli: true, tur: p.tur, tarih: p.eklenme, eklenme: p.eklenme, e, kucukE });
    if (sil >= 0) G.ogeler.splice(sil, 1);
    const hs = ogeTemiz({ id: p.id, album: a.id, sifreli: true, tur: p.tur, tarih: p.eklenme, eklenme: p.eklenme, e, kucukE });
    Object.assign(hs, { ...meta, konum: konumTemiz(meta.konum), _kucuk: p.kucuk || null });
    k.ogeler = k.ogeler.filter(o => o.id !== p.id); k.ogeler.push(hs);
    G.ogeler.push({ id: p.id, album: a.id, sifreli: true, tur: p.tur, tarih: p.eklenme, eklenme: p.eklenme, ad: '', tip: '', boyut: 0, w: 0, h: 0, sure: 0, konum: null, fav: false, not: '', etk: [], sil: 0, kucuk: null, e, kucukE });
    return;
  }
  const kayit = { id: p.id, ad: p.ad, tur: p.tur, tip: p.tip, boyut: p.boyut, w: p.w, h: p.h, sure: p.sure, tarih: p.tarih, eklenme: p.eklenme, konum: p.konum, album: albumId || '', fav: !!p.fav, not: p.not || '', etk: p.etk || [], sil: 0, kucuk: p.kucuk || null };
  await DB.yaz('dosya', { id: p.id, blob: p.blob });
  await DB.yaz('oge', kayit);
  if (sil >= 0) G.ogeler.splice(sil, 1);
  G.ogeler.push(ogeTemiz(kayit));
}
// Kayıttan düz hale getir (şifreliyse çöz)
async function oku(o) {
  const rec = await DB.al('dosya', o.id); if (!rec) throw new Error('Dosya bulunamadı');
  if (o.sifreli) {
    const k = G.kilit[o.album]; if (!k) throw new Error('Albüm kilitli');
    const gorOge = k.ogeler.find(x => x.id === o.id) || o;
    const blob = new Blob([await GE.coz(k.key, rec.buf)], { type: gorOge.tip });
    return { id: o.id, ad: gorOge.ad, tur: gorOge.tur, tip: gorOge.tip, boyut: gorOge.boyut, w: gorOge.w, h: gorOge.h, sure: gorOge.sure, tarih: gorOge.tarih, eklenme: o.eklenme, konum: gorOge.konum, fav: gorOge.fav, not: gorOge.not || '', etk: gorOge.etk || [], blob, kucuk: gorOge._kucuk || null };
  }
  return { ...o, blob: rec.blob };
}
async function kalici(o, sessiz) {
  await DB.sil('dosya', o.id); await DB.sil('oge', o.id);
  G.ogeler = G.ogeler.filter(x => x.id !== o.id);
  const k = G.kilit[o.album]; if (k) k.ogeler = k.ogeler.filter(x => x.id !== o.id);
  urlTemizle([o.id]);
}

/* ═════════ Seçim ═════════ */
function secimAc(ac) { G.sec = ac; G.secili = new Set(); ciz(); }
function secimDegis(id) { if (G.secili.has(id)) G.secili.delete(id); else G.secili.add(id); const b = $(`.g-k[data-id="${CSS.escape(id)}"]`); if (b) { b.classList.toggle('sec', G.secili.has(id)); const c = b.querySelector('.g-cb'); if (c) { c.classList.toggle('on', G.secili.has(id)); c.innerHTML = G.secili.has(id) ? IC.check : ''; } } islemCubugu(); }
function islemCubugu() {
  const el = $('#gIslem'); if (!el) return;
  if (!G.sec) { el.hidden = true; el.innerHTML = ''; return; }
  const k = G.secili.size, d = k ? '' : 'disabled', sil = G.gor === 'sil';
  el.hidden = false;
  el.innerHTML = `<span class="g-isl-n">${k ? k + ' seçili' : 'Seç'}</span>
    <button class="icon-btn" data-action="g-hepsi" title="Hepsini seç">${IC.secK}</button>
    ${sil ? `<button class="icon-btn" data-action="g-geriyukle" title="Geri getir" ${d}>${IC.geri}</button>` : `
    <button class="icon-btn" data-action="g-s-fav" title="Favori" ${d}>${IC.kalp}</button>
    <button class="icon-btn" data-action="g-s-tasi" title="Albüme taşı" ${d}>${IC.album}</button>
    <button class="icon-btn" data-action="g-s-etiket" title="Etiketle" ${d}>${IC.etiket}</button>
    <button class="icon-btn" data-action="g-s-indir" title="İndir" ${d}>${IC.indirG}</button>
    <button class="icon-btn" data-action="g-s-paylas" title="Paylaş" ${d}>${IC.paylasG}</button>`}
    <button class="icon-btn tehlike" data-action="g-s-sil" title="${sil ? 'Kalıcı sil' : 'Sil'}" ${d}>${IC.copG}</button>
    <button class="btn sm" data-action="g-sec">Bitti</button>`;
}
const seciliOgeler = () => [...G.secili].map(oge).filter(Boolean);

/* ═════════ Silme, favori, taşıma ═════════ */
async function sil(l) {
  const duz = l.filter(o => !o.sifreli), sif = l.filter(o => o.sifreli);
  if (sif.length && !(await onay('Kalıcı silinsin mi?', `Kilitli albümdeki ${sif.length} öğe silinirse geri getirilemez.`, 'Sil', true))) return false;
  for (const o of duz) { o.sil = Date.now(); await DB.yaz('oge', ogeKayit(o)); }
  for (const o of sif) await kalici(o);
  if (duz.length) toast(`${duz.length} öğe Silinenler'e taşındı`, [['Geri al', async () => { for (const o of duz) { o.sil = 0; await DB.yaz('oge', ogeKayit(o)); } ciz(); }]]);
  return true;
}
const metaYap = o => ({ ad: o.ad, tur: o.tur, tip: o.tip, boyut: o.boyut, w: o.w, h: o.h, sure: o.sure, tarih: o.tarih, konum: o.konum, fav: !!o.fav, not: o.not || '', etk: o.etk || [] });
const ogeKayit = o => ({ id: o.id, ad: o.ad, tur: o.tur, tip: o.tip, boyut: o.boyut, w: o.w, h: o.h, sure: o.sure, tarih: o.tarih, eklenme: o.eklenme, konum: o.konum, album: o.album, fav: o.fav, not: o.not || '', etk: o.etk || [], sil: o.sil || 0, kucuk: o.kucuk });
async function favDegis(l) {
  const f = l.some(o => !o.fav);
  for (const o of l) {
    o.fav = f;
    if (o.sifreli) { const k = G.kilit[o.album]; const meta = metaYap(o); const e = await GE.jsonSifrele(k.key, meta); o.e = e; const raw = G.ogeler.find(x => x.id === o.id); if (raw) raw.e = e; await DB.yaz('oge', { id: o.id, album: o.album, sifreli: true, tur: o.tur, tarih: o.eklenme, eklenme: o.eklenme, e, kucukE: o.kucukE }); }
    else await DB.yaz('oge', ogeKayit(o));
  }
}
async function tasi(l, hedef) {
  const h = hedef ? alb(hedef) : null;
  if (h?.kilit && !G.kilit[h.id]) { if (!(await albumAc(h.id, true))) return false; }
  const bar = ilerleme(0, l.length);
  try {
    for (let i = 0; i < l.length; i++) {
      bar(i, l.length, l[i].ad);
      const o = l[i];
      if ((o.album || '') === (hedef || '') && !!o.sifreli === !!h?.kilit) continue;
      if (!o.sifreli && !h?.kilit) { o.album = hedef || ''; await DB.yaz('oge', ogeKayit(o)); continue; }    // düz → düz: yalnızca etiket
      const p = await oku(o);
      const kaynakK = o.sifreli ? G.kilit[o.album] : null;
      await yaz(p, hedef || '');
      if (kaynakK) kaynakK.ogeler = kaynakK.ogeler.filter(x => x.id !== o.id);
    }
  } finally { bar(null); }
  return true;
}

/* ═════════ Albümler ═════════ */
function gSor(baslik, etiket, deger = '', tamam = 'Kaydet') {
  return new Promise(res => {
    $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-ask="x">${IC.close}</button><h3>${esc(baslik)}</h3></header>
      <form class="set-body" id="gSorForm"><label class="nask-l">${esc(etiket)}<input id="gSorIn" value="${esc(deger)}" maxlength="60" autocomplete="off" required></label>
      <div class="sticky-actions"><button type="button" class="btn" data-ask="x">Vazgeç</button><button class="btn primary">${esc(tamam)}</button></div></form></div></div>`;
    const bit = v => { closeModal(); res(v); };
    $('#gSorForm').addEventListener('submit', e => { e.preventDefault(); bit($('#gSorIn').value.trim()); });
    $('#modal').querySelectorAll('[data-ask="x"]').forEach(b => b.onclick = () => bit(null));
    setTimeout(() => $('#gSorIn')?.select(), 50);
  });
}
function onay(baslik, metin, tamam = 'Tamam', tehlike = false) {
  return new Promise(res => {
    $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-ask="x">${IC.close}</button><h3>${esc(baslik)}</h3></header>
      <div class="set-body"><p class="muted sm" style="margin-top:0">${metin}</p><div class="sticky-actions"><button type="button" class="btn" data-ask="x">Vazgeç</button><button type="button" class="btn ${tehlike ? 'tehlike' : 'primary'}" data-ask="ok">${esc(tamam)}</button></div></div></div></div>`;
    $('#modal').querySelectorAll('[data-ask]').forEach(b => b.onclick = () => { closeModal(); res(b.dataset.ask === 'ok'); });
  });
}
function parolaSor(baslik, tekrar, ek = '') {
  return new Promise(res => {
    $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-ask="x">${IC.close}</button><h3>${esc(baslik)}</h3></header>
      <form class="set-body" id="gPwForm" autocomplete="off"><label class="nask-l">Albüm parolası<input id="gP1" type="password" autocomplete="new-password" minlength="6" required></label>
      ${tekrar ? '<label class="nask-l">Parolayı tekrar yaz<input id="gP2" type="password" autocomplete="new-password" minlength="6" required></label>' : ''}
      <p class="g-ipucu">${tekrar ? 'En az 6 karakter; uzun bir cümle en iyisidir. <b>Parolayı unutursan albüm kurtarılamaz</b> — bizde bir kopyası yoktur.' : ''}${ek}</p><div class="g-hata" id="gPwE" role="alert"></div>
      <div class="sticky-actions"><button type="button" class="btn" data-ask="x">Vazgeç</button><button class="btn primary">Tamam</button></div></form></div></div>`;
    const bit = v => { closeModal(); res(v); };
    $('#gPwForm').addEventListener('submit', e => { e.preventDefault(); const a = $('#gP1').value; if (tekrar && a !== $('#gP2').value) return ($('#gPwE').textContent = 'İki parola aynı değil'); bit(a); });
    $('#modal').querySelectorAll('[data-ask="x"]').forEach(b => b.onclick = () => bit(null));
    setTimeout(() => $('#gP1')?.focus(), 50);
  });
}
async function albumAc(id, sadeceAc) {            // kilitliyse parolayı sor ve çöz; açılırsa true
  const a = alb(id); if (!a) return false;
  if (!a.kilit) return true;
  if (G.kilit[id]) { kilitDokun(); return true; }
  for (let deneme = 0; deneme < 5; deneme++) {
    const pw = await parolaSor(`"${a.ad}" albümünü aç`, false, deneme ? '<span class="g-hata">Parola yanlış, tekrar dene.</span>' : '');
    if (pw == null) return false;
    try {
      const key = await GE.anahtarTuret(pw, GE.unb64(a.kilit.salt));
      const dogr = new TextDecoder().decode(await GE.coz(key, GE.unb64(a.kilit.dogr).buffer));
      if (dogr !== 'galeri-ok') throw new Error('x');
      const ogeler = [];
      for (const raw of G.ogeler.filter(o => o.album === id && o.sifreli)) {
        try {
          const m = await GE.jsonCoz(key, raw.e);
          const o = { ...raw, ad: kisalt(m.ad, 200), tur: m.tur === 'video' ? 'video' : 'foto', tip: kisalt(m.tip, 80), boyut: +m.boyut || 0, w: +m.w || 0, h: +m.h || 0, sure: +m.sure || 0, tarih: +m.tarih || raw.eklenme, konum: konumTemiz(m.konum), fav: !!m.fav, not: kisalt(m.not, 600), etk: etkTemiz(m.etk) };
          o._kucuk = raw.kucukE ? new Blob([await GE.coz(key, raw.kucukE)], { type: 'image/jpeg' }) : null;
          ogeler.push(o);
        } catch { /* bozuk kayıt: atla */ }
      }
      G.kilit[id] = { key, ogeler, t: Date.now() }; kilitDokun();
      return true;
    } catch { /* yanlış parola */ }
  }
  toast('Çok fazla yanlış deneme'); return false;
}
let kilitZ = 0, kilitGizli = 0;
function kilitDokun() { clearTimeout(kilitZ); if (Object.keys(G.kilit).length) kilitZ = setTimeout(kilitleHepsi, 5 * 60e3); }
function kilitleHepsi() {
  clearTimeout(kilitZ);
  const idler = Object.keys(G.kilit); if (!idler.length) return;
  for (const id of idler) { urlTemizle(G.kilit[id].ogeler.map(o => o.id)); delete G.kilit[id]; }
  if (V.acik && V.liste.some(i => { const o = oge(i); return !o; })) kapat();
  if (G.gor === 'album' && G.alb && alb(G.alb)?.kilit) { G.alb = null; G.sec = false; G.secili = new Set(); }
  ciz(); toast('Kilitli albümler yeniden kilitlendi');
}
['pointerdown', 'keydown'].forEach(t => document.addEventListener(t, () => { if (Object.keys(G.kilit).length) kilitDokun(); }, true));
document.addEventListener('visibilitychange', () => { clearTimeout(kilitGizli); if (document.visibilityState === 'hidden') kilitGizli = setTimeout(kilitleHepsi, 60e3); });

async function albumYeni() {
  const ad = await gSor('Yeni albüm', 'Albümün adı', '', 'Oluştur'); if (!ad) return null;
  const a = { id: 'a' + uid(), ad: kisalt(ad, 60), olusturma: Date.now(), kapak: '', kilit: null };
  await DB.yaz('album', a); G.albumler.push(a); return a;
}
async function albumKilitle(a) {
  const pw = await parolaSor(`"${a.ad}" albümünü kilitle`, true, '<br>Albümdeki fotoğraf ve videolar şifrelenir; adları, tarihleri ve konumları da gizlenir.'); if (!pw) return;
  const bar = ilerleme(0, 1); G.mesgul = true;
  try {
    const tuz = crypto.getRandomValues(new Uint8Array(16)), key = await GE.anahtarTuret(pw, tuz);
    const dogr = GE.b64(new Uint8Array(await GE.sifrele(key, new TextEncoder().encode('galeri-ok'))));
    G.kilit[a.id] = { key, ogeler: [], t: Date.now() };
    a.kilit = { salt: GE.b64(tuz), dogr };          // önce albümü kilitli işaretle; yaz() öğeleri şifreli yazar
    await DB.yaz('album', a);
    const l = G.ogeler.filter(o => o.album === a.id && !o.sil && !o.sifreli);
    for (let i = 0; i < l.length; i++) { bar(i, l.length, l[i].ad); const p = await oku(l[i]); await yaz(p, a.id); }
  } catch (e) { toast('Kilitlenemedi: ' + e.message); } finally { G.mesgul = false; bar(null); }
  ciz(); toast('Albüm kilitlendi');
}
async function albumKilidiKaldir(a) {
  if (!(await onay('Kilit kaldırılsın mı?', 'Albümdeki öğeler şifresiz, normal olarak saklanır.', 'Kilidi kaldır'))) return;
  const k = G.kilit[a.id]; if (!k) return;
  const bar = ilerleme(0, 1); G.mesgul = true;
  try {
    const l = k.ogeler.slice(); a.kilit = null;
    for (let i = 0; i < l.length; i++) { bar(i, l.length, l[i].ad); const p = await oku(l[i]); await yaz(p, a.id); }
    await DB.yaz('album', a); delete G.kilit[a.id];
  } catch (e) { toast('Kilit kaldırılamadı: ' + e.message); } finally { G.mesgul = false; bar(null); }
  ciz(); toast('Kilit kaldırıldı');
}

/* ═════════ Küçük açılır menü ═════════ */
function gPop(anchor, html, onClick) {
  document.querySelector('.gpop')?.remove();
  const m = document.createElement('div'); m.className = 'ctx-menu sched-pop gpop'; m.innerHTML = html; document.body.appendChild(m);
  const r = anchor.getBoundingClientRect(), w = m.offsetWidth, h = m.offsetHeight;
  m.style.left = Math.max(8, Math.min(r.right - w, innerWidth - w - 8)) + 'px';
  m.style.top = (r.bottom + 6 + h < innerHeight ? r.bottom + 6 : Math.max(8, r.top - h - 6)) + 'px';
  m.style.zIndex = 400;
  m.addEventListener('click', e => { const it = e.target.closest('[data-v]'); if (!it || it.disabled) return; m.remove(); onClick(it.dataset.v); });
  setTimeout(() => document.addEventListener('mousedown', function off(e) { if (!e.target.closest('.gpop')) { m.remove(); document.removeEventListener('mousedown', off); } }), 0);
}
const gItem = (v, ic, ad, ek = '') => `<button type="button" class="ctx-item" data-v="${esc(v)}" ${ek}>${ic || '<i></i>'}<span>${ad}</span></button>`;
const albumSecenekleri = (haric) => `${G.albumler.slice().sort((a, b) => a.ad.localeCompare(b.ad, 'tr')).map(a => gItem('a:' + a.id, a.kilit ? IC.kilit : IC.album, esc(a.ad), a.id === haric ? 'disabled' : '')).join('')}${gItem('yeni', IC.plus, 'Yeni albüm…')}${gItem('yok', IC.foto, 'Albümsüz (Fotoğraflar)')}`;

/* ═════════ Görüntüleyici ═════════ */
const V = { acik: false, liste: [], i: 0, z: 1, x: 0, y: 0, url: '', slayt: 0, bilgi: false, gizle: false };
async function ac(id, ctx, arg) {
  if (G.sec) return secimDegis(id);
  const l = liste(ctx, arg).map(o => o.id); const i = l.indexOf(id); if (i < 0) return;
  V.liste = l; V.i = i; V.acik = true; V.bilgi = false;
  const g = $('#gGoruntu'); g.hidden = false; document.documentElement.classList.add('g-acik');
  g.innerHTML = `<div class="g-v-ust" id="gVUst"></div><div class="g-v-sahne" id="gSahne"></div><button class="g-v-ok sol" data-action="g-v-geri" aria-label="Önceki">${IC.geri}</button><button class="g-v-ok sag" data-action="g-v-ileri" aria-label="Sonraki">${IC.ileri}</button><div class="g-v-alt" id="gVAlt"></div><div class="g-film" id="gFilm"></div><div class="g-v-bilgi" id="gVBilgi" hidden></div>`;
  jestKur($('#gSahne'));
  await vGoster();
}
async function vGoster() {
  const o = oge(V.liste[V.i]); if (!o) return kapat();
  V.z = 1; V.x = 0; V.y = 0;
  const eskiUrl = V.url; V.url = '';
  const sahne = $('#gSahne'); if (!sahne) return;
  sahne.innerHTML = `<div class="g-v-yuk"></div>`;
  vUst(o); filmCiz(); arkaPlan(o);
  try {
    const rec = await DB.al('dosya', o.id); if (!rec) throw new Error('yok');
    let blob = rec.blob;
    if (o.sifreli) blob = new Blob([await GE.coz(G.kilit[o.album].key, rec.buf)], { type: o.tip });
    if (V.liste[V.i] !== o.id || !V.acik) return;
    V.url = URL.createObjectURL(blob);
    if (o.tur === 'video') sahne.innerHTML = `<video id="gVid" src="${V.url}" controls playsinline ${V.slayt ? 'autoplay' : ''}></video>`;
    else { sahne.innerHTML = `<img id="gImg" src="${V.url}" alt="${esc(o.ad)}" draggable="false">`; $('#gImg').onerror = () => { sahne.innerHTML = `<div class="g-v-hata">${IC.foto}<p>Bu tarayıcı bu biçimi gösteremiyor.</p><button class="btn" data-action="g-v-indir">${IC.indirG} İndir</button></div>`; }; }
    if (V.slayt && o.tur === 'video') $('#gVid').onended = () => slaytIlerle();
  } catch { sahne.innerHTML = '<div class="g-v-hata"><p>Dosya açılamadı.</p></div>'; }
  if (eskiUrl) URL.revokeObjectURL(eskiUrl);
  for (const d of [-1, 1]) { const k = oge(V.liste[V.i + d]); if (k && k.tur === 'foto' && !k.sifreli) DB.al('dosya', k.id).catch(() => {}); }   // yan resimleri ısıt
  if (V.bilgi) bilgiCiz(o);
}
function arkaPlan(o) { const g = $('#gGoruntu'); if (!g) return; const u = kucukUrl(o); g.style.setProperty('--g-bg', u ? `url("${u}")` : 'none'); g.style.setProperty('--g-fade', 1); }
function filmCiz() {
  const f = $('#gFilm'); if (!f) return;
  const bas = Math.max(0, V.i - 30), son = Math.min(V.liste.length, V.i + 31);
  f.innerHTML = V.liste.slice(bas, son).map((id, k) => { const o = oge(id), u = o ? kucukUrl(o) : ''; return `<button class="${bas + k === V.i ? 'on' : ''}" data-action="g-v-git" data-i="${bas + k}" aria-label="${bas + k + 1}">${u ? `<img src="${u}" alt="" draggable="false">` : ''}</button>`; }).join('');
  f.querySelector('.on')?.scrollIntoView({ inline: 'center', block: 'nearest' });
}
function vUst(o) {
  $('#gVUst').innerHTML = `<button class="icon-btn" data-action="g-v-kapat" aria-label="Kapat">${IC.close}</button><span class="g-v-say">${V.i + 1} / ${V.liste.length}</span><div class="spacer"></div>
    <button class="icon-btn ${o.fav ? 'on' : ''}" data-action="g-v-fav" aria-label="Favori">${o.fav ? IC.kalpDolu : IC.kalp}</button>
    <button class="icon-btn" data-action="g-v-slayt" aria-label="Slayt gösterisi">${V.slayt ? IC.durdur : IC.oynat}</button>
    <button class="icon-btn" data-action="g-v-bilgi" aria-label="Bilgi">${IC.bilgi}</button>
    <button class="icon-btn" data-action="g-v-menu" aria-label="Diğer">${IC.more}</button>`;
  $('#gVAlt').innerHTML = `<b>${esc(aylik(o.tarih).replace(/^./, c => c.toLocaleUpperCase('tr')))}</b><span>${esc(gunluk(o.tarih))}</span>`;
}
function bilgiCiz(o) {
  const el = $('#gVBilgi'); if (!el) return;
  el.hidden = !V.bilgi; if (!V.bilgi) return;
  const a = o.album ? alb(o.album) : null, yer = o.konum ? GE.yerAdi(o.konum) : '';
  el.innerHTML = `<h4>${esc(o.ad || 'Öğe')}</h4><dl>
    <dt>Tarih</dt><dd>${esc(new Date(o.tarih).toLocaleString('tr-TR'))}</dd>
    <dt>Boyut</dt><dd>${bayt(o.boyut)}${o.w ? ` · ${o.w}×${o.h}` : ''}${o.sure ? ` · ${sureYaz(o.sure)}` : ''}</dd>
    <dt>Albüm</dt><dd>${a ? esc(a.ad) : 'Albümsüz'}</dd>
    <dt>Not</dt><dd>${o.not ? esc(o.not) : '<small>—</small>'}${(o.etk || []).length ? `<div class="g-etk-l">${o.etk.map(t => `<span>#${esc(t)}</span>`).join('')}</div>` : ''}<br><button class="btn sm" data-action="g-v-not">${IC.kalem || ''} Düzenle</button></dd>
    ${o.konum ? `<dt>Konum</dt><dd>${esc(yer)}<br><small>${o.konum.la.toFixed(4)}, ${o.konum.lo.toFixed(4)}</small><br><button class="btn sm" data-action="g-v-harita">${IC.yer} Haritada aç</button></dd>` : ''}</dl>`;
}
function kapat() {
  slaytDur();
  V.acik = false; if (V.url) { URL.revokeObjectURL(V.url); V.url = ''; }
  const g = $('#gGoruntu'); if (g) { g.hidden = true; g.innerHTML = ''; }
  document.documentElement.classList.remove('g-acik');
  if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  ciz();
}
function vGez(d) { const n = V.i + d; if (n < 0 || n >= V.liste.length) return false; V.i = n; vGoster(); return true; }
function slaytIlerle() { if (!V.slayt) return; if (!vGez(1)) { V.i = 0; vGoster(); } }
function slaytBaslat() {
  V.slayt = 1; V.gizle = true; $('#gGoruntu')?.classList.add('slayt');
  $('#gGoruntu')?.requestFullscreen?.().catch(() => {});
  slaytZaman(); vUst(oge(V.liste[V.i]));
}
function slaytZaman() { clearInterval(V.zaman); V.zaman = setInterval(() => { const o = oge(V.liste[V.i]); if (o?.tur === 'video') return; slaytIlerle(); }, 4000); }
function slaytDur() { V.slayt = 0; clearInterval(V.zaman); $('#gGoruntu')?.classList.remove('slayt'); }
function jestKur(st) {
  const pts = new Map(); let bas = null, sonDokun = 0, tasiyor = false;
  const mesafe = () => { const [a, b] = [...pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
  const uygula = () => { const im = $('#gImg'); if (im) im.style.transform = `translate(${V.x}px,${V.y}px) scale(${V.z})`; };
  const sinirla = () => { const im = $('#gImg'); if (!im || V.z <= 1) { V.x = V.y = 0; return; } const mx = (im.clientWidth * (V.z - 1)) / 2 + 40, my = (im.clientHeight * (V.z - 1)) / 2 + 40; V.x = Math.max(-mx, Math.min(mx, V.x)); V.y = Math.max(-my, Math.min(my, V.y)); };
  st.addEventListener('pointerdown', e => {
    if (e.target.closest('video')) return;
    st.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    bas = { z: V.z, x: V.x, y: V.y, d: pts.size === 2 ? mesafe() : 0, sx: e.clientX, sy: e.clientY, t: Date.now() }; tasiyor = false;
  });
  st.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId) || !bas) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2 && bas.d) { V.z = Math.max(1, Math.min(8, bas.z * mesafe() / bas.d)); sinirla(); uygula(); tasiyor = true; return; }
    const dx = e.clientX - bas.sx, dy = e.clientY - bas.sy;
    if (Math.hypot(dx, dy) > 6) tasiyor = true;
    if (V.z > 1) { V.x = bas.x + dx; V.y = bas.y + dy; sinirla(); uygula(); }
    else { const im = $('#gImg'); if (!im) return; if (dy > 14 && Math.abs(dy) > Math.abs(dx) * 1.2) { im.style.transform = `translateY(${dy}px) scale(${1 - Math.min(.25, dy / 1500)})`; $('#gGoruntu').style.setProperty('--g-fade', Math.max(0, 1 - dy / 380)); } else { im.style.transform = `translateX(${dx}px)`; $('#gGoruntu').style.setProperty('--g-fade', 1); } }
  });
  const bitir = e => {
    if (!pts.has(e.pointerId)) return;
    const dx = e.clientX - (bas?.sx ?? e.clientX), dy = e.clientY - (bas?.sy ?? e.clientY); pts.delete(e.pointerId);
    if (pts.size) { bas = null; return; }
    const im = $('#gImg'); if (im && V.z <= 1) im.style.transform = '';
    if (!(V.z <= 1 && dy > 110 && Math.abs(dy) > Math.abs(dx) * 1.4)) $('#gGoruntu')?.style.setProperty('--g-fade', 1);
    if (!tasiyor && bas && Date.now() - bas.t < 300) {          // dokunma: çift dokunuşta yakınlaş, tek dokunuşta çubukları aç/kapat
      if (Date.now() - sonDokun < 320) { V.z = V.z > 1 ? 1 : 2.6; V.x = V.y = 0; if (im) { im.style.transition = 'transform .2s'; uygula(); setTimeout(() => (im.style.transition = ''), 220); } sonDokun = 0; }
      else { sonDokun = Date.now(); setTimeout(() => { if (sonDokun && Date.now() - sonDokun >= 300) { $('#gGoruntu')?.classList.toggle('cubuk-yok'); sonDokun = 0; } }, 320); }
    } else if (V.z <= 1 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) vGez(dx < 0 ? 1 : -1);
    else if (V.z <= 1 && dy > 110 && Math.abs(dy) > Math.abs(dx) * 1.4) kapat();
    bas = null;
  };
  st.addEventListener('pointerup', bitir); st.addEventListener('pointercancel', bitir);
  st.addEventListener('wheel', e => { if (!$('#gImg')) return; e.preventDefault(); V.z = Math.max(1, Math.min(8, V.z * (e.deltaY < 0 ? 1.15 : 1 / 1.15))); sinirla(); uygula(); }, { passive: false });
}
document.addEventListener('keydown', e => {
  if (!V.acik || e.target.closest?.('input,textarea')) return;
  const k = e.key;
  if (k === 'Escape') { if (V.slayt) { slaytDur(); vUst(oge(V.liste[V.i])); } else kapat(); }
  else if (k === 'ArrowRight') vGez(1); else if (k === 'ArrowLeft') vGez(-1);
  else if (k === 'f' || k === 'F') ACTIONS['g-v-fav']();
  else if (k === 'i' || k === 'I') ACTIONS['g-v-bilgi']();
  else if (k === ' ' && !e.target.closest?.('video')) { e.preventDefault(); ACTIONS['g-v-slayt'](); }
  else if (k === 'Delete') ACTIONS['g-v-sil']();
});
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && V.slayt) { slaytDur(); if (V.acik) vUst(oge(V.liste[V.i])); } });

/* ═════════ İndirme, paylaşma, konumu silme ═════════ */
async function konumsuz(p) {            // JPEG ise yeniden kodla: EXIF (konum, cihaz bilgisi) gitmez
  if (!G.ayar.konumSil || p.tur !== 'foto' || !/jpe?g/i.test(p.tip)) return p.blob;
  try { const bmp = await createImageBitmap(p.blob, { imageOrientation: 'from-image' }); const b = await GE.kucukYap(bmp, bmp.width, bmp.height, 1e5); bmp.close?.(); return b || p.blob; } catch { return p.blob; }
}
function dosyayaYaz(blob, ad) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = ad.replace(/[\\/:*?"<>|]/g, '_'); document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 8000); }
const bugun = () => { const t = new Date(); return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`; };
async function indir(l, zipAdi) {
  if (!l.length) return;
  const bar = ilerleme(0, l.length);
  try {
    if (l.length === 1) { const p = await oku(l[0]); dosyayaYaz(await konumsuz(p), p.ad || 'foto'); return; }
    const kullanilan = new Set(), dosyalar = [];
    for (let i = 0; i < l.length; i++) {
      bar(i, l.length, l[i].ad);
      const p = await oku(l[i]); let ad = p.ad || p.id, n = 1;
      while (kullanilan.has(ad.toLowerCase())) ad = ad.replace(/(\.[^.]*)?$/, `-${++n}$1`);
      kullanilan.add(ad.toLowerCase()); dosyalar.push({ ad, blob: await konumsuz(p) });
    }
    dosyayaYaz(await GE.zipYaz(dosyalar), `${zipAdi || 'Galeri'} ${bugun()}.zip`);
  } catch (e) { toast('İndirilemedi: ' + e.message); } finally { bar(null); }
}
async function paylas(l) {
  try {
    const dosyalar = []; for (const o of l.slice(0, 20)) { const p = await oku(o); dosyalar.push(new File([await konumsuz(p)], p.ad || 'foto', { type: p.tip })); }
    if (navigator.canShare?.({ files: dosyalar })) await navigator.share({ files: dosyalar }); else { toast('Bu cihaz doğrudan paylaşımı desteklemiyor; indiriliyor'); await indir(l); }
  } catch (e) { if (e?.name !== 'AbortError') toast('Paylaşılamadı: ' + e.message); }
}

/* ═════════ Yedek ═════════ */
async function yedekAl() {
  const l = G.ogeler.filter(gorunur); if (!l.length) return toast('Yedeklenecek öğe yok');
  const bar = ilerleme(0, l.length);
  try {
    const dosyalar = [], meta = { surum: 1, tarih: Date.now(), albumler: G.albumler.filter(a => !a.kilit).map(a => ({ id: a.id, ad: a.ad, olusturma: a.olusturma })), ogeler: [] };
    for (let i = 0; i < l.length; i++) {
      bar(i, l.length, l[i].ad); const o = l[i]; const rec = await DB.al('dosya', o.id); if (!rec?.blob) continue;
      const a = o.album ? alb(o.album) : null;
      meta.ogeler.push({ id: o.id, ad: o.ad, tur: o.tur, tip: o.tip, boyut: o.boyut, tarih: o.tarih, eklenme: o.eklenme, konum: o.konum, album: a && !a.kilit ? o.album : '', fav: o.fav, not: o.not || '', etk: o.etk || [] });
      dosyalar.push({ ad: `dosyalar/${o.id}`, blob: rec.blob });
    }
    dosyalar.unshift({ ad: 'galeri.json', blob: new Blob([JSON.stringify(meta)], { type: 'application/json' }) });
    dosyayaYaz(await GE.zipYaz(dosyalar), `Galeri yedeği ${bugun()}.zip`); store.set('gSonYedek', Date.now());
    toast('Yedek indirildi (kilitli albümler dahil değildir)');
  } catch (e) { toast('Yedek alınamadı: ' + e.message); } finally { bar(null); }
}
async function yedekYukle(file) {
  G.mesgul = true; const bar = ilerleme(0, 1);
  try {
    const liste = await GE.zipOku(file);
    const jf = liste.find(f => f.ad === 'galeri.json'); if (!jf) throw new Error('Bu dosya bir Galeri yedeği değil');
    const meta = JSON.parse(await (await jf.oku()).text());
    if (!meta || !Array.isArray(meta.ogeler) || meta.ogeler.length > 200000) throw new Error('Yedek bozuk');
    for (const a of (meta.albumler || []).slice(0, 2000)) { const t = albumTemiz({ ...a, kilit: null }); if (t && !alb(t.id)) { await DB.yaz('album', t); G.albumler.push(t); } }
    let n = 0, zaten = 0; const dos = new Map(liste.map(f => [f.ad, f]));
    for (let i = 0; i < meta.ogeler.length; i++) {
      const m = ogeTemiz(meta.ogeler[i]); if (!m) continue; bar(i, meta.ogeler.length, m.ad);
      if (G.ogeler.some(o => o.id === m.id)) { zaten++; continue; }
      const f = dos.get(`dosyalar/${m.id}`); if (!f) continue;
      const blob = new File([await f.oku()], m.ad || 'dosya', { type: m.tip });
      let kucuk = null, w = 0, h = 0, sure = m.sure;
      const r = m.tur === 'video' ? await GE.videoOku(blob) : await GE.resimOku(blob); if (r) ({ w, h, kucuk } = r); if (r?.sure) sure = r.sure;
      await yaz({ ...m, w, h, sure, kucuk, blob, album: '' }, alb(m.album) && !alb(m.album).kilit ? m.album : ''); n++;
    }
    toast(`${n} öğe geri yüklendi${zaten ? ` · ${zaten} zaten vardı` : ''}`);
  } catch (e) { toast('Geri yüklenemedi: ' + e.message); } finally { G.mesgul = false; bar(null); ciz(); }
}

/* ═════════ Ayarlar ═════════ */
async function ayarAc() {
  const adet = G.ogeler.filter(o => !o.sil).length, toplam = G.ogeler.reduce((a, o) => a + (o.boyut || 0), 0);
  let kota = '', kalici = '';
  try { const e = await navigator.storage?.estimate?.(); if (e?.quota) kota = ` · tarayıcı payı ${bayt(e.quota)}`; kalici = (await navigator.storage?.persisted?.()) ? 'Kalıcı depolama açık' : 'Kalıcı depolama istenmedi'; } catch {}
  const tema = store.get('theme', 'auto');
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Galeri ayarları</h3></header>
    <div class="set-body g-ayar">
      <section><h4>Depolama</h4><p class="muted sm">${adet} öğe · ${bayt(toplam)} (kilitli albüm boyutları dahil değil)${kota}<br>${kalici || ''}</p></section>
      <section><h4>Gizlilik</h4><label class="g-sw"><input type="checkbox" id="gKonumSil" ${G.ayar.konumSil ? 'checked' : ''}><span>Paylaşırken ve indirirken konum bilgisini sil<small>JPEG fotoğraflar yeniden kodlanır; EXIF (konum, cihaz) çıkar.</small></span></label></section>
      <section><h4>Görünüm</h4><label class="g-sw" style="margin-bottom:10px"><input type="checkbox" id="gKare" ${G.ayar.kare ? 'checked' : ''}><span>Kare kutular<small>Kapalıyken fotoğraflar kendi en-boy oranında, mozaik dizilir.</small></span></label><div class="seg yon-seg">${[['light', 'Açık'], ['dark', 'Koyu'], ['auto', 'Otomatik']].map(([k, n]) => `<button class="${tema === k ? 'on' : ''}" data-action="g-tema" data-t="${k}">${n}</button>`).join('')}</div></section>
      <section><h4>Yedek</h4><p class="muted sm">Albümsüz ve kilitsiz tüm öğeler, albüm bilgileriyle bir ZIP dosyasına yedeklenir. Kilitli albümler şifreli olarak yalnızca bu cihazda durur; dışa aktarmak için albümü açıp "Albümü indir"i kullan.</p>
        <div class="g-satir"><button class="btn" data-action="g-yedek">${IC.indirG} Yedek al</button><button class="btn" data-action="g-yedek-yukle">${IC.yukle2 || IC.plus} Yedekten yükle</button></div></section>
      <section><h4>Tehlikeli bölge</h4><button class="btn tehlike" data-action="g-hepsini-sil">Tüm galeriyi sil</button></section>
    </div></div></div>`;
  $('#gKonumSil').onchange = e => { G.ayar.konumSil = e.target.checked; store.set('gAyar', G.ayar); };
  $('#gKare').onchange = e => { G.ayar.kare = e.target.checked; store.set('gAyar', G.ayar); ciz(); };
  if (window.ayarEkle) ayarEkle();
}

/* ═════════ Tarihe git ═════════ */
function tarihMenu(btn) {
  const m = new Map(); for (const o of liste('foto')) { const k = ayAnahtar(o.tarih); m.set(k, (m.get(k) || 0) + 1); }
  const l = [...m]; if (!l.length) return;
  gPop(btn, `<div class="ctx-title">Tarihe git</div><div class="g-tarih-l">${l.map(([k, n]) => { const [y, a] = k.split('-'); return gItem(k, IC.takvim, `${new Date(+y, +a - 1, 1).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })} <small>${n}</small>`); }).join('')}</div>`, k => { $(`.g-ay[data-ay="${k}"]`)?.scrollIntoView({ block: 'start', behavior: 'smooth' }); });
}

/* ═════════ Eylemler ═════════ */
function aramaSifirla() { G.q = ''; G.suzT = 'all'; const i = $('#gAraIn'); if (i) i.value = ''; }
function git(k) { aramaSifirla(); G.kol = null; G.gor = k; G.alb = null; G.yer = null; G.sec = false; G.secili = new Set(); if (['foto', 'album', 'yer', 'fav'].includes(k)) store.set('gGor', k); ciz(); $('#gGovde').scrollTop = 0; }
Object.assign(ACTIONS, {
  'g-gor': el => git(el.dataset.k),
  'g-geri': () => { aramaSifirla(); if (G.gor === 'sil') git('album'); else if (G.gor === 'album') { G.alb = null; G.kol = null; G.sec = false; G.secili = new Set(); ciz(); } else if (G.gor === 'yer') { G.yer = null; ciz(); } },
  'g-ekle': el => {
    gPop(el, `${gItem('d', IC.foto, 'Fotoğraf ve video seç…')}${dar() ? '' : gItem('k', IC.album, 'Klasörden ekle…')}`, v => { (v === 'k' ? $('#gKlasor') : $('#gDosya')).click(); });
  },
  'g-ac': (el, e) => {
    if (G.lp && Date.now() - G.lp < 600) return;
    const o = oge(el.dataset.id); if (!o) return;
    if (G.sec) {
      if (e?.shiftKey && G.son) { const [c, a] = ctxNow(), ids = liste(c, a).map(x => x.id), i = ids.indexOf(G.son), j = ids.indexOf(o.id); if (i >= 0 && j >= 0) { for (const id of ids.slice(Math.min(i, j), Math.max(i, j) + 1)) G.secili.add(id); G.son = o.id; return ciz(); } }
      G.son = o.id; secimDegis(o.id);
    } else { const [c, a] = ctxNow(); ac(o.id, c, a); }
  },
  'g-sec': () => secimAc(!G.sec),
  'g-yog': () => { G.yog = (G.yog + 1) % YOG.length; store.set('gYog', G.yog); ciz(); },
  'g-ayar': () => ayarAc(),
  'g-tema': el => { store.set('theme', el.dataset.t); applyTheme(el.dataset.t); ayarAc(); },
  'g-tarih': el => tarihMenu(el),
  'g-hepsi': () => { const [c, a] = ctxNow(); const l = liste(c, a); G.secili = G.secili.size === l.length ? new Set() : new Set(l.map(o => o.id)); ciz(); },
  'g-alb-yeni': async () => { const a = await albumYeni(); if (a) { G.alb = a.id; ciz(); } },
  'g-alb-ac': async el => { const id = el.dataset.id; if (await albumAc(id)) { aramaSifirla(); G.alb = id; G.sec = false; ciz(); $('#gGovde').scrollTop = 0; } },
  'g-kol': el => { aramaSifirla(); G.kol = el.dataset.k; ciz(); $('#gGovde').scrollTop = 0; },
  'g-ani': el => { const l = liste('ani', el.dataset.y); if (l.length) ac(l[0].id, 'ani', el.dataset.y); },
  'g-suz': el => { G.suzT = el.dataset.s; ciz(); },
  'g-yil': el => { $(`.g-ay[data-ay="${el.dataset.ay}"]`)?.scrollIntoView({ block: 'start', behavior: 'smooth' }); },
  'g-k-fav': async el => { const o = oge(el.dataset.id); if (!o) return; await favDegis([o]); const h = el; h.classList.toggle('on', o.fav); h.innerHTML = o.fav ? IC.kalpDolu : IC.kalp; },
  'g-alb-menu': el => {
    const a = alb(G.alb); if (!a) return;
    gPop(el, `${gItem('ad', IC.kalem || '', 'Yeniden adlandır…')}${a.kilit ? gItem('kaldir', IC.kilit, 'Kilidi kaldır…') : gItem('kilitle', IC.kilit, 'Albümü kilitle…')}${gItem('indir', IC.indirG, 'Albümü indir (ZIP)')}${gItem('zip', IC.paylasG, 'ZIP olarak paylaş…')}${gItem('paket', IC.kilit, 'Şifreli paket olarak paylaş…')}${gItem('sil', IC.copG, 'Albümü sil…', 'data-danger')}`, async v => {
      if (v === 'zip' || v === 'paket') return albumPaylas(a, v);
      if (v === 'ad') { const ad = await gSor('Albümü adlandır', 'Albümün adı', a.ad); if (ad) { a.ad = ad; await DB.yaz('album', a); ciz(); } }
      if (v === 'kilitle') await albumKilitle(a);
      if (v === 'kaldir') await albumKilidiKaldir(a);
      if (v === 'indir') await indir(liste('album', a.id), a.ad);
      if (v === 'sil') {
        const n = liste('album', a.id).length;
        if (!(await onay('Albüm silinsin mi?', a.kilit ? `Kilitli albümdeki ${n} öğe de <b>kalıcı olarak</b> silinir.` : `Albüm silinir; içindeki ${n} öğe "Fotoğraflar"da kalır.`, 'Sil', true))) return;
        if (a.kilit) for (const o of liste('album', a.id)) await kalici(o);
        else for (const o of G.ogeler.filter(o => o.album === a.id && gorunur(o))) { o.album = ''; await DB.yaz('oge', ogeKayit(o)); }
        await DB.sil('album', a.id); G.albumler = G.albumler.filter(x => x.id !== a.id); delete G.kilit[a.id]; G.alb = null; ciz();
      }
    });
  },
  'g-yer-ac': el => { aramaSifirla(); G.yer = el.dataset.ad; ciz(); $('#gGovde').scrollTop = 0; },
  'g-sil-ac': () => { G.gor = 'sil'; G.alb = null; ciz(); },
  'g-sil-bosalt': async () => { const l = liste('sil'); if (!l.length) return; if (!(await onay('Silinenler boşaltılsın mı?', `${l.length} öğe kalıcı olarak silinir.`, 'Boşalt', true))) return; for (const o of l) await kalici(o); ciz(); },
  'g-geriyukle': async () => { for (const o of seciliOgeler()) { o.sil = 0; await DB.yaz('oge', ogeKayit(o)); } G.sec = false; G.secili = new Set(); ciz(); toast('Geri getirildi'); },
  'g-s-fav': async () => { await favDegis(seciliOgeler()); ciz(); },
  'g-s-tasi': el => gPop(el, albumSecenekleri(G.gor === 'album' ? G.alb : ''), async v => {
    const l = seciliOgeler(); let hedef = '';
    if (v === 'yeni') { const a = await albumYeni(); if (!a) return; hedef = a.id; } else if (v.startsWith('a:')) hedef = v.slice(2);
    if (await tasi(l, hedef)) { G.sec = false; G.secili = new Set(); ciz(); toast(`${l.length} öğe taşındı`); }
  }),
  'g-s-indir': () => indir(seciliOgeler()),
  'g-s-paylas': () => paylas(seciliOgeler()),
  'g-s-sil': async () => { const l = seciliOgeler(); if (G.gor === 'sil') { if (!(await onay('Kalıcı silinsin mi?', `${l.length} öğe geri getirilemez.`, 'Sil', true))) return; for (const o of l) await kalici(o); } else if (!(await sil(l))) return; G.sec = false; G.secili = new Set(); ciz(); },
  'g-yedek': () => { closeModal(); yedekAl(); },
  'g-yedek-yukle': () => { closeModal(); $('#gYedekDosya').click(); },
  'g-hepsini-sil': async () => {
    closeModal();
    if (!(await onay('Tüm galeri silinsin mi?', 'Bütün fotoğraf, video ve albümler bu cihazdan <b>kalıcı olarak</b> silinir. Önce yedek almanı öneririz.', 'Hepsini sil', true))) return;
    await DB.temizle('oge'); await DB.temizle('dosya'); await DB.temizle('album');
    urlTemizle([...G.url.keys()]); G.ogeler = []; G.albumler = []; G.kilit = {}; G.alb = null; G.yer = null; ciz(); toast('Galeri silindi');
  },
  /* görüntüleyici */
  'g-v-kapat': () => kapat(),
  'g-v-git': el => { V.i = +el.dataset.i; vGoster(); },
  'g-v-geri': () => vGez(-1), 'g-v-ileri': () => vGez(1),
  'g-v-fav': async () => { const o = oge(V.liste[V.i]); if (!o) return; await favDegis([o]); vUst(o); },
  'g-v-bilgi': () => { V.bilgi = !V.bilgi; const o = oge(V.liste[V.i]); if (o) bilgiCiz(o); },
  'g-v-slayt': () => { if (V.slayt) { slaytDur(); if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {}); } else slaytBaslat(); vUst(oge(V.liste[V.i])); },
  'g-v-harita': async () => {
    const o = oge(V.liste[V.i]); if (!o?.konum) return;
    if (!(await onay('Haritada açılsın mı?', 'Konum, OpenStreetMap internet sitesine gönderilir. Başka hiçbir yere gönderilmez.', 'Aç'))) return;
    window.open(`https://www.openstreetmap.org/?mlat=${o.konum.la}&mlon=${o.konum.lo}#map=15/${o.konum.la}/${o.konum.lo}`, '_blank', 'noopener');
  },
  'g-v-indir': () => { const o = oge(V.liste[V.i]); if (o) indir([o]); },
  'g-v-sil': async () => { const o = oge(V.liste[V.i]); if (!o) return; if (!(await sil([o]))) return; const i = V.i; V.liste.splice(i, 1); if (!V.liste.length) return kapat(); V.i = Math.min(i, V.liste.length - 1); vGoster(); },
  'g-v-menu': el => {
    const o = oge(V.liste[V.i]); if (!o) return;
    gPop(el, `${o.tur === 'foto' ? gItem('duzenle', IC.kalem || '', 'Düzenle…') : ''}${gItem('not', IC.bilgi, 'Not ve etiketler…')}${gItem('tasi', IC.album, 'Albüme taşı…')}${gItem('indir', IC.indirG, 'İndir')}${navigator.canShare ? gItem('paylas', IC.paylasG, 'Paylaş…') : ''}${gItem('sil', IC.copG, 'Sil', 'data-danger')}`, async v => {
      if (v === 'duzenle') duzenleAc(o); if (v === 'not') ACTIONS['g-v-not'](); if (v === 'indir') indir([o]); if (v === 'paylas') paylas([o]); if (v === 'sil') ACTIONS['g-v-sil']();
      if (v === 'tasi') gPop(el, albumSecenekleri(o.album), async w => {
        let hedef = ''; if (w === 'yeni') { const a = await albumYeni(); if (!a) return; hedef = a.id; } else if (w.startsWith('a:')) hedef = w.slice(2);
        if (await tasi([o], hedef)) { V.liste.splice(V.i, 1); if (!V.liste.length) return kapat(); V.i = Math.min(V.i, V.liste.length - 1); vGoster(); toast('Taşındı'); }
      });
    });
  }
});
