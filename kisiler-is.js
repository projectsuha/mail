/* ───────────── Kişiler · motor ─────────────
   Veritabanı (IndexedDB), vCard (.vcf) okuma ve yazma, telefon numarası yardımcıları, doğum günü hesabı, fotoğraf küçültme.
   Hiçbir ağ isteği yapmaz. */
(function (kok) {
  'use strict';
  const pad = n => String(n).padStart(2, '0');
  const sayi = (v, a, b, d) => { v = +v; return Number.isFinite(v) ? Math.min(b, Math.max(a, v)) : d; };

  const DB = (() => {
    let p = null;
    const ac = () => p || (p = new Promise((res, rej) => {
      const r = indexedDB.open('suha-kisiler', 1);
      r.onupgradeneeded = () => { const d = r.result; d.createObjectStore('kisi', { keyPath: 'id' }); d.createObjectStore('grup', { keyPath: 'id' }); };
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    }));
    const is = async (ad, mod, f) => { const d = await ac(); return new Promise((res, rej) => { const t = d.transaction(ad, mod), s = t.objectStore(ad); const q = f(s); t.oncomplete = () => res(q?.result); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error || new Error('iptal')); }); };
    return {
      hepsi: ad => is(ad, 'readonly', s => s.getAll()),
      yaz: (ad, o) => is(ad, 'readwrite', s => s.put(o)),
      sil: (ad, id) => is(ad, 'readwrite', s => s.delete(id)),
      temizle: ad => is(ad, 'readwrite', s => s.clear()),
      cokYaz: (ad, l) => is(ad, 'readwrite', s => { for (const o of l) s.put(o); return { result: l.length }; })
    };
  })();

  /* ═════════ Telefon numarası ═════════ */
  const rakam = t => String(t || '').replace(/\D/g, '');
  const son10 = t => rakam(t).slice(-10);
  function ulkeli(t, ulke = '90') {        // WhatsApp için: yalnızca rakam, ülke kodlu
    const s = String(t || '').trim(), r = rakam(s);
    if (!r) return '';
    if (s.startsWith('+')) return r;
    if (r.startsWith('00')) return r.slice(2);
    if (r.startsWith('0')) return ulke + r.slice(1);
    if (r.length === 10) return ulke + r;
    return r;
  }

  /* ═════════ Doğum günü ═════════ */
  function dogumAyrac(s) {                 // 'YYYY-MM-DD' ya da '--MM-DD' → {y,m,d}
    const m = /^(?:(\d{4})|-)-(\d{2})-(\d{2})$/.exec(s || ''); if (!m) return null;
    const mo = +m[2], d = +m[3]; if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    return { y: m[1] ? +m[1] : 0, m: mo, d };
  }
  function sonrakiDogum(s, bugun = new Date()) {   // {tarih, gun, yas}
    const b = dogumAyrac(s); if (!b) return null;
    const t0 = new Date(bugun.getFullYear(), bugun.getMonth(), bugun.getDate());
    const yap = y => { const gunSay = new Date(y, b.m, 0).getDate(); return new Date(y, b.m - 1, Math.min(b.d, gunSay)); };
    let t = yap(t0.getFullYear()); if (t < t0) t = yap(t0.getFullYear() + 1);
    return { tarih: t, gun: Math.round((t - t0) / 864e5), yas: b.y ? t.getFullYear() - b.y : 0 };
  }

  /* ═════════ vCard okuma ═════════ */
  const aç = s => String(s).replace(/\\([nN,;\\])/g, (_, c) => c === 'n' || c === 'N' ? '\n' : c);
  function qpCoz(s, charset) {
    const b = []; const t = s.replace(/=\r?\n/g, '');
    for (let i = 0; i < t.length; i++) { if (t[i] === '=' && /^[0-9A-Fa-f]{2}$/.test(t.substr(i + 1, 2))) { b.push(parseInt(t.substr(i + 1, 2), 16)); i += 2; } else b.push(t.charCodeAt(i) & 255); }
    try { return new TextDecoder(/utf-?8/i.test(charset || 'utf-8') ? 'utf-8' : charset).decode(new Uint8Array(b)); } catch { return new TextDecoder().decode(new Uint8Array(b)); }
  }
  const tipBul = tipler => { const t = tipler.join(',').toLowerCase(); return /cell|mobile|iphone/.test(t) ? 'cep' : /home/.test(t) ? 'ev' : /work/.test(t) ? 'is' : 'diger'; };
  const bdayTemiz = v => {
    v = String(v).trim().replace(/T.*$/, ''); let m;
    if ((m = /^(\d{4})-?(\d{2})-?(\d{2})$/.exec(v))) return m[1] === '0000' || m[1] === '1604' ? `--${m[2]}-${m[3]}` : `${m[1]}-${m[2]}-${m[3]}`;
    if ((m = /^--(\d{2})-?(\d{2})$/.exec(v))) return `--${m[1]}-${m[2]}`;
    return '';
  };
  function vcfOku(metin) {
    const sonuc = [];
    const satirlar = String(metin).replace(/\r\n?/g, '\n').replace(/\n[ \t]/g, '').split('\n');
    let kart = null;
    for (let i = 0; i < satirlar.length; i++) {
      let s = satirlar[i];
      if (/^BEGIN:VCARD/i.test(s)) { kart = { ad: '', soyad: '', sirket: '', unvan: '', tel: [], eposta: [], adres: '', dogum: '', not: '', grupAd: [], foto: null }; continue; }
      if (/^END:VCARD/i.test(s)) { if (kart && (kart.ad || kart.soyad || kart.sirket || kart.tel.length || kart.eposta.length)) sonuc.push(kart); kart = null; if (sonuc.length >= 20000) break; continue; }
      if (!kart || !s) continue;
      const c = s.indexOf(':'); if (c < 1) continue;
      const bas = s.slice(0, c), parcalar = bas.split(';'), ad = parcalar[0].replace(/^.*\./, '').toUpperCase(), ozel = parcalar.slice(1);
      let deger = s.slice(c + 1);
      const qp = ozel.some(p => /ENCODING=QUOTED-PRINTABLE/i.test(p) || /^QUOTED-PRINTABLE$/i.test(p));
      if (qp) { while (/=$/.test(deger) && i + 1 < satirlar.length) deger = deger.slice(0, -1) + satirlar[++i]; deger = qpCoz(deger, (ozel.find(p => /^CHARSET=/i.test(p)) || '').slice(8)); }
      const tipler = ozel.flatMap(p => /^TYPE=/i.test(p) ? p.slice(5).split(',') : /^[A-Za-z]+$/.test(p) && !/^(VALUE|ENCODING|CHARSET|PREF)$/i.test(p) ? [p] : []);
      const kes = (n, x) => String(x).slice(0, n);
      if (ad === 'N') { const p = deger.split(';').map(aç); if (p[1] || p[0]) { kart.soyad = kes(80, p[0] || ''); kart.ad = kes(80, [p[3], p[1], p[2]].filter(Boolean).join(' ').trim()); } }
      else if (ad === 'FN') { if (!kart.ad && !kart.soyad) { const t = aç(deger).trim().split(/\s+/); kart.soyad = t.length > 1 ? kes(80, t.pop()) : ''; kart.ad = kes(80, t.join(' ')); } }
      else if (ad === 'ORG') kart.sirket = kes(120, aç(deger.split(';')[0]));
      else if (ad === 'TITLE') kart.unvan = kes(120, aç(deger));
      else if (ad === 'TEL') { const n = aç(deger).replace(/^tel:/i, '').trim(); if (n && kart.tel.length < 20) kart.tel.push({ t: tipBul(tipler), n: kes(40, n) }); }
      else if (ad === 'EMAIL') { const e = aç(deger).trim(); if (e && kart.eposta.length < 20) kart.eposta.push({ t: tipBul(tipler), e: kes(120, e) }); }
      else if (ad === 'ADR') kart.adres = kes(300, deger.split(';').map(aç).filter(Boolean).join(', '));
      else if (ad === 'BDAY') kart.dogum = bdayTemiz(deger);
      else if (ad === 'NOTE') kart.not = kes(1000, aç(deger));
      else if (ad === 'CATEGORIES') kart.grupAd = aç(deger).split(',').map(x => x.trim()).filter(Boolean).slice(0, 10).map(x => kes(40, x));
      else if (ad === 'PHOTO') {
        try {
          let b64 = '', tip = 'image/jpeg'; const dm = /^data:([^;]+);base64,(.*)$/i.exec(deger);
          if (dm) { tip = dm[1]; b64 = dm[2]; } else if (ozel.some(p => /ENCODING=(b|BASE64)/i.test(p) || /^(b|BASE64)$/i.test(p))) { b64 = deger; if (tipler.some(t => /png/i.test(t))) tip = 'image/png'; }
          if (b64 && b64.length < 4e6) kart.foto = new Blob([Uint8Array.from(atob(b64.replace(/\s/g, '')), ch => ch.charCodeAt(0))], { type: tip });
        } catch { /* bozuk fotoğraf: atla */ }
      }
    }
    return sonuc;
  }

  /* ═════════ vCard yazma ═════════ */
  const kac = s => String(s ?? '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  const kat = s => { const o = []; let t = s; while (t.length > 75) { o.push(t.slice(0, 75)); t = ' ' + t.slice(75); } o.push(t); return o.join('\r\n'); };
  const TIPAD = { cep: 'CELL', ev: 'HOME', is: 'WORK', diger: 'OTHER' };
  async function blobB64(b) { const u = new Uint8Array(await b.arrayBuffer()); let s = ''; for (let i = 0; i < u.length; i += 8192) s += String.fromCharCode(...u.subarray(i, i + 8192)); return btoa(s); }
  async function vcfYaz(liste, grupAd) {
    const o = [];
    for (const k of liste) {
      const l = ['BEGIN:VCARD', 'VERSION:3.0', `N:${kac(k.soyad)};${kac(k.ad)};;;`, `FN:${kac([k.ad, k.soyad].filter(Boolean).join(' ') || k.sirket || 'İsimsiz')}`];
      if (k.sirket) l.push(`ORG:${kac(k.sirket)}`); if (k.unvan) l.push(`TITLE:${kac(k.unvan)}`);
      for (const t of k.tel) l.push(`TEL;TYPE=${TIPAD[t.t] || 'OTHER'}:${kac(t.n)}`);
      for (const e of k.eposta) l.push(`EMAIL;TYPE=${TIPAD[e.t] || 'OTHER'}:${kac(e.e)}`);
      if (k.adres) l.push(`ADR;TYPE=HOME:;;${kac(k.adres)};;;;`);
      if (k.dogum) l.push(`BDAY:${k.dogum.startsWith('--') ? k.dogum : k.dogum}`);
      if (k.not) l.push(`NOTE:${kac(k.not)}`);
      const gl = (k.grup || []).map(id => grupAd(id)).filter(Boolean); if (gl.length) l.push(`CATEGORIES:${gl.map(kac).join(',')}`);
      if (k.foto) l.push(`PHOTO;ENCODING=b;TYPE=JPEG:${await blobB64(k.foto)}`);
      l.push('END:VCARD'); o.push(l.map(kat).join('\r\n'));
    }
    return new Blob([o.join('\r\n') + '\r\n'], { type: 'text/vcard;charset=utf-8' });
  }

  /* ═════════ Fotoğraf küçültme ═════════ */
  async function fotoKucult(blob, en = 320) {
    try {
      const bmp = await createImageBitmap(blob, { imageOrientation: 'from-image' }), m = Math.min(bmp.width, bmp.height), k = Math.min(1, en / m), c = document.createElement('canvas');
      c.width = c.height = Math.max(1, Math.round(m * k)); const x = c.getContext('2d'); x.imageSmoothingQuality = 'high';
      x.drawImage(bmp, (bmp.width - m) / 2, (bmp.height - m) / 2, m, m, 0, 0, c.width, c.height); bmp.close?.();
      return await new Promise(r => c.toBlob(r, 'image/jpeg', .85));
    } catch { return null; }
  }

  kok.KE = { DB, rakam, son10, ulkeli, dogumAyrac, sonrakiDogum, vcfOku, vcfYaz, fotoKucult, pad, sayi };
})(window);
