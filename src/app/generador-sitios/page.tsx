import type { Metadata } from "next";
import { SiteGeneratorForm } from "~/components/site-generator/site-generator-form";

export const metadata: Metadata = {
  title: "Generador de Sitios",
  description: "Genera y despliega sitios web para cuentas de clientes",
  robots: {
    index: false,
    follow: false,
  },
};

export default function GeneradorSitiosPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <SiteGeneratorForm />
    </div>
  );
}
