import type { Metadata } from "next";
import Footer from "~/components/footer";
import Link from "next/link";
import { ExternalLink, Globe } from "lucide-react";
import { getLinksProps } from "~/server/queries/website-config";
import { faviconUrl } from "~/lib/link-favicon";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const metadata: Metadata = {
  title: "Enlaces de Interés",
  description:
    "Directorio de enlaces útiles: organismos oficiales, bancos, prensa, medios de comunicación y más recursos de interés.",
  alternates: {
    canonical: `${baseUrl}/enlaces-de-interes`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function EnlacesDeInteresPage() {
  const categories = await getLinksProps();

  return (
    <main className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 pt-8">
        <nav className="py-4" aria-label="Breadcrumb">
          <ol className="flex items-center text-sm">
            <li>
              <Link
                href="/"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                Inicio
              </Link>
            </li>
            <li className="mx-2">/</li>
            <li className="font-medium" aria-current="page">
              Enlaces de Interés
            </li>
          </ol>
        </nav>
      </div>

      {/* Main content */}
      <section className="pb-12 pt-8 sm:pb-16 lg:pb-24">
        <div className="container">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight">
              Enlaces de Interés
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Directorio de enlaces útiles a organismos oficiales, medios de
              comunicación, entidades bancarias y otros recursos de interés.
            </p>
          </div>

          {/* Link Categories */}
          <div className="mx-auto max-w-4xl space-y-10">
            {categories.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No hay enlaces disponibles en este momento.
              </p>
            ) : (
              categories.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h2 className="mb-6 text-2xl font-bold tracking-tight">
                    {category.name}
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {category.links.map((link, linkIndex) => {
                      const icon = faviconUrl(link.url);
                      return (
                        <a
                          key={linkIndex}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2.5 rounded-lg border border-border/40 px-4 py-3 text-sm font-medium transition-all hover:border-primary/40 hover:bg-accent hover:shadow-sm"
                        >
                          {/* The organism's own mark, so the directory is
                              scannable by sight rather than by reading. */}
                          {icon ? (
                            <img
                              src={icon}
                              alt=""
                              width={16}
                              height={16}
                              loading="lazy"
                              className="h-4 w-4 flex-shrink-0 object-contain"
                            />
                          ) : (
                            <Globe className="h-4 w-4 flex-shrink-0 text-muted-foreground/50" />
                          )}
                          <span className="flex-1 truncate">{link.title}</span>
                          <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
