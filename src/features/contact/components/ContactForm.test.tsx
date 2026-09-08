import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import ContactForm, { type ContactFormStrings } from './ContactForm';

const strings: ContactFormStrings = {
  heading: 'Send a message',
  name: 'Name',
  email: 'Email',
  message: 'Message',
  submit: 'Send message',
  submitting: 'Sending…',
  successTitle: 'Message sent',
  successBody: 'Thanks.',
  sendAnother: 'Send another',
  errorTitle: 'Something went wrong',
  errorBody: 'It did not go through.',
  rateLimited: 'Too many messages.',
  errorSummary: 'Please fix the fields below.',
  honeypot: 'Do not fill this in',
  required: 'required',
  validation: {
    nameTooShort: 'Please enter at least 2 characters.',
    emailInvalid: 'Please enter a valid email address.',
    messageTooShort: 'Please write at least 20 characters.',
  },
};

const validMessage = 'This message is comfortably longer than twenty characters.';

/**
 * Query helpers that throw a useful message instead of returning null, so a
 * broken selector fails with a readable reason rather than a type assertion.
 */
function field(name: 'name' | 'email'): HTMLInputElement {
  const el = document.querySelector<HTMLInputElement>(`input[name="${name}"]`);
  if (!el) throw new Error(`No input named "${name}" in the form`);
  return el;
}

function messageField(): HTMLTextAreaElement {
  const el = document.querySelector<HTMLTextAreaElement>('textarea[name="message"]');
  if (!el) throw new Error('No message textarea in the form');
  return el;
}

function validationText(code: keyof typeof strings.validation): string {
  const text = strings.validation[code];
  if (text === undefined) throw new Error(`No test string for validation code "${code}"`);
  return text;
}

function elementById(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`No element with id "${id}"`);
  return el;
}

function mockFetch(handler: () => Response) {
  const spy = vi.fn(() => Promise.resolve(handler()));
  vi.stubGlobal('fetch', spy);
  return spy;
}

async function fillValidForm() {
  await userEvent.fill(field('name'), 'Violeta');
  await userEvent.fill(field('email'), 'someone@example.com');
  await userEvent.fill(messageField(), validMessage);
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ContactForm — labelling and structure', () => {
  it('gives every field a programmatically associated label', async () => {
    const screen = await render(<ContactForm strings={strings} />);
    await expect.element(screen.getByLabelText(/Name/)).toBeInTheDocument();
    await expect.element(screen.getByLabelText(/Email/)).toBeInTheDocument();
    await expect.element(screen.getByLabelText(/Message/)).toBeInTheDocument();
  });

  it('keeps the honeypot out of the accessibility tree and the tab order', async () => {
    await render(<ContactForm strings={strings} />);
    const honeypot = document.querySelector<HTMLInputElement>('input[name="website"]');
    expect(honeypot).not.toBeNull();
    expect(honeypot?.tabIndex).toBe(-1);
    expect(honeypot?.closest('[aria-hidden="true"]')).not.toBeNull();
  });
});

describe('ContactForm — validation', () => {
  it('shows an error per invalid field instead of submitting', async () => {
    const spy = mockFetch(() => new Response(null, { status: 200 }));
    const screen = await render(<ContactForm strings={strings} />);

    await userEvent.click(screen.getByRole('button', { name: strings.submit }));

    await expect.element(screen.getByText(validationText('nameTooShort'))).toBeVisible();
    await expect.element(screen.getByText(validationText('emailInvalid'))).toBeVisible();
    expect(spy).not.toHaveBeenCalled();
  });

  /**
   * The core accessibility guarantee: a keyboard or screen-reader user who
   * submits an invalid form must be moved to the problem, not left on the
   * button wondering what happened.
   */
  it('moves focus to the first invalid field', async () => {
    mockFetch(() => new Response(null, { status: 200 }));
    const screen = await render(<ContactForm strings={strings} />);

    await userEvent.click(screen.getByRole('button', { name: strings.submit }));

    expect(document.activeElement?.getAttribute('name')).toBe('name');
  });

  it('associates each error with its field via aria-describedby', async () => {
    mockFetch(() => new Response(null, { status: 200 }));
    const screen = await render(<ContactForm strings={strings} />);

    await userEvent.click(screen.getByRole('button', { name: strings.submit }));

    const email = field('email');
    expect(email.getAttribute('aria-invalid')).toBe('true');
    const describedBy = email.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(elementById(describedBy ?? '').textContent).toBe(validationText('emailInvalid'));
  });

  it('clears a field error as soon as the person starts correcting it', async () => {
    mockFetch(() => new Response(null, { status: 200 }));
    const screen = await render(<ContactForm strings={strings} />);
    await userEvent.click(screen.getByRole('button', { name: strings.submit }));
    await expect.element(screen.getByText(validationText('nameTooShort'))).toBeVisible();

    await userEvent.fill(field('name'), 'Violeta');

    expect(document.body.textContent).not.toContain(validationText('nameTooShort'));
  });
});

describe('ContactForm — submission states', () => {
  it('reports success and moves focus to the confirmation', async () => {
    mockFetch(() => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const screen = await render(<ContactForm strings={strings} />);

    await fillValidForm();
    await userEvent.click(screen.getByRole('button', { name: strings.submit }));

    await expect.element(screen.getByText(strings.successTitle)).toBeVisible();
    // The form is gone, so focus must follow the panel that replaced it.
    expect(document.activeElement?.getAttribute('role')).toBe('status');
  });

  it('announces the success panel via a live region role', async () => {
    mockFetch(() => new Response(null, { status: 200 }));
    const screen = await render(<ContactForm strings={strings} />);
    await fillValidForm();
    await userEvent.click(screen.getByRole('button', { name: strings.submit }));

    await expect.element(screen.getByRole('status')).toBeVisible();
  });

  it('lets the reader send another message after success', async () => {
    mockFetch(() => new Response(null, { status: 200 }));
    const screen = await render(<ContactForm strings={strings} />);
    await fillValidForm();
    await userEvent.click(screen.getByRole('button', { name: strings.submit }));
    await expect.element(screen.getByText(strings.successTitle)).toBeVisible();

    await userEvent.click(screen.getByRole('button', { name: strings.sendAnother }));

    await expect.element(screen.getByLabelText(/Name/)).toBeVisible();
  });

  it('surfaces a server failure without losing what was typed', async () => {
    mockFetch(() => new Response(null, { status: 500 }));
    const screen = await render(<ContactForm strings={strings} />);
    await fillValidForm();

    await userEvent.click(screen.getByRole('button', { name: strings.submit }));

    await expect.element(screen.getByText(strings.errorTitle)).toBeVisible();
    expect(field('name').value).toBe('Violeta');
  });

  it('distinguishes rate limiting from a generic failure', async () => {
    mockFetch(() => new Response(null, { status: 429 }));
    const screen = await render(<ContactForm strings={strings} />);
    await fillValidForm();

    await userEvent.click(screen.getByRole('button', { name: strings.submit }));

    await expect.element(screen.getByText(strings.rateLimited)).toBeVisible();
  });

  it('survives the network being down', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))),
    );
    const screen = await render(<ContactForm strings={strings} />);
    await fillValidForm();

    await userEvent.click(screen.getByRole('button', { name: strings.submit }));

    await expect.element(screen.getByText(strings.errorTitle)).toBeVisible();
  });

  it('shows the pending state and blocks a double submit', async () => {
    let release: (value: Response) => void = () => {};
    const pending = new Promise<Response>((resolve) => {
      release = resolve;
    });
    const spy = vi.fn(() => pending);
    vi.stubGlobal('fetch', spy);

    const screen = await render(<ContactForm strings={strings} />);
    await fillValidForm();
    await userEvent.click(screen.getByRole('button', { name: strings.submit }));

    await expect.element(screen.getByRole('button', { name: strings.submitting })).toBeDisabled();
    expect(spy).toHaveBeenCalledTimes(1);

    release(new Response(null, { status: 200 }));
    await expect.element(screen.getByText(strings.successTitle)).toBeVisible();
  });

  it('renders server-reported field errors', async () => {
    mockFetch(
      () =>
        new Response(JSON.stringify({ errors: { email: 'emailInvalid' } }), {
          status: 400,
          headers: { 'content-type': 'application/json' },
        }),
    );
    const screen = await render(<ContactForm strings={strings} />);
    await fillValidForm();

    await userEvent.click(screen.getByRole('button', { name: strings.submit }));

    await expect.element(screen.getByText(validationText('emailInvalid'))).toBeVisible();
  });
});
