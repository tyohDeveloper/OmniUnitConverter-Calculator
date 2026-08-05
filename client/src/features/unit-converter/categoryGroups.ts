import type { UnitCategory } from '@/lib/units/unitCategory';

/**
 * The single source of truth for category ordering and grouping in
 * the unit-converter UI.
 *
 * Consumed by two callers under features/unit-converter/ and
 * components/unit-converter/hooks/:
 *
 *   - UnitConverterApp: renders the group name as a header in the
 *     left-nav and iterates `categories` under it. Uses the `name`
 *     field.
 *
 *   - useConverterInputHandlers: flattens `categories` for arrow-key
 *     navigation ordering. Ignores the `name` field.
 *
 * Historical note: this file replaces two drifted duplicates — the
 * app-side CATEGORY_GROUPS (which had 'unitless' in the 'Other' group)
 * and the hook-side CATEGORY_GROUPS_ALL (which did not, causing
 * arrow-key nav to skip 'unitless'). The drift was fixed in
 * commit d23b8d5; this file consolidates the two sources into one.
 *
 * Adding a new category: add its id to the appropriate group here.
 * If it's a new category id, also add it to UnitCategory in
 * lib/units/unitCategory.ts, add the JSON file under
 * data/conversion/, and add the CATEGORY_DIMENSIONS entry — the
 * tests in json-integrity.test.ts fail loudly if any step is missed.
 */
export interface CategoryGroup {
  readonly name: string;
  readonly categories: ReadonlyArray<UnitCategory>;
}

export const CATEGORY_GROUPS: ReadonlyArray<CategoryGroup> = [
  { name: 'Base Quantities', categories: ['length', 'mass', 'time', 'current', 'temperature', 'amount', 'intensity'] },
  { name: 'Mechanics', categories: ['area', 'volume', 'speed', 'acceleration', 'force', 'pressure', 'energy', 'power', 'torque', 'flow', 'density', 'viscosity', 'kinematic_viscosity', 'surface_tension', 'frequency', 'angular_velocity', 'momentum', 'angular_momentum'] },
  { name: 'Thermodynamics & Chemistry', categories: ['thermal_conductivity', 'specific_heat', 'entropy', 'concentration'] },
  { name: 'Electricity & Magnetism', categories: ['charge', 'potential', 'capacitance', 'resistance', 'conductance', 'inductance', 'magnetic_flux', 'magnetic_density', 'electric_field', 'magnetic_field_h'] },
  { name: 'Radiation & Physics', categories: ['radioactivity', 'radiation_dose', 'equivalent_dose', 'radiation_exposure', 'radioactive_decay', 'cross_section', 'photon', 'catalytic', 'angle', 'solid_angle', 'sound_pressure', 'sound_intensity', 'acoustic_impedance'] },
  { name: 'Human Response', categories: ['luminous_flux', 'illuminance', 'luminance', 'refractive_power'] },
  { name: 'Other', categories: ['data', 'fuel', 'fuel_economy', 'rack_geometry', 'shipping', 'beer_wine_volume', 'lightbulb', 'paper_sizes', 'typography', 'cooking', 'logarithmic', 'timezone', 'unitless'] },
  { name: 'Archaic & Regional', categories: ['archaic_length', 'archaic_mass', 'archaic_volume', 'archaic_area', 'archaic_energy', 'archaic_power'] },
];
