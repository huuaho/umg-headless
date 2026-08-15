# apps/umg/app/admin/entry/page.tsx

**Purpose:** Route shell for `/admin/entry?id=<n>` — a `Suspense` wrapper around the client-side [EntryScoring](EntryScoring.tsx.md) component.

## Responsibilities
Renders `<Suspense fallback="Loading entry...">` around `EntryScoring`. The boundary is required because `EntryScoring` calls `useSearchParams()` and the app is a static export (`next build` fails otherwise); the fallback is what gets prerendered into the static shell.

## Key exports
- `default AdminEntryPage() -> JSX` — the `/admin/entry` route.

## Dependencies
- Internal: [EntryScoring](EntryScoring.tsx.md)
- External: React (`Suspense`)

## Used by
App Router — linked from the cards on [../page.tsx](../page.tsx.md) and the entry links on [../results/page.tsx](../results/page.tsx.md).

## Notes
Server component. The in-file comment flags the `?id=` query-param addressing as a static-export workaround — switch to `/admin/entry/[id]` once the frontend has a server runtime; only this wrapper and `EntryScoring`'s `useSearchParams` read the id, so the move is cheap. Same pattern as [school-registration/application/page.tsx](../../school-registration/application/page.tsx.md).

---
*Documented at commit bde729d.*
