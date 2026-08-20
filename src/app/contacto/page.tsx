import type { Metadata } from "next";
import { ContactSection } from "~/components/contact-section";
import Footer from "~/components/footer";
import BreadcrumbJsonLd from "~/components/breadcrumb-json-ld";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Póngase en contacto con nuestro equipo de expertos inmobiliarios. Le ayudamos con la compra, venta y alquiler de propiedades.",
  alternates: {
    canonical: `${baseUrl}/contacto`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactoPage() {
  return (
    <main className="min-h-screen bg-background">
      <BreadcrumbJsonLd
        siteUrl={baseUrl}
        items={[
          { name: "Inicio", href: "/" },
          { name: "Contacto", href: "/contacto" },
        ]}
      />
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Contacto
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Póngase en contacto con nuestro equipo. Le ayudamos con la compra,
          venta y alquiler de propiedades.
        </p>
      </div>

      {/* Centered ContactSection */}
      <div className="flex justify-center">
        <div className="w-full max-w-7xl">
          <ContactSection />
        </div>
      </div>
      <Footer />
    </main>
  );
}
