/* =========================================================
   CILANCAR – core: util, konstanta, Store, dan semua service
   (JavaScript biasa, tanpa build / tanpa React)
   ========================================================= */
const PFX = 'cilancar.html.';
/* Migrasi data: data contoh lama (Semarang) yang tersimpan di peramban dibuang sekali, diganti data Bandung. */
(function migrateData() {
  const V = 'bandung-1';
  try {
    if (localStorage.getItem(PFX + 'dataver') === V) return;
    const keep = [PFX + 'settings', PFX + 'account', PFX + 'mapstyle'];
    Object.keys(localStorage).filter((k) => k.startsWith(PFX) && !keep.includes(k)).forEach((k) => localStorage.removeItem(k));
    const a = JSON.parse(localStorage.getItem(PFX + 'account') || 'null');
    if (a && a.user && /semarang/i.test(`${a.user.name} ${a.user.email}`)) { a.user.name = 'Warga Bandung'; a.user.email = 'warga.bandung@email.com'; localStorage.setItem(PFX + 'account', JSON.stringify(a)); }
    localStorage.setItem(PFX + 'dataver', V);
  } catch (e) {}
})();
const uid = (p = 'id') => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const pad2 = (n) => String(n).padStart(2, '0');
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDate = (ts) => { const d = new Date(ts); return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}, ${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
const fmtClock = (ts) => { const d = new Date(ts); return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'baru saja';
  if (s < 3600) return `${Math.floor(s / 60)} menit lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`;
  if (s < 604800) return `${Math.floor(s / 86400)} hari lalu`;
  return fmtDate(ts);
}
function resizeImage(src, max = 900, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const url = typeof src === 'string' ? src : URL.createObjectURL(src);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      if (typeof src !== 'string') URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('Gambar tidak dapat dibaca'));
    img.src = url;
  });
}
function locate() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Perangkat tidak mendukung GPS'));
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const lat = +coords.latitude.toFixed(5), lng = +coords.longitude.toFixed(5);
      let address = `Koordinat ${lat}, ${lng}`;
      try {
        const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 3500);
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&zoom=18&lat=${lat}&lon=${lng}`, { signal: ctl.signal, headers: { 'Accept-Language': 'id' } });
        clearTimeout(t); const j = await r.json();
        if (j && j.display_name) address = j.display_name.split(',').slice(0, 3).join(',').trim();
      } catch (e) {}
      resolve({ lat, lng, address });
    }, () => reject(new Error('Izin lokasi ditolak atau tidak tersedia')), { enableHighAccuracy: true, timeout: 8000 });
  });
}
function samplePhoto(kind) {
  const w = kind === 'flood';
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 220'><rect width='320' height='220' fill='${w ? '#b9c6d3' : '#c9c2b6'}'/><rect y='110' width='320' height='110' fill='${w ? '#8aa0b5' : '#9b9384'}'/><rect x='20' y='50' width='70' height='70' fill='#a65f5a'/><rect x='100' y='30' width='60' height='90' fill='#d8d2c6'/><rect x='170' y='60' width='90' height='60' fill='#7d8fa6'/>${w ? "<path d='M0 150q20-10 40 0t40 0 40 0 40 0 40 0 40 0 40 0 40 0' stroke='#e8eef4' fill='none' stroke-width='3'/><path d='M0 180q20-10 40 0t40 0 40 0 40 0 40 0 40 0 40 0 40 0' stroke='#e8eef4' fill='none' stroke-width='3'/>" : "<g fill='#6d665a'><rect x='40' y='150' width='60' height='20' rx='6'/><rect x='120' y='165' width='90' height='22' rx='6'/><rect x='230' y='148' width='50' height='18' rx='6'/></g>"}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/* ---------- konstanta ---------- */
const TYPES = {
  sumbatan: { label: 'Sumbatan', title: 'Sumbatan', icon: 'blockage', tone: 'red', sev: 'Tingkat Sumbatan' },
  genangan: { label: 'Genangan', title: 'Genangan', icon: 'puddle', tone: 'blue', sev: 'Tingkat Genangan' },
  sampah: { label: 'Sampah', title: 'Sampah Menumpuk', icon: 'bin', tone: 'green', sev: 'Tingkat Sampah' },
  banjir: { label: 'Banjir', title: 'Banjir', icon: 'flood', tone: 'red', sev: 'Tingkat Banjir' },
};
const FORM_TYPES = ['sumbatan', 'genangan', 'sampah'];
const SEVERITIES = [{ key: 'ringan', label: 'Ringan' }, { key: 'sedang', label: 'Sedang' }, { key: 'berat', label: 'Berat' }];
const STATUSES = [{ key: 'dikirim', label: 'Dikirim' }, { key: 'diverifikasi', label: 'Diverifikasi' }, { key: 'diproses', label: 'Diproses' }, { key: 'selesai', label: 'Selesai' }];
const POINT_STATUS = { normal: { label: 'Normal', tone: 'green' }, warn: { label: 'Waspada', tone: 'amber' }, risk: { label: 'Berisiko', tone: 'red' } };
/* Wilayah layanan: Kabupaten Bandung – Dayeuhkolot, Bojongsoang, Baleendah */
const KEC = { Dayeuhkolot: [-6.9847, 107.6277], Bojongsoang: [-6.9967, 107.6411], Baleendah: [-7.0017, 107.6256] };
const DEFAULT_LOCATION = { address: 'Jl. Raya Dayeuhkolot No. 123, Dayeuhkolot, Bandung', lat: KEC.Dayeuhkolot[0], lng: KEC.Dayeuhkolot[1] };
const typeTitle = (r) => (TYPES[r.type] && TYPES[r.type].title) || r.type;
const statusLabel = (k) => (STATUSES.find((s) => s.key === k) || {}).label || k;
const RANK = { risk: 2, warn: 1, normal: 0 };

/* ---------- i18n ringan ---------- */
const I18N = {
  id: { 'nav.home': 'Beranda', 'nav.reports': 'Laporan', 'nav.map': 'Peta Drainase', 'nav.notif': 'Notifikasi', 'nav.chat': 'Chat Dinas', 'nav.account': 'Akun',
    'title.create': 'Buat Laporan', 'title.edit': 'Ubah Laporan', 'title.history': 'Riwayat Laporan', 'title.map': 'Peta Kondisi Drainase', 'title.detail': 'Detail Laporan', 'title.notif': 'Notifikasi', 'title.chat': 'Chat dengan Dinas', 'title.account': 'Akun Saya',
    'dash.hello': 'Halo', 'dash.sub': 'Bersama menjaga drainase Bandung Selatan.', 'dash.cta': 'Buat Laporan', 'dash.menu': 'Menu Utama', 'dash.recent': 'Laporan Terakhir', 'dash.monitor': 'Pantauan Alat CILANCAR' },
  en: { 'nav.home': 'Home', 'nav.reports': 'Reports', 'nav.map': 'Drainage Map', 'nav.notif': 'Notifications', 'nav.chat': 'Agency Chat', 'nav.account': 'Account',
    'title.create': 'Create Report', 'title.edit': 'Edit Report', 'title.history': 'Report History', 'title.map': 'Drainage Condition Map', 'title.detail': 'Report Detail', 'title.notif': 'Notifications', 'title.chat': 'Chat with Agency', 'title.account': 'My Account',
    'dash.hello': 'Hello', 'dash.sub': 'Keeping South Bandung drainage clear, together.', 'dash.cta': 'Create Report', 'dash.menu': 'Main Menu', 'dash.recent': 'Latest Reports', 'dash.monitor': 'CILANCAR Device Monitor' },
};
const t = (k) => { const l = svc.settings.get().lang; return (I18N[l] && I18N[l][k]) || I18N.id[k] || k; };

/* ---------- Store ---------- */
class Store {
  constructor(initial) { this.state = initial; this.ls = new Set(); }
  get() { return this.state; }
  subscribe(fn) { this.ls.add(fn); return () => this.ls.delete(fn); }
  set(next) { this.state = next; this.ls.forEach((l) => l()); return true; }
}
class PersistedStore extends Store {
  constructor(key, initial) {
    let v = null;
    try { const raw = localStorage.getItem(PFX + key); if (raw) v = JSON.parse(raw); } catch (e) {}
    super(v != null ? v : (typeof initial === 'function' ? initial() : initial));
    this.key = PFX + key;
  }
  set(next) {
    super.set(next);
    try { localStorage.setItem(this.key, JSON.stringify(next)); return true; } catch (e) { return false; }
  }
}

/* ---------- SettingsService ---------- */
const DEFAULT_SETTINGS = { theme: 'system', lang: 'id', binThreshold: 80, floodThreshold: 40, notifyBin: true, notifyFlood: true, browserPush: false, telegram: { enabled: false, token: '', chatId: '' } };
class SettingsService extends PersistedStore {
  constructor() {
    super('settings', DEFAULT_SETTINGS);
    this.state = { ...DEFAULT_SETTINGS, ...this.state, telegram: { ...DEFAULT_SETTINGS.telegram, ...(this.state.telegram || {}) } };
    this.applyTheme();
    if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => this.applyTheme());
  }
  update(patch) { this.set({ ...this.state, ...patch }); this.applyTheme(); }
  isDark() { const th = this.state.theme; return th === 'dark' || (th === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches); }
  toggleTheme() { this.update({ theme: this.isDark() ? 'light' : 'dark' }); }
  applyTheme() {
    const dark = this.isDark();
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    const m = document.querySelector('meta[name=theme-color]'); if (m) m.setAttribute('content', dark ? '#17191C' : '#D4E8F8');
  }
}

/* ---------- AccountService ---------- */
class AccountService extends PersistedStore {
  constructor() { super('account', { user: null }); }
  login(p) { this.set({ user: { name: p.name, email: p.email, phone: p.phone, joinedAt: Date.now() } }); }
  update(patch) { if (this.state.user) this.set({ user: { ...this.state.user, ...patch } }); }
  logout() { this.set({ user: null }); }
}

/* ---------- ToastService ---------- */
class ToastService extends Store {
  constructor() { super([]); }
  show({ title, body, kind = 'info', link, ms = 4500 }) {
    const x = { id: uid('t'), title, body, kind, link };
    this.set([...this.state, x].slice(-2));
    setTimeout(() => this.dismiss(x.id), ms);
  }
  success(title, body) { this.show({ title, body, kind: 'success' }); }
  error(title, body) { this.show({ title, body, kind: 'alert' }); }
  dismiss(id) { this.set(this.state.filter((x) => x.id !== id)); }
}

/* ---------- NotificationService ---------- */
class NotificationService extends PersistedStore {
  constructor({ settings, toasts }) {
    super('notifications', () => {
      const now = Date.now(), h = 3600000;
      return [
        { id: uid('n'), title: 'Laporan Anda telah selesai', body: 'Genangan di Jl. Andir, Baleendah sudah ditangani petugas.', kind: 'report', at: now - 5 * h, read: true, link: null },
        { id: uid('n'), title: 'Petugas sedang menangani laporan Anda', body: 'Tim lapangan menuju lokasi sumbatan di Jl. Mohammad Toha, Dayeuhkolot.', kind: 'report', at: now - 9 * h, read: true, link: null },
        { id: uid('n'), title: 'Laporan Anda telah Diverifikasi', body: 'Laporan sumbatan Jl. Raya Dayeuhkolot telah diverifikasi dinas.', kind: 'report', at: now - 26 * h, read: true, link: null },
      ];
    });
    this.settings = settings; this.toasts = toasts;
  }
  push({ title, body, kind = 'info', link = null, key = null }) {
    const n = { id: uid('n'), title, body, kind, link, at: Date.now(), read: false, key };
    /* notifikasi dengan key yang sama (titik & jenis yang sama) diganti, bukan ditumpuk -> daftar tidak membengkak */
    const dup = key ? this.state.some((x) => x.key === key) : false;
    this.set([n, ...this.state.filter((x) => !key || x.key !== key)].slice(0, 40));
    if (!dup) this.toasts.show({ title, body, kind, link });
    if (this.settings.get().browserPush && 'Notification' in window && Notification.permission === 'granted') {
      try { new Notification(title, { body }); } catch (e) {}
    }
    return n;
  }
  markRead(id) { this.set(this.state.map((n) => (n.id === id ? { ...n, read: true } : n))); }
  markAll() { this.set(this.state.map((n) => ({ ...n, read: true }))); }
  remove(id) { this.set(this.state.filter((n) => n.id !== id)); }
  clear() { this.set([]); }
  unread() { return this.state.filter((n) => !n.read).length; }
  async requestBrowserPermission() {
    if (!('Notification' in window)) return 'unsupported';
    const p = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    this.settings.update({ browserPush: p === 'granted' });
    return p;
  }
}

/* ---------- TelegramService (Bot Telegram petugas) ---------- */
class TelegramService extends PersistedStore {
  constructor({ settings }) { super('telegram', []); this.settings = settings; }
  async send(text) {
    const cfg = this.settings.get().telegram;
    const entry = { id: uid('tg'), at: Date.now(), text, status: 'simulasi' };
    if (cfg.enabled && cfg.token && cfg.chatId) {
      try {
        const r = await fetch(`https://api.telegram.org/bot${cfg.token}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: cfg.chatId, text }) });
        entry.status = r.ok ? 'terkirim' : 'gagal';
      } catch (e) { entry.status = 'gagal'; }
    }
    this.set([entry, ...this.state].slice(0, 50));
  }
  clear() { this.set([]); }
}

/* ---------- AlertService (Titik 6: Peringatan Otomatis) ----------
   Memeriksa pembacaan sensor. Bila kapasitas bin >= batas (default 80%) atau tinggi air
   menunjukkan risiko banjir -> notifikasi ke warga (NotificationService) dan pesan ke
   petugas lewat Bot Telegram (TelegramService). Ada jeda 30 menit per titik agar tidak spam. */
class AlertService {
  constructor({ settings, notifications, telegram }) { Object.assign(this, { settings, notifications, telegram }); }
  check(sensors) {
    const cfg = this.settings.get(), now = Date.now(); let changed = false;
    const points = sensors.get().points.map((p) => {
      if (!p.device) return p;
      const la = { ...p.lastAlert };
      if (cfg.notifyBin && p.bin >= cfg.binThreshold && now - la.bin > COOLDOWN) {
        la.bin = now; changed = true;
        this.notifications.push({ title: 'Alat CILANCAR perlu dibersihkan', body: `${p.name}: kapasitas ${Math.round(p.bin)}% (batas ${cfg.binThreshold}%). Petugas sudah diberi tahu.`, kind: 'alert', link: `/peta?titik=${p.id}`, key: `bin-${p.id}` });
        this.telegram.send(`⚠️ CILANCAR – BIN PENUH\n${p.name} (${p.address})\nKapasitas ${Math.round(p.bin)}% — segera dikosongkan.`);
      }
      if (cfg.notifyFlood && p.water >= cfg.floodThreshold && now - la.flood > COOLDOWN) {
        la.flood = now; changed = true;
        this.notifications.push({ title: 'Waspada banjir', body: `${p.name}: tinggi air ${Math.round(p.water)} cm (batas ${cfg.floodThreshold} cm). Jauhi area genangan.`, kind: 'alert', link: `/peta?titik=${p.id}`, key: `flood-${p.id}` });
        this.telegram.send(`🌊 CILANCAR – RISIKO BANJIR\n${p.name} (${p.address})\nTinggi air ${Math.round(p.water)} cm — perlu penanganan.`);
      }
      return la.bin !== p.lastAlert.bin || la.flood !== p.lastAlert.flood ? { ...p, lastAlert: la } : p;
    });
    if (changed) sensors.set({ points });
  }
}

/* ---------- SensorService (monitor alat CILANCAR – simulasi) ---------- */
const COOLDOWN = 30 * 60 * 1000; // jeda 30 menit per titik agar notifikasi tidak menumpuk
const pointStatus = (p, cfg) => {
  if (p.bin >= cfg.binThreshold || p.water >= cfg.floodThreshold) return 'risk';
  if (p.bin >= cfg.binThreshold - 20 || p.water >= cfg.floodThreshold * 0.6) return 'warn';
  return 'normal';
};
const pointReason = (p, cfg) => {
  const wr = p.water / cfg.floodThreshold, br = p.bin / cfg.binThreshold;
  if (wr >= 0.6 && wr >= br) return { kind: 'flood', text: `tinggi air ${Math.round(p.water)} cm` };
  if (br >= 0.75) return { kind: 'bin', text: `kapasitas ${Math.round(p.bin)}%` };
  return { kind: null, text: 'kondisi normal' };
};
const mkPoint = (id, name, address, x, y, bin, water, base, kec = 'Dayeuhkolot') => {
  const c = KEC[kec] || KEC.Dayeuhkolot, j = (Math.abs(x * 7 + y * 3) % 40) / 10000; // sebaran kecil agar koordinat tiap titik berbeda
  return { id, name, address, x, y, bin, water, base, device: true, lat: +(c[0] - j).toFixed(5), lng: +(c[1] + j).toFixed(5), lastAlert: { bin: 0, flood: 0 } };
};
class SensorService extends PersistedStore {
  constructor({ settings, alerts, notifications }) {
    super('sensors', () => ({ points: [
      mkPoint('p1', 'Jl. Raya Dayeuhkolot', 'Jl. Raya Dayeuhkolot No. 123, Dayeuhkolot, Bandung', 150, 205, 84, 20, 18, 'Dayeuhkolot'),
      mkPoint('p2', 'Jl. Mohammad Toha', 'Jl. Mohammad Toha, Dayeuhkolot, Bandung', 212, 222, 68, 17, 16, 'Dayeuhkolot'),
      mkPoint('p3', 'Jl. Raya Bojongsoang', 'Jl. Raya Bojongsoang, Bojongsoang, Bandung', 292, 168, 32, 29, 27, 'Bojongsoang'),
      mkPoint('p4', 'Jl. Raya Baleendah', 'Jl. Raya Baleendah, Baleendah, Bandung', 222, 118, 24, 8, 9, 'Baleendah'),
      mkPoint('p5', 'Jl. Andir', 'Jl. Andir, Baleendah, Bandung', 118, 128, 18, 6, 7, 'Baleendah'),
      mkPoint('p6', 'Jl. Cipagalo', 'Jl. Cipagalo, Bojongsoang, Bandung', 292, 318, 22, 10, 10, 'Bojongsoang'),
      mkPoint('p7', 'Jl. Citeureup', 'Jl. Citeureup, Dayeuhkolot, Bandung', 150, 330, 41, 12, 11, 'Dayeuhkolot'),
      mkPoint('p8', 'Jl. Pasawahan', 'Jl. Pasawahan, Dayeuhkolot, Bandung', 262, 248, 28, 9, 9, 'Dayeuhkolot'),
    ] }));
    this.settings = settings; this.alerts = alerts; this.notifications = notifications; this.timer = null;
  }
  start() { if (this.timer) return; this.timer = setInterval(() => this.tick(), 5000); this.tick(); }
  stop() { clearInterval(this.timer); this.timer = null; }
  tick() {
    const now = Date.now();
    this.set({ points: this.state.points.map((p) => !p.device ? p : { ...p,
      bin: clamp(p.bin + Math.random() * 0.5, 0, 100),
      water: clamp(p.water + (p.base - p.water) * 0.08 + (Math.random() - 0.5) * 2.2, 0, 100), updatedAt: now }) });
    this.evaluate();
  }
  evaluate() { this.alerts.check(this); }
  find(id) { return this.state.points.find((p) => p.id === id); }
  add(d) { const p = { ...mkPoint(uid('p'), d.name, d.address, d.x, d.y, +d.bin || 0, +d.water || 0, +d.water || 5) }; this.set({ points: [...this.state.points, p] }); this.evaluate(); return p; }
  update(id, patch) { const n = { ...patch }; if (patch.water != null) n.base = +patch.water; this.set({ points: this.state.points.map((p) => (p.id === id ? { ...p, ...n } : p)) }); this.evaluate(); }
  remove(id) { this.set({ points: this.state.points.filter((p) => p.id !== id) }); }
  clean(id) { const p = this.find(id); if (!p) return; this.update(id, { bin: 3, lastAlert: { ...p.lastAlert, bin: 0 } }); this.notifications.push({ title: 'Alat CILANCAR telah dibersihkan', body: `Petugas mengosongkan alat di ${p.name}.`, kind: 'info', link: `/peta?titik=${id}` }); }
  simulateFull(id) {
    const cfg = this.settings.get();
    const p = id ? this.find(id) : this.state.points.find((x) => x.bin < cfg.binThreshold - 5) || this.state.points[0];
    if (p) this.update(p.id, { bin: 88, lastAlert: { ...p.lastAlert, bin: 0 } });
  }
  simulateRain(id) {
    const ids = id ? [id] : this.state.points.map((p) => p.id), cfg = this.settings.get();
    this.set({ points: this.state.points.map((p) => ids.includes(p.id) ? { ...p, water: clamp(cfg.floodThreshold + 4 + Math.random() * 8, 0, 100), lastAlert: { ...p.lastAlert, flood: 0 } } : p) });
    this.evaluate();
  }
}

/* ---------- ReportService (CRUD laporan) ---------- */
class ReportService extends PersistedStore {
  constructor({ notifications, telegram, account }) {
    super('reports', () => {
      const now = Date.now(), h = 3600000;
      const mk = (id, type, severity, address, ago, status, photos, note) => { const kec = /Baleendah/.test(address) ? 'Baleendah' : /Bojongsoang/.test(address) ? 'Bojongsoang' : 'Dayeuhkolot'; return ({ id, type, severity, note, photos, emergency: false, reporter: 'Warga Bandung', status, location: { address, lat: KEC[kec][0], lng: KEC[kec][1] }, createdAt: now - ago,
        history: STATUSES.slice(0, STATUSES.findIndex((s) => s.key === status) + 1).map((s, i) => ({ status: s.key, at: now - ago + i * 2 * h })) }); };
      return [
        mk('LP-100231', 'sumbatan', 'sedang', 'Jl. Raya Dayeuhkolot No. 123, Dayeuhkolot, Bandung', 3 * h, 'diverifikasi', [samplePhoto('flood'), samplePhoto('trash')], 'Saluran tersumbat sampah plastik, air mulai meluap ke jalan.'),
        mk('LP-100198', 'genangan', 'berat', 'Jl. Raya Baleendah, Baleendah, Bandung', 14 * h, 'diproses', [samplePhoto('flood')], 'Genangan setinggi betis di depan ruko.'),
        mk('LP-100154', 'sampah', 'ringan', 'Jl. Andir, Baleendah, Bandung', 30 * h, 'selesai', [], 'Tumpukan sampah di tepi saluran.'),
        mk('LP-100120', 'banjir', 'berat', 'Jl. Raya Bojongsoang, Bojongsoang, Bandung', 52 * h, 'selesai', [samplePhoto('flood')], 'Air masuk ke permukiman.'),
        mk('LP-100087', 'sumbatan', 'ringan', 'Jl. Mohammad Toha, Dayeuhkolot, Bandung', 76 * h, 'dikirim', [], ''),
      ];
    });
    this.notifications = notifications; this.telegram = telegram; this.account = account;
  }
  find(id) { return this.state.find((r) => r.id === id); }
  create(d) {
    const now = Date.now(); const u = this.account.get().user;
    const r = { id: `LP-${String(now).slice(-6)}`, type: d.type, severity: d.severity, note: d.note || '', photos: d.photos || [], location: d.location, emergency: !!d.emergency, reporter: u ? u.name : 'Warga', status: 'dikirim', createdAt: now, history: [{ status: 'dikirim', at: now }] };
    let photosDropped = false;
    if (!this.set([r, ...this.state])) { photosDropped = true; this.set([{ ...r, photos: [] }, ...this.state.slice(1)]); }
    this.notifications.push({ title: r.emergency ? 'Laporan darurat terkirim' : 'Laporan Anda telah diterima', body: `${typeTitle(r)} di ${r.location.address}.`, kind: 'report', link: `/laporan/${r.id}` });
    if (r.emergency || r.severity === 'berat') this.telegram.send(`${r.emergency ? '🆘 LAPORAN DARURAT' : '📣 Laporan baru (berat)'}\n${typeTitle(r)} – ${r.location.address}\nPelapor: ${r.reporter}\n${r.note || ''}`.trim());
    return { report: r, photosDropped };
  }
  update(id, patch) { this.set(this.state.map((r) => (r.id === id ? { ...r, ...patch } : r))); }
  remove(id) { this.set(this.state.filter((r) => r.id !== id)); }
  advance(id) {
    const r = this.find(id); if (!r) return;
    const i = STATUSES.findIndex((s) => s.key === r.status); if (i >= STATUSES.length - 1) return;
    const next = STATUSES[i + 1].key;
    this.set(this.state.map((x) => (x.id === id ? { ...x, status: next, history: [...x.history, { status: next, at: Date.now() }] } : x)));
    const T = { diverifikasi: 'Laporan Anda telah Diverifikasi', diproses: 'Petugas sedang menangani laporan Anda', selesai: 'Laporan Anda telah selesai' };
    this.notifications.push({ title: T[next], body: `${typeTitle(r)} – ${r.location.address} (${statusLabel(next)}).`, kind: 'report', link: `/laporan/${id}` });
  }
}

/* ---------- ChatService ---------- */
class ChatService extends PersistedStore {
  constructor({ reports }) {
    super('chat', () => { const n = Date.now(), m = 60000; return [
      { id: uid('m'), from: 'warga', text: 'Halo, saya ingin menanyakan laporan yang saya kirimkan sebelumnya.', at: n - 40 * m },
      { id: uid('m'), from: 'dinas', text: 'Halo, terima kasih sudah menghubungi kami. Mohon ditunggu sebentar ya 🙂', at: n - 38 * m },
      { id: uid('m'), from: 'dinas', text: 'Baik, laporan Anda sedang ditangani oleh petugas kami di lokasi.', at: n - 35 * m },
      { id: uid('m'), from: 'warga', text: 'Terima kasih atas informasinya 🙏', at: n - 34 * m } ]; });
    this.reports = reports; this.typing = new Store(false);
  }
  send(text, refId) {
    this.set([...this.state, { id: uid('m'), from: 'warga', text, at: Date.now(), ref: refId || null }]);
    this.typing.set(true);
    setTimeout(() => { this.set([...this.state, { id: uid('m'), from: 'dinas', text: this.reply(text, refId), at: Date.now() }]); this.typing.set(false); }, 1400);
  }
  reply(text, refId) {
    const q = text.toLowerCase(), r = refId ? this.reports.find(refId) : null;
    if (r) return `Laporan ${r.id} (${typeTitle(r)} di ${r.location.address}) saat ini berstatus "${statusLabel(r.status)}". ${r.status === 'selesai' ? 'Terima kasih sudah melapor 🙏' : 'Petugas akan mengabari bila ada perkembangan.'}`;
    if (/(terima kasih|makasih|thanks)/.test(q)) return 'Sama-sama! Kabari kami lagi jika ada kendala di lapangan 🙂';
    if (/(banjir|darurat|genang)/.test(q)) return 'Mohon tetap waspada. Untuk kondisi darurat gunakan tombol "Laporkan Darurat" di Beranda agar petugas segera menuju lokasi.';
    if (/(laporan|status)/.test(q)) return 'Anda bisa melihat status laporan di menu Riwayat Laporan. Bila ingin kami cek laporan tertentu, lampirkan dengan ikon klip.';
    return 'Terima kasih, pesan Anda sudah kami terima. Petugas CS akan membalas pada jam layanan 07.00–17.00 WIB.';
  }
  remove(id) { this.set(this.state.filter((m) => m.id !== id)); }
  clear() { this.set([]); }
}

/* ---------- rangkai semua service (urutan = urutan dependensi) ---------- */
const svc = {};
svc.settings = new SettingsService();
svc.account = new AccountService();
svc.toasts = new ToastService();
svc.notifications = new NotificationService({ settings: svc.settings, toasts: svc.toasts });
svc.telegram = new TelegramService({ settings: svc.settings });
svc.alerts = new AlertService({ settings: svc.settings, notifications: svc.notifications, telegram: svc.telegram });
svc.sensors = new SensorService({ settings: svc.settings, alerts: svc.alerts, notifications: svc.notifications });
svc.reports = new ReportService({ notifications: svc.notifications, telegram: svc.telegram, account: svc.account });
svc.chat = new ChatService({ reports: svc.reports });
function resetAllData() {
  Object.keys(localStorage).filter((k) => k.startsWith(PFX) && ![PFX + 'settings', PFX + 'dataver'].includes(k)).forEach((k) => localStorage.removeItem(k));
  location.reload();
}
