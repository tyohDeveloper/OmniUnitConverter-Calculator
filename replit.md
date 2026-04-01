# OmniUnit - Universal Converter

**Version: 3.1.0.0**

## Overview
OmniUnit is a comprehensive, frontend-only unit conversion web application built with React and TypeScript. Its primary purpose is to provide a universal conversion tool with a "scientific archival" aesthetic, supporting a vast array of measurement systems including SI, Imperial, US Customary, Archaic, and specialized industrial units. The application produces a single, standalone HTML file for easy distribution, emphasizing accuracy and usability.

## User Preferences
- Preferred communication style: Simple, everyday language
- Platform context: iPad using Replit iOS app or Chrome browser
- iOS limitation: WebKit causes unreliable WebSockets, HMR is disabled

## System Architecture
### Frontend-Only Architecture
- **Framework & Build System**: React 19 with TypeScript, Vite for building, Wouter for routing, and vite-plugin-singlefile for single-HTML production builds.
- **UI Component System**: shadcn/ui (New York variant) based on Radix UI, styled with Tailwind CSS v4. Theming is supported via CSS variables.
- **State Management**: Local React state (useState, useRef) and custom hooks are used.
- **Conversion Logic**: Client-side engine featuring a comprehensive unit catalog, dimensional analysis, metric prefix support, and a wide range of unit categories (length, mass, time, temperature, area, volume, energy, pressure, specialized units).

### Key Design Decisions
- **Calculator Layout**: CSS Grid-based layout with four arithmetic operators. Addition and subtraction require dimensional compatibility.
- **Calculator Input**: Stack fields (s3, s2, y) are read-only; X field is directly editable with parseUnitText parsing for entering values with units. Data can also be entered via copy buttons from Converter or Custom tabs, or the Paste button.
- **Dual Calculator Modes**: "CALCULATOR⇅" mode (three input fields + result) and "CALCULATOR - RPN⇅" mode with a 4-level stack (default). Both modes support unit-aware operations.
- **RPN Features**: HP-inspired design with trigonometric, hyperbolic, power, root, and rounding functions. Includes LASTx register (saves X before operations for error correction), x⇆y swap function, +/− (change sign), ABS (absolute value). Undo mechanism implemented. S3 row has 7 buttons, Y row has 8 positions including enter/drop (double-width), binary operations, LASTx/swap.
- **Trigonometric/Hyperbolic Functions**: Preserve dimensions if input has units other than dimensionless, rad, or sr; otherwise, output is unitless.
- **Rounding Functions**: `rnd` (banker's rounding) and `trunc` (truncate) preserve dimensions.
- **Clipboard Copying**: Supports precision settings and "Normalize & Copy" for converting to SI units with optimal prefixing and dimensional analysis to derived units (J, N, W, etc.).
- **Unit Categories**: Includes dedicated categories for Math (dimensionless output), Fuel Energy, Main Energy, Main Power, Archaic & Regional units (Length, Mass, Volume, Area, Energy, Power), Photon/Light, Typography, and Cooking Measures.
- **Type Safety**: End-to-end TypeScript coverage with strict mode and Zod for schema validation.
- **Modularity**: Component-based UI, client-side conversion logic, and plugin-based Vite configuration.
- **SI Prefix Handling**: Kilogram (kg) does not allow prefixes to prevent stacking. Gram (g) allows prefixes. Binary prefixes (Ki, Mi, Gi) are exclusive to the Data/Information category. Complex kg-based SI units have g-based companions that allow prefixes and auto-switch to kg when a kilo prefix is selected. Prefixes reset to 'none' when changing units.
- **Scientific Notation**: Automatically displays for very small (<1e-6), very large (>=1e8), or values that would round to zero. Precision setting controls significant figures. Input also accepts scientific notation.
- **CGS Unit Prefixes**: Most CGS base units support prefixes, but pre-prefixed units (e.g., centipoise) do not allow additional prefixes.
- **Comparison Mode**: Allows simultaneous conversion of input to up to 8 units with optimal prefix display.
- **Smart Paste**: Parses "number unit" text into value, unit, prefix, category, and dimensions, directing to appropriate tabs.
- **Symbol Conflict Prevention**: Unit symbols are unique to prevent overwrites, with specific naming conventions for half-life, poise, and minim.
- **Cross-Domain Dimensional Analysis**: Calculator result dropdown shows related quantity categories with matching dimensions (e.g., Energy ↔ Torque). Certain categories (Archaic, specialty, Data, Math) are excluded.
- **Calculator Module**: Extracted logic for dimensional analysis, formatting, and arithmetic operations.
- **SI Representation Constraints**: Base unit expressions appear last in dropdowns. Derived representations cannot have more terms than the base. Frequency displays as s⁻¹, with Bq (Becquerel) for radioactivity sharing s⁻¹ dimensions. Coherent SI derived units (rad, sr, lm, lx, Gy, Sv, kat) are available.
- **Multilingual Support**: Supports 12 languages with translated unit names, while symbols and SI prefixes remain standard. Asian units display native characters.

### Build & Deployment
- **TypeScript Configuration**: Strict mode, path aliases, ESNext modules.
- **Build Process**: Vite for development; `npm run build` generates a single `dist/public/index.html` file.
- **Testing**: Extensive unit (Vitest, React Testing Library) and end-to-end (Playwright) tests covering conversion, localization, calculator logic, formatting, smart paste, RPN, edge cases, math functions, and precision comparison.

### Modular File Structure
The codebase is organized for multi-person development collaboration:

**Core Libraries (`client/src/lib/`)**:
- `conversion-data.ts` - Unit definitions, conversion functions, and parsing logic (~2140 lines)
- `calculator.ts` - Calculator-specific logic (~1002 lines): dimensional analysis, formatting (formatDimensions, toSuperscript), operations (multiplyDimensions, divideDimensions), helpers (dimensionsEqual, isDimensionless, findCrossDomainMatches, isValidSymbolRepresentation, countUnits, findDerivedUnitPower, canAddSubtract, canFactorOut, hasOnlyOriginalDimensions, getDerivedUnit), SI representation generation (generateSIRepresentations, formatSIComposition, sumAbsExponents), normalization (normalizeDimensions, NORMALIZABLE_DERIVED_UNITS, canApplyDerivedUnit, subtractDerivedUnit), alternative representations (generateAlternativeRepresentations, AlternativeRepresentation), types (CalcValue, DimensionalFormula)
- `unit-translations.ts` - Unit name translations for 12 languages (~1101 lines), extracted from unit-converter.tsx
- `formatting.ts` - Number formatting utilities (~232 lines): separators, precision, Arabic numerals, toTitleCase, parseNumberWithFormat, formatNumberWithFormat
- `localization.ts` - UI translation data for 12 languages
- `test-utils.ts` - Testing helpers

**Unit System (`client/src/lib/units/`)**:
- `types.ts` - Core type definitions (UnitCategory, Prefix, UnitDefinition, CategoryDefinition)
- `prefixes.ts` - SI and binary prefix definitions with helper functions
- `shared-types.ts` - Shared interfaces (DimensionalFormula, CalcValue, SI_DERIVED_UNITS, NON_SI_UNITS_CATALOG, CATEGORY_DIMENSIONS, getDimensionSignature)
- `helpers.ts` - Pure helper functions (~456 lines): mass normalization, dimensional analysis, cross-domain matching, regional spelling, prefix constants, findBestPrefix
- `index.ts` - Central export aggregator for all unit-related code

**Feature: Unit Converter (`client/src/features/unit-converter/`)**:
- `app/UnitConverterApp.tsx` - Thin controller: all business logic, state, and event handlers; renders pane components via props
- `components/ConverterPane.tsx` - Converter card JSX (From/To inputs, prefix selectors, swap, comparison mode)
- `components/DirectPane.tsx` - Custom SI base unit entry card (value input, dimension grid, copy/paste)
- `components/CalculatorPane.tsx` - Calculator card (simple 3-field mode + RPN 4-level stack mode, all button grids)

**Components (`client/src/components/`)**:
- `unit-converter/components/` - Shared UI components:
  - `CalculatorFieldDisplay.tsx` - Reusable calculator field display component with animation support (~78 lines)
- `unit-converter/hooks/` - Custom hooks for state management:
  - `useRpnStack.ts` - RPN calculator stack state with operations (push, drop, swap, undo, lastX) - **INTEGRATED**
  - `useFlashFlag.ts` - Reusable hook for copy feedback flash animations - **INTEGRATED** (useAllFlashFlags)
  - `useConverterState.ts` - Converter tab state (available, wraps input/category/unit/prefix/precision state)
  - `useCalculatorState.ts` - Calculator mode state (available, wraps calc values/operators/result state)
- `unit-converter/context/` - React context for tab extraction (foundation):
  - `ConverterContext.tsx` - Wraps all state hooks (useConverterState, useCalculatorState, useRpnStack, useAllFlashFlags) for future tab component extraction. Requires memoization and effect orchestration for production use.
- `unit-converter/constants.ts` - Layout constants (FIELD_HEIGHT, CommonFieldWidth, etc.) and ISO_LANGUAGES array (~24 lines)
- `help-section.tsx` - Help documentation component
- `ui/` - shadcn/ui component library

**Tests (`tests/`)**:
- 12 test files with 1092 total tests
- Coverage: conversion, localization, calculator, formatting, smart paste, RPN, edge cases, math, precision, hooks, shared-types

## External Dependencies
### UI Libraries
- **Radix UI**: Primitives for accessible UI components.
- **Lucide React**: Iconography.
- **cmdk**: Command palette functionality.
- **class-variance-authority** and **clsx**: Conditional styling.

### Development Tools
- **@replit/vite-plugin-runtime-error-modal**: Error overlay.
- **@replit/vite-plugin-cartographer** and **@replit/vite-plugin-dev-banner**: Replit integration.
- **vite-plugin-singlefile**: Single HTML file production builds.

### Form Handling
- **react-hook-form**: Form state management.
- **@hookform/resolvers**: Validation integration.
- **zod**: Schema validation.

### Styling
- **@tailwindcss/vite**: Tailwind CSS v4 integration.
- **autoprefixer**: CSS vendor prefixing.
- **tailwindcss-animate**: Animation utilities.
- **Custom fonts**: Space Grotesk, IBM Plex Mono, Inter.