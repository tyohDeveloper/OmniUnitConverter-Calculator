# Fix Missing ConverterProvider Wrapper

## What & Why
The app crashes on load with "useConverterContext must be used within a ConverterProvider". `UnitConverterApp` uses `useRpnStack`, which internally calls `useConverterContext()`, but `ConverterProvider` is never present in the component tree above `UnitConverterApp`. The provider needs to be added so the context is available.

## Done looks like
- The app loads without a runtime error in the browser
- The unit converter UI renders and is interactive

## Out of scope
- Refactoring UnitConverterApp's local state to use the context reducers
- Any UI or feature changes

## Tasks
1. **Add ConverterProvider to the component tree** — Wrap `<UnitConverterApp />` in `<ConverterProvider>` in `home.tsx`, or wrap it at the root of `UnitConverterApp` itself, so all hooks that call `useConverterContext()` have access to the context value.

## Relevant files
- `client/src/pages/home.tsx`
- `client/src/components/unit-converter/context/ConverterContext.tsx`
- `client/src/features/unit-converter/app/UnitConverterApp.tsx`
