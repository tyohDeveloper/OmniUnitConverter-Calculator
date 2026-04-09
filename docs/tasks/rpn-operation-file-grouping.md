# RPN Operation File Grouping

## What & Why
`applyRpnUnary.ts` (104 lines) already has internal helper functions grouped by operation family, but they all live in one file. `applyRpnBinary.ts` (62 lines) similarly mixes scalar and unit-aware arithmetic. Extracting each family into its own file under a `lib/calculator/rpnOps/` subdirectory makes it easy to locate and extend specific operation types in the future without touching unrelated logic — important given the unit-aware complexity of each group.

## Done looks like
- A new `lib/calculator/rpnOps/` directory exists with one file per operation family
- `applyRpnUnary.ts` and `applyRpnBinary.ts` are thin dispatchers that import from `rpnOps/` — their public API is unchanged
- Each operation family file is self-contained with its own type guard / domain guard imports
- All existing tests pass; app behaviour is identical

## Out of scope
- Adding new operations or changing operation behaviour
- Changes to `RpnUnaryOp` or `RpnBinaryOp` type unions — they stay in their current locations
- Any UI or state layer changes

## Tasks
1. **Create `rpnOps/` operation family files** — Extract each internal helper group from `applyRpnUnary.ts` into a dedicated file: `powerOps.ts` (square, cube, sqrt, cbrt, recip), `logOps.ts` (exp, ln, pow10, log10, pow2, log2), `roundingOps.ts` (rnd, trunc, floor, ceil), `trigOps.ts` (sin, cos, tan, asin, acos, atan), `hyperbolicOps.ts` (sinh, cosh, tanh, asinh, acosh, atanh). Each file receives the shared imports it needs (CalcValue, isDimensionless, isRadians, fixPrecision, etc.) directly.

2. **Create `rpnOps/arithmeticOps.ts`** — Extract the scalar and unit-aware binary helpers from `applyRpnBinary.ts` (applyScalar, applyPow, applyUnit, mergeDims) into this file.

3. **Slim down `applyRpnUnary.ts` and `applyRpnBinary.ts`** — Replace the inline helper functions with imports from `rpnOps/`. The exported `applyRpnUnary` and `applyRpnBinary` functions and their type signatures remain unchanged.

## Relevant files
- `client/src/lib/calculator/applyRpnUnary.ts`
- `client/src/lib/calculator/applyRpnBinary.ts`
- `client/src/lib/calculator/types.ts`
- `client/src/lib/calculator/isDimensionless.ts`
- `client/src/lib/calculator/isRadians.ts`
- `client/src/lib/calculator/fixPrecision.ts`
- `client/src/lib/calculator/dimensionsEqual.ts`
