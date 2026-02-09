# CommentsSection Component

## Overview

The CommentsSection component (`packages/ui/article/CommentsSection.tsx`) renders an interactive comments section below article content. It fetches existing WordPress comments client-side and provides forms for submitting new comments and threaded replies. Used by Echo Media and International Spectrum article pages. UMG is unaffected (the `postId` prop is optional on ArticleLayout).

## Purpose

- Display existing WP comments fetched via REST API (`/wp/v2/comments`)
- Support threaded replies (2 levels max — top-level + 1 reply depth; deeper replies flatten)
- Allow visitors to post new comments with name, email, and comment text
- Handle moderation (show "pending moderation" message when WP holds a comment)
- Paginate both top-level threads and nested replies with "Show more" buttons

## Props

```typescript
interface CommentsSectionProps {
  postId: number; // WP post ID — used to fetch/post comments
}
```

## Layout

```
┌──────────────────────────────────────────────┐
│  ─────────────── border-t ───────────────    │
│                                              │
│  Comments (12)                               │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ Author Name · January 15, 2025, 3:30 PM│  │
│  │ Comment body text...                   │  │
│  │ [Reply]                                │  │
│  │                                        │  │
│  │   ┌─── ml-6/md:ml-10 indent ───────┐  │  │
│  │   │ Reply Author · Jan 16, 3:45 PM │  │  │
│  │   │ Reply text...                  │  │  │
│  │   └────────────────────────────────┘  │  │
│  │   [Show 2 more replies]               │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  [Show more comments (9 remaining)]          │
│                                              │
│  ── Leave a Comment ─────────────────────    │
│  ┌─────────────┐ ┌─────────────────────┐    │
│  │ Name        │ │ Email               │    │
│  └─────────────┘ └─────────────────────┘    │
│  ┌──────────────────────────────────────┐    │
│  │ Write your comment...               │    │
│  │                                      │    │
│  └──────────────────────────────────────┘    │
│  [Post Comment]                              │
│                                              │
└──────────────────────────────────────────────┘
```

## Features

### Client-Side Fetching

- `"use client"` component — fully client-side, compatible with `output: "export"` (static export)
- Fetches comments on mount via `useEffect` with cleanup (`cancelled` flag)
- Fetches up to 100 comments per post, ordered by date ascending

### Comment Tree Building

`buildCommentTree(comments)` converts the flat WP comment array into a threaded tree:

1. Creates a map of `id → { comment, replies: [] }`
2. For each comment:
   - `parent === 0` → push to roots (top-level)
   - `parent !== 0` and parent is top-level → push to parent's replies
   - `parent !== 0` and parent is a reply → flatten to grandparent's replies (2-level max)
   - Parent not found (deleted) → treat as top-level

### Pagination

Two-level pagination with "Show more" buttons:

| Level | Initial | Per Load | Constant |
|-------|---------|----------|----------|
| Top-level threads | 3 | 3 | `INITIAL_THREADS`, `THREADS_PER_PAGE` |
| Replies per thread | 1 | 2 | `INITIAL_REPLIES`, `REPLIES_PER_PAGE` |

- **Threads**: `visibleThreadCount` state, incremented by `THREADS_PER_PAGE`
- **Replies**: `replyLimits` (`Map<number, number>`) tracks per-thread visible reply count, incremented by `REPLIES_PER_PAGE`

### Date/Time Display

- Uses `date_gmt` field from WP (UTC) with `"Z"` suffix appended for correct UTC parsing
- `toLocaleString()` converts to the user's local timezone automatically
- Format: `"January 15, 2025, 3:30 PM"` (year, long month, day, hour, 2-digit minute)

### Form Validation

`validateForm(name, email, text)` checks:
- Name required
- Email required + basic format check (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- Comment text required

### Comment Submission

**Top-level comment**: POST via `postComment()`, adds to local list on success, clears text field. If `status === "hold"`, shows green moderation message instead.

**Reply**: Same flow but includes `parent: commentId`. Pre-fills name/email from the top-level form. Closes reply form automatically after 2 seconds on success.

### Reply Form

- "Reply" button only appears on top-level comments (depth 0)
- Opens an inline form below the comment with Name, Email, Comment fields + Cancel button
- Only one reply form can be open at a time

### States

| State | Display |
|-------|---------|
| Loading | 3 animated skeleton placeholders |
| Error | Red error message + "Try again" retry button |
| Empty | "No comments yet. Be the first to comment!" |
| Loaded | Threaded comments with pagination |

## Internal Subcomponents

### CommentForm

Reusable form for both top-level and reply submission:
- Name + Email inputs (side-by-side on `sm:` and up)
- Comment textarea (resizable)
- Submit button with loading spinner animation
- Error (red) and success (green) messages
- Optional "Cancel" button (shown for reply forms)

### CommentItem

Renders a single comment and its replies recursively:
- Author name (bold) + formatted date/time
- Comment body via `dangerouslySetInnerHTML` with `prose prose-sm`
- "Reply" button (top-level only)
- Inline reply form when active
- Recursive child rendering with `ml-6 md:ml-10` indent
- "Show N more replies" button when replies exceed visible limit

## API Layer

### Types (`packages/api/types.ts`)

```typescript
interface WpComment {
  id: number;
  post: number;
  parent: number;         // 0 = top-level
  author_name: string;
  date: string;
  date_gmt: string;       // UTC — used for display
  content: { rendered: string };
  status: "approved" | "hold" | string;
}

interface CreateCommentPayload {
  post: number;
  content: string;
  author_name: string;
  author_email: string;
  parent?: number;        // 0 or omitted for top-level
}
```

### WP Client (`packages/api/wp-client.ts`)

- `fetchCommentsWP(postId)` — `GET /wp/v2/comments?post={id}&per_page=100&orderby=date&order=asc`
- `postCommentWP(payload)` — `POST /wp/v2/comments` with JSON body, extracts WP error message on failure

### Delegating Client (`packages/api/client.ts`)

Mode-aware wrappers (same pattern as other API functions):

- `fetchComments(postId)` — WP mode: delegates to `fetchCommentsWP()`, custom mode: returns `[]`
- `postComment(payload)` — WP mode: delegates to `postCommentWP()`, custom mode: throws Error

## Styling

| Element | Classes |
|---------|---------|
| Section | `mt-12 pt-8 border-t border-gray-200` |
| Heading | `text-xl font-bold mb-6` |
| Comment | `py-4 border-b border-gray-100` |
| Reply indent | `ml-6 md:ml-10` |
| Author | `text-sm font-semibold text-black` |
| Date | `text-sm text-gray-500` |
| Body | `text-gray-700 text-sm mt-1 prose prose-sm max-w-none` |
| Reply button | `text-sm text-gray-500 hover:text-black transition-colors` |
| Show more | `text-sm font-medium text-gray-600 hover:text-black transition-colors` |
| Inputs | `w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400` |
| Submit button | `px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50` |
| Error text | `text-sm text-red-600` |
| Success text | `text-sm text-green-600` |

## Usage

Rendered automatically by `ArticleLayout` when `postId` is provided:

```tsx
// packages/ui/article/ArticleLayout.tsx
{postId != null && <CommentsSection postId={postId} />}
```

App routes pass the post ID:

```tsx
// apps/echo-media/app/articles/[slug]/page.tsx
// apps/international-spectrum/app/articles/[slug]/page.tsx
<ArticleLayout
  ...
  postId={article.id}
/>
```

## WordPress Requirements

For comments to work, the WordPress site needs:

1. **Discussion Settings** (Settings → Discussion):
   - Uncheck "Users must be registered and logged in to comment"
   - Uncheck "Comment must be manually approved"
   - Uncheck "Comment author must have a previously approved comment"

2. **REST API anonymous comments** — add to theme's `functions.php`:
   ```php
   add_filter('rest_allow_anonymous_comments', '__return_true');
   ```

3. **CORS**: `GET /wp/v2/comments` works by default. `POST` with `Content-Type: application/json` triggers a CORS preflight — WP must allow the origin. If issues arise, fall back to `application/x-www-form-urlencoded`.

## Files

| File | Purpose |
|------|---------|
| `packages/ui/article/CommentsSection.tsx` | This component |
| `packages/api/types.ts` | `WpComment`, `CreateCommentPayload` types |
| `packages/api/wp-client.ts` | `fetchCommentsWP()`, `postCommentWP()` |
| `packages/api/client.ts` | `fetchComments()`, `postComment()` delegating wrappers |
| `packages/ui/article/ArticleLayout.tsx` | Renders CommentsSection when `postId` is set |
| `apps/echo-media/app/articles/[slug]/page.tsx` | Passes `postId={article.id}` |
| `apps/international-spectrum/app/articles/[slug]/page.tsx` | Same |
