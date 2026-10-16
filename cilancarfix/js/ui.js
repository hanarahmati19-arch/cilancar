/* =========================================================
   CILANCAR – komponen UI: ikon, modal, toast, helper HTML
   ========================================================= */
const ICONS = {
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  report: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/><path d="M9 13h7M9 17h5"/>',
  bell: '<path d="M6 17v-6a6 6 0 1112 0v6l1.5 2h-15z"/><path d="M10 21h4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v12H4z"/><circle cx="12" cy="13.5" r="3.6"/>',
  pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  locate: '<path d="M12 3l7 17-7-4-7 4z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/><path d="M10 11v5M14 11v5"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6L19 19M5 19l1.4-1.4M17.6 6.4L19 5"/>',
  moon: '<path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/>',
  send: '<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/>',
  clip: '<path d="M20 11l-8 8a5 5 0 01-7-7l9-9a3.5 3.5 0 015 5l-9 9a2 2 0 01-3-3l8-8"/>',
  alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',
  map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 114 2c-1 .7-1.5 1.2-1.5 2.5M12 17.5v.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  logout: '<path d="M10 4H5v16h5"/><path d="M15 8l4 4-4 4M19 12H9"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  chevron: '<path d="M9 5l7 7-7 7"/>',
  bin: '<path d="M5 7h14l-1 13H6z"/><path d="M4 7h16M9 7V4h6v3"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M4 18l5-5 4 4 3-3 4 4"/>',
  refresh: '<path d="M20 11a8 8 0 00-14-4M4 13a8 8 0 0014 4"/><path d="M6 3v4h4M18 21v-4h-4"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  flood: '<path d="M3 16c2 0 2-1.5 4.5-1.5S10 16 12 16s2.5-1.5 4.5-1.5S19 16 21 16"/><path d="M3 20c2 0 2-1.5 4.5-1.5S10 20 12 20s2.5-1.5 4.5-1.5S19 20 21 20"/><path d="M12 4l5 7H7z"/>',
  puddle: '<path d="M3 16c2 0 2-1.5 4.5-1.5S10 16 12 16s2.5-1.5 4.5-1.5S19 16 21 16"/><path d="M3 20c2 0 2-1.5 4.5-1.5S10 20 12 20s2.5-1.5 4.5-1.5S19 20 21 20"/><path d="M12 4s3.5 3.8 3.5 6.2a3.5 3.5 0 01-7 0C8.5 7.8 12 4 12 4z"/>',
  blockage: '<rect x="3" y="8" width="18" height="8" rx="2"/><path d="M8 8v8M12 8v8M16 8v8"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
  flip: '<path d="M4 8l3-3 3 3M7 5v9a3 3 0 003 3h1"/><path d="M20 16l-3 3-3-3M17 19v-9a3 3 0 00-3-3h-1"/>',
};
const icon = (n, size = 20, stroke = 1.8) => `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;

/* ---------- foto hero banjir: lokal -> online -> ilustrasi ---------- */
const HERO = {
  srcs: [
    'assets/banjir.jpg', // opsional: taruh foto banjir Anda sendiri di sini (dipakai paling dulu)
    // Foto banjir jalan Indonesia (Pexels, lisensi gratis) – diambil dari bingkai video pada
    // https://www.pexels.com/id-id/video/orang-orang-jalan-berjalan-area-9249395/
    'https://images.pexels.com/videos/9249395/pexels-photo-9249395.jpeg?auto=compress&cs=tinysrgb&h=627&fit=crop&w=1200',
    'https://images.pexels.com/videos/9249395/pexels-photo-9249395.jpeg?auto=compress&w=1260&h=750&dpr=1',
  ],
  resolved: null,
};
function heroImg() {
  if (HERO.resolved) return `<img class="hero-photo ok" src="${HERO.resolved}" alt="Foto banjir" />`;
  return `<img class="hero-photo" data-i="0" src="${HERO.srcs[0]}" alt="Foto banjir" referrerpolicy="no-referrer" onload="HERO.resolved=this.currentSrc||this.src;this.classList.add('ok')" onerror="heroNext(this)" />`;
}
function heroNext(img) {
  const i = (+img.dataset.i || 0) + 1;
  if (i < HERO.srcs.length) { img.dataset.i = i; img.src = HERO.srcs[i]; } else img.remove(); // tetap ada ilustrasi SVG di bawahnya
}
function floodScene(alert) {
  let rain = '';
  if (alert) for (let i = 0; i < 26; i++) rain += `<path d="M${20 + i * 23} ${10 + (i % 5) * 18} l-6 16" stroke="var(--scene-rain)" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>`;
  let win = '';
  [34, 58, 82].forEach((x) => [104, 130, 156].forEach((y) => (win += `<rect x="${x}" y="${y}" width="12" height="14" rx="2"/>`)));
  [130, 152].forEach((x) => [76, 104, 132, 160].forEach((y) => (win += `<rect x="${x}" y="${y}" width="12" height="14" rx="2"/>`)));
  [346, 370].forEach((x) => [100, 128, 156].forEach((y) => (win += `<rect x="${x}" y="${y}" width="12" height="14" rx="2"/>`)));
  return `<svg class="scene" viewBox="0 0 600 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="600" height="240" fill="var(--scene-sky)"/>${rain}
  <g fill="var(--scene-b1)"><rect x="20" y="90" width="90" height="100" rx="3"/><rect x="250" y="70" width="70" height="120" rx="3"/><rect x="470" y="96" width="110" height="94" rx="3"/></g>
  <g fill="var(--scene-b2)"><rect x="116" y="60" width="62" height="130" rx="3"/><rect x="190" y="104" width="52" height="86" rx="3"/><rect x="330" y="84" width="64" height="106" rx="3"/><rect x="402" y="110" width="58" height="80" rx="3"/></g>
  <g fill="var(--scene-win)">${win}</g><rect y="186" width="600" height="54" fill="var(--scene-road)"/><rect y="196" width="600" height="44" fill="var(--scene-water)" opacity=".92"/>
  <path d="M0 208q25-8 50 0t50 0 50 0 50 0 50 0 50 0 50 0 50 0 50 0 50 0 50 0 50 0" stroke="var(--scene-wave)" stroke-width="2.2" fill="none"/>
  <path d="M0 226q25-8 50 0t50 0 50 0 50 0 50 0 50 0 50 0 50 0 50 0 50 0 50 0 50 0" stroke="var(--scene-wave)" stroke-width="2.2" fill="none" opacity=".7"/></svg>`;
}

/* ---------- potongan HTML kecil ---------- */
/* Logo CILANCAR: memakai gambar logo resmi (assets/logo-cilancar.png) */
const logo = (s = 40) => `<img class="logo-img" src="assets/logo-cilancar.png" width="${s}" height="${s}" alt="Logo CILANCAR" decoding="async" draggable="false" style="width:${s}px;height:${s}px">`;

/* Ilustrasi sidebar: kota kecil, hujan tipis, genangan ringan (tenang, tidak berlebihan) */
const sideArt = () => `<svg viewBox="0 0 252 250" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
  <g fill="var(--art-cloud)" opacity=".9"><ellipse cx="62" cy="34" rx="22" ry="9"/><ellipse cx="80" cy="27" rx="17" ry="10"/><ellipse cx="98" cy="35" rx="20" ry="8"/>
    <ellipse cx="186" cy="52" rx="16" ry="6.5"/><ellipse cx="200" cy="46" rx="12" ry="7"/></g>
  <g stroke="var(--art-rain)" stroke-width="1.6" stroke-linecap="round" opacity=".7">
    <path d="M52 52l-3 9M70 58l-3 9M92 54l-3 9M110 62l-3 9M38 84l-3 9M126 80l-3 9M150 70l-3 9M168 92l-3 9M196 74l-3 9M216 98l-3 9M232 70l-3 9M24 110l-3 9M104 100l-3 9M142 112l-3 9M184 120l-3 9"/></g>
  <g fill="var(--art-b1)" opacity=".75"><rect x="6" y="118" width="24" height="76" rx="2"/><rect x="32" y="100" width="20" height="94" rx="2"/><rect x="56" y="126" width="28" height="68" rx="2"/>
    <rect x="150" y="106" width="22" height="88" rx="2"/><rect x="176" y="122" width="26" height="72" rx="2"/><rect x="206" y="98" width="22" height="96" rx="2"/><rect x="230" y="116" width="22" height="78" rx="2"/></g>
  <g fill="var(--art-b2)"><rect x="14" y="148" width="46" height="46" rx="3"/><rect x="164" y="146" width="42" height="48" rx="3"/><rect x="212" y="152" width="40" height="42" rx="3"/></g>
  <g fill="var(--art-win)" opacity=".85"><rect x="21" y="156" width="7" height="7" rx="1.5"/><rect x="34" y="156" width="7" height="7" rx="1.5"/><rect x="47" y="156" width="7" height="7" rx="1.5"/><rect x="21" y="170" width="7" height="7" rx="1.5"/><rect x="47" y="170" width="7" height="7" rx="1.5"/>
    <rect x="172" y="154" width="7" height="7" rx="1.5"/><rect x="186" y="154" width="7" height="7" rx="1.5"/><rect x="172" y="168" width="7" height="7" rx="1.5"/><rect x="186" y="168" width="7" height="7" rx="1.5"/>
    <rect x="220" y="160" width="7" height="7" rx="1.5"/><rect x="234" y="160" width="7" height="7" rx="1.5"/></g>
  <g><path d="M92 164l33-24 33 24z" fill="var(--art-roof)"/><rect x="99" y="162" width="52" height="32" fill="var(--art-b3)"/>
    <rect x="120" y="173" width="11" height="21" rx="2" fill="var(--art-door)"/><rect x="105" y="170" width="9" height="9" rx="1.5" fill="var(--art-win)"/><rect x="138" y="170" width="9" height="9" rx="1.5" fill="var(--art-win)"/></g>
  <g><rect x="222" y="172" width="4" height="22" fill="var(--art-trunk)"/><circle cx="224" cy="164" r="13" fill="var(--art-green)"/><circle cx="216" cy="170" r="8" fill="var(--art-green)"/></g>
  <g><rect x="85" y="150" width="2.6" height="44" rx="1" fill="var(--art-pole)"/><circle cx="86.3" cy="148" r="4.2" fill="var(--art-lamp)"/></g>
  <rect x="0" y="192" width="252" height="10" fill="var(--art-road)"/>
  <g><path d="M33 172Q49 152 65 172Z" fill="var(--art-umb)"/><path d="M49 172v19" stroke="var(--art-pole)" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="44" cy="177" r="3.2" fill="var(--art-skin)"/><rect x="40.5" y="180" width="7" height="10" rx="3" fill="var(--art-body)"/><path d="M42.5 190v4M45.5 190v4" stroke="var(--art-pole)" stroke-width="1.8" stroke-linecap="round"/></g>
  <path d="M0 200q21-6 42 0t42 0t42 0t42 0t42 0t42 0V250H0z" fill="var(--art-w1)" opacity=".9"/>
  <path d="M0 216q21-6 42 0t42 0t42 0t42 0t42 0t42 0V250H0z" fill="var(--art-w2)" opacity=".95"/>
  <path d="M0 232q21-6 42 0t42 0t42 0t42 0t42 0t42 0V250H0z" fill="var(--art-w3)"/>
  <g fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.2"><ellipse cx="62" cy="209" rx="9" ry="2.3"/><ellipse cx="62" cy="209" rx="15" ry="3.6" stroke-opacity=".3"/>
    <ellipse cx="176" cy="213" rx="12" ry="2.8"/><ellipse cx="176" cy="213" rx="19" ry="4.4" stroke-opacity=".3"/><ellipse cx="116" cy="224" rx="8" ry="2"/></g>
  <g><path d="M136 207l16 0-3.5 5h-9z" fill="#fff"/><path d="M144 195v12" stroke="var(--art-pole)" stroke-width="1.2"/><path d="M144 196l8 9h-8z" fill="var(--art-umb)" opacity=".9"/></g>
</svg>`;
const statusPill = (s) => `<span class="pill pill-${s}">${esc(statusLabel(s))}</span>`;
const pointPill = (s) => `<span class="pill pill-tone-${POINT_STATUS[s].tone}">${POINT_STATUS[s].label}</span>`;
const typeTile = (type, size = 44) => { const x = TYPES[type] || TYPES.sumbatan; return `<span class="tile tile-${x.tone}" style="width:${size}px;height:${size}px">${icon(x.icon, size * 0.5)}</span>`; };
const gauge = (label, value, unit, tone, max = 100) => `<div class="gauge"><div class="gauge-top"><span>${label}</span><b>${Math.round(value)}${unit}</b></div><div class="gauge-bar"><i class="tone-${tone}" style="width:${Math.min(100, (value / max) * 100)}%"></i></div></div>`;
const avatar = (name, size = 56) => `<span class="avatar" style="width:${size}px;height:${size}px;font-size:${size * 0.36}px">${esc(name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase())}</span>`;
const empty = (ic, title, text, action = '') => `<div class="empty"><span class="empty-ic">${icon(ic, 26)}</span><b>${title}</b>${text ? `<p>${text}</p>` : ''}${action}</div>`;
const pageHeader = ({ title, back, right = '', sub = '' }) => `<header class="page-head">${back ? `<button class="icon-btn" data-go="${back}" aria-label="Kembali">${icon('back')}</button>` : ''}<div class="page-head-t"><h1>${esc(title)}</h1>${sub ? `<small>${esc(sub)}</small>` : ''}</div><div class="page-head-r">${right}</div></header>`;
const themeBtn = () => `<button class="icon-btn" data-act="theme" aria-label="Ganti tema">${icon(svc.settings.isDark() ? 'sun' : 'moon')}</button>`;
const bellBtn = () => { const n = svc.notifications.unread(); return `<button class="icon-btn bell" data-go="/notifikasi" aria-label="Notifikasi">${icon('bell')}${n ? `<span class="badge">${n > 9 ? '9+' : n}</span>` : ''}</button>`; };
const pointBarTone = (p, cfg) => ({
  bin: p.bin >= cfg.binThreshold ? 'red' : p.bin >= cfg.binThreshold - 20 ? 'amber' : 'green',
  water: p.water >= cfg.floodThreshold ? 'red' : p.water >= cfg.floodThreshold * 0.6 ? 'amber' : 'green',
});

/* ---------- Modal (popup) ---------- */
const Modal = {
  stack: [],
  /** opts: {title, wide, tone, draw(ctl), onClose} ; draw mengisi ctl.body / ctl.actions */
  open(opts) {
    const ov = document.createElement('div');
    ov.className = 'overlay';
    ov.innerHTML = `<div class="modal ${opts.wide ? 'modal-wide' : ''} ${opts.tone ? 'modal-' + opts.tone : ''}" role="dialog" aria-modal="true"><div class="modal-grip"></div><div class="modal-head"><h2></h2><button class="icon-btn" data-mclose aria-label="Tutup">${icon('close')}</button></div><div class="modal-body"></div><div class="modal-actions"></div></div>`;
    const ctl = {
      el: ov, opts,
      body: ov.querySelector('.modal-body'), actions: ov.querySelector('.modal-actions'),
      q: (s) => ov.querySelector(s), qa: (s) => [...ov.querySelectorAll(s)],
      title(t) { ov.querySelector('h2').textContent = t; },
      redraw() { ctl.actions.style.display = ''; opts.draw(ctl); if (!ctl.actions.innerHTML.trim()) ctl.actions.style.display = 'none'; },
      close() { if (!ov.isConnected) return; ov.remove(); Modal.stack = Modal.stack.filter((m) => m !== ctl); if (!Modal.stack.length) document.body.style.overflow = ''; opts.onClose && opts.onClose(); },
    };
    ctl.title(opts.title || '');
    ov.addEventListener('mousedown', (e) => { if (e.target === ov) ctl.close(); });
    ov.querySelector('[data-mclose]').addEventListener('click', () => ctl.close());
    document.getElementById('modal-root').appendChild(ov);
    document.body.style.overflow = 'hidden';
    Modal.stack.push(ctl);
    ctl.redraw();
    return ctl;
  },
  closeAll() { [...Modal.stack].forEach((m) => m.close()); },
  confirm({ title, text, confirmLabel = 'Ya', danger, onConfirm }) {
    return Modal.open({ title, draw(c) {
      c.body.innerHTML = `<p class="muted">${esc(text)}</p>`;
      c.actions.innerHTML = `<button class="btn btn-ghost" data-n>Batal</button><button class="btn ${danger ? 'btn-red' : 'btn-blue'}" data-y>${esc(confirmLabel)}</button>`;
      c.q('[data-n]').onclick = () => c.close();
      c.q('[data-y]').onclick = () => { c.close(); onConfirm(); };
    } });
  },
  photo(src, title = 'Foto') {
    return Modal.open({ title, wide: true, draw(c) { c.body.innerHTML = `<img class="lightbox" src="${esc(src)}" alt="Foto">`; c.actions.innerHTML = ''; } });
  },
};
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && Modal.stack.length) Modal.stack[Modal.stack.length - 1].close(); });

/* ---------- Toast ---------- */
function drawToasts() {
  const host = document.getElementById('toasts'); if (!host) return;
  const ic = { alert: 'alert', success: 'check', report: 'report', info: 'bell' };
  host.innerHTML = svc.toasts.get().map((x) => `<button class="toast toast-${x.kind}" data-toast="${x.id}"><span class="toast-ic">${icon(ic[x.kind] || 'bell', 18)}</span><span class="toast-tx"><b>${esc(x.title)}</b>${x.body ? `<small>${esc(x.body)}</small>` : ''}</span></button>`).join('');
}
svc.toasts.subscribe(drawToasts);
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-toast]'); if (!b) return;
  const x = svc.toasts.get().find((t) => t.id === b.dataset.toast); svc.toasts.dismiss(b.dataset.toast);
  if (x && x.link) location.hash = x.link;
});

/* ---------- Kamera (getUserMedia) ---------- */
function openCamera({ onCapture, onGallery }) {
  let facing = 'environment', stream = null, shot = null, ready = false, err = '';
  const stop = () => { if (stream) stream.getTracks().forEach((t) => t.stop()); stream = null; };
  const ctl = Modal.open({ title: 'Ambil Foto', wide: true, onClose: stop, draw(c) {
    if (err) {
      c.body.innerHTML = `<div class="cam-error">${icon('camera', 32)}<p>${esc(err)}</p><button class="btn btn-blue" data-native>Buka Kamera Perangkat</button><button class="btn btn-ghost" data-retry>Coba Lagi</button><button class="btn btn-ghost" data-gal>Pilih dari Galeri</button></div>`; c.actions.innerHTML = '';
      c.q('[data-native]').onclick = () => { c.close(); nativeCamera(onCapture); };
      c.q('[data-retry]').onclick = () => { err = ''; ready = false; c.redraw(); start(); };
      c.q('[data-gal]').onclick = () => { c.close(); onGallery(); };
    } else if (shot) {
      c.body.innerHTML = `<img class="cam-view" src="${shot}" alt="Hasil foto"><div class="cam-bar"><button class="btn btn-ghost" data-retry>Ulangi</button><button class="btn btn-red" data-use>Pakai Foto</button></div>`; c.actions.innerHTML = '';
      c.q('[data-retry]').onclick = () => { shot = null; ready = false; c.redraw(); start(); };
      c.q('[data-use]').onclick = () => { const s = shot; c.close(); onCapture(s); };
    } else {
      c.body.innerHTML = `<div class="cam-frame"><video class="cam-view" playsinline muted autoplay></video><span class="cam-wait" ${ready ? 'hidden' : ''}>Membuka kamera…</span></div><div class="cam-bar"><button class="icon-btn" data-flip aria-label="Balik kamera">${icon('flip')}</button><button class="shutter" data-snap ${ready ? '' : 'disabled'} aria-label="Ambil foto"><i></i></button><button class="icon-btn" data-gal aria-label="Galeri">${icon('image')}</button></div>`; c.actions.innerHTML = '';
      const v = c.q('video'); v.muted = true; if (stream) { v.srcObject = stream; v.onloadedmetadata = () => v.play().catch(() => {}); v.play().catch(() => {}); }
      c.q('[data-flip]').onclick = () => { facing = facing === 'environment' ? 'user' : 'environment'; stop(); ready = false; c.redraw(); start(); };
      c.q('[data-gal]').onclick = () => { c.close(); onGallery(); };
      c.q('[data-snap]').onclick = async () => {
        if (!v.videoWidth) return;
        const cv = document.createElement('canvas'); cv.width = v.videoWidth; cv.height = v.videoHeight; cv.getContext('2d').drawImage(v, 0, 0);
        shot = await resizeImage(cv.toDataURL('image/jpeg', 0.9)); stop(); c.redraw();
      };
    }
  } });
  async function start() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw Object.assign(new Error('unsupported'), { name: 'unsupported' });
      let s;
      try { s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: facing }, width: { ideal: 1280 } }, audio: false }); }
      catch (e1) {
        if (e1 && (e1.name === 'NotAllowedError' || e1.name === 'SecurityError')) throw e1;
        s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }); // coba lagi tanpa batasan kamera depan/belakang
      }
      if (!ctl.el.isConnected) return s.getTracks().forEach((t) => t.stop());
      stream = s; ready = true; ctl.redraw();
    } catch (e) {
      const n = e && e.name;
      err = n === 'unsupported' ? 'Kamera langsung tidak didukung di peramban ini (biasanya butuh HTTPS atau localhost). Gunakan tombol di bawah.'
        : n === 'NotAllowedError' || n === 'SecurityError' ? 'Izin kamera ditolak. Klik ikon kamera/gembok di sebelah alamat peramban lalu pilih Izinkan, kemudian tekan Coba Lagi.'
        : n === 'NotFoundError' || n === 'OverconstrainedError' ? 'Kamera tidak ditemukan di perangkat ini.'
        : n === 'NotReadableError' || n === 'AbortError' ? 'Kamera sedang dipakai aplikasi lain. Tutup aplikasi tersebut lalu tekan Coba Lagi.'
        : 'Kamera tidak dapat dibuka.';
      if (ctl.el.isConnected) ctl.redraw();
    }
  }
  start();
}

/* kamera bawaan perangkat (HP: langsung membuka aplikasi kamera) – cadangan bila kamera di dalam halaman tidak bisa dibuka */
function nativeCamera(onCapture) {
  const i = document.createElement('input');
  i.type = 'file'; i.accept = 'image/*'; i.setAttribute('capture', 'environment'); i.style.display = 'none';
  i.onchange = async () => { const f = i.files && i.files[0]; i.remove(); if (!f) return; try { onCapture(await resizeImage(f)); } catch (e) { svc.toasts.error('Foto tidak dapat dibaca'); } };
  document.body.appendChild(i); i.click();
}
