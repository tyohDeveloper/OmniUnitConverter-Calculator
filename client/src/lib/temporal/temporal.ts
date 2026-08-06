// EXCEPTION [architecture-standards §3.8]: source-selection shim for
// the Temporal API. This file re-exports the polyfill's `Temporal`
// binding under an app-owned import path so every consumer imports
// from `@/lib/temporal/temporal` rather than either `temporal-polyfill`
// or `window.Temporal`. That indirection is the whole point — it lets
// us swap the underlying implementation (polyfill → native browser
// Temporal) later without touching any consumer file.
//
// This is a §1.6 single-source declaration for the app's Temporal
// binding, distinct from a barrel: barrels launder domain boundaries
// across many symbols; this file owns exactly one choice (which
// implementation of Temporal the app uses).
//
// Removal deadline: when native Temporal is fully deployed and mature
// across the app's browser matrix (Chrome 144+, Firefox 139+, and
// their Safari and Edge equivalents shipped and stable for at least
// one major-version cycle in each). Migration = change the import
// below to reference `window.Temporal` instead. Owner: whoever picks
// up the Temporal work next.
//
// Import path: `temporal-polyfill/full` (not the default entry).
// The default entry ships only `gregory` and `iso8601` calendars;
// the `/full` subpath adds the exotic calendars (Hebrew, Islamic-
// Umalqura, Coptic, Ethiopic, Persian, Chinese, Japanese, ROC,
// Buddhist, Indian, and the Islamic tabular variants) that the Date
// category needs. Bundle cost of choosing `/full` over default:
// ~3.5 kB gzipped. See docs/tasks/temporal-date-category.md for the
// full capability review.

import { Temporal } from 'temporal-polyfill/full';

export { Temporal };
