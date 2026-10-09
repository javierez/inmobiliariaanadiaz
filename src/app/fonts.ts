import { GeistSans } from "geist/font/sans";
import {
  Playfair_Display,
} from "next/font/google";
import type { FontFamilyKey } from "~/lib/data";

const playfair = Playfair_Display({ subsets: ["latin"], display: "swap", variable: "--font-playfair" });

type FontEntry = { loader: { variable: string; className: string }; cssVar: string };

export const fontCatalog: Partial<Record<FontFamilyKey, FontEntry>> = {
  geist: { loader: GeistSans, cssVar: "var(--font-geist-sans)" },
  playfair: { loader: playfair, cssVar: "var(--font-playfair)" },
};

export const allFontVariables = Object.values(fontCatalog)
  .filter((entry): entry is FontEntry => Boolean(entry))
  .map((entry) => entry.loader.variable)
  .join(" ");
