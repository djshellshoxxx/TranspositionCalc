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
  const raw = String(key ?? '').trim().replace('♯', '#').replace('♭', 'b');
  const k = raw.charAt(0).toUpperCase() + raw.slice(1);
  if (!Object.hasOwn(PC, k)) throw new Error(`Unknown key: ${key}`);
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

export function durationAfterTempoChange(seconds, sourceBpm, targetBpm) {
  const s = Number(sourceBpm), t = Number(targetBpm);
  if (!(s > 0) || !(t > 0)) throw new Error('BPM values must be greater than zero');
  return Number(seconds) * s / t;
}

export function djVarispeed(sourceBpm, targetBpm) {
  const s=Number(sourceBpm), t=Number(targetBpm);
  if (!(s>0) || !(t>0)) throw new Error('BPM values must be greater than zero');
  const ratio=t/s;
  const semitones=semitonesFromRatio(ratio);
  return {ratio,percent:(ratio-1)*100,semitones,cents:semitones*100};
}

export function halfDoubleTime(bpm) {
  const b=Number(bpm);
  if (!(b>0)) throw new Error('BPM must be greater than zero');
  return {half:b/2,double:b*2,threeQuarter:b*.75,oneAndHalf:b*1.5};
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
  if (!(Number(bpm) > 0)) throw new Error('BPM must be greater than zero');
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

export function harmonicNeighbors(key, quality='major', prefer='sharp') {
  const current=camelotForKey(key,quality);
  const match=current.match(/^(\d+)([AB])$/);
  if(!match) return [];
  const number=Number(match[1]),letter=match[2];
  const prev=((number+10)%12)+1,next=(number%12)+1,relative=`${number}${letter==='A'?'B':'A'}`;
  const targets=[current,`${prev}${letter}`,`${next}${letter}`,relative];
  const names=prefer==='flat'?FLAT_NAMES:SHARP_NAMES;
  const rows=[];
  for(let pc=0;pc<12;pc++){
    for(const q of ['major','minor']){
      const cam=camelotForKey(names[pc],q);
      if(targets.includes(cam)) rows.push({key:names[pc],quality:q,camelot:cam,relation:cam===current?'same key':cam===relative?'relative major/minor':cam===`${next}${letter}`?'+1 Camelot (dominant)':'-1 Camelot (subdominant)'});
    }
  }
  return rows.sort((a,b)=>targets.indexOf(a.camelot)-targets.indexOf(b.camelot));
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
      resultingBpm: Number(sourceBpm) > 0 ? Number(sourceBpm)*ratio : null
    };
  });
}

export function transposeKey(key, semitones, prefer='sharp') {
  const names = prefer === 'flat' ? FLAT_NAMES : SHARP_NAMES;
  return names[(((pitchClass(key) + Math.round(Number(semitones))) % 12) + 12) % 12];
}

// Key you land on if the source tempo is reached purely by varispeed (pitch follows speed).
export function keyAfterVarispeed(key, sourceBpm, targetBpm, prefer='sharp') {
  const { semitones } = djVarispeed(sourceBpm, targetBpm);
  const nearest = Math.round(semitones);
  return { semitones, nearest, key: transposeKey(key, nearest, prefer), cents: (semitones - nearest) * 100 };
}

// Picks the target tempo (as-is, half or double) that needs the smallest time-stretch.
export function bestTempoFold(sourceBpm, targetBpm) {
  const t = Number(targetBpm);
  stretchPercent(sourceBpm, t);
  return [1, 0.5, 2]
    .map((factor) => ({ factor, bpm: t * factor, percent: stretchPercent(sourceBpm, t * factor) }))
    .reduce((a, b) => (Math.abs(b.percent) < Math.abs(a.percent) ? b : a));
}

export function delayHz(bpm, noteFraction = 1) {
  const b = Number(bpm);
  if (!(b > 0)) throw new Error('BPM must be greater than zero');
  return b / 60 / Number(noteFraction);
}
