# Consolidate CATEGORY_DIMENSION_MAP into CATEGORY_DIMENSIONS

## Problem

There are TWO dimensions maps in the codebase:

1. **Canonical**: `CATEGORY_DIMENSIONS` in
   `client/src/lib/units/categoryDimensions.ts`
   — 74 entries with `{ name, dimensions, isBase }` shape.
   Used by cross-domain match, SI representations, Direct pane.

2. **Local**: `CATEGORY_DIMENSION_MAP` in
   `client/src/lib/conversion-data.ts` (~line 408)
   — 74 entries, `Record<string, Record<string, number>>` shape
   (just dims, no name/isBase).
   Used only by `getCategoryDimensionsForParse` which returns
   dimensions for `parseUnitText` results (smart-paste dimensions).

## Known drift between the two maps

Comparison as of commit c9b9840:

| Category | CATEGORY_DIMENSIONS (canonical) | CATEGORY_DIMENSION_MAP (local) |
|---|---|---|
| `logarithmic` | `{}` | (missing entry) |
| `radiation_exposure` | `{current:1, time:1, mass:-1}` | (missing entry) |
| `shipping` | `{length:1}` | `{}` |
| `rack_geometry` | `{length:1}` | `{}` |
| `lightbulb` | `{intensity:1, solid_angle:1}` | `{}` |
| `acoustic_impedance` | `{mass:1, length:-2, time:-1}` | `{mass:1, length:-4, time:-1}` |
| `math` | (removed in 698d2e7) | still present with `{}` |

Also: `luminous_exitance` was present in both until purged in commit
c9b9840.

## Why this matters

For smart-paste, `getCategoryDimensionsForParse` returns the LOCAL
map's dimensions, which are wrong for `shipping`, `rack_geometry`,
`lightbulb`, and `acoustic_impedance`. This means when the user
pastes a value with `rack_geometry` units, the parse result's
`dimensions` field reports `{}` instead of `{length:1}`.

Downstream consequence: any code that then dispatches based on the
parse result's `dimensions` sees wrong values for these four
categories. The impact is likely small (rack/shipping/lightbulb are
all specialists with primaryCategory dedup, so many code paths still
resolve correctly via other mechanisms) but the map is unambiguously
stale and confusing.

## Proposal

1. Delete `CATEGORY_DIMENSION_MAP` (~40 lines of dead-ish duplicated data).
2. Rewrite `getCategoryDimensionsForParse` to read from
   `CATEGORY_DIMENSIONS` (the canonical map):

   ```typescript
   function getCategoryDimensionsForParse(categoryId: UnitCategory): Record<string, number> {
     return CATEGORY_DIMENSIONS[categoryId]?.dimensions ?? {};
   }
   ```

3. Delete the now-unused `math` entry from anywhere it still
   surfaces.
4. Verify the parse pipeline's tests still pass \u2014 the four fixed
   categories (shipping, rack_geometry, lightbulb, acoustic_
   impedance) may cause downstream behavior changes in smart-paste
   that need test updates.

## Risk

The four categories with wrong dims in the local map have had those
wrong dims through the entire history of smart-paste testing. If any
existing test implicitly depends on `{}` for one of them, the fix
would break the test even though the fix is correct. Approach with
care: run the test suite after the change and analyze any failures.

## Scope estimate

- 1 commit, small-medium scope.
- Blast radius: only `parseUnitText` and downstream consumers of the
  parse result's `dimensions` field.
- Bonus: eliminates one entire duplicated data map, worth 40+ lines.
