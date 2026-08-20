import { sql, eq, inArray, gte, lte, gt, lt, and, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import {
  listings,
  properties,
  locations,
  promotions,
} from "~/server/db/schema";
import type { DslOp } from "./dsl-types";

export class DslError extends Error {
  constructor(
    public readonly code: "unknown_field" | "unauthorized_op" | "bad_value",
    message: string,
  ) {
    super(message);
    this.name = "DslError";
  }
}

export type LeafValue =
  | string
  | number
  | boolean
  | (string | number | boolean)[];

// A leaf builder takes (op, value) and returns a Drizzle SQL predicate.
// It is responsible for type coercion and op-validation against its own allowedOps.
export type LeafBuilder = {
  allowedOps: ReadonlySet<DslOp>;
  // Async because some builders (city/province) need to resolve slugs against the DB.
  build: (op: DslOp, value: LeafValue) => Promise<SQL> | SQL;
};

function ensureOp(field: string, op: DslOp, allowed: ReadonlySet<DslOp>): void {
  if (!allowed.has(op)) {
    throw new DslError(
      "unauthorized_op",
      `Op '${op}' not allowed on field '${field}'. Allowed: ${[...allowed].join(", ")}`,
    );
  }
}

function asString(field: string, v: LeafValue): string {
  if (typeof v !== "string")
    throw new DslError(
      "bad_value",
      `Field '${field}' expects string, got ${typeof v}`,
    );
  return v;
}

function asNumber(field: string, v: LeafValue): number {
  if (typeof v !== "number" || Number.isNaN(v))
    throw new DslError("bad_value", `Field '${field}' expects number`);
  return v;
}

function asBoolean(field: string, v: LeafValue): boolean {
  if (typeof v !== "boolean")
    throw new DslError("bad_value", `Field '${field}' expects boolean`);
  return v;
}

function asArray<T extends "string" | "number">(
  field: string,
  v: LeafValue,
  kind: T,
): (T extends "string" ? string : number)[] {
  if (!Array.isArray(v))
    throw new DslError("bad_value", `Field '${field}' expects array`);
  for (const item of v) {
    if (typeof item !== kind)
      throw new DslError(
        "bad_value",
        `Field '${field}' array items must be ${kind}`,
      );
  }
  return v as (T extends "string" ? string : number)[];
}

const enumBuilder = (
  field: string,
  column: AnyPgColumn,
  allowedValues: readonly string[],
): LeafBuilder => ({
  allowedOps: new Set<DslOp>(["eq", "in"]),
  build: (op, value) => {
    if (op === "eq") {
      const v = asString(field, value);
      if (!allowedValues.includes(v))
        throw new DslError(
          "bad_value",
          `'${v}' not in allowed values for '${field}'`,
        );
      return eq(column, v);
    }
    const arr = asArray(field, value, "string");
    for (const v of arr) {
      if (!allowedValues.includes(v))
        throw new DslError(
          "bad_value",
          `'${v}' not in allowed values for '${field}'`,
        );
    }
    return inArray(column, arr);
  },
});

const booleanBuilder = (column: AnyPgColumn): LeafBuilder => ({
  allowedOps: new Set<DslOp>(["eq"]),
  build: (op, value) => {
    if (op !== "eq")
      throw new DslError("unauthorized_op", `boolean fields only allow 'eq'`);
    return eq(column, asBoolean("(boolean)", value));
  },
});

const integerRangeBuilder = (
  field: string,
  column: AnyPgColumn,
): LeafBuilder => ({
  allowedOps: new Set<DslOp>(["eq", "lt", "lte", "gt", "gte", "between"]),
  build: (op, value) => {
    if (op === "between") {
      const arr = asArray(field, value, "number");
      if (arr.length !== 2)
        throw new DslError(
          "bad_value",
          `'between' on '${field}' expects [min, max]`,
        );
      return and(gte(column, arr[0]!), lte(column, arr[1]!))!;
    }
    const n = asNumber(field, value);
    switch (op) {
      case "eq":
        return eq(column, n);
      case "lt":
        return lt(column, n);
      case "lte":
        return lte(column, n);
      case "gt":
        return gt(column, n);
      case "gte":
        return gte(column, n);
      default:
        throw new DslError(
          "unauthorized_op",
          `op '${op}' invalid on '${field}'`,
        );
    }
  },
});

// Decimal columns stored as strings — must CAST to compare numerically.
const decimalRangeBuilder = (
  field: string,
  column: AnyPgColumn,
): LeafBuilder => ({
  allowedOps: new Set<DslOp>(["eq", "lt", "lte", "gt", "gte", "between"]),
  build: (op, value) => {
    if (op === "between") {
      const arr = asArray(field, value, "number");
      if (arr.length !== 2)
        throw new DslError(
          "bad_value",
          `'between' on '${field}' expects [min, max]`,
        );
      return sql`CAST(${column} AS DECIMAL) BETWEEN ${arr[0]} AND ${arr[1]}`;
    }
    const n = asNumber(field, value);
    switch (op) {
      case "eq":
        return sql`CAST(${column} AS DECIMAL) = ${n}`;
      case "lt":
        return sql`CAST(${column} AS DECIMAL) < ${n}`;
      case "lte":
        return sql`CAST(${column} AS DECIMAL) <= ${n}`;
      case "gt":
        return sql`CAST(${column} AS DECIMAL) > ${n}`;
      case "gte":
        return sql`CAST(${column} AS DECIMAL) >= ${n}`;
      default:
        throw new DslError(
          "unauthorized_op",
          `op '${op}' invalid on '${field}'`,
        );
    }
  },
});

// ─── LISTING DSL FIELDS ────────────────────────────────────────────────
// Mirrors SearchFilters in src/server/queries/search-filters.ts plus a few
// extras that the existing SearchFilters didn't expose (e.g. listingType
// directly). Add fields by appending here — that's the only line needed.
export const LISTING_FIELDS: Readonly<Record<string, LeafBuilder>> = {
  // Booleans
  isOpportunity: booleanBuilder(listings.isOpportunity),
  isBankOwned: booleanBuilder(listings.isBankOwned),
  isFeatured: booleanBuilder(listings.isFeatured),
  // Enums
  propertyType: enumBuilder("propertyType", properties.propertyType, [
    "piso",
    "casa",
    "local",
    "solar",
    "garaje",
    "edificio",
    "oficina",
    "industrial",
    "trastero",
  ]),
  listingType: enumBuilder("listingType", listings.listingType, [
    "Sale",
    "Rent",
    "RentWithOption",
  ]),
  status: enumBuilder("status", listings.status, [
    "En Venta",
    "En Alquiler",
    "Vendido",
    "Alquilado",
    "Reservado",
  ]),
  // Numeric ranges
  bedrooms: integerRangeBuilder("bedrooms", properties.bedrooms),
  squareMeter: integerRangeBuilder("squareMeter", properties.squareMeter),
  price: decimalRangeBuilder("price", listings.price),
  bathrooms: decimalRangeBuilder("bathrooms", properties.bathrooms),
  // Location — leaf builders that resolve slugs/values against locations table.
  city: {
    allowedOps: new Set<DslOp>(["eq", "in"]),
    build: (op, value) => {
      if (op === "eq") {
        const v = asString("city", value);
        return eq(locations.city, v);
      }
      const arr = asArray("city", value, "string");
      return inArray(locations.city, arr);
    },
  },
  province: {
    allowedOps: new Set<DslOp>(["eq", "in"]),
    build: (op, value) => {
      if (op === "eq") {
        const v = asString("province", value);
        return eq(locations.province, v);
      }
      const arr = asArray("province", value, "string");
      return inArray(locations.province, arr);
    },
  },
  neighborhoodId: {
    allowedOps: new Set<DslOp>(["eq", "in"]),
    build: (op, value) => {
      if (op === "eq") {
        const v = asString("neighborhoodId", value);
        return eq(locations.neighborhoodId, BigInt(v));
      }
      const arr = asArray("neighborhoodId", value, "string");
      return inArray(
        locations.neighborhoodId,
        arr.map((x) => BigInt(x)),
      );
    },
  },
  // Property-level booleans surfaced at listing scope (joins via listings.propertyId)
  hasPool: booleanBuilder(properties.pool),
  hasGarden: booleanBuilder(properties.garden),
  hasGarage: booleanBuilder(properties.hasGarage),
  hasElevator: booleanBuilder(properties.hasElevator),
  hasStorageRoom: booleanBuilder(properties.hasStorageRoom),
  hasHeating: booleanBuilder(properties.hasHeating),
  isFurnished: booleanBuilder(listings.isFurnished),
  // Property-level numeric ranges
  yearBuilt: integerRangeBuilder("yearBuilt", properties.yearBuilt),
  conservationStatus: integerRangeBuilder(
    "conservationStatus",
    properties.conservationStatus,
  ),
  // Property-level enums
  orientation: enumBuilder("orientation", properties.orientation, [
    "N",
    "NE",
    "E",
    "SE",
    "S",
    "SW",
    "W",
    "NW",
  ]),
  energyConsumptionScale: enumBuilder(
    "energyConsumptionScale",
    properties.energyConsumptionScale,
    ["A", "B", "C", "D", "E", "F", "G"],
  ),
  // Free-form CRM tags (listings.labels, a jsonb string array). `eq` matches a
  // single tag, `in` matches "has any of these tags". Comparison is
  // case-insensitive so "Parcelas" set in the CRM matches "parcelas" here.
  // Rows whose labels are null or not an array simply don't match.
  labels: {
    allowedOps: new Set<DslOp>(["eq", "in"]),
    build: (op, value) => {
      const wanted = (
        op === "eq"
          ? [asString("labels", value)]
          : asArray("labels", value, "string")
      ).map((v) => v.toLowerCase());
      if (wanted.length === 0)
        throw new DslError(
          "bad_value",
          `Field 'labels' expects at least one tag`,
        );
      const list = sql.join(
        wanted.map((w) => sql`${w}`),
        sql`, `,
      );
      return sql`EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(
          CASE WHEN jsonb_typeof(${listings.labels}) = 'array'
               THEN ${listings.labels} ELSE '[]'::jsonb END
        ) AS lbl
        WHERE lower(lbl) IN (${list})
      )`;
    },
  },
  // Promotion link
  promotionId: {
    allowedOps: new Set<DslOp>(["eq"]),
    build: (op, value) => {
      if (op !== "eq")
        throw new DslError("unauthorized_op", `'promotionId' only allows eq`);
      const v = asString("promotionId", value);
      return eq(listings.promotionId, BigInt(v));
    },
  },
};

// ─── PROMOTION DSL FIELDS ──────────────────────────────────────────────
export const PROMOTION_FIELDS: Readonly<Record<string, LeafBuilder>> = {
  newDevelopmentType: enumBuilder(
    "newDevelopmentType",
    promotions.newDevelopmentType,
    ["new_building", "restored_building", "house", "mixed_promos"],
  ),
  forSale: booleanBuilder(promotions.forSale),
  forRent: booleanBuilder(promotions.forRent),
  finished: booleanBuilder(promotions.finished),
  hasPool: booleanBuilder(promotions.hasPool),
  hasGarden: booleanBuilder(promotions.hasGarden),
  hasLift: booleanBuilder(promotions.hasLift),
  hasSecurityDoor: booleanBuilder(promotions.hasSecurityDoor),
  hasSecurityAlarm: booleanBuilder(promotions.hasSecurityAlarm),
  hasDoorman: booleanBuilder(promotions.hasDoorman),
  energyCertificateRating: enumBuilder(
    "energyCertificateRating",
    promotions.energyCertificateRating,
    ["A", "B", "C", "D", "E", "F", "G"],
  ),
  builtPhase: enumBuilder("builtPhase", promotions.builtPhase, [
    "land_move",
    "foundation",
    "carpentry",
    "pilot",
    "paving",
    "equipment",
    "keydelivery",
  ]),
};

export function lookupListingField(field: string): LeafBuilder {
  const b = LISTING_FIELDS[field];
  if (!b)
    throw new DslError("unknown_field", `Unknown listing field '${field}'`);
  return b;
}

export function lookupPromotionField(field: string): LeafBuilder {
  const b = PROMOTION_FIELDS[field];
  if (!b)
    throw new DslError("unknown_field", `Unknown promotion field '${field}'`);
  return b;
}

export { ensureOp };
