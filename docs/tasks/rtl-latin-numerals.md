# RTL direction decoupled from numeral format

## What & Why
The document reading direction (`dir="rtl"`) is currently set based on whether the *numeral format* is `arabic` (Arabic-Indic digits). This means choosing the `arabic-latin` format (Latin digits, Arabic-language UI) silently reverts the layout to LTR, breaking Arabic text rendering. Conversely, selecting the arabic numeral format in a non-Arabic language enables RTL for no good reason.

Reading direction should follow the **language** choice, not the numeral format. And when Latin numerals are active in an RTL context, numeric elements should be explicitly guarded against browser/font substitution of digits.

## Done looks like
- Selecting Arabic language → RTL layout regardless of which numeral format is chosen.
- Selecting any non-Arabic language → LTR layout regardless of numeral format.
- Numbers displayed in Latin format (0-9) stay as Latin digits even when the document is in RTL mode (no browser/OS digit substitution).
- The `not-found.tsx` page already uses `lang === 'ar'` for RTL — main app matches this logic.

## Out of scope
- Adding new languages or numeral formats.
- Changing which numeral systems are available.

## Tasks
1. **Decouple `isRtl` from numeral format** — In `UnitConverterApp.tsx`, change the RTL effect so `isRtl` is derived from `language === 'ar'` (or a general RTL-language list) rather than `numberFormat === 'arabic'`. Ensure the cleanup on unmount still resets `dir` to `ltr`.

2. **Guard Latin numerals against RTL digit substitution** — Where numeric values are rendered in the UI (converter output, calculator stack, compare-all table, etc.), add `dir="ltr"` inline or a CSS class that forces LTR on the numeric spans when `useArabicNumerals` is false. This prevents browsers from substituting Arabic-Indic glyphs for ASCII digits in RTL context.

## Relevant files
- `client/src/features/unit-converter/app/UnitConverterApp.tsx:188-197`
- `client/src/pages/not-found.tsx`
- `client/src/lib/formatting.ts`
- `client/src/features/unit-converter/components/ConverterPane.tsx`
- `client/src/features/unit-converter/components/CalculatorPane.tsx`
