# Council-02: Controller Inline RPN Dispatch vs. lib/calculator Reference Diff

> **Purpose.** Reference for the swap performed in council-02. Records the behavioral comparison between the controller's inline `switch` (removed) and the `lib/calculator/applyRpnUnary` + `applyRpnBinary` implementations (kept).
>
> **Sources compared.**
> - Controller (pre-change): `client/src/components/unit-converter/hooks/useCalculatorController.ts:454-558`
> - Lib unary: `client/src/lib/calculator/applyRpnUnary.ts` + `rpnOps/{powerOps,logOps,roundingOps,trigOps,hyperbolicOps}.ts`
> - Lib binary: `client/src/lib/calculator/applyRpnBinary.ts` + `rpnOps/{scalarOps,unitOps}.ts`

## Return-shape difference

| Field | Controller | Lib | Reconciliation |
|---|---|---|---|
| `value` | `number` | `number` | Same |
| `dimensions` | `Record<string, number>` (zero-exponent keys deleted) | `DimensionalFormula` (zero-exponent keys deleted) | Same behavior |
| `prefix` | `'none'` (always set) | absent | **Type mismatch.** The app-wide `CalcValue` in `client/src/lib/units/calcValue.ts` requires `prefix: string`. The lib's leaner `CalcValue` in `client/src/lib/calculator/types.ts` omits it. To preserve the app contract, the swap adds `prefix: 'none'` at the call site immediately after the lib returns. |
| `sourceCategory` | Preserved for `neg`/`abs` only | Preserved for `neg`/`abs` only | Same |

## Unary op-by-op equivalence

Read `x` as the input CalcValue and `d = x.dimensions`. All arithmetic passes through `fixPrecision` unless noted.

| Op | Controller | Lib | Result |
|---|---|---|---|
| `square` | `x.value * x.value`; each dim `× 2` | `powerOps.applyPowerOp('square')` — same formula | Equivalent |
| `cube` | `x.value ** 3`; each dim `× 3` | `powerOps.applyPowerOp('cube')` uses `x.value * x.value * x.value` | Equivalent — both produce the same double after `fixPrecision` |
| `sqrt` | Guard `x.value < 0` returns early; each dim `Math.ceil(e / 2)` | Same guard + same formula | Equivalent. **Documented behavior (§5 policy note):** odd exponents are silently rounded up. |
| `cbrt` | each dim `Math.ceil(e / 3)`, no domain guard | Same | Equivalent. Same policy note. |
| `recip` | Guard `x.value === 0`; each dim negated | Same | Equivalent |
| `exp`, `pow10`, `pow2` | `Math.exp/pow(10,x)/pow(2,x)`; dims copied | `logOps` — same | Equivalent |
| `ln`, `log10`, `log2` | Guard `x.value <= 0`; dims copied | Same | Equivalent. **Documented behavior:** dimensions are preserved (not rejected on dimensioned input). |
| `rnd`/`trunc`/`floor`/`ceil` | Banker's rounding for `rnd`; scale by `10^precision` | `roundingOps` — same | Equivalent |
| `neg`, `abs` | Dims copied, source category preserved | Same, source category preserved | Equivalent |
| `sin`/`cos`/`tan` | Dims cleared if `isRadians(d)`, else copied | Same | Equivalent |
| `asin`/`acos` | Guard `x.value in [-1, 1]`; angle promotion if dimensionless | Same | Equivalent |
| `atan` | Angle promotion if dimensionless | Same | Equivalent |
| `sinh`/`cosh`/`tanh` | Dims cleared if `isRadians(d)`, else copied | Same | Equivalent |
| `asinh` | Angle promotion if dimensionless | Same | Equivalent |
| `acosh` | Guard `x.value < 1`; angle promotion if dimensionless | Same | Equivalent |
| `atanh` | Guard `x.value <= -1 \|\| x.value >= 1`; angle promotion if dimensionless | Same | Equivalent |

**Conclusion.** All 28 unary ops produce identical values and dimensions. Only the presence of `prefix: 'none'` on the returned object differs, and that is added by the call site.

## Binary op-by-op equivalence

| Op | Controller | Lib | Result |
|---|---|---|---|
| `mul` | `y·x`, dims = `{...x.dimensions}` | `scalarOps.applyScalar('mul')` — same | Equivalent |
| `div` | Guard `x.value === 0`; `y/x`, dims = `{...x.dimensions}` | Same | Equivalent |
| `add`, `sub` | Scalar +/-, dims = `{...x.dimensions}` | Same | Equivalent |
| `mulUnit` | `y·x`, dims = merge(y, x, +1) | `unitOps.applyUnit('mulUnit')` — uses helper `mergeDims(yd, xd, 1)` | Equivalent |
| `divUnit` | Guard `x.value === 0`; `y/x`, dims = merge(y, x, −1) | Same | Equivalent |
| `addUnit`, `subUnit` | Dims-compatibility guard, then `+/-`; dims = `{...(dimensionless-of-x ? y : x)}` | Same | Equivalent |
| `pow` | Requires x dimensionless; guards `y=0 && x<0` and `y<0 && !int(x)`; each y-dim `× x.value` | `unitOps.applyPow` — same guards, same formula, zero-exponent keys pruned inside | Equivalent |

**Conclusion.** All 9 binary ops produce identical values and dimensions.

## Behavioral-policy decisions locked in

These questions were raised in the council pass (§5 of `docs/perplexity/architecture-pass-council-synthesis.md`). Both implementations already agree on the following, and the swap preserves the agreement:

1. **`sqrt`/`cbrt` on odd exponents.** Silently round up via `Math.ceil(e / N)`. The alternative (reject, or represent fractional exponents) was not adopted here. If this policy is later revisited, the change lands in a single file (`lib/calculator/rpnOps/powerOps.ts`) and both call paths get it for free.
2. **`exp`/`ln`/`pow10`/`log10`/`pow2`/`log2` on dimensioned input.** Dimensions are preserved (input dims copied to output). The alternative (require dimensionless input, reject dimensioned) was not adopted. Same locality argument.

These are documented in `client/src/lib/calculator/rpnOps/powerOps.ts` and `logOps.ts` respectively.

## Post-swap invariants

- Every existing Vitest and Playwright test continues to pass.
- The controller's exported `RpnUnaryOp` and `RpnBinaryOp` types remain valid — they are re-exported from the lib for consumer convenience.
- Any future op is added in exactly one place (`rpnOps/*.ts`) and reached from both the controller and any other consumer through the lib entry points.
