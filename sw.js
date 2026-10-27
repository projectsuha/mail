// Uygulama dosyalarını önbelleğe alır; Gmail verilerine dokunmaz.
const VERSION = 'mail-v130';
const SHELL = ['./', 'index.html', 'basla.js', 'style.css', 'cam.css', 'koyu.css', 'settings.js', 'autocorrect.js', 'schedule.js', 'signature.js', 'snooze.js', 'undosend.js', 'phish.js', 'access.js', 'notify.js', 'select.js', 'ctxmenu.js', 'contacts.js', 'feedback.js', 'about.js', 'pdfconvert.js', 'files.js', 'keys.js', 'app.js', 'cal.js', 'mock.js', 'config.js',
  'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'icon-maskable.png',
  'notlar.html', 'notes-app.js', 'notes-plus.js', 'notes-plus.css', 'notlar.webmanifest', 'notlar-192.png', 'notlar-512.png', 'notlar-apple.png', 'notlar-maskable.png',
  'yonetici.html', 'yonetici.js', 'yonetici.webmanifest', 'yonetici-192.png', 'yonetici-512.png', 'yonetici-apple.png', 'yonetici-maskable.png',
  'pano.html', 'pano.js', 'pano.css', 'pano.webmanifest', 'pano-192.png', 'pano-512.png', 'pano-apple.png', 'pano-maskable.png',
  'borsa.html', 'borsa.js', 'borsa-veri.js', 'borsa-grafik.js', 'borsa.css', 'borsa.webmanifest', 'borsa-192.png', 'borsa-512.png', 'borsa-apple.png', 'borsa-maskable.png',
  // Tara: büyük kütüphaneler (tara-lib/) ilk kullanımda önbelleğe alınır, burada değil
  'tara.html', 'tara.js', 'tara-veri.js', 'tara-goruntu.js', 'tara-isci.js', 'tara.css', 'tara.webmanifest', 'tara-192.png', 'tara-512.png', 'tara-apple.png', 'tara-maskable.png', 'tara-lib/pdf-lib.min.js',
  'qr.html', 'qr.js', 'qr.css', 'qr.webmanifest', 'qr-192.png', 'qr-512.png', 'qr-apple.png', 'qr-maskable.png', 'qr-lib/zxing.js',
  'barkod.html', 'barkod.js', 'barkod-kod.js', 'barkod-etiket.js', 'barkod.css', 'barkod.webmanifest', 'barkod-192.png', 'barkod-512.png', 'barkod-apple.png', 'barkod-maskable.png',
  'hesap.html', 'hesap.js', 'hesap-motor.js', 'hesap.css', 'hesap.webmanifest', 'hesap-192.png', 'hesap-512.png', 'hesap-apple.png', 'hesap-maskable.png',
  'saat.html', 'saat.js', 'saat.css', 'saat.webmanifest', 'saat-192.png', 'saat-512.png', 'saat-apple.png', 'saat-maskable.png',
  'pusula.html', 'pusula.js', 'pusula.css', 'pusula.webmanifest', 'pusula-192.png', 'pusula-512.png', 'pusula-apple.png', 'pusula-maskable.png',
  'olcum.html', 'olcum.js', 'olcum.css', 'olcum.webmanifest', 'olcum-192.png', 'olcum-512.png', 'olcum-apple.png', 'olcum-maskable.png',
  'hava.html', 'hava.js', 'hava.css', 'hava.webmanifest', 'hava-192.png', 'hava-512.png', 'hava-apple.png', 'hava-maskable.png',
  'kayit.html', 'kayit.js', 'kayit.css', 'kayit.webmanifest', 'kayit-192.png', 'kayit-512.png', 'kayit-apple.png', 'kayit-maskable.png',
  // PDF: pdf-lib Tara ile ortak; PDF.js (tara-lib/pdf.min.mjs) ilk kullanımda önbelleğe alınır
  'pdf.html', 'pdf-arac.js', 'pdf-is.js', 'pdf.css', 'pdf.webmanifest', 'pdf-192.png', 'pdf-512.png', 'pdf-apple.png', 'pdf-maskable.png',
  'defter.html', 'defter.js', 'defter-veri.js', 'defter.css', 'defter.webmanifest', 'defter-192.png', 'defter-512.png', 'defter-apple.png', 'defter-maskable.png',
  'fener.html', 'fener.js', 'fener.css', 'fener.webmanifest', 'fener-192.png', 'fener-512.png', 'fener-apple.png', 'fener-maskable.png',
  'cizim.html', 'cizim.js', 'cizim-is.js', 'cizim.css', 'cizim.webmanifest', 'cizim-192.png', 'cizim-512.png', 'cizim-apple.png', 'cizim-maskable.png',
  'takvim.html', 'takvim.js', 'takvim-is.js', 'takvim.css', 'takvim.webmanifest', 'takvim-192.png', 'takvim-512.png', 'takvim-apple.png', 'takvim-maskable.png',
  'muzik.html', 'muzik.js', 'muzik-is.js', 'muzik.css', 'muzik.webmanifest', 'muzik-192.png', 'muzik-512.png', 'muzik-apple.png', 'muzik-maskable.png', 'kamera.html', 'kamera.js', 'kamera.css', 'kamera.webmanifest', 'kamera-192.png', 'kamera-512.png', 'kamera-apple.png', 'kamera-maskable.png', 'kisiler.html', 'kisiler.js', 'kisiler-is.js', 'kisiler.css', 'kisiler.webmanifest', 'kisiler-192.png', 'kisiler-512.png', 'kisiler-apple.png', 'kisiler-maskable.png',
  'galeri.html', 'galeri.js', 'galeri-plus.js', 'galeri-is.js', 'galeri.css', 'galeri.webmanifest', 'galeri-192.png', 'galeri-512.png', 'galeri-apple.png', 'galeri-maskable.png',
  'kitap.html', 'kitap.js', 'kitap-is.js', 'kitap.css', 'kitap.webmanifest', 'kitap-192.png', 'kitap-512.png', 'kitap-apple.png', 'kitap-maskable.png',
  'foto.html', 'foto.js', 'foto-is.js', 'foto.css', 'foto.webmanifest', 'foto-192.png', 'foto-512.png', 'foto-apple.png', 'foto-maskable.png',
  'video.html', 'video.js', 'video.css', 'video.webmanifest', 'video-192.png', 'video-512.png', 'video-apple.png', 'video-maskable.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Önce ağ, olmazsa önbellek: güncellemeler hemen gelir, çevrimdışıyken de açılır.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }).then(res => {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});

// Bildirime tıklanınca programı öne getir ve o maili aç
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const threadId = e.notification.data?.threadId;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    const c = cs.find(x => !/yonetici/.test(x.url)) || null;
    if (c) { c.postMessage({ type: 'open-thread', threadId }); return c.focus(); }
    return self.clients.openWindow('./');
  }));
});
