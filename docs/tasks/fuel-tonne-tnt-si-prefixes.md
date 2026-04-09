# Kilotonne & Megatonne of TNT in Fuel Energy

## What & Why
Add kilotonne of TNT and megatonne of TNT to the Fuel Energy category. The
mechanism is to treat "tonne" as a pseudo-SI base (1 tonne = 1000 kg), which
means standard SI prefixes (kilo, mega, …) can be multiplied on top of it.
This avoids hard-coded duplicate entries and makes the concept reusable for
any other tonne-based unit in future (tonne of coal equivalent, tonne of oil
equivalent, etc.).

## Done looks like
- "Kilotonne of TNT" (kt TNT, 4.184 × 10¹² J) and "Megatonne of TNT"
  (Mt TNT, 4.184 × 10¹⁵ J) appear as selectable prefix variants of
  Tonne of TNT in the Fuel Energy converter and Compare All pane.
- The symbol is formed correctly: "kt (TNT)" and "Mt (TNT)".
- The unit name localisation displays "Kilotonne of TNT" / "Megatonne of TNT"
  in English (and analogous forms in other locales if unit name keys exist).
- Conversions between kt TNT, Mt TNT, and all other Fuel Energy units are
  accurate.

## Out of scope
- Adding prefixed variants for other tonne units (tce, toe, t_dynamite) — the
  same `allowPrefixes` flag can be added later once this pattern is proven.
- Adding new locales — only English (and any other locale already translated)
  is required here.

## Tasks
1. **Enable SI prefixes on Tonne of TNT** — Add `allowPrefixes: true` to the
   `t_tnt` entry in `fuel.json`. Verify the prefix application code produces
   "kt (TNT)" / "Mt (TNT)" as the symbol (simple concatenation: prefix symbol
   + unit symbol). Confirm the factor arithmetic is correct: kilo × 4 184 000 000 J
   = 4.184 × 10¹² J, mega × 4 184 000 000 J = 4.184 × 10¹⁵ J.

2. **Localization** — Add or confirm translation keys for "Kilotonne of TNT"
   and "Megatonne of TNT" in all existing locale unit files. If the system
   generates the name dynamically (prefix name + unit name), verify the result
   reads naturally in each locale; fix any awkward composites.

3. **Test** — Write or update unit-conversion test cases to assert that 1
   kilotonne of TNT = 1 000 tonnes of TNT = 4.184 × 10¹² J, and 1 megatonne
   of TNT = 10⁶ tonnes of TNT = 4.184 × 10¹⁵ J.

## Relevant files
- `client/src/data/conversion/fuel.json`
- `client/src/lib/units/prefixes.ts`
- `client/src/lib/units/applyPrefixToKgUnit.ts`
- `client/src/lib/calculator/displayToSI.ts`
- `client/src/lib/calculator/siToDisplay.ts`
