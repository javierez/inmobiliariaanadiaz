-- Add banner_props column to website_config
-- Nullable JSON string holding a BannerProps object (see src/lib/data.ts).
-- Shape (discriminated on "kind"):
--   {"kind":"none"}                                              → banner hidden
--   {"kind":"custom","title":..,"subtitle":..,"backgroundImage":..,"ctaLabel":..,"ctaHref":..}
--   {"kind":"promotion","promotionId":".."}                      → feature a promoción
--   {"kind":"listing","listingId":".."}                          → feature a listing
-- NULL or {"kind":"none"} → banner is not rendered. This is the default for
-- every account, so the homepage is unchanged until a banner is configured.
-- Safe to run: additive, nullable, no default backfill required.

ALTER TABLE website_config
  ADD COLUMN IF NOT EXISTS banner_props TEXT;

-- Example: feature an existing promoción on one account's homepage
-- UPDATE website_config
--   SET banner_props = '{"kind":"promotion","promotionId":"123","ctaLabel":"Descúbrela"}'
--   WHERE account_id = 2251799813685249;
