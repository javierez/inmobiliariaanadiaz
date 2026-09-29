import type { Metadata } from "next";
import { getAccountLegalData } from "~/server/queries/account";
import { env } from "~/env";
import Footer from "~/components/footer";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const metadata: Metadata = {
  title: "Términos y Condiciones de Venta",
  description: "Términos y condiciones para la venta de inmuebles",
  alternates: {
    canonical: `${baseUrl}/terminos-condiciones-venta`,
  },
};

export default async function TerminosCondicionesVentaPage() {
  const accountData = await getAccountLegalData(env.NEXT_PUBLIC_ACCOUNT_ID);

  if (!accountData) {
    return <div>Error al cargar los datos legales.</div>;
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-3xl font-bold">
            Términos y Condiciones de Venta
          </h1>

          <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                1. Objeto y Ámbito de Aplicación
              </h2>
              <p className="mb-4">
                Los presentes términos y condiciones regulan la prestación de
                servicios de intermediación inmobiliaria para la venta de
                propiedades por parte de {accountData.legalName}, en adelante "
                {accountData.name}".
              </p>
              <p>
                Estos términos se aplican a todos los propietarios que deseen
                contratar nuestros servicios inmobiliarios.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                2. Servicios Ofrecidos
              </h2>
              <p className="mb-4">
                {accountData.name} ofrece los siguientes servicios de
                intermediación:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6">
                <li>Publicación del inmueble en portales inmobiliarios</li>
                <li>Promoción y marketing del inmueble</li>
                <li>Gestión de consultas y visitas</li>
                <li>Asesoramiento durante el proceso de venta</li>
                <li>Acompañamiento en la firma del contrato</li>
                <li>Gestión de documentación necesaria</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                3. Obligaciones del Propietario
              </h2>
              <p className="mb-4">El propietario se compromete a:</p>
              <ul className="mb-4 list-disc space-y-2 pl-6">
                <li>
                  Proporcionar información veraz y actualizada sobre el inmueble
                </li>
                <li>
                  Facilitar la documentación legal necesaria (escrituras, cédula
                  de habitabilidad, certificado energético, etc.)
                </li>
                <li>
                  Permitir las visitas acordadas con potenciales compradores
                </li>
                <li>
                  Mantener el inmueble en condiciones adecuadas para la venta
                </li>
                <li>
                  Comunicar cualquier cambio relevante sobre el inmueble o su
                  situación legal
                </li>
                <li>
                  No comercializar el inmueble por otros canales durante la
                  vigencia del contrato de exclusividad (si aplica)
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                4. Comisiones y Honorarios
              </h2>
              <p className="mb-4">
                Las comisiones por nuestros servicios se establecerán de forma
                individual para cada inmueble y se comunicarán claramente antes
                de la formalización del contrato de servicios.
              </p>
              <p className="mb-4">
                La comisión será devengada únicamente en caso de venta efectiva
                del inmueble y se abonará en el momento de la firma de la
                escritura pública de compraventa.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                5. Exclusividad
              </h2>
              <p className="mb-4">
                Los contratos podrán ser de exclusividad o no exclusividad,
                según se acuerde entre las partes. En caso de exclusividad:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6">
                <li>
                  El propietario se compromete a no comercializar el inmueble
                  por otros medios
                </li>
                <li>
                  La duración de la exclusividad será acordada previamente
                </li>
                <li>
                  Cualquier venta realizada durante el período de exclusividad
                  generará derecho a comisión
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                6. Protección de Datos
              </h2>
              <p className="mb-4">
                El tratamiento de los datos personales se rige por nuestra
                Política de Protección de Datos, disponible en nuestro sitio
                web, y cumple con el Reglamento General de Protección de Datos
                (RGPD).
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                7. Duración y Resolución
              </h2>
              <p className="mb-4">
                La duración del contrato de servicios se establecerá de forma
                individual. El contrato podrá resolverse:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6">
                <li>Por mutuo acuerdo entre las partes</li>
                <li>Por venta efectiva del inmueble</li>
                <li>Por incumplimiento grave de las obligaciones</li>
                <li>Por vencimiento del plazo acordado</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                8. Responsabilidad
              </h2>
              <p className="mb-4">
                {accountData.name} actúa como intermediario y no asume
                responsabilidad sobre:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6">
                <li>
                  La veracidad de la información proporcionada por el
                  propietario
                </li>
                <li>El estado legal del inmueble</li>
                <li>Vicios ocultos o problemas no declarados</li>
                <li>
                  El cumplimiento de las obligaciones entre comprador y vendedor
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                9. Modificaciones
              </h2>
              <p className="mb-4">
                {accountData.name} se reserva el derecho de modificar estos
                términos y condiciones, notificando los cambios con la debida
                antelación a través de los medios de contacto proporcionados.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                10. Legislación Aplicable y Jurisdicción
              </h2>
              <p className="mb-4">
                Estos términos y condiciones se rigen por la legislación
                española. Para la resolución de cualquier controversia, las
                partes se someten a los juzgados y tribunales del domicilio del
                prestador de servicios.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                11. Contacto
              </h2>
              <p className="mb-4">
                Para cualquier consulta sobre estos términos y condiciones,
                puede contactar con nosotros a través de:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                {accountData.email && (
                  <li>
                    Email:{" "}
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
                    Teléfono:{" "}
                    <a
                      href={`tel:${accountData.phone}`}
                      className="transition-colors hover:text-primary"
                    >
                      {accountData.phone}
                    </a>
                  </li>
                )}
                {accountData.address && (
                  <li>Dirección: {accountData.address}</li>
                )}
              </ul>
            </section>

            <div className="mt-8 border-t pt-6 text-xs">
              <p>Última actualización: abril de 2025</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
