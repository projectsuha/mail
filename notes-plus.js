/* ───────────── Notlar · ek özellikler (19 Ekim 2026) ─────────────
   Kilitli notlar, nota bağlananlar, toplu seçim, tüm yapılacaklar, Markdown dışa aktarma.
   notes-app.js'ten sonra yüklenir. */
'use strict';

Object.assign(IC, {
  lockI: svg('<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/><circle cx="12" cy="15.2" r="1.1" fill="currentColor"/>'),
  checkSq: svg('<rect x="4" y="4" width="16" height="16" rx="3.5"/><path d="m8.5 12 2.5 2.5 4.5-5"/>')
});

/* ───────── Kilitli notlar ─────────
   Parola → PBKDF2-SHA256 (250 bin tur) → AES-256-GCM. Her kayıtta yeni tuz ve yeni IV.
   Gmail'e yalnızca şifreli metin gider ("suha-enc:v1.tuz.iv.şifreli"); başlık "Kilitli not" olur.
   Parola hiçbir yere kaydedilmez; unutulursa not kurtarılamaz. */
const NLK = { pw: null, idle: 0, hide: 0 };
const nlB64 = bytes => { let s = ''; for (const b of bytes) s += String.fromCharCode(b); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const nlUnB64 = t => { t = t.replace(/-/g, '+').replace(/_/g, '/'); while (t.length % 4) t += '='; return Uint8Array.from(atob(t), c => c.charCodeAt(0)); };
async function nlKey(pw, salt) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw.normalize('NFKC')), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function nlEncrypt(title, html, pw) {
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await nlKey(pw, salt), new TextEncoder().encode(JSON.stringify({ t: title || '', h: html || '' }))));
  return `v1.${nlB64(salt)}.${nlB64(iv)}.${nlB64(ct)}`;
}
async function nlDecrypt(enc, pw) {
  const [v, s, i, c] = String(enc).split('.');
  if (v !== 'v1' || !s || !i || !c) throw new Error('bozuk');
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: nlUnB64(i) }, await nlKey(pw, nlUnB64(s)), nlUnB64(c));
  const o = JSON.parse(new TextDecoder().decode(pt));
  return { title: String(o.t || ''), html: sanitizeNoteHtml(String(o.h || '')) };
}
function nlTouch() {
  clearTimeout(NLK.idle);
  if (N.cur?.locked || NLK.pw) NLK.idle = setTimeout(nlRelock, 5 * 60e3);   // 5 dakika işlem yapılmazsa kilitle
}
['pointerdown', 'keydown', 'input'].forEach(t => document.addEventListener(t, () => { if ($('.notes-shell')) nlTouch(); }, true));
document.addEventListener('visibilitychange', () => {
  clearTimeout(NLK.hide);
  if (document.visibilityState === 'hidden') NLK.hide = setTimeout(nlRelock, 60e3);   // uygulama 1 dakika arka planda kalırsa kilitle
});
async function nlRelock() {
  clearTimeout(NLK.idle); NLK.pw = null;
  const n = N.cur;
  if (!n?.locked) return;
  if (n.dirty && n.lockPw) await nSave(n);
  n.lockPw = null; n.html = null;
  nlScreen();
}
function nlOpenLocked(full) {
  const n = N.cur;
  Object.assign(n, { locked: true, enc: full.enc, color: full.color || n.color, created: full.created || '', html: null, lockPw: null });
  if (n.trashed) { n.html = '<div>🔒 Bu kilitli bir nottu; içeriği yalnızca geri getirip parolayla açabilirsin.</div>'; n.title = 'Kilitli not'; return nRenderEditor(); }
  if (NLK.pw) return nlTry(NLK.pw, true);
  nlScreen();
}
async function nlTry(pw, silent) {
  const n = N.cur; if (!n?.enc) return;
  try {
    const o = await nlDecrypt(n.enc, pw);
    n.title = o.title; n.html = o.html; n.lockPw = pw; NLK.pw = pw; nlTouch();
    nRenderEditor();
  } catch {
    if (silent) { NLK.pw = null; return nlScreen(); }
    const e = $('#nlErr'); if (e) { e.textContent = 'Parola yanlış'; e.closest('.nlock-box')?.classList.remove('shake'); void e.offsetWidth; e.closest('.nlock-box')?.classList.add('shake'); }
    const i = $('#nlPw'); if (i) { i.value = ''; i.focus(); }
  }
}
function nlScreen() {
  const r = $('#reader'), n = N.cur; if (!r || !n) return;
  r.innerHTML = `<div class="reader-bar note-bar"><button class="icon-btn back" data-action="back" aria-label="Geri">${IC.back}</button><div class="spacer"></div></div>
    <div class="reader-scroll nlock-wrap"><form class="nlock-box" id="nlForm" autocomplete="off">
      <div class="nlock-ico">${IC.lockI}</div><h2>Bu not kilitli</h2><p>Açmak için kilit parolanı yaz.</p>
      <input id="nlPw" type="password" placeholder="Parola" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Parola">
      <div class="nlock-err" id="nlErr" role="alert"></div>
      <button class="btn primary" type="submit">Aç</button>
    </form></div>`;
  $('#nlForm').addEventListener('submit', async e => { e.preventDefault(); const b = e.submitter; b.disabled = true; await nlTry($('#nlPw').value); b.disabled = false; });
  setTimeout(() => $('#nlPw')?.focus(), 60);
}
function nlAskPw(title, confirm, extra = '') {
  return new Promise(res => {
    $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-ask="x">${IC.close}</button><h3>${esc(title)}</h3></header>
      <form class="set-body" id="nlAsk" autocomplete="off">
        <label class="nask-l">Kilit parolası<input id="nlP1" type="password" autocomplete="new-password" minlength="6" required></label>
        ${confirm ? '<label class="nask-l">Parolayı tekrar yaz<input id="nlP2" type="password" autocomplete="new-password" minlength="6" required></label>' : ''}
        <p class="nlock-hint">En az 6 karakter; uzun bir cümle en iyisidir. <b>Parolayı unutursan not kurtarılamaz</b> — bizde bir kopyası yoktur.${extra}</p>
        <div class="nlock-err" id="nlE2" role="alert"></div>
        <div class="sticky-actions"><button type="button" class="btn" data-ask="x">Vazgeç</button><button class="btn primary">Tamam</button></div>
      </form></div></div>`;
    const done = v => { closeModal(); res(v); };
    $('#nlAsk').addEventListener('submit', e => {
      e.preventDefault();
      const a = $('#nlP1').value;
      if (a.length < 6) return ($('#nlE2').textContent = 'Parola en az 6 karakter olmalı');
      if (confirm && a !== $('#nlP2').value) return ($('#nlE2').textContent = 'İki parola aynı değil');
      done(a);
    });
    $('#modal').querySelectorAll('[data-ask="x"]').forEach(b => b.onclick = () => done(null));
    setTimeout(() => $('#nlP1')?.focus(), 50);
  });
}
async function nlLockNote() {
  const n = N.cur; if (!n || n.locked) return;
  const warn = realId(n.id) ? '<br><br>Notun kilitlemeden önceki sürümleri Gmail\'de <b>Silinenler</b>\'de 30 gün kalır; hemen yok etmek için Gmail\'de çöp kutusunu boşalt.' : '';
  const pw = await nlAskPw('Notu kilitle', true, warn);
  if (!pw) return;
  n.locked = true; n.lockPw = pw; NLK.pw = pw; n.dirty = true; clearTimeout(n.timer);
  await nSave(n);
  if (N.cur === n) nRenderEditor();
  nlTouch(); toast('Not kilitlendi');
}
async function nlUnlockNote() {
  const n = N.cur; if (!n?.locked) return;
  const ok = await new Promise(res => {
    $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-ask="x">${IC.close}</button><h3>Kilidi kaldır</h3></header>
      <div class="set-body"><p class="nlock-hint" style="margin-top:0">Not şifresiz, normal bir not olarak saklanacak; iPhone ve Mac'teki Notlar'da da okunur.</p>
      <div class="sticky-actions"><button type="button" class="btn" data-ask="x">Vazgeç</button><button type="button" class="btn primary" data-ask="ok">Kilidi kaldır</button></div></div></div></div>`;
    $('#modal').querySelectorAll('[data-ask]').forEach(b => b.onclick = () => { closeModal(); res(b.dataset.ask === 'ok'); });
  });
  if (!ok) return;
  n.locked = false; n.enc = ''; n.lockPw = null; n.dirty = true; clearTimeout(n.timer);
  await nSave(n);
  if (N.cur === n) nRenderEditor();
  toast('Kilit kaldırıldı');
}

// Eski (düz metin) sürümün bu cihazdaki kopyasını sil; liste önbelleğini yenile
function nlForget(oldId) {
  try {
    const b = store.get('nBodies', {}); if (b[oldId]) { delete b[oldId]; store.set('nBodies', b); }
    if (N.cur?.locked || N.all.some(x => x.locked)) store.set('nCache', { folders: N.folders, all: N.all.slice(0, 600), at: Date.now() });
  } catch {}
}

/* ───────── Bu nota bağlananlar ───────── */
function nlBack(n) {
  const el = $('#nBack'); if (!el || !n?.uuid) return;
  const from = N.all.filter(x => x.uuid !== n.uuid && (x.links || []).includes(n.uuid));
  el.hidden = !from.length;
  el.innerHTML = from.length ? `<div class="nback-t">${IC.linkI}Bu nota bağlananlar</div>` + from.map(x => `<button type="button" class="nchip" data-action="n-open-uuid" data-u="${esc(x.uuid)}">${IC.notepad}${esc(x.title || 'Not')}</button>`).join('') : '';
}

/* ───────── Birkaç notu birden seçme ───────── */
function nlToggleSel(id) {
  if (N.sel.has(id)) N.sel.delete(id); else N.sel.add(id);
  nRenderList();
}
function nlSelMode(on) {
  N.selMode = on; N.sel = new Set();
  $('.notes-shell')?.classList.toggle('selmode', on);
  nRenderList();
}
function nlBulkBar() {
  let bar = $('#nBulk');
  if (!N.selMode) { bar?.remove(); return; }
  const pane = $('.listpane'); if (!pane) return;
  if (!bar) { bar = document.createElement('div'); bar.id = 'nBulk'; bar.className = 'nbulk'; pane.appendChild(bar); }
  const k = N.sel.size, d = k ? '' : 'disabled';
  bar.innerHTML = `<span class="nbulk-n">${k ? k + ' not seçili' : 'Not seç'}</span>
    <button type="button" class="icon-btn" data-action="n-bulk-all" title="Hepsini seç">${IC.checkSq}</button>
    <button type="button" class="icon-btn" data-action="n-bulk-pin" title="Sabitle / kaldır" ${d}>${IC.pinI}</button>
    <button type="button" class="icon-btn" data-action="n-bulk-color" title="Renk" ${d}>${IC.palette}</button>
    <button type="button" class="icon-btn" data-action="n-bulk-move" title="Klasöre taşı" ${d}>${IC.folder}</button>
    <button type="button" class="icon-btn danger" data-action="n-bulk-del" title="Sil" ${d}>${IC.trash}</button>
    <button type="button" class="btn sm" data-action="n-select">Bitti</button>`;
}
const nlPicked = () => N.all.filter(n => N.sel.has(n.id) && realId(n.id));
async function nlBulk(fn, okMsg) {
  const list = nlPicked();
  if (!list.length) return toast('Önce not seç (bekleyen çevrimdışı notlar hariç)');
  try { await fn(list); } catch (e) { if (!(e instanceof AuthError)) return toast('Yapılamadı: ' + e.message); return; }
  nRenderFolders(); nlSelMode(false); const m = okMsg(list.length); if (m) toast(m);
}
// Rengi değiştirmek için notun yeni sürümü yazılır (Gmail'de bir mesaj yerinde değişmez)
async function nlResave(meta, patch) {
  const full = await NDB.get(meta.id);
  const n = { ...meta, ...patch, html: full.html, enc: full.enc, locked: !!full.enc, created: full.created || '', title: full.enc ? '' : meta.title };
  if (n.locked) n.html = '';
  else n.title = full.title || meta.title;
  const { raw, title, tags, links } = nBuildRaw(n);
  const res = await NDB.insert(raw, meta.labelIds.filter(x => x !== 'TRASH'));
  await NDB.trash(meta.id).catch(() => {});
  const i = N.all.findIndex(x => x.id === meta.id);
  Object.assign(meta, { ...patch, id: res.id, title, tags, links, date: Date.now() });
  if (i >= 0) N.all[i] = meta;
}
Object.assign(ACTIONS, {
  'n-select': () => nlSelMode(!N.selMode),
  'n-bulk-all': () => { const v = nVisible().filter(n => realId(n.id)); N.sel = N.sel.size === v.length ? new Set() : new Set(v.map(n => n.id)); nRenderList(); },
  'n-bulk-del': () => nlBulk(async list => {
    for (const n of list) { await NDB.trash(n.id); N.all = N.all.filter(x => x.id !== n.id); }
    N.trash = null;
    toast(`${list.length} not silindi`, [['Geri al', async () => { for (const n of list) await NDB.untrash(n.id).catch(() => {}); nLoad(); }]]);
  }, () => ''),
  'n-bulk-pin': () => nlBulk(async list => {
    const pin = list.some(n => !n.pinned);
    for (const n of list) { await NDB.modify(n.id, pin ? ['STARRED'] : [], pin ? [] : ['STARRED']); n.pinned = pin; n.labelIds = pin ? [...new Set([...n.labelIds, 'STARRED'])] : n.labelIds.filter(x => x !== 'STARRED'); }
  }, k => `${k} not güncellendi`),
  'n-bulk-move': el => nPop(el, `<div class="ctx-title">Klasöre taşı</div>${[N.root, ...subFolders()].filter(Boolean).map(f => nItem(f.id, f.root ? IC.notepad : IC.folder, esc(folderName(f)))).join('')}`, v => nlBulk(async list => {
    for (const n of list) { const from = folderOf(n)?.id; if (from === v) continue; await NDB.modify(n.id, [v], from ? [from] : []); n.labelIds = [v, ...n.labelIds.filter(x => x !== from)]; }
  }, k => `${k} not taşındı`)),
  'n-bulk-color': el => nPop(el, `<div class="ctx-title">Not rengi</div><div class="ncolors">${NCOLORS.map(([k, name, c]) => `<button type="button" class="ncolor" data-v="${k || 'none'}" title="${name}" style="--c:${c || 'transparent'}">${k ? '' : IC.close}</button>`).join('')}</div>`, v => nlBulk(async list => {
    for (const n of list) await nlResave(n, { color: v === 'none' ? '' : v });
  }, k => `${k} notun rengi değişti`)),
  'n-open-uuid': el => nOpenUuid(el.dataset.u)
});

/* ───────── Tüm yapılacaklar ───────── */
async function nlTodosLoad() {
  N.todos = null; nRenderList();
  const pool = N.all.filter(n => realId(n.id) && !n.locked).sort((a, b) => b.date - a.date).slice(0, 80);
  const out = [];
  try {
    await pmap(pool, 6, async n => {
      const full = await NDB.get(n.id).catch(() => null); if (!full) return;
      const items = htmlToText(full.html).split('\n').map(l => l.trim()).filter(l => /^[☐☑]/.test(l)).map(l => ({ on: l[0] === '☑', t: l.slice(1).trim() })).filter(x => x.t);
      if (items.length) out.push({ n, items });
    });
  } catch (e) { if (!(e instanceof AuthError)) toast('Yapılacaklar yüklenemedi: ' + e.message); }
  out.sort((a, b) => b.n.date - a.n.date);
  N.todos = { groups: out, capped: N.all.filter(n => realId(n.id) && !n.locked).length > 80, done: !!N.todos?.done };
  if (N.view === 'todos') nRenderList();
}
function nlTodosRender(el) {
  if (!N.todos) { el.innerHTML = '<div class="list-msg">Notlardaki yapılacaklar toplanıyor…</div>'; return; }
  const gs = N.todos.groups.map(g => ({ ...g, open: g.items.filter(x => !x.on), done: g.items.filter(x => x.on) })).filter(g => g.open.length || N.todos.done && g.done.length);
  const open = gs.reduce((a, g) => a + g.open.length, 0);
  el.classList.remove('grid');
  el.innerHTML = `<div class="ntodo-top"><b>${open}</b> yapılacak <button type="button" class="nchip ${N.todos.done ? 'on' : ''}" data-action="n-todo-done">Tamamlananlar</button></div>`
    + (gs.map(g => `<div class="ntodo-g" data-action="n-open" data-id="${esc(g.n.id)}"><div class="ntodo-h">${IC.notepad}<span>${esc(g.n.title || 'Not')}</span><i>${g.open.length}</i></div>
      ${g.open.map(x => `<div class="ntodo-i"><span class="ntodo-b"></span>${esc(x.t)}</div>`).join('')}
      ${N.todos.done ? g.done.map(x => `<div class="ntodo-i done"><span class="ntodo-b on">${IC.check}</span>${esc(x.t)}</div>`).join('') : ''}</div>`).join('')
      || '<div class="list-msg">Açık yapılacak yok 🎉<br><small>Notlarda ☐ ile başlayan satırlar burada toplanır.</small></div>')
    + (N.todos.capped ? '<div class="ntrash-info">En son düzenlenen 80 notun yapılacakları gösteriliyor.</div>' : '');
}
Object.assign(ACTIONS, { 'n-todo-done': () => { if (N.todos) { N.todos.done = !N.todos.done; nRenderList(); } } });

/* ───────── Markdown dışa aktarma ───────── */
function nlMd(html) {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  const inl = n => [...n.childNodes].map(c => walk(c, 0)).join('');
  const walk = (n, depth) => {
    if (n.nodeType === 3) return n.nodeValue.replace(/ /g, ' ');
    if (n.nodeType !== 1) return '';
    const t = n.tagName.toLowerCase(), kids = () => [...n.childNodes].map(c => walk(c, depth)).join('');
    if (/^h[1-6]$/.test(t)) return `\n\n${'#'.repeat(+t[1])} ${inl(n).trim()}\n\n`;
    if (t === 'b' || t === 'strong') return `**${kids()}**`;
    if (t === 'i' || t === 'em') return `*${kids()}*`;
    if (t === 's' || t === 'strike' || t === 'del') return `~~${kids()}~~`;
    if (t === 'br') return '\n';
    if (t === 'a') { const h = n.getAttribute('href') || '', x = kids(); return h.startsWith('#not:') ? `[[${x}]]` : h ? `[${x}](${h})` : x; }
    if (t === 'img') return n.getAttribute('src')?.startsWith('data:') ? '\n\n(görsel)\n\n' : `![](${n.getAttribute('src') || ''})`;
    if (t === 'ul' || t === 'ol') {
      let i = 0;
      return '\n' + [...n.children].filter(c => c.tagName === 'LI').map(li => `${'  '.repeat(depth)}${t === 'ol' ? ++i + '.' : '-'} ${[...li.childNodes].map(c => walk(c, depth + 1)).join('').trim()}`).join('\n') + '\n';
    }
    if (t === 'table') {
      const rows = [...n.querySelectorAll('tr')].map(r => [...r.children].map(c => inl(c).replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim()));
      if (!rows.length) return '';
      const w = Math.max(...rows.map(r => r.length)), pad = r => r.concat(Array(w - r.length).fill(''));
      return '\n\n' + [pad(rows[0]), Array(w).fill('---'), ...rows.slice(1).map(pad)].map(r => `| ${r.join(' | ')} |`).join('\n') + '\n\n';
    }
    if (t === 'div' || t === 'p' || t === 'blockquote') return `\n${t === 'blockquote' ? '> ' : ''}${kids()}\n`;
    return kids();
  };
  return walk(doc.body, 0).replace(/^[ \t]*☐ ?/gm, '- [ ] ').replace(/^[ \t]*☑ ?/gm, '- [x] ').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}
function nlExportMd(n) {
  const text = `${n.title ? '# ' + n.title + '\n\n' : ''}${nlMd(n.html)}`;
  const name = ((n.title || 'not').replace(/[\\/:*?"<>|]+/g, ' ').trim().slice(0, 60) || 'not') + '.md';
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
  a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  toast('Markdown dosyası indirildi');
}
