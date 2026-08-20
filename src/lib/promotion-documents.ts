/**
 * Los PDFs que la agencia cuelga de una promoción desde el CRM: filas de
 * `documents` con `promotion_id`, etiquetadas con un `document_tag`.
 *
 * Las etiquetas las fija el CRM. Si aparece una que aquí no se conoce, sale
 * como "Documento" en vez de romper la página.
 */

export interface PromotionDocument {
  /** El `document_tag` de la fila. */
  tag: string;
  url: string;
  /** `documents.filename` — el nombre real, ya no hay que sacarlo del s3Key. */
  filename: string;
}

/**
 * Las ÚNICAS etiquetas que se publican. El filtro real va en SQL (ver
 * `promotions.ts`); esta constante es su fuente.
 *
 * 🚨 Una nota simple del solar lleva nombre y DNI del propietario, y una
 * licencia de obra es papeleo interno del promotor. Que el CRM permita colgar
 * más tipos de una promoción no significa que salgan aquí.
 */
export const PUBLIC_PROMOTION_DOCUMENT_TAGS = [
  "memoria-calidades",
  "dossier-informativo",
] as const;

const LABELS: Record<string, string> = {
  "memoria-calidades": "Memoria de calidades",
  "dossier-informativo": "Dossier informativo",
};

export function promotionDocumentLabel(tag: string): string {
  return LABELS[tag] ?? "Documento";
}

/**
 * Ordena y descarta lo que no se puede pintar. Un documento sin `url` es una
 * fila a medio escribir, y enseñarlo daría un enlace a ninguna parte.
 *
 * La memoria primero: es la que pregunta el comprador.
 */
export function sortPromotionDocuments(
  documents: PromotionDocument[] | null | undefined,
): PromotionDocument[] {
  if (!documents) return [];
  const order: readonly string[] = PUBLIC_PROMOTION_DOCUMENT_TAGS;
  return documents
    .filter((doc) => typeof doc?.url === "string" && doc.url.length > 0)
    .sort((a, b) => {
      const ia = order.indexOf(a.tag);
      const ib = order.indexOf(b.tag);
      return (ia === -1 ? order.length : ia) - (ib === -1 ? order.length : ib);
    });
}
