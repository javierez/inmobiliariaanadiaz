import { z } from "zod";

const opSchema = z.enum(["eq", "in", "lt", "lte", "gt", "gte", "between"]);

export type DslOp = z.infer<typeof opSchema>;

const leafValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.union([z.string(), z.number(), z.boolean()])),
]);

const leafSchema = z.object({
  field: z.string().min(1),
  op: opSchema,
  value: leafValueSchema,
});

export type DslLeaf = z.infer<typeof leafSchema>;

export type DslNode = DslLeaf | { all: DslNode[] } | { any: DslNode[] };

export const dslNodeSchema: z.ZodType<DslNode> = z.lazy(() =>
  z.union([
    leafSchema,
    z.object({ all: z.array(dslNodeSchema).min(1) }),
    z.object({ any: z.array(dslNodeSchema).min(1) }),
  ]),
);

const baseCardFields = {
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().default(""),
  imageUrl: z.string().url(),
  position: z.number().int().nonnegative().optional(),
};

const listingQueryCard = z.object({
  ...baseCardFields,
  kind: z.literal("listing_query"),
  slug: z.string().min(1),
  filter: dslNodeSchema,
  ctaLabel: z.string().optional(),
});

const promotionQueryCard = z.object({
  ...baseCardFields,
  kind: z.literal("promotion_query"),
  slug: z.string().min(1),
  filter: dslNodeSchema,
  ctaLabel: z.string().optional(),
});

const promotionCard = z.object({
  ...baseCardFields,
  kind: z.literal("promotion"),
  promotionId: z.string().min(1),
  ctaLabel: z.string().optional(),
});

const staticLinkCard = z.object({
  ...baseCardFields,
  kind: z.literal("static_link"),
  href: z.string().min(1),
  ctaLabel: z.string().optional(),
});

export const promoCardSchema = z.discriminatedUnion("kind", [
  listingQueryCard,
  promotionQueryCard,
  promotionCard,
  staticLinkCard,
]);

export const promoCardsArraySchema = z.array(promoCardSchema);

export type PromoCard = z.infer<typeof promoCardSchema>;
export type ListingQueryCard = z.infer<typeof listingQueryCard>;
export type PromotionQueryCard = z.infer<typeof promotionQueryCard>;
export type PromotionCardRef = z.infer<typeof promotionCard>;
export type StaticLinkCard = z.infer<typeof staticLinkCard>;
