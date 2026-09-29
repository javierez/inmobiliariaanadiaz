/**
 * In-memory sliding window rate limiter.
 * No external dependencies — works per-instance on Vercel serverless.
 */

import { headers } from "next/headers";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) {
      store.delete(key);
    }
  }
}

export function rateLimit(
  key: string,
  options: { maxRequests: number; windowMs: number },
): { success: boolean; remaining: number } {
  cleanup();

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return { success: true, remaining: options.maxRequests - 1 };
  }

  entry.count += 1;

  if (entry.count > options.maxRequests) {
    return { success: false, remaining: 0 };
  }

  return { success: true, remaining: options.maxRequests - entry.count };
}

export async function getClientIp(): Promise<string> {
  const hdrs = await headers();
  return hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
