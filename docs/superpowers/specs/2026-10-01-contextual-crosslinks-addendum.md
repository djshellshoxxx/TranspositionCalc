# Transposition Calculator Contextual Cross-Linking Addendum

Date: 2026-10-01

This addendum is part of the Transposition Calculator specification.

## Principle

Cross-links should appear only where another Circuit Drift Labs tool is a natural continuation of the calculation the user just performed.

## Required contextual links

### After a transposition / sample-match calculation -> TrackStats

When the user has completed a calculation involving a track/sample key or BPM, show a compact related-tool prompt:

`Want to see how this track fits into the rest of your library? Analyze your collection with TrackStats.`

This prompt should appear after results, not above the calculator.

### After BPM/key workflow -> LoudnessBatch

If the user is working with a full mix/reference workflow rather than a single sample, provide a secondary prompt in the related-tools area:

`Comparing finished mixes or references? Check loudness, dynamics, tonal balance and stereo image in LoudnessBatch.`

Do not present LoudnessBatch as necessary for simple note-frequency calculations.

### MIDItest

MIDItest belongs in the primary tool directory but should not be inserted into every calculation result because MIDI hardware diagnostics are usually a separate workflow.

## Shared tool ordering

1. TrackStats
2. Transposition Calculator
3. MIDItest
4. LoudnessBatch

Experiments below the main list:

1. Binaural Web Beats
2. BabbleForge

## Circuit Drift Labs branding

Keep the small 2D Circuit Drift Labs mark unobtrusive in header/footer and link to `https://circuitdriftlabs.djshellshoxxx.github.io`.

## Testing

Verify contextual prompts render only in the appropriate result states, shared tool ordering is consistent, and experiments remain visually separated.
