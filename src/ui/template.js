// Markup for the overlay. Inline styles are carried over 1:1 from the approved prototype.
// Two variants (desktop / mobile) are rendered by JS because the 3D scene reads index-ordered hooks.
import { COMPS, NODE_MAP, STEPS, PILLARS, IMPLANT_LABELS, IMPLANT_SERVICES, MATERIALS, BRIDGE_ITEMS, COMPLEX_ITEMS, FIELDS, REQ_TYPES, CONTACT } from './data.js';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pad = n => String(n).padStart(2, '0');
const W = '#ECE6DC', B = '#3D63FF';
const VW = n => `calc(var(--vw, 1vw) * ${n})`, VH = n => `calc(var(--vh, 1vh) * ${n})`;
const PADX = `clamp(20px,${VW(4)},56px)`;
const CHIP = 'background:rgba(10,10,11,.88);padding:4px 7px;border-radius:2px;';
const HEAD = "padding-bottom:12px;border-bottom:1px solid rgba(236,230,220,.2);font:400 11px 'Geist Mono';letter-spacing:.14em;color:#8E887F";
const RULER = 'height:9px;border-top:1px solid rgba(236,230,220,.6);background:repeating-linear-gradient(90deg,rgba(236,230,220,.45) 0 1px,transparent 1px 28px)';
const DOT = '<div style="width:5px;height:5px;border-radius:50%;background:#3D63FF"></div>';
const line = (w, a = .6) => `<div style="width:${w}px;height:1px;background:rgba(61,99,255,${a})"></div>`;
const monoLbl = t => `<div style="${CHIP}font:400 11px 'Geist Mono';color:#8E887F;letter-spacing:.08em;white-space:nowrap">${t}</div>`;
const lblBox = (id, inner) => `<div data-lbl="${id}" style="position:fixed;left:0;top:0;opacity:0;display:flex;align-items:center;gap:10px">${inner}</div>`;
const sticky = (pad, extra) => `position:sticky;top:0;height:${VH(100)};box-sizing:border-box;padding:${pad} ${PADX} 80px;${extra};pointer-events:none;overflow:hidden`;

/* ---------- dynamic fragments ---------- */
// Competences 6.1–6.6: every version is rendered once; src/ui/comp.js only toggles styles/attributes,
// so nothing is re-rendered while scrolling. Mobile openings stay in the DOM, collapsed with an animated
// grid row (0fr ↔ 1fr), so the list never jumps.
export function compList(s) {
  return COMPS.map(([t, items], i) => {
    const on = i === s.comp;
    const open = s.mobile ? `<div data-compopen="${i}" aria-hidden="${!on}" style="display:grid;grid-template-rows:${on ? '1fr' : '0fr'};opacity:${on ? 1 : 0};transition:grid-template-rows .4s ease,opacity .4s ease"><div style="overflow:hidden;min-height:0"><div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;padding:10px 0 12px 60px">${items.map(x => `<div style="font:400 13px/1.35 'Geist';color:#B9B3A9">${esc(x)}</div>`).join('')}</div></div></div>` : '';
    return `<button type="button" class="u-btn" data-comp="${i}" aria-pressed="${on}"${on ? ' aria-current="true"' : ''} style="cursor:pointer;width:100%;display:flex;align-items:baseline;gap:24px;padding:min(13px,${VH(1.3)}) 0;border-bottom:1px solid rgba(236,230,220,.1)"><span data-compnum style="font:400 11px 'Geist Mono';color:${on ? B : '#5A5650'};width:36px;transition:color .3s">6.${i + 1}</span><span class="comp-name" style="font:500 clamp(20px,min(${VW(2.6)},${VH(4.3)}),38px)/1 'Geist';letter-spacing:-.04em;color:${on ? W : '#3a3833'};transition:color .3s;white-space:nowrap">${esc(t.toUpperCase())}</span></button>${open}`;
  }).join('');
}
export function compDetail(s) {
  if (s.mobile) return '';
  return `<div style="display:grid">${COMPS.map(([t, items], i) => {
    const on = i === s.comp;
    return `<div data-compdetail="${i}" aria-hidden="${!on}" style="grid-area:1/1;align-self:end;display:flex;flex-direction:column;gap:14px;max-width:440px;opacity:${on ? 1 : 0};pointer-events:${on ? 'auto' : 'none'};transition:opacity .4s ease"><div style="padding-bottom:10px;border-bottom:1px solid rgba(61,99,255,.5);font:500 11px 'Geist Mono';letter-spacing:.12em;color:#3D63FF">6.${i + 1} — ${esc(t.toUpperCase())}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 24px">${items.map(x => `<div style="font:400 15px/1.4 'Geist';color:#B9B3A9">${esc(x)}</div>`).join('')}</div></div>`;
  }).join('')}</div>`;
}
export function hotInner(s, i) {
  const on = i === s.node, ring = s.mobile ? 92 : 170, fs = s.mobile ? 10 : 12;
  return `<div style="width:${ring}px;height:${ring}px;border-radius:50%;border:1px solid ${on ? B : 'rgba(236,230,220,.12)'};transition:border-color .4s"></div><div style="${CHIP}font:500 ${fs}px 'Geist Mono';letter-spacing:.1em;color:${on ? W : '#8E887F'};white-space:nowrap">${NODE_MAP[i][1]}</div>`;
}
export function nodePanel(s) {
  const [t, items] = COMPS[NODE_MAP[s.node][0]];
  return `<div style="font:500 30px/1 'Geist';letter-spacing:-.04em">${esc(t.toUpperCase())}</div>
<div style="display:flex;flex-direction:column;gap:6px">${items.map(x => `<div style="font:400 15px/1.45 'Geist';color:#B9B3A9">${esc(x)}</div>`).join('')}</div>
<a href="#contatti" style="margin-top:6px;font:500 13px 'Geist'">Discuti un caso di ${esc(t.toLowerCase())} →</a>`;
}
export function reqChips(s) {
  return REQ_TYPES.map((t, i) => { const on = i === s.req; return `<button type="button" class="u-btn" data-req="${i}" aria-pressed="${on}" style="cursor:pointer;font:400 12px 'Geist';padding:6px 11px;white-space:nowrap;border-radius:2px;background:${on ? W : 'transparent'};color:${on ? '#0A0A0B' : W};border:1px solid rgba(236,230,220,.2)">${esc(t)}</button>`; }).join('');
}

/* ---------- full overlay ---------- */
export function renderApp(s) {
  const D = !s.mobile, M = s.mobile;
  const labels = `<div aria-hidden="true" style="position:fixed;inset:0;z-index:4;pointer-events:none">
${lblBox('h1', DOT + line(90) + monoLbl('MARGINE INCISALE'))}
${lblBox('h2', DOT + line(60) + monoLbl('SUPERFICIE CERAMICA'))}
${IMPLANT_LABELS.map(([id, name, sub, short]) => lblBox(id, DOT + line(110, .55) + `<div style="${CHIP}display:flex;flex-direction:column;gap:2px;white-space:nowrap"><div style="font:500 12px 'Geist Mono';letter-spacing:.1em;color:#ECE6DC">${M ? short : name}</div><div style="font:400 11px 'Geist Mono';color:#5A5650">${M ? '' : esc(sub)}</div></div>`)).join('')}
${lblBox('c0', DOT + line(70) + monoLbl('CONTROLLO · 360°'))}
${lblBox('t0', monoLbl('STRUTTURA') + line(80) + DOT)}
${lblBox('t1', DOT + line(80) + monoLbl('INTERFACCIA DI MATERIALE'))}
</div>
<div style="position:fixed;inset:0;z-index:4;pointer-events:none">${NODE_MAP.map(([, t], i) => `<button type="button" class="u-btn" data-hot="${i}" data-node="${i}" tabindex="-1" aria-label="Esplora ${esc(COMPS[NODE_MAP[i][0]][0])}" style="position:fixed;left:0;top:0;opacity:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:12px;pointer-events:none">${hotInner(s, i)}</button>`).join('')}</div>`;

  const chrome = `<div aria-hidden="true" style="position:fixed;inset:0;z-index:9;pointer-events:none"><div style="position:absolute;left:24px;top:24px;width:14px;height:14px;border-left:1px solid #5A5650;border-top:1px solid #5A5650"></div><div class="corner-br" style="position:absolute;right:24px;bottom:24px;width:14px;height:14px;border-right:1px solid #5A5650;border-bottom:1px solid #5A5650"></div></div>
<header data-nav style="position:fixed;inset:0 0 auto 0;z-index:10;height:72px;padding:0 ${PADX};display:flex;align-items:center;justify-content:space-between;gap:24px;border-bottom:1px solid transparent;transition:background .4s,border-color .4s">
<a href="#top" aria-label="Attardi &amp; Liggi — inizio pagina" style="display:flex;align-items:baseline;gap:14px;white-space:nowrap"><span style="font:500 15px 'Geist';letter-spacing:-.01em">ATTARDI &amp; LIGGI</span>${D ? `<span style="font:400 11px 'Geist Mono';letter-spacing:.12em;color:#8E887F">LAB. ODONTOTECNICO · CAGLIARI</span>` : ''}</a>
${D ? `<nav aria-label="Principale" style="display:flex;gap:clamp(14px,${VW(2)},28px);font:400 11px 'Geist Mono';letter-spacing:.12em;flex-wrap:wrap;justify-content:center"><a href="#laboratorio" style="color:#8E887F">LABORATORIO</a><a href="#competenze" style="color:#8E887F">COMPETENZE</a><a href="#materiali" style="color:#8E887F">MATERIALI</a><a href="#workflow" style="color:#8E887F">WORKFLOW</a><a href="#contatti" style="color:#8E887F">CONTATTI</a></nav>` : ''}
<a href="#contatti" style="font:500 13px 'Geist';padding:10px 18px;background:#ECE6DC;color:#0A0A0B;border-radius:2px;white-space:nowrap">Parla con noi</a></header>
<div class="foot" aria-hidden="true" style="position:fixed;left:${PADX};right:${PADX};bottom:28px;z-index:10;display:flex;justify-content:space-between;align-items:center;font:400 11px 'Geist Mono';letter-spacing:.12em;color:#5A5650;pointer-events:none"><div data-foot-label style="white-space:nowrap">01 / 11 — ARCATA</div><div class="foot-right" style="display:flex;align-items:center;gap:12px"><div class="foot-track" style="width:120px;height:1px;background:rgba(236,230,220,.15)"><div data-foot-bar style="width:0%;height:1px;background:#ECE6DC"></div></div>SCORRI</div></div>`;

  const s0 = `<section data-sec="0" aria-label="Attardi &amp; Liggi" style="height:${VH(200)};position:relative">
<div style="${sticky('96px', 'display:flex;flex-wrap:wrap-reverse;align-items:center')}">
<div data-fade="0" style="flex:1 1 520px;max-width:560px;display:flex;flex-direction:column;opacity:0">
<h1 style="margin:0 0 0 -4px;font:500 clamp(56px,min(${VW(9.7)},${VH(15.5)}),140px)/.9 'Geist';letter-spacing:-.045em;white-space:nowrap">ATTARDI<br>&amp; LIGGI</h1>
${D ? `<div aria-hidden="true" style="margin-top:28px;${RULER}"></div>` : ''}
<div style="margin-top:20px;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px 24px;font:400 12px/1.7 'Geist Mono';letter-spacing:.1em;color:#B9B3A9"><div>LABORATORIO ODONTOTECNICO<br>CAGLIARI · SARDEGNA</div><div style="color:#8E887F">RESTAURO / PROTESI /<br>IMPLANTOPROTESI</div></div>
${D ? `<div style="margin-top:36px;display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid rgba(236,230,220,.14)">${['PRECISIONE', 'MATERIA', 'PROCESSO'].map((t, i) => `<div style="padding-top:14px;display:flex;flex-direction:column;gap:6px"><span style="font:400 11px 'Geist Mono';color:#3D63FF">${pad(i + 1)}</span><span style="font:500 26px 'Geist';letter-spacing:-.03em">${t}</span></div>`).join('')}</div>` : ''}
<p style="margin:36px 0 0;font:400 20px/1.4 'Geist';color:#B9B3A9">Tecnica, precisione, collaborazione.</p>
<div style="margin-top:24px;display:flex;flex-wrap:wrap;gap:12px"><a href="#contatti" style="font:500 14px 'Geist';padding:15px 24px;background:#ECE6DC;color:#0A0A0B;border-radius:2px;white-space:nowrap">Parla con il laboratorio</a><a href="#competenze" style="font:500 14px 'Geist';padding:15px 24px;border:1px solid rgba(236,230,220,.28);border-radius:2px;white-space:nowrap">Scopri le lavorazioni</a></div>
</div><div style="flex:1 1 400px;min-height:${VH(40)}"></div></div></section>`;

  const s1 = `<section id="laboratorio" data-sec="1" aria-label="Il laboratorio" style="height:${VH(220)};position:relative">
<div style="${sticky('96px', 'display:flex;flex-direction:row-reverse;flex-wrap:wrap-reverse;align-items:center')}">
<div data-fade="1" style="flex:1 1 440px;max-width:600px;display:flex;flex-direction:column;gap:${M ? 14 : 24}px;opacity:0">
<div style="display:flex;justify-content:space-between;${HEAD};white-space:nowrap"><span>02 / IL LABORATORIO</span><span>A&amp;L</span></div>
<h2 style="margin:0 0 0 -3px;font:500 clamp(36px,min(${VW(5.3)},${VH(8.5)}),76px)/1 'Geist';letter-spacing:-.045em;white-space:nowrap">ATTARDI &amp; LIGGI</h2>
<p style="margin:0;font:300 ${M ? 15 : 19}px/1.55 'Geist';color:#B9B3A9;text-wrap:pretty">Lavoriamo al fianco dei professionisti del dentale nello sviluppo e nella realizzazione di soluzioni protesiche, dal singolo elemento ai casi riabilitativi complessi.</p>
${D ? `<ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;font:500 18px 'Geist';letter-spacing:-.01em;border-bottom:1px solid rgba(236,230,220,.14)">${PILLARS.map((t, i) => `<li style="display:flex;gap:24px;padding:13px 0;border-top:1px solid rgba(236,230,220,.14)"><span style="font:400 11px 'Geist Mono';color:#3D63FF;width:36px;padding-top:4px">2.${i + 1}</span>${t}</li>`).join('')}</ul>`
    : `<ul style="list-style:none;margin:0;padding:12px 0 0;display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;border-top:1px solid rgba(236,230,220,.14)">${PILLARS.map((t, i) => `<li style="display:flex;gap:8px;font:500 13px/1.3 'Geist'"><span style="font:400 10px 'Geist Mono';color:#3D63FF;padding-top:2px">2.${i + 1}</span>${t}</li>`).join('')}</ul>`}
<div style="font:400 11px 'Geist Mono';color:#3D63FF;letter-spacing:.06em">[DA VERIFICARE] foto reale del team / banco di lavoro</div>
</div><div style="flex:1 1 400px;min-height:${VH(40)}"></div></div></section>`;

  const s2 = `<section data-sec="2" aria-label="Implantoprotesi" style="height:${VH(320)};position:relative">
<div style="${sticky('110px', 'display:flex;flex-wrap:wrap-reverse;align-items:stretch')}">
<div data-fade="2" style="flex:0 1 560px;display:flex;flex-direction:column;justify-content:space-between;gap:24px;opacity:0">
<div style="display:flex;flex-direction:column;gap:18px"><div style="${HEAD}">03 / IMPLANTOPROTESI</div><h2 style="margin:0 0 0 -3px;font:500 clamp(30px,min(${VW(4.2)},${VH(6.7)}),60px)/1 'Geist';letter-spacing:-.045em;white-space:nowrap">IMPLANTOPROTESI</h2>${D ? `<p style="margin:0;max-width:460px;font:300 17px/1.55 'Geist';color:#B9B3A9;text-wrap:pretty">Dalla connessione alla corona, ogni componente progettato in relazione agli altri.</p>` : ''}</div>
${M ? `<div style="display:flex;flex-wrap:wrap;gap:6px 14px;padding-top:12px;border-top:1px solid rgba(236,230,220,.1)">${IMPLANT_SERVICES.map((t, i) => `<span data-impitem="${i}" style="font:400 13px/1.3 'Geist';opacity:.14;transition:opacity .4s;white-space:nowrap">${t}</span>`).join('')}</div>`
    : `<div style="display:flex;flex-direction:column;border-bottom:1px solid rgba(236,230,220,.1)">${IMPLANT_SERVICES.map((t, i) => `<div data-impitem="${i}" style="display:flex;gap:20px;align-items:baseline;padding:min(10px,${VH(1)}) 0;border-top:1px solid rgba(236,230,220,.1);opacity:.14;transition:opacity .4s"><span style="font:400 11px 'Geist Mono';color:#3D63FF;width:36px">3.${pad(i + 1)}</span><span style="font:400 16px 'Geist'">${t}</span></div>`).join('')}</div>`}
</div>
<div style="flex:1 1 300px;min-height:${VH(40)}"></div>
${D ? `<div data-fade="2" aria-hidden="true" style="flex:0 0 auto;display:flex;flex-direction:column;align-items:flex-end;gap:8px;font:400 11px 'Geist Mono';color:#5A5650;letter-spacing:.1em;opacity:0"><div data-explode>ESPLOSO · 0%</div><div style="width:9px;height:260px;border-right:1px solid rgba(236,230,220,.3);background:repeating-linear-gradient(180deg,rgba(236,230,220,.3) 0 1px,transparent 1px 26px);position:relative"><div data-explodebar style="position:absolute;right:-1px;top:0;width:2px;height:0%;background:#3D63FF"></div></div></div>` : ''}
</div></section>`;

  const s3 = `<section id="materiali" data-sec="3" aria-label="Materiali" style="height:${VH(520)};position:relative">
<div style="${sticky('110px', 'display:flex;flex-wrap:wrap-reverse;align-items:stretch;gap:24px')}">
<div data-fade="3" style="flex:0 1 380px;display:flex;flex-direction:column;justify-content:space-between;gap:24px;opacity:0">
<div style="display:flex;flex-direction:column;gap:16px"><p style="margin:0;font:300 17px/1.55 'Geist';color:#B9B3A9;text-wrap:pretty">La scelta del materiale nasce dal caso: resistenza, estetica, spessori disponibili e tipo di supporto.</p><div data-matlabel aria-live="off" style="font:500 11px 'Geist Mono';letter-spacing:.12em;color:#3D63FF">3D · CORONA — CERAMICA</div></div>
${D ? `<div style="display:flex;flex-direction:column;gap:6px"><div style="${HEAD}">04 / MATERIA</div><h2 style="margin:0 0 0 -4px;font:500 clamp(48px,min(${VW(6.9)},${VH(11)}),100px)/1 'Geist';letter-spacing:-.045em;white-space:nowrap">MATERIA</h2></div>` : `<h2 style="margin:0;${HEAD.replace('padding-bottom:12px', 'padding-bottom:10px')}">04 / MATERIA</h2>`}
</div>
<div style="flex:1 1 160px;min-height:${VH(36)}"></div>
<div data-fade="3" style="flex:0 1 400px;display:flex;flex-direction:column;justify-content:space-between;gap:24px;opacity:0">
${D ? `<div style="display:flex;flex-direction:column;border-bottom:1px solid rgba(236,230,220,.1)"><div style="display:flex;justify-content:space-between;padding-bottom:10px;font:400 10px 'Geist Mono';letter-spacing:.14em;color:#5A5650"><span>MATERIALE</span><span>INDICE</span></div>${MATERIALS.map(([n, k], i) => `<div data-mk="${k}" style="display:flex;gap:18px;align-items:baseline;padding:min(9px,${VH(.9)}) 0;border-top:1px solid rgba(236,230,220,.14);font:400 17px 'Geist';opacity:.18;transition:opacity .5s"><span style="font:400 11px 'Geist Mono';color:#3D63FF;width:30px">4.${pad(i + 1)}</span><span style="flex:1">${n}</span></div>`).join('')}</div>`
    : `<div style="display:flex;flex-wrap:wrap;gap:6px 14px">${MATERIALS.map(([n, k]) => `<span data-mk="${k}" style="font:500 16px/1.2 'Geist';letter-spacing:-.02em;opacity:.18;transition:opacity .5s">${n}</span>`).join('')}</div>`}
${D ? `<div data-clip aria-hidden="true" style="align-self:flex-end;font:400 11px 'Geist Mono';letter-spacing:.12em;color:#5A5650">STATO · CERAMICA</div>` : ''}
</div></div></section>`;

  // Scene 05 fit: on phones, step number, step gap, list height and the 3D space above the text shrink linearly
  // with the viewport height below ~930px (unchanged above), so the 6-step bar stays on screen above the footer.
  const WF = M
    ? { ol: `clamp(224px,calc(${VH(22)} + 56px),263px)`, gap: `clamp(10px,calc(${VH(4)} - 21.2px),16px)`, num: `clamp(72px,calc(${VH(16)} - 52.8px),96px)`, space: `clamp(${VH(15.5)},calc(${VH(66.77)} - 342px),${VH(30)})` }
    : { ol: '320px', gap: '16px', num: `clamp(96px,min(${VW(16)},${VH(26)}),240px)`, space: VH(30) };
  const s4 = `<section id="workflow" data-sec="4" aria-label="Processo" style="height:${VH(440)};position:relative">
<div style="${sticky('110px', 'display:flex;flex-direction:column')}">
<div data-fade="4" style="flex:1;display:flex;flex-direction:column;justify-content:space-between;gap:24px;opacity:0">
<div style="display:flex;flex-wrap:wrap-reverse;flex:1;gap:24px">
<div style="flex:1 1 440px;max-width:560px;display:flex;flex-direction:column;gap:12px"><h2 style="margin:0;${HEAD}">05 / PROCESSO</h2><p style="margin:0;font:300 15px/1.5 'Geist';color:#B9B3A9;max-width:500px;text-wrap:pretty">Esempio: protesi su impianto. Ogni lavorazione segue un proprio processo, non sempre digitale.</p>
<ol style="list-style:none;margin:0;padding:0;position:relative;flex:1;min-height:${WF.ol}">${STEPS.map(([n, t, d], i) => `<li data-wstep="${i}" style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;gap:${WF.gap};opacity:0;transition:opacity .5s"><div aria-hidden="true" style="margin-left:-6px;font:500 ${WF.num}/.85 'Geist';letter-spacing:-.06em">${n}</div><h3 style="margin:0;font:500 clamp(30px,${VW(3.3)},48px)/1 'Geist';letter-spacing:-.04em">${t.toUpperCase()}</h3><p style="margin:0;max-width:500px;font:300 18px/1.55 'Geist';color:#B9B3A9;text-wrap:pretty">${d}</p></li>`).join('')}</ol></div>
<div style="flex:1 1 360px;min-height:${WF.space}"></div></div>
<div aria-hidden="true" style="display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px">${STEPS.map(([n, t], i) => `<div data-wbar="${i}" style="padding-top:12px;border-top:2px solid rgba(236,230,220,.5);opacity:.3;font:500 11px 'Geist Mono';letter-spacing:.1em;transition:opacity .4s,border-color .4s">${M ? n : n + ' — ' + t.toUpperCase()}</div>`).join('')}</div>
</div></div></section>`;

  const s5 = `<section id="competenze" data-sec="5" aria-label="Competenze" style="height:${VH(260)};position:relative">
<div style="${sticky('100px', 'display:flex;flex-wrap:wrap-reverse;align-items:stretch;gap:40px')}">
<div data-fade="5" style="flex:1 1 600px;max-width:760px;display:flex;flex-direction:column;justify-content:center;gap:16px;opacity:0">
<h2 style="margin:0;${HEAD}">06 / COMPETENZE</h2>
<div id="comp-list" style="display:flex;flex-direction:column">${compList(s)}</div>
</div>
<div data-fade="5" id="comp-detail" aria-live="polite" style="flex:0 1 420px;display:flex;flex-direction:column;justify-content:flex-end;opacity:0">${compDetail(s)}</div>
</div></section>`;

  const s6 = `<section data-sec="6" aria-label="Protesi fissa" style="height:${VH(320)};position:relative">
<div style="${sticky(M ? '84px' : '110px', 'display:flex;flex-direction:column;justify-content:space-between')}">
<div data-fade="6" style="display:flex;flex-direction:column;gap:18px;max-width:640px;opacity:0"><div style="${HEAD}">07 / PROTESI FISSA</div>${D ? `<h2 style="margin:0 0 0 -3px;font:500 clamp(30px,min(${VW(4.2)},${VH(6.7)}),60px)/1 'Geist';letter-spacing:-.045em">ELEMENTO DOPO ELEMENTO.</h2>` : `<h2 style="margin:0 0 0 -2px;font:500 24px/1 'Geist';letter-spacing:-.045em;white-space:nowrap">ELEMENTO DOPO ELEMENTO.</h2>`}</div>
<div data-fade="6" style="align-self:flex-end;display:flex;flex-direction:column;min-width:280px;border-bottom:1px solid rgba(236,230,220,.1);opacity:0">${BRIDGE_ITEMS.map((t, i) => `<div data-bitem="${i}" style="display:flex;gap:18px;padding:9px 0;border-top:1px solid rgba(236,230,220,.1);font:400 12px 'Geist Mono';letter-spacing:.1em;opacity:.3;transition:opacity .4s;white-space:nowrap"><span style="color:#3D63FF;width:28px">7.${i + 1}</span>${t}</div>`).join('')}</div>
</div></section>`;

  const s7 = `<section data-sec="7" aria-label="Casi complessi" style="height:${VH(320)};position:relative">
<div style="${sticky('110px', 'display:flex;flex-direction:column;justify-content:space-between')}">
<div data-fade="7" style="display:flex;flex-direction:column;gap:18px;max-width:680px;opacity:0"><div style="${HEAD}">08 / CASI COMPLESSI</div><h2 style="margin:0 0 0 -3px;font:500 clamp(34px,min(${VW(5.3)},${VH(8.4)}),76px)/1 'Geist';letter-spacing:-.045em">CASI COMPLESSI</h2></div>
<div data-fade="7" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));border-top:1px solid rgba(236,230,220,.14);opacity:0">${COMPLEX_ITEMS.map((t, i) => `<div data-titem="${i}" style="padding-top:12px;display:flex;flex-direction:column;gap:4px;opacity:.3;transition:opacity .4s"><span style="font:400 10px 'Geist Mono';color:#3D63FF">8.${i + 1}</span><span style="font:500 13px 'Geist Mono';letter-spacing:.06em">${t}</span></div>`).join('')}</div>
</div></section>`;

  const s8 = `<section data-sec="8" aria-label="Esplora le competenze" style="height:${VH(260)};position:relative">
<div style="${sticky('100px', 'display:flex;flex-direction:column')}">
<h2 data-fade="8" style="margin:0;max-width:420px;${HEAD};opacity:0">09 / ESPLORA LE COMPETENZE</h2>
<div style="flex:1;display:flex;align-items:${M ? 'flex-end' : 'center'};justify-content:center"><div data-fade="8" id="node-panel" aria-live="polite" style="width:min(400px,100%);padding:24px 0;border-top:1px solid #3D63FF;display:flex;flex-direction:column;gap:14px;opacity:0">${nodePanel(s)}</div></div>
</div></section>`;

  const s9 = `<section data-sec="9" aria-hidden="true" style="height:${VH(200)};position:relative">
<div style="position:sticky;top:0;height:${VH(100)};box-sizing:border-box;padding:110px ${PADX} 80px;display:flex;align-items:flex-end;justify-content:center;pointer-events:none">
<div data-fade="9" style="font:400 11px 'Geist Mono';letter-spacing:.14em;color:#8E887F;opacity:0">10 / RIASSEMBLAGGIO · ARCATA RICOMPOSTA</div>
</div></section>`;

  const FL = "font:400 11px 'Geist Mono';letter-spacing:.1em;color:#8E887F";
  const form = `<form id="demo-form" data-fade="10" novalidate autocomplete="off" style="flex:1 1 420px;max-width:560px;align-self:flex-start;display:flex;flex-direction:column;opacity:0">
<div style="display:flex;justify-content:space-between;${HEAD}"><span>11 / RICHIESTA</span><span>A&amp;L</span></div>
<h2 style="margin:0;padding:22px 0 14px;font:500 clamp(30px,${VW(2.8)},40px)/1.05 'Geist';letter-spacing:-.035em">Hai un caso da valutare?</h2>
<p style="margin:0 0 18px;font:300 15px/1.55 'Geist';color:#B9B3A9;text-wrap:pretty">Confrontiamoci sulla soluzione più adatta al caso e sulle esigenze dello studio.</p>
${FIELDS.map(([l, p, type], i) => `<label style="display:flex;align-items:baseline;gap:18px;padding:10px 0;border-top:1px solid rgba(236,230,220,.14)"><span aria-hidden="true" style="font:400 11px 'Geist Mono';color:#3D63FF;width:24px">${pad(i + 1)}</span><span style="width:96px;${FL}">${l}</span><input type="${type}" placeholder="${esc(p)}" style="flex:1;min-width:0;background:transparent;border:0;padding:2px 0;font:400 15px 'Geist';color:#ECE6DC;outline:none"></label>`).join('')}
<div role="group" aria-labelledby="req-lbl" style="display:flex;align-items:baseline;gap:18px;padding:12px 0;border-top:1px solid rgba(236,230,220,.14)"><span aria-hidden="true" style="font:400 11px 'Geist Mono';color:#3D63FF;width:24px">05</span><span id="req-lbl" style="width:96px;${FL}">RICHIESTA</span><div id="req-chips" style="flex:1;display:flex;flex-wrap:wrap;gap:6px">${reqChips(s)}</div></div>
<label style="display:flex;align-items:baseline;gap:18px;padding:10px 0;border-top:1px solid rgba(236,230,220,.14);border-bottom:1px solid rgba(236,230,220,.14)"><span aria-hidden="true" style="font:400 11px 'Geist Mono';color:#3D63FF;width:24px">06</span><span style="width:96px;${FL}">CASO</span><textarea rows="3" placeholder="Tipo di lavorazione, elementi, materiale previsto…" style="flex:1;min-width:0;resize:none;background:transparent;border:0;padding:2px 0;font:400 15px/1.45 'Geist';color:#ECE6DC;outline:none"></textarea></label>
<div aria-disabled="true" title="Non disponibile nella demo" style="margin-top:14px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 14px;border:1px dashed rgba(236,230,220,.2);border-radius:2px;font:400 13px 'Geist';color:#8E887F"><span>Allega scansioni, foto o file STL</span><span style="font:400 11px 'Geist Mono';letter-spacing:.08em;color:#5A5650">STL · PLY · JPG · PDF</span></div>
<div style="margin-top:18px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><span style="font:400 12px 'Geist';color:#5A5650">Ti ricontattiamo per discutere il caso.</span><button type="submit" class="u-btn" style="cursor:pointer;white-space:nowrap;font:500 14px 'Geist';padding:14px 22px;background:#ECE6DC;color:#0A0A0B;border-radius:2px">Parla con il laboratorio</button></div>
<div id="demo-status" role="status" aria-live="polite" style="margin-top:14px;font:400 10px/1.6 'Geist Mono';letter-spacing:.12em;color:#8E887F">DEMO — IL MODULO NON INVIA DATI</div>
</form>`;

  const cLbl = t => `<span style="font:400 10px/1.6 'Geist Mono';letter-spacing:.12em;color:#8E887F">${t}</span>`;
  const cell = (l, v) => `<div class="c-cell" style="display:flex;flex-direction:column;gap:3px;padding:10px 0;border-top:1px solid rgba(236,230,220,.14)">${cLbl(l)}${v}</div>`;
  const flag = t => `<span style="font:400 11px/1.5 'Geist Mono';letter-spacing:.06em;color:#3D63FF">${t}</span>`;
  const row = (l, v) => `<div style="display:flex;gap:18px;padding:11px 0;border-top:1px solid rgba(236,230,220,.14)"><span style="width:96px;flex:none;font:400 11px/1.9 'Geist Mono';letter-spacing:.1em;color:#8E887F">${l}</span>${v}</div>`;
  const flagM = t => `<span style="font:400 11px/1.9 'Geist Mono';letter-spacing:.06em;color:#3D63FF">${t}</span>`;
  const tel = `<a href="${CONTACT.phoneHref}" style="pointer-events:auto">${CONTACT.phone}</a>`;
  const info = `<div data-fade="10" style="flex:1 1 420px;display:flex;flex-direction:column;justify-content:flex-start;opacity:0">${M ? `<div style="height:${VH(30)}"></div>` : ''}
<p style="margin:0 0 0 -3px;font:500 clamp(40px,min(${VW(6.1)},${VH(9.8)}),88px)/1 'Geist';letter-spacing:-.045em;white-space:nowrap">ATTARDI &amp; LIGGI</p>
${D ? `<div class="c-ruler" aria-hidden="true" style="margin-top:14px;max-width:600px;${RULER}"></div>
<address class="c-addr" style="font-style:normal;margin-top:18px;max-width:600px;display:grid;grid-template-columns:1fr 1fr;column-gap:24px;font:400 14px/1.4 'Geist';color:#ECE6DC">${cell('INDIRIZZO', `<span>${CONTACT.street} · ${CONTACT.city}</span>`)}${cell('TELEFONO', tel)}${cell('EMAIL', flag(CONTACT.email))}${cell('ORARI', flag(CONTACT.hours))}</address><div class="c-legal" style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(236,230,220,.14);max-width:600px;font:400 10px/1.6 'Geist Mono';letter-spacing:.1em;color:#5A5650">${CONTACT.legal} · CAGLIARI, SARDEGNA</div>`
    : `<div style="margin-top:20px;display:flex;flex-direction:column;gap:4px;font:400 12px/1.7 'Geist Mono';letter-spacing:.1em;color:#B9B3A9"><span>LABORATORIO ODONTOTECNICO</span><span>CAGLIARI · SARDEGNA</span></div>
<address style="font-style:normal;margin-top:20px;max-width:600px;display:flex;flex-direction:column;border-bottom:1px solid rgba(236,230,220,.14);font:400 15px/1.4 'Geist';color:#ECE6DC">${row('INDIRIZZO', `<span>${CONTACT.street}<br>${CONTACT.city}</span>`)}${row('TELEFONO', tel)}${row('EMAIL', flagM(CONTACT.email))}${row('ORARI', flagM(CONTACT.hours))}</address>
<div style="margin-top:14px;font:400 10px/1.6 'Geist Mono';letter-spacing:.1em;color:#5A5650">${CONTACT.legal}</div>`}
</div>`;

  const s10 = `<section id="contatti" data-sec="10" aria-label="Contatti" style="min-height:${VH(100)};position:relative">
<div class="c-wrap" style="min-height:${VH(100)};box-sizing:border-box;padding:110px ${PADX} 80px;display:flex;flex-direction:row-reverse;flex-wrap:wrap-reverse;gap:40px;align-items:stretch">
${form}
${info}</div></section>`;

  return `${labels}${chrome}<main id="top" style="position:relative;z-index:3">${s0}${s1}${s2}${s3}${s4}${s5}${s6}${s7}${s8}${s9}${s10}</main>`;
}
