import type { ContactInput, FieldErrors } from './contactSchema';

export type SubmitResult =
  | { status: 'ok' }
  | { status: 'invalid'; errors: FieldErrors }
  | { status: 'rateLimited' }
  | { status: 'failed' };

/**
 * Post the form and translate every outcome into a value the UI can render.
 *
 * Nothing here throws: a network failure and a 500 are both legitimate states of
 * the form, not exceptions, and modelling them as values is what keeps the
 * component's state machine total.
 */
export async function submitContact(
  input: ContactInput,
  endpoint = '/api/contact',
  fetchImpl: typeof fetch = fetch,
): Promise<SubmitResult> {
  let response: Response;
  try {
    response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
  } catch {
    return { status: 'failed' };
  }

  if (response.ok) return { status: 'ok' };
  if (response.status === 429) return { status: 'rateLimited' };

  if (response.status === 400) {
    try {
      const body: unknown = await response.json();
      if (typeof body === 'object' && body !== null && 'errors' in body) {
        return { status: 'invalid', errors: (body as { errors: FieldErrors }).errors };
      }
    } catch {
      // A 400 without a parseable body is still a failed submission, not a crash.
    }
    return { status: 'invalid', errors: {} };
  }

  return { status: 'failed' };
}
