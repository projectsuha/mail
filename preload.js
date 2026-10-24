// Suha Kasa — preload (yalıtılmış köprü): sayfaya yalnız pano yaz/temizle.
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('kasaMasaustu', {
  platform: 'windows',
  panoYaz:     (m) => ipcRenderer.invoke('pano-yaz', m),
  panoTemizle: ()  => ipcRenderer.invoke('pano-temizle'),
});
