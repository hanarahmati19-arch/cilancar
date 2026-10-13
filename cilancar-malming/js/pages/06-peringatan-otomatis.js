/* Titik 6 – Peringatan Otomatis (notifikasi warga + Bot Telegram)
   Kelas: AlertNotificationPage  ·  terhubung lewat svc.* (core.js) dan Router/Acts (app.js) */
const Notif = { tab: 'all' };
class AlertNotificationPage {
  static watch = ['notifications'];
  static html() {
    const list = svc.notifications.get(), unread = svc.notifications.unread();
    const shown = list.filter((n) => Notif.tab === 'all' || (Notif.tab === 'alert' ? n.kind === 'alert' : n.kind === 'report'));
    return `<div class="page narrow">${pageHeader({ title: t('title.notif'), back: '/', right: unread ? '<button class="link" data-act="nall">Tandai dibaca</button>' : '' })}
      <div class="chips">${[['all', 'Semua'], ['alert', 'Peringatan'], ['report', 'Laporan']].map(([k, l]) => `<button class="chip ${Notif.tab === k ? 'on' : ''}" data-act="ntab" data-k="${k}">${l}</button>`).join('')}${list.length ? '<button class="chip ghost" data-act="nclear">Hapus semua</button>' : ''}</div>
      ${shown.length ? `<div class="card list-card">${shown.map((n) => `<div class="notif ${n.read ? '' : 'unread'}"><button class="notif-main" data-act="nopen" data-id="${n.id}"><span class="notif-ic ic-${n.kind}">${icon(n.kind === 'alert' ? 'alert' : 'bell', 18)}</span><span class="row-tx"><b>${esc(n.title)}</b><small>${esc(n.body)}</small><small class="when">${timeAgo(n.at)}</small></span>${icon('chevron', 16)}</button><button class="icon-btn sm" data-act="ndel" data-id="${n.id}" aria-label="Hapus notifikasi">${icon('trash', 16)}</button></div>`).join('')}</div>` : empty('bell', 'Belum ada notifikasi', 'Peringatan alat penuh, risiko banjir, dan status laporan akan muncul di sini.')}
      <section class="emerg-card"><div><h3>Laporan Darurat</h3><b>Banjir Mengancam?</b><p>Laporkan sekarang untuk penanganan cepat</p></div><span class="emerg-ic">${icon('alert', 38, 1.6)}</span><button class="btn btn-red btn-block" data-act="emergency">Laporkan Darurat</button></section></div>`;
  }
}
Pages.notif = AlertNotificationPage;
Acts.ntab = (el) => { Notif.tab = el.dataset.k; Router.render(); };
Acts.nall = () => svc.notifications.markAll();
Acts.ndel = (el) => svc.notifications.remove(el.dataset.id);
Acts.nclear = () => Modal.confirm({ title: 'Hapus semua notifikasi?', text: 'Semua notifikasi akan dihapus dari perangkat ini.', confirmLabel: 'Hapus semua', danger: true, onConfirm: () => svc.notifications.clear() });
Acts.nopen = (el) => {
  const n = svc.notifications.get().find((x) => x.id === el.dataset.id); if (!n) return;
  svc.notifications.markRead(n.id);
  Modal.open({ title: n.title, draw(c) {
    c.body.innerHTML = `<p>${esc(n.body)}</p><small class="muted">${fmtDate(n.at)}</small>`;
    c.actions.innerHTML = n.link ? `<button class="btn btn-ghost" data-n>Tutup</button><button class="btn btn-blue" data-y>${n.link.startsWith('/peta') ? 'Lihat di Peta' : 'Buka Laporan'}</button>` : '';
    if (n.link) { c.q('[data-n]').onclick = () => c.close(); c.q('[data-y]').onclick = () => { c.close(); go(n.link); }; }
  } });
};

