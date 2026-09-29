interface PlanoItem {
  id: string;
  url: string;
}

interface PropertyPlanosProps {
  planos: PlanoItem[];
}

/** A plano whose URL points at a PDF gets embedded; anything else is an image. */
function isPdfUrl(url: string): boolean {
  try {
    return new URL(url).pathname.toLowerCase().endsWith(".pdf");
  } catch {
    return url.toLowerCase().split("?")[0]?.endsWith(".pdf") ?? false;
  }
}

/**
 * Planos (floor plans) section for the property detail page.
 *
 * Why it exists: a plano used to ride in the photo carousel, which is a fixed
 * `aspect-[16/9]` box painted with `object-cover` — so a square or portrait
 * floor plan was cropped down to a horizontal strip and the agency saw its
 * plano "cortado" on the public site (feedback #691, cuenta 111). Planos get
 * their own block instead, sized `object-contain` so the whole sheet is
 * legible, with a link to open the original at full size.
 *
 * Ported from vestawebpage-v2, where this was already fixed.
 */
export function PropertyPlanos({ planos }: PropertyPlanosProps) {
  if (planos.length === 0) return null;

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">
        {planos.length === 1 ? "Plano" : "Planos"}
      </h2>
      <div className="space-y-4">
        {planos.map((plano) =>
          isPdfUrl(plano.url) ? (
            <div key={plano.id} className="space-y-2">
              <div className="h-64 w-full max-w-md overflow-hidden rounded-lg border sm:h-80">
                <iframe
                  src={plano.url}
                  title="Plano"
                  className="h-full w-full"
                />
              </div>
              <a
                href={plano.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Abrir plano en otra pestaña (PDF)
              </a>
            </div>
          ) : (
            <div key={plano.id} className="space-y-2">
              <a
                href={plano.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-64 w-full max-w-md overflow-hidden rounded-lg border bg-white sm:h-80"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={plano.url}
                  alt="Plano"
                  className="h-full w-full object-contain"
                />
              </a>
              <a
                href={plano.url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Descargar plano
              </a>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
