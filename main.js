// Suha Mail (IMAP) — kendi altyapımız (Google'a bağlı değil).
// Aşama 1-3: klasörler + okuma + gönderme (SMTP) + ek dosya + işlemler (sil/okundu/yıldız).
const { app, BrowserWindow, Menu, ipcMain, safeStorage, shell, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const nodemailer = require('nodemailer');
const MailComposer = require('nodemailer/lib/mail-composer');

app.setAppUserModelId('com.snnerdogan98.mailimap');
if (!app.requestSingleInstanceLock()) { app.quit(); process.exit(0); }

const hesapDosya = () => path.join(app.getPath('userData'), 'hesaplar.json');
function hesaplariOku() { try { return JSON.parse(fs.readFileSync(hesapDosya(), 'utf8')); } catch { return []; } }
function hesaplariYaz(l) { try { fs.writeFileSync(hesapDosya(), JSON.stringify(l, null, 2)); } catch {} }
function paroCoz(h) {
  try { if (h.paroEnc && safeStorage.isEncryptionAvailable()) return safeStorage.decryptString(Buffer.from(h.paroEnc, 'base64')); } catch {}
  return h.paroDuz || '';
}
const guvenli = h => ({ id: h.id, ad: h.ad, eposta: h.eposta, host: h.host, port: h.port, smtpHost: h.smtpHost, smtpPort: h.smtpPort });
const bul = id => hesaplariOku().find(x => x.id === id);

function istemci(h) {
  return new ImapFlow({ host: h.host, port: h.port || 993, secure: true,
    auth: { user: h.eposta, pass: paroCoz(h) }, logger: false, emitLogs: false, tls: { rejectUnauthorized: true } });
}
function tasiyici(h) {
  const port = h.smtpPort || 465;
  return nodemailer.createTransport({ host: h.smtpHost || (h.host || '').replace(/^imap\./, 'smtp.'),
    port, secure: port === 465, requireTLS: port !== 465, auth: { user: h.eposta, pass: paroCoz(h) } });
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
  const c = istemci(h); await c.connect();
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

ipcMain.handle('klasorler', async (_e, id) => {
  const h = bul(id); if (!h) return { hata: 'Hesap yok' };
  let c;
  try {
    c = istemci(h); await c.connect();
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
    await tasiyici(h).sendMail(mail);
    // Gönderilmiş'e kopya (IMAP append) — başarısızsa yut, gönderme asıl iş
    try {
      const raw = await new Promise((res, rej) => new MailComposer(mail).compile().build((e, msg) => e ? rej(e) : res(msg)));
      const c = istemci(h); await c.connect();
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
function createWindow() {
  win = new BrowserWindow({ width: 1200, height: 820, minWidth: 440, minHeight: 560,
    title: 'Suha Mail (IMAP)', icon: path.join(__dirname, 'renderer', 'simge', 'mail.ico'),
    backgroundColor: '#f3f3f3', autoHideMenuBar: true, show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: false } });
  Menu.setApplicationMenu(null);
  win.once('ready-to-show', () => win.show());
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/i.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}
app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
});
app.on('window-all-closed', () => app.quit());
