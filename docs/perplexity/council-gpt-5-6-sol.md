# Council Architecture Pass — GPT 5.6 Sol

## 1. Executive verdict

- **The domain-library direction is close; the application as a whole is not compliant.** Reducer composition and the decomposed `lib/calculator` / `lib/units` surface are a credible foundation, but the rules are enforced only where the code is already clean. The two controllers and three panes form a second, effectively ungoverned architecture.
- **The biggest gap is boundary integrity, not raw file size.** Conversion, formatting, dimensional transformation, parsing, stack transitions, and result construction still occur inside hooks and JSX. Splitting 1,200 lines into smaller components without first extracting pure transitions would only distribute the violation.
- **The standards have five independent “dimensions”: location, purity, mutability, granularity, and enforcement.** Current code scores well on centralized durable state and library granularity, moderately on externalized data, and poorly on purity at the UI/controller boundary and executable enforcement.
- **The output contract is currently HTML, not XHTML.** Renaming `index.html` is not compliance. Strict XML serialization needs an explicit build product and XML-aware verification.
- **UI identifiers are better than the task note suggests in development, but worse in production.** `testId()` deliberately emits nothing outside DEV (`client/src/lib/test-utils.ts:1-8`), while repeated IDs such as every category using `display-category` violate uniqueness (`client/src/features/unit-converter/app/UnitConverterApp.tsx:243-264`).

## 2. Compliance matrix against stated standards

| Standard | Current status | Gap | Fix priority |
|---|---|---|---|
| Unique semantic identifier per UI object | Partial | Many controls are covered, but some are missing, mapped controls can share an ID, and helper-generated IDs disappear in production. | P0 |
| UI / controller-state / pure functions / external data separation | Partial | Reducers and JSON catalogs exist, but controllers and panes contain domain algorithms and hard-coded metadata/configuration. | P0 |
| All non-UI-controller logic in pure layer | Non-compliant | Formatting, parsing, dimensional math, calculator evaluation, and view-model construction leak into hooks and JSX. | P0 |
| Mutable state only in controller and UI | Mostly compliant | Durable state is reducer-backed; some flow-significant state is hidden in refs/local state. | P1 |
| One external logic function per file | Strong only in governed libraries | The custom lint checks `client/src/lib`, not feature/controller code; exported React modules and hooks remain oversized mixed units. | P1 |
| Functions under 20 lines | Non-compliant outside libraries | Several effects, callbacks, component bodies, and inline render closures exceed the limit by multiples. | P1 |
| Local helpers only for unavoidable complexity | Partial | Helpers exist, but reusable transformations are embedded in controllers or duplicated. | P1 |
| Tests run at build time | Non-compliant | `build` is only `vite build`; test, typecheck, size lint, and verifier are separate commands (`package.json:6-13`). | P0 |
| Canonical, discoverable standards document | Missing | Rules are scattered among task notes and comments; there is no normative source or exception process. | P0 |
| One offline XHTML deliverable | Non-compliant | Vite emits `dist/public/index.html`; verifier hard-codes that path (`scripts/verify-build.mjs:22-25`). | P0 |
| Data external to code | Substantially good, not complete | Conversion/localization JSON is strong, but category dimensions, category grouping, and calculator button definitions remain code literals. | P1 |

## 3. Findable-constraints gap

There is no canonical document that a new contributor or automation agent can discover and treat as normative. `lint-size.mjs` describes only “pure-function library files” and explicitly scopes export/file limits to selected `lib` directories (`scripts/lint-size.mjs:3-17,27-31,120-125`). That is an enforcement implementation, not an architecture contract. The test-ID task is useful but tactical and even says additions are “additive only” (`docs/tasks/add-meaningful-testids.md:6-13`), which prevents correcting bad names.

Create `docs/architecture/standards.md`, linked prominently from `README.md` and `CONTRIBUTING.md`. It should define: layer dependency direction; what counts as domain logic versus UI orchestration; allowed state classes (durable, transient UI, effect handle); one-export and 20-line counting rules; React-specific exceptions; data-location rules; identifier format and production retention; XHTML acceptance criteria; mandatory build gates; and an exception template with owner, rationale, scope, and expiry. “Controller” must not become an exemption meaning “any logic in a hook.” A controller may sequence effects and dispatch actions; it may not implement arithmetic or dimensional policy.

## 4. XHTML-output gap

The current source template is ordinary HTML (`client/index.html:1-38`), Vite’s single-file plugin is enabled only in production (`vite.config.ts:9-27`), and output is directed to `dist/public` without an XHTML filename (`vite.config.ts:39-43`). The verifier looks for an inline script and size properties but never parses XML (`scripts/verify-build.mjs:67-84`).

First decide the acceptance contract. If the real need is “one offline file opened by double-click,” HTML is the safer and more portable product, and the requirement should say HTML rather than XHTML. If strict XHTML is intentional, produce `OmniUnitConverter.xhtml` through an XML-aware post-build serializer, not regex replacement: add an XML declaration and XHTML namespace; quote all attributes; self-close void elements; preserve case; and wrap inline JS/CSS safely so `<`, `&`, or `]]>` cannot break XML. Disable any HTML minification phase that rewrites XML-safe syntax, while retaining JS/CSS minification.

Then make verification structural: parse as XML and fail on any parse error; assert exactly one output file; assert no external `src`, `href`, font, or network dependency; assert the expected root namespace; and launch that exact `file://` artifact in the browser e2e smoke test. CDATA and module-script behavior must be tested in target browsers. This adds build complexity and a serializer dependency; that is the honest cost of strict XML. Merely changing the extension gives the risk without the guarantee.

## 5. Pure-function-layer purity

The clearest violations are in `useCalculatorController.ts`. `pullFromPane` embeds a second large category-to-dimensions catalog and constructs domain values (`client/src/components/unit-converter/hooks/useCalculatorController.ts:284-381`). Unary RPN mathematics and dimensional transformations are a controller switch (`:445-501`); binary arithmetic is another (`:503-558`); simple-calculator evaluation is local logic (`:650-672`). These should be pure functions returning either a new value/stack or a typed error, with the controller limited to reading state, invoking the function, dispatching, and triggering UI effects.

This leakage is not merely stylistic. `sqrt` and `cbrt` round exponents upward, so an odd exponent is silently changed rather than represented fractionally or rejected (`useCalculatorController.ts:462-466`). Exponential and logarithmic operations preserve input dimensions (`:467-472`), although such functions normally require dimensionless input. The architecture currently makes dimensional policy hard to isolate, review, and test.

`useConverterController.ts` similarly owns number-format algorithms (`client/src/components/unit-converter/hooks/useConverterController.ts:254-374`), direct-unit construction (`:398-423`), DMS/feet-inch parsing (`:429-447`), conversion calculation (`:449-477`), input sanitization (`:499-514`), and a 70-line copy-and-push transformation (`:539-609`). Its category dimension map is hard-coded at `:118-160`, duplicating related metadata elsewhere.

Logic also sits in views. `CalculatorPane` parses and commits an RPN value (`client/src/features/unit-converter/components/CalculatorPane.tsx:103-135`) and performs unit re-expression in an effect (`:141-191`). `ConverterPane` calculates conversion-ratio display directly in JSX (`client/src/features/unit-converter/components/ConverterPane.tsx:392-415`) and computes comparison conversions/prefixes in a render-time IIFE (`:459-511`). `DirectPane` parses unit-bearing text and mutates exponents (`client/src/features/unit-converter/components/DirectPane.tsx:72-84`).

Extract pure “use cases” and view-model functions: `evaluateRpnUnary`, `evaluateRpnBinary`, `evaluateSimpleExpression`, `parseDirectEntry`, `buildCalcEntry`, `formatLocalizedNumber`, `buildComparisonRows`, and one canonical `dimensionsForCategory`. Each gets its own file and direct tests. Keep clipboard, focus, timers, DOM events, and dispatch sequencing in controllers/UI.

## 6. Mutable-state discipline

Durable state is sensibly centralized: four reducers are composed in `ConverterContext`, with one `useReducer` at the provider (`client/src/components/unit-converter/context/ConverterContext.tsx:40-76`). State adapter hooks dispatch actions rather than owning parallel state (`useCalculatorState.ts:31-60`; `useRpnStack.ts:29-57`). Preserve this.

Not every ref should move. Focus targets, blur suppression, committed-text guards, and animation-frame coordination in `CalculatorPane` are genuinely ephemeral UI mechanics (`CalculatorPane.tsx:84-100,875-945`). Timer handles in the converter controller are effect resources, not application state (`useConverterController.ts:210-215`). Flash flags are transient visual state, though `useAllFlashFlags` is repetitive and uses 15 separate hook instances (`useFlashFlag.ts:48-65`).

Move only flow-significant values: `pendingPasteUnitRef` determines later category/unit selection and should become a typed reducer field/action, not invisible mutable memory (`useConverterController.ts:210,660-694`). The two paste statuses should move into `uiPrefs` if tests or other components need deterministic observation; otherwise explicitly classify them as controller-local ephemeral state. Eliminate `lastCalcInputsRef` plus the effect-driven derived result (`useCalculatorController.ts:674-712`): compute through a pure selector, or update inputs and result atomically in a reducer transition. Do not put DOM refs or timeout IDs in reducers.

## 7. File & function size compliance

The enforcement perimeter is the problem. `lint-size.mjs` recursively reads only `client/src/lib` (`scripts/lint-size.mjs:23-31,190-225`) and its brace-counting parser recognizes a narrow set of declaration forms (`:137-187`). It therefore cannot see 1,211-line `CalculatorPane`, 810-line `useConverterController`, 739-line `useCalculatorController`, 553-line `UnitConverterApp`, or render lambdas.

Extend enforcement to `client/src/features/unit-converter/**` and `client/src/components/unit-converter/**`, but do not pretend a regex is a TypeScript parser. Use ESLint AST rules for `max-lines-per-function`, file length, and exports. Adopt a documented React exception: a declarative component render body may exceed 20 lines up to a modest cap (for example 80), but event handlers, effects, IIFEs, selectors, transformations, and hooks do not. First extract logic, then split views into `SimpleCalculatorPane`, `RpnCalculatorPane`, `RpnRegister`, `RpnFunctionGrid`, `ConverterInputRow`, and `ConverterResultRow`. A blanket UI exception would preserve the current loophole.

## 8. UI-object identifier coverage

A static hot-spot inventory shows why one percentage is misleading. In `ConverterPane`, approximately **10 of 15 top-level interactive control sites (67%)** have an identifier in development; the base-factor/SI buttons and explicit Copy button are missing (`ConverterPane.tsx:156-195,343-381,422-439`). In production this falls to about **9 of 15 (60%)**, because `input-value` is emitted through the DEV-only helper. `DirectPane` appears nearly complete in development—including 99 generated exponent buttons—but helper-based IDs vanish in production, leaving only three directly declared IDs; its mapped physical-quantity buttons also reuse the same ID (`DirectPane.tsx:191-241`). `CalculatorPane` has high active-control coverage, but disabled alternative selectors lack IDs (`CalculatorPane.tsx:575-613,1081-1119`).

Codify `area.object.action-or-role[.key]`, for example `converter.from.unit-select`, `calculator.simple.operator.multiply.1`, and `calculator.rpn.function.sqrt`. Dynamic keys belong in the ID, so categories and quantity labels are unique. Remove DEV stripping: stable identifiers are part of the testability contract and their byte cost is trivial relative to the bundle. Add an AST check requiring an `id` or `data-testid` on every interactive primitive and a rendered test that fails on duplicate identifiers.

## 9. Build-time tests

Replace the recursive trap-prone script layout with explicit stages:

```json
"lint:size": "node scripts/lint-size.mjs",
"test:run": "vitest run",
"build:bundle": "vite build",
"verify:build": "node scripts/verify-build.mjs",
"build": "npm run check && npm run lint:size && npm run test:run && npm run build:bundle && npm run verify:build"
```

Update `verify-build.mjs` for the XHTML artifact and XML/offline assertions. CI should run the same `npm run build` on every change, then run Playwright against the generated `file://` file as a separate release gate. This keeps unit tests literally in the build while avoiding repeated browser setup in every local bundle iteration. Baseline updates must be reviewed, not automatically rewritten.

## 10. Top changes, ranked

1. **P0 — Define and publish `docs/architecture/standards.md`;** make boundaries and exceptions auditable.
2. **P0 — Decide HTML versus strict XHTML;** encode one unambiguous acceptance test.
3. **P0 — Add a real XHTML serializer/verifier if strict XML remains required;** eliminate extension-only compliance.
4. **P0 — Wire typecheck, size lint, Vitest, bundle, and verification into `build` and CI;** turn intent into a gate.
5. **P0 — Extract RPN/simple evaluation from `useCalculatorController`;** isolate dimensional policy and defects.
6. **P0 — Extract parsing/formatting/value construction from `useConverterController`;** restore controller orchestration.
7. **P1 — Create one canonical external category-dimension catalog;** remove duplicated, drifting maps.
8. **P1 — Split panes only after logic extraction;** reduce review surface without creating cosmetic architecture.
9. **P1 — Extend AST-based size/purity enforcement to features and hooks;** close the enforcement loophole.
10. **P1 — Retain semantic IDs in production and enforce uniqueness/coverage;** make the actual artifact testable.
11. **P1 — Replace flow refs and effect-derived results with explicit reducer transitions/selectors;** improve determinism.

## 11. What NOT to change

Keep the four-domain reducer composition and action-oriented state access; it is the correct spine. Keep the one-function-per-file pure libraries rather than recombining them into utility grab bags. Keep conversion and localization data externalized. Keep the single-file, offline-first bundling goal and the gzip regression ceiling. Keep UI-only focus/timer refs local instead of polluting reducers. Finally, keep the existing test investment and test-ID intent—fix their gating, production semantics, and coverage rather than replacing the tools.
