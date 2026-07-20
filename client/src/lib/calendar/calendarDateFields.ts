// Input fields describing a date in a specific calendar.
// Era-based calendars (see CALENDAR_ERAS) use era + eraYear; the rest use a
// signed calendar year. `month` is the ordinal month in that calendar year
// (1-based), which is unambiguous even in leap-month years.
export interface CalendarDateFields {
  calendar: string;
  era?: string;
  eraYear?: number;
  year?: number;
  month: number;
  day: number;
}
