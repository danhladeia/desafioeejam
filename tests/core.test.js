import test from 'node:test';
import assert from 'node:assert/strict';
import { createTournament, createTeamTournament, nextMatch, recordResult, undoResult, validateTournament,
  getChampion, getPlayer, saveTournament, loadTournament, deleteTournament } from '../core.js';

const clone = value => JSON.parse(JSON.stringify(value));
const names = count => Array.from({ length: count }, (_, index) => `Player ${index + 1}`);
const teams = count => Array.from({ length: count }, (_, index) => ({
  name: `Equipe ${index + 1}`, members: [`João ${index + 1}`, `Lúcia ${index + 1}`],
}));
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function replaceGlobal(context, key, value) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, key);
  Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  context.after(() => {
    if (previous) Object.defineProperty(globalThis, key, previous);
    else delete globalThis[key];
  });
}

function win(t, match = nextMatch(t), side = 'a') {
  return recordResult(t, match.id, { winnerId: match[side],
    scores: side === 'a' ? { a: 3, b: 1 } : { a: 1, b: 3 }, gameId: 'quiz', seed: 42 });
}

for (const count of [2, 3, 5, 8, 16, 17, 32, 64]) {
  test(`${count} players: exactly N-1 unique matches and a valid champion`, () => {
    const input = names(count);
    const original = [...input];
    const t = createTournament(input, '  Cup  ');
    assert.deepEqual(input, original);
    assert.equal(t.title, 'Cup');
    assert.equal(t.version, 1);
    assert.equal(t.status, 'active');
    assert.equal(t.rounds.length, Math.ceil(Math.log2(count)));
    assert.equal(t.rounds.flat().length, count - 1);
    const allIds = [t.id, ...t.players.map(player => player.id), ...t.rounds.flat().map(match => match.id)];
    assert.equal(new Set(allIds).size, allIds.length);
    assert.ok(allIds.every(id => uuidPattern.test(id)));
    assert.equal(getChampion(t), null);
    const playerIds = new Set(t.players.map(player => player.id));
    const initialIds = t.rounds.map(round => round.map(match => match.id));
    const played = new Set();
    let match;
    while ((match = nextMatch(t))) {
      assert.ok(playerIds.has(match.a));
      assert.ok(playerIds.has(match.b));
      assert.notEqual(match.a, match.b);
      assert.ok(!played.has(match.id));
      played.add(match.id);
      const winnerId = match.a;
      assert.equal(win(t, match), t);
      const completed = t.rounds.flat().find(item => item.id === match.id);
      assert.equal(completed.winnerId, winnerId);
      assert.equal(completed.status, 'completed');
      assert.equal(validateTournament(clone(t)), true);
    }
    assert.equal(played.size, count - 1);
    assert.equal(t.history.length, count - 1);
    assert.equal(t.status, 'completed');
    assert.ok(playerIds.has(getChampion(t).id));
    assert.equal(getChampion(t).id, t.rounds.at(-1)[0].winnerId);
    assert.deepEqual(t.rounds.map(round => round.map(item => item.id)), initialIds);
    for (const [round, matches] of t.rounds.entries()) {
      for (const [index, item] of matches.entries()) {
        assert.equal(item.round, round);
        assert.equal(item.index, index);
      }
    }
  });
}

test('all permitted sizes construct valid, deterministic bye slots', () => {
  for (let count = 2; count <= 64; count++) {
    const t = createTournament(names(count));
    const before = clone(t);
    assert.equal(validateTournament(t), true);
    assert.deepEqual(t, before);
    const appearances = t.rounds.flat().flatMap(match => [match.a, match.b]).filter(Boolean);
    assert.equal(appearances.length, count);
    assert.equal(new Set(appearances).size, count);
    assert.equal(t.rounds.flat().length, count - 1);
    const ready = t.rounds.flat().filter(match => match.status === 'ready');
    assert.ok(ready.length > 0);
    assert.ok(t.rounds.flat().every(match => match.status !== 'completed'));
    while (nextMatch(t)) win(t);
    assert.equal(t.history.length, count - 1);
  }
});

test('duplicate names retain independent stable player IDs', () => {
  const t = createTournament(['Alex', 'Alex', ' Alex '], 'Duplicates');
  assert.deepEqual(t.players.map(player => player.displayName), ['Alex', 'Alex', 'Alex']);
  assert.equal(new Set(t.players.map(player => player.id)).size, 3);
  const player = t.players[0];
  assert.equal(getPlayer(t, player.id), player);
  assert.equal(getPlayer(t, 'missing'), null);
  assert.equal(getPlayer(t, 'Alex'), null);
  while (nextMatch(t)) win(t);
  assert.equal(getChampion(t).displayName, 'Alex');
  assert.equal(getPlayer(t, player.id), player);
});

test('invalid creation inputs are rejected', () => {
  for (const input of [null, {}, 'A,B', [], ['A'], names(65), ['A', ''], ['A', '  '], ['A', 3], Array(2)]) {
    assert.throws(() => createTournament(input), TypeError);
  }
  for (const title of ['', '  ', null, 4]) assert.throws(() => createTournament(names(2), title), TypeError);
});

test('individual tournaments retain exactly the original schema', () => {
  const t = createTournament(['João', 'João']);
  assert.deepEqual(Object.keys(t).sort(),
    ['version', 'id', 'title', 'createdAt', 'status', 'players', 'rounds', 'history'].sort());
  assert.equal(Object.hasOwn(t, 'teams'), false);
  assert.equal(validateTournament(clone(t)), true);
  win(t);
  undoResult(t);
  assert.equal(Object.hasOwn(t, 'teams'), false);
});

test('team creation copies accented rosters and assigns one stable entrant per team', () => {
  const input = [
    { name: '  Ação e União  ', members: ['  João  ', 'Márcia', 'Á'.repeat(40)] },
    { name: 'Fênix', members: ['João', 'Ana'] },
    { name: 'São José', members: ['Luísa'] },
  ];
  const before = clone(input);
  const t = createTeamTournament(input, '  Copa das Equipes  ');
  assert.deepEqual(input, before);
  assert.equal(t.title, 'Copa das Equipes');
  assert.equal(t.players.length, input.length);
  assert.equal(t.rounds.flat().length, input.length - 1);
  assert.equal(new Set(t.teams.map(team => team.playerId)).size, input.length);
  const roster = clone(t.teams);
  for (const [index, team] of t.teams.entries()) {
    assert.deepEqual(team.members, input[index].members.map(member => member.trim()));
    assert.equal(team.name, input[index].name.trim());
    assert.deepEqual(getPlayer(t, team.playerId), { id: team.playerId, displayName: team.name });
  }
  input[0].name = 'Changed';
  input[0].members[0] = 'Changed';
  input[1].members.push('Changed');
  assert.deepEqual(t.teams, roster);
  while (nextMatch(t)) win(t);
  assert.deepEqual(t.teams, roster);
  assert.equal(t.history.length, input.length - 1);
  assert.equal(t.teams.find(team => team.playerId === getChampion(t).id).name,
    getChampion(t).displayName);
  assert.equal(validateTournament(t), true);
});

test('team tournaments support byes and up to 64 teams independently of roster size', () => {
  for (const count of [2, 3, 5, 17, 32, 64]) {
    const t = createTeamTournament(teams(count));
    assert.equal(t.title, 'Torneio');
    assert.equal(t.players.length, count);
    assert.equal(t.rounds.flat().length, count - 1);
    assert.equal(validateTournament(t), true);
    while (nextMatch(t)) win(t);
    assert.equal(t.history.length, count - 1);
    assert.equal(t.status, 'completed');
  }
});

test('team creation rejects malformed rosters and normalized duplicate names', () => {
  const invalid = [null, {}, [], teams(1), teams(65), Array(2),
    [null, teams(2)[1]], [{ name: 'A', members: [] }, teams(2)[1]],
    [{ name: ' ', members: ['Ana'] }, teams(2)[1]],
    [{ name: 1, members: ['Ana'] }, teams(2)[1]],
    [{ name: 'A', members: 'Ana' }, teams(2)[1]],
    [{ name: 'A', members: Array(1) }, teams(2)[1]],
    ...['', '  ', 1, null, {}, 'a'.repeat(41)].map(member =>
      [{ name: 'A', members: [member] }, teams(2)[1]]),
    [{ name: 'A', members: ['João', ' joao '] }, teams(2)[1]],
    [{ name: 'A', members: ['Ana Maria', 'ANA  MARIA'] }, teams(2)[1]],
    [{ name: 'A', members: ['José', 'Jose\u0301'] }, teams(2)[1]],
    [{ name: 'São José', members: ['Ana'] }, { name: ' sao  jose ', members: ['Bia'] }],
    [{ name: 'A', members: ['Ana'], representative: 'Ana' }, teams(2)[1]],
    [{ name: 'A' }, teams(2)[1]],
  ];
  for (const input of invalid) assert.throws(() => createTeamTournament(input), TypeError);
  for (const title of ['', '  ', null, 4]) {
    assert.throws(() => createTeamTournament(teams(2), title), TypeError);
  }
});

test('team JSON backups preserve rosters through every undo and replay', () => {
  let t = createTeamTournament(teams(5), 'Copa São João');
  const snapshots = [clone(t)];
  while (nextMatch(t)) {
    win(t, nextMatch(t), t.history.length % 2 ? 'b' : 'a');
    snapshots.push(clone(t));
  }
  for (let length = t.history.length; length > 0; length--) {
    const backup = JSON.parse(JSON.stringify({ format: 'eejam-1', tournament: t }));
    t = backup.tournament;
    assert.equal(validateTournament(t), true);
    const result = clone(t.history.at(-1));
    assert.equal(undoResult(t), t);
    assert.deepEqual(t, snapshots[length - 1]);
    recordResult(t, result.matchId, { winnerId: result.winnerId, scores: result.scores,
      gameId: result.gameId, seed: result.seed });
    assert.deepEqual(t, snapshots[length]);
    undoResult(t);
  }
  assert.equal(undoResult(t), t);
  assert.deepEqual(t, snapshots[0]);
});

test('strict team backup validation requires complete coherent rosters without repairing them', () => {
  const t = createTeamTournament(teams(3));
  win(t);
  const mutations = [
    x => { x.teams = null; }, x => { x.teams = undefined; }, x => { x.teams = {}; },
    x => { x.teams = []; }, x => { x.teams.pop(); }, x => { x.teams.push(clone(x.teams[0])); },
    x => { delete x.teams[0]; }, x => { x.teams.extra = true; },
    x => { x.teams[0] = null; }, x => { x.teams[0].extra = true; },
    x => { delete x.teams[0].playerId; }, x => { delete x.teams[0].name; },
    x => { delete x.teams[0].members; },
    x => { x.teams[0].playerId = x.teams[1].playerId; },
    x => { x.teams[0].playerId = x.id; },
    x => { x.teams[0].playerId = x.rounds[0][0].id; },
    x => { x.teams[0].name = x.teams[1].name; },
    x => { x.teams[0].name = ` ${x.teams[0].name} `; },
    x => { x.teams[0].name = 12; },
    x => {
      x.teams[1].name = x.teams[0].name.toUpperCase();
      x.players.find(player => player.id === x.teams[1].playerId).displayName = x.teams[1].name;
    },
    x => {
      x.teams[0].name = 'São José';
      x.teams[1].name = 'sao  jose';
      for (const team of x.teams) x.players.find(player => player.id === team.playerId).displayName = team.name;
    },
    ...[null, {}, 'Ana', [], [''], ['  '], [' Ana'], ['Ana '], [12], ['a'.repeat(41)],
      ['João', 'JOAO'], ['Ana Maria', 'Ana  Maria'], ['José', 'Jose\u0301']].map(members =>
      x => { x.teams[0].members = members; }),
    x => { delete x.teams[0].members[0]; },
    x => { x.teams[0].members.extra = true; },
  ];
  for (const mutate of mutations) {
    const invalid = clone(t);
    mutate(invalid);
    const before = structuredClone(invalid);
    assert.throws(() => validateTournament(invalid), TypeError, mutate.toString());
    assert.throws(() => undoResult(invalid), TypeError, mutate.toString());
    assert.deepEqual(invalid, before);
  }
  // Coherence follows stable IDs, independently of roster array order.
  const reordered = clone(t);
  reordered.teams.reverse();
  assert.equal(validateTournament(reordered), true);
});

test('shuffle uses crypto on a copied list and rejects unavailable crypto', context => {
  const crypto = globalThis.crypto;
  let draws = 0;
  replaceGlobal(context, 'crypto', {
    randomUUID: () => crypto.randomUUID(),
    getRandomValues(buffer) { draws++; buffer.fill(0); return buffer; },
  });
  const input = ['A', 'B', 'C', 'D'];
  const t = createTournament(input);
  assert.deepEqual(t.players.map(player => player.displayName), ['B', 'C', 'D', 'A']);
  assert.deepEqual(input, ['A', 'B', 'C', 'D']);
  assert.equal(draws, 3);
  assert.equal(validateTournament(t), true);
  globalThis.crypto = undefined;
  assert.throws(() => createTournament(input), /Crypto is unavailable/);
});

test('ties, invalid winners, scores and metadata reject atomically', () => {
  const t = createTournament(names(4));
  const match = nextMatch(t);
  const other = t.players.find(player => player.id !== match.a && player.id !== match.b).id;
  const good = { winnerId: match.a, scores: { a: 2, b: 1 } };
  const invalid = [null, {}, { ...good, extra: true }, { ...good, winnerId: other },
    { ...good, scores: { a: 1, b: 1 } }, { ...good, scores: { a: 0, b: 1 } },
    { ...good, scores: { a: Infinity, b: 1 } }, { ...good, scores: { a: NaN, b: 1 } },
    { ...good, scores: { a: 2, b: -1 } }, { ...good, scores: { a: '2', b: 1 } },
    { ...good, scores: [2, 1] }, { ...good, scores: { a: 2, b: 1, c: 0 } },
    { ...good, gameId: '' }, { ...good, gameId: {} }, { ...good, seed: Infinity },
    { ...good, seed: {} }, { ...good, seed: '' }];
  const before = clone(t);
  for (const result of invalid) {
    assert.throws(() => recordResult(t, match.id, result), TypeError);
    assert.deepEqual(t, before);
  }
  assert.throws(() => recordResult(t, 'missing', good));
  assert.throws(() => recordResult(t, t.rounds.at(-1)[0].id, good));
  assert.deepEqual(t, before);
  win(t, match);
  const after = clone(t);
  assert.throws(() => win(t, match));
  assert.deepEqual(t, after);
});

test('ID-keyed scores normalize, optional metadata defaults to null, and input is copied', () => {
  const t = createTournament(names(2));
  const match = nextMatch(t);
  const scores = { [match.a]: 0.5, [match.b]: 1.5 };
  recordResult(t, match.id, { winnerId: match.b, scores });
  scores[match.b] = 900;
  const completed = t.rounds[0][0];
  assert.deepEqual(completed.scores, { a: 0.5, b: 1.5 });
  assert.equal(completed.gameId, null);
  assert.equal(completed.seed, null);
  assert.notEqual(completed.scores, t.history[0].scores);
  assert.equal(getChampion(t).id, match.b);
});

test('undo after import clears the last result and affected downstream, then replays exactly', () => {
  let t = createTournament(names(17));
  const initial = clone(t);
  const snapshots = [clone(t)];
  while (nextMatch(t)) {
    win(t, nextMatch(t), t.history.length % 2 ? 'b' : 'a');
    snapshots.push(clone(t));
  }
  // Every undo starts with imported JSON, so no process-local state can assist it.
  for (let length = t.history.length; length > 0; length--) {
    const result = clone(t.history.at(-1));
    t = clone(t);
    assert.equal(undoResult(t), t);
    assert.deepEqual(t, snapshots[length - 1]);
    assert.equal(validateTournament(t), true);
    recordResult(t, result.matchId, { winnerId: result.winnerId, scores: result.scores,
      gameId: result.gameId, seed: result.seed });
    assert.deepEqual(t, snapshots[length]);
    undoResult(t);
  }
  assert.deepEqual(t, initial);
  assert.equal(undoResult(t), t);
  assert.deepEqual(t, initial);
});

test('undo respects confirmation order across independent ready matches', () => {
  const t = createTournament(names(8));
  const first = t.rounds[0][0];
  const last = t.rounds[0].at(-1);
  win(t, last);
  const snapshot = clone(t);
  win(t, first);
  assert.equal(t.history.at(-1).matchId, first.id);
  undoResult(t);
  assert.deepEqual(t, snapshot);
  win(t, first, 'b');
  assert.equal(t.rounds[1][0].a, first.b);
  assert.equal(t.rounds[1][0].winnerId, null);
  assert.equal(t.rounds[1][0].scores, null);
});

test('strict imports reject malformed data, forged advancement and inconsistent history', () => {
  const t = createTournament(names(5), 'Import');
  win(t);
  const mutations = [
    x => { x.version = 99; }, x => { x.extra = true; }, x => { delete x.title; },
    x => { x.title = ' '; }, x => { x.createdAt = 'yesterday'; },
    x => { x.status = 'completed'; }, x => { x.id = 'not-a-uuid'; },
    x => { x.players[0].id = x.players[1].id; }, x => { x.players[0].displayName = ''; },
    x => { x.players[0].extra = true; }, x => { x.players.push(x.players[0]); },
    x => { x.rounds[0][0].id = x.players[0].id; }, x => { x.rounds.push([]); },
    x => { x.rounds[0].push(clone(x.rounds[0][0])); },
    x => { x.rounds[1][0].id = x.rounds[0][0].id; },
    x => { x.rounds[0][0].a = x.players.find(p => p.id !== x.rounds[0][0].a && p.id !== x.rounds[0][0].b).id; },
    x => { x.rounds[1][0].b = null; }, x => { x.rounds[0][0].winnerId = x.id; },
    x => { x.rounds[0][0].round = 9; }, x => { x.rounds[0][0].index = 9; },
    x => { x.rounds[0][0].status = 'bye'; }, x => { x.rounds[0][0].extra = true; },
    x => { x.rounds[0][0].scores.a = Infinity; }, x => { x.rounds[0][0].gameId = 'forged'; },
    x => { x.rounds[0][0].seed = 'forged'; }, x => { x.history = []; },
    x => { x.history.push(clone(x.history[0])); }, x => { x.history[0].matchId = x.id; },
    x => { x.history[0].winnerId = x.id; }, x => { x.history[0].scores = { a: 1, b: 1 }; },
    x => { x.history[0].scores.a = NaN; }, x => { x.history[0].extra = true; },
    x => { x.history[0].seed = {}; }, x => { x.history[0].gameId = []; },
    x => { x.rounds[0][0].scores.a = 1; },
  ];
  for (const mutate of mutations) {
    const invalid = clone(t);
    mutate(invalid);
    assert.throws(() => validateTournament(invalid), TypeError, mutate.toString());
  }
  for (const value of [null, undefined, [], {}, 'json']) assert.throws(() => validateTournament(value), TypeError);
  const sparse = clone(t);
  delete sparse.players[0];
  assert.throws(() => validateTournament(sparse), TypeError);
  const extraArrayField = clone(t);
  extraArrayField.rounds.extra = true;
  assert.throws(() => validateTournament(extraArrayField), TypeError);
  assert.equal(validateTournament(clone(t)), true);
});

test('imports reject history recorded before feeder matches and hidden pending results', () => {
  const t = createTournament(names(4));
  while (nextMatch(t)) win(t);
  const reordered = clone(t);
  reordered.history.reverse();
  assert.throws(() => validateTournament(reordered));
  const pending = createTournament(names(4));
  pending.rounds[1][0].scores = { a: 2, b: 1 };
  assert.throws(() => validateTournament(pending));
});

// A small asynchronous IndexedDB test double, including request success followed
// by a failed COMMIT. No external packages or browser globals are needed.
function memoryIndexedDB() {
  const state = { value: undefined, failCommit: false, closed: 0 };
  const db = {
    objectStoreNames: { contains: () => true },
    close() { state.closed++; },
    transaction(_name, mode) {
      const tx = { error: null, abort() { queueMicrotask(() => tx.onabort?.()); } };
      tx.objectStore = () => ({
        put(value) { return requestFor('put', value); },
        get() { return requestFor('get'); },
        delete() { return requestFor('delete'); },
      });
      function requestFor(operation, value) {
        const request = { result: operation === 'get' ? structuredClone(state.value) : undefined };
        setImmediate(() => {
          request.onsuccess?.();
          setImmediate(() => {
            if (state.failCommit && mode === 'readwrite') {
              tx.error = new Error('Commit failed');
              tx.onabort?.();
            } else {
              if (operation === 'put') state.value = structuredClone(value);
              if (operation === 'delete') state.value = undefined;
              tx.oncomplete?.();
            }
          });
        });
        return request;
      }
      return tx;
    },
  };
  return { state, open() {
    const request = { result: db };
    queueMicrotask(() => request.onsuccess?.());
    return request;
  } };
}

test('storage roundtrip, persisted undo, isolated save snapshot and delete', async context => {
  const storage = memoryIndexedDB();
  replaceGlobal(context, 'indexedDB', storage);
  assert.equal(await loadTournament(), null);
  const t = createTournament(names(5));
  win(t);
  const saved = clone(t);
  const saving = saveTournament(t);
  win(t);
  await saving;
  const loaded = await loadTournament();
  assert.deepEqual(loaded, saved);
  undoResult(loaded);
  assert.equal(loaded.history.length, 0);
  assert.equal(validateTournament(loaded), true);
  assert.deepEqual(await loadTournament(), saved);
  await deleteTournament();
  assert.equal(await loadTournament(), null);
  assert.equal(storage.state.closed, 6);
});

test('team save/load freezes roster snapshots and preserves persisted undo data', async context => {
  const storage = memoryIndexedDB();
  replaceGlobal(context, 'indexedDB', storage);
  const t = createTeamTournament(teams(5), 'Copa das Equipes');
  const initial = clone(t);
  win(t);
  const saved = clone(t);
  const saving = saveTournament(t);
  t.teams[0].members.push('André');
  win(t);
  await saving;
  const loaded = await loadTournament();
  assert.deepEqual(loaded, saved);
  assert.deepEqual(loaded.teams, initial.teams);
  undoResult(loaded);
  assert.deepEqual(loaded, initial);
  assert.deepEqual(await loadTournament(), saved);
  await saveTournament(loaded);
  assert.deepEqual(await loadTournament(), initial);
});

test('invalid team saves reject without dropping rosters or replacing stored data', async context => {
  const storage = memoryIndexedDB();
  replaceGlobal(context, 'indexedDB', storage);
  const t = createTeamTournament(teams(2));
  await saveTournament(t);
  const saved = clone(t);
  for (const mutate of [
    x => { x.teams = null; },
    x => { x.teams[0].playerId = x.teams[1].playerId; },
    x => { x.teams[0].members = ['João', 'joao']; },
    x => { x.teams[0].name = 'Changed'; },
  ]) {
    const invalid = clone(t);
    mutate(invalid);
    await assert.rejects(saveTournament(invalid), TypeError);
    assert.deepEqual(storage.state.value, saved);
    storage.state.value = clone(invalid);
    await assert.rejects(loadTournament(), TypeError);
    assert.deepEqual(storage.state.value, invalid);
    storage.state.value = clone(saved);
  }
  assert.deepEqual(await loadTournament(), saved);
});

test('storage fails explicitly when unavailable or opening fails', async context => {
  const t = createTournament(names(2));
  replaceGlobal(context, 'indexedDB', undefined);
  await assert.rejects(saveTournament(t), /unavailable/);
  await assert.rejects(loadTournament(), /unavailable/);
  await assert.rejects(deleteTournament(), /unavailable/);
  globalThis.indexedDB = { open() { throw new Error('Permission denied'); } };
  await assert.rejects(saveTournament(t), /Permission denied/);
});

test('failed commits preserve the previous save and reject writes and deletes', async context => {
  const storage = memoryIndexedDB();
  replaceGlobal(context, 'indexedDB', storage);
  const t = createTournament(names(4));
  await saveTournament(t);
  const before = clone(t);
  win(t);
  storage.state.failCommit = true;
  await assert.rejects(saveTournament(t), /Commit failed/);
  assert.deepEqual(await loadTournament(), before);
  await assert.rejects(deleteTournament(), /Commit failed/);
  assert.deepEqual(await loadTournament(), before);
});

test('malformed saves reject without deleting or replacing stored data', async context => {
  const storage = memoryIndexedDB();
  replaceGlobal(context, 'indexedDB', storage);
  storage.state.value = { corrupt: true };
  await assert.rejects(loadTournament(), TypeError);
  assert.deepEqual(storage.state.value, { corrupt: true });
  await assert.rejects(saveTournament({}), TypeError);
  assert.deepEqual(storage.state.value, { corrupt: true });
});
