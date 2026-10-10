/* ───────────── Ekler ─────────────
   1) Mail yazarken dosya ekleme (düğme, sürükle-bırak, yapıştır); iletirken orijinal ekler de gider.
   2) Eki indirmeden Mail içinde önizleme: PDF, resim, Word, Excel, metin.
   3) Drive'a kaydet: ek, kullanıcının Drive'ındaki "Mail ekleri" klasörüne kaydedilir (drive.file izniyle).
   4) Tümünü indir: bir postadaki bütün ekler tek zip dosyası olarak iner. */
'use strict';

const ATT_MAX = 25 * 1024 * 1024;   // Gmail'in ek sınırı
const DRIVE_FOLDER = 'Mail ekleri';
let FV = null, fvUrl = null;   // açık önizleme: { m, a }

const IMG_EXT = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'avif'];
function sniffImage(b) {
  const h = (i, ...v) => v.every((x, j) => b[i + j] === x);
  if (h(0, 0x89, 0x50, 0x4e, 0x47)) return 'image/png';
  if (h(0, 0xff, 0xd8, 0xff)) return 'image/jpeg';
  if (h(0, 0x47, 0x49, 0x46, 0x38)) return 'image/gif';
  if (h(0, 0x52, 0x49, 0x46, 0x46) && h(8, 0x57, 0x45, 0x42, 0x50)) return 'image/webp';
  if (h(0, 0x42, 0x4d)) return 'image/bmp';
  if (h(4, 0x66, 0x74, 0x79, 0x70) && h(8, 0x61, 0x76, 0x69)) return 'image/avif';
  return '';
}
const TEXT_EXT = ['txt', 'csv', 'md', 'log', 'json', 'xml', 'ics', 'vcf'];
function fileKind(a) {
  const ext = pdfExt(a.filename || ''), mt = (a.mimeType || '').toLowerCase();
  if (ext === 'pdf' || mt === 'application/pdf') return 'pdf';
  if (IMG_EXT.includes(ext) || (/^image\//.test(mt) && !/heic|heif|tiff|svg/.test(mt))) return 'img';
  if (/^(docx|docm)$/.test(ext)) return 'docx';
  if (/^(xlsx|xlsm)$/.test(ext)) return 'xlsx';
  if (TEXT_EXT.includes(ext) || /^text\//.test(mt)) return 'text';
  return '';
}
const MIME_BY_EXT = { pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
  txt: 'text/plain', csv: 'text/csv', zip: 'application/zip', heic: 'image/heic', mp4: 'video/mp4', mp3: 'audio/mpeg' };
const mimeOf = f => f.type || PDF_MIME[pdfExt(f.name)] || MIME_BY_EXT[pdfExt(f.name)] || 'application/octet-stream';

async function attBytesOf(m, a) {
  if (!a.bytes) await loadAttBytes([Object.assign(a, { mid: a.mid || m.id })]);
  return a.bytes;
}
// İndirilen dosya her zaman "ham veri" türüyle verilir: gönderen bir eki "html" ya da "svg" diye işaretlese bile
// tarayıcı onu bu sitenin içinde açıp çalıştıramaz (iPhone'da indirme bazen yeni sekmede açılır)
function saveBlob(blob, name) {
  const url = URL.createObjectURL(new Blob([blob], { type: 'application/octet-stream' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

/* ── 1) Mail yazarken ekler ── */
function cmpAttInit(form, init) {
  init.atts = (init.atts || []).slice();
  cmpAttRender();
  const sheet = form;
  sheet.addEventListener('dragover', e => { if ([...e.dataTransfer.types].includes('Files')) { e.preventDefault(); sheet.classList.add('drop-on'); } });
  sheet.addEventListener('dragleave', e => { if (!sheet.contains(e.relatedTarget)) sheet.classList.remove('drop-on'); });
  sheet.addEventListener('drop', e => {
    if (!e.dataTransfer.files.length) return;
    e.preventDefault(); sheet.classList.remove('drop-on');
    cmpAttAdd(e.dataTransfer.files);
  });
  form.body.addEventListener('paste', e => { const fs = e.clipboardData?.files; if (fs?.length) { e.preventDefault(); cmpAttAdd(fs); } });
}
const cmpAtts = () => S.compose?.atts || [];
const cmpTotal = () => cmpAtts().reduce((n, a) => n + (a.size || a.bytes?.length || 0), 0);

async function cmpAttAdd(files) {
  const list = cmpAtts();
  for (const f of files) {
    if (cmpTotal() + f.size > ATT_MAX) { toast(`${f.name} eklenemedi: ekler toplamda 25 MB'ı geçemez`); continue; }
    list.push({ filename: f.name, mimeType: mimeOf(f), size: f.size, bytes: new Uint8Array(await f.arrayBuffer()) });
  }
  cmpAttRender();
}
function cmpAttRender() {
  const box = $('#cmpAtts'); if (!box) return;
  const list = cmpAtts();
  box.hidden = !list.length;
  box.innerHTML = list.map((a, i) => `<span class="cmp-att" title="${esc(a.filename)}">${IC.clip}<span>${esc(a.filename)}</span><small>${fmtSize(a.size || a.bytes?.length || 0)}</small>
    <button type="button" class="cmp-att-x" data-action="cmp-att-del" data-i="${i}" title="Eki çıkar">${IC.close}</button></span>`).join('') +
    (list.length > 1 ? `<span class="cmp-att-sum">${list.length} ek · ${fmtSize(cmpTotal())}</span>` : '');
}
function cmpAttCheck() {
  if (cmpTotal() > ATT_MAX) { toast('Ekler toplamda 25 MB\'ı geçemez. Büyük dosyayı Drive bağlantısı olarak paylaşabilirsin.'); return false; }
  return true;
}
function cmpAttPick() {
  const inp = Object.assign(document.createElement('input'), { type: 'file', multiple: true });
  inp.addEventListener('change', () => { if (inp.files.length) cmpAttAdd(inp.files); });
  inp.click();
}

/* ── 2) Önizleme ── */
async function fileOpen(m, a) {
  FV = { m, a };
  const kind = fileKind(a), office = typeof pdfKind === 'function' && pdfKind(a.filename);
  $('#modal').innerHTML = `
  <div class="modal-bg">
    <div class="sheet fv-sheet${kind ? ' wide' : ''}">
      <header class="sheet-head">
        <button type="button" class="icon-btn" data-action="fv-close">${IC.close}</button>
        <h3 class="fv-title">${esc(a.filename)}</h3>
        <small class="fv-size">${fmtSize(a.size || 0)}</small>
      </header>
      <div class="fv-body" id="fvBody">${kind ? '<div class="pdf-progress"><span class="spin"></span><span>Açılıyor…</span></div>' : fvNoPreview(a)}</div>
      <footer class="fv-actions">
        <button class="btn primary" data-action="fv-dl">${IC.check}İndir</button>
        <button class="btn" data-action="fv-drive">${IC.spark}Drive'a kaydet</button>
        ${office ? `<button class="btn" data-action="fv-pdf">${IC.file}PDF'e çevir</button>` : ''}
        <button class="btn" data-action="fv-fwd">${IC.forward}İlet</button>
      </footer>
    </div>
  </div>`;
  if (!kind) return;
  try {
    const bytes = await attBytesOf(m, a);
    if (FV?.a !== a) return;
    const box = $('#fvBody');
    if (fvUrl) URL.revokeObjectURL(fvUrl);
    if (kind === 'pdf') {
      fvUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
      const touch = navigator.pdfViewerEnabled === false || /iPhone|iPad|Android/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      box.innerHTML = touch ? `<div class="fv-none"><span class="pdf-doc pdf">PDF</span><p>Telefonda PDF, cihazının kendi görüntüleyicisinde açılır.</p>
          <a class="btn primary" href="${fvUrl}" target="_blank" rel="noopener">${IC.file}PDF'i aç</a></div>`
        : `<iframe class="fv-frame" src="${fvUrl}#view=FitH" title="${esc(a.filename)}"></iframe>`;
    } else if (kind === 'img') {
      // Resim türü dosyanın kendi baytlarından anlaşılır (gönderenin yazdığına güvenilmez); SVG gibi kod içerebilenler gösterilmez
      const type = sniffImage(bytes);
      if (!type) { box.innerHTML = fvNoPreview(a); return; }
      fvUrl = URL.createObjectURL(new Blob([bytes], { type }));
      box.innerHTML = `<div class="fv-img"><img src="${fvUrl}" alt="${esc(a.filename)}"></div>`;
    } else if (kind === 'docx' || kind === 'xlsx') {
      const doc = await (kind === 'docx' ? docxToHtml : xlsxToHtml)(bytes);
      if (FV?.a !== a) return;
      box.innerHTML = `<div class="dx-wrap"><div class="dx-page${kind === 'xlsx' ? ' fit' : ''}" style="--pw:${doc.page.w}mm;--pm:${doc.page.ml}mm">${doc.html}</div></div>`;
      dxFit();
    } else if (kind === 'text') {
      let txt = new TextDecoder().decode(bytes.subarray(0, 400000));
      if (typeof fixMojibake === 'function') txt = fixMojibake(txt);
      box.innerHTML = `<pre class="fv-text">${esc(txt)}${bytes.length > 400000 ? '\n…' : ''}</pre>`;
    }
  } catch (e) {
    if (e instanceof AuthError) return;
    if (FV?.a === a) $('#fvBody').innerHTML = fvNoPreview(a, 'Önizleme açılamadı: ' + e.message);
  }
}
function fvNoPreview(a, why = 'Bu dosya türü burada gösterilemiyor. İndirip cihazındaki uygulamayla açabilirsin.') {
  const kind = typeof pdfKind === 'function' && pdfKind(a.filename);
  const ic = kind ? `<span class="pdf-doc ${kind}">${PDF_KINDS[kind].ic}</span>` : `<span class="pdf-doc other">${esc((pdfExt(a.filename) || '?').slice(0, 4).toUpperCase())}</span>`;
  return `<div class="fv-none">${ic}<p>${esc(why)}</p>${kind === 'slide' ? '<p class="muted">PowerPoint dosyasını görmek için “PDF\'e çevir”i kullanabilirsin.</p>' : ''}</div>`;
}
function fvClose() {
  FV = null; closeModal();
  if (fvUrl) { const u = fvUrl; fvUrl = null; setTimeout(() => URL.revokeObjectURL(u), 60000); }
}
async function fileDownload(m, a, el) {
  try {
    el?.classList.add('busy');
    saveBlob(new Blob([await attBytesOf(m, a)], { type: a.mimeType || 'application/octet-stream' }), a.filename);
  } catch (e) { if (!(e instanceof AuthError)) toast('Ek indirilemedi: ' + e.message); }
  el?.classList.remove('busy');
}

/* ── 3) Drive'a kaydet ── */
async function driveSaveFile(bytes, name, mime) {
  const tok = Auth.token() || (DESKTOP ? await Auth.desktopRefresh() : null);
  if (!tok) { Auth.reauth(); throw new AuthError('oturum'); }
  const H = { Authorization: 'Bearer ' + tok };
  const fail = async r => {
    if (r.status === 401) { Auth.reauth(); return new AuthError('oturum'); }
    let j = {}; try { j = await r.json(); } catch {}
    const reason = JSON.stringify(j);
    if (r.status === 403 && /insufficient|SCOPE/i.test(reason)) return Object.assign(new Error('izin yok'), { code: 'scope' });
    if (r.status === 403 && /accessNotConfigured|SERVICE_DISABLED|has not been used/i.test(reason)) return new Error('Google Drive API bu programın Google Cloud projesinde açık değil.');
    if (/storageQuotaExceeded/.test(reason)) return new Error('Drive\'ında yer kalmamış.');
    return new Error(j.error?.message || r.status);
  };
  // "Mail ekleri" klasörü: program kendi oluşturduğu klasörü bulabilir (drive.file izni yalnızca bunu görür)
  let folder = store.get('driveFolder');
  if (!folder) {
    const q = encodeURIComponent(`name='${DRIVE_FOLDER}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
    const r = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)&spaces=drive`, { headers: H });
    if (!r.ok) throw await fail(r);
    folder = (await r.json()).files?.[0]?.id;
    if (!folder) {
      const c = await fetch('https://www.googleapis.com/drive/v3/files?fields=id', { method: 'POST', headers: { ...H, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: DRIVE_FOLDER, mimeType: 'application/vnd.google-apps.folder' }) });
      if (!c.ok) throw await fail(c);
      folder = (await c.json()).id;
    }
    store.set('driveFolder', folder);
  }
  const up = async parents => {
    const b = 'sv' + Math.random().toString(36).slice(2);
    const meta = JSON.stringify({ name, ...(parents ? { parents } : {}) });
    return fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
      method: 'POST', headers: { ...H, 'Content-Type': 'multipart/related; boundary=' + b },
      body: new Blob([`--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${b}\r\nContent-Type: ${mime || 'application/octet-stream'}\r\n\r\n`, bytes, `\r\n--${b}--`]) });
  };
  let r = await up([folder]);
  if (r.status === 404) { store.del('driveFolder'); r = await up(null); }   // klasör silinmişse ana klasöre kaydet
  if (!r.ok) throw await fail(r);
  return r.json();
}

async function fileSave(m, a) {
  const job = { mid: m.id, attId: a.attachmentId, data: a.data, url: a.url, filename: a.filename, mimeType: a.mimeType, size: a.size };
  if (!driveOk()) return fileAskDrive(job);
  toast(`Drive'a kaydediliyor… ${a.filename}`, [], 60000);
  try {
    let res;
    if (DEMO) { await attBytesOf(m, a); await sleep(900); res = { webViewLink: 'https://drive.google.com/' }; }
    else res = await driveSaveFile(await attBytesOf(m, a), a.filename, a.mimeType || PDF_MIME[pdfExt(a.filename)]);
    res.webViewLink ? toast(`Drive'a kaydedildi: <b>${esc(DRIVE_FOLDER)}</b> klasörü`, [['Aç', () => window.open(res.webViewLink, '_blank', 'noopener')]], 6000) : toast(`Drive'a kaydedildi: ${DRIVE_FOLDER} klasörü`, [], 6000);
  } catch (e) {
    if (e.code === 'scope') { store.set('auth', { ...store.get('auth'), scope: (store.get('auth')?.scope || '').replace(DRIVE_SCOPE, '') }); return fileAskDrive(job); }
    if (!(e instanceof AuthError)) toast('Drive\'a kaydedilemedi: ' + e.message);
  }
}
// İzin yoksa önce ne olacağını anlatan küçük pencere; "İzin ver" Google'a götürür, dönünce kayıt kendiliğinden devam eder
function fileAskDrive(job) {
  if (DEMO) { pdfDemoDrive = true; toast('Demo: Google Drive izni verilmiş sayıldı'); const m = S.thread?.messages.find(x => x.id === job.mid); const a = m?.attachments.find(x => x.filename === job.filename); if (m && a) fileSave(m, a); return; }
  $('#modal').innerHTML = `
  <div class="modal-bg">
    <div class="sheet pdf-sheet">
      <header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Drive'a kaydet</h3></header>
      <div class="pdf-body">
        ${pdfFileRowFor(job)}
        <p class="fv-explain">Eki Google Drive'ına kaydetmek için Google bir kez izin soracak. Bu izinle program Drive'ında yalnızca kendi kaydettiği dosyaları görebilir; diğer dosyalarına erişemez.</p>
        <button class="btn primary" data-action="fv-drive-ok">${IC.spark}İzin ver ve kaydet</button>
      </div>
    </div>
  </div>`;
  FV = { job };
}
const pdfFileRowFor = job => { const prev = pdfJob; pdfJob = job; const h = pdfFileRow(job); pdfJob = prev; return h; };

async function fileDriveConsent(job) {
  const scopes = SCOPES + ' ' + DRIVE_SCOPE;
  if (DESKTOP) {
    try { keepDesktopToken(await window.mailDesktop.login(scopes, store.get('email') || '')); } catch { return toast('İzin verilmedi'); }
    closeModal();
    return driveOk() ? fileSaveResume(job) : toast('Google, Drive iznini vermedi');
  }
  store.set('pdfPending', { ...job, data: undefined, act: 'save', t: Date.now() });
  const state = 'pdf-' + rnd();
  store.set('oauthState', state);
  const p = new URLSearchParams({ client_id: CLIENT_ID, redirect_uri: Auth.redirectUri(), response_type: 'token id_token', scope: scopes, include_granted_scopes: 'true', state, nonce: Auth.nonce() });
  if (store.get('email')) p.set('login_hint', store.get('email'));
  location.href = 'https://accounts.google.com/o/oauth2/v2/auth?' + p;
}
// Google'dan dönünce (pdfconvert.js'deki pdfResume buraya yönlendirir)
async function fileSaveResume(p) {
  if (p.denied || !driveOk()) return toast('Drive izni verilmedi, ek kaydedilmedi');
  const a = { filename: p.filename, mimeType: p.mimeType, size: p.size, attachmentId: p.attId, url: p.url, mid: p.mid };
  fileSave({ id: p.mid }, a);
}

/* ── 4) Tümünü indir (zip) ── */
function filesAllBtn(m) {
  return `<button class="att att-all" data-action="att-all" data-mid="${m.id}" title="Bütün ekleri tek zip dosyası olarak indir">${IC.check}<span>Tümünü indir</span><small>${m.attachments.length} ek</small></button>`;
}
const CRC_T = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(u8) { let c = 0xffffffff; for (let i = 0; i < u8.length; i++) c = CRC_T[(c ^ u8[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
// Sıkıştırmasız zip (ekler çoğunlukla zaten sıkıştırılmış): her işletim sistemi açabilir, Türkçe adlar korunur
function makeZip(files) {
  const parts = [], central = [];
  let off = 0;
  const now = new Date(), dt = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xffff,
    dd = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xffff;
  const used = new Set();
  for (const f of files) {
    let name = f.name.replace(/[\\/:*?"<>|]/g, '_'), n = 2;
    while (used.has(name.toLowerCase())) name = f.name.replace(/(\.[^.]*)?$/, ` (${n++})$1`);
    used.add(name.toLowerCase());
    const nb = utf8(name), crc = crc32(f.bytes), size = f.bytes.length;
    const lh = new DataView(new ArrayBuffer(30));
    [[0, 0x04034b50, 4], [4, 20, 2], [6, 0x0800, 2], [8, 0, 2], [10, dt, 2], [12, dd, 2], [14, crc, 4], [18, size, 4], [22, size, 4], [26, nb.length, 2], [28, 0, 2]]
      .forEach(([o, v, l]) => l === 4 ? lh.setUint32(o, v, true) : lh.setUint16(o, v, true));
    parts.push(lh, nb, f.bytes);
    const ch = new DataView(new ArrayBuffer(46));
    [[0, 0x02014b50, 4], [4, 20, 2], [6, 20, 2], [8, 0x0800, 2], [10, 0, 2], [12, dt, 2], [14, dd, 2], [16, crc, 4], [20, size, 4], [24, size, 4], [28, nb.length, 2],
      [30, 0, 2], [32, 0, 2], [34, 0, 2], [36, 0, 2], [38, 0, 4], [42, off, 4]].forEach(([o, v, l]) => l === 4 ? ch.setUint32(o, v, true) : ch.setUint16(o, v, true));
    central.push(ch, nb);
    off += 30 + nb.length + size;
  }
  const csize = central.reduce((s, x) => s + x.byteLength, 0);
  const end = new DataView(new ArrayBuffer(22));
  [[0, 0x06054b50, 4], [4, 0, 2], [6, 0, 2], [8, files.length, 2], [10, files.length, 2], [12, csize, 4], [16, off, 4], [20, 0, 2]]
    .forEach(([o, v, l]) => l === 4 ? end.setUint32(o, v, true) : end.setUint16(o, v, true));
  return new Blob([...parts, ...central, end], { type: 'application/zip' });
}
async function filesAll(el) {
  const m = S.thread.messages.find(x => x.id === el.dataset.mid);
  el.classList.add('busy');
  try {
    const files = [];
    for (const a of m.attachments) files.push({ name: a.filename || 'ek', bytes: await attBytesOf(m, a) });
    const base = (m.subject || 'Ekler').replace(/[\\/:*?"<>|]/g, '').trim().slice(0, 60) || 'Ekler';
    saveBlob(makeZip(files), base + ' - ekler.zip');
  } catch (e) { if (!(e instanceof AuthError)) toast('Ekler indirilemedi: ' + e.message); }
  el.classList.remove('busy');
}

/* ── PDF sonucunu yanıta / iletiye eklemek için (pdfconvert.js çağırır) ── */
function pdfAttachTo(kind, blob, name) {
  const m = S.thread?.messages.find(x => x.id === pdfJob?.mid);
  if (!m) return toast('Posta bulunamadı');
  blob.arrayBuffer().then(buf => {
    const att = { filename: name, mimeType: 'application/pdf', size: blob.size, bytes: new Uint8Array(buf) };
    if (kind === 'reply') replyTo(m, { atts: [att] });
    else forward(m, { atts: [att] });
  });
}

Object.assign(ACTIONS, {
  att: el => { const m = S.thread.messages.find(x => x.id === el.dataset.mid); fileOpen(m, m.attachments[+el.dataset.ai]); },
  'att-all': el => filesAll(el),
  'fv-close': () => fvClose(),
  'fv-dl': el => FV && fileDownload(FV.m, FV.a, el),
  'fv-drive': () => FV && fileSave(FV.m, FV.a),
  'fv-drive-ok': () => FV?.job && fileDriveConsent(FV.job),
  'fv-pdf': () => { if (!FV) return; const { m, a } = FV; FV = null; pdfStart({ mid: m.id, attId: a.attachmentId, data: a.data, url: a.url, filename: a.filename, mimeType: a.mimeType, size: a.size, bytes: a.bytes }); },
  'fv-fwd': () => { if (!FV) return; const { m, a } = FV; fvClose(); forward(m, { atts: [{ filename: a.filename, mimeType: a.mimeType, size: a.size, mid: m.id, attachmentId: a.attachmentId, data: a.data, url: a.url, bytes: a.bytes }] }); },
  'cmp-attach': () => cmpAttPick(),
  'cmp-att-del': el => { cmpAtts().splice(+el.dataset.i, 1); cmpAttRender(); }
});
