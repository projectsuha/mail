// Arayüz ↔ motor köprüsü. Parola asla arayüze dönmez; yalnız motorda kullanılır.
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('imapi', {
  hesaplar: () => ipcRenderer.invoke('hesaplar'),
  hesapEkle: (veri) => ipcRenderer.invoke('hesap-ekle', veri),
  hesapSil: (id) => ipcRenderer.invoke('hesap-sil', id),
  klasorler: (id) => ipcRenderer.invoke('klasorler', id),
  gelenler: (id, klasor, limit) => ipcRenderer.invoke('gelenler', id, klasor, limit),
  mesaj: (id, klasor, uid) => ipcRenderer.invoke('mesaj', id, klasor, uid),
  gonder: (id, mesaj) => ipcRenderer.invoke('gonder', id, mesaj)
});
contextBridge.exposeInMainWorld('suhaDesktop', true);
