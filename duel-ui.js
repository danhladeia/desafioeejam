// Telas do Modo Duelo: acesso, configuração, sorteio animado, placar e resultado final.
import {
  DUEL_TURNS, DUEL_CLASSES, createDuel, drawTurn, redrawStudents, commitTurn, standings, leaders, isFinished,
  saveDuel, loadDuel, clearDuel, parseNames, loadBraga, saveBraga, loadEnabledGames, saveEnabledGames,
} from './duel.js';
import { ROSTER } from './roster.js';
import { newSeal } from './new-art.js';
import { uiIcon } from './ui-art.js';

// Só o resumo do token fica no código. Impede espiar a senha, mas não é segurança de verdade.
const TOKEN_HASH = '9413dbc5150483f165161c0abfcbe3474465f5131c4ae8e0aa69236e15067c26';
const COLORS = { a: '#34d399', b: '#a78bfa', m: '#ffd63d' };
export const DUEL_SPIN_MS = 5000;
export const RANKING_REVEAL_MS = 2000;

async function sha256(text) {
  const bytes = new TextEncoder().encode(text.trim().toLowerCase());
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function createDuelUI(api) {
  const { $, esc, art, GAMES, modal } = api;
  const button = (label, action, cls = 'secondary', extra = '') => api.button(label, action, cls, extra);
  const ico = (name, label, action) => `<button class="ico" aria-label="${esc(label)}" data-action="${action}">${uiIcon(name)}</button>`;
  let duel = null, restoreError = '';
  try { duel = loadDuel(); } catch (e) { restoreError = e.message; }
  let enabledGames = loadEnabledGames(GAMES.map((g) => g.id));
  let unlocked = false;
  let turnsChoice = duel && !isFinished(duel) ? duel.turns : 10;
  let timers = [];
  let animations = [];
  let observer = null;
  let rankingBusy = false;

  const rosterOf = (id) => (id === 'm' ? loadBraga() : ROSTER[id]);
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; animations.forEach((a) => a.cancel()); animations = []; observer?.disconnect(); observer = null; rankingBusy = false; };
  const show = (name, html, cls = 'duel') => {
    clearTimers(); api.show(name, html, cls);
    const root = document.querySelector('#app')?.firstElementChild;
    if (root) { observer = new MutationObserver(() => { if (!root.isConnected) clearTimers(); }); observer.observe(root.parentNode, { childList: true }); }
  };
  const reduced = () => api.prefs?.reduced || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const persist = () => { if (!saveDuel(duel)) api.toast('Não foi possível salvar o duelo neste aparelho. Mantenha esta tela aberta.'); };
  const rand = (list) => list[Math.floor(Math.random() * list.length)];
  const minutes = (n) => Math.round(n * 2.5);

  /* ---------- Acesso ---------- */
  function open() {
    if (unlocked) return setup();
    modal.oncancel = null;
    modal.innerHTML = `<h2>Modo Duelo</h2><p>Digite o token do professor para continuar.</p>
      <form id="token-form" autocomplete="off"><input id="token" class="token-input" type="password" inputmode="text" autocapitalize="none" autocorrect="off" spellcheck="false" aria-label="Token do professor" aria-describedby="token-error">
      <p class="form-error" id="token-error" role="alert"></p>
      <div class="actions"><button type="button" class="secondary" id="token-cancel">Cancelar</button><button type="submit" class="primary">Entrar</button></div></form>`;
    modal.showModal();
    const input = $('#token');
    input.focus();
    $('#token-cancel').onclick = () => modal.close();
    $('#token-form').onsubmit = async (e) => {
      e.preventDefault();
      try {
        if ((await sha256(input.value)) === TOKEN_HASH) { unlocked = true; modal.close(); setup(); return; }
        $('#token-error').textContent = 'Token incorreto. Tente de novo.';
      } catch {
        $('#token-error').textContent = 'Este navegador não consegue conferir o token. Abra o jogo por localhost ou HTTPS.';
      }
      input.value = '';
      input.classList.remove('shake'); void input.offsetWidth; input.classList.add('shake');
      input.focus();
    };
  }

  /* ---------- Configuração ---------- */
  function setup() {
    const counts = { a: ROSTER.a.length, b: ROSTER.b.length, m: loadBraga().length };
    const cards = DUEL_CLASSES.map((c, i) => `<div class="class-card" style="--c:${COLORS[c.id]};--i:${i}"><div><b>${esc(c.name)}</b><small>${counts[c.id] ? `${counts[c.id]} alunos no sorteio` : 'Nenhum aluno ainda'}</small></div>${c.id === 'm' ? `<button class="secondary small" data-action="duel-names">${counts.m ? 'Editar nomes' : 'Adicionar nomes'}</button>` : ''}</div>`).join('');
    let resume = '';
    if (duel) {
      const done = isFinished(duel);
      resume = `<div class="resume"><div><b>${done ? 'Último duelo terminado' : 'Duelo em andamento'}</b><small>${done ? `${duel.turns} rodadas jogadas` : `Rodada ${duel.done + (duel.current ? 1 : 1)} de ${duel.turns}`}</small></div><button class="secondary small" data-action="duel-resume">${done ? 'Ver resultado' : 'Continuar'}</button></div>`;
    }
    show('duel-setup', `<div class="duel-head">${ico('back', 'Voltar', 'home')}<h1>Modo Duelo</h1></div>
      ${restoreError ? `<p class="duel-restore-error" role="alert">${esc(restoreError)}</p>` : ''}
      <div class="duel-setup"><div class="duel-options"><section class="duel-classes" aria-label="Turmas">${cards}</section>
      <section class="duel-games" aria-labelledby="duel-games-title"><h2 id="duel-games-title">Jogos habilitados</h2><p>Escolha os jogos antes do primeiro sorteio.</p>
      <div class="duel-game-options">${GAMES.map((g) => `<button class="duel-game-option ${enabledGames.includes(g.id) ? 'on' : ''}" data-action="duel-game" data-id="${g.id}" aria-pressed="${enabledGames.includes(g.id)}">${esc(g.title)}</button>`).join('')}</div>
      <p class="form-error" id="duel-games-error" role="alert">${enabledGames.length ? '' : 'Selecione ao menos um jogo.'}</p></section></div>
      <section class="duel-config">${resume}<h2>Quantas rodadas?</h2>
        <div class="chips" role="group" aria-label="Número de rodadas">${DUEL_TURNS.map((n) => `<button class="chip ${n === turnsChoice ? 'on' : ''}" data-action="duel-turns" data-n="${n}" aria-pressed="${n === turnsChoice}">${n}</button>`).join('')}</div>
        <p class="hint" id="duel-eta"></p>
        <button class="primary" data-action="duel-start" ${counts.m && enabledGames.length ? '' : 'disabled'}>Começar duelo ${uiIcon('next')}</button>
        <button class="text-button" data-action="duel-wipe">Apagar dados do duelo</button></section></div>`);
    eta();
  }

  function eta() {
    const el = $('#duel-eta');
    if (el) el.textContent = `${turnsChoice - 1} classificatórias e 1 final entre as duas líderes. Nenhum aluno joga duas vezes. Tempo aproximado: ${minutes(turnsChoice)} min.`;
  }

  function toggleGame(id) {
    if (!GAMES.some((g) => g.id === id)) return;
    if (enabledGames.includes(id) && enabledGames.length === 1) {
      $('#duel-games-error').textContent = 'Mantenha ao menos um jogo habilitado.';
      return;
    }
    enabledGames = enabledGames.includes(id) ? enabledGames.filter((g) => g !== id) : [...enabledGames, id];
    if (!saveEnabledGames(enabledGames)) api.toast('Não foi possível guardar a seleção de jogos.');
    setup();
  }

  function editNames() {
    modal.oncancel = null;
    modal.innerHTML = `<h2>Alunos do 9º M. Braga</h2><p>Um nome por linha, só o primeiro nome. Se houver dois iguais, acrescente a inicial do sobrenome, como João P.</p>
      <textarea id="braga-names" rows="9" spellcheck="false" aria-label="Nomes dos alunos">${esc(loadBraga().join('\n'))}</textarea>
      <p class="form-error" id="braga-error" role="alert"></p>
      <div class="actions"><button class="secondary" id="braga-cancel">Cancelar</button><button class="primary" id="braga-save">Salvar nomes</button></div>`;
    modal.showModal();
    $('#braga-cancel').onclick = () => modal.close();
    $('#braga-save').onclick = () => {
      const { names, duplicates, long, tooMany } = parseNames($('#braga-names').value);
      const problem = duplicates.length ? `Nome repetido: ${duplicates.join(', ')}. Acrescente a inicial do sobrenome.`
        : long.length ? `Nome muito longo: ${long[0]}. Use até 24 letras.`
          : tooMany ? 'Use no máximo 60 alunos.' : '';
      if (problem) { $('#braga-error').textContent = problem; return; }
      saveBraga(names);
      modal.close();
      setup();
    };
  }

  async function start() {
    const classes = DUEL_CLASSES.map((c) => ({ id: c.id, name: c.name, students: rosterOf(c.id) }));
    let fresh;
    try { fresh = createDuel({ turns: turnsChoice, classes, games: enabledGames }); } catch (e) { return api.toast(e.message); }
    if ((restoreError || (duel && !isFinished(duel))) && !(await api.ask('Começar um novo duelo?', restoreError ? 'O duelo salvo incompatível será substituído. Guarde um backup antes de continuar.' : 'O duelo em andamento será substituído.'))) return;
    duel = fresh;
    restoreError = '';
    saveEnabledGames(enabledGames);
    persist();
    draw('full');
  }

  function resume() {
    if (!duel) return setup();
    if (isFinished(duel)) return final();
    draw(duel.current ? 'static' : 'full');
  }

  async function wipe() {
    if (!(await api.ask('Apagar dados do duelo?', 'Remove o duelo salvo e os nomes do 9º M. Braga deste aparelho.'))) return;
    clearDuel(); saveBraga([]); duel = null; restoreError = ''; setup();
  }

  /* ---------- Sorteio animado ---------- */
  function strip(cells) { return `<div class="strip">${cells.join('')}</div>`; }

  function gameCells(winnerId, F) {
    const cell = (g) => `<div class="cell">${newSeal(g.id)||`<img src="${art('seal-' + g.id)}" alt="">`}</div>`;
    const games = GAMES.filter((g) => duel.games.includes(g.id));
    const cells = [];
    for (let i = 0; i < F; i++) { const options = games.filter((g) => g.id !== cells.at(-1)?.id); cells.push(rand(options.length ? options : games)); }
    const winner = GAMES.find((g) => g.id === winnerId);
    return [...cells.map(cell), cell(winner), cell(rand(games.filter((g) => g.id !== winnerId)) ?? winner)];
  }

  function textCells(list, winner, F) {
    const cells = [];
    for (let i = 0; i < F; i++) { const options = list.filter((t) => t !== cells.at(-1)); cells.push(rand(options.length ? options : list)); }
    return [...cells, winner].map((t) => `<div class="cell">${esc(t)}</div>`);
  }

  /** Sorteio completo: 5 segundos. Trocas individuais animam apenas o aluno trocado. */
  function draw(mode = 'full') {
    if (!duel.current) {
      try { drawTurn(duel); persist(); }
      catch (e) { show('duel-exhausted', `<div class="duel-exhausted"><h1>Sorteio interrompido</h1><p role="alert">${esc(e.message)}</p>${button('Rever configuração', 'duel-setup', 'primary')}</div>`); return; }
    }
    const d = duel.current;
    const game = GAMES.find((g) => g.id === d.gameId);
    if (!game || duel.games.some((id) => !GAMES.some((g) => g.id === id))) { api.toast('Um jogo deste duelo não está disponível. O duelo salvo foi preservado; confira a configuração ou o backup.'); return setup(); }
    const F = { game: 48, cls: 44, stu: 50 };
    const classNames = duel.classes.map((c) => c.name);
    const pips = Array.from({ length: duel.turns }, (_, i) => `<i class="${i < duel.done ? 'done' : i === duel.done ? 'now' : ''}"></i>`).join('');
    const side = (s, i) => {
      const students = duel.classes.find((c) => c.id === s.classId).students.filter((n) => !duel.used[s.classId].includes(n) && !d.refused[i].includes(n));
      return `<section class="dd-side ${i ? 'orange' : 'blue'}" data-i="${i}"><small>Turma • lado ${i ? 'laranja' : 'azul'}</small>
        <div class="reel reel-v reel-class" data-reel="c${i}">${strip(textCells(classNames, s.className, F.cls))}</div>
        <small>Aluno</small><div class="reel reel-v reel-student" data-reel="s${i}">${strip(textCells(students, s.student, F.stu))}</div>
        <button class="secondary small dd-redraw" data-action="duel-student" data-side="${i}" disabled>${uiIcon('shuffle')} Trocar aluno do lado ${i ? 'laranja' : 'azul'}</button></section>`;
    };
    show('duel-draw', `<div class="duel-draw">
      <div class="dd-head"><div class="dd-round">Rodada <b>${d.turn}</b> de ${duel.turns}${d.isFinal ? ` <span class="final-tag">${uiIcon('trophy')} FINAL</span>` : ''}</div><div class="pips" aria-hidden="true">${pips}</div><span class="dd-status" id="dd-status" role="status">Sorteando por 5 segundos...</span></div>
      <div class="reel reel-h reel-game" data-reel="game" role="img" aria-label="Sorteio do jogo">${strip(gameCells(d.gameId, F.game))}</div>
      <h2 class="dd-game" id="dd-game" aria-live="polite">${esc(game.title)}</h2>
      <div class="dd-sides">${side(d.sides[0], 0)}<b class="dd-vs" id="dd-vs" aria-label="versus">${uiIcon('versus')}</b>${side(d.sides[1], 1)}</div>
      <p class="dd-error form-error" id="dd-error" role="alert"></p>
      <div class="dd-actions" id="dd-actions">${button(`Pausar duelo ${uiIcon('pause')}`, 'home')}${button(`${d.isFinal ? 'Começar final' : 'Começar duelo'} ${uiIcon('next')}`, 'duel-play', 'primary')}</div></div>`);

    const root = $('.duel-draw');
    const R = (key) => root.querySelector(`[data-reel="${key}"]`);
    const at = (ms, fn) => timers.push(setTimeout(() => { if (root.isConnected) fn(); }, ms));
    // Posição final em % do próprio comprimento da faixa, para não depender do tamanho da tela.
    // A faixa do jogo tem F+2 itens e o vencedor fica no meio da janela de 3; as demais têm F+1 e o vencedor é o último.
    const stops = { game: ((F.game - 1) / (F.game + 2)) * 100, c0: (F.cls / (F.cls + 1)) * 100, c1: (F.cls / (F.cls + 1)) * 100, s0: (F.stu / (F.stu + 1)) * 100, s1: (F.stu / (F.stu + 1)) * 100 };

    const place = (key, ms) => {
      const el = R(key); const st = el.querySelector('.strip');
      const pos = stops[key];
      const move = key === 'game' ? `translate3d(${-pos}%,0,0)` : `translate3d(0,${-pos}%,0)`;
      st.style.transition = 'none';
      st.style.transform = move;
      if (ms) {
        el.classList.add('spin');
        const middle = key === 'game' ? `translate3d(${-pos * .7}%,0,0)` : `translate3d(0,${-pos * .7}%,0)`;
        animations.push(st.animate([
          { transform: 'translate3d(0,0,0)', offset: 0, easing: 'linear' },
          { transform: middle, offset: .44, easing: 'cubic-bezier(0,.65,.25,1)' },
          { transform: move, offset: 1 },
        ], { duration: ms, easing: 'linear' }));
      }
    };
    const lock = (key, celebrate = true) => {
      const el = R(key);
      el.classList.remove('spin'); el.classList.add('locked');
      if (celebrate) { api.sound(true); const r = el.getBoundingClientRect(); api.burst(r.x + r.width / 2, r.y + r.height / 2, true, 14); }
    };
    const showGame = () => $('#dd-game').classList.add('on');
    const finishUp = (animated) => {
      $('#dd-vs').classList.add('on');
      $('#dd-actions').classList.add('show');
      root.ready = true;
      root.querySelectorAll('.dd-redraw').forEach((b) => { b.disabled = false; });
      $('#dd-status').textContent = d.isFinal ? 'Final: a vitória decide a turma campeã.' : 'Participantes revelados. Tudo pronto!';
      if (animated) api.sound(true);
    };
    const settle = (keys) => keys.forEach((k) => { place(k, 0); lock(k, false); });
    const skip = () => { clearTimers(); settle(['game', 'c0', 'c1', 's0', 's1']); showGame(); finishUp(false); };
    root.ready = false;
    if (mode === 'static' || reduced()) { skip(); return; }
    const keys = ['game', 'c0', 'c1', 's0', 's1'];
    const moving = mode === 'students' ? ['s0', 's1'] : /^s[01]$/.test(mode) ? [mode] : keys;
    settle(keys.filter((k) => !moving.includes(k)));
    if (mode !== 'full') showGame();
    const duration = mode === 'full' ? DUEL_SPIN_MS : 800;
    moving.forEach((k) => place(k, duration));
    at(duration, () => { moving.forEach((k) => lock(k, false)); showGame(); finishUp(true); });
  }

  function redrawNames(sideIndex) {
    if (!$('.duel-draw')?.ready) return;
    try { redrawStudents(duel, Math.random, sideIndex); }
    catch (e) { $('#dd-error').textContent = e.message; api.toast(e.message); return; }
    persist();
    draw(sideIndex === undefined ? 'students' : `s${sideIndex}`);
  }

  function play() {
    if (!$('.duel-draw')?.ready) return;
    const d = duel.current;
    clearTimers();
    api.startMatch({
      gameId: d.gameId,
      names: d.sides.map((s) => s.student),
      labels: d.sides.map((s) => s.className),
      turn: d.turn,
      total: duel.turns,
      isFinal: d.isFinal,
    });
  }

  /* ---------- Resultado da rodada, placar e fim ---------- */
  function result(s) {
    const d = duel.current;
    const w = s.winner;
    const win = d.sides[w];
    show('result', `<div class="result"><span class="eyebrow">${s.tie ? 'Desempate decidido' : 'Que duelo!'}</span>
      <img class="winner-m" src="${art(w ? 'pipo-comemora' : 'faisca-comemora')}" alt="">
      <h1>${esc(win.student)}<br><span>${esc(win.className)} venceu ${d.isFinal ? 'a FINAL' : 'a rodada'}!</span></h1>
      <div class="result-scores"><span>${esc(d.sides[0].student)} <b>${s.scores[0]}</b></span><em>${uiIcon('versus')}</em><span>${esc(d.sides[1].student)} <b>${s.scores[1]}</b></span></div>
      <div class="actions">${button(`Confirmar e ver placar ${uiIcon('confirm')}`, 'duel-confirm', 'primary')}${button('Repetir partida', 'replay')}</div></div>`, '');
  }

  function confirm() {
    const s = api.getSession();
    if (!s || !s.ended || !s.duel || !duel.current) return;
    const previous = standings(duel);
    try { commitTurn(duel, { scores: [...s.scores], winnerSide: s.winner }); } catch (e) { return api.toast(e.message); }
    persist();
    api.dispose();
    score(previous);
  }

  const card = (t, i, extra = '') => `<div class="st-card ${extra}" style="--c:${COLORS[t.id]};--i:${i}"><span class="rank">${i + 1}º</span><b class="st-name">${esc(t.name)}</b><span class="wins" aria-label="${t.wins} vitórias">${t.wins}</span><small>${t.wins === 1 ? 'vitória' : 'vitórias'}</small><span class="st-meta">${t.played} ${t.played === 1 ? 'jogo' : 'jogos'} • ${t.points} pontos</span></div>`;

  function score(previous = []) {
    const last = duel.history[duel.history.length - 1];
    const gameTitle = (id) => GAMES.find((g) => g.id === id)?.title ?? id;
    const row = (h) => `<li><b>${h.isFinal ? 'Final' : h.turn}</b><span>${esc(gameTitle(h.gameId))}</span><span class="${h.winnerSide === 0 ? 'won' : ''}">${esc(h.sides[0].student)} <i>${esc(h.sides[0].className.replace(' EEJAM', ''))}</i> ${h.scores[0]}</span><em>${uiIcon('versus')}</em><span class="${h.winnerSide === 1 ? 'won' : ''}">${h.scores[1]} ${esc(h.sides[1].student)} <i>${esc(h.sides[1].className.replace(' EEJAM', ''))}</i></span></li>`;
    show('duel-score', `<div class="duel-head"><h1>Placar do duelo</h1><span class="duel-sub">Rodada ${last.turn} de ${duel.turns} concluída</span></div>
      <p class="ranking-status" role="status">${uiIcon('ranking')} Atualizando a classificação...</p>
      <div class="standings ranking-reveal" aria-busy="true">${standings(duel).map((t, i) => card(t, i, t.id === last.winnerClassId ? 'just' : '')).join('')}</div>
      <ul class="recent" aria-label="Últimas rodadas">${duel.history.slice(-3).reverse().map(row).join('')}</ul>
      <div class="actions">${button(`Pausar duelo ${uiIcon('pause')}`, 'home')}${button(`${isFinished(duel) ? 'Ver campeão' : duel.done === duel.turns - 1 ? 'Sortear a FINAL' : `Sortear rodada ${duel.done + 1}`} ${uiIcon('next')}`, 'duel-next', 'primary', 'disabled')}</div>`);
    const root = $('.ranking-reveal');
    const cards = [...root.querySelectorAll('.st-card')];
    const table = standings(duel);
    const finish = () => {
      cards.forEach((c) => c.classList.add('revealed'));
      root.setAttribute('aria-busy', 'false');
      $('.ranking-status').textContent = isFinished(duel) ? 'Final confirmada. Conheça a turma campeã!' : duel.done === duel.turns - 1 ? 'As duas primeiras turmas disputarão a FINAL!' : 'Classificação atualizada.';
      $('[data-action="duel-next"]').disabled = false;
      rankingBusy = false;
    };
    if (reduced()) { finish(); return; }
    rankingBusy = true;
    cards.forEach((c, i) => {
      timers.push(setTimeout(() => {
        if (!root.isConnected) return;
        c.classList.add('revealed');
        const old = previous.findIndex((t) => t.id === table[i].id);
        if (old >= 0 && old !== i) animations.push(c.animate([{ transform: `translateX(${(old - i) * 25}%)`, opacity: .25 }, { transform: 'translateX(0)', opacity: 1 }], { duration: 500, easing: 'ease-out' }));
        api.sound(true);
      }, 350 + (2 - i) * 600));
    });
    timers.push(setTimeout(() => { if (root.isConnected) finish(); }, RANKING_REVEAL_MS));
  }

  function next() {
    if (rankingBusy) return;
    if (isFinished(duel)) return final();
    draw('full');
  }

  function final() {
    const table = standings(duel);
    const top = leaders(duel);
    const title = top.length === 1 ? esc(top[0].name) : top.map((t) => esc(t.short)).join(' e ');
    const sub = top.length === 1 ? 'é a turma campeã!' : 'empataram na liderança!';
    show('duel-final', `<div class="result duel-final-box"><span class="eyebrow">Fim do duelo • ${duel.turns} rodadas</span>
      <div class="duel-trophy">${uiIcon('trophy')}</div><h1>${title}<br><span>${sub}</span></h1><p class="champion-rule">A vitória na FINAL decidiu o título.</p>
      <div class="standings final">${table.map((t, i) => card(t, i, top.some((x) => x.id === t.id) ? 'lead' : '')).join('')}</div>
      <div class="actions">${button('Novo duelo', 'duel-new', 'primary')}${button('Início', 'home')}</div></div>`, '');
    api.celebrate();
    api.sound(true);
  }

  function action(a, b) {
    if (a === 'duel-turns') { turnsChoice = +b.dataset.n; app().querySelectorAll('.chip').forEach((c) => { const on = +c.dataset.n === turnsChoice; c.classList.toggle('on', on); c.setAttribute('aria-pressed', on); }); eta(); }
    else if (a === 'duel-game') toggleGame(b.dataset.id);
    else if (a === 'duel-setup') setup();
    else if (a === 'duel-names') editNames();
    else if (a === 'duel-start') start();
    else if (a === 'duel-resume') resume();
    else if (a === 'duel-wipe') wipe();
    else if (a === 'duel-student') redrawNames(+b.dataset.side);
    else if (a === 'duel-students') redrawNames();
    else if (a === 'duel-play') play();
    else if (a === 'duel-confirm') confirm();
    else if (a === 'duel-next') next();
    else if (a === 'duel-new') { turnsChoice = 10; setup(); }
  }
  const app = () => document.querySelector('#app');

  /** Volta para o sorteio da rodada atual, por exemplo depois de anular uma partida. */
  function back() { if (duel?.current) draw('static'); else setup(); }

  return { open, action, result, back, dispose: clearTimers, state: () => duel };
}
