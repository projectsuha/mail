/* ───────────── Takvim · hesap motoru ─────────────
   Tarih işlemleri, tekrarlayan etkinlikler, resmî tatiller, hızlı yazı çözümleyici, .ics aç/kaydet.
   Ekrandan bağımsızdır (testler Node'da da çalıştırır). Tüm veriler girişte temizlenir. */
(function (kok) {
  'use strict';

  const pad = n => String(n).padStart(2, '0');
  const dn = s => { const [y, m, d] = s.split('-').map(Number); return Math.floor(Date.UTC(y, m - 1, d) / 864e5); };   // gün numarası
  const ds = n => { const t = new Date(n * 864e5); return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`; };
  const hafGun = n => (((n + 3) % 7) + 7) % 7;            // 0 = Pazartesi
  const gecerliTarih = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && ds(dn(s)) === s && +s.slice(0, 4) >= 1900 && +s.slice(0, 4) <= 2200;
  const gecerliSaat = s => typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
  const dk = s => +s.slice(0, 2) * 60 + +s.slice(3, 5);   // "HH:MM" → dakika
  const saatYaz = m => `${pad(Math.floor(m / 60) % 24)}:${pad(m % 60)}`;
  const bugun = () => { const t = new Date(); return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`; };
  const gunEkle = (s, n) => ds(dn(s) + n);
  const ayEkle = (s, n) => {                              // ay ekle, gün taşarsa ayın son gününe indir
    const y = +s.slice(0, 4), m = +s.slice(5, 7) - 1 + n, d = +s.slice(8, 10);
    const yy = y + Math.floor(m / 12), mm = ((m % 12) + 12) % 12, son = new Date(Date.UTC(yy, mm + 1, 0)).getUTCDate();
    return `${yy}-${pad(mm + 1)}-${pad(Math.min(d, son))}`;
  };
  const ayGun = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();   // m: 1-12
  const haftaBasi = s => ds(dn(s) - hafGun(dn(s)));
  const haftaNo = s => {                                  // ISO hafta numarası
    const n = dn(s), pzt = n - hafGun(n), per = pzt + 3, yil = new Date(per * 864e5).getUTCFullYear();
    const ilk = Math.floor(Date.UTC(yil, 0, 1) / 864e5), ilkPer = ilk + ((3 - hafGun(ilk)) + 7) % 7;
    return Math.floor((per - ilkPer) / 7) + 1;
  };
  const rastgeleId = () => { const a = new Uint8Array(8); (kok.crypto || {}).getRandomValues ? kok.crypto.getRandomValues(a) : a.forEach((_, i) => a[i] = Math.random() * 256); return Array.from(a, b => (b % 36).toString(36)).join(''); };

  const AY = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const GUN = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  const GUN3 = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const RENK = [['Kırmızı', '#e5533d'], ['Turuncu', '#f08c2e'], ['Sarı', '#d9a514'], ['Yeşil', '#3aa76d'], ['Turkuaz', '#1fa5a5'], ['Mavi', '#3d7be5'], ['Mor', '#8a5be0'], ['Gri', '#6b7280']];

  /* ═════════ Resmî tatiller ═════════
     Sabit günler her yıl; dinî bayramların tarihi her yıl değiştiği için 2025–2027 tablosu var. */
  const SABIT = [['01-01', 'Yılbaşı'], ['04-23', 'Ulusal Egemenlik ve Çocuk Bayramı'], ['05-01', 'Emek ve Dayanışma Günü'], ['05-19', 'Atatürk\'ü Anma, Gençlik ve Spor Bayramı'],
    ['07-15', 'Demokrasi ve Millî Birlik Günü'], ['08-30', 'Zafer Bayramı'], ['10-29', 'Cumhuriyet Bayramı']];
  /* Dinî bayramlar: 2025–2027 Diyanet takvimiyle doğrulandı (kesin). Sonrası Umm al-Qura takviminden hesaplandı:
     genellikle Diyanet ile aynı çıkar ama bir gün sapabilir; Diyanet açıklayınca tablo kesinleştirilmeli (etiket "tahmini"). */
  const BAYRAM = [
    ['ramazan', '2025-03-30', 3, 1], ['kurban', '2025-06-06', 4, 1], ['ramazan', '2026-03-20', 3, 1], ['kurban', '2026-05-27', 4, 1],
    ['ramazan', '2027-03-09', 3, 1], ['kurban', '2027-05-16', 4, 1],
    ...["2028-02-26", "2029-02-14", "2030-02-04", "2031-01-24", "2032-01-14", "2033-01-03", "2033-12-23", "2034-12-12", "2035-12-01", "2036-11-19", "2037-11-09", "2038-10-29", "2039-10-19", "2040-10-07"].map(d => ['ramazan', d, 3, 0]), ...["2028-05-05", "2029-04-24", "2030-04-13", "2031-04-02", "2032-03-22", "2033-03-12", "2034-03-01", "2035-02-19", "2036-02-08", "2037-01-27", "2038-01-16", "2039-01-05", "2039-12-26", "2040-12-15"].map(d => ['kurban', d, 4, 0])
  ];
  const BAYRAM_AD = { ramazan: 'Ramazan Bayramı', kurban: 'Kurban Bayramı' };
  const tatilYil = yil => {
    const m = {};
    for (const [md, ad] of SABIT) m[`${yil}-${md}`] = ad;
    m[`${yil}-10-28`] = 'Cumhuriyet Bayramı arifesi (yarım gün)';
    for (const [tur, ilk, n, kesin] of BAYRAM) {
      const b = dn(ilk), ek = kesin ? '' : ' (tahmini)';
      const yaz = (d, ad, tam) => { const t = ds(d); if (t.startsWith(yil + '-')) m[t] = tam ? ad : ad + ek; };
      yaz(b - 1, `${BAYRAM_AD[tur]} arifesi (yarım gün${kesin ? '' : ', tahmini'})`, true);
      for (let k = 0; k < n; k++) yaz(b + k, `${BAYRAM_AD[tur]} · ${k + 1}. gün`);
    }
    return m;
  };
  const tatilAra = (a, b) => {   // aralıktaki tatiller: { 'YYYY-MM-DD': ad }
    const o = {};
    for (let y = +a.slice(0, 4); y <= +b.slice(0, 4); y++) { const t = tatilYil(y); for (const k in t) if (k >= a && k <= b) o[k] = t[k]; }
    return o;
  };

  /* ═════════ Etkinlik temizleme (depodan, dosyadan gelen her şey buradan geçer) ═════════ */
  const metin = (v, n) => (typeof v === 'string' ? v : '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').slice(0, n);
  function temizle(o) {
    if (!o || typeof o !== 'object') return null;
    const e = { id: typeof o.id === 'string' && /^[a-z0-9]{6,16}$/.test(o.id) ? o.id : rastgeleId() };
    e.ad = metin(o.ad, 200).replace(/\s+/g, ' ').trim(); if (!e.ad) e.ad = '(Başlıksız)';
    if (!gecerliTarih(o.g)) return null;
    e.g = o.g; e.tum = !!o.tum;
    e.g2 = gecerliTarih(o.g2) && o.g2 >= o.g ? o.g2 : o.g;
    if (!e.tum) {
      e.b = gecerliSaat(o.b) ? o.b : '09:00';
      e.b2 = gecerliSaat(o.b2) ? o.b2 : '';
      if (e.g2 === e.g && e.b2 && dk(e.b2) < dk(e.b)) e.b2 = '';
    }
    if (typeof o.uid === 'string' && o.uid.trim()) e.uid = metin(o.uid, 120).replace(/\s/g, '');
    e.renk = Number.isInteger(o.renk) && o.renk >= 0 && o.renk < RENK.length ? o.renk : 5;
    e.yer = metin(o.yer, 200).trim(); e.not = metin(o.not, 4000);
    if (o.tek && typeof o.tek === 'object' && ['g', 'h', 'a', 'y'].includes(o.tek.s)) {
      const t = { s: o.tek.s, n: Math.min(99, Math.max(1, o.tek.n | 0 || 1)) };
      if (t.s === 'h' && Array.isArray(o.tek.gun)) { const g = [...new Set(o.tek.gun.filter(x => Number.isInteger(x) && x >= 0 && x < 7))].sort(); if (g.length) t.gun = g; }
      if (gecerliTarih(o.tek.bit) && o.tek.bit >= e.g) t.bit = o.tek.bit;
      e.tek = t;
    }
    if (Array.isArray(o.ist)) { const i = o.ist.filter(gecerliTarih).slice(0, 2000); if (i.length) e.ist = i; }
    if (Number.isInteger(o.hat) && o.hat >= 0 && o.hat <= 60 * 24 * 14) e.hat = o.hat;
    return e;
  }

  /* ═════════ Tekrarlayan etkinliklerin açılımı ═════════ */
  function olusumlar(e, a, b) {   // a..b (dahil) aralığına düşen oluşumlar
    const s = dn(e.g), son = dn(e.g2 || e.g), sure = Math.max(0, son - s), A = dn(a), B = dn(b), c = [];
    const ekle = d => { if (e.ist && e.ist.includes(ds(d))) return; c.push({ e, g: ds(d), g2: ds(d + sure), b: e.tum ? '' : e.b, b2: e.tum ? '' : e.b2 || '', tum: !!e.tum }); };
    const r = e.tek;
    if (!r) { if (s <= B && son >= A) ekle(s); return c; }
    const n = Math.max(1, r.n | 0 || 1), bit = r.bit ? dn(r.bit) : Infinity;
    const lo = Math.max(s, A - sure), hi = Math.min(B, bit, lo + 4000);
    const y0 = +e.g.slice(0, 4), m0 = +e.g.slice(5, 7), d0 = +e.g.slice(8, 10), hb = s - hafGun(s);
    for (let d = lo; d <= hi; d++) {
      let ok = false;
      if (r.s === 'g') ok = (d - s) % n === 0;
      else if (r.s === 'h') ok = (r.gun && r.gun.length ? r.gun : [hafGun(s)]).includes(hafGun(d)) && Math.floor((d - hb) / 7) % n === 0;
      else { const t = new Date(d * 864e5), y = t.getUTCFullYear(), m = t.getUTCMonth() + 1, g = t.getUTCDate();
        if (r.s === 'a') ok = g === d0 && ((y - y0) * 12 + (m - m0)) % n === 0;
        else ok = g === d0 && m === m0 && (y - y0) % n === 0; }
      if (ok) ekle(d);
    }
    return c;
  }
  const hepsi = (liste, a, b) => liste.flatMap(e => olusumlar(e, a, b));
  const sirala = (x, y) => (x.g + (x.tum ? '' : x.b || '')).localeCompare(y.g + (y.tum ? '' : y.b || '')) || (y.tum - x.tum) || x.e.ad.localeCompare(y.e.ad, 'tr');

  /* Bir oluşumun belirli bir güne düşen kısmı: [başlangıç dk, bitiş dk] (tüm gün ise null) */
  function parca(o, gun) {
    if (o.tum || gun < o.g || gun > o.g2) return null;
    const bas = gun === o.g ? dk(o.b) : 0;
    let bit = gun === o.g2 ? (o.b2 ? dk(o.b2) : Math.min(1440, dk(o.b) + 60)) : 1440;
    if (gun === o.g && gun !== o.g2) bit = 1440;
    if (bit <= bas) bit = Math.min(1440, bas + 30);
    return [bas, bit];
  }
  /* Gün sütunu için çakışma yerleşimi: her parçaya sütun (k) ve sütun sayısı (n) verir */
  function yerlestir(parcalar) {
    const p = parcalar.slice().sort((x, y) => x.a - y.a || y.b - x.b), kume = []; let bitis = -1, mevcut = [];
    const kapat = () => { const n = mevcut.reduce((m, x) => Math.max(m, x.k + 1), 1); mevcut.forEach(x => x.n = n); kume.push(...mevcut); mevcut = []; };
    for (const x of p) {
      if (mevcut.length && x.a >= bitis) { kapat(); bitis = -1; }
      const dolu = new Set(mevcut.filter(y => y.b > x.a).map(y => y.k)); let k = 0; while (dolu.has(k)) k++;
      x.k = k; mevcut.push(x); bitis = Math.max(bitis, x.b);
    }
    kapat(); return kume;
  }

  /* ═════════ Hatırlatma zamanları ═════════ */
  function hatirlatmalar(liste, a, b) {   // [{zaman(ms), o}] — a..b tarih aralığındaki oluşumlar için
    const c = [];
    for (const o of hepsi(liste, gunEkle(a, -1), gunEkle(b, 1))) {
      if (o.e.hat == null) continue;
      const [y, m, d] = o.g.split('-').map(Number);
      const t = o.tum ? new Date(y, m - 1, d, 9, 0) : new Date(y, m - 1, d, +o.b.slice(0, 2), +o.b.slice(3, 5));
      const z = +t - o.e.hat * 60000;
      c.push({ zaman: z, o, anahtar: `${o.e.id}|${o.g}|${o.e.hat}` });
    }
    return c.sort((x, y) => x.zaman - y.zaman);
  }

  /* ═════════ Hızlı yazı: "yarın 15:00 diş hekimi" ═════════ */
  const GUNAD = { pazartesi: 0, 'salı': 1, sali: 1, 'çarşamba': 2, carsamba: 2, 'perşembe': 3, persembe: 3, cuma: 4, cumartesi: 5, pazar: 6 };
  const AYAD = { ocak: 1, 'şubat': 2, subat: 2, mart: 3, nisan: 4, 'mayıs': 5, mayis: 5, haziran: 6, temmuz: 7, 'ağustos': 8, agustos: 8, 'eylül': 9, eylul: 9, ekim: 10, 'kasım': 11, kasim: 11, 'aralık': 12, aralik: 12 };
  function hizliCoz(girdi, bugunS) {
    let t = ' ' + metin(girdi, 300).toLocaleLowerCase('tr') + ' ', orj = ' ' + metin(girdi, 300) + ' ';
    const kes = re => { const m = t.match(re); if (!m) return null; const i = m.index; t = t.slice(0, i) + ' '.repeat(m[0].length) + t.slice(i + m[0].length); orj = orj.slice(0, i) + ' '.repeat(m[0].length) + orj.slice(i + m[0].length); return m; };
    let g = null, b = '', b2 = '';
    let m;
    if ((m = kes(/(?<![\p{L}\d])(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})(?![\d])/u))) { b = saatYaz(+m[1] * 60 + +m[2]); b2 = saatYaz(+m[3] * 60 + +m[4]); }
    else if ((m = kes(/(?<![\p{L}\d.])(\d{1,2}):(\d{2})(?![\d])/u))) b = saatYaz(+m[1] * 60 + +m[2]);
    else if ((m = kes(/(?<![\p{L}\d.])(\d{1,2})\.(1[3-9]|[2-5]\d)(?![\d.])/u)) && +m[1] < 24) b = saatYaz(+m[1] * 60 + +m[2]);
    else if ((m = kes(/(?<![\p{L}\d])saat\s+(\d{1,2})(?:[:.](\d{2}))?(?![\d])/u))) b = saatYaz(+m[1] * 60 + (+m[2] || 0));
    else if ((m = kes(/(?<![\p{L}\d.])(\d{1,2})\s*['’]\s*(?:te|ta|de|da)(?![\p{L}])/u))) b = saatYaz(+m[1] * 60);
    if (b && (+b.slice(0, 2) > 23 || +b.slice(3) > 59)) b = '';
    const bg = dn(bugunS);
    if ((m = kes(/(?<![\p{L}\d])(\d{1,2})\s+(ocak|şubat|subat|mart|nisan|mayıs|mayis|haziran|temmuz|ağustos|agustos|eylül|eylul|ekim|kasım|kasim|aralık|aralik)(?:\s+(\d{4}))?(?![\p{L}])/u))) {
      const ay = AYAD[m[2]]; let y = m[3] ? +m[3] : +bugunS.slice(0, 4);
      let s = `${y}-${pad(ay)}-${pad(+m[1])}`; if (!m[3] && gecerliTarih(s) && s < bugunS) s = `${y + 1}-${pad(ay)}-${pad(+m[1])}`;
      if (gecerliTarih(s)) g = s;
    } else if ((m = kes(/(?<![\d.])(\d{1,2})[./](\d{1,2})(?:[./](\d{4}))?(?![\d:])/u))) {
      let y = m[3] ? +m[3] : +bugunS.slice(0, 4), s = `${y}-${pad(+m[2])}-${pad(+m[1])}`; if (!m[3] && gecerliTarih(s) && s < bugunS) s = `${y + 1}-${pad(+m[2])}-${pad(+m[1])}`;
      if (gecerliTarih(s)) g = s;
    } else if (kes(/(?<![\p{L}])(?:öbür|obur)\s*gün(?![\p{L}])/u)) g = ds(bg + 2);
    else if (kes(/(?<![\p{L}])yarın(?![\p{L}])/u)) g = ds(bg + 1);
    else if (kes(/(?<![\p{L}])bugün(?![\p{L}])/u)) g = bugunS;
    else if ((m = kes(/(?<![\p{L}])(haftaya\s+)?(pazartesi|salı|sali|çarşamba|carsamba|perşembe|persembe|cumartesi|cuma|pazar)(?![\p{L}])/u))) {
      const hedef = GUNAD[m[2]]; let fark = (hedef - hafGun(bg) + 7) % 7; if (fark === 0) fark = 7; if (m[1] && fark < 7) fark += 7;
      g = ds(bg + fark);
    }
    let ad = orj.replace(/\s+/g, ' ').replace(/^[\s,:\-–]+|[\s,:\-–]+$/g, '').trim();
    if (ad) ad = ad[0].toLocaleUpperCase('tr') + ad.slice(1);
    return { ad, g, b, b2, tum: !!g && !b };
  }

  /* ═════════ .ics yaz ═════════ */
  const icsKac = s => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  const icsKatla = s => { const o = []; let k = s; while (k.length > 73) { o.push(k.slice(0, 73)); k = ' ' + k.slice(73); } o.push(k); return o.join('\r\n'); };
  const icsTarih = (g, b) => g.replace(/-/g, '') + (b ? 'T' + b.replace(':', '') + '00' : '');
  const BGUN = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
  function icsYaz(liste) {
    const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Suha//Takvim//TR', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:Suha Takvim'];
    const z = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    for (const e of liste) {
      L.push('BEGIN:VEVENT', `UID:${e.uid || e.id + '@suha-takvim'}`, `DTSTAMP:${z}`);
      if (e.tum) { L.push(`DTSTART;VALUE=DATE:${icsTarih(e.g)}`, `DTEND;VALUE=DATE:${icsTarih(gunEkle(e.g2 || e.g, 1))}`); }
      else {
        L.push(`DTSTART:${icsTarih(e.g, e.b)}`);
        const bit = e.b2 || (e.g2 === e.g ? saatYaz(Math.min(1439, dk(e.b) + 60)) : e.b);
        L.push(`DTEND:${icsTarih(e.g2 || e.g, bit)}`);
      }
      L.push(icsKatla('SUMMARY:' + icsKac(e.ad)));
      if (e.yer) L.push(icsKatla('LOCATION:' + icsKac(e.yer)));
      if (e.not) L.push(icsKatla('DESCRIPTION:' + icsKac(e.not)));
      if (e.tek) {
        const r = e.tek; let s = 'RRULE:FREQ=' + { g: 'DAILY', h: 'WEEKLY', a: 'MONTHLY', y: 'YEARLY' }[r.s] + ';INTERVAL=' + r.n;
        if (r.s === 'h' && r.gun) s += ';BYDAY=' + r.gun.map(i => BGUN[i]).join(',');
        if (r.bit) s += ';UNTIL=' + (e.tum ? icsTarih(r.bit) : icsTarih(r.bit, '23:59'));
        L.push(s);
      }
      if (e.ist) for (const i of e.ist) L.push(e.tum ? `EXDATE;VALUE=DATE:${icsTarih(i)}` : `EXDATE:${icsTarih(i, e.b)}`);
      if (e.hat != null) L.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsKac(e.ad), `TRIGGER:-PT${e.hat}M`, 'END:VALARM');
      L.push('END:VEVENT');
    }
    L.push('END:VCALENDAR');
    return L.join('\r\n') + '\r\n';
  }

  /* ═════════ .ics oku (basit ve temkinli: bilmediğini atlar) ═════════ */
  const icsAc = s => String(s).replace(/\\n/gi, '\n').replace(/\\([,;\\])/g, '$1');
  function icsZaman(deger, param) {
    const m = String(deger).trim().match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/);
    if (!m) return null;
    if (!m[4]) { const g = `${m[1]}-${m[2]}-${m[3]}`; return gecerliTarih(g) ? { g, tum: true } : null; }
    let y = +m[1], mo = +m[2], d = +m[3], h = +m[4], mi = +m[5];
    if (m[7]) { const t = new Date(Date.UTC(y, mo - 1, d, h, mi)); y = t.getFullYear(); mo = t.getMonth() + 1; d = t.getDate(); h = t.getHours(); mi = t.getMinutes(); }
    const g = `${y}-${pad(mo)}-${pad(d)}`; return gecerliTarih(g) ? { g, b: `${pad(h)}:${pad(mi)}`, tum: false } : null;
  }
  function icsOku(yazi, enCok = 5000) {
    const sonuc = { etkinlikler: [], atlanan: 0, sade: 0 };
    const satirlar = String(yazi).slice(0, 4e6).replace(/\r\n?/g, '\n').replace(/\n[ \t]/g, '').split('\n');
    let o = null, alarm = false;
    for (const s of satirlar) {
      if (s === 'BEGIN:VEVENT') { o = { ozel: {} }; alarm = false; continue; }
      if (s === 'END:VEVENT') {
        if (o && o.bas) {
          if (sonuc.etkinlikler.length >= enCok) { sonuc.atlanan++; o = null; continue; }
          const e = { uid: o.uid, ad: o.ad, g: o.bas.g, tum: o.bas.tum, b: o.bas.b, yer: o.yer, not: o.not, renk: 5 };
          if (o.bit) {
            if (o.bas.tum) { const son = gunEkle(o.bit.g, -1); e.g2 = son >= e.g ? son : e.g; }
            else { e.g2 = o.bit.g; e.b2 = o.bit.b || ''; }
          }
          if (o.rr) {
            const f = { DAILY: 'g', WEEKLY: 'h', MONTHLY: 'a', YEARLY: 'y' }[o.rr.FREQ];
            if (f) {
              e.tek = { s: f, n: +o.rr.INTERVAL || 1 };
              if (f === 'h' && o.rr.BYDAY) { const g = o.rr.BYDAY.split(',').map(x => BGUN.indexOf(x.slice(-2))).filter(x => x >= 0); if (g.length) e.tek.gun = g; }
              if (o.rr.UNTIL) { const u = icsZaman(o.rr.UNTIL); if (u) e.tek.bit = u.g; }
              else if (o.rr.COUNT && +o.rr.COUNT > 0) {
                const gec = temizle({ ...e, g: e.g, tek: { ...e.tek } });
                if (gec) { const hepsiO = olusumlar(gec, e.g, gunEkle(e.g, Math.min(36500, +o.rr.COUNT * e.tek.n * 370))); const k = hepsiO[Math.min(+o.rr.COUNT, hepsiO.length) - 1]; if (k) e.tek.bit = k.g; }
              }
              if (o.rr.BYMONTHDAY || o.rr.BYSETPOS || (o.rr.BYDAY && f !== 'h')) sonuc.sade++;
            } else sonuc.sade++;
          }
          if (o.ist.length) e.ist = o.ist;
          if (o.hat != null) e.hat = o.hat;
          const t = temizle(e); if (t) sonuc.etkinlikler.push(t); else sonuc.atlanan++;
        } else if (o) sonuc.atlanan++;
        o = null; continue;
      }
      if (!o) continue;
      if (s === 'BEGIN:VALARM') { alarm = true; continue; }
      if (s === 'END:VALARM') { alarm = false; continue; }
      const i = s.indexOf(':'); if (i < 1) continue;
      const [ad, ...prm] = s.slice(0, i).toUpperCase().split(';'), val = s.slice(i + 1);
      if (!o.ist) o.ist = [];
      if (alarm) { if (ad === 'TRIGGER') { const m = val.match(/^-P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/); if (m && (m[1] || m[2] || m[3] || val === '-PT0S')) o.hat = (+m[1] || 0) * 1440 + (+m[2] || 0) * 60 + (+m[3] || 0); else if (/^-PT0S$/.test(val)) o.hat = 0; } continue; }
      if (ad === 'UID') o.uid = val.trim();
      else if (ad === 'SUMMARY') o.ad = icsAc(val);
      else if (ad === 'LOCATION') o.yer = icsAc(val);
      else if (ad === 'DESCRIPTION') o.not = icsAc(val);
      else if (ad === 'DTSTART') o.bas = icsZaman(val, prm);
      else if (ad === 'DTEND') o.bit = icsZaman(val, prm);
      else if (ad === 'RRULE') { o.rr = {}; for (const p of val.toUpperCase().split(';')) { const [k, v] = p.split('='); if (k && v) o.rr[k] = v; } }
      else if (ad === 'EXDATE') for (const v of val.split(',')) { const z = icsZaman(v); if (z) o.ist.push(z.g); }
    }
    return sonuc;
  }

  function gorevTemizle(o) {
    if (!o || typeof o !== 'object') return null;
    const ad = metin(o.ad, 200).replace(/\s+/g, ' ').trim(); if (!ad) return null;
    const t = { id: typeof o.id === 'string' && /^[a-z0-9]{6,16}$/.test(o.id) ? o.id : rastgeleId(), ad, bitti: !!o.bitti };
    if (gecerliTarih(o.g)) t.g = o.g;
    if (t.bitti && Number.isFinite(o.bz)) t.bz = Math.floor(o.bz);
    const n = metin(o.not, 1000).trim(); if (n) t.not = n;
    return t;
  }
  /* Etkinliği bir oluşumundan başlayarak kaydır (sürükle-bırak): yeni değerlerle seri alanları */
  function seriKaydir(e, occG, yeni) {
    const kayma = dn(yeni.g) - dn(occG), g = ds(dn(e.g) + kayma), o = { ...e, g, g2: ds(dn(g) + (dn(yeni.g2) - dn(yeni.g))), b: yeni.b, b2: yeni.b2 };
    if (e.ist) o.ist = e.ist.map(i => ds(dn(i) + kayma));
    if (e.tek) {
      o.tek = { ...e.tek };
      if (o.tek.bit) o.tek.bit = ds(dn(o.tek.bit) + kayma);
      if (o.tek.gun) o.tek.gun = [...new Set(o.tek.gun.map(x => (((x + kayma) % 7) + 7) % 7))].sort();
    }
    return o;
  }

  kok.TK = { pad, dn, ds, hafGun, gecerliTarih, gecerliSaat, dk, saatYaz, bugun, gunEkle, ayEkle, ayGun, haftaBasi, haftaNo, rastgeleId, AY, GUN, GUN3, RENK,
    tatilYil, tatilAra, temizle, gorevTemizle, seriKaydir, olusumlar, hepsi, sirala, parca, yerlestir, hatirlatmalar, hizliCoz, icsYaz, icsOku };
  if (typeof module !== 'undefined') module.exports = kok.TK;
})(typeof window !== 'undefined' ? window : globalThis);
