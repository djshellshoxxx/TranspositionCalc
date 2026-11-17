# User Guide

Open the live site or run the page locally (`python -m http.server 8000`).

## Transpose a sample

1. Enter the source key and target key. Enharmonic spellings are accepted (Db and C# are the same pitch).
2. Choose the semitone path: shortest, up only, or down only.
3. Read the semitone change, cents, playback-rate multiplier and speed percentage.
4. If you keep pitch and speed linked, read the resulting BPM. For independent tempo changes, enter
   a target BPM and read the time-stretch percentage and resulting duration.

## Loops and drift

Enter a loop length in bars or a measured duration to infer BPM. The drift calculator shows how far
an unstretched loop moves out of time with a target tempo, in milliseconds.

## DJ varispeed

The varispeed panel gives the pitch-fader consequence of a tempo change when key lock is off,
including the pitch and cents change.

## Camelot and Open Key

Each key shows its Camelot and Open Key values and harmonic neighbours (same key, relative
major/minor, adjacent Camelot numbers). The all-keys table lists every target key at once.

## Sharing

Calculator fields are written to the URL, so copying the address keeps the current calculation.
Nothing is sent to a server.
