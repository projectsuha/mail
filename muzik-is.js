/* ───────────── Müzik · motor ─────────────
   Veritabanı (IndexedDB), etiket okuma (ID3v1/v2, MP4/M4A, FLAC), kapak küçültme, süre okuma. Ağ isteği yapmaz. */
(function (kok) {
  'use strict';
  const pad = n => String(n).padStart(2, '0');
  const sayi = (v, a, b, d) => { v = +v; return Number.isFinite(v) ? Math.min(b, Math.max(a, v)) : d; };

  /* ═════════ IndexedDB ═════════ */
  const DB = (() => {
    let p = null;
    const ac = () => p || (p = new Promise((res, rej) => {
      const r = indexedDB.open('suha-muzik', 1);
      r.onupgradeneeded = () => { const d = r.result; d.createObjectStore('sarki', { keyPath: 'id' }); d.createObjectStore('dosya', { keyPath: 'id' }); d.createObjectStore('liste', { keyPath: 'id' }); };
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    }));
    const is = async (ad, mod, f) => { const d = await ac(); return new Promise((res, rej) => { const t = d.transaction(ad, mod), s = t.objectStore(ad); const q = f(s); t.oncomplete = () => res(q?.result); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error || new Error('iptal')); }); };
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

  /* ═════════ Etiket okuma ═════════ */
  const ucYaz = (b, enc) => {
    if (!b.length) return '';
    try {
      if (enc === 1) { const le = b[0] === 0xFF && b[1] === 0xFE, be = b[0] === 0xFE && b[1] === 0xFF; return new TextDecoder(be ? 'utf-16be' : 'utf-16le').decode(le || be ? b.slice(2) : b); }
      if (enc === 2) return new TextDecoder('utf-16be').decode(b);
      if (enc === 3) return new TextDecoder('utf-8').decode(b);
    } catch { /* aşağıya düş */ }
    return new TextDecoder('windows-1254').decode(b);
  };
  const temizMetin = s => String(s || '').replace(/\0+$/g, '').replace(/[\u0000-\u001f]/g, ' ').trim();
  const sy4 = (b, o) => ((b[o] & 127) << 21) | ((b[o + 1] & 127) << 14) | ((b[o + 2] & 127) << 7) | (b[o + 3] & 127);
  const u32 = (b, o) => ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;

  function id3Oku(b) {
    const o = { baslik: '', sanatci: '', album: '', no: 0, kapak: null };
    if (b.length < 10 || b[0] !== 0x49 || b[1] !== 0x44 || b[2] !== 0x33) return null;
    const ver = b[3], boy = Math.min(sy4(b, 6) + 10, b.length); let p = 10;
    if (b[5] & 0x40) { const eh = ver === 4 ? sy4(b, p) : u32(b, p) + 4; p += eh; }       // genişletilmiş başlık
    const k = ver === 2 ? 3 : 4;
    while (p + (ver === 2 ? 6 : 10) <= boy) {
      const id = String.fromCharCode(...b.slice(p, p + k)); if (!/^[A-Z0-9]+$/.test(id)) break;
      let n, h;
      if (ver === 2) { n = (b[p + 3] << 16) | (b[p + 4] << 8) | b[p + 5]; h = 6; } else { n = ver === 4 ? sy4(b, p + 4) : u32(b, p + 4); h = 10; }
      if (n <= 0 || p + h + n > b.length) break;
      const d = b.subarray(p + h, p + h + n), enc = d[0];
      const metin = () => temizMetin(ucYaz(d.subarray(1), enc));
      if (id === 'TIT2' || id === 'TT2') o.baslik = metin();
      else if (id === 'TPE1' || id === 'TP1') o.sanatci = metin();
      else if (id === 'TALB' || id === 'TAL') o.album = metin();
      else if (id === 'TRCK' || id === 'TRK') o.no = parseInt(metin(), 10) || 0;
      else if ((id === 'APIC' || id === 'PIC') && !o.kapak) {
        let i = 1;
        if (id === 'PIC') i += 3; else { while (i < d.length && d[i] !== 0) i++; i++; }       // MIME
        i++;                                                                                 // resim türü
        if (enc === 1 || enc === 2) { while (i + 1 < d.length && !(d[i] === 0 && d[i + 1] === 0)) i += 2; i += 2; } else { while (i < d.length && d[i] !== 0) i++; i++; }   // açıklama
        if (i < d.length) { const r = d.subarray(i); const tip = r[0] === 0x89 ? 'image/png' : 'image/jpeg'; o.kapak = new Blob([r.slice()], { type: tip }); }
      }
      p += h + n;
    }
    return o;
  }
  function id3v1(b) {
    if (b.length < 128) return null; const t = b.subarray(b.length - 128); if (t[0] !== 0x54 || t[1] !== 0x41 || t[2] !== 0x47) return null;
    const m = (x, y) => temizMetin(new TextDecoder('windows-1254').decode(t.subarray(x, y)));
    return { baslik: m(3, 33), sanatci: m(33, 63), album: m(63, 93), no: t[125] === 0 && t[126] ? t[126] : 0, kapak: null };
  }
  async function mp4Oku(file) {
    const o = { baslik: '', sanatci: '', album: '', no: 0, kapak: null };
    const kutu = async (bas, son) => {
      const l = []; let p = bas;
      while (p + 8 <= son) {
        const h = new Uint8Array(await file.slice(p, p + 16).arrayBuffer()); let n = u32(h, 0); const tip = String.fromCharCode(...h.slice(4, 8)); let hb = 8;
        if (n === 1) { n = u32(h, 12); hb = 16; } else if (n === 0) n = son - p;
        if (n < hb || p + n > son) break;
        l.push({ tip, bas: p + hb, son: p + n }); p += n;
      }
      return l;
    };
    const moov = (await kutu(0, file.size)).find(k => k.tip === 'moov'); if (!moov || moov.son - moov.bas > 40e6) return null;
    const udta = (await kutu(moov.bas, moov.son)).find(k => k.tip === 'udta'); if (!udta) return null;
    const meta = (await kutu(udta.bas, udta.son)).find(k => k.tip === 'meta'); if (!meta) return null;
    const ilst = (await kutu(meta.bas + 4, meta.son)).find(k => k.tip === 'ilst'); if (!ilst) return null;
    for (const it of await kutu(ilst.bas, ilst.son)) {
      const dk = (await kutu(it.bas, it.son)).find(k => k.tip === 'data'); if (!dk) continue;
      const v = new Uint8Array(await file.slice(dk.bas + 8, dk.son).arrayBuffer());
      const ad = it.tip.replace('\xa9', '©');
      if (ad === '©nam') o.baslik = temizMetin(new TextDecoder().decode(v));
      else if (ad === '©ART' || ad === 'aART') { if (!o.sanatci || ad === '©ART') o.sanatci = temizMetin(new TextDecoder().decode(v)); }
      else if (ad === '©alb') o.album = temizMetin(new TextDecoder().decode(v));
      else if (ad === 'trkn') o.no = (v[2] << 8) | v[3];
      else if (ad === 'covr' && v.length > 8) o.kapak = new Blob([v], { type: v[0] === 0x89 ? 'image/png' : 'image/jpeg' });
    }
    return o;
  }
  function flacOku(b) {
    if (b.length < 8 || String.fromCharCode(...b.slice(0, 4)) !== 'fLaC') return null;
    const o = { baslik: '', sanatci: '', album: '', no: 0, kapak: null }; let p = 4;
    while (p + 4 <= b.length) {
      const son = b[p] & 0x80, tip = b[p] & 0x7f, n = (b[p + 1] << 16) | (b[p + 2] << 8) | b[p + 3]; p += 4; if (p + n > b.length) break;
      const d = b.subarray(p, p + n);
      if (tip === 4) {
        const dv = new DataView(d.buffer, d.byteOffset, d.byteLength); let i = 4 + dv.getUint32(0, true); const say = dv.getUint32(i, true); i += 4;
        for (let k = 0; k < say && i + 4 <= d.length; k++) {
          const l = dv.getUint32(i, true); i += 4; const s = new TextDecoder().decode(d.subarray(i, i + l)); i += l; const e = s.indexOf('='); if (e < 0) continue;
          const a = s.slice(0, e).toUpperCase(), v = temizMetin(s.slice(e + 1));
          if (a === 'TITLE') o.baslik = v; else if (a === 'ARTIST') o.sanatci = o.sanatci || v; else if (a === 'ALBUM') o.album = v; else if (a === 'TRACKNUMBER') o.no = parseInt(v, 10) || 0;
        }
      } else if (tip === 6 && !o.kapak) {
        const dv = new DataView(d.buffer, d.byteOffset, d.byteLength); let i = 4; const ml = dv.getUint32(i); i += 4 + ml; const dl = dv.getUint32(i); i += 4 + dl + 16; const bl = dv.getUint32(i); i += 4;
        if (i + bl <= d.length && bl > 8) o.kapak = new Blob([d.slice(i, i + bl)], { type: d[i] === 0x89 ? 'image/png' : 'image/jpeg' });
      }
      p += n; if (son) break;
    }
    return o;
  }
  /* Ogg (Opus / Vorbis): 2. paket etiket (Vorbis yorumları), kapak METADATA_BLOCK_PICTURE içinde base64 */
  function oggOku(b) {
    if (b.length < 28 || String.fromCharCode(...b.slice(0, 4)) !== 'OggS') return null;
    const paketler = []; let cur = [], p = 0;
    while (p + 27 <= b.length && paketler.length < 2) {
      if (String.fromCharCode(b[p], b[p + 1], b[p + 2], b[p + 3]) !== 'OggS') break;
      const n = b[p + 26]; let q = p + 27 + n; if (q > b.length) break;
      for (let k = 0; k < n; k++) { const l = b[p + 27 + k]; if (q + l > b.length) return null; cur.push(b.subarray(q, q + l)); q += l; if (l < 255) { paketler.push(cur); cur = []; if (paketler.length >= 2) break; } }
      p = q;
    }
    if (paketler.length < 2) return null;
    const parca = paketler[1], tam = new Uint8Array(parca.reduce((t, x) => t + x.length, 0)); let z = 0; for (const x of parca) { tam.set(x, z); z += x.length; }
    const bas = String.fromCharCode(...tam.slice(0, 8)); let i = bas === 'OpusTags' ? 8 : (tam[0] === 3 && String.fromCharCode(...tam.slice(1, 7)) === 'vorbis' ? 7 : -1); if (i < 0) return null;
    const o = { baslik: '', sanatci: '', album: '', no: 0, kapak: null }, dv = new DataView(tam.buffer, tam.byteOffset, tam.byteLength);
    i += 4 + dv.getUint32(i, true); if (i + 4 > tam.length) return o; const say = dv.getUint32(i, true); i += 4;
    for (let k = 0; k < say && i + 4 <= tam.length; k++) {
      const l = dv.getUint32(i, true); i += 4; if (i + l > tam.length) break; const t = new TextDecoder().decode(tam.subarray(i, i + l)); i += l; const e = t.indexOf('='); if (e < 0) continue;
      const a = t.slice(0, e).toUpperCase(), v = t.slice(e + 1);
      if (a === 'TITLE') o.baslik = temizMetin(v); else if (a === 'ARTIST') o.sanatci = o.sanatci || temizMetin(v); else if (a === 'ALBUM') o.album = temizMetin(v); else if (a === 'TRACKNUMBER') o.no = parseInt(v, 10) || 0;
      else if (a === 'METADATA_BLOCK_PICTURE' && !o.kapak) {
        try { const raw = Uint8Array.from(atob(v), c => c.charCodeAt(0)), d2 = new DataView(raw.buffer); let j = 4; const ml = d2.getUint32(j); j += 4 + ml; const dl = d2.getUint32(j); j += 4 + dl + 16; const bl = d2.getUint32(j); j += 4; if (j + bl <= raw.length && bl > 8) o.kapak = new Blob([raw.slice(j, j + bl)], { type: raw[j] === 0x89 ? 'image/png' : 'image/jpeg' }); } catch {}
      }
    }
    return o;
  }
  const adTahmin = ad => {
    const t = ad.replace(/\.[^.]+$/, '').replace(/[_]+/g, ' ').replace(/^\d{1,3}[\s.\-)]+/, '').trim(), m = t.match(/^(.{1,80}?)\s+-\s+(.+)$/);
    return m ? { sanatci: m[1].trim(), baslik: m[2].trim() } : { sanatci: '', baslik: t };
  };
  async function etiketOku(file) {
    let o = null;
    try {
      const bas = new Uint8Array(await file.slice(0, 8 * 1048576).arrayBuffer());
      if (bas[0] === 0x49 && bas[1] === 0x44 && bas[2] === 0x33) o = id3Oku(bas);
      else if (bas[0] === 0x66 && bas[1] === 0x4C) o = flacOku(bas);
      else if (bas[0] === 0x4F && bas[1] === 0x67 && bas[2] === 0x67 && bas[3] === 0x53) o = oggOku(bas);
      else if (/\.(m4a|mp4|m4b|aac)$/i.test(file.name) || (bas[4] === 0x66 && bas[5] === 0x74 && bas[6] === 0x79 && bas[7] === 0x70)) o = await mp4Oku(file);
      if (!o && /\.mp3$/i.test(file.name)) o = id3v1(new Uint8Array(await file.slice(Math.max(0, file.size - 128)).arrayBuffer()));
    } catch { o = null; }
    const t = adTahmin(file.name); o = o || { baslik: '', sanatci: '', album: '', no: 0, kapak: null };
    return { baslik: o.baslik || t.baslik || 'Adsız', sanatci: o.sanatci || t.sanatci || '', album: o.album || '', no: o.no || 0, kapak: o.kapak };
  }

  /* ═════════ Kapak ve süre ═════════ */
  async function kapakKucult(blob, en = 400) {
    if (!blob) return null;
    try {
      const bmp = await createImageBitmap(blob), k = Math.min(1, en / Math.max(bmp.width, bmp.height)), c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(bmp.width * k)); c.height = Math.max(1, Math.round(bmp.height * k));
      const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(bmp, 0, 0, c.width, c.height); bmp.close?.();
      return await new Promise(r => c.toBlob(r, 'image/jpeg', .85));
    } catch { return null; }
  }
  function sureOku(file) {
    return new Promise(res => {
      const a = new Audio(), u = URL.createObjectURL(file); let bitti = false;
      const son = v => { if (bitti) return; bitti = true; clearTimeout(z); a.src = ''; URL.revokeObjectURL(u); res(v); };
      const z = setTimeout(() => son(0), 6000);
      a.preload = 'metadata'; a.onloadedmetadata = () => son(Number.isFinite(a.duration) ? Math.round(a.duration) : 0); a.onerror = () => son(-1); a.src = u;
    });
  }
  const sureYaz = s => { s = Math.max(0, Math.round(s || 0)); const h = Math.floor(s / 3600), d = Math.floor(s % 3600 / 60), sn = s % 60; return h ? `${h}:${pad(d)}:${pad(sn)}` : `${d}:${pad(sn)}`; };
  const bayt = n => n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(0) + ' KB' : n < 1073741824 ? (n / 1048576).toFixed(1) + ' MB' : (n / 1073741824).toFixed(2) + ' GB';

  kok.ME = { DB, kimlik, etiketOku, kapakKucult, sureOku, sureYaz, bayt, pad, sayi };
})(window);
