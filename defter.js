/* ───────────── Kayıt Defteri ─────────────
   Araç, fatura, garanti, ev, sağlık… istediğin defteri aç; tarih, tutar, fotoğraf ve hatırlatmayla kayıt tut.
   Giriş gerekmez; her şey bu cihazda kalır. İstersen yedek dosyası alırsın ya da Google Drive'a yedeklersin. */
'use strict';

window.APP_NAME = 'Kayıt Defteri';
window.APP_ICON = 'defter-apple.png?v=8';
window.APP_LEAD = 'Araç bakımı, faturalar, garantiler ve daha fazlası için kayıt defteri: tarih, tutar, fotoğraf, hatırlatma. Ücretsiz, reklamsız.';
window.AUTH_STATE_PREFIX = 'dft-';
window.APP_SCOPES = 'openid email ' + SC_DRIVE_D;
window.APP_NEED_SCOPE = SC_DRIVE_D;
Auth.redirectUri = () => location.origin + location.pathname.replace(/[^/]*$/, '');

const KSVG = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
Object.assign(IC, {
  defter: KSVG('<path d="M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6z"/><path d="M6 3v18M3.5 7H6M3.5 12H6M3.5 17H6M10 8h6M10 11.5h4"/>'),
  arac: KSVG('<path d="M4 16v-4l2-5h12l2 5v4"/><path d="M3 16h18v2H3z"/><circle cx="7.5" cy="16" r="1.6"/><circle cx="16.5" cy="16" r="1.6"/><path d="M6 12h12"/>'),
  fatura: KSVG('<path d="M6 2.8h12v18.4l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4z"/><path d="M9 8h6M9 11.5h6M9 15h3.5"/>'),
  garanti: KSVG('<path d="M12 2.8 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.7 4.3-1.3 7.5-5.1 7.5-9.7V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>'),
  ev: KSVG('<path d="m3 11 9-7 9 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5h4v5"/>'),
  saglik: KSVG('<path d="M12 20.5s-8-4.7-8-10.5a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 10.5-8 10.5z"/><path d="M8.5 12h2l1-2 1.5 4 1-2h1.5"/>'),
  zil: KSVG('<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>'),
  foto: KSVG('<rect x="3" y="5" width="18" height="15" rx="2"/><circle cx="12" cy="12.5" r="3.5"/><path d="M8.5 5 10 3h4l1.5 2"/>'),
  resim: KSVG('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>'),
  arti: KSVG('<path d="M12 5v14M5 12h14"/>'),
  geri: KSVG('<path d="M15 5l-7 7 7 7"/>'),
  ara: KSVG('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.4-4.4"/>'),
  duzen: KSVG('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>'),
  indir: KSVG('<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M5 19h14"/>'),
  yukle: KSVG('<path d="M12 16V4M7.5 8.5 12 4l4.5 4.5"/><path d="M5 15v4h14v-4"/>'),
  bulut: KSVG('<path d="M7 18h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.3 9.6 4.2 4.2 0 0 0 7 18z"/>'),
  tamam: KSVG('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  kopya: KSVG('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>'),
  sil: KSVG('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
  menu3: KSVG('<circle cx="12" cy="5" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="19" r="1.4" fill="currentColor"/>'),
  takvim: KSVG('<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>')
});

const DF = {
  defterler: [], kayitlar: [], ekran: 'ana', defterId: null, filtre: '', ara: '',
  form: null, fotoUrl: new Map(), yuklendi: false,
  ayar: Object.assign({ onceGun: 3 }, store.get('defterAyar', {}))
};
const ayarKaydet = () => store.set('defterAyar', DF.ayar);
const defterAl = id => DF.defterler.find(d => d.id === id);
const defterKayitlari = id => DF.kayitlar.filter(k => k.defterId === id);
const kucukUrl = async id => {
  if (DF.fotoUrl.has(id)) return DF.fotoUrl.get(id);
  const f = await DDB.al('fotolar', id); if (!f) return '';
  const u = URL.createObjectURL(f.kucuk || f.blob); DF.fotoUrl.set(id, u); return u;
};
const programda = () => !!window.SUHA_YEREL;

/* ═════════ Başlangıç ═════════ */
document.removeEventListener('DOMContentLoaded', boot);
async function dfBaslat() {
  document.documentElement.classList.add('df-html');
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  let niyet = null;
  if (location.hash.includes('state=')) {
    try { niyet = JSON.parse(sessionStorage.getItem('defterNiyet') || 'null'); sessionStorage.removeItem('defterNiyet'); } catch {}
    const r = Auth.handleRedirect();
    if (r === 'ok') {
      const v = await Auth.verify();
      if (v !== 'ok') { store.del('auth'); niyet = null; toast(v === 'izin' ? 'Drive izni verilmedi; yedekleme yapılamadı.' : 'Giriş doğrulanamadı.'); }
      else { const email = jwtBody(store.get('idt')?.t || '')?.email || ''; if (email) store.set('email', email); if (typeof accessGate === 'function' && email && !(await accessGate(email))) return; }
    } else if (r && r !== 'state') { niyet = null; toast(r === 'access_denied' ? 'Giriş iptal edildi.' : 'Giriş tamamlanamadı.'); }
    history.replaceState(null, '', location.pathname + (DEMO ? '?demo' : ''));
  }
  await yukle();
  if (DEMO && !DF.defterler.length) { await ornekVeri(); await yukle(); }
  const u = new URLSearchParams(location.search);
  if (u.get('ekle')) { const d = DF.defterler[0]; if (d) { DF.defterId = d.id; DF.ekran = 'defter'; } }
  ciz();
  if (u.get('ekle') && DF.defterId) kayitFormu(null);
  if (niyet?.islem === 'yedekle') driveYedekAl(true);
  if (niyet?.islem === 'geri') driveGeriAl(true);
  if (niyet?.islem === 'ac') { DF.ayar.drive = true; ayarKaydet(); driveYedekAl(true); }
  bildirimleriKur();
}
showLogin = msg => { if (msg) toast(msg); };
start = () => dfBaslat();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', dfBaslat); else dfBaslat();

async function yukle() {
  try { [DF.defterler, DF.kayitlar] = await Promise.all([DDB.hepsi('defterler'), DDB.hepsi('kayitlar')]); }
  catch (e) { DF.defterler = []; DF.kayitlar = []; toast('Cihazdaki depo açılamadı: ' + e.message); }
  DF.defterler.sort((a, b) => (a.sira || 0) - (b.sira || 0));
  DF.yuklendi = true;
}
// Her değişiklikten sonra: hatırlatmaları kur, Drive yedeğini zamanla
let yedekZaman = null;
function degisti() {
  bildirimleriKur();
  if (DF.ayar.drive && !programda()) {
    clearTimeout(yedekZaman);
    if (dAnahtar()) yedekZaman = setTimeout(() => driveYedekAl(false), 12000);
    else { DF.ayar.yedekBekliyor = true; ayarKaydet(); }
  }
}

/* ═════════ Kabuk ═════════ */
function ciz() {
  document.body.dataset.ekran = DF.ekran;
  if (DF.ekran === 'defter' && defterAl(DF.defterId)) defterCiz(); else { DF.ekran = 'ana'; anaCiz(); }
}
function kabuk(baslik, sol, sag) {
  return `<div class="df-kabuk"><header class="df-bas">${sol}<h1>${baslik}</h1><div class="spacer"></div>${sag}</header><main class="df-govde" id="dfGovde"></main></div>`;
}

/* ═════════ Ana ekran ═════════ */
function anaCiz() {
  $('#app').innerHTML = kabuk('Kayıt Defteri', `<div class="brand-mark sm">${IC.defter}</div>`, `<button class="icon-btn" data-action="d-ayar" title="Ayarlar">${IC.gear}</button>`);
  const g = $('#dfGovde');
  if (!DF.defterler.length) { g.innerHTML = hosgeldin(); return; }
  const H = hatirlatmalar(DF.defterler, DF.kayitlar), yakin = H.filter(h => gunFarki(h.tarih) <= 30);
  const bekleyen = DF.ayar.drive && DF.ayar.yedekBekliyor && !programda();
  g.innerHTML = `
    ${bekleyen ? `<div class="df-serit">${IC.bulut}<span>Son değişiklikler henüz Drive'a yedeklenmedi.</span><button class="btn sm" data-action="d-drive-yedekle">Şimdi yedekle</button></div>` : ''}
    ${yakin.length ? `<section class="df-bolum"><h2>${IC.zil}Yaklaşanlar</h2><div class="df-yaklasan">${yakin.slice(0, 12).map(hatirlatmaKart).join('')}</div>${H.length > yakin.length ? `<p class="muted sm">Daha ileri tarihli ${H.length - yakin.length} hatırlatma daha var.</p>` : ''}</section>` : ''}
    <section class="df-bolum"><h2>${IC.defter}Defterlerim</h2>
      <div class="df-defterler">${DF.defterler.map(defterKart).join('')}
        <button class="df-kitap yeni" data-action="d-yeni-defter">${IC.arti}<b>Yeni defter</b><small>Araç, fatura, garanti, ev, sağlık ya da kendi defterin</small></button>
      </div></section>`;
  rozetGuncelle(H);
}
function hosgeldin() {
  return `<div class="df-hosgeldin">
      <div class="df-hg-ikon">${IC.defter}</div>
      <h2>Hangi kayıtları tutmak istersin?</h2>
      <p class="muted">Seçtiklerin için birer defter açılır. Sonradan istediğin kadar defter ekleyebilir, türlerini ve alanlarını değiştirebilirsin.</p>
      <div class="df-sablonlar secim">${Object.entries(SABLON).filter(([k]) => k !== 'bos').map(([k, s]) => `
        <label class="df-sablon"><input type="checkbox" value="${k}" ${['arac', 'fatura', 'garanti'].includes(k) ? 'checked' : ''}><span class="df-sablon-ic" style="--r:${s.renk}">${IC[s.ikon]}</span><b>${s.ad}</b><small>${s.aciklama}</small><i class="df-tik">${IC.tamam}</i></label>`).join('')}</div>
      <div class="df-hg-alt"><button class="btn primary" data-action="d-ilk-olustur">Defterleri oluştur</button><button class="btn" data-action="d-yeni-defter" data-bos="1">Boş defterle başla</button></div>
      <p class="muted sm">${IC.shield}Kayıtların bu cihazda kalır. İstersen Ayarlar'dan yedek alır ya da Google Drive'a yedeklersin.</p>
    </div>`;
}
function hatirlatmaKart(h) {
  const g = gunFarki(h.tarih), durum = g < 0 ? 'gecti' : g <= DF.ayar.onceGun ? 'yakin' : '';
  return `<div class="df-hk ${durum}" style="--r:${h.defter.renk}">
      <button class="df-hk-ana" data-action="d-kayit-ac" data-id="${h.kid}"><span class="df-hk-ic">${IC[h.defter.ikon] || IC.defter}</span>
        <span class="df-hk-y"><b>${esc(h.metin)}</b><small>${esc(h.defter.ad)} · ${tarihYaz(h.tarih)}</small></span>
        <em>${kalanYazi(g)}</em></button>
      <button class="df-hk-tamam" data-action="d-hat-tamam" data-id="${h.kid}" data-tur="${h.tur}" title="${h.tur === 'fatura' ? 'Ödendi' : 'Tamam'}">${IC.tamam}<span>${h.tur === 'fatura' ? 'Ödendi' : 'Tamam'}</span></button>
    </div>`;
}
function defterKart(d) {
  const kl = defterKayitlari(d.id), o = ozet(d, kl);
  const alt = o.ek[0] ? `${o.ek[0][0]}: ${o.ek[0][1]}` : '';
  return `<button class="df-kitap" data-action="d-defter" data-id="${d.id}" style="--r:${d.renk}">
      <span class="df-kitap-ic">${IC[d.ikon] || IC.defter}</span>
      <b>${esc(d.ad)}</b>
      <small>${o.sayi ? `${o.sayi} kayıt` : 'Henüz kayıt yok'}${alt ? ' · ' + esc(alt) : ''}</small>
      <span class="df-kitap-tutar">${o.buYil ? paraYaz(o.buYil).replace(/,00$/, '') : o.sayi ? o.sayi + ' kayıt' : '—'}</span>
      <i class="df-kitap-not">${o.buYil ? 'bu yıl' : ''}</i>
    </button>`;
}

/* ═════════ Defter ekranı ═════════ */
function defterCiz() {
  const d = defterAl(DF.defterId), kl = defterKayitlari(d.id), o = ozet(d, kl);
  document.body.style.setProperty('--df-r', d.renk);
  $('#app').innerHTML = kabuk(esc(d.ad), `<button class="icon-btn" data-action="d-ana" title="Defterler">${IC.geri}</button><span class="df-baslik-ic" style="--r:${d.renk}">${IC[d.ikon] || IC.defter}</span>`,
    `<button class="icon-btn" data-action="d-defter-menu" title="Defter">${IC.menu3}</button>`);
  const turlerVar = [...new Set(kl.map(k => k.tur).filter(Boolean))];
  const ay = aylik(kl), enCok = Math.max(...ay.map(a => a.tutar), 1);
  $('#dfGovde').innerHTML = `
    <section class="df-ozet">
      <div><span>Bu ay</span><b>${paraYaz(o.buAy) || '—'}</b></div>
      <div><span>Bu yıl</span><b>${paraYaz(o.buYil) || '—'}</b></div>
      <div><span>Kayıt</span><b>${o.sayi}</b></div>
      ${o.ek.map(([a, v]) => `<div><span>${esc(a)}</span><b>${esc(v)}</b></div>`).join('')}
    </section>
    ${o.toplam ? `<section class="df-grafik" aria-label="Son 12 ay">${ay.map(a => `<div class="df-cubuk" title="${esc(ayYaz(a.ay))}: ${paraYaz(a.tutar)}"><i style="height:${Math.round(a.tutar / enCok * 100)}%"></i><span>${a.ad}</span></div>`).join('')}</section>` : ''}
    <section class="df-araclar">
      <label class="df-ara">${IC.ara}<input id="dfAra" type="search" placeholder="Kayıtlarda ara" value="${esc(DF.ara)}"></label>
      ${turlerVar.length > 1 ? `<div class="df-cipler">${['', ...turlerVar].map(t => `<button class="df-cip ${DF.filtre === t ? 'on' : ''}" data-action="d-filtre" data-t="${esc(t)}">${t ? esc(t) : 'Hepsi'}</button>`).join('')}</div>` : ''}
    </section>
    <section class="df-liste" id="dfListe"></section>
    <button class="df-fab" data-action="d-kayit-yeni">${IC.arti}<span>Kayıt ekle</span></button>`;
  listeCiz();
}
function listeCiz() {
  const d = defterAl(DF.defterId), q = DF.ara.trim().toLocaleLowerCase('tr');
  let kl = defterKayitlari(d.id);
  if (DF.filtre) kl = kl.filter(k => k.tur === DF.filtre);
  if (q) kl = kl.filter(k => [k.baslik, k.tur, k.not, k.hatirlat?.not, ...Object.values(k.degerler || {})].some(v => String(v ?? '').toLocaleLowerCase('tr').includes(q)));
  kl.sort((a, b) => (b.tarih || '').localeCompare(a.tarih || '') || (b.olusma || 0) - (a.olusma || 0));
  const el = $('#dfListe'); if (!el) return;
  if (!kl.length) {
    el.innerHTML = defterKayitlari(d.id).length ? `<p class="df-bos">Aramana uyan kayıt yok.</p>`
      : `<div class="df-bos">${IC[d.ikon] || IC.defter}<b>Bu defter boş</b><span>İlk kaydını ekle: ${esc((d.turler.slice(0, 3).join(', ') || 'tarih, tutar, not').toLocaleLowerCase('tr'))}…</span><button class="btn primary" data-action="d-kayit-yeni">${IC.arti}Kayıt ekle</button></div>`;
    return;
  }
  const gruplar = new Map();
  for (const k of kl) { const a = (k.tarih || '').slice(0, 7) || 'tarihsiz'; if (!gruplar.has(a)) gruplar.set(a, []); gruplar.get(a).push(k); }
  el.innerHTML = [...gruplar].map(([a, l]) => {
    const t = l.reduce((s, k) => s + (k.tutar || 0), 0);
    return `<div class="df-ay"><h3><span>${a === 'tarihsiz' ? 'Tarihsiz' : esc(ayYaz(a))}</span>${t ? `<b>${paraYaz(t)}</b>` : ''}</h3>${l.map(k => kayitSatir(d, k)).join('')}</div>`;
  }).join('');
  el.querySelectorAll('img[data-foto]').forEach(async im => { im.src = await kucukUrl(im.dataset.foto); });
}
function kayitSatir(d, k) {
  const ek = d.alanlar.filter(a => a.tur !== 'onay' && k.degerler?.[a.k] != null && k.degerler[a.k] !== '' && (!a.turler || a.turler.includes(k.tur)))
    .slice(0, 2).map(a => a.tur === 'sayi' ? `${sayiYaz(sayiCoz(k.degerler[a.k]), 2)}${a.birim ? ' ' + a.birim : ''}` : a.tur === 'ay' ? ayYaz(k.degerler[a.k]) : a.tur === 'tarih' ? tarihYaz(k.degerler[a.k]) : k.degerler[a.k]);
  const isaret = [];
  if (sablonu(d).fatura) isaret.push(k.degerler?.odendi ? `<span class="df-etiket iyi">Ödendi</span>` : `<button class="df-etiket uyari" data-action="d-odendi" data-id="${k.id}" title="Ödendi olarak işaretle">Ödenmedi</button>`);
  if (sablonu(d).garanti) { const b = garantiBitis(k); if (b) { const g = gunFarki(b); isaret.push(`<span class="df-etiket ${g < 0 ? '' : g < 60 ? 'uyari' : 'iyi'}">${g < 0 ? 'Garanti bitti' : 'Garanti ' + tarihYaz(b)}</span>`); } }
  if (k.hatirlat?.tarih && !k.hatirlat.bitti) isaret.push(`<span class="df-etiket zil">${IC.zil}${tarihYaz(k.hatirlat.tarih)}</span>`);
  return `<div class="df-kayit" role="button" tabindex="0" data-action="d-kayit-ac" data-id="${k.id}">
      ${k.fotolar?.length ? `<img class="df-k-foto" data-foto="${k.fotolar[0]}" alt="">` : `<span class="df-k-gun"><b>${tarihNesne(k.tarih)?.getDate() || '–'}</b><small>${tarihNesne(k.tarih)?.toLocaleDateString('tr-TR', { month: 'short' }) || ''}</small></span>`}
      <span class="df-k-orta"><b>${esc(k.baslik || k.tur || 'Kayıt')}</b>
        <small>${[k.baslik && k.tur ? esc(k.tur) : '', k.fotolar?.length ? tarihYaz(k.tarih) : '', ...ek.map(esc)].filter(Boolean).join(' · ')}</small>
        ${isaret.length ? `<span class="df-isaretler">${isaret.join('')}</span>` : ''}</span>
      ${k.tutar ? `<span class="df-k-tutar">${paraYaz(k.tutar)}</span>` : ''}
    </div>`;
}

/* ═════════ Kayıt formu ═════════ */
function kayitFormu(id, kopya) {
  const d = defterAl(DF.defterId), eski = id ? DF.kayitlar.find(k => k.id === id) : null;
  if (eski && eski.defterId !== d.id) return;
  DF.form = eski ? JSON.parse(JSON.stringify(eski)) : { id: null, defterId: d.id, tur: DF.filtre || d.turler[0] || '', baslik: '', tarih: bugunStr(), tutar: null, degerler: {}, not: '', fotolar: [], hatirlat: null };
  if (!eski) for (const a of d.alanlar) if (a.varsayilan != null) DF.form.degerler[a.k] = a.varsayilan;
  if (kopya) {   // benzerini ekle: aynı bilgiler, yeni tarih (fatura ise bir sonraki ay), fotoğrafsız
    DF.form.id = null; DF.form.fotolar = []; DF.form.hatirlat = null;
    if (sablonu(d).fatura) { DF.form.tarih = ayEkle(eski.tarih || bugunStr(), 1); DF.form.degerler.odendi = false; if (DF.form.degerler.donem) DF.form.degerler.donem = ayEkle(DF.form.degerler.donem + '-01', 1).slice(0, 7); }
    else DF.form.tarih = bugunStr();
  }
  DF.form.yeni = !DF.form.id;
  formCiz();
}
function formCiz() {
  const d = defterAl(DF.defterId), F = DF.form, S0 = sablonu(d);
  const gorunen = d.alanlar.filter(a => !a.turler || a.turler.includes(F.tur));
  const alanGirdi = a => {
    const v = F.degerler[a.k] ?? '';
    if (a.tur === 'onay') return `<label class="df-anahtar"><input type="checkbox" data-alan="${a.k}" ${v ? 'checked' : ''}><span>${esc(a.ad)}</span></label>`;
    const tip = a.tur === 'tarih' ? 'date' : a.tur === 'ay' ? 'month' : 'text', mod = a.tur === 'sayi' || a.tur === 'para' ? 'inputmode="decimal"' : '';
    return `<label class="df-alan"><span>${esc(a.ad)}${a.birim ? ` <i>(${esc(a.birim)})</i>` : ''}</span><input type="${tip}" ${mod} data-alan="${a.k}" value="${esc(v)}" ${a.tur === 'para' ? 'placeholder="0,00"' : ''}></label>`;
  };
  const oneri = S0.hatirlatOneri?.[F.tur], hat = F.hatirlat;
  const bitis = S0.garanti ? garantiBitis(F) : null;
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet df-form" style="--r:${d.renk}">
    <header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>${F.yeni ? 'Yeni kayıt' : 'Kaydı düzenle'}</h3>
      <div class="spacer"></div>${F.yeni ? '' : `<button class="icon-btn" data-action="d-kayit-kopya" title="Benzerini ekle">${IC.kopya}</button><button class="icon-btn" data-action="d-kayit-sil" title="Sil">${IC.sil}</button>`}</header>
    <div class="df-form-govde">
      ${d.turler.length ? `<div class="df-turler">${d.turler.map(t => `<button type="button" class="df-cip ${F.tur === t ? 'on' : ''}" data-action="d-form-tur" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div>` : ''}
      <label class="df-alan genis"><span>${esc(d.baslikAdi || 'Başlık')}${d.baslikZorunlu ? '' : ' <i>(isteğe bağlı)</i>'}</span><input data-f="baslik" value="${esc(F.baslik)}" maxlength="120" ${F.yeni && d.baslikZorunlu ? 'autofocus' : ''}></label>
      <div class="df-iki">
        <label class="df-alan"><span>${esc(d.tarihAdi || 'Tarih')}</span><input type="date" data-f="tarih" value="${esc(F.tarih || '')}"></label>
        <label class="df-alan"><span>${S0.garanti ? 'Fiyat' : 'Tutar'} <i>(TL)</i></span><input data-f="tutar" inputmode="decimal" placeholder="0,00" value="${F.tutar != null ? esc(String(F.tutar).replace('.', ',')) : ''}"></label>
      </div>
      ${gorunen.length ? `<div class="df-iki">${gorunen.map(alanGirdi).join('')}</div>` : ''}
      ${bitis ? `<p class="df-bilgi">${IC.garanti}Garanti bitişi: <b>${tarihYaz(bitis, true)}</b> (${kalanYazi(gunFarki(bitis))}). Bitmeden 30 gün önce hatırlatılır.</p>` : ''}
      <label class="df-alan genis"><span>Not</span><textarea data-f="not" rows="2" maxlength="2000">${esc(F.not || '')}</textarea></label>
      <div class="df-fotolar" id="dfFotolar">${F.fotolar.map(f => `<span class="df-foto"><img data-foto="${f}" alt="" data-action="d-foto-gor" data-id="${f}"><button type="button" data-action="d-foto-sil" data-id="${f}" title="Kaldır">${IC.close}</button></span>`).join('')}
        <label class="df-foto-ekle">${IC.foto}<span>Fotoğraf</span><input type="file" accept="image/*" multiple id="dfFotoGirdi" hidden></label></div>
      <div class="df-hat ${hat ? 'acik' : ''}">
        <label class="df-anahtar"><input type="checkbox" id="dfHatAc" ${hat ? 'checked' : ''}><span>${IC.zil}Hatırlat</span></label>
        ${hat ? `<div class="df-iki"><label class="df-alan"><span>Ne zaman</span><input type="date" data-h="tarih" value="${esc(hat.tarih || '')}"></label><label class="df-alan"><span>Ne için</span><input data-h="not" value="${esc(hat.not || '')}" placeholder="Ör. Sonraki bakım" maxlength="80"></label></div>
          <div class="df-cipler">${[[1, '1 ay sonra'], [3, '3 ay'], [6, '6 ay'], [12, '1 yıl'], [24, '2 yıl']].map(([a, n]) => `<button type="button" class="df-cip" data-action="d-hat-sure" data-a="${a}">${n}</button>`).join('')}</div>
          ${hat.bitti ? '<p class="muted sm">Bu hatırlatma tamamlandı olarak işaretlenmiş; tarihi değiştirirsen yeniden açılır.</p>' : ''}`
          : oneri ? `<button type="button" class="df-oneri" data-action="d-hat-oneri">${IC.zil}${esc(oneri[1])}: ${oneri[0] >= 12 ? oneri[0] / 12 + ' yıl' : oneri[0] + ' ay'} sonra hatırlat</button>` : ''}
      </div>
    </div>
    <div class="sticky-actions"><button class="btn" data-action="close-modal">Vazgeç</button><button class="btn primary" data-action="d-kayit-kaydet">Kaydet</button></div>
  </div></div>`;
  document.querySelectorAll('#modal img[data-foto]').forEach(async im => { im.src = await kucukUrl(im.dataset.foto); });
  if (F.yeni && d.baslikZorunlu) setTimeout(() => $('#modal [data-f="baslik"]')?.focus(), 50);
}
function formOku() {
  const F = DF.form; if (!F || !$('#modal .df-form')) return;
  document.querySelectorAll('#modal [data-f]').forEach(i => { F[i.dataset.f] = i.value; });
  F.tutar = typeof F.tutar === 'string' ? sayiCoz(F.tutar) : F.tutar;
  document.querySelectorAll('#modal [data-alan]').forEach(i => { F.degerler[i.dataset.alan] = i.type === 'checkbox' ? i.checked : i.value.trim(); });
  if (F.hatirlat) document.querySelectorAll('#modal [data-h]').forEach(i => { F.hatirlat[i.dataset.h] = i.value; });
}
async function kayitKaydet() {
  formOku();
  const d = defterAl(DF.defterId), F = DF.form;
  F.baslik = String(F.baslik || '').trim();
  if (d.baslikZorunlu && !F.baslik) { toast(`${d.baslikAdi || 'Başlık'} boş olamaz`); $('#modal [data-f="baslik"]')?.focus(); return; }
  if (!F.tarih) { toast('Tarihi seç'); return; }
  if (F.hatirlat && !F.hatirlat.tarih) F.hatirlat = null;
  const eski = F.id ? DF.kayitlar.find(k => k.id === F.id) : null;
  if (F.hatirlat && eski?.hatirlat?.bitti && eski.hatirlat.tarih !== F.hatirlat.tarih) F.hatirlat.bitti = false;
  const kayit = { id: F.id || yeniId(), defterId: d.id, tur: F.tur || '', baslik: F.baslik, tarih: F.tarih, tutar: F.tutar, degerler: F.degerler, not: String(F.not || '').trim(), fotolar: F.fotolar, hatirlat: F.hatirlat,
    faturaGizle: eski?.faturaGizle, garantiGizle: eski?.garantiGizle, olusma: eski?.olusma || Date.now(), guncel: Date.now() };
  // Silinen fotoğrafları depodan da kaldır
  if (eski) for (const f of eski.fotolar || []) if (!kayit.fotolar.includes(f)) { await DDB.sil('fotolar', f).catch(() => {}); }
  try { await DDB.koy('kayitlar', kayit); } catch (e) { toast('Kaydedilemedi: ' + e.message); return; }
  const i = DF.kayitlar.findIndex(k => k.id === kayit.id); if (i >= 0) DF.kayitlar[i] = kayit; else DF.kayitlar.push(kayit);
  DF.form = null; closeModal(); ciz(); degisti();
  toast(eski ? 'Kayıt güncellendi' : 'Kayıt eklendi');
}
async function fotoEkle(dosyalar) {
  const F = DF.form; if (!F) return;
  formOku();
  for (const f of dosyalar) {
    try { const x = await fotoHazirla(f); await DDB.koy('fotolar', x); F.fotolar.push(x.id); (F.yeniFotolar ||= []).push(x.id); }
    catch (e) { toast('Fotoğraf eklenemedi: ' + e.message); }
  }
  formCiz();
}
async function fotoGoster(id) {
  const f = await DDB.al('fotolar', id); if (!f) return;
  const u = URL.createObjectURL(f.blob), kap = document.createElement('div');
  kap.className = 'df-buyuk'; kap.innerHTML = `<img src="${u}" alt=""><button class="icon-btn" title="Kapat">${IC.close}</button><a class="btn sm" href="${u}" download="fotograf.jpg">${IC.indir}İndir</a>`;
  const kapat = () => { kap.remove(); URL.revokeObjectURL(u); };
  kap.onclick = e => { if (!e.target.closest('a')) kapat(); };
  document.body.appendChild(kap);
}
async function formuKapatTemizle() {
  // Kaydedilmeden kapatılan formdaki yeni fotoğraflar depoda kalmasın
  const F = DF.form; DF.form = null;
  for (const f of F?.yeniFotolar || []) await DDB.sil('fotolar', f).catch(() => {});
}

/* ═════════ Defter oluştur / düzenle ═════════ */
function yeniDefterSec(bos) {
  if (bos) return defterDuzenle(null, 'bos');
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Yeni defter</h3></header>
    <div class="set-body"><div class="df-sablonlar">${Object.entries(SABLON).map(([k, s]) => `
      <button class="df-sablon" data-action="d-sablon" data-k="${k}"><span class="df-sablon-ic" style="--r:${s.renk}">${IC[s.ikon]}</span><b>${s.ad}</b><small>${s.aciklama}</small></button>`).join('')}</div></div></div></div>`;
}
let duzenTaslak = null;
function defterDuzenle(id, sablon) {
  const d = id ? defterAl(id) : defterYap(sablon);
  duzenTaslak = JSON.parse(JSON.stringify(d)); duzenTaslak.yeni = !id;
  duzenCiz();
}
function duzenCiz() {
  const T = duzenTaslak, TUR = [['metin', 'Yazı'], ['sayi', 'Sayı'], ['para', 'Tutar (TL)'], ['tarih', 'Tarih'], ['ay', 'Ay'], ['onay', 'Evet/Hayır']];
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet df-duzen"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>${T.yeni ? 'Yeni defter' : 'Defteri düzenle'}</h3></header>
    <div class="set-body">
      <section><h4>Adı</h4><input class="df-girdi" id="dfDAd" value="${esc(T.ad)}" maxlength="40" placeholder="Ör. Arabam, Annemin evi"></section>
      <section><h4>Renk</h4><div class="df-renkler">${RENKLER.map(r => `<button class="df-renk ${T.renk === r ? 'on' : ''}" style="--r:${r}" data-action="d-renk" data-r="${r}" aria-label="Renk"></button>`).join('')}</div></section>
      <section><h4>Kayıt türleri</h4><p class="muted sm">Kayıt eklerken bunlardan birini seçersin. Boş bırakırsan tür sorulmaz.</p>
        <div class="df-cipler">${T.turler.map((t, i) => `<span class="df-cip on duzen">${esc(t)}<button data-action="d-tur-sil" data-i="${i}" title="Kaldır">${IC.close}</button></span>`).join('')}</div>
        <div class="df-ekle-satir"><input class="df-girdi" id="dfYeniTur" placeholder="Yeni tür (ör. Yıkama)" maxlength="30"><button class="btn sm" data-action="d-tur-ekle">${IC.arti}Ekle</button></div></section>
      <section><h4>Ek alanlar</h4><p class="muted sm">Her kayıtta tarih, tutar, not, fotoğraf ve hatırlatma zaten var. Buraya kendi alanlarını ekle.</p>
        <div class="df-alanlar">${T.alanlar.map((a, i) => `<div class="df-alan-satir"><input class="df-girdi" data-ai="${i}" data-ak="ad" value="${esc(a.ad)}" maxlength="30"><select class="df-girdi" data-ai="${i}" data-ak="tur">${TUR.map(([k, n]) => `<option value="${k}" ${a.tur === k ? 'selected' : ''}>${n}</option>`).join('')}</select>${a.tur === 'sayi' ? `<input class="df-girdi kisa" data-ai="${i}" data-ak="birim" value="${esc(a.birim || '')}" placeholder="birim" maxlength="8">` : ''}<button class="icon-btn sm" data-action="d-alan-sil" data-i="${i}" title="Kaldır">${IC.close}</button></div>`).join('') || '<p class="muted sm">Ek alan yok.</p>'}</div>
        <button class="btn sm" data-action="d-alan-ekle">${IC.arti}Alan ekle</button></section>
      ${T.yeni ? '' : `<section><h4>Defter</h4><div class="df-dugmeler"><button class="btn" data-action="d-csv">${IC.indir}Excel'e aktar (.csv)</button><button class="btn danger-ghost" data-action="d-defter-sil">${IC.sil}Defteri sil</button></div></section>`}
    </div>
    <div class="sticky-actions"><button class="btn" data-action="close-modal">Vazgeç</button><button class="btn primary" data-action="d-defter-kaydet">${T.yeni ? 'Oluştur' : 'Kaydet'}</button></div></div></div>`;
}
function duzenOku() {
  const T = duzenTaslak; if (!T) return;
  const ad = $('#dfDAd'); if (ad) T.ad = ad.value;
  document.querySelectorAll('[data-ai]').forEach(i => { const a = T.alanlar[+i.dataset.ai]; if (a) a[i.dataset.ak] = i.value; });
}
async function defterKaydet() {
  duzenOku(); const T = duzenTaslak;
  T.ad = String(T.ad || '').trim(); if (!T.ad) return toast('Deftere bir ad ver');
  T.alanlar = T.alanlar.filter(a => String(a.ad || '').trim()).map(a => ({ ...a, ad: a.ad.trim(), k: a.k || 'a' + yeniId().slice(0, 6) }));
  const yeni = T.yeni; delete T.yeni;
  await DDB.koy('defterler', T);
  const i = DF.defterler.findIndex(d => d.id === T.id); if (i >= 0) DF.defterler[i] = T; else DF.defterler.push(T);
  duzenTaslak = null; closeModal();
  if (yeni) { DF.defterId = T.id; DF.ekran = 'defter'; history.pushState({ d: T.id }, '', location.pathname + location.search + '#d'); }
  ciz(); degisti(); toast(yeni ? 'Defter oluşturuldu' : 'Kaydedildi');
}

/* ═════════ Hatırlatma bildirimleri (programda: telefon kilitliyken de gelir) ═════════ */
function bildirimleriKur() {
  const H = hatirlatmalar(DF.defterler, DF.kayitlar);
  rozetGuncelle(H);
  const Y = window.SUHA_YEREL; if (!Y?.bildirimPlanla) return;
  const simdi = Date.now(), liste = [];
  for (const h of H) {
    const gun = tarihNesne(h.tarih); gun.setHours(9, 0, 0, 0);
    const once = h.tur === 'garanti' ? 30 : DF.ayar.onceGun;
    const z1 = new Date(gun); z1.setDate(z1.getDate() - once);
    if (once > 0 && z1 > simdi) liste.push({ zaman: z1.getTime(), baslik: h.metin, metin: `${h.defter.ad} · ${tarihYaz(h.tarih)} (${once} gün sonra)`, tur: 'defter' });
    if (gun > simdi) liste.push({ zaman: gun.getTime(), baslik: h.metin, metin: `${h.defter.ad} · bugün`, tur: 'defter' });
  }
  liste.sort((a, b) => a.zaman - b.zaman);
  if (liste.length) Y.bildirimIzni?.();
  Y.bildirimPlanla(liste.slice(0, 50));
}
// Uygulama simgesinde bekleyen hatırlatma sayısı (destekleyen cihazlarda)
function rozetGuncelle(H) {
  try { const n = H.filter(h => gunFarki(h.tarih) <= DF.ayar.onceGun).length; if (navigator.setAppBadge) n ? navigator.setAppBadge(n) : navigator.clearAppBadge(); } catch {}
}
async function hatirlatmaTamam(id, tur) {
  const k = DF.kayitlar.find(x => x.id === id); if (!k) return;
  const yedek = JSON.parse(JSON.stringify(k));
  if (tur === 'fatura') k.degerler = { ...k.degerler, odendi: true };
  else if (tur === 'garanti') k.garantiGizle = true;
  else if (k.hatirlat) k.hatirlat.bitti = true;
  await DDB.koy('kayitlar', k); ciz(); degisti();
  toast(tur === 'fatura' ? 'Ödendi olarak işaretlendi' : 'Tamamlandı', [['Geri al', async () => { Object.assign(k, yedek); await DDB.koy('kayitlar', k); ciz(); degisti(); }]], 5000);
}

/* ═════════ Yedekleme ═════════ */
async function yedekIndir() {
  try {
    const v = await yedekYap(), b = new Blob([JSON.stringify(v)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `Kayıt Defteri yedeği ${bugunStr()}.json`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 8000);
    store.set('defterSonDosya', Date.now()); toast('Yedek dosyası hazırlandı');
  } catch (e) { toast('Yedek alınamadı: ' + e.message); }
}
async function yedektenYukle(dosya) {
  let v; try { v = JSON.parse(await dosya.text()); } catch { return toast('Dosya okunamadı'); }
  if (v?.suha !== 'kayit-defteri') return toast('Bu bir Kayıt Defteri yedeği değil');
  const mevcut = DF.kayitlar.length;
  if (mevcut && !confirm(`Yedekte ${v.defterler.length} defter ve ${v.kayitlar.length} kayıt var (${new Date(v.tarih).toLocaleString('tr-TR')}).\n\nŞu anki ${mevcut} kayıt silinip yerine yedektekiler gelsin mi?`)) return;
  try { const r = await yedekYukle(v); DF.fotoUrl.forEach(u => URL.revokeObjectURL(u)); DF.fotoUrl.clear(); await yukle(); DF.ekran = 'ana'; closeModal(); ciz(); degisti(); toast(`Geri yüklendi: ${r.defter} defter, ${r.kayit} kayıt`); }
  catch (e) { toast('Geri yüklenemedi: ' + e.message); }
}
function driveIzin(islem, mesaj) {
  if (dAnahtar()) return true;
  if (!CLIENT_ID) { toast('Google girişi bu kurulumda ayarlı değil'); return false; }
  if (!confirm(mesaj)) return false;
  try { sessionStorage.setItem('defterNiyet', JSON.stringify({ islem })); } catch {}
  Auth.login(false);
  return false;
}
async function driveYedekAl(elle) {
  if (!dAnahtar()) {
    if (elle) driveIzin('yedekle', 'Drive\'a yedeklemek için Google girişi ve Drive izni gerekiyor. Program sadece kendi oluşturduğu "Suha Kayıt Defteri" klasörünü görebilir. Google\'a yönlendirileceksin.');
    return;
  }
  try {
    if (elle) toast('Drive\'a yedekleniyor…');
    await driveYedekle();
    DF.ayar.sonDrive = Date.now(); DF.ayar.yedekBekliyor = false; ayarKaydet();
    if (elle) toast('Drive\'a yedeklendi');
    if (DF.ekran === 'ana') anaCiz();
  } catch (e) {
    if (e.message === 'GIRIS') { DF.ayar.yedekBekliyor = true; ayarKaydet(); if (elle) driveIzin('yedekle', 'Google oturumunun süresi dolmuş. Tekrar giriş yapıp yedekleyelim mi?'); }
    else if (elle) toast('Drive\'a yedeklenemedi: ' + e.message);
  }
}
async function driveGeriAl(onayli) {
  if (!dAnahtar()) return driveIzin('geri', 'Drive\'daki yedeği almak için Google girişi gerekiyor. Google\'a yönlendirileceksin.');
  try {
    const f = await driveYedekBul(); if (!f) return toast('Drive\'da yedek bulunamadı');
    if (!confirm(`Drive'daki yedek: ${new Date(f.modifiedTime).toLocaleString('tr-TR')}.\n\nBu cihazdaki kayıtların yerine yedektekiler gelsin mi?`)) return;
    const r = await driveGeriYukle(); DF.fotoUrl.forEach(u => URL.revokeObjectURL(u)); DF.fotoUrl.clear(); await yukle(); DF.ekran = 'ana'; closeModal(); ciz(); bildirimleriKur();
    toast(`Drive'dan geri yüklendi: ${r.defter} defter, ${r.kayit} kayıt`);
  } catch (e) { if (e.message === 'GIRIS') driveIzin('geri', 'Google oturumunun süresi dolmuş. Tekrar giriş yapalım mı?'); else toast('Geri yüklenemedi: ' + e.message); }
}

/* ═════════ Ayarlar ═════════ */
function ayarAc() {
  const t = store.get('theme', 'light'), A = DF.ayar, son = store.get('defterSonDosya');
  const driveBolum = programda()
    ? `<div class="set-row"><div><b>Google Drive yedeği</b><span>Programda Google girişi yok. Yedek dosyası al; istersen o dosyayı kendin Drive'a ya da başka bir yere koy.</span></div></div>`
    : `<div class="set-row"><div><b>Google Drive'a otomatik yedekle</b><span>${A.drive ? (A.sonDrive ? 'Son yedek: ' + new Date(A.sonDrive).toLocaleString('tr-TR') : 'Henüz yedek alınmadı') + '. Değişiklikten sonra yedeklenir (Google oturumu açıkken).' : 'Kayıtların Drive\'ında "Suha Kayıt Defteri" klasörüne yedeklenir; telefon değişse de kaybolmaz. Program sadece bu klasörü görebilir.'}</span></div>
        <label class="df-anahtar"><input type="checkbox" id="dfDriveAc" ${A.drive ? 'checked' : ''}><span></span></label></div>
       ${A.drive ? `<div class="df-dugmeler"><button class="btn sm" data-action="d-drive-yedekle">${IC.bulut}Şimdi yedekle</button><button class="btn sm" data-action="d-drive-geri">${IC.indir}Drive'dan geri yükle</button></div>` : ''}`;
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet settings"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Ayarlar</h3></header>
    <div class="set-body">
      <section><h4>Görünüm</h4><div class="seg yon-seg">${[['light', 'Cam'], ['dark', 'Koyu'], ['auto', 'Otomatik'], ['flat', 'Düz']].map(([k, n]) => `<button class="${t === k ? 'on' : ''}" data-action="d-tema" data-t="${k}">${n}</button>`).join('')}</div></section>
      <section><h4>Hatırlatmalar</h4><div class="set-row"><div><b>Kaç gün önce haber verilsin</b><span>Günü gelince de ayrıca hatırlatılır. Garantiler 30 gün önceden. ${programda() ? 'Telefon kilitliyken de bildirim gelir.' : 'Tarayıcıda hatırlatmalar uygulamayı açınca görünür; kapalıyken bildirim için programı (APK / Windows) kullan.'}</span></div>
        <div class="seg">${[[0, 'Gününde'], [1, '1 gün'], [3, '3 gün'], [7, '1 hafta']].map(([k, n]) => `<button class="${A.onceGun === k ? 'on' : ''}" data-action="d-once" data-k="${k}">${n}</button>`).join('')}</div></div></section>
      <section><h4>Yedekleme</h4>
        <div class="set-row"><div><b>Yedek dosyası</b><span>Bütün defterler, kayıtlar ve fotoğraflar tek dosyada. ${son ? 'Son dosya: ' + new Date(son).toLocaleDateString('tr-TR') + '.' : 'Telefon değiştirirken ya da arada bir al.'}</span></div>
          <div class="df-dugmeler"><button class="btn sm" data-action="d-yedek-indir">${IC.indir}İndir</button><label class="btn sm">${IC.yukle}Geri yükle<input type="file" accept="application/json,.json" id="dfYedekGirdi" hidden></label></div></div>
        ${driveBolum}</section>
      <section><h4>Verilerin</h4><div class="set-row"><div><b>Bu cihazda</b><span>Kayıtların ve fotoğrafların bu cihazda saklanır; Drive yedeğini açmadıkça hiçbir yere gönderilmez.</span></div><button class="btn danger-ghost" data-action="d-hepsini-sil">Hepsini sil</button></div></section>
      <section><h4>Uygulama</h4>${typeof aboutRow === 'function' ? aboutRow() : ''}</section>
    </div></div></div>`;
}

/* ═════════ Deneme verisi (?demo) ═════════ */
async function ornekVeri() {
  const a = defterYap('arac', 'Arabam · 34 ABC 123'), f = defterYap('fatura', 'Ev faturaları'), g = defterYap('garanti', 'Garantiler');
  a.sira = 1; f.sira = 2; g.sira = 3;
  const b = bugunStr(), k = (d, x) => ({ id: yeniId(), defterId: d.id, degerler: {}, fotolar: [], not: '', hatirlat: null, olusma: Date.now(), ...x });
  const liste = [
    k(a, { tur: 'Yakıt', tarih: ayEkle(b, -2), tutar: 1850, degerler: { km: '84200', litre: '42', yer: 'Opet' } }),
    k(a, { tur: 'Yakıt', tarih: ayEkle(b, -1), tutar: 1920, degerler: { km: '84850', litre: '43,5', yer: 'Shell' } }),
    k(a, { tur: 'Yakıt', tarih: b, tutar: 1780, degerler: { km: '85420', litre: '40', yer: 'Opet' } }),
    k(a, { tur: 'Bakım', baslik: 'Periyodik bakım, yağ + filtre', tarih: ayEkle(b, -11), tutar: 6400, degerler: { km: '76000', yer: 'Yetkili servis' }, hatirlat: { tarih: ayEkle(ayEkle(b, -11), 12), not: 'Sonraki bakım' } }),
    k(a, { tur: 'Kasko', tarih: ayEkle(b, -12), tutar: 18500, hatirlat: { tarih: tarihStr(new Date(Date.now() + 5 * 864e5)), not: 'Kasko yenileme' } }),
    k(f, { tur: 'Elektrik', tarih: tarihStr(new Date(Date.now() + 2 * 864e5)), tutar: 742.35, degerler: { donem: b.slice(0, 7), odendi: false } }),
    k(f, { tur: 'Doğalgaz', tarih: ayEkle(b, -1), tutar: 1210, degerler: { donem: ayEkle(b, -1).slice(0, 7), odendi: true } }),
    k(f, { tur: 'İnternet', tarih: ayEkle(b, -1), tutar: 399.9, degerler: { donem: ayEkle(b, -1).slice(0, 7), odendi: true } }),
    k(g, { tur: 'Beyaz eşya', baslik: 'Bulaşık makinesi', tarih: ayEkle(b, -23), tutar: 21999, degerler: { marka: 'Örnek Marka DW-600', yer: 'Mağaza', sure: '24' } }),
    k(g, { tur: 'Elektronik', baslik: 'Dizüstü bilgisayar', tarih: ayEkle(b, -5), tutar: 38500, degerler: { marka: 'Örnek 14"', sure: '24', seri: 'SN12345' } })
  ];
  await DDB.topluKoy('defterler', [a, f, g]); await DDB.topluKoy('kayitlar', liste);
}

/* ═════════ Olaylar ═════════ */
Object.assign(ACTIONS, {
  'd-ayar': () => ayarAc(), settings: () => ayarAc(),
  'd-tema': el => { store.set('theme', el.dataset.t); applyTheme(el.dataset.t); ayarAc(); },
  'd-once': el => { DF.ayar.onceGun = +el.dataset.k; ayarKaydet(); ayarAc(); bildirimleriKur(); if (DF.ekran === 'ana') anaCiz(); },
  'd-ana': () => { if (history.state?.d) history.back(); else { DF.ekran = 'ana'; DF.defterId = null; ciz(); } },
  'd-defter': el => { DF.defterId = el.dataset.id; DF.ekran = 'defter'; DF.filtre = ''; DF.ara = ''; history.pushState({ d: el.dataset.id }, '', location.pathname + location.search + '#d'); ciz(); window.scrollTo(0, 0); },
  'd-filtre': el => { DF.filtre = el.dataset.t; defterCiz(); },
  'd-kayit-yeni': () => kayitFormu(null),
  'd-kayit-ac': el => {
    const k = DF.kayitlar.find(x => x.id === el.dataset.id); if (!k) return;
    if (DF.defterId !== k.defterId) { DF.defterId = k.defterId; DF.ekran = 'defter'; DF.filtre = ''; DF.ara = ''; history.pushState({ d: k.defterId }, '', location.pathname + location.search + '#d'); ciz(); }
    kayitFormu(k.id);
  },
  'd-kayit-kaydet': () => kayitKaydet(),
  'd-kayit-kopya': () => { const id = DF.form?.id; if (id) kayitFormu(id, true); },
  'd-kayit-sil': async () => {
    const F = DF.form; if (!F?.id || !confirm('Bu kayıt silinsin mi?')) return;
    const k = DF.kayitlar.find(x => x.id === F.id);
    await DDB.sil('kayitlar', F.id); for (const f of k?.fotolar || []) await DDB.sil('fotolar', f).catch(() => {});
    DF.kayitlar = DF.kayitlar.filter(x => x.id !== F.id); DF.form = null; closeModal(); ciz(); degisti(); toast('Kayıt silindi');
  },
  'd-form-tur': el => { formOku(); DF.form.tur = el.dataset.t; formCiz(); },
  'd-hat-oneri': () => { formOku(); const d = defterAl(DF.defterId), o = sablonu(d).hatirlatOneri?.[DF.form.tur]; if (o) { DF.form.hatirlat = { tarih: ayEkle(DF.form.tarih || bugunStr(), o[0]), not: o[1] }; formCiz(); } },
  'd-hat-sure': el => { formOku(); DF.form.hatirlat.tarih = ayEkle(DF.form.tarih || bugunStr(), +el.dataset.a); DF.form.hatirlat.bitti = false; formCiz(); },
  'd-foto-sil': el => { formOku(); DF.form.fotolar = DF.form.fotolar.filter(f => f !== el.dataset.id); formCiz(); },
  'd-foto-gor': el => fotoGoster(el.dataset.id),
  'd-odendi': async el => { await hatirlatmaTamam(el.dataset.id, 'fatura'); },
  'd-hat-tamam': el => hatirlatmaTamam(el.dataset.id, el.dataset.tur),
  'd-yeni-defter': el => yeniDefterSec(el.dataset.bos === '1'),
  'd-sablon': el => defterDuzenle(null, el.dataset.k),
  'd-ilk-olustur': async () => {
    const sec = [...document.querySelectorAll('.df-sablonlar.secim input:checked')].map(i => i.value);
    if (!sec.length) return toast('En az bir defter seç ya da boş defterle başla');
    const yeniler = sec.map((k, i) => Object.assign(defterYap(k), { sira: Date.now() + i }));
    await DDB.topluKoy('defterler', yeniler); DF.defterler.push(...yeniler); ciz(); toast(`${yeniler.length} defter oluşturuldu`);
  },
  'd-defter-menu': () => defterDuzenle(DF.defterId),
  'd-renk': el => { duzenOku(); duzenTaslak.renk = el.dataset.r; duzenCiz(); },
  'd-tur-ekle': () => { duzenOku(); const i = $('#dfYeniTur'), t = i.value.trim(); if (!t) return i.focus(); if (!duzenTaslak.turler.includes(t)) duzenTaslak.turler.push(t); duzenCiz(); $('#dfYeniTur')?.focus(); },
  'd-tur-sil': el => { duzenOku(); duzenTaslak.turler.splice(+el.dataset.i, 1); duzenCiz(); },
  'd-alan-ekle': () => { duzenOku(); duzenTaslak.alanlar.push({ k: 'a' + yeniId().slice(0, 6), ad: '', tur: 'metin' }); duzenCiz(); const l = document.querySelectorAll('[data-ak="ad"]'); l[l.length - 1]?.focus(); },
  'd-alan-sil': el => { duzenOku(); duzenTaslak.alanlar.splice(+el.dataset.i, 1); duzenCiz(); },
  'd-defter-kaydet': () => defterKaydet(),
  'd-defter-sil': async () => {
    const d = defterAl(duzenTaslak.id), kl = defterKayitlari(d.id);
    if (!confirm(`"${d.ad}" defteri ve içindeki ${kl.length} kayıt silinsin mi? Bu geri alınamaz.`)) return;
    for (const k of kl) { await DDB.sil('kayitlar', k.id); for (const f of k.fotolar || []) await DDB.sil('fotolar', f).catch(() => {}); }
    await DDB.sil('defterler', d.id);
    DF.kayitlar = DF.kayitlar.filter(k => k.defterId !== d.id); DF.defterler = DF.defterler.filter(x => x.id !== d.id);
    duzenTaslak = null; closeModal(); DF.ekran = 'ana'; DF.defterId = null; ciz(); degisti(); toast('Defter silindi');
  },
  'd-csv': () => {
    const d = defterAl(duzenTaslak?.id || DF.defterId), b = new Blob([csvYap(d, defterKayitlari(d.id))], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `${d.ad.replace(/[\\/:*?"<>|]/g, '-')} ${bugunStr()}.csv`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 8000);
    toast('Excel\'de açabileceğin dosya hazırlandı');
  },
  'd-yedek-indir': () => yedekIndir(),
  'd-drive-yedekle': () => driveYedekAl(true),
  'd-drive-geri': () => driveGeriAl(),
  'd-hepsini-sil': async () => {
    if (!confirm('Bütün defterler, kayıtlar ve fotoğraflar bu cihazdan silinsin mi? Yedeğin yoksa geri getirilemez.')) return;
    if (!confirm('Emin misin? Bu işlem geri alınamaz.')) return;
    await DDB.temizle('defterler'); await DDB.temizle('kayitlar'); await DDB.temizle('fotolar');
    DF.defterler = []; DF.kayitlar = []; closeModal(); DF.ekran = 'ana'; ciz(); bildirimleriKur(); toast('Hepsi silindi');
  }
});
// Form kapatılırken kaydedilmemiş yeni fotoğrafları temizle
const _closeModal = closeModal;
closeModal = function () { if (DF.form && $('#modal .df-form')) formuKapatTemizle(); duzenTaslak = null; _closeModal(); };
document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'dfFotoGirdi') { const l = [...t.files]; t.value = ''; fotoEkle(l); }
  if (t.id === 'dfYedekGirdi') { const f = t.files[0]; t.value = ''; if (f) yedektenYukle(f); }
  if (t.id === 'dfHatAc') { formOku(); const d = defterAl(DF.defterId), o = sablonu(d).hatirlatOneri?.[DF.form.tur]; DF.form.hatirlat = t.checked ? { tarih: ayEkle(DF.form.tarih || bugunStr(), o ? o[0] : 1), not: o ? o[1] : '' } : null; formCiz(); }
  if (t.id === 'dfDriveAc') {
    if (t.checked) { if (dAnahtar()) { DF.ayar.drive = true; ayarKaydet(); driveYedekAl(true); ayarAc(); } else { t.checked = false; driveIzin('ac', 'Drive yedeği için Google girişi ve Drive izni gerekiyor. Program sadece kendi oluşturduğu "Suha Kayıt Defteri" klasörünü görebilir. Google\'a yönlendirileceksin.'); } }
    else { DF.ayar.drive = false; DF.ayar.yedekBekliyor = false; ayarKaydet(); ayarAc(); }
  }
  if (t.dataset?.f === 'tarih' || t.dataset?.alan === 'sure') { const d = defterAl(DF.defterId); if (DF.form && sablonu(d).garanti) { formOku(); formCiz(); } }
});
document.addEventListener('input', e => { if (e.target.id === 'dfAra') { DF.ara = e.target.value; listeCiz(); } });
document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList?.contains('df-kayit')) { e.preventDefault(); e.target.click(); return; } if (e.key === 'Enter' && e.target.id === 'dfYeniTur') { e.preventDefault(); ACTIONS['d-tur-ekle'](); } });
window.addEventListener('popstate', () => { if (DF.ekran === 'defter') { DF.ekran = 'ana'; DF.defterId = null; closeModal(); ciz(); } });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && DF.yuklendi && DF.ekran === 'ana' && !$('#modal').innerHTML) anaCiz(); });
