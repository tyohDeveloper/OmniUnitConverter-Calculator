# Select Input Text on Focus

## What & Why
When a user clicks into any input field, the existing value should be fully selected automatically. This lets the user start typing immediately without having to manually clear the old value first. Applies to every input across the app — converter, calculator, direct pane, and any other forms.

## Done looks like
- Clicking any input field in the app selects all existing text; typing replaces it instantly.
- Clicking away (blur) still triggers any existing formatting/parsing logic as before — no regression.
- If a specific input already has its own onFocus handler, both run (the select-all composes with, not replaces, any existing handler).

## Out of scope
- Changing any blur, parsing, or formatting behaviour.
- Keyboard-only / tab navigation changes.

## Tasks
1. Add select-all-on-focus to the shared `Input` component so it applies globally to every field built on it. Compose with any caller-provided `onFocus` prop so existing handlers are not lost.
2. Apply the same select-all-on-focus to any raw `<input>` elements that do not use the shared `Input` component (e.g. the RPN X-register field in CalculatorPane).

## Relevant files
- `client/src/components/ui/input.tsx`
- `client/src/features/unit-converter/components/CalculatorPane.tsx:815-860`
- `client/src/features/unit-converter/components/ConverterPane.tsx`
- `client/src/features/unit-converter/components/DirectPane.tsx`
