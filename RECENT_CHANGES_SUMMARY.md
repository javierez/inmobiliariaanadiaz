# Recent Changes Summary

## What was built

A wave of polish and groundwork across the public website — better-looking property cards with smarter status pills, a simpler "list your home" wizard, multi-city search with live-narrowing filters, listing-level descriptions and titles, the "Enlaces de interés" footer page wired back up, dynamic brand colours and favicons per agency, pre-baked watermarked images served from S3, mobile-first fixes, contact-form security, and a more reliable hero video on phones.

---

### How it works

**Browsing the site (visitor's view)**

1. The visitor lands on a generated agency website. The hero plays a background video that now keeps itself running — if the phone tries to pause it (low-power mode, switching tabs, autoplay hiccups), the page silently restarts it so a play button never flashes on top of the video.
2. The navbar and footer pick up the agency's primary brand colour at 20% opacity, so each generated site looks visually distinct without needing per-site CSS edits.
3. The browser tab shows the agency's own favicon — the site generator resizes the client logo to a 32×32 PNG at build time and writes it as the site icon, falling back to the template default only if the logo can't be fetched.
4. They scroll through property cards. Each card shows a photo, a small "type" chip (Piso, Casa, etc.) in the top-left, and — only when relevant — a "Venta" or "Alquiler" chip in the top-right.
5. If a property is sold, rented, or reserved, a bold pill takes over the centre of the card: rose for *Vendido* / *Alquilado*, amber for *Reservado*. The redundant top-right status is hidden in those cases so the same word doesn't appear twice.
6. Bank-owned listings now show a single clean label — "Origen bancario" — rather than nine variants ("Piso de Banco", "Casa de Banco"…). All card text is one notch larger (xs → sm, sm → base) so addresses, descriptions, room counts, and "Ver Detalles" are easier to read on phones.
7. Reference numbers at the bottom of each card are slightly larger and easier to scan.
8. Listing descriptions on detail pages, search, and the feed now come from the *listing-level* description field. Behind the scenes, listings without their own description previously fell back to an empty property record — now they show the proper text. The same logic applies to titles: a listing-level `publishableTitle` overrides the property's title across every read.
9. Default sort order on listing pages now groups by property type (casa/piso first, then local, then everything else), then surfaces featured listings, then sorts by price descending — so the visitor always sees the most representative inventory first.
10. In the footer, the visitor can open "Enlaces de interés" again. The page reads its categories and links from the database (the column had been temporarily disabled and is now restored).

**Looking at one property**

1. The image gallery serves three image variants: a small `thumbUrl` (~400px) for cards and the thumbnail strip, and a larger watermarked URL (~1200px from `medUrl`) inside the gallery and fullscreen viewer.
2. Behind the scenes, those watermarked JPEGs are pre-baked and stored in S3 by `vesta-crm`, so the gallery, fullscreen view, slider, and Open Graph meta tags all serve the branded image directly. If a watermarked variant doesn't exist, it silently falls back to the original.
3. The fallback chain inside the gallery has been simplified — it now uses `image.url` (or a placeholder) directly, instead of trying multiple intermediate URLs that sometimes 404'd.
4. On the listing page, the title now sits on its own line, the result count is hidden on mobile, the sort control is inlined with the title (the old "Volver" button was removed), and action buttons drop to a separate row on small screens.

**Searching for a property**

1. The search bar lets the visitor pick *multiple* cities and *multiple* neighbourhoods at once. The URL captures them as `en-city1,city2` plus `barrios-id1,id2`.
2. As they tick filters (type, status, bedrooms…), the available cities and neighbourhoods update live to only show ones that still have results.
3. Behind the scenes, accent-insensitive matching means "León" and "Leon" both find the same listings (the WHERE clause resolves slug → DB variant).
4. Public-facing queries hide listings that have zero photos, so empty cards never appear.

**Listing your property (`/vender`)**

1. Where the wizard used to be six steps, it's now three: (a) contact + location, (b) property + price, (c) review.
2. On the location step, the visitor types an address and Google Places suggests Spanish-only addresses with a 300ms debounce and a 24-hour cache. Picking a suggestion auto-fills street, number, floor, door, postcode, city, and province.
3. Steps that asked for photos, characteristics, rooms, bathrooms, expenses, IBI, and rental details have been dropped to reduce friction.
4. The contact form is protected by a honeypot field and rate limiting — bots that fill the hidden field are silently dropped, and humans submitting too quickly hit a rate limit before the action runs.
5. After submitting, behind the scenes a notification email goes to the assigned agent.

**City landing pages**

1. Visiting a city URL renders a dedicated page with an intro paragraph, an FAQ block, structured data so Google can read the FAQ, and a contact panel showing the office on a map.
2. The hero on these pages picks up the right list of cities for the rotating headline — generated sites build their static `hero.ts` with a proper `string[]` derived from the agency's offices.

**Mobile fixes**

1. Hero CTA buttons now actually work on phones — they were being intercepted by decorative background "orbs" before; those are now `pointer-events-none`.
2. The mobile menu panel is full-width.
3. The "Feed" button has been renamed "Explorar" for clarity.

---

### What's in the working tree (uncommitted)

| Area | Change |
|---|---|
| Hero video | Auto-restart on pause/visibility change; iOS play-button overlay hidden via `controlsList` and CSS. |
| Listing card | *Reservado* now shown as an amber centred pill, sitting alongside *Vendido* / *Alquilado* (rose). The duplicate top-right status is hidden when a centre overlay is active. Centre pill bumped to `px-8 py-3 text-base tracking-[0.3em]`. Body text sizes increased one notch. |
| Property card | Same text-size bump (location, description, bed/bath/m², ref, "Ver Detalles"). |
| Bank-owned label | `getBankOwnedLabel()` now returns a single "Origen bancario" string regardless of property type. |
| Schema | `website_config.linksProps` column added back as nullable text. |
| Footer links query | `getLinksProps()` reads from the DB again instead of returning `[]`. |
| Generator | `data-extractor.ts` now extracts `linksProps` so generated sites get the footer links. |

---

### What each file does

| File | Think of it as... |
|---|---|
| `src/components/hero-client.tsx` | The hero stage manager — keeps the background video playing forever and hides the iOS play-button overlay. |
| `src/components/listing-card.tsx` | The shop-window display for one listing — picks the right status pill (rose for sold/rented, amber for reserved), hides duplicates, and uses larger readable text. |
| `src/components/property-card.tsx` | A simpler card variant — same readability bump as the listing card. |
| `src/components/property/image-gallery.tsx` | The photo viewer — serves pre-baked S3 watermarked JPEGs at the right size, with a clean fallback chain. |
| `src/components/property/property-media.tsx` | A new media handler — manages the thumb/med/full image variant strategy. |
| `src/lib/image-url.ts` | The address book for image variants — knows the URL pattern for thumb, med, and full versions. |
| `src/lib/data.ts` | The label dictionary — answers "what do we call a bank-owned property?" with one phrase. |
| `src/server/db/schema.ts` | The blueprint of the database — adds the `linksProps` slot, and (in earlier commits) `colorProps` for brand colours. |
| `src/server/queries/website-config.ts` | The librarian for site-wide settings — fetches the footer link categories from the database. |
| `src/server/queries/color.ts` | The brand-colour fetcher — pulls the agency's primary colour for the navbar/footer tint. |
| `src/server/queries/listings.ts` | The records department for listings — resolves listing-level title and description over property defaults, applies the new default sort, and powers multi-city search. |
| `src/server/queries/search-filters.ts`, `filters.ts` | The filter clerks — work out which cities/neighbourhoods/types remain selectable, and enforce the "must have at least one photo" rule. |
| `src/components/property-search.tsx` | The search desk — accepts multiple cities and neighbourhoods, narrows options live as filters change. |
| `src/components/search-bar.tsx` | The standalone search widget. |
| `src/components/ui/two-level-location-select.tsx` | The two-tier dropdown (city → neighbourhood) used by the search. |
| `src/components/property/property-listing-form.tsx` | The intake form for "list my home" — slimmed from six counters to three. |
| `src/components/property/form-steps/contact-location-step.tsx` | The combined step 1 — who you are *and* where the property is. |
| `src/components/property/form-steps/property-price-step.tsx` | The combined step 2 — what is it and what's it worth. |
| `src/components/property/form-steps/review-step.tsx` | The "look it over before you submit" page. |
| `src/components/property/address-autocomplete.tsx` | The address whisperer — calls Google Places, debounces typing, caches for 24h, fills the form. |
| `src/lib/google-maps-loader.ts` | The doorman for Google's Places library — loads it once, on demand. |
| `src/lib/honeypot.ts` | The bot trap — a hidden form field that real users never fill. |
| `src/lib/rate-limit.ts` | The bouncer — rejects too-frequent submissions before they reach a server action. |
| `src/server/actions/contact-form.ts` | The contact-form button handler — runs the honeypot and rate-limit checks, then sends. |
| `src/server/actions/property-inquiry.ts` | The "I'm interested in this property" button handler — same protections. |
| `src/server/actions/property-listing.ts` | The "list my home" button handler — protected, validated, and triggers the agent email. |
| `src/templates/emails/agent-lead-notification.ts` | The mail clerk — drafts the "you have a new lead" email to the assigned agent. |
| `src/components/category-panel.tsx` | The "browse by category" tile grid on the home page. |
| `src/components/navbar.tsx` | The top bar — full-width on mobile, picks up brand-colour tint, "Feed" renamed to "Explorar", "Oportunidad" link removed. |
| `src/components/footer.tsx` | The bottom bar — picks up brand-colour tint, links to the restored "Enlaces de interés" page. |
| `src/app/[...slug]/page.tsx` | The catch-all router — handles city pages, listing pages, the inlined-title-with-sort-controls layout, and other slug-driven routes. |
| `src/app/propiedades/[id]/page.tsx` | The property detail page — wires up the new media component and OG meta with the watermarked image. |
| `src/components/city/city-intro.tsx`, `city-faq.tsx`, `faq-json-ld.tsx` | The city-page furniture — intro paragraph, FAQ block, and the invisible Google-readable version of the FAQ. |
| `src/components/contact/OfficeLocationMap.tsx` | The "find us" map embedded on the city contact page. |
| `src/lib/property-slug.ts`, `src/lib/city-template.ts` | The URL-builders — turn a property or city into a tidy, SEO-friendly link. |
| `scripts/generate-site/data-extractor.ts` | The packing crew that bundles a customer's data for a generated site — now includes `linksProps`, `colorProps`, `fontProps`. |
| `scripts/generate-site/code-transformer.ts` | The site-generator's editor — rewrites generated code so static sites work without the dynamic backend; now also derives `getHeroCities` from `contactProps.offices` so static `hero.ts` builds with the correct `string[]`. |
| `scripts/generate-site/project-builder.ts` | The carpenter — assembles the generated project; now also resizes the client logo to a 32×32 PNG and writes it to `src/app/icon.png`, removing the template's default favicon. |
| `scripts/generate-site/font-definitions.ts` | The font catalogue used when a customer's site is built. |
| `scripts/generate-site/deployer.ts` | The shipping team — pushes the generated project to GitHub and Vercel. |

---

### Commits covered

| SHA | Title |
|---|---|
| `2827332` | feat: listing card refresh + schema sync + publishableTitle override |
| `1cbf930` | fix: source listing description from listings table + harden generate-site |
| `ec6261f` | feat: multi-select location search + simplified vender flow |
| `c81a09c` | feat: add Google Places autocomplete to property listing address |
| `79319bb` | fix: simplify gallery image URL fallback to use original only |
| `03ae93b` | fix: resolve lint errors for generated-site strict build |
| `0bdc5a3` | feat: pre-baked S3 watermarks, image variants, dynamic bank-owned labels |
| `3482c46` | feat(generate-site): auto-generate per-account favicon from logo |
| `8b5e9de` | fix: mobile hero buttons, listing header layout, and menu panel |
| `a6567c3` | feat: add dynamic brand colors for navbar and footer backgrounds |
| `5ecab54` | ui: remove Volver button and inline title with sort controls |
| *(working tree)* | hero video resilience, Reservado pill, larger card text, restored `linksProps` |
