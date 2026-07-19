---
title: Understand Japanese 千 (sen) and Chinese 兆 (zhao) when typed as big numbers
---
# Understand Japanese 千 (sen) and Chinese 兆 (zhao) when typed as big numbers

  ## What & Why
  The Unitless Numbers category now covers wan/万, yi/亿, oku/億, man, lakh, crore, arab, and kharab. The remaining commonly used East Asian steps are 兆 (zhao/chou, 10^12 in modern Chinese/Japanese usage) and possibly 京 (kei, 10^16). Adding these would complete the East Asian counting ladder. Note: "zhao" ambiguity — in Taiwan/Japan 兆 = 10^12, but in mainland telecom usage 兆 can mean mega; pick 10^12 and document.

  ## Done looks like
  - New units zhao/兆 (1e12) and optionally kei/京 (1e16) in the unitless category
  - Romanized aliases (zhao, chou, kei) registered in UNITLESS_WORD_ALIASES
  - Unit-name translations added to all 12 localization files
  - Tests in tests/unitless.test.ts and tests/smart-paste.test.ts
  - New native-script symbols added to the exemption set in tests/localization.test.ts

  ## Relevant files
  - `client/src/data/conversion/unitless.json`
  - `client/src/lib/conversion-data.ts` (UNITLESS_WORD_ALIASES)
  - `client/src/data/localization/units/*.json`
  - `tests/unitless.test.ts`, `tests/smart-paste.test.ts`, `tests/localization.test.ts`