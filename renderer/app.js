'use strict';
const $ = s => document.querySelector(s);
const esc = s => (s == null ? '' : String(s)).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const SAG = {
  yandex: { ad: 'Yandex', host: 'imap.yandex.com', port: 993, smtpHost: 'smtp.yandex.com', smtpPort: 465, not: 'Yandex\'te IMAP\'i aç ve bir <b>uygulama parolası</b> üret (normal parola değil).' },
  gmail: { ad: 'Gmail', host: 'imap.gmail.com', port: 993, smtpHost: 'smtp.gmail.com', smtpPort: 465, not: 'Gmail\'de 2 adımlı doğrulama + <b>uygulama parolası</b> gerekir.' },
  outlook: { ad: 'Outlook', host: 'outlook.office365.com', port: 993, smtpHost: 'smtp.office365.com', smtpPort: 587, not: 'Microsoft hesabında uygulama parolası gerekebilir.' },
  ozel: { ad: 'Özel sunucu', host: '', port: 993, smtpHost: '', smtpPort: 465, not: 'Sağlayıcının IMAP (993) ve SMTP (465/587) adreslerini gir.' }
};
const KLAD = { INBOX: 'Gelen Kutusu', Sent: 'Gönderilmiş', sent: 'Gönderilmiş', Drafts: 'Taslaklar', drafts: 'Taslaklar', Trash: 'Çöp', trash: 'Çöp', Junk: 'Spam', junk: 'Spam' };
const klAd = (yol, ozel) => KLAD[ozel] || KLAD[yol] || yol.split(/[\/.]/).pop();
const S = { hesaplar: [], hid: null, klasorler: [], klasor: 'INBOX', mesajlar: [], uid: null, yuk: false };

async function init() { S.hesaplar = await window.imapi.hesaplar(); if (S.hesaplar[0]) S.hid = S.hesaplar[0].id; render(); if (S.hid) await secHesap(S.hid); }

function render() {
  if (!S.hesaplar.length) { ekranBos(); return; }
  $('#app').innerHTML = `
  <div class="kabuk">
    <div class="sol">
      <div class="bas"><h1>Mail · IMAP</h1>
        <button class="ekle" id="yeniBtn" title="Yeni e-posta">✎</button>
        <button class="ekle" id="ekleBtn">+ Hesap</button>
      </div>
      <div class="hesaplar" id="hesaplar"></div>
      <div class="klsat"><select id="klasor"></select><button class="yeni-ikon" id="yenileBtn" title="Yenile">⟳</button></div>
      <div class="liste" id="liste"></div>
    </div>
    <div class="sag" id="sag"></div>
  </div>`;
  $('#ekleBtn').onclick = hesapModal;
  $('#yeniBtn').onclick = () => yazModal();
  $('#yenileBtn').onclick = () => yukleGelen();
  cizHesaplar(); cizKlasor(); cizListe(); cizOkuma();
}
function ekranBos() {
  $('#app').innerHTML = `<div class="bos"><div>
    <h2>Suha Mail · IMAP</h2>
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
    secHesap(el.dataset.id);
  });
}
function cizKlasor() {
  const el = $('#klasor'); if (!el) return;
  el.innerHTML = S.klasorler.map(k => `<option value="${esc(k.yol)}" ${k.yol === S.klasor ? 'selected' : ''}>${esc(klAd(k.yol, k.ozel))}</option>`).join('')
    || `<option value="INBOX">Gelen Kutusu</option>`;
  el.onchange = () => { S.klasor = el.value; S.uid = null; yukleGelen(); };
}
async function secHesap(id) {
  S.hid = id; S.klasor = 'INBOX'; S.uid = null; S.mesajlar = []; S.klasorler = [];
  cizHesaplar(); cizOkuma();
  const k = await window.imapi.klasorler(id);
  if (!k.hata) { S.klasorler = k.liste || []; cizKlasor(); }
  await yukleGelen();
}
async function hesapSil(id) {
  await window.imapi.hesapSil(id); S.hesaplar = await window.imapi.hesaplar();
  if (S.hid === id) { S.hid = S.hesaplar[0] ? S.hesaplar[0].id : null; S.mesajlar = []; S.uid = null; }
  render(); if (S.hid) await secHesap(S.hid);
}
async function yukleGelen() {
  S.yuk = true; S.mesajlar = []; S.uid = null; cizListe(); cizOkuma();
  const r = await window.imapi.gelenler(S.hid, S.klasor, 50);
  S.yuk = false;
  if (r.hata) { if ($('#liste')) $('#liste').innerHTML = `<div class="uyari">${esc(r.hata)}</div>`; return; }
  S.mesajlar = r.liste || []; cizListe();
}
function cizListe() {
  const el = $('#liste'); if (!el) return;
  if (S.yuk) { el.innerHTML = `<div class="yukle"><div class="spin"></div></div>`; return; }
  if (!S.mesajlar.length) { el.innerHTML = `<div class="bos" style="height:auto;padding:36px 20px"><p>Bu klasör boş ya da bağlanılmadı.</p></div>`; return; }
  el.innerHTML = S.mesajlar.map(m => `
    <button class="satir ${m.okundu ? '' : 'yeni'} ${m.uid === S.uid ? 'on' : ''}" data-uid="${m.uid}">
      <span class="u"><span class="kim">${m.okundu ? '' : '<span class="nokta"></span>'}${esc(m.kimden || m.adres)}</span><span class="t">${esc(tarih(m.tarih))}</span></span>
      <span class="k">${esc(m.konu)}</span>
    </button>`).join('');
  el.querySelectorAll('.satir').forEach(b => b.onclick = () => { S.uid = +b.dataset.uid; cizListe(); acMesaj(+b.dataset.uid); });
}
let sonMesaj = null;
async function acMesaj(uid) {
  $('#sag').innerHTML = `<div class="yukle"><div class="spin"></div></div>`;
  const m = await window.imapi.mesaj(S.hid, S.klasor, uid);
  if (m.hata) { $('#sag').innerHTML = `<div class="uyari">${esc(m.hata)}</div>`; return; }
  sonMesaj = m;
  const govde = m.html ? `<iframe sandbox="" srcdoc="${esc(m.html)}"></iframe>` : `<pre>${esc(m.metin || '(boş)')}</pre>`;
  $('#sag').innerHTML = `
    <div class="okbas"><button class="btn sm" id="yanitBtn">↩ Yanıtla</button></div>
    <div class="okuma">
      <h2>${esc(m.konu)}</h2>
      <div class="meta"><b>${esc(m.kimden)}</b></div>
      <div class="meta">${esc(m.kime ? 'Kime: ' + m.kime : '')} · ${esc(tarih(m.tarih, true))}</div>
      <div class="govde">${govde}</div>
    </div>`;
  $('#yanitBtn').onclick = () => yazModal({
    kime: m.kimdenAdres, konu: /^re:/i.test(m.konu) ? m.konu : 'Re: ' + m.konu,
    inReplyTo: m.messageId, references: ((m.references || '') + ' ' + (m.messageId || '')).trim()
  });
  const m2 = S.mesajlar.find(x => x.uid === uid); if (m2) { m2.okundu = true; cizListe(); }
}
function cizOkuma() {
  const el = $('#sag'); if (!el) return;
  el.innerHTML = `<div class="bos"><div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg><p>Okumak için bir posta seç</p></div></div>`;
}
function tarih(d, tam) {
  if (!d) return ''; const t = new Date(d); if (isNaN(t)) return '';
  if (!tam && t.toDateString() === new Date().toDateString()) return t.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  return t.toLocaleDateString('tr-TR', tam ? { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' } : { day: 'numeric', month: 'short' });
}

function yazModal(on = {}) {
  const m = $('#modal');
  m.innerHTML = `<div class="ort"><div class="kutu">
    <h3>Yeni e-posta</h3>
    <label class="alan">Kime</label><input id="kime" value="${esc(on.kime || '')}" placeholder="alici@ornek.com">
    <label class="alan">Konu</label><input id="konu" value="${esc(on.konu || '')}">
    <label class="alan">İleti</label><textarea id="metin" rows="8" style="width:100%;font:inherit;padding:10px 12px;border:1px solid var(--line);border-radius:8px;background:var(--bg2);color:var(--fg);resize:vertical"></textarea>
    <div class="onayed"><button class="btn" id="vaz">Vazgeç</button><button class="btn ana" id="yolla">Gönder</button></div>
    <p class="not" id="durum"></p>
  </div></div>`;
  $('#vaz').onclick = () => m.innerHTML = '';
  $('#yolla').onclick = async () => {
    const veri = { kime: $('#kime').value.trim(), konu: $('#konu').value.trim(), metin: $('#metin').value, inReplyTo: on.inReplyTo, references: on.references };
    if (!veri.kime) { $('#durum').style.color = 'var(--danger)'; $('#durum').textContent = 'Alıcı gerekli.'; return; }
    $('#yolla').disabled = true; $('#durum').style.color = 'var(--fg3)'; $('#durum').textContent = 'Gönderiliyor…';
    const r = await window.imapi.gonder(S.hid, veri);
    if (r.hata) { $('#yolla').disabled = false; $('#durum').style.color = 'var(--danger)'; $('#durum').textContent = r.hata; return; }
    $('#durum').style.color = 'var(--acc)'; $('#durum').textContent = 'Gönderildi ✓';
    setTimeout(() => m.innerHTML = '', 900);
  };
}

function hesapModal() {
  const m = $('#modal');
  m.innerHTML = `<div class="ort"><div class="kutu">
    <h3>Hesap ekle</h3>
    <p class="alt">Parolanı yalnız sen girersin; bu cihazda şifreli saklanır, hiçbir yere gönderilmez.</p>
    <label class="alan">Sağlayıcı</label>
    <select id="sg">${Object.entries(SAG).map(([k, v]) => `<option value="${k}">${v.ad}</option>`).join('')}</select>
    <label class="alan">Görünen ad</label><input id="ad" placeholder="Örn. Yandex hesabım">
    <label class="alan">E-posta adresi</label><input id="eposta" type="email" placeholder="ad@yandex.com" autocomplete="off">
    <div class="cift"><div><label class="alan">IMAP sunucusu</label><input id="host"></div><div><label class="alan">Port</label><input id="port" value="993"></div></div>
    <div class="cift"><div><label class="alan">SMTP sunucusu</label><input id="smtpHost"></div><div><label class="alan">Port</label><input id="smtpPort" value="465"></div></div>
    <label class="alan">Uygulama parolası</label><input id="parola" type="password" placeholder="sağlayıcıdan üretilen parola" autocomplete="off">
    <p class="not" id="not"></p>
    <div class="onayed"><button class="btn" id="vaz">Vazgeç</button><button class="btn ana" id="kaydet">Bağlan ve kaydet</button></div>
    <p class="not" id="durum" style="color:var(--danger)"></p>
  </div></div>`;
  const sg = $('#sg'), uy = () => { const v = SAG[sg.value]; $('#host').value = v.host; $('#port').value = v.port; $('#smtpHost').value = v.smtpHost; $('#smtpPort').value = v.smtpPort; $('#not').innerHTML = v.not; };
  sg.onchange = uy; uy();
  $('#vaz').onclick = () => m.innerHTML = '';
  $('#kaydet').onclick = async () => {
    const v = { ad: $('#ad').value.trim(), eposta: $('#eposta').value.trim(), host: $('#host').value.trim(), port: $('#port').value.trim(),
      smtpHost: $('#smtpHost').value.trim(), smtpPort: $('#smtpPort').value.trim(), parola: $('#parola').value };
    if (!v.eposta || !v.host || !v.parola) { $('#durum').textContent = 'E-posta, IMAP sunucusu ve parola gerekli.'; return; }
    $('#kaydet').disabled = true; $('#durum').style.color = 'var(--fg3)'; $('#durum').textContent = 'Kaydediliyor…';
    const h = await window.imapi.hesapEkle(v);
    S.hesaplar = await window.imapi.hesaplar(); m.innerHTML = ''; render(); await secHesap(h.id);
  };
}
init();
