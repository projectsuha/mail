/* ───────────── Galeri · ek özellikler ─────────────
   Etiket ve not, fotoğraf düzenleme, benzer fotoğraf temizleme, yedek klasörü + hatırlatma, şifreli albüm paketi.
   galeri.js'ten sonra yüklenir; onun G, V, DB, oge, yaz, oku, sil … adlarını kullanır. Ağ isteği yapmaz. */
'use strict';

Object.assign(IC, {
  etiket: GS('<path d="M4 12.5V5a1 1 0 0 1 1-1h7.5l7.5 7.5-8 8z"/><circle cx="8.6" cy="8.6" r="1.3"/>'),
  kirp: GS('<path d="M7 3v14h14M3 7h14v14"/>'),
  kopya: GS('<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8"/>'),
  donSol: GS('<path d="M5 9a7 7 0 1 1-1 5"/><path d="M5 4v5h5"/>'),
  donSag: GS('<path d="M19 9a7 7 0 1 0 1 5"/><path d="M19 4v5h-5"/>'),
  ayna: GS('<path d="M12 3v18"/><path d="M8.5 7 3.5 17h5zM15.5 7l5 10h-5z"/>'),
  isik: GS('<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>'),
  filtre: GS('<circle cx="9" cy="9" r="5.5"/><circle cx="15" cy="9" r="5.5"/><circle cx="12" cy="15" r="5.5"/>'),
  klasor: GS('<path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>')
});
if (!IC.kalem) IC.kalem = GS('<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z"/><path d="M14.5 6.5l3 3"/>');

/* ═════════ Kayıt yardımcısı ═════════ */
async function metaKaydet(o) {
  if (o.sifreli) {
    const k = G.kilit[o.album]; if (!k) throw new Error('Albüm kilitli');
    const e = await GE.jsonSifrele(k.key, metaYap(o)); o.e = e;
    const raw = G.ogeler.find(x => x.id === o.id); if (raw) raw.e = e;
    await DB.yaz('oge', { id: o.id, album: o.album, sifreli: true, tur: o.tur, tarih: o.eklenme, eklenme: o.eklenme, e, kucukE: o.kucukE });
  } else await DB.yaz('oge', ogeKayit(o));
}
const etkAyir = t => etkTemiz(String(t || '').split(/[,\n;]+/));

/* ═════════ Not ve etiket ═════════ */
function etiketChips() {
  const el = $('#gEtk'); if (!el) return;
  const sayac = new Map();
  for (const o of G.ogeler) if (gorunur(o)) for (const t of o.etk || []) sayac.set(t, (sayac.get(t) || 0) + 1);
  for (const k of Object.values(G.kilit)) for (const o of k.ogeler) for (const t of o.etk || []) sayac.set(t, (sayac.get(t) || 0) + 1);
  const l = [...sayac].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'tr')).slice(0, 8);
  const q = G.q.trim().toLocaleLowerCase('tr');
  el.innerHTML = l.map(([t]) => `<button data-action="g-etk" data-t="${esc(t)}" class="${q === t ? 'on' : ''}">#${esc(t)}</button>`).join('');
  el.style.display = l.length ? 'contents' : 'none';
}
function notDuzenle(l) {
  return new Promise(res => {
    const tek = l.length === 1, o = l[0];
    $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-ask="x">${IC.close}</button><h3>${tek ? 'Not ve etiketler' : l.length + ' öğeyi etiketle'}</h3></header>
      <form class="set-body" id="gNotForm">
      ${tek ? `<label class="nask-l">Not<textarea id="gNot" rows="3" maxlength="600" placeholder="Bu fotoğraf hakkında bir şey yaz…">${esc(o.not || '')}</textarea></label>` : ''}
      <label class="nask-l">${tek ? 'Etiketler' : 'Eklenecek etiketler'}<input id="gEtkIn" value="${tek ? esc((o.etk || []).join(', ')) : ''}" maxlength="300" autocomplete="off" placeholder="tatil, aile, fatura"></label>
      <p class="g-ipucu">Etiketleri virgülle ayır. Arama kutusu notlara ve etiketlere de bakar.${tek && o.sifreli ? ' Kilitli albümde not ve etiketler de şifrelenir.' : ''}</p>
      <div class="sticky-actions"><button type="button" class="btn" data-ask="x">Vazgeç</button><button class="btn primary">Kaydet</button></div></form></div></div>`;
    const bit = v => { closeModal(); res(v); };
    $('#modal').querySelectorAll('[data-ask="x"]').forEach(b => b.onclick = () => bit(false));
    $('#gNotForm').addEventListener('submit', async e => {
      e.preventDefault();
      const yeni = etkAyir($('#gEtkIn').value), not = tek ? kisalt($('#gNot').value.trim(), 600) : '';
      try {
        for (const x of l) {
          if (tek) { x.not = not; x.etk = yeni; } else x.etk = etkTemiz([...(x.etk || []), ...yeni]);
          await metaKaydet(x);
        }
      } catch (er) { toast('Kaydedilemedi: ' + er.message); return bit(false); }
      bit(true);
    });
    setTimeout(() => ($('#gNot') || $('#gEtkIn'))?.focus(), 60);
  });
}

/* ═════════ Fotoğraf düzenleme ═════════ */
const FILTRE = {
  orj: { ad: 'Orijinal' },
  bw: { ad: 'Siyah-beyaz', s: -100, k: 12 },
  sepya: { ad: 'Sepya', sepya: true, k: 4 },
  canli: { ad: 'Canlı', s: 38, k: 14 },
  soguk: { ad: 'Soğuk', w: -38, s: 8 },
  sicak: { ad: 'Sıcak', w: 38, s: 8 },
  solgun: { ad: 'Solgun', k: -20, b: 9, s: -28 }
};
const ORANLAR = [['orj', 'Orijinal', 0], ['1:1', '1:1', 1], ['4:3', '4:3', 4 / 3], ['3:4', '3:4', 3 / 4], ['16:9', '16:9', 16 / 9], ['9:16', '9:16', 9 / 16]];
let E = null;

function kucult(src, n) {
  const k = Math.min(1, n / Math.max(src.width, src.height)), c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(src.width * k)); c.height = Math.max(1, Math.round(src.height * k));
  const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, c.width, c.height); return c;
}
function dondurC(cv, rot, ayna) {
  const q = rot % 2, c = document.createElement('canvas'); c.width = q ? cv.height : cv.width; c.height = q ? cv.width : cv.height;
  const x = c.getContext('2d'); x.translate(c.width / 2, c.height / 2); if (ayna) x.scale(-1, 1); x.rotate(rot * Math.PI / 2); x.drawImage(cv, -cv.width / 2, -cv.height / 2); return c;
}
function kesitKutu(W, H) {
  const o = ORANLAR.find(r => r[0] === E.oran)?.[2] || 0;
  let w = W, h = H; if (o) { w = Math.min(W, H * o); h = w / o; }
  w /= E.zoom; h /= E.zoom;
  const x = Math.min(Math.max(E.cx * W - w / 2, 0), W - w), y = Math.min(Math.max(E.cy * H - h / 2, 0), H - h);
  return { x, y, w, h };
}
function renkUygula(c, ayar, filtre) {
  const F = FILTRE[filtre] || {}, b = (ayar.b + (F.b || 0)) * 1.6, w = (ayar.w + (F.w || 0)) * .55;
  const k = Math.max(-95, Math.min(95, ayar.k + (F.k || 0))) * 2.55, cf = (259 * (k + 255)) / (255 * (259 - k)), s = 1 + Math.max(-100, ayar.s + (F.s || 0)) / 100;
  if (!b && !w && !k && s === 1 && !F.sepya) return;
  const x = c.getContext('2d'), d = x.getImageData(0, 0, c.width, c.height), a = d.data;
  for (let i = 0; i < a.length; i += 4) {
    let r = a[i] + b + w, g = a[i + 1] + b, bl = a[i + 2] + b - w;
    if (k) { r = cf * (r - 128) + 128; g = cf * (g - 128) + 128; bl = cf * (bl - 128) + 128; }
    if (s !== 1) { const y = .299 * r + .587 * g + .114 * bl; r = y + (r - y) * s; g = y + (g - y) * s; bl = y + (bl - y) * s; }
    if (F.sepya) { const R = .393 * r + .769 * g + .189 * bl, G2 = .349 * r + .686 * g + .168 * bl, B = .272 * r + .534 * g + .131 * bl; r = R; g = G2; bl = B; }
    a[i] = r; a[i + 1] = g; a[i + 2] = bl;
  }
  x.putImageData(d, 0, 0);
}
function duzenCiz(kaynak, hedef) {         // kaynak: dönmemiş tuval; hedef: çıktı tuvali (yoksa yaratılır)
  const R = dondurC(kaynak, E.rot, E.ayna), r = kesitKutu(R.width, R.height);
  const c = hedef || document.createElement('canvas'); c.width = Math.max(1, Math.round(r.w)); c.height = Math.max(1, Math.round(r.h));
  const x = c.getContext('2d', { willReadFrequently: true }); x.imageSmoothingQuality = 'high'; x.drawImage(R, r.x, r.y, r.w, r.h, 0, 0, c.width, c.height);
  renkUygula(c, E, E.filtre); E.son = { r, R: { w: R.width, h: R.height } }; return c;
}
async function duzenleAc(o) {
  if (!o || o.tur !== 'foto') return;
  let p, bmp;
  try { p = await oku(o); bmp = await createImageBitmap(p.blob, { imageOrientation: 'from-image' }); } catch { return toast('Bu fotoğraf düzenlenemiyor'); }
  const tam = kucult(bmp, 4096), onizleme = kucult(bmp, 1400); bmp.close?.();
  E = { o, p, tam, onizleme, rot: 0, ayna: false, oran: 'orj', zoom: 1, cx: .5, cy: .5, b: 0, k: 0, s: 0, w: 0, filtre: 'orj', sekme: 'kirp', degisti: false };
  let el = $('#gDuz'); if (!el) { el = document.createElement('div'); el.id = 'gDuz'; el.className = 'g-duz'; document.body.appendChild(el); }
  el.hidden = false; document.documentElement.classList.add('g-acik');
  el.innerHTML = `<div class="g-duz-ust"><button class="icon-btn" data-action="g-duz-kapat" aria-label="Vazgeç">${IC.close}</button><b>Düzenle</b><div class="spacer"></div><button class="btn sm" data-action="g-duz-sifirla">Sıfırla</button></div>
    <div class="g-duz-sahne" id="gDuzSahne"><canvas id="gDuzCv"></canvas></div>
    <div class="g-duz-panel">
      <div class="g-duz-sek">${[['kirp', IC.kirp, 'Kırp'], ['isik', IC.isik, 'Işık'], ['filtre', IC.filtre, 'Filtre']].map(([k, i, n]) => `<button data-action="g-duz-sek" data-k="${k}">${i}<span>${n}</span></button>`).join('')}</div>
      <div class="g-duz-ic" id="gDuzIc"></div>
      <div class="g-duz-alt"><button class="btn primary" data-action="g-duz-kaydet" data-m="kopya">${IC.kopya} Kopya olarak kaydet</button><button class="btn" data-action="g-duz-kaydet" data-m="yerine">Orijinalin yerine</button></div>
    </div>`;
  duzenPanel(); duzenYenile();
  const cv = $('#gDuzCv'); let bas = null;
  cv.onpointerdown = e => { bas = { x: e.clientX, y: e.clientY, cx: E.cx, cy: E.cy }; cv.setPointerCapture(e.pointerId); };
  cv.onpointermove = e => {
    if (!bas || !E.son) return; const { r, R } = E.son, k = r.w / cv.getBoundingClientRect().width;
    E.cx = Math.min(1, Math.max(0, bas.cx - (e.clientX - bas.x) * k / R.w)); E.cy = Math.min(1, Math.max(0, bas.cy - (e.clientY - bas.y) * k / R.h)); duzenYenile(); E.degisti = true;
  };
  cv.onpointerup = cv.onpointercancel = () => { bas = null; };
}
function duzenPanel() {
  const ic = $('#gDuzIc'); if (!ic) return;
  document.querySelectorAll('.g-duz-sek button').forEach(b => b.classList.toggle('on', b.dataset.k === E.sekme));
  if (E.sekme === 'kirp') ic.innerHTML = `<div class="g-duz-sira">${ORANLAR.map(([k, n]) => `<button class="${E.oran === k ? 'on' : ''}" data-action="g-duz-oran" data-k="${k}">${n}</button>`).join('')}</div>
    <div class="g-duz-sira"><button data-action="g-duz-don" data-d="-1" aria-label="Sola döndür">${IC.donSol}</button><button data-action="g-duz-don" data-d="1" aria-label="Sağa döndür">${IC.donSag}</button><button data-action="g-duz-ayna" class="${E.ayna ? 'on' : ''}" aria-label="Aynala">${IC.ayna}</button></div>
    <label class="g-duz-kay"><span>Yakınlaştır</span><input type="range" min="1" max="4" step="0.01" value="${E.zoom}" data-duz="zoom"></label><p class="g-ipucu" style="margin:0">Kırpılacak bölgeyi parmağınla ya da fareyle sürükleyebilirsin.</p>`;
  else if (E.sekme === 'isik') ic.innerHTML = [['b', 'Parlaklık'], ['k', 'Kontrast'], ['s', 'Doygunluk'], ['w', 'Sıcaklık']].map(([k, n]) => `<label class="g-duz-kay"><span>${n}</span><input type="range" min="-100" max="100" step="1" value="${E[k]}" data-duz="${k}"><output>${E[k]}</output></label>`).join('');
  else {
    ic.innerHTML = `<div class="g-duz-filtre">${Object.entries(FILTRE).map(([k, f]) => `<button class="${E.filtre === k ? 'on' : ''}" data-action="g-duz-filtre" data-k="${k}"><canvas width="64" height="64" data-f="${k}"></canvas><span>${f.ad}</span></button>`).join('')}</div>`;
    const kare = kucult(E.onizleme, 128);
    ic.querySelectorAll('canvas[data-f]').forEach(c => {
      const x = c.getContext('2d', { willReadFrequently: true }), m = Math.min(kare.width, kare.height);
      x.drawImage(kare, (kare.width - m) / 2, (kare.height - m) / 2, m, m, 0, 0, 64, 64); renkUygula(c, { b: 0, k: 0, s: 0, w: 0 }, c.dataset.f);
    });
  }
  ic.querySelectorAll('input[data-duz]').forEach(i => i.oninput = () => { const k = i.dataset.duz; E[k] = +i.value; E.degisti = true; if (i.nextElementSibling?.tagName === 'OUTPUT') i.nextElementSibling.textContent = i.value; duzenYenile(); });
}
let duzRaf = 0;
function duzenYenile() { cancelAnimationFrame(duzRaf); duzRaf = requestAnimationFrame(() => { const cv = $('#gDuzCv'); if (cv && E) duzenCiz(E.onizleme, cv); }); }
async function duzenKaydet(mod) {
  const o = E.o, p = E.p;
  if (!E.degisti && E.oran === 'orj' && !E.rot && !E.ayna && E.filtre === 'orj') return toast('Henüz bir değişiklik yapmadın');
  if (mod === 'yerine' && !(await onay('Orijinalin yerine kaydedilsin mi?', o.sifreli ? 'Orijinal fotoğraf <b>kalıcı olarak</b> silinir (kilitli albüm).' : 'Orijinal "Silinenler"e taşınır; 30 gün içinde geri getirebilirsin.', 'Yerine kaydet'))) return;
  const bar = ilerleme(0, 1); bar(0, 1, 'Kaydediliyor…');
  try {
    const c = duzenCiz(E.tam), png = /png/i.test(p.tip), tip = png ? 'image/png' : 'image/jpeg';
    const blob = await new Promise(r => c.toBlob(r, tip, .92)); if (!blob) throw new Error('Görüntü oluşturulamadı');
    const taban = (p.ad || 'foto').replace(/\.[^.]+$/, ''), ad = mod === 'yerine' ? `${taban}.${png ? 'png' : 'jpg'}` : `${taban} (düzenlendi).${png ? 'png' : 'jpg'}`;
    const f = new File([blob], ad, { type: tip }), id = await GE.kimlik(f), r = await GE.resimOku(f);
    await yaz({ id, ad, tur: 'foto', tip, boyut: blob.size, w: r?.w || c.width, h: r?.h || c.height, sure: 0, tarih: o.tarih, eklenme: Date.now(), konum: o.konum, fav: o.fav, not: o.not || '', etk: o.etk || [], blob: f, kucuk: r?.kucuk || null }, o.album || '');
    const eski = o.id;
    if (mod === 'yerine') { await sil([oge(eski)]); }
    duzenKapat();
    if (V.acik) { const i = V.liste.indexOf(eski); if (mod === 'yerine') V.liste[i] = id; else V.liste.splice(i + 1, 0, id); V.i = mod === 'yerine' ? i : i + 1; vGoster(); }
    ciz(); toast(mod === 'yerine' ? 'Düzenlenen fotoğraf kaydedildi' : 'Kopya olarak kaydedildi');
  } catch (e) { toast('Kaydedilemedi: ' + e.message); } finally { bar(null); }
}
function duzenKapat() { const el = $('#gDuz'); if (el) { el.hidden = true; el.innerHTML = ''; } document.documentElement.classList.toggle('g-acik', !!V.acik); E = null; }

/* ═════════ Benzer fotoğraf temizleme ═════════ */
G.hash = new Map();
async function dHash(o) {
  if (G.hash.has(o.id)) return G.hash.get(o.id);
  let h = null;
  try {
    const b = await createImageBitmap(o.kucuk), c = document.createElement('canvas'); c.width = 9; c.height = 8;
    const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(b, 0, 0, 9, 8); b.close?.();
    const d = x.getImageData(0, 0, 9, 8).data, g = i => .299 * d[i * 4] + .587 * d[i * 4 + 1] + .114 * d[i * 4 + 2];
    let hi = 0, lo = 0, n = 0;
    for (let y = 0; y < 8; y++) for (let k = 0; k < 8; k++) { const bit = g(y * 9 + k) > g(y * 9 + k + 1) ? 1 : 0; if (n < 32) hi = (hi << 1 | bit) >>> 0; else lo = (lo << 1 | bit) >>> 0; n++; }
    h = [hi, lo];
  } catch { /* küçük resim okunamadı */ }
  G.hash.set(o.id, h); return h;
}
const pop = v => { v -= (v >>> 1) & 0x55555555; v = (v & 0x33333333) + ((v >>> 2) & 0x33333333); return (((v + (v >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24; };
async function benzerGruplar(ilerle) {
  const l = G.ogeler.filter(o => gorunur(o) && o.tur === 'foto' && o.kucuk), hs = [];
  for (let i = 0; i < l.length; i++) { if (i % 20 === 0) ilerle(i, l.length); const h = await dHash(l[i]); if (h) hs.push({ o: l[i], h, ar: l[i].w && l[i].h ? l[i].w / l[i].h : 1 }); }
  const ata = hs.map((_, i) => i), bul = i => { while (ata[i] !== i) { ata[i] = ata[ata[i]]; i = ata[i]; } return i; };
  for (let i = 0; i < hs.length; i++) for (let j = i + 1; j < hs.length; j++) {
    if (Math.abs(hs[i].ar - hs[j].ar) > .06 && Math.abs(hs[i].ar - 1 / hs[j].ar) > .06) continue;
    if (pop(hs[i].h[0] ^ hs[j].h[0]) + pop(hs[i].h[1] ^ hs[j].h[1]) <= 6) ata[bul(i)] = bul(j);
  }
  const gr = new Map(); hs.forEach((x, i) => { const k = bul(i); (gr.get(k) || gr.set(k, []).get(k)).push(x.o); });
  return [...gr.values()].filter(g => g.length > 1).map(g => g.sort((a, b) => (b.fav - a.fav) || (b.w * b.h - a.w * a.h) || (b.boyut - a.boyut))).sort((a, b) => b.length - a.length);
}
let BZ = null;
async function benzerAc() {
  if (G.mesgul) return toast('Önceki işlem sürüyor…');
  const bar = ilerleme(0, 1);
  let gr; try { gr = await benzerGruplar((i, n) => bar(i, n, 'Fotoğraflar taranıyor')); } finally { bar(null); }
  BZ = { gr, sil: new Set() };
  for (const g of gr) for (const o of g.slice(1)) BZ.sil.add(o.id);
  benzerCiz();
}
function benzerCiz() {
  const { gr } = BZ, n = BZ.sil.size;
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet g-benz"><header class="sheet-head"><button type="button" class="icon-btn" data-action="g-benz-kapat">${IC.close}</button><h3>Benzer fotoğraflar</h3></header>
    <div class="set-body">${gr.length ? `<p class="muted sm" style="margin-top:0">${gr.length} grupta birbirine çok benzeyen fotoğraflar bulundu. Her grupta en iyisi <b>Tut</b> olarak işaretlendi; diğerleri silinecek. Bir fotoğrafa dokunarak seçimi değiştirebilirsin.</p>
      ${gr.map(g => `<div class="g-bz-grup">${g.map(o => `<button class="g-bz-k ${BZ.sil.has(o.id) ? 'sil' : 'tut'}" data-action="g-benz-sec" data-id="${esc(o.id)}"><img data-id="${esc(o.id)}" alt="" src="${kucukUrl(o) || ''}"><b>${BZ.sil.has(o.id) ? 'Sil' : 'Tut'}</b><small>${o.w ? o.w + '×' + o.h : ''} · ${bayt(o.boyut)}</small></button>`).join('')}</div>`).join('')}
      <div class="sticky-actions"><button type="button" class="btn" data-action="g-benz-kapat">Vazgeç</button><button type="button" class="btn tehlike" data-action="g-benz-uygula" ${n ? '' : 'disabled'}>${n} fotoğrafı Silinenler'e taşı</button></div>`
      : `<div class="g-bos" style="padding:20px 0"><p>Benzer fotoğraf bulunamadı. Galerin temiz görünüyor.</p></div><div class="sticky-actions"><button type="button" class="btn primary" data-action="g-benz-kapat">Tamam</button></div>`}</div></div></div>`;
}

/* ═════════ Yedek klasörü, hatırlatma ═════════ */
const KV = (() => {
  const ac = () => new Promise((res, rej) => { const r = indexedDB.open('suha-galeri-yedek', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const is = async (mod, f) => { const d = await ac(); return new Promise((res, rej) => { const t = d.transaction('kv', mod), s = t.objectStore('kv'), r = f(s); t.oncomplete = () => { d.close(); res(r.result); }; t.onerror = () => { d.close(); rej(t.error); }; }); };
  return { al: k => is('readonly', s => s.get(k)), yaz: (k, v) => is('readwrite', s => s.put(v, k)), sil: k => is('readwrite', s => s.delete(k)) };
})();
const KLASOR_DESTEK = typeof window.showDirectoryPicker === 'function';
async function klasorIzni(h, iste) {
  const o = { mode: 'readwrite' };
  if ((await h.queryPermission?.(o)) === 'granted') return true;
  return iste ? (await h.requestPermission?.(o)) === 'granted' : false;
}
let klasorMesgul = false;
async function klasorYedekle(izinIste) {
  if (klasorMesgul || !KLASOR_DESTEK) return;
  const h = await KV.al('klasor').catch(() => null); if (!h) return;
  if (!(await klasorIzni(h, izinIste))) { if (!izinIste) toast('Yedek klasörü için izin gerekiyor', [['İzin ver', () => klasorYedekle(true)]]); return; }
  klasorMesgul = true; const bar = ilerleme(0, 1);
  try {
    const kayit = (await KV.al('kaydedilen').catch(() => null)) || {}, kul = new Set(Object.values(kayit).map(x => x.toLowerCase()));
    const l = G.ogeler.filter(o => gorunur(o) && !kayit[o.id]); let n = 0;
    for (let i = 0; i < l.length; i++) {
      const o = l[i]; bar(i, l.length, o.ad); const rec = await DB.al('dosya', o.id); if (!rec?.blob) continue;
      let ad = (o.ad || o.id).replace(/[\\/:*?"<>|]/g, '_') || o.id, k = 1;
      while (kul.has(ad.toLowerCase())) ad = ad.replace(/(\.[^.]*)?$/, `-${++k}$1`);
      const fh = await h.getFileHandle(ad, { create: true }), w = await fh.createWritable(); await w.write(rec.blob); await w.close();
      kul.add(ad.toLowerCase()); kayit[o.id] = ad; n++;
      if (n % 10 === 0) await KV.yaz('kaydedilen', kayit);
    }
    await KV.yaz('kaydedilen', kayit);
    const bilgi = { surum: 1, tarih: Date.now(), albumler: G.albumler.filter(a => !a.kilit).map(a => ({ id: a.id, ad: a.ad })), ogeler: G.ogeler.filter(o => gorunur(o) && kayit[o.id]).map(o => ({ dosya: kayit[o.id], ad: o.ad, tarih: o.tarih, konum: o.konum, album: o.album && !alb(o.album)?.kilit ? (alb(o.album)?.ad || '') : '', fav: o.fav, not: o.not || '', etk: o.etk || [] })) };
    const bh = await h.getFileHandle('galeri-bilgi.json', { create: true }), bw = await bh.createWritable(); await bw.write(JSON.stringify(bilgi, null, 1)); await bw.close();
    await KV.yaz('son', Date.now()); store.set('gSonYedek', Date.now());
    if (n) toast(`${n} öğe yedek klasörüne yazıldı`);
  } catch (e) { toast('Klasöre yedeklenemedi: ' + (e?.message || e)); } finally { klasorMesgul = false; bar(null); }
}
async function ayarEkle() {
  const hedef = [...document.querySelectorAll('.g-ayar section')].find(s => s.querySelector('[data-action="g-hepsini-sil"]')); if (!hedef) return;
  const h = KLASOR_DESTEK ? await KV.al('klasor').catch(() => null) : null, son = store.get('gSonYedek', 0), gun = +store.get('gHat', 14);
  const sec = document.createElement('section');
  sec.innerHTML = `<h4>Otomatik yedek</h4>
    ${KLASOR_DESTEK ? `<p class="muted sm">Bir klasör seç; yeni fotoğraflar her açılışta ve eklemeden sonra otomatik olarak oraya kopyalanır (kilitli albümler hariç, çünkü klasördeki dosyalar şifresizdir). Klasörü sadece sana ait bir yerde tut.</p>
      <div class="g-satir">${h ? `<span class="muted sm" style="align-self:center">${IC.klasor} ${esc(h.name)}</span><button class="btn" data-action="g-kl-simdi">Şimdi yedekle</button><button class="btn" data-action="g-kl-sec">Değiştir</button><button class="btn tehlike" data-action="g-kl-kaldir">Kapat</button>` : `<button class="btn" data-action="g-kl-sec">${IC.klasor} Yedek klasörü seç</button>`}</div>`
      : `<p class="muted sm">Bu tarayıcı klasöre otomatik yedeği desteklemiyor (telefonlarda genelde böyle). Aşağıdaki hatırlatma ve ZIP yedeği kullanılabilir.</p>`}
    <label class="nask-l" style="margin-top:12px">Yedek hatırlatması<select id="gHat"><option value="0">Kapalı</option>${[7, 14, 30].map(n => `<option value="${n}" ${gun === n ? 'selected' : ''}>${n} günde bir</option>`).join('')}</select></label>
    <p class="g-ipucu">Son yedek: ${son ? new Date(son).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'henüz yok'}</p>`;
  hedef.before(sec);
  const sec2 = document.createElement('section');
  sec2.innerHTML = `<h4>Şifreli paket</h4><p class="muted sm">Bir albümü parolalı paket olarak başkasına gönderebilir, aldığın paketi buradan açabilirsin. Paketin içeriğini parola olmadan kimse göremez. Albüm menüsünden "Şifreli paket olarak paylaş" ile oluşturulur.</p><div class="g-satir"><button class="btn" data-action="g-yedek-yukle">${IC.yukle2 || IC.plus} Paket ya da yedek aç</button></div>`;
  hedef.before(sec2);
  $('#gHat').onchange = e => { store.set('gHat', +e.target.value); };
}
function hatirlat() {
  const gun = +store.get('gHat', 14); if (!gun) return;
  const adet = G.ogeler.filter(gorunur).length; if (adet < 5) return;
  let ilk = store.get('gIlk', 0); if (!ilk) { ilk = Date.now(); store.set('gIlk', ilk); }
  const son = store.get('gSonYedek', 0) || ilk, ert = store.get('gHatErt', 0);
  if (Date.now() < ert || Date.now() - son < gun * 864e5) return;
  const g = Math.floor((Date.now() - son) / 864e5);
  toast(`Yedek zamanı: ${store.get('gSonYedek', 0) ? 'son yedek ' + g + ' gün önce' : adet + ' öğen var, hiç yedek almadın'}`, [['Yedek al', () => yedekAl()], ['Sonra', () => store.set('gHatErt', Date.now() + 3 * 864e5)]]);
}

/* ═════════ Albüm paylaşımı: ZIP ve şifreli paket ═════════ */
const PAKET = 'SUHAGP1\0';
async function albumPaylas(a, tur) {
  const l = liste('album', a.id); if (!l.length) return toast('Albüm boş');
  if (l.reduce((t, o) => t + (o.boyut || 0), 0) > 700 * 1048576) return toast('Albüm paylaşım için çok büyük (700 MB üstü). Albümü indirmeyi dene.');
  let key = null, tuz = null;
  if (tur === 'paket') {
    const pw = await parolaSor('Paket parolası', true, '<br>Bu parolayı paketi alacak kişiye <b>ayrı bir yoldan</b> (yüz yüze, telefonla) ilet.'); if (pw == null) return;
    tuz = crypto.getRandomValues(new Uint8Array(16)); key = await GE.anahtarTuret(pw, tuz);
  }
  const bar = ilerleme(0, l.length);
  try {
    const dosyalar = [], meta = { surum: 1, tarih: Date.now(), albumler: [{ id: a.id, ad: a.ad, olusturma: a.olusturma }], ogeler: [] };
    for (let i = 0; i < l.length; i++) {
      bar(i, l.length, l[i].ad); const p = await oku(l[i]);
      meta.ogeler.push({ id: p.id, ad: p.ad, tur: p.tur, tip: p.tip, boyut: p.boyut, tarih: p.tarih, eklenme: p.eklenme, konum: p.konum, album: a.id, fav: p.fav, not: p.not || '', etk: p.etk || [] });
      dosyalar.push({ ad: `dosyalar/${p.id}`, blob: await konumsuz(p) });
    }
    dosyalar.unshift({ ad: 'galeri.json', blob: new Blob([JSON.stringify(meta)], { type: 'application/json' }) });
    let zip = await GE.zipYaz(dosyalar), ad = `${a.ad} ${bugun()}.zip`, tip = 'application/zip';
    if (tur === 'paket') { zip = new Blob([PAKET, tuz, await GE.sifrele(key, await zip.arrayBuffer())], { type: 'application/octet-stream' }); ad = `${a.ad} ${bugun()}.galeripaket`; tip = 'application/octet-stream'; }
    const f = new File([zip], ad.replace(/[\\/:*?"<>|]/g, '_'), { type: tip });
    if (navigator.canShare?.({ files: [f] })) { try { await navigator.share({ files: [f] }); } catch (e) { if (e?.name !== 'AbortError') dosyayaYaz(f, f.name); } }
    else dosyayaYaz(f, f.name);
    if (tur === 'paket') toast('Paket hazır. Parolayı ayrıca ilet; kaybedersen paket açılamaz.');
  } catch (e) { toast('Paket hazırlanamadı: ' + e.message); } finally { bar(null); }
}
{
  const _yy = yedekYukle;
  yedekYukle = async function (file) {
    let ba = ''; try { ba = await file.slice(0, 8).text(); } catch { /* */ }
    if (ba !== PAKET) return _yy(file);
    for (let d = 0; d < 5; d++) {
      const pw = await parolaSor('Paket parolası', false, d ? '<span class="g-hata">Parola yanlış, tekrar dene.</span>' : ''); if (pw == null) return;
      try {
        const buf = await file.arrayBuffer(), key = await GE.anahtarTuret(pw, new Uint8Array(buf, 8, 16));
        const zip = await GE.coz(key, buf.slice(24)); return _yy(new File([zip], 'paket.zip', { type: 'application/zip' }));
      } catch { /* yanlış parola */ }
    }
    toast('Çok fazla yanlış deneme');
  };
}

/* ═════════ Başlangıç bağları ═════════ */
{
  const _ekle = ekle;
  ekle = async function (...a) { const r = await _ekle(...a); klasorYedekle(false).catch(() => {}); return r; };
  const _ciz = ciz; let basladi = false;
  ciz = function () { _ciz(); if (!basladi && G.ogeler.length) { basladi = true; setTimeout(() => { klasorYedekle(false).catch(() => {}); hatirlat(); }, 2500); } };
}
document.addEventListener('keydown', e => { const d = $('#gDuz'); if (!d || d.hidden) return; e.stopImmediatePropagation(); if (e.key === 'Escape') duzenKapat(); }, true);   // editör açıkken altındaki görüntüleyici tuşları görmesin

Object.assign(ACTIONS, {
  'g-etk': el => { const t = el.dataset.t; G.q = G.q.trim().toLocaleLowerCase('tr') === t ? '' : t; const i = $('#gAraIn'); if (i) i.value = G.q; ciz(); },
  'g-v-not': async () => { const o = oge(V.liste[V.i]); if (!o) return; if (await notDuzenle([o])) { bilgiCiz(o); etiketChips(); } },
  'g-s-etiket': async () => { const l = seciliOgeler(); if (!l.length) return; if (await notDuzenle(l)) { G.sec = false; G.secili = new Set(); ciz(); toast('Etiketler eklendi'); } },
  'g-duz-kapat': () => duzenKapat(),
  'g-duz-sifirla': () => { Object.assign(E, { rot: 0, ayna: false, oran: 'orj', zoom: 1, cx: .5, cy: .5, b: 0, k: 0, s: 0, w: 0, filtre: 'orj', degisti: false }); duzenPanel(); duzenYenile(); },
  'g-duz-sek': el => { E.sekme = el.dataset.k; duzenPanel(); },
  'g-duz-oran': el => { E.oran = el.dataset.k; E.cx = E.cy = .5; E.degisti = true; duzenPanel(); duzenYenile(); },
  'g-duz-don': el => { E.rot = (E.rot + +el.dataset.d + 4) % 4; E.cx = E.cy = .5; E.degisti = true; duzenYenile(); },
  'g-duz-ayna': el => { E.ayna = !E.ayna; E.degisti = true; el.classList.toggle('on', E.ayna); duzenYenile(); },
  'g-duz-filtre': el => { E.filtre = el.dataset.k; E.degisti = true; document.querySelectorAll('.g-duz-filtre button').forEach(b => b.classList.toggle('on', b === el)); duzenYenile(); },
  'g-duz-kaydet': el => duzenKaydet(el.dataset.m),
  'g-benzer': () => benzerAc(),
  'g-benz-kapat': () => { closeModal(); BZ = null; },
  'g-benz-sec': el => {
    const id = el.dataset.id, g = BZ.gr.find(x => x.some(o => o.id === id)); if (!g) return;
    if (BZ.sil.has(id)) BZ.sil.delete(id); else { if (g.filter(o => !BZ.sil.has(o.id)).length <= 1) return toast('Her grupta en az bir fotoğraf kalmalı'); BZ.sil.add(id); }
    const sc = $('.g-benz .set-body')?.scrollTop || 0; benzerCiz(); const b = $('.g-benz .set-body'); if (b) b.scrollTop = sc;
  },
  'g-benz-uygula': async () => { const l = BZ.gr.flat().filter(o => BZ.sil.has(o.id)); closeModal(); BZ = null; if (l.length) { await sil(l); ciz(); } },
  'g-kl-sec': async () => {
    try { const h = await window.showDirectoryPicker({ mode: 'readwrite', id: 'galeri-yedek' }); await KV.yaz('klasor', h); await KV.yaz('kaydedilen', {}); closeModal(); toast('Yedek klasörü seçildi: ' + h.name); klasorYedekle(true); }
    catch (e) { if (e?.name !== 'AbortError') toast('Klasör seçilemedi: ' + e.message); }
  },
  'g-kl-simdi': () => { closeModal(); klasorYedekle(true); },
  'g-kl-kaldir': async () => { await KV.sil('klasor'); await KV.sil('kaydedilen'); closeModal(); toast('Otomatik yedek kapatıldı (klasördeki dosyalar silinmedi)'); }
});
