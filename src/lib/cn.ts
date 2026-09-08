import { cx } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import type { ClassValue } from 'class-variance-authority/types';

/**
 * Merge conditional class names, resolving Tailwind conflicts so a class passed
 * in from outside always wins over a component's default.
 *
 * `cx` comes from class-variance-authority rather than adding `clsx` directly —
 * cva already bundles it, so this costs nothing extra.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(cx(inputs));
}
