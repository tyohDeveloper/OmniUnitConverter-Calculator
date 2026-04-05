# Disambiguate Unit Symbols

## What & Why
Several unit symbols are shared by more than one unit, causing ambiguity. This task applies a complete set of agreed symbol changes to `conversion-data.ts` so every symbol is unambiguous within its context. The general convention is `(US)` for US/common measures and `(imp)` for Imperial measures.

## Done looks like
- No two units in the same category share the same symbol
- No two units of genuinely different physical quantities share the same symbol
- All changed symbols display correctly wherever units are shown in the UI

## Out of scope
- Changes to unit conversion factors
- Adding new units (except the missing Traditional Pica)
- Changes to unit IDs or names (only symbols change, except where noted)

## Tasks

1. **g-force and parsec symbols** — Change g-force symbol from `g` to `g-force`. Change parsec symbol from `pc` to `parsec` in all three categories where it appears (length, rack_geometry, shipping).

2. **Cup symbols** — Change all cup symbols to use `cp` as the base with a regional qualifier. Apply across all categories where each appears:
   - Cup (US/common): `cp` → `cp (US)` (volume, beer_wine_volume)
   - Cup (Japan): `cup (JP)` → `cp (JP)` (cooking)
   - Cup (Imperial/UK): `cup (UK)` → `cp (imp)` (cooking)
   - Cup (Metric): `cup (M)` → `cp (M)` (cooking)
   - Candlepower keeps `cp` unchanged (no qualifier — it owns the bare symbol)

3. **US vs Imperial volume symbols** — Apply `(US)` / `(imp)` convention across all categories where they appear (volume, beer_wine_volume, cooking, archaic_volume):
   - Teaspoon: `tsp` → `tsp (US)` / `tsp (imp)`
   - Tablespoon: `tbsp` → `tbsp (US)` / `tbsp (imp)`
   - Pint: `pt` → `pt (US)` / `pt (imp)`
   - Quart: `qt` → `qt (US)` / `qt (imp)`
   - Gallon: `gal` → `gal (US)` / `gal (imp)`
   - Fluid Ounce US: `fl oz` → `fl oz (US)` / Fluid Ounce Imp/UK: `fl oz` / `fl oz (UK)` → `fl oz (imp)`
   - Short Ton (US): `ton` → `ton (US)` / Long Ton (UK): `ton` → `ton (imp)`

4. **Typography symbols** — Change Point (Desktop) from `pt` to `pt (CSS)`. Keep Point (Traditional) as `pt (trad)`. Change Pica from `pc` to `pc (CSS)`. Add a new Traditional Pica entry with symbol `pc (trad)` and factor `0.0042175` m (12 × traditional point = 12 × 0.000351459 m).

5. **Electrical symbols** — Change Faraday from `F` to `F (charge)` in the charge category. Farad keeps `F` in the capacitance category unchanged.

6. **Physics and flow symbols** — Change Talbot (luminous flux) from `T` to `T (lum)`. Tesla keeps `T`. Change Sverdrup (flow) from `Sv` to `Sv (flow)`. Sievert keeps `Sv`.

7. **Rack unit, bottle, and barrel symbols** — Change Rack Unit Height in rack_geometry from `U` to `RU`. Enzyme Unit in catalytic keeps `U`. Change the four bottle symbols in beer_wine_volume: Bottle (Beer, small) → `btl (small)`, Bottle (Beer, longneck) → `btl (beer, US)`, Bottle (Beer, large) → `btl (large)`, Bottle (Wine) → `btl (wine)`. Change the two barrel symbols in beer_wine_volume: Barrel (Beer) → `bbl (beer)`, Barrel (Oil) → `bbl (oil)`.

8. **Japanese unit symbols** — Change the length Jō (丈, 10 shaku) in archaic_length from `jo` to `jo (len)`. Tatami area Jō/Tatami keeps `jo`.

## Relevant files
- `client/src/lib/conversion-data.ts`
