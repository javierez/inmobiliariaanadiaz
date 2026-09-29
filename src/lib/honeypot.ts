/**
 * Honeypot field for bot detection on public forms.
 * Bots auto-fill visible fields — this hidden "website" field catches them.
 */

export const HONEYPOT_FIELD_NAME = "website";

export function isHoneypotFilled(value?: string): boolean {
  return !!value && value.trim().length > 0;
}
