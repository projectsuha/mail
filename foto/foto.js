/* ───────────── Foto ───────────── */
'use strict';

const FT = {
  gorev: null, bekleyen: null, f: [], sec: 0, n: 0, sonuc: null, calisiyor: false, destek: { webp: true, avif: false }, surukle: null,
  o: {
    kb: { hedef: 200, birim: 1024, sabit: false, olcu: '' },
    boyut: { oran: '1:1', gen: 1080, kalite: 92 },
    vesik: { tur: '50x60', sayfa: 'a4' },
    gz: { filigran: false, yazi: '', renk: '#d00000', opak: 45, mod: 'mozaik' },
    fmt: { tur: 'image/jpeg', kalite: 90 }
  }
};
const FI = {
  kb: svg('<path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/>'),
  kirp: svg('<path d="M6 2v14a2 2 0 0 0 2 2h14M2 6h14a2 2 0 0 1 2 2v14"/>'),
  kisi: svg('<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-4 3.6-6 7-6s6.2 2 7 6"/>'),
  kalkan: svg('<path d="M12 3l7 3v5.5c0 4.2-2.8 7.6-7 9.5-4.2-1.9-7-5.3-7-9.5V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>'),
  cevir: svg('<path d="M4 8h13l-3-3M20 16H7l3 3"/>'),
  sol: svg('<path d="M4 4v5h5"/><path d="M4.6 14a8 8 0 1 0 2-7.7L4 9"/>'),
  sag: svg('<path d="M20 4v5h-5"/><path d="M19.4 14a8 8 0 1 1-2-7.7L20 9"/>'),
  ayna: svg('<path d="M12 3v18M8 7 3 17h5zM16 7l5 10h-5z"/>'),
  indir: svg('<path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/>'),
  paylas: svg('<path d="M12 15V4m0 0L8 8m4-4 4 4M5 13v6h14v-6"/>'),
  resim: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 16 5-5 4 4 3-3 5 5"/><circle cx="16" cy="9.5" r="1.2"/>'),
  uyari: svg('<path d="M12 4 3 20h18z"/><path d="M12 10v4M12 17v.5"/>')
};
const ftBayt = n => n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(n < 10240 ? 1 : 0).replace('.', ',') + ' KB' : (n / 1048576).toFixed(2).replace('.', ',') + ' MB';
const ftCl = (v, a, b) => Math.max(a, Math.min(b, v));
const ftAd = ad => ad.replace(/\.[^.]+$/, '');
const GOREV = {
  kb: { ad: 'KB küçült', alt: 'Dosyayı istenen boyuta getir', ic: FI.kb, ipucu: 'Başvuru siteleri "en fazla 200 KB" gibi sınır koyar. Hedefi yaz, Foto en yüksek kaliteyi o sınırın altında bulur.' },
  boyut: { ad: 'Kırp ve boyutlandır', alt: 'Instagram, WhatsApp, serbest kırpma', ic: FI.kirp, ipucu: 'Çerçeveyi sürükleyerek kaydır, köşelerinden büyüt. Birden çok fotoğrafta seçili olanı ayarla; diğerleri ortadan kırpılır.' },
  vesikalik: { ad: 'Vesikalık', alt: '50×60 mm, baskı sayfası', ic: FI.kisi, ipucu: 'Yüzü ovalin içine yerleştir. Arka plan düz ve açık renk olmalı; Foto arka planı değiştirmez. Kurumun kuralları esastır.' },
  gizlilik: { ad: 'Gizlilik', alt: 'Konum sil, filigran, mozaik', ic: FI.kalkan, ipucu: 'Konum, cihaz ve tarih bilgisi silinir. İstersen kimlik fotokopisine filigran koy ya da fotoğrafta bir yeri mozaikle.' },
  format: { ad: 'Format çevir', alt: 'JPG, PNG, WebP', ic: FI.cevir, ipucu: 'Fotoğrafın dosya türünü değiştirir. Kalite ve yeni boyut aşağıda görünür.' }
};
const ORANLAR = [['orijinal', 'Orijinal'], ['1:1', '1:1 Kare'], ['4:5', '4:5 Insta'], ['9:16', '9:16 Hikâye'], ['16:9', '16:9'], ['3:2', '3:2'], ['serbest', 'Serbest']];
const VESIK = { '50x60': { w: 591, h: 709, ad: 'Vesikalık 50×60 mm' }, '35x45': { w: 413, h: 531, ad: 'Biyometrik 35×45 mm' } };

/* ═════════ Ekleme / durum ═════════ */
async function ftEkle(files) {
  let n = 0;
  for (const file of [...files]) {
    if (FT.f.length >= 30) { toast('En fazla 30 fotoğraf'); break; }
    try {
      const [r, bilgi] = await Promise.all([FOTOIS.coz(file, 1.2e6), FOTOIS.bilgiOku(file)]);
      const m = FOTOIS.boyutla(r.c, 120, 120 * r.c.height / r.c.width), mini = m.toDataURL('image/jpeg', .7); FOTOIS.birak(m);
      FT.f.push({ id: ++FT.n, file, ad: file.name, w: r.nw, h: r.nh, onizle: r.c, goster: r.c, donus: 0, ayna: false, kirp: null, bolge: [], bilgi, mini });
      n++;
    } catch (e) { toast(e.message || 'Açılamadı'); }
  }
  if (n) { FT.sec = FT.f.length - n; FT.sonuc = null; }
  return n;
}
function ftTemizle() { FT.f.forEach(f => { if (f.goster !== f.onizle) FOTOIS.birak(f.goster); FOTOIS.birak(f.onizle); }); FT.f = []; FT.sec = 0; FT.sonuc = null; }
function ftGoster(f) {
  if (f.goster !== f.onizle) FOTOIS.birak(f.goster);
  f.goster = FOTOIS.donustur(f.onizle, f.donus, f.ayna);
}
const kirpModu = () => FT.gorev === 'vesikalik' || (FT.gorev === 'boyut' && FT.o.boyut.oran !== 'orijinal');
function kirpOran() {
  if (FT.gorev === 'vesikalik') { const v = VESIK[FT.o.vesik.tur]; return v.w / v.h; }
  const o = FT.o.boyut.oran; if (o === 'serbest' || o === 'orijinal') return 0;
  const [a, b] = o.split(':').map(Number); return a / b;
}
function kirpVarsayilan(W, H, oran) {
  let w = 1, h = 1;
  if (oran) { if (W / H > oran) w = H * oran / W; else h = W / oran / H; }
  return { x: (1 - w) / 2, y: (1 - h) / 2, w, h };
}

/* ═════════ Ekranlar ═════════ */
function ftBas(baslik, geri) {
  return `<header class="ft-bas">${geri ? `<button class="icon-btn" data-action="ft-geri" aria-label="Geri">${IC.back}</button>` : `<div class="brand-mark sm">${FI.resim}</div>`}<h1>${baslik}</h1><div class="spacer"></div>
    <button class="icon-btn" data-action="ft-ayar" title="Ayarlar">${IC.gear}</button></header>`;
}
function anaCiz() {
  $('#app').innerHTML = `<div class="ft-kabuk">${ftBas('Foto')}
    <main class="ft-govde">
      <p class="ft-giris">Fotoğrafını seç, ne yapmak istediğini söyle. Hepsi bu cihazda olur; fotoğraf hiçbir yere gönderilmez.</p>
      <div class="ft-izgara">${Object.entries(GOREV).map(([k, g]) => `<button class="ft-karo" data-action="ft-gorev" data-g="${k}"><span class="ft-karo-ic">${g.ic}</span><b>${g.ad}</b><small>${g.alt}</small></button>`).join('')}</div>
      <p class="ft-dipnot">Sıkıştırılan fotoğraf aynı dosyayı bozmadan değil, yeni bir kopya olarak kaydedilir; özgün dosyan olduğu gibi kalır. Reklam yok, filigran yok.</p>
    </main></div>`;
}
const ftSeg = (g, k, liste) => `<div class="seg ft-seg">${liste.map(([v, n, d]) => `<button class="${String(FT.o[g][k]) === String(v) ? 'on' : ''}" ${d ? 'disabled' : ''} data-action="ft-sec" data-g="${g}" data-k="${k}" data-v="${v}">${n}</button>`).join('')}</div>`;
const ftSatir = (ad, ic) => `<div class="ft-satir"><span>${ad}</span>${ic}</div>`;

function secenekler() {
  const o = FT.o;
  if (FT.gorev === 'kb') {
    const k = o.kb;
    return `${ftSatir('Hedef', `<div class="ft-sayi"><input type="number" inputmode="numeric" min="1" max="99999" value="${k.hedef}" data-a="kb-hedef">${ftSeg('kb', 'birim', [[1024, 'KB'], [1048576, 'MB']])}</div>`)}
      <div class="ft-cip">${[[50, 1024], [100, 1024], [200, 1024], [500, 1024], [1, 1048576]].map(([d, b]) => `<button class="${k.hedef === d && k.birim === b ? 'on' : ''}" data-action="ft-kb" data-d="${d}" data-b="${b}">${d} ${b === 1024 ? 'KB' : 'MB'}</button>`).join('')}</div>
      ${ftSatir('Ölçü', ftSeg('kb', 'olcu', [['', 'Aynı kalsın'], ['133x171', 'e-Okul 133×171 px']]))}
      ${k.olcu ? '' : ftSatir('Gerekirse', ftSeg('kb', 'sabit', [['false', 'Piksel küçült'], ['true', 'Sadece kalite']]))}
      <p class="ft-ipucu">Kurumun kılavuzundaki ölçü ve boyut esastır; yukarıdakiler yaygın örneklerdir. "Sadece kalite" seçeneğinde fotoğrafın ölçüsü değişmez, sınıra inemezse haber verilir.</p>`;
  }
  if (FT.gorev === 'boyut') {
    const b = o.boyut;
    return `${ftSatir('En boy', `<div class="ft-cip tek">${ORANLAR.map(([v, n]) => `<button class="${b.oran === v ? 'on' : ''}" data-action="ft-sec" data-g="boyut" data-k="oran" data-v="${v}">${n}</button>`).join('')}</div>`)}
      ${ftSatir('Genişlik', ftSeg('boyut', 'gen', [[0, 'Orijinal'], [1080, '1080'], [1920, '1920'], [720, '720']]))}
      ${ftSatir('Kalite', `<input type="range" min="60" max="100" step="1" value="${b.kalite}" data-a="boyut-kalite" class="ft-kaydir"><b>%${b.kalite}</b>`)}
      <p class="ft-ipucu">Dosya JPG olarak yazılır (PNG fotoğraflar PNG kalır). Kalite %92 üstünde gözle fark edilmez.</p>`;
  }
  if (FT.gorev === 'vesikalik') {
    const v = o.vesik;
    return `${ftSatir('Ölçü', ftSeg('vesik', 'tur', Object.entries(VESIK).map(([k, x]) => [k, x.ad.replace('Vesikalık ', '').replace('Biyometrik ', 'Biyometrik '), 0])))}
      ${ftSatir('Baskı sayfası', ftSeg('vesik', 'sayfa', [['a4', 'A4'], ['10x15', '10×15 cm']]))}
      <p class="ft-ipucu">300 dpi'de ${VESIK[v.tur].w}×${VESIK[v.tur].h} piksel üretilir. Hem tek fotoğraf hem de kesip kullanabileceğin baskı sayfası hazırlanır.</p>`;
  }
  if (FT.gorev === 'gizlilik') {
    const g = o.gz, f = FT.f[FT.sec];
    return `${bilgiKutusu(f)}
      <label class="ft-anahtar"><input type="checkbox" data-a="gz-filigran" ${g.filigran ? 'checked' : ''}><span>Kimlik filigranı ekle</span></label>
      ${g.filigran ? `<input class="ft-girdi" data-a="gz-yazi" value="${esc(g.yazi)}" maxlength="60" placeholder="Ör. Sadece X bankası için – 18.10.2026">
        ${ftSatir('Renk', `<div class="ft-renkler">${['#d00000', '#1d4ed8', '#111111', '#ffffff'].map(r => `<button class="ft-renk ${g.renk === r ? 'on' : ''}" style="--r:${r}" data-action="ft-renk" data-r="${r}" aria-label="${r}"></button>`).join('')}</div>`)}
        ${ftSatir('Koyuluk', `<input type="range" min="15" max="90" step="5" value="${g.opak}" data-a="gz-opak" class="ft-kaydir"><b>%${g.opak}</b>`)}` : ''}
      ${ftSatir('Seçili alan', ftSeg('gz', 'mod', [['mozaik', 'Mozaik'], ['kara', 'Siyah kutu']]))}
      <p class="ft-ipucu">Fotoğrafın üstünde parmağınla kutu çizersen o alan mozaiklenir ya da karartılır. Mozaik geri açılamaz.</p>
      ${f && f.bolge.length ? `<div class="ft-cip tek">${f.bolge.map((b, i) => `<button data-action="ft-bolge-sil" data-i="${i}">${b.mod === 'kara' ? 'Siyah' : 'Mozaik'} ${i + 1} ${IC.close}</button>`).join('')}</div>` : ''}`;
  }
  if (FT.gorev === 'format') {
    const m = o.fmt, d = FT.destek;
    return `${ftSatir('Yeni tür', ftSeg('fmt', 'tur', [['image/jpeg', 'JPG'], ['image/png', 'PNG'], ['image/webp', 'WebP', !d.webp], ['image/avif', 'AVIF', !d.avif]]))}
      ${m.tur === 'image/png' ? '' : ftSatir('Kalite', `<input type="range" min="50" max="100" step="1" value="${m.kalite}" data-a="fmt-kalite" class="ft-kaydir"><b>%${m.kalite}</b>`)}
      <p class="ft-ipucu">${m.tur === 'image/png' ? 'PNG kayıpsızdır ama fotoğrafta dosya çok büyüyebilir.' : 'Şeffaf bölgeler beyaza döner (JPG).'}${d.avif ? '' : ' AVIF bu tarayıcıda yok.'}</p>`;
  }
  return '';
}
function bilgiKutusu(f) {
  if (!f) return '';
  const b = f.bilgi;
  if (!b) return `<div class="ft-bilgi"><b>Bilgi:</b> Bu dosya türünde (PNG/WebP vb.) okunabilir çekim bilgisi yok. Yine de temiz bir kopya yazılır.</div>`;
  if (!b.var) return `<div class="ft-bilgi ok"><b>Bu fotoğrafta çekim bilgisi yok.</b></div>`;
  const s = [];
  s.push(b.konum ? `<span class="kotu">Konum var (${b.konum.lat.toFixed(4)}, ${b.konum.lon.toFixed(4)})</span>` : 'Konum yok');
  if (b.cihaz) s.push(`Cihaz: ${esc(b.cihaz)}`);
  if (b.tarih) s.push(`Tarih: ${esc(b.tarih)}`);
  return `<div class="ft-bilgi ${b.konum ? 'kotu' : ''}"><b>Fotoğrafın içinde:</b> ${s.join(' · ')}</div>`;
}
function seritCiz() {
  return `<div class="ft-serit">${FT.f.map((f, i) => `<div class="ft-mini ${i === FT.sec ? 'on' : ''}" data-action="ft-sec-foto" data-i="${i}"><img src="${f.mini}" alt=""><button data-action="ft-cikar" data-i="${i}" aria-label="Çıkar">${IC.close}</button><small>${ftBayt(f.file.size)}</small></div>`).join('')}
    <button class="ft-ekle" data-action="ft-ekle" aria-label="Fotoğraf ekle">${IC.plus}</button></div>`;
}
function aracCiz() {
  const G = GOREV[FT.gorev], f = FT.f[FT.sec], donusAraci = ['boyut', 'vesikalik', 'gizlilik'].includes(FT.gorev);
  $('#app').innerHTML = `<div class="ft-kabuk">${ftBas(G.ad, true)}
    <main class="ft-govde">
      ${seritCiz()}
      <div class="ft-sahne" id="ftSahne"><div class="ft-kutu" id="ftKutu"><canvas id="ftOn"></canvas><div class="ft-ust" id="ftUst"></div></div></div>
      ${donusAraci ? `<div class="ft-arac"><button class="btn sm" data-action="ft-don" data-d="-90">${FI.sol}<span>Sola</span></button><button class="btn sm" data-action="ft-don" data-d="90">${FI.sag}<span>Sağa</span></button><button class="btn sm" data-action="ft-ayna">${FI.ayna}<span>Ayna</span></button></div>` : ''}
      <section class="ft-kart" id="ftSec">${secenekler()}</section>
      <button class="btn primary ft-uygula" id="ftUygula" data-action="ft-uygula" ${FT.calisiyor ? 'disabled' : ''}>${uygulaYazi()}</button>
      <div id="ftSonuc">${sonucCiz()}</div>
      <p class="ft-ipucu alt">${G.ipucu}</p>
    </main></div>`;
  sahneCiz();
}
const uygulaYazi = () => FT.gorev === 'vesikalik' ? 'Vesikalık hazırla' : FT.gorev === 'gizlilik' ? 'Temiz kopya yap' : FT.gorev === 'format' ? 'Çevir' : FT.gorev === 'boyut' ? 'Kırp ve kaydet' : 'Küçült';
function ciz() { FT.gorev ? aracCiz() : anaCiz(); }

/* ═════════ Önizleme ve dokunma ═════════ */
function sahneCiz() {
  const f = FT.f[FT.sec], cv = $('#ftOn'); if (!f || !cv) return;
  const g = f.goster; cv.width = g.width; cv.height = g.height; cv.getContext('2d').drawImage(g, 0, 0);
  const sahne = $('#ftSahne'), maxW = Math.max(120, sahne.clientWidth - 4), maxH = Math.min(innerHeight * .5, 520), s = Math.min(maxW / g.width, maxH / g.height, 1.6);
  cv.style.width = Math.round(g.width * s) + 'px'; cv.style.height = Math.round(g.height * s) + 'px';
  ustCiz();
}
function ustCiz() {
  const f = FT.f[FT.sec], u = $('#ftUst'); if (!f || !u) return;
  let h = '';
  if (kirpModu()) {
    if (!f.kirp) f.kirp = kirpVarsayilan(f.goster.width, f.goster.height, kirpOran());
    const k = f.kirp, p = v => (v * 100).toFixed(2) + '%';
    h += `<div class="ft-kirp" data-h="m" style="left:${p(k.x)};top:${p(k.y)};width:${p(k.w)};height:${p(k.h)}">${FT.gorev === 'vesikalik' ? '<i class="ft-yuz"></i>' : '<i class="ft-uclu"></i>'}<b data-h="nw"></b><b data-h="ne"></b><b data-h="sw"></b><b data-h="se"></b></div>`;
  }
  if (FT.gorev === 'gizlilik') {
    const p = v => (v * 100).toFixed(2) + '%', liste = f.bolge.concat(FT.surukle?.yeni ? [FT.surukle.yeni] : []);
    h += liste.map(b => `<div class="ft-bolge ${b.mod}" style="left:${p(b.x)};top:${p(b.y)};width:${p(b.w)};height:${p(b.h)}"></div>`).join('');
  }
  u.innerHTML = h; u.classList.toggle('ciz', FT.gorev === 'gizlilik');
}
function kirpHareket(s, fx, fy, f) {
  const P = f.goster, oran = kirpOran(), k = s.k;
  if (s.h === 'm') { f.kirp = { x: ftCl(k.x + fx - s.fx, 0, 1 - k.w), y: ftCl(k.y + fy - s.fy, 0, 1 - k.h), w: k.w, h: k.h }; return; }
  const ax = s.h.includes('w') ? k.x + k.w : k.x, ay = s.h.includes('n') ? k.y + k.h : k.y, px = ftCl(fx, 0, 1), py = ftCl(fy, 0, 1), sx = px >= ax ? 1 : -1, sy = py >= ay ? 1 : -1;
  let w = Math.abs(px - ax), h = Math.abs(py - ay);
  const mw = sx > 0 ? 1 - ax : ax, mh = sy > 0 ? 1 - ay : ay;
  if (oran) {
    let W = w * P.width, H = h * P.height; if (W / H > oran) W = H * oran; else H = W / oran;
    w = W / P.width; h = H / P.height; const sc = Math.min(1, mw / (w || 1), mh / (h || 1)); w *= sc; h *= sc;
    if (w < .06) { w = .06; h = w * P.width / oran / P.height; }
  } else { w = Math.max(w, .05); h = Math.max(h, .05); }
  w = Math.min(w, mw); h = Math.min(h, mh);
  f.kirp = { x: ftCl(sx > 0 ? ax : ax - w, 0, 1 - w), y: ftCl(sy > 0 ? ay : ay - h, 0, 1 - h), w, h };
}
document.addEventListener('pointerdown', e => {
  const u = e.target.closest?.('#ftUst'), f = FT.f[FT.sec]; if (!u || !f) return;
  const r = u.getBoundingClientRect(), fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height, h = e.target.closest('[data-h]')?.dataset.h;
  if (kirpModu() && h) FT.surukle = { t: 'kirp', h, fx, fy, k: { ...f.kirp } };
  else if (FT.gorev === 'gizlilik') FT.surukle = { t: 'bolge', fx: ftCl(fx, 0, 1), fy: ftCl(fy, 0, 1), yeni: null };
  else return;
  e.preventDefault(); try { u.setPointerCapture(e.pointerId); } catch { /* */ }
});
document.addEventListener('pointermove', e => {
  const s = FT.surukle, f = FT.f[FT.sec], u = $('#ftUst'); if (!s || !f || !u) return;
  const r = u.getBoundingClientRect(), fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
  if (s.t === 'kirp') kirpHareket(s, fx, fy, f);
  else { const x1 = ftCl(fx, 0, 1), y1 = ftCl(fy, 0, 1); s.yeni = { x: Math.min(s.fx, x1), y: Math.min(s.fy, y1), w: Math.abs(x1 - s.fx), h: Math.abs(y1 - s.fy), mod: FT.o.gz.mod }; }
  ustCiz();
});
const surukleBitir = () => {
  const s = FT.surukle, f = FT.f[FT.sec]; if (!s) return; FT.surukle = null;
  if (s.t === 'bolge' && s.yeni && s.yeni.w > .02 && s.yeni.h > .02 && f) { f.bolge.push(s.yeni); FT.sonuc = null; const sec = $('#ftSec'); if (sec) sec.innerHTML = secenekler(); const so = $('#ftSonuc'); if (so) so.innerHTML = ''; }
  ustCiz();
};
document.addEventListener('pointerup', surukleBitir); document.addEventListener('pointercancel', surukleBitir);

/* ═════════ İşleme ═════════ */
async function hazirla(f) {
  const { c } = await FOTOIS.coz(f.file), d = FOTOIS.donustur(c, f.donus, f.ayna);
  if (d !== c) FOTOIS.birak(c); return d;
}
function kirpDikdortgen(c, f, oran) {
  const k = f.kirp || kirpVarsayilan(c.width, c.height, oran);
  return { x: k.x * c.width, y: k.y * c.height, w: k.w * c.width, h: k.h * c.height };
}
async function isle(f) {
  const o = FT.o, ad = ftAd(f.ad), cikis = [];
  const png = f.file.type === 'image/png';
  if (FT.gorev === 'kb') {
    const k = o.kb, hedef = Math.round(k.hedef * k.birim), tamJpeg = /jpe?g/i.test(f.file.type);
    if (!k.olcu && tamJpeg && f.file.size <= hedef) return [{ ad: f.ad, blob: f.file, once: f.file.size, not: 'Zaten hedefin altında; değiştirilmedi.' }];
    let c = await hazirla(f);
    if (k.olcu) { const [W, H] = k.olcu.split('x').map(Number), t = FOTOIS.kapla(c, W, H); FOTOIS.birak(c); c = t; }
    const r = await FOTOIS.hedefeSigdir(c, hedef, { sabit: !!k.olcu || String(k.sabit) === 'true' }); FOTOIS.birak(c);
    cikis.push({ ad: `${ad}-${Math.round(k.hedef)}${k.birim === 1024 ? 'kb' : 'mb'}.jpg`, blob: r.blob, once: f.file.size, not: `${r.w}×${r.h} px · kalite %${Math.round(r.kalite * 100)}`, uyari: r.tamam ? '' : `Hedefe inemedi: en küçük hâl ${ftBayt(r.blob.size)}. "Piksel küçült" seçeneğini dene.` });
    return cikis;
  }
  if (FT.gorev === 'boyut') {
    const b = o.boyut; let c = await hazirla(f);
    if (b.oran !== 'orijinal') {
      const oran = b.oran === 'serbest' ? 0 : (([x, y]) => x / y)(b.oran.split(':').map(Number)), r = kirpDikdortgen(c, f, oran), t = FOTOIS.kes(c, r.x, r.y, r.w, r.h); FOTOIS.birak(c); c = t;
    }
    if (+b.gen && c.width > +b.gen) { const t = FOTOIS.boyutla(c, +b.gen, +b.gen * c.height / c.width); FOTOIS.birak(c); c = t; }
    const tur = png ? 'image/png' : 'image/jpeg', cc = png ? c : FOTOIS.beyazZemin(c), bl = await FOTOIS.blob(cc, tur, b.kalite / 100);
    cikis.push({ ad: `${ad}-${c.width}x${c.height}.${png ? 'png' : 'jpg'}`, blob: bl, once: f.file.size, not: `${c.width}×${c.height} px${png ? '' : ' · kalite %' + b.kalite}` });
    if (cc !== c) FOTOIS.birak(cc); FOTOIS.birak(c); return cikis;
  }
  if (FT.gorev === 'vesikalik') {
    const v = VESIK[o.vesik.tur], c = await hazirla(f), r = kirpDikdortgen(c, f, v.w / v.h), foto = FOTOIS.kes(c, r.x, r.y, r.w, r.h, v.w, v.h); FOTOIS.birak(c);
    const zemin = FOTOIS.beyazZemin(foto), jb = await FOTOIS.blob(zemin, 'image/jpeg', .95), j = FOTOIS.jpegDpi(new Uint8Array(await jb.arrayBuffer()), 300);
    cikis.push({ ad: `${ad}-vesikalik-${o.vesik.tur}.jpg`, blob: new Blob([j], { type: 'image/jpeg' }), once: f.file.size, not: `${v.w}×${v.h} px · 300 dpi` });
    const { c: sayfa, adet } = FOTOIS.baskiSayfasi(zemin, o.vesik.sayfa), sb = await FOTOIS.blob(sayfa, 'image/jpeg', .95), sj = FOTOIS.jpegDpi(new Uint8Array(await sb.arrayBuffer()), 300);
    cikis.push({ ad: `${ad}-baski-${o.vesik.sayfa}.jpg`, blob: new Blob([sj], { type: 'image/jpeg' }), once: 0, not: `${FOTOIS.BASKI[o.vesik.sayfa].ad} sayfasında ${adet} adet`, sayfa: true });
    FOTOIS.birak(zemin); FOTOIS.birak(foto); FOTOIS.birak(sayfa); return cikis;
  }
  if (FT.gorev === 'gizlilik') {
    const g = o.gz, filigran = g.filigran && g.yazi.trim(), duzenleme = filigran || f.bolge.length || f.donus || f.ayna, tamJpeg = /jpe?g/i.test(f.file.type);
    if (!duzenleme && tamJpeg) {
      const u8 = FOTOIS.jpegTemizle(new Uint8Array(await f.file.arrayBuffer()), f.bilgi?.yon || 1);
      return [{ ad: `${ad}-temiz.jpg`, blob: new Blob([u8], { type: 'image/jpeg' }), once: f.file.size, not: 'Konum, cihaz ve tarih silindi · görüntüye dokunulmadı (kayıpsız)' }];
    }
    let c = await hazirla(f);
    if (f.bolge.length) FOTOIS.bolgeleriUygula(c, f.bolge);
    if (filigran) FOTOIS.filigranCiz(c, { yazi: g.yazi.trim(), renk: g.renk, opaklik: g.opak / 100 });
    const cc = png ? c : FOTOIS.beyazZemin(c), bl = await FOTOIS.blob(cc, png ? 'image/png' : 'image/jpeg', .92);
    cikis.push({ ad: `${ad}-temiz.${png ? 'png' : 'jpg'}`, blob: bl, once: f.file.size, not: `Konum, cihaz ve tarih bilgisi yok${png ? '' : ' · yeniden yazıldı, kalite %92'}` });
    if (cc !== c) FOTOIS.birak(cc); FOTOIS.birak(c); return cikis;
  }
  if (FT.gorev === 'format') {
    const m = o.fmt, c = await hazirla(f), cc = m.tur === 'image/jpeg' ? FOTOIS.beyazZemin(c) : c, bl = await FOTOIS.blob(cc, m.tur, m.kalite / 100), uz = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' }[m.tur];
    if (cc !== c) FOTOIS.birak(cc); FOTOIS.birak(c);
    return [{ ad: `${ad}.${uz}`, blob: bl, once: f.file.size, not: `${uz.toUpperCase()}${m.tur === 'image/png' ? '' : ' · kalite %' + m.kalite}` }];
  }
  return [];
}
async function uygula() {
  if (FT.calisiyor || !FT.f.length) return;
  FT.calisiyor = true; FT.sonuc = null; const btn = $('#ftUygula'), toplam = FT.f.length, liste = [];
  try {
    for (let i = 0; i < toplam; i++) {
      if (btn) { btn.disabled = true; btn.textContent = toplam > 1 ? `İşleniyor ${i + 1}/${toplam}…` : 'İşleniyor…'; }
      await new Promise(r => setTimeout(r, 30));
      try { for (const s of await isle(FT.f[i])) { s.url = URL.createObjectURL(s.blob); s.kaynak = FT.f[i].ad; liste.push(s); } }
      catch (e) { liste.push({ hata: true, kaynak: FT.f[i].ad, ad: FT.f[i].ad, not: e.message || 'İşlenemedi' }); }
    }
  } finally { FT.calisiyor = false; }
  (FT.sonuc || []).forEach(s => s.url && URL.revokeObjectURL(s.url));
  FT.sonuc = liste; if (btn) { btn.disabled = false; btn.textContent = uygulaYazi(); }
  const so = $('#ftSonuc'); if (so) { so.innerHTML = sonucCiz(); so.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
}
function sonucCiz() {
  const s = FT.sonuc; if (!s) return '';
  const iyi = s.filter(x => !x.hata);
  return `<section class="ft-kart ft-sonuc"><h4>Hazır</h4>
    ${s.map((x, i) => x.hata ? `<div class="ft-s hata"><div class="ft-s-m"><b>${esc(x.kaynak)}</b><span>${IC.close} ${esc(x.not)}</span></div></div>` : `
      <div class="ft-s"><img src="${x.url}" alt=""><div class="ft-s-m"><b>${esc(x.ad)}</b>
        <span class="ft-boyut">${x.once ? `${ftBayt(x.once)} → <i>${ftBayt(x.blob.size)}</i>` : `<i>${ftBayt(x.blob.size)}</i>`}</span>
        <span>${esc(x.not || '')}</span>${x.uyari ? `<span class="ft-uy">${FI.uyari}${esc(x.uyari)}</span>` : ''}</div>
        <div class="ft-s-d"><button class="icon-btn" data-action="ft-indir" data-i="${i}" title="İndir" aria-label="İndir">${FI.indir}</button>${navigator.canShare && navigator.canShare({ files: [new File([x.blob], x.ad, { type: x.blob.type })] }) ? `<button class="icon-btn" data-action="ft-paylas" data-i="${i}" title="Paylaş / Fotoğraflara kaydet" aria-label="Paylaş">${FI.paylas}</button>` : ''}</div></div>`).join('')}
    ${iyi.length > 1 ? `<button class="btn ft-zip" data-action="ft-zip">${FI.indir}<span>Hepsini tek zip olarak indir (${iyi.length})</span></button>` : ''}
    <p class="ft-ipucu">Özgün dosyan değişmedi; bunlar yeni kopyalar.</p></section>`;
}
function ftIndir(blob, ad) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = ad; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 8000);
}

/* ═════════ Ayarlar ═════════ */
function ayarAc() {
  const t = store.get('theme', 'light');
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet settings"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Ayarlar</h3></header>
    <div class="set-body">
      <section><h4>Görünüm</h4><div class="seg yon-seg">${[['light', 'Cam'], ['dark', 'Koyu'], ['auto', 'Otomatik'], ['flat', 'Düz']].map(([k, n]) => `<button class="${t === k ? 'on' : ''}" data-action="ft-tema" data-t="${k}">${n}</button>`).join('')}</div></section>
      <section><h4>Verilerin</h4><div class="set-row"><div><b>Fotoğraflar cihazından çıkmaz</b><span>Foto internete fotoğraf göndermez; her şey bu cihazın tarayıcısında olur. Sayfayı kapatınca fotoğraflar bellekten silinir. Kaydettiğin kopyalar senin indirme klasöründe kalır.</span></div></div></section>
      <section><h4>Uygulama</h4>${typeof aboutRow === 'function' ? aboutRow() : ''}</section>
    </div></div></div>`;
}

/* ═════════ Olaylar ═════════ */
Object.assign(ACTIONS, {
  'ft-ayar': () => ayarAc(), settings: () => ayarAc(),
  'ft-tema': el => { store.set('theme', el.dataset.t); applyTheme(el.dataset.t); ayarAc(); },
  'ft-gorev': el => { FT.bekleyen = el.dataset.g; $('#ftDosya').click(); },
  'ft-ekle': () => { FT.bekleyen = FT.gorev; $('#ftDosya').click(); },
  'ft-geri': () => { (FT.sonuc || []).forEach(s => s.url && URL.revokeObjectURL(s.url)); ftTemizle(); FT.gorev = null; ciz(); },
  'ft-sec-foto': el => { if (FT.surukle) return; FT.sec = +el.dataset.i; ciz(); },
  'ft-cikar': (el, e) => { e?.stopPropagation(); const i = +el.dataset.i, f = FT.f[i]; if (f.goster !== f.onizle) FOTOIS.birak(f.goster); FOTOIS.birak(f.onizle); FT.f.splice(i, 1); FT.sec = Math.max(0, Math.min(FT.sec, FT.f.length - 1)); FT.sonuc = null; if (!FT.f.length) { FT.gorev = null; } ciz(); },
  'ft-sec': el => {
    const { g, k, v } = el.dataset, eski = FT.o[g][k]; FT.o[g][k] = /^\d+$/.test(v) ? +v : v === 'true' ? true : v === 'false' ? false : v; FT.sonuc = null;
    if (eski !== FT.o[g][k] && (k === 'oran' || (g === 'vesik' && k === 'tur'))) FT.f.forEach(f => f.kirp = null);
    ciz();
  },
  'ft-kb': el => { FT.o.kb.hedef = +el.dataset.d; FT.o.kb.birim = +el.dataset.b; FT.sonuc = null; ciz(); },
  'ft-renk': el => { FT.o.gz.renk = el.dataset.r; ciz(); },
  'ft-bolge-sil': el => { FT.f[FT.sec].bolge.splice(+el.dataset.i, 1); FT.sonuc = null; ciz(); },
  'ft-don': el => { const f = FT.f[FT.sec]; f.donus = ((f.donus + +el.dataset.d) % 360 + 360) % 360; f.kirp = null; f.bolge = []; ftGoster(f); FT.sonuc = null; ciz(); },
  'ft-ayna': () => { const f = FT.f[FT.sec]; f.ayna = !f.ayna; f.kirp = null; f.bolge = []; ftGoster(f); FT.sonuc = null; ciz(); },
  'ft-uygula': () => uygula(),
  'ft-indir': el => { const s = FT.sonuc[+el.dataset.i]; ftIndir(s.blob, s.ad); },
  'ft-paylas': async el => { const s = FT.sonuc[+el.dataset.i]; try { await navigator.share({ files: [new File([s.blob], s.ad, { type: s.blob.type })] }); } catch { /* vazgeçti */ } },
  'ft-zip': async () => { const z = await FOTOIS.zip(FT.sonuc.filter(x => !x.hata).map(x => ({ ad: x.ad, blob: x.blob }))); ftIndir(z, 'foto-' + new Date().toISOString().slice(0, 10) + '.zip'); }
});
document.addEventListener('input', e => {
  const t = e.target, k = t.dataset.a; if (!k) return;
  if (k === 'kb-hedef') { FT.o.kb.hedef = Math.max(1, +t.value || 1); FT.sonuc = null; const c = $('#ftSec .ft-cip'); if (c) c.querySelectorAll('button').forEach(b => b.classList.toggle('on', +b.dataset.d === FT.o.kb.hedef && +b.dataset.b === FT.o.kb.birim)); }
  else if (k === 'boyut-kalite') { FT.o.boyut.kalite = +t.value; t.nextElementSibling.textContent = '%' + t.value; }
  else if (k === 'fmt-kalite') { FT.o.fmt.kalite = +t.value; t.nextElementSibling.textContent = '%' + t.value; }
  else if (k === 'gz-opak') { FT.o.gz.opak = +t.value; t.nextElementSibling.textContent = '%' + t.value; }
  else if (k === 'gz-yazi') FT.o.gz.yazi = t.value;
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'ftDosya') {
    const files = [...t.files]; t.value = '';
    if (!files.length) return;
    (async () => {
      const g = FT.bekleyen || FT.gorev; if (!FT.gorev) { FT.gorev = g; ciz(); }
      toast('Fotoğraflar açılıyor…');
      const n = await ftEkle(files);
      if (!n && !FT.f.length) { FT.gorev = null; }
      ciz();
    })();
    return;
  }
  if (t.dataset.a === 'gz-filigran') { FT.o.gz.filigran = t.checked; FT.sonuc = null; ciz(); }
});

/* ═════════ Başlangıç ═════════ */
document.removeEventListener('DOMContentLoaded', boot);
async function fotoBaslat() {
  document.documentElement.classList.add('ft-html');
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  const gir = document.createElement('input'); gir.type = 'file'; gir.id = 'ftDosya'; gir.multiple = true; gir.accept = 'image/*,.heic,.heif'; gir.hidden = true; document.body.appendChild(gir);
  anaCiz();
  FT.destek.webp = await FOTOIS.yazilabilir('image/webp'); FT.destek.avif = await FOTOIS.yazilabilir('image/avif');
  if (FT.gorev) { const s = $('#ftSec'); if (s) s.innerHTML = secenekler(); }
}
showLogin = msg => { if (msg) toast(msg); };
start = () => fotoBaslat();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fotoBaslat); else fotoBaslat();
window.addEventListener('resize', () => { if (FT.gorev && FT.f.length) sahneCiz(); });
