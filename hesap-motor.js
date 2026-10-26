/* ───────────── Hesap · motor ─────────────
   Güvenli ifade çözücü (eval kullanılmaz). Dört işlem, üs, yüzde, parantez, fonksiyonlar, sabitler,
   faktöriyel, değişkenler. Türkçe yazım: 1.250,50 ya da 1250.5 ikisi de olur.
   Yüzde kuralı (hesap makinesi gibi): 200 + %10 = 220, 200 − 10% = 180, 200 × 10% = 20, tek başına 10% = 0,1 */
'use strict';

const HM = (() => {
  const FONK = {
    sin: (x, d) => Math.sin(d ? x * Math.PI / 180 : x), cos: (x, d) => Math.cos(d ? x * Math.PI / 180 : x),
    tan: (x, d) => { const r = d ? x * Math.PI / 180 : x; if (d && Math.abs(((x % 180) + 180) % 180 - 90) < 1e-12) throw new Error('tan tanımsız'); return Math.tan(r); },
    asin: (x, d) => { if (x < -1 || x > 1) throw new Error('asin −1…1 arası'); const r = Math.asin(x); return d ? r * 180 / Math.PI : r; },
    acos: (x, d) => { if (x < -1 || x > 1) throw new Error('acos −1…1 arası'); const r = Math.acos(x); return d ? r * 180 / Math.PI : r; },
    atan: (x, d) => { const r = Math.atan(x); return d ? r * 180 / Math.PI : r; },
    ln: x => { if (x <= 0) throw new Error('ln için sayı 0\'dan büyük olmalı'); return Math.log(x); },
    log: x => { if (x <= 0) throw new Error('log için sayı 0\'dan büyük olmalı'); return Math.log10(x); },
    sqrt: x => { if (x < 0) throw new Error('Negatif sayının karekökü yok'); return Math.sqrt(x); },
    kok: x => { if (x < 0) throw new Error('Negatif sayının karekökü yok'); return Math.sqrt(x); },
    abs: Math.abs, mutlak: Math.abs, round: Math.round, yuvarla: Math.round, floor: Math.floor, ceil: Math.ceil,
    exp: Math.exp, cbrt: Math.cbrt
  };
  const SABIT = { pi: Math.PI, 'π': Math.PI, e: Math.E };

  // Sayı yazımı: "1.250,50" (Türkçe), "1,5", "1250.5", "1 250" → sayı
  function sayiCoz(s) {
    s = s.replace(/[\s  ']/g, '');
    if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) return +s.replace(/\./g, '').replace(',', '.');   // 1.250 ya da 1.250,50
    if (/^\d{1,3}(,\d{3})+\.\d+$/.test(s)) return +s.replace(/,/g, '');                         // 1,250.50 (İngilizce)
    if (/^\d*,\d+$/.test(s)) return +s.replace(',', '.');
    if (/^\d*\.?\d+(e[+-]?\d+)?$/i.test(s) || /^\d+\.$/.test(s)) return +s;
    return NaN;
  }

  function parcala(metin) {
    const t = [], s = String(metin).replace(/×/g, '*').replace(/[÷:]/g, '/').replace(/[−–—]/g, '-').replace(/√/g, ' kok ').replace(/\*\*/g, '^');
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/[\d.,]/.test(c)) {
        // Sayı: rakam, nokta, virgül; içte tek boşluk (1 250) da olur. İki sayı arasındaki ", " ayırıcı sayılmaz.
        let j = i, m = '';
        while (j < s.length && (/[\d.,]/.test(s[j]) || (s[j] === ' ' && /\d/.test(s[j - 1] || '') && /^\d{3}(?!\d)/.test(s.slice(j + 1))))) { m += s[j]; j++; }
        if (/e/i.test(s[j] || '') && /[+-]?\d/.test(s.slice(j + 1, j + 3))) { const ek = s.slice(j).match(/^e[+-]?\d+/i)[0]; m += ek; j += ek.length; }
        const v = sayiCoz(m);
        if (isNaN(v)) throw new Error(`"${m.trim()}" sayı olarak okunamadı`);
        t.push({ t: 'sayi', v }); i = j; continue;
      }
      if (/[A-Za-zÇĞİÖŞÜçğıöşüπ_]/.test(c)) {
        let j = i; while (j < s.length && /[A-Za-zÇĞİÖŞÜçğıöşüπ_\d]/.test(s[j])) j++;
        t.push({ t: 'ad', v: s.slice(i, j) }); i = j; continue;
      }
      if ('+-*/^()%!'.includes(c)) { t.push({ t: 'op', v: c }); i++; continue; }
      throw new Error(`"${c}" anlaşılamadı`);
    }
    return t;
  }

  // Özyinelemeli iniş: ifade (+ −) → terim (* /) → tekli (−, %önek) → üs (^) → sonek (! %) → temel  (−3² = −9)
  function coz(metin, o = {}) {
    const t = parcala(metin), deg = o.derece !== false, deg_ = o.degiskenler || {};
    let i = 0;
    const bak = () => t[i], al = () => t[i++];
    const op = v => t[i] && t[i].t === 'op' && t[i].v === v;
    function ifade() {
      let sol = terim();
      while (op('+') || op('-')) {
        const isaret = al().v, sag = terim();
        const deger = sag.yuzde ? sol.v * sag.v : sag.v;   // 200 + %10 → 200 + 20
        sol = { v: isaret === '+' ? sol.v + deger : sol.v - deger };
      }
      return sol;
    }
    function terim() {
      let sol = tekli();
      for (;;) {
        if (op('*')) { al(); const s = tekli(); sol = { v: sol.v * s.v }; }
        else if (op('/')) { al(); const s = tekli(); if (s.v === 0) throw new Error('Sıfıra bölünemez'); sol = { v: sol.v / s.v }; }
        else if (bak() && (bak().t === 'sayi' || bak().t === 'ad' || op('('))) { const s = us(); sol = { v: sol.v * s.v }; }   // örtük çarpma: 2π, 3(4+1)
        else return sol;
      }
    }
    function us() {
      const taban = sonek();
      if (op('^')) { al(); const u = tekli(); const v = Math.pow(taban.v, u.v); if (isNaN(v)) throw new Error('Bu üs hesaplanamaz'); return { v }; }
      return taban;
    }
    function tekli() {
      if (op('-')) { al(); const x = tekli(); return { v: -x.v, yuzde: x.yuzde }; }
      if (op('+')) { al(); return tekli(); }
      if (op('%')) { al(); const x = us(); return { v: x.v / 100, yuzde: true }; }   // %10
      return us();
    }
    function sonek() {
      let x = temel();
      for (;;) {
        if (op('!')) { al(); x = { v: fakt(x.v) }; }
        else if (op('%')) { al(); x = { v: x.v / 100, yuzde: true }; }
        else return x;
      }
    }
    function temel() {
      const k = al();
      if (!k) throw new Error('İfade eksik');
      if (k.t === 'sayi') return { v: k.v };
      if (k.t === 'op' && k.v === '(') { const x = ifade(); if (!op(')')) throw new Error('Kapanmayan parantez'); al(); return { v: x.v }; }
      if (k.t === 'ad') {
        const ad = k.v, kucuk = ad.toLocaleLowerCase('tr');
        if (FONK[kucuk] || FONK[ad.toLowerCase()]) {
          const f = FONK[kucuk] || FONK[ad.toLowerCase()];
          let arg;
          if (op('(')) { al(); arg = ifade(); if (!op(')')) throw new Error('Kapanmayan parantez'); al(); } else arg = us();
          return { v: f(arg.v, deg) };
        }
        if (Object.prototype.hasOwnProperty.call(deg_, ad)) return { v: deg_[ad] };
        if (Object.prototype.hasOwnProperty.call(deg_, kucuk)) return { v: deg_[kucuk] };
        if (SABIT[kucuk] !== undefined) return { v: SABIT[kucuk] };
        throw new Error(`"${ad}" tanımlı değil`);
      }
      if (k.t === 'op' && k.v === ')') throw new Error('Fazla kapanan parantez');
      throw new Error('İfade eksik');
    }
    if (!t.length) return null;
    const r = ifade();
    if (i < t.length) throw new Error(t[i].v === ')' ? 'Fazla kapanan parantez' : 'İfade anlaşılamadı');
    if (!isFinite(r.v)) throw new Error('Sonuç çok büyük');
    return duzelt(r.v);
  }
  function fakt(n) {
    if (n < 0 || !Number.isInteger(n)) throw new Error('Faktöriyel sadece doğal sayılar için');
    if (n > 170) throw new Error('Sonuç çok büyük');
    let r = 1; for (let k = 2; k <= n; k++) r *= k; return r;
  }
  // 0,1 + 0,2 = 0,30000000000000004 gibi kayan nokta artıklarını temizle
  const duzelt = v => v === 0 ? 0 : +v.toPrecision(15);

  // Gösterim: Türkçe (1.234,56); çok büyük/küçük sayılar bilimsel
  function yaz(v, o = {}) {
    if (v == null || isNaN(v)) return '';
    if (!isFinite(v)) return '∞';
    const mutlak = Math.abs(v), basamak = o.basamak ?? 10;
    if (mutlak !== 0 && (mutlak >= 1e15 || mutlak < 1e-9)) return v.toExponential(8).replace(/\.?0+e/, 'e').replace('.', ',').replace('e+', ' × 10^').replace('e-', ' × 10^-');
    return v.toLocaleString('tr-TR', { maximumFractionDigits: basamak, minimumFractionDigits: o.enAz ?? 0 });
  }
  const para = (v, b = 2) => isFinite(v) ? v.toLocaleString('tr-TR', { minimumFractionDigits: b, maximumFractionDigits: b }) : '—';

  /* ── Hesap kâğıdı ──
     Satır biçimleri:  "kira = 12.500"  ·  "Market: 3.200 + 850"  ·  "kira + market"  ·  "toplam"  ·  "# not"
     "toplam" bir önceki boş satıra (ya da başa) kadar olan sonuçları toplar. "önceki" bir önceki sonucu verir. */
  function kagit(metin, o = {}) {
    const satirlar = String(metin).split('\n'), deg = {}, sonuc = [];
    let grup = [], onceki = null, genel = 0;
    for (const ham of satirlar) {
      const s = ham.trim();
      if (!s) { sonuc.push({ tur: 'bos' }); grup = []; continue; }
      if (s.startsWith('#') || s.startsWith('//')) { sonuc.push({ tur: 'not' }); continue; }
      let ad = null, ifadeMetni = s, m;
      if ((m = s.match(/^([A-Za-zÇĞİÖŞÜçğıöşü_][\wÇĞİÖŞÜçğıöşü ]{0,30}?)\s*=\s*(.+)$/))) { ad = m[1].trim(); ifadeMetni = m[2]; }
      else if ((m = s.match(/^([^:=]{1,40}):\s*(.+)$/))) { ifadeMetni = m[2]; ad = m[1].trim(); }
      const kucuk = ifadeMetni.toLocaleLowerCase('tr').trim();
      try {
        let v;
        if (/^(toplam|ara toplam|top)$/.test(kucuk)) v = grup.reduce((a, b) => a + b, 0);
        else if (/^(genel toplam)$/.test(kucuk)) v = genel;
        else {
          const ortam = { ...deg }; if (onceki != null) { ortam['önceki'] = onceki; ortam.onceki = onceki; ortam.ans = onceki; }
          // Değişken adlarında boşluk olabilir: "ev kirası + market" → uzun adlar önce değiştirilir
          let im = ifadeMetni; const adlar = Object.keys(deg).filter(a => /\s/.test(a)).sort((a, b) => b.length - a.length);
          adlar.forEach((a, k) => { const yer = '_d' + k; ortam[yer] = deg[a]; im = im.split(a).join(yer); });
          v = coz(im, { derece: o.derece, degiskenler: ortam });
        }
        if (v == null) { sonuc.push({ tur: 'not' }); continue; }
        if (ad) { deg[ad] = v; deg[ad.toLocaleLowerCase('tr')] = v; }
        sonuc.push({ tur: 'deger', v, ad, toplam: /^(toplam|ara toplam|top|genel toplam)$/.test(kucuk) });
        if (!/^(toplam|ara toplam|top|genel toplam)$/.test(kucuk)) { grup.push(v); genel += v; }
        onceki = v;
      } catch (e) {
        // Sadece yazı olan satır (ör. "Ekim giderleri") not sayılır; sayı içeriyorsa hata gösterilir
        sonuc.push(/\d/.test(ifadeMetni) ? { tur: 'hata', mesaj: e.message } : { tur: 'not' });
      }
    }
    return { satirlar: sonuc, genel };
  }

  return { coz, yaz, para, kagit, sayiCoz, FONK };
})();
if (typeof module !== 'undefined') module.exports = HM;
