# Project conventions

## Commands

| Task                           | Command           |
| ------------------------------ | ----------------- |
| Dev server                     | `pnpm dev`        |
| Full gate (run before pushing) | `pnpm verify`     |
| Typecheck                      | `pnpm typecheck`  |
| Lint                           | `pnpm lint`       |
| Tests                          | `pnpm test`       |
| Accessibility + bundle audit   | `pnpm audit:a11y` |
| Build                          | `pnpm build`      |

## Architecture

Feature-based. The dependency direction is one-way:

```
pages -> features -> components -> lib / types
                 \-> content / data
```

**A feature never imports another feature.** Shared code moves up to
`components/` (UI) or `lib/` (logic). This is enforced by `no-restricted-imports`
in `eslint.config.js`, so a violation fails CI rather than surviving review.

`lib/` must stay pure and framework-agnostic — no React, no Astro imports. That
is what keeps it trivially testable.

Each folder under `src/` has a `README.md` describing what belongs in it. Read
that before adding a file to an unfamiliar folder.

`content/` holds editorial, schema-validated material; `data/` holds short,
config-like lists. The dividing question: would you edit it like a document?

## Code style

- All code, comments and identifiers in English.
- `camelCase` for variables and functions, `PascalCase` for components and types.
- TypeScript strict; `any` is an ESLint error. Use `unknown` plus narrowing.
- Descriptive names. No abbreviations that need a glossary.
- Avoid premature abstraction: extract on the **third** repetition, not the second.

## Astro and React

Astro by default. React only where there is real client-side state that HTML and
CSS cannot express.

Nothing is currently mounted as an island. The contact form component exists and
is covered by browser tests, but is not rendered, so no framework JavaScript
reaches the browser and the page ships 519 bytes of inline script.

Hydration policy when an island is added back: `client:visible` by default,
`client:idle` only when something must be ready before it is seen, and **never**
`client:load`. Every directive carries a one-line comment justifying it.

## Tailwind

Flow: design tokens (`@theme`) -> utilities -> `components/ui` -> features -> pages.

- Components use **semantic** colour tokens only, never primitives.
- The primitive palette is declared `@theme static`. Without it Tailwind only
  emits variables a utility class references, so tokens used through `var()`
  silently resolve to nothing.
- No arbitrary values unless justified in a comment.
- `@apply` is for global base element styles only, never as an abstraction
  mechanism — use a component or a `cva` variant instead.
- Verify new utilities actually generate. `w-88`, `duration-base` and
  `src/lib/**/*.ts` globs have all silently matched nothing in this project.

## Motion

Scroll work uses native CSS scroll-driven animations, never a library or a
scroll listener. Two rules keep it safe:

1. Content is visible by default. The hidden state exists only inside
   `@keyframes`, never as a base rule, so an unsupporting browser shows a
   complete static page.
2. Everything sits behind `prefers-reduced-motion: no-preference`.

Never animate `transform` on the same element from two animations — the second
silently overwrites the first. Nest instead.

## Accessibility

`pnpm audit:a11y` runs axe over the production build in both locales and both
themes and fails on any violation. It has caught real regressions that the unit
tests could not, so run it before pushing.

Decorative overlays composite over the surface and cost contrast. The
`--bloom-opacity` ceiling is per-theme and asserted by a test; do not raise it.

## Testing

- `unit` project (Node): pure logic.
- `browser` project (real Chromium): React components and token resolution.
- No coverage threshold, deliberately — see the README for why the numbers are
  unreliable under this setup.
- No coverage requirement on presentational markup.

## Privacy

Never publish a location or a phone number, including in structured data. Tests
assert both stay absent.

## Commits

Conventional Commits, enforced by commitlint. Short-lived branches off `main`,
squash merge.
