import type { Locale } from '@/lib/i18n';

/**
 * Format an ISO year-month range for display, e.g. "Jan 2025 — Present".
 *
 * Uses `Intl.DateTimeFormat` rather than a translated month table, so the month
 * names, order and capitalisation are correct per locale without any of it being
 * hand-maintained. Day 1 is used because the input has month precision only.
 */
export function formatMonth(isoMonth: string, locale: Locale): string {
  const [year, month] = isoMonth.split('-');
  if (year === undefined || month === undefined) {
    throw new Error(`Expected an ISO year-month such as "2025-01", received "${isoMonth}"`);
  }

  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }).format(date);
}

export function formatDateRange(
  startDate: string,
  endDate: string | null,
  locale: Locale,
  presentLabel: string,
): string {
  const start = formatMonth(startDate, locale);
  const end = endDate === null ? presentLabel : formatMonth(endDate, locale);
  return `${start} — ${end}`;
}

/** Sort newest first. Current roles (no end date) always come first. */
export function sortByRecency<T extends { startDate: string; endDate: string | null }>(
  entries: readonly T[],
): T[] {
  return [...entries].sort((a, b) => {
    if (a.endDate === null && b.endDate !== null) return -1;
    if (b.endDate === null && a.endDate !== null) return 1;
    return b.startDate.localeCompare(a.startDate);
  });
}
