"use server";

import { z } from "zod";
import { getReferenceTargetPath } from "~/server/queries/reference-target";

const querySchema = z.string().trim().min(1).max(100);

/**
 * Lo llama el buscador del navbar ANTES de navegar: si el texto es la
 * referencia de un único inmueble devuelve la ruta de su ficha, y si no, null
 * (el buscador sigue entonces a la página de resultados).
 *
 * Resolverlo aquí evita el redirect() de la página de resultados durante una
 * navegación del lado del cliente, que tumba el App Router de Next ("Application
 * error" hasta que el visitante recarga).
 */
export async function resolveReferencePath(
  query: string,
): Promise<string | null> {
  const parsed = querySchema.safeParse(query);
  if (!parsed.success) return null;
  try {
    return await getReferenceTargetPath(parsed.data);
  } catch (error) {
    console.error("Error resolving reference search:", error);
    return null;
  }
}
