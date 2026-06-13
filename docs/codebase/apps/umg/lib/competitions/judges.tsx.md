# apps/umg/lib/competitions/judges.tsx

**Purpose:** The competition jury — 15 judges with names, titles, bios, and portrait paths.

## Responsibilities
Defines the `Judge` type (`id`, `name`, `title`, `bio: ReactNode`, `image`) and the ordered `judges` array. Bios are mostly plain strings, but a few are JSX fragments (Denis Antoine, Amy Austin, Derrick Rutledge) to allow `<em>` for book/publication titles — hence the `.tsx` extension. `id` values are kebab-case slugs used as DOM anchors (`/judges-panel#<id>`); `image` paths point at `public/images/judges/*.png`.

## Key exports
- `Judge` (type), `judges: Judge[]` — 15 entries (ambassadors, museum and university leaders, photographers, PR figures, etc.).

## Dependencies
- Internal: none (asset paths into `public/images/judges/`)
- External: React (`ReactNode` type)

## Used by
[app/judges-panel/page.tsx](../../app/judges-panel/page.tsx.md) (full bio cards) and [app/how-to-enter/page.tsx](../../app/how-to-enter/page.tsx.md) (thumbnail grid with anchor links).

## Notes
Adding a judge requires an entry here plus a portrait in `public/images/judges/` (filenames follow `lastname-firstname.png`). Because `bio` is ReactNode, this module must stay `.tsx` and is not serializable config.

---
*Documented at commit 1cbdce5.*
