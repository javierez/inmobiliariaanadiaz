import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "~/env";

/**
 * Verify the HMAC token issued by vesta admin's `generatePreviewTokenAction`.
 * Returns true when token is valid and not expired.
 */
export function verifyPreviewToken(args: {
  token: string;
  accountId: string | bigint;
  exp: number;
}): boolean {
  const secret = env.PREVIEW_HMAC_SECRET;
  if (!secret) return false;
  if (!args.token || !args.exp) return false;
  if (Number.isNaN(args.exp) || args.exp < Date.now()) return false;

  const expected = createHmac("sha256", secret)
    .update(`${String(args.accountId)}:${args.exp}`)
    .digest("hex");

  if (expected.length !== args.token.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(args.token));
  } catch {
    return false;
  }
}
