# Flexweb - Real Estate Website Template

A Next.js template for generating real estate websites. Each generated site connects to a shared database and serves a specific account's data.

## Tasks

- [Property Subtype]
- [SEO Optimization]
- Define what happens when they ask for a property

## Quick Start

```bash
pnpm dev          # Start dev server
pnpm lint         # Run ESLint
pnpm typecheck    # TypeScript checking
pnpm build        # Production build
```

## Site Generation

Generate a deployable website for a specific account:

```bash
# Generate and deploy (full pipeline)
pnpm run generate-site -- --accountId <id>

# Generate without deploying
pnpm run generate-site -- --accountId <id> --skip-deploy

# Dry run (preview what would happen)
pnpm run generate-site -- --accountId <id> --dry-run

# Skip GitHub integration
pnpm run generate-site -- --accountId <id> --skip-github
```

**Important:** Always use `--` before flags so pnpm passes them to the script.

### What the generator does

1. Extracts account data from the database
2. Copies the template and configures it for the account
3. Transforms static queries (hero, about, footer, SEO) to hardcoded data
4. Regenerates `pnpm-lock.yaml` (package.json is modified)
5. Pre-configures Vercel (links project, sets env vars)
6. Pushes to GitHub (force pushes on re-generation)
7. Deploys to Vercel

### Required environment variables

The following must be set in your `.env` file before running the generator:

```bash
# Database (required)
POSTGRES_URL="postgresql://..."
DATABASE_URL="mysql://..."
SINGLESTORE_USER, SINGLESTORE_PASS, SINGLESTORE_DB, SINGLESTORE_HOST, SINGLESTORE_PORT

# Account (required)
NEXT_PUBLIC_ACCOUNT_ID="<default-account-id>"

# Google Maps (required by env validation)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="<your-api-key>"

# Vercel deployment (required for deploy step)
VERCEL_TEAM_SLUG="<your-vercel-team-slug>"
VERCEL_ORG_ID="<your-vercel-org-id>"

# AWS (optional, for S3 image uploads)
AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET
```

See `.env.example` for the full template.

### Generated site output

Sites are generated to `~/generated-sites/<name>/`. Each site:
- Has `unoptimized: true` for images (serves directly from S3)
- Gets its own GitHub repo and Vercel project
- Has `SKIP_ENV_VALIDATION=true` set on Vercel
- Has all required env vars set via the Vercel API
- Auto-deploys on git push via Vercel Git integration

### Troubleshooting generation

| Error | Cause | Fix |
|-------|-------|-----|
| `ERR_PNPM_OUTDATED_LOCKFILE` | Lockfile doesn't match modified package.json | Fixed automatically (lockfile regenerated during build) |
| `Invalid environment variables` | Env vars not set on Vercel before build | Fixed automatically (preconfigure step runs before GitHub push) |
| `INVALID_IMAGE_OPTIMIZE_REQUEST` | Next.js image optimization fails on S3 URLs | Fixed automatically (`unoptimized: true` set during build) |
| `git push rejected` | Re-generating over existing repo | Fixed automatically (falls back to force push) |
| `missing_scope` | Vercel CLI needs team scope | Set `VERCEL_TEAM_SLUG` in `.env` |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── propiedades/       # Property pages
│   ├── contacto/          # Contact page
│   └── vender/            # Selling workflow
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   ├── property/         # Property-related components
│   └── layout/           # Layout components
├── server/               # Server-side logic
│   ├── db/              # Drizzle ORM schema
│   ├── queries/         # Database queries
│   └── portals/         # External integrations
└── lib/                 # Utilities & helpers

scripts/
└── generate-site/        # Site generation pipeline
    ├── index.ts          # CLI entry point
    ├── data-extractor.ts # Extracts account data from DB
    ├── project-builder.ts# Copies template, configures project
    ├── code-transformer.ts# Transforms queries to static data
    ├── github.ts         # GitHub repo creation & push
    ├── deployer.ts       # Vercel deployment & env vars
    └── utils.ts          # Shared utilities
```

## Tech Stack

- **Next.js 15** with App Router (React 19)
- **TypeScript** (strict mode)
- **Tailwind CSS** + shadcn/ui
- **Drizzle ORM** with MySQL/SingleStore + Supabase PostgreSQL
- **Vercel** for hosting
