# Extract Logic From Panes Into lib/ + Controller Actions

> **Source.** Generated from the model-council architecture pass in `docs/perplexity/`. See [architecture-pass-council-synthesis.md](../perplexity/architecture-pass-council-synthesis.md) and [architecture-standards.md](../perplexity/architecture-standards.md).
> **Priority.** P1. UI layer must not compute domain results.
> **Standards reference.** §1.1 (JSX may not compute domain results, parse text, format numbers, or perform dimensional arithmetic inline).

## What & Why
Domain logic currently lives inside JSX render bodies and `useEffect` blocks in three panes:

- `client/src/features/unit-converter/components/CalculatorPane.tsx:106-135` — `commitRpnXValue` parses text and mutates the RPN stack from a render component.
- `client/src/features/unit-converter/components/CalculatorPane.tsx:141-191` — a 50-line `useEffect` implementing value re-expression math (`displayToSI` → `siToDisplay`, prefix symbol computation, `toPrecision(15)` rounding) triggered by dropdown changes.
- `client/src/features/unit-converter/components/ConverterPane.tsx:392-415` — conversion-ratio display math done inside JSX.
- `client/src/features/unit-converter/components/ConverterPane.tsx:459-511` — comparison-mode conversions computed inside a render-time IIFE.
- `client/src/features/unit-converter/components/DirectPane.tsx:72-84` — unit-text parsing and exponent mutation from the view.

## Done looks like
- Each of the five sites above is extracted to a pure function under `client/src/lib/` (per-domain: `lib/calculator/`, `lib/units/`, `lib/formatting.ts` where appropriate). Each new file is ≤100 lines and exports exactly one function.
- The pane consumes the pure function output via a controller hook; JSX becomes purely declarative rendering plus event dispatch.
- Each new pure function has direct unit tests independent of any component render.
- All Playwright and Vitest tests continue to pass.

## Out of scope
- Splitting `CalculatorPane` into simple/rpn sub-panes (council-09).
- Moving refs into reducers (council-11).

## Tasks
1. **Extract `commitRpnXValue`.** Create `lib/calculator/parseRpnXInput.ts` returning a typed `RpnEntry` from text input plus current metadata. Move the stack mutation into a controller action, not the view.
2. **Extract the re-expression `useEffect`.** Create `lib/calculator/reexpressRpnEntry.ts` returning `{ value, prefix, displaySymbol }`. The pane's effect shrinks to a dispatch call.
3. **Extract the ratio-display math.** Create `lib/calculator/computeConversionRatio.ts`. ConverterPane's JSX reads a controller-computed value.
4. **Extract the comparison-mode IIFE.** Create `lib/calculator/buildComparisonRows.ts` returning `ComparisonRow[]`. ConverterPane maps over rows and renders.
5. **Extract DirectPane parsing.** Create `lib/units/parseDirectEntry.ts` returning updated exponents from text.
6. **Add tests.** One `.test.ts` per new file; edge cases explicitly enumerated for parsing.

## Relevant files
- `client/src/features/unit-converter/components/CalculatorPane.tsx`
- `client/src/features/unit-converter/components/ConverterPane.tsx`
- `client/src/features/unit-converter/components/DirectPane.tsx`
- `client/src/components/unit-converter/hooks/useCalculatorController.ts`
- `client/src/components/unit-converter/hooks/useConverterController.ts`
- New: `client/src/lib/calculator/{parseRpnXInput,reexpressRpnEntry,computeConversionRatio,buildComparisonRows}.ts`
- New: `client/src/lib/units/parseDirectEntry.ts`
- New test files under `tests/`
