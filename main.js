// Suha Borsa — Windows (Electron). Borsa Google Drive'a bağlı olduğundan (Mail gibi)
// uzaktaki sayfayı yükler ve kapıyı "suhaDesktop" işaretiyle geçer.
const { app, BrowserWindow, shell, Menu, session } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

const ADRES = 'https://projectsuha.github.io/mail/borsa.html';
// Google, Electron'u gömülü/güvensiz tarayıcı sanmasın diye kimliği sade Chrome'a çek
const UA = app.userAgentFallback.replace(/\s(Electron|Suha[^/]*)\/[\d.]+/gi, '');
app.setAppUserModelId('com.snnerdogan98.borsa');
if (!app.requestSingleInstanceLock()) { app.quit(); process.exit(0); }

const stateFile = () => path.join(app.getPath('userData'), 'pencere.json');
const loadState = () => { try { return JSON.parse(fs.readFileSync(stateFile(), 'utf8')); } catch { return {}; } };
const saveState = (w) => { try { const b = w.getNormalBounds(); fs.writeFileSync(stateFile(), JSON.stringify({ ...b, max: w.isMaximized() })); } catch {} };

let win = null;
function createWindow() {
  const st = loadState();
  win = new BrowserWindow({
    width: st.width || 1180, height: st.height || 820, x: st.x, y: st.y,
    minWidth: 380, minHeight: 540,
    title: 'Suha Borsa', icon: path.join(__dirname, 'simge', 'borsa.ico'),
    backgroundColor: '#f3f3f3', autoHideMenuBar: true, show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  Menu.setApplicationMenu(null);
  if (st.max) win.maximize();
  win.once('ready-to-show', () => win.show());
  win.on('close', () => saveState(win));
  win.webContents.setUserAgent(UA);
  // Google oturumu uygulama içinde açılsın; diğer bağlantılar tarayıcıya gitsin
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\/(accounts\.google\.com|[a-z0-9.-]*\.googleapis\.com|[a-z0-9.-]*\.google\.com)/i.test(url)) return { action: 'allow' };
    try { shell.openExternal(url); } catch {}
    return { action: 'deny' };
  });
  win.loadURL(ADRES, { userAgent: UA });
}

app.whenReady().then(() => {
  try { session.defaultSession.setUserAgent(UA); } catch {}
  createWindow();
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => app.quit());
