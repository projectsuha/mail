// Suha Mail (IMAP) — kendi altyapımız (Google'a bağlı değil).
// Aşama 1-6: klasörler, okuma, gönderme, ek, işlemler, önbellek, birleşik kutu, OAuth.
const { app, BrowserWindow, Menu, ipcMain, safeStorage, shell, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const nodemailer = require('nodemailer');
const MailComposer = require('nodemailer/lib/mail-composer');
const http = require('node:http');

app.setAppUserModelId('com.snnerdogan98.mailimap');
if (!app.requestSingleInstanceLock()) { app.quit(); process.exit(0); }

// OAuth sağlayıcı yapılandırması (client_id/secret'ı kullanıcı kendi konsolundan alır)
const OAUTH = {
  gmail: { host: 'imap.gmail.com', smtp: 'smtp.gmail.com', auth: 'https://accounts.google.com/o/oauth2/v2/auth', token: 'https://oauth2.googleapis.com/token', scope: 'https://mail.google.com/', ekstra: { access_type: 'offline', prompt: 'consent' } },
  outlook: { host: 'outlook.office365.com', smtp: 'smtp.office365.com', smtpPort: 587, auth: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize', token: 'https://login.microsoftonline.com/common/oauth2/v2.0/token', scope: 'https://outlook.office.com/IMAP.AccessAsUser.All https://outlook.office.com/SMTP.Send offline_access', ekstra: {} },
  yandex: { host: 'imap.yandex.com', smtp: 'smtp.yandex.com', auth: 'https://oauth.yandex.com/authorize', token: 'https://oauth.yandex.com/token', scope: 'mail:imap_full mail:smtp', ekstra: {} }
};

const hesapDosya = () => path.join(app.getPath('userData'), 'hesaplar.json');
function hesaplariOku() { try { return JSON.parse(fs.readFileSync(hesapDosya(), 'utf8')); } catch { return []; } }
function hesaplariYaz(l) { try { fs.writeFileSync(hesapDosya(), JSON.stringify(l, null, 2)); } catch {} }
function sifrele(s) { try { if (safeStorage.isEncryptionAvailable()) return { enc: safeStorage.encryptString(s).toString('base64') }; } catch {} return { duz: s }; }
function coz(o, encAd, duzAd) { try { if (o[encAd] && safeStorage.isEncryptionAvailable()) return safeStorage.decryptString(Buffer.from(o[encAd], 'base64')); } catch {} return o[duzAd] || ''; }
const paroCoz = h => coz(h, 'paroEnc', 'paroDuz');
const guvenli = h => ({ id: h.id, ad: h.ad, eposta: h.eposta, host: h.host, port: h.port, smtpHost: h.smtpHost, smtpPort: h.smtpPort, imza: h.imza || '', yontem: h.oauth ? 'oauth' : 'parola' });
const bul = id => hesaplariOku().find(x => x.id === id);

// OAuth erişim jetonu (süresi geçtiyse refresh ile yenile, dosyaya yaz)
async function oauthToken(h) {
  if (h.at && h.atExp && Date.now() < h.atExp - 60000) return h.at;
  const cfg = OAUTH[h.oauth.saglayici];
  const body = new URLSearchParams({ client_id: h.oauth.clientId, client_secret: coz(h, 'secEnc', 'secDuz'),
    refresh_token: coz(h, 'refEnc', 'refDuz'), grant_type: 'refresh_token' });
  const tok = await fetch(cfg.token, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body }).then(r => r.json());
  if (!tok.access_token) throw new Error(tok.error_description || tok.error || 'Jeton yenilenemedi');
  const l = hesaplariOku(); const hi = l.find(x => x.id === h.id);
  if (hi) { hi.at = tok.access_token; hi.atExp = Date.now() + (tok.expires_in || 3600) * 1000; if (tok.refresh_token) { const r = sifrele(tok.refresh_token); hi.refEnc = r.enc; hi.refDuz = r.duz; } hesaplariYaz(l); }
  return tok.access_token;
}
async function istemci(h) {
  const auth = h.oauth ? { user: h.eposta, accessToken: await oauthToken(h) } : { user: h.eposta, pass: paroCoz(h) };
  return new ImapFlow({ host: h.host, port: h.port || 993, secure: true, auth, logger: false, emitLogs: false, tls: { rejectUnauthorized: true } });
}
async function tasiyici(h) {
  const port = h.smtpPort || 465;
  const auth = h.oauth ? { type: 'OAuth2', user: h.eposta, accessToken: await oauthToken(h) } : { user: h.eposta, pass: paroCoz(h) };
  return nodemailer.createTransport({ host: h.smtpHost || (h.host || '').replace(/^imap\./, 'smtp.'), port, secure: port === 465, requireTLS: port !== 465, auth });
}
function cevir(e) {
  const m = (e && e.message) || String(e);
  if (/auth|credential|AUTHENTICATIONFAILED|login/i.test(m)) return 'Giriş reddedildi — e-posta ya da (uygulama) parolası yanlış, veya sağlayıcıda IMAP/SMTP kapalı.';
  if (/ENOTFOUND|EAI_AGAIN/i.test(m)) return 'Sunucu bulunamadı — adresi kontrol et.';
  if (/ECONNREFUSED|ETIMEDOUT|timeout|ECONNRESET/i.test(m)) return 'Bağlanılamadı — internet/port ya da güvenlik duvarı.';
  return 'Hata: ' + m;
}
// Tek bir bağlantıda iş yap (kilit al, çalıştır, çık)
async function ileKlasor(h, klasor, fn) {
  const c = await istemci(h); await c.connect();
  const lock = await c.getMailboxLock(klasor || 'INBOX');
  try { return await fn(c); } finally { lock.release(); try { await c.logout(); } catch {} }
}

// ── Önbellek (dosya): klasör anında açılsın, çevrimdışında da liste görünsün ──
function onbDizin() { const d = path.join(app.getPath('userData'), 'onbellek'); try { fs.mkdirSync(d, { recursive: true }); } catch {} return d; }
const onbYol = (hid, klasor) => path.join(onbDizin(), hid + '_' + Buffer.from(klasor || 'INBOX').toString('hex') + '.json');
function onbYaz(hid, klasor, liste) { try { fs.writeFileSync(onbYol(hid, klasor), JSON.stringify({ liste, at: Date.now() })); } catch {} }
function onbOku(hid, klasor) { try { return JSON.parse(fs.readFileSync(onbYol(hid, klasor), 'utf8')); } catch { return null; } }
ipcMain.handle('onbellek', (_e, hid, klasor) => onbOku(hid, klasor));

ipcMain.handle('hesaplar', () => hesaplariOku().map(guvenli));
ipcMain.handle('hesap-ekle', (_e, v) => {
  const l = hesaplariOku();
  const h = { id: 'h' + Date.now(), ad: v.ad || v.eposta, eposta: v.eposta, host: v.host, port: +v.port || 993,
    smtpHost: v.smtpHost || '', smtpPort: +v.smtpPort || 465 };
  try { if (safeStorage.isEncryptionAvailable()) h.paroEnc = safeStorage.encryptString(v.parola).toString('base64'); else h.paroDuz = v.parola; }
  catch { h.paroDuz = v.parola; }
  l.push(h); hesaplariYaz(l); return guvenli(h);
});
ipcMain.handle('hesap-sil', (_e, id) => { hesaplariYaz(hesaplariOku().filter(h => h.id !== id)); return true; });
ipcMain.handle('hesap-guncelle', (_e, id, v) => { const l = hesaplariOku(); const h = l.find(x => x.id === id); if (h) { if (v.ad != null) h.ad = v.ad; if (v.imza != null) h.imza = v.imza; hesaplariYaz(l); } return h ? guvenli(h) : null; });

// OAuth: tarayıcıda giriş yap (loopback), kodu jetona çevir, hesabı kaydet
ipcMain.handle('oauth-baslat', async (_e, saglayici, clientId, clientSecret, eposta) => {
  const cfg = OAUTH[saglayici]; if (!cfg) return { hata: 'Bilinmeyen sağlayıcı' };
  return await new Promise((resolve) => {
    let redirect = '';
    const server = http.createServer(async (req, res) => {
      const u = new URL(req.url, 'http://127.0.0.1');
      const code = u.searchParams.get('code'), err = u.searchParams.get('error');
      if (!code && !err) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<html><body style="font-family:Segoe UI,sans-serif;text-align:center;padding:60px"><h2>Giriş tamam ✓</h2><p>Bu sekmeyi kapatıp uygulamaya dönebilirsin.</p></body></html>');
      try { server.close(); } catch {}
      if (err) return resolve({ hata: 'Giriş iptal/hata: ' + err });
      try {
        const body = new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirect, grant_type: 'authorization_code' });
        const tok = await fetch(cfg.token, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body }).then(r => r.json());
        if (!tok.access_token) return resolve({ hata: tok.error_description || tok.error || 'Jeton alınamadı' });
        const l = hesaplariOku();
        const h = { id: 'h' + Date.now(), ad: eposta, eposta, host: cfg.host, port: 993, smtpHost: cfg.smtp, smtpPort: cfg.smtpPort || 465, oauth: { saglayici, clientId } };
        const s = sifrele(clientSecret); h.secEnc = s.enc; h.secDuz = s.duz;
        const r = sifrele(tok.refresh_token || ''); h.refEnc = r.enc; h.refDuz = r.duz;
        h.at = tok.access_token; h.atExp = Date.now() + (tok.expires_in || 3600) * 1000;
        l.push(h); hesaplariYaz(l);
        resolve({ ok: true, hesap: guvenli(h) });
      } catch (e) { resolve({ hata: cevir(e) }); }
    });
    server.on('error', () => resolve({ hata: 'Yerel sunucu açılamadı' }));
    server.listen(0, '127.0.0.1', () => {
      redirect = 'http://127.0.0.1:' + server.address().port;
      const p = new URLSearchParams({ client_id: clientId, redirect_uri: redirect, response_type: 'code', scope: cfg.scope, login_hint: eposta || '', ...cfg.ekstra });
      shell.openExternal(cfg.auth + '?' + p.toString());
    });
    setTimeout(() => { try { server.close(); } catch {} resolve({ hata: 'Zaman aşımı — giriş 3 dk içinde tamamlanmadı.' }); }, 180000);
  });
});

ipcMain.handle('klasorler', async (_e, id) => {
  const h = bul(id); if (!h) return { hata: 'Hesap yok' };
  let c;
  try {
    c = await istemci(h); await c.connect();
    const list = await c.list(); await c.logout();
    return { liste: list.filter(m => !(m.flags && m.flags.has('\\Noselect')))
      .map(m => ({ yol: m.path, ad: m.name, ozel: (m.specialUse || '').replace(/\\/g, '') })) };
  } catch (e) { try { if (c) await c.close(); } catch {} return { hata: cevir(e) }; }
});

ipcMain.handle('gelenler', async (_e, id, klasor = 'INBOX', limit = 50) => {
  const h = bul(id); if (!h) return { hata: 'Hesap yok' };
  try {
    return await ileKlasor(h, klasor, async c => {
      const out = []; const total = c.mailbox.exists || 0;
      if (total > 0) {
        const bas = Math.max(1, total - limit + 1);
        for await (const msg of c.fetch(`${bas}:*`, { uid: true, envelope: true, flags: true })) {
          const f = msg.envelope.from && msg.envelope.from[0];
          out.push({ uid: msg.uid, konu: msg.envelope.subject || '(konu yok)',
            kimden: f ? (f.name || f.address) : '', adres: f ? f.address : '', tarih: msg.envelope.date,
            okundu: msg.flags ? msg.flags.has('\\Seen') : true, yildiz: msg.flags ? msg.flags.has('\\Flagged') : false });
        }
      }
      const liste = out.reverse();
      onbYaz(id, klasor, liste);
      return { liste };
    });
  } catch (e) { return { hata: cevir(e) }; }
});

ipcMain.handle('mesaj', async (_e, id, klasor, uid) => {
  const h = bul(id); if (!h) return { hata: 'Hesap yok' };
  try {
    return await ileKlasor(h, klasor, async c => {
      const msg = await c.fetchOne(uid, { source: true }, { uid: true });
      const p = await simpleParser(msg.source);
      try { await c.messageFlagsAdd(uid, ['\\Seen'], { uid: true }); } catch {}
      return { konu: p.subject || '(konu yok)', kimden: p.from ? p.from.text : '',
        kimdenAdres: p.from && p.from.value && p.from.value[0] ? p.from.value[0].address : '',
        kime: p.to ? p.to.text : '', tarih: p.date, html: p.html || null, metin: p.text || '',
        alicilar: [...((p.to && p.to.value) || []), ...((p.cc && p.cc.value) || [])].map(a => a.address).filter(Boolean),
        messageId: p.messageId || '', references: (p.references ? (Array.isArray(p.references) ? p.references.join(' ') : p.references) : ''),
        ekler: (p.attachments || []).map((a, i) => ({ i, ad: a.filename || ('ek-' + (i + 1)), boyut: a.size || (a.content ? a.content.length : 0), tur: a.contentType || '' })) };
    });
  } catch (e) { return { hata: cevir(e) }; }
});

ipcMain.handle('ek-indir', async (_e, id, klasor, uid, idx) => {
  const h = bul(id); if (!h) return { hata: 'Hesap yok' };
  try {
    const att = await ileKlasor(h, klasor, async c => {
      const msg = await c.fetchOne(uid, { source: true }, { uid: true });
      const p = await simpleParser(msg.source);
      return (p.attachments || [])[idx];
    });
    if (!att) return { hata: 'Ek bulunamadı' };
    const r = await dialog.showSaveDialog(win, { defaultPath: att.filename || ('ek-' + (idx + 1)) });
    if (r.canceled || !r.filePath) return { iptal: true };
    fs.writeFileSync(r.filePath, att.content);
    return { ok: true, yol: r.filePath };
  } catch (e) { return { hata: cevir(e) }; }
});

ipcMain.handle('dosya-sec', async () => {
  const r = await dialog.showOpenDialog(win, { properties: ['openFile', 'multiSelections'] });
  return r.canceled ? [] : r.filePaths;
});

ipcMain.handle('gonder', async (_e, id, m) => {
  const h = bul(id); if (!h) return { hata: 'Hesap yok' };
  try {
    const mail = { from: { name: h.ad || h.eposta, address: h.eposta }, to: m.kime, subject: m.konu,
      text: m.metin || '', inReplyTo: m.inReplyTo || undefined, references: m.references || undefined,
      attachments: (m.ekYollar || []).map(p => ({ path: p })) };
    const _t = await tasiyici(h); await _t.sendMail(mail);
    // Gönderilmiş'e kopya (IMAP append) — başarısızsa yut, gönderme asıl iş
    try {
      const raw = await new Promise((res, rej) => new MailComposer(mail).compile().build((e, msg) => e ? rej(e) : res(msg)));
      const c = await istemci(h); await c.connect();
      let sentYol = m.sentYol;
      if (!sentYol) { const list = await c.list(); const s = list.find(x => x.specialUse === '\\Sent'); sentYol = s ? s.path : null; }
      if (sentYol) await c.append(sentYol, raw, ['\\Seen']);
      await c.logout();
    } catch {}
    return { ok: true };
  } catch (e) { return { hata: cevir(e) }; }
});

// Tüm hesapların gelen kutularını birleştir
ipcMain.handle('tum-gelenler', async (_e, limitHer = 25) => {
  const hepsi = [];
  for (const h of hesaplariOku()) {
    try {
      const r = await ileKlasor(h, 'INBOX', async c => {
        const out = []; const total = c.mailbox.exists || 0;
        if (total > 0) {
          const bas = Math.max(1, total - limitHer + 1);
          for await (const msg of c.fetch(`${bas}:*`, { uid: true, envelope: true, flags: true })) {
            const f = msg.envelope.from && msg.envelope.from[0];
            out.push({ hid: h.id, hesapAd: h.ad || h.eposta, uid: msg.uid, konu: msg.envelope.subject || '(konu yok)',
              kimden: f ? (f.name || f.address) : '', adres: f ? f.address : '', tarih: msg.envelope.date,
              okundu: msg.flags ? msg.flags.has('\\Seen') : true, yildiz: msg.flags ? msg.flags.has('\\Flagged') : false });
          }
        }
        return out;
      });
      hepsi.push(...r);
    } catch {}
  }
  hepsi.sort((a, b) => new Date(b.tarih || 0) - new Date(a.tarih || 0));
  return { liste: hepsi.slice(0, 100) };
});

ipcMain.handle('isle', async (_e, id, klasor, uid, eylem, ekstra = {}) => {
  const h = bul(id); if (!h) return { hata: 'Hesap yok' };
  try {
    await ileKlasor(h, klasor, async c => {
      if (eylem === 'sil') {
        if (ekstra.copYol && ekstra.copYol !== klasor) await c.messageMove(uid, ekstra.copYol, { uid: true });
        else await c.messageDelete(uid, { uid: true });
      } else if (eylem === 'okundu') await c.messageFlagsAdd(uid, ['\\Seen'], { uid: true });
      else if (eylem === 'okunmadi') await c.messageFlagsRemove(uid, ['\\Seen'], { uid: true });
      else if (eylem === 'yildiz') await c.messageFlagsAdd(uid, ['\\Flagged'], { uid: true });
      else if (eylem === 'yildizKaldir') await c.messageFlagsRemove(uid, ['\\Flagged'], { uid: true });
    });
    return { ok: true };
  } catch (e) { return { hata: cevir(e) }; }
});

let win = null;
const pencereDosya = () => path.join(app.getPath('userData'), 'pencere.json');
const pencereOku = () => { try { return JSON.parse(fs.readFileSync(pencereDosya(), 'utf8')); } catch { return {}; } };
const pencereYaz = w => { try { const b = w.getNormalBounds(); fs.writeFileSync(pencereDosya(), JSON.stringify({ ...b, max: w.isMaximized() })); } catch {} };
function createWindow() {
  const st = pencereOku();
  win = new BrowserWindow({ width: st.width || 1200, height: st.height || 820, x: st.x, y: st.y, minWidth: 440, minHeight: 560,
    title: 'Suha Mail (IMAP)', icon: path.join(__dirname, 'renderer', 'simge', 'mail.ico'),
    backgroundColor: '#f3f3f3', autoHideMenuBar: true, show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: false } });
  Menu.setApplicationMenu(null);
  if (st.max) win.maximize();
  win.once('ready-to-show', () => win.show());
  win.on('close', () => pencereYaz(win));
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/i.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}
app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
});
app.on('window-all-closed', () => app.quit());
