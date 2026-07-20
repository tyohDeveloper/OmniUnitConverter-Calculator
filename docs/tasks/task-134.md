---
title: Show the exact Hijri month and day, not just the year
---
# Show the exact Hijri month and day, not just the year

  ## What & Why
  The Dates/Eras tab now maps Islamic (Hijri) years exactly using a tabular calendar, but it still only converts whole years. Users converting a real religious or historical date often want the full date (e.g. 1 Muharram 1447 AH), which the tabular algorithm can already produce internally.

  ## Done looks like
  - Users can enter and see a full Gregorian date and its exact tabular Hijri equivalent (day, month name, year), and vice versa
  - Month names are localized alongside the existing 12-language support

  ## Relevant files
  - `client/src/lib/eras/hijriTabular.ts` (already has JDN-level day math to build on)
  - `client/src/features/unit-converter/components/` (Dates/Eras tab UI)
  - `client/src/data/localization/ui/*.json`