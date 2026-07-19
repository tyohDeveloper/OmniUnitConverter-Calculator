# Radiation Exposure category (Roentgen)

## What & Why
The app has orphaned "Roentgen" translations in all 12 language files, but no Roentgen unit exists anywhere in the conversion data. Roentgen measures radiation exposure (ionization in air), a dimensionally distinct quantity from the existing radioactivity/dose categories. Add a new Radiation Exposure category with Coulomb per kilogram (SI) and Roentgen, completing the classic radiation quartet (Ci / Rad / Rem / R).

## Done looks like
- A new "Radiation Exposure" category appears in the Radiation & Physics group, containing Coulomb per Kilogram (C/kg, SI, prefixable) and Roentgen (R, 1 R = 2.58×10⁻⁴ C/kg exactly).
- Conversions work in both directions and in the calculator with correct dimensional analysis (dimensions: current·time/mass, i.e. A⋅s⋅kg⁻¹).
- The category name and "Coulomb per Kilogram" are translated in all 12 languages; the existing "Roentgen" translations are now actually used.
- Unit tests cover the new category's conversions; lint-size, typecheck, and verify-build all pass.

## Out of scope
- Legacy exposure sub-units (mR/h dose-rate, etc.) or any exposure-rate category.
- Changes to the existing radioactivity, radiation dose, equivalent dose, or decay categories.

## Steps
1. **Category data** — Create the radiation_exposure conversion JSON with C/kg (base, SI, prefixes allowed) and Roentgen (factor 2.58e-4), following the structure of the existing equivalent_dose category.
2. **Registration & dimensions** — Register the new category in the conversion data loader, category type unions, category dimension maps (converter and calculator controllers), the Radiation & Physics group lists, and SI representation/derived-unit catalogs as appropriate.
3. **Localization** — Add category-name and "Coulomb per Kilogram" translations to all 12 UI/unit language files; verify existing Roentgen unit-name translations resolve.
4. **Tests & verification** — Add unit tests for the new conversions and confirm lint-size, typecheck, and verify-build (gzip size ceiling) still pass.

## Relevant files
- `client/src/data/conversion/equivalent_dose.json`
- `client/src/lib/conversion-data.ts`
- `client/src/lib/units/unitCategory.ts`
- `client/src/lib/units/categoryDimensions.ts`
- `client/src/lib/units/siDerivedUnitsCatalog.ts`
- `client/src/lib/calculator/generateSIRepresentations.ts`
- `client/src/components/unit-converter/hooks/useConverterController.ts:112-132`
- `client/src/components/unit-converter/hooks/useCalculatorController.ts:310`
- `client/src/features/unit-converter/app/UnitConverterApp.tsx:31`
- `client/src/data/localization/units/en.json`
- `client/src/data/localization/ui/en.json`
