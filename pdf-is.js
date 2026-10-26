/* ───────────── PDF işlemleri ─────────────
   Hepsi bu cihazda çalışır: pdf-lib (oluşturma/değiştirme) ve PDF.js (görüntüleme, yazı ve resim okuma).
   Dosya hiçbir yere gönderilmez. Kütüphaneler Tara ile ortaktır (tara-lib). */
'use strict';

const PDFIS = (() => {
  const PL = window.PDFLib;
  const MM = 72 / 25.4;                       // 1 mm = 2,83 pt
  const A4 = [595.28, 841.89];

  class PdfHata extends Error {}

  /* ═════════ Açma ═════════ */
  let pdfjs = null;
  async function pdfjsAl() {
    if (!pdfjs) { pdfjs = await import('./tara-lib/pdf.min.mjs'); pdfjs.GlobalWorkerOptions.workerSrc = 'tara-lib/pdf.worker.min.mjs'; }
    return pdfjs;
  }
  const korumaMesaji = 'Bu PDF şifreli ya da korumalı (kopyalama/düzenleme kısıtı var). Bu tür dosyalar şimdilik açılamıyor; şifre kaldırma bir sonraki sürümde gelecek.';
  async function ac(bytes) {
    try { return await PL.PDFDocument.load(bytes, { updateMetadata: false }); }
    catch (e) {
      if (/encrypt/i.test(e.message)) throw new PdfHata(korumaMesaji);
      throw new PdfHata('Bu dosya açılamadı. Bozuk ya da PDF olmayabilir.');
    }
  }
  // PDF.js veriyi işçiye taşır (asıl dizi boşalır), bu yüzden kopyasını verir
  async function goruntuAc(bytes) {
    const L = await pdfjsAl();
    try { return await L.getDocument({ data: new Uint8Array(bytes).slice(), isEvalSupported: false }).promise; }
    catch (e) {
      if (e?.name === 'PasswordException') throw new PdfHata(korumaMesaji);
      throw new PdfHata('Bu dosya açılamadı. Bozuk ya da PDF olmayabilir.');
    }
  }
  const kapat = pdf => { try { (pdf.loadingTask || pdf).destroy?.(); } catch {} };
  const yeni = () => PL.PDFDocument.create({ updateMetadata: false });
  async function kaydet(doc, temiz) {
    if (!temiz) doc.setProducer('Suha PDF');
    return await doc.save({ useObjectStreams: true, updateFieldAppearances: false });
  }

  /* ═════════ Sayfanın görünen hâli (döndürme hesaba katılır) ═════════ */
  const aciAl = p => ((p.getRotation().angle % 360) + 360) % 360;
  function kutu(p) {
    const b = p.getCropBox(), r = aciAl(p);
    return { r, b, W: r % 180 ? b.height : b.width, H: r % 180 ? b.width : b.height };
  }
  // Görünen (ekrandaki) koordinat → sayfanın kendi koordinatı
  function gorseldenSayfaya(k, vx, vy) {
    const { r, b } = k; let x, y;
    if (r === 0) { x = vx; y = vy; } else if (r === 90) { x = b.width - vy; y = vx; }
    else if (r === 180) { x = b.width - vx; y = b.height - vy; } else { x = vy; y = b.height - vx; }
    return [b.x + x, b.y + y];
  }
  // Sayfanın kendi koordinatı → görünen koordinat
  function sayfadanGorsele(k, x, y) {
    const { r, b } = k; x -= b.x; y -= b.y;
    if (r === 0) return [x, y]; if (r === 90) return [y, b.width - x];
    if (r === 180) return [b.width - x, b.height - y]; return [b.height - y, x];
  }

  /* ═════════ Türkçe yazı ═════════
     PDF'in hazır yazı tipi (Helvetica) ğ, ş, ı, İ harflerini içerir ama pdf-lib bunları yazamaz.
     Kendi kodlamamızı tanımlarız: boş kodlara bu harflerin adlarını koyarız (her PDF okuyucu anlar, yazı seçilebilir kalır). */
  const TR_KOD = { 'Ğ': 0x81, 'ğ': 0x8D, 'Ş': 0x8F, 'ş': 0x90, 'İ': 0x9D, 'ı': 0x7F };
  const TR_FARK = [0x7F, 'dotlessi', 0x81, 'Gbreve', 0x8D, 'gbreve', 0x8F, 'Scedilla', 0x90, 'scedilla', 0x9D, 'Idotaccent'];
  const TR_BENZER = { 'Ğ': 'G', 'ğ': 'g', 'Ş': 'S', 'ş': 's', 'İ': 'I', 'ı': 'i' };
  function kodla(s) {
    const out = [];
    for (const ch of String(s)) {
      const c = ch.codePointAt(0);
      if (TR_KOD[ch]) out.push(TR_KOD[ch]);
      else if ((c >= 0x20 && c < 0x7F) || (c >= 0xA0 && c <= 0xFF)) out.push(c);
      else if (CP1252[c]) out.push(CP1252[c]);
      else if (c === 0x0130) out.push(0x9D);
      else out.push(0x3F);   // yazı tipinde olmayan işaret → ?
    }
    return out;
  }
  const hex = arr => arr.map(b => b.toString(16).padStart(2, '0')).join('');
  // Genişlik ölçmek için ayrı, kaydedilmeyen bir belge
  let olcu = null;
  async function olcuAl() {
    if (!olcu) { const d = await PL.PDFDocument.create(); olcu = { n: await d.embedFont(PL.StandardFonts.Helvetica), k: await d.embedFont(PL.StandardFonts.HelveticaBold) }; }
    return olcu;
  }
  function genislik(metin, boyut, kalin) {
    const f = kalin ? olcu.k : olcu.n;
    const s = [...String(metin)].map(ch => {
      if (TR_BENZER[ch]) return TR_BENZER[ch];
      const c = ch.codePointAt(0);
      return (c >= 0x20 && c < 0x7F) || (c >= 0xA0 && c <= 0xFF) || CP1252[c] ? ch : '?';
    }).join('');
    try { return f.widthOfTextAtSize(s, boyut); } catch { return s.length * boyut * 0.55; }
  }
  const yaziTipleri = new WeakMap(), sayfaKaynak = new WeakMap(), sarili = new WeakSet();
  function yaziTipi(doc, kalin) {
    let t = yaziTipleri.get(doc); if (!t) yaziTipleri.set(doc, t = {});
    const k = kalin ? 'k' : 'n';
    if (!t[k]) {
      const c = doc.context;
      t[k] = c.register(c.obj({ Type: 'Font', Subtype: 'Type1', BaseFont: kalin ? 'Helvetica-Bold' : 'Helvetica',
        Encoding: c.obj({ Type: 'Encoding', BaseEncoding: 'WinAnsiEncoding', Differences: TR_FARK }) }));
    }
    return t[k];
  }
  function kaynak(doc, page, tur, anahtar, yap) {
    let m = sayfaKaynak.get(page.node); if (!m) sayfaKaynak.set(page.node, m = {});
    const k = tur + anahtar;
    if (!m[k]) m[k] = yap();
    return m[k];
  }
  // Sayfadaki mevcut çizimler kendi ayarlarını açık bırakmış olabilir; önce onları paketle ki eklediğimiz yazı kaymasın
  function sar(doc, page) {
    if (sarili.has(page.node)) return;
    const c = doc.context;
    const bas = c.register(c.contentStream([PL.pushGraphicsState()])), son = c.register(c.contentStream([PL.popGraphicsState()]));
    page.node.wrapContentStreams(bas, son);
    sarili.add(page.node);
  }
  function saydamlik(doc, page, a) {
    if (a >= 1) return null;
    return kaynak(doc, page, 'gs', a, () => {
      const c = doc.context;
      return page.node.newExtGState('SuhaGS', c.register(c.obj({ Type: 'ExtGState', ca: a, CA: a })));
    });
  }
  // Görünen koordinatlarla yazı yaz (x, y = yazının sol alt çizgisi; aci = görünen açı, derece)
  function yaz(doc, page, metin, { x, y, boyut = 11, kalin = false, renk = [0, 0, 0], saydam = 1, aci = 0, k = kutu(page) }) {
    sar(doc, page);
    const f = kaynak(doc, page, 'f', kalin ? 'k' : 'n', () => page.node.newFontDictionary('SuhaTR', yaziTipi(doc, kalin)));
    const gs = saydamlik(doc, page, saydam);
    const [px, py] = gorseldenSayfaya(k, x, y), rad = (aci + k.r) * Math.PI / 180;
    page.pushOperators(PL.pushGraphicsState(), ...(gs ? [PL.setGraphicsState(gs)] : []), PL.beginText(), PL.setFontAndSize(f, boyut),
      PL.setFillingRgbColor(renk[0], renk[1], renk[2]), PL.rotateAndSkewTextRadiansAndTranslate(rad, 0, 0, px, py),
      PL.showText(PL.PDFHexString.of(hex(kodla(metin)))), PL.endText(), PL.popGraphicsState());
  }

  /* ═════════ Sayfa seçimi: "1-3, 5, 8-" ═════════ */
  function aralikCoz(metin, toplam) {
    const out = [], s = String(metin || '').replace(/\s/g, '');
    if (!s) return null;
    for (const p of s.split(/[,;]/)) {
      if (!p) continue;
      const m = p.match(/^(\d*)-(\d*)$/);
      if (m) {
        const a = m[1] ? +m[1] : 1, b = m[2] ? +m[2] : toplam;
        if (!a || !b || a > toplam) throw new PdfHata(`"${p}" sayfa aralığı geçersiz (belgede ${toplam} sayfa var)`);
        for (let i = a; a <= b ? i <= Math.min(b, toplam) : i >= b; a <= b ? i++ : i--) out.push(i - 1);
      } else if (/^\d+$/.test(p)) {
        const n = +p; if (!n || n > toplam) throw new PdfHata(`${p}. sayfa yok (belgede ${toplam} sayfa var)`);
        out.push(n - 1);
      } else throw new PdfHata(`"${p}" anlaşılamadı. Örnek: 1-3, 5, 8-10`);
    }
    return out;
  }
  function araliktanYazi(liste) {   // [0,1,2,4] → "1-3, 5"
    const s = [...new Set(liste)].sort((a, b) => a - b), out = [];
    for (let i = 0; i < s.length;) { let j = i; while (j + 1 < s.length && s[j + 1] === s[j] + 1) j++; out.push(i === j ? `${s[i] + 1}` : `${s[i] + 1}-${s[j] + 1}`); i = j + 1; }
    return out.join(', ');
  }

  /* ═════════ Resimler ═════════ */
  async function resimCoz(blob) {
    try { return await createImageBitmap(blob, { imageOrientation: 'from-image' }); }
    catch {
      const u = URL.createObjectURL(blob);
      try { const im = new Image(); im.src = u; await im.decode(); return im; }
      catch { throw new PdfHata(`"${blob.name || 'resim'}" açılamadı. Bu resim türü bu tarayıcıda desteklenmiyor olabilir.`); }
      finally { setTimeout(() => URL.revokeObjectURL(u), 1000); }
    }
  }
  const tuvalBlob = (c, tur = 'image/jpeg', q = 0.9) => new Promise((ok, red) => c.toBlob(b => b ? ok(b) : red(new PdfHata('Resim oluşturulamadı (bellek yetmemiş olabilir)')), tur, q));
  // Resmi PDF'e girecek JPEG'e çevir (yön düzeltilir, saydam yerler beyaz olur)
  async function resimJpeg(blob, enUzun) {
    const im = await resimCoz(blob), w0 = im.width, h0 = im.height, k = Math.min(1, enUzun / Math.max(w0, h0));
    const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w0 * k)); c.height = Math.max(1, Math.round(h0 * k));
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0, c.width, c.height);
    im.close?.();
    const b = await tuvalBlob(c, 'image/jpeg', 0.9);
    c.width = c.height = 0;
    return { bytes: new Uint8Array(await b.arrayBuffer()), w: w0 * k, h: h0 * k };
  }
  async function resimSayfasi(doc, blob, { boyut = 'a4', kenar = 0, kalite = 'yuksek' } = {}) {
    const r = await resimJpeg(blob, kalite === 'kucuk' ? 1600 : 3500), img = await doc.embedJpg(r.bytes);
    let W, H;
    if (boyut === 'a4') { [W, H] = r.w > r.h ? [A4[1], A4[0]] : A4; }
    else { const k = 842 / Math.max(r.w, r.h); W = r.w * k + 2 * kenar; H = r.h * k + 2 * kenar; }
    const page = doc.addPage([W, H]), s = Math.min((W - 2 * kenar) / r.w, (H - 2 * kenar) / r.h);
    page.drawImage(img, { x: (W - r.w * s) / 2, y: (H - r.h * s) / 2, width: r.w * s, height: r.h * s });
    return page;
  }

  /* ═════════ Gömülü sayfayı bir kutuya yerleştir (döndürme korunur) ═════════ */
  async function sayfaGom(doc, kaynakSayfa) {
    const b = kaynakSayfa.getCropBox();
    return doc.embedPage(kaynakSayfa, { left: b.x, bottom: b.y, right: b.x + b.width, top: b.y + b.height });
  }
  function yerlestir(hedef, gomulu, kaynakSayfa, [kx, ky, kw, kh]) {
    const k = kutu(kaynakSayfa), w = k.b.width, h = k.b.height;
    const s = Math.min(kw / k.W, kh / k.H), ox = kx + (kw - k.W * s) / 2, oy = ky + (kh - k.H * s) / 2;
    const yer = { 0: [ox, oy], 90: [ox, oy + w * s], 180: [ox + w * s, oy + h * s], 270: [ox + h * s, oy] }[k.r];
    hedef.drawPage(gomulu, { x: yer[0], y: yer[1], xScale: s, yScale: s, rotate: PL.degrees(-k.r) });
  }

  /* ═════════ Araçlar ═════════ */
  // Birleştir: [{ tur: 'pdf'|'resim', bytes?, blob? }]
  async function birlestir(liste, ilerle) {
    const doc = await yeni();
    for (let i = 0; i < liste.length; i++) {
      ilerle?.(i, liste.length);
      const d = liste[i];
      if (d.tur === 'resim') await resimSayfasi(doc, d.blob, { boyut: 'a4', kenar: 0 });
      else {
        const src = await ac(d.bytes);
        (await doc.copyPages(src, src.getPageIndices())).forEach(p => doc.addPage(p));
      }
    }
    return kaydet(doc);
  }
  // Seçilen sayfalardan yeni PDF (sıra ve tekrar korunur)
  async function sayfalardan(src, liste) {
    const doc = await yeni();
    (await doc.copyPages(src, liste)).forEach(p => doc.addPage(p));
    return kaydet(doc);
  }
  async function bol(bytes, gruplar, ilerle) {
    const src = await ac(bytes), out = [];
    for (let i = 0; i < gruplar.length; i++) { ilerle?.(i, gruplar.length); out.push(await sayfalardan(src, gruplar[i])); }
    return out;
  }
  // Sayfa düzenle: plan = [{ k: kaynak sayfa no (0'dan) | null = boş sayfa, d: eklenecek dönüş (90'ın katı) }]
  async function duzenle(bytes, plan) {
    const src = await ac(bytes), doc = await yeni();
    const kopyalar = await doc.copyPages(src, plan.filter(p => p.k != null).map(p => p.k));
    let j = 0, sonBoyut = A4;
    for (const p of plan) {
      if (p.k == null) { const pg = doc.addPage(sonBoyut); if (p.d) pg.setRotation(PL.degrees(p.d)); continue; }
      const pg = kopyalar[j++]; doc.addPage(pg);
      const sz = pg.getSize(); sonBoyut = [sz.width, sz.height];
      if (p.d) pg.setRotation(PL.degrees((aciAl(pg) + p.d) % 360));
    }
    return kaydet(doc);
  }
  async function resimdenPdf(bloblar, ayar, ilerle) {
    const doc = await yeni();
    for (let i = 0; i < bloblar.length; i++) { ilerle?.(i, bloblar.length); await resimSayfasi(doc, bloblar[i], ayar); }
    return kaydet(doc);
  }
  // Damga: sayfa numarası, üst/alt bilgi. alanlar = { us, uo, ua, as, ao, aa } (üst-sol … alt-sağ), yer tutucular {sayfa} {toplam} {tarih} {dosya}
  async function damga(bytes, { alanlar, boyut = 10, kenar = 12, renk = [0.15, 0.15, 0.15], sayfalar = null, baslangic = 1, dosya = '' }) {
    const doc = await ac(bytes); await olcuAl();
    const pages = doc.getPages(), secili = sayfalar ? new Set(sayfalar) : null, tarih = new Date().toLocaleDateString('tr-TR');
    const sayilacak = pages.map((_, i) => i).filter(i => !secili || secili.has(i)), toplam = sayilacak.length + baslangic - 1;
    sayilacak.forEach((i, sira) => {
      const page = pages[i], k = kutu(page), m = kenar * MM;
      for (const [yer, sablon] of Object.entries(alanlar)) {
        if (!sablon) continue;
        const metin = sablon.replace(/\{sayfa\}/g, sira + baslangic).replace(/\{toplam\}/g, toplam).replace(/\{tarih\}/g, tarih).replace(/\{dosya\}/g, dosya);
        const w = genislik(metin, boyut), x = yer[1] === 's' ? m : yer[1] === 'o' ? (k.W - w) / 2 : k.W - m - w;
        const y = yer[0] === 'u' ? k.H - m - boyut * 0.75 : m;
        yaz(doc, page, metin, { x, y, boyut, renk, k });
      }
    });
    return kaydet(doc);
  }
  async function filigran(bytes, { metin, saydam = 0.18, boyut = 0, aci = 45, renk = [0.55, 0.1, 0.1], sayfalar = null, kalin = true, konum = 'orta' }) {
    const doc = await ac(bytes); await olcuAl();
    const pages = doc.getPages(), secili = sayfalar ? new Set(sayfalar) : null;
    pages.forEach((page, i) => {
      if (secili && !secili.has(i)) return;
      const k = kutu(page), a = aci * Math.PI / 180, w1 = genislik(metin, 1, kalin);
      // Otomatik boyut: yazı sayfanın içine sığsın
      const sigan = Math.min(k.W / (Math.abs(Math.cos(a)) + 0.0001), k.H / (Math.abs(Math.sin(a)) + 0.0001)) * 0.8;
      const b = boyut || Math.max(8, Math.min(150, sigan / w1));
      const w = w1 * b, cap = b * 0.7;
      const merkezler = konum === 'doseli'
        ? [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75], [0.5, 0.5]].map(([fx, fy]) => [k.W * fx, k.H * fy])
        : [[k.W / 2, k.H / 2]];
      const bb = konum === 'doseli' ? b * 0.5 : b, ww = konum === 'doseli' ? w * 0.5 : w, cc = konum === 'doseli' ? cap * 0.5 : cap;
      for (const [cx, cy] of merkezler) {
        const x = cx - (ww / 2) * Math.cos(a) + (cc / 2) * Math.sin(a), y = cy - (ww / 2) * Math.sin(a) - (cc / 2) * Math.cos(a);
        yaz(doc, page, metin, { x, y, boyut: bb, kalin, renk, saydam, aci, k });
      }
    });
    return kaydet(doc);
  }
  // Kırp: kenarlar (mm) görünen yöne göre: { ust, sag, alt, sol }
  async function kirp(bytes, { ust = 0, sag = 0, alt = 0, sol = 0 }, sayfalar = null) {
    const doc = await ac(bytes), secili = sayfalar ? new Set(sayfalar) : null;
    doc.getPages().forEach((page, i) => {
      if (secili && !secili.has(i)) return;
      const k = kutu(page), v = { ust: ust * MM, sag: sag * MM, alt: alt * MM, sol: sol * MM };
      const m = { 0: { l: v.sol, t: v.ust, r: v.sag, b: v.alt }, 90: { l: v.ust, t: v.sag, r: v.alt, b: v.sol },
        180: { l: v.sag, t: v.alt, r: v.sol, b: v.ust }, 270: { l: v.alt, t: v.sol, r: v.ust, b: v.sag } }[k.r];
      const w = k.b.width - m.l - m.r, h = k.b.height - m.t - m.b;
      if (w < 20 || h < 20) throw new PdfHata(`${i + 1}. sayfa için kesilecek kısım sayfadan büyük`);
      page.setCropBox(k.b.x + m.l, k.b.y + m.b, w, h);
      page.setMediaBox(k.b.x + m.l, k.b.y + m.b, w, h);
    });
    return kaydet(doc);
  }
  // Kesilen kısmı dosyadan da sil: seçili sayfalar resme çevrilip kırpılır (kesilen kısım geri getirilemez)
  async function kirpSil(bytes, { ust = 0, sag = 0, alt = 0, sol = 0 }, sayfalar = null, { dpi = 200, iptal } = {}, ilerle) {
    const src = await ac(bytes), pdf = await goruntuAc(bytes), doc = await yeni(), secili = sayfalar ? new Set(sayfalar) : null;
    try {
      const kopyalar = await doc.copyPages(src, src.getPageIndices());
      for (let i = 0; i < kopyalar.length; i++) {
        if (iptal?.()) throw new PdfHata('İptal edildi');
        ilerle?.(i, kopyalar.length);
        if (secili && !secili.has(i)) { doc.addPage(kopyalar[i]); continue; }
        const p = await pdf.getPage(i + 1), v1 = p.getViewport({ scale: 1 }), s = guvenliOlcek(v1, dpi);
        const m = { ust: ust * MM, sag: sag * MM, alt: alt * MM, sol: sol * MM }, W = v1.width - m.sol - m.sag, H = v1.height - m.ust - m.alt;
        if (W < 20 || H < 20) throw new PdfHata(`${i + 1}. sayfa için kesilecek kısım sayfadan büyük`);
        const tam = await sayfaCiz(pdf, i + 1, s);
        const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(W * s)); c.height = Math.max(1, Math.round(H * s));
        c.getContext('2d').drawImage(tam, Math.round(m.sol * s), Math.round(m.ust * s), c.width, c.height, 0, 0, c.width, c.height);
        tam.width = tam.height = 0;
        const jpg = await doc.embedJpg(new Uint8Array(await (await tuvalBlob(c, 'image/jpeg', 0.88)).arrayBuffer()));
        c.width = c.height = 0;
        const pg = doc.addPage([W, H]); pg.drawImage(jpg, { x: 0, y: 0, width: W, height: H });
      }
    } finally { kapat(pdf); }
    return kaydet(doc);
  }
  // Sayfadaki boş (beyaz) kenarları bul: mm cinsinden { ust, sag, alt, sol }
  async function bosKenar(pdf, no = 1) {
    const p = await pdf.getPage(no), v1 = p.getViewport({ scale: 1 }), s = Math.min(2, 900 / Math.max(v1.width, v1.height)), v = p.getViewport({ scale: s });
    const c = document.createElement('canvas'); c.width = Math.round(v.width); c.height = Math.round(v.height);
    const g = c.getContext('2d', { willReadFrequently: true }); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
    await p.render({ canvasContext: g, viewport: v }).promise;
    const d = g.getImageData(0, 0, c.width, c.height).data, W = c.width, H = c.height;
    const dolu = (x, y) => { const i = (y * W + x) * 4; return d[i] < 235 || d[i + 1] < 235 || d[i + 2] < 235; };
    let x0 = W, y0 = H, x1 = -1, y1 = -1;
    for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) if (dolu(x, y)) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    p.cleanup();
    if (x1 < 0) return null;
    const pay = 4 * s * MM, mm = px => Math.max(0, (px - pay) / s / MM);
    return { ust: mm(y0), alt: mm(H - 1 - y1), sol: mm(x0), sag: mm(W - 1 - x1) };
  }
  // A4'e sığdır
  async function a4(bytes, { yon = 'otomatik', kenar = 0 }) {
    const src = await ac(bytes), doc = await yeni();
    for (const sp of src.getPages()) {
      const k = kutu(sp), yatay = yon === 'yatay' || (yon === 'otomatik' && k.W > k.H);
      const [W, H] = yatay ? [A4[1], A4[0]] : A4, pg = doc.addPage([W, H]), m = kenar * MM;
      yerlestir(pg, await sayfaGom(doc, sp), sp, [m, m, W - 2 * m, H - 2 * m]);
    }
    return kaydet(doc);
  }
  // Birden çok sayfayı tek kâğıda: adet 2 (A4 yatay, yan yana) ya da 4 (A4 dikey, 2×2)
  async function cokluSayfa(bytes, { adet = 2, kenar = 8, cizgi = false }) {
    const src = await ac(bytes), doc = await yeni(), sp = src.getPages(), m = kenar * MM, ara = 6 * MM;
    const [W, H] = adet === 2 ? [A4[1], A4[0]] : A4, sut = 2, sat = adet === 2 ? 1 : 2;
    const kw = (W - 2 * m - (sut - 1) * ara) / sut, kh = (H - 2 * m - (sat - 1) * ara) / sat;
    for (let i = 0; i < sp.length; i += adet) {
      const pg = doc.addPage([W, H]);
      for (let j = 0; j < adet && i + j < sp.length; j++) {
        const c = j % sut, r = Math.floor(j / sut), x = m + c * (kw + ara), y = H - m - (r + 1) * kh - r * ara;
        yerlestir(pg, await sayfaGom(doc, sp[i + j]), sp[i + j], [x, y, kw, kh]);
        if (cizgi) pg.drawRectangle({ x, y, width: kw, height: kh, borderColor: PL.rgb(0.8, 0.8, 0.8), borderWidth: 0.6 });
      }
    }
    return kaydet(doc);
  }
  // Sayfayı resim olarak çiz (PDF.js)
  async function sayfaCiz(pdf, no, olcek, arka = '#fff') {
    const p = await pdf.getPage(no), v = p.getViewport({ scale: olcek });
    const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(v.width)); c.height = Math.max(1, Math.round(v.height));
    const g = c.getContext('2d'); g.fillStyle = arka; g.fillRect(0, 0, c.width, c.height);
    await p.render({ canvasContext: g, viewport: v }).promise;
    p.cleanup();
    return c;
  }
  // Çok büyük tuval telefonda çöker: kenarı en fazla 5000 piksel
  const guvenliOlcek = (v1, dpi) => Math.min(dpi / 72, 5000 / Math.max(v1.width, v1.height));
  async function griTon(bytes, { dpi = 150, iptal } = {}, ilerle) {
    const pdf = await goruntuAc(bytes), doc = await yeni();
    try {
      for (let i = 1; i <= pdf.numPages; i++) {
        if (iptal?.()) throw new PdfHata('İptal edildi');
        ilerle?.(i - 1, pdf.numPages);
        const p = await pdf.getPage(i), v1 = p.getViewport({ scale: 1 });
        const c = await sayfaCiz(pdf, i, guvenliOlcek(v1, dpi)), g = c.getContext('2d');
        const im = g.getImageData(0, 0, c.width, c.height), d = im.data;
        for (let j = 0; j < d.length; j += 4) { const y = d[j] * 0.299 + d[j + 1] * 0.587 + d[j + 2] * 0.114; d[j] = d[j + 1] = d[j + 2] = y; }
        g.putImageData(im, 0, 0);
        const jpg = await doc.embedJpg(new Uint8Array(await (await tuvalBlob(c, 'image/jpeg', 0.85)).arrayBuffer()));
        c.width = c.height = 0;
        const pg = doc.addPage([v1.width, v1.height]); pg.drawImage(jpg, { x: 0, y: 0, width: v1.width, height: v1.height });
      }
    } finally { kapat(pdf); }
    return kaydet(doc);
  }
  async function resmeCevir(bytes, { tur = 'jpg', dpi = 150, sayfalar = null, ad = 'sayfa', iptal } = {}, ilerle) {
    const pdf = await goruntuAc(bytes), out = [];
    try {
      const liste = sayfalar || Array.from({ length: pdf.numPages }, (_, i) => i), bas = String(pdf.numPages).length;
      for (let j = 0; j < liste.length; j++) {
        if (iptal?.()) throw new PdfHata('İptal edildi');
        ilerle?.(j, liste.length);
        const no = liste[j] + 1, p = await pdf.getPage(no), v1 = p.getViewport({ scale: 1 });
        const c = await sayfaCiz(pdf, no, guvenliOlcek(v1, dpi), tur === 'png' ? 'rgba(255,255,255,1)' : '#fff');
        const blob = await tuvalBlob(c, tur === 'png' ? 'image/png' : 'image/jpeg', 0.9);
        c.width = c.height = 0;
        out.push({ ad: `${ad} - ${String(no).padStart(bas, '0')}.${tur}`, blob });
      }
    } finally { kapat(pdf); }
    return out;
  }
  // Yazıyı çıkar
  async function metin(bytes, ilerle) {
    const pdf = await goruntuAc(bytes), sayfalar = [];
    try {
      for (let i = 1; i <= pdf.numPages; i++) {
        ilerle?.(i - 1, pdf.numPages);
        const p = await pdf.getPage(i), t = await p.getTextContent();
        let s = '';
        for (const it of t.items) { if (it.str != null) s += it.str; if (it.hasEOL) s += '\n'; }
        sayfalar.push(s.replace(/[ \t]+\n/g, '\n').trim());
        p.cleanup();
      }
    } finally { kapat(pdf); }
    return sayfalar;
  }
  // İçindeki resimleri çıkar
  async function resimler(bytes, { enKucuk = 48, iptal } = {}, ilerle) {
    const L = await pdfjsAl(), pdf = await goruntuAc(bytes), out = [], gorulen = new Set();
    const bekle = (objs, id) => new Promise(ok => { try { objs.get(id, ok); } catch { ok(null); } setTimeout(() => ok(null), 8000); });
    try {
      for (let i = 1; i <= pdf.numPages; i++) {
        if (iptal?.()) throw new PdfHata('İptal edildi');
        ilerle?.(i - 1, pdf.numPages);
        const p = await pdf.getPage(i), ol = await p.getOperatorList();
        let sira = 0;
        for (let j = 0; j < ol.fnArray.length; j++) {
          const fn = ol.fnArray[j];
          if (fn !== L.OPS.paintImageXObject && fn !== L.OPS.paintInlineImageXObject) continue;
          let im;
          if (fn === L.OPS.paintInlineImageXObject) im = ol.argsArray[j][0];
          else {
            const id = ol.argsArray[j][0]; if (gorulen.has(id)) continue; gorulen.add(id);
            im = await bekle(id.startsWith('g_') ? pdf.commonObjs : p.objs, id);
          }
          if (!im || im.width < enKucuk || im.height < enKucuk) continue;
          const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
          const g = c.getContext('2d');
          if (im.bitmap) g.drawImage(im.bitmap, 0, 0);
          else if (im.data) {
            const id2 = g.createImageData(im.width, im.height), d = id2.data, s = im.data, n = im.width * im.height;
            if (im.kind === 3) d.set(s.subarray(0, n * 4));
            else if (im.kind === 2) for (let a = 0, b = 0; a < n; a++) { d[b++] = s[a * 3]; d[b++] = s[a * 3 + 1]; d[b++] = s[a * 3 + 2]; d[b++] = 255; }
            else if (im.kind === 1) { const satir = (im.width + 7) >> 3; for (let y = 0; y < im.height; y++) for (let x = 0; x < im.width; x++) { const v = (s[y * satir + (x >> 3)] >> (7 - (x & 7))) & 1 ? 255 : 0, b = (y * im.width + x) * 4; d[b] = d[b + 1] = d[b + 2] = v; d[b + 3] = 255; } }
            else continue;
            g.putImageData(id2, 0, 0);
          } else continue;
          const foto = im.width * im.height > 250000;
          const blob = await tuvalBlob(c, foto ? 'image/jpeg' : 'image/png', 0.92);
          c.width = c.height = 0;
          out.push({ ad: `sayfa ${i} - resim ${++sira}.${foto ? 'jpg' : 'png'}`, blob, w: im.width, h: im.height });
        }
        p.cleanup();
      }
    } finally { kapat(pdf); }
    return out;
  }

  /* ═════════ Form ═════════ */
  const alanTuru = f => f instanceof PL.PDFTextField ? 'yazi' : f instanceof PL.PDFCheckBox ? 'kutu' : f instanceof PL.PDFDropdown ? 'liste'
    : f instanceof PL.PDFOptionList ? 'secim' : f instanceof PL.PDFRadioGroup ? 'radyo' : f instanceof PL.PDFSignature ? 'imza' : 'diger';
  async function formBilgi(bytes) {
    const doc = await ac(bytes);
    let form; try { form = doc.getForm(); } catch { return { alanlar: [], xfa: false }; }
    const xfa = !!form.acroForm.dict.lookup(PL.PDFName.of('XFA'));
    const sayfaNo = new Map(doc.getPages().map((p, i) => [p.ref.toString(), i]));
    const alanlar = [];
    for (const f of form.getFields()) {
      const tur = alanTuru(f); if (tur === 'diger' || tur === 'imza') continue;
      const a = { ad: f.getName(), tur, salt: f.isReadOnly(), widget: [] };
      try {
        if (tur === 'yazi') { a.deger = f.getText() || ''; a.cok = f.isMultiline(); a.max = f.getMaxLength(); }
        if (tur === 'kutu') a.deger = f.isChecked();
        if (tur === 'liste' || tur === 'secim') { a.secenek = f.getOptions(); a.deger = f.getSelected()[0] || ''; }
        if (tur === 'radyo') { a.secenek = f.getOptions(); a.deger = f.getSelected() || ''; }
      } catch { a.deger = ''; }
      f.acroField.getWidgets().forEach((w, wi) => {
        const P = w.P(), r = w.getRectangle();
        let s = P ? sayfaNo.get(P.toString()) : undefined;
        if (s === undefined) { const ref = doc.context.getObjectRef(w.dict); s = doc.getPages().findIndex(p => (p.node.Annots()?.asArray() || []).some(x => x === ref || x?.toString?.() === ref?.toString())); }
        let deger = null;
        if (tur === 'radyo') { try { deger = w.getOnValue()?.decodeText?.() ?? w.getOnValue()?.asString?.() ?? a.secenek[wi]; } catch { deger = a.secenek[wi]; } }
        a.widget.push({ s, x: r.x, y: r.y, w: r.width, h: r.height, deger });
      });
      alanlar.push(a);
    }
    return { alanlar, xfa };
  }
  // pdf-lib'in hazır yazı tipi Türkçe harfleri yazamaz: bu alanların görünümünü kendi yazı tipimizle hazırlarız
  const winAnsiMi = s => [...String(s)].every(ch => { const c = ch.codePointAt(0); return (c >= 0x20 && c < 0x7F) || (c >= 0xA0 && c <= 0xFF) || !!CP1252[c] || ch === '\n' || ch === '\r'; });
  function daBoyut(f, w) {
    let da = ''; try { da = w.getDefaultAppearance() || f.acroField.getDefaultAppearance() || ''; } catch {}
    const m = da.match(/([\d.]+)\s+Tf/); return m ? +m[1] : 0;
  }
  function gorunumYaz(doc, f, w, metin, cok) {
    const c = doc.context, r = w.getRectangle(), W = r.width, H = r.height, pad = 2;
    let boyut = daBoyut(f, w);
    const satirlar = cok ? String(metin).split(/\r?\n/) : [String(metin).replace(/[\r\n]+/g, ' ')];
    if (!boyut) boyut = cok ? 10 : Math.max(6, Math.min(12, H * 0.68));
    if (!cok) { const gw = genislik(satirlar[0], boyut); if (gw > W - 2 * pad) boyut = Math.max(5, boyut * (W - 2 * pad) / gw); }
    // Alanın kendi arka plan ve çerçeve rengi (varsa)
    const renkOp = (r, dolgu) => !r?.length ? null : r.length === 1 ? (dolgu ? PL.setFillingGrayscaleColor : PL.setStrokingGrayscaleColor)(r[0])
      : r.length === 3 ? (dolgu ? PL.setFillingRgbColor : PL.setStrokingRgbColor)(r[0], r[1], r[2]) : (dolgu ? PL.setFillingCmykColor : PL.setStrokingCmykColor)(r[0], r[1], r[2], r[3]);
    const mk = w.getAppearanceCharacteristics?.(), arka = renkOp(mk?.getBackgroundColor?.(), true), cerceve = renkOp(mk?.getBorderColor?.(), false);
    const zemin = [];
    if (arka) zemin.push(PL.pushGraphicsState(), arka, PL.rectangle(0, 0, W, H), PL.fill(), PL.popGraphicsState());
    if (cerceve) zemin.push(PL.pushGraphicsState(), cerceve, PL.setLineWidth(1), PL.rectangle(0.5, 0.5, W - 1, H - 1), PL.stroke(), PL.popGraphicsState());
    const ops = [PL.beginMarkedContent('Tx'), ...zemin, PL.pushGraphicsState(), PL.rectangle(1, 1, Math.max(0, W - 2), Math.max(0, H - 2)), PL.clip(), PL.endPath(),
      PL.beginText(), PL.setFontAndSize('SuhaTR', boyut), PL.setFillingGrayscaleColor(0)];
    let x = pad, y = cok ? H - pad - boyut * 0.9 : (H - boyut * 0.7) / 2, ilk = true;
    for (const s of satirlar) {
      ops.push(ilk ? PL.moveText(x, y) : PL.moveText(0, -boyut * 1.15), PL.showText(PL.PDFHexString.of(hex(kodla(s)))));
      ilk = false;
    }
    ops.push(PL.endText(), PL.popGraphicsState(), PL.endMarkedContent());
    const akis = c.formXObject(ops, { BBox: [0, 0, W, H], Resources: { Font: { SuhaTR: yaziTipi(doc, false) } } });
    w.setNormalAppearance(c.register(akis));
  }
  async function formDoldur(bytes, degerler, { duzlestir = false } = {}) {
    const doc = await ac(bytes), form = doc.getForm();
    if (form.acroForm.dict.lookup(PL.PDFName.of('XFA'))) form.deleteXFA();
    await olcuAl();
    let yaziTipi0 = null; const hazirTip = async () => yaziTipi0 || (yaziTipi0 = await doc.embedFont(PL.StandardFonts.Helvetica));
    for (const f of form.getFields()) {
      const ad = f.getName(), tur = alanTuru(f), degisti = ad in degerler, v = degerler[ad];
      try {
        if (degisti) {
          if (tur === 'yazi') f.setText(String(v || ''));
          else if (tur === 'kutu') v ? f.check() : f.uncheck();
          else if ((tur === 'liste' || tur === 'secim') && v) f.select(v);
          else if (tur === 'radyo' && v) f.select(v);
        }
        if (!degisti && !duzlestir) continue;
        // Görünüm (kâğıtta nasıl duracağı)
        if (tur === 'yazi' || tur === 'liste') {
          const metin = tur === 'yazi' ? (f.getText() || '') : (f.getSelected()[0] || '');
          if (winAnsiMi(metin)) f.updateAppearances(await hazirTip());
          else for (const w of f.acroField.getWidgets()) gorunumYaz(doc, f, w, metin, tur === 'yazi' && f.isMultiline());
        } else if (tur === 'secim') { if (winAnsiMi(f.getSelected().join(''))) f.updateAppearances(await hazirTip()); }
        else if (tur === 'kutu' || tur === 'radyo') f.updateAppearances();
      } catch (e) { console.warn('Alan doldurulamadı', ad, e); }
    }
    form.acroForm.dict.delete(PL.PDFName.of('NeedAppearances'));
    if (!duzlestir) return kaydet(doc);
    form.flatten({ updateFieldAppearances: false });
    // Silinen alanlara giden kırık bağlantıları sayfalardan temizle
    for (const p of doc.getPages()) {
      const a = p.node.Annots(); if (!a) continue;
      for (let i = a.size() - 1; i >= 0; i--) { const r = a.get(i); if (r instanceof PL.PDFRef && !doc.context.lookup(r)) a.remove(i); }
      if (!a.size()) p.node.delete(PL.PDFName.of('Annots'));
    }
    return kaydet(doc);
  }

  /* ═════════ Belge bilgileri ═════════ */
  const tarihYaz = d => d ? d.toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }) : '';
  async function bilgi(bytes) {
    const doc = await ac(bytes), ok = f => { try { return f() || ''; } catch { return ''; } };
    const xmp = !!doc.catalog.get(PL.PDFName.of('Metadata'));
    const info = ok(() => doc.getInfoDict()), digerAnahtar = info ? info.keys().map(k => k.decodeText?.() || k.toString().slice(1)).filter(k => !['Title', 'Author', 'Subject', 'Keywords', 'Creator', 'Producer', 'CreationDate', 'ModDate', 'Trapped'].includes(k)) : [];
    return {
      baslik: ok(() => doc.getTitle()), yazar: ok(() => doc.getAuthor()), konu: ok(() => doc.getSubject()), anahtar: ok(() => doc.getKeywords()),
      olusturan: ok(() => doc.getCreator()), uretici: ok(() => doc.getProducer()),
      olusma: tarihYaz(ok(() => doc.getCreationDate())), degisme: tarihYaz(ok(() => doc.getModificationDate())),
      xmp, diger: digerAnahtar, sayfa: doc.getPageCount()
    };
  }
  async function bilgiYaz(bytes, { baslik = '', yazar = '', konu = '', anahtar = '', hepsiniSil = false }) {
    const doc = await ac(bytes), info = doc.getInfoDict();
    if (hepsiniSil) for (const k of info.keys()) info.delete(k);
    doc.catalog.delete(PL.PDFName.of('Metadata'));       // XMP: programların sakladığı gizli bilgi bloğu
    doc.catalog.delete(PL.PDFName.of('PieceInfo'));
    doc.getPages().forEach(p => { p.node.delete(PL.PDFName.of('PieceInfo')); p.node.delete(PL.PDFName.of('Metadata')); });
    const ata = (k, v) => v ? info.set(PL.PDFName.of(k), PL.PDFHexString.fromText(v)) : info.delete(PL.PDFName.of(k));
    ata('Title', baslik); ata('Author', yazar); ata('Subject', konu); ata('Keywords', anahtar);
    if (hepsiniSil) ['Creator', 'Producer', 'CreationDate', 'ModDate'].forEach(k => info.delete(PL.PDFName.of(k)));
    return kaydet(doc, true);
  }

  /* ═════════ Zip (birden çok dosyayı tek seferde indirmek için, sıkıştırmasız) ═════════ */
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  async function zip(dosyalar) {
    const enc = new TextEncoder(), parcalar = [], merkez = [], d = new Date();
    const zaman = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), gun = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    let ofs = 0; const adlar = new Set();
    for (const f of dosyalar) {
      let ad = f.ad.replace(/[\\/:*?"<>|]/g, '_'), n = 2; const [g, u] = ad.match(/^(.*?)(\.[^.]*)?$/).slice(1);
      while (adlar.has(ad)) ad = `${g} (${n++})${u || ''}`; adlar.add(ad);
      const veri = f.veri || new Uint8Array(await f.blob.arrayBuffer()), adB = enc.encode(ad), crc = crc32(veri);
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

  return { PdfHata, ac, goruntuAc, pdfjsAl, kutu, aralikCoz, araliktanYazi, birlestir, bol, duzenle, resimdenPdf, damga, filigran, kirp, kirpSil, bosKenar,
    a4, cokluSayfa, griTon, resmeCevir, metin, resimler, formBilgi, formDoldur, bilgi, bilgiYaz, zip, sayfaCiz, sayfadanGorsele, resimCoz, MM };
})();
