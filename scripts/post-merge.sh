#!/bin/bash
set -e

npm install

# Copy all task plan files from .local/tasks/ into docs/tasks/ so there is a
# visible, committed history of every task plan alongside the codebase.
mkdir -p docs/tasks
cp .local/tasks/*.md docs/tasks/ 2>/dev/null || true

# Regenerate unit reference documents from the conversion JSON data.
node scripts/generate-unit-docs.mjs
