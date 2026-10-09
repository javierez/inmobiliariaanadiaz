// Hardcoded navigation override for account 122.
// This account wants a deliberately minimal top nav — only "Servicios" and
// "Contacto" — instead of the full Comprar/Alquilar/Vender/Nosotros/Enlaces
// menu the shared template renders. Lives in code (not DB) because the navbar
// link set is not modelled in website_config.

export const ACCOUNT_122_ID = "122";

export function isAccount122(): boolean {
  return process.env.NEXT_PUBLIC_ACCOUNT_ID === ACCOUNT_122_ID;
}
