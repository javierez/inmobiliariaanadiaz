# Watermarking Approaches in Vesta

This document covers the three watermarking strategies we've tried, why each was adopted or abandoned, and guidance for future decisions.

---

## Timeline

| # | Approach | Period | Status |
|---|----------|--------|--------|
| 1 | Canvas (client-side pixel manipulation) | Sep–Nov 2025 | Abandoned |
| 2 | CSS Overlay (current) | Dec 2025–present | Active |
| 3 | Sharp API Route (server-side processing) | Mar 2026 | Attempted, reverted |

---

## 1. Canvas-Based Client-Side Watermarking

**Commits:** `3cbb85c`, `3519dee`, `cd7a3d4`, `ce9ff32`

### How it worked

1. Preload the watermark logo as an `Image()` element
2. Load the property image onto an HTML5 `<canvas>`
3. Calculate watermark size/position from config
4. Draw with `canvas.globalAlpha` for opacity
5. Export via `canvas.toDataURL()` to replace the original `<img>` src

### Why it failed

- **CORS**: S3 images are cross-origin. Canvas becomes "tainted" when drawing cross-origin pixels — `toDataURL()` throws a security error. This is the primary blocker since all property images live on S3.
- **Hydration errors**: Canvas processing is client-only, but Next.js SSR tried to render synchronously, causing React hydration mismatches.
- **Performance**: Processing images on the main thread blocked the UI, especially on mobile with large images.
- **Complexity**: Required 300+ lines of state management (`watermarkedImages[]`, `watermarkingStatus[]`, async preloading, error fallbacks).

### Verdict

Fundamentally incompatible with cross-origin images. Would only work if images were served from the same domain or if S3 was configured with permissive CORS headers (which introduces its own security concerns).

---

## 2. CSS Overlay (Current — Active)

**File:** `src/components/property/image-gallery.tsx`

### How it works

The original image loads untouched. A separate `<img>` tag with the logo is positioned on top using CSS absolute positioning:

```tsx
<Image src={originalUrl} />

{showWatermark && loaded[index] && (
  <div
    className={cn("pointer-events-none absolute z-10", positionClasses)}
    style={{ width: `${sizePercentage}%`, opacity }}
  >
    <img src={logoUrl} onError={fallbackToLocalLogo} />
  </div>
)}
```

**Position mapping:**

| Config value | CSS classes |
|---|---|
| `"northeast"` | `top-4 right-4` |
| `"northwest"` | `top-4 left-4` |
| `"southeast"` | `bottom-4 right-4` |
| `"southwest"` | `bottom-4 left-4` |
| `"center"` | `top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2` |

### Why it works

- **No CORS issues** — the browser loads the logo as a regular image, no pixel access needed.
- **No extra API requests** — images load directly from S3.
- **Simple** — ~50 lines of watermark logic total.
- **Original quality preserved** — no re-encoding or compression.
- **Easy to toggle** — just a boolean in the watermark config.

### Limitations

- **Not permanent** — the watermark is a DOM overlay. Anyone can inspect-element and remove it, or just download the original image URL from the network tab.
- **Separate logo request** — the watermark logo is fetched as its own HTTP request (once per page, browser-cached).
- **Brief flash** — there's a tiny moment after the image loads but before the watermark appears.

### When this is enough

For **branding and visual attribution** — making sure every visitor sees the logo on every image. This is sufficient for most real estate websites where the goal is brand presence, not piracy prevention.

---

## 3. Sharp API Route (Server-Side Processing)

**Files (reverted/uncommitted):** `src/lib/watermark.ts`, `src/lib/image-url.ts`, `src/app/api/image/route.ts`

### How it would work

1. Image URLs get rewritten: `/api/image?url={encoded_s3_url}`
2. The API route fetches the original image from S3
3. Sharp composites the logo onto the image server-side
4. Returns the watermarked JPEG with cache headers (1 week)

```
Browser → /api/image?url=s3://photo.jpg → fetch S3 → Sharp composite → watermarked JPEG
```

### Why it was attempted

- **Permanent watermark** — baked into the image pixels, can't be stripped via devtools.
- **No CORS issues** — Sharp runs on Node.js, no browser restrictions.
- **Security** — URL whitelist prevents arbitrary proxying.

### Why it was reverted

- **Extra network hop** — every image goes through the API route instead of loading directly from S3/CDN. This doubles latency and removes CDN caching benefits.
- **Vercel cold starts** — the API route needs Node.js runtime (not Edge), meaning potential cold start delays.
- **Quality loss** — re-encoding as JPEG at quality 85 degrades the original.
- **Complexity** — required `sharp` as a dependency (native binary), new API route, URL rewriting in multiple components, and domain whitelisting.
- **Generated sites** — the static site generation pipeline copies from the main app. Adding an API route that requires a running server contradicts the "static site" goal.
- **Over-engineering** — for the branding use case, the CSS overlay achieves the same visual result with none of this overhead.

---

## Configuration (shared by all approaches)

All three approaches read from the same config structure, stored in `websiteProperties`:

```typescript
interface WatermarkConfig {
  enabled: boolean;
  position: string;        // "northeast" | "northwest" | "southeast" | "southwest" | "center"
  sizePercentage: number;  // e.g. 30 (percent of image width)
  opacity: number;         // e.g. 0.8
  logoUrl: string;         // URL to the logo image
}
```

**Database fields:**
- `websiteProperties.logo` — URL to the logo
- `websiteProperties.watermarkProps` — JSON text: `{enabled, position, sizePercentage, opacity}`

**Query:** `src/server/queries/watermark.ts` → `getWatermarkConfig()`

For generated static sites, `code-transformer.ts` bakes this config into a static return value (no DB needed at runtime).

---

## Comparison

| | Canvas | CSS Overlay | Sharp API |
|---|---|---|---|
| **Watermark permanent?** | Yes | No (DOM overlay) | Yes |
| **CORS safe?** | No | Yes | Yes |
| **Extra requests?** | No | 1 (logo) | 1 per image |
| **Image quality?** | Degraded (toDataURL) | Original | Degraded (JPEG 85) |
| **Complexity** | High (~300 lines) | Low (~50 lines) | Medium (~240 lines) |
| **Works with static sites?** | Yes | Yes | No (needs server) |
| **Performance** | Bad (main thread) | Good | Moderate (server cost) |

---

## Future Considerations

If permanent watermarking ever becomes a hard requirement (e.g., for copyright protection rather than branding):

1. **Pre-process at upload time** — Apply watermarks when images are uploaded to S3 via a Lambda function. Store both original and watermarked versions. This is the cleanest solution: no runtime cost, CDN-friendly, permanent.

2. **CloudFront image transformation** — Use AWS CloudFront Functions or Lambda@Edge to apply watermarks on-the-fly at the CDN level. Best of both worlds (permanent + cached) but requires AWS infrastructure setup.

3. **Next.js Image loader** — Write a custom `loader` for `next/image` that points to an image transformation service (Cloudinary, Imgix, etc.) which can overlay watermarks via URL parameters. Zero code complexity, but adds a third-party dependency and cost.

For now, the CSS overlay is the right tradeoff: simple, reliable, and sufficient for the branding use case.
