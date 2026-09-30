// Attardi & Liggi — one persistent scroll-driven 3D scene.
// The DOM overlay is read through data-* hooks rendered by src/ui/template.js.
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TAU, clamp, ease, lerp, seg, win, V, E, pose, compose, setPose, track } from './math.js';
import { PRESET, buildModels, buildArchSlots, buildToronto, buildDenture } from './models.js';
import { makeMats, buildLighting } from './materials.js';
import { cameraKeys, camState as camAt, applyCam as applyCamRaw } from './camera.js';
import {
  ORDER, BRIDGE_SLOTS, HERO_SLOT, SVC_TOOTH, IMPL_SLOTS, SERV_D, SERV_M, SERV_RY, SERV_RX, SERV_S, HOT_OFF,
  CONSTP, HOLD, STAGES, MAT_LABEL, FOOT,
} from './choreography.js';

gsap.registerPlugin(ScrollTrigger);
// Mobile toolbar show/hide must not trigger a full refresh (it also interrupts momentum scrolling on iOS).
ScrollTrigger.config({ ignoreMobileResize: true });

export function createExperience({ host, root, reduced = false, active = 1, viewport, sectionVH, onComp, debug = false }) {
  const VP = viewport || (() => [innerWidth, innerHeight]);
  let [W, H] = VP(), mobile = W < 760;
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 1.75));
  renderer.setSize(W, H); renderer.setClearColor(0x0A0A0B, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.localClippingEnabled = true;
  Object.assign(renderer.domElement.style, { width: '100%', height: '100%', display: 'block' });
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0x0A0A0B, 10, 30);
  const camera = new THREE.PerspectiveCamera(35, W / H, .05, 200), scratch = camera.clone();
  const { key, envRT } = buildLighting(renderer, scene);

  const G = buildModels(mobile), MK = makeMats();
  const planeOff = new THREE.Plane(V(0, 1, 0), 1000), planeTo = new THREE.Plane(), planeFrom = new THREE.Plane();
  const CLIP_OFF = [planeOff], CLIP_TO = [planeTo], CLIP_FROM = [planeFrom]; // reused every frame (no per-frame arrays)

  /* ---- arch ---- */
  const { slots: SLOT, widths } = buildArchSlots(ORDER, pose, E);
  const slotFns = SLOT.map(sp => () => pose(sp.p.clone(), sp.q.clone(), 1));

  /* ---- service targets ---- */
  const servPos = SERV_D.map(() => V()), act = [1, 1, 1, 1, 1, 1];
  let T = 0;
  const SV = [0, 1, 2, 3, 4, 5].map(k => () => pose(servPos[k].clone().add(V(0, .05 * Math.sin(T * .6 + k), 0)), E(SERV_RX[k], SERV_RY[k] + .12 * Math.sin(T * .25 + k), 0), SERV_S[k] * act[k] * (mobile ? .7 : 1)));

  /* ---- arch teeth ---- */
  const heroFree = P => pose(V(), E(.3 * seg(P, 2.95, 3.25) - .08 * seg(P, 3.9, 4.1), .55 + .45 * (P - 1) + 1.6 * seg(P, 3, 3.62) + TAU * seg(P, 4.4, 4.52), 0), 1);
  const SHIFT = SLOT[HERO_SLOT].p.clone().negate().add(V(0, -.4, -3.5));
  const teeth = ORDER.map((k, i) => {
    const m = new THREE.Mesh(G.slotGeo(k, i), MK.ceramic()); scene.add(m);
    const st = .012 * Math.abs(i - 6.5), sl = slotFns[i], seed = i * 1.7;
    const sh = () => pose(SLOT[i].p.clone().add(SHIFT), SLOT[i].q.clone(), 1);
    const dp = () => pose(SLOT[i].p.clone().add(V(0, .2, -9)), SLOT[i].q.clone().multiply(E(Math.sin(seed), seed, 0)), 1);
    const ex = () => pose(SLOT[i].p.clone().multiplyScalar(2.6).add(V(0, .8 + Math.sin(seed) * .6, 0)), SLOT[i].q.clone().multiply(E(seed, seed * .5, 0)), .8);
    const svc = SVC_TOOTH[i];
    const keys = [[.6, sl], [1, sh], [6.95 + st, dp], [7.3 + st, sl], [7.62, sl]];
    if (svc !== undefined) keys.push([8.02, SV[svc]], [8.6, SV[svc]], [9.35, sl]);
    else keys.push([8, ex], [8.6 + st, ex], [9.35, sl]);
    m.userData = { keys, st, svc, base: m.material.color.clone() };
    return m;
  });
  const wireTooth = new THREE.Mesh(G.slotGeo(ORDER[3], 3), MK.wire()); wireTooth.scale.setScalar(1.004); teeth[3].add(wireTooth);
  const pmmaCol = new THREE.Color('#e4c9a6');

  /* ---- hero rig: crown (material variants) + root + implant, abutment, screw ---- */
  const hero = new THREE.Group(), crownG = new THREE.Group(); hero.add(crownG); scene.add(hero);
  const HM = {}, VAR = {};
  for (const k of ['ceramic', 'zirc', 'zircRaw', 'emax', 'ti', 'cocr', 'peek', 'biohpp', 'pmma', 'comp', 'resin', 'cad']) { HM[k] = MK[k](); VAR[k] = [new THREE.Mesh(G.tooth.molar, HM[k])]; }
  HM.cadDark = MK.cadDark(); HM.wire = MK.wire(); HM.points = MK.points();
  VAR.wire = [new THREE.Mesh(G.tooth.molar, HM.cadDark), new THREE.Mesh(G.tooth.molar, HM.wire)];
  VAR.points = [new THREE.Points(G.tooth.molar, HM.points)];
  const HMs = Object.values(HM), VARe = Object.entries(VAR);
  HMs.forEach(m => m.clippingPlanes = CLIP_OFF);
  Object.values(VAR).flat().forEach(m => { m.visible = false; crownG.add(m); });
  const rootMat = MK.dentin(), rootPlane = new THREE.Plane(V(0, 1, 0), 1000); rootMat.clippingPlanes = [rootPlane];
  const rootM = new THREE.Mesh(G.root, rootMat); rootM.scale.set(...G.rootScale); hero.add(rootM);
  const tiPart = MK.ti();
  const abut = new THREE.Mesh(G.abutment, tiPart), screw = new THREE.Mesh(G.screw, tiPart), fixture = new THREE.Mesh(G.fixture, tiPart);
  hero.add(abut, screw, fixture);
  const scan = new THREE.Group();
  const scanMat = new THREE.MeshBasicMaterial({ color: '#3D63FF', transparent: true, opacity: .07, side: THREE.DoubleSide, depthWrite: false });
  const scanLine = new THREE.LineBasicMaterial({ color: '#3D63FF', transparent: true, opacity: .8 });
  const pg = new THREE.PlaneGeometry(1.8, 1.8);
  scan.add(new THREE.Mesh(pg, scanMat), new THREE.LineSegments(new THREE.EdgesGeometry(pg), scanLine)); scene.add(scan);

  /* ---- bridge ---- */
  const bw = BRIDGE_SLOTS.map(i => widths[i]), bl = [];
  { let c = -(bw.reduce((a, b) => a + b, 0) + .06) / 2; bw.forEach(w => { const x = c + w / 2; bl.push(pose(V(x, 0, -.08 * x * x))); c += w + .02; }); }
  const BF = P => pose(V(), E(-2.3 * seg(P, 6.28, 6.52), -.35 + .7 * seg(P, 6, 6.62), 0), 1);
  const mkMember = j => {
    const c = CONSTP[j];
    const cons = P => pose(V(c[0], c[1], c[2]), E(c[3], c[4] + (P - 5) * .8, c[5]), 1);
    const dep = P => { const q = cons(P); q.p.add(V(0, 1, -10)); return q; };
    const br = P => compose(BF(P), bl[j]), sv = () => compose(SV[2](), bl[j]), sl = slotFns[BRIDGE_SLOTS[j]];
    const tail = [[5, cons], [5.6, cons], [6.25, br], [6.6, br], [7.3, sl], [7.62, sl], [8.02, sv], [8.6, sv], [9.4, sl]];
    return j === 3 ? [[.6, sl], [1, heroFree], [4.6, heroFree], ...tail] : [[4.45, dep], ...tail];
  };
  const heroKeys = mkMember(3);
  const clones = [0, 1, 2].map(j => { const m = new THREE.Mesh(G.slotGeo(ORDER[BRIDGE_SLOTS[j]], BRIDGE_SLOTS[j]), MK.ceramic()); m.userData.keys = mkMember(j); scene.add(m); return m; });
  const connMat = MK.ceramic();
  const conns = [0, 1, 2].map(() => { const m = new THREE.Mesh(G.connector, connMat); scene.add(m); return m; });

  /* ---- Toronto / full-arch ---- */
  const gMat = MK.gingiva(), barMat = MK.ti(), barPlane = new THREE.Plane(V(-1, 0, 0), -9); barMat.clippingPlanes = [barPlane];
  const implMat = MK.ti();
  const { group: toronto, bar, implants } = buildToronto({ slots: SLOT, G, mats: { gingiva: gMat, bar: barMat, impl: implMat }, lo: mobile, implSlots: IMPL_SLOTS });
  scene.add(toronto);
  const s1Mat = MK.ti(), s1 = new THREE.Mesh(G.fixtureTop, s1Mat); scene.add(s1);
  implants[2].visible = false;
  const s1Home = () => pose(implants[2].position.clone(), new THREE.Quaternion(), .8);
  const s1Keys = [[7.62, s1Home], [8.02, SV[1]], [8.6, SV[1]], [9.3, s1Home]];

  /* ---- denture segment (service) ---- */
  const dG = MK.gingiva(), dT = MK.ceramic();
  const dent = buildDenture({ G, mats: { gingiva: dG, teeth: dT } }); scene.add(dent);
  const dStart = () => pose(SLOT[4].p.clone().add(V(0, -.4, 0)), E(0, .6, 0), .2), dEnd = () => pose(V(), new THREE.Quaternion(), .2);
  const dKeys = [[7.7, dStart], [8.05, SV[3]], [8.6, SV[3]], [9.25, dEnd]];

  /* ---- camera ---- */
  let KK = cameraKeys(mobile);
  const camState = P => camAt(P, KK);
  const applyCam = (c, s) => applyCamRaw(c, s, W, H);
  function computeServ() {
    const cs = camState(8.3); applyCam(scratch, cs);
    const tg = V(cs.tx, cs.ty, cs.tz), n = V().subVectors(scratch.position, tg).normalize();
    const pl = new THREE.Plane().setFromNormalAndCoplanarPoint(n, tg), rc = new THREE.Raycaster();
    (mobile ? SERV_M : SERV_D).forEach(([x, y], k) => { rc.setFromCamera(new THREE.Vector2(x, y), scratch); rc.ray.intersectPlane(pl, servPos[k]); });
  }
  computeServ();

  /* ---- DOM hooks ---- */
  const $ = s => [...root.querySelectorAll(s)], q1 = s => root.querySelector(s);
  const fades = $('[data-fade]'), secs = $('[data-sec]');
  const lbl = Object.fromEntries($('[data-lbl]').map(e => [e.dataset.lbl, e]));
  const hots = $('[data-hot]'), foot = q1('[data-foot-label]'), footBar = q1('[data-foot-bar]');
  const nav = q1('[data-nav]'), loader = q1('[data-loader]');
  const impItems = $('[data-impitem]'), wsteps = $('[data-wstep]'), wbars = $('[data-wbar]');
  const bitems = $('[data-bitem]'), titems = $('[data-titem]'), mkEls = $('[data-mk]');
  const matLabel = q1('[data-matlabel]'), clipLabel = q1('[data-clip]'), explodeLabel = q1('[data-explode]'), explodeBar = q1('[data-explodebar]');
  const last = new WeakMap();
  const setO = (el, v) => { if (!el) return; const p = last.get(el); if (p === undefined || Math.abs(p - v) > .004) { last.set(el, v); el.style.opacity = v.toFixed(3); } };
  const setT = (el, v) => { if (el && el.textContent !== v) el.textContent = v; };
  // List stepper: the shown index walks one item at a time towards the index computed from P, and every item
  // stays lit >= DWELL ms before the next one. An item already shown that long changes at once, so a normal
  // 1-step change is immediate; a fast scroll (whose damped target moves one item per frame) is spaced out.
  // It jumps straight to the target while its section is not visible, with reduced motion, and on the first frame.
  // Plain numbers and timestamps only: nothing is allocated per frame.
  const DWELL = 180;
  const mkStep = () => ({ shown: -1, target: -1, t: 0 });
  const stMat = mkStep(), stW = mkStep(), stImp = mkStep(), stB = mkStep(), stT = mkStep(), stC = mkStep();
  // Scene 06 competences: the hold P 5.02–5.58 is split into 6 equal parts, one item each (6.1 → 6.6).
  const COMP_A = 5.02, COMP_STEP = (5.58 - COMP_A) / 6;
  let compShown = -1;
  function stepTo(s, target, now, live) {
    s.target = target;
    if (reduced || !live || s.shown < 0) { if (s.shown !== target) { s.shown = target; s.t = now; } return target; }
    if (s.shown !== target && now - s.t >= DWELL) { s.shown += target > s.shown ? 1 : -1; s.t = now; }
    return s.shown;
  }
  // Same window as the data-fade opacity of section i (visible between i - .3 and i + .86).
  const secLive = (i, P) => P > i - .3 && P < i + .86;
  let tops = [], hts = [];
  const measure = () => { tops = secs.map(s => s.getBoundingClientRect().top + scrollY); hts = secs.map(s => s.offsetHeight); };
  measure();
  function mapScroll(y) {
    // Sticky frames are 100 --vh tall (not the live innerHeight, which moves with the mobile toolbar)
    const vh = (sectionVH && sectionVH()) || H, n = secs.length;
    for (let i = 0; i < n - 1; i++) {
      const t = tops[i], h = hts[i];
      if (y < t + h - vh) return i + .6 * clamp((y - t) / Math.max(1, h - vh));
      if (y < t + h) return i + .6 + .4 * clamp((y - (t + h - vh)) / vh);
    }
    return n - 1;
  }

  /* ---- scroll → progress (ScrollTrigger + damped scrub) ---- */
  const proxy = { p: mapScroll(scrollY) }; let target = proxy.p;
  const retarget = () => { target = mapScroll(scrollY); if (!reduced) gsap.to(proxy, { p: target, duration: 1, ease: 'power2.out', overwrite: true }); };
  // ScrollTrigger.refresh() (every resize) briefly scrolls to 0 to measure: ignore those updates and re-sync once it is done.
  // Progress is driven by the native scroll event, not ScrollTrigger.onUpdate: on touch devices ScrollTrigger ignores
  // toolbar resizes, so its cached end ('max') could stay shorter than the real page and onUpdate stopped firing
  // before the last scenes (iOS: stuck around scene 09/10). The trigger is kept only for refresh handling.
  const st = ScrollTrigger.create({ start: 0, end: 'max' });
  const onRefresh = () => { measure(); retarget(); if (reduced) proxy.p = target; };
  ScrollTrigger.addEventListener('refresh', onRefresh);
  // Mobile: the closing arch sits in the contacts' top spacer, but that section is taller than the viewport,
  // so past its top the fixed stage scrolls with the page instead of covering the address and form.
  const follow = () => { const over = mobile ? Math.max(0, Math.round(scrollY - tops[tops.length - 1])) : 0, tf = over ? `translate3d(0,${-over}px,0)` : ''; if (host.style.transform !== tf) host.style.transform = tf; };
  const onScroll = () => { measure(); if (!ScrollTrigger.isRefreshing) retarget(); follow(); if (reduced) proxy.p = target; if (nav) { const on = scrollY > 40; nav.style.background = on ? 'rgba(22,22,26,.82)' : 'transparent'; nav.style.borderBottomColor = on ? 'rgba(236,230,220,.08)' : 'transparent'; nav.style.backdropFilter = on ? 'blur(12px)' : 'none'; } };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  let mx = 0, my = 0, tmx = 0, tmy = 0;
  const onMouse = e => { tmx = e.clientX / innerWidth * 2 - 1; tmy = e.clientY / innerHeight * 2 - 1; };
  if (!reduced && !mobile) addEventListener('pointermove', onMouse, { passive: true });
  const onResize = () => {
    [W, H] = VP(); mobile = W < 760; renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 1.75)); KK = cameraKeys(mobile); measure(); computeServ(); target = mapScroll(scrollY); follow();
    if (reduced) proxy.p = target;
  };
  addEventListener('resize', onResize);
  const ro = new ResizeObserver(() => { measure(); target = mapScroll(scrollY); }); ro.observe(root);

  let redIdx = -1, redP = HOLD[0], redTimer = 0;
  host.style.transition = 'opacity .35s ease';
  const t0 = performance.now(); let raf = 0, first = true, loaderTimer = 0;
  const tmpV = V(), camRight = V(), tmpA = V(), hotOff = HOT_OFF.map(o => V(...o)), up = V();
  const proj = v => { tmpV.copy(v).project(camera); return [(tmpV.x * .5 + .5) * W, (-tmpV.y * .5 + .5) * H]; };
  const placeLbl = (el, wp, o, left) => {
    if (!el) return; setO(el, o); if (o < .01) return;
    const [x, y] = proj(wp); el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(${left ? '-100%' : '-3px'},-50%)`;
  };
  const wp = V(), wpos = (o, off) => o.localToWorld(wp.copy(off)); // scratch: each result is consumed by placeLbl before the next call
  const LB = { h1: V(0, 1.05, .1), h2: V(0, .45, .45), i0: V(0, .3, 0), i1: V(0, .05, 0), i2: V(0, -.4, 0), i3: V(0, -1.3, 0), c0: V(0, .78, 0),
    t0: V(SLOT[2].p.x * .95, 0, SLOT[2].p.z * .95), t1: V(SLOT[10].p.x * 1.1, .05, SLOT[10].p.z * 1.1), crown: V(0, .21, 0) };
  const AX = { x: V(1, 0, 0), y: V(0, 1, 0) }, AXn = { x: V(-1, 0, 0), y: V(0, -1, 0) };

  function frame(now) {
    raf = requestAnimationFrame(frame);
    T = now / 1000;
    const I = reduced ? 1 : ease(clamp((now - t0) / 3200));
    let P = debug && window.__alP != null ? window.__alP : proxy.p;
    if (reduced && !(debug && window.__alP != null)) {
      const idx = Math.min(10, Math.floor(target + .2));
      if (idx !== redIdx) {
        if (redIdx < 0) { redIdx = idx; redP = HOLD[idx]; }
        else { redIdx = idx; host.style.opacity = 0; clearTimeout(redTimer); redTimer = setTimeout(() => { redP = HOLD[idx]; host.style.opacity = 1; }, 350); }
      }
      P = redP;
    }
    mx += (tmx - mx) * .04; my += (tmy - my) * .04;

    const cs = camState(P);
    cs.r *= lerp(.42, 1, I); cs.el += lerp(-.35, 0, I);
    if (!reduced) { cs.az += mx * .04 + .015 * Math.sin(T * .22); cs.el += my * .02; }
    applyCam(camera, cs);
    scene.fog.near = cs.r * .8; scene.fog.far = cs.r * 2.4;
    const dark = win(P, 6.62, 6.88, 6.95, 7.3);
    renderer.toneMappingExposure = 1.05 * Math.pow(I, .8) * (1 - .82 * dark) * (1 + .22 * seg(P, 9, 9.5));
    key.position.set(-4 + mx * 1.5, 6 - my, 5);
    camRight.setFromMatrixColumn(camera.matrixWorld, 0);

    const inServ = P > 7.7 && P < 8.9;
    for (let k = 0; k < 6; k++) act[k] += ((inServ ? (k === active ? 1.18 : .9) : 1) - act[k]) * .08;

    for (let i = 0; i < teeth.length; i++) {
      const m = teeth[i];
      if (i === HERO_SLOT) { m.visible = false; continue; }
      const ud = m.userData, early = P < .6 ? 1 : P < 1 ? 1 - .85 * seg(P, .6, 1) : .15 * (1 - seg(P, 1, 1.5));
      let op;
      if (i >= 9 && i <= 11) op = P < 1.6 ? early : 0;
      else if (P < 1.6) op = early;
      else if (P < 7.6) op = seg(P, 6.95 + ud.st, 7.15 + ud.st);
      else if (ud.svc !== undefined) op = 1;
      else if (P < 8.6) op = 1 - seg(P, 7.62, 7.95);
      else op = seg(P, 8.6 + ud.st, 8.85 + ud.st);
      m.visible = op > .003; if (!m.visible) continue;
      m.material.opacity = op; setPose(m, track(P, ud.keys));
    }
    const pm1 = win(P, 7.7, 8.0, 8.7, 9.2); teeth[1].material.color.copy(teeth[1].userData.base).lerp(pmmaCol, pm1);
    const wf = win(P, 7.7, 8.0, 8.7, 9.2); wireTooth.material.opacity = .7 * wf; wireTooth.visible = wf > .01; if (teeth[3].visible) teeth[3].material.opacity *= 1 - .88 * wf;

    setPose(hero, track(P, heroKeys));
    const e = win(P, 2, 2.45, 2.62, 2.95); crownG.position.y = 1.4 * e;
    abut.position.y = -.22 + .62 * e; screw.position.y = -.35 - .15 * e; fixture.position.y = -1.1 * e;
    hero.updateMatrixWorld(true);
    const rs = win(P, .62, 1, 1.6, 1.95); rootM.visible = P > .6 && P < 2;
    rootPlane.constant = -(hero.position.y + lerp(.05, -1.65, rs)); rootMat.opacity = clamp(rs * 3);
    const ip = win(P, 1.62, 1.95, 2.85, 3.02); tiPart.opacity = ip; abut.visible = screw.visible = fixture.visible = ip > .002;

    let ci = 0; for (let s = 1; s < STAGES.length; s++) if (P >= STAGES[s].a) ci = s;
    const S = STAGES[ci]; let fromK = null, f = 1;
    if (ci > 0 && P < S.b) { fromK = STAGES[ci - 1].k; f = clamp((P - S.a) / (S.b - S.a)); }
    for (const [k, ms] of VARe) for (const m of ms) m.visible = k === S.k || k === fromK;
    for (const m of HMs) m.clippingPlanes = CLIP_OFF;
    if (fromK && fromK !== S.k) {
      const ax = AX[S.ax], c = crownG.localToWorld(tmpA.copy(LB.crown)), R = .72, cut = ax.dot(c) + lerp(-R, R, f);
      planeTo.set(AXn[S.ax], cut); planeFrom.set(ax, -cut);
      for (const m of VAR[S.k]) m.material.clippingPlanes = CLIP_TO; for (const m of VAR[fromK]) m.material.clippingPlanes = CLIP_FROM;
      scan.visible = true; scan.position.copy(c).addScaledVector(ax, lerp(-R, R, f)); scan.rotation.set(S.ax === 'y' ? -Math.PI / 2 : 0, S.ax === 'x' ? Math.PI / 2 : 0, 0);
      scanMat.opacity = .08 * Math.sin(Math.PI * f); scanLine.opacity = .85 * Math.sin(Math.PI * f);
    } else scan.visible = false;
    const shownK = fromK && f < .5 ? fromK : S.k;

    const cop = seg(P, 4.45, 4.75);
    for (const m of clones) { m.visible = cop > .002; if (m.visible) { m.material.opacity = cop; setPose(m, track(P, m.userData.keys)); } }
    const co = seg(P, 6.12, 6.3) * (1 - seg(P, 9.15, 9.4));
    connMat.opacity = co;
    for (let k = 0; k < 3; k++) {
      const c = conns[k]; c.visible = co > .003; if (!c.visible) continue;
      const a = k < 2 ? clones[k] : clones[2], b = k < 2 ? clones[k + 1] : hero;
      up.set(0, 1, 0).applyQuaternion(a.quaternion);
      c.position.copy(a.position).lerp(b.position, .5).addScaledVector(up, .12 * a.scale.x); c.quaternion.copy(a.quaternion);
      c.scale.set(a.position.distanceTo(b.position) * .55, a.scale.x, a.scale.x);
    }

    toronto.visible = P > 6.9 && P < 8.2;
    barPlane.constant = lerp(-3.6, 3.6, seg(P, 6.95, 7.22));
    const tf = 1 - seg(P, 7.62, 7.9); barMat.opacity = tf; implMat.opacity = tf;
    const gy = Math.max(.001, seg(P, 7.02, 7.25)); for (const m of implants) m.scale.set(.8, .8 * gy, .8);
    gMat.opacity = win(P, 7.28, 7.45, 7.62, 7.85);
    s1.visible = P > 7.0 && P < 9.4; if (s1.visible) { setPose(s1, track(P, s1Keys)); if (P < 7.62) s1.scale.y *= gy; s1Mat.opacity = 1 - seg(P, 9.1, 9.35); }
    const dop = win(P, 7.7, 7.95, 8.95, 9.25); dent.visible = dop > .003; if (dent.visible) { setPose(dent, track(P, dKeys)); dG.opacity = dT.opacity = dop; }

    renderer.render(scene, camera);

    /* ---- DOM ---- */
    for (const el of fades) {
      const i = +el.dataset.fade; let o = i === 0 ? 1 : i === 10 ? seg(P, 9.84, 10) : seg(P, i - .3, i + .02);
      if (i < 10) o = Math.min(o, 1 - seg(P, i + .62, i + .86));
      if (i === 0) o *= clamp((I - .3) / .6);
      if (reduced) o = 1;
      setO(el, o); const pe = o > .3 ? 'auto' : 'none'; if (el.style.pointerEvents !== pe) el.style.pointerEvents = pe;
    }
    const si = Math.min(10, Math.floor(P + .2));
    setT(foot, `${String(si + 1).padStart(2, '0')} / 11 — ${FOOT[si]}`); if (footBar) footBar.style.width = (P / 10 * 100).toFixed(2) + '%';
    const ho = mobile ? 0 : win(P, -1, 0, .4, .6) * clamp((I - .6) / .4);
    placeLbl(lbl.h1, wpos(teeth[7], LB.h1), ho); placeLbl(lbl.h2, wpos(teeth[3], LB.h2), ho);
    const io = win(P, 2.08, 2.2, 2.52, 2.64);
    placeLbl(lbl.i0, wpos(crownG, LB.i0).addScaledVector(camRight, .62), io);
    placeLbl(lbl.i1, wpos(abut, LB.i1).addScaledVector(camRight, .36), io);
    placeLbl(lbl.i2, wpos(screw, LB.i2).addScaledVector(camRight, .14), io);
    placeLbl(lbl.i3, wpos(fixture, LB.i3).addScaledVector(camRight, .3), io);
    const to = mobile ? 0 : win(P, 7.3, 7.42, 7.52, 7.62);
    placeLbl(lbl.t0, wpos(bar, LB.t0), to, true);
    placeLbl(lbl.t1, wpos(toronto, LB.t1), to);
    placeLbl(lbl.c0, wpos(crownG, LB.c0).addScaledVector(camRight, .15), win(P, 4.4, 4.44, 4.56, 4.6));
    // Scroll-highlighted lists go through a stepper, so a fast scroll never skips an item.
    if (P > 2.8 && P < 4.9) {
      const mi = stepTo(stMat, fromK && f < .5 ? ci - 1 : ci, now, secLive(3, P)), mk = STAGES[mi].k, catching = mi !== stMat.target;
      for (const el of mkEls) setO(el, el.dataset.mk === mk ? 1 : .18);
      setT(matLabel, `3D · CORONA — ${MAT_LABEL[mk]}`);
      setT(clipLabel, fromK && !catching ? `CLIPPING PLANE ${S.ax.toUpperCase()} = ${Math.round(f * 100)}%` : `STATO · ${MAT_LABEL[mk]}`);
      const w = stepTo(stW, clamp(Math.floor((P - 4) / .1), 0, 5), now, secLive(4, P));
      for (let k = 0; k < wsteps.length; k++) setO(wsteps[k], k === w ? 1 : 0);
      for (let k = 0; k < wbars.length; k++) { const el = wbars[k]; setO(el, k === w ? 1 : k < w ? .6 : .3); const bc = k === w ? '#3D63FF' : 'rgba(236,230,220,.5)'; if (el.style.borderTopColor !== bc) el.style.borderTopColor = bc; }
    }
    if (P > 1.5 && P < 3.2) {
      // cumulative: item k is lit once P >= 2 + .055k → step over the number of lit items
      const lit = stepTo(stImp, P < 2 ? 0 : Math.min(impItems.length, Math.floor((P - 2) / .055) + 1), now, secLive(2, P));
      for (let k = 0; k < impItems.length; k++) setO(impItems[k], k < lit ? 1 : .14);
      setT(explodeLabel, `ESPLOSO · ${Math.round(e * 100)}%`); if (explodeBar) explodeBar.style.height = (e * 100).toFixed(1) + '%';
    }
    if (P > 5.5 && P < 7.9) {
      const b = stepTo(stB, P < 6.25 ? 0 : P < 6.4 ? 1 : P < 6.5 ? 2 : P < 6.6 ? 3 : 4, now, secLive(6, P));
      for (let k = 0; k < bitems.length; k++) setO(bitems[k], k === b ? 1 : .3);
      const t = stepTo(stT, clamp(Math.floor((P - 7) / .1), 0, 5), now, secLive(7, P));
      for (let k = 0; k < titems.length; k++) setO(titems[k], k === t ? 1 : .3);
    }
    // Reduced motion: no automatic sequence, the items stay click-driven (starting from 6.1).
    if (onComp && !reduced) {
      const c = stepTo(stC, clamp(Math.floor((P - COMP_A) / COMP_STEP), 0, 5), now, secLive(5, P));
      if (c !== compShown) { compShown = c; onComp(c); }
    }
    const hv = win(P, 7.95, 8.05, 8.55, 8.68);
    hots.forEach((el, k) => {
      setO(el, hv); const pe = hv > .5 ? 'auto' : 'none'; if (el.style.pointerEvents !== pe) { el.style.pointerEvents = pe; el.tabIndex = hv > .5 ? 0 : -1; }
      if (hv > .01) { const [x, y] = proj(tmpA.copy(servPos[k]).add(hotOff[k])); el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%)`; }
    });
    if (first) { first = false; if (loader) { loader.style.display = ''; loader.style.opacity = 0; loader.style.pointerEvents = 'none'; loaderTimer = setTimeout(() => loader.style.display = 'none', 1300); } }
  }
  raf = requestAnimationFrame(frame);

  return {
    reduced,
    setActive(k) { active = k; },
    // Smooth-scroll to the middle of competence k's slot in the scene-06 hold (inverse of mapScroll for section 5).
    scrollToComp(k) {
      measure();
      const vh = (sectionVH && sectionVH()) || H, Pk = COMP_A + (k + .5) * COMP_STEP;
      scrollTo({ top: Math.round(tops[5] + (Pk - 5) / .6 * Math.max(1, hts[5] - vh)), behavior: 'smooth' });
    },
    progress: () => proxy.p,
    destroy() {
      cancelAnimationFrame(raf); clearTimeout(redTimer); clearTimeout(loaderTimer);
      gsap.killTweensOf(proxy); st.kill(); ro.disconnect(); ScrollTrigger.removeEventListener('refresh', onRefresh);
      removeEventListener('scroll', onScroll); removeEventListener('pointermove', onMouse); removeEventListener('resize', onResize);
      const geos = new Set(), mats = new Set();
      scene.traverse(o => { if (o.geometry) geos.add(o.geometry); [].concat(o.material || []).forEach(m => mats.add(m)); });
      [G.tooth, G.toothL].forEach(o => Object.values(o).forEach(g => geos.add(g))); Object.values(G).forEach(g => g?.isBufferGeometry && geos.add(g));
      geos.forEach(g => g.dispose()); mats.forEach(m => m.dispose());
      envRT.dispose(); scene.environment = null;
      renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
      host.style.opacity = ''; host.style.transform = '';
    },
  };
}
