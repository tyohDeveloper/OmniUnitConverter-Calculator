# OmniUnit - Universal Converter

## Overview
OmniUnit is a comprehensive, frontend-only web application built with React and TypeScript, designed to be a universal unit conversion tool. It features a "scientific archival" aesthetic and supports a vast array of measurement systems including SI, Imperial, US Customary, Archaic, and specialized industrial units. The application aims to produce a single, standalone HTML file for easy distribution, focusing on accuracy, extensive unit coverage, and a highly usable interface. Key capabilities include unit-aware calculations, RPN mode, cross-domain dimensional analysis, and multilingual support. Version v4.0.0.0.

## User Preferences
- Preferred communication style: Simple, everyday language
- Platform context: iPad using Replit iOS app or Chrome browser
- iOS limitation: WebKit causes unreliable WebSockets, HMR is disabled

## System Architecture
### Frontend-Only Architecture
- **Framework & Build System**: React 19 with TypeScript, Vite for building, Wouter for routing, and vite-plugin-singlefile for single-HTML production.
- **UI Component System**: shadcn/ui (New York variant) based on Radix UI, styled with Tailwind CSS v4, supporting theming via CSS variables.
- **State Management**: `useReducer`-based state modules (converterReducer, calculatorReducer, rpnReducer, uiPrefsReducer) composed via `ConverterContext`, using a one-file-per-concern structure for actions and selectors.
- **Conversion Logic**: Client-side engine with unit data organized in 70 per-category JSON files. Supports dimensional analysis, metric prefix handling, and a wide range of unit categories.

### Key Design Decisions
- **Calculator Modes**: Supports a standard calculator mode with three input fields and a result, and an RPN (Reverse Polish Notation) mode with a 4-level stack, both offering unit-aware operations. RPN includes HP-inspired functions and an undo mechanism.
- **Unit Categories**: Extensive categories including Math, Fuel Energy, Main Energy, Main Power, Archaic & Regional units, Photon/Light, Typography, Cooking Measures, Paper Sizes (ISO A/B, US, JIS B series — area-based), and Logarithmic Scales (dB, Bel, Neper, EV stops, log decades — power-ratio convention; pH lives in Concentration; information-entropy units Sh/nat/Hart/deciban/dit live in Data/Information).
- **Type Safety**: End-to-end TypeScript with strict mode and Zod for schema validation.
- **SI Prefix Handling**: Intelligent prefixing, including special handling for kilogram (kg) vs. gram (g), binary prefixes for data, and auto-switching for complex kg-based SI units.
- **Scientific Notation**: Automatic display and input support for very small or very large numbers.
- **Dates/Eras Tab**: Standalone year/era converter (last tab), deliberately isolated from the unit engine. Converts via astronomical CE year hub (year 0 = 1 BCE): 19 fixed-offset schemes (incl. Seleucid, Yazdegerdi, Kali Yuga, Bengali San, Kollam, Nepal Sambat, Chula Sakarat), approximate lunar Hijri, data-driven era tables — full Japanese nengō (Taika 645 → Reiwa; for the Nanboku-chō period 1336–1392 a separate Southern Court table `japaneseSouthernEras.json` shows both lines, e.g. "Ryakuō 1 / Engen 3 (Southern)", and reverse lookup resolves Southern names) and Chinese niánhào orthodox line (Han → Qing, ends 1912, dynasty annotations, `epoch` field for transition-year counting) — plus a Historical Periods reference widget grouped into 5 regional sections (Africa incl. Kush/Aksum/West African empires/Zimbabwe/Benin/Ethiopia/Zulu; Middle East; East Asia; Mesoamerica incl. Olmec/Zapotec/Teotihuacan/Maya/Toltec/Aztec; Andes incl. Chavín/Nazca/Moche/Wari/Tiwanaku/Chimú/Inca). Includes reverse era-name lookup: an autocomplete input ("Meiji 33", "Kāngxī 39", diacritic-insensitive; native kanji/hanzi input like "明治 33" / "康熙 39" also matches, with single-CJK-character suggestion prefixes) resolves era + year to CE via `reverseLookupEraTable` (Japanese nengō allow a one-year overlap at mid-year transitions; Chinese don't) and applies it to the all-schemes table. Roman consular dating: a per-year eponym table (`romanConsuls.json`, 100 BCE–14 CE ordinary consuls only) shown as a Europe/Mediterranean row via `lookupRomanConsuls` (direct array index, "—" outside range). Includes a Hijri Date Converter card: full-date (day/month/year) Gregorian ↔ tabular Hijri conversion via JDN, with localized month names and a civil/astronomical epoch toggle (Friday JDN 1948440 vs Thursday 1948439; day-level only, note text explains the one-day difference). Also a Rulers & Reigns reference card (below Historical Periods): region picker (Persia, Rome & Europe, Egypt, China, Maya), curated major-ruler lists grouped by dynasty/kingdom (Maya grouped by city-state), current-year reign highlighting via `lookupRulers` (supports overlaps/co-regencies and concurrent Maya kings), explicit gap notes (e.g. Persia 330–247 BCE Macedonian/Seleucid rule), "ca." circa flags, per-region Wikipedia source links; data in `rulersReigns.json` is region-extensible (new region = new JSON entry only). Schemes and results grouped into 7 regional sections. Non-Jan-1 schemes and lunisolar era-table years show ±1 indicators. Data in `client/src/data/eras/`, logic in `client/src/lib/eras/`.
- **Comparison Mode**: Allows simultaneous conversion of an input to up to 8 different units with optimal prefix display.
- **Smart Paste**: Intelligently parses "number unit" text for direct input into appropriate fields and tabs.
- **Cross-Domain Dimensional Analysis**: Calculator results can show related quantity categories with matching dimensions (e.g., Energy ↔ Torque).
- **SI Representation Constraints**: Ensures logical display of base and derived units, with coherent SI derived units available.
- **Multilingual Support**: JSON-based localization for 12 languages, translating unit names while preserving standard symbols and SI prefixes. Handles British/American spelling variants.
- **Refactoring Rules**: Strict code quality rules for pure-function files (<100 lines per file, <20 lines per function, max 1 exported function per file) to maintain modularity and readability.

### Build & Deployment
- **Build Process**: Vite generates a single `dist/public/index.html` file.
- **Testing**: Comprehensive Vitest unit tests and Playwright e2e tests (30 files, 1866 tests) covering conversion, localization, calculator logic, formatting, RPN, and edge cases.
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