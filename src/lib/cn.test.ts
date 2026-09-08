import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('flex', 'items-center')).toBe('flex items-center');
  });

  it('drops falsy values', () => {
    expect(cn('flex', false, null, undefined, '')).toBe('flex');
  });

  it('resolves conflicting Tailwind utilities in favour of the last one', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('keeps non-conflicting utilities from the same group', () => {
    expect(cn('px-2', 'py-4')).toBe('px-2 py-4');
  });

  it('supports conditional objects and arrays', () => {
    expect(cn(['flex', { hidden: false, 'gap-2': true }])).toBe('flex gap-2');
  });
});
