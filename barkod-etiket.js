/* ───────────── Barkod: etiket çizimi, kâğıt yerleşimi, PDF ─────────────
   Etiket tasarımı mm cinsindendir. Aynı yerleşim hesabı ekranda (SVG), önizlemede ve PDF'te kullanılır.
   PDF'te çubuklar, çizgiler ve kutular vektör çizilir (her yazıcıda keskin); yazılar ve resimler
   etiket başına yüksek çözünürlüklü saydam bir katman olarak eklenir (Türkçe harfler sorunsuz). */
'use strict';

const PT_MM = 0.3527778;   // 1 punto = 0,353 mm
const YAZI_TIPI = {
  sans: { ad: 'Düz (Arial)', aile: '"Helvetica Neue", Arial, "Segoe UI", sans-serif' },
  dar: { ad: 'Dar', aile: '"Arial Narrow", "Roboto Condensed", "Helvetica Neue", Arial, sans-serif', dar: true },
  serif: { ad: 'Tırnaklı (Times)', aile: 'Georgia, "Times New Roman", serif' },
  mono: { ad: 'Eş aralıklı', aile: 'Menlo, Consolas, "Courier New", monospace' },
  yuvarlak: { ad: 'Yuvarlak', aile: '"Avenir Next", "Nunito", "Segoe UI", "Helvetica Neue", Arial, sans-serif' }
};
const bugun = () => new Date().toLocaleDateString('tr-TR');
// {{alan}} yer tutucularını doldur
function doldur(s, veri = {}) {
  return String(s ?? '').replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, k) => {
    k = k.trim();
    if (veri[k] != null && veri[k] !== '') return String(veri[k]);
    if (k === 'tarih') return bugun();
    return '';
  });
}
const alanlariBul = t => { const s = new Set(); (t.ogeler || []).forEach(o => [o.metin, o.veri].forEach(v => String(v || '').replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, k) => { if (k.trim() !== 'tarih') s.add(k.trim()); }))); return [...s]; };

/* ───── Yazı ölçme ve yerleşim ───── */
const olcTuval = document.createElement('canvas').getContext('2d');
function yaziYerlesim(o, metin) {
  const tip = YAZI_TIPI[o.font] || YAZI_TIPI.sans;
  let boy = (o.boy || 10) * PT_MM;   // mm
  const font = b => `${o.italik ? 'italic ' : ''}${o.kalin ? '700' : '400'} ${b}px ${tip.aile}`;
  const satirlar = String(metin).split('\n');
  const olc = b => { olcTuval.font = font(b * 10); return Math.max(...satirlar.map(s => olcTuval.measureText(s).width / 10)); };
  const ara = o.satir || 1.15;
  if (o.sigdir !== false) {
    const gen = olc(boy), yuk = boy * ara * satirlar.length;
    const k = Math.min(1, gen ? (o.w - 0.4) / gen : 1, (o.h) / Math.max(yuk, 0.01));
    if (k < 1) boy *= k;
  }
  const H = boy * ara * satirlar.length;
  const y0 = o.dikey === 'alt' ? o.y + o.h - H : o.dikey === 'ust' ? o.y : o.y + (o.h - H) / 2;
  const x = o.hiza === 'orta' ? o.x + o.w / 2 : o.hiza === 'sag' ? o.x + o.w : o.x;
  return { boy, aile: tip.aile, kalin: !!o.kalin, italik: !!o.italik, hiza: o.hiza || 'sol', satirlar: satirlar.map((s, i) => ({ s, x, y: y0 + boy * ara * i + boy * 0.82 })), renk: o.renk || '#000', font };
}

/* ───── Barkod öğesi yerleşimi ───── */
function barkodYerlesim(o, veri) {
  const deger = doldur(o.veri, veri);
  if (!deger) return { hata: 'Veri boş' };
  const model = kodla(o.tur, deger, { kontrol: o.kontrol, hata: o.qrHata });
  if (model.hata) return { hata: model.hata, model };
  const yazi = o.yazi !== false && model.tur === '1b';
  // Modül genişliği: kutuya sığacak en büyük (istenirse sabit)
  let X;
  if (model.tur === '2b') { const n = model.n + model.sessiz * 2; X = Math.min(o.w, o.h - (o.yazi && o.altYazi ? 3 : 0)) / n; }
  else { const n = model.moduller.length + (o.sessiz === false ? 0 : model.sessizSol + model.sessizSag); X = o.modul ? Math.min(o.modul, o.w / n) : o.w / n; }
  const yb = o.yaziBoy ? o.yaziBoy * PT_MM : Math.max(1.6, Math.min(X * 9, o.h * 0.2));
  const lay = yerlesim(model, { modul: X, yukseklik: o.h, yazi, yaziBoy: yb, sessiz: o.sessiz, altMetin: o.altYazi ? deger : '' });
  const dx = o.x + (o.w - lay.w) / 2, dy = o.y + (model.tur === '2b' ? (o.h - lay.h) / 2 : 0);
  return { lay, dx, dy, X, model, deger };
}

/* ───── SVG (ekran ve önizleme) ───── */
const f4 = n => +(+n).toFixed(3);
const xmlKac = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function ogeSvg(o, veri, ekran) {
  if (o.tip === 'barkod') {
    const b = barkodYerlesim(o, veri);
    if (b.hata) return ekran ? `<g><rect x="${f4(o.x)}" y="${f4(o.y)}" width="${f4(o.w)}" height="${f4(o.h)}" fill="#fde8e8" stroke="#dc2626" stroke-width="0.2" stroke-dasharray="1 0.6"/><text x="${f4(o.x + o.w / 2)}" y="${f4(o.y + o.h / 2)}" font-size="${f4(Math.min(2.4, o.h / 4))}" text-anchor="middle" fill="#b91c1c" font-family="sans-serif">${xmlKac(b.hata.slice(0, 40))}</text></g>` : '';
    const L = b.lay, r = o.renk || '#000';
    return `<g transform="translate(${f4(b.dx)} ${f4(b.dy)})"><path fill="${r}" d="${L.cubuklar.map(c => `M${f4(c.x)} ${f4(c.y)}h${f4(c.w)}v${f4(c.h)}h${f4(-c.w)}z`).join('')}"/>`
      + L.yazilar.map(y => `<text x="${f4(y.x)}" y="${f4(y.y)}" font-size="${f4(y.boy)}" text-anchor="middle" fill="${r}" font-family='"Helvetica Neue", Arial, sans-serif'${y.aralik ? ` textLength="${f4(y.aralik * 0.92)}" lengthAdjust="spacing"` : ''}>${xmlKac(y.metin)}</text>`).join('') + '</g>';
  }
  if (o.tip === 'yazi') {
    const m = doldur(o.metin, veri); if (!m) return '';
    const y = yaziYerlesim(o, m), anc = y.hiza === 'orta' ? 'middle' : y.hiza === 'sag' ? 'end' : 'start';
    return y.satirlar.map(s => `<text x="${f4(s.x)}" y="${f4(s.y)}" font-size="${f4(y.boy)}" font-family='${y.aile}' font-weight="${y.kalin ? 700 : 400}"${y.italik ? ' font-style="italic"' : ''} text-anchor="${anc}" fill="${y.renk}" xml:space="preserve">${xmlKac(s.s)}</text>`).join('');
  }
  if (o.tip === 'cizgi') return `<line x1="${f4(o.x)}" y1="${f4(o.y)}" x2="${f4(o.x + o.w)}" y2="${f4(o.y + o.h)}" stroke="${o.renk || '#000'}" stroke-width="${f4(o.kalinlik || 0.3)}"/>`;
  if (o.tip === 'kutu') { const k = o.kalinlik ?? 0.3; return `<rect x="${f4(o.x + k / 2)}" y="${f4(o.y + k / 2)}" width="${f4(Math.max(0, o.w - k))}" height="${f4(Math.max(0, o.h - k))}" rx="${f4(o.kose || 0)}" fill="${o.dolgu || 'none'}" stroke="${k ? o.renk || '#000' : 'none'}" stroke-width="${f4(k)}"/>`; }
  if (o.tip === 'resim' && o.src) return `<image href="${xmlKac(o.src)}" x="${f4(o.x)}" y="${f4(o.y)}" width="${f4(o.w)}" height="${f4(o.h)}" preserveAspectRatio="xMidYMid meet"/>`;
  return '';
}
/* Dışarıdan gelen tasarımı (yedek dosyası, eski kayıt) güvenli hâle getir: sadece bilinen öğe türleri,
   geçerli renk/yazı tipi/sayı, sadece gömülü resim. Böylece bozuk ya da kötü niyetli bir yedek sayfaya kod sokamaz. */
const RENK_DOGRU = /^#[0-9a-f]{3,8}$/i, RESIM_DOGRU = /^data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/;
function tasarimTemizle(t) {
  if (!t || typeof t !== 'object' || !Array.isArray(t.ogeler)) return null;
  const sayi = (v, d = 0) => Number.isFinite(+v) ? +v : d, yazi = (v, n) => v == null ? v : String(v).slice(0, n);
  const r = { id: yazi(t.id || Math.random().toString(36).slice(2, 11), 40), ad: yazi(t.ad || 'Etiket', 80), w: Math.min(1200, Math.max(5, sayi(t.w, 50))), h: Math.min(1200, Math.max(5, sayi(t.h, 30))),
    kose: Math.max(0, sayi(t.kose)), alanlar: {}, ogeler: [], olustu: sayi(t.olustu, Date.now()), degisti: sayi(t.degisti, Date.now()), kagit: typeof t.kagit === 'string' ? t.kagit.slice(0, 40) : null };
  for (const [k, v] of Object.entries(t.alanlar && typeof t.alanlar === 'object' ? t.alanlar : {})) if (/^[^{}\s<>"'&]{1,40}$/.test(k)) r.alanlar[k] = String(v ?? '').slice(0, 2000);
  for (const o of t.ogeler.slice(0, 300)) {
    if (!o || typeof o !== 'object' || !['barkod', 'yazi', 'cizgi', 'kutu', 'resim'].includes(o.tip)) continue;
    const y = { id: yazi(o.id || Math.random().toString(36).slice(2, 11), 40), tip: o.tip };
    for (const k of ['x', 'y', 'w', 'h', 'boy', 'kalinlik', 'kose', 'yaziBoy']) if (o[k] != null) y[k] = sayi(o[k]);
    if (o.modul != null && o.modul !== '') y.modul = sayi(o.modul) || undefined;
    for (const k of ['kalin', 'italik', 'sigdir', 'kilit', 'yazi', 'kontrol', 'sessiz', 'altYazi']) if (o[k] != null) y[k] = !!o[k];
    if (o.renk != null) y.renk = RENK_DOGRU.test(o.renk) ? o.renk : '#000000';
    if (o.dolgu) y.dolgu = RENK_DOGRU.test(o.dolgu) ? o.dolgu : '#eeeeee';
    if (o.tip === 'yazi') { y.metin = yazi(o.metin ?? '', 2000); y.font = YAZI_TIPI[o.font] ? o.font : 'sans'; if (['sol', 'orta', 'sag'].includes(o.hiza)) y.hiza = o.hiza; if (['ust', 'orta', 'alt'].includes(o.dikey)) y.dikey = o.dikey; }
    if (o.tip === 'barkod') { y.veri = yazi(o.veri ?? '', 2000); y.tur = typeof TURLER !== 'undefined' && TURLER[o.tur] ? o.tur : 'code128'; if (['L', 'M', 'Q', 'H'].includes(o.qrHata)) y.qrHata = o.qrHata; }
    if (o.tip === 'resim') { if (!RESIM_DOGRU.test(o.src || '')) continue; y.src = o.src; }
    r.ogeler.push(y);
  }
  return r;
}
function etiketSvg(t, veri, o = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f4(t.w)} ${f4(t.h)}"${o.boyut ? ` width="${f4(t.w)}mm" height="${f4(t.h)}mm"` : ''} shape-rendering="${o.ekran ? 'auto' : 'crispEdges'}">`
    + (o.zemin !== false ? `<rect width="${f4(t.w)}" height="${f4(t.h)}" rx="${f4(t.kose || 0)}" fill="#fff"/>` : '')
    + (t.ogeler || []).map(x => ogeSvg(x, veri, o.ekran)).join('') + '</svg>';
}

/* ───── Kâğıt şablonları ─────
   A4: 210 × 297 mm. sutun × satir, etiket gen × yük, üst/sol kenar, yatay/dikey aralık (mm). */
const KAGITLAR = [
  { id: 'a4-24', ad: 'A4 · 24\'lü (3×8) 70 × 37 mm', a4: true, sutun: 3, satir: 8, ew: 70, eh: 37, ust: 0.5, sol: 0, ay: 0, dy: 0 },
  { id: 'a4-21', ad: 'A4 · 21\'li (3×7) 70 × 42,4 mm', a4: true, sutun: 3, satir: 7, ew: 70, eh: 42.4, ust: 0.1, sol: 0, ay: 0, dy: 0 },
  { id: 'a4-27', ad: 'A4 · 27\'li (3×9) 70 × 32 mm', a4: true, sutun: 3, satir: 9, ew: 70, eh: 32, ust: 4.5, sol: 0, ay: 0, dy: 0 },
  { id: 'a4-40', ad: 'A4 · 40\'lı (4×10) 52,5 × 29,7 mm', a4: true, sutun: 4, satir: 10, ew: 52.5, eh: 29.7, ust: 0, sol: 0, ay: 0, dy: 0 },
  { id: 'a4-44', ad: 'A4 · 44\'lü (4×11) 48,5 × 25,4 mm', a4: true, sutun: 4, satir: 11, ew: 48.5, eh: 25.4, ust: 8.8, sol: 8, ay: 0, dy: 0 },
  { id: 'a4-65', ad: 'A4 · 65\'li (5×13) 38,1 × 21,2 mm', a4: true, sutun: 5, satir: 13, ew: 38.1, eh: 21.2, ust: 10.7, sol: 4.7, ay: 2.5, dy: 0 },
  { id: 'a4-14', ad: 'A4 · 14\'lü (2×7) 99,1 × 38,1 mm', a4: true, sutun: 2, satir: 7, ew: 99.1, eh: 38.1, ust: 15.1, sol: 4.7, ay: 2.5, dy: 0 },
  { id: 'a4-16', ad: 'A4 · 16\'lı (2×8) 105 × 37 mm', a4: true, sutun: 2, satir: 8, ew: 105, eh: 37, ust: 0.5, sol: 0, ay: 0, dy: 0 },
  { id: 'a4-8', ad: 'A4 · 8\'li (2×4) 105 × 74 mm', a4: true, sutun: 2, satir: 4, ew: 105, eh: 74, ust: 0.5, sol: 0, ay: 0, dy: 0 },
  { id: 'a4-1', ad: 'A4 · tek sayfa (210 × 297 mm)', a4: true, sutun: 1, satir: 1, ew: 210, eh: 297, ust: 0, sol: 0, ay: 0, dy: 0 },
  { id: 'r-40x30', ad: 'Rulo (termal) · 40 × 30 mm', rulo: true, ew: 40, eh: 30 },
  { id: 'r-50x25', ad: 'Rulo (termal) · 50 × 25 mm', rulo: true, ew: 50, eh: 25 },
  { id: 'r-58x40', ad: 'Rulo (termal) · 58 × 40 mm', rulo: true, ew: 58, eh: 40 },
  { id: 'r-60x40', ad: 'Rulo (termal) · 60 × 40 mm', rulo: true, ew: 60, eh: 40 },
  { id: 'r-100x50', ad: 'Rulo (termal) · 100 × 50 mm', rulo: true, ew: 100, eh: 50 },
  { id: 'r-100x100', ad: 'Rulo (termal) · 100 × 100 mm', rulo: true, ew: 100, eh: 100 },
  { id: 'r-100x150', ad: 'Rulo (termal) · 100 × 150 mm (kargo)', rulo: true, ew: 100, eh: 150 },
  { id: 'ozel', ad: 'Özel ölçü…', ozel: true }
];
// Sayfa yerleşimi: her etiketin sayfadaki konumu
function sayfaPlani(k) {
  if (k.rulo) return { sw: k.ew, sh: k.eh, hucreler: [{ x: 0, y: 0 }], adet: 1 };
  const sw = k.sw || 210, sh = k.sh || 297, h = [];
  for (let r = 0; r < k.satir; r++) for (let c = 0; c < k.sutun; c++) h.push({ x: k.sol + c * (k.ew + k.ay), y: k.ust + r * (k.eh + k.dy) });
  return { sw, sh, hucreler: h, adet: h.length };
}
// Basılacak etiket listesi: veri satırları × adet; ilk sayfada atlanacak hücreler
function etiketListesi(kaynak, tasarim) {
  const out = [];
  if (kaynak.tur === 'tek') for (let i = 0; i < Math.max(1, kaynak.adet || 1); i++) out.push({ ...tasarim.alanlar, ...(kaynak.veri || {}) });
  if (kaynak.tur === 'liste') (kaynak.satirlar || []).forEach(s => { const n = Math.max(0, parseInt(s.adet ?? s.Adet ?? 1, 10) || (s.adet === '0' ? 0 : 1)); for (let i = 0; i < n; i++) out.push({ ...tasarim.alanlar, ...s }); });
  if (kaynak.tur === 'sayac') {
    const S = kaynak.sayac, adet = Math.min(5000, Math.max(1, S.adet || 1));
    for (let i = 0; i < adet; i++) {
      const n = (S.baslangic || 1) + i * (S.adim || 1), say = String(n).padStart(S.hane || 0, '0');
      const deger = (S.onek || '') + say + (S.sonek || '');
      const v = { ...tasarim.alanlar, ...(kaynak.veri || {}), [S.alan || 'sayac']: deger, sayac: deger };
      for (let t = 0; t < Math.max(1, S.tekrar || 1); t++) out.push(v);
    }
  }
  return out;
}
function sayfalaraBol(etiketler, plan, atla = 0) {
  const sayfalar = []; let s = null, i = 0;
  const yer = [...Array(atla).fill(null), ...etiketler];
  for (const e of yer) { if (!s || s.length === plan.adet) { s = []; sayfalar.push(s); } s.push(e); i++; }
  return sayfalar;
}
// Sayfa SVG'si (önizleme): etiketler ve kesim/kenar çizgileri
function sayfaSvg(tasarim, plan, kagit, sayfa, o = {}) {
  const kx = (o.kaymaX || 0), ky = (o.kaymaY || 0);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f4(plan.sw)} ${f4(plan.sh)}"><rect width="${f4(plan.sw)}" height="${f4(plan.sh)}" fill="#fff"/>`;
  plan.hucreler.forEach((h, i) => {
    const v = sayfa[i];
    const ox = h.x + kx + ((kagit.ew - tasarim.w) / 2 || 0), oy = h.y + ky + ((kagit.eh - tasarim.h) / 2 || 0);
    if (o.hucre !== false) s += `<rect x="${f4(h.x)}" y="${f4(h.y)}" width="${f4(kagit.ew)}" height="${f4(kagit.eh)}" rx="1" fill="none" stroke="#c9ced6" stroke-width="0.25" stroke-dasharray="1 1"/>`;
    if (v === undefined) return;
    if (v === null) { s += `<rect x="${f4(h.x + 0.5)}" y="${f4(h.y + 0.5)}" width="${f4(kagit.ew - 1)}" height="${f4(kagit.eh - 1)}" fill="#f1f2f4"/><text x="${f4(h.x + kagit.ew / 2)}" y="${f4(h.y + kagit.eh / 2)}" font-size="3" text-anchor="middle" fill="#9aa1ab" font-family="sans-serif">atlandı</text>`; return; }
    s += `<svg x="${f4(ox)}" y="${f4(oy)}" width="${f4(tasarim.w)}" height="${f4(tasarim.h)}" viewBox="0 0 ${f4(tasarim.w)} ${f4(tasarim.h)}" overflow="hidden">${etiketSvg(tasarim, v, { zemin: false }).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>`;
  });
  return s + '</svg>';
}

/* ───── PDF ───── */
const MM_PT = 72 / 25.4;
async function pdfUret(tasarim, kagit, sayfalar, o = {}) {
  const doc = await PDFLib.PDFDocument.create();
  doc.setTitle(tasarim.ad || 'Etiketler'); doc.setCreator('Suha Barkod'); doc.setProducer('Suha Barkod');
  const plan = sayfaPlani(kagit), dpi = o.dpi || 400, k = dpi / 25.4;
  const { rgb } = PDFLib;
  const renk = h => { const n = parseInt((h || '#000').slice(1), 16); return rgb((n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255); };
  const kx = o.kaymaX || 0, ky = o.kaymaY || 0;
  const katmanOnbellek = new Map();
  for (let p = 0; p < sayfalar.length; p++) {
    o.ilerle?.(p / sayfalar.length, `Sayfa ${p + 1}/${sayfalar.length}`);
    const sayfa = doc.addPage([plan.sw * MM_PT, plan.sh * MM_PT]), H = plan.sh;
    const dik = (x, y, w, h, c) => sayfa.drawRectangle({ x: x * MM_PT, y: (H - y - h) * MM_PT, width: w * MM_PT, height: h * MM_PT, color: c });
    if (o.deneme) {   // hizalama deneme sayfası: sadece etiket kenarları
      const siyah = rgb(0, 0, 0), gri = rgb(0.55, 0.55, 0.55), cz = (x1, y1, x2, y2, c = siyah, t = 0.3) => sayfa.drawLine({ start: { x: x1 * MM_PT, y: (H - y1) * MM_PT }, end: { x: x2 * MM_PT, y: (H - y2) * MM_PT }, thickness: t, color: c });
      plan.hucreler.forEach(h => {
        const x = h.x + kx, y = h.y + ky, mx = x + kagit.ew / 2, my = y + kagit.eh / 2;
        sayfa.drawRectangle({ x: x * MM_PT, y: (H - y - kagit.eh) * MM_PT, width: kagit.ew * MM_PT, height: kagit.eh * MM_PT, borderColor: siyah, borderWidth: 0.4 });
        cz(mx - 3, my, mx + 3, my); cz(mx, my - 3, mx, my + 3);   // orta artı
        for (let i = 1; i <= 3 && i < kagit.ew / 2; i++) { cz(x + i, y, x + i, y + (i % 5 ? 1 : 2), gri, 0.25); cz(x, y + i, x + (i % 5 ? 1 : 2), y + i, gri, 0.25); }   // köşe milimetre çentikleri
      });
      if (!kagit.rulo) {   // sayfa kenarında cetvel (cm)
        for (let c = 0; c <= plan.sw; c += 5) cz(c, 0, c, c % 10 ? 2 : 4, gri, 0.3);
        for (let c = 0; c <= plan.sh; c += 5) cz(0, c, c % 10 ? 2 : 4, c, gri, 0.3);
        const font = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
        sayfa.drawText('Hizalama deneme sayfasi: kagidi isiga tut, cizgiler etiketlerin kenarina oturmali. Kayma varsa mm olarak uygulamaya yaz (saga +, asagi +).', { x: 8 * MM_PT, y: 3 * MM_PT, size: 6.5, font, color: gri });
      }
      continue;
    }
    for (let i = 0; i < plan.hucreler.length; i++) {
      const v = sayfalar[p][i]; if (!v) continue;
      const h = plan.hucreler[i], ox = h.x + kx + (kagit.ew - tasarim.w) / 2, oy = h.y + ky + (kagit.eh - tasarim.h) / 2;
      if (o.kesim) sayfa.drawRectangle({ x: (h.x + kx) * MM_PT, y: (H - h.y - ky - kagit.eh) * MM_PT, width: kagit.ew * MM_PT, height: kagit.eh * MM_PT, borderColor: rgb(0.75, 0.75, 0.75), borderWidth: 0.3, borderDashArray: [2, 2] });
      // Vektör: kutu dolguları, çubuklar, çizgiler, kutu kenarları
      for (const e of tasarim.ogeler) {
        if (e.tip === 'kutu') {
          const t = e.kalinlik ?? 0.3, c = renk(e.renk);
          if (e.dolgu) dik(ox + e.x, oy + e.y, e.w, e.h, renk(e.dolgu));
          if (t) { dik(ox + e.x, oy + e.y, e.w, t, c); dik(ox + e.x, oy + e.y + e.h - t, e.w, t, c); dik(ox + e.x, oy + e.y, t, e.h, c); dik(ox + e.x + e.w - t, oy + e.y, t, e.h, c); }
        }
        if (e.tip === 'cizgi') sayfa.drawLine({ start: { x: (ox + e.x) * MM_PT, y: (H - oy - e.y) * MM_PT }, end: { x: (ox + e.x + e.w) * MM_PT, y: (H - oy - e.y - e.h) * MM_PT }, thickness: (e.kalinlik || 0.3) * MM_PT, color: renk(e.renk) });
        if (e.tip === 'barkod') {
          const b = barkodYerlesim(e, v); if (b.hata) continue;
          const c = renk(e.renk);
          for (const r of b.lay.cubuklar) dik(ox + b.dx + r.x, oy + b.dy + r.y, r.w, r.h, c);
        }
      }
      // Yazı ve resim katmanı (saydam PNG)
      const anahtar = JSON.stringify(v);
      let png = katmanOnbellek.get(anahtar);
      if (png === undefined) {
        const c = document.createElement('canvas'); c.width = Math.ceil(tasarim.w * k); c.height = Math.ceil(tasarim.h * k);
        const g = c.getContext('2d'); let bos = true;
        for (const e of tasarim.ogeler) {
          if (e.tip === 'yazi') { const m = doldur(e.metin, v); if (!m) continue; const y = yaziYerlesim(e, m); g.fillStyle = y.renk; g.font = y.font(y.boy * k); g.textAlign = y.hiza === 'orta' ? 'center' : y.hiza === 'sag' ? 'right' : 'left'; g.textBaseline = 'alphabetic'; y.satirlar.forEach(s => g.fillText(s.s, s.x * k, s.y * k)); bos = false; }
          if (e.tip === 'barkod') { const b = barkodYerlesim(e, v); if (b.hata) continue; g.fillStyle = e.renk || '#000'; for (const y of b.lay.yazilar) { g.font = `${y.boy * k}px "Helvetica Neue", Arial, sans-serif`; g.textAlign = 'center'; if (y.aralik && y.metin.length > 1) { const adim = y.aralik * 0.92 / y.metin.length, bas = y.x - y.aralik * 0.92 / 2 + adim / 2; [...y.metin].forEach((ch, j) => g.fillText(ch, (b.dx + bas + j * adim) * k, (b.dy + y.y) * k)); } else g.fillText(y.metin, (b.dx + y.x) * k, (b.dy + y.y) * k); bos = false; } }
          if (e.tip === 'resim' && e.src) { try { const im = await resimAl(e.src), oran = Math.min(e.w / im.width, e.h / im.height), w = im.width * oran, h = im.height * oran; g.drawImage(im, (e.x + (e.w - w) / 2) * k, (e.y + (e.h - h) / 2) * k, w * k, h * k); bos = false; } catch {} }
        }
        png = bos ? null : await doc.embedPng(await new Promise(r => c.toBlob(b => b.arrayBuffer().then(r), 'image/png')));
        if (katmanOnbellek.size < 400) katmanOnbellek.set(anahtar, png);
      }
      if (png) sayfa.drawImage(png, { x: ox * MM_PT, y: (H - oy - tasarim.h) * MM_PT, width: tasarim.w * MM_PT, height: tasarim.h * MM_PT });
    }
  }
  o.ilerle?.(1, 'PDF hazırlanıyor');
  return new Blob([await doc.save()], { type: 'application/pdf' });
}
const resimler = new Map();
function resimAl(src) { if (!resimler.has(src)) resimler.set(src, new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; })); return resimler.get(src); }

/* ───── Hazır etiket şablonları ───── */
const SABLONLAR = [
  { id: 'bos', ad: 'Boş etiket', aciklama: 'Kendi ölçünle sıfırdan', w: 50, h: 30, ogeler: [], alanlar: {} },
  { id: 'urun', ad: 'Ürün / fiyat etiketi', aciklama: 'Ürün adı, fiyat ve barkod', w: 40, h: 30, alanlar: { ad: 'Örnek ürün 500 g', fiyat: '89,90', barkod: '869050400001' },
    ogeler: [{ tip: 'yazi', x: 1.5, y: 1.2, w: 37, h: 7, metin: '{{ad}}', boy: 8, kalin: true, hiza: 'orta' }, { tip: 'yazi', x: 1.5, y: 7.8, w: 37, h: 7, metin: '{{fiyat}} ₺', boy: 16, kalin: true, hiza: 'orta' }, { tip: 'barkod', x: 3, y: 15.5, w: 34, h: 13.5, tur: 'ean13', veri: '{{barkod}}' }] },
  { id: 'raf', ad: 'Raf etiketi (yönetmeliğe uygun)', aciklama: 'Satış fiyatı, birim fiyat, üretim yeri, barkod, tarih', w: 70, h: 37, alanlar: { ad: 'Süzme yoğurt', miktar: '1 kg', fiyat: '129,90', birimFiyat: '129,90 ₺/kg', uretimYeri: 'Türkiye', barkod: '869050400001' },
    ogeler: [{ tip: 'yazi', x: 2, y: 1.5, w: 66, h: 6.5, metin: '{{ad}} {{miktar}}', boy: 11, kalin: true, hiza: 'sol' }, { tip: 'yazi', x: 2, y: 8, w: 36, h: 13, metin: '{{fiyat}} ₺', boy: 30, kalin: true, hiza: 'sol' },
      { tip: 'yazi', x: 2, y: 21.5, w: 36, h: 4.5, metin: 'Birim fiyat: {{birimFiyat}}', boy: 7, hiza: 'sol' }, { tip: 'yazi', x: 2, y: 26, w: 36, h: 4.5, metin: 'Üretim yeri: {{uretimYeri}}', boy: 7, hiza: 'sol' },
      { tip: 'yazi', x: 2, y: 30.8, w: 36, h: 4.5, metin: 'Etiket tarihi: {{tarih}}', boy: 6, renk: '#444', hiza: 'sol' }, { tip: 'cizgi', x: 38.5, y: 8, w: 0, h: 27, kalinlik: 0.2, renk: '#999' }, { tip: 'barkod', x: 39.5, y: 9, w: 30, h: 26, tur: 'ean13', veri: '{{barkod}}' }] },
  { id: 'kargo', ad: 'Kargo etiketi', aciklama: 'Gönderen, alıcı, adres, takip numarası (100 × 150 mm)', w: 100, h: 150, alanlar: { gonderen: 'Suha Mağaza\nİstanbul', alici: 'Ayşe Yılmaz', adres: 'Örnek Mah. Deneme Sok. No: 1 D: 2\nKadıköy / İstanbul', telefon: '0532 000 00 00', takip: 'TR123456789', siparis: 'S-2026-0042' },
    ogeler: [{ tip: 'kutu', x: 0.5, y: 0.5, w: 99, h: 149, kalinlik: 0.5 }, { tip: 'yazi', x: 4, y: 4, w: 92, h: 5, metin: 'GÖNDEREN', boy: 8, kalin: true }, { tip: 'yazi', x: 4, y: 9, w: 92, h: 12, metin: '{{gonderen}}', boy: 10, dikey: 'ust' },
      { tip: 'cizgi', x: 0.5, y: 24, w: 99, h: 0, kalinlik: 0.5 }, { tip: 'yazi', x: 4, y: 27, w: 92, h: 5, metin: 'ALICI', boy: 8, kalin: true }, { tip: 'yazi', x: 4, y: 33, w: 92, h: 9, metin: '{{alici}}', boy: 18, kalin: true },
      { tip: 'yazi', x: 4, y: 43, w: 92, h: 18, metin: '{{adres}}', boy: 12, dikey: 'ust' }, { tip: 'yazi', x: 4, y: 62, w: 92, h: 7, metin: 'Tel: {{telefon}}', boy: 11 },
      { tip: 'cizgi', x: 0.5, y: 73, w: 99, h: 0, kalinlik: 0.5 }, { tip: 'yazi', x: 4, y: 76, w: 92, h: 5, metin: 'Sipariş: {{siparis}}', boy: 9 }, { tip: 'barkod', x: 6, y: 86, w: 88, h: 34, tur: 'code128', veri: '{{takip}}' }, { tip: 'yazi', x: 4, y: 128, w: 92, h: 10, metin: 'Kırılacak eşya varsa dikkatli taşıyınız', boy: 9, hiza: 'orta', italik: true }] },
  { id: 'demirbas', ad: 'Demirbaş etiketi', aciklama: 'Kurum adı ve sıra numaralı barkod', w: 50, h: 25, alanlar: { kurum: 'SUHA', demirbas: 'DMR-0001' },
    ogeler: [{ tip: 'kutu', x: 0.6, y: 0.6, w: 48.8, h: 23.8, kalinlik: 0.4, kose: 1.5 }, { tip: 'yazi', x: 2.5, y: 1.8, w: 45, h: 4.5, metin: '{{kurum}} · DEMİRBAŞ', boy: 7, kalin: true, hiza: 'orta' }, { tip: 'barkod', x: 2.5, y: 7, w: 45, h: 16, tur: 'code128', veri: '{{demirbas}}' }] },
  { id: 'kitap', ad: 'Kitap etiketi', aciklama: 'ISBN barkodu ve fiyat', w: 50, h: 32, alanlar: { isbn: '9780306406157', fiyat: '250,00' },
    ogeler: [{ tip: 'barkod', x: 2, y: 1.5, w: 46, h: 24, tur: 'isbn', veri: '{{isbn}}' }, { tip: 'yazi', x: 2, y: 26, w: 46, h: 5, metin: 'Fiyatı: {{fiyat}} ₺', boy: 8, kalin: true, hiza: 'orta' }] },
  { id: 'koli', ad: 'Koli etiketi', aciklama: 'ITF-14 koli barkodu, ürün ve adet (100 × 70 mm)', w: 100, h: 70, alanlar: { urun: 'Süzme yoğurt 1 kg', adet: '12', parti: 'P2026A', itf: '1869050400001' },
    ogeler: [{ tip: 'yazi', x: 4, y: 3, w: 92, h: 9, metin: '{{urun}}', boy: 16, kalin: true }, { tip: 'yazi', x: 4, y: 12, w: 45, h: 7, metin: 'Koli içi: {{adet}} adet', boy: 11 }, { tip: 'yazi', x: 50, y: 12, w: 46, h: 7, metin: 'Parti: {{parti}}', boy: 11, hiza: 'sag' }, { tip: 'barkod', x: 4, y: 23, w: 92, h: 43, tur: 'itf14', veri: '{{itf}}' }] },
  { id: 'gs1', ad: 'İlaç / ürün karekodu', aciklama: 'GS1 Data Matrix: GTIN, son kullanma, parti, seri', w: 40, h: 25, alanlar: { gtin: '08690504000013', skt: '271231', parti: '21A45B', seri: 'X9K2M7' },
    ogeler: [{ tip: 'barkod', x: 1.5, y: 2, w: 18, h: 18, tur: 'datamatrix', veri: '(01){{gtin}}(17){{skt}}(10){{parti}}(21){{seri}}' }, { tip: 'yazi', x: 21, y: 2, w: 18, h: 20, metin: 'GTIN {{gtin}}\nSKT {{skt}}\nLOT {{parti}}\nSN {{seri}}', boy: 6, font: 'mono', dikey: 'ust' }] }
];
