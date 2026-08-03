# Wire the Build Gate (typecheck + lint + tests + verify)

> **Source.** Generated from the model-council architecture pass in `docs/perplexity/`. See [architecture-pass-council-synthesis.md](../perplexity/architecture-pass-council-synthesis.md) for the ranked change list this task implements, and [architecture-standards.md](../perplexity/architecture-standards.md) for the normative rules it enforces.
> **Priority.** P0. This is the change that makes every other rule in the standards doc self-enforcing.
> **Standards reference.** §6 (build-time gating), §7 (enforcement mechanics).

## What & Why
Today `"build": "vite build"` in `package.json` runs nothing else. Typechecking, size lint, unit tests, and the artifact verifier all exist but are unreachable from the build command. The user-facing standard "tests run at build time" is therefore currently false. This task wires typecheck, size lint, Vitest, bundling, and verification into a single `npm run build` command and reproduces the sequence in CI.

## Done looks like
- `npm run build` runs `tsc --noEmit`, `node scripts/lint-size.mjs`, `vitest run`, `vite build`, then `node scripts/verify-build.mjs` in order and fails on the first error.
- A `build:fast` escape hatch skips the pre-checks and the final minimization for local iteration, but is not usable to produce a release artifact (`verify:build` rejects any non-minimized output — see §14).
- A GitHub Actions workflow runs `npm ci && npm run build` on every PR and every push to `main`, followed by `npm run test:e2e` as a separate job.
- No existing test or script is deleted.

## Out of scope
- Extending `lint-size.mjs` to new directories (a separate task, council-12).
- Adding ESLint (council-12).
- Adding the minification pass (council-04).

## Tasks
1. **Update `package.json` scripts.** Add `"check": "tsc --noEmit"`, `"lint:size": "node scripts/lint-size.mjs"`, `"test:run": "vitest run"`, `"build:bundle": "vite build"`, `"verify:build": "node scripts/verify-build.mjs"`. Compose them into `"build": "npm run check && npm run lint:size && npm run test:run && npm run build:bundle && npm run verify:build"`. Add `"build:fast": "vite build"`.
2. **Add `.github/workflows/build.yml`.** One job runs `npm ci` and `npm run build`. A second job runs `npm ci && npx playwright install --with-deps chromium && npm run test:e2e`.
3. **Verify locally.** From a clean checkout, `npm run build` executes all stages and the output artifact still lands at `dist/public/index.html`.

## Relevant files
- `package.json`
- `scripts/lint-size.mjs`, `scripts/verify-build.mjs`, `scripts/build-baseline.json`
- `.github/workflows/build.yml` (new)
