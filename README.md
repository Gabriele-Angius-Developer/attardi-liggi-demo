# Attardi & Liggi — Laboratorio Odontotecnico | Demo

Demo web del sito approvato: un'unica scena 3D persistente (Three.js), guidata dallo scroll (GSAP + ScrollTrigger).

## Avvio

```bash
npm install
npm run dev      # sviluppo locale
npm run build    # build di produzione in dist/
npm run preview  # anteprima della build
```

Richiede Node.js 18+.

## Deploy su Vercel

Importa il repository su Vercel: preset **Vite**, build command `npm run build`, output directory `dist` (già fissati in `vercel.json`). In alternativa, da terminale: `npx vercel` (anteprima) e `npx vercel --prod`.

## Struttura

```
index.html                 entry di produzione (metadati, loader, mount)
public/favicon.svg
src/main.js                avvio, breakpoint 760px, ricostruzione su resize, reduced-motion
src/ui/data.js             testi e liste (verbatim dal prototipo approvato)
src/ui/template.js         markup dell'overlay (varianti desktop / mobile)
src/ui/interactions.js     competenze, servizi, tipo di richiesta, modulo demo, focus
src/scene/experience.js    scena persistente: oggetti, loop, scroll → progresso, pulizia risorse
src/scene/models.js        geometrie procedurali (arcata, dente, radice, corona, impianto, abutment, vite, ponte, Toronto, protesi mobile)
src/scene/materials.js     materiali (ceramica, zirconia, e.max, titanio, PMMA, CAD, gengiva) e luci
src/scene/camera.js        inquadrature per scena e interpolazione camera
src/scene/choreography.js  costanti della timeline (tempi, stati materiali, target servizi)
src/scene/math.js          easing, pose, tracce di keyframe
src/styles/                reset, focus visibile, regole di dispositivo
```

## Sostituire i modelli procedurali con GLB

`buildModels()` in `src/scene/models.js` restituisce le geometrie con chiavi fisse (`tooth.*`, `root`, `abutment`, `screw`, `fixture`, `fixtureTop`, `connector`). Per usare asset reali, caricali con `GLTFLoader` (+ Draco/Meshopt) da `public/models/` e restituisci le geometrie con le stesse chiavi. La coreografia legge solo pose, opacità e materiali, quindi non va modificata.

## Note demo

- Il modulo di contatto **non invia né salva dati**: all'invio mostra "Demo — richiesta non inviata." e svuota i campi.
- Le informazioni non verificate restano marcate `[DA VERIFICARE]` (email, orari completi, foto del team, sistemi implantari compatibili).
- `noindex, nofollow` è attivo nei metadati: rimuoverlo quando il sito diventa pubblico.
- Movimento ridotto: rispettato da `prefers-reduced-motion` (stati statici per scena). Forzabile con `?reduced`.
- `?debug` abilita solo gli hook di QA (`window.__alP`, `window.__alVP`); senza parametro non hanno effetto.
