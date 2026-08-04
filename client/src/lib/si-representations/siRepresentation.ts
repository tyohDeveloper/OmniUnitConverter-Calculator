/**
 * A single row that `generateSIRepresentations` produces for the "SI
 * representations" dropdown: a display symbol (e.g. "kg⋅m/s²"),
 * the derived-unit symbols the row was built from, a depth ranking
 * (0 for the raw base-units form, 1 for derived-unit compositions,
 * 2 for pulled-in category catalog units), and optional cross-domain
 * category matches (e.g. energy dimensions cross-matching torque).
 *
 * Consumers: RPN pane, calculator/converter controllers, locale helpers,
 * and `reexpressRpnEntry`. The shape is stable; adding fields to a
 * representation is a widening and safe.
 */
export interface SIRepresentation {
  displaySymbol: string;
  derivedUnits: string[];
  depth: number;
  crossDomainMatches?: string[];
}
