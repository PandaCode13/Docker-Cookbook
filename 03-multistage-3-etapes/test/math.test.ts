import { test } from 'node:test';
import assert from 'node:assert';
import { add } from '../src/math';

test('add() additionne correctement deux nombres', () => {
  assert.strictEqual(add(2, 3), 5);
});

test('add() gère les nombres négatifs', () => {
  assert.strictEqual(add(-2, 2), 0);
});