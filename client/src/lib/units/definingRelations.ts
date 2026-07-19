/**
 * Human-readable defining relations for non-linear units referenced via
 * `conversionFunction`, plus offset units, shown on the Sources page where a
 * simple "x = k base" line is impossible. Keys match
 * conversionFunctionRegistry entries. Single-character exponents use Unicode
 * superscripts; fractional exponents use caret notation (10^(x/10)) because
 * superscript parentheses render poorly.
 */
export const DEFINING_RELATIONS: Record<string, string> = {
  db_milliwatt: 'P = mW⋅10^(x/10)',
  db_microwatt: 'P = µW⋅10^(x/10)',
  db_watt: 'P = W⋅10^(x/10)',
  db_kilowatt: 'P = kW⋅10^(x/10)',
  db_volt: 'V = V⋅10^(x/20)',
  db_microvolt: 'V = µV⋅10^(x/20)',
  db_unloaded: 'V = √0.6 V⋅10^(x/20)',
  db_spl: 'p = 20 µPa⋅10^(x/20)',
  db_micropascal: 'p = µPa⋅10^(x/20)',
  log_decibel: 'ratio = 10^(x/10)',
  log_bel: 'ratio = 10ˣ',
  log_neper: 'ratio = e²ˣ',
  log_stop: 'ratio = 2ˣ',
  log_decade: 'ratio = 10ˣ',
  ph_concentration: '[H⁺] = 10⁻ˣ mol/L',
  fuel_l_per_100km: 'km/L = 100 / x',
};
