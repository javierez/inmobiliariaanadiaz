
import {
  type CardDisplayConfig,
  DEFAULT_CARD_DISPLAY,
  resolveCardDisplay,
} from "~/lib/card-display";

// Module-level default for queries that haven't (yet) been refactored to
// accept an explicit accountId. Falls back to the build-time env var.

export type LinkItem = {
  title: string;
  url: string;
};

export type LinkCategory = {
  name: string;
  links: LinkItem[];
};

export const getLinksProps = (_accountIdArg?: bigint): LinkCategory[] => {
  return [];
}

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqCategory = {
  category: string;
  questions: FaqItem[];
};

export const getFaqsProps = (_accountIdArg?: bigint): FaqCategory[] => {
  return [];
}

/**
 * Los órdenes que entiende la web. Vive aquí, y no en queries/listings.ts,
 * porque el orden inicial es configuración de cuenta: el listado lo consume,
 * no lo define.
 *
 * `"default"` = agrupado por tipo (casa/piso, luego local, luego resto),
 * destacados primero y precio descendente dentro de cada grupo. Es el orden
 * histórico de todas las webs y sigue siendo el que aplica a cualquier cuenta
 * que no toque el selector del CRM.
 */
export type SortOption =
  | "default"
  | "newest"
  | "oldest"
  | "price-asc"
  | "price-desc"
  | "size-asc"
  | "size-desc";

export type PropertiesConfig = {
  title: string;
  subtitle: string;
  buttonText: string;
  itemsPerPage?: number;
  // Orden inicial del listado cuando la URL no lleva `?sort=`. Ya normalizado:
  // el CRM guarda su propio vocabulario y `resolveDefaultSort` lo traduce.
  defaultSort: SortOption;
  showDescription: boolean;
  showReference?: boolean;
  // Días que un Vendido/Alquilado sigue en la web tras cerrarse. 0 (el valor
  // por defecto, y el que aplica a cualquier cuenta sin configurar) = sale al
  // instante. Lo consume `visibleStatusCondition` en queries/filters.ts.
  soldVisibilityDays: number;
  cardDisplay: CardDisplayConfig;
};

/** Rango que acepta el formulario del CRM; sanea JSON manipulado o antiguo. */
function resolveSoldVisibilityDays(raw: unknown): number {
  if (typeof raw !== "number" || !Number.isFinite(raw)) return 0;
  return Math.min(365, Math.max(0, Math.trunc(raw)));
}

/**
 * El selector "Ordenamiento por defecto" del CRM guarda su propio vocabulario
 * (`date-desc`, `date-asc`), que nunca existió aquí: el valor se leía, no se
 * traducía y no se usaba, así que la elección de la agencia no llegaba a la
 * web. Esta tabla es el único punto donde los dos vocabularios se encuentran.
 *
 * `price-desc` —el valor por defecto del CRM— cae en `"default"` a propósito:
 * el orden agrupado por tipo ya es precio descendente dentro de cada grupo, y
 * mapearlo al `price-desc` plano cambiaría el listado de las 23 cuentas que
 * nunca tocaron el selector.
 */
const CRM_SORT_ALIASES: Record<string, SortOption> = {
  "price-desc": "default",
  "price-asc": "price-asc",
  "date-desc": "newest",
  "date-asc": "oldest",
};

const VALID_SORTS: readonly SortOption[] = [
  "default",
  "newest",
  "oldest",
  "price-asc",
  "price-desc",
  "size-asc",
  "size-desc",
];

// Not exported: this file carries "use server", and such a module may only
// export async functions — exporting this sync helper made Next refuse to
// compile the whole module ("Server Actions must be async functions"), which
// took down every page that reads website_config. It has no callers outside
// this file, so keeping it local is both the fix and the smallest change.
function resolveDefaultSort(raw: unknown): SortOption {
  if (typeof raw !== "string") return "default";
  return (
    CRM_SORT_ALIASES[raw] ??
    (VALID_SORTS.includes(raw as SortOption) ? (raw as SortOption) : "default")
  );
}

const PROPERTIES_DEFAULTS = {
  title: "Propiedades Destacadas",
  subtitle: "Descubre nuestra selección de propiedades disponibles",
  buttonText: "Ver Todas las Propiedades",
  showDescription: true,
  showReference: true,
  defaultSort: "default",
  soldVisibilityDays: 0,
  cardDisplay: DEFAULT_CARD_DISPLAY,
} satisfies PropertiesConfig;

export const getPropertiesConfig = (_accountIdArg?: bigint): PropertiesConfig => {
  return {
  "cardDisplay": {
  "cardTitle": "listing",
  "cardEyebrow": "location",
  "cardLocationField": "province"
},
  "title": "Propiedades Destacadas",
  "subtitle": "Descubre nuestra selección de propiedades disponibles",
  "buttonText": "Ver Todas las Propiedades",
  "showDescription": true,
  "soldVisibilityDays": 0,
  "defaultSort": "default"
};
}

export type SEOConfig = {
  title: string;
  description: string;
  name?: string;
  image?: string;
  url?: string;
  telephone?: string;
  email?: string;
  keywords?: string[] | string; // Support both array and string formats
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogUrl?: string;
  ogSiteName?: string;
  ogLocale?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  /** Per-account Google Analytics 4 measurement ID (e.g. "G-XXXXXXXXXX"). */
  gaMeasurementId?: string;
};

/**
 * Per-account website feature flags + light config. Stored as a JSON string in
 * `website_config.features_props`. Every field is optional; when undefined the
 * caller falls back to the historical default, so a null column = today's behavior.
 *
 * NOTE (v1 template): some fields have no visible effect on this older template
 * because it doesn't render those surfaces (e.g. the navbar already uses direct
 * links rather than mega-menus, and the hero has its own layout). Such fields are
 * still parsed so the shape stays in sync with v2 and the admin. The fields that
 * apply on v1: `pages.promociones`, `menuLabels.vender`, `menuLabels.contacto`,
 * `logoSize`, `referenceSearch`, `footerCards`, `serviciosCta`, `headerStyle`,
 * `descriptionAlign`.
 */
export type FeaturesProps = {
  pages?: {
    promociones?: boolean;
    servicios?: boolean;
    nosotros?: boolean;
  };
  sections?: {
    socialFamily?: boolean;
  };
  menuLabels?: {
    segundaMano?: string;
    alquilar?: string;
    inversion?: string;
    inversionSubtitle?: string;
    inversionHref?: string;
    vender?: string;
    /** Label for the contact CTA / titles (e.g. "Contacto"). Default "Contáctanos". */
    contacto?: string;
  };
  logoSize?: "standard" | "large" | "xlarge";
  /** Hero section height: "standard" (~88vh) or "full" (fills the screen). */
  heroSize?: "standard" | "full";
  /** Hero shows direct Venta/Alquiler access buttons instead of the search bar. */
  heroDirectAccess?: boolean;
  /** Navbar Venta/Alquiler are direct links (no property-type mega-menu). */
  navDirectLinks?: boolean;
  /**
   * Order of the navbar entries, as keys ("venta", "alquiler", …), dragged from
   * the CRM. Unset → the order this template ships with. An entry the list
   * doesn't mention keeps its place; see `~/lib/nav-order`.
   */
  navOrder?: string[];
  /**
   * Show the navbar "Busca" search box (free text: reference, address, city,
   * title). Kept under the original key so existing site configs keep working.
   * Default true.
   */
  referenceSearch?: boolean;
  /** Show the bottom call-to-action on the /servicios page. Default true. */
  serviciosCta?: boolean;
  /**
   * /servicios card layout. "grid" (default) → up to 3 cards per row.
   * "stacked" → one full-width card per row, image beside the copy, for
   * long-form service descriptions.
   */
  serviciosLayout?: "grid" | "stacked";
  /** Contact CTA shows only the button (no heading/blurb). Default false. */
  contactCtaMinimal?: boolean;
  /** When true, footer navigation renders as cards and the property-types column is hidden. */
  footerCards?: boolean;
  /**
   * "minimal" hides the small uppercase kicker above section titles and the
   * subtitle below them, site-wide, for a cleaner look. Defaults to "standard".
   */
  headerStyle?: "standard" | "minimal";
  /**
   * Text alignment for description/paragraph blocks. Unset → keep each block's
   * existing alignment; "justify"/"center" override it site-wide.
   */
  descriptionAlign?: "justify" | "center";
  /**
   * Homepage "Propiedades destacadas" behavior.
   * "grid" (default) → the full card grid, button navigates to the search page.
   * "feed" → a short teaser grid whose button opens the full-screen vertical
   * property feed (TikTok style) in place, without leaving the homepage.
   */
  featuredMode?: "grid" | "feed";
  /**
   * How many cards the "Propiedades destacadas" grid shows. Unset → every
   * listing fetched (12) in "grid" mode, 3 in "feed" mode.
   */
  featuredGridCount?: number;
};

/** Read the legacy `metadata.modules.promotions` flag (older accounts gated /promociones here). */
function readLegacyPromotions(
  metadata: string | null | undefined,
): boolean | undefined {
  if (!metadata) return undefined;
  try {
    const raw =
      typeof metadata === "string"
        ? (JSON.parse(metadata) as unknown)
        : metadata;
    const modules =
      raw && typeof raw === "object" && "modules" in raw
        ? (raw as { modules?: { promotions?: unknown } }).modules
        : undefined;
    return modules?.promotions === true ? true : undefined;
  } catch {
    return undefined;
  }
}

export const getFeaturesProps = (_accountIdArg?: bigint): FeaturesProps => {
  return {
  "pages": {
  "servicios": true,
  "nosotros": true
},
  "sections": {

}
};
}

export type ModulesConfig = {
  promotionsEnabled: boolean;
};

// Thin wrapper kept for existing callers; promotions now lives in features_props
// (with legacy metadata.modules.promotions folded in by getFeaturesProps).
export const getModulesConfig = (): ModulesConfig => {
  return {
  "promotionsEnabled": false
};
}

export const getSEOConfig = (): SEOConfig => {
  return {
  "title": "Inmobiliaria Ana Díaz | Inmobiliaria en León",
  "description": "Inmobiliaria Ana Díaz: más de 35 años de experiencia en compraventa y alquiler en León. Asesoramiento inmobiliario profesional y personalizado.",
  "keywords": "Pisos, Casas, chalets y adosados, Locales y oficinas, Naves industriales, Garajes y trasteros, Solares y edificios, León, Astorga, Cistierna, Garrafe de Torío, Hospital de Órbigo, Pola de Gordón, La Robla, San Andrés del Rabanedo, Santovenia de la Valdoncina, Sariegos, Valencia de Don Juan",
  "name": "Inmobiliaria Ana Díaz",
  "email": "inmo@inmobiliariaanadiaz.es",
  "telephone": "987221155",
  "url": "https://www.inmobiliariaanadiaz.es/",
  "ogTitle": "Inmobiliaria Ana Díaz",
  "ogDescription": "Inmobiliaria Ana Díaz: más de 35 años de experiencia en compraventa y alquiler en León. Asesoramiento inmobiliario profesional y personalizado.",
  "ogType": "website",
  "ogLocale": "es_ES",
  "ogSiteName": "Inmobiliaria Ana Díaz"
};
}
