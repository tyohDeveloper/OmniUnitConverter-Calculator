# State Action/Selector Consolidation

## What & Why
73 single-function micro-files (42 actions + 31 selectors, ~197 lines total) in `state/actions/` and `state/selectors/` create disproportionate navigation and import overhead. Consolidating them into domain-grouped files reduces the file count to 8 and makes the state API faster to navigate and reason about.

## Done looks like
- `state/actions/` contains exactly 4 files: `converterActions.ts`, `rpnActions.ts`, `calculatorActions.ts`, `uiActions.ts`
- `state/selectors/` contains exactly 4 files: `converterSelectors.ts`, `rpnSelectors.ts`, `calculatorSelectors.ts`, `uiSelectors.ts`
- All original micro-files are deleted
- All import sites updated — nothing references the old individual files
- App behaviour is identical; all existing tests pass

## Out of scope
- Changes to the reducer files (`converterReducer.ts`, `rpnReducer.ts`, etc.)
- Changes to hooks or context
- Any logic changes — this is a mechanical file reorganisation only

## Tasks
1. **Create grouped action files** — Write the four domain action files, each containing all the action creators from the corresponding micro-files. Domain groupings: converter (setActiveCategory, setFromUnit, setToUnit, setFromPrefix, setToPrefix, setInputValue, setResult, setResultUnit, setResultPrefix, setResultCategory, setSelectedAlternative, swapUnits); rpn (clearStack, dropValue, pushValue, recallLastX, saveAndUpdateStack, setLastX, setRpnStack, setRpnXEditing, setRpnXEditValue, setRpnSelectedAlternative, setRpnResultPrefix, setPreviousRpnStack, setShiftActive, swapXY, undoStack, updateRpnStack); calculator (setCalcOp1, setCalcOp2, setCalculatorMode, setCalculatorPrecision, setCalcValues, updateCalcValues); ui (setActiveTab, setComparisonMode, setDirectExponents, setDirectValue, setLanguage, setNumberFormat, setPrecision, updateDirectExponents).

2. **Create grouped selector files** — Write the four domain selector files with the same domain groupings, each containing all selectors from the corresponding micro-files.

3. **Update all import sites** — Replace every import that references `state/actions/<singleFile>` or `state/selectors/<singleFile>` with the appropriate grouped file. The consumers are primarily the hooks (`useConverterState.ts`, `useRpnStack.ts`, `useCalculatorState.ts`) and `ConverterContext.tsx`.

4. **Delete the 73 original micro-files** — Remove all individual files from `state/actions/` and `state/selectors/` once import sites are updated and tests pass.

## Relevant files
- `client/src/components/unit-converter/state/actions/`
- `client/src/components/unit-converter/state/selectors/`
- `client/src/components/unit-converter/state/converterReducer.ts`
- `client/src/components/unit-converter/state/rpnReducer.ts`
- `client/src/components/unit-converter/state/calculatorReducer.ts`
- `client/src/components/unit-converter/state/uiPrefsReducer.ts`
- `client/src/components/unit-converter/hooks/useConverterState.ts`
- `client/src/components/unit-converter/hooks/useRpnStack.ts`
- `client/src/components/unit-converter/hooks/useCalculatorState.ts`
- `client/src/components/unit-converter/context/ConverterContext.tsx`
