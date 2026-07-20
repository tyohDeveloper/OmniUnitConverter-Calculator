---
title: Fix the broken Typography check so unit list problems can't slip through unnoticed
---
# Fix the broken Typography check so unit list problems can't slip through unnoticed

  ## What & Why
  A pre-existing end-to-end test ("should display typography units including Ligne and Didot Point when selected" in `tests/e2e/converter.e2e.ts`) fails: after clicking the Typography category, `getByText('Ligne')` finds nothing — the unit names likely live inside a dropdown that must be opened first, or the selector is stale. While it stays red, real regressions in the unit list would go unnoticed.

  ## Done looks like
  - The test reliably passes by interacting with the UI the way a user does (e.g. opening the unit selector before asserting names)
  - The full e2e suite runs green (run with `PW_CHROMIUM_PATH=$(which chromium) npx playwright test` in this environment)

  ## Relevant files
  - `tests/e2e/converter.e2e.ts`
  - `client/src/features/unit-converter/components/ConverterPane.tsx`