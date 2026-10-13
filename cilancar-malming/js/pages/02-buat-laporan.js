/* Titik 2 – Buat Laporan
   Kelas: CreateReportPage  ·  terhubung lewat svc.* (core.js) dan Router/Acts (app.js) */
const Create = { prefill: null, form: null };
const MAX_PHOTOS = 3;
class CreateReportPage {
  static watch = [];
  static enter(params) {
    const ex = params.id ? svc.reports.find(params.id) : null;
    const pf = Create.prefill; Create.prefill = null;
    Create.form = { editId: ex ? ex.id : null, exists: !params.id || !!ex, type: ex ? ex.type : 'sumbatan', severity: ex ? ex.severity : 'ringan', photos: ex ? [...ex.photos] : [], note: ex ? ex.note : '', place: ex ? { ...ex.location } : pf ? { ...pf.location } : { ...DEFAULT_LOCATION }, locating: false, error: '' };
    if (!ex && !pf) Create.detect(true);
  }
  static html() {
    const f = Create.form;
    if (!f.exists) return `<div class="page">${pageHeader({ title: t('title.edit'), back: '/laporan' })}<p class="muted">Laporan tidak ditemukan.</p></div>`;
    const types = f.type === 'banjir' && f.editId ? ['banjir'] : FORM_TYPES;
    return `<div class="page narrow">${pageHeader({ title: f.editId ? t('title.edit') : t('title.create'), back: f.editId ? '/laporan/' + f.editId : '/' })}
      <div class="form-grid"><div class="form-col">
        <div class="seg">${types.map((k) => `<button class="${f.type === k ? 'on' : ''}" data-act="ctype" data-k="${k}">${TYPES[k].label}</button>`).join('')}</div>
        <h3 class="sec">${TYPES[f.type].sev}</h3>
        <div class="sev">${SEVERITIES.map((s) => `<button class="sev-${s.key} ${f.severity === s.key ? 'on' : ''}" data-act="csev" data-k="${s.key}">${s.label}</button>`).join('')}</div>
        <h3 class="sec">Catatan Tambahan <small>(Opsional)</small></h3>
        <textarea class="input" rows="4" data-in="note" placeholder="Tuliskan keterangan tambahan...">${esc(f.note)}</textarea>
      </div><div class="form-col">
        <h3 class="sec">Foto Kondisi <small>(Opsional)</small></h3>
        <div class="photos">${f.photos.map((s, i) => `<div class="photo"><img src="${esc(s)}" alt="Foto ${i + 1}" data-act="cphoto" data-i="${i}"><button aria-label="Hapus foto" data-act="cdelphoto" data-i="${i}">${icon('close', 14)}</button></div>`).join('')}
        ${f.photos.length < MAX_PHOTOS ? `<button class="photo add" data-act="caddphoto" aria-label="Tambah foto">${icon('camera', 28)}</button>` : ''}</div>
        <h3 class="sec">Lokasi Otomatis</h3>
        <div class="locbox"><span class="loc-pin">${icon('pin', 20)}</span><div class="loc-tx"><input data-in="addr" value="${esc(f.place.address)}" aria-label="Alamat lokasi"><small>${f.place.lat}, ${f.place.lng}</small></div>
        <button class="icon-btn loc-btn ${f.locating ? 'spin' : ''}" data-act="cloc" aria-label="Gunakan lokasi saya">${icon('locate', 18)}</button></div>
        ${f.error ? `<p class="err">${esc(f.error)}</p>` : ''}
      </div></div>
      <div class="submit-bar"><button class="btn btn-red btn-block btn-lg" data-act="csubmit">${f.editId ? 'Simpan Perubahan' : 'Kirim Laporan'}</button></div>
      <input id="file-in" type="file" accept="image/*" multiple hidden data-chg="cfiles"></div>`;
  }
}
Pages.create = CreateReportPage;
Create.redraw = () => { if (cur() && cur().name === 'create') Router.render(); };
Create.detect = async (silent) => {
  const f = Create.form; f.locating = true; Create.redraw();
  try { f.place = await locate(); if (!silent) svc.toasts.success('Lokasi diperbarui'); } catch (e) { if (!silent) svc.toasts.error('Lokasi gagal', e.message); }
  f.locating = false; Create.redraw();
};
Create.addPhoto = (d) => { if (Create.form.photos.length >= MAX_PHOTOS) return svc.toasts.error('Maksimal 3 foto'); Create.form.photos.push(d); Create.redraw(); };
Acts.ctype = (el) => { Create.form.type = el.dataset.k; Create.redraw(); };
Acts.csev = (el) => { Create.form.severity = el.dataset.k; Create.redraw(); };
Acts.cphoto = (el) => Modal.photo(Create.form.photos[+el.dataset.i], 'Foto');
Acts.cdelphoto = (el) => { Create.form.photos.splice(+el.dataset.i, 1); Create.redraw(); };
Acts.cloc = () => Create.detect(false);
/* pemilih berkas dibuat langsung saat tombol ditekan (tidak bergantung elemen tersembunyi di halaman) */
Create.pickFiles = () => {
  const i = document.createElement('input');
  i.type = 'file'; i.accept = 'image/*'; i.multiple = true; i.style.display = 'none';
  i.onchange = () => { Changes.cfiles(i); i.remove(); };
  document.body.appendChild(i); i.click();
};
Acts.caddphoto = () => {
  Modal.open({ title: 'Tambah Foto', draw(c) {
    c.body.innerHTML = `<div class="choice"><button class="choice-b" data-cam><span class="tile tile-red">${icon('camera', 24)}</span><b>Ambil dengan Kamera</b><small>Foto langsung di lokasi</small></button>
      <button class="choice-b" data-gal><span class="tile tile-blue">${icon('image', 24)}</span><b>Pilih dari Galeri</b><small>Maksimal ${MAX_PHOTOS} foto</small></button></div>`;
    c.actions.innerHTML = '';
    c.q('[data-cam]').onclick = () => { c.close(); openCamera({ onCapture: Create.addPhoto, onGallery: Create.pickFiles }); };
    c.q('[data-gal]').onclick = () => { c.close(); Create.pickFiles(); };
  } });
};
Inputs.note = (el) => { Create.form.note = el.value; };
Inputs.addr = (el) => { Create.form.place.address = el.value; };
Changes.cfiles = async (el) => {
  const files = [...el.files]; el.value = '';
  const room = MAX_PHOTOS - Create.form.photos.length;
  for (const file of files.slice(0, room)) { try { Create.form.photos.push(await resizeImage(file)); } catch (e) { svc.toasts.error('Foto tidak dapat dibaca'); } }
  if (files.length > room) svc.toasts.error('Maksimal 3 foto');
  Create.redraw();
};
Acts.csubmit = () => {
  const f = Create.form;
  if (!f.place.address.trim()) { f.error = 'Alamat lokasi wajib diisi.'; return Create.redraw(); }
  const data = { type: f.type, severity: f.severity, note: f.note.trim(), photos: f.photos, location: f.place };
  if (f.editId) { svc.reports.update(f.editId, data); svc.toasts.success('Laporan diperbarui'); go('/laporan/' + f.editId); }
  else {
    const { report, photosDropped } = svc.reports.create(data);
    if (photosDropped) svc.toasts.error('Penyimpanan penuh', 'Laporan terkirim tanpa foto.');
    go('/laporan/' + report.id);
  }
};

