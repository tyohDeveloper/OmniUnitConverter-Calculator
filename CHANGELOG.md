# Changelog

Versions are four-part, `MAJOR.MAJORFIX.MINORFIX.SPELLING`; each part marks a kind of change and
the notes say what the change means. Earlier releases are described in their tag messages.

## [5.2.0.1] — 2026-10-30

No change to conversions, units, calculator behaviour or localization. Fourth-part release:
build-gate hardening under the adopted engineering standards and a hosted copy for bookmarking.

### Added

- GitHub Pages deployment on each `v*` tag, serving the single-file build at
  <https://tyohdeveloper.github.io/OmniUnitConverter-Calculator/>.
- Build-gate stages: import-direction and ambient-effect lint rules, `lint:dead` (knip),
  `lint:secrets` (secretlint), license inventory check (`THIRD_PARTY_LICENSES.md`).

### Changed

- Adopted `tyohDeveloper/engineering-standards` release 1.0.1.0 (`STANDARDS-ADOPTION.json`,
  `docs/CODING-STANDARDS.md`); exceptions E-1 to E-7 and E-11 closed.
- Removed dead code found by knip: 52 unused UI scaffolds, 6 unused library files, 24 unused
  exports. Test and build tooling moved to devDependencies.
- CI runners pinned to `ubuntu-24.04` (E-10).
