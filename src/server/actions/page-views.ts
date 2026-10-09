"use server";

import { headers } from "next/headers";
import { sql } from "drizzle-orm";

import { db } from "~/server/db";
import { env } from "~/env";
import { parsePropertySlug } from "~/lib/property-slug";

const ACCOUNT_ID = BigInt(env.NEXT_PUBLIC_ACCOUNT_ID);

// Googlebot y compañía ejecutan JavaScript: sin esto, cada rastreo sería una
// visita más en las cifras que la agencia enseña al propietario.
const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse/i;

// Herramientas internas de la web, no páginas que visite un cliente.
const NO_CUENTA = /^\/(api|preview|sandbox|generador-sitios|_next)(\/|$)/;

const HOY = sql`(now() AT TIME ZONE 'Europe/Madrid')::date`;

/**
 * Suma una visita a una página de la web. El CRM lee estas tablas para contar
 * las visualizaciones; esta web solo escribe.
 *
 * · `web_page_views`: toda página, una fila por página y día (hora peninsular).
 * · `listing_web_views`: además, si es la ficha de un inmueble, una fila por
 *   inmueble y día. Va por id y no por ruta porque el slug cambia con el
 *   título. La fila solo nace si el inmueble es de esta cuenta y está
 *   publicado en la web.
 *
 * Se llama desde el navegador con la página ya pintada, no durante el render:
 * las páginas van con ISR, así que contar en el servidor sumaría una visita
 * por regeneración en vez de una por persona.
 *
 * No se suma en `listings.view_count`: cada UPDATE de `listings` sella
 * `updated_at`, que el sitemap publica como `lastModified`. Cada visita
 * marcaría el inmueble como recién modificado.
 *
 * El `views + 1` va en la propia sentencia para que dos visitas a la vez no
 * se pisen. Devuelve si contó, para que el navegador no la apunte si falló.
 */
export async function registerPageView(pathname: string): Promise<boolean> {
  if (typeof pathname !== "string" || !pathname.startsWith("/")) return false;
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (path.length > 300 || NO_CUENTA.test(path)) return false;

  try {
    const userAgent = (await headers()).get("user-agent");
    if (!userAgent || BOT.test(userAgent)) return false;

    const ficha = /^\/propiedades\/([^/]+)$/.exec(path);
    const listingId = ficha ? parsePropertySlug(ficha[1]!)?.id : undefined;

    await Promise.all([
      db.execute(sql`
        INSERT INTO web_page_views (account_id, day, path, views)
        VALUES (${ACCOUNT_ID}, ${HOY}, ${path}, 1)
        ON CONFLICT (account_id, day, path)
        DO UPDATE SET views = web_page_views.views + 1
      `),
      listingId &&
        db.execute(sql`
          INSERT INTO listing_web_views (listing_id, account_id, day, views)
          SELECT listing_id, account_id, ${HOY}, 1
          FROM listings
          WHERE listing_id = ${listingId}
            AND account_id = ${ACCOUNT_ID}
            AND is_active = true
            AND publish_to_website = true
          ON CONFLICT (listing_id, day)
          DO UPDATE SET views = listing_web_views.views + 1
        `),
    ]);
    return true;
  } catch (error) {
    console.error("Error registering page view:", error);
    return false;
  }
}
