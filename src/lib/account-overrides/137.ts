// Hardcoded brand overrides for account 137.
// Lives in code (not DB) so admin UI edits to website_config can't wipe it.
// Visual identity mirrors https://www.inmobiliariaanadiaz.es/ — a clean,
// professional ClickViviendas template: white base, gray body text, a single
// vivid orange accent (#E85D00), and Lato as the only typeface.

import type { ColorProps } from "~/lib/data";

export const ACCOUNT_137_ID = "137";

export function isAccount137(): boolean {
  return process.env.NEXT_PUBLIC_ACCOUNT_ID === ACCOUNT_137_ID;
}

// secondaryColor → `--brand` (buttons, accents); primaryColor → navbar tint.
// Both set to the reference site's signature orange so the brand reads as one
// accent across the whole site.
export const ACCOUNT_137_COLORS: ColorProps = {
  primaryColor: "#E85D00",
  secondaryColor: "#E85D00",
};

// NOTE: the typeface is NOT pinned here. Unlike colours, the font is driven by
// the DB website_config (font_props) so it can be tuned without a deploy. For
// account 137 it is set to Playfair Display for both body and headings, matching
// the reference property page (gilmar.es). See src/app/layout.tsx.

// On the reference site the property price is rendered in bold green over the
// photo — the second accent alongside the orange. Fed into the `--price` CSS
// var in the root layout and consumed by `text-price` on price elements.
// Uses the same deep forest green as the nav links for a consistent accent.
export const ACCOUNT_137_PRICE_COLOR = "#0b3d1f";

// Navbar link styling for account 137: bold, deep-green links so the top nav
// reads strongly against the white bar. Consumed in src/components/navbar.tsx
// (desktop nav) behind an isAccount137() check, so no other site is affected.
export const ACCOUNT_137_NAV_LINK_COLOR = "#0b3d1f";
