# components/

Reusable UI with **no knowledge of the portfolio domain**. A `Button` here must not
know that a portfolio exists.

- `ui/` — design-system primitives (Button, Tag, Card, Icon).
- `layout/` — structural primitives with no visual opinion (Section, Container, Stack).
- `seo/` — head/metadata components (BaseHead, JsonLd, Hreflang).

Anything specific to one section belongs in `features/` instead.
