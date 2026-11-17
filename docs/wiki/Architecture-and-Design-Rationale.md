# Architecture and Design Rationale

Sources: `docs/superpowers/specs/2026-10-01-transposition-calculator-design.md` and the code.

## Shape

Two layers. `src/music.js` is pure maths and music theory (no DOM, no globals), so the tests can
exercise it directly with Node. `src/app.js` connects it to the page. This split is the main design
decision and is what makes `npm test` useful without a browser.

## Why static, no framework

The spec describes a "static GitHub Pages utility". Serving plain files means no build step, no
dependencies to update, and deployment is a Pages artifact of the repository root. *(inferred from the
spec's "Purpose" and the absence of a bundler.)*

## Why state lives in the URL

The spec lists "URL-shareable calculation state" as core V1. The app writes every calculator field to
the query string, so a result can be shared without a server or storage. *(from `src/app.js`.)*

## Defined behaviour

- Pitch maths: 12-tone equal temperament; one octave doubles the playback rate and the BPM.
- Keys are normalised to pitch classes, so enharmonic spellings compare equal.
- The spec lists sharp/flat preference and both semitone path modes; the functions take a `mode` and `prefer` parameter.
- Drift is computed for an unstretched loop, so it measures the timing error of a loop that is not time-stretched.
