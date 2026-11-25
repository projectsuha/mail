// Arayüz ↔ motor köprüsü. Parola asla arayüze dönmez; yalnız motorda kullanılır.
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('imapi', {
  hesaplar: () => ipcRenderer.invoke('hesaplar'),
  hesapEkle: (veri) => ipcRenderer.invoke('hesap-ekle', veri),
  hesapSil: (id) => ipcRenderer.invoke('hesap-sil', id),
  klasorler: (id) => ipcRenderer.invoke('klasorler', id),
  onbellek: (id, klasor) => ipcRenderer.invoke('onbellek', id, klasor),
  gelenler: (id, klasor, limit) => ipcRenderer.invoke('gelenler', id, klasor, limit),
  tumGelenler: (limitHer) => ipcRenderer.invoke('tum-gelenler', limitHer),
  mesaj: (id, klasor, uid) => ipcRenderer.invoke('mesaj', id, klasor, uid),
  ekIndir: (id, klasor, uid, idx) => ipcRenderer.invoke('ek-indir', id, klasor, uid, idx),
  dosyaSec: () => ipcRenderer.invoke('dosya-sec'),
  gonder: (id, mesaj) => ipcRenderer.invoke('gonder', id, mesaj),
  isle: (id, klasor, uid, eylem, ekstra) => ipcRenderer.invoke('isle', id, klasor, uid, eylem, ekstra)
});
contextBridge.exposeInMainWorld('suhaDesktop', true);
