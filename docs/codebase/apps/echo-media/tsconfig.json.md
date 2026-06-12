# apps/echo-media/tsconfig.json

**Purpose:** TypeScript config for the Echo Media app — standard Next.js App Router settings plus the `@/*` path alias.

## Responsibilities
Standard `create-next-app`-style config: `strict` mode, `noEmit` (Next.js compiles), `moduleResolution: "bundler"`, `jsx: "react-jsx"`, ES2017 target, the Next.js TS plugin, and a `@/*` → `./*` path alias (so `@/lib/categories` resolves from the app root). Includes `next-env.d.ts`, all TS/TSX, and Next-generated type files; excludes `node_modules`.

## Key exports
- n/a (config). Notable: `paths: { "@/*": ["./*"] }`.

## Dependencies
- Internal: none (does not extend `@umg/config`'s base tsconfig — it is standalone).
- External: `typescript`, Next.js TS plugin.

## Used by
`tsc`, the Next.js build, ESLint (`eslint-config-next/typescript`), and editors.

## Notes
- Workspace package sources type-check through `transpilePackages` + this config's `allowJs`/include behavior; there are no project references.
- **Difference vs international-spectrum:** none; the files are byte-identical.

---
*Documented at commit 1cbdce5.*
