import { NextResponse, type NextRequest } from "next/server";

/**
 * The icon of a site listed on /enlaces-de-interes, served from our own origin.
 *
 * Why a proxy instead of pointing <Image> straight at the icon service:
 *
 *  1. The service answers **404 with a perfectly good image body** for any
 *     domain it has no icon for — and a lot of Spanish public-sector sites
 *     (www1.sedecatastro.gob.es, sigpac.mapa.es, servicios4.jcyl.es) are in
 *     that bucket. `next/image` refuses any non-2xx upstream, so a third of
 *     the directory rendered as broken images.
 *  2. Same-origin means the page CSP (`img-src 'self'`) needs no third-party
 *     entry, and a visitor's browser never talks to Google: no cookies, no
 *     referrer, nothing to disclose in a privacy policy.
 *
 * A miss degrades to a neutral globe, so every card keeps the same shape.
 */

const CACHE_SECONDS = 60 * 60 * 24 * 7; // a favicon changing is a yearly event

/** Hostname only — no scheme, no path, nothing that could point elsewhere. */
const HOSTNAME = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i;

/** Matches the lucide `Globe` used beside it, so a miss looks deliberate. */
const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.35"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`;

function fallback(): NextResponse {
  return new NextResponse(FALLBACK_SVG, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}`,
    },
  });
}

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get("domain") ?? "";
  if (!HOSTNAME.test(domain) || domain.length > 253) return fallback();

  try {
    const upstream = await fetch(
      `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`,
      { next: { revalidate: CACHE_SECONDS } },
    );

    // The 404 body is a generic placeholder, not this site's icon. Serving our
    // own keeps the directory visually consistent instead of mixing two
    // different "no icon" glyphs.
    if (!upstream.ok) return fallback();

    const contentType = upstream.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) return fallback();

    const body = await upstream.arrayBuffer();
    if (body.byteLength === 0) return fallback();

    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}`,
      },
    });
  } catch {
    return fallback();
  }
}
