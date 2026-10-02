import test from 'node:test';
import assert from 'node:assert/strict';
import {
  semitoneDistance, playbackRatio, bpmAfterPitchShift, stretchPercent,
  noteDurations, loopDuration, driftMs, normalizeKey, camelotForKey,
  openKeyForKey, noteFrequency, frequencyToNote, allTargets
} from '../src/music.js';

test('F# to A is +3 semitones on shortest path', () => {
  assert.equal(semitoneDistance('F#','A','shortest'), 3);
});

test('B to C is +1 and C to B is -1 on shortest path', () => {
  assert.equal(semitoneDistance('B','C','shortest'), 1);
  assert.equal(semitoneDistance('C','B','shortest'), -1);
});

test('enharmonic keys normalize to the same pitch class', () => {
  assert.equal(normalizeKey('Db'), normalizeKey('C#'));
});

test('one octave up doubles playback rate and BPM', () => {
  assert.equal(playbackRatio(12), 2);
  assert.equal(bpmAfterPitchShift(120,12), 240);
});

test('stretch percent reports target/source tempo change', () => {
  assert.equal(stretchPercent(120, 150), 25);
});

test('quarter note at 120 bpm is 500ms and four bars of 4/4 is 8 seconds', () => {
  assert.equal(noteDurations(120).quarterMs, 500);
  assert.equal(loopDuration(120,4,4), 8);
});

test('tempo mismatch drift accumulates over bars', () => {
  assert.ok(Math.abs(driftMs(120, 121, 4, 4)) > 0);
});

test('Camelot and Open Key mappings return known C major values', () => {
  assert.equal(camelotForKey('C','major'), '8B');
  assert.equal(openKeyForKey('C','major'), '1d');
});

test('A4 defaults to 440Hz', () => {
  assert.ok(Math.abs(noteFrequency('A',4)-440) < 1e-9);
});

test('440Hz resolves to A4 near zero cents', () => {
  const r = frequencyToNote(440);
  assert.equal(r.note, 'A4');
  assert.ok(Math.abs(r.cents) < 1e-9);
});

test('allTargets emits 12 rows', () => {
  assert.equal(allTargets('C',120).length, 12);
});
