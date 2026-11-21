/* ───────────── Foto motoru ─────────────
   Hepsi cihazda (tarayıcının tuvali ile): okuma, döndürme, kırpma, yeniden boyutlandırma, hedef KB'ye sıkıştırma,
   konum/çekim bilgisi silme (JPEG'de kayıpsız), filigran, mozaik, baskı sayfası, zip.
   Dışarıdan kütüphane yok; fotoğraf hiçbir yere gönderilmez. */
'use strict';

const FOTOIS = (() => {
  const iOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const MAKS_PIKSEL = iOS ? 16e6 : 40e6;   // tuval bellek sınırı (iPhone Safari daha düşük)
  class FotoHata extends Error {}

  const tuval = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };
  const birak = c => { if (c) { c.width = 0; c.height = 0; } };
  const yumusak = x => { x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; return x; };

  /* ═════════ Okuma ═════════ */
  async function gorselAc(file) {
    const url = URL.createObjectURL(file);
    const img = new Image(); img.decoding = 'async'; img.src = url;
    try { await img.decode(); }
    catch {
      URL.revokeObjectURL(url);
      throw new FotoHata(/hei[cf]/i.test(file.name + file.type)
        ? 'Bu tarayıcı HEIC fotoğrafı açamıyor. iPhone/Mac\'te Safari ile aç ya da fotoğrafı JPG olarak paylaş.'
        : 'Bu dosya fotoğraf olarak açılamadı.');
    }
    return { img, url };
  }
  // Fotoğrafı tuvale çizer (EXIF yönü uygulanmış halde); cihaz sınırını aşarsa küçültür
  async function coz(file, maks = MAKS_PIKSEL) {
    const { img, url } = await gorselAc(file);
    try {
      const nw = img.naturalWidth, nh = img.naturalHeight, k = Math.min(1, Math.sqrt(maks / (nw * nh)));
      const c = tuval(nw * k, nh * k); yumusak(c.getContext('2d')).drawImage(img, 0, 0, c.width, c.height);
      return { c, nw, nh, kucultuldu: k < 1, oran: k };
    } finally { URL.revokeObjectURL(url); }
  }
  async function olcuOku(file) {
    const { img, url } = await gorselAc(file);
    const r = { w: img.naturalWidth, h: img.naturalHeight }; URL.revokeObjectURL(url); return r;
  }

  /* ═════════ Tuval işleri ═════════ */
  // Büyük küçültmeleri yarıya bölerek yapar (kenar tırtıklanmasın)
  function boyutla(kaynak, w, h) {
    w = Math.max(1, Math.round(w)); h = Math.max(1, Math.round(h));
    let cur = kaynak, cw = kaynak.width, ch = kaynak.height;
    while (cw / 2 > w && ch / 2 > h) {
      cw = Math.round(cw / 2); ch = Math.round(ch / 2);
      const t = tuval(cw, ch); yumusak(t.getContext('2d')).drawImage(cur, 0, 0, cw, ch);
      if (cur !== kaynak) birak(cur); cur = t;
    }
    const son = tuval(w, h); yumusak(son.getContext('2d')).drawImage(cur, 0, 0, w, h);
    if (cur !== kaynak) birak(cur);
    return son;
  }
  function kes(c, x, y, w, h, cikW, cikH) {
    x = Math.max(0, Math.round(x)); y = Math.max(0, Math.round(y));
    w = Math.min(c.width - x, Math.round(w)); h = Math.min(c.height - y, Math.round(h));
    const t = tuval(w, h); t.getContext('2d').drawImage(c, x, y, w, h, 0, 0, w, h);
    if (!cikW) return t;
    const s = boyutla(t, cikW, cikH); birak(t); return s;
  }
  // Ortadan kırparak tam W×H yapar (oranı korur)
  function kapla(c, W, H) {
    const r = W / H; let w = c.width, h = c.height;
    if (w / h > r) w = h * r; else h = w / r;
    return kes(c, (c.width - w) / 2, (c.height - h) / 2, w, h, W, H);
  }
  function donustur(c, donus = 0, ayna = false) {
    if (!donus && !ayna) return c;
    const d90 = donus % 180 !== 0, t = tuval(d90 ? c.height : c.width, d90 ? c.width : c.height), x = t.getContext('2d');
    x.translate(t.width / 2, t.height / 2); x.rotate(donus * Math.PI / 180); if (ayna) x.scale(-1, 1);
    x.drawImage(c, -c.width / 2, -c.height / 2); return t;
  }
  const beyazZemin = c => { const t = tuval(c.width, c.height), x = t.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, t.width, t.height); x.drawImage(c, 0, 0); return t; };

  /* ═════════ Kodlama ═════════ */
  function blob(c, tur, kalite) {
    return new Promise((ok, hata) => c.toBlob(b => {
      if (!b) return hata(new FotoHata('Fotoğraf yazılamadı (bellek yetmemiş olabilir).'));
      if (b.type !== tur) return hata(new FotoHata(`Bu tarayıcı ${tur.replace('image/', '').toUpperCase()} yazamıyor.`));
      ok(b);
    }, tur, kalite));
  }
  const desteklenen = {};
  async function yazilabilir(tur) {
    if (tur in desteklenen) return desteklenen[tur];
    try { const t = tuval(2, 2); await blob(t, tur, .8); desteklenen[tur] = true; } catch { desteklenen[tur] = false; }
    return desteklenen[tur];
  }
  // Hedef bayta sığacak en yüksek kaliteyi bulur; gerekirse yavaş yavaş küçültür.
  // sabit=true: piksel ölçüsü değişmez, sadece kalite düşer.
  async function hedefeSigdir(c, hedef, { sabit = false, tur = 'image/jpeg' } = {}) {
    const kaynak = tur === 'image/jpeg' ? beyazZemin(c) : c, enAz = sabit ? .04 : .55;
    let olcek = 1, cur = kaynak;
    for (let adim = 0; adim < 24; adim++) {
      const yuksek = await blob(cur, tur, .95);
      if (yuksek.size <= hedef) { if (cur !== kaynak) birak(cur); return { blob: yuksek, kalite: .95, olcek, w: cur.width, h: cur.height, tamam: true }; }
      const dusuk = await blob(cur, tur, enAz);
      if (dusuk.size <= hedef) {
        let lo = enAz, hi = .95, en = dusuk;
        for (let i = 0; i < 7; i++) { const mid = (lo + hi) / 2, b = await blob(cur, tur, mid); if (b.size <= hedef) { en = b; lo = mid; } else hi = mid; }
        const r = { blob: en, kalite: lo, olcek, w: cur.width, h: cur.height, tamam: true };
        if (cur !== kaynak) birak(cur); return r;
      }
      if (sabit || Math.min(cur.width, cur.height) < 48) { const r = { blob: dusuk, kalite: enAz, olcek, w: cur.width, h: cur.height, tamam: false }; if (cur !== kaynak) birak(cur); return r; }
      olcek *= .85;
      const yeni = boyutla(kaynak, kaynak.width * olcek, kaynak.height * olcek);
      if (cur !== kaynak) birak(cur); cur = yeni;
    }
    const son = await blob(cur, tur, enAz); return { blob: son, kalite: enAz, olcek, w: cur.width, h: cur.height, tamam: false };
  }

  /* ═════════ EXIF: okuma ve kayıpsız silme (JPEG) ═════════ */
  function tiffOku(u8, taban, boy) {
    const dv = new DataView(u8.buffer, u8.byteOffset + taban, Math.max(8, Math.min(boy, u8.length - taban)));
    const le = dv.getUint16(0) === 0x4949, u16 = o => dv.getUint16(o, le), u32 = o => dv.getUint32(o, le);
    const boyut = [0, 1, 1, 2, 4, 8, 1, 1, 2, 4, 8, 4, 8];
    const ifd = o => { const n = u16(o), r = {}; for (let i = 0; i < n; i++) { const e = o + 2 + i * 12, t = u16(e + 2), cnt = u32(e + 4), sz = (boyut[t] || 1) * cnt; r[u16(e)] = { t, cnt, vo: sz <= 4 ? e + 8 : u32(e + 8) }; } return r; };
    const deger = e => {
      if (!e) return null;
      if (e.t === 2) { let s = ''; for (let i = 0; i < e.cnt - 1; i++) s += String.fromCharCode(dv.getUint8(e.vo + i)); return s.trim(); }
      if (e.t === 3) return u16(e.vo); if (e.t === 4) return u32(e.vo);
      if (e.t === 5) return Array.from({ length: e.cnt }, (_, i) => u32(e.vo + 8 * i) / (u32(e.vo + 8 * i + 4) || 1));
      return null;
    };
    const sonuc = { yon: 1, cihaz: '', tarih: '', konum: null, var: true };
    try {
      const i0 = ifd(u32(4));
      sonuc.yon = deger(i0[0x0112]) || 1;
      sonuc.cihaz = [deger(i0[0x010F]), deger(i0[0x0110])].filter(Boolean).join(' ').replace(/(\S+) \1/i, '$1');
      sonuc.tarih = deger(i0[0x0132]) || '';
      if (i0[0x8769]) { const ex = ifd(u32(i0[0x8769].vo)); sonuc.tarih = deger(ex[0x9003]) || sonuc.tarih; }
      if (i0[0x8825]) {
        const g = ifd(u32(i0[0x8825].vo)), la = deger(g[2]), lo = deger(g[4]);
        if (la && lo && la.length >= 3 && lo.length >= 3) {
          const k = a => a[0] + a[1] / 60 + a[2] / 3600;
          sonuc.konum = { lat: (deger(g[1]) === 'S' ? -1 : 1) * k(la), lon: (deger(g[3]) === 'W' ? -1 : 1) * k(lo) };
        }
      }
    } catch { /* bozuk EXIF: elde ne varsa onu ver */ }
    return sonuc;
  }
  function exifOku(u8) {
    if (u8[0] !== 0xFF || u8[1] !== 0xD8) return null;
    let p = 2;
    while (p + 4 < u8.length && u8[p] === 0xFF) {
      const m = u8[p + 1], len = (u8[p + 2] << 8) | u8[p + 3];
      if (m === 0xDA) break;
      if (m === 0xE1 && u8[p + 4] === 0x45 && u8[p + 5] === 0x78 && u8[p + 6] === 0x69 && u8[p + 7] === 0x66) return tiffOku(u8, p + 10, len - 8);
      p += 2 + len;
    }
    return { yon: 1, cihaz: '', tarih: '', konum: null, var: false };
  }
  async function bilgiOku(file) {
    if (!/jpe?g/i.test(file.type) && !/\.jpe?g$/i.test(file.name)) return null;
    try { return exifOku(new Uint8Array(await file.slice(0, 262144).arrayBuffer())); } catch { return null; }
  }
  function enKucukExif(yon) {
    return Uint8Array.from([0xFF, 0xE1, 0x00, 0x22, 0x45, 0x78, 0x69, 0x66, 0, 0, 0x4D, 0x4D, 0, 0x2A, 0, 0, 0, 8, 0, 1, 0x01, 0x12, 0, 3, 0, 0, 0, 1, 0, yon, 0, 0, 0, 0, 0, 0]);
  }
  // JPEG'den konum/cihaz/tarih/küçük resim/XMP/IPTC ve dosya sonuna eklenmiş gömülü içeriği (hareketli fotoğraf videosu, ikinci görüntü) siler.
  // Piksel verisine dokunmaz (kayıpsız). Yön bilgisi tek başına korunur ki fotoğraf yan dönmesin.
  function jpegTemizle(u8, yon = 1) {
    if (u8[0] !== 0xFF || u8[1] !== 0xD8) throw new FotoHata('JPEG değil');
    const parcalar = [u8.subarray(0, 2)]; let p = 2, exifEklendi = yon <= 1;
    while (p + 4 <= u8.length && u8[p] === 0xFF) {
      const m = u8[p + 1];
      if (m === 0xDA) break;
      const len = (u8[p + 2] << 8) | u8[p + 3], seg = u8.subarray(p, p + 2 + len);
      const icc = m === 0xE2 && seg[4] === 0x49 && seg[5] === 0x43 && seg[6] === 0x43;   // renk profili kalsın
      const sil = m === 0xE1 || m === 0xED || m === 0xFE || m === 0xE3 || (m === 0xE2 && !icc) || (m >= 0xE4 && m <= 0xEC) || m === 0xEF;
      if (!sil) { parcalar.push(seg); if (m === 0xE0 && !exifEklendi) { parcalar.push(enKucukExif(yon)); exifEklendi = true; } }
      p += 2 + len;
    }
    if (!exifEklendi) parcalar.splice(1, 0, enKucukExif(yon));
    // tarama verisi: ilk FFD9'a kadar (sonrası gömülü ek içerik)
    let son = u8.length;
    for (let i = p; i + 1 < u8.length; i++) if (u8[i] === 0xFF && u8[i + 1] === 0xD9) { son = i + 2; break; }
    parcalar.push(u8.subarray(p, son));
    return new Uint8Array(await_birlestir(parcalar));
  }
  function await_birlestir(parcalar) {
    const t = parcalar.reduce((s, a) => s + a.length, 0), o = new Uint8Array(t); let k = 0;
    for (const a of parcalar) { o.set(a, k); k += a.length; } return o.buffer;
  }
  // JFIF yoğunluğunu yazar (baskıda doğru boyut çıksın)
  function jpegDpi(u8, dpi) {
    const h = dpi >> 8, l = dpi & 255;
    if (u8[2] === 0xFF && u8[3] === 0xE0 && u8[6] === 0x4A && u8[7] === 0x46) { const o = u8.slice(); o[13] = 1; o[14] = h; o[15] = l; o[16] = h; o[17] = l; return o; }
    const jfif = Uint8Array.from([0xFF, 0xE0, 0, 16, 0x4A, 0x46, 0x49, 0x46, 0, 1, 1, 1, h, l, h, l, 0, 0]);
    return new Uint8Array(await_birlestir([u8.subarray(0, 2), jfif, u8.subarray(2)]));
  }

  /* ═════════ Filigran, mozaik, baskı sayfası ═════════ */
  function filigranCiz(c, { yazi, renk = '#d00000', opaklik = .45, boyut = 4.5, aci = -30, aralik = 1.8 }) {
    const x = c.getContext('2d'), fs = Math.max(10, Math.min(c.width, c.height) * boyut / 100);
    x.save(); x.globalAlpha = opaklik; x.fillStyle = renk; x.font = `700 ${fs}px system-ui, -apple-system, "Segoe UI", sans-serif`; x.textBaseline = 'middle';
    const gen = x.measureText(yazi).width, adim = fs * aralik, bosluk = fs * 1.2, kose = Math.hypot(c.width, c.height);
    x.translate(c.width / 2, c.height / 2); x.rotate(aci * Math.PI / 180);
    let satir = 0;
    for (let y = -kose; y < kose; y += adim, satir++) {
      const kay = (satir % 2) * (gen + bosluk) / 2;
      for (let xx = -kose - kay; xx < kose; xx += gen + bosluk) x.fillText(yazi, xx, y);
    }
    x.restore(); return c;
  }
  // Bölgeler 0-1 arası oranlarla verilir; mozaik geri döndürülemez (bulanıklıktan güvenli)
  function bolgeleriUygula(c, bolgeler) {
    const x = c.getContext('2d'), kopya = tuval(c.width, c.height); kopya.getContext('2d').drawImage(c, 0, 0);
    for (const b of bolgeler) {
      const bx = Math.round(b.x * c.width), by = Math.round(b.y * c.height), bw = Math.max(1, Math.round(b.w * c.width)), bh = Math.max(1, Math.round(b.h * c.height));
      if (b.mod === 'kara') { x.fillStyle = '#000'; x.fillRect(bx, by, bw, bh); continue; }
      const blok = Math.max(6, Math.round(Math.min(bw, bh) / 5)), sw = Math.max(1, Math.ceil(bw / blok)), sh = Math.max(1, Math.ceil(bh / blok));
      const k = tuval(sw, sh), kx = k.getContext('2d'); kx.imageSmoothingEnabled = true; kx.drawImage(kopya, bx, by, bw, bh, 0, 0, sw, sh);
      x.save(); x.beginPath(); x.rect(bx, by, bw, bh); x.clip(); x.imageSmoothingEnabled = false; x.drawImage(k, 0, 0, sw, sh, bx, by, sw * blok, sh * blok); x.restore();
      birak(k);
    }
    birak(kopya); return c;
  }
  const BASKI = { a4: { ad: 'A4', w: 2480, h: 3508 }, '10x15': { ad: '10×15 cm', w: 1200, h: 1800 } };
  function baskiSayfasi(foto, tur) {
    const s = BASKI[tur], bosluk = 6, cols = Math.floor((s.w + bosluk) / (foto.width + bosluk)), rows = Math.floor((s.h + bosluk) / (foto.height + bosluk));
    const c = tuval(s.w, s.h), x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, s.w, s.h);
    const ox = Math.round((s.w - (cols * foto.width + (cols - 1) * bosluk)) / 2), oy = Math.round((s.h - (rows * foto.height + (rows - 1) * bosluk)) / 2);
    for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) x.drawImage(foto, ox + q * (foto.width + bosluk), oy + r * (foto.height + bosluk));
    x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 1;
    for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) x.strokeRect(ox + q * (foto.width + bosluk) + .5, oy + r * (foto.height + bosluk) + .5, foto.width - 1, foto.height - 1);
    return { c, adet: cols * rows };
  }

  /* ═════════ Zip (sıkıştırmasız, birden çok dosyayı tek seferde indirmek için) ═════════ */
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  async function zip(dosyalar) {
    const enc = new TextEncoder(), parcalar = [], merkez = [], d = new Date();
    const zaman = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), gun = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    let ofs = 0; const adlar = new Set();
    for (const f of dosyalar) {
      let ad = f.ad.replace(/[\\/:*?"<>|]/g, '_'), n = 2; const [g, u] = ad.match(/^(.*?)(\.[^.]*)?$/).slice(1);
      while (adlar.has(ad)) ad = `${g} (${n++})${u || ''}`; adlar.add(ad);
      const veri = new Uint8Array(await f.blob.arrayBuffer()), adB = enc.encode(ad), crc = crc32(veri);
      const h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
      h.setUint16(10, zaman, true); h.setUint16(12, gun, true); h.setUint32(14, crc, true); h.setUint32(18, veri.length, true); h.setUint32(22, veri.length, true);
      h.setUint16(26, adB.length, true); h.setUint16(28, 0, true);
      const m = new DataView(new ArrayBuffer(46));
      m.setUint32(0, 0x02014b50, true); m.setUint16(4, 20, true); m.setUint16(6, 20, true); m.setUint16(8, 0x0800, true); m.setUint16(10, 0, true);
      m.setUint16(12, zaman, true); m.setUint16(14, gun, true); m.setUint32(16, crc, true); m.setUint32(20, veri.length, true); m.setUint32(24, veri.length, true);
      m.setUint16(28, adB.length, true); m.setUint32(42, ofs, true);
      parcalar.push(h, adB, veri); merkez.push(m, adB);
      ofs += 30 + adB.length + veri.length;
    }
    const mBoy = merkez.reduce((s, x) => s + x.byteLength, 0), son = new DataView(new ArrayBuffer(22));
    son.setUint32(0, 0x06054b50, true); son.setUint16(8, dosyalar.length, true); son.setUint16(10, dosyalar.length, true);
    son.setUint32(12, mBoy, true); son.setUint32(16, ofs, true);
    return new Blob([...parcalar, ...merkez, son], { type: 'application/zip' });
  }

  return { FotoHata, MAKS_PIKSEL, iOS, tuval, birak, coz, olcuOku, boyutla, kes, kapla, donustur, beyazZemin, blob, yazilabilir, hedefeSigdir,
    bilgiOku, exifOku, jpegTemizle, jpegDpi, filigranCiz, bolgeleriUygula, baskiSayfasi, BASKI, zip };
})();
