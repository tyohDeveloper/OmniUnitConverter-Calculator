# Separate s⁻¹ Categories in Calculator Dropdown

## What & Why
Frequency, radioactivity, and radioactive decay all share the same SI dimension (s⁻¹ / time⁻¹), so the calculator's unit dropdown currently shows units from all three categories interchangeably. This change adds source-category pinning to `CalcValue` so that when a user enters a value with a specific unit (e.g. Bq, Hz, or a decay constant), the dropdown shows only that category's units. It also cleans up the category data to remove generic rate units from radioactive decay and adds per-week and per-year to frequency.

## Done looks like
- Entering a value as `Hz` (or any frequency unit) shows only frequency units in the dropdown
- Entering a value as `Bq` (or Ci, Rd) shows only radioactivity units in the dropdown
- Entering a value as a decay constant (t½, τ, per-day etc.) shows only radioactive decay units in the dropdown
- After any arithmetic operation on a pinned value, the result loses its category pin and falls back to showing all dimensionally compatible units (current behaviour)
- `per-second`, `per-minute`, `per-hour`, and `per-year` no longer appear in the radioactive decay category; only half-life (t½), mean-lifetime (τ), and per-day units remain there
- `per-week` (wk⁻¹) and `per-year` (y⁻¹) are available as selectable units in the frequency category
- Angular velocity pseudo-units (rad/1 and similar generated representations) no longer appear in the frequency dropdown

## Out of scope
- Extending pseudo-dimensions for radioactivity/decay (Option C — a future, larger effort)
- Changing how energy vs. torque are distinguished (same-dimension problem, separate issue)
- Changing the radioactive decay half-life or mean-lifetime conversion factors

## Tasks
1. **Add `sourceCategory` to `CalcValue`** — Add an optional `sourceCategory?: string` field to the `CalcValue` interface. Arithmetic operations that change or combine dimensions must clear this field on the result; operations that preserve dimensions (negation, sign change) should pass it through unchanged.

2. **Set sourceCategory at unit entry** — When a user enters or selects a unit from a known conversion category, record that category's id as `sourceCategory` on the resulting `CalcValue`.

3. **Filter dropdown by sourceCategory** — In the dropdown generation logic, when the current X register value has a `sourceCategory` set, restrict the category units shown to only that category (skipping all other categories that share the same dimensions). When `sourceCategory` is absent, keep the existing fallback behaviour of showing all dimensionally compatible units.

4. **Clean up radioactive_decay.json** — Remove `per_s`, `per_min`, `per_hr`, and `per_year` entries from the radioactive decay category. Keep `per_day`, all half-life (t½), and all mean-lifetime (τ) entries.

5. **Add per-week and per-year to frequency.json** — Add `per_week` (symbol `wk⁻¹`, factor `1/604800 ≈ 1.6534e-6`) and `per_year` (symbol `y⁻¹`, factor `1/31557600 ≈ 3.1688e-8`) to the frequency unit list. Also add `s⁻¹` as an explicit selectable unit (factor 1, same as Hz) and make it the default display unit for the frequency category.

6. **Suppress angular velocity pseudo-units from frequency dropdown** — Ensure that generated hybrid representations involving the `angle` pseudo-dimension (e.g. `rad/1`) are excluded from the dropdown when the value's own dimensions do not include `angle`.

## Relevant files
- `client/src/lib/units/calcValue.ts`
- `client/src/data/conversion/frequency.json`
- `client/src/data/conversion/radioactive_decay.json`
- `client/src/data/conversion/radioactivity.json`
- `client/src/lib/calculator/generateSIRepresentations.ts`
- `client/src/lib/units/categoryDimensions.ts`
