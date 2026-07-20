import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { testId } from '@/lib/test-utils';
import { ERA_SCHEMES } from '@/lib/eras/eraSchemes';
import { toAstronomicalYear } from '@/lib/eras/toAstronomicalYear';
import { fromAstronomicalYear } from '@/lib/eras/fromAstronomicalYear';
import { formatAstronomicalYear } from '@/lib/eras/formatAstronomicalYear';
import { lookupEraTable } from '@/lib/eras/lookupEraTable';
import { lookupPeriods } from '@/lib/eras/lookupPeriods';
import { lookupRomanConsuls } from '@/lib/eras/lookupRomanConsuls';
import type { EraRegion, EraTable, YearTable, Civilization, PeriodRegion } from '@/lib/eras/types';
import japaneseErasJson from '@/data/eras/japaneseEras.json';
import japaneseSouthernErasJson from '@/data/eras/japaneseSouthernEras.json';
import chineseErasJson from '@/data/eras/chineseEras.json';
import romanConsulsJson from '@/data/eras/romanConsuls.json';
import historicalPeriodsJson from '@/data/eras/historicalPeriods.json';
import { HijriDateCard } from './HijriDateCard';
import { EraNameLookup } from './EraNameLookup';
import { RulersReignsCard } from './RulersReignsCard';

const JAPANESE_ERAS = japaneseErasJson as EraTable;
const JAPANESE_SOUTHERN_ERAS = japaneseSouthernErasJson as EraTable;
const CHINESE_ERAS = chineseErasJson as EraTable;
const ROMAN_CONSULS = romanConsulsJson as YearTable;
const CIVILIZATIONS = historicalPeriodsJson.civilizations as Civilization[];

// Ordered regional sections; base offset schemes (Global/Modern) stay first.
const ERA_REGIONS: { id: EraRegion; label: string }[] = [
  { id: 'global', label: 'region-global' },
  { id: 'east_asia_japan', label: 'region-east-asia-japan' },
  { id: 'east_asia_china', label: 'region-east-asia-china' },
  { id: 'east_asia_korea', label: 'region-east-asia-korea' },
  { id: 'south_se_asia', label: 'region-south-se-asia' },
  { id: 'middle_east', label: 'region-middle-east' },
  { id: 'europe', label: 'region-europe' },
];

// Ordered regional sections for the Historical Periods widget.
const PERIOD_REGIONS: { id: PeriodRegion; label: string }[] = [
  { id: 'africa', label: 'region-africa' },
  { id: 'middle_east', label: 'region-middle-east' },
  { id: 'south_asia', label: 'region-south-asia' },
  { id: 'east_asia', label: 'region-east-asia' },
  { id: 'mesoamerica', label: 'region-mesoamerica' },
  { id: 'andean', label: 'region-andean' },
];

const ERA_TABLES_BY_REGION: Record<string, EraTable[]> = {
  east_asia_japan: [JAPANESE_ERAS],
  east_asia_china: [CHINESE_ERAS],
};

// Per-year eponym tables (one entry per year, not multi-year eras).
const YEAR_TABLES_BY_REGION: Record<string, YearTable[]> = {
  europe: [ROMAN_CONSULS],
};

interface EraPaneProps {
  t: (key: string) => string;
  language: string;
}

function parseYearInput(text: string): number | null {
  const trimmed = text.trim();
  if (!/^-?\d+$/.test(trimmed)) return null;
  const n = parseInt(trimmed, 10);
  return Number.isSafeInteger(n) ? n : null;
}

// Era-table values are lunisolar-year based: Japanese years before the 1873
// Gregorian switch and all Chinese years carry the ±1 indicator.
// When the UI language is ja/zh, era names show in native script (kanji/hanzi)
// with the romanization in parentheses.
function eraTableDisplay(
  astro: number,
  table: EraTable,
  t: (k: string) => string,
  nativeScript: boolean,
): string {
  const hit = lookupEraTable(astro, table);
  if (!hit) return '—';
  const fuzzy = table.id === 'japanese' ? astro < 1873 : true;
  const dynasty = hit.dynasty ? ` · ${hit.dynasty}` : '';
  const name = nativeScript && hit.eraNative
    ? `${hit.eraNative} (${hit.eraName})`
    : hit.eraName;
  return `${name} ${hit.eraYear}${fuzzy ? ' (±1)' : ''}${dynasty}`;
}

// Nanboku-chō period (1336–1392): two rival courts each proclaimed era names,
// so the Japanese row shows both lines, e.g. "Ryakuō 1 (±1) / Engen 3 (Southern)".
function japaneseEraDisplay(
  astro: number,
  t: (k: string) => string,
  nativeScript: boolean,
): string {
  const main = eraTableDisplay(astro, JAPANESE_ERAS, t, nativeScript);
  const south = lookupEraTable(astro, JAPANESE_SOUTHERN_ERAS);
  if (!south) return main;
  const name = nativeScript && south.eraNative
    ? `${south.eraNative} (${south.eraName})`
    : south.eraName;
  return `${main} / ${name} ${south.eraYear} (${t('Southern')})`;
}

export function EraPane({ t, language }: EraPaneProps) {
  const nativeScript = language === 'ja' || language === 'zh';
  const [yearText, setYearText] = useState('2026');
  const [schemeId, setSchemeId] = useState('gregorian');
  const [bce, setBce] = useState(false);

  const scheme = ERA_SCHEMES.find(s => s.id === schemeId)!;
  const rawYear = parseYearInput(yearText);
  const isGregorian = schemeId === 'gregorian';
  // For Gregorian with the BCE toggle, year y BCE → astronomical 1 − y.
  // Negative input is always accepted as an astronomical year directly.
  const schemeYear = rawYear === null ? null
    : (isGregorian && bce && rawYear > 0 ? 1 - rawYear : rawYear);
  const astro = schemeYear === null ? null : toAstronomicalYear(schemeYear, scheme);

  const gregorianDisplay = astro === null ? null : formatAstronomicalYear(astro);
  const periods = astro === null ? [] : lookupPeriods(astro, CIVILIZATIONS);

  return (
    <div className="space-y-4">
      <Card className="w-full p-6 bg-card border-border/50 space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t('Year')}</Label>
            <Input
              value={yearText}
              onChange={(e) => setYearText(e.target.value)}
              className="w-[140px] font-mono"
              inputMode="numeric"
              {...testId('input-era-year')}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{t('Era scheme')}</Label>
            <Select value={schemeId} onValueChange={setSchemeId}>
              <SelectTrigger className="w-[240px] text-sm" {...testId('select-era-scheme')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[50vh]">
                {ERA_REGIONS.map(region => {
                  const schemes = ERA_SCHEMES.filter(s => s.region === region.id);
                  if (schemes.length === 0) return null;
                  return (
                    <SelectGroup key={region.id}>
                      <SelectLabel className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/80">
                        {t(region.label)}
                      </SelectLabel>
                      {schemes.map(s => (
                        <SelectItem key={s.id} value={s.id} className="text-sm">{t(s.name)}</SelectItem>
                      ))}
                    </SelectGroup>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          {isGregorian && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{t('Era')}</Label>
              <Select value={bce ? 'bce' : 'ce'} onValueChange={(v) => setBce(v === 'bce')}>
                <SelectTrigger className="w-[90px] text-sm" {...testId('select-era-ce-bce')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ce" className="text-sm">{t('CE')}</SelectItem>
                  <SelectItem value="bce" className="text-sm">{t('BCE')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {gregorianDisplay && (
            <p className="text-sm font-mono text-muted-foreground pb-2" {...testId('text-era-astro')}>
              = {gregorianDisplay.year} {t(gregorianDisplay.era)}
            </p>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{t('era-bce-convention')}</p>

        <EraNameLookup
          t={t}
          tables={[JAPANESE_ERAS, JAPANESE_SOUTHERN_ERAS, CHINESE_ERAS]}
          consulTables={[ROMAN_CONSULS]}
          nativeScript={nativeScript}
          onApply={(a) => {
            setSchemeId('gregorian');
            setBce(a <= 0);
            setYearText(a <= 0 ? String(1 - a) : String(a));
          }}
        />

        {rawYear === null && (
          <p className="text-sm text-destructive" {...testId('text-era-invalid')}>{t('Enter a whole year number')}</p>
        )}

        {astro !== null && (
          <table className="w-full text-sm" {...testId('table-era-results')}>
            <thead>
              <tr className="text-xs font-mono uppercase text-muted-foreground border-b border-border/50">
                <th className="text-start py-1.5 pe-4">{t('Era scheme')}</th>
                <th className="text-start py-1.5 pe-4">{t('Year')}</th>
                <th className="text-start py-1.5">{t('Notes')}</th>
              </tr>
            </thead>
            <tbody>
              {ERA_REGIONS.map(region => {
                const schemes = ERA_SCHEMES.filter(s => s.region === region.id);
                const tables = ERA_TABLES_BY_REGION[region.id] ?? [];
                const yearTables = YEAR_TABLES_BY_REGION[region.id] ?? [];
                if (schemes.length === 0 && tables.length === 0 && yearTables.length === 0) return null;
                return (
                  <React.Fragment key={region.id}>
                    <tr className="border-b border-border/30" {...testId(`section-era-${region.id}`)}>
                      <td colSpan={3} className="pt-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/80 font-bold">
                        {t(region.label)}
                      </td>
                    </tr>
                    {schemes.map(s => {
                      const value = fromAstronomicalYear(astro, s);
                      const display = s.id === 'gregorian'
                        ? `${formatAstronomicalYear(astro).year} ${t(formatAstronomicalYear(astro).era)}`
                        : `${value}${s.newYearJan1 ? '' : ' (±1)'}`;
                      return (
                        <tr key={s.id} className="border-b border-border/30" {...testId(`row-era-${s.id}`)}>
                          <td className="py-1.5 pe-4">
                            <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent underline decoration-dotted underline-offset-2">
                              {t(s.name)}
                            </a>
                          </td>
                          <td className="py-1.5 pe-4 font-mono" {...testId(`text-era-value-${s.id}`)}>{display}</td>
                          <td className="py-1.5 text-xs text-muted-foreground">{s.note ? t(s.note) : ''}</td>
                        </tr>
                      );
                    })}
                    {tables.map(table => (
                      <tr key={table.id} className="border-b border-border/30" {...testId(`row-era-${table.id}`)}>
                        <td className="py-1.5 pe-4">
                          <a href={table.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent underline decoration-dotted underline-offset-2">
                            {t(table.name)}
                          </a>
                        </td>
                        <td className="py-1.5 pe-4 font-mono" {...testId(`text-era-value-${table.id}`)}>
                          {table.id === 'japanese'
                            ? japaneseEraDisplay(astro, t, nativeScript)
                            : eraTableDisplay(astro, table, t, nativeScript)}
                        </td>
                        <td className="py-1.5 text-xs text-muted-foreground">{table.note ? t(table.note) : ''}</td>
                      </tr>
                    ))}
                    {yearTables.map(table => (
                      <tr key={table.id} className="border-b border-border/30" {...testId(`row-era-${table.id}`)}>
                        <td className="py-1.5 pe-4">
                          <a href={table.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent underline decoration-dotted underline-offset-2">
                            {t(table.name)}
                          </a>
                        </td>
                        <td className="py-1.5 pe-4 font-mono" {...testId(`text-era-value-${table.id}`)}>
                          {lookupRomanConsuls(astro, table) ?? '—'}
                        </td>
                        <td className="py-1.5 text-xs text-muted-foreground">{table.note ? t(table.note) : ''}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      <HijriDateCard t={t} />

      <Card className="w-full p-6 bg-card border-border/50 space-y-3">
        <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground font-bold">{t('Historical Periods')}</h3>
        {PERIOD_REGIONS.map(region => {
          const civs = CIVILIZATIONS.filter(c => c.region === region.id);
          if (civs.length === 0) return null;
          return (
            <div key={region.id} className="space-y-2" {...testId(`section-periods-region-${region.id}`)}>
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/80 font-bold border-b border-border/30 pb-1">
                {t(region.label)}
              </h4>
              <div className="grid gap-4 md:grid-cols-3">
                {civs.map(civ => {
            const active = periods.find(p => p.civilization.id === civ.id)?.period ?? null;
            return (
              <div key={civ.id} className="space-y-1" {...testId(`section-periods-${civ.id}`)}>
                <a
                  href={civ.sourceUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-mono uppercase text-foreground font-bold hover:text-accent underline decoration-dotted underline-offset-2"
                >
                  {t(civ.name)}
                </a>
                <table className="w-full text-xs">
                  <tbody>
                    {civ.periods.map(p => {
                      const isActive = active === p;
                      const fmt = (y: number) => y < 0 ? `${-y} ${t('BCE')}` : `${y} ${t('CE')}`;
                      return (
                        <tr
                          key={p.name}
                          className={isActive ? 'text-accent font-medium' : 'text-muted-foreground'}
                          {...testId(`row-period-${civ.id}-${p.name.replace(/\W+/g, '-').toLowerCase()}`)}
                        >
                          <td className="py-0.5 pe-2">{t(p.name)}</td>
                          <td className="py-0.5 font-mono whitespace-nowrap">{t('ca.')} {fmt(p.start)} – {fmt(p.end)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {civ.note && (
                  <p className="text-[11px] text-muted-foreground/80 leading-tight" {...testId(`text-civ-note-${civ.id}`)}>{t(civ.note)}</p>
                )}
              </div>
            );
                })}
              </div>
            </div>
          );
        })}
        <p className="text-xs text-muted-foreground">{t('periods-approx-note')}</p>
      </Card>

      <RulersReignsCard t={t} astro={astro} />
    </div>
  );
}
