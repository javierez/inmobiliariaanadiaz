export default function SiteNavigationJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

  const items = [
    { name: "Pisos en venta", url: `${siteUrl}/venta-pisos/todas-ubicaciones` },
    { name: "Casas en venta", url: `${siteUrl}/venta-casas/todas-ubicaciones` },
    {
      name: "Locales en venta",
      url: `${siteUrl}/venta-locales/todas-ubicaciones`,
    },
    {
      name: "Terrenos en venta",
      url: `${siteUrl}/venta-solares/todas-ubicaciones`,
    },
    {
      name: "Garajes en venta",
      url: `${siteUrl}/venta-garajes/todas-ubicaciones`,
    },
    {
      name: "Pisos en alquiler",
      url: `${siteUrl}/alquiler-pisos/todas-ubicaciones`,
    },
    {
      name: "Casas en alquiler",
      url: `${siteUrl}/alquiler-casas/todas-ubicaciones`,
    },
    { name: "Vender tu propiedad", url: `${siteUrl}/vender` },
    { name: "Contacto", url: `${siteUrl}/contacto` },
    { name: "Preguntas Frecuentes", url: `${siteUrl}/faqs` },
  ];

  const jsonLd = items.map((item) => ({
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    name: item.name,
    url: item.url,
  }));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
