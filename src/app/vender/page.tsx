import type { Metadata } from "next";
import { PropertyListingForm } from "~/components/property/property-listing-form";
import Footer from "~/components/footer";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const metadata: Metadata = {
  title: "Vender tu Propiedad",
  description:
    "Publica tu inmueble y llega a miles de compradores potenciales.",
  alternates: {
    canonical: `${baseUrl}/vender`,
  },
};

export default function VenderPage() {
  return (
    <>
      <div className="container mx-auto px-4 py-10 sm:py-14 md:py-20">
        <PropertyListingForm />
      </div>
      <Footer />
    </>
  );
}
