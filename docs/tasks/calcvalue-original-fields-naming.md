# Rename CalcValue.originalUnit / originalValue to reflect their real role

## What & Why

`CalcValue.originalUnit` and `CalcValue.originalValue` were named as if
they capture "the value + unit as originally entered by the user." That
naming implies history: a value stamped once at entry, preserved through
subsequent operations.

The code doesn't work that way. Four writers set these fields, and two
of them use them for different purposes:

- **Paste / pull / converter-clipboard** (three writers) set them to
  "the numeric value + unit as the user entered / saw at the point of
  entry." Matches the naming.
- **`useCalculatorRpnSelection.computeOriginMetaForValue`** recomputes
  them to "the numeric value + unit for the currently-selected SI
  alternative and prefix" and OVERWRITES the top-of-stack entry's
  fields the moment the user touches the alt or prefix picker. Doesn't
  match the naming.

The single reader (`CalculatorFieldDisplay.tsx` in its
`preserveSourceUnit` branch) doesn't care about history; it just wants a
display value + unit label to show when preserveSourceUnit is on,
bypassing the dimensional-formula display path. What these fields
actually represent is a **display cache**, not a history.

The misleading naming is not currently causing bugs, but it invites
future writers to preserve the fields across operations they shouldn't
(because "original" sounds like it should propagate), or to add new
callers that assume the semantics that only 3 of the 4 writers honor.

## Done looks like

- Fields renamed on the `CalcValue` interface:
  `originalUnit` → `displayUnitCache`
  `originalValue` → `displayValueCache`
- All 4 writers updated:
  - `useCalculatorRpnPaste.buildPasteEntry`
  - `useCalculatorRpnPull.buildConverterEntry`
  - `useCalculatorRpnSelection.applyOriginMetaToTop`
  - `useConverterClipboard.buildCopyResultEntry`
- The single reader (`CalculatorFieldDisplay.tsx` `useSourceDisplay`
  branch) updated to use the new names.
- `useCalculatorRpnSelection.OriginMeta` interface renamed to match
  (e.g. `DisplayCacheMeta`) with its two fields renamed.
- Docblock on `CalcValue` (added in commit `b9112bb`) updated to
  describe the cache role rather than the "original" implication.
- One-line comment at each writer site noting whether it writes an
  "entry-point" cache (paste/pull/clipboard) or a "current selection"
  cache (RPN selection), so the semantic distinction is visible without
  reading the whole hook.

## Out of scope

- The `preserveSourceUnit` feature itself. This is a rename, not a
  redesign; the feature keeps its current behavior (show
  entered-value + entered-unit until the user changes the alt/prefix,
  then show the new display context).
- Adding new writers that would preserve the cache across arithmetic
  operations. `applyRpnUnary` and `applyRpnBinary` intentionally drop
  the cache today; a decision to preserve it (even conditionally for
  ops like `neg`/`abs`) is a separate design conversation. See
  `applyrpnunary-source-category-preservation.md`.
- Introducing a genuine "value as originally entered" history field
  for a future feature (e.g. undo-to-entry, entry-time provenance).
  That would be a NEW field, orthogonal to this rename.

## Why not now

The rename touches 4 writers, 1 reader, 1 interface, and one comment
block. It's mechanical but noisy in review — better done alongside
another intentional edit to the same files, so the reviewer has more
context than "this is a search-and-replace." Also, the naming isn't
actively harmful today: the single reader knows what it's reading, and
new writers would have to be added deliberately (they can't happen by
accident because the field types are `string | undefined` and
`number | undefined`).

Priority: **low**. File under "next time we're editing the RPN
selection / paste / pull cluster."
