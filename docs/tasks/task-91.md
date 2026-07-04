---
title: Recognize more regional big-number words like 'yi' (亿), 'oku' (億), and 'arab'
---
# Recognize more regional big-number words like 'yi' (亿), 'oku' (億), and 'arab'

  ## What & Why
  The Unitless Numbers category now resolves typed words "wan", "lakh", "crore" (and native scripts 万 / लाख / करोड़). But the East/South Asian numbering systems have more commonly used steps that are missing entirely: Chinese 亿 (yi, 10^8), Japanese 億 (oku, 10^8) and 万 (man — same value as wan but romanized differently), and South Asian arab (10^9) / kharab (10^11). Adding these units plus their romanized word aliases would round out the regional counting support.

  ## Done looks like
  - New units in the unitless category: yi/亿 (1e8), oku/億 (1e8 — or shared with yi if preferred), arab (1e9), kharab (1e11)
  - Typing "3 yi", "2 oku", "1 arab", "5 man" resolves to the unitless category with correct factors
  - Word aliases registered alongside the existing UNITLESS_WORD_ALIASES map
  - Tests added in tests/smart-paste.test.ts and tests/unitless.test.ts

  ## Relevant files
  - `client/src/data/conversion/unitless.json`
  - `client/src/lib/conversion-data.ts` (UNITLESS_WORD_ALIASES, lookupUnitlessWordAlias)
  - `tests/smart-paste.test.ts`