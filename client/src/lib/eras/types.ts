// Tabular Islamic calendar epoch: civil (Friday, 16 July 622 Julian,
// JDN 1948440) or astronomical (Thursday, 15 July 622, JDN 1948439).
export type HijriEpoch = 'civil' | 'astronomical';

export type EraRegion =
  | 'global'
  | 'east_asia_japan'
  | 'east_asia_china'
  | 'east_asia_korea'
  | 'south_se_asia'
  | 'middle_east'
  | 'europe';

export interface EraScheme {
  id: string;
  name: string;
  kind: 'offset' | 'lunar_hijri';
  offset?: number;
  newYearJan1: boolean;
  note?: string;
  region: EraRegion;
  sourceUrl: string;
}

export interface EraTableEntry {
  name: string;
  // Native-script form (kanji/hanzi), shown when the UI language is ja/zh.
  native?: string;
  start: number;
  // Year-counting origin when it differs from the lookup boundary `start`
  // (e.g. Yuan "Zhiyuan" counted from 1264 but only orthodox from 1279).
  epoch?: number;
  dynasty?: string;
}

export interface EraTable {
  id: string;
  name: string;
  note?: string;
  region: EraRegion;
  // Last year (astronomical CE) covered by the table; lookups after it return null.
  end?: number;
  sourceUrl: string;
  eras: EraTableEntry[];
}

// Per-year eponym table (e.g. Roman consular dating): one entry per year,
// indexed from `start` (astronomical CE) through `end` inclusive.
export interface YearTable {
  id: string;
  name: string;
  note?: string;
  region: EraRegion;
  start: number;
  end: number;
  sourceUrl: string;
  consuls: string[];
}

export interface HistoricalPeriod {
  name: string;
  start: number;
  end: number;
}

export type PeriodRegion =
  | 'africa'
  | 'middle_east'
  | 'south_asia'
  | 'east_asia'
  | 'mesoamerica'
  | 'andean';

export interface Civilization {
  id: string;
  name: string;
  note?: string;
  region: PeriodRegion;
  sourceUrl: string;
  periods: HistoricalPeriod[];
}

// Rulers & Reigns reference data. Years are signed historical years
// (negative = BCE, no year zero), like HistoricalPeriod.
export interface Ruler {
  name: string;
  epithet?: string;
  start: number;
  end: number;
  circa?: boolean;
  city?: string;
}

export interface RulerDynasty {
  name: string;
  rulers: Ruler[];
}

// Explicit interregnum with a note key (e.g. Persia 330–247 BCE).
export interface RulerGap {
  start: number;
  end: number;
  note: string;
}

export interface RulerRegion {
  id: string;
  name: string;
  sourceUrl: string;
  note?: string;
  gaps?: RulerGap[];
  dynasties: RulerDynasty[];
}
