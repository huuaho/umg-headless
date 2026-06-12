# packages/ui/ResultsSkeleton.tsx

**Purpose:** Loading placeholder for search/category result lists — five pulsing gray card skeletons mirroring the [ResultCard](ResultCard.tsx.md) layout.

## Responsibilities
Renders 5 static skeleton rows (thumbnail block + text bars) with `animate-pulse`.

## Key exports
- `ResultsSkeleton()` (default) — no props.

## Dependencies
- Internal: none
- External: none (pure JSX/Tailwind)

## Used by
- [CategoryContent.tsx](CategoryContent.tsx.md), [SearchContent.tsx](SearchContent.tsx.md) (both as loading state and Suspense fallback).

## Notes
- Server-compatible (no `"use client"`); purely presentational.

---
*Documented at commit 1cbdce5.*
