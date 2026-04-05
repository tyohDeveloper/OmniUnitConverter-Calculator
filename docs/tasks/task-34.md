---
title: Copy task plans to docs/tasks on merge
---
# Copy Task Plans to docs/tasks on Merge

## What & Why
After each task merges, automatically copy all plan files from `.local/tasks/` into `docs/tasks/` so there is a visible, committed history of every task plan alongside the codebase.

## Done looks like
- Every time a task merges, all `.md` files from `.local/tasks/` are copied into `docs/tasks/`
- `docs/tasks/` is created automatically if it does not exist
- The copied files appear in git and can be committed normally
- Existing files in `docs/tasks/` are overwritten if the source has changed

## Out of scope
- Deleting files from `docs/tasks/` when a task is removed from `.local/tasks/`
- Any formatting or transformation of the copied files

## Tasks
1. **Update post-merge script** — Add a step to `scripts/post-merge.sh` that creates `docs/tasks/` if it does not already exist and copies all `.md` files from `.local/tasks/` into it.

2. **Bootstrap existing plans** — Run the copy step once immediately so `docs/tasks/` is populated with the current set of task plan files right away, rather than waiting for the next merge.

## Relevant files
- `scripts/post-merge.sh`