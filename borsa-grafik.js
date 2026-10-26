/* ───────────── Borsa: grafikler ─────────────
   Fiyat grafiği (çizgi/alan/mum, hacim, gösterge panelleri, artı imleci), küçük çizgi grafik (sparkline),
   halka grafik ve ısı haritası (treemap). Harici kütüphane yok; hepsi canvas ve SVG ile çizilir. */
'use strict';

const RENK = { up: '#16a34a', down: '#dc2626', notr: '#8a9099' };
const PALET = ['#4262ff', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#64748b', '#f97316'];
const css = (v, d) => getComputedStyle(document.body).getPropertyValue(v).trim() || d;

class Grafik {
  constructor(kutu, opt = {}) {
    this.kutu = kutu; this.opt = opt; this.d = null; this.ix = null;
    this.cv = document.createElement('canvas'); this.cv.className = 'bg-canvas';
    kutu.appendChild(this.cv);
    this.ro = new ResizeObserver(() => this.ciz()); this.ro.observe(kutu);
    const konum = e => { const r = this.cv.getBoundingClientRect(); return this.indeks(e.clientX - r.left); };
    let dokunma = false;
    this.cv.addEventListener('pointermove', e => { if (e.pointerType === 'touch' && !dokunma) return; this.isaretle(konum(e)); });
    this.cv.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') { dokunma = true; this.cv.setPointerCapture(e.pointerId); } this.isaretle(konum(e)); });
    const bitir = e => { if (e.pointerType === 'touch') dokunma = false; this.isaretle(null); };
    this.cv.addEventListener('pointerup', e => { if (e.pointerType === 'touch') bitir(e); });
    this.cv.addEventListener('pointercancel', bitir);
    this.cv.addEventListener('pointerleave', e => { if (e.pointerType !== 'touch') bitir(e); });
  }
  yokEt() { this.ro.disconnect(); this.cv.remove(); }
  set(d) { this.d = d; this.ix = null; this.ciz(); }
  isaretle(i) { if (i === this.ix) return; this.ix = i; this.ciz(); this.opt.onHover?.(i); }
  indeks(px) {
    const L = this.L; if (!L || !this.d) return null;
    if (px < L.x0 - 4 || px > L.x1 + 4) return null;
    const s = this.d.seriler[0];
    if (this.d.zamanX) {   // karşılaştırma: zamana göre en yakın nokta
      const t = L.t0 + (px - L.x0) / (L.x1 - L.x0) * (L.t1 - L.t0);
      let best = 0, bd = Infinity; s.t.forEach((x, i) => { const dd = Math.abs(x - t); if (dd < bd) { bd = dd; best = i; } }); return best;
    }
    return Math.max(0, Math.min(s.c.length - 1, Math.round((px - L.x0) / L.adim)));
  }
  ciz() {
    const d = this.d, cv = this.cv, W = this.kutu.clientWidth, H = this.kutu.clientHeight;
    if (!W || !H) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + 'px'; cv.style.height = H + 'px'; }
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    const fg3 = css('--fg-3', '#7b8088'), cizgi = css('--line', '#cfd3d8'), font = '11px -apple-system, "Segoe UI", Roboto, sans-serif';
    if (!d || !d.seriler?.length || !d.seriler[0].c?.length) {
      g.fillStyle = fg3; g.font = '13px -apple-system, "Segoe UI", sans-serif'; g.textAlign = 'center';
      g.fillText(d?.mesaj || 'Veri yok', W / 2, H / 2); this.L = null; return;
    }
    const paneller = d.paneller || [], pH = W < 520 ? 58 : 72, altX = 20;
    const x0 = 6, x1 = W - (W < 520 ? 50 : 62), y0 = 10, ana1 = H - altX - paneller.length * (pH + 8);
    const s0 = d.seriler[0], n = s0.c.length, adim = n > 1 ? (x1 - x0) / (n - 1) : 0;
    const L = this.L = { x0, x1, y0, y1: ana1, adim, t0: 0, t1: 1 };
    // X dönüşümü
    let X;
    if (d.zamanX) {
      L.t0 = Math.min(...d.seriler.map(s => s.t[0])); L.t1 = Math.max(...d.seriler.map(s => s.t[s.t.length - 1]));
      const sp = L.t1 - L.t0 || 1; X = (s, i) => x0 + (s.t[i] - L.t0) / sp * (x1 - x0);
    } else X = (s, i) => x0 + i * adim;
    // Y aralığı
    const degerler = [];
    const ekle = a => a && a.forEach(v => v != null && isFinite(v) && degerler.push(v));
    d.seriler.forEach(s => { if (d.tip === 'mum') { ekle(s.h); ekle(s.l); } else ekle(s.y || s.c); });
    (d.katmanlar || []).forEach(k => ekle(k.d));
    if (d.taban != null) degerler.push(d.taban);
    let mn = Math.min(...degerler), mx = Math.max(...degerler);
    if (mn === mx) { mn -= Math.abs(mn) * 0.01 || 1; mx += Math.abs(mx) * 0.01 || 1; }
    const hacimH = d.hacim ? (ana1 - y0) * 0.18 : 0, yb = ana1 - hacimH - 4, pad = (mx - mn) * 0.07;
    mn -= pad; mx += pad;
    const Y = v => y0 + (mx - v) / (mx - mn) * (yb - y0);
    L.Y = Y; L.X = X;
    // Izgara ve fiyat etiketleri
    g.font = font; g.textAlign = 'left'; g.textBaseline = 'middle';
    const adimY = guzelAdim((mx - mn) / 4);
    for (let v = Math.ceil(mn / adimY) * adimY; v <= mx; v += adimY) {
      const y = Math.round(Y(v)) + 0.5; if (y < y0 + 4 || y > yb - 2) continue;
      g.strokeStyle = cizgi; g.globalAlpha = 0.55; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); g.globalAlpha = 1;
      g.fillStyle = fg3; g.fillText(d.yuzde ? fPct(v) : kisaSayi(v), x1 + 6, y);
    }
    // Önceki kapanış (taban) çizgisi
    if (d.taban != null) {
      const y = Math.round(Y(d.taban)) + 0.5; g.setLineDash([3, 4]); g.strokeStyle = fg3; g.globalAlpha = 0.7;
      g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); g.setLineDash([]); g.globalAlpha = 1;
    }
    // Hacim
    if (d.hacim && s0.v?.length) {
      const vmax = Math.max(...s0.v.filter(v => v != null)) || 1, bw = Math.max(1, Math.min(8, adim * 0.7));
      s0.v.forEach((v, i) => {
        if (!v) return; const h = v / vmax * hacimH, x = X(s0, i);
        g.fillStyle = (s0.c[i] >= (s0.o?.[i] ?? s0.c[i - 1] ?? s0.c[i])) ? RENK.up : RENK.down; g.globalAlpha = 0.22;
        g.fillRect(x - bw / 2, ana1 - h, bw, h);
      });
      g.globalAlpha = 1;
    }
    // Seriler
    d.seriler.forEach((s, si) => {
      const ys = s.y || s.c, renk = s.renk || PALET[si];
      if (d.tip === 'mum' && si === 0) {
        const bw = Math.max(1, Math.min(12, adim * 0.62));
        s.c.forEach((c, i) => {
          const o = s.o?.[i] ?? c, h = s.h?.[i] ?? c, l = s.l?.[i] ?? c, x = Math.round(X(s, i)) + 0.5, up = c >= o;
          g.strokeStyle = g.fillStyle = up ? RENK.up : RENK.down;
          g.beginPath(); g.moveTo(x, Y(h)); g.lineTo(x, Y(l)); g.stroke();
          const a = Y(Math.max(o, c)), b = Y(Math.min(o, c)); g.fillRect(x - bw / 2, a, bw, Math.max(1, b - a));
        });
        return;
      }
      g.beginPath(); let ilk = true;
      ys.forEach((v, i) => { if (v == null) return; const x = X(s, i), y = Y(v); if (ilk) { g.moveTo(x, y); ilk = false; } else g.lineTo(x, y); });
      if (d.tip === 'alan' && si === 0) {
        g.save(); const gr = g.createLinearGradient(0, y0, 0, yb);
        gr.addColorStop(0, hexA(renk, 0.26)); gr.addColorStop(1, hexA(renk, 0));
        g.lineTo(X(s, ys.length - 1), yb); g.lineTo(X(s, 0), yb); g.closePath(); g.fillStyle = gr; g.fill(); g.restore();
        g.beginPath(); ilk = true; ys.forEach((v, i) => { if (v == null) return; const x = X(s, i), y = Y(v); if (ilk) { g.moveTo(x, y); ilk = false; } else g.lineTo(x, y); });
      }
      g.strokeStyle = renk; g.lineWidth = d.seriler.length > 1 ? 1.8 : 2; g.lineJoin = 'round'; g.stroke(); g.lineWidth = 1;
    });
    // Katmanlar (hareketli ortalama, Bollinger)
    (d.katmanlar || []).forEach(k => {
      g.beginPath(); let ilk = true;
      k.d.forEach((v, i) => { if (v == null) return; const x = X(s0, i), y = Y(v); if (ilk) { g.moveTo(x, y); ilk = false; } else g.lineTo(x, y); });
      g.strokeStyle = k.renk; g.lineWidth = 1.3; if (k.kesik) g.setLineDash([4, 3]); g.globalAlpha = 0.9; g.stroke(); g.setLineDash([]); g.globalAlpha = 1; g.lineWidth = 1;
    });
    // Olay işaretleri (temettü, bölünme)
    (d.olaylar || []).forEach(o => {
      const i = s0.t.findIndex(t => t >= o.t); if (i < 0) return;
      const x = X(s0, i); g.fillStyle = o.renk || '#8b5cf6'; g.beginPath(); g.arc(x, yb - 6, 3.2, 0, 7); g.fill();
    });
    // Gösterge panelleri
    let py = ana1 + 8;
    paneller.forEach(p => {
      const a = py, b = py + pH; py = b + 8;
      g.strokeStyle = cizgi; g.globalAlpha = 0.6; g.strokeRect(x0 + 0.5, a + 0.5, x1 - x0, pH); g.globalAlpha = 1;
      g.fillStyle = fg3; g.textAlign = 'left'; g.fillText(p.ad, x0 + 6, a + 9);
      let pm = p.min, pM = p.max;
      if (pm == null) { const vs = []; p.seriler.forEach(z => z.d.forEach(v => v != null && vs.push(v))); (p.cubuk || []).forEach(v => v != null && vs.push(v)); pm = Math.min(...vs, 0); pM = Math.max(...vs, 0); if (pm === pM) pM = pm + 1; }
      const PY = v => a + 4 + (pM - v) / (pM - pm) * (pH - 8);
      (p.cizgiler || []).forEach(v => { const y = Math.round(PY(v)) + 0.5; g.setLineDash([2, 3]); g.strokeStyle = fg3; g.globalAlpha = 0.6; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; g.fillStyle = fg3; g.fillText(String(v), x1 + 6, y); });
      if (p.cubuk) { const bw = Math.max(1, adim * 0.6), z = PY(0); p.cubuk.forEach((v, i) => { if (v == null) return; g.fillStyle = v >= 0 ? RENK.up : RENK.down; g.globalAlpha = 0.5; const y = PY(v); g.fillRect(X(s0, i) - bw / 2, Math.min(y, z), bw, Math.abs(y - z) || 1); }); g.globalAlpha = 1; }
      p.seriler.forEach(z => { g.beginPath(); let ilk = true; z.d.forEach((v, i) => { if (v == null) return; const x = X(s0, i), y = PY(v); if (ilk) { g.moveTo(x, y); ilk = false; } else g.lineTo(x, y); }); g.strokeStyle = z.renk; g.lineWidth = 1.4; g.stroke(); g.lineWidth = 1; });
      p._a = a; p._PY = PY;
    });
    // Zaman etiketleri
    g.fillStyle = fg3; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    const etiket = d.zamanEtiket || (t => new Date(t).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }));
    const adet = Math.max(2, Math.min(6, Math.floor((x1 - x0) / 90)));
    for (let k = 0; k <= adet; k++) {
      const i = Math.round(k / adet * (n - 1)), x = X(s0, i);
      g.textAlign = k === 0 ? 'left' : k === adet ? 'right' : 'center';
      g.fillText(etiket(s0.t[i]), x, H - 5);
    }
    // Artı imleci
    if (this.ix != null && this.ix < n) {
      const i = this.ix, x = Math.round(X(s0, i)) + 0.5;
      g.strokeStyle = css('--fg-2', '#5b6068'); g.globalAlpha = 0.6; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, H - altX); g.stroke(); g.globalAlpha = 1;
      d.seriler.forEach((s, si) => {
        const j = d.zamanX ? enYakin(s.t, s0.t[i]) : i, v = (s.y || s.c)[j]; if (v == null) return;
        const xx = X(s, j); g.fillStyle = css('--bg-2', '#fff'); g.strokeStyle = s.renk || PALET[si]; g.lineWidth = 2;
        g.beginPath(); g.arc(xx, Y(v), 4, 0, 7); g.fill(); g.stroke(); g.lineWidth = 1;
      });
      const v = (s0.y || s0.c)[i];
      if (v != null) { const y = Y(v), txt = d.yuzde ? fPct(v) : kisaSayi(v); g.font = 'bold ' + font; const w = g.measureText(txt).width + 10; g.fillStyle = css('--fg', '#1d1f23'); rr(g, x1 + 2, y - 9, w, 18, 4); g.fill(); g.fillStyle = css('--bg-2', '#fff'); g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(txt, x1 + 7, y); g.font = font; }
      const tl = (d.imlecEtiket || etiket)(s0.t[i]); g.font = font; const tw = g.measureText(tl).width + 12;
      const tx = Math.max(x0, Math.min(x1 - tw, x - tw / 2)); g.fillStyle = css('--fg', '#1d1f23'); rr(g, tx, H - altX + 2, tw, 17, 4); g.fill();
      g.fillStyle = css('--bg-2', '#fff'); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(tl, tx + tw / 2, H - altX + 10.5);
    }
  }
  png() { return new Promise(r => this.cv.toBlob(r, 'image/png')); }
}
function enYakin(ts, t) { let b = 0, bd = Infinity; ts.forEach((x, i) => { const d = Math.abs(x - t); if (d < bd) { bd = d; b = i; } }); return b; }
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function hexA(hex, a) { const h = hex.replace('#', ''); const n = parseInt(h.length === 3 ? h.replace(/./g, c => c + c) : h, 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; }
function guzelAdim(x) { const p = 10 ** Math.floor(Math.log10(x || 1)), f = x / p; return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p; }
function kisaSayi(v) { if (Math.abs(v) < 1e-9) v = 0; const a = Math.abs(v); return a >= 1e6 ? fBuyuk(v) : a >= 1000 ? nf(0, 0).format(v) : a >= 1 ? nf(2, 2).format(v) : nf(2, 4).format(v); }

/* Küçük çizgi grafik (liste satırları, özet kartları) */
function spark(c, w = 76, h = 26, renk) {
  if (!c || c.length < 2) return `<svg class="spark" width="${w}" height="${h}"></svg>`;
  const adim = Math.max(1, Math.floor(c.length / 60)), p = c.filter((_, i) => i % adim === 0 || i === c.length - 1);
  const mn = Math.min(...p), mx = Math.max(...p), sp = mx - mn || 1;
  const pts = p.map((v, i) => `${(i / (p.length - 1) * (w - 2) + 1).toFixed(1)},${(h - 2 - (v - mn) / sp * (h - 4)).toFixed(1)}`).join(' ');
  renk = renk || (p[p.length - 1] >= p[0] ? RENK.up : RENK.down);
  return `<svg class="spark" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><polyline points="${pts}" fill="none" stroke="${renk}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}

/* Halka grafik */
function halka(parcalar, boyut = 150, kalin = 22) {
  const top = parcalar.reduce((a, p) => a + Math.max(0, p.v), 0) || 1, r = boyut / 2 - kalin / 2, c = boyut / 2;
  let a = -Math.PI / 2, out = '';
  parcalar.forEach((p, i) => {
    const ac = Math.max(0, p.v) / top * Math.PI * 2; if (ac <= 0) return;
    const b = a + Math.min(ac, Math.PI * 2 - 0.0001), x1 = c + r * Math.cos(a), y1 = c + r * Math.sin(a), x2 = c + r * Math.cos(b), y2 = c + r * Math.sin(b);
    out += `<path d="M${x1.toFixed(2)} ${y1.toFixed(2)}A${r} ${r} 0 ${b - a > Math.PI ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}" stroke="${p.renk || PALET[i % PALET.length]}" stroke-width="${kalin}" fill="none"><title>${esc(p.ad)}</title></path>`;
    a = b;
  });
  return `<svg class="halka" width="${boyut}" height="${boyut}" viewBox="0 0 ${boyut} ${boyut}">${out}</svg>`;
}

/* Isı haritası: kareleştirilmiş (squarified) yerleşim */
function kareYerlesim(ogeler, x, y, w, h) {
  const top = ogeler.reduce((a, o) => a + o.v, 0); if (!top || !ogeler.length) return [];
  const olc = w * h / top, kalan = [...ogeler].sort((a, b) => b.v - a.v).map(o => ({ ...o, a: o.v * olc })), out = [];
  let rx = x, ry = y, rw = w, rh = h;
  const kotu = (sira, k) => { const s = sira.reduce((a, o) => a + o.a, 0), mx = Math.max(...sira.map(o => o.a)), mn = Math.min(...sira.map(o => o.a)); return Math.max(k * k * mx / (s * s), (s * s) / (k * k * mn)); };
  while (kalan.length) {
    const k = Math.min(rw, rh); let sira = [kalan[0]], i = 1;
    while (i < kalan.length && kotu([...sira, kalan[i]], k) <= kotu(sira, k)) { sira.push(kalan[i]); i++; }
    kalan.splice(0, sira.length);
    const s = sira.reduce((a, o) => a + o.a, 0);
    if (rw >= rh) { const sw = s / rh; let yy = ry; sira.forEach(o => { const oh = o.a / sw; out.push({ ...o, x: rx, y: yy, w: sw, h: oh }); yy += oh; }); rx += sw; rw -= sw; }
    else { const sh = s / rw; let xx = rx; sira.forEach(o => { const ow = o.a / sh; out.push({ ...o, x: xx, y: ry, w: ow, h: sh }); xx += ow; }); ry += sh; rh -= sh; }
  }
  return out;
}
function isiRenk(p) {
  if (p == null) return 'var(--bg-3)';
  const k = Math.min(1, Math.abs(p) / 4);
  // Terminal karakteri: koyu zeminde koyudan parlağa yeşil/kırmızı
  return p >= 0 ? `hsl(142 ${45 + k * 25}% ${16 + k * 22}%)` : `hsl(0 ${50 + k * 25}% ${18 + k * 24}%)`;
}
