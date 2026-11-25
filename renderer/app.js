'use strict';
const $ = s => document.querySelector(s);
const esc = s => (s == null ? '' : String(s)).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const SAG = {
  yandex: { ad: 'Yandex', host: 'imap.yandex.com', port: 993, smtpHost: 'smtp.yandex.com', smtpPort: 465, not: 'Yandex\'te IMAP\'i aç ve bir <b>uygulama parolası</b> üret (normal parola değil).' },
  gmail: { ad: 'Gmail', host: 'imap.gmail.com', port: 993, smtpHost: 'smtp.gmail.com', smtpPort: 465, not: 'Gmail\'de 2 adımlı doğrulama + <b>uygulama parolası</b> gerekir.' },
  outlook: { ad: 'Outlook', host: 'outlook.office365.com', port: 993, smtpHost: 'smtp.office365.com', smtpPort: 587, not: 'Microsoft hesabında uygulama parolası gerekebilir.' },
  ozel: { ad: 'Özel sunucu', host: '', port: 993, smtpHost: '', smtpPort: 465, not: 'Sağlayıcının IMAP (993) ve SMTP (465/587) adreslerini gir.' }
};
const KLAD = { INBOX: 'Gelen Kutusu', Sent: 'Gönderilmiş', sent: 'Gönderilmiş', Drafts: 'Taslaklar', drafts: 'Taslaklar', Trash: 'Çöp', trash: 'Çöp', Junk: 'Spam', junk: 'Spam', Archive: 'Arşiv', archive: 'Arşiv' };
const klAd = (yol, ozel) => KLAD[ozel] || KLAD[yol] || yol.split(/[\/.]/).pop();
const boyutYaz = b => !b ? '' : b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(0) + ' KB' : (b / 1048576).toFixed(1) + ' MB';
const RENK = ['#2f6bb3', '#2e9e52', '#c4621c', '#8e4ec6', '#c42b63', '#0f9b9b'];
const renkOf = id => RENK[(S.hesaplar.findIndex(h => h.id === id) + RENK.length) % RENK.length];
const S = { hesaplar: [], hid: null, tum: false, klasorler: [], klasor: 'INBOX', mesajlar: [], uid: null, mhid: null, yuk: false, q: '' };
const enf = m => S.tum ? { hid: m.hid, klasor: 'INBOX' } : { hid: S.hid, klasor: S.klasor };

// ── Tema ──
function temaUygula() { const t = localStorage.getItem('tema') || 'auto'; if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.dataset.theme = t; return t; }
function temaDeg() { const sira = ['auto', 'light', 'dark']; const now = localStorage.getItem('tema') || 'auto'; const n = sira[(sira.indexOf(now) + 1) % 3]; localStorage.setItem('tema', n); temaUygula(); temaIkon(); }
function temaIkon() { const b = $('#temaBtn'); if (b) { const t = localStorage.getItem('tema') || 'auto'; b.textContent = t === 'dark' ? '🌙' : t === 'light' ? '☀' : '◑'; b.title = 'Tema: ' + (t === 'auto' ? 'otomatik' : t === 'light' ? 'açık' : 'koyu'); } }

async function init() { temaUygula(); S.hesaplar = await window.imapi.hesaplar(); if (S.hesaplar[0]) S.hid = S.hesaplar[0].id; render(); otoBasla(); if (S.hid) await secHesap(S.hid); }

function render() {
  if (!S.hesaplar.length) { ekranBos(); return; }
  const klsat = S.tum ? '' : `<div class="klsat"><select id="klasor"></select><span id="sayac" class="sayac"></span><button class="yeni-ikon" id="yenileBtn" title="Yenile">⟳</button></div>`;
  $('#app').innerHTML = `
  <div class="kabuk">
    <div class="sol">
      <div class="bas"><h1>Mail · IMAP</h1>
        <button class="ekle ikon" id="temaBtn" title="Tema">◑</button>
        <button class="ekle ikon" id="yeniBtn" title="Yeni e-posta">✎</button>
        <button class="ekle" id="ekleBtn">+ Hesap</button></div>
      <div class="hesaplar" id="hesaplar"></div>
      ${klsat}
      <div class="arasat"><input id="ara" placeholder="${S.tum ? 'Tüm postalarda ara' : 'Bu klasörde ara'}" value="${esc(S.q)}"></div>
      <div class="liste" id="liste"></div>
    </div>
    <div class="sag" id="sag"></div>
  </div>`;
  $('#ekleBtn').onclick = hesapModal;
  $('#yeniBtn').onclick = () => yazModal();
  $('#temaBtn').onclick = temaDeg; temaIkon();
  if ($('#yenileBtn')) $('#yenileBtn').onclick = () => yukleGelen();
  $('#ara').oninput = e => { S.q = e.target.value; cizListe(); };
  cizHesaplar(); if (!S.tum) cizKlasor(); cizListe(); cizOkuma();
}
function ekranBos() {
  $('#app').innerHTML = `<div class="bos"><div>
    <h2>Suha Mail · IMAP</h2>
    <p style="max-width:380px;color:var(--fg2)">Kendi altyapımız — Google'a bağlı değil. Yandex, Gmail, Outlook ya da özel bir sunucuya IMAP ile bağlan.</p>
    <button class="ekle" id="ekleBtn" style="margin-top:10px;padding:10px 18px">+ Hesap ekle</button></div></div>`;
  $('#ekleBtn').onclick = hesapModal;
}
function cizHesaplar() {
  const tumSatir = S.hesaplar.length > 1 ? `<button class="hesap ${S.tum ? 'on' : ''}" data-tum="1"><span class="av" style="background:linear-gradient(135deg,#2f6bb3,#8e4ec6)">∑</span><span class="m"><b>Tüm hesaplar</b><span>birleşik gelen kutusu</span></span></button>` : '';
  $('#hesaplar').innerHTML = tumSatir + S.hesaplar.map(h => `
    <button class="hesap ${!S.tum && h.id === S.hid ? 'on' : ''}" data-id="${h.id}">
      <span class="av" style="background:${renkOf(h.id)}">${esc((h.ad || h.eposta)[0] || '?').toUpperCase()}</span>
      <span class="m"><b>${esc(h.ad || h.eposta)}</b><span>${esc(h.eposta)}</span></span>
      <span class="sil" data-sil="${h.id}" title="Kaldır">✕</span></button>`).join('');
  $('#hesaplar').querySelectorAll('.hesap').forEach(el => el.onclick = e => {
    if (e.target.dataset.sil) return hesapSil(e.target.dataset.sil);
    if (el.dataset.tum) return secTum();
    secHesap(el.dataset.id);
  });
}
function cizKlasor() {
  const el = $('#klasor'); if (!el) return;
  el.innerHTML = S.klasorler.map(k => `<option value="${esc(k.yol)}" ${k.yol === S.klasor ? 'selected' : ''}>${esc(klAd(k.yol, k.ozel))}</option>`).join('') || `<option value="INBOX">Gelen Kutusu</option>`;
  el.onchange = () => { S.klasor = el.value; S.uid = null; S.q = ''; if ($('#ara')) $('#ara').value = ''; yukleGelen(); };
}
function copYol() { const k = S.klasorler.find(x => x.ozel === 'Trash' || /trash|çöp|cop|deleted/i.test(x.ad) || /trash|çöp/i.test(x.yol)); return k ? k.yol : null; }
async function secTum() {
  S.tum = true; S.hid = null; S.uid = null; S.mesajlar = []; S.q = ''; render();
  await yukleGelen();
}
async function secHesap(id) {
  S.tum = false; S.hid = id; S.klasor = 'INBOX'; S.uid = null; S.mesajlar = []; S.klasorler = []; S.q = ''; render();
  const k = await window.imapi.klasorler(id);
  if (!k.hata) { S.klasorler = k.liste || []; cizKlasor(); }
  await yukleGelen();
}
async function hesapSil(id) {
  await window.imapi.hesapSil(id); S.hesaplar = await window.imapi.hesaplar();
  if (S.hid === id) { S.hid = S.hesaplar[0] ? S.hesaplar[0].id : null; S.mesajlar = []; S.uid = null; }
  S.tum = false; render(); if (S.hid) await secHesap(S.hid);
}
async function yukleGelen() {
  S.uid = null;
  if (S.tum) { S.yuk = true; S.mesajlar = []; cizListe(); cizOkuma();
    const r = await window.imapi.tumGelenler(25); S.yuk = false;
    if (r.hata) { if ($('#liste')) $('#liste').innerHTML = `<div class="uyari">${esc(r.hata)}</div>`; return; }
    S.mesajlar = r.liste || []; cizListe(); sayac(); return;
  }
  const c = await window.imapi.onbellek(S.hid, S.klasor);
  if (c && c.liste && c.liste.length) { S.mesajlar = c.liste; S.yuk = false; } else { S.yuk = true; S.mesajlar = []; }
  cizListe(); cizOkuma(); sayac();
  const r = await window.imapi.gelenler(S.hid, S.klasor, 50); S.yuk = false;
  if (r.hata) { if (!S.mesajlar.length && $('#liste')) $('#liste').innerHTML = `<div class="uyari">${esc(r.hata)} <small>(çevrimdışı önbellek yok)</small></div>`; return; }
  S.mesajlar = r.liste || []; cizListe(); sayac();
}
function sayac() { const el = $('#sayac'); if (!el) return; const n = S.mesajlar.filter(m => !m.okundu).length; el.textContent = n ? n + ' yeni' : ''; el.style.display = n ? '' : 'none'; }
let otoT = null;
function otoBasla() { if (otoT) clearInterval(otoT); otoT = setInterval(sessizYenile, 60000); }
async function sessizYenile() {
  if (document.querySelector('.ort') || S.yuk) return;
  let r; if (S.tum) r = await window.imapi.tumGelenler(25); else if (S.hid) r = await window.imapi.gelenler(S.hid, S.klasor, 50); else return;
  if (!r || r.hata || !r.liste) return;
  S.mesajlar = r.liste; cizListe(); sayac();
}
function gorunur() {
  if (!S.q.trim()) return S.mesajlar;
  const q = S.q.toLocaleLowerCase('tr');
  return S.mesajlar.filter(m => ((m.kimden || '') + ' ' + (m.adres || '') + ' ' + (m.konu || '')).toLocaleLowerCase('tr').includes(q));
}
function cizListe() {
  const el = $('#liste'); if (!el) return;
  if (S.yuk) { el.innerHTML = `<div class="yukle"><div class="spin"></div></div>`; return; }
  const list = gorunur();
  if (!list.length) { el.innerHTML = `<div class="bos" style="height:auto;padding:36px 20px"><p>${S.q ? 'Sonuç yok.' : 'Bu klasör boş ya da bağlanılmadı.'}</p></div>`; return; }
  el.innerHTML = list.map((m, i) => `
    <button class="satir ${m.okundu ? '' : 'yeni'} ${m.uid === S.uid && (!S.tum || m.hid === S.mhid) ? 'on' : ''}" data-i="${i}">
      <span class="u"><span class="kim">${m.okundu ? '' : '<span class="nokta"></span>'}${m.yildiz ? '<span class="yil">★</span>' : ''}${esc(m.kimden || m.adres)}</span><span class="t">${esc(tarih(m.tarih))}</span></span>
      <span class="k">${S.tum ? `<span class="htag" style="color:${renkOf(m.hid)}">● ${esc(m.hesapAd)}</span> ` : ''}${esc(m.konu)}</span></button>`).join('');
  el.querySelectorAll('.satir').forEach(b => b.onclick = () => { const m = list[+b.dataset.i]; S.uid = m.uid; S.mhid = m.hid; cizListe(); acMesaj(m); });
}
async function acMesaj(m0) {
  const { hid, klasor } = enf(m0);
  $('#sag').innerHTML = `<div class="yukle"><div class="spin"></div></div>`;
  const m = await window.imapi.mesaj(hid, klasor, m0.uid);
  if (m.hata) { $('#sag').innerHTML = `<div class="uyari">${esc(m.hata)}</div>`; return; }
  const govde = m.html ? `<iframe sandbox="" srcdoc="${esc(m.html)}"></iframe>` : `<pre>${esc(m.metin || '(boş)')}</pre>`;
  const ekler = (m.ekler && m.ekler.length) ? `<div class="ekler">${m.ekler.map(e => `<button class="ek" data-ek="${e.i}" title="İndir">📎 ${esc(e.ad)} <i>${boyutYaz(e.boyut)}</i></button>`).join('')}</div>` : '';
  $('#sag').innerHTML = `
    <div class="okbas">
      <button class="btn sm" id="yanitBtn">↩ Yanıtla</button>
      <button class="btn sm" id="yilBtn">${m0.yildiz ? '★ Yıldızı kaldır' : '☆ Yıldızla'}</button>
      <button class="btn sm" id="okunBtn">● Okunmadı</button>
      <span style="flex:1"></span>
      <button class="btn sm" id="silBtn">🗑 Sil</button></div>
    <div class="okuma">
      <h2>${esc(m.konu)}</h2>
      <div class="meta"><b>${esc(m.kimden)}</b></div>
      <div class="meta">${esc(m.kime ? 'Kime: ' + m.kime : '')} · ${esc(tarih(m.tarih, true))}</div>
      ${ekler}<div class="govde">${govde}</div></div>`;
  $('#yanitBtn').onclick = () => yazModal({ kime: m.kimdenAdres, konu: /^re:/i.test(m.konu) ? m.konu : 'Re: ' + m.konu, inReplyTo: m.messageId, references: ((m.references || '') + ' ' + (m.messageId || '')).trim() }, hid);
  $('#silBtn').onclick = () => eylemle(m0, 'sil');
  $('#yilBtn').onclick = () => eylemle(m0, m0.yildiz ? 'yildizKaldir' : 'yildiz');
  $('#okunBtn').onclick = () => eylemle(m0, 'okunmadi');
  $('#sag').querySelectorAll('.ek').forEach(b => b.onclick = async () => { b.disabled = true; const r = await window.imapi.ekIndir(hid, klasor, m0.uid, +b.dataset.ek); b.disabled = false; if (r.hata) alert(r.hata); else if (r.ok) b.classList.add('indi'); });
  if (!m0.okundu) { m0.okundu = true; cizListe(); sayac(); }
}
async function eylemle(m0, eylem) {
  const { hid, klasor } = enf(m0);
  const r = await window.imapi.isle(hid, klasor, m0.uid, eylem, eylem === 'sil' ? { copYol: S.tum ? null : copYol() } : {});
  if (r.hata) { alert(r.hata); return; }
  if (eylem === 'sil') { S.mesajlar = S.mesajlar.filter(x => x !== m0); S.uid = null; cizListe(); cizOkuma(); sayac(); }
  else { if (eylem === 'yildiz') m0.yildiz = true; if (eylem === 'yildizKaldir') m0.yildiz = false; if (eylem === 'okunmadi') m0.okundu = false; cizListe(); sayac(); if (m0.uid === S.uid && eylem !== 'okunmadi') acMesaj(m0); }
}
function cizOkuma() { const el = $('#sag'); if (!el) return; el.innerHTML = `<div class="bos"><div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg><p>Okumak için bir posta seç</p></div></div>`; }
function tarih(d, tam) {
  if (!d) return ''; const t = new Date(d); if (isNaN(t)) return '';
  if (!tam && t.toDateString() === new Date().toDateString()) return t.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  return t.toLocaleDateString('tr-TR', tam ? { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' } : { day: 'numeric', month: 'short' });
}

let yazEkler = [];
function yazModal(on = {}, gonderHid) {
  yazEkler = []; const hid = gonderHid || S.hid || (S.hesaplar[0] && S.hesaplar[0].id);
  const h = S.hesaplar.find(x => x.id === hid);
  const m = $('#modal');
  m.innerHTML = `<div class="ort"><div class="kutu">
    <h3>Yeni e-posta</h3>
    <p class="alt">Gönderen: <b>${esc(h ? (h.ad || h.eposta) : '')}</b></p>
    <label class="alan">Kime</label><input id="kime" value="${esc(on.kime || '')}" placeholder="alici@ornek.com">
    <label class="alan">Konu</label><input id="konu" value="${esc(on.konu || '')}">
    <label class="alan">İleti</label><textarea id="metin" rows="8" style="width:100%;font:inherit;padding:10px 12px;border:1px solid var(--line);border-radius:8px;background:var(--bg2);color:var(--fg);resize:vertical"></textarea>
    <div class="ekcubuk"><button class="btn sm" id="ekBtn">📎 Dosya ekle</button><span id="ekAd" class="not"></span></div>
    <div class="onayed"><button class="btn" id="vaz">Vazgeç</button><button class="btn ana" id="yolla">Gönder</button></div>
    <p class="not" id="durum"></p></div></div>`;
  $('#vaz').onclick = () => m.innerHTML = '';
  $('#ekBtn').onclick = async () => { const y = await window.imapi.dosyaSec(); if (y && y.length) { yazEkler = yazEkler.concat(y); $('#ekAd').textContent = yazEkler.map(p => p.split(/[\\/]/).pop()).join(', '); } };
  $('#yolla').onclick = async () => {
    const veri = { kime: $('#kime').value.trim(), konu: $('#konu').value.trim(), metin: $('#metin').value, inReplyTo: on.inReplyTo, references: on.references, ekYollar: yazEkler };
    if (!veri.kime) { $('#durum').style.color = 'var(--danger)'; $('#durum').textContent = 'Alıcı gerekli.'; return; }
    $('#yolla').disabled = true; $('#durum').style.color = 'var(--fg3)'; $('#durum').textContent = 'Gönderiliyor…';
    const r = await window.imapi.gonder(hid, veri);
    if (r.hata) { $('#yolla').disabled = false; $('#durum').style.color = 'var(--danger)'; $('#durum').textContent = r.hata; return; }
    $('#durum').style.color = 'var(--acc)'; $('#durum').textContent = 'Gönderildi ✓'; setTimeout(() => m.innerHTML = '', 900);
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
    <p class="not" id="durum" style="color:var(--danger)"></p></div></div>`;
  const sg = $('#sg'), uy = () => { const v = SAG[sg.value]; $('#host').value = v.host; $('#port').value = v.port; $('#smtpHost').value = v.smtpHost; $('#smtpPort').value = v.smtpPort; $('#not').innerHTML = v.not; };
  sg.onchange = uy; uy();
  $('#vaz').onclick = () => m.innerHTML = '';
  $('#kaydet').onclick = async () => {
    const v = { ad: $('#ad').value.trim(), eposta: $('#eposta').value.trim(), host: $('#host').value.trim(), port: $('#port').value.trim(), smtpHost: $('#smtpHost').value.trim(), smtpPort: $('#smtpPort').value.trim(), parola: $('#parola').value };
    if (!v.eposta || !v.host || !v.parola) { $('#durum').textContent = 'E-posta, IMAP sunucusu ve parola gerekli.'; return; }
    $('#kaydet').disabled = true; $('#durum').style.color = 'var(--fg3)'; $('#durum').textContent = 'Kaydediliyor…';
    const h = await window.imapi.hesapEkle(v);
    S.hesaplar = await window.imapi.hesaplar(); m.innerHTML = ''; render(); await secHesap(h.id);
  };
}
init();
