/* Tara — görüntü işleme işçisi: ağır işler (perspektif düzeltme, filtreler) arayüzü dondurmasın diye burada yapılır. */
'use strict';
importScripts('tara-goruntu.js');
async function resimVerisi(blob) {
  const bmp = await createImageBitmap(blob), c = new OffscreenCanvas(bmp.width, bmp.height), g = c.getContext('2d');
  g.drawImage(bmp, 0, 0); bmp.close && bmp.close();
  return g.getImageData(0, 0, c.width, c.height);
}
async function blobYap(img, tur = 'image/jpeg', kalite = 0.88) {
  const c = new OffscreenCanvas(img.width, img.height);
  c.getContext('2d').putImageData(new ImageData(img.data, img.width, img.height), 0, 0);
  return c.convertToBlob({ type: tur, quality: kalite });
}
onmessage = async e => {
  const { id, islem, blob, sayfa, enUzun, kalite } = e.data;
  try {
    const img = await resimVerisi(blob);
    if (islem === 'bul') return postMessage({ id, sonuc: TaraGoruntu.kagitBul(img) });
    if (islem === 'isle') {
      const r = TaraGoruntu.isle(img, sayfa, enUzun || 2400);
      return postMessage({ id, sonuc: { blob: await blobYap(r, 'image/jpeg', kalite || 0.88), w: r.width, h: r.height } });
    }
    if (islem === 'duzelt') {   // sadece perspektif + filtre (kimlik kartı gibi parçalar için)
      let r = TaraGoruntu.duzelt(img, sayfa.kose, enUzun || 1400);
      if (sayfa.filtre) r = TaraGoruntu.filtre(r, sayfa.filtre, {});
      return postMessage({ id, sonuc: { blob: await blobYap(r, 'image/jpeg', kalite || 0.9), w: r.width, h: r.height } });
    }
    throw new Error('bilinmeyen işlem');
  } catch (err) { postMessage({ id, hata: String(err && err.message || err) }); }
};
