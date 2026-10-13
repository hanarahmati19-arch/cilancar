/* Halaman masuk warga – form di tengah, latar video banjir
   ---------------------------------------------------------
   Video diputar dari folder assets/video/ (urutan di LOGIN_VIDEO.srcs).
   Kalau file video belum ada / gagal dimuat, otomatis dipakai animasi hujan & genangan (canvas),
   jadi halaman tidak pernah kosong. Lihat assets/video/PUTAR-VIDEO-BANJIR.txt. */
const LOGIN_VIDEO = {
  srcs: [
    'assets/video/banjir.mp4',   // opsional: file lokal (dipakai paling dulu, bisa offline)
    'assets/video/banjir.webm',
    // Video banjir jalan Indonesia (Pexels, gratis) – https://www.pexels.com/id-id/video/orang-orang-jalan-berjalan-area-9249395/
    'https://videos.pexels.com/video-files/9249395/9249395-hd_1920_1080_30fps.mp4',
  ],
  poster: 'https://images.pexels.com/videos/9249395/pexels-photo-9249395.jpeg?auto=compress&cs=tinysrgb&h=627&fit=crop&w=1200',
};

function loginHtml() {
  requestAnimationFrame(() => LoginFx.start());
  return `<div class="login">
    <div class="login-bg" aria-hidden="true">
      <canvas class="login-fx"></canvas>
      <video class="login-video" muted loop playsinline preload="auto" disablepictureinpicture></video>
      <div class="login-shade"></div>
    </div>
    <div class="login-theme">${themeBtn()}</div>
    <div class="login-wrap">
      <form class="login-card" data-form="login">
        <div class="login-brand">${logo(56)}<h1>CILANCAR</h1><p>Sistem Pelaporan Drainase &amp; Banjir</p></div>
        <div class="login-head"><h2>Masuk sebagai warga</h2><p class="muted">Isi data singkat agar laporan dan notifikasi tersimpan atas nama Anda.</p></div>
        <label class="field"><span>Nama lengkap</span><input name="name" placeholder="Nama Anda" autocomplete="name"></label>
        <label class="field"><span>Email</span><input name="email" type="email" placeholder="nama@email.com" autocomplete="email"></label>
        <label class="field"><span>No. HP (opsional)</span><input name="phone" type="tel" placeholder="08xx xxxx xxxx" autocomplete="tel"></label>
        <p class="err" id="login-err"></p>
        <button class="btn btn-blue btn-block btn-lg" type="submit">Masuk</button>
        <button class="btn btn-ghost btn-block" type="button" data-act="demo-login">Coba dengan akun demo</button>
      </form>
      <p class="login-foot">Pantau drainase · Laporkan genangan · Cegah banjir</p>
    </div></div>`;
}
Forms.login = (form) => {
  const f = Object.fromEntries(new FormData(form)), er = document.getElementById('login-err');
  if (!f.name.trim()) return (er.textContent = 'Nama wajib diisi.');
  if (!/^\S+@\S+\.\S+$/.test(f.email)) return (er.textContent = 'Format email tidak valid.');
  svc.account.login({ name: f.name.trim(), email: f.email.trim(), phone: (f.phone || '').trim() || '-' });
};
Acts['demo-login'] = () => svc.account.login({ name: 'Warga Bandung', email: 'warga.bandung@email.com', phone: '+62 812-3456-7890' });

/* ---------- latar: video banjir + cadangan animasi canvas ---------- */
const LoginFx = {
  raf: 0, videoOn: false,
  start() {
    const cv = document.querySelector('.login-fx'), v = document.querySelector('.login-video');
    if (!cv) return;
    cancelAnimationFrame(LoginFx.raf); LoginFx.videoOn = false;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (v) LoginFx.video(v, reduce);
    LoginFx.canvas(cv, reduce);
  },
  video(v, reduce) {
    let i = 0;
    if (LOGIN_VIDEO.poster) v.poster = LOGIN_VIDEO.poster;
    const next = () => { if (i >= LOGIN_VIDEO.srcs.length) { v.remove(); return; } v.src = LOGIN_VIDEO.srcs[i++]; v.load(); };
    v.onerror = next;
    v.oncanplay = () => {
      LoginFx.videoOn = true; v.classList.add('on');
      if (!reduce) { const p = v.play(); if (p && p.catch) p.catch(() => {}); } else v.pause();
    };
    next();
  },
  canvas(cv, reduce) {
    const ctx = cv.getContext('2d'); if (!ctx) return;
    let W = 0, H = 0, dpr = 1, t0 = performance.now(), flash = 0, nextFlash = 4000 + Math.random() * 6000;
    const rnd = (a, b) => a + Math.random() * (b - a);
    let drops = [], ripples = [], skyline = [];
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 1.5); W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(W / 6);
      drops = Array.from({ length: n }, () => ({ x: rnd(-100, W + 100), y: rnd(0, H), l: rnd(14, 34), v: rnd(900, 1500), a: rnd(.25, .6) }));
      skyline = []; let x = -20;
      while (x < W + 40) { const w = rnd(46, 120), h = rnd(H * .12, H * .42); skyline.push({ x, w, h, s: Math.random() }); x += w * rnd(.7, 1.05); }
    };
    size(); addEventListener('resize', size);
    const horizon = () => H * .6;
    const draw = (now) => {
      if (!cv.isConnected) { removeEventListener('resize', size); return; }
      LoginFx.raf = requestAnimationFrame(draw);
      if (LoginFx.videoOn) return; // video sudah jalan, hemat tenaga
      const dt = Math.min((now - t0) / 1000, .05); t0 = now; const hz = horizon(), T = now / 1000;
      const sky = ctx.createLinearGradient(0, 0, 0, hz); sky.addColorStop(0, '#1d2430'); sky.addColorStop(.6, '#3b4658'); sky.addColorStop(1, '#6b7788');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, hz);
      // awan bergerak
      for (let k = 0; k < 6; k++) { const cx = ((T * (6 + k * 3) + k * W / 5) % (W + 400)) - 200, cy = hz * (.15 + k * .1); const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, 260); g.addColorStop(0, 'rgba(120,132,150,.28)'); g.addColorStop(1, 'rgba(120,132,150,0)'); ctx.fillStyle = g; ctx.fillRect(cx - 260, cy - 260, 520, 520); }
      // gedung
      skyline.forEach((b, n) => { ctx.fillStyle = n % 2 ? '#2a3240' : '#333c4b'; ctx.fillRect(b.x, hz - b.h, b.w, b.h);
        ctx.fillStyle = 'rgba(255,214,140,.5)';
        for (let yy = hz - b.h + 10; yy < hz - 14; yy += 18) for (let xx = b.x + 8; xx < b.x + b.w - 10; xx += 16) if (((xx * 7 + yy * 13 + n * 31) % 11) < 3) ctx.fillRect(xx, yy, 6, 8); });
      const fog = ctx.createLinearGradient(0, hz - H * .25, 0, hz); fog.addColorStop(0, 'rgba(120,132,150,0)'); fog.addColorStop(1, 'rgba(140,152,168,.55)'); ctx.fillStyle = fog; ctx.fillRect(0, hz - H * .25, W, H * .25);
      // air banjir
      const wg = ctx.createLinearGradient(0, hz, 0, H); wg.addColorStop(0, '#6a5f4f'); wg.addColorStop(.5, '#4a4338'); wg.addColorStop(1, '#2a251f'); ctx.fillStyle = wg; ctx.fillRect(0, hz, W, H - hz);
      ctx.save(); ctx.beginPath(); ctx.rect(0, hz, W, H - hz); ctx.clip();
      skyline.forEach((b, n) => { ctx.fillStyle = 'rgba(255,214,140,.07)'; ctx.fillRect(b.x + b.w * .3 + Math.sin(T * 1.3 + n) * 3, hz, b.w * .2, b.h * .5); });
      for (let r = 0; r < 26; r++) { const p = r / 26, y = hz + (H - hz) * p * p + 4, amp = 2 + p * 10, sp = 20 + p * 90; ctx.strokeStyle = `rgba(210,200,180,${.04 + p * .14})`; ctx.lineWidth = 1 + p * 1.6; ctx.beginPath();
        for (let x = 0; x <= W; x += 14) { const yy = y + Math.sin(x * .018 / (.4 + p) + T * (sp / 40) + r) * amp * .4; x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } ctx.stroke(); }
      ripples = ripples.filter((r) => (r.age += dt) < 1.1);
      ripples.forEach((r) => { const k = r.age / 1.1; ctx.strokeStyle = `rgba(225,215,195,${.5 * (1 - k)})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(r.x, r.y, 3 + k * 22 * r.s, (3 + k * 22 * r.s) * .32, 0, 0, 7); ctx.stroke(); });
      ctx.restore();
      // hujan
      ctx.lineCap = 'round';
      drops.forEach((d) => { d.y += d.v * dt; d.x -= d.v * dt * .18; ctx.strokeStyle = `rgba(200,212,228,${d.a})`; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + d.l * .18, d.y - d.l); ctx.stroke();
        if (d.y > H || d.x < -120) { if (d.y > hz + 8 && ripples.length < 90 && Math.random() < .35) ripples.push({ x: d.x, y: Math.min(d.y, H - 4), age: 0, s: rnd(.6, 1.3) }); d.y = rnd(-80, -10); d.x = rnd(0, W + 160); } });
      if (!reduce) { nextFlash -= dt * 1000; if (nextFlash < 0) { flash = 1; nextFlash = 5000 + Math.random() * 9000; } }
      if (flash > 0) { ctx.fillStyle = `rgba(210,225,255,${flash * .22})`; ctx.fillRect(0, 0, W, H); flash -= dt * 2.2; }
      if (reduce) cancelAnimationFrame(LoginFx.raf);
    };
    LoginFx.raf = requestAnimationFrame(draw);
  },
};
