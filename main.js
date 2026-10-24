// Suha Kasa — Windows (Electron). Tamamen çevrimdışı, sertleştirilmiş.
// Mail'in aksine uzaktan URL AÇMAZ; yalnızca paketteki yerel sayfayı açar.
const { app, BrowserWindow, session, Menu, clipboard, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

app.setAppUserModelId('com.snnerdogan98.kasa');
if (!app.requestSingleInstanceLock()) { app.quit(); process.exit(0); }

// Pencere konumu/boyutu hatırla (Mail ile aynı desen)
const stateFile = () => path.join(app.getPath('userData'), 'pencere.json');
const loadState = () => { try { return JSON.parse(fs.readFileSync(stateFile(), 'utf8')); } catch { return {}; } };
const saveState = (w) => { try { const b = w.getNormalBounds(); fs.writeFileSync(stateFile(), JSON.stringify({ ...b, max: w.isMaximized() })); } catch {} };

let win = null;
function createWindow() {
  const st = loadState();
  win = new BrowserWindow({
    width: st.width || 980, height: st.height || 720, x: st.x, y: st.y,
    minWidth: 380, minHeight: 540,
    title: 'Suha Kasa', icon: path.join(__dirname, 'kasa', 'simge', 'kasa.ico'),
    backgroundColor: '#272b31', autoHideMenuBar: true, show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false, sandbox: true,
      devTools: false, spellcheck: false,
    },
  });
  win.setContentProtection(true);          // ekran görüntüsü/kayıt koruması
  Menu.setApplicationMenu(null);
  if (st.max) win.maximize();
  win.once('ready-to-show', () => win.show());
  win.on('close', () => saveState(win));
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (e) => e.preventDefault());
  win.webContents.on('devtools-opened', () => win.webContents.closeDevTools());
  win.loadFile(path.join(__dirname, 'kasa', 'kasa.html'));
}

app.whenReady().then(() => {
  const ses = session.defaultSession;
  // Tüm ağ istekleri iptal (yalnız yerel dosya). Sayfanın CSP'si de connect-src 'none'.
  ses.webRequest.onBeforeRequest((d, cb) => cb({ cancel: !/^(file|devtools):/i.test(d.url || '') }));
  ses.setPermissionRequestHandler((_w, _p, cb) => cb(false));
  ses.setPermissionCheckHandler(() => false);
  createWindow();
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => app.quit());
app.on('before-quit', () => { try { clipboard.clear(); } catch {} });

// Güvenli pano köprüsü (yalnız yaz/temizle)
ipcMain.handle('pano-yaz', (_e, m) => { try { clipboard.writeText(String(m ?? '')); return true; } catch { return false; } });
ipcMain.handle('pano-temizle', () => { try { clipboard.clear(); return true; } catch { return false; } });
