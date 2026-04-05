# Fix Localization Issues

## What & Why
The app supports multiple languages including Arabic but has two categories of localization problems: hardcoded English strings that bypass the translation system, and a missing RTL (right-to-left) layout for Arabic users. Together these make the app feel broken or incomplete for non-English speakers.

## Done looks like
- Selecting Arabic flips the entire app layout to right-to-left (text alignment, sidebar position, flex direction) so the UI reads naturally in Arabic
- Number format dropdown labels ("English", "Swiss", "South Asian", etc.) are translated per language
- Placeholder texts ("Enter value or 'value unit'", "Select SI representation") are translated
- The "Build dimensional units from SI base units" description is translated
- RPN calculator key labels (ENTER, DROP, SWAP, LASTx, PULL, SHIFT, ABS, rnd, trunc, +/−) remain in HP-standard English notation — this is the global industry convention and translating them would confuse users familiar with HP calculators. Instead, each key gains a translated tooltip so non-English speakers understand the function without breaking HP conventions.
- The 404 page respects the selected language

## Out of scope
- Adding new languages beyond the currently supported set (note: Hebrew is not currently supported; if added, it would need the same RTL treatment as Arabic)
- Pluralization — unit names are displayed as labels next to numbers, not inside grammatical sentences, so no inflection logic is needed
- Currency — the app is a physical unit converter and does not handle currency at all
- Date formatting — not used in the converter UI
- Translating RPN calculator key labels themselves (intentionally kept as HP-standard English)

## Tasks
1. **Add RTL layout support** — Dynamically set `dir="rtl"` on the document root (or top-level wrapper) when the active language is `ar`, and apply RTL-aware layout adjustments (text alignment, flex-direction, padding/margin mirroring) throughout the main converter layout.

2. **Translate hardcoded UI strings** — Add translation keys to `UI_TRANSLATIONS` in `localization.ts` for all identified hardcoded strings (placeholder texts, the custom entry description, number format dropdown option labels). Replace hardcoded values in `unit-converter.tsx` with `t()` calls.

3. **Add translated tooltips to RPN calculator keys** — Keep key labels (ENTER, DROP, SWAP, LASTx, PULL, SHIFT, ABS, rnd, trunc, +/−) in HP-standard English. Add translated tooltip/title text for each key to `UI_TRANSLATIONS` so non-English speakers can understand key functions via hover/touch.

4. **Localize the 404 page** — Connect the 404 page to the localization context and translate its content.

## Relevant files
- `client/src/lib/localization.ts`
- `client/src/components/unit-converter.tsx`
- `client/src/pages/not-found.tsx`
- `client/src/components/unit-converter/context/ConverterContext.tsx`
