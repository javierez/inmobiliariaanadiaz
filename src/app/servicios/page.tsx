import type { Metadata } from "next";
import { ServiciosContent } from "./servicios-content";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Asesoramiento integral en compraventa, alquileres, valoraciones, obras y proyectos.",
  alternates: { canonical: `${baseUrl}/servicios` },
  robots: { index: true, follow: true },
};

export default async function ServiciosPage() {
  return <ServiciosContent />;
}
