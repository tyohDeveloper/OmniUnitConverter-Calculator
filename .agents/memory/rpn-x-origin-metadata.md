---
name: RPN X-register origin metadata
description: Why X-register display bugs usually trace to originalUnit/originalValue metadata and stale closures
---
The static RPN X-register display prefers `originalUnit`/`originalValue` metadata on the stack value over the computed SI display. Any code path that updates the X stack entry and then calls the `setRpnResultPrefix`/`setRpnSelectedAlternative` wrappers can silently re-stamp metadata onto X.

**Why:** These wrappers recompute origin metadata for X. They once read `rpnStack` from a stale React closure, stamping the OLD value's metadata onto a freshly committed entry — the display showed the old value even though the stack held the new one ("entry ignored on first attempt" bug).

**How to apply:** When mutating the RPN stack in controller wrappers, always compute metadata inside the `setRpnStack(prev => ...)` functional updater from `prev`, never from closure state. If an X display looks stale while the stack is correct, check the metadata stamping path first.
