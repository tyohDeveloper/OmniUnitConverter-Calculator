---
name: Era table epoch vs start
description: Why era-table entries separate the lookup boundary from the year-counting origin
---

**Rule:** In `client/src/data/eras/*.json` era tables, `start` is the lookup boundary (first year the era is the orthodox/display era) while optional `epoch` is the year-counting origin. `eraYear = astro − (epoch ?? start) + 1`.

**Why:** Single-line orthodox tables can't overlap, but real eras were often proclaimed years before becoming the orthodox line (Sui Kāihuáng proclaimed 581 but south used Chen eras until 589 → entry `start: 589, epoch: 581` so 589 = Kāihuáng 9; Yuan Zhìyuán `start: 1279, epoch: 1264` → 1279 = Zhìyuán 16). Same trick for mid-year Japanese changes (Tenpyō-shōhō `start: 750, epoch: 749`).

**Also:** Eras proclaimed in the 12th lunar month (Ten'en 973, Shōhō 1644, Liu Song Tàishǐ 465) keep the renamed lunar year as `start`, even though en-Wikipedia tables list the Gregorian proclamation year (+1); the `start + n − 1` year-numbering (Shōhō 2 = 1645) is what concordances use. When auditing against en-Wikipedia, expect romanization variants (Tàixīng/Dàxīng, Tàihé/Dàhé) and occasional wiki misprints (Zhānghé's range) — don't "fix" the JSON to match them.

**How to apply:** When adding/fixing era entries, keep starts strictly increasing (tests enforce this plus unique names); if the historical proclamation year differs from the year the era becomes canonical in the table, set `epoch` to the proclamation year. Chinese table has `end: 1912`; lookups past `end` return null.
