---
title: Copy button includes the regional word (e.g. copies "2.5 crore", not just "2.5")
---
# Copy button includes the regional word

  ## What & Why
  Converter results now display regional counting words (e.g. "2.5 crore", "3.2亿") when converting to wan/yi/oku/lakh/crore/arab/kharab in the Unitless Numbers category. However, the Copy result action still copies only the plain number. Users who see "2.5 crore" may expect the copied text to match what they see.

  ## Done looks like
  - Copying the result while a regional counting unit is selected includes the suffix (or a deliberate decision is made and documented to copy only the number)

  ## Relevant files
  - `client/src/lib/units/regionalCountingSuffix.ts` (suffix helper)
  - `client/src/components/unit-converter/hooks/useConverterController.ts` (copyResult / formatForClipboard)