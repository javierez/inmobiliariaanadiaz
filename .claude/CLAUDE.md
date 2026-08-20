# CLAUDE.md - Vesta Real Estate Management Platform

This file provides guidance to Claude Code (claude.ai/code) when working with the Vesta real estate management codebase.

## Project Overview

Vesta is a comprehensive real estate management platform built with Next.js, featuring property listings, contact management, calendar scheduling, and multi-portal integration capabilities. The platform serves real estate professionals in managing their properties, clients, and operations efficiently.

## Core Principles

### KISS (Keep It Simple, Stupid)
- Choose straightforward solutions over complex ones
- Avoid over-engineering features
- Simple code is easier to understand, maintain, and debug

### YAGNI (You Aren't Gonna Need It)
- Only implement features when they are actually needed
- Avoid building functionality on speculation
- Focus on current requirements, not hypothetical future needs

### DRY (Don't Repeat Yourself)
- Extract common logic into reusable functions/components
- Use existing utilities and patterns before creating new ones
- Centralize configuration and constants

## Architecture & Tech Stack

### Framework & Libraries
- **Next.js 15.2.3** with App Router (React 19)
- **TypeScript** with strict mode enabled
- **Tailwind CSS** with shadcn/ui components
- **Drizzle ORM** with MySQL/SingleStore
- **React Hook Form** for complex forms
- **Zod** for schema validation

### Project Structure
```
src/
├── app/                    # Next.js app router pages
│   ├── propiedades/       # Property management
│   ├── contactos/         # Contact management
│   ├── calendario/        # Calendar & scheduling
│   └── vender/           # Selling workflow
├── components/            # Reusable components
│   ├── ui/               # Base UI (shadcn)
│   ├── propiedades/      # Property components
│   ├── contactos/        # Contact components
│   └── layout/           # Layout components
├── server/               # Server-side logic
│   ├── db/              # Database schema
│   ├── queries/         # Database queries
│   ├── portals/         # External integrations
│   └── openai/          # AI services
└── lib/                 # Utilities & helpers
```

## Development Standards

### Code Organization
- **File size limit**: Maximum 400 lines per file
- **Component structure**: One component per file, named exports
- **Module organization**: Group by feature, not by file type
- **Import paths**: Always use `~/` alias for src/ imports

### TypeScript Requirements
```typescript
// ✅ Good - Explicit types, proper validation
interface PropertyFormData {
  title: string;
  price: number;
  location: {
    lat: number;
    lng: number;
  };
}

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  price: z.number().positive("Price must be positive"),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
});

// ❌ Bad - Using 'any', no validation
const handleSubmit = (data: any) => {
  // Process data without validation
};
```

### Component Patterns

#### Server Components (Default)
```typescript
// src/app/propiedades/page.tsx
export default async function PropertiesPage() {
  const properties = await getProperties(); // Server-side data fetching
  
  return (
    <div className="container mx-auto">
      <PropertyList properties={properties} />
    </div>
  );
}
```

#### Client Components (Interactive)
```typescript
// src/components/propiedades/PropertyFilter.tsx
"use client";

import { useState } from "react";

export function PropertyFilter({ onFilter }: Props) {
  const [filters, setFilters] = useState({});
  // Interactive filtering logic
}
```

### Database Operations
```typescript
// Always use typed queries with Drizzle
import { db } from "~/server/db";
import { properties } from "~/server/db/schema";

export async function getProperties() {
  return await db
    .select()
    .from(properties)
    .where(eq(properties.active, true))
    .orderBy(desc(properties.createdAt));
}
```

## Task Management

### Using TodoWrite Tool
- Create todos for any task requiring 3+ steps
- Mark todos as `in_progress` BEFORE starting work
- Mark todos as `completed` IMMEDIATELY after finishing
- Only have ONE todo `in_progress` at a time
- Add discovered tasks to the todo list as you find them

### Task Completion Checklist
Before marking any task as complete:
- [ ] Code follows TypeScript best practices
- [ ] All forms have Zod validation
- [ ] Loading and error states are handled
- [ ] Component is under 400 lines
- [ ] Tests are updated (if applicable)
- [ ] Run `pnpm lint` and `pnpm typecheck`

## Real Estate Domain Specifics

### Property Management
- Always include proper image handling with watermarking
- Validate energy certificates and cadastral references
- Support multi-portal publishing (Fotocasa, Idealista, etc.)
- Handle BigInt conversions for property IDs

### Contact Workflow
```
Prospect → Lead → Client
├── Initial interest captured
├── Property preferences recorded
├── Appointments scheduled
└── Deal closed
```

### Spanish Terminology
Use proper Spanish terms in user-facing text:
- "Propiedades" not "Properties" 
- "Contactos" not "Contacts"
- "Operaciones" not "Operations"
- "Inmuebles" for real estate assets

## Common Patterns

### Form Implementation
```typescript
// Always use React Hook Form + Zod
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const form = useForm<PropertyFormData>({
  resolver: zodResolver(propertySchema),
  defaultValues: {
    title: "",
    price: 0,
  },
});
```

### Error Handling
```typescript
// Standardized error responses
try {
  const result = await createProperty(data);
  return { success: true, data: result };
} catch (error) {
  console.error("Property creation failed:", error);
  return { 
    success: false, 
    error: error instanceof Error ? error.message : "Unknown error" 
  };
}
```

### Loading States
```typescript
// Always show loading feedback
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
```

## Security Guidelines

### Environment Variables
- Validate all env vars through `src/env.js`
- Never expose secrets in client components
- Use proper prefixes: `NEXT_PUBLIC_` for client-side vars

### Input Validation
- Always validate user inputs with Zod
- Sanitize data before database operations
- Use parameterized queries (Drizzle handles this)

### Authentication & Authorization
- Check user permissions before sensitive operations
- Validate portal API credentials before use
- Log security-relevant events

## Performance Optimization

### Image Handling
```typescript
import Image from "next/image";

// Always use Next.js Image with proper dimensions
<Image
  src={property.mainImage}
  alt={property.title}
  width={800}
  height={600}
  className="object-cover"
  priority={isAboveFold}
/>
```

### Data Fetching
- Use React Server Components for initial data
- Implement pagination for large datasets
- Use `unstable_cache` for expensive operations
- Parallel fetch when possible

## External Integrations

### Portal APIs (Fotocasa, Idealista)
- Always validate API responses with Zod schemas
- Handle rate limiting gracefully
- Store API credentials securely
- Log all API interactions for debugging

### AI Services (OpenAI)
- Limit token usage with max_tokens parameter
- Cache generated descriptions
- Provide clear, specific prompts
- Handle API errors gracefully

## Development Workflow

### Environment Setup
- **Virtual environment is already configured** - All necessary dependencies are installed
- **No need to run `pnpm install`** unless adding new packages
- **Database is already set up** - Use `pnpm db:studio` to inspect

### Commands
```bash
# Development
pnpm dev          # Start dev server

# Code Quality
pnpm lint         # Run ESLint
pnpm typecheck    # TypeScript checking
pnpm format:write # Format with Prettier

# Database
pnpm db:generate  # Generate migrations
pnpm db:push      # Apply migrations
pnpm db:studio    # Open Drizzle Studio

# Building
pnpm build        # Production build
```

### Git Workflow
1. Check existing TODOs in README.md
2. Create feature branch: `git checkout -b feature/description`
3. Make changes following these guidelines
4. Run `pnpm lint && pnpm typecheck` before committing
5. Write clear commit messages: `feat: add property image gallery`

### Documentation Requirements
- **Always update README.md** when:
  - Adding new features or modules
  - Changing the project structure
  - Adding new dependencies
  - Modifying setup instructions
- **Include project structure** in README.md and keep it updated
- **Document new environment variables** in both README.md and `.env.example`

## Common Pitfalls to Avoid

### Don't
- ❌ Create files over 400 lines
- ❌ Use `any` type without good reason
- ❌ Skip form validation
- ❌ Ignore loading/error states
- ❌ Hardcode Spanish text (use constants)
- ❌ Expose API keys in client code
- ❌ Create new patterns when existing ones work

### Do
- ✅ Use existing UI components from shadcn
- ✅ Follow established patterns in the codebase
- ✅ Write self-documenting code with clear names
- ✅ Handle edge cases (empty states, errors)
- ✅ Test with Spanish characters (ñ, á, é, etc.)
- ✅ Consider mobile responsiveness
- ✅ Use TypeScript strictly

## Quick Reference

### Adding a New Feature
1. Read README.md for context and TODOs
2. Use TodoWrite to plan implementation steps
3. Check existing patterns in similar features
4. Implement following the architecture above
5. Add proper TypeScript types and Zod schemas
6. Handle loading and error states
7. Run linting and type checking
8. Update documentation if needed

### Debugging Checklist
- [ ] Check browser console for errors
- [ ] Verify environment variables are set
- [ ] Check network tab for API failures  
- [ ] Look for TypeScript errors
- [ ] Verify database connection
- [ ] Check for Spanish character encoding issues

Remember: This is a production real estate platform. Prioritize reliability, user experience, and data integrity in all implementations.


## Second Brain (Knowledge Base)

There's a persistent cross-project knowledge base at `~/Desktop/second-brain/` — a Karpathy-style LLM wiki covering the entire Vesta ecosystem (vesta, vesta-studio, vestaingestion, vestawebpage). **131+ pages** as of 2026-04-11.

**When to consult it:**
- You're asked about a feature you don't recognize — check if it exists already
- You're about to build something — check if there's an existing architectural decision
- Cross-project questions (e.g. "how does Studio share data with CRM")
- "What's the pattern for X" questions — the wiki has synthesis pages
- Before proposing new architecture — consult `overview/architecture.md` and `overview/roadmap.md`
- Before claiming something is broken — check `overview/known-stubs-and-bugs.md`, it may already be cataloged

**Where to start:**
1. `~/Desktop/second-brain/wiki/overview/onboarding-reading-guide.md` — the reading order (~3 hours for the essentials, then role-based deep dives)
2. `~/Desktop/second-brain/index.md` — full catalog organized by subfolder

**Wiki structure (5 folders):**
- `wiki/overview/` — **Maps of Content / syntheses.** Ecosystem, strategy, roadmap, cross-cutting synthesis pages, audits (known-stubs-and-bugs, architectural-insights, money-flows, lead-to-deal-flow, message-delivery-map, delivery-gates-synthesis). Excluded from Obsidian graph view to keep it focused on concept relationships.
- `wiki/projects/` — one page per codebase
- `wiki/integrations/` — external services (fotocasa, stripe, google, docusign, whatsapp, twilio-voice, portal-integration-pattern, etc.)
- `wiki/architecture/` — technical concepts (database-schema, api-routes, server-actions, ai-agent-system, security-architecture, cron-jobs, middleware-route-protection, observability, etc.)
- `wiki/features/` — user-facing workflows (property-creation, inbox-system, operations-deals, rental-system, matching-system, bot-system, admin-panel, lease-lifecycle, etc.)

**How to search:**
- Grep on `~/Desktop/second-brain/wiki/` for keywords
- Follow `[[wikilinks]]` between pages (resolve by filename regardless of folder)
- The `overview/onboarding-reading-guide.md` has a "if you need to do X, read Y" task→page mapping

**Do not write to it directly during normal work.** The wiki is maintained by a scheduled enrichment cron agent and the `/ship` command (which auto-logs commit summaries to `log.md`). If you discover something surprising worth saving, tell the user and they'll decide whether to ingest it.

**Immutable source docs** live in `~/Desktop/second-brain/raw/projects/<project>/` — never modify these. They are the source of truth that wiki pages synthesize from.
