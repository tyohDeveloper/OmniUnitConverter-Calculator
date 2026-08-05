# Beer & Wine Unit Cleanup

## What & Why
Remove units from the Beer & Wine volume category that don't belong in a brewing/serving context.

## Done looks like
- The following units no longer appear in the Beer & Wine list: Teaspoon (US), Teaspoon (Imp), Tablespoon (US), Tablespoon (Imp), Barrel (Oil), Acre-foot, Cubic Mile
- All other units remain unchanged

## Out of scope
- Changes to any other quantity category
- Localization file cleanup for removed units

## Tasks
1. Edit `beer_wine_volume.json` to remove the seven specified units: tsp (US), tsp (Imp), tbsp (US), tbsp (Imp), bbl (oil), ac⋅ft, and mi³.

## Relevant files
- `client/src/data/conversion/beer_wine_volume.json`
