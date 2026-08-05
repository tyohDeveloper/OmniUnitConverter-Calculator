# OmniUnit Architecture & Coding Standards

> **Purpose.** Normative source of the architectural rules OmniUnit is built and reviewed against. Any deviation must be either fixed or documented as an *exception* using the template in §11.
>
> **Location.** Committed at `docs/architecture/standards.md` (proposed). Linked from `README.md` and referenced from the header of `scripts/lint-size.mjs`. When a lint script or verifier fails, the error message should include a section number in this document.
>
> **Version.** 1.7. Extend by pull request; the doc is intended to grow alongside the codebase.
>
> **Change log.**
> - 1.7 — §3.7 enforcement is live: custom ESLint rule `omniunit/no-shape-named-file` at `scripts/eslint-rules/no-shape-named-file.js` rejects files and directory segments named with shape words (`helpers`, `utils`, `misc`, `common`, `shared`, `handlers`, `setters`, `getters`, etc.), hook files named after a shape (`useHelpers`, `useHandlers`), and the bare leaf names `lib`, `index`, `types`. Exception marker: `EXCEPTION [architecture-standards §3.7]` in the first 30 lines. `client/src/lib/utils.ts` (shadcn's `cn()` boilerplate) uses the exception; the community convention outweighs the domain-name benefit. The rule catches only the name-based half of §3.7; the contents-match-name half remains code-review discipline.
> - 1.6 — §3.8 tightened: the rule prohibits re-export statements *anywhere in a file*, not just files that consist entirely of re-exports. A single `export { X } from '...'` (or `export type { X } from '...'`, `export * from '...'`, or `export { X };` where X was imported earlier in the same file) is a re-export line and triggers the rule. Rule renamed `omniunit/no-reexport`; source moved to `scripts/eslint-rules/no-reexport.js`. Rationale: a file that mixes real content with a re-export still laundered the domain of the re-forwarded symbol.
> - 1.5 — §3.8 enforcement is live: custom ESLint rule `omniunit/no-barrel-file` at `scripts/eslint-rules/no-barrel-file.js` rejects any file whose top-level statements are all re-exports. Migration-shim exception recognized via an `EXCEPTION [architecture-standards §3.8]` comment in the first 30 lines.
> - 1.4 — new §3.8 (no barrel files). Files that consist only of re-exports are prohibited; consumers import the specific file that owns each symbol. Barrels launder domain boundaries (§3.7), multiply refactor cost, hide overloaded-consumer smells, and risk defeating tree-shaking. Tightens §3.7 (removed the earlier carveout that permitted `helpers.ts` at the leaf of a well-named directory — the leaf must still describe its own responsibility).
> - 1.3 — new §3.7 (file and directory naming for responsibility). Files and directories must be named for the domain they own, not for a technical shape ("helpers", "setters", "handlers"). Directories drift when they accumulate outliers; the drift must be corrected by rename, split, or move. Emerges from the reducer/hook extraction pass — the pattern was doing real work but a few of the files were named on convenience rather than responsibility.
> - 1.2 — new §15 (locale data and treatments): supported languages matrix, per-domain file layout, dead-key guard, global-name-uniqueness rule for unit-name keys, prune-translations build behavior, source-citation practice, RTL and numeral-system rules.
> - 1.1 — §4 rewritten to match the `{role}-{area}-{name}[-{key}]` grammar the codebase already uses; §7 names ESLint + typescript-eslint as the AST toolchain (dev-only, zero bundle impact); §8 rewritten to "ship `.html` that meets XHTML markup rules"; new §13 (libraries over home-built code, with a size/complexity budget) and new §14 (final artifact minimization).
> - 1.0 — initial.

---

## 1. The four-layer model

The application is split into exactly four layers with a strict dependency direction. A layer may import from layers *below* it. No layer may import from layers above it.

```
┌──────────────────────────────────────────────────────────┐
│  UI / VIEW           (React components — JSX only)       │  client/src/features/**/*.tsx
│                                                          │  client/src/components/{help-section,sources-section}.tsx
├──────────────────────────────────────────────────────────┤
│  APPLICATION CONTROLLER   (hooks: effects, dispatch,     │  client/src/components/unit-converter/hooks/**
│                            focus, timers, clipboard)     │  client/src/features/unit-converter/app/UnitConverterApp.tsx
├──────────────────────────────────────────────────────────┤
│  STATE               (reducers + actions + selectors)    │  client/src/components/unit-converter/state/**
│                       React context that composes them   │  client/src/components/unit-converter/context/**
├──────────────────────────────────────────────────────────┤
│  PURE FUNCTIONS      (side-effect-free domain logic)     │  client/src/lib/**
├──────────────────────────────────────────────────────────┤
│  DATA                (JSON, no code)                     │  client/src/data/**
└──────────────────────────────────────────────────────────┘
```

**Rule 1.1.** JSX may render state and call controller-returned callbacks. It **must not** compute domain results, parse unit-bearing text, format numbers for locale, or perform dimensional arithmetic inline. Ratio displays, comparison rows, and re-expression math belong in `lib/` + a controller action, not in a render body or IIFE.

**Rule 1.2.** Controller hooks may sequence effects, hold ephemeral DOM refs and timer handles, dispatch reducer actions, and call pure functions. They **must not** implement arithmetic, dimensional policy, formatting algorithms, or unit-text parsing.

**Rule 1.3.** Reducers and their action creators are pure. Selectors are pure. No `setTimeout`, `fetch`, DOM access, or `Math.random` in any of them.

**Rule 1.4.** Pure-function files (`client/src/lib/**`) have no React imports, no `document`/`window` access, no `Date.now()`, and no mutation of their inputs. Given the same input they must return the same output.

**Rule 1.5.** All application data — conversion factors, category groupings, dimensional formulas per category, default units per category, unit translations, UI strings — lives in `client/src/data/**` as JSON. If a table has more than five entries or is likely to change independently of code, it is data and belongs in JSON.

**Rule 1.6 — Pure computation is single-sourced in `lib/`.** Any calculation, transformation, or formatting operation is a pure function in `client/src/lib/**`. Views, controllers, reducers, and other pure helpers all reach the same result by calling the same function; they do not reimplement it.

This rule is the operational consequence of §1.1, §1.2, and §1.4 at the grain of a single computation. Those higher rules say *where* computation may not live (JSX bodies, controller hooks, effect callbacks); this rule says *how* to satisfy them when the same computation is needed in more than one place: lift it, name it, and import it.

A "computation" for this rule includes any of:

- arithmetic on numeric values (unit conversion, prefix adjustment, dimensional reduction)
- symbol / string composition driven by domain rules (unit-symbol assembly, dimensional-formula rendering, locale-aware number formatting)
- classification or lookup against domain tables (category resolution, prefix eligibility, canonical-unit selection)
- structural transforms on domain objects (composing display records, normalizing calc values, mapping dimensional formulas)

UI-only structural work — className strings, `motion` prop bags, ARIA-label assembly, JSX composition — is not a "computation" and stays in the view.

**When a computation appears in two or more places** — whether across layers (component + hook), across sibling files at the same layer (two hooks, two components), or across call sites within one file — it is a duplication and must be extracted to `lib/`. The extracted function is imported by every call site; no call site reimplements the formula. The single exception is when two call sites *intentionally* implement different formulas for the same domain concept (e.g. the simple-mode field display currently uses `siValue / kgResult.effectivePrefixFactor` while the RPN result display uses `siToDisplay` for the same conceptual step); in that case the *shared* portion of the formula is still extracted, the *divergent* portion is called out in comments at both sites, and the divergence itself is a §11 exception with an owner and a resolution plan.

**When a formula is used exactly once today** but would be a candidate for reuse under a plausible near-term change (e.g. a new mode, a new pane, or a new export target), extraction is still preferred — the naming discipline of §3.7 is worth more than the one indirection saved. Extraction is only skipped when the computation is truly view-local and cannot recur elsewhere (e.g. "compute the CSS class string for this button's flash state").

**Verification.** A candidate for extraction can be identified with `git grep` for the operative call (e.g. `applyPrefixToKgUnit`, `formatDimensions`, `siToDisplay`) — three or more call sites that all follow the same 3-5 line prelude before diverging is the signal. Review-time question: "If I fix a bug in this formula, how many files do I have to change?" The answer must be "one."

**Runtime-dependency selection is single-sourced too.** When a third-party library provides a runtime capability that has multiple possible implementations — e.g. a polyfill vs. a native browser API vs. an alternative library — the *choice* of which implementation the app uses is itself a single-source decision. Introduce one file under `lib/` whose only job is to re-export the chosen binding under an app-owned import path. Every consumer imports from that file; no consumer imports the underlying library directly, and no consumer references `window.<X>` for a browser-native equivalent. This makes migrations to a different implementation a one-line change to the source-selection file, and keeps consumers unaware of the runtime backing. Example: `client/src/lib/temporal/temporal.ts` re-exports `Temporal` from `temporal-polyfill`; when native browser Temporal is mature and ubiquitous, that file's implementation switches without any consumer file changing. Source-selection files are the one legitimate use of the re-export pattern that §3.8 forbids for barrels, and require an `// EXCEPTION [architecture-standards §3.8]:` comment naming the migration plan.

---

## 2. Mutable state discipline

State is one of five classes. Each class has exactly one legal home.

| Class | Definition | Legal home | Examples |
|---|---|---|---|
| **Durable domain state** | Values a test would want to assert on; anything that survives a mode/tab switch or affects results | Reducer | selected units, category, calc field values, RPN stack, precision, locale |
| **Transient UI state** | Short-lived visual state (< ~1 s) with no domain meaning | Reducer *or* controller-owned `useState`, documented in the hook's header | flash flags, "paste succeeded" pulses |
| **Ephemeral UI mechanics** | Focus targets, blur-suppression flags, committed-text guards, animation-frame IDs | `useRef` inside the hook or view that owns the widget | `rpnXInputRef`, `suppressXBlurRef`, `enterCommitKeepFocusRef` |
| **Effect resources** | Timer handles, subscriptions, `AbortController`s | `useRef`; cleaned up in the effect's teardown | `setTimeout` IDs |
| **Flow-significant memory** | A value the *next* action depends on — encodes pending domain intent | Reducer (typed field + action) | pending paste-across-category target |

**Rule 2.1.** No `useState` in the top-level app controller (`UnitConverterApp.tsx`) for a concept that already exists in a reducer.

**Rule 2.2.** No `useRef` for a value that determines a later domain decision. Such values are reducer state, not invisible memory. Timer IDs and DOM handles are the exception.

**Rule 2.3.** Setters in reducer-adapter hooks dispatch action creators, never raw action literal objects.

---

## 3. Function and file granularity

**Rule 3.1 — Function length.** Every exported function body is ≤ **20 lines**, excluding the signature and closing brace. When a natural function is longer, first refactor by extracting a helper; only if the helper has no external reuse may it remain in the same file as a purely-local function.

**Rule 3.2 — One export per file.** `client/src/lib/**` files export at most one `function` or `const` that is either a function or a function-producing factory. Exceptions require a comment citing this section and giving a reason. See `scripts/lint-size.mjs:33-79` for the current, approved exception list — that pattern is the model to follow.

**Rule 3.3 — File length (pure-function files).** Files under `client/src/lib/calculator/**` and `client/src/lib/units/**` are ≤ **100 lines**. Files elsewhere in `lib/` are ≤ **150 lines**.

**Rule 3.4 — File length (controller hooks).** Files under `client/src/components/unit-converter/hooks/**` are ≤ **150 lines**. A hook longer than this is either doing pure work (extract to `lib/`) or coordinating too many domains (split by domain).

**Rule 3.5 — File length (React components — the JSX exception).** `.tsx` view files are ≤ **250 lines**. Component *event handlers, effects, IIFEs, and named callbacks* still obey Rule 3.1 (20 lines). Declarative JSX render bodies are the only place where a function body may exceed 20 lines, and only up to a component-level cap of **80 lines** of JSX in the return statement. This is a deliberate carve-out, not a hole.

**Rule 3.6 — Exception rationale.** Every file that is excluded from any of the above rules must carry a comment explaining *why* and referencing the section of this document that permits it. The comment format is:

```ts
// EXCEPTION [architecture-standards §3.2]: type-and-function co-location.
// `NormalizedMassUnit` is a discriminated-union type that cannot be re-exported
// from a separate `.d.ts` and be tree-shaken in the same way; keeping it with
// its constructor is a deliberate trade-off.
```

**Rule 3.7 — Files and directories are named for the responsibility they own, not for a technical shape.** The reader must be able to guess whether a change belongs in a given file from the file name alone. This has two consequences:

1. **Prefer domain names over shape names.** `useLocaleHelpers`, `useRpnXEditField`, `applyPushValue`, `parseDirectEntry`, `computeConversion` all name the thing they own. `useConverterHelpers`, `useSetters`, `useHandlers`, `utils`, `misc`, `common` name a shape ("a bag of helpers", "a bag of setters") and are prohibited by default. Even leaf files named `helpers.ts` or `common.ts` inside an otherwise-well-named directory are prohibited — the leaf name still has to describe its own responsibility, not just inherit context from the directory.

2. **Directories name domains, not layers.** `lib/formatting/` should contain formatters. If it starts to accumulate parsers, sanitizers, or IO glue, the directory has drifted — either rename it (`lib/text/`), split it (`lib/format/` + `lib/parse/`), or move the outliers to a directory whose name matches their responsibility. The check: given a bug report of the form "the DMS parser drops the sign when the seconds field is empty", does a new contributor know where to look? If the answer is "maybe `lib/formatting/`, but also possibly `lib/units/`, and it turns out to be in `lib/formatting/parseDMS.ts`", the directory naming is failing rule 3.7 and needs adjustment.

When an extraction produces a file whose responsibility genuinely doesn't fit any existing directory, add a new directory rather than dropping it in the closest-looking one. When splitting a large hook or component, split along the responsibilities that already exist in the code ("this group of callbacks all touch the clipboard", "this group all reformats the input field"), not along technical predicates ("everything that uses `useCallback`", "everything that dispatches"). Technical groupings are permitted only when the domain grouping is genuinely unavailable, and require an `EXCEPTION [architecture-standards §3.7]` comment naming the specific reason the domain grouping did not apply.

**Enforcement.** A custom ESLint rule at `scripts/eslint-rules/no-shape-named-file.js` (registered under the local `omniunit` plugin) enforces the name-based half of this rule. It rejects files whose base name is a bare shape word (`helpers`, `utils`, `misc`, `common`, `shared`, `handlers`, `setters`, `getters`, `stuff`, `things`, `lib`, `index`, `types`), hook files named after a shape (`useHelpers`, `useHandlers`, `useSetters`, etc.), and any path containing a directory segment that is a shape name. Files carrying an `EXCEPTION [architecture-standards §3.7]` comment in their first 30 lines are permitted — the codebase currently uses this for `client/src/lib/utils.ts` (shadcn/ui's boilerplate `cn()` helper, whose `@/lib/utils` path is the community convention).

The rule cannot check the *contents-match-name* half of §3.7 — deciding whether `parseDMS.ts` belongs in `lib/parsing/` requires knowing what parsing is, which is a code-review conversation, not an AST check. That half remains a review-time discipline; the rule catches only the obvious naming failures.

**Rule 3.8 — No barrel files.** A file that consists only of re-exports (`export { X } from './x'; export { Y } from './y';`) is prohibited. Consumers import the specific file that owns each symbol.

Rationale:

1. **Barrels launder domain boundaries.** A consumer that writes `from '@/lib/calculator'` does not have to think about whether `formatDimensions` is calculator-domain, unit-symbol-domain, or dimensional-algebra-domain. That is exactly the question §3.7 exists to force people to answer. A barrel that re-exports across multiple `lib/*/` subdirectories — which is where they tend to grow into — defeats the domain check by construction.

2. **Barrels multiply refactor cost.** Moving a file from `lib/foo/` to `lib/bar/` should update the file's own import statements and the direct import sites. A barrel doubles the update surface: the file has to be updated in the barrel too, and if the barrel is stale it silently keeps the old path working.

3. **Barrels are usually a signal of overloaded domains.** As §3.1/3.2 push files toward one export apiece, the demand for barrels drops naturally. When someone reaches for a barrel it is usually because their consumer imports 8-10 things from 8-10 files, which itself is a signal that the consumer is coordinating too many domains and should be split.

4. **Barrels can defeat tree-shaking.** Vite and Rollup handle most barrel patterns, but a barrel with any side-effecting import drags its whole graph into the bundle. Every barrel is one broken assumption away from silent bloat.

Exceptions:

- A file that re-exports a **single** symbol as a compatibility shim during a migration is permitted, but must carry an `EXCEPTION [architecture-standards §3.8]` comment naming the migration and the date by which the shim will be removed. "During a migration" means "a migration that is actively in progress"; a shim older than the migration that produced it is dead code and must be removed.
- A file that re-exports a **single** symbol as a runtime-dependency source-selection shim (per §1.6, "runtime-dependency selection is single-sourced too") is permitted, and must carry an `EXCEPTION [architecture-standards §3.8]` comment naming the choice and the migration plan for switching to a different implementation later. Example: `client/src/lib/temporal/temporal.ts` re-exports `Temporal` from `temporal-polyfill`; the migration plan is "switch to native `window.Temporal` when the browser matrix supports it." Source-selection shims have no fixed removal date because the migration is contingent on external browser support, not internal code changes.
- The public entry-point of a published npm package (`package.json#main`) is a barrel by convention. This codebase is a single-file HTML artifact, not a published package, so this exception does not currently apply here.

**Enforcement.** A custom ESLint rule at `scripts/eslint-rules/no-reexport.js` (registered under the local `omniunit` plugin) enforces this. The rule flags every re-export statement:

- `export { X } from '...'`
- `export type { X } from '...'`
- `export * from '...'` (and `export * as ns from '...'`)
- `export { X };` where X was introduced by an `ImportDeclaration` in the same file — the import-then-re-export pattern is a re-forward with no `from` clause, and has the same drift risks as a barrel line

Files carrying an `EXCEPTION [architecture-standards §3.8]` comment in their first 30 lines are permitted for the migration-shim case above.

---

## 4. UI-object identifiers

**Rule 4.1 — Coverage.** Every interactive primitive rendered in the shipped artifact carries a stable, unique identifier. An interactive primitive is any element with `onClick`, `onValueChange`, `onCheckedChange`, `onChange`, `onSubmit`, `role="button"`, or that renders through `<Input>`, `<Select>`, `<Switch>`, `<Button>`, `<Tabs*>`, `<Checkbox>`, `<Slider>`, or `<Toggle>`. Read-only display widgets that a test needs to assert on (result readouts, computed factor displays, stack registers) also carry an identifier.

**Rule 4.2 — Identifier grammar.** IDs are set via `data-testid` and follow the hyphen-separated grammar the codebase already uses:

```
{role}-{area}-{name}[-{key}]
```

- **role** — what kind of widget it is. One of: `button`, `select`, `input`, `display`, `text`, `switch`, `checkbox`, `slider`, `panel`, `backdrop`, `tab`.
- **area** — which pane or region it lives in. One of: `converter`, `calc` (simple calculator), `rpn`, `custom` (direct pane), `app`, `help`, `sources`, `comparison`. Omit when the widget is truly app-wide (e.g. `button-swap`).
- **name** — the specific widget's purpose: `unit`, `prefix`, `precision`, `multiply`, `sqrt`, `undo`, `clear`, `swap`, `x-input`.
- **key** — **required** whenever the widget is generated inside a `.map()` or list. Use the underlying domain key (unit id, category id, dimension symbol), never the array index.

Examples that match current source:
- `button-swap`, `button-clear-calculator`, `button-clear-rpn`
- `select-from-unit`, `select-from-prefix`, `select-calc-precision`
- `rpn-x-input`, `text-rpn-x-value`, `rpn-x-field`
- `button-rpn-undo`, `button-rpn-sqrt`, `button-op1-multiply`
- `input-value`, `display-result`, `panel-help`, `backdrop-sources`

Examples that require the `{key}` segment:
- `display-category-length`, `display-category-mass` (currently a single duplicated `display-category` at `UnitConverterApp.tsx:252` — must be fixed)
- `button-custom-exp-mass--2`, `button-custom-exp-length-1` (this pattern is already correct via `testId(\`custom-exp-${unit}-${exp}\`)` at `DirectPane.tsx:217`)

**Rule 4.3 — Uniqueness.** Every `data-testid` value in a rendered DOM tree is unique. A Vitest rendered-DOM test asserts no duplicate values per pane and per full app render. `verify-build.mjs` additionally scans the shipped artifact and fails if any `data-testid` value appears more than once. Category cards, list items, and generated buttons include the domain key in the ID (Rule 4.2).

**Rule 4.4 — Production retention.** Identifiers are part of the deliverable's testability contract. The build **must not** strip `data-testid` attributes from the production single-file artifact. Concretely, `client/src/lib/test-utils.ts` — which today returns `{}` in non-DEV builds — must return `{ 'data-testid': id }` in every environment. Bundle-size cost is measured, not estimated: for the current ~80 IDs the pre-gzip delta is under 3 kB and the post-gzip delta is under 500 bytes against a 460 kB baseline, comfortably below the §13.2 runtime budget.

**Rule 4.5 — Domain metadata attributes coexist.** `data-*` attributes carrying domain metadata (e.g. `data-category-id={cat.id}` at `UnitConverterApp.tsx:253`) are permitted and encouraged alongside `data-testid`. They answer different questions — *which instance am I* vs. *what role do I play in the test harness* — and tests may query by either.

**Rule 4.6 — Additive-only, with a rename process.** New IDs are additive; existing IDs are not silently renamed. Corrective renames (e.g. de-duplicating `display-category`) go through a "rename manifest" PR whose body lists every old → new mapping and updates every consumer (tests, docs, external harnesses) in the same change. A rename PR that leaves a consumer un-updated fails CI.

**Rule 4.7 — Enforcement.** Three layered checks:
1. **ESLint rule** — flags any interactive primitive (Rule 4.1) lacking `data-testid`. Runs on `client/src/**/*.tsx`.
2. **Rendered-DOM Vitest** — asserts uniqueness per pane and app-wide (~30 lines, added to `tests/`).
3. **Artifact scan in `verify-build.mjs`** — counts `data-testid` attributes in `dist/public/index.html` against a committed `testid-manifest.json`. A drop below the manifest count fails the build; an increase requires updating the manifest in the same PR (the additive rule from 4.6, made mechanical).

---

## 5. Data-external rule

**Rule 5.1.** No table of domain values (conversion factors, unit metadata, category groupings, dimensional formulas per category, default unit per category, RPN button layout data) may live as a literal in a `.ts`/`.tsx` file that is not itself in `client/src/data/**`.

**Rule 5.2.** JSON in `client/src/data/**` is validated at build time (Zod schema or a `json-integrity.test.ts`-style fixture test). New categories require a schema update in the same PR.

**Rule 5.3.** A single source of truth per fact. If the same table appears in two files, one must be deleted and the other imported. The current `dimMap` (in `useCalculatorController.ts`) vs `CATEGORY_DIMENSIONS` (in `lib/units/categoryDimensions.ts`) situation is the reference example of the violation.

---

## 6. Build-time gating

**Rule 6.1 — Every rule in this document is enforced by a script or a test that runs on `npm run build`.** If a rule is not enforceable, it does not belong in this document.

**Rule 6.2 — Required build sequence:**

```json
"scripts": {
  "check": "tsc --noEmit",
  "lint:size": "node scripts/lint-size.mjs",
  "test:run": "vitest run",
  "test:e2e": "playwright test",
  "build:bundle": "vite build",
  "verify:build": "node scripts/verify-build.mjs",
  "build": "npm run check && npm run lint:size && npm run test:run && npm run build:bundle && npm run verify:build"
}
```

`npm run build` therefore runs typecheck, size lint, unit tests, bundling, and output verification in order and fails on the first error. E2E is a separate release gate (Playwright against the built `file://` artifact) so bundler iteration stays fast.

**Rule 6.3 — CI.** A GitHub Actions workflow runs `npm ci && npm run build` on every PR, then `npm run test:e2e` as a separate job. Both jobs must be green to merge.

**Rule 6.4 — Baseline updates require review.** `scripts/build-baseline.json` is committed. Updating it is a normal reviewed PR, never an automated bump. The current 5% gzip-regression headroom pattern is the model.

---

## 7. Enforcement mechanics

The rules above are enforced by two AST-based checkers plus the existing artifact verifier. This is preferred to one "smart" checker because scope is the only defense against silent regressions.

| Check | Tool | Scope |
|---|---|---|
| Function length, file length, exported-function count, testid coverage on interactive primitives | ESLint + `typescript-eslint` (`max-lines-per-function`, `max-lines`, custom rules) | `client/src/**/*.{ts,tsx}` |
| Bundle validity, XHTML markup well-formedness, size ceiling, testid uniqueness and manifest count, external-URL scan | `scripts/verify-build.mjs` | Built artifact only |
| Legacy transition (temporary) | `scripts/lint-size.mjs` | `client/src/lib/**` — retained until ESLint owns all rules across `client/src/**`; then deleted |

ESLint is a **devDependency only**. It is not imported by application code, is not seen by Vite's dependency graph, and adds zero bytes to the shipped single-file artifact. The dev install adds ~30 MB to `node_modules`, comparable to `typescript`, `vitest`, and `playwright` which are already tolerated. See §13 for the general library-adoption rule.

**Rule 7.1 — Prefer AST parsing over regex parsing.** Any linter or codemod that inspects `.ts`/`.tsx` files uses the TypeScript AST (via `@typescript-eslint/parser` or the TypeScript compiler API). Regex or brace-count parsers are permitted only for `.json`, `.md`, and the built HTML/XHTML artifact.

**Rule 7.2 — Exclusion with rationale.** Every file excluded from any check must carry a `// EXCEPTION [architecture-standards §<n>]:` comment (§3.6) or an entry in `.architecture-exceptions.json` with owner and expiry (§11). The current exclusion list in `scripts/lint-size.mjs:33-79` is the reference pattern until it is migrated to ESLint `overrides`.

**Rule 7.3 — No rule is enforced only by convention.** If a checker cannot express a rule today, the rule is captured as an ESLint rule plan, a `TODO(architecture-standards §N)` marker, or a targeted test that fails when violated.

---

## 8. Single-file offline deliverable — HTML with XHTML-conformant markup

**Rule 8.1 — One artifact.** The build produces exactly one file that opens from `file://` with no network, no server, and no additional assets, on any modern desktop or mobile browser. Fonts, images, styles, and code are inlined.

**Rule 8.2 — Output contract.** The shipped file is **`dist/public/index.html`** and is served/opened as HTML (`text/html`). The *markup inside it* additionally meets modern XHTML rules so the artifact is polyglot — the same bytes would also parse as XHTML if renamed and served as `application/xhtml+xml`. Concretely:

- `<!DOCTYPE html>` at the top; UTF-8 encoding declared via `<meta charset="UTF-8"/>`.
- Every void element self-closed (`<br/>`, `<meta …/>`, `<link …/>`, `<img …/>`, `<input …/>`).
- All attribute values quoted; all element and attribute names in lower case.
- Elements properly nested and explicitly closed; no reliance on HTML's implicit optional-close rules for `<li>`, `<p>`, `<option>`, etc.
- No boolean-attribute shorthand (`<input disabled="disabled"/>`, not `<input disabled/>`) — this is the one place polyglot markup diverges from idiomatic HTML5; the XHTML rule wins here.
- Inline `<script>` and `<style>` bodies must be free of literal `<` and `&` characters, or wrapped in `//<![CDATA[ … //]]>` (JS) / `/*<![CDATA[*/ … /*]]>*/` (CSS). The minifier must not emit the literal sequence `]]>` inside such blocks.
- No inline HTML comments (`<!-- … -->`) inside `<script>` or `<style>` bodies.
- No attributes or values that a strict XML parser would reject.

The artifact is **not** given an `.xhtml` extension and **not** served with an XHTML MIME type. This preserves HTML's forgiving parser for end users while guaranteeing the markup would survive strict XML parsing. If a future consumer needs true `application/xhtml+xml` service, the change is a rename plus an XML declaration prepend — no source changes.

**Rule 8.3 — Build-time verification.** `scripts/verify-build.mjs` extends its existing checks with:

1. Parse the artifact with a strict XML parser after (temporarily) prepending `<?xml version="1.0" encoding="UTF-8"?>`. Any parse error fails the build.
2. Assert no `src=`, `href=`, `url(…)`, `@import`, or `import(…)` reference points to an external URL. `http://`, `https://`, and protocol-relative `//` URLs are rejected; `data:` URIs for inlined fonts/images are permitted.
3. Assert exactly one file exists in `dist/public/` after build.
4. Assert the artifact's `data-testid` count meets or exceeds the committed `testid-manifest.json` (§4.7).
5. Assert every `data-testid` value in the artifact is unique (§4.3).

**Rule 8.4 — Minification.** See §14 for the required final minimization pass and the acceptance criteria it must satisfy without breaking Rule 8.2.

---

## 9. Testing

**Rule 9.1 — Every exported pure function has at least one unit test.** Coverage is verified by scanning `client/src/lib/**` for exports and asserting a matching test exists.

**Rule 9.2 — Every reducer has transition tests for every action type.** The `tests/reducers.test.ts` pattern is the model.

**Rule 9.3 — Every user-visible flow has an e2e test.** Converter, RPN calculator, simple calculator, direct pane, smart paste, locale switch.

**Rule 9.4 — Tests are part of the build.** See Rule 6.2.

---

## 10. Deprecation and removal

**Rule 10.1.** Duplicated logic is a defect, not a style violation. When two implementations of the same domain rule exist, the one that violates the layer model is deleted; the caller imports the compliant version. The current `applyRpnUnary`/`applyRpnBinary` situation is the reference example.

**Rule 10.2.** Dead branches (identical `if`/`else`, unreachable defaults, unused exports) are removed on sight. A CI check runs a "dead branch" scan (e.g. `eslint no-dupe-else-if`, `ts-prune`) at build time.

---

## 11. Exception template

When a rule genuinely cannot be met, capture the exception at the top of the file. Exceptions expire — every one has an owner and an expiry date after which CI fails until the exception is renewed or removed.

```ts
// EXCEPTION [architecture-standards §<section>]: <one-line reason>.
// Owner:    @<github-handle>
// Approved: <YYYY-MM-DD> in PR #<n>
// Expires:  <YYYY-MM-DD>
// Renewal:  <what would allow this exception to be removed>
```

The `scripts/lint-size.mjs:33-79` exclusion list is a working example of the rationale-with-owner pattern in text form; formalize it into a machine-checkable `.architecture-exceptions.json` (owner, expiry, section) so exceptions can time out.

---

## 12. Change process

- This document lives at `docs/architecture/standards.md`. Changes are ordinary PRs and require the same review discipline as code changes.
- When a standard changes, the enforcing checker changes in the same PR. A standard is not "adopted" until the checker fails on a violation.
- Historical refactor context is in `docs/tasks/phase1-contracts-and-types.md` … `phase6-dedup-and-cleanup.md` and `docs/tasks/orchestration-layer-extraction.md`. This document supersedes their normative statements but does not delete them — they remain the record of *how the codebase got here*.

---

## 13. Libraries vs. home-built code

**Rule 13.1 — Prefer a known-good library over hand-rolled code**, subject to the budget in Rule 13.2. "Known-good" means: actively maintained (release in the last 12 months), broadly adopted (>100k weekly npm downloads or clearly the canonical implementation in its niche), and using a permissive license (MIT/BSD/Apache-2.0/ISC). This rule applies to build-time tooling *and* application code.

**Rule 13.2 — Size and complexity budget.** Every library adoption must be evaluated against the ceilings below. A library that exceeds any ceiling needs an explicit exception (§11).

| Where the library runs | Shipped-bundle gzip cost | Notes |
|---|---|---|
| **Dev / build only** (linters, test runners, bundlers, minifiers, type checkers) | **0 bytes** — hard rule | Verified by §8.3 external-URL scan and the gzip baseline: no dev-only package may enter the Vite entry graph. |
| **Runtime application code** (imported by `client/src/**`) | **≤ +5 kB gzip** for a single new library; **≤ +20 kB gzip** cumulative per release | Enforced by the gzip-baseline delta in `scripts/verify-build.mjs`. A library over the single-library limit needs a §11 exception with measured before/after gzip numbers. |

**Rule 13.3 — Ecosystem-standard exception.** A library that is the *canonical* implementation in its category (ESLint, TypeScript, Vitest, Playwright, Vite, React) is presumed compliant with Rule 13.1. "Canonical" is a high bar — being popular is not enough; it must be the tool the rest of the ecosystem's tools assume you use.

**Rule 13.4 — Prefer libraries that shrink existing code.** When choosing between two libraries, prefer the one whose adoption lets you delete more application code. A library that replaces 200 lines of hand-rolled parsing with a 2 kB gzip import is a net win even if a smaller library would technically fit.

**Rule 13.5 — Reject libraries that duplicate a stack primitive.** If React, Vite, or TypeScript already provide the capability, do not add a library for it. This rule catches "utility library sprawl" (`lodash`, `date-fns`, `moment`, etc.) — the `code-hygiene-cleanup.md` task documents exactly this failure mode.

**Rule 13.6 — Dev-tool adoption is not free even at 0 bytes shipped.** New devDeps cost install time, `node_modules` disk, and CI cache size. A dev-only tool must justify itself against those costs *and* against the checker/rule/output it replaces or enables (§7, §14).

**Rule 13.7 — Document adoptions.** When a new library is added, note it in the PR body with (a) the gzip cost measured against the current baseline, (b) the code it replaces or capability it enables, and (c) which §7 or §14 rule it participates in enforcing (if applicable).

---

## 14. Final artifact minimization

**Rule 14.1 — Mandatory final pass.** `npm run build` ends with a minimization step that operates on the output of `vite build` and produces the shipped artifact at `dist/public/index.html`. The step runs *after* `vite build` and *before* `verify:build`, so verification always sees the final bytes the user will download.

**Rule 14.2 — Minimum acceptance criteria.** The minimized artifact must:

- Remove all HTML comments except the single `<!DOCTYPE html>` line (Vite's minifier already handles most; enforced by `verify-build.mjs`).
- Remove all inter-tag whitespace that is not semantically significant, without collapsing whitespace inside `<pre>`, `<textarea>`, `<script>`, or `<style>`.
- Remove all `/*! … */` license-preservation block comments from inlined JS (already enforced by `verify-build.mjs:67-76`).
- Remove all `/* … */` and `//` comments from inlined JS and CSS, except any `//<![CDATA[` / `//]]>` wrappers required by Rule 8.2.
- **Preserve every `data-testid` attribute** (§4.4). Minifiers that offer attribute-stripping options must have this disabled.
- **Preserve XHTML-conformant markup** (§8.2) — the minifier must not "optimize" `<br/>` to `<br>`, drop attribute quotes, or lowercase-collapse boolean attributes.
- Not increase gzip size relative to the un-minimized `vite build` output.

**Rule 14.3 — Chosen minimizer.** The minimizer must be a known-good library (§13) with active maintenance and demonstrated support for the XHTML-conformant options in Rule 14.2. The current baseline is **`html-minifier-terser`** with configuration `{ collapseWhitespace: true, removeComments: true, minifyCSS: true, minifyJS: false, keepClosingSlash: true, caseSensitive: true, useShortDoctype: false, decodeEntities: false }`. `minifyJS` is false because Vite/esbuild has already minified JS; running Terser again would strip the CDATA wrappers from Rule 8.2 without a custom parser configuration.

**Rule 14.4 — Evaluate alternatives on measured performance, not defaults.** Any change of minimizer must be justified with a measured before/after on the current bundle: gzip size, minification wall-clock time, and a byte-level diff of the output artifacts run through the XHTML verifier of Rule 8.3. A minimizer that produces a smaller artifact but breaks Rule 8.2 or Rule 4.4 is rejected. Candidates worth evaluating when the current minimizer is limiting:

- **`@swc/html`** — Rust-based, typically 5–20× faster than `html-minifier-terser`; needs verification that its CDATA and self-closing behavior meets Rule 8.2.
- **`lightningcss`** — for the inlined CSS only, if the CSS minification step becomes the bottleneck.
- **Custom post-processing chain** (Vite's built-in minifier + a targeted XML-safe pass) — permitted only if benchmarked to beat every off-the-shelf option and reviewed against §13.

**Rule 14.5 — Benchmark cadence.** Re-benchmark the minimizer at least once per major-version release, or whenever the raw bundle grows by more than 10%. Record measurements in `scripts/build-baseline.json` alongside the gzip baseline.

**Rule 14.6 — Escape hatch.** `npm run build:fast` skips the final minimization pass for local iteration. This target must not be usable to produce a release artifact — `verify:build` fails on any output that is not fully minimized.

---

## 15. Locale data and treatments

OmniUnit ships in 12 languages and must render numbers, units, and directional layout correctly in each. This section makes the locale-data rules explicit so contributors can add or update a language without archaeology.

### 15.1 Supported languages

The canonical list lives at `client/src/lib/localization.ts` as `SUPPORTED_LANGUAGES`. Today: `en`, `en-us`, `ar`, `de`, `es`, `fr`, `it`, `ja`, `ko`, `pt`, `ru`, `zh`.

**Rule 15.1.** Adding a language means adding a locale code to `SUPPORTED_LANGUAGES` **and** adding both a `ui/<code>.json` and a `units/<code>.json` file with the full key coverage of `en.json` (missing keys will fall through to English by §15.4). Removing a language means removing all three in the same PR.

**Rule 15.2.** `en` is the fallback locale. Every UI string and every unit-name key that any code path can reach must exist as a key in `data/localization/ui/en.json` or `data/localization/units/en.json`. The fallback chain in `client/src/lib/translateUi.ts` and `translateUnit.ts` is `requested locale → en → the raw key`; nothing further.

**Rule 15.3.** Regional variants (currently `en-us`) contain **only the delta** from the base variant. `en-us.json` files should hold spellings that differ from `en` (e.g. `meter` vs `meter`, `liter` vs `litre`) and nothing else. The runtime does the merge; storing duplicates bloats the bundle.

### 15.4 File layout and translation domains

Locale data lives under `client/src/data/localization/` in two domains:

- `ui/<code>.json` — all user-visible interface strings (button labels, tooltips, help copy, error messages, category and dimension names shown in chrome).
- `units/<code>.json` — unit *display names* only (e.g. `"meter": "mètre"`). Unit **symbols** are never translated — they remain in their SI/international form regardless of locale.

**Rule 15.4.** No third translation domain is introduced without a standards-doc amendment. If a new class of translated string appears, it belongs in one of these two files.

**Rule 15.5.** JSON key sets are shape-identical across locales *before* the prune step (§15.7). A locale file that adds a key not present in `en.json`, or omits a key present in `en.json`, is a bug — caught by `tests/json-integrity.test.ts` and by a schema check in the build.

### 15.6 Global name uniqueness (unit-name keys)

Unit display names are **global** — the same key resolves to the same translation everywhere it appears, regardless of which category the unit lives in. This is a deliberate design decision recorded in `.agents/memory/translation-key-hygiene.md`.

**Rule 15.6.** Two units in different categories must not share the same English display name. When a collision would otherwise occur, disambiguate the later entrant with a parenthetical qualifier in the name field of its conversion JSON — e.g. mass `"Dan (China)"` vs volume `"Dan (China, Volume)"`. The parenthetical is part of the name and translates as a whole.

**Rule 15.7 — Dead-key guard.** Every key in every `units/<code>.json` must correspond to (a) a current unit name in the conversion JSONs, (b) a title-cased `baseUnit` value, (c) a key referenced by application code via `translateUi()`/`translateUnit()`/`t()`, or (d) a prefix-generated display name. The `"no dead keys"` test in `tests/json-integrity.test.ts` enforces this against an explicit allowlist. Rationale: renames in conversion data have historically left ~120 orphaned keys duplicated across 12 locale files, bloating the bundle silently.

**Rule 15.8 — Renames and removals.** When a unit is renamed or removed, its old translation key is removed from all 12 `units/<code>.json` files in the same PR. When a new code-referenced or prefix-generated translation key is added, its entry in the dead-key guard's allowlist is added in the same PR.

### 15.9 Build-time prune (bundle size)

`scripts/vite-plugin-prune-translations.ts` runs at production build time only (`apply: "build"`). It shrinks the inlined locale payload by dropping entries that would resolve to the same string via fallback:

- **`en.json`**: entries whose value equals the key are dropped (the runtime returns the key itself when a value is absent).
- **Every other locale**: entries whose value equals the resolved `en[key] ?? key` are dropped (the runtime falls back to English).

**Rule 15.9.** Source JSON files stay complete. Prune only affects the production bundle. The dev server and Vitest see the full files. Modifying the prune plugin, or opting a locale out of pruning, requires a standards-doc amendment.

**Rule 15.10.** After a locale-file change, the recorded gzip baseline in `scripts/build-baseline.json` may shift. Legitimate shifts — documented in the baseline's `note` field — are permitted; unexplained increases fail the size-ceiling check (§6.4, §13.2). The baseline `note` should identify which locale or category caused the change.

### 15.11 Numerals, formats, and RTL

**Rule 15.11 — Numeral system.** Number formatting is decoupled from locale. The user's locale controls translated text; a separate `numberFormat` preference controls the numeral system (Western Arabic, Arabic-Indic, CJK-myriad, South Asian grouping, etc.). See `docs/tasks/decouple-arabic-format-and-locale.md` and `docs/tasks/traditional-number-format.md` for the current implementation. New locales inherit Western Arabic as default; overrides go in `client/src/lib/formatting.ts` behavior, not in locale JSONs.

**Rule 15.12 — RTL layout.** Arabic (`ar`) is the current RTL locale. Application layout stays LTR by default (see `docs/tasks/layout-always-ltr.md`) except for text runs that should honor the locale's natural direction. Compound displays (feet-inches, degrees-minutes-seconds) preserve their canonical order across RTL locales; see `docs/tasks/fix-ftin-rtl-ordering.md`. When adding a new RTL locale, extend the RTL-locale set in one place (currently a small `isRtl` check) rather than sprinkling checks across components.

**Rule 15.13 — Latin numerals in RTL contexts.** Numbers inside RTL text runs are rendered in Latin numerals unless the user explicitly opts into Arabic-Indic via `numberFormat` (see `docs/tasks/rtl-latin-numerals.md`). This is a stable behavioral contract; do not change it without a UX decision recorded in this document.

### 15.14 Source citations for unit values

**Rule 15.14.** Every non-obvious unit conversion factor cites a source. "Non-obvious" means anything other than the direct SI base-unit definition or a purely mathematical identity. Sources live in a `source` (or `sources`) field on the unit entry inside its category JSON, or in `client/src/components/sources-section.tsx` for prose-level attributions.

**Rule 15.15 — Official over derivative.** Prefer primary sources (government gazettes, standards bodies, national laws) over Wikipedia or aggregators. When a primary source is unreachable from the build environment, cite Wikipedia and record the unreachable primary in `.agents/memory/` for later revisit. The Thai baht case (`.agents/memory/thai-source-citations.md`) is the reference example: the Royal Gazette notification is the correct primary source but is currently blocked; Wikipedia's Tical article is cited in its place, with the blocker documented.

**Rule 15.16 — No inaccurate primary.** A primary source that contradicts the app's factor may not be cited to legitimize the factor. Cite either the primary that matches the factor, or an aggregator that explains the discrepancy — never a primary that would mislead a reader.

### 15.17 Enforcement

| Rule | Enforced by |
|---|---|
| 15.1–15.3 (language set, fallback, delta-only variants) | ESLint no-restricted-imports on `SUPPORTED_LANGUAGES`; §6 build gate + JSON schema check |
| 15.4–15.5 (file layout, shape-identical keys) | `tests/json-integrity.test.ts`, extended if needed |
| 15.6 (global name uniqueness) | `tests/json-integrity.test.ts` cross-category name-collision check |
| 15.7–15.8 (dead-key guard, renames) | `tests/json-integrity.test.ts` "no dead keys" test with committed allowlist |
| 15.9–15.10 (prune, baseline) | `scripts/vite-plugin-prune-translations.ts`; `scripts/verify-build.mjs` gzip baseline |
| 15.11–15.13 (numerals, RTL) | Unit tests in `tests/regional-counting-suffix.test.ts`, `tests/formatting.test.ts`; Playwright RTL scenarios |
| 15.14–15.16 (sourcing) | PR-review checklist; `sources-section.tsx` renders every citation; `.agents/memory/*.md` records blocked primaries |

---

## Appendix A — Standards → source-of-truth map

| Rule | Enforced by |
|---|---|
| §1.1–§1.5 (layer boundaries) | ESLint `no-restricted-imports` + custom rule scanning for `document`/`window` in `lib/`; code review |
| §1.6 (single-sourced computation) | Code review; `git grep` for repeated operative calls with the same prelude; §11 exception required for intentional divergence |
| §2.1–§2.3 (state discipline) | ESLint `no-restricted-syntax` for `useState` in `UnitConverterApp.tsx`; code review |
| §3.1–§3.5 (function/file length) | ESLint (`max-lines-per-function`, `max-lines`) via `typescript-eslint`; interim: `scripts/lint-size.mjs` |
| §3.6 (exception rationale) | ESLint `overrides` require a companion `// EXCEPTION [architecture-standards §<n>]:` comment; scanned by a small custom rule |
| §4.1–§4.7 (testids) | ESLint custom rule on interactive primitives; rendered-DOM Vitest asserting uniqueness; `verify-build.mjs` counts identifiers against `testid-manifest.json` and asserts uniqueness in the artifact |
| §5.1–§5.3 (data external) | Zod schemas per JSON file; `tests/json-integrity.test.ts` extended; ESLint rule flagging inline `Record`/object literals over N entries in `.ts`/`.tsx` |
| §6.1–§6.4 (build gate) | `package.json` scripts; GitHub Actions workflow |
| §7 (enforcement mechanics) | ESLint + `typescript-eslint`; `verify-build.mjs`; legacy `lint-size.mjs` during transition |
| §8.1–§8.4 (single-file offline, XHTML-conformant markup) | `scripts/verify-build.mjs` (strict XML parse after prepended prolog, external-URL scan, artifact-count check, testid manifest and uniqueness) |
| §9.1–§9.4 (testing) | Coverage-scan script; `tests/reducers.test.ts` per-action pattern; Playwright suite |
| §10.1–§10.2 (deprecation) | `ts-prune` + ESLint (`no-dupe-else-if`, `no-unreachable`, `no-unused-vars`) in build |
| §11 (exceptions) | `.architecture-exceptions.json` scanner with owner/expiry; ESLint `overrides` for scope-based exceptions |
| §13.1–§13.7 (libraries vs. home-built code) | PR-review checklist; `verify-build.mjs` gzip-baseline delta enforces the ≤5 kB single-library limit for shipped code |
| §14.1–§14.6 (final minimization) | `npm run build` ends with the minimization step; `verify-build.mjs` asserts comment-free, whitespace-collapsed, XHTML-conformant, no-gzip-regression output |
| §15.1–§15.16 (locale data and treatments) | `tests/json-integrity.test.ts` (dead-key guard, shape-identical keys, name uniqueness); `scripts/vite-plugin-prune-translations.ts`; `scripts/verify-build.mjs` gzip baseline; PR-review checklist for source citations |
