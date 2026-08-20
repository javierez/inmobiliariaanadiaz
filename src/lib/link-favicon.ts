/**
 * The icon of a linked site, for the /enlaces-de-interes directory.
 *
 * Always our own `/api/favicon`, never the icon service directly: same-origin
 * satisfies the site's `img-src 'self'` CSP, keeps the visitor's browser from
 * ever contacting a third party, and lets the route turn the service's
 * "404 with an image in the body" into something a browser will render.
 *
 * Mirrored from the CRM editor (`links-url.ts` in v0-vesta) so the icon an
 * agency sees while editing is the icon its visitors get. Keep them in step.
 */
export function faviconUrl(url: string): string | null {
  let hostname: string;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    hostname = parsed.hostname;
  } catch {
    return null;
  }
  if (!hostname.includes(".")) return null;

  return `/api/favicon?domain=${encodeURIComponent(hostname)}`;
}
