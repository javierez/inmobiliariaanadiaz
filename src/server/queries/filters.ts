import { sql } from "drizzle-orm";
import type { AnyColumn, SQL } from "drizzle-orm";

// Excludes properties with zero photos from every public-facing query.
// Photo = active image whose tag isn't a tour/youtube/video.
export function hasAtLeastOnePhoto(propertyIdColumn: AnyColumn): SQL {
  return sql`EXISTS (
    SELECT 1 FROM property_images
    WHERE property_images.property_id = ${propertyIdColumn}
      AND property_images.is_active = true
      AND (property_images.image_tag IS NULL OR property_images.image_tag NOT IN ('tour', 'youtube', 'video'))
  )`;
}

/**
 * El único filtro de "¿puede un visitante ver este anuncio?" por estado.
 *
 * Draft y Descartado no se muestran nunca. Vendido y Alquilado se muestran
 * mientras estén dentro de la ventana de escaparate que configura la agencia
 * (`website_config.properties_props.soldVisibilityDays`): una pared de sellos
 * "Vendido" es publicidad, y las agencias la piden. `soldWindowDays = 0` —el
 * valor por defecto— los esconde en cuanto se cierran.
 *
 * La cuenta va contra `listings.closed_at`, que estampan las rutas de cierre
 * del CRM. Antes iba contra `updated_at` y eso convertía la regla en una
 * lotería: cualquier edición, o un script masivo, reiniciaba el contador de
 * todos los vendidos a la vez. `closed_at` NULL (todo lo cerrado antes de la
 * migración 0305) no entra nunca: falla cerrado a propósito, para que activar
 * esto no resucite el histórico de ventas de golpe.
 *
 * Esta función existe porque la regla estaba copiada en cuatro sitios entre los
 * dos proyectos de web y en un quinto —la ficha de detalle— faltaba por
 * completo, así que un vendido seguía teniendo página propia para siempre.
 */
export function visibleStatusCondition(soldWindowDays: number): SQL {
  const days = Number.isFinite(soldWindowDays)
    ? Math.min(365, Math.max(0, Math.trunc(soldWindowDays)))
    : 0;

  if (days === 0) {
    return sql`listings.status NOT IN ('Draft', 'Descartado', 'Vendido', 'Alquilado')`;
  }

  return sql`(
    listings.status NOT IN ('Draft', 'Descartado', 'Vendido', 'Alquilado')
    OR (
      listings.status IN ('Vendido', 'Alquilado')
      AND listings.closed_at IS NOT NULL
      AND listings.closed_at >= NOW() - make_interval(days => ${days}::int)
    )
  )`;
}
