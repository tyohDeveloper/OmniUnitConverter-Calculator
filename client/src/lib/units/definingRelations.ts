/**
 * Human-readable defining relations for non-linear units referenced via
 * `conversionFunction`, plus offset units, shown on the Sources page where a
 * simple "x = k base" line is impossible. Keys match
 * conversionFunctionRegistry entries. Exponents use Unicode superscripts.
 */
export const DEFINING_RELATIONS: Record<string, string> = {
  db_milliwatt: 'P = mW⋅10⁽ˣ⁄¹⁰⁾',
  db_microwatt: 'P = µW⋅10⁽ˣ⁄¹⁰⁾',
  db_watt: 'P = W⋅10⁽ˣ⁄¹⁰⁾',
  db_kilowatt: 'P = kW⋅10⁽ˣ⁄¹⁰⁾',
  db_volt: 'V = V⋅10⁽ˣ⁄²⁰⁾',
  db_microvolt: 'V = µV⋅10⁽ˣ⁄²⁰⁾',
  db_unloaded: 'V = √0.6 V⋅10⁽ˣ⁄²⁰⁾',
  db_spl: 'p = 20 µPa⋅10⁽ˣ⁄²⁰⁾',
  db_micropascal: 'p = µPa⋅10⁽ˣ⁄²⁰⁾',
  log_decibel: 'ratio = 10⁽ˣ⁄¹⁰⁾',
  log_bel: 'ratio = 10ˣ',
  log_neper: 'ratio = e²ˣ',
  log_stop: 'ratio = 2ˣ',
  log_decade: 'ratio = 10ˣ',
  ph_concentration: '[H⁺] = 10⁻ˣ mol/L',
  fuel_l_per_100km: 'km/L = 100 / x',
};
