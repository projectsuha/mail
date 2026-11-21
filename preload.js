const { contextBridge } = require('electron');
try { contextBridge.exposeInMainWorld('suhaDesktop', true); } catch (e) {}
