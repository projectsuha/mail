/* ───────────── Notlar (ayrı uygulama) ─────────────
   Notlar Gmail'de, iPhone/Mac Notlar uygulamasının kullandığı biçimde durur:
   her not bir mesaj, "Notes" etiketi (klasörler "Notes/İş" gibi alt etiketler).
   Yani iPhone'daki Notlar (Gmail hesabı) ile aynı notlar ve aynı klasörler görünür.
   Gmail'de bir mesaj yerinde değiştirilemediği için kaydetmek = yeni sürümü ekle, eskisini çöpe taşı;
   çöpteki eski sürümler "Eski sürümler" ve "Silinenler" için kullanılır.
   Sadece bu programa ait bilgiler (renk) mesajın başlığında, sabitleme Gmail yıldızında tutulur. */
'use strict';

window.APP_NAME = 'Notlar';
window.APP_ICON = 'notlar-apple.png?v=8';
window.APP_LEAD = 'Gmail hesabında saklanan, iPhone ve Mac\'teki Notlar uygulamasıyla aynı notlar. Notların yalnızca senin cihazında görüntülenir; arada başka bir sunucu yoktur.';
window.AUTH_STATE_PREFIX = 'not-';           // Google dönüşü ana sayfaya gelir, ana sayfa buraya aktarır
Auth.redirectUri = () => location.origin + location.pathname.replace(/[^/]*$/, '');

Object.assign(IC, {
  notepad: svg('<rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M8.5 8h7M8.5 11.5h7M8.5 15h4"/>'),
  pinI: svg('<path d="M9 4h6l-1 6 3 3H7l3-3z"/><path d="M12 13v7"/>'),
  pinFill: svg('<path d="M9 4h6l-1 6 3 3H7l3-3z" fill="currentColor"/><path d="M12 13v7"/>'),
  palette: svg('<path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.8 1.8-1.7 0-1.3-1.3-1.6-1.3-2.8 0-1 .8-1.6 1.8-1.6H17a4 4 0 0 0 4-4C21 6.5 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7.5" r="1"/><circle cx="14.5" cy="7.5" r="1"/>'),
  bell: svg('<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>'),
  share: svg('<path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 12v7h14v-7"/>'),
  more: svg('<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>'),
  folder: IC.folder || svg('<path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4.2l2 2.2h8.8A1.5 1.5 0 0 1 21 8.7V18a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18z"/>'),
  history: svg('<path d="M3.5 12a8.5 8.5 0 1 0 2.5-6"/><path d="M3 4v4h4"/><path d="M12 7.5V12l3 2"/>'),
  copy: svg('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>'),
  print: svg('<path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="7" rx="1.5"/><path d="M7 14h10v6H7z"/>'),
  restore: svg('<path d="M4 12a8 8 0 1 0 2.3-5.7"/><path d="M4 4v4h4"/>'),
  listUl: svg('<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>'),
  listOl: svg('<path d="M10 6h10M10 12h10M10 18h10"/><path d="M4 4.5h1.2V9M4 9h2.4M4 14.2c.3-.6 1-.9 1.6-.6.9.4.7 1.4 0 2L4 17.5h2.5"/>'),
  sliders: svg('<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>'),
  mic: svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>'),
  grid: svg('<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>'),
  rows: svg('<path d="M4 6h16M4 12h16M4 18h16"/>'),
  hash: svg('<path d="M9 4 7 20M17 4l-2 16M4.5 9h15M3.5 15h15"/>'),
  todo: svg('<rect x="3.5" y="4" width="7" height="7" rx="1.5"/><path d="m5.2 7.4 1.4 1.4 2.4-2.6"/><rect x="3.5" y="13" width="7" height="7" rx="1.5"/><path d="M14 7.5h7M14 16.5h7"/>')
});

showLogin = function (msg) {
  $('#app').innerHTML = `
  <div class="center-screen">
    <div class="brand-mark">${IC.notepad}</div>
    <h1>Notlar</h1>
    <p>Gmail hesabınla giriş yap. iPhone ve Mac'teki Notlar uygulamasının Gmail'e kaydettiği notlar burada da görünür.</p>
    ${msg ? `<p class="err">${esc(msg)}</p>` : ''}
    <button class="btn primary" data-action="login">Google ile giriş yap</button>
    ${guvenCipleri([[IC.shield, 'Şifren bize gelmez', 'Giriş Google\'ın kendi sayfasında yapılır (accounts.google.com).'], [IC.notepad, 'Notlar senin Gmail\'inde', 'Sunucumuz yok; notlar Gmail hesabında durur, başka yere gitmez.'], [IC.logout, 'İstediğin an çık', 'Çıkış yapınca bu cihazdaki kopya silinir.']])}
  </div>`;
};

/* ───────── Renkler ───────── */
const NCOLORS = [['', 'Renksiz', ''], ['sari', 'Sarı', '#f7d64a'], ['yesil', 'Yeşil', '#6fcf7c'], ['mavi', 'Mavi', '#6aa8f0'],
  ['pembe', 'Pembe', '#f28fb1'], ['mor', 'Mor', '#a98bf0'], ['turuncu', 'Turuncu', '#f5a35c'], ['gri', 'Gri', '#9aa1ab']];
const nColor = k => (NCOLORS.find(c => c[0] === k) || NCOLORS[0])[2];

/* ───────── Veri katmanı: Gmail (gerçek) ya da örnek veriler (demo) ───────── */
const CAL_EVENTS = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
const NOTE_HDRS = ['Subject', 'X-Universally-Unique-Identifier', 'X-Suha-Color', 'X-Suha-Tags', 'X-Mail-Created-Date', 'X-Suha-Reminder', 'X-Suha-Lock', 'X-Suha-Links'];
// Hatırlatıcı: "<zaman ms>|<takvim etkinliği kimliği>"
const remParse = h => { const [t, ev] = String(h || '').trim().split('|'); return +t > 0 ? { at: +t, ev: ev || '' } : null; };
// #etiketler: notun metninden çıkarılır; listede gösterebilmek için mesaj başlığında da (X-Suha-Tags) saklanır
const tagsIn = text => [...new Set([...(text || '').matchAll(/(?:^|[\s(])#([\p{L}\p{N}_-]{2,30})/gu)].map(m => m[1].toLocaleLowerCase('tr')))].slice(0, 20);
const tagsHdr = h => (h || '').split(/\s+/).filter(Boolean).map(x => { try { return decodeURIComponent(x); } catch { return ''; } }).filter(Boolean);
const isNotesRoot = l => l.type === 'user' && /^(notes|notlar)$/i.test(l.name);

function noteMeta(m) {
  return {
    id: m.id, uuid: hdr(m, 'X-Universally-Unique-Identifier') || m.id, title: hdr(m, 'Subject'),
    locked: hdr(m, 'X-Suha-Lock').trim() === '1', links: (hdr(m, 'X-Suha-Links') || '').split(/\s+/).filter(Boolean),
    snippet: hdr(m, 'X-Suha-Lock').trim() === '1' ? '' : fixMojibake(decodeEntities(m.snippet || '')), date: +m.internalDate || 0, labelIds: m.labelIds || [],
    pinned: (m.labelIds || []).includes('STARRED'), color: (hdr(m, 'X-Suha-Color') || '').trim().toLowerCase(),
    created: Date.parse(hdr(m, 'X-Mail-Created-Date')) || +m.internalDate || 0, reminder: remParse(hdr(m, 'X-Suha-Reminder')),
    tags: hdr(m, 'X-Suha-Lock').trim() === '1' ? [] : [...new Set([...tagsHdr(hdr(m, 'X-Suha-Tags')), ...tagsIn(hdr(m, 'Subject') + ' ' + (m.snippet || ''))])]
  };
}
const NDB_REAL = {
  async folders() {
    const { labels = [] } = await call('labels');
    let root = labels.find(isNotesRoot);
    if (!root) root = await call('labels', { method: 'POST', body: { name: 'Notes', labelListVisibility: 'labelShow', messageListVisibility: 'show' } });
    return labels.filter(l => l.type === 'user' && l.id !== root.id && l.name.startsWith(root.name + '/'))
      .map(l => ({ id: l.id, name: l.name.slice(root.name.length + 1) })).concat([{ id: root.id, name: '', root: true, full: root.name }]);
  },
  async list(labelId, trash, max = 400) {
    const ids = []; let pageToken;
    do {
      const r = await call('messages', { query: { labelIds: trash ? ['TRASH', labelId] : [labelId], includeSpamTrash: trash ? 'true' : null, maxResults: 100, pageToken } });
      (r.messages || []).forEach(m => ids.push(m.id));
      pageToken = r.nextPageToken;
    } while (pageToken && ids.length < max);
    const ms = await pmap(ids.slice(0, max), 6, id => call('messages/' + id, { query: { format: 'metadata', metadataHeaders: NOTE_HDRS } }).catch(() => null));
    return ms.filter(Boolean).map(noteMeta);
  },
  async get(id) {
    const m = await call('messages/' + id, { query: { format: 'full' } });
    const p = parseMessage(m);
    const enc = ((p.html || p.text || '').match(/suha-enc:(v1\.[\w-]+\.[\w-]+\.[\w-]+)/) || [])[1] || '';
    return { ...noteMeta(m), html: enc ? '' : sanitizeNoteHtml(p.html || textToHtml(p.text || '')), enc, created: p.noteCreated };
  },
  insert: (raw, labelIds) => call('messages', { method: 'POST', query: { internalDateSource: 'dateHeader' }, body: { raw, labelIds } }),
  trash: id => call(`messages/${id}/trash`, { method: 'POST' }),
  untrash: id => call(`messages/${id}/untrash`, { method: 'POST' }),
  modify: (id, add = [], remove = []) => call(`messages/${id}/modify`, { method: 'POST', body: { addLabelIds: add, removeLabelIds: remove } }),
  createFolder: async full => { const l = await call('labels', { method: 'POST', body: { name: full, labelListVisibility: 'labelShow', messageListVisibility: 'show' } }); return l.id; },
  renameFolder: (id, full) => call('labels/' + id, { method: 'PATCH', body: { name: full } }),
  deleteFolder: id => call('labels/' + id, { method: 'DELETE' }),
  remind: ev => call(CAL_EVENTS, { method: 'POST', body: ev }),
  unremind: id => call(CAL_EVENTS + '/' + encodeURIComponent(id), { method: 'DELETE' }).catch(() => {}),
  send: msg => Gmail.send(msg),
  // Notun her yerinde arama: Gmail'in araması, her klasörde ayrı
  async search(q, folderIds) {
    const lists = await Promise.all(folderIds.map(id => call('messages', { query: { q, labelIds: [id], maxResults: 100 } }).catch(() => ({}))));
    return new Set(lists.flatMap(r => (r.messages || []).map(m => m.id)));
  }
};

// Demo: bellekte notlar, klasörler ve çöpteki eski sürümler
const NDB_DEMO = (() => {
  const D = 864e5, now = Date.now();
  let seq = 0;
  const folders = [{ id: 'F0', name: '', root: true, full: 'Notes' }, { id: 'F1', name: 'İş' }, { id: 'F2', name: 'Ev' }];
  const msgs = [];
  const add = (folder, title, html, ago, extra = {}) => { const id = 'n' + (++seq); msgs.push({ id, uuid: extra.uuid || 'U' + seq, title, html, date: now - ago, labelIds: [folder, ...(extra.pin ? ['STARRED'] : []), ...(extra.trash ? ['TRASH'] : [])], color: extra.color || '', created: '' }); return id; };
  add('F0', 'Alışveriş listesi', '<div>☐ Süt</div><div>☑ Yumurta</div><div>☐ Kahve</div><div>☐ Deterjan</div><div>☐ Pil (AA)</div>', 2 * D, { pin: true, color: 'sari' });
  add('F0', 'Tatil fikirleri', '<div>Kaş, Kalkan, Bozcaada.</div><div><b>Haziran başı</b> uygun.</div><ul><li>Otel yerine ev kiralamayı düşün</li><li>Feribot saatlerine bak</li></ul><div>#tatil #yaz</div>', 6 * D, { color: 'mavi', uuid: 'UT' });
  add('F0', 'Mercimek çorbası', '<h2>Malzemeler</h2><ul><li>1 su bardağı kırmızı mercimek</li><li>1 soğan, 1 havuç</li></ul><h2>Yapılışı</h2><ol><li>Sebzeleri kavur</li><li>Mercimeği ekle, 25 dk pişir</li></ol><div>#tarif</div>', 9 * D);
  add('F0', 'Tatil fikirleri', '<div>Kaş, Kalkan.</div>', 7 * D, { trash: true, uuid: 'UT' });
  add('F0', 'Tatil fikirleri', '<div>Kaş</div>', 8 * D, { trash: true, uuid: 'UT' });
  add('F1', 'Toplantı notları', '<h2>Proje toplantısı</h2><div>Teslim tarihi 30 Ekim.</div><ol><li>Tasarım onayı</li><li>Test</li><li>Yayın</li></ol>', 1 * D);
  add('F1', 'Not: kira artışı', '<div>Kira artışı Ocak\'ta %TÜFE oranında olacak, sözleşmeyi kontrol et.</div>', 13 * D, { color: 'pembe' });
  add('F2', 'Ev işleri', '<div>☑ Kombi bakımı</div><div>☐ Perde ölçüsü</div><div>☐ Ampul değiştir</div>', 3 * D, { color: 'yesil' });
  add('F0', 'Eski şifre ipucu (silindi)', '<div>Bu not silinmiş; Silinenler\'den geri getirilebilir.</div>', 4 * D, { trash: true });
  const meta = m => ({ id: m.id, uuid: m.uuid, title: m.title, snippet: m.enc ? '' : htmlToText(m.html).replace(/\s+/g, ' ').slice(0, 140), date: m.date, created: m.createdAt || m.date, reminder: m.reminder || null, labelIds: [...m.labelIds], pinned: m.labelIds.includes('STARRED'), color: m.color, locked: !!m.enc, links: m.links || [], tags: m.enc ? [] : tagsIn(m.title + ' ' + htmlToText(m.html)) });
  const w = (x, ms = 200) => new Promise(r => setTimeout(() => r(x), ms));
  const find = id => msgs.find(m => m.id === id);
  const dec = s => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return new TextDecoder().decode(Uint8Array.from(atob(s), c => c.charCodeAt(0))); };
  return {
    folders: () => w(folders.map(f => ({ ...f }))),
    list: (lid, trash) => w(msgs.filter(m => m.labelIds.includes(lid) && trash === m.labelIds.includes('TRASH')).map(meta), 300),
    get: id => w({ ...meta(find(id)), html: find(id).enc ? '' : find(id).html, enc: find(id).enc || '', created: '' }),
    insert: (raw, labelIds) => {
      const txt = dec(raw); const i = txt.indexOf('\r\n\r\n'); const head = txt.slice(0, i), body = txt.slice(i + 4);
      const h = n => (head.match(new RegExp('^' + n + ': (.*)$', 'mi')) || [])[1] || '';
      let subj = h('Subject'); const ew = subj.match(/^=\?UTF-8\?B\?(.*)\?=$/); if (ew) subj = new TextDecoder().decode(Uint8Array.from(atob(ew[1]), c => c.charCodeAt(0)));
      const html = new TextDecoder().decode(Uint8Array.from(atob(body.replace(/\r\n/g, '')), c => c.charCodeAt(0))).replace(/^[\s\S]*<body>|<\/body>[\s\S]*$/g, '');
      const id = 'n' + (++seq);
      const enc = h('X-Suha-Lock').trim() === '1' ? ((html.match(/suha-enc:(v1\.[\w-]+\.[\w-]+\.[\w-]+)/) || [])[1] || '') : '';
      msgs.push({ id, enc, links: h('X-Suha-Links').split(/\s+/).filter(Boolean), uuid: h('X-Universally-Unique-Identifier'), title: subj, html, date: Date.parse(h('Date')) || Date.now(), reminder: remParse(h('X-Suha-Reminder')), labelIds: [...labelIds], color: h('X-Suha-Color').trim(), created: h('X-Mail-Created-Date') });
      return w({ id, threadId: id }, 300);
    },
    trash: id => { const m = find(id); if (m && !m.labelIds.includes('TRASH')) m.labelIds.push('TRASH'); return w({}); },
    untrash: id => { const m = find(id); if (m) m.labelIds = m.labelIds.filter(x => x !== 'TRASH'); return w({}); },
    modify: (id, add = [], remove = []) => { const m = find(id); m.labelIds = [...new Set([...m.labelIds, ...add])].filter(x => !remove.includes(x)); return w({}); },
    createFolder: full => { const id = 'F' + (++seq) + 'x'; folders.push({ id, name: full.replace(/^Notes\//, '') }); return w(id); },
    renameFolder: (id, full) => { folders.find(f => f.id === id).name = full.replace(/^Notes\//, ''); return w({}); },
    deleteFolder: id => { folders.splice(folders.findIndex(f => f.id === id), 1); return w({}); },
    remind: ev => { window.__lastReminder = ev; return w({ id: 'ev' + (++seq) }); },
    unremind: id => { window.__lastUnremind = id; return w({}); },
    send: msg => { window.__lastSent = msg; return w({ id: 'sent' }, 500); },
    search: q => { const k = q.toLocaleLowerCase('tr'); return w(new Set(msgs.filter(m => !m.labelIds.includes('TRASH') && (m.title + ' ' + htmlToText(m.html)).toLocaleLowerCase('tr').includes(k)).map(m => m.id)), 250); }
  };
})();
const NDB = DEMO ? NDB_DEMO : NDB_REAL;

/* ───────── Durum ───────── */
const N = {
  folders: [], root: null,
  view: store.get('nFolder', 'all'),   // 'all' | 'trash' | klasör kimliği
  all: [], trash: null, q: '', loading: false,
  tag: null, hits: null,               // seçili #etiket, Gmail aramasından gelen not kimlikleri
  sort: store.get('nSort', 'date'), grid: store.get('nGrid', false), offline: false,
  cur: null,                           // açık not
  sel: new Set(), selMode: false, todos: null   // toplu seçim, yapılacaklar görünümü
};
const realId = id => !!id && !String(id).startsWith('q:');   // "q:…" = çevrimdışı yazılıp henüz Gmail'e gitmemiş not
const folderOf = n => N.folders.find(f => n.labelIds.includes(f.id));
const folderName = f => f ? (f.root ? 'Genel' : f.name) : '';
const subFolders = () => N.folders.filter(f => !f.root).sort((a, b) => a.name.localeCompare(b.name, 'tr'));

/* ───────── Kabuk ───────── */
function nShell() {
  $('#app').innerHTML = `
  <div class="shell notes-shell" id="shell" data-view="list">
    <section class="listpane">
      <header class="bar">
        <h1 id="listTitle">Notlar</h1>
        <button class="btn sm new-note-btn" data-action="n-new">${IC.pen} Yeni not</button>
        <button class="icon-btn" data-action="n-select" aria-label="Birkaç not seç" title="Birkaç not seç">${IC.checkSq}</button>
        <button class="icon-btn" data-action="n-view" aria-label="Görünüm ve sıralama" title="Görünüm ve sıralama">${IC.sliders}</button>
        <button class="icon-btn" data-action="n-refresh" aria-label="Yenile" title="Yenile">${IC.refresh}</button>
        <button class="icon-btn" data-action="notes-settings" aria-label="Ayarlar" title="Ayarlar">${IC.gear}</button>
      </header>
      <form class="searchbox" id="nSearchForm">
        ${IC.search}<input id="nSearch" type="search" placeholder="Notlarda ara" autocomplete="off" enterkeyhint="search">
      </form>
      <div class="noffline" id="nOffline" hidden>Çevrimdışısın · notlar bu cihazdaki kopyadan gösteriliyor; yazdıkların bağlantı gelince kaydedilecek</div>
      <div class="nfolders" id="nFolders"></div>
      <div class="ntags" id="nTags"></div>
      <div id="list" class="list notes-list"></div>
      <button class="fab" data-action="n-new" aria-label="Yeni not">${IC.pen}<span>Yeni not</span></button>
    </section>
    <section class="reader" id="reader"></section>
  </div>`;
  const s = $('#nSearch');
  s.addEventListener('input', () => { N.q = s.value.trim(); N.hits = null; nRenderList(); nSearchSoon(); });
  $('#nSearchForm').addEventListener('submit', e => { e.preventDefault(); s.blur(); });
  nEmptyReader();
}
function nEmptyReader() {
  $('#reader').innerHTML = `<div class="empty-reader">${IC.notepad}<p>${N.view === 'trash' ? 'Geri getirmek için silinen bir not seç' : 'Bir not seç ya da yeni not yaz'}</p></div>`;
}

start = async function () {
  if (!window.SUHA_PROGRAM) return window.suhaKapi();
  nShell();
  try {
    const p = await Gmail.profile();
    S.email = p.email;
    if (typeof accessGate === 'function' && !(await accessGate(p.email))) return;
    store.set('email', p.email);
    await nLoad();
  } catch (e) {
    if (nNetErr(e) && nFromCache()) { nSetOffline(true); nApplyQueue(); nRenderFolders(); nRenderList(); nAfterStart(); return; }
    if (!(e instanceof AuthError)) showLogin('Gmail\'e bağlanılamadı: ' + e.message);
    return;
  }
  nAfterStart();
};

async function nLoad() {
  if (N.loading) return;
  N.loading = true;
  nRenderList(true);
  try {
    N.folders = await NDB.folders();
    N.root = N.folders.find(f => f.root);
    if (N.view !== 'all' && N.view !== 'trash' && !N.folders.some(f => f.id === N.view)) N.view = 'all';
    const lists = await Promise.all(N.folders.map(f => NDB.list(f.id, false)));
    const seen = new Set();
    N.all = lists.flat().filter(n => !seen.has(n.id) && seen.add(n.id));
    if (N.view === 'trash') await nLoadTrash();
    nSetOffline(false);
    store.set('nCache', { folders: N.folders, all: N.all.slice(0, 600), at: Date.now() });
    nApplyQueue(); nFlushQueue();
  } catch (e) {
    if (nNetErr(e) && nFromCache()) nSetOffline(true);
    else if (!(e instanceof AuthError)) toast('Notlar yüklenemedi: ' + e.message);
  }
  N.loading = false;
  nRenderFolders(); nRenderList();
}
// Uygulama dönüşünde ve Mail'in ortak olaylarında kullanılır
loadList = () => (N.cur?.dirty ? Promise.resolve() : nLoad());

/* ───────── Klasör çubuğu ───────── */
function nRenderFolders() {
  const el = $('#nFolders'); if (!el) return;
  const chip = (id, name, extra = '') => `<button type="button" class="nchip ${N.view === id ? 'on' : ''}" data-action="n-folder" data-id="${esc(id)}">${name}${extra}</button>`;
  const count = id => N.all.filter(n => n.labelIds.includes(id)).length;
  el.innerHTML = chip('all', 'Tümü', `<i>${N.all.length}</i>`)
    + (N.root ? chip(N.root.id, 'Genel', `<i>${count(N.root.id)}</i>`) : '')
    + subFolders().map(f => chip(f.id, `${IC.folder}${esc(f.name)}`, `<i>${count(f.id)}</i>${N.view === f.id ? `<span class="nchip-more" data-action="n-folder-menu" data-id="${esc(f.id)}" title="Klasörü düzenle">${IC.more}</span>` : ''}`)).join('')
    + `<button type="button" class="nchip add" data-action="n-folder-new" title="Yeni klasör">${IC.plus}<span>Klasör</span></button>`
    + chip('todos', `${IC.todo}Yapılacaklar`)
    + chip('trash', `${IC.trash}Silinenler`);
  el.querySelector('.nchip.on')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

/* ───────── Liste ───────── */
function nVisible() {
  let list = N.view === 'trash' ? (N.trash || []) : N.view === 'all' ? N.all : N.all.filter(n => n.labelIds.includes(N.view));
  if (N.tag && N.view !== 'trash') list = list.filter(n => (n.tags || []).includes(N.tag));
  if (N.q) {
    const q = N.q.toLocaleLowerCase('tr');
    list = list.filter(n => (n.title + ' ' + n.snippet).toLocaleLowerCase('tr').includes(q) || N.hits?.has(n.id));
  }
  const by = N.view === 'trash' ? 'date' : N.sort;
  const cmp = by === 'title' ? (a, b) => (a.title || '').localeCompare(b.title || '', 'tr') : by === 'created' ? (a, b) => (b.created || b.date) - (a.created || a.date) : (a, b) => b.date - a.date;
  return list.slice().sort((a, b) => (N.view !== 'trash' && b.pinned - a.pinned) || cmp(a, b));
}
// Gmail'de notun içinde arama (yazmayı bırakınca)
let nSearchT = 0;
function nSearchSoon() {
  clearTimeout(nSearchT);
  const q = N.q;
  if (q.length < 2 || N.offline) return;
  nSearchT = setTimeout(async () => {
    try { const hits = await NDB.search(q, N.folders.map(f => f.id)); if (N.q === q) { N.hits = hits; nRenderList(); } } catch {}
  }, 450);
}
function nRenderTags() {
  const el = $('#nTags'); if (!el) return;
  const pool = N.view === 'trash' || N.view === 'todos' ? [] : N.view === 'all' ? N.all : N.all.filter(n => n.labelIds.includes(N.view));
  const counts = new Map();
  for (const n of pool) for (const t of n.tags || []) counts.set(t, (counts.get(t) || 0) + 1);
  if (N.tag && !counts.has(N.tag)) N.tag = null;
  el.hidden = !counts.size;
  el.innerHTML = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'tr')).slice(0, 30)
    .map(([t, c]) => `<button type="button" class="ntag ${N.tag === t ? 'on' : ''}" data-action="n-tag" data-tag="${esc(t)}">#${esc(t)}<i>${c}</i></button>`).join('');
}
function nCard(n) {
  const f = N.view === 'all' ? folderOf(n) : null;
  const prev = (n.snippet || '').replace(n.title, '').replace(/☑\s*/g, '✓ ').replace(/☐\s*/g, '').trim();
  return `<div class="note-card ${N.cur?.id === n.id ? 'sel' : ''} ${N.selMode && N.sel.has(n.id) ? 'picked' : ''} ${n.locked ? 'locked' : ''} ${n.color ? 'tinted' : ''}" ${n.color ? `style="--nc:${nColor(n.color)}"` : ''} data-action="n-open" data-id="${esc(n.id)}">
    ${N.selMode ? `<span class="nsel-cb ${N.sel.has(n.id) ? 'on' : ''}">${N.sel.has(n.id) ? IC.check : ''}</span>` : ''}
    <div class="note-title">${n.pinned && N.view !== 'trash' ? `<span class="npin">${IC.pinFill}</span>` : ''}${n.locked ? `<span class="nlock-i">${IC.lockI}</span>` : ''}${esc(n.title || 'Yeni not')}</div>
    ${N.grid ? `<div class="note-gprev">${esc(prev)}</div><div class="note-meta"><span>${fmtDate(n.date)}</span></div>` : `<div class="note-meta"><span>${fmtDate(n.date)}</span><span class="note-prev">${esc(prev)}</span></div>`}
    ${(f && !f.root) || (n.reminder?.at > Date.now()) ? `<div class="ncard-tags">${f && !f.root ? `<span class="nfolder-tag">${IC.folder}${esc(f.name)}</span>` : ''}${n.reminder?.at > Date.now() ? `<span class="nfolder-tag nrem">${IC.bell}${esc(nWhen(n.reminder.at))}</span>` : ''}</div>` : ''}
  </div>`;
}
function nRenderList(loading) {
  const el = $('#list'); if (!el) return;
  el.classList.toggle('grid', !!N.grid && N.view !== 'trash');
  nRenderTags();
  $('#listTitle').textContent = N.view === 'todos' ? 'Yapılacaklar' : N.view === 'trash' ? 'Silinenler' : N.view === 'all' ? 'Notlar' : folderName(N.folders.find(f => f.id === N.view));
  if (loading && !N.all.length) { el.innerHTML = skeleton(); return; }
  if (N.view === 'todos') { nlTodosRender(el); nlBulkBar(); return; }
  const list = nVisible();
  let html = '';
  if (N.view === 'trash') {
    html = `<div class="ntrash-info">Silinen notlar 30 gün sonra Gmail tarafından kalıcı olarak silinir. Geri getirmek için nota dokun.</div>` + list.map(nCard).join('');
    if (N.trash === null) html += '<div class="list-msg">Yükleniyor…</div>';
  } else {
    const pins = list.filter(n => n.pinned), rest = list.filter(n => !n.pinned);
    html = pins.length ? `<div class="nsec">${IC.pinI}Sabitlenenler</div>${pins.map(nCard).join('')}${rest.length ? '<div class="nsec">Notlar</div>' : ''}${rest.map(nCard).join('')}` : rest.map(nCard).join('');
  }
  if (!list.length && !(N.view === 'trash' && N.trash === null)) html += `<div class="list-msg">${N.q ? (N.hits === null && N.q.length > 1 && !N.offline ? 'Aranıyor…' : 'Sonuç bulunamadı') : N.tag ? 'Bu etikette not yok' : N.view === 'trash' ? 'Silinen not yok' : 'Henüz not yok'}</div>`;
  el.innerHTML = html;
  nlBulkBar();
}

/* ───────── Not açma / yazma ───────── */
function nNewDraft(folderId) {
  return { id: null, uuid: (crypto.randomUUID ? crypto.randomUUID() : rnd()).toUpperCase(), created: new Date().toUTCString().replace('GMT', '+0000'),
    title: '', html: '', date: Date.now(), labelIds: [folderId], pinned: false, color: '', dirty: false, saving: false, timer: null };
}
async function nOpen(id) {
  await nFlush();
  const meta = (N.view === 'trash' ? N.trash || [] : N.all).find(n => n.id === id);
  if (!meta) return;
  setView('thread', matchMedia('(max-width: 800px)').matches && S.view !== 'thread');
  N.cur = { ...meta, html: null, dirty: false, saving: false, timer: null, trashed: N.view === 'trash' };
  nRenderList();
  $('#reader').innerHTML = `<div class="reader-bar note-bar"><button class="icon-btn back" data-action="back" aria-label="Geri">${IC.back}</button></div><div class="list-msg">Yükleniyor…</div>`;
  try {
    let full;
    try { if (!realId(id)) throw new TypeError('bekliyor'); full = await NDB.get(id); nCacheBody(full); }
    catch (e) { const c = nCachedBody(id); if (!c || !nNetErr(e)) throw e; full = c; }
    if (N.cur?.id !== id) return;
    if (full.enc) return nlOpenLocked(full);
    Object.assign(N.cur, { html: full.html, created: full.created || '', color: full.color || meta.color });
    nRenderEditor();
  } catch (e) { if (!(e instanceof AuthError)) $('#reader').innerHTML = `<div class="list-msg">Açılamadı: ${esc(e.message)}</div>`; }
}
function nNew() {
  nFlush();
  const folder = N.view !== 'all' && N.view !== 'trash' ? N.view : N.root?.id;
  if (N.view === 'trash') { N.view = 'all'; nRenderFolders(); }
  N.cur = nNewDraft(folder);
  setView('thread', matchMedia('(max-width: 800px)').matches && S.view !== 'thread');
  nRenderList();
  nRenderEditor(true);
}
// Nottan ayrılırken bekleyen değişikliği kaydet
async function nFlush() {
  const n = N.cur;
  if (!n) return;
  N.cur = null;
  clearTimeout(n.timer);
  if (n.dirty) await nSave(n);
}
closeReader = function () {
  nFlush();
  setView('list');
  nEmptyReader();
  nRenderList();
};

function nStatus(s) { const el = $('#noteStatus'); if (el) el.textContent = s; }

function nRenderEditor(isNew) {
  const n = N.cur, r = $('#reader');
  const f = folderOf(n);
  if (n.trashed) {
    r.innerHTML = `
      <div class="reader-bar note-bar">
        <button class="icon-btn back" data-action="back" aria-label="Geri">${IC.back}</button>
        <span class="note-date">Silindi · ${fmtDate(n.date, true)}</span>
        <div class="spacer"></div>
        <button class="btn sm" data-action="n-restore">${IC.restore}Geri getir</button>
      </div>
      <div class="reader-scroll note-view ${n.color ? 'tinted' : ''}" ${n.color ? `style="--nc:${nColor(n.color)}"` : ''}>
        <div class="note-h">${esc(n.title)}</div>
        <div class="note-body readonly">${n.html}</div>
      </div>`;
    nWrapChecks($('.note-body'), true);
    return;
  }
  r.innerHTML = `
    <div class="reader-bar note-bar">
      <button class="icon-btn back" data-action="back" aria-label="Geri">${IC.back}</button>
      <span class="note-date">${isNew ? 'Yeni not' : fmtDate(n.date, true)}</span>${n.locked ? `<span class="nlock-b" title="Bu not kilitli">${IC.lockI}</span>` : ''}
      <span class="note-status" id="noteStatus"></span>
      <div class="spacer"></div>
      <button class="icon-btn ${n.pinned ? 'on' : ''}" data-action="n-pin" title="${n.pinned ? 'Sabitlemeyi kaldır' : 'Başa sabitle'}">${n.pinned ? IC.pinFill : IC.pinI}</button>
      <button class="icon-btn" data-action="n-color" title="Renk">${IC.palette}</button>
      <button class="icon-btn" data-action="n-remind" title="Hatırlatıcı">${IC.bell}</button>
      <button class="icon-btn" data-action="n-share" title="Paylaş">${IC.share}</button>
      <button class="icon-btn" data-action="n-more" title="Diğer">${IC.more}</button>
    </div>
    <div class="ntools" id="nTools">
      <button type="button" data-cmd="bold" title="Kalın (Ctrl+B)"><b>B</b></button>
      <button type="button" data-cmd="italic" title="İtalik (Ctrl+I)"><i>I</i></button>
      <button type="button" data-cmd="underline" title="Altı çizili (Ctrl+U)"><u>U</u></button>
      <button type="button" data-cmd="strikeThrough" title="Üstü çizili"><s>S</s></button>
      <span class="ntools-sep"></span>
      <button type="button" data-cmd="h2" title="Başlık">Başlık</button>
      <button type="button" data-cmd="insertUnorderedList" title="Madde işaretli liste">${IC.listUl}</button>
      <button type="button" data-cmd="insertOrderedList" title="Numaralı liste">${IC.listOl}</button>
      <button type="button" data-cmd="todo" title="Yapılacaklar listesi (Ctrl+Shift+L)">${IC.todo}</button>
      <span class="ntools-sep"></span>
      <button type="button" data-cmd="table" title="Tablo ekle">${IC.table}</button>
      <button type="button" data-cmd="image" title="Fotoğraf ekle">${IC.image}</button>
      <button type="button" data-cmd="link" title="Başka bir nota bağlantı ([[)">${IC.linkI}</button>
      <span class="ntbl-tools" id="nTblTools" hidden><span class="ntools-sep"></span><button type="button" data-cmd="row" title="Satır ekle">+ Satır</button><button type="button" data-cmd="col" title="Sütun ekle">+ Sütun</button><button type="button" data-cmd="deltbl" title="Tabloyu sil">${IC.trash}</button></span>
      ${NSR ? `<span class="ntools-sep"></span><button type="button" data-cmd="mic" class="nmic" title="Sesle yaz">${IC.mic}</button>` : ''}
    </div>
    <div class="nfind" id="nFind" hidden>
      <input id="nFindQ" placeholder="Bul" autocomplete="off"><span id="nFindN" class="nfind-n"></span>
      <button type="button" class="icon-btn" data-find="prev" title="Önceki (Shift+Enter)">${IC.chevU}</button><button type="button" class="icon-btn" data-find="next" title="Sonraki (Enter)">${IC.chevD}</button>
      <input id="nFindR" placeholder="Şununla değiştir" autocomplete="off">
      <button type="button" class="btn sm" data-find="one">Değiştir</button><button type="button" class="btn sm" data-find="all">Tümünü</button>
      <button type="button" class="icon-btn" data-find="close" title="Kapat (Esc)">${IC.close}</button>
    </div>
    <div class="reader-scroll note-view ${n.color ? 'tinted' : ''}" ${n.color ? `style="--nc:${nColor(n.color)}"` : ''}>
      <div class="nmeta-row" id="nMetaRow">${f && !f.root ? `<span class="nfolder-tag big" data-action="n-move">${IC.folder}${esc(f.name)}</span>` : ''}<span id="nRemChip"></span></div>
      <input class="note-h" id="noteTitle" spellcheck="true" lang="tr" autocorrect="on" autocapitalize="sentences" placeholder="Başlık" value="${esc(n.title)}" autocomplete="off">
      ${isNew && !n.html ? `<div class="ntpl" id="nTpl"><span>Şablonla başla</span>${NTPL.map((t, i) => `<button type="button" class="nchip" data-action="n-tpl" data-i="${i}">${esc(t[0])}</button>`).join('')}</div>` : ''}
      <div class="note-body" id="noteBody" contenteditable="true" spellcheck="true" lang="tr" autocorrect="on" autocapitalize="sentences" data-ph="Yazmaya başla…">${n.html}</div>
      <div class="ncount" id="nCount"></div>
      <div class="nback" id="nBack" hidden></div>
    </div>`;
  const ti = $('#noteTitle'), bo = $('#noteBody');
  nlBack(n);
  nWrapChecks(bo);
  const changed = () => {
    n.title = ti.value; n.html = nSerialize(bo); n.dirty = true;
    nStatus('Düzenleniyor');
    clearTimeout(n.timer);
    n.timer = setTimeout(() => nSave(n), 5000);   // yazmayı bırakınca birkaç saniye sonra kaydet
  };
  n.changed = changed;
  ti.addEventListener('input', () => { changed(); });
  bo.addEventListener('input', e => { nMarkdown(e, bo); changed(); $('#nTpl')?.remove(); });
  ti.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); bo.focus(); } });
  bo.addEventListener('keydown', e => nKeys(e, bo, changed));
  bo.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (a) {
      const h = a.getAttribute('href');
      if (h.startsWith('#not:')) { e.preventDefault(); return nOpenUuid(h.slice(5)); }
      if (e.ctrlKey || e.metaKey) { e.preventDefault(); return window.open(h, '_blank', 'noopener'); }
    }
    const c = e.target.closest('.nchk');
    if (c) { e.preventDefault(); c.dataset.on = c.dataset.on === '1' ? '0' : '1'; changed(); }
  });
  // Başlıkla metin arasında geçerken kaydetme; notun dışına çıkınca kaydet
  const leave = e => { const to = e.relatedTarget; if (to !== ti && to !== bo && !bo.contains(to) && !to?.closest?.('#nTools')) nSave(n); };
  bo.addEventListener('blur', e => { if (!nRec) leave(e); });
  ti.addEventListener('blur', leave);
  const tools = $('#nTools');
  tools.addEventListener('mousedown', e => e.preventDefault());   // yazı alanından odak kaçmasın
  tools.addEventListener('click', e => {
    const b = e.target.closest('[data-cmd]'); if (!b) return;
    const c = b.dataset.cmd;
    if (c === 'mic') return nDictate(b, bo, changed);
    if (c === 'image') return nPickImage(bo, changed);
    if (c === 'link') return nLinkPicker(b, bo, changed);
    if (/^(table|row|col|deltbl)$/.test(c)) return nTable(c, bo, changed);
    nCmd(c, bo, changed);
  });
  nRenderRem(); nCount(); nFindInit(bo, changed);
  bo.addEventListener('input', () => { nCount(); nLinkTrigger(bo, changed); });
  ti.addEventListener('input', nCount);
  if (isNew) ti.focus();
}

/* ───────── Yazı biçimi ve yapılacaklar ─────────
   Kutucuklar notta "☐" / "☑" karakteri olarak saklanır: iPhone Notlar'da da aynı işaretler görünür.
   Ekranda tıklanabilir kutuya çevrilir, kaydederken yine karaktere döner. */
const CHK_OFF = '☐', CHK_ON = '☑';
function nWrapChecks(root, readonly) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const hits = [];
  while (walker.nextNode()) if (/[☐☑]/.test(walker.currentNode.nodeValue)) hits.push(walker.currentNode);
  for (const t of hits) {
    const frag = document.createDocumentFragment();
    for (const part of t.nodeValue.split(/([☐☑])/)) {
      if (part === CHK_OFF || part === CHK_ON) frag.appendChild(nChk(part === CHK_ON, readonly));
      else if (part) frag.appendChild(document.createTextNode(part));
    }
    t.replaceWith(frag);
  }
}
function nChk(on, readonly) {
  const s = document.createElement('span');
  s.className = 'nchk'; s.contentEditable = 'false'; s.dataset.on = on ? '1' : '0';
  if (readonly) s.dataset.ro = '1';
  s.textContent = on ? CHK_ON : CHK_OFF;
  return s;
}
function nSerialize(bo) {
  const c = bo.cloneNode(true);
  c.querySelectorAll('.nchk').forEach(s => s.replaceWith(document.createTextNode(s.dataset.on === '1' ? CHK_ON : CHK_OFF)));
  return sanitizeNoteHtml(c.innerHTML);
}
// İmlecin bulunduğu satır (blok)
function nBlock(bo) {
  const sel = getSelection(); if (!sel.rangeCount) return null;
  let node = sel.anchorNode;
  if (!node || !bo.contains(node)) return null;
  if (node === bo) node = bo.childNodes[Math.min(sel.anchorOffset, bo.childNodes.length - 1)] || null;
  if (!node) return null;
  // En yakın satır kutusu (iç içe div'lerde en içteki)
  for (let x = node; x && x !== bo; x = x.parentNode)
    if (x.nodeType === 1 && /^(DIV|P|LI|H[1-6]|BLOCKQUOTE|PRE)$/.test(x.nodeName)) return x;
  // Satır bir kutuya sarılı değil: sar
  document.execCommand('formatBlock', false, 'div');
  const n2 = getSelection().anchorNode;
  for (let x = n2; x && x !== bo; x = x.parentNode) if (x.nodeType === 1 && /^(DIV|P|LI|H[1-6])$/.test(x.nodeName)) return x;
  return null;
}
const firstChk = b => { const f = b.firstChild; return f && f.nodeType === 1 && f.classList.contains('nchk') ? f : null; };
function nCaretAfter(node) { const r = document.createRange(); r.setStartAfter(node); r.collapse(true); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
function nAddChk(b) {
  const c = nChk(false);
  b.insertBefore(c, b.firstChild);
  const sp = document.createTextNode(' ');
  c.after(sp);
  if (b.lastChild?.nodeName === 'BR' && b.childNodes.length === 3) b.lastChild.remove();
  nCaretAfter(sp);
}
function nRemoveChk(b) {
  const c = firstChk(b); if (!c) return;
  const nx = c.nextSibling;
  if (nx?.nodeType === 3) nx.nodeValue = nx.nodeValue.replace(/^[\s ]/, '');
  c.remove();
  if (!b.textContent.trim() && !b.querySelector('br')) b.appendChild(document.createElement('br'));
  const r = document.createRange(); r.selectNodeContents(b); r.collapse(true); const s = getSelection(); s.removeAllRanges(); s.addRange(r);
}
function nCmd(cmd, bo, changed) {
  if (document.activeElement !== bo) bo.focus();
  if (cmd === 'todo') {
    const b = nBlock(bo); if (!b) return;
    if (firstChk(b)) nRemoveChk(b); else nAddChk(b);
  } else if (cmd === 'h2') {
    const b = nBlock(bo);
    document.execCommand('formatBlock', false, b && /^H\d$/.test(b.nodeName) ? 'div' : 'h2');
  } else document.execCommand(cmd, false, null);
  changed(); nToolState();
}
function nKeys(e, bo, changed) {
  if (e.key === 'Tab') {
    const an = getSelection().anchorNode, td = an && (an.nodeType === 1 ? an : an.parentElement)?.closest?.('td, th');
    if (td && bo.contains(td)) {
      e.preventDefault();
      const cells = [...td.closest('table').querySelectorAll('td, th')];
      let i = cells.indexOf(td) + (e.shiftKey ? -1 : 1);
      if (i >= cells.length) { nTable('row', bo, changed); i = cells.length; }
      const next = td.closest('table').querySelectorAll('td, th')[Math.max(0, i)];
      if (next) { const r = document.createRange(); r.selectNodeContents(next); r.collapse(false); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
      return;
    }
  }
  if (e.key === 'Enter' && !e.shiftKey) {
    const b = nBlock(bo);
    if (b && firstChk(b)) {
      const rest = b.textContent.replace(/[☐☑\s ]/g, '');
      if (!rest) { e.preventDefault(); nRemoveChk(b); changed(); return; }   // boş maddede Enter: listeyi bitir
      e.preventDefault();                                                         // yeni satıra boş kutu
      document.execCommand('insertParagraph');
      const nb = nBlock(bo);
      if (nb && nb !== b) {
        const old = firstChk(nb);
        if (old) { old.dataset.on = '0'; old.textContent = CHK_OFF; }
        else nAddChk(nb);
      }
      changed();
    }
  }
  if (e.key === 'Backspace') {
    const sel = getSelection();
    if (!sel.isCollapsed) return;
    const b = nBlock(bo), c = b && firstChk(b);
    if (!c) return;
    const r = document.createRange(); r.setStart(b, 0); r.setEnd(sel.anchorNode, sel.anchorOffset);
    if (!r.toString().replace(/[☐☑\s ]/g, '')) { e.preventDefault(); nRemoveChk(b); changed(); }
  }
}
function nToolState() {
  const t = $('#nTools'); if (!t) return;
  for (const b of t.querySelectorAll('[data-cmd]')) {
    const c = b.dataset.cmd;
    let on = false;
    try { if (/^(bold|italic|underline|strikeThrough|insertUnorderedList|insertOrderedList)$/.test(c)) on = document.queryCommandState(c); } catch {}
    if (c === 'h2') on = /^h\d$/i.test(document.queryCommandValue('formatBlock') || '');
    b.classList.toggle('on', on);
  }
}
document.addEventListener('selectionchange', () => { if (document.activeElement?.id === 'noteBody') nToolState(); });

/* ───────── Kaydetme ───────── */
function nBuildRaw(n) {
  const encWord = s => /^[\x20-\x7e]*$/.test(s) ? s : '=?UTF-8?B?' + bytesToB64(utf8(s)) + '?=';
  const title = n.locked ? 'Kilitli not' : (n.title.trim() || htmlToText(n.html).split('\n')[0].replace(/[☐☑]\s*/g, '').slice(0, 80) || 'Yeni not');
  const html = n.locked ? `<html><head></head><body><div>🔒 Bu not Suha Notlar ile kilitlendi; yalnızca parolayla açılır.</div><div style="color:#999;font-size:9px;word-break:break-all">suha-enc:${n.enc}</div></body></html>` : `<html><head></head><body>${n.html}</body></html>`;
  const lines = [
    `From: ${S.email}`, `Subject: ${encWord(title)}`, `Date: ${new Date(n.dateMs || Date.now()).toUTCString().replace('GMT', '+0000')}`,
    'X-Uniform-Type-Identifier: com.apple.mail-note', `X-Mail-Created-Date: ${n.created || new Date().toUTCString().replace('GMT', '+0000')}`,
    `X-Universally-Unique-Identifier: ${n.uuid}`, `Message-Id: <${n.uuid}.${Date.now()}@mail.app>`
  ];
  if (n.color) lines.push(`X-Suha-Color: ${n.color}`);
  if (n.reminder?.at) lines.push(`X-Suha-Reminder: ${n.reminder.at}|${String(n.reminder.ev || '').replace(/[^\w-]/g, '')}`);
  const tags = n.locked ? [] : tagsIn(n.title + ' ' + htmlToText(n.html));
  if (tags.length) lines.push(`X-Suha-Tags: ${tags.map(encodeURIComponent).join(' ')}`);
  const links = n.locked ? [] : [...new Set([...String(n.html).matchAll(/href="#not:([\w-]+)"/g)].map(m => m[1]))].slice(0, 40);
  if (links.length) lines.push(`X-Suha-Links: ${links.join(' ')}`);
  if (n.locked) lines.push('X-Suha-Lock: 1');
  lines.push('MIME-Version: 1.0', 'Content-Type: text/html; charset=utf-8', 'Content-Transfer-Encoding: base64');
  return { raw: toB64url(lines.join('\r\n') + '\r\n\r\n' + bytesToB64(utf8(html)).replace(/.{76}/g, '$&\r\n')), title, tags, links };
}
async function nSave(n = N.cur) {
  if (!n || !n.dirty || n.saving || n.trashed) return;
  clearTimeout(n.timer);
  const empty = !n.locked && !n.title.trim() && !htmlToText(n.html).replace(/[☐☑]/g, '').trim();
  if (empty && !n.id) { n.dirty = false; return; }                // boş yeni notu kaydetme
  if (n.locked && !n.lockPw) { n.dirty = false; return; }          // kilitliyken (parola yokken) yazılmış bir şey olamaz
  n.saving = true; n.dirty = false;
  if (N.cur === n) nStatus('Kaydediliyor…');
  try {
    if (n.locked) n.enc = await nlEncrypt(n.title, n.html, n.lockPw);
    const folder = folderOf(n)?.id || N.root?.id;
    const { raw, title, tags, links } = nBuildRaw(n);
    if (N.offline && !navigator.onLine) throw new TypeError('Failed to fetch');
    const labelIds = [folder, ...(n.pinned ? ['STARRED'] : [])];
    const res = await NDB.insert(raw, labelIds);
    const old = realId(n.id) ? n.id : nQueue()[n.uuid]?.oldId;
    n.id = res.id; n.date = Date.now(); n.labelIds = labelIds; n.title = n.title || '';
    if (old) await NDB.trash(old).catch(() => {});
    if (N.trash) N.trash = null;                                  // çöp listesi değişti
    N.all = N.all.filter(x => x.id !== old);
    N.all.unshift({ id: n.id, uuid: n.uuid, title, locked: !!n.locked, links, snippet: n.locked ? '' : htmlToText(n.html).replace(/\s+/g, ' ').slice(0, 140), date: n.date, created: Date.parse(n.created) || n.date, labelIds, pinned: n.pinned, color: n.color, tags, reminder: n.reminder || null });
    nCacheBody({ id: n.id, title, html: n.html, color: n.color, created: n.created, enc: n.locked ? n.enc : '' });
    if (old) nlForget(old);
    nQueueDel(n.uuid);
    nRenderList(); nRenderFolders();
    if (N.cur === n) { nStatus(n.dirty ? 'Düzenleniyor' : 'Kaydedildi'); const d = $('.note-bar .note-date'); if (d) d.textContent = fmtDate(n.date, true); }
  } catch (e) {
    if (nNetErr(e)) {                     // internet yok: bu cihazda sakla, bağlantı gelince kaydet
      nQueuePut(n); nSetOffline(true);
      if (N.cur === n) nStatus('Bu cihazda saklandı · bağlantı gelince kaydedilecek');
      n.saving = false; nRenderList(); return;
    }
    n.dirty = true;
    if (!(e instanceof AuthError)) { if (N.cur === n) nStatus('Kaydedilemedi'); toast('Not kaydedilemedi: ' + e.message); }
  }
  n.saving = false;
  if (n.dirty) { clearTimeout(n.timer); n.timer = setTimeout(() => nSave(n), 1500); }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && N.cur?.dirty) nSave(); });
window.addEventListener('beforeunload', e => { if (N.cur?.dirty) { nSave(); e.preventDefault(); e.returnValue = ''; } });

/* ───────── Küçük açılır menü ───────── */
function nPop(anchor, html, onClick) {
  document.querySelector('.npop')?.remove();
  const m = document.createElement('div');
  m.className = 'ctx-menu sched-pop npop';
  m.innerHTML = html;
  document.body.appendChild(m);
  const r = anchor.getBoundingClientRect();
  const w = m.offsetWidth, h = m.offsetHeight;
  m.style.left = Math.max(8, Math.min(r.right - w, innerWidth - w - 8)) + 'px';
  m.style.top = (r.bottom + 6 + h < innerHeight ? r.bottom + 6 : Math.max(8, r.top - h - 6)) + 'px';
  m.addEventListener('click', e => { const it = e.target.closest('[data-v]'); if (!it) return; m.remove(); onClick(it.dataset.v, it); });
  setTimeout(() => document.addEventListener('mousedown', function off(e) { if (!e.target.closest('.npop')) { m.remove(); document.removeEventListener('mousedown', off); } }), 0);
  return m;
}
const nItem = (v, icon, label, extra = '') => `<button type="button" class="ctx-item" data-v="${esc(v)}" ${extra}>${icon || '<i></i>'}<span>${label}</span></button>`;

/* ───────── Sabitleme, renk, klasöre taşıma ───────── */
async function nTogglePin() {
  const n = N.cur; if (!n) return;
  n.pinned = !n.pinned;
  const meta = N.all.find(x => x.id === n.id);
  if (meta) { meta.pinned = n.pinned; meta.labelIds = n.pinned ? [...new Set([...meta.labelIds, 'STARRED'])] : meta.labelIds.filter(x => x !== 'STARRED'); }
  nRenderList();
  const btn = $('[data-action="n-pin"]');
  if (btn) { btn.classList.toggle('on', n.pinned); btn.innerHTML = n.pinned ? IC.pinFill : IC.pinI; btn.title = n.pinned ? 'Sabitlemeyi kaldır' : 'Başa sabitle'; }
  if (realId(n.id) && !n.dirty) {
    try { await NDB.modify(n.id, n.pinned ? ['STARRED'] : [], n.pinned ? [] : ['STARRED']); }
    catch (e) { if (!(e instanceof AuthError)) toast('Sabitlenemedi: ' + e.message); }
  }
  toast(n.pinned ? 'Not başa sabitlendi' : 'Sabitleme kaldırıldı');
}
function nColorMenu(btn) {
  const n = N.cur; if (!n) return;
  nPop(btn, `<div class="ctx-title">Not rengi</div><div class="ncolors">${NCOLORS.map(([k, name, c]) =>
    `<button type="button" class="ncolor ${n.color === k ? 'on' : ''}" data-v="${k || 'none'}" title="${name}" style="--c:${c || 'transparent'}">${k ? '' : IC.close}</button>`).join('')}</div>
    <p class="ncolor-note">Renk sadece bu programda görünür.</p>`, v => {
    n.color = v === 'none' ? '' : v;
    const view = $('.note-view');
    if (view) { view.classList.toggle('tinted', !!n.color); view.style.setProperty('--nc', nColor(n.color)); }
    const meta = N.all.find(x => x.id === n.id); if (meta) meta.color = n.color;
    nRenderList();
    n.dirty = true; nSave(n);
  });
}
function nMoveMenu(btn) {
  const n = N.cur; if (!n) return;
  const cur = folderOf(n)?.id;
  nPop(btn, `<div class="ctx-title">Klasöre taşı</div>${[N.root, ...subFolders()].filter(Boolean).map(f =>
    nItem(f.id, f.root ? IC.notepad : IC.folder, esc(folderName(f)), f.id === cur ? 'disabled' : '')).join('')}
    ${nItem('__new', IC.plus, 'Yeni klasör…')}`, async v => {
    if (v === '__new') { const id = await nFolderCreate(); if (id) nMoveTo(n, id); return; }
    nMoveTo(n, v);
  });
}
async function nMoveTo(n, folderId) {
  const from = folderOf(n)?.id;
  if (!folderId || folderId === from) return;
  n.labelIds = [folderId, ...n.labelIds.filter(x => x !== from)];
  const meta = N.all.find(x => x.id === n.id); if (meta) meta.labelIds = [...n.labelIds];
  try {
    if (realId(n.id) && !n.dirty) await NDB.modify(n.id, [folderId], from ? [from] : []);
    else if (n.id) { n.dirty = true; await nSave(n); }
  } catch (e) { if (!(e instanceof AuthError)) return toast('Taşınamadı: ' + e.message); }
  nRenderFolders(); nRenderList();
  if (N.cur === n) nRenderEditor();
  toast(`${folderName(N.folders.find(f => f.id === folderId))} klasörüne taşındı`);
}

/* ───────── Klasör yönetimi ───────── */
function nAsk(title, label, value = '', okText = 'Kaydet') {
  return new Promise(res => {
    $('#modal').innerHTML = `
    <div class="modal-bg"><div class="sheet nask">
      <header class="sheet-head"><button type="button" class="icon-btn" data-ask="x">${IC.close}</button><h3>${esc(title)}</h3></header>
      <form class="set-body" id="nAskForm">
        <label class="nask-l">${esc(label)}<input id="nAskIn" value="${esc(value)}" maxlength="60" autocomplete="off" required></label>
        <div class="sticky-actions"><button type="button" class="btn" data-ask="x">Vazgeç</button><button class="btn primary">${esc(okText)}</button></div>
      </form></div></div>`;
    const done = v => { closeModal(); res(v); };
    $('#nAskForm').addEventListener('submit', e => { e.preventDefault(); done($('#nAskIn').value.trim().replace(/\//g, '-')); });
    $('#modal').querySelectorAll('[data-ask="x"]').forEach(b => b.onclick = () => done(null));
    setTimeout(() => $('#nAskIn')?.focus(), 50);
  });
}
async function nFolderCreate() {
  const name = await nAsk('Yeni klasör', 'Klasörün adı', '', 'Oluştur');
  if (!name) return null;
  if (subFolders().some(f => f.name.toLocaleLowerCase('tr') === name.toLocaleLowerCase('tr'))) { toast('Bu adda bir klasör zaten var'); return null; }
  try {
    const id = await NDB.createFolder(`${N.root?.full || 'Notes'}/${name}`);
    N.folders.push({ id, name });
    nRenderFolders();
    toast(`"${name}" klasörü oluşturuldu · iPhone Notlar'da da görünür`);
    return id;
  } catch (e) { if (!(e instanceof AuthError)) toast('Klasör oluşturulamadı: ' + e.message); return null; }
}
function nFolderMenu(el) {
  const f = N.folders.find(x => x.id === el.dataset.id); if (!f) return;
  nPop(el, `<div class="ctx-title">${esc(f.name)}</div>${nItem('ren', IC.pen, 'Yeniden adlandır')}${nItem('del', IC.trash, 'Klasörü sil', 'data-danger')}`, async v => {
    if (v === 'ren') {
      const name = await nAsk('Klasörü yeniden adlandır', 'Yeni adı', f.name);
      if (!name || name === f.name) return;
      try { await NDB.renameFolder(f.id, `${N.root?.full || 'Notes'}/${name}`); f.name = name; nRenderFolders(); nRenderList(); toast('Klasörün adı değişti'); }
      catch (e) { if (!(e instanceof AuthError)) toast('Değiştirilemedi: ' + e.message); }
    }
    if (v === 'del') {
      const inside = N.all.filter(n => n.labelIds.includes(f.id));
      if (!confirm(`"${f.name}" klasörü silinsin mi?${inside.length ? ` İçindeki ${inside.length} not silinmez, Genel'e taşınır.` : ''}`)) return;
      try {
        for (const n of inside) { await NDB.modify(n.id, [N.root.id], [f.id]); n.labelIds = [N.root.id, ...n.labelIds.filter(x => x !== f.id)]; }
        await NDB.deleteFolder(f.id);
        N.folders = N.folders.filter(x => x !== f);
        N.view = 'all'; store.set('nFolder', 'all');
        nRenderFolders(); nRenderList();
        toast('Klasör silindi' + (inside.length ? ` · ${inside.length} not Genel'e taşındı` : ''));
      } catch (e) { if (!(e instanceof AuthError)) toast('Silinemedi: ' + e.message); }
    }
  });
}

/* ───────── Silinenler ve eski sürümler ─────────
   Her kayıtta notun eski hali çöpe gider. Aynı nota ait sürümler X-Universally-Unique-Identifier ile bulunur. */
async function nTrashAll() {
  const lists = await Promise.all(N.folders.map(f => NDB.list(f.id, true, 300)));
  const seen = new Set();
  return lists.flat().filter(n => !seen.has(n.id) && seen.add(n.id));
}
async function nLoadTrash() {
  const all = await nTrashAll();
  const live = new Set(N.all.map(n => n.uuid));
  const latest = new Map();
  for (const n of all) if (!live.has(n.uuid) && (!latest.has(n.uuid) || latest.get(n.uuid).date < n.date)) latest.set(n.uuid, n);
  N.trash = [...latest.values()];
  N.trashAll = all;
}
async function nRestore() {
  const n = N.cur; if (!n?.trashed) return;
  try {
    await NDB.untrash(n.id);
    N.trash = (N.trash || []).filter(x => x.id !== n.id);
    N.all.unshift({ ...n, labelIds: n.labelIds.filter(x => x !== 'TRASH') });
    N.cur = null; nEmptyReader(); setView('list');
    nRenderFolders(); nRenderList();
    toast(`"${n.title || 'Not'}" geri getirildi`);
  } catch (e) { if (!(e instanceof AuthError)) toast('Geri getirilemedi: ' + e.message); }
}
async function nVersions() {
  const n = N.cur; if (!n) return;
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nver"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Eski sürümler</h3></header>
    <div class="set-body"><div class="list-msg">Yükleniyor…</div></div></div></div>`;
  let vers;
  try { vers = (N.trashAll || await nTrashAll()).filter(x => x.uuid === n.uuid && x.id !== n.id).sort((a, b) => b.date - a.date).slice(0, 40); N.trashAll = N.trashAll || null; }
  catch (e) { if (!(e instanceof AuthError)) toast('Sürümler yüklenemedi: ' + e.message); closeModal(); return; }
  const body = $('.nver .set-body'); if (!body) return;
  if (!vers.length) { body.innerHTML = `<p class="muted">Bu notun kayıtlı eski sürümü yok. Eski sürümler 30 gün saklanır.</p>`; return; }
  body.innerHTML = `<div class="nver-wrap"><div class="nver-list">${vers.map((v, i) => `<button type="button" class="nver-item ${i === 0 ? 'on' : ''}" data-vid="${esc(v.id)}"><b>${fmtDate(v.date, true)}</b><span>${esc((v.snippet || '').slice(0, 70))}</span></button>`).join('')}</div>
    <div class="nver-prev"><div class="nver-doc" id="nVerDoc"></div><div class="sticky-actions"><button class="btn primary" id="nVerUse">${IC.restore}Bu sürüme dön</button></div></div></div>
    <p class="muted sm">Eski sürümler 30 gün saklanır. Bir sürüme dönünce şimdiki hali de eski sürümlere eklenir.</p>`;
  let pick = null;
  const show = async id => {
    body.querySelectorAll('.nver-item').forEach(b => b.classList.toggle('on', b.dataset.vid === id));
    const doc = $('#nVerDoc'); doc.innerHTML = '<div class="list-msg">Yükleniyor…</div>';
    try { pick = await NDB.get(id); doc.innerHTML = `<h3>${esc(pick.title)}</h3><div class="note-body readonly">${pick.html}</div>`; nWrapChecks(doc.querySelector('.note-body'), true); }
    catch (e) { doc.innerHTML = `<div class="list-msg">Açılamadı</div>`; }
  };
  body.querySelector('.nver-list').addEventListener('click', e => { const b = e.target.closest('[data-vid]'); if (b) show(b.dataset.vid); });
  $('#nVerUse').onclick = () => {
    if (!pick || N.cur !== n) return;
    n.title = pick.title; n.html = pick.html; n.dirty = true;
    closeModal(); nRenderEditor(); nSave(n);
    toast('Not seçtiğin sürüme döndü');
  };
  show(vers[0].id);
}

/* ───────── Hatırlatıcı (Google Takvim) ───────── */
function nRemind() {
  const n = N.cur; if (!n) return;
  const at = (dayOff, h, m = 0) => { const d = new Date(); d.setDate(d.getDate() + dayOff); d.setHours(h, m, 0, 0); return d; };
  const nextMon = () => { const d = at(2, 9); while (d.getDay() !== 1) d.setDate(d.getDate() + 1); return d; };   // en az iki gün sonraki pazartesi
  const later = new Date(Date.now() + 3600e3); later.setMinutes(later.getMinutes() < 30 ? 30 : 60, 0, 0);
  const opts = [['1 saat sonra', later], ...(new Date().getHours() < 19 ? [['Bu akşam 20:00', at(0, 20)]] : []), ['Yarın 09:00', at(1, 9)], ['Gelecek hafta', nextMon()]];
  const pad = x => String(x).padStart(2, '0');
  const local = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Hatırlatıcı</h3></header>
    <div class="set-body">
      <p class="muted sm">Google Takvim'ine bir etkinlik eklenir; zamanı gelince telefonun ve bilgisayarın Takvim bildirimi verir.</p>
      <div class="nrem-opts">${opts.map(([t, d]) => `<button type="button" class="btn" data-at="${d.getTime()}"><b>${t}</b><small>${esc(d.toLocaleString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }))}</small></button>`).join('')}</div>
      <label class="nask-l">Ya da tarih ve saat seç<input type="datetime-local" id="nRemAt" value="${local(at(1, 9))}" min="${local(new Date())}"></label>
      <div class="sticky-actions"><button class="btn primary" id="nRemOk">${IC.bell}Hatırlatıcı kur</button></div>
    </div></div></div>`;
  const set = async ms => {
    if (!(ms > Date.now())) return toast('Geçmiş bir zaman seçtin');
    if (n.dirty) await nSave(n);
    const text = htmlToText(n.html).replace(/\n{3,}/g, '\n\n').slice(0, 1500);
    const title = n.title.trim() || text.split('\n')[0].slice(0, 60) || 'Not';
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    try {
      const ev = await NDB.remind({ summary: '📝 ' + title, description: text + '\n\n— Notlar: ' + location.origin + location.pathname,
        start: { dateTime: new Date(ms).toISOString(), timeZone: tz }, end: { dateTime: new Date(ms + 15 * 60e3).toISOString(), timeZone: tz },
        reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 0 }] }, transparency: 'transparent' });
      closeModal();
      if (n.reminder?.ev) NDB.unremind(n.reminder.ev);          // eskisinin yerine
      n.reminder = { at: ms, ev: ev?.id || '' };
      n.dirty = true; nSave(n);
      if (N.cur === n) nRenderRem();
      toast(`Hatırlatıcı kuruldu · ${nWhen(ms)}`);
    } catch (e) {
      if (e instanceof AuthError) return;
      toast(/insufficient|scope|403/i.test(e.message) ? 'Takvim izni yok: çıkış yapıp tekrar girerken Takvim iznini de ver.' : 'Hatırlatıcı kurulamadı: ' + e.message);
    }
  };
  $('#modal').querySelectorAll('[data-at]').forEach(b => b.onclick = () => set(+b.dataset.at));
  $('#nRemOk').onclick = () => set(new Date($('#nRemAt').value).getTime());
}

/* ───────── Paylaşma ───────── */
function nShareMenu(btn) {
  const n = N.cur; if (!n) return;
  nPop(btn, `${nItem('mail', IC.mail, 'Mail olarak gönder…')}${nItem('pdf', IC.print, 'PDF olarak kaydet / yazdır')}${nItem('md', IC.download, 'Markdown (.md) olarak indir')}${nItem('copy', IC.copy, 'Metni kopyala')}
    ${navigator.share ? nItem('share', IC.share, 'Diğer uygulamalarla paylaş…') : ''}`, v => {
    const text = nPlain(n);
    if (v === 'copy') navigator.clipboard?.writeText(text).then(() => toast('Not panoya kopyalandı'), () => toast('Kopyalanamadı'));
    if (v === 'share') navigator.share({ title: n.title || 'Not', text }).catch(() => {});
    if (v === 'pdf') nPrint(n);
    if (v === 'md') nlExportMd(n);
    if (v === 'mail') nMailDialog(n);
  });
}
const nPlain = n => (n.title ? n.title + '\n\n' : '') + htmlToText(n.html).replace(/\n{3,}/g, '\n\n').trim();
function nMailDialog(n) {
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Notu mail olarak gönder</h3></header>
    <form class="set-body" id="nMailForm">
      <label class="nask-l">Kime<input id="nMailTo" type="text" inputmode="email" placeholder="ornek@gmail.com" autocomplete="email" required></label>
      <label class="nask-l">Konu<input id="nMailSubj" value="${esc(n.title || 'Not')}"></label>
      <div class="nmail-prev">${esc(nPlain(n).slice(0, 600))}${nPlain(n).length > 600 ? '…' : ''}</div>
      <div class="sticky-actions"><button type="button" class="btn" data-action="close-modal">Vazgeç</button><button class="btn primary">${IC.send}Gönder</button></div>
    </form></div></div>`;
  setTimeout(() => $('#nMailTo')?.focus(), 50);
  $('#nMailForm').addEventListener('submit', async e => {
    e.preventDefault();
    const to = $('#nMailTo').value.trim();
    if (!emailsIn(to).length) return toast('Geçerli bir e-posta adresi yaz');
    const b = e.submitter || $('#nMailForm .btn.primary'); b.disabled = true;
    try { await NDB.send({ to, subject: $('#nMailSubj').value.trim() || 'Not', body: nPlain(n) }); closeModal(); toast('Not gönderildi'); }
    catch (err) { b.disabled = false; if (!(err instanceof AuthError)) toast('Gönderilemedi: ' + err.message); }
  });
}
function nPrint(n) {
  const css = `@page{margin:18mm}body{font:15px/1.6 -apple-system,"Segoe UI",Roboto,sans-serif;color:#1b1d21;margin:0}h1{font-size:24px;margin:0 0 4px}
    .d{color:#777;font-size:12px;margin-bottom:18px}ul,ol{padding-left:22px}img{max-width:100%}`;
  const doc = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>${esc(n.title || 'Not')}</title><style>${css}</style></head>
    <body><h1>${esc(n.title || 'Not')}</h1><div class="d">${esc(fmtDate(n.date, true))}</div>${n.html}</body></html>`;
  const url = URL.createObjectURL(new Blob([doc], { type: 'text/html' }));
  const fr = document.createElement('iframe');
  fr.style.cssText = 'position:fixed;width:0;height:0;border:0;opacity:0';
  fr.src = url;
  fr.onload = () => { try { fr.contentWindow.focus(); fr.contentWindow.print(); } catch { toast('Yazdırma açılamadı'); } setTimeout(() => { fr.remove(); URL.revokeObjectURL(url); }, 60e3); };
  document.body.appendChild(fr);
  toast('Yazdırma penceresinde "PDF olarak kaydet"i seçebilirsin');
}

/* ───────── Diğer menüsü ───────── */
function nMoreMenu(btn) {
  const n = N.cur; if (!n) return;
  nPop(btn, `${nItem('move', IC.folder, 'Klasöre taşı…')}${nItem('find', IC.search, 'Bul ve değiştir')}${n.locked ? nItem('unlock', IC.lockI, 'Kilidi kaldır…') : nItem('lock', IC.lockI, 'Notu kilitle…')}${n.locked ? '' : nItem('ver', IC.history, 'Eski sürümler', n.id ? '' : 'disabled')}${nItem('del', IC.trash, 'Notu sil', 'data-danger')}`, v => {
    if (v === 'lock') nlLockNote();
    if (v === 'unlock') nlUnlockNote();
    if (v === 'move') nMoveMenu(btn);
    if (v === 'find') nFindOpen(true);
    if (v === 'ver') nVersions();
    if (v === 'del') nDelete();
  });
}
async function nDelete() {
  const n = N.cur; if (!n) return;
  clearTimeout(n.timer); n.dirty = false;
  N.cur = null;
  if (!realId(n.id) && n.id) { nQueueDel(n.uuid); N.all = N.all.filter(x => x.id !== n.id); }
  if (realId(n.id)) {
    try { await NDB.trash(n.id); } catch (e) { if (!(e instanceof AuthError)) toast('Silinemedi: ' + e.message); return; }
    N.all = N.all.filter(x => x.id !== n.id); N.trash = null; N.trashAll = null;
  }
  setView('list'); nEmptyReader(); nRenderFolders(); nRenderList();
  toast('Not silindi', realId(n.id) ? [['Geri al', async () => { await NDB.untrash(n.id); nLoad(); }]] : []);
}

/* ───────── Ayarlar: görünüm, hesap, hakkında ───────── */
function openNotesSettings() {
  const t = store.get('theme', 'light');
  $('#modal').innerHTML = `
  <div class="modal-bg">
    <div class="sheet settings">
      <header class="sheet-head">
        <button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button>
        <h3>Ayarlar</h3>
      </header>
      <div class="set-body">
        <section><h4>Görünüm</h4>
          <div class="seg yon-seg">${[['light', 'Cam'], ['dark', 'Koyu'], ['auto', 'Otomatik'], ['flat', 'Düz']].map(([k, n]) => `<button class="${t === k ? 'on' : ''}" data-action="notes-theme" data-t="${k}">${n}</button>`).join('')}</div>
        </section>
        <section><h4>Hesap</h4>
          <div class="set-row"><div><b>${esc(S.email || '')}</b><span>Notlar bu Gmail hesabındaki "Notes" etiketinde, klasörler "Notes/…" alt etiketlerinde saklanır</span></div>
            <button class="btn" data-action="logout">${IC.logout}Çıkış yap</button></div>
        </section>
        <section><h4>Uygulama</h4>${typeof aboutRow === 'function' ? aboutRow() : ''}</section>
      </div>
    </div>
  </div>`;
}

Object.assign(ACTIONS, {
  'notes-settings': () => openNotesSettings(),
  'notes-theme': el => { store.set('theme', el.dataset.t); applyTheme(el.dataset.t); openNotesSettings(); },
  compose: () => nNew(),
  'new-note': () => nNew(),
  'n-new': () => nNew(),
  'n-refresh': () => nLoad(),
  refresh: () => nLoad(),
  'open-drawer': () => {},
  'n-open': el => N.selMode ? nlToggleSel(el.dataset.id) : nOpen(el.dataset.id),
  'n-folder': async (el, e) => {
    if (e?.target.closest('.nchip-more')) return;
    const id = el.dataset.id;
    await nFlush();
    N.view = id; store.set('nFolder', id);
    setView('list'); nEmptyReader();
    nRenderFolders(); nRenderList();
    if (id === 'todos') nlTodosLoad();
    if (id === 'trash') { N.trash = null; nRenderList(); try { await nLoadTrash(); } catch (err) { if (!(err instanceof AuthError)) toast('Silinenler yüklenemedi: ' + err.message); N.trash = []; } if (N.view === 'trash') nRenderList(); }
  },
  'n-folder-menu': (el, e) => { e?.stopPropagation(); nFolderMenu(el); },
  'n-folder-new': async () => { const id = await nFolderCreate(); if (id) { N.view = id; store.set('nFolder', id); nRenderFolders(); nRenderList(); } },
  'n-pin': () => nTogglePin(),
  'n-color': el => nColorMenu(el),
  'n-remind': () => nRemind(),
  'n-share': el => nShareMenu(el),
  'n-more': el => nMoreMenu(el),
  'n-move': el => nMoveMenu(el),
  'n-restore': () => nRestore()
});

/* ───────── Şablonlar ───────── */
const NTPL = [
  ['Alışveriş listesi', () => ['Alışveriş listesi', '<div>☐ </div><div>☐ </div><div>☐ </div>']],
  ['Yapılacaklar', () => ['Yapılacaklar', '<h2>Bugün</h2><div>☐ </div><div>☐ </div><h2>Bu hafta</h2><div>☐ </div>']],
  ['Toplantı notu', () => ['Toplantı · ' + new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }), '<h2>Katılanlar</h2><div><br></div><h2>Konuşulanlar</h2><ul><li><br></li></ul><h2>Kararlar ve görevler</h2><div>☐ </div>']],
  ['Günlük', () => [new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' }), '<h2>Bugün neler oldu?</h2><div><br></div><h2>İyi giden bir şey</h2><div><br></div><h2>Yarın için</h2><div>☐ </div><div>#günlük</div>']],
  ['Tarif', () => ['Tarif', '<h2>Malzemeler</h2><ul><li><br></li></ul><h2>Yapılışı</h2><ol><li><br></li></ol><div>#tarif</div>']],
  ['Seyahat', () => ['Seyahat planı', '<h2>Ulaşım</h2><div><br></div><h2>Konaklama</h2><div><br></div><h2>Yanıma alacaklarım</h2><div>☐ Kimlik / pasaport</div><div>☐ Şarj aleti</div><div>☐ </div><div>#seyahat</div>']]
];
function nUseTemplate(i) {
  const n = N.cur; if (!n) return;
  const [title, html] = NTPL[+i][1]();
  n.title = title; n.html = html; n.dirty = true;
  nRenderEditor();
  const bo = $('#noteBody');
  const first = bo?.querySelector('.nchk')?.nextSibling || bo?.querySelector('li, div');
  if (bo) { bo.focus(); const r = document.createRange(); if (first?.nodeType === 3) { r.setStart(first, first.nodeValue.length); } else if (first) { r.selectNodeContents(first); r.collapse(false); } const sl = getSelection(); sl.removeAllRanges(); sl.addRange(r); }
  n.changed?.();
}

/* ───────── Yazarken kısayollar: "- ", "* ", "1. ", "[] ", "[x] ", "# " ───────── */
function nMarkdown(e, bo) {
  if (e.inputType !== 'insertText' || e.data !== ' ') return;
  const sel = getSelection(); if (!sel.isCollapsed) return;
  const b = nBlock(bo); if (!b || b.nodeName === 'LI' || firstChk(b)) return;
  const r = document.createRange(); r.setStart(b, 0); r.setEnd(sel.anchorNode, sel.anchorOffset);
  const before = r.toString().replace(/ /g, ' ');
  const kind = /^[-*•] $/.test(before) ? 'ul' : /^1[.)] $/.test(before) ? 'ol' : /^\[ ?\] $/.test(before) ? 'todo' : /^\[[xX]\] $/.test(before) ? 'done' : /^#{1,3} $/.test(before) ? 'h' : null;
  if (!kind) return;
  r.deleteContents();
  if (!b.textContent && !b.querySelector('br')) b.appendChild(document.createElement('br'));
  const c = document.createRange(); c.setStart(b, 0); c.collapse(true); sel.removeAllRanges(); sel.addRange(c);
  if (kind === 'ul') document.execCommand('insertUnorderedList');
  if (kind === 'ol') document.execCommand('insertOrderedList');
  if (kind === 'h') document.execCommand('formatBlock', false, 'h2');
  if (kind === 'todo' || kind === 'done') { nAddChk(b); if (kind === 'done') { const k = firstChk(b); k.dataset.on = '1'; k.textContent = CHK_ON; } }
}

/* ───────── Sesle yazma (Chrome, Edge, Android; iPhone'da Safari 14.5+) ───────── */
const NSR = !DESKTOP && (window.SpeechRecognition || window.webkitSpeechRecognition) || null;
let nRec = null;
function nDictate(btn, bo, changed) {
  if (nRec) { nRec.stop(); return; }
  const rec = new NSR();
  rec.lang = 'tr-TR'; rec.continuous = true; rec.interimResults = false;
  rec.onresult = e => {
    let txt = '';
    for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) txt += e.results[i][0].transcript;
    if (!txt.trim()) return;
    if (document.activeElement !== bo) bo.focus();
    const before = (() => { const s = getSelection(); if (!s.rangeCount) return ''; const r = s.getRangeAt(0).cloneRange(); r.setStart(bo, 0); return r.toString(); })();
    txt = txt.trim();
    if (!before.trim() || /[.!?]\s*$/.test(before)) txt = txt.charAt(0).toLocaleUpperCase('tr') + txt.slice(1);
    document.execCommand('insertText', false, (before && !/\s$/.test(before) ? ' ' : '') + txt);
    changed();
  };
  rec.onerror = e => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed') toast('Mikrofon izni verilmedi. Tarayıcı ayarlarından bu siteye mikrofon izni ver.'); else if (e.error !== 'no-speech' && e.error !== 'aborted') toast('Sesle yazma durdu: ' + e.error); };
  rec.onend = () => { nRec = null; btn.classList.remove('rec'); btn.title = 'Sesle yaz'; };
  try { rec.start(); nRec = rec; btn.classList.add('rec'); btn.title = 'Dinliyorum… durdurmak için bas'; bo.focus(); toast('Dinliyorum, konuşabilirsin'); }
  catch { toast('Sesle yazma başlatılamadı'); }
}

/* ───────── Görünüm ve sıralama ───────── */
function nViewMenu(btn) {
  const ck = on => on ? IC.check : '<i></i>';
  nPop(btn, `<div class="ctx-title">Görünüm</div>${nItem('list', ck(!N.grid), 'Liste')}${nItem('grid', ck(N.grid), 'Kartlar')}
    <div class="ctx-sep"></div><div class="ctx-title">Sırala</div>${nItem('date', ck(N.sort === 'date'), 'Son düzenlenen')}${nItem('created', ck(N.sort === 'created'), 'Oluşturulma tarihi')}${nItem('title', ck(N.sort === 'title'), 'Başlık (A–Z)')}`, v => {
    if (v === 'list' || v === 'grid') { N.grid = v === 'grid'; store.set('nGrid', N.grid); }
    else { N.sort = v; store.set('nSort', v); }
    nRenderList();
  });
}

/* ───────── Çevrimdışı ─────────
   Liste ve son açılan notlar bu cihazda saklanır (çıkış yapınca silinir).
   İnternet yokken kaydedilen notlar sıraya girer; bağlantı gelince Gmail'e yazılır. */
const nNetErr = e => !(e instanceof AuthError) && (e instanceof TypeError || /Failed to fetch|NetworkError|Load failed|network/i.test(e?.message || '') || !navigator.onLine);
function nSetOffline(on) {
  N.offline = on;
  const el = $('#nOffline'); if (el) el.hidden = !on;
}
function nFromCache() {
  const c = store.get('nCache');
  if (!c?.all) return false;
  N.folders = c.folders || []; N.root = N.folders.find(f => f.root); N.all = c.all;
  if (N.view === 'trash') N.view = 'all';
  return true;
}
function nCacheBody(n) {
  if (!n?.id) return;
  const b = store.get('nBodies', {});
  if (n.enc) b[n.id] = { enc: n.enc, html: '', title: '', color: n.color || '', created: n.created || '', t: Date.now() }; else
  b[n.id] = { html: String(n.html || '').replace(/src="data:image\/[^"]{2000,}"/g, 'src="" alt="(resim çevrimdışıyken gösterilmez)"'), title: n.title, color: n.color || '', created: n.created || '', t: Date.now() };
  const keys = Object.keys(b).sort((x, y) => b[y].t - b[x].t);
  for (const k of keys.slice(80)) delete b[k];
  try { store.set('nBodies', b); } catch {}
}
function nCachedBody(id) { const b = store.get('nBodies', {})[id]; return b ? { ...b, id } : null; }
const nQueue = () => store.get('nQueue', {});
function nQueuePut(n) {
  const q = nQueue();
  const prev = q[n.uuid];
  q[n.uuid] = { uuid: n.uuid, created: n.created, title: n.locked ? '' : n.title, html: n.locked ? '' : n.html, locked: !!n.locked, enc: n.locked ? n.enc : '', color: n.color, pinned: n.pinned,
    folder: folderOf(n)?.id || N.root?.id, oldId: prev ? prev.oldId : (n.id && !String(n.id).startsWith('q:') ? n.id : null), t: Date.now() };
  store.set('nQueue', q);
  n.id = 'q:' + n.uuid; n.date = Date.now(); n.dirty = false;
  nApplyQueue();
}
function nQueueDel(uuid) { const q = nQueue(); if (q[uuid]) { delete q[uuid]; store.set('nQueue', q); } }
// Bekleyen notları listeye yansıt
function nApplyQueue() {
  const q = nQueue();
  for (const e of Object.values(q)) {
    N.all = N.all.filter(x => x.uuid !== e.uuid);
    N.all.unshift({ id: 'q:' + e.uuid, uuid: e.uuid, locked: !!e.locked, links: [], title: e.locked ? 'Kilitli not' : e.title || htmlToText(e.html).split('\n')[0].slice(0, 80) || 'Yeni not', snippet: htmlToText(e.html).replace(/\s+/g, ' ').slice(0, 140),
      date: e.t, created: Date.parse(e.created) || e.t, labelIds: [e.folder, ...(e.pinned ? ['STARRED'] : [])], pinned: e.pinned, color: e.color, tags: tagsIn(e.title + ' ' + htmlToText(e.html)), pending: true });
    nCacheBody({ id: 'q:' + e.uuid, html: e.html, title: e.title, color: e.color, created: e.created, enc: e.enc });
  }
}
let nFlushing = false;
async function nFlushQueue() {
  if (nFlushing || !navigator.onLine) return;
  const items = Object.values(nQueue());
  if (!items.length) return;
  nFlushing = true;
  let done = 0;
  for (const e of items) {
    try {
      const { raw, title, tags, links } = nBuildRaw({ ...e, labelIds: [e.folder] });
      const labelIds = [e.folder || N.root?.id, ...(e.pinned ? ['STARRED'] : [])].filter(Boolean);
      const res = await NDB.insert(raw, labelIds);
      if (e.oldId) await NDB.trash(e.oldId).catch(() => {});
      nQueueDel(e.uuid);
      N.all = N.all.filter(x => x.uuid !== e.uuid);
      N.all.unshift({ id: res.id, uuid: e.uuid, title, locked: !!e.locked, links, snippet: e.locked ? '' : htmlToText(e.html).replace(/\s+/g, ' ').slice(0, 140), date: Date.now(), created: Date.parse(e.created) || Date.now(), labelIds, pinned: e.pinned, color: e.color, tags });
      nCacheBody({ id: res.id, html: e.html, title, color: e.color, created: e.created, enc: e.enc });
      if (N.cur?.uuid === e.uuid && !N.cur.dirty) { N.cur.id = res.id; nStatus('Kaydedildi'); }
      done++;
    } catch (err) { if (nNetErr(err)) break; }
  }
  nFlushing = false;
  if (done) { nSetOffline(false); nRenderFolders(); nRenderList(); toast(`Çevrimdışı yazdığın ${done} not kaydedildi`); }
}
window.addEventListener('online', () => { if ($('.notes-shell')) { nFlushQueue(); if (N.offline) nLoad(); } });
window.addEventListener('offline', () => { if ($('.notes-shell')) nSetOffline(true); });

/* ───────── Hızlı not ve paylaşım ─────────
   Ana ekran simgesine basılı tutunca "Yeni not" (Android, bilgisayar) → notlar.html?yeni
   Android'de başka bir uygulamadan "Paylaş → Notlar" → notlar.html?paylas&title=…&text=…&url=… */
// Giriş gerekirse adres kaybolmasın diye istek önce bu sekmede saklanır
(() => {
  const u = new URLSearchParams(location.search);
  if (u.has('yeni') || u.has('text') || u.has('url') || u.has('title') || u.has('not')) {
    try { sessionStorage.setItem('nIntent', JSON.stringify({ yeni: u.has('yeni'), not: u.get('not') || '', paylas: u.has('text') || u.has('url') || u.has('title'), title: u.get('title') || '', text: u.get('text') || '', url: u.get('url') || '' })); } catch {}
    history.replaceState(null, '', location.pathname + (DEMO ? '?demo' : ''));
  }
})();
function nAfterStart() {
  let it = null;
  try { it = JSON.parse(sessionStorage.getItem('nIntent') || 'null'); sessionStorage.removeItem('nIntent'); } catch {}
  if (!it) return;
  if (it.not) return nOpenUuid(it.not);              // Pano'dan "Notlar'da aç"
  const u = { has: k => k === 'paylas' ? it.paylas : !!it[k], get: k => it[k] };
  nNew();
  if (u.has('paylas')) {
    const t = (u.get('title') || '').trim(), x = (u.get('text') || '').trim(), l = (u.get('url') || '').trim();
    const parts = [x, l && !x.includes(l) ? l : ''].filter(Boolean).join('\n');
    N.cur.title = t; N.cur.html = textToHtml(parts); N.cur.dirty = true;
    nRenderEditor(true);
    N.cur.changed?.();
    toast('Paylaştığın içerik yeni nota eklendi');
  }
}

Object.assign(ACTIONS, {
  'n-view': el => nViewMenu(el),
  'n-tag': el => { N.tag = N.tag === el.dataset.tag ? null : el.dataset.tag; nRenderList(); },
  'n-tpl': el => nUseTemplate(el.dataset.i)
});

/* ═════════ Notlar 3 ═════════ */
Object.assign(IC, {
  table: svg('<rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M3.5 10h17M3.5 14.5h17M9.5 5v14M15 5v14"/>'),
  image: svg('<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m4 17 5-4.5 3.5 3 2.5-2 5 3.5"/>'),
  linkI: svg('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
  chevU: svg('<path d="m6 14.5 6-6 6 6"/>'),
  chevD: svg('<path d="m6 9.5 6 6 6-6"/>'),
  download: svg('<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M5 19h14"/>'),
  upload: svg('<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5"/><path d="M5 19h14"/>'),
  keyboard: svg('<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6 10h1M9.5 10h1M13 10h1M16.5 10h1M6 14h1M9 14h6M17 14h1"/>')
});
const nWhen = ms => {
  const d = new Date(ms), now = new Date();
  const day = (x => { const a = new Date(x); a.setHours(0, 0, 0, 0); return a; });
  const diff = Math.round((day(d) - day(now)) / 864e5);
  const hm = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  if (diff === 0) return 'Bugün ' + hm;
  if (diff === 1) return 'Yarın ' + hm;
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', ...(diff > 6 || diff < 0 ? {} : { weekday: 'short' }) }) + ' ' + hm;
};

/* ───────── Hatırlatıcıyı notta göster ───────── */
function nRenderRem() {
  const el = $('#nRemChip'), n = N.cur; if (!el || !n) return;
  const r = n.reminder;
  el.innerHTML = r?.at ? `<span class="nfolder-tag big nrem ${r.at < Date.now() ? 'past' : ''}" data-action="n-remind" title="Hatırlatıcıyı değiştir">${IC.bell}${esc(nWhen(r.at))}${r.at < Date.now() ? ' · geçti' : ''}<span class="nrem-x" data-action="n-unremind" title="Hatırlatıcıyı kaldır">${IC.close}</span></span>` : '';
}
async function nUnremind() {
  const n = N.cur; if (!n?.reminder) return;
  const ev = n.reminder.ev;
  n.reminder = null; n.dirty = true; nSave(n); nRenderRem();
  if (ev) NDB.unremind(ev);
  toast('Hatırlatıcı kaldırıldı');
}

/* ───────── Kelime ve karakter sayısı ───────── */
function nCount() {
  const el = $('#nCount'), bo = $('#noteBody'); if (!el || !bo) return;
  const t = (($('#noteTitle')?.value || '') + '\n' + bo.innerText).replace(/[☐☑]/g, ' ');
  const words = (t.match(/[\p{L}\p{N}]+(?:['’.-][\p{L}\p{N}]+)*/gu) || []).length;
  const chars = t.replace(/\s/g, '').length;
  el.textContent = words ? `${words.toLocaleString('tr-TR')} kelime · ${chars.toLocaleString('tr-TR')} karakter` : '';
}

/* ───────── Bul ve değiştir ───────── */
const NF = { hits: [], i: 0 };
function nFindRanges(bo, q) {
  const out = []; if (!q) return out;
  const k = q.toLocaleLowerCase('tr');
  const w = document.createTreeWalker(bo, NodeFilter.SHOW_TEXT, { acceptNode: t => t.parentElement.closest('.nchk') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
  while (w.nextNode()) {
    const t = w.currentNode, low = t.nodeValue.toLocaleLowerCase('tr');
    let i = 0;
    while ((i = low.indexOf(k, i)) !== -1) { const r = document.createRange(); r.setStart(t, i); r.setEnd(t, i + q.length); out.push(r); i += q.length; }
  }
  return out;
}
function nFindPaint() {
  const bo = $('#noteBody'), q = $('#nFindQ')?.value || '';
  NF.hits = bo ? nFindRanges(bo, q) : [];
  if (NF.i >= NF.hits.length) NF.i = 0;
  if (window.CSS?.highlights) {
    CSS.highlights.set('nfind', new Highlight(...NF.hits));
    if (NF.hits[NF.i]) CSS.highlights.set('nfind-cur', new Highlight(NF.hits[NF.i])); else CSS.highlights.delete('nfind-cur');
  }
  const n = $('#nFindN'); if (n) n.textContent = q ? (NF.hits.length ? `${NF.i + 1}/${NF.hits.length}` : '0') : '';
  const r = NF.hits[NF.i];
  if (r) { const rect = r.getBoundingClientRect(), sc = $('.note-view'); if (sc && rect.top) { const box = sc.getBoundingClientRect(); if (rect.top < box.top + 40 || rect.bottom > box.bottom - 40) sc.scrollTop += rect.top - box.top - box.height / 3; } }
}
function nFindOpen(replace) {
  const bar = $('#nFind'); if (!bar) return;
  bar.hidden = false; bar.classList.toggle('rep', !!replace || window.innerWidth > 700);
  const sel = getSelection().toString().trim();
  if (sel && sel.length < 60 && !sel.includes('\n')) $('#nFindQ').value = sel;
  $('#nFindQ').focus(); $('#nFindQ').select(); nFindPaint();
}
function nFindClose() {
  const bar = $('#nFind'); if (bar) bar.hidden = true;
  if (window.CSS?.highlights) { CSS.highlights.delete('nfind'); CSS.highlights.delete('nfind-cur'); }
  $('#noteBody')?.focus();
}
function nFindInit(bo, changed) {
  const bar = $('#nFind'); if (!bar) return;
  const q = $('#nFindQ'), rp = $('#nFindR');
  q.addEventListener('input', () => { NF.i = 0; nFindPaint(); });
  const step = d => { if (!NF.hits.length) return; NF.i = (NF.i + d + NF.hits.length) % NF.hits.length; nFindPaint(); };
  const one = () => {
    const r = NF.hits[NF.i]; if (!r) return;
    r.deleteContents(); r.insertNode(document.createTextNode(rp.value));
    bo.normalize(); changed(); nFindPaint();
  };
  const all = () => {
    const hits = nFindRanges(bo, q.value); if (!hits.length) return;
    for (const r of hits.reverse()) { r.deleteContents(); r.insertNode(document.createTextNode(rp.value)); }
    bo.normalize(); changed(); NF.i = 0; nFindPaint();
    toast(`${hits.length} yerde değiştirildi`);
  };
  bar.addEventListener('mousedown', e => { if (e.target.closest('button')) e.preventDefault(); });
  bar.addEventListener('click', e => {
    const b = e.target.closest('[data-find]'); if (!b) return;
    const a = b.dataset.find;
    if (a === 'next') step(1); if (a === 'prev') step(-1); if (a === 'one') one(); if (a === 'all') all(); if (a === 'close') nFindClose();
  });
  q.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); step(e.shiftKey ? -1 : 1); } if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); nFindClose(); } });
  rp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); one(); } if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); nFindClose(); } });
}

/* ───────── Fotoğraf ekleme ─────────
   Resim küçültülüp (en fazla 1280 px, JPEG) notun içine gömülür. */
function nPickImage(bo, changed) {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*'; inp.multiple = true;
  const sel = getSelection(); const keep = sel.rangeCount && bo.contains(sel.anchorNode) ? sel.getRangeAt(0).cloneRange() : null;
  inp.onchange = async () => {
    const files = [...inp.files].slice(0, 6);
    if (!files.length) return;
    toast('Resim ekleniyor…');
    let html = '';
    for (const f of files) {
      try { html += `<div><img src="${await nShrink(f)}" alt="${esc(f.name.replace(/\.[^.]+$/, ''))}"></div>`; }
      catch { toast(`${f.name} eklenemedi`); }
    }
    if (!html) return;
    bo.focus();
    if (keep) { const s = getSelection(); s.removeAllRanges(); s.addRange(keep); }
    document.execCommand('insertHTML', false, html + '<div><br></div>');
    if (bo.innerHTML.length > 4.5e6) toast('Not çok büyüdü; daha fazla resim eklersen kaydedilemeyebilir.');
    changed();
  };
  inp.click();
}
function nShrink(file, max = 1280) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      res(c.toDataURL('image/jpeg', 0.78));
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('resim')); };
    img.src = url;
  });
}

/* ───────── Notlar arası bağlantı ─────────
   Bağlantı "#not:<kimlik>" adresiyle saklanır; tıklayınca o not açılır. "[[" yazınca da seçici açılır. */
function nOpenUuid(uuid) {
  const t = N.all.find(x => x.uuid === uuid);
  if (!t) return toast('Bu not bulunamadı; silinmiş olabilir.');
  if (N.view !== 'all' && !t.labelIds.includes(N.view)) { N.view = 'all'; store.set('nFolder', 'all'); nRenderFolders(); }
  nOpen(t.id);
}
function nLinkTrigger(bo, changed) {
  const s = getSelection(); if (!s.isCollapsed || s.anchorNode?.nodeType !== 3) return;
  const t = s.anchorNode, o = s.anchorOffset;
  if (t.nodeValue.slice(Math.max(0, o - 2), o) !== '[[') return;
  t.nodeValue = t.nodeValue.slice(0, o - 2) + t.nodeValue.slice(o);
  const r = document.createRange(); r.setStart(t, o - 2); r.collapse(true); s.removeAllRanges(); s.addRange(r);
  const rect = r.getBoundingClientRect();
  const anchor = { getBoundingClientRect: () => ({ left: rect.left, right: rect.left + 280, top: rect.top, bottom: rect.bottom }) };
  nLinkPicker(anchor, bo, changed);
}
function nLinkPicker(anchor, bo, changed) {
  const sel = getSelection(); const keep = sel.rangeCount && bo.contains(sel.anchorNode) ? sel.getRangeAt(0).cloneRange() : null;
  const cur = N.cur;
  const pool = N.all.filter(x => x.uuid !== cur?.uuid);
  const m = nPop(anchor, `<div class="ctx-title">Nota bağlantı</div><input class="nlink-q" placeholder="Not ara…" autocomplete="off"><div class="nlink-list"></div>`, () => {});
  const q = m.querySelector('.nlink-q'), list = m.querySelector('.nlink-list');
  const draw = () => {
    const k = q.value.trim().toLocaleLowerCase('tr');
    const items = pool.filter(x => !k || (x.title + ' ' + x.snippet).toLocaleLowerCase('tr').includes(k)).sort((a, b) => b.date - a.date).slice(0, 8);
    list.innerHTML = items.map((x, i) => `<button type="button" class="ctx-item ${i === 0 ? 'kb' : ''}" data-u="${esc(x.uuid)}">${IC.notepad}<span>${esc(x.title || 'Yeni not')}</span></button>`).join('') || '<div class="nlink-empty">Not bulunamadı</div>';
  };
  const pick = uuid => {
    const t = pool.find(x => x.uuid === uuid); if (!t) return;
    m.remove(); bo.focus();
    if (keep) { const s = getSelection(); s.removeAllRanges(); s.addRange(keep); }
    document.execCommand('insertHTML', false, `<a href="#not:${esc(t.uuid)}">${esc(t.title || 'Not')}</a>&nbsp;`);
    changed();
  };
  list.addEventListener('click', e => { const b = e.target.closest('[data-u]'); if (b) { e.stopPropagation(); pick(b.dataset.u); } });
  q.addEventListener('input', draw);
  q.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); const b = list.querySelector('[data-u]'); if (b) pick(b.dataset.u); }
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); m.remove(); bo.focus(); if (keep) { const s = getSelection(); s.removeAllRanges(); s.addRange(keep); } }
  });
  draw(); setTimeout(() => q.focus(), 0);
}

/* ───────── Tablo ───────── */
function nTable(cmd, bo, changed) {
  const cell = getSelection().anchorNode && (getSelection().anchorNode.nodeType === 1 ? getSelection().anchorNode : getSelection().anchorNode.parentElement)?.closest?.('td, th');
  const inT = cell && bo.contains(cell);
  if (cmd === 'table') {
    if (document.activeElement !== bo) bo.focus();
    const row = n => `<tr>${'<td><br></td>'.repeat(n)}</tr>`;
    const mark = 'nt' + Date.now();
    document.execCommand('insertHTML', false, `<table data-new="${mark}"><tbody>${row(3)}${row(3)}${row(3)}</tbody></table><div><br></div>`);
    const t = bo.querySelector(`table[data-new="${mark}"]`);
    if (t) { t.removeAttribute('data-new'); const r = document.createRange(); r.selectNodeContents(t.rows[0].cells[0]); r.collapse(true); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
  } else if (inT) {
    const tr = cell.parentElement, table = cell.closest('table');
    if (cmd === 'row') { const nr = tr.cloneNode(true); nr.querySelectorAll('td, th').forEach(c => { c.innerHTML = '<br>'; }); tr.after(nr); }
    if (cmd === 'col') { const idx = [...tr.children].indexOf(cell); table.querySelectorAll('tr').forEach(r => { const c = document.createElement(r.children[idx]?.nodeName.toLowerCase() || 'td'); c.innerHTML = '<br>'; (r.children[idx] || r.lastElementChild).after(c); }); }
    if (cmd === 'deltbl') { if (!confirm('Tablo silinsin mi?')) return; table.remove(); }
  }
  changed(); nToolState();
}
document.addEventListener('selectionchange', () => {
  const tt = $('#nTblTools'); if (!tt) return;
  const a = getSelection().anchorNode, el = a && (a.nodeType === 1 ? a : a.parentElement);
  tt.hidden = !(el?.closest?.('#noteBody td, #noteBody th'));
});

/* ───────── Klavye kısayolları ───────── */
const NKEYS = [
  ['Alt + N', 'Yeni not'], ['Ctrl + K  ya da  /', 'Notlarda ara'], ['Ctrl + F', 'Notta bul'], ['Ctrl + H', 'Bul ve değiştir'],
  ['Ctrl + S', 'Şimdi kaydet'], ['Ctrl + B / I / U', 'Kalın, italik, altı çizili'], ['Ctrl + Shift + L', 'Yapılacaklar kutusu'],
  ['Ctrl + Shift + 7 / 8', 'Numaralı / madde işaretli liste'], ['Ctrl + Alt + 1', 'Başlık'], ['[[', 'Başka bir nota bağlantı'],
  ['Alt + ↑ / ↓', 'Önceki / sonraki not'], ['Esc', 'Notu kapat, listeye dön']
];
document.addEventListener('keydown', e => {
  if (!$('.notes-shell') || $('#modal').innerHTML || e.defaultPrevented) return;
  const k = e.key.toLowerCase(), ctrl = e.ctrlKey || e.metaKey;
  const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
  const bo = $('#noteBody');
  if (e.altKey && !ctrl && e.code === 'KeyN') { e.preventDefault(); return nNew(); }
  if ((ctrl && k === 'k') || (!typing && k === '/')) { e.preventDefault(); const s = $('#nSearch'); if (matchMedia('(max-width: 800px)').matches && S.view === 'thread') closeReader(); s?.focus(); s?.select(); return; }
  if (ctrl && k === 's') { e.preventDefault(); if (N.cur) { N.cur.dirty = true; nSave(N.cur); } return; }
  if (bo && ctrl && (k === 'f' || k === 'h') && !e.shiftKey) { e.preventDefault(); return nFindOpen(k === 'h'); }
  if (bo && document.activeElement === bo && ctrl && e.shiftKey && (k === 'l' || e.code === 'Digit7' || e.code === 'Digit8')) {
    e.preventDefault();
    return nCmd(k === 'l' ? 'todo' : e.code === 'Digit7' ? 'insertOrderedList' : 'insertUnorderedList', bo, N.cur?.changed || (() => {}));
  }
  if (bo && document.activeElement === bo && ctrl && e.altKey && e.code === 'Digit1') { e.preventDefault(); return nCmd('h2', bo, N.cur?.changed || (() => {})); }
  if (e.altKey && (k === 'arrowdown' || k === 'arrowup')) {
    e.preventDefault();
    const list = nVisible(); if (!list.length) return;
    const i = list.findIndex(x => x.id === N.cur?.id);
    const j = i < 0 ? 0 : Math.min(list.length - 1, Math.max(0, i + (k === 'arrowdown' ? 1 : -1)));
    return nOpen(list[j].id);
  }
  if (k === 'escape' && N.cur && !$('.npop') && $('#nFind')?.hidden !== false) { if (typing) document.activeElement.blur(); if (matchMedia('(max-width: 800px)').matches) ACTIONS.back(); else closeReader(); }
});

/* ───────── Yedek alma: bütün notlar tek zip ───────── */
const NCRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const nCrc = b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = NCRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
function nZip(files) {            // sıkıştırmasız zip, UTF-8 adlar
  const enc = new TextEncoder(), parts = [], cdir = [];
  let off = 0;
  for (const f of files) {
    const name = enc.encode(f.name), data = typeof f.data === 'string' ? enc.encode(f.data) : f.data, crc = nCrc(data);
    const d = new Date(f.date || Date.now());
    const dt = ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xffff, dd = (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xffff;
    const h = new DataView(new ArrayBuffer(30));
    [[0, 0x04034b50, 4], [4, 20, 2], [6, 0x0800, 2], [8, 0, 2], [10, dt, 2], [12, dd, 2], [14, crc, 4], [18, data.length, 4], [22, data.length, 4], [26, name.length, 2], [28, 0, 2]]
      .forEach(([o, v, n]) => n === 4 ? h.setUint32(o, v, true) : h.setUint16(o, v, true));
    parts.push(new Uint8Array(h.buffer), name, data);
    const c = new DataView(new ArrayBuffer(46));
    [[0, 0x02014b50, 4], [4, 20, 2], [6, 20, 2], [8, 0x0800, 2], [10, 0, 2], [12, dt, 2], [14, dd, 2], [16, crc, 4], [20, data.length, 4], [24, data.length, 4], [28, name.length, 2], [30, 0, 2], [32, 0, 2], [34, 0, 2], [36, 0, 2], [38, 0, 4], [42, off, 4]]
      .forEach(([o, v, n]) => n === 4 ? c.setUint32(o, v, true) : c.setUint16(o, v, true));
    cdir.push(new Uint8Array(c.buffer), name);
    off += 30 + name.length + data.length;
  }
  const size = cdir.reduce((a, b) => a + b.length, 0);
  const e = new DataView(new ArrayBuffer(22));
  [[0, 0x06054b50, 4], [8, files.length, 2], [10, files.length, 2], [12, size, 4], [16, off, 4]].forEach(([o, v, n]) => n === 4 ? e.setUint32(o, v, true) : e.setUint16(o, v, true));
  return new Blob([...parts, ...cdir, new Uint8Array(e.buffer)], { type: 'application/zip' });
}
async function nBackup() {
  if (!N.all.length) return toast('Yedeklenecek not yok');
  const list = N.all.filter(x => realId(x.id));
  const safe = s => (s || 'Not').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-').replace(/\s+/g, ' ').trim().slice(0, 80) || 'Not';
  let done = 0;
  const prog = () => toast(`Yedek hazırlanıyor… ${done}/${list.length}`, [], 60000);
  prog();
  const files = [], used = new Set();
  try {
    await pmap(list, 4, async m => {
      const full = await NDB.get(m.id);
      const f = folderOf(m);
      const dir = f && !f.root ? safe(f.name) + '/' : '';
      let name = dir + safe(m.title), i = 2;
      while (used.has(name.toLocaleLowerCase('tr'))) name = dir + safe(m.title) + ` (${i++})`;
      used.add(name.toLocaleLowerCase('tr'));
      const doc = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>${esc(m.title || 'Not')}</title>
<style>body{font:15px/1.6 -apple-system,"Segoe UI",Roboto,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;color:#1b1d21}img{max-width:100%}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:4px 8px}.d{color:#777;font-size:13px}</style></head>
<body><h1>${esc(m.title || 'Not')}</h1><p class="d">${esc(new Date(m.date).toLocaleString('tr-TR'))}${m.tags?.length ? ' · ' + m.tags.map(t => '#' + esc(t)).join(' ') : ''}</p>${full.html}</body></html>`;
      files.push({ name: name + '.html', data: doc, date: m.date });
      done++; if (done % 5 === 0) prog();
    });
  } catch (e) { if (!(e instanceof AuthError)) toast('Yedek alınamadı: ' + e.message); return; }
  files.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  files.unshift({ name: 'BENİOKU.txt', data: `Notlar yedeği · ${new Date().toLocaleString('tr-TR')}\r\n${files.length} not. Her not ayrı bir .html dosyası; tarayıcıda ya da Word'de açılır.\r\nKlasörler ayrı klasörlerde, Genel'dekiler en üstte.\r\n` });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(nZip(files));
  a.download = `Notlar-yedek-${new Date().toISOString().slice(0, 10)}.zip`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 60e3);
  toast(`Yedek indirildi · ${files.length - 1} not`);
}

/* ───────── Google Keep'ten taşıma ─────────
   takeout.google.com → sadece "Keep" seç → indirdiğin zip'i (ya da içindeki .json dosyalarını) seç.
   Notlar "Keep" klasörüne gelir; renk, sabitleme, etiket (#etiket olarak), yapılacaklar ve tarih korunur. */
async function nUnzip(buf) {
  const v = new DataView(buf), u8 = new Uint8Array(buf), out = [];
  let e = buf.byteLength - 22;
  while (e >= 0 && v.getUint32(e, true) !== 0x06054b50) e--;
  if (e < 0) throw new Error('zip okunamadı');
  let p = v.getUint32(e + 16, true);
  const count = v.getUint16(e + 10, true), dec = new TextDecoder();
  for (let i = 0; i < count; i++) {
    if (v.getUint32(p, true) !== 0x02014b50) break;
    const method = v.getUint16(p + 10, true), csize = v.getUint32(p + 20, true), nlen = v.getUint16(p + 28, true), xlen = v.getUint16(p + 30, true), clen = v.getUint16(p + 32, true), loff = v.getUint32(p + 42, true);
    const name = dec.decode(u8.subarray(p + 46, p + 46 + nlen));
    p += 46 + nlen + xlen + clen;
    if (!/\.json$/i.test(name) || !/keep/i.test(name)) continue;
    const start = loff + 30 + v.getUint16(loff + 26, true) + v.getUint16(loff + 28, true);
    const raw = u8.subarray(start, start + csize);
    let data;
    if (method === 0) data = raw;
    else if (method === 8) data = new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
    else continue;
    out.push({ name, text: dec.decode(data) });
  }
  return out;
}
const KEEP_COLORS = { RED: 'pembe', PINK: 'pembe', ORANGE: 'turuncu', YELLOW: 'sari', GREEN: 'yesil', TEAL: 'yesil', BLUE: 'mavi', CERULEAN: 'mavi', PURPLE: 'mor', BROWN: 'turuncu', GRAY: 'gri' };
function nKeepToNote(j) {
  if (!j || (j.textContent == null && !j.listContent && !j.title) || j.isTrashed) return null;
  let html = '';
  if (j.textContent) html += textToHtml(j.textContent);
  if (Array.isArray(j.listContent)) html += j.listContent.map(x => `<div>${x.isChecked ? '☑' : '☐'} ${esc(x.text || '')}</div>`).join('');
  if (Array.isArray(j.annotations)) html += j.annotations.filter(a => a.url).map(a => `<div><a href="${esc(a.url)}">${esc(a.title || a.url)}</a></div>`).join('');
  const labels = (j.labels || []).map(l => String(l.name || '').trim().toLocaleLowerCase('tr').replace(/\s+/g, '-').replace(/[^\p{L}\p{N}_-]/gu, '')).filter(x => x.length > 1);
  if (labels.length) html += `<div>${labels.map(l => '#' + l).join(' ')}</div>`;
  if (j.attachments?.length) html += `<div><i>(Keep'teki ${j.attachments.length} ek/resim taşınmadı)</i></div>`;
  const edited = Math.round((j.userEditedTimestampUsec || 0) / 1000) || Date.now();
  const created = Math.round((j.createdTimestampUsec || 0) / 1000) || edited;
  return { title: (j.title || '').trim(), html: sanitizeNoteHtml(html), color: KEEP_COLORS[j.color] || '', pinned: !!j.isPinned, archived: !!j.isArchived,
    created: new Date(created).toUTCString().replace('GMT', '+0000'), dateMs: edited };
}
function nKeepImport() {
  $('#modal').innerHTML = `<div class="modal-bg"><div class="sheet nask nkeep"><header class="sheet-head"><button type="button" class="icon-btn" data-action="close-modal">${IC.close}</button><h3>Google Keep'ten taşı</h3></header>
    <div class="set-body">
      <ol class="guide-steps">
        <li><i>1</i><div><b>Keep notlarını indir</b><span><a href="https://takeout.google.com/settings/takeout/custom/keep" target="_blank" rel="noopener noreferrer">takeout.google.com</a> adresinde sadece <b>Keep</b> seçili olsun, <b>Sonraki adım → Dışa aktarma oluştur</b>. Birkaç dakika içinde indirme bağlantısı mailine gelir.</span></div></li>
        <li><i>2</i><div><b>İndirdiğin zip dosyasını seç</b><span>Zip'i açmana gerek yok. Açtıysan içindeki <b>Keep</b> klasöründeki .json dosyalarını da seçebilirsin.</span></div></li>
      </ol>
      <p class="muted sm">Notlar <b>Keep</b> adlı yeni bir klasöre gelir. Renk, sabitleme, yapılacaklar ve tarih korunur; Keep etiketleri #etiket olur. Resimler taşınmaz. Çöp kutusundaki Keep notları atlanır.</p>
      <div class="sticky-actions"><button type="button" class="btn" data-action="close-modal">Vazgeç</button><button type="button" class="btn primary" id="nKeepPick">${IC.upload}Dosya seç</button></div>
      <div id="nKeepProg"></div>
    </div></div></div>`;
  $('#nKeepPick').onclick = () => {
    const inp = document.createElement('input'); inp.type = 'file'; inp.multiple = true; inp.accept = '.zip,.json,application/zip,application/json';
    inp.onchange = () => nKeepRun([...inp.files]);
    inp.click();
  };
}
async function nKeepRun(files) {
  const prog = $('#nKeepProg'), btn = $('#nKeepPick');
  const say = t => { if (prog) prog.innerHTML = `<p class="nkeep-prog">${t}</p>`; };
  if (btn) btn.disabled = true;
  try {
    say('Dosyalar okunuyor…');
    const jsons = [];
    for (const f of files) {
      if (/\.zip$/i.test(f.name) || f.type.includes('zip')) jsons.push(...await nUnzip(await f.arrayBuffer()));
      else if (/\.json$/i.test(f.name)) jsons.push({ name: f.name, text: await f.text() });
    }
    const notes = jsons.map(x => { try { return nKeepToNote(JSON.parse(x.text)); } catch { return null; } }).filter(Boolean);
    if (!notes.length) { say('Bu dosyalarda Keep notu bulunamadı. Takeout zip dosyasını ya da Keep klasöründeki .json dosyalarını seçtiğinden emin ol.'); if (btn) btn.disabled = false; return; }
    let folder = subFolders().find(f => f.name.toLocaleLowerCase('tr') === 'keep');
    if (!folder) { const id = await NDB.createFolder(`${N.root?.full || 'Notes'}/Keep`); folder = { id, name: 'Keep' }; N.folders.push(folder); }
    let done = 0, fail = 0;
    say(`${notes.length} not taşınıyor… 0/${notes.length}`);
    await pmap(notes, 3, async k => {
      const n = { ...k, uuid: (crypto.randomUUID ? crypto.randomUUID() : rnd()).toUpperCase() };
      try {
        const { raw, title, tags } = nBuildRaw(n);
        const labelIds = [folder.id, ...(n.pinned ? ['STARRED'] : [])];
        const res = await NDB.insert(raw, labelIds);
        N.all.push({ id: res.id, uuid: n.uuid, title, snippet: htmlToText(n.html).replace(/\s+/g, ' ').slice(0, 140), date: n.dateMs, created: Date.parse(n.created) || n.dateMs, labelIds, pinned: n.pinned, color: n.color, tags });
        done++;
      } catch (e) { if (e instanceof AuthError) throw e; fail++; }
      say(`${notes.length} not taşınıyor… ${done + fail}/${notes.length}`);
    });
    N.view = folder.id; store.set('nFolder', folder.id);
    await nFlush(); setView('list'); nEmptyReader();
    nRenderFolders(); nRenderList();
    say(`Bitti: ${done} not "Keep" klasörüne taşındı${fail ? ` · ${fail} not taşınamadı` : ''}.`);
    if (btn) { btn.disabled = false; btn.textContent = 'Kapat'; btn.onclick = closeModal; }
  } catch (e) {
    if (e instanceof AuthError) return;
    say('Taşınamadı: ' + esc(e.message)); if (btn) btn.disabled = false;
  }
}

/* Ayarlar'a yedek, Keep ve kısayollar */
const nSettingsBase = openNotesSettings;
openNotesSettings = function () {
  nSettingsBase();
  const body = $('.sheet.settings .set-body'); if (!body) return;
  const last = body.lastElementChild;
  last.insertAdjacentHTML('beforebegin', `
    <section><h4>Notlarım</h4>
      <div class="set-row"><div><b>Yedek al</b><span>Bütün notları tek zip dosyası olarak indir. Her not ayrı bir dosya; tarayıcıda ya da Word'de açılır.</span></div>
        <button class="btn" data-action="n-backup">${IC.download}İndir</button></div>
      <div class="set-row"><div><b>Google Keep'ten taşı</b><span>Keep notlarını renkleri, etiketleri ve yapılacaklarıyla buraya aktar.</span></div>
        <button class="btn" data-action="n-keep">${IC.upload}Taşı</button></div>
    </section>
    <section class="nkeys-sec"><h4>Klavye kısayolları</h4>
      <div class="nkeys">${NKEYS.map(([k, d]) => `<div><kbd>${esc(k)}</kbd><span>${esc(d)}</span></div>`).join('')}</div>
    </section>`);
};

Object.assign(ACTIONS, {
  'n-unremind': (el, e) => { e?.stopPropagation(); nUnremind(); },
  'n-backup': () => { closeModal(); nBackup(); },
  'n-keep': () => nKeepImport(),
  'n-find': () => nFindOpen(true)
});
