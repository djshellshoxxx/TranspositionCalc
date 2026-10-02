# Transposition Calculator Design Specification

Date: 2026-10-01
Brand: Circuit Drift Labs
Primary site: https://circuitdriftlabs.djshellshoxxx.github.io

## Purpose
Static GitHub Pages utility for producers, DJs, samplers, and DAW users to calculate key, pitch, playback-rate, BPM, time-stretch, loop-length, drift, and harmonic-key relationships.

## Core V1
- source key and target key
- signed semitone change
- cents
- pitch/frequency ratio
- playback-rate multiplier and percent
- source BPM and target BPM
- resulting BPM when speed follows pitch
- independent time-stretch percentage
- resulting duration
- major/minor keys
- enharmonic spellings
- sharp/flat preference
- Camelot conversion
- Open Key conversion
- all-target-keys table
- loop/bar timing
- unstretched-loop drift calculator
- tap tempo
- URL-shareable calculation state

## Sample Matcher
Inputs: source key, target key, source BPM, target BPM, optional duration/bars.

Outputs: pitch shift, cents, speed ratio, independent stretch amount, resulting duration, and the mathematical consequences of allowing speed and pitch to remain linked versus treating them independently.

## Additional utilities
- reverse playback-rate to semitone/cents calculator
- BPM ratio calculator
- half/double-time reference
- note duration table including dotted/triplet values
- note frequency utility with adjustable A4 reference
- frequency-to-nearest-note and cents deviation
- optional batch sample worksheet with CSV export

## TrackStats integration
TrackStats must show a contextual Transposition Calculator link near BPM/key results after a scan. When URL parameters are supported, selected source BPM/key may prefill the calculator.

## Circuit Drift Labs ecosystem
Main production tools should be ordered:
1. TrackStats
2. Transposition Calculator
3. MIDItest
4. LoudnessBatch when available

Separate `Experiments` area at the bottom:
1. Binaural Web Beats
2. BabbleForge

The calculator must link to TrackStats, MIDItest, LoudnessBatch when available, and the Circuit Drift Labs home page. Experiments remain visually separated below the main tools.

## Visual design
Dark navy, black, charcoal, slate/gray, restrained cool-blue accents, simple 2D Circuit Drift Labs mark in header/footer. Avoid glossy 3D/neon-heavy styling.

## Privacy
No backend, account, or transmission of calculation values required.

## Testing
Known-value tests for semitone distance, enharmonics, playback-rate formula `2^(n/12)`, cents, BPM changes, stretch, duration, Camelot/Open Key mapping, loop timing, drift, frequency conversion, and URL serialization.

## Deployment
GitHub Pages from djshellshoxxx/TranspositionCalc; repository-subpath safe.

## Success criteria
A user can answer common key, pitch, BPM, sample-matching, playback-rate, and loop-timing questions in seconds and navigate naturally among the Circuit Drift Labs tools.
