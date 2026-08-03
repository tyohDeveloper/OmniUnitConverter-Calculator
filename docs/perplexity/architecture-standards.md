# OmniUnit Architecture & Coding Standards

> **Purpose.** Normative source of the architectural rules OmniUnit is built and reviewed against. Any deviation must be either fixed or documented as an *exception* using the template in §11.
>
> **Location.** Committed at `docs/architecture/standards.md` (proposed). Linked from `README.md` and referenced from the header of `scripts/lint-size.mjs`. When a lint script or verifier fails, the error message should include a section number in this document.
>
> **Version.** 1.0 (initial). Extend by pull request; the doc is intended to grow alongside the codebase.

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

---

## 4. UI-object identifiers

**Rule 4.1 — Coverage.** Every interactive primitive rendered in the shipped artifact carries a stable identifier. An interactive primitive is any element with `onClick`, `onValueChange`, `onCheckedChange`, `onChange`, `onSubmit`, `role="button"`, or that renders through `<Input>`, `<Select>`, `<Switch>`, `<Button>`, `<Tabs*>`, `<Checkbox>`, `<Slider>`, or `<Toggle>`.

**Rule 4.2 — Identifier form.** IDs are set via `data-testid` (preferred) or `id`. The grammar is:

```
<area>.<object>.<role>[.<key>]
```

- **area** — the top-level pane or region: `converter`, `calculator.simple`, `calculator.rpn`, `direct`, `app`, `help`, `sources`.
- **object** — the specific widget group inside that area: `from`, `to`, `field-1`, `stack-x`, `function-grid`.
- **role** — one of `button`, `select`, `input`, `display`, `switch`, `checkbox`, `slider`.
- **key** — required whenever the widget is generated inside a `.map()` or list. Use the underlying domain key (unit id, category id, dimension symbol), not the array index.

Examples: `converter.from.select.unit`, `calculator.simple.button.operator.multiply.1`, `calculator.rpn.button.function.sqrt`, `direct.button.exponent.mass.-2`.

**Rule 4.3 — Uniqueness.** Every ID rendered in a given DOM tree is unique. A rendered test asserts no duplicate `data-testid` value on every route/pane. Category cards, list items, and generated buttons must include the domain key in the ID.

**Rule 4.4 — Production retention.** Identifiers are part of the deliverable's testability contract. The build **must not** strip `data-testid` attributes from the production single-file artifact. If a `testId()` helper exists, it must return its input unchanged in every environment.

**Rule 4.5 — Additive-only with a rename process.** Existing IDs are not silently renamed. Renames go through a "rename manifest" PR that updates all consumers (tests, docs, external harnesses) in the same change.

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

The rules above are enforced by four independent checkers, each of which has a clear scope and known limits. This is preferred to one "smart" checker because scope is the only defense against silent regressions.

| Check | Tool | Scope |
|---|---|---|
| Function length, one-export-per-file, file length in `lib/` | `scripts/lint-size.mjs` | `client/src/lib/**` |
| File length + named-handler length in features/hooks | Extended `lint-size.mjs` (added rule; regex-based, JSX-safe carve-out) | `client/src/components/unit-converter/{hooks,state}/**` and `client/src/features/**` |
| AST-level function-length and file-length for `.tsx` | ESLint (`max-lines-per-function`, `max-lines`) — planned follow-up once panes are already smaller | `client/src/**/*.tsx` |
| Bundle validity, XML well-formedness, size ceiling, testid coverage/uniqueness | `scripts/verify-build.mjs` | Built artifact only |

**Rule 7.1 — Exclusion with rationale.** Every file excluded from any check must have a comment explaining why, referencing §3.6. The set of exclusions in `scripts/lint-size.mjs:33-79` is the reference pattern.

**Rule 7.2 — No rule is enforced only by convention.** If a checker cannot express a rule today, the rule is captured as an ESLint plan, a `TODO(architecture-standards §N)` marker, or a targeted test that fails when violated.

---

## 8. Single-file offline deliverable

**Rule 8.1 — One artifact.** The build produces exactly one file that opens from `file://` with no network, no server, and no additional assets, on any modern desktop or mobile browser. Fonts, images, styles, and code are inlined.

**Rule 8.2 — Chosen output format.** Pick one of:

- **(A) HTML with XML-well-formed markup.** Output remains `dist/public/index.html`. All tags are XML-well-formed (void elements self-closed, attributes quoted, case preserved), but the artifact is served/opened as HTML. `verify-build.mjs` parses the artifact as XML and fails on any parse error. This is the recommended default because HTML parsing is forgiving in edge cases.
- **(B) Strict XHTML.** Output is `dist/public/OmniUnitConverter.xhtml`. Includes `<?xml version="1.0" encoding="UTF-8"?>`, `xmlns="http://www.w3.org/1999/xhtml"`, self-closed void elements, quoted attributes, inline `<script>`/`<style>` bodies wrapped in `//<![CDATA[ … //]]>`, and no literal `]]>` in minified content. Verifier XML-parses the artifact *and* checks `application/xhtml+xml` parsing in a headless browser smoke test.

The current codebase implements *neither*. The standards document must record which of A or B is the accepted contract; this PR chooses **(A)** as the default and flags **(B)** as a controlled follow-up if the deliverable truly needs XML MIME parsing.

**Rule 8.3 — Offline verification.** `verify-build.mjs` asserts the artifact contains no `src=`, `href=`, `url(…)`, or `import(…)` reference to an external URL. Currently only comment count and size are checked; extend accordingly.

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

## Appendix A — Standards → source-of-truth map

| Rule | Enforced by |
|---|---|
| §1.1–§1.5 (layer boundaries) | ESLint `no-restricted-imports` + custom rule scanning for `document`/`window` in `lib/`; code review |
| §2.1–§2.3 (state discipline) | ESLint `no-restricted-syntax` for `useState` in `UnitConverterApp.tsx`; code review |
| §3.1–§3.5 (function/file length) | `scripts/lint-size.mjs` (extended per §7) → ESLint `max-lines*` follow-up |
| §3.6 (exception rationale) | `scripts/lint-size.mjs` rejects an unrecognized exclusion without a matching comment |
| §4.1–§4.5 (testids) | ESLint custom rule on interactive primitives; rendered test asserting uniqueness; `verify-build.mjs` counts identifiers in the artifact |
| §5.1–§5.3 (data external) | Zod schemas per JSON file; `tests/json-integrity.test.ts` extended; ESLint rule on large inline `Record` literals |
| §6.1–§6.4 (build gate) | `package.json` scripts; GitHub Actions workflow |
| §8.1–§8.3 (single-file offline) | `scripts/verify-build.mjs` (XML parse, external-URL scan, artifact-count check) |
| §9.1–§9.4 (testing) | Coverage-scan script; `tests/reducers.test.ts` per-action pattern; Playwright suite |
| §10.1–§10.2 (deprecation) | Manual + `ts-prune`/`eslint no-dupe-else-if` in build |
| §11 (exceptions) | `.architecture-exceptions.json` scanner in `lint-size.mjs` |
