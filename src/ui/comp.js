// Active competence (6.1–6.6). All versions are already in the DOM (see compList / compDetail in template.js):
// this only switches colours, opacity, the mobile opening and ARIA state. It runs when the active item
// changes (scroll stepper or click), never per frame.
const B = '#3D63FF', W = '#ECE6DC';
// #comp-detail is aria-live: expose the new panel to assistive tech only once the user settles on an item,
// so a fast scroll through 6.1 → 6.6 is not announced item by item.
const ANNOUNCE_DELAY = 600;
let announceTimer = 0;

export function applyComp(root, k) {
  const btns = root.querySelectorAll('[data-comp]');
  for (let i = 0; i < btns.length; i++) {
    const b = btns[i], on = i === k;
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    const num = b.querySelector('[data-compnum]'), name = b.querySelector('.comp-name');
    if (num) num.style.color = on ? B : '#5A5650';
    if (name) name.style.color = on ? W : '#3a3833';
  }
  const opens = root.querySelectorAll('[data-compopen]');
  for (let i = 0; i < opens.length; i++) {
    const o = opens[i], on = i === k;
    o.style.gridTemplateRows = on ? '1fr' : '0fr'; o.style.opacity = on ? 1 : 0;
    o.setAttribute('aria-hidden', on ? 'false' : 'true');
  }
  const details = root.querySelectorAll('[data-compdetail]');
  for (let i = 0; i < details.length; i++) {
    const d = details[i], on = i === k;
    d.style.opacity = on ? 1 : 0; d.style.pointerEvents = on ? 'auto' : 'none';
  }
  clearTimeout(announceTimer);
  announceTimer = setTimeout(() => {
    const ds = root.querySelectorAll('[data-compdetail]');
    for (let i = 0; i < ds.length; i++) ds[i].setAttribute('aria-hidden', i === k ? 'false' : 'true');
  }, ANNOUNCE_DELAY);
}
