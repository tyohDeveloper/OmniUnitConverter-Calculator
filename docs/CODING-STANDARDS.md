# Adopted Coding Standards

> **Source of truth.** `tyohDeveloper/engineering-standards`, release `1.0.0.0` (tag `standards-1.0.0.0`, commit `6adc1add6a2c512c7b81f436f2eb2f0eb8c04c28`). If this copy and the tagged release disagree, the release wins. Do not amend this file to propose a standards change; open a proposal in the hub.

Adoption record: [`STANDARDS-ADOPTION.json`](../STANDARDS-ADOPTION.json). Exceptions: [`EXCEPTIONS.md`](EXCEPTIONS.md). Predecessor policy (v2.2 portable edition, superseded): [`standards/portable-v2.2.md`](standards/portable-v2.2.md), retained unchanged for history.

## Retrieval step

The complete applicable policy is the following documents at tag `standards-1.0.0.0`. Agents and reviewers load them from the hub; this repository does not carry a copy.

| Document | Governs here |
|---|---|
| `standards/coding-core.md` | Core rules C-1 to C-49; language class `application` |
| `standards/bindings/typescript.md` | How each rule is checked in TypeScript; TS-1 to TS-7 |
| `standards/profiles.md` | Delivery profile rules (§3.1 single-file, §3.7 localization) |
| `standards/artifact-contract.md` | Single-file artifact shape and verification |
| `standards/architecture.md` | Role model (VIEW, CONTROLLER, STATE, PURE, DATA, PLATFORM, MODEL, REMOTE) |
| `reviews/architecture-review.md`, `reviews/standards-compliance-review.md` | Review procedures |

## Application mapping

Delivery profile (declared in the adoption record): `state = none`, `packaging = single-file`, `store = none`, `identity = none`, `network = none`, `compute = interactive`; localization `scope = [language, numeric]`, `mode = dynamic`, domains `ui` and `units`, twelve locales. No platform ports. Binding: `typescript:application`.

Role mapping (responsibility-named directories; roles are not directory names):

| Role | Paths |
|---|---|
| VIEW | `client/src/features/**/*.tsx`, `client/src/components/**/*.tsx` |
| CONTROLLER | `client/src/components/unit-converter/hooks/**`, `client/src/features/unit-converter/app/**` |
| STATE | `client/src/components/unit-converter/state/**`, `client/src/components/unit-converter/context/**` |
| PURE | `client/src/lib/**` |
| PURE-CORE | `client/src/lib/calculator/**`, `client/src/lib/units/**` |
| DATA | `client/src/data/**` (conversion categories, `localization/ui/*.json`, `localization/units/*.json`) |
| PLATFORM-PURE | unmapped (formatting through `Intl` lives in `client/src/lib/formatting.ts`; see E-6) |
| PLATFORM-AMBIENT, MODEL, REMOTE | unmapped (no ports in this profile) |

Translation domains (C-36): `ui` (interface strings) and `units` (entity display names). Adding a domain amends the adoption record first.

## Enforcement matrix

Commands are the repository's actual scripts. "Automated" runs in CI through `npm run build` and the e2e job; "manual-review" is checked in architecture and compliance reviews until the listed exception closes.

| Core rule | Mechanism | Command | Enforcement |
|---|---|---|---|
| C-19 gating | Composed build fails on first stage | `npm run build` | automated |
| C-11 function length ≤ 20 | ESLint `max-lines-per-function` on `client/src/**/*.ts` | `npm run lint` | automated |
| C-12 role file limits | ESLint `max-lines`: `lib/**` 100, hooks and state 150, `*.tsx` 250 | `npm run lint` | automated |
| C-6, TS-7 one export, no barrels, responsibility names | `omniunit/no-reexport`, `omniunit/no-shape-named-file` | `npm run lint` | automated |
| C-2 import direction | none yet | | manual-review (E-1) |
| C-3 no ambient effects in PURE | none yet | | manual-review (E-2) |
| C-14, C-15 data external, schema-validated | json-integrity suite, unit catalog contract, Zod at load | `npm run test:run` | automated |
| C-16a zero-indexing | convention | | manual-review |
| C-18 stable test IDs | `tests/testids-unique.test.ts`, `scripts/testid-manifest.json`, verifier assertion | `npm run test:run`, `npm run verify:build` | automated |
| C-20 dead code | dead-key guard covers JSON; no code-level tool | | manual-review (E-3) |
| C-21 size budget | `scripts/verify-build.mjs` gzip ≤ baseline × 1.05 | `npm run verify:build` | automated |
| C-24 dependency policy | review | | manual-review |
| C-26 license inventory | none yet | | manual-review (E-4) |
| C-27 exceptions | `docs/EXCEPTIONS.md` | | manual-review |
| C-31 no secrets | none yet; profile has no secrets | | manual-review (E-5) |
| C-32 to C-35 fallback chain, all-files change, delta-only variants, shape-identical keys | json-integrity suite | `npm run test:run` | automated |
| C-38 global display-name uniqueness | cross-file consistency test | `npm run test:run` | automated |
| C-39 dead-key guard | json-integrity "orphaned en.json key" test with allowlist | `npm run test:run` | automated |
| C-40 build-time pruning | `scripts/vite-plugin-prune-translations.ts`; verifier | `npm run build:bundle`, `npm run verify:build` | automated |
| C-41 RTL | unit tests on compound ordering; no e2e RTL scenario | | manual-review (E-7) |
| C-42, C-43 numeral preference, formatting layer | `tests/formatting.test.ts`, `tests/regional-counting-suffix.test.ts` | `npm run test:run` | automated |
| C-45 to C-48 registry, proven-equal, markers, ordering | `tests/conversion-functions.test.ts`, `tests/duplicateSymbolOrdering.test.ts`, catalog contract | `npm run test:run` | automated |
| C-49 source citation | `tests/sources.test.ts`; sources view | `npm run test:run` | automated + review |
| Artifact contract §1–§5 | `scripts/minify-artifact.mjs`, `scripts/verify-build.mjs` | `npm run minify:artifact && npm run verify:build` | automated |
| C-22, C-23 tests, determinism | Vitest, Playwright | `npm run test:run`, `npm run test:e2e` | automated |

## Extensions

Application-level conventions that are not hub rules and stay here:

- Notation in reference text (predecessor §15.13): `⋅` for multiplication, Unicode superscripts only for single-character exponents, caret form for fractional exponents, `×` reserved for physical dimensions. Rationale in `.agents/memory/sources-notation-conventions.md`.
- `data-testid` grammar `{role}-{area}-{name}` and the manifest's required/dynamic sets (`scripts/testid-manifest.json`).
- Dead-key allowlist entries and the Thai source-citation blocker, recorded in `.agents/memory/`.

## Exceptions

See [`EXCEPTIONS.md`](EXCEPTIONS.md). Each entry names the core rule, the gap, the owner and a review date.
