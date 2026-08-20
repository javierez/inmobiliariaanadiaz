import { sql, type SQL, type AnyColumn } from "drizzle-orm";
import { listings, properties, locations } from "~/server/db/schema";
import { normalizeSearchText, parseNumericQuery } from "~/lib/text-normalize";

/**
 * Free-text search for the public site — ported from vesta-crm's
 * `listListings` search block (`src/server/queries/listing.ts`), adapted for a
 * site with no authenticated viewer.
 *
 * Deliberately NOT ported from the CRM version:
 *  - the `owner_contact` LATERAL join (owner name / email / phone). Owner PII
 *    must never be searchable publicly; dropping it removes the join entirely.
 *  - `listings.labels` — internal CRM tags.
 *  - `properties.description` — never selected by any public query (only
 *    `listings.description` is exposed), so matching on it would let visitors
 *    probe internal notes by substring.
 */

// Punctuation deleted from BOTH sides of the comparison. This must mirror the
// `[.,\-'"`()]` class in `normalizeSearchText`, otherwise the two disagree and
// references drift: the user copies "Ref. PA-1023" off a card, JS folds it to
// "pa1023", but the stored value is still "PA-1023" and nothing matches.
// `TRANSLATE(x, chars, '')` deletes every listed character.
const PUNCT = ".,-'\"`()";

/**
 * Escape LIKE metacharacters so a typed "%" or "_" is matched literally instead
 * of acting as a wildcard. Without this, searching "%" returns every listing,
 * and "100%" or "PIS_01" silently match far more than they should. Pairs with
 * an explicit `ESCAPE '\'` clause on each LIKE.
 */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

// One folded haystack: lowercase + accent-stripped + punctuation-stripped, so
// it lines up exactly with what `normalizeSearchText` produces client-side.
const HAYSTACK = sql`TRANSLATE(LOWER(unaccent(
  COALESCE(${listings.publishableTitle}, '') || ' ' ||
  COALESCE(${properties.title}, '') || ' ' ||
  COALESCE(${listings.description}, '') || ' ' ||
  COALESCE(${properties.street}, '') || ' ' ||
  COALESCE(${properties.referenceNumber}, '') || ' ' ||
  COALESCE(${listings.idealistaReference}, '') || ' ' ||
  COALESCE(${properties.postalCode}, '') || ' ' ||
  COALESCE(${locations.city}, '') || ' ' ||
  COALESCE(${locations.municipality}, '') || ' ' ||
  COALESCE(${locations.neighborhood}, '') || ' ' ||
  COALESCE(${locations.province}, '')
)), ${PUNCT}, '')`;

/**
 * Build the WHERE condition for a free-text query, or null when the query is
 * empty (caller should then apply no text filter at all).
 *
 * Semantics: every whitespace-separated token must appear somewhere in the
 * folded haystack (token-AND). A single `%full query%` substring would fail the
 * moment the user's words aren't contiguous in the data — "trastero bilbao"
 * would miss "TRASTERO EN AMOREBIETA, BILBAO", and "Puebla Lillo" would miss
 * "Puebla de Lillo". Token-AND handles both, and word order stops mattering.
 *
 * OR'd with the numeric shapes that don't fit a text haystack: the listing id,
 * and — only when the whole query is a bare amount — an exact price match.
 */
export function buildTextSearchCondition(
  rawQuery: string | null | undefined,
): SQL | null {
  // Nothing typed at all → no text filter (show the normal listing set).
  if (!rawQuery?.trim()) return null;

  const normalizedQuery = normalizeSearchText(rawQuery);
  const tokens = normalizedQuery.split(/\s+/).filter((t) => t.length > 0);

  // Something WAS typed, but it folded away to nothing (e.g. "---", which is
  // all punctuation). Match nothing rather than silently dropping the filter —
  // otherwise the page claims "Resultados para «---»" over the entire catalog.
  if (tokens.length === 0) return sql`false`;

  const tokenConditions = tokens.map(
    (t) => sql`${HAYSTACK} LIKE ${`%${escapeLike(t)}%`} ESCAPE '\\'`,
  );

  const orBranches: SQL[] = [
    sql`(${sql.join(tokenConditions, sql` AND `)})`,
    sql`CAST(${listings.listingId} AS TEXT) LIKE ${`%${escapeLike(normalizedQuery)}%`} ESCAPE '\\'`,
  ];

  // A bare amount ("300000", "300.000€", "300k") additionally matches by price —
  // exact. The cleaned digits also drive the id match so the separators the user
  // typed don't break it.
  const numericQuery = parseNumericQuery(rawQuery);
  if (numericQuery !== null) {
    const digits = String(numericQuery);
    orBranches.push(
      sql`CAST(${listings.price} AS DECIMAL) = ${numericQuery}`,
      sql`CAST(${listings.listingId} AS TEXT) LIKE ${`%${digits}%`}`,
    );
  }

  return sql`(${sql.join(orBranches, sql` OR `)})`;
}

/**
 * Exact-reference match, used by the results page to jump straight to a
 * property when the visitor pastes a reference. Equality (not LIKE) against the
 * three identifiers a visitor could plausibly be holding, all punctuation-folded
 * so "PA-1023", "pa 1023" and "pa1023" agree.
 *
 * Returns a condition, or null when the query can't be a reference.
 */
export function buildExactReferenceCondition(
  rawQuery: string | null | undefined,
): SQL | null {
  const normalized = normalizeSearchText(rawQuery).replace(/\s+/g, "");
  if (!normalized) return null;

  // Same punctuation as the haystack PLUS the space, so a stored "PA 1023"
  // still equals a typed "PA-1023". The haystack itself must never delete
  // spaces — they're what separate its tokens.
  const fold = (col: AnyColumn) =>
    sql`TRANSLATE(LOWER(unaccent(COALESCE(${col}, ''))), ${PUNCT + " "}, '')`;

  const branches: SQL[] = [
    sql`${fold(listings.idealistaReference)} = ${normalized}`,
    sql`${fold(properties.referenceNumber)} = ${normalized}`,
  ];

  // listing_id is numeric — only compare when the query is all digits.
  if (/^\d+$/.test(normalized)) {
    branches.push(sql`CAST(${listings.listingId} AS TEXT) = ${normalized}`);
  }

  return sql`(${sql.join(branches, sql` OR `)})`;
}
