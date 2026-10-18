import Link from "next/link";

/**
 * RGPD art. 13: who uses the data, what for and where the rights are, said
 * right where a form asks for a name, phone or email. The full text lives on
 * /proteccion-de-datos with the agency's legal name.
 */
export function PrivacyNotice() {
  return (
    <p className="text-xs leading-relaxed text-muted-foreground">
      Esta inmobiliaria usará tus datos solo para responder a tu consulta.
      Puedes acceder a ellos, corregirlos o pedir que los borremos cuando
      quieras.{" "}
      <Link href="/proteccion-de-datos" className="underline underline-offset-4">
        Protección de datos
      </Link>
    </p>
  );
}
