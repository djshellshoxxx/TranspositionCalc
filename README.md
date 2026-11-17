# Transposition Calculator

A static, browser-only utility from **Circuit Drift Labs** for producers, DJs and samplers who need to
move audio between keys and tempos without opening a DAW. It calculates semitones, cents,
playback-rate changes, resulting BPM, independent time-stretch, Camelot and Open Key notation, loop
timing, drift and DJ varispeed consequences.

Live site: https://djshellshoxxx.github.io/TranspositionCalc/

## Features

- Source-key to target-key transposition, with shortest, upward-only or downward-only paths
- Semitones, cents, playback-rate multiplier and speed percentage
- Resulting BPM when pitch and speed stay linked; independent time-stretch when they do not
- Source and resulting duration
- Camelot and Open Key values; harmonic neighbours (same key, relative major/minor, adjacent Camelot)
- All-target-keys table
- Beat, note and multi-bar duration tables; half-time, double-time, 3/4 and 1.5x references
- Loop BPM inference and unstretched-loop drift calculator
- DJ pitch-fader / varispeed calculator
- Reverse calculator: playback rate to semitones and cents
- Note-frequency utility with adjustable A4 reference, and frequency-to-nearest-note
- Tap tempo
- Shareable URL state (calculator fields are written to the query string)

## Privacy

Everything runs in the browser. There is no account and no backend receives calculation values.
The only persisted state is the calculator state in the page URL.

## Run and test

No framework or build step.

```bash
npm test                      # node --test (Node.js 22 in CI)
python -m http.server 8000    # then open http://localhost:8000
```

`npm test` runs `tests/music.test.js` and `tests/timing-validation.test.js` (30 tests; all pass
locally on this snapshot).

## Deployment

`.github/workflows/pages.yml` runs `npm test`, syntax-checks `src/music.js` and `src/app.js`, and
deploys the repository to GitHub Pages on pushes to `main`.

## Project layout

```
index.html                 page markup
styles.css                 styling
favicon.svg, sitemap.xml   site assets
src/music.js               pure calculation functions (no DOM)
src/app.js                 wiring: reads inputs, calls music.js, updates the page and URL
ui-assistance.js           UI helper behaviour
tests/                     node:test suites for the calculation engine
docs/superpowers/specs/    design specification and addendum
```

## Specification

The design is in `docs/superpowers/specs/2026-10-01-transposition-calculator-design.md`, with
crosslink additions in the `contextual-crosslinks-addendum` file.

## Contributing

Keep calculations in `src/music.js` as pure functions and cover them in `tests/`. Keep the page
static: no build step and no network calls with calculation data.

## Licence

MIT, see [LICENSE](LICENSE). Copyright 2026 Sheldon Davidson. "Circuit Drift Labs" and
"TranspositionCalc" are unregistered trademarks; the licence does not grant trademark rights
(see [COPYRIGHT-TRADEMARK.md](COPYRIGHT-TRADEMARK.md)).
