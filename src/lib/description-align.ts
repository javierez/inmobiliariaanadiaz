/**
 * Site-wide text alignment for description/paragraph blocks, sourced from
 * website_config.features_props.descriptionAlign. Lives in a plain (non-"use
 * client") module so both server and client components can import the helper.
 */
export type DescriptionAlign = "justify" | "center" | undefined;

/** Tailwind alignment class for a configured description alignment (or ""). */
export function descriptionAlignClass(align: DescriptionAlign): string {
  if (align === "justify") return "text-justify";
  if (align === "center") return "text-center";
  return "";
}
