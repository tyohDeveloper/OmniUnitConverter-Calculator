export interface EraScheme {
  id: string;
  name: string;
  kind: 'offset' | 'lunar_hijri';
  offset?: number;
  newYearJan1: boolean;
  note?: string;
  sourceUrl: string;
}

export interface EraTableEntry {
  name: string;
  start: number;
}

export interface EraTable {
  id: string;
  name: string;
  note?: string;
  sourceUrl: string;
  eras: EraTableEntry[];
}

export interface HistoricalPeriod {
  name: string;
  start: number;
  end: number;
}

export interface Civilization {
  id: string;
  name: string;
  sourceUrl: string;
  periods: HistoricalPeriod[];
}
