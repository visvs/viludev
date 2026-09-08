import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';

/**
 * Canary for the browser-mode toolchain itself: real Chromium, React 19
 * rendering, and accessibility-role queries. It has no product value, but it
 * fails loudly if the test environment regresses, instead of that surfacing
 * later disguised as a component bug.
 */
describe('browser toolchain', () => {
  it('renders React in a real browser and queries by accessible role', async () => {
    const screen = await render(<button type="button">Send message</button>);
    await expect.element(screen.getByRole('button', { name: 'Send message' })).toBeVisible();
  });
});
