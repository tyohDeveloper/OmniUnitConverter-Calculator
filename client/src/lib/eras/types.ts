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

export interface HistoricalPeriod {
  name: string;
  start: number;
  end: number;
}

export type PeriodRegion =
  | 'africa'
  | 'middle_east'
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
