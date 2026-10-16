/* Registri aksi + popup yang dipakai banyak halaman (PointModal, Laporan Darurat) */
/* =========================================================
   CILANCAR – 8 halaman (+ login). Tiap halaman: html(), mount(), watch[]
   ========================================================= */
const Acts = {};     // aksi klik   : data-act="nama"
const Inputs = {};   // aksi input  : data-in="nama"
const Changes = {};  // aksi change : data-chg="nama"
const Forms = {};    // aksi submit : data-form="nama"
const KEEP = {};     // status <details> agar tidak menutup saat refresh otomatis
const Pages = {};
const go = (p) => { location.hash = '#' + p; };
const cur = () => Router.current;

Acts.theme = () => svc.settings.toggleTheme();

/* ====================== komponen popup bersama ====================== */
function pointFormHtml(f) {
  return `<div class="form">
    <label class="field"><span>Nama titik</span><input data-f="name" value="${esc(f.name)}" placeholder="mis. Jl. Raya Dayeuhkolot"></label>
    <label class="field"><span>Alamat</span><input data-f="address" value="${esc(f.address)}" placeholder="Alamat lengkap"></label>
    <div class="two"><label class="field"><span>Kapasitas alat (%)</span><input type="number" min="0" max="100" data-f="bin" value="${f.bin}"></label>
    <label class="field"><span>Tinggi air (cm)</span><input type="number" min="0" max="100" data-f="water" value="${f.water}"></label></div></div>`;
}
const readForm = (c) => Object.fromEntries(c.qa('[data-f]').map((i) => [i.dataset.f, i.value]));

function openPoint(id) {
  let mode = 'view', unsub = () => {};
  const ctl = Modal.open({ title: '', onClose: () => unsub(), draw(c) {
    const p = svc.sensors.find(id); if (!p) { c.close(); return; }
    const cfg = svc.settings.get(), st = pointStatus(p, cfg), why = pointReason(p, cfg), tone = pointBarTone(p, cfg);
    if (mode === 'delete') {
      c.title('Hapus titik?');
      c.body.innerHTML = `<p class="muted">Titik “${esc(p.name)}” beserta pantauannya akan dihapus dari peta.</p>`;
      c.actions.innerHTML = `<button class="btn btn-ghost" data-n>Batal</button><button class="btn btn-red" data-y>Hapus</button>`;
      c.q('[data-n]').onclick = () => { mode = 'view'; c.redraw(); };
      c.q('[data-y]').onclick = () => { svc.sensors.remove(p.id); svc.toasts.success('Titik dihapus'); c.close(); };
    } else if (mode === 'edit') {
      c.title('Ubah Titik Drainase');
      c.body.innerHTML = pointFormHtml({ name: p.name, address: p.address, bin: Math.round(p.bin), water: Math.round(p.water) });
      c.actions.innerHTML = `<button class="btn btn-ghost" data-n>Batal</button><button class="btn btn-blue" data-y>Simpan</button>`;
      c.q('[data-n]').onclick = () => { mode = 'view'; c.redraw(); };
      c.q('[data-y]').onclick = () => {
        const f = readForm(c); if (!f.name.trim()) return;
        svc.sensors.update(p.id, { name: f.name.trim(), address: f.address.trim(), bin: +f.bin, water: +f.water });
        svc.toasts.success('Titik diperbarui'); mode = 'view'; c.redraw();
      };
    } else {
      c.title(p.name);
      c.body.innerHTML = `<div class="point-head"><span class="muted">${icon('pin', 16)} ${esc(p.address)}</span>${pointPill(st)}</div>
        <p class="point-why">${st === 'normal' ? 'Semua pembacaan sensor dalam batas aman.' : 'Perlu perhatian: ' + why.text + '.'}</p>
        ${gauge('Kapasitas alat', p.bin, '%', tone.bin)}${gauge('Tinggi air', p.water, ' cm', tone.water, Math.max(60, cfg.floodThreshold * 1.5))}
        ${p.updatedAt ? `<small class="muted">Diperbarui ${timeAgo(p.updatedAt)}</small>` : ''}
        <div class="stack-actions">
          <button class="btn btn-red btn-block" data-rep>${icon('report', 18)} Buat laporan di titik ini</button>
          <div class="row-actions"><button class="btn btn-soft" data-clean>${icon('refresh', 16)} Tandai dibersihkan</button><button class="btn btn-soft" data-edit>${icon('edit', 16)} Ubah</button><button class="btn btn-soft danger-text" data-del>${icon('trash', 16)} Hapus</button></div>
          <details class="demo"><summary>Mode uji (simulasi sensor)</summary><div class="row-actions"><button class="btn btn-ghost btn-sm" data-full>Simulasikan alat penuh</button><button class="btn btn-ghost btn-sm" data-rain>Simulasikan air naik</button></div></details>
        </div>`;
      c.actions.innerHTML = '';
      c.q('[data-rep]').onclick = () => { c.close(); Create.prefill = { location: { address: p.address, lat: p.lat ?? DEFAULT_LOCATION.lat, lng: p.lng ?? DEFAULT_LOCATION.lng } }; go('/laporan/baru'); };
      c.q('[data-clean]').onclick = () => svc.sensors.clean(p.id);
      c.q('[data-edit]').onclick = () => { mode = 'edit'; c.redraw(); };
      c.q('[data-del]').onclick = () => { mode = 'delete'; c.redraw(); };
      c.q('[data-full]').onclick = () => svc.sensors.simulateFull(p.id);
      c.q('[data-rain]').onclick = () => svc.sensors.simulateRain(p.id);
    }
  } });
  unsub = svc.sensors.subscribe(() => { if (mode === 'view' && ctl.el.isConnected) { const d = ctl.q('details'); const o = d && d.open; ctl.redraw(); const d2 = ctl.q('details'); if (d2 && o) d2.open = true; } });
}
Acts.point = (el) => openPoint(el.dataset.id);

function openEmergency() {
  Modal.open({ title: 'Laporan Darurat', tone: 'red', draw(c) {
    c.body.innerHTML = `<div class="emerg"><span class="emerg-ic">${icon('alert', 30)}</span><div><b>Banjir mengancam?</b><p class="muted">Laporan dikirim dengan prioritas tertinggi dan petugas langsung diberi tahu lewat Bot Telegram.</p></div></div>
      <label class="field"><span>Keterangan singkat (opsional)</span><textarea rows="3" data-f="note" placeholder="mis. Air naik cepat, sudah masuk rumah"></textarea></label>
      <small class="muted">Lokasi diambil otomatis dari GPS perangkat Anda.</small>`;
    c.actions.innerHTML = `<button class="btn btn-ghost" data-n>Batal</button><button class="btn btn-red" data-y>Kirim Laporan Darurat</button>`;
    c.q('[data-n]').onclick = () => c.close();
    c.q('[data-y]').onclick = async (e) => {
      e.target.disabled = true; e.target.textContent = 'Mengirim…';
      let loc = { ...DEFAULT_LOCATION };
      try { loc = await locate(); } catch (er) { svc.toasts.show({ title: 'Lokasi GPS tidak tersedia', body: 'Memakai lokasi default. Anda bisa mengubahnya lewat Ubah laporan.', kind: 'info' }); }
      const { report } = svc.reports.create({ type: 'banjir', severity: 'berat', emergency: true, note: c.q('[data-f=note]').value.trim() || 'Laporan darurat banjir mengancam.', location: loc, photos: [] });
      c.close(); go('/laporan/' + report.id);
    };
  } });
}
Acts.emergency = openEmergency;

