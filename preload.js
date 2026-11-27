// Kabuk ↔ renderer köprüsü. IMAP sekmesi için gereken yerel yolları ve
// webview'ler için gerçekçi bir Chrome UA'sını verir.
const { contextBridge } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const imapPreload = pathToFileURL(path.join(__dirname, 'imap-preload.js')).href;

contextBridge.exposeInMainWorld('suha', {
  imapPreload,                 // webview preload attribute (file:// URL)
  imapSrc: '../imap/index.html',
  // Google/Yandex gömülü webview'de "güvenli olmayan tarayıcı" uyarısını azaltmak için
  ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
});
