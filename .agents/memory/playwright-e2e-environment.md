---
name: Playwright e2e in Replit environment
description: How to actually run the Playwright e2e suite here (downloaded browsers fail to launch)
---
Playwright's downloaded chromium/headless-shell fails to launch in this Nix environment (missing libglib-2.0.so.0 etc.).

**Why:** Playwright's prebuilt binaries expect Debian-style system libraries that the NixOS container doesn't provide.

**How to apply:** Install the Nix `chromium` system package, then run the suite with the executable override wired into `playwright.config.ts`:
`PW_CHROMIUM_PATH=$(which chromium) npx playwright test`
The config only applies the override when `PW_CHROMIUM_PATH` is set, so CI elsewhere is unaffected.

Known pre-existing failure (July 2026): `converter.e2e.ts` "typography units Ligne/Didot" test fails — units aren't found via `getByText` after clicking the category; unrelated to focus/RPN work.
