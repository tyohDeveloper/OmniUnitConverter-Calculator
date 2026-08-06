# Bump version to v5.2.0.0 and tag

## What & Why
Bump the app version to 5.2.0.0, commit and push to GitHub, and create an annotated tag `v5.2.0.0` whose message references the Football Field (US) changes. Runs after the football field tasks merge so the tag actually covers them.

## Done looks like
- App displays version 5.2.0.0
- Commit pushed to the GitHub remote main branch
- Annotated tag `v5.2.0.0` exists on GitHub with a message referencing the Football Field Area (US) unit addition and the Football Field → Football Field (US) rename

## Out of scope
- Any feature or unit-data changes
- Release notes beyond the tag message

## Steps
1. **Version bump** — Update the version string to 5.2.0.0 in the three places it appears: the APP_VERSION constant in the home page, package.json, and package-lock.json (keep them in sync, matching the prior 5.1.0.0 bump pattern).
2. **Commit & push** — Commit the version bump and push to the GitHub remote per the git-remote skill.
3. **Tag** — Create annotated tag `v5.2.0.0` with a comment referencing the football field changes (new Football Field Area (US) unit and rename of Football Field to Football Field (US)) and push the tag.

## Relevant files
- `client/src/pages/home.tsx:5`
- `package.json`
- `package-lock.json`
