/* ───────────── Hesap ─────────────
   Hesap makinesi (standart + bilimsel, geçmiş, hafıza), günlük hesaplar (KDV, yüzde, indirim, kâr,
   kredi, mevduat, tarih, bölüşme, birim fiyat), çevirici (birimler + döviz), hesap kâğıdı.
   Giriş gerekmez; her şey bu cihazda kalır. Döviz kuru için Avrupa Merkez Bankası verisi (Frankfurter) kullanılır. */
'use strict';

window.APP_NAME = 'Hesap';
window.APP_ICON = 'hesap-apple.png?v=8';
window.APP_LEAD = 'Hesap makinesi, günlük hesaplar (KDV, kredi, mevduat, indirim…), birim ve döviz çevirici, hesap kâğıdı. Ücretsiz, reklamsız.';

const HSVG = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
Object.assign(IC, {
  hesapI: HSVG('<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8 7h8M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M15.5 14.5h.01M8.5 18h.01M12 18h.01M15.5 18h.01"/>'),
  gunluk: HSVG('<path d="M4 7h16M4 12h10M4 17h7"/><path d="m15 15 2 2 4-4"/>'),
  cevir: HSVG('<path d="M4 8h13l-3-3M20 16H7l3 3"/>'),
  kagit: HSVG('<path d="M6 3h9l4 4v14H6z"/><path d="M9 10h7M9 13.5h7M9 17h4"/>'),
  kopya: HSVG('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>'),
  sil: HSVG('<path d="M9 6h11v12H9l-5-6z"/><path d="m12 9.5 5 5M17 9.5l-5 5"/>'),
  gecmisI: HSVG('<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 4v4.5h4.5M12 8v4l3 2"/>')
});

const H = {
  sekme: store.get('hesapSekme', 'hesap'),
  ifade: '', sonCevap: 0, hafiza: store.get('hesapHafiza', 0),
  bilimsel: store.get('hesapBilimsel', false), derece: store.get('hesapDerece', true),
  gecmis: store.get('hesapGecmis', []), arac: store.get('hesapArac', 'kdv'),
  cevirTur: store.get('hesapCevirTur', 'doviz'),
  kagitlar: store.get('hesapKagitlar', null), kagitAktif: store.get('hesapKagitAktif', 0),
  basamak: store.get('hesapBasamak', 10)
};
const yaz = (v) => HM.yaz(v, { basamak: H.basamak });

/* ═════════ Başlangıç (giriş gerekmez) ═════════ */
document.removeEventListener('DOMContentLoaded', boot);
function hesapBaslat() {
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  const u = new URLSearchParams(location.search);
  for (const k of ['hesap', 'gunluk', 'cevir', 'kagit']) if (u.has(k)) { H.sekme = k; history.replaceState(null, '', location.pathname + (DEMO ? '?demo' : '')); }
  if (!H.kagitlar) H.kagitlar = [{ ad: 'Örnek: Ekim bütçesi', metin: '# Ekim giderleri\nkira = 18.500\nmarket = 6.200 + 1.350\nfaturalar = 2.480\nulaşım = 1.200\ntoplam\n\n# Gelir\nmaaş = 45.000\nkalan = maaş - (kira + market + faturalar + ulaşım)\nkalan * %40' }];
  kabuk(); sekmeCiz();
}
showLogin = msg => { if (msg) toast(msg); };
start = () => hesapBaslat();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hesapBaslat); else hesapBaslat();

function kabuk() {
  const S = [['hesap', 'Hesap', 'hesapI'], ['gunluk', 'Günlük', 'gunluk'], ['cevir', 'Çevir', 'cevir'], ['kagit', 'Kâğıt', 'kagit']];
  $('#app').innerHTML = `
  <div class="hs-kabuk">
    <header class="hs-bas">
      <div class="brand-mark sm">${IC.hesapI}</div><h1>Hesap</h1>
      <nav class="seg hs-ust-sekme">${S.map(([k, n]) => `<button data-action="h-sekme" data-k="${k}">${n}</button>`).join('')}</nav>
      <div class="spacer"></div>
      <button class="icon-btn" data-action="h-ayar" title="Ayarlar">${IC.gear}</button>
    </header>
    <main class="hs-govde" id="hGovde"></main>
    <nav class="hs-alt-sekme">${S.map(([k, n, ic]) => `<button data-action="h-sekme" data-k="${k}">${IC[ic]}<span>${n}</span></button>`).join('')}</nav>
  </div>`;
}
function sekmeCiz() {
  document.querySelectorAll('[data-action="h-sekme"]').forEach(b => b.classList.toggle('on', b.dataset.k === H.sekme));
  document.body.dataset.hsekme = H.sekme;
  ({ hesap: hesapCiz, gunluk: gunlukCiz, cevir: cevirCiz, kagit: kagitCiz }[H.sekme] || hesapCiz)();
}

/* ═════════ Hesap makinesi ═════════ */
const TUS_STD = [
  ['C', 'temizle', 'fn'], ['⌫', 'geri', 'fn'], ['%', '%', 'fn'], ['÷', '÷', 'op'],
  ['7', '7'], ['8', '8'], ['9', '9'], ['×', '×', 'op'],
  ['4', '4'], ['5', '5'], ['6', '6'], ['−', '−', 'op'],
  ['1', '1'], ['2', '2'], ['3', '3'], ['+', '+', 'op'],
  ['±', 'isaret', 'fn'], ['0', '0'], [',', ','], ['=', 'esit', 'esit']
];
const TUS_BIL = [
  ['sin', 'sin('], ['cos', 'cos('], ['tan', 'tan('], ['(', '('], [')', ')'],
  ['asin', 'asin('], ['acos', 'acos('], ['atan', 'atan('], ['xʸ', '^'], ['x²', '^2'],
  ['ln', 'ln('], ['log', 'log('], ['√', '√('], ['1/x', 'ters'], ['n!', '!'],
  ['π', 'π'], ['e', 'e'], ['Ans', 'ans'], ['EXP', '×10^'], ['|x|', 'abs(']
];
function hesapCiz() {
  $('#hGovde').innerHTML = `
  <div class="hs-hesap ${H.bilimsel ? 'bilimsel' : ''}">
    <section class="hs-makine">
      <div class="hs-ekran" id="hEkran" aria-live="polite">
        <div class="hs-ust"><button class="hs-cip ${H.bilimsel ? 'on' : ''}" data-action="h-bilimsel">Bilimsel</button>${H.bilimsel ? `<button class="hs-cip" data-action="h-derece">${H.derece ? 'DEG' : 'RAD'}</button>` : ''}<span class="hs-hafiza" id="hHafiza"></span><div class="spacer"></div><button class="icon-btn sm" data-action="h-kopyala" title="Sonucu kopyala">${IC.kopya}</button></div>
        <div class="hs-ifade" id="hIfade"></div>
        <div class="hs-onizleme" id="hOnizleme"></div>
      </div>
      <div class="hs-hafiza-tus">${['MC', 'MR', 'M+', 'M−'].map(m => `<button data-action="h-hafiza" data-m="${m}">${m}</button>`).join('')}</div>
      ${H.bilimsel ? `<div class="hs-tuslar bil">${TUS_BIL.map(([e, v]) => `<button class="t bil" data-action="h-tus" data-v="${esc(v)}">${e}</button>`).join('')}</div>` : ''}
      <div class="hs-tuslar">${TUS_STD.map(([e, v, s]) => `<button class="t ${s || 'rakam'}" data-action="h-tus" data-v="${esc(v)}">${e}</button>`).join('')}</div>
    </section>
    <aside class="hs-gecmis">
      <div class="hs-gecmis-bas"><b>${IC.gecmisI}Geçmiş</b><div class="spacer"></div>${H.gecmis.length ? '<button class="btn sm" data-action="h-gecmis-sil">Temizle</button>' : ''}</div>
      <div class="hs-gecmis-l" id="hGecmis"></div>
    </aside>
  </div>`;
  ekranGuncelle(); gecmisCiz();
}
function ifadeSonucu() { try { return HM.coz(H.ifade, { derece: H.derece, degiskenler: { ans: H.sonCevap, Ans: H.sonCevap } }); } catch (e) { return { hata: e.message }; } }
function ekranGuncelle(hata) {
  const el = $('#hIfade'); if (!el) return;
  el.textContent = H.ifade || '0';
  el.classList.toggle('uzun', H.ifade.length > 14); el.classList.toggle('cokuzun', H.ifade.length > 24);
  const r = H.ifade ? ifadeSonucu() : null, on = $('#hOnizleme');
  if (hata) { on.className = 'hs-onizleme hata'; on.textContent = hata; }
  else if (r == null || (typeof r === 'number' && String(H.ifade).trim() === yaz(r))) { on.className = 'hs-onizleme'; on.textContent = ''; }
  else if (typeof r === 'object') { on.className = 'hs-onizleme soluk'; on.textContent = ''; }
  else { on.className = 'hs-onizleme'; on.textContent = '= ' + yaz(r); }
  $('#hHafiza').textContent = H.hafiza ? 'M ' + yaz(H.hafiza) : '';
}
function gecmisCiz() {
  const el = $('#hGecmis'); if (!el) return;
  el.innerHTML = H.gecmis.length ? H.gecmis.map((g, i) => `<button class="hs-g" data-action="h-gecmis-al" data-i="${i}"><span>${esc(g.i)} =</span><b>${esc(yaz(g.s))}</b></button>`).join('')
    : '<p class="muted sm hs-bos">Hesapların burada birikir. Birine dokununca sonucu yeniden kullanırsın.</p>';
}
function tus(v) {
  const son = H.ifade.slice(-1), opmu = c => '+−×÷^'.includes(c);
  if (v === 'temizle') { H.ifade = ''; return ekranGuncelle(); }
  if (v === 'geri') { H.ifade = H.ifade.replace(/(asin\(|acos\(|atan\(|sin\(|cos\(|tan\(|log\(|ln\(|abs\(|√\(|×10\^|ans|.)$/, ''); return ekranGuncelle(); }
  if (v === 'esit') return esittir();
  if (v === 'isaret') {   // son sayının işaretini değiştir
    const m = H.ifade.match(/(.*?)(\(−)?([\d.,]+)$/);
    if (m) H.ifade = m[2] ? m[1] + m[3] : m[1] + '(−' + m[3]; else if (!H.ifade) H.ifade = '−'; else H.ifade += '(−';
    return ekranGuncelle();
  }
  if (v === 'ters') { H.ifade = H.ifade ? '1÷(' + H.ifade + ')' : '1÷'; return ekranGuncelle(); }
  if (H.yeni && /^[\d,]|^[a-zπe√(]/i.test(v) && v !== 'ans') { H.ifade = ''; }   // sonuçtan sonra rakam yazılırsa yeni hesap
  H.yeni = false;
  if (opmu(v) && opmu(son)) H.ifade = H.ifade.slice(0, -1);   // art arda iki işlem: sonuncusu geçerli
  if (opmu(v) && !H.ifade && v !== '−') H.ifade = yaz(H.sonCevap).replace(/\./g, '');
  if (v === ',' && /[\d]*,[\d]*$/.test(H.ifade.split(/[+−×÷^()%]/).pop())) return;   // aynı sayıda ikinci virgül olmaz
  H.ifade += v;
  ekranGuncelle();
}
function esittir() {
  if (!H.ifade.trim()) return;
  const r = ifadeSonucu();
  if (r == null) return;
  if (typeof r === 'object') { ekranGuncelle(r.hata); $('#hEkran').classList.add('salla'); setTimeout(() => $('#hEkran')?.classList.remove('salla'), 400); return; }
  H.gecmis.unshift({ i: H.ifade, s: r, t: Date.now() }); H.gecmis = H.gecmis.slice(0, 100); store.set('hesapGecmis', H.gecmis);
  H.sonCevap = r; H.ifade = yaz(r).replace(/\./g, ''); H.yeni = true;
  ekranGuncelle(); gecmisCiz();
  if (!document.querySelector('.hs-gecmis-bas .btn')) hesapCiz();
}
document.addEventListener('keydown', e => {
  if (H.sekme !== 'hesap' || !$('#hIfade') || $('#modal').innerHTML || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || e.metaKey || e.ctrlKey && e.key !== 'c' || e.altKey) return;
  if (e.ctrlKey && e.key === 'c') { if (!getSelection().toString()) { ACTIONS['h-kopyala'](); e.preventDefault(); } return; }
  const k = e.key, harita = { '*': '×', '×': '×', '÷': '÷', '−': '−', 'x': '×', '/': '÷', '-': '−', '+': '+', '.': ',', ',': ',', '^': '^', '%': '%', '(': '(', ')': ')', '!': '!' };
  let v = null;
  if (/^\d$/.test(k)) v = k; else if (harita[k]) v = harita[k];
  else if (k === 'Enter' || k === '=') v = 'esit'; else if (k === 'Backspace') v = 'geri'; else if (k === 'Escape' || k === 'Delete') v = 'temizle';
  if (!v) return;
  e.preventDefault(); tus(v);
  const b = document.querySelector(`.hs-tuslar [data-v="${CSS.escape(v)}"]`); if (b) { b.classList.add('bas'); setTimeout(() => b.classList.remove('bas'), 120); }
});

/* ═════════ Günlük hesaplar ═════════ */
// Kutulara ifade de yazılabilir: "1.250 + 300", "%18" gibi
const oku = (s, varsayilan = NaN) => { s = String(s ?? '').trim(); if (!s) return varsayilan; try { const v = HM.coz(s.replace(/^%\s*/, '').replace(/%$/, '')); return v == null ? varsayilan : v; } catch { return NaN; } };
const P = v => HM.para(v), Y = (v, b = 2) => isFinite(v) ? '%' + v.toLocaleString('tr-TR', { maximumFractionDigits: b }) : '—';
const ARACLAR = [
  ['kdv', 'KDV', 'Ekle ya da çıkar'], ['tevkifat', 'Tevkifatlı KDV', 'Faturada kesinti'], ['maas', 'Maaş', 'Brütten nete, netten brüte'], ['yuzde', 'Yüzde', 'Yüzde kaç, ne kadar arttı'], ['indirim', 'İndirim', 'Ardışık iskonto dahil'],
  ['kar', 'Kâr ve marj', 'Maliyet, satış fiyatı'], ['kredi', 'Kredi', 'Taksit ve ödeme planı'], ['mevduat', 'Mevduat', 'Faiz getirisi, stopaj'],
  ['tarih', 'Tarih', 'Gün farkı, yaş, gün ekle'], ['bolus', 'Hesap bölüşme', 'Bahşiş ve kişi başı'], ['birim', 'Birim fiyat', 'Hangisi daha ucuz?']
];
// 2026 bordro parametreleri (GİB tebliğ no. 332, Resmî Gazete asgari ücret). Yıl değişince güncellenir.
const BORDRO = {
  yil: 2026, auBrut: 33030, tavan: 297270, sgk: 0.14, issizlik: 0.01, damga: 0.00759,
  dilim: [[190000, 0.15], [400000, 0.20], [1500000, 0.27], [5300000, 0.35], [Infinity, 0.40]]
};
const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
function vergi(m) { let v = 0, alt = 0; for (const [ust, o] of BORDRO.dilim) { if (m > alt) v += (Math.min(m, ust) - alt) * o; alt = ust; } return v; }
// Yıl başından beri aynı brüt maaş alındığı varsayılır (kümülatif matrah)
function bordro(brut, ay) {
  const B = BORDRO, k = x => Math.round(x * 100) / 100, pes = Math.min(brut, B.tavan), sgk = k(pes * B.sgk), iss = k(pes * B.issizlik), matrah = brut - sgk - iss;
  const kum = matrah * (ay - 1), gv = k(vergi(kum + matrah) - vergi(kum));
  const auM = B.auBrut * (1 - B.sgk - B.issizlik), auKum = auM * (ay - 1), gvIst = k(vergi(auKum + auM) - vergi(auKum));
  const gvOde = Math.max(0, k(gv - gvIst)), dv = k(brut * B.damga), dvIst = k(B.auBrut * B.damga), dvOde = Math.max(0, k(dv - dvIst));
  return { brut, sgk, iss, matrah, kum: kum + matrah, gv, gvIst, gvOde, dv, dvIst, dvOde, net: brut - sgk - iss - gvOde - dvOde };
}
function nettenBrut(net, ay) {
  let a = net, b = net * 3;
  for (let i = 0; i < 80; i++) { const m = (a + b) / 2; if (bordro(m, ay).net < net) a = m; else b = m; }
  return Math.round(b * 100) / 100;
}
const TEVKIFAT = [
  ['yapim', 'Yapım işleri (mühendislik, etüt-proje dahil)', 4], ['etut', 'Etüt, plan-proje, danışmanlık, denetim', 9], ['bakim', 'Makine, teçhizat, taşıt bakım-onarım', 7],
  ['yemek', 'Yemek servis ve organizasyon', 5], ['isgucu', 'İşgücü temin', 9], ['yapidenetim', 'Yapı denetim', 9], ['fason', 'Fason tekstil, konfeksiyon, çanta, ayakkabı', 7],
  ['temizlik', 'Temizlik, çevre ve bahçe bakım', 9], ['servis', 'Servis taşımacılığı', 5], ['yuk', 'Karayolu ile yük taşıma', 2], ['baski', 'Baskı ve basım', 7],
  ['reklam', 'Ticari reklam', 3], ['hurda', 'Hurda ve atık teslimi', 7], ['demir', 'Demir-çelik ürünleri teslimi', 5], ['agac', 'Ağaç ve orman ürünleri teslimi', 5], ['ozel', 'Diğer (oranı kendim yazacağım)', null]
];
function gunlukCiz() {
  const A = store.get('hesapAracVeri', {});
  $('#hGovde').innerHTML = `
  <div class="hs-gunluk">
    <nav class="hs-araclar">${ARACLAR.map(([k, n, a]) => `<button class="${H.arac === k ? 'on' : ''}" data-action="h-arac" data-k="${k}"><b>${n}</b><span>${a}</span></button>`).join('')}</nav>
    <section class="hs-kart hs-arac" id="hArac"></section>
  </div>`;
  aracCiz(A[H.arac] || {});
}
const alan = (ad, k, v, o = {}) => `<label class="hs-l">${ad}<div class="hs-girdi"><input data-g="${k}" value="${esc(v ?? o.v ?? '')}" inputmode="${o.mod || 'decimal'}" ${o.tip ? `type="${o.tip}"` : ''} placeholder="${esc(o.ph || '')}" autocomplete="off">${o.son ? `<span>${o.son}</span>` : ''}</div></label>`;
const secim = (ad, k, v, ops) => `<label class="hs-l">${ad}<div class="seg hs-seg" data-sec="${k}">${ops.map(([d, n]) => `<button class="${String(v) === String(d) ? 'on' : ''}" data-d="${esc(d)}">${n}</button>`).join('')}</div></label>`;
const satir = (ad, v, vurgu) => `<div class="hs-s ${vurgu ? 'vurgu' : ''}"><span>${ad}</span><b>${v}</b></div>`;
function aracCiz(d) {
  const k = H.arac, el = $('#hArac'), [, baslik, alt] = ARACLAR.find(a => a[0] === k);
  const F = {
    kdv: () => `${alan('Tutar', 'tutar', d.tutar, { son: '₺', ph: '1.000' })}
      ${secim('KDV oranı', 'oran', d.oran ?? 20, [[1, '%1'], [10, '%10'], [20, '%20'], ['ozel', 'Diğer']])}
      ${d.oran === 'ozel' ? alan('Oran', 'ozelOran', d.ozelOran, { son: '%' }) : ''}
      ${secim('Yazdığın tutar', 'yon', d.yon ?? 'haric', [['haric', 'KDV hariç'], ['dahil', 'KDV dahil']])}`,
    tevkifat: () => `${alan('KDV hariç tutar', 'tutar', d.tutar, { son: '₺', ph: '10.000' })}
      ${secim('KDV oranı', 'oran', d.oran ?? 20, [[20, '%20'], [10, '%10'], [1, '%1']])}
      <label class="hs-l">İş türü<select data-gs="tur">${TEVKIFAT.map(([k, n, o]) => `<option value="${k}" ${(d.tur ?? 'yapim') === k ? 'selected' : ''}>${n}${o ? ' · ' + o + '/10' : ''}</option>`).join('')}</select></label>
      ${(d.tur ?? 'yapim') === 'ozel' ? alan('Tevkifat oranı (onda kaç)', 'pay', d.pay, { son: '/10', ph: '5', mod: 'numeric' }) : ''}
      <p class="muted sm">Oranlar Ocak 2026 tablosundandır. Tevkifat, alıcı belirli kurum ya da mükellef olduğunda uygulanır; emin değilsen muhasebecine sor.</p>`,
    maas: () => `${secim('Bildiğin tutar', 'yon', d.yon ?? 'brut', [['brut', 'Brüt maaş'], ['net', 'Net maaş']])}
      ${alan((d.yon ?? 'brut') === 'brut' ? 'Aylık brüt' : 'Aylık net', 'tutar', d.tutar, { son: '₺', ph: (d.yon ?? 'brut') === 'brut' ? '50.000' : '40.000' })}
      <label class="hs-l">Ay<select data-gs="ay">${AYLAR.map((a, i) => `<option value="${i + 1}" ${+(d.ay ?? (new Date().getMonth() + 1)) === i + 1 ? 'selected' : ''}>${a}</option>`).join('')}</select></label>
      <p class="muted sm">${BORDRO.yil} kurallarıyla, yıl başından beri aynı maaşı aldığın varsayılarak hesaplanır: SGK %14, işsizlik %1, damga vergisi binde 7,59, gelir vergisi dilimleri, asgari ücret istisnası. Yıl içinde vergi dilimi yükseldikçe net maaş azalabilir; aşağıdaki yıllık tabloya bak. Bilgilendirme amaçlıdır; kesin tutar için bordrona bak.</p>`,
    yuzde: () => `${alan('Sayı', 'a', d.a, { ph: '250' })}${alan('Yüzde / ikinci sayı', 'b', d.b, { ph: '18' })}`,
    indirim: () => `${alan('Fiyat', 'fiyat', d.fiyat, { son: '₺', ph: '2.400' })}${alan('İndirim', 'ind', d.ind, { son: '%', ph: '20 ya da 20+10', mod: 'text' })}
      <p class="muted sm">Ardışık indirim için artı ile yaz: <b>20+10</b> önce %20, kalan üzerinden %10 demektir (toplam %30 değil).</p>`,
    kar: () => `${secim('Ne biliyorsun?', 'mod', d.mod ?? 'satis', [['satis', 'Maliyet ve satış'], ['hedef', 'Maliyet ve istenen kâr']])}
      ${alan('Maliyet', 'maliyet', d.maliyet, { son: '₺', ph: '750' })}
      ${(d.mod ?? 'satis') === 'satis' ? alan('Satış fiyatı', 'satis', d.satis, { son: '₺', ph: '1.000' }) : `${secim('Kâr şöyle hesaplansın', 'hedefTur', d.hedefTur ?? 'marj', [['marj', 'Satıştan marj'], ['oran', 'Maliyet üstüne']])}${alan('Kâr', 'hedef', d.hedef, { son: '%', ph: '25' })}`}
      ${alan('KDV (isteğe bağlı)', 'kdv', d.kdv, { son: '%', ph: '0' })}`,
    kredi: () => `${alan('Kredi tutarı', 'tutar', d.tutar, { son: '₺', ph: '100.000' })}${alan('Aylık faiz', 'faiz', d.faiz, { son: '%', ph: '3,49' })}${alan('Vade', 'vade', d.vade, { son: 'ay', ph: '12', mod: 'numeric' })}
      <label class="hs-kutu"><input type="checkbox" data-gk="vergi" ${d.vergi !== false ? 'checked' : ''}> Faize KKDF ve BSMV ekle (ihtiyaç kredisi)</label>
      ${d.vergi !== false ? `<div class="hs-iki">${alan('KKDF', 'kkdf', d.kkdf, { son: '%', v: '15' })}${alan('BSMV', 'bsmv', d.bsmv, { son: '%', v: '15' })}</div>` : ''}
      <p class="muted sm">Konut kredisinde KKDF ve BSMV yoktur. Oranlar değişebilir; bankanın verdiği bilgiyle karşılaştır.</p>`,
    mevduat: () => `${alan('Anapara', 'ana', d.ana, { son: '₺', ph: '100.000' })}${alan('Yıllık faiz', 'faiz', d.faiz, { son: '%', ph: '45' })}${alan('Vade', 'gun', d.gun, { son: 'gün', ph: '32', mod: 'numeric' })}${alan('Stopaj', 'stopaj', d.stopaj, { son: '%', v: '15' })}
      <p class="muted sm">Stopaj oranı vadeye ve döneme göre değişir; güncel oranı bankana sor.</p>`,
    tarih: () => `${secim('Ne hesaplansın?', 'mod', d.mod ?? 'fark', [['fark', 'İki tarih arası'], ['ekle', 'Tarihe gün ekle'], ['yas', 'Yaş']])}
      ${(d.mod ?? 'fark') === 'fark' ? `${alan('Başlangıç', 't1', d.t1, { tip: 'date', mod: 'none' })}${alan('Bitiş', 't2', d.t2, { tip: 'date', mod: 'none' })}`
        : (d.mod === 'ekle') ? `${alan('Tarih', 't1', d.t1, { tip: 'date', mod: 'none' })}${alan('Eklenecek gün (eksi de olur)', 'gun', d.gun, { ph: '90', mod: 'text' })}`
        : `${alan('Doğum tarihi', 't1', d.t1, { tip: 'date', mod: 'none' })}`}`,
    bolus: () => `${alan('Hesap', 'tutar', d.tutar, { son: '₺', ph: '2.350' })}${alan('Bahşiş', 'bahsis', d.bahsis, { son: '%', ph: '10' })}${alan('Kişi sayısı', 'kisi', d.kisi, { ph: '4', mod: 'numeric' })}
      <label class="hs-kutu"><input type="checkbox" data-gk="yuvarla" ${d.yuvarla ? 'checked' : ''}> Kişi başını yukarı yuvarla (tam lira)</label>`,
    birim: () => `<div class="hs-iki"><div><h4>Ürün A</h4>${alan('Fiyat', 'fa', d.fa, { son: '₺', ph: '89,90' })}${alan('Miktar', 'ma', d.ma, { ph: '750' })}</div>
      <div><h4>Ürün B</h4>${alan('Fiyat', 'fb', d.fb, { son: '₺', ph: '109,90' })}${alan('Miktar', 'mb', d.mb, { ph: '1000' })}</div></div>
      ${secim('Miktar birimi', 'birim', d.birim ?? 'g', [['g', 'gram'], ['ml', 'ml'], ['adet', 'adet']])}`
  };
  el.innerHTML = `<div class="hs-arac-bas"><h2>${baslik}</h2><span class="muted sm">${alt}</span><div class="spacer"></div><button class="btn sm" data-action="h-arac-temizle">Temizle</button></div>
    <div class="hs-form">${F[k]()}</div><div class="hs-sonuc" id="hSonuc"></div>`;
  const kaydet = () => { const A = store.get('hesapAracVeri', {}); A[k] = d; store.set('hesapAracVeri', A); };
  el.querySelectorAll('[data-g]').forEach(i => i.addEventListener('input', () => { d[i.dataset.g] = i.value; kaydet(); aracHesapla(k, d); }));
  el.querySelectorAll('[data-gs]').forEach(i => i.addEventListener('change', () => { d[i.dataset.gs] = i.value; kaydet(); aracCiz(d); }));
  el.querySelectorAll('[data-gk]').forEach(i => i.addEventListener('change', () => { d[i.dataset.gk] = i.checked; kaydet(); aracCiz(d); }));
  el.querySelectorAll('[data-sec] button').forEach(b => b.addEventListener('click', () => { const s = b.closest('[data-sec]').dataset.sec; d[s] = isNaN(+b.dataset.d) ? b.dataset.d : +b.dataset.d; kaydet(); aracCiz(d); }));
  aracHesapla(k, d);
}
function aracHesapla(k, d) {
  const el = $('#hSonuc'); if (!el) return;
  const bos = '<p class="muted sm hs-bos">Kutuları doldurdukça sonuç burada görünür. Kutulara işlem de yazabilirsin: <b>1.250 + 300</b></p>';
  let h = '';
  try {
    if (k === 'kdv') {
      const t = oku(d.tutar), o = d.oran === 'ozel' ? oku(d.ozelOran) : +(d.oran ?? 20); if (!isFinite(t) || !isFinite(o)) { el.innerHTML = bos; return; }
      const haric = (d.yon ?? 'haric') === 'haric' ? t : t / (1 + o / 100), kdv = haric * o / 100;
      h = satir('KDV hariç', P(haric) + ' ₺') + satir(`KDV (%${o.toLocaleString('tr-TR')})`, P(kdv) + ' ₺') + satir('KDV dahil', P(haric + kdv) + ' ₺', true);
    }
    if (k === 'tevkifat') {
      const t = oku(d.tutar), o = +(d.oran ?? 20), tur = TEVKIFAT.find(x => x[0] === (d.tur ?? 'yapim')), pay = tur[2] ?? oku(d.pay);
      if (!isFinite(t) || !isFinite(pay)) { el.innerHTML = bos; return; }
      if (pay < 0 || pay > 10) throw new Error('Tevkifat oranı 0 ile 10 arasında olmalı');
      const kdv = t * o / 100, tevkif = kdv * pay / 10, satici = kdv - tevkif;
      h = satir('Alıcının satıcıya ödeyeceği', P(t + satici) + ' ₺', true) + satir('KDV hariç tutar', P(t) + ' ₺') + satir(`Hesaplanan KDV (%${o})`, P(kdv) + ' ₺')
        + satir(`Tevkif edilen KDV (${pay}/10) · alıcı beyan eder`, P(tevkif) + ' ₺') + satir('Satıcıya ödenen KDV', P(satici) + ' ₺') + satir('Fatura toplamı (KDV dahil)', P(t + kdv) + ' ₺');
    }
    if (k === 'maas') {
      const t = oku(d.tutar), ay = +(d.ay ?? (new Date().getMonth() + 1)); if (!isFinite(t) || t <= 0) { el.innerHTML = bos; return; }
      const brut = (d.yon ?? 'brut') === 'brut' ? t : nettenBrut(t, ay), b = bordro(brut, ay);
      if (brut < BORDRO.auBrut - 0.01) h = `<p class="hs-hata">Brüt maaş, ${BORDRO.yil} brüt asgari ücretinin (${P(BORDRO.auBrut)} ₺) altında olamaz.</p>`;
      else {
        h = ((d.yon ?? 'brut') === 'brut' ? satir(`${AYLAR[ay - 1]} net maaş`, P(b.net) + ' ₺', true) : satir(`${AYLAR[ay - 1]} brüt maaş`, P(brut) + ' ₺', true))
          + satir('SGK primi (%14)', '−' + P(b.sgk) + ' ₺') + satir('İşsizlik primi (%1)', '−' + P(b.iss) + ' ₺')
          + satir('Gelir vergisi', '−' + P(b.gvOde) + ' ₺') + satir('Damga vergisi', '−' + P(b.dvOde) + ' ₺')
          + satir('Asgari ücret istisnası (vergiden düşülen)', P(b.gvIst + Math.min(b.dv, b.dvIst)) + ' ₺')
          + satir('Bu ay sonu kümülatif vergi matrahı', P(b.kum) + ' ₺');
        const yil = AYLAR.map((a, i) => { const x = bordro(brut, i + 1); return [a, x.net, x.gvOde, x]; }), topNet = yil.reduce((s, x) => s + x[1], 0);
        h += `<details class="hs-plan"><summary>Yıllık tablo (${BORDRO.yil}, aynı brüt maaşla)</summary><div class="hs-tablo-k"><table class="hs-tablo"><thead><tr><th>Ay</th><th>Net</th><th>Gelir vergisi</th><th>Vergi dilimi</th></tr></thead><tbody>${yil.map(([a, n, gv, x]) => `<tr${a === AYLAR[ay - 1] ? ' class="secili"' : ''}><td>${a}</td><td>${P(n)}</td><td>${P(gv)}</td><td>%${Math.round(BORDRO.dilim.find(([u]) => x.kum <= u)[1] * 100)}</td></tr>`).join('')}<tr><td><b>Yıl</b></td><td><b>${P(topNet)}</b></td><td><b>${P(yil.reduce((s, x) => s + x[2], 0))}</b></td><td></td></tr></tbody></table></div></details>`;
      }
    }
    if (k === 'yuzde') {
      const a = oku(d.a), b = oku(d.b); if (!isFinite(a) || !isFinite(b)) { el.innerHTML = bos; return; }
      h = satir(`${yaz(a)} sayısının %${yaz(b)}'i`, yaz(a * b / 100), true)
        + satir(`${yaz(a)}, ${yaz(b)} sayısının yüzde kaçı`, a && b ? Y(a / b * 100) : '—')
        + satir(`${yaz(a)} → ${yaz(b)} değişim`, a ? (b >= a ? '+' : '') + Y((b - a) / Math.abs(a) * 100).replace('%-', '−%') : '—')
        + satir(`${yaz(a)} + %${yaz(b)}`, yaz(a * (1 + b / 100))) + satir(`${yaz(a)} − %${yaz(b)}`, yaz(a * (1 - b / 100)));
    }
    if (k === 'indirim') {
      const f = oku(d.fiyat), parca = String(d.ind || '').split('+').map(x => oku(x)).filter(x => isFinite(x));
      if (!isFinite(f) || !parca.length) { el.innerHTML = bos; return; }
      const kalan = parca.reduce((a, p) => a * (1 - p / 100), 1), net = f * kalan;
      h = satir('İndirimli fiyat', P(net) + ' ₺', true) + satir('İndirim tutarı', P(f - net) + ' ₺') + satir('Toplam indirim oranı', Y((1 - kalan) * 100));
    }
    if (k === 'kar') {
      const m = oku(d.maliyet), kdv = oku(d.kdv, 0); if (!isFinite(m)) { el.innerHTML = bos; return; }
      let s;
      if ((d.mod ?? 'satis') === 'satis') { s = oku(d.satis); if (!isFinite(s)) { el.innerHTML = bos; return; } }
      else { const hd = oku(d.hedef); if (!isFinite(hd)) { el.innerHTML = bos; return; } if ((d.hedefTur ?? 'marj') === 'marj' && hd >= 100) throw new Error('Marj %100 ve üstü olamaz'); s = (d.hedefTur ?? 'marj') === 'marj' ? m / (1 - hd / 100) : m * (1 + hd / 100); }
      const kar = s - m;
      h = ((d.mod ?? 'satis') === 'hedef' ? satir('Satış fiyatı (KDV hariç)', P(s) + ' ₺', true) : '') + satir('Kâr', P(kar) + ' ₺', (d.mod ?? 'satis') === 'satis')
        + satir('Kâr marjı (satışa göre)', s ? Y(kar / s * 100) : '—') + satir('Kâr oranı (maliyete göre)', m ? Y(kar / m * 100) : '—')
        + (kdv ? satir(`Satış fiyatı KDV dahil (%${kdv.toLocaleString('tr-TR')})`, P(s * (1 + kdv / 100)) + ' ₺') : '');
    }
    if (k === 'kredi') {
      const A = oku(d.tutar), fa = oku(d.faiz), n = Math.round(oku(d.vade)); if (!isFinite(A) || !isFinite(fa) || !(n > 0)) { el.innerHTML = bos; return; }
      const vergi = d.vergi !== false ? (oku(d.kkdf ?? '15', 15) + oku(d.bsmv ?? '15', 15)) / 100 : 0, r = fa / 100 * (1 + vergi);
      const taksit = r === 0 ? A / n : A * r / (1 - Math.pow(1 + r, -n));
      const plan = []; let kalan = A;
      for (let i = 1; i <= n; i++) { const faizVergi = kalan * r, saf = faizVergi / (1 + vergi), anapara = taksit - faizVergi; kalan -= anapara; plan.push([i, taksit, anapara, saf, faizVergi - saf, Math.max(0, kalan)]); }
      const toplam = taksit * n;
      h = satir('Aylık taksit', P(taksit) + ' ₺', true) + satir('Toplam geri ödeme', P(toplam) + ' ₺') + satir('Toplam faiz' + (vergi ? ' ve vergi' : ''), P(toplam - A) + ' ₺')
        + (vergi ? satir('Vergi dahil aylık faiz', Y(r * 100, 3)) : '')
        + `<details class="hs-plan"><summary>Ödeme planı (${n} ay)</summary><div class="hs-tablo-k"><table class="hs-tablo"><thead><tr><th>Ay</th><th>Taksit</th><th>Anapara</th><th>Faiz</th>${vergi ? '<th>Vergi</th>' : ''}<th>Kalan</th></tr></thead><tbody>${plan.map(p => `<tr><td>${p[0]}</td><td>${P(p[1])}</td><td>${P(p[2])}</td><td>${P(p[3])}</td>${vergi ? `<td>${P(p[4])}</td>` : ''}<td>${P(p[5])}</td></tr>`).join('')}</tbody></table></div></details>`;
    }
    if (k === 'mevduat') {
      const a = oku(d.ana), f = oku(d.faiz), g = oku(d.gun), st = oku(d.stopaj ?? '15', 15); if (!isFinite(a) || !isFinite(f) || !isFinite(g)) { el.innerHTML = bos; return; }
      const brut = a * f / 100 * g / 365, stp = brut * st / 100, net = brut - stp;
      h = satir('Net getiri', P(net) + ' ₺', true) + satir('Brüt faiz', P(brut) + ' ₺') + satir(`Stopaj (%${st.toLocaleString('tr-TR')})`, P(stp) + ' ₺') + satir('Vade sonu toplam', P(a + net) + ' ₺')
        + satir('Net yıllık getiri', a ? Y(net / a * 365 / g * 100) : '—');
    }
    if (k === 'tarih') {
      const t = s => s ? new Date(s + 'T12:00:00') : null, gun = 864e5, ad = x => x.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
      const mod = d.mod ?? 'fark';
      if (mod === 'fark') {
        const a = t(d.t1), b = t(d.t2); if (!a || !b) { el.innerHTML = bos; return; }
        const [x, y] = a <= b ? [a, b] : [b, a], fark = Math.round((y - x) / gun);
        let ay = (y.getFullYear() - x.getFullYear()) * 12 + y.getMonth() - x.getMonth(); if (y.getDate() < x.getDate()) ay--;
        const ara = new Date(x); ara.setMonth(ara.getMonth() + ay); const kalanGun = Math.round((y - ara) / gun);
        let is = 0; for (let z = new Date(x); z < y; z.setDate(z.getDate() + 1)) { const w = z.getDay(); if (w && w !== 6) is++; }
        h = satir('Gün', fark.toLocaleString('tr-TR') + ' gün', true) + satir('Hafta', `${Math.floor(fark / 7)} hafta ${fark % 7} gün`)
          + satir('Ay', `${Math.floor(ay / 12) ? Math.floor(ay / 12) + ' yıl ' : ''}${ay % 12} ay ${kalanGun} gün`) + satir('İş günü (Pzt–Cum)', is.toLocaleString('tr-TR') + ' gün')
          + '<p class="muted sm">İş günü hesabında resmî tatiller düşülmez.</p>';
      }
      if (mod === 'ekle') { const a = t(d.t1), g = oku(d.gun); if (!a || !isFinite(g)) { el.innerHTML = bos; return; } const z = new Date(a); z.setDate(z.getDate() + Math.round(g)); h = satir('Sonuç', ad(z), true); }
      if (mod === 'yas') {
        const a = t(d.t1); if (!a) { el.innerHTML = bos; return; } const b = new Date(); b.setHours(12, 0, 0, 0);
        let yil = b.getFullYear() - a.getFullYear(); const dg = new Date(a); dg.setFullYear(b.getFullYear()); if (dg > b) yil--;
        const sonraki = new Date(a); sonraki.setFullYear(b.getFullYear() + (dg > b ? 0 : 1)); if (+new Date(dg) === +b) sonraki.setFullYear(b.getFullYear());
        const kalan = Math.round((sonraki - b) / gun);
        h = satir('Yaş', yil + ' yaşında', true) + satir('Yaşadığı gün', Math.round((b - a) / gun).toLocaleString('tr-TR') + ' gün') + satir('Doğum günü', a.toLocaleDateString('tr-TR', { weekday: 'long' }) + ' günü doğmuş')
          + satir('Sonraki doğum günü', kalan === 0 || kalan === 365 ? 'Bugün! 🎂' : kalan + ' gün sonra');
      }
    }
    if (k === 'bolus') {
      const t = oku(d.tutar), b = oku(d.bahsis, 0), n = Math.max(1, Math.round(oku(d.kisi, 1))); if (!isFinite(t)) { el.innerHTML = bos; return; }
      const top = t * (1 + b / 100); let kb = top / n; if (d.yuvarla) kb = Math.ceil(kb);
      h = satir('Kişi başı', P(kb) + ' ₺', true) + satir('Bahşiş', P(t * b / 100) + ' ₺') + satir('Toplam', P(top) + ' ₺') + (d.yuvarla ? satir('Yuvarlamadan artan', P(kb * n - top) + ' ₺') : '');
    }
    if (k === 'birim') {
      const fa = oku(d.fa), ma = oku(d.ma), fb = oku(d.fb), mb = oku(d.mb), bi = d.birim ?? 'g'; if (![fa, ma, fb, mb].every(x => isFinite(x) && x > 0)) { el.innerHTML = bos; return; }
      const carp = bi === 'adet' ? 1 : 1000, bn = bi === 'g' ? 'kg' : bi === 'ml' ? 'litre' : 'adet', ba = fa / ma * carp, bb = fb / mb * carp;
      const ucuz = ba === bb ? null : ba < bb ? 'A' : 'B', fark = Math.abs(ba - bb) / Math.max(ba, bb) * 100;
      h = satir(`A · ${bn} fiyatı`, P(ba) + ' ₺', ucuz === 'A') + satir(`B · ${bn} fiyatı`, P(bb) + ' ₺', ucuz === 'B')
        + `<p class="hs-karar">${ucuz ? `<b>Ürün ${ucuz}</b> daha ucuz · %${fark.toLocaleString('tr-TR', { maximumFractionDigits: 1 })} fark` : 'İkisi aynı fiyatta'}</p>`;
    }
  } catch (e) { h = `<p class="hs-hata">${esc(e.message)}</p>`; }
  el.innerHTML = h || bos;
}

/* ═════════ Çevirici ═════════ */
const BIRIM = {
  uzunluk: { ad: 'Uzunluk', b: [['mm', 'Milimetre', 0.001], ['cm', 'Santimetre', 0.01], ['m', 'Metre', 1], ['km', 'Kilometre', 1000], ['in', 'İnç', 0.0254], ['ft', 'Fit (ayak)', 0.3048], ['yd', 'Yarda', 0.9144], ['mi', 'Mil', 1609.344], ['nmi', 'Deniz mili', 1852]] },
  agirlik: { ad: 'Ağırlık', b: [['mg', 'Miligram', 1e-6], ['g', 'Gram', 0.001], ['kg', 'Kilogram', 1], ['t', 'Ton', 1000], ['oz', 'Ons', 0.028349523125], ['lb', 'Libre (pound)', 0.45359237], ['ct', 'Kırat', 0.0002]] },
  alan: { ad: 'Alan', b: [['cm2', 'cm²', 1e-4], ['m2', 'm²', 1], ['dekar', 'Dönüm / dekar', 1000], ['ha', 'Hektar', 10000], ['km2', 'km²', 1e6], ['ft2', 'ft²', 0.09290304], ['acre', 'Akre', 4046.8564224]] },
  hacim: { ad: 'Hacim', b: [['ml', 'Mililitre', 0.001], ['l', 'Litre', 1], ['m3', 'm³', 1000], ['bardak', 'Su bardağı (200 ml)', 0.2], ['yk', 'Yemek kaşığı (15 ml)', 0.015], ['tk', 'Tatlı kaşığı (5 ml)', 0.005], ['gal', 'Galon (ABD)', 3.785411784], ['floz', 'Sıvı ons (ABD)', 0.0295735295625]] },
  sicaklik: { ad: 'Sıcaklık', b: [['c', 'Santigrat (°C)'], ['f', 'Fahrenhayt (°F)'], ['k', 'Kelvin (K)']] },
  hiz: { ad: 'Hız', b: [['kmh', 'km/saat', 1 / 3.6], ['ms', 'm/saniye', 1], ['mph', 'mil/saat', 0.44704], ['kn', 'Knot', 0.514444444]] },
  zaman: { ad: 'Zaman', b: [['sn', 'Saniye', 1], ['dk', 'Dakika', 60], ['sa', 'Saat', 3600], ['gun', 'Gün', 86400], ['hafta', 'Hafta', 604800], ['ay', 'Ay (30 gün)', 2592000], ['yil', 'Yıl (365 gün)', 31536000]] },
  veri: { ad: 'Veri', b: [['b', 'Bayt', 1], ['kb', 'KB', 1024], ['mb', 'MB', 1048576], ['gb', 'GB', 1073741824], ['tb', 'TB', 1099511627776]] },
  enerji: { ad: 'Enerji', b: [['j', 'Joule', 1], ['kj', 'Kilojoule', 1000], ['cal', 'Kalori (kcal)', 4184], ['kwh', 'Kilovatsaat', 3.6e6]] }
};
const PARA = [['TRY', 'Türk lirası', '₺'], ['USD', 'ABD doları', '$'], ['EUR', 'Euro', '€'], ['GBP', 'İngiliz sterlini', '£'], ['CHF', 'İsviçre frangı', 'Fr'], ['JPY', 'Japon yeni', '¥'], ['CAD', 'Kanada doları', '$'], ['AUD', 'Avustralya doları', '$'], ['SEK', 'İsveç kronu', 'kr'], ['NOK', 'Norveç kronu', 'kr'], ['DKK', 'Danimarka kronu', 'kr'], ['CNY', 'Çin yuanı', '¥'], ['PLN', 'Polonya zlotisi', 'zł'], ['RON', 'Rumen leyi', 'lei'], ['BGN', 'Bulgar levası', 'лв'], ['HUF', 'Macar forinti', 'Ft'], ['CZK', 'Çek korunası', 'Kč'], ['INR', 'Hindistan rupisi', '₹'], ['KRW', 'Güney Kore wonu', '₩'], ['BRL', 'Brezilya reali', 'R$'], ['MXN', 'Meksika pesosu', '$'], ['ZAR', 'Güney Afrika randı', 'R'], ['ILS', 'İsrail şekeli', '₪']];
function cevirCiz() {
  const C = store.get('hesapCevir', {});
  $('#hGovde').innerHTML = `
  <div class="hs-cevir">
    <div class="hs-cipler">${[['doviz', 'Döviz'], ...Object.entries(BIRIM).map(([k, v]) => [k, v.ad])].map(([k, n]) => `<button class="hs-cip ${H.cevirTur === k ? 'on' : ''}" data-action="h-cevir-tur" data-k="${k}">${n}</button>`).join('')}</div>
    <section class="hs-kart" id="hCevir"></section>
  </div>`;
  H.cevirTur === 'doviz' ? dovizCiz(C) : birimCiz(C);
}
function birimCiz(C) {
  const t = BIRIM[H.cevirTur], d = C[H.cevirTur] || { miktar: '1', kaynak: t.b[H.cevirTur === 'sicaklik' ? 0 : Math.min(2, t.b.length - 1)][0] };
  $('#hCevir').innerHTML = `<div class="hs-cevir-ust">${alan('Miktar', 'miktar', d.miktar, { ph: '1' })}<label class="hs-l">Birim<select id="hKaynak">${t.b.map(([k, n]) => `<option value="${k}" ${d.kaynak === k ? 'selected' : ''}>${n}</option>`).join('')}</select></label></div><div class="hs-liste" id="hListe"></div>`;
  const ciz = () => {
    const m = oku(d.miktar), kaynak = d.kaynak, el = $('#hListe');
    if (!isFinite(m)) { el.innerHTML = '<p class="muted sm hs-bos">Bir miktar yaz.</p>'; return; }
    const cevir = (deger, a, b) => {
      if (H.cevirTur !== 'sicaklik') { const fa = t.b.find(x => x[0] === a)[2], fb = t.b.find(x => x[0] === b)[2]; return deger * fa / fb; }
      const c = a === 'c' ? deger : a === 'f' ? (deger - 32) * 5 / 9 : deger - 273.15; return b === 'c' ? c : b === 'f' ? c * 9 / 5 + 32 : c + 273.15;
    };
    el.innerHTML = t.b.filter(([k]) => k !== kaynak).map(([k, n]) => `<div class="hs-s"><span>${n}</span><b>${esc(HM.yaz(HM.coz(String(cevir(m, kaynak, k))) ?? 0, { basamak: 6 }))}</b></div>`).join('');
  };
  const kaydet = () => { const C2 = store.get('hesapCevir', {}); C2[H.cevirTur] = d; store.set('hesapCevir', C2); };
  $('#hCevir [data-g="miktar"]').addEventListener('input', e => { d.miktar = e.target.value; kaydet(); ciz(); });
  $('#hKaynak').addEventListener('change', e => { d.kaynak = e.target.value; kaydet(); ciz(); });
  ciz();
}
let kurYukleniyor = null;
async function kurlariAl(zorla) {
  const K = store.get('hesapKurlar', null), bugun = new Date().toISOString().slice(0, 10);
  if (K && !zorla && K.alindi?.slice(0, 10) === bugun) return K;
  if (!navigator.onLine) return K;
  kurYukleniyor ||= (async () => {
    for (const url of ['https://api.frankfurter.dev/v1/latest?base=EUR', 'https://api.frankfurter.app/latest?from=EUR']) {
      try {
        const r = await fetch(url, { cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer' }); if (!r.ok) continue;
        const j = await r.json(); if (!j.rates || !j.rates.TRY) continue;
        const kur = { tarih: j.date, alindi: new Date().toISOString(), oran: { EUR: 1, ...Object.fromEntries(Object.entries(j.rates).filter(([, v]) => typeof v === 'number' && v > 0)) } };
        store.set('hesapKurlar', kur); return kur;
      } catch {}
    }
    return K;
  })().finally(() => { kurYukleniyor = null; });
  return kurYukleniyor;
}
async function dovizCiz(C) {
  const d = C.doviz || { miktar: '100', kaynak: 'USD' };
  $('#hCevir').innerHTML = `<div class="hs-cevir-ust">${alan('Miktar', 'miktar', d.miktar, { ph: '100' })}<label class="hs-l">Para birimi<select id="hKaynak">${PARA.map(([k, n]) => `<option value="${k}" ${d.kaynak === k ? 'selected' : ''}>${k} · ${n}</option>`).join('')}</select></label></div>
    <div class="hs-kur-bilgi" id="hKurBilgi">Kurlar alınıyor…</div><div class="hs-liste" id="hListe"></div>`;
  let K = store.get('hesapKurlar', null);
  const ciz = () => {
    const el = $('#hListe'), m = oku(d.miktar); if (!el) return;
    if (!K) { el.innerHTML = '<p class="muted sm hs-bos">Kur bilgisi yok. İnternete bağlanınca kendiliğinden alınır.</p>'; return; }
    if (!isFinite(m)) { el.innerHTML = '<p class="muted sm hs-bos">Bir miktar yaz.</p>'; return; }
    const o = K.oran, kaynak = o[d.kaynak]; if (!kaynak) { el.innerHTML = '<p class="muted sm hs-bos">Bu para biriminin kuru yok.</p>'; return; }
    const sira = ['TRY', ...PARA.map(p => p[0]).filter(x => x !== 'TRY')].filter(x => x !== d.kaynak && o[x]);
    el.innerHTML = sira.map(k => { const p = PARA.find(x => x[0] === k), v = m / kaynak * o[k]; return `<div class="hs-s ${k === 'TRY' ? 'vurgu' : ''}"><span><b class="hs-kod">${k}</b> ${p ? p[1] : ''}</span><b>${HM.para(v, v < 1 ? 4 : 2)} ${p ? p[2] : ''}</b></div>`; }).join('')
      + `<p class="muted sm">1 ${d.kaynak} = ${HM.para(o.TRY / kaynak, 4)} ₺</p>`;
  };
  const bilgi = () => { const el = $('#hKurBilgi'); if (!el) return; el.innerHTML = K ? `<span>Kur tarihi: <b>${new Date(K.tarih + 'T12:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</b> · Avrupa Merkez Bankası</span><button class="btn sm" data-action="h-kur-yenile">${IC.refresh}Yenile</button>` : 'Kurlar alınamadı. İnternet bağlantını kontrol et.'; };
  const kaydet = () => { const C2 = store.get('hesapCevir', {}); C2.doviz = d; store.set('hesapCevir', C2); };
  $('#hCevir [data-g="miktar"]').addEventListener('input', e => { d.miktar = e.target.value; kaydet(); ciz(); });
  $('#hKaynak').addEventListener('change', e => { d.kaynak = e.target.value; kaydet(); ciz(); });
  ciz(); if (K) bilgi();
  K = await kurlariAl(false) || K; bilgi(); ciz();
}

/* ═════════ Hesap kâğıdı ═════════ */
function kagitCiz() {
  H.kagitAktif = Math.min(H.kagitAktif, H.kagitlar.length - 1);
  const k = H.kagitlar[H.kagitAktif];
  $('#hGovde').innerHTML = `
  <div class="hs-kagit-s">
    <div class="hs-kagit-bas">
      <select id="hKagitSec" aria-label="Kâğıt">${H.kagitlar.map((x, i) => `<option value="${i}" ${i === H.kagitAktif ? 'selected' : ''}>${esc(x.ad)}</option>`).join('')}</select>
      <button class="btn sm" data-action="h-kagit-yeni">${IC.plus}Yeni</button>
      <button class="btn sm" data-action="h-kagit-ad">Adını değiştir</button>
      <div class="spacer"></div>
      <button class="btn sm" data-action="h-kagit-kopya">${IC.kopya}Kopyala</button>
      <button class="icon-btn sm" data-action="h-kagit-sil" title="Kâğıdı sil">${IC.trash}</button>
    </div>
    <div class="hs-kagit hs-kart">
      <div class="hs-kagit-ic"><textarea id="hKagitMetin" spellcheck="false" wrap="off" placeholder="kira = 18.500&#10;market = 6.200 + 1.350&#10;toplam">${esc(k.metin)}</textarea><div class="hs-kagit-sonuc" id="hKagitSonuc" aria-hidden="true"></div></div>
    </div>
    <div class="hs-kagit-alt"><details><summary>Nasıl yazılır?</summary>
      <ul class="muted sm">
        <li><b>ad = işlem</b> ya da <b>Ad: işlem</b> → sonucu adıyla saklar; sonra adını işlemde kullanabilirsin (<b>kira * 12</b>).</li>
        <li><b>toplam</b> → bir önceki boş satıra kadar olan sonuçları toplar. <b>genel toplam</b> hepsini toplar.</li>
        <li><b>önceki</b> → bir üstteki sonuç. <b>%</b> → 5.000 + %18, 1.200 − 10%.</li>
        <li><b>#</b> ile başlayan ya da sadece yazı olan satırlar not sayılır.</li>
      </ul></details></div>
  </div>`;
  const ta = $('#hKagitMetin'), so = $('#hKagitSonuc');
  const guncelle = () => {
    const r = HM.kagit(ta.value, { derece: H.derece });
    so.innerHTML = r.satirlar.map(s => s.tur === 'deger' ? `<div class="${s.toplam ? 'top' : ''}">${esc(yaz(s.v))}</div>` : s.tur === 'hata' ? `<div class="hata" title="${esc(s.mesaj)}">?</div>` : '<div>&nbsp;</div>').join('');
    so.scrollTop = ta.scrollTop;
  };
  let t = 0;
  ta.addEventListener('input', () => { k.metin = ta.value; guncelle(); clearTimeout(t); t = setTimeout(() => store.set('hesapKagitlar', H.kagitlar), 300); });
  ta.addEventListener('scroll', () => { so.scrollTop = ta.scrollTop; });
  $('#hKagitSec').addEventListener('change', e => { H.kagitAktif = +e.target.value; store.set('hesapKagitAktif', H.kagitAktif); kagitCiz(); });
  guncelle();
}

/* ═════════ Ayarlar ═════════ */
function ayarAc() {
  const t = store.get('theme', 'light');
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet settings"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Ayarlar</h3></header>
    <div class="set-body">
      <section><h4>Görünüm</h4><div class="seg yon-seg">${[['light', 'Cam'], ['dark', 'Koyu'], ['auto', 'Otomatik'], ['flat', 'Düz']].map(([k, n]) => `<button class="${t === k ? 'on' : ''}" data-action="h-tema" data-t="${k}">${n}</button>`).join('')}</div></section>
      <section><h4>Ondalık basamak</h4><div class="seg yon-seg">${[[2, '2'], [4, '4'], [6, '6'], [10, 'En çok']].map(([k, n]) => `<button class="${H.basamak === k ? 'on' : ''}" data-action="h-basamak" data-k="${k}">${n}</button>`).join('')}</div></section>
      <section><h4>Verilerin</h4><div class="set-row"><div><b>Bu cihazda</b><span>Geçmiş, hafıza, hesap kâğıtları ve son kurlar sadece bu cihazda saklanır. Döviz kuru için internetten yalnızca kur listesi alınır; senin hiçbir bilgin gönderilmez.</span></div><button class="btn" data-action="h-hepsini-sil">Hepsini sil</button></div></section>
      <section><h4>Uygulama</h4>${typeof aboutRow === 'function' ? aboutRow() : ''}</section>
    </div></div></div>`;
}

/* ═════════ Olaylar ═════════ */
Object.assign(ACTIONS, {
  'h-sekme': el => { H.sekme = el.dataset.k; store.set('hesapSekme', H.sekme); sekmeCiz(); },
  'h-ayar': () => ayarAc(), settings: () => ayarAc(),
  'h-tema': el => { store.set('theme', el.dataset.t); applyTheme(el.dataset.t); ayarAc(); },
  'h-basamak': el => { H.basamak = +el.dataset.k; store.set('hesapBasamak', H.basamak); ayarAc(); sekmeCiz(); },
  'h-hepsini-sil': () => { if (!confirm('Geçmiş, hafıza, hesap kâğıtları ve kayıtlı hesaplar silinsin mi?')) return; ['hesapGecmis', 'hesapHafiza', 'hesapKagitlar', 'hesapKagitAktif', 'hesapAracVeri', 'hesapCevir', 'hesapKurlar'].forEach(k => store.del(k)); location.reload(); },
  'h-tus': el => tus(el.dataset.v),
  'h-bilimsel': () => { H.bilimsel = !H.bilimsel; store.set('hesapBilimsel', H.bilimsel); hesapCiz(); },
  'h-derece': () => { H.derece = !H.derece; store.set('hesapDerece', H.derece); hesapCiz(); },
  'h-hafiza': el => {
    const m = el.dataset.m, r = H.ifade ? ifadeSonucu() : H.sonCevap, v = typeof r === 'number' ? r : 0;
    if (m === 'MC') H.hafiza = 0; if (m === 'M+') H.hafiza += v; if (m === 'M−') H.hafiza -= v;
    if (m === 'MR') { if (H.yeni) H.ifade = ''; H.yeni = false; H.ifade += yaz(H.hafiza).replace(/\./g, ''); }
    H.hafiza = HM.coz(String(H.hafiza)) || 0; store.set('hesapHafiza', H.hafiza); ekranGuncelle();
    if (m === 'M+' || m === 'M−') toast(`Hafıza: ${yaz(H.hafiza)}`);
  },
  'h-kopyala': async () => {
    const r = H.ifade ? ifadeSonucu() : H.sonCevap, v = typeof r === 'number' ? yaz(r) : '';
    if (!v) return; try { await navigator.clipboard.writeText(v); toast('Kopyalandı: ' + v); } catch { toast(v); }
  },
  'h-gecmis-al': el => { const g = H.gecmis[+el.dataset.i]; if (!g) return; H.ifade = (H.ifade && !H.yeni ? H.ifade : '') + yaz(g.s).replace(/\./g, ''); H.yeni = false; ekranGuncelle(); },
  'h-gecmis-sil': () => { H.gecmis = []; store.set('hesapGecmis', []); hesapCiz(); },
  'h-arac': el => { H.arac = el.dataset.k; store.set('hesapArac', H.arac); gunlukCiz(); if (innerWidth < 760) $('#hArac')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
  'h-arac-temizle': () => { const A = store.get('hesapAracVeri', {}); delete A[H.arac]; store.set('hesapAracVeri', A); aracCiz({}); },
  'h-cevir-tur': el => { H.cevirTur = el.dataset.k; store.set('hesapCevirTur', H.cevirTur); cevirCiz(); },
  'h-kur-yenile': async () => { const el = $('#hKurBilgi'); if (el) el.textContent = 'Yenileniyor…'; const K = await kurlariAl(true); toast(K ? 'Kurlar güncel' : 'Kurlar alınamadı'); cevirCiz(); },
  'h-kagit-yeni': () => { H.kagitlar.push({ ad: 'Kâğıt ' + (H.kagitlar.length + 1), metin: '' }); H.kagitAktif = H.kagitlar.length - 1; store.set('hesapKagitlar', H.kagitlar); store.set('hesapKagitAktif', H.kagitAktif); kagitCiz(); $('#hKagitMetin')?.focus(); },
  'h-kagit-ad': () => { const k = H.kagitlar[H.kagitAktif], a = prompt('Kâğıdın adı:', k.ad); if (!a?.trim()) return; k.ad = a.trim().slice(0, 60); store.set('hesapKagitlar', H.kagitlar); kagitCiz(); },
  'h-kagit-sil': () => {
    const k = H.kagitlar[H.kagitAktif]; if (!confirm(`"${k.ad}" silinsin mi?`)) return;
    H.kagitlar.splice(H.kagitAktif, 1); if (!H.kagitlar.length) H.kagitlar.push({ ad: 'Kâğıt 1', metin: '' });
    H.kagitAktif = 0; store.set('hesapKagitlar', H.kagitlar); store.set('hesapKagitAktif', 0); kagitCiz();
  },
  'h-kagit-kopya': async () => {
    const k = H.kagitlar[H.kagitAktif], r = HM.kagit(k.metin, { derece: H.derece }), sat = k.metin.split('\n');
    const metin = sat.map((s, i) => { const x = r.satirlar[i]; return x?.tur === 'deger' && !s.trim().startsWith('#') ? `${s}  →  ${yaz(x.v)}` : s; }).join('\n') + (r.genel ? `\n\nGenel toplam: ${yaz(r.genel)}` : '');
    try { await navigator.clipboard.writeText(metin); toast('Kâğıt sonuçlarıyla kopyalandı'); } catch { toast('Kopyalanamadı'); }
  }
});
