---
name: Build size ceiling
description: The single-file HTML build is nearly at verify-build's gzip ceiling; adding data/features will fail CI without action.
---
The rule: `scripts/verify-build.mjs` enforces gzip size ≤ baseline × 1.05 (baseline 424.2 kB recorded 2026-04-14). As of July 2026 the build sits at ~445.1 kB vs a 445.4 kB ceiling.

**Why:** The app inlines 70 unit-category JSONs and 12-language translation files into one HTML file, so nearly any addition pushes it over.

**How to apply:** Before adding units, categories, or translations, check headroom with `npm run build && node scripts/verify-build.mjs`. If over, either trim payload or deliberately re-baseline the ceiling in the script (a follow-up task exists for this).
