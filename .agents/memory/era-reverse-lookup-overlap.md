---
name: Era reverse-lookup transition-year overlap
description: Japanese nengō vs Chinese niánhào differ in whether an era's final year overlaps the next era's start year.
---
Rule: reverse era lookup (name + year count → CE) must allow a one-year overlap for Japanese nengō only — an era's final year equals the next era's start year (Meiji 45 = 1912 = Taishō 1) because nengō change mid-year. Chinese niánhào conventionally change at New Year, so the last valid year is nextStart − 1 (Kāngxī 61 = 1722; no Kāngxī 62).

**Why:** A strict forward round-trip check rejects valid final Japanese era years; a blanket overlap invents nonexistent Chinese years.

**How to apply:** Any inverse lookup or validation over the era tables must special-case the Japanese table (mirrors the existing `table.id === 'japanese'` ±1 convention). Also remember `epoch` overrides `start` as the counting origin, so early "counted" years of epoch entries fall in the previous dynasty and are correctly rejected.
