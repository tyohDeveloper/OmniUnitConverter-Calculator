import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { testId } from '@/lib/test-utils';
import { parseEraYearText } from '@/lib/eras/parseEraYearText';
import { searchEraNames } from '@/lib/eras/searchEraNames';
import { searchConsulNames } from '@/lib/eras/searchConsulNames';
import { normalizeEraName } from '@/lib/eras/normalizeEraName';
import { reverseLookupEraTable } from '@/lib/eras/reverseLookupEraTable';
import { formatAstronomicalYear } from '@/lib/eras/formatAstronomicalYear';
import type { EraTable, YearTable } from '@/lib/eras/types';

interface EraNameLookupProps {
  t: (key: string) => string;
  tables: EraTable[];
  // Per-year eponym tables (Roman consuls): typing consul names suggests
  // the matching year(s) directly, no era-year number needed.
  consulTables?: YearTable[];
  onApply: (astro: number) => void;
  // Show era names in native script (kanji/hanzi) when the UI language is ja/zh.
  nativeScript?: boolean;
}

export function EraNameLookup({ t, tables, consulTables, onApply, nativeScript }: EraNameLookupProps) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);

  const { namePart, eraYear } = parseEraYearText(text);
  const exact = useMemo(() => {
    const wanted = normalizeEraName(namePart);
    if (!wanted) return null;
    for (const table of tables) {
      const entry = table.eras.find(e =>
        normalizeEraName(e.name) === wanted
        || (e.native !== undefined && normalizeEraName(e.native) === wanted));
      if (entry) return { entry, table };
    }
    return null;
  }, [namePart, tables]);

  // Native-script (kanji/hanzi) era names are only 2 chars, so a single
  // CJK character is already a meaningful prefix; Latin input needs 2+.
  const minLen = /[\u3040-\u30ff\u3400-\u9fff]/.test(namePart) ? 1 : 2;
  const suggestions = useMemo(
    () => (exact || namePart.length < minLen ? [] : searchEraNames(namePart, tables)),
    [namePart, exact, tables, minLen],
  );
  // Consul suggestions use the full text (a consul query is all names, no
  // trailing era-year), and only when no era name matched exactly.
  const consulSuggestions = useMemo(
    () => (exact || !consulTables || text.trim().length < 2
      ? [] : searchConsulNames(text, consulTables)),
    [text, exact, consulTables],
  );

  const astro = exact && eraYear !== null
    ? reverseLookupEraTable(exact.entry.name, eraYear, exact.table)
    : null;
  const outOfRange = exact !== null && eraYear !== null && astro === null;
  const display = astro === null ? null : formatAstronomicalYear(astro);
  // Same lunisolar ±1 convention as the results table: Japanese years are
  // exact from the 1873 Gregorian switch; all Chinese years carry ±1.
  const fuzzy = astro !== null && exact !== null
    && (exact.table.id.startsWith('japanese') ? astro < 1873 : true);

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
        {!exact && eraYear !== null && namePart.length >= 2 && suggestions.length === 0 && consulSuggestions.length === 0 && (
          <p className="text-sm text-destructive" {...testId('text-era-lookup-unknown')}>
            {t('era-lookup-unknown')}
          </p>
        )}
      </div>
      {focused && (suggestions.length > 0 || consulSuggestions.length > 0) && (
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
          {consulSuggestions.map(s => {
            const disp = formatAstronomicalYear(s.year);
            return (
              <li key={`${s.tableId}-${s.year}`}>
                <button
                  type="button"
                  className="w-full text-start px-3 py-1.5 hover:bg-accent/20"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onApply(s.year);
                    setText('');
                  }}
                  {...testId(`option-era-lookup-${s.tableId}-${s.year}`)}
                >
                  <span className="font-medium">{s.consuls}</span>
                  <span className="text-xs text-muted-foreground ms-2">
                    {t('Roman Consuls')} · {disp.year} {t(disp.era)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
