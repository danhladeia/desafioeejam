import test from 'node:test';
import assert from 'node:assert/strict';
import { seededRandom } from '../games.js';
import { buildSliceRound } from '../arcade/content.js';
import { createEdfTheme } from '../edf-theme.js';

test('Corte Certo cria a mesma rodada para a mesma semente', () => {
  const a = buildSliceRound(seededRandom('slice-1'), 2);
  const b = buildSliceRound(seededRandom('slice-1'), 2);
  assert.deepEqual(a, b);
  assert.ok(a.items.some(item => item.good));
  assert.ok(a.items.some(item => !item.good));
});

test('Corte Certo EDF usa apenas os temas selecionados', () => {
  const theme = createEdfTheme(['aventura']);
  const round = buildSliceRound(seededRandom('slice-edf'), 1, theme);
  assert.match(round.request, /tema estudado/);
  assert.ok(round.items.filter(item => item.good).every(item => item.atlas && Number.isInteger(item.frame)));
});
