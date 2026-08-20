import type { MetadataRoute } from "next";
import { getSEOConfig } from "~/server/queries/website-config";
import { getLogo } from "~/server/queries/logo";
import { getColorProps } from "~/server/queries/color";
import { isAccount137, ACCOUNT_137_COLORS } from "~/lib/account-overrides/137";

export const revalidate = 3600;

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const [seo, logo, colorProps] = await Promise.all([
    getSEOConfig(),
    getLogo(),
    getColorProps(),
  ]);

  const name = seo.name || seo.ogSiteName || seo.title || "Inmobiliaria";
  const shortName = name.slice(0, 24);
  const description =
    seo.description ||
    seo.ogDescription ||
    "Propiedades en las mejores ubicaciones";

  const themeColor =
    (isAccount137() ? ACCOUNT_137_COLORS : colorProps)?.primaryColor ??
    "#000000";

  const icon = logo || seo.image || seo.ogImage || "/favicon.ico";
  const iconType = icon.endsWith(".svg")
    ? "image/svg+xml"
    : icon.endsWith(".png")
      ? "image/png"
      : icon.endsWith(".ico")
        ? "image/x-icon"
        : "image/png";

  return {
    name,
    short_name: shortName,
    description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: themeColor,
    icons: [
      {
        src: icon,
        sizes: "any",
        type: iconType,
      },
    ],
  };
}
