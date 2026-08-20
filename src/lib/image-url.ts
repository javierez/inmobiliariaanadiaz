/**
 * Returns the image URL to render. Watermarks are now baked into the image
 * at the S3 level by vesta-crm (see getPropertyImages in listings.ts),
 * so this helper is a passthrough. The _watermarkEnabled parameter is
 * retained to avoid touching every call site.
 */
export function getWatermarkedImageUrl(
  originalUrl: string | null | undefined,
  _watermarkEnabled: boolean,
): string {
  return originalUrl ?? "";
}
