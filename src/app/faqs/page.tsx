import type { Metadata } from "next";
import { FaqsContent } from "./faqs-content";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes (FAQs)",
  description:
    "Encuentra respuestas a las preguntas más comunes sobre compra, venta y alquiler de propiedades. Resolvemos tus dudas inmobiliarias.",
  alternates: {
    canonical: `${baseUrl}/faqs`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function FAQsPage() {
  return <FaqsContent />;
}
