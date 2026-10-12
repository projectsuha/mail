/* Tara — yazıyı okuma (OCR) işçisi.
   Tesseract (tesseract.js-core, WebAssembly) bu cihazda çalışır; resimler hiçbir sunucuya gönderilmez.
   Dil verileri (Türkçe + İngilizce) ilk kullanımda indirilir, sonra önbellekten gelir. */
'use strict';
let M = null, api = null, kurulum = null, kurulanDil = '';
const yazilan = new Set();
const simd = (() => { try { return WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11])); } catch { return false; } })();
const ilerle = (id, durum, oran) => postMessage({ id, ilerleme: { durum, oran } });

async function kur(id, diller) {
  if (api && kurulanDil === diller) return;
  if (!M) {
    ilerle(id, 'Okuma motoru yükleniyor', 0.05);
    importScripts(simd ? 'tesseract-core-simd-lstm.js' : 'tesseract-core-lstm.js');
    M = await TesseractCore({ locateFile: f => new URL(f, self.location.href).href });
  }
  const liste = diller.split('+');
  for (let i = 0; i < liste.length; i++) {
    const d = liste[i], dosya = d + '.traineddata';
    if (!yazilan.has(dosya)) {
      ilerle(id, `Dil verisi indiriliyor (${d === 'tur' ? 'Türkçe' : d === 'eng' ? 'İngilizce' : d})`, 0.1 + 0.6 * i / liste.length);
      const r = await fetch(dosya);
      if (!r.ok) throw new Error('Dil verisi indirilemedi (' + r.status + ')');
      M.FS.writeFile(dosya, new Uint8Array(await r.arrayBuffer()));
      yazilan.add(dosya);
    }
  }
  if (api) { api.End(); api = null; }
  ilerle(id, 'Hazırlanıyor', 0.8);
  api = new M.TessBaseAPI();
  if (api.Init(null, diller, 1) !== 0) { api = null; throw new Error('Okuma motoru başlatılamadı'); }
  kurulanDil = diller;
}

async function oku({ id, resim, pdf, diller = 'tur+eng', dpi = 200 }) {
  if (!kurulum || kurulanDil !== diller) kurulum = kur(id, diller);
  await kurulum;
  ilerle(id, 'Yazı okunuyor', 0.85);
  M.FS.writeFile('/input', resim);
  api.SetVariable('user_defined_dpi', String(dpi));
  if (api.SetImageFile(1, 0) === 1) throw new Error('Resim okunamadı');
  api.Recognize(null);
  const metin = api.GetUTF8Text() || '', guven = api.MeanTextConf();
  let pdfVeri = null;
  if (pdf) {
    // Sadece görünmez yazı katmanı: resmi sayfaya biz koyarız, bu katman üstüne biner (aranabilir PDF)
    const r = new M.TessPDFRenderer('tara', '/', true);
    r.BeginDocument('Tara'); r.AddImage(api); r.EndDocument();
    M._free(r);
    pdfVeri = M.FS.readFile('/tara.pdf'); M.FS.unlink('/tara.pdf');
  }
  api.Clear();
  try { M.FS.unlink('/input'); } catch {}
  return { metin, guven, pdf: pdfVeri };
}

onmessage = async e => {
  const d = e.data;
  try {
    const sonuc = await oku(d);
    postMessage({ id: d.id, sonuc }, sonuc.pdf ? [sonuc.pdf.buffer] : []);
  } catch (err) {
    kurulum = null;
    postMessage({ id: d.id, hata: String(err && err.message || err) });
  }
};
