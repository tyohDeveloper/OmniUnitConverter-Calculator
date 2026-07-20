# China naming, Bushel placement, authoritative sources

## What & Why
Three data-quality fixes: (1) rename "(China, PRC)" to "(China)" in unit names — the current form is undiplomatic; (2) remove Bushel from the Beer & Wine category, where it doesn't belong (it already exists as "Bushel (US)" in Volume); (3) replace Wikipedia source URLs for US customary and imperial unit definitions with authoritative references (NIST Handbook 44 Appendix C / NIST SP 811 for US customary; UK Weights and Measures Act or equivalent official sources for imperial units).

## Done looks like
- Mace, Tael, Jin, Dan display as "(China)" instead of "(China, PRC)" in all 12 languages
- Bushel no longer appears in the Beer & Wine category; conversions still work in Volume via "Bushel (US)"
- Sources shown for US customary and imperial units point to NIST/official documents rather than Wikipedia; the Sources section renders the new references correctly
- All tests pass, including the translation-key guard test

## Out of scope
- Changing source URLs for SI, archaic, or informal units where Wikipedia remains the pragmatic reference (e.g., beer bottle sizes, wine glass)
- Renaming any other regional unit labels

## Steps
1. **China rename** — Change "(China, PRC)" to "(China)" in the four archaic mass unit names, update the matching translation keys in all 12 locale files, and regenerate the reference docs under docs/measures.
2. **Remove Bushel from Beer & Wine** — Delete the Bushel entry from the Beer & Wine category JSON; verify no translation keys, tests, or docs reference it in that category (the Volume category's "Bushel (US)" stays).
3. **Authoritative sources for US/imperial units** — For units with measurementSystem US_CUSTOMARY, US_CUSTOMARY_DRY, or IMPERIAL across the conversion JSON files, replace Wikipedia sourceUrl values with authoritative ones: NIST Handbook 44 Appendix C or NIST SP 811 for US customary; official UK legislation or national standards for imperial. Keep Wikipedia only where no authoritative public document defines the unit (e.g., colloquial beer/keg sizes) and be consistent within each family.
4. **Verify** — Run the JSON integrity/translation guard tests, full test suite, and build-size check.

## Relevant files
- `client/src/data/conversion/archaic_mass.json`
- `client/src/data/conversion/beer_wine_volume.json`
- `client/src/data/conversion/volume.json`
- `client/src/data/localization/units/en.json`
- `client/src/data/localization/units/zh.json`
- `client/src/components/sources-section.tsx`
- `docs/measures/units.md`

## Notes
- Translation key hygiene: en.json keys must match current unit names exactly — a guard test enforces this, so the rename must touch every locale file in lockstep.
- Unit renames may affect saved user preferences or comparison selections keyed by name — check whether selections are stored by unit id (safe) or name.
