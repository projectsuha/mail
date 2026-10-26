/* ───────────── Galeri · motor ─────────────
   Veritabanı (IndexedDB), EXIF okuma, küçük resim üretme, albüm şifreleme (PBKDF2 + AES-GCM),
   ZIP yazma/okuma, çevrimdışı yer adları. Hiçbir ağ isteği yapmaz. */
(function (kok) {
  'use strict';
  const pad = n => String(n).padStart(2, '0');
  const sayi = (v, a, b, d) => { v = +v; return Number.isFinite(v) ? Math.min(b, Math.max(a, v)) : d; };

  /* ═════════ IndexedDB ═════════ */
  const DB = (() => {
    let p = null;
    const ac = () => p || (p = new Promise((res, rej) => {
      const r = indexedDB.open('suha-galeri', 1);
      r.onupgradeneeded = () => { const d = r.result; d.createObjectStore('oge', { keyPath: 'id' }); d.createObjectStore('dosya', { keyPath: 'id' }); d.createObjectStore('album', { keyPath: 'id' }); };
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    }));
    const is = async (ad, mod, f) => { const d = await ac(); return new Promise((res, rej) => { const t = d.transaction(ad, mod), s = t.objectStore(ad); const q = f(s); t.oncomplete = () => res(q?.result); t.onerror = t.onabort = () => rej(t.error); }); };
    return {
      hepsi: ad => is(ad, 'readonly', s => s.getAll()),
      al: (ad, id) => is(ad, 'readonly', s => s.get(id)),
      yaz: (ad, o) => is(ad, 'readwrite', s => s.put(o)),
      sil: (ad, id) => is(ad, 'readwrite', s => s.delete(id)),
      temizle: ad => is(ad, 'readwrite', s => s.clear())
    };
  })();

  /* ═════════ Kimlik: aynı dosya iki kez eklenmesin ═════════ */
  async function kimlik(file) {
    const bas = new Uint8Array(await file.slice(0, 262144).arrayBuffer());
    const ek = new TextEncoder().encode(`${file.size}|${file.name}|${file.lastModified}|`);
    const b = new Uint8Array(ek.length + bas.length); b.set(ek); b.set(bas, ek.length);
    const h = new Uint8Array(await crypto.subtle.digest('SHA-256', b));
    return Array.from(h.slice(0, 8), x => x.toString(16).padStart(2, '0')).join('');
  }

  /* ═════════ EXIF (JPEG): çekim tarihi ve konum ═════════ */
  function exifOku(buf) {
    try {
      const v = new DataView(buf);
      if (v.byteLength < 12 || v.getUint16(0) !== 0xFFD8) return {};
      let o = 2;
      while (o + 4 < v.byteLength) {
        const m = v.getUint16(o);
        if (m === 0xFFE1) { const len = v.getUint16(o + 2); if (v.getUint32(o + 4) === 0x45786966) return tiff(v, o + 10); o += 2 + len; }
        else if ((m & 0xFF00) === 0xFF00 && m !== 0xFFDA) o += 2 + v.getUint16(o + 2);
        else break;
      }
    } catch { /* bozuk EXIF: yok say */ }
    return {};
  }
  function tiff(v, b) {
    const le = v.getUint16(b) === 0x4949;
    const g16 = o => v.getUint16(b + o, le), g32 = o => v.getUint32(b + o, le);
    if (g16(2) !== 42) return {};
    const ifd = o => { const n = Math.min(g16(o), 300), r = {}; for (let i = 0; i < n; i++) { const e = o + 2 + i * 12; r[g16(e)] = { t: g16(e + 2), n: g32(e + 4), v: e + 8 }; } return r; };
    const str = en => { const off = en.n > 4 ? g32(en.v) : en.v - 0; let s = ''; for (let i = 0; i < Math.min(en.n - 1, 40); i++) s += String.fromCharCode(v.getUint8(b + off + i)); return s; };
    const rat = (en, i) => { const off = g32(en.v), d = g32(off + i * 8 + 4); return d ? g32(off + i * 8) / d : 0; };
    const o0 = ifd(g32(4)), out = {};
    const dt = s => { const m = /^(\d{4}):(\d\d):(\d\d) (\d\d):(\d\d):(\d\d)/.exec(s || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]).getTime() : 0; };
    if (o0[0x8769]) { const ex = ifd(g32(o0[0x8769].v)); if (ex[0x9003]) out.tarih = dt(str(ex[0x9003])); }
    if (!out.tarih && o0[0x0132]) out.tarih = dt(str(o0[0x0132]));
    if (o0[0x8825]) {
      const g = ifd(g32(o0[0x8825].v));
      if (g[2] && g[4] && g[1] && g[3]) {
        const dd = en => rat(en, 0) + rat(en, 1) / 60 + rat(en, 2) / 3600;
        let la = dd(g[2]), lo = dd(g[4]);
        if (str(g[1])[0] === 'S') la = -la; if (str(g[3])[0] === 'W') lo = -lo;
        if (Math.abs(la) <= 90 && Math.abs(lo) <= 180 && (la || lo)) out.konum = { la: +la.toFixed(5), lo: +lo.toFixed(5) };
      }
    }
    return out;
  }

  /* ═════════ Küçük resim ═════════ */
  function kucukYap(kaynak, w, h, max = 360) {
    const k = Math.min(1, max / Math.max(w, h)), c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
    c.getContext('2d').drawImage(kaynak, 0, 0, c.width, c.height);
    return new Promise(r => c.toBlob(b => r(b), 'image/jpeg', .8));
  }
  async function resimOku(file) {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
      const r = { w: bmp.width, h: bmp.height, kucuk: await kucukYap(bmp, bmp.width, bmp.height) };
      bmp.close?.(); return r;
    } catch { return null; }
  }
  function videoOku(file) {
    return new Promise(res => {
      const v = document.createElement('video'), url = URL.createObjectURL(file);
      v.muted = true; v.playsInline = true; v.preload = 'metadata';
      let bitti = false;
      const bit = r => { if (bitti) return; bitti = true; clearTimeout(t); URL.revokeObjectURL(url); v.removeAttribute('src'); v.load(); res(r); };
      const t = setTimeout(() => bit(null), 9000);
      v.onloadedmetadata = () => { v.currentTime = Math.min(1, (v.duration || 1) * .1); };
      v.onseeked = async () => { const w = v.videoWidth, h = v.videoHeight; if (!w || !h) return bit(null); bit({ w, h, sure: v.duration || 0, kucuk: await kucukYap(v, w, h) }); };
      v.onerror = () => bit(null);
      v.src = url;
    });
  }

  /* ═════════ Albüm şifreleme: parola → PBKDF2 (250 bin) → AES-256-GCM ═════════ */
  const b64 = u8 => { let s = ''; for (const x of u8) s += String.fromCharCode(x); return btoa(s); };
  const unb64 = t => Uint8Array.from(atob(t), c => c.charCodeAt(0));
  async function anahtarTuret(parola, tuz) {
    const t = await crypto.subtle.importKey('raw', new TextEncoder().encode(parola.normalize('NFKC')), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: tuz, iterations: 250000, hash: 'SHA-256' }, t, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  async function sifrele(key, veri) {          // veri: ArrayBuffer | Uint8Array → ArrayBuffer (iv + şifreli)
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, veri));
    const o = new Uint8Array(12 + ct.length); o.set(iv); o.set(ct, 12); return o.buffer;
  }
  async function coz(key, buf) { const u = new Uint8Array(buf); return crypto.subtle.decrypt({ name: 'AES-GCM', iv: u.slice(0, 12) }, key, u.slice(12)); }
  const jsonSifrele = (key, o) => sifrele(key, new TextEncoder().encode(JSON.stringify(o)));
  const jsonCoz = async (key, buf) => JSON.parse(new TextDecoder().decode(await coz(key, buf)));

  /* ═════════ ZIP (sıkıştırmasız): albüm dışa aktarma ve yedek ═════════ */
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crcEkle = (c, u) => { for (let i = 0; i < u.length; i++) c = CRC[(c ^ u[i]) & 255] ^ (c >>> 8); return c; };
  async function crcBlob(blob) { let c = 0xFFFFFFFF; const r = blob.stream().getReader(); for (;;) { const { done, value } = await r.read(); if (done) break; c = crcEkle(c, value); } return (c ^ 0xFFFFFFFF) >>> 0; }
  // dosyalar: [{ad, blob}] → Blob (parçalar bellekte birleştirilmez)
  async function zipYaz(dosyalar, ilerle) {
    const parcalar = [], merkez = []; let konum = 0;
    const tarihDos = (() => { const d = new Date(); return [((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xFFFF, (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xFFFF]; })();
    let i = 0;
    for (const f of dosyalar) {
      const ad = new TextEncoder().encode(f.ad), crc = await crcBlob(f.blob), boy = f.blob.size;
      if (boy > 0xFFFFFFFE || konum > 0xFFFFFFFE) throw new Error('ZIP için dosyalar çok büyük (4 GB sınırı)');
      const yer = new DataView(new ArrayBuffer(30));
      yer.setUint32(0, 0x04034b50, true); yer.setUint16(4, 20, true); yer.setUint16(6, 0x0800, true); yer.setUint16(8, 0, true);
      yer.setUint16(10, tarihDos[0], true); yer.setUint16(12, tarihDos[1], true); yer.setUint32(14, crc, true); yer.setUint32(18, boy, true); yer.setUint32(22, boy, true); yer.setUint16(26, ad.length, true);
      parcalar.push(yer.buffer, ad, f.blob);
      const mer = new DataView(new ArrayBuffer(46));
      mer.setUint32(0, 0x02014b50, true); mer.setUint16(4, 20, true); mer.setUint16(6, 20, true); mer.setUint16(8, 0x0800, true);
      mer.setUint16(12, tarihDos[0], true); mer.setUint16(14, tarihDos[1], true); mer.setUint32(16, crc, true); mer.setUint32(20, boy, true); mer.setUint32(24, boy, true); mer.setUint16(28, ad.length, true); mer.setUint32(42, konum, true);
      merkez.push(mer.buffer, ad);
      konum += 30 + ad.length + boy; i++; ilerle?.(i, dosyalar.length);
    }
    const mBoy = merkez.reduce((a, x) => a + (x.byteLength ?? x.length), 0);
    const son = new DataView(new ArrayBuffer(22));
    son.setUint32(0, 0x06054b50, true); son.setUint16(8, dosyalar.length, true); son.setUint16(10, dosyalar.length, true); son.setUint32(12, mBoy, true); son.setUint32(16, konum, true);
    return new Blob([...parcalar, ...merkez, son.buffer], { type: 'application/zip' });
  }
  // Kendi yazdığımız (sıkıştırmasız) ZIP'i okur: yedekten geri yükleme
  async function zipOku(file) {
    const n = file.size; if (n < 22) throw new Error('Geçerli bir yedek değil');
    const son = new DataView(await file.slice(Math.max(0, n - 65557), n).arrayBuffer());
    let e = -1; for (let i = son.byteLength - 22; i >= 0; i--) if (son.getUint32(i, true) === 0x06054b50) { e = i; break; }
    if (e < 0) throw new Error('Geçerli bir yedek değil');
    const adet = son.getUint16(e + 10, true), mBoy = son.getUint32(e + 12, true), mKonum = son.getUint32(e + 16, true);
    if (adet > 200000 || mBoy > 64 * 1048576) throw new Error('Yedek çok büyük ya da bozuk');
    const m = new DataView(await file.slice(mKonum, mKonum + mBoy).arrayBuffer());
    const liste = []; let o = 0;
    for (let i = 0; i < adet && o + 46 <= m.byteLength; i++) {
      if (m.getUint32(o, true) !== 0x02014b50) break;
      const yontem = m.getUint16(o + 10, true), boy = m.getUint32(o + 24, true), al = m.getUint16(o + 28, true), ek = m.getUint16(o + 30, true), yk = m.getUint16(o + 32, true), yer = m.getUint32(o + 42, true);
      const ad = new TextDecoder().decode(new Uint8Array(m.buffer, o + 46, al)); o += 46 + al + ek + yk;
      if (yontem !== 0) throw new Error('Bu yedek Galeri tarafından oluşturulmamış');
      if (/(^|\/)\.\.(\/|$)|^\//.test(ad)) continue;     // yol aşma koruması
      liste.push({ ad, boy, yer });
    }
    return liste.map(f => ({ ad: f.ad, oku: async () => { const h = new DataView(await file.slice(f.yer, f.yer + 30).arrayBuffer()); const bas = f.yer + 30 + h.getUint16(26, true) + h.getUint16(28, true); return file.slice(bas, bas + f.boy); } }));
  }

  /* ═════════ Çevrimdışı yer adları (en yakın büyük yer) ═════════ */
  const YERLER = ('Adana,37.00,35.32;Adıyaman,37.76,38.28;Afyonkarahisar,38.76,30.54;Ağrı,39.72,43.05;Amasya,40.65,35.83;Ankara,39.93,32.86;Antalya,36.90,30.70;Artvin,41.18,41.82;Aydın,37.85,27.85;Balıkesir,39.65,27.89;Bilecik,40.14,29.98;Bingöl,38.88,40.50;Bitlis,38.40,42.11;Bolu,40.74,31.61;Burdur,37.72,30.29;Bursa,40.19,29.06;Çanakkale,40.15,26.41;Çankırı,40.60,33.62;Çorum,40.55,34.95;Denizli,37.78,29.09;Diyarbakır,37.91,40.24;Edirne,41.68,26.56;Elazığ,38.67,39.22;Erzincan,39.75,39.49;Erzurum,39.90,41.27;Eskişehir,39.78,30.52;Gaziantep,37.07,37.38;Giresun,40.91,38.39;Gümüşhane,40.46,39.48;Hakkâri,37.58,43.74;Hatay,36.40,36.35;Isparta,37.76,30.55;Mersin,36.80,34.64;İstanbul,41.01,28.98;İzmir,38.42,27.14;Kars,40.60,43.10;Kastamonu,41.38,33.78;Kayseri,38.73,35.49;Kırklareli,41.73,27.22;Kırşehir,39.15,34.17;Kocaeli,40.77,29.92;Konya,37.87,32.48;Kütahya,39.42,29.98;Malatya,38.35,38.31;Manisa,38.61,27.43;Kahramanmaraş,37.58,36.94;Mardin,37.31,40.74;Muğla,37.22,28.36;Muş,38.74,41.49;Nevşehir,38.62,34.71;Niğde,37.97,34.68;Ordu,40.98,37.88;Rize,41.02,40.52;Sakarya,40.76,30.40;Samsun,41.29,36.33;Siirt,37.93,41.94;Sinop,42.03,35.15;Sivas,39.75,37.02;Tekirdağ,40.98,27.51;Tokat,40.31,36.55;Trabzon,41.00,39.72;Tunceli,39.11,39.55;Şanlıurfa,37.16,38.79;Uşak,38.68,29.41;Van,38.49,43.38;Yozgat,39.82,34.81;Zonguldak,41.46,31.80;Aksaray,38.37,34.03;Bayburt,40.26,40.23;Karaman,37.18,33.22;Kırıkkale,39.85,33.52;Batman,37.88,41.13;Şırnak,37.52,42.46;Bartın,41.64,32.34;Ardahan,41.11,42.70;Iğdır,39.92,44.04;Yalova,40.65,29.27;Karabük,41.20,32.62;Kilis,36.72,37.12;Osmaniye,37.07,36.25;Düzce,40.84,31.16;'
    + 'Bodrum,37.04,27.43;Marmaris,36.85,28.27;Fethiye,36.62,29.12;Kaş,36.20,29.64;Alanya,36.54,32.00;Çeşme,38.32,26.30;Göreme,38.64,34.83;Pamukkale,37.92,29.12;Bozcaada,39.84,26.07;Kuşadası,37.86,27.26;Ayvalık,39.31,26.69;Side,36.77,31.39;'
    + 'Londra,51.51,-0.13;Paris,48.86,2.35;Berlin,52.52,13.40;Roma,41.90,12.50;Madrid,40.42,-3.70;Barselona,41.39,2.17;Amsterdam,52.37,4.90;Viyana,48.21,16.37;Prag,50.08,14.44;Budapeşte,47.50,19.04;Atina,37.98,23.73;Selanik,40.64,22.94;Sofya,42.70,23.32;Bükreş,44.43,26.10;Belgrad,44.79,20.45;Saraybosna,43.86,18.41;Üsküp,42.00,21.43;Tiran,41.33,19.82;Moskova,55.76,37.62;Kiev,50.45,30.52;Tiflis,41.72,44.79;Bakü,40.41,49.87;Erivan,40.18,44.51;Dubai,25.20,55.27;Doha,25.29,51.53;Kahire,30.04,31.24;Kudüs,31.77,35.21;Beyrut,33.89,35.50;Amman,31.95,35.93;Riyad,24.71,46.68;Mekke,21.42,39.83;Medine,24.47,39.61;Cidde,21.54,39.17;Tahran,35.69,51.39;Bağdat,33.31,44.36;Taşkent,41.30,69.24;Astana,51.17,71.45;Almatı,43.24,76.89;New York,40.71,-74.01;Los Angeles,34.05,-118.24;Chicago,41.88,-87.63;Toronto,43.65,-79.38;Washington,38.91,-77.04;Miami,25.76,-80.19;Mexico City,19.43,-99.13;São Paulo,-23.55,-46.63;Buenos Aires,-34.60,-58.38;Tokyo,35.68,139.69;Seul,37.57,126.98;Pekin,39.90,116.41;Şanghay,31.23,121.47;Hong Kong,22.32,114.17;Singapur,1.35,103.82;Bangkok,13.76,100.50;Delhi,28.61,77.21;Mumbai,19.08,72.88;Sidney,-33.87,151.21;Kuala Lumpur,3.14,101.69;Cakarta,-6.21,106.85;Lizbon,38.72,-9.14;Brüksel,50.85,4.35;Zürih,47.38,8.54;Cenevre,46.20,6.14;Münih,48.14,11.58;Milano,45.46,9.19;Stockholm,59.33,18.07;Kopenhag,55.68,12.57;Oslo,59.91,10.75;Helsinki,60.17,24.94;Dublin,53.35,-6.26;Varşova,52.23,21.01;Lefkoşa,35.19,33.38;Girne,35.34,33.32;Marakeş,31.63,-8.01;Tunus,36.81,10.18;Cezayir,36.75,3.06;İskenderiye,31.20,29.92')
    .split(';').filter(Boolean).map(s => { const [ad, la, lo] = s.split(','); return { ad, la: +la, lo: +lo }; });
  const rad = x => x * Math.PI / 180;
  const uzaklik = (a, b, c, d) => { const x = rad(c - a), y = rad(d - b), h = Math.sin(x / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(y / 2) ** 2; return 12742 * Math.asin(Math.sqrt(h)); };
  const yerOnb = new Map();
  function yerAdi(k) {
    if (!k) return '';
    const an = k.la + ',' + k.lo; if (yerOnb.has(an)) return yerOnb.get(an);
    const r = yerAdi0(k); if (yerOnb.size > 5000) yerOnb.clear(); yerOnb.set(an, r); return r;
  }
  function yerAdi0(k) {
    let en = null, ed = 1e9;
    for (const y of YERLER) { const d = uzaklik(k.la, k.lo, y.la, y.lo); if (d < ed) { ed = d; en = y; } }
    if (en && ed <= 60) return en.ad;
    if (en && ed <= 250) return en.ad + ' çevresi';
    return `${Math.abs(k.la).toFixed(1)}°${k.la >= 0 ? 'K' : 'G'} ${Math.abs(k.lo).toFixed(1)}°${k.lo >= 0 ? 'D' : 'B'}`;
  }

  const bayt = n => n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(0) + ' KB' : n < 1073741824 ? (n / 1048576).toFixed(1).replace('.', ',') + ' MB' : (n / 1073741824).toFixed(2).replace('.', ',') + ' GB';
  const sureYaz = s => { s = Math.round(s || 0); const m = Math.floor(s / 60); return `${m}:${pad(s % 60)}`; };

  kok.GE = { DB, kimlik, exifOku, kucukYap, resimOku, videoOku, anahtarTuret, sifrele, coz, jsonSifrele, jsonCoz, b64, unb64, zipYaz, zipOku, yerAdi, bayt, sureYaz, pad, sayi };
})(window);
