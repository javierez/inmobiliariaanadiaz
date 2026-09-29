import { getHeroProps, getHeroCities } from "../server/queries/hero";
import { getFeaturesProps } from "../server/queries/website-config";
import { HeroClient } from "./hero-client";

export default async function Hero({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [heroProps, cities, features] = await Promise.all([
    getHeroProps(),
    getHeroCities(),
    getFeaturesProps(),
  ]);

  // Fallbacks in case data is missing
  const title = heroProps?.title || "Encuentra Tu Propiedad Soñada";
  const subtitle =
    heroProps?.subtitle ||
    "Descubre propiedades excepcionales en ubicaciones privilegiadas. Permítenos guiarte en tu viaje inmobiliario.";
  const findPropertyButton =
    heroProps?.findPropertyButton || "Explorar Propiedades";
  // Contact label is config-driven (features_props.menuLabels.contacto).
  const contactButton =
    features.menuLabels?.contacto || heroProps?.contactButton || "Contáctanos";
  const backgroundMedia = heroProps?.backgroundMedia;
  const backgroundType = heroProps?.backgroundType || "image";
  const backgroundVideo = heroProps?.backgroundVideo;
  const backgroundImage = heroProps?.backgroundImage;

  return (
    <HeroClient
      title={title}
      subtitle={subtitle}
      findPropertyButton={findPropertyButton}
      contactButton={contactButton}
      backgroundMedia={backgroundMedia}
      backgroundType={backgroundType}
      backgroundVideo={backgroundVideo}
      backgroundImage={backgroundImage}
      cities={cities}
    >
      {children}
    </HeroClient>
  );
}
