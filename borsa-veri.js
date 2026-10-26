/* ───────────── Borsa: veriler ─────────────
   Fiyatlar: kullanıcının kendi Google Drive'ındaki "Suha Borsa Fiyatlar" tablosunda GOOGLEFINANCE ile (15-20 dk gecikmeli).
   Grafik geçmişi, haberler, arama: Suha Servis (Apps Script) üzerinden herkese açık piyasa verisi.
   Kullanıcının listeleri, portföyü ve alarmları: kendi Drive'ında "Suha Borsa.json" dosyası (drive.file izni).
   Hiçbir yerde yatırım tavsiyesi üretilmez. */
'use strict';

/* ═════════ Sembol kataloğu ═════════
   id = Yahoo sembolü (grafik geçmişi için), gf = GOOGLEFINANCE sembolü (fiyat için), kod = ekranda görünen kısa ad */
const BIST = [
  ['THYAO', 'Türk Hava Yolları', 'Ulaştırma'], ['PGSUS', 'Pegasus', 'Ulaştırma'], ['TAVHL', 'TAV Havalimanları', 'Ulaştırma'],
  ['ASELS', 'Aselsan', 'Savunma'], ['OTKAR', 'Otokar', 'Otomotiv'], ['FROTO', 'Ford Otosan', 'Otomotiv'], ['TOASO', 'Tofaş', 'Otomotiv'],
  ['DOAS', 'Doğuş Otomotiv', 'Otomotiv'], ['TTRAK', 'Türk Traktör', 'Otomotiv'],
  ['GARAN', 'Garanti BBVA', 'Banka'], ['AKBNK', 'Akbank', 'Banka'], ['YKBNK', 'Yapı Kredi', 'Banka'], ['ISCTR', 'İş Bankası (C)', 'Banka'],
  ['HALKB', 'Halkbank', 'Banka'], ['VAKBN', 'VakıfBank', 'Banka'], ['TSKB', 'TSKB', 'Banka'],
  ['KCHOL', 'Koç Holding', 'Holding'], ['SAHOL', 'Sabancı Holding', 'Holding'], ['DOHOL', 'Doğan Holding', 'Holding'],
  ['ALARK', 'Alarko Holding', 'Holding'], ['AGHOL', 'Anadolu Grubu Holding', 'Holding'], ['TKFEN', 'Tekfen Holding', 'Holding'],
  ['ENKAI', 'Enka İnşaat', 'İnşaat'], ['EKGYO', 'Emlak Konut GYO', 'GYO'],
  ['BIMAS', 'BİM Mağazalar', 'Perakende'], ['MGROS', 'Migros', 'Perakende'], ['SOKM', 'Şok Marketler', 'Perakende'], ['MAVI', 'Mavi Giyim', 'Perakende'],
  ['TUPRS', 'Tüpraş', 'Enerji'], ['AKSEN', 'Aksa Enerji', 'Enerji'], ['ENJSA', 'Enerjisa', 'Enerji'], ['ASTOR', 'Astor Enerji', 'Enerji'],
  ['PETKM', 'Petkim', 'Kimya'], ['SASA', 'SASA Polyester', 'Kimya'], ['HEKTS', 'Hektaş', 'Kimya'], ['GUBRF', 'Gübre Fabrikaları', 'Kimya'],
  ['EREGL', 'Ereğli Demir Çelik', 'Metal'], ['KRDMD', 'Kardemir (D)', 'Metal'], ['SISE', 'Şişecam', 'Cam'],
  ['CIMSA', 'Çimsa', 'Çimento'], ['OYAKC', 'Oyak Çimento', 'Çimento'],
  ['TCELL', 'Turkcell', 'İletişim'], ['TTKOM', 'Türk Telekom', 'İletişim'],
  ['ARCLK', 'Arçelik', 'Dayanıklı tüketim'], ['VESTL', 'Vestel', 'Dayanıklı tüketim'],
  ['CCOLA', 'Coca-Cola İçecek', 'Gıda ve içecek'], ['AEFES', 'Anadolu Efes', 'Gıda ve içecek'], ['ULKER', 'Ülker', 'Gıda ve içecek']
];
const ABD = [
  ['AAPL', 'Apple', 'Teknoloji', 'NASDAQ'], ['MSFT', 'Microsoft', 'Teknoloji', 'NASDAQ'], ['NVDA', 'NVIDIA', 'Teknoloji', 'NASDAQ'],
  ['AVGO', 'Broadcom', 'Teknoloji', 'NASDAQ'], ['AMD', 'AMD', 'Teknoloji', 'NASDAQ'], ['INTC', 'Intel', 'Teknoloji', 'NASDAQ'],
  ['ORCL', 'Oracle', 'Teknoloji', 'NYSE'], ['CRM', 'Salesforce', 'Teknoloji', 'NYSE'], ['ADBE', 'Adobe', 'Teknoloji', 'NASDAQ'],
  ['GOOGL', 'Alphabet (Google)', 'İletişim', 'NASDAQ'], ['META', 'Meta', 'İletişim', 'NASDAQ'], ['NFLX', 'Netflix', 'İletişim', 'NASDAQ'], ['DIS', 'Disney', 'İletişim', 'NYSE'],
  ['AMZN', 'Amazon', 'Tüketim', 'NASDAQ'], ['TSLA', 'Tesla', 'Tüketim', 'NASDAQ'], ['MCD', 'McDonald\'s', 'Tüketim', 'NYSE'], ['NKE', 'Nike', 'Tüketim', 'NYSE'],
  ['WMT', 'Walmart', 'Temel tüketim', 'NYSE'], ['COST', 'Costco', 'Temel tüketim', 'NASDAQ'], ['KO', 'Coca-Cola', 'Temel tüketim', 'NYSE'], ['PEP', 'PepsiCo', 'Temel tüketim', 'NASDAQ'],
  ['JPM', 'JPMorgan', 'Finans', 'NYSE'], ['V', 'Visa', 'Finans', 'NYSE'], ['MA', 'Mastercard', 'Finans', 'NYSE'], ['BRK-B', 'Berkshire Hathaway', 'Finans', 'NYSE', 'NYSE:BRK.B'],
  ['XOM', 'ExxonMobil', 'Enerji', 'NYSE'], ['CVX', 'Chevron', 'Enerji', 'NYSE'],
  ['JNJ', 'Johnson & Johnson', 'Sağlık', 'NYSE'], ['PFE', 'Pfizer', 'Sağlık', 'NYSE'], ['UNH', 'UnitedHealth', 'Sağlık', 'NYSE'],
  ['BA', 'Boeing', 'Sanayi', 'NYSE']
];
const KAT = [
  ...BIST.map(([k, ad, sek]) => ({ id: k + '.IS', kod: k, ad, sek, tur: 'bist', gf: 'IST:' + k, para: 'TRY' })),
  ...ABD.map(([k, ad, sek, bor, gf]) => ({ id: k, kod: k, ad, sek, tur: 'abd', gf: gf || bor + ':' + k, para: 'USD' })),
  { id: 'XU100.IS', kod: 'BIST 100', ad: 'Borsa İstanbul 100 endeksi', tur: 'endeks', gf: 'INDEXIST:XU100', para: 'TRY' },
  { id: 'XU030.IS', kod: 'BIST 30', ad: 'Borsa İstanbul 30 endeksi', tur: 'endeks', gf: 'INDEXIST:XU030', para: 'TRY' },
  { id: '^GSPC', kod: 'S&P 500', ad: 'ABD S&P 500 endeksi', tur: 'endeks', gf: 'INDEXSP:.INX', para: 'USD' },
  { id: '^IXIC', kod: 'Nasdaq', ad: 'Nasdaq Bileşik endeksi', tur: 'endeks', gf: 'INDEXNASDAQ:.IXIC', para: 'USD' },
  { id: '^DJI', kod: 'Dow Jones', ad: 'Dow Jones Sanayi endeksi', tur: 'endeks', gf: 'INDEXDJX:.DJI', para: 'USD' },
  { id: '^GDAXI', kod: 'DAX', ad: 'Almanya DAX endeksi', tur: 'endeks', gf: 'INDEXDB:DAX', para: 'EUR' },
  { id: 'USDTRY=X', kod: 'Dolar', ad: 'ABD doları / Türk lirası', tur: 'doviz', gf: 'CURRENCY:USDTRY', para: 'TRY' },
  { id: 'EURTRY=X', kod: 'Euro', ad: 'Euro / Türk lirası', tur: 'doviz', gf: 'CURRENCY:EURTRY', para: 'TRY' },
  { id: 'GBPTRY=X', kod: 'Sterlin', ad: 'İngiliz sterlini / Türk lirası', tur: 'doviz', gf: 'CURRENCY:GBPTRY', para: 'TRY' },
  { id: 'EURUSD=X', kod: 'EUR/USD', ad: 'Euro / ABD doları', tur: 'doviz', gf: 'CURRENCY:EURUSD', para: 'USD' },
  { id: 'GRAM-ALTIN', kod: 'Gram altın', ad: 'Gram altın (ons ve dolardan hesaplanır)', tur: 'emtia', para: 'TRY', tureyen: ['GC=F', 'USDTRY=X'] },
  { id: 'GC=F', kod: 'Ons altın', ad: 'Altın (ons, dolar)', tur: 'emtia', gf: 'CURRENCY:XAUUSD', para: 'USD' },
  { id: 'SI=F', kod: 'Gümüş', ad: 'Gümüş (ons, dolar)', tur: 'emtia', gf: 'CURRENCY:XAGUSD', para: 'USD' },
  { id: 'BZ=F', kod: 'Brent', ad: 'Brent petrol (varil, dolar)', tur: 'emtia', para: 'USD' },
  { id: 'BTC-USD', kod: 'Bitcoin', ad: 'Bitcoin / dolar', tur: 'kripto', gf: 'CURRENCY:BTCUSD', para: 'USD' },
  { id: 'ETH-USD', kod: 'Ethereum', ad: 'Ethereum / dolar', tur: 'kripto', gf: 'CURRENCY:ETHUSD', para: 'USD' },
  { id: 'SOL-USD', kod: 'Solana', ad: 'Solana / dolar', tur: 'kripto', para: 'USD' },
  { id: 'XRP-USD', kod: 'XRP', ad: 'XRP / dolar', tur: 'kripto', para: 'USD' },
  { id: 'BNB-USD', kod: 'BNB', ad: 'BNB / dolar', tur: 'kripto', para: 'USD' },
  { id: 'DOGE-USD', kod: 'Dogecoin', ad: 'Dogecoin / dolar', tur: 'kripto', para: 'USD' }
];
const KAT_BY = Object.fromEntries(KAT.map(x => [x.id, x]));
const TUR_AD = { bist: 'Borsa İstanbul', abd: 'ABD', endeks: 'Endeks', doviz: 'Döviz', emtia: 'Emtia', kripto: 'Kripto', diger: 'Diğer' };
const OZET = ['XU100.IS', 'USDTRY=X', 'EURTRY=X', 'GRAM-ALTIN', 'BTC-USD', '^GSPC'];
const ONS_GRAM = 31.1034768;

// Katalogda olmayan (aramayla eklenen) semboller kullanıcının verisinde tutulur
function inst(id) {
  if (KAT_BY[id]) return KAT_BY[id];
  const o = B.data?.ozel?.[id];
  if (o) return o;
  return yeniInst(id);
}
function yeniInst(id, ad = '', borsa = '') {
  const s = String(id).toUpperCase();
  if (/\.IS$/.test(s)) return { id: s, kod: s.slice(0, -3), ad: ad || s.slice(0, -3), tur: 'bist', gf: 'IST:' + s.slice(0, -3), para: 'TRY', sek: 'Diğer' };
  if (/-USD$/.test(s)) return { id: s, kod: s.slice(0, -4), ad: ad || s, tur: 'kripto', para: 'USD' };
  if (/=X$/.test(s)) return { id: s, kod: s.slice(0, -2), ad: ad || s, tur: 'doviz', gf: 'CURRENCY:' + s.slice(0, -2), para: s.slice(3, 6) || 'USD' };
  if (/^\^|=F$/.test(s)) return { id: s, kod: s.replace(/^\^/, ''), ad: ad || s, tur: s[0] === '^' ? 'endeks' : 'emtia', para: 'USD' };
  if (/^[A-Z.-]{1,6}$/.test(s)) return { id: s, kod: s, ad: ad || s, tur: 'abd', gf: (/NYSE/i.test(borsa) ? 'NYSE:' : /NASDAQ|NMS|NGM|NCM/i.test(borsa) ? 'NASDAQ:' : '') + s.replace('-', '.'), para: 'USD', sek: 'Diğer' };
  return { id: s, kod: s, ad: ad || s, tur: 'diger', para: '' };
}

// Arama: büyük/küçük harf ve Türkçe karakter farkı gözetmeden (Tüpraş = tupras, NVIDIA = nvidia)
const arNorm = s => String(s).toLocaleLowerCase('tr').replace(/ı/g, 'i').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const katAra = k => KAT.filter(x => arNorm(x.kod + ' ' + x.ad + ' ' + x.id + ' ' + (x.sek || '')).includes(k));

/* ═════════ Biçimlendirme ═════════ */
const PARA_SIM = { TRY: '₺', USD: '$', EUR: '€', GBP: '£' };
const nf = (d1, d2 = d1) => new Intl.NumberFormat('tr-TR', { minimumFractionDigits: d1, maximumFractionDigits: d2 });
const NF = { 0: nf(0), 2: nf(2), 4: nf(2, 4), 6: nf(2, 6) };
function fN(v, d = 2) { return v == null || !isFinite(v) ? '—' : (NF[d] || nf(d)).format(v); }
function fFiyat(v, para) {
  if (v == null || !isFinite(v)) return '—';
  const a = Math.abs(v), s = a >= 1 ? NF[2].format(v) : a >= 0.01 ? NF[4].format(v) : NF[6].format(v);
  const sim = PARA_SIM[para];
  return sim ? (para === 'TRY' ? s + ' ₺' : sim + s) : s;
}
function fPct(v, isaret = true) {
  if (v == null || !isFinite(v)) return '—';
  return (isaret ? (v > 0 ? '+' : v < 0 ? '−' : '') : '') + '%' + NF[2].format(Math.abs(v));
}
function fBuyuk(v, para) {
  if (v == null || !isFinite(v) || v === 0) return '—';
  const a = Math.abs(v), [b, k] = a >= 1e12 ? [1e12, ' Tn'] : a >= 1e9 ? [1e9, ' Mr'] : a >= 1e6 ? [1e6, ' Mn'] : a >= 1e3 ? [1e3, ' bin'] : [1, ''];
  const s = nf(0, a / b >= 100 ? 0 : 1).format(v / b) + k;
  const sim = PARA_SIM[para];
  return sim ? (para === 'TRY' ? s + ' ₺' : sim + s) : s;
}
const fTarih = (ms, uzun) => new Date(ms).toLocaleDateString('tr-TR', uzun ? { day: 'numeric', month: 'long', year: 'numeric' } : { day: 'numeric', month: 'short', year: 'numeric' });
const renkSinif = v => v > 0 ? 'up' : v < 0 ? 'down' : 'flat';
const gunBasi = ms => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime(); };

/* ═════════ Enflasyon (TÜİK, aylık TÜFE değişimi %) ═════════
   Kaynak: TÜİK aylık TÜFE açıklamaları. Yeni ay açıklandıkça buraya eklenir. */
const TUFE_AYLIK = {
  2020: [1.35, 0.35, 0.57, 0.85, 1.36, 1.13, 0.58, 0.86, 0.97, 2.13, 2.30, 1.25],
  2021: [1.68, 0.91, 1.08, 1.68, 0.89, 4.01, 2.46, 2.77, 1.55, 5.24, 9.99, 19.08],
  2022: [11.10, 4.81, 5.46, 7.25, 2.98, 4.95, 2.37, 1.46, 3.08, 3.54, 2.88, 1.18],
  2023: [6.65, 3.15, 2.29, 2.39, 0.04, 3.92, 9.49, 9.09, 4.75, 3.43, 3.28, 2.93],
  2024: [6.70, 4.53, 3.16, 3.18, 3.37, 1.64, 3.23, 2.47, 2.97, 2.88, 2.24, 1.03],
  2025: [5.03, 2.27, 2.46, 3.00, 1.53, 1.37, 2.06, 2.04, 3.23, 2.55, 0.87, 0.89],
  2026: [4.84, 2.96, 1.94, 4.18, 1.71, 0.99, 1.78, 1.84]
};
// Endeks: 2020 Ocak başı = 100. Bir tarihin değeri, o ayın başındaki endeks ile ay sonu arasında doğrusal.
const TUFE = (() => {
  const ay = []; let e = 100;
  Object.keys(TUFE_AYLIK).sort().forEach(y => TUFE_AYLIK[y].forEach((p, m) => { ay.push({ t: new Date(+y, m, 1).getTime(), bas: e, son: e * (1 + p / 100) }); e *= 1 + p / 100; }));
  const sonAy = ay[ay.length - 1];
  return {
    ilk: ay[0].t, sonAy: new Date(sonAy.t),
    deger(ms) {
      if (ms < ay[0].t) return null;
      for (let i = ay.length - 1; i >= 0; i--) {
        const a = ay[i]; if (ms < a.t) continue;
        const ayUz = new Date(new Date(a.t).getFullYear(), new Date(a.t).getMonth() + 1, 1).getTime() - a.t;
        return ms >= a.t + ayUz ? a.son : a.bas + (a.son - a.bas) * (ms - a.t) / ayUz;
      }
      return null;
    }
  };
})();

/* ═════════ Google Drive ═════════ */
const DRIVE = 'https://www.googleapis.com/drive/v3/files', DRIVE_UP = 'https://www.googleapis.com/upload/drive/v3/files';
const qs = o => new URLSearchParams(Object.entries(o).filter(([, v]) => v != null)).toString();
async function dFetch(url, opt = {}) {
  const tok = Auth.token();
  if (!tok) { Auth.reauth(); throw new AuthError('oturum'); }
  const res = await fetch(url, { ...opt, headers: { Authorization: 'Bearer ' + tok, ...(opt.headers || {}) } });
  if (res.status === 401) { store.del('auth'); Auth.reauth(); throw new AuthError('oturum'); }
  if (!res.ok) { let m = res.status + ''; try { m = (await res.json()).error.message; } catch {} throw new Error(m); }
  return res.status === 204 ? null : (res.headers.get('content-type') || '').includes('json') ? res.json() : res.text();
}

/* ═════════ Suha Servis (grafik geçmişi, haber, arama, alarm) ═════════ */
const SERVIS = () => (window.MAIL_CONFIG?.ACCESS_URL || '').trim();
let servisDurum = 'bilinmiyor';   // 'tamam' | 'yetki' | 'yok' | 'eski' | 'hata'
// Eski Suha Servis Borsa isteklerini tanımaz (sahibin isteğini yönetici şifresi denemesi sayabilir); önce sürüme bak
let servisSurum = null;
async function servisHazir(url) {
  const c = store.get('borsaServis');
  if (c && c.url === url && c.borsa && Date.now() - c.t < 6 * 3600e3) return true;
  if (!servisSurum || Date.now() - servisSurum.t > 5 * 60e3) {
    servisSurum = (async () => { try { const j = await (await fetch(url + (url.includes('?') ? '&' : '?') + 't=' + Date.now(), { cache: 'no-store' })).json(); if (j?.mode) store.set('accessCache', { mode: j.mode, allow: j.allow, block: j.block }); return !!j?.borsa; } catch { return null; } })();
    servisSurum.t = Date.now();
  }
  const ok = await servisSurum;
  if (ok) store.set('borsaServis', { url, borsa: 1, t: Date.now() });
  return ok;
}
async function servis(islem, veri = {}) {
  const url = SERVIS();
  if (!url) { servisDurum = 'yok'; throw new Error('Suha Servis adresi yok'); }
  const hazir = await servisHazir(url);
  if (hazir === false) { servisDurum = 'eski'; throw new Error('Suha Servis güncel değil'); }
  if (hazir == null) { servisDurum = 'hata'; throw new Error('Suha Servis\'e ulaşılamadı'); }
  const kimlik = idToken();
  if (!kimlik) { servisDurum = 'yetki'; throw new Error('oturum'); }
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ islem, kimlik, ...veri }) });
  const j = await r.json();
  if (j.hata) { servisDurum = j.hata === 'yetki' ? 'yetki' : 'hata'; throw new Error(j.hata === 'islem' ? 'Suha Servis güncel değil' : j.hata); }
  servisDurum = 'tamam';
  return j;
}

/* ═════════ Fiyat tablosu: Google Sheets + GOOGLEFINANCE ═════════ */
const SHEETS = 'https://sheets.googleapis.com/v4/spreadsheets/';
const GF_SUTUN = ['price', 'closeyest', 'priceopen', 'high', 'low', 'volume', 'marketcap', 'pe', 'eps', 'high52', 'low52', 'name', 'currency'];
const GF_ALAN = ['fiyat', 'onceki', 'acilis', 'yuksek', 'dusuk', 'hacim', 'pd', 'fk', 'hbk', 'y52', 'd52', 'ad', 'para'];
const Tablo = {
  id: null,
  async bul() {
    if (this.id) return this.id;
    this.id = store.get('borsaTablo');
    if (this.id) return this.id;
    const q = "appProperties has { key='suha' and value='borsa-fiyat' } and trashed=false";
    const r = await dFetch(DRIVE + '?' + qs({ q, fields: 'files(id)', pageSize: 1 }));
    if (r.files?.[0]) this.id = r.files[0].id;
    else {
      const f = await dFetch(DRIVE + '?fields=id', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Suha Borsa Fiyatlar', mimeType: 'application/vnd.google-apps.spreadsheet', appProperties: { suha: 'borsa-fiyat' },
          description: 'Borsa uygulamasının fiyat tablosu. GOOGLEFINANCE ile güncellenir; silersen uygulama yenisini oluşturur.' }) });
      this.id = f.id;
    }
    store.set('borsaTablo', this.id);
    return this.id;
  },
  // Sembolleri yazar, formüllerin sonucunu okur. A1'deki zaman damgası formülleri yeniden hesaplatır.
  async fiyatlar(liste) {
    if (!liste.length) return {};
    const id = await this.bul(), n = liste.length, son = String.fromCharCode(66 + GF_SUTUN.length);
    const satirlar = [[Date.now(), 'sembol', ...GF_ALAN]];
    liste.forEach((x, i) => {
      const r = i + 2;
      satirlar.push(['', x.gf, ...GF_SUTUN.map(a => /^(name|currency)$/.test(a)
        ? `=IF($A$1>0,IFERROR(GOOGLEFINANCE(B${r},"${a}"),""),"")`
        : `=IFERROR(GOOGLEFINANCE(B${r},"${a}")+0*$A$1,"")`)]);
    });
    const aralik = `A1:${son}${n + 1}`;
    let r;
    try {
      r = await dFetch(`${SHEETS}${id}/values/${aralik}?` + qs({ valueInputOption: 'USER_ENTERED', includeValuesInResponse: 'true', responseValueRenderOption: 'UNFORMATTED_VALUE' }),
        { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ range: aralik, majorDimension: 'ROWS', values: satirlar }) });
    } catch (e) {
      if (/not found|404/i.test(e.message)) { store.del('borsaTablo'); this.id = null; }
      throw e;
    }
    let deger = r.updatedData?.values || [];
    const bekliyor = rows => liste.some((x, i) => rows[i + 1]?.[2] === 'Loading...');
    const bos = rows => liste.filter((x, i) => rows[i + 1]?.[2] === '' || rows[i + 1]?.[2] == null).length;
    // GOOGLEFINANCE ilk seferde "Loading..." ya da boş döndürebilir; kısa aralıkla iki kez daha oku
    for (let k = 0; k < 2 && (bekliyor(deger) || bos(deger) > n / 2); k++) {
      await sleep(1400);
      deger = (await dFetch(`${SHEETS}${id}/values/${aralik}?valueRenderOption=UNFORMATTED_VALUE`)).values || deger;
    }
    const out = {};
    liste.forEach((x, i) => {
      const row = deger[i + 1] || [], o = {};
      GF_ALAN.forEach((a, j) => { const v = row[j + 2]; if (v !== '' && v != null && v !== 'Loading...') o[a] = typeof v === 'number' || /^(ad|para)$/.test(a) ? v : null; });
      if (o.fiyat > 0) out[x.id] = o;
    });
    return out;
  }
};

/* ═════════ Demo verisi (giriş yapmadan denemek için) ═════════ */
const DEMO_TABAN = {
  'THYAO.IS': 312, 'PGSUS.IS': 236, 'TAVHL.IS': 268, 'ASELS.IS': 168, 'OTKAR.IS': 455, 'FROTO.IS': 98, 'TOASO.IS': 236, 'DOAS.IS': 202, 'TTRAK.IS': 690,
  'GARAN.IS': 138, 'AKBNK.IS': 66, 'YKBNK.IS': 33, 'ISCTR.IS': 14.6, 'HALKB.IS': 27, 'VAKBN.IS': 29, 'TSKB.IS': 13.2,
  'KCHOL.IS': 172, 'SAHOL.IS': 95, 'DOHOL.IS': 17.5, 'ALARK.IS': 96, 'AGHOL.IS': 318, 'TKFEN.IS': 105, 'ENKAI.IS': 67, 'EKGYO.IS': 20.5,
  'BIMAS.IS': 548, 'MGROS.IS': 532, 'SOKM.IS': 48, 'MAVI.IS': 49, 'TUPRS.IS': 172, 'AKSEN.IS': 44, 'ENJSA.IS': 68, 'ASTOR.IS': 104,
  'PETKM.IS': 21, 'SASA.IS': 3.4, 'HEKTS.IS': 4.1, 'GUBRF.IS': 312, 'EREGL.IS': 28, 'KRDMD.IS': 28.5, 'SISE.IS': 39,
  'CIMSA.IS': 52, 'OYAKC.IS': 24, 'TCELL.IS': 99, 'TTKOM.IS': 58, 'ARCLK.IS': 128, 'VESTL.IS': 37, 'CCOLA.IS': 57, 'AEFES.IS': 17.5, 'ULKER.IS': 116,
  AAPL: 252, MSFT: 512, NVDA: 186, AVGO: 342, AMD: 214, INTC: 37, ORCL: 292, CRM: 246, ADBE: 352, GOOGL: 246, META: 712, NFLX: 1210, DIS: 113,
  AMZN: 222, TSLA: 438, MCD: 302, NKE: 71, WMT: 103, COST: 924, KO: 68, PEP: 141, JPM: 306, V: 342, MA: 568, 'BRK-B': 492, XOM: 113, CVX: 156,
  JNJ: 189, PFE: 25, UNH: 352, BA: 218,
  'XU100.IS': 10850, 'XU030.IS': 11920, '^GSPC': 6720, '^IXIC': 22810, '^DJI': 46600, '^GDAXI': 24350,
  'USDTRY=X': 41.75, 'EURTRY=X': 48.6, 'GBPTRY=X': 55.9, 'EURUSD=X': 1.164, 'GC=F': 3980, 'SI=F': 48.2, 'BZ=F': 65.4,
  'BTC-USD': 121400, 'ETH-USD': 4420, 'SOL-USD': 224, 'XRP-USD': 2.84, 'BNB-USD': 1240, 'DOGE-USD': 0.25
};
function rastgele(tohum) {   // Basit tekrarlanabilir rastgele sayı üreteci
  let h = 2166136261; for (const c of String(tohum)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const DEMO_GECMIS = {};
function demoGunluk(id) {
  if (DEMO_GECMIS[id]) return DEMO_GECMIS[id];
  if (id === 'GRAM-ALTIN') return null;
  const x = inst(id), r = rastgele(id), son = DEMO_TABAN[id] || 50;
  const yil = { bist: 0.42, abd: 0.12, endeks: x.para === 'TRY' ? 0.38 : 0.1, doviz: x.para === 'TRY' ? 0.3 : 0.02, emtia: 0.14, kripto: 0.5, diger: 0.1 }[x.tur] || 0.1;
  const oyn = { bist: 0.024, abd: 0.017, endeks: 0.012, doviz: 0.005, emtia: 0.011, kripto: 0.035, diger: 0.02 }[x.tur] || 0.02;
  const bugun = gunBasi(Date.now()), n = 6 * 365, t = [], c = [];
  const hafta = x.tur !== 'kripto';
  for (let i = n; i >= 0; i--) { const g = bugun - i * 864e5, w = new Date(g).getDay(); if (hafta && (w === 0 || w === 6)) continue; t.push(g + (x.para === 'TRY' ? 10 * 3600e3 : 16.5 * 3600e3)); }
  const gunluk = Math.log(1 + yil) / (hafta ? 252 : 365);
  let v = 0; const lv = [0];
  for (let i = 1; i < t.length; i++) { const z = (r() + r() + r() - 1.5) * 2; v += gunluk + oyn * z + Math.sin(i / 70) * oyn * 0.08; lv.push(v); }
  const fark = Math.log(son) - lv[lv.length - 1];
  lv.forEach(l => c.push(+Math.exp(l + fark).toFixed(son < 1 ? 5 : son < 10 ? 3 : 2)));
  const o = [], h = [], l = [], vol = [];
  c.forEach((k, i) => { const a = i ? c[i - 1] * (1 + (r() - 0.5) * oyn * 0.4) : k; o.push(+a.toFixed(4)); h.push(+(Math.max(a, k) * (1 + r() * oyn * 0.6)).toFixed(4)); l.push(+(Math.min(a, k) * (1 - r() * oyn * 0.6)).toFixed(4)); vol.push(Math.round((x.tur === 'bist' ? 3e7 : 4e7) * (0.5 + r()) / Math.max(1, son / 50))); });
  const div = [], spl = [];
  if (x.tur === 'bist' || x.tur === 'abd') {
    const oran = { bist: 0.035, abd: 0.012 }[x.tur] * (r() > 0.35 ? 1 : 0);
    if (oran) for (let y = 2020; y <= 2026; y++) { const gt = new Date(y, x.tur === 'bist' ? 4 : 2, 10 + Math.floor(r() * 10)).getTime(); if (gt > t[0] && gt < Date.now()) { const i = t.findIndex(z => z >= gt); if (i > 0) div.push([t[i], +(c[i] * oran).toFixed(3)]); } }
  }
  if (id === 'ASELS.IS') { const i = t.findIndex(z => z >= new Date(2024, 6, 15).getTime()); spl.push([t[i], 2, 1]); }   // örnek bedelsiz (%100)
  return (DEMO_GECMIS[id] = { t, o, h, l, c, v: vol, div, spl, meta: { para: x.para, ad: x.ad } });
}
function demoGunici(id) {
  const g = Veri.turet(id, demoGunluk) || demoGunluk(id), r = rastgele(id + 'gun'), n = g.c.length, kapanis = g.c[n - 1], acilis = g.c[n - 2];
  const bas = gunBasi(Date.now()) + (inst(id).para === 'TRY' ? 10 * 3600e3 : 16.5 * 3600e3) - 3 * 3600e3, t = [], c = [];
  const adim = 78; let v = acilis;
  for (let i = 0; i < adim; i++) { t.push(bas + i * 5 * 60e3); v = v + (kapanis - v) / (adim - i) + v * (r() - 0.5) * 0.003; c.push(+v.toFixed(4)); }
  c[c.length - 1] = kapanis;
  return { t, c, o: c, h: c, l: c, v: c.map(() => Math.round(1e5 * (0.5 + r()))), div: [], spl: [], meta: g.meta };
}
function demoFiyat(id) {
  const x = inst(id), g = Veri.turet(id, demoGunluk) || demoGunluk(id); if (!g) return null;
  const n = g.c.length, r = rastgele(id + 'fk');
  const son252 = g.c.slice(-252), hisse = x.tur === 'bist' || x.tur === 'abd';
  return { fiyat: g.c[n - 1], onceki: g.c[n - 2], acilis: g.o[n - 1], yuksek: g.h[n - 1], dusuk: g.l[n - 1], hacim: g.v[n - 1],
    y52: Math.max(...son252), d52: Math.min(...son252), ad: x.ad, para: x.para,
    pd: hisse ? g.c[n - 1] * (x.tur === 'bist' ? 2e9 : 6e9) * (0.3 + r() * 3) : null, fk: hisse ? +(4 + r() * 30).toFixed(2) : null, hbk: hisse ? +(g.c[n - 1] / (4 + r() * 30)).toFixed(2) : null };
}

/* ═════════ Veri: fiyatlar, geçmiş, haber, arama ═════════ */
const ARALIK = {
  '1G': { r: '1d', i: '5m', ad: '1 gün' }, '1H': { r: '5d', i: '30m', ad: '1 hafta' }, '1A': { r: '1mo', i: '1d', ad: '1 ay' },
  '3A': { r: '3mo', i: '1d', ad: '3 ay' }, '1Y': { r: '1y', i: '1d', ad: '1 yıl' }, '5Y': { r: '5y', i: '1d', ad: '5 yıl' }, 'T': { r: 'max', i: '1wk', ad: 'Tümü' }
};
const Veri = {
  q: store.get('borsaFiyat', {}),     // son bilinen fiyatlar (çevrimdışıyken de gösterilir)
  zaman: store.get('borsaFiyatZaman', 0),
  gecmis: {},                          // id|aralık → seri
  // Türetilen semboller (gram altın): iki serinin aynı günlerdeki çarpımı
  turet(id, al) {
    const x = KAT_BY[id]; if (!x?.tureyen) return null;
    const a = al(x.tureyen[0]), b = al(x.tureyen[1]); if (!a || !b) return null;
    const gun = ms => Math.floor(ms / 864e5), bm = new Map(); b.t.forEach((t, i) => b.c[i] != null && bm.set(gun(t), b.c[i]));
    const out = { t: [], o: [], h: [], l: [], c: [], v: [], div: [], spl: [], meta: { para: 'TRY', ad: x.ad } };
    let sonB = null;
    a.t.forEach((t, i) => {
      const kb = bm.get(gun(t)) ?? sonB; if (kb == null || a.c[i] == null) return; sonB = kb;
      const f = v => v == null ? null : +(v * kb / ONS_GRAM).toFixed(2);
      out.t.push(t); out.c.push(f(a.c[i])); out.o.push(f(a.o[i])); out.h.push(f(a.h[i])); out.l.push(f(a.l[i])); out.v.push(0);
    });
    return out;
  },
  async fiyatlar(ids, zorla) {
    ids = [...new Set(ids)];
    const tureyen = ids.filter(id => KAT_BY[id]?.tureyen);
    tureyen.forEach(id => KAT_BY[id].tureyen.forEach(t => ids.includes(t) || ids.push(t)));
    if (DEMO) { ids.forEach(id => { const f = demoFiyat(id); if (f) this.q[id] = { ...f, zaman: Date.now() }; }); this.zaman = Date.now(); return this.q; }
    const gfli = ids.map(inst).filter(x => x.gf);
    let gelen = {};
    try { gelen = await Tablo.fiyatlar(gfli); } catch (e) { if (e instanceof AuthError) throw e; console.warn('Tablo', e); B.tabloHata = e.message; }
    // Eksik ya da önceki kapanışı olmayanlar Suha Servis'ten
    const eksik = ids.filter(id => !KAT_BY[id]?.tureyen && (!gelen[id] || gelen[id].onceki == null));
    if (eksik.length) {
      for (let i = 0; i < eksik.length; i += 40) {
        try {
          const j = await servis('borsa-fiyat', { s: eksik.slice(i, i + 40) });
          Object.entries(j.f || {}).forEach(([id, o]) => { gelen[id] = { ...o, ...(gelen[id] || {}), onceki: gelen[id]?.onceki ?? o.onceki }; });
        } catch (e) { console.warn('servis fiyat', e.message); break; }
      }
    }
    Object.entries(gelen).forEach(([id, o]) => { if (KAT_BY[id]) o.para = KAT_BY[id].para; this.q[id] = { ...(this.q[id] || {}), ...o, zaman: Date.now() }; });
    tureyen.forEach(id => {
      const [a, b] = KAT_BY[id].tureyen.map(t => this.q[t]);
      if (a?.fiyat && b?.fiyat) this.q[id] = { fiyat: a.fiyat * b.fiyat / ONS_GRAM, onceki: a.onceki && b.onceki ? a.onceki * b.onceki / ONS_GRAM : null, para: 'TRY', ad: KAT_BY[id].ad, zaman: Date.now() };
    });
    this.zaman = Date.now();
    store.set('borsaFiyat', this.q); store.set('borsaFiyatZaman', this.zaman);
    return this.q;
  },
  deg(id) { const q = this.q[id]; return q?.fiyat && q?.onceki ? (q.fiyat / q.onceki - 1) * 100 : null; },
  async seri(id, ar = '1Y') {
    const A = ARALIK[ar], k = id + '|' + ar;
    if (this.gecmis[k] && Date.now() - this.gecmis[k].al < (A.i.endsWith('m') ? 5 * 60e3 : 30 * 60e3)) return this.gecmis[k].s;
    let s = null;
    if (DEMO) s = ar === '1G' ? demoGunici(id) : this.kes(this.turet(id, demoGunluk) || demoGunluk(id), ar);
    else if (KAT_BY[id]?.tureyen) {
      const [a, b] = await Promise.all(KAT_BY[id].tureyen.map(t => this.seri(t, ar === '1G' ? '1H' : ar).catch(() => null)));
      const m = { [KAT_BY[id].tureyen[0]]: a, [KAT_BY[id].tureyen[1]]: b };
      s = this.turet(id, t => m[t]);
      if (s && ar === '1G') s = this.kes(s, '1G');
    } else {
      const ck = 'borsaSeri:' + k, eski = store.get(ck);
      try {
        const j = await servis('borsa-gecmis', { s: id, r: A.r, i: A.i });
        s = { t: j.t.map(x => x * 1000), o: j.o, h: j.h, l: j.l, c: j.c, v: j.v, div: (j.div || []).map(([t, a]) => [t * 1000, a]), spl: (j.spl || []).map(([t, n, d]) => [t * 1000, n, d]), meta: j.meta || {} };
        // Boş (null) noktaları at
        const keep = s.c.map((v, i) => v != null);
        ['t', 'o', 'h', 'l', 'c', 'v'].forEach(f => s[f] = (s[f] || []).filter((_, i) => keep[i]));
        if (/^(1Y|5Y|T)$/.test(ar)) try { store.set(ck, { al: Date.now(), s }); } catch {}
      } catch (e) {
        if (eski?.s) s = eski.s; else throw e;
      }
    }
    if (s) this.gecmis[k] = { al: Date.now(), s };
    return s;
  },
  kes(s, ar) {   // demo: günlük seriyi istenen aralığa kes
    if (!s) return s;
    const gun = { '1G': 1, '1H': 7, '1A': 31, '3A': 92, '1Y': 366, '5Y': 1827, 'T': 1e5 }[ar], sinir = Date.now() - gun * 864e5;
    const i = Math.max(0, s.t.findIndex(t => t >= sinir));
    const cut = f => (s[f] || []).slice(i);
    return { ...s, t: cut('t'), o: cut('o'), h: cut('h'), l: cut('l'), c: cut('c'), v: cut('v') };
  },
  async haber(id) {
    const x = inst(id);
    if (DEMO) return [
      { baslik: `${x.ad} için yılın ilk yarısında güçlü sonuç beklentisi`, kaynak: 'Örnek Haber', tarih: Date.now() - 3 * 3600e3, link: '#' },
      { baslik: `Piyasalarda gün sonu: ${x.kod} öne çıktı`, kaynak: 'Örnek Ekonomi', tarih: Date.now() - 26 * 3600e3, link: '#' },
      { baslik: `Analistler ${x.ad} hakkında ne diyor?`, kaynak: 'Örnek Finans', tarih: Date.now() - 3 * 864e5, link: '#' }
    ];
    const q = x.tur === 'bist' ? `${x.kod} hisse` : x.tur === 'abd' ? `${x.ad} hisse` : x.ad.split('/')[0].trim();
    return (await servis('borsa-haber', { q })).h || [];
  },
  async ara(q) {
    const k = arNorm(q.trim()); if (!k) return [];
    const yerel = katAra(k);
    let uzak = [];
    if (!DEMO && k.length >= 2) {
      try { uzak = ((await servis('borsa-ara', { q })).a || []).filter(a => !KAT_BY[a.s]).map(a => ({ ...yeniInst(a.s, a.ad, a.borsa), borsaAd: a.borsa })); } catch {}
    }
    // Doğrudan kod yazıldıysa (ör. "KONTR") Borsa İstanbul sembolü olarak da öner
    const kod = q.trim().toUpperCase();
    if (/^[A-Z0-9]{3,6}$/.test(kod) && !yerel.length && !KAT_BY[kod + '.IS'] && !uzak.some(u => u.id === kod + '.IS')) uzak.push({ ...yeniInst(kod + '.IS'), tahmin: true });
    return [...yerel, ...uzak].slice(0, 30);
  }
};

/* ═════════ Teknik göstergeler ═════════ */
const TA = {
  sma(c, n) { const o = new Array(c.length).fill(null); let s = 0; for (let i = 0; i < c.length; i++) { s += c[i]; if (i >= n) s -= c[i - n]; if (i >= n - 1) o[i] = s / n; } return o; },
  ema(c, n) { const o = new Array(c.length).fill(null), k = 2 / (n + 1); let e = null; for (let i = 0; i < c.length; i++) { if (i === n - 1) e = c.slice(0, n).reduce((a, b) => a + b, 0) / n; else if (i >= n) e = c[i] * k + e * (1 - k); o[i] = e; } return o; },
  rsi(c, n = 14) {
    const o = new Array(c.length).fill(null); let g = 0, l = 0;
    for (let i = 1; i < c.length; i++) {
      const d = c[i] - c[i - 1], up = Math.max(d, 0), dn = Math.max(-d, 0);
      if (i <= n) { g += up; l += dn; if (i === n) { g /= n; l /= n; o[i] = l === 0 ? 100 : 100 - 100 / (1 + g / l); } }
      else { g = (g * (n - 1) + up) / n; l = (l * (n - 1) + dn) / n; o[i] = l === 0 ? 100 : 100 - 100 / (1 + g / l); }
    }
    return o;
  },
  macd(c) {
    const a = this.ema(c, 12), b = this.ema(c, 26), m = c.map((_, i) => a[i] != null && b[i] != null ? a[i] - b[i] : null);
    const ilk = m.findIndex(v => v != null), sig = new Array(c.length).fill(null);
    if (ilk >= 0) { const s = this.ema(m.slice(ilk), 9); s.forEach((v, i) => sig[ilk + i] = v); }
    return { m, sig, hist: m.map((v, i) => v != null && sig[i] != null ? v - sig[i] : null) };
  },
  boll(c, n = 20, k = 2) {
    const ort = this.sma(c, n), ust = [], alt = [];
    c.forEach((_, i) => { if (ort[i] == null) { ust.push(null); alt.push(null); return; } let s = 0; for (let j = i - n + 1; j <= i; j++) s += (c[j] - ort[i]) ** 2; const sd = Math.sqrt(s / n); ust.push(ort[i] + k * sd); alt.push(ort[i] - k * sd); });
    return { ort, ust, alt };
  }
};

/* ═════════ Portföy hesapları ═════════
   Ortalama maliyet yöntemi. Bölünme ve bedelsizler (geçmiş verisindeki "split" kayıtları) işlem tarihinden
   sonra gerçekleştiyse adet ve fiyat buna göre düzeltilir. Tutarlar sembolün kendi para birimindedir;
   TL karşılıkları için o günün kuru kullanılır. */
function bolunmeCarpani(spl, t) { let k = 1; (spl || []).forEach(([st, n, d]) => { if (st > t && n > 0 && d > 0) k *= n / d; }); return k; }
function portfoyHesap(islemler, splMap = {}) {
  const P = {};
  [...islemler].sort((a, b) => a.t - b.t).forEach(x => {
    const p = P[x.s] || (P[x.s] = { s: x.s, adet: 0, maliyet: 0, gerceklesen: 0, temettu: 0, komisyon: 0, ilk: x.t, islem: 0, bolunme: 0 });
    const k = bolunmeCarpani(splMap[x.s], x.t);
    if (k !== 1) p.bolunme = k;
    const adet = (+x.adet || 0) * k, fiyat = (+x.fiyat || 0) / k, kom = +x.kom || 0;
    p.islem++;
    if (x.tip === 'al') { p.maliyet += adet * fiyat + kom; p.adet += adet; p.komisyon += kom; }
    else if (x.tip === 'sat') {
      const ort = p.adet > 0 ? p.maliyet / p.adet : 0, a = Math.min(adet, p.adet);
      p.gerceklesen += a * (fiyat - ort) - kom; p.maliyet -= a * ort; p.adet -= a; p.komisyon += kom;
      if (p.adet < 1e-9) { p.adet = 0; p.maliyet = 0; }
    } else if (x.tip === 'temettu') p.temettu += +x.tutar || adet * fiyat;
  });
  return Object.values(P);
}
// Belirli bir günde elde tutulan adet (bölünme düzeltmeli, bugünkü ölçekte)
function eldekiAdet(islemler, s, t, spl) {
  let a = 0;
  islemler.filter(x => x.s === s && x.t <= t).sort((x, y) => x.t - y.t).forEach(x => {
    const n = (+x.adet || 0) * bolunmeCarpani(spl, x.t);
    if (x.tip === 'al') a += n; else if (x.tip === 'sat') a = Math.max(0, a - n);
  });
  return a;
}
// Bir serinin belli gündeki (ya da önceki son) kapanışı
function seriDeger(s, t) {
  if (!s?.t?.length) return null;
  let lo = 0, hi = s.t.length - 1;
  if (t < s.t[0]) return s.c[0];
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (s.t[m] <= t + 12 * 3600e3) lo = m; else hi = m - 1; }
  return s.c[lo];
}
