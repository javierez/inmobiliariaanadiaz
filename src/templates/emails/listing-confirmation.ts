/**
 * Confirmation email sent to sellers who submit a property listing
 * via the "Vender" section of the website.
 * Table-based layout for email client compatibility.
 */

export interface ListingConfirmationData {
  ownerName: string;
  referenceNumber: string;
  propertyType: string;
  address: string;
  listingType: "Sale" | "Rent";
  price: string;
  agencyName: string;
  agencyPhone?: string | null;
  agencyEmail?: string | null;
  logoUrl?: string | null;
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  piso: "Piso",
  casa: "Casa",
  local: "Local comercial",
  solar: "Terreno",
  garaje: "Garaje",
  chalet: "Chalet",
  atico: "Atico",
  duplex: "Duplex",
  estudio: "Estudio",
};

function formatPrice(price: string): string {
  const num = parseFloat(price);
  if (isNaN(num)) return price;
  return num.toLocaleString("es-ES", { minimumFractionDigits: 0 });
}

export function generateListingConfirmationEmail(
  data: ListingConfirmationData,
): { subject: string; html: string; text: string } {
  const firstName = data.ownerName.split(" ")[0] ?? data.ownerName;
  const propertyLabel =
    PROPERTY_TYPE_LABELS[data.propertyType.toLowerCase()] ?? data.propertyType;
  const priceLabel =
    data.listingType === "Rent"
      ? `${formatPrice(data.price)} &euro;/mes`
      : `${formatPrice(data.price)} &euro;`;
  const listingTypeLabel = data.listingType === "Rent" ? "Alquiler" : "Venta";

  const subject = `Hemos recibido tu propiedad - Ref. ${data.referenceNumber}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style type="text/css">
          @media only screen and (max-width: 600px) {
            .email-container { width: 100% !important; max-width: 100% !important; }
            .email-padding { padding-left: 16px !important; padding-right: 16px !important; }
            .email-outer-padding { padding: 20px 10px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #111827; background-color: #f9fafb;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9fafb;">
          <tr>
            <td align="center" class="email-outer-padding" style="padding: 40px 20px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" class="email-container" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px;">

                <!-- Logo -->
                ${
                  data.logoUrl
                    ? `
                <tr>
                  <td align="center" class="email-padding" style="padding: 32px 40px 24px 40px;">
                    <img src="${data.logoUrl}" alt="${data.agencyName}" width="180" style="max-width: 180px; width: 100%; height: auto; display: block;" />
                  </td>
                </tr>
                `
                    : ""
                }

                <!-- Greeting -->
                <tr>
                  <td class="email-padding" style="padding: ${data.logoUrl ? "0" : "32px"} 40px 20px 40px;">
                    <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: #111827; line-height: 1.4;">
                      Hola ${firstName},
                    </h1>
                  </td>
                </tr>

                <!-- Message -->
                <tr>
                  <td class="email-padding" style="padding: 0 40px;">
                    <p style="margin: 0 0 18px 0; font-size: 15px; color: #374151; line-height: 1.7;">
                      Hemos recibido correctamente la informaci&oacute;n de tu propiedad. Nuestro equipo la revisar&aacute; y se pondr&aacute; en contacto contigo para los pr&oacute;ximos pasos.
                    </p>
                  </td>
                </tr>

                <!-- Property Summary Card -->
                <tr>
                  <td class="email-padding" style="padding: 0 40px 20px 40px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                      <tr>
                        <td style="background-color: #f9fafb; padding: 16px;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 12px;">
                                Resumen de tu propiedad
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom: 8px;">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                  <tr>
                                    <td style="font-size: 13px; color: #6b7280; width: 120px;">Referencia</td>
                                    <td style="font-size: 13px; font-weight: 600; color: #111827;">${data.referenceNumber}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom: 8px;">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                  <tr>
                                    <td style="font-size: 13px; color: #6b7280; width: 120px;">Tipo</td>
                                    <td style="font-size: 13px; color: #111827;">${propertyLabel}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom: 8px;">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                  <tr>
                                    <td style="font-size: 13px; color: #6b7280; width: 120px;">Direcci&oacute;n</td>
                                    <td style="font-size: 13px; color: #111827;">${data.address}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom: 8px;">
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                  <tr>
                                    <td style="font-size: 13px; color: #6b7280; width: 120px;">Operaci&oacute;n</td>
                                    <td style="font-size: 13px; color: #111827;">${listingTypeLabel}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                  <tr>
                                    <td style="font-size: 13px; color: #6b7280; width: 120px;">Precio</td>
                                    <td style="font-size: 15px; font-weight: 600; color: #111827;">${priceLabel}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Next steps -->
                <tr>
                  <td class="email-padding" style="padding: 0 40px;">
                    <p style="margin: 0 0 18px 0; font-size: 15px; color: #374151; line-height: 1.7;">
                      Si tienes alguna duda, no dudes en contactarnos${data.agencyPhone ? ` al <a href="tel:${data.agencyPhone.replace(/\s/g, "")}" style="color: #111827; font-weight: 500; text-decoration: underline;">${data.agencyPhone}</a>` : ""}${data.agencyEmail ? ` o por email a <a href="mailto:${data.agencyEmail}" style="color: #111827; font-weight: 500; text-decoration: underline;">${data.agencyEmail}</a>` : ""}.
                    </p>
                    <p style="margin: 0 0 4px 0; font-size: 15px; color: #374151; line-height: 1.7;">
                      &iexcl;Gracias por confiar en nosotros!
                    </p>
                    <p style="margin: 0; font-size: 15px; font-weight: 600; color: #111827;">
                      ${data.agencyName}
                    </p>
                  </td>
                </tr>

                <!-- Spacer -->
                <tr><td style="padding: 0 0 32px 0;"></td></tr>

                <!-- Footer -->
                <tr>
                  <td class="email-padding" style="padding: 24px 40px; border-top: 1px solid #e5e7eb;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="color: #9ca3af; font-size: 12px; line-height: 1.6;">
                          <p style="margin: 0;">&copy; ${new Date().getFullYear()} ${data.agencyName}. Todos los derechos reservados.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = `Hola ${firstName},

Hemos recibido correctamente la informacion de tu propiedad. Nuestro equipo la revisara y se pondra en contacto contigo para los proximos pasos.

Resumen de tu propiedad:
- Referencia: ${data.referenceNumber}
- Tipo: ${propertyLabel}
- Direccion: ${data.address}
- Operacion: ${listingTypeLabel}
- Precio: ${formatPrice(data.price)} EUR${data.listingType === "Rent" ? "/mes" : ""}

Si tienes alguna duda, no dudes en contactarnos${data.agencyPhone ? ` al ${data.agencyPhone}` : ""}${data.agencyEmail ? ` o por email a ${data.agencyEmail}` : ""}.

Gracias por confiar en nosotros!
${data.agencyName}

---
(c) ${new Date().getFullYear()} ${data.agencyName}. Todos los derechos reservados.`;

  return { subject, html, text };
}
