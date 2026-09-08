# viludev

Personal developer portfolio for Violeta Vera Salazar — Frontend Developer.

Built with Astro, TypeScript, Tailwind CSS, React and Vitest.

## Status

Phase 0 complete: toolchain, architecture and quality gates in place. Content and
design land in the following phases.

## Getting started

```bash
pnpm install
pnpm dev
```

## Scripts

| Command          | Description                        |
| ---------------- | ---------------------------------- |
| `pnpm dev`       | Dev server                         |
| `pnpm build`     | Production build to `dist/`        |
| `pnpm preview`   | Serve the production build locally |
| `pnpm typecheck` | `astro check` + `tsc --noEmit`     |
| `pnpm lint`      | ESLint, zero warnings tolerated    |
| `pnpm test`      | Vitest (unit + browser projects)   |
| `pnpm verify`    | Everything above, in order         |

## Architecture

See [AGENTS.md](./AGENTS.md). Each folder under `src/` carries a `README.md`
explaining its responsibility.

## Notable decisions

Documented as they are made; the full set with trade-offs lands in Phase 9.

- **TypeScript is pinned to 6.0.3, not 7.** `typescript-eslint` supports
  `<6.1.0` and `@astrojs/check` supports `^6.0.0`, so TypeScript 7 would mean
  losing type-aware linting. Revisit when both catch up.
- **Vitest runs in real Chromium rather than jsdom.** The tests that matter most
  here are accessibility tests — focus order, live-region announcements — and
  jsdom approximates those APIs well enough to produce both false passes and
  false failures.
- **Architectural boundaries are lint rules, not documentation.** "A feature
  never imports another feature" is enforced by `no-restricted-imports`.
