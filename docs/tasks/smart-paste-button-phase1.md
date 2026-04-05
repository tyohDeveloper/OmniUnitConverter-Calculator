# Smart Paste Button — Phase 1

## What & Why
Add a "Smart Paste" button to the converter pane that reads from the clipboard and navigates to the matching quantity and unit, regardless of what currently has focus. Also fix the unit symbol priority logic so that "eV" correctly routes to Photon Energy (not plain Energy), and "li" routes to Archaic Length (not Shipping).

The global paste listener already exists and fires when no input is focused. The Direct pane already has a working `handlePasteButton` (using `navigator.clipboard.readText()` + `parseUnitText`) and a `handleBlurParse` pattern for parsing unit text on blur. Both can be directly reused — the only difference in the converter is that `parsed.categoryId` and `parsed.unitId` are used for navigation rather than mapping to SI dimension exponents.

## Done looks like
- A "Smart Paste" button appears in the converter UI (near the input area, styled consistently with the existing Direct pane paste button)
- Clicking it reads from the clipboard. If the text contains a recognizable value + unit (e.g. "12J", "23eV", "7li", "2.4 MHz"), the app switches to the correct quantity, sets the from-unit and prefix, and populates the entry field with the numeric value
- "23eV" routes to Photon Energy, not plain Energy
- "7li" routes to Archaic Length, not Shipping
- The existing global paste listener (fires when no input is focused) continues to work, using the same corrected priority logic
- If the pasted text cannot be parsed (no recognizable unit), the button shows a brief "not recognised" indicator rather than silently doing nothing
- Pasting while the entry field is focused (Ctrl/Cmd+V) still types normally — the button is the explicit smart-paste path

## Out of scope
- Compound units like "45N*m" (Phase 2)
- Special formats like "6'7"" feet-inches (Phase 2)
- Archaic/obscure format parsing beyond what `parseUnitText` already handles
- Paste interception while an input field has focus (intentionally deferred — the button handles this more cleanly)

## Tasks
1. **Fix symbol priority in `buildUnitSymbolMap`** — Update the function so symbols that are the *base/default unit* of a category win over the same symbol appearing as a secondary unit elsewhere. This fixes "eV" → Photon Energy and confirms "li" → Archaic Length. Update tests to cover these cases.

2. **Add Smart Paste button to the converter UI** — Model it closely on `handlePasteButton` in `DirectPane.tsx` (lines 69-100), which already uses `navigator.clipboard.readText()` + `parseUnitText` with graceful error handling. In the converter, apply `parsed.categoryId`, `parsed.unitId`, and `parsed.prefixId` to navigate, mirroring what the global paste listener already does (lines 222-228 in `UnitConverterApp.tsx`). Show a brief non-disruptive indicator when nothing recognisable is found.

3. **Wire up feedback and edge cases** — Clipboard API unavailable (non-HTTPS / permissions denied) should degrade gracefully, same as the existing Direct pane button. Ensure the button works correctly regardless of which element has focus.

## Relevant files
- `client/src/features/unit-converter/components/DirectPane.tsx:69-133`
- `client/src/features/unit-converter/app/UnitConverterApp.tsx:214-252`
- `client/src/features/unit-converter/components/ConverterPane.tsx`
- `client/src/lib/conversion-data.ts:416-445`
- `client/src/data/conversion/photon.json`
- `client/src/data/conversion/energy.json`
- `client/src/data/conversion/archaic_length.json`
- `client/src/data/conversion/shipping.json`
- `tests/smart-paste.test.ts`
