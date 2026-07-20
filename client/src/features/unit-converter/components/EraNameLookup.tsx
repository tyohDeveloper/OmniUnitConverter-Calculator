import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { testId } from '@/lib/test-utils';
import { parseEraYearText } from '@/lib/eras/parseEraYearText';
import { searchEraNames } from '@/lib/eras/searchEraNames';
import { normalizeEraName } from '@/lib/eras/normalizeEraName';
import { reverseLookupEraTable } from '@/lib/eras/reverseLookupEraTable';
import { formatAstronomicalYear } from '@/lib/eras/formatAstronomicalYear';
import type { EraTable } from '@/lib/eras/types';

interface EraNameLookupProps {
  t: (key: string) => string;
  tables: EraTable[];
  onApply: (astro: number) => void;
  // Show era names in native script (kanji/hanzi) when the UI language is ja/zh.
  nativeScript?: boolean;
}

export function EraNameLookup({ t, tables, onApply, nativeScript }: EraNameLookupProps) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);

  const { namePart, eraYear } = parseEraYearText(text);
  const exact = useMemo(() => {
    const wanted = normalizeEraName(namePart);
    if (!wanted) return null;
    for (const table of tables) {
      const entry = table.eras.find(e => normalizeEraName(e.name) === wanted);
      if (entry) return { entry, table };
    }
    return null;
  }, [namePart, tables]);

  const suggestions = useMemo(
    () => (exact || namePart.length < 2 ? [] : searchEraNames(namePart, tables)),
    [namePart, exact, tables],
  );

  const astro = exact && eraYear !== null
    ? reverseLookupEraTable(exact.entry.name, eraYear, exact.table)
    : null;
  const outOfRange = exact !== null && eraYear !== null && astro === null;
  const display = astro === null ? null : formatAstronomicalYear(astro);
  // Same lunisolar ±1 convention as the results table: Japanese years are
  // exact from the 1873 Gregorian switch; all Chinese years carry ±1.
  const fuzzy = astro !== null && exact !== null
    && (exact.table.id === 'japanese' ? astro < 1873 : true);

  return (
    <div className="space-y-1 relative">
      <Label className="text-xs text-muted-foreground">{t('Era name lookup')}</Label>
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={t('era-lookup-placeholder')}
          className="w-[240px]"
          {...testId('input-era-name-lookup')}
        />
        {display && astro !== null && (
          <>
            <p className="text-sm font-mono text-muted-foreground" {...testId('text-era-lookup-result')}>
              {nativeScript && exact!.entry.native ? `${exact!.entry.native} (${exact!.entry.name})` : exact!.entry.name} {eraYear} = {display.year} {t(display.era)}{fuzzy ? ' (±1)' : ''}
            </p>
            <Button
              size="sm" variant="secondary"
              onClick={() => onApply(astro)}
              {...testId('button-era-lookup-apply')}
            >
              {t('Convert')}
            </Button>
          </>
        )}
        {outOfRange && (
          <p className="text-sm text-destructive" {...testId('text-era-lookup-out-of-range')}>
            {t('era-lookup-out-of-range')}
          </p>
        )}
        {!exact && eraYear !== null && namePart.length >= 2 && suggestions.length === 0 && (
          <p className="text-sm text-destructive" {...testId('text-era-lookup-unknown')}>
            {t('era-lookup-unknown')}
          </p>
        )}
      </div>
      {focused && suggestions.length > 0 && (
        <ul
          className="absolute z-10 mt-1 w-[280px] rounded-md border border-border bg-popover shadow-md text-sm"
          {...testId('list-era-lookup-suggestions')}
        >
          {suggestions.map(s => (
            <li key={`${s.tableId}-${s.name}`}>
              <button
                type="button"
                className="w-full text-start px-3 py-1.5 hover:bg-accent/20"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setText(eraYear !== null ? `${s.name} ${eraYear}` : `${s.name} `);
                }}
                {...testId(`option-era-lookup-${s.tableId}-${normalizeEraName(s.name).replace(/\W+/g, '-')}`)}
              >
                <span className="font-medium">{nativeScript && s.native ? `${s.native} (${s.name})` : s.name}</span>
                <span className="text-xs text-muted-foreground ms-2">
                  {s.dynasty ?? t(s.tableName)} · {s.start < 1 ? `${1 - s.start} ${t('BCE')}` : `${s.start} ${t('CE')}`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
