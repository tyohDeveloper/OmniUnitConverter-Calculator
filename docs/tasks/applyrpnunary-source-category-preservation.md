# Document (or reconsider) `applyRpnUnary`'s partial sourceCategory preservation

## What & Why

`client/src/lib/calculator/applyRpnUnary.ts` preserves `sourceCategory`
on the result CalcValue for exactly two operations: `neg` and `abs`.
Every other unary operation (`sqrt`, `square`, `sin`, `log10`, `exp`,
`recip`, `trunc`, ...) drops it. `applyRpnBinary` drops it
unconditionally.

This is probably correct behavior:

- `neg(5 km)` is still fundamentally a length; the category-flavored SI
  representations (which the SI-representation generator surfaces first
  when `sourceCategory` is set) still make sense.
- `sqrt(5 m²)` is a length, but it came from an area — the "prefer
  area-category representations" hint would be misleading.
- `sin(5 rad)` is dimensionless; there's no source-category concept
  that applies.

But the reasoning is not written down anywhere. A reader looking at the
inline `const preserveCategory = op === 'neg' || op === 'abs';` line
has no way to know:

1. Whether this list is exhaustive (should `trunc` / `floor` / `ceil`
   / `round` be here too, since they preserve dimension?).
2. Why `applyRpnBinary` doesn't preserve it even when the result
   dimension matches one of the operands' dimensions (e.g. `y + x` when
   `y` and `x` share a category).
3. What downstream consumers actually rely on `sourceCategory` staying
   set post-operation.

The `sourceCategory` field IS read (5 sites, all `generateSIRepresent
ations` calls), so this isn't a dead-field question — the field
matters. The question is whether the current preservation policy is
the RIGHT policy.

## Done looks like

**Option A: document the existing policy.**
- File-level docblock on `applyRpnUnary.ts` explaining: `sourceCategory`
  represents a hint about which category-flavored SI representations to
  prefer for display. It is preserved for value-shape-preserving ops
  (`neg`, `abs`) where "still fundamentally the same physical quantity"
  is trivially true, and dropped for ops that change the shape or
  scale of the quantity, because the source-category hint may then
  point at representations that no longer make physical sense.
- One-line comment at the `preserveCategory` line reaffirming the same
  and citing this file (or the docblock).
- Same treatment on `applyRpnBinary.ts`: docblock explains why binary
  ops drop it unconditionally (result category depends on the op AND
  both operands, not just one).

**Option B: expand the policy.**
- Consider whether trunc/floor/ceil/round should also preserve.
  Argument for: they change value but not dimension or scale — a
  rounded length is still a length.
  Argument against: rounding to a specific numeric value is a user
  action that may or may not have anything to do with the source unit
  (rounding `5.7 in` to `6 in` is a length; rounding `5.7 rad` to `6`
  is a unit-agnostic operation on a scalar).
- If yes, expand the `preserveCategory` predicate and update the
  docblock accordingly.

**Option C: rework as a policy table.**
- Replace the inline `neg || abs` predicate with a per-op table in a
  separate file (e.g. `rpnOpPolicy.ts`) that captures preservation
  rules for `sourceCategory`, `originalUnit`/`originalValue` (per
  the sibling task doc), and any future per-op metadata questions.
- The dispatch site consults the table.
- Advantage: adding a new op forces a policy decision at the table,
  not by accident of default.

## Out of scope

- The behavior of `sourceCategory` when it's absent (the CalcValue
  interface has it as optional; if unset, `generateSIRepresentations`
  falls back to dimension-only representations). That's already the
  right behavior.
- The `originalUnit` / `originalValue` display cache. Sibling task
  doc `calcvalue-original-fields-naming.md` covers that.
- The `preserveSourceUnit` UI toggle. That's a separate feature; the
  source-category preservation policy affects what representations
  are OFFERED, not whether the display uses source-preserving mode.

## Recommendation

**Option A** as the minimum. **Option C** if there's appetite for
adding policy dimensions in the near future (e.g. an `originalUnit`
preservation policy per op).

## Why not now

The current behavior is not wrong — it's just under-documented. There
is no known bug tied to this behavior. Doing this well requires a
policy decision (Option A vs B vs C), which is a design conversation
that belongs alongside the next RPN feature work, not as a standalone
edit.

Priority: **low**. File under "when we next add or modify a unary
op, close this doc as part of that work."
