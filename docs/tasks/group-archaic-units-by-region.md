# Group Archaic Units by Region

## What & Why
Units in the Archaic & Regional quality are currently sorted by numeric size (smallest to largest factor), which scatters related cultural units across the list. Japanese units end up mixed with European ones, Apothecaries' units get split, Troy units are separated from their kin, etc. This task reorders every archaic JSON file so all units from the same tradition appear consecutively, and ensures the sort engine respects that hand-crafted order.

## Done looks like
- In every Archaic & Regional category (mass, length, area, volume, energy, power), opening the unit dropdown shows units clumped by culture/tradition — all Japanese units together, all Chinese together, all Korean together, all Imperial/UK together, all Apothecaries' together, all Troy together, all South Asian together, etc.
- The order within each cultural block runs small → large (natural progression).
- SI base units still appear first.
- No units are missing or duplicated; conversion values are unchanged.

## Out of scope
- Adding new units
- Changing any conversion factor values
- Changing unit names or symbols
- Changing any other (non-archaic) quality/category

## Tasks

1. **Preserve ordering for all archaic categories** — Add all `archaic_*` category IDs (`archaic_mass`, `archaic_length`, `archaic_area`, `archaic_volume`, `archaic_energy`, `archaic_power`) to the `PRESERVE_ORDER_CATEGORIES` list in `client/src/lib/conversion-data.ts` so the JSON-file order is used as-is without factor-based re-sorting.

2. **Reorder `archaic_mass.json`** — Group units as: SI base (kg, g) → Japanese (fun, momme, ryō, kan) → Korean (don, geun) → Chinese PRC (mace, tael, jin, dan) → HK/Traditional (catty, picul) → South Asia (ratti, tola, seer, maund) → Thailand (baht) → European (carat, pfund, livre) → Imperial/UK (pennyweight, stone) → Apothecaries' (grain, scruple, dram avoirdupois, dram ap) → Troy (troy oz, troy lb).

3. **Reorder `archaic_length.json`** — Group units as: SI base (m) → Japanese (sun, shaku, ken, jō, ri) → Korean (ja, ri) → Chinese (cun, chi, zhang, li) → HK (chek) → Indian (hath, gaj) → Egyptian (digit, cubit royal) → Ancient body (palm, span, cubit common) → Greek (stade) → Roman (pace) → European (arshin, vara) → Imperial/US (ell, hand, link, fathom, rod, chain, furlong, league).

4. **Reorder `archaic_area.json`** — Group units as: SI base (m²) → Japanese (danchi-ma, edoma, jō/tatami, chūkyō-ma, kyōma, tsubo, tan, chō) → Korean (pyeong, se) → Chinese (mu, qing) → South Asia (bigha) → Egyptian (qirat, feddan) → Middle East (dunam, jerib) → European (morgen, desyatina) → US (section, township).

5. **Reorder `archaic_volume.json`** — Group units as: SI base (L, mL) → Japanese (go, sho, to, koku) → Korean (hop, doe, mal) → Chinese (sheng, dou, dan) → Greek (amphora) → Apothecaries'/Imperial (fl scruple, fluid ounce ap, gill imp, firkin) → US (minim, fl dram, tsp, tbsp, jigger, gill US, cup, peck, bushel, hogshead, cord) → SI large (m³).

6. **Verify `archaic_energy.json` and `archaic_power.json`** — These files have very few units (≤5 each). Apply preserve-order and confirm the existing sequence is sensible; adjust only if a clear grouping improvement exists.

## Relevant files
- `client/src/lib/conversion-data.ts:1050-1083`
- `client/src/data/conversion/archaic_mass.json`
- `client/src/data/conversion/archaic_length.json`
- `client/src/data/conversion/archaic_area.json`
- `client/src/data/conversion/archaic_volume.json`
- `client/src/data/conversion/archaic_energy.json`
- `client/src/data/conversion/archaic_power.json`
