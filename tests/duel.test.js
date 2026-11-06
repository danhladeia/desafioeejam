import test from 'node:test';
import assert from 'node:assert/strict';
import { seededRandom } from '../games.js';
import { ROSTER } from '../roster.js';
import {
  createDuel, drawTurn, redrawStudents, redrawStudent, commitTurn, standings, qualifyingStandings,
  leaders, isFinished, parseNames, validateDuel, migrateDuel, DUEL_TURNS,
  saveDuel, loadDuel, loadEnabledGames, saveEnabledGames,
} from '../duel.js';

const GAMES = Array.from({ length: 11 }, (_, i) => `g${i + 1}`);
const braga = Array.from({ length: 20 }, (_, i) => `M${i + 1}`);
const make = (turns = 5, students = { a: ROSTER.a, b: ROSTER.b, m: braga }, games = GAMES) => createDuel({
  turns, games,
  classes: [{ id: 'a', name: '9º A EEJAM', students: students.a }, { id: 'b', name: '9º B EEJAM', students: students.b }, { id: 'm', name: '9º M. Braga', students: students.m }],
});
function play(duel, seed, winner = () => 0) {
  const rng = seededRandom(seed), turns = [];
  while (!isFinished(duel)) {
    const d = drawTurn(duel, rng);
    turns.push(structuredClone(d));
    commitTurn(duel, { scores: [100, 80], winnerSide: winner(d) });
  }
  return turns;
}
function storage(t) {
  const memory = new Map();
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (k) => memory.get(k) ?? null,
    setItem: (k, v) => memory.set(k, v), removeItem: (k) => memory.delete(k),
  } });
  t.after(() => { if (original) Object.defineProperty(globalThis, 'localStorage', original); else delete globalThis.localStorage; });
  return memory;
}
function legacy(duel) {
  const d = structuredClone(duel);
  d.version = 1; delete d.championClassId;
  for (const h of [...d.history, ...(d.current ? [d.current] : [])]) { delete h.isFinal; delete h.refused; }
  return d;
}

test('as listas EEJAM trazem 25 e 22 alunos, sem nomes repetidos', () => {
  assert.equal(ROSTER.a.length, 25); assert.equal(ROSTER.b.length, 22);
  for (const list of Object.values(ROSTER)) assert.equal(new Set(list.map((n) => n.toLowerCase())).size, list.length);
});
test('aceita apenas as quatro durações, três turmas distintas e seleção de jogos não vazia', () => {
  for (const n of DUEL_TURNS) assert.doesNotThrow(() => make(n));
  assert.throws(() => make(7), /5, 10, 15 ou 20/);
  assert.throws(() => make(5, undefined, []), /Selecione ao menos um jogo/);
  assert.throws(() => make(5, undefined, ['g1', 'g1']), /sem repetições/);
  const d = make(); d.classes[1].id = d.classes[0].id;
  assert.throws(() => createDuel(d), /três turmas diferentes/);
});
test('nomes são limpos; faltantes, repetidos e longos são recusados', () => {
  assert.throws(() => make(5, { a: ROSTER.a, b: ROSTER.b, m: [] }), /M\. Braga: informe ao menos um aluno/);
  assert.throws(() => make(5, { a: ROSTER.a, b: ROSTER.b, m: ['João', 'joao'] }), /nome repetido/);
  const r = parseNames('  Ana  Paula \n\n Bia\r\nana paula\nUm nome absurdamente comprido demais');
  assert.deepEqual(r.names.slice(0, 2), ['Ana Paula', 'Bia']);
  assert.deepEqual(r.duplicates, ['ana paula']); assert.equal(r.long.length, 1);
});
test('qualificatórias mantêm diferença de participações <=1, sem par consecutivo, para todas as durações', () => {
  for (const turns of DUEL_TURNS) for (let seed = 1; seed <= 50; seed++) {
    const d = make(turns), rng = seededRandom(seed);
    let lastPair;
    while (d.done < d.turns - 1) {
      const cur = drawTurn(d, rng), pair = cur.sides.map((s) => s.classId).sort().join();
      assert.equal(cur.isFinal, false); assert.notEqual(pair, lastPair);
      assert.notEqual(cur.sides[0].classId, cur.sides[1].classId);
      commitTurn(d, { scores: [1, 0], winnerSide: 0 });
      const counts = Object.values(d.stats).map((s) => s.played);
      assert.ok(Math.max(...counts) - Math.min(...counts) <= 1, `${turns}/${seed}: ${counts}`);
      lastPair = pair;
    }
    const top2 = qualifyingStandings(d).slice(0, 2).map((t) => t.id).sort();
    const final = drawTurn(d, rng);
    assert.equal(final.isFinal, true); assert.equal(final.turn, turns);
    assert.deepEqual(final.sides.map((s) => s.classId).sort(), top2);
    commitTurn(d, { scores: [0, 1], winnerSide: 1 });
    assert.equal(d.history.length, turns);
    assert.equal(Object.values(d.stats).reduce((sum, s) => sum + s.played, 0), turns * 2);
    assert.equal(d.history.filter((h) => h.isFinal).length, 1);
  }
});
test('jogos completam ciclos sem repetir; seleção de um jogo também funciona', () => {
  for (let seed = 1; seed <= 30; seed++) {
    const ids = play(make(20), seed).map((t) => t.gameId);
    assert.equal(new Set(ids.slice(0, 11)).size, 11);
    assert.notEqual(ids[11], ids[10]); assert.equal(new Set(ids.slice(11)).size, 9);
  }
  assert.deepEqual(play(make(5, undefined, ['g3']), 7).map((t) => t.gameId), Array(5).fill('g3'));
});
test('vencedor da final é campeão mesmo com aproveitamento e pontos inferiores', () => {
  const d = make(20), rng = seededRandom(11);
  while (d.done < 19) {
    const cur = drawTurn(d, rng);
    const sideA = cur.sides.findIndex((s) => s.classId === 'a');
    commitTurn(d, { scores: sideA === 1 ? [0, 1000] : [1000, 0], winnerSide: sideA < 0 ? 0 : sideA });
  }
  const qualifying = qualifyingStandings(d), leader = qualifying[0];
  const final = drawTurn(d, rng), winnerSide = final.sides.findIndex((s) => s.classId !== leader.id);
  const champion = final.sides[winnerSide].classId;
  commitTurn(d, { scores: [1, 0], winnerSide });
  assert.equal(d.championClassId, champion);
  assert.equal(standings(d)[0].id, champion);
  assert.equal(standings(d)[1].id, leader.id);
  assert.deepEqual(leaders(d).map((t) => t.id), [champion]);
  assert.deepEqual(qualifyingStandings(d), qualifying);
  assert.ok(d.stats[leader.id].wins > d.stats[champion].wins);
  assert.equal(validateDuel(d), true);
});
test('alunos nunca se repetem, inclusive na final e após restauração', () => {
  for (const turns of DUEL_TURNS) for (let seed = 1; seed <= 30; seed++) {
    let d = make(turns), rng = seededRandom(seed);
    while (!isFinished(d)) {
      const cur = drawTurn(d, rng);
      for (const s of cur.sides) assert.ok(!d.used[s.classId].includes(s.student));
      commitTurn(d, { scores: [4, 3], winnerSide: 0 });
      d = migrateDuel(JSON.parse(JSON.stringify(d)));
    }
    for (const c of d.classes) {
      const used = d.history.flatMap((h) => h.sides).filter((s) => s.classId === c.id).map((s) => s.student);
      assert.equal(new Set(used).size, used.length); assert.deepEqual(d.used[c.id], used);
    }
  }
});
test('esgotamento interrompe o sorteio sem limpar usados, trocar par ou reciclar alunos', () => {
  const d = make(5, { a: ['A'], b: ['B'], m: ['M'] });
  drawTurn(d, seededRandom(3)); commitTurn(d, { scores: [1, 0], winnerSide: 0 });
  const snapshot = structuredClone(d);
  assert.throws(() => drawTurn(d), /não há alunos inéditos.*novo duelo/);
  assert.deepEqual(d, snapshot); assert.equal(d.current, null);
});
test('drawTurn idempotente não substitui sorteio pendente nem consome alunos', () => {
  const d = make(), cur = drawTurn(d, seededRandom(1));
  assert.equal(drawTurn(d, seededRandom(3)), cur);
  assert.ok(Object.values(d.used).every((list) => list.length === 0));
});
test('final também interrompe se uma finalista já utilizou todos os seus alunos', () => {
  let found = false;
  for (let seed = 1; seed <= 30 && !found; seed++) {
    const d = make(5, { a: ['A1', 'A2', 'A3'], b: ['B1', 'B2', 'B3'], m: ['M1', 'M2', 'M3'] });
    const rng = seededRandom(seed);
    while (d.done < 4) {
      const cur = drawTurn(d, rng), sideA = cur.sides.findIndex((s) => s.classId === 'a');
      commitTurn(d, { scores: [100, 0], winnerSide: sideA < 0 ? 0 : sideA });
    }
    const exhausted = qualifyingStandings(d).slice(0, 2).some((c) => d.used[c.id].length === 3);
    if (exhausted) {
      const snapshot = structuredClone(d);
      assert.throws(() => drawTurn(d, rng), /não há alunos inéditos/);
      assert.deepEqual(d, snapshot); found = true;
    }
  }
  assert.equal(found, true);
});
test('troca individual preserva jogo, turmas e outro aluno; recusados não voltam na rodada', () => {
  let d = make(5, { a: ['A1', 'A2', 'A3'], b: ['B1', 'B2', 'B3'], m: ['M1', 'M2', 'M3'] });
  const before = structuredClone(drawTurn(d, () => 0));
  const refused = [before.sides[0].student];
  redrawStudent(d, 0, () => 0);
  refused.push(d.current.sides[0].student);
  d = migrateDuel(JSON.parse(JSON.stringify(d)));
  redrawStudents(d, () => 0, 0);
  assert.equal(d.current.gameId, before.gameId);
  assert.deepEqual(d.current.sides[1], before.sides[1]);
  assert.ok(!refused.includes(d.current.sides[0].student));
  assert.deepEqual(d.current.refused[0], refused);
  assert.ok(Object.values(d.used).every((list) => list.length === 0));
  const snapshot = structuredClone(d);
  assert.throws(() => redrawStudent(d, 0), /após as recusas/);
  assert.deepEqual(d, snapshot);
  commitTurn(d, { scores: [3, 4], winnerSide: 1 });
  assert.deepEqual(d.used[before.sides[0].classId], [snapshot.current.sides[0].student]);
});
test('redrawStudents antigo troca ambos atomicamente e a sobrecarga aceita índice', () => {
  const d = make(), before = structuredClone(drawTurn(d, seededRandom(2)));
  redrawStudents(d, seededRandom(4));
  d.current.sides.forEach((s, i) => { assert.equal(s.classId, before.sides[i].classId); assert.notEqual(s.student, before.sides[i].student); });
  const other = structuredClone(d.current.sides[0]);
  redrawStudents(d, 1); assert.deepEqual(d.current.sides[0], other);
  assert.throws(() => redrawStudent(d, 2), /Lado inválido/);
  const tiny = make(5, { a: ['A'], b: ['B'], m: ['M'] }); drawTurn(tiny, () => 0);
  const copy = structuredClone(tiny);
  assert.throws(() => redrawStudents(tiny), /não há alunos inéditos/); assert.deepEqual(tiny, copy);
});
test('classificação das qualificatórias usa aproveitamento, vitórias e pontos; empate é determinístico', () => {
  const d = make();
  Object.assign(d.stats.a, { wins: 2, played: 3, points: 20 });
  Object.assign(d.stats.m, { wins: 2, played: 4, points: 20 });
  Object.assign(d.stats.b, { wins: 1, played: 3, points: 10 });
  assert.deepEqual(standings(d).map((t) => t.id), ['a', 'm', 'b']);
  for (const st of Object.values(d.stats)) Object.assign(st, { wins: 2, played: 3, points: 100 });
  assert.equal(leaders(d).length, 3);
  assert.deepEqual(standings(d).map((t) => t.id), qualifyingStandings(d).map((t) => t.id));
});
test('confirmação valida resultado e bloqueia aluno já utilizado sem mutação parcial', () => {
  const d = make();
  assert.throws(() => commitTurn(d, { scores: [1, 2], winnerSide: 0 }), /Não há rodada/);
  drawTurn(d, seededRandom(1));
  assert.throws(() => commitTurn(d, { scores: [1, 2], winnerSide: 2 }), /Vencedor inválido/);
  assert.throws(() => commitTurn(d, { scores: [1, NaN], winnerSide: 0 }), /Pontuação inválida/);
  commitTurn(d, { scores: [5, 3], winnerSide: 0 });
  assert.equal(d.done, 1);
  assert.throws(() => commitTurn(d, { scores: [5, 3], winnerSide: 0 }), /Não há rodada/);
  const rng = seededRandom(4);
  while (d.done < 3) { drawTurn(d, rng); commitTurn(d, { scores: [1, 0], winnerSide: 0 }); }
  drawTurn(d, rng);
  const s = d.current.sides.find((s) => d.used[s.classId].length);
  s.student = d.used[s.classId][0];
  const snapshot = structuredClone(d);
  assert.throws(() => commitTurn(d, { scores: [1, 0], winnerSide: 0 }), /já jogou/);
  assert.deepEqual(d, snapshot);
});
test('última rodada é única, não permite novo sorteio e sobrevive ao salvamento', (t) => {
  storage(t); const d = make(); play(d, 9);
  assert.throws(() => drawTurn(d), /já terminou/);
  assert.equal(saveDuel(d), true); assert.deepEqual(loadDuel(), d);
  assert.equal(validateDuel({ ...d, turns: 8 }), false); assert.equal(validateDuel(null), false);
});
test('seleção de jogos persiste separadamente e no duelo; não permite seleção vazia', (t) => {
  storage(t);
  assert.deepEqual(loadEnabledGames(GAMES), GAMES);
  assert.equal(saveEnabledGames(['g2', 'g4']), true);
  assert.equal(saveEnabledGames([]), false);
  assert.deepEqual(loadEnabledGames(GAMES), ['g2', 'g4']);
  assert.deepEqual(loadEnabledGames(['g4']), ['g4']);
  const d = make(10, undefined, ['g2', 'g4']); play(d, 8);
  assert.equal(saveDuel(d), true); assert.deepEqual(loadDuel().games, ['g2', 'g4']);
  assert.ok(d.history.every((h) => ['g2', 'g4'].includes(h.gameId)));
});
test('versão 1 válida migra histórico e sorteio pendente, reconstruindo usados sem alterar original', (t) => {
  const memory = storage(t), d = make(), rng = seededRandom(7);
  for (let i = 0; i < 3; i++) { drawTurn(d, rng); commitTurn(d, { scores: [1, 0], winnerSide: 0 }); }
  drawTurn(d, rng);
  const old = legacy(d), snapshot = structuredClone(old);
  for (const id of Object.keys(old.used)) old.used[id] = []; // Estado antigo perdeu os usados, histórico é a fonte.
  const raw = JSON.stringify(old); memory.set('eejam-duel-v1', raw);
  const restored = loadDuel();
  assert.equal(restored.version, 2); assert.deepEqual(restored.used, d.used);
  assert.deepEqual(restored.current.sides, snapshot.current.sides);
  assert.equal(memory.get('eejam-duel-v1'), raw);
  assert.equal(validateDuel(old), true);
});
test('versão 1 completa compatível migra campeão pela final; final incompatível é rejeitada', () => {
  const d = make(); play(d, 4);
  const old = legacy(d), migrated = migrateDuel(old);
  assert.equal(migrated.championClassId, d.history.at(-1).winnerClassId);
  const outsider = d.classes.find((c) => !old.history.at(-1).sides.some((s) => s.classId === c.id));
  old.history.at(-1).sides[0] = { classId: outsider.id, className: outsider.name, student: outsider.students.at(-1) };
  assert.throws(() => migrateDuel(old), /duas primeiras/);
});
test('dados antigos repetidos, truncados ou corrompidos são preservados com erro explícito', (t) => {
  const memory = storage(t), d = make(); play(d, 5);
  const variants = ['{', JSON.stringify({ ...legacy(d), history: [] }), JSON.stringify({ ...d, stats: {} })];
  const repeat = legacy(d);
  const first = repeat.history[0].sides[0];
  const later = repeat.history.slice(1).flatMap((h) => h.sides).find((s) => s.classId === first.classId);
  later.student = first.student; variants.push(JSON.stringify(repeat));
  for (const raw of variants) {
    memory.set('eejam-duel-v1', raw);
    assert.throws(() => loadDuel(), /foi preservado/);
    assert.equal(memory.get('eejam-duel-v1'), raw);
  }
});
test('versão 2 recusa divergências no placar, final, usados e recusas', () => {
  const d = make(); play(d, 2);
  const changes = [
    (x) => x.stats.a.wins++, (x) => x.used.a.pop(), (x) => x.championClassId = null,
    (x) => x.history.at(-1).isFinal = false, (x) => x.games = [],
  ];
  for (const change of changes) { const copy = structuredClone(d); change(copy); assert.equal(validateDuel(copy), false); }
  const pending = make(); drawTurn(pending, () => 0);
  pending.current.refused[0].push(pending.current.sides[0].student);
  assert.equal(validateDuel(pending), false);
});
