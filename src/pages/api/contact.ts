import type { APIRoute } from 'astro';
import { isHoneypotFilled, validateContact } from '@/features/contact/lib/contactSchema';
import { createRateLimiter } from '@/lib/rateLimit';

/** The one route on the site that is not prerendered. */
export const prerender = false;

const checkRateLimit = createRateLimiter({ limit: 3, windowMs: 10 * 60 * 1000 });

function json(body: unknown, status: number, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ errors: {} }, 400);
  }

  // A filled honeypot is discarded silently and reported as success: telling the
  // bot it was caught is how it learns to stop filling that field.
  if (isHoneypotFilled(payload)) {
    return json({ ok: true }, 200);
  }

  // Client-side validation is a convenience; this is the control. Anything can
  // POST here directly, so every rule is enforced again on this side.
  const parsed = validateContact(payload);
  if (!parsed.success) {
    return json({ errors: parsed.errors }, 400);
  }

  // Rate limiting runs *after* validation, and so only counts submissions that
  // would actually be delivered. Checking first meant a person who mistyped
  // their email twice burned two of their three attempts and got locked out for
  // ten minutes — punishing a typo, while the limit exists to protect the send
  // step. Rejecting malformed input stays cheap and stateless either way.
  const rate = checkRateLimit(clientAddress);
  if (!rate.allowed) {
    return json({ error: 'rateLimited' }, 429, {
      'retry-after': String(rate.retryAfterSeconds),
    });
  }

  // Delivery is wired up in the deployment phase, once a domain exists to send
  // from. Until then the endpoint validates, rate-limits and reports honestly
  // rather than pretending to have delivered anything.
  return json({ ok: true }, 200);
};

/** Anything other than POST is a mistake worth naming. */
export const ALL: APIRoute = () => json({ error: 'methodNotAllowed' }, 405, { allow: 'POST' });
