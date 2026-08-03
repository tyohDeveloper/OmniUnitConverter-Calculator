# OmniUnit Converter — Model-Council Architecture Pass

**Repository:** [`tyohDeveloper/OmniUnitConverter-Calculator`](https://github.com/tyohDeveloper/OmniUnitConverter-Calculator) @ v4.0.0.1
**Council:** Claude Fable 5 and GPT 5.6 Sol, each with independent read of the local clone.
**Scope:** initial pass — what should change to meet the stated coding standards.

Individual model reports:
- `council-claude-fable-5.md` — enforcement-gap angle, focused on duplicated logic
- `council-gpt-5-6-sol.md` — dimensional/boundary-integrity angle, focused on purity contracts

---

## 1. Where the models agree

| Finding | Claude Fable 5 | GPT 5.6 Sol | Evidence |
|---|---|---|---|
| The domain (`lib/`), reducer/context, and JSON data layers already meet the stated standards; the gap is concentrated in features/hooks | ✓ | ✓ | `lib/calculator/`, `lib/units/` 1‑fn‑per‑file; `ConverterContext.tsx` composes 4 reducers |
| Logic is materially duplicated between the controllers and `lib/` — same math, two implementations | ✓ | ✓ | RPN unary switch at `useCalculatorController.ts:454-501` vs `lib/calculator/applyRpnUnary.ts`; `dimMap` at `:296-338` vs `lib/units/categoryDimensions.ts`; `cleanNumber`/`formatNumberWithSeparators` in `useConverterController.ts` vs `lib/formatting.ts:154,195` |
| `scripts/lint-size.mjs` enforces rules only where they are already met; features/hooks are ungoverned | ✓ | ✓ | Rule dirs at `lint-size.mjs:27-31,122-125`; `CalculatorPane.tsx` 1,211 lines is invisible to it |
| "Tests run at build time" is currently false — `"build": "vite build"` runs nothing else and no CI workflow exists | ✓ | ✓ | `package.json:6-14` |
| There is no canonical, discoverable standards document | ✓ | ✓ | Rules scattered across `docs/tasks/phase*.md`, lint header, `.agents/memory/*.md` |
| The XHTML deliverable is not met — output is `.html`, and there is no XML-validity check | ✓ | ✓ | `vite.config.ts:26,39-43`; `verify-build.mjs:67-84` |
| Logic leaks into JSX view components, not just controllers | ✓ | ✓ | `CalculatorPane.tsx:106-191`; `ConverterPane.tsx:392-511`; `DirectPane.tsx:72-84` |
| An auto-compute effect + memo ref pattern in the calculator controller should be replaced by an atomic reducer transition | ✓ | ✓ | `useCalculatorController.ts:674-713` (`lastCalcInputsRef`) |
| The pure-function decomposition and reducer spine should be preserved as-is | ✓ | ✓ | Both explicitly warn against "simplifying" the split back |

## 2. Where the models disagree

| Topic | Claude Fable 5 | GPT 5.6 Sol | Why they differ |
|---|---|---|---|
| Enforcement mechanism for features/hooks | Extend the existing zero-dependency Node script with a `.tsx` file cap and handler-length cap; keep the regex parser | Retire the regex parser for TS/TSX and adopt ESLint AST rules (`max-lines-per-function`, file length) | Fable weights build-simplicity/no-new-deps; GPT weights parser correctness on JSX |
| `data-testid` in production | Extend coverage; keep additive-only rule; codify grammar; add regex-level lint | **Remove the DEV-only stripping** in `test-utils.ts:1-8` — production IDs are part of the testability contract; add AST check for interactive primitives and duplicate-ID rendered test | Fable takes `add-meaningful-testids.md`'s "additive-only" rule at face value; GPT flags that helper-emitted IDs literally do not exist in the shipped artifact and that some IDs (e.g. every category using `display-category` at `UnitConverterApp.tsx:243-264`) violate uniqueness even in dev |
| XHTML recommendation | Ship `.html`, but *enforce polyglot XML well-formedness* in the verifier so an `.xhtml` rename is a one-line switch | Pick one contract, then either honestly serialize to `.xhtml` with an XML-aware pipeline (namespace, CDATA-safe inline JS/CSS, no HTML minifier that rewrites XML-safe syntax) or state the requirement as HTML. Extension-only compliance is worse than not doing it | Both agree renaming alone is insufficient. Fable proposes a hedge; GPT insists on a binary decision |
| RPN-op leakage severity | "Single worst purity violation" (correctness time bomb) | Same phenomenon, but calls out a *specific latent bug*: `sqrt`/`cbrt` silently round odd exponents up (`:462-466`), and `exp`/`ln` preserve dimensions when they should require dimensionless input (`:467-472`) | Fable frames it as duplication risk; GPT identifies concrete algorithmic defects the leakage hides |
| Timer/ref classification | Timer handles may stay as refs; `pendingPasteUnitRef` should become reducer state | Timer handles are "effect resources, not application state"; same conclusion for `pendingPasteUnitRef` | Terminology only — the actions match |
| Standards doc path | `docs/CODING-STANDARDS.md` | `docs/architecture/standards.md`, linked from README and CONTRIBUTING | Cosmetic |

## 3. Unique discoveries

| Model | Unique finding | Why it matters |
|---|---|---|
| Claude Fable 5 | **Dead conditional** at `CalculatorPane.tsx:534-539` — an `if…else` where both branches call `setResultPrefix(val)` identically | Direct evidence that lint/tests never see the pane; this is exactly the class of defect that accumulates under an enforcement blind spot |
| Claude Fable 5 | The lib's `applyRpnUnary` and the controller's inline switch **disagree subtly** — the lib returns entries without a `prefix` field, the controller sets `prefix: 'none'`; precision defaults differ | Two implementations are already drifting, before anyone tried to change one |
| Claude Fable 5 | `UnitConverterApp.tsx:99-125` embeds a per-category default-unit table (`temperature→'k'`, `volume→'l'`, …) | That table is data-in-code inside the app shell — the same violation as `dimMap`, just less obvious |
| GPT 5.6 Sol | `testId()` is **DEV-only** — helper-emitted IDs vanish in the production single-file build (`test-utils.ts:1-8`); measured coverage collapses from ~70/? in dev to a much smaller set at runtime | The user's core standard ("every UI object should have a unique identifier for UI testing") is currently unmet in the shipped artifact — the deliverable itself, not the source, is the audit target |
| GPT 5.6 Sol | Duplicate `display-category` used for every category card at `UnitConverterApp.tsx:243-264`; `DirectPane`'s mapped physical-quantity buttons reuse the same ID (`DirectPane.tsx:191-241`) | "Unique identifier" is not being met even where testids exist — the naming grammar must include dynamic keys |
| GPT 5.6 Sol | `useAllFlashFlags` instantiates **15 separate hook instances** (`useFlashFlag.ts:48-65`) | Small point, but symptomatic of ad-hoc growth in the transient-UI layer |
| GPT 5.6 Sol | Comparison-mode conversions computed **inside a render-time IIFE** at `ConverterPane.tsx:459-511` | View doing conversion math is worse than a controller doing it; renders are not tests |

## 4. Comprehensive analysis

### High-confidence findings

The council reaches a strong consensus that OmniUnit's foundation is sound and its problem is boundary erosion, not missing structure. The pure-function library (`lib/calculator/`, `lib/units/`) genuinely honors every one of the stated rules — one export per file, sub-20-line bodies, local helpers where complexity is unavoidable, and an exclusion-with-rationale mechanism in `lint-size.mjs:33-79` that is itself a good pattern. The reducer layer is small, composed, action-per-file, and matches the "mutable state only in the application controller" rule closely. The 76 conversion + 24 localization JSON files satisfy the data-external rule for the vast majority of application data. Both models explicitly asked that these areas *not* be changed.

The problem is that the standards apply to *the entire application* while the enforcement covers exactly the layer that already complies. Two files — `useCalculatorController.ts` (738 lines) and `useConverterController.ts` (809 lines) — contain the arithmetic, dimensional-analysis, formatting, and parsing logic that the standards say must live in the pure layer. `CalculatorPane.tsx` (1,211 lines) then re-does some of the same work inside JSX renderers and inline `useEffect` bodies. This is not "the panes are big"; it is "the panes are big *because they contain logic that should not be there*", and splitting the files before extracting that logic would only redistribute the violation across more files.

The most concrete correctness finding — flagged by both models but sharpest in GPT's report — is that the controller-embedded RPN dispatch has already diverged from the compliant lib version. Fable observed the controller sets `prefix: 'none'` on returned entries where the lib omits the field; GPT independently identified that the controller's `sqrt`/`cbrt` silently round odd exponents up and its `exp`/`ln` preserve input dimensions rather than requiring dimensionless input. Both would be trivial to fix in one place; today the lib version is fine and the controller version — which is the one actually executed — is not. This is the single strongest argument for merging the two implementations before anything else changes.

The enforcement gap is the second high-confidence finding. `"build": "vite build"` means `npm run build` currently emits a production artifact without running `tsc`, `lint-size.mjs`, Vitest, or `verify-build.mjs`. The scripts exist and are good; they simply aren't wired. Both models converge on essentially the same fix: gate `build` behind typecheck + size lint + `vitest run`, run `verify-build` after bundling, and reproduce the same sequence in CI. This is roughly ten lines of `package.json` and closes the "tests run at build time" gap literally, not aspirationally.

### Areas of divergence

The two substantive disagreements are worth resolving explicitly.

**On enforcement mechanism for the uncovered layers**, Fable proposes extending `lint-size.mjs` with a `.tsx` file cap (~250 lines) and a named-handler cap (~30 lines), keeping the zero-dependency Node script. GPT argues that a regex-and-brace parser cannot see through JSX reliably and that ESLint's AST-based rules (`max-lines-per-function`, `max-lines`, `no-restricted-syntax` for exports) are the correct tool. The tension is real: the current script's brace counter can misfire on JSX literals, and both proposals require some carve-out for declarative render bodies. My read of the code — specifically the tag-nested, ternary-heavy JSX in `CalculatorPane.tsx` — is that GPT is right in principle but Fable is right in immediate practice: an AST toolchain is a larger delta than the user probably wants for an initial pass. The pragmatic path is Fable's extension *now*, migrating to ESLint AST rules as a follow-up when the pane files are already smaller and the migration risk is lower. Either way, the exception mechanism (a documented React carve-out for declarative render bodies) must be explicit in the standards doc, not implicit in a lint script.

**On `data-testid` in production**, the disagreement is more important than it looks. Fable treats the `add-meaningful-testids.md` "additive-only" rule as constraint. GPT points out that the helper `testId()` at `client/src/lib/test-utils.ts:1-8` strips its own output in production, so the shipped single-file artifact — which is the deliverable the user names in the requirement — has fewer identifiers than the dev build. GPT also documents that where testids do exist, some are duplicated (`display-category` for every category card at `UnitConverterApp.tsx:243-264`) so the "unique identifier per UI object" standard is broken even in dev. GPT's position is the correct one for satisfying the stated standard: the identifiers must be *in the artifact* the user runs, they must be genuinely unique (dynamic keys in the ID), and the existing "additive-only" rule needs a controlled exception process for renames. The byte cost is trivial against a 460 kB gzip baseline.

**On the XHTML output**, both models agree that renaming `.html` to `.xhtml` is not compliance and that a proper build path requires XML-aware serialization, CDATA-safe inline JS/CSS, and an XML-parse assertion in `verify-build.mjs`. They diverge only on whether to hedge (Fable: ship `.html` but enforce polyglot markup so a rename is trivial) or commit (GPT: pick one contract and build it honestly). This is a decision only the user can make — see §5 recommendations.

### Unique insights worth noting

Fable's identification of the app-shell default-unit table (`UnitConverterApp.tsx:99-125`) extends the data-in-code diagnosis beyond the two hooks: even the top-level orchestration file participates in the violation, embedding a category→default-unit map that has the same shape as the JSON data files it sits next to. Extract it to `client/src/data/conversion/defaults.json` or a similar location and the standards violation becomes a mechanical cleanup rather than a debate.

GPT's dimensional-policy critique — that `sqrt`/`cbrt` silently round odd exponents up and that transcendental functions preserve rather than reject dimensions — is a reminder that "purity" isn't only about testability; it's the difference between a policy the code review can see and a policy hidden inside a 30-case switch. Once these evaluations live in `lib/calculator/evaluateRpnUnary.ts`, a reviewer or a test can ask "what should this return for `sqrt(m³)`?" and get an unambiguous answer.

Fable's discovery of the dead conditional at `CalculatorPane.tsx:534-539` (both `if` and `else` branches identical) is the smallest finding in the report and the most diagnostic: this is exactly what accumulates in a file no linter or test looks at.

### Recommendations

The council's ranked-and-consolidated set of changes is in §5; the executive summary is: **write the standards document, wire the build gate, kill the duplicated RPN and dimension-catalog logic, then split panes.** Do those four and the remaining work becomes mechanical. Do panes-first and the mess gets distributed.

## 5. Consolidated ranked change list

Merged from both council reports and deduplicated. P0 = required to meet stated standards; P1 = required for maintainability at current scale; P2 = quality-of-life.

1. **P0 — Publish `docs/architecture/standards.md`** (`ARCHITECTURE_STANDARDS.md` in this deliverable). Link from `README.md` and `scripts/lint-size.mjs` header so doc and enforcer reference each other. Include the exception template.
2. **P0 — Wire the build gate.** Add `"prebuild"`/`"postbuild"` (or a composed `"build"`) that runs `tsc && lint:size && vitest run && vite build && verify:build`. Reproduce in a GitHub Actions workflow.
3. **P0 — Delete the controller's inline RPN op switches**; import `lib/calculator/applyRpnUnary` and `applyRpnBinary` (`useCalculatorController.ts:454-559`). Fixes the drift already observed. While there, decide the dimensional-policy questions GPT raised (`sqrt` on odd exponents; dimension policy for `exp`/`ln`) with tests.
4. **P0 — Remove the embedded `dimMap`**; import `CATEGORY_DIMENSIONS` from `lib/units/categoryDimensions.ts` (`useCalculatorController.ts:296-338`). Then move that catalog and the `useConverterController.ts:118-160` twin into a single external JSON at `client/src/data/conversion/category-dimensions.json` with a thin loader.
5. **P0 — Decide the HTML-vs-XHTML deliverable question.** Either (a) update the standard to say "single self-contained HTML file, XML-well-formed markup verified" and keep `.html`, or (b) add XML-aware post-build serialization (namespace, `<!ATTLIST>`-safe attributes, CDATA-wrapped inline JS/CSS, no `]]>` in minified JS) and rename to `.xhtml`. Either way, extend `scripts/verify-build.mjs` to *XML-parse* the artifact and fail on any parse error.
6. **P0 — Testids in the shipped artifact.** Remove `testId()`'s DEV-only stripping in `client/src/lib/test-utils.ts:1-8`. Fix duplicate IDs (`display-category` fanout at `UnitConverterApp.tsx:243-264`; mapped buttons in `DirectPane.tsx:191-241`) by requiring a dynamic key segment. Adopt a grammar (`area.object.role[.key]`) and enforce it.
7. **P1 — Use `lib/formatting.ts` in `useConverterController`.** Replace the local `cleanNumber` and `formatNumberWithSeparators` (`:254-374`) with the imports.
8. **P1 — Extract logic from panes.** Move `commitRpnXValue` and the re-expression `useEffect` (`CalculatorPane.tsx:106-191`), the ratio-display JSX math (`ConverterPane.tsx:392-415`) and the comparison-mode IIFE (`:459-511`), and DirectPane's unit-text parse (`DirectPane.tsx:72-84`) into `lib/` functions + controller actions.
9. **P1 — Split `CalculatorPane` into `SimpleCalculatorPane` and `RpnCalculatorPane`.** Do this *after* §8 so the split reflects real UI concerns, not "cut in half at line 600". Also extract `useRpnXEditField` for the focus/blur/committed-text refs.
10. **P1 — Replace the auto-compute effect with a reducer transition.** Eliminate `lastCalcInputsRef` + the dispatch-chain effect (`useCalculatorController.ts:674-713`) with a single `recomputeCalcResult` action powered by a pure `lib/calculator/computeCalcResult.ts`.
11. **P1 — Extend enforcement to features and hooks.** Immediate: extend `lint-size.mjs` to cover `client/src/components/unit-converter/{hooks,state}` and add a `.tsx` file cap (~250 lines) + named-handler cap (~30 lines). Follow-up: migrate to ESLint AST rules (`max-lines-per-function`, `max-lines`) once panes are already smaller.
12. **P1 — Move flow-significant refs into reducers.** `pendingPasteUnitRef`, `converterPasteStatus`, `customPasteStatus` (`useConverterController.ts:210-215`). Leave DOM refs and `setTimeout` handles as refs.
13. **P2 — Move the app-shell default-unit table to JSON** (`UnitConverterApp.tsx:99-125`).
14. **P2 — Consolidate `useAllFlashFlags`** into a single flag-map hook (`useFlashFlag.ts:48-65`).
15. **P2 — Remove the dead conditional** at `CalculatorPane.tsx:534-539` and add a lint rule (or ESLint's `no-dupe-else-if` / a codemod pass) so this class of defect can't accumulate.

## 6. What NOT to change

- `lib/calculator/` and `lib/units/` — one-function-per-file with `rpnOps/` sub-dispatch is exactly the stated standard.
- The reducer/action/selector spine (`state/`, `ConverterContext.tsx`, `useRpnStack.ts`) — small, composed, action-per-file.
- The 76 + 24 JSON data files and the `scripts/vite-plugin-prune-translations.ts` build plugin.
- The exclusion-with-rationale discipline in `lint-size.mjs:33-79` — extend it, don't replace it.
- The gzip-baseline size ceiling in `scripts/verify-build.mjs` — foundational; the XHTML check should bolt on, not replace.
- The `docs/tasks/phase1-6-*.md` refactor history — an unusually good written record; the new standards doc should cite it, not supersede it.
- The iOS-WebKit focus workarounds documented at `CalculatorPane.tsx:84-100,875-945`. Relocate them into a dedicated `useRpnXEditField` hook but preserve the logic and comments verbatim.
