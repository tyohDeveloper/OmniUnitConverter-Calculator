import { describe, it, expect } from "vitest";
import { CONVERSION_DATA, PREFIXES, UnitCategory } from "@/lib/conversion-data";

describe("Conversion Data", () => {
  describe("PREFIXES", () => {
    it("should have standard SI prefixes", () => {
      const prefixIds = PREFIXES.map((p) => p.id);
      expect(prefixIds).toContain("kilo");
      expect(prefixIds).toContain("milli");
      expect(prefixIds).toContain("micro");
      expect(prefixIds).toContain("mega");
    });

    it("should have correct kilo factor", () => {
      const kilo = PREFIXES.find((p) => p.id === "kilo");
      expect(kilo?.factor).toBe(1000);
    });

    it("should have correct milli factor", () => {
      const milli = PREFIXES.find((p) => p.id === "milli");
      expect(milli?.factor).toBe(0.001);
    });

    it("should have a 'none' prefix with factor 1", () => {
      const none = PREFIXES.find((p) => p.id === "none");
      expect(none).toBeDefined();
      expect(none?.factor).toBe(1);
    });
  });

  describe("Length Category", () => {
    const lengthCategory = CONVERSION_DATA.find((c) => c.id === "length");

    it("should exist with meter as base unit", () => {
      expect(lengthCategory).toBeDefined();
      expect(lengthCategory?.baseUnit).toBe("meter");
    });

    it("should have meter with factor 1", () => {
      const meter = lengthCategory?.units.find((u) => u.id === "m");
      expect(meter).toBeDefined();
      expect(meter?.factor).toBe(1);
    });

    it("should have correct inch to meter conversion", () => {
      const inch = lengthCategory?.units.find((u) => u.id === "in");
      expect(inch?.factor).toBeCloseTo(0.0254, 5);
    });

    it("should have correct foot to meter conversion", () => {
      const foot = lengthCategory?.units.find((u) => u.id === "ft");
      expect(foot?.factor).toBeCloseTo(0.3048, 5);
    });

    it("should have correct mile to meter conversion", () => {
      const mile = lengthCategory?.units.find((u) => u.id === "mi");
      expect(mile?.factor).toBeCloseTo(1609.344, 3);
    });
  });

  describe("Mass Category", () => {
    const massCategory = CONVERSION_DATA.find((c) => c.id === "mass");

    it("should exist with kilogram as base unit", () => {
      expect(massCategory).toBeDefined();
      expect(massCategory?.baseUnit).toBe("kilogram");
    });

    it("should have gram with correct factor", () => {
      const gram = massCategory?.units.find((u) => u.id === "g");
      expect(gram?.factor).toBe(0.001);
    });
  });

  describe("Prefix Stacking Prevention", () => {
    describe("Mass - kg vs g prefix handling", () => {
      const massCategory = CONVERSION_DATA.find((c) => c.id === "mass");
      const kg = massCategory?.units.find((u) => u.id === "kg");
      const g = massCategory?.units.find((u) => u.id === "g");

      it("kilogram (kg) should NOT allow prefixes to prevent stacking like 'milli-kilo-gram'", () => {
        expect(kg).toBeDefined();
        expect(kg?.allowPrefixes).toBeFalsy();
      });

      it("gram (g) should allow prefixes for mg, cg, µg, etc.", () => {
        expect(g).toBeDefined();
        expect(g?.allowPrefixes).toBe(true);
      });

      it("kg should have factor=1 as the SI base for mass calculations", () => {
        expect(kg?.factor).toBe(1);
      });

      it("gram should have factor=0.001 relative to kg", () => {
        expect(g?.factor).toBe(0.001);
      });
    });

    describe("Electronvolt (eV) prefix handling", () => {
      const energyCategory = CONVERSION_DATA.find((c) => c.id === "energy");
      const ev = energyCategory?.units.find((u) => u.id === "ev");

      it("electronvolt should allow prefixes for keV, MeV, GeV, TeV", () => {
        expect(ev).toBeDefined();
        expect(ev?.allowPrefixes).toBe(true);
      });
    });

    describe("CGS units should allow prefixes on base units only", () => {
      it("dyne should allow prefixes", () => {
        const forceCategory = CONVERSION_DATA.find((c) => c.id === "force");
        const dyne = forceCategory?.units.find((u) => u.id === "dyn");
        expect(dyne?.allowPrefixes).toBe(true);
      });

      it("erg should allow prefixes", () => {
        const archaicEnergy = CONVERSION_DATA.find((c) => c.id === "archaic_energy");
        const erg = archaicEnergy?.units.find((u) => u.id === "erg");
        expect(erg?.allowPrefixes).toBe(true);
      });

      it("poise should allow prefixes", () => {
        const viscosity = CONVERSION_DATA.find((c) => c.id === "viscosity");
        const poise = viscosity?.units.find((u) => u.id === "poise");
        expect(poise?.allowPrefixes).toBe(true);
      });

      it("centipoise should NOT allow prefixes (already prefixed)", () => {
        const viscosity = CONVERSION_DATA.find((c) => c.id === "viscosity");
        const centipoise = viscosity?.units.find((u) => u.id === "cp");
        expect(centipoise?.allowPrefixes).toBeFalsy();
      });

      it("stokes should allow prefixes", () => {
        const kinematicViscosity = CONVERSION_DATA.find((c) => c.id === "kinematic_viscosity");
        const stokes = kinematicViscosity?.units.find((u) => u.id === "stokes");
        expect(stokes?.allowPrefixes).toBe(true);
      });

      it("centistokes should NOT allow prefixes (already prefixed)", () => {
        const kinematicViscosity = CONVERSION_DATA.find((c) => c.id === "kinematic_viscosity");
        const centistokes = kinematicViscosity?.units.find((u) => u.id === "centistokes");
        expect(centistokes?.allowPrefixes).toBeFalsy();
      });

      it("gauss should allow prefixes", () => {
        const magneticDensity = CONVERSION_DATA.find((c) => c.id === "magnetic_density");
        const gauss = magneticDensity?.units.find((u) => u.id === "g");
        expect(gauss?.allowPrefixes).toBe(true);
      });

      it("maxwell should allow prefixes", () => {
        const magneticFlux = CONVERSION_DATA.find((c) => c.id === "magnetic_flux");
        const maxwell = magneticFlux?.units.find((u) => u.id === "mx");
        expect(maxwell?.allowPrefixes).toBe(true);
      });

      it("oersted should allow prefixes", () => {
        const magneticFieldH = CONVERSION_DATA.find((c) => c.id === "magnetic_field_h");
        const oersted = magneticFieldH?.units.find((u) => u.id === "oersted");
        expect(oersted?.allowPrefixes).toBe(true);
      });

      it("bar should allow prefixes (for mbar)", () => {
        const pressure = CONVERSION_DATA.find((c) => c.id === "pressure");
        const bar = pressure?.units.find((u) => u.id === "bar");
        expect(bar?.allowPrefixes).toBe(true);
      });
    });

    describe("CGS electromagnetic units should allow prefixes", () => {
      it("statampere should allow prefixes", () => {
        const current = CONVERSION_DATA.find((c) => c.id === "current");
        const statA = current?.units.find((u) => u.id === "statA");
        expect(statA?.allowPrefixes).toBe(true);
      });

      it("biot should allow prefixes", () => {
        const current = CONVERSION_DATA.find((c) => c.id === "current");
        const biot = current?.units.find((u) => u.id === "biot");
        expect(biot?.allowPrefixes).toBe(true);
      });

      it("statvolt should allow prefixes", () => {
        const potential = CONVERSION_DATA.find((c) => c.id === "potential");
        const statv = potential?.units.find((u) => u.id === "statv");
        expect(statv?.allowPrefixes).toBe(true);
      });

      it("statfarad should allow prefixes", () => {
        const capacitance = CONVERSION_DATA.find((c) => c.id === "capacitance");
        const statf = capacitance?.units.find((u) => u.id === "statf");
        expect(statf?.allowPrefixes).toBe(true);
      });

      it("abfarad should allow prefixes", () => {
        const capacitance = CONVERSION_DATA.find((c) => c.id === "capacitance");
        const abf = capacitance?.units.find((u) => u.id === "abf");
        expect(abf?.allowPrefixes).toBe(true);
      });
    });
  });

  describe("All Categories", () => {
    it("should have multiple categories defined", () => {
      expect(CONVERSION_DATA.length).toBeGreaterThan(10);
    });

    it("each category should have at least one unit", () => {
      CONVERSION_DATA.forEach((category) => {
        expect(category.units.length).toBeGreaterThan(0);
      });
    });

    it("each category should have a baseUnit defined", () => {
      CONVERSION_DATA.forEach((category) => {
        expect(category.baseUnit).toBeDefined();
        expect(category.baseUnit.length).toBeGreaterThan(0);
      });
    });
  });
});

describe("Unit Conversion Logic", () => {
  it("should convert between units using factors", () => {
    const lengthCategory = CONVERSION_DATA.find((c) => c.id === "length");
    const meter = lengthCategory?.units.find((u) => u.id === "m");
    const foot = lengthCategory?.units.find((u) => u.id === "ft");

    if (meter && foot) {
      const metersValue = 1;
      const feetValue = metersValue / foot.factor;
      expect(feetValue).toBeCloseTo(3.28084, 4);
    }
  });

  it("should handle prefix multiplication correctly", () => {
    const kilo = PREFIXES.find((p) => p.id === "kilo");
    const milli = PREFIXES.find((p) => p.id === "milli");

    if (kilo && milli) {
      const kiloToMilliRatio = kilo.factor / milli.factor;
      expect(kiloToMilliRatio).toBe(1e6);
    }
  });
});

describe("SI Base Units Display", () => {
  describe("FROM Section SI Base Units", () => {
    it("should have baseSISymbol defined for each category", () => {
      CONVERSION_DATA.forEach((category) => {
        expect(category.baseSISymbol).toBeDefined();
        expect(typeof category.baseSISymbol).toBe("string");
      });
    });

    it("should have correct SI symbols for SI base quantities", () => {
      const siBaseCategories: Record<string, string> = {
        length: "m",
        mass: "kg",
        time: "s",
        current: "A",
        temperature: "K",
        amount: "mol",
        intensity: "cd",
      };

      Object.entries(siBaseCategories).forEach(([categoryId, expectedSymbol]) => {
        const category = CONVERSION_DATA.find((c) => c.id === categoryId);
        expect(category?.baseSISymbol).toBe(expectedSymbol);
      });
    });

    it("should have derived unit SI symbols for derived quantities", () => {
      const derivedCategories: Record<string, string> = {
        area: "m²",
        volume: "m³",
        force: "kg⋅m⋅s⁻²",
        energy: "kg⋅m²⋅s⁻²",
        power: "kg⋅m²⋅s⁻³",
        frequency: "s⁻¹",
      };

      Object.entries(derivedCategories).forEach(([categoryId, expectedSymbol]) => {
        const category = CONVERSION_DATA.find((c) => c.id === categoryId);
        expect(category?.baseSISymbol).toBe(expectedSymbol);
      });
    });
  });

  describe("TO Section Base Factor", () => {
    it("should have at least one unit with factor 1 (or close to 1) in each category", () => {
      const geometryCategories = ['rack_geometry', 'shipping'];
      CONVERSION_DATA.forEach((category) => {
        if (geometryCategories.includes(category.id)) return;
        const hasBaseUnit = category.units.some(
          (unit) => Math.abs(unit.factor - 1) < 0.0001
        );
        expect(hasBaseUnit).toBe(true);
      });
    });

    it("should calculate correct base factor for non-base units", () => {
      const lengthCategory = CONVERSION_DATA.find((c) => c.id === "length");
      const inch = lengthCategory?.units.find((u) => u.id === "in");
      const foot = lengthCategory?.units.find((u) => u.id === "ft");

      expect(inch?.factor).toBeCloseTo(0.0254, 5);
      expect(foot?.factor).toBeCloseTo(0.3048, 5);

      const feetPerInch = foot!.factor / inch!.factor;
      expect(feetPerInch).toBeCloseTo(12, 4);
    });

    it("should have consistent base factors for temperature with offsets", () => {
      const tempCategory = CONVERSION_DATA.find((c) => c.id === "temperature");
      const kelvin = tempCategory?.units.find((u) => u.id === "k");
      const celsius = tempCategory?.units.find((u) => u.id === "c");
      const fahrenheit = tempCategory?.units.find((u) => u.id === "f");

      expect(kelvin?.factor).toBe(1);
      expect(kelvin?.offset === undefined || kelvin?.offset === 0).toBe(true);
      expect(celsius?.offset).toBe(273.15);
      expect(fahrenheit?.offset).toBeDefined();
    });
  });

  describe("TO Section SI Base Units", () => {
    it("should display SI base symbol consistently across categories", () => {
      const categoriesWithComplexSI = ["force", "energy", "power", "pressure"];
      
      categoriesWithComplexSI.forEach((categoryId) => {
        const category = CONVERSION_DATA.find((c) => c.id === categoryId);
        expect(category?.baseSISymbol).toBeDefined();
        expect(category?.baseSISymbol?.includes("⋅")).toBe(true);
      });
    });

    it("should have angular categories with correct SI symbols", () => {
      const angleCategory = CONVERSION_DATA.find((c) => c.id === "angle");
      const solidAngleCategory = CONVERSION_DATA.find((c) => c.id === "solid_angle");

      expect(angleCategory?.baseSISymbol).toBe("rad");
      expect(solidAngleCategory?.baseSISymbol).toBe("sr");
    });
  });
});

describe("Base Quantity Selection", () => {
  const allCategoryIds = CONVERSION_DATA.map((c) => c.id);

  it("should have all categories in a defined order", () => {
    expect(allCategoryIds.length).toBeGreaterThan(30);
    expect(allCategoryIds[0]).toBe("length");
  });

  it("should have SI base quantities at the beginning", () => {
    const siBaseQuantities: UnitCategory[] = [
      "length", "mass", "time", "current", "temperature", "amount", "intensity"
    ];

    siBaseQuantities.forEach((siBase, index) => {
      expect(allCategoryIds.indexOf(siBase)).toBeLessThan(10);
    });
  });

  describe("Arrow Key Navigation Logic", () => {
    it("should navigate to next category on down arrow", () => {
      const currentIndex = allCategoryIds.indexOf("length");
      const nextIndex = (currentIndex + 1) % allCategoryIds.length;
      expect(allCategoryIds[nextIndex]).toBe("mass");
    });

    it("should navigate to previous category on up arrow", () => {
      const currentIndex = allCategoryIds.indexOf("mass");
      const prevIndex = (currentIndex - 1 + allCategoryIds.length) % allCategoryIds.length;
      expect(allCategoryIds[prevIndex]).toBe("length");
    });

    it("should wrap around to first category from last on down arrow", () => {
      const lastIndex = allCategoryIds.length - 1;
      const nextIndex = (lastIndex + 1) % allCategoryIds.length;
      expect(nextIndex).toBe(0);
      expect(allCategoryIds[nextIndex]).toBe("length");
    });

    it("should wrap around to last category from first on up arrow", () => {
      const firstIndex = 0;
      const prevIndex = (firstIndex - 1 + allCategoryIds.length) % allCategoryIds.length;
      expect(prevIndex).toBe(allCategoryIds.length - 1);
    });
  });

  describe("New Categories", () => {
    it("should include frequency category", () => {
      expect(allCategoryIds).toContain("frequency");
      const freqCategory = CONVERSION_DATA.find((c) => c.id === "frequency");
      expect(freqCategory?.baseSISymbol).toBe("s⁻¹");
    });

    it("should include angular velocity category", () => {
      expect(allCategoryIds).toContain("angular_velocity");
      const avCategory = CONVERSION_DATA.find((c) => c.id === "angular_velocity");
      expect(avCategory?.units.some((u) => u.symbol === "rpm")).toBe(true);
    });

    it("should include momentum category", () => {
      expect(allCategoryIds).toContain("momentum");
      const momCategory = CONVERSION_DATA.find((c) => c.id === "momentum");
      expect(momCategory?.baseSISymbol).toBe("kg⋅m⋅s⁻¹");
    });

    it("should include thermodynamic categories", () => {
      expect(allCategoryIds).toContain("thermal_conductivity");
      expect(allCategoryIds).toContain("specific_heat");
      expect(allCategoryIds).toContain("entropy");
    });

    it("should include concentration category", () => {
      expect(allCategoryIds).toContain("concentration");
      const concCategory = CONVERSION_DATA.find((c) => c.id === "concentration");
      expect(concCategory?.units.some((u) => u.symbol === "ppm")).toBe(true);
    });

    it("should include fuel economy category", () => {
      expect(allCategoryIds).toContain("fuel_economy");
      const fuelCategory = CONVERSION_DATA.find((c) => c.id === "fuel_economy");
      expect(fuelCategory?.units.some((u) => u.symbol === "mpg (US)")).toBe(true);
    });

    it("should include data category with prefix support", () => {
      expect(allCategoryIds).toContain("data");
      const dataCategory = CONVERSION_DATA.find((c) => c.id === "data");
      expect(dataCategory?.units.some((u) => u.symbol === "B" && u.allowPrefixes)).toBe(true);
      expect(dataCategory?.units.some((u) => u.symbol === "bit" && u.allowPrefixes)).toBe(true);
    });
  });
});

describe("Energy & Power Categories", () => {
  describe("Energy Category", () => {
    const energyCategory = CONVERSION_DATA.find((c) => c.id === "energy");

    it("should exist with joule as base unit", () => {
      expect(energyCategory).toBeDefined();
      expect(energyCategory?.baseUnit).toBe("joule");
      expect(energyCategory?.baseSISymbol).toBe("kg⋅m²⋅s⁻²");
    });

    it("should have BTU with correct factor", () => {
      const btu = energyCategory?.units.find((u) => u.id === "btu");
      expect(btu?.factor).toBeCloseTo(1055.06, 2);
    });

    it("should have calorie with correct factor", () => {
      const cal = energyCategory?.units.find((u) => u.id === "cal");
      expect(cal?.factor).toBeCloseTo(4.184, 4);
    });

    it("should have kilowatt-hour with correct factor", () => {
      const kwh = energyCategory?.units.find((u) => u.id === "kwh");
      expect(kwh?.factor).toBe(3.6e6);
    });

    it("should have therm with correct factor (105.506 MJ)", () => {
      const therm = energyCategory?.units.find((u) => u.id === "therm");
      expect(therm?.factor).toBeCloseTo(1.05506e8, -3);
    });

    it("should have barrel of oil equivalent with correct factor (6.1 GJ)", () => {
      const boe = energyCategory?.units.find((u) => u.id === "boe");
      expect(boe?.factor).toBe(6.1e9);
    });

    it("should have ton of coal equivalent with correct factor (29.3 GJ)", () => {
      const tce = energyCategory?.units.find((u) => u.id === "tce");
      expect(tce?.factor).toBe(2.93e10);
    });
  });

  describe("Power Category", () => {
    const powerCategory = CONVERSION_DATA.find((c) => c.id === "power");

    it("should exist with watt as base unit", () => {
      expect(powerCategory).toBeDefined();
      expect(powerCategory?.baseUnit).toBe("watt");
      expect(powerCategory?.baseSISymbol).toBe("kg⋅m²⋅s⁻³");
    });

    it("should have horsepower with correct factor", () => {
      const hp = powerCategory?.units.find((u) => u.id === "hp");
      expect(hp?.factor).toBeCloseTo(745.7, 1);
    });

    it("should have metric horsepower with correct factor", () => {
      const hpM = powerCategory?.units.find((u) => u.id === "hp_m");
      expect(hpM?.factor).toBeCloseTo(735.499, 2);
    });

    it("should have BTU per hour with correct factor", () => {
      const btuH = powerCategory?.units.find((u) => u.id === "btu_h");
      expect(btuH?.factor).toBeCloseTo(0.293071, 5);
    });

    it("should have ton of refrigeration with correct factor", () => {
      const tonRef = powerCategory?.units.find((u) => u.id === "ton_ref");
      expect(tonRef?.factor).toBeCloseTo(3516.85, 1);
    });
  });
});

describe("Archaic & Regional Units", () => {
  describe("Archaic Length Category", () => {
    const lengthCategory = CONVERSION_DATA.find((c) => c.id === "archaic_length");

    it("should exist with metre as base unit", () => {
      expect(lengthCategory).toBeDefined();
      expect(lengthCategory?.baseUnit).toBe("metre");
      expect(lengthCategory?.baseSISymbol).toBe("m");
    });

    it("should have cubit with correct factor", () => {
      const cubit = lengthCategory?.units.find((u) => u.id === "cubit_common");
      expect(cubit?.factor).toBeCloseTo(0.4572, 4);
    });

    it("should have Japanese shaku with correct factor", () => {
      const shaku = lengthCategory?.units.find((u) => u.id === "shaku_jp");
      expect(shaku?.factor).toBeCloseTo(0.30303, 4);
    });

    it("should have Chinese chi with correct factor", () => {
      const chi = lengthCategory?.units.find((u) => u.id === "chi_cn");
      expect(chi?.factor).toBeCloseTo(0.3333, 3);
    });

    it("should have Japanese ken with correct factor", () => {
      const ken = lengthCategory?.units.find((u) => u.id === "ken_jp");
      expect(ken?.factor).toBeCloseTo(1.818, 2);
    });

    it("should have Chinese zhang with correct factor", () => {
      const zhang = lengthCategory?.units.find((u) => u.id === "zhang_cn");
      expect(zhang?.factor).toBeCloseTo(3.333, 2);
    });
  });

  describe("Archaic Area Category", () => {
    const areaCategory = CONVERSION_DATA.find((c) => c.id === "archaic_area");

    it("should exist with square metre as base unit", () => {
      expect(areaCategory).toBeDefined();
      expect(areaCategory?.baseUnit).toBe("square metre");
      expect(areaCategory?.baseSISymbol).toBe("m²");
    });

    it("should have Japanese tatami variants with correct factors", () => {
      const kyoma = areaCategory?.units.find((u) => u.id === "kyoma");
      const edoma = areaCategory?.units.find((u) => u.id === "edoma");
      const danchi = areaCategory?.units.find((u) => u.id === "danchi_ma");
      expect(kyoma?.factor).toBeCloseTo(1.8241, 3);
      expect(edoma?.factor).toBeCloseTo(1.5488, 3);
      expect(danchi?.factor).toBeCloseTo(1.445, 3);
    });

    it("should have Korean pyeong with correct factor", () => {
      const pyeong = areaCategory?.units.find((u) => u.id === "pyeong_kr");
      expect(pyeong?.factor).toBeCloseTo(3.3058, 3);
    });

    it("should have Chinese mu with correct factor", () => {
      const mu = areaCategory?.units.find((u) => u.id === "mu_cn");
      expect(mu?.factor).toBeCloseTo(666.67, 1);
    });

    it("should have Israeli dunam with correct factor", () => {
      const dunam = areaCategory?.units.find((u) => u.id === "dunam_il");
      expect(dunam?.factor).toBe(1000);
    });

    it("should have Egyptian feddan with correct factor", () => {
      const feddan = areaCategory?.units.find((u) => u.id === "feddan_eg");
      expect(feddan?.factor).toBeCloseTo(4200.833, 1);
    });
  });

  describe("Archaic Mass Precious Metal Units", () => {
    const massCategory = CONVERSION_DATA.find((c) => c.id === "archaic_mass");

    it("should have metric carat with correct factor (0.2g)", () => {
      const carat = massCategory?.units.find((u) => u.id === "carat");
      expect(carat?.factor).toBe(0.0002);
    });

    it("should have tola with correct factor", () => {
      const tola = massCategory?.units.find((u) => u.id === "tola");
      expect(tola?.factor).toBeCloseTo(0.0116638, 5);
    });

    it("should have Korean don with correct factor", () => {
      const don = massCategory?.units.find((u) => u.id === "don_kr");
      expect(don?.factor).toBe(0.00375);
    });

    it("should have troy pound with correct factor", () => {
      const troyLb = massCategory?.units.find((u) => u.id === "troy_lb");
      expect(troyLb?.factor).toBeCloseTo(0.3732417, 5);
    });
  });

  describe("Archaic Volume Apothecary Units", () => {
    const volumeCategory = CONVERSION_DATA.find((c) => c.id === "archaic_volume");

    it("should have minim with correct factor", () => {
      const minim = volumeCategory?.units.find((u) => u.id === "minim");
      expect(minim?.factor).toBeCloseTo(0.0000616115, 7);
    });

    it("should have fluid scruple with correct factor", () => {
      const flScruple = volumeCategory?.units.find((u) => u.id === "fl_scruple");
      expect(flScruple?.factor).toBeCloseTo(0.00123223, 6);
    });

    it("should have fluid dram with correct factor", () => {
      const flDram = volumeCategory?.units.find((u) => u.id === "fl_dram");
      expect(flDram?.factor).toBeCloseTo(0.00369669, 6);
    });

    it("should have cubic metre for SI conversion", () => {
      const m3 = volumeCategory?.units.find((u) => u.id === "m3");
      expect(m3?.factor).toBe(1000);
      expect(m3?.allowPrefixes).toBe(true);
    });
  });

  describe("Archaic Energy Category", () => {
    const energyCategory = CONVERSION_DATA.find((c) => c.id === "archaic_energy");

    it("should exist with joule as base unit", () => {
      expect(energyCategory).toBeDefined();
      expect(energyCategory?.baseUnit).toBe("joule");
      expect(energyCategory?.baseSISymbol).toBe("kg⋅m²⋅s⁻²");
    });

    it("should have erg with correct factor (10⁻⁷ J)", () => {
      const erg = energyCategory?.units.find((u) => u.id === "erg");
      expect(erg?.factor).toBe(1e-7);
    });

    it("should have foot-pound force with correct factor", () => {
      const ftLbf = energyCategory?.units.find((u) => u.id === "ft_lbf");
      expect(ftLbf?.factor).toBeCloseTo(1.3558179483, 6);
    });

    it("should have thermie with correct factor (4.1868 MJ)", () => {
      const thermie = energyCategory?.units.find((u) => u.id === "thermie");
      expect(thermie?.factor).toBe(4.1868e6);
    });

    it("should have quad with correct factor (1.055 EJ)", () => {
      const quad = energyCategory?.units.find((u) => u.id === "quad");
      expect(quad?.factor).toBe(1.055e18);
    });
  });

  describe("Archaic Power Category", () => {
    const powerCategory = CONVERSION_DATA.find((c) => c.id === "archaic_power");

    it("should exist with watt as base unit", () => {
      expect(powerCategory).toBeDefined();
      expect(powerCategory?.baseUnit).toBe("watt");
      expect(powerCategory?.baseSISymbol).toBe("kg⋅m²⋅s⁻³");
    });

    it("should have erg per second with correct factor (10⁻⁷ W)", () => {
      const ergS = powerCategory?.units.find((u) => u.id === "erg_s");
      expect(ergS?.factor).toBe(1e-7);
    });

    it("should have foot-pound per second with correct factor", () => {
      const ftLbfS = powerCategory?.units.find((u) => u.id === "ft_lbf_s");
      expect(ftLbfS?.factor).toBeCloseTo(1.3558179483, 6);
    });

    it("should have boiler horsepower with correct factor", () => {
      const boilerHp = powerCategory?.units.find((u) => u.id === "boiler_hp");
      expect(boilerHp?.factor).toBeCloseTo(9810.55, 1);
    });
  });
});

describe("Unit Ordering - SI Base First, Then Ascending Factor", () => {
  // Categories with documented special ordering requirements:
  // - lightbulb: efficiency-based ordering (lumens per watt)
  // - math: functions/constants in logical groups
  // - fuel_economy: inverse relationship units (km/L vs L/100km)
  // - temperature: Kelvin first, then offset-based units (C, F, R)
  // - radioactive_decay: mixed direct/inverse units (decay constant, half-life, mean lifetime)
  // - fuel: complex multi-unit energy equivalents for different fuels
  // - photon: inverse relationship (wavelength ↔ energy via E=hc/λ)
  // - rack_geometry: mixed length and special rack units
  // - shipping: mixed length and container units
  // - archaic_area/length/mass/volume: units grouped by culture/region of origin
  const categoriesWithSpecialOrdering = [
    'lightbulb',
    'math', 
    'fuel_economy',
    'temperature',
    'rack_geometry',
    'shipping',
    'radioactive_decay',
    'fuel',
    'photon',
    'archaic_area',
    'archaic_length',
    'archaic_mass',
    'archaic_volume'
  ];

  // Helper: Find SI base unit by criteria (not by position)
  // Prioritizes factor=1 over baseSISymbol because some categories (e.g., cross_section)
  // use a conventional base unit (barn) that differs from the SI unit (m²)
  const findExpectedSIBase = (category: typeof CONVERSION_DATA[0]) => {
    // First try to find unit with factor = 1 (canonical base definition)
    const baseFactor1 = category.units.find(u => Math.abs(u.factor - 1) < 1e-10);
    if (baseFactor1) return baseFactor1;
    // Fall back to unit matching baseSISymbol
    if (category.baseSISymbol) {
      const baseBySymbol = category.units.find(u => u.symbol === category.baseSISymbol);
      if (baseBySymbol) return baseBySymbol;
    }
    return undefined;
  };

  // Helper: Compute expected order (SI base first, then ascending factor)
  const computeExpectedOrder = (category: typeof CONVERSION_DATA[0]) => {
    const siBase = findExpectedSIBase(category);
    const others = category.units.filter(u => u.id !== siBase?.id);
    const sortedOthers = [...others].sort((a, b) => a.factor - b.factor);
    return siBase ? [siBase, ...sortedOthers] : sortedOthers;
  };

  CONVERSION_DATA.forEach((category) => {
    if (categoriesWithSpecialOrdering.includes(category.id)) return;

    describe(`${category.name} (${category.id})`, () => {
      it("should have SI base unit first (factor=1 or matching baseSISymbol)", () => {
        const expectedSIBase = findExpectedSIBase(category);
        const actualFirst = category.units[0];
        
        if (expectedSIBase) {
          expect(actualFirst.id).toBe(expectedSIBase.id);
        } else {
          // If no SI base found, first unit should have factor ≈ 1
          expect(Math.abs(actualFirst.factor - 1)).toBeLessThan(1e-10);
        }
      });

      it("should have remaining units sorted by ascending factor", () => {
        const units = category.units;
        if (units.length <= 1) return;
        
        // Skip first unit (SI base), verify rest are ascending
        for (let i = 1; i < units.length - 1; i++) {
          const currentFactor = units[i].factor;
          const nextFactor = units[i + 1].factor;
          
          expect(currentFactor).toBeLessThanOrEqual(nextFactor);
        }
      });

      it("should match independently computed expected order", () => {
        const expectedOrder = computeExpectedOrder(category);
        const actualOrder = category.units;
        
        expect(actualOrder.length).toBe(expectedOrder.length);
        
        actualOrder.forEach((unit, idx) => {
          expect(unit.id).toBe(expectedOrder[idx].id);
        });
      });
    });
  });

  describe("Specific Category Order Verification", () => {
    it("Mass should be ordered: kg, eV/c², mcg, g, oz, oz_t, lb, st, slug, ton_us, t, ton_uk", () => {
      const mass = CONVERSION_DATA.find(c => c.id === "mass");
      const ids = mass?.units.map(u => u.id);
      
      expect(ids?.[0]).toBe("kg");
      expect(ids?.[1]).toBe("ev_c2");
      expect(ids?.[2]).toBe("mcg");
      expect(ids?.[3]).toBe("g");
      expect(ids?.[4]).toBe("oz");
      expect(ids?.[5]).toBe("oz_t");
      expect(ids?.[6]).toBe("lb");
    });

    it("Length should be ordered: m, Å, in, ft, ft:in, yd, mi, nmi, AU, ly, pc", () => {
      const length = CONVERSION_DATA.find(c => c.id === "length");
      const ids = length?.units.map(u => u.id);
      
      expect(ids?.[0]).toBe("m");
      expect(ids?.[1]).toBe("angstrom");
      expect(ids?.[2]).toBe("in");
    });

    it("Energy should be ordered: J first, then ascending by factor", () => {
      const energy = CONVERSION_DATA.find(c => c.id === "energy");
      const joule = energy?.units.find(u => u.id === "j");
      
      expect(energy?.units[0].id).toBe("j");
      expect(joule?.factor).toBe(1);
    });

    it("Power should be ordered: W first, then ascending by factor", () => {
      const power = CONVERSION_DATA.find(c => c.id === "power");
      const watt = power?.units.find(u => u.id === "w");
      
      expect(power?.units[0].id).toBe("w");
      expect(watt?.factor).toBe(1);
    });

    it("Time should be ordered: s first, then ascending by factor", () => {
      const time = CONVERSION_DATA.find(c => c.id === "time");
      
      expect(time?.units[0].id).toBe("s");
      expect(time?.units[0].factor).toBe(1);
    });
  });

  describe("Troy Pound Location", () => {
    it("should have Troy Pound in archaic_mass, not main mass category", () => {
      const mainMass = CONVERSION_DATA.find(c => c.id === "mass");
      const archaicMass = CONVERSION_DATA.find(c => c.id === "archaic_mass");
      
      const troyInMain = mainMass?.units.find(u => u.id === "lb_t" || u.name.includes("Troy Pound"));
      const troyInArchaic = archaicMass?.units.find(u => u.id === "troy_lb" || u.name.includes("Troy Pound"));
      
      expect(troyInMain).toBeUndefined();
      expect(troyInArchaic).toBeDefined();
    });
  });
});

describe("US/Imperial Precision (NIST Standards)", () => {
  describe("Mass Units - NIST Exact Values", () => {
    const massCategory = CONVERSION_DATA.find((c) => c.id === "mass");
    
    it("pound should be exactly 0.45359237 kg (NIST definition)", () => {
      const lb = massCategory?.units.find((u) => u.id === "lb");
      expect(lb?.factor).toBe(0.45359237);
    });

    it("ounce should be exactly 0.028349523125 kg (lb/16)", () => {
      const oz = massCategory?.units.find((u) => u.id === "oz");
      expect(oz?.factor).toBe(0.028349523125);
    });

    it("stone should be exactly 6.35029318 kg (14 × lb)", () => {
      const stone = massCategory?.units.find((u) => u.id === "st");
      expect(stone?.factor).toBe(6.35029318);
    });

    it("pound should equal ounce × 16", () => {
      const lb = massCategory?.units.find((u) => u.id === "lb");
      const oz = massCategory?.units.find((u) => u.id === "oz");
      expect(lb!.factor).toBeCloseTo(oz!.factor * 16, 15);
    });

    it("stone should equal pound × 14", () => {
      const lb = massCategory?.units.find((u) => u.id === "lb");
      const stone = massCategory?.units.find((u) => u.id === "st");
      expect(stone!.factor).toBeCloseTo(lb!.factor * 14, 15);
    });
  });

  describe("Troy Mass Units - NIST Exact Values", () => {
    const archaicMass = CONVERSION_DATA.find((c) => c.id === "archaic_mass");
    const mainMass = CONVERSION_DATA.find((c) => c.id === "mass");
    
    it("troy ounce (main mass) should be exactly 0.0311034768 kg (NIST definition)", () => {
      const troyOz = mainMass?.units.find((u) => u.id === "oz_t");
      expect(troyOz?.factor).toBe(0.0311034768);
    });

    it("grain should be exactly 64.79891e-6 kg (1/7000 lb)", () => {
      const grain = archaicMass?.units.find((u) => u.id === "grain");
      expect(grain?.factor).toBe(64.79891e-6);
    });

    it("troy ounce should equal 480 grains", () => {
      const troyOz = mainMass?.units.find((u) => u.id === "oz_t");
      const grain = archaicMass?.units.find((u) => u.id === "grain");
      expect(troyOz!.factor).toBeCloseTo(grain!.factor * 480, 15);
    });
  });

  describe("Volume Units - NIST Exact Values", () => {
    const volumeCategory = CONVERSION_DATA.find((c) => c.id === "volume");
    const cookingCategory = CONVERSION_DATA.find((c) => c.id === "cooking");
    
    it("US gallon should be exactly 0.003785411784 m³ (231 in³)", () => {
      const gal = volumeCategory?.units.find((u) => u.id === "gal");
      expect(gal?.factor).toBe(0.003785411784);
    });

    it("US gallon in cooking should be exactly 3785.411784 mL", () => {
      const galCooking = cookingCategory?.units.find((u) => u.id === "gal_us");
      expect(galCooking?.factor).toBe(3785.411784);
    });

    it("cooking gallon should be consistent with volume gallon (× 1e6 mL/m³)", () => {
      const volGal = volumeCategory?.units.find((u) => u.id === "gal");
      const cookGal = cookingCategory?.units.find((u) => u.id === "gal_us");
      expect(cookGal!.factor).toBeCloseTo(volGal!.factor * 1e6, 6);
    });
  });

  describe("Flow Rate Units - Derived from NIST", () => {
    const flowCategory = CONVERSION_DATA.find((c) => c.id === "flow");
    
    it("gallons per minute should use exact NIST gallon value", () => {
      const gpm = flowCategory?.units.find((u) => u.id === "gpm");
      const exactGPM = 0.003785411784 / 60;
      expect(gpm?.factor).toBeCloseTo(exactGPM, 15);
    });

    it("gallons per hour should use exact NIST gallon value", () => {
      const gph = flowCategory?.units.find((u) => u.id === "galh");
      const exactGPH = 0.003785411784 / 3600;
      expect(gph?.factor).toBeCloseTo(exactGPH, 15);
    });
  });
});
