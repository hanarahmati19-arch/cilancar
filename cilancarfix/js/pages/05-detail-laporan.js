/* Titik 5 – Detail Laporan
   Kelas: ReportDetailPage  ·  terhubung lewat svc.* (core.js) dan Router/Acts (app.js) */
class ReportDetailPage {
  static watch = ['reports'];
  static html(p) {
    const r = svc.reports.find(p.id);
    if (!r) return `<div class="page narrow">${pageHeader({ title: t('title.detail'), back: '/laporan' })}${empty('report', 'Laporan tidak ditemukan', '', '<button class="btn btn-blue" data-go="/laporan">Ke Riwayat</button>')}</div>`;
    const idx = STATUSES.findIndex((s) => s.key === r.status), sev = SEVERITIES.find((s) => s.key === r.severity);
    const info = (ic, label, inner) => `<div class="info-row"><span class="info-ic">${icon(ic, 18)}</span><div><small>${label}</small>${inner}</div></div>`;
    return `<div class="page narrow">${pageHeader({ title: t('title.detail'), back: '/laporan', sub: r.id })}
      <section class="card detail-top">${typeTile(r.type, 52)}<div class="row-tx"><b class="big">${esc(typeTitle(r))}</b><small>${fmtDate(r.createdAt)}</small></div>${statusPill(r.status)}</section>
      ${r.emergency ? `<div class="banner-red">${icon('alert', 18)} Laporan darurat — prioritas tertinggi</div>` : ''}
      <section class="card info">${info('alert', 'Tingkat kondisi', `<span class="sev-tag sev-${r.severity}">${sev.label}</span>`)}${info('pin', 'Lokasi', `<b>${esc(r.location.address)}</b><small>${r.location.lat}, ${r.location.lng}</small>`)}${info('user', 'Pelapor', `<b>${esc(r.reporter)}</b>`)}${info('report', 'Catatan', r.note ? `<span>${esc(r.note)}</span>` : '<em class="muted">Tidak ada catatan</em>')}</section>
      <h3 class="sec">Foto Bukti</h3>
      ${r.photos.length ? `<div class="photos">${r.photos.map((s, i) => `<div class="photo"><img src="${esc(s)}" alt="Bukti ${i + 1}" data-act="dphoto" data-i="${i}"></div>`).join('')}</div>` : '<p class="muted">Pelapor tidak melampirkan foto.</p>'}
      <h3 class="sec">Perkembangan</h3>
      <section class="card timeline">${STATUSES.map((s, i) => { const h = r.history.find((x) => x.status === s.key); return `<div class="tl ${i <= idx ? 'done' : ''} ${i === idx ? 'now' : ''}"><i>${i <= idx ? icon('check', 12, 3) : ''}</i><div><b>${s.label}</b><small>${h ? fmtDate(h.at) : 'Menunggu'}</small></div></div>`; }).join('')}</section>
      <div class="detail-actions"><button class="btn btn-blue" data-act="dchat" data-id="${r.id}">${icon('chat', 18)} Tanya Dinas</button><button class="btn btn-soft" data-go="/laporan/${r.id}/ubah">${icon('edit', 18)} Ubah</button><button class="btn btn-soft danger-text" data-act="ddel" data-id="${r.id}">${icon('trash', 18)} Hapus</button></div>
      ${idx < STATUSES.length - 1 ? `<details class="demo card" data-keep="ddemo" ${KEEP.ddemo ? 'open' : ''}><summary>Mode uji petugas (simulasi)</summary><p class="muted">Majukan status seolah petugas dinas memproses laporan; notifikasi akan masuk ke warga.</p><button class="btn btn-ghost" data-act="dadv" data-id="${r.id}">Majukan ke “${STATUSES[idx + 1].label}”</button></details>` : ''}</div>`;
  }
}
Pages.detail = ReportDetailPage;
Acts.dphoto = (el) => { const r = svc.reports.find(cur().params.id); if (r) Modal.photo(r.photos[+el.dataset.i], 'Foto Bukti'); };
Acts.dchat = (el) => { Chat.ref = el.dataset.id; go('/chat'); };
Acts.dadv = (el) => svc.reports.advance(el.dataset.id);
Acts.ddel = (el) => Modal.confirm({ title: 'Hapus laporan?', text: 'Laporan ini akan dihapus permanen dari riwayat Anda.', confirmLabel: 'Hapus', danger: true, onConfirm: () => { svc.reports.remove(el.dataset.id); svc.toasts.success('Laporan dihapus'); go('/laporan'); } });

