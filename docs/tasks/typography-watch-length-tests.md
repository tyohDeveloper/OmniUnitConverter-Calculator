# Typography & Watch Length Test Cases

## What & Why
Task #67 adds the Typography & Watch Lengths category to the sidebar (under "Other") and introduces two new units: Ligne and Didot point. These test cases verify that the data is correct, the category appears in the UI, and localization handles the new category name.

## Done looks like
- `conversion.test.ts` has a dedicated block for the typography category that confirms the category exists, Ligne has the correct conversion factor, and Didot point has the correct conversion factor
- `e2e/converter.e2e.ts` has tests that confirm "Typography & Watch Lengths" (or the final category name from #67) appears in the sidebar under "Other", and that clicking it reveals a unit list containing Ligne and Didot point
- `localization.test.ts` has a check confirming the category's display-name translation key is present and non-empty across all supported languages

## Out of scope
- Adding or changing any conversion data or category wiring (that is Task #67's responsibility)
- Testing every individual typography unit beyond Ligne and Didot point

## Tasks
1. **Conversion accuracy tests** — In `conversion.test.ts`, add a block for the `typography` category: assert the category exists in `CONVERSION_DATA`, assert Ligne's factor is correct relative to meters (~0.0022558 m), and assert Didot point's factor is correct relative to meters (~0.000376065 m).

2. **E2E sidebar & unit list tests** — In `tests/e2e/converter.e2e.ts`, add two tests: one that checks the typography category label is visible in the sidebar under the "Other" group, and one that clicks it and verifies Ligne and Didot point appear in the resulting unit list.

3. **Localization coverage test** — In `tests/localization.test.ts`, add a test that iterates over all supported locales and confirms the typography category's translation key resolves to a non-empty, non-key string (i.e. the key is actually translated and not falling back to the raw key).

## Relevant files
- `tests/conversion.test.ts`
- `tests/e2e/converter.e2e.ts`
- `tests/localization.test.ts`
