# Behaviour-Affecting Cleanup

## What & Why
With module boundaries stabilised from Task A, three remaining issues can be addressed safely: the regional spelling fallback is inconsistent with all other localization (which uses JSON key-value lookup), `findBestPrefix` is a dead code path that duplicates the purpose of `findOptimalPrefix`, and `normalizeMassDisplay` has two distinct logic branches that would be clearer as named private helpers.

## Done looks like
- British/American spelling variants (Meter→Metre, Liter→Litre, Gasoline→Petrol, Kerosene→Paraffin, and their parenthetical disambiguations) are entries in `unit-name-translations.json` under `en` and `en-us` keys, handled by the same `t()` lookup as all other translations
- `applyRegionalSpelling.ts` is deleted; its import in `UnitConverterApp.tsx` is removed
- `findBestPrefix.ts` is deleted along with its test coverage; a static usage check confirms no active call sites remain and `findOptimalPrefix` covers all cases
- `normalizeMassDisplay` delegates its two distinct branches (gram-prefix scaling vs standard kg handling) to named private helper functions, making the intent of each branch explicit
- All localization tests, conversion tests, and prefix/mass normalization tests pass; no user-visible behaviour changes

## Out of scope
- Any further module splitting or import graph changes (covered by Task A)
- Changes to `findOptimalPrefix` logic beyond confirming it handles all cases `findBestPrefix` covered
- Further splitting `calculator/siDerivedUnits.ts`

## Tasks
1. **Audit translation coverage** — Before removing `applyRegionalSpelling`, verify that every string variant it currently handles has a corresponding entry in `unit-name-translations.json` for both `en` and `en-us`. Add any missing entries.

2. **Remove `applyRegionalSpelling`** — Once translation coverage is confirmed complete, delete `applyRegionalSpelling.ts` and remove its import and call site in `UnitConverterApp.tsx`.

3. **Remove `findBestPrefix`** — Perform a static check to confirm no active call sites remain, verify `findOptimalPrefix` covers all cases, delete `findBestPrefix.ts`, and remove or redirect its test coverage.

4. **Refactor `normalizeMassDisplay`** — Extract the gram-prefix scaling branch and the standard kg handling branch into clearly named private helper functions within the same file.

5. **Verify** — Confirm all localization, conversion, prefix selection, and mass normalization tests pass with no behaviour changes.

## Relevant files
- `client/src/lib/units/applyRegionalSpelling.ts`
- `client/src/lib/units/findBestPrefix.ts`
- `client/src/lib/units/normalizeMassDisplay.ts`
- `client/src/lib/units/prefixes.ts`
- `client/src/features/unit-converter/app/UnitConverterApp.tsx`
- `client/src/data/localization/unit-name-translations.json`
- `client/src/lib/translateUnit.ts`
- `tests/helpers-functions.test.ts`
