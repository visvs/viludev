import { describe, expect, it } from 'vitest';
import { contactFields, isHoneypotFilled, validateContact } from './contactSchema';

const valid = {
  name: 'Violeta Vera',
  email: 'someone@example.com',
  message: 'This message is comfortably longer than the twenty character minimum.',
};

describe('validateContact', () => {
  it('accepts a well-formed submission', () => {
    const result = validateContact(valid);
    expect(result.success).toBe(true);
  });

  it('trims surrounding whitespace so padding cannot satisfy a minimum', () => {
    const result = validateContact({ ...valid, name: '   Violeta   ' });
    expect(result.success ? result.data.name : undefined).toBe('Violeta');
  });

  it('rejects whitespace-only input that would otherwise look long enough', () => {
    const result = validateContact({ ...valid, message: ' '.repeat(50) });
    expect(result.success).toBe(false);
  });

  it.each([
    ['missing @', 'not-an-email'],
    ['missing domain', 'someone@'],
    ['empty', ''],
  ])('rejects an invalid email (%s)', (_label, email) => {
    const result = validateContact({ ...valid, email });
    expect(result.success).toBe(false);
    expect(!result.success && result.errors.email).toBeTruthy();
  });

  it('reports one error per field rather than a pile per field', () => {
    const result = validateContact({ name: '', email: 'nope', message: 'short' });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(Object.keys(result.errors).sort()).toEqual(['email', 'message', 'name']);
    for (const value of Object.values(result.errors)) {
      expect(typeof value).toBe('string');
    }
  });

  it('returns codes rather than prose, because the form is bilingual', () => {
    const result = validateContact({ ...valid, message: 'too short' });
    expect(!result.success && result.errors.message).toBe('messageTooShort');
  });

  it('rejects a filled honeypot', () => {
    const result = validateContact({ ...valid, website: 'http://spam.example' });
    expect(result.success).toBe(false);
  });

  it('accepts an empty or absent honeypot', () => {
    expect(validateContact({ ...valid, website: '' }).success).toBe(true);
    expect(validateContact(valid).success).toBe(true);
  });

  it('rejects oversized input rather than accepting an unbounded payload', () => {
    expect(validateContact({ ...valid, message: 'a'.repeat(4001) }).success).toBe(false);
    expect(validateContact({ ...valid, name: 'a'.repeat(101) }).success).toBe(false);
  });

  it('rejects non-object input without throwing', () => {
    for (const input of [null, undefined, 'string', 42, []]) {
      expect(validateContact(input).success).toBe(false);
    }
  });

  it('never surfaces an error for a field a person cannot fill in', () => {
    const result = validateContact({ ...valid, website: 'spam' });
    if (result.success) throw new Error('expected failure');
    for (const key of Object.keys(result.errors)) {
      expect(contactFields).toContain(key);
    }
  });

  /** Naming the honeypot in an error would tell a bot which field caught it. */
  it('rejects a filled honeypot without reporting any field error', () => {
    const result = validateContact({ ...valid, website: 'spam' });
    expect(result.success).toBe(false);
    expect(!result.success && result.errors).toEqual({});
  });

  it.each([
    ['a plus address', 'someone+tag@example.com', true],
    ['a subdomain', 'someone@mail.example.co.uk', true],
    ['a space', 'some one@example.com', false],
    ['no dot in domain', 'someone@example', false],
    ['trailing dot', 'someone@example.', false],
    ['double @', 'a@b@example.com', false],
  ])('email: %s', (_label, email, expected) => {
    expect(validateContact({ ...valid, email }).success).toBe(expected);
  });
});

describe('isHoneypotFilled', () => {
  it('detects a filled honeypot', () => {
    expect(isHoneypotFilled({ website: 'spam' })).toBe(true);
  });

  it('treats empty or whitespace-only as unfilled', () => {
    expect(isHoneypotFilled({ website: '' })).toBe(false);
    expect(isHoneypotFilled({ website: '   ' })).toBe(false);
    expect(isHoneypotFilled({})).toBe(false);
  });

  it('tolerates non-object input', () => {
    expect(isHoneypotFilled(null)).toBe(false);
    expect(isHoneypotFilled('nope')).toBe(false);
  });
});
