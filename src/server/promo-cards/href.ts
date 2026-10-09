import type { PromoCard } from "./dsl-types";

export function hrefForCard(card: PromoCard): string {
  switch (card.kind) {
    case "listing_query":
    case "promotion_query":
      return `/coleccion/${card.slug}`;
    case "promotion":
      return `/promociones/${card.promotionId}`;
    case "static_link":
      return card.href;
  }
}
