import { FileText } from "lucide-react";
import {
  promotionDocumentLabel,
  sortPromotionDocuments,
  type PromotionDocument,
} from "~/lib/promotion-documents";

interface PromotionDocumentsProps {
  documents: PromotionDocument[] | null | undefined;
  /**
   * Nombre de la promoción. Se enseña en la ficha de una unidad, donde el
   * visitante necesita saber que el PDF es del edificio y no de ese piso; en
   * la ficha de la promoción sobra y se omite.
   */
  promotionName?: string | null;
}

/**
 * Bloque de descarga de los PDFs de la promoción (memoria de calidades,
 * dossier informativo).
 *
 * Se pinta tanto en la página de la promoción como en la de cada unidad
 * enlazada: la memoria describe el edificio entero, así que la agencia la sube
 * una vez y las N unidades la enseñan. Sin documentos no hay bloque — nada de
 * secciones vacías.
 */
export function PromotionDocuments({
  documents,
  promotionName,
}: PromotionDocumentsProps) {
  const docs = sortPromotionDocuments(documents);
  if (docs.length === 0) return null;

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Documentación</h2>
      <ul className="space-y-3">
        {docs.map((doc) => (
          <li key={doc.url}>
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex max-w-md items-center gap-4 rounded-lg border p-4 transition-colors hover:border-primary/40"
            >
              <FileText className="h-6 w-6 flex-shrink-0 text-primary" />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{doc.filename}</span>
                <span className="block text-sm text-muted-foreground">
                  {promotionDocumentLabel(doc.tag)}
                </span>
                {!!promotionName && (
                  <span className="block text-sm text-muted-foreground">
                    Promoción {promotionName}
                  </span>
                )}
              </span>
              <span className="flex-shrink-0 text-sm font-medium text-primary">
                Descargar
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
