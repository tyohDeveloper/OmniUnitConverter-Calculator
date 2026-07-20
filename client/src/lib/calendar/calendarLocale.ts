import type { SupportedLanguage } from '@/lib/localization';

// Map the app language codes to BCP 47 locales for Intl date formatting.
export function calendarLocale(language: SupportedLanguage): string {
  if (language === 'en') return 'en-GB';
  if (language === 'en-us') return 'en-US';
  return language;
}
