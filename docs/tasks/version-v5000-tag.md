# Bump version to v5.0.0.0 and tag

## What & Why
Update the application version identifier to "5.0.0.0", commit the change, and create an annotated git tag marking the major Claude refactor that added the time/timezone converter and date/calendar converter.

## Done looks like
- The app displays version 5.0.0.0 in the UI
- `package.json` (and lockfile) show version 5.0.0.0
- A commit exists with the version bump
- Annotated git tag `v5.0.0.0` exists (git tag names cannot contain spaces, so use `v5.0.0.0` in place of the requested "v5.0.0.0 - tag"; prior tags follow the `vX.X.X.X` pattern) with message "Major claude refactor added time/timezone converter & date/calendar converter.", pushed to the remote along with the commit

## Out of scope
- Any feature or code changes beyond the version string
- Changelog/README rewrites

## Steps
1. **Bump version strings** — Update the version to `5.0.0.0` in `package.json` (and regenerate/update the lockfile entry) and the `APP_VERSION` constant shown in the UI.
2. **Commit and tag** — Commit the version bump, then create annotated git tag `v5.0.0.0` with message "Major claude refactor added time/timezone converter & date/calendar converter." and push the commit and tag to the remote per the git-remote skill.

## Relevant files
- `package.json`
- `client/src/pages/home.tsx:5`
