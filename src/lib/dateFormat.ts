import { format, parse, isValid } from 'date-fns';
import { enUS, fr, de, es, ar, zhCN, ja } from 'date-fns/locale';
import type { Locale as AppLocale } from './translations';
import type { Locale as DateFnsLocale } from 'date-fns';

const DATE_FNS_LOCALES: Record<AppLocale, DateFnsLocale> = {
  en: enUS,
  fr,
  de,
  es,
  ar,
  zh: zhCN,
  ja,
};

// Formats we try to parse CV date strings with, in order of likelihood
const PARSE_FORMATS = [
  'yyyy-MM',   // 2021-01
  'MMM yyyy',  // Jan 2021
  'MMMM yyyy', // January 2021
  'yyyy',      // 2021
  'MM/yyyy',   // 01/2021
];

const PRESENT_ALIASES = new Set(['present', 'current', 'now', 'ongoing', 'الآن', '至今', '現在']);

/**
 * Formats a CV date string into a locale-appropriate representation.
 * Returns the original string unchanged if it cannot be parsed.
 * Strings like "Present" pass through untouched (locale-specific equivalents handled by caller).
 */
export function formatCVDate(dateStr: string, appLocale: AppLocale): string {
  const trimmed = dateStr.trim();
  if (!trimmed) return trimmed;
  if (PRESENT_ALIASES.has(trimmed.toLowerCase())) return trimmed;

  const dateFnsLocale = DATE_FNS_LOCALES[appLocale];
  const referenceDate = new Date(2000, 0, 1); // needed by date-fns parse

  for (const fmt of PARSE_FORMATS) {
    try {
      const parsed = parse(trimmed, fmt, referenceDate, { locale: dateFnsLocale });
      if (isValid(parsed)) {
        // Use a concise output format matching the input granularity
        const outputFmt = fmt === 'yyyy' ? 'yyyy' : 'MMM yyyy';
        return format(parsed, outputFmt, { locale: dateFnsLocale });
      }
    } catch {
      // try next format
    }
  }

  return trimmed; // unparseable — return as-is
}
