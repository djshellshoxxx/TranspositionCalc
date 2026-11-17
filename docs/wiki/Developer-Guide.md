# Developer Guide

## Run

```bash
python -m http.server 8000
```

No build step. Open `http://localhost:8000`.

## Test

```bash
npm test
```

Uses Node's built-in `node --test` (CI uses Node 22). Tests import from `src/music.js` directly.
Locally this snapshot passed 30/30 tests.

## Deploy

Pushes to `main` run `.github/workflows/pages.yml`: tests, a syntax check of the browser modules
(`node --input-type=module --check`), then a GitHub Pages deployment of the repository root.
Because the artifact is the repo root, do not add files that must stay private.

## Conventions

- Put every calculation in `src/music.js` as a pure, exported function. Keep DOM code out of it.
- Add a test for each new calculation in `tests/`.
- `src/app.js` is the only place that reads inputs and writes results; it also syncs state to the URL.
- Keep the site static. No build tools, no runtime dependencies.
