# OmniUnit - Universal Converter

## Overview
OmniUnit is a comprehensive, frontend-only web application built with React and TypeScript, designed to be a universal unit conversion tool. It features a "scientific archival" aesthetic and supports a vast array of measurement systems including SI, Imperial, US Customary, Archaic, and specialized industrial units. The application aims to produce a single, standalone HTML file for easy distribution, focusing on accuracy, extensive unit coverage, and a highly usable interface. Key capabilities include unit-aware calculations, RPN mode, cross-domain dimensional analysis, and multilingual support. Version v3.2.1.1.

## User Preferences
- Preferred communication style: Simple, everyday language
- Platform context: iPad using Replit iOS app or Chrome browser
- iOS limitation: WebKit causes unreliable WebSockets, HMR is disabled

## System Architecture
### Frontend-Only Architecture
- **Framework & Build System**: React 19 with TypeScript, Vite for building, Wouter for routing, and vite-plugin-singlefile for single-HTML production.
- **UI Component System**: shadcn/ui (New York variant) based on Radix UI, styled with Tailwind CSS v4, supporting theming via CSS variables.
- **State Management**: `useReducer`-based state modules (converterReducer, calculatorReducer, rpnReducer, uiPrefsReducer) composed via `ConverterContext`, using a one-file-per-concern structure for actions and selectors.
- **Conversion Logic**: Client-side engine with unit data organized in 69 per-category JSON files. Supports dimensional analysis, metric prefix handling, and a wide range of unit categories.

### Key Design Decisions
- **Calculator Modes**: Supports a standard calculator mode with three input fields and a result, and an RPN (Reverse Polish Notation) mode with a 4-level stack, both offering unit-aware operations. RPN includes HP-inspired functions and an undo mechanism.
- **Unit Categories**: Extensive categories including Math, Fuel Energy, Main Energy, Main Power, Archaic & Regional units, Photon/Light, Typography, and Cooking Measures.
- **Type Safety**: End-to-end TypeScript with strict mode and Zod for schema validation.
- **SI Prefix Handling**: Intelligent prefixing, including special handling for kilogram (kg) vs. gram (g), binary prefixes for data, and auto-switching for complex kg-based SI units.
- **Scientific Notation**: Automatic display and input support for very small or very large numbers.
- **Comparison Mode**: Allows simultaneous conversion of an input to up to 8 different units with optimal prefix display.
- **Smart Paste**: Intelligently parses "number unit" text for direct input into appropriate fields and tabs.
- **Cross-Domain Dimensional Analysis**: Calculator results can show related quantity categories with matching dimensions (e.g., Energy ↔ Torque).
- **SI Representation Constraints**: Ensures logical display of base and derived units, with coherent SI derived units available.
- **Multilingual Support**: JSON-based localization for 12 languages, translating unit names while preserving standard symbols and SI prefixes. Handles British/American spelling variants.
- **Refactoring Rules**: Strict code quality rules for pure-function files (<100 lines per file, <20 lines per function, max 1 exported function per file) to maintain modularity and readability.

### Build & Deployment
- **Build Process**: Vite generates a single `dist/public/index.html` file.
- **Testing**: Comprehensive Vitest unit tests and Playwright e2e tests (17 files, 1432 tests) covering conversion, localization, calculator logic, formatting, RPN, and edge cases.
- **CI Scripts**: Automation for enforcing code quality (lint-size.mjs) and verifying build output (verify-build.mjs).

### Modular File Structure
- **Unit Data (`client/src/data/`)**: JSON files for conversion categories and localization (UI strings, unit name translations).
- **Core Libraries (`client/src/lib/`)**: Centralized utilities for conversion data loading, number formatting, and localization.
- **Calculator Module (`client/src/lib/calculator/`)**: Highly modular, pure-function files for dimensional analysis and calculator operations.
- **Unit System (`client/src/lib/units/`)**: Defines unit types, SI/non-SI unit catalogs, dimensional formulas, and prefix handling.
- **Feature: Unit Converter (`client/src/features/unit-converter/`)**: Contains the main application logic and UI components for the converter and calculator panes.
- **State Layer (`client/src/components/unit-converter/`)**: Manages application state through reducers, actions, selectors, and hooks.
- **Other Components (`client/src/components/`)**: Includes help documentation and shadcn/ui components.

## External Dependencies
- **Radix UI**: Accessible UI component primitives.
- **Lucide React**: Iconography library.
- **cmdk**: Command palette functionality.
- **class-variance-authority** and **clsx**: Utilities for conditional styling.
- **@replit/vite-plugins**: Replit-specific development tools (error modal, cartographer, dev banner).
- **vite-plugin-singlefile**: For single HTML file production builds.
- **react-hook-form** and **@hookform/resolvers**: Form state management and validation integration.
- **zod**: Schema validation library.
- **@tailwindcss/vite**, **autoprefixer**, **tailwindcss-animate**: Tailwind CSS v4 integration and animation utilities.