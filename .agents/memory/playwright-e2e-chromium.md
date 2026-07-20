---
name: Playwright e2e chromium in this env
description: How to run Playwright e2e tests when downloaded browsers fail to launch
---
Playwright's downloaded chromium fails here (`libglib-2.0.so.0` missing). The config supports overriding the binary:

```
PW_CHROMIUM_PATH=$(which chromium) npx playwright test <file> --reporter=line
```

**Why:** NixOS lacks the shared libraries the Playwright-downloaded browsers expect; the Nix-provided `chromium` works.
**How to apply:** Any time e2e tests report "error while loading shared libraries" on browser launch.

Playwright WebKit is infeasible here: it launches with ~84 missing shared libs (gtk4, gstreamer, flite, etc.) and no Nix-provided WebKit browser exists in this env. Simulate WebKit-specific behaviors (e.g. blur-after-Enter) in Chromium tests via `element.evaluate` dispatching the exact event sequence instead.
