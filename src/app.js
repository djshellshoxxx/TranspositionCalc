import {
  semitoneDistance, playbackRatio, centsFromSemitones, bpmAfterPitchShift, stretchPercent,
  durationAfterRate, durationAfterTempoChange, noteDurations, loopDuration, impliedBpm, driftMs,
  camelotForKey, openKeyForKey, noteFrequency, frequencyToNote, semitonesFromRatio, allTargets,
  djVarispeed, halfDoubleTime, harmonicNeighbors, keyAfterVarispeed, bestTempoFold, delayHz
} from './music.js';

const $ = (id) => document.getElementById(id);
const KEYS = {
  sharp: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  flat: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
};
const stateFields = ['notation', 'sourceKey', 'targetKey', 'sourceBpm', 'targetBpm', 'sourceDuration', 'sourceQuality', 'targetQuality', 'direction'];
const defaults = {};
let lastMainText = '';

const isNum = (n) => n !== null && n !== '' && Number.isFinite(Number(n));
const fmt = (n, d = 2) => (isNum(n) ? Number(n).toFixed(d) : '—');
const signed = (n, d = 2, suffix = '') => (isNum(n) ? `${Number(n) >= 0 ? '+' : '−'}${Math.abs(Number(n)).toFixed(d)}${suffix}` : '—');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (id) => ($(id).value.trim() === '' ? NaN : Number($(id).value));

function metric(label, value, tip = '', cls = '') {
  return `<div class="metric ${cls}" tabindex="0" data-copy="${esc(value)}" data-tip="${esc(tip ? `${tip} (Click to copy.)` : 'Click to copy.')}"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`;
}
const errorMetric = (msg) => metric('Input error', msg, 'Fix the highlighted input to continue.', 'error');

function fillKeySelect(select, index, notation) {
  select.innerHTML = KEYS[notation].map((k) => `<option value="${k}">${k}</option>`).join('');
  select.selectedIndex = index;
}
function syncNotation() {
  const n = $('notation').value;
  for (const id of ['sourceKey', 'targetKey', 'freqNote']) fillKeySelect($(id), Math.max(0, $(id).selectedIndex), n);
}

/* ---------- URL state ---------- */
function updateUrl() {
  const p = new URLSearchParams();
  for (const id of stateFields) p.set(id, $(id).value);
  try { history.replaceState(null, '', `${location.pathname}?${p}${location.hash}`); } catch { /* sandboxed */ }
}
function readUrl() {
  const p = new URLSearchParams(location.search);
  if (['sharp', 'flat'].includes(p.get('notation'))) $('notation').value = p.get('notation');
  syncNotation();
  for (const id of stateFields) {
    if (id === 'notation' || !p.has(id)) continue;
    const el = $(id), prev = el.value;
    el.value = p.get(id);
    if (el.tagName === 'SELECT' && el.selectedIndex < 0) el.value = prev;
  }
}

/* ---------- Sample matcher ---------- */
function renderHarmonic(source, notation) {
  const rows = harmonicNeighbors(source, $('sourceQuality').value, notation);
  $('harmonicBody').innerHTML = rows.map((r) => `<tr><td>${r.key} ${r.quality}</td><td>${r.camelot}</td><td>${r.relation}</td></tr>`).join('');
}

function renderMain() {
  try {
    const notation = $('notation').value, source = $('sourceKey').value, target = $('targetKey').value;
    const sq = $('sourceQuality').value, tq = $('targetQuality').value;
    const semis = semitoneDistance(source, target, $('direction').value);
    const ratio = playbackRatio(semis);
    const sbpm = num('sourceBpm'), tbpm = num('targetBpm'), seconds = num('sourceDuration');
    const haveBpm = sbpm > 0 && tbpm > 0;
    const speedBpm = sbpm > 0 ? bpmAfterPitchShift(sbpm, semis) : NaN;
    const stretch = haveBpm ? stretchPercent(sbpm, tbpm) : NaN;
    const remaining = speedBpm > 0 && tbpm > 0 ? stretchPercent(speedBpm, tbpm) : NaN;
    const haveDur = seconds > 0;
    const vari = haveBpm ? keyAfterVarispeed(source, sbpm, tbpm, notation) : null;
    const fold = haveBpm ? bestTempoFold(sbpm, tbpm) : null;

    $('headline').innerHTML = `<div class="route"><b>${source}</b><small>${sq}</small><i>→</i><b>${target}</b><small>${tq}</small></div>
      <div class="route-stats"><span>${signed(semis, 0, ' st')}</span><span>${fmt(ratio, 4)}× rate</span><span>${signed((ratio - 1) * 100, 2, '%')} speed</span></div>`;

    const items = [
      ['Pitch shift', signed(semis, 0, ' st'), 'Semitones to move from the source key to the target key.'],
      ['Cents', signed(centsFromSemitones(semis), 0, '¢'), '1 semitone = 100 cents.'],
      ['Playback rate', `${fmt(ratio, 6)}×`, 'Speed multiplier that produces this pitch shift when pitch and speed are linked (tape / turntable style).'],
      ['Speed change', signed((ratio - 1) * 100, 2, '%'), 'The playback-rate change as a percentage.'],
      ['BPM if linked', fmt(speedBpm, 2), 'The source BPM after the pitch-linked speed change.'],
      ['Independent stretch', signed(stretch, 2, '%'), 'Time-stretch needed to go from source BPM to target BPM if pitch is handled separately.'],
      ['Stretch after pitch-rate', signed(remaining, 2, '%'), 'Extra time-stretch still required after the pitch-linked speed change, to land exactly on the target BPM.'],
      ['Smallest stretch', fold ? `${signed(fold.percent, 2, '%')} @ ${fmt(fold.bpm, 1)}` : '—', 'Least time-stretch needed when you also consider half-time or double-time of the target BPM (less stretch usually sounds cleaner).'],
      ['Duration if linked', haveDur ? `${fmt(durationAfterRate(seconds, ratio), 3)} s` : '—', 'New length of the audio after the pitch-linked speed change.'],
      ['Duration at target BPM', haveDur && haveBpm ? `${fmt(durationAfterTempoChange(seconds, sbpm, tbpm), 3)} s` : '—', 'New length of the audio if it is time-stretched from source BPM to target BPM.'],
      ['Rate duration factor', `${fmt(1 / ratio, 4)}×`, 'Multiplier applied to the audio length by the pitch-linked speed change.'],
      ['Key at target BPM', vari ? `${vari.key} ${signed(vari.cents, 0, '¢')}` : '—', 'The key you land in if you only varispeed (speed up/slow down, pitch follows) from source BPM to target BPM, with the leftover detune in cents.'],
      ['Source Camelot', camelotForKey(source, sq), 'Camelot wheel code for the source key.'],
      ['Target Camelot', camelotForKey(target, tq), 'Camelot wheel code for the target key.'],
      ['Source Open Key', openKeyForKey(source, sq), 'Open Key notation for the source key.'],
      ['Target Open Key', openKeyForKey(target, tq), 'Open Key notation for the target key.']
    ];
    $('mainResults').innerHTML = items.map(([l, v, t]) => metric(l, v, t)).join('');
    lastMainText = `${source} ${sq} → ${target} ${tq}\n` + items.map(([l, v]) => `${l}: ${v}`).join('\n');

    let note;
    if (!haveBpm) note = 'Enter both BPM values to see tempo consequences.';
    else if (Math.abs(remaining) < 0.01) note = 'A single playback-rate change reaches both the selected key and target BPM.';
    else note = `A single playback-rate change reaches ${fmt(speedBpm, 2)} BPM. To also hit ${fmt(tbpm, 2)} BPM, treat pitch and speed independently, or follow the speed change with about ${signed(remaining, 2, '%')} time-stretch.`;
    if (haveBpm && Math.abs(fold.percent) + 0.01 < Math.abs(stretch)) note += ` Tip: matching ${fmt(fold.bpm, 1)} BPM (${fold.factor === 0.5 ? 'half' : 'double'}-time) needs only ${signed(fold.percent, 2, '%')} stretch.`;
    $('workflowNote').textContent = note;

    $('targetsBody').innerHTML = allTargets(source, sbpm, notation).map((r) =>
      `<tr${r.target === target ? ' class="sel"' : ''}><td>${r.target}</td><td>${signed(r.semitones, 0)}</td><td>${signed(r.cents, 0)}</td><td>${fmt(r.ratio, 6)}×</td><td>${signed(r.percent, 2, '%')}</td><td>${fmt(r.resultingBpm, 2)}</td></tr>`).join('');
    renderHarmonic(source, notation);
    updateUrl();
  } catch (e) {
    $('mainResults').innerHTML = errorMetric(e.message);
    for (const id of ['headline', 'workflowNote', 'targetsBody', 'harmonicBody']) $(id).innerHTML = '';
    lastMainText = '';
  }
}

/* ---------- Timing / drift / DJ / reverse / frequency ---------- */
function renderTiming() {
  const bpm = num('timingBpm'), bars = num('bars'), beats = num('beatsPerBar'), seconds = num('observedSeconds');
  const out = [];
  try {
    const n = noteDurations(bpm), alts = halfDoubleTime(bpm);
    out.push(metric('1 beat', `${fmt(n.quarterMs, 2)} ms`, 'Length of one beat (quarter note).'),
      metric(`${fmt(bars, 0)} bars`, `${fmt(loopDuration(bpm, bars, beats), 3)} s`, 'Total length of the loop at this BPM.'));
    try { out.push(metric('Implied BPM', fmt(impliedBpm(seconds, bars, beats), 3), 'The BPM implied by the observed loop length. Compare to your expected BPM to spot tempo error.')); }
    catch (e) { out.push(errorMetric(e.message)); }
    out.push(metric('Half-time', fmt(alts.half, 2), 'Half the tempo.'), metric('Double-time', fmt(alts.double, 2), 'Twice the tempo.'),
      metric('¾-time ref', fmt(alts.threeQuarter, 2), 'Three-quarters of the tempo, a common reference for swung or halftime feels.'),
      metric('1½× ref', fmt(alts.oneAndHalf, 2), 'One and a half times the tempo, e.g. 116 → 174 relationships.'));
    const rows = [['Whole', n.wholeMs, 4], ['Half', n.halfMs, 2], ['Quarter', n.quarterMs, 1], ['Eighth', n.eighthMs, 0.5], ['Sixteenth', n.sixteenthMs, 0.25],
      ['Dotted quarter', n.dottedQuarterMs, 1.5], ['Dotted eighth', n.dottedEighthMs, 0.75], ['Quarter triplet', n.quarterTripletMs, 2 / 3], ['Eighth triplet', n.eighthTripletMs, 1 / 3]];
    $('noteBody').innerHTML = rows.map(([name, v, frac]) => `<tr><td>${name}</td><td>${fmt(v, 3)}</td><td>${fmt(delayHz(bpm, frac), 3)}</td></tr>`).join('');
  } catch (e) { out.push(errorMetric(e.message)); $('noteBody').innerHTML = ''; }
  $('timingResults').innerHTML = out.join('');
}

function renderDrift() {
  try {
    const s = num('driftSource'), t = num('driftTarget'), b = num('driftBars'), beats = num('driftBeats');
    const ms = driftMs(s, t, b, beats);
    $('driftResults').innerHTML = [
      metric('Drift', signed(ms, 2, ' ms'), 'How far the end of the loop lands from the project grid. Positive = loop is longer (late); negative = loop is shorter (early).'),
      metric('Drift in beats', signed(ms / (60000 / t), 4), 'The same drift expressed in project beats.'),
      metric('Loop length', `${fmt(loopDuration(s, b, beats), 3)} s`, 'Length of the loop at its own BPM.'),
      metric('Project length', `${fmt(loopDuration(t, b, beats), 3)} s`, 'Length the same number of bars occupies in the project.')
    ].join('');
  } catch (e) { $('driftResults').innerHTML = errorMetric(e.message); }
}

function renderDj() {
  try {
    const s = num('djSource'), t = num('djTarget'), r = djVarispeed(s, t);
    $('djResults').innerHTML = [
      metric('Pitch fader', signed(r.percent, 3, '%'), 'Pitch-fader setting needed on a deck without key lock.'),
      metric('Rate', `${fmt(r.ratio, 6)}×`, 'Playback-speed multiplier.'),
      metric('Pitch shift', signed(r.semitones, 3, ' st'), 'How far the key moves in semitones as a side effect.'),
      metric('Detune', signed(r.cents, 1, '¢'), 'Pitch shift in cents.')
    ].join('');
    $('djNote').textContent = `With key lock off, moving ${fmt(s, 2)} BPM to ${fmt(t, 2)} BPM also shifts pitch by about ${signed(r.semitones, 3, ' semitones')}. Key lock / master tempo avoids this at the cost of time-stretch artefacts.`;
  } catch (e) { $('djResults').innerHTML = errorMetric(e.message); $('djNote').textContent = ''; }
}

function renderReverse() {
  try {
    const r = num('reverseRate'), st = semitonesFromRatio(r);
    $('reverseResult').textContent = `${signed(st, 3, ' semitones')} · ${signed(st * 100, 1, ' cents')} · ${signed((r - 1) * 100, 3, '% speed')}`;
  } catch (e) { $('reverseResult').textContent = e.message; }
}

function renderFrequency() {
  const a = num('a4'), parts = [];
  try { parts.push(`${$('freqNote').value}${num('freqOctave')} = ${fmt(noteFrequency($('freqNote').value, num('freqOctave'), a), 3)} Hz`); } catch (e) { parts.push(e.message); }
  try { const i = frequencyToNote(num('inspectFreq'), a, $('notation').value); parts.push(`${$('inspectFreq').value} Hz ≈ ${i.note} (${signed(i.cents, 2, '¢')})`); } catch (e) { parts.push(e.message); }
  $('frequencyResult').textContent = parts.join(' · ');
}

/* ---------- Tap tempo ---------- */
let taps = [], tapValue = NaN;
function tap() {
  const now = performance.now();
  if (taps.length && now - taps.at(-1) > 2500) taps = [];
  taps.push(now);
  if (taps.length > 8) taps.shift();
  if (taps.length > 1) {
    tapValue = 60000 / ((taps.at(-1) - taps[0]) / (taps.length - 1));
    $('tapBpm').textContent = fmt(tapValue, 1);
  }
}

/* ---------- UI helpers ---------- */
let toastTimer;
function toast(msg) {
  $('toast').textContent = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { $('toast').textContent = ''; }, 2200);
}
async function copy(text, ok = 'Copied') {
  try { await navigator.clipboard.writeText(text); toast(ok); } catch { toast('Copy not available here'); }
}
function setValue(id, v) { $(id).value = v; $(id).dispatchEvent(new Event('input', { bubbles: true })); }

function initTooltips() {
  const tip = $('tip');
  let current = null;
  const show = (el) => {
    current = el;
    tip.textContent = el.dataset.tip;
    tip.hidden = false;
    const r = el.getBoundingClientRect(), t = tip.getBoundingClientRect();
    const left = Math.min(Math.max(8, r.left + r.width / 2 - t.width / 2), innerWidth - t.width - 8);
    const above = r.top - t.height - 10 >= 8;
    tip.style.left = `${left}px`;
    tip.style.top = `${above ? r.top - t.height - 10 : r.bottom + 10}px`;
  };
  const hide = () => { current = null; tip.hidden = true; };
  document.addEventListener('mouseover', (e) => { const el = e.target.closest('[data-tip]'); if (el && el !== current) show(el); else if (!el) hide(); });
  document.addEventListener('focusin', (e) => { const el = e.target.closest('[data-tip]'); if (el) show(el); });
  document.addEventListener('focusout', hide);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
  addEventListener('scroll', hide, { passive: true });
}

function initTheme() {
  $('themeBtn').addEventListener('click', () => {
    const cur = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('tc-theme', next); } catch { /* storage blocked */ }
  });
}

function initNavHighlight() {
  if (!('IntersectionObserver' in window)) return;
  const links = [...document.querySelectorAll('#nav a')];
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) links.forEach((a) => a.classList.toggle('active', a.hash === `#${e.target.id}`));
  }, { rootMargin: '-40% 0px -55% 0px' });
  links.forEach((a) => { const s = document.querySelector(a.hash); if (s) io.observe(s); });
}

/* ---------- Boot ---------- */
for (const id of stateFields) defaults[id] = $(id).value;
fillKeySelect($('sourceKey'), 6, 'sharp'); // F#
fillKeySelect($('targetKey'), 9, 'sharp'); // A
fillKeySelect($('freqNote'), 9, 'sharp');
defaults.sourceKey = 'F#'; defaults.targetKey = 'A';
readUrl();

for (const id of stateFields) $(id).addEventListener('input', () => { if (id === 'notation') syncNotation(); renderMain(); renderFrequency(); });
const bind = (ids, fn) => ids.forEach((id) => $(id).addEventListener('input', fn));
bind(['timingBpm', 'bars', 'beatsPerBar', 'observedSeconds'], renderTiming);
bind(['driftSource', 'driftTarget', 'driftBars', 'driftBeats'], renderDrift);
bind(['djSource', 'djTarget'], renderDj);
bind(['reverseRate'], renderReverse);
bind(['freqNote', 'freqOctave', 'a4', 'inspectFreq'], renderFrequency);

$('tapButton').addEventListener('click', tap);
$('tapReset').addEventListener('click', () => { taps = []; tapValue = NaN; $('tapBpm').textContent = '—'; });
$('tapUse').addEventListener('click', () => { if (isNum(tapValue)) { setValue('sourceBpm', tapValue.toFixed(2)); toast('Source BPM set'); } else toast('Tap at least twice first'); });
document.addEventListener('keydown', (e) => {
  if ((e.key === 't' || e.key === 'T') && !e.repeat && !e.ctrlKey && !e.metaKey && !e.altKey && !/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(document.activeElement.tagName)) { tap(); $('tapButton').classList.add('hit'); setTimeout(() => $('tapButton').classList.remove('hit'), 90); }
});

$('swapBtn').addEventListener('click', () => {
  for (const [a, b] of [['sourceKey', 'targetKey'], ['sourceQuality', 'targetQuality'], ['sourceBpm', 'targetBpm']]) [$(a).value, $(b).value] = [$(b).value, $(a).value];
  renderMain();
});
$('resetBtn').addEventListener('click', () => { for (const id of stateFields) $(id).value = defaults[id]; syncNotation(); $('sourceKey').value = defaults.sourceKey; $('targetKey').value = defaults.targetKey; renderMain(); renderFrequency(); toast('Reset'); });
$('copyLink').addEventListener('click', () => { updateUrl(); copy(location.href, 'Link copied'); });
$('copyResults').addEventListener('click', () => lastMainText ? copy(lastMainText, 'Results copied') : toast('Nothing to copy'));
document.addEventListener('click', (e) => { const m = e.target.closest('.metric[data-copy]'); if (m) copy(m.dataset.copy, `Copied ${m.dataset.copy}`); });
document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches?.('.metric[data-copy]')) e.target.click(); });

initTooltips(); initTheme(); initNavHighlight();
renderMain(); renderTiming(); renderDrift(); renderDj(); renderReverse(); renderFrequency();
