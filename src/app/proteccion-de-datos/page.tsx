import type { Metadata } from "next";
import Footer from "~/components/footer";
import { getAccountLegalData } from "~/server/queries/account";
import { env } from "~/env";
import PoliticaPrivacidadBurgoNuevo from "./burgo-nuevo";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const metadata: Metadata = {
  title: "Política de Protección de Datos",
  description:
    "Política de privacidad y protección de datos personales conforme al RGPD. Información sobre el tratamiento de sus datos.",
  alternates: {
    canonical: `${baseUrl}/proteccion-de-datos`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function ProteccionDatosPage() {
  if (env.NEXT_PUBLIC_ACCOUNT_ID === "111") {
    return <PoliticaPrivacidadBurgoNuevo />;
  }

  const accountData = await getAccountLegalData(env.NEXT_PUBLIC_ACCOUNT_ID);

  if (!accountData) {
    return <div>Error al cargar los datos legales.</div>;
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">
            Política de Protección de Datos
          </h1>
          <p className="text-lg text-muted-foreground">
            Información sobre el tratamiento de datos personales conforme al
            Reglamento General de Protección de Datos (RGPD)
          </p>
        </div>

        <div className="prose prose-gray max-w-none dark:prose-invert">
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">
              Responsable del Tratamiento
            </h2>
            <ul className="mb-4 space-y-2">
              <li>
                <strong>
                  {accountData.accountType === "company"
                    ? "Denominación"
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
                  <strong>Domicilio:</strong> {accountData.address}
                </li>
              )}
              {accountData.privacyEmail && (
                <li>
                  <strong>Email:</strong>{" "}
                  <a
                    href={`mailto:${accountData.privacyEmail}`}
                    className="transition-colors hover:text-primary"
                  >
                    {accountData.privacyEmail}
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
              {accountData.dpoEmail &&
                accountData.dpoEmail !== accountData.email && (
                  <li>
                    <strong>Delegado de Protección de Datos (DPD):</strong>{" "}
                    <a
                      href={`mailto:${accountData.dpoEmail}`}
                      className="transition-colors hover:text-primary"
                    >
                      {accountData.dpoEmail}
                    </a>
                  </li>
                )}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">
              Finalidades del Tratamiento
            </h2>

            <h3 className="mb-3 text-xl font-semibold">
              1. Servicios Inmobiliarios
            </h3>
            <p className="mb-4">
              <strong>Datos tratados:</strong> Datos de contacto, preferencias
              inmobiliarias, situación económica, documentación de
              identificación.
            </p>
            <p className="mb-4">
              <strong>Base legal:</strong> Ejecución de contrato y
              consentimiento del interesado.
            </p>
            <p className="mb-4">
              <strong>Finalidad:</strong> Gestionar la compra, venta o alquiler
              de propiedades, búsqueda de inmuebles que se ajusten a sus
              necesidades, gestión de visitas y seguimiento comercial.
            </p>

            <h3 className="mb-3 text-xl font-semibold">
              2. Comunicaciones Comerciales
            </h3>
            <p className="mb-4">
              <strong>Datos tratados:</strong> Email, teléfono, preferencias
              comerciales.
            </p>
            <p className="mb-4">
              <strong>Base legal:</strong> Consentimiento específico del
              interesado.
            </p>
            <p className="mb-4">
              <strong>Finalidad:</strong> Envío de información sobre nuevas
              propiedades, ofertas especiales y noticias del sector
              inmobiliario.
            </p>

            <h3 className="mb-3 text-xl font-semibold">3. Gestión de la Web</h3>
            <p className="mb-4">
              <strong>Datos tratados:</strong> Datos de navegación, cookies
              técnicas, IP.
            </p>
            <p className="mb-4">
              <strong>Base legal:</strong> Interés legítimo.
            </p>
            <p className="mb-4">
              <strong>Finalidad:</strong> Funcionamiento del sitio web, análisis
              de uso y mejora de servicios.
            </p>

            <h3 className="mb-3 text-xl font-semibold">
              4. Atención al Cliente
            </h3>
            <p className="mb-4">
              <strong>Datos tratados:</strong> Datos de contacto, consultas
              realizadas.
            </p>
            <p className="mb-4">
              <strong>Base legal:</strong> Interés legítimo y ejecución
              precontractual.
            </p>
            <p className="mb-4">
              <strong>Finalidad:</strong> Gestión de consultas, reclamaciones y
              atención al cliente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">
              Conservación de Datos
            </h2>
            <ul className="mb-4 space-y-3">
              <li>
                <strong>Servicios inmobiliarios:</strong> Durante la relación
                contractual y 6 años adicionales para el cumplimiento de
                obligaciones legales.
              </li>
              <li>
                <strong>Comunicaciones comerciales:</strong> Hasta que retire el
                consentimiento.
              </li>
              <li>
                <strong>Datos de navegación:</strong> Máximo 24 meses desde la
                última visita.
              </li>
              <li>
                <strong>Consultas y reclamaciones:</strong> 3 años desde la
                resolución del asunto.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">
              Comunicación de Datos
            </h2>
            <p className="mb-4">Sus datos podrán ser comunicados a:</p>
            <ul className="mb-4 space-y-2">
              <li>
                <strong>Entidades bancarias:</strong> Para tramitación de
                hipotecas y financiación
              </li>
              <li>
                <strong>Notarías y registros:</strong> Para formalización de
                operaciones
              </li>
              <li>
                <strong>Administraciones públicas:</strong> Cuando sea
                legalmente exigible
              </li>
              <li>
                <strong>Portales inmobiliarios:</strong> Para publicación de
                propiedades (previo consentimiento)
              </li>
              <li>
                <strong>Proveedores de servicios:</strong> Plataformas
                tecnológicas, servicios de marketing (bajo acuerdos de encargo
                de tratamiento)
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">
              Transferencias Internacionales
            </h2>
            <p className="mb-4">
              En caso de utilizar servicios tecnológicos ubicados fuera del
              Espacio Económico Europeo, nos aseguramos de que existan garantías
              adecuadas de protección mediante:
            </p>
            <ul className="mb-4 space-y-1">
              <li>• Decisiones de adecuación de la Comisión Europea</li>
              <li>
                • Cláusulas contractuales tipo aprobadas por la Comisión Europea
              </li>
              <li>
                • Certificaciones de privacidad reconocidas internacionalmente
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Sus Derechos</h2>
            <p className="mb-4">Como titular de los datos, tiene derecho a:</p>

            <ul className="mb-4 space-y-2">
              <li>
                <strong>Acceso:</strong> Conocer qué datos tratamos sobre usted
              </li>
              <li>
                <strong>Rectificación:</strong> Modificar datos inexactos o
                incompletos
              </li>
              <li>
                <strong>Supresión:</strong> Eliminar sus datos cuando no sean
                necesarios
              </li>
              <li>
                <strong>Limitación:</strong> Restringir el tratamiento de sus
                datos
              </li>
              <li>
                <strong>Portabilidad:</strong> Recibir sus datos en formato
                estructurado
              </li>
              <li>
                <strong>Oposición:</strong> Oponerse al tratamiento de sus datos
              </li>
            </ul>

            {accountData.privacyEmail && (
              <p className="mb-4">
                Puede ejercer estos derechos enviando un email a{" "}
                <a
                  href={`mailto:${accountData.privacyEmail}`}
                  className="font-bold transition-colors hover:text-primary"
                >
                  {accountData.privacyEmail}
                </a>{" "}
                adjuntando copia de su DNI o documento identificativo
                equivalente.
              </p>
            )}
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">
              Medidas de Seguridad
            </h2>
            <p className="mb-4">
              Hemos implementado medidas técnicas y organizativas apropiadas
              para proteger sus datos personales:
            </p>
            <ul className="mb-4 space-y-2">
              <li>
                <strong>Cifrado:</strong> Comunicaciones SSL/TLS en toda la
                plataforma
              </li>
              <li>
                <strong>Acceso restringido:</strong> Solo personal autorizado
                accede a los datos
              </li>
              <li>
                <strong>Copias de seguridad:</strong> Respaldos regulares con
                cifrado
              </li>
              <li>
                <strong>Formación:</strong> El personal recibe formación regular
                en protección de datos
              </li>
              <li>
                <strong>Auditorías:</strong> Revisiones periódicas de seguridad
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Menores de Edad</h2>
            <p className="mb-4">
              Nuestros servicios están dirigidos a personas mayores de 14 años.
              Si eres menor de 14 años, necesitas el consentimiento de tus
              padres o tutores para utilizar nuestros servicios.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Reclamaciones</h2>
            <p className="mb-4">
              Si considera que el tratamiento de sus datos personales vulnera la
              normativa de protección de datos, puede presentar una reclamación
              ante la Agencia Española de Protección de Datos (AEPD):
            </p>
            <ul className="mb-4 space-y-1">
              <li>
                <strong>Web:</strong> www.aepd.es
              </li>
              <li>
                <strong>Dirección:</strong> C/ Jorge Juan, 6, 28001 Madrid
              </li>
              <li>
                <strong>Teléfono:</strong> 901 100 099 - 912 663 517
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Modificaciones</h2>
            <p className="mb-4">
              Esta Política de Protección de Datos puede ser modificada para
              adaptarse a cambios normativos o mejoras en nuestros servicios.
              Las modificaciones serán comunicadas con la debida antelación a
              través de nuestro sitio web.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Contacto</h2>
            <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-900">
              {accountData.dpoEmail &&
              accountData.dpoEmail !== accountData.email ? (
                <h4 className="mb-4 font-semibold">
                  Delegado de Protección de Datos (DPD)
                </h4>
              ) : (
                <h4 className="mb-4 font-semibold">
                  Responsable de Protección de Datos
                </h4>
              )}
              <ul className="space-y-1">
                {(accountData.dpoEmail || accountData.email) && (
                  <li>
                    <strong>Email:</strong>{" "}
                    <a
                      href={`mailto:${accountData.dpoEmail || accountData.email}`}
                      className="transition-colors hover:text-primary"
                    >
                      {accountData.dpoEmail || accountData.email}
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
            </div>
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
