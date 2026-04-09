import { describe, it, expect } from 'vitest';
import {
  SUPPORTED_LANGUAGES,
  UI_TRANSLATIONS,
  UNIT_NAME_TRANSLATIONS,
  SI_SYMBOLS,
  SI_PREFIX_SYMBOLS,
  translate,
  type SupportedLanguage,
} from '../client/src/lib/localization';
import { PREFIXES, BINARY_PREFIXES, ALL_PREFIXES, CONVERSION_DATA } from '../client/src/lib/conversion-data';

describe('Language Localization', () => {
  describe('UI Element Translations', () => {
    it('should have translations for all supported languages', () => {
      const requiredLanguages: SupportedLanguage[] = ['en', 'ar'];
      // help-machine-translated intentionally has en: '' (notice only shown for non-English locales)
      const intentionallyEmptyForEn = new Set(['help-machine-translated']);
      
      for (const key of Object.keys(UI_TRANSLATIONS['en'])) {
        for (const lang of requiredLanguages) {
          if (lang === 'en' && intentionallyEmptyForEn.has(key)) continue;
          const translation = translate(key, lang, UI_TRANSLATIONS);
          expect(translation).toBeTruthy();
          expect(translation).not.toBe('');
        }
      }
    });

    it('should translate category names correctly for German', () => {
      expect(translate('Length', 'de', UI_TRANSLATIONS)).toBe('Länge');
      expect(translate('Mass', 'de', UI_TRANSLATIONS)).toBe('Masse');
      expect(translate('Time', 'de', UI_TRANSLATIONS)).toBe('Zeit');
    });

    it('should translate category names correctly for Spanish', () => {
      expect(translate('Length', 'es', UI_TRANSLATIONS)).toBe('Longitud');
      expect(translate('Mass', 'es', UI_TRANSLATIONS)).toBe('Masa');
      expect(translate('Energy', 'es', UI_TRANSLATIONS)).toBe('Energía');
    });

    it('should translate category names correctly for French', () => {
      expect(translate('Length', 'fr', UI_TRANSLATIONS)).toBe('Longueur');
      expect(translate('Mass', 'fr', UI_TRANSLATIONS)).toBe('Masse');
      expect(translate('Temperature', 'fr', UI_TRANSLATIONS)).toBe('Température');
    });

    it('should translate category names correctly for Chinese', () => {
      expect(translate('Length', 'zh', UI_TRANSLATIONS)).toBe('长度');
      expect(translate('Mass', 'zh', UI_TRANSLATIONS)).toBe('质量');
      expect(translate('Energy', 'zh', UI_TRANSLATIONS)).toBe('能量');
    });

    it('should translate category names correctly for Japanese', () => {
      expect(translate('Length', 'ja', UI_TRANSLATIONS)).toBe('長さ');
      expect(translate('Mass', 'ja', UI_TRANSLATIONS)).toBe('質量');
      expect(translate('Power', 'ja', UI_TRANSLATIONS)).toBe('仕事率');
    });

    it('should translate category names correctly for Korean', () => {
      expect(translate('Length', 'ko', UI_TRANSLATIONS)).toBe('길이');
      expect(translate('Mass', 'ko', UI_TRANSLATIONS)).toBe('질량');
      expect(translate('Energy', 'ko', UI_TRANSLATIONS)).toBe('에너지');
      expect(translate('Temperature', 'ko', UI_TRANSLATIONS)).toBe('온도');
      expect(translate('Time', 'ko', UI_TRANSLATIONS)).toBe('시간');
    });

    it('should translate category names correctly for Arabic', () => {
      expect(translate('Length', 'ar', UI_TRANSLATIONS)).toBe('الطول');
      expect(translate('Mass', 'ar', UI_TRANSLATIONS)).toBe('الكتلة');
      expect(translate('Energy', 'ar', UI_TRANSLATIONS)).toBe('الطاقة');
    });

    it('should translate category names correctly for Russian', () => {
      expect(translate('Length', 'ru', UI_TRANSLATIONS)).toBe('Длина');
      expect(translate('Mass', 'ru', UI_TRANSLATIONS)).toBe('Масса');
      expect(translate('Pressure', 'ru', UI_TRANSLATIONS)).toBe('Давление');
    });

    it('should translate category names correctly for Italian', () => {
      expect(translate('Length', 'it', UI_TRANSLATIONS)).toBe('Lunghezza');
      expect(translate('Mass', 'it', UI_TRANSLATIONS)).toBe('Massa');
      expect(translate('Energy', 'it', UI_TRANSLATIONS)).toBe('Energia');
    });

    it('should translate category names correctly for Portuguese', () => {
      expect(translate('Length', 'pt', UI_TRANSLATIONS)).toBe('Comprimento');
      expect(translate('Mass', 'pt', UI_TRANSLATIONS)).toBe('Massa');
      expect(translate('Energy', 'pt', UI_TRANSLATIONS)).toBe('Energia');
    });

    it('should fall back to English for missing translations', () => {
      const result = translate('Unknown Key', 'de', UI_TRANSLATIONS);
      expect(result).toBe('Unknown Key');
    });

    it('should handle en-us as English variant', () => {
      expect(translate('Length', 'en-us', UI_TRANSLATIONS)).toBe('Length');
      expect(translate('Mass', 'en-us', UI_TRANSLATIONS)).toBe('Mass');
    });
  });

  describe('Physics Quantity Translations', () => {
    it('should translate mechanics quantities for all languages', () => {
      expect(translate('Angular Velocity', 'de', UI_TRANSLATIONS)).toBe('Winkelgeschwindigkeit');
      expect(translate('Momentum', 'ja', UI_TRANSLATIONS)).toBe('運動量');
      expect(translate('Kinematic Viscosity', 'zh', UI_TRANSLATIONS)).toBe('运动粘度');
      expect(translate('Angular Velocity', 'ko', UI_TRANSLATIONS)).toBe('각속도');
    });

    it('should translate thermodynamics quantities for all languages', () => {
      expect(translate('Thermal Conductivity', 'de', UI_TRANSLATIONS)).toBe('Wärmeleitfähigkeit');
      expect(translate('Specific Heat', 'fr', UI_TRANSLATIONS)).toBe('Chaleur Spécifique');
      expect(translate('Entropy', 'ja', UI_TRANSLATIONS)).toBe('エントロピー');
      expect(translate('Entropy', 'ko', UI_TRANSLATIONS)).toBe('엔트로피');
    });

    it('should translate electromagnetic quantities for all languages', () => {
      expect(translate('Electric Charge', 'es', UI_TRANSLATIONS)).toBe('Carga Eléctrica');
      expect(translate('Magnetic Flux', 'ru', UI_TRANSLATIONS)).toBe('Магнитный Поток');
      expect(translate('Conductance', 'ko', UI_TRANSLATIONS)).toBe('컨덕턴스');
    });

    it('should translate radiation quantities for all languages', () => {
      expect(translate('Radioactivity', 'de', UI_TRANSLATIONS)).toBe('Radioaktivität');
      expect(translate('Radiation Dose', 'zh', UI_TRANSLATIONS)).toBe('辐射剂量');
      expect(translate('Radiation Dose', 'ko', UI_TRANSLATIONS)).toBe('방사선량');
    });

    it('should translate optical quantities for all languages', () => {
      expect(translate('Luminous Flux', 'it', UI_TRANSLATIONS)).toBe('Flusso Luminoso');
      expect(translate('Illuminance', 'fr', UI_TRANSLATIONS)).toBe('Éclairement');
      expect(translate('Luminance', 'ko', UI_TRANSLATIONS)).toBe('휘도');
    });
  });

  describe('Specialty Category Translations', () => {
    it('should translate data and digital categories', () => {
      expect(translate('Data', 'zh', UI_TRANSLATIONS)).toBe('数据');
      expect(translate('Data', 'ko', UI_TRANSLATIONS)).toBe('데이터');
      expect(translate('Rack Geometry', 'de', UI_TRANSLATIONS)).toBe('Rack-Geometrie');
    });

    it('should translate archaic categories for all languages', () => {
      expect(translate('Archaic Length', 'ja', UI_TRANSLATIONS)).toBe('古代の長さ');
      expect(translate('Archaic Mass', 'zh', UI_TRANSLATIONS)).toBe('古代质量');
      expect(translate('Archaic Volume', 'ko', UI_TRANSLATIONS)).toBe('고대 부피');
      expect(translate('Archaic Area', 'ru', UI_TRANSLATIONS)).toBe('Архаичные Площади');
      expect(translate('Archaic Energy', 'fr', UI_TRANSLATIONS)).toBe('Énergie Archaïque');
      expect(translate('Archaic Power', 'de', UI_TRANSLATIONS)).toBe('Archaische Leistung');
    });

    it('should translate cooking and typography categories', () => {
      expect(translate('Typography', 'ko', UI_TRANSLATIONS)).toBe('타이포그래피');
      expect(translate('Cooking Measures', 'ja', UI_TRANSLATIONS)).toBe('料理用計量');
      expect(translate('Cooking Measures', 'ko', UI_TRANSLATIONS)).toBe('요리 계량');
    });

    it('should have unit name entries for typography units across all locales', () => {
      const typographyUnits = ['Ligne', 'Didot Point', 'Agate'];
      const locales = ['en', 'en-us', 'de', 'fr', 'es', 'it', 'pt', 'ar', 'ru', 'ja', 'ko', 'zh'];
      for (const unit of typographyUnits) {
        for (const locale of locales) {
          const entry = UNIT_NAME_TRANSLATIONS[locale]?.[unit];
          expect(entry, `${unit} missing in ${locale}`).toBeTruthy();
        }
      }
    });

    it('should translate fuel and economy categories', () => {
      expect(translate('Fuel Energy', 'de', UI_TRANSLATIONS)).toBe('Brennstoffenergie');
      expect(translate('Fuel Economy', 'ko', UI_TRANSLATIONS)).toBe('연비');
      expect(translate('Beer & Wine Volume', 'ja', UI_TRANSLATIONS)).toBe('ビール・ワイン容量');
    });
  });

  describe('Category Group Translations', () => {
    it('should translate category group headers', () => {
      expect(translate('Base Quantities', 'ko', UI_TRANSLATIONS)).toBe('기본량');
      expect(translate('Mechanics', 'ja', UI_TRANSLATIONS)).toBe('力学');
      expect(translate('Electricity & Magnetism', 'zh', UI_TRANSLATIONS)).toBe('电磁学');
      expect(translate('Light & Radiation', 'de', UI_TRANSLATIONS)).toBe('Licht & Strahlung');
      expect(translate('Thermodynamics', 'fr', UI_TRANSLATIONS)).toBe('Thermodynamique');
      expect(translate('Acoustics', 'ko', UI_TRANSLATIONS)).toBe('음향학');
      expect(translate('Chemistry & Nuclear', 'ru', UI_TRANSLATIONS)).toBe('Химия и Ядерная');
      expect(translate('CGS System', 'ko', UI_TRANSLATIONS)).toBe('CGS 단위계');
      expect(translate('Archaic & Regional', 'it', UI_TRANSLATIONS)).toBe('Arcaico e Regionale');
    });
  });

  describe('Unit Name Translations', () => {
    it('should translate unit names correctly for German', () => {
      expect(translate('Meter', 'de', UNIT_NAME_TRANSLATIONS)).toBe('Meter');
      expect(translate('Kilogram', 'de', UNIT_NAME_TRANSLATIONS)).toBe('Kilogramm');
      expect(translate('Second', 'de', UNIT_NAME_TRANSLATIONS)).toBe('Sekunde');
    });

    it('should translate unit names correctly for Spanish', () => {
      expect(translate('Meter', 'es', UNIT_NAME_TRANSLATIONS)).toBe('Metro');
      expect(translate('Kilogram', 'es', UNIT_NAME_TRANSLATIONS)).toBe('Kilogramo');
      expect(translate('Joule', 'es', UNIT_NAME_TRANSLATIONS)).toBe('Julio');
      expect(translate('Watt', 'es', UNIT_NAME_TRANSLATIONS)).toBe('Vatio');
    });

    it('should translate unit names correctly for French', () => {
      expect(translate('Meter', 'fr', UNIT_NAME_TRANSLATIONS)).toBe('Mètre');
      expect(translate('Kilogram', 'fr', UNIT_NAME_TRANSLATIONS)).toBe('Kilogramme');
      expect(translate('Second', 'fr', UNIT_NAME_TRANSLATIONS)).toBe('Seconde');
    });

    it('should translate unit names correctly for Italian', () => {
      expect(translate('Meter', 'it', UNIT_NAME_TRANSLATIONS)).toBe('Metro');
      expect(translate('Kilogram', 'it', UNIT_NAME_TRANSLATIONS)).toBe('Chilogrammo');
    });

    it('should translate unit names correctly for Chinese', () => {
      expect(translate('Meter', 'zh', UNIT_NAME_TRANSLATIONS)).toBe('米');
      expect(translate('Kilogram', 'zh', UNIT_NAME_TRANSLATIONS)).toBe('千克');
      expect(translate('Second', 'zh', UNIT_NAME_TRANSLATIONS)).toBe('秒');
    });

    it('should translate unit names correctly for Japanese', () => {
      expect(translate('Meter', 'ja', UNIT_NAME_TRANSLATIONS)).toBe('メートル');
      expect(translate('Kilogram', 'ja', UNIT_NAME_TRANSLATIONS)).toBe('キログラム');
      expect(translate('Newton', 'ja', UNIT_NAME_TRANSLATIONS)).toBe('ニュートン');
    });

    it('should translate unit names correctly for Korean', () => {
      expect(translate('Meter', 'ko', UNIT_NAME_TRANSLATIONS)).toBe('미터');
      expect(translate('Kilogram', 'ko', UNIT_NAME_TRANSLATIONS)).toBe('킬로그램');
      expect(translate('Newton', 'ko', UNIT_NAME_TRANSLATIONS)).toBe('뉴턴');
      expect(translate('Joule', 'ko', UNIT_NAME_TRANSLATIONS)).toBe('줄');
      expect(translate('Watt', 'ko', UNIT_NAME_TRANSLATIONS)).toBe('와트');
    });

    it('should translate temperature units correctly', () => {
      expect(translate('Kelvin', 'de', UNIT_NAME_TRANSLATIONS)).toBe('Kelvin');
      expect(translate('Celsius', 'zh', UNIT_NAME_TRANSLATIONS)).toBe('摄氏度');
      expect(translate('Fahrenheit', 'ja', UNIT_NAME_TRANSLATIONS)).toBe('華氏');
      expect(translate('Kelvin', 'ko', UNIT_NAME_TRANSLATIONS)).toBe('켈빈');
    });

    it('should translate electrical units correctly for Korean', () => {
      expect(translate('Ampere', 'ko', UNIT_NAME_TRANSLATIONS)).toBe('암페어');
      expect(translate('Volt', 'ko', UNIT_NAME_TRANSLATIONS)).toBe('볼트');
      expect(translate('Ohm', 'ko', UNIT_NAME_TRANSLATIONS)).toBe('옴');
      expect(translate('Coulomb', 'ko', UNIT_NAME_TRANSLATIONS)).toBe('쿨롱');
    });
  });

  describe('SI Symbols Remain Unchanged', () => {
    it('should have SI symbols defined as constants', () => {
      expect(SI_SYMBOLS).toContain('m');
      expect(SI_SYMBOLS).toContain('kg');
      expect(SI_SYMBOLS).toContain('s');
      expect(SI_SYMBOLS).toContain('N');
      expect(SI_SYMBOLS).toContain('J');
      expect(SI_SYMBOLS).toContain('W');
      expect(SI_SYMBOLS).toContain('Pa');
    });

    it('should not translate SI symbols in any language', () => {
      for (const symbol of SI_SYMBOLS) {
        expect(symbol).toMatch(/^[A-Za-zΩµ°²³\/]+$/);
      }
    });

    it('should verify unit symbols in conversion data are Latin/SI (no translated text)', () => {
      const nonLatinScripts = /[\u0600-\u06FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\u0400-\u04FF]/;
      
      for (const category of CONVERSION_DATA) {
        for (const unit of category.units) {
          const symbol = unit.symbol;
          expect(symbol).toBeTruthy();
          expect(typeof symbol).toBe('string');
          const hasNonLatinScript = nonLatinScripts.test(symbol);
          expect(hasNonLatinScript).toBe(false);
        }
      }
    });
  });

  describe('SI Prefix Symbols Remain Unchanged', () => {
    it('should have prefix symbols defined as constants', () => {
      expect(SI_PREFIX_SYMBOLS).toContain('k');
      expect(SI_PREFIX_SYMBOLS).toContain('M');
      expect(SI_PREFIX_SYMBOLS).toContain('G');
      expect(SI_PREFIX_SYMBOLS).toContain('m');
      expect(SI_PREFIX_SYMBOLS).toContain('µ');
      expect(SI_PREFIX_SYMBOLS).toContain('n');
    });

    it('should verify prefix symbols in PREFIXES data are Latin/SI', () => {
      for (const prefix of ALL_PREFIXES) {
        if (prefix.symbol) {
          expect(/^[A-Za-zµ]{1,2}$/.test(prefix.symbol)).toBe(true);
        }
      }
    });

    it('should not translate prefix symbols regardless of language', () => {
      const prefixSymbols = ALL_PREFIXES.map(p => p.symbol).filter(s => s);
      for (const symbol of prefixSymbols) {
        expect(symbol).toMatch(/^[A-Za-zµ]{1,2}$/);
      }
    });
  });

  describe('Translation Coverage', () => {
    it('should support all 12 languages', () => {
      expect(SUPPORTED_LANGUAGES).toHaveLength(12);
      expect(SUPPORTED_LANGUAGES).toContain('en');
      expect(SUPPORTED_LANGUAGES).toContain('en-us');
      expect(SUPPORTED_LANGUAGES).toContain('ar');
      expect(SUPPORTED_LANGUAGES).toContain('de');
      expect(SUPPORTED_LANGUAGES).toContain('es');
      expect(SUPPORTED_LANGUAGES).toContain('fr');
      expect(SUPPORTED_LANGUAGES).toContain('it');
      expect(SUPPORTED_LANGUAGES).toContain('ja');
      expect(SUPPORTED_LANGUAGES).toContain('ko');
      expect(SUPPORTED_LANGUAGES).toContain('pt');
      expect(SUPPORTED_LANGUAGES).toContain('ru');
      expect(SUPPORTED_LANGUAGES).toContain('zh');
    });

    it('should have English and Arabic translations for all UI elements', () => {
      // help-machine-translated intentionally has en: '' (notice only shown for non-English locales)
      const intentionallyEmptyForEn = new Set(['help-machine-translated']);
      for (const key of Object.keys(UI_TRANSLATIONS['en'])) {
        if (!intentionallyEmptyForEn.has(key)) {
          expect(UI_TRANSLATIONS['en'][key]).toBeTruthy();
        }
        expect(UI_TRANSLATIONS['ar'][key]).toBeTruthy();
      }
    });

    it('should have help section keys present in UI_TRANSLATIONS', () => {
      const helpKeys = [
        'help-para-1', 'help-para-2', 'help-para-3', 'help-para-4', 'help-para-5',
        'help-github-note', 'help-llm-note', 'help-machine-translated',
        'Number formatting',
      ];
      for (const key of helpKeys) {
        expect(UI_TRANSLATIONS['en'][key]).toBeDefined();
      }
    });

    it('help-machine-translated should be empty for English', () => {
      expect(translate('help-machine-translated', 'en', UI_TRANSLATIONS)).toBe('');
    });

    it('help-machine-translated should be non-empty for all non-English languages', () => {
      const nonEnglishLangs: SupportedLanguage[] = ['ar', 'de', 'es', 'fr', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'];
      for (const lang of nonEnglishLangs) {
        const val = translate('help-machine-translated', lang, UI_TRANSLATIONS);
        expect(val).toBeTruthy();
        expect(val).not.toBe('');
      }
    });

    it('help para keys should have non-empty translations in all languages', () => {
      const paraKeys = ['help-para-1', 'help-para-2', 'help-para-3', 'help-para-4', 'help-para-5'];
      const langs: SupportedLanguage[] = ['en', 'ar', 'de', 'es', 'fr', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'];
      for (const key of paraKeys) {
        for (const lang of langs) {
          const val = translate(key, lang, UI_TRANSLATIONS);
          expect(val).toBeTruthy();
          expect(val.length).toBeGreaterThan(10);
        }
      }
    });

    it('Number formatting key should have non-empty translations in all languages', () => {
      const langs: SupportedLanguage[] = ['en', 'ar', 'de', 'es', 'fr', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'];
      for (const lang of langs) {
        const val = translate('Number formatting', lang, UI_TRANSLATIONS);
        expect(val).toBeTruthy();
      }
    });

    it('should have English and Arabic translations for all unit names', () => {
      for (const key of Object.keys(UNIT_NAME_TRANSLATIONS['en'])) {
        expect(UNIT_NAME_TRANSLATIONS['en'][key]).toBeTruthy();
        expect(UNIT_NAME_TRANSLATIONS['ar'][key]).toBeTruthy();
      }
    });

    it('should have Korean translations for core UI elements', () => {
      const coreUIElements = [
        'Length', 'Mass', 'Time', 'Temperature', 'Energy', 'Power', 'Force',
        'Pressure', 'Volume', 'Area', 'Speed', 'Acceleration', 'Frequency'
      ];
      
      for (const key of coreUIElements) {
        const translation = translate(key, 'ko', UI_TRANSLATIONS);
        expect(translation).toBeTruthy();
        expect(translation).not.toBe(key);
      }
    });

    it('should have Korean translations for core unit names', () => {
      const coreUnits = [
        'Meter', 'Kilogram', 'Second', 'Newton', 'Joule', 'Watt', 
        'Pascal', 'Hertz', 'Ampere', 'Volt'
      ];
      
      for (const key of coreUnits) {
        const translation = translate(key, 'ko', UNIT_NAME_TRANSLATIONS);
        expect(translation).toBeTruthy();
        expect(translation).not.toBe(key);
      }
    });
  });

  describe('Regional Spelling Variations (English)', () => {
    it('should use "Meter" for en-us variant', () => {
      expect(translate('Meter', 'en-us', UNIT_NAME_TRANSLATIONS)).toBe('Meter');
    });

    it('should use "Metre" for en (British English spelling)', () => {
      expect(translate('Meter', 'en', UNIT_NAME_TRANSLATIONS)).toBe('Metre');
    });
  });

  describe('Asian Script Rendering', () => {
    it('should display Chinese characters correctly', () => {
      expect(translate('Length', 'zh', UI_TRANSLATIONS)).toBe('长度');
      expect(translate('Energy', 'zh', UI_TRANSLATIONS)).toBe('能量');
      expect(translate('Meter', 'zh', UNIT_NAME_TRANSLATIONS)).toBe('米');
    });

    it('should display Japanese characters (kanji/katakana) correctly', () => {
      expect(translate('Length', 'ja', UI_TRANSLATIONS)).toBe('長さ');
      expect(translate('Meter', 'ja', UNIT_NAME_TRANSLATIONS)).toBe('メートル');
      expect(translate('Newton', 'ja', UNIT_NAME_TRANSLATIONS)).toBe('ニュートン');
    });

    it('should display Korean characters (hangul) correctly', () => {
      expect(translate('Length', 'ko', UI_TRANSLATIONS)).toBe('길이');
      expect(translate('Meter', 'ko', UNIT_NAME_TRANSLATIONS)).toBe('미터');
      expect(translate('Newton', 'ko', UNIT_NAME_TRANSLATIONS)).toBe('뉴턴');
    });

    it('should display Arabic characters correctly with proper direction', () => {
      expect(translate('Length', 'ar', UI_TRANSLATIONS)).toBe('الطول');
      expect(translate('Mass', 'ar', UI_TRANSLATIONS)).toBe('الكتلة');
    });

    it('should display Russian Cyrillic characters correctly', () => {
      expect(translate('Length', 'ru', UI_TRANSLATIONS)).toBe('Длина');
      expect(translate('Meter', 'ru', UNIT_NAME_TRANSLATIONS)).toBe('Метр');
    });
  });
});

describe('Consistency Between Translations and Data', () => {
  it('should have category names that can be translated', () => {
    const categoryNames = CONVERSION_DATA.map(c => c.name);
    for (const name of categoryNames) {
      expect(name).toBeTruthy();
      expect(typeof name).toBe('string');
    }
  });

  it('should have unit names that can be translated', () => {
    for (const category of CONVERSION_DATA) {
      for (const unit of category.units) {
        expect(unit.name).toBeTruthy();
        expect(typeof unit.name).toBe('string');
      }
    }
  });

  it('should have translations for all category names in conversion data', () => {
    const categoryNames = CONVERSION_DATA.map(c => c.name);
    for (const name of categoryNames) {
      const enTranslation = translate(name, 'en', UI_TRANSLATIONS);
      expect(enTranslation).toBeTruthy();
    }
  });
});

describe('Arabic-Indic Numeral Conversion', () => {
  const toArabicNumerals = (str: string): string => {
    const arabicMap: Record<string, string> = {
      '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
      '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩'
    };
    return str.split('').map(c => arabicMap[c] || c).join('');
  };

  const toLatinNumerals = (str: string): string => {
    const latinMap: Record<string, string> = {
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
      '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
    };
    return str.split('').map(c => latinMap[c] || c).join('');
  };

  it('should convert single digits correctly', () => {
    expect(toArabicNumerals('0')).toBe('٠');
    expect(toArabicNumerals('1')).toBe('١');
    expect(toArabicNumerals('5')).toBe('٥');
    expect(toArabicNumerals('9')).toBe('٩');
  });

  it('should convert multi-digit numbers correctly', () => {
    expect(toArabicNumerals('123')).toBe('١٢٣');
    expect(toArabicNumerals('456789')).toBe('٤٥٦٧٨٩');
    expect(toArabicNumerals('1000000')).toBe('١٠٠٠٠٠٠');
  });

  it('should convert numbers with decimals correctly', () => {
    expect(toArabicNumerals('3.14159')).toBe('٣.١٤١٥٩');
    expect(toArabicNumerals('0.001')).toBe('٠.٠٠١');
    expect(toArabicNumerals('123.456')).toBe('١٢٣.٤٥٦');
  });

  it('should convert negative numbers correctly', () => {
    expect(toArabicNumerals('-5')).toBe('-٥');
    expect(toArabicNumerals('-123.456')).toBe('-١٢٣.٤٥٦');
  });

  it('should convert scientific notation correctly', () => {
    expect(toArabicNumerals('1.0546e-34')).toBe('١.٠٥٤٦e-٣٤');
    expect(toArabicNumerals('6.022e23')).toBe('٦.٠٢٢e٢٣');
    expect(toArabicNumerals('1e10')).toBe('١e١٠');
  });

  it('should preserve non-digit characters', () => {
    expect(toArabicNumerals('×1.5')).toBe('×١.٥');
    expect(toArabicNumerals('100%')).toBe('١٠٠%');
    expect(toArabicNumerals('$123.45')).toBe('$١٢٣.٤٥');
  });

  it('should convert Arabic numerals back to Latin', () => {
    expect(toLatinNumerals('٠')).toBe('0');
    expect(toLatinNumerals('١٢٣')).toBe('123');
    expect(toLatinNumerals('٣.١٤١٥٩')).toBe('3.14159');
    expect(toLatinNumerals('١.٠٥٤٦e-٣٤')).toBe('1.0546e-34');
  });

  it('should handle round-trip conversion correctly', () => {
    const testNumbers = ['0', '123', '3.14159', '-456.789', '1.0546e-34'];
    for (const num of testNumbers) {
      expect(toLatinNumerals(toArabicNumerals(num))).toBe(num);
    }
  });
});

describe('EN vs EN-US Regional Spelling', () => {
  describe('Fuel Type Names', () => {
    it('should display Gasoline for en-us locale', () => {
      expect(translate('Litre of Gasoline (Petrol)', 'en-us', UNIT_NAME_TRANSLATIONS)).toBe('Liter of Gasoline');
      expect(translate('Kilogram of Gasoline (Petrol)', 'en-us', UNIT_NAME_TRANSLATIONS)).toBe('Kilogram of Gasoline');
      expect(translate('Gallon of Gasoline (US)', 'en-us', UNIT_NAME_TRANSLATIONS)).toBe('Gallon of Gasoline (US)');
    });

    it('should display Petrol for en (UK) locale', () => {
      expect(translate('Litre of Gasoline (Petrol)', 'en', UNIT_NAME_TRANSLATIONS)).toBe('Litre of Petrol');
      expect(translate('Kilogram of Gasoline (Petrol)', 'en', UNIT_NAME_TRANSLATIONS)).toBe('Kilogram of Petrol');
    });

    it('should display Kerosene for en-us locale', () => {
      expect(translate('Litre of Kerosene (Paraffin)', 'en-us', UNIT_NAME_TRANSLATIONS)).toBe('Liter of Kerosene');
      expect(translate('Kilogram of Kerosene (Paraffin)', 'en-us', UNIT_NAME_TRANSLATIONS)).toBe('Kilogram of Kerosene');
    });

    it('should display Paraffin for en (UK) locale', () => {
      expect(translate('Litre of Kerosene (Paraffin)', 'en', UNIT_NAME_TRANSLATIONS)).toBe('Litre of Paraffin');
      expect(translate('Kilogram of Kerosene (Paraffin)', 'en', UNIT_NAME_TRANSLATIONS)).toBe('Kilogram of Paraffin');
    });
  });

  describe('Meter/Metre Spelling', () => {
    it('should keep Meter spelling for en-us', () => {
      expect(translate('Meter', 'en-us', UNIT_NAME_TRANSLATIONS)).toBe('Meter');
    });

    it('should convert to Metre spelling for en (UK)', () => {
      expect(translate('Meter', 'en', UNIT_NAME_TRANSLATIONS)).toBe('Metre');
    });
  });

  describe('Liter/Litre Spelling', () => {
    it('should keep Liter spelling for en-us', () => {
      expect(translate('Liter', 'en-us', UNIT_NAME_TRANSLATIONS)).toBe('Liter');
    });

    it('should convert to Litre spelling for en (UK)', () => {
      expect(translate('Liter', 'en', UNIT_NAME_TRANSLATIONS)).toBe('Litre');
    });
  });
});

describe('Angular Momentum Category', () => {
  const angularMomentumCategory = CONVERSION_DATA.find(c => c.name === 'Angular Momentum');

  it('should have Angular Momentum category defined', () => {
    expect(angularMomentumCategory).toBeDefined();
  });

  it('should have correct SI base unit', () => {
    expect(angularMomentumCategory?.baseUnit).toBe('kilogram meter²/second');
    expect(angularMomentumCategory?.baseSISymbol).toBe('kg⋅m²⋅s⁻¹');
  });

  it('should be in the Mechanics category group (mass·length²·time⁻¹ dimensions)', () => {
    expect(angularMomentumCategory?.id).toBe('angular_momentum');
    expect(angularMomentumCategory?.name).toBe('Angular Momentum');
  });

  it('should have 8 units defined', () => {
    expect(angularMomentumCategory?.units).toHaveLength(8);
  });

  it('should have correct conversion factors for key units', () => {
    const units = angularMomentumCategory?.units || [];
    
    const kgm2s = units.find(u => u.id === 'kgm2s');
    expect(kgm2s?.factor).toBe(1);
    
    const gcm2s = units.find(u => u.id === 'gcm2s');
    expect(gcm2s?.factor).toBe(1e-7);
    
    const hbar = units.find(u => u.id === 'hbar');
    expect(hbar?.factor).toBeCloseTo(1.054571817e-34, 44);
  });

  it('should have reduced Planck constant (ℏ) as a unit', () => {
    const hbar = angularMomentumCategory?.units.find(u => u.id === 'hbar');
    expect(hbar).toBeDefined();
    expect(hbar?.symbol).toBe('ℏ');
    expect(hbar?.name).toBe('Reduced Planck constant');
  });

  it('should have translations for Angular Momentum category name', () => {
    expect(translate('Angular Momentum', 'ko', UI_TRANSLATIONS)).toBe('각운동량');
    expect(translate('Angular Momentum', 'ja', UI_TRANSLATIONS)).toBe('角運動量');
    expect(translate('Angular Momentum', 'zh', UI_TRANSLATIONS)).toBe('角动量');
    expect(translate('Angular Momentum', 'de', UI_TRANSLATIONS)).toBe('Drehimpuls');
    expect(translate('Angular Momentum', 'fr', UI_TRANSLATIONS)).toBe('Moment Cinétique');
  });

  describe('Angular Momentum Conversions', () => {
    const convert = (value: number, fromId: string, toId: string): number => {
      const units = angularMomentumCategory?.units || [];
      const fromUnit = units.find(u => u.id === fromId);
      const toUnit = units.find(u => u.id === toId);
      if (!fromUnit || !toUnit) return NaN;
      return value * fromUnit.factor / toUnit.factor;
    };

    it('should convert 1 kg⋅m²/s to kg⋅m²/s correctly', () => {
      expect(convert(1, 'kgm2s', 'kgm2s')).toBe(1);
    });

    it('should convert 1 J⋅s to kg⋅m²/s correctly', () => {
      expect(convert(1, 'js', 'kgm2s')).toBeCloseTo(1, 10);
    });

    it('should convert 1 g⋅cm²/s to kg⋅m²/s correctly', () => {
      expect(convert(1, 'gcm2s', 'kgm2s')).toBeCloseTo(1e-7, 17);
    });

    it('should convert 1 ℏ to kg⋅m²/s correctly', () => {
      const hbarValue = convert(1, 'hbar', 'kgm2s');
      expect(hbarValue).toBeCloseTo(1.054571817e-34, 44);
    });

    it('should handle very small values (ℏ) without displaying as 0', () => {
      const hbarValue = convert(1, 'hbar', 'kgm2s');
      expect(hbarValue).not.toBe(0);
      expect(Math.abs(hbarValue)).toBeGreaterThan(0);
      expect(Math.abs(hbarValue)).toBeLessThan(1e-30);
    });
  });
});
