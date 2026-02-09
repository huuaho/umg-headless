# NotFoundPage Component

## Overview

The NotFoundPage component (`packages/ui/NotFoundPage.tsx`) renders a 404 error page for unknown routes. Used by all three apps (UMG, Echo Media, International Spectrum) via their `app/not-found.tsx` files.

## Purpose

Provides a consistent 404 page across all apps with a centered layout, clear messaging, and a link back to the home page. Rendered inside the app's root layout (Header + Footer wrap it automatically).

## Props

None.

## Layout

```
┌──────────────────────────────────────────────┐
│  [Header]                                    │
│                                              │
│                                              │
│                  404                         │
│            Page Not Found                    │
│                                              │
│  The page you're looking for doesn't exist   │
│  or has been moved.                          │
│                                              │
│            [Back to Home]                    │
│                                              │
│                                              │
│  [Footer]                                    │
└──────────────────────────────────────────────┘
```

## Styling

| Element | Classes |
|---------|---------|
| Container | `min-h-[60vh] flex items-center justify-center px-6` |
| 404 heading | `text-6xl font-bold text-gray-900 mb-4` |
| Subtitle | `text-xl font-semibold text-gray-700 mb-2` |
| Description | `text-gray-500 mb-8 max-w-md` |
| Button | `px-6 py-3 text-sm font-medium text-white bg-gray-800 rounded hover:bg-gray-700 transition-colors` |

## Usage

Each app's `not-found.tsx` is a one-line re-export:

```tsx
// apps/*/app/not-found.tsx
export { NotFoundPage as default } from "@umg/ui";
```

Next.js requires `not-found.tsx` to exist in the `app/` directory, but the actual component lives in `@umg/ui`.

## Static Export Behavior

With `output: "export"`, unknown routes don't have generated HTML files — the hosting provider serves its own 404 or the `404.html` that Next.js generates from `not-found.tsx`.

In dev mode, `output: "export"` is conditionally disabled (`process.env.NODE_ENV === "production" ? "export" : undefined`) so that `notFound()` calls render the 404 page instead of throwing a 500 error. Article pages also export `dynamicParams = false` to trigger 404 for unknown slugs in dev.

## Files

| File | Purpose |
|------|---------|
| `packages/ui/NotFoundPage.tsx` | This component |
| `packages/ui/index.ts` | Barrel export (`NotFoundPage`) |
| `apps/umg/app/not-found.tsx` | UMG re-export |
| `apps/echo-media/app/not-found.tsx` | EM re-export |
| `apps/international-spectrum/app/not-found.tsx` | IS re-export |
