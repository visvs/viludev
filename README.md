# viludev

Personal portfolio for **Violeta Vera Salazar**, Frontend Developer.

Astro · TypeScript · Tailwind CSS · React · Vitest

The site is bilingual, ships **2.5 KB of JavaScript** on the critical path, and
has **zero axe violations** across both languages and both themes.

## Running it

```bash
pnpm install
pnpm dev
```

| Command              | What it does                                                |
| -------------------- | ----------------------------------------------------------- |
| `pnpm dev`           | Dev server                                                  |
| `pnpm build`         | Production build                                            |
| `pnpm verify`        | The full gate: typecheck, lint, format, tests, build, audit |
| `pnpm test`          | Vitest — a Node project and a real-Chromium project         |
| `pnpm audit:a11y`    | axe + JavaScript budget against the built output            |
| `pnpm test:coverage` | Coverage report (diagnostic, not a gate — see below)        |

## Architecture

Feature-based, with one-way dependencies:

```
pages → features → components → lib / types
                └→ content / data
```

**A feature never imports another feature.** Shared code moves up to
`components/` (UI) or `lib/` (logic). This is not a convention in a document —
it is an ESLint rule, so breaking it fails CI. `lib/` is likewise forbidden from
importing React or Astro, which is what keeps it trivially testable.

Every folder under `src/` carries a `README.md` stating what belongs in it.
`content/` holds editorial, schema-validated material; `data/` holds short,
config-like lists. The dividing question: would you edit it like a document?

## Decisions worth explaining

**Exactly one React island.** The contact form is the only component with state
HTML and CSS cannot express — a real state machine, focus management, live-region
announcements. The theme toggle flips one attribute; the mobile menu uses the
native Popover API, which already handles light-dismiss, Escape and focus. A
portfolio built by a React developer that ships almost no React is a deliberate
statement about knowing when not to reach for it.

_Cost:_ React's runtime is 57 KB gzipped. It is deferred behind `client:visible`,
so it is never in the critical path, but it is the honest price of the choice.

**The scroll choreography is CSS, not JavaScript.** Twenty-one scroll-driven
animations run on native `ScrollTimeline` and `ViewTimeline`, on the compositor,
off the main thread. No observer, no scroll listener, no library — so none of it
can cost input responsiveness. GSAP and Lenis were considered and rejected: 20–60 KB
on the main thread, plus synthetic smooth-scroll that hijacks the user's wheel.

The hidden state exists only inside `@keyframes`, never as a base rule, so a
browser without support renders a complete static page rather than blank content
waiting for an effect that will never arrive.

**Two-layer design tokens.** An OKLCH primitive palette that components never
touch, and semantic role tokens that are the only colours they may use. Theming
is a redefinition of fifteen variables rather than an audit of forty components.

`#8B5CF6` cannot carry accessible text in either direction — white on it is
4.23:1, dark ink 4.52:1 — so `accent` is the step that is safe as text and
`accent-strong` is the brand purple, reserved for surfaces with no text on them.

**Contrast is a test, not a promise.** A browser test resolves every semantic
token through real computed styles and fails the build below AA. It caught
`border-strong` at 1.8:1 against the surface, well under the 3:1 that WCAG 1.4.11
requires of interactive control boundaries.

**Accessibility is audited automatically.** `scripts/audit.mjs` serves the
production build, loads both locales in both themes, scrolls so lazy sections and
the stacked deck are in their real rendered state, and fails on any violation or
on the JavaScript budget. It exists because axe found real regressions three
times during development that the unit tests could not — decorative blooms
crushing contrast, receded cards dimming their own text, light-theme muted tiers
falling under the line. A guarantee verified by hand is verified once.

Playwright is used as a _library_, not as a test runner. A second framework with
its own config and fixtures is not warranted for one static page.

**Validation is shared and dependency-free.** One module serves the form and the
endpoint, so they cannot drift. It was originally Zod, which was right on the
server but pulled the whole library into the client to enforce three length
bounds — 31 KB gzipped, now 11 KB. Zod still validates content collections at
build time, where bytes cost nothing.

**Rate limiting runs after validation.** Checking first meant someone who mistyped
their email twice burned two of three attempts and was locked out for ten
minutes, punishing a typo when the limit exists to protect the send step.

**TypeScript is pinned to 6.0.3, not 7.** `typescript-eslint` supports `<6.1.0`
and `@astrojs/check` supports `^6.0.0`; adopting 7 would cost type-aware linting.

**Coverage is a diagnostic, not a gate.** Under this Astro + Vitest `projects`
setup the v8 provider attributes covered modules inconsistently — files reached
through the `@/` alias drop out of the report while untested files appear — so a
run covers two of the eight modules it should. A threshold computed over a
quarter of the code is worse than none, because it reads as a passing gate while
measuring almost nothing. What guards this codebase is 181 explicit assertions
and the audit above.

## Testing

Two Vitest projects. `unit` runs pure logic in Node. `browser` runs React
islands and token resolution in real Chromium — because the tests that matter
most here are accessibility tests, and jsdom approximates focus order and
live regions well enough to produce both false passes and false failures.

Presentational markup carries no coverage requirement, deliberately. Asserting
that a `div` has a class breaks on every redesign and catches nothing.

## Deliberately not here

Storybook (a one-page `/styleguide` covers the need), any i18n library (Astro
routes; a typed dictionary catches missing keys at compile time), any state
library, GSAP, Lenis, and Lighthouse CI (replaced by the bundle assertion in the
audit, plus a manual pass before release).

## Privacy

The site publishes no location and no phone number, including in structured
data. Tests assert both stay absent — structured data is easy to extend without
noticing, and a stale location outlives the page it was published on.
