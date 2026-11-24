# Suha Mail (IMAP) — DENEME / POC

Kendi altyapımız: Google'a bağlı değil. Herhangi bir sağlayıcıya (Yandex, Gmail,
Outlook, özel sunucu) **IMAP** ile bağlanır.

Bu sürüm **salt-okunur** ve bir kanıttır (Aşama 0):
- Hesap ekle (sağlayıcı seç → sunucu otomatik dolar), e-posta + **uygulama parolası** gir.
- Gelen kutusunun son postalarını listeler, seçince gövdeyi gösterir.
- Parola bu cihazda `safeStorage` ile **şifreli** saklanır; hiçbir yere gönderilmez.

Gönderme, klasörler, çoklu-eşitleme, OAuth sonraki aşamalarda.

Not: Yandex/Gmail/Outlook için normal parola değil **uygulama parolası** gerekir
(sağlayıcının güvenlik ayarlarından üretilir).
