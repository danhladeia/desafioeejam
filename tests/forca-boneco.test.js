import test from 'node:test';
import assert from 'node:assert/strict';
import {HANGMAN_PARTS,MAX_MISTAKES,visibleParts,hangmanLabel} from '../forca-boneco.js';

test('o boneco tem seis partes, na ordem tradicional',()=>{
 assert.deepEqual(HANGMAN_PARTS,['head','torso','arm-left','arm-right','leg-left','leg-right']);
 assert.equal(MAX_MISTAKES,6);
});

test('visibleParts mostra as primeiras n partes e limita n entre 0 e 6',()=>{
 assert.deepEqual(visibleParts(0),[]);assert.deepEqual(visibleParts(1),['head']);assert.deepEqual(visibleParts(3),['head','torso','arm-left']);
 assert.equal(visibleParts(6).length,6);assert.equal(visibleParts(9).length,6);assert.deepEqual(visibleParts(-2),[]);
 assert.deepEqual(visibleParts('2'),['head','torso']);assert.deepEqual(visibleParts(NaN),[]);assert.deepEqual(visibleParts(undefined),[]);
});

test('hangmanLabel escreve o contador de erros em português',()=>{
 assert.equal(hangmanLabel(0),'Erros: 0 de 6');assert.equal(hangmanLabel(4),'Erros: 4 de 6');assert.equal(hangmanLabel(10),'Erros: 6 de 6');
});
