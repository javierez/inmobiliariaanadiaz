/**
 * Agent notification email when a new contact lead is submitted
 * from the simplified "Vender" form on the website.
 * Table-based layout for email client compatibility.
 */

export interface AgentLeadNotificationData {
  ownerName: string;
  ownerEmail?: string | null;
  ownerPhone?: string | null;
  logoUrl?: string | null;
  agencyName: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function generateAgentLeadNotificationEmail(
  data: AgentLeadNotificationData,
): { subject: string; html: string; text: string } {
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

                <tr>
                  <td class="email-padding" style="padding: ${data.logoUrl ? "0" : "32px"} 40px 8px 40px;">
                    <h1 style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">Nuevo contacto desde la web</h1>
                  </td>
                </tr>

                <tr>
                  <td class="email-padding" style="padding: 0 40px 16px 40px;">
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">Quiere vender una propiedad. Ponte en contacto para conocer los detalles.</p>
                  </td>
                </tr>

                <tr>
                  <td class="email-padding" style="padding: 0 40px 24px 40px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 1px solid #e5e7eb; border-radius: 6px; background: #ffffff;">
                      <tr>
                        <td style="padding: 16px;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="font-size: 15px; font-weight: 600; color: #111827; padding-bottom: 10px;">
                                ${escapeHtml(data.ownerName)}
                              </td>
                            </tr>
                            ${
                              data.ownerPhone
                                ? `
                            <tr>
                              <td style="padding-bottom: 6px;">
                                <a href="tel:${data.ownerPhone.replace(/\s/g, "")}" style="color: #374151; text-decoration: none; font-size: 14px;">
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
                                <a href="mailto:${data.ownerEmail}" style="color: #374151; text-decoration: none; font-size: 14px;">
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

  const text = `Nuevo contacto desde la web

${data.ownerName}
${data.ownerPhone ?? ""}
${data.ownerEmail ?? ""}`;

  return { subject, html, text };
}
