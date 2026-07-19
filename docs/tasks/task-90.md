---
title: Let people type 'minute', 'hour', 'day', 'week' to convert time
---
# Let people type 'minute', 'hour', 'day', 'week' to convert time

  ## What & Why
  Task #88 added full-word aliases for the long-span Time units (decade, century, millennium, eon). The everyday Time units still only match their short symbols (min, h, d, wk, mo, yr) and the canonical full name ("Minute"), but not common spelled-out / plural forms users naturally type in smart paste ("5 minutes", "2 hours", "3 days", "2 weeks", "6 months", "10 years").

  ## Done looks like
  - Typing "5 minutes", "2 hours", "3 days", "2 weeks", "6 months", "10 years" (singular + plural) in smart paste resolves to the correct Time unit.
  - Existing symbol/name parsing is unaffected.

  ## Relevant files
  - client/src/lib/conversion-data.ts (TIME_WORD_ALIASES / parseUnitSymbol — extend the same alias mechanism added for task #88)
  - tests/symbol-parsing.test.ts, tests/smart-paste.test.ts