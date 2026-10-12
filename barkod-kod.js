/* ───────────── Barkod: kodlayıcılar ─────────────
   EAN-13/8, UPC-A/E, ISBN, ISSN, Code 128 (GS1-128 dahil), Code 39, ITF / ITF-14, Codabar, Data Matrix (ECC200), QR.
   Her kodlayıcı bir "model" döndürür: 1B kodlarda modül dizisi (1 = koyu) ve okunur yazının yerleşimi,
   2B kodlarda modül matrisi. Çizim (SVG, tuval, PDF) bu modelden yapılır; böylece üçü birebir aynı çıkar. */
'use strict';

/* ───── Kontrol haneleri ───── */
function mod10(govde) {   // GS1 (EAN, UPC, ITF-14, GTIN): sağdan itibaren 3,1,3,1… ağırlık
  let t = 0; const d = String(govde);
  for (let i = 0; i < d.length; i++) t += +d[d.length - 1 - i] * (i % 2 ? 1 : 3);
  return (10 - t % 10) % 10;
}
const sadeceRakam = s => /^\d+$/.test(s);

/* ───── EAN / UPC ───── */
const EAN_L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
const EAN_G = EAN_L.map(p => [...p].map(c => c === '0' ? '1' : '0').reverse().join(''));
const EAN_R = EAN_L.map(p => [...p].map(c => c === '0' ? '1' : '0').join(''));
const EAN_ILK = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'];
// Tam numarayı hazırla: kontrol hanesi yoksa ekle, varsa doğrula
function gtinHazirla(v, uzunluk) {
  v = String(v).replace(/[\s-]/g, '');
  if (!sadeceRakam(v)) return { hata: 'Sadece rakam kullanılabilir.' };
  if (v.length === uzunluk - 1) return { numara: v + mod10(v), eklendi: true };
  if (v.length !== uzunluk) return { hata: `${uzunluk} hane olmalı (son hane kontrol hanesi; ${uzunluk - 1} hane yazarsan kendim hesaplarım).` };
  const k = mod10(v.slice(0, -1));
  if (+v.slice(-1) !== k) return { hata: `Kontrol hanesi yanlış: son hane ${k} olmalı.`, oneri: v.slice(0, -1) + k };
  return { numara: v };
}
function ean13(v) {
  const g = gtinHazirla(v, 13); if (g.hata) return g;
  const d = g.numara, p = EAN_ILK[+d[0]];
  let m = '101'; for (let i = 1; i <= 6; i++) m += (p[i - 1] === 'L' ? EAN_L : EAN_G)[+d[i]];
  m += '01010'; for (let i = 7; i <= 12; i++) m += EAN_R[+d[i]]; m += '101';
  return { tur: '1b', moduller: m, numara: d, eklendi: g.eklendi, sessizSol: 11, sessizSag: 7, uzun: [[0, 3], [45, 50], [92, 95]],
    yazilar: [{ m: d[0], x: -6, hiza: 'orta' }, { m: d.slice(1, 7), x: 3, w: 42 }, { m: d.slice(7), x: 50, w: 42 }, { m: '>', x: 98, hiza: 'orta', isaret: true }] };
}
function ean8(v) {
  const g = gtinHazirla(v, 8); if (g.hata) return g;
  const d = g.numara; let m = '101';
  for (let i = 0; i < 4; i++) m += EAN_L[+d[i]]; m += '01010'; for (let i = 4; i < 8; i++) m += EAN_R[+d[i]]; m += '101';
  return { tur: '1b', moduller: m, numara: d, eklendi: g.eklendi, sessizSol: 7, sessizSag: 7, uzun: [[0, 3], [31, 36], [64, 67]],
    yazilar: [{ m: d.slice(0, 4), x: 3, w: 28 }, { m: d.slice(4), x: 36, w: 28 }] };
}
function upca(v) {
  const g = gtinHazirla(v, 12); if (g.hata) return g;
  const r = ean13('0' + g.numara); r.numara = g.numara; r.eklendi = g.eklendi; r.sessizSol = 9; r.sessizSag = 9;
  // UPC-A: ilk ve son rakamın çubukları uzun, rakamları dışarıda küçük
  r.uzun = [[0, 10], [45, 50], [85, 95]];
  r.yazilar = [{ m: g.numara[0], x: -5, hiza: 'orta', kucuk: true }, { m: g.numara.slice(1, 6), x: 10, w: 35 }, { m: g.numara.slice(6, 11), x: 50, w: 35 }, { m: g.numara[11], x: 100, hiza: 'orta', kucuk: true }];
  return r;
}
// UPC-E: 6 veri hanesi; sayı sistemi 0 ya da 1. Kontrol hanesi genişletilmiş UPC-A'dan hesaplanır.
const UPCE_ESLIK = ['EEEOOO', 'EEOEOO', 'EEOOEO', 'EEOOOE', 'EOEEOO', 'EOOEEO', 'EOOOEE', 'EOEOEO', 'EOEOOE', 'EOOEOE'];
function upceGenislet(s) {   // s: sayı sistemi + 6 hane
  const ns = s[0], d = s.slice(1), son = d[5];
  let govde;
  if ('012'.includes(son)) govde = d.slice(0, 2) + son + '0000' + d.slice(2, 5);
  else if (son === '3') govde = d.slice(0, 3) + '00000' + d.slice(3, 5);
  else if (son === '4') govde = d.slice(0, 4) + '00000' + d[4];
  else govde = d.slice(0, 5) + '0000' + son;
  return ns + govde;
}
function upce(v) {
  v = String(v).replace(/[\s-]/g, '');
  if (!sadeceRakam(v)) return { hata: 'Sadece rakam kullanılabilir.' };
  if (v.length === 6) v = '0' + v;
  if (v.length !== 7 && v.length !== 8) return { hata: 'UPC-E 6, 7 ya da 8 hanedir (sayı sistemi + 6 hane + kontrol).' };
  if (!'01'.includes(v[0])) return { hata: 'UPC-E sayı sistemi 0 ya da 1 olmalı.' };
  const k = mod10(upceGenislet(v.slice(0, 7))), eklendi = v.length === 7;
  if (!eklendi && +v[7] !== k) return { hata: `Kontrol hanesi yanlış: son hane ${k} olmalı.`, oneri: v.slice(0, 7) + k };
  const d = v.slice(0, 7) + k, es = UPCE_ESLIK[k];
  let m = '101';
  for (let i = 0; i < 6; i++) { const eslik = d[0] === '0' ? es[i] : (es[i] === 'E' ? 'O' : 'E'); m += (eslik === 'O' ? EAN_L : EAN_G)[+d[i + 1]]; }
  m += '010101';
  return { tur: '1b', moduller: m, numara: d, eklendi, sessizSol: 9, sessizSag: 7, uzun: [[0, 3], [45, 51]],
    yazilar: [{ m: d[0], x: -5, hiza: 'orta', kucuk: true }, { m: d.slice(1, 7), x: 3, w: 42 }, { m: d[7], x: 56, hiza: 'orta', kucuk: true }] };
}
function isbn(v) {
  let s = String(v).replace(/[\s-]/g, '').toUpperCase();
  if (/^\d{9}[\dX]$/.test(s)) {   // ISBN-10 → 978 ile EAN-13
    let t = 0; for (let i = 0; i < 9; i++) t += +s[i] * (10 - i);
    const k = (11 - t % 11) % 11;
    if ((k === 10 ? 'X' : String(k)) !== s[9]) return { hata: 'ISBN-10 kontrol hanesi yanlış.' };
    s = '978' + s.slice(0, 9);
  }
  if (!/^97[89]\d{9,10}$/.test(s)) return { hata: 'ISBN 978 ya da 979 ile başlayan 13 hane (ya da eski 10 haneli ISBN) olmalı.' };
  const r = ean13(s); if (r.hata) return r;
  const n = r.numara; r.ust = 'ISBN ' + n.slice(0, 3) + '-' + n.slice(3, 12) + '-' + n[12];
  return r;
}
function issn(v) {
  const s = String(v).replace(/[\s-]/g, '').toUpperCase();
  let govde;
  if (/^\d{7}[\dX]$/.test(s)) {
    let t = 0; for (let i = 0; i < 7; i++) t += +s[i] * (8 - i);
    const k = (11 - t % 11) % 11;
    const kk = k === 10 ? 'X' : String(k); if (kk !== s[7]) return { hata: `ISSN kontrol hanesi yanlış: son karakter ${kk} olmalı.`, oneri: s.slice(0, 4) + '-' + s.slice(4, 7) + kk };
    govde = '977' + s.slice(0, 7) + '00';
  } else if (/^977\d{9,10}$/.test(s)) govde = s.slice(0, 12);
  else return { hata: 'ISSN 8 hanedir (ör. 1234-5679) ya da 977 ile başlayan 13 hane.' };
  const r = ean13(govde); if (r.hata) return r;
  const i7 = r.numara.slice(3, 10); let t = 0; for (let i = 0; i < 7; i++) t += +i7[i] * (8 - i); const k = (11 - t % 11) % 11;
  r.ust = 'ISSN ' + i7.slice(0, 4) + '-' + i7.slice(4) + (k === 10 ? 'X' : k);
  return r;
}

/* ───── Code 128 (GS1-128 dahil) ───── */
const C128 = '212222 222122 222221 121223 121322 131222 122213 122312 132212 221213 221312 231212 112232 122132 122231 113222 123122 123221 223211 221132 221231 213212 223112 312131 311222 321122 321221 312212 322112 322211 212123 212321 232121 111323 131123 131321 112313 132113 132311 211313 231113 231311 112133 112331 132131 113123 113321 133121 313121 211331 231131 213113 213311 213131 311123 311321 331121 312113 312311 332111 314111 221411 431111 111224 111422 121124 121421 141122 141221 112214 112412 122114 122411 142112 142211 241211 221114 413111 241112 134111 111242 121142 121241 114212 124112 124211 411212 421112 421211 212141 214121 412121 111143 111341 131141 114113 114311 411113 411311 113141 114131 311141 411131 211412 211214 211232'.split(' '), C128_DUR = '2331112';
const C_A = 101, C_B = 100, C_C = 99, FNC1 = 102, BAS = { A: 103, B: 104, C: 105 };
function c128Degerler(metin, gs1) {
  // metin: karakter dizisi; gs1 modunda '\x1d' FNC1 (alan ayırıcı) yerine geçer
  const ch = [...metin], kod = []; let kume = null, i = 0;
  const rakamSay = j => { let n = 0; while (j + n < ch.length && /\d/.test(ch[j + n])) n++; return n; };
  const kumeSec = k => { if (kume === null) { kod.push(BAS[k]); if (gs1) kod.push(FNC1); } else kod.push(k === 'A' ? C_A : k === 'B' ? C_B : C_C); kume = k; };
  const karakter = c => {
    const n = c.charCodeAt(0);
    if (n > 127) throw new Error('Code 128 Türkçe ya da özel harf içeremez (' + c + ').');
    const gerek = n < 32 ? 'A' : n >= 96 ? 'B' : (kume === 'A' ? 'A' : 'B');
    if (kume !== gerek) kumeSec(gerek);
    kod.push(gerek === 'A' ? (n < 32 ? n + 64 : n - 32) : n - 32);
  };
  while (i < ch.length) {
    const c = ch[i];
    if (gs1 && c === '\x1d') { if (kume === null) kumeSec('C'); kod.push(FNC1); i++; continue; }
    const r = rakamSay(i);
    const cKullan = r >= 4 || (kume === 'C' && r >= 2) || (kume === null && r >= 2 && r % 2 === 0 && i + r === ch.length);
    if (cKullan) {
      if (r % 2 && kume !== 'C') { karakter(c); i++; continue; }   // tek sayıda rakam: ilki önceki kümede
      if (kume !== 'C') kumeSec('C');
      for (let k = 0; k < r - (r % 2); k += 2) { kod.push(+ch[i] * 10 + +ch[i + 1]); i += 2; }
      continue;
    }
    karakter(c); i++;
  }
  if (kume === null) kumeSec('B');
  let t = kod[0]; for (let k = 1; k < kod.length; k++) t += kod[k] * k;
  kod.push(t % 103);
  return kod;
}
function genisliktenModul(gen) { let m = '', koyu = true; for (const w of gen) { m += (koyu ? '1' : '0').repeat(+w); koyu = !koyu; } return m; }
function code128(v, o = {}) {
  let metin = String(v), gs1 = false, okunur = metin;
  if (o.gs1 || /^\(\d{2,4}\)/.test(metin)) {   // GS1-128: (01)08690504000013(17)271231(10)ABC
    const p = gs1Ayristir(metin); if (p.hata) return p;
    metin = p.ham; okunur = p.okunur; gs1 = true;
  }
  if (!metin) return { hata: 'Boş olamaz.' };
  if (metin.length > 80) return { hata: 'Code 128 için çok uzun (en fazla 80 karakter önerilir).' };
  let kod; try { kod = c128Degerler(metin, gs1); } catch (e) { return { hata: e.message, oneri: harfDuzelt(String(v)) }; }
  const m = kod.map(k => genisliktenModul(C128[k])).join('') + genisliktenModul(C128_DUR);
  return { tur: '1b', moduller: m, numara: okunur, sessizSol: 10, sessizSag: 10, yazilar: [{ m: okunur, x: 0, w: m.length }], gs1 };
}
const TR_HARF = { 'ş': 's', 'Ş': 'S', 'ğ': 'g', 'Ğ': 'G', 'ı': 'i', 'İ': 'I', 'ü': 'u', 'Ü': 'U', 'ö': 'o', 'Ö': 'O', 'ç': 'c', 'Ç': 'C' };
const harfDuzelt = s => String(s).replace(/[şŞğĞıİüÜöÖçÇ]/g, c => TR_HARF[c]).replace(/[^\x20-\x7e]/g, '');
// GS1 uygulama tanımlayıcıları: sabit uzunluklu olanlar (sonrasında FNC1 gerekmez)
const GS1_SABIT = { '00': 18, '01': 14, '02': 14, '03': 14, '04': 16, '11': 6, '12': 6, '13': 6, '14': 6, '15': 6, '16': 6, '17': 6, '18': 6, '19': 6, '20': 2, '31': 10, '32': 10, '33': 10, '34': 10, '35': 10, '36': 10, '41': 16 };
const GS1_AD = { '00': 'SSCC (koli no)', '01': 'GTIN', '02': 'İçerik GTIN', '10': 'Parti / lot', '11': 'Üretim tarihi', '13': 'Paketleme tarihi', '15': 'Tavsiye edilen son tüketim', '17': 'Son kullanma tarihi', '21': 'Seri no', '30': 'Adet', '37': 'Adet', '400': 'Sipariş no', '410': 'Teslim yeri GLN', '3103': 'Net ağırlık (kg)' };
function gs1Ayristir(s) {
  const parcalar = [...String(s).matchAll(/\((\d{2,4})\)([^(]*)/g)];
  if (!parcalar.length) return { hata: 'GS1 biçimi: (01)08690504000013(17)271231 gibi parantezli tanımlayıcılar yaz.' };
  let ham = '', okunur = '';
  for (let i = 0; i < parcalar.length; i++) {
    const [, ai, deger] = parcalar[i], sabit = GS1_SABIT[ai.slice(0, 2)];
    if (!deger) return { hata: `(${ai}) boş olamaz.` };
    if ((ai === '01' || ai === '02') && deger.length === 13 && sadeceRakam(deger)) parcalar[i][2] = deger + mod10(deger);
    const d = parcalar[i][2];
    if ((ai === '01' || ai === '02') && (d.length !== 14 || +d[13] !== mod10(d.slice(0, 13)))) return { hata: `(${ai}) GTIN 14 hane ve doğru kontrol haneli olmalı.` };
    if (/^1[1-7]$/.test(ai) && !/^\d{6}$/.test(d)) return { hata: `(${ai}) tarih YYAAGG biçiminde 6 hane olmalı (ör. 271231).` };
    if (sabit && d.length !== sabit - (ai.length - 2)) return { hata: `(${ai}) ${sabit} hane olmalı.` };
    ham += ai + d; okunur += '(' + ai + ')' + d;
    if (!sabit && i < parcalar.length - 1) ham += '\x1d';
  }
  return { ham, okunur, parcalar: parcalar.map(p => ({ ai: p[1], ad: GS1_AD[p[1]] || '', deger: p[2] })) };
}

/* ───── Code 39 ───── */
const C39_ALFABE = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%';
const C39_KOD = [0x034, 0x121, 0x061, 0x160, 0x031, 0x130, 0x070, 0x025, 0x124, 0x064, 0x109, 0x049, 0x148, 0x019, 0x118, 0x058, 0x00D, 0x10C, 0x04C, 0x01C,
  0x103, 0x043, 0x142, 0x013, 0x112, 0x052, 0x007, 0x106, 0x046, 0x016, 0x181, 0x0C1, 0x1C0, 0x091, 0x190, 0x0D0, 0x085, 0x184, 0x0C4, 0x0A8, 0x0A2, 0x08A, 0x02A];
function code39(v, o = {}) {
  let s = harfDuzelt(String(v)).toUpperCase();
  const kotu = [...s].filter(c => !C39_ALFABE.includes(c));
  if (!s) return { hata: 'Boş olamaz.' };
  if (kotu.length) return { hata: 'Code 39 sadece büyük harf, rakam ve - . boşluk $ / + % içerebilir.', oneri: s.replace(/[^0-9A-Z\-. $\/+%]/g, '') };
  if (o.kontrol) { let t = 0; for (const c of s) t += C39_ALFABE.indexOf(c); s += C39_ALFABE[t % 43]; }
  const k = c => { const e = c === '*' ? 0x094 : C39_KOD[C39_ALFABE.indexOf(c)]; let m = ''; for (let i = 8; i >= 0; i--) m += ((i % 2 === 0) ? '1' : '0').repeat((e >> i) & 1 ? 3 : 1); return m; };
  const m = ['*', ...s, '*'].map(k).join('0');
  return { tur: '1b', moduller: m, numara: s, sessizSol: 10, sessizSag: 10, yazilar: [{ m: '*' + s + '*', x: 0, w: m.length }] };
}

/* ───── ITF (2/5 serpiştirilmiş) ve ITF-14 ───── */
const ITF_D = ['nnwwn', 'wnnnw', 'nwnnw', 'wwnnn', 'nnwnw', 'wnwnn', 'nwwnn', 'nnnww', 'wnnwn', 'nwnwn'];
function itf(v, o = {}) {
  let d = String(v).replace(/[\s-]/g, '');
  if (!sadeceRakam(d)) return { hata: 'Sadece rakam kullanılabilir.' };
  if (o.itf14) { const g = gtinHazirla(d, 14); if (g.hata) return g; d = g.numara; }
  else if (d.length % 2) d = '0' + d;
  const W = 3; let m = '1010';
  for (let i = 0; i < d.length; i += 2) {
    const a = ITF_D[+d[i]], b = ITF_D[+d[i + 1]];
    for (let k = 0; k < 5; k++) m += '1'.repeat(a[k] === 'w' ? W : 1) + '0'.repeat(b[k] === 'w' ? W : 1);
  }
  m += '1'.repeat(W) + '01';
  return { tur: '1b', moduller: m, numara: d, sessizSol: 10, sessizSag: 10, cerceve: !!o.itf14, yazilar: [{ m: o.itf14 ? d[0] + ' ' + d.slice(1, 3) + ' ' + d.slice(3, 8) + ' ' + d.slice(8, 13) + ' ' + d[13] : d, x: 0, w: m.length }] };
}

/* ───── Codabar ───── */
const CB_ALFABE = '0123456789-$:/.+ABCD';
const CB_KOD = [0x003, 0x006, 0x009, 0x060, 0x012, 0x042, 0x021, 0x024, 0x030, 0x048, 0x00c, 0x018, 0x045, 0x051, 0x054, 0x015, 0x01A, 0x029, 0x00B, 0x00E];
function codabar(v) {
  let s = String(v).toUpperCase().replace(/\s/g, '');
  if (!/^[ABCD]/.test(s)) s = 'A' + s; if (!/[ABCD]$/.test(s) || s.length === 1) s += 'B';
  if (!/^[ABCD][0-9\-$:\/.+]+[ABCD]$/.test(s)) return { hata: 'Codabar rakam ve - $ : / . + içerebilir; başta ve sonda A-D harfi olur.' };
  const m = [...s].map(c => { const e = CB_KOD[CB_ALFABE.indexOf(c)]; let r = ''; for (let i = 6; i >= 0; i--) r += ((6 - i) % 2 === 0 ? '1' : '0').repeat((e >> i) & 1 ? 3 : 1); return r; }).join('0');
  return { tur: '1b', moduller: m, numara: s, sessizSol: 10, sessizSag: 10, yazilar: [{ m: s, x: 0, w: m.length }] };
}

/* ───── Data Matrix (ECC200) ───── */
// [boyut, bölge kenarı, bölge sayısı (bir kenarda), veri kodsözcüğü, düzeltme kodsözcüğü, blok]
const DM_BOY = [[10, 8, 1, 3, 5, 1], [12, 10, 1, 5, 7, 1], [14, 12, 1, 8, 10, 1], [16, 14, 1, 12, 12, 1], [18, 16, 1, 18, 14, 1], [20, 18, 1, 22, 18, 1], [22, 20, 1, 30, 20, 1], [24, 22, 1, 36, 24, 1], [26, 24, 1, 44, 28, 1],
  [32, 14, 2, 62, 36, 1], [36, 16, 2, 86, 42, 1], [40, 18, 2, 114, 48, 1], [44, 20, 2, 144, 56, 1], [48, 22, 2, 174, 68, 1], [52, 24, 2, 204, 84, 2],
  [64, 14, 4, 280, 112, 2], [72, 16, 4, 368, 144, 4], [80, 18, 4, 456, 192, 4], [88, 20, 4, 576, 224, 4], [96, 22, 4, 696, 272, 4], [104, 24, 4, 816, 336, 6]];
const GF = (() => { const ust = new Array(512), log = new Array(256); let x = 1; for (let i = 0; i < 255; i++) { ust[i] = x; log[x] = i; x <<= 1; if (x & 256) x ^= 0x12D; } for (let i = 255; i < 512; i++) ust[i] = ust[i - 255]; return { ust, log, carp: (a, b) => a && b ? ust[log[a] + log[b]] : 0 }; })();
function rsDuzeltme(veri, n) {
  let g = [1];
  for (let i = 1; i <= n; i++) { const yeni = new Array(g.length + 1).fill(0); for (let j = 0; j < g.length; j++) { yeni[j] ^= g[j]; yeni[j + 1] ^= GF.carp(g[j], GF.ust[i]); } g = yeni; }
  const ecc = new Array(n).fill(0);
  for (const d of veri) { const f = d ^ ecc[0]; ecc.shift(); ecc.push(0); for (let i = 0; i < n; i++) ecc[i] ^= GF.carp(g[i + 1], f); }
  return ecc;
}
function dmKodla(metin, gs1) {
  const out = [];
  let bayt = [...new TextEncoder().encode(metin)];
  const latin1 = [...metin].every(c => c.charCodeAt(0) < 256);
  if (latin1) bayt = [...metin].map(c => c.charCodeAt(0));
  else out.push(241, 27);   // ECI 26: UTF-8
  if (gs1) out.push(232);
  for (let i = 0; i < bayt.length; i++) {
    const c = bayt[i];
    if (gs1 && c === 29) { out.push(232); continue; }
    if (c >= 48 && c <= 57 && i + 1 < bayt.length && bayt[i + 1] >= 48 && bayt[i + 1] <= 57) { out.push(130 + (c - 48) * 10 + (bayt[i + 1] - 48)); i++; }
    else if (c < 128) out.push(c + 1);
    else out.push(235, c - 127);
  }
  return out;
}
function dmYerlesim(nr, nc, kod) {
  const b = Array.from({ length: nr }, () => new Array(nc).fill(-1));
  const mod = (r, c, ch, bit) => { if (r < 0) { r += nr; c += 4 - ((nr + 4) % 8); } if (c < 0) { c += nc; r += 4 - ((nc + 4) % 8); } b[r][c] = (kod[ch] >> (8 - bit)) & 1; };
  const utah = (r, c, ch) => { mod(r - 2, c - 2, ch, 1); mod(r - 2, c - 1, ch, 2); mod(r - 1, c - 2, ch, 3); mod(r - 1, c - 1, ch, 4); mod(r - 1, c, ch, 5); mod(r, c - 2, ch, 6); mod(r, c - 1, ch, 7); mod(r, c, ch, 8); };
  const k1 = ch => { mod(nr - 1, 0, ch, 1); mod(nr - 1, 1, ch, 2); mod(nr - 1, 2, ch, 3); mod(0, nc - 2, ch, 4); mod(0, nc - 1, ch, 5); mod(1, nc - 1, ch, 6); mod(2, nc - 1, ch, 7); mod(3, nc - 1, ch, 8); };
  const k2 = ch => { mod(nr - 3, 0, ch, 1); mod(nr - 2, 0, ch, 2); mod(nr - 1, 0, ch, 3); mod(0, nc - 4, ch, 4); mod(0, nc - 3, ch, 5); mod(0, nc - 2, ch, 6); mod(0, nc - 1, ch, 7); mod(1, nc - 1, ch, 8); };
  const k3 = ch => { mod(nr - 3, 0, ch, 1); mod(nr - 2, 0, ch, 2); mod(nr - 1, 0, ch, 3); mod(0, nc - 2, ch, 4); mod(0, nc - 1, ch, 5); mod(1, nc - 1, ch, 6); mod(2, nc - 1, ch, 7); mod(3, nc - 1, ch, 8); };
  const k4 = ch => { mod(nr - 1, 0, ch, 1); mod(nr - 1, nc - 1, ch, 2); mod(0, nc - 3, ch, 3); mod(0, nc - 2, ch, 4); mod(0, nc - 1, ch, 5); mod(1, nc - 3, ch, 6); mod(1, nc - 2, ch, 7); mod(1, nc - 1, ch, 8); };
  let ch = 0, r = 4, c = 0;
  do {
    if (r === nr && c === 0) k1(ch++);
    if (r === nr - 2 && c === 0 && nc % 4) k2(ch++);
    if (r === nr - 2 && c === 0 && nc % 8 === 4) k3(ch++);
    if (r === nr + 4 && c === 2 && !(nc % 8)) k4(ch++);
    do { if (r < nr && c >= 0 && b[r][c] < 0) utah(r, c, ch++); r -= 2; c += 2; } while (r >= 0 && c < nc);
    r += 1; c += 3;
    do { if (r >= 0 && c < nc && b[r][c] < 0) utah(r, c, ch++); r += 2; c -= 2; } while (r < nr && c >= 0);
    r += 3; c += 1;
  } while (r < nr || c < nc);
  if (b[nr - 1][nc - 1] < 0) { b[nr - 1][nc - 1] = b[nr - 2][nc - 2] = 1; b[nr - 1][nc - 2] = b[nr - 2][nc - 1] = 0; }
  return b;
}
function datamatrix(v, o = {}) {
  let metin = String(v), gs1 = false;
  if (o.gs1 || /^\(\d{2,4}\)/.test(metin)) { const p = gs1Ayristir(metin); if (p.hata) return p; metin = p.ham; gs1 = true; }
  if (!metin) return { hata: 'Boş olamaz.' };
  const kod = dmKodla(metin, gs1), boy = DM_BOY.find(x => x[3] >= kod.length);
  if (!boy) return { hata: 'Data Matrix için çok uzun.' };
  const [S, rr, k, nveri, necc, blok] = boy;
  const veri = kod.slice();
  if (veri.length < nveri) veri.push(129);
  while (veri.length < nveri) { const p = veri.length + 1, rnd = ((149 * p) % 253) + 1; let t = 129 + rnd; if (t > 254) t -= 254; veri.push(t); }
  // Bloklara böl, her bloğa düzeltme ekle, iç içe geçir
  const tum = new Array(nveri + necc);
  for (let bl = 0; bl < blok; bl++) {
    const parca = veri.filter((_, i) => i % blok === bl), ecc = rsDuzeltme(parca, necc / blok);
    parca.forEach((d, i) => tum[i * blok + bl] = d);
    ecc.forEach((e, i) => tum[nveri + i * blok + bl] = e);
  }
  const bitler = dmYerlesim(rr * k, rr * k, tum);
  const M = Array.from({ length: S }, () => new Array(S).fill(0));
  for (let br = 0; br < k; br++) for (let bc = 0; bc < k; bc++) {
    const y0 = br * (rr + 2), x0 = bc * (rr + 2);
    for (let i = 0; i < rr + 2; i++) { M[y0 + rr + 1][x0 + i] = 1; M[y0 + i][x0] = 1; M[y0][x0 + i] = i % 2 === 0 ? 1 : 0; M[y0 + i][x0 + rr + 1] = i % 2 === 1 ? 1 : 0; }
    M[y0 + rr + 1][x0 + rr + 1] = 1;
    for (let r = 0; r < rr; r++) for (let c = 0; c < rr; c++) M[y0 + 1 + r][x0 + 1 + c] = bitler[br * rr + r][bc * rr + c];
  }
  return { tur: '2b', n: S, m: S, d: (x, y) => M[y][x] === 1, numara: gs1 ? gs1Ayristir(String(v)).okunur : String(v), sessiz: 1, gs1 };
}

/* ───── QR (ZXing kodlayıcısıyla) ───── */
function qr(v, o = {}) {
  if (!window.ZXing) return { hata: 'QR kodlayıcı yükleniyor…', yukle: true };
  const Z = window.ZXing, h = new Map(); h.set(Z.EncodeHintType.CHARACTER_SET, 'UTF-8');
  try {
    const q = Z.QRCodeEncoder.encode(String(v), Z.QRCodeDecoderErrorCorrectionLevel.fromString(o.hata || 'M'), h), m = q.getMatrix(), n = m.getWidth();
    return { tur: '2b', n, m: n, d: (x, y) => m.get(x, y) === 1, numara: String(v), sessiz: 4 };
  } catch (e) { return { hata: 'QR oluşturulamadı: ' + (e.message || e) }; }
}

/* ───── Türler ───── */
const TURLER = {
  ean13: { ad: 'EAN-13', aciklama: 'Market ürünleri (Türkiye ve dünya)', ornek: '869050400001', f: ean13, rakam: true },
  ean8: { ad: 'EAN-8', aciklama: 'Küçük ambalajlı ürünler', ornek: '9638507', f: ean8, rakam: true },
  upca: { ad: 'UPC-A', aciklama: 'ABD ve Kanada perakende', ornek: '03600029145', f: upca, rakam: true },
  upce: { ad: 'UPC-E', aciklama: 'ABD küçük ambalaj', ornek: '0425261', f: upce, rakam: true },
  isbn: { ad: 'ISBN', aciklama: 'Kitap', ornek: '978605123456', f: isbn },
  issn: { ad: 'ISSN', aciklama: 'Dergi, gazete', ornek: '1234-5679', f: issn },
  code128: { ad: 'Code 128', aciklama: 'Depo, stok, kargo, ürün kodu (harf + rakam)', ornek: 'STK-2026-0001', f: code128 },
  gs1128: { ad: 'GS1-128', aciklama: 'Koli, palet, lojistik (tarih, parti, seri)', ornek: '(01)08690504000013(17)271231(10)P2026A', f: (v) => code128(v, { gs1: true }) },
  code39: { ad: 'Code 39', aciklama: 'Demirbaş, kimlik kartı, eski sistemler', ornek: 'DMR-0001', f: code39 },
  itf14: { ad: 'ITF-14', aciklama: 'Koli (dış ambalaj)', ornek: '1869050400001', f: v => itf(v, { itf14: true }), rakam: true },
  itf: { ad: 'ITF', aciklama: 'Rakamlı, sanayi ve depo', ornek: '12345678', f: itf, rakam: true },
  codabar: { ad: 'Codabar', aciklama: 'Kütüphane, kan bankası, eski sistemler', ornek: 'A40156B', f: codabar },
  datamatrix: { ad: 'Data Matrix', aciklama: 'Küçük ürün, elektronik, ilaç karekodu', ornek: 'SN-000123', f: datamatrix },
  qr: { ad: 'QR kod', aciklama: 'Web adresi, menü, bilgi', ornek: 'https://projectsuha.github.io/mail/', f: qr }
};
function kodla(tur, veri, o) { const t = TURLER[tur]; if (!t) return { hata: 'Bilinmeyen tür' }; const r = t.f(veri, o || {}); if (!r.hata) r.kodTur = tur; return r; }

/* ───── Yerleşim: modelden çizim parçaları (mm cinsinden) ─────
   o: { modul (mm), yukseklik (mm), yazi (bool), yaziBoy (mm), sessiz (bool) }
   Döner: { w, h, cubuklar: [{x, y, w, h}], yazilar: [{x, y, metin, boy, hiza}] } */
function yerlesim(model, o = {}) {
  const X = o.modul || 0.33;
  if (model.tur === '2b') {
    const sz = o.sessiz === false ? 0 : model.sessiz, n = model.n, w = (n + sz * 2) * X, cub = [];
    for (let y = 0; y < n; y++) { let x = 0; while (x < n) { if (model.d(x, y)) { let e = x; while (e < n && model.d(e, y)) e++; cub.push({ x: (x + sz) * X, y: (y + sz) * X, w: (e - x) * X, h: X }); x = e; } else x++; } }
    const yazi = o.yazi && o.altMetin ? [{ x: w / 2, y: w + (o.yaziBoy || 2.2) * 1.05, metin: o.altMetin, boy: o.yaziBoy || 2.2, hiza: 'orta' }] : [];
    return { w, h: w + (yazi.length ? (o.yaziBoy || 2.2) * 1.5 : 0), cubuklar: cub, yazilar: yazi, X };
  }
  const m = model.moduller, sl = o.sessiz === false ? 0 : model.sessizSol, sr = o.sessiz === false ? 0 : model.sessizSag;
  const yb = o.yaziBoy || Math.max(1.8, X * 8.5), H = o.yukseklik || 15, yazili = o.yazi !== false;
  const uzun = model.uzun && yazili, cer = model.cerceve ? X * 3 : 0, ustB = (model.ust && yazili ? yb * 1.35 : 0) + cer;
  const altBosluk = (yazili ? (uzun ? yb * 1.0 : yb * 1.25) : 0) + cer, cubukH = H - altBosluk - ustB;
  const cub = []; let i = 0;
  const uzunMu = k => uzun && model.uzun.some(([a, b]) => k >= a && k < b);
  while (i < m.length) {
    if (m[i] === '1') { let e = i; while (e < m.length && m[e] === '1' && uzunMu(e) === uzunMu(i)) e++; cub.push({ x: (i + sl) * X, y: ustB, w: (e - i) * X, h: cubukH + (uzunMu(i) ? yb * 0.55 : 0) }); i = e; }
    else i++;
  }
  const W = (m.length + sl + sr) * X, yaz = [];
  if (yazili) {
    const ty = ustB + cubukH + cer + yb * (uzun ? 0.95 : 1.05);
    for (const y of model.yazilar) {
      if (y.isaret && !o.isaret) continue;
      if (y.w != null) yaz.push({ x: (y.x + sl + y.w / 2) * X, y: ty, metin: y.m, boy: y.kucuk ? yb * 0.75 : yb, hiza: 'orta', aralik: uzun ? y.w * X : 0 });
      else yaz.push({ x: (y.x + sl) * X, y: ty, metin: y.m, boy: y.kucuk ? yb * 0.75 : yb, hiza: 'orta' });
    }
    if (model.ust) yaz.push({ x: W / 2, y: yb * 1.05, metin: model.ust, boy: yb * 0.9, hiza: 'orta' });
  }
  const r = { w: W, h: H, cubuklar: cub, yazilar: yaz, X };
  // ITF-14 taşıyıcı çubukları (üstte ve altta): yamuk okumayı önler
  if (model.cerceve) r.cubuklar.push({ x: 0, y: ustB - cer, w: W, h: cer }, { x: 0, y: ustB + cubukH, w: W, h: cer });
  return r;
}
// Basit SVG (tek barkod indirme için)
function svgYap(lay, renk = '#000', zemin = '#fff') {
  const f = n => +n.toFixed(4);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${f(lay.w)}mm" height="${f(lay.h)}mm" viewBox="0 0 ${f(lay.w)} ${f(lay.h)}" shape-rendering="crispEdges">`
    + (zemin ? `<rect width="${f(lay.w)}" height="${f(lay.h)}" fill="${zemin}"/>` : '')
    + `<path fill="${renk}" d="${lay.cubuklar.map(c => `M${f(c.x)} ${f(c.y)}h${f(c.w)}v${f(c.h)}h${f(-c.w)}z`).join('')}"/>`
    + lay.yazilar.map(y => `<text x="${f(y.x)}" y="${f(y.y)}" font-family="'OCR-B','Helvetica Neue',Arial,sans-serif" font-size="${f(y.boy)}" text-anchor="middle" fill="${renk}"${y.aralik ? ` textLength="${f(y.aralik * 0.92)}" lengthAdjust="spacing"` : ''}>${String(y.metin).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))}</text>`).join('')
    + '</svg>';
}
// Tuvale çiz (mm → piksel ölçeği k)
function tuvaleCiz(g, lay, x0, y0, k, renk = '#000') {
  g.save(); g.fillStyle = renk;
  for (const c of lay.cubuklar) { const a = Math.round((x0 + c.x) * k), b = Math.round((x0 + c.x + c.w) * k); const u = Math.round((y0 + c.y) * k), d = Math.round((y0 + c.y + c.h) * k); g.fillRect(a, u, Math.max(1, b - a), Math.max(1, d - u)); }
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  for (const y of lay.yazilar) {
    g.font = `${y.boy * k}px "Helvetica Neue", Arial, sans-serif`;
    if (y.aralik && y.metin.length > 1) { const adim = y.aralik * 0.92 / y.metin.length, bas = y.x - y.aralik * 0.92 / 2 + adim / 2; [...y.metin].forEach((ch, i) => g.fillText(ch, (x0 + bas + i * adim) * k, (y0 + y.y) * k)); }
    else g.fillText(y.metin, (x0 + y.x) * k, (y0 + y.y) * k);
  }
  g.restore();
}
