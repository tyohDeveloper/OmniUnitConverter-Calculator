# Show Photon in Custom Entry Matches

## What & Why
When a user enters the dimensions `m²·kg·s⁻²` in the Custom Entry pane, the matching physical quantities shown are "Energy" and "Torque". "Photon" (Photon Energy) shares the same dimensions but is currently excluded from this list. It should appear alongside the others. If the total list of matches ever grows long, truncate it to a maximum of 3 items and append a "…" indicator rather than altering the existing layout or button style.

## Done looks like
- Entering `m²·kg·s⁻²` in Custom Entry shows "Energy", "Torque", and "Photon Energy" (all three are clickable labels)
- If any dimension combination ever produces more than 3 matching quantities, only the first 3 are shown followed by a "…" text, and the layout/button appearance is unchanged

## Out of scope
- Adding or removing any other category from the exclusion lists
- Changing what happens when a quantity label is clicked
- Any changes to other UI panes

## Tasks
1. **Remove photon from the domain-alias exclusion list** — In `categoryDimensions.ts`, remove `'photon'` from `EXCLUDED_DOMAIN_ALIAS_CATEGORIES` so `getMatchingPhysicalQuantities` returns it as a match for the energy/torque dimensions.
2. **Cap the displayed list in DirectPane** — In `DirectPane.tsx`, limit the rendered quantity buttons to a maximum of 3. If there are more than 3 matches, show the first 3 buttons followed by a small "…" text node (no extra button or layout changes).

## Relevant files
- `client/src/lib/units/categoryDimensions.ts:83-104`
- `client/src/features/unit-converter/components/DirectPane.tsx:265-278`
