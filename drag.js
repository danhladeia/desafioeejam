// Shared by weights and syllables; no puzzle geometry or selectors live here.
// A short press calls onTap(item); a drag calls onDrop(item, target|null).
const cancellations = new WeakMap();

export function attachDrag(ctx, { items, targets, onDrop, onTap, threshold = 9 }) {
  const { root, doc, active, listen } = ctx;
  const view = doc.defaultView;
  const drags = new Map();
  let disposed = false;
  const within = (el, selector) => {
    const found = el?.closest?.(selector);
    return found && root.contains(found) ? found : null;
  };
  const styleNames = ['transform', 'z-index', 'transition', 'pointer-events', 'touch-action'];
  const snapshot = item => styleNames.map(name => [name, item.style.getPropertyValue(name), item.style.getPropertyPriority(name)]);
  function reset(d) {
    d.item.classList.toggle('dragging', d.wasDragging);
    for (const [name, value, priority] of d.styles) {
      if (value) d.item.style.setProperty(name, value, priority);
      else d.item.style.removeProperty(name);
    }
  }
  function dropTarget(event, item) {
    const rect = root.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom) return null;
    const stack = doc.elementsFromPoint?.(event.clientX, event.clientY) ?? [];
    for (const el of stack) {
      if (el === item || item.contains(el)) continue;
      const found = el.closest?.(targets);
      // Never see through an opponent's target to one below it.
      if (found) return root.contains(found) ? found : null;
    }
    return null;
  }
  function finish(event, cancelled) {
    const d = drags.get(event.pointerId);
    if (!d) return;
    // Remove before releasing: lostpointercapture may fire synchronously.
    drags.delete(event.pointerId);
    const valid = !disposed && active() && root.contains(d.item) && !cancelled;
    if (valid) update(event, d);
    const target = valid && d.moved ? dropTarget(event, d.item) : null;
    try { d.item.releasePointerCapture?.(event.pointerId); } catch { /* Already released. */ }
    reset(d);
    if (!valid) return;
    if (!d.moved) onTap?.(d.item);
    else onDrop?.(d.item, target);
  }
  const cancel = () => {
    for (const pointerId of [...drags.keys()]) finish({ pointerId }, true);
  };

  // Convert screen deltas to the parent's axes, including rotated balance pans.
  function axes(item) {
    if (!view?.DOMMatrix) return null;
    let matrix = new view.DOMMatrix();
    for (let parent = item.parentElement; parent; parent = parent.parentElement) {
      const transform = view.getComputedStyle(parent).transform;
      if (transform && transform !== 'none') matrix = new view.DOMMatrix(transform).multiply(matrix);
    }
    const inverse = matrix.inverse();
    return [inverse.a, inverse.b, inverse.c, inverse.d].every(Number.isFinite) ? inverse : null;
  }
  function update(event, d) {
    const dx = event.clientX - d.x0;
    const dy = event.clientY - d.y0;
    if (!d.moved) {
      if (Math.hypot(dx, dy) < threshold) return;
      d.moved = true;
      d.item.classList.add('dragging');
      d.item.style.zIndex = '40';
      d.item.style.transition = 'none';
    }
    const m = d.axes;
    const x = m ? m.a * dx + m.c * dy : dx;
    const y = m ? m.b * dx + m.d * dy : dy;
    d.item.style.transform = `translate(${x}px, ${y}px) ${d.transform}`;
  }
  const down = event => {
    if (disposed || !active() || drags.has(event.pointerId) || (event.button !== undefined && event.button !== 0)) return;
    const item = within(event.target, items);
    if (!item || item.disabled || item.dataset.locked) return;
    for (const d of drags.values()) if (d.item === item) return;
    event.preventDefault();
    const computed = view?.getComputedStyle(item).transform;
    drags.set(event.pointerId, {
      item, x0: event.clientX, y0: event.clientY, moved: false,
      styles: snapshot(item), wasDragging: item.classList.contains('dragging'),
      transform: computed && computed !== 'none' ? computed : '', axes: axes(item),
    });
    item.style.touchAction = 'none';
    try { item.setPointerCapture?.(event.pointerId); } catch { /* Synthetic pointer. */ }
  };
  const move = event => {
    const d = drags.get(event.pointerId);
    if (!d) return;
    if (!active() || !root.contains(d.item)) { finish(event, true); return; }
    event.preventDefault();
    update(event, d);
  };
  listen('pointerdown', down);
  listen('pointermove', move);
  listen('pointerup', event => finish(event, false));
  listen('pointercancel', event => finish(event, true));
  listen('lostpointercapture', event => finish(event, true));

  const fallbacks = ['pointermove', 'pointerup', 'pointercancel'].map(type => {
    const handler = event => {
      if (root.contains(event.target)) return;
      if (type === 'pointermove') move(event);
      else finish(event, type === 'pointercancel');
    };
    view?.addEventListener(type, handler, { passive: false });
    return [type, handler];
  });
  view?.addEventListener('blur', cancel);
  // Several helpers may share one context without replacing cancellation hooks.
  let hooks = cancellations.get(ctx);
  if (!hooks) {
    hooks = new Set(); cancellations.set(ctx, hooks);
    ctx.setCancel(() => { for (const hook of hooks) hook(); });
  }
  hooks.add(cancel);
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancel(); hooks.delete(cancel);
    view?.removeEventListener('blur', cancel);
    for (const [type, handler] of fallbacks) view?.removeEventListener(type, handler);
  }
  ctx.onDestroy?.(dispose);
  return dispose;
}
