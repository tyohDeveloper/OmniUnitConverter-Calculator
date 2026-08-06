---
name: RPN button focus preservation
description: How RPN operation buttons keep the X input focused and commit pending text
---

On the locked RPN page, every operation button uses a shared `handleRpnButtonMouseDown` (from `useRpnXEditField`, hoisted to the pane): mousedown `preventDefault` so the X input never blurs, commits pending typed text at mousedown (React flushes the dispatch before the click event, so the click's op sees the committed X), sets a fresh-entry flag, and schedules refocus+select. A `[rpnStack]` effect refreshes the edit text from the new X value while the flag is set; the flag is deliberately NOT consumed by the effect (one press can change the stack twice: mousedown commit + click op) and is cleared on typing/Escape/blur.

**Why:** committing in the click handler would run the op against a stale stack closure; consuming the flag on first effect fire would miss the op's own stack change.

**How to apply:** any new RPN control must wire `onMouseDown={onOpButtonMouseDown}`; dropdown-style controls (Radix Select) instead use preventDefault + suppressXBlurRef + `onCloseAutoFocus` refocus (see prefix/SI selectors and header precision select). The mechanism is gated on `lockRpnMode` so Converter/Custom pages keep their blur-commit behavior.
