// Real dental anatomy extracted from the exocad library arch (uploads/LIBINFOK.stl → public/models/teeth.bin).
// Pieces are one side (patient-left lower arch) in tooth-local space: +Y occlusal, y=0 at the CEJ,
// +X distal, +Z buccal. Scene units (1 ≈ 10.6 mm). The other side is produced by mirroring X.
import * as THREE from 'three';

let cache = null, pending = null;

function parse(ab) {
  const dv = new DataView(ab), hl = dv.getUint32(0, true);
  const meta = JSON.parse(new TextDecoder().decode(new Uint8Array(ab, 4, hl)));
  const base = 4 + hl, out = { meta, geo: {} };
  for (const [name, m] of Object.entries(meta.pieces)) {
    const q = new Int16Array(ab, base + m.po, m.vc * 3), p = new Float32Array(q.length);
    for (let i = 0; i < q.length; i++) p[i] = q[i] / meta.q;
    const I = new (m.i32 ? Uint32Array : Uint16Array)(ab.slice(base + m.io, base + m.io + m.ic * (m.i32 ? 4 : 2)));
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setIndex(new THREE.BufferAttribute(I, 1));
    g.computeVertexNormals(); g.computeBoundingSphere();
    out.geo[name] = g;
  }
  return out;
}

const get = url => fetch(url).then(r => { if (!r.ok) throw new Error(url + ' ' + r.status); return r.arrayBuffer(); });

// '/models/…' is the Vite public path; './public/models/…' serves the no-build QA preview.
export function loadDentalAssets() {
  if (cache) return Promise.resolve(cache);
  return pending ||= get('/models/teeth.bin').catch(() => get('./public/models/teeth.bin'))
    .then(ab => (cache = parse(ab)))
    .catch(err => { console.warn('Dental assets unavailable, using procedural teeth', err); return null; });
}

export const dentalAssets = () => cache;

// Mirror across X (left/right counterpart); flips winding so faces stay outward.
export function mirrorX(g) {
  const m = g.clone(), p = m.attributes.position, I = m.index.array;
  for (let i = 0; i < p.count; i++) p.setX(i, -p.getX(i));
  for (let i = 0; i < I.length; i += 3) { const t = I[i + 1]; I[i + 1] = I[i + 2]; I[i + 2] = t; }
  m.index.needsUpdate = true; m.computeVertexNormals(); return m;
}
