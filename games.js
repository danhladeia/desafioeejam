import { WORDS, WORD_HINTS, ACTIVITIES } from './content.js';
import { setupJigsaw } from './jigsaw.js';
import { setupSecretRace, setupSyllables, setupMistake } from './wordgames.js';
import { setupBalance } from './mathgames.js';
import { learningBank } from './learning.js';
import { appendUiIcon } from './ui-art.js';

/** Durations are suggestions in seconds; the host owns the match clock. */
export const GAMES = [
  { id: 'turbo', title: 'Toque Turbo', subtitle: 'Atenção e precisão', icon: 'idea', rule: 'Toque com calma em ideias e livros. Evite as armadilhas vermelhas.', duration: 35 },
  { id: 'rota', title: 'Rota do EMTI', subtitle: 'Aprender, criar e conviver', icon: 'hand', rule: 'Classifique cada atividade em Aprender, Criar projetos ou Conviver.', duration: 60 },
  { id: 'memory', title: 'Memória EEJAM', subtitle: 'Observe e encontre os pares', icon: 'book', rule: 'Vire duas cartas por vez. Encontre todos os pares para terminar.', duration: 60 },
  { id: 'puzzle', title: 'Monte a EEJAM', subtitle: 'Arraste e encaixe as peças', icon: 'hand', rule: 'Arraste cada peça até o quadro. Ela encaixa sozinha no lugar certo.', duration: 75 },
  { id: 'secret', title: 'Palavra Secreta', subtitle: 'Mesma palavra, quem acerta primeiro', icon: 'rocket', rule: 'Os dois jogam a mesma palavra com o alfabeto inteiro. Quem acertar primeiro leva o ponto. Vence quem chegar a 3.', duration: 60 },
  { id: 'scramble', title: 'Desembaralha', subtitle: 'Organize as letras', icon: 'book', rule: 'Toque nas letras em ordem. Toque em uma letra escolhida para devolvê-la e confira a palavra.', duration: 60 },
  { id: 'search', title: 'Caça-Palavras', subtitle: 'Arraste sobre a palavra', icon: 'info', rule: 'Encontre palavras em oito direções: horizontal, vertical e diagonais, também de trás para a frente.', duration: 75 },
  { id: 'rope', title: 'Cabo de Guerra', subtitle: 'Contas e português puxam a vitória', icon: 'star', rule: 'Resolva contas e questões de português. Cada acerto puxa a corda. Abra seis acertos de vantagem ou termine à frente.', duration: 60 },
  { id: 'forca', title: 'Forca das Palavras', subtitle: 'Seis chances para decolar', icon: 'rocket', rule: 'Escolha letras para revelar a palavra antes que as seis unidades de combustível acabem.', duration: 60 },
  { id: 'balanca', title: 'Balança dos Números', subtitle: 'Some e equilibre', icon: 'check', rule: 'Arraste os pesos para o prato da direita até a soma ficar igual ao número da balança.', duration: 60 },
  { id: 'silabas', title: 'Sílabas Soltas', subtitle: 'Monte a palavra', icon: 'book', rule: 'Arraste as sílabas para os espaços e forme a palavra da dica.', duration: 60 },
  { id: 'erro', title: 'Caça-Erro', subtitle: 'Ache a palavra errada', icon: 'error', rule: 'Leia a frase e toque na palavra escrita errada.', duration: 50 },
];

const FALLBACK_WORDS = [
  ['MARCA', 'Identidade que ajuda a reconhecer um produto ou projeto.'],
  ['IDEIA', 'Pode ser o começo de uma solução.'], ['META', 'Resultado que queremos alcançar.'],
  ['CURSO', 'Percurso organizado de aprendizagem.'], ['MIDIA', 'Meio usado para comunicar uma mensagem.'],
  ['ETICA', 'Orienta escolhas responsáveis e honestas.'], ['EQUIPE', 'Pessoas que colaboram por um objetivo.'],
  ['SLOGAN', 'Frase curta que resume uma mensagem.'], ['PUBLICO', 'Grupo de pessoas com quem queremos conversar.'],
  ['PROJETO', 'Plano com objetivo, etapas e resultado.'], ['PESQUISA', 'Busca organizada de informações.'],
  ['CAMPANHA', 'Conjunto de ações de comunicação com um objetivo.'],
].map(([word, hint]) => ({ word, hint }));
const FALLBACK_ACTIVITIES = [
  { text: 'Estudar como calcular uma porcentagem.', category: 0 },
  { text: 'Pesquisar e comparar fontes para entender um tema.', category: 0 },
  { text: 'Resolver exercícios e revisar o que ainda não entendi.', category: 0 },
  { text: 'Planejar uma campanha com objetivo e etapas.', category: 1 },
  { text: 'Construir e testar um protótipo de solução.', category: 1 },
  { text: 'Organizar tarefas e apresentar o resultado de um projeto.', category: 1 },
  { text: 'Ouvir colegas e combinar regras para o grupo.', category: 2 },
  { text: 'Mediar um conflito com respeito entre colegas.', category: 2 },
  { text: 'Acolher um novo integrante da turma.', category: 2 },
];

export function normalizeWord(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z]/g, '');
}

function hash(value) {
  let h = 2166136261;
  for (const char of String(value)) { h ^= char.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function seededRandom(seed) {
  let state = hash(seed);
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(values, rng) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function levelOf(value) {
  const key = normalizeWord(value);
  if (['HARD', 'DIFICIL', 'AVANCADO', 'EXPERT'].includes(key) || Number(value) >= 3) return 3;
  if (['EASY', 'FACIL', 'INICIANTE'].includes(key) || Number(value) === 1) return 1;
  return 2;
}

function rows(source) {
  if (Array.isArray(source)) return source;
  if (!source || typeof source !== 'object') return [];
  return Object.values(source).flatMap(value => Array.isArray(value) ? value : []);
}

function wordBank() {
  const seen = new Set();
  const result = [];
  for (const item of [...rows(WORDS), ...FALLBACK_WORDS]) {
    const word = normalizeWord(typeof item === 'string' ? item : item?.word ?? item?.answer ?? item?.text ?? item?.palavra);
    if (word.length < 3 || word.length > 12 || seen.has(word)) continue;
    seen.add(word);
    result.push({ word, hint: String(typeof item === 'object' ? item.hint ?? item.clue ?? item.tip ?? item.dica ?? WORD_HINTS[word] ?? 'Escola, projetos e comunicação.' : WORD_HINTS[word] ?? 'Escola, projetos e comunicação.') });
  }
  return result;
}

/** Seeded backtracking never replaces a conflicting letter. Same seed = same direction mix. */
export function buildWordSearch(entries, rng = seededRandom(0), options = {}) {
  const size = options.size ?? (options.level >= 3 || options.difficulty === 'advanced' ? 8 : 7);
  const words = entries.map(item => normalizeWord(typeof item === 'string' ? item : item.word));
  if (![7, 8].includes(size) || words.length < 1 || words.length > 8 || new Set(words).size !== words.length || words.some(word => !word || word.length > size)) {
    throw new RangeError('Use de uma a oito palavras únicas que caibam na grade de 7 ou 8 letras.');
  }
  const grid = Array.from({ length: size }, () => Array(size).fill(''));
  // Longest words get cardinal directions first; the next pair includes a reverse diagonal.
  const turns = Math.floor(rng() * 4), mirror = rng() < 0.5;
  const names = { '0,1': 'E', '-1,0': 'N', '1,1': 'SE', '-1,-1': 'NW', '1,-1': 'SW', '-1,1': 'NE', '0,-1': 'W', '1,0': 'S' };
  const directions = [[0, 1], [-1, 0], [1, 1], [-1, -1], [1, -1], [-1, 1], [0, -1], [1, 0]].map(([r, c]) => {
    if (mirror) c = -c;
    for (let turn = 0; turn < turns; turn++) [r, c] = [c, -r];
    return [r, c, names[`${r},${c}`]];
  });
  const order = words.map((word, index) => ({ word, index })).sort((a, b) => b.word.length - a.word.length);
  const candidates = order.map(({ word }) => directions.map(([dr, dc, direction]) => shuffle(Array.from({ length: size * size }, (_, cell) => cell).flatMap(start => {
    const row = Math.floor(start / size), col = start % size;
    const endRow = row + dr * (word.length - 1), endCol = col + dc * (word.length - 1);
    if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) return [];
    return [{ word, direction, dr, dc, cells: Array.from(word, (_, k) => (row + dr * k) * size + col + dc * k) }];
  }), rng)));
  const placements = [];
  let attempts = 0;
  function place(index, flexible) {
    if (index === order.length) return true;
    const choices = flexible ? [...candidates[index][index], ...candidates[index].flat()] : candidates[index][index];
    for (const candidate of choices) {
      if (++attempts > 200000) return false;
      if (candidate.cells.some((cell, k) => { const letter = grid[Math.floor(cell / size)][cell % size]; return letter && letter !== candidate.word[k]; })) continue;
      const added = candidate.cells.filter(cell => !grid[Math.floor(cell / size)][cell % size]);
      candidate.cells.forEach((cell, k) => { grid[Math.floor(cell / size)][cell % size] = candidate.word[k]; });
      placements[order[index].index] = candidate;
      if (place(index + 1, flexible)) return true;
      added.forEach(cell => { grid[Math.floor(cell / size)][cell % size] = ''; });
    }
    return false;
  }
  if (!place(0, false)) {
    attempts = 0;
    if (!place(0, true)) throw new RangeError('Não foi possível distribuir essas palavras sem substituir letras.');
  }
  for (const row of grid) for (let col = 0; col < size; col++) if (!row[col]) row[col] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(rng() * 26)];
  return { grid, placements };
}

/** A speed tiebreaker: 0–20 points, one less per full active second. */
export function speedBonus(elapsedMs) {
  return Math.max(0, 20 - Math.floor(Math.max(0, elapsedMs) / 1000));
}

/** Only straight, in-bounds paths; diagonal and reversed endpoints are symmetric. */
export function searchPath(a, b, size = 7) {
  if (![a, b].every(cell => Number.isInteger(cell) && cell >= 0 && cell < size * size)) return [];
  const ar = Math.floor(a / size), ac = a % size;
  const dr = Math.floor(b / size) - ar, dc = b % size - ac;
  if (dr && dc && Math.abs(dr) !== Math.abs(dc)) return [];
  return Array.from({ length: Math.max(Math.abs(dr), Math.abs(dc)) + 1 }, (_, k) => (ar + Math.sign(dr) * k) * size + ac + Math.sign(dc) * k);
}

/** Each instance owns its DOM, listeners, logical clock, timeouts and random streams. */
export function createGame({ id, el, side = 'left', seed = 0, difficulty = 'normal', solo = false, onScore = () => {}, onFinish = () => {}, onEffect } = {}) {
  if (!el || typeof el.appendChild !== 'function') throw new TypeError('createGame precisa de um elemento el.');
  if (!GAMES.some(game => game.id === id)) throw new RangeError(`Jogo desconhecido: ${id}`);
  const doc = el.ownerDocument;
  const view = doc.defaultView ?? globalThis;
  const now = () => view.performance?.now() ?? Date.now();
  const initialLevel = levelOf(difficulty);
  let level = initialLevel, completed = 0, wrong = 0, points = 0, totalBonus = 0;
  const challengeRng = seededRandom(`${seed}:${id}:challenges:${initialLevel}`);
  const layoutRng = seededRandom(`${seed}:${id}:layout:${side}:${initialLevel}`);
  const timers = new Set();
  const listeners = [];
  let started = false, paused = false, destroyed = false, finished = false;
  let elapsed = 0, runningSince = 0, lastAnswer = -Infinity, locked = false;
  let blockedMs = 0, blockedSince = null, challengeStartedAt = 0;
  let lastAward = null;
  let begin = () => {}, act = () => {}, cancelSelection = () => {};
  const destroyHooks = [];

  function node(tag, className, text) {
    const result = doc.createElement(tag);
    if (className) result.className = className;
    if (text !== undefined) result.textContent = String(text);
    return result;
  }
  function button(text, action, value, className = 'answer') {
    const result = node('button', className, text);
    result.type = 'button';
    result.dataset.action = action;
    if (value !== undefined) result.dataset.value = String(value);
    if (action === 'check') appendUiIcon(result, 'confirm');
    return result;
  }
  const root = node('section', `game game-${id}`);
  root.dataset.game = id;
  root.dataset.side = String(side);
  root.style.touchAction = 'none';
  root.style.userSelect = 'none';
  root.setAttribute('aria-label', GAMES.find(game => game.id === id).title);
  const prompt = node('div', 'prompt');
  const progress = node('div', 'game-progress');
  const progression = node('div', 'game-progression');
  const scoreFeedback = node('div', 'game-score-feedback');
  scoreFeedback.setAttribute('role', 'status');
  const stage = node('div', 'game-stage');
  const helper = node('div', 'helper', 'Prepare-se. O jogo começa quando a partida iniciar.');
  helper.setAttribute('role', 'status');
  helper.setAttribute('aria-live', 'polite');
  root.append(prompt, progression, progress, stage, helper, scoreFeedback);
  el.appendChild(root);

  function gameTime() { return elapsed + (started && !paused && !destroyed && !finished ? now() - runningSince : 0); }
  function active() { return started && !paused && !destroyed && !finished; }
  function solveTime() { return Math.max(0, gameTime() - blockedMs - (blockedSince === null ? 0 : gameTime() - blockedSince)); }
  function blockChallenge() { if (blockedSince === null) blockedSince = gameTime(); }
  function unblockChallenge() {
    if (blockedSince !== null) { blockedMs += gameTime() - blockedSince; blockedSince = null; }
  }
  function updateProgression() {
    const nextLevel = Math.min(3, initialLevel + Math.floor(completed / 3));
    progression.textContent = `Nível ${level}/3 · ${completed} acertos${nextLevel > level ? ' · próximo desafio: nível ' + nextLevel : level < 3 ? ` · sobe em ${3 - completed % 3}` : ' · avançado'}`;
  }
  function nextChallenge() {
    level = Math.min(3, initialLevel + Math.floor(completed / 3));
    challengeStartedAt = solveTime();
    root.dataset.level = String(level);
    updateProgression();
  }
  function arm(timer) {
    timer.at = now();
    timer.handle = view.setTimeout(() => {
      timer.handle = null;
      if (!active()) return;
      timers.delete(timer);
      timer.callback();
    }, Math.max(0, timer.remaining));
  }
  function later(callback, delay) {
    if (destroyed || finished) return null;
    const timer = { callback, remaining: delay, handle: null, at: 0 };
    timers.add(timer);
    if (active()) arm(timer);
    return timer;
  }
  function stopTimers() {
    for (const timer of timers) {
      if (timer.handle !== null) view.clearTimeout(timer.handle);
      timer.handle = null;
    }
    timers.clear();
  }
  function listen(type, listener) {
    root.addEventListener(type, listener);
    listeners.push([type, listener]);
  }
  function emitScore(_legacyBase, good, target, correctDelta, startedAt = challengeStartedAt, withSpeed = true) {
    if (!active()) return;
    const elapsedMs = Math.max(0, Math.round(solveTime() - startedAt));
    const base = correctDelta === 1 ? 1000 : 0;
    const bonus = good && correctDelta === 1 && withSpeed ? speedBonus(elapsedMs) : 0;
    const delta = base + bonus;
    const metadata = { correct: good, correctDelta, base, bonus, elapsedMs };
    completed += correctDelta;
    updateProgression();
    if (!good) wrong++;
    points += delta; totalBonus += bonus; lastAward = metadata;
    scoreFeedback.textContent = good ? `+${delta.toLocaleString('pt-BR')} pontos · ${base.toLocaleString('pt-BR')} base + ${bonus} por rapidez` : '0 pontos · revise sua resposta';
    appendUiIcon(scoreFeedback, good ? 'star' : 'info');
    const rect = target.getBoundingClientRect();
    onScore(delta, metadata);
    if (active() && typeof onEffect === 'function') onEffect({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, good });
    return metadata;
  }
  function awardSolved(base, target = root, startedAt = challengeStartedAt) {
    return emitScore(base, true, target, 1, startedAt, !['secret', 'puzzle'].includes(id));
  }
  function awardWrong(base = 0, target = root) { return emitScore(base, false, target, 0); }
  // Compatibility for legacy adapters: historical point values are ignored.
  // Each fitted piece already emitted an objective; completion adds zero.
  function score(base, good = base > 0, target = root) {
    if (id === 'puzzle' && good && base === 25) return emitScore(base, true, target, 0, challengeStartedAt, false);
    return good ? awardSolved(base, target) : awardWrong(base, target);
  }
  function finish() {
    if (!active()) return;
    elapsed = gameTime();
    finished = true;
    cancelSelection();
    stopTimers();
    root.dataset.state = 'finished';
    helper.textContent = 'Missão concluída! Aguarde o resultado da partida.';
    onFinish();
  }
  function feedback(good, text, next, delay = good ? 800 : 1000) {
    locked = true;
    blockChallenge();
    root.classList.toggle('is-correct', good);
    root.classList.toggle('is-wrong', !good);
    root.setAttribute('aria-busy', 'true');
    helper.textContent = text;
    later(() => {
      locked = false;
      unblockChallenge();
      root.classList.remove('is-correct', 'is-wrong');
      root.setAttribute('aria-busy', 'false');
      if (next) next();
    }, Math.max(good ? 300 : 1000, delay));
  }
  function accept() {
    if (!active() || locked || gameTime() - lastAnswer < 300) return false;
    lastAnswer = gameTime();
    return true;
  }
  function actionElement(target) {
    const found = target?.closest?.('[data-action]');
    return found && root.contains(found) && !found.disabled ? found : null;
  }
  listen('pointerdown', event => {
    if (event.button !== undefined && event.button !== 0) return;
    const target = actionElement(event.target);
    if (!target || !accept()) return;
    event.preventDefault();
    act(target.dataset.action, target.dataset.value, target);
  });

  function deckReader(bank) {
    let deck = [], cursor = 0;
    return () => {
      if (cursor >= deck.length) { deck = shuffle(bank, challengeRng); cursor = 0; }
      return deck[cursor++];
    };
  }

  function setupQuiz() {
    const readers = new Map();
    let current, answered = 0, correct = 0;
    function render() {
      nextChallenge();
      if (!readers.has(level)) readers.set(level, deckReader(learningBank(level, seededRandom(`${seed}:${id}:bank:${level}`))));
      current = readers.get(level)();
      prompt.textContent = current.question;
      progress.textContent = id === 'rope' ? `${correct} acertos · ${answered} respostas` : `${answered} desafios respondidos`;
      stage.replaceChildren();
      const answers = node('div', 'answers');
      // Shared option order: an answer's location never depends on the opponent's actions.
      shuffle(current.options.map((text, index) => ({ text, index })), challengeRng).forEach(option => answers.append(button(option.text, 'quiz', option.index)));
      stage.append(answers);
      helper.textContent = 'Resolva com calma. Cada acerto puxa a corda para o seu lado.';
    }
    act = (action, value, target) => {
      if (action !== 'quiz') return;
      const good = Number(value) === current.answer;
      answered++;
      if (good) correct++;
      target.classList.add('chosen');
      score(good ? 10 : 0, good, target);
      if (!active()) return;
      progress.textContent = id === 'rope' ? `${correct} acertos · ${answered} respostas` : `${answered} desafios · ${correct} acertos`;
      // The host moves the rope using metadata.correctDelta, never weighted points.
      feedback(good, `${good ? 'Boa escolha!' : 'Vamos aprender:'} ${current.explanation}`, render, good ? (level === 1 ? 1500 : 1200) : 1800);
    };
    render();
  }

  function setupRota() {
    const categories = ['Aprender', 'Criar projetos', 'Conviver'];
    function categoryIndex(value) {
      if (typeof value === 'number' && value >= 0 && value < 3) return value;
      const text = normalizeWord(value);
      if (/APREND|ESTUD|CONHEC|FORMAC/.test(text)) return 0;
      if (/CRIAR|PROJET|PRATIC|INOV/.test(text)) return 1;
      if (/CONVIV|COLAB|SOCIAL|CIDAD/.test(text)) return 2;
      return -1;
    }
    const adapted = rows(ACTIVITIES).map(item => ({ text: String(item?.text ?? item?.activity ?? item?.title ?? item?.name ?? ''), category: categoryIndex(item?.category ?? item?.type ?? item?.answer), explanation: item?.explanation })).filter(item => item.text && item.category >= 0);
    const read = deckReader(adapted.length ? adapted : FALLBACK_ACTIVITIES);
    let current, total = 0;
    function render() {
      nextChallenge();
      current = read();
      prompt.textContent = current.text;
      progress.textContent = `${total} atividades classificadas`;
      stage.replaceChildren();
      const answers = node('div', 'answers');
      const options = categories.map((text, index) => ({ text, index }));
      const scaffolds = ['estudar e compreender', 'planejar e produzir', 'ouvir e cooperar'];
      (level === 3 ? shuffle(options, challengeRng) : options).forEach(({ text, index }) => answers.append(button(level === 3 ? text : `${text} · ${scaffolds[index]}`, 'rota', index)));
      stage.append(answers);
      helper.textContent = level < 3 ? 'Use os exemplos das categorias e observe o propósito da atividade.' : 'Categorias mudam de posição. Identifique o objetivo principal sem as pistas.';
    }
    act = (action, value, target) => {
      if (action !== 'rota') return;
      const good = Number(value) === current.category;
      total++;
      score(good ? 10 : 0, good, target);
      if (!active()) return;
      feedback(good, `${good ? 'Isso!' : 'Categoria principal:'} ${categories[current.category]}. ${current.explanation ?? 'Observe o propósito central da atividade.'}`, render, good ? 900 : 1300);
    };
    render();
  }

  function setupTurbo() {
    prompt.textContent = 'Precisão vale mais que pressa!';
    const turboHelp = 'Alvos positivos: 1.000 + rapidez; armadilhas não pontuam.';
    helper.textContent = turboHelp;
    const field = node('div', 'target-field');
    field.style.position = 'relative'; field.style.minHeight = '320px'; field.style.height = 'min(45vh, 430px)';
    stage.append(field);
    const positions = shuffle(Array.from({ length: 9 }, (_, i) => i), layoutRng);
    const targets = new Map();
    let sequence = 0, hits = 0;
    function spawn() {
      nextChallenge();
      const index = sequence++;
      const phase = Math.min(1, index / 18);
      const trapChance = [0, 0.10, 0.17, 0.23][level] + phase * 0.16;
      const roll = challengeRng();
      const kind = roll < trapChance ? 'trap' : roll > 0.88 ? 'bonus' : 'good';
      const iconIndex = kind === 'trap' ? 7 + Math.floor(challengeRng() * 3) : kind === 'bonus' ? 5 + Math.floor(challengeRng() * 2) : Math.floor(challengeRng() * 5);
      const labels = ['Ideia', 'Livro', 'Projeto', 'Tecnologia', 'Comunicação', 'Estrela', 'Foguete', 'Dúvida', 'Alerta', 'Atraso'];
      // Lifetime < 3 spawn intervals, irrespective of how many targets were hit.
      const interval = Math.max(1000, [0, 2050, 1750, 1500][level] - phase * 300);
      const lifetime = Math.max(1600, interval * 1.9);
      if (targets.size < 3) {
        const target = button('', 'target', index, `target ${kind}`);
        const icon = node('span', 'target-icon');
        icon.setAttribute('aria-hidden', 'true');
        Object.assign(icon.style, { display: 'block', width: '100%', height: '100%', pointerEvents: 'none', backgroundImage: 'url("./assets/visual/concepts/toque-turbo-targets-bonuses-traps-v1.png")', backgroundSize: '500% 200%', backgroundPosition: `${iconIndex % 5 * 25}% ${Math.floor(iconIndex / 5) * 100}%`, backgroundRepeat: 'no-repeat' });
        target.append(icon); target.dataset.icon = String(iconIndex);
        target.setAttribute('aria-label', `${labels[iconIndex]}: ${kind === 'trap' ? 'armadilha, não pontua' : '1.000 pontos + rapidez'}`);
        const position = positions[index % positions.length];
        Object.assign(target.style, { position: 'absolute', left: `${5 + (position % 3) * 32}%`, top: `${5 + Math.floor(position / 3) * 31}%`, width: `${level === 1 ? 26 : 23}%`, height: '25%', padding: '3px', touchAction: 'none' });
        if (kind === 'trap') target.style.backgroundColor = '#b91c1c';
        targets.set(String(index), { target, kind, startedAt: solveTime() });
        field.append(target);
        later(() => { targets.delete(String(index)); target.remove(); }, lifetime);
      }
      progress.textContent = `${hits} alvos positivos · no máximo 3 alvos na tela`;
      later(spawn, interval);
    }
    act = (action, value) => {
      if (action !== 'target') return;
      const entry = targets.get(value);
      if (!entry) return;
      targets.delete(value); // Consume before notifying the host: no double counting.
      entry.target.disabled = true;
      const good = entry.kind !== 'trap';
      if (good) hits++;
      if (good) awardSolved(entry.kind === 'bonus' ? 25 : 10, entry.target, entry.startedAt);
      else awardWrong(-5, entry.target);
      entry.target.remove();
      if (!active()) return;
      progress.textContent = `${hits} alvos positivos · no máximo 3 alvos na tela`;
      if (!good) feedback(false, 'Armadilha! Observe o símbolo antes de tocar.', () => { helper.textContent = turboHelp; });
    };
    begin = spawn;
  }

  function setupMemory() {
    const pairs = level < 3 ? 6 : 8;
    const itemNames = ['Livro aberto', 'Caderno e lápis', 'Mochila', 'Computador', 'Microscópio', 'Globo', 'Calculadora', 'Régua e esquadro', 'Paleta e pincel', 'Lâmpada', 'Capelo', 'Livros', 'Escola', 'Tubos de ensaio', 'Agenda', 'Fones'];
    const symbols = shuffle(Array.from({ length: 16 }, (_, i) => i), challengeRng).slice(0, pairs);
    const cards = shuffle(symbols.flatMap((symbol, pair) => [{ symbol, pair }, { symbol, pair }]), layoutRng);
    const grid = node('div', 'memory-grid');
    Object.assign(grid.style, { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '8px' });
    const buttons = cards.map((card, i) => {
      const target = button('', 'memory', i, 'tile memory-card');
      target.append(node('span', 'memory-back'));
      target.setAttribute('aria-label', `Carta ${i + 1}, virada para baixo`);
      target.style.minHeight = level === 1 ? '76px' : '64px';
      grid.append(target); return target;
    });
    stage.append(grid);
    prompt.textContent = 'Onde está o par?';
    helper.textContent = 'Vire uma carta, observe e procure outra igual.';
    let first = null, found = 0;
    const matched = new Set();
    function update() { progress.textContent = `${found} / ${pairs} pares`; }
    function conceal(index) {
      buttons[index].replaceChildren(node('span', 'memory-back')); buttons[index].classList.remove('chosen', 'flipped');
      buttons[index].setAttribute('aria-label', `Carta ${index + 1}, virada para baixo`);
    }
    act = (action, value, target) => {
      const index = Number(value);
      if (action !== 'memory' || matched.has(index) || first === index) return;
      const art = node('span', 'memory-item');
      art.setAttribute('aria-hidden', 'true');
      art.style.backgroundPosition = `${cards[index].symbol % 4 * 100 / 3}% ${Math.floor(cards[index].symbol / 4) * 100 / 3}%`;
      target.replaceChildren(art);
      target.setAttribute('aria-label', `Carta ${index + 1}: ${itemNames[cards[index].symbol]}`);
      target.classList.add('chosen', 'flipped');
      if (first === null) { first = index; return; }
      const previous = first; first = null;
      const good = cards[previous].pair === cards[index].pair;
      if (good) {
        matched.add(previous); matched.add(index); found++;
        buttons[previous].classList.add('matched'); target.classList.add('matched');
        buttons[previous].disabled = true; target.disabled = true;
        score(20, true, target); update();
        if (!active()) return;
        if (found === pairs) { finish(); return; }
        feedback(true, 'Par encontrado! Continue observando.', nextChallenge, 350);
      } else {
        score(0, false, target);
        if (active()) feedback(false, 'Observe as posições. As cartas voltarão a virar.', () => { conceal(previous); conceal(index); helper.textContent = 'Procure outro par.'; }, level === 1 ? 1500 : 1000);
      }
    };
    update(); nextChallenge();
  }

  function wordReader() {
    const readers = new Map();
    return () => {
      if (!readers.has(level)) readers.set(level, pairedWordReader());
      return readers.get(level)();
    };
  }

  function pairedWordReader() {
    const bank = wordBank();
    const filtered = bank.filter(({ word }) => level === 1 ? word.length <= 5 : level === 3 ? word.length >= 6 && word.length <= 9 : word.length >= 4 && word.length <= 7);
    // Dedicated stream: choosing a different solution must not alter later challenges.
    const wordRng = seededRandom(`${seed}:${id}:paired-words:${level}`);
    const buckets = new Map();
    for (const entry of filtered.length ? filtered : bank) {
      const frequencies = [...new Set(entry.word)].map(letter => [...entry.word].filter(value => value === letter).length).sort((a, b) => a - b);
      const key = `${entry.word.length}:${frequencies.join('.')}`;
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(entry);
    }
    const right = side === 1 || /^(1|right|direita|orange|laranja)$/i.test(String(side));
    let deck = [], cursor = 0;
    return () => {
      if (cursor >= deck.length) {
        const pairs = [];
        for (const bucket of buckets.values()) {
          const mixed = shuffle(bucket, wordRng);
          for (let i = 0; i + 1 < mixed.length; i += 2) pairs.push([mixed[i], mixed[i + 1]]);
        }
        // A singleton bucket is equally difficult for both sides and keeps a
        // custom/small bank finite instead of producing an empty reader.
        if (!pairs.length) for (const entry of filtered.length ? filtered : bank) pairs.push([entry, entry]);
        deck = shuffle(pairs, wordRng); cursor = 0;
      }
      return deck[cursor++][right ? 1 : 0];
    };
  }

  function setupSecret() {
    const read = wordReader();
    let current, mistakes = 0, completed = 0;
    const guessed = new Set();
    let slots, fuel, fuelLabel;
    function paint() {
      slots.replaceChildren();
      for (const letter of current.word) slots.append(node('span', 'letter', guessed.has(letter) ? letter : '＿'));
      fuel.firstChild.style.width = `${(6 - mistakes) / 6 * 100}%`;
      fuelLabel.textContent = `Combustível: ${6 - mistakes}/6`;
      appendUiIcon(fuelLabel, 'rocket');
      fuel.setAttribute('aria-label', `${6 - mistakes} unidades de combustível`);
      fuel.setAttribute('aria-valuenow', String(6 - mistakes));
      progress.textContent = `${completed} palavras descobertas`;
    }
    function render() {
      nextChallenge();
      current = read(); mistakes = 0; guessed.clear();
      prompt.textContent = level === 3 ? `Descubra a palavra · ${current.word.length} letras` : current.hint;
      helper.textContent = level === 3 ? `Dica: ${current.hint}` : 'Acentos não mudam a tecla: A também vale para Ã.';
      stage.replaceChildren();
      fuel = node('div', 'fuel'); slots = node('div', 'word-slots');
      fuel.setAttribute('role', 'meter'); fuel.setAttribute('aria-valuemin', '0'); fuel.setAttribute('aria-valuemax', '6');
      const bar = node('div', 'fuel-fill');
      Object.assign(bar.style, { height: '100%', background: 'linear-gradient(90deg, #ffb058, #74dba3)' });
      fuel.append(bar); fuelLabel = node('div', 'helper');
      slots.style.display = 'flex'; slots.style.flexWrap = 'wrap'; slots.style.justifyContent = 'center';
      const keyboard = node('div', 'answers');
      Object.assign(keyboard.style, { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' });
      const letters = [...new Set(current.word)];
      const alphabet = shuffle([... 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].filter(letter => !letters.includes(letter)), challengeRng);
      const keyCount = level === 1 ? 12 : level === 3 ? 16 : 14;
      letters.push(...alphabet.slice(0, keyCount - letters.length));
      shuffle(letters, layoutRng).forEach(letter => keyboard.append(button(letter, 'guess', letter, 'letter')));
      stage.append(fuelLabel, fuel, slots, keyboard); paint();
    }
    act = (action, value, target) => {
      if (action !== 'guess' || guessed.has(value)) return;
      guessed.add(value); target.disabled = true; target.classList.add('chosen');
      const good = current.word.includes(value);
      if (!good) mistakes++;
      paint();
      if ([...current.word].every(letter => guessed.has(letter))) {
        completed++; paint(); score(20 + (6 - mistakes) * 5, true, target);
        if (active()) feedback(true, `Decolou! A palavra é ${current.word}.`, render, 1000);
      } else if (!good) {
        score(0, false, target);
        if (active()) feedback(false, mistakes === 6 ? `Sem combustível. A palavra era ${current.word}. Vamos tentar outra!` : 'Essa letra não aparece. Observe as letras reveladas.', mistakes === 6 ? render : null, mistakes === 6 ? 1700 : 1000);
      } else helper.textContent = 'Essa letra faz parte da palavra!';
    };
    render();
  }

  function setupScramble() {
    const read = wordReader();
    let current, letters = [], chosen = [], completed = 0;
    let slots, pool, check;
    function paint() {
      slots.replaceChildren(); pool.replaceChildren();
      chosen.forEach(tokenId => slots.append(button(letters[tokenId].letter, 'return', tokenId, 'letter chosen')));
      for (let i = chosen.length; i < letters.length; i++) slots.append(node('span', 'letter', '＿'));
      letters.forEach(token => {
        const target = button(token.letter, 'letter', token.id, 'letter');
        target.disabled = chosen.includes(token.id); pool.append(target);
      });
      check.disabled = chosen.length !== letters.length;
      progress.textContent = `${completed} palavras organizadas · ${chosen.length}/${letters.length} letras`;
    }
    function render() {
      nextChallenge();
      current = read(); chosen = [];
      let mixed = shuffle([...current.word], layoutRng);
      if (mixed.join('') === current.word) {
        const j = mixed.findIndex(letter => letter !== mixed[0]);
        if (j > 0) [mixed[0], mixed[j]] = [mixed[j], mixed[0]];
      }
      letters = mixed.map((letter, tokenId) => ({ letter, id: tokenId }));
      prompt.textContent = current.hint;
      helper.textContent = 'Escolha as letras em ordem. Toque em uma letra escolhida para devolvê-la.';
      stage.replaceChildren();
      slots = node('div', 'word-slots'); pool = node('div', 'answers');
      for (const row of [slots, pool]) Object.assign(row.style, { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px' });
      check = button('Conferir palavra', 'check');
      stage.append(slots, pool, check); paint();
    }
    act = (action, value, target) => {
      const tokenId = Number(value);
      if (action === 'letter' && !chosen.includes(tokenId)) chosen.push(tokenId);
      else if (action === 'return') chosen = chosen.filter(token => token !== tokenId);
      else if (action === 'check' && chosen.length === letters.length) {
        const good = chosen.map(token => letters[token].letter).join('') === current.word;
        if (good) completed++;
        score(good ? 20 : 0, good, target);
        if (active()) feedback(good, good ? `Isso! ${current.word}.` : 'Ainda não é essa ordem. Devolva as letras e tente novamente.', good ? render : () => { chosen = []; paint(); });
        return;
      } else return;
      paint();
    };
    render();
  }

  function setupSearch() {
    nextChallenge();
    const size = level === 3 ? 8 : 7;
    const bank = shuffle(wordBank().filter(item => item.word.length <= size), challengeRng);
    const entries = bank.slice(0, level === 1 ? 4 : level === 3 ? 6 : 5);
    // A board is a shared challenge, including its direction mix. Side-specific
    // layout randomness must not give one player easier word orientations.
    const { grid, placements } = buildWordSearch(entries, seededRandom(`${seed}:search:board:${level}`), { size });
    const found = new Set();
    const board = node('div', 'search-grid');
    board.dataset.size = String(size);
    Object.assign(board.style, { display: 'grid', gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`, width: 'min(100%, 460px)', aspectRatio: '1 / 1', gap: '3px', touchAction: 'none' });
    const cells = grid.flat().map((letter, i) => {
      const cell = node('div', 'letter search-cell', letter);
      cell.dataset.cell = String(i);
      cell.setAttribute('aria-label', `${letter}, linha ${Math.floor(i / size) + 1}, coluna ${i % size + 1}`);
      Object.assign(cell.style, { minWidth: '0', minHeight: '0', padding: '0', display: 'grid', placeItems: 'center' });
      board.append(cell); return cell;
    });
    const list = node('div', 'word-slots');
    const labels = placements.map(entry => { const label = node('span', 'letter', entry.word); list.append(label); return label; });
    Object.assign(list.style, { display: 'flex', flexWrap: 'wrap', gap: '10px' });
    stage.append(list, board);
    prompt.textContent = 'Encontre as palavras na grade';
    helper.textContent = 'Oito direções, incluindo diagonais e palavras invertidas. Arraste ou toque nas duas pontas.';
    const update = () => { progress.textContent = `${found.size} / ${placements.length} palavras encontradas`; };
    const lineBetween = (a, b) => searchPath(a, b, size);
    const mark = line => cells.forEach((cell, i) => cell.classList.toggle('chosen', line.includes(i) && !cell.dataset.found));
    function evaluate(line) {
      if (line.length < 2) return;
      const forward = line.join(','), backward = [...line].reverse().join(',');
      const index = placements.findIndex(entry => { const key = entry.cells.join(','); return key === forward || key === backward; });
      const last = cells[line[line.length - 1]];
      if (index >= 0 && found.has(index)) { helper.textContent = 'Essa palavra já foi encontrada. Procure outra.'; return; }
      if (index < 0) {
        line.forEach(i => cells[i].classList.add('wrong'));
        later(() => line.forEach(i => cells[i].classList.remove('wrong')), 500);
        score(-5, false, last);
        if (active()) feedback(false, 'Esse trecho não é uma palavra da lista. Tente de novo.', null);
        return;
      }
      found.add(index); labels[index].classList.add('chosen'); labels[index].style.textDecoration = 'line-through';
      placements[index].cells.forEach(i => { cells[i].classList.add('found'); cells[i].dataset.found = 'true'; });
      score(20, true, last); update();
      if (!active()) return;
      if (found.size === placements.length) finish();
      else { nextChallenge(); helper.textContent = `${placements[index].word}: encontrada!`; }
    }
    const cellFromEvent = event => { const el = event.target?.closest?.('.search-cell'); return el && board.contains(el) ? Number(el.dataset.cell) : null; };
    const cellAtPoint = event => { const el = doc.elementFromPoint?.(event.clientX, event.clientY)?.closest?.('.search-cell'); return el && board.contains(el) ? Number(el.dataset.cell) : null; };
    let drag = null, tapStart = null;
    listen('pointerdown', event => {
      if (!active() || locked || drag || (event.button !== undefined && event.button !== 0)) return;
      const start = cellFromEvent(event);
      if (start === null) return;
      event.preventDefault();
      drag = { id: event.pointerId, start, end: start, chain: tapStart };
      try { root.setPointerCapture?.(event.pointerId); } catch { /* Eventos sintéticos não têm ponteiro ativo. */ }
      mark([start]);
    });
    listen('pointermove', event => {
      if (!drag || drag.id !== event.pointerId || !active()) return;
      const at = cellAtPoint(event);
      if (at === null || at === drag.end) return;
      drag.end = at; tapStart = null;
      mark(lineBetween(drag.start, at));
    });
    function release(event, cancelled) {
      if (!drag || drag.id !== event.pointerId) return;
      const d = drag; drag = null;
      try { root.releasePointerCapture?.(event.pointerId); } catch { /* Já liberado. */ }
      if (cancelled || !active() || locked) { mark([]); tapStart = null; return; }
      // Capture keeps event.target at the origin; hit-test the release point too,
      // even when a fast drag never produced an intermediate pointermove.
      const releasedAt = cellAtPoint(event);
      if (releasedAt !== null) d.end = releasedAt;
      if (d.start === d.end) {
        // Toque simples: a primeira ponta fica marcada e o próximo toque fecha a palavra.
        if (d.chain !== null && d.chain !== d.start) { tapStart = null; mark([]); evaluate(lineBetween(d.chain, d.start)); return; }
        tapStart = d.start; mark([d.start]); helper.textContent = 'Agora toque na última letra da palavra.';
        return;
      }
      tapStart = null;
      const line = lineBetween(d.start, d.end);
      mark([]);
      evaluate(line);
    }
    listen('pointerup', event => release(event, false));
    listen('pointercancel', event => release(event, true));
    listen('lostpointercapture', event => release(event, true));
    cancelSelection = () => { drag = null; tapStart = null; mark([]); };
    update();
  }

  const ctx = {
    id, side, seed, solo, get level() { return level; }, doc, view, root, stage, prompt, progress, helper, node, button, listen, active, later, score, finish, feedback,
    awardSolved, awardWrong, nextChallenge, blockChallenge, unblockChallenge, solveTime,
    challengeRng, layoutRng, shuffle, seededRandom, normalizeWord, wordBank,
    setAct: fn => { act = fn; }, setCancel: fn => { cancelSelection = fn; }, onDestroy: fn => { destroyHooks.push(fn); },
  };

  switch (id) {
    case 'turbo': setupTurbo(); break;
    case 'rope': setupQuiz(); break;
    case 'rota': setupRota(); break;
    case 'memory': setupMemory(); break;
    case 'puzzle': setupJigsaw(ctx); break;
    case 'secret': setupSecretRace(ctx); break;
    case 'forca': setupSecret(); break;
    case 'scramble': setupScramble(); break;
    case 'search': setupSearch(); break;
    case 'balanca': setupBalance(ctx); break;
    case 'silabas': setupSyllables(ctx); break;
    case 'erro': setupMistake(ctx); break;
  }
  root.dataset.state = 'ready';
  if (!root.dataset.level) nextChallenge();

  return {
    getStats() {
      return { correct: completed, completed, wrong, score: points, bonus: totalBonus, level, nextLevel: Math.min(3, initialLevel + Math.floor(completed / 3)), elapsedMs: Math.round(gameTime()), solveElapsedMs: Math.round(solveTime() - challengeStartedAt), lastAward: lastAward && { ...lastAward } };
    },
    start() {
      if (started || destroyed || finished) return;
      started = true; paused = false; runningSince = now(); challengeStartedAt = solveTime();
      root.dataset.state = 'playing';
      for (const timer of timers) arm(timer);
      begin();
    },
    pause() {
      if (!active()) return;
      elapsed = gameTime(); paused = true;
      for (const timer of timers) if (timer.handle !== null) {
        timer.remaining = Math.max(0, timer.remaining - (now() - timer.at));
        view.clearTimeout(timer.handle); timer.handle = null;
      }
      cancelSelection();
      root.dataset.state = 'paused';
    },
    resume() {
      if (!started || !paused || destroyed || finished) return;
      paused = false; runningSince = now();
      root.dataset.state = 'playing';
      for (const timer of timers) arm(timer);
    },
    destroy() {
      if (destroyed) return;
      elapsed = gameTime();
      destroyed = true;
      stopTimers(); cancelSelection();
      for (const hook of destroyHooks) hook();
      for (const [type, listener] of listeners) root.removeEventListener(type, listener);
      root.remove();
    },
  };
}
