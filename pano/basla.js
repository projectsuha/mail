/* Sayfa çizilmeden önce çalışır (index, notlar, yönetici): görünümü uygula, Google dönüşünü doğru sayfaya aktar.
   Ayrı dosyada durur çünkü sayfa güvenlik kuralı (CSP) sayfanın içine gömülü kod çalıştırmaya izin vermez. */
(function () {
  // Başka bir site bu sayfayı kendi içine (çerçeveye) koyup kullanıcıyı kandırmasın
  if (window.top !== window.self) { try { window.top.location = window.self.location.href; } catch (e) { document.documentElement.style.display = 'none'; } }
  var p = location.pathname, home = /\/$|\/index\.html$/.test(p);
  // Mail Yönetici'nin, Notlar'ın, Pano'nun, Borsa'nın, Tara'nın ve Kayıt Defteri'nin Google girişi ana sayfaya döner; doğru sayfaya aktar
  if (home && /[#&]state=yon-/.test(location.hash)) location.replace('yonetici.html' + location.hash);
  if (home && /[#&]state=not-/.test(location.hash)) location.replace('notlar.html' + location.hash);
  if (home && /[#&]state=pano-/.test(location.hash)) location.replace('pano.html' + location.hash);
  if (home && /[#&]state=brs-/.test(location.hash)) location.replace('borsa.html' + location.hash);
  if (home && /[#&]state=tara-/.test(location.hash)) location.replace('tara.html' + location.hash);
  if (home && /[#&]state=dft-/.test(location.hash)) location.replace('defter.html' + location.hash);
})();
function applyTheme(t) {
  var cam = document.getElementById('css-cam'), koyu = document.getElementById('css-koyu');
  cam.media = t === 'flat' ? 'not all' : 'all';
  koyu.media = t === 'dark' ? 'all' : t === 'auto' ? '(prefers-color-scheme: dark)' : 'not all';
  document.documentElement.dataset.theme = t;
  simgeTema(t);
}
// Sekme simgesi de temaya uysun: koyu temada koyu simge (data-koyu)
function simgeTema(t) {
  var l = document.querySelector('link[rel="icon"][data-koyu]'); if (!l) return;
  if (!l.getAttribute('data-acik')) l.setAttribute('data-acik', l.getAttribute('href'));
  var koyuMu = t === 'dark' || (t === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  l.setAttribute('href', l.getAttribute(koyuMu ? 'data-koyu' : 'data-acik'));
}
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { simgeTema(document.documentElement.dataset.theme); }); } catch (e) {}
try { applyTheme(JSON.parse(localStorage.getItem('theme')) || 'light'); } catch (e) { applyTheme('light'); }
