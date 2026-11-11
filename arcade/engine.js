/** Shared, pause-safe canvas arena for the EDF arcade games. */
export function createArena(ctx, game, { w = 1000, h = 700 } = {}) {
  const canvas = ctx.node('canvas', 'arcade-canvas');
  canvas.width = w; canvas.height = h;
  canvas.setAttribute('aria-label', 'Arena do jogo');
  canvas.style.touchAction = 'none';
  ctx.stage.replaceChildren(canvas);
  const g = canvas.getContext('2d');
  const pointers = new Map();
  let frame = 0, last = 0, disposed = false;
  const logicalEvent = (event, type) => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    return { type, id: event.pointerId, x: (event.clientX - rect.left) * w / rect.width, y: (event.clientY - rect.top) * h / rect.height, time: event.timeStamp };
  };
  const pointer = type => event => {
    if (!ctx.active()) return;
    const item = logicalEvent(event, type); if (!item || item.x < 0 || item.y < 0 || item.x > w || item.y > h) return;
    if (type === 'down') { if (pointers.size >= 2) return; pointers.set(item.id, item); try { canvas.setPointerCapture(event.pointerId); } catch {} }
    if (!pointers.has(item.id)) return;
    if (type !== 'down') pointers.set(item.id, item);
    game.onPointer?.(item);
    if (type === 'up' || type === 'cancel') pointers.delete(item.id);
    event.preventDefault();
  };
  const down = pointer('down'), move = pointer('move'), up = pointer('up'), cancel = pointer('cancel');
  canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', cancel);
  function loop(at) {
    if (disposed) return;
    const dt = Math.min(50, Math.max(0, at - (last || at))); last = at;
    if (ctx.active()) game.update?.(dt);
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h); game.draw?.(g);
    frame = requestAnimationFrame(loop);
  }
  frame = requestAnimationFrame(loop);
  ctx.onDestroy(() => { disposed = true; cancelAnimationFrame(frame); canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', cancel); });
  return { canvas, g, w, h };
}
