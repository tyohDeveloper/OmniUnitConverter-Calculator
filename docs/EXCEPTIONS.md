# Standards Exceptions

Policy: `tyohDeveloper/engineering-standards` release 1.0.0.0. Rule C-27: every departure has a rule, reason, owner and review date. Review dates are checked at each architecture review; an expired entry is a finding.

| ID | Rule | Gap | Reason | Owner | Review by |
|---|---|---|---|---|---|
| E-1 | C-2 import direction | No ESLint boundary rule; direction is enforced by review only | Boundaries plugin keyed by the role mapping is not yet configured; the predecessor edition also lacked it | David Hoyt | 2027-01-31 |
| E-2 | C-3 no ambient effects in PURE | No `no-restricted-globals` / `no-restricted-imports` override for `client/src/lib/**` | Same as E-1; add alongside the boundary rule | David Hoyt | 2027-01-31 |
| E-3 | C-20 dead code | No code-level dead-export tool (`knip`); JSON dead keys are guarded | Tool not yet evaluated against the single-file build | David Hoyt | 2027-01-31 |
| E-4 | C-26 license inventory | No generated license inventory of shipped dependencies | Predecessor edition required compatibility only; inventory tool to be chosen | David Hoyt | 2027-04-30 |
| E-5 | C-31 secret scanner in CI | No scanner step | Profile has no secrets, no network and no ports; risk is low but the rule is unconditional | David Hoyt | 2027-04-30 |
| E-6 | C-43 formatting in PLATFORM-PURE | `Intl` wrappers live in PURE (`client/src/lib/formatting.ts`) with the locale passed in; PLATFORM-PURE is unmapped | Behaviour already matches the rule (locale injected, no ambient read); the role mapping has not been split | David Hoyt | 2027-04-30 |
| E-7 | C-41 RTL end-to-end scenario | Compound-ordering and Latin-numeral rules are unit-tested; no Playwright RTL scenario | e2e suite currently covers converter and RPN focus flows only | David Hoyt | 2027-04-30 |
| E-8 | C-11 function length | Reducer switch bodies, controller hook bodies and listed multi-step algorithm files are excluded from `max-lines-per-function` | Rationale recorded inline in `eslint.config.js` (predecessor §3.1 carve-outs); unchanged by adoption | David Hoyt | 2027-04-30 |
| E-10 | C-19 CI parity (same build everywhere) | e2e job pinned to `ubuntu-24.04` instead of `ubuntu-latest` | Playwright 1.59.x cannot install chromium on Ubuntu 26.04; review when Playwright supports the latest runner image | David Hoyt | 2027-01-31 |
| E-9 | C-12 VIEW file limit | One legacy top-level view exceeds 250 lines (per-file override in `eslint.config.js`) | Pre-dates the standards; extraction pass pending | David Hoyt | 2027-04-30 |

Closed exceptions are moved to a "Closed" table below with the closing commit.

## Closed

| ID | Rule | Closed by |
|---|---|---|
| | | |
