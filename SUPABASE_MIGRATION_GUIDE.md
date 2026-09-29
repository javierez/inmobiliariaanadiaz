# Vesta Database Migration Guide: SingleStore → Supabase (PostgreSQL)

This guide provides a **step-by-step migration** from SingleStore to Supabase PostgreSQL while preserving your existing Drizzle ORM setup and query patterns.

---

## Table of Contents

1. [Migration Overview](#migration-overview)
2. [Prerequisites](#prerequisites)
3. [Phase 1: Supabase Setup](#phase-1-supabase-setup)
4. [Phase 2: Schema Migration](#phase-2-schema-migration)
5. [Phase 3: Connection Setup](#phase-3-connection-setup)
6. [Phase 4: Environment Configuration](#phase-4-environment-configuration)
7. [Phase 5: Drizzle Configuration](#phase-5-drizzle-configuration)
8. [Phase 6: Query Compatibility](#phase-6-query-compatibility)
9. [Phase 7: Data Migration](#phase-7-data-migration)
10. [Phase 8: Testing & Validation](#phase-8-testing--validation)
11. [Troubleshooting](#troubleshooting)

---

## Migration Overview

### What We'll Change
- ✅ Database dialect: `singlestore` → `postgres`
- ✅ Schema file: Update type imports and table definitions
- ✅ Connection: MySQL2 → PostgreSQL driver
- ✅ Environment variables: SingleStore credentials → Supabase connection string

### What Stays the Same
- ✅ Drizzle ORM as the query builder
- ✅ All query patterns in `src/server/queries/`
- ✅ Application logic and components
- ✅ Multi-tenant architecture

### Estimated Time
- **Schema Migration**: 1-2 hours
- **Connection Setup**: 30 minutes
- **Testing**: 1-2 hours
- **Data Migration**: Varies (depends on data volume)

---

## Prerequisites

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for database provisioning (~2 minutes)
4. Navigate to **Settings → Database** and copy:
   - **Connection String (URI)** - for Drizzle
   - **Connection Pooling String** - for production (optional)

### 2. Install Required Packages

```bash
# Remove SingleStore/MySQL dependencies
pnpm remove drizzle-orm mysql2

# Add PostgreSQL dependencies
pnpm add drizzle-orm postgres
pnpm add -D @types/pg drizzle-kit
```

### 3. Backup Current Database
Export your SingleStore data before proceeding:

```bash
# Export schema and data (adjust credentials)
mysqldump -h $SINGLESTORE_HOST -u $SINGLESTORE_USER -p$SINGLESTORE_PASS $SINGLESTORE_DB > backup.sql
```

---

## Phase 1: Supabase Setup

### Step 1.1: Configure Supabase Project

1. **Enable Connection Pooling** (recommended for production):
   - Go to **Settings → Database → Connection Pooling**
   - Enable **Transaction Mode** for Drizzle compatibility

2. **Note Your Connection Strings**:
   ```
   Direct Connection:
   postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres

   Connection Pooling (Transaction mode):
   postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

3. **Set up SSL** (Supabase requires SSL by default):
   - Connection strings include `sslmode=require` automatically

---

## Phase 2: Schema Migration

### Step 2.1: Update Schema File

Replace `src/server/db/vestaschema.ts` with the existing `src/server/db/schema.ts` (which is already PostgreSQL-compatible).

**Action**: Review the existing `schema.ts` file - it already uses PostgreSQL types!

```typescript
// ✅ Your existing schema.ts already has:
import {
  bigint,
  varchar,
  timestamp,
  boolean,
  pgTable,      // ← Already using pgTable!
  jsonb,        // ← Already using jsonb!
  text,
  decimal,
  smallint,
  integer,
  time,
  bigserial,    // ← Already using bigserial!
} from "drizzle-orm/pg-core";
```

### Step 2.2: Compare and Merge Schemas

Your existing `schema.ts` is **already PostgreSQL-compatible**. You need to ensure it matches the structure from `vestaschema.ts` (SingleStore version).

**Key Differences to Verify**:

| Feature | SingleStore (`vestaschema.ts`) | PostgreSQL (`schema.ts`) |
|---------|-------------------------------|-------------------------|
| Table function | `singlestoreTable()` | `pgTable()` ✅ |
| Auto-increment | `bigint().autoincrement()` | `bigserial()` ✅ |
| JSON type | `json()` | `jsonb()` ✅ (better) |
| Integer type | `int()` | `integer()` ✅ |
| Update timestamp | `.onUpdateNow()` | ⚠️ Requires trigger |

### Step 2.3: Handle `onUpdateNow()` Pattern

PostgreSQL doesn't support `.onUpdateNow()` natively. You have two options:

#### Option A: Remove `.onUpdateNow()` (Recommended)
Update timestamps manually in your code:

```typescript
// Before (SingleStore)
updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),

// After (PostgreSQL)
updatedAt: timestamp("updated_at").defaultNow().notNull(),
```

Then update queries to set `updatedAt` explicitly:

```typescript
// In your update queries
await db.update(properties).set({
  title: "New Title",
  updatedAt: new Date(), // ← Add this
});
```

#### Option B: Create PostgreSQL Triggers (Advanced)
Create a trigger function to auto-update timestamps:

```sql
-- Run this in Supabase SQL Editor
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to each table
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Repeat for all tables with updated_at columns
```

**Recommendation**: Use **Option A** for simplicity. The codebase already handles `updatedAt` manually in most places.

### Step 2.4: Verify Schema Compatibility

Run a quick check on your existing `schema.ts`:

```bash
# This should show no errors if schema is valid
pnpm typecheck
```

---

## Phase 3: Connection Setup

### Step 3.1: Update Database Connection

Replace `src/server/db/index.ts`:

```typescript
// BEFORE (SingleStore)
import { drizzle } from "drizzle-orm/singlestore";
import { createPool, type Pool } from "mysql2/promise";
import { env } from "~/env";
import * as vestaschema from "./vestaschema";

const conn = createPool({
  host: env.SINGLESTORE_HOST,
  port: parseInt(env.SINGLESTORE_PORT),
  user: env.SINGLESTORE_USER,
  password: env.SINGLESTORE_PASS,
  database: env.SINGLESTORE_DB,
  ssl: {},
});

export const db = drizzle(conn, { schema: vestaschema });
```

**AFTER (PostgreSQL/Supabase)**:

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "~/env";
import * as schema from "./schema"; // ← Use existing schema.ts

// Global connection cache for development HMR
const globalForDb = globalThis as unknown as {
  conn: ReturnType<typeof postgres> | undefined;
};

// Create PostgreSQL connection
const conn =
  globalForDb.conn ??
  postgres(env.DATABASE_URL, {
    ssl: env.NODE_ENV === "production" ? "require" : "prefer",
    max: 10, // Connection pool size
    idle_timeout: 20,
    max_lifetime: 60 * 30, // 30 minutes
  });

// Cache connection in development to avoid HMR reconnections
if (env.NODE_ENV !== "production") {
  globalForDb.conn = conn;
}

// Export Drizzle instance with schema
export const db = drizzle(conn, { schema });
```

### Step 3.2: Handle Connection Errors

Add error handling:

```typescript
// Test connection on startup (optional)
conn`SELECT 1`
  .then(() => console.log("✅ Database connected"))
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });
```

---

## Phase 4: Environment Configuration

### Step 4.1: Update Environment Variables

Modify `src/env.js`:

```typescript
// BEFORE
export const env = createEnv({
  server: {
    SINGLESTORE_USER: z.string(),
    SINGLESTORE_PASS: z.string(),
    SINGLESTORE_DB: z.string(),
    SINGLESTORE_HOST: z.string(),
    SINGLESTORE_PORT: z.string(),
    // ... other vars
  },
  runtimeEnv: {
    SINGLESTORE_USER: process.env.SINGLESTORE_USER,
    // ... etc
  },
});
```

**AFTER**:

```typescript
export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    // Replace SingleStore vars with DATABASE_URL
    DATABASE_URL: z.string().url(),

    // Optional: Direct connection URL (for migrations)
    DATABASE_DIRECT_URL: z.string().url().optional(),

    // Keep other existing vars
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_REGION: z.string().optional(),
    AWS_S3_BUCKET: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_ACCOUNT_ID: z.string(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_DIRECT_URL: process.env.DATABASE_DIRECT_URL,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
    NEXT_PUBLIC_ACCOUNT_ID: process.env.NEXT_PUBLIC_ACCOUNT_ID,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
```

### Step 4.2: Update `.env` File

Replace SingleStore credentials with Supabase connection string:

```env
# BEFORE
SINGLESTORE_USER="your_user"
SINGLESTORE_PASS="your_password"
SINGLESTORE_DB="your_database"
SINGLESTORE_HOST="svc-xxx.aws-oregon-4.svc.singlestore.com"
SINGLESTORE_PORT="3306"

# AFTER
# Supabase Connection (use pooling URL for production)
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Optional: Direct connection for migrations
DATABASE_DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Keep other vars
NEXT_PUBLIC_ACCOUNT_ID="2251799813685249"
AWS_ACCESS_KEY_ID="..."
AWS_REGION="us-east-1"
NODE_ENV="development"
```

### Step 4.3: Update `.env.example`

Update your example file for other developers:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://user:password@host:6543/database?pgbouncer=true"
DATABASE_DIRECT_URL="postgresql://user:password@host:5432/database"

# Client Configuration
NEXT_PUBLIC_ACCOUNT_ID="your_account_id"

# Optional AWS S3
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="us-east-1"
AWS_S3_BUCKET=""

NODE_ENV="development"
```

---

## Phase 5: Drizzle Configuration

### Step 5.1: Update `drizzle.config.ts`

```typescript
// BEFORE (SingleStore)
import { type Config } from "drizzle-kit";
import { env } from "~/env";

export default {
  schema: "./src/server/db/vestaschema.ts",
  dialect: "singlestore",
  dbCredentials: {
    host: env.SINGLESTORE_HOST,
    port: parseInt(env.SINGLESTORE_PORT),
    user: env.SINGLESTORE_USER,
    password: env.SINGLESTORE_PASS,
    database: env.SINGLESTORE_DB,
    ssl: {},
  },
} satisfies Config;
```

**AFTER (PostgreSQL/Supabase)**:

```typescript
import { type Config } from "drizzle-kit";
import { env } from "~/env";

export default {
  schema: "./src/server/db/schema.ts", // ← Changed to schema.ts
  dialect: "postgresql", // ← Changed to postgresql
  dbCredentials: {
    url: env.DATABASE_DIRECT_URL ?? env.DATABASE_URL, // ← Use direct URL for migrations
  },
  out: "./drizzle", // Migration output folder
  verbose: true,
  strict: true,
} satisfies Config;
```

### Step 5.2: Test Drizzle Configuration

```bash
# Generate migration files from schema
pnpm db:generate

# This should create a new migration in drizzle/ folder
```

---

## Phase 6: Query Compatibility

### Step 6.1: BigInt Serialization

Your existing code already handles BigInt serialization correctly:

```typescript
// ✅ Already doing this (keep as-is)
return result.map(row => ({
  ...row,
  listingId: row.listingId.toString(),
  propertyId: row.propertyId.toString(),
}));
```

### Step 6.2: Review Raw SQL Queries

Search for raw SQL usage in queries:

```bash
# Find all raw SQL queries
grep -r "sql\`" src/server/queries/
```

**Common PostgreSQL adjustments**:

| MySQL/SingleStore | PostgreSQL Equivalent |
|-------------------|----------------------|
| `CONCAT(a, ' ', b)` | `a \|\| ' ' \|\| b` or `CONCAT(a, ' ', b)` (both work) |
| `LOWER(column) LIKE '%term%'` | `column ILIKE '%term%'` (case-insensitive) |
| `NOW()` | `NOW()` ✅ (same) |
| `DATE_FORMAT()` | `TO_CHAR()` |

**Example adjustment**:

```typescript
// BEFORE (SingleStore)
agentName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,

// AFTER (PostgreSQL) - Both work, but CONCAT is more portable
agentName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`, // ✅ Keep as-is
// OR
agentName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
```

### Step 6.3: Test Query Functions

No changes needed to most queries! Test a few key ones:

```typescript
// src/server/queries/listings.ts
// ✅ These should work as-is with PostgreSQL:
// - searchListings()
// - getListingById()
// - createListing()
```

---

## Phase 7: Data Migration

### Step 7.1: Create PostgreSQL Schema

Push your Drizzle schema to Supabase:

```bash
# Apply schema to Supabase database
pnpm db:push

# Or use migrations
pnpm db:generate
pnpm db:migrate
```

Verify in Supabase:
- Go to **Table Editor** in Supabase dashboard
- Confirm all tables are created

### Step 7.2: Export Data from SingleStore

```bash
# Export data as CSV (adjust table names)
mysql -h $SINGLESTORE_HOST -u $SINGLESTORE_USER -p$SINGLESTORE_PASS $SINGLESTORE_DB \
  -e "SELECT * FROM accounts" > accounts.csv

# Or export as SQL INSERT statements
mysqldump -h $SINGLESTORE_HOST -u $SINGLESTORE_USER -p$SINGLESTORE_PASS \
  --no-create-info --skip-triggers $SINGLESTORE_DB > data.sql
```

### Step 7.3: Import Data to Supabase

#### Option A: Using Supabase Dashboard (Small datasets)
1. Go to **Table Editor**
2. Select table → **Insert** → **Import from CSV**

#### Option B: Using SQL (Large datasets)

```bash
# Convert MySQL dump to PostgreSQL format (if needed)
# Then run in Supabase SQL Editor or via psql

psql $DATABASE_DIRECT_URL < data.sql
```

#### Option C: Using Migration Script (Recommended)

Create a migration script:

```typescript
// scripts/migrate-data.ts
import { drizzle as drizzleMysql } from "drizzle-orm/mysql2";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { createPool } from "mysql2/promise";
import postgres from "postgres";

const mysqlConn = createPool({
  host: process.env.SINGLESTORE_HOST,
  user: process.env.SINGLESTORE_USER,
  password: process.env.SINGLESTORE_PASS,
  database: process.env.SINGLESTORE_DB,
});

const pgConn = postgres(process.env.DATABASE_URL!);

const sourceDb = drizzleMysql(mysqlConn);
const targetDb = drizzlePostgres(pgConn);

async function migrateAccounts() {
  console.log("Migrating accounts...");
  const accounts = await sourceDb.select().from(accountsSchema);

  for (const account of accounts) {
    await targetDb.insert(accountsSchema).values(account);
  }

  console.log(`✅ Migrated ${accounts.length} accounts`);
}

// Run migration
migrateAccounts()
  .then(() => process.exit(0))
  .catch(console.error);
```

Run it:

```bash
tsx scripts/migrate-data.ts
```

---

## Phase 8: Testing & Validation

### Step 8.1: Test Database Connection

```bash
# Start development server
pnpm dev

# Check console for "✅ Database connected"
```

### Step 8.2: Run Type Checking

```bash
pnpm typecheck
```

### Step 8.3: Test Key Queries

```typescript
// src/app/test-db/page.tsx (temporary test page)
import { getProperties } from "~/server/queries/properties";

export default async function TestPage() {
  const properties = await getProperties();

  return (
    <div>
      <h1>Database Test</h1>
      <pre>{JSON.stringify(properties, null, 2)}</pre>
    </div>
  );
}
```

### Step 8.4: Test CRUD Operations

- [ ] Create a property
- [ ] Read property details
- [ ] Update property fields
- [ ] Delete (soft delete) a property

### Step 8.5: Test Portal Integrations

- [ ] Test Fotocasa API calls
- [ ] Test Idealista integration
- [ ] Verify image uploads still work

---

## Troubleshooting

### Issue: Connection Pool Exhausted

**Error**: `Connection pool exhausted`

**Solution**: Increase pool size in `src/server/db/index.ts`:

```typescript
postgres(env.DATABASE_URL, {
  max: 20, // Increase from 10
});
```

### Issue: SSL Certificate Error

**Error**: `SSL certificate verification failed`

**Solution**: Update connection string:

```env
DATABASE_URL="postgresql://...?sslmode=require"
```

### Issue: BigInt Serialization Error

**Error**: `Do not know how to serialize a BigInt`

**Solution**: Ensure all BigInt values are converted to strings:

```typescript
// Add toString() for all BigInt fields
return {
  id: row.id.toString(),
  accountId: row.accountId.toString(),
};
```

### Issue: Query Performance Degradation

**Solution**: Add indexes in Supabase:

```sql
-- Run in Supabase SQL Editor
CREATE INDEX idx_properties_account_id ON properties(account_id);
CREATE INDEX idx_listings_property_id ON listings(property_id);
CREATE INDEX idx_listings_status ON listings(status);
```

### Issue: `onUpdateNow()` Not Working

**Expected**: This is normal for PostgreSQL.

**Solution**: Manually update `updatedAt` in queries (see Phase 2.3).

---

## Post-Migration Checklist

- [ ] All tables created in Supabase
- [ ] Data migrated successfully
- [ ] Connection string updated in `.env`
- [ ] `pnpm dev` starts without errors
- [ ] Test page shows data correctly
- [ ] CRUD operations work
- [ ] Portal integrations tested
- [ ] Image uploads tested
- [ ] Production deployment updated
- [ ] SingleStore connection removed from code
- [ ] Old dependencies removed (`mysql2`, etc.)
- [ ] Documentation updated (README.md)

---

## Rollback Plan

If migration fails, you can rollback:

1. **Revert code changes**:
   ```bash
   git checkout main
   ```

2. **Restore `.env`**:
   ```env
   SINGLESTORE_USER="..."
   # ... restore old credentials
   ```

3. **Reinstall old dependencies**:
   ```bash
   pnpm add drizzle-orm mysql2
   pnpm remove postgres
   ```

4. **Restart development server**:
   ```bash
   pnpm dev
   ```

---

## Next Steps After Migration

### 1. Enable Supabase Features

#### Row Level Security (RLS)
```sql
-- Enable RLS on tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Create policy for multi-tenant access
CREATE POLICY "Users can only access their account's properties"
ON properties
FOR ALL
USING (account_id = current_setting('app.current_account_id')::bigint);
```

#### Realtime Subscriptions (Optional)
```typescript
// Enable realtime for listings table
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

supabase
  .channel('listings')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' },
    (payload) => {
      console.log('Listing changed:', payload)
    }
  )
  .subscribe()
```

### 2. Consider Supabase Storage

Replace AWS S3 with Supabase Storage:

```typescript
// Upload to Supabase Storage instead of S3
const { data, error } = await supabase.storage
  .from('property-images')
  .upload(`${propertyId}/${fileName}`, file)
```

### 3. Performance Optimization

- Add database indexes for frequently queried fields
- Enable connection pooling (already configured)
- Use Supabase Edge Functions for heavy operations

---

## Summary

This migration involves:
1. ✅ Replacing MySQL2 with `postgres` driver
2. ✅ Using existing `schema.ts` (already PostgreSQL-compatible)
3. ✅ Updating environment variables to use `DATABASE_URL`
4. ✅ Adjusting connection setup in `src/server/db/index.ts`
5. ✅ Migrating data from SingleStore to Supabase
6. ✅ Testing all queries and operations

**Estimated Total Time**: 3-5 hours (excluding data migration)

**Complexity**: Low-Medium (most code stays the same)

---

## Support

- **Drizzle Docs**: https://orm.drizzle.team/docs/get-started-postgresql
- **Supabase Docs**: https://supabase.com/docs/guides/database
- **Supabase Discord**: https://discord.supabase.com
- **Drizzle Discord**: https://discord.gg/drizzle

Good luck with your migration! 🚀
