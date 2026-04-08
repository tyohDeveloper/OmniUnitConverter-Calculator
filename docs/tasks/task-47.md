---
title: Decouple Arabic number format from Arabic locale
---
# Decouple Arabic Number Format from Arabic Locale

## What & Why
Currently the Arabic number format and the Arabic locale are tightly coupled: selecting the Arabic number format forces the language to Arabic and disables the language picker, and the RTL layout direction is driven by the locale (`language === 'ar'`) rather than the number format. This makes it impossible to write an Arabic-localized scientific paper that uses Western numerals in a LTR layout.

The goal is to make the two settings fully independent, with a sensible default and RTL tied exclusively to the number format.

## Done looks like
- Selecting "Arabic" locale defaults the number format to "Arabic" (Eastern Arabic numerals), but the user can freely change the number format to any other option (Standard, etc.) without being locked out.
- Selecting any non-Arabic number format while Arabic locale is active keeps the translated Arabic UI text but switches the layout to LTR and uses Western numerals.
- RTL page direction (`dir="rtl"`) is applied if and only if the number format is set to "Arabic". It is NOT applied when Arabic locale is chosen with a non-Arabic number format.
- The language/locale picker is never disabled regardless of which number format is active.
- The number format picker is never disabled regardless of which locale is active.
- Selecting the Arabic number format does NOT force the locale to Arabic; it only controls numeral style and layout direction.

## Out of scope
- Changes to the numeral conversion logic itself (already correct in formatting.ts).
- Adding new number formats or locales.
- Any RTL-specific layout fixes beyond the direction coupling change.

## Tasks
1. **Reverse the coupling direction** — Remove the `useEffect` that sets `language = 'ar'` when `numberFormat === 'arabic'`. Replace it with a `useEffect` that sets `numberFormat` to `'arabic'` as a default when `language` changes to `'ar'` (but does not force it back if the user changes it afterwards).

2. **Move RTL control to number format** — Change the `useEffect` that sets `document.documentElement.dir` so that RTL is applied when `numberFormat === 'arabic'`, not when `language === 'ar'`.

3. **Re-enable the language picker** — Remove the `disabled` prop (and any related condition) from the language selector that was gating it on `numberFormat === 'arabic'`.

4. **Verify no other coupling points** — Audit `UnitConverterApp.tsx` and any child components for any remaining places that conditionally disable or override one setting based on the other, and remove them.

## Relevant files
- `client/src/features/unit-converter/app/UnitConverterApp.tsx`
- `client/src/lib/formatting.ts`
- `client/src/lib/units/numberFormat.ts`