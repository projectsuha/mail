# Suha Pano — Windows

Çevrimdışı dijital beyaz tahta (Electron). Panolar bu cihazda (yerel) saklanır.
Giriş/Drive kapalı (minimal config). Bu oturumdaki tüm geliştirmeler içinde.

## .exe üretimi
- Kendi Windows'unda: `npm install` → `npm run dist` → `dist/Suha-Pano-Kurulum-0.10.0.exe`
- ya da GitHub Actions: `pano` dalına push → "Pano Windows" iş akışı → Release'e .exe

## Not
- Drive/giriş özellikleri masaüstü sürümde kapalı; panolar yerel (IndexedDB) + yedek/geri yükle var.
- İmzasız → SmartScreen "Yine de çalıştır".
