# Suha · Mail — Yeni sohbet için devir notu (11 Ekim 2026)

Bu dosyayı ve yanındaki kaynak kodu (Suha-kaynak-V0.7.zip) yeni sohbete ekle. Yeni sohbetteki Claude önce bunu okumalı.

## Kim, ne
- Sinan Erdoğan. Türkçe, sade anlatım ve ekran görüntüsüyle çalışır.
- Proje adı **Suha**. Ürünler: **Mail** (Gmail istemcisi, PWA), **Notlar**, **Yönetici**, ayrıca Windows uygulaması (Electron).
- İmza satırı: "Bir Suha projesi · Sinan Erdoğan ve Claude".
- Tasarım dili: gümüş/grafit, buzlu cam (cam.css, koyu.css).

## Çalışma kuralları
- Kullanıcının reddettiği fikirler "rafa" kaldırılır, notlara yazılır.
- Paket sadece kullanıcı **"hazırla"** deyince hazırlanır.
- Büyük kararları kullanıcı verir.
- **Asla şifre ya da doğrulama kodu istenmez.** Client secret paylaşılmaz.
- **config.js körlemesine üzerine yazılmaz**; canlıdaki değerleri: CLIENT_ID `339301516049-0ide2tq516ihamkdg6pvubgpd3vd01t1.apps.googleusercontent.com`, ACCESS_URL Suha Servis, OWNER_HASH = project.suha.2026@gmail.com'un özeti.
- Yükleme kullanıcı tarafından GitHub web arayüzüyle elle yapılır (Claude'un projectsuha'ya push yetkisi yok).

## Altyapı (hepsi ücretsiz)
- Yayın: GitHub Pages → **https://projectsuha.github.io/mail/** (depo projectsuha/mail, dal main). Windows: desktop dalı + GitHub Actions + Releases (son: Mail-Kurulum-0.4.0).
- Google Cloud projesi (sahip Suha). Giriş: tarayıcı içi OAuth (token + id_token, nonce).
- Sunucu tarafı: Google Apps Script. **Suha Servis** (erişim listesi, geri bildirim, kullanıcı listesi) Suha hesabında; zamanlayıcı her kullanıcının kendi hesabında.
- Eski adres snnerdogan98.github.io/mail yeni adrese yönlendiriyor; Aralık başında silinecek.

## Notlar uygulaması — mevcut durum
- Sayfa: `notlar.html`, kendi manifesti `notlar.webmanifest`, simgeler `notlar-*.png`.
- Kod: `notes-app.js` (79 satır) Mail'in altyapısını yeniden kullanır; app.js'i yükler ve bazı şeyleri değiştirir (APP_NAME, giriş ekranı `showLogin`, kendi ayarlar penceresi `openNotesSettings`, AUTH_STATE_PREFIX 'not-').
- Not altyapısı app.js içinde: `noteTitle`, `sanitizeNoteHtml` (izin listeli temizleyici), `noteDraft`, `renderNote`, `buildNoteRaw`, `notesLabelId`, `saveNote`, `flushNote`, `newNote`.
- Notlar Gmail'deki **"Notes"** etiketinde, iPhone/Mac Notlar uygulamasının (Gmail hesabı) kullandığı biçimde durur; yani iPhone Notlar ile aynı notlar.
- Bir notu düzenlemek = yeni sürümü ekle, eskisini çöpe taşı (Gmail mesajı yerinde değiştirilemez).
- Var olanlar: liste, arama, yeni not, otomatik kayıt, silme, görünüm ayarı, hesap, Hakkında; beyaz/kara liste burada da geçerli.
- Bilinen küçük sorun (rafta): Notlar'da iki tane "Yeni" düğmesi görünüyor.
- Demo: `notlar.html?demo` (örnek verilerle, giriş gerekmez).

## Pakette bekleyen (henüz yüklenmemiş) değişiklikler — bu kaynakta VAR
1. Sağ tık menüsü: gönderici başlığı kaldırıldı, "Taşı" alt menüsü (ctxmenu.js, app.js `dropOnto(id, target, quiet)`).
2. Cam görünümde sol menü üst çizgisi düzeltmesi (cam.css).
3. Ayarlar 6 sekmeye ayrıldı (settings.js, style.css sonu).
4. Giriş ekranı: güven maddeleri, izin açıklamaları, ilk girişte "Google'da göreceğin ekranlar" rehberi (app.js `showLogin`, `showLoginGuide`).
5. Giriş güvenliği: id_token birebir aud/iss/exp/nonce kontrolü, erişim anahtarı tokeninfo ile doğrulanıyor (`Auth.verify`).
- Önbellek sürümü sw.js'te `mail-v58`. Uygulama sürümü `V0.7`.
- Notlar'a dokunurken bunlarla çakışmamaya dikkat; yeni paket hazırlanırken bunlar da birlikte gider.

## Rafta (kullanıcı şimdilik istemedi)
- V0.7 telefon önerileri 1–8 (arkası görünen pencereler, telefonda gereksiz ayarları gizle, Notlar'da iki Yeni, takvim kesik etkinlik, kaydırarak arşivle/sil, aşağı çekip yenile, okumada alt çubuk, ek çiplerini sadeleştir).
- Yönetici hızlandırma (şifreyi bir kez kontrol, oturum anahtarı).
- Zamanlayıcıyı "bir kere kur, unut" (küçült + gizli etiketle kendini tanıt).
- Google "Test" modu (güvenli değil ekranı yerine yumuşak ekran).
- Android APK, iPhone simge rozeti, Suha tanıtım sitesi, Hakkında'daki Büyükayı kartı.

## Test
- Yerelde: klasörde `python3 -m http.server 8765`, sonra `http://localhost:8765/index.html?demo` ya da `notlar.html?demo`. Playwright + Chromium ile ekran görüntüsü alınabilir.
- Commit yazarı `Claude <noreply@anthropic.com>` olmalı.
