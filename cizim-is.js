/* ───────────── Çizim motoru ─────────────
   Geometri, düzenleme dönüşümleri, kırp/uzat/ofset, DXF okuma-yazma, ölçekli PDF, SVG.
   Her şey cihazda; dış kütüphane yok. Dosya okurken sınırlar var (boyut, nesne sayısı, iç içe blok). */
'use strict';

const CZ = (() => {
  const TAU = Math.PI * 2, hyp = Math.hypot, EPS = 1e-9;
  const SINIR = { dosya: 25 * 1024 * 1024, nesne: 200000, derin: 4 };
  const P = (x, y) => ({ x, y }), mes = (a, b) => hyp(a.x - b.x, a.y - b.y);
  const sayi = (v, d = 0) => (typeof v === 'number' && isFinite(v) ? v : d);
  const nokta = p => P(sayi(p?.x), sayi(p?.y));
  const norm = a => ((a % TAU) + TAU) % TAU;
  const sup = (e, t) => P(e.c.x + e.r * Math.cos(t), e.c.y + e.r * Math.sin(t));
  const yayAcisinda = (e, t) => { const s = norm(e.a1 - e.a0) || TAU; return norm(t - e.a0) <= s + 1e-9; };

  /* ═════════ Dönüşüm matrisleri [a,b,c,d,e,f] ═════════ */
  const M = {
    ote: (dx, dy) => [1, 0, 0, 1, dx, dy],
    don: (t, o) => { const c = Math.cos(t), s = Math.sin(t); return [c, s, -s, c, o.x - c * o.x + s * o.y, o.y - s * o.x - c * o.y]; },
    olcek: (k, o) => [k, 0, 0, k, o.x - k * o.x, o.y - k * o.y],
    ayna: (p, q) => {
      const l = mes(p, q) || 1, ux = (q.x - p.x) / l, uy = (q.y - p.y) / l, r11 = 2 * ux * ux - 1, r12 = 2 * ux * uy, r22 = 2 * uy * uy - 1;
      return [r11, r12, r12, r22, p.x - (r11 * p.x + r12 * p.y), p.y - (r12 * p.x + r22 * p.y)];
    },
    ap: (m, p) => P(m[0] * p.x + m[2] * p.y + m[4], m[1] * p.x + m[3] * p.y + m[5]),
    carp: (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]]
  };
  function donustur(e, m) {
    const f = p => M.ap(m, p), det = m[0] * m[3] - m[1] * m[2], k = Math.sqrt(Math.abs(det)), yans = det < 0, n = JSON.parse(JSON.stringify(e));
    if (e.t === 'l') { n.a = f(e.a); n.b = f(e.b); }
    else if (e.t === 'p') { n.pts = e.pts.map(f); if (e.wr) n.wr = e.wr.map(h => h.map(f)); }
    else if (e.t === 'c') { n.c = f(e.c); n.r = e.r * k; }
    else if (e.t === 'a') {
      const p0 = f(sup(e, e.a0)), p1 = f(sup(e, e.a1)); n.c = f(e.c); n.r = e.r * k;
      let a0 = Math.atan2(p0.y - n.c.y, p0.x - n.c.x), a1 = Math.atan2(p1.y - n.c.y, p1.x - n.c.x); if (yans) [a0, a1] = [a1, a0]; n.a0 = a0; n.a1 = a1;
    }
    else if (e.t === 'd') { n.a = f(e.a); n.b = f(e.b); n.o = e.o * k * (yans ? -1 : 1); }
    else if (e.t === 'x') { n.p = f(e.p); n.s = e.s * k; n.rot = yans ? e.rot : e.rot + Math.atan2(m[1], m[0]); }
    return n;
  }

  /* ═════════ Parçalar, sınırlar, uzaklık ═════════ */
  function parcalar(e) {
    if (e.t === 'l') return [[e.a, e.b]];
    if (e.t === 'p') { const r = []; for (let i = 0; i < e.pts.length - 1; i++) r.push([e.pts[i], e.pts[i + 1]]); if (e.kapali && e.pts.length > 2) r.push([e.pts[e.pts.length - 1], e.pts[0]]); return r; }
    return [];
  }
  function olcuGeo(e, ts, tik) {
    const dx = e.b.x - e.a.x, dy = e.b.y - e.a.y, u = hyp(dx, dy) || 1, nx = -dy / u, ny = dx / u, o = e.o, g = Math.sign(o || 1) * tik * 0.8;
    const A = P(e.a.x + nx * o, e.a.y + ny * o), B = P(e.b.x + nx * o, e.b.y + ny * o), ux = dx / u, uy = dy / u;
    const cizgiler = [[e.a, P(A.x + nx * g, A.y + ny * g)], [e.b, P(B.x + nx * g, B.y + ny * g)], [A, B]];
    for (const q of [A, B]) cizgiler.push([P(q.x - (ux + nx) * tik * .5, q.y - (uy + ny) * tik * .5), P(q.x + (ux + nx) * tik * .5, q.y + (uy + ny) * tik * .5)]);
    let rot = Math.atan2(dy, dx); if (rot > Math.PI / 2 || rot < -Math.PI / 2) rot += Math.PI;
    const mid = P((A.x + B.x) / 2, (A.y + B.y) / 2);
    return { cizgiler, yazi: { p: P(mid.x - Math.sin(rot) * ts * .6, mid.y + Math.cos(rot) * ts * .6), rot, s: ts, t: String(Math.round(u * 100) / 100).replace(/\.0+$/, '') } };
  }
  const yaziGen = x => (x.txt || '').length * x.s * 0.55;
  function sinir(e, ts = 250) {
    let a = 1e18, b = 1e18, c = -1e18, d = -1e18; const ek = p => { a = Math.min(a, p.x); b = Math.min(b, p.y); c = Math.max(c, p.x); d = Math.max(d, p.y); };
    if (e.t === 'l') { ek(e.a); ek(e.b); } else if (e.t === 'p') e.pts.forEach(ek);
    else if (e.t === 'c' || e.t === 'a') { ek(P(e.c.x - e.r, e.c.y - e.r)); ek(P(e.c.x + e.r, e.c.y + e.r)); }
    else if (e.t === 'd') { ek(e.a); ek(e.b); const g = olcuGeo(e, ts, ts * .6); g.cizgiler.forEach(([p, q]) => { ek(p); ek(q); }); }
    else if (e.t === 'x') { ek(e.p); ek(P(e.p.x + Math.cos(e.rot) * yaziGen(e), e.p.y + Math.sin(e.rot) * yaziGen(e))); ek(P(e.p.x - Math.sin(e.rot) * e.s, e.p.y + Math.cos(e.rot) * e.s)); }
    return { x0: a, y0: b, x1: c, y1: d };
  }
  function noktaSeg(p, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y, l = dx * dx + dy * dy; let t = l ? ((p.x - a.x) * dx + (p.y - a.y) * dy) / l : 0; t = Math.max(0, Math.min(1, t));
    return hyp(p.x - a.x - t * dx, p.y - a.y - t * dy);
  }
  function uzak(e, p, ts = 250) {
    if (e.t === 'c') return Math.abs(mes(p, e.c) - e.r);
    if (e.t === 'a') { const t = Math.atan2(p.y - e.c.y, p.x - e.c.x); if (yayAcisinda(e, t)) return Math.abs(mes(p, e.c) - e.r); return Math.min(mes(p, sup(e, e.a0)), mes(p, sup(e, e.a1))); }
    if (e.t === 'd') { const g = olcuGeo(e, ts, ts * .6); let m = 1e18; for (const [a, b] of g.cizgiler) m = Math.min(m, noktaSeg(p, a, b)); return m; }
    if (e.t === 'x') { const s = sinir(e); return (p.x >= s.x0 && p.x <= s.x1 && p.y >= s.y0 && p.y <= s.y1) ? 0 : 1e18; }
    let m = 1e18; for (const [a, b] of parcalar(e)) m = Math.min(m, noktaSeg(p, a, b)); return m;
  }

  /* ═════════ Tutma noktaları ve kesişimler ═════════ */
  function tutma(e) {
    const r = [], mid = (a, b) => P((a.x + b.x) / 2, (a.y + b.y) / 2);
    if (e.t === 'l') r.push({ p: e.a, i: 'uç' }, { p: e.b, i: 'uç' }, { p: mid(e.a, e.b), i: 'orta' });
    else if (e.t === 'p') { e.pts.forEach(q => r.push({ p: q, i: 'uç' })); for (const [a, b] of parcalar(e)) r.push({ p: mid(a, b), i: 'orta' }); }
    else if (e.t === 'c') { r.push({ p: e.c, i: 'merkez' }); for (let i = 0; i < 4; i++) r.push({ p: sup(e, i * Math.PI / 2), i: 'çeyrek' }); }
    else if (e.t === 'a') { r.push({ p: e.c, i: 'merkez' }, { p: sup(e, e.a0), i: 'uç' }, { p: sup(e, e.a1), i: 'uç' }, { p: sup(e, e.a0 + (norm(e.a1 - e.a0) || TAU) / 2), i: 'orta' }); }
    else if (e.t === 'd') r.push({ p: e.a, i: 'uç' }, { p: e.b, i: 'uç' });
    else if (e.t === 'x') r.push({ p: e.p, i: 'uç' });
    return r;
  }
  function segSeg(a, b, c, d) {
    const r = P(b.x - a.x, b.y - a.y), s = P(d.x - c.x, d.y - c.y), den = r.x * s.y - r.y * s.x; if (Math.abs(den) < EPS) return null;
    const t = ((c.x - a.x) * s.y - (c.y - a.y) * s.x) / den, u = ((c.x - a.x) * r.y - (c.y - a.y) * r.x) / den; return { t, u };
  }
  // Sonsuz doğrular kesişimi (açı ölçüsü için)
  function segSegSonsuz(a, b, c, d) { const r = segSeg(a, b, c, d); return r ? P(a.x + (b.x - a.x) * r.t, a.y + (b.y - a.y) * r.t) : null; }
  function segDaire(a, b, c, r) {
    const dx = b.x - a.x, dy = b.y - a.y, fx = a.x - c.x, fy = a.y - c.y, A = dx * dx + dy * dy, B = 2 * (fx * dx + fy * dy), C = fx * fx + fy * fy - r * r;
    if (A < EPS) return []; const D = B * B - 4 * A * C; if (D < 0) return []; const q = Math.sqrt(D); return [(-B - q) / (2 * A), (-B + q) / (2 * A)].filter((v, i, z) => i === 0 || Math.abs(v - z[0]) > 1e-9);
  }
  // a→b doğrusunun diğer nesnelerle kesişimleri (t: a→b üzerindeki oran). sinirsiz=true ise a→b doğrusu uzatılır.
  function kesisimler(a, b, digerleri, sinirsiz) {
    const r = [];
    for (const e of digerleri) {
      for (const [c, d] of parcalar(e)) { const k = segSeg(a, b, c, d); if (k && k.u >= -1e-9 && k.u <= 1 + 1e-9 && (sinirsiz || (k.t >= -1e-9 && k.t <= 1 + 1e-9))) r.push({ t: k.t, p: P(a.x + (b.x - a.x) * k.t, a.y + (b.y - a.y) * k.t) }); }
      if (e.t === 'c' || e.t === 'a') for (const t of segDaire(a, b, e.c, e.r)) {
        if (!sinirsiz && (t < -1e-9 || t > 1 + 1e-9)) continue; const p = P(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
        if (e.t === 'a' && !yayAcisinda(e, Math.atan2(p.y - e.c.y, p.x - e.c.x))) continue; r.push({ t, p });
      }
    }
    return r;
  }
  function yakinKesisim(p, tol, ents) {
    const yakin = ents.filter(e => { const s = sinir(e); return p.x >= s.x0 - tol && p.x <= s.x1 + tol && p.y >= s.y0 - tol && p.y <= s.y1 + tol; }).slice(0, 40), r = [];
    for (let i = 0; i < yakin.length; i++) for (let j = i + 1; j < yakin.length; j++) {
      const A = yakin[i], B = yakin[j];
      for (const [a, b] of parcalar(A)) for (const k of kesisimler(a, b, [B], false)) if (mes(k.p, p) < tol) r.push({ p: k.p, i: 'kesişim' });
    }
    return r;
  }

  /* ═════════ Kırp / Uzat / Ofset ═════════ */
  function kirp(e, tik, digerleri) {
    if (e.t !== 'l') return { hata: 'Kırpma yalnız çizgilerde çalışır. Çoklu çizgiyi önce "Parçala".' };
    const ts = kesisimler(e.a, e.b, digerleri, false).map(k => k.t).filter(t => t > 1e-6 && t < 1 - 1e-6).sort((x, y) => x - y);
    if (!ts.length) return { hata: 'Bu çizgiyi kesen başka bir nesne yok.' };
    const dx = e.b.x - e.a.x, dy = e.b.y - e.a.y, l2 = dx * dx + dy * dy, t0 = ((tik.x - e.a.x) * dx + (tik.y - e.a.y) * dy) / l2;
    let lo = 0, hi = 1; for (const t of ts) { if (t <= t0) lo = t; else { hi = t; break; } }
    const at = t => P(e.a.x + dx * t, e.a.y + dy * t), yeni = [];
    if (lo > 1e-6) yeni.push({ ...e, a: e.a, b: at(lo) }); if (hi < 1 - 1e-6) yeni.push({ ...e, a: at(hi), b: e.b });
    return { yeni };
  }
  function uzat(e, tik, digerleri) {
    if (e.t !== 'l') return { hata: 'Uzatma yalnız çizgilerde çalışır.' };
    const sonB = mes(tik, e.b) < mes(tik, e.a), ts = kesisimler(e.a, e.b, digerleri, true).map(k => k.t);
    if (sonB) { const t = ts.filter(t => t > 1 + 1e-6).sort((x, y) => x - y)[0]; if (t === undefined) return { hata: 'Uzatılacak bir sınır nesnesi bulunamadı.' }; return { yeni: [{ ...e, b: P(e.a.x + (e.b.x - e.a.x) * t, e.a.y + (e.b.y - e.a.y) * t) }] }; }
    const t = ts.filter(t => t < -1e-6).sort((x, y) => y - x)[0]; if (t === undefined) return { hata: 'Uzatılacak bir sınır nesnesi bulunamadı.' };
    return { yeni: [{ ...e, a: P(e.a.x + (e.b.x - e.a.x) * t, e.a.y + (e.b.y - e.a.y) * t) }] };
  }
  function ofset(e, d, taraf) {
    if (e.t === 'l') { const dx = e.b.x - e.a.x, dy = e.b.y - e.a.y, u = hyp(dx, dy) || 1, s = Math.sign((taraf.x - e.a.x) * -dy + (taraf.y - e.a.y) * dx) || 1, nx = -dy / u * d * s, ny = dx / u * d * s; return { ...e, a: P(e.a.x + nx, e.a.y + ny), b: P(e.b.x + nx, e.b.y + ny) }; }
    if (e.t === 'c' || e.t === 'a') { const dis = mes(taraf, e.c) > e.r, r = dis ? e.r + d : e.r - d; return r > 0 ? { ...e, r } : null; }
    if (e.t === 'p' && e.pts.length > 1) {
      const n = e.pts.length, kap = e.kapali && n > 2, m = kap ? n : n - 1; let isaret;
      if (kap) { let alan = 0; for (let i = 0; i < n; i++) { const a = e.pts[i], b = e.pts[(i + 1) % n]; alan += a.x * b.y - b.x * a.y; } isaret = (alan > 0 ? 1 : -1) * (noktaIcinde(taraf, e.pts) ? 1 : -1); }
      else { const a = e.pts[0], b = e.pts[1]; isaret = Math.sign((taraf.x - a.x) * -(b.y - a.y) + (taraf.y - a.y) * (b.x - a.x)) || 1; }
      const seg = [];
      for (let i = 0; i < m; i++) {
        const a = e.pts[i], b = e.pts[(i + 1) % n], dx = b.x - a.x, dy = b.y - a.y, u = hyp(dx, dy) || 1, nx = -dy / u * d * isaret, ny = dx / u * d * isaret;
        seg.push([P(a.x + nx, a.y + ny), P(b.x + nx, b.y + ny)]);
      }
      const kes = (A, B) => { const k = segSeg(A[0], A[1], B[0], B[1]); return k ? P(A[0].x + (A[1].x - A[0].x) * k.t, A[0].y + (A[1].y - A[0].y) * k.t) : B[0]; };
      const pts = [];
      if (kap) for (let i = 0; i < m; i++) pts.push(kes(seg[(i + m - 1) % m], seg[i]));
      else { pts.push(seg[0][0]); for (let i = 1; i < m; i++) pts.push(kes(seg[i - 1], seg[i])); pts.push(seg[m - 1][1]); }
      return { ...e, pts };
    }
    return null;
  }
  function noktaIcinde(p, pts) { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) if ((pts[i].y > p.y) !== (pts[j].y > p.y) && p.x < (pts[j].x - pts[i].x) * (p.y - pts[i].y) / (pts[j].y - pts[i].y) + pts[i].x) c = !c; return c; }
  function parcala(e) {
    if (e.t === 'p') return parcalar(e).map(([a, b]) => ({ t: 'l', a: nokta(a), b: nokta(b), k: e.k }));
    return null;
  }


  /* ═════════ Çizgi türleri (kâğıt milimetresi cinsinden desenler) ═════════ */
  const LT = [null, [3, 1.5], [8, 1.5, 1.5, 1.5], [0.5, 1.6]], LT_AD = ['Sürekli', 'Kesik', 'Eksen', 'Noktalı'], LT_DXF = ['CONTINUOUS', 'DASHED', 'CENTER', 'DOT'];

  /* ═════════ Kapalı bölgeler: alan, tarama ═════════ */
  function halka(e) {
    if (e.t === 'p' && e.kapali && e.pts.length > 2) return e.pts;
    if (e.t === 'c' && e.r > 0) { const n = 72, r = []; for (let i = 0; i < n; i++) r.push(P(e.c.x + e.r * Math.cos(i * TAU / n), e.c.y + e.r * Math.sin(i * TAU / n))); return r; }
    return null;
  }
  function halkaAlan(h) { let s = 0; for (let i = 0; i < h.length; i++) { const a = h[i], b = h[(i + 1) % h.length]; s += a.x * b.y - b.x * a.y; } return s / 2; }
  function alanOlc(e) {
    if (e.t === 'c') return { alan: Math.PI * e.r * e.r, cevre: TAU * e.r, merkez: P(e.c.x, e.c.y) };
    const h = Array.isArray(e) ? e : halka(e); if (!h) return null;
    let cevre = 0, cx = 0, cy = 0; const A = halkaAlan(h);
    for (let i = 0; i < h.length; i++) { const a = h[i], b = h[(i + 1) % h.length], c = a.x * b.y - b.x * a.y; cevre += mes(a, b); cx += (a.x + b.x) * c; cy += (a.y + b.y) * c; }
    const merkez = Math.abs(A) > 1e-9 ? P(cx / (6 * A), cy / (6 * A)) : P(h.reduce((s, q) => s + q.x, 0) / h.length, h.reduce((s, q) => s + q.y, 0) / h.length);
    return { alan: Math.abs(A), cevre, merkez };
  }
  // p noktasını içeren en küçük kapalı şekil + onun içinde kalan (delik) şekiller
  function bolgeBul(ents, p, ok = () => true) {
    let en = -1, ea = Infinity; const adaylar = [];
    ents.forEach((e, i) => {
      if (!ok(e)) return; const h = halka(e); if (!h) return;
      const ic = e.t === 'c' ? mes(p, e.c) < e.r : noktaIcinde(p, h), a = Math.abs(halkaAlan(h)); adaylar.push({ i, h, a });
      if (ic && a < ea) { ea = a; en = i; }
    });
    if (en < 0) return null;
    const dis = adaylar.find(q => q.i === en);
    const icler = adaylar.filter(q => q.i !== en && q.a < dis.a && q.h.every(pt => noktaIcinde(pt, dis.h))).map(q => q.h);
    return { i: en, dis: dis.h, icler };
  }
  // Duvar çizgileriyle çevrili odayı bulur: çizgiler kesişimlerinde bölünür, p noktasını içeren yüz izlenir.
  // Döner { dis, icler } (bolgeBul ile aynı biçim) ya da { hata } / null
  function odaBul(ents, p, ok = () => true) {
    const seg = []; for (const e of ents) { if (!ok(e)) continue; if (e.t === 'l' || e.t === 'p') for (const [a, b] of parcalar(e)) if (mes(a, b) > 0.5) seg.push([a, b]); }
    if (!seg.length) return null; if (seg.length > 2500) return { hata: 'Çok fazla duvar çizgisi var, alan bulunamadı.' };
    const kesim = seg.map(() => [0, 1]);
    for (let i = 0; i < seg.length; i++) {
      const [a, b] = seg[i], L = mes(a, b);
      for (let j = 0; j < seg.length; j++) {
        if (i === j) continue; const [c, d] = seg[j];
        for (const q of [c, d]) { if (noktaSeg(q, a, b) < 0.6) { const t = ((q.x - a.x) * (b.x - a.x) + (q.y - a.y) * (b.y - a.y)) / (L * L); if (t > 0 && t < 1) kesim[i].push(t); } }
        if (j > i) { const r = segSeg(a, b, c, d); if (r && r.t > 1e-9 && r.t < 1 - 1e-9 && r.u > 1e-9 && r.u < 1 - 1e-9) { kesim[i].push(r.t); kesim[j].push(r.u); } }
      }
    }
    const dugum = new Map(), N = [], anahtar = q => Math.round(q.x * 2) + ',' + Math.round(q.y * 2);
    const nd = q => { const a = anahtar(q); let i = dugum.get(a); if (i === undefined) { i = N.length; dugum.set(a, i); N.push({ p: P(q.x, q.y), k: [] }); } return i; };
    const kenar = [], goruldu = new Set();
    seg.forEach(([a, b], i) => { const ts = [...new Set(kesim[i].map(t => Math.round(t * 1e7) / 1e7))].sort((x, y) => x - y); for (let m = 0; m + 1 < ts.length; m++) { const A = nd(P(a.x + (b.x - a.x) * ts[m], a.y + (b.y - a.y) * ts[m])), B = nd(P(a.x + (b.x - a.x) * ts[m + 1], a.y + (b.y - a.y) * ts[m + 1])); if (A === B) continue; const ka = A < B ? A + '_' + B : B + '_' + A; if (goruldu.has(ka)) continue; goruldu.add(ka); const id = kenar.length; kenar.push([A, B]); N[A].k.push([B, id]); N[B].k.push([A, id]); } });
    const dis = new Set(), icler = [];
    for (let tur = 0; tur < 12; tur++) {
      // p'den hafif eğik bir ışın at, en yakın kenarı bul
      const dx = 1, dy = 0.01373; let en = -1, et = Infinity;
      kenar.forEach(([A, B], id) => { if (dis.has(id)) return; const a = N[A].p, b = N[B].p, r = segSeg(p, P(p.x + dx, p.y + dy), a, b); if (r && r.t > 1e-9 && r.u >= 0 && r.u <= 1 && r.t < et) { et = r.t; en = id; } });
      if (en < 0) return null;
      let [A, B] = kenar[en]; const a = N[A].p, b = N[B].p; if ((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x) < 0) [A, B] = [B, A];
      const baslangic = A + '>' + B; let u = A, v = B; const yol = [u], ids = new Set(); let guvenli = 0;
      for (;;) {
        const gelen = Math.atan2(N[u].p.y - N[v].p.y, N[u].p.x - N[v].p.x); let en2 = null, ed = Infinity;
        for (const [w, id] of N[v].k) { if (dis.has(id)) continue; let d = gelen - Math.atan2(N[w].p.y - N[v].p.y, N[w].p.x - N[v].p.x); d = ((d % TAU) + TAU) % TAU; if (d < 1e-9) d = TAU; if (d < ed) { ed = d; en2 = [w, id]; } }
        if (!en2) return null; ids.add(en2[1]); const w = en2[0]; u = v; v = w; yol.push(u); if (u + '>' + v === baslangic || ++guvenli > 6000) break;
      }
      if (guvenli > 6000) return { hata: 'Oda sınırı kapalı değil (duvarda boşluk olabilir).' };
      const pts = yol.slice(0, -1).map(i => N[i].p); const al = halkaAlan(pts);
      if (al > 0 && noktaIcinde(p, pts)) { const ic = icler.filter(h => h.every(q => noktaIcinde(q, pts))); return { dis: pts, icler: ic }; }
      // delik (ada) ya da dış yüz: bu parçayı çıkar, tekrar dene
      if (al < 0) icler.push(pts);
      for (const id of ids) dis.add(id);
      ids.add(en); dis.add(en);
    }
    return null;
  }
  // Dolgu listesi: [{ h: halkalar (çift-tek), r: renk, a: saydamlık }]. Katman dolgusu (duvar) bölge halkalarıyla, şekil dolgusu kendi çizgisiyle
  function dolgular(D) {
    const out = [], gor = new Set(), daire = e => Array.from({ length: 72 }, (_, i) => P(e.c.x + e.r * Math.cos(i * TAU / 72), e.c.y + e.r * Math.sin(i * TAU / 72)));
    for (const e of D.e) {
      const k = D.katlar[e.k]; if (!k || !k.v) continue; const kapal = e.t === 'p' && e.kapali && e.pts.length > 2 ? [e.pts] : e.t === 'c' ? [daire(e)] : null;
      if (e.f && (kapal || e.wr)) out.push({ h: e.wr || kapal, r: e.f, a: e.fa ?? .5 });
      else if (k.f) { const h = e.wr || kapal; if (!h) continue; const key = e.k + ':' + h.map(r => r.length + ':' + Math.round(r[0].x) + ',' + Math.round(r[0].y)).join('|'); if (gor.has(key)) continue; gor.add(key); out.push({ h, r: k.f, a: k.fa ?? 1 }); }
    }
    return out;
  }
  const beyazaKar = (hex, a) => hexRgb(hex).map(v => 1 - a + a * v);
  // Çizgilerle tarama: çift-tek kuralı sayesinde içerideki şekiller delik olur. Çıktı sıradan çizgilerdir.
  function tarama(halkalar, aralik, aciDerece, k, maks = 6000) {
    if (!(aralik > 0)) return { hata: 'Tarama aralığı sıfırdan büyük olmalı.' };
    const t = aciDerece * Math.PI / 180, c = Math.cos(t), s = Math.sin(t), R = p => P(p.x * c + p.y * s, -p.x * s + p.y * c), B = p => P(p.x * c - p.y * s, p.x * s + p.y * c);
    const H = halkalar.map(h => h.map(R)); let y0 = Infinity, y1 = -Infinity; for (const h of H) for (const q of h) { y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y); }
    if ((y1 - y0) / aralik > maks) return { hata: 'Tarama aralığı bu alan için çok sık. Aralığı büyüt.' };
    const out = [];
    for (let y = (Math.floor(y0 / aralik) + 0.5) * aralik; y < y1; y += aralik) {
      if (y < y0) continue; const xs = [];
      for (const h of H) for (let i = 0; i < h.length; i++) { const a = h[i], b = h[(i + 1) % h.length]; if ((a.y <= y) !== (b.y <= y)) xs.push(a.x + (y - a.y) * (b.x - a.x) / (b.y - a.y)); }
      xs.sort((u, v) => u - v);
      for (let i = 0; i + 1 < xs.length; i += 2) if (xs[i + 1] - xs[i] > 1e-6) out.push({ t: 'l', a: B(P(xs[i], y)), b: B(P(xs[i + 1], y)), k });
      if (out.length > maks) return { hata: 'Tarama çok fazla çizgi üretirdi. Aralığı büyüt.' };
    }
    return { e: out };
  }

  // Tarama desenleri (hepsi sıradan çizgi/daire): tuğla, beton, ahşap, toprak, yalıtım
  const DESEN_AD = { tugla: 'Tuğla', beton: 'Beton', ahsap: 'Ahşap', toprak: 'Toprak', yalitim: 'Yalıtım' };
  function desen(halkalar, tur, aralik, k, maks = 6000) {
    if (!(aralik > 0)) return { hata: 'Tarama aralığı sıfırdan büyük olmalı.' };
    const ic = q => { let c = false; for (const h of halkalar) if (noktaIcinde(q, h)) c = !c; return c; };
    const hash = (a, b) => { let x = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return x - Math.floor(x); };
    const sat = (a, b) => ic(a) && ic(b) && ic(P((a.x + b.x) / 2, (a.y + b.y) / 2));
    let out = [];
    if (tur === 'beton') {
      const r = tarama(halkalar, aralik * 2, 45, k, maks); if (r.hata) return r; out = r.e;
      let y0 = 1e18, y1 = -1e18, x0 = 1e18, x1 = -1e18; for (const h of halkalar) for (const q of h) { y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y); x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); }
      for (let y = y0 + aralik; y < y1; y += aralik) for (let x = x0 + aralik; x < x1; x += aralik) { const q = P(x + (hash(x, y) - .5) * aralik, y + (hash(y, x) - .5) * aralik); if (hash(x + 1, y + 3) > .45 && ic(q) && out.length < maks) out.push({ t: 'c', c: q, r: aralik * (.07 + hash(x, y + 9) * .06), k }); }
    } else if (tur === 'ahsap') {
      const r = tarama(halkalar, aralik * .6, 0, k, maks); if (r.hata) return r;
      r.e.forEach((l, i) => { if (hash(i, 3) > .25) out.push(l); }); // kimi çizgi yarım kalır: damar etkisi
    } else if (tur === 'tugla') {
      const r = tarama(halkalar, aralik, 0, k, maks); if (r.hata) return r; out = r.e;
      let y0 = 1e18, y1 = -1e18, x0 = 1e18, x1 = -1e18; for (const h of halkalar) for (const q of h) { y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y); x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); }
      for (let y = (Math.floor(y0 / aralik) + .5) * aralik, sat_ = 0; y < y1; y += aralik, sat_++) for (let x = Math.floor(x0 / (2 * aralik)) * 2 * aralik + (sat_ % 2 ? aralik : 0); x < x1; x += 2 * aralik) { const a = P(x, y), b = P(x, y + aralik); if (sat(a, b) && out.length < maks) out.push({ t: 'l', a, b, k }); }
    } else if (tur === 'toprak') {
      const r = tarama(halkalar, aralik, 45, k, maks); if (r.hata) return r; out = r.e;
      r.e.forEach((l, i) => { if (i % 2) return; const m = P((l.a.x + l.b.x) / 2, (l.a.y + l.b.y) / 2), u = hyp(l.b.x - l.a.x, l.b.y - l.a.y) || 1, nx = -(l.b.y - l.a.y) / u * aralik * .35, ny = (l.b.x - l.a.x) / u * aralik * .35, a = P(m.x - nx, m.y - ny), b = P(m.x + nx, m.y + ny); if (sat(a, b)) out.push({ t: 'l', a, b, k }); });
    } else if (tur === 'yalitim') {
      const r = tarama(halkalar, aralik * 1.2, 0, k, maks); if (r.hata) return r;
      for (const l of r.e) { const pts = [], n = Math.max(2, Math.round(Math.abs(l.b.x - l.a.x) / (aralik * .5))), g = aralik * .4; for (let i = 0; i <= n; i++) { const q = P(l.a.x + (l.b.x - l.a.x) * i / n, l.a.y + (i % 2 ? g : -g)); pts.push(q); } if (pts.every(q => ic(q))) out.push({ t: 'p', pts, kapali: false, k }); else out.push(l); }
    } else return { hata: 'Bilinmeyen tarama deseni.' };
    if (out.length > maks) return { hata: 'Tarama çok fazla çizgi üretirdi. Aralığı büyüt.' };
    return { e: out };
  }

  /* ═════════ Köşe yuvarlama / pah ═════════ */
  function kose(e1, e2, tik1, tik2, d, tur) {
    if (e1.t !== 'l' || e2.t !== 'l') return { hata: 'Köşe yalnız çizgilerde çalışır. Dikdörtgeni/çoklu çizgiyi önce "Parçala".' };
    const r = segSeg(e1.a, e1.b, e2.a, e2.b); if (!r) return { hata: 'Bu iki çizgi paralel, köşe oluşmaz.' };
    const X = P(e1.a.x + (e1.b.x - e1.a.x) * r.t, e1.a.y + (e1.b.y - e1.a.y) * r.t);
    const yon = (e, tik) => {
      const dx = e.b.x - e.a.x, dy = e.b.y - e.a.y, u = hyp(dx, dy) || 1, ux = dx / u, uy = dy / u; let s = (tik.x - X.x) * ux + (tik.y - X.y) * uy;
      if (Math.abs(s) < 1e-9) s = ((e.a.x + e.b.x) / 2 - X.x) * ux + ((e.a.y + e.b.y) / 2 - X.y) * uy; const sg = s >= 0 ? 1 : -1, v = P(ux * sg, uy * sg);
      const fa = (e.a.x - X.x) * v.x + (e.a.y - X.y) * v.y, fb = (e.b.x - X.x) * v.x + (e.b.y - X.y) * v.y; return { v, uzak: Math.max(fa, fb), yakin: fa >= fb ? 'b' : 'a' };
    };
    const A = yon(e1, tik1), B = yon(e2, tik2), th = Math.acos(Math.max(-1, Math.min(1, A.v.x * B.v.x + A.v.y * B.v.y)));
    if (th < 1e-3 || th > Math.PI - 1e-3) return { hata: 'Bu açıyla köşe yapılamaz.' };
    const t = !(d > 0) ? 0 : tur === 'pah' ? d : d / Math.tan(th / 2);
    if (t >= A.uzak - 1e-6 || t >= B.uzak - 1e-6) return { hata: 'Değer bu çizgiler için çok büyük.' };
    const T1 = P(X.x + A.v.x * t, X.y + A.v.y * t), T2 = P(X.x + B.v.x * t, X.y + B.v.y * t), n1 = { ...e1 }, n2 = { ...e2 }; n1[A.yakin] = T1; n2[B.yakin] = T2; const yeni = [n1, n2];
    if (t > 0) {
      if (tur === 'pah') yeni.push({ t: 'l', a: T1, b: T2, k: e1.k });
      else {
        const bx = A.v.x + B.v.x, by = A.v.y + B.v.y, bl = hyp(bx, by), dist = d / Math.sin(th / 2), C = P(X.x + bx / bl * dist, X.y + by / bl * dist);
        const a1 = Math.atan2(T1.y - C.y, T1.x - C.x), a2 = Math.atan2(T2.y - C.y, T2.x - C.x), ark = norm(a2 - a1) <= Math.PI ? { a0: a1, a1: a2 } : { a0: a2, a1: a1 };
        yeni.push({ t: 'a', c: C, r: d, ...ark, k: e1.k });
      }
    }
    return { yeni };
  }

  /* ═════════ Duvar (kalınlıklı, köşeleri birleşik) ═════════ */
  function kenarOfset(pts, d, kapali) {
    const n = pts.length, m = kapali ? n : n - 1, seg = [];
    for (let i = 0; i < m; i++) { const a = pts[i], b = pts[(i + 1) % n], dx = b.x - a.x, dy = b.y - a.y, u = hyp(dx, dy); if (u < 1e-9) continue; const nx = -dy / u * d, ny = dx / u * d; seg.push({ a: P(a.x + nx, a.y + ny), b: P(b.x + nx, b.y + ny), v: a }); }
    if (!seg.length) return [];
    const J = (A, Bs) => { const k = segSeg(A.a, A.b, Bs.a, Bs.b); if (!k) return [Bs.a]; const X = P(A.a.x + (A.b.x - A.a.x) * k.t, A.a.y + (A.b.y - A.a.y) * k.t); return mes(X, Bs.v) > Math.abs(d) * 4 ? [A.b, Bs.a] : [X]; };
    const out = [];
    if (kapali) for (let i = 0; i < seg.length; i++) out.push(...J(seg[(i + seg.length - 1) % seg.length], seg[i]));
    else { out.push(seg[0].a); for (let i = 1; i < seg.length; i++) out.push(...J(seg[i - 1], seg[i])); out.push(seg[seg.length - 1].b); }
    return out;
  }
  function duvar(pts, kal, kapali) {
    if (!(kal > 0)) return { hata: 'Duvar kalınlığı sıfırdan büyük olmalı.' };
    const t = pts.filter((q, i) => i === 0 || mes(q, pts[i - 1]) > 1e-6); if (t.length < 2) return { hata: 'Duvar için en az iki farklı nokta gerekir.' };
    kapali = !!kapali && t.length > 2;
    const sol = kenarOfset(t, kal / 2, kapali), sag = kenarOfset(t, -kal / 2, kapali); if (sol.length < 2 || sag.length < 2) return { hata: 'Duvar çizilemedi.' };
    return { e: kapali ? [{ t: 'p', pts: sol, kapali: true, wr: [sol, sag] }, { t: 'p', pts: sag, kapali: true, wr: [sol, sag] }] : [{ t: 'p', pts: [...sol, ...sag.reverse()], kapali: true }] };
  }

  /* ═════════ Duvara oturtma: yakındaki duvarı bul, kapı/pencere için boşluk aç ═════════ */
  // ents: [{e, i}] duvar katmanındaki çizgi/çoklu çizgiler. p: imleç. Döner: { ang, merkez, kal } ya da null
  function duvarBul(ents, p, maks = 500) {
    const segs = []; for (const { e, i } of ents) for (const [a, b] of parcalar(e)) { const L = mes(a, b); if (L > 1) segs.push({ a, b, i, L, d: noktaSeg(p, a, b) }); }
    let en = null, eb = maks; for (const q of segs) if (q.d < eb) { eb = q.d; en = q; } if (!en) return null;
    const ux = (en.b.x - en.a.x) / en.L, uy = (en.b.y - en.a.y) / en.L, nx = -uy, ny = ux, t = (p.x - en.a.x) * ux + (p.y - en.a.y) * uy, f1 = P(en.a.x + ux * t, en.a.y + uy * t);
    let kd = Infinity, dd0 = 0;
    for (const q of segs) {
      if (q === en) continue; const vx = (q.b.x - q.a.x) / q.L, vy = (q.b.y - q.a.y) / q.L; if (Math.abs(vx * uy - vy * ux) > 0.02) continue;
      const dd = (q.a.x - en.a.x) * nx + (q.a.y - en.a.y) * ny; if (Math.abs(dd) < 40 || Math.abs(dd) > 600) continue;
      const t0 = (q.a.x - en.a.x) * ux + (q.a.y - en.a.y) * uy, t1 = (q.b.x - en.a.x) * ux + (q.b.y - en.a.y) * uy; if (t < Math.min(t0, t1) - 1 || t > Math.max(t0, t1) + 1) continue;
      if (Math.abs(dd) < kd) { kd = Math.abs(dd); dd0 = dd; }
    }
    let ang = Math.atan2(uy, ux); while (ang > Math.PI / 2 + 1e-9) ang -= Math.PI; while (ang <= -Math.PI / 2 + 1e-9) ang += Math.PI;
    return kd < Infinity ? { ang, merkez: P(f1.x + nx * dd0 / 2, f1.y + ny * dd0 / 2), kal: kd } : { ang, merkez: f1, kal: 0 };
  }
  // Açıklık genişliği w; duvar çizgileri açıklıkta kesilir, sövelere kısa çizgi eklenir. Döner: { sil:Set(indeks), ekle:[çizgiler] }
  function duvarKes(ents, ok, m, ang, w, kal) {
    const ux = Math.cos(ang), uy = Math.sin(ang), nx = -uy, ny = ux, h = (kal || 0) / 2 + 15, t0 = -w / 2, t1 = w / 2, sil = new Set(), ekle = [];
    const tp = q => (q.x - m.x) * ux + (q.y - m.y) * uy, np = q => (q.x - m.x) * nx + (q.y - m.y) * ny; let ilkK = 0;
    ents.forEach((e, i) => {
      if (!ok(e)) return; const par = parcalar(e); if (!par.length) return; let degisti = false; const yeni = [];
      for (const [a, b] of par) {
        const na = np(a), nb = np(b), ta = tp(a), tb = tp(b), lo = Math.min(ta, tb), hi = Math.max(ta, tb);
        if (Math.abs(na - nb) < 1 && Math.abs(na) <= h && hi > t0 + 1e-6 && lo < t1 - 1e-6) {
          degisti = true; ilkK = e.k; const A = t => P(m.x + ux * t + nx * na, m.y + uy * t + ny * na);
          if (lo < t0 - 1e-6) yeni.push({ t: 'l', a: A(lo), b: A(t0), k: e.k }); if (hi > t1 + 1e-6) yeni.push({ t: 'l', a: A(t1), b: A(hi), k: e.k }); continue;
        }
        yeni.push({ t: 'l', a: P(a.x, a.y), b: P(b.x, b.y), k: e.k });
      }
      if (degisti) { sil.add(i); ekle.push(...yeni); }
    });
    if (kal > 0 && sil.size) for (const t of [t0, t1]) ekle.push({ t: 'l', a: P(m.x + ux * t - nx * kal / 2, m.y + uy * t - ny * kal / 2), b: P(m.x + ux * t + nx * kal / 2, m.y + uy * t + ny * kal / 2), k: ilkK });
    return { sil, ekle };
  }

  const sade = (pts, tol) => { if (pts.length < 3) return pts; let en = 0, ed = 0; const a = pts[0], b = pts[pts.length - 1]; for (let i = 1; i < pts.length - 1; i++) { const d = noktaSeg(pts[i], a, b); if (d > ed) { ed = d; en = i; } } if (ed <= tol) return [a, b]; return [...sade(pts.slice(0, en + 1), tol).slice(0, -1), ...sade(pts.slice(en), tol)]; };
  function disari(ents, icinde) {
    const out = [];
    for (const e of ents) {
      let pts, kap; if (e.t === 'p') { pts = e.pts; kap = !!e.kapali; } else if (e.t === 'c') { pts = Array.from({ length: 72 }, (_, i) => P(e.c.x + e.r * Math.cos(i * TAU / 72), e.c.y + e.r * Math.sin(i * TAU / 72))); kap = true; } else { out.push(e); continue; }
      const n = pts.length, m = kap ? n : n - 1; let dn = [];
      for (let i = 0; i < m; i++) { const a = pts[i], b = pts[(i + 1) % n], st = Math.max(2, Math.ceil(mes(a, b) / 15)); for (let j = 0; j < st; j++) dn.push(P(a.x + (b.x - a.x) * j / st, a.y + (b.y - a.y) * j / st)); }
      if (!kap) dn.push(pts[n - 1]);
      if (dn.every(q => !icinde(q))) { out.push(e); continue; }
      if (kap) { const s0 = dn.findIndex(q => icinde(q)); dn = dn.slice(s0).concat(dn.slice(0, s0)); dn.push(dn[0]); }
      const sin = dn.map(q => icinde(q)), sinir = (dis, ic) => { let lo = dis, hi = ic; for (let t = 0; t < 28; t++) { const mm = P((lo.x + hi.x) / 2, (lo.y + hi.y) / 2); if (icinde(mm)) hi = mm; else lo = mm; } return lo; };
      let cur = null;
      for (let i = 0; i < dn.length; i++) {
        if (!sin[i]) { if (!cur) { cur = []; if (i > 0) cur.push(sinir(dn[i], dn[i - 1])); } cur.push(dn[i]); }
        else if (cur) { cur.push(sinir(dn[i - 1], dn[i])); if (cur.length > 1) out.push({ t: 'p', pts: sade(cur, 0.4), kapali: false, k: e.k }); cur = null; }
      }
      if (cur && cur.length > 1) out.push({ t: 'p', pts: sade(cur, 0.4), kapali: false, k: e.k });
    }
    return out;
  }

  // Duvar birleştirme: yeni duvar dış çizgisi ile mevcutlar birbirinin içinde kalan kısımları keser (T/L/+ birleşimler temiz kalır).
  // Her duvar çizgisi bulunduğu bölgeyi (wr = halka listesi, çift-tek kuralı) taşır; kapalı duvar çevresi iki halkadır (içi boş).
  const bolgeOf = e => e.wr || (e.t === 'p' && e.kapali && e.pts.length > 2 ? [e.pts] : null);
  const icerde = (halkalar) => q => { let c = false; for (const h of halkalar) { for (let i = 0; i < h.length; i++) if (noktaSeg(q, h[i], h[(i + 1) % h.length]) < 0.5) return false; if (noktaIcinde(q, h)) c = !c; } return c; };
  const kutuKesisir = (A, B, pay = 1) => { const bb = hs => hs.flat().reduce((r, q) => ({ x0: Math.min(r.x0, q.x), y0: Math.min(r.y0, q.y), x1: Math.max(r.x1, q.x), y1: Math.max(r.y1, q.y) }), { x0: 1e18, y0: 1e18, x1: -1e18, y1: -1e18 }), a = bb(A), b = bb(B); return a.x0 <= b.x1 + pay && b.x0 <= a.x1 + pay && a.y0 <= b.y1 + pay && b.y0 <= a.y1 + pay; };
  // yeni: duvar() çıktısı. mevcut: [{e, i}]. Döner { yeni:[...], degisen: Map(i → [yerine geçenler]) }
  function duvarBirlestir(yeni, mevcut) {
    const degisen = new Map(); let uret = yeni.map(e => ({ ...e, wr: e.wr || [e.pts] }));
    const nB = yeni.length > 1 || yeni[0]?.wr ? yeni[0].wr : null; // kapalı çevre: iki halka tek bölge
    const bolgeN = nB || [yeni[0]?.pts].filter(Boolean);
    for (const { e, i } of mevcut) {
      const be = bolgeOf(e); if (!be) continue; if (!kutuKesisir(be, bolgeN)) continue;
      const eskiParca = degisen.get(i) || [e], bitti = []; let degdi = false;
      for (const q of eskiParca) { const r = disari([q], icerde(bolgeN)); if (r.length !== 1 || r[0] !== q) degdi = true; bitti.push(...r.map(x => (x === q ? x : { ...x, wr: be }))); }
      if (degdi) degisen.set(i, bitti);
      uret = uret.flatMap(u => { const r = disari([u], icerde(be)); return r.length === 1 && r[0] === u ? [u] : r.map(x => ({ ...x, wr: bolgeN })); });
    }
    return { yeni: uret, degisen };
  }

  /* ═════════ Hazır semboller ═════════
     Hepsi ölçülü (mm) ve ayarlanabilir; başlangıç noktası = nesnenin merkezi (kapı/pencerede açıklığın ortası,
     klozette arka kenarın ortası). Yerel +y yönü "ön" (kapıda açılma yönü, mobilyada arka). */
  const SEMBOL = (() => {
    const K = [{ ad: 'Mobilya', r: '#9a5b1f', w: .25 }, { ad: 'Kapı', r: '#6a4c93', w: .25 }, { ad: 'Pencere', r: '#1b7fa6', w: .25 }, { ad: 'Tesisat', r: '#2e8b57', w: .25 }, { ad: 'Yapı', r: '#3a4a43', w: .35 }, { ad: 'Elektrik', r: '#c04a8a', w: .25 }, { ad: 'Dış mekân', r: '#4f8f3a', w: .25 }];
    const R = (x0, y0, x1, y1, k) => ({ t: 'p', pts: [P(x0, y0), P(x1, y0), P(x1, y1), P(x0, y1)], kapali: true, k });
    const L = (x0, y0, x1, y1, k) => ({ t: 'l', a: P(x0, y0), b: P(x1, y1), k });
    const C = (x, y, r, k) => ({ t: 'c', c: P(x, y), r, k });
    const A = (x, y, r, a0, a1, k) => ({ t: 'a', c: P(x, y), r, a0: a0 * Math.PI / 180, a1: a1 * Math.PI / 180, k });
    const T = (x, y, sz, txt, k) => ({ t: 'x', p: P(x, y), s: sz, rot: 0, txt, k });
    const E = (cx, cy, rx, ry, k, n = 40) => ({ t: 'p', pts: Array.from({ length: n }, (_, i) => P(cx + rx * Math.cos(i * TAU / n), cy + ry * Math.sin(i * TAU / n))), kapali: true, k });
    const RR = (x0, y0, x1, y1, r, k) => {
      r = Math.min(r, (x1 - x0) / 2, (y1 - y0) / 2); if (r < 1) return R(x0, y0, x1, y1, k); const pts = [];
      for (const [cx, cy, bas] of [[x1 - r, y0 + r, -90], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, 90], [x0 + r, y0 + r, 180]]) for (let j = 0; j <= 5; j++) { const a = (bas + 90 * j / 5) * Math.PI / 180; pts.push(P(cx + r * Math.cos(a), cy + r * Math.sin(a))); }
      return { t: 'p', pts, kapali: true, k };
    };
    // yerel +y = sandalyenin arkası
    const sandalye = (cx, cy, ang, k = 0) => [RR(-225, -225, 225, 150, 45, k), RR(-225, 150, 225, 225, 25, k)].map(e => donustur(e, M.carp(M.ote(cx, cy), M.don(ang * Math.PI / 180, P(0, 0)))));
    // Masanın altında kalan çizgileri keser (gerçek planlardaki gibi: sandalye masanın altına girer, çizgisi görünmez)
    const rrIn = (w, h, r) => q => { const cx = Math.max(Math.abs(q.x) - (w / 2 - r), 0), cy = Math.max(Math.abs(q.y) - (h / 2 - r), 0); return Math.abs(q.x) < w / 2 - 1e-6 && Math.abs(q.y) < h / 2 - 1e-6 && hyp(cx, cy) < r + 1e-6 || (r === 0 && Math.abs(q.x) < w / 2 - 1e-6 && Math.abs(q.y) < h / 2 - 1e-6); };
    const S_ = (id, kat, ad, p, uret, ek = {}) => ({ id, kat, ad, p, uret, ...ek });
    const liste = [
      S_('kapi', 'Kapı ve pencere', 'Kapı', [{ ad: 'Genişlik', v: 900, min: 600, max: 1400 }], (w) => [R(-w / 2, 0, -w / 2 + 40, w, 1), A(-w / 2, 0, w, 0, 90, 1)], { duvar: true }),
      S_('kapi2', 'Kapı ve pencere', 'Çift kanat kapı', [{ ad: 'Genişlik', v: 1600, min: 1200, max: 2400 }], (w) => [R(-w / 2, 0, -w / 2 + 40, w / 2, 1), A(-w / 2, 0, w / 2, 0, 90, 1), R(w / 2 - 40, 0, w / 2, w / 2, 1), A(w / 2, 0, w / 2, 90, 180, 1)], { duvar: true }),
      S_('surgulu', 'Kapı ve pencere', 'Sürgülü kapı', [{ ad: 'Genişlik', v: 1800, min: 1200, max: 3600 }], (w) => [R(-w / 2, -50, 40, -10, 1), R(-40, 10, w / 2, 50, 1), L(-w / 2, 0, w / 2, 0, 1)], { duvar: true }),
      S_('pencere', 'Kapı ve pencere', 'Pencere', [{ ad: 'Genişlik', v: 1200, min: 400, max: 4000 }], (w, kal = 200) => { const o = [R(-w / 2, -kal / 2, w / 2, kal / 2, 2), L(-w / 2, -kal / 6, w / 2, -kal / 6, 2), L(-w / 2, kal / 6, w / 2, kal / 6, 2)]; const n = Math.max(0, Math.round(w / 900) - 1); for (let i = 1; i <= n; i++) { const x = -w / 2 + w * i / (n + 1); o.push(L(x, -kal / 2, x, kal / 2, 2)); } return o; }, { duvar: true }),

      S_('kanepe', 'Oturma', 'Kanepe', [{ ad: 'Genişlik', v: 2000, min: 1200, max: 3500 }, { ad: 'Derinlik', v: 900, min: 700, max: 1200 }], (w, h) => {
        const o = [RR(-w / 2, -h / 2, w / 2, h / 2, 80, 0), L(-w / 2 + 170, -h / 2, -w / 2 + 170, h / 2 - 200, 0), L(w / 2 - 170, -h / 2, w / 2 - 170, h / 2 - 200, 0), L(-w / 2 + 170, h / 2 - 200, w / 2 - 170, h / 2 - 200, 0)];
        const n = Math.max(1, Math.round((w - 340) / 650)); for (let i = 1; i < n; i++) { const x = -w / 2 + 170 + (w - 340) * i / n; o.push(L(x, -h / 2, x, h / 2 - 200, 0)); } return o;
      }),
      S_('koltuk', 'Oturma', 'Koltuk', [{ ad: 'Genişlik', v: 900, min: 700, max: 1200 }, { ad: 'Derinlik', v: 900, min: 700, max: 1200 }], (w, h) => [RR(-w / 2, -h / 2, w / 2, h / 2, 80, 0), L(-w / 2 + 160, -h / 2, -w / 2 + 160, h / 2 - 190, 0), L(w / 2 - 160, -h / 2, w / 2 - 160, h / 2 - 190, 0), L(-w / 2 + 160, h / 2 - 190, w / 2 - 160, h / 2 - 190, 0)]),
      S_('tv', 'Oturma', 'TV ünitesi', [{ ad: 'Genişlik', v: 1800, min: 900, max: 3000 }, { ad: 'Derinlik', v: 450, min: 300, max: 700 }], (w, h) => [R(-w / 2, -h / 2, w / 2, h / 2, 0), R(-w * 0.2, h / 2 - 90, w * 0.2, h / 2 - 40, 0), L(-w / 2, 0, w / 2, 0, 0)]),
      S_('sehpa', 'Oturma', 'Sehpa', [{ ad: 'Genişlik', v: 1100, min: 400, max: 2000 }, { ad: 'Derinlik', v: 600, min: 300, max: 1200 }], (w, h) => [RR(-w / 2, -h / 2, w / 2, h / 2, 50, 0), RR(-w / 2 + 40, -h / 2 + 40, w / 2 - 40, h / 2 - 40, 30, 0)]),
      S_('ysehpa', 'Oturma', 'Yuvarlak sehpa', [{ ad: 'Çap', v: 600, min: 300, max: 1200 }], (d) => [C(0, 0, d / 2, 0), C(0, 0, d / 2 - 40, 0)]),

      S_('yatak2', 'Yatak odası', 'Çift kişilik yatak', [{ ad: 'Genişlik', v: 1600, min: 1200, max: 2200 }, { ad: 'Boy', v: 2000, min: 1900, max: 2200 }], (w, h) => {
        const pw = w / 2 - 110, o = [RR(-w / 2, -h / 2, w / 2, h / 2, 30, 0), R(-w / 2, h / 2 - 90, w / 2, h / 2, 0), L(-w / 2, h / 2 - 760, w / 2, h / 2 - 760, 0)];
        for (const cx of [-w / 4, w / 4]) o.push(RR(cx - pw / 2, h / 2 - 90 - 60 - 420, cx + pw / 2, h / 2 - 90 - 60, 90, 0)); return o;
      }),
      S_('yatak1', 'Yatak odası', 'Tek kişilik yatak', [{ ad: 'Genişlik', v: 900, min: 700, max: 1200 }, { ad: 'Boy', v: 2000, min: 1900, max: 2200 }], (w, h) => [RR(-w / 2, -h / 2, w / 2, h / 2, 30, 0), R(-w / 2, h / 2 - 90, w / 2, h / 2, 0), L(-w / 2, h / 2 - 760, w / 2, h / 2 - 760, 0), RR(-w / 2 + 90, h / 2 - 90 - 60 - 420, w / 2 - 90, h / 2 - 90 - 60, 90, 0)]),
      S_('komodin', 'Yatak odası', 'Komodin', [{ ad: 'Genişlik', v: 500, min: 300, max: 900 }, { ad: 'Derinlik', v: 450, min: 300, max: 700 }], (w, h) => [RR(-w / 2, -h / 2, w / 2, h / 2, 25, 0), C(0, 0, Math.min(w, h) * 0.2, 0), L(-w / 2, -h / 2 + 40, w / 2, -h / 2 + 40, 0)]),
      S_('gardrop', 'Yatak odası', 'Gardırop', [{ ad: 'Genişlik', v: 2000, min: 600, max: 4000 }, { ad: 'Derinlik', v: 600, min: 400, max: 800 }], (w, h) => { const o = [R(-w / 2, -h / 2, w / 2, h / 2, 0), L(-w / 2, -h / 2 + 40, w / 2, -h / 2 + 40, 0)]; const n = Math.max(1, Math.round(w / 500)); for (let i = 1; i < n; i++) { const x = -w / 2 + w * i / n; o.push(L(x, -h / 2, x, -h / 2 + 40, 0)); } o.push(L(-w / 2, h / 2 - 40, w / 2, h / 2 - 40, 0)); return o; }),

      S_('yemek', 'Yemek ve çalışma', 'Yemek masası (sandalyeli)', [{ ad: 'Genişlik', v: 1600, min: 800, max: 3000 }, { ad: 'Derinlik', v: 900, min: 600, max: 1200 }], (w, h) => {
        const o = [RR(-w / 2, -h / 2, w / 2, h / 2, 30, 0)], c = [], n = Math.max(2, Math.round(w / 650));
        for (let i = 0; i < n; i++) { const x = -w / 2 + (i + 0.5) * w / n; c.push(...sandalye(x, h / 2 + 105, 0), ...sandalye(x, -h / 2 - 105, 180)); } c.push(...sandalye(w / 2 + 105, 0, -90), ...sandalye(-w / 2 - 105, 0, 90)); return [...o, ...disari(c, rrIn(w, h, 30))];
      }),
      S_('ymasa', 'Yemek ve çalışma', 'Yuvarlak masa (sandalyeli)', [{ ad: 'Çap', v: 1100, min: 700, max: 1800 }], (d) => { const o = [C(0, 0, d / 2, 0)], c = []; for (const a of [0, 90, 180, 270]) { const r = d / 2 + 105; c.push(...sandalye(Math.round(r * Math.cos(a * Math.PI / 180)), Math.round(r * Math.sin(a * Math.PI / 180)), a - 90)); } return [...o, ...disari(c, q => hyp(q.x, q.y) < d / 2 - 1e-6)]; }),
      S_('sandalye', 'Yemek ve çalışma', 'Sandalye', [], () => sandalye(0, 0, 0)),
      S_('calisma', 'Yemek ve çalışma', 'Çalışma masası', [{ ad: 'Genişlik', v: 1400, min: 800, max: 2400 }, { ad: 'Derinlik', v: 700, min: 500, max: 1000 }], (w, h) => [R(-w / 2, -h / 2, w / 2, h / 2, 0), R(-220, h / 2 - 80, 220, h / 2 - 30, 0), L(0, h / 2 - 30, 0, h / 2 - 10, 0), ...disari(sandalye(0, -h / 2 - 20, 180), rrIn(w, h, 0))]),
      S_('kitaplik', 'Yemek ve çalışma', 'Kitaplık', [{ ad: 'Genişlik', v: 1000, min: 400, max: 3000 }, { ad: 'Derinlik', v: 300, min: 200, max: 500 }], (w, h) => [R(-w / 2, -h / 2, w / 2, h / 2, 0), L(-w / 2 + 25, -h / 2 + 25, w / 2 - 25, -h / 2 + 25, 0), L(-w / 2 + 25, -h / 2 + 25, -w / 2 + 25, h / 2 - 25, 0), L(w / 2 - 25, -h / 2 + 25, w / 2 - 25, h / 2 - 25, 0), L(-w / 2 + 25, h / 2 - 25, w / 2 - 25, h / 2 - 25, 0)]),

      S_('ocak', 'Mutfak', 'Ocak', [{ ad: 'Genişlik', v: 600, min: 450, max: 900 }, { ad: 'Derinlik', v: 600, min: 450, max: 700 }], (w, h) => { const o = [RR(-w / 2, -h / 2, w / 2, h / 2, 20, 0)]; for (const [sx, sy, r] of [[-1, -1, 75], [1, -1, 60], [-1, 1, 60], [1, 1, 90]]) { const cx = sx * w * 0.25, cy = sy * h * 0.25; o.push(C(cx, cy, r, 0), C(cx, cy, r * 0.5, 0)); } return o; }),
      S_('eviye', 'Mutfak', 'Eviye', [{ ad: 'Genişlik', v: 1000, min: 600, max: 1600 }, { ad: 'Derinlik', v: 500, min: 400, max: 700 }], (w, h) => {
        const o = [RR(-w / 2, -h / 2, w / 2, h / 2, 20, 3), RR(-w / 2 + 40, -h / 2 + 40, w * 0.08, h / 2 - 40, 40, 3), C(-w * 0.21, 0, 30, 3), C(-w * 0.21, h / 2 - 75, 22, 3)];
        for (let i = 0; i < 6; i++) { const y = -h / 2 + 70 + (h - 140) * i / 5; o.push(L(w * 0.17, y, w / 2 - 40, y, 3)); } return o;
      }),
      S_('buzdolabi', 'Mutfak', 'Buzdolabı', [{ ad: 'Genişlik', v: 700, min: 550, max: 1000 }, { ad: 'Derinlik', v: 700, min: 550, max: 800 }], (w, h) => [RR(-w / 2, -h / 2, w / 2, h / 2, 25, 0), L(-w / 2, h / 2 - 60, w / 2, h / 2 - 60, 0), R(w / 2 - 110, h / 2 - 60, w / 2 - 70, h / 2 - 10, 0)]),
      S_('camasir', 'Mutfak', 'Çamaşır / bulaşık makinesi', [{ ad: 'Genişlik', v: 600, min: 450, max: 700 }, { ad: 'Derinlik', v: 600, min: 450, max: 700 }], (w, h) => [RR(-w / 2, -h / 2, w / 2, h / 2, 20, 0), C(0, -h * 0.05, Math.min(w, h) * 0.34, 0), C(0, -h * 0.05, Math.min(w, h) * 0.24, 0), L(-w / 2, h / 2 - 60, w / 2, h / 2 - 60, 0)]),
      S_('tezgah', 'Mutfak', 'Tezgâh', [{ ad: 'Genişlik', v: 2400, min: 600, max: 6000 }, { ad: 'Derinlik', v: 600, min: 400, max: 900 }], (w, h) => [R(-w / 2, -h / 2, w / 2, h / 2, 0), L(-w / 2, -h / 2 + 30, w / 2, -h / 2 + 30, 0)]),

      S_('klozet', 'Banyo', 'Klozet', [], () => [RR(-190, 0, 190, 180, 25, 3), E(0, 420, 185, 240, 3), E(0, 430, 130, 185, 3), C(0, 90, 32, 3)]),
      S_('lavabo', 'Banyo', 'Lavabo', [{ ad: 'Genişlik', v: 600, min: 400, max: 900 }, { ad: 'Derinlik', v: 450, min: 350, max: 600 }], (w, h) => [RR(-w / 2, -h / 2, w / 2, h / 2, 50, 3), E(0, -h * 0.04, w * 0.36, h * 0.3, 3), C(0, -h * 0.04, 22, 3), C(0, h / 2 - 55, 22, 3)]),
      S_('lavabo2', 'Banyo', 'Çift lavabo', [{ ad: 'Genişlik', v: 1200, min: 900, max: 1800 }, { ad: 'Derinlik', v: 500, min: 400, max: 650 }], (w, h) => { const o = [RR(-w / 2, -h / 2, w / 2, h / 2, 50, 3)]; for (const cx of [-w / 4, w / 4]) o.push(E(cx, -h * 0.04, w * 0.2, h * 0.3, 3), C(cx, -h * 0.04, 22, 3), C(cx, h / 2 - 55, 22, 3)); return o; }),
      S_('dus', 'Banyo', 'Duş teknesi', [{ ad: 'Genişlik', v: 900, min: 700, max: 1600 }, { ad: 'Derinlik', v: 900, min: 700, max: 1600 }], (w, h) => [R(-w / 2, -h / 2, w / 2, h / 2, 3), R(-w / 2 + 45, -h / 2 + 45, w / 2 - 45, h / 2 - 45, 3), C(0, 0, 45, 3), L(-w / 2, -h / 2, -w / 2 + 45, -h / 2 + 45, 3), L(w / 2, -h / 2, w / 2 - 45, -h / 2 + 45, 3)]),
      S_('kuvet', 'Banyo', 'Küvet', [{ ad: 'Boy', v: 1700, min: 1200, max: 2000 }, { ad: 'Genişlik', v: 750, min: 650, max: 900 }], (w, h) => [RR(-w / 2, -h / 2, w / 2, h / 2, 90, 3), RR(-w / 2 + 70, -h / 2 + 70, w / 2 - 70, h / 2 - 70, 190, 3), C(-w / 2 + 170, 0, 32, 3), C(w / 2 - 55, 0, 20, 3)]),

      S_('merdiven', 'Yapı', 'Merdiven', [{ ad: 'Genişlik', v: 1000, min: 700, max: 1600 }, { ad: 'Uzunluk', v: 2800, min: 1200, max: 6000 }], (w, h) => { const o = [R(-w / 2, -h / 2, w / 2, h / 2, 4)], n = Math.max(2, Math.round(h / 280)); for (let i = 1; i < n; i++) { const y = -h / 2 + h * i / n; o.push(L(-w / 2, y, w / 2, y, 4)); } o.push(L(0, -h / 2 + 140, 0, h / 2 - 160, 4), L(0, h / 2 - 160, -90, h / 2 - 310, 4), L(0, h / 2 - 160, 90, h / 2 - 310, 4), C(0, -h / 2 + 140, 28, 4)); return o; }),
      S_('kolon', 'Yapı', 'Kolon', [{ ad: 'Kenar', v: 300, min: 150, max: 1000 }], (d) => [R(-d / 2, -d / 2, d / 2, d / 2, 4), L(-d / 2, -d / 2, d / 2, d / 2, 4), L(-d / 2, d / 2, d / 2, -d / 2, 4)]),
      S_('ykolon', 'Yapı', 'Yuvarlak kolon', [{ ad: 'Çap', v: 300, min: 150, max: 1000 }], (d) => [C(0, 0, d / 2, 4), L(-d / 2, 0, d / 2, 0, 4), L(0, -d / 2, 0, d / 2, 4)]),
      S_('asansor', 'Yapı', 'Asansör', [{ ad: 'Genişlik', v: 1100, min: 800, max: 2000 }, { ad: 'Derinlik', v: 1400, min: 1000, max: 2400 }], (w, h) => [R(-w / 2 - 100, -h / 2 - 100, w / 2 + 100, h / 2 + 100, 4), R(-w / 2, -h / 2, w / 2, h / 2, 4), L(-w / 2, -h / 2, w / 2, h / 2, 4), L(-w / 2, h / 2, w / 2, -h / 2, 4)]),
      S_('radyator', 'Yapı', 'Radyatör', [{ ad: 'Genişlik', v: 1000, min: 400, max: 2000 }], (w) => { const o = [R(-w / 2, -50, w / 2, 50, 4)]; const n = Math.max(2, Math.round(w / 60)); for (let i = 1; i < n; i++) { const x = -w / 2 + w * i / n; o.push(L(x, -50, x, 50, 4)); } return o; }),
      S_('acik', 'Kapı ve pencere', 'Açıklık (kapısız)', [{ ad: 'Genişlik', v: 1000, min: 400, max: 4000 }], (w, kal = 200) => [L(-w / 2, -kal / 2, -w / 2, kal / 2, 1), L(w / 2, -kal / 2, w / 2, kal / 2, 1)], { duvar: true }),

      S_('lkose', 'Oturma', 'L köşe koltuk', [{ ad: 'Genişlik', v: 2800, min: 2000, max: 4000 }, { ad: 'Derinlik', v: 1800, min: 1500, max: 3500 }], (w, h) => { const d = 900; return [{ t: 'p', pts: [P(-w / 2, h / 2), P(w / 2, h / 2), P(w / 2, h / 2 - d), P(-w / 2 + d, h / 2 - d), P(-w / 2 + d, -h / 2), P(-w / 2, -h / 2)], kapali: true, k: 0 }, { t: 'p', pts: [P(-w / 2 + 170, h / 2 - 170), P(w / 2 - 170, h / 2 - 170), P(w / 2 - 170, h / 2 - d + 170), P(-w / 2 + d - 170, h / 2 - d + 170), P(-w / 2 + d - 170, -h / 2 + 170), P(-w / 2 + 170, -h / 2 + 170)], kapali: true, k: 0 }, L(-w / 2 + d - 170, h / 2 - 170, -w / 2 + d - 170, h / 2 - d + 170, 0)]; }),
      S_('puf', 'Oturma', 'Puf', [{ ad: 'Çap', v: 500, min: 300, max: 900 }], (d) => [C(0, 0, d / 2, 0), C(0, 0, d / 2 - 35, 0)]),
      S_('somine', 'Oturma', 'Şömine', [{ ad: 'Genişlik', v: 1400, min: 800, max: 2200 }, { ad: 'Derinlik', v: 450, min: 300, max: 800 }], (w, h) => [R(-w / 2, -h / 2, w / 2, h / 2, 0), R(-w * 0.3, -h / 2 + 60, w * 0.3, h / 2 - 60, 0), L(-w * 0.3, -h / 2 + 60, w * 0.3, h / 2 - 60, 0), L(-w * 0.3, h / 2 - 60, w * 0.3, -h / 2 + 60, 0)]),

      S_('besik', 'Yatak odası', 'Bebek beşiği', [{ ad: 'Genişlik', v: 700, min: 500, max: 900 }, { ad: 'Boy', v: 1250, min: 900, max: 1500 }], (w, h) => [RR(-w / 2, -h / 2, w / 2, h / 2, 25, 0), R(-w / 2 + 50, -h / 2 + 50, w / 2 - 50, h / 2 - 50, 0), RR(-w / 2 + 110, h / 2 - 330, w / 2 - 110, h / 2 - 90, 60, 0)]),
      S_('sifonyer', 'Yatak odası', 'Şifonyer', [{ ad: 'Genişlik', v: 1000, min: 500, max: 1800 }, { ad: 'Derinlik', v: 500, min: 350, max: 700 }], (w, h) => [R(-w / 2, -h / 2, w / 2, h / 2, 0), L(-w / 2, -h / 2 + 50, w / 2, -h / 2 + 50, 0), L(-w / 2 + w / 3, -h / 2, -w / 2 + w / 3, -h / 2 + 50, 0), L(-w / 2 + 2 * w / 3, -h / 2, -w / 2 + 2 * w / 3, -h / 2 + 50, 0), C(0, -h / 2 + 25, 8, 0)]),
      S_('makyaj', 'Yatak odası', 'Makyaj masası (tabureli)', [{ ad: 'Genişlik', v: 1000, min: 600, max: 1600 }, { ad: 'Derinlik', v: 450, min: 350, max: 600 }], (w, h) => [R(-w / 2, -h / 2, w / 2, h / 2, 0), R(-w * 0.25, h / 2 - 20, w * 0.25, h / 2, 0), ...disari([C(0, -h / 2 - 150, 200, 0), C(0, -h / 2 - 150, 130, 0)], rrIn(w, h, 0))]),

      S_('tabure', 'Yemek ve çalışma', 'Bar taburesi', [{ ad: 'Çap', v: 380, min: 250, max: 600 }], (d) => [C(0, 0, d / 2, 0), C(0, 0, d / 2 * 0.62, 0)]),
      S_('bufe', 'Yemek ve çalışma', 'Büfe / vitrin', [{ ad: 'Genişlik', v: 1400, min: 600, max: 3000 }, { ad: 'Derinlik', v: 450, min: 300, max: 600 }], (w, h) => { const o = [R(-w / 2, -h / 2, w / 2, h / 2, 0), L(-w / 2, -h / 2 + 40, w / 2, -h / 2 + 40, 0)]; const n = Math.max(2, Math.round(w / 500)); for (let i = 1; i < n; i++) { const x = -w / 2 + w * i / n; o.push(L(x, -h / 2, x, -h / 2 + 40, 0)); } return o; }),

      S_('ada', 'Mutfak', 'Mutfak adası (taburelü)', [{ ad: 'Genişlik', v: 2000, min: 1000, max: 3500 }, { ad: 'Derinlik', v: 900, min: 600, max: 1200 }], (w, h) => { const o = [RR(-w / 2, -h / 2, w / 2, h / 2, 30, 0), L(-w / 2, -h / 2 + 40, w / 2, -h / 2 + 40, 0)]; const n = Math.max(2, Math.round(w / 700)); for (let i = 0; i < n; i++) { const x = -w / 2 + (i + 0.5) * w / n; o.push(...disari([C(x, -h / 2 - 130, 190, 0), C(x, -h / 2 - 130, 120, 0)], rrIn(w, h, 30))); } return o; }),
      S_('firin', 'Mutfak', 'Ankastre fırın', [{ ad: 'Genişlik', v: 600, min: 450, max: 900 }, { ad: 'Derinlik', v: 600, min: 450, max: 700 }], (w, h) => [RR(-w / 2, -h / 2, w / 2, h / 2, 20, 0), RR(-w / 2 + 70, -h / 2 + 90, w / 2 - 70, h / 2 - 70, 15, 0), C(-w * 0.3, -h / 2 + 45, 16, 0), C(-w * 0.1, -h / 2 + 45, 16, 0), C(w * 0.1, -h / 2 + 45, 16, 0), C(w * 0.3, -h / 2 + 45, 16, 0)]),
      S_('lmutfak', 'Mutfak', 'L tezgâh', [{ ad: 'Genişlik', v: 2400, min: 1500, max: 4500 }, { ad: 'Derinlik', v: 2400, min: 1500, max: 4500 }], (w, h) => { const d = 600; return [{ t: 'p', pts: [P(-w / 2, h / 2), P(w / 2, h / 2), P(w / 2, h / 2 - d), P(-w / 2 + d, h / 2 - d), P(-w / 2 + d, -h / 2), P(-w / 2, -h / 2)], kapali: true, k: 0 }, { t: 'p', pts: [P(w / 2 - 30, h / 2 - d + 30), P(-w / 2 + d - 30, h / 2 - d + 30), P(-w / 2 + d - 30, -h / 2 + 30)], kapali: false, k: 0 }]; }),
      S_('davlumbaz', 'Mutfak', 'Davlumbaz', [{ ad: 'Genişlik', v: 900, min: 600, max: 1200 }, { ad: 'Derinlik', v: 500, min: 400, max: 600 }], (w, h) => [R(-w / 2, -h / 2, w / 2, h / 2, 0), L(-w / 2, -h / 2, w / 2, h / 2, 0), L(-w / 2, h / 2, w / 2, -h / 2, 0)]),

      S_('bide', 'Banyo', 'Bide', [], () => [RR(-185, -275, 185, 275, 110, 3), E(0, -20, 125, 195, 3), C(0, 215, 18, 3), C(0, 180, 10, 3)]),
      S_('jakuzi', 'Banyo', 'Jakuzi / oval küvet', [{ ad: 'Çap', v: 1600, min: 1200, max: 2400 }], (d) => [C(0, 0, d / 2, 3), C(0, 0, d / 2 - 90, 3), C(0, -d / 2 + 190, 35, 3), C(-70, d / 2 - 45, 20, 3), C(70, d / 2 - 45, 20, 3)]),
      S_('kabin', 'Banyo', 'Duş kabini (kapılı)', [{ ad: 'Genişlik', v: 900, min: 700, max: 1600 }, { ad: 'Derinlik', v: 900, min: 700, max: 1600 }], (w, h) => { const r = Math.min(w, h) * 0.55; return [R(-w / 2, -h / 2, w / 2, h / 2, 3), C(0, 0, 45, 3), L(-w / 2, -h / 2, -w / 2, -h / 2 - r, 3), A(-w / 2, -h / 2, r, -90, 0, 3)]; }),

      S_('avize', 'Elektrik ve tesisat', 'Avize / tavan lambası', [{ ad: 'Çap', v: 400, min: 150, max: 1000 }], (d) => [C(0, 0, d / 2, 5), C(0, 0, d / 5, 5), L(-d / 2, 0, d / 2, 0, 5), L(0, -d / 2, 0, d / 2, 5)]),
      S_('priz', 'Elektrik ve tesisat', 'Priz', [], () => [C(0, 0, 90, 5), L(-30, -45, -30, 45, 5), L(30, -45, 30, 45, 5)]),
      S_('anahtar', 'Elektrik ve tesisat', 'Anahtar', [], () => [C(0, 0, 90, 5), C(0, 0, 22, 5), L(0, 0, 130, 130, 5)]),
      S_('klima', 'Elektrik ve tesisat', 'Klima (iç ünite)', [{ ad: 'Genişlik', v: 900, min: 600, max: 1400 }], (w) => [RR(-w / 2, -125, w / 2, 125, 40, 5), L(-w / 2 + 40, -45, w / 2 - 40, -45, 5), L(-w / 2 + 40, 5, w / 2 - 40, 5, 5), L(-w / 2 + 40, 55, w / 2 - 40, 55, 5)]),
      S_('kombi', 'Elektrik ve tesisat', 'Kombi', [], () => [R(-200, -175, 200, 175, 3), C(0, 20, 90, 3), C(0, 20, 45, 3), L(-200, 120, 200, 120, 3)]),
      S_('pano', 'Elektrik ve tesisat', 'Elektrik panosu', [{ ad: 'Genişlik', v: 400, min: 250, max: 800 }], (w) => [R(-w / 2, -75, w / 2, 75, 5), L(-w / 2, -75, w / 2, 75, 5), L(-w / 2, 75, w / 2, -75, 5)]),

      S_('spiral', 'Yapı', 'Spiral merdiven', [{ ad: 'Çap', v: 1600, min: 1200, max: 2600 }], (d) => { const o = [C(0, 0, d / 2, 4), C(0, 0, 130, 4)]; for (let i = 0; i < 14; i++) { const a = i * TAU / 14; o.push(L(Math.round(130 * Math.cos(a)), Math.round(130 * Math.sin(a)), Math.round(d / 2 * Math.cos(a)), Math.round(d / 2 * Math.sin(a)), 4)); } return o; }),
      S_('rampa', 'Yapı', 'Rampa', [{ ad: 'Genişlik', v: 1200, min: 900, max: 3000 }, { ad: 'Uzunluk', v: 4000, min: 1500, max: 12000 }], (w, h) => { const o = [R(-w / 2, -h / 2, w / 2, h / 2, 4)]; const n = Math.max(3, Math.round(h / 250)); for (let i = 1; i < n; i++) { const y = -h / 2 + h * i / n; o.push(L(-w / 2, y, -w / 2 + 160 + 160 * i / n, y, 4), L(w / 2, y, w / 2 - 160 - 160 * i / n, y, 4)); } o.push(L(0, -h / 2 + 150, 0, h / 2 - 150, 4), L(0, h / 2 - 150, -100, h / 2 - 320, 4), L(0, h / 2 - 150, 100, h / 2 - 320, 4)); return o; }),
      S_('saft', 'Yapı', 'Şaft / baca', [{ ad: 'Genişlik', v: 600, min: 300, max: 1500 }, { ad: 'Derinlik', v: 600, min: 300, max: 1500 }], (w, h) => [R(-w / 2, -h / 2, w / 2, h / 2, 4), R(-w / 2 + 60, -h / 2 + 60, w / 2 - 60, h / 2 - 60, 4), L(-w / 2, -h / 2, w / 2, h / 2, 4), L(-w / 2, h / 2, w / 2, -h / 2, 4)]),

      S_('agac', 'Dış mekân', 'Ağaç', [{ ad: 'Çap', v: 3000, min: 1000, max: 8000 }], (d) => [{ t: 'p', pts: Array.from({ length: 36 }, (_, i) => { const a = i * TAU / 36, r = d / 2 * (1 + 0.07 * Math.sin(7 * a)); return P(Math.round(r * Math.cos(a)), Math.round(r * Math.sin(a))); }), kapali: true, k: 6 }, C(0, 0, Math.max(40, d * 0.03), 6), C(0, 0, d * 0.18, 6)]),
      S_('bitki', 'Dış mekân', 'Saksı bitkisi', [{ ad: 'Çap', v: 500, min: 200, max: 1200 }], (d) => { const o = [C(0, 0, d / 2, 6), C(0, 0, d * 0.12, 6)]; for (let i = 0; i < 8; i++) { const a = i * TAU / 8 + 0.2; o.push(L(Math.round(d * .12 * Math.cos(a)), Math.round(d * .12 * Math.sin(a)), Math.round(d * .42 * Math.cos(a)), Math.round(d * .42 * Math.sin(a)), 6)); } return o; }),
      S_('araba', 'Dış mekân', 'Araba', [{ ad: 'Genişlik', v: 1800, min: 1500, max: 2200 }, { ad: 'Uzunluk', v: 4500, min: 3200, max: 6000 }], (w, h) => [RR(-w / 2, -h / 2, w / 2, h / 2, 380, 6), RR(-w / 2 + 170, -h * 0.2, w / 2 - 170, h * 0.2, 220, 6), L(-w / 2 + 250, h * 0.32, w / 2 - 250, h * 0.32, 6), R(-w / 2 - 25, h / 2 - 1050, -w / 2 + 90, h / 2 - 450, 6), R(w / 2 - 90, h / 2 - 1050, w / 2 + 25, h / 2 - 450, 6), R(-w / 2 - 25, -h / 2 + 450, -w / 2 + 90, -h / 2 + 1050, 6), R(w / 2 - 90, -h / 2 + 450, w / 2 + 25, -h / 2 + 1050, 6)]),
      S_('park', 'Dış mekân', 'Park yeri', [{ ad: 'Genişlik', v: 2500, min: 2200, max: 3500 }, { ad: 'Uzunluk', v: 5000, min: 4000, max: 7000 }], (w, h) => [R(-w / 2, -h / 2, w / 2, h / 2, 6), T(-260, -330, 900, 'P', 6)]),
      S_('havuz', 'Dış mekân', 'Havuz', [{ ad: 'Genişlik', v: 4000, min: 2000, max: 12000 }, { ad: 'Uzunluk', v: 8000, min: 3000, max: 25000 }], (w, h) => { const o = [RR(-w / 2, -h / 2, w / 2, h / 2, 400, 2), RR(-w / 2 + 180, -h / 2 + 180, w / 2 - 180, h / 2 - 180, 250, 2)]; for (let i = 1; i <= 3; i++) o.push(L(-w / 2 + 180 + 260 * i, -h / 2 + 180, -w / 2 + 180 + 260 * i, -h / 2 + 180 + 330, 2)); return o; }),
      S_('katlanir', 'Kapı ve pencere', 'Katlanır kapı', [{ ad: 'Genişlik', v: 900, min: 600, max: 1800 }], (w) => [{ t: 'p', pts: [P(-w / 2, 0), P(-w / 4, w / 4), P(0, 0), P(w / 4, w / 4), P(w / 2, 0)], kapali: false, k: 1 }, L(-w / 2, 0, w / 2, 0, 1)], { duvar: true }),
      S_('cam', 'Kapı ve pencere', 'Sürgülü cam kapı (balkon)', [{ ad: 'Genişlik', v: 2400, min: 1500, max: 4500 }], (w, kal = 200) => [R(-w / 2, -kal / 2, w / 2, kal / 2, 2), R(-w / 2, -kal / 3, 60, -kal / 12, 2), R(-60, kal / 12, w / 2, kal / 3, 2)], { duvar: true }),
      S_('garaj', 'Kapı ve pencere', 'Garaj kapısı', [{ ad: 'Genişlik', v: 3000, min: 2200, max: 6000 }], (w, kal = 200) => [R(-w / 2, -45, w / 2, 45, 1), L(-w / 2, 0, w / 2, 0, 1), L(-w / 2, -kal / 2, -w / 2, kal / 2, 1), L(w / 2, -kal / 2, w / 2, kal / 2, 1)], { duvar: true }),

      S_('yanmasa', 'Oturma', 'Yan masa', [{ ad: 'Kenar', v: 450, min: 250, max: 800 }], (d) => [RR(-d / 2, -d / 2, d / 2, d / 2, 30, 0), RR(-d / 2 + 35, -d / 2 + 35, d / 2 - 35, d / 2 - 35, 15, 0)]),
      S_('piyano', 'Oturma', 'Piyano (tabureli)', [{ ad: 'Genişlik', v: 1500, min: 1300, max: 2000 }, { ad: 'Derinlik', v: 600, min: 500, max: 800 }], (w, h) => [RR(-w / 2, -h / 2, w / 2, h / 2, 40, 0), R(-w / 2 + 40, -h / 2 + 40, w / 2 - 40, -h / 2 + 200, 0), L(-w / 2 + 40, h / 2 - 150, w / 2 - 40, h / 2 - 150, 0), RR(-250, -h / 2 - 420, 250, -h / 2 - 90, 40, 0)]),
      S_('ayaklik', 'Oturma', 'Ayaklık', [{ ad: 'Genişlik', v: 600, min: 400, max: 900 }, { ad: 'Derinlik', v: 450, min: 300, max: 700 }], (w, h) => [RR(-w / 2, -h / 2, w / 2, h / 2, 60, 0), RR(-w / 2 + 40, -h / 2 + 40, w / 2 - 40, h / 2 - 40, 35, 0)]),

      S_('ranza', 'Yatak odası', 'Ranza', [{ ad: 'Genişlik', v: 900, min: 700, max: 1100 }, { ad: 'Boy', v: 2000, min: 1800, max: 2200 }], (w, h) => { const o = [RR(-w / 2, -h / 2, w / 2, h / 2, 30, 0), R(-w / 2, h / 2 - 90, w / 2, h / 2, 0), RR(-w / 2 + 90, h / 2 - 90 - 60 - 380, w / 2 - 90, h / 2 - 150, 90, 0), R(-w / 2 + 60, -h / 2 + 60, w / 2 - 60, h / 2 - 650, 0), R(w / 2 - 80, -h / 2 + 150, w / 2, -h / 2 + 850, 0)]; for (let i = 1; i < 5; i++) o.push(L(w / 2 - 80, -h / 2 + 150 + 140 * i, w / 2, -h / 2 + 150 + 140 * i, 0)); return o; }),

      S_('lmasa', 'Ofis', 'L çalışma masası', [{ ad: 'Genişlik', v: 1600, min: 1200, max: 2400 }, { ad: 'Derinlik', v: 1600, min: 1200, max: 2400 }], (w, h) => { const d = 700; return [{ t: 'p', pts: [P(-w / 2, h / 2), P(w / 2, h / 2), P(w / 2, h / 2 - d), P(-w / 2 + d, h / 2 - d), P(-w / 2 + d, -h / 2), P(-w / 2, -h / 2)], kapali: true, k: 0 }, R(-200, h / 2 - 90, 200, h / 2 - 40, 0), ...disari(sandalye(-w / 2 + d + 330, h / 2 - d - 330, 45), q => noktaIcinde(q, [P(-w / 2, h / 2), P(w / 2, h / 2), P(w / 2, h / 2 - d), P(-w / 2 + d, h / 2 - d), P(-w / 2 + d, -h / 2), P(-w / 2, -h / 2)]))]; }),
      S_('ofiskoltuk', 'Ofis', 'Ofis koltuğu', [{ ad: 'Çap', v: 550, min: 400, max: 700 }], (d) => [C(0, 0, d / 2, 0), RR(-d * 0.33, -d * 0.36, d * 0.33, d * 0.2, 60, 0), RR(-d * 0.33, d * 0.2, d * 0.33, d * 0.4, 40, 0)]),
      S_('toplanti', 'Ofis', 'Toplantı masası (sandalyeli)', [{ ad: 'Genişlik', v: 3000, min: 1800, max: 6000 }, { ad: 'Derinlik', v: 1200, min: 900, max: 1800 }], (w, h) => { const o = [RR(-w / 2, -h / 2, w / 2, h / 2, h * 0.38, 0)], c = [], n = Math.max(2, Math.round(w / 750)); for (let i = 0; i < n; i++) { const x = -w / 2 + (i + 0.5) * w / n; c.push(...sandalye(x, h / 2 + 105, 0), ...sandalye(x, -h / 2 - 105, 180)); } c.push(...sandalye(w / 2 + 105, 0, -90), ...sandalye(-w / 2 - 105, 0, 90)); return [...o, ...disari(c, rrIn(w, h, h * 0.38))]; }),
      S_('dosya', 'Ofis', 'Dosya dolabı', [{ ad: 'Genişlik', v: 450, min: 300, max: 1000 }, { ad: 'Derinlik', v: 600, min: 400, max: 800 }], (w, h) => [R(-w / 2, -h / 2, w / 2, h / 2, 0), L(-w / 2, -h / 2 + 60, w / 2, -h / 2 + 60, 0), L(-w / 2, h / 2 - 60, w / 2, h / 2 - 60, 0), L(-w * 0.15, -h / 2 + 30, w * 0.15, -h / 2 + 30, 0)]),
      S_('yazici', 'Ofis', 'Yazıcı / fotokopi', [{ ad: 'Genişlik', v: 700, min: 400, max: 1200 }, { ad: 'Derinlik', v: 650, min: 400, max: 900 }], (w, h) => [RR(-w / 2, -h / 2, w / 2, h / 2, 40, 0), R(-w / 2 + 60, -h / 2 + 60, w / 2 - 60, h / 2 - 160, 0), C(w / 2 - 90, h / 2 - 80, 22, 0), L(-w / 2 + 60, h / 2 - 100, w / 2 - 200, h / 2 - 100, 0)]),
      S_('masa2', 'Yemek ve çalışma', 'Masa (2 kişilik)', [{ ad: 'Kenar', v: 650, min: 450, max: 1000 }], (d) => [RR(-d / 2, -d / 2, d / 2, d / 2, 25, 0), ...disari([...sandalye(0, d / 2 + 105, 0), ...sandalye(0, -d / 2 - 105, 180)], rrIn(d, d, 25))]),
      S_('masa4', 'Yemek ve çalışma', 'Masa (4 kişilik, kare)', [{ ad: 'Kenar', v: 850, min: 600, max: 1300 }], (d) => [RR(-d / 2, -d / 2, d / 2, d / 2, 25, 0), ...disari([...sandalye(0, d / 2 + 105, 0), ...sandalye(0, -d / 2 - 105, 180), ...sandalye(d / 2 + 105, 0, -90), ...sandalye(-d / 2 - 105, 0, 90)], rrIn(d, d, 25))]),

      S_('cifbuz', 'Mutfak', 'Çift kapılı buzdolabı', [{ ad: 'Genişlik', v: 900, min: 800, max: 1100 }, { ad: 'Derinlik', v: 750, min: 600, max: 900 }], (w, h) => [RR(-w / 2, -h / 2, w / 2, h / 2, 25, 0), L(-w / 2, -h / 2 + 70, w / 2, -h / 2 + 70, 0), L(0, -h / 2, 0, -h / 2 + 70, 0), R(-50, -h / 2 + 15, -30, -h / 2 + 55, 0), R(30, -h / 2 + 15, 50, -h / 2 + 55, 0)]),

      S_('pisuvar', 'Banyo', 'Pisuvar', [], () => [RR(-175, 0, 175, 350, 120, 3), E(0, 195, 105, 125, 3), C(0, 55, 14, 3)]),
      S_('kosedus', 'Banyo', 'Köşe duş (çeyrek daire)', [{ ad: 'Yarıçap', v: 900, min: 700, max: 1400 }], (r) => { const pts = [P(-r / 2, -r / 2)]; for (let i = 0; i <= 18; i++) { const a = i * Math.PI / 2 / 18; pts.push(P(Math.round(-r / 2 + r * Math.cos(a)), Math.round(-r / 2 + r * Math.sin(a)))); } return [{ t: 'p', pts, kapali: true, k: 3 }, C(-r / 2 + r * 0.38, -r / 2 + r * 0.38, 40, 3)]; }),
      S_('sauna', 'Banyo', 'Sauna', [{ ad: 'Genişlik', v: 2000, min: 1500, max: 3500 }, { ad: 'Derinlik', v: 1500, min: 1200, max: 2500 }], (w, h) => [R(-w / 2, -h / 2, w / 2, h / 2, 3), R(-w / 2 + 60, h / 2 - 560, w / 2 - 60, h / 2 - 60, 3), R(-w / 2 + 60, h / 2 - 1000, w / 2 - 60, h / 2 - 560, 3), C(w / 2 - 260, -h / 2 + 260, 170, 3), C(w / 2 - 260, -h / 2 + 260, 90, 3)]),

      S_('dedektor', 'Elektrik ve tesisat', 'Duman dedektörü', [], () => [C(0, 0, 90, 5), C(0, 0, 50, 5), C(0, 0, 12, 5)]),
      S_('spot', 'Elektrik ve tesisat', 'Spot lamba', [], () => [C(0, 0, 70, 5), L(-50, -50, 50, 50, 5), L(-50, 50, 50, -50, 5)]),
      S_('aplik', 'Elektrik ve tesisat', 'Duvar lambası (aplik)', [], () => [A(0, 0, 100, 0, 180, 5), L(-100, 0, 100, 0, 5), L(0, 0, 0, 60, 5)]),
      S_('fan', 'Elektrik ve tesisat', 'Tavan vantilatörü', [{ ad: 'Çap', v: 1200, min: 800, max: 1800 }], (d) => { const o = [C(0, 0, d / 2, 5), C(0, 0, d * 0.07, 5)]; for (const a of [0, 90, 180, 270]) o.push(donustur(E(0, d * 0.25, d * 0.08, d * 0.19, 5, 24), M.don(a * Math.PI / 180, P(0, 0)))); return o; }),
      S_('termostat', 'Elektrik ve tesisat', 'Termostat', [], () => [C(0, 0, 70, 5), T(-28, -32, 90, 'T', 5)]),

      S_('umerdiven', 'Yapı', 'U merdiven (sahanlıklı)', [{ ad: 'Genişlik', v: 2400, min: 1800, max: 4000 }, { ad: 'Uzunluk', v: 3800, min: 2800, max: 7000 }], (w, h) => {
        const fw = (w - 100) / 2, top = h / 2 - 1000, n = Math.max(3, Math.round((top + h / 2) / 280)), o = [R(-w / 2, -h / 2, -w / 2 + fw, top, 4), R(w / 2 - fw, -h / 2, w / 2, top, 4), R(-w / 2, top, w / 2, h / 2, 4)];
        for (let i = 1; i < n; i++) { const y = -h / 2 + (top + h / 2) * i / n; o.push(L(-w / 2, y, -w / 2 + fw, y, 4), L(w / 2 - fw, y, w / 2, y, 4)); }
        const x1 = -w / 2 + fw / 2, x2 = w / 2 - fw / 2; o.push(L(x1, -h / 2 + 140, x1, top - 120, 4), L(x1, top - 120, x1 - 80, top - 260, 4), L(x1, top - 120, x1 + 80, top - 260, 4), C(x1, -h / 2 + 140, 28, 4), L(x2, top - 120, x2, -h / 2 + 140, 4), L(x2, -h / 2 + 140, x2 - 80, -h / 2 + 280, 4), L(x2, -h / 2 + 140, x2 + 80, -h / 2 + 280, 4)); return o;
      }),
      S_('korkuluk', 'Yapı', 'Korkuluk', [{ ad: 'Uzunluk', v: 2000, min: 400, max: 8000 }], (w) => { const o = [R(-w / 2, -25, w / 2, 25, 4)], n = Math.max(1, Math.round(w / 1000)); for (let i = 0; i <= n; i++) { const x = -w / 2 + w * i / n; o.push(R(x - 40, -40, x + 40, 40, 4)); } return o; }),
      S_('ydolap', 'Yapı', 'Yangın dolabı', [], () => [R(-350, -125, 350, 125, 4), L(-350, -125, 350, 125, 4), L(-350, 125, 350, -125, 4), C(0, 0, 70, 4)]),
      S_('ytup', 'Yapı', 'Yangın tüpü', [], () => [C(0, 0, 110, 4), C(0, 0, 70, 4), T(-30, -34, 90, 'T', 4)]),

      S_('bank', 'Dış mekân', 'Bahçe bankı', [{ ad: 'Genişlik', v: 1500, min: 900, max: 2400 }], (w) => [R(-w / 2, -250, w / 2, 250, 6), L(-w / 2, 150, w / 2, 150, 6), R(-w / 2, -250, -w / 2 + 70, 250, 6), R(w / 2 - 70, -250, w / 2, 250, 6)]),
      S_('sezlong', 'Dış mekân', 'Şezlong', [], () => [RR(-300, -950, 300, 950, 60, 6), L(-300, 250, 300, 250, 6), L(-300, -450, 300, -450, 6), L(-300, 650, 300, 650, 6)]),
      S_('cardak', 'Dış mekân', 'Çardak', [{ ad: 'Genişlik', v: 4000, min: 2000, max: 8000 }, { ad: 'Derinlik', v: 4000, min: 2000, max: 8000 }], (w, h) => [R(-w / 2, -h / 2, w / 2, h / 2, 6), R(-w / 2 + 150, -h / 2 + 150, w / 2 - 150, h / 2 - 150, 6), L(-w / 2, -h / 2, w / 2, h / 2, 6), L(-w / 2, h / 2, w / 2, -h / 2, 6), R(-w / 2, -h / 2, -w / 2 + 220, -h / 2 + 220, 6), R(w / 2 - 220, -h / 2, w / 2, -h / 2 + 220, 6), R(-w / 2, h / 2 - 220, -w / 2 + 220, h / 2, 6), R(w / 2 - 220, h / 2 - 220, w / 2, h / 2, 6)]),
      S_('barbeku', 'Dış mekân', 'Barbekü', [], () => { const o = [RR(-450, -250, 450, 250, 50, 6)]; for (let i = 0; i < 6; i++) o.push(L(-380, -170 + 68 * i, 380, -170 + 68 * i, 6)); return o; }),
      S_('yhavuz', 'Dış mekân', 'Yuvarlak havuz', [{ ad: 'Çap', v: 5000, min: 2500, max: 12000 }], (d) => { const o = [C(0, 0, d / 2, 2), C(0, 0, d / 2 - 180, 2)]; for (let i = 1; i <= 3; i++) o.push(L(-120, -d / 2 + 180 + 220 * (i - 1), 120, -d / 2 + 180 + 220 * (i - 1), 2)); return o; }),
      S_('kuzey', 'Yapı', 'Kuzey oku', [{ ad: 'Çap', v: 600, min: 300, max: 1500 }], (d) => { const r = d / 2; return [C(0, 0, r, 4), { t: 'p', pts: [P(0, r * 0.9), P(r * 0.32, -r * 0.65), P(0, -r * 0.35), P(-r * 0.32, -r * 0.65)], kapali: true, k: 4 }, T(-r * 0.2, r * 1.12, r * 0.5, 'N', 4)]; }),
      S_('cati_besik', 'Çatı ve plan', 'Beşik çatı (plan)', [{ ad: 'Genişlik', v: 10000, min: 3000, max: 30000 }, { ad: 'Derinlik', v: 7000, min: 3000, max: 30000 }], (w, h) => [R(-w / 2, -h / 2, w / 2, h / 2, 4), L(-w / 2, 0, w / 2, 0, 4), L(-w * .3, h * .08, -w * .3, h * .3, 4), L(-w * .3, h * .3, -w * .3 - 120, h * .3 - 220, 4), L(-w * .3, h * .3, -w * .3 + 120, h * .3 - 220, 4), L(-w * .3, -h * .08, -w * .3, -h * .3, 4), L(-w * .3, -h * .3, -w * .3 - 120, -h * .3 + 220, 4), L(-w * .3, -h * .3, -w * .3 + 120, -h * .3 + 220, 4)]),
      S_('cati_kirma', 'Çatı ve plan', 'Kırma çatı (plan)', [{ ad: 'Genişlik', v: 10000, min: 3000, max: 30000 }, { ad: 'Derinlik', v: 7000, min: 3000, max: 30000 }], (w, h) => { const m = Math.max(0, (w - h) / 2); return [R(-w / 2, -h / 2, w / 2, h / 2, 4), L(-m, 0, m, 0, 4), L(-w / 2, -h / 2, -m, 0, 4), L(-w / 2, h / 2, -m, 0, 4), L(w / 2, -h / 2, m, 0, 4), L(w / 2, h / 2, m, 0, 4)]; }),
      S_('cati_tek', 'Çatı ve plan', 'Tek eğimli çatı (plan)', [{ ad: 'Genişlik', v: 8000, min: 2000, max: 30000 }, { ad: 'Derinlik', v: 5000, min: 2000, max: 30000 }], (w, h) => [R(-w / 2, -h / 2, w / 2, h / 2, 4), L(0, h * .3, 0, -h * .3, 4), L(0, -h * .3, -200, -h * .3 + 380, 4), L(0, -h * .3, 200, -h * .3 + 380, 4)]),
      S_('cati_baca', 'Çatı ve plan', 'Baca (çatı)', [{ ad: 'Kenar', v: 600, min: 300, max: 1500 }], (d) => [R(-d / 2, -d / 2, d / 2, d / 2, 4), L(-d / 2, -d / 2, d / 2, d / 2, 4), L(-d / 2, d / 2, d / 2, -d / 2, 4)]),
      S_('cati_pencere', 'Çatı ve plan', 'Çatı penceresi', [{ ad: 'Genişlik', v: 780, min: 400, max: 1600 }, { ad: 'Yükseklik', v: 980, min: 400, max: 1800 }], (w, h) => [R(-w / 2, -h / 2, w / 2, h / 2, 2), R(-w / 2 + 60, -h / 2 + 60, w / 2 - 60, h / 2 - 60, 2), L(-w / 2 + 60, -h / 2 + 60, w / 2 - 60, h / 2 - 60, 2), L(-w / 2 + 60, h / 2 - 60, w / 2 - 60, -h / 2 + 60, 2)]),
      S_('cati_dere', 'Çatı ve plan', 'Yağmur oluğu', [{ ad: 'Uzunluk', v: 5000, min: 500, max: 30000 }], (w) => [L(-w / 2, -60, w / 2, -60, 3), L(-w / 2, 60, w / 2, 60, 3), L(-w / 2, -60, -w / 2, 60, 3), L(w / 2, -60, w / 2, 60, 3), L(w * .15, 0, -w * .15, 0, 3), L(-w * .15, 0, -w * .15 + 150, 55, 3), L(-w * .15, 0, -w * .15 + 150, -55, 3)]),
      S_('olcekcubuk', 'Çatı ve plan', 'Ölçek çubuğu', [{ ad: 'Uzunluk', v: 5000, min: 500, max: 50000 }], (w) => { const o = [R(-w / 2, -60, w / 2, 60, 4)], n = 5, b = w / n; for (let i = 0; i < n; i++) { if (i % 2 === 0) o.push(L(-w / 2 + i * b, 0, -w / 2 + (i + 1) * b, 0, 4)); if (i) o.push(L(-w / 2 + i * b, -60, -w / 2 + i * b, 60, 4)); } const z = Math.max(150, Math.min(450, w / 14)); o.push(T(-w / 2 - z * .3, 150, z, '0', 4), T(w / 2 - z * (String(Math.round(w / 1000)).length * .55 + 1), 150, z, `${w >= 1000 ? Math.round(w / 100) / 10 : w}${w >= 1000 ? ' m' : ' mm'}`, 4)); return o; }),
    ];
    // Kapı/açıklık sembollerine eşik çizgisi eklenir (plandaki gibi) — oda alanı bulunurken açıklığı kapatır
    return liste.map(s => { const u0 = s.uret, damga = (o, a) => { if (s.duvar && o.length) { const i = s.id === 'pencere' ? 0 : o.length - 1; o[i] = { ...o[i], sy: s.id, sw: a[0] }; } return o; }, uret = s.duvar ? (...a) => damga(s.id === 'pencere' ? u0(...a) : [...u0(...a), L(-a[0] / 2, 0, a[0] / 2, 0, 1)], a) : u0; return { ...s, uret, katlar: K, e: uret(...s.p.map(q => q.v), 200) }; });
  })();

  /* ═════════ Renkler (DXF renk numarası ↔ ekran rengi) ═════════ */
  const ACI = { 1: '#c2362b', 2: '#b58900', 3: '#2e8b57', 4: '#1b7fa6', 5: '#1f4fd8', 6: '#9b2fa0', 7: '#25302b', 8: '#808080', 9: '#b0b0b0' };
  const aciRenk = n => ACI[Math.abs(n)] || '#25302b';
  function renkAci(hex) {
    const v = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const r = v(hex); let en = 7, eb = 1e9;
    for (const [k, h] of Object.entries(ACI)) { const q = v(h), d = (r[0] - q[0]) ** 2 + (r[1] - q[1]) ** 2 + (r[2] - q[2]) ** 2; if (d < eb) { eb = d; en = +k; } } return en;
  }
  const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);

  /* ═════════ Belge (JSON) ═════════ */
  const syKeep = x => (typeof x.sy === 'string' && /^[a-z0-9_]{1,20}$/.test(x.sy) && isFinite(+x.sw) ? { sy: x.sy, sw: Math.min(1e5, Math.max(0, +x.sw)) } : {});
  function belgeTemiz(o) {
    if (!o || typeof o !== 'object') throw new Error('Geçersiz dosya');
    const metin = (s, n = 80) => String(s ?? '').slice(0, n), renk = s => (/^#[0-9a-fA-F]{6}$/.test(s) ? s : '#25302b');
    const katlar = (Array.isArray(o.katlar) ? o.katlar : []).slice(0, 200).map(k => ({ ad: metin(k.ad, 60) || 'Katman', r: renk(k.r), w: Math.min(5, Math.max(0.05, sayi(k.w, .25))), v: k.v === 0 || k.v === false ? 0 : 1, lt: Math.min(3, Math.max(0, sayi(k.lt) | 0)), ...(k.kilit ? { kilit: 1 } : {}), ...(/^#[0-9a-fA-F]{6}$/.test(k.f) ? { f: k.f, fa: Math.min(1, Math.max(0, sayi(k.fa, 1))) } : {}) }));
    if (!katlar.length) katlar.push({ ad: '0', r: '#25302b', w: .25, v: 1, lt: 0 });
    const e = [];
    for (const x of (Array.isArray(o.e) ? o.e : []).slice(0, SINIR.nesne)) {
      const k = Math.min(katlar.length - 1, Math.max(0, sayi(x.k) | 0));
      if (x.t === 'l') e.push({ t: 'l', a: nokta(x.a), b: nokta(x.b), k, ...syKeep(x) });
      else if (x.t === 'p' && Array.isArray(x.pts) && x.pts.length > 1) e.push({ t: 'p', pts: x.pts.slice(0, 20000).map(nokta), kapali: !!x.kapali, k, ...syKeep(x), ...(/^#[0-9a-fA-F]{6}$/.test(x.f) ? { f: x.f, fa: Math.min(1, Math.max(0, sayi(x.fa, .5))) } : {}), ...(Array.isArray(x.wr) && x.wr.length > 0 && x.wr.length < 5 && x.wr.every(h => Array.isArray(h) && h.length > 2 && h.length < 20000) ? { wr: x.wr.map(h => h.map(nokta)) } : {}) });
      else if (x.t === 'c' && sayi(x.r) > 0) e.push({ t: 'c', c: nokta(x.c), r: sayi(x.r), k, ...(/^#[0-9a-fA-F]{6}$/.test(x.f) ? { f: x.f, fa: Math.min(1, Math.max(0, sayi(x.fa, .5))) } : {}) });
      else if (x.t === 'a' && sayi(x.r) > 0) e.push({ t: 'a', c: nokta(x.c), r: sayi(x.r), a0: sayi(x.a0), a1: sayi(x.a1), k });
      else if (x.t === 'd') e.push({ t: 'd', a: nokta(x.a), b: nokta(x.b), o: sayi(x.o), k });
      else if (x.t === 'x') e.push({ t: 'x', p: nokta(x.p), s: Math.max(1e-3, sayi(x.s, 100)), rot: sayi(x.rot), txt: metin(x.txt, 500), k, ...(x.oda && typeof x.oda === 'object' ? { oda: { ad: metin(x.oda.ad, 60), m2: Math.max(0, sayi(x.oda.m2)) } } : {}) });
    }
    return { v: 1, ad: metin(o.ad, 80) || 'Çizim', olcek: Math.max(1, Math.min(10000, sayi(o.olcek, 100))), katlar, e, cur: Math.min(katlar.length - 1, Math.max(0, sayi(o.cur) | 0)), antet: { goster: !!(o.antet && o.antet.goster), proje: metin(o.antet && o.antet.proje, 60), cizen: metin(o.antet && o.antet.cizen, 40) } };
  }

  /* ═════════ DXF yaz ═════════ */
  const dxfAd = s => (String(s).replace(/[<>/\\":;?*|=`]/g, '_').slice(0, 60) || '0');
  const dxfMetin = s => String(s).replace(/[^\x20-\x7e]/g, c => '\\U+' + c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0'));
  function dxfYaz(D, ts) {
    const g = (k, v) => `${k}\n${typeof v === 'number' ? (Math.round(v * 1e6) / 1e6) : v}\n`; let o = '';
    o += g(0, 'SECTION') + g(2, 'HEADER') + g(9, '$ACADVER') + g(1, 'AC1009') + g(9, '$INSUNITS') + g(70, 4) + g(0, 'ENDSEC');
    o += g(0, 'SECTION') + g(2, 'TABLES') + g(0, 'TABLE') + g(2, 'LTYPE') + g(70, 4) + g(0, 'LTYPE') + g(2, 'CONTINUOUS') + g(70, 0) + g(3, 'Solid line') + g(72, 65) + g(73, 0) + g(40, 0);
    for (let i = 1; i < 4; i++) { const pt = LT[i]; o += g(0, 'LTYPE') + g(2, LT_DXF[i]) + g(70, 0) + g(3, LT_AD[i]) + g(72, 65) + g(73, pt.length) + g(40, pt.reduce((a, b) => a + b, 0) * D.olcek); pt.forEach((v, j) => { o += g(49, (j % 2 ? -v : v) * D.olcek); }); }
    o += g(0, 'ENDTAB');
    o += g(0, 'TABLE') + g(2, 'LAYER') + g(70, D.katlar.length);
    for (const k of D.katlar) o += g(0, 'LAYER') + g(2, dxfAd(k.ad)) + g(70, k.v ? 0 : 1) + g(62, renkAci(k.r)) + g(6, LT_DXF[k.lt | 0] || 'CONTINUOUS');
    o += g(0, 'ENDTAB') + g(0, 'TABLE') + g(2, 'STYLE') + g(70, 1) + g(0, 'STYLE') + g(2, 'STANDARD') + g(70, 0) + g(40, 0) + g(41, 1) + g(50, 0) + g(71, 0) + g(42, 0.2) + g(3, 'txt') + g(4, '') + g(0, 'ENDTAB') + g(0, 'ENDSEC');
    o += g(0, 'SECTION') + g(2, 'ENTITIES');
    const L = (a, b, k) => g(0, 'LINE') + g(8, k) + g(10, a.x) + g(20, a.y) + g(30, 0) + g(11, b.x) + g(21, b.y) + g(31, 0);
    const T = (p, s, rot, t, k) => g(0, 'TEXT') + g(8, k) + g(10, p.x) + g(20, p.y) + g(30, 0) + g(40, s) + g(1, dxfMetin(t)) + g(50, rot * 180 / Math.PI) + g(7, 'STANDARD');
    for (const e of D.e) {
      const k = dxfAd(D.katlar[e.k]?.ad ?? '0');
      if (e.t === 'l') o += L(e.a, e.b, k);
      else if (e.t === 'p') { o += g(0, 'POLYLINE') + g(8, k) + g(66, 1) + g(70, e.kapali ? 1 : 0); for (const q of e.pts) o += g(0, 'VERTEX') + g(8, k) + g(10, q.x) + g(20, q.y) + g(30, 0); o += g(0, 'SEQEND') + g(8, k); }
      else if (e.t === 'c') o += g(0, 'CIRCLE') + g(8, k) + g(10, e.c.x) + g(20, e.c.y) + g(30, 0) + g(40, e.r);
      else if (e.t === 'a') o += g(0, 'ARC') + g(8, k) + g(10, e.c.x) + g(20, e.c.y) + g(30, 0) + g(40, e.r) + g(50, norm(e.a0) * 180 / Math.PI) + g(51, norm(e.a1) * 180 / Math.PI);
      else if (e.t === 'x') o += T(e.p, e.s, e.rot, e.txt, k);
      else if (e.t === 'd') { const og = olcuGeo(e, ts, ts * .6); for (const [a, b] of og.cizgiler) o += L(a, b, k); o += T(og.yazi.p, og.yazi.s, og.yazi.rot, og.yazi.t, k); }
    }
    return o + g(0, 'ENDSEC') + g(0, 'EOF');
  }

  /* ═════════ DXF oku ═════════ */
  function dxfOku(metin) {
    if (metin.length > SINIR.dosya) throw new Error('Dosya çok büyük (en çok 25 MB).');
    const sat = metin.split(/\r?\n/), cift = [];
    for (let i = 0; i + 1 < sat.length; i += 2) { const k = parseInt(sat[i], 10); if (!isFinite(k)) { if (sat[i].trim() === '') continue; throw new Error('Bu dosya metin tabanlı (ASCII) bir DXF değil. İkili DXF ya da DWG açılamaz.'); } cift.push([k, sat[i + 1].replace(/\s+$/, '')]); }
    if (cift.length < 4) throw new Error('DXF boş ya da bozuk.');
    let bolum = '', birim = 1; const varlik = [], bloklar = {}, kat = {}, gruplar = []; let blok = null, katBilgi = null;
    const bas = () => { const t = gruplar.splice(0, gruplar.length); if (!t.length) return; if (bolum === 'ENTITIES') varlik.push(t); else if (bolum === 'BLOCKS' && blok) { if (t[0][1] === 'ENDBLK') blok = null; else if (t[0][1] === 'BLOCK') { blok.ad = (t.find(g => g[0] === 2) || [0, ''])[1]; blok.taban = P(+((t.find(g => g[0] === 10) || [0, 0])[1]) || 0, +((t.find(g => g[0] === 20) || [0, 0])[1]) || 0); bloklar[blok.ad] = blok; } else blok.e.push(t); } else if (bolum === 'BLOCKS' && t[0][1] === 'BLOCK') { blok = { e: [], ad: '', taban: P(0, 0) }; blok.ad = (t.find(g => g[0] === 2) || [0, ''])[1]; blok.taban = P(+((t.find(g => g[0] === 10) || [0, 0])[1]) || 0, +((t.find(g => g[0] === 20) || [0, 0])[1]) || 0); bloklar[blok.ad] = blok; } else if (bolum === 'TABLES' && t[0][1] === 'LAYER') { const ad = (t.find(g => g[0] === 2) || [0, '0'])[1], c = +((t.find(g => g[0] === 62) || [0, 7])[1]); const ltAd = String((t.find(g => g[0] === 6) || [0, ''])[1]).toUpperCase(); kat[ad] = { c: isFinite(c) ? c : 7, lt: /DASHDOT|CENTER|PHANTOM/.test(ltAd) ? 2 : /DOT/.test(ltAd) ? 3 : /DASH|HIDDEN/.test(ltAd) ? 1 : 0 }; } };
    for (let i = 0; i < cift.length; i++) {
      const [k, v] = cift[i];
      if (bolum === 'HEADER' && k === 9 && v === '$INSUNITS' && cift[i + 1]) { const u = +cift[i + 1][1]; birim = ({ 1: 25.4, 2: 304.8, 4: 1, 5: 10, 6: 1000, 3: 1609344, 8: 2.54e-5, 10: 914.4 })[u] || 1; }
      if (k === 0 && v === 'SECTION') { bas(); bolum = (cift[i + 1] || [0, ''])[1]; i++; gruplar.length = 0; continue; }
      if (k === 0 && v === 'ENDSEC') { bas(); bolum = ''; blok = null; continue; }
      if (bolum === 'ENTITIES' || bolum === 'BLOCKS' || bolum === 'TABLES') { if (k === 0) { bas(); } if (bolum !== 'TABLES' || k === 0 || gruplar.length) gruplar.push([k, v]); }
      if (bolum === 'BLOCKS' && k === 0 && v === 'ENDBLK') { /* bas() sonraki turda */ }
    }
    bas();
    const katlar = [], katIdx = {}, sayac = { atlanan: {}, egri: 0, blok: 0, elips: 0 };
    const kIdx = ad => { ad = ad || '0'; if (!(ad in katIdx)) { const c = kat[ad]?.c ?? 7; katIdx[ad] = katlar.length; katlar.push({ ad: ad.slice(0, 60), r: aciRenk(c), w: .25, v: c < 0 ? 0 : 1, lt: kat[ad]?.lt || 0 }); } return katIdx[ad]; };
    const e = []; let toplam = 0;
    const al = (t, k, i = 0) => { let n = 0; for (const g of t) if (g[0] === k) { if (n === i) return g[1]; n++; } return undefined; };
    const sy = (t, k, d = 0) => { const v = parseFloat(al(t, k)); return isFinite(v) ? v : d; };
    function bulgeAc(v, kap) {
      const out = [], n = v.length, m = kap ? n : n - 1;
      for (let i = 0; i < n; i++) {
        const a = v[i]; out.push(P(a.x, a.y)); if (i >= m) continue;
        const b = v[(i + 1) % n], bu = isFinite(a.b) ? a.b : 0, ch = mes(a, b);
        if (Math.abs(bu) > 1e-9 && ch > 1e-9) {
          const th = 4 * Math.atan(bu), dm = (ch / 2) / Math.tan(th / 2), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, c = P(mx - (b.y - a.y) / ch * dm, my + (b.x - a.x) / ch * dm);
          const a0 = Math.atan2(a.y - c.y, a.x - c.x), N = Math.min(72, Math.max(2, Math.ceil(Math.abs(th) / (Math.PI / 18)))), r = mes(c, a);
          for (let j = 1; j < N; j++) { const u = a0 + th * j / N; out.push(P(c.x + r * Math.cos(u), c.y + r * Math.sin(u))); }
        }
      }
      return out;
    }
    function isle(t, m, derin) {
      if (toplam > SINIR.nesne) return; const tur = t[0][1], f = p => M.ap(m, p), det = m[0] * m[3] - m[1] * m[2], kk = Math.sqrt(Math.abs(det)) || 1, kt = kIdx(al(t, 8));
      if (tur === 'LINE') { e.push({ t: 'l', a: f(P(sy(t, 10), sy(t, 20))), b: f(P(sy(t, 11), sy(t, 21))), k: kt }); toplam++; }
      else if (tur === 'CIRCLE') { const c = f(P(sy(t, 10), sy(t, 20))); e.push({ t: 'c', c, r: sy(t, 40) * kk, k: kt }); toplam++; }
      else if (tur === 'ARC') { let a0 = sy(t, 50) * Math.PI / 180, a1 = sy(t, 51) * Math.PI / 180; const ar = { t: 'a', c: P(sy(t, 10), sy(t, 20)), r: sy(t, 40), a0, a1, k: kt }; e.push({ ...donustur(ar, m), k: kt }); toplam++; }
      else if (tur === 'LWPOLYLINE') {
        const v = []; for (const g of t) { if (g[0] === 10) v.push({ x: +g[1], y: 0, b: 0 }); else if (g[0] === 20 && v.length) v[v.length - 1].y = +g[1]; else if (g[0] === 42 && v.length) v[v.length - 1].b = +g[1]; }
        if (v.some(q => Math.abs(q.b) > 1e-9)) sayac.egri++;
        const pts = bulgeAc(v, (sy(t, 70) & 1) === 1).map(q => f(q)); if (pts.length > 1) { e.push({ t: 'p', pts, kapali: (sy(t, 70) & 1) === 1, k: kt }); toplam++; }
      }
      else if (tur === 'ELLIPSE') {
        const cx = sy(t, 10), cy = sy(t, 20), mx = sy(t, 11), my = sy(t, 21), q = sy(t, 40, 1), a0 = sy(t, 41, 0), a1 = sy(t, 42, TAU), rm = hyp(mx, my);
        if (rm > 0) {
          const rot = Math.atan2(my, mx); let sw = a1 - a0; if (sw <= 1e-9) sw += TAU; const tam = sw >= TAU - 1e-6, n = Math.max(12, Math.ceil(sw / (TAU / 72))), pts = [];
          for (let i = 0; i <= n; i++) { const u = a0 + sw * i / n, lx = rm * Math.cos(u), ly = rm * q * Math.sin(u); pts.push(f(P(cx + lx * Math.cos(rot) - ly * Math.sin(rot), cy + lx * Math.sin(rot) + ly * Math.cos(rot)))); }
          if (tam) pts.pop(); e.push({ t: 'p', pts, kapali: tam, k: kt }); toplam++; sayac.elips++;
        }
      }
      else if (tur === 'TEXT' || tur === 'MTEXT') {
        let s = String(al(t, 1) ?? ''); s = s.replace(/\\U\+([0-9A-Fa-f]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(/\\P/g, ' ').replace(/\{?\\[A-Za-z][^;]*;/g, '').replace(/[{}]/g, '').slice(0, 500);
        if (s.trim()) { e.push({ t: 'x', p: f(P(sy(t, 10), sy(t, 20))), s: Math.max(1e-3, sy(t, 40, 100) * kk), rot: sy(t, 50) * Math.PI / 180 + Math.atan2(m[1], m[0]), txt: s, k: kt }); toplam++; }
      }
      else if (tur === 'INSERT' || tur === 'DIMENSION') {
        const ad = tur === 'DIMENSION' ? al(t, 2) : al(t, 2), b = bloklar[ad]; if (!b || derin >= SINIR.derin) { sayac.blok++; return; }
        let n = M.ote(0, 0);
        if (tur === 'INSERT') { const sx = sy(t, 41, 1), sy2 = sy(t, 42, 1), r = sy(t, 50) * Math.PI / 180; n = M.carp(M.ote(sy(t, 10), sy(t, 20)), M.carp(M.don(r, P(0, 0)), [sx, 0, 0, sy2, -b.taban.x * sx, -b.taban.y * sy2])); }
        const mm = M.carp(m, n); for (const bt of b.e) isle(bt, mm, derin + 1);
      }
      else if (!['VERTEX', 'SEQEND', 'ATTRIB', 'ATTDEF', 'VIEWPORT'].includes(tur)) sayac.atlanan[tur] = (sayac.atlanan[tur] || 0) + 1;
    }
    const tamBirim = M.olcek(birim, P(0, 0));
    for (let i = 0; i < varlik.length; i++) {
      const t = varlik[i];
      if (t[0][1] === 'POLYLINE') {
        const v = []; let j = i + 1; while (j < varlik.length && varlik[j][0][1] === 'VERTEX') { v.push({ x: sy(varlik[j], 10), y: sy(varlik[j], 20), b: sy(varlik[j], 42) }); j++; }
        if (varlik[j] && varlik[j][0][1] === 'SEQEND') j++; const kap = (sy(t, 70) & 1) === 1; if (v.some(q => Math.abs(q.b) > 1e-9)) sayac.egri++; const pts = bulgeAc(v, kap).map(q => M.ap(tamBirim, q)); if (pts.length > 1) { e.push({ t: 'p', pts, kapali: kap, k: kIdx(al(t, 8)) }); toplam++; } i = j - 1; continue;
      }
      isle(t, tamBirim, 0);
    }
    if (!katlar.length) katlar.push({ ad: '0', r: aciRenk(7), w: .25, v: 1 });
    return { belge: belgeTemiz({ ad: 'DXF', olcek: 100, katlar, e }), rapor: { nesne: e.length, atlanan: sayac.atlanan, egri: sayac.egri, elips: sayac.elips, blok: sayac.blok, birim } };
  }

  /* ═════════ SVG ═════════ */
  const kacis = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  function sinirHepsi(D, ts) { let a = 1e18, b = 1e18, c = -1e18, d = -1e18; for (const e of D.e) if (D.katlar[e.k]?.v) { const s = sinir(e, ts); a = Math.min(a, s.x0); b = Math.min(b, s.y0); c = Math.max(c, s.x1); d = Math.max(d, s.y1); } return a > c ? null : { x0: a, y0: b, x1: c, y1: d }; }
  function svgYaz(D) {
    const ts = 2.5 * D.olcek, tk = 1.5 * D.olcek, s = sinirHepsi(D, ts); if (!s) throw new Error('Çizim boş.');
    const pay = ts * 2, vx = s.x0 - pay, vy = -(s.y1 + pay), vw = s.x1 - s.x0 + pay * 2, vh = s.y1 - s.y0 + pay * 2; let o = '';
    const dd = k => { const q = LT[(k && k.lt) | 0]; return q ? ` stroke-dasharray="${q.map(v => v * D.olcek).join(' ')}"` : ''; };
    const Y = y => -y, ln = (a, b, k) => `<line x1="${a.x}" y1="${Y(a.y)}" x2="${b.x}" y2="${Y(b.y)}" stroke="${k.r}" stroke-width="${k.w * D.olcek}"${dd(k)}/>`;
    const tx = (p, sz, rot, t, k) => `<text x="${p.x}" y="${Y(p.y)}" font-size="${sz}" font-family="Helvetica,Arial,sans-serif" fill="${k.r}" text-anchor="${'start'}" transform="rotate(${-rot * 180 / Math.PI} ${p.x} ${Y(p.y)})">${kacis(t)}</text>`;
    for (const dl of dolgular(D)) o += `<path d="${dl.h.map(r => 'M' + r.map(q => q.x + ' ' + Y(q.y)).join(' L') + 'Z').join(' ')}" fill="${dl.r}" fill-opacity="${dl.a}" fill-rule="evenodd" stroke="none"/>`;
    for (const e of D.e) {
      const k = D.katlar[e.k]; if (!k || !k.v) continue; const sw = `stroke="${k.r}" stroke-width="${k.w * D.olcek}" fill="none"${dd(k)}`;
      if (e.t === 'l') o += ln(e.a, e.b, k);
      else if (e.t === 'p') o += `<${e.kapali ? 'polygon' : 'polyline'} points="${e.pts.map(p => p.x + ',' + Y(p.y)).join(' ')}" ${sw}/>`;
      else if (e.t === 'c') o += `<circle cx="${e.c.x}" cy="${Y(e.c.y)}" r="${e.r}" ${sw}/>`;
      else if (e.t === 'a') { const p0 = sup(e, e.a0), p1 = sup(e, e.a1), bu = norm(e.a1 - e.a0) > Math.PI ? 1 : 0; o += `<path d="M${p0.x} ${Y(p0.y)} A${e.r} ${e.r} 0 ${bu} 0 ${p1.x} ${Y(p1.y)}" ${sw}/>`; }
      else if (e.t === 'x') o += tx(e.p, e.s, e.rot, e.txt, k);
      else if (e.t === 'd') { const g = olcuGeo(e, ts, tk); for (const [a, b] of g.cizgiler) o += ln(a, b, { r: k.r, w: .18 }); o += tx(g.yazi.p, g.yazi.s, g.yazi.rot, g.yazi.t, k).replace('text-anchor="start"', 'text-anchor="middle"'); }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${vw} ${vh}" width="${(vw / D.olcek).toFixed(1)}mm" height="${(vh / D.olcek).toFixed(1)}mm"><rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="#fff"/>${o}</svg>`;
  }

  /* ═════════ Ölçekli PDF (elle yazılır, kütüphane yok) ═════════ */
  const KAGIT = { A4: [210, 297], A3: [297, 420], A2: [420, 594], A1: [594, 841] }, OLCEKLER = [1, 2, 5, 10, 20, 25, 50, 75, 100, 125, 150, 200, 250, 500, 750, 1000, 2000, 5000];
  const TR = { 'Ğ': 128, 'ğ': 129, 'İ': 130, 'ı': 131, 'Ş': 132, 'ş': 133 };
  const pdfMetin = s => { let r = ''; for (const ch of String(s)) { let c = TR[ch] ?? ch.charCodeAt(0); if (c > 255 || c < 32) c = 63; if (c === 40 || c === 41 || c === 92) r += '\\' + String.fromCharCode(c); else r += String.fromCharCode(c); } return r; };
  const f2 = v => (Math.round(v * 1000) / 1000).toString();
  function pdfOlcekOner(D, kagit) {
    const s = sinirHepsi(D, 2.5 * D.olcek); if (!s) return null; const [kw, kh] = KAGIT[kagit] || KAGIT.A4, m = 12, dik = (s.y1 - s.y0) > (s.x1 - s.x0), pw = (dik ? Math.min(kw, kh) : Math.max(kw, kh)) - 2 * m, ph = (dik ? Math.max(kw, kh) : Math.min(kw, kh)) - 2 * m - (D.antet && D.antet.goster ? 31 : 10);
    const gerek = Math.max((s.x1 - s.x0) / pw, (s.y1 - s.y0) / ph); return OLCEKLER.find(o => o >= gerek) || OLCEKLER[OLCEKLER.length - 1];
  }
  function pdfYaz(D, { kagit = 'A4', olcek = 100, dik = null, bol = false } = {}) {
    const ts = 2.5 * olcek, tk = 1.5 * olcek, s = sinirHepsi(D, ts); if (!s) throw new Error('Çizim boş.');
    const [kw, kh] = KAGIT[kagit] || KAGIT.A4, yatayDik = dik ?? ((s.y1 - s.y0) > (s.x1 - s.x0)), W = yatayDik ? Math.min(kw, kh) : Math.max(kw, kh), H = yatayDik ? Math.max(kw, kh) : Math.min(kw, kh), m = 12;
    const an = D.antet && D.antet.goster ? D.antet : null, rez = an ? 31 : 10, pw = W - 2 * m, ph = H - 2 * m - rez, cw = (s.x1 - s.x0) / olcek, ch = (s.y1 - s.y0) / olcek, sigar = cw <= pw + 1e-6 && ch <= ph + 1e-6, mm = 72 / 25.4;
    const nx = !sigar && bol ? Math.ceil(cw / pw - 1e-9) : 1, ny = !sigar && bol ? Math.ceil(ch / ph - 1e-9) : 1, top = nx * ny;
    if (top > 36) throw new Error('Çok fazla sayfa gerekiyor (en fazla 36). Ölçeği küçült ya da daha büyük kâğıt seç.');
    let ox = (m + (pw - cw) / 2) * mm - s.x0 / olcek * mm, oy = (m + rez + (ph - ch) / 2) * mm - s.y0 / olcek * mm; const k = mm / olcek;
    const X = x => f2(ox + x * k), Y = y => f2(oy + y * k);
    const icerik = (no) => { let c = '';
    c += '1 J 1 j\n0.5 0.5 0.5 RG 0.35 w\n' + `${f2(m * mm)} ${f2(m * mm)} ${f2(pw * mm)} ${f2((H - 2 * m) * mm)} re S\n`;
    const yaz = (p, sz, rot, t, renk, orta) => { const cs = Math.cos(rot), sn = Math.sin(rot), gen = orta ? t.length * sz * 0.275 : 0, q = P(p.x - cs * gen, p.y - sn * gen); return `BT /F1 ${f2(sz * k)} Tf ${renk.map(v => f2(v)).join(' ')} rg ${f2(cs)} ${f2(sn)} ${f2(-sn)} ${f2(cs)} ${X(q.x)} ${Y(q.y)} Tm (${pdfMetin(t)}) Tj ET\n`; };
    const cizg = (a, b) => `${X(a.x)} ${Y(a.y)} m ${X(b.x)} ${Y(b.y)} l S\n`;
    const yayYol = (e, a0, sw) => { let r = '', kalan = sw, a = a0; const p0 = sup(e, a); r += `${X(p0.x)} ${Y(p0.y)} m `; while (kalan > 1e-9) { const d = Math.min(kalan, Math.PI / 2), kz = 4 / 3 * Math.tan(d / 4), c0 = Math.cos(a), s0 = Math.sin(a), c1 = Math.cos(a + d), s1 = Math.sin(a + d), R = e.r; r += `${X(e.c.x + R * (c0 - kz * s0))} ${Y(e.c.y + R * (s0 + kz * c0))} ${X(e.c.x + R * (c1 + kz * s1))} ${Y(e.c.y + R * (s1 - kz * c1))} ${X(e.c.x + R * c1)} ${Y(e.c.y + R * s1)} c `; a += d; kalan -= d; } return r; };
    if (top > 1) c += `q ${f2(m * mm)} ${f2((m + rez) * mm)} ${f2(pw * mm)} ${f2(ph * mm)} re W n\n`;
    for (const dl of dolgular(D)) c += beyazaKar(dl.r, dl.a).map(v => f2(v)).join(' ') + ' rg\n' + dl.h.map(r => r.map((q, i) => `${X(q.x)} ${Y(q.y)} ${i ? 'l' : 'm'}`).join(' ') + ' h').join(' ') + ' f*\n';
    for (const kt of D.katlar.keys()) {
      const kat = D.katlar[kt]; if (!kat.v) continue; const rgb = hexRgb(kat.r); let acik = false;
      for (const e of D.e) {
        if (e.k !== kt) continue; if (!acik) { acik = true; } c += `${rgb.map(v => f2(v)).join(' ')} RG ${f2(kat.w * mm)} w\n` + ((LT[kat.lt | 0] && e.t !== 'd' && e.t !== 'x') ? `[${LT[kat.lt | 0].map(v => f2(v * mm)).join(' ')}] 0 d\n` : '[] 0 d\n');
        if (e.t === 'l') c += cizg(e.a, e.b);
        else if (e.t === 'p') { c += `${X(e.pts[0].x)} ${Y(e.pts[0].y)} m `; for (let i = 1; i < e.pts.length; i++) c += `${X(e.pts[i].x)} ${Y(e.pts[i].y)} l `; c += (e.kapali ? 'h ' : '') + 'S\n'; }
        else if (e.t === 'c') c += yayYol(e, 0, TAU) + 'h S\n';
        else if (e.t === 'a') c += yayYol(e, e.a0, norm(e.a1 - e.a0) || TAU) + 'S\n';
        else if (e.t === 'x') c += yaz(e.p, e.s, e.rot, e.txt, rgb, false);
        else if (e.t === 'd') { c += `0.18 w\n`; const og = olcuGeo(e, ts, tk); for (const [a, b] of og.cizgiler) c += cizg(a, b); c += yaz(og.yazi.p, og.yazi.s, og.yazi.rot, og.yazi.t, rgb, true); }
      }
    }
    if (top > 1) c += 'Q\n';
    const tarih = new Date().toLocaleDateString('tr-TR'); c += '[] 0 d\n';
    const yz = (x, y, sz, t, g = 0.2) => `BT /F1 ${f2(sz * mm)} Tf ${g} ${g} ${g} rg 1 0 0 1 ${f2(x * mm)} ${f2(y * mm)} Tm (${pdfMetin(t)}) Tj ET\n`;
    if (an) {
      const bw = Math.min(110, pw), bh = 26, bx = m + pw - bw, by = m, sat = [['PROJE', an.proje || D.ad], ['ÇİZEN', an.cizen || ''], ['TARİH', tarih], ['ÖLÇEK', `1:${olcek}  ·  ${kagit}`]];
      c += `0.2 0.2 0.2 RG 0.5 w\n${f2(bx * mm)} ${f2(by * mm)} ${f2(bw * mm)} ${f2(bh * mm)} re S\n0.25 w\n`;
      for (let i = 1; i < 4; i++) c += `${f2(bx * mm)} ${f2((by + i * 6.5) * mm)} m ${f2((bx + bw) * mm)} ${f2((by + i * 6.5) * mm)} l S\n`;
      c += `${f2((bx + 24) * mm)} ${f2(by * mm)} m ${f2((bx + 24) * mm)} ${f2((by + bh) * mm)} l S\n`;
      sat.forEach(([a, b], i) => { const y = by + (3 - i) * 6.5 + 2.1; c += yz(bx + 1.5, y, 2.2, a, 0.45) + yz(bx + 25.5, y, 3.2, String(b).slice(0, Math.floor((bw - 27) / 1.7)), 0.1); });
      c += yz(m + 2, m + 2, 2.8, 'Suha Çizim', 0.45);
    } else {
      c += yz(m + 2, m + 3, 2.8, `${D.ad}  ·  Ölçek 1:${olcek}  ·  ${kagit}  ·  ${tarih}  ·  Suha Çizim${top > 1 ? `  ·  Sayfa ${no + 1}/${top}` : ''}`);
    }
    return c; };
    const nesneler = [];
    const ekle = s => { nesneler.push(s); return nesneler.length; };
    ekle('<< /Type /Catalog /Pages 2 0 R >>'); ekle(`<< /Type /Pages /Kids [${Array.from({ length: top }, (_, i) => `${4 + 2 * i} 0 R`).join(' ')}] /Count ${top} >>`);
    ekle('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding << /Type /Encoding /BaseEncoding /WinAnsiEncoding /Differences [128 /Gbreve /gbreve /Idotaccent /dotlessi /Scedilla /scedilla] >> >>');
    for (let no = 0; no < top; no++) {
      const si = no % nx, sj = Math.floor(no / nx);
      if (top > 1) { ox = m * mm - (s.x0 / olcek + si * pw) * mm; oy = (m + rez) * mm - (s.y0 / olcek + (ny - 1 - sj) * ph) * mm; }
      const c = icerik(no);
      ekle(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${f2(W * mm)} ${f2(H * mm)}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${5 + 2 * no} 0 R >>`); ekle(`<< /Length ${c.length} >>\nstream\n${c}endstream`);
    }
    let pdf = '%PDF-1.4\n', ofs = [];
    nesneler.forEach((n, i) => { ofs.push(pdf.length); pdf += `${i + 1} 0 obj\n${n}\nendobj\n`; });
    const xr = pdf.length; pdf += `xref\n0 ${nesneler.length + 1}\n0000000000 65535 f \n` + ofs.map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('') + `trailer\n<< /Size ${nesneler.length + 1} /Root 1 0 R >>\nstartxref\n${xr}\n%%EOF`;
    const b = new Uint8Array(pdf.length); for (let i = 0; i < pdf.length; i++) b[i] = pdf.charCodeAt(i) & 255;
    return { bayt: b, sigar, olcek, kagit, w: W, h: H, sayfa: top };
  }

  return { P, mes, norm, sup, yayAcisinda, M, donustur, parcalar, olcuGeo, sinir, sinirHepsi, uzak, tutma, kesisimler, yakinKesisim, kirp, uzat, ofset, parcala, noktaSeg, noktaIcinde,
    aciRenk, belgeTemiz, duvarBul, duvarKes, duvarBirlestir, disari, desen, DESEN_AD, halka, halkaAlan, alanOlc, bolgeBul, odaBul, segSegSonsuz, dolgular, tarama, kose, duvar, SEMBOL, LT, LT_AD, dxfYaz, dxfOku, svgYaz, pdfYaz, pdfOlcekOner, KAGIT, OLCEKLER, SINIR, yaziGen };
})();
