# features/

One folder per portfolio section. A feature owns its UI, its local logic, its
types and its tests.

**Hard rule: a feature never imports from another feature.** If two features need
the same thing, it moves up — to `components/` if it is UI, to `lib/` if it is
logic. This rule is enforced by ESLint (`no-restricted-imports`), so breaking it
fails CI rather than merely violating a convention.

Anatomy:

```
features/<name>/
├── <Name>.astro          # section entry point
├── components/           # parts used only by this feature
├── lib/                  # local pure logic (this is what gets unit tested)
├── types.ts
└── __tests__/
```
