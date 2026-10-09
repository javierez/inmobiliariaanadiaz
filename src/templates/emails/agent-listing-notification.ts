/**
 * Agent notification email when a new property listing is submitted
 * from the "Vender" section of the website.
 * Table-based layout for email client compatibility.
 */

export interface AgentListingNotificationData {
  ownerName: string;
  ownerEmail?: string | null;
  ownerPhone?: string | null;
  referenceNumber: string;
  propertyType: string;
  propertyAddress: string;
  listingType: string;
  price: string;
  logoUrl?: string | null;
  agencyName: string;
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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function generateAgentListingNotificationEmail(
  data: AgentListingNotificationData,
): { subject: string; html: string; text: string } {
  const propertyLabel =
    PROPERTY_TYPE_LABELS[data.propertyType.toLowerCase()] ?? data.propertyType;
  const listingTypeLabel = data.listingType === "Rent" ? "Alquiler" : "Venta";
  const priceFormatted = formatPrice(data.price);
  const priceDisplay =
    data.listingType === "Rent"
      ? `${priceFormatted}&euro;/mes`
      : `${priceFormatted}&euro;`;

  const subject = `Nueva captacion web: ${data.ownerName}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapeHtml(subject)}</title>
        <style type="text/css">
          @media only screen and (max-width: 600px) {
            .email-container { width: 100% !important; max-width: 100% !important; }
            .email-padding { padding-left: 16px !important; padding-right: 16px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #111827; background-color: #f9fafb;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9fafb;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" class="email-container" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px;">

                <!-- Logo -->
                ${
                  data.logoUrl
                    ? `
                <tr>
                  <td class="email-padding" style="padding: 32px 40px 20px 40px;">
                    <img src="${data.logoUrl}" alt="${escapeHtml(data.agencyName)}" width="160" style="max-width: 160px; height: auto; display: block;" />
                  </td>
                </tr>
                `
                    : ""
                }

                <!-- Title -->
                <tr>
                  <td class="email-padding" style="padding: ${data.logoUrl ? "0" : "32px"} 40px 16px 40px;">
                    <h1 style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">Nueva propiedad recibida desde la web</h1>
                  </td>
                </tr>

                <!-- Owner contact card (stacked) -->
                <tr>
                  <td class="email-padding" style="padding: 0 40px 10px 40px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 1px solid #e5e7eb; border-radius: 6px; background: #ffffff;">
                      <tr>
                        <td style="padding: 12px;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="font-size: 14px; font-weight: 600; color: #111827; padding-bottom: 8px;">
                                ${escapeHtml(data.ownerName)}
                              </td>
                            </tr>
                            ${
                              data.ownerPhone
                                ? `
                            <tr>
                              <td style="padding-bottom: 4px;">
                                <a href="tel:${data.ownerPhone.replace(/\s/g, "")}" style="color: #374151; text-decoration: none; font-size: 13px;">
                                  &#x1F4DE; ${escapeHtml(data.ownerPhone)}
                                </a>
                              </td>
                            </tr>
                            `
                                : ""
                            }
                            ${
                              data.ownerEmail
                                ? `
                            <tr>
                              <td>
                                <a href="mailto:${data.ownerEmail}" style="color: #374151; text-decoration: none; font-size: 13px;">
                                  &#x2709;&#xFE0F; ${escapeHtml(data.ownerEmail)}
                                </a>
                              </td>
                            </tr>
                            `
                                : ""
                            }
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Property card -->
                <tr>
                  <td class="email-padding" style="padding: 0 40px 16px 40px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; background: #ffffff;">
                      <tr>
                        <td style="padding: 30px 20px; background: #f9fafb; text-align: center;">
                          <div style="font-size: 36px; margin-bottom: 4px;">&#x1F3E0;</div>
                          <div style="font-size: 12px; font-weight: 400; color: #6b7280;">${escapeHtml(propertyLabel)}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 10px 0 10px;">
                          <span style="display: inline-block; background: #f3f4f6; color: #374151; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; margin-right: 6px;">${escapeHtml(propertyLabel)}</span>
                          <span style="display: inline-block; background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 500;">${listingTypeLabel}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="font-size: 15px; font-weight: 600; color: #111827; line-height: 1.3;">
                                ${escapeHtml(data.propertyAddress)}
                              </td>
                              <td align="right" style="font-size: 15px; font-weight: 600; color: #111827; line-height: 1.3; white-space: nowrap;">
                                ${priceDisplay}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 10px 10px 10px; font-size: 9px; font-weight: 600; letter-spacing: 0.1em; color: #9ca3af; text-transform: uppercase;">
                          REF: ${escapeHtml(data.referenceNumber)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td class="email-padding" style="padding: 24px 40px; border-top: 1px solid #e5e7eb;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="color: #9ca3af; font-size: 12px;">
                          <p style="margin: 0;">&copy; ${new Date().getFullYear()} ${escapeHtml(data.agencyName)}. Todos los derechos reservados.</p>
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

  const text = `Nueva propiedad recibida desde la web

${data.ownerName}
${data.ownerPhone ?? ""}
${data.ownerEmail ?? ""}

${propertyLabel} - ${data.propertyAddress}
${listingTypeLabel} - ${priceFormatted} EUR
Ref: ${data.referenceNumber}`;

  return { subject, html, text };
}
