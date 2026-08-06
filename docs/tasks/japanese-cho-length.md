# Add Chō length unit & tighten Japanese factors

## What & Why
The traditional Japanese length ladder is sun → shaku (尺, 10/33 m exact) → ken (間, 6 shaku) → jō (丈, 10 shaku) → chō (町, 60 ken ≈ 109.09 m) → ri (里, 36 chō ≈ 3.927 km). The Archaic Length category already has sun, shaku, ken, jō, and ri, but **Chō (町) as a length unit is missing** — it only exists as an area unit in Archaic Area. Additionally, the current Japanese length factors are rounded decimals (0.30303, 1.818, 3.03, 3927.27) rather than the exact legal fractions, so ladder relationships (e.g. exactly 6 shaku = 1 ken) don't round-trip cleanly. The jō/chō homophone pairs (length 丈/町 vs area 畳/町) should be clearly disambiguated in unit names so users don't confuse the tatami-jō (area) with the length jō.

## Done looks like
- Archaic Length contains "Chō (Japan)" at 60 ken ≈ 109.09 m (exactly 1200/11 m), with a symbol distinct from the area chō (which uses `cho`).
- Japanese length factors use exact legal values: sun = 1/33 m, shaku = 10/33 m, ken = 20/11 m, jō = 100/33 m, chō = 1200/11 m, ri = 43200/11 m (stored with enough precision that 6 shaku converts to exactly 1 ken etc. within display precision).
- The length jō and length chō are visually distinguishable from their area homophones — e.g. names carry the kanji ("Jō 丈 (Japan)" vs area "Jō/Tatami 畳") or an equivalent clarifier, applied consistently across both categories.
- New/renamed unit names have entries in all 12 unit localization files, and the json-integrity translation-key guard passes.
- Docs generated from unit data (docs/measures/*) reflect the new unit.

## Out of scope
- Korean/Chinese unit changes (Ri Korea, Chi, Cun stay as-is).
- Tatami variant area units (edoma, kyōma, chūkyō-ma) — unchanged.
- The Typography category work (Task #67).

## Steps
1. **Add Chō length unit** — Add a Chō (町) entry to the Archaic Length category at exactly 1200/11 m with a Japanese e-Gov law source URL like its siblings, and a symbol that doesn't collide with the area chō.
2. **Exact-fraction factors** — Update sun/shaku/ken/jō/ri factors in Archaic Length to full-precision values of their exact fractional definitions so ladder ratios are exact.
3. **Homophone disambiguation** — Adjust display names (and symbols if needed) so length jō/chō and area jō/chō are clearly distinguished, keeping the translation-key guard in mind: rename matching keys in every unit localization file in lockstep.
4. **Localization & docs** — Add/rename entries for affected unit names in all unit localization files (en, en-us, fr, de, es, it, pt, ru, zh, ko, ja, ar) and regenerate/update the unit reference docs.

## Relevant files
- `client/src/data/conversion/archaic_length.json`
- `client/src/data/conversion/archaic_area.json`
- `client/src/data/localization/units/en.json`
- `docs/measures/units.md`
