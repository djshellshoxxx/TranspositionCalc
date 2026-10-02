const PC = {
  'C':0,'B#':0,'C#':1,'Db':1,'D':2,'D#':3,'Eb':3,'E':4,'Fb':4,
  'E#':5,'F':5,'F#':6,'Gb':6,'G':7,'G#':8,'Ab':8,'A':9,'A#':10,'Bb':10,'B':11,'Cb':11
};
const SHARP_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const FLAT_NAMES = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
const CAMELOT_MAJOR = ['8B','3B','10B','5B','12B','7B','2B','9B','4B','11B','6B','1B'];
const CAMELOT_MINOR = ['5A','12A','7A','2A','9A','4A','11A','6A','1A','8A','3A','10A'];
const OPEN_MAJOR = ['1d','8d','3d','10d','5d','12d','7d','2d','9d','4d','11d','6d'];
const OPEN_MINOR = ['10m','5m','12m','7m','2m','9m','4m','11m','6m','1m','8m','3m'];

export function pitchClass(key) {
  const k = String(key ?? '').trim();
  if (!(k in PC)) throw new Error(`Unknown key: ${key}`);
  return PC[k];
}

export function normalizeKey(key, prefer='sharp') {
  const pc = pitchClass(key);
  return (prefer === 'flat' ? FLAT_NAMES : SHARP_NAMES)[pc];
}

export function semitoneDistance(source, target, mode='shortest') {
  const raw = pitchClass(target) - pitchClass(source);
  if (mode === 'up') return (raw + 12) % 12;
  if (mode === 'down') return -((pitchClass(source) - pitchClass(target) + 12) % 12);
  let d = ((raw + 18) % 12) - 6;
  if (d === -6 && raw > 0) d = 6;
  return d;
}

export function playbackRatio(semitones) {
  return 2 ** (Number(semitones) / 12);
}

export function centsFromSemitones(semitones) {
  return Number(semitones) * 100;
}

export function semitonesFromRatio(ratio) {
  const r = Number(ratio);
  if (!(r > 0)) throw new Error('Ratio must be greater than zero');
  return 12 * Math.log2(r);
}

export function bpmAfterPitchShift(bpm, semitones) {
  return Number(bpm) * playbackRatio(semitones);
}

export function stretchPercent(sourceBpm, targetBpm) {
  const s = Number(sourceBpm), t = Number(targetBpm);
  if (!(s > 0) || !(t > 0)) throw new Error('BPM values must be greater than zero');
  return (t / s - 1) * 100;
}

export function durationAfterRate(seconds, rate) {
  const r = Number(rate);
  if (!(r > 0)) throw new Error('Rate must be greater than zero');
  return Number(seconds) / r;
}

export function noteDurations(bpm) {
  const b = Number(bpm);
  if (!(b > 0)) throw new Error('BPM must be greater than zero');
  const q = 60000 / b;
  return {
    wholeMs:q*4, halfMs:q*2, quarterMs:q, eighthMs:q/2, sixteenthMs:q/4,
    dottedQuarterMs:q*1.5, dottedEighthMs:q*0.75,
    quarterTripletMs:q*2/3, eighthTripletMs:q/3
  };
}

export function loopDuration(bpm, bars=4, beatsPerBar=4) {
  return (60000 / Number(bpm)) * Number(beatsPerBar) * Number(bars) / 1000;
}

export function impliedBpm(seconds, bars=4, beatsPerBar=4) {
  const s = Number(seconds);
  if (!(s > 0)) throw new Error('Duration must be greater than zero');
  return 60 * Number(beatsPerBar) * Number(bars) / s;
}

export function driftMs(sourceBpm, targetBpm, bars=4, beatsPerBar=4) {
  return (loopDuration(sourceBpm,bars,beatsPerBar) - loopDuration(targetBpm,bars,beatsPerBar)) * 1000;
}

export function camelotForKey(key, quality='major') {
  const pc = pitchClass(key);
  return quality === 'minor' ? CAMELOT_MINOR[pc] : CAMELOT_MAJOR[pc];
}

export function openKeyForKey(key, quality='major') {
  const pc = pitchClass(key);
  return quality === 'minor' ? OPEN_MINOR[pc] : OPEN_MAJOR[pc];
}

export function noteFrequency(key, octave=4, a4=440) {
  const midi = (Number(octave) + 1) * 12 + pitchClass(key);
  return Number(a4) * 2 ** ((midi - 69) / 12);
}

export function frequencyToNote(freq, a4=440, prefer='sharp') {
  const f = Number(freq);
  if (!(f > 0)) throw new Error('Frequency must be greater than zero');
  const midiFloat = 69 + 12 * Math.log2(f / Number(a4));
  const midi = Math.round(midiFloat);
  const cents = (midiFloat - midi) * 100;
  const names = prefer === 'flat' ? FLAT_NAMES : SHARP_NAMES;
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return { note: `${names[pc]}${octave}`, key:names[pc], octave, cents, midi };
}

export function allTargets(sourceKey, sourceBpm=null, prefer='sharp') {
  const names = prefer === 'flat' ? FLAT_NAMES : SHARP_NAMES;
  return names.map((target) => {
    const semitones = semitoneDistance(sourceKey,target,'shortest');
    const ratio = playbackRatio(semitones);
    return {
      target,
      semitones,
      cents:centsFromSemitones(semitones),
      ratio,
      percent:(ratio-1)*100,
      resultingBpm: sourceBpm ? Number(sourceBpm)*ratio : null
    };
  });
}
