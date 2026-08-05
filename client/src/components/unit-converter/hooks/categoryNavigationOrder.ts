import type { UnitCategory } from '@/lib/units/unitCategory';

/**
 * Ordered category list for arrow-key navigation between categories
 * in the converter input. Order mirrors CATEGORY_GROUPS in
 * UnitConverterApp.tsx (the visible left-nav ordering); consumers
 * that navigate by keyboard should traverse this exact order.
 *
 * Historical note: this array used to live as CATEGORY_GROUPS_ALL
 * inside useConverterController.ts, partially duplicating
 * UnitConverterApp.tsx CATEGORY_GROUPS with drift (missing 'unitless'
 * in the 'Other' group). Extracting to a shared file didn't yet
 * merge the two sources; that would require refactoring the app
 * component to consume this same order-only list without losing
 * its group-name labels. Filed as a future task.
 *
 * Two-level shape retained (array of {categories}) so a future
 * unification with CATEGORY_GROUPS is a straightforward mechanical
 * change (add name field).
 */
export const CATEGORY_NAVIGATION_ORDER: ReadonlyArray<{ categories: UnitCategory[] }> = [
  { categories: ['length', 'mass', 'time', 'current', 'temperature', 'amount', 'intensity'] },
  { categories: ['area', 'volume', 'speed', 'acceleration', 'force', 'pressure', 'energy', 'power', 'torque', 'flow', 'density', 'viscosity', 'kinematic_viscosity', 'surface_tension', 'frequency', 'angular_velocity', 'momentum', 'angular_momentum'] },
  { categories: ['thermal_conductivity', 'specific_heat', 'entropy', 'concentration'] },
  { categories: ['charge', 'potential', 'capacitance', 'resistance', 'conductance', 'inductance', 'magnetic_flux', 'magnetic_density', 'electric_field', 'magnetic_field_h'] },
  { categories: ['radioactivity', 'radiation_dose', 'equivalent_dose', 'radiation_exposure', 'radioactive_decay', 'cross_section', 'photon', 'catalytic', 'angle', 'solid_angle', 'sound_pressure', 'sound_intensity', 'acoustic_impedance'] },
  { categories: ['luminous_flux', 'illuminance', 'luminance', 'refractive_power'] },
  { categories: ['data', 'fuel', 'fuel_economy', 'rack_geometry', 'shipping', 'beer_wine_volume', 'lightbulb', 'paper_sizes', 'typography', 'cooking', 'logarithmic', 'unitless'] },
  { categories: ['archaic_length', 'archaic_mass', 'archaic_volume', 'archaic_area', 'archaic_energy', 'archaic_power'] },
];
