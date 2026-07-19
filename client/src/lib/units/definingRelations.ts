/**
 * Human-readable defining relations for non-linear units referenced via
 * `conversionFunction`, plus offset units, shown on the Sources page where a
 * simple "1 x = k base" line is impossible. Keys match
 * conversionFunctionRegistry entries.
 */
export const DEFINING_RELATIONS: Record<string, string> = {
  db_milliwatt: 'P = 1 mW × 10^(x/10)',
  db_microwatt: 'P = 1 µW × 10^(x/10)',
  db_watt: 'P = 1 W × 10^(x/10)',
  db_kilowatt: 'P = 1 kW × 10^(x/10)',
  db_volt: 'V = 1 V × 10^(x/20)',
  db_microvolt: 'V = 1 µV × 10^(x/20)',
  db_unloaded: 'V = √0.6 V × 10^(x/20)',
  db_spl: 'p = 20 µPa × 10^(x/20)',
  db_micropascal: 'p = 1 µPa × 10^(x/20)',
  log_decibel: 'ratio = 10^(x/10)',
  log_bel: 'ratio = 10^x',
  log_neper: 'ratio = e^(2x)',
  log_stop: 'ratio = 2^x',
  log_decade: 'ratio = 10^x',
  ph_concentration: '[H⁺] = 10^(−x) mol/L',
};
