import { type Config } from "drizzle-kit";
import { env } from "~/env";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  tablesFilter: ["flexweb_*"],
  dbCredentials: {
    url: env.POSTGRES_URL_NON_POOLING ?? env.POSTGRES_URL,
  },
  out: "./drizzle",
  verbose: true,
  strict: true,
} satisfies Config;
