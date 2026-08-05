# Calculator display formula: field/simple-result vs. RPN-result divergence

**Status:** open (§11 exception, no owner assigned yet)
**Filed:** 2026-08-05
**Standards citation:** architecture-standards §1.6 (single-sourced computation)
**Landed together with:** commit `3656b8d` (initial extraction)

## The divergence

The calculator has three display sites that all consume the same `CalcValue`
shape (SI-base numeric + declared unit symbol + prefix id) and produce a
`{ formattedValue, unitSymbol }` display record. All three agree on how to
compose `unitSymbol` (single-sourced via `composeUnitDisplaySymbol`). They
**disagree on how to compute the display value** from `val.value`:

| Site | File | Formula |
|---|---|---|
| Simple-mode field (all 3 fields) | `components/CalculatorFieldDisplay.tsx` | `val.value / kgResult.effectivePrefixFactor` |
| Simple-mode result field | `hooks/useCalculatorDisplayFormatters.calcResultDisplay` | `val.value / kgResult.effectivePrefixFactor` |
| Clipboard field copy (simple + RPN) | `hooks/useCalculatorClipboard.doCopyCalcField/doCopyRpnField` | `val.value / kgResult.effectivePrefixFactor` |
| RPN result field | `hooks/useCalculatorDisplayFormatters.rpnResultDisplay` | `siToDisplay(val.value, symbol, prefix)` |
| RPN origin metadata | `hooks/useCalculatorRpnSelection.computeOriginMetaForValue` | `siToDisplay(val.value, symbol, prefix)` |

The two families are packaged into helpers:
- `lib/calculator/formatCalcValueDisplay.ts` — the divide flavor (4 sites use it directly; the 5th is `computeOriginMetaForValue` which uses only the symbol half).
- Callers that want the `siToDisplay` flavor call `siToDisplay` directly and pull only `unitSymbol` from `composeUnitDisplaySymbol`.

## Why the divergence exists

`applyPrefixToKgUnit` was written to handle the kilogram's baked-prefix
special case (kg is the only SI base unit with a prefix built into its
name). Its `effectivePrefixFactor` field is correct for kg-containing
symbols and for the trivial case of "no prefix". It is **not** correct
for:

- **Temperature offsets.** Converting an SI kelvin value to Celsius or
  Fahrenheit requires subtracting an offset before scaling. Divide-by-
  factor produces the wrong number.
- **Inverse units.** Photon wavelength (`Hz` inverse), fuel economy
  (`km/L` vs. `L/100km`), and similar require `factor / siValue`, not
  `siValue / factor`.
- **Composite SI symbols not in CONVERSION_DATA.** `N`, `J`, `m²·s⁻¹`,
  and similar derived symbols aren't in the unit table, so
  `effectivePrefixFactor` falls back to `prefixData.factor` alone,
  which is a plain 10^n multiplier that happens to be correct only for
  power-of-1 symbols.

The RPN result display, which is where users see arbitrary derived
symbols after a chain of operations, has to handle all three cases,
which is what `siToDisplay` (in `lib/unit-symbols/siToDisplay.ts`) does.

The simple-mode field and result displays hold values that came from
the converter pane's `CONVERSION_DATA`-driven conversion, so they can
get away with the simpler divide formula: those values are guaranteed
to have `unitType === SI_BASE` and a `dimensions` map that matches an
in-catalog symbol.

**This is a load-bearing invariant of the current design, not a
coincidence.** But it's an invariant that:

1. Is not enforced by types or tests.
2. Will break silently if we ever add a way to get a temperature,
   inverse-unit, or bare-derived-symbol value into a simple-mode field
   (RPN → simple mode switch already partially does this; see below).
3. Is opaque to a reader looking at either display path.

## Known symptoms today

- **RPN → simple mode switch.** `useCalculatorModeSwitch.switchToSimple`
  seeds `calcValues[3]` from `rpnStack[3]`. If the top of the RPN stack
  is a temperature (kelvin dimension), a fuel-economy value, or a bare
  derived symbol with a prefix, the simple-mode result field will
  display the wrong number until the user does anything that
  recalculates. Not currently reachable through the UI in a way that
  produces a wrong-number-shown-to-user bug because the simple-mode
  result field is only *displayed*, not *editable*, and its inputs are
  overwritten on the next recalc — but the underlying data is briefly
  inconsistent.
- **Clipboard copy of an RPN field with a non-mass prefix.**
  `doCopyRpnField` uses the divide formula, which will produce a
  wrong number for a temperature or inverse-unit value on the RPN
  stack. This is reachable today. Manually verified: no known bug
  reports, but the formula is provably wrong for those inputs.

## Options

### Option A — Unify on `siToDisplay` (preferred)

Change `formatCalcValueDisplay` to use `siToDisplay` internally instead
of divide-by-factor. All five display sites then produce identical
numbers.

**Cost:** `siToDisplay` does a `lookupUnitForSymbol` per call, which is
an array scan over `CONVERSION_DATA`. For the field display, this runs
on every render. For hundreds of renders per second under
`framer-motion` animations, this could be a measurable perf hit.
Mitigation: memoize `lookupUnitForSymbol` (it's a pure function over a
static catalog).

**Risk:** low. `siToDisplay` handles every case the divide formula
handles (kg included, via the same `applyPrefixToKgUnit`), plus more.

### Option B — Add a `CalcValue.displayFormula` discriminator

Extend `CalcValue` with a field that says which formula applies
(`'simple'` vs. `'siToDisplay'`), set at construction time, and have
`formatCalcValueDisplay` branch on it.

**Cost:** every `CalcValue` producer has to be updated. Type-level
enforcement is strong but the invariant is preserved by convention,
not proof.

**Risk:** medium. Easy to miss a construction site and default to the
wrong formula.

### Option C — Leave it, but add invariant tests

Keep the two formulas. Add tests that assert every simple-mode
`CalcValue` producer only produces values whose `dimensions` correspond
to an in-catalog unit with a factor of 1 and no offset (the invariant
under which divide-by-factor is correct).

**Cost:** ongoing test maintenance; doesn't fix the RPN-clipboard-copy
bug.

**Risk:** high. Any future feature that broadens what can appear in a
simple-mode field silently breaks the invariant.

## Recommendation

**Option A**, with a follow-up profile to measure the render cost of
`lookupUnitForSymbol` under the current frame budget. If the cost is
meaningful, memoize the lookup and reassess.

## Resolution requirements

Before this exception can be closed:

1. Every display site produces the same numeric value from the same
   `CalcValue`, or the difference is proved correct by test.
2. The RPN-clipboard-field-copy bug (divide formula applied to a
   possibly-non-mass RPN value) is fixed.
3. `formatCalcValueDisplay.ts` and `useCalculatorDisplayFormatters.ts`
   comments referencing this file are updated or removed.
4. This file is deleted.

## Not in scope

- The `originalUnit`/`originalValue` preserve-source-unit path
  (`preserveSourceUnit && value.originalUnit != null`) in
  `CalculatorFieldDisplay.tsx`. That branch bypasses both formulas and
  displays the value as it was originally entered; it's a separate
  design concern.
- The converter pane's own display path
  (`useConverterClipboard`/`useConverterController` result rendering).
  Those consume different upstream data and don't share the
  `CalcValue` shape.
