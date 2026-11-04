// Sayfaya "program içindeyim" işaretini ver; basla.js bunu görünce kapıyı açmaz.
const { contextBridge } = require('electron');
try { contextBridge.exposeInMainWorld('suhaDesktop', true); } catch (e) {}
