import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAboutProps } from "~/server/queries/about";
import { getFeaturesProps } from "~/server/queries/website-config";
import Footer from "~/components/footer";
import { OriginsSection } from "~/components/about/OriginsSection";
import { ValuesGrid } from "~/components/about/ValuesGrid";
import { TeamGrid } from "~/components/about/TeamGrid";
import { KpiSection } from "~/components/about/KpiSection";
import { PageHeroBanner } from "~/components/page-hero-banner";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Conoce nuestra historia, valores y al equipo que hace posible tu experiencia inmobiliaria.",
  alternates: { canonical: `${baseUrl}/nosotros` },
  robots: { index: true, follow: true },
};

export default async function NosotrosPage() {
  const [aboutProps, features] = await Promise.all([
    getAboutProps(),
    getFeaturesProps(),
  ]);

  // Availability: explicit features_props flag wins; otherwise fall back to the
  // presence of enriched data. Content must exist to render either way.
  const nosotrosEnabled =
    features.pages?.nosotros ?? !!aboutProps?.originsContent;
  if (!nosotrosEnabled || !aboutProps?.originsContent) {
    notFound();
  }

  const kpis = [];
  if (aboutProps.kpi1Name && aboutProps.kpi1Data)
    kpis.push({ name: aboutProps.kpi1Name, data: aboutProps.kpi1Data });
  if (aboutProps.kpi2Name && aboutProps.kpi2Data)
    kpis.push({ name: aboutProps.kpi2Name, data: aboutProps.kpi2Data });
  if (aboutProps.kpi3Name && aboutProps.kpi3Data)
    kpis.push({ name: aboutProps.kpi3Name, data: aboutProps.kpi3Data });
  if (aboutProps.kpi4Name && aboutProps.kpi4Data)
    kpis.push({ name: aboutProps.kpi4Name, data: aboutProps.kpi4Data });

  const pageTitle =
    aboutProps.nosotrosPageTitle ?? aboutProps.title ?? "Sobre Nosotros";
  const pageSubtitle =
    aboutProps.nosotrosPageSubtitle ??
    aboutProps.subtitle ??
    "Tu socio de confianza en el viaje inmobiliario";

  const hasHero = !!(
    aboutProps.nosotrosHeroVideo || aboutProps.nosotrosHeroImage
  );
  const minimal = features.headerStyle === "minimal";

  return (
    <main className="min-h-screen bg-background">
      {hasHero ? (
        <PageHeroBanner
          eyebrow="Nosotros"
          title={pageTitle}
          subtitle={pageSubtitle}
          backgroundType={aboutProps.nosotrosHeroVideo ? "video" : "image"}
          backgroundVideo={aboutProps.nosotrosHeroVideo}
          backgroundImage={aboutProps.nosotrosHeroImage}
        />
      ) : (
        <div className="container mx-auto px-4 pt-28 sm:pt-32">
          <header className="mx-auto max-w-3xl py-12 text-center sm:py-16">
            {!minimal && (
              <span className="mb-5 block text-xs font-medium uppercase tracking-eyebrow text-muted-foreground">
                Nosotros
              </span>
            )}
            <h1 className="mb-6 text-4xl font-medium leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl">
              {pageTitle}
            </h1>
            {!minimal && (
              <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                {pageSubtitle}
              </p>
            )}
          </header>
        </div>
      )}

      <OriginsSection
        title={aboutProps.originsTitle ?? "De dónde venimos"}
        content={aboutProps.originsContent}
        content2={aboutProps.originsContent2}
        image={aboutProps.originsImage}
        youtubeVideoId={aboutProps.youtubeVideoId}
        youtubeTitle={aboutProps.youtubeTitle ?? "Nuestra historia"}
      />

      {aboutProps.values && aboutProps.values.length > 0 && (
        <ValuesGrid values={aboutProps.values} />
      )}

      {aboutProps.showKPI && kpis.length > 0 && (
        <section className="py-20 sm:py-24">
          <div className="container mx-auto">
            <KpiSection kpis={kpis} />
          </div>
        </section>
      )}

      {aboutProps.team && aboutProps.team.length > 0 && (
        <TeamGrid team={aboutProps.team} />
      )}

      <section className="bg-muted/30 py-20 sm:py-24">
        <div className="container mx-auto">
          <div className="mx-auto max-w-2xl text-center">
            {!features.contactCtaMinimal && (
              <>
                <h2 className="mb-6 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                  ¿Hablamos?
                </h2>
                <p className="mb-8 text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Cuéntanos qué necesitas y te respondemos en menos de 24 horas.
                </p>
              </>
            )}
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

      <Footer />
    </main>
  );
}
