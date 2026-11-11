const FOOD = 'assets/visual/arcade/slice-foods-v1.png';
const SAFETY = 'assets/visual/arcade/slice-safety-v1.png';
const NORMAL = [
  { id: 'apple', label: 'Maçã', good: true, atlas: FOOD, frame: 0 }, { id: 'banana', label: 'Banana', good: true, atlas: FOOD, frame: 1 },
  { id: 'orange', label: 'Laranja', good: true, atlas: FOOD, frame: 2 }, { id: 'water', label: 'Água', good: true, atlas: FOOD, frame: 10 },
  { id: 'carrot', label: 'Cenoura', good: true, atlas: FOOD, frame: 6 }, { id: 'helmet', label: 'Capacete', good: true, atlas: SAFETY, frame: 0 },
  { id: 'soda', label: 'Refrigerante', good: false, atlas: FOOD, frame: 12 }, { id: 'chips', label: 'Salgadinho', good: false, atlas: FOOD, frame: 13 },
  { id: 'burger', label: 'Hambúrguer', good: false, atlas: FOOD, frame: 15 }, { id: 'candy', label: 'Doce', good: false, atlas: FOOD, frame: 22 },
  { id: 'bomb', label: 'Bomba', good: false, bomb: true, atlas: SAFETY, frame: 12 },
];

/** Pure seeded round builder. The same challenge RNG yields the same item set on both arenas. */
export function buildSliceRound(rng, level = 1, theme = null) {
  // EDF keeps its selected concepts in the challenge text, while its moving
  // icons remain readable health and safety symbols from the supplied sheets.
  const source = NORMAL.filter(item => item.good);
  const count = Math.min(6, 2 + level + Math.floor(rng() * 2));
  const good = Array.from({ length: Math.max(2, Math.ceil(count * .6)) }, (_, i) => ({ ...source[Math.floor(rng() * source.length)], good: true }));
  const risks = NORMAL.filter(item => !item.good);
  const bad = Array.from({ length: count - good.length }, (_, i) => ({ ...(i === 0 && level > 1 && rng() > .6 ? risks.find(item => item.bomb) : risks[Math.floor(rng() * (risks.length - 1))]), good: false }));
  return { request: theme ? 'Corte apenas os itens ligados ao tema estudado' : 'Corte apenas os hábitos positivos', items: [...good, ...bad], explanation: theme?.questions?.(level)?.[0]?.explanation ?? 'Escolhas seguras e atitudes de cuidado ajudam na prática corporal.' };
}
