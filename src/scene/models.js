// Procedural placeholder geometry.
// To swap in real dental assets later, return GLTF-loaded geometries/meshes under the SAME keys
// (tooth.*, root, abutment, screw, fixture, fixtureTop) and keep builders' signatures:
// the choreography only reads poses, opacity and materials, never geometry internals.
import * as THREE from 'three';
import { V, sstep } from './math.js';

export const PRESET = {
  incisor: { w: .86, d: .62, h: 1.02, ey: .8, t: 'inc' }, lateral: { w: .7, d: .56, h: .9, ey: .8, t: 'inc' },
  canine: { w: .8, d: .74, h: 1.0, ey: .75, t: 'can' }, pm: { w: .74, d: .86, h: .78, ey: .55, t: 'pm' },
  molar: { w: 1.04, d: 1.0, h: .72, ey: .5, t: 'mol' }, molar2: { w: .96, d: .96, h: .68, ey: .5, t: 'mol' },
};

function cusp(t, x, z) {
  const pts = t === 'mol' ? [[-.45, -.42], [.45, -.42], [-.45, .42], [.45, .42]] : [[0, -.45], [0, .45]];
  let f = 0; for (const [cx, cz] of pts) f += Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / .12);
  f -= .55 * Math.exp(-(z * z) / .015); if (t === 'mol') f -= .3 * Math.exp(-(x * x) / .015);
  return f;
}

/* Tooth / crown */
function toothGeo(pr, ws, hs) {
  const g = new THREE.SphereGeometry(1, ws, hs), a = g.attributes.position, v = V();
  for (let i = 0; i < a.count; i++) {
    v.fromBufferAttribute(a, i); const { x, y, z } = v;
    const sx = Math.sign(x) * Math.pow(Math.abs(x), .78), sz = Math.sign(z) * Math.pow(Math.abs(z), .78);
    let X = sx * pr.w / 2, Z = sz * pr.d / 2, Y;
    if (y >= 0) {
      const yy = Math.pow(y, pr.ey); Y = yy * pr.h;
      const bul = 1 + .08 * Math.sin(Math.PI * Math.min(1, yy * 1.1)); X *= bul; Z *= bul;
      if (pr.t === 'inc') { const t = y * y; Z *= 1 - .72 * t; X *= 1 - .06 * t; }
      if (pr.t === 'can') { const t = y * y; Z *= 1 - .55 * t; X *= 1 - .35 * t; Y += pr.h * .16 * (1 - Math.min(1, Math.abs(sx) * 1.6)) * sstep(.6, 1, y); }
      if (pr.t === 'mol' || pr.t === 'pm') Y += pr.h * .26 * (cusp(pr.t, sx, sz) - .45) * sstep(.45, .95, y);
    } else { Y = y * .3; const s = 1 + .22 * y; X *= s; Z *= s; }
    a.setXYZ(i, X, Y, Z);
  }
  g.computeVertexNormals(); return g;
}

/* Implant fixture */
function fixtureProfile() {
  const p = [[.001, -.62], [.23, -.62], [.23, -.74]];
  for (let y = -.76; y > -1.95; y -= .09) { const k = 1 - .25 * sstep(-1.6, -1.95, y); p.push([.17 * k, y], [.235 * k, y - .045]); }
  p.push([.1, -2.12], [.001, -2.2]);
  return p;
}
const lathe = (pts, n) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), n);

export function buildModels(lo) {
  const ws = lo ? 44 : 72, hs = lo ? 30 : 48, M = { tooth: {} };
  for (const k in PRESET) M.tooth[k] = toothGeo(PRESET[k], ws, hs);           // arch teeth + crown
  M.root = lathe([[.001, -1.55], [.12, -1.45], [.28, -1.0], [.4, -.45], [.46, -.1], [.47, 0]], 40); // root
  M.abutment = lathe([[.001, -.42], [.2, -.42], [.23, -.3], [.3, -.12], [.3, -.06], [.24, -.02], [.2, .3], [.16, .42], [.001, .44]], 48);
  M.screw = lathe([[.001, -.9], [.05, -.88], [.05, 0], [.09, .02], [.1, .1], [.001, .12]], 24);
  M.fixture = lathe(fixtureProfile(), 48);                                    // implant
  M.fixtureTop = M.fixture.clone().translate(0, .62, 0);
  M.connector = new THREE.CylinderGeometry(.13, .13, 1, 16).rotateZ(Math.PI / 2); // bridge connectors
  return M;
}

/* Arch layout: slot poses along an elliptic arch, centred on the origin */
export function buildArchSlots(order, pose, E) {
  const A = 2.35, B = 3.0, tbl = []; let acc = 0, prev = null;
  for (let i = 0; i <= 4000; i++) { const th = -2.5 + 5 * i / 4000, p = V(A * Math.sin(th), 0, B * Math.cos(th)); if (prev) acc += p.distanceTo(prev); tbl.push([th, acc]); prev = p; }
  const s0 = tbl.find(([th]) => th >= 0)[1], gap = .03, widths = order.map(k => PRESET[k].w);
  const L = widths.reduce((a, b) => a + b, 0) + gap * 13; let cur = -L / 2;
  const raw = order.map((k, i) => {
    const s = s0 + cur + widths[i] / 2; cur += widths[i] + gap;
    const th = tbl.find(([, a]) => a >= s)[0];
    return { p: V(A * Math.sin(th), 0, B * Math.cos(th)), ry: Math.atan2(B * Math.sin(th), A * Math.cos(th)) };
  });
  const ctr = new THREE.Box3().setFromPoints(raw.map(s => s.p)).getCenter(V());
  return { slots: raw.map(s => pose(s.p.clone().sub(ctr), E(0, s.ry, 0), 1)), widths };
}

/* Toronto / full-arch structure: gingiva + titanium bar + implants */
export function buildToronto({ slots, G, mats, lo, implSlots }) {
  const pts = slots.map(s => s.p.clone());
  const ext = (a, b) => a.clone().add(a.clone().sub(b).multiplyScalar(.4));
  const curve = new THREE.CatmullRomCurve3([ext(pts[0], pts[1]), ...pts, ext(pts[13], pts[12])]);
  const group = new THREE.Group();
  const ging = new THREE.Mesh(new THREE.TubeGeometry(curve, lo ? 90 : 160, .52, 24), mats.gingiva); ging.scale.y = .85; ging.position.y = -.42;
  const bar = new THREE.Mesh(new THREE.TubeGeometry(curve, 160, .11, 12), mats.bar); bar.position.y = -1.0;
  group.add(ging, bar);
  [curve.points[0], curve.points[curve.points.length - 1]].forEach(p => {
    const c1 = new THREE.Mesh(new THREE.SphereGeometry(.52, 24, 16), mats.gingiva); c1.position.copy(p); ging.add(c1);
    const c2 = new THREE.Mesh(new THREE.SphereGeometry(.11, 12, 8), mats.bar); c2.position.copy(p); bar.add(c2);
  });
  const implants = implSlots.map(i => { const m = new THREE.Mesh(G.fixtureTop, mats.impl); m.position.set(slots[i].p.x * .94, -1.0, slots[i].p.z * .94); m.scale.setScalar(.8); group.add(m); return m; });
  return { group, ging, bar, implants };
}

/* Partial denture segment (service object) */
export function buildDenture({ G, mats }) {
  const group = new THREE.Group();
  const dc = new THREE.CatmullRomCurve3([V(-.75, 0, .1), V(0, 0, .35), V(.75, 0, .1)]);
  const dg = new THREE.Mesh(new THREE.TubeGeometry(dc, 40, .34, 16), mats.gingiva); dg.scale.y = .8; dg.position.y = -.3; group.add(dg);
  [-.36, .36].forEach(x => { const t = new THREE.Mesh(G.tooth.pm, mats.teeth); t.position.set(x, 0, .29); t.scale.setScalar(.85); group.add(t); });
  return group;
}
