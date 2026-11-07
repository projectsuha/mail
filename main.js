// Suha Hesap — Windows (Electron). Tamamen çevrimdışı; her şey bu cihazda.
const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

app.setAppUserModelId('com.snnerdogan98.hesap');
if (!app.requestSingleInstanceLock()) { app.quit(); process.exit(0); }

const stateFile = () => path.join(app.getPath('userData'), 'pencere.json');
const loadState = () => { try { return JSON.parse(fs.readFileSync(stateFile(), 'utf8')); } catch { return {}; } };
const saveState = (w) => { try { const b = w.getNormalBounds(); fs.writeFileSync(stateFile(), JSON.stringify({ ...b, max: w.isMaximized() })); } catch {} };

let win = null;
function createWindow() {
  const st = loadState();
  win = new BrowserWindow({
    width: st.width || 1040, height: st.height || 800, x: st.x, y: st.y,
    minWidth: 360, minHeight: 540,
    title: 'Suha Hesap', icon: path.join(__dirname, 'hesap', 'simge', 'hesap.ico'),
    backgroundColor: '#f3f3f3', autoHideMenuBar: true, show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  Menu.setApplicationMenu(null);
  if (st.max) win.maximize();
  win.once('ready-to-show', () => win.show());
  win.on('close', () => saveState(win));
  // Dış bağlantılar varsayılan tarayıcıda; başka yere gezinme yok
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/i.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file://')) { e.preventDefault(); if (/^https?:/i.test(url)) shell.openExternal(url); } });
  win.loadFile(path.join(__dirname, 'hesap', 'hesap.html'));
}

app.whenReady().then(() => {
  createWindow();
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => app.quit());
