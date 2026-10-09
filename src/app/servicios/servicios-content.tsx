import Link from "next/link";
import { notFound } from "next/navigation";
import { getAboutProps } from "~/server/queries/about";
import { getFeaturesProps } from "~/server/queries/website-config";
import Footer from "~/components/footer";
import { ServiciosHeroGrid } from "~/components/servicios/servicios-hero-grid";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

/**
 * The Servicios page body, for an arbitrary account.
 *
 * Split out of \`page.tsx\` so the CRM preview can render the real page for the
 * account being edited: a route file may only export the Next-reserved names,
 * so a component taking \`accountId\` cannot live there.
 */
export async function ServiciosContent({
  accountId,
  live = false,
}: { accountId?: bigint; live?: boolean } = {}) {
  const [aboutProps, features] = await Promise.all([
    getAboutProps(accountId),
    getFeaturesProps(accountId),
  ]);

  // Availability: explicit features_props flag wins; otherwise fall back to the
  // presence of extended services. Content must exist to render either way.
  const extended = aboutProps?.extendedServices ?? [];
  const hasContent = extended.length > 0;
  const serviciosEnabled = features.pages?.servicios ?? hasContent;
  if (!serviciosEnabled || !hasContent) {
    notFound();
  }

  const pageTitle = aboutProps?.servicesPageTitle ?? "Nuestros Servicios";
  const pageSubtitle =
    aboutProps?.servicesPageSubtitle ??
    "Soluciones integrales para cualquier necesidad inmobiliaria, técnica o de obra.";
  const heroVideoUrl = aboutProps?.servicesHeroVideo;
  const heroImageUrl = aboutProps?.servicesHeroImage;
  const minimal = features.headerStyle === "minimal";

  return (
    <main className="min-h-screen bg-background">
      {/* Hero + grid are a client component so the CRM preview can follow an
          edit without reloading the frame. */}
      <ServiciosHeroGrid
        initial={{
          pageTitle,
          pageSubtitle,
          heroVideoUrl,
          heroImageUrl,
          services: extended,
        }}
        minimal={minimal}
        descriptionAlign={features.descriptionAlign}
        serviciosLayout={features.serviciosLayout}
        live={live}
      />

      {features.serviciosCta !== false && (
        <section className="py-20 sm:py-24">
          <div className="container mx-auto">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="mb-6 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                ¿Qué servicio necesitas?
              </h2>
              <p className="mb-8 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Escríbenos y te orientamos sin compromiso.
              </p>
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-4 text-sm font-medium uppercase tracking-eyebrow text-background transition-colors hover:bg-foreground/90"
              >
                {features.menuLabels?.contacto ?? "Contáctanos"}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer accountId={accountId} />
    </main>
  );
}
