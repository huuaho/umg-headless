# apps/international-spectrum/app/about-us — overview

Static About Us route (`/about-us`) — hard-coded International Spectrum culture/lifestyle positioning copy with a contact call-to-action. No data fetching.

## Contents
| Item | Type | Summary |
|------|------|---------|
| [page.tsx](page.tsx.md) | file | Static page: four bold paragraphs on global culture & lifestyle journalism, plus Contact Us band (`mailto:info@unitedmediadc.com`). |

## Connections
```mermaid
graph LR
  aboutPage["about-us/page.tsx"] -->|"none (pure JSX)"| nothing[(no imports)]
```

## Entry points
- Route: `/about-us/` (statically exported; linked from the shared Footer).

---
*Documented at commit 1cbdce5.*
