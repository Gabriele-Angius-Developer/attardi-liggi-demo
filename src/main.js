import { createExperience } from './scene/experience.js';
import { renderApp } from './ui/template.js';
import { bindInteractions } from './ui/interactions.js';
import { applyComp } from './ui/comp.js';

const BREAKPOINT = 760;
const params = new URLSearchParams(location.search);
// ?debug enables QA hooks only (window.__alP pins progress, window.__alVP fakes a viewport).
const DEBUG = params.has('debug');
const reducedMQ = matchMedia('(prefers-reduced-motion: reduce)');
const isReduced = () => reducedMQ.matches || params.has('reduced') || (DEBUG && !!window.__alReduced);

const app = document.getElementById('app');
const content = document.getElementById('content');
const stage = document.getElementById('stage');

const zoom = () => (DEBUG ? parseFloat(document.documentElement.style.zoom) || 1 : 1);
const viewport = () => (DEBUG && window.__alVP) ? window.__alVP : [innerWidth / zoom(), innerHeight / zoom()];
const isMobile = () => viewport()[0] < BREAKPOINT;

// CSS viewport units used by the layout.
// Touch browsers (iOS Safari) fire resize while the toolbar shows/hides; re-deriving --vh from that height
// changed every section's height mid-scroll, so the same scrollY mapped back to an earlier scene and the end
// of the page (scene 11) kept slipping away. On touch devices --vh only follows width/orientation changes and
// uses the largest height seen at that width (= 100lvh, toolbar hidden). Desktop keeps tracking real resizes.
const coarse = matchMedia('(pointer: coarse)');
const lvhProbe = document.createElement('div');
lvhProbe.setAttribute('aria-hidden', 'true');
lvhProbe.style.cssText = 'position:fixed;left:0;top:0;width:0;height:100vh;height:100lvh;visibility:hidden;pointer-events:none';
document.body.appendChild(lvhProbe);
let vpW = -1, vpH = 0;
function setViewportVars() {
  const [w, h] = (DEBUG && window.__alVP) ? window.__alVP : [document.documentElement.clientWidth / zoom(), innerHeight / zoom()];
  const stable = coarse.matches && !(DEBUG && window.__alVP);
  if (!stable || w !== vpW) { vpW = w; vpH = 0; }
  vpH = stable ? Math.max(vpH, h, lvhProbe.offsetHeight / zoom()) : h;
  app.style.setProperty('--vh', vpH / 100 + 'px');
  app.style.setProperty('--vw', w / 100 + 'px');
}
// Height of one 100 --vh unit in px: the sticky frames' height, used by the scene to map scroll → progress.
const sectionVH = () => vpH;

const state = { comp: 0, node: 1, req: 0, mobile: isMobile() };
let exp = null, token = 0;
// Scene 06: the scroll stepper drives the active competence (see experience.js)
const onComp = k => { state.comp = k; applyComp(app, k); };

function fallbackStatic() {
  const l = app.querySelector('[data-loader]'); if (l) l.style.display = 'none';
  app.querySelectorAll('[data-fade]').forEach(el => { el.style.opacity = 1; el.style.pointerEvents = 'auto'; });
}

function boot() {
  const my = ++token;
  if (exp) { exp.destroy(); exp = null; }
  content.innerHTML = renderApp(state);
  setViewportVars();
  try {
    exp = createExperience({ host: stage, root: app, reduced: isReduced(), active: state.node, viewport, sectionVH, onComp, debug: DEBUG });
    if (my !== token) { exp.destroy(); exp = null; }
  } catch (err) {
    console.error('3D scene failed to start', err);
    fallbackStatic();
  }
}

let rebootTimer = 0;
function onResize() {
  setViewportVars();
  const m = isMobile();
  if (m !== state.mobile) {
    state.mobile = m;
    clearTimeout(rebootTimer);
    rebootTimer = setTimeout(boot, 120);
  }
}

// Keep the scroll position meaningful when the layout variant is rebuilt
addEventListener('resize', onResize);
reducedMQ.addEventListener?.('change', () => boot());
bindInteractions({ app, state, getExperience: () => exp });

if (document.fonts?.ready) document.fonts.ready.then(() => { if (exp) dispatchEvent(new Event('resize')); });
boot();

if (DEBUG) window.__al = { boot, state, get exp() { return exp; } };
