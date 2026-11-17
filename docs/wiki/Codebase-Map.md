# Codebase Map: where to find what

| I want to... | Look in |
|---|---|
| Change a calculation (semitones, cents, BPM, drift, varispeed) | `src/music.js` |
| Key notation (Camelot, Open Key, neighbours, all-keys table) | `src/music.js` (`camelotForKey`, `openKeyForKey`, `harmonicNeighbors`, `allTargets`) |
| Frequency and note utilities | `src/music.js` (`noteFrequency`, `frequencyToNote`) |
| Input and output wiring, URL state | `src/app.js` |
| Helper UI behaviour | `ui-assistance.js` |
| Page layout and controls | `index.html`, `styles.css` |
| Tests | `tests/music.test.js`, `tests/timing-validation.test.js` |
| Deploy pipeline | `.github/workflows/pages.yml` |
| Design spec | `docs/superpowers/specs/` |
| SEO | `sitemap.xml`, `favicon.svg` |
| Licence and trademark | `LICENSE`, `COPYRIGHT-TRADEMARK.md` |
