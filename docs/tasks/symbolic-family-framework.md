# SYMBOLIC family framework wiring

> **Status:** future/aspirational. Prerequisite for the temporal
> converters. Not to be started until well past the current
> architectural consolidation is complete.

## What & Why

The `SYMBOLIC` CategoryFamily was added as a placeholder in commit
b111ef8 with no consumers. This task wires it into the converter
pipeline so string-valued conversions (timezone codes, calendar
tags) can flow through the same converter pane as numeric units.

The temporal-time-category and temporal-date-category tasks both
depend on this work landing first.

## Current numeric-only assumptions to widen

The converter pipeline assumes `value: number` end-to-end:

- **State**: `result: number | null` (see `useConverterState`).
- **Effect**: `useConverterResultEffect` calls `computeConversion`
  which returns a number.
- **Input**: `sanitizeInput` treats input as a number string with
  format-aware separators. `handleInputChange` in
  `useConverterInputHandlers` runs it through sanitization.
- **Output**: `ConverterOutputSection` and downstream components
  format the result with number-precision controls.
- **Clipboard**: `useConverterClipboard` formats numbers via
  `formatForClipboard`, `formatDMS`, etc.
- **Compare-all / cross-domain**: dimensional match assumes numeric
  factor + optional conversionFunction. Both are `number -> number`.

Every one of these needs to gain a string/symbol path parallel to
the numeric one. The clean architecture is per-category dispatch
based on `family`.

## High-level shape (aspirational)

```typescript
type ConverterValue =
  | { kind: 'numeric'; value: number }
  | { kind: 'symbolic'; value: string };

type ConverterResult =
  | { kind: 'numeric'; value: number | null }
  | { kind: 'symbolic'; value: string | null };
```

Alternative shape considered: parallel `numericValue: number | null`
and `symbolicValue: string | null` state fields, dispatched by
`family`. Simpler for callers that only handle one case, but harder
to keep invariants (which field is authoritative?). The tagged
union is likely cleaner.

## Framework changes needed

1. **State widening**: `useConverterState.result` becomes the tagged
   union above (or the parallel fields). Same for `useCalculatorState`
   if push-to-calculator is to support symbolic values.

2. **`computeConversion` widening**: currently `(numeric args) -> number`.
   Needs a symbolic branch dispatched by category family:

   ```typescript
   function computeConversion(args): ConverterResult {
     const family = CATEGORY_FAMILIES[args.activeCategory];
     if (family === 'SYMBOLIC') {
       return computeSymbolicConversion(args);  // NEW
     }
     return computeNumericConversion(args);  // existing path
   }
   ```

3. **Per-family input widget dispatch**: the input component today
   is a text field with numeric sanitization. Needs a family-aware
   selector that renders:

   - SI_QUANTITY / DIMENSIONLESS_RATIO / DATA_QUANTITY /
     FUEL_ECONOMY / NUMERIC_FUNCTION: current numeric text field.
   - SYMBOLIC (time): implicit 'now' or optional time-of-day picker.
   - SYMBOLIC (date): date picker or free-form parser respecting
     the from-calendar's era conventions.

   Widget dispatch could be a `<CategoryInput>` component that
   internally picks the right sub-component by family. Or per-family
   input components with the converter pane picking one via a
   registry.

4. **Per-family output rendering**: parallel to input. Numeric
   output uses precision/format controls; symbolic output formats
   the string per the target category's rules (e.g. `Intl.DateTime
   Format` for dates).

5. **conversionFunction widening**: currently the JSON schema field
   `conversionFunction` names a string that resolves to a
   `(number) -> number` function pair in
   `conversionFunctionRegistry.ts`. Add a parallel
   `symbolicConversionFunction` field that names `(string) -> string`
   pairs. Or widen the existing field's signature and let the
   registry type-check per-family.

6. **Compare-all / cross-domain match**: skip SYMBOLIC categories
   entirely. Dimensional match is meaningless for symbolic
   conversions. The existing `family !== 'SI_QUANTITY'` predicate in
   `findCrossDomainMatchesByKey` already excludes SYMBOLIC \u2014 no
   change needed there.

7. **Clipboard / copy**: format symbolic results as their canonical
   string form. Don't apply precision. Don't apply DMS/FtIn
   compound-unit path.

8. **Tests**: a whole new category of scenarios. Any test iterating
   `CONVERSION_DATA` needs to be reviewed for numeric assumptions
   (they exist in `conversion.test.ts`, `smart-paste.test.ts`,
   `calculator.test.ts`). Add family-specific test suites for the
   SYMBOLIC path.

## Non-goals

- **Do not** widen every code path to accept symbolic values
  uniformly. Family-dispatched branches are cleaner than universal
  polymorphism.
- **Do not** try to make the Direct pane's freehand dimensional
  input accept symbolic values. SYMBOLIC categories have no
  dimensional formula; they're accessed only via the category
  dropdown.
- **Do not** attempt smart-paste routing to SYMBOLIC categories.
  `findCategoryByDimensions` should continue to skip them via the
  family filter.
- **Do not** support push-to-calculator for symbolic values (at
  least initially). The RPN stack is numeric; forcing symbolic
  values onto it would require rethinking the stack model.

## Estimated shape

- **New files (likely)**: `computeSymbolicConversion.ts`, a
  `CategoryInput` widget dispatcher, per-family input/output
  components (at least `SymbolicInput`, `SymbolicOutput`), a
  `symbolicConversionFunctionRegistry.ts`.
- **Widened files**: `useConverterState`, `useConverterResultEffect`,
  `useConverterInputHandlers`, `ConverterInputSection`,
  `ConverterOutputSection`, `useConverterClipboard`,
  `computeConversion`, JSON schema (add `symbolicConversionFunction`
  field), Zod validator.
- **Comparable scope**: similar to the taxonomy retirement arc that
  ran across ~13 commits this session. Multi-commit series, each
  step independently verifiable.

## Prerequisites (what needs to be true before starting)

- Current architectural consolidation is fully complete (it is, as
  of commits landing in this session).
- Post-2020 browser support target confirmed (Temporal polyfill's
  ES2020 baseline is fine).
- `temporal-polyfill` bundled and available to the app. This alone
  is a small step \u2014 add the package, verify bundle size impact
  (~20 KB gzipped per the design brief), confirm it works with
  Vite's tree-shaking.

## Companion docs

- [temporal-calendar-timezone-design-brief.md](./temporal-calendar-timezone-design-brief.md)
  \u2014 shared design foundation. Read this first.
- [temporal-time-category.md](./temporal-time-category.md) \u2014 the
  first SYMBOLIC category to build once this framework work lands.
- [temporal-date-category.md](./temporal-date-category.md) \u2014 the
  second, larger SYMBOLIC category (calendars).
