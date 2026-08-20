import type { Metadata } from "next";
import Footer from "~/components/footer";
import Link from "next/link";
import { getAccountLegalData } from "~/server/queries/account";
import { env } from "~/env";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description:
    "Información sobre el uso de cookies en nuestro sitio web. Gestione sus preferencias de cookies conforme a la normativa vigente.",
  alternates: {
    canonical: `${baseUrl}/cookies`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function CookiesPage() {
  const accountData = await getAccountLegalData(env.NEXT_PUBLIC_ACCOUNT_ID);

  if (!accountData) {
    return <div>Error al cargar los datos legales.</div>;
  }
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
              Política de Cookies
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
              Política de Cookies
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Información sobre el uso de cookies y tecnologías similares en
              nuestro sitio web
            </p>
          </div>

          <div className="mx-auto max-w-4xl space-y-10">
            {/* What are Cookies */}
            <section>
              <h2 className="mb-4 text-2xl font-bold tracking-tight">
                1. ¿Qué son las Cookies?
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                Las cookies son pequeños archivos de texto que se almacenan en
                su dispositivo cuando visita un sitio web. Estas cookies
                permiten que el sitio web recuerde sus acciones y preferencias
                (como el idioma, tamaño de fuente y otras preferencias de
                visualización) durante un período de tiempo, para que no tenga
                que volver a configurarlas cada vez que regrese al sitio o
                navegue de una página a otra.
              </p>
            </section>

            {/* Why we use cookies */}
            <section>
              <h2 className="mb-4 text-2xl font-bold tracking-tight">
                2. ¿Por qué utilizamos Cookies?
              </h2>
              <p className="mb-4 leading-relaxed text-muted-foreground">
                Utilizamos cookies para mejorar su experiencia en nuestro sitio
                web de las siguientes maneras:
              </p>
              <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
                <li>Recordar sus preferencias de búsqueda de propiedades</li>
                <li>Mantener su sesión activa durante la navegación</li>
                <li>Analizar cómo usa nuestro sitio web para mejorarlo</li>
                <li>Personalizar el contenido según sus intereses</li>
                <li>Proporcionar funciones de redes sociales</li>
                <li>Mostrar publicidad relevante</li>
              </ul>
            </section>

            {/* Types of Cookies */}
            <section>
              <h2 className="mb-6 text-2xl font-bold tracking-tight">
                3. Tipos de Cookies que Utilizamos
              </h2>

              <div className="space-y-8">
                {/* Technical Cookies */}
                <div className="border-b pb-8">
                  <h3 className="mb-3 text-xl font-semibold">
                    Cookies Técnicas (Esenciales)
                  </h3>
                  <div className="mb-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 font-medium">Propósito:</p>
                      <p className="text-sm text-muted-foreground">
                        Permiten el funcionamiento básico del sitio web.
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium">Duración:</p>
                      <p className="text-sm text-muted-foreground">
                        Sesión o hasta 12 meses.
                      </p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="mb-2 font-medium">Ejemplos:</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-muted px-2 py-1 text-xs">
                          sessionId
                        </code>
                        <span className="text-muted-foreground">
                          Mantiene su sesión activa
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-muted px-2 py-1 text-xs">
                          cookieConsent
                        </code>
                        <span className="text-muted-foreground">
                          Recuerda sus preferencias de cookies
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-muted px-2 py-1 text-xs">
                          language
                        </code>
                        <span className="text-muted-foreground">
                          Idioma preferido del sitio
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No requieren consentimiento. Son esenciales para el
                    funcionamiento del sitio.
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="border-b pb-8">
                  <h3 className="mb-3 text-xl font-semibold">
                    Cookies de Análisis
                  </h3>
                  <div className="mb-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 font-medium">Propósito:</p>
                      <p className="text-sm text-muted-foreground">
                        Nos ayudan a entender cómo interactúa con nuestro sitio
                        web.
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium">Duración:</p>
                      <p className="text-sm text-muted-foreground">
                        Hasta 24 meses.
                      </p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="mb-2 font-medium">Proveedores:</p>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Google Analytics:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <code className="rounded bg-muted px-2 py-1 text-xs">
                            _ga
                          </code>
                          <code className="rounded bg-muted px-2 py-1 text-xs">
                            _ga_*
                          </code>
                          <code className="rounded bg-muted px-2 py-1 text-xs">
                            _gid
                          </code>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Hotjar:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <code className="rounded bg-muted px-2 py-1 text-xs">
                            _hjSessionUser_*
                          </code>
                          <code className="rounded bg-muted px-2 py-1 text-xs">
                            _hjSession_*
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Requieren consentimiento. Puede desactivarlas sin afectar la
                    funcionalidad básica.
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="border-b pb-8">
                  <h3 className="mb-3 text-xl font-semibold">
                    Cookies de Marketing
                  </h3>
                  <div className="mb-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 font-medium">Propósito:</p>
                      <p className="text-sm text-muted-foreground">
                        Personalizan la publicidad y miden la efectividad de
                        nuestras campañas.
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium">Duración:</p>
                      <p className="text-sm text-muted-foreground">
                        Entre 30 días y 24 meses.
                      </p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="mb-2 font-medium">Proveedores:</p>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Google Ads:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <code className="rounded bg-muted px-2 py-1 text-xs">
                            _gcl_au
                          </code>
                          <code className="rounded bg-muted px-2 py-1 text-xs">
                            _gcl_aw
                          </code>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Facebook Pixel:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <code className="rounded bg-muted px-2 py-1 text-xs">
                            _fbp
                          </code>
                          <code className="rounded bg-muted px-2 py-1 text-xs">
                            _fbc
                          </code>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">LinkedIn Insight:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <code className="rounded bg-muted px-2 py-1 text-xs">
                            li_*
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Requieren consentimiento. Puede rechazarlas y seguir usando
                    el sitio normalmente.
                  </p>
                </div>

                {/* Preference Cookies */}
                <div>
                  <h3 className="mb-3 text-xl font-semibold">
                    Cookies de Preferencias
                  </h3>
                  <div className="mb-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 font-medium">Propósito:</p>
                      <p className="text-sm text-muted-foreground">
                        Recuerdan sus preferencias para personalizar su
                        experiencia.
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 font-medium">Duración:</p>
                      <p className="text-sm text-muted-foreground">
                        Hasta 12 meses.
                      </p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="mb-2 font-medium">Ejemplos:</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-muted px-2 py-1 text-xs">
                          searchPreferences
                        </code>
                        <span className="text-muted-foreground">
                          Filtros de búsqueda guardados
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-muted px-2 py-1 text-xs">
                          favoriteProperties
                        </code>
                        <span className="text-muted-foreground">
                          Propiedades marcadas como favoritas
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-muted px-2 py-1 text-xs">
                          mapView
                        </code>
                        <span className="text-muted-foreground">
                          Preferencias de visualización del mapa
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Requieren consentimiento. Mejoran su experiencia pero no son
                    esenciales.
                  </p>
                </div>
              </div>
            </section>

            {/* Cookie Management */}
            <section>
              <h2 className="mb-4 text-2xl font-bold tracking-tight">
                4. Gestión de Cookies
              </h2>
              <p className="mb-6 leading-relaxed text-muted-foreground">
                Puede gestionar sus preferencias de cookies en cualquier momento
                haciendo clic en el botón &quot;Configurar Cookies&quot; que
                aparece en la parte inferior de nuestro sitio web.
              </p>

              <h3 className="mb-3 text-xl font-semibold">
                Configuración del Navegador
              </h3>
              <p className="mb-4 text-muted-foreground">
                También puede gestionar las cookies directamente desde la
                configuración de su navegador:
              </p>

              <div className="space-y-3 text-sm">
                {[
                  {
                    name: "Chrome",
                    path: "Configuración > Privacidad y seguridad > Cookies y otros datos de sitios",
                  },
                  {
                    name: "Firefox",
                    path: "Opciones > Privacidad y seguridad > Cookies y datos del sitio",
                  },
                  {
                    name: "Safari",
                    path: "Preferencias > Privacidad > Gestionar datos de sitios web",
                  },
                  {
                    name: "Edge",
                    path: "Configuración > Privacidad > Cookies y permisos del sitio",
                  },
                ].map((browser, index) => (
                  <div key={index}>
                    <span className="font-medium">{browser.name}:</span>{" "}
                    <span className="text-muted-foreground">
                      {browser.path}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Third Party Cookies */}
            <section>
              <h2 className="mb-4 text-2xl font-bold tracking-tight">
                5. Cookies de Terceros
              </h2>
              <p className="mb-6 leading-relaxed text-muted-foreground">
                Algunos de nuestros socios comerciales pueden establecer cookies
                en su dispositivo cuando visita nuestro sitio web. Estas cookies
                de terceros están sujetas a las políticas de privacidad de sus
                respectivos proveedores:
              </p>

              <div className="space-y-4 text-sm">
                {[
                  {
                    name: "Google Analytics y Google Ads",
                    privacy: "https://policies.google.com/privacy",
                    optout: "https://tools.google.com/dlpage/gaoptout",
                  },
                  {
                    name: "Facebook",
                    privacy: "https://www.facebook.com/privacy/policy",
                    optout: "https://www.facebook.com/settings",
                  },
                  {
                    name: "LinkedIn",
                    privacy: "https://www.linkedin.com/legal/privacy-policy",
                    optout:
                      "https://www.linkedin.com/psettings/guest-controls/retargeting-opt-out",
                  },
                ].map((provider, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <p className="mb-1 font-medium">{provider.name}</p>
                    <p className="text-muted-foreground">
                      Política de privacidad:{" "}
                      <a
                        href={provider.privacy}
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noopener"
                      >
                        {provider.privacy
                          .replace("https://", "")
                          .replace("www.", "")}
                      </a>
                    </p>
                    <p className="text-muted-foreground">
                      Configuración:{" "}
                      <a
                        href={provider.optout}
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noopener"
                      >
                        {provider.optout
                          .replace("https://", "")
                          .replace("www.", "")}
                      </a>
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Consequences of Disabling */}
            <section>
              <h2 className="mb-4 text-2xl font-bold tracking-tight">
                6. Consecuencias de Desactivar Cookies
              </h2>
              <p className="mb-4 leading-relaxed text-muted-foreground">
                Si decide desactivar las cookies, algunas funcionalidades del
                sitio web podrían verse afectadas:
              </p>
              <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
                <li>No se recordarán sus preferencias de búsqueda</li>
                <li>Deberá iniciar sesión cada vez que visite el sitio</li>
                <li>
                  Los formularios podrían perder la información introducida
                </li>
                <li>
                  No podremos personalizar el contenido según sus intereses
                </li>
                <li>Los análisis de uso serán menos precisos</li>
              </ul>
            </section>

            {/* Policy Updates */}
            <section>
              <h2 className="mb-4 text-2xl font-bold tracking-tight">
                7. Actualizaciones de esta Política
              </h2>
              <p className="mb-4 leading-relaxed text-muted-foreground">
                Esta Política de Cookies puede actualizarse periódicamente para
                reflejar cambios en nuestras prácticas o por razones operativas,
                legales o reglamentarias. Le recomendamos que revise esta página
                regularmente para mantenerse informado sobre nuestro uso de
                cookies.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                Los cambios importantes serán notificados a través de un aviso
                prominente en nuestro sitio web o por otros medios apropiados.
              </p>
            </section>

            {/* Contact */}
            <section className="border-t pt-8">
              <h2 className="mb-4 text-2xl font-bold tracking-tight">
                8. Contacto
              </h2>
              <p className="mb-4 leading-relaxed text-muted-foreground">
                Si tiene preguntas sobre nuestra Política de Cookies, puede
                contactarnos a través de:
              </p>
              <div className="space-y-2 text-sm">
                {accountData.privacyEmail && (
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    <a
                      href={`mailto:${accountData.privacyEmail}`}
                      className="text-primary hover:underline"
                    >
                      {accountData.privacyEmail}
                    </a>
                  </p>
                )}
                {accountData.phone && (
                  <p>
                    <span className="font-medium">Teléfono:</span>{" "}
                    <a
                      href={`tel:${accountData.phone}`}
                      className="text-primary hover:underline"
                    >
                      {accountData.phone}
                    </a>
                  </p>
                )}
              </div>
            </section>

            {/* Last Updated */}
            <div className="border-t pt-8 text-center text-sm text-muted-foreground">
              <p>Última actualización: abril de 2025</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
