"use server";

import { db } from "../db";
import { websiteProperties } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { env } from "~/env";
import {
  promoCardsArraySchema,
  type PromoCard,
  type ListingQueryCard,
  type PromotionQueryCard,
} from "~/server/promo-cards/dsl-types";
import {
  translateListingDsl,
  translatePromotionDsl,
} from "~/server/promo-cards/dsl-translator";
import {
  searchListings,
  countListings,
  type ListingCardData,
} from "./listings";
import {
  searchPromotionsByPredicate,
  countPromotionsByPredicate,
  getPromotionDetail,
  type PromotionCardData,
  type PromotionDetailData,
} from "./promotions";

export const getPromoCards = cache(
  async (accountIdArg?: bigint): Promise<PromoCard[]> => {
    try {
      const accountId = accountIdArg ?? BigInt(env.NEXT_PUBLIC_ACCOUNT_ID);
      const [config] = await db
        .select({ promoCardsProps: websiteProperties.promoCardsProps })
        .from(websiteProperties)
        .where(eq(websiteProperties.accountId, accountId))
        .limit(1);

      if (!config?.promoCardsProps) return [];
      const parsed = JSON.parse(config.promoCardsProps) as unknown;
      const result = promoCardsArraySchema.safeParse(parsed);
      if (!result.success) {
        console.error("Invalid promo cards JSON:", result.error.flatten());
        return [];
      }
      return [...result.data].sort(
        (a, b) => (a.position ?? 0) - (b.position ?? 0),
      );
    } catch (error) {
      console.error("Error fetching promo cards:", error);
      return [];
    }
  },
);

export type ResolvedListingQuery = {
  kind: "listing_query";
  card: ListingQueryCard;
  listings: ListingCardData[];
  /** Resultados que cumplen el filtro, no los de esta página. */
  total: number;
};

export type ResolvedPromotionQuery = {
  kind: "promotion_query";
  card: PromotionQueryCard;
  promotions: PromotionCardData[];
  /** Resultados que cumplen el filtro, no los de esta página. */
  total: number;
};

export type ResolvedPromotion = {
  kind: "promotion";
  card: PromoCard & { kind: "promotion" };
  promotion: PromotionDetailData | null;
};

export type ResolvedStaticLink = {
  kind: "static_link";
  card: PromoCard & { kind: "static_link" };
};

export type ResolvedCard =
  | ResolvedListingQuery
  | ResolvedPromotionQuery
  | ResolvedPromotion
  | ResolvedStaticLink;

/**
 * La tarjeta que responde a este slug, sin ejecutar su consulta.
 * `generateMetadata` sólo necesita título y subtítulo, y resolver la tarjeta
 * entera le costaba una búsqueda de anuncios por cada carga de página.
 */
export async function findPromoCardBySlug(
  slug: string,
): Promise<ListingQueryCard | PromotionQueryCard | null> {
  const cards = await getPromoCards();
  const card = cards.find(
    (c) =>
      (c.kind === "listing_query" || c.kind === "promotion_query") &&
      c.slug === slug,
  );
  if (!card) return null;
  if (card.kind !== "listing_query" && card.kind !== "promotion_query") {
    return null;
  }
  return card;
}

export async function resolvePromoCardBySlug(
  slug: string,
  limit = 24,
  offset = 0,
): Promise<ResolvedCard | null> {
  const card = await findPromoCardBySlug(slug);
  if (!card) return null;

  if (card.kind === "listing_query") {
    try {
      const predicate = await translateListingDsl(card.filter);
      // El total sale del mismo predicado que la página: `countListings` acepta
      // `extraPredicate` justo para no desincronizarse de `searchListings`.
      const [results, total] = await Promise.all([
        // Sin orden explícito: la colección hereda el que configura la agencia,
        // igual que el listado. Antes forzaba `"default"` y era la única
        // superficie de inmuebles que ignoraba la configuración.
        searchListings(undefined, limit, undefined, offset, predicate),
        countListings(undefined, predicate),
      ]);
      return { kind: "listing_query", card, listings: results, total };
    } catch (e) {
      console.error("DSL translation failed for listing card", card.id, e);
      return { kind: "listing_query", card, listings: [], total: 0 };
    }
  }

  try {
    const predicate = await translatePromotionDsl(card.filter);
    const [results, total] = await Promise.all([
      searchPromotionsByPredicate(predicate, limit, offset),
      countPromotionsByPredicate(predicate),
    ]);
    return { kind: "promotion_query", card, promotions: results, total };
  } catch (e) {
    console.error("DSL translation failed for promotion card", card.id, e);
    return { kind: "promotion_query", card, promotions: [], total: 0 };
  }
}

export async function getPromotionForCard(
  promotionId: string,
): Promise<PromotionDetailData | null> {
  return getPromotionDetail(promotionId);
}
