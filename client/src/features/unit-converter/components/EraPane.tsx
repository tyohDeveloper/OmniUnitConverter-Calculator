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
import type { EraRegion, EraTable, Civilization } from '@/lib/eras/types';
import japaneseErasJson from '@/data/eras/japaneseEras.json';
import chineseErasJson from '@/data/eras/chineseEras.json';
import historicalPeriodsJson from '@/data/eras/historicalPeriods.json';
import { HijriDateCard } from './HijriDateCard';

const JAPANESE_ERAS = japaneseErasJson as EraTable;
const CHINESE_ERAS = chineseErasJson as EraTable;
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

const ERA_TABLES_BY_REGION: Record<string, EraTable[]> = {
  east_asia_japan: [JAPANESE_ERAS],
  east_asia_china: [CHINESE_ERAS],
};

interface EraPaneProps {
  t: (key: string) => string;
}

function parseYearInput(text: string): number | null {
  const trimmed = text.trim();
  if (!/^-?\d+$/.test(trimmed)) return null;
  const n = parseInt(trimmed, 10);
  return Number.isSafeInteger(n) ? n : null;
}

// Era-table values are lunisolar-year based: Japanese years before the 1873
// Gregorian switch and all Chinese years carry the ±1 indicator.
function eraTableDisplay(astro: number, table: EraTable, t: (k: string) => string): string {
  const hit = lookupEraTable(astro, table);
  if (!hit) return '—';
  const fuzzy = table.id === 'japanese' ? astro < 1873 : true;
  const dynasty = hit.dynasty ? ` · ${hit.dynasty}` : '';
  return `${hit.eraName} ${hit.eraYear}${fuzzy ? ' (±1)' : ''}${dynasty}`;
}

export function EraPane({ t }: EraPaneProps) {
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
                if (schemes.length === 0 && tables.length === 0) return null;
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
                          {eraTableDisplay(astro, table, t)}
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
        <div className="grid gap-4 md:grid-cols-3">
          {CIVILIZATIONS.map(civ => {
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
        <p className="text-xs text-muted-foreground">{t('periods-approx-note')}</p>
      </Card>
    </div>
  );
}
