import * as THREE from 'three';

export const TAU = Math.PI * 2;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const lerp = (a, b, t) => a + (b - a) * t;
export const seg = (P, a, b) => ease(clamp((P - a) / (b - a)));
export const win = (P, a, b, c, d) => seg(P, a, b) * (1 - seg(P, c, d));
export const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export const E = (x, y, z) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, 'YXZ'));

// A pose is { p: Vector3, q: Quaternion, s: uniform scale }
export const pose = (p, q = new THREE.Quaternion(), s = 1) => ({ p, q, s });
export const mix = (a, b, t) => ({ p: a.p.clone().lerp(b.p, t), q: a.q.clone().slerp(b.q, t), s: lerp(a.s, b.s, t) });
export const compose = (A, L) => ({ p: L.p.clone().multiplyScalar(A.s).applyQuaternion(A.q).add(A.p), q: A.q.clone().multiply(L.q), s: A.s * L.s });
export const setPose = (o, ps) => { o.position.copy(ps.p); o.quaternion.copy(ps.q); o.scale.setScalar(ps.s); };

// Keyframed pose track: keys = [[progress, P => pose], ...], eased between neighbours.
export function track(P, keys) {
  if (P <= keys[0][0]) return keys[0][1](P);
  for (let i = 0; i < keys.length - 1; i++) {
    const [a, fa] = keys[i], [b, fb] = keys[i + 1];
    if (P <= b) return fa === fb ? fa(P) : mix(fa(P), fb(P), ease(clamp((P - a) / (b - a))));
  }
  return keys[keys.length - 1][1](P);
}
