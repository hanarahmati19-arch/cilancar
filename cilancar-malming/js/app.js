/* =========================================================
   CILANCAR – router, shell (sidebar / menu bawah), event global
   ========================================================= */
const STORES = { settings: svc.settings, account: svc.account, notifications: svc.notifications, sensors: svc.sensors, reports: svc.reports, chat: svc.chat, telegram: svc.telegram, typing: svc.chat.typing };
const ROUTES = [
  [/^\/$/, 'dashboard'], [/^\/laporan$/, 'history'], [/^\/laporan\/baru$/, 'create'],
  [/^\/laporan\/([^/]+)\/ubah$/, 'create', ['id']], [/^\/laporan\/([^/]+)$/, 'detail', ['id']],
  [/^\/peta$/, 'map'], [/^\/notifikasi$/, 'notif'], [/^\/chat$/, 'chat'], [/^\/akun$/, 'account'],
];
const Router = {
  current: null,
  parse() {
    const raw = location.hash.slice(1) || '/', [path, qs] = raw.split('?');
    for (const [re, name, keys] of ROUTES) {
      const m = path.match(re);
      if (m) {
        const params = { query: Object.fromEntries(new URLSearchParams(qs || '')) };
        (keys || []).forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
        return { name, path, params };
      }
    }
    return { name: 'dashboard', path: '/', params: { query: {} } };
  },
  go() {
    Router.current = Router.parse();
    const page = Pages[Router.current.name];
    Modal.closeAll();
    if (page.enter) page.enter(Router.current.params);
    Router.render(); window.scrollTo(0, 0); Shell.markNav();
  },
  render() {
    const c = Router.current, main = document.getElementById('main'); if (!c || !main) return;
    const page = Pages[c.name]; main.innerHTML = page.html(c.params); if (page.mount) page.mount(c.params);
  },
};

const Shell = {
  nav: [['/', 'home', 'nav.home'], ['/laporan', 'report', 'nav.reports'], ['/peta', 'map', 'nav.map'], ['/notifikasi', 'bell', 'nav.notif'], ['/chat', 'chat', 'nav.chat'], ['/akun', 'user', 'nav.account']],
  draw() {
    const app = document.getElementById('app'), u = svc.account.get().user;
    if (!u) { app.innerHTML = loginHtml(); return; }
    const un = svc.notifications.unread(), bottom = [0, 1, 3, 5].map((i) => Shell.nav[i]);
    app.innerHTML = `<div class="shell"><aside class="sidebar"><div class="brand">${logo(42)}<div><b>CILANCAR</b><small>Drainase &amp; Banjir</small></div></div>
      <nav class="side-nav">${Shell.nav.map(([to, ic, k]) => `<a class="side-link" href="#${to}" data-nav="${to}">${icon(ic)}<span>${t(k)}</span>${k === 'nav.notif' && un ? `<em class="side-badge">${un}</em>` : ''}</a>`).join('')}</nav>
      <div class="side-art" aria-hidden="true">${sideArt()}</div>
      <div class="side-foot">${themeBtn()}<small>CILANCAR v1.0</small></div></aside>
      <main class="main" id="main"></main>
      <nav class="bottom-nav" aria-label="Menu utama">${bottom.map(([to, ic, k]) => `<a class="bn-item" href="#${to}" data-nav="${to}"><span class="bn-ic">${icon(ic)}${k === 'nav.notif' && un ? '<i class="dot"></i>' : ''}</span><span>${t(k)}</span></a>`).join('')}</nav></div>`;
    Router.go();
  },
  markNav() {
    const p = Router.current ? Router.current.path : '/';
    document.querySelectorAll('[data-nav]').forEach((a) => { const to = a.dataset.nav; a.classList.toggle('active', to === '/' ? p === '/' : p.startsWith(to)); });
  },
  refreshBadges() {
    const un = svc.notifications.unread();
    document.querySelectorAll('.side-badge').forEach((b) => (un ? (b.textContent = un) : b.remove()));
  },
};

/* ---- tampilkan ulang halaman saat data yang ditonton berubah ---- */
let pending = false;
function onStoreChange(name) {
  const c = Router.current; if (!c || !svc.account.get().user) return;
  const page = Pages[c.name];
  if (name === 'notifications') Shell.refreshBadges();
  if (!page.watch.includes(name)) return;
  if (pending) return; pending = true;
  requestAnimationFrame(() => { pending = false; if (!Router.current) return; if (page.update) page.update(); else Router.render(); });
}
Object.entries(STORES).forEach(([name, s]) => { if (name !== 'account') s.subscribe(() => onStoreChange(name)); });
svc.settings.subscribe(() => { if (svc.account.get().user) { document.querySelectorAll('[data-act=theme] svg').forEach((s) => (s.outerHTML = icon(svc.settings.isDark() ? 'sun' : 'moon'))); } });

/* login / logout */
let lastUser = undefined;
svc.account.subscribe(() => {
  const u = svc.account.get().user;
  if (!!u !== !!lastUser) { lastUser = u; if (u) { svc.sensors.start(); if (!location.hash || location.hash === '#') location.hash = '#/'; } else { svc.sensors.stop(); Router.current = null; } Shell.draw(); }
  else { lastUser = u; onStoreChange('account'); }
});

/* ---- delegasi event global ---- */
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-act]');
  if (a && Acts[a.dataset.act]) { e.preventDefault(); Acts[a.dataset.act](a, e); return; }
  const g = e.target.closest('[data-go]');
  if (g) { e.preventDefault(); e.stopPropagation(); Modal.closeAll(); const to = g.dataset.go; if (location.hash === '#' + to) Router.go(); else location.hash = '#' + to; }
});
document.addEventListener('input', (e) => { const el = e.target.closest('[data-in]'); if (el && Inputs[el.dataset.in]) Inputs[el.dataset.in](el); });
document.addEventListener('change', (e) => { const el = e.target.closest('[data-chg]'); if (el && Changes[el.dataset.chg]) Changes[el.dataset.chg](el); });
document.addEventListener('submit', (e) => { const f = e.target.closest('[data-form]'); if (f && Forms[f.dataset.form]) { e.preventDefault(); Forms[f.dataset.form](f); } });
document.addEventListener('toggle', (e) => { const d = e.target; if (d.dataset && d.dataset.keep) KEEP[d.dataset.keep] = d.open; }, true);
window.addEventListener('hashchange', () => { if (svc.account.get().user) Router.go(); });

/* ---- mulai ---- */
(function start() {
  lastUser = svc.account.get().user;
  if (lastUser) svc.sensors.start();
  drawToasts();
  Shell.draw();
})();
