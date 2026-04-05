---
title: Version bump to v3.1.0.0 + commit
---
# Version Bump to v3.1.0.0

  ## What & Why
  Update the app version number to "v3.1.0.0" in all locations, then commit with the label "Publishing 3.1".

  ## Done looks like
  - `package.json` version field reads `"3.1.0.0"`
  - `client/src/pages/home.tsx` APP_VERSION constant reads `'3.1.0.0'`
  - `replit.md` version header reads `3.1.0.0`
  - A git commit exists with message: `"Publishing 3.1"`

  ## Out of scope
  - Any functional code changes

  ## Tasks
  1. **Update version strings** — Change the version to `3.1.0.0` in `package.json` (version field), `client/src/pages/home.tsx` (APP_VERSION constant), and `replit.md` (Version header line).
  2. **Commit** — Stage all changes with `git add -A` and commit with message `"Publishing 3.1"`.

  ## Relevant files
  - `package.json`
  - `client/src/pages/home.tsx`
  - `replit.md`