/* Titik 8 – Pengaturan Akun
   Kelas: AccountPage  ·  terhubung lewat svc.* (core.js) dan Router/Acts (app.js) */
const FAQ = [
  ['Bagaimana cara membuat laporan?', 'Buka Beranda → Buat Laporan, pilih jenis masalah dan tingkat kondisinya, tambahkan foto (kamera atau galeri), pastikan lokasi benar, lalu tekan Kirim Laporan.'],
  ['Apa arti warna pada peta?', 'Hijau = normal, kuning = perlu diwaspadai, merah = berisiko (alat hampir penuh atau tinggi air melewati batas).'],
  ['Kapan saya mendapat peringatan?', 'Saat kapasitas alat CILANCAR mencapai batas (default 80%) atau tinggi air menunjukkan risiko banjir. Petugas juga diberi tahu lewat Bot Telegram.'],
  ['Apa arti status laporan?', 'Dikirim → Diverifikasi (dicek dinas) → Diproses (petugas bertindak) → Selesai.'],
  ['Kapan memakai Laporan Darurat?', 'Hanya saat banjir mengancam dan membutuhkan penanganan segera.'],
];
class AccountPage {
  static watch = ['account', 'settings'];
  static html() {
    const u = svc.account.get().user, cfg = svc.settings.get();
    const item = (ic, label, k, val = '', cls = '') => `<button class="row menu-row ${cls}" data-act="acc" data-k="${k}"><span class="mi">${icon(ic, 20)}</span><span class="row-tx"><b>${label}</b></span>${val ? `<small class="muted">${val}</small>` : ''}${k === 'logout' ? '' : icon('chevron', 16)}</button>`;
    return `<div class="page narrow">${pageHeader({ title: t('title.account'), back: '/' })}
      <button class="card profile" data-act="acc" data-k="profile">${avatar(u.name, 64)}<span class="row-tx"><b class="big">${esc(u.name)}</b><small>${esc(u.email)}</small><small>${esc(u.phone)}</small></span>${icon('edit', 18)}</button>
      <div class="card list-card">${item('user', 'Profil Saya', 'profile')}${item('bell', 'Pengaturan Notifikasi', 'notif')}${item('globe', 'Bahasa', 'lang', cfg.lang === 'id' ? 'Indonesia' : 'English')}${item(svc.settings.isDark() ? 'moon' : 'sun', 'Tampilan', 'theme', { system: 'Otomatis', light: 'Terang', dark: 'Gelap' }[cfg.theme])}${item('help', 'Bantuan &amp; FAQ', 'faq')}${item('info', 'Tentang CILANCAR', 'about')}</div>
      <div class="card list-card">${item('refresh', 'Reset Data Demo', 'reset')}${item('logout', 'Keluar', 'logout', '', 'danger-text')}</div></div>`;
  }
}
Pages.account = AccountPage;
const optList = (opts, cur2) => `<div class="opts">${opts.map(([k, l]) => `<button class="opt ${cur2 === k ? 'on' : ''}" data-opt="${k}">${l}${cur2 === k ? icon('check', 18) : ''}</button>`).join('')}</div>`;
Acts.acc = (el) => {
  const k = el.dataset.k, u = svc.account.get().user;
  if (k === 'profile') Modal.open({ title: 'Profil Saya', draw(c) {
    c.body.innerHTML = `<div class="form"><label class="field"><span>Nama lengkap</span><input data-f="name" value="${esc(u.name)}"></label><label class="field"><span>Email</span><input type="email" data-f="email" value="${esc(u.email)}"></label><label class="field"><span>No. HP</span><input type="tel" data-f="phone" value="${esc(u.phone)}"></label><p class="err" data-err></p><small class="muted">Bergabung ${fmtDate(u.joinedAt)}</small></div>`;
    c.actions.innerHTML = '<button class="btn btn-ghost" data-n>Batal</button><button class="btn btn-blue" data-y>Simpan</button>';
    c.q('[data-n]').onclick = () => c.close();
    c.q('[data-y]').onclick = () => {
      const f = readForm(c), er = c.q('[data-err]');
      if (!f.name.trim()) return (er.textContent = 'Nama wajib diisi.');
      if (!/^\S+@\S+\.\S+$/.test(f.email)) return (er.textContent = 'Format email tidak valid.');
      svc.account.update({ name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim() }); svc.toasts.success('Profil disimpan'); c.close();
    };
  } });
  else if (k === 'notif') openNotifSettings();
  else if (k === 'lang') Modal.open({ title: 'Bahasa', draw(c) {
    c.body.innerHTML = optList([['id', 'Bahasa Indonesia'], ['en', 'English']], svc.settings.get().lang) + '<small class="muted">Menu dan judul halaman utama mengikuti bahasa yang dipilih.</small>'; c.actions.innerHTML = '';
    c.qa('[data-opt]').forEach((b) => (b.onclick = () => { svc.settings.update({ lang: b.dataset.opt }); c.close(); Shell.draw(); }));
  } });
  else if (k === 'theme') Modal.open({ title: 'Tampilan', draw(c) {
    c.body.innerHTML = optList([['system', 'Otomatis (ikuti perangkat)'], ['light', 'Terang'], ['dark', 'Gelap']], svc.settings.get().theme); c.actions.innerHTML = '';
    c.qa('[data-opt]').forEach((b) => (b.onclick = () => { svc.settings.update({ theme: b.dataset.opt }); c.redraw(); }));
  } });
  else if (k === 'faq') Modal.open({ title: 'Bantuan & FAQ', wide: true, draw(c) { c.body.innerHTML = FAQ.map(([q, a]) => `<details class="faq"><summary>${q}</summary><p>${a}</p></details>`).join(''); c.actions.innerHTML = ''; } });
  else if (k === 'about') Modal.open({ title: 'Tentang CILANCAR', draw(c) { c.body.innerHTML = '<p><b>CILANCAR</b> – Sistem Pelaporan Drainase &amp; Banjir. Warga melapor sumbatan, genangan, dan sampah, sementara alat CILANCAR memantau kapasitas bin dan tinggi air secara otomatis.</p><p class="muted">Versi 1.0.0 · Kabupaten Bandung (Dayeuhkolot, Bojongsoang, Baleendah)</p>'; c.actions.innerHTML = ''; } });
  else if (k === 'logout') Modal.confirm({ title: 'Keluar dari akun?', text: 'Data laporan tetap tersimpan di perangkat ini.', confirmLabel: 'Keluar', onConfirm: () => svc.account.logout() });
  else if (k === 'reset') Modal.confirm({ title: 'Reset data demo?', text: 'Laporan, notifikasi, chat, dan titik drainase dikembalikan ke data awal. Akun dan pengaturan tetap.', confirmLabel: 'Reset', danger: true, onConfirm: resetAllData });
};
function openNotifSettings() {
  let tg = { ...svc.settings.get().telegram };
  const ctl = Modal.open({ title: 'Pengaturan Notifikasi', wide: true, draw(c) {
    const cfg = svc.settings.get(), log = svc.telegram.get();
    const tog = (label, sub, key, on) => `<label class="toggle"><span><b>${label}</b>${sub ? `<small>${sub}</small>` : ''}</span><input type="checkbox" data-t="${key}" ${on ? 'checked' : ''}><i></i></label>`;
    c.body.innerHTML = `${tog('Peringatan alat penuh', 'Saat kapasitas mencapai batas', 'notifyBin', cfg.notifyBin)}${tog('Peringatan risiko banjir', 'Saat tinggi air melewati batas', 'notifyFlood', cfg.notifyFlood)}${tog('Notifikasi peramban', 'Muncul walau tab sedang di latar', 'browserPush', cfg.browserPush)}
      <div class="two"><label class="field"><span>Batas kapasitas alat (%)</span><input type="number" min="30" max="100" data-th="binThreshold" value="${cfg.binThreshold}"></label><label class="field"><span>Batas tinggi air (cm)</span><input type="number" min="10" max="100" data-th="floodThreshold" value="${cfg.floodThreshold}"></label></div>
      <h4 class="sec">Bot Telegram Petugas</h4><p class="muted">Isi token bot dan chat ID agar peringatan otomatis benar-benar terkirim ke petugas. Kosongkan untuk mode simulasi.</p>
      <div class="form"><label class="field"><span>Token bot</span><input data-tg="token" value="${esc(tg.token)}" placeholder="123456:ABC-DEF…" autocomplete="off"></label><label class="field"><span>Chat ID petugas / grup</span><input data-tg="chatId" value="${esc(tg.chatId)}" placeholder="-1001234567890"></label>
      <label class="toggle"><span><b>Kirim ke Telegram sungguhan</b></span><input type="checkbox" data-tg="enabled" ${tg.enabled ? 'checked' : ''}><i></i></label>
      <div class="row-actions"><button class="btn btn-soft" data-save>Simpan</button><button class="btn btn-ghost" data-test>Kirim pesan uji</button></div></div>
      <div class="sec-row"><h4 class="sec">Log pesan ke petugas</h4>${log.length ? '<button class="link" data-clr>Bersihkan</button>' : ''}</div>
      ${log.length ? `<div class="tglog">${log.slice(0, 6).map((l) => `<div><small>${fmtDate(l.at)} · <em class="st-${l.status}">${l.status}</em></small><p>${esc(l.text)}</p></div>`).join('')}</div>` : '<p class="muted">Belum ada pesan terkirim.</p>'}`;
    c.actions.innerHTML = '<button class="btn btn-blue" data-done>Selesai</button>';
    c.q('[data-done]').onclick = () => c.close();
    c.qa('[data-t]').forEach((i) => (i.onchange = async () => {
      if (i.dataset.t === 'browserPush') { if (i.checked) { const p = await svc.notifications.requestBrowserPermission(); if (p !== 'granted') svc.toasts.error('Izin notifikasi ditolak', 'Aktifkan lewat pengaturan peramban.'); } else svc.settings.update({ browserPush: false }); c.redraw(); }
      else svc.settings.update({ [i.dataset.t]: i.checked });
    }));
    c.qa('[data-th]').forEach((i) => (i.onchange = () => { const lim = i.dataset.th === 'binThreshold' ? [30, 100, 80] : [10, 100, 40]; svc.settings.update({ [i.dataset.th]: clamp(+i.value || lim[2], lim[0], lim[1]) }); }));
    c.qa('[data-tg]').forEach((i) => (i.oninput = () => { tg[i.dataset.tg] = i.type === 'checkbox' ? i.checked : i.value.trim(); }));
    c.q('[data-save]').onclick = () => { svc.settings.update({ telegram: { ...tg } }); svc.toasts.success('Bot Telegram disimpan'); };
    c.q('[data-test]').onclick = async (e) => { svc.settings.update({ telegram: { ...tg } }); e.target.disabled = true; e.target.textContent = 'Mengirim…'; await svc.telegram.send('✅ Uji koneksi Bot Telegram CILANCAR.'); c.redraw(); };
    const cl = c.q('[data-clr]'); if (cl) cl.onclick = () => { svc.telegram.clear(); c.redraw(); };
  } });
}

