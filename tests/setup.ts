import { afterEach } from 'vitest';
import { cleanup } from 'vitest-browser-react/pure';

// vitest-browser-react v2 unmounts asynchronously, so this must be awaited or
// components leak between tests.
afterEach(async () => {
  await cleanup();
});
