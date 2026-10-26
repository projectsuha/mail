/* ───────────── Takvim ─────────────
   Ay, hafta, gün ve ajanda görünümü; tekrarlayan etkinlik, hatırlatma, resmî tatiller, .ics aç/kaydet.
   Giriş gerekmez; her şey bu cihazda kalır. Hesaplar takvim-is.js'te. */
'use strict';

window.APP_NAME = 'Takvim';
window.APP_ICON = 'takvim-apple.png?v=3';
window.APP_LEAD = 'Ay, hafta ve gün görünümü, tekrarlayan etkinlik, hatırlatma ve resmî tatiller. Ücretsiz, reklamsız.';

const { pad, dn, ds, hafGun, dk, saatYaz, bugun, gunEkle, ayEkle, haftaNo, AY, GUN, GUN3, RENK } = TK;
const TSVG = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
Object.assign(IC, {
  konum: TSVG('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>'),
  tekrar: TSVG('<path d="M4 11V9a3 3 0 0 1 3-3h11l-2.5-2.5M20 13v2a3 3 0 0 1-3 3H6l2.5 2.5"/>'),
  notIc: TSVG('<path d="M5 6h14M5 11h14M5 16h9"/>'),
  indir: TSVG('<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M5 19h14"/>'),
  yukle: TSVG('<path d="M12 16V4M7.5 8.5 12 4l4.5 4.5"/><path d="M5 15v4h14v-4"/>'),
  gAy: TSVG('<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M9 10v10.5M15 10v10.5M3.5 15.2h17"/>'),
  gHafta: TSVG('<rect x="3.5" y="4.5" width="17" height="16" rx="2.5"/><path d="M9.2 4.5v16M14.8 4.5v16"/>'),
  gGun: TSVG('<rect x="3.5" y="4.5" width="17" height="16" rx="2.5"/><path d="M3.5 9.5h17M7.5 13h9M7.5 16.5h6"/>'),
  gAjanda: TSVG('<path d="M8.5 6.5H20M8.5 12H20M8.5 17.5H20"/><circle cx="4.5" cy="6.5" r="1.1" fill="currentColor"/><circle cx="4.5" cy="12" r="1.1" fill="currentColor"/><circle cx="4.5" cy="17.5" r="1.1" fill="currentColor"/>'),
  gYil: TSVG('<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/>'),
  gGorev: TSVG('<circle cx="12" cy="12" r="8.5"/><path d="m8 12.3 2.7 2.7L16.2 9.5"/>'),
  ara2: TSVG('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.4-4.4"/>')
});

const dar = () => window.matchMedia('(max-width: 700px)').matches;
const yerel = () => window.SUHA_YEREL || {};
const yukle = () => { const l = store.get('takvimEtk', []); return (Array.isArray(l) ? l : []).map(TK.temizle).filter(Boolean).slice(0, 20000); };
const TS = {
  gor: store.get('takvimGor', null) || (dar() ? 'ay' : 'hafta'),
  odak: bugun(), secili: bugun(), etk: yukle(), ara: '', araAcik: false,
  ayar: Object.assign({ tatil: true, hat: null, pazar: false }, store.get('takvimAyar', {})),
  gorulen: store.get('takvimGoruldu', {}),
  gorev: (() => { const l = store.get('takvimGorev', []); return (Array.isArray(l) ? l : []).map(TK.gorevTemizle).filter(Boolean).slice(0, 5000); })(),
  kay: null
};
const kaydet = () => { store.set('takvimEtk', TS.etk); bildirimPlanla(); };
const ayarKaydet = () => store.set('takvimAyar', TS.ayar);
const gorevKaydet = () => store.set('takvimGorev', TS.gorev);
const GORUNUMLER = ['ay', 'hafta', 'gun', 'ajanda', 'yil', 'gorev'];
const hBasi = g => { const n = dn(g); return ds(n - (TS.ayar.pazar ? (hafGun(n) + 1) % 7 : hafGun(n))); };   // haftanın ilk günü (Pazartesi ya da Pazar)
const gunAdi = i => GUN3[(i + (TS.ayar.pazar ? 6 : 0)) % 7];
const renkOf = e => RENK[e.renk]?.[1] || RENK[5][1];
const kisaAy = i => AY[i].slice(0, 3);

const tarihYaz = (g, yil = true) => { const [y, m, d] = g.split('-').map(Number); return `${d} ${AY[m - 1]}${yil ? ' ' + y : ''}`; };
const tarihUzun = g => `${GUN[hafGun(dn(g))]}, ${tarihYaz(g)}`;
const gunGoreli = g => { const f = dn(g) - dn(bugun()); return f === 0 ? 'Bugün' : f === 1 ? 'Yarın' : f === -1 ? 'Dün' : ''; };
function zamanYaz(o) {
  if (o.tum) return o.g === o.g2 ? 'Tüm gün' : `${tarihYaz(o.g, false)} – ${tarihYaz(o.g2, false)}`;
  if (o.g === o.g2) return o.b2 ? `${o.b} – ${o.b2}` : o.b;
  return `${tarihYaz(o.g, false)} ${o.b} – ${tarihYaz(o.g2, false)} ${o.b2 || ''}`.trim();
}

/* ═════════ Başlangıç ═════════ */
document.removeEventListener('DOMContentLoaded', boot);
function tkBaslat() {
  document.documentElement.classList.add('tk-html');
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  const u = new URLSearchParams(location.search);
  for (const k of GORUNUMLER) if (u.has(k)) { TS.gor = k; history.replaceState(null, '', location.pathname + (DEMO ? '?demo' : '')); }
  if (u.has('yeni')) setTimeout(() => olayAc({ yeni: true, g: bugun() }), 200);
  if (DEMO && !TS.etk.length) ornekler();
  kabuk(); ciz();
  setInterval(tik, 20000); tik();
  bildirimPlanla();
}
showLogin = msg => { if (msg) toast(msg); };
start = () => tkBaslat();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tkBaslat); else tkBaslat();

function ornekler() {
  const b = bugun(), e = (o) => TK.temizle(Object.assign({ ad: '', g: b }, o));
  TS.etk = [e({ ad: 'Sabah koşusu', g: gunEkle(b, -hafGun(dn(b))), b: '07:00', b2: '07:45', renk: 3, tek: { s: 'h', n: 1, gun: [0, 2, 4] } }),
    e({ ad: 'Haftalık toplantı', b: '10:00', b2: '11:00', renk: 5, yer: 'Toplantı odası 2', hat: 10 }),
    e({ ad: 'Öğle yemeği · Ayşe', g: gunEkle(b, 1), b: '12:30', b2: '13:30', renk: 1, yer: 'Kadıköy' }),
    e({ ad: 'Diş hekimi', g: gunEkle(b, 2), b: '15:00', b2: '15:45', renk: 0, hat: 60 }),
    e({ ad: 'Annem doğum günü', g: gunEkle(b, 4), tum: true, renk: 6, tek: { s: 'y', n: 1 } }),
    e({ ad: 'Hafta sonu gezisi', g: gunEkle(b, 5), g2: gunEkle(b, 6), tum: true, renk: 4, yer: 'Şile' }),
    e({ ad: 'Fatura son gün', g: gunEkle(b, 8), tum: true, renk: 1, tek: { s: 'a', n: 1 } })].filter(Boolean);
}

/* ═════════ İskelet ═════════ */
function kabuk() {
  const G = [['ay', 'Ay'], ['hafta', 'Hafta'], ['gun', 'Gün'], ['ajanda', 'Ajanda'], ['yil', 'Yıl'], ['gorev', 'Görev']];
  $('#app').innerHTML = `
  <div class="tk-kabuk">
    <header class="tk-bas">
      <div class="tk-bas1">
        <div class="brand-mark sm">${IC.cal}</div>
        <h1 id="tkBaslik" data-action="tk-tarih" title="Tarihe git" role="button" tabindex="0"></h1><input type="date" id="tkTarih" class="tk-gizli" tabindex="-1" aria-hidden="true">
        <button class="icon-btn" data-action="tk-geri" title="Önceki" aria-label="Önceki">${IC.chevL}</button>
        <button class="icon-btn" data-action="tk-ileri" title="Sonraki" aria-label="Sonraki">${IC.chevR}</button>
        <button class="btn sm" data-action="tk-bugun">Bugün</button>
        <div class="spacer"></div>
        <button class="icon-btn" data-action="tk-ara" title="Ara" aria-label="Ara">${IC.ara2}</button>
        <button class="icon-btn" data-action="tk-ayar" title="Ayarlar" aria-label="Ayarlar">${IC.gear}</button>
      </div>
      <div class="tk-bas2">
        <nav class="seg tk-gor">${G.map(([k, n]) => `<button data-action="tk-gor" data-k="${k}">${n}</button>`).join('')}</nav>
        <button class="btn primary tk-yeni" data-action="tk-yeni">${IC.plus}<span>Yeni</span></button>
      </div>
      <div class="tk-arabar" id="tkAraBar" hidden><input id="tkAra" type="search" placeholder="Etkinlik, yer ya da not ara" autocomplete="off" maxlength="100"></div>
    </header>
    <main class="tk-govde" id="tkGovde"></main>
  </div>
  <nav class="tk-alt" aria-label="Görünüm">${[['ay', 'Ay', 'gAy'], ['hafta', 'Hafta', 'gHafta'], ['gun', 'Gün', 'gGun'], ['ajanda', 'Ajanda', 'gAjanda'], ['yil', 'Yıl', 'gYil'], ['gorev', 'Görev', 'gGorev']].map(([k, n, ic]) => `<button data-action="tk-gor" data-k="${k}">${IC[ic]}<span>${n}</span></button>`).join('')}</nav>
  <button class="tk-fab" data-action="tk-yeni" aria-label="Yeni">${IC.plus}</button>`;
  $('#tkGovde').addEventListener('dblclick', e => { const h = e.target.closest('.tk-hucre'); if (h && !e.target.closest('.tk-cip, .tk-serit, .tk-daha') && !dar()) olayAc({ yeni: true, g: h.dataset.g, tum: true }); });
  $('#tkTarih').addEventListener('change', e => { if (TK.gecerliTarih(e.target.value)) { TS.odak = TS.secili = e.target.value; TS.kay = null; if (TS.gor === 'ajanda') TS.odak = e.target.value; ciz(); } });
  $('#tkBaslik').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ACTIONS['tk-tarih'](); } });
  const inp = $('#tkAra');
  inp.addEventListener('input', () => { TS.ara = inp.value.trim(); ciz(); });
  let tx = 0, ty = 0, tt = 0;
  const g = $('#tkGovde');
  g.addEventListener('touchstart', e => { const t = e.touches[0]; tx = t.clientX; ty = t.clientY; tt = Date.now(); }, { passive: true });
  g.addEventListener('touchend', e => {
    const t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty;
    if (Date.now() - tt < 600 && Math.abs(dx) > 70 && Math.abs(dy) < 45 && !TS.ara) { dx < 0 ? git(1) : git(-1); }
  }, { passive: true });
}

/* ═════════ Gezinme ═════════ */
function git(yon) {
  if (TS.gor === 'ay') TS.odak = ayEkle(TS.odak, yon);
  else if (TS.gor === 'hafta') TS.odak = gunEkle(TS.odak, 7 * yon);
  else if (TS.gor === 'gun') TS.odak = gunEkle(TS.odak, yon);
  else if (TS.gor === 'yil') TS.odak = ayEkle(TS.odak, 12 * yon);
  else if (TS.gor === 'gorev') return;
  else TS.odak = gunEkle(TS.odak, 14 * yon);
  if (TS.gor === 'ay') TS.secili = TS.odak;
  TS.kay = null; ciz();
}
function baslikYaz() {
  const o = TS.odak, [y, m] = o.split('-').map(Number);
  if (TS.ara) return 'Arama';
  if (TS.gor === 'ay') return `${AY[m - 1]} ${y}`;
  if (TS.gor === 'hafta') {
    const a = hBasi(o), b = gunEkle(a, 6), A = a.split('-').map(Number), B = b.split('-').map(Number);
    return A[1] === B[1] ? `${A[2]}–${B[2]} ${AY[B[1] - 1]} ${B[0]}` : `${A[2]} ${kisaAy(A[1] - 1)} – ${B[2]} ${kisaAy(B[1] - 1)} ${B[0]}`;
  }
  if (TS.gor === 'gun') return dar() ? tarihYaz(o, false) : tarihUzun(o);
  if (TS.gor === 'yil') return String(y);
  if (TS.gor === 'gorev') return 'Görevler';
  return 'Ajanda';
}
function ciz() {
  if (!$('#tkGovde')) return;
  const zg = $('.tk-zg'); if (zg) TS.kay = zg.scrollTop;
  $('#tkBaslik').textContent = baslikYaz();
  document.title = 'Takvim · ' + baslikYaz();
  document.querySelectorAll('[data-action="tk-gor"]').forEach(b => { const on = !TS.ara && b.dataset.k === TS.gor; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  $('#tkAraBar').hidden = !TS.araAcik;
  document.body.dataset.tkgor = TS.ara ? 'ara' : TS.gor;
  if (TS.ara) araCiz(); else ({ ay: ayCiz, hafta: () => zamanCiz(7), gun: () => zamanCiz(1), ajanda: ajandaCiz, yil: yilCiz, gorev: gorevCiz }[TS.gor] || ayCiz)();
}

/* ═════════ Parçalar ═════════ */
function cip(o, gun, genis) {
  const e = o.e, c = renkOf(e), cok = o.g !== o.g2;
  const saat = o.tum || cok ? '' : `<span class="s">${o.b}</span>`;
  const tamam = o.tum || cok;
  return `<button class="tk-cip${tamam ? ' dolu' : ''}${o.g < gun ? ' devam' : ''}${o.g2 > gun ? ' sonra' : ''}" style="--c:${c}" draggable="true" data-sur="${e.id}|${o.g}" data-action="tk-ac" data-id="${e.id}" data-g="${o.g}" title="${esc(e.ad)}">${saat}<span class="a">${esc(e.ad)}</span></button>`;
}
function gorevCip(t) { return `<button class="tk-cip gorev${t.bitti ? ' bitti' : ''}" data-action="tk-g-ac" data-id="${t.id}" title="${esc(t.ad)}"><span class="s">${t.bitti ? '☑' : '☐'}</span><span class="a">${esc(t.ad)}</span></button>`; }
function gorevHarita(a, b) {
  const h = {};
  for (const t of TS.gorev) if (t.g && t.g >= a && t.g <= b) (h[t.g] ||= []).push(t);
  for (const k in h) h[k].sort((x, y) => (x.bitti - y.bitti) || x.ad.localeCompare(y.ad, 'tr'));
  return h;
}
function gorevSatir(t) {
  return `<div class="tk-gs${t.bitti ? ' bitti' : ''}"><button class="tk-kutu${t.bitti ? ' on' : ''}" role="checkbox" aria-checked="${t.bitti}" aria-label="Tamamlandı" data-action="tk-g-bitir" data-id="${t.id}">${t.bitti ? IC.check : ''}</button>
    <button class="tk-gad" data-action="tk-g-ac" data-id="${t.id}"><b>${esc(t.ad)}</b>${t.g ? `<span class="${!t.bitti && t.g < bugun() ? 'gecik' : ''}">${esc(gunGoreli(t.g) || tarihYaz(t.g, t.g.slice(0, 4) !== bugun().slice(0, 4)))}</span>` : ''}</button></div>`;
}
function tatilCip(ad) { return `<span class="tk-cip tatil" title="${esc(ad)}"><span class="a">${esc(ad)}</span></span>`; }
function gunHaritasi(a, b) {
  const h = {}, occ = TK.hepsi(TS.etk, a, b).sort(TK.sirala), A = dn(a), B = dn(b);
  for (const o of occ) for (let d = Math.max(dn(o.g), A); d <= Math.min(dn(o.g2), B); d++) (h[ds(d)] ||= []).push(o);
  return h;
}
const gunSirasi = (x, y) => ((y.tum || x.g !== x.g2) - (x.tum || x.g !== x.g2)) || (x.b || '').localeCompare(y.b || '') || x.e.ad.localeCompare(y.e.ad, 'tr');

/* ═════════ Ay ═════════ */
const panelModu = () => !dar() && window.innerWidth >= 1000;
function ayCiz() {
  const [y, m] = TS.odak.split('-').map(Number), ilk = `${y}-${pad(m)}-01`, bas = hBasi(ilk), son = gunEkle(bas, 41), b = bugun();
  const harita = gunHaritasi(bas, son), tatil = TS.ayar.tatil ? TK.tatilAra(bas, son) : {}, d = dar(), gor = gorevHarita(bas, son), panel = panelModu();
  let h = `<div class="tk-ay-sarma${panel ? ' panelli' : ''}"><div class="tk-ay"><div class="tk-ay-bas">${[0, 1, 2, 3, 4, 5, 6].map(i => `<span>${gunAdi(i)}</span>`).join('')}</div><div class="tk-ay-izgara">`;
  for (let w = 0; w < 6; w++) {
    const w0 = gunEkle(bas, w * 7), w1 = gunEkle(w0, 6);
    let serit = '', yol = 0;
    if (!d) {   // çok günlü etkinlikler: haftayı boydan boya kaplayan tek şerit
      const gor_ = new Set(), seg = [];
      for (let i = 0; i < 7; i++) for (const o of (harita[gunEkle(w0, i)] || [])) {
        if (o.g === o.g2 || gor_.has(o.e.id + o.g)) continue; gor_.add(o.e.id + o.g);
        seg.push({ o, c0: Math.max(dn(o.g), dn(w0)) - dn(w0), c1: Math.min(dn(o.g2), dn(w1)) - dn(w0) });
      }
      seg.sort((p, q) => p.c0 - q.c0 || (q.c1 - q.c0) - (p.c1 - p.c0));
      const yollar = [];
      for (const sg of seg) { let k = yollar.findIndex(e => e < sg.c0); if (k < 0) { k = yollar.length; yollar.push(-1); } yollar[k] = sg.c1; sg.k = k; }
      yol = Math.min(yollar.length, 4);
      serit = seg.filter(sg => sg.k < 4).map(sg => `<button class="tk-serit${sg.o.g < w0 ? ' devam' : ''}${sg.o.g2 > w1 ? ' sonra' : ''}" style="--c:${renkOf(sg.o.e)};left:calc(${sg.c0} * 100% / 7 + 2px);width:calc(${sg.c1 - sg.c0 + 1} * 100% / 7 - 4px);top:${28 + sg.k * 20}px" data-action="tk-ac" data-id="${sg.o.e.id}" data-g="${sg.o.g}" title="${esc(sg.o.e.ad)}">${sg.o.g < w0 ? '◂ ' : ''}${esc(sg.o.e.ad)}</button>`).join('');
    }
    h += `<div class="tk-hafta" style="--yol:${yol}">`;
    for (let i = 0; i < 7; i++) {
      const g = gunEkle(w0, i), n = +g.slice(8), ay = +g.slice(5, 7), tum = (harita[g] || []).slice().sort(gunSirasi), liste = d ? tum : tum.filter(o => o.g === o.g2), t = tatil[g], hf = hafGun(dn(g));
      const sinif = ['tk-hucre', ay !== m ? 'disari' : '', g === b ? 'bugun' : '', g === TS.secili ? 'secili' : '', hf >= 5 ? 'hs' : '', t && !/yarım gün/.test(t) ? 'tatilgun' : ''].filter(Boolean).join(' ');
      let ic = '';
      if (d) {
        const gl = gor[g] || [], nok = liste.slice(0, 4).map(o => `<i style="--c:${renkOf(o.e)}"></i>`).join('') + gl.slice(0, Math.max(0, 4 - liste.length)).map(() => '<i class="tk-gnok"></i>').join('');
        ic = `<div class="tk-noktalar">${nok}${t ? '<i class="tk-tnok"></i>' : ''}</div>`;
      } else {
        const ogeler = [...(t ? [tatilCip(t)] : []), ...liste.map(o => cip(o, g)), ...(gor[g] || []).map(gorevCip)], goster = ogeler.slice(0, Math.max(1, 3 - Math.max(0, yol - 1)));
        ic = `<div class="tk-cipler">${goster.join('')}${ogeler.length > goster.length ? `<button class="tk-daha" data-action="tk-gune" data-g="${g}">+${ogeler.length - goster.length} daha</button>` : ''}</div>`;
      }
      h += `<div class="${sinif}" data-action="tk-hucre" data-g="${g}"><span class="tk-no">${n === 1 ? `${n} ${kisaAy(ay - 1)}` : n}</span>${ic}</div>`;
    }
    h += `<div class="tk-seritler">${serit}</div></div>`;
  }
  h += '</div></div>';
  if (panel) h += `<aside class="tk-yan">${gunPaneli(TS.secili, harita, tatil)}</aside>`;
  h += '</div>';
  if (d) h += gunPaneli(TS.secili, harita, tatil); else sureyeKur();
  $('#tkGovde').innerHTML = h;
}
function gunPaneli(g, harita, tatil) {
  const aralik = harita[g] ? harita : gunHaritasi(g, g), liste = (aralik[g] || []).slice().sort(gunSirasi), t = (tatil[g]) || (TS.ayar.tatil ? TK.tatilAra(g, g)[g] : '');
  return `<section class="tk-panel"><div class="tk-panel-bas"><b>${gunGoreli(g) ? gunGoreli(g) + ' · ' : ''}${esc(tarihUzun(g))}</b><button class="btn sm" data-action="tk-yeni-gun" data-g="${g}">${IC.plus}Ekle</button></div>
    ${t ? `<div class="tk-sat tatil"><i></i><div><b>${esc(t)}</b><span>Resmî tatil</span></div></div>` : ''}
    ${liste.map(o => satir(o, g)).join('')}${(gorevHarita(g, g)[g] || []).map(gorevSatir).join('')}
    ${!liste.length && !t && !(gorevHarita(g, g)[g] || []).length ? '<p class="muted sm tk-bos">Bu gün için etkinlik yok.</p>' : ''}</section>`;
}
function satir(o, gun) {
  const e = o.e;
  return `<button class="tk-sat" style="--c:${renkOf(e)}" data-action="tk-ac" data-id="${e.id}" data-g="${o.g}"><i></i><div><b>${esc(e.ad)}</b><span>${esc(zamanYaz(o))}${e.yer ? ' · ' + esc(e.yer) : ''}${e.tek ? ' · ↻' : ''}</span></div></button>`;
}

/* ═════════ Hafta ve gün (saat ızgarası) ═════════ */
const SAAT_PX = 48;
function zamanCiz(n) {
  const bas = n === 7 ? hBasi(TS.odak) : TS.odak, son = gunEkle(bas, n - 1), b = bugun();
  const gunler = Array.from({ length: n }, (_, i) => gunEkle(bas, i)), harita = gunHaritasi(bas, son), tatil = TS.ayar.tatil ? TK.tatilAra(bas, son) : {};
  const baslar = gunler.map(g => {
    const hf = hafGun(dn(g));
    return `<button class="tk-gb${g === b ? ' bugun' : ''}${hf >= 5 ? ' hs' : ''}" data-action="tk-gune2" data-g="${g}"><span>${GUN3[hf]}</span><b>${+g.slice(8)}</b></button>`;
  }).join('');
  const gorH = gorevHarita(bas, son);
  const tumGun = gunler.map(g => {
    const l = (harita[g] || []).filter(o => o.tum), t = tatil[g];
    return `<div class="tk-tg">${t ? tatilCip(t) : ''}${l.map(o => cip(o, g)).join('')}${(gorH[g] || []).map(gorevCip).join('')}</div>`;
  }).join('');
  const saatler = Array.from({ length: 24 }, (_, h) => `<span style="top:${h * SAAT_PX}px">${h ? pad(h) + ':00' : ''}</span>`).join('');
  let enErken = 1e9;
  const sutunlar = gunler.map(g => {
    const p = (harita[g] || []).filter(o => !o.tum).map(o => { const q = TK.parca(o, g); return q ? { o, a: q[0], b: q[1] } : null; }).filter(Boolean);
    p.forEach(q => { enErken = Math.min(enErken, q.a); });
    const blok = TK.yerlestir(p).map(x => {
      const e = x.o.e, yuk = Math.max(18, (x.b - x.a) * SAAT_PX / 60 - 2), w = 100 / x.n;
      return `<button class="tk-blok" style="--c:${renkOf(e)};top:${x.a * SAAT_PX / 60}px;height:${yuk}px;left:calc(${x.k * w}% + 1px);width:calc(${w}% - 3px)" data-action="tk-ac" data-id="${e.id}" data-g="${x.o.g}" data-bas="${x.a}">
        <b>${esc(e.ad)}</b>${yuk > 34 ? `<span>${saatYaz(x.a)} – ${saatYaz(x.b % 1440 || 1440)}${e.yer && yuk > 50 ? ' · ' + esc(e.yer) : ''}</span>` : ''}${x.o.g === x.o.g2 ? '<i class="tk-tut"></i>' : ''}</button>`;
    }).join('');
    return `<div class="tk-sut${g === b ? ' bugun' : ''}" data-g="${g}">${blok}${g === b ? '<div class="tk-simdi" id="tkSimdi"></div>' : ''}</div>`;
  }).join('');
  $('#tkGovde').innerHTML = `<div class="tk-zaman n${n}">
    <div class="tk-zb"><div class="tk-kose">${n === 7 ? 'H' + haftaNo(TS.ayar.pazar ? gunEkle(bas, 1) : bas) : ''}</div>${baslar}</div>
    <div class="tk-zt"><div class="tk-kose"></div>${tumGun}</div>
    <div class="tk-zg"><div class="tk-zg-ic" style="height:${24 * SAAT_PX}px"><div class="tk-saatler">${saatler}</div>${sutunlar}</div></div></div>`;
  const zg = $('.tk-zg');
  if (TS.kay != null) zg.scrollTop = TS.kay;
  else if (enErken < 1e9) zg.scrollTop = Math.max(0, (enErken - 60) * SAAT_PX / 60);
  else if (gunler.includes(b)) { const t = new Date(); zg.scrollTop = Math.max(0, (t.getHours() * 60 + t.getMinutes()) * SAAT_PX / 60 - zg.clientHeight / 2); }
  else zg.scrollTop = 7 * SAAT_PX;
  document.querySelectorAll('.tk-sut').forEach(c => c.addEventListener('click', e => {
    if (e.target.closest('.tk-blok')) return;
    const y = e.clientY - c.getBoundingClientRect().top;
    const s = Math.floor((y / SAAT_PX) * 2) * 30;
    olayAc({ yeni: true, g: c.dataset.g, b: saatYaz(Math.min(23 * 60, s)), b2: saatYaz(Math.min(23 * 60 + 59, s + 60)) });
  }));
  simdiTazele(); surukleKur();
}
function simdiTazele() {
  const el = $('#tkSimdi'); if (!el) return;
  const t = new Date(); el.style.top = ((t.getHours() * 60 + t.getMinutes()) * SAAT_PX / 60) + 'px';
}

/* ═════════ Ajanda ve arama ═════════ */
function listeCiz(occ, bosMetin, ustuYaz, gorH = {}) {
  const harita = {};
  for (const o of occ) (harita[o.g] ||= []).push(o);
  const gunler = Object.keys(harita).sort(), tatil = TS.ayar.tatil && gunler.length && !ustuYaz ? TK.tatilAra(gunler[0], gunler[gunler.length - 1]) : {};
  const t = [...new Set([...Object.keys(tatil), ...gunler, ...Object.keys(gorH)])].sort();
  if (!t.length) return `<p class="muted sm tk-bos tk-buyuk">${bosMetin}</p>`;
  return `<div class="tk-ajanda">` + t.map(g => {
    const hf = hafGun(dn(g)), gl = gunGoreli(g);
    return `<section class="tk-ag${g === bugun() ? ' bugun' : ''}"><div class="tk-ag-t"><b>${+g.slice(8)}</b><span>${GUN3[hf]}</span></div><div class="tk-ag-l">
      <div class="tk-ag-bas">${gl ? gl + ' · ' : ''}${esc(tarihYaz(g))}</div>
      ${tatil[g] ? `<div class="tk-sat tatil"><i></i><div><b>${esc(tatil[g])}</b><span>Resmî tatil</span></div></div>` : ''}
      ${(harita[g] || []).map(o => satir(o, g)).join('')}${(gorH[g] || []).map(gorevSatir).join('')}</div></section>`;
  }).join('') + '</div>';
}
function ajandaCiz() {
  const a = TS.odak, b = gunEkle(a, 59);
  const occ = TK.hepsi(TS.etk, a, b).filter(o => o.g >= a || o.g2 >= a).map(o => o.g < a ? { ...o, g: a } : o).sort(TK.sirala);
  $('#tkGovde').innerHTML = `<div class="tk-ajanda-k">${listeCiz(occ, 'Önümüzdeki 60 günde etkinlik yok. Sağ üstteki “Yeni” ile ekleyebilirsin.', false, gorevHarita(a, b))}</div>`;
}
function araCiz() {
  const q = TS.ara.toLocaleLowerCase('tr'), a = gunEkle(bugun(), -400), b = gunEkle(bugun(), 800);
  const eslesen = TS.etk.filter(e => (e.ad + ' ' + e.yer + ' ' + e.not).toLocaleLowerCase('tr').includes(q));
  const occ = TK.hepsi(eslesen, a, b).sort(TK.sirala).slice(0, 300);
  $('#tkGovde').innerHTML = `<div class="tk-ajanda-k">${listeCiz(occ, `“${esc(TS.ara)}” için etkinlik bulunamadı.`, true)}</div>`;
}


/* ═════════ Yıl ═════════ */
function yilCiz() {
  const y = +TS.odak.slice(0, 4), a = `${y}-01-01`, z = `${y}-12-31`, b = bugun();
  const harita = gunHaritasi(a, z), tatil = TS.ayar.tatil ? TK.tatilAra(a, z) : {}, gor = gorevHarita(a, z);
  let h = '<div class="tk-yil">';
  for (let m = 1; m <= 12; m++) {
    const ilk = `${y}-${pad(m)}-01`, bas = hBasi(ilk), n = TK.ayGun(y, m), kay = dn(ilk) - dn(bas);
    h += `<section class="tk-yay"><button class="tk-yay-ad" data-action="tk-yay" data-g="${ilk}">${AY[m - 1]}</button><div class="tk-yg-izgara">`;
    h += [0, 1, 2, 3, 4, 5, 6].map(i => `<em>${gunAdi(i)[0]}</em>`).join('') + '<span></span>'.repeat(kay);
    for (let d = 1; d <= n; d++) {
      const g = `${y}-${pad(m)}-${pad(d)}`, hf = hafGun(dn(g)), say = (harita[g] || []).length, t = tatil[g];
      const sinif = ['tk-yg', g === b ? 'bugun' : '', hf >= 5 || (t && !/yarım gün/.test(t)) ? 'hs' : '', say || (gor[g] || []).length ? 'olay' : ''].filter(Boolean).join(' ');
      h += `<button class="${sinif}" data-action="tk-yg" data-g="${g}" title="${esc(tarihYaz(g) + (t ? ' · ' + t : '') + (say ? ` · ${say} etkinlik` : ''))}">${d}</button>`;
    }
    h += '</div></section>';
  }
  $('#tkGovde').innerHTML = h + '</div>';
}

/* ═════════ Görevler (yapılacaklar) ═════════ */
let gBitmisAcik = false;
function gorevCiz() {
  const b = bugun(), a = TS.gorev.filter(t => !t.bitti), bit = TS.gorev.filter(t => t.bitti).sort((x, y) => (y.bz || 0) - (x.bz || 0));
  const tarihli = x => a.filter(x).sort((p, q) => (p.g || '').localeCompare(q.g || '') || p.ad.localeCompare(q.ad, 'tr'));
  const bol = (ad, liste, sinif = '') => liste.length ? `<section class="tk-gb-bol ${sinif}"><h3>${ad} <em>${liste.length}</em></h3>${liste.map(gorevSatir).join('')}</section>` : '';
  const h = bol('Gecikmiş', tarihli(t => t.g && t.g < b), 'gecik') + bol('Bugün', tarihli(t => t.g === b)) + bol('Yaklaşan', tarihli(t => t.g && t.g > b)) + bol('Tarihsiz', tarihli(t => !t.g));
  $('#tkGovde').innerHTML = `<div class="tk-gorev"><form class="tk-g-ekle" id="tkGForm" autocomplete="off"><input class="tk-in" id="tkGEkle" placeholder="Yeni görev: yarın rapor yaz" maxlength="200"><button class="btn primary" type="submit">Ekle</button></form>
    ${h || '<p class="muted sm tk-bos tk-buyuk">Yapılacak görev yok. Yukarıya yazıp Enter’a basarak ekleyebilirsin.</p>'}
    ${bit.length ? `<section class="tk-gb-bol bitenler"><h3><button class="tk-g-ac2" data-action="tk-g-bitenler">${gBitmisAcik ? '▾' : '▸'} Tamamlanan <em>${bit.length}</em></button>${gBitmisAcik ? '<button class="btn sm" data-action="tk-g-temizle">Temizle</button>' : ''}</h3>${gBitmisAcik ? bit.slice(0, 100).map(gorevSatir).join('') : ''}</section>` : ''}</div>`;
  $('#tkGForm').addEventListener('submit', e => {
    e.preventDefault(); const i = $('#tkGEkle'), r = TK.hizliCoz(i.value, bugun()); const ad = r.ad || i.value.trim(); if (!ad) return;
    const t = TK.gorevTemizle({ ad, g: r.g || undefined }); if (!t) return;
    TS.gorev.unshift(t); gorevKaydet(); gorevCiz(); setTimeout(() => $('#tkGEkle')?.focus(), 10);
  });
}
function gorevAc(id) {
  const t = id ? TS.gorev.find(x => x.id === id) : null; if (id && !t) return;
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask tk-sheet"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal" aria-label="Kapat">${IC.close}</button><h3>${t ? 'Görev' : 'Yeni görev'}</h3></header>
    <div class="set-body tk-form"><input class="tk-in tk-baslik" id="tkGAd" placeholder="Görev" maxlength="200" value="${esc(t?.ad || '')}">
      <label class="tk-zaman-s"><label>Son tarih <span><input type="date" id="tkGTarih" value="${t?.g || ''}"><button type="button" class="btn sm" id="tkGTarihSil">Temizle</button></span></label></label>
      <label class="tk-et top">${IC.notIc}<textarea class="tk-in" id="tkGNot" rows="3" placeholder="Not" maxlength="1000">${esc(t?.not || '')}</textarea></label></div>
    <div class="sticky-actions">${t ? '<button type="button" class="btn tehlike" id="tkGSil">Sil</button>' : ''}<div class="spacer"></div><button type="button" class="btn primary" id="tkGKaydet">Kaydet</button></div></div></div>`;
  const q = x => $('#modal').querySelector(x);
  setTimeout(() => q('#tkGAd')?.focus(), 60);
  q('#tkGTarihSil').onclick = () => { q('#tkGTarih').value = ''; };
  q('#tkGAd').onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); q('#tkGKaydet').click(); } };
  q('#tkGKaydet').onclick = () => {
    const yeni = TK.gorevTemizle({ ...(t || {}), ad: q('#tkGAd').value, g: q('#tkGTarih').value || undefined, not: q('#tkGNot').value });
    if (!yeni) return toast('Görev adı boş olamaz');
    if (t) TS.gorev[TS.gorev.indexOf(t)] = yeni; else TS.gorev.unshift(yeni);
    gorevKaydet(); closeModal(); ciz(); toast(t ? 'Kaydedildi' : 'Görev eklendi');
  };
  if (t) q('#tkGSil').onclick = () => { const yedek = TS.gorev.slice(); TS.gorev = TS.gorev.filter(x => x !== t); gorevKaydet(); closeModal(); ciz(); toast('Silindi', [['Geri al', () => { TS.gorev = yedek; gorevKaydet(); ciz(); }]], 6000); };
}

/* ═════════ Sürükleyip taşıma ═════════ */
function tasiOlayi(e, occG, yeni, mesaj) {
  const yedekE = JSON.parse(JSON.stringify(TS.etk)), geri = () => { TS.etk = yedekE; kaydet(); ciz(); };
  const sonuc = m => { kaydet(); ciz(); toast(m, [['Geri al', geri]], 6000); };
  if (!e.tek) {
    const t = TK.temizle({ ...e, ...yeni }); if (!t) return;
    TS.etk[TS.etk.indexOf(e)] = t; sonuc(mesaj); return;
  }
  const seri = TK.temizle(TK.seriKaydir(e, occG, yeni)), tekil = TK.temizle({ ...e, ...yeni, tek: undefined, ist: undefined, id: undefined, uid: undefined });
  if (!seri || !tekil) return;
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal" aria-label="Kapat">${IC.close}</button><h3>Tekrarlayan etkinlik</h3></header>
    <div class="set-body tk-sil"><p class="muted sm">Değişiklik hangisine uygulansın?</p>
      <button class="btn" id="tkT1">Sadece ${esc(tarihYaz(occG, false))} tarihlisi</button>
      <button class="btn primary" id="tkT2">Tüm seri</button></div></div></div>`;
  $('#tkT1').onclick = () => { e.ist = [...(e.ist || []), occG]; TS.etk.splice(TS.etk.indexOf(e) + 1, 0, tekil); closeModal(); sonuc('Sadece bu etkinlik değişti'); };
  $('#tkT2').onclick = () => { TS.etk[TS.etk.indexOf(e)] = seri; closeModal(); sonuc('Tüm seri değişti'); };
}
let surukSon = 0, surukEl = null;
function surukleKur() {
  const ic = $('.tk-zg-ic'); if (!ic) return;
  ic.addEventListener('touchmove', ev => { if (ic.dataset.suruk) ev.preventDefault(); }, { passive: false });
  ic.querySelectorAll('.tk-blok').forEach(el => {
    el.addEventListener('click', ev => { if (surukEl === el && Date.now() - surukSon < 400) { ev.stopImmediatePropagation(); ev.preventDefault(); } }, true);
    el.addEventListener('pointerdown', ev => {
      if (ev.button > 0) return;
      const mod = ev.target.classList.contains('tk-tut') ? 'boy' : 'tasi', e = TS.etk.find(k => k.id === el.dataset.id); if (!e) return;
      const g = el.dataset.g, occ = TK.olusumlar(e, g, g).find(x => x.g === g); if (!occ || occ.tum) return;
      const sutlar = [...ic.querySelectorAll('.tk-sut')], bas = sutlar.findIndex(c => c.contains(el)), br = el.getBoundingClientRect(), sr = sutlar.map(c => c.getBoundingClientRect());
      const x0 = ev.clientX, y0 = ev.clientY, dokunmatik = ev.pointerType === 'touch', ph = br.height;
      let basladi = false, zam = 0, gunD = 0, dkD = 0;
      const baslat = () => { basladi = true; ic.dataset.suruk = '1'; el.classList.add('suruk'); try { el.setPointerCapture(ev.pointerId); } catch {} if (dokunmatik) navigator.vibrate?.(12); };
      if (dokunmatik) zam = setTimeout(baslat, 380);
      const hesap = (cx, cy) => {
        dkD = Math.round((cy - y0) / SAAT_PX * 4) * 15;
        let hedef = bas; if (mod === 'tasi') { hedef = sr.findIndex(r => cx >= r.left && cx < r.right); if (hedef < 0) hedef = cx < sr[0].left ? 0 : sr.length - 1; }
        gunD = hedef - bas;
        if (mod === 'tasi') { const s = Math.min(1425, Math.max(0, dk(occ.b) + dkD)); dkD = s - dk(occ.b); }
        else { const son = occ.b2 ? dk(occ.b2) : dk(occ.b) + 60; dkD = Math.max(dk(occ.b) + 15, Math.min(1440, son + dkD)) - son; }
      };
      const hareket = m => {
        if (!basladi) { if (!dokunmatik && Math.hypot(m.clientX - x0, m.clientY - y0) > 5) baslat(); else if (dokunmatik && Math.hypot(m.clientX - x0, m.clientY - y0) > 9) bitir(true); if (!basladi) return; }
        hesap(m.clientX, m.clientY);
        if (mod === 'tasi') el.style.transform = `translate(${sr[bas + gunD].left - sr[bas].left}px, ${dkD * SAAT_PX / 60}px)`;
        else el.style.height = Math.max(18, ph + dkD * SAAT_PX / 60) + 'px';
      };
      const bitir = iptal => {
        clearTimeout(zam); window.removeEventListener('pointermove', hareket); window.removeEventListener('pointerup', birak); window.removeEventListener('pointercancel', vazgec);
        delete ic.dataset.suruk; el.classList.remove('suruk');
        if (!basladi) return; surukSon = Date.now(); surukEl = el; el.style.transform = ''; el.style.height = '';
        if (iptal || (!gunD && !dkD)) return;
        const bs = dn(occ.g) * 1440 + dk(occ.b), bt = dn(occ.g2) * 1440 + (occ.b2 ? dk(occ.b2) : dk(occ.b) + 60), yaz = (m1, m2) => ({ g: ds(Math.floor(m1 / 1440)), b: saatYaz(m1 % 1440), g2: ds(Math.floor(m2 / 1440)), b2: occ.b2 || mod === 'boy' ? saatYaz(m2 % 1440 === 0 && m2 > m1 ? 1439 : m2 % 1440) : '' });
        const yeni = mod === 'tasi' ? yaz(bs + gunD * 1440 + dkD, bt + gunD * 1440 + dkD) : yaz(bs, Math.min(bt + dkD, Math.floor(bs / 1440) * 1440 + 1439));
        tasiOlayi(e, occ.g, yeni, mod === 'tasi' ? 'Taşındı' : 'Süre değişti');
      };
      const birak = () => bitir(false), vazgec = () => bitir(true);
      window.addEventListener('pointermove', hareket); window.addEventListener('pointerup', birak); window.addEventListener('pointercancel', vazgec);
    });
  });
}
/* Ay görünümü: çipi başka güne sürükle (fare) */
function sureyeKur() {
  const g = $('#tkGovde'); if (!g || g.dataset.dnd) return; g.dataset.dnd = '1';
  g.addEventListener('dragstart', ev => { const c = ev.target.closest?.('[data-sur]'); if (!c) return; ev.dataTransfer.setData('text/plain', c.dataset.sur); ev.dataTransfer.effectAllowed = 'move'; });
  g.addEventListener('dragover', ev => { const h = ev.target.closest?.('.tk-hucre'); if (h) { ev.preventDefault(); h.classList.add('hedef'); } });
  g.addEventListener('dragleave', ev => ev.target.closest?.('.tk-hucre')?.classList.remove('hedef'));
  g.addEventListener('drop', ev => {
    const h = ev.target.closest?.('.tk-hucre'); if (!h) return; ev.preventDefault(); h.classList.remove('hedef');
    const [id, og] = (ev.dataTransfer.getData('text/plain') || '').split('|'), e = TS.etk.find(k => k.id === id); if (!e || !TK.gecerliTarih(og)) return;
    const occ = TK.olusumlar(e, og, og).find(x => x.g === og), fark = dn(h.dataset.g) - dn(og); if (!occ || !fark) return;
    tasiOlayi(e, og, { g: ds(dn(occ.g) + fark), g2: ds(dn(occ.g2) + fark), b: occ.b, b2: occ.b2 }, 'Taşındı');
  });
}

/* ═════════ Etkinlik penceresi ═════════ */
const HAT = [[null, 'Yok'], [0, 'Zamanında'], [5, '5 dakika önce'], [10, '10 dakika önce'], [15, '15 dakika önce'], [30, '30 dakika önce'], [60, '1 saat önce'], [120, '2 saat önce'], [1440, '1 gün önce'], [2880, '2 gün önce'], [10080, '1 hafta önce']];
function olayAc(x) {
  const yeni = !!x.yeni, e = yeni ? null : TS.etk.find(k => k.id === x.id);
  if (!yeni && !e) return;
  const tum = yeni ? !!x.tum : e.tum;
  const v = yeni ? { ad: x.ad || '', g: x.g || bugun(), g2: x.g2 || x.g || bugun(), b: x.b || '09:00', b2: x.b2 || saatYaz(Math.min(1439, dk(x.b || '09:00') + 60)), tum, renk: 5, yer: '', not: '', hat: TS.ayar.hat, tek: null }
    : { ...e, g: x.g, g2: ds(dn(x.g) + (dn(e.g2 || e.g) - dn(e.g))), b: e.b || '09:00', b2: e.b2 || '' };
  const sure = yeni ? 0 : dn(e.g2 || e.g) - dn(e.g);
  const t = v.tek || { s: '', n: 1 };
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask tk-sheet"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal" aria-label="Kapat">${IC.close}</button><h3>${yeni ? 'Yeni etkinlik' : 'Etkinlik'}</h3></header>
    <div class="set-body tk-form">
      ${yeni ? `<input class="tk-in" id="tkHizli" placeholder="Hızlı yaz: yarın 15:00 diş hekimi" maxlength="300" autocomplete="off"><p class="muted sm tk-ipucu" id="tkHizliIpucu">Yazdıkça tarih ve saat aşağıya yerleşir.</p>` : ''}
      <input class="tk-in tk-baslik" id="tkAd" placeholder="Başlık" maxlength="200" value="${esc(v.ad)}" autocomplete="off">
      <div class="set-row"><div><b>Tüm gün</b></div><label class="tk-anahtar"><input type="checkbox" id="tkTum" ${v.tum ? 'checked' : ''}><i></i></label></div>
      <div class="tk-zaman-s">
        <label>Başlangıç<span><input type="date" id="tkG" value="${v.g}"><input type="time" id="tkB" value="${v.b}" ${v.tum ? 'hidden' : ''}></span></label>
        <label>Bitiş<span><input type="date" id="tkG2" value="${v.g2}"><input type="time" id="tkB2" value="${v.b2}" ${v.tum ? 'hidden' : ''}></span></label>
      </div>
      <div class="tk-renkler" role="radiogroup" aria-label="Renk">${RENK.map(([ad, c], i) => `<label title="${ad}"><input type="radio" name="tkRenk" value="${i}" ${v.renk === i ? 'checked' : ''}><i style="--c:${c}"></i></label>`).join('')}</div>
      <label class="tk-et">${IC.tekrar}<select id="tkTekS">${[['', 'Tekrarlanmaz'], ['g', 'Her gün'], ['h', 'Her hafta'], ['a', 'Her ay'], ['y', 'Her yıl']].map(([k, n]) => `<option value="${k}" ${t.s === k ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
      <div class="tk-tekrar" id="tkTekD" ${t.s ? '' : 'hidden'}>
        <label>Her <input type="number" id="tkTekN" min="1" max="99" value="${t.n || 1}"> <span id="tkTekBirim"></span></label>
        <div class="tk-gunler" id="tkGunler" ${t.s === 'h' ? '' : 'hidden'}>${GUN3.map((n, i) => `<label><input type="checkbox" value="${i}" ${(t.gun || [hafGun(dn(v.g))]).includes(i) ? 'checked' : ''}><span>${n}</span></label>`).join('')}</div>
        <label>Bitiş <input type="date" id="tkTekBit" value="${t.bit || ''}"><em class="muted sm"> boşsa hiç bitmez</em></label>
      </div>
      <label class="tk-et">${IC.alarm}<select id="tkHat">${HAT.map(([k, n]) => `<option value="${k ?? ''}" ${v.hat === k ? 'selected' : ''}>${k === null ? 'Hatırlatma yok' : n}</option>`).join('')}</select></label>
      <p class="muted sm tk-ipucu" id="tkHatIpucu" hidden>Tüm gün etkinliklerinde hatırlatma saat 09:00 sayılır.</p>
      <label class="tk-et">${IC.konum}<input class="tk-in" id="tkYer" placeholder="Konum" maxlength="200" value="${esc(v.yer)}" autocomplete="off"></label>
      <label class="tk-et top">${IC.notIc}<textarea class="tk-in" id="tkNot" rows="3" placeholder="Not" maxlength="4000">${esc(v.not)}</textarea></label>
    </div>
    <div class="sticky-actions">${yeni ? '' : '<button type="button" class="btn tehlike" id="tkSil">Sil</button><button type="button" class="btn" id="tkKopya">Kopyala</button><button type="button" class="btn" id="tkIcs">.ics</button>'}<div class="spacer"></div><button type="button" class="btn primary" id="tkKaydet">Kaydet</button></div></div></div>`;
  const $$ = s => $('#modal').querySelector(s);
  const birim = () => { const s = $$('#tkTekS').value; $$('#tkTekBirim').textContent = { g: 'günde bir', h: 'haftada bir', a: 'ayda bir', y: 'yılda bir' }[s] || ''; $$('#tkTekD').hidden = !s; $$('#tkGunler').hidden = s !== 'h'; };
  const tumGun = () => { const a = $$('#tkTum').checked; $$('#tkB').hidden = $$('#tkB2').hidden = a; $$('#tkHatIpucu').hidden = !(a && $$('#tkHat').value !== ''); };
  birim(); tumGun();
  $$('#tkTekS').onchange = birim; $$('#tkTum').onchange = tumGun; $$('#tkHat').onchange = tumGun;
  // Başlangıç değişince bitişi aynı süreyle kaydır
  let sonG = v.g;
  $$('#tkG').onchange = () => { const d = dn($$('#tkG').value) - dn(sonG); if (!isNaN(d)) { const g2 = $$('#tkG2').value; if (TK.gecerliTarih(g2)) $$('#tkG2').value = ds(dn(g2) + d); sonG = $$('#tkG').value; } };
  $$('#tkB').onchange = () => { if ($$('#tkG').value === $$('#tkG2').value && TK.gecerliSaat($$('#tkB').value)) $$('#tkB2').value = saatYaz(Math.min(1439, dk($$('#tkB').value) + 60)); };
  if (yeni) {
    const h = $$('#tkHizli');
    h.oninput = () => {
      const r = TK.hizliCoz(h.value, bugun()); if (!h.value.trim()) { $$('#tkHizliIpucu').textContent = 'Yazdıkça tarih ve saat aşağıya yerleşir.'; return; }
      $$('#tkAd').value = r.ad;
      if (r.g) { $$('#tkG').value = r.g; $$('#tkG2').value = r.g; sonG = r.g; }
      $$('#tkTum').checked = r.tum && !!r.g; if (r.b) { $$('#tkB').value = r.b; $$('#tkB2').value = r.b2 || saatYaz(Math.min(1439, dk(r.b) + 60)); if (r.g || true) $$('#tkTum').checked = false; }
      tumGun();
      $$('#tkHizliIpucu').textContent = (r.g ? tarihUzun(r.g) : 'Tarih seçili gün') + (r.b ? ' · ' + r.b + (r.b2 ? '–' + r.b2 : '') : (r.g ? ' · tüm gün' : ''));
    };
    h.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); $$('#tkKaydet').click(); } };
    setTimeout(() => h.focus(), 60);
  } else setTimeout(() => { const a = $$('#tkAd'); if (a && !a.value) a.focus(); }, 60);
  $$('#tkAd').onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); $$('#tkKaydet').click(); } };
  $$('#tkKaydet').onclick = () => {
    const tumV = $$('#tkTum').checked, g = $$('#tkG').value, g2 = $$('#tkG2').value || g;
    if (!TK.gecerliTarih(g)) return toast('Başlangıç tarihi geçersiz');
    if (TK.gecerliTarih(g2) && g2 < g) return toast('Bitiş, başlangıçtan önce olamaz');
    let b = $$('#tkB').value, b2 = $$('#tkB2').value;
    if (!tumV) { if (!TK.gecerliSaat(b)) return toast('Başlangıç saati geçersiz'); if (g2 === g && TK.gecerliSaat(b2) && dk(b2) < dk(b)) return toast('Bitiş saati, başlangıçtan önce olamaz'); }
    const s = $$('#tkTekS').value;
    const tek = s ? { s, n: Math.max(1, Math.min(99, +$$('#tkTekN').value || 1)) } : null;
    if (tek && s === 'h') { const gun = [...$('#modal').querySelectorAll('#tkGunler input:checked')].map(i => +i.value); if (gun.length) tek.gun = gun; }
    if (tek && TK.gecerliTarih($$('#tkTekBit').value)) { if ($$('#tkTekBit').value < g) return toast('Tekrar bitişi, başlangıçtan önce olamaz'); tek.bit = $$('#tkTekBit').value; }
    const hv = $$('#tkHat').value;
    const form = { ad: $$('#tkAd').value, g, g2, tum: tumV, b, b2, renk: +(($('#modal').querySelector('input[name=tkRenk]:checked') || {}).value ?? 5), yer: $$('#tkYer').value, not: $$('#tkNot').value, hat: hv === '' ? undefined : +hv };
    let ham = { ...form, id: e ? e.id : undefined, uid: e?.uid, tek, ist: e?.ist };
    if (e && e.tek) {   // seriyi, düzenlenen oluşumun kaymasıyla birlikte kaydır
      const kayma = dn(g) - dn(x.g);
      if (kayma) { ham.g = ds(dn(e.g) + kayma); ham.g2 = ds(dn(ham.g) + (dn(g2) - dn(g))); if (ham.tek?.bit && ham.tek.bit < ham.g) delete ham.tek.bit; ham.ist = (e.ist || []).map(i => ds(dn(i) + kayma)); }
      else { ham.g = e.g; ham.g2 = ds(dn(e.g) + (dn(g2) - dn(g))); }
    }
    const bitir = (yeniE, mesaj) => {
      if (e) TS.etk[TS.etk.indexOf(e)] = yeniE; else TS.etk.push(yeniE);
      if (yeniE.hat != null) { if ('Notification' in window && Notification.permission === 'default') { try { Notification.requestPermission(); } catch {} } yerel().bildirimIzni?.(); }
      kaydet(); closeModal(); TS.secili = g; if (TS.gor !== 'ajanda' && TS.ara === '') TS.odak = TS.gor === 'ay' ? g : TS.odak; ciz(); toast(mesaj);
    };
    if (e && e.tek) {   // tekrarlayan etkinlik: sadece bu oluşum mu, tüm seri mi?
      const seri = TK.temizle(ham), tekil = TK.temizle({ ...form, id: undefined, uid: undefined });
      if (!seri || !tekil) return toast('Etkinlik kaydedilemedi');
      $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal" aria-label="Kapat">${IC.close}</button><h3>Tekrarlayan etkinlik</h3></header>
        <div class="set-body tk-sil"><p class="muted sm">Değişiklik hangisine uygulansın?</p>
          <button class="btn" id="tkD1">Sadece ${esc(tarihYaz(x.g, false))} tarihlisi</button>
          <button class="btn primary" id="tkD2">Tüm seri</button></div></div></div>`;
      $('#tkD1').onclick = () => {
        e.ist = [...(e.ist || []), x.g];
        const kopya = TS.etk.indexOf(e); TS.etk.splice(kopya + 1, 0, tekil);
        if (tekil.hat != null) { if ('Notification' in window && Notification.permission === 'default') { try { Notification.requestPermission(); } catch {} } yerel().bildirimIzni?.(); }
        kaydet(); closeModal(); TS.secili = g; ciz(); toast('Sadece bu etkinlik değişti');
      };
      $('#tkD2').onclick = () => bitir(seri, 'Tüm seri kaydedildi');
      return;
    }
    const yeniE = TK.temizle(ham); if (!yeniE) return toast('Etkinlik kaydedilemedi');
    bitir(yeniE, e ? 'Kaydedildi' : 'Etkinlik eklendi');
  };
  if (!yeni) {
    $$('#tkSil').onclick = () => sil(e, x.g);
    $$('#tkIcs').onclick = () => { indirDosya((e.ad.replace(/[^\p{L}\p{N} _-]/gu, '').trim().slice(0, 60) || 'Etkinlik') + '.ics', TK.icsYaz([e]), 'text/calendar'); toast('Etkinlik dosyası hazırlandı'); };
    $$('#tkKopya').onclick = () => { const k = { ...e, id: undefined, uid: undefined, ad: e.ad + ' (kopya)' }; const y = TK.temizle(k); TS.etk.push(y); kaydet(); closeModal(); ciz(); toast('Kopyalandı', [['Aç', () => olayAc({ id: y.id, g: y.g })]]); };
  }
}
function sil(e, g) {
  const yedek = JSON.parse(JSON.stringify(TS.etk));
  const geri = () => { TS.etk = yedek; kaydet(); ciz(); };
  if (!e.tek) { TS.etk = TS.etk.filter(k => k !== e); kaydet(); closeModal(); ciz(); toast('Silindi', [['Geri al', geri]], 6000); return; }
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal" aria-label="Kapat">${IC.close}</button><h3>Tekrarlayan etkinlik</h3></header>
    <div class="set-body tk-sil"><p class="muted sm">“${esc(e.ad)}” her ${{ g: 'gün', h: 'hafta', a: 'ay', y: 'yıl' }[e.tek.s]} tekrarlanıyor. Hangisi silinsin?</p>
      <button class="btn" id="tkS1">Sadece ${esc(tarihYaz(g, false))} tarihlisi</button>
      <button class="btn" id="tkS2" ${g === e.g ? 'hidden' : ''}>Bu ve sonrakiler</button>
      <button class="btn tehlike" id="tkS3">Tüm seri</button></div></div></div>`;
  $('#tkS1').onclick = () => { e.ist = [...(e.ist || []), g]; bitir('Bu etkinlik silindi'); };
  $('#tkS2').onclick = () => { e.tek.bit = gunEkle(g, -1); bitir('Bu ve sonrakiler silindi'); };
  $('#tkS3').onclick = () => { TS.etk = TS.etk.filter(k => k !== e); bitir('Seri silindi'); };
  function bitir(m) { kaydet(); closeModal(); ciz(); toast(m, [['Geri al', geri]], 6000); }
}

/* ═════════ Hatırlatmalar ═════════ */
function tik() {
  const t = Date.now(), b = bugun();
  simdiTazele();
  if (TS.sonGun && TS.sonGun !== b) { TS.sonGun = b; ciz(); } TS.sonGun = b;
  for (const h of TK.hatirlatmalar(TS.etk, gunEkle(b, -1), gunEkle(b, 1))) {
    if (h.zaman > t || t - h.zaman > 10 * 60000 || TS.gorulen[h.anahtar]) continue;
    TS.gorulen[h.anahtar] = t;
    const e = h.o.e, ne = h.o.tum ? 'Bugün' : h.o.b, bas = e.ad, govde = `${ne}${e.yer ? ' · ' + e.yer : ''}`;
    toast(`<b>${esc(bas)}</b> · ${esc(govde)}`, [['Aç', () => olayAc({ id: e.id, g: h.o.g })]], 15000);
    if (document.hidden && 'Notification' in window && Notification.permission === 'granted') { try { new Notification(bas, { body: govde, tag: h.anahtar }); } catch {} }
  }
  for (const k of Object.keys(TS.gorulen)) if (t - TS.gorulen[k] > 3 * 864e5) delete TS.gorulen[k];
  store.set('takvimGoruldu', TS.gorulen);
}
let planT = 0;
function bildirimPlanla() {
  clearTimeout(planT);
  planT = setTimeout(() => {
    const Y = yerel(); if (typeof Y.bildirimPlanla !== 'function') return;
    const b = bugun(), simdi = Date.now();
    const liste = TK.hatirlatmalar(TS.etk, b, gunEkle(b, 30)).filter(h => h.zaman > simdi + 1000).slice(0, 60)
      .map(h => ({ zaman: h.zaman, baslik: h.o.e.ad, metin: (h.o.tum ? 'Bugün' : h.o.b) + (h.o.e.yer ? ' · ' + h.o.e.yer : ''), tur: 'takvim' }));
    Y.bildirimPlanla(liste);
  }, 300);
}

/* ═════════ Ayarlar, yedek, dışa/içe aktarma ═════════ */
function ayarAc() {
  const t = store.get('theme', 'light');
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet settings"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal" aria-label="Kapat">${IC.close}</button><h3>Ayarlar</h3></header>
    <div class="set-body">
      <section><h4>Görünüm</h4><div class="seg yon-seg">${[['light', 'Cam'], ['dark', 'Koyu'], ['auto', 'Otomatik'], ['flat', 'Düz']].map(([k, n]) => `<button class="${t === k ? 'on' : ''}" data-action="tk-tema" data-t="${k}">${n}</button>`).join('')}</div></section>
      <section><h4>Takvim</h4>
        <div class="set-row"><div><b>Resmî tatilleri göster</b><span>Sabit tatiller her yıl; dinî bayramlar 2040'a kadar (2027'den sonrası tahmini).</span></div><label class="tk-anahtar"><input type="checkbox" id="tkTatil" ${TS.ayar.tatil ? 'checked' : ''}><i></i></label></div>
        <div class="set-row"><div><b>Hafta Pazar'dan başlasın</b><span>Kapalıyken hafta Pazartesi başlar.</span></div><label class="tk-anahtar"><input type="checkbox" id="tkPazar" ${TS.ayar.pazar ? 'checked' : ''}><i></i></label></div>
        <div class="set-row"><div><b>Yeni etkinlikte hatırlatma</b><span>Her yeni etkinliğe ön tanımlı hatırlatma.</span></div><select id="tkVarHat" class="tk-sel">${HAT.map(([k, n]) => `<option value="${k ?? ''}" ${TS.ayar.hat === k ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
      </section>
      <section><h4>Verilerin</h4>
        <div class="set-row"><div><b>Bu cihazda</b><span>${TS.etk.length} etkinlik ve ${TS.gorev.length} görev yalnızca bu cihazda saklanır; hiçbir yere gönderilmez.</span></div></div>
        <div class="set-row"><div><b>Yazdır ya da PDF yap</b><span>Şu an açık olan görünümü (ay, hafta…) yazdırır.</span></div><button class="btn sm" data-action="tk-yazdir">Yazdır</button></div>
        <div class="set-row"><div><b>Takvim dosyası (.ics)</b><span>Google Takvim, Outlook, Apple Takvim ile uyumlu.</span></div><button class="btn sm" data-action="tk-ics-al">${IC.indir}Dışa aktar</button></div>
        <div class="set-row"><div><b>Yedek dosyası (.json)</b><span>Etkinliklerin ve görevlerin tamamını tek dosyada saklar.</span></div><button class="btn sm" data-action="tk-yedek">${IC.indir}Yedek al</button></div>
        <div class="set-row"><div><b>İçe aktar</b><span>.ics ya da yedek dosyası. Aynı etkinlik iki kez eklenmez.</span></div><button class="btn sm" data-action="tk-ice">${IC.yukle}Dosya seç</button></div>
        <div class="set-row"><div><b>Tüm etkinlikleri sil</b><span>Geri alınamaz; önce yedek al.</span></div><button class="btn sm tehlike" data-action="tk-hepsini-sil">Sil</button></div>
        <input type="file" id="tkDosya" accept=".ics,.json,text/calendar,application/json" hidden>
      </section>
      <section><h4>Uygulama</h4>${typeof aboutRow === 'function' ? aboutRow() : ''}</section>
    </div></div></div>`;
  $('#tkTatil').onchange = e => { TS.ayar.tatil = e.target.checked; ayarKaydet(); ciz(); };
  $('#tkPazar').onchange = e => { TS.ayar.pazar = e.target.checked; ayarKaydet(); TS.kay = null; ciz(); };
  $('#tkVarHat').onchange = e => { TS.ayar.hat = e.target.value === '' ? null : +e.target.value; ayarKaydet(); };
  $('#tkDosya').onchange = async e => { const f = e.target.files[0]; e.target.value = ''; if (f) await iceAl(f); };
}
function indirDosya(ad, icerik, tur) {
  const b = new Blob([icerik], { type: tur }), a = document.createElement('a');
  a.href = URL.createObjectURL(b); a.download = ad; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 8000);
}
async function iceAl(f) {
  if (f.size > 8e6) return toast('Dosya çok büyük (en fazla 8 MB)');
  let yazi; try { yazi = await f.text(); } catch { return toast('Dosya okunamadı'); }
  let yeniler = [], atlanan = 0, sade = 0, gorevler = [];
  if (yazi.trimStart().startsWith('{')) {
    let v; try { v = JSON.parse(yazi); } catch { return toast('Dosya okunamadı'); }
    if (v?.suha !== 'takvim' || !Array.isArray(v.etkinlikler)) return toast('Bu bir Takvim yedeği değil');
    yeniler = v.etkinlikler.slice(0, 20000).map(TK.temizle).filter(Boolean); atlanan = v.etkinlikler.length - yeniler.length;
    if (Array.isArray(v.gorevler)) gorevler = v.gorevler.slice(0, 5000).map(TK.gorevTemizle).filter(Boolean);
  } else {
    if (!/BEGIN:VCALENDAR/i.test(yazi)) return toast('Bu bir takvim dosyası değil');
    const r = TK.icsOku(yazi); yeniler = r.etkinlikler; atlanan = r.atlanan; sade = r.sade;
  }
  const var_ = new Set(); TS.etk.forEach(k => { var_.add(k.id); if (k.uid) var_.add(k.uid); var_.add(k.id + '@suha-takvim'); });
  let eklenen = 0, zatenVar = 0;
  for (const e of yeniler) {
    if (var_.has(e.id) || (e.uid && var_.has(e.uid))) { zatenVar++; continue; }
    if (TS.etk.length >= 20000) { atlanan++; continue; }
    TS.etk.push(e); eklenen++; var_.add(e.id); if (e.uid) var_.add(e.uid);
  }
  let gEklenen = 0; const gvar = new Set(TS.gorev.map(t => t.id));
  for (const t of gorevler) if (!gvar.has(t.id) && TS.gorev.length < 5000) { TS.gorev.push(t); gEklenen++; }
  if (gEklenen) gorevKaydet();
  kaydet(); closeModal(); ciz();
  toast(`${eklenen} etkinlik${gEklenen ? ` ve ${gEklenen} görev` : ''} eklendi${zatenVar ? `, ${zatenVar} zaten vardı` : ''}${atlanan ? `, ${atlanan} atlandı` : ''}${sade ? ` · ${sade} tekrar kuralı sadeleştirildi` : ''}`, [], 7000);
}

/* ═════════ Olaylar ═════════ */
Object.assign(ACTIONS, {
  'tk-gor': el => { TS.gor = el.dataset.k; store.set('takvimGor', TS.gor); TS.ara = ''; TS.araAcik = false; const i = $('#tkAra'); if (i) i.value = ''; TS.kay = null; ciz(); },
  'tk-tarih': () => { const i = $('#tkTarih'); i.value = TS.odak; try { i.showPicker(); } catch { i.focus(); i.click(); } },
  'tk-yazdir': () => { closeModal(); setTimeout(() => window.print(), 150); },
  'tk-geri': () => git(-1), 'tk-ileri': () => git(1),
  'tk-yg': el => { TS.odak = TS.secili = el.dataset.g; TS.gor = 'ay'; store.set('takvimGor', 'ay'); TS.kay = null; ciz(); },
  'tk-yay': el => { TS.odak = TS.secili = el.dataset.g; TS.gor = 'ay'; store.set('takvimGor', 'ay'); ciz(); },
  'tk-g-ac': el => gorevAc(el.dataset.id),
  'tk-g-bitir': el => { const t = TS.gorev.find(x => x.id === el.dataset.id); if (!t) return; t.bitti = !t.bitti; if (t.bitti) t.bz = Date.now(); else delete t.bz; gorevKaydet(); ciz(); },
  'tk-g-bitenler': () => { gBitmisAcik = !gBitmisAcik; ciz(); },
  'tk-g-temizle': () => { const n = TS.gorev.filter(t => t.bitti).length; if (!n || !confirm(`${n} tamamlanan görev silinsin mi?`)) return; TS.gorev = TS.gorev.filter(t => !t.bitti); gorevKaydet(); ciz(); },
  'tk-bugun': () => { TS.odak = TS.secili = bugun(); TS.kay = null; ciz(); },
  'tk-yeni': () => TS.gor === 'gorev' && !TS.ara ? ($('#tkGEkle') ? $('#tkGEkle').focus() : gorevAc()) : olayAc({ yeni: true, g: TS.gor === 'ay' || TS.gor === 'ajanda' ? (TS.gor === 'ay' ? TS.secili : bugun()) : (TS.gor === 'gun' ? TS.odak : bugun()) }),
  'tk-yeni-gun': el => olayAc({ yeni: true, g: el.dataset.g }),
  'tk-ac': el => olayAc({ id: el.dataset.id, g: el.dataset.g }),
  'tk-hucre': el => {
    const g = el.dataset.g;
    if (dar()) { TS.secili = g; if (g.slice(0, 7) !== TS.odak.slice(0, 7)) TS.odak = g; ciz(); }
    else if (panelModu()) { TS.secili = g; document.querySelectorAll('.tk-hucre.secili').forEach(x => x.classList.remove('secili')); el.classList.add('secili'); const y = $('.tk-yan'); if (y) y.innerHTML = gunPaneli(g, {}, {}); }
    else { TS.secili = g; olayAc({ yeni: true, g, tum: true }); }
  },
  'tk-gune': el => { TS.odak = el.dataset.g; TS.gor = 'gun'; store.set('takvimGor', 'gun'); TS.kay = null; ciz(); },
  'tk-gune2': el => { TS.odak = el.dataset.g; TS.gor = 'gun'; TS.kay = null; ciz(); },
  'tk-ara': () => { TS.araAcik = !TS.araAcik; if (!TS.araAcik) { TS.ara = ''; $('#tkAra').value = ''; } ciz(); if (TS.araAcik) setTimeout(() => $('#tkAra')?.focus(), 30); },
  'tk-ayar': () => ayarAc(), settings: () => ayarAc(),
  'tk-tema': el => { store.set('theme', el.dataset.t); applyTheme(el.dataset.t); ayarAc(); },
  'tk-ics-al': () => { if (!TS.etk.length) return toast('Dışa aktarılacak etkinlik yok'); indirDosya(`Takvim ${bugun()}.ics`, TK.icsYaz(TS.etk), 'text/calendar'); toast('Takvim dosyası hazırlandı'); },
  'tk-yedek': () => { indirDosya(`Takvim yedeği ${bugun()}.json`, JSON.stringify({ suha: 'takvim', surum: 2, tarih: new Date().toISOString(), etkinlikler: TS.etk, gorevler: TS.gorev }), 'application/json'); toast('Yedek dosyası hazırlandı'); },
  'tk-ice': () => $('#tkDosya').click(),
  'tk-hepsini-sil': () => {
    if (!TS.etk.length) return toast('Silinecek etkinlik yok');
    if (!confirm(`${TS.etk.length} etkinliğin hepsi silinsin mi? Bu işlem geri alınamaz.`)) return;
    TS.etk = []; kaydet(); closeModal(); ciz(); toast('Hepsi silindi');
  }
});
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey || $('#modal').innerHTML) return;
  const t = e.target; if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;
  const k = e.key.toLowerCase();
  if (k === 't') ACTIONS['tk-bugun']();
  else if (k === 'n') { e.preventDefault(); ACTIONS['tk-yeni'](); }
  else if (k === '/') { e.preventDefault(); if (!TS.araAcik) ACTIONS['tk-ara'](); else $('#tkAra').focus(); }
  else if (k === 'arrowleft' || k === 'p') git(-1);
  else if (k === 'arrowright') git(1);
  else if ('123456'.includes(k) && k) ACTIONS['tk-gor']({ dataset: { k: GORUNUMLER[+k - 1] } });
});
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { tik(); ciz(); } });
window.matchMedia('(max-width: 700px)').addEventListener?.('change', () => ciz());
window.matchMedia('(min-width: 1000px)').addEventListener?.('change', () => ciz());
