import { sql, inArray, type SQL, type AnyColumn } from "drizzle-orm";
import { listings, properties, locations } from "~/server/db/schema";
import {
  normalizeSearchText,
  parseNumericQuery,
  stripReferencePrefix,
} from "~/lib/text-normalize";
import { RENT_LISTING_TYPES, SALE_LISTING_TYPES } from "~/lib/listing-types";
import { naveStoredAsLocal } from "./search-filters";

/**
 * Free-text search for the public site — ported from vesta-crm's
 * `listListings` search block (`src/server/queries/listing.ts`), adapted for a
 * site with no authenticated viewer.
 *
 * Deliberately NOT ported from the CRM version:
 *  - the `owner_contact` LATERAL join (owner name / email / phone). Owner PII
 *    must never be searchable publicly; dropping it removes the join entirely.
 *  - `listings.labels` — internal CRM tags.
 */

/**
 * Public description: the listing's own text, else the property's. Imported
 * accounts keep it only on `properties.description`; same cascade as the CRM.
 */
export const descriptionWithFallback = sql<
  string | null
>`COALESCE(NULLIF(${listings.description}, ''), ${properties.description})`;

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

/**
 * La calle que la web puede enseñar, según `fc_location_visibility` (1 exacta,
 * 2 sin número, 3 ninguna). Twin SQL de `publicStreet()` en
 * ~/lib/location-privacy. Sin esto, buscar "Calle Ancha 12" encontraba un
 * anuncio publicado "solo zona" y le confirmaba la dirección al visitante.
 */
const publicStreetSql = sql`CASE
    WHEN ${listings.fcLocationVisibility} = 3 THEN ''
    WHEN ${listings.fcLocationVisibility} = 2 THEN REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(COALESCE(${properties.street}, ''), '[[:space:],]+[0-9]{5}([^0-9].*)?$', ''),
        ',?[[:space:]]*[0-9]+[A-Za-z]?[[:space:]]*$', ''),
      '^[0-9]+[A-Za-z]?[[:space:]]*,?[[:space:]]*', '')
    ELSE COALESCE(${properties.street}, '')
  END`;

/**
 * El tipo con el nombre que usa el visitante. Los solares se anuncian como
 * "Terreno" o "Parcela" ("solar" encontraba 28 de 141) y una nave guardada
 * como local no debe salir buscando "local".
 */
const typeWords = sql`CASE
    WHEN ${properties.propertyType} = 'industrial' OR ${naveStoredAsLocal} THEN 'nave industrial'
    WHEN ${properties.propertyType} = 'solar' THEN 'solar terreno'
    ELSE COALESCE(${properties.propertyType}, '')
  END`;

// One folded haystack: lowercase + accent-stripped + punctuation-stripped, so
// it lines up exactly with what `normalizeSearchText` produces client-side.
// Incluye el subtipo ("Ático", "Chalet", "Nave industrial"): sin él, "ático"
// solo encontraba los áticos cuyo título o descripción dijera la palabra.
// Solo lo que la web enseña: el título publicado (que sustituye al interno),
// y la calle con la visibilidad del anuncio.
const HAYSTACK = sql`TRANSLATE(LOWER(unaccent(
  COALESCE(${listings.publishableTitle}, ${properties.title}, '') || ' ' ||
  ${typeWords} || ' ' ||
  COALESCE(${properties.propertySubtype}, '') || ' ' ||
  COALESCE(${descriptionWithFallback}, '') || ' ' ||
  ${publicStreetSql} || ' ' ||
  COALESCE(${properties.referenceNumber}, '') || ' ' ||
  COALESCE(${listings.idealistaReference}, '') || ' ' ||
  COALESCE(${properties.postalCode}, '') || ' ' ||
  COALESCE(${locations.city}, '') || ' ' ||
  COALESCE(${locations.municipality}, '') || ' ' ||
  COALESCE(${locations.neighborhood}, '') || ' ' ||
  COALESCE(${locations.province}, '')
)), ${PUNCT}, '')`;

/**
 * Palabras que no dicen nada del inmueble ("pisos en León", "casa con
 * piscina"). Con token-AND cada una tenía que aparecer en el anuncio. "sin" no
 * está: cambia el sentido.
 */
const STOPWORDS = new Set(
  "a al con de del e el en la las los o para por u un una unas unos y".split(
    " ",
  ),
);

/**
 * Plural → singular: "pisos" daba 0 resultados y "piso" 34, porque el anuncio
 * dice "Piso en León". Solo recorta el final, así que el resultado es un
 * prefijo de lo escrito y (con LIKE '%…%') nunca pierde anuncios que ya salían.
 */
export function singularToken(token: string): string {
  if (token.length < 5 || !token.endsWith("s") || token.endsWith("ss")) {
    return token;
  }
  // Consonante + "es": locales → local, solares → solar, almacenes → almacen.
  if (/[lrnd]es$/.test(token)) return token.slice(0, -2);
  // pisos → piso, naves → nave, garajes → garaje, chalets → chalet.
  return token.slice(0, -1);
}

/**
 * Palabras de operación → el mismo filtro que Comprar / Alquilar. Como texto,
 * "piso alquiler" exigía que el anuncio dijera "alquiler", y 58 de los 100
 * alquileres de la cuenta 137 no lo dicen. Claves ya en singular.
 */
const OPERATION_WORDS: Record<string, readonly string[]> = {
  alquiler: RENT_LISTING_TYPES,
  alquilar: RENT_LISTING_TYPES,
  venta: SALE_LISTING_TYPES,
  compra: SALE_LISTING_TYPES,
  comprar: SALE_LISTING_TYPES,
  traspaso: ["Transfer"],
};

/**
 * Los tipos van como palabra entera: "local" encontraba "localidad" y
 * "localizado" (cuenta 155: 14 resultados, 1 local). Todos salen en `typeWords`
 * como palabra suelta, así que ningún inmueble de ese tipo se pierde.
 */
const TYPE_NOUNS = new Set(
  "piso casa local nave solar terreno garaje oficina trastero edificio".split(
    " ",
  ),
);

const BEDROOM_WORDS = /^(?:habs?|habitacion(?:es)?|dorms?|dormitorios?)$/;
const BATHROOM_WORDS = /^(?:banos?|aseos?)$/;

/**
 * "3 habitaciones", "3hab", "2 baños" → ese número exacto. Como texto pedían
 * un "3" y la palabra en el anuncio: "piso 3 habitaciones" daba 4 de 21.
 */
function roomCondition(count: number, word: string | undefined): SQL | null {
  if (!word) return null;
  if (BEDROOM_WORDS.test(word)) return sql`${properties.bedrooms} = ${count}`;
  if (BATHROOM_WORDS.test(word)) {
    return sql`CAST(${properties.bathrooms} AS DECIMAL) = ${count}`;
  }
  return null;
}

/** Separa del texto libre lo que ya es un filtro: operación y habitaciones. */
function extractStructured(tokens: string[]): {
  words: string[];
  conditions: SQL[];
} {
  const words: string[] = [];
  const conditions: SQL[] = [];
  const operationTypes = new Set<string>();
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!;
    const glued = /^(\d{1,2})([a-z]+)$/.exec(token);
    const rooms = glued
      ? roomCondition(Number(glued[1]), glued[2])
      : /^\d{1,2}$/.test(token)
        ? roomCondition(Number(token), tokens[i + 1])
        : null;
    if (rooms) {
      conditions.push(rooms);
      if (!glued) i++;
      continue;
    }
    const operation = OPERATION_WORDS[singularToken(token)];
    if (operation) {
      operation.forEach((t) => operationTypes.add(t));
      continue;
    }
    words.push(token);
  }
  // "alquiler con opción a compra" suma las dos: nunca se contradicen a cero.
  if (operationTypes.size > 0) {
    conditions.push(inArray(listings.listingType, [...operationTypes]));
  }
  return { words, conditions };
}

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
  typedQuery: string | null | undefined,
): SQL | null {
  // Nothing typed at all → no text filter (show the normal listing set).
  if (!typedQuery?.trim()) return null;
  const rawQuery = stripReferencePrefix(typedQuery);

  const normalizedQuery = normalizeSearchText(rawQuery);
  const tokens = normalizedQuery.split(/\s+/).filter((t) => t.length > 0);

  // Something WAS typed, but it folded away to nothing (e.g. "---", which is
  // all punctuation). Match nothing rather than silently dropping the filter —
  // otherwise the page claims "Resultados para «---»" over the entire catalog.
  if (tokens.length === 0) return sql`false`;

  const { words, conditions } = extractStructured(tokens);

  // Solo palabras vacías ("de la") → se buscan tal cual.
  const meaningful = words.filter((t) => !STOPWORDS.has(t));
  const searchTokens = (
    meaningful.length > 0 || conditions.length > 0 ? meaningful : words
  ).map(singularToken);

  const tokenConditions = searchTokens.map((t) =>
    TYPE_NOUNS.has(t)
      ? sql`${HAYSTACK} ~ ${`\\m${t}(e?s)?\\M`}`
      : sql`${HAYSTACK} LIKE ${`%${escapeLike(t)}%`} ESCAPE '\\'`,
  );

  const orBranches: SQL[] = [
    sql`(${sql.join([...conditions, ...tokenConditions], sql` AND `)})`,
    sql`CAST(${listings.listingId} AS TEXT) LIKE ${`%${escapeLike(normalizedQuery)}%`} ESCAPE '\\'`,
  ];

  // A bare amount ("300000", "300.000€", "300k") additionally matches by price —
  // exact. The cleaned digits also drive the id match so the separators the user
  // typed don't break it.
  const numericQuery = parseNumericQuery(rawQuery);
  if (numericQuery !== null) {
    const digits = String(numericQuery);
    orBranches.push(
      // Un precio oculto ("A consultar") no se confirma buscándolo.
      sql`(${listings.fcPriceVisibility} = false AND CAST(${listings.price} AS DECIMAL) = ${numericQuery})`,
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
  const normalized = normalizeSearchText(
    stripReferencePrefix(rawQuery ?? ""),
  ).replace(/\s+/g, "");
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
