import { and, or, type SQL } from "drizzle-orm";
import type { DslNode, DslLeaf } from "./dsl-types";
import {
  DslError,
  ensureOp,
  lookupListingField,
  lookupPromotionField,
  type LeafBuilder,
  type LeafValue,
} from "./whitelist";

function isLeaf(node: DslNode): node is DslLeaf {
  return (node as DslLeaf).field !== undefined;
}

async function translate(
  node: DslNode,
  lookup: (field: string) => LeafBuilder,
): Promise<SQL> {
  if (isLeaf(node)) {
    const builder = lookup(node.field);
    ensureOp(node.field, node.op, builder.allowedOps);
    return await builder.build(node.op, node.value as LeafValue);
  }
  if ("all" in node) {
    const parts = await Promise.all(node.all.map((n) => translate(n, lookup)));
    const combined = and(...parts);
    if (!combined)
      throw new DslError("bad_value", "'all' must contain at least one node");
    return combined;
  }
  // "any"
  const parts = await Promise.all(node.any.map((n) => translate(n, lookup)));
  const combined = or(...parts);
  if (!combined)
    throw new DslError("bad_value", "'any' must contain at least one node");
  return combined;
}

export function translateListingDsl(node: DslNode): Promise<SQL> {
  return translate(node, lookupListingField);
}

export function translatePromotionDsl(node: DslNode): Promise<SQL> {
  return translate(node, lookupPromotionField);
}

export { DslError };
