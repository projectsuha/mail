// Suha Mail (IMAP) — DENEME / POC
// Kendi altyapımız: Google'a bağlı değil. Herhangi bir sağlayıcıya IMAP ile bağlanır.
// Bu sürüm salt-okunur: gelen kutusunu listeler ve mesaj gösterir (gönderme sonraki aşama).
const { app, BrowserWindow, Menu, ipcMain, safeStorage, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');

app.setAppUserModelId('com.snnerdogan98.mailimap');
if (!app.requestSingleInstanceLock()) { app.quit(); process.exit(0); }

const hesapDosya = () => path.join(app.getPath('userData'), 'hesaplar.json');

// ── Hesap deposu (parola safeStorage ile şifreli; düz metin yazılmaz) ──
function hesaplariOku() {
  try { return JSON.parse(fs.readFileSync(hesapDosya(), 'utf8')); } catch { return []; }
}
function hesaplariYaz(list) {
  try { fs.writeFileSync(hesapDosya(), JSON.stringify(list, null, 2)); } catch (e) {}
}
function paroCoz(h) {
  try {
    if (h.paroEnc && safeStorage.isEncryptionAvailable())
      return safeStorage.decryptString(Buffer.from(h.paroEnc, 'base64'));
  } catch (e) {}
  return h.paroDuz || '';   // safeStorage yoksa yedek (yalnız bu cihazda)
}
// Arayüze parolasız gönder
const guvenli = h => ({ id: h.id, ad: h.ad, eposta: h.eposta, host: h.host, port: h.port });

function istemci(h) {
  return new ImapFlow({
    host: h.host, port: h.port || 993, secure: true,
    auth: { user: h.eposta, pass: paroCoz(h) },
    logger: false, emitLogs: false,
    tls: { rejectUnauthorized: true }
  });
}

ipcMain.handle('hesaplar', () => hesaplariOku().map(guvenli));

ipcMain.handle('hesap-ekle', (_e, veri) => {
  const list = hesaplariOku();
  const h = { id: 'h' + Date.now(), ad: veri.ad || veri.eposta, eposta: veri.eposta, host: veri.host, port: +veri.port || 993 };
  try {
    if (safeStorage.isEncryptionAvailable()) h.paroEnc = safeStorage.encryptString(veri.parola).toString('base64');
    else h.paroDuz = veri.parola;
  } catch { h.paroDuz = veri.parola; }
  list.push(h); hesaplariYaz(list);
  return guvenli(h);
});

ipcMain.handle('hesap-sil', (_e, id) => { hesaplariYaz(hesaplariOku().filter(h => h.id !== id)); return true; });

// Bağlan + gelen kutusunu listele (son N mesaj)
ipcMain.handle('gelenler', async (_e, id, limit = 40) => {
  const h = hesaplariOku().find(x => x.id === id);
  if (!h) return { hata: 'Hesap yok' };
  let client;
  try {
    client = istemci(h);
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');
    const out = [];
    try {
      const total = client.mailbox.exists || 0;
      if (total > 0) {
        const bas = Math.max(1, total - limit + 1);
        for await (const msg of client.fetch(`${bas}:*`, { uid: true, envelope: true, flags: true })) {
          const f = msg.envelope.from && msg.envelope.from[0];
          out.push({
            uid: msg.uid,
            konu: msg.envelope.subject || '(konu yok)',
            kimden: f ? (f.name || f.address) : '',
            adres: f ? f.address : '',
            tarih: msg.envelope.date,
            okundu: msg.flags ? msg.flags.has('\\Seen') : true
          });
        }
      }
    } finally { lock.release(); }
    await client.logout();
    return { liste: out.reverse(), toplam: 0 };
  } catch (e) {
    try { if (client) await client.close(); } catch {}
    return { hata: cevir(e) };
  }
});

// Tek mesajın gövdesini getir (ve okundu işaretle)
ipcMain.handle('mesaj', async (_e, id, uid) => {
  const h = hesaplariOku().find(x => x.id === id);
  if (!h) return { hata: 'Hesap yok' };
  let client;
  try {
    client = istemci(h);
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');
    let sonuc;
    try {
      const msg = await client.fetchOne(uid, { source: true, envelope: true }, { uid: true });
      const p = await simpleParser(msg.source);
      sonuc = {
        konu: p.subject || '(konu yok)',
        kimden: p.from ? p.from.text : '',
        kime: p.to ? p.to.text : '',
        tarih: p.date,
        html: p.html || null,
        metin: p.text || ''
      };
      try { await client.messageFlagsAdd(uid, ['\\Seen'], { uid: true }); } catch {}
    } finally { lock.release(); }
    await client.logout();
    return sonuc;
  } catch (e) {
    try { if (client) await client.close(); } catch {}
    return { hata: cevir(e) };
  }
});

function cevir(e) {
  const m = (e && e.message) || String(e);
  if (/auth/i.test(m)) return 'Giriş reddedildi — e-posta ya da (uygulama) parolası yanlış, veya sağlayıcıda IMAP kapalı.';
  if (/ENOTFOUND|EAI_AGAIN/i.test(m)) return 'Sunucu bulunamadı — IMAP adresini kontrol et.';
  if (/ECONNREFUSED|ETIMEDOUT|timeout/i.test(m)) return 'Bağlanılamadı — internet/port (993) ya da güvenlik duvarı.';
  return 'Hata: ' + m;
}

let win = null;
function createWindow() {
  win = new BrowserWindow({
    width: 1180, height: 800, minWidth: 420, minHeight: 540,
    title: 'Suha Mail (IMAP · deneme)', icon: path.join(__dirname, 'renderer', 'simge', 'mail.ico'),
    backgroundColor: '#f3f3f3', autoHideMenuBar: true, show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: false }
  });
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
