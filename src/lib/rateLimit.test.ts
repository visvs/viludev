import { describe, expect, it } from 'vitest';
import { createRateLimiter } from './rateLimit';

describe('createRateLimiter', () => {
  it('allows requests up to the limit', () => {
    const check = createRateLimiter({ limit: 3, windowMs: 60_000 });
    expect(check('a', 0).allowed).toBe(true);
    expect(check('a', 0).allowed).toBe(true);
    expect(check('a', 0).allowed).toBe(true);
  });

  it('blocks the request after the limit', () => {
    const check = createRateLimiter({ limit: 2, windowMs: 60_000 });
    check('a', 0);
    check('a', 0);
    expect(check('a', 0).allowed).toBe(false);
  });

  it('reports how long to wait', () => {
    const check = createRateLimiter({ limit: 1, windowMs: 60_000 });
    check('a', 0);
    expect(check('a', 10_000).retryAfterSeconds).toBe(50);
  });

  it('never reports a wait of zero while blocking', () => {
    const check = createRateLimiter({ limit: 1, windowMs: 60_000 });
    check('a', 0);
    expect(check('a', 59_999).retryAfterSeconds).toBeGreaterThanOrEqual(1);
  });

  it('opens a fresh window once the old one expires', () => {
    const check = createRateLimiter({ limit: 1, windowMs: 60_000 });
    check('a', 0);
    expect(check('a', 60_000).allowed).toBe(true);
  });

  it('keeps callers independent, so one visitor cannot block another', () => {
    const check = createRateLimiter({ limit: 1, windowMs: 60_000 });
    check('a', 0);
    expect(check('a', 0).allowed).toBe(false);
    expect(check('b', 0).allowed).toBe(true);
  });

  it('does not grow without bound', () => {
    const check = createRateLimiter({ limit: 1, windowMs: 1000 });
    for (let i = 0; i < 1200; i += 1) check(`key-${String(i)}`, 0);
    // Every early window has expired by now; the sweep should reclaim them.
    check('trigger-sweep', 10_000);
    expect(check('key-0', 10_000).allowed).toBe(true);
  });
});
