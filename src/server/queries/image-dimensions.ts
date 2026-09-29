"use server";

import sharp from "sharp";

/**
 * Cuánto mide de verdad una imagen, para poder maquetar con su forma.
 *
 * Sin esto una rejilla "tipo Pinterest" es imposible: hay que reservar el alto
 * de cada hueco ANTES de pintar, y `promotion_images` no guarda ancho ni alto.
 * Medirlo en el navegador al cargar llega tarde — la página daría un salto.
 *
 * No se descarga la imagen entera: basta la cabecera. Se piden los primeros
 * 128 KB con `Range` y `sharp` lee de ahí el ancho y el alto. Una foto de 3 MB
 * cuesta lo mismo que una miniatura.
 */

const HEADER_BYTES = 128 * 1024;
const TIMEOUT_MS = 4000;

/**
 * Las URL de S3 llevan un sufijo aleatorio y no se reescriben nunca, así que
 * una vez medida una imagen el resultado vale para siempre. La caché vive en el
 * módulo (sobrevive entre peticiones del mismo servidor) con un tope para que
 * un sitio con miles de fotos no se coma la memoria.
 */
const CACHE_LIMIT = 2000;
const cache = new Map<string, number | null>();

function remember(url: string, aspect: number | null): number | null {
  if (cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(url, aspect);
  return aspect;
}

/** Ancho / alto. `null` si no se ha podido averiguar. */
async function measure(url: string): Promise<number | null> {
  const cached = cache.get(url);
  if (cached !== undefined) return cached;

  try {
    const res = await fetch(url, {
      headers: { Range: `bytes=0-${HEADER_BYTES - 1}` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "force-cache",
    });
    if (!res.ok) return remember(url, null);

    const buf = Buffer.from(await res.arrayBuffer());
    const { width, height } = await sharp(buf).metadata();
    if (!width || !height) return remember(url, null);

    return remember(url, width / height);
  } catch {
    // Una imagen que no se deja medir no puede tumbar la página: el que llama
    // se queda con su proporción por defecto.
    return remember(url, null);
  }
}

/** Mide un lote en paralelo y devuelve un mapa `url → ancho/alto`. */
export async function getImageAspects(
  urls: string[],
): Promise<Map<string, number>> {
  const unique = [...new Set(urls)];
  const results = await Promise.all(
    unique.map(async (url) => [url, await measure(url)] as const),
  );

  const map = new Map<string, number>();
  for (const [url, aspect] of results) {
    if (aspect && Number.isFinite(aspect) && aspect > 0) map.set(url, aspect);
  }
  return map;
}
