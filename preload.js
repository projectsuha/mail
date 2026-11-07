// Suha Pano — preload: sayfaya "program içindeyim" işaretini ver.
// Yalıtım açık olduğu için köprüyle; basla.js bunu görünce program kapısını açmaz.
const { contextBridge } = require('electron');
try { contextBridge.exposeInMainWorld('panoDesktop', true); } catch (e) {}
