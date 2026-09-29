import { buildPropertySlug } from "~/lib/property-slug";
import { showsRooms } from "~/lib/property-rooms";
import { isClosedStatus } from "~/lib/utils";

interface PropertyJsonLdProps {
  property: {
    listingId: string;
    title: string | null;
    description: string | null;
    propertyType: string | null;
    propertySubtype?: string | null;
    bedrooms: number | null;
    bathrooms: string | null;
    squareMeter: number | null;
    yearBuilt: number | null;
    price: string;
    listingType: string;
    street: string | null;
    city: string | null;
    province: string | null;
    postalCode: string | null;
    latitude: string | null;
    longitude: string | null;
    /** 1 exacta, 2 calle, 3 zona. La calle ya llega recortada. */
    fcLocationVisibility?: number | null;
    hidePrice?: boolean;
    status?: string | null;
  };
  images: { imageUrl: string }[];
  companyName: string;
  siteUrl: string;
}

function getSchemaType(propertyType: string | null): string {
  switch (propertyType) {
    case "piso":
    case "apartamento":
      return "Apartment";
    case "casa":
    case "chalet":
      return "House";
    case "edificio":
      return "Residence";
    default:
      // Local, nave, oficina, garaje, terreno, trastero: no son una vivienda,
      // y "Residence" le decía a Google que sí.
      return "Place";
  }
}

export default function PropertyJsonLd({
  property,
  images,
  companyName,
  siteUrl,
}: PropertyJsonLdProps) {
  const slug = buildPropertySlug({
    listingId: property.listingId,
    title: property.title,
    propertyType: property.propertyType,
    propertySubtype: property.propertySubtype,
    city: property.city,
    bedrooms: property.bedrooms,
    listingType: property.listingType,
  });

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": getSchemaType(property.propertyType),
    name: property.title,
    url: `${siteUrl}/propiedades/${slug}`,
  };

  if (property.description) {
    jsonLd.description = property.description;
  }

  if (images.length > 0) {
    jsonLd.image = images.slice(0, 10).map((img) => img.imageUrl);
  }

  // Mismas reglas que la ficha: sin habitaciones en naves, garajes, terrenos…
  const roomsApply = showsRooms(property.propertyType, property.propertySubtype);
  if (roomsApply && property.bedrooms && property.bedrooms > 0) {
    jsonLd.numberOfRooms = property.bedrooms;
  }

  const bathroomsNum = Math.floor(Number(property.bathrooms));
  if (roomsApply && bathroomsNum > 0) {
    jsonLd.numberOfBathroomsTotal = bathroomsNum;
  }

  // schema.org `floorSize` means the BUILT floor area. On land the resolved
  // surface is the plot, so publishing it as floorSize tells Google a bare
  // solar has a building on it. Land gets no floorSize; the plot is emitted as
  // an additionalProperty instead, which carries no built-area claim.
  if (property.squareMeter && property.squareMeter > 0) {
    if (["solar", "terreno", "parcela"].includes(property.propertyType ?? "")) {
      jsonLd.additionalProperty = {
        "@type": "PropertyValue",
        name: "Superficie de parcela",
        value: property.squareMeter,
        unitCode: "MTK",
      };
    } else {
      jsonLd.floorSize = {
        "@type": "QuantitativeValue",
        value: property.squareMeter,
        unitCode: "MTK",
      };
    }
  }

  if (property.yearBuilt) {
    jsonLd.yearBuilt = property.yearBuilt;
  }

  // Build address conditionally
  const address: Record<string, string> = {
    "@type": "PostalAddress",
    addressCountry: "ES",
  };
  if (property.street) address.streetAddress = property.street;
  if (property.city) address.addressLocality = property.city;
  if (property.province) address.addressRegion = property.province;
  if (property.postalCode) address.postalCode = property.postalCode;

  if (Object.keys(address).length > 2) {
    jsonLd.address = address;
  }

  // Coordenadas solo con visibilidad exacta: con "calle" o "zona" la ficha no
  // enseña el punto, y publicarlo aquí lo dejaba en el código de la página.
  if (
    (property.fcLocationVisibility ?? 1) === 1 &&
    property.latitude &&
    property.longitude
  ) {
    jsonLd.geo = {
      "@type": "GeoCoordinates",
      latitude: Number(property.latitude),
      longitude: Number(property.longitude),
    };
  }

  // Offers. Sin precio cuando la agencia lo oculta ("A consultar" en la
  // ficha, pero el importe real iba aquí), y agotado si ya se vendió o alquiló.
  const price = Number(property.price);
  if (price > 0 && !property.hidePrice) {
    jsonLd.offers = {
      "@type": "Offer",
      price,
      priceCurrency: "EUR",
      availability: isClosedStatus(property.status)
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      seller: {
        "@type": "RealEstateAgent",
        name: companyName,
      },
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
