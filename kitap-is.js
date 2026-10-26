/* ───────────── Kitaplık · okuma motoru ─────────────
   ZIP/EPUB açma, güvenli HTML temizleme, yazı dosyası çözme, PDF yazı çıkarma, metin konumları.
   Dışarıdan gelen hiçbir kod çalışmaz: EPUB içeriği izin listesiyle yeniden kurulur (innerHTML kullanılmaz). */
(function (kok) {
  'use strict';

  const pad = n => String(n).padStart(2, '0');
  const bugunStr = () => { const t = new Date(); return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`; };
  const gunFark = (a, b) => Math.round((Date.UTC(+b.slice(0, 4), +b.slice(5, 7) - 1, +b.slice(8, 10)) - Date.UTC(+a.slice(0, 4), +a.slice(5, 7) - 1, +a.slice(8, 10))) / 864e5);
  const gunEkle = (s, n) => { const t = new Date(Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10) + n)); return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`; };
  const UTF8 = new TextDecoder('utf-8');

  /* ═════════ SHA-256 → kitap kimliği (aynı dosya iki kez eklenmez, yedek geri yüklenince eşleşir) ═════════ */
  async function kimlik(buf) {
    const h = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(h).slice(0, 8), b => b.toString(16).padStart(2, '0')).join('');
  }

  /* ═════════ ZIP ═════════ */
  const u16 = (v, o) => v.getUint16(o, true), u32 = (v, o) => v.getUint32(o, true);
  const ZIP_EN_FAZLA = 60 * 1024 * 1024;   // tek parça en fazla (zip bombasına karşı)
  function zipAc(buf) {
    const v = new DataView(buf), n = buf.byteLength;
    let e = -1;
    for (let i = n - 22; i >= Math.max(0, n - 65557); i--) if (u32(v, i) === 0x06054b50) { e = i; break; }
    if (e < 0) throw new Error('Geçerli bir ZIP/EPUB dosyası değil');
    const adet = u16(v, e + 10); let o = u32(v, e + 16);
    if (adet === 0xffff || o === 0xffffffff) throw new Error('Çok büyük ZIP biçimi desteklenmiyor');
    const girdi = new Map();
    for (let i = 0; i < adet && o + 46 <= n; i++) {
      if (u32(v, o) !== 0x02014b50) break;
      const bayrak = u16(v, o + 8), yontem = u16(v, o + 10), csize = u32(v, o + 20), usize = u32(v, o + 24), ad = u16(v, o + 28), ek = u16(v, o + 30), yo = u16(v, o + 32), yer = u32(v, o + 42);
      const isim = UTF8.decode(new Uint8Array(buf, o + 46, ad));
      if (!isim.endsWith('/') && !/(^|\/)\.\.(\/|$)/.test(isim)) girdi.set(isim, { yontem, csize, usize, yer, sifreli: !!(bayrak & 1) });
      o += 46 + ad + ek + yo;
    }
    const alt = new Map(); for (const k of girdi.keys()) alt.set(k.toLowerCase(), k);
    const bul = ad => girdi.has(ad) ? ad : (alt.get(String(ad).toLowerCase()) || null);
    async function oku(ad) {
      const k = bul(ad); if (!k) throw new Error('Dosya yok: ' + ad);
      const g = girdi.get(k);
      if (g.sifreli) throw new Error('Şifreli (DRM korumalı) kitap açılamaz');
      if (g.usize > ZIP_EN_FAZLA) throw new Error('Parça çok büyük');
      if (u32(v, g.yer) !== 0x04034b50) throw new Error('Bozuk ZIP');
      const bas = g.yer + 30 + u16(v, g.yer + 26) + u16(v, g.yer + 28);
      if (bas + g.csize > n) throw new Error('Bozuk ZIP');
      const ham = new Uint8Array(buf, bas, g.csize);
      if (g.yontem === 0) return ham.slice();
      if (g.yontem !== 8) throw new Error('Desteklenmeyen sıkıştırma');
      const akis = new Blob([ham]).stream().pipeThrough(new DecompressionStream('deflate-raw')), okur = akis.getReader(), parca = []; let top = 0;
      for (;;) { const { done, value } = await okur.read(); if (done) break; top += value.length; if (top > Math.max(g.usize, 1) * 2 + 4096 || top > ZIP_EN_FAZLA) { okur.cancel(); throw new Error('Parça beklenenden büyük'); } parca.push(value); }
      const c = new Uint8Array(top); let p = 0; for (const x of parca) { c.set(x, p); p += x.length; } return c;
    }
    return { girdi, bul, oku, metin: async ad => UTF8.decode(await oku(ad)) };
  }

  /* ═════════ Yol işlemleri ═════════ */
  function yolCoz(taban, goreli) {
    let g = String(goreli || '').split('#')[0].split('?')[0];
    try { g = decodeURIComponent(g); } catch { /* olduğu gibi */ }
    const kok_ = g.startsWith('/') ? [] : taban.split('/').slice(0, -1);
    for (const p of g.split('/')) { if (p === '..') kok_.pop(); else if (p && p !== '.') kok_.push(p); }
    return kok_.join('/');
  }
  const parcaAyir = href => { const i = String(href).indexOf('#'); return i < 0 ? [href, ''] : [href.slice(0, i), href.slice(i + 1)]; };
  const uzanti = ad => (String(ad).match(/\.([a-z0-9]+)$/i) || [, ''])[1].toLowerCase();
  const RESIM = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml', avif: 'image/avif' };

  /* ═════════ XML yardımcıları ═════════ */
  const xmlAyrisTir = s => { const d = new DOMParser().parseFromString(s, 'application/xml'); return d.querySelector('parsererror') ? null : d; };
  const yerel = (el, ad) => [...el.getElementsByTagNameNS('*', ad)];
  const ilk = (el, ad) => el.getElementsByTagNameNS('*', ad)[0] || null;
  const mt = el => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

  /* ═════════ EPUB ═════════ */
  async function epubAc(buf) {
    const z = zipAc(buf);
    if (z.bul('META-INF/encryption.xml')) {
      const enc = await z.metin('META-INF/encryption.xml').catch(() => '');
      if (/EncryptionMethod/i.test(enc) && !/obfuscation|fontdecrypt|IDPF/i.test(enc) && !/Algorithm="http:\/\/www\.idpf\.org\/2008\/embedding"/.test(enc)) throw new Error('Bu kitap DRM ile korunuyor, açılamaz');
    }
    const kap = xmlAyrisTir(await z.metin('META-INF/container.xml')); if (!kap) throw new Error('EPUB bozuk (container)');
    const opfYol = ilk(kap, 'rootfile')?.getAttribute('full-path'); if (!opfYol) throw new Error('EPUB bozuk (paket dosyası yok)');
    const opf = xmlAyrisTir(await z.metin(opfYol)); if (!opf) throw new Error('EPUB bozuk (paket)');
    const meta = { ad: mt(ilk(opf, 'title')) || '', yazar: yerel(opf, 'creator').map(mt).filter(Boolean).slice(0, 3).join(', '), dil: mt(ilk(opf, 'language')) || '' };
    const bildirim = new Map();   // id → {yol, tur, ozellik}
    for (const it of yerel(opf, 'item')) bildirim.set(it.getAttribute('id'), { yol: yolCoz(opfYol, it.getAttribute('href')), tur: it.getAttribute('media-type') || '', oz: (it.getAttribute('properties') || '').split(/\s+/) });
    const omurga = [];
    for (const r of yerel(opf, 'itemref')) { const m = bildirim.get(r.getAttribute('idref')); if (m && /x?html|xml/.test(m.tur) && z.bul(m.yol)) omurga.push(m.yol); }
    if (!omurga.length) throw new Error('Kitapta okunacak bölüm bulunamadı');
    const bolumler = omurga.map(yol => ({ yol, boyut: Math.max(200, z.girdi.get(z.bul(yol)).usize) }));
    const idx = new Map(bolumler.map((b, i) => [b.yol, i]));
    // Kapak
    let kapakYol = '';
    const kapakId = yerel(opf, 'meta').find(m => m.getAttribute('name') === 'cover')?.getAttribute('content');
    const kapak1 = [...bildirim.values()].find(m => m.oz.includes('cover-image'));
    kapakYol = kapak1?.yol || bildirim.get(kapakId)?.yol || '';
    let kapak = null;
    if (kapakYol && RESIM[uzanti(kapakYol)]) { try { kapak = new Blob([await z.oku(kapakYol)], { type: RESIM[uzanti(kapakYol)] }); } catch { /* kapak yoksa olmasın */ } }
    // İçindekiler
    const icindekiler = [];
    const navM = [...bildirim.values()].find(m => m.oz.includes('nav'));
    const ncxId = ilk(opf, 'spine')?.getAttribute('toc'), ncxM = bildirim.get(ncxId) || [...bildirim.values()].find(m => /ncx/.test(m.tur));
    const hedef = (taban, href) => { const [p, f] = parcaAyir(href || ''); const yol = p ? yolCoz(taban, p) : taban; return idx.has(yol) ? { b: idx.get(yol), a: f } : null; };
    try {
      if (navM && z.bul(navM.yol)) {
        const d = new DOMParser().parseFromString(await z.metin(navM.yol), 'text/html');
        const nav = [...d.querySelectorAll('nav')].find(n => /toc/.test(n.getAttribute('epub:type') || n.getAttribute('type') || '')) || d.querySelector('nav');
        const gez = (ol, der) => { for (const li of ol.children) { if (li.tagName !== 'LI') continue; const a = li.querySelector(':scope > a, :scope > span'); const h = a && a.tagName === 'A' ? hedef(navM.yol, a.getAttribute('href')) : null; const ad = mt(a); if (ad && h) icindekiler.push({ ad: ad.slice(0, 160), ...h, der }); const alt = li.querySelector(':scope > ol'); if (alt && der < 4) gez(alt, der + 1); } };
        const ol = nav?.querySelector('ol'); if (ol) gez(ol, 0);
      }
      if (!icindekiler.length && ncxM && z.bul(ncxM.yol)) {
        const d = xmlAyrisTir(await z.metin(ncxM.yol));
        const gez = (el, der) => { for (const np of [...el.children].filter(c => c.localName === 'navPoint')) { const ad = mt(ilk(ilk(np, 'navLabel') || np, 'text')); const h = hedef(ncxM.yol, ilk(np, 'content')?.getAttribute('src')); if (ad && h) icindekiler.push({ ad: ad.slice(0, 160), ...h, der }); if (der < 4) gez(np, der + 1); } };
        if (d) gez(ilk(d, 'navMap') || d.documentElement, 0);
      }
    } catch { /* içindekiler olmadan da okunur */ }
    const bolumAd = i => icindekiler.find(x => x.b === i && !x.a)?.ad || icindekiler.find(x => x.b === i)?.ad || '';
    return { tur: 'epub', meta, bolumler, icindekiler, kapak, bolumAd, zip: z, idx, ana: opfYol };
  }

  /* ═════════ Güvenli HTML kurma (izin listesi) ═════════ */
  const ATLA = new Set('script style link meta iframe object embed form input button textarea select option audio video canvas noscript template head title base applet frame frameset map area param source track svg math'.split(' '));
  const IZIN = new Set('p div span h1 h2 h3 h4 h5 h6 em i strong b u s strike del ins small sub sup br hr blockquote q cite pre code ul ol li dl dt dd table thead tbody tfoot tr td th caption a img figure figcaption section article aside header footer ruby rt rp mark abbr time kbd samp var dfn address'.split(' '));
  const YER = { center: 'div', font: 'span', big: 'span', tt: 'code', nav: 'div', main: 'div', body: 'div', html: 'div', hgroup: 'div', details: 'div', summary: 'div', label: 'span', bdi: 'span', bdo: 'span', wbr: 'span', picture: 'span', center_: 'div' };
  /* kaynak düğüm → hedef kök. baglam: { yol, resim(yol)→url|null, bolumYolu(yol)→bool, say:{n} } */
  function guvenliKur(kaynak, hedefBelge, baglam) {
    const parca = hedefBelge.createDocumentFragment();
    const SINIR = 150000;
    const gez = (src, hedef) => {
      for (let c = src.firstChild; c; c = c.nextSibling) {
        if (baglam.say.n > SINIR) return;
        if (c.nodeType === 3) { if (c.nodeValue) { hedef.appendChild(hedefBelge.createTextNode(c.nodeValue)); baglam.say.n++; } continue; }
        if (c.nodeType !== 1) continue;
        const ad = (c.localName || '').toLowerCase();
        if (ATLA.has(ad)) {
          if (ad === 'svg') { const im = c.querySelector('image'); const h = im && (im.getAttribute('href') || im.getAttribute('xlink:href')); const u = h && baglam.resim(yolCoz(baglam.yol, h)); if (u) { const g = hedefBelge.createElement('img'); g.src = u; g.alt = ''; hedef.appendChild(g); } }
          continue;
        }
        let tag = IZIN.has(ad) ? ad : (YER[ad] || null);
        if (!tag) { gez(c, hedef); continue; }   // bilinmeyen etiket: içini al, kendisini bırak
        const el = hedefBelge.createElement(tag); baglam.say.n++;
        const id = c.getAttribute('id'); if (id && /^[\w:.\-]{1,100}$/.test(id)) el.setAttribute('data-a', id);
        if (tag === 'a') {
          const href = (c.getAttribute('href') || '').trim();
          if (href.startsWith('#')) el.setAttribute('data-ic', '#' + href.slice(1));
          else if (/^https?:\/\//i.test(href)) el.setAttribute('data-dis', href.slice(0, 500));
          else if (href && !/^[a-z][a-z0-9+.\-]*:/i.test(href)) { const [p, f] = parcaAyir(href); const y = yolCoz(baglam.yol, p); if (baglam.bolumYolu(y)) el.setAttribute('data-ic', y + '#' + f); }
          if (c.getAttribute('epub:type') === 'noteref') el.classList.add('k-dipnot');
        } else if (tag === 'img') {
          const u = baglam.resim(yolCoz(baglam.yol, c.getAttribute('src') || '')); if (!u) continue;
          el.src = u; el.alt = (c.getAttribute('alt') || '').slice(0, 300);
        } else if (tag === 'td' || tag === 'th') {
          for (const k of ['colspan', 'rowspan']) { const v = +c.getAttribute(k); if (v > 1 && v < 50) el.setAttribute(k, v); }
        } else if (tag === 'ol') { const st = +c.getAttribute('start'); if (st > 0 && st < 100000) el.setAttribute('start', st); }
        const al = (c.getAttribute('align') || '').toLowerCase(); if (ad === 'center' || al === 'center') el.classList.add('k-orta');
        gez(c, el); hedef.appendChild(el);
      }
    };
    gez(kaynak, parca);
    return parca;
  }
  function epubBolum(kitap, i, belge) {
    const b = kitap.bolumler[i], z = kitap.zip, url = [];
    return z.metin(b.yol).then(async s => {
      let d = new DOMParser().parseFromString(s, 'application/xhtml+xml');
      if (d.querySelector('parsererror')) d = new DOMParser().parseFromString(s, 'text/html');
      const resimler = new Map(), yol = b.yol;
      // gövdede kullanılan resimleri önceden oku
      const gerek = new Set();
      for (const im of d.querySelectorAll('img, image')) { const h = im.getAttribute('src') || im.getAttribute('href') || im.getAttribute('xlink:href'); if (h) gerek.add(yolCoz(yol, h)); }
      let toplam = 0;
      for (const y of [...gerek].slice(0, 80)) {
        const t = RESIM[uzanti(y)]; if (!t || !z.bul(y)) continue;
        try { const by = await z.oku(y); toplam += by.length; if (toplam > 40 * 1024 * 1024) break; const u = URL.createObjectURL(new Blob([by], { type: t })); url.push(u); resimler.set(y, u); } catch { /* resim yoksa atla */ }
      }
      const baglam = { yol, say: { n: 0 }, resim: y => resimler.get(y) || null, bolumYolu: y => kitap.idx.has(y) };
      const govde = d.body || d.documentElement;
      const parca = guvenliKur(govde, belge, baglam);
      return { parca, url };
    });
  }

  /* ═════════ Yazı dosyası ═════════ */
  function metinCoz(buf) {
    const b = new Uint8Array(buf);
    if (b[0] === 0xff && b[1] === 0xfe) return new TextDecoder('utf-16le').decode(b.subarray(2));
    if (b[0] === 0xfe && b[1] === 0xff) return new TextDecoder('utf-16be').decode(b.subarray(2));
    try { return new TextDecoder('utf-8', { fatal: true }).decode(b).replace(/^﻿/, ''); }
    catch { return new TextDecoder('windows-1254').decode(b); }   // Türkçe eski kodlama
  }
  const BASLIK = /^\s*(bölüm|bolum|kısım|kisim|chapter|bab|part|prolog|epilog|giriş|önsöz|sonsöz)\b[^\n]{0,60}$/i;
  function metinBol(metin) {
    const satirlar = metin.replace(/\r\n?/g, '\n').split('\n');
    const basliklar = []; satirlar.forEach((s, i) => { if (s.length < 70 && BASLIK.test(s) && (!satirlar[i + 1] || satirlar[i + 1].trim() === '' || satirlar[i - 1]?.trim() === '')) basliklar.push(i); });
    const bol = [];
    const ekle = (ad, ss) => { const t = ss.join('\n').trim(); if (t) bol.push({ ad, metin: t }); };
    if (basliklar.length >= 3) {
      if (basliklar[0] > 0) ekle('Başlangıç', satirlar.slice(0, basliklar[0]));
      basliklar.forEach((b, k) => ekle(satirlar[b].trim().slice(0, 80), satirlar.slice(b + 1, basliklar[k + 1] ?? satirlar.length)));
    } else {   // belli bir uzunlukta parçala
      let ph = [], n = 0, no = 1;
      for (const s of satirlar) { ph.push(s); n += s.length + 1; if (n > 14000 && s.trim() === '') { ekle(`Bölüm ${no++}`, ph); ph = []; n = 0; } }
      ekle(`Bölüm ${no}`, ph);
    }
    return bol.length ? bol : [{ ad: 'Metin', metin: metin.trim() || '(Boş dosya)' }];
  }
  function metinParcasi(bolum, belge) {   // düz yazı → paragraf düğümleri
    const f = belge.createDocumentFragment(), t = bolum.metin;
    let ps = t.split(/\n\s*\n/);
    if (ps.length < 3 && t.split('\n').length > 12) ps = t.split('\n');
    const ortKisa = ps.reduce((a, p) => a + p.length, 0) / (ps.length || 1) < 60;
    for (const p of ps.slice(0, 5000)) {
      const s = p.trim(); if (!s) continue;
      const el = belge.createElement(s.length < 70 && BASLIK.test(s) ? 'h2' : 'p');
      const satir = s.split('\n');
      satir.forEach((l, i) => { if (i) el.appendChild(ortKisa || l.length < 45 ? belge.createElement('br') : belge.createTextNode(' ')); el.appendChild(belge.createTextNode(l.trim())); });
      f.appendChild(el);
    }
    return f;
  }

  /* ═════════ PDF yazı çıkarma (Metin modu) ═════════ */
  function pdfSatirlari(ogeler) {
    const sat = []; let y = null, son = null;
    for (const o of ogeler) {
      if (!o.str && !o.hasEOL) continue;
      const yy = o.transform ? o.transform[5] : 0;
      if (son === null || Math.abs(yy - y) > Math.max(2, (o.height || 10) * 0.6)) { son = { s: '', y: yy, h: o.height || 10 }; sat.push(son); y = yy; }
      son.s += o.str; if (o.hasEOL) { y = null; son = null; }
    }
    return sat.map(x => ({ s: x.s.replace(/\s+/g, ' ').trim(), y: x.y, h: x.h })).filter(x => x.s);
  }
  function pdfParagraflar(satirlar) {
    const p = []; let cur = '', onceki = null;
    const medH = satirlar.map(s => s.h).sort((a, b) => a - b)[Math.floor(satirlar.length / 2)] || 10;
    for (const s of satirlar) {
      const bosluk = onceki ? onceki.y - s.y : 0;
      if (cur && bosluk > medH * 1.9) { p.push(cur); cur = ''; }
      if (cur) cur = /[-­]$/.test(cur) && /^[a-zçğıöşü]/.test(s.s) ? cur.slice(0, -1) + s.s : cur + ' ' + s.s; else cur = s.s;
      if (/[.!?…:"”)]$/.test(cur) && cur.length > 40 && onceki && Math.abs(onceki.y - s.y) > medH * 1.35 && false) { p.push(cur); cur = ''; }
      onceki = s;
    }
    if (cur) p.push(cur);
    return p;
  }

  /* ═════════ Metin konumları (vurgu/not bağlantıları) ═════════ */
  function metinHaritasi(kok_) {
    const w = kok_.ownerDocument.createTreeWalker(kok_, NodeFilter.SHOW_TEXT), h = []; let n = 0, d;
    while ((d = w.nextNode())) { const l = d.nodeValue.length; h.push({ d, bas: n, son: n + l }); n += l; }
    return { h, toplam: n };
  }
  function konumBul(harita, dugum, ofs) {   // (düğüm, ofset) → bölüm içi karakter konumu
    for (const x of harita.h) if (x.d === dugum) return x.bas + ofs;
    return -1;
  }
  function aralikSar(kok_, s, e, nitelik, etiket = 'mark') {   // [s,e) aralığındaki yazıları sarar, sarılan düğümleri döner
    const belge = kok_.ownerDocument, harita = metinHaritasi(kok_), sar = [];
    if (e <= s) return sar;
    for (const x of harita.h) {
      if (x.son <= s || x.bas >= e) continue;
      let d = x.d; const bs = Math.max(s, x.bas) - x.bas, bt = Math.min(e, x.son) - x.bas;
      if (bt < d.nodeValue.length) d.splitText(bt);
      if (bs > 0) d = d.splitText(bs);
      const m = belge.createElement(etiket); for (const k in nitelik) m.setAttribute(k, nitelik[k]);
      d.parentNode.insertBefore(m, d); m.appendChild(d); sar.push(m);
    }
    return sar;
  }
  function aralikDuzenle(kok_, ayirt) {   // sarılmış işaretleri kaldır
    for (const m of kok_.querySelectorAll(ayirt)) { const p = m.parentNode; while (m.firstChild) p.insertBefore(m.firstChild, m); p.removeChild(m); p.normalize(); }
  }

  /* ═════════ Okuma günlüğü hesapları ═════════ */
  function seri(gunler, bugun, hedefDk) {   // art arda hedefe ulaşılan gün sayısı (bugün henüz ulaşılmadıysa dünden sayılır)
    const ok = g => (gunler[g] || 0) >= Math.max(1, hedefDk) * 60;
    let g = ok(bugun) ? bugun : gunEkle(bugun, -1), n = 0;
    while (ok(g)) { n++; g = gunEkle(g, -1); }
    return n;
  }
  const sureYaz = sn => { const d = Math.round(sn / 60); if (d < 1) return sn >= 10 ? '1 dk' : '0 dk'; if (d < 60) return d + ' dk'; return `${Math.floor(d / 60)} sa${d % 60 ? ' ' + (d % 60) + ' dk' : ''}`; };
  const dosyaAdi = ad => String(ad).replace(/\.[^.]+$/, '').replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim();

  kok.KB = { pad, bugunStr, gunFark, gunEkle, kimlik, zipAc, yolCoz, uzanti, RESIM, epubAc, epubBolum, guvenliKur, metinCoz, metinBol, metinParcasi, pdfSatirlari, pdfParagraflar,
    metinHaritasi, konumBul, aralikSar, aralikDuzenle, seri, sureYaz, dosyaAdi };
})(typeof window !== 'undefined' ? window : globalThis);
