import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { testId } from '@/lib/test-utils';
import type { HijriEpoch } from '@/lib/eras/types';
import { gregorianToJdn } from '@/lib/eras/gregorianToJdn';
import { jdnToGregorian } from '@/lib/eras/jdnToGregorian';
import { hijriToJdn } from '@/lib/eras/hijriToJdn';
import { jdnToHijri } from '@/lib/eras/jdnToHijri';

export const GREGORIAN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi al-awwal', 'Rabi al-thani',
  'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Shaban',
  'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah',
];

interface DateFields {
  day: string;
  month: string;
  year: string;
}

function parseFields(f: DateFields): { year: number; month: number; day: number } | null {
  if (!/^-?\d+$/.test(f.year.trim()) || !/^\d+$/.test(f.day.trim())) return null;
  const year = parseInt(f.year.trim(), 10);
  const month = parseInt(f.month, 10);
  const day = parseInt(f.day.trim(), 10);
  if (!Number.isSafeInteger(year) || day < 1 || day > 31) return null;
  return { year, month, day };
}

// A date is valid iff converting to JDN and back reproduces it exactly.
function roundTrips(
  d: { year: number; month: number; day: number },
  toJdn: (y: number, m: number, d: number) => number,
  fromJdn: (jdn: number) => { year: number; month: number; day: number },
): boolean {
  const back = fromJdn(toJdn(d.year, d.month, d.day));
  return back.year === d.year && back.month === d.month && back.day === d.day;
}

function toFields(d: { year: number; month: number; day: number }): DateFields {
  return { day: String(d.day), month: String(d.month), year: String(d.year) };
}

interface HijriDateCardProps {
  t: (key: string) => string;
}

export function HijriDateCard({ t }: HijriDateCardProps) {
  const now = new Date();
  const initialGreg = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  const [epoch, setEpoch] = useState<HijriEpoch>('civil');
  const [greg, setGreg] = useState<DateFields>(toFields(initialGreg));
  const [hijri, setHijri] = useState<DateFields>(
    toFields(jdnToHijri(gregorianToJdn(initialGreg.year, initialGreg.month, initialGreg.day), 'civil')),
  );
  const [invalidSide, setInvalidSide] = useState<'greg' | 'hijri' | null>(null);

  const updateGreg = (next: DateFields, ep: HijriEpoch = epoch) => {
    setGreg(next);
    const parsed = parseFields(next);
    if (parsed && parsed.month >= 1 && parsed.month <= 12 && roundTrips(parsed, gregorianToJdn, jdnToGregorian)) {
      setHijri(toFields(jdnToHijri(gregorianToJdn(parsed.year, parsed.month, parsed.day), ep)));
      setInvalidSide(null);
    } else {
      setInvalidSide('greg');
    }
  };

  const updateHijri = (next: DateFields) => {
    setHijri(next);
    const parsed = parseFields(next);
    if (
      parsed && parsed.year >= 1 &&
      roundTrips(parsed, (y, m, d) => hijriToJdn(y, m, d, epoch), (j) => jdnToHijri(j, epoch))
    ) {
      setGreg(toFields(jdnToGregorian(hijriToJdn(parsed.year, parsed.month, parsed.day, epoch))));
      setInvalidSide(null);
    } else {
      setInvalidSide('hijri');
    }
  };

  const switchEpoch = (ep: HijriEpoch) => {
    if (ep === epoch) return;
    setEpoch(ep);
    // Re-derive the Hijri side from the current Gregorian date under the new epoch.
    updateGreg(greg, ep);
  };

  const dateRow = (
    side: 'greg' | 'hijri',
    fields: DateFields,
    months: string[],
    yearSuffix: string,
    update: (f: DateFields) => void,
  ) => (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">{t('Day')}</Label>
        <Input
          value={fields.day}
          onChange={(e) => update({ ...fields, day: e.target.value })}
          className="w-[70px] font-mono"
          inputMode="numeric"
          {...testId(`input-${side}-day`)}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">{t('Month')}</Label>
        <Select value={fields.month} onValueChange={(v) => update({ ...fields, month: v })}>
          <SelectTrigger className="w-[190px] text-sm" {...testId(`select-${side}-month`)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[50vh]">
            {months.map((name, i) => (
              <SelectItem key={name} value={String(i + 1)} className="text-sm">{t(name)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">{t('Year')}{yearSuffix ? ` (${yearSuffix})` : ''}</Label>
        <Input
          value={fields.year}
          onChange={(e) => update({ ...fields, year: e.target.value })}
          className="w-[100px] font-mono"
          inputMode="numeric"
          {...testId(`input-${side}-year`)}
        />
      </div>
    </div>
  );

  return (
    <Card className="w-full p-6 bg-card border-border/50 space-y-4" {...testId('card-hijri-date')}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground font-bold">
          {t('Hijri Date Converter')}
        </h3>
        <div className="flex items-center gap-1 rounded-md border border-border/50 p-0.5" role="group" aria-label={t('Epoch')}>
          {(['civil', 'astronomical'] as const).map((ep) => (
            <button
              key={ep}
              type="button"
              aria-pressed={epoch === ep}
              onClick={() => switchEpoch(ep)}
              className={`px-2 py-1 rounded text-xs font-mono ${
                epoch === ep
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover-elevate'
              }`}
              {...testId(`button-hijri-epoch-${ep}`)}
            >
              {t(ep === 'civil' ? 'Civil (Fri)' : 'Astronomical (Thu)')}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground/80">{t('Gregorian date')}</p>
        {dateRow('greg', greg, GREGORIAN_MONTHS, t('CE'), updateGreg)}
      </div>
      <div className="space-y-1">
        <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground/80">{t('Hijri date')}</p>
        {dateRow('hijri', hijri, HIJRI_MONTHS, t('AH'), updateHijri)}
      </div>
      {invalidSide && (
        <p className="text-sm text-destructive" {...testId('text-hijri-date-invalid')}>
          {t('Enter a valid date')}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        {t(epoch === 'civil' ? 'hijri-date-note' : 'hijri-date-note-astronomical')}
      </p>
    </Card>
  );
}
