# Vesta Database Implementation Guide - Drizzle ORM + SingleStore

This document provides a comprehensive overview of how Vesta currently implements database operations using **Drizzle ORM** with **SingleStore** (MySQL-compatible). This guide will help you understand the current implementation and facilitate migration to Supabase.

---

## Table of Contents

1. [Database Architecture Overview](#database-architecture-overview)
2. [Connection Setup](#connection-setup)
3. [Environment Configuration](#environment-configuration)
4. [Schema Definition](#schema-definition)
5. [Query Patterns](#query-patterns)
6. [Common Operations](#common-operations)
7. [Migration Workflows](#migration-workflows)
8. [Key Considerations for Supabase Migration](#key-considerations-for-supabase-migration)

---

## Database Architecture Overview

### Tech Stack
- **ORM**: Drizzle ORM v0.42.0
- **Database**: SingleStore (MySQL-compatible)
- **Connection Pool**: mysql2/promise
- **Dialect**: SingleStore-specific (`drizzle-orm/singlestore`)

### Project Structure
```
src/server/
├── db/
│   ├── index.ts              # Database connection & Drizzle instance
│   └── vestaschema.ts        # All table schemas (710 lines)
└── queries/                  # Server-side query functions
    ├── properties.ts         # Property queries
    ├── listings.ts           # Listing queries
    ├── account.ts            # Account queries
    ├── locations.ts
    ├── testimonial.ts
    └── ...
```

---

## Connection Setup

### Database Connection (`src/server/db/index.ts`)

```typescript
import { drizzle } from "drizzle-orm/singlestore";
import { createPool, type Pool } from "mysql2/promise";
import { env } from "~/env";
import * as vestaschema from "./vestaschema";

// Global connection cache for development HMR
const globalForDb = globalThis as unknown as {
  conn: Pool | undefined;
};

// Create connection pool
const conn =
  globalForDb.conn ??
  createPool({
    host: env.SINGLESTORE_HOST,
    port: parseInt(env.SINGLESTORE_PORT),
    user: env.SINGLESTORE_USER,
    password: env.SINGLESTORE_PASS,
    database: env.SINGLESTORE_DB,
    ssl: {},
    maxIdle: 0,
  });

// Cache connection in development to avoid HMR reconnections
if (env.NODE_ENV !== "production") globalForDb.conn = conn;

// Error listener
conn.addListener("error", (err) => {
  console.error("Database connection error", err);
});

// Export Drizzle instance with schema
export const db = drizzle(conn, { schema: vestaschema });
```

**Key Points:**
- Uses MySQL2 connection pooling
- HMR-safe with global connection caching in development
- SSL enabled by default
- Schema imported and passed to Drizzle instance
- Single export: `db` object used throughout the application

---

## Environment Configuration

### Environment Variables (`src/env.js`)

```typescript
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    SINGLESTORE_USER: z.string(),
    SINGLESTORE_PASS: z.string(),
    SINGLESTORE_DB: z.string(),
    SINGLESTORE_HOST: z.string(),
    SINGLESTORE_PORT: z.string(),
    // Optional AWS for S3
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
    SINGLESTORE_USER: process.env.SINGLESTORE_USER,
    SINGLESTORE_PASS: process.env.SINGLESTORE_PASS,
    SINGLESTORE_DB: process.env.SINGLESTORE_DB,
    SINGLESTORE_HOST: process.env.SINGLESTORE_HOST,
    SINGLESTORE_PORT: process.env.SINGLESTORE_PORT,
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

### Example `.env` file

```env
# Database Configuration
SINGLESTORE_USER="your_user"
SINGLESTORE_PASS="your_password"
SINGLESTORE_DB="your_database"
SINGLESTORE_HOST="svc-xxx.aws-oregon-4.svc.singlestore.com"
SINGLESTORE_PORT="3306"

# Client Configuration
NEXT_PUBLIC_ACCOUNT_ID="2251799813685249"

# Optional AWS S3
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
AWS_S3_BUCKET="..."

NODE_ENV="development"
```

---

## Schema Definition

### Schema Pattern (`src/server/db/vestaschema.ts`)

All schemas use **SingleStore-specific imports** from `drizzle-orm/singlestore-core`:

```typescript
import {
  bigint,
  varchar,
  timestamp,
  boolean,
  singlestoreTable,
  json,
  text,
  decimal,
  smallint,
  int,
} from "drizzle-orm/singlestore-core";
```

### Table Definition Examples

#### 1. Accounts Table (Multi-tenant Root)
```typescript
export const accounts = singlestoreTable("accounts", {
  accountId: bigint("account_id", { mode: "bigint" })
    .primaryKey()
    .autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  shortName: varchar("short_name", { length: 50 }),
  legalName: varchar("legal_name", { length: 255 }),
  logo: varchar("logo", { length: 2048 }),
  address: varchar("address", { length: 500 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 255 }),

  // JSON configuration fields
  portalSettings: json("portal_settings").default({}),
  paymentSettings: json("payment_settings").default({}),
  preferences: json("preferences").default({}),

  // Subscription/billing
  plan: varchar("plan", { length: 50 }).default("basic"),
  subscriptionStatus: varchar("subscription_status", { length: 20 }).default("active"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  isActive: boolean("is_active").default(true),
});
```

#### 2. Properties Table (Core Entity)
```typescript
export const properties = singlestoreTable("properties", {
  propertyId: bigint("property_id", { mode: "bigint" })
    .primaryKey()
    .autoincrement(),

  // Multi-tenant security
  accountId: bigint("account_id", { mode: "bigint" }).notNull(),

  // Basic info
  referenceNumber: varchar("reference_number", { length: 32 }),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  propertyType: varchar("property_type", { length: 20 }).default("piso"),
  formPosition: int("form_position").notNull().default(1),

  // Specifications
  bedrooms: smallint("bedrooms"),
  bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }),
  squareMeter: int("square_meter"),
  yearBuilt: smallint("year_built"),

  // Location
  street: varchar("street", { length: 255 }),
  postalCode: varchar("postal_code", { length: 20 }),
  neighborhoodId: bigint("neighborhood_id", { mode: "bigint" }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),

  // Energy
  energyCertification: text("energy_certification"),
  energyCertificateStatus: varchar("energy_certificate_status", { length: 20 }),
  energyConsumptionScale: varchar("energy_consumption_scale", { length: 2 }),
  energyConsumptionValue: decimal("energy_consumption_value", { precision: 6, scale: 2 }),

  // Amenities (boolean fields)
  hasElevator: boolean("has_elevator").default(false),
  hasGarage: boolean("has_garage").default(false),
  hasStorageRoom: boolean("has_storage_room").default(false),
  // ... many more boolean fields

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  isActive: boolean("is_active").default(true),
});
```

#### 3. Listings Table (Property + Market Info)
```typescript
export const listings = singlestoreTable("listings", {
  listingId: bigint("listing_id", { mode: "bigint" })
    .primaryKey()
    .autoincrement(),

  accountId: bigint("account_id", { mode: "bigint" }).notNull(),
  propertyId: bigint("property_id", { mode: "bigint" }).notNull(),
  agentId: varchar("agent_id", { length: 36 }).notNull(), // BetterAuth compatible

  listingType: varchar("listing_type", { length: 20 }).notNull(), // "Sale" | "Rent"
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),

  // Listing-specific amenities
  isFurnished: boolean("is_furnished"),
  optionalGarage: boolean("optional_garage"),
  optionalGaragePrice: decimal("optional_garage_price", { precision: 12, scale: 2 }),
  studentFriendly: boolean("student_friendly"),
  petsAllowed: boolean("pets_allowed"),

  // Portal publication flags
  fotocasa: boolean("fotocasa").default(false),
  idealista: boolean("idealista").default(false),
  habitaclia: boolean("habitaclia").default(false),
  publishToWebsite: boolean("publish_to_website").default(true),

  // Visibility
  isFeatured: boolean("is_featured").default(false),
  visibilityMode: smallint("visibility_mode").default(1), // 1=Exact, 2=Street, 3=Zone

  // Analytics
  viewCount: int("view_count").default(0),
  inquiryCount: int("inquiry_count").default(0),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  isActive: boolean("is_active").default(true),
});
```

#### 4. Property Images Table
```typescript
export const propertyImages = singlestoreTable("property_images", {
  propertyImageId: bigint("property_image_id", { mode: "bigint" })
    .primaryKey()
    .autoincrement(),
  propertyId: bigint("property_id", { mode: "bigint" }).notNull(),
  referenceNumber: varchar("reference_number", { length: 32 }).notNull(),
  imageUrl: varchar("image_url", { length: 255 }).notNull(),
  imageKey: varchar("image_key", { length: 2048 }).notNull(),
  s3key: varchar("s3key", { length: 2048 }).notNull(),
  imageTag: varchar("image_tag", { length: 255 }), // 'tour', 'youtube', 'video'
  imageOrder: int("image_order").default(0).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
```

### Common Schema Patterns

1. **BigInt Primary Keys**: All IDs use `bigint("id", { mode: "bigint" })` with autoincrement
2. **Multi-tenant Security**: Every table has `accountId: bigint(...).notNull()`
3. **Soft Deletes**: Most tables have `isActive: boolean().default(true)`
4. **Timestamps**: All tables have `createdAt` and `updatedAt` with `defaultNow()` and `onUpdateNow()`
5. **JSON Fields**: Use `json("field").default({})` for flexible configuration
6. **Decimal Precision**: Financial/measurement values use `decimal()` with explicit precision

---

## Query Patterns

### Basic Patterns Used Throughout Codebase

#### 1. Simple Select with Join
```typescript
// src/server/queries/account.ts
export const getAccountInfo = cache(
  async (accountId: string): Promise<AccountInfo | null> => {
    "use server";
    try {
      const [account] = await db
        .select({
          accountId: accounts.accountId,
          name: accounts.name,
          shortName: accounts.shortName,
          status: accounts.status,
          subscriptionType: accounts.subscriptionType,
        })
        .from(accounts)
        .where(eq(accounts.accountId, BigInt(accountId)))
        .limit(1);

      if (!account) return null;

      // Convert BigInt to string for serialization
      return {
        accountId: account.accountId.toString(),
        name: account.name,
        shortName: account.shortName ?? "",
        status: account.status ?? "",
        subscriptionType: account.subscriptionType ?? "",
      };
    } catch (error) {
      console.error("Error fetching account info:", error);
      return null;
    }
  },
);
```

#### 2. Complex Multi-Join with Subqueries
```typescript
// src/server/queries/listings.ts
export const searchListings = cache(
  async (filters?: SearchFilters, limit = 12): Promise<ListingCardData[]> => {
    try {
      // Build dynamic WHERE conditions
      const whereConditions = [
        eq(listings.accountId, ACCOUNT_ID),
        sql`${listings.status} != 'Draft'`,
        eq(listings.isActive, true),
        eq(listings.publishToWebsite, true),
      ];

      // Add filter conditions dynamically
      if (filters?.location && filters.location !== "todas-ubicaciones") {
        const locationValue = filters.location.replace(/-/g, " ");
        whereConditions.push(
          sql`(
            LOWER(${locations.city}) LIKE ${`%${locationValue.toLowerCase()}%`} OR
            LOWER(${locations.province}) LIKE ${`%${locationValue.toLowerCase()}%`} OR
            LOWER(${properties.street}) LIKE ${`%${locationValue.toLowerCase()}%`}
          )`,
        );
      }

      if (filters?.bedrooms && filters.bedrooms > 0) {
        whereConditions.push(
          sql`${properties.bedrooms} >= ${filters.bedrooms}`,
        );
      }

      // Execute query with joins
      const listingsData = await db
        .select({
          // Listing fields
          listingId: listings.listingId,
          price: listings.price,
          listingType: listings.listingType,

          // Property fields
          referenceNumber: properties.referenceNumber,
          title: properties.title,
          bedrooms: properties.bedrooms,

          // Location fields
          city: locations.city,
          province: locations.province,

          // Agent name (concatenated)
          agentName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,

          // Subquery for first image
          imageUrl: sql<string>`(
            SELECT image_url
            FROM property_images
            WHERE property_id = ${properties.propertyId}
              AND is_active = true
              AND image_order = 1
              AND (image_tag IS NULL OR image_tag NOT IN ('tour', 'youtube', 'video'))
            LIMIT 1
          )`,
        })
        .from(listings)
        .innerJoin(properties, eq(listings.propertyId, properties.propertyId))
        .leftJoin(locations, eq(properties.neighborhoodId, locations.neighborhoodId))
        .leftJoin(users, eq(listings.agentId, users.id))
        .where(and(...whereConditions))
        .orderBy(desc(listings.price))
        .limit(limit);

      // Transform BigInt to string for serialization
      return listingsData.map((listing) => ({
        ...listing,
        listingId: listing.listingId.toString(),
        propertyId: listing.propertyId.toString(),
        price: listing.price?.toString() || "0",
      }));
    } catch (error) {
      console.error("Error searching listings:", error);
      return [];
    }
  },
);
```

### Common Query Operators

```typescript
import { eq, and, or, desc, asc, sql } from "drizzle-orm";

// WHERE conditions
eq(table.column, value)                          // column = value
and(condition1, condition2, ...)                 // AND multiple conditions
or(condition1, condition2)                       // OR conditions
sql`${column} >= ${value}`                       // Raw SQL for complex comparisons
sql`LOWER(${column}) LIKE ${pattern}`           // Pattern matching

// ORDER BY
orderBy(desc(table.column))                      // ORDER BY column DESC
orderBy(asc(table.column))                       // ORDER BY column ASC

// LIMIT
.limit(10)                                       // LIMIT 10
```

### BigInt Handling Pattern

**Critical**: SingleStore returns BigInt for `bigint` columns, which cannot be serialized to JSON directly.

```typescript
// Always convert BigInt to string before returning from server actions
const result = await db.select().from(table).where(...);

return result.map(row => ({
  ...row,
  id: row.id.toString(),                         // Convert BigInt to string
  accountId: row.accountId.toString(),           // Convert BigInt to string
  propertyId: row.propertyId?.toString() || null // Handle nullable BigInt
}));
```

### React Cache Pattern

All query functions use React's `cache` to deduplicate requests:

```typescript
import { cache } from "react";

export const getProperties = cache(async () => {
  // Query logic
});
```

---

## Common Operations

### 1. Insert Operation

```typescript
// Insert single row
await db.insert(properties).values({
  accountId: BigInt(accountId),
  title: "New Property",
  propertyType: "piso",
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Insert multiple rows
await db.insert(propertyImages).values([
  { propertyId: BigInt(1), imageUrl: "url1", imageOrder: 0 },
  { propertyId: BigInt(1), imageUrl: "url2", imageOrder: 1 },
]);
```

### 2. Update Operation

```typescript
// Update single row
await db
  .update(listings)
  .set({
    price: 250000,
    updatedAt: new Date()
  })
  .where(eq(listings.listingId, BigInt(listingId)));

// Update with multiple conditions
await db
  .update(properties)
  .set({ isActive: false })
  .where(
    and(
      eq(properties.accountId, BigInt(accountId)),
      eq(properties.propertyId, BigInt(propertyId))
    )
  );
```

### 3. Delete Operation (Soft Delete)

```typescript
// Soft delete (recommended pattern)
await db
  .update(listings)
  .set({ isActive: false, updatedAt: new Date() })
  .where(eq(listings.listingId, BigInt(listingId)));

// Hard delete (rarely used)
await db
  .delete(propertyImages)
  .where(eq(propertyImages.propertyImageId, BigInt(imageId)));
```

### 4. Transactions

```typescript
// Drizzle transactions
await db.transaction(async (tx) => {
  const [property] = await tx.insert(properties).values({
    accountId: BigInt(accountId),
    title: "New Property",
  });

  await tx.insert(listings).values({
    propertyId: property.propertyId,
    accountId: BigInt(accountId),
    price: 300000,
  });
});
```

---

## Migration Workflows

### Drizzle Kit Configuration (`drizzle.config.ts`)

```typescript
import { type Config } from "drizzle-kit";
import { env } from "~/env";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "singlestore",
  tablesFilter: ["flexweb_*"],
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

### Migration Commands (from `package.json`)

```bash
# Generate migration files from schema
pnpm db:generate

# Apply migrations to database
pnpm db:migrate

# Push schema changes directly (no migration files)
pnpm db:push

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

### Current Workflow
1. Modify `src/server/db/vestaschema.ts`
2. Run `pnpm db:push` to apply changes directly
3. No migration files are generated (using push-based workflow)

---

## Key Considerations for Supabase Migration

### 1. Dialect Change
- **Current**: `drizzle-orm/singlestore` with `singlestoreTable`
- **Target**: `drizzle-orm/postgres` with `pgTable`
- **Impact**: All table definitions need dialect swap

### 2. Connection Setup
- **Current**: MySQL2 connection pool
- **Target**: Supabase Postgres connection (via `@supabase/supabase-js` or `postgres` driver)
- **Files to modify**: `src/server/db/index.ts`

### 3. BigInt Handling
- **Current**: Uses `bigint("id", { mode: "bigint" })` everywhere
- **PostgreSQL**: Can use `bigserial` or `serial` (returns number, not BigInt)
- **Consider**: Switching to regular `serial` to avoid BigInt serialization issues

### 4. Auto-incrementing IDs
- **Current**: `.autoincrement()` on BigInt columns
- **PostgreSQL**: Use `serial` or `bigserial` types

### 5. JSON Fields
- **Current**: `json("field").default({})`
- **PostgreSQL**: `jsonb("field").default({})` (JSONB is preferred in Postgres)

### 6. Timestamp Defaults
- **Current**: `.defaultNow()` and `.onUpdateNow()`
- **PostgreSQL**: `.defaultNow()` supported, but `.onUpdateNow()` requires triggers

### 7. SSL Configuration
- **Current**: SSL enabled via `ssl: {}`
- **Supabase**: SSL typically required, use connection string with `sslmode=require`

### 8. Environment Variables
- Replace `SINGLESTORE_*` variables with `DATABASE_URL` (Supabase connection string)
- Example: `DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres`

### 9. Query Compatibility
- Most Drizzle query syntax is database-agnostic
- SQL template literals may need PostgreSQL-specific adjustments
- Test all raw SQL queries (especially CONCAT, date functions)

### 10. Supabase-specific Features
- **Row Level Security (RLS)**: Consider implementing policies
- **Realtime subscriptions**: Available via Supabase client
- **Storage**: Can replace S3 with Supabase Storage
- **Auth**: Can replace BetterAuth with Supabase Auth

---

## Migration Checklist

- [ ] Update `drizzle.config.ts` to use `postgres` dialect
- [ ] Change all imports from `singlestore-core` to `pg-core`
- [ ] Replace `singlestoreTable` with `pgTable`
- [ ] Replace `bigint(...).autoincrement()` with `bigserial()` or `serial()`
- [ ] Update `json()` to `jsonb()` where appropriate
- [ ] Replace `.onUpdateNow()` with database triggers
- [ ] Update connection setup in `src/server/db/index.ts`
- [ ] Replace environment variables in `src/env.js`
- [ ] Test all queries for PostgreSQL compatibility
- [ ] Handle BigInt serialization (or switch to number IDs)
- [ ] Test all raw SQL queries
- [ ] Implement Supabase RLS policies
- [ ] Migrate data from SingleStore to Supabase
- [ ] Update deployment configuration

---

## Additional Resources

- **Drizzle ORM Docs**: https://orm.drizzle.team/docs/overview
- **Drizzle PostgreSQL**: https://orm.drizzle.team/docs/get-started-postgresql
- **Supabase Drizzle Guide**: https://supabase.com/docs/guides/database/drizzle
- **Current Schema**: `/src/server/db/vestaschema.ts` (710 lines - all tables)

---

## Summary

This Vesta codebase uses a clean, type-safe database layer with:
- Drizzle ORM for all database operations
- SingleStore (MySQL-compatible) as the database
- Type-safe schema definitions with full TypeScript inference
- Server-side queries with React cache deduplication
- Multi-tenant architecture with account-based security
- Consistent patterns for BigInt handling, soft deletes, and timestamps

The migration to Supabase will primarily involve:
1. Swapping the database dialect (singlestore → postgres)
2. Updating connection setup
3. Adjusting schema type definitions
4. Testing query compatibility

All query logic should remain largely unchanged thanks to Drizzle's database-agnostic API.
