'use strict';
const $ = s => document.querySelector(s);
const esc = s => (s == null ? '' : String(s)).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const SAG = {   // sağlayıcı ön ayarları
  yandex: { ad: 'Yandex', host: 'imap.yandex.com', port: 993, not: 'Yandex\'te IMAP\'i aç ve bir <b>uygulama parolası</b> üret (normal parola değil).' },
  gmail: { ad: 'Gmail', host: 'imap.gmail.com', port: 993, not: 'Gmail\'de 2 adımlı doğrulama + <b>uygulama parolası</b> gerekir.' },
  outlook: { ad: 'Outlook', host: 'outlook.office365.com', port: 993, not: 'Microsoft hesabında uygulama parolası gerekebilir.' },
  ozel: { ad: 'Özel sunucu', host: '', port: 993, not: 'Sağlayıcının IMAP adresini ve 993 (SSL) portunu gir.' }
};
const S = { hesaplar: [], hid: null, mesajlar: [], uid: null, yuk: false };

async function init() { S.hesaplar = await window.imapi.hesaplar(); if (S.hesaplar[0]) S.hid = S.hesaplar[0].id; render(); if (S.hid) yukleGelen(); }

function render() {
  if (!S.hesaplar.length) { ekranBos(); return; }
  $('#app').innerHTML = `
  <div class="kabuk">
    <div class="sol">
      <div class="bas"><h1>Mail · IMAP</h1><button class="ekle" id="ekleBtn">+ Hesap</button></div>
      <div class="hesaplar" id="hesaplar"></div>
      <div class="liste" id="liste"></div>
    </div>
    <div class="sag" id="sag"></div>
  </div>`;
  $('#ekleBtn').onclick = hesapModal;
  cizHesaplar(); cizListe(); cizOkuma();
}
function ekranBos() {
  $('#app').innerHTML = `<div class="bos"><div>
    <h2>Suha Mail · IMAP (deneme)</h2>
    <p style="max-width:380px;color:var(--fg2)">Kendi altyapımız — Google'a bağlı değil. Yandex, Gmail, Outlook ya da özel bir sunucuya IMAP ile bağlan.</p>
    <button class="ekle" id="ekleBtn" style="margin-top:10px;padding:10px 18px">+ Hesap ekle</button>
  </div></div>`;
  $('#ekleBtn').onclick = hesapModal;
}
function cizHesaplar() {
  $('#hesaplar').innerHTML = S.hesaplar.map(h => `
    <button class="hesap ${h.id === S.hid ? 'on' : ''}" data-id="${h.id}">
      <span class="av">${esc((h.ad || h.eposta)[0] || '?').toUpperCase()}</span>
      <span class="m"><b>${esc(h.ad || h.eposta)}</b><span>${esc(h.eposta)}</span></span>
      <span class="sil" data-sil="${h.id}" title="Kaldır">✕</span>
    </button>`).join('');
  $('#hesaplar').querySelectorAll('.hesap').forEach(el => el.onclick = e => {
    if (e.target.dataset.sil) return hesapSil(e.target.dataset.sil);
    S.hid = el.dataset.id; S.uid = null; cizHesaplar(); yukleGelen();
  });
}
async function hesapSil(id) {
  await window.imapi.hesapSil(id);
  S.hesaplar = await window.imapi.hesaplar();
  if (S.hid === id) { S.hid = S.hesaplar[0] ? S.hesaplar[0].id : null; S.mesajlar = []; S.uid = null; }
  render(); if (S.hid) yukleGelen();
}
async function yukleGelen() {
  S.yuk = true; S.mesajlar = []; S.uid = null; cizListe(); cizOkuma();
  const r = await window.imapi.gelenler(S.hid, 40);
  S.yuk = false;
  if (r.hata) { $('#liste').innerHTML = `<div class="uyari">${esc(r.hata)}</div>`; return; }
  S.mesajlar = r.liste || []; cizListe();
}
function cizListe() {
  const el = $('#liste'); if (!el) return;
  if (S.yuk) { el.innerHTML = `<div class="yukle"><div class="spin"></div></div>`; return; }
  if (!S.mesajlar.length) { el.innerHTML = `<div class="bos" style="height:auto;padding:40px 20px"><p>Gelen kutusu boş ya da bağlanılmadı.</p></div>`; return; }
  el.innerHTML = S.mesajlar.map(m => `
    <button class="satir ${m.okundu ? '' : 'yeni'} ${m.uid === S.uid ? 'on' : ''}" data-uid="${m.uid}">
      <span class="u"><span class="kim">${m.okundu ? '' : '<span class="nokta"></span>'}${esc(m.kimden || m.adres)}</span><span class="t">${esc(tarih(m.tarih))}</span></span>
      <span class="k">${esc(m.konu)}</span>
    </button>`).join('');
  el.querySelectorAll('.satir').forEach(b => b.onclick = () => { S.uid = +b.dataset.uid; cizListe(); acMesaj(+b.dataset.uid); });
}
async function acMesaj(uid) {
  $('#sag').innerHTML = `<div class="yukle"><div class="spin"></div></div>`;
  const m = await window.imapi.mesaj(S.hid, uid);
  if (m.hata) { $('#sag').innerHTML = `<div class="uyari">${esc(m.hata)}</div>`; return; }
  const govde = m.html
    ? `<iframe sandbox="" srcdoc="${esc(m.html)}"></iframe>`
    : `<pre>${esc(m.metin || '(boş)')}</pre>`;
  $('#sag').innerHTML = `<div class="okuma">
    <h2>${esc(m.konu)}</h2>
    <div class="meta"><b>${esc(m.kimden)}</b></div>
    <div class="meta">${esc(m.kime ? 'Kime: ' + m.kime : '')} · ${esc(tarih(m.tarih, true))}</div>
    <div class="govde">${govde}</div>
  </div>`;
  const m2 = S.mesajlar.find(x => x.uid === uid); if (m2) { m2.okundu = true; cizListe(); }
}
function cizOkuma() {
  const el = $('#sag'); if (!el) return;
  el.innerHTML = `<div class="bos"><div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg><p>Okumak için bir posta seç</p></div></div>`;
}
function tarih(d, tam) {
  if (!d) return '';
  const t = new Date(d); if (isNaN(t)) return '';
  const bugun = new Date();
  if (!tam && t.toDateString() === bugun.toDateString()) return t.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  return t.toLocaleDateString('tr-TR', tam ? { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' } : { day: 'numeric', month: 'short' });
}

function hesapModal() {
  const m = $('#modal');
  m.innerHTML = `<div class="ort"><div class="kutu">
    <h3>Hesap ekle</h3>
    <p class="alt">Parolanı yalnız sen girersin; bu cihazda şifreli saklanır, hiçbir yere gönderilmez.</p>
    <label class="alan">Sağlayıcı</label>
    <select id="sg">${Object.entries(SAG).map(([k, v]) => `<option value="${k}">${v.ad}</option>`).join('')}</select>
    <label class="alan">Görünen ad</label>
    <input id="ad" placeholder="Örn. Yandex hesabım">
    <label class="alan">E-posta adresi</label>
    <input id="eposta" type="email" placeholder="ad@yandex.com" autocomplete="off">
    <div class="cift"><div><label class="alan">IMAP sunucusu</label><input id="host"></div><div><label class="alan">Port</label><input id="port" value="993"></div></div>
    <label class="alan">Uygulama parolası</label>
    <input id="parola" type="password" placeholder="sağlayıcıdan üretilen parola" autocomplete="off">
    <p class="not" id="not"></p>
    <div class="onayed"><button class="btn" id="vaz">Vazgeç</button><button class="btn ana" id="kaydet">Bağlan ve kaydet</button></div>
    <p class="not" id="durum" style="color:var(--danger)"></p>
  </div></div>`;
  const sg = $('#sg'), uy = () => { const v = SAG[sg.value]; $('#host').value = v.host; $('#port').value = v.port; $('#not').innerHTML = v.not; };
  sg.onchange = uy; uy();
  $('#vaz').onclick = () => m.innerHTML = '';
  $('#kaydet').onclick = async () => {
    const veri = { ad: $('#ad').value.trim(), eposta: $('#eposta').value.trim(), host: $('#host').value.trim(), port: $('#port').value.trim(), parola: $('#parola').value };
    if (!veri.eposta || !veri.host || !veri.parola) { $('#durum').textContent = 'E-posta, sunucu ve parola gerekli.'; return; }
    $('#kaydet').disabled = true; $('#durum').textContent = 'Kaydediliyor…';
    const h = await window.imapi.hesapEkle(veri);
    S.hesaplar = await window.imapi.hesaplar(); S.hid = h.id; S.uid = null;
    m.innerHTML = ''; render(); yukleGelen();
  };
}
init();
