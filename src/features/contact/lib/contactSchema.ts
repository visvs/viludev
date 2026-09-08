/**
 * Validation shared by the form and the endpoint.
 *
 * Deliberately dependency-free. An earlier version expressed these rules with
 * Zod, which was correct on the server but pulled the whole library into the
 * client bundle — 31 KB gzipped to enforce three length bounds and an email
 * shape. Zod still earns its place validating content collections at build
 * time, where bytes cost nothing.
 *
 * Sharing one module rather than duplicating the rules per side is what keeps
 * the client and the server from drifting apart.
 */

/** The field names a person can actually fill in. */
export const contactFields = ['name', 'email', 'message'] as const;
export type ContactField = (typeof contactFields)[number];

export interface ContactInput {
  name: string;
  email: string;
  message: string;
}

export type FieldErrors = Partial<Record<ContactField, string>>;

export const limits = {
  name: { min: 2, max: 100 },
  email: { max: 254 },
  message: { min: 20, max: 4000 },
} as const;

/**
 * Pragmatic email check: a non-empty local part, an @, and a dotted domain with
 * no whitespace. Deliberately not RFC 5322 — that grammar accepts addresses no
 * mail provider would, and rejecting a valid address is worse than accepting a
 * typo the send step will bounce anyway.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

function readString(source: Record<string, unknown>, key: string): string {
  const value = source[key];
  return typeof value === 'string' ? value.trim() : '';
}

export function validateContact(
  input: unknown,
): { success: true; data: ContactInput } | { success: false; errors: FieldErrors } {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return { success: false, errors: { name: 'nameTooShort' } };
  }

  const source = input as Record<string, unknown>;
  const errors: FieldErrors = {};

  const name = readString(source, 'name');
  if (name.length < limits.name.min) errors.name = 'nameTooShort';
  else if (name.length > limits.name.max) errors.name = 'nameTooLong';

  const email = readString(source, 'email');
  if (email.length > limits.email.max) errors.email = 'emailTooLong';
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'emailInvalid';

  const message = readString(source, 'message');
  if (message.length < limits.message.min) errors.message = 'messageTooShort';
  else if (message.length > limits.message.max) errors.message = 'messageTooLong';

  // A filled honeypot fails validation, but never as a visible field error —
  // naming it would tell a bot exactly which input gave it away.
  const website = source['website'];
  const honeypotFilled = typeof website === 'string' && website.trim().length > 0;

  if (Object.keys(errors).length > 0) return { success: false, errors };
  if (honeypotFilled) return { success: false, errors: {} };

  return { success: true, data: { name, email, message } };
}

/** Whether a rejected submission looks like a bot rather than a mistake. */
export function isHoneypotFilled(input: unknown): boolean {
  if (typeof input !== 'object' || input === null) return false;
  const website = (input as Record<string, unknown>)['website'];
  return typeof website === 'string' && website.trim().length > 0;
}
