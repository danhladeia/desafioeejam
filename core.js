/**
 * Vanilla ESM single-elimination engine. Public mutators return the same tournament.
 * Player slots (a/b) and winnerId contain IDs, never display names. Rounds and
 * indexes are zero-based. Scores are stored as { a: number, b: number }.
 * A seeded, deterministic bracket gives first-round byes directly to the next
 * round, so rounds.flat() contains exactly players.length - 1 real matches.
 */

const VERSION = 1;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DB_NAME = 'jesuzinha-tournaments';
const STORE_NAME = 'tournaments';
const SAVE_KEY = 'current';

function requireValue(condition, message) {
  if (!condition) throw new TypeError(message);
}

function isObject(value) {
  return value !== null && typeof value === 'object' &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}

function exactKeys(value, keys, label) {
  requireValue(isObject(value), `${label} must be an object`);
  const actual = Reflect.ownKeys(value);
  requireValue(actual.length === keys.length && keys.every(key => Object.hasOwn(value, key)),
    `${label} has missing or unexpected fields`);
}

function validText(value, label) {
  requireValue(typeof value === 'string' && value.trim().length > 0 && value === value.trim(),
    `${label} must be a nonempty trimmed string`);
}

// Keep the original spelling for display; compare Portuguese names consistently.
function normalizedName(value) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/gu, ' ');
}

function copyTeamDetails(name, members, teamNames) {
  validText(name, 'team.name');
  const key = normalizedName(name);
  requireValue(!teamNames.has(key), 'Team names must be unique');
  teamNames.add(key);
  requireValue(Array.isArray(members) && members.length > 0, 'A team needs at least one member');
  const memberNames = new Set();
  const copied = Array.from(members, member => {
    validText(member, 'team member');
    requireValue(member.length <= 40, 'Team member names must be at most 40 characters');
    const memberKey = normalizedName(member);
    requireValue(!memberNames.has(memberKey), 'Member names must be unique within a team');
    memberNames.add(memberKey);
    return member;
  });
  assertSame(members, copied, 'team.members');
  return { name, members: copied };
}

function copyTeamRoster(teams, players) {
  requireValue(Array.isArray(teams) && teams.length === players.length,
    'teams must contain exactly one roster per player');
  const byId = new Map(players.map(player => [player.id, player]));
  const teamNames = new Set();
  const copied = Array.from(teams, team => {
    exactKeys(team, ['playerId', 'name', 'members'], 'team');
    const player = byId.get(team.playerId);
    requireValue(player && player.displayName === team.name,
      'Team playerId must be unique and its name must match the player displayName');
    byId.delete(team.playerId);
    return { playerId: team.playerId, ...copyTeamDetails(team.name, team.members, teamNames) };
  });
  assertSame(teams, copied, 'teams');
  return copied;
}

function uuid() {
  requireValue(typeof globalThis.crypto?.randomUUID === 'function' &&
    typeof globalThis.crypto?.getRandomValues === 'function', 'Web Crypto is unavailable');
  return globalThis.crypto.randomUUID();
}

// Rejection sampling avoids the modulo bias of randomUint32 % limit.
function randomIndex(limit) {
  const bound = 0x100000000 - (0x100000000 % limit);
  const buffer = new Uint32Array(1);
  do { globalThis.crypto.getRandomValues(buffer); } while (buffer[0] >= bound);
  return buffer[0] % limit;
}

function copyScores(scores) {
  return { a: scores.a, b: scores.b };
}

function assertSame(actual, expected, path) {
  if (Array.isArray(expected)) {
    requireValue(Array.isArray(actual) && actual.length === expected.length &&
      Reflect.ownKeys(actual).length === expected.length + 1, `${path} has an invalid array shape`);
    expected.forEach((value, index) => assertSame(actual[index], value, `${path}[${index}]`));
  } else if (isObject(expected)) {
    exactKeys(actual, Object.keys(expected), path);
    for (const key of Object.keys(expected)) assertSame(actual[key], expected[key], `${path}.${key}`);
  } else {
    requireValue(actual === expected, `${path} is inconsistent with the bracket/history`);
  }
}

function makeBracket(players, makeId) {
  let size = 2;
  while (size < players.length) size *= 2;
  // Standard seed order: [1, 2] -> [1, 4, 2, 3] -> [1, 8, 4, 5, 2, 7, 3, 6].
  let seeds = [1, 2];
  while (seeds.length < size) {
    const sum = seeds.length * 2 + 1;
    seeds = seeds.flatMap(seed => [seed, sum - seed]);
  }
  let sources = seeds.map(seed => ({ playerId: players[seed - 1]?.id ?? null }));
  const rounds = [];
  const links = new Map();
  let round = 0;
  while (sources.length > 1) {
    const matches = [];
    const next = [];
    for (let slot = 0; slot < sources.length; slot += 2) {
      const left = sources[slot];
      const right = sources[slot + 1];
      // A bye is a slot, not a played match or a history entry.
      if (left.playerId === null) { next.push(right); continue; }
      if (right.playerId === null) { next.push(left); continue; }
      const index = matches.length;
      const id = makeId(round, index);
      const a = left.playerId ?? null;
      const b = right.playerId ?? null;
      const match = { id, round, index, a, b, winnerId: null, scores: null,
        status: a && b ? 'ready' : 'pending', gameId: null, seed: null };
      matches.push(match);
      links.set(id, [left, right]);
      next.push({ matchId: id });
    }
    rounds.push(matches);
    sources = next;
    round++;
  }
  return { rounds, links };
}

function refreshBracket(bracket) {
  const matches = new Map(bracket.rounds.flat().map(match => [match.id, match]));
  for (const match of bracket.rounds.flat()) {
    const [left, right] = bracket.links.get(match.id);
    match.a = left.matchId ? matches.get(left.matchId).winnerId : left.playerId;
    match.b = right.matchId ? matches.get(right.matchId).winnerId : right.playerId;
    if (match.status !== 'completed') match.status = match.a && match.b ? 'ready' : 'pending';
  }
}

function normalizeResult(match, result, imported = false) {
  exactKeys(result, ['matchId', 'winnerId', 'scores', 'gameId', 'seed'], 'result');
  requireValue(match && match.status === 'ready', 'Match is not ready or is already completed');
  requireValue(result.winnerId === match.a || result.winnerId === match.b,
    'winnerId must be a participant in this match');
  let scores = result.scores;
  // Caller convenience: accept scores keyed by the two player IDs as well.
  if (!imported && isObject(scores) && Object.hasOwn(scores, match.a) && Object.hasOwn(scores, match.b)) {
    exactKeys(scores, [match.a, match.b], 'scores');
    scores = { a: scores[match.a], b: scores[match.b] };
  }
  exactKeys(scores, ['a', 'b'], 'scores');
  requireValue(Number.isFinite(scores.a) && Number.isFinite(scores.b) && scores.a >= 0 && scores.b >= 0,
    'Scores must be finite nonnegative numbers');
  requireValue(scores.a !== scores.b, 'Tied scores are not allowed');
  requireValue(result.winnerId === (scores.a > scores.b ? match.a : match.b),
    'winnerId must agree with the scores');
  requireValue(result.gameId === null || (typeof result.gameId === 'string' && result.gameId.trim().length > 0),
    'gameId must be null or a nonempty string');
  requireValue(result.seed === null || (typeof result.seed === 'number' && Number.isFinite(result.seed)) ||
    (typeof result.seed === 'string' && result.seed.trim().length > 0),
    'seed must be null, a finite number, or a nonempty string');
  return { matchId: match.id, winnerId: result.winnerId, scores: copyScores(scores),
    gameId: result.gameId, seed: result.seed };
}

function applyResult(bracket, result, imported = false) {
  const match = bracket.rounds.flat().find(item => item.id === result.matchId);
  const normalized = normalizeResult(match, result, imported);
  Object.assign(match, { winnerId: normalized.winnerId, scores: copyScores(normalized.scores),
    gameId: normalized.gameId, seed: normalized.seed, status: 'completed' });
  refreshBracket(bracket);
  return normalized;
}

function tournamentStatus(rounds) {
  return rounds.at(-1)[0].winnerId === null ? 'active' : 'completed';
}

function rebuild(t, history = t?.history) {
  const hasTeams = isObject(t) && Object.hasOwn(t, 'teams');
  exactKeys(t, ['version', 'id', 'title', 'createdAt', 'status', 'players', 'rounds', 'history',
    ...(hasTeams ? ['teams'] : [])], 'tournament');
  requireValue(t.version === VERSION, 'Unsupported tournament version');
  validText(t.title, 'title');
  requireValue(typeof t.createdAt === 'string' && Number.isFinite(Date.parse(t.createdAt)) &&
    new Date(t.createdAt).toISOString() === t.createdAt, 'createdAt must be an ISO UTC timestamp');
  requireValue(Array.isArray(t.players) && t.players.length >= 2 && t.players.length <= 64,
    'A tournament needs 2 to 64 players');
  const ids = new Set();
  function takeId(id) {
    requireValue(typeof id === 'string' && UUID.test(id) && !ids.has(id.toLowerCase()),
      'IDs must be unique crypto UUIDs');
    ids.add(id.toLowerCase());
    return id;
  }
  takeId(t.id);
  const players = Array.from(t.players, player => {
    exactKeys(player, ['id', 'displayName'], 'player');
    takeId(player.id);
    validText(player.displayName, 'displayName');
    return { id: player.id, displayName: player.displayName };
  });
  assertSame(t.players, players, 'players');
  const teams = hasTeams ? copyTeamRoster(t.teams, players) : undefined;
  requireValue(Array.isArray(t.rounds), 'rounds must be an array');
  const bracket = makeBracket(players, (round, index) => takeId(t.rounds[round]?.[index]?.id));
  requireValue(Array.isArray(history) && history.length <= players.length - 1,
    'history must be an array with at most N-1 results');
  const replayed = Array.from(history, result => applyResult(bracket, result, true));
  assertSame(history, replayed, 'history');
  return { version: VERSION, id: t.id, title: t.title, createdAt: t.createdAt,
    status: tournamentStatus(bracket.rounds), players, rounds: bracket.rounds, history: replayed,
    ...(hasTeams ? { teams } : {}) };
}

/** Throws TypeError for malformed or inconsistent JSON; returns true otherwise. */
export function validateTournament(t) {
  const expected = rebuild(t);
  assertSame(t, expected, 'tournament');
  return true;
}

/** Shuffles a copy of names with Web Crypto; duplicate display names are allowed. */
export function createTournament(names, title = 'Torneio') {
  requireValue(Array.isArray(names) && names.length >= 2 && names.length <= 64,
    'A tournament needs 2 to 64 players');
  requireValue(typeof title === 'string', 'title must be a string');
  title = title.trim();
  validText(title, 'title');
  const players = Array.from(names, name => {
    requireValue(typeof name === 'string', 'Player names must be strings');
    const displayName = name.trim();
    validText(displayName, 'displayName');
    return { id: uuid(), displayName };
  });
  for (let index = players.length - 1; index > 0; index--) {
    const other = randomIndex(index + 1);
    [players[index], players[other]] = [players[other], players[index]];
  }
  const { rounds } = makeBracket(players, () => uuid());
  return { version: VERSION, id: uuid(), title, createdAt: new Date().toISOString(),
    status: 'active', players, rounds, history: [] };
}

/** Creates one bracket entrant per team; members are registration data only. */
export function createTeamTournament(teams, title = 'Torneio') {
  requireValue(Array.isArray(teams) && teams.length >= 2 && teams.length <= 64,
    'A tournament needs 2 to 64 teams');
  const teamNames = new Set();
  const rosters = Array.from(teams, team => {
    exactKeys(team, ['name', 'members'], 'team');
    requireValue(typeof team.name === 'string', 'Team names must be strings');
    requireValue(Array.isArray(team.members), 'Team members must be an array');
    const members = Array.from(team.members, member => {
      requireValue(typeof member === 'string', 'Team member names must be strings');
      return member.trim();
    });
    return copyTeamDetails(team.name.trim(), members, teamNames);
  });
  const tournament = createTournament(rosters.map(team => team.name), title);
  const byName = new Map(tournament.players.map(player => [player.displayName, player.id]));
  tournament.teams = rosters.map(team => ({ playerId: byName.get(team.name), ...team }));
  return tournament;
}

/** First ready match in round/index order; null once the tournament is complete. */
export function nextMatch(t) {
  validateTournament(t);
  return t.rounds.flat().find(match => match.status === 'ready') ?? null;
}

/** Records any ready match, advances its winner, and appends persisted undo data. */
export function recordResult(t, matchId, result) {
  validateTournament(t);
  requireValue(isObject(result), 'result must be an object');
  const allowed = ['winnerId', 'scores', 'gameId', 'seed'];
  requireValue(Reflect.ownKeys(result).every(key => allowed.includes(key)) &&
    Object.hasOwn(result, 'winnerId') && Object.hasOwn(result, 'scores'), 'Invalid result fields');
  const bracket = makeBracket(t.players, (round, index) => t.rounds[round][index].id);
  const history = t.history.map(entry => applyResult(bracket, entry, true));
  history.push(applyResult(bracket, { matchId, winnerId: result.winnerId, scores: result.scores,
    gameId: result.gameId === undefined ? null : result.gameId,
    seed: result.seed === undefined ? null : result.seed }));
  t.rounds = bracket.rounds;
  t.history = history;
  t.status = tournamentStatus(t.rounds);
  return t;
}

/** Undoes only the last confirmed result. Empty history is a no-op. */
export function undoResult(t) {
  validateTournament(t);
  if (t.history.length === 0) return t;
  const previous = rebuild(t, t.history.slice(0, -1));
  t.rounds = previous.rounds;
  t.history = previous.history;
  t.status = previous.status;
  return t;
}

/** Player object or null. Duplicate names never affect ID lookup. */
export function getPlayer(t, id) {
  validateTournament(t);
  return t.players.find(player => player.id === id) ?? null;
}

/** Champion player object or null while the tournament is active. */
export function getChampion(t) {
  validateTournament(t);
  const winnerId = t.rounds.at(-1)[0].winnerId;
  return t.players.find(player => player.id === winnerId) ?? null;
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (typeof globalThis.indexedDB?.open !== 'function') {
      reject(new Error('IndexedDB is unavailable; tournament was not saved or deleted'));
      return;
    }
    let request;
    let failed = false;
    try { request = globalThis.indexedDB.open(DB_NAME, 1); }
    catch (error) { reject(error); return; }
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME);
    };
    request.onerror = () => { failed = true; reject(request.error ?? new Error('Unable to open IndexedDB')); };
    request.onblocked = () => { failed = true; reject(new Error('IndexedDB upgrade is blocked; close other tabs')); };
    request.onsuccess = () => {
      const db = request.result;
      if (failed) { db.close(); return; }
      db.onversionchange = () => db.close();
      resolve(db);
    };
  });
}

async function storageOperation(mode, operation) {
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      let tx;
      let request;
      try {
        tx = db.transaction(STORE_NAME, mode);
        tx.oncomplete = () => resolve(request.result);
        tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'));
        tx.onerror = () => reject(tx.error ?? request?.error ?? new Error('IndexedDB transaction failed'));
        request = operation(tx.objectStore(STORE_NAME));
      } catch (error) {
        if (tx) { try { tx.abort(); } catch { /* Already inactive. */ } }
        reject(error);
      }
    });
  } finally { db.close(); }
}

/** Saves one current tournament, resolving only after the transaction commits. */
export async function saveTournament(t) {
  validateTournament(t);
  // Freeze the save snapshot before waiting for the database to open.
  const snapshot = JSON.parse(JSON.stringify(t));
  await storageOperation('readwrite', store => store.put(snapshot, SAVE_KEY));
  return t;
}

/** Returns validated saved data, or null only when no save exists. Errors propagate. */
export async function loadTournament() {
  const saved = await storageOperation('readonly', store => store.get(SAVE_KEY));
  if (saved === undefined) return null;
  validateTournament(saved);
  return saved;
}

/** Removes the current save; rejects on unavailable storage or failed commits. */
export async function deleteTournament() {
  await storageOperation('readwrite', store => store.delete(SAVE_KEY));
}
