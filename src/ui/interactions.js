import { hotInner, nodePanel, reqChips } from './template.js';
import { applyComp } from './comp.js';

// Event delegation for the few interactive parts. Only small inner fragments are re-rendered,
// so the elements the 3D scene holds references to (data-hot, data-fade…) stay in place.
export function bindInteractions({ app, state, getExperience }) {
  const onClick = e => {
    const comp = e.target.closest('[data-comp]');
    if (comp) {
      // With the scroll sequence running, a click scrolls to that item so scroll and state never disagree.
      // Reduced motion (or no 3D scene): the click selects the item directly, as before.
      const k = +comp.dataset.comp, exp = getExperience();
      if (exp && !exp.reduced) exp.scrollToComp(k);
      else { state.comp = k; applyComp(app, k); }
      return;
    }
    const node = e.target.closest('[data-node]');
    if (node) {
      state.node = +node.dataset.node;
      app.querySelectorAll('[data-hot]').forEach((el, i) => { el.innerHTML = hotInner(state, i); el.setAttribute('aria-pressed', String(i === state.node)); });
      app.querySelector('#node-panel').innerHTML = nodePanel(state);
      getExperience()?.setActive(state.node);
      return;
    }
    const req = e.target.closest('[data-req]');
    if (req) {
      state.req = +req.dataset.req;
      app.querySelector('#req-chips').innerHTML = reqChips(state);
      app.querySelector(`[data-req="${state.req}"]`)?.focus({ preventScroll: true });
    }
  };

  // Demo form: never submits, never stores or transmits anything.
  const onSubmit = e => {
    if (e.target.id !== 'demo-form') return;
    e.preventDefault();
    e.target.reset();
    const st = app.querySelector('#demo-status');
    if (st) { st.textContent = 'Demo — richiesta non inviata.'; st.style.color = '#ECE6DC'; st.style.font = "400 13px/1.6 'Geist'"; st.style.letterSpacing = '0'; }
  };

  app.addEventListener('click', onClick);
  app.addEventListener('submit', onSubmit);

  // Keep faded-out sections out of the keyboard tab order (visual state is driven by the 3D loop).
  const syncInert = () => {
    app.querySelectorAll('[data-fade]').forEach(el => { const hidden = parseFloat(el.style.opacity || '0') < .3; if (el.inert !== hidden) el.inert = hidden; });
  };
  const timer = setInterval(syncInert, 200);

  return () => { app.removeEventListener('click', onClick); app.removeEventListener('submit', onSubmit); clearInterval(timer); };
}
