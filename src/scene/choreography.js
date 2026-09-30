// Scene timeline constants. Progress P runs 0..10 (one unit per scene).
export const ORDER = ['molar2', 'molar', 'pm2', 'pm', 'canine', 'lateral', 'incisor', 'incisor', 'lateral', 'canine', 'pm', 'pm2', 'molar', 'molar2'];
export const BRIDGE_SLOTS = [9, 10, 11, 12];
export const HERO_SLOT = 12;
export const SVC_TOOTH = { 6: 0, 1: 4, 3: 5 };        // arch tooth index -> service slot
export const IMPL_SLOTS = [1, 3, 5, 8, 10, 12];        // Toronto implant positions

// Service object screen targets (NDC) for desktop / mobile, their rotations, scales and hotspot offsets
export const SERV_D = [[-.62, .3], [.6, .46], [.66, -.28], [.34, -.62], [-.56, -.42], [-.3, -.72]];
export const SERV_M = [[-.6, .6], [0, .6], [.6, .6], [-.6, .33], [0, .33], [.6, .33]];
export const SERV_RY = [.4, 0, -.25, .3, .6, .2];
export const SERV_RX = [.25, .15, .45, .35, .3, .3];
export const SERV_S = [1.35, 1.0, .6, 1.0, 1.35, 1.35];
export const HOT_OFF = [[0, .65, 0], [0, -.75, 0], [0, .2, 0], [0, .05, 0], [0, .45, 0], [0, .5, 0]];

// Bridge members' floating "constellation" positions (scene 06)
export const CONSTP = [[-1.55, .55, -.5, .4, 1.2, -.2], [1.55, .7, -.9, -.3, .4, .3], [-.6, -.75, -1.3, .6, 2, .1], [.35, .05, .6, .15, .6, .05]];

// Reduced-motion: one static state per scene
export const HOLD = [.3, 1.4, 2.5, 3.2, 4.25, 5.3, 6.45, 7.5, 8.3, 9.55, 10];

// Crown material sweep (clipping-plane transitions)
// Scene 04 list: 10 materials in list order, step .058, transition .048, all within the sticky hold (P 3.0-3.6).
export const STAGES = [
  { k: 'ceramic', a: -9, b: -9 },
  { k: 'zirc', a: 3.03, b: 3.078, ax: 'x' }, { k: 'emax', a: 3.088, b: 3.136, ax: 'x' }, { k: 'ti', a: 3.146, b: 3.194, ax: 'x' },
  { k: 'cocr', a: 3.204, b: 3.252, ax: 'x' }, { k: 'peek', a: 3.262, b: 3.31, ax: 'x' }, { k: 'biohpp', a: 3.32, b: 3.368, ax: 'x' },
  { k: 'pmma', a: 3.378, b: 3.426, ax: 'x' }, { k: 'comp', a: 3.436, b: 3.484, ax: 'x' }, { k: 'resin', a: 3.494, b: 3.542, ax: 'x' },
  { k: 'ceramic', a: 3.552, b: 3.6, ax: 'x' },
  { k: 'points', a: 4.02, b: 4.1, ax: 'y' }, { k: 'wire', a: 4.12, b: 4.2, ax: 'y' },
  { k: 'zircRaw', a: 4.22, b: 4.3, ax: 'y' }, { k: 'ceramic', a: 4.32, b: 4.4, ax: 'y' },
];
export const MAT_LABEL = { ceramic: 'CERAMICA', zirc: 'ZIRCONIA', emax: 'DISILICATO DI LITIO', ti: 'TITANIO', cocr: 'COCR', peek: 'PEEK', biohpp: 'BIOHPP', pmma: 'PMMA', comp: 'COMPOSITO', resin: 'RESINA', points: 'NUVOLA DI PUNTI', wire: 'WIREFRAME CAD', zircRaw: 'ZIRCONIA GREZZA' };
export const FOOT = ['ARCATA', 'DENTE', 'IMPIANTO ESPLOSO', 'CORONA · MATERIALI', 'CORONA · PROCESSO', 'ELEMENTI MULTIPLI', 'PONTE', 'STRUTTURA COMPLETA', 'ELEMENTI SCOMPOSTI', 'RIASSEMBLAGGIO', 'ARCATA'];
