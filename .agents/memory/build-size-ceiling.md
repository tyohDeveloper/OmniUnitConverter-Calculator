---
name: Build size ceiling
description: verify-build enforces a gzip size ceiling on the single-file HTML build; check headroom before adding data.
---
The rule: `scripts/verify-build.mjs` enforces gzip size ≤ baseline × 1.05 (baseline re-recorded 2026-07-20 at 518.5 kB gzip after the Roman-consuls backfill to 509 BCE; ceiling ~544 kB, current build ~518.5 kB, so ~26 kB headroom). Parallel data additions can each pass locally but stack past the ceiling on merge, so the clean tree may already be failing before your change — always build the untouched tree first to separate pre-existing growth from your own delta, audit that the growth is legitimate data, then re-baseline with a note.

**Why:** The app inlines 70 unit-category JSONs and 12-language translation files into one HTML file, so large data additions can push it over.

**How to apply:** Before adding sizable units, categories, or translations, check headroom via the verify-build workflow. If over, either trim payload or deliberately re-baseline the ceiling (update `scripts/build-baseline.json` with a note).

Related: a build-only Vite plugin prunes localization entries identical to their English/key fallback from the production bundle (source JSONs stay complete, so completeness tests keep passing; dev/vitest unaffected). New translations that just repeat English cost ~0 bundle bytes, but they must still be added to source files for tests. Runtime translate functions must keep their missing-key → English → key fallback chain, or pruning breaks display.
