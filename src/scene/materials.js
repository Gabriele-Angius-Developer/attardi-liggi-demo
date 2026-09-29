import * as THREE from 'three';

// Material factories: each call returns a new instance (opacity is animated per object).
export function makeMats() {
  const phys = o => new THREE.MeshPhysicalMaterial(o), std = o => new THREE.MeshStandardMaterial(o);
  return {
    ceramic: () => phys({ color: '#ede4d6', roughness: .3, clearcoat: .55, clearcoatRoughness: .22, sheen: .45, sheenColor: '#fff1dd', sheenRoughness: .45, transparent: true }),
    zirc: () => phys({ color: '#f2ede4', roughness: .4, clearcoat: .2, transparent: true }),
    zircRaw: () => std({ color: '#e6e1d8', roughness: .96, transparent: true }),
    emax: () => phys({ color: '#eadbc3', roughness: .14, clearcoat: 1, clearcoatRoughness: .06, sheen: .7, sheenColor: '#ffe6c4', transparent: true }),
    ti: () => std({ color: '#a7a8ad', metalness: 1, roughness: .28, transparent: true }),
    pmma: () => phys({ color: '#e4c9a6', roughness: .36, clearcoat: .7, transparent: true }),
    cad: () => std({ color: '#6e6b66', roughness: .7, flatShading: true, transparent: true }),
    cadDark: () => std({ color: '#141417', roughness: .9, transparent: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
    wire: () => new THREE.MeshBasicMaterial({ color: '#7f9bff', wireframe: true, transparent: true, opacity: .6 }),
    points: () => new THREE.PointsMaterial({ color: '#ECE6DC', size: .02, transparent: true, opacity: .9 }),
    dentin: () => phys({ color: '#d6c5a8', roughness: .55, clearcoat: .1, transparent: true }),
    gingiva: () => phys({ color: '#86595a', roughness: .42, clearcoat: .6, clearcoatRoughness: .3, sheen: .6, sheenColor: '#d49a94', transparent: true }),
  };
}

// Studio environment (softboxes) baked to PMREM + key / rim / fill lights.
export function buildLighting(renderer, scene) {
  const env = new THREE.Scene(); env.background = new THREE.Color(0x030303);
  const box = (w, h, p, c, k) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(...p); m.lookAt(0, 0, 0); env.add(m); };
  box(9, 4, [0, 7, 2], '#fff6ea', 2.6); box(1.4, 9, [-7, 1, 3], '#fff0dc', 2.2); box(1.2, 9, [7, 1, -3], '#c7d4ff', 1.8); box(12, 2, [0, -6, 0], '#ffffff', .12);
  const pmg = new THREE.PMREMGenerator(renderer); const envRT = pmg.fromScene(env, .04); scene.environment = envRT.texture; pmg.dispose();
  env.traverse(o => { o.geometry?.dispose(); o.material?.dispose(); });
  const key = new THREE.DirectionalLight('#fff0dc', 2.2); key.position.set(-4, 6, 5);
  const rim = new THREE.DirectionalLight('#b9ccff', 2.4); rim.position.set(5, 3, -6);
  const fill = new THREE.HemisphereLight('#e8e2d8', '#0a0a0b', .18);
  scene.add(key, rim, fill);
  return { key, envRT };
}
