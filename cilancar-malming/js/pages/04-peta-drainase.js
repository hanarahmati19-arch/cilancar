/* Titik 4 – Peta Kondisi Drainase
   Kelas: DrainageMapPage  ·  terhubung lewat svc.* (core.js) dan Router/Acts (app.js)

   Peta digambar sebagai ilustrasi SVG yang dibangkitkan program (tanpa internet / tanpa gambar):
   dataran banjir Citarum, sungai, jalan berjenjang (tol, arteri, kolektor, lingkungan), rel, ribuan bangunan,
   taman, sawah & pepohonan. Ada dua gaya: "Peta" dan "Satelit". Bisa digeser (drag), di-zoom (roda/cubit/tombol).
   Titik drainase tetap berupa penanda yang bisa diklik (buka popup detail) dan koordinatnya tidak berubah (x 0-400, y 0-440). */
const MapState = { adding: false, filter: { normal: true, warn: true, risk: true }, style: 'street' };
try { const s = localStorage.getItem('cilancar.html.mapstyle'); if (s === 'sat' || s === 'street') MapState.style = s; } catch (e) {}
const MAP_COLOR = { normal: 'var(--green)', warn: 'var(--amber)', risk: 'var(--red)' };
const MAP_W = { x0: -140, y0: -80, x1: 540, y1: 520 };               // dunia yang digambar
const MV = { cx: 200, cy: 228, z: 1, A: 1.5, pw: 900, u: 0.5, moved: false, sig: '' };  // tampilan (pusat, zoom, rasio, px, satuan/px)
const mclamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* ===================== peta dasar (dibangkitkan sekali) ===================== */
const MapBase = (() => {
  let cache = null;
  const f = (n) => Math.round(n * 10) / 10;
  let seed = 20260;
  const rng = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const R = (a, b) => a + rng() * (b - a);
  const W = MAP_W;
  const inWorld = (x, y) => x > W.x0 && x < W.x1 && y > W.y0 && y < W.y1;
  const coastY = (x) => 30 + 6 * Math.sin(x / 37) + 3 * Math.sin(x / 11 + 2);
  const inSea = (x, y) => y < coastY(x) + 3;

  const smooth = (pts) => {
    let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
    }
    return d;
  };
  const dens = (pts, step = 3) => {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step));
      for (let k = 0; k < n; k++) out.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n]);
    }
    out.push(pts[pts.length - 1]); return out;
  };
  const bez = (a, b, c, d, t) => { const m = 1 - t, k = [m * m * m, 3 * m * m * t, 3 * m * t * t, t * t * t]; return [k[0] * a[0] + k[1] * b[0] + k[2] * c[0] + k[3] * d[0], k[0] * a[1] + k[1] * b[1] + k[2] * c[1] + k[3] * d[1]]; };

  /* sungai (Citarum) */
  const RIVER_D = 'M338 -80L334 -20C300 80 340 140 260 200C180 260 230 330 270 440L285 520';
  const riv = [[338, -80], [334, -20]];
  [[[334, -20], [300, 80], [340, 140], [260, 200]], [[260, 200], [180, 260], [230, 330], [270, 440]]].forEach((s) => { for (let t = 0; t <= 1.001; t += 0.02) riv.push(bez(...s, t)); });
  riv.push([285, 520]);
  const rivDense = dens(riv, 3);
  const dRiver = (x, y) => { let m = 1e9; for (const [a, b] of rivDense) { const d = Math.hypot(a - x, b - y); if (d < m) m = d; } return m; };

  /* jaringan jalan: hwy = tol/jalan pantai, art = arteri, col = kolektor */
  const ROADS = [
    { id: 'hy1', n: 'Jl. Raya Banjaran', c: 'hwy', p: [[-140, 70], [0, 62], [120, 56], [250, 50], [400, 46], [540, 40]], lab: [70, 60] },
    { id: 'hy2', n: 'Tol Soroja', c: 'hwy', p: [[-140, 410], [80, 420], [200, 410], [330, 425], [540, 440]], lab: [60, 417] },
    { id: 'rA', n: 'Jl. Raya Bojongsoang', c: 'art', p: [[-140, 141], [0, 150], [200, 164], [400, 175], [540, 181]], lab: [60, 152] },
    { id: 'rB', n: 'Jl. Andir', c: 'art', p: [[-140, 305], [0, 300], [120, 288], [240, 308], [400, 290], [540, 284]], lab: [50, 297] },
    { id: 'rC', n: 'Jl. Sukapura', c: 'art', p: [[100, -80], [110, 0], [122, 200], [135, 440], [142, 520]], lab: [114, 80] },
    { id: 'rD', n: 'Jl. Terusan Buah Batu', c: 'art', p: [[252, -80], [250, 0], [246, 100], [258, 200], [262, 300], [255, 440], [252, 520]], lab: [252, 80] },
    { id: 'rE', n: 'Jl. Mohammad Toha', c: 'art', p: [[-80, 5], [0, 60], [100, 135], [200, 210], [300, 305], [400, 400], [470, 466]], lab: [30, 78] },
    { id: 'rH', n: 'Jl. Raya Baleendah', c: 'art', p: [[-140, 140], [60, 135], [118, 128], [222, 118], [330, 100], [540, 92]], lab: [170, 122] },
    { id: 'rF', n: 'Jl. Raya Dayeuhkolot', c: 'col', p: [[-140, 192], [30, 200], [150, 205], [250, 225], [400, 250], [540, 262]], lab: [60, 201] },
    { id: 'rI', n: 'Jl. Citeureup', c: 'col', p: [[-140, 356], [0, 350], [150, 330], [255, 345], [400, 358], [540, 360]], lab: [60, 351] },
    { id: 'rJ', n: 'Jl. Cipagalo', c: 'col', p: [[300, 226], [296, 270], [292, 318], [305, 380], [320, 440], [326, 520]], lab: [304, 385] },
    { id: 'rG', n: 'Jl. Pasawahan', c: 'col', p: [[332, 332], [292, 286], [262, 248], [240, 214]], lab: null },
    { id: 'rK', n: 'Jl. Lingkar Barat', c: 'col', p: [[40, -80], [30, 100], [22, 260], [30, 400], [50, 520]], lab: [27, 220] },
    { id: 'rL', n: 'Jl. Lingkar Timur', c: 'col', p: [[360, -80], [366, 100], [372, 250], [380, 400], [392, 520]], lab: [370, 220] },
  ];
  const RAIL = [[-140, 268], [60, 270], [200, 266], [320, 262], [540, 255]];
  const HALF = { hwy: 3.4, art: 2.9, col: 2.2 };
  const lenAt = (pts, x, y) => { let best = 1e9, L = 0, at = 0, prev = null; for (const q of dens(pts, 2)) { if (prev) L += Math.hypot(q[0] - prev[0], q[1] - prev[1]); const d = Math.hypot(q[0] - x, q[1] - y); if (d < best) { best = d; at = L; } prev = q; } return at; };
  const roadSamples = [];
  ROADS.forEach((r) => dens(r.p, 3).forEach(([x, y]) => roadSamples.push([x, y, HALF[r.c] + 1.2])));
  dens(RAIL, 3).forEach(([x, y]) => roadSamples.push([x, y, 2.6]));
  const rg = new Map(); roadSamples.forEach((s) => { const k = Math.floor(s[0] / 8) + ',' + Math.floor(s[1] / 8); (rg.get(k) || rg.set(k, []).get(k)).push(s); });
  const nearRoad = (x, y) => { const cx = Math.floor(x / 8), cy = Math.floor(y / 8); for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { const a = rg.get(cx + i + ',' + (cy + j)); if (a) for (const [px, py, c] of a) if (Math.hypot(px - x, py - y) < c) return true; } return false; };

  /* taman, lapangan, kolam retensi */
  const PARKS = [[178, 238, 19, 12, -4, 'Lap. Dayeuhkolot'], [92, 74, 17, 10, 6, 'Taman Baleendah'], [62, 322, 22, 16, -10, 'Lap. Citeureup'], [340, 300, 20, 14, 8, 'Lap. Bojongsoang'], [168, 160, 13, 8, 0, 'Taman Andir'], [200, 362, 18, 11, 4, 'Lap. Cipagalo']];
  const POND = [342, 208, 17, 9, -6, 'Kolam Retensi Cieunteung'];
  const inBlob = (b, x, y, m = 2) => Math.abs(x - b[0]) < b[2] + m && Math.abs(y - b[1]) < b[3] + m;
  const inPark = (x, y) => PARKS.some((b) => inBlob(b, x, y)) || inBlob(POND, x, y, 3);
  const urban = (x, y) => 1 - (((x - 190) / 200) ** 2 + ((y - 228) / 205) ** 2) + 0.12 * Math.sin(x * 0.03 + 1) * Math.cos(y * 0.027);

  function build() {
    seed = 20260;
    const TH = -0.122, CX = 190, CY = 228, cs = Math.cos(TH), sn = Math.sin(TH);
    const toW = (u, v) => [CX + u * cs - v * sn, CY + u * sn + v * cs];
    const SU = 21, SV = 17;

    /* ---- jalan lingkungan (kisi miring) ---- */
    let minor = '';
    const okStreet = (x, y, thr) => inWorld(x, y) && urban(x, y) > thr && !inSea(x, y) && dRiver(x, y) > 7 && !inPark(x, y);
    for (let k = -20; k <= 19; k++) {
      if (rng() < 0.16) continue;
      const v = k * SV + R(-1.2, 1.2), thr = R(0.02, 0.4); let start = null, last = null;
      for (let u = -340; u <= 340; u += 4) {
        const [x, y] = toW(u, v), ok = okStreet(x, y, thr);
        if (ok && start === null) start = u; if (ok) last = u;
        if (!ok && start !== null) { if (last - start > 8) minor += `M${start} ${f(v)}H${last}`; start = null; }
      }
      if (start !== null && last - start > 8) minor += `M${start} ${f(v)}H${last}`;
    }
    for (let j = -17; j <= 16; j++) {
      if (rng() < 0.2) continue;
      const u = j * SU + R(-1.2, 1.2), thr = R(0.02, 0.4); let start = null, last = null;
      for (let v = -320; v <= 320; v += 4) {
        const [x, y] = toW(u, v), ok = okStreet(x, y, thr);
        if (ok && start === null) start = v; if (ok) last = v;
        if (!ok && start !== null) { if (last - start > 8) minor += `M${f(u)} ${start}V${last}`; start = null; }
      }
      if (start !== null && last - start > 8) minor += `M${f(u)} ${start}V${last}`;
    }

    /* ---- bangunan ---- */
    const B = ['', '', '', ''], big = [];
    const okBld = (x, y, bw, bh) => { const m = Math.max(bw, bh) * 0.5; return inWorld(x, y) && !inSea(x, y) && dRiver(x, y) > 9 + m * 0.3 && !inPark(x, y) && !nearRoad(x, y) && !nearRoad(x + bw * 0.45, y) && !nearRoad(x - bw * 0.45, y); };
    for (let j = -17; j <= 16; j++) for (let k = -20; k <= 19; k++) {
      const u0 = j * SU + 2.4, u1 = (j + 1) * SU - 2.4, v0 = k * SV + 2.4, v1 = (k + 1) * SV - 2.4;
      const [bx, by] = toW((u0 + u1) / 2, (v0 + v1) / 2), ur = urban(bx, by);
      if (ur < R(-0.02, 0.3) || !inWorld(bx, by)) continue;
      const dense = mclamp(ur * 1.8 + 0.25, 0.25, 1);
      if (ur > 0.3 && rng() < 0.03) { const [x, y] = toW((u0 + u1) / 2, (v0 + v1) / 2); if (okBld(x, y, 13, 9)) { big.push(`M${f(u0 + 1.5)} ${f(v0 + 1.5)}h${f(u1 - u0 - 3)}v${f(v1 - v0 - 3)}h${-f(u1 - u0 - 3)}z`); continue; } }
      let v = v0, row = 0;
      while (v < v1 - 2.2) {
        const bh = R(3, 4.2); let u = u0 + R(0, 0.8);
        while (u < u1 - 2.4) {
          const bw = R(3.2, 6.4), edge = row === 0 || v + bh + 3 > v1 || u < u0 + 3 || u + bw + 3 > u1;
          if (u + bw > u1) break;
          if (rng() < dense * (edge ? 0.96 : 0.55)) { const [x, y] = toW(u + bw / 2, v + bh / 2); if (okBld(x, y, bw, bh)) B[(rng() * 4) | 0] += `M${f(u)} ${f(v)}h${f(bw)}v${f(bh)}h${-f(bw)}z`; }
          u += bw + R(0.35, 0.9);
        }
        v += bh + R(0.5, 0.9); row++;
      }
    }

    /* ---- pepohonan ---- */
    let trees = '';
    const tree = (x, y, r) => { trees += `M${f(x - r)} ${f(y)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${-f(2 * r)} 0`; };
    for (let i = 0; i < 4200 && trees.length < 90000; i++) {
      const x = R(W.x0, W.x1), y = R(W.y0, W.y1);
      if (inSea(x, y) || nearRoad(x, y) || dRiver(x, y) < 6) continue;
      const ur = urban(x, y), inP = PARKS.some((b) => inBlob(b, x, y, -2));
      if (inP) { if (rng() < 0.9) tree(x, y, R(1.2, 2.2)); }
      else if (dRiver(x, y) < 16 && rng() < 0.7) tree(x, y, R(1, 1.8));
      else if (ur < 0.1 && rng() < 0.22) tree(x, y, R(1, 2));
      else if (ur < 0.45 && ur >= 0.1 && rng() < 0.05) tree(x, y, R(0.9, 1.5));
    }

    /* ---- sawah ---- */
    const FIELDS = [[-60, 440, 110, 60, -6], [330, 405, 120, 70, 5], [470, 330, 100, 120, 0], [-90, 300, 80, 110, 8], [440, 100, 90, 70, 4], [-100, 110, 70, 80, -4], [90, 495, 140, 40, 3]];
    const fields = FIELDS.map(([x, y, w, h, r]) => `<rect class="m-field" x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="6" transform="rotate(${r} ${x} ${y})"/>`).join('');

    /* ---- pantai & laut ---- */
    const coast = []; for (let x = W.x0; x <= W.x1; x += 6) coast.push([x, coastY(x)]);
    const coastD = 'M' + coast.map(([x, y]) => `${f(x)} ${f(y)}`).join('L');
    const seaD = `M${W.x0} ${W.y0}H${W.x1}V${f(coast[coast.length - 1][1])}` + [...coast].reverse().map(([x, y]) => `L${f(x)} ${f(y)}`).join('') + 'Z';
    let waves = '';
    [[-9, 5, 0.5], [-20, 6, 0.38], [-36, 7, 0.28]].forEach(([off, a, o], i) => { let d = ''; for (let x = W.x0; x <= W.x1; x += 8) d += `${x === W.x0 ? 'M' : 'L'}${x} ${f(coastY(x) + off + a * Math.sin(x / (22 + i * 7) + i))}`; waves += `<path class="m-wave" style="animation-delay:${-i * 3}s;opacity:${o}" d="${d}"/>`; });
    const piers = [[214, 4], [226, 4], [238, 4], [250, 4]].map(([x, w], i) => `<rect class="m-pier" x="${x}" y="${f(coastY(x) - 16 - i % 2 * 5)}" width="${w}" height="${f(16 + i % 2 * 5 + 2)}"/>`).join('') + `<rect class="m-pier" x="208" y="${f(coastY(220) - 4)}" width="52" height="3"/>`;

    /* ---- susun lapisan ---- */
    const roadDefs = ROADS.map((r) => `<path id="${r.id}" d="${smooth(r.p)}"/>`).join('');
    const byClass = (c) => ROADS.filter((r) => r.c === c);
    const roadLayer = (c) => byClass(c).map((r) => `<use href="#${r.id}" class="rc-${c}"/>`).join('') + byClass(c).map((r) => `<use href="#${r.id}" class="rf-${c}"/>`).join('');
    const roadLabels = ROADS.filter((r) => r.lab).map((r) => `<text class="m-rd-t ${r.c}"><textPath href="#${r.id}" startOffset="${f(lenAt(r.p, r.lab[0], r.lab[1]))}" text-anchor="middle">${r.n}</textPath></text>`).join('');
    const rivOff = f(lenAt(riv, 220, 300));
    const labels = [['Dayeuhkolot', 206, 184, 1], ['Bojongsoang', 322, 128, 1], ['Baleendah', 222, 98, 1], ['Citeureup', 52, 262], ['Pasawahan', 304, 214], ['Cipagalo', 318, 358], ['Sukapura', 160, 392]]
      .map(([tx, x, y, big]) => `<text x="${x}" y="${y}" class="map-label ${big === 1 ? 'big' : big === 2 ? 'poi' : ''}" text-anchor="middle">${tx}</text>`).join('');
    const poi = PARKS.map((b) => `<text x="${b[0]}" y="${b[1] + 1.4}" class="m-poi" text-anchor="middle">${b[5]}</text>`).join('') + `<text x="${POND[0]}" y="${POND[1] + 1.4}" class="m-poi water" text-anchor="middle">${POND[5]}</text>`;

    return `<defs>
      <pattern id="mp-field" width="4.2" height="4.2" patternUnits="userSpaceOnUse" patternTransform="rotate(18)"><rect width="4.2" height="4.2" class="m-fieldA"/><rect width="4.2" height="1.7" class="m-fieldB"/></pattern>
      <radialGradient id="mh-risk"><stop offset="0" style="stop-color:var(--red);stop-opacity:.55"/><stop offset=".55" style="stop-color:var(--red);stop-opacity:.22"/><stop offset="1" style="stop-color:var(--red);stop-opacity:0"/></radialGradient>
      <radialGradient id="mh-warn"><stop offset="0" style="stop-color:var(--amber);stop-opacity:.45"/><stop offset=".6" style="stop-color:var(--amber);stop-opacity:.18"/><stop offset="1" style="stop-color:var(--amber);stop-opacity:0"/></radialGradient>
      <radialGradient id="mh-normal"><stop offset="0" style="stop-color:var(--green);stop-opacity:.28"/><stop offset="1" style="stop-color:var(--green);stop-opacity:0"/></radialGradient>
      ${roadDefs}<path id="mn" d="${minor}"/><path id="mriver" d="${RIVER_D}"/>
    </defs>
    <rect class="m-land" x="${W.x0}" y="${W.y0}" width="${W.x1 - W.x0}" height="${W.y1 - W.y0}"/>
    <g class="m-fields">${fields}</g>
    <g>${PARKS.map(([x, y, rx, ry, r]) => `<rect class="m-park" x="${x - rx}" y="${y - ry}" width="${rx * 2}" height="${ry * 2}" rx="5" transform="rotate(${r} ${x} ${y})"/>`).join('')}</g>
    <rect class="m-pond" x="${POND[0] - POND[2]}" y="${POND[1] - POND[3]}" width="${POND[2] * 2}" height="${POND[3] * 2}" rx="7" transform="rotate(${POND[4]} ${POND[0]} ${POND[1]})"/>
    <g transform="translate(${CX} ${CY}) rotate(${f((TH * 180) / Math.PI)})">
      <g class="m-bld"><path class="b0" d="${B[0]}"/><path class="b1" d="${B[1]}"/><path class="b2" d="${B[2]}"/><path class="b3" d="${B[3]}"/><path class="bbig" d="${big.join('')}"/></g>
      <use href="#mn" class="m-sc"/><use href="#mn" class="m-sf"/>
    </g>
    <path class="m-trees" d="${trees}"/>
    <use href="#mriver" class="m-bank"/><use href="#mriver" class="m-water"/><use href="#mriver" class="m-flow"/>
    ${roadLayer('col')}${roadLayer('art')}${roadLayer('hwy')}
    <path class="m-rail" d="${smooth(RAIL)}"/><path class="m-rail-d" d="${smooth(RAIL)}"/>
    <path class="m-sea" d="${seaD}"/><path class="m-beach" d="${coastD}"/>${waves}
    <g class="m-labels">${roadLabels}${poi}<text class="m-rd-t river"><textPath href="#mriver" startOffset="${rivOff}" text-anchor="middle">Sungai Citarum</textPath></text>
    <text x="110" y="10" class="m-sea-t">Area Genangan Citarum</text>${labels}</g>`;
  }
  return () => cache || (cache = build());
})();

/* ===================== lapisan dinamis: halo genangan + penanda ===================== */
const MapUI = {
  ro: null, pointers: new Map(), tipId: null,
  box() {
    const X = MAP_W, W = X.x1 - X.x0, H = X.y1 - X.y0, base = Math.max(400, 440 * MV.A);
    let w = base / MV.z, h = w / MV.A;
    if (w > W) { w = W; h = w / MV.A; } if (h > H) { h = H; w = h * MV.A; }
    MV.cx = w >= W ? (X.x0 + X.x1) / 2 : mclamp(MV.cx, X.x0 + w / 2, X.x1 - w / 2);
    MV.cy = h >= H ? (X.y0 + X.y1) / 2 : mclamp(MV.cy, X.y0 + h / 2, X.y1 - h / 2);
    return { x: MV.cx - w / 2, y: MV.cy - h / 2, w, h };
  },
  viewBox() { const b = MapUI.box(); MV.u = b.w / MV.pw; return `${b.x.toFixed(2)} ${b.y.toFixed(2)} ${b.w.toFixed(2)} ${b.h.toFixed(2)}`; },
  sigOf: (vis) => vis.map(({ p, st }) => p.id + st + p.x + p.y + Math.round(p.water / 4)).join('|'),
  dyn(vis) {
    const u = MV.u.toFixed(4);
    const halo = vis.filter((x) => x.st !== 'normal').map(({ p, st }) => {
      const r = (st === 'risk' ? 26 : 20) + Math.round(p.water / 4) * 3.6;
      return `${st === 'risk' ? `<ellipse class="m-flood" cx="${p.x}" cy="${p.y + 3}" rx="${f1(r * 0.78)}" ry="${f1(r * 0.46)}"/>` : ''}<circle cx="${p.x}" cy="${p.y}" r="${f1(r)}" fill="url(#mh-${st})" pointer-events="none"/>`;
    }).join('');
    const mk = [...vis].sort((a, b) => a.p.y - b.p.y).map(({ p, st }) => {
      const c = MAP_COLOR[st];
      return `<g class="marker ${st}" data-point="${p.id}" data-x="${p.x}" data-y="${p.y}" data-name="${esc(p.name)}" data-sub="Air ${Math.round(p.water)} cm · ${POINT_STATUS[st].label}" tabindex="0" role="button" aria-label="${esc(p.name)} – ${POINT_STATUS[st].label}" transform="translate(${p.x} ${p.y})"><g class="mk-in" transform="scale(${u})">
        ${st === 'risk' ? '<ellipse class="mk-ring" rx="11" ry="4.2"/>' : ''}<ellipse class="mk-sh" rx="7" ry="2.6"/><circle class="mk-hit" cy="-18" r="17"/>
        <path class="mk-pin" fill="${c}" d="M0 0C-3.5-9-13-14.5-13-24a13 13 0 0 1 26 0C13-14.5 3.5-9 0 0Z"/><circle cy="-24" r="7.4" fill="#fff"/>
        <path d="M0-30.2c3.2 4 4.8 6.6 4.8 8.7a4.8 4.8 0 0 1-9.6 0c0-2.1 1.6-4.7 4.8-8.7z" fill="${c}"/></g></g>`;
    }).join('');
    const d = MapState.draft ? `<g transform="translate(${MapState.draft.x} ${MapState.draft.y})"><g class="mk-in" transform="scale(${u})"><circle r="11" fill="none" stroke="var(--blue)" stroke-width="3" stroke-dasharray="4 3"/><circle r="3" fill="var(--blue)"/></g></g>` : '';
    return halo + mk + d;
  },
  /* ---- tampilan: viewBox + ukuran penanda tetap di layar ---- */
  apply() {
    const svg = document.querySelector('svg.map'); if (!svg) return;
    svg.setAttribute('viewBox', MapUI.viewBox()); svg.style.setProperty('--k', MV.u.toFixed(4));
    const s = `scale(${MV.u.toFixed(4)})`;
    svg.querySelectorAll('.mk-in').forEach((g) => g.setAttribute('transform', s));
    const tip = document.getElementById('map-tip'); if (tip && MapUI.tipId) MapUI.showTip(MapUI.tipId);
    const z = document.querySelector('.map-card'); if (z) z.dataset.zoom = MV.z > 2.2 ? 'hi' : MV.z > 1.4 ? 'mid' : 'lo';
  },
  fit() {
    const st = document.querySelector('.map-stage'); if (!st) return;
    const r = st.getBoundingClientRect(); if (!r.width || !r.height) return;
    MV.pw = r.width; MV.A = r.width / r.height; MapUI.apply();
  },
  zoomAt(px, py, k) {
    const svg = document.querySelector('svg.map'); if (!svg) return;
    const r = svg.getBoundingClientRect(), fx = (px - r.left) / r.width, fy = (py - r.top) / r.height, b = MapUI.box();
    const wx = b.x + fx * b.w, wy = b.y + fy * b.h; MV.z = mclamp(MV.z * k, 1, 4.5);
    const base = Math.max(400, 440 * MV.A), w2 = base / MV.z, h2 = w2 / MV.A;
    MV.cx = wx - fx * w2 + w2 / 2; MV.cy = wy - fy * h2 + h2 / 2; MapUI.apply();
  },
  showTip(id) {
    const m = document.querySelector(`.marker[data-point="${id}"]`), tip = document.getElementById('map-tip'); if (!m || !tip) return MapUI.hideTip();
    MapUI.tipId = id; const name = m.dataset.name, sub = m.dataset.sub, w = Math.max(name.length * 7, sub.length * 5.7) + 24;
    tip.setAttribute('transform', `translate(${m.dataset.x} ${m.dataset.y}) scale(${MV.u.toFixed(4)})`);
    tip.innerHTML = `<g transform="translate(${-w / 2} -80)"><rect class="mk-tip-bg" width="${w}" height="36" rx="10"/><path class="mk-tip-bg" d="M${w / 2 - 6} 35.5h12l-6 7z"/><text class="mk-tip-t" x="12" y="15.5">${esc(name)}</text><text class="mk-tip-s" x="12" y="29">${esc(sub)}</text></g>`;
    tip.classList.add('on');
    document.querySelectorAll('.marker.hl').forEach((e) => e.classList.remove('hl')); m.classList.add('hl');
  },
  /* pindah & perbesar peta ke satu titik, tandai penandanya, lalu tampilkan labelnya (langsung dari "Lihat Peta") */
  focus(id) {
    const p = svc.sensors.find(id); if (!p) return;
    MapState.filter = { normal: true, warn: true, risk: true };
    MV.z = 2.2; MV.cx = p.x; MV.cy = p.y - 10; MapUI.fit(); MapUI.apply();
    requestAnimationFrame(() => { MapUI.apply(); MapUI.showTip(id); });
  },
  hideTip() { MapUI.tipId = null; const tip = document.getElementById('map-tip'); if (tip) { tip.classList.remove('on'); tip.innerHTML = ''; } document.querySelectorAll('.marker.hl').forEach((e) => e.classList.remove('hl')); },
  bind() {
    const svg = document.querySelector('svg.map'); if (!svg) return;
    if (MapUI.ro) MapUI.ro.disconnect();
    MapUI.pointers.clear(); MapUI.fit();
    if (window.ResizeObserver) { MapUI.ro = new ResizeObserver(() => MapUI.fit()); MapUI.ro.observe(document.querySelector('.map-stage')); }
    svg.addEventListener('wheel', (e) => { e.preventDefault(); MapUI.zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * (e.ctrlKey ? 0.012 : 0.0018))); }, { passive: false });
    svg.addEventListener('dblclick', (e) => { if (!e.target.closest('[data-point]') && !MapState.adding) MapUI.zoomAt(e.clientX, e.clientY, 1.7); });
    svg.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      MV.moved = false; MapUI.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY });
      window.addEventListener('pointermove', MapUI.move); window.addEventListener('pointerup', MapUI.up); window.addEventListener('pointercancel', MapUI.up);
    });
    svg.addEventListener('mouseover', (e) => { const m = e.target.closest('.marker'); if (m && !MV.dragging) MapUI.showTip(m.dataset.point); });
    svg.addEventListener('mouseout', (e) => { if (e.target.closest('.marker')) MapUI.hideTip(); });
    svg.addEventListener('focusin', (e) => { const m = e.target.closest('.marker'); if (m) MapUI.showTip(m.dataset.point); });
    svg.addEventListener('focusout', MapUI.hideTip);
    svg.addEventListener('keydown', (e) => { const m = e.target.closest('.marker'); if (m && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openPoint(m.dataset.point); } });
  },
  move(e) {
    const p = MapUI.pointers.get(e.pointerId); if (!p) return;
    if (MapUI.pointers.size === 1) {
      if (!MV.moved && Math.hypot(e.clientX - p.sx, e.clientY - p.sy) > 5) { MV.moved = true; MV.dragging = true; MapUI.hideTip(); document.querySelector('svg.map')?.classList.add('drag'); }
      if (MV.moved) { MV.cx -= (e.clientX - p.x) * MV.u; MV.cy -= (e.clientY - p.y) * MV.u; MapUI.apply(); }
      p.x = e.clientX; p.y = e.clientY;
    } else {
      const [a, b] = [...MapUI.pointers.entries()].map(([id, q]) => (id === e.pointerId ? { ...q, x: e.clientX, y: e.clientY } : q));
      const d0 = Math.hypot(a.x - b.x, a.y - b.y); MapUI.pointers.set(e.pointerId, { ...p, x: e.clientX, y: e.clientY });
      const [c, d] = [...MapUI.pointers.values()], d1 = Math.hypot(c.x - d.x, c.y - d.y);
      MV.moved = true; MV.dragging = true; if (d0 > 0) MapUI.zoomAt((c.x + d.x) / 2, (c.y + d.y) / 2, d1 / d0);
    }
  },
  up(e) {
    MapUI.pointers.delete(e.pointerId);
    if (!MapUI.pointers.size) { window.removeEventListener('pointermove', MapUI.move); window.removeEventListener('pointerup', MapUI.up); window.removeEventListener('pointercancel', MapUI.up); document.querySelector('svg.map')?.classList.remove('drag'); setTimeout(() => { MV.dragging = false; }, 0); }
  },
};
const f1 = (n) => Math.round(n * 10) / 10;

class DrainageMapPage {
  static watch = ['sensors', 'settings'];
  static mount(p) {
    MapUI.bind();
    if (p.query.titik && svc.sensors.find(p.query.titik)) { MapUI.focus(p.query.titik); history.replaceState(null, '', '#/peta'); }
  }
  static data() {
    const cfg = svc.settings.get(), ws = svc.sensors.get().points.map((p) => ({ p, st: pointStatus(p, cfg) }));
    return { ws, vis: ws.filter((x) => MapState.filter[x.st]) };
  }
  static legend(ws) { return Object.entries(POINT_STATUS).map(([k, v]) => `<button class="lg ${MapState.filter[k] ? '' : 'off'}" data-act="mfilter" data-k="${k}"><i style="background:${MAP_COLOR[k]}"></i> ${v.label} <em>${ws.filter((x) => x.st === k).length}</em></button>`).join(''); }
  static list(vis) {
    return `<h3 class="sec pad">Daftar Titik</h3>${[...vis].sort((a, b) => b.p.bin - a.p.bin).map(({ p, st }) => `<button class="row" data-act="point" data-id="${p.id}"><span class="dotc" style="background:${MAP_COLOR[st]}"></span><span class="row-tx"><b>${esc(p.name)}</b><small>Alat ${Math.round(p.bin)}% · Air ${Math.round(p.water)} cm</small></span>${pointPill(st)}</button>`).join('')}`;
  }
  /* dipanggil saat data sensor berubah: perbarui penanda tanpa mengulang seluruh halaman (zoom/geser tetap) */
  static update() {
    const dyn = document.getElementById('map-dyn'); if (!dyn) return Router.render();
    if (MV.dragging) return;
    const { ws, vis } = DrainageMapPage.data(), sig = MapUI.sigOf(vis);
    if (sig !== MV.sig) { MV.sig = sig; dyn.innerHTML = MapUI.dyn(vis); MapUI.hideTip(); }
    else vis.forEach(({ p, st }) => { const m = dyn.querySelector(`[data-point="${p.id}"]`); if (m) m.dataset.sub = `Air ${Math.round(p.water)} cm · ${POINT_STATUS[st].label}`; });
    const l = document.getElementById('map-list'); if (l) l.innerHTML = DrainageMapPage.list(vis);
    const g = document.getElementById('map-legend'); if (g) g.innerHTML = DrainageMapPage.legend(ws);
  }
  static html() {
    const { ws, vis } = DrainageMapPage.data(); MV.sig = MapUI.sigOf(vis);
    const vb = MapUI.viewBox();
    return `<div class="page">${pageHeader({ title: t('title.map'), back: '/', right: `<button class="btn btn-sm ${MapState.adding ? 'btn-red' : 'btn-soft'}" data-act="madd">${icon(MapState.adding ? 'close' : 'plus', 16)} ${MapState.adding ? 'Batal' : 'Titik'}</button>` })}
      ${MapState.adding ? '<div class="banner-blue">Ketuk lokasi pada peta untuk menaruh titik baru.</div>' : ''}
      <div class="map-layout"><div class="map-card" data-style="${MapState.style}" data-zoom="lo"><div class="map-stage">
        <svg class="map ${MapState.adding ? 'adding' : ''}" viewBox="${vb}" style="--k:${MV.u.toFixed(4)}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Peta kondisi drainase Dayeuhkolot, Bojongsoang, Baleendah">${MapBase()}<g id="map-dyn">${MapUI.dyn(vis)}</g><g id="map-tip" class="mk-tip" pointer-events="none"></g></svg>
        <div class="map-ctl tl" role="group" aria-label="Gaya peta"><button class="${MapState.style === 'street' ? 'on' : ''}" data-act="mstyle" data-s="street">Peta</button><button class="${MapState.style === 'sat' ? 'on' : ''}" data-act="mstyle" data-s="sat">Satelit</button></div>
        <div class="map-ctl tr"><div class="compass" title="Utara di atas" aria-hidden="true"><svg viewBox="0 0 24 24" width="26" height="26"><path d="M12 3l4.2 10H12z" fill="#d9655f"/><path d="M12 3L7.8 13H12z" fill="#fff" stroke="#9aa0a8" stroke-width=".6"/><text x="12" y="21.5" text-anchor="middle" font-size="7" font-weight="800" fill="#4a5058">U</text></svg></div>
          <button class="zb" data-act="mzoom" data-d="1" aria-label="Perbesar">+</button><button class="zb" data-act="mzoom" data-d="-1" aria-label="Perkecil">−</button><button class="zb sm" data-act="mreset" aria-label="Setel ulang tampilan">${icon('map', 16)}</button></div>
        <div class="map-attr">Ilustrasi peta · tidak berskala</div></div>
        <div class="legend" id="map-legend">${DrainageMapPage.legend(ws)}</div></div>
        <aside class="map-list card list-card" id="map-list">${DrainageMapPage.list(vis)}</aside></div></div>`;
  }
}
Pages.map = DrainageMapPage;
Acts.madd = () => { MapState.adding = !MapState.adding; Router.render(); };
Acts.mfilter = (el) => { MapState.filter[el.dataset.k] = !MapState.filter[el.dataset.k]; Router.render(); };
Acts.mstyle = (el) => {
  MapState.style = el.dataset.s; try { localStorage.setItem('cilancar.html.mapstyle', MapState.style); } catch (e) {}
  const c = document.querySelector('.map-card'); if (c) c.dataset.style = MapState.style;
  document.querySelectorAll('[data-act=mstyle]').forEach((b) => b.classList.toggle('on', b === el));
};
Acts.mzoom = (el) => { const r = document.querySelector('svg.map').getBoundingClientRect(); MapUI.zoomAt(r.left + r.width / 2, r.top + r.height / 2, +el.dataset.d > 0 ? 1.5 : 1 / 1.5); };
Acts.mreset = () => { MV.z = 1; MV.cx = 200; MV.cy = 228; MapUI.apply(); };

/* sorot penanda saat kursor di daftar */
document.addEventListener('mouseover', (e) => { const r = e.target.closest('#map-list .row[data-id]'); if (r) MapUI.showTip(r.dataset.id); });
document.addEventListener('mouseout', (e) => { if (e.target.closest('#map-list .row[data-id]')) MapUI.hideTip(); });

/* klik pada peta: tambah titik baru / buka detail titik */
document.addEventListener('click', (e) => {
  const svg = e.target.closest('svg.map'); if (!svg) return;
  if (MV.moved) { MV.moved = false; return; }                       // klik akibat geser peta: abaikan
  const mk = e.target.closest('[data-point]');
  if (MapState.adding) {
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const w = pt.matrixTransform(svg.getScreenCTM().inverse());
    const x = Math.round(w.x), y = Math.round(w.y);
    MapState.adding = false; MapState.draft = { x, y }; Router.render();
    Modal.open({ title: 'Titik Drainase Baru', onClose: () => { MapState.draft = null; Router.render(); }, draw(c) {
      c.body.innerHTML = pointFormHtml({ name: '', address: 'Dayeuhkolot, Bandung', bin: 0, water: 5 });
      c.actions.innerHTML = '<button class="btn btn-ghost" data-n>Batal</button><button class="btn btn-blue" data-y>Simpan</button>';
      c.q('[data-n]').onclick = () => c.close();
      c.q('[data-y]').onclick = () => {
        const f = readForm(c); if (!f.name.trim()) { c.q('[data-f=name]').focus(); return; }
        const p = svc.sensors.add({ ...f, name: f.name.trim(), address: f.address.trim() || 'Dayeuhkolot, Bandung', x, y }); svc.toasts.success('Titik ditambahkan', p.name); c.close();
      };
    } });
  } else if (mk) openPoint(mk.dataset.point);
});
