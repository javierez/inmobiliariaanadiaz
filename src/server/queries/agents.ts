import { cache } from "react";
import { db } from "~/server/db";
import { users, userRoles } from "~/server/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { env } from "~/env";

/**
 * Get the admin agent ID for property listing assignment.
 * Returns the first created user with role_id = 3 for this account (typically the account owner).
 */
export const getAdminAgent = cache(async (): Promise<string> => {
  try {
    const accountId = BigInt(env.NEXT_PUBLIC_ACCOUNT_ID);

    const [agent] = await db
      .select({ id: users.id })
      .from(users)
      .leftJoin(userRoles, eq(users.id, userRoles.userId))
      .where(and(eq(users.accountId, accountId), eq(userRoles.roleId, 3n)))
      .orderBy(asc(users.createdAt))
      .limit(1);

    if (agent) {
      return agent.id;
    }

    throw new Error("No agents found with the required role permissions");
  } catch (error) {
    console.error("Failed to get admin agent:", error);
    throw new Error(
      `Unable to assign listing to any agent: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
});
