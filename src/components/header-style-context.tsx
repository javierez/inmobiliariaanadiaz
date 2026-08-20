"use client";

import { createContext, useContext } from "react";
import type { DescriptionAlign } from "~/lib/description-align";

export type { DescriptionAlign };
export { descriptionAlignClass } from "~/lib/description-align";

/**
 * Site-wide presentation flags sourced from website_config.features_props.
 * - `minimalHeaders`: hide the kicker above + subtitle below section titles.
 * - `descriptionAlign`: override the text alignment of description/paragraph
 *   blocks ("justify"/"center"); undefined keeps each block's existing align.
 *
 * Client components read these via the hooks below; server components read
 * `getFeaturesProps()` directly and use `descriptionAlignClass()`.
 */
type WebsiteStyle = {
  minimalHeaders: boolean;
  descriptionAlign: DescriptionAlign;
};

const WebsiteStyleContext = createContext<WebsiteStyle>({
  minimalHeaders: false,
  descriptionAlign: undefined,
});

export function HeaderStyleProvider({
  minimal,
  descriptionAlign,
  children,
}: {
  minimal: boolean;
  descriptionAlign?: DescriptionAlign;
  children: React.ReactNode;
}) {
  return (
    <WebsiteStyleContext.Provider
      value={{ minimalHeaders: minimal, descriptionAlign }}
    >
      {children}
    </WebsiteStyleContext.Provider>
  );
}

export function useMinimalHeaders(): boolean {
  return useContext(WebsiteStyleContext).minimalHeaders;
}

export function useDescriptionAlign(): DescriptionAlign {
  return useContext(WebsiteStyleContext).descriptionAlign;
}
