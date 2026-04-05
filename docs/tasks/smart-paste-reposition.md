# Reposition Smart Paste Button

## What & Why
The Smart Paste button currently sits inline inside the "From" section of the converter card. Moving it (and adding a matching one for Custom Entry) to sit between the locale/language selector row and the active pane gives both tabs a consistent, prominent placement. The Custom Entry pane's in-card Paste button is then redundant and can be removed, and the Clear button should move up to fill that gap.

## Done looks like
- The Smart Paste button is no longer inside the ConverterPane card (removed from Row 2 of the From section).
- A right-aligned Smart Paste button appears between the locale selector row and the active pane for **both** the Converter and Custom Entry tabs, shown only when that tab is active.
- Both buttons retain the same appearance and feedback states (unrecognised / unavailable). The Converter button uses `handleConverterSmartPaste`; the Custom Entry button uses the same clipboard-read logic that the old in-card Paste button used.
- The in-card Paste button in `DirectPane` is removed.
- The Clear button in `DirectPane` moves up to the top area where the Paste button was (right-aligned alongside the Dimensions label row).
- The `onSmartPaste` prop is removed from `ConverterPane` (and its interface) since it is no longer used there.

## Out of scope
- Any other Smart Paste Phase 2 backlog items.
- Restyling either button beyond matching the existing appearance.

## Tasks
1. **Remove Smart Paste from ConverterPane** — Delete the button and its local `pasteStatus` state/timer from `ConverterPane.tsx`. Remove `onSmartPaste` from `ConverterPaneProps` and the component signature.
2. **Add Smart Paste row in UnitConverterApp (Converter tab)** — Between the category title/subtitle block and the pane grid, add a right-aligned row with the Smart Paste button, visible only when `activeTab === 'converter'`. Lift the `pasteStatus` state and timer logic into `UnitConverterApp`, wire to `handleConverterSmartPaste`. Remove the now-unused `onSmartPaste` prop from the `<ConverterPane />` JSX call.
3. **Add Smart Paste row in UnitConverterApp (Custom Entry tab)** — In the same structural position (between title/subtitle and the pane grid), add a matching right-aligned Smart Paste button visible only when `activeTab === 'custom'`. This button performs the same clipboard-read and `setDirectValue`/`setDirectExponents` logic that the old in-card Paste button in `DirectPane` did. Pass any needed setters down or lift the handler into `UnitConverterApp`.
4. **Clean up DirectPane** — Remove the in-card Paste button (and its `handlePasteButton` function if it is no longer needed). Move the Clear button up to sit right-aligned next to the Dimensions label, where the Paste button previously appeared.

## Relevant files
- `client/src/features/unit-converter/components/ConverterPane.tsx`
- `client/src/features/unit-converter/components/DirectPane.tsx`
- `client/src/features/unit-converter/app/UnitConverterApp.tsx`
