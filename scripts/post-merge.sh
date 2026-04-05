#!/bin/bash
set -e

npm install

mkdir -p docs/tasks
cp .local/tasks/*.md docs/tasks/ 2>/dev/null || true
