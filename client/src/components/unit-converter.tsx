import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CONVERSION_DATA, UnitCategory, convert, PREFIXES, ALL_PREFIXES, Prefix, findOptimalPrefix, parseUnitText, ParsedUnitResult, getFilteredSortedUnits } from '@/lib/conversion-data';
import { UNIT_NAME_TRANSLATIONS, UI_TRANSLATIONS, type SupportedLanguage, type Translation } from '@/lib/localization';
import { 
  fixPrecision, toArabicNumerals, toLatinNumerals, roundToNearestEven, 
  toFixedBanker, toTitleCase, NUMBER_FORMATS, type NumberFormat,
  parseNumberWithFormat as parseNumberWithSpecificFormat,
  formatNumberWithFormat as formatNumberWithSpecificFormat
} from '@/lib/formatting';
import { 
  DimensionalFormula, CalcValue, DerivedUnitInfo, SI_DERIVED_UNITS,
  NON_SI_UNITS_CATALOG, CATEGORY_DIMENSIONS, CategoryDimensionInfo,
  EXCLUDED_CROSS_DOMAIN_CATEGORIES, PREFERRED_REPRESENTATIONS, PreferredRepresentation,
  getDimensionSignature
} from '@/lib/units/shared-types';
import { 
  formatDimensions, toSuperscript, multiplyDimensions, divideDimensions,
  dimensionsEqual, isDimensionless, findCrossDomainMatches,
  isValidSymbolRepresentation, countUnits,
  generateSIRepresentations as generateSIRepresentationsLib,
  isDimensionEmpty, SIRepresentation,
  canAddSubtract, subtractDimensions, canFactorOut, hasOnlyOriginalDimensions,
  normalizeDimensions, generateAlternativeRepresentations, AlternativeRepresentation
} from '@/lib/calculator';
import { 
  PREFIX_EXPONENTS, GRAM_TO_KG_UNIT_PAIRS, KG_TO_GRAM_UNIT_PAIRS, 
  normalizeMassUnit as normalizeMassUnitHelper, EXPONENT_TO_PREFIX,
  normalizeMassValue as normalizeMassValueLib,
  normalizeMassDisplay as normalizeMassDisplayLib,
  applyPrefixToKgUnit as applyPrefixToKgUnitLib,
  applyRegionalSpelling as applyRegionalSpellingLib,
  findBestPrefix
} from '@/lib/units/helpers';
import { useRpnStack } from '@/components/unit-converter/hooks/useRpnStack';
import { useAllFlashFlags } from '@/components/unit-converter/hooks/useFlashFlag';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft, Copy, Info, ClipboardPaste } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { testId } from '@/lib/test-utils';
import HelpSection from '@/components/help-section';
import { 
  FIELD_HEIGHT, CommonFieldWidth, OperatorBtnWidth, ClearBtnWidth, 
  RpnBtnWidth, RpnBtnCount, CALC_CONTENT_HEIGHT, ISO_LANGUAGES 
} from '@/components/unit-converter/constants';
import { CalculatorFieldDisplay } from '@/components/unit-converter/components/CalculatorFieldDisplay';

export default function UnitConverter() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeCategory, setActiveCategory] = useState<UnitCategory>('length');
  const [fromUnit, setFromUnit] = useState<string>('');
  const [toUnit, setToUnit] = useState<string>('');
  const [fromPrefix, setFromPrefix] = useState<string>('none');
  const [toPrefix, setToPrefix] = useState<string>('none');
  const [inputValue, setInputValue] = useState<string>('1');
  const [result, setResult] = useState<number | null>(null);
  const [precision, setPrecision] = useState<number>(4);
  const [calculatorPrecision, setCalculatorPrecision] = useState<number>(4);
  const [comparisonMode, setComparisonMode] = useState<boolean>(false);
  
  // Flash flags for copy feedback animations (using consolidated hook)
  const flash = useAllFlashFlags(300);
  const [flashCopyResult, triggerFlashCopyResult] = flash.copyResult;
  const [flashCopyCalc, triggerFlashCopyCalc] = flash.copyCalc;
  const [flashCalcField1, triggerFlashCalcField1] = flash.calcField1;
  const [flashCalcField2, triggerFlashCalcField2] = flash.calcField2;
  const [flashCalcField3, triggerFlashCalcField3] = flash.calcField3;
  const [flashFromBaseFactor, triggerFlashFromBaseFactor] = flash.fromBaseFactor;
  const [flashFromSIBase, triggerFlashFromSIBase] = flash.fromSIBase;
  const [flashToBaseFactor, triggerFlashToBaseFactor] = flash.toBaseFactor;
  const [flashToSIBase, triggerFlashToSIBase] = flash.toSIBase;
  const [flashConversionRatio, triggerFlashConversionRatio] = flash.conversionRatio;
  const [flashRpnField1, triggerFlashRpnField1] = flash.rpnField1;
  const [flashRpnField2, triggerFlashRpnField2] = flash.rpnField2;
  const [flashRpnField3, triggerFlashRpnField3] = flash.rpnField3;
  const [flashRpnResult, triggerFlashRpnResult] = flash.rpnResult;
  const [flashDirectCopy, triggerFlashDirectCopy] = flash.directCopy;
  
  // Calculator mode state ('simple' | 'rpn')
  const [calculatorMode, setCalculatorMode] = useState<'simple' | 'rpn'>('rpn');
  const [shiftActive, setShiftActive] = useState(false);
  
  // RPN calculator state (using consolidated hook)
  const rpn = useRpnStack();
  const {
    rpnStack, setRpnStack, previousRpnStack, setPreviousRpnStack,
    lastX, setLastX, rpnResultPrefix, setRpnResultPrefix,
    rpnSelectedAlternative, setRpnSelectedAlternative,
    rpnXEditing, setRpnXEditing, rpnXEditValue, setRpnXEditValue,
    saveAndUpdateStack, pushValue: rpnPushValue, dropValue: rpnDropValue,
    swapXY: rpnSwapXY, clearStack: rpnClearStack, undoStack: rpnUndoStack,
    recallLastX: rpnRecallLastX
  } = rpn;
  
  // Tab state
  const [activeTab, setActiveTab] = useState<string>('converter');
  
  // Direct tab state - exponents for each SI base unit
  // Values: 0 = not used, 1-5 = positive exponents, -1 to -5 = negative exponents
  const [directValue, setDirectValue] = useState<string>('1');
  const [directExponents, setDirectExponents] = useState<Record<string, number>>({
    m: 0,    // length (meter)
    kg: 0,   // mass (kilogram)
    s: 0,    // time (second)
    A: 0,    // current (ampere)
    K: 0,    // temperature (kelvin)
    mol: 0,  // amount (mole)
    cd: 0,   // intensity (candela)
    rad: 0,  // angle (radian)
    sr: 0    // solid angle (steradian)
  });

  // Backward compatibility alias - types and catalogs imported from shared-types
  const DERIVED_UNITS_CATALOG = SI_DERIVED_UNITS;

  // Calculator state
  const [calcValues, setCalcValues] = useState<Array<CalcValue | null>>([null, null, null, null]);
  const [calcOp1, setCalcOp1] = useState<'+' | '-' | '*' | '/' | null>(null);
  const [calcOp2, setCalcOp2] = useState<'+' | '-' | '*' | '/' | null>(null);
  const [resultUnit, setResultUnit] = useState<string | null>(null);
  const [resultCategory, setResultCategory] = useState<UnitCategory | null>(null);
  const [resultPrefix, setResultPrefix] = useState<string>('none');
  const [selectedAlternative, setSelectedAlternative] = useState<number>(0); // Index of selected alternative representation

  // Number format state
  const [numberFormat, setNumberFormat] = useState<NumberFormat>('uk');
  
  // Language state (ISO 639-1 codes)
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  
  // Wrappers for extracted helper functions
  const applyRegionalSpelling = (unitName: string): string => applyRegionalSpellingLib(unitName, language);
  const normalizeMassUnit = normalizeMassUnitHelper;
  const normalizeMassValue = normalizeMassValueLib;
  const applyPrefixToKgUnit = applyPrefixToKgUnitLib;
  
  // Helper to get unit info for mass display normalization
  const getMassUnitInfo = (unitId: string) => {
    const cat = CONVERSION_DATA.find(c => c.id === 'mass');
    const unit = cat?.units.find(u => u.id === unitId);
    return unit ? { factor: unit.factor, symbol: unit.symbol, allowPrefixes: unit.allowPrefixes || false } : undefined;
  };
  const normalizeMassDisplay = (valueInKg: number, currentPrefix: string, unitId: string | null) => 
    normalizeMassDisplayLib(valueInKg, currentPrefix, unitId, getMassUnitInfo);

  // Translations for multiple languages
  // Supported languages: en (English), ar (Arabic), de (German), es (Spanish), fr (French), 
  // it (Italian), ko (Korean), pt (Portuguese), ru (Russian), zh (Chinese), ja (Japanese)
  // Other languages fall back to English
  const TRANSLATIONS: Record<string, { 
    en: string; 
    ar: string; 
    de?: string;
    es?: string;
    fr?: string;
    it?: string;
    ko?: string;
    pt?: string;
    ru?: string;
    zh?: string;
    ja?: string;
  }> = {
    // Category Groups
    'Base Quantities': { 
      en: 'Base Quantities', ar: 'الكميات الأساسية', de: 'Basisgrößen',
      es: 'Cantidades Base', fr: 'Grandeurs de Base', it: 'Grandezze di Base', ko: '기본량',
      pt: 'Grandezas Base', ru: 'Базовые Величины', zh: '基本量', ja: '基本量'
    },
    'Mechanics': { 
      en: 'Mechanics', ar: 'الميكانيكا', de: 'Mechanik',
      es: 'Mecánica', fr: 'Mécanique', it: 'Meccanica', ko: '역학',
      pt: 'Mecânica', ru: 'Механика', zh: '力学', ja: '力学'
    },
    'Thermodynamics & Chemistry': { 
      en: 'Thermodynamics & Chemistry', ar: 'الديناميكا الحرارية والكيمياء', de: 'Thermodynamik & Chemie',
      es: 'Termodinámica y Química', fr: 'Thermodynamique et Chimie', it: 'Termodinamica e Chimica', ko: '열역학 및 화학',
      pt: 'Termodinâmica e Química', ru: 'Термодинамика и Химия', zh: '热力学与化学', ja: '熱力学と化学'
    },
    'Electricity & Magnetism': { 
      en: 'Electricity & Magnetism', ar: 'الكهرباء والمغناطيسية', de: 'Elektrizität & Magnetismus',
      es: 'Electricidad y Magnetismo', fr: 'Électricité et Magnétisme', it: 'Elettricità e Magnetismo', ko: '전기 및 자기',
      pt: 'Eletricidade e Magnetismo', ru: 'Электричество и Магнетизм', zh: '电磁学', ja: '電気と磁気'
    },
    'Radiation & Physics': { 
      en: 'Radiation & Physics', ar: 'الإشعاع والفيزياء', de: 'Strahlung & Physik',
      es: 'Radiación y Física', fr: 'Radiation et Physique', it: 'Radiazione e Fisica', ko: '방사선 및 물리학',
      pt: 'Radiação e Física', ru: 'Излучение и Физика', zh: '辐射与物理', ja: '放射線と物理学'
    },
    'Human Response': { 
      en: 'Human Response', ar: 'الاستجابة البشرية', de: 'Menschliche Wahrnehmung',
      es: 'Respuesta Humana', fr: 'Réponse Humaine', it: 'Risposta Umana', ko: '인간 반응',
      pt: 'Resposta Humana', ru: 'Человеческое Восприятие', zh: '人体响应', ja: '人間の反応'
    },
    'Specialized': { 
      en: 'Specialized', ar: 'متخصص', de: 'Spezialisiert',
      es: 'Especializado', fr: 'Spécialisé', it: 'Specializzato', ko: '특수',
      pt: 'Especializado', ru: 'Специализированные', zh: '专业', ja: '専門'
    },
    'Other': { 
      en: 'Other', ar: 'أخرى', de: 'Andere',
      es: 'Otros', fr: 'Autres', it: 'Altri', ko: '기타',
      pt: 'Outros', ru: 'Другое', zh: '其他', ja: 'その他'
    },
    // Categories
    'Length': { 
      en: 'Length', ar: 'الطول', de: 'Länge',
      es: 'Longitud', fr: 'Longueur', it: 'Lunghezza', ko: '길이',
      pt: 'Comprimento', ru: 'Длина', zh: '长度', ja: '長さ'
    },
    'Mass': { 
      en: 'Mass', ar: 'الكتلة', de: 'Masse',
      es: 'Masa', fr: 'Masse', it: 'Massa', ko: '질량',
      pt: 'Massa', ru: 'Масса', zh: '质量', ja: '質量'
    },
    'Time': { 
      en: 'Time', ar: 'الوقت', de: 'Zeit',
      es: 'Tiempo', fr: 'Temps', it: 'Tempo', ko: '시간',
      pt: 'Tempo', ru: 'Время', zh: '时间', ja: '時間'
    },
    'Electric Current': { 
      en: 'Electric Current', ar: 'التيار الكهربائي', de: 'Elektrischer Strom',
      es: 'Corriente Eléctrica', fr: 'Courant Électrique', it: 'Corrente Elettrica', ko: '전류',
      pt: 'Corrente Elétrica', ru: 'Электрический Ток', zh: '电流', ja: '電流'
    },
    'Temperature': { 
      en: 'Temperature', ar: 'درجة الحرارة', de: 'Temperatur',
      es: 'Temperatura', fr: 'Température', it: 'Temperatura', ko: '온도',
      pt: 'Temperatura', ru: 'Температура', zh: '温度', ja: '温度'
    },
    'Amount of Substance': { 
      en: 'Amount of Substance', ar: 'كمية المادة', de: 'Stoffmenge',
      es: 'Cantidad de Sustancia', fr: 'Quantité de Matière', it: 'Quantità di Sostanza', ko: '물질량',
      pt: 'Quantidade de Substância', ru: 'Количество Вещества', zh: '物质的量', ja: '物質量'
    },
    'Luminous Intensity': { 
      en: 'Luminous Intensity', ar: 'شدة الإضاءة', de: 'Lichtstärke',
      es: 'Intensidad Luminosa', fr: 'Intensité Lumineuse', it: 'Intensità Luminosa', ko: '광도',
      pt: 'Intensidade Luminosa', ru: 'Сила Света', zh: '发光强度', ja: '光度'
    },
    'Area': { 
      en: 'Area', ar: 'المساحة', de: 'Fläche',
      es: 'Área', fr: 'Surface', it: 'Area', ko: '면적',
      pt: 'Área', ru: 'Площадь', zh: '面积', ja: '面積'
    },
    'Volume': { 
      en: 'Volume', ar: 'الحجم', de: 'Volumen',
      es: 'Volumen', fr: 'Volume', it: 'Volume', ko: '부피',
      pt: 'Volume', ru: 'Объём', zh: '体积', ja: '体積'
    },
    'Speed': { 
      en: 'Speed', ar: 'السرعة', de: 'Geschwindigkeit',
      es: 'Velocidad', fr: 'Vitesse', it: 'Velocità', ko: '속도',
      pt: 'Velocidade', ru: 'Скорость', zh: '速度', ja: '速度'
    },
    'Acceleration': { 
      en: 'Acceleration', ar: 'التسارع', de: 'Beschleunigung',
      es: 'Aceleración', fr: 'Accélération', it: 'Accelerazione', ko: '가속도',
      pt: 'Aceleração', ru: 'Ускорение', zh: '加速度', ja: '加速度'
    },
    'Force': { 
      en: 'Force', ar: 'القوة', de: 'Kraft',
      es: 'Fuerza', fr: 'Force', it: 'Forza', ko: '힘',
      pt: 'Força', ru: 'Сила', zh: '力', ja: '力'
    },
    'Pressure': { 
      en: 'Pressure', ar: 'الضغط', de: 'Druck',
      es: 'Presión', fr: 'Pression', it: 'Pressione', ko: '압력',
      pt: 'Pressão', ru: 'Давление', zh: '压力', ja: '圧力'
    },
    'Energy': { 
      en: 'Energy', ar: 'الطاقة', de: 'Energie',
      es: 'Energía', fr: 'Énergie', it: 'Energia', ko: '에너지',
      pt: 'Energia', ru: 'Энергия', zh: '能量', ja: 'エネルギー'
    },
    'Power': { 
      en: 'Power', ar: 'القدرة', de: 'Leistung',
      es: 'Potencia', fr: 'Puissance', it: 'Potenza', ko: '일률',
      pt: 'Potência', ru: 'Мощность', zh: '功率', ja: '仕事率'
    },
    'Torque': { 
      en: 'Torque', ar: 'عزم الدوران', de: 'Drehmoment',
      es: 'Par', fr: 'Couple', it: 'Coppia', ko: '토크',
      pt: 'Torque', ru: 'Крутящий Момент', zh: '扭矩', ja: 'トルク'
    },
    'Flow Rate': { 
      en: 'Flow Rate', ar: 'معدل التدفق', de: 'Durchflussrate',
      es: 'Caudal', fr: 'Débit', it: 'Portata', ko: '유량',
      pt: 'Taxa de Fluxo', ru: 'Расход', zh: '流量', ja: '流量'
    },
    'Flow Rate (Volumetric)': { 
      en: 'Flow Rate (Volumetric)', ar: 'معدل التدفق (الحجمي)', de: 'Durchflussrate (Volumetrisch)',
      es: 'Caudal (Volumétrico)', fr: 'Débit (Volumétrique)', it: 'Portata (Volumetrica)', ko: '유량 (체적)',
      pt: 'Taxa de Fluxo (Volumétrica)', ru: 'Расход (Объёмный)', zh: '流量（体积）', ja: '流量（体積）'
    },
    'Density': { 
      en: 'Density', ar: 'الكثافة', de: 'Dichte',
      es: 'Densidad', fr: 'Densité', it: 'Densità', ko: '밀도',
      pt: 'Densidade', ru: 'Плотность', zh: '密度', ja: '密度'
    },
    'Dynamic Viscosity': { 
      en: 'Dynamic Viscosity', ar: 'اللزوجة الديناميكية', de: 'Dynamische Viskosität',
      es: 'Viscosidad Dinámica', fr: 'Viscosité Dynamique', it: 'Viscosità Dinamica', ko: '동점성',
      pt: 'Viscosidade Dinâmica', ru: 'Динамическая Вязкость', zh: '动态粘度', ja: '動粘度'
    },
    'Viscosity (Dynamic)': { 
      en: 'Viscosity (Dynamic)', ar: 'اللزوجة (الديناميكية)', de: 'Viskosität (Dynamisch)',
      es: 'Viscosidad (Dinámica)', fr: 'Viscosité (Dynamique)', it: 'Viscosità (Dinamica)', ko: '점성 (동적)',
      pt: 'Viscosidade (Dinâmica)', ru: 'Вязкость (Динамическая)', zh: '粘度（动态）', ja: '粘度（動的）'
    },
    'Surface Tension': { 
      en: 'Surface Tension', ar: 'التوتر السطحي', de: 'Oberflächenspannung',
      es: 'Tensión Superficial', fr: 'Tension Superficielle', it: 'Tensione Superficiale', ko: '표면 장력',
      pt: 'Tensão Superficial', ru: 'Поверхностное Натяжение', zh: '表面张力', ja: '表面張力'
    },
    'Charge': { 
      en: 'Charge', ar: 'الشحنة', de: 'Ladung',
      es: 'Carga', fr: 'Charge', it: 'Carica', ko: '전하',
      pt: 'Carga', ru: 'Заряд', zh: '电荷', ja: '電荷'
    },
    'Electric Charge': { 
      en: 'Electric Charge', ar: 'الشحنة الكهربائية', de: 'Elektrische Ladung',
      es: 'Carga Eléctrica', fr: 'Charge Électrique', it: 'Carica Elettrica', ko: '전하',
      pt: 'Carga Elétrica', ru: 'Электрический Заряд', zh: '电荷', ja: '電荷'
    },
    'Potential': { 
      en: 'Potential', ar: 'الجهد', de: 'Potential',
      es: 'Potencial', fr: 'Potentiel', it: 'Potenziale', ko: '전위',
      pt: 'Potencial', ru: 'Потенциал', zh: '电势', ja: '電位'
    },
    'Electric Potential': { 
      en: 'Electric Potential', ar: 'الجهد الكهربائي', de: 'Elektrisches Potential',
      es: 'Potencial Eléctrico', fr: 'Potentiel Électrique', it: 'Potenziale Elettrico', ko: '전위',
      pt: 'Potencial Elétrico', ru: 'Электрический Потенциал', zh: '电势', ja: '電位'
    },
    'Capacitance': { 
      en: 'Capacitance', ar: 'السعة', de: 'Kapazität',
      es: 'Capacitancia', fr: 'Capacité', it: 'Capacità', ko: '정전용량',
      pt: 'Capacitância', ru: 'Ёмкость', zh: '电容', ja: '静電容量'
    },
    'Resistance': { 
      en: 'Resistance', ar: 'المقاومة', de: 'Widerstand',
      es: 'Resistencia', fr: 'Résistance', it: 'Resistenza', ko: '저항',
      pt: 'Resistência', ru: 'Сопротивление', zh: '电阻', ja: '抵抗'
    },
    'Conductance': { 
      en: 'Conductance', ar: 'الموصلية', de: 'Leitwert',
      es: 'Conductancia', fr: 'Conductance', it: 'Conduttanza', ko: '전도도',
      pt: 'Condutância', ru: 'Проводимость', zh: '电导', ja: 'コンダクタンス'
    },
    'Inductance': { 
      en: 'Inductance', ar: 'الحث', de: 'Induktivität',
      es: 'Inductancia', fr: 'Inductance', it: 'Induttanza', ko: '인덕턴스',
      pt: 'Indutância', ru: 'Индуктивность', zh: '电感', ja: 'インダクタンス'
    },
    'Magnetic Flux': { 
      en: 'Magnetic Flux', ar: 'التدفق المغناطيسي', de: 'Magnetischer Fluss',
      es: 'Flujo Magnético', fr: 'Flux Magnétique', it: 'Flusso Magnetico', ko: '자속',
      pt: 'Fluxo Magnético', ru: 'Магнитный Поток', zh: '磁通量', ja: '磁束'
    },
    'Magnetic Flux Density': { 
      en: 'Magnetic Flux Density', ar: 'كثافة التدفق المغناطيسي', de: 'Magnetische Flussdichte',
      es: 'Densidad de Flujo Magnético', fr: 'Densité de Flux Magnétique', it: 'Densità di Flusso Magnetico', ko: '자속밀도',
      pt: 'Densidade de Fluxo Magnético', ru: 'Магнитная Индукция', zh: '磁通密度', ja: '磁束密度'
    },
    'Radioactivity': { 
      en: 'Radioactivity', ar: 'النشاط الإشعاعي', de: 'Radioaktivität',
      es: 'Radioactividad', fr: 'Radioactivité', it: 'Radioattività', ko: '방사능',
      pt: 'Radioatividade', ru: 'Радиоактивность', zh: '放射性', ja: '放射能'
    },
    'Radiation Dose': { 
      en: 'Radiation Dose', ar: 'جرعة الإشعاع', de: 'Strahlendosis',
      es: 'Dosis de Radiación', fr: 'Dose de Radiation', it: 'Dose di Radiazione', ko: '방사선량',
      pt: 'Dose de Radiação', ru: 'Доза Излучения', zh: '辐射剂量', ja: '放射線量'
    },
    'Absorbed Radiation Dose': { 
      en: 'Absorbed Radiation Dose', ar: 'جرعة الإشعاع الممتص', de: 'Absorbierte Strahlendosis',
      es: 'Dosis de Radiación Absorbida', fr: 'Dose de Radiation Absorbée', it: 'Dose di Radiazione Assorbita', ko: '흡수선량',
      pt: 'Dose de Radiação Absorvida', ru: 'Поглощённая Доза', zh: '吸收剂量', ja: '吸収線量'
    },
    'Equivalent Dose': { 
      en: 'Equivalent Dose', ar: 'الجرعة المكافئة', de: 'Äquivalentdosis',
      es: 'Dosis Equivalente', fr: 'Dose Équivalente', it: 'Dose Equivalente', ko: '등가선량',
      pt: 'Dose Equivalente', ru: 'Эквивалентная Доза', zh: '当量剂量', ja: '等価線量'
    },
    'Equivalent Radiation Dose': { 
      en: 'Equivalent Radiation Dose', ar: 'جرعة الإشعاع المكافئة', de: 'Äquivalente Strahlendosis',
      es: 'Dosis de Radiación Equivalente', fr: 'Dose de Radiation Équivalente', it: 'Dose di Radiazione Equivalente', ko: '등가방사선량',
      pt: 'Dose de Radiação Equivalente', ru: 'Эквивалентная Доза Излучения', zh: '等效剂量', ja: '等価線量'
    },
    'Catalytic Activity': { 
      en: 'Catalytic Activity', ar: 'النشاط التحفيزي', de: 'Katalytische Aktivität',
      es: 'Actividad Catalítica', fr: 'Activité Catalytique', it: 'Attività Catalitica', ko: '촉매활성',
      pt: 'Atividade Catalítica', ru: 'Каталитическая Активность', zh: '催化活性', ja: '触媒活性'
    },
    'Angle': { 
      en: 'Angle', ar: 'الزاوية', de: 'Winkel',
      es: 'Ángulo', fr: 'Angle', it: 'Angolo', ko: '각도',
      pt: 'Ângulo', ru: 'Угол', zh: '角度', ja: '角度'
    },
    'Plane Angle': { 
      en: 'Plane Angle', ar: 'الزاوية المستوية', de: 'Ebener Winkel',
      es: 'Ángulo Plano', fr: 'Angle Plan', it: 'Angolo Piano', ko: '평면각',
      pt: 'Ângulo Plano', ru: 'Плоский Угол', zh: '平面角', ja: '平面角'
    },
    'Solid Angle': { 
      en: 'Solid Angle', ar: 'الزاوية المجسمة', de: 'Raumwinkel',
      es: 'Ángulo Sólido', fr: 'Angle Solide', it: 'Angolo Solido', ko: '입체각',
      pt: 'Ângulo Sólido', ru: 'Телесный Угол', zh: '立体角', ja: '立体角'
    },
    'Frequency': { 
      en: 'Frequency', ar: 'التردد', de: 'Frequenz',
      es: 'Frecuencia', fr: 'Fréquence', it: 'Frequenza', ko: '주파수',
      pt: 'Frequência', ru: 'Частота', zh: '频率', ja: '周波数'
    },
    'Sound Pressure': { 
      en: 'Sound Pressure', ar: 'ضغط الصوت', de: 'Schalldruck',
      es: 'Presión Sonora', fr: 'Pression Sonore', it: 'Pressione Sonora', ko: '음압',
      pt: 'Pressão Sonora', ru: 'Звуковое Давление', zh: '声压', ja: '音圧'
    },
    'Luminous Flux': { 
      en: 'Luminous Flux', ar: 'التدفق الضوئي', de: 'Lichtstrom',
      es: 'Flujo Luminoso', fr: 'Flux Lumineux', it: 'Flusso Luminoso', ko: '광속',
      pt: 'Fluxo Luminoso', ru: 'Световой Поток', zh: '光通量', ja: '光束'
    },
    'Luminous Flux (Human)': { 
      en: 'Luminous Flux (Human)', ar: 'التدفق الضوئي (البشري)', de: 'Lichtstrom (Menschlich)',
      es: 'Flujo Luminoso (Humano)', fr: 'Flux Lumineux (Humain)', it: 'Flusso Luminoso (Umano)', ko: '광속 (인간)',
      pt: 'Fluxo Luminoso (Humano)', ru: 'Световой Поток (Человеческий)', zh: '光通量（人眼）', ja: '光束（人間）'
    },
    'Illuminance': { 
      en: 'Illuminance', ar: 'الإضاءة', de: 'Beleuchtungsstärke',
      es: 'Iluminancia', fr: 'Éclairement', it: 'Illuminamento', ko: '조도',
      pt: 'Iluminância', ru: 'Освещённость', zh: '照度', ja: '照度'
    },
    'Luminous Exitance': { 
      en: 'Luminous Exitance', ar: 'الإشعاع الضوئي', de: 'Spezifische Lichtausstrahlung',
      es: 'Exitancia Luminosa', fr: 'Exitance Lumineuse', it: 'Emittanza Luminosa', ko: '광출사도',
      pt: 'Exitância Luminosa', ru: 'Светимость', zh: '光出射度', ja: '光出射度'
    },
    'Luminance': { 
      en: 'Luminance', ar: 'اللمعان', de: 'Leuchtdichte',
      es: 'Luminancia', fr: 'Luminance', it: 'Luminanza', ko: '휘도',
      pt: 'Luminância', ru: 'Яркость', zh: '亮度', ja: '輝度'
    },
    'Lightbulb Efficiency': { 
      en: 'Lightbulb Efficiency', ar: 'كفاءة المصباح', de: 'Glühbirnen-Effizienz',
      es: 'Eficiencia de Bombilla', fr: 'Efficacité d\'Ampoule', it: 'Efficienza Lampadina', ko: '전구효율',
      pt: 'Eficiência de Lâmpada', ru: 'Эффективность Лампочки', zh: '灯泡效率', ja: '電球効率'
    },
    'Refractive Power': { 
      en: 'Refractive Power', ar: 'قوة الانكسار', de: 'Brechkraft',
      es: 'Potencia Refractiva', fr: 'Puissance de Réfraction', it: 'Potere Rifrattivo', ko: '굴절력',
      pt: 'Poder Refrativo', ru: 'Оптическая Сила', zh: '屈光度', ja: '屈折力'
    },
    'Refractive Power (Vision)': { 
      en: 'Refractive Power (Vision)', ar: 'قوة الانكسار (البصر)', de: 'Brechkraft (Sehen)',
      es: 'Potencia Refractiva (Visión)', fr: 'Puissance de Réfraction (Vision)', it: 'Potere Rifrattivo (Vista)', ko: '굴절력 (시력)',
      pt: 'Poder Refrativo (Visão)', ru: 'Оптическая Сила (Зрение)', zh: '屈光度（视力）', ja: '屈折力（視覚）'
    },
    'Angular Velocity': { 
      en: 'Angular Velocity', ar: 'السرعة الزاوية', de: 'Winkelgeschwindigkeit',
      es: 'Velocidad Angular', fr: 'Vitesse Angulaire', it: 'Velocità Angolare', ko: '각속도',
      pt: 'Velocidade Angular', ru: 'Угловая Скорость', zh: '角速度', ja: '角速度'
    },
    'Kinematic Viscosity': { 
      en: 'Kinematic Viscosity', ar: 'اللزوجة الحركية', de: 'Kinematische Viskosität',
      es: 'Viscosidad Cinemática', fr: 'Viscosité Cinématique', it: 'Viscosità Cinematica', ko: '동점성',
      pt: 'Viscosidade Cinemática', ru: 'Кинематическая Вязкость', zh: '运动粘度', ja: '動粘度'
    },
    'Momentum': { 
      en: 'Momentum', ar: 'الزخم', de: 'Impuls',
      es: 'Momento', fr: 'Quantité de Mouvement', it: 'Momento', ko: '운동량',
      pt: 'Momento', ru: 'Импульс', zh: '动量', ja: '運動量'
    },
    'Angular Momentum': { 
      en: 'Angular Momentum', ar: 'الزخم الزاوي', de: 'Drehimpuls',
      es: 'Momento Angular', fr: 'Moment Cinétique', it: 'Momento Angolare', ko: '각운동량',
      pt: 'Momento Angular', ru: 'Момент Импульса', zh: '角动量', ja: '角運動量'
    },
    'Thermal Conductivity': { 
      en: 'Thermal Conductivity', ar: 'التوصيل الحراري', de: 'Wärmeleitfähigkeit',
      es: 'Conductividad Térmica', fr: 'Conductivité Thermique', it: 'Conducibilità Termica', ko: '열전도율',
      pt: 'Condutividade Térmica', ru: 'Теплопроводность', zh: '热导率', ja: '熱伝導率'
    },
    'Specific Heat Capacity': { 
      en: 'Specific Heat Capacity', ar: 'السعة الحرارية النوعية', de: 'Spezifische Wärmekapazität',
      es: 'Capacidad Calorífica Específica', fr: 'Capacité Thermique Massique', it: 'Capacità Termica Specifica', ko: '비열',
      pt: 'Capacidade Térmica Específica', ru: 'Удельная Теплоёмкость', zh: '比热容', ja: '比熱容量'
    },
    'Entropy': { 
      en: 'Entropy', ar: 'الإنتروبيا', de: 'Entropie',
      es: 'Entropía', fr: 'Entropie', it: 'Entropia', ko: '엔트로피',
      pt: 'Entropia', ru: 'Энтропия', zh: '熵', ja: 'エントロピー'
    },
    'Electric Field Strength': { 
      en: 'Electric Field Strength', ar: 'شدة المجال الكهربائي', de: 'Elektrische Feldstärke',
      es: 'Intensidad de Campo Eléctrico', fr: 'Intensité de Champ Électrique', it: 'Intensità di Campo Elettrico', ko: '전기장 세기',
      pt: 'Intensidade de Campo Elétrico', ru: 'Напряжённость Электрического Поля', zh: '电场强度', ja: '電界強度'
    },
    'Magnetic Field Strength (H)': { 
      en: 'Magnetic Field Strength (H)', ar: 'شدة المجال المغناطيسي (H)', de: 'Magnetische Feldstärke (H)',
      es: 'Intensidad de Campo Magnético (H)', fr: 'Intensité de Champ Magnétique (H)', it: 'Intensità di Campo Magnetico (H)', ko: '자기장 세기 (H)',
      pt: 'Intensidade de Campo Magnético (H)', ru: 'Напряжённость Магнитного Поля (H)', zh: '磁场强度 (H)', ja: '磁界強度 (H)'
    },
    'Radioactive Decay': { 
      en: 'Radioactive Decay', ar: 'الاضمحلال الإشعاعي', de: 'Radioaktiver Zerfall',
      es: 'Decaimiento Radiactivo', fr: 'Désintégration Radioactive', it: 'Decadimento Radioattivo', ko: '방사성 붕괴',
      pt: 'Decaimento Radioativo', ru: 'Радиоактивный Распад', zh: '放射性衰变', ja: '放射性崩壊'
    },
    'Cross-Section': { 
      en: 'Cross-Section', ar: 'المقطع العرضي', de: 'Wirkungsquerschnitt',
      es: 'Sección Transversal', fr: 'Section Efficace', it: 'Sezione d\'Urto', ko: '단면적',
      pt: 'Seção de Choque', ru: 'Сечение', zh: '截面', ja: '断面積'
    },
    'Photon/Light': { 
      en: 'Photon/Light', ar: 'الفوتون/الضوء', de: 'Photon/Licht',
      es: 'Fotón/Luz', fr: 'Photon/Lumière', it: 'Fotone/Luce', ko: '광자/빛',
      pt: 'Fóton/Luz', ru: 'Фотон/Свет', zh: '光子/光', ja: '光子/光'
    },
    'Sound Intensity': { 
      en: 'Sound Intensity', ar: 'شدة الصوت', de: 'Schallintensität',
      es: 'Intensidad de Sonido', fr: 'Intensité Sonore', it: 'Intensità Sonora', ko: '음향 강도',
      pt: 'Intensidade Sonora', ru: 'Интенсивность Звука', zh: '声强', ja: '音響強度'
    },
    'Acoustic Impedance': { 
      en: 'Acoustic Impedance', ar: 'الممانعة الصوتية', de: 'Akustische Impedanz',
      es: 'Impedancia Acústica', fr: 'Impédance Acoustique', it: 'Impedenza Acustica', ko: '음향 임피던스',
      pt: 'Impedância Acústica', ru: 'Акустический Импеданс', zh: '声阻抗', ja: '音響インピーダンス'
    },
    'Concentration': { 
      en: 'Concentration', ar: 'التركيز', de: 'Konzentration',
      es: 'Concentración', fr: 'Concentration', it: 'Concentrazione', ko: '농도',
      pt: 'Concentração', ru: 'Концентрация', zh: '浓度', ja: '濃度'
    },
    'Fuel Economy': { 
      en: 'Fuel Economy', ar: 'كفاءة الوقود', de: 'Kraftstoffverbrauch',
      es: 'Economía de Combustible', fr: 'Économie de Carburant', it: 'Consumo Carburante', ko: '연비',
      pt: 'Economia de Combustível', ru: 'Экономия Топлива', zh: '燃油经济性', ja: '燃費'
    },
    'Fuel Energy': { 
      en: 'Fuel Energy', ar: 'طاقة الوقود', de: 'Brennstoffenergie',
      es: 'Energía de Combustible', fr: 'Énergie du Carburant', it: 'Energia del Carburante', ko: '연료 에너지',
      pt: 'Energia de Combustível', ru: 'Энергия Топлива', zh: '燃料能量', ja: '燃料エネルギー'
    },
    'Data/Information': { 
      en: 'Data/Information', ar: 'البيانات/المعلومات', de: 'Daten/Information',
      es: 'Datos/Información', fr: 'Données/Information', it: 'Dati/Informazioni', ko: '데이터/정보',
      pt: 'Dados/Informação', ru: 'Данные/Информация', zh: '数据/信息', ja: 'データ/情報'
    },
    'Rack Geometry': { 
      en: 'Rack Geometry', ar: 'هندسة الرفوف', de: 'Rack-Geometrie',
      es: 'Geometría de Rack', fr: 'Géométrie de Rack', it: 'Geometria del Rack', ko: '랙 구조',
      pt: 'Geometria de Rack', ru: 'Геометрия Стойки', zh: '机架几何', ja: 'ラック形状'
    },
    'Shipping Containers': { 
      en: 'Shipping Containers', ar: 'حاويات الشحن', de: 'Versandcontainer',
      es: 'Contenedores de Envío', fr: 'Conteneurs d\'Expédition', it: 'Container di Spedizione', ko: '선적 컨테이너',
      pt: 'Contêineres de Transporte', ru: 'Транспортные Контейнеры', zh: '集装箱', ja: '輸送コンテナ'
    },
    'Beer & Wine': { 
      en: 'Beer & Wine', ar: 'البيرة والنبيذ', de: 'Bier & Wein',
      es: 'Cerveza y Vino', fr: 'Bière et Vin', it: 'Birra e Vino', ko: '맥주 & 와인',
      pt: 'Cerveja e Vinho', ru: 'Пиво и Вино', zh: '啤酒与葡萄酒', ja: 'ビール＆ワイン'
    },
    'Math': { 
      en: 'Math', ar: 'الرياضيات', de: 'Mathematik',
      es: 'Matemáticas', fr: 'Mathématiques', it: 'Matematica', ko: '수학',
      pt: 'Matemática', ru: 'Математика', zh: '数学', ja: '数学'
    },
    'Typography': { 
      en: 'Typography', ar: 'الطباعة', de: 'Typografie',
      es: 'Tipografía', fr: 'Typographie', it: 'Tipografia', ko: '타이포그래피',
      pt: 'Tipografia', ru: 'Типографика', zh: '排版', ja: 'タイポグラフィ'
    },
    'Cooking Measures': { 
      en: 'Cooking Measures', ar: 'مقاييس الطبخ', de: 'Kochmaße',
      es: 'Medidas de Cocina', fr: 'Mesures de Cuisine', it: 'Misure da Cucina', ko: '요리 계량',
      pt: 'Medidas Culinárias', ru: 'Кулинарные Меры', zh: '烹饪用量', ja: '調理用計量'
    },
    'Archaic Length': { 
      en: 'Archaic Length', ar: 'الطول القديم', de: 'Historische Längenmaße',
      es: 'Longitud Arcaica', fr: 'Longueur Archaïque', it: 'Lunghezza Arcaica', ko: '고대 길이',
      pt: 'Comprimento Arcaico', ru: 'Архаичная Длина', zh: '古代长度', ja: '古代の長さ'
    },
    'Archaic Mass': { 
      en: 'Archaic Mass', ar: 'الكتلة القديمة', de: 'Historische Massenmaße',
      es: 'Masa Arcaica', fr: 'Masse Archaïque', it: 'Massa Arcaica', ko: '고대 질량',
      pt: 'Massa Arcaica', ru: 'Архаичная Масса', zh: '古代质量', ja: '古代の質量'
    },
    'Archaic Volume': { 
      en: 'Archaic Volume', ar: 'الحجم القديم', de: 'Historische Volumenmaße',
      es: 'Volumen Arcaico', fr: 'Volume Archaïque', it: 'Volume Arcaico', ko: '고대 부피',
      pt: 'Volume Arcaico', ru: 'Архаичный Объём', zh: '古代容积', ja: '古代の体積'
    },
    'Archaic Area': { 
      en: 'Archaic Area', ar: 'المساحة القديمة', de: 'Historische Flächenmaße',
      es: 'Área Arcaica', fr: 'Aire Archaïque', it: 'Area Arcaica', ko: '고대 면적',
      pt: 'Área Arcaica', ru: 'Архаичная Площадь', zh: '古代面积', ja: '古代の面積'
    },
    'Archaic Energy': { 
      en: 'Archaic Energy', ar: 'الطاقة القديمة', de: 'Historische Energieeinheiten',
      es: 'Energía Arcaica', fr: 'Énergie Archaïque', it: 'Energia Arcaica', ko: '고대 에너지',
      pt: 'Energia Arcaica', ru: 'Архаичная Энергия', zh: '古代能量', ja: '古代のエネルギー'
    },
    'Archaic Power': { 
      en: 'Archaic Power', ar: 'القدرة القديمة', de: 'Historische Leistungseinheiten',
      es: 'Potencia Arcaica', fr: 'Puissance Archaïque', it: 'Potenza Arcaica', ko: '고대 일률',
      pt: 'Potência Arcaica', ru: 'Архаичная Мощность', zh: '古代功率', ja: '古代の仕事率'
    },
    'Digital Storage': { 
      en: 'Digital Storage', ar: 'التخزين الرقمي', de: 'Digitaler Speicher',
      es: 'Almacenamiento Digital', fr: 'Stockage Numérique', it: 'Archiviazione Digitale', ko: '디지털 저장',
      pt: 'Armazenamento Digital', ru: 'Цифровое Хранилище', zh: '数字存储', ja: 'デジタルストレージ'
    },
    'Typographic Units': { 
      en: 'Typographic Units', ar: 'وحدات الطباعة', de: 'Typografische Einheiten',
      es: 'Unidades Tipográficas', fr: 'Unités Typographiques', it: 'Unità Tipografiche', ko: '타이포그래피 단위',
      pt: 'Unidades Tipográficas', ru: 'Типографские Единицы', zh: '排版单位', ja: 'タイポグラフィ単位'
    },
    // UI Labels
    'Base unit:': { 
      en: 'Base unit:', ar: ':الوحدة الأساسية', de: 'Basiseinheit:',
      es: 'Unidad base:', fr: 'Unité de base:', it: 'Unità di base:', ko: '기본 단위:',
      pt: 'Unidade base:', ru: 'Базовая единица:', zh: '基本单位：', ja: '基本単位：'
    },
    'Include Beer/Wine': { 
      en: 'Include Beer/Wine', ar: 'تضمين البيرة/النبيذ', de: 'Bier/Wein einschließen',
      es: 'Incluir Cerveza/Vino', fr: 'Inclure Bière/Vin', it: 'Includi Birra/Vino', ko: '맥주/와인 포함',
      pt: 'Incluir Cerveja/Vinho', ru: 'Включить Пиво/Вино', zh: '包括啤酒/葡萄酒', ja: 'ビール/ワインを含む'
    },
    'Base Factor': { 
      en: 'Base Factor', ar: 'العامل الأساسي', de: 'Basisfaktor',
      es: 'Factor Base', fr: 'Facteur de Base', it: 'Fattore di Base', ko: '기본 인수',
      pt: 'Fator Base', ru: 'Базовый Множитель', zh: '基础因子', ja: '基本係数'
    },
    'SI Base Units': { 
      en: 'SI Base Units', ar: 'وحدات SI الأساسية', de: 'SI-Basiseinheiten',
      es: 'Unidades Base SI', fr: 'Unités de Base SI', it: 'Unità di Base SI', ko: 'SI 기본 단위',
      pt: 'Unidades Base SI', ru: 'Базовые Единицы SI', zh: 'SI基本单位', ja: 'SI基本単位'
    },
    'Decimals': { 
      en: 'Decimals', ar: 'الكسور العشرية', de: 'Dezimalstellen',
      es: 'Decimales', fr: 'Décimales', it: 'Decimali', ko: '소수점',
      pt: 'Decimais', ru: 'Десятичные', zh: '小数', ja: '小数'
    },
    'Precision': { 
      en: 'Precision', ar: 'الدقة', de: 'Genauigkeit',
      es: 'Precisión', fr: 'Précision', it: 'Precisione', ko: '정밀도',
      pt: 'Precisão', ru: 'Точность', zh: '精度', ja: '精度'
    },
    'Copy': { 
      en: 'Copy', ar: 'نسخ', de: 'Kopieren',
      es: 'Copiar', fr: 'Copier', it: 'Copia', ko: '복사',
      pt: 'Copiar', ru: 'Копировать', zh: '复制', ja: 'コピー'
    },
    'Prefix': { 
      en: 'Prefix', ar: 'بادئة', de: 'Präfix',
      es: 'Prefijo', fr: 'Préfixe', it: 'Prefisso', ko: '접두사',
      pt: 'Prefixo', ru: 'Префикс', zh: '前缀', ja: '接頭辞'
    },
    'Unit': { 
      en: 'Unit', ar: 'وحدة', de: 'Einheit',
      es: 'Unidad', fr: 'Unité', it: 'Unità', ko: '단위',
      pt: 'Unidade', ru: 'Единица', zh: '单位', ja: '単位'
    },
    'Result': { 
      en: 'Result', ar: 'النتيجة', de: 'Ergebnis',
      es: 'Resultado', fr: 'Résultat', it: 'Risultato', ko: '결과',
      pt: 'Resultado', ru: 'Результат', zh: '结果', ja: '結果'
    },
    'Calculator': { 
      en: 'Calculator', ar: 'الآلة الحاسبة', de: 'Rechner',
      es: 'Calculadora', fr: 'Calculatrice', it: 'Calcolatrice', ko: '계산기',
      pt: 'Calculadora', ru: 'Калькулятор', zh: '计算器', ja: '計算機'
    },
    'CALCULATOR - RPN': { 
      en: 'CALCULATOR - RPN', ar: 'الآلة الحاسبة - RPN', de: 'RECHNER - RPN',
      es: 'CALCULADORA - RPN', fr: 'CALCULATRICE - RPN', it: 'CALCOLATRICE - RPN', ko: '계산기 - RPN',
      pt: 'CALCULADORA - RPN', ru: 'КАЛЬКУЛЯТОР - RPN', zh: '计算器 - RPN', ja: '計算機 - RPN'
    },
    'CALCULATOR': { 
      en: 'CALCULATOR', ar: 'الآلة الحاسبة', de: 'RECHNER',
      es: 'CALCULADORA', fr: 'CALCULATRICE', it: 'CALCOLATRICE', ko: '계산기',
      pt: 'CALCULADORA', ru: 'КАЛЬКУЛЯТОР', zh: '计算器', ja: '計算機'
    },
    'Clear': { 
      en: 'Clear', ar: 'مسح', de: 'Löschen',
      es: 'Limpiar', fr: 'Effacer', it: 'Cancella', ko: '지우기',
      pt: 'Limpar', ru: 'Очистить', zh: '清除', ja: 'クリア'
    },
    'Clear calculator': { 
      en: 'Clear calculator', ar: 'مسح الآلة الحاسبة', de: 'Rechner löschen',
      es: 'Limpiar calculadora', fr: 'Effacer calculatrice', it: 'Cancella calcolatrice', ko: '계산기 지우기',
      pt: 'Limpar calculadora', ru: 'Очистить калькулятор', zh: '清除计算器', ja: '計算機クリア'
    },
    'Dimensional Analysis': { 
      en: 'Dimensional Analysis', ar: 'التحليل البعدي', de: 'Dimensionsanalyse',
      es: 'Análisis Dimensional', fr: 'Analyse Dimensionnelle', it: 'Analisi Dimensionale', ko: '차원 분석',
      pt: 'Análise Dimensional', ru: 'Размерный Анализ', zh: '量纲分析', ja: '次元解析'
    },
    'From': { 
      en: 'From', ar: 'من', de: 'Von',
      es: 'De', fr: 'De', it: 'Da', ko: '에서',
      pt: 'De', ru: 'Из', zh: '从', ja: 'から'
    },
    'To': { 
      en: 'To', ar: 'إلى', de: 'Zu',
      es: 'A', fr: 'À', it: 'A', ko: '로',
      pt: 'Para', ru: 'В', zh: '到', ja: 'へ'
    },
    'Compare All': {
      en: 'Compare All', ar: 'مقارنة الكل', de: 'Alle vergleichen',
      es: 'Comparar Todo', fr: 'Comparer Tout', it: 'Confronta Tutto', ko: '모두 비교',
      pt: 'Comparar Tudo', ru: 'Сравнить Все', zh: '比较全部', ja: 'すべて比較'
    },
    'Compare': { 
      en: 'Compare', ar: 'قارن', de: 'Vergleichen',
      es: 'Comparar', fr: 'Comparer', it: 'Confronta', ko: '비교',
      pt: 'Comparar', ru: 'Сравнить', zh: '比较', ja: '比較'
    },
    'Swap': { 
      en: 'Swap', ar: 'تبديل', de: 'Tauschen',
      es: 'Intercambiar', fr: 'Échanger', it: 'Scambia', ko: '교환',
      pt: 'Trocar', ru: 'Поменять', zh: '交换', ja: '入れ替え'
    },
    'Input': { 
      en: 'Input', ar: 'إدخال', de: 'Eingabe',
      es: 'Entrada', fr: 'Entrée', it: 'Input', ko: '입력',
      pt: 'Entrada', ru: 'Ввод', zh: '输入', ja: '入力'
    },
    'Select category': { 
      en: 'Select category', ar: 'اختر الفئة', de: 'Kategorie auswählen',
      es: 'Seleccionar categoría', fr: 'Sélectionner une catégorie', it: 'Seleziona categoria', ko: '카테고리 선택',
      pt: 'Selecionar categoria', ru: 'Выбрать категорию', zh: '选择类别', ja: 'カテゴリーを選択'
    },
    'Select unit': { 
      en: 'Select unit', ar: 'اختر الوحدة', de: 'Einheit auswählen',
      es: 'Seleccionar unidad', fr: 'Sélectionner une unité', it: 'Seleziona unità', ko: '단위 선택',
      pt: 'Selecionar unidade', ru: 'Выбрать единицу', zh: '选择单位', ja: '単位を選択'
    },
    'Select prefix': { 
      en: 'Select prefix', ar: 'اختر البادئة', de: 'Präfix auswählen',
      es: 'Seleccionar prefijo', fr: 'Sélectionner un préfixe', it: 'Seleziona prefisso', ko: '접두사 선택',
      pt: 'Selecionar prefixo', ru: 'Выбрать префикс', zh: '选择前缀', ja: '接頭辞を選択'
    },
    // Common unit base names (lowercase for SI base unit display)
    'meter': { en: 'meter', ar: 'متر', de: 'Meter', es: 'metro', fr: 'mètre', it: 'metro', ko: '미터', pt: 'metro', ru: 'метр', zh: '米', ja: 'メートル' },
    'metre': { en: 'metre', ar: 'متر', de: 'Meter', es: 'metro', fr: 'mètre', it: 'metro', ko: '미터', pt: 'metro', ru: 'метр', zh: '米', ja: 'メートル' },
    'kilogram': { en: 'kilogram', ar: 'كيلوغرام', de: 'Kilogramm', es: 'kilogramo', fr: 'kilogramme', it: 'chilogrammo', ko: '킬로그램', pt: 'quilograma', ru: 'килограмм', zh: '千克', ja: 'キログラム' },
    'second': { en: 'second', ar: 'ثانية', de: 'Sekunde', es: 'segundo', fr: 'seconde', it: 'secondo', ko: '초', pt: 'segundo', ru: 'секунда', zh: '秒', ja: '秒' },
    'ampere': { en: 'ampere', ar: 'أمبير', de: 'Ampere', es: 'amperio', fr: 'ampère', it: 'ampere', ko: '암페어', pt: 'ampere', ru: 'ампер', zh: '安培', ja: 'アンペア' },
    'kelvin': { en: 'kelvin', ar: 'كلفن', de: 'Kelvin', es: 'kelvin', fr: 'kelvin', it: 'kelvin', ko: '켈빈', pt: 'kelvin', ru: 'кельвин', zh: '开尔文', ja: 'ケルビン' },
    'celsius': { en: 'celsius', ar: 'سلزيوس', de: 'Celsius', es: 'celsius', fr: 'celsius', it: 'celsius', ko: '섭씨', pt: 'celsius', ru: 'цельсий', zh: '摄氏度', ja: '摂氏' },
    'mole': { en: 'mole', ar: 'مول', de: 'Mol', es: 'mol', fr: 'mole', it: 'mole', ko: '몰', pt: 'mol', ru: 'моль', zh: '摩尔', ja: 'モル' },
    'candela': { en: 'candela', ar: 'شمعة', de: 'Candela', es: 'candela', fr: 'candela', it: 'candela', ko: '칸델라', pt: 'candela', ru: 'кандела', zh: '坎德拉', ja: 'カンデラ' },
    'liter': { en: 'liter', ar: 'لتر', de: 'Liter', es: 'litro', fr: 'litre', it: 'litro', ko: '리터', pt: 'litro', ru: 'литр', zh: '升', ja: 'リットル' },
    'litre': { en: 'litre', ar: 'لتر', de: 'Liter', es: 'litro', fr: 'litre', it: 'litro', ko: '리터', pt: 'litro', ru: 'литр', zh: '升', ja: 'リットル' },
    'square meter': { en: 'square meter', ar: 'متر مربع', de: 'Quadratmeter', es: 'metro cuadrado', fr: 'mètre carré', it: 'metro quadrato', ko: '제곱미터', pt: 'metro quadrado', ru: 'квадратный метр', zh: '平方米', ja: '平方メートル' },
    'square metre': { en: 'square metre', ar: 'متر مربع', de: 'Quadratmeter', es: 'metro cuadrado', fr: 'mètre carré', it: 'metro quadrato', ko: '제곱미터', pt: 'metro quadrado', ru: 'квадратный метр', zh: '平方米', ja: '平方メートル' },
    'cubic meter': { en: 'cubic meter', ar: 'متر مكعب', de: 'Kubikmeter', es: 'metro cúbico', fr: 'mètre cube', it: 'metro cubo', ko: '세제곱미터', pt: 'metro cúbico', ru: 'кубический метр', zh: '立方米', ja: '立方メートル' },
    'cubic metre': { en: 'cubic metre', ar: 'متر مكعب', de: 'Kubikmeter', es: 'metro cúbico', fr: 'mètre cube', it: 'metro cubo', ko: '세제곱미터', pt: 'metro cúbico', ru: 'кубический метр', zh: '立方米', ja: '立方メートル' },
    'meter/second': { en: 'meter/second', ar: 'متر/ثانية', de: 'Meter/Sekunde', es: 'metro/segundo', fr: 'mètre/seconde', it: 'metro/secondo', ko: '미터/초', pt: 'metro/segundo', ru: 'метр/секунда', zh: '米/秒', ja: 'メートル/秒' },
    'metre/second': { en: 'metre/second', ar: 'متر/ثانية', de: 'Meter/Sekunde', es: 'metro/segundo', fr: 'mètre/seconde', it: 'metro/secondo', ko: '미터/초', pt: 'metro/segundo', ru: 'метр/секунда', zh: '米/秒', ja: 'メートル/秒' },
    'meter/sq second': { en: 'meter/sq second', ar: 'متر/ثانية²', de: 'Meter/Sek²', es: 'metro/seg²', fr: 'mètre/sec²', it: 'metro/sec²', ko: '미터/초²', pt: 'metro/seg²', ru: 'метр/сек²', zh: '米/秒²', ja: 'メートル/秒²' },
    'metre/sq second': { en: 'metre/sq second', ar: 'متر/ثانية²', de: 'Meter/Sek²', es: 'metro/seg²', fr: 'mètre/sec²', it: 'metro/sec²', ko: '미터/초²', pt: 'metro/seg²', ru: 'метр/сек²', zh: '米/秒²', ja: 'メートル/秒²' },
    'newton': { en: 'newton', ar: 'نيوتن', de: 'Newton', es: 'newton', fr: 'newton', it: 'newton', ko: '뉴턴', pt: 'newton', ru: 'ньютон', zh: '牛顿', ja: 'ニュートン' },
    'pascal': { en: 'pascal', ar: 'باسكال', de: 'Pascal', es: 'pascal', fr: 'pascal', it: 'pascal', ko: '파스칼', pt: 'pascal', ru: 'паскаль', zh: '帕斯卡', ja: 'パスカル' },
    'joule': { en: 'joule', ar: 'جول', de: 'Joule', es: 'julio', fr: 'joule', it: 'joule', ko: '줄', pt: 'joule', ru: 'джоуль', zh: '焦耳', ja: 'ジュール' },
    'watt': { en: 'watt', ar: 'واط', de: 'Watt', es: 'vatio', fr: 'watt', it: 'watt', ko: '와트', pt: 'watt', ru: 'ватт', zh: '瓦特', ja: 'ワット' },
    'newton meter': { en: 'newton meter', ar: 'نيوتن متر', de: 'Newtonmeter', es: 'newton metro', fr: 'newton mètre', it: 'newton metro', ko: '뉴턴 미터', pt: 'newton metro', ru: 'ньютон-метр', zh: '牛顿米', ja: 'ニュートンメートル' },
    'newton metre': { en: 'newton metre', ar: 'نيوتن متر', de: 'Newtonmeter', es: 'newton metro', fr: 'newton mètre', it: 'newton metro', ko: '뉴턴 미터', pt: 'newton metro', ru: 'ньютон-метр', zh: '牛顿米', ja: 'ニュートンメートル' },
    'liter/second': { en: 'liter/second', ar: 'لتر/ثانية', de: 'Liter/Sekunde', es: 'litro/segundo', fr: 'litre/seconde', it: 'litro/secondo', ko: '리터/초', pt: 'litro/segundo', ru: 'литр/секунда', zh: '升/秒', ja: 'リットル/秒' },
    'litre/second': { en: 'litre/second', ar: 'لتر/ثانية', de: 'Liter/Sekunde', es: 'litro/segundo', fr: 'litre/seconde', it: 'litro/secondo', ko: '리터/초', pt: 'litro/segundo', ru: 'литр/секунда', zh: '升/秒', ja: 'リットル/秒' },
    'coulomb': { en: 'coulomb', ar: 'كولوم', de: 'Coulomb', es: 'culombio', fr: 'coulomb', it: 'coulomb', ko: '쿨롱', pt: 'coulomb', ru: 'кулон', zh: '库仑', ja: 'クーロン' },
    'volt': { en: 'volt', ar: 'فولت', de: 'Volt', es: 'voltio', fr: 'volt', it: 'volt', ko: '볼트', pt: 'volt', ru: 'вольт', zh: '伏特', ja: 'ボルト' },
    'farad': { en: 'farad', ar: 'فاراد', de: 'Farad', es: 'faradio', fr: 'farad', it: 'farad', ko: '패럿', pt: 'farad', ru: 'фарад', zh: '法拉', ja: 'ファラド' },
    'ohm': { en: 'ohm', ar: 'أوم', de: 'Ohm', es: 'ohmio', fr: 'ohm', it: 'ohm', ko: '옴', pt: 'ohm', ru: 'ом', zh: '欧姆', ja: 'オーム' },
    'siemens': { en: 'siemens', ar: 'سيمنز', de: 'Siemens', es: 'siemens', fr: 'siemens', it: 'siemens', ko: '지멘스', pt: 'siemens', ru: 'сименс', zh: '西门子', ja: 'ジーメンス' },
    'henry': { en: 'henry', ar: 'هنري', de: 'Henry', es: 'henrio', fr: 'henry', it: 'henry', ko: '헨리', pt: 'henry', ru: 'генри', zh: '亨利', ja: 'ヘンリー' },
    'weber': { en: 'weber', ar: 'ويبر', de: 'Weber', es: 'weber', fr: 'weber', it: 'weber', ko: '웨버', pt: 'weber', ru: 'вебер', zh: '韦伯', ja: 'ウェーバー' },
    'tesla': { en: 'tesla', ar: 'تسلا', de: 'Tesla', es: 'tesla', fr: 'tesla', it: 'tesla', ko: '테슬라', pt: 'tesla', ru: 'тесла', zh: '特斯拉', ja: 'テスラ' },
    'becquerel': { en: 'becquerel', ar: 'بكريل', de: 'Becquerel', es: 'becquerel', fr: 'becquerel', it: 'becquerel', ko: '베크렐', pt: 'becquerel', ru: 'беккерель', zh: '贝克勒尔', ja: 'ベクレル' },
    'gray': { en: 'gray', ar: 'غراي', de: 'Gray', es: 'gray', fr: 'gray', it: 'gray', ko: '그레이', pt: 'gray', ru: 'грей', zh: '戈瑞', ja: 'グレイ' },
    'sievert': { en: 'sievert', ar: 'سيفرت', de: 'Sievert', es: 'sievert', fr: 'sievert', it: 'sievert', ko: '시버트', pt: 'sievert', ru: 'зиверт', zh: '希沃特', ja: 'シーベルト' },
    'katal': { en: 'katal', ar: 'كاتال', de: 'Katal', es: 'katal', fr: 'katal', it: 'katal', ko: '카탈', pt: 'katal', ru: 'катал', zh: '开特', ja: 'カタール' },
    'radian': { en: 'radian', ar: 'راديان', de: 'Radiant', es: 'radián', fr: 'radian', it: 'radiante', ko: '라디안', pt: 'radiano', ru: 'радиан', zh: '弧度', ja: 'ラジアン' },
    'degree': { en: 'degree', ar: 'درجة', de: 'Grad', es: 'grado', fr: 'degré', it: 'grado', ko: '도', pt: 'grau', ru: 'градус', zh: '度', ja: '度' },
    'steradian': { en: 'steradian', ar: 'ستراديان', de: 'Steradiant', es: 'estereorradián', fr: 'stéradian', it: 'steradiante', ko: '스테라디안', pt: 'esterradiano', ru: 'стерадиан', zh: '球面度', ja: 'ステラジアン' },
    'hertz': { en: 'hertz', ar: 'هرتز', de: 'Hertz', es: 'hercio', fr: 'hertz', it: 'hertz', ko: '헤르츠', pt: 'hertz', ru: 'герц', zh: '赫兹', ja: 'ヘルツ' },
    'decibel': { en: 'decibel', ar: 'ديسيبل', de: 'Dezibel', es: 'decibelio', fr: 'décibel', it: 'decibel', ko: '데시벨', pt: 'decibel', ru: 'децибел', zh: '分贝', ja: 'デシベル' },
    'lumen': { en: 'lumen', ar: 'لومن', de: 'Lumen', es: 'lumen', fr: 'lumen', it: 'lumen', ko: '루멘', pt: 'lúmen', ru: 'люмен', zh: '流明', ja: 'ルーメン' },
    'lux': { en: 'lux', ar: 'لوكس', de: 'Lux', es: 'lux', fr: 'lux', it: 'lux', ko: '럭스', pt: 'lux', ru: 'люкс', zh: '勒克斯', ja: 'ルクス' },
    'lumen/square-meter': { en: 'lumen/square-meter', ar: 'لومن/متر²', de: 'Lumen/m²', es: 'lumen/m²', fr: 'lumen/m²', it: 'lumen/m²', ko: '루멘/m²', pt: 'lúmen/m²', ru: 'люмен/м²', zh: '流明/平方米', ja: 'ルーメン/m²' },
    'lumen/square-metre': { en: 'lumen/square-metre', ar: 'لومن/متر²', de: 'Lumen/m²', es: 'lumen/m²', fr: 'lumen/m²', it: 'lumen/m²', ko: '루멘/m²', pt: 'lúmen/m²', ru: 'люмен/м²', zh: '流明/平方米', ja: 'ルーメン/m²' },
    'candela/square-meter': { en: 'candela/square-meter', ar: 'شمعة/متر²', de: 'Candela/m²', es: 'candela/m²', fr: 'candela/m²', it: 'candela/m²', ko: '칸델라/m²', pt: 'candela/m²', ru: 'кандела/м²', zh: '坎德拉/平方米', ja: 'カンデラ/m²' },
    'candela/square-metre': { en: 'candela/square-metre', ar: 'شمعة/متر²', de: 'Candela/m²', es: 'candela/m²', fr: 'candela/m²', it: 'candela/m²', ko: '칸델라/m²', pt: 'candela/m²', ru: 'кандела/м²', zh: '坎德拉/平方米', ja: 'カンデラ/m²' },
    'reciprocal-meter': { en: 'reciprocal-meter', ar: 'متر⁻¹', de: 'Reziprok-Meter', es: 'metro recíproco', fr: 'mètre réciproque', it: 'metro reciproco', ko: '역미터', pt: 'metro recíproco', ru: 'обратный метр', zh: '米⁻¹', ja: '逆メートル' },
    'reciprocal-metre': { en: 'reciprocal-metre', ar: 'متر⁻¹', de: 'Reziprok-Meter', es: 'metro recíproco', fr: 'mètre réciproque', it: 'metro reciproco', ko: '역미터', pt: 'metro recíproco', ru: 'обратный метр', zh: '米⁻¹', ja: '逆メートル' },
    'byte': { en: 'byte', ar: 'بايت', de: 'Byte', es: 'byte', fr: 'octet', it: 'byte', ko: '바이트', pt: 'byte', ru: 'байт', zh: '字节', ja: 'バイト' },
    'point': { en: 'point', ar: 'نقطة', de: 'Punkt', es: 'punto', fr: 'point', it: 'punto', ko: '포인트', pt: 'ponto', ru: 'пункт', zh: '点', ja: 'ポイント' },
    'newton/meter': { en: 'newton/meter', ar: 'نيوتن/متر', de: 'Newton/Meter', es: 'newton/metro', fr: 'newton/mètre', it: 'newton/metro', ko: '뉴턴/미터', pt: 'newton/metro', ru: 'ньютон/метр', zh: '牛顿/米', ja: 'ニュートン/メートル' },
    'newton/metre': { en: 'newton/metre', ar: 'نيوتن/متر', de: 'Newton/Meter', es: 'newton/metro', fr: 'newton/mètre', it: 'newton/metro', ko: '뉴턴/미터', pt: 'newton/metro', ru: 'ньютон/метр', zh: '牛顿/米', ja: 'ニュートン/メートル' },
    'pascal-second': { en: 'pascal-second', ar: 'باسكال ثانية', de: 'Pascal-Sekunde', es: 'pascal-segundo', fr: 'pascal-seconde', it: 'pascal-secondo', ko: '파스칼초', pt: 'pascal-segundo', ru: 'паскаль-секунда', zh: '帕斯卡秒', ja: 'パスカル秒' },
    // Unit names (all capitalized forms from conversion-data.ts)
    'Meter': { 
      en: 'Meter', ar: 'متر', de: 'Meter',
      es: 'Metro', fr: 'Mètre', it: 'Metro', ko: '미터',
      pt: 'Metro', ru: 'Метр', zh: '米', ja: 'メートル'
    },
    'Metre': { 
      en: 'Metre', ar: 'متر', de: 'Meter',
      es: 'Metro', fr: 'Mètre', it: 'Metro', ko: '미터',
      pt: 'Metro', ru: 'Метр', zh: '米', ja: 'メートル'
    },
    'Millimeter': { 
      en: 'Millimeter', ar: 'مليمتر', de: 'Millimeter',
      es: 'Milímetro', fr: 'Millimètre', it: 'Millimetro', ko: '밀리미터',
      pt: 'Milímetro', ru: 'Миллиметр', zh: '毫米', ja: 'ミリメートル'
    },
    'Inch': { 
      en: 'Inch', ar: 'بوصة', de: 'Zoll',
      es: 'Pulgada', fr: 'Pouce', it: 'Pollice', ko: '인치',
      pt: 'Polegada', ru: 'Дюйм', zh: '英寸', ja: 'インチ'
    },
    'Foot': { 
      en: 'Foot', ar: 'قدم', de: 'Fuß',
      es: 'Pie', fr: 'Pied', it: 'Piede', ko: '피트',
      pt: 'Pé', ru: 'Фут', zh: '英尺', ja: 'フィート'
    },
    'Foot:Inch': { 
      en: 'Foot:Inch', ar: 'قدم:بوصة', de: 'Fuß:Zoll',
      es: 'Pie:Pulgada', fr: 'Pied:Pouce', it: 'Piede:Pollice', ko: '피트:인치',
      pt: 'Pé:Polegada', ru: 'Фут:Дюйм', zh: '英尺:英寸', ja: 'フィート:インチ'
    },
    'Yard': { 
      en: 'Yard', ar: 'ياردة', de: 'Yard',
      es: 'Yarda', fr: 'Yard', it: 'Iarda', ko: '야드',
      pt: 'Jarda', ru: 'Ярд', zh: '码', ja: 'ヤード'
    },
    'Mile': { 
      en: 'Mile', ar: 'ميل', de: 'Meile',
      es: 'Milla', fr: 'Mille', it: 'Miglio', ko: '마일',
      pt: 'Milha', ru: 'Миля', zh: '英里', ja: 'マイル'
    },
    'Nautical Mile': { 
      en: 'Nautical Mile', ar: 'ميل بحري', de: 'Seemeile',
      es: 'Milla Náutica', fr: 'Mille Marin', it: 'Miglio Nautico', ko: '해리',
      pt: 'Milha Náutica', ru: 'Морская Миля', zh: '海里', ja: '海里'
    },
    'Link (Gunter)': { en: 'Link (Gunter)', ar: 'وصلة (غونتر)', de: 'Link (Gunter)', es: 'Eslabón (Gunter)', fr: 'Chaînon (Gunter)', it: 'Link (Gunter)', ko: '링크 (건터)', pt: 'Elo (Gunter)', ru: 'Линк (Гюнтера)', zh: '链节', ja: 'リンク' },
    'Rod': { en: 'Rod', ar: 'قضيب', de: 'Rute', es: 'Vara', fr: 'Perche', it: 'Pertica', ko: '로드', pt: 'Vara', ru: 'Род', zh: '杆', ja: 'ロッド' },
    'Chain': { en: 'Chain', ar: 'سلسلة', de: 'Kette', es: 'Cadena', fr: 'Chaîne', it: 'Catena', ko: '체인', pt: 'Corrente', ru: 'Чейн', zh: '链', ja: 'チェーン' },
    'Furlong': { en: 'Furlong', ar: 'فرلنغ', de: 'Furlong', es: 'Furlong', fr: 'Furlong', it: 'Furlong', ko: '펄롱', pt: 'Furlong', ru: 'Фарлонг', zh: '弗隆', ja: 'ハロン' },
    'Fathom': { en: 'Fathom', ar: 'قامة', de: 'Faden', es: 'Braza', fr: 'Brasse', it: 'Braccio', ko: '패덤', pt: 'Braça', ru: 'Фатом', zh: '英寻', ja: 'ファゾム' },
    'Parsec': { en: 'Parsec', ar: 'فرسخ فلكي', de: 'Parsec', es: 'Pársec', fr: 'Parsec', it: 'Parsec', ko: '파섹', pt: 'Parsec', ru: 'Парсек', zh: '秒差距', ja: 'パーセク' },
    'Astronomical Unit': { en: 'Astronomical Unit', ar: 'وحدة فلكية', de: 'Astronomische Einheit', es: 'Unidad Astronómica', fr: 'Unité Astronomique', it: 'Unità Astronomica', ko: '천문단위', pt: 'Unidade Astronômica', ru: 'Астрономическая Единица', zh: '天文单位', ja: '天文単位' },
    'Light Year': { en: 'Light Year', ar: 'سنة ضوئية', de: 'Lichtjahr', es: 'Año Luz', fr: 'Année-Lumière', it: 'Anno Luce', ko: '광년', pt: 'Ano-Luz', ru: 'Световой Год', zh: '光年', ja: '光年' },
    'Angstrom': { en: 'Angstrom', ar: 'أنجستروم', de: 'Ångström', es: 'Ángstrom', fr: 'Ångström', it: 'Ångström', ko: '옹스트롬', pt: 'Ångström', ru: 'Ангстрем', zh: '埃', ja: 'オングストローム' },
    'Kilogram': { 
      en: 'Kilogram', ar: 'كيلوغرام', de: 'Kilogramm',
      es: 'Kilogramo', fr: 'Kilogramme', it: 'Chilogrammo', ko: '킬로그램',
      pt: 'Quilograma', ru: 'Килограмм', zh: '千克', ja: 'キログラム'
    },
    'Gram': { 
      en: 'Gram', ar: 'غرام', de: 'Gramm',
      es: 'Gramo', fr: 'Gramme', it: 'Grammo', ko: '그램',
      pt: 'Grama', ru: 'Грамм', zh: '克', ja: 'グラム'
    },
    'Tonne': { 
      en: 'Tonne', ar: 'طن متري', de: 'Tonne',
      es: 'Tonelada', fr: 'Tonne', it: 'Tonnellata', ko: '톤',
      pt: 'Tonelada', ru: 'Тонна', zh: '吨', ja: 'トン'
    },
    'Ounce': { 
      en: 'Ounce', ar: 'أونصة', de: 'Unze',
      es: 'Onza', fr: 'Once', it: 'Oncia', ko: '온스',
      pt: 'Onça', ru: 'Унция', zh: '盎司', ja: 'オンス'
    },
    'Pound': { 
      en: 'Pound', ar: 'باوند', de: 'Pfund',
      es: 'Libra', fr: 'Livre', it: 'Libbra', ko: '파운드',
      pt: 'Libra', ru: 'Фунт', zh: '磅', ja: 'ポンド'
    },
    'Stone': { 
      en: 'Stone', ar: 'ستون', de: 'Stone',
      es: 'Stone', fr: 'Stone', it: 'Stone', ko: '스톤',
      pt: 'Stone', ru: 'Стоун', zh: '英石', ja: 'ストーン'
    },
    'Short Ton (US)': { 
      en: 'Short Ton (US)', ar: 'طن قصير (أمريكي)', de: 'Short Ton (US)',
      es: 'Tonelada Corta (EE.UU.)', fr: 'Tonne Courte (US)', it: 'Tonnellata Corta (US)', ko: '숏톤 (미국)',
      pt: 'Tonelada Curta (EUA)', ru: 'Короткая Тонна (США)', zh: '短吨（美国）', ja: 'ショートトン（米国）'
    },
    'Long Ton (UK)': { 
      en: 'Long Ton (UK)', ar: 'طن طويل (بريطاني)', de: 'Long Ton (UK)',
      es: 'Tonelada Larga (UK)', fr: 'Tonne Longue (UK)', it: 'Tonnellata Lunga (UK)', ko: '롱톤 (영국)',
      pt: 'Tonelada Longa (Reino Unido)', ru: 'Длинная Тонна (Великобритания)', zh: '长吨（英国）', ja: 'ロングトン（英国）'
    },
    'Grain': { en: 'Grain', ar: 'حبة', de: 'Gran', es: 'Grano', fr: 'Grain', it: 'Grano', ko: '그레인', pt: 'Grão', ru: 'Гран', zh: '格令', ja: 'グレーン' },
    'Pennyweight': { en: 'Pennyweight', ar: 'بيني وايت', de: 'Pennyweight', es: 'Peso de Penique', fr: 'Pennyweight', it: 'Pennyweight', ko: '페니웨이트', pt: 'Pennyweight', ru: 'Пеннивейт', zh: '本尼威特', ja: 'ペニーウェイト' },
    'Troy Ounce': { en: 'Troy Ounce', ar: 'أونصة ترويا', de: 'Feinunze', es: 'Onza Troy', fr: 'Once Troy', it: 'Oncia Troy', ko: '트로이온스', pt: 'Onça Troy', ru: 'Тройская Унция', zh: '金衡盎司', ja: 'トロイオンス' },
    'Carat': { en: 'Carat', ar: 'قيراط', de: 'Karat', es: 'Quilate', fr: 'Carat', it: 'Carato', ko: '캐럿', pt: 'Quilate', ru: 'Карат', zh: '克拉', ja: 'カラット' },
    'Slug': { en: 'Slug', ar: 'سلَغ', de: 'Slug', es: 'Slug', fr: 'Slug', it: 'Slug', ko: '슬러그', pt: 'Slug', ru: 'Слаг', zh: '斯勒格', ja: 'スラグ' },
    'Second': { 
      en: 'Second', ar: 'ثانية', de: 'Sekunde',
      es: 'Segundo', fr: 'Seconde', it: 'Secondo', ko: '초',
      pt: 'Segundo', ru: 'Секунда', zh: '秒', ja: '秒'
    },
    'Minute': { 
      en: 'Minute', ar: 'دقيقة', de: 'Minute',
      es: 'Minuto', fr: 'Minute', it: 'Minuto', ko: '분',
      pt: 'Minuto', ru: 'Минута', zh: '分钟', ja: '分'
    },
    'Hour': { 
      en: 'Hour', ar: 'ساعة', de: 'Stunde',
      es: 'Hora', fr: 'Heure', it: 'Ora', ko: '시간',
      pt: 'Hora', ru: 'Час', zh: '小时', ja: '時間'
    },
    'Day': { 
      en: 'Day', ar: 'يوم', de: 'Tag',
      es: 'Día', fr: 'Jour', it: 'Giorno', ko: '일',
      pt: 'Dia', ru: 'День', zh: '天', ja: '日'
    },
    'Week': { 
      en: 'Week', ar: 'أسبوع', de: 'Woche',
      es: 'Semana', fr: 'Semaine', it: 'Settimana', ko: '주',
      pt: 'Semana', ru: 'Неделя', zh: '周', ja: '週'
    },
    'Month (Avg)': { 
      en: 'Month (Avg)', ar: 'شهر (متوسط)', de: 'Monat (Durchschn.)',
      es: 'Mes (Promedio)', fr: 'Mois (Moy.)', it: 'Mese (Media)', ko: '월 (평균)',
      pt: 'Mês (Média)', ru: 'Месяц (Средн.)', zh: '月（平均）', ja: '月（平均）'
    },
    'Year': { 
      en: 'Year', ar: 'سنة', de: 'Jahr',
      es: 'Año', fr: 'Année', it: 'Anno', ko: '년',
      pt: 'Ano', ru: 'Год', zh: '年', ja: '年'
    },
    'Shake': { en: 'Shake', ar: 'شيك', de: 'Shake', es: 'Shake', fr: 'Shake', it: 'Shake', ko: '셰이크', pt: 'Shake', ru: 'Шейк', zh: '摇动', ja: 'シェイク' },
    'Sidereal Day': { en: 'Sidereal Day', ar: 'يوم نجمي', de: 'Siderischer Tag', es: 'Día Sideral', fr: 'Jour Sidéral', it: 'Giorno Siderale', ko: '항성일', pt: 'Dia Sideral', ru: 'Звёздные Сутки', zh: '恒星日', ja: '恒星日' },
    'Ampere': { en: 'Ampere', ar: 'أمبير', de: 'Ampere', es: 'Amperio', fr: 'Ampère', it: 'Ampere', ko: '암페어', pt: 'Ampere', ru: 'Ампер', zh: '安培', ja: 'アンペア' },
    'Biot (abampere)': { en: 'Biot (abampere)', ar: 'بيوت (أمبير مطلق)', de: 'Biot (Abampere)', es: 'Biot (abamperio)', fr: 'Biot (abampère)', it: 'Biot (abampere)', ko: '비오', pt: 'Biot (abampere)', ru: 'Био (абампер)', zh: '毕奥', ja: 'ビオ' },
    'Statampere': { en: 'Statampere', ar: 'ستات أمبير', de: 'Statampere', es: 'Estatamperio', fr: 'Statampère', it: 'Statampere', ko: '스탯암페어', pt: 'Statampere', ru: 'Статампер', zh: '静安培', ja: 'スタットアンペア' },
    'Celsius': { 
      en: 'Celsius', ar: 'سلزيوس', de: 'Celsius',
      es: 'Celsius', fr: 'Celsius', it: 'Celsius', ko: '섭씨',
      pt: 'Celsius', ru: 'Цельсий', zh: '摄氏度', ja: '摂氏'
    },
    'Fahrenheit': { 
      en: 'Fahrenheit', ar: 'فهرنهايت', de: 'Fahrenheit',
      es: 'Fahrenheit', fr: 'Fahrenheit', it: 'Fahrenheit', ko: '화씨',
      pt: 'Fahrenheit', ru: 'Фаренгейт', zh: '华氏度', ja: '華氏'
    },
    'Kelvin': { 
      en: 'Kelvin', ar: 'كلفن', de: 'Kelvin',
      es: 'Kelvin', fr: 'Kelvin', it: 'Kelvin', ko: '켈빈',
      pt: 'Kelvin', ru: 'Кельвин', zh: '开尔文', ja: 'ケルビン'
    },
    'Rankine': { 
      en: 'Rankine', ar: 'رانكين', de: 'Rankine',
      es: 'Rankine', fr: 'Rankine', it: 'Rankine', ko: '랭킨',
      pt: 'Rankine', ru: 'Ранкин', zh: '兰氏度', ja: 'ランキン'
    },
    'Mole': { en: 'Mole', ar: 'مول', de: 'Mol', es: 'Mol', fr: 'Mole', it: 'Mole', ko: '몰', pt: 'Mol', ru: 'Моль', zh: '摩尔', ja: 'モル' },
    'Pound-mole': { en: 'Pound-mole', ar: 'باوند مول', de: 'Pfund-mol', es: 'Libra-mol', fr: 'Livre-mole', it: 'Libbra-mole', ko: '파운드몰', pt: 'Libra-mol', ru: 'Фунт-моль', zh: '磅摩尔', ja: 'ポンドモル' },
    'Candela': { en: 'Candela', ar: 'شمعة', de: 'Candela', es: 'Candela', fr: 'Candela', it: 'Candela', ko: '칸델라', pt: 'Candela', ru: 'Кандела', zh: '坎德拉', ja: 'カンデラ' },
    'Candlepower': { en: 'Candlepower', ar: 'قوة شمعة', de: 'Kerzenstärke', es: 'Bujía', fr: 'Bougie', it: 'Candela', ko: '촉광', pt: 'Candela', ru: 'Свеча', zh: '烛光', ja: 'キャンドルパワー' },
    'Hefnerkerze': { en: 'Hefnerkerze', ar: 'هيفنركيرزي', de: 'Hefnerkerze', es: 'Hefnerkerze', fr: 'Hefnerkerze', it: 'Hefnerkerze', ko: '헤프너케르체', pt: 'Hefnerkerze', ru: 'Хефнеркерце', zh: '赫夫纳烛光', ja: 'ヘフナーケルツェ' },
    'Square Meter': { 
      en: 'Square Meter', ar: 'متر مربع', de: 'Quadratmeter',
      es: 'Metro Cuadrado', fr: 'Mètre Carré', it: 'Metro Quadrato', ko: '제곱미터',
      pt: 'Metro Quadrado', ru: 'Квадратный Метр', zh: '平方米', ja: '平方メートル'
    },
    'Square Metre': { 
      en: 'Square Metre', ar: 'متر مربع', de: 'Quadratmeter',
      es: 'Metro Cuadrado', fr: 'Mètre Carré', it: 'Metro Quadrato', ko: '제곱미터',
      pt: 'Metro Quadrado', ru: 'Квадратный Метр', zh: '平方米', ja: '平方メートル'
    },
    'Hectare': { 
      en: 'Hectare', ar: 'هكتار', de: 'Hektar',
      es: 'Hectárea', fr: 'Hectare', it: 'Ettaro', ko: '헥타르',
      pt: 'Hectare', ru: 'Гектар', zh: '公顷', ja: 'ヘクタール'
    },
    'Square Inch': { 
      en: 'Square Inch', ar: 'بوصة مربعة', de: 'Quadratzoll',
      es: 'Pulgada Cuadrada', fr: 'Pouce Carré', it: 'Pollice Quadrato', ko: '제곱인치',
      pt: 'Polegada Quadrada', ru: 'Квадратный Дюйм', zh: '平方英寸', ja: '平方インチ'
    },
    'Square Foot': { 
      en: 'Square Foot', ar: 'قدم مربع', de: 'Quadratfuß',
      es: 'Pie Cuadrado', fr: 'Pied Carré', it: 'Piede Quadrato', ko: '제곱피트',
      pt: 'Pé Quadrado', ru: 'Квадратный Фут', zh: '平方英尺', ja: '平方フィート'
    },
    'Square Yard': { 
      en: 'Square Yard', ar: 'ياردة مربعة', de: 'Quadratyard',
      es: 'Yarda Cuadrada', fr: 'Yard Carré', it: 'Iarda Quadrata', ko: '제곱야드',
      pt: 'Jarda Quadrada', ru: 'Квадратный Ярд', zh: '平方码', ja: '平方ヤード'
    },
    'Acre': { 
      en: 'Acre', ar: 'فدان', de: 'Acre',
      es: 'Acre', fr: 'Acre', it: 'Acro', ko: '에이커',
      pt: 'Acre', ru: 'Акр', zh: '英亩', ja: 'エーカー'
    },
    'Square Mile': { 
      en: 'Square Mile', ar: 'ميل مربع', de: 'Quadratmeile',
      es: 'Milla Cuadrada', fr: 'Mille Carré', it: 'Miglio Quadrato', ko: '제곱마일',
      pt: 'Milha Quadrada', ru: 'Квадратная Миля', zh: '平方英里', ja: '平方マイル'
    },
    'Barn': { en: 'Barn', ar: 'بارن', de: 'Barn', es: 'Barn', fr: 'Barn', it: 'Barn', ko: '반', pt: 'Barn', ru: 'Барн', zh: '靶恩', ja: 'バーン' },
    'Dunam': { en: 'Dunam', ar: 'دونم', de: 'Dunam', es: 'Dunam', fr: 'Dunam', it: 'Dunam', ko: '두남', pt: 'Dunam', ru: 'Дунам', zh: '杜纳姆', ja: 'ドゥナム' },
    'Township (US)': { en: 'Township (US)', ar: 'بلدية (أمريكي)', de: 'Township (US)', es: 'Township (EE.UU.)', fr: 'Township (US)', it: 'Township (US)', ko: '타운십 (미국)', pt: 'Township (EUA)', ru: 'Тауншип (США)', zh: '镇区（美国）', ja: 'タウンシップ（米国）' },
    'Section (US)': { en: 'Section (US)', ar: 'قسم (أمريكي)', de: 'Section (US)', es: 'Sección (EE.UU.)', fr: 'Section (US)', it: 'Sezione (US)', ko: '섹션 (미국)', pt: 'Seção (EUA)', ru: 'Секция (США)', zh: '区（美国）', ja: 'セクション（米国）' },
    'Square Degree': { en: 'Square Degree', ar: 'درجة مربعة', de: 'Quadratgrad', es: 'Grado Cuadrado', fr: 'Degré Carré', it: 'Grado Quadrato', ko: '제곱도', pt: 'Grau Quadrado', ru: 'Квадратный Градус', zh: '平方度', ja: '平方度' },
    'Cubic Meter': { en: 'Cubic Meter', ar: 'متر مكعب', de: 'Kubikmeter', es: 'Metro Cúbico', fr: 'Mètre Cube', it: 'Metro Cubo', ko: '세제곱미터', pt: 'Metro Cúbico', ru: 'Кубический Метр', zh: '立方米', ja: '立方メートル' },
    'Cubic Metre': { en: 'Cubic Metre', ar: 'متر مكعب', de: 'Kubikmeter', es: 'Metro Cúbico', fr: 'Mètre Cube', it: 'Metro Cubo', ko: '세제곱미터', pt: 'Metro Cúbico', ru: 'Кубический Метр', zh: '立方米', ja: '立方メートル' },
    'Liter': { 
      en: 'Liter', ar: 'لتر', de: 'Liter',
      es: 'Litro', fr: 'Litre', it: 'Litro', ko: '리터',
      pt: 'Litro', ru: 'Литр', zh: '升', ja: 'リットル'
    },
    'Litre': { 
      en: 'Litre', ar: 'لتر', de: 'Liter',
      es: 'Litro', fr: 'Litre', it: 'Litro', ko: '리터',
      pt: 'Litro', ru: 'Литр', zh: '升', ja: 'リットル'
    },
    'Milliliter': { 
      en: 'Milliliter', ar: 'مليلتر', de: 'Milliliter',
      es: 'Mililitro', fr: 'Millilitre', it: 'Millilitro', ko: '밀리리터',
      pt: 'Mililitro', ru: 'Миллилитр', zh: '毫升', ja: 'ミリリットル'
    },
    'Millilitre': { 
      en: 'Millilitre', ar: 'مليلتر', de: 'Milliliter',
      es: 'Mililitro', fr: 'Millilitre', it: 'Millilitro', ko: '밀리리터',
      pt: 'Mililitro', ru: 'Миллилитр', zh: '毫升', ja: 'ミリリットル'
    },
    'Cubic Foot': { en: 'Cubic Foot', ar: 'قدم مكعب', de: 'Kubikfuß', es: 'Pie Cúbico', fr: 'Pied Cube', it: 'Piede Cubo', ko: '세제곱피트', pt: 'Pé Cúbico', ru: 'Кубический Фут', zh: '立方英尺', ja: '立方フィート' },
    'Cubic Yard': { en: 'Cubic Yard', ar: 'ياردة مكعبة', de: 'Kubikyard', es: 'Yarda Cúbica', fr: 'Yard Cube', it: 'Iarda Cubica', ko: '세제곱야드', pt: 'Jarda Cúbica', ru: 'Кубический Ярд', zh: '立方码', ja: '立方ヤード' },
    'Fluid Ounce (US)': { en: 'Fluid Ounce (US)', ar: 'أونصة سائلة (أمريكي)', de: 'Flüssigunze (US)', es: 'Onza Líquida (EE.UU.)', fr: 'Once Liquide (US)', it: 'Oncia Fluida (US)', ko: '액량온스 (미국)', pt: 'Onça Líquida (EUA)', ru: 'Жидкая Унция (США)', zh: '液量盎司（美国）', ja: '液量オンス（米国）' },
    'Fluid Ounce (Imp)': { en: 'Fluid Ounce (Imp)', ar: 'أونصة سائلة (إمبراطوري)', de: 'Flüssigunze (Imp)', es: 'Onza Líquida (Imp)', fr: 'Once Liquide (Imp)', it: 'Oncia Fluida (Imp)', ko: '액량온스 (영국)', pt: 'Onça Líquida (Imperial)', ru: 'Жидкая Унция (Имп)', zh: '液量盎司（英制）', ja: '液量オンス（英国）' },
    'Tablespoon (US)': { en: 'Tablespoon (US)', ar: 'ملعقة كبيرة (أمريكي)', de: 'Esslöffel (US)', es: 'Cucharada (EE.UU.)', fr: 'Cuillère à Soupe (US)', it: 'Cucchiaio (US)', ko: '큰술 (미국)', pt: 'Colher de Sopa (EUA)', ru: 'Столовая Ложка (США)', zh: '汤匙（美国）', ja: '大さじ（米国）' },
    'Tablespoon (Imp)': { en: 'Tablespoon (Imp)', ar: 'ملعقة كبيرة (إمبراطوري)', de: 'Esslöffel (Imp)', es: 'Cucharada (Imp)', fr: 'Cuillère à Soupe (Imp)', it: 'Cucchiaio (Imp)', ko: '큰술 (영국)', pt: 'Colher de Sopa (Imperial)', ru: 'Столовая Ложка (Имп)', zh: '汤匙（英制）', ja: '大さじ（英国）' },
    'Teaspoon (US)': { en: 'Teaspoon (US)', ar: 'ملعقة صغيرة (أمريكي)', de: 'Teelöffel (US)', es: 'Cucharadita (EE.UU.)', fr: 'Cuillère à Café (US)', it: 'Cucchiaino (US)', ko: '작은술 (미국)', pt: 'Colher de Chá (EUA)', ru: 'Чайная Ложка (США)', zh: '茶匙（美国）', ja: '小さじ（米国）' },
    'Teaspoon (Imp)': { en: 'Teaspoon (Imp)', ar: 'ملعقة صغيرة (إمبراطوري)', de: 'Teelöffel (Imp)', es: 'Cucharadita (Imp)', fr: 'Cuillère à Café (Imp)', it: 'Cucchiaino (Imp)', ko: '작은술 (영국)', pt: 'Colher de Chá (Imperial)', ru: 'Чайная Ложка (Имп)', zh: '茶匙（英制）', ja: '小さじ（英国）' },
    'Cup (US)': { en: 'Cup (US)', ar: 'كوب (أمريكي)', de: 'Tasse (US)', es: 'Taza (EE.UU.)', fr: 'Tasse (US)', it: 'Tazza (US)', ko: '컵 (미국)', pt: 'Xícara (EUA)', ru: 'Чашка (США)', zh: '杯（美国）', ja: 'カップ（米国）' },
    'Pint (US)': { en: 'Pint (US)', ar: 'باينت (أمريكي)', de: 'Pint (US)', es: 'Pinta (EE.UU.)', fr: 'Pinte (US)', it: 'Pinta (US)', ko: '파인트 (미국)', pt: 'Pinto (EUA)', ru: 'Пинта (США)', zh: '品脱（美国）', ja: 'パイント（米国）' },
    'Pint (Imp)': { en: 'Pint (Imp)', ar: 'باينت (إمبراطوري)', de: 'Pint (Imp)', es: 'Pinta (Imp)', fr: 'Pinte (Imp)', it: 'Pinta (Imp)', ko: '파인트 (영국)', pt: 'Pinto (Imperial)', ru: 'Пинта (Имп)', zh: '品脱（英制）', ja: 'パイント（英国）' },
    'Quart (US)': { en: 'Quart (US)', ar: 'كوارت (أمريكي)', de: 'Quart (US)', es: 'Cuarto (EE.UU.)', fr: 'Quart (US)', it: 'Quarto (US)', ko: '쿼트 (미국)', pt: 'Quarto (EUA)', ru: 'Кварта (США)', zh: '夸脱（美国）', ja: 'クォート（米国）' },
    'Quart (Imp)': { en: 'Quart (Imp)', ar: 'كوارت (إمبراطوري)', de: 'Quart (Imp)', es: 'Cuarto (Imp)', fr: 'Quart (Imp)', it: 'Quarto (Imp)', ko: '쿼트 (영국)', pt: 'Quarto (Imperial)', ru: 'Кварта (Имп)', zh: '夸脱（英制）', ja: 'クォート（英国）' },
    'Gallon (US)': { 
      en: 'Gallon (US)', ar: 'جالون (أمريكي)', de: 'Gallone (US)',
      es: 'Galón (EE.UU.)', fr: 'Gallon (US)', it: 'Gallone (US)', ko: '갤런 (미국)',
      pt: 'Galão (EUA)', ru: 'Галлон (США)', zh: '加仑（美国）', ja: 'ガロン（米国）'
    },
    'Gallon (Imp)': { 
      en: 'Gallon (Imp)', ar: 'جالون (إمبراطوري)', de: 'Gallone (Imp)',
      es: 'Galón (Imperial)', fr: 'Gallon (Imp)', it: 'Gallone (Imp)', ko: '갤런 (영국)',
      pt: 'Galão (Imperial)', ru: 'Галлон (Имперский)', zh: '加仑（英制）', ja: 'ガロン（英国）'
    },
    'Barrel (Oil)': { en: 'Barrel (Oil)', ar: 'برميل (نفط)', de: 'Barrel (Öl)', es: 'Barril (Petróleo)', fr: 'Baril (Pétrole)', it: 'Barile (Petrolio)', ko: '배럴 (석유)', pt: 'Barril (Petróleo)', ru: 'Баррель (Нефть)', zh: '桶（石油）', ja: 'バレル（石油）' },
    'Barrel (Beer)': { en: 'Barrel (Beer)', ar: 'برميل (بيرة)', de: 'Fass (Bier)', es: 'Barril (Cerveza)', fr: 'Tonneau (Bière)', it: 'Barile (Birra)', ko: '배럴 (맥주)', pt: 'Barril (Cerveja)', ru: 'Бочка (Пиво)', zh: '桶（啤酒）', ja: 'バレル（ビール）' },
    'Keg (Beer)': { en: 'Keg (Beer)', ar: 'برميل صغير (بيرة)', de: 'Fass (Bier)', es: 'Barrilete (Cerveza)', fr: 'Fût (Bière)', it: 'Fusto (Birra)', ko: '케그 (맥주)', pt: 'Barril (Cerveja)', ru: 'Кег (Пиво)', zh: '小桶（啤酒）', ja: 'ケグ（ビール）' },
    'Mini Keg (Beer)': { en: 'Mini Keg (Beer)', ar: 'برميل صغير جداً (بيرة)', de: 'Mini-Fass (Bier)', es: 'Mini Barrilete (Cerveza)', fr: 'Mini Fût (Bière)', it: 'Mini Fusto (Birra)', ko: '미니케그 (맥주)', pt: 'Mini Barril (Cerveja)', ru: 'Мини-кег (Пиво)', zh: '迷你桶（啤酒）', ja: 'ミニケグ（ビール）' },
    'Bottle (Wine)': { en: 'Bottle (Wine)', ar: 'زجاجة (نبيذ)', de: 'Flasche (Wein)', es: 'Botella (Vino)', fr: 'Bouteille (Vin)', it: 'Bottiglia (Vino)', ko: '병 (와인)', pt: 'Garrafa (Vinho)', ru: 'Бутылка (Вино)', zh: '瓶（葡萄酒）', ja: 'ボトル（ワイン）' },
    'Magnum (Wine)': { en: 'Magnum (Wine)', ar: 'ماغنوم (نبيذ)', de: 'Magnum (Wein)', es: 'Magnum (Vino)', fr: 'Magnum (Vin)', it: 'Magnum (Vino)', ko: '매그넘 (와인)', pt: 'Magnum (Vinho)', ru: 'Магнум (Вино)', zh: '大瓶（葡萄酒）', ja: 'マグナム（ワイン）' },
    'Bottle (Beer, small)': { en: 'Bottle (Beer, small)', ar: 'زجاجة (بيرة، صغيرة)', de: 'Flasche (Bier, klein)', es: 'Botella (Cerveza, pequeña)', fr: 'Bouteille (Bière, petite)', it: 'Bottiglia (Birra, piccola)', ko: '병 (맥주, 소)', pt: 'Garrafa (Cerveja, pequena)', ru: 'Бутылка (Пиво, маленькая)', zh: '瓶（啤酒，小）', ja: 'ボトル（ビール、小）' },
    'Bottle (Beer, longneck)': { en: 'Bottle (Beer, longneck)', ar: 'زجاجة (بيرة، طويلة)', de: 'Flasche (Bier, Longneck)', es: 'Botella (Cerveza, cuello largo)', fr: 'Bouteille (Bière, long col)', it: 'Bottiglia (Birra, collo lungo)', ko: '병 (맥주, 롱넥)', pt: 'Garrafa (Cerveja, long neck)', ru: 'Бутылка (Пиво, длинное горлышко)', zh: '瓶（啤酒，长颈）', ja: 'ボトル（ビール、ロングネック）' },
    'Bottle (Beer, large)': { en: 'Bottle (Beer, large)', ar: 'زجاجة (بيرة، كبيرة)', de: 'Flasche (Bier, groß)', es: 'Botella (Cerveza, grande)', fr: 'Bouteille (Bière, grande)', it: 'Bottiglia (Birra, grande)', ko: '병 (맥주, 대)', pt: 'Garrafa (Cerveja, grande)', ru: 'Бутылка (Пиво, большая)', zh: '瓶（啤酒，大）', ja: 'ボトル（ビール、大）' },
    'Bushel': { en: 'Bushel', ar: 'بوشل', de: 'Scheffel', es: 'Bushel', fr: 'Boisseau', it: 'Bushel', ko: '부셸', pt: 'Alqueire', ru: 'Бушель', zh: '蒲式耳', ja: 'ブッシェル' },
    'Acre-foot': { en: 'Acre-foot', ar: 'فدان قدم', de: 'Acre-Fuß', es: 'Acre-pie', fr: 'Acre-pied', it: 'Acro-piede', ko: '에이커피트', pt: 'Acre-pé', ru: 'Акр-фут', zh: '英亩英尺', ja: 'エーカーフィート' },
    'Cubic Mile': { en: 'Cubic Mile', ar: 'ميل مكعب', de: 'Kubikmeile', es: 'Milla Cúbica', fr: 'Mille Cube', it: 'Miglio Cubo', ko: '세제곱마일', pt: 'Milha Cúbica', ru: 'Кубическая Миля', zh: '立方英里', ja: '立方マイル' },
    'Hertz': { en: 'Hertz', ar: 'هرتز', de: 'Hertz', es: 'Hercio', fr: 'Hertz', it: 'Hertz', ko: '헤르츠', pt: 'Hertz', ru: 'Герц', zh: '赫兹', ja: 'ヘルツ' },
    'Meter/Second': { en: 'Meter/Second', ar: 'متر/ثانية', de: 'Meter/Sekunde', es: 'Metro/Segundo', fr: 'Mètre/Seconde', it: 'Metro/Secondo', ko: '미터/초', pt: 'Metro/Segundo', ru: 'Метр/Секунда', zh: '米/秒', ja: 'メートル/秒' },
    'Meter/sq sec': { en: 'Meter/sq sec', ar: 'متر/ثانية²', de: 'Meter/Sek²', es: 'Metro/seg²', fr: 'Mètre/sec²', it: 'Metro/sec²', ko: '미터/초²', pt: 'Metro/seg²', ru: 'Метр/сек²', zh: '米/秒²', ja: 'メートル/秒²' },
    'Kilometer/Hour': { en: 'Kilometer/Hour', ar: 'كيلومتر/ساعة', de: 'Kilometer/Stunde', es: 'Kilómetro/Hora', fr: 'Kilomètre/Heure', it: 'Chilometro/Ora', ko: '킬로미터/시', pt: 'Quilômetro/Hora', ru: 'Километр/Час', zh: '千米/小时', ja: 'キロメートル/時' },
    'Mile/Hour': { en: 'Mile/Hour', ar: 'ميل/ساعة', de: 'Meile/Stunde', es: 'Milla/Hora', fr: 'Mille/Heure', it: 'Miglio/Ora', ko: '마일/시', pt: 'Milha/Hora', ru: 'Миля/Час', zh: '英里/小时', ja: 'マイル/時' },
    'Knot': { en: 'Knot', ar: 'عقدة', de: 'Knoten', es: 'Nudo', fr: 'Nœud', it: 'Nodo', ko: '노트', pt: 'Nó', ru: 'Узел', zh: '节', ja: 'ノット' },
    'Speed of Light': { en: 'Speed of Light', ar: 'سرعة الضوء', de: 'Lichtgeschwindigkeit', es: 'Velocidad de la Luz', fr: 'Vitesse de la Lumière', it: 'Velocità della Luce', ko: '광속', pt: 'Velocidade da Luz', ru: 'Скорость Света', zh: '光速', ja: '光速' },
    'Mach': { en: 'Mach', ar: 'ماخ', de: 'Mach', es: 'Mach', fr: 'Mach', it: 'Mach', ko: '마하', pt: 'Mach', ru: 'Мах', zh: '马赫', ja: 'マッハ' },
    'Foot/sq sec': { en: 'Foot/sq sec', ar: 'قدم/ثانية²', de: 'Fuß/Sek²', es: 'Pie/seg²', fr: 'Pied/sec²', it: 'Piede/sec²', ko: '피트/초²', pt: 'Pé/seg²', ru: 'Фут/сек²', zh: '英尺/秒²', ja: 'フィート/秒²' },
    'Gal': { en: 'Gal', ar: 'غال', de: 'Gal', es: 'Gal', fr: 'Gal', it: 'Gal', ko: '갈', pt: 'Gal', ru: 'Гал', zh: '伽', ja: 'ガル' },
    'g-force': { en: 'g-force', ar: 'قوة جاذبية', de: 'g-Kraft', es: 'Fuerza g', fr: 'Force g', it: 'Forza g', ko: 'g힘', pt: 'Força g', ru: 'Сила g', zh: 'g力', ja: 'G力' },
    'Newton': { en: 'Newton', ar: 'نيوتن', de: 'Newton', es: 'Newton', fr: 'Newton', it: 'Newton', ko: '뉴턴', pt: 'Newton', ru: 'Ньютон', zh: '牛顿', ja: 'ニュートン' },
    'Dyne': { en: 'Dyne', ar: 'داين', de: 'Dyn', es: 'Dina', fr: 'Dyne', it: 'Dina', ko: '다인', pt: 'Dina', ru: 'Дина', zh: '达因', ja: 'ダイン' },
    'Kilogram-force': { en: 'Kilogram-force', ar: 'كيلوغرام قوة', de: 'Kilopond', es: 'Kilogramo-fuerza', fr: 'Kilogramme-force', it: 'Chilogrammo-forza', ko: '킬로그램중', pt: 'Quilograma-força', ru: 'Килограмм-сила', zh: '千克力', ja: 'キログラム重' },
    'Pound-force': { en: 'Pound-force', ar: 'باوند قوة', de: 'Pound-force', es: 'Libra-fuerza', fr: 'Livre-force', it: 'Libbra-forza', ko: '파운드중', pt: 'Libra-força', ru: 'Фунт-сила', zh: '磅力', ja: 'ポンド重' },
    'Poundal': { en: 'Poundal', ar: 'باوندال', de: 'Poundal', es: 'Poundal', fr: 'Poundal', it: 'Poundal', ko: '파운달', pt: 'Poundal', ru: 'Паундаль', zh: '磅达', ja: 'パウンダル' },
    'Kip': { en: 'Kip', ar: 'كيب', de: 'Kip', es: 'Kip', fr: 'Kip', it: 'Kip', ko: '킵', pt: 'Kip', ru: 'Кип', zh: '千磅力', ja: 'キップ' },
    'Pascal': { en: 'Pascal', ar: 'باسكال', de: 'Pascal', es: 'Pascal', fr: 'Pascal', it: 'Pascal', ko: '파스칼', pt: 'Pascal', ru: 'Паскаль', zh: '帕斯卡', ja: 'パスカル' },
    'Bar': { en: 'Bar', ar: 'بار', de: 'Bar', es: 'Bar', fr: 'Bar', it: 'Bar', ko: '바', pt: 'Bar', ru: 'Бар', zh: '巴', ja: 'バール' },
    'Millibar': { en: 'Millibar', ar: 'ميليبار', de: 'Millibar', es: 'Milibar', fr: 'Millibar', it: 'Millibar', ko: '밀리바', pt: 'Milibar', ru: 'Миллибар', zh: '毫巴', ja: 'ミリバール' },
    'Microbar': { en: 'Microbar', ar: 'ميكروبار', de: 'Mikrobar', es: 'Microbar', fr: 'Microbar', it: 'Microbar', ko: '마이크로바', pt: 'Microbar', ru: 'Микробар', zh: '微巴', ja: 'マイクロバール' },
    'Atmosphere': { en: 'Atmosphere', ar: 'ضغط جوي', de: 'Atmosphäre', es: 'Atmósfera', fr: 'Atmosphère', it: 'Atmosfera', ko: '기압', pt: 'Atmosfera', ru: 'Атмосфера', zh: '大气压', ja: '気圧' },
    'PSI': { en: 'PSI', ar: 'باوند/بوصة²', de: 'PSI', es: 'PSI', fr: 'PSI', it: 'PSI', ko: 'PSI', pt: 'PSI', ru: 'PSI', zh: '磅/平方英寸', ja: 'PSI' },
    'Torr': { en: 'Torr', ar: 'تور', de: 'Torr', es: 'Torr', fr: 'Torr', it: 'Torr', ko: '토르', pt: 'Torr', ru: 'Торр', zh: '托', ja: 'トル' },
    'mmHg': { en: 'mmHg', ar: 'ملم زئبق', de: 'mmHg', es: 'mmHg', fr: 'mmHg', it: 'mmHg', ko: 'mmHg', pt: 'mmHg', ru: 'мм рт. ст.', zh: '毫米汞柱', ja: 'mmHg' },
    'Dyne/cm²': { en: 'Dyne/cm²', ar: 'داين/سم²', de: 'Dyn/cm²', es: 'Dina/cm²', fr: 'Dyne/cm²', it: 'Dina/cm²', ko: '다인/cm²', pt: 'Dina/cm²', ru: 'Дин/см²', zh: '达因/cm²', ja: 'ダイン/cm²' },
    'Joule': { en: 'Joule', ar: 'جول', de: 'Joule', es: 'Julio', fr: 'Joule', it: 'Joule', ko: '줄', pt: 'Joule', ru: 'Джоуль', zh: '焦耳', ja: 'ジュール' },
    'Kilojoule': { en: 'Kilojoule', ar: 'كيلوجول', de: 'Kilojoule', es: 'Kilojulio', fr: 'Kilojoule', it: 'Kilojoule', ko: '킬로줄', pt: 'Quilojoule', ru: 'Килоджоуль', zh: '千焦', ja: 'キロジュール' },
    'Calorie': { en: 'Calorie', ar: 'سعرة', de: 'Kalorie', es: 'Caloría', fr: 'Calorie', it: 'Caloria', ko: '칼로리', pt: 'Caloria', ru: 'Калория', zh: '卡路里', ja: 'カロリー' },
    'Kilocalorie': { en: 'Kilocalorie', ar: 'كيلوسعرة', de: 'Kilokalorie', es: 'Kilocaloría', fr: 'Kilocalorie', it: 'Chilocaloria', ko: '킬로칼로리', pt: 'Quilocaloria', ru: 'Килокалория', zh: '千卡', ja: 'キロカロリー' },
    'BTU': { en: 'BTU', ar: 'وحدة حرارية بريطانية', de: 'BTU', es: 'BTU', fr: 'BTU', it: 'BTU', ko: 'BTU', pt: 'BTU', ru: 'БТЕ', zh: '英热单位', ja: 'BTU' },
    'Watt-hour': { en: 'Watt-hour', ar: 'واط ساعة', de: 'Wattstunde', es: 'Vatio-hora', fr: 'Watt-heure', it: 'Wattora', ko: '와트시', pt: 'Watt-hora', ru: 'Ватт-час', zh: '瓦时', ja: 'ワット時' },
    'Kilowatt-hour': { en: 'Kilowatt-hour', ar: 'كيلوواط ساعة', de: 'Kilowattstunde', es: 'Kilovatio-hora', fr: 'Kilowatt-heure', it: 'Chilowattora', ko: '킬로와트시', pt: 'Quilowatt-hora', ru: 'Киловатт-час', zh: '千瓦时', ja: 'キロワット時' },
    'Electronvolt': { en: 'Electronvolt', ar: 'إلكترون فولت', de: 'Elektronenvolt', es: 'Electronvoltio', fr: 'Électronvolt', it: 'Elettronvolt', ko: '전자볼트', pt: 'Elétron-volt', ru: 'Электронвольт', zh: '电子伏特', ja: '電子ボルト' },
    'Erg': { en: 'Erg', ar: 'إرغ', de: 'Erg', es: 'Ergio', fr: 'Erg', it: 'Erg', ko: '에르그', pt: 'Erg', ru: 'Эрг', zh: '尔格', ja: 'エルグ' },
    'Foot-pound': { en: 'Foot-pound', ar: 'قدم باوند', de: 'Fußpfund', es: 'Pie-libra', fr: 'Pied-livre', it: 'Piede-libbra', ko: '피트파운드', pt: 'Pé-libra', ru: 'Фут-фунт', zh: '英尺磅', ja: 'フィートポンド' },
    'Ton of TNT': { en: 'Ton of TNT', ar: 'طن TNT', de: 'Tonne TNT', es: 'Tonelada de TNT', fr: 'Tonne de TNT', it: 'Tonnellata di TNT', ko: 'TNT톤', pt: 'Tonelada de TNT', ru: 'Тонна ТНТ', zh: '吨TNT', ja: 'トンTNT' },
    'Watt': { en: 'Watt', ar: 'واط', de: 'Watt', es: 'Vatio', fr: 'Watt', it: 'Watt', ko: '와트', pt: 'Watt', ru: 'Ватт', zh: '瓦特', ja: 'ワット' },
    'Kilowatt': { en: 'Kilowatt', ar: 'كيلوواط', de: 'Kilowatt', es: 'Kilovatio', fr: 'Kilowatt', it: 'Chilowatt', ko: '킬로와트', pt: 'Quilowatt', ru: 'Киловатт', zh: '千瓦', ja: 'キロワット' },
    'Horsepower': { en: 'Horsepower', ar: 'حصان', de: 'Pferdestärke', es: 'Caballo de Fuerza', fr: 'Cheval-vapeur', it: 'Cavallo Vapore', ko: '마력', pt: 'Cavalo-vapor', ru: 'Лошадиная Сила', zh: '马力', ja: '馬力' },
    'Metric HP': { en: 'Metric HP', ar: 'حصان متري', de: 'Metrische PS', es: 'CV Métrico', fr: 'CV Métrique', it: 'CV Metrico', ko: '미터법 마력', pt: 'CV Métrico', ru: 'Метрическая Л.С.', zh: '公制马力', ja: '仏馬力' },
    'Ton Refrigeration': { en: 'Ton Refrigeration', ar: 'طن تبريد', de: 'Kältetonne', es: 'Tonelada de Refrigeración', fr: 'Tonne de Réfrigération', it: 'Tonnellata di Refrigerazione', ko: '냉동톤', pt: 'Tonelada de Refrigeração', ru: 'Тонна Охлаждения', zh: '冷吨', ja: '冷凍トン' },
    'Coulomb': { en: 'Coulomb', ar: 'كولوم', de: 'Coulomb', es: 'Culombio', fr: 'Coulomb', it: 'Coulomb', ko: '쿨롱', pt: 'Coulomb', ru: 'Кулон', zh: '库仑', ja: 'クーロン' },
    'Ampere-hour': { en: 'Ampere-hour', ar: 'أمبير ساعة', de: 'Amperestunde', es: 'Amperio-hora', fr: 'Ampère-heure', it: 'Ampere-ora', ko: '암페어시', pt: 'Ampere-hora', ru: 'Ампер-час', zh: '安培时', ja: 'アンペア時' },
    'Milliamp-hour': { en: 'Milliamp-hour', ar: 'ميلي أمبير ساعة', de: 'Milliamperestunde', es: 'Miliamperio-hora', fr: 'Milliampère-heure', it: 'Milliampere-ora', ko: '밀리암페어시', pt: 'Miliampere-hora', ru: 'Миллиампер-час', zh: '毫安时', ja: 'ミリアンペア時' },
    'Faraday': { en: 'Faraday', ar: 'فاراداي', de: 'Faraday', es: 'Faraday', fr: 'Faraday', it: 'Faraday', ko: '패러데이', pt: 'Faraday', ru: 'Фарадей', zh: '法拉第', ja: 'ファラデー' },
    'Volt': { en: 'Volt', ar: 'فولت', de: 'Volt', es: 'Voltio', fr: 'Volt', it: 'Volt', ko: '볼트', pt: 'Volt', ru: 'Вольт', zh: '伏特', ja: 'ボルト' },
    'Statvolt': { en: 'Statvolt', ar: 'ستات فولت', de: 'Statvolt', es: 'Estatvoltio', fr: 'Statvolt', it: 'Statvolt', ko: '스탯볼트', pt: 'Statvolt', ru: 'Статвольт', zh: '静伏', ja: 'スタットボルト' },
    'Farad': { en: 'Farad', ar: 'فاراد', de: 'Farad', es: 'Faradio', fr: 'Farad', it: 'Farad', ko: '패럿', pt: 'Farad', ru: 'Фарад', zh: '法拉', ja: 'ファラド' },
    'Ohm': { en: 'Ohm', ar: 'أوم', de: 'Ohm', es: 'Ohmio', fr: 'Ohm', it: 'Ohm', ko: '옴', pt: 'Ohm', ru: 'Ом', zh: '欧姆', ja: 'オーム' },
    'Siemens': { en: 'Siemens', ar: 'سيمنز', de: 'Siemens', es: 'Siemens', fr: 'Siemens', it: 'Siemens', ko: '지멘스', pt: 'Siemens', ru: 'Сименс', zh: '西门子', ja: 'ジーメンス' },
    'Mho': { en: 'Mho', ar: 'موه', de: 'Mho', es: 'Mho', fr: 'Mho', it: 'Mho', ko: '모', pt: 'Mho', ru: 'Мо', zh: '姆欧', ja: 'モー' },
    'Henry': { en: 'Henry', ar: 'هنري', de: 'Henry', es: 'Henrio', fr: 'Henry', it: 'Henry', ko: '헨리', pt: 'Henry', ru: 'Генри', zh: '亨利', ja: 'ヘンリー' },
    'Weber': { en: 'Weber', ar: 'ويبر', de: 'Weber', es: 'Weber', fr: 'Weber', it: 'Weber', ko: '웨버', pt: 'Weber', ru: 'Вебер', zh: '韦伯', ja: 'ウェーバー' },
    'Maxwell': { en: 'Maxwell', ar: 'ماكسويل', de: 'Maxwell', es: 'Maxwell', fr: 'Maxwell', it: 'Maxwell', ko: '맥스웰', pt: 'Maxwell', ru: 'Максвелл', zh: '麦克斯韦', ja: 'マクスウェル' },
    'Tesla': { en: 'Tesla', ar: 'تسلا', de: 'Tesla', es: 'Tesla', fr: 'Tesla', it: 'Tesla', ko: '테슬라', pt: 'Tesla', ru: 'Тесла', zh: '特斯拉', ja: 'テスラ' },
    'Gauss': { en: 'Gauss', ar: 'غاوس', de: 'Gauss', es: 'Gauss', fr: 'Gauss', it: 'Gauss', ko: '가우스', pt: 'Gauss', ru: 'Гаусс', zh: '高斯', ja: 'ガウス' },
    'Becquerel': { en: 'Becquerel', ar: 'بكريل', de: 'Becquerel', es: 'Becquerel', fr: 'Becquerel', it: 'Becquerel', ko: '베크렐', pt: 'Becquerel', ru: 'Беккерель', zh: '贝克勒尔', ja: 'ベクレル' },
    'Curie': { en: 'Curie', ar: 'كوري', de: 'Curie', es: 'Curio', fr: 'Curie', it: 'Curie', ko: '큐리', pt: 'Curie', ru: 'Кюри', zh: '居里', ja: 'キュリー' },
    'Rutherford': { en: 'Rutherford', ar: 'رذرفورد', de: 'Rutherford', es: 'Rutherford', fr: 'Rutherford', it: 'Rutherford', ko: '러더퍼드', pt: 'Rutherford', ru: 'Резерфорд', zh: '卢瑟福', ja: 'ラザフォード' },
    'Gray': { en: 'Gray', ar: 'غراي', de: 'Gray', es: 'Gray', fr: 'Gray', it: 'Gray', ko: '그레이', pt: 'Gray', ru: 'Грей', zh: '戈瑞', ja: 'グレイ' },
    'Rad': { en: 'Rad', ar: 'راد', de: 'Rad', es: 'Rad', fr: 'Rad', it: 'Rad', ko: '라드', pt: 'Rad', ru: 'Рад', zh: '拉德', ja: 'ラド' },
    'Sievert': { en: 'Sievert', ar: 'سيفرت', de: 'Sievert', es: 'Sievert', fr: 'Sievert', it: 'Sievert', ko: '시버트', pt: 'Sievert', ru: 'Зиверт', zh: '希沃特', ja: 'シーベルト' },
    'Rem': { en: 'Rem', ar: 'ريم', de: 'Rem', es: 'Rem', fr: 'Rem', it: 'Rem', ko: '렘', pt: 'Rem', ru: 'Бэр', zh: '雷姆', ja: 'レム' },
    'Roentgen': { en: 'Roentgen', ar: 'رونتجن', de: 'Röntgen', es: 'Röntgen', fr: 'Röntgen', it: 'Röntgen', ko: '뢴트겐', pt: 'Röntgen', ru: 'Рентген', zh: '伦琴', ja: 'レントゲン' },
    'Katal': { en: 'Katal', ar: 'كاتال', de: 'Katal', es: 'Katal', fr: 'Katal', it: 'Katal', ko: '카탈', pt: 'Katal', ru: 'Катал', zh: '开特', ja: 'カタール' },
    'Enzyme Unit': { en: 'Enzyme Unit', ar: 'وحدة إنزيم', de: 'Enzymeinheit', es: 'Unidad de Enzima', fr: 'Unité d\'Enzyme', it: 'Unità Enzimatica', ko: '효소 단위', pt: 'Unidade de Enzima', ru: 'Единица Энзима', zh: '酶单位', ja: '酵素単位' },
    'Radian': { en: 'Radian', ar: 'راديان', de: 'Radiant', es: 'Radián', fr: 'Radian', it: 'Radiante', ko: '라디안', pt: 'Radiano', ru: 'Радиан', zh: '弧度', ja: 'ラジアン' },
    'Degree': { en: 'Degree', ar: 'درجة', de: 'Grad', es: 'Grado', fr: 'Degré', it: 'Grado', ko: '도', pt: 'Grau', ru: 'Градус', zh: '度', ja: '度' },
    'Degree (DMS)': { en: 'Degree (DMS)', ar: 'درجة (د:د:ث)', de: 'Grad (DMS)', es: 'Grado (DMS)', fr: 'Degré (DMS)', it: 'Grado (DMS)', ko: '도 (도분초)', pt: 'Grau (DMS)', ru: 'Градус (DMS)', zh: '度（度分秒）', ja: '度（度分秒）' },
    'Arcminute': { en: 'Arcminute', ar: 'دقيقة قوسية', de: 'Bogenminute', es: 'Minuto de Arco', fr: 'Minute d\'Arc', it: 'Primo d\'Arco', ko: '분각', pt: 'Minuto de Arco', ru: 'Угловая Минута', zh: '角分', ja: '分角' },
    'Arcsecond': { en: 'Arcsecond', ar: 'ثانية قوسية', de: 'Bogensekunde', es: 'Segundo de Arco', fr: 'Seconde d\'Arc', it: 'Secondo d\'Arco', ko: '초각', pt: 'Segundo de Arco', ru: 'Угловая Секунда', zh: '角秒', ja: '秒角' },
    'Gradian': { en: 'Gradian', ar: 'غراديان', de: 'Gon', es: 'Gradián', fr: 'Grade', it: 'Gradiente', ko: '그라디안', pt: 'Grado', ru: 'Град', zh: '百分度', ja: 'グラジアン' },
    'Turn': { en: 'Turn', ar: 'دورة', de: 'Umdrehung', es: 'Vuelta', fr: 'Tour', it: 'Giro', ko: '회전', pt: 'Volta', ru: 'Оборот', zh: '圈', ja: '回転' },
    'Spat': { en: 'Spat', ar: 'سبات', de: 'Spat', es: 'Spat', fr: 'Spat', it: 'Spat', ko: '스팟', pt: 'Spat', ru: 'Спат', zh: '球面度', ja: 'スパット' },
    'Steradian': { en: 'Steradian', ar: 'ستراديان', de: 'Steradiant', es: 'Estereorradián', fr: 'Stéradian', it: 'Steradiante', ko: '스테라디안', pt: 'Esterradiano', ru: 'Стерадиан', zh: '球面度', ja: 'ステラジアン' },
    'Decibel': { en: 'Decibel', ar: 'ديسيبل', de: 'Dezibel', es: 'Decibelio', fr: 'Décibel', it: 'Decibel', ko: '데시벨', pt: 'Decibel', ru: 'Децибел', zh: '分贝', ja: 'デシベル' },
    'Lumen': { en: 'Lumen', ar: 'لومن', de: 'Lumen', es: 'Lumen', fr: 'Lumen', it: 'Lumen', ko: '루멘', pt: 'Lúmen', ru: 'Люмен', zh: '流明', ja: 'ルーメン' },
    'Talbot': { en: 'Talbot', ar: 'تالبوت', de: 'Talbot', es: 'Talbot', fr: 'Talbot', it: 'Talbot', ko: '탈봇', pt: 'Talbot', ru: 'Тальбот', zh: '塔尔博特', ja: 'タルボット' },
    'Candlepower (spherical)': { en: 'Candlepower (spherical)', ar: 'قوة شمعة (كروية)', de: 'Kerzenstärke (sphärisch)', es: 'Bujía (esférica)', fr: 'Bougie (sphérique)', it: 'Candela (sferica)', ko: '촉광 (구면)', pt: 'Candela (esférica)', ru: 'Свеча (сферическая)', zh: '烛光（球面）', ja: 'キャンドルパワー（球面）' },
    'Lux': { en: 'Lux', ar: 'لوكس', de: 'Lux', es: 'Lux', fr: 'Lux', it: 'Lux', ko: '럭스', pt: 'Lux', ru: 'Люкс', zh: '勒克斯', ja: 'ルクス' },
    'Foot-candle': { en: 'Foot-candle', ar: 'قدم شمعة', de: 'Fuß-Kerze', es: 'Pie-candela', fr: 'Pied-bougie', it: 'Piede-candela', ko: '피트촉광', pt: 'Pé-vela', ru: 'Фут-свеча', zh: '英尺烛光', ja: 'フートカンデラ' },
    'Lumen/m²': { en: 'Lumen/m²', ar: 'لومن/م²', de: 'Lumen/m²', es: 'Lumen/m²', fr: 'Lumen/m²', it: 'Lumen/m²', ko: '루멘/m²', pt: 'Lúmen/m²', ru: 'Люмен/м²', zh: '流明/m²', ja: 'ルーメン/m²' },
    'Foot-lambert': { en: 'Foot-lambert', ar: 'قدم لامبرت', de: 'Fußlambert', es: 'Pie-lambert', fr: 'Pied-lambert', it: 'Piede-lambert', ko: '피트램버트', pt: 'Pé-lambert', ru: 'Фут-ламберт', zh: '英尺朗伯', ja: 'フートランバート' },
    'Candela/m²': { en: 'Candela/m²', ar: 'شمعة/م²', de: 'Candela/m²', es: 'Candela/m²', fr: 'Candela/m²', it: 'Candela/m²', ko: '칸델라/m²', pt: 'Candela/m²', ru: 'Кандела/м²', zh: '坎德拉/m²', ja: 'カンデラ/m²' },
    'Lambert': { en: 'Lambert', ar: 'لامبرت', de: 'Lambert', es: 'Lambert', fr: 'Lambert', it: 'Lambert', ko: '램버트', pt: 'Lambert', ru: 'Ламберт', zh: '朗伯', ja: 'ランバート' },
    'Stilb': { en: 'Stilb', ar: 'ستيلب', de: 'Stilb', es: 'Stilb', fr: 'Stilb', it: 'Stilb', ko: '스틸브', pt: 'Stilb', ru: 'Стильб', zh: '熙提', ja: 'スチルブ' },
    'Diopter': { en: 'Diopter', ar: 'ديوبتر', de: 'Dioptrie', es: 'Dioptría', fr: 'Dioptrie', it: 'Diottria', ko: '디옵터', pt: 'Dioptria', ru: 'Диоптрия', zh: '屈光度', ja: 'ディオプター' },
    'Bit': { en: 'Bit', ar: 'بت', de: 'Bit', es: 'Bit', fr: 'Bit', it: 'Bit', ko: '비트', pt: 'Bit', ru: 'Бит', zh: '位', ja: 'ビット' },
    'Byte': { en: 'Byte', ar: 'بايت', de: 'Byte', es: 'Byte', fr: 'Octet', it: 'Byte', ko: '바이트', pt: 'Byte', ru: 'Байт', zh: '字节', ja: 'バイト' },
    'Kilobyte': { en: 'Kilobyte', ar: 'كيلوبايت', de: 'Kilobyte', es: 'Kilobyte', fr: 'Kilooctet', it: 'Kilobyte', ko: '킬로바이트', pt: 'Kilobyte', ru: 'Килобайт', zh: '千字节', ja: 'キロバイト' },
    'Megabyte': { en: 'Megabyte', ar: 'ميغابايت', de: 'Megabyte', es: 'Megabyte', fr: 'Mégaoctet', it: 'Megabyte', ko: '메가바이트', pt: 'Megabyte', ru: 'Мегабайт', zh: '兆字节', ja: 'メガバイト' },
    'Gigabyte': { en: 'Gigabyte', ar: 'غيغابايت', de: 'Gigabyte', es: 'Gigabyte', fr: 'Gigaoctet', it: 'Gigabyte', ko: '기가바이트', pt: 'Gigabyte', ru: 'Гигабайт', zh: '吉字节', ja: 'ギガバイト' },
    'Terabyte': { en: 'Terabyte', ar: 'تيرابايت', de: 'Terabyte', es: 'Terabyte', fr: 'Téraoctet', it: 'Terabyte', ko: '테라바이트', pt: 'Terabyte', ru: 'Терабайт', zh: '太字节', ja: 'テラバイト' },
    'Point': { en: 'Point', ar: 'نقطة', de: 'Punkt', es: 'Punto', fr: 'Point', it: 'Punto', ko: '포인트', pt: 'Ponto', ru: 'Пункт', zh: '点', ja: 'ポイント' },
    'Pica': { en: 'Pica', ar: 'بيكا', de: 'Pica', es: 'Pica', fr: 'Pica', it: 'Pica', ko: '파이카', pt: 'Pica', ru: 'Пика', zh: '派卡', ja: 'パイカ' },
    'Didot': { en: 'Didot', ar: 'ديدوت', de: 'Didot', es: 'Didot', fr: 'Didot', it: 'Didot', ko: '디도', pt: 'Didot', ru: 'Дидо', zh: '迪多', ja: 'ディド' },
    'Cicero': { en: 'Cicero', ar: 'شيشرون', de: 'Cicero', es: 'Cícero', fr: 'Cicéro', it: 'Cicero', ko: '시세로', pt: 'Cícero', ru: 'Цицеро', zh: '西塞罗', ja: 'シセロ' },
    'Twip': { en: 'Twip', ar: 'تويب', de: 'Twip', es: 'Twip', fr: 'Twip', it: 'Twip', ko: '트윕', pt: 'Twip', ru: 'Твип', zh: '缇', ja: 'ツイップ' },
    'Newton-meter': { en: 'Newton-meter', ar: 'نيوتن متر', de: 'Newtonmeter', es: 'Newton-metro', fr: 'Newton-mètre', it: 'Newton-metro', ko: '뉴턴미터', pt: 'Newton-metro', ru: 'Ньютон-метр', zh: '牛顿米', ja: 'ニュートンメートル' },
    'Newton-metre': { en: 'Newton-metre', ar: 'نيوتن متر', de: 'Newtonmeter', es: 'Newton-metro', fr: 'Newton-mètre', it: 'Newton-metro', ko: '뉴턴미터', pt: 'Newton-metro', ru: 'Ньютон-метр', zh: '牛顿米', ja: 'ニュートンメートル' },
    'Kilogram-meter': { en: 'Kilogram-meter', ar: 'كيلوغرام متر', de: 'Kilogramm-Meter', es: 'Kilogramo-metro', fr: 'Kilogramme-mètre', it: 'Chilogrammo-metro', ko: '킬로그램미터', pt: 'Quilograma-metro', ru: 'Килограмм-метр', zh: '千克米', ja: 'キログラムメートル' },
    'Inch-pound': { en: 'Inch-pound', ar: 'بوصة باوند', de: 'Zoll-Pfund', es: 'Pulgada-libra', fr: 'Pouce-livre', it: 'Pollice-libbra', ko: '인치파운드', pt: 'Polegada-libra', ru: 'Дюйм-фунт', zh: '英寸磅', ja: 'インチポンド' },
    'kg/m³': { en: 'kg/m³', ar: 'كغ/م³', de: 'kg/m³', es: 'kg/m³', fr: 'kg/m³', it: 'kg/m³', ko: 'kg/m³', pt: 'kg/m³', ru: 'кг/м³', zh: 'kg/m³', ja: 'kg/m³' },
    'g/cm³': { en: 'g/cm³', ar: 'غ/سم³', de: 'g/cm³', es: 'g/cm³', fr: 'g/cm³', it: 'g/cm³', ko: 'g/cm³', pt: 'g/cm³', ru: 'г/см³', zh: 'g/cm³', ja: 'g/cm³' },
    'lb/ft³': { en: 'lb/ft³', ar: 'رطل/قدم³', de: 'lb/ft³', es: 'lb/ft³', fr: 'lb/ft³', it: 'lb/ft³', ko: 'lb/ft³', pt: 'lb/ft³', ru: 'фунт/фут³', zh: 'lb/ft³', ja: 'lb/ft³' },
    'Liter/second': { en: 'Liter/second', ar: 'لتر/ثانية', de: 'Liter/Sekunde', es: 'Litro/segundo', fr: 'Litre/seconde', it: 'Litro/secondo', ko: '리터/초', pt: 'Litro/segundo', ru: 'Литр/секунда', zh: '升/秒', ja: 'リットル/秒' },
    'Liter/minute': { en: 'Liter/minute', ar: 'لتر/دقيقة', de: 'Liter/Minute', es: 'Litro/minuto', fr: 'Litre/minute', it: 'Litro/minuto', ko: '리터/분', pt: 'Litro/minuto', ru: 'Литр/минута', zh: '升/分', ja: 'リットル/分' },
    'Gallon/minute': { en: 'Gallon/minute', ar: 'جالون/دقيقة', de: 'Gallone/Minute', es: 'Galón/minuto', fr: 'Gallon/minute', it: 'Gallone/minuto', ko: '갤런/분', pt: 'Galão/minuto', ru: 'Галлон/минута', zh: '加仑/分', ja: 'ガロン/分' },
    'Cubic ft/minute': { en: 'Cubic ft/minute', ar: 'قدم³/دقيقة', de: 'Kubikfuß/Minute', es: 'Pie³/minuto', fr: 'Pied³/minute', it: 'Piede³/minuto', ko: '세제곱피트/분', pt: 'Pé³/minuto', ru: 'Кубический фут/мин', zh: '立方英尺/分', ja: '立方フィート/分' },
    'm³/s': { en: 'm³/s', ar: 'م³/ث', de: 'm³/s', es: 'm³/s', fr: 'm³/s', it: 'm³/s', ko: 'm³/s', pt: 'm³/s', ru: 'м³/с', zh: 'm³/s', ja: 'm³/s' },
    'Pascal-second': { en: 'Pascal-second', ar: 'باسكال ثانية', de: 'Pascal-Sekunde', es: 'Pascal-segundo', fr: 'Pascal-seconde', it: 'Pascal-secondo', ko: '파스칼초', pt: 'Pascal-segundo', ru: 'Паскаль-секунда', zh: '帕斯卡秒', ja: 'パスカル秒' },
    'Centipoise': { en: 'Centipoise', ar: 'سنتي بواز', de: 'Centipoise', es: 'Centipoise', fr: 'Centipoise', it: 'Centipoise', ko: '센티푸아즈', pt: 'Centipoise', ru: 'Сантипуаз', zh: '厘泊', ja: 'センチポアズ' },
    'Newton/meter': { en: 'Newton/meter', ar: 'نيوتن/متر', de: 'Newton/Meter', es: 'Newton/metro', fr: 'Newton/mètre', it: 'Newton/metro', ko: '뉴턴/미터', pt: 'Newton/metro', ru: 'Ньютон/метр', zh: '牛顿/米', ja: 'ニュートン/メートル' },
    'Newton/metre': { en: 'Newton/metre', ar: 'نيوتن/متر', de: 'Newton/Meter', es: 'Newton/metro', fr: 'Newton/mètre', it: 'Newton/metro', ko: '뉴턴/미터', pt: 'Newton/metro', ru: 'Ньютон/метр', zh: '牛顿/米', ja: 'ニュートン/メートル' },
    'Dyne/centimeter': { en: 'Dyne/centimeter', ar: 'داين/سنتيمتر', de: 'Dyn/Zentimeter', es: 'Dina/centímetro', fr: 'Dyne/centimètre', it: 'Dina/centimetro', ko: '다인/센티미터', pt: 'Dina/centímetro', ru: 'Дин/сантиметр', zh: '达因/厘米', ja: 'ダイン/センチメートル' },
    'kg⋅m²/s': { en: 'kg⋅m²/s', ar: 'كغ⋅م²/ث', de: 'kg⋅m²/s', es: 'kg⋅m²/s', fr: 'kg⋅m²/s', it: 'kg⋅m²/s', ko: 'kg⋅m²/s', pt: 'kg⋅m²/s', ru: 'кг⋅м²/с', zh: 'kg⋅m²/s', ja: 'kg⋅m²/s' },
    'Joule-second': { en: 'Joule-second', ar: 'جول ثانية', de: 'Joulesekunde', es: 'Julio-segundo', fr: 'Joule-seconde', it: 'Joule-secondo', ko: '줄초', pt: 'Joule-segundo', ru: 'Джоуль-секунда', zh: '焦耳秒', ja: 'ジュール秒' },
    'g⋅m²/s': { en: 'g⋅m²/s', ar: 'غ⋅م²/ث', de: 'g⋅m²/s', es: 'g⋅m²/s', fr: 'g⋅m²/s', it: 'g⋅m²/s', ko: 'g⋅m²/s', pt: 'g⋅m²/s', ru: 'г⋅м²/с', zh: 'g⋅m²/s', ja: 'g⋅m²/s' },
    'g⋅cm²/s': { en: 'g⋅cm²/s', ar: 'غ⋅سم²/ث', de: 'g⋅cm²/s', es: 'g⋅cm²/s', fr: 'g⋅cm²/s', it: 'g⋅cm²/s', ko: 'g⋅cm²/s', pt: 'g⋅cm²/s', ru: 'г⋅см²/с', zh: 'g⋅cm²/s', ja: 'g⋅cm²/s' },
    'lb⋅ft²/s': { en: 'lb⋅ft²/s', ar: 'رطل⋅قدم²/ث', de: 'lb⋅ft²/s', es: 'lb⋅ft²/s', fr: 'lb⋅ft²/s', it: 'lb⋅ft²/s', ko: 'lb⋅ft²/s', pt: 'lb⋅ft²/s', ru: 'фунт⋅фут²/с', zh: 'lb⋅ft²/s', ja: 'lb⋅ft²/s' },
    'slug⋅ft²/s': { en: 'slug⋅ft²/s', ar: 'سلغ⋅قدم²/ث', de: 'slug⋅ft²/s', es: 'slug⋅ft²/s', fr: 'slug⋅ft²/s', it: 'slug⋅ft²/s', ko: 'slug⋅ft²/s', pt: 'slug⋅ft²/s', ru: 'слаг⋅фут²/с', zh: 'slug⋅ft²/s', ja: 'slug⋅ft²/s' },
    'oz⋅in²/s': { en: 'oz⋅in²/s', ar: 'أونصة⋅بوصة²/ث', de: 'oz⋅in²/s', es: 'oz⋅in²/s', fr: 'oz⋅in²/s', it: 'oz⋅in²/s', ko: 'oz⋅in²/s', pt: 'oz⋅in²/s', ru: 'унция⋅дюйм²/с', zh: 'oz⋅in²/s', ja: 'oz⋅in²/s' },
    'Reduced Planck constant': { en: 'Reduced Planck constant', ar: 'ثابت بلانك المختزل', de: 'Reduziertes Plancksches Wirkungsquantum', es: 'Constante de Planck reducida', fr: 'Constante de Planck réduite', it: 'Costante di Planck ridotta', ko: '환원 플랑크 상수', pt: 'Constante de Planck reduzida', ru: 'Приведённая постоянная Планка', zh: '约化普朗克常数', ja: '換算プランク定数' },
    'LED Bulb (watts)': { en: 'LED Bulb (watts)', ar: 'مصباح LED (واط)', de: 'LED-Lampe (Watt)', es: 'Bombilla LED (vatios)', fr: 'Ampoule LED (watts)', it: 'Lampadina LED (watt)', ko: 'LED 전구 (와트)', pt: 'Lâmpada LED (watts)', ru: 'Светодиодная лампа (ватт)', zh: 'LED灯泡（瓦特）', ja: 'LED電球（ワット）' },
    'Fluorescent Bulb (watts)': { en: 'Fluorescent Bulb (watts)', ar: 'مصباح فلورسنت (واط)', de: 'Leuchtstofflampe (Watt)', es: 'Bombilla fluorescente (vatios)', fr: 'Ampoule fluorescente (watts)', it: 'Lampadina fluorescente (watt)', ko: '형광등 (와트)', pt: 'Lâmpada fluorescente (watts)', ru: 'Люминесцентная лампа (ватт)', zh: '荧光灯（瓦特）', ja: '蛍光灯（ワット）' },
    'Incandescent Bulb (watts)': { en: 'Incandescent Bulb (watts)', ar: 'مصباح متوهج (واط)', de: 'Glühlampe (Watt)', es: 'Bombilla incandescente (vatios)', fr: 'Ampoule à incandescence (watts)', it: 'Lampadina a incandescenza (watt)', ko: '백열등 (와트)', pt: 'Lâmpada incandescente (watts)', ru: 'Лампа накаливания (ватт)', zh: '白炽灯（瓦特）', ja: '白熱電球（ワット）' },
    'Halogen Bulb (watts)': { en: 'Halogen Bulb (watts)', ar: 'مصباح هالوجين (واط)', de: 'Halogenlampe (Watt)', es: 'Bombilla halógena (vatios)', fr: 'Ampoule halogène (watts)', it: 'Lampadina alogena (watt)', ko: '할로겐 전구 (와트)', pt: 'Lâmpada halógena (watts)', ru: 'Галогенная лампа (ватт)', zh: '卤素灯（瓦特）', ja: 'ハロゲン電球（ワット）' },
    'Sodium Vapor Lamp (watts)': { en: 'Sodium Vapor Lamp (watts)', ar: 'مصباح بخار الصوديوم (واط)', de: 'Natriumdampflampe (Watt)', es: 'Lámpara de vapor de sodio (vatios)', fr: 'Lampe à vapeur de sodium (watts)', it: 'Lampada a vapori di sodio (watt)', ko: '나트륨등 (와트)', pt: 'Lâmpada de vapor de sódio (watts)', ru: 'Натриевая лампа (ватт)', zh: '钠灯（瓦特）', ja: 'ナトリウム灯（ワット）' },
    'Sun (Japan)': { en: 'Sun (Japan)', ar: 'سون (اليابان)', de: 'Sun (Japan)', es: 'Sun (Japón)', fr: 'Sun (Japon)', it: 'Sun (Giappone)', ko: '촌 (일본)', pt: 'Sun (Japão)', ru: 'Сун (Япония)', zh: '寸（日本）', ja: '寸' },
    'Shaku (Japan)': { en: 'Shaku (Japan)', ar: 'شاكو (اليابان)', de: 'Shaku (Japan)', es: 'Shaku (Japón)', fr: 'Shaku (Japon)', it: 'Shaku (Giappone)', ko: '자 (일본)', pt: 'Shaku (Japão)', ru: 'Сяку (Япония)', zh: '尺（日本）', ja: '尺' },
    'Ken (Japan)': { en: 'Ken (Japan)', ar: 'كين (اليابان)', de: 'Ken (Japan)', es: 'Ken (Japón)', fr: 'Ken (Japon)', it: 'Ken (Giappone)', ko: '간 (일본)', pt: 'Ken (Japão)', ru: 'Кэн (Япония)', zh: '间（日本）', ja: '間' },
    'Jō (Japan)': { en: 'Jō (Japan)', ar: 'جو (اليابان)', de: 'Jō (Japan)', es: 'Jō (Japón)', fr: 'Jō (Japon)', it: 'Jō (Giappone)', ko: '장 (일본)', pt: 'Jō (Japão)', ru: 'Дзё (Япония)', zh: '丈（日本）', ja: '丈' },
    'Ri (Japan)': { en: 'Ri (Japan)', ar: 'ري (اليابان)', de: 'Ri (Japan)', es: 'Ri (Japón)', fr: 'Ri (Japon)', it: 'Ri (Giappone)', ko: '리 (일본)', pt: 'Ri (Japão)', ru: 'Ри (Япония)', zh: '里（日本）', ja: '里' },
    'Fun (Japan)': { en: 'Fun (Japan)', ar: 'فن (اليابان)', de: 'Fun (Japan)', es: 'Fun (Japón)', fr: 'Fun (Japon)', it: 'Fun (Giappone)', ko: '푼 (일본)', pt: 'Fun (Japão)', ru: 'Фун (Япония)', zh: '分（日本）', ja: '分' },
    'Momme (Japan)': { en: 'Momme (Japan)', ar: 'مومي (اليابان)', de: 'Momme (Japan)', es: 'Momme (Japón)', fr: 'Momme (Japon)', it: 'Momme (Giappone)', ko: '몸메 (일본)', pt: 'Momme (Japão)', ru: 'Моммэ (Япония)', zh: '匁（日本）', ja: '匁' },
    'Ryō (Japan)': { en: 'Ryō (Japan)', ar: 'ريو (اليابان)', de: 'Ryō (Japan)', es: 'Ryō (Japón)', fr: 'Ryō (Japon)', it: 'Ryō (Giappone)', ko: '료 (일본)', pt: 'Ryō (Japão)', ru: 'Рё (Япония)', zh: '两（日本）', ja: '両' },
    'Kan (Japan)': { en: 'Kan (Japan)', ar: 'كان (اليابان)', de: 'Kan (Japan)', es: 'Kan (Japón)', fr: 'Kan (Japon)', it: 'Kan (Giappone)', ko: '관 (일본)', pt: 'Kan (Japão)', ru: 'Кан (Япония)', zh: '贯（日本）', ja: '貫' },
    'Go (Japan)': { en: 'Go (Japan)', ar: 'غو (اليابان)', de: 'Go (Japan)', es: 'Go (Japón)', fr: 'Go (Japon)', it: 'Go (Giappone)', ko: '합 (일본)', pt: 'Go (Japão)', ru: 'Го (Япония)', zh: '合（日本）', ja: '合' },
    'Sho (Japan)': { en: 'Shō (Japan)', ar: 'شو (اليابان)', de: 'Shō (Japan)', es: 'Shō (Japón)', fr: 'Shō (Japon)', it: 'Shō (Giappone)', ko: '승 (일본)', pt: 'Shō (Japão)', ru: 'Сё (Япония)', zh: '升（日本）', ja: '升' },
    'To (Japan)': { en: 'To (Japan)', ar: 'تو (اليابان)', de: 'To (Japan)', es: 'To (Japón)', fr: 'To (Japon)', it: 'To (Giappone)', ko: '두 (일본)', pt: 'To (Japão)', ru: 'То (Япония)', zh: '斗（日本）', ja: '斗' },
    'Koku (Japan)': { en: 'Koku (Japan)', ar: 'كوكو (اليابان)', de: 'Koku (Japan)', es: 'Koku (Japón)', fr: 'Koku (Japon)', it: 'Koku (Giappone)', ko: '석 (일본)', pt: 'Koku (Japão)', ru: 'Коку (Япония)', zh: '石（日本）', ja: '石' },
    'Tsubo (Japan)': { en: 'Tsubo (Japan)', ar: 'تسوبو (اليابان)', de: 'Tsubo (Japan)', es: 'Tsubo (Japón)', fr: 'Tsubo (Japon)', it: 'Tsubo (Giappone)', ko: '평 (일본)', pt: 'Tsubo (Japão)', ru: 'Цубо (Япония)', zh: '坪（日本）', ja: '坪' },
    'Tan (Japan)': { en: 'Tan (Japan)', ar: 'تان (اليابان)', de: 'Tan (Japan)', es: 'Tan (Japón)', fr: 'Tan (Japon)', it: 'Tan (Giappone)', ko: '단 (일본)', pt: 'Tan (Japão)', ru: 'Тан (Япония)', zh: '反（日本）', ja: '反' },
    'Chō (Japan)': { en: 'Chō (Japan)', ar: 'تشو (اليابان)', de: 'Chō (Japan)', es: 'Chō (Japón)', fr: 'Chō (Japon)', it: 'Chō (Giappone)', ko: '정 (일본)', pt: 'Chō (Japão)', ru: 'Тё (Япония)', zh: '町（日本）', ja: '町' },
    'Jō/Tatami (Japan)': { en: 'Jō/Tatami (Japan)', ar: 'تاتامي (اليابان)', de: 'Tatami (Japan)', es: 'Tatami (Japón)', fr: 'Tatami (Japon)', it: 'Tatami (Giappone)', ko: '다다미 (일본)', pt: 'Tatami (Japão)', ru: 'Татами (Япония)', zh: '畳（日本）', ja: '畳' },
    'Danchi-ma (Japan)': { en: 'Danchi-ma (Japan)', ar: 'دانتشي-ما (اليابان)', de: 'Danchi-ma (Japan)', es: 'Danchi-ma (Japón)', fr: 'Danchi-ma (Japon)', it: 'Danchi-ma (Giappone)', ko: '단치마 (일본)', pt: 'Danchi-ma (Japão)', ru: 'Данти-ма (Япония)', zh: '团地间（日本）', ja: '団地間' },
    'Edoma/Kantō-ma (Japan)': { en: 'Edoma/Kantō-ma (Japan)', ar: 'إيدوما (اليابان)', de: 'Edoma (Japan)', es: 'Edoma (Japón)', fr: 'Edoma (Japon)', it: 'Edoma (Giappone)', ko: '에도마 (일본)', pt: 'Edoma (Japão)', ru: 'Эдома (Япония)', zh: '江户间（日本）', ja: '江戸間' },
    'Chūkyō-ma (Japan)': { en: 'Chūkyō-ma (Japan)', ar: 'تشوكيو-ما (اليابان)', de: 'Chūkyō-ma (Japan)', es: 'Chūkyō-ma (Japón)', fr: 'Chūkyō-ma (Japon)', it: 'Chūkyō-ma (Giappone)', ko: '추쿄마 (일본)', pt: 'Chūkyō-ma (Japão)', ru: 'Тюкё-ма (Япония)', zh: '中京间（日本）', ja: '中京間' },
    'Kyōma (Japan)': { en: 'Kyōma (Japan)', ar: 'كيوما (اليابان)', de: 'Kyōma (Japan)', es: 'Kyōma (Japón)', fr: 'Kyōma (Japon)', it: 'Kyōma (Giappone)', ko: '교마 (일본)', pt: 'Kyōma (Japão)', ru: 'Кёма (Япония)', zh: '京间（日本）', ja: '京間' },
    'Cun (China)': { en: 'Cun (China)', ar: 'تسون (الصين)', de: 'Cun (China)', es: 'Cun (China)', fr: 'Cun (Chine)', it: 'Cun (Cina)', ko: '촌 (중국)', pt: 'Cun (China)', ru: 'Цунь (Китай)', zh: '寸', ja: '寸（中国）' },
    'Chi (China)': { en: 'Chi (China)', ar: 'تشي (الصين)', de: 'Chi (China)', es: 'Chi (China)', fr: 'Chi (Chine)', it: 'Chi (Cina)', ko: '척 (중국)', pt: 'Chi (China)', ru: 'Чи (Китай)', zh: '尺', ja: '尺（中国）' },
    'Zhang (China)': { en: 'Zhang (China)', ar: 'تشانغ (الصين)', de: 'Zhang (China)', es: 'Zhang (China)', fr: 'Zhang (Chine)', it: 'Zhang (Cina)', ko: '장 (중국)', pt: 'Zhang (China)', ru: 'Чжан (Китай)', zh: '丈', ja: '丈（中国）' },
    'Li (China)': { en: 'Li (China)', ar: 'لي (الصين)', de: 'Li (China)', es: 'Li (China)', fr: 'Li (Chine)', it: 'Li (Cina)', ko: '리 (중국)', pt: 'Li (China)', ru: 'Ли (Китай)', zh: '里', ja: '里（中国）' },
    'Mace (China, PRC)': { en: 'Mace (China, PRC)', ar: 'ميس (الصين)', de: 'Mace (China)', es: 'Mace (China)', fr: 'Mace (Chine)', it: 'Mace (Cina)', ko: '전 (중국)', pt: 'Mace (China)', ru: 'Мэйс (Китай)', zh: '钱', ja: '銭（中国）' },
    'Tael (China, PRC)': { en: 'Tael (China, PRC)', ar: 'تايل (الصين)', de: 'Tael (China)', es: 'Tael (China)', fr: 'Tael (Chine)', it: 'Tael (Cina)', ko: '냥 (중국)', pt: 'Tael (China)', ru: 'Лян (Китай)', zh: '两', ja: '両（中国）' },
    'Jin (China, PRC)': { en: 'Jin (China, PRC)', ar: 'جين (الصين)', de: 'Jin (China)', es: 'Jin (China)', fr: 'Jin (Chine)', it: 'Jin (Cina)', ko: '근 (중국)', pt: 'Jin (China)', ru: 'Цзинь (Китай)', zh: '斤', ja: '斤（中国）' },
    'Dan (China, PRC)': { en: 'Dan (China, PRC)', ar: 'دان (الصين)', de: 'Dan (China)', es: 'Dan (China)', fr: 'Dan (Chine)', it: 'Dan (Cina)', ko: '담 (중국)', pt: 'Dan (China)', ru: 'Дань (Китай)', zh: '担', ja: '担（中国）' },
    'Sheng (China)': { en: 'Sheng (China)', ar: 'شينغ (الصين)', de: 'Sheng (China)', es: 'Sheng (China)', fr: 'Sheng (Chine)', it: 'Sheng (Cina)', ko: '승 (중국)', pt: 'Sheng (China)', ru: 'Шэн (Китай)', zh: '升', ja: '升（中国）' },
    'Dou (China)': { en: 'Dou (China)', ar: 'دو (الصين)', de: 'Dou (China)', es: 'Dou (China)', fr: 'Dou (Chine)', it: 'Dou (Cina)', ko: '두 (중국)', pt: 'Dou (China)', ru: 'Доу (Китай)', zh: '斗', ja: '斗（中国）' },
    'Dan (China volume)': { en: 'Dan (China volume)', ar: 'دان (حجم الصين)', de: 'Dan (China Volumen)', es: 'Dan (China volumen)', fr: 'Dan (Chine volume)', it: 'Dan (Cina volume)', ko: '석 (중국)', pt: 'Dan (China volume)', ru: 'Дань (Китай объём)', zh: '石', ja: '石（中国）' },
    'Mu (China)': { en: 'Mu (China)', ar: 'مو (الصين)', de: 'Mu (China)', es: 'Mu (China)', fr: 'Mu (Chine)', it: 'Mu (Cina)', ko: '무 (중국)', pt: 'Mu (China)', ru: 'Му (Китай)', zh: '亩', ja: '畝（中国）' },
    'Qing (China)': { en: 'Qing (China)', ar: 'تشينغ (الصين)', de: 'Qing (China)', es: 'Qing (China)', fr: 'Qing (Chine)', it: 'Qing (Cina)', ko: '경 (중국)', pt: 'Qing (China)', ru: 'Цин (Китай)', zh: '顷', ja: '頃（中国）' },
    'Ja (Korea)': { en: 'Ja (Korea)', ar: 'جا (كوريا)', de: 'Ja (Korea)', es: 'Ja (Corea)', fr: 'Ja (Corée)', it: 'Ja (Corea)', ko: '자', pt: 'Ja (Coreia)', ru: 'Чжа (Корея)', zh: '자（韩国）', ja: '尺（韓国）' },
    'Ri (Korea)': { en: 'Ri (Korea)', ar: 'ري (كوريا)', de: 'Ri (Korea)', es: 'Ri (Corea)', fr: 'Ri (Corée)', it: 'Ri (Corea)', ko: '리', pt: 'Ri (Coreia)', ru: 'Ри (Корея)', zh: '리（韩国）', ja: '里（韓国）' },
    'Don (Korea)': { en: 'Don (Korea)', ar: 'دون (كوريا)', de: 'Don (Korea)', es: 'Don (Corea)', fr: 'Don (Corée)', it: 'Don (Corea)', ko: '돈', pt: 'Don (Coreia)', ru: 'Дон (Корея)', zh: '돈（韩国）', ja: '銭（韓国）' },
    'Geun (Korea)': { en: 'Geun (Korea)', ar: 'جون (كوريا)', de: 'Geun (Korea)', es: 'Geun (Corea)', fr: 'Geun (Corée)', it: 'Geun (Corea)', ko: '근', pt: 'Geun (Coreia)', ru: 'Кын (Корея)', zh: '근（韩国）', ja: '斤（韓国）' },
    'Hop (Korea)': { en: 'Hop (Korea)', ar: 'هوب (كوريا)', de: 'Hop (Korea)', es: 'Hop (Corea)', fr: 'Hop (Corée)', it: 'Hop (Corea)', ko: '홉', pt: 'Hop (Coreia)', ru: 'Хоп (Корея)', zh: '홉（韩国）', ja: '合（韓国）' },
    'Doe (Korea)': { en: 'Doe (Korea)', ar: 'دو (كوريا)', de: 'Doe (Korea)', es: 'Doe (Corea)', fr: 'Doe (Corée)', it: 'Doe (Corea)', ko: '되', pt: 'Doe (Coreia)', ru: 'Дой (Корея)', zh: '되（韩国）', ja: '升（韓国）' },
    'Mal (Korea)': { en: 'Mal (Korea)', ar: 'مال (كوريا)', de: 'Mal (Korea)', es: 'Mal (Corea)', fr: 'Mal (Corée)', it: 'Mal (Corea)', ko: '말', pt: 'Mal (Coreia)', ru: 'Маль (Корея)', zh: '말（韩国）', ja: '斗（韓国）' },
    'Pyeong (Korea)': { en: 'Pyeong (Korea)', ar: 'بيونغ (كوريا)', de: 'Pyeong (Korea)', es: 'Pyeong (Corea)', fr: 'Pyeong (Corée)', it: 'Pyeong (Corea)', ko: '평', pt: 'Pyeong (Coreia)', ru: 'Пхён (Корея)', zh: '평（韩国）', ja: '坪（韓国）' },
    'Se (Korea)': { en: 'Se (Korea)', ar: 'سي (كوريا)', de: 'Se (Korea)', es: 'Se (Corea)', fr: 'Se (Corée)', it: 'Se (Corea)', ko: '세', pt: 'Se (Coreia)', ru: 'Се (Корея)', zh: '세（韩国）', ja: '畝（韓国）' },
  };

  // Helper: Get translation from a translation record
  const getTranslationFromRecord = (trans: Translation, lang: SupportedLanguage): string | undefined => {
    if (lang === 'en' || lang === 'en-us') return trans.en;
    const langValue = trans[lang as keyof Translation];
    return langValue as string | undefined;
  };

  // Helper: Get translated text - uses language dropdown
  // Translates ALL labels: UI labels, category names, quantity names, and unit names
  // NOTE: Symbols (m, ft, kg) and prefixes (k, M, G) are NEVER translated - they always remain in Latin/ISO SI
  const t = (key: string): string => {
    // Check UI_TRANSLATIONS from localization.ts first
    if (UI_TRANSLATIONS[key]) {
      const result = getTranslationFromRecord(UI_TRANSLATIONS[key], language);
      if (result) return result;
      return UI_TRANSLATIONS[key].en || key;
    }
    // Fall back to component-local TRANSLATIONS
    if (TRANSLATIONS[key]) {
      const trans = TRANSLATIONS[key];
      if ((language === 'en' || language === 'en-us') && trans.en) return trans.en;
      if (language === 'de' && trans.de) return trans.de;
      if (language === 'es' && trans.es) return trans.es;
      if (language === 'fr' && trans.fr) return trans.fr;
      if (language === 'it' && trans.it) return trans.it;
      if (language === 'pt' && trans.pt) return trans.pt;
      if (language === 'ko' && trans.ko) return trans.ko;
      if (language === 'ru' && trans.ru) return trans.ru;
      if (language === 'zh' && trans.zh) return trans.zh;
      if (language === 'ja' && trans.ja) return trans.ja;
      if (language === 'ar' && trans.ar) return trans.ar;
      return trans.en || key;
    }
    return key;
  };

  // Helper: Translate unit names while keeping symbols in Latin
  // Unit NAMES are translated (e.g., "Meter" → "Metro" in Spanish), but unit SYMBOLS remain Latin (e.g., "m" stays "m")
  const translateUnitName = (unitName: string): string => {
    // First try to get translation using t() function (for UI and category translations)
    const translated = t(unitName);
    // If translation found (different from key), use it
    if (translated !== unitName) {
      return translated;
    }
    
    // Then check UNIT_NAME_TRANSLATIONS from localization.ts (for all unit names including math functions)
    if (UNIT_NAME_TRANSLATIONS[unitName]) {
      const trans = UNIT_NAME_TRANSLATIONS[unitName];
      const langKey = language as SupportedLanguage;
      if (langKey === 'en' || langKey === 'en-us') {
        return trans.en || unitName;
      }
      // Check for translation in selected language
      const langValue = trans[langKey as keyof typeof trans];
      if (langValue) return langValue as string;
      // Fall back to English
      return trans.en || unitName;
    }
    
    // Otherwise, apply regional spelling variations (meter vs metre) for English variations
    return applyRegionalSpelling(unitName);
  };

  // Auto-set language to Arabic when Arabic number formats are selected
  React.useEffect(() => {
    if (numberFormat === 'arabic') {
      setLanguage('ar');
    }
  }, [numberFormat]);

  const CATEGORY_GROUPS = [
    {
      name: "Base Quantities",
      categories: ['length', 'mass', 'time', 'current', 'temperature', 'amount', 'intensity']
    },
    {
      name: "Mechanics",
      categories: ['area', 'volume', 'speed', 'acceleration', 'force', 'pressure', 'energy', 'power', 'torque', 'flow', 'density', 'viscosity', 'kinematic_viscosity', 'surface_tension', 'frequency', 'angular_velocity', 'momentum', 'angular_momentum']
    },
    {
      name: "Thermodynamics & Chemistry",
      categories: ['thermal_conductivity', 'specific_heat', 'entropy', 'concentration']
    },
    {
      name: "Electricity & Magnetism",
      categories: ['charge', 'potential', 'capacitance', 'resistance', 'conductance', 'inductance', 'magnetic_flux', 'magnetic_density', 'electric_field', 'magnetic_field_h']
    },
    {
      name: "Radiation & Physics",
      categories: ['radioactivity', 'radiation_dose', 'equivalent_dose', 'radioactive_decay', 'cross_section', 'photon', 'catalytic', 'angle', 'solid_angle', 'sound_pressure', 'sound_intensity', 'acoustic_impedance']
    },
    {
      name: "Human Response",
      categories: ['luminous_flux', 'illuminance', 'refractive_power']
    },
    {
      name: "Other",
      categories: ['math', 'data', 'fuel', 'fuel_economy', 'rack_geometry', 'shipping', 'beer_wine_volume', 'lightbulb']
    },
    {
      name: "Archaic & Regional",
      categories: ['archaic_length', 'archaic_mass', 'archaic_volume', 'archaic_area', 'archaic_energy', 'archaic_power']
    }
  ];

  const categoryData = CONVERSION_DATA.find(c => c.id === activeCategory)!;
  
  const filteredUnits = getFilteredSortedUnits(activeCategory);
  
  // For Math category, the "to" dropdown should only show "Number"
  const toFilteredUnits = activeCategory === 'math' 
    ? filteredUnits.filter(u => u.id === 'num')
    : filteredUnits;

  // Reset units when category changes
  useEffect(() => {
    const sorted = getFilteredSortedUnits(activeCategory);
    if (sorted.length > 0) {
      // Special case: temperature defaults to Kelvin
      if (activeCategory === 'temperature') {
        setFromUnit('k');
        setToUnit('k');
      } else if (activeCategory === 'capacitance') {
        // Capacitance defaults to Farad
        setFromUnit('f');
        setToUnit('f');
      } else if (activeCategory === 'math') {
        // Math category: from defaults to Number, to always Number
        setFromUnit('num');
        setToUnit('num');
      } else {
        // Default to first unit in sorted list (SI units are sorted first)
        setFromUnit(sorted[0].id);
        setToUnit(sorted[0].id);
      }
      setFromPrefix('none');
      setToPrefix('none');
    }
  }, [activeCategory]);

  // Focus input field on mount and keep it focused
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Smart paste handler - parses pasted text into number and unit
  // Only triggers when NOT focused on input/textarea - allows standard paste to work normally
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Get the active element
      const activeElement = document.activeElement as HTMLElement;
      const activeTagName = activeElement?.tagName?.toLowerCase();
      
      // Allow standard paste when focused on input/textarea or contenteditable
      // Do NOT call preventDefault - let browser handle it normally
      if (activeTagName === 'input' || activeTagName === 'textarea' || activeElement?.isContentEditable) {
        return; // Exit early - standard paste will proceed
      }
      
      // Get pasted text for smart parsing (only when not in input fields)
      const pastedText = e.clipboardData?.getData('text');
      if (!pastedText) return;
      
      // Parse the unit text
      const parsed = parseUnitText(pastedText);
      
      // Route based on active tab
      if (activeTab === 'converter') {
        // Converter tab: set from value and optionally switch to matched category/unit
        // Use originalValue to show the user's input as-is with the matched unit
        if (parsed.categoryId && parsed.unitId) {
          setActiveCategory(parsed.categoryId);
          setFromUnit(parsed.unitId);
          setFromPrefix(parsed.prefixId);
        }
        setInputValue(parsed.originalValue.toString());
      } else if (activeTab === 'custom') {
        // Custom tab: set value field and update dimension grid based on parsed dimensions
        setDirectValue(parsed.value.toString());
        
        // Map dimensional formula to exponent grid
        const newExponents: Record<string, number> = {
          m: 0, kg: 0, s: 0, A: 0, K: 0, mol: 0, cd: 0, rad: 0, sr: 0
        };
        
        if (parsed.dimensions.length) newExponents.m = parsed.dimensions.length;
        if (parsed.dimensions.mass) newExponents.kg = parsed.dimensions.mass;
        if (parsed.dimensions.time) newExponents.s = parsed.dimensions.time;
        if (parsed.dimensions.current) newExponents.A = parsed.dimensions.current;
        if (parsed.dimensions.temperature) newExponents.K = parsed.dimensions.temperature;
        if (parsed.dimensions.amount) newExponents.mol = parsed.dimensions.amount;
        if (parsed.dimensions.intensity) newExponents.cd = parsed.dimensions.intensity;
        if (parsed.dimensions.angle) newExponents.rad = parsed.dimensions.angle;
        if (parsed.dimensions.solid_angle) newExponents.sr = parsed.dimensions.solid_angle;
        
        // Check if any exponent is outside -5..5 range - if so, clear the grid
        const hasOutOfRange = Object.values(newExponents).some(exp => exp < -5 || exp > 5);
        if (hasOutOfRange) {
          // Keep value but clear the dimension grid
          setDirectExponents({ m: 0, kg: 0, s: 0, A: 0, K: 0, mol: 0, cd: 0, rad: 0, sr: 0 });
        } else {
          setDirectExponents(newExponents);
        }
      }
      
      // Prevent default only when we handled smart paste (not in input fields)
      e.preventDefault();
    };
    
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [activeTab]);

  // Refocus input after interactions
  const refocusInput = () => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const fromUnitData = categoryData.units.find(u => u.id === fromUnit);
  const toUnitData = categoryData.units.find(u => u.id === toUnit);
  const fromPrefixData = PREFIXES.find(p => p.id === fromPrefix) || PREFIXES.find(p => p.id === 'none') || PREFIXES[0];
  const toPrefixData = PREFIXES.find(p => p.id === toPrefix) || PREFIXES.find(p => p.id === 'none') || PREFIXES[0];

  // Keyboard copy handler - prioritizes calculator result over converter/custom result
  useEffect(() => {
    const handleKeyboardCopy = (e: KeyboardEvent) => {
      // Only handle Ctrl+C or Cmd+C
      if (!((e.ctrlKey || e.metaKey) && e.key === 'c')) return;
      
      // Allow standard copy when text is selected or in input fields
      const activeElement = document.activeElement as HTMLElement;
      const activeTagName = activeElement?.tagName?.toLowerCase();
      const selection = window.getSelection();
      
      if (activeTagName === 'input' || activeTagName === 'textarea' || activeElement?.isContentEditable) {
        return; // Let browser handle standard copy
      }
      
      if (selection && selection.toString().trim()) {
        return; // Let browser handle text selection copy
      }
      
      // Priority 1: Copy from calculator (RPN x or simple result)
      if (calculatorMode === 'rpn' && rpnStack[3]) {
        // Copy RPN x value - use same logic as getRpnResultDisplay to respect selected alternative
        const val = rpnStack[3];
        const siReps = generateSIRepresentations(val.dimensions);
        const currentSymbol = siReps[rpnSelectedAlternative]?.displaySymbol || formatDimensions(val.dimensions);
        const kgResult = applyPrefixToKgUnit(currentSymbol, rpnResultPrefix);
        const displayValue = val.value / kgResult.effectivePrefixFactor;
        const formattedValue = formatNumberWithSeparators(displayValue, calculatorPrecision);
        const cleanValue = formattedValue.replace(/,/g, '');
        const prefixData = PREFIXES.find(p => p.id === rpnResultPrefix);
        const prefixSymbol = kgResult.showPrefix && prefixData ? prefixData.symbol : '';
        const unitSymbol = prefixSymbol + kgResult.displaySymbol;
        const textToCopy = unitSymbol ? `${cleanValue} ${unitSymbol}` : cleanValue;
        
        navigator.clipboard.writeText(textToCopy);
        triggerFlashRpnResult();
        e.preventDefault();
        return;
      }
      
      if (calculatorMode === 'simple' && calcValues[3]) {
        // Copy simple calculator result - use same logic as getCalcResultDisplay to respect selected alternative
        const val = calcValues[3];
        const siReps = generateSIRepresentations(val.dimensions);
        const currentSymbol = siReps[selectedAlternative]?.displaySymbol || formatDimensions(val.dimensions);
        const kgResult = applyPrefixToKgUnit(currentSymbol, resultPrefix);
        const displayValue = val.value / kgResult.effectivePrefixFactor;
        const formattedValue = formatNumberWithSeparators(displayValue, calculatorPrecision);
        const prefixData = PREFIXES.find(p => p.id === resultPrefix);
        const prefixSymbol = kgResult.showPrefix && prefixData ? prefixData.symbol : '';
        const unitSymbol = prefixSymbol + kgResult.displaySymbol;
        const textToCopy = unitSymbol ? `${formattedValue} ${unitSymbol}` : formattedValue;
        
        navigator.clipboard.writeText(textToCopy);
        triggerFlashCopyCalc();
        e.preventDefault();
        return;
      }
      
      // Priority 2: Fall back to converter result
      if (activeTab === 'converter' && result !== null && toUnitData) {
        const unitSymbol = toUnitData?.symbol || '';
        const prefixSymbol = (toUnitData?.allowPrefixes && toPrefixData?.id !== 'none') ? toPrefixData.symbol : '';
        const textToCopy = `${formatForClipboard(result, precision)} ${prefixSymbol}${unitSymbol}`;
        
        navigator.clipboard.writeText(textToCopy);
        triggerFlashCopyResult();
        e.preventDefault();
        return;
      }
      
      // Priority 3: Custom tab direct value (if applicable)
      if (activeTab === 'custom' && directValue) {
        const textToCopy = directValue;
        navigator.clipboard.writeText(textToCopy);
        e.preventDefault();
        return;
      }
    };
    
    document.addEventListener('keydown', handleKeyboardCopy);
    return () => document.removeEventListener('keydown', handleKeyboardCopy);
  }, [calculatorMode, rpnStack, calcValues, rpnResultPrefix, rpnSelectedAlternative, resultPrefix, selectedAlternative, calculatorPrecision, activeTab, result, toUnitData, toPrefixData, precision, directValue]);

  // Helper: Map category to dimensional formula
  const getCategoryDimensions = (category: UnitCategory): DimensionalFormula => {
    const dimensionMap: Record<UnitCategory, DimensionalFormula> = {
      length: { length: 1 },
      mass: { mass: 1 },
      time: { time: 1 },
      current: { current: 1 },
      temperature: { temperature: 1 },
      amount: { amount: 1 },
      intensity: { intensity: 1 },
      area: { length: 2 },
      volume: { length: 3 },
      speed: { length: 1, time: -1 },
      acceleration: { length: 1, time: -2 },
      force: { mass: 1, length: 1, time: -2 },
      pressure: { mass: 1, length: -1, time: -2 },
      energy: { mass: 1, length: 2, time: -2 },
      power: { mass: 1, length: 2, time: -3 },
      frequency: { time: -1 },
      charge: { current: 1, time: 1 },
      potential: { mass: 1, length: 2, time: -3, current: -1 },
      capacitance: { mass: -1, length: -2, time: 4, current: 2 },
      resistance: { mass: 1, length: 2, time: -3, current: -2 },
      conductance: { mass: -1, length: -2, time: 3, current: 2 },
      inductance: { mass: 1, length: 2, time: -2, current: -2 },
      magnetic_flux: { mass: 1, length: 2, time: -2, current: -1 },
      magnetic_density: { mass: 1, time: -2, current: -1 },
      radioactivity: { time: -1 },
      radiation_dose: { length: 2, time: -2 },
      equivalent_dose: { length: 2, time: -2 },
      catalytic: { amount: 1, time: -1 },
      angle: { angle: 1 },
      solid_angle: { solid_angle: 1 },
      angular_velocity: { angle: 1, time: -1 },
      momentum: { mass: 1, length: 1, time: -1 },
      angular_momentum: { mass: 1, length: 2, time: -1 },
      luminous_flux: { intensity: 1, solid_angle: 1 },
      illuminance: { intensity: 1, solid_angle: 1, length: -2 },
      luminous_exitance: { intensity: 1, solid_angle: 1, length: -2 },
      luminance: { intensity: 1, length: -2 },
      torque: { mass: 1, length: 2, time: -2 },
      density: { mass: 1, length: -3 },
      flow: { length: 3, time: -1 },
      viscosity: { mass: 1, length: -1, time: -1 },
      surface_tension: { mass: 1, time: -2 },
      thermal_conductivity: { mass: 1, length: 1, time: -3, temperature: -1 },
      specific_heat: { length: 2, time: -2, temperature: -1 },
      entropy: { mass: 1, length: 2, time: -2, temperature: -1 },
      concentration: { amount: 1, length: -3 },
      data: {},
      rack_geometry: { length: 1 },
      shipping: { length: 1 },
      beer_wine_volume: { length: 3 },
      math: {},
      refractive_power: { length: -1 },
      sound_pressure: { mass: 1, length: -1, time: -2 },
      fuel_economy: { length: -2 },
      lightbulb: { intensity: 1, solid_angle: 1 },
      photon: { mass: 1, length: 2, time: -2 },  // Energy dimensions (eV is base unit)
      radioactive_decay: { time: -1 },  // Decay constant λ has dimensions of 1/time
      cross_section: { length: 2 },  // Area (barn = 10^-28 m²)
      kinematic_viscosity: { length: 2, time: -1 },  // m²/s
      electric_field: { mass: 1, length: 1, time: -3, current: -1 },  // V/m = kg⋅m⋅s⁻³⋅A⁻¹
      magnetic_field_h: { current: 1, length: -1 },  // A/m
      sound_intensity: { mass: 1, time: -3 },  // W/m² = kg⋅s⁻³
      acoustic_impedance: { mass: 1, length: -2, time: -1 },  // Pa⋅s/m = kg⋅m⁻²⋅s⁻¹
      fuel: { mass: 1, length: 2, time: -2 },  // Energy (J) = kg⋅m²⋅s⁻²
      archaic_length: { length: 1 },
      archaic_mass: { mass: 1 },
      archaic_volume: { length: 3 },
      archaic_area: { length: 2 },
      archaic_energy: { mass: 1, length: 2, time: -2 },
      archaic_power: { mass: 1, length: 2, time: -3 },
      typography: { length: 1 },  // Length-based (points, picas, etc.)
      cooking: { length: 3 }  // Volume-based (mL, cups, etc.)
    };
    return dimensionMap[category] || {};
  };

  // Helper: Convert from SI base unit to category base unit
  const siToCategoryBase = (value: number, category: UnitCategory): number => {
    const cat = CONVERSION_DATA.find(c => c.id === category);
    if (!cat) return value;
    
    // Find the SI base unit (unit with symbol matching baseSISymbol)
    const siBaseUnit = cat.units.find(u => u.symbol === cat.baseSISymbol);
    if (!siBaseUnit) return value;
    
    // Convert: value is in SI base, multiply by SI unit's factor to get category base
    return value * siBaseUnit.factor;
  };

  // Helper: Convert from category base unit to SI base unit
  const categoryToSIBase = (value: number, category: UnitCategory): number => {
    const cat = CONVERSION_DATA.find(c => c.id === category);
    if (!cat) return value;
    
    // Find the SI base unit (unit with symbol matching baseSISymbol)
    const siBaseUnit = cat.units.find(u => u.symbol === cat.baseSISymbol);
    if (!siBaseUnit) return value;
    
    // Convert: value is in category base, divide by SI unit's factor to get SI base
    return value / siBaseUnit.factor;
  };

  // Alias for backward compatibility with factorization code
  const dimensionsToSymbol = formatDimensions;


  // Helper: Get derived unit symbol from dimensions (for exact matches only)
  const getDerivedUnit = (dims: DimensionalFormula): string => {
    const dimsStr = JSON.stringify(dims);
    
    const derivedUnits: Record<string, string> = {
      // Base units
      [JSON.stringify({ length: 1 })]: 'm',
      [JSON.stringify({ mass: 1 })]: 'kg',
      [JSON.stringify({ time: 1 })]: 's',
      [JSON.stringify({ current: 1 })]: 'A',
      [JSON.stringify({ temperature: 1 })]: 'K',
      [JSON.stringify({ amount: 1 })]: 'mol',
      [JSON.stringify({ intensity: 1 })]: 'cd',
      [JSON.stringify({ angle: 1 })]: 'rad',
      [JSON.stringify({ solid_angle: 1 })]: 'sr',
      // Derived units
      [JSON.stringify({ length: 2 })]: 'm²',
      [JSON.stringify({ length: 3 })]: 'm³',
      [JSON.stringify({ time: -1 })]: 's⁻¹',
      [JSON.stringify({ length: 1, time: -1 })]: 'm/s',
      [JSON.stringify({ length: 1, time: -2 })]: 'm/s²',
      [JSON.stringify({ mass: 1, length: 1, time: -2 })]: 'N',
      [JSON.stringify({ mass: 1, length: -1, time: -2 })]: 'Pa',
      [JSON.stringify({ mass: 1, length: 2, time: -2 })]: 'J',
      [JSON.stringify({ mass: 1, length: 2, time: -3 })]: 'W',
      [JSON.stringify({ current: 1, time: 1 })]: 'C',
      [JSON.stringify({ mass: 1, length: 2, time: -3, current: -1 })]: 'V',
      [JSON.stringify({ mass: -1, length: -2, time: 4, current: 2 })]: 'F',
      [JSON.stringify({ mass: 1, length: 2, time: -3, current: -2 })]: 'Ω',
      [JSON.stringify({ mass: -1, length: -2, time: 3, current: 2 })]: 'S',
      [JSON.stringify({ mass: 1, length: 2, time: -2, current: -2 })]: 'H',
      [JSON.stringify({ mass: 1, length: 2, time: -2, current: -1 })]: 'Wb',
      [JSON.stringify({ mass: 1, time: -2, current: -1 })]: 'T',
      [JSON.stringify({ intensity: 1, solid_angle: 1, length: -2 })]: 'lx',
      [JSON.stringify({ mass: 1, length: -3 })]: 'kg/m³',
      [JSON.stringify({ length: 3, time: -1 })]: 'm³/s',
      [JSON.stringify({ mass: 1, length: -1, time: -1 })]: 'Pa⋅s',
      [JSON.stringify({ mass: 1, time: -2 })]: 'N/m',
      [JSON.stringify({ length: -1 })]: 'm⁻¹',
      [JSON.stringify({ amount: 1, time: -1 })]: 'kat',
      [JSON.stringify({ intensity: 1, solid_angle: 1 })]: 'lm'
    };

    return derivedUnits[dimsStr] || '';
  };

  // Helper to parse number from string with current format
  const parseNumberWithFormat = (str: string): number => {
    return parseNumberWithSpecificFormat(str, numberFormat);
  };

  // Reformat input value when number format changes
  const reformatInputValue = (oldFormat: NumberFormat, newFormat: NumberFormat): void => {
    if (!inputValue || inputValue === '') return;
    
    // Skip reformatting for special formats (DMS, ft'in")
    if (fromUnit === 'deg_dms' || fromUnit === 'ft_in') return;
    
    // Parse with old format
    const numericValue = parseNumberWithSpecificFormat(inputValue, oldFormat);
    
    if (!isNaN(numericValue) && isFinite(numericValue)) {
      // Format with new format
      const reformatted = formatNumberWithSpecificFormat(numericValue, newFormat);
      setInputValue(reformatted);
    }
  };

  // Reformat input value on blur (when leaving the input field)
  const handleInputBlur = (): void => {
    if (!inputValue || inputValue === '') return;
    
    // Skip reformatting for special formats (DMS, ft'in")
    if (fromUnit === 'deg_dms' || fromUnit === 'ft_in') return;
    
    // Parse with current format
    const numericValue = parseNumberWithFormat(inputValue);
    
    if (!isNaN(numericValue) && isFinite(numericValue)) {
      // Reformat with current format to add separators and convert numerals
      const reformatted = formatNumberWithSpecificFormat(numericValue, numberFormat);
      setInputValue(reformatted);
    }
  };

  const formatDMS = (decimal: number): string => {
    const d = Math.floor(Math.abs(decimal));
    const mFloat = (Math.abs(decimal) - d) * 60;
    const m = Math.floor(mFloat);
    const s = (mFloat - m) * 60;
    const sign = decimal < 0 ? "-" : "";
    
    const sFixed = toFixedBanker(s, precision);
    const [sInt, sDec] = sFixed.split('.');
    const sDisplay = `${sInt.padStart(2, '0')}${sDec ? '.' + sDec : ''}`;

    return `${sign}${d}:${m.toString().padStart(2, '0')}:${sDisplay}`;
  };

  const parseDMS = (dms: string): number => {
    if (!dms.includes(':')) return parseNumberWithFormat(dms);
    const parts = dms.split(':').map(p => parseNumberWithFormat(p));
    let val = 0;
    if (parts.length > 0) val += parts[0];
    if (parts.length > 1) val += (parts[0] >= 0 ? parts[1] : -parts[1]) / 60;
    if (parts.length > 2) val += (parts[0] >= 0 ? parts[2] : -parts[2]) / 3600;
    return val;
  };

  const formatFtIn = (decimalFeet: number): string => {
    const sign = decimalFeet < 0 ? "-" : "";
    const absVal = Math.abs(decimalFeet);
    const ft = Math.floor(absVal);
    const inches = (absVal - ft) * 12;

    const inFixed = toFixedBanker(inches, precision);

    return `${sign}${ft}'${inFixed}"`;
  };

  const parseFtIn = (ftIn: string): number => {
    // Remove quotes and replace with colon for parsing
    const cleaned = ftIn.replace(/['"]/g, ':');
    if (!cleaned.includes(':')) return parseNumberWithFormat(cleaned);
    const parts = cleaned.split(':').map(p => parseNumberWithFormat(p));
    let val = 0;
    if (parts.length > 0) val += parts[0];
    if (parts.length > 1) val += (parts[0] >= 0 ? parts[1] : -parts[1]) / 12;
    return val;
  };

  // Calculate result - never auto-select prefixes, user must choose manually
  useEffect(() => {
    if (!inputValue || !fromUnit || !toUnit) {
      setResult(null);
      return;
    }

    let val: number;
    if (fromUnit === 'deg_dms') {
      val = parseDMS(inputValue);
      if (isNaN(val)) { setResult(null); return; }
    } else if (fromUnit === 'ft_in') {
      val = parseFtIn(inputValue);
      if (isNaN(val)) { setResult(null); return; }
    } else {
      val = parseNumberWithFormat(inputValue);
      if (isNaN(val)) { setResult(null); return; }
    }
    
    // Determine prefix factors (1 if not supported or none selected)
    // For special units (DMS/FtIn), we ignore prefixes
    const isSpecialFrom = fromUnit === 'deg_dms' || fromUnit === 'ft_in';
    const isSpecialTo = toUnit === 'deg_dms' || toUnit === 'ft_in';

    const fromFactor = (fromUnitData?.allowPrefixes && fromPrefixData && !isSpecialFrom) ? fromPrefixData.factor : 1;
    const toFactor = (toUnitData?.allowPrefixes && toPrefixData && !isSpecialTo) ? toPrefixData.factor : 1;
    
    const res = convert(val, fromUnit, toUnit, activeCategory, fromFactor, toFactor);
    setResult(res);
  }, [inputValue, fromUnit, toUnit, activeCategory, fromPrefix, toPrefix, fromUnitData, toUnitData, precision]);

  const swapUnits = () => {
    const tempUnit = fromUnit;
    const tempPrefix = fromPrefix;
    setFromUnit(toUnit);
    setFromPrefix(toPrefix);
    setToUnit(tempUnit);
    setToPrefix(tempPrefix);
  };

  // Helper to format number for copying with precision (no thousands separator)
  // Prefers decimal notation, only uses scientific for extreme values
  const formatForClipboard = (num: number, precisionValue: number): string => {
    const format = NUMBER_FORMATS[numberFormat];
    // Apply fixPrecision to remove floating-point artifacts
    const fixed = fixPrecision(num);
    
    if (fixed === 0) {
      return format.useArabicNumerals ? '٠' : '0';
    }
    
    const absNum = Math.abs(fixed);
    
    // Only use scientific notation for truly extreme values
    if (absNum < 1e-12 || absNum >= 1e15) {
      const expStr = fixed.toExponential(Math.min(precisionValue, 10));
      return format.useArabicNumerals ? toArabicNumerals(expStr) : expStr;
    }
    
    // For small values, extend precision to show meaningful digits
    let effectivePrecision = precisionValue;
    if (absNum < 1 && absNum > 0) {
      const magnitude = Math.floor(Math.log10(absNum));
      const neededDecimals = Math.abs(magnitude) + precisionValue;
      effectivePrecision = Math.min(neededDecimals, 12);
    }
    
    // Use precision directly - no magnitude-based limiting
    const formatted = toFixedBanker(fixed, effectivePrecision);
    // Remove trailing zeros after decimal point
    const cleaned = formatted.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
    // Replace period with format's decimal separator
    return format.decimal !== '.' ? cleaned.replace('.', format.decimal) : cleaned;
  };

  const copyResult = () => {
    if (result !== null && toUnitData && fromUnitData) {
      let textToCopy: string;
      // Always convert result to SI base units for calculator (this works for all categories)
      const valueToCopy = result * toUnitData.factor * (toPrefixData?.factor || 1);
      
      // Special formatting for specific output types
      if (toUnit === 'deg_dms') {
        textToCopy = formatDMS(result);
      } else if (toUnit === 'ft_in') {
        textToCopy = formatFtIn(result);
      } else if (activeCategory === 'lightbulb') {
        // Lightbulb displays the base unit value with precision
        textToCopy = `${formatForClipboard(valueToCopy, precision)} lm`;
      } else {
        // All other categories: display result with unit symbol and precision
        const unitSymbol = toUnitData?.symbol || '';
        const prefixSymbol = (toUnitData?.allowPrefixes && toPrefixData?.id !== 'none') ? toPrefixData.symbol : '';
        textToCopy = `${formatForClipboard(result, precision)} ${prefixSymbol}${unitSymbol}`;
      }
      
      navigator.clipboard.writeText(textToCopy);
      
      // Trigger flash animation
      triggerFlashCopyResult();
      
      // Add to calculator (first three fields only) - convert to SI base units
      // Use appropriate stack based on calculator mode
      const siBaseValue = valueToCopy;
      const bestPrefix = 'none';
      const newEntry = {
        value: siBaseValue,
        dimensions: getCategoryDimensions(activeCategory),
        prefix: bestPrefix
      };
      
      if (calculatorMode === 'rpn') {
        // RPN mode: Push onto stack position x with stack lift
        // Stack lifts: s3 gets old s2, s2 gets old y, y gets old x, new value goes to x
        saveRpnStackForUndo();
        setRpnStack(prev => {
          const newStack = [...prev];
          newStack[0] = prev[1]; // s3 gets old s2
          newStack[1] = prev[2]; // s2 gets old y
          newStack[2] = prev[3]; // y gets old x
          newStack[3] = newEntry; // new value goes to x
          return newStack;
        });
        setRpnResultPrefix('none');
        setRpnSelectedAlternative(0);
        triggerFlashRpnResult();
      } else {
        // UNIT mode: Find first empty field in positions 0-2
        const firstEmptyIndex = calcValues.findIndex((v, i) => i < 3 && v === null);
        if (firstEmptyIndex !== -1) {
          const newCalcValues = [...calcValues];
          newCalcValues[firstEmptyIndex] = newEntry;
          setCalcValues(newCalcValues);
        }
      }
    }
  };

  const copyFromBaseFactor = () => {
    if (fromUnitData) {
      const factor = fromUnitData.factor * fromPrefixData.factor;
      navigator.clipboard.writeText(factor.toString());
      triggerFlashFromBaseFactor();
    }
  };

  const copyFromSIBase = () => {
    const siBaseUnits = formatDimensions(getCategoryDimensions(activeCategory));
    if (siBaseUnits) {
      navigator.clipboard.writeText(siBaseUnits);
      triggerFlashFromSIBase();
    }
  };

  const copyToBaseFactor = () => {
    if (toUnitData) {
      const factor = toUnitData.factor * toPrefixData.factor;
      navigator.clipboard.writeText(factor.toString());
      triggerFlashToBaseFactor();
    }
  };

  const copyToSIBase = () => {
    const siBaseUnits = formatDimensions(getCategoryDimensions(activeCategory));
    if (siBaseUnits) {
      navigator.clipboard.writeText(siBaseUnits);
      triggerFlashToSIBase();
    }
  };

  const copyConversionRatio = () => {
    if (result !== null && fromUnitData && toUnitData) {
      const fromPrefixSymbol = (fromUnitData.allowPrefixes && fromPrefixData?.id !== 'none') ? fromPrefixData.symbol : '';
      const toPrefixSymbol = (toUnitData.allowPrefixes && toPrefixData?.id !== 'none') ? toPrefixData.symbol : '';
      const ratio = convert(1, fromUnit, toUnit, activeCategory,
        fromUnitData.allowPrefixes ? fromPrefixData.factor : 1,
        toUnitData.allowPrefixes ? toPrefixData.factor : 1
      );
      // Format ratio with precision using the shared helper
      const formattedRatio = formatForClipboard(ratio, precision);
      
      const ratioText = `1 ${fromPrefixSymbol}${fromUnitData.symbol} = ${formattedRatio} ${toPrefixSymbol}${toUnitData.symbol}`;
      navigator.clipboard.writeText(ratioText);
      triggerFlashConversionRatio();
    }
  };


  // Helper: Find category that matches dimensions
  const findCategoryForDimensions = (dims: DimensionalFormula): UnitCategory | null => {
    for (const cat of CONVERSION_DATA) {
      const catDims = getCategoryDimensions(cat.id);
      if (dimensionsEqual(catDims, dims)) {
        return cat.id;
      }
    }
    return null;
  };

  // Helper: Find best unit for a value (prefer SI units with shortest integer representation)
  const findBestUnit = (value: number, category: UnitCategory): string | null => {
    const cat = CONVERSION_DATA.find(c => c.id === category);
    if (!cat) return null;

    // Define SI units for each category
    const siUnits: Record<string, string[]> = {
      'area': ['m2', 'ha'],
      'volume': ['ml', 'l', 'm3'],
      'length': ['m'],
      'mass': ['kg', 'g'],
      'time': ['s'],
      // Add other categories as needed - most use allowPrefixes for SI units
    };

    let bestUnit: string | null = null;
    let bestScore = Infinity;

    for (const unit of cat.units) {
      const convertedValue = Math.abs(value / unit.factor);
      
      // Check if this is an SI unit
      const isSI = siUnits[category]?.includes(unit.id) || unit.allowPrefixes;
      
      // Only consider SI units
      if (!isSI) continue;
      
      // Calculate the length of the integer part
      const integerPart = Math.floor(convertedValue);
      
      // Prefer values >= 1 (integers), then prefer fewest digits
      let score: number;
      if (convertedValue >= 1) {
        // For values >= 1, score is the number of digits
        const numDigits = integerPart === 0 ? 1 : Math.floor(Math.log10(integerPart)) + 1;
        score = numDigits;
      } else {
        // For values < 1, add a large penalty to avoid fractional results
        score = 1000 + (1 - convertedValue); // Heavily penalize < 1
      }
      
      if (score < bestScore) {
        bestScore = score;
        bestUnit = unit.id;
      }
    }

    return bestUnit;
  };

  // SI representation generation - wrapper for extracted pure function
  const generateSIRepresentations = (dimensions: DimensionalFormula): SIRepresentation[] => {
    return generateSIRepresentationsLib(dimensions, getDimensionSignature, PREFERRED_REPRESENTATIONS);
  };

  // Auto-select multiplication operator when values are entered
  useEffect(() => {
    if (calcValues[0] && calcValues[1] && !calcOp1) {
      setCalcOp1('*');
    }
  }, [calcValues[0], calcValues[1], calcOp1]);

  useEffect(() => {
    if (calcValues[1] && calcValues[2] && !calcOp2) {
      setCalcOp2('*');
    }
  }, [calcValues[1], calcValues[2], calcOp2]);

  // Reset additive operators if dimensions become incompatible (only when both operands exist)
  useEffect(() => {
    if (calcValues[0] && calcValues[1] && (calcOp1 === '+' || calcOp1 === '-') && !canAddSubtract(calcValues[0], calcValues[1])) {
      setCalcOp1(null); // Clear operator so user must re-select
    }
  }, [calcValues[0], calcValues[1], calcOp1]);

  useEffect(() => {
    if (calcValues[1] && calcValues[2] && (calcOp2 === '+' || calcOp2 === '-') && !canAddSubtract(calcValues[1], calcValues[2])) {
      setCalcOp2(null); // Clear operator so user must re-select
    }
  }, [calcValues[1], calcValues[2], calcOp2]);

  // Calculate result field
  useEffect(() => {
    if (calcValues[0]) {
      let resultValue = calcValues[0].value;
      let resultDimensions = { ...calcValues[0].dimensions };
      
      // If we have field 2 and an operator, calculate
      if (calcValues[1] && calcOp1) {
        if (calcOp1 === '*') {
          resultValue = resultValue * calcValues[1].value;
          resultDimensions = multiplyDimensions(resultDimensions, calcValues[1].dimensions);
        } else if (calcOp1 === '/') {
          resultValue = resultValue / calcValues[1].value;
          resultDimensions = divideDimensions(resultDimensions, calcValues[1].dimensions);
        } else if (calcOp1 === '+' && canAddSubtract(calcValues[0], calcValues[1])) {
          resultValue = resultValue + calcValues[1].value;
          // Keep dimensions from non-dimensionless operand
          if (isDimensionless(resultDimensions) && !isDimensionless(calcValues[1].dimensions)) {
            resultDimensions = { ...calcValues[1].dimensions };
          }
        } else if (calcOp1 === '-' && canAddSubtract(calcValues[0], calcValues[1])) {
          resultValue = resultValue - calcValues[1].value;
          // Keep dimensions from non-dimensionless operand
          if (isDimensionless(resultDimensions) && !isDimensionless(calcValues[1].dimensions)) {
            resultDimensions = { ...calcValues[1].dimensions };
          }
        }
        
        // If we have field 3 and operator, continue calculation
        if (calcValues[2] && calcOp2) {
          if (calcOp2 === '*') {
            resultValue = resultValue * calcValues[2].value;
            resultDimensions = multiplyDimensions(resultDimensions, calcValues[2].dimensions);
          } else if (calcOp2 === '/') {
            resultValue = resultValue / calcValues[2].value;
            resultDimensions = divideDimensions(resultDimensions, calcValues[2].dimensions);
          } else if (calcOp2 === '+' && canAddSubtract(calcValues[1], calcValues[2])) {
            resultValue = resultValue + calcValues[2].value;
            // Keep dimensions from non-dimensionless operand
            if (isDimensionless(resultDimensions) && !isDimensionless(calcValues[2].dimensions)) {
              resultDimensions = { ...calcValues[2].dimensions };
            }
          } else if (calcOp2 === '-' && canAddSubtract(calcValues[1], calcValues[2])) {
            resultValue = resultValue - calcValues[2].value;
            // Keep dimensions from non-dimensionless operand
            if (isDimensionless(resultDimensions) && !isDimensionless(calcValues[2].dimensions)) {
              resultDimensions = { ...calcValues[2].dimensions };
            }
          }
        }
      }
      
      // Check if result is dimensionless (unitless)
      const resultIsDimensionless = Object.keys(resultDimensions).length === 0;
      
      setCalcValues(prev => {
        const newValues = [...prev];
        newValues[3] = {
          value: resultValue,
          dimensions: resultDimensions,
          prefix: 'none'
        };
        return newValues;
      });

      // Reset to SI base representation (index 0) and no prefix
      // The SI representation dropdown will show all SI compositions
      setResultPrefix('none');
      setSelectedAlternative(0);
      // Keep resultCategory/resultUnit for potential future use, but not used in SI-only mode
      setResultCategory(null);
      setResultUnit(null);
    } else if (calcValues[3] !== null) {
      setCalcValues(prev => {
        const newValues = [...prev];
        newValues[3] = null;
        return newValues;
      });
      setResultUnit(null);
      setResultCategory(null);
    }
  }, [calcValues[0], calcValues[1], calcValues[2], calcOp1, calcOp2]);

  // Always reset prefix to 'none' when the result unit changes
  // Prefixes should never be automatically chosen - user must select manually
  useEffect(() => {
    if (resultCategory && calcValues[3]) {
      setResultPrefix('none');
    }
  }, [resultUnit]);

  const clearCalculator = () => {
    setCalcValues([null, null, null, null]);
    setCalcOp1(null);
    setCalcOp2(null);
    setResultUnit(null);
    setResultCategory(null);
    setResultPrefix('none');
  };

  const clearField1 = () => {
    setCalcValues(prev => {
      const newValues = [...prev];
      newValues[0] = null;
      return newValues;
    });
    setCalcOp1(null);
  };

  const clearField2 = () => {
    setCalcValues(prev => {
      const newValues = [...prev];
      newValues[1] = null;
      return newValues;
    });
    setCalcOp2(null);
  };

  const clearField3 = () => {
    setCalcValues(prev => {
      const newValues = [...prev];
      newValues[2] = null;
      return newValues;
    });
  };

  // RPN Calculator functions
  
  // Save current stack before any operation (for undo)
  const saveRpnStackForUndo = () => {
    setPreviousRpnStack([...rpnStack]);
  };
  
  // Undo: swap current stack with previous stack (pressing twice = redo)
  const undoRpnStack = () => {
    const temp = [...rpnStack];
    setRpnStack([...previousRpnStack]);
    setPreviousRpnStack(temp);
  };
  
  const clearRpnStack = () => {
    saveRpnStackForUndo();
    setRpnStack([null, null, null, null]);
    setRpnResultPrefix('none');
    setRpnSelectedAlternative(0);
  };

  const clearRpnTop = () => {
    // Clear the top non-null entry in the stack
    saveRpnStackForUndo();
    setRpnStack(prev => {
      const newStack = [...prev];
      // Find the last non-null entry (highest index with data)
      for (let i = 2; i >= 0; i--) {
        if (newStack[i] !== null) {
          newStack[i] = null;
          break;
        }
      }
      return newStack;
    });
  };

  const pushToRpnStack = () => {
    // Standard RPN ENTER: lift stack and duplicate x
    // s3 gets old s2, s2 gets old y, y gets old x, x stays same
    if (!rpnStack[3]) return;
    saveRpnStackForUndo();
    setRpnStack(prev => {
      const newStack = [...prev];
      newStack[0] = prev[1]; // s3 <- s2
      newStack[1] = prev[2]; // s2 <- y
      newStack[2] = prev[3]; // y <- x
      // newStack[3] stays as x (duplicated)
      return newStack;
    });
  };

  const dropRpnStack = () => {
    // Drop: pushes s3 down the stack, duplicating top, x becomes old y
    // s3 stays (duplicated), s2 <- s3, y <- s2, x <- y
    saveRpnStackForUndo();
    setRpnStack(prev => {
      const newStack = [...prev];
      // s3 stays the same (newStack[0] = prev[0])
      newStack[1] = prev[0]; // s2 <- s3
      newStack[2] = prev[1]; // y <- s2
      newStack[3] = prev[2]; // x <- y
      return newStack;
    });
  };

  // Swap X and Y registers (x⇆y)
  const swapRpnXY = () => {
    if (!rpnStack[3] || !rpnStack[2]) return;
    saveRpnStackForUndo();
    setRpnStack(prev => {
      const newStack = [...prev];
      newStack[3] = prev[2]; // x <- y
      newStack[2] = prev[3]; // y <- x
      return newStack;
    });
  };

  // Recall LASTx - push lastX value onto stack
  const recallLastX = () => {
    if (!lastX) return;
    saveRpnStackForUndo();
    // Stack lift: push lastX onto x, old values shift up
    setRpnStack(prev => {
      const newStack = [...prev];
      newStack[0] = prev[1]; // s3 <- s2
      newStack[1] = prev[2]; // s2 <- y
      newStack[2] = prev[3]; // y <- x
      newStack[3] = lastX;   // x <- lastX
      return newStack;
    });
  };

  // Pull result from Converter or Custom tab onto RPN stack
  const pullFromPane = () => {
    let newEntry: CalcValue | null = null;
    
    if (activeTab === 'converter') {
      // Pull from Converter tab
      if (result !== null && toUnitData) {
        const siBaseValue = result * toUnitData.factor * (toPrefixData?.factor || 1);
        newEntry = {
          value: siBaseValue,
          dimensions: getCategoryDimensions(activeCategory),
          prefix: 'none'
        };
      }
    } else if (activeTab === 'custom') {
      // Pull from Custom tab
      const numValue = parseNumberWithFormat(directValue);
      if (!isNaN(numValue) && directValue) {
        const dims = buildDirectDimensions();
        newEntry = {
          value: numValue,
          dimensions: dims,
          prefix: 'none'
        };
      }
    }
    
    if (!newEntry) return;
    
    // Push onto RPN stack with stack lift
    saveRpnStackForUndo();
    setRpnStack(prev => {
      const newStack = [...prev];
      newStack[0] = prev[1]; // s3 <- s2
      newStack[1] = prev[2]; // s2 <- y
      newStack[2] = prev[3]; // y <- x
      newStack[3] = newEntry; // x <- pulled value
      return newStack;
    });
    setRpnResultPrefix('none');
    setRpnSelectedAlternative(0);
    triggerFlashRpnResult();
  };

  // RPN unary operation types
  type RpnUnaryOp = 
    | 'square' | 'cube' | 'sqrt' | 'cbrt' | 'recip'
    | 'exp' | 'ln' | 'pow10' | 'log10' | 'pow2' | 'log2'
    | 'sin' | 'cos' | 'tan' | 'asin' | 'acos' | 'atan'
    | 'sinh' | 'cosh' | 'tanh' | 'asinh' | 'acosh' | 'atanh'
    | 'rnd' | 'trunc' | 'floor' | 'ceil'
    | 'neg' | 'abs';
  
  // Helper to check if dimensions represent exactly radians (angle: 1, all others 0 or undefined)
  const isRadians = (dimensions: DimensionalFormula): boolean => {
    // Must have angle = 1
    if (dimensions.angle !== 1) return false;
    // All other dimensions must be 0 or undefined
    for (const [key, value] of Object.entries(dimensions)) {
      if (key === 'angle') continue;
      if (value !== 0 && value !== undefined) return false;
    }
    return true;
  };

  // Apply unary operation to RPN x register (stack[3])
  const applyRpnUnary = (op: RpnUnaryOp) => {
    if (!rpnStack[3]) return;
    saveRpnStackForUndo();
    
    // Save X to lastX before operation
    setLastX(rpnStack[3]);
    
    const x = rpnStack[3];
    let newValue: number;
    let newDimensions: Record<string, number> = {};
    
    switch (op) {
      // Power operations (multiply unit exponents)
      case 'square':
        newValue = fixPrecision(x.value * x.value);
        for (const [dim, exp] of Object.entries(x.dimensions)) {
          newDimensions[dim] = exp * 2;
        }
        break;
      case 'cube':
        newValue = fixPrecision(x.value * x.value * x.value);
        for (const [dim, exp] of Object.entries(x.dimensions)) {
          newDimensions[dim] = exp * 3;
        }
        break;
      
      // Root operations - divide exponents with round-up for non-integer results
      // Per user requirement: sqrt(m²)→m¹, sqrt(m³)→m², sqrt(m⁴)→m², cbrt(m³)→m¹, cbrt(m⁴)→m², etc.
      case 'sqrt':
        if (x.value < 0) return;
        newValue = fixPrecision(Math.sqrt(x.value));
        for (const [dim, exp] of Object.entries(x.dimensions)) {
          // E/2, round up: E=2→1, E=3→2, E=4→2
          newDimensions[dim] = Math.ceil(exp / 2);
        }
        break;
      case 'cbrt':
        newValue = fixPrecision(Math.cbrt(x.value));
        for (const [dim, exp] of Object.entries(x.dimensions)) {
          // E/3, round up: E=1,2,3→1, E=4,5→2
          newDimensions[dim] = Math.ceil(exp / 3);
        }
        break;
      
      // Exponential/logarithmic (operate on numeric value, pass units through)
      case 'exp':
        newValue = fixPrecision(Math.exp(x.value));
        newDimensions = { ...x.dimensions };
        break;
      case 'ln':
        if (x.value <= 0) return;
        newValue = fixPrecision(Math.log(x.value));
        newDimensions = { ...x.dimensions };
        break;
      case 'pow10':
        newValue = fixPrecision(Math.pow(10, x.value));
        newDimensions = { ...x.dimensions };
        break;
      case 'log10':
        if (x.value <= 0) return;
        newValue = fixPrecision(Math.log10(x.value));
        newDimensions = { ...x.dimensions };
        break;
      case 'pow2':
        newValue = fixPrecision(Math.pow(2, x.value));
        newDimensions = { ...x.dimensions };
        break;
      case 'log2':
        if (x.value <= 0) return;
        newValue = fixPrecision(Math.log2(x.value));
        newDimensions = { ...x.dimensions };
        break;
      
      // Rounding functions (use precision setting, preserve dimensions)
      case 'rnd': {
        // Round to nearest even at precision decimal places
        const factor = Math.pow(10, calculatorPrecision);
        const scaled = x.value * factor;
        // Round to nearest even (banker's rounding)
        const rounded = Math.round(scaled);
        // Check if exactly halfway - if so, round to even
        if (Math.abs(scaled - Math.floor(scaled) - 0.5) < 1e-10) {
          const floor = Math.floor(scaled);
          newValue = (floor % 2 === 0 ? floor : floor + 1) / factor;
        } else {
          newValue = rounded / factor;
        }
        newDimensions = { ...x.dimensions };
        break;
      }
      case 'trunc': {
        // Truncate at precision decimal places
        const factor = Math.pow(10, calculatorPrecision);
        newValue = Math.trunc(x.value * factor) / factor;
        newDimensions = { ...x.dimensions };
        break;
      }
      case 'floor': {
        // Floor at precision decimal places
        const factor = Math.pow(10, calculatorPrecision);
        newValue = Math.floor(x.value * factor) / factor;
        newDimensions = { ...x.dimensions };
        break;
      }
      case 'ceil': {
        // Ceiling at precision decimal places
        const factor = Math.pow(10, calculatorPrecision);
        newValue = Math.ceil(x.value * factor) / factor;
        newDimensions = { ...x.dimensions };
        break;
      }
      
      // Sign change - negate the value, preserve X's dimensions
      case 'neg': {
        newValue = -x.value;
        newDimensions = { ...x.dimensions };
        break;
      }
      
      case 'abs': {
        newValue = Math.abs(x.value);
        newDimensions = { ...x.dimensions };
        break;
      }
      
      // Reciprocal - 1/x, inverts unit exponents
      case 'recip': {
        if (x.value === 0) return; // Division by zero
        newValue = fixPrecision(1 / x.value);
        for (const [dim, exp] of Object.entries(x.dimensions)) {
          newDimensions[dim] = -exp;
        }
        break;
      }
      
      // Forward trigonometric functions:
      // - If input is rad → output is unitless
      // - Otherwise → preserve input units (operate on numeric only)
      case 'sin': {
        newValue = fixPrecision(Math.sin(x.value));
        if (isRadians(x.dimensions)) {
          newDimensions = {}; // unitless output
        } else {
          newDimensions = { ...x.dimensions }; // preserve input units
        }
        break;
      }
      case 'cos': {
        newValue = fixPrecision(Math.cos(x.value));
        if (isRadians(x.dimensions)) {
          newDimensions = {}; // unitless output
        } else {
          newDimensions = { ...x.dimensions }; // preserve input units
        }
        break;
      }
      case 'tan': {
        newValue = fixPrecision(Math.tan(x.value));
        if (isRadians(x.dimensions)) {
          newDimensions = {}; // unitless output
        } else {
          newDimensions = { ...x.dimensions }; // preserve input units
        }
        break;
      }
      
      // Inverse trig functions:
      // - If input is unitless → output is rad
      // - Otherwise → preserve input units (operate on numeric only)
      case 'asin': {
        if (x.value < -1 || x.value > 1) return;
        newValue = fixPrecision(Math.asin(x.value));
        if (isDimensionless(x.dimensions)) {
          newDimensions = { angle: 1 }; // output rad
        } else {
          newDimensions = { ...x.dimensions }; // preserve input units
        }
        break;
      }
      case 'acos': {
        if (x.value < -1 || x.value > 1) return;
        newValue = fixPrecision(Math.acos(x.value));
        if (isDimensionless(x.dimensions)) {
          newDimensions = { angle: 1 }; // output rad
        } else {
          newDimensions = { ...x.dimensions }; // preserve input units
        }
        break;
      }
      case 'atan': {
        newValue = fixPrecision(Math.atan(x.value));
        if (isDimensionless(x.dimensions)) {
          newDimensions = { angle: 1 }; // output rad
        } else {
          newDimensions = { ...x.dimensions }; // preserve input units
        }
        break;
      }
      
      // Forward hyperbolic functions:
      // - If input is rad → output is unitless
      // - Otherwise → preserve input units (operate on numeric only)
      case 'sinh': {
        newValue = fixPrecision(Math.sinh(x.value));
        if (isRadians(x.dimensions)) {
          newDimensions = {}; // unitless output
        } else {
          newDimensions = { ...x.dimensions }; // preserve input units
        }
        break;
      }
      case 'cosh': {
        newValue = fixPrecision(Math.cosh(x.value));
        if (isRadians(x.dimensions)) {
          newDimensions = {}; // unitless output
        } else {
          newDimensions = { ...x.dimensions }; // preserve input units
        }
        break;
      }
      case 'tanh': {
        newValue = fixPrecision(Math.tanh(x.value));
        if (isRadians(x.dimensions)) {
          newDimensions = {}; // unitless output
        } else {
          newDimensions = { ...x.dimensions }; // preserve input units
        }
        break;
      }
      
      // Inverse hyperbolic functions:
      // - If input is unitless → output is rad
      // - Otherwise → preserve input units (operate on numeric only)
      case 'asinh': {
        newValue = fixPrecision(Math.asinh(x.value));
        if (isDimensionless(x.dimensions)) {
          newDimensions = { angle: 1 }; // output rad
        } else {
          newDimensions = { ...x.dimensions }; // preserve input units
        }
        break;
      }
      case 'acosh': {
        if (x.value < 1) return;
        newValue = fixPrecision(Math.acosh(x.value));
        if (isDimensionless(x.dimensions)) {
          newDimensions = { angle: 1 }; // output rad
        } else {
          newDimensions = { ...x.dimensions }; // preserve input units
        }
        break;
      }
      case 'atanh': {
        if (x.value <= -1 || x.value >= 1) return;
        newValue = fixPrecision(Math.atanh(x.value));
        if (isDimensionless(x.dimensions)) {
          newDimensions = { angle: 1 }; // output rad
        } else {
          newDimensions = { ...x.dimensions }; // preserve input units
        }
        break;
      }
      
      default:
        return;
    }
    
    // Clean up zero exponents
    for (const [dim, exp] of Object.entries(newDimensions)) {
      if (exp === 0) delete newDimensions[dim];
    }
    
    setRpnStack(prev => {
      const newStack = [...prev];
      newStack[3] = {
        value: newValue,
        dimensions: newDimensions,
        prefix: 'none'
      };
      return newStack;
    });
    setRpnResultPrefix('none');
    setRpnSelectedAlternative(0);
    triggerFlashRpnResult();
  };

  // RPN binary operation types
  type RpnBinaryOp = 'mul' | 'div' | 'add' | 'sub' | 'mulUnit' | 'divUnit' | 'addUnit' | 'subUnit' | 'pow';

  // Check if binary operation can be performed
  const canApplyRpnBinary = (op: RpnBinaryOp): boolean => {
    if (!rpnStack[2] || !rpnStack[3]) return false;
    
    // Unit-aware add/sub require compatible dimensions
    if (op === 'addUnit' || op === 'subUnit') {
      const y = rpnStack[2];
      const x = rpnStack[3];
      // Compatible if: same dimensions, or either is dimensionless
      return dimensionsEqual(y.dimensions, x.dimensions) || 
             isDimensionless(y.dimensions) || 
             isDimensionless(x.dimensions);
    }
    
    return true;
  };

  // Apply binary operation to RPN x and y registers
  // y is stack[2], x is stack[3], result goes to x, stack drops
  const applyRpnBinary = (op: RpnBinaryOp) => {
    if (!rpnStack[2] || !rpnStack[3]) return;
    saveRpnStackForUndo();
    
    // Save X to lastX before operation
    setLastX(rpnStack[3]);
    
    const y = rpnStack[2];
    const x = rpnStack[3];
    let newValue: number;
    let newDimensions: Record<string, number> = {};
    
    switch (op) {
      // Numeric-only operations (preserve X's dimensions)
      case 'mul':
        newValue = fixPrecision(y.value * x.value);
        newDimensions = { ...x.dimensions };
        break;
      case 'div':
        if (x.value === 0) return; // Prevent division by zero
        newValue = fixPrecision(y.value / x.value);
        newDimensions = { ...x.dimensions };
        break;
      case 'add':
        newValue = fixPrecision(y.value + x.value);
        newDimensions = { ...x.dimensions };
        break;
      case 'sub':
        newValue = fixPrecision(y.value - x.value);
        newDimensions = { ...x.dimensions };
        break;
      
      // Unit-aware operations
      case 'mulUnit':
        newValue = fixPrecision(y.value * x.value);
        // Multiply dimensions: add exponents
        // First copy y's dimensions
        for (const dim of Object.keys(y.dimensions)) {
          newDimensions[dim] = (y.dimensions as Record<string, number>)[dim] || 0;
        }
        // Then add x's dimensions
        for (const dim of Object.keys(x.dimensions)) {
          const xExp = (x.dimensions as Record<string, number>)[dim] || 0;
          newDimensions[dim] = (newDimensions[dim] || 0) + xExp;
        }
        break;
      case 'divUnit':
        if (x.value === 0) return; // Prevent division by zero
        newValue = fixPrecision(y.value / x.value);
        // Divide dimensions: subtract exponents
        // First copy y's dimensions
        for (const dim of Object.keys(y.dimensions)) {
          newDimensions[dim] = (y.dimensions as Record<string, number>)[dim] || 0;
        }
        // Then subtract x's dimensions
        for (const dim of Object.keys(x.dimensions)) {
          const xExp = (x.dimensions as Record<string, number>)[dim] || 0;
          newDimensions[dim] = (newDimensions[dim] || 0) - xExp;
        }
        break;
      case 'addUnit':
        // Only valid if dimensions match or one is dimensionless
        if (!dimensionsEqual(y.dimensions, x.dimensions) && 
            !isDimensionless(y.dimensions) && !isDimensionless(x.dimensions)) {
          return;
        }
        newValue = fixPrecision(y.value + x.value);
        // Use the non-dimensionless one, or x if both have dimensions
        newDimensions = isDimensionless(x.dimensions) ? { ...y.dimensions } : { ...x.dimensions };
        break;
      case 'subUnit':
        // Only valid if dimensions match or one is dimensionless
        if (!dimensionsEqual(y.dimensions, x.dimensions) && 
            !isDimensionless(y.dimensions) && !isDimensionless(x.dimensions)) {
          return;
        }
        newValue = fixPrecision(y.value - x.value);
        // Use the non-dimensionless one, or x if both have dimensions
        newDimensions = isDimensionless(x.dimensions) ? { ...y.dimensions } : { ...x.dimensions };
        break;
      
      // Power: y^x - x must be dimensionless, result dimensions are y's dimensions multiplied by x
      case 'pow': {
        // x (exponent) must be dimensionless for physical meaning
        if (!isDimensionless(x.dimensions)) return;
        // Handle special cases
        if (y.value === 0 && x.value < 0) return; // 0 to negative power is undefined
        if (y.value < 0 && !Number.isInteger(x.value)) return; // Negative base with non-integer exponent
        newValue = fixPrecision(Math.pow(y.value, x.value));
        // Multiply y's dimension exponents by x (the power)
        for (const [dim, exp] of Object.entries(y.dimensions)) {
          const newExp = exp * x.value;
          if (newExp !== 0) {
            newDimensions[dim] = newExp;
          }
        }
        break;
      }
      
      default:
        return;
    }
    
    // Clean up zero exponents
    for (const [dim, exp] of Object.entries(newDimensions)) {
      if (exp === 0) delete newDimensions[dim];
    }
    
    // Drop stack: s3→s2, s2→y, result→x
    setRpnStack(prev => {
      const newStack = [...prev];
      newStack[3] = {
        value: newValue,
        dimensions: newDimensions,
        prefix: 'none'
      };
      newStack[2] = prev[1]; // s2 → y
      newStack[1] = prev[0]; // s3 → s2
      newStack[0] = null;    // s3 becomes empty
      return newStack;
    });
    setRpnResultPrefix('none');
    setRpnSelectedAlternative(0);
    triggerFlashRpnResult();
  };

  // Push a constant value onto the RPN stack (dimensionless)
  const pushRpnConstant = (value: number) => {
    saveRpnStackForUndo();
    setRpnStack(prev => {
      const newStack = [...prev];
      // Lift stack: each position moves up one
      newStack[0] = prev[1]; // s3 gets old s2
      newStack[1] = prev[2]; // s2 gets old y
      newStack[2] = prev[3]; // y gets old x
      newStack[3] = {
        value,
        dimensions: {},
        prefix: 'none'
      };
      return newStack;
    });
    setRpnResultPrefix('none');
    setRpnSelectedAlternative(0);
    triggerFlashRpnResult();
  };

  // Get RPN result display (similar to getCalcResultDisplay but for RPN)
  const getRpnResultDisplay = () => {
    if (!rpnStack[3]) return null;
    const val = rpnStack[3];
    
    const siReps = generateSIRepresentations(val.dimensions);
    const currentSymbol = siReps[rpnSelectedAlternative]?.displaySymbol || formatDimensions(val.dimensions);
    
    // Treat '1' (dimensionless) as empty - same as y/s2/s3 display behavior
    if (currentSymbol === '1' || !currentSymbol) {
      const formattedValue = formatNumberWithSeparators(val.value, calculatorPrecision);
      return {
        formattedValue,
        unitSymbol: ''
      };
    }
    
    const kgResult = applyPrefixToKgUnit(currentSymbol, rpnResultPrefix);
    const displayValue = val.value / kgResult.effectivePrefixFactor;
    
    const formattedValue = formatNumberWithSeparators(displayValue, calculatorPrecision);
    
    // Include prefix symbol in unit display when showPrefix is true
    const prefixData = PREFIXES.find(p => p.id === rpnResultPrefix);
    const prefixSymbol = kgResult.showPrefix && prefixData ? prefixData.symbol : '';
    
    return {
      formattedValue,
      unitSymbol: prefixSymbol + kgResult.displaySymbol
    };
  };

  const copyRpnResult = () => {
    const display = getRpnResultDisplay();
    if (!display) return;
    
    // Clean up the formatted value for clipboard
    const cleanValue = display.formattedValue.replace(/,/g, '');
    const textToCopy = display.unitSymbol ? `${cleanValue} ${display.unitSymbol}` : cleanValue;
    
    navigator.clipboard.writeText(textToCopy);
    triggerFlashRpnResult();
  };

  const copyRpnField = (index: number) => {
    const val = rpnStack[index];
    if (!val) return;
    
    const baseUnitSymbol = formatDimensions(val.dimensions);
    const kgResult = applyPrefixToKgUnit(baseUnitSymbol, val.prefix);
    const displayValue = val.value / kgResult.effectivePrefixFactor;
    const formattedValue = formatNumberWithSeparators(displayValue, calculatorPrecision);
    const cleanValue = formattedValue.replace(/,/g, '');
    
    // Include prefix symbol when showPrefix is true
    const prefixData = PREFIXES.find(p => p.id === val.prefix);
    const prefixSymbol = kgResult.showPrefix && prefixData ? prefixData.symbol : '';
    const unitSymbol = prefixSymbol + kgResult.displaySymbol;
    const textToCopy = unitSymbol ? `${cleanValue} ${unitSymbol}` : cleanValue;
    
    navigator.clipboard.writeText(textToCopy);
    
    if (index === 0) {
      triggerFlashRpnField1();
    } else if (index === 1) {
      triggerFlashRpnField2();
    } else if (index === 2) {
      triggerFlashRpnField3();
    }
  };

  // Mode switching handlers with data transfer
  // RPN stack naming: x=stack[3] (bottom/result), y=stack[2], s2=stack[1], s3=stack[0] (top)
  // Simple calculator: field1=calcValues[0] (top), field2=calcValues[1], field3=calcValues[2], result=calcValues[3]
  const switchToRpn = () => {
    // Clear stack, copy result to X
    saveRpnStackForUndo();
    const newRpnStack: typeof rpnStack = [
      null, // s3 = cleared
      null, // s2 = cleared
      null, // y = cleared
      calcValues[3]  // x = result
    ];
    setRpnStack(newRpnStack);
    setRpnResultPrefix('none');
    setRpnSelectedAlternative(0);
    setCalculatorMode('rpn');
  };

  const switchToSimple = () => {
    // Clear all simple fields and copy X to top field
    const newCalcValues: typeof calcValues = [
      rpnStack[3], // top field = x
      null,
      null,
      null
    ];
    setCalcValues(newCalcValues);
    setCalcOp1(null);
    setCalcOp2(null);
    setResultPrefix('none');
    setSelectedAlternative(0);
    setCalculatorMode('simple');
  };

  // Helper to fix floating-point precision artifacts
  // Only cleans up obvious artifacts, doesn't truncate valid precision
  const fixPrecision = (num: number): number => {
    if (num === 0) return 0;
    if (!isFinite(num)) return num;
    
    // Use JavaScript's full 17 significant digit precision 
    // to preserve as much user-entered precision as possible
    const result = parseFloat(num.toPrecision(17));
    return result;
  };

  // Helper to get formatted calculator result display (shared by UI and copy function)
  // Returns { formattedValue: string, unitSymbol: string } or null if no result
  const getCalcResultDisplay = () => {
    if (!calcValues[3]) return null;
    const val = calcValues[3];
    
    // Get SI representation
    const siReps = generateSIRepresentations(val.dimensions);
    const currentSymbol = siReps[selectedAlternative]?.displaySymbol || formatDimensions(val.dimensions);
    
    // Apply kg prefix handoff
    const kgResult = applyPrefixToKgUnit(currentSymbol, resultPrefix);
    const displayValue = val.value / kgResult.effectivePrefixFactor;
    
    // Format value
    const formattedValue = formatNumberWithSeparators(displayValue, calculatorPrecision);
    
    // Include prefix symbol in unit display when showPrefix is true
    const prefixData = PREFIXES.find(p => p.id === resultPrefix);
    const prefixSymbol = kgResult.showPrefix && prefixData ? prefixData.symbol : '';
    
    return {
      formattedValue,
      unitSymbol: prefixSymbol + kgResult.displaySymbol
    };
  };

  const copyCalcResult = () => {
    const display = getCalcResultDisplay();
    if (!display) return;
    
    // Copy the exact text shown in the result field
    const textToCopy = display.unitSymbol 
      ? `${display.formattedValue} ${display.unitSymbol}` 
      : display.formattedValue;
    navigator.clipboard.writeText(textToCopy);
    
    // Trigger flash animation
    triggerFlashCopyCalc();
  };

  // Helper to clean up trailing zeros from decimal numbers
  const cleanNumber = (num: number, precision: number): string => {
    // First apply fixPrecision to remove floating-point artifacts
    const fixed = fixPrecision(num);
    
    // For small values, extend precision to show meaningful digits
    let effectivePrecision = precision;
    const absNum = Math.abs(fixed);
    if (absNum > 0 && absNum < 1) {
      const magnitude = Math.floor(Math.log10(absNum));
      const neededDecimals = Math.abs(magnitude) + precision;
      effectivePrecision = Math.min(neededDecimals, 12);
    }
    
    // Use precision directly - no magnitude-based limiting for large numbers
    const formatted = toFixedBanker(fixed, effectivePrecision);
    // Remove trailing zeros after decimal point
    const cleaned = formatted.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
    return cleaned;
  };

  // Copy calculator field to clipboard and flash
  const copyCalcField = (fieldIndex: number) => {
    const val = calcValues[fieldIndex];
    if (!val) return;
    
    // Use formatDimensions to get pure SI base units (kg, m, s, etc.) instead of derived units
    const baseUnitSymbol = formatDimensions(val.dimensions);
    // Apply kg prefix handoff: kg + prefix → prefixed-g (e.g., kg + milli → mg)
    const kgResult = applyPrefixToKgUnit(baseUnitSymbol, val.prefix);
    const displayValue = fixPrecision(val.value / kgResult.effectivePrefixFactor);
    
    // Include prefix symbol when showPrefix is true
    const prefixData = PREFIXES.find(p => p.id === val.prefix);
    const prefixSymbol = kgResult.showPrefix && prefixData ? prefixData.symbol : '';
    const unitSymbol = prefixSymbol + kgResult.displaySymbol;
    
    // Copy with only decimal separator, no thousands separator
    const format = NUMBER_FORMATS[numberFormat];
    const valueStr = cleanNumber(displayValue, calculatorPrecision);
    const formattedStr = format.decimal !== '.' ? valueStr.replace('.', format.decimal) : valueStr;
    const textToCopy = unitSymbol ? `${formattedStr} ${unitSymbol}` : formattedStr;
    navigator.clipboard.writeText(textToCopy);
    
    // Trigger flash animation for the specific field
    if (fieldIndex === 0) {
      triggerFlashCalcField1();
    } else if (fieldIndex === 1) {
      triggerFlashCalcField2();
    } else if (fieldIndex === 2) {
      triggerFlashCalcField3();
    }
  };

  // Helper to format number with separators based on selected format
  // Prefers decimal notation, only uses scientific for extreme values
  const formatNumberWithSeparators = (num: number, precision: number): string => {
    const format = NUMBER_FORMATS[numberFormat];
    
    // Handle zero
    if (num === 0) {
      return format.useArabicNumerals ? '٠' : '0';
    }
    
    const absNum = Math.abs(num);
    
    // Only use scientific notation for truly extreme values
    if (absNum < 1e-12 || absNum >= 1e15) {
      const expStr = num.toExponential(Math.min(precision, 10));
      return format.useArabicNumerals ? toArabicNumerals(expStr) : expStr;
    }
    
    // cleanNumber already applies fixPrecision internally
    const cleaned = cleanNumber(num, precision);
    const [integer, decimal] = cleaned.split('.');
    
    // Add thousands separator if format has one
    let formattedInteger = integer;
    if (format.thousands) {
      if (numberFormat === 'south-asian') {
        // Indian numbering system: 3-2-2 grouping (e.g., 12,34,56,789)
        // First separator after 3 digits from right, then every 2 digits
        const reversed = integer.split('').reverse().join('');
        let result = '';
        for (let i = 0; i < reversed.length; i++) {
          if (i === 3 || (i > 3 && (i - 3) % 2 === 0)) {
            result += format.thousands;
          }
          result += reversed[i];
        }
        formattedInteger = result.split('').reverse().join('');
      } else if (format.myriad) {
        // Myriad grouping: 4-4-4 grouping (e.g., 1,2345,6789)
        formattedInteger = integer.replace(/\B(?=(\d{4})+(?!\d))/g, format.thousands);
      } else {
        // Standard 3-3-3 grouping for other formats
        formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, format.thousands);
      }
    }
    
    // Use format's decimal separator
    let result = decimal ? `${formattedInteger}${format.decimal}${decimal}` : formattedInteger;
    
    // Convert to Arabic numerals if format requires it
    if (format.useArabicNumerals) {
      result = toArabicNumerals(result);
    }
    
    return result;
  };

  const formatFactor = (f: number) => {
    const format = NUMBER_FORMATS[numberFormat];
    if (f === 1) {
      return format.useArabicNumerals ? '١' : '1';
    }
    if (f >= 1e9 || f <= 1e-8) {
      const expStr = f.toExponential(7);
      return format.useArabicNumerals ? `×${toArabicNumerals(expStr)}` : `×${expStr}`;
    }
    
    // Format with up to 9 total digits and 8 decimal places
    // Use toPrecision for total significant figures, then clean up
    const str = f.toPrecision(9);
    const num = parseFloat(str);
    
    // Format with up to 8 decimal places, removing trailing zeros
    const formatted = formatNumberWithSeparators(num, 8);
    return `×${formatted}`;
  };

  // Helper to format result - prefers decimal notation, only uses scientific for extreme values
  // Uses scientific notation only when:
  // 1. Value is extremely small (< 1e-12, beyond reasonable display)
  // 2. Value is extremely large (>= 1e15, beyond typical display)
  const formatResultValue = (num: number, precisionValue: number): string => {
    const format = NUMBER_FORMATS[numberFormat];
    if (num === 0) {
      return format.useArabicNumerals ? '٠' : '0';
    }
    const absNum = Math.abs(num);
    
    // Only use scientific notation for truly extreme values
    if (absNum < 1e-12 || absNum >= 1e15) {
      const expStr = num.toExponential(Math.min(precisionValue, 10));
      return format.useArabicNumerals ? toArabicNumerals(expStr) : expStr;
    }
    
    // For small values, extend precision to show meaningful digits
    let effectivePrecision = precisionValue;
    if (absNum < 1 && absNum > 0) {
      // Calculate how many decimal places needed to show the value
      const magnitude = Math.floor(Math.log10(absNum));
      const neededDecimals = Math.abs(magnitude) + precisionValue;
      effectivePrecision = Math.min(neededDecimals, 12); // Cap at 12 decimal places
    }
    
    return formatNumberWithSeparators(num, effectivePrecision);
  };

  // Helper to determine input placeholder
  const getPlaceholder = () => {
    if (fromUnit === 'deg_dms') return "dd:mm:ss";
    if (fromUnit === 'ft_in') return "ft'in\"";
    return "0";
  };

  // Helper to validate and filter input
  const handleInputChange = (value: string) => {
    const format = NUMBER_FORMATS[numberFormat];
    const decimalSep = format.decimal === '.' ? '\\.' : format.decimal === "'" ? "\\'" : format.decimal;
    const thousandsSep = format.thousands ? (format.thousands === ' ' ? '\\s' : format.thousands === "'" ? "\\'" : format.thousands) : '';
    
    // For Arabic formats, allow both Latin and Arabic numerals
    const isArabicFormat = numberFormat === 'arabic';
    const digitPattern = isArabicFormat ? '0-9٠-٩' : '0-9';
    
    // For special formats (DMS/FtIn), allow: digits, colon, decimal separator, thousands separator, minus, quotes
    if (fromUnit === 'deg_dms' || fromUnit === 'ft_in') {
      const pattern = new RegExp(`[^${digitPattern}:\\-${decimalSep}${thousandsSep}'"']`, 'g');
      const filtered = value.replace(pattern, '');
      setInputValue(filtered);
      return;
    }
    
    // For regular numeric input, allow: digits, current decimal separator, current thousands separator, minus, e/E for scientific notation
    // Build regex pattern: digits, minus sign, decimal separator, thousands separator, plus e/E and + for exponent
    const pattern = new RegExp(`[^${digitPattern}\\-${decimalSep}${thousandsSep}eE\\+]`, 'g');
    const filtered = value.replace(pattern, '');
    setInputValue(filtered);
  };

  // Helper to build unit symbol from Direct tab exponents
  const buildDirectUnitSymbol = (): string => {
    const superscripts: Record<number, string> = {
      1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵',
      [-1]: '⁻¹', [-2]: '⁻²', [-3]: '⁻³', [-4]: '⁻⁴', [-5]: '⁻⁵'
    };
    
    const parts: string[] = [];
    const units = ['m', 'kg', 's', 'A', 'K', 'mol', 'cd', 'rad', 'sr'] as const;
    
    for (const unit of units) {
      const exp = directExponents[unit];
      if (exp !== 0) {
        if (exp === 1) {
          parts.push(unit);
        } else {
          parts.push(`${unit}${superscripts[exp] || ''}`);
        }
      }
    }
    
    return parts.join('·') || '';
  };

  // Helper to build dimensional formula from Custom tab exponents
  const buildDirectDimensions = (): DimensionalFormula => {
    const dims: DimensionalFormula = {};
    
    // Map exponent keys to DimensionalFormula keys
    const keyMap: Record<string, keyof DimensionalFormula> = {
      'm': 'length',
      'kg': 'mass',
      's': 'time',
      'A': 'current',
      'K': 'temperature',
      'mol': 'amount',
      'cd': 'intensity',
      'rad': 'angle',
      'sr': 'solid_angle'
    };
    
    for (const [unit, dimKey] of Object.entries(keyMap)) {
      const exp = directExponents[unit];
      if (exp !== 0) {
        dims[dimKey] = exp;
      }
    }
    
    return dims;
  };

  // Helper to handle keyboard navigation for category switching
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      
      // Get flat list of all categories in order
      const allCategories = CATEGORY_GROUPS.flatMap(group => group.categories);
      const currentIndex = allCategories.indexOf(activeCategory);
      
      if (currentIndex === -1) return;
      
      let newIndex: number;
      if (e.key === 'ArrowUp') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : allCategories.length - 1;
      } else {
        newIndex = currentIndex < allCategories.length - 1 ? currentIndex + 1 : 0;
      }
      
      setActiveCategory(allCategories[newIndex] as UnitCategory);
      setInputValue('1');
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 md:px-8 md:pb-8 md:pt-1 grid md:grid-cols-[260px_1fr] gap-8">
      
      {/* Sidebar */}
      <nav className={`space-y-2 h-fit sticky top-0 pr-2 -mt-1 transition-opacity ${activeTab === 'custom' ? 'opacity-40 pointer-events-none' : ''}`}>
        {CATEGORY_GROUPS.map((group) => (
          <div key={group.name} className="space-y-1">
            <h2 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/80 px-2 font-bold">{t(group.name)}</h2>
            <div className="space-y-0">
              {group.categories.map((catId) => {
                const cat = CONVERSION_DATA.find(c => c.id === catId);
                if (!cat) return null;
                const isSelected = activeTab === 'converter' && activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id as UnitCategory); setInputValue('1'); }}
                    disabled={activeTab === 'custom'}
                    className={`w-full text-left px-3 py-[1px] rounded-sm text-xs font-medium transition-all duration-200 border-l-2 flex items-center justify-between group ${
                      isSelected 
                        ? 'border-accent text-accent' 
                        : 'hover:bg-muted/50 border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t(cat.name)}
                    {isSelected && (
                      <motion.div layoutId="active-indicator" className="w-1 h-1 rounded-full bg-accent" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Main Content Area with Tabs */}
      <div className="space-y-4 -mt-1">
        {/* Header with formatting options */}
        <div className="mb-2">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('converter')}
                className={`text-sm px-4 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'converter'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                {...testId('tab-converter')}
              >
                {t('Converter')}
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`text-sm px-4 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'custom'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                {...testId('tab-custom')}
              >
                {t('Custom')}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <Label className="text-xs text-muted-foreground">{t('Number formatting')}</Label>
              <Select 
                value={numberFormat} 
                onValueChange={(val) => { 
                  const newFormat = val as NumberFormat;
                  const oldFormat = numberFormat;
                  // If switching away from Arabic format, set language to English
                  if (oldFormat === 'arabic' && newFormat !== 'arabic') {
                    setLanguage('en');
                  }
                  // Reformat input value with new format
                  reformatInputValue(oldFormat, newFormat);
                  setNumberFormat(newFormat); 
                  refocusInput(); 
                }}
                onOpenChange={(open) => { if (!open) refocusInput(); }}
              >
                <SelectTrigger tabIndex={6} className="h-10 w-[180px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uk" className="text-xs">English</SelectItem>
                  <SelectItem value="europe-latin" className="text-xs">World</SelectItem>
                  <SelectItem value="period" className="text-xs">Period</SelectItem>
                  <SelectItem value="comma" className="text-xs">Comma</SelectItem>
                  <SelectItem value="arabic" className="text-xs">العربية</SelectItem>
                  <SelectItem value="east-asian" className="text-xs">East Asian</SelectItem>
                  <SelectItem value="south-asian" className="text-xs">South Asian (Indian)</SelectItem>
                  <SelectItem value="swiss" className="text-xs">Swiss</SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={numberFormat === 'arabic' ? '' : language} 
                onValueChange={(val) => { setLanguage(val); refocusInput(); }}
                onOpenChange={(open) => { if (!open) refocusInput(); }}
                disabled={numberFormat === 'arabic'}
              >
                <SelectTrigger tabIndex={7} className="h-10 w-[75px] text-xs">
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent className="max-h-[50vh]">
                  {ISO_LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang} className="text-xs">{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {activeTab === 'converter' && (
            <div className="mt-2">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">{t(applyRegionalSpelling(categoryData.name))}</h1>
              <p className="text-muted-foreground text-sm font-mono mt-1">
                {t('Base unit:')} <span className="text-primary">{t(applyRegionalSpelling(toTitleCase(categoryData.baseUnit)))}</span>
              </p>
            </div>
          )}
          {activeTab === 'custom' && (
            <div className="mt-2">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('Custom Entry')}</h1>
              <p className="text-muted-foreground text-sm font-mono mt-1">
                {t('Build dimensional units from SI base units')}
              </p>
            </div>
          )}
        </div>

        {/* Fixed-height content container - both tabs rendered, only active one visible */}
        <div className="grid">
          {/* Converter Tab Content - always rendered, visibility controlled with opacity transition */}
          <Card 
            className={`w-full p-6 md:p-8 bg-card border-border/50 shadow-xl relative overflow-hidden col-start-1 row-start-1 transition-opacity duration-150 ${
              activeTab === 'converter' ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

          <div className="grid gap-8 relative z-10">
            
            {/* Input Section - gap-2 to align with Custom tab's Value label spacing */}
            <div className="grid gap-2">
              <Label className="text-xs font-mono uppercase text-muted-foreground">{t('From')}</Label>
              <div className="flex flex-col gap-2">
                {/* Row 1: Input, Prefix, Unit Selector */}
                <div className="flex gap-2">
                  <Input 
                    ref={inputRef}
                    type="text" 
                    inputMode="decimal"
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    onBlur={handleInputBlur}
                    tabIndex={1}
                    className="font-mono px-4 bg-background/50 border-border focus:border-accent focus:ring-accent/20 transition-all text-left"
                    style={{ height: FIELD_HEIGHT, fontSize: '0.875rem', width: CommonFieldWidth }}
                    placeholder={getPlaceholder()}
                    {...testId('input-value')}
                  />
                  
                  {/* Prefix Dropdown */}
                  <Select 
                    value={fromPrefix} 
                    onValueChange={(val) => { 
                      const normalized = normalizeMassUnit(fromUnit, val);
                      setFromUnit(normalized.unit);
                      setFromPrefix(normalized.prefix);
                      refocusInput(); 
                    }}
                    onOpenChange={(open) => { if (!open) refocusInput(); }}
                    disabled={!fromUnitData?.allowPrefixes && !KG_TO_GRAM_UNIT_PAIRS[fromUnit]}
                  >
                    <SelectTrigger tabIndex={2} className="w-[50px] bg-background/30 border-border font-medium disabled:opacity-50 disabled:cursor-not-allowed shrink-0" style={{ height: FIELD_HEIGHT }}>
                      <SelectValue placeholder={t('Prefix')} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[50vh]">
                      {(activeCategory === 'data' ? ALL_PREFIXES : PREFIXES).map((p) => (
                        <SelectItem key={p.id} value={p.id} className="font-mono text-sm">
                          {p.symbol || '-'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select 
                    value={fromUnit} 
                    onValueChange={(val) => { setFromUnit(val); setFromPrefix('none'); refocusInput(); }}
                    onOpenChange={(open) => { if (!open) refocusInput(); }}
                  >
                    <SelectTrigger tabIndex={3} className="flex-1 min-w-0 bg-background/30 border-border font-medium" style={{ height: FIELD_HEIGHT }}>
                      <SelectValue placeholder={t('Unit')} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[50vh]">
                      {filteredUnits.map((u) => (
                        <SelectItem key={u.id} value={u.id} className="font-mono text-sm">
                          {u.symbol === u.name ? (
                            <span className="font-bold">{u.symbol}</span>
                          ) : (
                            <>
                              <span className="font-bold mr-2">{u.symbol}</span>
                              <span className="opacity-70">{translateUnitName(u.name)}</span>
                            </>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Row 2: Base Factor, Spacer, SI Base Units */}
                <div className="flex gap-2">
                  <motion.div 
                    className={`px-3 rounded bg-muted/20 border border-border/50 select-none flex flex-col justify-center ${fromUnitData ? 'cursor-pointer hover:bg-muted/40 active:bg-muted/60' : ''}`}
                    style={{ height: FIELD_HEIGHT, width: CommonFieldWidth }}
                    onClick={copyFromBaseFactor}
                    animate={{
                      opacity: flashFromBaseFactor ? [1, 0.3, 1] : 1,
                      scale: flashFromBaseFactor ? [1, 1.02, 1] : 1
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">{t('Base Factor')}</div>
                    <div className="font-mono text-sm text-foreground/80 truncate" title={fromUnitData ? (fromUnitData.factor * fromPrefixData.factor).toString() : ''}>
                      {fromUnitData ? formatFactor(fromUnitData.factor * fromPrefixData.factor) : '-'}
                    </div>
                  </motion.div>
                  <div className="w-[50px] shrink-0" />
                  <motion.div 
                    className={`px-3 rounded bg-muted/20 border border-border/50 select-none flex flex-col justify-center flex-1 min-w-0 ${formatDimensions(getCategoryDimensions(activeCategory)) ? 'cursor-pointer hover:bg-muted/40 active:bg-muted/60' : ''}`}
                    style={{ height: FIELD_HEIGHT }}
                    onClick={copyFromSIBase}
                    animate={{
                      opacity: flashFromSIBase ? [1, 0.3, 1] : 1,
                      scale: flashFromSIBase ? [1, 1.02, 1] : 1
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">{t('SI Base Units')}</div>
                    <div className="font-mono text-sm text-foreground/80 truncate">
                      {formatDimensions(getCategoryDimensions(activeCategory)) || '-'}
                    </div>
                  </motion.div>
                </div>
              </div>

              {fromUnitData?.description && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="w-3 h-3" /> {fromUnitData.description}
                </p>
              )}
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={swapUnits}
                className="rounded-full w-10 h-10 border-border bg-background hover:border-accent hover:text-accent transition-colors"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </Button>
            </div>

            {/* Output Section */}
            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-between" style={{ width: CommonFieldWidth }}>
                  <Label className="text-xs font-mono uppercase text-muted-foreground">{t('To')}</Label>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">{t('Precision')}</Label>
                    <Select 
                      value={precision.toString()} 
                      onValueChange={(val) => { setPrecision(parseInt(val)); refocusInput(); }}
                      onOpenChange={(open) => { if (!open) refocusInput(); }}
                    >
                      <SelectTrigger tabIndex={4} className="h-10 w-[70px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent align="end">
                        {[0,1,2,3,4,5,6,7,8].map(n => (
                          <SelectItem key={n} value={n.toString()} className="text-xs">
                            {numberFormat === 'arabic' ? toArabicNumerals(n.toString()) : n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="w-[50px] shrink-0" />
                <div className="flex-1 min-w-0 flex justify-end">
                  <Button
                    variant={comparisonMode ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setComparisonMode(!comparisonMode)}
                    className={`h-6 px-2 text-[10px] font-mono uppercase ${comparisonMode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground border !border-border/30'}`}
                    data-testid="button-comparison-mode"
                  >
                    {t('Compare All')}
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {/* Row 1: Result, Prefix, Unit Selector */}
                <div className="flex gap-2">
                  <motion.div 
                    className={`px-4 bg-background/50 border border-border rounded-md flex items-center overflow-x-auto text-left justify-start select-none ${result !== null ? 'cursor-pointer hover:bg-background/70 active:bg-background/90' : ''}`}
                    style={{ height: FIELD_HEIGHT, width: CommonFieldWidth, pointerEvents: 'auto' }}
                    onClick={() => result !== null && copyResult()}
                    animate={{
                      opacity: flashCopyResult ? [1, 0.3, 1] : 1,
                      scale: flashCopyResult ? [1, 1.02, 1] : 1
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="font-mono text-primary whitespace-nowrap" style={{ fontSize: '0.875rem' }}>
                      {result !== null 
                        ? (toUnit === 'deg_dms' 
                            ? formatDMS(result) 
                            : toUnit === 'ft_in'
                              ? formatFtIn(result)
                              : formatResultValue(result, precision)) 
                        : '...'}
                    </span>
                  </motion.div>

                  {/* Prefix Dropdown */}
                  <Select 
                    value={toPrefix} 
                    onValueChange={(val) => {
                      const normalized = normalizeMassUnit(toUnit, val);
                      setToUnit(normalized.unit);
                      setToPrefix(normalized.prefix);
                    }}
                    disabled={!toUnitData?.allowPrefixes && !KG_TO_GRAM_UNIT_PAIRS[toUnit]}
                  >
                    <SelectTrigger className="w-[50px] bg-background/30 border-border font-medium disabled:opacity-50 disabled:cursor-not-allowed shrink-0" style={{ height: FIELD_HEIGHT }}>
                      <SelectValue placeholder={t('Prefix')} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[50vh]">
                      {(activeCategory === 'data' ? ALL_PREFIXES : PREFIXES).map((p) => (
                        <SelectItem key={p.id} value={p.id} className="font-mono text-sm">
                          {p.symbol || '-'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={toUnit} onValueChange={(val) => { setToUnit(val); setToPrefix('none'); }}>
                    <SelectTrigger className="flex-1 min-w-0 bg-background/30 border-border font-medium" style={{ height: FIELD_HEIGHT }}>
                      <SelectValue placeholder={t('Unit')} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[50vh]">
                      {toFilteredUnits.map((u) => (
                        <SelectItem key={u.id} value={u.id} className="font-mono text-sm">
                          {u.symbol === u.name ? (
                            <span className="font-bold">{u.symbol}</span>
                          ) : (
                            <>
                              <span className="font-bold mr-2">{u.symbol}</span>
                              <span className="opacity-70">{translateUnitName(u.name)}</span>
                            </>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Row 2: Base Factor, Spacer, SI Base Units */}
                <div className="flex gap-2">
                  <motion.div 
                    className={`px-3 rounded bg-muted/20 border border-border/50 select-none flex flex-col justify-center ${toUnitData ? 'cursor-pointer hover:bg-muted/40 active:bg-muted/60' : ''}`}
                    style={{ height: FIELD_HEIGHT, width: CommonFieldWidth }}
                    onClick={copyToBaseFactor}
                    animate={{
                      opacity: flashToBaseFactor ? [1, 0.3, 1] : 1,
                      scale: flashToBaseFactor ? [1, 1.02, 1] : 1
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">{t('Base Factor')}</div>
                    <div className="font-mono text-sm text-foreground/80 truncate" title={toUnitData ? (toUnitData.factor * toPrefixData.factor).toString() : ''}>
                      {toUnitData ? formatFactor(toUnitData.factor * toPrefixData.factor) : '-'}
                    </div>
                  </motion.div>
                  <div className="w-[50px] shrink-0" />
                  <motion.div 
                    className={`px-3 rounded bg-muted/20 border border-border/50 select-none flex flex-col justify-center flex-1 min-w-0 ${formatDimensions(getCategoryDimensions(activeCategory)) ? 'cursor-pointer hover:bg-muted/40 active:bg-muted/60' : ''}`}
                    style={{ height: FIELD_HEIGHT }}
                    onClick={copyToSIBase}
                    animate={{
                      opacity: flashToSIBase ? [1, 0.3, 1] : 1,
                      scale: flashToSIBase ? [1, 1.02, 1] : 1
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">{t('SI Base Units')}</div>
                    <div className="font-mono text-sm text-foreground/80 truncate">
                      {formatDimensions(getCategoryDimensions(activeCategory)) || '-'}
                    </div>
                  </motion.div>
                </div>
              </div>

              <div className="grid sm:grid-cols-[1fr_auto] gap-2 items-start">
                <div className="space-y-2">
                  {toUnitData?.description && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Info className="w-3 h-3" /> {toUnitData.description}
                    </p>
                  )}
                  {result !== null && fromUnitData && toUnitData && (
                    <motion.div 
                      className="p-2 rounded bg-muted/20 border border-border/50 cursor-pointer hover:bg-muted/40 active:bg-muted/60 select-none"
                      onClick={copyConversionRatio}
                      animate={{
                        opacity: flashConversionRatio ? [1, 0.3, 1] : 1,
                        scale: flashConversionRatio ? [1, 1.02, 1] : 1
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-xs font-mono text-muted-foreground flex gap-2 items-center">
                        <span className="text-foreground font-bold">
                          {NUMBER_FORMATS[numberFormat].useArabicNumerals ? '١' : '1'} {fromPrefixData.id !== 'none' ? fromPrefixData.symbol : ''}{fromUnitData.symbol}
                        </span>
                        <span>=</span>
                        <span className="text-foreground font-bold">
                          {toUnit === 'deg_dms'
                            ? formatDMS(convert(1, fromUnit, toUnit, activeCategory, fromPrefixData.factor, toPrefixData.factor))
                            : toUnit === 'ft_in'
                              ? formatFtIn(convert(1, fromUnit, toUnit, activeCategory, fromPrefixData.factor, toPrefixData.factor))
                              : `${formatResultValue(convert(1, fromUnit, toUnit, activeCategory, fromPrefixData.factor, toPrefixData.factor), precision)} ${toPrefixData.id !== 'none' ? toPrefixData.symbol : ''}${toUnitData.symbol}`}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { copyResult(); refocusInput(); }}
                  onBlur={refocusInput}
                  tabIndex={5}
                  className="text-xs hover:text-accent gap-2 border !border-border/30"
                >
                  <Copy className="w-3 h-3" />
                  <motion.span
                    animate={{
                      opacity: flashCopyResult ? [1, 0.3, 1] : 1,
                      scale: flashCopyResult ? [1, 1.1, 1] : 1
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {t('Copy')}
                  </motion.span>
                </Button>
              </div>

              {/* Comparison Mode Panel */}
              <AnimatePresence>
                {comparisonMode && result !== null && fromUnitData && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                    data-testid="comparison-panel"
                  >
                    <div className="mt-4 p-3 rounded-lg bg-muted/10 border border-border/30">
                      <div className="text-[10px] font-mono text-muted-foreground mb-2">
                        <span className="uppercase">{t('Compare')}</span> {inputValue} {fromPrefixData.id !== 'none' ? fromPrefixData.symbol : ''}{fromUnitData.symbol}
                      </div>
                      <div className="grid gap-1">
                        {(() => {
                          // Get all units in category, always include SI base first if not the source
                          const allUnits = categoryData.units.filter(u => u.id !== fromUnit);
                          // Limit to 8 most relevant units, but ensure important units are included
                          let displayUnits = allUnits.slice(0, 8);
                          
                          // For length, ensure ly (light-year) is included
                          if (activeCategory === 'length') {
                            const lyUnit = allUnits.find(u => u.id === 'ly');
                            if (lyUnit && !displayUnits.find(u => u.id === 'ly')) {
                              displayUnits = [...displayUnits.slice(0, 7), lyUnit];
                            }
                          }
                          
                          return displayUnits.map(unit => {
                            // Convert to the target unit (no prefix)
                            const convertedValue = convert(
                              parseFloat(inputValue) || 0,
                              fromUnit,
                              unit.id,
                              activeCategory,
                              fromPrefixData.factor,
                              1 // No prefix on target for comparison
                            );
                            
                            // For units with prefixes, find optimal prefix and calculate display value
                            const nonePrefix = PREFIXES.find(p => p.id === 'none')!;
                            let displayPrefix = nonePrefix;
                            let displayValue = convertedValue;
                            
                            if (unit.allowPrefixes && Math.abs(convertedValue) > 0) {
                              // findOptimalPrefix returns { prefix, adjustedValue }
                              const optimal = findOptimalPrefix(convertedValue, unit.symbol, precision);
                              displayPrefix = optimal.prefix;
                              displayValue = optimal.adjustedValue;
                            }
                            
                            // Use applyPrefixToKgUnit for proper kg prefix handoff (kg → Mg, mg, etc.)
                            const kgResult = applyPrefixToKgUnit(unit.symbol, displayPrefix.id);
                            const displaySymbol = kgResult.showPrefix 
                              ? `${displayPrefix.symbol}${kgResult.displaySymbol}`
                              : kgResult.displaySymbol;
                            
                            return (
                              <div 
                                key={unit.id}
                                className="flex justify-between items-center px-2 py-1 rounded hover:bg-muted/20 cursor-pointer select-none"
                                onClick={() => {
                                  // Copy this value to clipboard
                                  const copyText = `${displayValue.toFixed(precision)}`;
                                  navigator.clipboard.writeText(copyText);
                                }}
                                data-testid={`comparison-row-${unit.id}`}
                              >
                                <span className="text-xs text-muted-foreground font-mono">
                                  {displaySymbol}
                                </span>
                                <span className="text-sm font-mono text-foreground">
                                  {formatNumberWithSeparators(displayValue, precision)}
                                </span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            </div>
          </Card>

          {/* Custom Tab Content - always rendered, visibility controlled with opacity transition */}
          <Card 
            className={`w-full p-6 md:p-8 bg-card border-border/50 shadow-xl relative overflow-hidden col-start-1 row-start-1 transition-opacity duration-150 ${
              activeTab === 'custom' ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          
          <div className="flex flex-col gap-6 relative z-10">
            {/* Top row: Value input, Result display, and Copy button */}
            <div className="flex items-end gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-mono uppercase text-muted-foreground">{t('Value')}</Label>
                <Input 
                  type="text"
                  inputMode="text"
                  value={directValue}
                  onChange={(e) => {
                    // Allow more characters for unit expressions (letters, symbols, spaces)
                    setDirectValue(e.target.value);
                  }}
                  onBlur={(e) => {
                    // Parse unit expressions on blur (e.g., "12 GPa", "45°", "10 deg")
                    const text = e.target.value.trim();
                    if (!text) return;
                    
                    // Check if it contains non-numeric characters (suggesting a unit expression)
                    const hasUnitPart = /[a-zA-Z°⋅·×\^⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/.test(text);
                    if (hasUnitPart) {
                      const parsed = parseUnitText(text);
                      if (parsed.value && (Object.keys(parsed.dimensions).length > 0 || parsed.categoryId)) {
                        // Update value with parsed numeric value (including conversions)
                        setDirectValue(parsed.value.toString());
                        
                        // Update dimension grid from parsed dimensions
                        const newExponents: Record<string, number> = {
                          m: 0, kg: 0, s: 0, A: 0, K: 0, mol: 0, cd: 0, rad: 0, sr: 0
                        };
                        
                        if (parsed.dimensions.length) newExponents.m = parsed.dimensions.length;
                        if (parsed.dimensions.mass) newExponents.kg = parsed.dimensions.mass;
                        if (parsed.dimensions.time) newExponents.s = parsed.dimensions.time;
                        if (parsed.dimensions.current) newExponents.A = parsed.dimensions.current;
                        if (parsed.dimensions.temperature) newExponents.K = parsed.dimensions.temperature;
                        if (parsed.dimensions.amount) newExponents.mol = parsed.dimensions.amount;
                        if (parsed.dimensions.intensity) newExponents.cd = parsed.dimensions.intensity;
                        if (parsed.dimensions.angle) newExponents.rad = parsed.dimensions.angle;
                        if (parsed.dimensions.solid_angle) newExponents.sr = parsed.dimensions.solid_angle;
                        
                        // Check if any exponent is outside -5..5 range - if so, clear the grid
                        const hasOutOfRange = Object.values(newExponents).some(exp => exp < -5 || exp > 5);
                        if (hasOutOfRange) {
                          // Keep value but clear the dimension grid
                          setDirectExponents({ m: 0, kg: 0, s: 0, A: 0, K: 0, mol: 0, cd: 0, rad: 0, sr: 0 });
                        } else {
                          setDirectExponents(newExponents);
                        }
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    // Parse unit expressions on Enter
                    if (e.key === 'Enter') {
                      e.currentTarget.blur(); // Triggers onBlur handler
                    }
                  }}
                  className="font-mono px-4 bg-background/50 border-border focus:border-accent focus:ring-accent/20 transition-all text-left"
                  style={{ height: FIELD_HEIGHT, fontSize: '0.875rem', width: CommonFieldWidth }}
                  placeholder="0"
                  {...testId('custom-input-value')}
                />
              </div>
              
              {/* Result display */}
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-mono uppercase text-muted-foreground">{t('Result')}</Label>
                <motion.div 
                  className="px-4 bg-background/50 border border-border rounded-md font-mono text-primary cursor-pointer hover:bg-background/70 flex items-center justify-between gap-4"
                  style={{ height: FIELD_HEIGHT, minWidth: CommonFieldWidth }}
                  onClick={() => {
                    const numValue = parseNumberWithFormat(directValue);
                    if (isNaN(numValue) || !directValue) return;
                    const unitSymbol = buildDirectUnitSymbol();
                    const valueStr = formatForClipboard(numValue, precision);
                    const textToCopy = unitSymbol ? `${valueStr} ${unitSymbol}` : valueStr;
                    navigator.clipboard.writeText(textToCopy);
                    triggerFlashDirectCopy();
                    
                    // Add to calculator - same behavior as Converter pane result click
                    const dims = buildDirectDimensions();
                    const newEntry = {
                      value: numValue,
                      dimensions: dims,
                      prefix: 'none'
                    };
                    
                    if (calculatorMode === 'rpn') {
                      // RPN mode: Push onto stack position x with stack lift
                      saveRpnStackForUndo();
                      setRpnStack(prev => {
                        const newStack = [...prev];
                        newStack[0] = prev[1];
                        newStack[1] = prev[2];
                        newStack[2] = prev[3];
                        newStack[3] = newEntry;
                        return newStack;
                      });
                      setRpnResultPrefix('none');
                      setRpnSelectedAlternative(0);
                      triggerFlashRpnResult();
                    } else {
                      // UNIT mode: Find first empty field in positions 0-2
                      const firstEmptyIndex = calcValues.findIndex((v, i) => i < 3 && v === null);
                      if (firstEmptyIndex !== -1) {
                        const newCalcValues = [...calcValues];
                        newCalcValues[firstEmptyIndex] = newEntry;
                        setCalcValues(newCalcValues);
                      }
                    }
                  }}
                  animate={{
                    opacity: flashDirectCopy ? [1, 0.3, 1] : 1,
                    scale: flashDirectCopy ? [1, 1.02, 1] : 1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {(() => {
                    const numValue = parseNumberWithFormat(directValue);
                    const unitSymbol = buildDirectUnitSymbol();
                    if (isNaN(numValue) || !directValue) return <span>...</span>;
                    return (
                      <>
                        <span>{formatResultValue(numValue, precision)}</span>
                        <span className="text-muted-foreground">{unitSymbol}</span>
                      </>
                    );
                  })()}
                </motion.div>
              </div>
              
              {/* Paste button aligned far right */}
              <div className="flex-1 flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      if (!text) return;
                      
                      const parsed = parseUnitText(text);
                      setDirectValue(parsed.value.toString());
                      
                      const newExponents: Record<string, number> = {
                        m: 0, kg: 0, s: 0, A: 0, K: 0, mol: 0, cd: 0, rad: 0, sr: 0
                      };
                      
                      if (parsed.dimensions.length) newExponents.m = parsed.dimensions.length;
                      if (parsed.dimensions.mass) newExponents.kg = parsed.dimensions.mass;
                      if (parsed.dimensions.time) newExponents.s = parsed.dimensions.time;
                      if (parsed.dimensions.current) newExponents.A = parsed.dimensions.current;
                      if (parsed.dimensions.temperature) newExponents.K = parsed.dimensions.temperature;
                      if (parsed.dimensions.amount) newExponents.mol = parsed.dimensions.amount;
                      if (parsed.dimensions.intensity) newExponents.cd = parsed.dimensions.intensity;
                      if (parsed.dimensions.angle) newExponents.rad = parsed.dimensions.angle;
                      if (parsed.dimensions.solid_angle) newExponents.sr = parsed.dimensions.solid_angle;
                      
                      const hasOutOfRange = Object.values(newExponents).some(exp => exp < -5 || exp > 5);
                      if (hasOutOfRange) {
                        setDirectExponents({ m: 0, kg: 0, s: 0, A: 0, K: 0, mol: 0, cd: 0, rad: 0, sr: 0 });
                      } else {
                        setDirectExponents(newExponents);
                      }
                    } catch (err) {
                      console.error('Failed to read clipboard:', err);
                    }
                  }}
                  className="text-xs hover:text-accent gap-2 border !border-border/30"
                  style={{ height: FIELD_HEIGHT }}
                  {...testId('custom-paste-button')}
                >
                  <ClipboardPaste className="w-3 h-3" />
                  {t('Paste')}
                </Button>
              </div>
            </div>
            
            {/* Unit selector grid */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-mono uppercase text-muted-foreground">{t('Dimensions')}</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setDirectExponents({
                    m: 0, kg: 0, s: 0, A: 0, K: 0, mol: 0, cd: 0, rad: 0, sr: 0
                  })}
                  className="text-xs hover:text-accent border !border-border/30"
                >
                  {t('Clear')}
                </Button>
              </div>
              {([
                { unit: 'm', quantity: 'Length' },
                { unit: 'kg', quantity: 'Mass' },
                { unit: 's', quantity: 'Time' },
                { unit: 'A', quantity: 'Electric Current' },
                { unit: 'K', quantity: 'Temperature' },
                { unit: 'mol', quantity: 'Amount of Substance' },
                { unit: 'cd', quantity: 'Luminous Intensity' },
                { unit: 'rad', quantity: 'Plane Angle' },
                { unit: 'sr', quantity: 'Solid Angle' }
              ] as const).map(({ unit, quantity }) => (
                <div key={unit} className="flex items-center gap-2">
                  <span className="text-xs w-32 text-right text-muted-foreground truncate" title={t(quantity)}>{t(quantity)}</span>
                  <div className="flex gap-0">
                    {[5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5].map((exp) => {
                      const superscripts: Record<number, string> = {
                        1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵',
                        [-1]: '⁻¹', [-2]: '⁻²', [-3]: '⁻³', [-4]: '⁻⁴', [-5]: '⁻⁵'
                      };
                      const label = exp === 0 ? '-' : `${unit}${superscripts[exp] || ''}`;
                      const isSelected = directExponents[unit] === exp;
                      return (
                        <button
                          key={exp}
                          onClick={() => setDirectExponents(prev => ({ ...prev, [unit]: exp }))}
                          className={`w-12 h-7 text-xs font-mono border transition-all text-center shrink-0 ${
                            isSelected 
                              ? 'bg-accent text-accent-foreground border-accent' 
                              : 'bg-background/30 border-border/50 hover:bg-muted/50 text-muted-foreground'
                          } ${exp === 5 ? 'rounded-l' : ''} ${exp === -5 ? 'rounded-r' : ''}`}
                          {...testId(`custom-exp-${unit}-${exp}`)}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Copy button at bottom, aligned far right */}
            <div className="flex justify-end mt-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  const numValue = parseNumberWithFormat(directValue);
                  if (isNaN(numValue) || !directValue) return;
                  const unitSymbol = buildDirectUnitSymbol();
                  const valueStr = formatForClipboard(numValue, precision);
                  const textToCopy = unitSymbol ? `${valueStr} ${unitSymbol}` : valueStr;
                  navigator.clipboard.writeText(textToCopy);
                  triggerFlashDirectCopy();
                  
                  // Add to calculator - same behavior as Converter pane
                  const dims = buildDirectDimensions();
                  const newEntry = {
                    value: numValue,
                    dimensions: dims,
                    prefix: 'none'
                  };
                  
                  if (calculatorMode === 'rpn') {
                    // RPN mode: Push onto stack position x with stack lift
                    saveRpnStackForUndo();
                    setRpnStack(prev => {
                      const newStack = [...prev];
                      newStack[0] = prev[1];
                      newStack[1] = prev[2];
                      newStack[2] = prev[3];
                      newStack[3] = newEntry;
                      return newStack;
                    });
                    setRpnResultPrefix('none');
                    setRpnSelectedAlternative(0);
                    triggerFlashRpnResult();
                  } else {
                    // UNIT mode: Find first empty field in positions 0-2
                    const firstEmptyIndex = calcValues.findIndex((v, i) => i < 3 && v === null);
                    if (firstEmptyIndex !== -1) {
                      const newCalcValues = [...calcValues];
                      newCalcValues[firstEmptyIndex] = newEntry;
                      setCalcValues(newCalcValues);
                    }
                  }
                }}
                className="text-xs hover:text-accent gap-2 border !border-border/30"
                {...testId('custom-copy-button')}
              >
                <Copy className="w-3 h-3" />
                <motion.span
                  animate={{
                    opacity: flashDirectCopy ? [1, 0.3, 1] : 1,
                    scale: flashDirectCopy ? [1, 1.1, 1] : 1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {t('Copy')}
                </motion.span>
              </Button>
            </div>
          </div>
          </Card>
        </div>

        {/* Mini Calculator */}
        <Card className="w-full p-6 bg-card border-border/50">
          {/* Simple Calculator Header - aligned with grid below */}
          {calculatorMode === 'simple' && (
            <div 
              className="grid gap-2 mb-4 items-center"
              style={{ gridTemplateColumns: `${CommonFieldWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${ClearBtnWidth}` }}
            >
              {/* Column 1: Calculator label (left) and Precision (right-aligned with field below) - constrained width */}
              <div className="flex items-center justify-between" style={{ width: CommonFieldWidth, maxWidth: CommonFieldWidth }}>
                <Label 
                  className="text-xs font-mono uppercase text-foreground cursor-pointer hover:text-accent transition-colors px-2 py-1 rounded border border-border/30"
                  onClick={() => switchToRpn()}
                >
                  {t('CALCULATOR') + ' ⇅'}
                </Label>
                <div className="flex items-center gap-1">
                  <Label className="text-xs text-foreground">{t('Precision')}</Label>
                  <Select 
                    value={calculatorPrecision.toString()} 
                    onValueChange={(val) => setCalculatorPrecision(parseInt(val))}
                  >
                    <SelectTrigger className="h-8 w-[50px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(p => (
                        <SelectItem key={p} value={p.toString()} className="text-xs">
                          {numberFormat === 'arabic' ? toArabicNumerals(p.toString()) : p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Column 2: Clear calculator - left-aligned with × button */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearCalculator}
                className="text-xs text-foreground hover:text-accent border !border-border/30"
                style={{ justifySelf: 'start' }}
              >
                {t('Clear calculator')}
              </Button>
              {/* Spacer columns for / + - Clear */}
              <div />
              <div />
              <div />
              <div />
            </div>
          )}
          
          {/* RPN Calculator Header - single line aligned with stack grid */}
          {calculatorMode === 'rpn' && (
            <div 
              className="grid gap-2 mb-4 items-center"
              style={{ gridTemplateColumns: `${CommonFieldWidth} repeat(8, ${RpnBtnWidth})` }}
            >
              {/* Column 1: Calculator label (far left) and Precision (right-aligned) - constrained to CommonFieldWidth */}
              <div className="flex items-center justify-between" style={{ width: CommonFieldWidth, maxWidth: CommonFieldWidth }}>
                <Label 
                  className="text-xs font-mono uppercase text-foreground cursor-pointer hover:text-accent transition-colors px-2 py-1 rounded border border-border/30"
                  onClick={() => switchToSimple()}
                >
                  {t('CALCULATOR - RPN') + ' ⇅'}
                </Label>
                <div className="flex items-center gap-1">
                  <Label className="text-xs text-foreground">{t('Precision')}</Label>
                  <Select 
                    value={calculatorPrecision.toString()} 
                    onValueChange={(val) => setCalculatorPrecision(parseInt(val))}
                  >
                    <SelectTrigger className="h-8 w-[50px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(p => (
                        <SelectItem key={p} value={p.toString()} className="text-xs">
                          {numberFormat === 'arabic' ? toArabicNumerals(p.toString()) : p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Column 2: Clear calculator - left-aligned with x² button */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearRpnStack}
                className="text-xs text-foreground hover:text-accent border !border-border/30"
                style={{ justifySelf: 'start' }}
              >
                {t('Clear calculator')}
              </Button>
              {/* Spacer columns 3-7 */}
              <span style={{ gridColumn: 'span 6' }}></span>
              {/* Column 9: Paste - far right */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (!text) return;
                    const parsed = parseUnitText(text);
                    const dims: Record<string, number> = {};
                    if (parsed.dimensions.length) dims.length = parsed.dimensions.length;
                    if (parsed.dimensions.mass) dims.mass = parsed.dimensions.mass;
                    if (parsed.dimensions.time) dims.time = parsed.dimensions.time;
                    if (parsed.dimensions.current) dims.current = parsed.dimensions.current;
                    if (parsed.dimensions.temperature) dims.temperature = parsed.dimensions.temperature;
                    if (parsed.dimensions.amount) dims.amount = parsed.dimensions.amount;
                    if (parsed.dimensions.intensity) dims.intensity = parsed.dimensions.intensity;
                    if (parsed.dimensions.angle) dims.angle = parsed.dimensions.angle;
                    if (parsed.dimensions.solid_angle) dims.solid_angle = parsed.dimensions.solid_angle;
                    
                    const newEntry = {
                      value: parsed.value,
                      dimensions: dims,
                      prefix: parsed.prefixId || 'none'
                    };
                    
                    saveRpnStackForUndo();
                    setRpnStack(prev => {
                      const newStack = [...prev];
                      newStack[0] = prev[1];
                      newStack[1] = prev[2];
                      newStack[2] = prev[3];
                      newStack[3] = newEntry;
                      return newStack;
                    });
                    setRpnResultPrefix('none');
                    setRpnSelectedAlternative(0);
                    triggerFlashRpnResult();
                  } catch (err) {
                    console.error('Failed to read clipboard:', err);
                  }
                }}
                className="text-xs text-foreground hover:text-accent gap-2 border !border-border/30"
              >
                <ClipboardPaste className="w-3 h-3" />
                {t('Paste')}
              </Button>
            </div>
          )}
          
          {/* Fixed-height container to prevent flicker on mode switch */}
          <div style={{ minHeight: CALC_CONTENT_HEIGHT }}>
          {/* Simple Calculator Mode */}
          {calculatorMode === 'simple' && (
          <div className="space-y-2">
            {/* Field 1 */}
            <div 
              className="grid gap-2 items-center"
              style={{ gridTemplateColumns: `${CommonFieldWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${ClearBtnWidth}` }}
            >
              <CalculatorFieldDisplay
                value={calcValues[0]}
                onClick={() => copyCalcField(0)}
                isFlashing={flashCalcField1}
                formatDimensions={formatDimensions}
                applyPrefixToKgUnit={applyPrefixToKgUnit}
                formatNumberWithSeparators={formatNumberWithSeparators}
                precision={calculatorPrecision}
              />
              <div style={{ visibility: 'hidden' }} />
              <div style={{ visibility: 'hidden' }} />
              <div style={{ visibility: 'hidden' }} />
              <div style={{ visibility: 'hidden' }} />
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearField1}
                disabled={!calcValues[0]}
                className="text-xs justify-self-start border !border-border/30"
              >
                {t('Clear')}
              </Button>
            </div>

            {/* Field 2 */}
            <div 
              className="grid gap-2 items-center"
              style={{ gridTemplateColumns: `${CommonFieldWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${ClearBtnWidth}` }}
            >
              <CalculatorFieldDisplay
                value={calcValues[1]}
                onClick={() => copyCalcField(1)}
                isFlashing={flashCalcField2}
                formatDimensions={formatDimensions}
                applyPrefixToKgUnit={applyPrefixToKgUnit}
                formatNumberWithSeparators={formatNumberWithSeparators}
                precision={calculatorPrecision}
              />
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCalcOp1('*')}
                disabled={!calcValues[0] || !calcValues[1]}
                className={`text-sm w-full border !border-border/30 ${calcOp1 === '*' ? 'text-accent font-bold' : ''}`}
              >
                ×
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCalcOp1('/')}
                disabled={!calcValues[0] || !calcValues[1]}
                className={`text-sm w-full border !border-border/30 ${calcOp1 === '/' ? 'text-accent font-bold' : ''}`}
              >
                /
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCalcOp1('+')}
                disabled={!canAddSubtract(calcValues[0], calcValues[1])}
                className={`text-sm w-full border !border-border/30 ${calcOp1 === '+' ? 'text-accent font-bold' : ''}`}
              >
                +
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCalcOp1('-')}
                disabled={!canAddSubtract(calcValues[0], calcValues[1])}
                className={`text-sm w-full border !border-border/30 ${calcOp1 === '-' ? 'text-accent font-bold' : ''}`}
              >
                −
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearField2}
                disabled={!calcValues[1]}
                className="text-xs justify-self-start border !border-border/30"
              >
                {t('Clear')}
              </Button>
            </div>

            {/* Field 3 */}
            <div 
              className="grid gap-2 items-center"
              style={{ gridTemplateColumns: `${CommonFieldWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${OperatorBtnWidth} ${ClearBtnWidth}` }}
            >
              <CalculatorFieldDisplay
                value={calcValues[2]}
                onClick={() => copyCalcField(2)}
                isFlashing={flashCalcField3}
                formatDimensions={formatDimensions}
                applyPrefixToKgUnit={applyPrefixToKgUnit}
                formatNumberWithSeparators={formatNumberWithSeparators}
                precision={calculatorPrecision}
              />
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCalcOp2('*')}
                disabled={!calcValues[1] || !calcValues[2]}
                className={`text-sm w-full border !border-border/30 ${calcOp2 === '*' ? 'text-accent font-bold' : ''}`}
              >
                ×
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCalcOp2('/')}
                disabled={!calcValues[1] || !calcValues[2]}
                className={`text-sm w-full border !border-border/30 ${calcOp2 === '/' ? 'text-accent font-bold' : ''}`}
              >
                /
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCalcOp2('+')}
                disabled={!canAddSubtract(calcValues[1], calcValues[2])}
                className={`text-sm w-full border !border-border/30 ${calcOp2 === '+' ? 'text-accent font-bold' : ''}`}
              >
                +
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCalcOp2('-')}
                disabled={!canAddSubtract(calcValues[1], calcValues[2])}
                className={`text-sm w-full border !border-border/30 ${calcOp2 === '-' ? 'text-accent font-bold' : ''}`}
              >
                −
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearField3}
                disabled={!calcValues[2]}
                className="text-xs justify-self-start border !border-border/30"
              >
                {t('Clear')}
              </Button>
            </div>

            {/* Result Field 4 */}
            <div className="flex gap-2 items-center" style={{ width: '100%' }}>
              <motion.div 
                className={`px-3 bg-muted/20 border border-accent/50 rounded-md flex items-center justify-between select-none shrink-0 ${calcValues[3] ? 'cursor-pointer hover:bg-muted/40 active:bg-muted/60' : ''}`}
                style={{ height: FIELD_HEIGHT, width: CommonFieldWidth, pointerEvents: 'auto' }}
                onClick={() => calcValues[3] && copyCalcResult()}
                animate={{
                  opacity: flashCopyCalc ? [1, 0.3, 1] : 1,
                  scale: flashCopyCalc ? [1, 1.02, 1] : 1
                }}
                transition={{ duration: 0.3 }}
              >
                {(() => {
                  const display = getCalcResultDisplay();
                  return (
                    <>
                      <span className="text-sm font-mono text-primary font-bold truncate">
                        {display?.formattedValue || ''}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground ml-2 shrink-0">
                        {display?.unitSymbol || ''}
                      </span>
                    </>
                  );
                })()}
              </motion.div>
              {/* Prefix and unit selectors - SI-only representations */}
              {calcValues[3] && !isDimensionEmpty(calcValues[3].dimensions) ? (
                (() => {
                  // Generate SI-only representations for the result dimensions
                  const siReps = generateSIRepresentations(calcValues[3]!.dimensions);
                  const currentSymbol = siReps[selectedAlternative]?.displaySymbol || formatDimensions(calcValues[3]!.dimensions);
                  
                  return (
                    <>
                      <Select 
                        value={resultPrefix} 
                        onValueChange={(val) => {
                          // Apply kg prefix handoff if current symbol contains kg
                          if (currentSymbol.includes('kg')) {
                            const normalized = normalizeMassUnit('kg', val);
                            // For SI representations, we just update the prefix
                            // The symbol display will handle kg→g switching via applyPrefixToKgUnit
                            setResultPrefix(val);
                          } else {
                            setResultPrefix(val);
                          }
                        }}
                      >
                        <SelectTrigger className="h-10 w-[50px] text-xs shrink-0">
                          <SelectValue placeholder={t('Prefix')} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[50vh]">
                          {PREFIXES.map((p) => (
                            <SelectItem key={p.id} value={p.id} className="text-xs font-mono">
                              {p.symbol || '-'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select 
                        value={selectedAlternative.toString()} 
                        onValueChange={(val) => { setSelectedAlternative(parseInt(val)); setResultPrefix('none'); }}
                      >
                        <SelectTrigger className="h-10 flex-1 min-w-0 text-xs">
                          <SelectValue placeholder="Select SI representation" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[50vh]">
                          {siReps.map((rep, index) => (
                            <SelectItem key={index} value={index.toString()} className="text-xs font-mono">
                              <span className="font-bold">{rep.displaySymbol}</span>
                              {rep.crossDomainMatches && rep.crossDomainMatches.length > 0 && (
                                <span className="ml-2 text-muted-foreground font-normal">
                                  ({rep.crossDomainMatches.join(', ')})
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  );
                })()
              ) : calcValues[3] ? (
                /* Dimensionless result - show ghosted empty selectors */
                <>
                  <Select value="none" disabled>
                    <SelectTrigger className="h-10 w-[50px] text-xs opacity-50 cursor-not-allowed shrink-0">
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-xs">-</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value="unitless" disabled>
                    <SelectTrigger className="h-10 flex-1 min-w-0 text-xs opacity-50 cursor-not-allowed">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unitless" className="text-xs"></SelectItem>
                    </SelectContent>
                  </Select>
                </>
              ) : (
                /* No result - show ghosted empty selectors for UI consistency */
                <>
                  <Select value="none" disabled>
                    <SelectTrigger className="h-10 w-[50px] text-xs opacity-50 cursor-not-allowed shrink-0">
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-xs">-</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value="empty" disabled>
                    <SelectTrigger className="h-10 flex-1 min-w-0 text-xs opacity-50 cursor-not-allowed">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="empty" className="text-xs"></SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>

            {/* Copy button row - right-aligned */}
            <div className="flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={copyCalcResult}
                disabled={!calcValues[3]}
                className="text-xs text-muted-foreground hover:text-foreground gap-2 shrink-0 border !border-border/30"
              >
                <Copy className="w-3 h-3" />
                <motion.span
                  animate={{
                    opacity: flashCopyCalc ? [1, 0.3, 1] : 1,
                    scale: flashCopyCalc ? [1, 1.1, 1] : 1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {t('Copy')}
                </motion.span>
              </Button>
            </div>
          </div>
          )}
          
          {/* RPN Calculator Mode */}
          {calculatorMode === 'rpn' && (
          <div className="space-y-2">
            {/* s3 field (top) with button grid - 8 buttons */}
            <div 
              className="grid gap-2 items-center"
              style={{ gridTemplateColumns: `${CommonFieldWidth} repeat(8, ${RpnBtnWidth})` }}
            >
              <CalculatorFieldDisplay
                value={rpnStack[0]}
                onClick={() => copyRpnField(0)}
                isFlashing={flashRpnField1}
                formatDimensions={formatDimensions}
                applyPrefixToKgUnit={applyPrefixToKgUnit}
                formatNumberWithSeparators={formatNumberWithSeparators}
                precision={calculatorPrecision}
              />
              {/* Power/Root/Exp/Log buttons for s.3 row (8 buttons) */}
              {(() => {
                const s3Buttons: Array<{ label: string; shiftLabel: string; op?: RpnUnaryOp; shiftOp?: RpnUnaryOp; binaryOp?: RpnBinaryOp } | { label: string; shiftLabel: string; isConstant: true; value: number; shiftValue: number }> = [
                  { label: 'x²ᵤ', shiftLabel: '√ᵤ', op: 'square', shiftOp: 'sqrt' },
                  { label: '1/x', shiftLabel: 'yˣ', op: 'recip', binaryOp: 'pow' },
                  { label: '+/−', shiftLabel: 'ABS', op: 'neg', shiftOp: 'abs' },
                  { label: 'eˣ', shiftLabel: 'ln', op: 'exp', shiftOp: 'ln' },
                  { label: '10ˣ', shiftLabel: 'log₁₀', op: 'pow10', shiftOp: 'log10' },
                  { label: '2ˣ', shiftLabel: 'log₂', op: 'pow2', shiftOp: 'log2' },
                  { label: 'rnd', shiftLabel: 'trunc', op: 'rnd', shiftOp: 'trunc' },
                  { label: 'π', shiftLabel: 'π⁻¹', isConstant: true, value: Math.PI, shiftValue: 1/Math.PI },
                ];
                return s3Buttons.map((btn, i) => {
                  const hasOp = 'op' in btn;
                  const hasBinaryOp = 'binaryOp' in btn;
                  const isConstant = 'isConstant' in btn;
                  const currentOp = hasOp ? (shiftActive && btn.shiftOp ? btn.shiftOp : btn.op) : undefined;
                  const currentBinaryOp = hasBinaryOp && shiftActive ? btn.binaryOp : undefined;
                  // Disable unary ops when x is empty, binary ops when x or y is empty
                  const isDisabled = currentBinaryOp 
                    ? !canApplyRpnBinary(currentBinaryOp)
                    : (hasOp && !rpnStack[3]);
                  return (
                    <Button 
                      key={`s3-btn-${i}`} 
                      variant="ghost" 
                      size="sm" 
                      className={`text-xs font-mono w-full border !border-border/30 ${isDisabled ? 'text-muted-foreground/50' : 'text-foreground hover:text-accent'}`}
                      onClick={() => {
                        if (isConstant && 'value' in btn) {
                          if (shiftActive && 'shiftValue' in btn) {
                            pushRpnConstant(btn.shiftValue);
                          } else {
                            pushRpnConstant(btn.value);
                          }
                        } else if (currentBinaryOp) {
                          applyRpnBinary(currentBinaryOp);
                        } else if (currentOp) {
                          applyRpnUnary(currentOp);
                        }
                      }}
                      disabled={isDisabled}
                    >
                      {shiftActive ? btn.shiftLabel : btn.label}
                    </Button>
                  );
                });
              })()}
            </div>

            {/* s2 field with button grid - 8 buttons */}
            <div 
              className="grid gap-2 items-center"
              style={{ gridTemplateColumns: `${CommonFieldWidth} repeat(8, ${RpnBtnWidth})` }}
            >
              <CalculatorFieldDisplay
                value={rpnStack[1]}
                onClick={() => copyRpnField(1)}
                isFlashing={flashRpnField2}
                formatDimensions={formatDimensions}
                applyPrefixToKgUnit={applyPrefixToKgUnit}
                formatNumberWithSeparators={formatNumberWithSeparators}
                precision={calculatorPrecision}
              />
              {/* Trig/Hyperbolic buttons for s2 row - 8 buttons */}
              {(() => {
                const s2Buttons: Array<{ label: string; shiftLabel: string; op: RpnUnaryOp; shiftOp: RpnUnaryOp } | { label: string; shiftLabel: string; isConstant: true; value: number; shiftValue: number }> = [
                  { label: 'sin', shiftLabel: 'asin', op: 'sin', shiftOp: 'asin' },
                  { label: 'cos', shiftLabel: 'acos', op: 'cos', shiftOp: 'acos' },
                  { label: 'tan', shiftLabel: 'atan', op: 'tan', shiftOp: 'atan' },
                  { label: 'sinh', shiftLabel: 'asinh', op: 'sinh', shiftOp: 'asinh' },
                  { label: 'cosh', shiftLabel: 'acosh', op: 'cosh', shiftOp: 'acosh' },
                  { label: 'tanh', shiftLabel: 'atanh', op: 'tanh', shiftOp: 'atanh' },
                  { label: '⌊x⌋', shiftLabel: '⌈x⌉', op: 'floor', shiftOp: 'ceil' },
                  { label: 'ℯ', shiftLabel: 'ℯ⁻¹', isConstant: true, value: Math.E, shiftValue: 1/Math.E },
                ];
                return s2Buttons.map((btn, i) => {
                  const hasOp = 'op' in btn;
                  const isConstant = 'isConstant' in btn;
                  const currentOp = hasOp ? (shiftActive ? btn.shiftOp : btn.op) : undefined;
                  const isDisabled = hasOp && !rpnStack[3];
                  return (
                    <Button 
                      key={`s2-btn-${i}`} 
                      variant="ghost" 
                      size="sm" 
                      className={`text-xs font-mono w-full border !border-border/30 ${isDisabled ? 'text-muted-foreground/50' : 'text-foreground hover:text-accent'}`}
                      onClick={() => {
                        if (isConstant && 'value' in btn) {
                          if (shiftActive && 'shiftValue' in btn) {
                            pushRpnConstant(btn.shiftValue);
                          } else {
                            pushRpnConstant(btn.value);
                          }
                        } else if (currentOp) {
                          applyRpnUnary(currentOp);
                        }
                      }}
                      disabled={isDisabled}
                    >
                      {shiftActive ? btn.shiftLabel : btn.label}
                    </Button>
                  );
                });
              })()}
            </div>

            {/* y field with button grid - 8 buttons */}
            <div 
              className="grid gap-2 items-center"
              style={{ gridTemplateColumns: `${CommonFieldWidth} repeat(8, ${RpnBtnWidth})` }}
            >
              <CalculatorFieldDisplay
                value={rpnStack[2]}
                onClick={() => copyRpnField(2)}
                isFlashing={flashRpnField3}
                formatDimensions={formatDimensions}
                applyPrefixToKgUnit={applyPrefixToKgUnit}
                formatNumberWithSeparators={formatNumberWithSeparators}
                precision={calculatorPrecision}
              />
              {/* Binary operation buttons for y row: 1-2=Enter/Drop (double width), 3=undo/undo, 4-7=×/÷/+/−, 8=LASTx/x⇆y */}
              <Button 
                variant="ghost" 
                size="sm" 
                className={`text-xs font-mono w-full border !border-border/30 ${shiftActive && !rpnStack[3] ? 'text-muted-foreground/50' : 'text-foreground hover:text-accent'}`}
                style={{ gridColumn: 'span 2' }}
                disabled={shiftActive && !rpnStack[3]}
                onClick={() => shiftActive ? dropRpnStack() : pushToRpnStack()}
              >
                {shiftActive ? 'drop↓' : 'enter↑'}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`text-xs font-mono w-full border !border-border/30 ${shiftActive ? 'text-foreground hover:text-accent' : (!previousRpnStack.some(v => v !== null) ? 'text-muted-foreground/50' : 'text-foreground hover:text-accent')}`}
                disabled={!shiftActive && !previousRpnStack.some(v => v !== null)}
                onClick={() => shiftActive ? pullFromPane() : undoRpnStack()}
              >
                {shiftActive ? 'Pull' : 'undo'}
              </Button>
              {(() => {
                const yBinaryButtons: Array<{ label: string; shiftLabel: string; op: RpnBinaryOp; shiftOp: RpnBinaryOp }> = [
                  { label: '×ᵤ', shiftLabel: '×', op: 'mulUnit', shiftOp: 'mul' },
                  { label: '÷ᵤ', shiftLabel: '÷', op: 'divUnit', shiftOp: 'div' },
                  { label: '+ᵤ', shiftLabel: '+', op: 'addUnit', shiftOp: 'add' },
                  { label: '−ᵤ', shiftLabel: '−', op: 'subUnit', shiftOp: 'sub' },
                ];
                return yBinaryButtons.map((btn, i) => {
                  const currentOp = shiftActive ? btn.shiftOp : btn.op;
                  const isDisabled = !canApplyRpnBinary(currentOp);
                  return (
                    <Button 
                      key={`y-bin-${i}`} 
                      variant="ghost" 
                      size="sm" 
                      className={`text-xs font-mono w-full border !border-border/30 ${isDisabled ? 'text-muted-foreground/50' : 'text-foreground hover:text-accent'}`}
                      onClick={() => applyRpnBinary(currentOp)}
                      disabled={isDisabled}
                    >
                      {shiftActive ? btn.shiftLabel : btn.label}
                    </Button>
                  );
                });
              })()}
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs font-mono w-full border !border-border/30 text-foreground hover:text-accent"
                onClick={() => shiftActive ? swapRpnXY() : recallLastX()}
              >
                {shiftActive ? 'x⇆y' : 'Last x'}
              </Button>
            </div>

            {/* x field (result) with prefix and unit dropdowns - editable with parseUnitText */}
            <div 
              className="grid gap-2 items-center"
              style={{ gridTemplateColumns: `${CommonFieldWidth} 50px 1fr` }}
            >
              {rpnXEditing ? (
                <input
                  type="text"
                  autoFocus
                  data-testid="rpn-x-input"
                  value={rpnXEditValue}
                  onChange={(e) => setRpnXEditValue(e.target.value)}
                  onBlur={() => {
                    // Parse and apply on blur
                    if (rpnXEditValue.trim()) {
                      const parsed = parseUnitText(rpnXEditValue);
                      const dims: Record<string, number> = {};
                      if (parsed.dimensions.length) dims.length = parsed.dimensions.length;
                      if (parsed.dimensions.mass) dims.mass = parsed.dimensions.mass;
                      if (parsed.dimensions.time) dims.time = parsed.dimensions.time;
                      if (parsed.dimensions.current) dims.current = parsed.dimensions.current;
                      if (parsed.dimensions.temperature) dims.temperature = parsed.dimensions.temperature;
                      if (parsed.dimensions.amount) dims.amount = parsed.dimensions.amount;
                      if (parsed.dimensions.intensity) dims.intensity = parsed.dimensions.intensity;
                      if (parsed.dimensions.angle) dims.angle = parsed.dimensions.angle;
                      if (parsed.dimensions.solid_angle) dims.solid_angle = parsed.dimensions.solid_angle;
                      
                      const newEntry = {
                        value: parsed.value,
                        dimensions: dims,
                        prefix: parsed.prefixId || 'none'
                      };
                      
                      // Update X directly (no stack lift for edit)
                      saveRpnStackForUndo();
                      setRpnStack(prev => {
                        const newStack = [...prev];
                        newStack[3] = newEntry;
                        return newStack;
                      });
                      setRpnResultPrefix('none');
                      setRpnSelectedAlternative(0);
                    }
                    setRpnXEditing(false);
                    setRpnXEditValue('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    } else if (e.key === 'Escape') {
                      setRpnXEditing(false);
                      setRpnXEditValue('');
                    }
                  }}
                  className="px-3 bg-muted/20 border border-accent rounded-md text-sm font-mono text-primary font-bold"
                  style={{ height: FIELD_HEIGHT }}
                  placeholder="Enter value or 'value unit'"
                />
              ) : (
                <motion.div 
                  className={`px-3 bg-muted/20 border border-accent/50 rounded-md flex items-center justify-between cursor-text hover:bg-muted/40 active:bg-muted/60`}
                  style={{ height: FIELD_HEIGHT, pointerEvents: 'auto' }}
                  data-testid="rpn-x-field"
                  onClick={() => {
                    // Start editing with current value + unit if any
                    const display = getRpnResultDisplay();
                    const currentText = display ? `${display.formattedValue}${display.unitSymbol ? ' ' + display.unitSymbol : ''}` : '';
                    setRpnXEditValue(currentText);
                    setRpnXEditing(true);
                  }}
                  animate={{
                    opacity: flashRpnResult ? [1, 0.3, 1] : 1,
                    scale: flashRpnResult ? [1, 1.02, 1] : 1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {(() => {
                    const display = getRpnResultDisplay();
                    return (
                      <>
                        <span className="text-sm font-mono text-primary font-bold truncate">
                          {display?.formattedValue || ''}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground ml-2 shrink-0">
                          {display?.unitSymbol || ''}
                        </span>
                      </>
                    );
                  })()}
                </motion.div>
              )}
              {/* Prefix and unit selectors for RPN result */}
              {rpnStack[3] && !isDimensionEmpty(rpnStack[3].dimensions) ? (
                (() => {
                  const siReps = generateSIRepresentations(rpnStack[3]!.dimensions);
                  return (
                    <>
                      <Select 
                        value={rpnResultPrefix} 
                        onValueChange={(val) => setRpnResultPrefix(val)}
                      >
                        <SelectTrigger className="h-10 text-xs">
                          <SelectValue placeholder={t('Prefix')} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[50vh]">
                          {PREFIXES.map((p) => (
                            <SelectItem key={p.id} value={p.id} className="text-xs font-mono">
                              {p.symbol || '-'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select 
                        value={rpnSelectedAlternative.toString()} 
                        onValueChange={(val) => { setRpnSelectedAlternative(parseInt(val)); setRpnResultPrefix('none'); }}
                      >
                        <SelectTrigger className="h-10 text-xs">
                          <SelectValue placeholder="Select SI representation" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[50vh]">
                          {siReps.map((rep, index) => (
                            <SelectItem key={index} value={index.toString()} className="text-xs font-mono">
                              <span className="font-bold">{rep.displaySymbol}</span>
                              {rep.crossDomainMatches && rep.crossDomainMatches.length > 0 && (
                                <span className="ml-2 text-muted-foreground font-normal">
                                  ({rep.crossDomainMatches.join(', ')})
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  );
                })()
              ) : rpnStack[3] ? (
                <>
                  <Select value="none" disabled>
                    <SelectTrigger className="h-10 text-xs opacity-50 cursor-not-allowed">
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-xs">-</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value="unitless" disabled>
                    <SelectTrigger className="h-10 text-xs opacity-50 cursor-not-allowed">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unitless" className="text-xs"></SelectItem>
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <>
                  <Select value="none" disabled>
                    <SelectTrigger className="h-10 text-xs opacity-50 cursor-not-allowed">
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-xs">-</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value="empty" disabled>
                    <SelectTrigger className="h-10 text-xs opacity-50 cursor-not-allowed">
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="empty" className="text-xs"></SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>

            {/* Bottom row: Clear x/unit under stack field, Shift under key grid, Copy far right */}
            <div 
              className="grid gap-2 items-center"
              style={{ gridTemplateColumns: `${CommonFieldWidth} repeat(8, ${RpnBtnWidth})` }}
            >
              {/* Column 1: Clear x (left) and Clear unit (right) under stack field */}
              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    if (!rpnStack[3]) return;
                    saveRpnStackForUndo();
                    setRpnStack(prev => {
                      const newStack = [...prev];
                      newStack[3] = { ...prev[3]!, value: 0 };
                      return newStack;
                    });
                  }}
                  className="text-xs text-foreground hover:text-accent border !border-border/30"
                >
                  {t('Clear x')}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    if (!rpnStack[3]) return;
                    saveRpnStackForUndo();
                    setRpnStack(prev => {
                      const newStack = [...prev];
                      newStack[3] = { ...prev[3]!, dimensions: {}, prefix: 'none' };
                      return newStack;
                    });
                    setRpnResultPrefix('none');
                    setRpnSelectedAlternative(0);
                  }}
                  className="text-xs text-foreground hover:text-accent border !border-border/30"
                >
                  {t('Clear unit')}
                </Button>
              </div>
              {/* Column 2: Shift - left-aligned with key grid */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShiftActive(!shiftActive)}
                className={`text-xs font-mono border !border-border/30 ${shiftActive ? 'bg-accent !text-accent-foreground' : 'text-foreground hover:text-accent'}`}
                data-testid="button-shift"
                aria-pressed={shiftActive}
              >
                {shiftActive ? 'SHIFT' : 'Shift'}
              </Button>
              {/* Spacer columns 3-8 */}
              <span style={{ gridColumn: 'span 6' }}></span>
              {/* Column 9: Copy - far right */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={copyRpnResult}
                className="text-xs text-foreground hover:text-accent gap-1 border !border-border/30"
              >
                <Copy className="w-3 h-3" />
                {t('Copy')}
              </Button>
            </div>
          </div>
          )}
          </div>
        </Card>

        {/* Help Pane */}
        <HelpSection t={t} />
      </div>
    </div>
  );
}