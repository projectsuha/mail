// Suha Notlar — Windows (Electron). Notlar Gmail'e bağlı olduğundan (Mail gibi)
// uzaktaki sayfayı yükler ve kapıyı "suhaDesktop" işaretiyle geçer.
const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

const ADRES = 'https://projectsuha.github.io/mail/notlar.html';
app.setAppUserModelId('com.snnerdogan98.notlar');
if (!app.requestSingleInstanceLock()) { app.quit(); process.exit(0); }

const stateFile = () => path.join(app.getPath('userData'), 'pencere.json');
const loadState = () => { try { return JSON.parse(fs.readFileSync(stateFile(), 'utf8')); } catch { return {}; } };
const saveState = (w) => { try { const b = w.getNormalBounds(); fs.writeFileSync(stateFile(), JSON.stringify({ ...b, max: w.isMaximized() })); } catch {} };

let win = null;
function createWindow() {
  const st = loadState();
  win = new BrowserWindow({
    width: st.width || 1040, height: st.height || 760, x: st.x, y: st.y,
    minWidth: 380, minHeight: 540,
    title: 'Suha Notlar', icon: path.join(__dirname, 'simge', 'notlar.ico'),
    backgroundColor: '#f3f3f3', autoHideMenuBar: true, show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false, sandbox: true,
    },
  });
  Menu.setApplicationMenu(null);
  if (st.max) win.maximize();
  win.once('ready-to-show', () => win.show());
  win.on('close', () => saveState(win));
  // Google oturumu uygulama içinde açılsın; diğer bağlantılar tarayıcıya gitsin
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\/(accounts\.google\.com|[a-z0-9.-]*\.googleapis\.com)/i.test(url)) return { action: 'allow' };
    try { shell.openExternal(url); } catch {}
    return { action: 'deny' };
  });
  win.loadURL(ADRES);
}

app.whenReady().then(() => {
  createWindow();
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => app.quit());
