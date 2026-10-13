/* Titik 1 – Dashboard
   Kelas: DashboardPage  ·  terhubung lewat svc.* (core.js) dan Router/Acts (app.js) */
class DashboardPage {
  static watch = ['sensors', 'settings', 'reports', 'notifications', 'account'];
  static html() {
    const { user } = svc.account.get(), cfg = svc.settings.get(), points = svc.sensors.get().points, reps = svc.reports.get();
    const ws = points.map((p) => ({ p, st: pointStatus(p, cfg) }));
    ws.sort((a, b) => RANK[b.st] - RANK[a.st] || b.p.water / cfg.floodThreshold - a.p.water / cfg.floodThreshold);
    const risk = ws.filter((x) => x.st === 'risk').length, warn = ws.filter((x) => x.st === 'warn').length;
    const maxWater = Math.max(0, ...points.map((p) => p.water)), avgBin = points.length ? points.reduce((s, p) => s + p.bin, 0) / points.length : 0;
    const worst = ws[0], level = worst ? worst.st : 'normal', why = worst ? pointReason(worst.p, cfg) : { kind: null };
    const heading = level === 'normal' ? 'Kondisi Terkendali' : why.kind === 'bin' ? 'Alat Perlu Dibersihkan' : level === 'risk' ? 'Waspada Banjir' : 'Perlu Diwaspadai';
    const body = level === 'normal' ? 'Seluruh alat CILANCAR dalam kondisi aman. Terima kasih sudah ikut menjaga drainase.' : `${worst.p.name}: ${why.text}. Tetap waspada dan jaga keselamatan.`;
    const monitor = ws.slice(0, 4).map(({ p, st }) => { const tn = pointBarTone(p, cfg); return `<button class="monitor" data-act="point" data-id="${p.id}"><div class="monitor-top"><b>${esc(p.name)}</b>${pointPill(st)}</div><div class="monitor-g">${gauge('Alat', p.bin, '%', tn.bin)}${gauge('Air', p.water, ' cm', tn.water, Math.max(60, cfg.floodThreshold * 1.5))}</div></button>`; }).join('');
    const recent = reps.slice(0, 4).map((r) => `<button class="row" data-go="/laporan/${r.id}">${typeTile(r.type)}<span class="row-tx"><b>${esc(typeTitle(r))}</b><small>${esc(r.location.address)}</small><small>${timeAgo(r.createdAt)}</small></span>${statusPill(r.status)}</button>`).join('') || '<p class="muted pad">Belum ada laporan.</p>';
    const tile = (ic, tone, label, attr) => `<button class="menu-tile" ${attr}><span class="tile tile-${tone}">${icon(ic, 24)}</span><span>${label}</span></button>`;
    return `<div class="page dash">
      <header class="dash-top"><div class="dash-brand">${logo(40)}<div><b>CILANCAR</b><small>Sistem Pelaporan Drainase &amp; Banjir</small></div></div><div class="dash-tools">${themeBtn()}${bellBtn()}</div></header>
      <section class="hero">${floodScene(level !== 'normal')}${heroImg()}
        <div class="hero-card hero-${level}"><span class="hero-ic">${icon(level === 'normal' ? 'shield' : 'alert', 20)}</span><div class="hero-tx"><b>${heading}</b><p>${esc(body)}</p></div>
        <button class="hero-btn" data-go="${worst && level !== 'normal' ? '/peta?titik=' + worst.p.id : '/peta'}">Lihat Peta</button></div></section>
      <section class="welcome card"><div><h2>${t('dash.hello')}, ${esc((user.name || 'Warga').split(' ')[0])}!</h2><p class="muted">${t('dash.sub')}</p></div><button class="btn btn-blue btn-lg" data-go="/laporan/baru">${icon('plus', 18)} ${t('dash.cta')}</button></section>
      <section class="stats">
        <div class="stat stat-red"><b>${risk}</b><span>Titik berisiko</span></div><div class="stat stat-amber"><b>${warn}</b><span>Perlu waspada</span></div>
        <div class="stat stat-blue"><b>${Math.round(maxWater)} cm</b><span>Air tertinggi</span></div><div class="stat stat-green"><b>${Math.round(avgBin)}%</b><span>Rata-rata kapasitas alat</span></div></section>
      <h3 class="sec">${t('dash.menu')}</h3>
      <section class="menu">${tile('report', 'red', 'Buat Laporan', 'data-go="/laporan/baru"')}${tile('map', 'blue', 'Peta Drainase', 'data-go="/peta"')}${tile('report', 'amber', 'Riwayat Laporan', 'data-go="/laporan"')}${tile('alert', 'red', 'Laporan Darurat', 'data-act="emergency"')}</section>
      <div class="dash-cols">
        <section><div class="sec-row"><h3 class="sec">${t('dash.monitor')}</h3><button class="link" data-go="/peta">Semua</button></div>
          <div class="card list-card">${monitor}</div>
          <details class="demo card" data-keep="demo" ${KEEP.demo ? 'open' : ''}><summary>Mode uji alat CILANCAR (simulasi)</summary><p class="muted">Tidak ada perangkat keras terhubung, jadi sensor disimulasikan. Gunakan tombol ini untuk melihat notifikasi otomatis bekerja.</p>
          <div class="row-actions"><button class="btn btn-soft" data-act="sim-full">Alat hampir penuh</button><button class="btn btn-soft" data-act="sim-rain">Hujan deras</button></div></details></section>
        <section><div class="sec-row"><h3 class="sec">${t('dash.recent')}</h3><button class="link" data-go="/laporan">Lihat semua</button></div>
          <div class="card list-card">${recent}</div>
          <button class="card chat-link" data-go="/chat"><span class="tile tile-blue">${icon('chat', 22)}</span><span class="row-tx"><b>Chat dengan CS Dinas</b><small>Tanya status laporan atau kondisi lapangan</small></span>${icon('chevron', 18)}</button></section>
      </div></div>`;
  }
}
Pages.dashboard = DashboardPage;
Acts['sim-full'] = () => svc.sensors.simulateFull();
Acts['sim-rain'] = () => svc.sensors.simulateRain();

