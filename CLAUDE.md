# Attardi & Liggi — sito demo (attardi-liggi-demo)

Sito one-page per Attardi & Liggi, laboratorio odontotecnico a Cagliari. Vite senza framework + Three.js 0.160 + GSAP 3.12.5 / ScrollTrigger. Deploy su Vercel (progetto "attardi-liggi-demo", preset Vite, output `dist`) a ogni push su `main`. Un'unica scena 3D persistente per tutte le 11 sezioni, guidata dallo scroll (progress P 0→10, una unità per scena).

Sequenza: arcata hero → dente isolato → impianto esploso → cambi materiale (clipping planes) → workflow wireframe → ponte → struttura Toronto → oggetti servizi sparsi con hotspot → arcata ricomposta → contatti.

Comandi: `npm install`, `npm run dev`, `npm run build`, `npm run preview`. Non ci sono test automatici: si verifica con build + dev server + controllo visivo delle scene (`?debug`, poi `window.__alP = <P>` per fissare il progress).

## File chiave
- `src/main.js` — boot, `--vh` stabile su iOS (lvh probe, su touch solo al cambio larghezza/orientamento), rebuild al cambio mobile/desktop (breakpoint 760), `sectionVH`, `onComp`, carica `teeth.bin` prima del primo `boot()`
- `src/scene/experience.js` — scena, pose, timeline scroll→P (evento scroll nativo), stepper liste (DWELL 180 ms), competenze 6.1–6.6 (P 5.02–5.58, `scrollToComp`), `follow()` contatti mobile, `ScrollTrigger.config({ ignoreMobileResize: true })`
- `src/scene/choreography.js` — ORDER, BRIDGE_SLOTS, HERO_SLOT, STAGES (materiali), HOLD (reduced-motion), target servizi
- `src/scene/models.js` — geometrie (denti, radice, impianto, Toronto, protesi)
- `src/scene/dentalAssets.js` — loader di `public/models/teeth.bin` + `mirrorX`
- `src/scene/materials.js`, `camera.js` (inquadratura KD per scena), `math.js` (easing, pose, track)
- `src/ui/template.js` (markup desktop/mobile), `interactions.js`, `comp.js` (stato competenze), `data.js` (testi) — la scena legge il DOM via attributi `data-*`
- `src/styles/global.css`, `responsive.css`; `vercel.json`; `vite.config.js` (`base: './'`); `index.html`
- `?debug` abilita `window.__alP` (fissa P) e `window.__alVP` (finge un viewport); `?reduced` forza reduced-motion
- `qa-preview.html` (anteprima senza build, solo QA) **non è nel repo**: se serve va ricreata. `dentalAssets.js` prevede comunque il percorso `./public/models/teeth.bin` per quella anteprima.

## Già risolto — NON toccare
- iOS Safari: `--vh` ricalcolato solo al cambio di larghezza/orientamento; `ScrollTrigger.config({ ignoreMobileResize: true })`; progress guidato dall'evento scroll nativo, non da `onUpdate`
- Liste a step (Workflow, Protesi fissa, Casi complessi, Competenze, Implantoprotesi): avanzano un elemento alla volta, pausa ~180 ms
- Competenze (06): 6.1–6.6 in sequenza in P 5.02–5.58; al clic scroll fino alla voce
- Overflow sezione contatti su mobile e desktop a bassa altezza
- Fallback reduced-motion
- Coreografia, tipografia e layout approvati: non cambiarli

## Regola: main.js ed experience.js solo con patch
`src/main.js` e `src/scene/experience.js` contengono tutti i fix qui sopra. Vanno **sempre modificati con patch mirate, mai sostituiti** con versioni esterne (handoff, zip, altre chat). Un handoff precedente conteneva versioni vecchie di questi due file: copiarle avrebbe annullato i fix iOS, gli stepper e le competenze. Prima di integrare file esterni, fare `diff` con la versione nel repo e portare a mano solo le righe pertinenti.

## Denti reali
Anatomia estratta da una libreria exocad (arcata inferiore, 12 denti visibili), in `public/models/teeth.bin` (servito da Vite a `/models/teeth.bin`).

- **Formato**: `uint32` lunghezza header + header JSON (`scale`, `q`, `pieces`) + posizioni `int16` (diviso `meta.q`) e indici `uint16`/`uint32` per pezzo. Pezzi: `central`, `lateral`, `canine`, `pm1`, `pm2`, `molar` (corone) + `root` (radice del molare).
- **Spazio locale** (un solo lato, emiarcata sinistra del paziente): +Y occlusale, y=0 al colletto (CEJ), +X distale, +Z vestibolare. Unità scena (1 ≈ 10.6 mm).
- **pm / pm2**: in `choreography.js` ORDER distingue primo (`pm`) e secondo premolare (`pm2`, accanto al molare). In `models.js` `REAL` mappa `pm→pm1`, `pm2→pm2`; `molar2` non ha sorgente nella libreria e deriva dal primo molare scalato (`M2 = [.9, .93, .95]`). `PRESET[k].w/d/h` vengono aggiornati con le misure reali.
- **slotGeo e mirror**: `mirrorX` (in `dentalAssets.js`) specchia X e inverte il winding per l'altro lato. `G.slotGeo(k, i)` restituisce la geometria specchiata (`G.toothL`) per gli slot 0–6 e l'originale (`G.tooth`) per gli slot 7–13. `experience.js` usa sempre `G.slotGeo` per arcata, wireframe e ponte; il dente hero (slot 12) usa `G.tooth.molar`. `G.rootScale` sostituisce la vecchia scala calcolata da PRESET (`[.975, 1, .975]` con i denti reali, per evitare z-fighting tra corona e radice). Nel `destroy` vanno liberate sia `G.tooth` sia `G.toothL`.
- **Caricamento**: `main.js` fa `loadDentalAssets().then(boot)`; il loader è in cache, i rebuild successivi sono sincroni.
- **Fallback procedurale**: se `teeth.bin` non si carica, in console compare `Dental assets unavailable, using procedural teeth` e `buildModels` usa le geometrie procedurali (`toothGeo`, radice lathe), con `toothL === tooth`. Verificato bloccando il file: la scena funziona uguale.
