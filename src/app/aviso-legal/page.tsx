import type { Metadata } from "next";
import Footer from "~/components/footer";
import { getAccountLegalData } from "~/server/queries/account";
import { env } from "~/env";
import AvisoLegalBurgoNuevo from "./burgo-nuevo";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const metadata: Metadata = {
  title: "Aviso Legal",
  description:
    "Información legal. Términos de uso, propiedad intelectual y condiciones generales.",
  alternates: {
    canonical: `${baseUrl}/aviso-legal`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function AvisoLegalPage() {
  if (env.NEXT_PUBLIC_ACCOUNT_ID === "111") {
    return <AvisoLegalBurgoNuevo />;
  }

  const accountData = await getAccountLegalData(env.NEXT_PUBLIC_ACCOUNT_ID);

  if (!accountData) {
    return <div>Error al cargar los datos legales.</div>;
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">Aviso Legal</h1>
          <p className="text-lg text-muted-foreground">
            Información legal y términos de uso del sitio web de{" "}
            {accountData.legalName}
          </p>
        </div>

        <div className="prose prose-gray max-w-none dark:prose-invert">
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">
              Datos Identificativos
            </h2>
            <p className="mb-4">
              En cumplimiento de lo establecido en la Ley 34/2002, de 11 de
              julio, de Servicios de la Sociedad de la Información y de Comercio
              Electrónico, se informa que:
            </p>
            <ul className="mb-4 space-y-2">
              <li>
                <strong>
                  {accountData.accountType === "company"
                    ? "Denominación social"
                    : "Titular"}
                  :
                </strong>{" "}
                {accountData.legalName}
              </li>
              {accountData.taxId && (
                <li>
                  <strong>{accountData.taxIdLabel}:</strong> {accountData.taxId}
                </li>
              )}
              {accountData.address && (
                <li>
                  <strong>
                    {accountData.accountType === "company"
                      ? "Domicilio social"
                      : "Domicilio"}
                    :
                  </strong>{" "}
                  {accountData.address}
                </li>
              )}
              {accountData.phone && (
                <li>
                  <strong>Teléfono:</strong>{" "}
                  <a
                    href={`tel:${accountData.phone}`}
                    className="transition-colors hover:text-primary"
                  >
                    {accountData.phone}
                  </a>
                </li>
              )}
              {accountData.email && (
                <li>
                  <strong>Email:</strong>{" "}
                  <a
                    href={`mailto:${accountData.email}`}
                    className="transition-colors hover:text-primary"
                  >
                    {accountData.email}
                  </a>
                </li>
              )}
              {accountData.registryDetails && (
                <li>
                  <strong>Registro Mercantil:</strong>{" "}
                  {accountData.registryDetails}
                </li>
              )}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Objeto</h2>
            <p className="mb-4">
              El presente Aviso Legal regula el uso del sitio web
              {accountData.website ? ` ${accountData.website}` : ""} (en
              adelante, &ldquo;el sitio web&rdquo;), propiedad de{" "}
              {accountData.legalName}.
            </p>
            <p className="mb-4">
              La utilización del sitio web le atribuye la condición de usuario
              del mismo e implica la aceptación plena y sin reservas de todas y
              cada una de las disposiciones incluidas en este Aviso Legal.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Condiciones de Uso</h2>
            <h3 className="mb-3 text-xl font-semibold">Uso Autorizado</h3>
            <p className="mb-4">
              El usuario se compromete a utilizar el sitio web conforme a la
              Ley, a la moral, a las buenas costumbres generalmente aceptadas y
              al orden público.
            </p>

            <h3 className="mb-3 text-xl font-semibold">Prohibiciones</h3>
            <p className="mb-4">Queda prohibido el uso del sitio web para:</p>
            <ul className="mb-4 space-y-1">
              <li>
                • Realizar actividades ilícitas o contrarias a la buena fe y al
                orden público
              </li>
              <li>
                • Difundir contenidos o propaganda de carácter racista,
                xenófobo, pornográfico-ilegal o de apología del terrorismo
              </li>
              <li>
                • Provocar daños en los sistemas físicos y lógicos del sitio web
              </li>
              <li>
                • Introducir o difundir virus informáticos o cualesquiera otros
                sistemas físicos o lógicos
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">
              Propiedad Intelectual
            </h2>
            <p className="mb-4">
              Todos los contenidos del sitio web, incluyendo a título
              enunciativo pero no limitativo, textos, fotografías, gráficos,
              imágenes, iconos, tecnología, software, así como su diseño gráfico
              y códigos fuente, constituyen una obra cuya propiedad pertenece a{" "}
              {accountData.legalName}, sin que puedan entenderse cedidos al
              usuario ninguno de los derechos de explotación sobre los mismos.
            </p>
            <p className="mb-4">
              Queda expresamente prohibida la reproducción, distribución y
              comunicación pública, incluida su modalidad de puesta a
              disposición, de la totalidad o parte de los contenidos de esta
              página web.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">
              Exclusión de Responsabilidades
            </h2>
            <h3 className="mb-3 text-xl font-semibold">
              Disponibilidad del Servicio
            </h3>
            <p className="mb-4">
              {accountData.legalName} no garantiza la disponibilidad y
              continuidad del funcionamiento del sitio web.
            </p>

            <h3 className="mb-3 text-xl font-semibold">Información</h3>
            <p className="mb-4">
              La información contenida en el sitio web tiene carácter meramente
              informativo. {accountData.legalName}
              se reserva el derecho a actualizar, modificar o eliminar la
              información contenida en su página web.
            </p>

            <h3 className="mb-3 text-xl font-semibold">Enlaces a Terceros</h3>
            <p className="mb-4">
              Los enlaces a otros sitios web no implican necesariamente una
              relación de colaboración con dichos sitios ni el respaldo de sus
              contenidos por parte de {accountData.legalName}.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">
              Legislación Aplicable y Jurisdicción
            </h2>
            <p className="mb-4">
              Las presentes condiciones generales de uso del sitio web se rigen
              por la legislación española.
            </p>
            <p className="mb-4">
              Para la resolución de cualquier controversia o conflicto que pueda
              surgir con motivo del acceso o uso de este sitio web, las partes
              se someterán a los Juzgados y Tribunales
              {accountData.jurisdiction
                ? ` de ${accountData.jurisdiction}`
                : " competentes"}
              , con renuncia expresa a cualquier otro fuero que pudiera
              corresponderles.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Contacto</h2>
            <p className="mb-4">
              Para cualquier consulta relacionada con este Aviso Legal, puede
              contactar con nosotros:
            </p>
            <ul className="space-y-1">
              {accountData.email && (
                <li>
                  <strong>Email:</strong>{" "}
                  <a
                    href={`mailto:${accountData.email}`}
                    className="transition-colors hover:text-primary"
                  >
                    {accountData.email}
                  </a>
                </li>
              )}
              {accountData.phone && (
                <li>
                  <strong>Teléfono:</strong>{" "}
                  <a
                    href={`tel:${accountData.phone}`}
                    className="transition-colors hover:text-primary"
                  >
                    {accountData.phone}
                  </a>
                </li>
              )}
              {accountData.address && (
                <li>
                  <strong>Dirección:</strong> {accountData.address}
                </li>
              )}
            </ul>
          </section>

          <div className="mt-12 border-t pt-8 text-sm text-muted-foreground">
            <p>Última actualización: abril de 2025</p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
