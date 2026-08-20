import type { HeroProps } from "../../lib/data";
import { getContactProps } from "./contact";

export type HeroPropsWithCities = HeroProps & { cities: string[] };

/**
 * Cities used for the homepage rotation and the navbar "Zonas" dropdown.
 * Sourced from the offices configured in `website_config.contact_props`,
 * not from the listings table — this is the authoritative list of cities
 * the agency has a physical presence in.
 */
export const getHeroCities = (_accountId?: bigint): string[] => {
  return ["León"];
}

// Using React cache to memoize the query
export const getHeroProps = (_accountIdArg?: bigint): HeroProps | null => {
  return {
  "title": "Asesoramiento inmobiliario individualizado en León desde 1989",
  "subtitle": "Inmobiliaria de referencia en León con más de tres décadas de experiencia en compraventa y alquiler de viviendas, locales y suelo.",
  "backgroundImage": "",
  "backgroundVideo": "https://vesta-crm-prod-eu-e966e353.s3.eu-west-1.amazonaws.com/accounts/137/hero/background_1780313905464_YWK1cM.mp4",
  "backgroundType": "video",
  "findPropertyButton": "Explorar Propiedades",
  "contactButton": "Contáctanos"
};
}
