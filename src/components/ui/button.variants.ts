import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Button styling lives here rather than inside a component so the Astro button
 * and the React submit button in the contact form share one definition. `cva`
 * gives the variants exhaustive types, so an invalid `intent` is a compile
 * error instead of an unstyled button in production.
 */
export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-md',
    'font-medium whitespace-nowrap',
    'transition-colors duration-fast ease-out-expo',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      intent: {
        primary: 'bg-accent text-accent-contrast hover:bg-accent-hover',
        secondary: 'border border-border-strong text-text hover:border-accent hover:text-accent',
        ghost: 'text-text-muted hover:bg-surface-raised hover:text-text',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-5 text-base',
        lg: 'h-13 px-7 text-lg',
      },
    },
    defaultVariants: { intent: 'primary', size: 'md' },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
