---
name: Temporal polyfill for calendar dates
description: Gotchas using @js-temporal/polyfill for the Date converter category.
---
- The pre-ROC era code in @js-temporal/polyfill is `roc-inverse`, NOT `broc` (CLDR alias). `before-roc` also works as an alias; the canonical era on a constructed date is `roc-inverse`.
- **Why:** `Temporal.PlainDate.from({calendar:'roc', era:'broc', ...})` throws "Era broc was not matched"; probe era codes against the polyfill before hardcoding.
- The polyfill costs ~60 kB gzip in the single-file build — the July 2026 re-baseline to 507.8 kB gzip exists because of it.
- **How to apply:** any new era-aware calendar work should validate era codes with a quick node probe; keep `overflow:'reject'` for strict date validation (silently constrains otherwise).
