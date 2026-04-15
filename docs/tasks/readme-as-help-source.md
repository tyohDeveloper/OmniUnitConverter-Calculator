# Copy Help Text to README

## What & Why
The user-facing help text (the five paragraphs, GitHub note, LLM note, and MIT license) currently lives in the English localization file. Copy it into `README.md` so GitHub visitors see the real app description.

## Done looks like
- `README.md` contains the help text content from the English localization keys (`help-para-1` through `help-llm-note`) along with the MIT license notice, written as clean GitHub-friendly Markdown.
- No changes are made to the app code.

## Out of scope
- Any changes to the app or its localization files.
- Anything beyond updating README.md.

## Tasks
1. **Rewrite README.md** — Replace the current content with the user-facing help text drawn from the English localization strings, formatted as clean Markdown. Retain a brief technical section (build instructions, license) at the end so the repo remains useful to developers.

## Relevant files
- `README.md`
- `client/src/data/localization/ui/en.json:129-136`
