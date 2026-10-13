/* Titik 3 – Riwayat Laporan
   Kelas: ReportHistoryPage  ·  terhubung lewat svc.* (core.js) dan Router/Acts (app.js) */
const Hist = { f: 'semua', q: '' };
const HIST_FILTERS = [['semua', 'Semua'], ['dikirim', 'Dikirim'], ['diverifikasi', 'Diverifikasi'], ['diproses', 'Diproses'], ['selesai', 'Selesai']];
function histList() {
  const list = svc.reports.get().filter((r) => (Hist.f === 'semua' || r.status === Hist.f) && (!Hist.q || `${typeTitle(r)} ${r.location.address} ${r.id}`.toLowerCase().includes(Hist.q.toLowerCase())));
  if (!list.length) return empty('report', 'Tidak ada laporan', Hist.q || Hist.f !== 'semua' ? 'Coba ubah filter atau kata kunci.' : 'Laporan yang Anda buat akan muncul di sini.', '<button class="btn btn-red" data-go="/laporan/baru">Buat Laporan</button>');
  return `<div class="card list-card">${list.map((r) => `<button class="row" data-go="/laporan/${r.id}">${typeTile(r.type)}<span class="row-tx"><b>${esc(typeTitle(r))}</b><small>${esc(r.location.address)}</small><small>${fmtDate(r.createdAt)}</small></span>${statusPill(r.status)}</button>`).join('')}</div>`;
}
class ReportHistoryPage {
  static watch = ['reports'];
  static html() {
    const all = svc.reports.get(), count = (k) => (k === 'semua' ? all.length : all.filter((r) => r.status === k).length);
    return `<div class="page narrow">${pageHeader({ title: t('title.history'), back: '/', right: `<button class="btn btn-red btn-sm" data-go="/laporan/baru">${icon('plus', 16)} Baru</button>` })}
      <div class="search">${icon('search', 18)}<input data-in="histq" value="${esc(Hist.q)}" placeholder="Cari laporan atau lokasi…"></div>
      <div class="chips" id="hist-chips">${HIST_FILTERS.map(([k, l]) => `<button class="chip ${Hist.f === k ? 'on' : ''}" data-act="hfilter" data-k="${k}">${l} <em>${count(k)}</em></button>`).join('')}</div>
      <div id="hist-list">${histList()}</div></div>`;
  }
  static update() { const l = document.getElementById('hist-list'); if (l) l.innerHTML = histList(); }
}
Pages.history = ReportHistoryPage;
Acts.hfilter = (el) => { Hist.f = el.dataset.k; Router.render(); };
Inputs.histq = (el) => { Hist.q = el.value; Pages.history.update(); };

