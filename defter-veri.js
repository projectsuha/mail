/* ───────────── Kayıt Defteri: veri ─────────────
   Defterler, kayıtlar ve fotoğraflar bu cihazda (IndexedDB) saklanır. İstenirse yedek dosyası alınır
   ya da Google Drive'a (sadece programın kendi klasörüne) yedeklenir. */
'use strict';

/* ═════════ Cihazdaki depo ═════════ */
const DDB = (() => {
  let db = null;
  const ac = () => db ? Promise.resolve(db) : new Promise((ok, red) => {
    const r = indexedDB.open(DEMO ? 'suha-defter-deneme' : 'suha-defter', 1);
    r.onupgradeneeded = () => {
      const d = r.result;
      d.createObjectStore('defterler', { keyPath: 'id' });
      const k = d.createObjectStore('kayitlar', { keyPath: 'id' }); k.createIndex('defter', 'defterId');
      d.createObjectStore('fotolar', { keyPath: 'id' });
    };
    r.onsuccess = () => { db = r.result; ok(db); };
    r.onerror = () => red(r.error || new Error('Depo açılamadı'));
  });
  const is = async (ad, mod, fn) => {
    const d = await ac();
    return new Promise((ok, red) => {
      const t = d.transaction(ad, mod), s = t.objectStore(ad); let sonuc;
      Promise.resolve(fn(s)).then(v => { sonuc = v; });
      t.oncomplete = () => ok(sonuc); t.onerror = () => red(t.error); t.onabort = () => red(t.error || new Error('İşlem yarıda kaldı (depo dolu olabilir)'));
    });
  };
  const istek = r => new Promise((ok, red) => { r.onsuccess = () => ok(r.result); r.onerror = () => red(r.error); });
  return {
    hepsi: ad => is(ad, 'readonly', s => istek(s.getAll())),
    al: (ad, id) => is(ad, 'readonly', s => istek(s.get(id))),
    koy: (ad, v) => is(ad, 'readwrite', s => istek(s.put(v))),
    sil: (ad, id) => is(ad, 'readwrite', s => istek(s.delete(id))),
    temizle: ad => is(ad, 'readwrite', s => istek(s.clear())),
    async topluKoy(ad, liste) { const d = await ac(); return new Promise((ok, red) => { const t = d.transaction(ad, 'readwrite'), s = t.objectStore(ad); liste.forEach(v => s.put(v)); t.oncomplete = ok; t.onerror = () => red(t.error); t.onabort = () => red(t.error || new Error('Yazılamadı (depo dolu olabilir)')); }); }
  };
})();

/* ═════════ Hazır defterler (şablonlar) ═════════
   Alan türleri: metin, sayi (birim), para, tarih, onay, ay. "turler" verilen alan yalnızca o kayıt türlerinde görünür. */
const SABLON = {
  arac: { ad: 'Araç', ornekAd: 'Arabam', ikon: 'arac', renk: '#3d5afe', aciklama: 'Yakıt, bakım, muayene, sigorta, kasko',
    turler: ['Yakıt', 'Bakım', 'Muayene', 'Sigorta', 'Kasko', 'Lastik', 'Tamir', 'Vergi (MTV)', 'Otopark / köprü', 'Diğer'],
    alanlar: [{ k: 'km', ad: 'Kilometre', tur: 'sayi', birim: 'km' }, { k: 'litre', ad: 'Litre', tur: 'sayi', birim: 'L', turler: ['Yakıt'] }, { k: 'yer', ad: 'Yer / servis', tur: 'metin' }],
    baslikAdi: 'Açıklama', tarihAdi: 'Tarih', hatirlatOneri: { Bakım: [12, 'Sonraki bakım'], Muayene: [24, 'Muayene'], Sigorta: [12, 'Sigorta yenileme'], Kasko: [12, 'Kasko yenileme'], 'Vergi (MTV)': [6, 'MTV taksiti'], Lastik: [6, 'Lastik değişimi'] } },
  fatura: { ad: 'Faturalar', ornekAd: 'Ev faturaları', ikon: 'fatura', renk: '#0e9f6e', aciklama: 'Elektrik, su, doğalgaz, internet, aidat',
    turler: ['Elektrik', 'Su', 'Doğalgaz', 'İnternet', 'Telefon', 'Aidat', 'Kira', 'Abonelik', 'Diğer'],
    alanlar: [{ k: 'donem', ad: 'Dönem', tur: 'ay' }, { k: 'odendi', ad: 'Ödendi', tur: 'onay' }],
    baslikAdi: 'Açıklama', tarihAdi: 'Son ödeme', fatura: true },
  garanti: { ad: 'Garanti ve belgeler', ornekAd: 'Garantiler', ikon: 'garanti', renk: '#d97706', aciklama: 'Ürün, fiş fotoğrafı, garanti bitişi, servis',
    turler: ['Elektronik', 'Beyaz eşya', 'Küçük ev aleti', 'Mobilya', 'Giyim', 'Diğer'],
    alanlar: [{ k: 'marka', ad: 'Marka / model', tur: 'metin' }, { k: 'yer', ad: 'Alındığı yer', tur: 'metin' }, { k: 'sure', ad: 'Garanti süresi', tur: 'sayi', birim: 'ay', varsayilan: 24 }, { k: 'seri', ad: 'Seri numarası', tur: 'metin' }],
    baslikAdi: 'Ürün', baslikZorunlu: true, tarihAdi: 'Alış tarihi', garanti: true },
  ev: { ad: 'Ev', ornekAd: 'Ev', ikon: 'ev', renk: '#7c3aed', aciklama: 'Kombi bakımı, tamirat, filtre, boya',
    turler: ['Bakım', 'Tamir', 'Temizlik', 'Alışveriş', 'Diğer'],
    alanlar: [{ k: 'kim', ad: 'Kim yaptı', tur: 'metin' }],
    baslikAdi: 'Yapılan iş', baslikZorunlu: true, tarihAdi: 'Tarih', hatirlatOneri: { Bakım: [12, 'Sonraki bakım'] } },
  saglik: { ad: 'Sağlık', ornekAd: 'Sağlık', ikon: 'saglik', renk: '#dc2626', aciklama: 'Muayene, tahlil, aşı, diş',
    turler: ['Muayene', 'Tahlil', 'Aşı', 'İlaç', 'Diş', 'Göz', 'Diğer'],
    alanlar: [{ k: 'doktor', ad: 'Doktor / hastane', tur: 'metin' }],
    baslikAdi: 'Açıklama', tarihAdi: 'Tarih', hatirlatOneri: { Diş: [6, 'Diş kontrolü'], Göz: [12, 'Göz kontrolü'], Tahlil: [6, 'Tahlil tekrarı'] } },
  bos: { ad: 'Boş defter', ornekAd: 'Yeni defter', ikon: 'defter', renk: '#475569', aciklama: 'Kendi türlerini ve alanlarını sen belirle',
    turler: [], alanlar: [], baslikAdi: 'Başlık', tarihAdi: 'Tarih' }
};
const RENKLER = ['#3d5afe', '#0e9f6e', '#d97706', '#7c3aed', '#dc2626', '#0891b2', '#db2777', '#475569'];
const yeniId = () => rnd(8);
function defterYap(sablon, ad) {
  const S0 = SABLON[sablon] || SABLON.bos;
  return { id: yeniId(), sablon, ad: ad || S0.ornekAd, ikon: S0.ikon, renk: S0.renk, turler: [...S0.turler], alanlar: S0.alanlar.map(a => ({ ...a })),
    baslikAdi: S0.baslikAdi, baslikZorunlu: !!S0.baslikZorunlu, tarihAdi: S0.tarihAdi, olusma: Date.now(), sira: Date.now() };
}
const sablonu = d => SABLON[d.sablon] || SABLON.bos;

/* ═════════ Tarih ve para ═════════ */
const bugunStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const tarihNesne = s => { const [y, m, g] = String(s || '').split('-').map(Number); return y ? new Date(y, (m || 1) - 1, g || 1) : null; };
const tarihStr = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function ayEkle(s, ay) { const d = tarihNesne(s) || new Date(); const g = d.getDate(); d.setDate(1); d.setMonth(d.getMonth() + ay); d.setDate(Math.min(g, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate())); return tarihStr(d); }
const gunFarki = s => Math.round((tarihNesne(s) - tarihNesne(bugunStr())) / 86400000);
const tarihYaz = (s, uzun) => { const d = tarihNesne(s); return d ? d.toLocaleDateString('tr-TR', uzun ? { day: 'numeric', month: 'long', year: 'numeric' } : { day: 'numeric', month: 'short', year: 'numeric' }) : ''; };
const ayYaz = s => { const [y, m] = String(s || '').split('-').map(Number); return y && m ? new Date(y, m - 1, 1).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }) : ''; };
const PARA = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 2 });
const paraYaz = n => n == null || isNaN(n) ? '' : PARA.format(n);
const sayiYaz = (n, b = 0) => n == null || isNaN(n) ? '' : Number(n).toLocaleString('tr-TR', { maximumFractionDigits: b });
// "1.250,50" ya da "1250.5" → 1250.5
function sayiCoz(v) {
  let s = String(v ?? '').trim().replace(/[₺\s]|TL/gi, '');
  if (!s) return null;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  const n = parseFloat(s); return isNaN(n) ? null : n;
}
const kalanYazi = g => g === 0 ? 'bugün' : g === 1 ? 'yarın' : g === -1 ? 'dün' : g > 0 ? `${g} gün sonra` : `${-g} gün geçti`;

/* ═════════ Hatırlatmalar ═════════
   Üç kaynak: kaydın kendi hatırlatması, ödenmemiş fatura (son ödeme günü), garantinin bitişi. */
function garantiBitis(k) { const s = sayiCoz(k.degerler?.sure); return k.tarih && s ? ayEkle(k.tarih, s) : null; }
function hatirlatmalar(defterler, kayitlar) {
  const dmap = new Map(defterler.map(d => [d.id, d])), out = [];
  for (const k of kayitlar) {
    const d = dmap.get(k.defterId); if (!d) continue;
    if (k.hatirlat?.tarih && !k.hatirlat.bitti) out.push({ kid: k.id, defter: d, kayit: k, tarih: k.hatirlat.tarih, metin: k.hatirlat.not || k.baslik || k.tur || 'Hatırlatma', tur: 'kendi' });
    if (sablonu(d).fatura && k.tarih && !k.degerler?.odendi && !k.faturaGizle) out.push({ kid: k.id, defter: d, kayit: k, tarih: k.tarih, metin: `${k.tur || 'Fatura'} son ödeme${k.tutar ? ' · ' + paraYaz(k.tutar) : ''}`, tur: 'fatura' });
    if (sablonu(d).garanti && !k.garantiGizle) { const b = garantiBitis(k); if (b && gunFarki(b) > -60) out.push({ kid: k.id, defter: d, kayit: k, tarih: b, metin: `${k.baslik || 'Ürün'} garantisi bitiyor`, tur: 'garanti' }); }
  }
  return out.sort((a, b) => a.tarih.localeCompare(b.tarih));
}

/* ═════════ Özetler ═════════ */
function ozet(d, kayitlar) {
  const bugun = bugunStr(), ay = bugun.slice(0, 7), yil = bugun.slice(0, 4);
  const top = f => kayitlar.filter(f).reduce((t, k) => t + (k.tutar || 0), 0);
  const o = { sayi: kayitlar.length, buAy: top(k => (k.tarih || '').startsWith(ay)), buYil: top(k => (k.tarih || '').startsWith(yil)), toplam: top(() => true), ek: [] };
  if (d.sablon === 'arac') {
    const km = kayitlar.map(k => sayiCoz(k.degerler?.km)).filter(x => x != null);
    if (km.length) o.ek.push(['Son kilometre', sayiYaz(Math.max(...km)) + ' km']);
    // Ortalama tüketim: dolu depo varsayımıyla, ilk yakıt hariç toplam litre / gidilen yol
    const y = kayitlar.filter(k => k.tur === 'Yakıt' && sayiCoz(k.degerler?.km) != null && sayiCoz(k.degerler?.litre) != null).sort((a, b) => sayiCoz(a.degerler.km) - sayiCoz(b.degerler.km));
    if (y.length >= 2) {
      const yol = sayiCoz(y[y.length - 1].degerler.km) - sayiCoz(y[0].degerler.km), lt = y.slice(1).reduce((t, k) => t + sayiCoz(k.degerler.litre), 0);
      if (yol > 0) o.ek.push(['Ortalama tüketim', sayiYaz(lt / yol * 100, 1) + ' L/100 km']);
      const yt = y.slice(1).reduce((t, k) => t + (k.tutar || 0), 0); if (yt && yol > 0) o.ek.push(['Km başına yakıt', paraYaz(yt / yol)]);
    }
  }
  if (d.sablon === 'fatura') {
    const od = kayitlar.filter(k => !k.degerler?.odendi);
    o.ek.push(['Ödenmemiş', od.length ? `${od.length} fatura · ${paraYaz(od.reduce((t, k) => t + (k.tutar || 0), 0))}` : 'Yok']);
  }
  if (d.sablon === 'garanti') {
    const devam = kayitlar.filter(k => { const b = garantiBitis(k); return b && gunFarki(b) >= 0; }).length;
    o.ek.push(['Garantisi süren', `${devam} ürün`]);
  }
  return o;
}
// Son 12 ayın aylık toplamı (grafik için)
function aylik(kayitlar) {
  const d = new Date(), out = [];
  for (let i = 11; i >= 0; i--) {
    const a = new Date(d.getFullYear(), d.getMonth() - i, 1), k = `${a.getFullYear()}-${String(a.getMonth() + 1).padStart(2, '0')}`;
    out.push({ ay: k, ad: a.toLocaleDateString('tr-TR', { month: 'short' }), tutar: kayitlar.filter(x => (x.tarih || '').startsWith(k)).reduce((t, x) => t + (x.tutar || 0), 0) });
  }
  return out;
}

/* ═════════ Excel'e (CSV) aktar ═════════ */
function csvYap(d, kayitlar) {
  const h = v => { const s = String(v ?? ''); return /[;"\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const sayi = n => n == null ? '' : String(n).replace('.', ',');
  const bas = ['Tarih', ...(d.turler.length ? ['Tür'] : []), d.baslikAdi || 'Başlık', 'Tutar (TL)', ...d.alanlar.map(a => a.ad + (a.birim ? ` (${a.birim})` : '')), 'Not', 'Hatırlatma', 'Hatırlatma notu'];
  const satirlar = [...kayitlar].sort((a, b) => (a.tarih || '').localeCompare(b.tarih || '')).map(k => [
    k.tarih || '', ...(d.turler.length ? [k.tur || ''] : []), k.baslik || '', sayi(k.tutar),
    ...d.alanlar.map(a => { const v = k.degerler?.[a.k]; return a.tur === 'onay' ? (v ? 'Evet' : 'Hayır') : a.tur === 'sayi' || a.tur === 'para' ? sayi(sayiCoz(v)) : v ?? ''; }),
    k.not || '', k.hatirlat?.tarih || '', k.hatirlat?.not || '']);
  return '﻿' + [bas, ...satirlar].map(r => r.map(h).join(';')).join('\r\n');
}

/* ═════════ Yedek dosyası ═════════ */
const blobB64 = b => new Promise((ok, red) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1]); r.onerror = () => red(r.error); r.readAsDataURL(b); });
const b64Blob = (s, tur = 'image/jpeg') => new Blob([Uint8Array.from(atob(s), c => c.charCodeAt(0))], { type: tur });
async function yedekYap() {
  const [defterler, kayitlar, fotolar] = await Promise.all([DDB.hepsi('defterler'), DDB.hepsi('kayitlar'), DDB.hepsi('fotolar')]);
  const f = [];
  for (const x of fotolar) f.push({ id: x.id, tur: x.blob?.type || 'image/jpeg', veri: await blobB64(x.blob), kucuk: x.kucuk ? await blobB64(x.kucuk) : null });
  return { suha: 'kayit-defteri', v: 1, tarih: new Date().toISOString(), defterler, kayitlar, fotolar: f };
}
async function yedekYukle(veri, { birlestir = false } = {}) {
  if (!veri || veri.suha !== 'kayit-defteri' || !Array.isArray(veri.defterler) || !Array.isArray(veri.kayitlar)) throw new Error('Bu bir Kayıt Defteri yedeği değil');
  if (!birlestir) { await DDB.temizle('defterler'); await DDB.temizle('kayitlar'); await DDB.temizle('fotolar'); }
  await DDB.topluKoy('defterler', veri.defterler);
  await DDB.topluKoy('kayitlar', veri.kayitlar);
  const fl = (veri.fotolar || []).map(x => ({ id: x.id, blob: b64Blob(x.veri, x.tur), kucuk: x.kucuk ? b64Blob(x.kucuk) : null }));
  for (let i = 0; i < fl.length; i += 20) await DDB.topluKoy('fotolar', fl.slice(i, i + 20));
  return { defter: veri.defterler.length, kayit: veri.kayitlar.length, foto: fl.length };
}

/* ═════════ Fotoğraf: küçült, sakla ═════════ */
async function fotoHazirla(dosya) {
  let im;
  try { im = await createImageBitmap(dosya, { imageOrientation: 'from-image' }); }
  catch { const u = URL.createObjectURL(dosya); im = new Image(); im.src = u; try { await im.decode(); } catch { throw new Error('Bu resim açılamadı'); } finally { setTimeout(() => URL.revokeObjectURL(u), 1000); } }
  const yap = async (enUzun, q) => {
    const k = Math.min(1, enUzun / Math.max(im.width, im.height)), c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(im.width * k)); c.height = Math.max(1, Math.round(im.height * k));
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0, c.width, c.height);
    return new Promise(ok => c.toBlob(ok, 'image/jpeg', q));
  };
  const blob = await yap(1800, 0.82), kucuk = await yap(240, 0.75);
  im.close?.();
  return { id: yeniId(), blob, kucuk };
}

/* ═════════ Google Drive yedeği (isteğe bağlı) ═════════
   Sadece programın kendi oluşturduğu "Suha Kayıt Defteri" klasörü görülür (drive.file izni). */
const SC_DRIVE_D = 'https://www.googleapis.com/auth/drive.file';
const D_DRIVE = 'https://www.googleapis.com/drive/v3/files', D_DRIVE_UP = 'https://www.googleapis.com/upload/drive/v3/files';
function dAnahtar() { const t = store.get('auth'); return t && t.exp > Date.now() + 60000 && (' ' + (t.scope || '') + ' ').includes(' ' + SC_DRIVE_D + ' ') ? t.token : null; }
async function dFetch(url, opt = {}) {
  const tok = dAnahtar(); if (!tok) throw new Error('GIRIS');
  const r = await fetch(url, { ...opt, headers: { Authorization: 'Bearer ' + tok, ...(opt.headers || {}) } });
  if (r.status === 401) { store.del('auth'); throw new Error('GIRIS'); }
  if (!r.ok) { let m = r.status + ''; try { m = (await r.json()).error.message; } catch {} throw new Error(m); }
  return (r.headers.get('content-type') || '').includes('json') ? r.json() : r.blob();
}
async function driveKlasorD() {
  const q = "mimeType='application/vnd.google-apps.folder' and appProperties has { key='suha' and value='defter-klasor' } and trashed=false";
  const r = await dFetch(D_DRIVE + '?' + new URLSearchParams({ q, fields: 'files(id)', pageSize: 1 }));
  if (r.files?.[0]) return r.files[0].id;
  return (await dFetch(D_DRIVE + '?fields=id', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Suha Kayıt Defteri', mimeType: 'application/vnd.google-apps.folder', appProperties: { suha: 'defter-klasor' } }) })).id;
}
async function driveYedekBul() {
  const q = "appProperties has { key='suha' and value='defter-yedek' } and trashed=false";
  const r = await dFetch(D_DRIVE + '?' + new URLSearchParams({ q, fields: 'files(id,modifiedTime,size)', orderBy: 'modifiedTime desc', pageSize: 1 }));
  return r.files?.[0] || null;
}
async function driveYedekle() {
  const veri = JSON.stringify(await yedekYap()), var0 = await driveYedekBul(), sinir = 'dft_' + Math.random().toString(36).slice(2);
  const meta = { name: 'Kayıt Defteri yedeği.json', mimeType: 'application/json' };
  if (!var0) { meta.parents = [await driveKlasorD()]; meta.appProperties = { suha: 'defter-yedek' }; }
  const govde = new Blob([`--${sinir}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${sinir}\r\nContent-Type: application/json\r\n\r\n`, veri, `\r\n--${sinir}--`]);
  return dFetch(`${D_DRIVE_UP}${var0 ? '/' + var0.id : ''}?uploadType=multipart&fields=id,modifiedTime`, { method: var0 ? 'PATCH' : 'POST', headers: { 'Content-Type': 'multipart/related; boundary=' + sinir }, body: govde });
}
async function driveGeriYukle() {
  const f = await driveYedekBul(); if (!f) throw new Error('Drive\'da yedek bulunamadı');
  const v = await dFetch(`${D_DRIVE}/${f.id}?alt=media`);
  return yedekYukle(v instanceof Blob ? JSON.parse(await v.text()) : v);
}
