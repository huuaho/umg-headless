# apps/umg/app/contact/page.tsx

**Purpose:** Static `/contact` page — contact details and a ContactPage entity for AI/search.

## Responsibilities
Renders a hero (`<h1>Contact United Media Group</h1>`), an intro paragraph, and a details list: email (`info@unitedmediadc.com` as `mailto:`), Instagram and X (both `rel="me noopener noreferrer"` for ownership signalling), and location (Washington, D.C.). Emits a `ContactPage` JSON-LD `<script>` whose `mainEntity` is a `NewsMediaOrganization` carrying the email and DC address. Exports page `metadata` (title + description).

## Key exports
- `default ContactPage() -> JSX` — the `/contact` route; renders ContactPage JSON-LD.
- `metadata` — title "Contact United Media Group" + description.

## Dependencies
- Internal: none (self-contained; chrome comes from [app/layout.tsx](../layout.tsx.md))
- External: none beyond React/Next

## Used by
App Router — route `/contact`. The Footer's "Contact Us" link points here because the layout passes `contactHref="/contact"` to [Footer](../../../../packages/ui/Footer.tsx.md). Listed in [sitemap.ts](../sitemap.ts.md).

## Notes
No contact form — the site is a static export with no backend; a form would need a new WP plugin endpoint. The branded email requires a real SiteGround mailbox/forwarder for `info@unitedmediadc.com` to receive mail. `CONTACT_EMAIL` is a single in-file constant feeding both the visible link and the schema.

---
*Documented at commit 60deaa3.*
