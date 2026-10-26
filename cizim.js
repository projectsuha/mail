/* ───────────── Çizim (arayüz) ───────────── */
(() => {
'use strict';
const { P, mes, M } = CZ;
const IK = {
  sec: svg('<path d="m5 3 14 8-6 2-2 6z"/>'), el: svg('<path d="M8 12V6a1.5 1.5 0 0 1 3 0v5m0-1V4.5a1.5 1.5 0 0 1 3 0V11m0-4a1.5 1.5 0 0 1 3 0v6c0 4-2 7-6 7-3 0-4-1.5-6-4l-1.5-2.5a1.4 1.4 0 0 1 2.3-1.5L8 14"/>'),
  cizgi: svg('<path d="M4 20 20 4"/><circle cx="4" cy="20" r="1.5"/><circle cx="20" cy="4" r="1.5"/>'), coklu: svg('<path d="M3 18 9 7l6 8 6-11"/>'),
  dik: svg('<rect x="4" y="6" width="16" height="12" rx="1"/>'), daire: svg('<circle cx="12" cy="12" r="8"/><path d="M12 12h8"/>'), yay: svg('<path d="M4 18a10 10 0 0 1 16 0"/><circle cx="4" cy="18" r="1.3"/><circle cx="20" cy="18" r="1.3"/>'),
  olcu: svg('<path d="M4 17h16M4 13v8M20 13v8M8 9h8m-8 0 2-2m-2 2 2 2m6-2-2-2m2 2-2 2"/>'), yazi: svg('<path d="M5 6V4h14v2M12 4v16M9 20h6"/>'),
  tasi: svg('<path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3"/>'), kopya: svg('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>'),
  olcekle: svg('<rect x="3" y="11" width="10" height="10" rx="1"/><path d="M13 11 21 3m0 0h-5m5 0v5"/>'), dizi: svg('<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="3" y="15" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/>'),
  don: svg('<path d="M20 4v5h-5"/><path d="M19.4 14a8 8 0 1 1-2-7.7L20 9"/>'), ayna: svg('<path d="M12 3v18M8 7 3 17h5zM16 7l5 10h-5z"/>'),
  ofset: svg('<path d="M4 8h16M4 16h16" /><path d="M12 11v2"/>'), kirp: svg('<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8 7.5 20 18M8 16.5 20 6"/>'), uzat: svg('<path d="M3 12h13m0 0-4-4m4 4-4 4M21 5v14"/>'),
  parcala: svg('<path d="M4 8h5M15 8h5M4 16h5M15 16h5M12 5v14"/>'), sil: svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
  duvar: svg('<path d="M3 8h18M3 14h18M3 8v6M21 8v6M7 8v6M11 8v6M15 8v6"/>'), alan: svg('<path d="m5 18 3-12 11 3-2 9z"/><path d="M10 12h5"/>'), oto: svg('<path d="M4 16h16M4 12v8M20 12v8M9 20v-4M15 20v-4"/><path d="m9 7 3-3 3 3"/>'),
  dolgu: svg('<path d="m6 11 6-7 7 7-6 7a2 2 0 0 1-3 0z"/><path d="M4 11h15"/><path d="M20 15c1 1.6 1.6 2.6 1.6 3.4a1.6 1.6 0 0 1-3.2 0c0-.8.6-1.8 1.6-3.4z"/>'),
  oda: svg('<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M7 11h6M7 14h9"/>'), ok: svg('<path d="M4 20 19 5M19 5h-7M19 5v7"/>'),
  cap: svg('<circle cx="12" cy="12" r="8"/><path d="M5 19 19 5"/>'), aci: svg('<path d="M4 19h16M4 19 17 6"/><path d="M11 19a7 7 0 0 0-2-5"/>'), kesit: svg('<path d="M3 12h4m3 0h4m3 0h4"/><path d="M5 6v12M19 6v12M5 6 3 8M19 6l2 2"/>'), yapistir: svg('<rect x="7" y="4" width="12" height="16" rx="2"/><path d="M10 4V3h6v1M10 10h6M10 14h6"/>'),
  tarama: svg('<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 12 12 4M4 20 20 4M12 20 20 12"/>'), kose: svg('<path d="M5 4v9a7 7 0 0 0 7 7h8"/>'), blok: svg('<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><path d="M16.5 13v7M13 16.5h7"/>'),
  geri: svg('<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>'), ileri: svg('<path d="m15 14 5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>'),
  dosya: svg('<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/>'), katman: svg('<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>'), sigdir: svg('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'), tamam: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>')
};
const GRUP = [['sec', 'Seç'], ['el', 'El'], '-', ['cizgi', 'Çizgi'], ['coklu', 'Çoklu'], ['dik', 'Dikdörtgen'], ['daire', 'Daire'], ['yay', 'Yay'], ['duvar', 'Duvar'], '-', ['olcu', 'Ölçü'], ['oto', 'Oto ölçü'], ['cap', 'Çap / R'], ['aci', 'Açı'], ['yazi', 'Yazı'], ['alan', 'Alan'], ['oda', 'Oda adı'], ['ok', 'Ok'], ['kesit', 'Kesit'], '-', ['blok', 'Semboller'], ['tarama', 'Tarama'], ['dolgu', 'Boya'], '-', ['tasi', 'Taşı'], ['kopya', 'Kopyala'], ['don', 'Döndür'], ['ayna', 'Aynala'], ['olcekle', 'Ölçekle'], ['dizi', 'Dizi'], ['ofset', 'Ofset'], ['kirp', 'Kırp'], ['uzat', 'Uzat'], ['parcala', 'Parçala'], ['kose', 'Köşe'], ['yapistir', 'Yapıştır'], '-', ['sil', 'Sil']];
const SECIM_ISTEYEN = ['tasi', 'kopya', 'don', 'ayna', 'olcekle', 'dizi'];
const yeniBelge = () => ({ v: 1, ad: 'Adsız çizim', olcek: 100, cur: 0, e: [], katlar: [{ ad: 'Duvar', r: '#25302b', w: .5, v: 1, lt: 0 }, { ad: 'Mobilya', r: '#9a5b1f', w: .25, v: 1, lt: 0 }, { ad: 'Ölçü', r: '#c2362b', w: .18, v: 1, lt: 0 }, { ad: 'Yazı', r: '#1b7fa6', w: .18, v: 1, lt: 0 }], antet: { goster: false, proje: '', cizen: '' } });
const S = { capTur: 'D', pano: null, dolguR: '#cfe3f2', dolguA: .55, dolguSil: false, dz: { tur: 'dik', c0: 3, r0: 2, dx: 1000, dy: 1000, n: 6, ac: 360, c: null }, D: yeniBelge(), id: null, v: { x: -1000, y: -1000, s: .1 }, tool: 'cizgi', pts: [], sel: new Set(), ortho: true, yak: true, und: [], red: [], imlec: null, ofd: 200, ofE: -1, aslini: true, dokunuldu: false, kutu: null, tOff: 0, tarTur: 'capraz', tarAr: 0, duvK: 200, koseTur: 'yuvarla', koseD: 200, koseE: -1, koseTik: null, otoHepsi: true, otoYon: 1, otoMes: 0, alanSon: null, alanNokta: false, blok: null, blokP: [], duvarYap: true, bRot: 0, bAyna: false, alt: null, altP: null };
const ts = () => 2.5 * S.D.olcek, tk = () => 1.5 * S.D.olcek;
const cv = () => $('#czCv');
let x, W = 0, H = 0, dpr = 1, kaydetZaman = 0;

/* ═════════ Durum yardımcıları ═════════ */
const goruyor = e => S.D.katlar[e.k]?.v;
const kilitli = e => !!S.D.katlar[e.k]?.kilit;
const anlik = () => JSON.stringify({ e: S.D.e, katlar: S.D.katlar, cur: S.D.cur });
function geriKaydet() { S.und.push(anlik()); if (S.und.length > 100) S.und.shift(); S.red = []; taslakZamanla(); }
function uygula(js) { const o = JSON.parse(js); S.D.e = o.e; S.D.katlar = o.katlar; S.D.cur = o.cur; S.sel.clear(); S.pts = []; }
function geriAl() { if (S.pts.length) { S.pts.pop(); komCiz(); ciz(); return; } const j = S.und.pop(); if (!j) return; S.red.push(anlik()); uygula(j); hepsiGuncelle(); }
function ileriAl() { const j = S.red.pop(); if (!j) return; S.und.push(anlik()); uygula(j); hepsiGuncelle(); }
function ekle(e) { geriKaydet(); S.D.e.push(e); ciz(); ozelCiz(); }
function hepsiGuncelle() { komCiz(); katCiz(); ozelCiz(); ciz(); taslakZamanla(); }
function taslakZamanla() { clearTimeout(kaydetZaman); kaydetZaman = setTimeout(() => { try { localStorage.setItem('cz-son', JSON.stringify({ ...S.D, id: S.id })); } catch { /* dolu ya da kapalı */ } }, 700); }
const yeniKat = e => { e.k = S.D.cur; return e; };
const sayiBicim = v => String(Math.round(v * 10) / 10).replace('.', ',');

/* ═════════ Görünüm ═════════ */
const ek = p => P((p.x - S.v.x) * S.v.s, H - (p.y - S.v.y) * S.v.s), dn = (sx, sy) => P(sx / S.v.s + S.v.x, (H - sy) / S.v.s + S.v.y);
function sigdir() {
  const s = CZ.sinirHepsi(S.D, ts()); if (!s) { S.v = { x: -W / .1 / 2 + 3000, y: -H / .1 / 2 + 2000, s: .1 }; return; }
  const pay = ts() * 3, a = s.x0 - pay, b = s.y0 - pay, c = s.x1 + pay, d = s.y1 + pay, k = Math.min(W / (c - a), H / (d - b)); S.v.s = Math.min(5, Math.max(.0005, k)); S.v.x = a - (W / S.v.s - (c - a)) / 2; S.v.y = b - (H / S.v.s - (d - b)) / 2;
}
function boyut() { const a = $('#czAlan'); if (!a) return; const r = a.getBoundingClientRect(); dpr = devicePixelRatio || 1; W = r.width; H = r.height; const c = cv(); c.width = W * dpr; c.height = H * dpr; x = c.getContext('2d'); if (!S.dokunuldu) sigdir(); ciz(); }

/* ═════════ Çizim ═════════ */
function yolCiz(c, e, v, hv) {
  const f = p => P((p.x - v.x) * v.s, hv - (p.y - v.y) * v.s);
  if (e.t === 'l') { const a = f(e.a), b = f(e.b); c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); }
  else if (e.t === 'p') { c.beginPath(); e.pts.forEach((q, i) => { const s = f(q); i ? c.lineTo(s.x, s.y) : c.moveTo(s.x, s.y); }); if (e.kapali) c.closePath(); c.stroke(); }
  else if (e.t === 'c') { const q = f(e.c); c.beginPath(); c.arc(q.x, q.y, e.r * v.s, 0, 7); c.stroke(); }
  else if (e.t === 'a') { const q = f(e.c); c.beginPath(); c.arc(q.x, q.y, e.r * v.s, -e.a0, -e.a1, true); c.stroke(); }
  else if (e.t === 'd') { const g = CZ.olcuGeo(e, ts(), tk()); c.beginPath(); for (const [a, b] of g.cizgiler) { const s1 = f(a), s2 = f(b); c.moveTo(s1.x, s1.y); c.lineTo(s2.x, s2.y); } c.stroke(); yaziCiz(c, g.yazi.p, g.yazi.s, g.yazi.rot, g.yazi.t, v, hv, 'center'); }
  else if (e.t === 'x') yaziCiz(c, e.p, e.s, e.rot, e.txt, v, hv, 'left');
}
function yaziCiz(c, p, s, rot, t, v, hv, hiza) { const px = s * v.s; if (px < 2) return; const q = P((p.x - v.x) * v.s, hv - (p.y - v.y) * v.s); c.save(); c.translate(q.x, q.y); c.rotate(-rot); c.font = `${px}px system-ui, "Segoe UI", sans-serif`; c.textAlign = hiza; c.textBaseline = 'alphabetic'; c.fillText(t, 0, 0); c.restore(); }
function boya(c, w, h, v, ekran) {
  c.setTransform(ekran ? dpr : 1, 0, 0, ekran ? dpr : 1, 0, 0); c.fillStyle = ekran ? '#f5f2e9' : '#fff'; c.fillRect(0, 0, w, h);
  if (ekran) {
    const s = v.s, adim = s > .05 ? 100 : s > .02 ? 500 : s > .006 ? 1000 : 5000, ana = adim * 10, a = P(v.x, v.y), b = P(v.x + w / s, v.y + h / s);
    for (const [st, renk] of [[adim, 'rgba(60,70,60,.10)'], [ana, 'rgba(60,70,60,.22)']]) { if (st * s < 6) continue; c.strokeStyle = renk; c.lineWidth = 1; c.beginPath(); for (let gx = Math.floor(a.x / st) * st; gx <= b.x; gx += st) { const p = Math.round((gx - v.x) * s) + .5; c.moveTo(p, 0); c.lineTo(p, h); } for (let gy = Math.floor(a.y / st) * st; gy <= b.y; gy += st) { const p = Math.round(h - (gy - v.y) * s) + .5; c.moveTo(0, p); c.lineTo(w, p); } c.stroke(); }
    const o = P(-v.x * s, h + v.y * s); c.strokeStyle = 'rgba(200,60,40,.6)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(o.x - 14, o.y); c.lineTo(o.x + 14, o.y); c.moveTo(o.x, o.y - 14); c.lineTo(o.x, o.y + 14); c.stroke();
  }
  if (ekran && S.alt) { const a = S.alt, q = P((a.x - v.x) * v.s, h - (a.y + a.h - v.y) * v.s); c.globalAlpha = a.a; c.drawImage(a.img, q.x, q.y, a.w * v.s, a.h * v.s); c.globalAlpha = 1; }
  for (const dl of CZ.dolgular(S.D)) { c.globalAlpha = dl.a; c.fillStyle = dl.r; c.beginPath(); for (const r of dl.h) { r.forEach((q, i) => { const x = (q.x - v.x) * v.s, y = h - (q.y - v.y) * v.s; i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath(); } c.fill('evenodd'); } c.globalAlpha = 1;
  c.lineJoin = 'round'; c.lineCap = 'round';
  const desen = k => { const d = (CZ.LT[k.lt | 0] || []).map(q => q * S.D.olcek * v.s); return d.reduce((a, b) => a + b, 0) < 5 ? [] : d; };
  S.D.e.forEach((e, i) => {
    const k = S.D.katlar[e.k]; if (!k || !k.v) return; const sec = ekran && S.sel.has(i);
    c.strokeStyle = sec ? '#e07b00' : k.r; c.fillStyle = sec ? '#e07b00' : k.r; c.lineWidth = sec ? 3 : ekran ? 1.5 : Math.max(1.2, k.w * S.D.olcek * v.s); c.setLineDash(sec || e.t === 'd' || e.t === 'x' ? [] : desen(k)); yolCiz(c, e, v, h);
  });
  c.setLineDash([]);
  if (ekran) { c.setLineDash([6, 4]); c.strokeStyle = '#e07b00'; c.fillStyle = '#e07b00'; c.lineWidth = 1.7; for (const e of gecici()) yolCiz(c, e, v, h); c.setLineDash([]); imlecCiz(c); kutuCiz(c); }
}
function imlecCiz(c) {
  const q = S.imlec; if (!q || ['sec', 'el'].includes(S.tool)) return; const p = ek(q); c.strokeStyle = '#e07b00'; c.lineWidth = 1.6; c.setLineDash([]);
  c.beginPath(); if (q.i === 'merkez' || q.i === 'çeyrek') c.arc(p.x, p.y, 7, 0, 7); else if (q.i === 'orta') { c.moveTo(p.x - 7, p.y + 6); c.lineTo(p.x + 7, p.y + 6); c.lineTo(p.x, p.y - 7); c.closePath(); } else if (q.i === 'kesişim') { c.moveTo(p.x - 7, p.y - 7); c.lineTo(p.x + 7, p.y + 7); c.moveTo(p.x + 7, p.y - 7); c.lineTo(p.x - 7, p.y + 7); } else c.rect(p.x - 6, p.y - 6, 12, 12); c.stroke();
  c.beginPath(); c.moveTo(p.x - 14, p.y); c.lineTo(p.x - 8, p.y); c.moveTo(p.x + 8, p.y); c.lineTo(p.x + 14, p.y); c.moveTo(p.x, p.y - 14); c.lineTo(p.x, p.y - 8); c.moveTo(p.x, p.y + 8); c.lineTo(p.x, p.y + 14); c.globalAlpha = .5; c.stroke(); c.globalAlpha = 1;
  if (q.i && q.i !== 'ızgara') { c.fillStyle = '#e07b00'; c.font = '11px system-ui'; c.textAlign = 'left'; c.fillText(q.i, p.x + 12, p.y - 12); }
}
function kutuCiz(c) { const k = S.kutu; if (!k) return; const sol = k.x1 < k.x0; c.setLineDash(sol ? [5, 3] : []); c.strokeStyle = sol ? '#2e8b57' : '#1b7fa6'; c.fillStyle = sol ? 'rgba(46,139,87,.12)' : 'rgba(27,127,166,.12)'; c.lineWidth = 1.2; c.fillRect(k.x0, k.y0, k.x1 - k.x0, k.y1 - k.y0); c.strokeRect(k.x0, k.y0, k.x1 - k.x0, k.y1 - k.y0); c.setLineDash([]); }
function ciz() { if (x) boya(x, W, H, S.v, true); }

/* ═════════ Geçici (önizleme) nesneler ═════════ */
function ucNokta(a, b, c) {
  const d = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)); if (Math.abs(d) < 1e-9) return null;
  const ux = ((a.x ** 2 + a.y ** 2) * (b.y - c.y) + (b.x ** 2 + b.y ** 2) * (c.y - a.y) + (c.x ** 2 + c.y ** 2) * (a.y - b.y)) / d, uy = ((a.x ** 2 + a.y ** 2) * (c.x - b.x) + (b.x ** 2 + b.y ** 2) * (a.x - c.x) + (c.x ** 2 + c.y ** 2) * (b.x - a.x)) / d, o = P(ux, uy);
  let a0 = Math.atan2(a.y - uy, a.x - ux), a1 = Math.atan2(c.y - uy, c.x - ux); const am = Math.atan2(b.y - uy, b.x - ux), r = mes(o, a);
  const e = { t: 'a', c: o, r, a0, a1 }; if (!CZ.yayAcisinda(e, am)) { e.a0 = a1; e.a1 = a0; } return e;
}
const secVarlik = () => [...S.sel].map(i => S.D.e[i]).filter(Boolean);
function dikPoly(a, b) { return { t: 'p', pts: [P(a.x, a.y), P(b.x, a.y), P(b.x, b.y), P(a.x, b.y)], kapali: true, k: S.D.cur }; }
function olcuOfset(p, q) { const dx = p[1].x - p[0].x, dy = p[1].y - p[0].y, u = mes(p[1], p[0]) || 1; return ((q.x - p[0].x) * -dy + (q.y - p[0].y) * dx) / u; }
function gecici() {
  const t = S.tool, p = S.pts, q = S.imlec, k = S.D.cur; if (!q || !p.length && !['ofset', 'blok', 'dizi', 'yapistir'].includes(t)) return [];
  if (t === 'blok') { const r = blokHesap(q); return r ? r.e.map(e => CZ.donustur(e, r.m)) : []; }
  const son = p[p.length - 1];
  if (t === 'cizgi') return [{ t: 'l', a: son, b: q, k }];
  if (t === 'coklu') return [{ t: 'p', pts: [...p, q], k }];
  if (t === 'dik') return [dikPoly(p[0], q)];
  if (t === 'daire') return [{ t: 'c', c: p[0], r: mes(p[0], q), k }];
  if (t === 'yay') return p.length === 1 ? [{ t: 'l', a: p[0], b: q, k }] : [ucNokta(p[0], p[1], q)].filter(Boolean);
  if (t === 'duvar') { const r = CZ.duvar([...p, q], S.duvK, false); return r.hata ? [{ t: 'l', a: son, b: q, k }] : r.e.map(x => ({ ...x, k })); }
  if (t === 'alan') return [{ t: 'p', pts: [...p, q], kapali: false, k }];
  if (t === 'ok') return okCiz(p[0], q, k);
  if (t === 'kesit') return [{ t: 'l', a: p[0], b: q, k }];
  if (t === 'yapistir') return panoOnizle(q);
  if (t === 'altolcek' || t === 'alttasi') return [{ t: 'l', a: p[0], b: q, k }];
  if (t === 'olcu') return p.length === 1 ? [{ t: 'l', a: p[0], b: q, k: 2 }] : [{ t: 'd', a: p[0], b: p[1], o: olcuOfset(p, q), k: 2 }];
  if (t === 'tasi' || t === 'kopya') return secVarlik().map(e => CZ.donustur(e, M.ote(q.x - p[0].x, q.y - p[0].y)));
  if (t === 'don') { if (p.length === 1) return [{ t: 'l', a: p[0], b: q, k }]; const m = M.don(Math.atan2(q.y - p[0].y, q.x - p[0].x) - Math.atan2(p[1].y - p[0].y, p[1].x - p[0].x), p[0]); return secVarlik().map(e => CZ.donustur(e, m)); }
  if (t === 'olcekle') { if (p.length === 1) return [{ t: 'l', a: p[0], b: q, k }]; const f = mes(p[0], p[1]) > 1e-6 ? mes(p[0], q) / mes(p[0], p[1]) : 0; return f > 1e-6 ? secVarlik().map(e => CZ.donustur(e, M.olcek(f, p[0]))) : []; }
  if (t === 'dizi') return diziUret();
  if (t === 'ayna') return mes(p[0], q) < 1e-6 ? [] : [{ t: 'l', a: p[0], b: q, k }, ...secVarlik().map(e => CZ.donustur(e, M.ayna(p[0], q)))];
  return [];
}

/* ═════════ Tutma (snap) ═════════ */
function yakala(ham, son) {
  const tol = 13 / S.v.s; let en = null, eb = 1e18;
  if (S.yak) {
    const adaylar = [];
    for (const e of S.D.e) { if (!goruyor(e)) continue; const s = CZ.sinir(e, ts()); if (ham.x < s.x0 - tol || ham.x > s.x1 + tol || ham.y < s.y0 - tol || ham.y > s.y1 + tol) continue; for (const a of CZ.tutma(e)) adaylar.push(a); }
    if (S.D.e.length < 4000) for (const a of CZ.yakinKesisim(ham, tol, S.D.e.filter(goruyor))) adaylar.push(a);
    const oncelik = { 'uç': 0, 'kesişim': 0, 'merkez': .3, 'orta': .5, 'çeyrek': .7 };
    for (const a of adaylar) { const d = mes(ham, a.p) + (oncelik[a.i] || 0) * tol * .25; if (mes(ham, a.p) < tol && d < eb) { eb = d; en = { x: a.p.x, y: a.p.y, i: a.i }; } }
    if (en) return en;
  }
  let q = P(ham.x, ham.y);
  if (S.ortho && son) { if (Math.abs(q.x - son.x) > Math.abs(q.y - son.y)) q.y = son.y; else q.x = son.x; }
  if (S.yak) { const g = S.v.s > .05 ? 100 : S.v.s > .02 ? 500 : S.v.s > .006 ? 1000 : 5000; if (S.ortho && son) { if (q.y === son.y) q.x = Math.round(q.x / g) * g; else q.y = Math.round(q.y / g) * g; } else { q.x = Math.round(q.x / g) * g; q.y = Math.round(q.y / g) * g; } }
  return { x: q.x, y: q.y, i: S.yak ? 'ızgara' : '' };
}
const sonNokta = () => (['cizgi', 'coklu', 'tasi', 'kopya', 'duvar'].includes(S.tool) || (S.tool === 'olcu' && S.pts.length === 1) || (S.tool === 'ayna' && S.pts.length === 1) ? S.pts[S.pts.length - 1] : null);
const yonNokta = () => ['dik', 'daire', 'yay', 'don', 'olcekle', 'olcu'].includes(S.tool) ? S.pts[S.pts.length - 1] : sonNokta();
const enYakin = (ham, filtre = () => true) => { let en = -1, eb = 11 / S.v.s; S.D.e.forEach((e, i) => { if (!goruyor(e) || kilitli(e) || !filtre(e)) return; const d = CZ.uzak(e, ham, ts()); if (d < eb) { eb = d; en = i; } }); return en; };

/* ═════════ Araçlar ═════════ */
function arac(k, sessiz) {
  if (k === 'sil') { sil(); return; }
  if (k === 'blok' && !sessiz) { blokMenu(); return; }
  if (SECIM_ISTEYEN.includes(k) && !S.sel.size) { if (!sessiz) toast('Önce Seç aracıyla nesne seç'); k = 'sec'; }
  S.tool = k; S.pts = []; S.ofE = -1; S.koseE = -1; S.alanSon = null; S.kutu = null; if (k !== 'sec' && !SECIM_ISTEYEN.includes(k)) S.sel.clear();
  [...document.querySelectorAll('.cz-arac .d')].forEach(b => b.classList.toggle('on', b.dataset.k === k));
  const c = cv(); if (c) c.style.cursor = k === 'el' ? 'grab' : k === 'sec' ? 'default' : 'crosshair';
  komCiz(); ozelCiz(); ciz();
}
function sil() { if (!S.sel.size) return toast('Silinecek nesne seçili değil'); geriKaydet(); S.D.e = S.D.e.filter((_, i) => !S.sel.has(i)); S.sel.clear(); hepsiGuncelle(); }
function bitir(kapat) {
  if (S.tool === 'coklu' && S.pts.length > 1) { const pts = S.pts.map(q => P(q.x, q.y)); ekle(yeniKat({ t: 'p', pts, kapali: !!kapat })); }
  else if (S.tool === 'duvar' && S.pts.length > 1) { const r = CZ.duvar(S.pts, S.duvK, !!kapat); if (r.hata) toast(r.hata); else { const k = katBul('Duvar', '#25302b', .5); geriKaydet(); const bir = CZ.duvarBirlestir(r.e.map(x => ({ ...x, k })), S.D.e.map((e, i) => ({ e, i })).filter(({ e }) => e.k === k && e.t === 'p')); S.D.e = S.D.e.flatMap((e, i) => bir.degisen.has(i) ? bir.degisen.get(i) : [e]); bir.yeni.forEach(x => S.D.e.push(x)); hepsiGuncelle(); } }
  else if (S.tool === 'alan' && S.pts.length > 2) { const ol = CZ.alanOlc(S.pts.map(q => P(q.x, q.y))); S.alanSon = ol; toast(alanMetin(ol)); }
  S.pts = []; komCiz(); ciz();
}
const alanMetin = ol => `Alan ${sayiBicim(ol.alan / 1e6)} m² · Çevre ${sayiBicim(ol.cevre / 1000)} m`;
function katBul(ad, r, w) { let i = S.D.katlar.findIndex(k => k.ad.toLowerCase() === ad.toLowerCase()); if (i < 0) { S.D.katlar.push({ ad, r, w, v: 1, lt: 0 }); i = S.D.katlar.length - 1; katCiz(); } S.D.katlar[i].v = 1; return i; }
const blokMat = q => M.carp(M.ote(q.x, q.y), M.carp(M.don(S.bRot, P(0, 0)), S.bAyna ? [-1, 0, 0, 1, 0, 0] : [1, 0, 0, 1, 0, 0]));
// Dokunulan yerdeki kapalı bölge: kapalı şekil ya da duvarlarla çevrili oda (küçük olan seçilir)
function bolgeAl(ham) {
  const b = CZ.bolgeBul(S.D.e, ham, e => goruyor(e) && !e.wr), o = CZ.odaBul(S.D.e, ham, odaKat); if (o && o.hata) return o;
  const ab = b ? Math.abs(CZ.halkaAlan(b.dis)) : Infinity, ao = o ? Math.abs(CZ.halkaAlan(o.dis)) : Infinity;
  if (!b && !o) return null; return ab <= ao ? { ...b, oda: false } : { dis: o.dis, icler: o.icler, oda: true };
}
const odaKat = e => duvarKat(e) || (goruyor(e) && /kap[ıi]|pencere/i.test(S.D.katlar[e.k]?.ad || '') && (e.t === 'l' || e.t === 'p'));
const duvarKat = e => goruyor(e) && /duvar/i.test(S.D.katlar[e.k]?.ad || '') && (e.t === 'l' || e.t === 'p');
// Sembolün konumu ve dönüşü. Kapı/pencere yakındaki duvara oturur (duvar yönüne döner, duvar kalınlığını alır).
function blokHesap(q) {
  const b = S.blok; if (!b) return null; let kal = 200, snap = null;
  if (b.duvar && S.duvarYap) { snap = CZ.duvarBul(S.D.e.map((e, i) => ({ e, i })).filter(({ e }) => duvarKat(e)), q, 500); if (snap && snap.kal > 0) kal = snap.kal; }
  const e = b.uret ? b.uret(...S.blokP, kal) : b.e; let m;
  if (snap) { const yan = (q.x - snap.merkez.x) * -Math.sin(snap.ang) + (q.y - snap.merkez.y) * Math.cos(snap.ang); m = M.carp(M.ote(snap.merkez.x, snap.merkez.y), M.carp(M.don(snap.ang, P(0, 0)), [S.bAyna ? -1 : 1, 0, 0, yan < 0 ? -1 : 1, 0, 0])); }
  else m = blokMat(q);
  return { e, m, snap, kal };
}
function blokKoy(pos) {
  const b = S.blok, r = blokHesap(pos); if (!b || !r) return; const eslem = b.katlar.map(k => katBul(k.ad, k.r, k.w)); geriKaydet();
  if (r.snap) { const kes = CZ.duvarKes(S.D.e, duvarKat, r.snap.merkez, r.snap.ang, S.blokP[0] || 900, r.kal); if (kes.sil.size) { S.D.e = S.D.e.filter((_, i) => !kes.sil.has(i)).concat(kes.ekle); toast('Duvarda açıklık açıldı'); } }
  for (const e of r.e) { const n = CZ.donustur(e, r.m); n.k = eslem[Math.min(Math.max(0, e.k | 0), eslem.length - 1)]; S.D.e.push(n); } hepsiGuncelle();
}
// Dizi: seçili nesneleri çoğaltır (orijinal yerinde kalır, kopyalar eklenir)
function diziMatrisler() {
  const z = S.dz, ms = [];
  if (z.tur === 'dik') { for (let r = 0; r < z.r0; r++) for (let c = 0; c < z.c0; c++) if (r || c) ms.push(M.ote(c * z.dx, r * z.dy)); }
  else if (z.c) { const adim = (Math.abs(z.ac) >= 360 ? 360 / z.n : z.ac / Math.max(1, z.n - 1)) * Math.sign(z.ac || 1) * Math.PI / 180; for (let i = 1; i < z.n; i++) ms.push(M.don(adim * i, z.c)); }
  return ms;
}
function diziUret() { if (!S.sel.size) return []; const ms = diziMatrisler(); if (ms.length * S.sel.size > 4000) return []; return ms.flatMap(m => secVarlik().map(e => CZ.donustur(e, m))); }
function diziUygula() {
  if (!S.sel.size) return toast('Önce nesne seç'); if (S.dz.tur === 'dair' && !S.dz.c) return toast('Önce dönme merkezine dokun');
  const ms = diziMatrisler(); if (!ms.length) return toast('Çoğaltılacak kopya yok'); if (ms.length * S.sel.size > 4000) return toast('Dizi çok büyük (en fazla 4000 nesne)');
  geriKaydet(); const yeni = ms.flatMap(m => secVarlik().map(e => CZ.donustur(e, m))); S.D.e.push(...yeni); hepsiGuncelle(); toast(`${yeni.length} kopya eklendi`); S.dz.c = null; arac('sec', true);
}
function uygulaDonusum(m, kopya) {
  geriKaydet(); const yeni = secVarlik().map(e => CZ.donustur(e, m));
  if (kopya) { const bas = S.D.e.length; yeni.forEach(e => S.D.e.push(e)); void bas; }
  else { let j = 0; for (const i of [...S.sel]) S.D.e[i] = yeni[j++]; }
  hepsiGuncelle();
}
function tikNokta(q, ham) {
  const t = S.tool, p = S.pts;
  if (t === 'cizgi') { p.push(P(q.x, q.y)); if (p.length > 1) { ekle(yeniKat({ t: 'l', a: p[p.length - 2], b: p[p.length - 1] })); } }
  else if (t === 'coklu') p.push(P(q.x, q.y));
  else if (t === 'dik') { p.push(P(q.x, q.y)); if (p.length === 2) { ekle(yeniKat(dikPoly(p[0], p[1]))); S.pts = []; } }
  else if (t === 'daire') { p.push(P(q.x, q.y)); if (p.length === 2) { const r = mes(p[0], p[1]); if (r > 1e-6) ekle(yeniKat({ t: 'c', c: p[0], r })); S.pts = []; } }
  else if (t === 'yay') { p.push(P(q.x, q.y)); if (p.length === 3) { const a = ucNokta(p[0], p[1], p[2]); if (a) ekle(yeniKat(a)); else toast('Üç nokta tek doğru üzerinde'); S.pts = []; } }
  else if (t === 'olcu') { p.push(P(q.x, q.y)); if (p.length === 3) { ekle({ t: 'd', a: p[0], b: p[1], o: olcuOfset(p, q), k: olcuKat() }); S.pts = []; } }
  else if (t === 'yazi') yaziSor(P(q.x, q.y));
  else if (t === 'tasi') { p.push(P(q.x, q.y)); if (p.length === 2) { uygulaDonusum(M.ote(p[1].x - p[0].x, p[1].y - p[0].y)); S.pts = []; arac('sec', true); } }
  else if (t === 'kopya') { p.push(P(q.x, q.y)); if (p.length === 2) { const m = M.ote(p[1].x - p[0].x, p[1].y - p[0].y); uygulaDonusum(m, true); p.pop(); } }
  else if (t === 'don') { p.push(P(q.x, q.y)); if (p.length === 3) { uygulaDonusum(M.don(Math.atan2(p[2].y - p[0].y, p[2].x - p[0].x) - Math.atan2(p[1].y - p[0].y, p[1].x - p[0].x), p[0])); S.pts = []; arac('sec', true); } }
  else if (t === 'olcekle') { p.push(P(q.x, q.y)); if (p.length === 3) { const f = mes(p[0], p[1]) > 1e-6 ? mes(p[0], p[2]) / mes(p[0], p[1]) : 0; if (f > 1e-6) uygulaDonusum(M.olcek(f, p[0])); else toast('Ölçek oranı sıfır olamaz'); S.pts = []; arac('sec', true); } }
  else if (t === 'dizi') { if (S.dz.tur === 'dair') { S.dz.c = P(q.x, q.y); toast('Dizi merkezi seçildi. Adet ve açıyı ayarlayıp Uygula\'ya bas'); komCiz(); ciz(); } }
  else if (t === 'ayna') { p.push(P(q.x, q.y)); if (p.length === 2) { if (mes(p[0], p[1]) > 1e-6) uygulaDonusum(M.ayna(p[0], p[1]), S.aslini); S.pts = []; arac('sec', true); } }
  else if (t === 'ofset') {
    if (S.ofE < 0) { const i = enYakin(ham, e => ['l', 'p', 'c', 'a'].includes(e.t)); if (i < 0) return toast('Ofset: çizgi, çoklu çizgi, daire ya da yay seç'); S.ofE = i; S.sel = new Set([i]); }
    else { const y = CZ.ofset(S.D.e[S.ofE], S.ofd, ham); if (!y) toast('Bu mesafe olmaz (daire çok küçülür)'); else ekle(y); S.ofE = -1; S.sel.clear(); }
  }
  else if (t === 'duvar') p.push(P(q.x, q.y));
  else if (t === 'blok') { if (S.blok) blokKoy(P(q.x, q.y)); return; }
  else if (t === 'alan') {
    if (!p.length && !S.alanNokta) { const b = bolgeAl(ham); if (b && b.hata) return toast(b.hata); if (b) { if (b.oda) { S.sel = new Set(); S.alanSon = CZ.alanOlc({ t: 'p', pts: b.dis, kapali: true }); const dl = b.icler.reduce((a, h) => a + Math.abs(CZ.halkaAlan(h)), 0); if (dl) S.alanSon = { ...S.alanSon, alan: S.alanSon.alan - dl }; } else { S.sel = new Set([b.i]); S.alanSon = CZ.alanOlc(S.D.e[b.i]); } toast(alanMetin(S.alanSon)); komCiz(); ozelCiz(); ciz(); return; } }
    p.push(P(q.x, q.y)); S.alanSon = null;
  }
  else if (t === 'cap') {
    const i = enYakin(ham, e => e.t === 'c' || e.t === 'a'); if (i < 0) return toast('Bir daireye ya da yaya dokun'); geriKaydet(); S.D.e.push(...capHesap(S.D.e[i], ham, S.capTur)); hepsiGuncelle(); return;
  }
  else if (t === 'aci') {
    const i = enYakin(ham, e => e.t === 'l'); if (i < 0) return toast('Bir çizgiye dokun (çoklu çizgi ve dikdörtgeni önce Parçala)'); p.push({ x: ham.x, y: ham.y, i });
    if (p.length === 2) { const r = aciHesap(S.D.e[p[0].i], S.D.e[p[1].i], p[0], p[1]); S.pts = []; if (r.hata) toast(r.hata); else { geriKaydet(); S.D.e.push(...r.e); hepsiGuncelle(); } } else { S.sel = new Set([i]); ozelCiz(); ciz(); komCiz(); }
  }
  else if (t === 'kesit') {
    p.push(P(q.x, q.y)); if (p.length === 2) { geriKaydet(); const n = S.D.e.filter(e => e.t === 'x' && /^[A-Z]$/.test(e.txt) && S.D.katlar[e.k]?.ad === 'Kesit').length / 2; S.D.e.push(...kesitHesap(p[0], p[1], String.fromCharCode(65 + (Math.floor(n) % 26)))); S.pts = []; hepsiGuncelle(); toast('Kesit çizgisi eklendi (oklar sol tarafa bakar)'); }
  }
  else if (t === 'yapistir') { panoYapistir(P(q.x, q.y)); }
  else if (t === 'oda') {
    const b = bolgeAl(ham); if (b && b.hata) return toast(b.hata); if (!b) return toast('Duvarlarla çevrili odanın ya da kapalı şeklin içine dokun');
    const ol = CZ.alanOlc({ t: 'p', pts: b.dis, kapali: true }), m2 = Math.max(0, (ol.alan - b.icler.reduce((a, h) => a + Math.abs(CZ.halkaAlan(h)), 0)) / 1e6), n = S.D.e.filter(e => e.oda).length + 1;
    sayfa('Oda adı', `<div class="cz-satir"><input id="czOda" style="flex:1" maxlength="40" value="Oda ${n}" placeholder="Ör. Salon"></div><p class="cz-not">Alan: ${sayiBicim(m2)} m². Ad ve alan odanın ortasına yazı olarak eklenir; Oda tablosunda da görünür.</p><button class="btn primary" data-action="cz-oda-ekle" data-x="${ol.merkez.x}" data-y="${ol.merkez.y}" data-m="${m2}" style="width:100%">Ekle</button>`);
    setTimeout(() => { const i = $('#czOda'); if (i) { i.focus(); i.select(); } }, 80); return;
  }
  else if (t === 'ok') { p.push(P(q.x, q.y)); if (p.length === 2) { geriKaydet(); okCiz(p[0], p[1], S.D.cur).forEach(e => S.D.e.push(e)); S.pts = []; hepsiGuncelle(); toast('Ok eklendi. Yazı aracıyla açıklamasını ekleyebilirsin'); } }
  else if (t === 'dolgu') {
    if (S.dolguSil) { let n = 0; for (let i = S.D.e.length - 1; i >= 0; i--) { const e = S.D.e[i]; if (e.f && goruyor(e) && ((e.wr || [e.pts]).some(h => h && CZ.noktaIcinde(ham, h)) || (e.t === 'c' && mes(e.c, ham) < e.r))) { geriKaydet(); delete e.f; delete e.fa; n++; break; } } if (!n) toast('Boyalı bir şekle dokun'); else { ozelCiz(); ciz(); } return; }
    const b = bolgeAl(ham); if (b && b.hata) return toast(b.hata); if (!b) return toast('Kapalı bir şeklin ya da duvarlarla çevrili bir odanın içine dokun');
    geriKaydet();
    if (!b.oda) { const e = S.D.e[b.i]; e.f = S.dolguR; e.fa = S.dolguA; }
    else { const k = katBul('Dolgu', '#9aa5a0', .05); S.D.e.push({ t: 'p', pts: b.dis, kapali: true, k, f: S.dolguR, fa: S.dolguA, wr: [b.dis, ...b.icler] }); }
    hepsiGuncelle(); return;
  }
  else if (t === 'tarama') {
    const b = bolgeAl(ham); if (b && b.hata) return toast(b.hata); if (!b) return toast('Kapalı bir şeklin ya da duvarlarla çevrili bir odanın içine dokun');
    const ar = S.tarAr || 3 * S.D.olcek, acilar = ({ capraz: [45], yatay: [0], dikey: [90], ag: [45, 135] })[S.tarTur] || [45], k = katBul('Tarama', '#808080', .13), yeni = [];
    if (CZ.DESEN_AD[S.tarTur]) { const r = CZ.desen([b.dis, ...b.icler], S.tarTur, ar, k); if (r.hata) return toast(r.hata); yeni.push(...r.e); }
    else for (const a of acilar) { const r = CZ.tarama([b.dis, ...b.icler], ar, a, k); if (r.hata) return toast(r.hata); yeni.push(...r.e); }
    geriKaydet(); S.D.e.push(...yeni); hepsiGuncelle(); toast(`${yeni.length} tarama çizgisi eklendi`); return;
  }
  else if (t === 'oto') {
    const i = enYakin(ham, e => e.t === 'l' || e.t === 'p' || e.t === 'c'); if (i < 0) return toast('Ölçülecek bir çizgi, çoklu çizgi ya da daire seç');
    const e = S.D.e[i], mesafe = S.otoMes || 6 * S.D.olcek, kk = olcuKat(), yeni = [];
    if (e.t === 'c') yeni.push({ t: 'd', a: P(e.c.x - e.r, e.c.y), b: P(e.c.x + e.r, e.c.y), o: -(e.r + mesafe) * S.otoYon, k: kk });
    else {
      const par = CZ.parcalar(e), dis = e.t === 'p' && e.kapali ? -Math.sign(CZ.halkaAlan(e.pts)) || -1 : 1; let en = 0, eb = 1e18; par.forEach(([a, b], j) => { const d = CZ.noktaSeg(ham, a, b); if (d < eb) { eb = d; en = j; } });
      for (const j of (S.otoHepsi && e.t === 'p' ? par.keys() : [en])) { const [a, b] = par[j]; if (mes(a, b) > 1e-6) yeni.push({ t: 'd', a: P(a.x, a.y), b: P(b.x, b.y), o: mesafe * dis * S.otoYon, k: kk }); }
    }
    geriKaydet(); S.D.e.push(...yeni); hepsiGuncelle(); return;
  }
  else if (t === 'kose') {
    const i = enYakin(ham, e => e.t === 'l'); if (i < 0) return toast('Bir çizgiye dokun (dikdörtgen ve çoklu çizgiyi önce Parçala)');
    if (S.koseE < 0) { S.koseE = i; S.koseTik = ham; S.sel = new Set([i]); }
    else {
      if (i === S.koseE) return toast('İkinci olarak başka bir çizgiye dokun');
      const r = CZ.kose(S.D.e[S.koseE], S.D.e[i], S.koseTik, ham, S.koseD, S.koseTur), a = S.koseE; S.koseE = -1; S.sel.clear();
      if (r.hata) { toast(r.hata); komCiz(); ciz(); return; }
      geriKaydet(); const [y1, y2, ...ek2] = r.yeni; S.D.e[a] = y1; S.D.e[i] = y2; S.D.e.push(...ek2); hepsiGuncelle(); return;
    }
  }
  else if (t === 'altolcek') { p.push(P(q.x, q.y)); if (p.length === 2) { S.altP = [p[0], p[1]]; S.pts = []; sayfa('Gerçek mesafe', `<p class="cz-not">Resimde dokunduğun iki nokta arasındaki gerçek mesafeyi yaz. Resim buna göre ölçeklenir.</p><div class="cz-satir"><span>Mesafe</span><input id="czAltMes" type="text" inputmode="decimal" style="width:130px" placeholder="3000"> mm</div><button class="btn primary" data-action="cz-alt-olcek-tamam" style="width:100%">Uygula</button>`); setTimeout(() => $('#czAltMes')?.focus(), 80); } }
  else if (t === 'alttasi') { p.push(P(q.x, q.y)); if (p.length === 2 && S.alt) { S.alt.x += p[1].x - p[0].x; S.alt.y += p[1].y - p[0].y; S.pts = []; arac('sec', true); } }
  else if (t === 'kirp' || t === 'uzat') {
    const i = enYakin(ham, e => e.t === 'l'); if (i < 0) return toast(t === 'kirp' ? 'Kırpılacak bir çizgi bul (çoklu çizgiyi önce Parçala)' : 'Uzatılacak bir çizgi bul');
    const digerleri = S.D.e.filter((e, j) => j !== i && goruyor(e)), r = (t === 'kirp' ? CZ.kirp : CZ.uzat)(S.D.e[i], ham, digerleri);
    if (r.hata) return toast(r.hata); geriKaydet(); S.D.e.splice(i, 1, ...r.yeni); S.sel.clear(); hepsiGuncelle(); return;
  }
  else if (t === 'parcala') {
    const i = enYakin(ham, e => e.t === 'p'); if (i < 0) return toast('Parçalanacak bir çoklu çizgi / dikdörtgen bul'); const par = CZ.parcala(S.D.e[i]); geriKaydet(); S.D.e.splice(i, 1, ...par); S.sel.clear(); hepsiGuncelle(); toast(`${par.length} çizgiye ayrıldı`); return;
  }
  komCiz(); ciz();
}
const olcuKat = () => { const i = S.D.katlar.findIndex(k => /ölçü/i.test(k.ad)); return i >= 0 ? i : S.D.cur; };
// Ölçü çizimleri (çizgi + yazı olarak): çap/yarıçap, açı, kesit işareti
const sayiMetin = v => String(Math.round(v * 10) / 10).replace('.', ',');
function capHesap(e, tik, tur) {
  const c = e.c, th = Math.atan2(tik.y - c.y, tik.x - c.x), u = P(Math.cos(th), Math.sin(th)), r = e.r, k = olcuKat(), h = 2.5 * S.D.olcek, o = [], g = Math.min(r * .5, 3 * S.D.olcek);
  const uc = (nokta, yon) => { const bx = nokta.x - yon.x * g, by = nokta.y - yon.y * g, w = g * .3; return { t: 'p', pts: [P(nokta.x, nokta.y), P(bx - yon.y * w, by + yon.x * w), P(bx + yon.y * w, by - yon.x * w)], kapali: true, k }; };
  const A = P(c.x + u.x * r, c.y + u.y * r), B = P(c.x - u.x * r, c.y - u.y * r), txt = (tur === 'R' ? 'R ' : 'Ø ') + sayiMetin(tur === 'R' ? r : 2 * r), dis = P(A.x + u.x * h * .6, A.y + u.y * h * .6);
  if (tur === 'R') o.push({ t: 'l', a: P(c.x, c.y), b: A, k }, uc(A, u)); else o.push({ t: 'l', a: B, b: A, k }, uc(A, u), uc(B, P(-u.x, -u.y)));
  o.push({ t: 'x', p: P(dis.x - (u.x < -.3 ? txt.length * h * .6 : 0), dis.y + (u.y > .3 ? h * .3 : u.y < -.3 ? -h * 1.1 : -h * .4)), s: h, rot: 0, txt, k }); return o;
}
function aciHesap(e1, e2, t1, t2) {
  const r = CZ.segSegSonsuz(e1.a, e1.b, e2.a, e2.b); if (!r) return { hata: 'Çizgiler paralel, açı yok' }; const X = r, k = olcuKat(), h = 2.5 * S.D.olcek;
  const yon = (e, t) => { const dx = e.b.x - e.a.x, dy = e.b.y - e.a.y, l = Math.hypot(dx, dy) || 1; let s = ((t.x - X.x) * dx + (t.y - X.y) * dy) / l; if (Math.abs(s) < 1e-9) s = 1; return Math.atan2(dy * Math.sign(s), dx * Math.sign(s)); };
  const a1 = yon(e1, t1), a2 = yon(e2, t2), span = CZ.norm(a2 - a1), ark = span <= Math.PI ? { a0: a1, a1: a2, sp: span } : { a0: a2, a1: a1, sp: CZ.norm(a1 - a2) }; const rr = Math.max(5 * S.D.olcek, Math.min(mes(X, t1), mes(X, t2)) * .6), mid = ark.a0 + ark.sp / 2;
  const tx = `${sayiMetin(ark.sp * 180 / Math.PI)}°`; return { e: [{ t: 'a', c: P(X.x, X.y), r: rr, a0: ark.a0, a1: ark.a1, k }, { t: 'x', p: P(X.x + Math.cos(mid) * rr * 1.18 - (Math.cos(mid) < 0 ? tx.length * h * .6 : 0), X.y + Math.sin(mid) * rr * 1.18 - h * .4), s: h, rot: 0, txt: tx, k }] };
}
function kesitHesap(a, b, harf) {
  const L = mes(a, b); if (L < 1e-6) return []; const k = katBul('Kesit', '#c2362b', .35); S.D.katlar[k].lt = 2; const u = P((b.x - a.x) / L, (b.y - a.y) / L), n = P(-u.y, u.x), h = 3 * S.D.olcek, g = h * 1.6, o = [{ t: 'l', a: P(a.x, a.y), b: P(b.x, b.y), k }];
  for (const [q, d] of [[a, 1], [b, -1]]) { o.push({ t: 'l', a: P(q.x, q.y), b: P(q.x + n.x * g, q.y + n.y * g), k }, ...okCiz(P(q.x, q.y), P(q.x + n.x * g, q.y + n.y * g), k).slice(1), { t: 'x', p: P(q.x + n.x * g * 1.25 - h * .3, q.y + n.y * g * 1.25 - h * .4), s: h, rot: 0, txt: harf, k }); void d; }
  return o;
}
function panoKopyala() {
  if (!S.sel.size) return toast('Önce nesne seç'); const l = secVarlik(), bb = l.reduce((r, e) => { const q = CZ.sinir(e, ts()); return { x0: Math.min(r.x0, q.x0), y0: Math.min(r.y0, q.y0) }; }, { x0: 1e18, y0: 1e18 }), idx = [...new Set(l.map(e => e.k))];
  S.pano = { katlar: idx.map(i => ({ ad: S.D.katlar[i].ad, r: S.D.katlar[i].r, w: S.D.katlar[i].w })), e: l.map(e => { const n = CZ.donustur(e, M.ote(-bb.x0, -bb.y0)); n.k = idx.indexOf(e.k); return n; }) };
  try { localStorage.setItem('cz-pano', JSON.stringify({ katlar: S.pano.katlar, e: S.pano.e })); } catch { }
  toast(`${l.length} nesne kopyalandı`); komCiz();
}
function panoOku() { if (S.pano) return S.pano; try { const o = JSON.parse(localStorage.getItem('cz-pano') || 'null'); if (o) { const d = CZ.belgeTemiz({ katlar: o.katlar.map(k => ({ ...k, v: 1 })), e: o.e }); S.pano = { katlar: d.katlar, e: d.e }; } } catch { } return S.pano; }
function panoOnizle(q) { const p = panoOku(); return p ? p.e.map(e => CZ.donustur(e, M.ote(q.x, q.y))) : []; }
function panoYapistir(q) {
  const p = panoOku(); if (!p) return toast('Panoda nesne yok'); geriKaydet(); const es = p.katlar.map(k => katBul(k.ad, k.r, k.w));
  const yeni = p.e.map(e => { const n = CZ.donustur(e, M.ote(q.x, q.y)); n.k = es[Math.min(Math.max(0, n.k | 0), es.length - 1)]; return n; }); S.D.e.push(...yeni); hepsiGuncelle();
}
function okCiz(a, b, k) {
  const L = mes(a, b); if (L < 1e-6) return []; const u = P((b.x - a.x) / L, (b.y - a.y) / L), g = Math.min(L * .4, 3 * S.D.olcek), w = g * .35, tabanx = b.x - u.x * g, tabany = b.y - u.y * g;
  return [{ t: 'l', a: P(a.x, a.y), b: P(tabanx, tabany), k }, { t: 'p', pts: [P(b.x, b.y), P(tabanx - u.y * w, tabany + u.x * w), P(tabanx + u.y * w, tabany - u.x * w)], kapali: true, k }];
}
// Tablo: başlık, satırlar [[sol, sağ]], sol-üst köşe (x,y). Çizgi ve yazılar Yazı katmanına eklenir.
function tabloEkle(baslik, satirlar, x, y) {
  const h = 2.8 * S.D.olcek, rh = h * 1.7, k = katBul('Yazı', '#1b7fa6', .18), gen = Math.max(...satirlar.map(r => (r[0] || '').length), baslik.length) * h * .6, sag = Math.max(...satirlar.map(r => (r[1] || '').length), 4) * h * .6, W = gen + sag + h * 3, n = satirlar.length + 1, H = rh * n + h * .6;
  geriKaydet(); const E = S.D.e, ln = (x0, y0, x1, y1) => E.push({ t: 'l', a: P(x0, y0), b: P(x1, y1), k });
  ln(x, y, x + W, y); ln(x, y - H, x + W, y - H); ln(x, y, x, y - H); ln(x + W, y, x + W, y - H); ln(x, y - rh - h * .3, x + W, y - rh - h * .3);
  E.push({ t: 'x', p: P(x + h * .8, y - rh + h * .05), s: h * 1.1, rot: 0, txt: baslik, k });
  satirlar.forEach((r, i) => { const yy = y - rh * (i + 2) + h * .2; E.push({ t: 'x', p: P(x + h * .8, yy), s: h, rot: 0, txt: String(r[0]), k }); if (r[1] != null) E.push({ t: 'x', p: P(x + gen + h * 1.8, yy), s: h, rot: 0, txt: String(r[1]), k }); });
  hepsiGuncelle(); sigdir();
}
const tabloYeri = () => { const b = CZ.sinirHepsi(S.D, ts()); return b ? P(b.x0, b.y0 - 4 * S.D.olcek) : P(0, 0); };
function odaTablo() {
  const odalar = S.D.e.filter(e => e.t === 'x' && e.oda); if (!odalar.length) return toast('Önce Oda adı aracıyla odalara ad ver'); const top = odalar.reduce((a, e) => a + e.oda.m2, 0), q = tabloYeri();
  tabloEkle('ODA TABLOSU', [...odalar.map(e => [e.oda.ad, sayiBicim(e.oda.m2) + ' m²']), ['TOPLAM', sayiBicim(top) + ' m²']], q.x, q.y); closeModal();
}
function kapiTablo() {
  const AD = { kapi: 'Kapı', kapi2: 'Çift kanat kapı', surgulu: 'Sürgülü kapı', acik: 'Açıklık', katlanir: 'Katlanır kapı', cam: 'Sürgülü cam kapı', garaj: 'Garaj kapısı', pencere: 'Pencere' }, say = new Map();
  for (const e of S.D.e) if (e.sy && goruyor(e)) { const key = e.sy + '|' + Math.round(e.sw); say.set(key, (say.get(key) || 0) + 1); }
  if (!say.size) return toast('Kapı ya da pencere sembolü bulunamadı (bu liste yeni yerleştirilen sembolleri sayar)');
  const sat = [...say.entries()].sort().map(([k, n]) => { const [id, w] = k.split('|'); return [`${AD[id] || id} ${w} mm`, `${n} adet`]; }), q = tabloYeri();
  tabloEkle('KAPI VE PENCERE LİSTESİ', sat, q.x, q.y); closeModal();
}
function yaziSor(p) {
  sayfa('Yazı ekle', `<div class="cz-satir"><textarea id="czYz" rows="3" style="flex:1" maxlength="400" placeholder="Ör. Salon (birden çok satır yazabilirsin)"></textarea></div><div class="cz-satir"><span>Yükseklik</span><input id="czYy" type="number" value="${Math.round(2.5 * S.D.olcek)}" style="width:100px"> mm</div><button class="btn primary" data-action="cz-yazi-ekle" data-x="${p.x}" data-y="${p.y}" style="width:100%">Ekle</button>`);
  setTimeout(() => $('#czYz')?.focus(), 80);
}

/* ═════════ Seçim ═════════ */
function tikSec(sx, sy) { const ham = dn(sx, sy), i = enYakin(ham); if (i < 0) S.sel.clear(); else if (S.sel.has(i)) S.sel.delete(i); else S.sel.add(i); ozelCiz(); komCiz(); ciz(); }
function kutuSec(k) {
  const a = dn(Math.min(k.x0, k.x1), Math.max(k.y0, k.y1)), b = dn(Math.max(k.x0, k.x1), Math.min(k.y0, k.y1)), tamIc = k.x1 >= k.x0;
  S.D.e.forEach((e, i) => { if (!goruyor(e) || kilitli(e)) return; const s = CZ.sinir(e, ts()), ic = s.x0 >= a.x && s.x1 <= b.x && s.y0 >= a.y && s.y1 <= b.y, kes = s.x1 >= a.x && s.x0 <= b.x && s.y1 >= a.y && s.y0 <= b.y; if (tamIc ? ic : kes) S.sel.add(i); });
  ozelCiz(); komCiz(); ciz();
}

/* ═════════ Yazılan değer (Enter) ═════════ */
function girdi(v) {
  v = String(v).trim(); if (!v) return; const t = S.tool, son = yonNokta(), imlec = S.imlec; const ham = v;
  const yon = () => { if (!son || !imlec) return null; let dx = imlec.x - son.x, dy = imlec.y - son.y; if (S.ortho) { if (Math.abs(dx) > Math.abs(dy)) dy = 0; else dx = 0; } const u = Math.hypot(dx, dy); return u < 1e-9 ? P(1, 0) : P(dx / u, dy / u); };
  v = v.replace(',', '.'); if (t === 'tarama') { const n = parseFloat(v); if (n > 0) { S.tarAr = n; komCiz(); } return; }
  if (t === 'oto') { const n = parseFloat(v); if (n > 0) { S.otoMes = n; komCiz(); } return; }
  if (t === 'kose') { const n = parseFloat(v); if (n >= 0) { S.koseD = n; komCiz(); } return; }
  if (t === 'blok') { const n = parseFloat(v); if (isFinite(n)) { S.bRot = n * Math.PI / 180; komCiz(); ciz(); } return; }
  if (t === 'ofset') { const n = parseFloat(v); if (n > 0) { S.ofd = n; komCiz(); } return; }
  if (t === 'dik' && S.pts.length === 1) { const [w, h] = ham.split(/\s*[;xX×*]\s*|\s+/).map(q => parseFloat(q.replace(',', '.'))), a = S.pts[0], sx = imlec && imlec.x < a.x ? -1 : 1, sy = imlec && imlec.y < a.y ? -1 : 1; if (!(w > 0)) return; tikNokta(P(a.x + sx * w, a.y + sy * (h > 0 ? h : w)), null); return; }
  if (t === 'daire' && S.pts.length === 1) { const r = parseFloat(v); if (r > 0) { ekle(yeniKat({ t: 'c', c: S.pts[0], r })); S.pts = []; komCiz(); ciz(); } return; }
  if (t === 'olcekle' && S.pts.length === 1) { const f = parseFloat(v); if (f > 0 && f < 1000) { uygulaDonusum(M.olcek(f, S.pts[0])); S.pts = []; arac('sec', true); } else toast('Ölçek oranı 0 ile 1000 arasında olmalı'); return; }
  if (t === 'don' && S.pts.length === 1) { const a = parseFloat(v) * Math.PI / 180; if (isFinite(a)) { uygulaDonusum(M.don(a, S.pts[0])); S.pts = []; arac('sec', true); } return; }
  const n = parseFloat(v); if (!(n > 0) || !son) return; const d = yon(); if (!d) return; tikNokta(P(son.x + d.x * n, son.y + d.y * n), null);
}

/* ═════════ Komut çubuğu ═════════ */
function istem() {
  const t = S.tool, n = S.pts.length;
  return ({
    sec: S.sel.size ? `${S.sel.size} nesne seçili` : 'Dokunarak seç, boş yerde sürükleyerek kutu çiz', el: 'Sürükleyerek kaydır; iki parmakla ya da tekerlekle yakınlaştır',
    cizgi: n ? 'Sonraki nokta (uzunluk yazıp Enter)' : 'Başlangıç noktası', coklu: n ? 'Sonraki nokta' : 'İlk nokta', dik: n ? 'Karşı köşe (en x boy yazıp Enter)' : 'İlk köşe', daire: n ? 'Yarıçap (sayı yaz ya da bir nokta seç)' : 'Merkez noktası',
    yay: ['Başlangıç noktası', 'Yay üzerinde bir nokta', 'Bitiş noktası'][n] || '', olcu: ['İlk nokta', 'İkinci nokta', 'Ölçü çizgisinin yeri'][n] || '', yazi: 'Yazının yeri',
    tasi: n ? 'Hedef nokta (mesafe yazıp Enter)' : 'Başlangıç noktası', kopya: n ? 'Hedef nokta (tekrar tekrar); bitirmek için Bitir' : 'Başlangıç noktası', don: ['Dönme merkezi (açı yazıp Enter)', 'Başlangıç yönü', 'Yeni yön'][n] || '',
    cap: 'Daire ya da yaya dokun (yazı yönü: dokunduğun taraf)', aci: n ? 'İkinci çizgiye dokun' : 'Birinci çizgiye dokun', kesit: n ? 'Kesit çizgisinin bitişi' : 'Kesit çizgisinin başlangıcı', yapistir: S.pano ? 'Yapıştırılacak yere dokun' : 'Önce Seç aracıyla nesne seçip Kopyala de',
    oda: 'Adlandırılacak odaya dokun', ok: n ? 'Okun ucuna dokun' : 'Okun başlangıcı',
    dolgu: S.dolguSil ? 'Boyası silinecek şekle dokun' : 'Boyanacak şekle ya da duvarlarla çevrili odaya dokun', olcekle: ['Sabit kalacak nokta (oran yazıp Enter)', 'Bilinen uzunluğun ucu', 'Yeni uzunluğun ucu'][n] || '', dizi: S.dz.tur === 'dair' ? (S.dz.c ? 'Merkez seçildi; Uygula\'ya bas' : 'Dönme merkezine dokun') : 'Sütun, satır ve aralığı yaz, sonra Uygula',
    ayna: ['Eksenin ilk noktası', 'Eksenin ikinci noktası'][n] || '', ofset: S.ofE < 0 ? 'Ofset yapılacak nesneye dokun' : 'Hangi tarafa? O tarafa dokun', kirp: 'Kırpılacak parçaya dokun', uzat: 'Uzatılacak çizginin ucuna yakın dokun', parcala: 'Parçalanacak çoklu çizgiye dokun',
    duvar: n ? 'Sonraki nokta (uzunluk yazıp Enter). Bitirmek için Bitir' : 'Duvarın başlangıç noktası', alan: S.alanSon ? alanMetin(S.alanSon) : n ? `${n} nokta · en az 3 nokta, sonra Bitir` : S.alanNokta ? 'Köşe noktalarına dokun' : 'Kapalı bir şeklin içine dokun',
    tarama: 'Taranacak kapalı şeklin içine dokun', oto: 'Ölçülecek çizgiye, kenara ya da daireye dokun', kose: S.koseE < 0 ? 'Birinci çizgiye dokun (tutulacak tarafa yakın)' : 'İkinci çizgiye dokun (tutulacak tarafa yakın)',
    blok: S.blok ? `${S.blok.ad}: yerleştirmek için dokun${S.blok.duvar && S.duvarYap ? ' (duvara yaklaşınca oturur)' : ''}` : 'Önce bir sembol seç', altolcek: n ? 'Resimdeki ikinci bilinen noktaya dokun' : 'Resimdeki bilinen iki noktadan birine dokun (Yakala kapalıysa daha rahat)', alttasi: n ? 'Resmin gideceği nokta' : 'Resimde bir nokta seç (taşıma başlangıcı)'
  })[t] || '';
}
function komCiz() {
  const k = $('#czKom'); if (!k) return; const t = S.tool, n = S.pts.length; let h = `<span>${istem()}</span>`;
  const sayi = ['cizgi', 'dik', 'daire', 'tasi', 'kopya', 'don', 'olcekle', 'ofset'].includes(t) && (n > 0 || t === 'ofset' || t === 'don');
  if (t === 'ofset') h += `<input id="czSayi" type="text" inputmode="decimal" value="${S.ofd}" title="Ofset mesafesi (mm)"> mm`; else if (sayi) h += `<input id="czSayi" type="text" inputmode="decimal" placeholder="${t === 'dik' ? 'en x boy' : t === 'daire' ? 'yarıçap' : t === 'don' ? 'açı °' : t === 'olcekle' ? 'oran (ör. 2)' : 'mesafe'}">`;
  if ((t === 'cizgi' || t === 'coklu' || t === 'kopya' || t === 'tasi') && n) h += `<button class="d k" data-action="cz-bitir">Bitir</button>`;
  if (t === 'coklu' && n > 2) h += `<button class="d k" data-action="cz-kapat">Kapat</button>`;
  if (t === 'ayna') h += `<button class="d k ${S.aslini ? 'on' : ''}" data-action="cz-aslini">Aslını koru</button>`;
  const dk = (act, ad, on, extra = '') => `<button class="d k ${on ? 'on' : ''}" data-action="${act}" ${extra}>${ad}</button>`;
  if (t === 'duvar') { h += `<input id="czKal" type="text" inputmode="decimal" value="${S.duvK}" title="Duvar kalınlığı (mm)" style="width:70px"> mm kalınlık`; if (n) h += `<input id="czSayi" type="text" inputmode="decimal" placeholder="mesafe">` + dk('cz-bitir', 'Bitir') + (n > 2 ? dk('cz-kapat', 'Kapat') : ''); }
  if (t === 'alan') { h += dk('cz-alan-mod', S.alanNokta ? 'Noktalarla' : 'Şekle dokun', true); if (n > 2) h += dk('cz-bitir', 'Bitir'); if (S.alanSon) h += dk('cz-alan-yazi', 'Yazı olarak ekle'); }
  if (t === 'tarama') h += [['capraz', '45°'], ['yatay', 'Yatay'], ['dikey', 'Dikey'], ['ag', 'Ağ'], ['tugla', 'Tuğla'], ['beton', 'Beton'], ['ahsap', 'Ahşap'], ['toprak', 'Toprak'], ['yalitim', 'Yalıtım']].map(([a, b]) => dk('cz-tarama-tur', b, S.tarTur === a, `data-t="${a}"`)).join('') + `<input id="czSayi" type="text" inputmode="decimal" value="${S.tarAr || ''}" placeholder="${3 * S.D.olcek}" title="Tarama aralığı (mm)"> mm aralık`;
  if (t === 'cap') h += dk('cz-cap-tur', 'Çap Ø', S.capTur === 'D', 'data-t="D"') + dk('cz-cap-tur', 'Yarıçap R', S.capTur === 'R', 'data-t="R"');
  if (t === 'yapistir' && S.pano) h += `<span>${S.pano.e.length} nesne hazır</span>`;
  if (t === 'dizi') { const z = S.dz; h += dk('cz-dizi-tur', 'Satır/sütun', z.tur === 'dik', 'data-t="dik"') + dk('cz-dizi-tur', 'Dairesel', z.tur === 'dair', 'data-t="dair"'); const gi = (i, ad, v) => `<label class="cz-p">${ad}<input data-a="dizi-p" data-i="${i}" type="text" inputmode="decimal" value="${v}" style="width:60px"></label>`; h += z.tur === 'dik' ? gi('c', 'Sütun', z.c0) + gi('r', 'Satır', z.r0) + gi('dx', 'Aralık X', z.dx) + gi('dy', 'Aralık Y', z.dy) : gi('n', 'Adet', z.n) + gi('ac', 'Açı °', z.ac); h += dk('cz-dizi-uygula', 'Uygula'); }
  if (t === 'dolgu') {
    const RN = ['#3a4a43', '#b8c4bf', '#cfe3f2', '#d6ecd0', '#f6e3b4', '#f2cfc4', '#e3d5c3', '#ffffff'];
    h += RN.map(r => `<button class="d k ${S.dolguR === r && !S.dolguSil ? 'on' : ''}" data-action="cz-dolgu-renk" data-r="${r}" title="${r}" style="background:${r};min-width:30px;${r === '#3a4a43' ? 'color:#fff' : ''}">${S.dolguR === r && !S.dolguSil ? '✓' : '&nbsp;'}</button>`).join('') + `<input type="color" data-a="dolgu-renk" value="${S.dolguR}" title="Başka renk" style="width:34px;height:30px;padding:0">`;
    h += [[1, 'Opak'], [.55, 'Yarı'], [.3, 'Hafif']].map(([a, b]) => dk('cz-dolgu-alfa', b, S.dolguA === a, `data-al="${a}"`)).join('') + dk('cz-dolgu-sil', 'Boyayı sil', S.dolguSil) + dk('cz-dolgu-duvar', S.D.katlar.find(q => /duvar/i.test(q.ad))?.f ? 'Duvar dolgusunu kaldır' : 'Duvarları doldur');
  }
  if (t === 'oto') h += dk('cz-oto-hepsi', 'Tüm kenarlar', S.otoHepsi) + dk('cz-oto-yon', 'Taraf ⇄') + `<input id="czSayi" type="text" inputmode="decimal" value="${S.otoMes || ''}" placeholder="${6 * S.D.olcek}" title="Ölçü çizgisinin uzaklığı (mm)"> mm uzaklık`;
  if (t === 'kose') h += dk('cz-kose-tur', 'Yuvarla', S.koseTur === 'yuvarla', 'data-t="yuvarla"') + dk('cz-kose-tur', 'Pah', S.koseTur === 'pah', 'data-t="pah"') + `<input id="czSayi" type="text" inputmode="decimal" value="${S.koseD}" title="Yarıçap / pah uzunluğu (mm)"> mm`;
  if (t === 'blok' && S.blok) {
    h += (S.blok.p || []).map((q, i) => `<label class="cz-p">${esc(q.ad)}<input data-a="blok-p" data-i="${i}" type="text" inputmode="decimal" value="${S.blokP[i]}" style="width:70px"></label>`).join('');
    if (S.blok.duvar) h += dk('cz-duvar-yap', 'Duvara oturt', S.duvarYap);
    h += dk('cz-blok-don', '↻ 90°') + dk('cz-blok-ayna', 'Aynala', S.bAyna) + dk('cz-blok-menu', 'Değiştir');
  }
  if (t === 'sec' && S.sel.size) h += `<button class="d k" data-action="cz-kopyala">Kopyala</button>`;
  if (t === 'sec' && S.pano) h += `<button class="d k" data-action="cz-yapistir">Yapıştır</button>`;
  if (t === 'sec' && S.sel.size) h += `<button class="d k" data-action="cz-blok-yap">Blok yap</button>`;
  if (t === 'sec' && S.sel.size) h += `<button class="d k" data-action="cz-sil">Sil</button>`; if (t === 'sec' && S.D.e.length) h += `<button class="d k" data-action="cz-hepsi">Hepsini seç</button>`;
  k.innerHTML = h;
}

/* ═════════ Paneller ═════════ */
const KALINLIK = [.13, .18, .25, .35, .5, .7, 1, 1.4];
function katAyar(i) {
  const l = S.D.katlar[i]; if (!l) return;
  sayfa('Katman ayarları', `<div class="cz-satir"><input id="czKatAd" style="flex:1" maxlength="40" value="${esc(l.ad)}"></div>
    <div class="cz-liste"><button class="btn ${l.kilit ? 'primary' : ''}" data-action="cz-kat-kilit" data-i="${i}">${l.kilit ? '🔒 Kilitli (açmak için dokun)' : 'Kilitle (seçilemesin, değişmesin)'}</button>
    <button class="btn" data-action="cz-kat-yer" data-i="${i}" data-y="-1" ${i === 0 ? 'disabled' : ''}>↑ Yukarı taşı</button><button class="btn" data-action="cz-kat-yer" data-i="${i}" data-y="1" ${i === S.D.katlar.length - 1 ? 'disabled' : ''}>↓ Aşağı taşı</button></div>
    <button class="btn primary" data-action="cz-kat-ad" data-i="${i}" style="width:100%;margin-top:8px">Kaydet</button>`);
}
function katCiz() {
  const k = $('#czKat'); if (!k) return;
  k.innerHTML = S.D.katlar.map((l, i) => `<div class="cz-kat ${i === S.D.cur ? 'on' : ''}" data-action="cz-kat" data-i="${i}"><input type="color" value="${l.r}" data-a="kat-renk" data-i="${i}" title="Renk"><span>${esc(l.ad)}${l.kilit ? ' 🔒' : ''}</span>
    <select data-a="kat-kal" data-i="${i}" title="PDF çizgi kalınlığı (mm)">${KALINLIK.map(w => `<option value="${w}" ${Math.abs(l.w - w) < 1e-6 ? 'selected' : ''}>${w}</option>`).join('')}</select>
    <select data-a="kat-lt" data-i="${i}" title="Çizgi türü">${['——', '– –', '–·–', '···'].map((n, j) => `<option value="${j}" ${(l.lt | 0) === j ? 'selected' : ''}>${n}</option>`).join('')}</select>
    <button data-action="cz-kat-ayar" data-i="${i}" title="Katman ayarları" aria-label="Katman ayarları">⋯</button><button data-action="cz-kat-gor" data-i="${i}" title="Göster/gizle" aria-label="Göster/gizle">${l.v ? '●' : '○'}</button></div>`).join('');
}
function ozelCiz() {
  const o = $('#czOzel'); if (!o) return; const l = secVarlik();
  if (!l.length) { o.innerHTML = 'Hiçbir şey seçili değil'; return; }
  const e = l[0], ad = { l: 'Çizgi', p: 'Çoklu çizgi', c: 'Daire', a: 'Yay', d: 'Ölçü', x: 'Yazı' };
  let bilgi = l.length > 1 ? `<b>${l.length} nesne</b><br>Toplam uzunluk ${sayiBicim(l.reduce((t, q) => t + (q.t === 'l' ? mes(q.a, q.b) : q.t === 'p' ? CZ.parcalar(q).reduce((u, [a, b]) => u + mes(a, b), 0) : q.t === 'c' ? 2 * Math.PI * q.r : q.t === 'a' ? q.r * (CZ.norm(q.a1 - q.a0) || 2 * Math.PI) : 0), 0) / 1000)} m` : `<b>${ad[e.t]}</b> · ${esc(S.D.katlar[e.k]?.ad || '')}<br>` + ({ l: () => `Uzunluk ${sayiBicim(mes(e.a, e.b))} mm`, p: () => `${e.pts.length} nokta · ${sayiBicim(CZ.parcalar(e).reduce((s, [a, b]) => s + mes(a, b), 0))} mm` + (e.kapali ? ` · Alan ${sayiBicim(CZ.alanOlc(e).alan / 1e6)} m²` : ''), c: () => `Yarıçap ${sayiBicim(e.r)} mm · Alan ${sayiBicim(Math.PI * e.r * e.r / 1e6)} m²`, a: () => `Yarıçap ${sayiBicim(e.r)} mm`, d: () => `${sayiBicim(mes(e.a, e.b))} mm`, x: () => esc(e.txt) })[e.t]();
  o.innerHTML = bilgi + `<div style="margin-top:6px"><select data-a="sel-kat" style="width:100%"><option value="">Katmanı değiştir…</option>${S.D.katlar.map((k, i) => `<option value="${i}">${esc(k.ad)}</option>`).join('')}</select></div>`;
}

/* ═════════ Modal yardımcıları ═════════ */
function sayfa(baslik, icerik) { $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet settings"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>${baslik}</h3></header><div class="set-body">${icerik}</div></div></div>`; }
function indir(blob, ad) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = ad.replace(/[\\/:*?"<>|]/g, '_'); document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 8000); }
const dosyaAdi = u => (S.D.ad || 'cizim').replace(/[^\p{L}\p{N}\-_ ]/gu, '').trim().replace(/\s+/g, '-') + '.' + u;

/* ═════════ Dosya / dışa aktarma ═════════ */
function dosyaMenu() {
  sayfa('Dosya', `<div class="cz-liste">
    <button class="btn" data-action="cz-yeni">Yeni çizim</button><button class="btn" data-action="cz-ornek">Örnek kat planını aç</button><button class="btn" data-action="cz-ac">Dosya aç (DXF ya da Çizim yedeği)</button>
    <button class="btn" data-action="cz-tarayici">Tarayıcıya kaydet</button><button class="btn" data-action="cz-kayitlilar">Kayıtlı çizimlerim</button><button class="btn" data-action="cz-alt-menu">Resim / plan altlığı (üstünden çiz)</button>
    <h4 style="margin:8px 0 0;color:var(--fg-3);font-size:12px">TABLOLAR (çizime eklenir)</h4>
    <button class="btn" data-action="cz-oda-tablo">Oda tablosu (ad ve m²)</button><button class="btn" data-action="cz-kapi-tablo">Kapı ve pencere listesi</button>
    <h4 style="margin:8px 0 0;color:var(--fg-3);font-size:12px">DIŞA AKTAR</h4>
    <button class="btn" data-action="cz-pdf-ayar">PDF (ölçekli)</button><button class="btn" data-action="cz-dxf">DXF (AutoCAD ve diğer CAD programları)</button><button class="btn" data-action="cz-svg">SVG</button><button class="btn" data-action="cz-png">PNG resim</button><button class="btn" data-action="cz-yedek">Yedek dosyası (.json)</button></div>
    <p class="cz-not">DWG dosyası açılmaz ve yazılmaz (kapalı biçim). AutoCAD'den DXF olarak kaydedip aç.</p>`);
}
function pdfAyar(kagit = S.pdf?.kagit || 'A4', olcek) {
  const oner = CZ.pdfOlcekOner(S.D, kagit); if (!oner) return toast('Çizim boş'); olcek = olcek || S.pdf?.olcek || oner; S.pdf = { kagit, olcek, bol: S.pdf?.bol || false };
  let sigar = false, sayfa_ = 1, hata = ''; try { const r = CZ.pdfYaz(S.D, { ...S.pdf, bol: !!S.pdf.bol }); sigar = r.sigar; sayfa_ = r.sayfa; } catch (e) { hata = e.message; }
  const olur = (sigar || (S.pdf.bol && !hata));
  sayfa('PDF (ölçekli)', `<div class="cz-satir"><span>Kâğıt</span><div class="seg">${['A4', 'A3', 'A2', 'A1'].map(k => `<button class="${k === kagit ? 'on' : ''}" data-action="cz-pdf-kagit" data-k="${k}">${k}</button>`).join('')}</div></div>
    <div class="cz-satir"><span>Ölçek</span><select data-a="pdf-olcek">${CZ.OLCEKLER.map(o => `<option value="${o}" ${o === olcek ? 'selected' : ''}>1:${o}${o === oner ? ' (önerilen)' : ''}</option>`).join('')}</select></div>
    <p class="cz-not ${sigar ? 'iy' : 'uy'}">${sigar ? `Çizim ${kagit} kâğıda 1:${olcek} ölçeğinde sığıyor. Yönü çizime göre otomatik seçilir.` : S.pdf.bol && !hata ? `Çizim ${sayfa_} sayfaya bölünür (her sayfada Sayfa x/y yazar).` : `Çizim 1:${olcek} ölçeğinde ${kagit} kâğıda sığmıyor. En az 1:${oner} seç, daha büyük kâğıt kullan ya da sayfalara böl.${hata ? ' ' + esc(hata) : ''}`}</p>
    <div class="cz-satir"><span>Büyükse sayfalara böl</span><button class="d k ${S.pdf.bol ? 'on' : ''}" data-action="cz-pdf-bol">${S.pdf.bol ? 'Açık' : 'Kapalı'}</button></div>
    <p class="cz-not">PDF gerçek ölçüdedir: 1:${olcek} için çizimdeki ${olcek} mm, kâğıtta 1 mm olur. Ölçü yazıları kâğıtta 2,5 mm yüksekliktedir. Çizgi kalınlıkları katman ayarından gelir.</p>
    <div class="cz-satir"><span>Antet</span><button class="d k ${S.D.antet?.goster ? 'on' : ''}" data-action="cz-antet-ac">${S.D.antet?.goster ? 'Açık' : 'Kapalı'}</button></div>
    ${S.D.antet?.goster ? `<div class="cz-satir"><span>Proje</span><input data-a="antet-proje" style="flex:1" maxlength="60" value="${esc(S.D.antet.proje || '')}" placeholder="${esc(S.D.ad)}"></div><div class="cz-satir"><span>Çizen</span><input data-a="antet-cizen" style="flex:1" maxlength="40" value="${esc(S.D.antet.cizen || '')}"></div>` : ''}
    <button class="btn primary" data-action="cz-pdf-indir" style="width:100%" ${olur ? '' : 'disabled'}>PDF indir</button>`);
}
function pngCiz() {
  const s = CZ.sinirHepsi(S.D, ts()); if (!s) return toast('Çizim boş'); const pay = ts() * 2, w = s.x1 - s.x0 + 2 * pay, h = s.y1 - s.y0 + 2 * pay, k = Math.min(3000 / w, 3000 / h), c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k);
  const ox = x, osel = S.sel; S.sel = new Set(); const og = S.imlec, op = S.pts, ot = S.tool, okut = S.kutu; S.imlec = null; S.pts = []; S.kutu = null; boya(c.getContext('2d'), c.width, c.height, { x: s.x0 - pay, y: s.y0 - pay, s: k }, false); S.sel = osel; S.imlec = og; S.pts = op; S.tool = ot; S.kutu = okut; void ox;
  c.toBlob(b => { if (b) indir(b, dosyaAdi('png')); else toast('Resim oluşturulamadı'); }, 'image/png');
}
async function dosyaAc(f) {
  try {
    if (f.size > CZ.SINIR.dosya) throw new Error('Dosya çok büyük (en çok 25 MB).'); const m = await f.text(); let yeni, rapor = null;
    if (/\.dxf$/i.test(f.name) || /^\s*0\s*\r?\n\s*SECTION/.test(m.slice(0, 200))) { const r = CZ.dxfOku(m); yeni = r.belge; yeni.ad = f.name.replace(/\.[^.]+$/, ''); rapor = r.rapor; }
    else if (/\.dwg$/i.test(f.name)) throw new Error('DWG açılamaz (kapalı biçim). AutoCAD ya da başka CAD programında "DXF olarak kaydet" yap.');
    else yeni = CZ.belgeTemiz(JSON.parse(m));
    geriKaydet(); S.D = yeni; S.id = null; S.sel.clear(); S.pts = []; S.dokunuldu = false; boyut(); hepsiGuncelle(); sigdir(); ciz(); closeModal();
    if (rapor) { const at = Object.entries(rapor.atlanan).map(([k, n]) => `${k} (${n})`).join(', '); const uy = [at && `Desteklenmeyen nesneler atlandı: ${at}`, rapor.egri && `${rapor.egri} yaylı çoklu çizgi küçük düz parçalarla yaklaştırıldı`, rapor.elips && `${rapor.elips} elips çoklu çizgi olarak açıldı`, rapor.blok && `${rapor.blok} blok bulunamadı`].filter(Boolean); sayfa('DXF açıldı', `<p class="cz-not iy">${rapor.nesne} nesne açıldı.</p>${uy.map(u => `<p class="cz-not uy">${esc(u)}</p>`).join('')}${rapor.birim !== 1 ? `<p class="cz-not">Birim milimetreye çevrildi (×${rapor.birim}).</p>` : ''}`); }
  } catch (e) { sayfa('Açılamadı', `<p class="cz-not uy">${esc(e.message || 'Dosya okunamadı')}</p>`); }
}
const liste = () => { try { return JSON.parse(localStorage.getItem('cz-liste') || '[]'); } catch { return []; } };
function tarayiciyaKaydet() {
  try {
    const l = liste(); if (!S.id) S.id = 'c' + Date.now().toString(36); const j = JSON.stringify(S.D); localStorage.setItem('cz-d-' + S.id, j);
    const kay = { id: S.id, ad: S.D.ad, t: Date.now(), n: S.D.e.length }, i = l.findIndex(q => q.id === S.id); if (i >= 0) l[i] = kay; else l.unshift(kay); localStorage.setItem('cz-liste', JSON.stringify(l)); toast('Tarayıcıya kaydedildi');
  } catch { toast('Kaydedilemedi: tarayıcı depolaması dolu ya da kapalı. Yedek dosyası indir.'); }
}
function kayitlilar() {
  const l = liste(); sayfa('Kayıtlı çizimlerim', l.length ? `<div class="cz-liste">${l.map(k => `<div class="cz-liste-o"><div><b>${esc(k.ad)}</b><span>${k.n} nesne · ${new Date(k.t).toLocaleDateString('tr-TR')}</span></div><button class="btn" data-action="cz-kayit-ac" data-id="${k.id}">Aç</button><button class="icon-btn" data-action="cz-kayit-sil" data-id="${k.id}" aria-label="Sil">${IC.trash}</button></div>`).join('')}</div><p class="cz-not">Bu liste yalnızca bu tarayıcıda durur. Tarayıcı verisini silersen gider; önemli çizimlerin yedek dosyasını indir.</p>` : '<p class="cz-not">Henüz kayıtlı çizim yok.</p>');
}
function ornek() {
  const p = (a, b) => P(a, b), D = yeniBelge(); D.ad = 'Örnek kat planı';
  D.katlar = [{ ad: 'Duvar', r: '#25302b', w: .5, v: 1, lt: 0 }, { ad: 'Mobilya', r: '#9a5b1f', w: .25, v: 1, lt: 0 }, { ad: 'Ölçü', r: '#c2362b', w: .18, v: 1, lt: 0 }, { ad: 'Yazı', r: '#1b7fa6', w: .18, v: 1, lt: 0 },
    { ad: 'Kapı', r: '#6a4c93', w: .25, v: 1, lt: 0 }, { ad: 'Pencere', r: '#1b7fa6', w: .25, v: 1, lt: 0 }, { ad: 'Tesisat', r: '#2e8b57', w: .25, v: 1, lt: 0 }, { ad: 'Yapı', r: '#3a4a43', w: .35, v: 1, lt: 0 }];
  const KM = { 0: 1, 1: 4, 2: 5, 3: 6, 4: 7 }, KAL = 200;
  // Duvarlar: her yeni duvar mevcutlarla birleşir (T/L birleşimler temiz)
  const duvarEkle = (pts, kapali) => { const r = CZ.duvar(pts, KAL, kapali), bir = CZ.duvarBirlestir(r.e.map(x => ({ ...x, k: 0 })), D.e.map((e, i) => ({ e, i })).filter(({ e }) => e.k === 0 && e.t === 'p')); D.e = D.e.flatMap((e, i) => bir.degisen.has(i) ? bir.degisen.get(i) : [e]).concat(bir.yeni); };
  duvarEkle([p(0, 0), p(9000, 0), p(9000, 6000), p(0, 6000)], true);
  duvarEkle([p(5200, 0), p(5200, 6000)]); duvarEkle([p(5200, 3000), p(9000, 3000)]); duvarEkle([p(0, 1800), p(2600, 1800)]); duvarEkle([p(2600, 0), p(2600, 1800)]);
  const ent = (id, ...pr) => { const b = CZ.SEMBOL.find(q => q.id === id); return b.uret(...(pr.length ? pr : b.p.map(q => q.v)), KAL).map(e => ({ ...e, k: KM[e.k] ?? 1 })); };
  const yer = (id, x, y, rot, ...pr) => { const m = M.carp(M.ote(x, y), M.don(rot * Math.PI / 180, P(0, 0))); ent(id, ...pr).forEach(e => D.e.push(CZ.donustur(e, m))); };
  // Kapı/pencere: duvarı deler, sonra yerleştirir (yön: açılan taraf yerel +y; mobilyada +y = arka)
  const delik = (id, x, y, rot, w) => { const kes = CZ.duvarKes(D.e, e => e.k === 0 && (e.t === 'l' || e.t === 'p'), p(x, y), rot * Math.PI / 180, w, KAL); D.e = D.e.filter((_, i) => !kes.sil.has(i)).concat(kes.ekle); yer(id, x, y, rot, w); };
  delik('kapi', 3900, 0, 0, 1000); delik('kapi', 5200, 5200, 90, 900); delik('kapi', 5200, 1500, -90, 900); delik('kapi', 1700, 1800, 180, 800);
  delik('pencere', 2000, 6000, 0, 1800); delik('pencere', 4000, 6000, 0, 1200); delik('pencere', 7100, 6000, 0, 1400); delik('pencere', 9000, 1500, 90, 1600); delik('pencere', 7100, 0, 0, 1400); delik('pencere', 0, 3600, 90, 1400);
  // Salon
  yer('tv', 2000, 5675, 0, 1800, 450); yer('kanepe', 2000, 3300, 180, 2200, 900); yer('sehpa', 2000, 4300, 0, 1100, 600); yer('ysehpa', 3200, 4300, 0, 500); yer('koltuk', 4300, 4300, -90);
  // Mutfak
  yer('tezgah', 7000, 5600, 0, 2400, 600); yer('ocak', 6400, 5600, 0); yer('eviye', 7600, 5600, 0); yer('buzdolabi', 8500, 5550, 0); yer('yemek', 7000, 4100, 0, 1400, 900);
  // Yatak odası
  yer('yatak2', 7700, 1500, -90, 1600, 2000); yer('komodin', 8650, 450, -90); yer('komodin', 8650, 2550, -90); yer('gardrop', 6700, 2600, 0, 2000, 600);
  // Banyo
  yer('klozet', 500, 100, 0); yer('lavabo', 600, 1475, 0, 600, 450); yer('dus', 2050, 550, 0, 900, 900);
  D.e.push({ t: 'd', a: p(0, 0), b: p(0, 6000), o: 700, k: 2 }, { t: 'd', a: p(0, 0), b: p(9000, 0), o: -700, k: 2 });
  [['Salon', 24.6, 3300, 2500], ['Mutfak', 10.2, 8600, 3650], ['Yatak odası', 10.1, 6200, 600], ['Banyo', 3.9, 1250, 1000]].forEach(([ad, m2, x, y]) => { const m = String(m2).replace('.', ',') + ' m²'; D.e.push({ t: 'x', p: p(x - ad.length * 90, y + 90), s: 300, rot: 0, txt: ad, k: 3, oda: { ad, m2 } }, { t: 'x', p: p(x - m.length * 80, y - 330), s: 250, rot: 0, txt: m, k: 3 }); });
  D.e.push(...ent('kuzey', 600).map(e => CZ.donustur(e, M.ote(-1200, 5000))));
  return D;
}
function belgeYukle(D) { geriKaydet(); altKaldir(); S.D = D; S.id = null; S.sel.clear(); S.pts = []; S.dokunuldu = false; boyut(); sigdir(); hepsiGuncelle(); closeModal(); }

/* ═════════ Semboller / bloklar ═════════ */
const bloklarOku = () => { try { return JSON.parse(localStorage.getItem('cz-bloklar') || '[]').slice(0, 40).map(b => { const d = CZ.belgeTemiz({ katlar: b.katlar, e: b.e }); return { id: String(b.id || '').slice(0, 20), ad: String(b.ad || 'Blok').slice(0, 40), katlar: d.katlar.map(k => ({ ad: k.ad, r: k.r, w: k.w })), e: d.e }; }); } catch { return []; } };
const blokAdaylari = () => [...CZ.SEMBOL.map(b => ({ ...b, kendi: false })), ...bloklarOku().map(b => ({ ...b, kendi: true }))];
const SEM_SIRA = ['Kapı ve pencere', 'Oturma', 'Yatak odası', 'Yemek ve çalışma', 'Ofis', 'Mutfak', 'Banyo', 'Elektrik ve tesisat', 'Yapı', 'Çatı ve plan', 'Dış mekân'];
const sonOku = () => { try { const a = JSON.parse(localStorage.getItem('cz-son') || '[]'); return Array.isArray(a) ? a.filter(x => typeof x === 'string').slice(0, 8) : []; } catch { return []; } };
const sonYaz = ad => { try { localStorage.setItem('cz-son', JSON.stringify([ad, ...sonOku().filter(x => x !== ad)].slice(0, 8))); } catch { } };
function blokMenu() {
  const hepsi = blokAdaylari(), kart = (b, i) => `<div class="cz-sem" data-action="cz-blok-sec" data-i="${i}" data-ad="${esc(b.ad.toLowerCase())}"><canvas width="240" height="170" data-sem="${i}"></canvas><span>${esc(b.ad)}</span>${b.kendi ? `<button class="icon-btn" data-action="cz-blok-sil" data-id="${esc(b.id)}" aria-label="Sil">${IC.trash}</button>` : ''}</div>`;
  const grup = (ad, liste) => liste.length ? `<h4 class="cz-semb" data-grup>${esc(ad)}</h4><div class="cz-semliste">${liste.map(b => kart(b, hepsi.indexOf(b))).join('')}</div>` : '';
  const ben = hepsi.filter(b => b.kendi), son = sonOku().map(ad => hepsi.find(b => b.ad === ad)).filter(Boolean);
  sayfa('Semboller', `<input id="czSemAra" type="search" placeholder="Ara: kapı, yatak, lavabo…" autocomplete="off" style="width:100%;margin-bottom:8px">${grup('Son kullanılanlar', son)}${SEM_SIRA.map(g => grup(g, hepsi.filter(b => !b.kendi && b.kat === g))).join('')}${grup('Benim bloklarım', ben)}<p class="cz-not">Seçtikten sonra komut çubuğundan ölçüleri değiştirebilirsin. Kapı ve pencere duvara yaklaşınca duvarın yönüne döner ve duvarda açıklık açar. ↻ 90° ile döndür, Aynala ile menteşe tarafını çevir. Kendi çizimini Seç aracıyla seçip "Blok yap" diyerek buraya ekleyebilirsin.</p>`);
  document.querySelectorAll('canvas[data-sem]').forEach(cn => {
    const b = hepsi[+cn.dataset.sem]; if (!b) return; const sn = { x0: 1e18, y0: 1e18, x1: -1e18, y1: -1e18 };
    for (const e of b.e) { const q = e.t === 'a' ? (() => { const n = CZ.tutma(e).filter(z => z.i !== 'merkez'); return { x0: Math.min(...n.map(z => z.p.x)), y0: Math.min(...n.map(z => z.p.y)), x1: Math.max(...n.map(z => z.p.x)), y1: Math.max(...n.map(z => z.p.y)) }; })() : e.t === 'x' ? { x0: e.p.x, y0: e.p.y, x1: e.p.x + e.s * .6, y1: e.p.y + e.s } : CZ.sinir(e); sn.x0 = Math.min(sn.x0, q.x0); sn.y0 = Math.min(sn.y0, q.y0); sn.x1 = Math.max(sn.x1, q.x1); sn.y1 = Math.max(sn.y1, q.y1); }
    const g2 = cn.getContext('2d'), w = Math.max(1, sn.x1 - sn.x0), h = Math.max(1, sn.y1 - sn.y0), k = Math.min(210 / w, 140 / h), v = { x: sn.x0 - (240 / k - w) / 2, y: sn.y0 - (170 / k - h) / 2, s: k };
    g2.fillStyle = '#f5f2e9'; g2.fillRect(0, 0, 240, 170); g2.lineWidth = 2; g2.lineJoin = 'round'; g2.lineCap = 'round';
    for (const e of b.e) { const kt = b.katlar[Math.min(e.k, b.katlar.length - 1)] || { r: '#25302b' }; g2.strokeStyle = g2.fillStyle = kt.r; yolCiz(g2, e, v, 170); }
  });
  S.blokListe = hepsi; setTimeout(() => $('#czSemAra')?.focus(), 80);
}
function blokSec(i) { const b = S.blokListe?.[i]; if (!b) return; sonYaz(b.ad); S.blok = { ad: b.ad, katlar: b.katlar, e: b.e, p: b.p, uret: b.uret, duvar: !!b.duvar }; S.blokP = (b.p || []).map(q => q.v); S.bRot = 0; S.bAyna = false; closeModal(); arac('blok', true); }
function blokYapSor() { if (!S.sel.size) return toast('Önce nesne seç'); sayfa('Blok yap', `<p class="cz-not">${S.sel.size} nesne seçili. Bir ad ver; Semboller listesinde "Benim bloklarım" altında görünür.</p><div class="cz-satir"><input id="czBlokAd" style="flex:1" maxlength="40" placeholder="Ör. Çalışma masası"></div><button class="btn primary" data-action="cz-blok-kaydet" style="width:100%">Kaydet</button>`); setTimeout(() => $('#czBlokAd')?.focus(), 80); }
function blokKaydet() {
  const ad = ($('#czBlokAd')?.value || '').trim().slice(0, 40); if (!ad) return; const ents = secVarlik(); if (!ents.length) return;
  let x0 = 1e18, y0 = 1e18, x1 = -1e18, y1 = -1e18; for (const e of ents) { const q = CZ.sinir(e, ts()); x0 = Math.min(x0, q.x0); y0 = Math.min(y0, q.y0); x1 = Math.max(x1, q.x1); y1 = Math.max(y1, q.y1); }
  const m = M.ote(-Math.round((x0 + x1) / 2), -Math.round((y0 + y1) / 2)), kmap = [], katlar = [], yeni = ents.filter(e => e.t !== 'd').map(e => { const n = CZ.donustur(e, m); if (!(e.k in kmap)) { kmap[e.k] = katlar.length; const kk = S.D.katlar[e.k] || { ad: 'Blok', r: '#25302b', w: .25 }; katlar.push({ ad: kk.ad, r: kk.r, w: kk.w }); } n.k = kmap[e.k]; return n; });
  if (!yeni.length) return toast('Ölçüler bloğa eklenemez; başka nesne seç');
  try { const l = bloklarOku(); if (l.length >= 40) return toast('En çok 40 blok saklanır. Birini sil.'); l.push({ id: 'b' + Date.now().toString(36), ad, katlar, e: yeni }); localStorage.setItem('cz-bloklar', JSON.stringify(l)); closeModal(); toast('Blok kaydedildi'); } catch { toast('Kaydedilemedi: tarayıcı depolaması dolu ya da kapalı'); }
}

/* ═════════ Resim altlığı (üstünden çizmek için; kaydedilmez, dışa aktarılmaz) ═════════ */
function altlikAc(f) {
  if (!/^image\/(png|jpeg|webp)$/.test(f.type)) return toast('PNG, JPEG ya da WEBP resim seç');
  if (f.size > 15 * 1024 * 1024) return toast('Resim çok büyük (en çok 15 MB)');
  const url = URL.createObjectURL(f), img = new Image();
  img.onload = () => {
    if (img.naturalWidth * img.naturalHeight > 60e6) { URL.revokeObjectURL(url); return toast('Resim çok büyük (en çok 60 megapiksel)'); }
    altKaldir(); const w = (W / S.v.s) * .8, h = w * img.naturalHeight / img.naturalWidth, c = dn(W / 2, H / 2); S.alt = { img, url, x: c.x - w / 2, y: c.y - h / 2, w, h, a: .5 }; ciz(); altMenu();
  };
  img.onerror = () => { URL.revokeObjectURL(url); toast('Resim açılamadı'); }; img.src = url;
}
function altKaldir() { if (S.alt) { URL.revokeObjectURL(S.alt.url); S.alt = null; } }
function altMenu() {
  if (!S.alt) { $('#czAlt').click(); return; }
  sayfa('Resim altlığı', `<div class="cz-satir"><span>Saydamlık</span><input type="range" min="0.1" max="1" step="0.05" value="${S.alt.a}" data-a="alt-sey" style="flex:1"></div>
    <div class="cz-liste"><button class="btn" data-action="cz-alt-olcek">Ölçeklendir (bilinen bir mesafeyle)</button><button class="btn" data-action="cz-alt-tasi">Taşı</button><button class="btn" data-action="cz-alt-degis">Başka resim seç</button><button class="btn" data-action="cz-alt-kaldir">Altlığı kaldır</button></div>
    <p class="cz-not">Önce "Ölçeklendir" ile resimdeki bilinen bir uzunluğu (ör. bir duvar) gir; sonra üstünden çiz. Resim cihazından çıkmaz. Altlık çizim kaydına ve dışa aktarılan dosyalara girmez, sayfa yenilenince kalkar.</p>`);
}

/* ═════════ Ayarlar ═════════ */
function ayarAc() {
  const t = store.get('theme', 'light');
  sayfa('Ayarlar', `<section><h4>Görünüm</h4><div class="seg yon-seg">${[['light', 'Cam'], ['dark', 'Koyu'], ['auto', 'Otomatik'], ['flat', 'Düz']].map(([k, n]) => `<button class="${t === k ? 'on' : ''}" data-action="cz-tema" data-t="${k}">${n}</button>`).join('')}</div></section>
    <section><h4>Çizim</h4><div class="cz-satir"><span>Çizim ölçeği</span><select data-a="belge-olcek">${CZ.OLCEKLER.map(o => `<option value="${o}" ${o === S.D.olcek ? 'selected' : ''}>1:${o}</option>`).join('')}</select></div>
    <p class="cz-not">Ölçü yazılarının ve oklarının boyunu belirler (kâğıtta 2,5 mm). Çizim milimetre cinsindendir.</p></section>
    <section><h4>Verilerin</h4><div class="set-row"><div><b>Çizimlerin cihazından çıkmaz</b><span>Çizim internete bağlanmaz. Çizimin yalnızca bu cihazda, tarayıcının kendi deposunda tutulur. Açtığın dosyalar hiçbir yere gönderilmez.</span></div></div></section>
    <section><h4>Uygulama</h4>${typeof aboutRow === 'function' ? aboutRow() : ''}</section>`);
}

/* ═════════ Olaylar ═════════ */
Object.assign(ACTIONS, {
  'cz-ayar': () => ayarAc(), settings: () => ayarAc(), 'cz-tema': el => { store.set('theme', el.dataset.t); applyTheme(el.dataset.t); ayarAc(); },
  'cz-arac': el => arac(el.dataset.k), 'cz-geri': () => geriAl(), 'cz-ileri': () => ileriAl(), 'cz-sigdir': () => { S.dokunuldu = false; sigdir(); ciz(); },
  'cz-ortho': el => { S.ortho = !S.ortho; el.classList.toggle('on', S.ortho); }, 'cz-yak': el => { S.yak = !S.yak; el.classList.toggle('on', S.yak); },
  'cz-yan': () => $('#czYan').classList.toggle('ac'), 'cz-dosya': () => dosyaMenu(), 'cz-bitir': () => bitir(false), 'cz-kapat': () => bitir(true),
  'cz-dizi-tur': el => { S.dz.tur = el.dataset.t; komCiz(); ciz(); }, 'cz-dizi-uygula': () => diziUygula(),
  'cz-dolgu-renk': el => { S.dolguR = el.dataset.r; S.dolguSil = false; komCiz(); }, 'cz-dolgu-alfa': el => { S.dolguA = +el.dataset.al; komCiz(); }, 'cz-dolgu-sil': () => { S.dolguSil = !S.dolguSil; komCiz(); },
  'cz-dolgu-duvar': () => { const i = S.D.katlar.findIndex(q => /duvar/i.test(q.ad)); if (i < 0) return toast('Duvar katmanı yok'); geriKaydet(); const k = S.D.katlar[i]; if (k.f) { delete k.f; delete k.fa; } else { k.f = S.dolguR; k.fa = 1; } komCiz(); ciz(); taslakZamanla(); },
  'cz-oda-tablo': () => odaTablo(), 'cz-kapi-tablo': () => kapiTablo(),
  'cz-oda-ekle': el => { const ad = ($('#czOda').value || 'Oda').trim().slice(0, 40), m2 = +el.dataset.m, cx = +el.dataset.x, cy = +el.dataset.y, h = 3 * S.D.olcek, k = katBul('Yazı', '#1b7fa6', .18), t2 = sayiBicim(m2) + ' m²'; geriKaydet(); S.D.e.push({ t: 'x', p: P(cx - ad.length * h * .3, cy + h * .3), s: h, rot: 0, txt: ad, k, oda: { ad, m2 } }, { t: 'x', p: P(cx - t2.length * h * .27, cy - h * 1.3), s: h * .85, rot: 0, txt: t2, k }); hepsiGuncelle(); closeModal(); },
  'cz-kat-ayar': (el, e) => { e.stopPropagation(); katAyar(+el.dataset.i); },
  'cz-kat-ad': el => { const l = S.D.katlar[+el.dataset.i], a = ($('#czKatAd').value || '').trim().slice(0, 40); if (l && a) { geriKaydet(); l.ad = a; } closeModal(); hepsiGuncelle(); },
  'cz-kat-kilit': el => { const l = S.D.katlar[+el.dataset.i]; if (!l) return; geriKaydet(); l.kilit = l.kilit ? 0 : 1; if (l.kilit) { for (const i of [...S.sel]) if (S.D.e[i]?.k === +el.dataset.i) S.sel.delete(i); } closeModal(); hepsiGuncelle(); },
  'cz-kat-yer': el => { const i = +el.dataset.i, j = i + +el.dataset.y, K = S.D.katlar; if (!K[i] || !K[j]) return; geriKaydet(); [K[i], K[j]] = [K[j], K[i]]; for (const e of S.D.e) { if (e.k === i) e.k = j; else if (e.k === j) e.k = i; } if (S.D.cur === i) S.D.cur = j; else if (S.D.cur === j) S.D.cur = i; closeModal(); hepsiGuncelle(); katAyar(j); },
  'cz-cap-tur': el => { S.capTur = el.dataset.t; komCiz(); }, 'cz-kopyala': () => panoKopyala(), 'cz-yapistir': () => { if (!panoOku()) return toast('Panoda nesne yok'); arac('yapistir', true); },
  'cz-pdf-bol': () => { S.pdf.bol = !S.pdf.bol; pdfAyar(); },
  'cz-aslini': () => { S.aslini = !S.aslini; komCiz(); }, 'cz-sil': () => sil(), 'cz-hepsi': () => { S.D.e.forEach((e, i) => { if (goruyor(e) && !kilitli(e)) S.sel.add(i); }); komCiz(); ozelCiz(); ciz(); },
  'cz-kat': (el, e) => { if (e.target.closest('input,select')) return; S.D.cur = +el.dataset.i; katCiz(); }, 'cz-kat-gor': (el, e) => { e.stopPropagation(); const k = S.D.katlar[+el.dataset.i]; k.v = k.v ? 0 : 1; katCiz(); ciz(); taslakZamanla(); },
  'cz-kat-ekle': () => sayfa('Yeni katman', `<div class="cz-satir"><input id="czKatAd" style="flex:1" maxlength="40" placeholder="Katman adı"></div><button class="btn primary" data-action="cz-kat-tamam" style="width:100%">Ekle</button>`),
  'cz-kat-tamam': () => { const a = ($('#czKatAd').value || '').trim().slice(0, 40); if (!a) return; geriKaydet(); S.D.katlar.push({ ad: a, r: '#25302b', w: .25, v: 1, lt: 0 }); S.D.cur = S.D.katlar.length - 1; closeModal(); katCiz(); },
  'cz-yazi-ekle': el => { const sat = ($('#czYz').value || '').split(/\r?\n/).map(q => q.trim().slice(0, 200)).filter(Boolean).slice(0, 12), s = parseFloat($('#czYy').value) || 2.5 * S.D.olcek; if (sat.length) { geriKaydet(); sat.forEach((t, i) => S.D.e.push(yeniKat({ t: 'x', p: P(+el.dataset.x, +el.dataset.y - i * 1.45 * s), s, rot: 0, txt: t }))); hepsiGuncelle(); } closeModal(); },
  'cz-yeni': () => belgeYukle(yeniBelge()), 'cz-ornek': () => belgeYukle(ornek()), 'cz-ac': () => $('#czDosya').click(), 'cz-tarayici': () => { tarayiciyaKaydet(); closeModal(); }, 'cz-kayitlilar': () => kayitlilar(),
  'cz-kayit-ac': el => { try { S.id = el.dataset.id; belgeYukle(CZ.belgeTemiz(JSON.parse(localStorage.getItem('cz-d-' + el.dataset.id)))); S.id = el.dataset.id; } catch { toast('Kayıt açılamadı'); } },
  'cz-kayit-sil': el => { try { localStorage.removeItem('cz-d-' + el.dataset.id); localStorage.setItem('cz-liste', JSON.stringify(liste().filter(k => k.id !== el.dataset.id))); } catch { /* */ } kayitlilar(); },
  'cz-dxf': () => { indir(new Blob([CZ.dxfYaz(S.D, ts())], { type: 'application/dxf' }), dosyaAdi('dxf')); closeModal(); },
  'cz-svg': () => { try { indir(new Blob([CZ.svgYaz(S.D)], { type: 'image/svg+xml' }), dosyaAdi('svg')); closeModal(); } catch (e) { toast(e.message); } },
  'cz-png': () => { pngCiz(); closeModal(); }, 'cz-yedek': () => { indir(new Blob([JSON.stringify(S.D)], { type: 'application/json' }), dosyaAdi('cizim.json')); closeModal(); },
  'cz-tarama-tur': el => { S.tarTur = el.dataset.t; komCiz(); }, 'cz-oto-hepsi': () => { S.otoHepsi = !S.otoHepsi; komCiz(); }, 'cz-oto-yon': () => { S.otoYon *= -1; komCiz(); },
  'cz-kose-tur': el => { S.koseTur = el.dataset.t; komCiz(); }, 'cz-alan-mod': () => { S.alanNokta = !S.alanNokta; S.pts = []; S.alanSon = null; komCiz(); ciz(); },
  'cz-alan-yazi': () => { const o = S.alanSon; if (!o) return; geriKaydet(); S.D.e.push({ t: 'x', p: P(o.merkez.x - ts() * 2, o.merkez.y), s: ts(), rot: 0, txt: `${sayiBicim(o.alan / 1e6)} m²`, k: katBul('Yazı', '#1b7fa6', .18) }); hepsiGuncelle(); },
  'cz-blok-menu': () => blokMenu(), 'cz-blok-sec': (el, e) => { if (e.target.closest('[data-action=cz-blok-sil]')) return; blokSec(+el.dataset.i); },
  'cz-blok-don': () => { S.bRot = (Math.round(S.bRot / (Math.PI / 2)) + 1) * Math.PI / 2; komCiz(); ciz(); }, 'cz-blok-ayna': () => { S.bAyna = !S.bAyna; komCiz(); ciz(); },
  'cz-duvar-yap': () => { S.duvarYap = !S.duvarYap; komCiz(); ciz(); }, 'cz-blok-yap': () => blokYapSor(), 'cz-blok-kaydet': () => blokKaydet(),
  'cz-blok-sil': (el, e) => { e.stopPropagation(); try { localStorage.setItem('cz-bloklar', JSON.stringify(bloklarOku().filter(b => b.id !== el.dataset.id))); } catch { /* */ } blokMenu(); },
  'cz-alt-menu': () => altMenu(), 'cz-alt-degis': () => $('#czAlt').click(), 'cz-alt-kaldir': () => { altKaldir(); ciz(); closeModal(); },
  'cz-alt-olcek': () => { closeModal(); arac('altolcek', true); }, 'cz-alt-tasi': () => { closeModal(); arac('alttasi', true); },
  'cz-alt-olcek-tamam': () => {
    const d = parseFloat(($('#czAltMes')?.value || '').replace(',', '.')), a = S.altP; if (!(d > 0) || !a || !S.alt) return toast('Geçerli bir mesafe yaz'); const f = d / (mes(a[0], a[1]) || 1); if (!(f > 1e-3 && f < 1e4)) return toast('Bu ölçek makul değil; mesafeyi kontrol et');
    S.alt.x = a[0].x + (S.alt.x - a[0].x) * f; S.alt.y = a[0].y + (S.alt.y - a[0].y) * f; S.alt.w *= f; S.alt.h *= f; closeModal(); arac('sec', true); S.dokunuldu = true; ciz();
  },
  'cz-antet-ac': () => { S.D.antet = { ...(S.D.antet || {}), goster: !S.D.antet?.goster }; taslakZamanla(); const k = S.pdf?.kagit; S.pdf = null; pdfAyar(k); },
  'cz-pdf-ayar': () => { S.pdf = null; pdfAyar(); }, 'cz-pdf-kagit': el => { S.pdf = { bol: S.pdf?.bol }; pdfAyar(el.dataset.k); },
  'cz-pdf-indir': () => { try { const r = CZ.pdfYaz(S.D, S.pdf); indir(new Blob([r.bayt], { type: 'application/pdf' }), dosyaAdi('pdf')); closeModal(); } catch (e) { toast(e.message); } }
});
document.addEventListener('change', e => {
  const t = e.target, a = t.dataset?.a;
  if (t.id === 'czAlt') { const f = t.files[0]; t.value = ''; if (f) { closeModal(); altlikAc(f); } return; }
  if (t.id === 'czDosya') { const f = t.files[0]; t.value = ''; if (f) dosyaAc(f); return; }
  if (a === 'kat-renk') { geriKaydet(); S.D.katlar[+t.dataset.i].r = t.value; ciz(); }
  else if (a === 'kat-kal') { S.D.katlar[+t.dataset.i].w = +t.value; taslakZamanla(); }
  else if (a === 'sel-kat') { if (t.value === '') return; geriKaydet(); for (const i of S.sel) S.D.e[i].k = +t.value; ozelCiz(); ciz(); }
  else if (a === 'blok-p') { const i = +t.dataset.i, q = S.blok?.p?.[i], n = parseFloat(String(t.value).replace(',', '.')); if (q && n >= q.min && n <= q.max) S.blokP[i] = n; else if (q) { toast(`${q.ad}: ${q.min} – ${q.max} mm arası olmalı`); } t.value = S.blokP[i]; ciz(); }
  else if (a === 'dizi-p') { const i = t.dataset.i, n = parseFloat(String(t.value).replace(',', '.')), z = S.dz, ad = { c: 'c0', r: 'r0', dx: 'dx', dy: 'dy', n: 'n', ac: 'ac' }[i]; if (isFinite(n) && (i === 'c' || i === 'r' || i === 'n' ? n >= 1 && n <= 200 && Number.isInteger(n) : i === 'ac' ? Math.abs(n) <= 360 : Math.abs(n) < 1e6)) z[ad] = n; else toast('Geçersiz değer'); t.value = z[ad]; ciz(); }
  else if (a === 'dolgu-renk') { if (/^#[0-9a-fA-F]{6}$/.test(t.value)) { S.dolguR = t.value; S.dolguSil = false; komCiz(); } }
  else if (a === 'kat-lt') { S.D.katlar[+t.dataset.i].lt = +t.value; ciz(); taslakZamanla(); }
  else if (a === 'alt-sey') { if (S.alt) { S.alt.a = Math.max(.1, Math.min(1, +t.value)); ciz(); } }
  else if (a === 'antet-proje') { S.D.antet = { ...(S.D.antet || {}), proje: t.value.slice(0, 60) }; taslakZamanla(); }
  else if (a === 'antet-cizen') { S.D.antet = { ...(S.D.antet || {}), cizen: t.value.slice(0, 40) }; taslakZamanla(); }
  else if (t.id === 'czKal') { const n = parseFloat(t.value.replace(',', '.')); if (n > 0 && n < 5000) S.duvK = n; else t.value = S.duvK; ciz(); }
  else if (a === 'pdf-olcek') pdfAyar(S.pdf.kagit, +t.value);
  else if (a === 'belge-olcek') { S.D.olcek = +t.value; ciz(); taslakZamanla(); }
  else if (t.id === 'czAd') { S.D.ad = t.value.slice(0, 80) || 'Adsız çizim'; taslakZamanla(); }
});
document.addEventListener('input', e => { if (e.target.id !== 'czSemAra') return; const q = e.target.value.trim().toLowerCase(); document.querySelectorAll('.cz-sem').forEach(c => { c.style.display = !q || c.dataset.ad.includes(q) ? '' : 'none'; }); document.querySelectorAll('[data-grup]').forEach(h4 => { const dev = h4.nextElementSibling; h4.style.display = dev && [...dev.children].some(c => c.style.display !== 'none') ? '' : 'none'; }); });
document.addEventListener('keydown', e => {
  const yaz = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName);
  if (e.target.id === 'czSayi' && e.key === 'Enter') { girdi(e.target.value); e.target.value = ''; return; }
  if (yaz) return;
  if (e.key === 'Escape') { if (S.pts.length || S.ofE >= 0) { S.pts = []; S.ofE = -1; komCiz(); ciz(); } else { S.sel.clear(); komCiz(); ozelCiz(); ciz(); } }
  else if ((e.key === 'Delete' || e.key === 'Backspace') && S.sel.size) sil();
  else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? ileriAl() : geriAl(); }
  else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && S.sel.size && !/INPUT|TEXTAREA/.test(document.activeElement?.tagName || '')) { e.preventDefault(); panoKopyala(); }
  else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v' && !/INPUT|TEXTAREA/.test(document.activeElement?.tagName || '') && panoOku()) { e.preventDefault(); arac('yapistir', true); }
  else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); ileriAl(); }
  else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') { e.preventDefault(); ACTIONS['cz-hepsi'](); }
  else if (e.key === 'Enter' && (S.tool === 'coklu' || S.tool === 'duvar' || S.tool === 'alan')) bitir(false);
  else if (/^[a-z]$/i.test(e.key) && !e.ctrlKey && !e.metaKey) { const m = { l: 'cizgi', c: 'daire', r: 'dik', m: 'tasi', o: 'ofset', t: 'yazi', s: 'sec', h: 'el', d: 'olcu', p: 'coklu', a: 'yay', w: 'duvar', e: 'oto' }[e.key.toLowerCase()]; if (m) arac(m); }
});

/* ═════════ İşaretçi (fare, dokunma, kalem) ═════════ */
const ptr = new Map(); let g = null, pinch = null, bosluk = false;
const yer = e => { const r = cv().getBoundingClientRect(); return P(e.clientX - r.left, e.clientY - r.top); };
const durumYaz = (w, son) => { const a = $('#czX'), b = $('#czY'), d = $('#czD'); if (!a) return; a.textContent = Math.round(w.x); b.textContent = Math.round(w.y); const q = S.imlec; d.innerHTML = son && q ? `L <b>${sayiBicim(mes(son, q))}</b> · ${Math.round(Math.atan2(q.y - son.y, q.x - son.x) * 180 / Math.PI)}°` : ''; };
function imlecGuncelle(p) { const t = S.tool; if (t === 'sec' || t === 'el') { durumYaz(dn(p.x, p.y), null); return; } const ham = dn(p.x, p.y - S.tOff), son = sonNokta(); S.imlec = yakala(ham, son); durumYaz(ham, son); ciz(); }
function baglaIsaretci() {
  const c = cv();
  c.addEventListener('pointerdown', e => {
    S.dokunuldu = true; c.setPointerCapture(e.pointerId); const p = yer(e); ptr.set(e.pointerId, { ...p, tip: e.pointerType });
    if (ptr.size === 2) { const [a, b] = [...ptr.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: S.v.s }; g = null; S.kutu = null; return; }
    S.tOff = e.pointerType === 'touch' && !['sec', 'el'].includes(S.tool) ? 56 : 0;
    if (e.button === 1 || S.tool === 'el' || bosluk) { g = { k: 'kaydir', x: p.x, y: p.y, vx: S.v.x, vy: S.v.y }; c.style.cursor = 'grabbing'; }
    else if (e.button === 2) { g = { k: 'sag' }; }
    else if (S.tool === 'sec') g = { k: 'sec', x: p.x, y: p.y, kutu: false };
    else { g = { k: 'nokta', x: p.x, y: p.y, hareket: 0 }; imlecGuncelle(p); }
  });
  c.addEventListener('pointermove', e => {
    const p = yer(e), onceki = ptr.get(e.pointerId); if (onceki) { if (g && g.hareket !== undefined) g.hareket += Math.hypot(p.x - onceki.x, p.y - onceki.y); ptr.set(e.pointerId, { ...p, tip: e.pointerType }); }
    if (ptr.size === 2 && pinch) { const [a, b] = [...ptr.values()], d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, w = dn(mx, my); S.v.s = Math.max(.0005, Math.min(5, pinch.s * d / pinch.d)); S.v.x = w.x - mx / S.v.s; S.v.y = w.y - (H - my) / S.v.s; ciz(); return; }
    if (g?.k === 'kaydir') { S.v.x = g.vx - (p.x - g.x) / S.v.s; S.v.y = g.vy + (p.y - g.y) / S.v.s; ciz(); return; }
    if (g?.k === 'sec') { if (!g.kutu && Math.hypot(p.x - g.x, p.y - g.y) > 8) g.kutu = true; if (g.kutu) { S.kutu = { x0: g.x, y0: g.y, x1: p.x, y1: p.y }; ciz(); } return; }
    if (e.pointerType === 'mouse' || g?.k === 'nokta') imlecGuncelle(p);
  });
  const bitirT = e => {
    const p = yer(e); const tip = ptr.get(e.pointerId)?.tip; ptr.delete(e.pointerId); if (ptr.size < 2) pinch = null; const gg = g; if (ptr.size === 0) g = null; if (!gg) return;
    if (gg.k === 'kaydir') { cv().style.cursor = S.tool === 'el' ? 'grab' : 'crosshair'; return; }
    if (gg.k === 'sag') { if (S.pts.length || S.ofE >= 0) { S.pts = []; S.ofE = -1; komCiz(); ciz(); } return; }
    if (gg.k === 'sec') { if (gg.kutu) { const k = S.kutu; S.kutu = null; kutuSec(k); } else tikSec(p.x, p.y); return; }
    if (gg.k === 'nokta') { if (tip !== 'touch' && gg.hareket > 6) return; const ham = dn(p.x, p.y - S.tOff), q = S.imlec || yakala(ham, sonNokta()); tikNokta(q, ham); S.tOff = 0; }
  };
  c.addEventListener('pointerup', bitirT);
  c.addEventListener('pointercancel', e => { ptr.delete(e.pointerId); pinch = null; g = null; S.kutu = null; ciz(); });
  c.addEventListener('contextmenu', e => e.preventDefault());
  c.addEventListener('wheel', e => { e.preventDefault(); S.dokunuldu = true; const p = yer(e), w = dn(p.x, p.y), f = e.deltaY < 0 ? 1.15 : 1 / 1.15; S.v.s = Math.max(.0005, Math.min(5, S.v.s * f)); S.v.x = w.x - p.x / S.v.s; S.v.y = w.y - (H - p.y) / S.v.s; ciz(); }, { passive: false });
  document.addEventListener('keydown', e => { if (e.code === 'Space' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)) { bosluk = true; e.preventDefault(); } });
  document.addEventListener('keyup', e => { if (e.code === 'Space') bosluk = false; });
}

/* ═════════ Başlangıç ═════════ */
function kabuk() {
  $('#app').innerHTML = `<div class="cz-kabuk">
    <div class="cz-ust"><div class="brand-mark sm">${IK.cizgi}</div><h1>Çizim</h1><input class="cz-ad" id="czAd" value="${esc(S.D.ad)}" maxlength="80" aria-label="Çizim adı">
      <div class="spacer"></div>
      <button class="d" data-action="cz-geri" title="Geri al">${IK.geri}</button><button class="d" data-action="cz-ileri" title="İleri al">${IK.ileri}</button><button class="d" data-action="cz-sigdir" title="Çizime sığdır">${IK.sigdir}</button>
      <button class="d k on" data-action="cz-ortho" title="Dik çizim">Ortho</button><button class="d k on" data-action="cz-yak" title="Yakala">Yakala</button>
      <button class="d k cz-mobil" data-action="cz-yan" title="Katmanlar">${IK.katman}</button><button class="d k" data-action="cz-dosya" title="Dosya">${IK.dosya}<span>Dosya</span></button>
      <button class="icon-btn" data-action="cz-ayar" title="Ayarlar">${IC.gear}</button></div>
    <div class="cz-govde"><div class="cz-arac">${GRUP.map(q => q === '-' ? '<hr>' : `<button class="d ${q[0] === S.tool ? 'on' : ''}" data-action="cz-arac" data-k="${q[0]}">${IK[q[0]]}<span>${q[1]}</span></button>`).join('')}</div>
      <div class="cz-alan" id="czAlan"><canvas id="czCv"></canvas><div class="cz-kom" id="czKom"></div><div class="cz-durum"><span>X <b id="czX">0</b></span><span>Y <b id="czY">0</b></span><span id="czD"></span></div></div>
      <div class="cz-yan" id="czYan"><h4>Katmanlar <button class="d k" data-action="cz-kat-ekle" style="height:26px;min-width:26px;padding:0 8px">+</button></h4><div id="czKat"></div><h4>Seçili</h4><div class="cz-ozel" id="czOzel"></div></div></div></div>
    <input type="file" id="czDosya" accept=".dxf,.dwg,.json,application/json" hidden><input type="file" id="czAlt" accept="image/png,image/jpeg,image/webp" hidden>`;
}
document.removeEventListener('DOMContentLoaded', boot);
function cizimBaslat() {
  document.documentElement.classList.add('cz-html');
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  try { const s = JSON.parse(localStorage.getItem('cz-son') || 'null'); if (s) { S.D = CZ.belgeTemiz(s); S.id = typeof s.id === 'string' ? s.id.slice(0, 20) : null; } } catch { /* bozuk taslak: boş başla */ }
  if (new URLSearchParams(location.search).has('ornek')) S.D = ornek();
  kabuk(); baglaIsaretci(); katCiz(); ozelCiz(); komCiz(); boyut(); arac('cizgi', true);
  window.__cz = { S, CZ, ciz, arac };
}
showLogin = msg => { if (msg) toast(msg); };
start = () => cizimBaslat();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', cizimBaslat); else cizimBaslat();
window.addEventListener('resize', boyut);
})();
