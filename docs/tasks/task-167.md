---
title: Commit and tag dates & eras WIP (v4.x.date.era)
---
# Commit and tag dates & eras WIP

## What & Why
Preserve the current work-in-progress on the Dates & Eras feature before the user reverts it. The changes should be committed and marked with a git tag so they can be examined later.

## Done looks like
- All current uncommitted changes (especially dates & eras work) are committed to git.
- An annotated git tag `v4.x.date.era` exists pointing at that commit, with the message: "This is a confused attempt at handling dates."
- The working tree is clean afterward, so the user can safely revert/roll back while the tagged commit preserves the WIP.

## Out of scope
- Reverting or rolling back the changes (the user will do this separately).
- Any code changes, fixes, or refactoring of the dates & eras feature.

## Steps
1. **Commit WIP** — Stage and commit all outstanding changes with a clear commit message noting this is preserved dates & eras work-in-progress.
2. **Create annotated tag** — Create the annotated tag `v4.x.date.era` on that commit with the message "This is a confused attempt at handling dates."
3. **Verify** — Confirm the tag exists and points at the commit containing the WIP.

## Relevant files
- `client/src/data/eras/`
- `client/src/lib/eras/`