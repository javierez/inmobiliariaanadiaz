import { buildPropertySlug } from "~/lib/property-slug";

interface PropertyJsonLdProps {
  property: {
    listingId: string;
    title: string | null;
    description: string | null;
    propertyType: string | null;
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
    default:
      return "Residence";
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

  if (property.bedrooms && property.bedrooms > 0) {
    jsonLd.numberOfRooms = property.bedrooms;
  }

  const bathroomsNum = Math.floor(Number(property.bathrooms));
  if (bathroomsNum > 0) {
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

  // Geo coordinates
  if (property.latitude && property.longitude) {
    jsonLd.geo = {
      "@type": "GeoCoordinates",
      latitude: Number(property.latitude),
      longitude: Number(property.longitude),
    };
  }

  // Offers
  const price = Number(property.price);
  if (price > 0) {
    jsonLd.offers = {
      "@type": "Offer",
      price,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
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
