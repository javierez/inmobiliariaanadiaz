import Footer from "~/components/footer";
import Link from "next/link";
import { getAccountLegalData } from "~/server/queries/account";
import { env } from "~/env";
import BreadcrumbJsonLd from "~/components/breadcrumb-json-ld";
import FaqJsonLd from "~/components/faq-json-ld";
import { getFaqsProps } from "~/server/queries/website-config";
import { FaqList } from "~/components/faqs/faq-list";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

const getFaqs = (accountData: { legalName: string }) => {
  return [
    {
      category: "Comprar una Propiedad",
      questions: [
        {
          question: "¿Qué documentación necesito para comprar una propiedad?",
          answer:
            "Para comprar una propiedad en España necesitará: NIE (Número de Identificación de Extranjero) si no es ciudadano español, prueba de ingresos (nóminas, declaración de la renta), extractos bancarios de los últimos 3 meses, y pre-aprobación hipotecaria si necesita financiación. También recomendamos contar con un abogado especializado en derecho inmobiliario.",
        },
        {
          question: "¿Cuánto dinero necesito para las arras o señal?",
          answer:
            "Las arras o señal suelen representar entre el 5% y 10% del precio de venta de la propiedad, siendo el 10% lo más habitual. Este dinero se entrega al firmar el contrato de arras y se descontará del precio final en la escritura pública. Es importante especificar el tipo de arras (confirmatorias, penitenciales o penales) en el contrato.",
        },
        {
          question: "¿Qué gastos adicionales debo considerar al comprar?",
          answer:
            "Los gastos adicionales incluyen: Impuesto de Transmisiones Patrimoniales (ITP) del 6-10% para propiedades usadas o IVA del 10% más AJD (0.5-1.5%) para obra nueva, gastos de notaría (0.1-0.5%), registro de la propiedad (0.1-0.3%), tasación (300-600€), gestoría (300-800€), y abogado (0.5-1% del precio). En total, calcule entre 10-15% del precio de compra.",
        },
        {
          question: "¿Cuánto tiempo toma el proceso de compra?",
          answer:
            "El proceso completo suele tomar entre 6-12 semanas desde la oferta hasta la firma de la escritura. Esto incluye: negociación y firma de arras (1-2 semanas), solicitud y aprobación de hipoteca (3-6 semanas), y preparación de documentación legal (2-3 semanas). Los plazos pueden variar según la complejidad de la operación.",
        },
        {
          question: "¿Qué es la escritura pública y por qué es importante?",
          answer:
            "La escritura pública es el documento legal que formaliza la compraventa ante notario. Es obligatoria para transmitir la propiedad y debe inscribirse en el Registro de la Propiedad para que la compra sea oponible frente a terceros. Sin este documento, la compraventa no tiene validez legal completa.",
        },
      ],
    },
    {
      category: "Vender una Propiedad",
      questions: [
        {
          question: "¿Qué documentos necesito para vender mi propiedad?",
          answer:
            "Necesitará: escritura pública de la propiedad, nota simple del registro de la propiedad (actualizada), certificado energético vigente, recibo del IBI (último pagado), recibos de gastos de comunidad al corriente, cédula de habitabilidad (si es requerida en su comunidad autónoma), y planos de la vivienda si están disponibles.",
        },
        {
          question: "¿Cómo se determina el precio de venta de mi propiedad?",
          answer:
            "El precio se determina mediante un análisis comparativo de mercado que considera: ubicación, tamaño, estado de conservación, características especiales, precios de propiedades similares vendidas recientemente, tendencias del mercado local, y mejoras realizadas. Ofrecemos una valoración gratuita y profesional de su propiedad.",
        },
        {
          question: "¿Cuáles son los gastos de venta para el propietario?",
          answer:
            "Como vendedor, normalmente pagará: comisión inmobiliaria (3-6% + IVA), plusvalía municipal si corresponde (variable según años de tenencia y valor catastral), certificado energético (100-300€), y posibles reparaciones menores recomendadas. En algunos casos también impuestos sobre ganancias patrimoniales.",
        },
        {
          question:
            "¿Qué es un contrato de exclusividad y cuáles son sus ventajas?",
          answer:
            "Un contrato de exclusividad nos otorga el derecho exclusivo de comercializar su propiedad durante un período determinado (típicamente 3-6 meses). Las ventajas incluyen: mayor inversión en marketing, mejor coordinación de visitas, estrategia de venta más enfocada, y generalmente mejores resultados de venta. No hay costes adicionales por la exclusividad.",
        },
        {
          question: "¿Cuánto tiempo tardará en venderse mi propiedad?",
          answer:
            "Haremos todo lo posible para vender su propiedad lo antes posible. Desde el primer día aplicamos nuestra mejor estrategia de precio, marketing y difusión para conseguir la venta en el menor tiempo posible.",
        },
      ],
    },
    {
      category: "Alquilar una Propiedad",
      questions: [
        {
          question: "¿Qué documentación se requiere para alquilar?",
          answer:
            "Los inquilinos típicamente necesitan: DNI/NIE, nóminas de los últimos 3 meses, contrato de trabajo, declaración de la renta del año anterior, referencias de arrendadores anteriores si las hubiera, y aval bancario o avalista (persona física que garantice el pago). Los ingresos deben ser al menos 3 veces el alquiler mensual.",
        },
        {
          question: "¿Cuánto se paga de fianza y cuándo se devuelve?",
          answer:
            "La fianza legal es de 1 mensualidad para vivienda y 2 para uso diferente. Se deposita en el organismo autonómico correspondiente. Se devuelve al finalizar el contrato, descontando posibles daños o deudas pendientes. En Madrid y otras comunidades también puede requerirse una fianza adicional equivalente a 1-2 mensualidades.",
        },
        {
          question: "¿Cuál es la duración mínima de un contrato de alquiler?",
          answer:
            "Para vivienda habitual, la duración mínima es de 5 años (7 años si el propietario es persona jurídica) según la LAU. El inquilino puede desistir a partir del sexto mes con 30 días de preaviso. Para alquileres de temporada, la duración se pacta libremente según la necesidad temporal acreditada (estudios, trabajo, etc.), sin un límite fijo por ley.",
        },
        {
          question: "¿Qué gastos van a cargo del inquilino?",
          answer:
            "Normalmente el inquilino paga: alquiler mensual, suministros (luz, gas, agua), servicios contratados (internet, teléfono), y pequeñas reparaciones por desgaste normal. Los gastos de comunidad pueden ir a cargo del propietario o inquilino según se pacte en el contrato.",
        },
        {
          question: "¿Puedo modificar la propiedad que alquilo?",
          answer:
            "Las modificaciones requieren autorización escrita del propietario. Generalmente se permiten cambios menores y reversibles (pintura, pequeñas mejoras), pero obras que afecten la estructura o instalaciones necesitan consentimiento expreso. Al finalizar el contrato, debe devolverse en el estado original salvo pacto contrario.",
        },
      ],
    },
    {
      category: "Servicios Inmobiliarios",
      questions: [
        {
          question: `¿Qué servicios ofrece ${accountData.legalName}?`,
          answer:
            "Ofrecemos servicios de intermediación inmobiliaria que incluyen la compra, venta y alquiler de propiedades. También podemos orientarle sobre valoraciones, asesoramiento hipotecario y otros aspectos del proceso inmobiliario. Contacte con nosotros para conocer en detalle cómo podemos ayudarle.",
        },
        {
          question:
            "¿Cómo garantizan la calidad de las propiedades que comercializan?",
          answer:
            "Antes de publicar una propiedad, revisamos la información proporcionada por el propietario y verificamos que la documentación básica esté en orden. Nuestro objetivo es ofrecer información clara y fiable para que pueda tomar decisiones con confianza.",
        },
        {
          question: "¿Ofrecen financiación o ayuda con hipotecas?",
          answer:
            "Podemos orientarle en el proceso de búsqueda de financiación y ponerle en contacto con entidades bancarias o asesores financieros. No obstante, no somos intermediarios financieros, por lo que le recomendamos consultar directamente con su banco o asesor de confianza.",
        },
        {
          question: "¿Atienden a compradores extranjeros?",
          answer:
            "Sí, podemos atender a compradores internacionales y orientarles sobre los pasos necesarios para adquirir una propiedad en España, como la obtención del NIE o la documentación requerida. Para cuestiones legales específicas, recomendamos contar con un abogado especializado.",
        },
        {
          question: "¿Qué garantías ofrecen en sus servicios?",
          answer:
            "Trabajamos con transparencia y profesionalidad en todas nuestras operaciones. Cumplimos con la normativa vigente del sector inmobiliario y nos comprometemos a informarle de forma clara sobre cada etapa del proceso.",
        },
      ],
    },
    {
      category: "Legal y Administrativo",
      questions: [
        {
          question: "¿Qué es el NIE y cómo lo obtengo?",
          answer:
            "El NIE (Número de Identificación de Extranjero) es obligatorio para extranjeros que realicen actividades en España, incluyendo compra de propiedades. Se solicita en: comisarías de policía especializadas, oficinas de extranjería, o consulados españoles en el extranjero. Necesitará: formulario EX-15, pasaporte, justificación del motivo (contrato de arras o certificado de interés de compra), y el pago de la tasa correspondiente (consulte el importe vigente en la sede electrónica).",
        },
        {
          question: "¿Qué impuestos debo pagar al comprar una propiedad?",
          answer:
            "Los impuestos varían según el tipo de propiedad: Vivienda usada: ITP (Impuesto de Transmisiones Patrimoniales) del 6-10% según comunidad autónoma. Vivienda nueva: IVA del 10% más AJD (Actos Jurídicos Documentados) del 0.5-1.5% según comunidad. El IVA del 21% se aplica solo a locales comerciales y garajes vendidos como anexos independientes. También se paga la plusvalía municipal, que normalmente asume el vendedor.",
        },
        {
          question: "¿Necesito un abogado para comprar una propiedad?",
          answer:
            "Aunque no es legalmente obligatorio, es altamente recomendable, especialmente para compradores extranjeros. Un abogado especializado le ayudará con: revisión de contratos, verificación de cargas sobre la propiedad, asesoramiento fiscal, representación en la compraventa, y resolución de posibles problemas legales. Los honorarios suelen ser del 0.5-1% del precio de compra.",
        },
        {
          question: "¿Qué es una nota simple y por qué es importante?",
          answer:
            "La nota simple es un documento emitido por el Registro de la Propiedad que muestra la situación legal actual de una propiedad: propietario actual, cargas, hipotecas, embargos, o cualquier limitación sobre la propiedad. Es fundamental solicitarla antes de comprar para verificar que el vendedor es el legítimo propietario y que no existen cargas ocultas.",
        },
        {
          question:
            "¿Cómo funciona el sistema de registro de la propiedad en España?",
          answer:
            "El Registro de la Propiedad es un organismo público que inscribe y publica los derechos sobre bienes inmuebles. La inscripción: otorga seguridad jurídica, es pública (cualquiera puede consultarla), tiene presunción de exactitud, y protege al propietario registral. Para que una compraventa sea completamente segura, debe inscribirse la nueva escritura de propiedad.",
        },
      ],
    },
    {
      category: "Proceso y Tecnología",
      questions: [
        {
          question: "¿Cómo puedo buscar propiedades en su plataforma?",
          answer:
            "Nuestra plataforma ofrece búsqueda avanzada con filtros por: ubicación (ciudad, barrio, código postal), tipo de propiedad (piso, casa, local, terreno, garaje), precio, número de habitaciones y baños, superficie, características especiales, y estado. También puede guardar búsquedas favoritas y recibir alertas de nuevas propiedades que coincidan con sus criterios.",
        },
        {
          question: "¿Ofrecen visitas virtuales de las propiedades?",
          answer:
            "Sí, ofrecemos múltiples opciones: tours virtuales 360°, vídeos profesionales, planos interactivos, fotografías de alta calidad, y visitas virtuales en vivo por videollamada con nuestros agentes. Esto es especialmente útil para compradores internacionales o para hacer una primera selección antes de las visitas presenciales.",
        },
        {
          question: "¿Cómo programo una visita a una propiedad?",
          answer:
            "Puede programar visitas fácilmente: a través de nuestra web usando el formulario de contacto, llamando directamente a nuestro teléfono, enviando un WhatsApp, o a través del chat en línea. Ofrecemos flexibilidad horaria, incluyendo fines de semana y horarios de tarde. Para grupos o visitas múltiples, organizamos tours personalizados.",
        },
        {
          question: "¿Mantienen actualizadas las propiedades disponibles?",
          answer:
            "Sí, actualizamos nuestro inventario en tiempo real. Las propiedades vendidas o alquiladas se retiran inmediatamente de la web. Nuevas propiedades se publican tan pronto como completamos la verificación documental y el reportaje fotográfico. También actualizamos precios y características cuando los propietarios realizan cambios.",
        },
        {
          question:
            "¿Cómo me mantengo informado sobre el mercado inmobiliario?",
          answer:
            "Ofrecemos varios recursos informativos: newsletter mensual con tendencias del mercado, blog con artículos especializados, informes trimestrales de mercado, alertas personalizadas de propiedades, consultas de valoración gratuitas, y asesoramiento personalizado con nuestros expertos. También compartimos información relevante en nuestras redes sociales.",
        },
      ],
    },
  ];
};

/**
 * The FAQs page body, for an arbitrary account.
 *
 * Split out of \`page.tsx\` so the CRM preview can render the real page for the
 * account being edited: a route file may only export the Next-reserved names,
 * so a component taking \`accountId\` cannot live there.
 */
export async function FaqsContent({
  accountId,
  live = false,
}: { accountId?: bigint; live?: boolean } = {}) {
  const accountData = await getAccountLegalData(
    accountId?.toString() ?? env.NEXT_PUBLIC_ACCOUNT_ID,
  );

  if (!accountData) {
    return <div>Error al cargar los datos.</div>;
  }

  // Account-customized FAQs (managed from the CRM) take precedence; fall back
  // to the built-in default set when the account hasn't configured any.
  const dbFaqs = await getFaqsProps(accountId);
  const faqs = dbFaqs.length > 0 ? dbFaqs : getFaqs(accountData);

  return (
    <main className="min-h-screen bg-background">
      <BreadcrumbJsonLd
        siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com"}
        items={[
          { name: "Inicio", href: "/" },
          { name: "Preguntas Frecuentes", href: "/faqs" },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
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
              Preguntas Frecuentes
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
              Preguntas Frecuentes
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Encuentra respuestas a las preguntas más comunes sobre servicios
              inmobiliarios, procesos de compra, venta y alquiler de
              propiedades.
            </p>
          </div>

          {/* FAQ Categories — a client component so the CRM preview can
              follow an edit without reloading the frame. */}
          <FaqList
            initial={dbFaqs}
            fallback={getFaqs(accountData)}
            live={live}
          />

          {/* Contact */}
          <div className="mx-auto mt-16 max-w-4xl border-t pt-8 text-center">
            <h3 className="mb-4 text-2xl font-bold tracking-tight">
              ¿No encuentra la respuesta que busca?
            </h3>
            <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
              Nuestro equipo de expertos está aquí para ayudarle con cualquier
              consulta específica.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 text-sm sm:flex-row">
              <Link
                href="/contacto"
                className="font-medium text-primary hover:underline"
              >
                Contactar ahora
              </Link>
              {accountData.email && (
                <>
                  <span className="hidden text-muted-foreground sm:inline">
                    |
                  </span>
                  <a
                    href={`mailto:${accountData.email}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {accountData.email}
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer accountId={accountId} />
    </main>
  );
}
