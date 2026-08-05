---
name: Architecture standards (post-cleanup)
description: Where the normative architecture rules live and how they are enforced after the Aug 2026 external cleanup.
---

The normative rules doc is `docs/perplexity/architecture-standards.md` (four-layer model: UI → controller hooks → state → pure lib functions → JSON data).

Key rules to obey in any change:
- Responsibility-based naming; no `utils`/`helpers`/`common`/`index` shape names (custom ESLint rule `no-shape-named-file`).
- No barrel files / re-exports (ESLint rule `no-reexport`).
- Size limits: exported functions ≤20 lines, pure-function files 1 export, components ≤250 lines (enforced by `scripts/lint-size.mjs`).
- Every interactive element needs a unique `data-testid` (`{role}-{area}-{name}[-{key}]`), checked against `scripts/testid-manifest.json` by `verify-build`.
- Single-file build must be XHTML/polyglot well-formed and offline self-contained; `verify-build` parses it with sax.

**Why:** user did an extensive external architectural cleanup (Aug 2026) and these rules are CI-enforced; violations fail the build.
**How to apply:** before adding files/functions, match these conventions; run lint-size + verify-build workflows.

Also: `scripts/post-merge.sh` syncs `.local/tasks/` → `docs/tasks/`. Future date/time work is specced in `docs/tasks/temporal-*.md` but is on hiatus (parked on git branch `c4.date.time.holding`); ignore unless merged back.
