# packages/ui/article/CommentsSection.tsx

**Purpose:** Interactive WordPress comments UI for article pages — fetches, threads, paginates, and submits comments/replies.

## Responsibilities
- Fetches comments via `fetchComments(postId)` on mount (with cancellation guard) and shows skeletons / error-with-retry states.
- `buildCommentTree()` threads comments to max 2 levels: top-level + one reply depth; deeper replies are flattened to their grandparent, and orphans (deleted parents) become top-level.
- Progressive disclosure: 3 threads initially (+3 per "Show more comments"), 1 reply per thread initially (+2 per "Show more replies").
- Top-level form and inline reply form (reply pre-fills name/email from the main form) share the internal `CommentForm` subcomponent; validation requires name, valid email, and text.
- Submits via `postComment()`: a returned `status === "hold"` shows a "pending moderation" notice without adding to the list; otherwise the comment appears immediately. Reply form auto-closes 2 s after success.

## Key exports
- `CommentsSection({ postId })` (default) — `postId` is the WP post ID.

## Dependencies
- Internal: `@umg/api` ([client](../../api/client.ts.md) `fetchComments`/`postComment` → `GET`/`POST /wp/v2/comments` in wp mode, [types](../../api/types.ts.md) `WpComment`)
- External: `react`

## Used by
- [ArticleLayout.tsx](ArticleLayout.tsx.md) only (EM/IS article pages; UMG never passes `postId`). Not exported from the package barrel.

## Notes
- `"use client"`; comment bodies render via `dangerouslySetInnerHTML` of WP's `content.rendered` (WP sanitizes on its side).
- wp mode only — in custom mode `fetchComments` returns `[]` and `postComment` throws (see [client.ts](../../api/client.ts.md)); the component is simply never mounted on UMG.
- WP must allow anonymous comment creation on the REST API.
- Comment dates are GMT; `formatDate` appends `"Z"` before localizing.

---
*Documented at commit 1cbdce5.*
