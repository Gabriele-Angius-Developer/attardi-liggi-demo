// Camera keys: one resting framing per scene (0..10). m* = mobile overrides.
import { ease, lerp, win } from './math.js';

export const KD = [
  { r: 8.6, az: .3, el: .62, t: [0, .15, .2], sx: .24, sy: .02, wide: 1, msy: .27 },
  { r: 5.6, az: .75, el: .1, t: [0, -.32, 0], sx: -.2, sy: 0 },
  { r: 12, az: .3, el: .06, t: [0, -.55, 0], sx: .02, sy: -.03, msx: -.2, msy: .15, mr: 1.55 },
  { r: 3.9, az: .5, el: .42, t: [0, .25, 0], sx: -.06, sy: .02, msy: .1, mr: 1.75 },
  { r: 4.5, az: .4, el: .3, t: [0, .25, 0], sx: .2, sy: 0 },
  { r: 9.5, az: .2, el: .2, t: [0, 0, 0], sx: .22, sy: .08 },
  { r: 7.4, az: 0, el: .18, t: [0, 0, 0], sx: .08, sy: -.07 },
  { r: 14.4, az: -.2, el: .42, t: [0, -.5, 0], sx: 0, sy: -.1, wide: 1, msy: .02, mr: 1.75 },
  { r: 12, az: 0, el: .12, t: [0, 0, 0], sx: 0, sy: 0, wide: 1 },
  { r: 9.8, az: .3, el: .6, t: [0, 0, .2], sx: 0, sy: 0, wide: 1 },
  { r: 14, az: .35, el: .62, t: [0, 0, .2], sx: -.25, sy: -.2, wide: 1, msy: .3, mr: 1.6 },
];

export function cameraKeys(mobile) {
  return KD.map(k => {
    const o = { r: k.r, az: k.az, el: k.el, tx: k.t[0], ty: k.t[1], tz: k.t[2], sx: k.sx, sy: k.sy, fov: 35 };
    if (mobile) { o.sx = k.msx ?? 0; o.sy = k.msy ?? .2; o.fov = 42; o.r *= k.mr ?? (k.wide ? 2.05 : 1.5); }
    return o;
  });
}

// Hold each scene's framing for 60% of its progress, then ease to the next one.
export function camState(P, KK) {
  const i = Math.min(10, Math.max(0, Math.floor(P))), f = P - i, a = KK[i], b = KK[Math.min(10, i + 1)];
  const t = f < .6 ? 0 : ease((f - .6) / .4), s = {};
  for (const k in a) s[k] = lerp(a[k], b[k], t);
  s.az += .3 * win(P, 0, .6, .6, 1); s.r -= .5 * win(P, 0, .6, .6, 1);
  s.az += -1.0 * win(P, 7, 7.6, 7.6, 8); s.el -= .62 * win(P, 7.18, 7.4, 7.44, 7.62);
  return s;
}

export function applyCam(c, s, W, H) {
  c.fov = s.fov; c.aspect = W / H;
  const ce = Math.cos(s.el);
  c.position.set(s.tx + s.r * ce * Math.sin(s.az), s.ty + s.r * Math.sin(s.el), s.tz + s.r * ce * Math.cos(s.az));
  c.lookAt(s.tx, s.ty, s.tz); c.setViewOffset(W, H, -s.sx * W, s.sy * H, W, H); c.updateProjectionMatrix(); c.updateMatrixWorld();
}
