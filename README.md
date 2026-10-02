# Transposition Calculator

**A Circuit Drift Labs tool.**

A fast browser utility for producers, DJs and samplers who need to move audio between keys and tempos without opening a DAW. It calculates semitones, cents, playback-rate changes, resulting BPM, independent time-stretch, harmonic key notation, loop timing and drift.

## Features

- Source-key → target-key transposition
- Shortest, upward-only or downward-only semitone paths
- Playback-rate multiplier and speed percentage
- BPM consequences when pitch and speed remain linked
- Independent BPM/time-stretch calculation
- Camelot and Open Key values
- All-target-keys table
- Beat, note and multi-bar duration tables
- Loop BPM inference and drift calculator
- Playback-rate → semitone/cents reverse calculator
- Note-frequency utility with adjustable A4 reference
- Tap tempo
- Shareable URL state

## Privacy

Everything runs locally in the browser. There is no account and no backend receiving calculation values.

## Circuit Drift Labs

Main site: https://circuitdriftlabs.djshellshoxxx.github.io/

Related production tools:

- TrackStats — library-wide format, bitrate, key, BPM and metadata analysis
- MIDItest — browser MIDI monitoring and controller diagnostics
- LoudnessBatch — loudness, dynamics, stereo and reference-mix analysis

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

The included GitHub Actions workflow tests the calculation engine and deploys the repository as a GitHub Pages artifact on pushes to `main`.
