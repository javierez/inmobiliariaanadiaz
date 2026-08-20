import { getAboutProps } from "../server/queries/about";
import { AboutHeader } from "./about/AboutHeader";
import { ServicesGrid } from "./about/ServicesGrid";
import { MissionSection } from "./about/MissionSection";
import { KpiSection } from "./about/KpiSection";
import { AboutButton } from "./about/AboutButton";

export async function AboutSection() {
  const aboutProps = await getAboutProps();

  // Fallbacks in case data is missing
  const title = aboutProps?.title || "Sobre Nosotros";
  const subtitle =
    aboutProps?.subtitle || "Tu socio de confianza en el viaje inmobiliario";
  const content =
    aboutProps?.content ||
    "Creemos que encontrar la propiedad perfecta debe ser una experiencia emocionante y gratificante. Con años de experiencia en la industria, nuestro dedicado equipo de profesionales está comprometido a proporcionar un servicio y orientación excepcionales a lo largo de tu viaje inmobiliario.";
  const content2 =
    aboutProps?.content2 ||
    "Ya sea que estés comprando tu primera casa, vendiendo una propiedad o buscando oportunidades de inversión, tenemos el conocimiento, los recursos y la pasión para ayudarte a lograr tus objetivos inmobiliarios.";
  const services = aboutProps?.services || [
    { title: "Conocimiento local experto", icon: "map" },
    { title: "Servicio personalizado", icon: "user" },
    { title: "Comunicación transparente", icon: "message-square" },
    { title: "Experiencia en negociación", icon: "handshake" },
    { title: "Marketing integral", icon: "megaphone" },
    { title: "Soporte continuo", icon: "help-circle" },
  ];

  // Prepare KPI data
  const kpis = [];
  if (aboutProps?.kpi1Name && aboutProps?.kpi1Data)
    kpis.push({ name: aboutProps.kpi1Name, data: aboutProps.kpi1Data });
  if (aboutProps?.kpi2Name && aboutProps?.kpi2Data)
    kpis.push({ name: aboutProps.kpi2Name, data: aboutProps.kpi2Data });
  if (aboutProps?.kpi3Name && aboutProps?.kpi3Data)
    kpis.push({ name: aboutProps.kpi3Name, data: aboutProps.kpi3Data });
  if (aboutProps?.kpi4Name && aboutProps?.kpi4Data)
    kpis.push({ name: aboutProps.kpi4Name, data: aboutProps.kpi4Data });

  return (
    <section className="pb-12 pt-24 sm:pb-16 lg:pb-24" id="about">
      <div className="container">
        <AboutHeader title={title} subtitle={subtitle} />

        <div className="grid items-start gap-8 sm:gap-12 lg:grid-cols-2">
          <ServicesGrid
            services={services}
            title={aboutProps?.servicesSectionTitle || "Nuestros Servicios"}
            maxServicesDisplayed={aboutProps?.maxServicesDisplayed || 6}
          />

          <MissionSection
            title={aboutProps?.aboutSectionTitle || "Nuestra Misión"}
            content={content}
            content2={content2}
          />
        </div>

        <AboutButton
          text={aboutProps?.buttonName || "Contacta a Nuestro Equipo"}
          href="#contact"
        />

        {aboutProps?.showKPI && <KpiSection kpis={kpis} />}
      </div>
    </section>
  );
}
