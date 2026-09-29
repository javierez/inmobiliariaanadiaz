import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactContent } from "~/components/contact/ContactContent";
import Footer from "~/components/footer";
import { getContactProps, type ContactProps } from "~/server/queries/contact";
import { getSocialLinks } from "~/server/queries/social";
import { getFeaturesProps } from "~/server/queries/website-config";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

async function getOfficesForCity(
  ciudadSlug: string,
): Promise<{ contactProps: ContactProps; cityLabel: string } | null> {
  const contactProps = await getContactProps();
  if (!contactProps?.offices || contactProps.offices.length === 0) return null;

  const slug = normalize(decodeURIComponent(ciudadSlug));
  const matched = contactProps.offices.filter(
    (office) => normalize(office.address.city ?? "") === slug,
  );
  if (matched.length === 0) return null;

  const cityLabel = matched[0]!.address.city;

  return {
    contactProps: { ...contactProps, offices: matched },
    cityLabel,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ciudad: string }>;
}): Promise<Metadata> {
  const { ciudad } = await params;
  const result = await getOfficesForCity(ciudad);
  if (!result) {
    return { title: "Contacto" };
  }
  const { cityLabel } = result;
  const title = `Contacto — Oficina en ${cityLabel}`;
  return {
    title,
    description: `Contacta con nuestra oficina en ${cityLabel}. Dirección, teléfono, email y horarios.`,
    alternates: {
      canonical: `${baseUrl}/contacto/${ciudad}`,
    },
    openGraph: {
      title,
      url: `${baseUrl}/contacto/${ciudad}`,
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

function LocalBusinessJsonLd({
  office,
}: {
  office: ContactProps["offices"][number];
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: office.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: office.address.street,
      addressLocality: office.address.city,
      addressRegion: office.address.state,
      addressCountry: office.address.country,
    },
    telephone: office.phoneNumbers?.main,
    email: office.emailAddresses?.info,
    openingHours: [
      office.scheduleInfo?.weekdays,
      office.scheduleInfo?.saturday,
      office.scheduleInfo?.sunday,
    ].filter(Boolean),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function ContactoCiudadPage({
  params,
}: {
  params: Promise<{ ciudad: string }>;
}) {
  const { ciudad } = await params;
  const result = await getOfficesForCity(ciudad);
  if (!result) {
    notFound();
  }

  const { contactProps, cityLabel } = result;
  const [socialLinks, features] = await Promise.all([
    getSocialLinks(),
    getFeaturesProps(),
  ]);
  const instagramUrl = socialLinks.find((s) => s.platform === "instagram")?.url;
  const linkedinUrl = socialLinks.find((s) => s.platform === "linkedin")?.url;
  const contactoLabel = features.menuLabels?.contacto ?? "Contáctanos";
  const title = `${contactoLabel} en ${cityLabel}`;
  const subtitle =
    contactProps.subtitle ||
    `Nuestra oficina en ${cityLabel} está aquí para ayudarte con todas tus necesidades inmobiliarias.`;

  return (
    <main className="min-h-screen bg-background">
      {contactProps.offices.map((office) => (
        <LocalBusinessJsonLd key={office.id} office={office} />
      ))}

      <div className="flex justify-center pt-8 sm:pt-10">
        <div className="w-full max-w-7xl">
          <ContactContent
            title={title}
            subtitle={subtitle}
            messageForm={contactProps.messageForm ?? true}
            address={contactProps.address ?? true}
            phone={contactProps.phone ?? true}
            mail={contactProps.mail ?? true}
            schedule={contactProps.schedule ?? true}
            map={contactProps.map ?? true}
            contactProps={contactProps}
            instagramUrl={instagramUrl}
            linkedinUrl={linkedinUrl}
          />
        </div>
      </div>
      <Footer />
    </main>
  );
}
