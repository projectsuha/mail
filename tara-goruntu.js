/* Tara — görüntü işleme (hem sayfada hem işçide çalışır; tarayıcıya özgü bir şeye dayanmaz).
   Kâğıt bulma (kenar tespiti), perspektif düzeltme, filtreler, leke temizleme.
   Görüntüler { data: Uint8ClampedArray (RGBA), width, height } biçimindedir. */
'use strict';
(function (kok) {

/* ───── Yardımcılar ───── */
function gri(img) {   // parlaklık (0-255)
  const { data, width: w, height: h } = img, g = new Uint8ClampedArray(w * h);
  for (let i = 0, j = 0; j < g.length; i += 4, j++) g[j] = (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8;
  return g;
}
function kutuBulanik(src, w, h, r) {   // ayrılabilir kutu bulanıklaştırma (tek kanal)
  const tmp = new Float32Array(w * h), out = new Float32Array(w * h), n = 2 * r + 1;
  for (let y = 0; y < h; y++) {
    let s = 0; const o = y * w;
    for (let x = -r; x <= r; x++) s += src[o + Math.min(w - 1, Math.max(0, x))];
    for (let x = 0; x < w; x++) { tmp[o + x] = s / n; s += src[o + Math.min(w - 1, x + r + 1)] - src[o + Math.max(0, x - r)]; }
  }
  for (let x = 0; x < w; x++) {
    let s = 0;
    for (let y = -r; y <= r; y++) s += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
    for (let y = 0; y < h; y++) { out[y * w + x] = s / n; s += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x]; }
  }
  return out;
}
function otsu(g) {
  const hist = new Float64Array(256); for (let i = 0; i < g.length; i++) hist[g[i] | 0]++;
  let top = 0; for (let i = 0; i < 256; i++) top += i * hist[i];
  let sB = 0, wB = 0, best = 0, esik = 128;
  for (let t = 0; t < 256; t++) {
    wB += hist[t]; if (!wB) continue; const wF = g.length - wB; if (!wF) break;
    sB += t * hist[t]; const mB = sB / wB, mF = (top - sB) / wF, v = wB * wF * (mB - mF) ** 2;
    if (v > best) { best = v; esik = t; }
  }
  return esik;
}
// Küçültülmüş kopya (alan ortalaması)
function kucult(img, uzun) {
  const { width: w, height: h, data } = img, k = Math.max(1, Math.max(w, h) / uzun), W = Math.max(1, Math.round(w / k)), H = Math.max(1, Math.round(h / k));
  const out = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const x0 = Math.floor(x * k), x1 = Math.min(w, Math.floor((x + 1) * k)) || x0 + 1, y0 = Math.floor(y * k), y1 = Math.min(h, Math.floor((y + 1) * k)) || y0 + 1;
    let r = 0, g = 0, b = 0, n = 0;
    for (let yy = y0; yy < y1; yy += 1) for (let xx = x0; xx < x1; xx += 1) { const i = (yy * w + xx) * 4; r += data[i]; g += data[i + 1]; b += data[i + 2]; n++; }
    const o = (y * W + x) * 4; out[o] = r / n; out[o + 1] = g / n; out[o + 2] = b / n; out[o + 3] = 255;
  }
  return { data: out, width: W, height: H, olcek: k };
}

/* ───── Kâğıt bulma ─────
   Küçük kopyada: parlak bölgeleri (birkaç eşikle) ayır, en büyük parçaların dış zarfından dörtgen çıkar,
   dörtgenin kenarları boyunca kenar gücünü ölç; en iyi puanlı dörtgen seçilir. Dönen köşeler 0-1 arası (sol üst, sağ üst, sağ alt, sol alt). */
function kagitBul(img) {
  const k = kucult(img, 360), w = k.width, h = k.height, L = gri(k);
  const bl = kutuBulanik(kutuBulanik(L, w, h, 1), w, h, 1);
  // Kenar gücü (Sobel)
  const kenar = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    const gx = -bl[i - w - 1] - 2 * bl[i - 1] - bl[i + w - 1] + bl[i - w + 1] + 2 * bl[i + 1] + bl[i + w + 1];
    const gy = -bl[i - w - 1] - 2 * bl[i - w] - bl[i - w + 1] + bl[i + w - 1] + 2 * bl[i + w] + bl[i + w + 1];
    kenar[i] = Math.hypot(gx, gy);
  }
  const blU8 = Uint8ClampedArray.from(bl), t0 = otsu(blU8);
  let enIyi = null;
  for (const t of [t0, t0 - 20, t0 + 20, t0 - 40]) {
    if (t < 20 || t > 240) continue;
    const maske = new Uint8Array(w * h); for (let i = 0; i < maske.length; i++) maske[i] = bl[i] > t ? 1 : 0;
    // Bağlantılı parçalar
    const etiket = new Int32Array(w * h), parca = []; let no = 0;
    const yigin = new Int32Array(w * h);
    for (let i = 0; i < maske.length; i++) {
      if (!maske[i] || etiket[i]) continue;
      no++; let sp = 0, alan = 0, kenaraDeger = 0; yigin[sp++] = i; etiket[i] = no;
      const noktalar = [];
      while (sp) {
        const j = yigin[--sp], x = j % w, y = (j / w) | 0; alan++;
        if (x === 0 || y === 0 || x === w - 1 || y === h - 1) kenaraDeger++;
        noktalar.push(j);
        if (x > 0 && maske[j - 1] && !etiket[j - 1]) { etiket[j - 1] = no; yigin[sp++] = j - 1; }
        if (x < w - 1 && maske[j + 1] && !etiket[j + 1]) { etiket[j + 1] = no; yigin[sp++] = j + 1; }
        if (y > 0 && maske[j - w] && !etiket[j - w]) { etiket[j - w] = no; yigin[sp++] = j - w; }
        if (y < h - 1 && maske[j + w] && !etiket[j + w]) { etiket[j + w] = no; yigin[sp++] = j + w; }
      }
      if (alan > w * h * 0.08) parca.push({ alan, noktalar, kenaraDeger });
    }
    parca.sort((a, b) => b.alan - a.alan);
    for (const p of parca.slice(0, 3)) {
      // Sınır noktaları → dış zarf
      const sinir = [];
      for (const j of p.noktalar) { const x = j % w, y = (j / w) | 0; if (x === 0 || y === 0 || x === w - 1 || y === h - 1 || etiket[j - 1] !== etiket[j] || etiket[j + 1] !== etiket[j] || etiket[j - w] !== etiket[j] || etiket[j + w] !== etiket[j]) sinir.push([x, y]); }
      const zarf = disZarf(sinir); if (zarf.length < 4) continue;
      const q = dortgen(zarf); if (!q) continue;
      const alan = Math.abs(cokgenAlan(q)) / (w * h);
      if (alan < 0.12) continue;
      const destek = kenarDestegi(q, kenar, w, h);
      const puan = destek * (0.6 + alan) * (alan > 0.97 ? 0.3 : 1);
      if (!enIyi || puan > enIyi.puan) enIyi = { puan, q, destek, alan };
    }
  }
  if (!enIyi || enIyi.destek < 18) return { kose: [[0.03, 0.03], [0.97, 0.03], [0.97, 0.97], [0.03, 0.97]], bulundu: false };
  // Köşeleri merkeze doğru çok az içeri al: kenardaki masa/gölge çizgisi taranan sayfaya girmesin
  const q = sirala(enIyi.q).map(([x, y]) => [x / (w - 1), y / (h - 1)]), m = q.reduce((a, p) => [a[0] + p[0] / 4, a[1] + p[1] / 4], [0, 0]);
  return { kose: q.map(([x, y]) => [Math.min(1, Math.max(0, x + (m[0] - x) * 0.012)), Math.min(1, Math.max(0, y + (m[1] - y) * 0.012))]), bulundu: true, puan: enIyi.puan };
}
function disZarf(p) {   // Andrew'un monoton zinciri
  p = p.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const alt = []; for (const q of p) { while (alt.length >= 2 && cr(alt[alt.length - 2], alt[alt.length - 1], q) <= 0) alt.pop(); alt.push(q); }
  const ust = []; for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (ust.length >= 2 && cr(ust[ust.length - 2], ust[ust.length - 1], q) <= 0) ust.pop(); ust.push(q); }
  ust.pop(); alt.pop(); return alt.concat(ust);
}
function cokgenAlan(q) { let s = 0; for (let i = 0; i < q.length; i++) { const a = q[i], b = q[(i + 1) % q.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; }
// Zarftan en büyük alanlı dörtgen (zarf önce sadeleştirilir)
function dortgen(zarf) {
  let p = zarf;
  if (p.length > 16) { const adim = p.length / 16; p = Array.from({ length: 16 }, (_, i) => zarf[Math.floor(i * adim)]); }
  // Uç noktaları da ekle (köşeler kaçmasın)
  const uc = [(a, b) => (a[0] + a[1]) - (b[0] + b[1]), (a, b) => (a[0] - a[1]) - (b[0] - b[1])];
  const ekle = new Set(p);
  uc.forEach(f => { const s = zarf.slice().sort(f); ekle.add(s[0]); ekle.add(s[s.length - 1]); });
  p = zarf.filter(x => ekle.has(x));
  const n = p.length; if (n < 4) return null;
  let best = null, bestA = 0;
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) for (let c = b + 1; c < n; c++) for (let d = c + 1; d < n; d++) {
    const q = [p[a], p[b], p[c], p[d]], A = Math.abs(cokgenAlan(q));
    if (A > bestA) { bestA = A; best = q; }
  }
  return best;
}
function kenarDestegi(q, kenar, w, h) {
  let s = 0, n = 0;
  for (let i = 0; i < 4; i++) {
    const a = q[i], b = q[(i + 1) % 4], L = Math.hypot(b[0] - a[0], b[1] - a[1]), adim = Math.max(1, Math.round(L));
    for (let t = 0.08; t <= 0.92; t += 1 / adim) {
      const x = Math.round(a[0] + (b[0] - a[0]) * t), y = Math.round(a[1] + (b[1] - a[1]) * t);
      let m = 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const xx = x + dx, yy = y + dy; if (xx > 0 && yy > 0 && xx < w - 1 && yy < h - 1) m = Math.max(m, kenar[yy * w + xx]); }
      s += m; n++;
    }
  }
  return n ? s / n / 4 : 0;
}
function sirala(q) {   // sol üst, sağ üst, sağ alt, sol alt
  const top = q.reduce((a, p) => [a[0] + p[0] / 4, a[1] + p[1] / 4], [0, 0]);
  const s = q.slice().sort((a, b) => Math.atan2(a[1] - top[1], a[0] - top[0]) - Math.atan2(b[1] - top[1], b[0] - top[0]));
  // atan2 sırası: sol üstten saat yönü değil; en küçük x+y olanı başa al
  let i0 = 0; s.forEach((p, i) => { if (p[0] + p[1] < s[i0][0] + s[i0][1]) i0 = i; });
  const r = [...s.slice(i0), ...s.slice(0, i0)];
  // saat yönünde mi? (ekran koordinatında) değilse ters çevir
  if (cokgenAlan(r) < 0) return [r[0], r[3], r[2], r[1]];
  return r;
}

/* ───── Perspektif düzeltme ───── */
function homografi(src, dst) {   // dst → src eşlemesi için 3x3 matris (8 bilinmeyenli denklem)
  const A = [], B = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = dst[i], [u, v] = src[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); B.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); B.push(v);
  }
  const n = 8;
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]]; [B[c], B[p]] = [B[p], B[c]];
    for (let r = 0; r < n; r++) { if (r === c) continue; const f = A[r][c] / A[c][c]; for (let k = c; k < n; k++) A[r][k] -= f * A[c][k]; B[r] -= f * B[c]; }
  }
  const h = B.map((b, i) => b / A[i][i]);
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
}
function cikisBoyutu(img, kose, enUzun = 2400) {
  const P = kose.map(([x, y]) => [x * img.width, y * img.height]);
  const d = (a, b) => Math.hypot(P[a][0] - P[b][0], P[a][1] - P[b][1]);
  let W = Math.max(d(0, 1), d(3, 2)), H = Math.max(d(0, 3), d(1, 2));
  const k = Math.min(1, enUzun / Math.max(W, H));
  return [Math.max(8, Math.round(W * k)), Math.max(8, Math.round(H * k))];
}
function duzelt(img, kose, enUzun = 2400) {
  const [W, H] = cikisBoyutu(img, kose, enUzun), { data: s, width: sw, height: shh } = img;
  const src = kose.map(([x, y]) => [x * (sw - 1), y * (shh - 1)]);
  const m = homografi(src, [[0, 0], [W - 1, 0], [W - 1, H - 1], [0, H - 1]]);
  const out = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const z = m[6] * x + m[7] * y + 1, u = (m[0] * x + m[1] * y + m[2]) / z, v = (m[3] * x + m[4] * y + m[5]) / z;
    const x0 = Math.floor(u), y0 = Math.floor(v), fx = u - x0, fy = v - y0, o = (y * W + x) * 4;
    if (x0 < 0 || y0 < 0 || x0 >= sw - 1 || y0 >= shh - 1) {
      const xc = Math.min(sw - 1, Math.max(0, Math.round(u))), yc = Math.min(shh - 1, Math.max(0, Math.round(v))), i = (yc * sw + xc) * 4;
      out[o] = s[i]; out[o + 1] = s[i + 1]; out[o + 2] = s[i + 2]; out[o + 3] = 255; continue;
    }
    const i00 = (y0 * sw + x0) * 4, i10 = i00 + 4, i01 = i00 + sw * 4, i11 = i01 + 4;
    for (let c = 0; c < 3; c++) out[o + c] = (s[i00 + c] * (1 - fx) + s[i10 + c] * fx) * (1 - fy) + (s[i01 + c] * (1 - fx) + s[i11 + c] * fx) * fy;
    out[o + 3] = 255;
  }
  return { data: out, width: W, height: H };
}
function dondur(img, aci) {
  aci = ((aci % 360) + 360) % 360; if (!aci) return img;
  const { data: s, width: w, height: h } = img, W = aci === 180 ? w : h, H = aci === 180 ? h : w, out = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const [X, Y] = aci === 90 ? [h - 1 - y, x] : aci === 180 ? [w - 1 - x, h - 1 - y] : [y, w - 1 - x];
    const i = (y * w + x) * 4, o = (Y * W + X) * 4; out[o] = s[i]; out[o + 1] = s[i + 1]; out[o + 2] = s[i + 2]; out[o + 3] = 255;
  }
  return { data: out, width: W, height: H };
}

/* ───── Filtreler ───── */
// Kâğıdın (arka planın) her noktadaki rengi: yazıyı silen büyük "en parlak" süzgeç + yumuşatma
function zemin(img) {
  const { data, width: w, height: h } = img, b = Math.max(4, Math.round(Math.min(w, h) / 60)), W = Math.ceil(w / b), H = Math.ceil(h / b);
  const kanal = [new Float32Array(W * H), new Float32Array(W * H), new Float32Array(W * H)];
  for (let Y = 0; Y < H; Y++) for (let X = 0; X < W; X++) {
    // blok içinde parlaklığa göre üst %10'un ortalaması (tek bir parlak noktaya aldanmasın)
    const L = [];
    for (let y = Y * b; y < Math.min(h, (Y + 1) * b); y += 2) for (let x = X * b; x < Math.min(w, (X + 1) * b); x += 2) { const i = (y * w + x) * 4; L.push([data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29, i]); }
    L.sort((a, c) => c[0] - a[0]);
    const n = Math.max(1, Math.round(L.length * 0.12)); let r = 0, g = 0, bb = 0;
    for (let k = 0; k < n; k++) { const i = L[k][1]; r += data[i]; g += data[i + 1]; bb += data[i + 2]; }
    const j = Y * W + X; kanal[0][j] = r / n; kanal[1][j] = g / n; kanal[2][j] = bb / n;
  }
  // Genişlet (yazı/görsel blokları aşılsın) ve yumuşat
  const yay = k => { const o = new Float32Array(W * H); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let m = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = Math.min(W - 1, Math.max(0, x + dx)), yy = Math.min(H - 1, Math.max(0, y + dy)); m = Math.max(m, k[yy * W + xx]); } o[y * W + x] = m; } return o; };
  const sonuc = kanal.map(k => kutuBulanik(kutuBulanik(yay(yay(k)), W, H, 2), W, H, 2));
  return { kanal: sonuc, W, H, b, al(x, y, c) {   // çift doğrusal
    const fx = Math.min(W - 1, Math.max(0, x / b - 0.5)), fy = Math.min(H - 1, Math.max(0, y / b - 0.5)), x0 = fx | 0, y0 = fy | 0, x1 = Math.min(W - 1, x0 + 1), y1 = Math.min(H - 1, y0 + 1), ax = fx - x0, ay = fy - y0, k = this.kanal[c];
    return (k[y0 * W + x0] * (1 - ax) + k[y0 * W + x1] * ax) * (1 - ay) + (k[y1 * W + x0] * (1 - ax) + k[y1 * W + x1] * ax) * ay;
  } };
}
function yuzdelik(hist, toplam, p) { let s = 0; for (let i = 0; i < 256; i++) { s += hist[i]; if (s >= toplam * p) return i; } return 255; }
function filtre(img, tur = 'belge', ayar = {}) {
  const { data: s, width: w, height: h } = img, out = new Uint8ClampedArray(s.length), n = w * h;
  const parlak = (ayar.parlak || 0) * 1.2, kontrast = 1 + (ayar.kontrast || 0) / 100;
  const ayarla = v => (v - 128) * kontrast + 128 + parlak;
  if (tur === 'orijinal' || tur === 'renkli') {
    let lo = [0, 0, 0], hi = [255, 255, 255];
    if (tur === 'renkli') {
      const hs = [new Float64Array(256), new Float64Array(256), new Float64Array(256)];
      for (let i = 0; i < s.length; i += 4) { hs[0][s[i]]++; hs[1][s[i + 1]]++; hs[2][s[i + 2]]++; }
      lo = hs.map(x => yuzdelik(x, n, 0.01)); hi = hs.map(x => yuzdelik(x, n, 0.99));
    }
    for (let i = 0; i < s.length; i += 4) {
      let r = (s[i] - lo[0]) * 255 / Math.max(1, hi[0] - lo[0]), g = (s[i + 1] - lo[1]) * 255 / Math.max(1, hi[1] - lo[1]), b = (s[i + 2] - lo[2]) * 255 / Math.max(1, hi[2] - lo[2]);
      if (tur === 'renkli') { const L = (r + g + b) / 3; r = L + (r - L) * 1.15; g = L + (g - L) * 1.15; b = L + (b - L) * 1.15; }
      out[i] = ayarla(r); out[i + 1] = ayarla(g); out[i + 2] = ayarla(b); out[i + 3] = 255;
    }
    return { data: out, width: w, height: h };
  }
  // Belge türleri: zemine bölerek gölgeyi ve renk kaymasını sil
  const z = zemin(img), norm = new Float32Array(n * 3);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4, j = (y * w + x) * 3;
    for (let c = 0; c < 3; c++) norm[j + c] = Math.min(255, s[i + c] / Math.max(24, z.al(x, y, c)) * 255);
  }
  // Mürekkep koyuluğu: normalleştirilmiş parlaklığın alt %'si siyah noktası olur
  const hist = new Float64Array(256);
  for (let j = 0; j < n; j++) hist[Math.round((norm[j * 3] * 77 + norm[j * 3 + 1] * 150 + norm[j * 3 + 2] * 29) / 256)]++;
  const siyah = Math.min(150, yuzdelik(hist, n, 0.02)), beyaz = Math.max(siyah + 40, Math.min(245, yuzdelik(hist, n, 0.6)));
  const seviye = v => Math.max(0, Math.min(255, (v - siyah) * 255 / (beyaz - siyah)));
  const doyma = tur === 'tahta' ? 1.6 : 1.12, gama = tur === 'tahta' ? 1.25 : 1.15;
  let esik = 0;
  if (tur === 'sb') { const hs = new Uint8ClampedArray(n); for (let j = 0; j < n; j++) hs[j] = seviye((norm[j * 3] * 77 + norm[j * 3 + 1] * 150 + norm[j * 3 + 2] * 29) / 256); esik = Math.max(110, Math.min(215, otsu(hs) + 25)); }
  for (let j = 0, i = 0; j < n; j++, i += 4) {
    let r = seviye(norm[j * 3]), g = seviye(norm[j * 3 + 1]), b = seviye(norm[j * 3 + 2]);
    // koyu tonları biraz daha koyulaştır (yazı netleşsin)
    r = 255 * Math.pow(r / 255, gama); g = 255 * Math.pow(g / 255, gama); b = 255 * Math.pow(b / 255, gama);
    if (tur === 'gri' || tur === 'sb') {
      let L = ayarla((r * 77 + g * 150 + b * 29) / 256);
      if (tur === 'sb') L = L < esik - 18 ? 0 : L > esik + 18 ? 255 : (L - (esik - 18)) / 36 * 255;
      out[i] = out[i + 1] = out[i + 2] = L;
    } else {
      const L = (r + g + b) / 3;
      out[i] = ayarla(L + (r - L) * doyma); out[i + 1] = ayarla(L + (g - L) * doyma); out[i + 2] = ayarla(L + (b - L) * doyma);
    }
    out[i + 3] = 255;
  }
  return { data: out, width: w, height: h };
}
// Leke temizleme: fırçayla boyanan yerler o bölgenin kâğıt rengiyle doldurulur. Çizgiler 0-1 koordinatlı.
function temizle(img, cizgiler) {
  if (!cizgiler || !cizgiler.length) return img;
  const { data, width: w, height: h } = img, z = zemin(img), maske = new Uint8Array(w * h);
  cizgiler.forEach(c => {
    const r = Math.max(2, c.r * Math.max(w, h)), p = c.n.map(([x, y]) => [x * w, y * h]);
    const boya = (cx, cy) => { for (let y = Math.max(0, Math.floor(cy - r)); y <= Math.min(h - 1, Math.ceil(cy + r)); y++) for (let x = Math.max(0, Math.floor(cx - r)); x <= Math.min(w - 1, Math.ceil(cx + r)); x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) maske[y * w + x] = 1; };
    for (let i = 0; i < p.length; i++) {
      const a = p[i], b = p[i + 1] || a, L = Math.hypot(b[0] - a[0], b[1] - a[1]), adim = Math.max(1, Math.ceil(L / (r / 2)));
      for (let k = 0; k <= adim; k++) boya(a[0] + (b[0] - a[0]) * k / adim, a[1] + (b[1] - a[1]) * k / adim);
    }
  });
  const out = new Uint8ClampedArray(data);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const j = y * w + x; if (!maske[j]) continue; const i = j * 4; out[i] = z.al(x, y, 0); out[i + 1] = z.al(x, y, 1); out[i + 2] = z.al(x, y, 2); }
  return { data: out, width: w, height: h };
}
// Sayfanın tamamı: düzelt → döndür → filtre → temizle
function isle(img, sayfa, enUzun) {
  let r = duzelt(img, sayfa.kose || [[0, 0], [1, 0], [1, 1], [0, 1]], enUzun);
  r = dondur(r, sayfa.don || 0);
  r = filtre(r, sayfa.filtre || 'belge', { parlak: sayfa.parlak || 0, kontrast: sayfa.kontrast || 0 });
  r = temizle(r, sayfa.leke);
  return r;
}

kok.TaraGoruntu = { gri, kucult, kagitBul, duzelt, dondur, filtre, temizle, isle, cikisBoyutu, homografi };
})(typeof self !== 'undefined' ? self : this);
