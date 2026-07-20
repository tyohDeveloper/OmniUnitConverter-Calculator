import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { testId } from '@/lib/test-utils';
import { FIELD_HEIGHT } from '@/components/unit-converter/constants';
import type { SupportedLanguage } from '@/lib/localization';
import { CALENDAR_IDS } from '@/lib/calendar/calendarIds';
import { CALENDAR_ERAS } from '@/lib/calendar/calendarEras';
import { calendarLocale } from '@/lib/calendar/calendarLocale';
import { calendarDisplayName } from '@/lib/calendar/calendarDisplayName';
import { listCalendarMonths } from '@/lib/calendar/listCalendarMonths';
import { makeCalendarDate } from '@/lib/calendar/makeCalendarDate';
import { formatCalendarDate } from '@/lib/calendar/formatCalendarDate';
import { isoToCalendarFields } from '@/lib/calendar/isoToCalendarFields';
import type { CalendarDateFields } from '@/lib/calendar/calendarDateFields';

interface DatePaneProps {
  visible: boolean;
  language: SupportedLanguage;
  t: (key: string) => string;
}

function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function DatePane({ visible, language, t }: DatePaneProps) {
  const locale = calendarLocale(language);
  const [fields, setFields] = useState<CalendarDateFields>(() => isoToCalendarFields(todayIso(), 'iso8601'));
  const [yearText, setYearText] = useState(() => String(fields.eraYear ?? fields.year ?? ''));
  const [dayText, setDayText] = useState(() => String(fields.day));
  const [targetCalendar, setTargetCalendar] = useState<string>('gregory');

  const eras = CALENDAR_ERAS[fields.calendar];

  const parsedYear = /^-?\d+$/.test(yearText.trim()) ? parseInt(yearText.trim(), 10) : undefined;
  const parsedDay = /^\d+$/.test(dayText.trim()) ? parseInt(dayText.trim(), 10) : undefined;

  const effectiveFields: CalendarDateFields = {
    calendar: fields.calendar,
    ...(eras ? { era: fields.era, eraYear: parsedYear } : { year: parsedYear }),
    month: fields.month,
    day: parsedDay ?? -1,
  };

  const months = useMemo(() => {
    if (parsedYear === undefined) return [];
    try {
      return listCalendarMonths(effectiveFields, locale);
    } catch {
      return [];
    }
  }, [fields.calendar, fields.era, parsedYear, locale]);

  const result = useMemo(() => {
    if (parsedYear === undefined) return { ok: false as const, error: t('date-error-year') };
    if (parsedDay === undefined) return { ok: false as const, error: t('date-error-day') };
    const r = makeCalendarDate(effectiveFields);
    return r.ok ? r : { ok: false as const, error: t('date-error-invalid') };
  }, [fields, parsedYear, parsedDay, t]);

  const switchCalendar = (calendar: string) => {
    const iso = result.ok ? result.isoDate : todayIso();
    const next = isoToCalendarFields(iso, calendar);
    setFields(next);
    setYearText(String(next.eraYear ?? next.year ?? ''));
    setDayText(String(next.day));
  };

  const monthValid = months.some(m => m.month === fields.month);

  return (
    <Card
      className={`w-full p-6 md:p-8 bg-card border-border/50 shadow-xl relative overflow-hidden col-start-1 row-start-1 transition-opacity duration-150 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      {...testId('pane-date-converter')}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      <div className="grid gap-8 relative z-10">
        {/* Input section */}
        <div className="grid gap-2">
          <Label className="text-xs font-mono uppercase text-muted-foreground">{t('From')}</Label>
          <div className="flex flex-wrap gap-2 items-end">
            <div className="grid gap-1">
              <Label className="text-[10px] font-mono uppercase text-muted-foreground/70">{t('Calendar')}</Label>
              <Select value={fields.calendar} onValueChange={switchCalendar}>
                <SelectTrigger data-testid="select-date-calendar" className="w-[220px] bg-background/30 border-border" style={{ height: FIELD_HEIGHT }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[50vh]">
                  {CALENDAR_IDS.map(id => (
                    <SelectItem key={id} value={id} className="text-xs" data-testid={`option-date-calendar-${id}`}>
                      {calendarDisplayName(id, locale)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {eras && (
              <div className="grid gap-1">
                <Label className="text-[10px] font-mono uppercase text-muted-foreground/70">{t('Era')}</Label>
                <Select
                  value={fields.era ?? eras[0]}
                  onValueChange={(era) => setFields(f => ({ ...f, era }))}
                >
                  <SelectTrigger data-testid="select-date-era" className="w-[130px] bg-background/30 border-border" style={{ height: FIELD_HEIGHT }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eras.map(era => (
                      <SelectItem key={era} value={era} className="text-xs" data-testid={`option-date-era-${era}`}>
                        {era}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-1">
              <Label className="text-[10px] font-mono uppercase text-muted-foreground/70">{t('Year')}</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={yearText}
                onChange={(e) => setYearText(e.target.value)}
                className="font-mono px-3 w-[100px] bg-background/50 border-border focus:border-accent"
                style={{ height: FIELD_HEIGHT, fontSize: '0.875rem' }}
                {...testId('input-date-year')}
              />
            </div>
            <div className="grid gap-1">
              <Label className="text-[10px] font-mono uppercase text-muted-foreground/70">{t('Month')}</Label>
              <Select
                value={monthValid ? String(fields.month) : ''}
                onValueChange={(v) => setFields(f => ({ ...f, month: parseInt(v, 10) }))}
                disabled={months.length === 0}
              >
                <SelectTrigger data-testid="select-date-month" className="w-[170px] bg-background/30 border-border" style={{ height: FIELD_HEIGHT }}>
                  <SelectValue placeholder={t('Month')} />
                </SelectTrigger>
                <SelectContent className="max-h-[50vh]">
                  {months.map(m => (
                    <SelectItem key={m.month} value={String(m.month)} className="text-xs" data-testid={`option-date-month-${m.month}`}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label className="text-[10px] font-mono uppercase text-muted-foreground/70">{t('Day')}</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={dayText}
                onChange={(e) => setDayText(e.target.value)}
                className="font-mono px-3 w-[70px] bg-background/50 border-border focus:border-accent"
                style={{ height: FIELD_HEIGHT, fontSize: '0.875rem' }}
                {...testId('input-date-day')}
              />
            </div>
          </div>
          {!result.ok && (
            <p className="text-xs text-destructive font-mono" {...testId('text-date-error')}>
              {result.error}
            </p>
          )}
        </div>

        {/* Target calendar */}
        <div className="grid gap-2">
          <Label className="text-xs font-mono uppercase text-muted-foreground">{t('To')}</Label>
          <div className="flex flex-wrap gap-3 items-center">
            <Select value={targetCalendar} onValueChange={setTargetCalendar}>
              <SelectTrigger data-testid="select-date-target-calendar" className="w-[220px] bg-background/30 border-border" style={{ height: FIELD_HEIGHT }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[50vh]">
                {CALENDAR_IDS.map(id => (
                  <SelectItem key={id} value={id} className="text-xs" data-testid={`option-date-target-${id}`}>
                    {calendarDisplayName(id, locale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {result.ok && (
              <span className="font-mono text-lg text-accent" {...testId('text-date-result')}>
                {formatCalendarDate(result.isoDate, targetCalendar, locale)}
              </span>
            )}
          </div>
        </div>

        {/* All calendars */}
        <div className="grid gap-2">
          <Label className="text-xs font-mono uppercase text-muted-foreground">{t('All calendars')}</Label>
          <div className="grid gap-0.5">
            {CALENDAR_IDS.map(id => (
              <div
                key={id}
                className="flex items-baseline justify-between gap-4 px-3 py-1 rounded-sm odd:bg-muted/30"
                data-testid={`row-date-all-${id}`}
              >
                <span className="text-xs text-muted-foreground">{calendarDisplayName(id, locale)}</span>
                <span className="font-mono text-sm text-foreground" data-testid={`text-date-all-${id}`}>
                  {result.ok ? formatCalendarDate(result.isoDate, id, locale) : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
