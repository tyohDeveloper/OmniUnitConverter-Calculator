---
title: Sources reference page (※)
---
# Sources Reference Page (※)

## What & Why
Add a static "Sources" reference page, opened from a header button using the ※ symbol (U+203B, REFERENCE MARK), alongside the existing ⓘ help button. It presents the full conversion table as static text plus an authoritative source link for each unit, giving users a citable reference for every conversion factor.

## Done looks like
- A ※ button in the header (next to the existing ⓘ help button) toggles a Sources overlay panel, styled like the Help page overlay.
- The panel lists all unit categories; each category shows a three-column table:
  - Column 1: unit name, right-justified.
  - Column 2: SI equivalent (e.g., "1 ft = 0.3048 m", using the category's base SI unit and the unit's factor/offset; non-linear units like dB or °F show their defining relation), left-justified.
  - Column 3: a hyperlink to the most authoritative page defining the unit (SI Brochure/BIPM, NIST, ISO, national standards bodies where applicable; Wikipedia as fallback). Links open in a new tab.
- Only one overlay (Help or Sources) is open at a time.
- Unit names in the table respect the current language (reuse existing unit-name translation); the page heading/labels get UI localization strings in all 12 languages.
- Build still passes the verify-build gzip size ceiling.

## Out of scope
- No dynamic conversion or input on this page — static reference only.
- No per-unit prefix expansion (list base units only, not every prefixed variant).
- No printable/PDF export.

## Steps
1. **Source data model** — Add an optional `sourceUrl` field to the unit definition type and schema validation. Populate source URLs across the per-category JSON files, preferring BIPM/NIST/ISO/standards-body pages and falling back to Wikipedia. Keep URLs lean to protect the build size budget.
2. **SI-equivalent formatting** — Add a small pure helper that renders each unit's static SI equivalent from its factor/offset (with sensible precision and scientific notation where needed), and a defining-relation string for function-based units (temperature, logarithmic, etc.).
3. **Sources page UI** — Build the Sources overlay component (three-column table per category, right/left justification as specified, external links), add the ※ header button and open/close state mirroring the Help overlay, ensuring mutual exclusivity with Help.
4. **Localization & verification** — Add UI strings for the page title/labels to all 12 language files, reuse existing unit-name translation for column 1, then run typecheck, tests, lint-size, and verify-build to confirm the gzip ceiling still holds.

## Relevant files
- `client/src/components/help-section.tsx`
- `client/src/pages/home.tsx`
- `client/src/features/unit-converter/app/UnitConverterApp.tsx`
- `client/src/lib/units/unitDefinition.ts`
- `client/src/data/conversion/`
- `client/src/data/localization/ui/en.json`
- `client/src/lib/translateUnit.ts`