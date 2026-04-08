# Add Locale-Tied "Traditional" Number Format

## What & Why
Replace the standalone "Arabic" number format option with a new "Traditional" format whose behaviour is automatically determined by the currently selected locale. When the user picks "Traditional", they see numbers formatted in the pre-Latinized style native to their chosen language.

## Done looks like
- The "Arabic" (Eastern Arabic numerals) option is gone from the number format dropdown.
- A new "Traditional" option appears at the bottom of the number format dropdown.
- Selecting "Traditional" with locale `ar` renders exactly as the current `arabic` format does now (Eastern Arabic digits ٠–٩, comma thousands, dot decimal) — no behaviour change.
- Selecting "Traditional" with `en` or `en-us` renders 1,234,567.89 (same as English).
- Selecting "Traditional" with `de`, `es`, `it`, `pt` renders 1.234.567,89 (dot thousands, comma decimal).
- Selecting "Traditional" with `fr` renders 1 234 567,89 (narrow non-breaking space thousands, comma decimal).
- Selecting "Traditional" with `ru` renders 1 234 567,89 (non-breaking space thousands, comma decimal).
- Selecting "Traditional" with `ja` renders myriad-grouped numbers (4-digit blocks) with 万/億/兆 unit markers and Japanese digit characters 〇一二三四五六七八九, e.g. `1,234,567` → `一二三万四五六七`.
- Selecting "Traditional" with `ko` renders myriad-grouped numbers with 만/억/조 unit markers and Sino-Korean digit characters 공일이삼사오육칠팔구, e.g. `1,234,567` → `일이삼만사오육칠`.
- Selecting "Traditional" with `zh` renders myriad-grouped numbers with 万/亿/兆 unit markers and Chinese digit characters 〇一二三四五六七八九, e.g. `1,234,567` → `一二三万四五六七`.
- CJK traditional formatting applies to display-only output fields only. All data entry / typeable fields are unaffected regardless of format selection.
- The "Traditional" label is translated into all supported locales via the existing `num-format-*` translation key system.
- The `arabic-latin` format entry is unchanged and unaffected.
- Smart Paste is unaffected.

## Out of scope
- Any changes to typeable / data entry input fields.
- Smart Paste parsing or recognition of traditional formats.
- Full positional Chinese numeral rendering (壹贰叁… financial form, or 一百二十三 positional form).
- Round-trip parsing of CJK traditional strings back to floats.
- Changing any existing format behaviour other than removing `arabic` from the dropdown.

## Tasks
1. **Extend the `NumberFormat` type and config** — Add `'traditional'` to the `NumberFormat` union in `numberFormat.ts`. Remove `'arabic'` from the union and its `NUMBER_FORMATS` entry in `formatting.ts`. Add a `'traditional'` sentinel entry to `NUMBER_FORMATS`. Add a `traditionalScript?: 'ja' | 'ko' | 'zh'` flag to `NumberFormatConfig` to signal the CJK digit-substitution + myriad rendering path.

2. **Implement locale-to-traditional-config resolution** — Add a `getTraditionalConfig(locale: SupportedLanguage): NumberFormatConfig` function in `formatting.ts` that maps each locale to its correct config:
   - `en`, `en-us` → same as `uk` (comma thousands, dot decimal, Western digits)
   - `ar` → copy of the current `arabic` config exactly (Eastern Arabic digits ٠–٩, comma thousands, dot decimal)
   - `de`, `es`, `it`, `pt` → dot thousands (`.`), comma decimal (`,`)
   - `fr` → narrow non-breaking space thousands (`\u202F`), comma decimal
   - `ru` → non-breaking space thousands (`\u00A0`), comma decimal
   - `ja` → `{ traditionalScript: 'ja', myriad: true, thousands: '', decimal: '.' }`
   - `ko` → `{ traditionalScript: 'ko', myriad: true, thousands: '', decimal: '.' }`
   - `zh` → `{ traditionalScript: 'zh', myriad: true, thousands: '', decimal: '.' }`

3. **Implement CJK digit substitution** — Add digit-map conversion helpers in `formatting.ts`, parallel to the existing `toArabicNumerals`:
   - `toJapaneseNumerals(str)` — maps 0–9 → 〇一二三四五六七八九
   - `toKoreanNumerals(str)` — maps 0–9 → 공일이삼사오육칠팔구
   - `toCJKMyriadString(integer, script)` — applies myriad grouping (4-digit blocks from the right) inserting the appropriate unit marker (万/億/兆 for ja/zh, 만/억/조 for ko) between groups, then converts all Western digits in the result to the locale's digit characters. Leading all-zero groups are suppressed.

4. **Thread locale through display formatting** — Extend `formatNumberWithSeparators` (and `formatForClipboard` if it feeds display fields) to accept an optional `locale?: SupportedLanguage` parameter. When `formatKey === 'traditional'`, call `getTraditionalConfig(locale)` to resolve the actual config. For CJK scripts, delegate the integer part to `toCJKMyriadString`. All other format keys are unaffected. Do NOT change `parseNumberWithFormat` or `stripSeparators` — input fields are out of scope.

5. **Update call sites** — Thread the current `language` state through to `formatNumberWithSeparators` and `formatForClipboard` at every call site in `UnitConverterApp.tsx`, `ConverterPane.tsx`, `CalculatorPane.tsx`, and `DirectPane.tsx`. Input-parsing call sites (`parseNumberWithFormat`, `stripSeparators`) are not changed.

6. **Update the dropdown UI and translations** — In `UnitConverterApp.tsx`, remove `<SelectItem value="arabic">` and add `<SelectItem value="traditional">` at the bottom of the list. Add a `num-format-traditional` key to `ui-translations.json` for all locales (en: "Traditional", ar: "تقليدي", de: "Traditionell", es: "Tradicional", fr: "Traditionnel", it: "Tradizionale", pt: "Tradicional", ru: "Традиционный", ja: "伝統的", ko: "전통", zh: "传统").

7. **Update tests** — In `formatting.test.ts` and `characterization.test.ts`, remove `arabic` format test cases and add `traditional` format tests covering `ar`, `es`, `fr`, `ru`, `ja`, `ko`, and `zh` locale paths on display-formatting functions only.

## Relevant files
- `client/src/lib/units/numberFormat.ts`
- `client/src/lib/formatting.ts`
- `client/src/features/unit-converter/app/UnitConverterApp.tsx`
- `client/src/features/unit-converter/components/ConverterPane.tsx`
- `client/src/features/unit-converter/components/CalculatorPane.tsx`
- `client/src/features/unit-converter/components/DirectPane.tsx`
- `client/src/lib/localization.ts`
- `client/src/data/localization/ui-translations.json`
- `tests/formatting.test.ts`
- `tests/characterization.test.ts`
