import Link from "next/link";
import Image from "next/image";
import { Building } from "lucide-react";
import { SocialLinks, type SocialLink } from "~/components/ui/social-links";
import { getFooterProps } from "~/server/queries/footer";
import { getLogo } from "~/server/queries/logo";
import { getContactProps, type ContactProps } from "~/server/queries/contact";
import { OfficeLocationsSlider } from "~/components/footer/FooterSlider";
import { QuickLinksSection } from "~/components/footer/QuickLinksSection";
import { FooterLinkCards } from "~/components/footer/FooterLinkCards";
import { isAccount137 } from "~/lib/account-overrides/137";
import { getColorProps } from "~/server/queries/color";
import { getFeaturesProps } from "~/server/queries/website-config";
import { cn, hexToRgba } from "~/lib/utils";

// Footer quick links. The "Vender" label is config-driven (features_props.menuLabels);
// the default preserves prior copy.
function buildQuickLinks(venderLabel: string) {
  return [
    { text: "Inicio", href: "/" },
    { text: "Propiedades", href: "/venta-propiedades/todas-ubicaciones" },
    { text: "Nosotros", href: "/#about" },
    { text: "Contacto", href: "/#contact" },
    { text: "Comprar", href: "/comprar" },
    { text: "Alquilar", href: "/alquilar" },
    { text: venderLabel, href: "/vender" },
  ];
}

const LEGAL_LINKS = [
  { text: "Aviso Legal", href: "/aviso-legal" },
  { text: "Preguntas frecuentes (FAQs)", href: "/faqs" },
  { text: "Contacta con nosotros", href: "/contacto" },
  { text: "Protección de datos", href: "/proteccion-de-datos" },
  { text: "Política de cookies", href: "/cookies" },
  { text: "Enlaces de interés", href: "/enlaces-de-interes" },
] as const;

const buyLinks = [
  {
    key: "pisos",
    text: "Pisos en venta",
    href: "/venta-pisos/todas-ubicaciones",
  },
  {
    key: "casas",
    text: "Casas en venta",
    href: "/venta-casas/todas-ubicaciones",
  },
  {
    key: "locales",
    text: "Locales en venta",
    href: "/venta-locales/todas-ubicaciones",
  },
  {
    key: "solares",
    text: "Terrenos en venta",
    href: "/venta-solares/todas-ubicaciones",
  },
  {
    key: "garajes",
    text: "Garajes en venta",
    href: "/venta-garajes/todas-ubicaciones",
  },
  {
    key: "naves",
    text: "Naves en venta",
    href: "/venta-naves-industriales/todas-ubicaciones",
  },
];

// Account 137 (industrial agency) shows all types in the footer. Short labels
// (no "en venta" suffix) + a 2-column grid so they fit without overflowing.
const buyLinks137 = [
  { key: "pisos", text: "Pisos", href: "/venta-pisos/todas-ubicaciones" },
  { key: "casas", text: "Casas", href: "/venta-casas/todas-ubicaciones" },
  { key: "locales", text: "Locales", href: "/venta-locales/todas-ubicaciones" },
  {
    key: "solares",
    text: "Terrenos",
    href: "/venta-solares/todas-ubicaciones",
  },
  { key: "garajes", text: "Garajes", href: "/venta-garajes/todas-ubicaciones" },
  {
    key: "edificios",
    text: "Edificios",
    href: "/venta-edificios/todas-ubicaciones",
  },
  {
    key: "oficinas",
    text: "Oficinas",
    href: "/venta-oficinas/todas-ubicaciones",
  },
  {
    key: "naves",
    text: "Naves",
    href: "/venta-naves-industriales/todas-ubicaciones",
  },
  {
    key: "terrenos-industriales",
    text: "Terrenos industriales",
    href: "/venta-terrenos-industriales/todas-ubicaciones",
  },
  {
    key: "trasteros",
    text: "Trasteros",
    href: "/venta-trasteros/todas-ubicaciones",
  },
];

// type QuickLink = { text: string; href: string; };
type PropertyType = (typeof buyLinks)[number];

// Helper function to convert contact props offices to footer format
function transformContactOffices(contactProps: ContactProps | null): Array<{
  name: string;
  address: string[];
  phone: string;
  email: string;
}> {
  if (!contactProps?.offices) return [];

  return contactProps.offices.map((office) => ({
    name: office.name,
    address: [
      office.address.street,
      `${office.address.city}, ${office.address.state}`,
      office.address.country,
    ].filter(Boolean),
    phone: office.phoneNumbers.main,
    email: office.emailAddresses.info,
  }));
}

/**
 * The three footer strings the CRM editor can change, rendered through a slot
 * so the preview can swap in a client component that follows the editor live
 * while the public site keeps rendering plain text.
 *
 * A COMPONENT and not a `(field, value) => ReactNode` callback: a function
 * exported from a `"use client"` module is a client reference, and the server
 * cannot call it — only render it.
 */
export type FooterTextField = "companyName" | "description" | "copyright";
export type FooterTextComponent = React.ComponentType<{
  field: FooterTextField;
  value: string;
}>;

function PlainFooterText({ value }: { field: FooterTextField; value: string }) {
  return <>{value}</>;
}

export default async function Footer({
  accountId,
  TextSlot = PlainFooterText,
}: { accountId?: bigint; TextSlot?: FooterTextComponent } = {}) {
  const footerProps = await getFooterProps(accountId);
  const contactProps = await getContactProps(accountId);
  const logoUrl = await getLogo(accountId);
  const colorProps = await getColorProps(accountId);
  const features = await getFeaturesProps(accountId);
  const quickLinks = buildQuickLinks(features.menuLabels?.vender ?? "Vender");

  // Fallbacks in case data is missing
  const companyName = footerProps?.companyName || "Inmobiliaria";
  const description =
    footerProps?.description ||
    "Tu socio de confianza para encontrar la propiedad perfecta.";

  // Convert social links object to array format - no fallbacks
  const socialLinksObj = footerProps?.socialLinks;
  const socialLinks: SocialLink[] = socialLinksObj
    ? Object.entries(socialLinksObj)
        .filter(([_, url]) => url && url.trim() !== "")
        .map(([platform, url]) => ({
          platform: platform.toLowerCase() as
            | "facebook"
            | "linkedin"
            | "twitter"
            | "instagram",
          url: url,
        }))
    : [];

  // Use contact props offices as primary source, fallback to footer props
  const contactOffices = transformContactOffices(contactProps);
  const officeLocations =
    contactOffices.length > 0
      ? contactOffices
      : footerProps?.officeLocations || [];
  const quickLinksVisibility = footerProps?.quickLinksVisibility || {};
  const propertyTypesVisibility = footerProps?.propertyTypesVisibility || {};
  // Account 137 lists every property type (2-column grid); others keep the
  // curated 5-link single column.
  const acct137 = isAccount137();
  const footerBuyLinks = acct137 ? buyLinks137 : buyLinks;
  // Config-driven: when enabled, footer navigation is shown as cards and the
  // property-types column is dropped.
  const useFooterCards = features.footerCards === true;
  const copyright =
    footerProps?.copyright ||
    `© ${new Date().getFullYear()} ${companyName}. Todos los derechos reservados.`;

  return (
    <footer
      className={cn(
        "border-t border-border/40",
        !colorProps?.primaryColor &&
          "bg-gradient-to-b from-muted/30 via-muted/50 to-muted",
      )}
      style={
        colorProps?.primaryColor
          ? {
              backgroundColor:
                hexToRgba(colorProps.primaryColor, 0.2) ?? undefined,
            }
          : undefined
      }
    >
      <div className="container mx-auto px-4 sm:px-6">
        {/* Main footer content */}
        <div className="py-12 sm:py-16 lg:py-20">
          <div className="grid gap-8 sm:gap-12 md:grid-cols-2 md:gap-16 lg:grid-cols-4 lg:gap-20">
            {/* Company section */}
            <div className="md:col-span-2 lg:col-span-1 lg:border-r lg:border-border/40 lg:pr-16">
              <Link
                href="/"
                className="group mb-8 flex w-fit items-center gap-2"
              >
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={companyName}
                    width={240}
                    height={96}
                    className="h-16 w-auto object-contain sm:h-20 lg:h-28"
                    priority
                  />
                ) : (
                  <>
                    <Building className="h-6 w-6" />
                    <span className="text-xl font-bold">
                      <TextSlot field="companyName" value={companyName} />
                    </span>
                  </>
                )}
              </Link>
              <p className="mb-8 max-w-sm text-base leading-relaxed text-muted-foreground">
                <TextSlot field="description" value={description} />
              </p>
              {socialLinks.length > 0 && (
                <div className="pt-4">
                  <SocialLinks
                    links={socialLinks}
                    size="lg"
                    className="gap-4"
                  />
                </div>
              )}
            </div>

            {useFooterCards ? (
              /* Footer cards: quick links as cards, no property-types column */
              <FooterLinkCards
                links={quickLinks}
                visibility={quickLinksVisibility}
                className="md:col-span-2 lg:col-span-2"
              />
            ) : (
              <>
                {/* Quick links section */}
                <QuickLinksSection
                  links={quickLinks}
                  visibility={quickLinksVisibility}
                />

                {/* Property types section */}
                <div className="sm:pl-0 lg:pl-8">
                  <h3 className="relative mb-4 inline-block text-lg font-bold text-foreground sm:mb-6 sm:text-xl lg:mb-8">
                    Tipos de Propiedades
                    <div className="absolute -bottom-2 left-0 h-0.5 w-full origin-left scale-x-100 transform rounded-full bg-primary/60 transition-transform duration-300 group-hover:scale-x-75"></div>
                  </h3>
                  <nav>
                    <ul
                      className={
                        acct137
                          ? "grid grid-cols-2 gap-x-6 gap-y-2 sm:gap-y-3 lg:gap-y-4"
                          : "space-y-2 sm:space-y-3 lg:space-y-4"
                      }
                    >
                      {footerBuyLinks
                        .filter(
                          (type) => propertyTypesVisibility[type.key] !== false,
                        )
                        .map((type: PropertyType, index: number) => (
                          <li key={index}>
                            <Link
                              href={type.href}
                              className="block py-1.5 text-base font-medium text-muted-foreground transition-all duration-300 hover:translate-x-2 hover:font-semibold hover:text-primary"
                            >
                              {type.text}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </nav>
                </div>
              </>
            )}

            {/* Office locations section */}
            <div className="sm:pl-0 md:col-span-2 lg:col-span-1 lg:pl-8">
              <h3 className="relative mb-4 inline-block text-lg font-bold text-foreground sm:mb-6 sm:text-xl lg:mb-8">
                Nuestras Oficinas
                <div className="absolute -bottom-2 left-0 h-0.5 w-full origin-left scale-x-100 transform rounded-full bg-primary/60 transition-transform duration-300 group-hover:scale-x-75"></div>
              </h3>
              <div className="rounded-xl border border-border/40 bg-card/50 p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                <OfficeLocationsSlider officeLocations={officeLocations} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-border/40 py-6 sm:py-8 lg:py-10">
          <div className="flex flex-col items-center justify-between gap-4 sm:gap-6 md:flex-row lg:gap-8">
            <p className="order-2 text-sm font-medium text-muted-foreground md:order-1">
              <TextSlot field="copyright" value={copyright} />
            </p>
            {LEGAL_LINKS.length > 0 && (
              <nav className="order-1 md:order-2">
                <div className="flex flex-wrap justify-center gap-4 text-sm sm:gap-6 md:justify-end lg:gap-8">
                  {LEGAL_LINKS.map((link, index) => (
                    <Link
                      key={index}
                      href={link.href}
                      className="font-medium text-muted-foreground transition-all duration-300 hover:font-semibold hover:text-primary"
                    >
                      {link.text}
                    </Link>
                  ))}
                </div>
              </nav>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
