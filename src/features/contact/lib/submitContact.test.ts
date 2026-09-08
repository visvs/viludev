import { describe, expect, it, vi } from 'vitest';
import { submitContact } from './submitContact';

const input = {
  name: 'Violeta',
  email: 'someone@example.com',
  message: 'A message that is long enough to pass validation checks.',
};

function respondWith(init: { status: number; body?: unknown }) {
  const impl = () =>
    Promise.resolve(
      new Response(init.body === undefined ? null : JSON.stringify(init.body), {
        status: init.status,
        headers: { 'content-type': 'application/json' },
      }),
    );
  return vi.fn(impl);
}

describe('submitContact', () => {
  it('reports success on a 2xx', async () => {
    expect(await submitContact(input, '/api/contact', respondWith({ status: 200 }))).toEqual({
      status: 'ok',
    });
  });

  it('reports rate limiting distinctly, so the UI can say something useful', async () => {
    expect(await submitContact(input, '/api/contact', respondWith({ status: 429 }))).toEqual({
      status: 'rateLimited',
    });
  });

  it('surfaces server-side field errors from a 400', async () => {
    const result = await submitContact(
      input,
      '/api/contact',
      respondWith({ status: 400, body: { errors: { email: 'emailInvalid' } } }),
    );
    expect(result).toEqual({ status: 'invalid', errors: { email: 'emailInvalid' } });
  });

  it('treats a 400 with an unreadable body as invalid rather than crashing', async () => {
    const badJson = vi.fn(() =>
      Promise.resolve(new Response('not json', { status: 400 })),
    ) as unknown as typeof fetch;
    expect(await submitContact(input, '/api/contact', badJson)).toEqual({
      status: 'invalid',
      errors: {},
    });
  });

  it('reports failure on a 5xx', async () => {
    expect(await submitContact(input, '/api/contact', respondWith({ status: 500 }))).toEqual({
      status: 'failed',
    });
  });

  /** Offline is a state of the form, not an exception for the caller to catch. */
  it('reports failure instead of throwing when the network is down', async () => {
    const offline = vi.fn(() =>
      Promise.reject(new TypeError('Failed to fetch')),
    ) as unknown as typeof fetch;
    await expect(submitContact(input, '/api/contact', offline)).resolves.toEqual({
      status: 'failed',
    });
  });

  it('posts JSON to the endpoint', async () => {
    const spy = respondWith({ status: 200 });
    await submitContact(input, '/api/contact', spy);
    expect(spy).toHaveBeenCalledWith(
      '/api/contact',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(input) }),
    );
  });
});
