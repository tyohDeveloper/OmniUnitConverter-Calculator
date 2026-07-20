# Bump version to v4.0.0.0 and tag release

## What & Why
Update the application version identifier to "v4.0.0.0" everywhere it is displayed/documented, and create a git tag (version label) `v4.0.0.0` with the message "Added RPN Calculator and multiple new units." — matching the existing tag convention (v3.2.1.0, v3.2.1.1, etc.).

## Done looks like
- The app header shows "v4.0.0.0"
- `replit.md` overview states Version v4.0.0.0
- A git tag `v4.0.0.0` exists with the message "Added RPN Calculator and multiple new units."

## Out of scope
- Any functional changes to the app
- Pushing tags to a remote repository

## Steps
1. **Update version string** — Change the `APP_VERSION` constant from `3.2.1.0` to `4.0.0.0` and update the version mentioned in `replit.md`.
2. **Verify display** — Confirm the app renders "v4.0.0.0" and tests/build checks still pass.
3. **Create annotated git tag** — Tag the release commit as `v4.0.0.0` with the message "Added RPN Calculator and multiple new units."

## Relevant files
- `client/src/pages/home.tsx:5`
- `replit.md`
