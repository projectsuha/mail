// Arayüz ↔ motor köprüsü. Parola asla arayüze dönmez; yalnız motorda kullanılır.
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('imapi', {
  hesaplar: () => ipcRenderer.invoke('hesaplar'),
  hesapEkle: (veri) => ipcRenderer.invoke('hesap-ekle', veri),
  hesapSil: (id) => ipcRenderer.invoke('hesap-sil', id),
  gelenler: (id, limit) => ipcRenderer.invoke('gelenler', id, limit),
  mesaj: (id, uid) => ipcRenderer.invoke('mesaj', id, uid)
});
// Program kapısı (ileride ortak tema gelirse) için işaret
contextBridge.exposeInMainWorld('suhaDesktop', true);
