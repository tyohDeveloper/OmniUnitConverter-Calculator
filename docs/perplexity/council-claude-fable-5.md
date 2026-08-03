# Council Review — claude-fable-5 — OmniUnit Converter v4.0.0.1

Reviewer angle: **enforcement-gap analysis** — where the codebase's own stated standards are already achieved in the pure-function layer but silently violated in the controller/UI layer, with special attention to *duplicated logic* that exists in both layers at once.

---

## 1. Executive verdict

- **The architecture is ~70% of the way there, and the remaining 30% is concentrated in exactly four files.** The data layer (76 conversion + 24 localization JSON files), the reducer/state layer (`state/{converter,calculator,rpn,uiPrefs}Reducer.ts`, all ≤141 lines, action-per-file), and the pure-function layer (`lib/calculator/`, `lib/units/`) genuinely meet the stated standards.
- **The single biggest gap is not missing structure — it is *duplicated* structure.** The controllers re-implement, inline, logic that already exists as compliant pure functions: `useCalculatorController.ts:454-559` re-implements `lib/calculator/applyRpnUnary.ts` and `applyRpnBinary.ts` wholesale; `useCalculatorController.ts:296-338` hard-codes a ~60-category dimension map that duplicates `lib/units/categoryDimensions.ts:9-…`; `useConverterController.ts` re-implements `cleanNumber` and `formatNumberWithSeparators` that already exist in `lib/formatting.ts:154` and `:195`. Two implementations of unit-aware arithmetic is a correctness time bomb, not just a style issue.
- **The standards are enforced only where they are already met.** `scripts/lint-size.mjs:25-31,122-125` scopes all three rules (20-line functions, 1 export/file, 100-line files) to `client/src/lib/` — the layer that already passes — and never sees `features/**` or `components/unit-converter/**`, where `CalculatorPane.tsx` is 1,211 lines.
- **"Tests run at build time" is currently false.** `package.json:8` defines `"build": "vite build"`; neither `lint-size.mjs`, `verify-build.mjs`, `tsc`, nor Vitest is wired into it, and there is no CI workflow in the repo.
- **There is no canonical standards document.** The rules live implicitly in `docs/tasks/phase1..phase6-*.md`, `orchestration-layer-extraction.md`, and lint-script comments.
- **The XHTML deliverable requirement is not met and not addressed anywhere**: `client/index.html` is HTML5 and `vite.config.ts` emits `dist/public/index.html` via `viteSingleFile`.

## 2. Compliance matrix against stated standards

| Standard | Current status | Gap | Priority |
|---|---|---|---|
| Single-file offline deliverable | Met in spirit: `vite-plugin-singlefile` → one self-contained `index.html` (`vite.config.ts:26`, README "single, standalone .html file") | Output is `.html`, not `.xhtml`; no XML well-formedness guarantee | **P1** (pending clarification, §4) |
| Unique semantic identifier per UI object | Partial: 70 `data-testid` occurrences across only 7 TSX files; CalculatorPane ~40 testids for ~91 interactive elements; DirectPane 3 for ~8 | Roughly half of interactive widgets unidentified; no codified naming convention outside `docs/tasks/add-meaningful-testids.md` | **P1** |
| Split: UI / controller / pure functions / external data | Structurally present: `features/*/components`, `components/unit-converter/hooks`+`state`, `lib/`, `data/*.json` | Boundaries leak in both directions (§5); duplicated logic straddles the boundary | **P0** |
| All logic in pure-function layer | Met inside `lib/`; violated in controllers and panes | ~1,500 lines of pure-computable logic living in hooks/components (§5) | **P0** |
| Mutable state only in app controller | Mostly met — reducers own nearly everything; `useRpnStack.ts:29-58` is a clean dispatch facade | 2 `useState` + 3 timer/paste refs in `useConverterController.ts:210-215`; 6 UI-mechanics refs in `CalculatorPane.tsx:86-96,139` (§6) | **P2** |
| One exported function per file | Met in `lib/` (enforced, documented excludes at `lint-size.mjs:68-79`) | Not applied to hooks/components; controllers export 40+ member objects (`useCalculatorController.ts:715-738`) | **P1** |
| Functions < 20 lines | Met in `lib/` (enforced) | `CalculatorPane.tsx` inline handlers up to ~140 lines (e.g. the X-register `onKeyDown`/`onBlur` block at `CalculatorPane.tsx:886-1000`); `pullFromPane` ~100 lines (`useCalculatorController.ts:284-383`) | **P0** |
| Tests run at build time | 31 Vitest files + 2 Playwright specs exist; scripts exist | Nothing gates `npm run build`; no CI; `lint-size`/`verify-build` not even reachable via any npm script (`package.json:6-14`) | **P0** |
| Standards documented & findable | Absent as a single artifact | Create `docs/CODING-STANDARDS.md` (§3) | **P0** (cheap, high leverage) |

## 3. Findable-constraints gap

There is no discoverable standards doc. The constraints are scattered across: the header comment of `scripts/lint-size.mjs:2-17` (the closest thing to a normative statement), the six phase docs (`docs/tasks/phase1-contracts-and-types.md` … `phase6-dedup-and-cleanup.md`), `docs/tasks/orchestration-layer-extraction.md` (which *states* the state-ownership rule: "All shared state lives in the reducer/context; no parallel `useState`"), and `.agents/memory/*.md`. A new contributor — or a future AI session — cannot find the rules without archaeology.

Create **`docs/CODING-STANDARDS.md`** containing: (1) the four-layer model with the directory that owns each layer; (2) the three size rules with the *exact* scope of enforcement and the exclusion-with-rationale mechanism already practiced in `lint-size.mjs:33-67`; (3) the mutable-state rule (reducers own domain state; controllers may hold only ephemeral UI mechanics, with a definition of "ephemeral"); (4) the `data-testid` naming grammar (§8); (5) the build-gate contract (§9); (6) the single-file/XHTML output contract (§4). Link it from `README.md` and from the lint script header so the doc and the enforcer reference each other.

## 4. XHTML-output gap

Today: `client/index.html` is HTML5 (`<!DOCTYPE html>`, unclosed `<meta … />` is fine but the built output passes through Vite's HTML minifier with no XML guarantee), and the artifact is `dist/public/index.html`.

Two readings of the requirement:

**(a) "Runs from `file://` on a standalone machine"** — already satisfied by `.html`. For a file opened from disk, every mainstream browser dispatches on *extension*: `.html` gets the forgiving HTML parser. If this is the real requirement, document it in the standards doc and stop; renaming to `.xhtml` adds risk for zero user benefit.

**(b) Strict XML-serialized `.xhtml` artifact** — achievable but must be done as a *post-build transform + verifier*, not by hand-editing JSX:
1. Rename output to `index.xhtml`, add `<?xml version="1.0" encoding="UTF-8"?>` and `xmlns="http://www.w3.org/1999/xhtml"` on `<html>`.
2. The killer issue is the **inlined megabyte of minified JS**: in XML parsing, bare `&&`, `<` comparisons, and `&` inside the `<script>` element are fatal. The script (and the inlined Tailwind CSS in `<style>`, which can contain `&` in selectors) must be wrapped `//<![CDATA[ … //]]>`, and the JS itself must not contain the literal sequence `]]>` (a verifier check, and a rewrite of any occurrence).
3. Self-close all void elements and quote all attributes — i.e., replace or configure the HTML minifier to be XHTML-safe.
4. Extend `scripts/verify-build.mjs` to run a strict XML parse of the artifact and fail the build otherwise — this converts the constraint from folklore to enforcement, matching the pattern already used for the size ceiling.

Tradeoffs to flag to the author: `application/xhtml+xml` parsing is draconian (one ill-formed character = yellow error screen for the end user); React itself is fine in XHTML documents, but any future dependency that relies on `innerHTML` HTML-parsing quirks or `document.write` breaks. My recommendation: keep `.html` as the shipped artifact, and *additionally* enforce XML well-formedness of the markup (polyglot output) so an `.xhtml` rename is a one-line switch if truly needed.

## 5. Pure-function-layer purity

Where logic leaks, in descending severity — all verified by reading the source:

1. **RPN arithmetic re-implemented in the controller.** `useCalculatorController.ts:454-503` contains a 28-case `switch` implementing square/sqrt/trig/hyperbolic ops *with dimensional-exponent arithmetic inline* (`newDimensions[d] = e * 2`, `Math.ceil(e / 2)`, radian/dimensionless promotion rules), and `:512-559` does the same for the 9 binary ops. Meanwhile `lib/calculator/applyRpnUnary.ts` and `applyRpnBinary.ts` — decomposed into `rpnOps/{powerOps,logOps,roundingOps,trigOps,hyperbolicOps}.ts` — implement the same contract and are **not imported by the controller** (see its import block, `useCalculatorController.ts:1-23`). Note the two even disagree subtly: the lib's `applyRpnUnary` returns entries without a `prefix` field while the controller writes `prefix: 'none'`, and precision defaults differ. Any bug fix now has to land twice. This is the single worst purity violation in the codebase.
2. **Category→dimension data hard-coded in the controller.** `useCalculatorController.ts:296-338` embeds a ~60-entry `dimMap` object literal inside `pullFromPane`, duplicating `lib/units/categoryDimensions.ts` (`CATEGORY_DIMENSIONS`, same formulas, e.g. `pressure: { mass: 1, length: -1, time: -2 }`). This violates both "logic in the pure layer" *and* "data external to code": it's data, in code, in the wrong layer, twice.
3. **Number formatting re-implemented in the controller.** `useConverterController.ts:253-265` (`cleanNumber`) and `:266-…` (`formatNumberWithSeparators`, with CJK-myriad, Arabic-numeral, south-asian grouping branches) duplicate `lib/formatting.ts:154` (`cleanNumber`) and `:195` (`formatNumberWithSeparators`).
4. **Unit-text parsing and stack mutation in the *component*.** `CalculatorPane.tsx:106-135` (`commitRpnXValue`) parses text, builds a dimension record field-by-field, and mutates the RPN stack — from inside a render component. `CalculatorPane.tsx:141-191` is a 50-line `useEffect` implementing value re-expression math (`displayToSI` → `siToDisplay`, prefix symbol computation, `toPrecision(15)` rounding) triggered by dropdown changes. Both belong in `lib/` (the math) plus a controller action (the dispatch).
5. **Conversion routing in the app shell.** `UnitConverterApp.tsx:141-170` (global paste handler) parses clipboard text and decides category/unit/prefix routing inline; `:99-125` embeds a per-category default-unit table (`temperature→'k'`, `volume→'l'`, `capacitance→'f'`, `math→'num'`) — that table is data and should live beside the conversion JSON.
6. Minor but telling: `CalculatorPane.tsx:534-539` has an `if (currentSymbol.includes('kg')) { setResultPrefix(val); } else { setResultPrefix(val); }` — both branches identical. Dead conditional logic like this is what accumulates when logic lives where no lint or test looks.

What is *clean*: the `lib/` layer itself. Spot-checks of `lib/calculator/applyRpnUnary.ts`, `fixPrecision.ts`, `isRadians.ts`, `dimensionsEqual.ts` show disciplined single-export, sub-20-line, side-effect-free functions with local helpers exactly as the standard prescribes.

## 6. Mutable-state discipline

The reducer/context core is genuinely good: `ConverterContext.tsx` (93 lines) composes four small reducers, and `useRpnStack.ts:29-58` shows the intended pattern — every setter is a dispatch of an action creator, including functional updates (`updateRpnStack(v)`) and semantic operations (`pushValue`, `undoStack`).

Remaining out-of-reducer state:

| Location | State | Verdict |
|---|---|---|
| `useConverterController.ts:214-215` | `converterPasteStatus`, `customPasteStatus` (`useState`) | **Move to `uiPrefs` reducer** (or a new `transient` slice). It's domain-visible UI state that tests will want to assert; the orchestration doc explicitly bans parallel `useState`. |
| `useConverterController.ts:210-212` | `pendingPasteUnitRef`, two `setTimeout` refs | Timer handles may stay as refs (they're not renderable state), but `pendingPasteUnitRef` encodes a *pending domain intent* — model it as reducer state so paste-across-category is testable and undo-safe. |
| `CalculatorPane.tsx:86-96,139` | `rpnXInputRef`, `suppressXBlurRef`, `committedXTextRef`, `enterCommitKeepFocusRef`, `prevRpnDisplayRef` | Focus/blur choreography (incl. the iOS-WebKit Done-key workaround documented at `:93-96`) is legitimately UI-mechanics — acceptable to keep in the view **if** extracted into one `useRpnXEditField()` hook so the pane stops owning five refs and a 100-line keydown handler. |
| `useCalculatorController.ts:674` | `lastCalcInputsRef` memo key for the auto-compute `useEffect:676-713` | Symptom of a deeper issue: that effect chains dispatches (`setCalcOp1('*'); return;` → re-run → compute). Replace with a single reducer action (`recomputeCalcResult`) that does the op-defaulting and result computation atomically via a pure `lib/calculator/computeCalcResult.ts`. |
| `UnitConverterApp.tsx:95-180` | 6 `useEffect`s (document lang, category defaults, focus, tab-switch RPN sync, global paste, global copy) | Fine as *effects*, but their bodies should shrink to `dispatch(action)` + pure-function calls per §5. |

## 7. File & function size compliance

`lint-size.mjs` covers only `client/src/lib/**` (`EXPORT_COUNT_RULE_DIRS` at `:27-31`, `FILE_LENGTH_APPLIES_DIRS` at `:122-125`). Uncovered violators: `CalculatorPane.tsx` (1,211), `useConverterController.ts` (809), `useCalculatorController.ts` (738), `UnitConverterApp.tsx` (552), `ConverterPane.tsx` (521), `DirectPane.tsx` (251).

Recommendation — extend rather than exempt:
- Add `client/src/components/unit-converter/hooks` and `state` to the function-length rule immediately. Controller hooks are not JSX; the 20-line rule is directly applicable once the §5 extractions land. Also apply a file-length cap (I'd say 150 for hooks — a controller that only wires reducer state to `lib/` calls fits easily).
- For `.tsx`, the brace-counting parser (`lint-size.mjs:149-188`) will misfire on JSX. Don't hand-roll it: add a **component-level rule** instead — max ~250 lines per `.tsx` file and max 30 lines per named event handler (forcing handlers like the X-register `onKeyDown` at `CalculatorPane.tsx:905-965` out into controller functions). Document the JSX carve-out explicitly in the standards doc so it's a *decided* exception, not a hole.
- The exclusion-with-rationale pattern already in the script is exactly right — keep it, but require each exclusion to cite the standards doc section that permits it.

## 8. UI-object identifier coverage

Measured: 70 `data-testid` attributes in 7 TSX files. Against interactive-element counts: CalculatorPane ~40/91, ConverterPane 14/24, UnitConverterApp 7/16, DirectPane 3/8 — i.e., roughly **50% coverage overall**. Concrete DirectPane gaps: the value `<Input>` at `DirectPane.tsx:104` has no testid; the per-dimension exponent buttons (`:211`) and quantity-preset buttons (`:235`) are generated in loops with none. Dynamic RPN buttons are the good counter-example: `data-testid={`button-rpn-${btn.id}`}` with shift-aware ids (`CalculatorPane.tsx:843,860`).

`docs/tasks/add-meaningful-testids.md` already defines a de-facto grammar. Codify it in the standards doc as: `{role}-{pane}-{name}` with roles `button|select|input|display|text`, kebab-case, parameterized for generated widgets (`button-custom-exp-{dimension}-{value}`), and **additive-only** (never rename existing ids — the doc's own rule). Then add a lint pass: any JSX element with `onClick`/`onValueChange`/`onCheckedChange` or `<Input|input|Select|Switch|Button>` in the covered directories must carry a `data-testid` (a regex-level check catches 95% and fits the existing zero-dependency script style).

## 9. Build-time tests

Currently `"build": "vite build"` and `lint-size.mjs` is not referenced by *any* npm script — it can only be run by someone who knows it exists. Minimal wiring, no new dependencies:

```json
"lint:size": "node scripts/lint-size.mjs",
"verify:build": "node scripts/verify-build.mjs",
"test:run": "vitest run",
"prebuild": "npm run check && npm run lint:size && npm run test:run",
"build": "vite build",
"postbuild": "npm run verify:build"
```

`prebuild`/`postbuild` run automatically with `npm run build`, which satisfies "test cases run at build time" literally. Add a `build:fast` escape hatch for iteration. For CI, one GitHub Actions workflow: `npm ci && npm run build` (which now implies check+lint+tests+verify) plus `npm run test:e2e` on a separate job with the Chromium notes from `.agents/memory/playwright-e2e-chromium.md`. If the XHTML path (§4b) is chosen, the XML validation lives in `verify-build.mjs` and is thereby gated too.

## 10. Top changes, ranked

1. **Delete the controller's inline RPN op switches; call `lib/calculator/applyRpnUnary/Binary`** (`useCalculatorController.ts:454-559`) — removes the dual-implementation correctness risk; biggest single win.
2. **Replace `dimMap` with `CATEGORY_DIMENSIONS` import, then move that table to JSON** (`useCalculatorController.ts:296-338`) — de-duplicates data and honors the data-external rule.
3. **Wire `prebuild`/`postbuild` gates** (§9) — makes every other rule self-enforcing; ~10 lines of `package.json`.
4. **Write `docs/CODING-STANDARDS.md`** (§3) — the constraint the author explicitly asked to be findable.
5. **Use `lib/formatting.ts`'s `cleanNumber`/`formatNumberWithSeparators` in `useConverterController`** — third de-duplication, mechanical.
6. **Extract `commitRpnXValue` + the re-expression `useEffect` from `CalculatorPane.tsx:106-191` into `lib/` functions + controller actions** — removes parsing/math from the view layer.
7. **Extend `lint-size.mjs` to hooks/state dirs + a `.tsx` file-cap and handler-cap rule** (§7) — closes the enforcement blind spot that let the hot spots grow.
8. **Split `CalculatorPane.tsx` into `SimpleCalculator` and `RpnCalculator` panes** — the file is two UIs under one roof (mode branches at `:196` and `:256`); halves the worst file for free.
9. **Testid completion sweep per `add-meaningful-testids.md` + testid lint rule** (§8).
10. **Decide the XHTML question with the author; implement verifier-enforced polyglot output** (§4) — small transform, but it's the stated deliverable.
11. **Replace the `lastCalcInputsRef` auto-compute effect with a reducer action + pure `computeCalcResult`** (`useCalculatorController.ts:674-713`).
12. **Move `converterPasteStatus`/`customPasteStatus` and `pendingPasteUnitRef` into reducers** (`useConverterController.ts:210-215`).

## 11. What NOT to change

- **The `lib/calculator/` + `lib/units/` decomposition** — one-function-per-file with `rpnOps/` sub-dispatch is exactly the stated standard; don't "simplify" it back into modules.
- **The reducer/action/selector architecture** (`state/`, `ConverterContext.tsx`, `useRpnStack.ts`) — small, composed, action-per-file; the orchestration doc correctly calls it "already sound."
- **The JSON data layer** (76 conversion + 24 localization files) and the translation-pruning build plugin (`scripts/vite-plugin-prune-translations.ts`).
- **The exclusion-with-rationale discipline in `lint-size.mjs`** — a documented-exception mechanism is the right way to keep rules honest; extend it, don't replace it.
- **`verify-build.mjs` size-ceiling + baseline pattern** and the single-file Vite pipeline — keep as the foundation the XHTML check bolts onto.
- **The docs/tasks history** — an unusually good written record; the standards doc should cite it, not supersede it.
- **The iOS-WebKit focus workarounds** (`CalculatorPane.tsx:93-96` comments) — hard-won behavior; relocate into a dedicated hook, but preserve the logic and comments verbatim.

*(~2,150 words. All line references verified against the local clone at `/home/user/workspace/OmniUnitConverter-Calculator`.)*
