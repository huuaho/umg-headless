# Banner Assets (Localized)

## Overview

Marquee banner logos were moved from remote WordPress uploads to local assets in each app's `public/images/banner/` directory. This eliminates cross-origin image loading failures and removes the dependency on the WordPress media library for banner display.

## Asset Structure

Each app contains a full copy of all banner images:

```
apps/{echo-media,international-spectrum}/public/images/banner/
├── umg-masthead.png          # UMG color logo (PNG)
├── umg-masthead-black.png    # UMG B&W logo (PNG)
├── em-logo.svg               # Echo Media color logo
├── em-logo-black.png         # Echo Media B&W logo (PNG)
├── is-logo.svg               # International Spectrum color logo
├── is-logo-black.svg         # International Spectrum B&W logo
├── dw-logo.png               # Diplomatic Watch color logo (PNG)
└── dw-logo-black.svg         # Diplomatic Watch B&W logo
```

The UMG app uses its own logos directly from `apps/umg/public/`:
- `umg-logo.png` (color, referenced in `layout.tsx`)
- `umg-logo-black.png` (B&W, referenced in `layout.tsx`)

Banner directory exists in:
- `apps/echo-media/public/images/banner/`
- `apps/international-spectrum/public/images/banner/`

## How It Works

Each app's `lib/mediaCompanies.ts` references logos via local paths:

```typescript
export const mediaCompanies: BannerCompany[] = [
  {
    name: "United Media Group",
    url: "https://www.unitedmediadc.com",
    logo: "/images/banner/umg-masthead.png",        // Color (marquee)
    logoBW: "/images/banner/umg-masthead-black.png", // B&W (footer)
  },
  // ... other companies
];
```

The Header marquee uses `logo` (color version), and the Footer uses `logoBW` (B&W version).

## Previous Approach

Before this change, logos were loaded from the WordPress uploads directory (`api.unitedmediadc.com/wp-content/uploads/...`). This required:
- `next.config.ts` to whitelist the remote image domain
- The WordPress server to be available for banner images to load

The local approach removes both dependencies. The `remotePatterns` config for the banner domain was removed from `next.config.ts` for Echo Media and International Spectrum.

## File Formats

| Logo | Format | Notes |
|------|--------|-------|
| UMG Masthead | PNG | Horizontal wordmark |
| Echo Media | SVG (color), PNG (B&W) | B&W is PNG due to original format |
| International Spectrum | SVG | Both color and B&W |
| Diplomatic Watch | PNG (color), SVG (B&W) | Color updated to PNG |

## Updating Logos

To update a banner logo:
1. Replace the file in all three app directories
2. Keep the same filename to avoid breaking references
3. Ensure both color and B&W variants are updated if the brand changes
