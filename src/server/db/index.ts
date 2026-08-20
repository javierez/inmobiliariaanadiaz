import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "~/env";
import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: ReturnType<typeof postgres> | undefined;
};

// Create PostgreSQL connection with Supabase
const conn =
  globalForDb.conn ??
  postgres(env.POSTGRES_URL, {
    ssl: env.NODE_ENV === "production" ? "require" : "prefer",
    max: 5,
    idle_timeout: 10,
    max_lifetime: 60 * 5, // 5 minutes - release connections faster
    connect_timeout: 30,
  });

// Cache connection in development to avoid HMR reconnections
if (env.NODE_ENV !== "production") {
  globalForDb.conn = conn;
}

export const db = drizzle(conn, { schema });
