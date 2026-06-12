# apps/international-spectrum/tsconfig.json

**Purpose:** TypeScript config for the International Spectrum app — standard Next.js App Router settings plus the `@/*` path alias.

## Responsibilities
Standard `create-next-app`-style config: `strict` mode, `noEmit` (Next.js compiles), `moduleResolution: "bundler"`, `jsx: "react-jsx"`, ES2017 target, the Next.js TS plugin, and a `@/*` → `./*` path alias (used by `app/layout.tsx` and `app/page.tsx` for `@/lib/...` imports). Includes `next-env.d.ts`, all TS/TSX, and Next-generated type files; excludes `node_modules`.

## Key exports
- n/a (config). Notable: `paths: { "@/*": ["./*"] }`.

## Dependencies
- Internal: none (does not extend `@umg/config`'s base tsconfig — it is standalone).
- External: `typescript`, Next.js TS plugin.

## Used by
`tsc`, the Next.js build, ESLint (`eslint-config-next/typescript`), and editors.

## Notes
- Workspace package sources type-check through `transpilePackages` + this config; there are no project references.
- **Difference vs echo-media:** none; the files are byte-identical.

---
*Documented at commit 1cbdce5.*
