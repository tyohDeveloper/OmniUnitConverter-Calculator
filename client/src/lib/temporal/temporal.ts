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

import { Temporal } from 'temporal-polyfill';

export { Temporal };
