---
name: Build size ceiling
description: verify-build enforces a gzip size ceiling on the single-file HTML build; check headroom before adding data.
---
The rule: `scripts/verify-build.mjs` enforces gzip size ≤ baseline × 1.05 (baseline 424.2 kB recorded 2026-04-14, ceiling 445.4 kB). As of July 2026 the build sits at ~364 kB gzip — about 81 kB of headroom, so small data additions are safe.

**Why:** The app inlines 70 unit-category JSONs and 12-language translation files into one HTML file, so large data additions can push it over.

**How to apply:** Before adding sizable units, categories, or translations, check headroom via the verify-build workflow. If over, either trim payload or deliberately re-baseline the ceiling in the script.
