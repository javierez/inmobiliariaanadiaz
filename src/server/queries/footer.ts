
import type { FooterProps } from "../../lib/data";

export const getFooterProps = (_accountIdArg?: bigint): FooterProps | null => {
  return {
  "companyName": "Inmobiliaria Ana Díaz, S.L.",
  "description": "Asesoramiento inmobiliario individualizado en León desde 1989. Profesionalidad y confianza.",
  "socialLinks": {
  "facebook": "https://www.facebook.com/InmobiliariaAnaDiaz",
  "instagram": "https://www.instagram.com/inmobiliariaanadiaz"
},
  "officeLocations": [{
  "name": "Oficina León",
  "address": ["C/ Roa de la Vega, 12 - bajo", "León, León"],
  "phone": "987 22 11 55",
  "email": "inmo@inmobiliariaanadiaz.es"
}],
  "copyright": "© 2026 Inmobiliaria Ana Díaz. Todos los derechos reservados."
};
}
