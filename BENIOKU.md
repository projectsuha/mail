# Suha Kasa — Windows

Çevrimdışı parola kasası. Electron ile paketlenir; internete hiçbir şey gitmez.

## .exe nasıl üretilir
### Yol 1 — kendi Windows bilgisayarında
1. Node.js kurulu olsun.
2. Bu klasörde:
   ```
   npm install
   npm run dist
   ```
3. Çıktı: `dist/Suha-Kasa-Kurulum-0.10.0.exe` (imzasız → SmartScreen "Daha fazla bilgi → Yine de çalıştır").

### Yol 2 — GitHub Actions
`.github/workflows/windows.yml` var. Depoya koyup Actions'tan "Kasa Windows" iş akışını çalıştır → `.exe` artifact olarak iner.

## Hızlıca denemek (geliştirme)
```
npm install
npm start
```

## Sertleştirme (main.js)
- Tamamen çevrimdışı: tüm ağ istekleri iptal, CSP connect-src 'none'.
- `setContentProtection(true)` (ekran görüntüsü/kayıt koruması).
- contextIsolation + sandbox, devTools kapalı, menü yok, tek örnek.
- Pano yalnız preload köprüsüyle yazılır; çıkışta temizlenir.

## Şifreleme (kasa/kasa-sifre.js)
PBKDF2-SHA256 600k → AES-256-GCM. Veri anahtarı ana parola VE kurtarma anahtarı ile
ayrı ayrı sarılır. Tek GCM kutusu, AAD 'suha-kasa-v1'. IndexedDB 'suha-kasa'.
Testler: RFC 6238 TOTP vektörleri + açma/kaydet/parola/kurtarma (14/14 geçti).

## Notlar
- Android şu an rafta (telefon yok). Başlatma: "Kasa'yı Android'e al".
- Paket V0.10 olarak gider; yalnızca "hazırla" denince paketlenir.
