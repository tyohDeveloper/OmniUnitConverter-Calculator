import { describe, it, expect } from 'vitest';
import { lookupUnitForSymbol } from '../client/src/lib/calculator/lookupUnitForSymbol';
import { displayToSI } from '../client/src/lib/calculator/displayToSI';
import { siToDisplay } from '../client/src/lib/calculator/siToDisplay';

describe('lookupUnitForSymbol', () => {
  it('returns factor/offset/isInverse for a known length unit (m)', () => {
    const result = lookupUnitForSymbol('m');
    expect(result).not.toBeNull();
    expect(result!.factor).toBeCloseTo(1, 9);
    expect(result!.offset).toBe(0);
    expect(result!.isInverse).toBe(false);
    expect(result!.categoryId).toBe('length');
  });

  it('returns factor for a non-SI length unit (in)', () => {
    const result = lookupUnitForSymbol('in');
    expect(result).not.toBeNull();
    expect(result!.factor).toBeCloseTo(0.0254, 9);
  });

  it('returns factor for a non-SI length unit (ft)', () => {
    const result = lookupUnitForSymbol('ft');
    expect(result).not.toBeNull();
    expect(result!.factor).toBeCloseTo(0.3048, 9);
  });

  it('returns offset for Celsius (°C)', () => {
    const result = lookupUnitForSymbol('°C');
    expect(result).not.toBeNull();
    expect(result!.categoryId).toBe('temperature');
    expect(result!.offset).not.toBe(0);
  });

  it('returns null for composite SI symbols like m²·s⁻¹', () => {
    expect(lookupUnitForSymbol('m²·s⁻¹')).toBeNull();
  });

  it('returns null for unknown symbols', () => {
    expect(lookupUnitForSymbol('xyz_unknown')).toBeNull();
  });
});

describe('displayToSI — SI units', () => {
  it('1 m (base, no prefix) → 1 m (SI)', () => {
    expect(displayToSI(1, 'm', 'none')).toBeCloseTo(1, 9);
  });

  it('100 cm → 1 m (SI) [prefix centi = 0.01]', () => {
    expect(displayToSI(100, 'm', 'centi')).toBeCloseTo(1, 9);
  });

  it('1 km → 1000 m (SI) [prefix kilo = 1000]', () => {
    expect(displayToSI(1, 'm', 'kilo')).toBeCloseTo(1000, 9);
  });
});

describe('displayToSI — non-SI units', () => {
  it('1 ft → 0.3048 m (SI)', () => {
    expect(displayToSI(1, 'ft', 'none')).toBeCloseTo(0.3048, 9);
  });

  it('12 in → 0.3048 m (SI)', () => {
    expect(displayToSI(12, 'in', 'none')).toBeCloseTo(0.3048, 9);
  });

  it('1 mi → 1609.344 m (SI)', () => {
    expect(displayToSI(1, 'mi', 'none')).toBeCloseTo(1609.344, 6);
  });
});

describe('displayToSI — temperature (offset-aware)', () => {
  it('0 °C → 273.15 K (SI)', () => {
    expect(displayToSI(0, '°C', 'none')).toBeCloseTo(273.15, 6);
  });

  it('100 °C → 373.15 K (SI)', () => {
    expect(displayToSI(100, '°C', 'none')).toBeCloseTo(373.15, 6);
  });

  it('32 °F → 273.15 K (SI)', () => {
    expect(displayToSI(32, '°F', 'none')).toBeCloseTo(273.15, 3);
  });

  it('212 °F → 373.15 K (SI)', () => {
    expect(displayToSI(212, '°F', 'none')).toBeCloseTo(373.15, 3);
  });
});

describe('displayToSI — composite SI symbols (null lookup)', () => {
  it('1 m²·s⁻¹ with centi prefix → 0.01 (prefix-only scaling for unknown composite)', () => {
    expect(displayToSI(1, 'm²·s⁻¹', 'centi')).toBeCloseTo(0.01, 9);
  });
});

describe('siToDisplay — SI units (round-trip)', () => {
  it('1 m (SI) → 1 m (base, no prefix)', () => {
    expect(siToDisplay(1, 'm', 'none')).toBeCloseTo(1, 9);
  });

  it('1 m (SI) → 100 cm (prefix centi)', () => {
    expect(siToDisplay(1, 'm', 'centi')).toBeCloseTo(100, 9);
  });

  it('1000 m (SI) → 1 km (prefix kilo)', () => {
    expect(siToDisplay(1000, 'm', 'kilo')).toBeCloseTo(1, 9);
  });
});

describe('siToDisplay — non-SI units', () => {
  it('0.3048 m (SI) → 1 ft', () => {
    expect(siToDisplay(0.3048, 'ft', 'none')).toBeCloseTo(1, 9);
  });

  it('0.0254 m (SI) → 1 in', () => {
    expect(siToDisplay(0.0254, 'in', 'none')).toBeCloseTo(1, 9);
  });
});

describe('siToDisplay — temperature (offset-aware)', () => {
  it('273.15 K (SI) → 0 °C', () => {
    expect(siToDisplay(273.15, '°C', 'none')).toBeCloseTo(0, 6);
  });

  it('373.15 K (SI) → 100 °C', () => {
    expect(siToDisplay(373.15, '°C', 'none')).toBeCloseTo(100, 6);
  });

  it('273.15 K (SI) → 32 °F', () => {
    expect(siToDisplay(273.15, '°F', 'none')).toBeCloseTo(32, 3);
  });
});

describe('displayToSI — kg prefix special case', () => {
  it('1 kg (none prefix) → 1 SI (kg)', () => {
    expect(displayToSI(1, 'kg', 'none')).toBeCloseTo(1, 9);
  });

  it('1 kg (kilo prefix, same as none for kg) → 1 SI (kg)', () => {
    expect(displayToSI(1, 'kg', 'kilo')).toBeCloseTo(1, 9);
  });

  it('1_000_000 mg (kg symbol + milli prefix) → 1 SI (kg)', () => {
    expect(displayToSI(1_000_000, 'kg', 'milli')).toBeCloseTo(1, 9);
  });

  it('1000 g (kg symbol + none prefix maps to kg-none) treats 1g as a lookup, but kg+none is handled', () => {
    expect(displayToSI(1, 'kg', 'none')).toBeCloseTo(1, 9);
  });
});

describe('siToDisplay — kg prefix special case', () => {
  it('1 SI (kg) → 1 kg (none prefix)', () => {
    expect(siToDisplay(1, 'kg', 'none')).toBeCloseTo(1, 9);
  });

  it('1 SI (kg) → 1 kg (kilo prefix, normalized to none for kg)', () => {
    expect(siToDisplay(1, 'kg', 'kilo')).toBeCloseTo(1, 9);
  });

  it('1 SI (kg) → 1_000_000 mg (kg symbol + milli prefix)', () => {
    expect(siToDisplay(1, 'kg', 'milli')).toBeCloseTo(1_000_000, 6);
  });

  it('0.001 SI (kg) → 1000 mg (kg symbol + milli prefix)', () => {
    expect(siToDisplay(0.001, 'kg', 'milli')).toBeCloseTo(1000, 6);
  });
});

describe('re-expression round-trip (displayToSI then siToDisplay)', () => {
  it('1 m → centi prefix: should show 100 cm', () => {
    const si = displayToSI(1, 'm', 'none');
    expect(siToDisplay(si, 'm', 'centi')).toBeCloseTo(100, 9);
  });

  it('3.28084 ft → m symbol: should show approx 1 m', () => {
    const si = displayToSI(3.28084, 'ft', 'none');
    expect(siToDisplay(si, 'm', 'none')).toBeCloseTo(1, 4);
  });

  it('1 m → ft: should show approx 3.28084 ft', () => {
    const si = displayToSI(1, 'm', 'none');
    expect(siToDisplay(si, 'ft', 'none')).toBeCloseTo(3.28084, 4);
  });

  it('24 in → ft: should show 2 ft', () => {
    const si = displayToSI(24, 'in', 'none');
    expect(siToDisplay(si, 'ft', 'none')).toBeCloseTo(2, 9);
  });

  it('0 °C → °F: should show 32 °F', () => {
    const si = displayToSI(0, '°C', 'none');
    expect(siToDisplay(si, '°F', 'none')).toBeCloseTo(32, 3);
  });

  it('100 °C → °F: should show 212 °F', () => {
    const si = displayToSI(100, '°C', 'none');
    expect(siToDisplay(si, '°F', 'none')).toBeCloseTo(212, 3);
  });

  it('0 °C → K: should show 273.15 K', () => {
    const si = displayToSI(0, '°C', 'none');
    expect(siToDisplay(si, 'K', 'none')).toBeCloseTo(273.15, 3);
  });

  it('1 kg → milli prefix: should show 1_000_000 mg', () => {
    const si = displayToSI(1, 'kg', 'none');
    expect(siToDisplay(si, 'kg', 'milli')).toBeCloseTo(1_000_000, 6);
  });

  it('1_000_000 mg → kg (none prefix): should show 1 kg', () => {
    const si = displayToSI(1_000_000, 'kg', 'milli');
    expect(siToDisplay(si, 'kg', 'none')).toBeCloseTo(1, 9);
  });
});
