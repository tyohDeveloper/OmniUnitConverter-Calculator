# Agent Contract: OmniUnit

Standards: `tyohDeveloper/engineering-standards` release 1.0.1.0 (tag `standards-1.0.1.0`). Read `docs/CODING-STANDARDS.md` first; it maps roles to paths and rules to commands. Do not edit it to change a rule; propose in the hub.

## Delivery profile directives

- Profile: state `none`, packaging `single-file`, store `none`, identity `none`, network `none`, compute `interactive`; localization scope `language, numeric`, mode `dynamic`, domains `ui`, `units`, twelve locales (`STANDARDS-ADOPTION.json`).
- Single-file rules (hub `standards/profiles.md` §3.1): no origin storage, no network APIs, no external resources, CSP meta present, fragment/query as the only shareable state, no embedded database engine. The artifact contract verifier must pass.
- Ports used: none. Do not add `fetch`, storage, workers or any PLATFORM-AMBIENT facility without a profile change in the adoption record.
- Binding: `typescript:application`. Follow hub `standards/bindings/typescript.md` for how each core rule `C-n` is checked. Shell is invocation glue only; Python tooling follows the `tooling` class.
- Boundaries between bindings have one schema source (C-30). No secrets in code, config, logs or fixtures (C-31).

## Commands

- `npm run build` is the gate: typecheck, size lint, ESLint (size, naming, C-2 import direction, C-3 purity), knip dead code, secretlint, Vitest, bundle, minify, verify. CI also checks `THIRD_PARTY_LICENSES.md` is current (`npm run licenses:check`). Run it before proposing a merge.
- `npm run test:e2e` for Playwright (NixOS: `PW_CHROMIUM_PATH=$(which chromium)`, see `.agents/memory/`).
- Locale changes: run `npm run test:run` and expect the json-integrity suite to pass; a new key is an all-locale change (C-33); dead keys fail the guard (C-39).
- Size: `npm run verify:build` enforces gzip ≤ baseline × 1.05. Re-baselining is a reviewed change with a note in `scripts/build-baseline.json`, never automatic.

## Rules most often broken here

- Exported function bodies ≤ 20 lines; role file limits 100/150/250 (C-11, C-12). Over-limit files diagnose themselves: extract PURE work first, then split.
- One export per file; no barrels; no `utils`/`helpers`/`lib`-style names (C-6, TS-7).
- Domain tables are JSON in `client/src/data/`, never literals (C-14). Data names a function by registry name, never code (C-45).
- Symbols never translate; display names do (C-37). Numeral system is a separate preference from locale (C-42).
- Non-obvious domain values cite a source on the entry (C-49); notation conventions in `docs/CODING-STANDARDS.md` Extensions.

## Exceptions

Known gaps are in `docs/EXCEPTIONS.md` with owners and review dates. Do not add an exception inline in code without an entry there.

## Process

- Terse commit messages, decomposed commits; checkpoint large plans in GitHub before building.
- Author attribution: `50533494+tyohDeveloper@users.noreply.github.com`.
- Four-part versioning `MAJOR.MAJORFIX.MINORFIX.SPELLING`; release notes explain meaning.
