---
title: RPN: Richer stack value model + source unit display mode
---
# RPN: Richer Stack Value + Display Mode

## What & Why
Two related changes:
1. **Richer `CalcValue` data model** — each stack register now always stores additional origin metadata: the SI base unit symbol, the original unit it was entered in, the original numeric value, and the measurement system (unit type). This happens regardless of any toggle — the data is always there.
2. **Display mode toggle** — a toggle in the RPN calculator that controls what the user sees. Off (default): the visual is identical to today — the richer state is stored but not displayed. On: the display shows only the original value and unit symbol (e.g. "15 ft") instead of the SI-derived display.

## Done looks like
- Each value on the RPN stack carries: the SI base unit symbol (e.g. "m"), the numeric value in SI base units, `sourceCategory`, the original unit symbol (e.g. "ft"), the numeric value in that original unit (e.g. 15), and the unit type of the original unit (e.g. US common).
- A `UnitType` enum exists with these initial values: `SI_BASE`, `US_COMMON`, `US_COMMON_FLUID`, `US_COMMON_DRY`, `IMPERIAL`. The enum is designed to be extended later.
- Every unit in the conversion data has a `unitType` tag applied. Where a unit belongs to multiple systems (e.g. the pint), the primary convention is followed.
- When the user selects a different unit (or unit + category) from the X register dropdown, the X register entry is updated so that `originalUnit`, `originalValue`, `unitType`, and `sourceCategory` all reflect the newly chosen unit — keeping the metadata in sync with the displayed unit.
- A toggle is visible in the RPN calculator UI (off by default). When off, all richer state is stored on every stack entry as normal, but the visual display is identical to today — nothing changes for the user.
- When the toggle is on, the X register shows only the original numeric value and original unit symbol (e.g. "15 ft") — no other metadata is visible.
- Stacked values (Y, Z) retain that same display (original value + original unit only) while the toggle is on.
- Math operation results display normally regardless of toggle state — the origin fields are not propagated to computed results, so results always fall back to the current SI-derived display.

## Out of scope
- Unit-aware arithmetic (e.g. keeping results expressed in the original unit). Planned as a follow-on task.
- Adding more unit types beyond the five listed above.
- Changing any converter or non-RPN calculator behavior.
- Values typed manually into the X register (bare numbers without a unit selection) will have no origin metadata — metadata is only set via the converter pull or the unit dropdown.

## Tasks
1. **Define `UnitType` enum** — Create a `UnitType` enum (or string union) in a shared types file with initial values: `SI_BASE`, `US_COMMON`, `US_COMMON_FLUID`, `US_COMMON_DRY`, `IMPERIAL`. Document that more types will be added later.

2. **Tag units in conversion data** — Add an optional `unitType` field to the `UnitDefinition` interface. Go through all units in the conversion data files and tag each with the appropriate `UnitType`. SI base and derived units get `SI_BASE`; US customary liquid measures get `US_COMMON_FLUID`; dry measures get `US_COMMON_DRY`; imperial measures get `IMPERIAL`; other US customary units get `US_COMMON`. Units that don't fit (archaic, specialty) can be left untagged for now.

3. **Extend `CalcValue` with richer origin fields** — Add the following optional fields to `CalcValue`: `siUnit` (string — the SI base unit symbol for this quantity, e.g. "m"), `originalUnit` (string — the symbol of the unit as it was entered, e.g. "ft"), `originalValue` (number — the numeric value in that original unit, e.g. 15), `unitType` (`UnitType` — the measurement system of the original unit).

4. **Populate origin fields on pull from converter** — In `pullFromPane`, populate all four new fields using: the category's `baseSISymbol` for `siUnit`, the selected unit's symbol for `originalUnit`, the displayed numeric result for `originalValue`, and the selected unit's `unitType` tag for `unitType`.

5. **Update origin fields when X register unit is changed** — When the user selects a different unit (or unit + category) from the X register dropdown, recompute and update `originalUnit`, `originalValue`, `unitType`, and `sourceCategory` on the X register's `CalcValue` to reflect the newly selected unit. `siUnit` and `value` remain unchanged since the SI magnitude does not change.

6. **Add the display mode toggle to calculator state** — Add a `preserveSourceUnit` boolean (default `false`) to `CalculatorState`. Wire up a new action and reducer case to toggle it.

7. **Display original label when toggle is on** — In `CalculatorFieldDisplay` and the X register display path, check for `preserveSourceUnit` and whether the `CalcValue` has `originalUnit` + `originalValue`. If both conditions are met, render only those two values (e.g. "15 ft") — no other metadata (siUnit, unitType, sourceCategory) is shown to the user.

8. **Strip origin fields from operation results** — Ensure `applyRpnBinary` and unary operation handlers do not forward `originalUnit`, `originalValue`, or `unitType` to the resulting `CalcValue`. Results always display normally.

9. **Add the toggle button to the RPN UI** — Place a clearly labelled toggle (e.g. "Keep source units") in the RPN calculator panel, connected to the `preserveSourceUnit` state. Low-prominence since it is off by default. All new interactive and display elements introduced in this task must have unique `data-testid` attributes following the existing pattern (`{action}-{target}` for interactive elements, `{type}-{content}` for display elements).

## Relevant files
- `client/src/lib/units/calcValue.ts`
- `client/src/lib/units/dimensionalFormula.ts`
- `client/src/components/unit-converter/state/calculatorReducer.ts`
- `client/src/components/unit-converter/state/rpnReducer.ts`
- `client/src/components/unit-converter/components/CalculatorFieldDisplay.tsx`
- `client/src/features/unit-converter/components/CalculatorPane.tsx`
- `client/src/features/unit-converter/app/UnitConverterApp.tsx`
- `client/src/lib/calculator/applyRpnBinary.ts`
- `client/src/lib/calculator/applyRpnUnary.ts`
- `client/src/lib/calculator/types.ts`