# Unit Reference Documents

This directory contains auto-generated reference documents for all conversion units in the app.

## Files

| File | Description |
|------|-------------|
| `units.md` | Every unit in a single table: symbol, English name, category, base SI symbol. |
| `compare-all.md` | One section per measurement category showing how each unit converts to its base SI unit. |
| `units-by-system.md` | Units grouped by measurement system (SI, US Customary, Imperial, Japanese, etc.). |

## How they are generated

Run this command from the project root:

```bash
node scripts/generate-unit-docs.mjs
```

The script reads every JSON file in `client/src/data/conversion/` and the English localization file `client/src/data/localization/units/en.json`, then writes the three markdown files into this directory.

The documents are also regenerated automatically on every merge via `scripts/post-merge.sh`.

## Footnotes

A dagger (†) after a unit name marks units with non-linear conversions (temperature offsets, trigonometric functions, etc.). For those units, the factor shown is not the complete conversion formula.
