---
title: Let people type 'gf' or 'gram-force' in Smart Paste and get the right unit
---
Verify and, if needed, add smart-paste recognition for the new gram-force unit (symbol 'gf', id 'gf' in client/src/data/conversion/force.json). Smart paste symbol/name maps are built from category JSONs (client/src/lib/conversion-data.ts and related smart-paste symbol lookup helpers). Confirm pasting '5 gf' selects Force/gram-force and that word aliases like 'gram-force' work; add a test to tests/ if missing.