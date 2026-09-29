import { createExperience } from './scene/experience.js';
import { renderApp } from './ui/template.js';
import { bindInteractions } from './ui/interactions.js';

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

// CSS viewport units used by the layout (stable on mobile browsers with dynamic toolbars)
function setViewportVars() {
  const [w, h] = (DEBUG && window.__alVP) ? window.__alVP : [document.documentElement.clientWidth / zoom(), innerHeight / zoom()];
  app.style.setProperty('--vh', h / 100 + 'px');
  app.style.setProperty('--vw', w / 100 + 'px');
}

const state = { comp: 0, node: 1, req: 0, mobile: isMobile() };
let exp = null, token = 0;

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
    exp = createExperience({ host: stage, root: app, reduced: isReduced(), active: state.node, viewport, debug: DEBUG });
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
