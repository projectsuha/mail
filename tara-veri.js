/* ───────────── Tara: veriler ve işlemler ─────────────
   Belgeler bu cihazda (IndexedDB) saklanır; fotoğraflar hiçbir sunucuya gönderilmez.
   İstenirse PDF olarak Google Drive'a kaydedilir ya da Gmail ile gönderilir (o zaman Google girişi istenir). */
'use strict';

/* ═════════ Cihazdaki depo (IndexedDB) ═════════ */
const TDB = {
  db: null,
  ac() {
    if (this.db) return Promise.resolve(this.db);
    return new Promise((res, rej) => {
      const r = indexedDB.open('tara', 1);
      r.onupgradeneeded = () => { const d = r.result; d.createObjectStore('belgeler', { keyPath: 'id' }); d.createObjectStore('sayfalar', { keyPath: 'id' }); };
      r.onsuccess = () => { this.db = r.result; res(this.db); };
      r.onerror = () => rej(r.error);
    });
  },
  async islem(depo, kip, f) {
    const d = await this.ac();
    return new Promise((res, rej) => { const t = d.transaction(depo, kip), s = t.objectStore(depo); const r = f(s); t.oncomplete = () => res(r?.result); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); });
  },
  hepsi: depo => TDB.islem(depo, 'readonly', s => s.getAll()),
  al: (depo, id) => TDB.islem(depo, 'readonly', s => s.get(id)),
  koy: (depo, v) => TDB.islem(depo, 'readwrite', s => s.put(v)),
  sil: (depo, id) => TDB.islem(depo, 'readwrite', s => s.delete(id))
};
const tId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

/* ═════════ İşçiler ═════════ */
function isciYap(url) {
  let w = null, no = 0; const bekleyen = new Map();
  const al = () => {
    if (w) return w;
    w = new Worker(url);
    w.onmessage = e => { const b = bekleyen.get(e.data.id); if (!b) return; if (e.data.ilerleme) return b.ilerle?.(e.data.ilerleme); bekleyen.delete(e.data.id); e.data.hata ? b.rej(new Error(e.data.hata)) : b.res(e.data.sonuc); };
    w.onerror = e => { bekleyen.forEach(b => b.rej(new Error(e.message || 'işçi hatası'))); bekleyen.clear(); w = null; };
    return w;
  };
  return (veri, ilerle, aktar = []) => new Promise((res, rej) => { const id = ++no; bekleyen.set(id, { res, rej, ilerle }); al().postMessage({ ...veri, id }, aktar); });
}
const ISCI_VAR = typeof OffscreenCanvas !== 'undefined' && !!OffscreenCanvas.prototype.convertToBlob;
const isci = isciYap('tara-isci.js');
const ocrIsci = isciYap('tara-lib/tara-ocr.js');

// Ana iş parçacığında yedek (OffscreenCanvas olmayan eski tarayıcılar için)
async function resimVerisi(blob, enUzun) {
  const bmp = await createImageBitmap(blob);
  const k = enUzun ? Math.min(1, enUzun / Math.max(bmp.width, bmp.height)) : 1, w = Math.round(bmp.width * k), h = Math.round(bmp.height * k);
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.drawImage(bmp, 0, 0, w, h); bmp.close?.();
  return g.getImageData(0, 0, w, h);
}
function tuvaldenBlob(c, tur = 'image/jpeg', kalite = 0.88) { return new Promise(r => c.toBlob(r, tur, kalite)); }
async function veridenBlob(img, tur, kalite) { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; c.getContext('2d').putImageData(new ImageData(img.data, img.width, img.height), 0, 0); return tuvaldenBlob(c, tur, kalite); }

async function kagitBulBlob(blob) {
  if (ISCI_VAR) try { return await isci({ islem: 'bul', blob }); } catch (e) { console.warn(e); }
  return TaraGoruntu.kagitBul(await resimVerisi(blob, 1200));
}
async function sayfaIsleBlob(blob, sayfa, enUzun = 2400, kalite = 0.88) {
  const s = { kose: sayfa.kose, don: sayfa.don, filtre: sayfa.filtre, parlak: sayfa.parlak, kontrast: sayfa.kontrast, leke: sayfa.leke };
  if (ISCI_VAR) try { return await isci({ islem: 'isle', blob, sayfa: s, enUzun, kalite }); } catch (e) { console.warn(e); }
  const r = TaraGoruntu.isle(await resimVerisi(blob), s, enUzun);
  return { blob: await veridenBlob(r, 'image/jpeg', kalite), w: r.width, h: r.height };
}
async function parcaDuzelt(blob, kose, filtre, enUzun) {
  if (ISCI_VAR) try { return await isci({ islem: 'duzelt', blob, sayfa: { kose, filtre }, enUzun }); } catch (e) { console.warn(e); }
  let r = TaraGoruntu.duzelt(await resimVerisi(blob), kose, enUzun); if (filtre) r = TaraGoruntu.filtre(r, filtre, {});
  return { blob: await veridenBlob(r, 'image/jpeg', 0.9), w: r.width, h: r.height };
}

/* ═════════ Sayfa işleme (önbellekli) ═════════ */
const islemAnahtari = (s, enUzun = 2400) => JSON.stringify([s.kose, s.don || 0, s.filtre, s.parlak || 0, s.kontrast || 0, s.leke || [], enUzun]);
// Sayfanın işlenmiş hâli (görüntüleme ve PDF için). İşlenmiş resim depoda saklanır; ayar değişince yeniden üretilir.
async function sayfaHazirla(s, kaydet = true) {
  const a = islemAnahtari(s);
  if (s.islenmis && s.islemAnahtar === a) return s;
  const r = await sayfaIsleBlob(s.orijinal, s);
  s.islenmis = r.blob; s.w = r.w; s.h = r.h; s.islemAnahtar = a;
  s.ikon = await kucukResim(r.blob, 320);
  if (s.ocrAnahtar && s.ocrAnahtar !== a) { s.metin = ''; s.ocrPdf = null; s.ocrAnahtar = null; }
  if (kaydet) await TDB.koy('sayfalar', s);
  return s;
}
async function kucukResim(blob, boy) {
  const bmp = await createImageBitmap(blob), k = boy / Math.max(bmp.width, bmp.height), c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(bmp.width * k)); c.height = Math.max(1, Math.round(bmp.height * k));
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height); bmp.close?.();
  return c.toDataURL('image/jpeg', 0.75);
}
// Fotoğrafı makul boyuta indirip sakla (bellek ve depo için)
async function orijinalHazirla(blob, enUzun = 3000) {
  const bmp = await createImageBitmap(blob, { imageOrientation: 'from-image' });
  const k = Math.min(1, enUzun / Math.max(bmp.width, bmp.height));
  if (k === 1 && blob.type === 'image/jpeg' && blob.size < 4.5e6) { bmp.close?.(); return blob; }
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height); bmp.close?.();
  return tuvaldenBlob(c, 'image/jpeg', 0.9);
}

/* ═════════ Üst katmanlar: kalem, imza, yazı, filigran ═════════ */
// Sayfanın son hâli (resim + çizimler + öğeler + filigran) bir tuvale çizilir
async function sayfaBirlestir(s, belge, enUzun = 2400) {
  await sayfaHazirla(s);
  const bmp = await createImageBitmap(s.islenmis), k = Math.min(1, enUzun / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  const g = c.getContext('2d'); g.drawImage(bmp, 0, 0, c.width, c.height); bmp.close?.();
  await katmanCiz(g, c.width, c.height, s, belge);
  return c;
}
const resimOnbellek = new Map();
function resimYukle(src) {
  if (resimOnbellek.has(src)) return resimOnbellek.get(src);
  const p = new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  resimOnbellek.set(src, p); return p;
}
async function katmanCiz(g, W, H, s, belge, haric) {
  (s.cizim || []).forEach(c => {
    if (!c.n?.length) return;
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = c.renk; g.lineWidth = Math.max(1, c.k * W);
    if (c.tip === 'vurgu') { g.globalAlpha = 0.35; g.globalCompositeOperation = 'multiply'; g.lineCap = 'square'; }
    g.beginPath(); c.n.forEach(([x, y], i) => i ? g.lineTo(x * W, y * H) : g.moveTo(x * W, y * H)); if (c.n.length === 1) g.lineTo(c.n[0][0] * W + 0.1, c.n[0][1] * H); g.stroke(); g.restore();
  });
  for (const o of s.ogeler || []) {
    if (haric && haric === o.id) continue;
    if (o.tip === 'imza') { try { const i = await resimYukle(o.src); g.drawImage(i, o.x * W, o.y * H, o.w * W, o.h * H); } catch {} }
    if (o.tip === 'yazi') {
      g.save(); g.fillStyle = o.renk || '#111'; g.textBaseline = 'top';
      const fs = o.boyut * W; g.font = `${o.kalin ? 'bold ' : ''}${fs}px -apple-system, "Segoe UI", Roboto, Arial, sans-serif`;
      String(o.metin || '').split('\n').forEach((l, i) => g.fillText(l, o.x * W, o.y * H + i * fs * 1.25));
      g.restore();
    }
  }
  const f = belge?.filigran;
  if (f?.metin) {
    g.save(); g.globalAlpha = f.opak ?? 0.22; g.fillStyle = f.renk || '#c0392b';
    const fs = (f.boyut || 0.06) * Math.min(W, H) * 1.4; g.font = `bold ${fs}px -apple-system, "Segoe UI", Roboto, Arial, sans-serif`;
    g.translate(W / 2, H / 2); g.rotate(-Math.atan2(H, W) * 0.85);
    const tw = g.measureText(f.metin).width + fs * 2, adimY = fs * 3.2, cap = Math.hypot(W, H);
    for (let y = -cap; y < cap; y += adimY) for (let x = -cap + ((y / adimY) % 2 ? tw / 2 : 0); x < cap; x += tw) g.fillText(f.metin, x, y);
    g.restore();
  }
}

/* ═════════ Yazıyı okuma (OCR) ═════════ */
const ocrDil = () => store.get('taraDil', 'tur+eng');
async function sayfaOku(s, ilerle) {
  await sayfaHazirla(s);
  if (s.ocrAnahtar === s.islemAnahtar && s.ocrPdf && s.ocrDil === ocrDil()) return s;
  const resim = new Uint8Array(await s.islenmis.arrayBuffer());
  const dpi = Math.round(Math.max(s.w, s.h) / 11.69);   // A4 uzun kenarı ~11,7 inç
  const r = await ocrIsci({ resim, pdf: true, diller: ocrDil(), dpi }, ilerle, [resim.buffer]);
  s.metin = (r.metin || '').replace(/\n{3,}/g, '\n\n').trim(); s.guven = r.guven; s.ocrPdf = r.pdf; s.ocrAnahtar = s.islemAnahtar; s.ocrDil = ocrDil();
  await TDB.koy('sayfalar', s);
  return s;
}

/* ═════════ PDF ═════════ */
const KALITE = { yuksek: { ad: 'Yüksek', boy: 2400, q: 0.88 }, orta: { ad: 'Orta', boy: 1750, q: 0.78 }, kucuk: { ad: 'Küçük (mail için)', boy: 1250, q: 0.62 } };
async function pdfYap(belge, sayfalar, o = {}) {
  const K = KALITE[o.kalite || 'orta'], doc = await PDFLib.PDFDocument.create();
  doc.setTitle(belge.ad || 'Tara belgesi'); doc.setProducer('Suha Tara'); doc.setCreator('Suha Tara');
  for (let i = 0; i < sayfalar.length; i++) {
    const s = sayfalar[i];
    o.ilerle?.(i / sayfalar.length, `Sayfa ${i + 1}/${sayfalar.length}`);
    if (o.ocr) await sayfaOku(s, p => o.ilerle?.((i + 0.5) / sayfalar.length, p.durum)).catch(e => console.warn('ocr', e));
    const c = await sayfaBirlestir(s, belge, K.boy), jpg = await tuvaldenBlob(c, 'image/jpeg', K.q);
    const img = await doc.embedJpg(new Uint8Array(await jpg.arrayBuffer()));
    // Sayfa ölçüsü: A4 genişliğinde, resmin oranında (A4'e yakınsa tam A4)
    let W = 595.28, H = W * c.height / c.width;
    if (o.boyut === 'a4' || Math.abs(H / 841.89 - 1) < 0.06) H = 841.89;
    if (c.width > c.height) { H = 595.28; W = H * c.width / c.height; if (o.boyut === 'a4' || Math.abs(W / 841.89 - 1) < 0.06) W = 841.89; }
    const sayfa = doc.addPage([W, H]);
    sayfa.drawImage(img, { x: 0, y: 0, width: W, height: H });
    if (o.ocr && s.ocrPdf) {
      try {
        const [katman] = await doc.embedPdf(s.ocrPdf);
        sayfa.drawPage(katman, { x: 0, y: 0, width: W, height: H });
      } catch (e) { console.warn('metin katmanı', e); }
    }
  }
  o.ilerle?.(1, 'PDF hazırlanıyor');
  return new Blob([await doc.save()], { type: 'application/pdf' });
}
// PDF içe aktarma: sayfalar resme çevrilir (PDF.js)
let pdfjs = null;
async function pdfSayfalari(dosya, ilerle) {
  if (!pdfjs) { pdfjs = await import('./tara-lib/pdf.min.mjs'); pdfjs.GlobalWorkerOptions.workerSrc = 'tara-lib/pdf.worker.min.mjs'; }
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await dosya.arrayBuffer()), isEvalSupported: false }).promise, out = [];
  for (let i = 1; i <= Math.min(pdf.numPages, 200); i++) {
    ilerle?.(i, pdf.numPages);
    const p = await pdf.getPage(i), v1 = p.getViewport({ scale: 1 }), k = Math.min(3, 2000 / Math.max(v1.width, v1.height)), v = p.getViewport({ scale: k });
    const c = document.createElement('canvas'); c.width = Math.round(v.width); c.height = Math.round(v.height);
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
    await p.render({ canvasContext: g, viewport: v }).promise;
    out.push(await tuvaldenBlob(c, 'image/jpeg', 0.9));
    p.cleanup();
  }
  try { (pdf.loadingTask || pdf).destroy?.(); } catch {}
  return out;
}

/* ═════════ Google: giriş, Drive, Gmail ═════════ */
const SC_DRIVE = 'https://www.googleapis.com/auth/drive.file', SC_GMAIL_GONDER = 'https://www.googleapis.com/auth/gmail.send';
const kapsamVar = (t, sc) => { const s = ' ' + (t?.scope || '') + ' '; return s.includes(' ' + sc + ' ') || (sc === SC_GMAIL_GONDER && (s.includes(' https://www.googleapis.com/auth/gmail.modify ') || s.includes(' https://mail.google.com/ '))); };
function tAnahtar(sc) { const t = store.get('auth'); return t && t.exp > Date.now() + 60000 && kapsamVar(t, sc) ? t.token : null; }
// İzin yoksa Google'a yönlendirir; dönüşte niyet kaldığı yerden sürer
function tIzinIste(sc, niyet, mesaj) {
  if (DEMO) return true;
  if (tAnahtar(sc)) return true;
  if (!CLIENT_ID) { toast('Google girişi bu kurulumda ayarlı değil'); return false; }
  if (!confirm(mesaj)) return false;
  try { sessionStorage.setItem('taraNiyet', JSON.stringify({ ...niyet, sc })); } catch {}
  window.APP_SCOPES = 'openid email ' + sc;
  window.APP_NEED_SCOPE = sc;
  Auth.login(false);
  return false;
}
async function gFetch(url, opt = {}, sc = SC_DRIVE) {
  const tok = tAnahtar(sc);
  if (!tok) throw new Error('Google oturumu yok ya da süresi doldu; tekrar dene');
  const r = await fetch(url, { ...opt, headers: { Authorization: 'Bearer ' + tok, ...(opt.headers || {}) } });
  if (r.status === 401) { store.del('auth'); throw new Error('Google oturumunun süresi doldu; tekrar dene'); }
  if (!r.ok) { let m = r.status + ''; try { m = (await r.json()).error.message; } catch {} throw new Error(m); }
  return (r.headers.get('content-type') || '').includes('json') ? r.json() : r.text();
}
const T_DRIVE = 'https://www.googleapis.com/drive/v3/files', T_DRIVE_UP = 'https://www.googleapis.com/upload/drive/v3/files';
async function driveKlasor() {
  const q = "mimeType='application/vnd.google-apps.folder' and appProperties has { key='suha' and value='tara-klasor' } and trashed=false";
  const r = await gFetch(T_DRIVE + '?' + new URLSearchParams({ q, fields: 'files(id)', pageSize: 1 }));
  if (r.files?.[0]) return r.files[0].id;
  const f = await gFetch(T_DRIVE + '?fields=id', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Suha Tara', mimeType: 'application/vnd.google-apps.folder', appProperties: { suha: 'tara-klasor' } }) });
  return f.id;
}
async function driveKaydet(belge, pdf, metin) {
  const sinir = 'tara_' + Math.random().toString(36).slice(2), ad = (belge.ad || 'Tara belgesi').replace(/[\\/:*?"<>|]/g, '-') + '.pdf';
  const meta = { name: ad, mimeType: 'application/pdf', contentHints: metin ? { indexableText: metin.slice(0, 120000) } : undefined };
  let id = belge.driveId;
  if (id) { try { await gFetch(`${T_DRIVE}/${id}?fields=id,trashed`).then(f => { if (f.trashed) id = null; }); } catch { id = null; } }
  if (!id) { meta.parents = [await driveKlasor()]; meta.appProperties = { suha: 'tara' }; }
  const govde = new Blob([`--${sinir}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${sinir}\r\nContent-Type: application/pdf\r\n\r\n`, pdf, `\r\n--${sinir}--`]);
  const f = await gFetch(`${T_DRIVE_UP}${id ? '/' + id : ''}?uploadType=multipart&fields=id,webViewLink`, { method: id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'multipart/related; boundary=' + sinir }, body: govde });
  return f;
}
// Gmail ile gönder (ek olarak PDF). 35 MB'a kadar.
async function gmailGonder({ kime, konu, metin, dosya, dosyaAdi }) {
  const b64 = async blob => { const u = new Uint8Array(await blob.arrayBuffer()); return bytesToB64(u).replace(/.{76}/g, '$&\r\n'); };
  const kod = s => '=?UTF-8?B?' + bytesToB64(utf8(s)) + '?=';
  const sinir = 'tara_' + Math.random().toString(36).slice(2);
  const mime = [`To: ${kime}`, `Subject: ${kod(konu)}`, 'MIME-Version: 1.0', `Content-Type: multipart/mixed; boundary="${sinir}"`, '',
    `--${sinir}`, 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', bytesToB64(utf8(metin || '')).replace(/.{76}/g, '$&\r\n'),
    `--${sinir}`, `Content-Type: application/pdf; name="${kod(dosyaAdi)}"`, `Content-Disposition: attachment; filename="${kod(dosyaAdi)}"`, 'Content-Transfer-Encoding: base64', '', await b64(dosya), `--${sinir}--`, ''].join('\r\n');
  return gFetch('https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send?uploadType=media', { method: 'POST', headers: { 'Content-Type': 'message/rfc822' }, body: mime }, SC_GMAIL_GONDER);
}
