import test from 'node:test';
import assert from 'node:assert/strict';
import {
  semitoneDistance, playbackRatio, bpmAfterPitchShift, stretchPercent,
  noteDurations, loopDuration, driftMs, normalizeKey, camelotForKey,
  openKeyForKey, noteFrequency, frequencyToNote, allTargets,
  durationAfterTempoChange, djVarispeed, halfDoubleTime, harmonicNeighbors
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

test('duration follows inverse tempo ratio', () => {
  assert.equal(durationAfterTempoChange(60,120,150),48);
});

test('DJ varispeed exposes percent and pitch consequence', () => {
  const r=djVarispeed(120,126);
  assert.ok(Math.abs(r.percent-5)<1e-9);
  assert.ok(r.semitones>0);
});

test('half and double time references are correct', () => {
  assert.deepEqual(halfDoubleTime(174),{half:87,double:348,threeQuarter:130.5,oneAndHalf:261});
});

test('harmonic neighbors include same and relative keys', () => {
  const rows=harmonicNeighbors('C','major');
  assert.equal(rows.length,4);
  assert.ok(rows.some(r=>r.camelot==='8B'&&r.relation==='same key'));
  assert.ok(rows.some(r=>r.camelot==='8A'&&r.relation==='relative major/minor'));
});

import { pitchClass, transposeKey, keyAfterVarispeed, bestTempoFold, delayHz } from '../src/music.js';

test('key parsing accepts case and unicode accidentals but rejects junk', () => {
  assert.equal(pitchClass('bb'), 10);
  assert.equal(pitchClass('F♯'), 6);
  assert.equal(pitchClass('E♭'), 3);
  assert.throws(() => pitchClass('H'));
  assert.throws(() => pitchClass('constructor'));
});

test('transposeKey wraps and respects notation', () => {
  assert.equal(transposeKey('A', 3), 'C');
  assert.equal(transposeKey('C', -1, 'flat'), 'B');
  assert.equal(transposeKey('C', 1, 'flat'), 'Db');
});

test('keyAfterVarispeed reports landing key and detune', () => {
  const r = keyAfterVarispeed('C', 120, 240);
  assert.equal(r.key, 'C');
  assert.equal(r.nearest, 12);
  assert.ok(Math.abs(r.cents) < 1e-9);
});

test('bestTempoFold picks half-time when it needs less stretch', () => {
  assert.equal(bestTempoFold(87, 174).factor, 0.5);
  assert.equal(bestTempoFold(170, 174).factor, 1);
});

test('loopDuration validates BPM; allTargets omits BPM without source', () => {
  assert.throws(() => loopDuration(0, 4, 4));
  assert.equal(allTargets('C', NaN)[0].resultingBpm, null);
});

test('delayHz of a quarter note at 120 BPM is 2 Hz', () => {
  assert.equal(delayHz(120), 2);
});
