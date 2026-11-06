// Regras do duelo independentes da tela. A última rodada é a final.
export const DUEL_TURNS = [5, 10, 15, 20];
export const DUEL_CLASSES = [
  { id: 'a', name: '9º A EEJAM', short: '9º A' },
  { id: 'b', name: '9º B EEJAM', short: '9º B' },
  { id: 'm', name: '9º M. Braga', short: 'M. Braga' },
];
const DUEL_KEY = 'eejam-duel-v1'; // Mantém acesso aos dados das versões anteriores.
const BRAGA_KEY = 'eejam-braga-v1';
const GAMES_KEY = 'eejam-duel-games-v1';
const MAX_NAME = 24, MAX_STUDENTS = 60;
const norm = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const pick = (list, rng) => list[Math.min(list.length - 1, Math.max(0, Math.floor(rng() * list.length)))];
const pairKey = (pair) => [...pair].sort().join('-');
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const validId = (id) => typeof id === 'string' && /^[a-z0-9_-]+$/i.test(id) && !['__proto__', 'constructor', 'prototype'].includes(id);

export function parseNames(text) {
  const names = String(text ?? '').split(/\r?\n/).map((n) => n.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const seen = new Set(), duplicates = [];
  for (const n of names) {
    const k = norm(n);
    if (seen.has(k) && !duplicates.includes(n)) duplicates.push(n);
    seen.add(k);
  }
  return { names, duplicates, long: names.filter((n) => n.length > MAX_NAME), tooMany: names.length > MAX_STUDENTS };
}
export function createDuel({ turns, classes, games }) {
  if (!DUEL_TURNS.includes(turns)) throw new Error('Escolha 5, 10, 15 ou 20 rodadas.');
  if (!Array.isArray(classes) || classes.length !== 3 || classes.some((c) => !c || !validId(c.id) || typeof c.name !== 'string' || !c.name.trim()) || new Set(classes.map((c) => c.id)).size !== 3) throw new Error('O duelo precisa de três turmas diferentes.');
  if (!Array.isArray(games) || !games.length || games.some((g) => !validId(g)) || new Set(games).size !== games.length) throw new Error('Selecione ao menos um jogo válido, sem repetições.');
  const clean = classes.map((c) => {
    if (!Array.isArray(c.students) || c.students.some((s) => typeof s !== 'string')) throw new Error(`${c.name}: lista de alunos inválida.`);
    const { names, duplicates, long, tooMany } = parseNames(c.students.join('\n'));
    if (!names.length) throw new Error(`${c.name}: informe ao menos um aluno.`);
    if (duplicates.length) throw new Error(`${c.name}: nome repetido (${duplicates.join(', ')}). Acrescente a inicial do sobrenome.`);
    if (long.length) throw new Error(`${c.name}: nome muito longo (${long[0]}).`);
    if (tooMany) throw new Error(`${c.name}: no máximo ${MAX_STUDENTS} alunos.`);
    return { id: c.id, name: c.name, students: names };
  });
  const ids = clean.map((c) => c.id);
  return {
    version: 2, createdAt: Date.now(), turns, done: 0, classes: clean, games: [...games],
    usedGames: [], lastGame: null, used: Object.fromEntries(ids.map((id) => [id, []])),
    lastPair: null, current: null, history: [], championClassId: null,
    stats: Object.fromEntries(ids.map((id) => [id, { wins: 0, played: 0, points: 0 }])),
  };
}
export const isFinished = (duel) => duel.done >= duel.turns;
const rate = (t) => t.played ? t.wins / t.played : 0;
const compare = (a, b) => rate(b) - rate(a) || b.wins - a.wins || b.points - a.points || a.name.localeCompare(b.name, 'pt-BR') || a.id.localeCompare(b.id);

/** Aproveitamento, vitórias, pontos e nome definem a classificação para a final. */
export function qualifyingStandings(duel) {
  const stats = Object.fromEntries(duel.classes.map((c) => [c.id, { ...duel.stats[c.id] }]));
  const final = duel.history.find((h) => h.isFinal);
  if (final) final.sides.forEach((s, i) => {
    stats[s.classId].played--;
    stats[s.classId].points -= final.scores[i];
    if (i === final.winnerSide) stats[s.classId].wins--;
  });
  return duel.classes.map((c) => ({ id: c.id, name: c.name, short: DUEL_CLASSES.find((x) => x.id === c.id)?.short ?? c.name, ...stats[c.id] })).sort(compare);
}
/** Depois da final, campeão e vice ocupam os dois primeiros lugares. */
export function standings(duel) {
  const table = duel.classes.map((c) => ({ id: c.id, name: c.name, short: DUEL_CLASSES.find((x) => x.id === c.id)?.short ?? c.name, ...duel.stats[c.id] })).sort(compare);
  if (!duel.championClassId) return table;
  const final = duel.history.find((h) => h.isFinal);
  const order = [duel.championClassId, final.sides[1 - final.winnerSide].classId];
  return table.sort((a, b) => (order.includes(a.id) ? order.indexOf(a.id) : 2) - (order.includes(b.id) ? order.indexOf(b.id) : 2));
}
export function leaders(duel) {
  const table = standings(duel);
  if (duel.championClassId) return table.filter((t) => t.id === duel.championClassId);
  return table.filter((t) => rate(t) === rate(table[0]) && t.wins === table[0].wins && t.points === table[0].points);
}
function pickStudent(duel, classId, rng, refused = []) {
  const c = duel.classes.find((x) => x.id === classId);
  const avail = c.students.filter((s) => !duel.used[classId].includes(s) && !refused.includes(s));
  if (!avail.length) throw new Error(`${c.name}: não há alunos inéditos disponíveis${refused.length ? ' após as recusas desta rodada' : ''}. Confira a lista e inicie um novo duelo com mais alunos ou menos rodadas. Nenhum aluno será repetido.`);
  return pick(avail, rng);
}
function gamePool(duel) {
  let pool = duel.games.filter((g) => !duel.usedGames.includes(g));
  if (!pool.length) pool = [...duel.games];
  const other = pool.filter((g) => g !== duel.lastGame);
  return other.length ? other : pool;
}
function qualifyingPairs(duel) {
  const ids = duel.classes.map((c) => c.id);
  const pairs = [[ids[0], ids[1]], [ids[0], ids[2]], [ids[1], ids[2]]];
  const load = pairs.map(([a, b]) => duel.stats[a].played + duel.stats[b].played);
  let candidates = pairs.filter((_, i) => load[i] === Math.min(...load));
  const other = candidates.filter((p) => pairKey(p) !== duel.lastPair);
  if (other.length) candidates = other;
  return candidates;
}
export function drawTurn(duel, rng = Math.random) {
  if (isFinished(duel)) throw new Error('O duelo já terminou.');
  if (duel.current) return duel.current;
  const isFinal = duel.done === duel.turns - 1;
  let pair = isFinal ? qualifyingStandings(duel).slice(0, 2).map((t) => t.id) : pick(qualifyingPairs(duel), rng);
  if (rng() < 0.5) pair = [pair[1], pair[0]];
  const sides = pair.map((classId) => ({ classId, className: duel.classes.find((c) => c.id === classId).name, student: pickStudent(duel, classId, rng) }));
  const gameId = pick(gamePool(duel), rng);
  duel.current = { turn: duel.done + 1, gameId, sides, isFinal, refused: [[], []] };
  return duel.current;
}
/** Compatível com redrawStudents(duel, rng); o terceiro argumento limita a troca a um lado. */
export function redrawStudents(duel, rng = Math.random, sideIndex) {
  if (typeof rng === 'number') { sideIndex = rng; rng = Math.random; }
  if (!duel.current) throw new Error('Não há rodada sorteada.');
  if (sideIndex !== undefined && sideIndex !== 0 && sideIndex !== 1) throw new Error('Lado inválido.');
  const cur = duel.current;
  const refused = (cur.refused ?? [[], []]).map((list) => [...list]);
  const sides = cur.sides.map((s, i) => {
    if (sideIndex !== undefined && sideIndex !== i) return s;
    refused[i] = [...new Set([...refused[i], s.student])];
    return { ...s, student: pickStudent(duel, s.classId, rng, refused[i]) };
  });
  Object.assign(cur, { sides, refused });
  return cur;
}
export const redrawStudent = (duel, sideIndex, rng = Math.random) => redrawStudents(duel, rng, sideIndex);
function checkCurrent(duel, cur, legacy = false) {
  if (!cur || cur.turn !== duel.done + 1 || !duel.games.includes(cur.gameId) || !gamePool(duel).includes(cur.gameId) || !Array.isArray(cur.sides) || cur.sides.length !== 2) throw new Error('Sorteio salvo inválido.');
  const isFinal = cur.turn === duel.turns;
  if ((!legacy || cur.isFinal !== undefined) && cur.isFinal !== isFinal) throw new Error('A última rodada precisa ser a final.');
  const ids = cur.sides.map((s) => s?.classId);
  if (new Set(ids).size !== 2) throw new Error('Uma turma não pode jogar contra ela mesma.');
  if (isFinal && pairKey(ids) !== pairKey(qualifyingStandings(duel).slice(0, 2).map((t) => t.id))) throw new Error('A final salva não reúne as duas primeiras turmas da classificação.');
  if (!isFinal) {
    const counts = duel.classes.map((c) => duel.stats[c.id].played + (ids.includes(c.id) ? 1 : 0));
    if (Math.max(...counts) - Math.min(...counts) > 1) throw new Error('As participações das turmas nas classificatórias estão desequilibradas.');
  }
  const refused = cur.refused ?? [[], []];
  if (!Array.isArray(refused) || refused.length !== 2) throw new Error('Lista de recusas inválida.');
  const sides = cur.sides.map((s, i) => {
    const c = duel.classes.find((c) => c.id === s.classId);
    if (!c || c.name !== s.className || !c.students.includes(s.student) || duel.used[c.id].includes(s.student)) throw new Error('O sorteio salvo contém aluno inválido ou que já jogou.');
    if (!Array.isArray(refused[i]) || new Set(refused[i]).size !== refused[i].length || refused[i].some((n) => !c.students.includes(n) || duel.used[c.id].includes(n)) || refused[i].includes(s.student)) throw new Error('Lista de recusas inválida.');
    return { ...s };
  });
  return { turn: cur.turn, gameId: cur.gameId, sides, isFinal, refused: refused.map((r) => [...r]) };
}
export function commitTurn(duel, { scores, winnerSide }) {
  if (!duel.current) throw new Error('Não há rodada para confirmar.');
  if (isFinished(duel)) throw new Error('O duelo já terminou.');
  if (winnerSide !== 0 && winnerSide !== 1) throw new Error('Vencedor inválido.');
  if (!Array.isArray(scores) || scores.length !== 2 || scores.some((n) => !Number.isFinite(n))) throw new Error('Pontuação inválida.');
  const cur = checkCurrent(duel, duel.current);
  const entry = { ...cur, scores: [...scores], winnerSide, winnerClassId: cur.sides[winnerSide].classId };
  cur.sides.forEach((s, i) => {
    const st = duel.stats[s.classId];
    st.played++; st.points += scores[i];
    if (i === winnerSide) st.wins++;
    duel.used[s.classId].push(s.student);
  });
  duel.usedGames.push(cur.gameId);
  if (duel.usedGames.length >= duel.games.length) duel.usedGames = [];
  duel.lastGame = cur.gameId;
  duel.lastPair = pairKey(cur.sides.map((s) => s.classId));
  duel.history.push(entry);
  duel.current = null;
  duel.done++;
  if (cur.isFinal) duel.championClassId = entry.winnerClassId;
  return entry;
}
/** Reconstitui todo o histórico antes de aceitar uma versão 1 ou 2. Não altera o original. */
export function migrateDuel(saved) {
  if (!saved || ![1, 2].includes(saved.version)) throw new Error('Versão do duelo salvo não reconhecida.');
  const d = createDuel(saved);
  if (!Number.isInteger(saved.done) || saved.done < 0 || saved.done > saved.turns || !Array.isArray(saved.history) || saved.history.length !== saved.done || !saved.stats || !saved.used) throw new Error('Histórico do duelo salvo incompleto.');
  if (!Number.isFinite(saved.createdAt)) throw new Error('Data do duelo salvo inválida.');
  d.createdAt = saved.createdAt;
  for (const h of saved.history) {
    d.current = checkCurrent(d, h, saved.version === 1);
    const entry = commitTurn(d, h);
    if (h.winnerClassId !== entry.winnerClassId) throw new Error('Vencedor salvo não confere com o resultado.');
  }
  for (const c of d.classes) {
    const st = saved.stats[c.id], actual = d.stats[c.id];
    if (!st || ['wins', 'played', 'points'].some((k) => st[k] !== actual[k])) throw new Error('Placar salvo não confere com o histórico.');
    if (!Array.isArray(saved.used[c.id]) || saved.used[c.id].some((n) => !c.students.includes(n))) throw new Error('Lista de participações salva inválida.');
    if (saved.version === 2 && !same(saved.used[c.id], d.used[c.id])) throw new Error('Lista de participações não confere com o histórico.');
  }
  if (saved.version === 2 && (saved.championClassId !== d.championClassId || !same(saved.usedGames, d.usedGames) || saved.lastPair !== d.lastPair || saved.lastGame !== d.lastGame)) throw new Error('Estado salvo não confere com o histórico.');
  if (saved.current != null) {
    if (isFinished(d)) throw new Error('Duelo terminado contém rodada pendente.');
    d.current = checkCurrent(d, saved.current, saved.version === 1);
  }
  return d;
}
export function validateDuel(d) { try { migrateDuel(d); return true; } catch { return false; } }
const read = (key) => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } };
export function saveDuel(duel) { try { return write(DUEL_KEY, migrateDuel(duel)); } catch { return false; } }
export function loadDuel() {
  let raw;
  try { raw = localStorage.getItem(DUEL_KEY); } catch { return null; }
  if (!raw) return null;
  try { return migrateDuel(JSON.parse(raw)); }
  catch (e) { throw new Error(`O duelo salvo foi preservado, mas não pode continuar: ${e.message} Confira o backup ou escolha explicitamente um novo duelo.`); }
}
export function clearDuel() { try { localStorage.removeItem(DUEL_KEY); } catch { /* sem armazenamento */ } }
export function loadBraga() { const list = read(BRAGA_KEY); return Array.isArray(list) ? list.filter((n) => typeof n === 'string') : []; }
export const saveBraga = (names) => write(BRAGA_KEY, names);
export function loadEnabledGames(available) {
  const saved = read(GAMES_KEY);
  return Array.isArray(saved) ? [...new Set(saved.filter((id) => available.includes(id)))] : [...available];
}
export function saveEnabledGames(games) {
  if (!Array.isArray(games) || !games.length || games.some((g) => !validId(g))) return false;
  return write(GAMES_KEY, [...new Set(games)]);
}
