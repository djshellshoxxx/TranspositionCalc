# Transposition Calculator

**A Circuit Drift Labs tool.**

A fast browser utility for producers, DJs and samplers who need to move audio between keys and tempos without opening a DAW. It calculates semitones, cents, playback-rate changes, resulting BPM, independent time-stretch, harmonic key notation, loop timing, drift and DJ varispeed consequences.

Live site: https://djshellshoxxx.github.io/TranspositionCalc/

## Features

- Source-key → target-key transposition
- Shortest, upward-only or downward-only semitone paths
- Playback-rate multiplier and speed percentage
- BPM consequences when pitch and speed remain linked
- Independent BPM/time-stretch calculation
- Source-duration and resulting-duration calculations
- Camelot and Open Key values
- Harmonic-neighbor reference: same key, relative major/minor and adjacent Camelot
- All-target-keys table
- Beat, note and multi-bar duration tables
- Half-time, double-time, 3/4 and 1.5× tempo references
- Loop BPM inference and drift calculator
- DJ pitch-fader / varispeed calculator, including pitch and cents consequence when key lock is off
- Playback-rate → semitone/cents reverse calculator
- Note-frequency utility with adjustable A4 reference
- Tap tempo
- Shareable URL state (plus one-click copy of link and results)
- Source/target swap, reset, and click-to-copy on every result
- Varispeed key landing (which key, and how many cents off, you reach by changing speed alone)
- Smallest-stretch suggestion using half-time/double-time of the target BPM
- Note-synced LFO/delay frequencies in Hz
- Hover/focus tooltips on every input, table header and result
- Modern responsive layout with light/dark theme toggle and tap-tempo keyboard shortcut (T)

## Privacy

Everything runs locally in the browser. There is no account and no backend receiving calculation values.

## Circuit Drift Labs

Main site: https://djshellshoxxx.github.io/circuitdriftlabs/

Related production tools:

- TrackStats — library-wide format, bitrate, key, BPM and metadata analysis
- MIDItest — browser MIDI monitoring and controller diagnostics
- LoudnessBatch — loudness, dynamics, stereo and reference-mix analysis
- PartyPosterGen — quick rave, DJ, hip-hop and party flyer creation

Experiments:

- Binaural Web Beats
- BabbleForge

## Development

No framework or build step is required.

```bash
npm test
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Deployment

The included GitHub Actions workflow tests the calculation engine, syntax-checks the browser modules, and deploys the repository as a GitHub Pages artifact on pushes to `main`.
