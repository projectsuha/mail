/* ───────────── Hava ─────────────
   Hava durumu: anlık, saatlik (48 saat), 10 günlük, önümüzdeki 2 saatte yağış, hava kalitesi ve polen.
   Veri: Open-Meteo (ücretsiz, anahtar istemez, CC BY 4.0). Giriş gerekmez; yerlerin sadece bu cihazda saklanır.
   Hava kaynağına sadece koordinat gider; kim olduğun gitmez. */
'use strict';

window.APP_NAME = 'Hava';
window.APP_ICON = 'hava-apple.png?v=8';
window.APP_LEAD = 'Saatlik ve 10 günlük hava durumu, yağış uyarısı, hava kalitesi. Ücretsiz, reklamsız.';

const HAPI = {
  tahmin: 'https://api.open-meteo.com/v1/forecast',
  hava: 'https://air-quality-api.open-meteo.com/v1/air-quality',
  ara: 'https://geocoding-api.open-meteo.com/v1/search',
  adres: 'https://api.bigdatacloud.net/data/reverse-geocode-client'
};
const HV = {
  yerler: store.get('havaYerler', []),            // [{ id, ad, alt, lat, lon, gps? }]
  secili: store.get('havaSecili', null),
  ayar: Object.assign({ sicaklik: 'c', ruzgar: 'kmh', yagis: 'mm', basinc: 'hpa' }, store.get('havaAyar', {})),
  veri: {},                                       // id → { t, h (tahmin), k (kalite) }
  yukleniyor: false
};
const kaydet = k => store.set({ yerler: 'havaYerler', ayar: 'havaAyar' }[k], HV[k]);
const sid = () => Math.random().toString(36).slice(2, 9);
const sayi = (n, b = 0) => n == null || isNaN(n) ? '—' : Number(n).toLocaleString('tr-TR', { minimumFractionDigits: b, maximumFractionDigits: b });
const yerel = () => window.SUHA_YEREL || {};

/* ═════════ Birimler ═════════ */
const sic = c => c == null ? '—' : Math.round(HV.ayar.sicaklik === 'f' ? c * 9 / 5 + 32 : c) + '°';
const ruz = k => { if (k == null) return '—'; const u = HV.ayar.ruzgar; return u === 'ms' ? sayi(k / 3.6, 1) + ' m/sn' : u === 'mph' ? sayi(k / 1.609, 0) + ' mil/sa' : u === 'kn' ? sayi(k / 1.852, 0) + ' knot' : sayi(k, 0) + ' km/sa'; };
const yag = mm => mm == null ? '—' : HV.ayar.yagis === 'in' ? sayi(mm / 25.4, 2) + ' inç' : sayi(mm, mm < 10 ? 1 : 0) + ' mm';
const bas = h => h == null ? '—' : HV.ayar.basinc === 'mmhg' ? sayi(h * 0.750062, 0) + ' mmHg' : sayi(h, 0) + ' hPa';
const YON8 = ['K', 'KD', 'D', 'GD', 'G', 'GB', 'B', 'KB'];
const YON8AD = ['kuzey', 'kuzeydoğu', 'doğu', 'güneydoğu', 'güney', 'güneybatı', 'batı', 'kuzeybatı'];
const yonK = d => YON8[Math.round(((d % 360) + 360) % 360 / 45) % 8];
// Rüzgâr yönü "nereden estiği"dir; Türkçe adıyla (poyraz, lodos…) da gösterilir
const RUZGAR_AD = ['yıldız', 'poyraz', 'gündoğusu', 'keşişleme', 'kıble', 'lodos', 'günbatısı', 'karayel'];
const YONDEN = ['Kuzeyden', 'Kuzeydoğudan', 'Doğudan', 'Güneydoğudan', 'Güneyden', 'Güneybatıdan', 'Batıdan', 'Kuzeybatıdan'];
const yonden = d => YONDEN[Math.round(((d % 360) + 360) % 360 / 45) % 8];
const ruzgarAd = d => RUZGAR_AD[Math.round(((d % 360) + 360) % 360 / 45) % 8];

/* ═════════ Hava kodları (WMO) ═════════ */
const KOD = {
  0: ['Açık', 'acik'], 1: ['Çoğunlukla açık', 'azbulut'], 2: ['Parçalı bulutlu', 'azbulut'], 3: ['Kapalı', 'kapali'],
  45: ['Sisli', 'sis'], 48: ['Kırağılı sis', 'sis'],
  51: ['Hafif çisenti', 'cisenti'], 53: ['Çisenti', 'cisenti'], 55: ['Yoğun çisenti', 'cisenti'], 56: ['Dondurucu çisenti', 'cisenti'], 57: ['Dondurucu çisenti', 'cisenti'],
  61: ['Hafif yağmur', 'yagmur'], 63: ['Yağmurlu', 'yagmur'], 65: ['Kuvvetli yağmur', 'yagmur'], 66: ['Dondurucu yağmur', 'yagmur'], 67: ['Dondurucu yağmur', 'yagmur'],
  71: ['Hafif kar', 'kar'], 73: ['Karlı', 'kar'], 75: ['Yoğun kar', 'kar'], 77: ['Kar taneleri', 'kar'],
  80: ['Hafif sağanak', 'saganak'], 81: ['Sağanak yağış', 'saganak'], 82: ['Şiddetli sağanak', 'saganak'], 85: ['Kar sağanağı', 'kar'], 86: ['Yoğun kar sağanağı', 'kar'],
  95: ['Gök gürültülü fırtına', 'firtina'], 96: ['Dolulu fırtına', 'firtina'], 99: ['Şiddetli dolulu fırtına', 'firtina']
};
const kodAd = k => (KOD[k] || ['—'])[0];
const kodTur = k => (KOD[k] || [, 'bulut'])[1];

// Simgeler: kendi çizimimiz (dış kaynak yok)
const GUNES = '<circle cx="24" cy="24" r="8" class="g"/><g class="gi">' + [0, 45, 90, 135, 180, 225, 270, 315].map(a => `<line x1="24" y1="7" x2="24" y2="11" transform="rotate(${a} 24 24)"/>`).join('') + '</g>';
const AY = '<path d="M31 29a11 11 0 0 1-12-15 11 11 0 1 0 12 15z" class="a"/>';
const BULUT = (x = 0, y = 0, s = 1, c = 'b') => `<path transform="translate(${x} ${y}) scale(${s})" class="${c}" d="M14 36h20a7 7 0 0 0 0-14 10 10 0 0 0-19-2 8 8 0 0 0-1 16z"/>`;
function simge(kod, gun = 1) {
  const t = kodTur(kod), gk = gun ? GUNES : AY;
  let ic;
  if (t === 'acik') ic = gk;
  else if (t === 'azbulut') ic = `<g transform="translate(-6 -6) scale(.85)">${gk}</g>${BULUT(4, 4, .85)}`;
  else if (t === 'kapali' || t === 'bulut') ic = BULUT(-6, -6, 1, 'b2') + BULUT(2, 2, 1);
  else if (t === 'sis') ic = BULUT(0, -6) + '<g class="s"><line x1="10" y1="36" x2="38" y2="36"/><line x1="14" y1="41" x2="34" y2="41"/></g>';
  else if (t === 'cisenti') ic = BULUT(0, -6) + '<g class="d">' + [[16, 34], [24, 36], [32, 34]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4"/>`).join('') + '</g>';
  else if (t === 'yagmur' || t === 'saganak') ic = (t === 'saganak' ? `<g transform="translate(-6 -8) scale(.75)">${gk}</g>` : '') + BULUT(0, -6) + '<g class="y">' + [[16, 32], [24, 34], [32, 32]].map(([x, y]) => `<line x1="${x}" y1="${y}" x2="${x - 2}" y2="${y + 7}"/>`).join('') + '</g>';
  else if (t === 'kar') ic = BULUT(0, -6) + '<g class="k">' + [[16, 35], [24, 38], [32, 35]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2"/>`).join('') + '</g>';
  else if (t === 'firtina') ic = BULUT(-2, -6, 1, 'b2') + '<path class="sm" d="M25 28l-5 9h5l-3 8 9-11h-5l3-6z"/>';
  else ic = BULUT();
  return `<svg class="hv-ic" viewBox="0 0 48 48" aria-hidden="true">${ic}</svg>`;
}

/* ═════════ Seviye adları ═════════ */
const uvAd = u => u == null ? '—' : u < 3 ? 'Düşük' : u < 6 ? 'Orta' : u < 8 ? 'Yüksek' : u < 11 ? 'Çok yüksek' : 'Aşırı';
const uvTavsiye = u => u == null ? '' : u < 3 ? 'Korunma gerekmez.' : u < 6 ? 'Öğle saatlerinde gölge ve güneş kremi.' : u < 8 ? '11–16 arası güneşten kaçın, şapka ve krem.' : 'Dışarıda uzun kalma; krem, şapka, gözlük şart.';
const aqiAd = a => a == null ? '—' : a <= 20 ? 'İyi' : a <= 40 ? 'Makul' : a <= 60 ? 'Orta' : a <= 80 ? 'Kötü' : a <= 100 ? 'Çok kötü' : 'Son derece kötü';
const aqiSinif = a => a == null ? '' : a <= 20 ? 's1' : a <= 40 ? 's2' : a <= 60 ? 's3' : a <= 80 ? 's4' : a <= 100 ? 's5' : 's6';
const aqiTavsiye = a => a == null ? '' : a <= 40 ? 'Dışarıda vakit geçirmek için uygun.' : a <= 60 ? 'Hassas kişiler (astım, kalp) uzun süreli yoğun egzersizi azaltmalı.' : a <= 80 ? 'Hassas kişiler dışarıda yoğun egzersizden kaçınmalı.' : 'Herkes dışarıda yoğun egzersizden kaçınmalı; pencereleri kapalı tut.';
const polenAd = v => v == null ? null : v < 1 ? 'Yok' : v < 20 ? 'Düşük' : v < 80 ? 'Orta' : v < 250 ? 'Yüksek' : 'Çok yüksek';
const POLEN = [['grass_pollen', 'Çimen'], ['olive_pollen', 'Zeytin'], ['birch_pollen', 'Huş'], ['alder_pollen', 'Kızılağaç'], ['mugwort_pollen', 'Pelin'], ['ragweed_pollen', 'Ambrozya']];

/* ═════════ Zaman (yerin kendi saatiyle) ═════════ */
// Open-Meteo saatleri yerin yerel saatiyle verir ("2026-10-15T14:00"). Hepsini aynı ölçeğe çeviririz.
const zt = s => Date.parse(s + (s.length === 10 ? 'T00:00Z' : 'Z'));
const yerSimdi = h => Date.now() + (h.utc_offset_seconds || 0) * 1000;
const saatYaz = s => s ? s.slice(11, 16) : '—';
const GUN = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const gunAd = (s, i) => i === 0 ? 'Bugün' : i === 1 ? 'Yarın' : GUN[new Date(zt(s)).getUTCDay()];
const tarihYaz = s => { const d = new Date(zt(s)); return `${d.getUTCDate()} ${AYLAR[d.getUTCMonth()]}`; };
const once = ms => { const dk = Math.round((Date.now() - ms) / 60000); return dk < 1 ? 'az önce' : dk < 60 ? dk + ' dk önce' : dk < 1440 ? Math.round(dk / 60) + ' saat önce' : Math.round(dk / 1440) + ' gün önce'; };

/* ═════════ Veri ═════════ */
async function getir(url, sure = 12000) {
  const c = new AbortController(), t = setTimeout(() => c.abort(), sure);
  try { const r = await fetch(url, { signal: c.signal, credentials: 'omit', referrerPolicy: 'no-referrer' }); if (!r.ok) throw new Error('HTTP ' + r.status); return await r.json(); }
  finally { clearTimeout(t); }
}
const yuvarla = x => Math.round(x * 1000) / 1000;   // ~100 m: tam konum gönderilmez
function tahminAdres(y) {
  const p = new URLSearchParams({
    latitude: yuvarla(y.lat), longitude: yuvarla(y.lon), timezone: 'auto', forecast_days: 10,
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
    hourly: 'temperature_2m,apparent_temperature,pressure_msl,relative_humidity_2m,dew_point_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,is_day,uv_index,visibility',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,precipitation_sum,precipitation_probability_max,precipitation_hours,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,uv_index_max',
    minutely_15: 'precipitation', forecast_minutely_15: 12
  });
  return HAPI.tahmin + '?' + p;
}
function kaliteAdres(y) {
  const p = new URLSearchParams({ latitude: yuvarla(y.lat), longitude: yuvarla(y.lon), timezone: 'auto',
    current: 'european_aqi,pm10,pm2_5,nitrogen_dioxide,ozone,sulphur_dioxide,' + POLEN.map(p => p[0]).join(',') });
  return HAPI.hava + '?' + p;
}
async function yukle(y, zorla) {
  const onbellek = store.get('havaVeri_' + y.id, null);
  if (onbellek && !HV.veri[y.id]) HV.veri[y.id] = onbellek;
  const v = HV.veri[y.id];
  if (!zorla && v && Date.now() - v.t < 10 * 60000) return v;
  HV.yukleniyor = true; durumCiz();
  try {
    const [h, k] = await Promise.all([getir(tahminAdres(y)), getir(kaliteAdres(y)).catch(() => null)]);
    if (!h || !h.hourly || !h.daily) throw new Error('Eksik veri');
    const yeni = { t: Date.now(), h, k };
    HV.veri[y.id] = yeni;
    try { store.set('havaVeri_' + y.id, yeni); } catch {}
    return yeni;
  } catch (e) {
    if (v) toast(navigator.onLine === false ? 'İnternet yok · son alınan veri gösteriliyor' : 'Güncellenemedi · son alınan veri gösteriliyor');
    else throw e;
    return v;
  } finally { HV.yukleniyor = false; durumCiz(); }
}

/* ═════════ Konum ═════════ */
function konumla(sessiz) {
  if (!navigator.geolocation) { if (!sessiz) toast('Bu cihaz konum vermiyor'); return; }
  navigator.geolocation.getCurrentPosition(async p => {
    const lat = p.coords.latitude, lon = p.coords.longitude;
    let ad = 'Konumum', alt = '';
    try {
      const r = await getir(`${HAPI.adres}?latitude=${yuvarla(lat)}&longitude=${yuvarla(lon)}&localityLanguage=tr`, 8000);
      ad = r.locality || r.city || ad; alt = [r.city && r.city !== ad ? r.city : r.principalSubdivision, r.countryName].filter(Boolean).join(', ');
    } catch {}
    let g = HV.yerler.find(x => x.gps);
    if (g) Object.assign(g, { ad, alt, lat, lon }); else { g = { id: 'gps', ad, alt, lat, lon, gps: true }; HV.yerler.unshift(g); }
    kaydet('yerler'); store.set('havaKonumIzin', true);
    if (!HV.secili || HV.secili === 'gps' || !sessiz) { HV.secili = 'gps'; store.set('havaSecili', 'gps'); }
    closeModal(); goster(true);
  }, e => {
    if (e.code === 1) store.set('havaKonumIzin', false);
    if (!sessiz) toast(e.code === 1 ? 'Konum izni verilmedi. Şehir arayarak ekleyebilirsin.' : 'Konum alınamadı');
    if (!HV.yerler.length) yerlerAc();
  }, { enableHighAccuracy: false, maximumAge: 15 * 60000, timeout: 20000 });
}

/* ═════════ Kabuk ═════════ */
function kabuk() {
  $('#app').innerHTML = `
  <div class="hv-kabuk">
    <header class="hv-bas">
      <div class="brand-mark sm">${simge(2, 1)}</div><h1>Hava</h1>
      <div class="spacer"></div>
      <span class="hv-durum" id="hDurum"></span>
      <button class="icon-btn" data-action="w-yenile" title="Yenile">${IC.refresh}</button>
      <button class="icon-btn" data-action="w-yerler" title="Yerler">${IC.search}</button>
      <button class="icon-btn" data-action="w-ayar" title="Ayarlar">${IC.gear}</button>
    </header>
    <nav class="hv-yer-sekme" id="hYerSekme"></nav>
    <main class="hv-govde" id="hGovde"></main>
  </div>`;
}
function durumCiz() {
  const el = $('#hDurum'); if (!el) return;
  const v = HV.veri[HV.secili];
  el.textContent = HV.yukleniyor ? 'Güncelleniyor…' : v ? once(v.t) : '';
  $('[data-action="w-yenile"]')?.classList.toggle('donuyor', HV.yukleniyor);
}
function yerSekmeCiz() {
  const el = $('#hYerSekme'); if (!el) return;
  el.innerHTML = HV.yerler.map(y => `<button class="${y.id === HV.secili ? 'on' : ''}" data-action="w-sec" data-id="${y.id}">${y.gps ? IC.konum : ''}${esc(y.ad)}</button>`).join('') + `<button class="ekle" data-action="w-yerler">${IC.plus}Yer ekle</button>`;
  el.querySelector('.on')?.scrollIntoView({ block: 'nearest', inline: 'center' });
}
async function goster(zorla) {
  yerSekmeCiz();
  const y = HV.yerler.find(x => x.id === HV.secili) || HV.yerler[0];
  if (!y) return bosCiz();
  HV.secili = y.id;
  const v0 = HV.veri[y.id] || store.get('havaVeri_' + y.id, null);
  if (v0) { HV.veri[y.id] = v0; ciz(y, v0); } else $('#hGovde').innerHTML = `<div class="hv-yukle"><span class="hv-donen"></span>${esc(y.ad)} için hava durumu alınıyor…</div>`;
  try { const v = await yukle(y, zorla); if (HV.secili === y.id) ciz(y, v); }
  catch { if (!v0 && HV.secili === y.id) $('#hGovde').innerHTML = `<div class="hv-bos">${simge(3, 1)}<b>Hava durumu alınamadı</b><span>${navigator.onLine === false ? 'İnternet bağlantısı yok.' : 'Hava kaynağına ulaşılamadı.'} Biraz sonra yeniden dene.</span><button class="btn primary" data-action="w-yenile">Yeniden dene</button></div>`; }
}
function bosCiz() {
  $('#hGovde').innerHTML = `<div class="hv-bos">${simge(1, 1)}<b>Hava durumuna hoş geldin</b><span>Bulunduğun yerin hava durumu için konumunu aç ya da bir şehir ara.</span>
    <div class="hv-tuslar"><button class="btn primary" data-action="w-konum">${IC.konum}Konumumu kullan</button><button class="btn" data-action="w-yerler">${IC.search}Şehir ara</button></div></div>`;
}

/* ═════════ Ana görünüm ═════════ */
function ciz(y, v) {
  const h = v.h, c = h.current, d = h.daily, sa = h.hourly, simdi = yerSimdi(h);
  // Şu anki saatin sırası
  let i0 = sa.time.findIndex(t => zt(t) > simdi - 3600000); if (i0 < 0) i0 = 0;
  const gece = !c.is_day, tur = kodTur(c.weather_code);
  const bugun = 0;
  document.documentElement.dataset.hvGok = gece ? (tur === 'yagmur' || tur === 'saganak' || tur === 'firtina' || tur === 'kapali' ? 'gece-kapali' : 'gece') : ({ yagmur: 'yagmur', cisenti: 'yagmur', saganak: 'yagmur', firtina: 'firtina', kapali: 'kapali', sis: 'kapali', kar: 'kar' }[tur] || ((() => { const sa = new Date(simdi).getUTCHours(), b = d.sunset?.[0] ? zt(d.sunset[0]) : 0; return b && b - simdi < 5400000 && b > simdi ? 'aksam' : 'acik'; })()));
  // 48 saat + gün doğumu/batımı işaretleri
  const saatler = [];
  for (let i = i0; i < Math.min(sa.time.length, i0 + 48); i++) saatler.push(i);
  const olaylar = [];
  for (let j = 0; j < Math.min(3, d.time.length); j++) { olaylar.push([zt(d.sunrise[j]), 'dogus', d.sunrise[j]]); olaylar.push([zt(d.sunset[j]), 'batis', d.sunset[j]]); }
  const saatHtml = saatler.map((i, n) => {
    const t = zt(sa.time[i]), ek = olaylar.filter(o => o[0] > t && o[0] <= t + 3600000).map(o => `<div class="hv-saat ozel"><span>${saatYaz(o[2])}</span>${o[1] === 'dogus' ? simge(0, 1) : simge(0, 0)}<b>${o[1] === 'dogus' ? 'Doğuş' : 'Batış'}</b><i></i></div>`).join('');
    const ihtimal = sa.precipitation_probability?.[i];
    return `<div class="hv-saat"><span>${n === 0 ? 'Şimdi' : saatYaz(sa.time[i]).slice(0, 2)}</span>${simge(sa.weather_code[i], sa.is_day[i])}<b>${sic(n === 0 ? c.temperature_2m : sa.temperature_2m[i])}</b><i>${ihtimal >= 10 ? '%' + ihtimal : ''}</i></div>${ek}`;
  }).join('');
  // 10 gün: sıcaklık çubukları ortak ölçekte
  const enAz = Math.min(...d.temperature_2m_min), enCok = Math.max(...d.temperature_2m_max), aralik = Math.max(1, enCok - enAz);
  const gunHtml = d.time.map((t, i) => {
    const sol = (d.temperature_2m_min[i] - enAz) / aralik * 100, gen = (d.temperature_2m_max[i] - d.temperature_2m_min[i]) / aralik * 100;
    const nokta = i === bugun ? `<em style="left:${((c.temperature_2m - enAz) / aralik * 100).toFixed(1)}%"></em>` : '';
    return `<button class="hv-gun" data-action="w-gun" data-i="${i}"><span class="ad">${gunAd(t, i)}</span>${simge(d.weather_code[i], 1)}<span class="ihtimal">${d.precipitation_probability_max?.[i] >= 20 ? '%' + d.precipitation_probability_max[i] : ''}</span><span class="min">${sic(d.temperature_2m_min[i])}</span><span class="cubuk"><i style="left:${sol.toFixed(1)}%;width:${Math.max(4, gen).toFixed(1)}%"></i>${nokta}</span><span class="max">${sic(d.temperature_2m_max[i])}</span></button>`;
  }).join('');
  // Ayrıntılar
  const uv = sa.uv_index?.[i0], gorus = sa.visibility?.[i0], ciy = sa.dew_point_2m?.[i0];
  const yag24 = saatler.slice(0, 24).reduce((t, i) => t + (sa.precipitation[i] || 0), 0);
  const gunDog = zt(d.sunrise[0]), gunBat = zt(d.sunset[0]), gunOran = Math.max(0, Math.min(1, (simdi - gunDog) / (gunBat - gunDog)));
  $('#hGovde').innerHTML = `
  <section class="hv-ana hv-${gece ? 'gece' : 'gunduz'} hv-t-${tur}">
    <div class="hv-ana-ic">
      <div class="hv-yer">${y.gps ? IC.konum : ''}<b>${esc(y.ad)}</b>${y.alt ? `<span>${esc(y.alt)}</span>` : ''}</div>
      <div class="hv-buyuk">${simge(c.weather_code, c.is_day)}<b>${sic(c.temperature_2m)}</b></div>
      <div class="hv-kod">${kodAd(c.weather_code)}</div>
      <div class="hv-ek">En yüksek ${sic(d.temperature_2m_max[0])} · En düşük ${sic(d.temperature_2m_min[0])} · Hissedilen ${sic(c.apparent_temperature)}</div>
      <div class="hv-ozet">${ozetCumle(h, i0)}</div>
    </div>
  </section>
  ${yagisKarti(h)}
  <section class="hv-kart"><h2>Saatlik</h2><div class="hv-saatler">${saatHtml}</div></section>
  <div class="hv-iki">
    <section class="hv-kart"><h2>10 günlük</h2><div class="hv-gunler">${gunHtml}</div></section>
    <div class="hv-sag">
      <div class="hv-izgara">
        ${kutu('Hissedilen', sic(c.apparent_temperature), Math.abs(c.apparent_temperature - c.temperature_2m) < 2 ? 'Gerçek sıcaklığa yakın.' : c.apparent_temperature < c.temperature_2m ? 'Rüzgâr yüzünden daha soğuk hissediliyor.' : 'Nem yüzünden daha sıcak hissediliyor.')}
        ${kutu('Nem', '%' + sayi(c.relative_humidity_2m), ciy != null ? `Çiğ noktası ${sic(ciy)}` : '')}
        ${kutu('Rüzgâr', ruz(c.wind_speed_10m), `<span class="hv-ok" style="transform:rotate(${(c.wind_direction_10m + 180) % 360}deg)">${IC.yonOk}</span> ${yonden(c.wind_direction_10m)} (${ruzgarAd(c.wind_direction_10m)})<br>Hamle ${ruz(c.wind_gusts_10m)}`)}
        ${kutu('UV indeksi', uv == null ? '—' : sayi(uv, 0) + ' · ' + uvAd(uv), uvTavsiye(d.uv_index_max?.[0]) + (d.uv_index_max ? ` Bugün en çok ${sayi(d.uv_index_max[0], 0)}.` : ''), uv != null ? `<div class="hv-uv"><i style="left:${Math.min(100, uv / 11 * 100).toFixed(0)}%"></i></div>` : '')}
        ${kutu('Yağış', yag(yag24), 'Önümüzdeki 24 saatte' + (d.precipitation_hours?.[0] ? ` · bugün ${sayi(d.precipitation_hours[0])} saat` : ''))}
        ${kutu('Basınç', bas(c.pressure_msl), basincEgilim(sa, i0))}
        ${kutu('Görüş', gorus == null ? '—' : gorus >= 10000 ? sayi(gorus / 1000, 0) + ' km' : sayi(gorus / 1000, 1) + ' km', gorus == null ? '' : gorus < 1000 ? 'Sis var, dikkatli sür.' : gorus < 5000 ? 'Pus var.' : 'Açık.')}
        ${kutu('Bulut', '%' + sayi(c.cloud_cover), '')}
        ${kutu('Gün doğumu', saatYaz(d.sunrise[0]), `Batış ${saatYaz(d.sunset[0])} · gün ${sayi(d.daylight_duration[0] / 3600, 0)} sa ${sayi(Math.round(d.daylight_duration[0] / 60) % 60)} dk`, `<div class="hv-gunes"><svg viewBox="0 0 100 40" aria-hidden="true"><path d="M5 38Q50-14 95 38" class="yay"/><circle cx="${(5 + 90 * gunOran).toFixed(1)}" cy="${(38 - 52 * gunOran * (1 - gunOran) * 2).toFixed(1)}" r="4" class="${gunOran > 0 && gunOran < 1 ? 'gun' : 'yok'}"/></svg></div>`, 'genis')}
      </div>
      ${kaliteKarti(v.k)}
    </div>
  </div>
  <p class="hv-kaynak">Hava verisi: <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a> (CC BY 4.0) · Hava kalitesi ve polen: Copernicus CAMS · ${once(v.t)} güncellendi</p>`;
  durumCiz();
  document.title = `${sic(c.temperature_2m)} ${y.ad} · Hava`;
}
function kutu(baslik, deger, alt, ek = '', sinif = '') {
  return `<div class="hv-kutu ${sinif}"><span class="b">${baslik}</span><b>${deger}</b>${ek}<span class="a">${alt || ''}</span></div>`;
}
function basincEgilim(sa, i0) {
  const p = sa.pressure_msl; if (!p || p[i0 + 3] == null || p[i0] == null) return '';
  const d = p[i0 + 3] - p[i0];
  return Math.abs(d) < 1 ? 'Sabit seyrediyor.' : d > 0 ? 'Yükseliyor: hava açmaya meyilli.' : d < -2 ? 'Hızla düşüyor: hava bozabilir.' : 'Düşüyor.';
}
function ozetCumle(h, i0) {
  const sa = h.hourly, d = h.daily;
  // Önümüzdeki 12 saatte yağış var mı?
  for (let i = i0; i < Math.min(sa.time.length, i0 + 12); i++) {
    if ((sa.precipitation_probability?.[i] ?? 0) >= 50 && (sa.precipitation[i] || 0) > 0.1) {
      const tur = kodTur(sa.weather_code[i]) === 'kar' ? 'Kar' : 'Yağmur';
      return i === i0 ? `${tur} yağıyor ya da yağmak üzere.` : `${tur} saat ${saatYaz(sa.time[i])} civarında bekleniyor (%${sa.precipitation_probability[i]}).`;
    }
  }
  const fark = d.temperature_2m_max[1] - d.temperature_2m_max[0];
  if (Math.abs(fark) >= 4) return `Yarın bugünden ${Math.round(Math.abs(fark))}° daha ${fark > 0 ? 'sıcak' : 'soğuk'}.`;
  if ((d.wind_gusts_10m_max?.[0] ?? 0) >= 60) return `Bugün kuvvetli rüzgâr bekleniyor (hamleler ${ruz(d.wind_gusts_10m_max[0])}).`;
  return 'Önümüzdeki saatlerde yağış beklenmiyor.';
}
function yagisKarti(h) {
  const m = h.minutely_15; if (!m || !m.precipitation) return '';
  const simdi = yerSimdi(h), l = [];
  m.time.forEach((t, i) => { const z = zt(t); if (z >= simdi - 15 * 60000 && l.length < 8) l.push([t, m.precipitation[i] || 0]); });
  if (!l.some(x => x[1] > 0.05)) return '';
  const ilk = l.findIndex(x => x[1] > 0.05), son = l.length - 1 - [...l].reverse().findIndex(x => x[1] > 0.05);
  const dk = Math.max(0, Math.round((zt(l[ilk][0]) - simdi) / 60000));
  const cumle = ilk === 0 ? (son < l.length - 1 ? `Yağış yaklaşık ${Math.max(15, Math.round((zt(l[son][0]) - simdi) / 60000) + 15)} dakika içinde duruyor.` : 'Yağış önümüzdeki 2 saat boyunca sürüyor.') : `Yağış yaklaşık ${dk < 15 ? 15 : dk} dakika içinde başlıyor.`;
  const enCok = Math.max(1, ...l.map(x => x[1]));
  return `<section class="hv-kart hv-yagis"><h2>${IC.semsiye || ''}Önümüzdeki 2 saat</h2><p>${cumle}</p>
    <div class="hv-yagis-cubuk">${l.map(([t, p]) => `<div><i style="height:${Math.max(2, p / enCok * 100).toFixed(0)}%" class="${p > 0.05 ? 'var' : ''}"></i><span>${saatYaz(t)}</span></div>`).join('')}</div></section>`;
}
function kaliteKarti(k) {
  if (!k || !k.current) return '';
  const c = k.current, a = c.european_aqi;
  const polen = POLEN.map(([anah, ad]) => [ad, c[anah]]).filter(([, v]) => v != null && v >= 1);
  const madde = [['PM2,5', c.pm2_5], ['PM10', c.pm10], ['NO₂', c.nitrogen_dioxide], ['O₃', c.ozone]].filter(([, v]) => v != null);
  return `<section class="hv-kart hv-kalite"><h2>Hava kalitesi</h2>
    <div class="hv-aqi ${aqiSinif(a)}"><b>${sayi(a)}</b><div><strong>${aqiAd(a)}</strong><span>${aqiTavsiye(a)}</span></div></div>
    <div class="hv-aqi-cizgi"><i style="left:${Math.min(100, (a || 0)).toFixed(0)}%"></i></div>
    <div class="hv-madde">${madde.map(([n, v]) => `<div><span>${n}</span><b>${sayi(v)}</b><small>µg/m³</small></div>`).join('')}</div>
    ${polen.length ? `<h3>Polen</h3><div class="hv-polen">${polen.map(([n, v]) => `<div><span>${n}</span><b class="p-${polenAd(v) === 'Düşük' ? 1 : polenAd(v) === 'Orta' ? 2 : 3}">${polenAd(v)}</b></div>`).join('')}</div>` : ''}
    <p class="muted sm">Avrupa hava kalitesi indeksi (0–100+). Değerler model tahminidir; resmî ölçüm istasyonu değildir.</p></section>`;
}

/* ═════════ Gün ayrıntısı ═════════ */
function gunAc(gi) {
  const v = HV.veri[HV.secili]; if (!v) return;
  const h = v.h, d = h.daily, sa = h.hourly, gunTarih = d.time[gi];
  const sira = sa.time.map((t, i) => [t, i]).filter(([t]) => t.startsWith(gunTarih)).map(([, i]) => i);
  if (!sira.length) return;
  const sic0 = sira.map(i => sa.temperature_2m[i]), mn = Math.min(...sic0), mx = Math.max(...sic0), ar = Math.max(1, mx - mn);
  const W = 600, H = 150, x = j => 20 + j / (sira.length - 1) * (W - 40), yS = t => 20 + (1 - (t - mn) / ar) * (H - 60);
  const cizgi = sira.map((i, j) => `${j ? 'L' : 'M'}${x(j).toFixed(1)} ${yS(sa.temperature_2m[i]).toFixed(1)}`).join('');
  const cubuk = sira.map((i, j) => { const p = sa.precipitation_probability?.[i] || 0; return p ? `<rect x="${(x(j) - 6).toFixed(1)}" y="${(H - p / 100 * 40).toFixed(1)}" width="12" height="${(p / 100 * 40).toFixed(1)}" class="ihtimal"/>` : ''; }).join('');
  const etiket = sira.filter((_, j) => j % 3 === 0).map(i => { const j = sira.indexOf(i); return `<text x="${x(j).toFixed(1)}" y="${(yS(sa.temperature_2m[i]) - 8).toFixed(1)}" class="t">${sic(sa.temperature_2m[i])}</text><text x="${x(j).toFixed(1)}" y="${H + 14}" class="s">${saatYaz(sa.time[i]).slice(0, 2)}</text>`; }).join('');
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask hv-gun-sayfa"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>${gunAd(gunTarih, gi)} · ${tarihYaz(gunTarih)}</h3></header>
    <div class="set-body">
      <div class="hv-gun-bas">${simge(d.weather_code[gi], 1)}<div><b>${kodAd(d.weather_code[gi])}</b><span>${sic(d.temperature_2m_max[gi])} / ${sic(d.temperature_2m_min[gi])} · hissedilen ${sic(d.apparent_temperature_max[gi])} / ${sic(d.apparent_temperature_min[gi])}</span></div></div>
      <svg class="hv-grafik" viewBox="0 0 ${W} ${H + 20}" aria-hidden="true">${cubuk}<path d="${cizgi}" class="cizgi"/>${etiket}</svg>
      <div class="hv-izgara kucuk">
        ${kutu('Yağış', yag(d.precipitation_sum[gi]), d.precipitation_probability_max?.[gi] != null ? `İhtimal %${d.precipitation_probability_max[gi]}` : '')}
        ${kutu('Rüzgâr', ruz(d.wind_speed_10m_max[gi]), `${yonden(d.wind_direction_10m_dominant[gi])} · hamle ${ruz(d.wind_gusts_10m_max[gi])}`)}
        ${kutu('UV', sayi(d.uv_index_max?.[gi], 0), uvAd(d.uv_index_max?.[gi]))}
        ${kutu('Güneş', saatYaz(d.sunrise[gi]), `Batış ${saatYaz(d.sunset[gi])}`)}
      </div>
      <div class="hv-gun-saatler">${sira.map(i => `<div><span>${saatYaz(sa.time[i])}</span>${simge(sa.weather_code[i], sa.is_day[i])}<b>${sic(sa.temperature_2m[i])}</b><em>${(sa.precipitation_probability?.[i] ?? 0) >= 10 ? '%' + sa.precipitation_probability[i] : ''}</em><small>${ruz(sa.wind_speed_10m[i])}</small></div>`).join('')}</div>
    </div></div></div>`;
}

/* ═════════ Yerler ═════════ */
function yerlerAc() {
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Yerler</h3></header>
    <div class="set-body">
      <input class="hv-ara" id="hAra" placeholder="Şehir, ilçe ya da köy ara" autocomplete="off" enterkeyhint="search">
      <div class="hv-sonuc" id="hSonuc"></div>
      <button class="btn hv-konum-tus" data-action="w-konum">${IC.konum}Konumumu kullan</button>
      <div class="hv-yer-l" id="hYerL"></div>
      <p class="muted sm">Aramada yazdığın yer adı ve gösterilen yerin koordinatı hava kaynağına (Open-Meteo) gider; başka bir bilgi gitmez.</p>
    </div></div></div>`;
  yerListeCiz();
  let t = 0, son = '';
  $('#hAra').oninput = e => {
    clearTimeout(t); const q = e.target.value.trim();
    if (q.length < 2) { $('#hSonuc').innerHTML = ''; return; }
    t = setTimeout(async () => {
      son = q;
      try {
        const r = await getir(`${HAPI.ara}?${new URLSearchParams({ name: q, count: 10, language: 'tr', format: 'json' })}`, 8000);
        if (son !== q) return;
        const l = r.results || [];
        $('#hSonuc').innerHTML = l.map((x, i) => `<button data-i="${i}"><b>${esc(x.name)}</b><span>${esc([x.admin2, x.admin1, x.country].filter(Boolean).filter((v, j, a) => a.indexOf(v) === j && v !== x.name).join(', '))}</span></button>`).join('') || '<p class="muted sm">Bulunamadı. Yazımı kontrol et ya da daha büyük bir yer dene.</p>';
        $('#hSonuc').onclick = ev => { const b = ev.target.closest('[data-i]'); if (!b) return; const x = l[+b.dataset.i]; yerEkle({ ad: x.name, alt: [x.admin1, x.country].filter(Boolean).join(', '), lat: x.latitude, lon: x.longitude }); };
      } catch { $('#hSonuc').innerHTML = '<p class="muted sm">Arama yapılamadı (internet?).</p>'; }
    }, 300);
  };
  setTimeout(() => $('#hAra')?.focus(), 50);
}
function yerListeCiz() {
  const el = $('#hYerL'); if (!el) return;
  el.innerHTML = HV.yerler.map((y, i) => {
    const v = HV.veri[y.id] || store.get('havaVeri_' + y.id, null), c = v?.h?.current;
    return `<div class="hv-yer-s ${y.id === HV.secili ? 'on' : ''}"><button class="hv-yer-ad" data-action="w-sec" data-id="${y.id}">${c ? simge(c.weather_code, c.is_day) : ''}<span><b>${y.gps ? IC.konum : ''}${esc(y.ad)}</b><small>${esc(y.alt || '')}</small></span><em>${c ? sic(c.temperature_2m) : ''}</em></button>
      <div class="hv-yer-tus">${i > 0 ? `<button class="icon-btn sm" data-action="w-yukari" data-id="${y.id}" title="Yukarı taşı">↑</button>` : ''}<button class="icon-btn sm" data-action="w-sil" data-id="${y.id}" title="Kaldır">${IC.close}</button></div></div>`;
  }).join('');
}
function yerEkle(y) {
  const var0 = HV.yerler.find(x => !x.gps && Math.abs(x.lat - y.lat) < 0.01 && Math.abs(x.lon - y.lon) < 0.01);
  if (var0) { HV.secili = var0.id; } else { const yeni = { id: sid(), ...y }; HV.yerler.push(yeni); HV.secili = yeni.id; kaydet('yerler'); }
  store.set('havaSecili', HV.secili); closeModal(); goster();
}

/* ═════════ Ayarlar ═════════ */
function ayarAc() {
  const t = store.get('theme', 'light'), A = HV.ayar;
  const seg = (anah, l) => `<div class="seg yon-seg">${l.map(([k, n]) => `<button class="${A[anah] === k ? 'on' : ''}" data-action="w-birim" data-a="${anah}" data-k="${k}">${n}</button>`).join('')}</div>`;
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet settings"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Ayarlar</h3></header>
    <div class="set-body">
      <section><h4>Sıcaklık</h4>${seg('sicaklik', [['c', '°C'], ['f', '°F']])}</section>
      <section><h4>Rüzgâr</h4>${seg('ruzgar', [['kmh', 'km/sa'], ['ms', 'm/sn'], ['kn', 'knot'], ['mph', 'mil/sa']])}</section>
      <section><h4>Yağış ve basınç</h4>${seg('yagis', [['mm', 'mm'], ['in', 'inç']])}<div style="height:8px"></div>${seg('basinc', [['hpa', 'hPa'], ['mmhg', 'mmHg']])}</section>
      <section><h4>Görünüm</h4><div class="seg yon-seg">${[['light', 'Cam'], ['dark', 'Koyu'], ['auto', 'Otomatik'], ['flat', 'Düz']].map(([k, n]) => `<button class="${t === k ? 'on' : ''}" data-action="w-tema" data-t="${k}">${n}</button>`).join('')}</div></section>
      <section><h4>Veri kaynağı</h4><div class="set-row"><div><b>Open-Meteo</b><span>Ulusal meteoroloji servislerinin (ECMWF, DWD, NOAA…) modellerinden derlenen açık hava verisi; 10 dakikada bir yenilenir. Hava kalitesi ve polen: Copernicus (CAMS). Konum adı: BigDataCloud.</span></div></div>
        <p class="muted sm">Resmî uyarılar (fırtına, sel, çığ) için Meteoroloji Genel Müdürlüğü'nü (mgm.gov.tr) takip et.</p></section>
      <section><h4>Verilerin</h4><div class="set-row"><div><b>Bu cihazda</b><span>Eklediğin yerler sadece bu cihazda saklanır. Hava kaynağına yalnızca yaklaşık koordinat (≈100 m) gider.</span></div></div></section>
      <section><h4>Uygulama</h4>${typeof aboutRow === 'function' ? aboutRow() : ''}</section>
    </div></div></div>`;
}

/* ═════════ Olaylar ═════════ */
Object.assign(IC, {
  konum: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/></svg>',
  yonOk: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3 18 20l-6-4-6 4z"/></svg>',
  semsiye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 18 0z"/><path d="M12 12v6.5a2 2 0 0 1-4 0"/></svg>'
});
Object.assign(ACTIONS, {
  'w-ayar': () => ayarAc(), settings: () => ayarAc(),
  'w-tema': el => { store.set('theme', el.dataset.t); applyTheme(el.dataset.t); ayarAc(); },
  'w-birim': el => { HV.ayar[el.dataset.a] = el.dataset.k; kaydet('ayar'); ayarAc(); const y = HV.yerler.find(x => x.id === HV.secili), v = HV.veri[HV.secili]; if (y && v) ciz(y, v); },
  'w-yenile': () => goster(true),
  'w-yerler': () => yerlerAc(),
  'w-konum': () => konumla(false),
  'w-sec': el => { HV.secili = el.dataset.id; store.set('havaSecili', HV.secili); closeModal(); goster(); },
  'w-sil': el => { const y = HV.yerler.find(x => x.id === el.dataset.id); HV.yerler = HV.yerler.filter(x => x.id !== el.dataset.id); try { store.set('havaVeri_' + el.dataset.id, null); } catch {} delete HV.veri[el.dataset.id]; if (HV.secili === el.dataset.id) { HV.secili = HV.yerler[0]?.id || null; store.set('havaSecili', HV.secili); } kaydet('yerler'); yerListeCiz(); goster(); if (y) toast('Kaldırıldı: ' + y.ad); },
  'w-yukari': el => { const i = HV.yerler.findIndex(x => x.id === el.dataset.id); if (i > 0) { [HV.yerler[i - 1], HV.yerler[i]] = [HV.yerler[i], HV.yerler[i - 1]]; kaydet('yerler'); yerListeCiz(); yerSekmeCiz(); } },
  'w-gun': el => gunAc(+el.dataset.i)
});

/* ═════════ Başlangıç ═════════ */
document.removeEventListener('DOMContentLoaded', boot);
function havaBaslat() {
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  if (DEMO && !HV.yerler.length) { HV.yerler = [{ id: 'd1', ad: 'Kadıköy', alt: 'İstanbul, Türkiye', lat: 40.99, lon: 29.03, gps: true }, { id: 'd2', ad: 'Ankara', alt: 'Türkiye', lat: 39.93, lon: 32.86 }, { id: 'd3', ad: 'Antalya', alt: 'Türkiye', lat: 36.9, lon: 30.7 }]; HV.secili = 'd1'; }
  kabuk(); goster();
  // Daha önce konum izni verildiyse konumu sessizce yenile; hiç yer yoksa bir kez sor
  if (!DEMO) {
    if (store.get('havaKonumIzin', false) || yerel().android) konumla(true);
    else if (!HV.yerler.length && navigator.permissions?.query) navigator.permissions.query({ name: 'geolocation' }).then(p => { if (p.state === 'granted') konumla(true); }).catch(() => {});
  }
  setInterval(() => { if (document.visibilityState === 'visible' && HV.secili) goster(); }, 10 * 60000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && HV.secili) { const v = HV.veri[HV.secili]; if (!v || Date.now() - v.t > 10 * 60000) goster(); } });
}
showLogin = msg => { if (msg) toast(msg); };
start = () => havaBaslat();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', havaBaslat); else havaBaslat();
