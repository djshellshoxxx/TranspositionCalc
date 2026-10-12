import test from 'node:test';
import assert from 'node:assert/strict';
import { loopDuration, impliedBpm, driftMs } from '../src/music.js';

test('loopDuration rejects zero, negative, and non-finite BPM', () => {
  for (const bpm of [0, -120, NaN, Infinity]) {
    assert.throws(() => loopDuration(bpm, 4, 4), /BPM/);
  }
});

test('loopDuration rejects invalid bar and beat counts', () => {
  for (const value of [0, -1, NaN, Infinity]) {
    assert.throws(() => loopDuration(120, value, 4), /Bars/);
    assert.throws(() => loopDuration(120, 4, value), /Beats/);
  }
});

test('impliedBpm rejects invalid meter values and duration', () => {
  for (const value of [0, -1, NaN, Infinity]) {
    assert.throws(() => impliedBpm(8, value, 4), /Bars/);
    assert.throws(() => impliedBpm(8, 4, value), /Beats/);
    assert.throws(() => impliedBpm(value, 4, 4), /Duration/);
  }
});

test('driftMs rejects invalid tempo inputs', () => {
  assert.throws(() => driftMs(0, 120), /BPM/);
  assert.throws(() => driftMs(120, -1), /BPM/);
});

test('valid timing calculations remain unchanged', () => {
  assert.equal(loopDuration(120, 4, 4), 8);
  assert.equal(impliedBpm(8, 4, 4), 120);
  assert.equal(driftMs(120, 120, 4, 4), 0);
});
