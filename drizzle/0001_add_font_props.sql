-- Add font_props column to website_config
-- Nullable JSON string: { "sansFamily": <FontFamilyKey>, "headingFamily"?: <FontFamilyKey> }
-- See src/lib/data.ts → FontFamilyKey for the allowed values (35 keys).
-- Safe to run: additive, nullable, no default backfill required.

ALTER TABLE website_config
  ADD COLUMN IF NOT EXISTS font_props TEXT;

-- Example: set Poppins body + Playfair headings for one account
-- UPDATE website_config
--   SET font_props = '{"sansFamily":"poppins","headingFamily":"playfair"}'
--   WHERE account_id = 2251799813685249;
