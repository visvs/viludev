import { describe, expect, it } from 'vitest';
import { formatDateRange, formatMonth, sortByRecency } from './formatDateRange';

describe('formatMonth', () => {
  it('formats in English', () => {
    expect(formatMonth('2025-01', 'en')).toBe('Jan 2025');
  });

  it('formats in Spanish, which uses different month names', () => {
    expect(formatMonth('2025-01', 'es')).toMatch(/ene/i);
    expect(formatMonth('2025-01', 'es')).toContain('2025');
  });

  it('handles December without rolling into the next year', () => {
    expect(formatMonth('2024-12', 'en')).toBe('Dec 2024');
  });

  it('rejects malformed input rather than rendering an invalid date', () => {
    expect(() => formatMonth('2025', 'en')).toThrow();
  });
});

describe('formatDateRange', () => {
  it('renders a closed range', () => {
    expect(formatDateRange('2022-08', '2024-12', 'en', 'Present')).toBe('Aug 2022 — Dec 2024');
  });

  it('uses the present label when there is no end date', () => {
    expect(formatDateRange('2025-01', null, 'en', 'Present')).toBe('Jan 2025 — Present');
  });

  it('uses the localised present label', () => {
    expect(formatDateRange('2025-01', null, 'es', 'Actualidad')).toContain('Actualidad');
  });
});

describe('sortByRecency', () => {
  const liverpool = { startDate: '2022-01', endDate: '2022-07' };
  const directo = { startDate: '2022-08', endDate: '2024-12' };
  const ambit = { startDate: '2025-01', endDate: null };

  it('puts the current role first', () => {
    expect(sortByRecency([liverpool, directo, ambit])[0]).toBe(ambit);
  });

  it('orders the rest newest first', () => {
    expect(sortByRecency([liverpool, directo, ambit])).toEqual([ambit, directo, liverpool]);
  });

  it('does not mutate its input', () => {
    const input = [liverpool, directo, ambit];
    sortByRecency(input);
    expect(input).toEqual([liverpool, directo, ambit]);
  });

  it('is stable for an already sorted list', () => {
    const sorted = [ambit, directo, liverpool];
    expect(sortByRecency(sorted)).toEqual(sorted);
  });
});
