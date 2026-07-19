---
name: Build size ceiling
description: verify-build enforces a gzip size ceiling on the single-file HTML build; check headroom before adding data.
---
The rule: `scripts/verify-build.mjs` enforces gzip size ≤ baseline × 1.05 (baseline re-recorded 2026-07-19 at 434.3 kB gzip, ceiling ~456 kB; build measured ~440.8 kB gzip after per-unit source URLs were added — only ~15 kB headroom left). Next sizable data addition will likely require re-baselining.

**Why:** The app inlines 70 unit-category JSONs and 12-language translation files into one HTML file, so large data additions can push it over.

**How to apply:** Before adding sizable units, categories, or translations, check headroom via the verify-build workflow. If over, either trim payload or deliberately re-baseline the ceiling (update `scripts/build-baseline.json` with a note).

Related: a build-only Vite plugin prunes localization entries identical to their English/key fallback from the production bundle (source JSONs stay complete, so completeness tests keep passing; dev/vitest unaffected). New translations that just repeat English cost ~0 bundle bytes, but they must still be added to source files for tests. Runtime translate functions must keep their missing-key → English → key fallback chain, or pruning breaks display.
