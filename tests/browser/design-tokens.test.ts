import { describe, expect, it } from 'vitest';
import { parse, wcagContrast } from 'culori';
import '../../src/styles/global.css';

type Theme = 'dark' | 'light';

/**
 * Resolve a semantic token to a concrete colour by applying it to a real element
 * and reading the computed value back. Letting the browser resolve the `var()`
 * chain and the OKLCH maths is far more trustworthy than re-implementing either
 * in the test.
 */
function resolveToken(token: string, theme: Theme): string {
  document.documentElement.setAttribute('data-theme', theme);
  const probe = document.createElement('div');
  probe.style.color = `var(${token})`;
  document.body.appendChild(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
}

function toColor(value: string) {
  const parsed = parse(value);
  if (!parsed) throw new Error(`Unparseable colour: ${value}`);
  return parsed;
}

function contrast(foreground: string, background: string, theme: Theme): number {
  return wcagContrast(
    toColor(resolveToken(foreground, theme)),
    toColor(resolveToken(background, theme)),
  );
}

/** WCAG 2.2: 4.5:1 for body text, 3:1 for large text and UI component boundaries. */
const AA_TEXT = 4.5;
const AA_NON_TEXT = 3;

const textPairs: ReadonlyArray<readonly [string, string]> = [
  ['--color-text', '--color-surface'],
  ['--color-text', '--color-surface-raised'],
  ['--color-text-muted', '--color-surface'],
  ['--color-text-subtle', '--color-surface'],
  ['--color-accent', '--color-surface'],
  ['--color-accent-contrast', '--color-accent'],
  ['--color-secondary', '--color-surface'],
  ['--color-success', '--color-surface'],
  ['--color-danger', '--color-surface'],
];

const nonTextPairs: ReadonlyArray<readonly [string, string]> = [
  ['--color-focus', '--color-surface'],
  ['--color-border-strong', '--color-surface'],
];

describe('the contrast maths itself', () => {
  it('agrees with the known black-on-white ratio', () => {
    expect(wcagContrast(toColor('#000'), toColor('#fff'))).toBeCloseTo(21, 1);
  });

  it('reports no contrast for a colour against itself', () => {
    expect(wcagContrast(toColor('#777'), toColor('#777'))).toBeCloseTo(1, 2);
  });
});

/**
 * The accessibility target is stated as a goal elsewhere; this is where it is
 * actually enforced. Retuning the palette cannot silently break contrast,
 * because doing so fails the build.
 */
describe.each<Theme>(['dark', 'light'])('%s theme contrast', (theme) => {
  it.each(textPairs)('%s on %s meets AA for body text', (fg, bg) => {
    expect(contrast(fg, bg, theme)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it.each(nonTextPairs)('%s on %s meets AA for non-text', (fg, bg) => {
    expect(contrast(fg, bg, theme)).toBeGreaterThanOrEqual(AA_NON_TEXT);
  });
});

/**
 * Tailwind only emits theme variables that a utility class references, so a
 * token used solely through `var(--color-…)` can silently resolve to nothing.
 * `@theme static` is what prevents that; this test is what stops anyone
 * removing it without noticing.
 */
describe('primitive palette availability', () => {
  const palette: Readonly<Record<string, readonly string[]>> = {
    ink: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '850', '900', '950'],
    violet: ['200', '300', '400', '500', '600', '700', '800'],
    turquoise: ['200', '300', '400', '500', '600', '700'],
    green: ['300', '400', '500', '600', '700'],
    red: ['300', '400', '500', '600', '700'],
  };

  const tokens = Object.entries(palette).flatMap(([hue, steps]) =>
    steps.map((step) => `--color-${hue}-${step}`),
  );

  it.each(tokens)('%s is emitted as a CSS custom property', (token) => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
    expect(value).not.toBe('');
  });
});
