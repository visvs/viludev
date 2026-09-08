import { useId, useRef, useState, type SyntheticEvent } from 'react';
import { buttonVariants } from '@/components/ui/button.variants';
import { cn } from '@/lib/cn';
import {
  contactFields,
  validateContact,
  type ContactField,
  type FieldErrors,
} from '../lib/contactSchema';
import { submitContact } from '../lib/submitContact';

/**
 * The only React island on the site.
 *
 * It earns that on merit: a genuine state machine, live validation, focus
 * management and screen-reader announcements. Everything else on this page is
 * expressible in HTML and CSS, so it is.
 */
type Status = 'idle' | 'submitting' | 'success' | 'error' | 'rateLimited';

/** Rendered strings are passed in, so this component holds no copy of its own. */
export interface ContactFormStrings {
  heading: string;
  name: string;
  email: string;
  message: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successBody: string;
  sendAnother: string;
  errorTitle: string;
  errorBody: string;
  rateLimited: string;
  errorSummary: string;
  honeypot: string;
  required: string;
  /** Validation code -> translated sentence. */
  validation: Record<string, string>;
}

interface Props {
  strings: ContactFormStrings;
}

const initialValues: Record<ContactField, string> = { name: '', email: '', message: '' };

export default function ContactForm({ strings }: Props) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>('idle');

  const formId = useId();
  const statusRef = useRef<HTMLDivElement>(null);
  const fieldRefs = useRef<Partial<Record<ContactField, HTMLElement | null>>>({});

  const fieldId = (field: ContactField) => `${formId}-${field}`;
  const errorId = (field: ContactField) => `${formId}-${field}-error`;

  /** Translate a validation code, falling back to the code so nothing renders blank. */
  const messageFor = (code: string | undefined) =>
    code === undefined ? undefined : (strings.validation[code] ?? code);

  function updateField(field: ContactField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    // Clear the error as soon as the person starts fixing it. Leaving it up
    // while they type reads as the form arguing with them.
    setErrors((current) => {
      if (current[field] === undefined) return current;
      return Object.fromEntries(Object.entries(current).filter(([key]) => key !== field));
    });
  }

  /**
   * Move focus to the first field that failed. Without this, a keyboard or
   * screen-reader user is left at the submit button with no idea what changed.
   */
  function focusFirstError(fieldErrors: FieldErrors) {
    const first = contactFields.find((field) => fieldErrors[field] !== undefined);
    if (first) fieldRefs.current[first]?.focus();
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'submitting') return;

    const formData = new FormData(event.currentTarget);
    // A FormData entry can be a File, so narrow rather than stringify blindly.
    const honeypot = formData.get('website');
    const payload = {
      ...values,
      website: typeof honeypot === 'string' ? honeypot : '',
    };

    const parsed = validateContact(payload);
    if (!parsed.success) {
      setErrors(parsed.errors);
      setStatus('idle');
      focusFirstError(parsed.errors);
      return;
    }

    setErrors({});
    setStatus('submitting');

    const result = await submitContact(parsed.data);

    if (result.status === 'ok') {
      setStatus('success');
      setValues(initialValues);
      // The success panel replaces the form, so focus has to follow it or the
      // reader is stranded on a button that no longer exists.
      requestAnimationFrame(() => statusRef.current?.focus());
      return;
    }

    if (result.status === 'invalid') {
      setErrors(result.errors);
      setStatus('idle');
      focusFirstError(result.errors);
      return;
    }

    setStatus(result.status === 'rateLimited' ? 'rateLimited' : 'error');
  }

  if (status === 'success') {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className="border-success/40 bg-success/10 rounded-xl border p-8"
      >
        <p className="text-success text-lg font-semibold">{strings.successTitle}</p>
        <p className="text-text-muted mt-2">{strings.successBody}</p>
        <button
          type="button"
          onClick={() => {
            setStatus('idle');
          }}
          className={cn(buttonVariants({ intent: 'secondary', size: 'md' }), 'mt-6')}
        >
          {strings.sendAnother}
        </button>
      </div>
    );
  }

  const submitting = status === 'submitting';
  const failed = status === 'error' || status === 'rateLimited';
  const hasFieldErrors = Object.keys(errors).length > 0;

  return (
    <form
      onSubmit={(event) => {
        // The handler is async; onSubmit expects void, so the promise is
        // deliberately not returned. Every failure path is handled inside it.
        void handleSubmit(event);
      }}
      noValidate
      className="space-y-6"
    >
      {/*
        A single polite live region for the form's overall outcome. Field-level
        errors are announced through aria-describedby when focus lands on the
        field, so they are not repeated here — hearing every error twice is
        worse than hearing it once.
      */}
      <div aria-live="polite" className="empty:hidden">
        {failed && (
          <div className="border-danger/40 bg-danger/10 rounded-lg border p-4">
            <p className="text-danger font-semibold">{strings.errorTitle}</p>
            <p className="text-text-muted mt-1 text-sm">
              {status === 'rateLimited' ? strings.rateLimited : strings.errorBody}
            </p>
          </div>
        )}
        {hasFieldErrors && <p className="text-danger text-sm">{strings.errorSummary}</p>}
      </div>

      {contactFields.map((field) => {
        const error = messageFor(errors[field]);
        const isMessage = field === 'message';
        const label =
          field === 'name' ? strings.name : field === 'email' ? strings.email : strings.message;

        const shared = {
          id: fieldId(field),
          name: field,
          value: values[field],
          'aria-invalid': error !== undefined,
          'aria-describedby': error !== undefined ? errorId(field) : undefined,
          required: true,
          disabled: submitting,
          className: cn(
            'w-full rounded-lg border bg-surface px-4 py-3 text-text',
            'placeholder:text-text-subtle transition-colors duration-fast',
            'disabled:opacity-60',
            error !== undefined ? 'border-danger' : 'border-border-strong',
          ),
        };

        return (
          <div key={field}>
            <label
              htmlFor={fieldId(field)}
              className="text-text-subtle mb-2 block font-mono text-xs tracking-[0.15em] uppercase"
            >
              {label}
              <span className="sr-only"> ({strings.required})</span>
            </label>

            {isMessage ? (
              <textarea
                {...shared}
                ref={(node) => {
                  fieldRefs.current.message = node;
                }}
                rows={6}
                onChange={(event) => {
                  updateField(field, event.target.value);
                }}
              />
            ) : (
              <input
                {...shared}
                ref={(node) => {
                  fieldRefs.current[field] = node;
                }}
                type={field === 'email' ? 'email' : 'text'}
                autoComplete={field === 'email' ? 'email' : 'name'}
                onChange={(event) => {
                  updateField(field, event.target.value);
                }}
              />
            )}

            {error !== undefined && (
              <p id={errorId(field)} className="text-danger mt-2 text-sm">
                {error}
              </p>
            )}
          </div>
        );
      })}

      {/*
        Honeypot. Hidden from people but not with `display: none`, which some
        bots check for; kept out of the tab order and out of the accessibility
        tree so it never reaches a real user.
      */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${formId}-website`}>{strings.honeypot}</label>
        <input
          id={`${formId}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className={cn(buttonVariants({ intent: 'primary', size: 'lg' }))}
      >
        {submitting ? strings.submitting : strings.submit}
      </button>
    </form>
  );
}
