// Suha Kasa — şifreleme çekirdeği
// PBKDF2-SHA256 (varsayılan 600k tur) → AES-256-GCM veri anahtarı.
// Veri anahtarı HEM ana parola HEM kurtarma anahtarı ile ayrı ayrı sarılır.
// Tüm kasa tek GCM kutusunda; AAD = 'suha-kasa-v1'. Depolama: IndexedDB 'suha-kasa'.
// Tarayıcı ve Node (globalThis.crypto) üzerinde çalışır.

const C = globalThis.crypto;
const SC = C.subtle;
const UTF8 = new TextEncoder();
const AAD = UTF8.encode('suha-kasa-v1');

export const TUR_VARSAYILAN = 600000;
export const TUR_MIN = 100000;
export const TUR_MAK = 5000000;

// ── yardımcılar ────────────────────────────────────────────────
const rastgele = (n) => C.getRandomValues(new Uint8Array(n));

const b64 = {
  kodla: (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))),
  coz: (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0)),
};

// Base32 (RFC 4648, A-Z2-7) — kurtarma anahtarı için
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function base32Kodla(bytes) {
  let bit = 0, deger = 0, cik = '';
  for (const b of bytes) {
    deger = (deger << 8) | b; bit += 8;
    while (bit >= 5) { cik += B32[(deger >>> (bit - 5)) & 31]; bit -= 5; }
  }
  if (bit > 0) cik += B32[(deger << (5 - bit)) & 31];
  return cik;
}
function base32Coz(str) {
  const s = str.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bit = 0, deger = 0; const out = [];
  for (const ch of s) {
    const v = B32.indexOf(ch); if (v < 0) continue;
    deger = (deger << 5) | v; bit += 5;
    if (bit >= 8) { out.push((deger >>> (bit - 8)) & 255); bit -= 8; }
  }
  return new Uint8Array(out);
}

// ── anahtar türetme ────────────────────────────────────────────
async function paroladanAnahtar(parola, tuz, tur) {
  const temel = await SC.importKey('raw', UTF8.encode(parola), 'PBKDF2', false, ['deriveKey']);
  return SC.deriveKey(
    { name: 'PBKDF2', salt: tuz, iterations: tur, hash: 'SHA-256' },
    temel,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// veri anahtarını (ham 32 bayt) sarmalamak: GCM ile şifrele
async function sar(sarmaAnahtari, veriAnahtariHam) {
  const iv = rastgele(12);
  const ct = await SC.encrypt({ name: 'AES-GCM', iv, additionalData: AAD }, sarmaAnahtari, veriAnahtariHam);
  return { iv: b64.kodla(iv), ct: b64.kodla(ct) };
}
async function coz(sarmaAnahtari, sarili) {
  const buf = await SC.decrypt(
    { name: 'AES-GCM', iv: b64.coz(sarili.iv), additionalData: AAD },
    sarmaAnahtari,
    b64.coz(sarili.ct)
  );
  return new Uint8Array(buf);
}

// ── kurtarma anahtarı: 160 bit → 32 harf, 4'erli 8 grup ────────
export function kurtarmaUret() {
  const ham = rastgele(20);                 // 160 bit
  const harf = base32Kodla(ham);            // 32 harf
  const gruplu = harf.match(/.{1,4}/g).join('-');
  return { ham, metin: harf, gosterim: gruplu };
}

// ── kasa kutusu (veri anahtarıyla) ─────────────────────────────
async function kasaKey(veriAnahtariHam) {
  return SC.importKey('raw', veriAnahtariHam, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function kutuYap(veriAnahtariHam, nesne) {
  const k = await kasaKey(veriAnahtariHam);
  const iv = rastgele(12);
  const ct = await SC.encrypt({ name: 'AES-GCM', iv, additionalData: AAD }, k, UTF8.encode(JSON.stringify(nesne)));
  return { iv: b64.kodla(iv), ct: b64.kodla(ct) };
}
async function kutuAc(veriAnahtariHam, kutu) {
  const k = await kasaKey(veriAnahtariHam);
  const buf = await SC.decrypt({ name: 'AES-GCM', iv: b64.coz(kutu.iv), additionalData: AAD }, k, b64.coz(kutu.ct));
  return JSON.parse(new TextDecoder().decode(buf));
}

// ── KURULUM: yeni kasa oluştur ─────────────────────────────────
// Döner: { depo, kurtarma }  (depo IndexedDB'ye yazılır; kurtarma kullanıcıya gösterilir)
export async function kur(anaParola, baslangicKasa = { v: 1, kayitlar: [], ayarlar: {} }) {
  const veriAnahtari = rastgele(32);
  const kurtarma = kurtarmaUret();

  const tuzMP = rastgele(16), tuzRK = rastgele(16);
  const turMP = TUR_VARSAYILAN, turRK = TUR_VARSAYILAN;

  const kMP = await paroladanAnahtar(anaParola, tuzMP, turMP);
  const kRK = await paroladanAnahtar(kurtarma.metin, tuzRK, turRK);

  const depo = {
    v: 1,
    tuzMP: b64.kodla(tuzMP), turMP,
    tuzRK: b64.kodla(tuzRK), turRK,
    sariliMP: await sar(kMP, veriAnahtari),
    sariliRK: await sar(kRK, veriAnahtari),
    kutu: await kutuYap(veriAnahtari, baslangicKasa),
  };
  return { depo, kurtarma, veriAnahtari };
}

// ── AÇMA: ana parola ile ───────────────────────────────────────
export async function acParola(depo, anaParola) {
  const k = await paroladanAnahtar(anaParola, b64.coz(depo.tuzMP), tetikle(depo.turMP));
  const veriAnahtari = await coz(k, depo.sariliMP);       // yanlış parola → hata fırlatır
  const kasa = await kutuAc(veriAnahtari, depo.kutu);
  return { kasa, veriAnahtari };
}

// ── AÇMA: kurtarma anahtarı ile ────────────────────────────────
export async function acKurtarma(depo, kurtarmaMetin) {
  const temiz = kurtarmaMetin.toUpperCase().replace(/[^A-Z2-7]/g, '');
  const k = await paroladanAnahtar(temiz, b64.coz(depo.tuzRK), tetikle(depo.turRK));
  const veriAnahtari = await coz(k, depo.sariliRK);
  const kasa = await kutuAc(veriAnahtari, depo.kutu);
  return { kasa, veriAnahtari };
}

// kurcalamaya karşı tur sınırı
function tetikle(tur) {
  if (!Number.isInteger(tur) || tur < TUR_MIN || tur > TUR_MAK) throw new Error('Geçersiz tur sayısı (kurcalanmış yedek?)');
  return tur;
}

// ── KAYDET: kasayı yeniden şifrele (veri anahtarı bellekte sabit) ──
export async function kaydet(depo, veriAnahtari, kasa) {
  return { ...depo, kutu: await kutuYap(veriAnahtari, kasa) };
}

// ── ANA PAROLA DEĞİŞTİR ────────────────────────────────────────
export async function anaParolaDegistir(depo, veriAnahtari, yeniParola) {
  const tuzMP = rastgele(16), turMP = TUR_VARSAYILAN;
  const kMP = await paroladanAnahtar(yeniParola, tuzMP, turMP);
  return { ...depo, tuzMP: b64.kodla(tuzMP), turMP, sariliMP: await sar(kMP, veriAnahtari) };
}

// ── KURTARMA ANAHTARI YENİLE ───────────────────────────────────
export async function kurtarmaYenile(depo, veriAnahtari) {
  const kurtarma = kurtarmaUret();
  const tuzRK = rastgele(16), turRK = TUR_VARSAYILAN;
  const kRK = await paroladanAnahtar(kurtarma.metin, tuzRK, turRK);
  const yeni = { ...depo, tuzRK: b64.kodla(tuzRK), turRK, sariliRK: await sar(kRK, veriAnahtari) };
  return { depo: yeni, kurtarma };
}

// ── TOTP (RFC 6238) ────────────────────────────────────────────
export async function totp(anahtarBase32, { zaman = Date.now(), adim = 30, hane = 6 } = {}) {
  const key = base32Coz(anahtarBase32);
  const sayac = Math.floor(zaman / 1000 / adim);
  const msg = new Uint8Array(8);
  let n = BigInt(sayac);
  for (let i = 7; i >= 0; i--) { msg[i] = Number(n & 0xffn); n >>= 8n; }
  const hk = await SC.importKey('raw', key, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const sig = new Uint8Array(await SC.sign('HMAC', hk, msg));
  const off = sig[sig.length - 1] & 0x0f;
  const kod = ((sig[off] & 0x7f) << 24) | (sig[off + 1] << 16) | (sig[off + 2] << 8) | sig[off + 3];
  return String(kod % 10 ** hane).padStart(hane, '0');
}

// ── parola gücü (basit) ────────────────────────────────────────
export function parolaGucu(p) {
  let s = 0;
  if (p.length >= 10) s++; if (p.length >= 14) s++; if (p.length >= 20) s++;
  if (/[a-z]/.test(p) && /[A-Z0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  const ad = ['Çok zayıf', 'Zayıf', 'Orta', 'Güçlü', 'Çok güçlü'];
  const puan = Math.min(s, 4);
  return { puan, ad: ad[puan], yeterli: puan >= 2 };
}
