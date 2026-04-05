# Fix Calculator Result Unit Dropdown

## What & Why
The "choose unit" dropdown on the calculator result only ever shows the raw base SI unit and no alternatives. This is because `generateSIRepresentations` filters out all derived-unit compositions whose term count exceeds the base unit expression's term count — which for most simple dimension results (m², m/s, etc.) means every derived option is removed, leaving only the one base entry.

The same issue likely affects both the simple calculator (4-register) and the RPN calculator result dropdowns.

## Done looks like
- When a calculator result has a known named SI equivalent (e.g. J for energy, W for power, N for force, Pa for pressure), those alternatives appear in the dropdown and can be selected to reformat the displayed value.
- For results whose dimensions don't map to any named derived SI unit, the dropdown still shows the base representation and remains functional (no crash or empty list).
- Selecting an alternative correctly changes the number shown in the result display to reflect the chosen representation.
- Both the simple calculator and RPN calculator result dropdowns behave correctly.

## Out of scope
- Adding non-SI unit conversion to the calculator result (e.g. picking feet or miles from the dropdown — that belongs to the unit converter tab).
- Changes to the prefix (SI multiplier) dropdown next to the unit selector.

## Tasks
1. **Diagnose the filtering logic** — Trace `generateSIRepresentations` in `calculator.ts` to understand exactly why valid derived-unit alternatives (J, W, N, Pa, etc.) are being filtered out. The likely culprit is the term-count filter at lines ~546–551 combined with `isValidSIComposition` always returning `true`, which causes mismatched subtractions that inflate the term count of every composition.

2. **Fix the composition / filtering logic** — Replace or supplement the always-`true` `isValidSIComposition` stub with a real check (e.g. using the existing `canFactorOut` helper) so that only derived units whose dimensions are a genuine subset of the target dimensions are tried. Adjust the term-count filter or the ordering so that representations where the derived unit reduces complexity are kept, while nonsensical compositions are rejected early.

3. **Verify dropdown selections update the display** — Confirm that picking an alternative in the unit dropdown actually changes the value shown in the result field for both the simple calculator and RPN result areas, and that `selectedAlternative` / `rpnSelectedAlternative` state is wired correctly.

## Relevant files
- `client/src/lib/calculator.ts:398-634`
- `client/src/components/unit-converter.tsx:906-908,3280-3391,3701-3783`
