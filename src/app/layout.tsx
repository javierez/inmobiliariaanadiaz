import "~/styles/globals.css";

import { type Metadata } from "next";
import { headers } from "next/headers";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ThemeProvider } from "~/components/theme-provider";
import { WhatsAppButton } from "~/components/ui/whatsapp-button";
import Navbar from "~/components/navbar";
import { HeaderStyleProvider } from "~/components/header-style-context";
import SiteNavigationJsonLd from "~/components/site-navigation-json-ld";
import { getLogo } from "~/server/queries/logo";
import {
  getSEOConfig,
  getFeaturesProps,
} from "~/server/queries/website-config";
import { getSocialLinks } from "~/server/queries/social";
import { getContactProps } from "~/server/queries/contact";
import { getAboutProps } from "~/server/queries/about";
import { getAccountInfo } from "~/server/queries/account";
import { getColorProps } from "~/server/queries/color";
import { getFontProps } from "~/server/queries/font";
import { fontCatalog, allFontVariables } from "~/app/fonts";
import { hexToHsl, readableForegroundHsl } from "~/lib/utils";
import {
  isAccount137,
  ACCOUNT_137_COLORS,
  ACCOUNT_137_PRICE_COLOR,
} from "~/lib/account-overrides/137";
import { env } from "~/env";

export async function generateMetadata(): Promise<Metadata> {
  const seoConfig = await getSEOConfig();
  const accountInfo = await getAccountInfo(env.NEXT_PUBLIC_ACCOUNT_ID);
  const logoUrl = await getLogo();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
  const brandName =
    accountInfo?.shortName || accountInfo?.name || seoConfig.name;

  // Fallback chain for OG image: explicit seoProps.ogImage → account logo →
  // bundled placeholder. Logo at least gives the share card the agency's brand.
  const ogImageUrl = seoConfig.ogImage || logoUrl || "/images/og-image.jpg";

  // Use the account's own logo as the favicon / search-result icon. Without an
  // explicit `icons` entry Next.js serves the generic default app/favicon.ico
  // (a grey globe), which is what Google shows in search results.
  const icon = logoUrl || "/favicon.ico";

  return {
    metadataBase: new URL(siteUrl),
    title: brandName
      ? { default: seoConfig.title, template: `%s | ${brandName}` }
      : seoConfig.title,
    description: seoConfig.description,
    keywords: seoConfig.keywords,
    icons: {
      icon,
      shortcut: icon,
      apple: icon,
    },
    openGraph: {
      title: seoConfig.ogTitle || seoConfig.title,
      description: seoConfig.ogDescription || seoConfig.description,
      url: seoConfig.ogUrl,
      siteName: seoConfig.ogSiteName,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: seoConfig.ogSiteName || seoConfig.name || "Real Estate",
        },
      ],
      locale: seoConfig.ogLocale || "es_ES",
      type: (seoConfig.ogType || "website") as "website",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const isPreview = pathname.startsWith("/preview");

  // Preview routes render a single section in an iframe — skip all the
  // chrome data fetches (logo/contact/social/account/colors/fonts) that
  // the customer-facing pages need. This also keeps preview rendering
  // isolated from any data-fetch failure in the layout.
  if (isPreview) {
    return (
      <html lang="es" suppressHydrationWarning>
        <body className={`${allFontVariables} font-sans antialiased`}>
          <main>{children}</main>
        </body>
      </html>
    );
  }

  const [
    logoUrl,
    socialLinks,
    contactProps,
    accountInfo,
    colorPropsDb,
    fontPropsDb,
    features,
    aboutProps,
    seoConfig,
  ] = await Promise.all([
    getLogo(),
    getSocialLinks(),
    getContactProps(),
    getAccountInfo(env.NEXT_PUBLIC_ACCOUNT_ID),
    getColorProps(),
    getFontProps(),
    getFeaturesProps(),
    getAboutProps(),
    getSEOConfig(),
  ]);
  // Page availability: explicit features_props flag wins; otherwise fall back to
  // today's behavior (presence of enriched DB content). v1 has no account-129
  // bespoke pages, so no override branch here.
  const hasNosotrosPage =
    features.pages?.nosotros ?? !!aboutProps?.originsContent;
  const hasServiciosPage =
    features.pages?.servicios ??
    (!!aboutProps?.extendedServices && aboutProps.extendedServices.length > 0);
  // Account 137 pins its brand colour + font in code (see account-overrides/137.ts)
  // so they survive admin edits to website_config; all other accounts use the DB.
  const colorProps = isAccount137() ? ACCOUNT_137_COLORS : colorPropsDb;
  // Font is driven by the DB website_config (font_props) for every account,
  // including 137 — see account-overrides/137.ts for why only colours stay
  // pinned in code.
  const fontProps = fontPropsDb;
  const defaultOffice =
    contactProps?.offices?.find((office) => office.isDefault) ||
    contactProps?.offices?.[0];
  const whatsappPhone =
    defaultOffice?.phoneNumbers?.sales?.replace(/[\s\-\(\)]/g, "") || null;

  const sansKey = fontProps?.sansFamily ?? "geist";
  const headingKey = fontProps?.headingFamily ?? sansKey;
  const GEIST_VAR = "var(--font-geist-sans)";
  const sansVar =
    fontCatalog[sansKey]?.cssVar ?? fontCatalog.geist?.cssVar ?? GEIST_VAR;
  const headingVar = fontCatalog[headingKey]?.cssVar ?? sansVar;
  const brandHsl = colorProps?.secondaryColor
    ? hexToHsl(colorProps.secondaryColor)
    : null;
  const brandForegroundHsl = colorProps?.secondaryColor
    ? readableForegroundHsl(colorProps.secondaryColor)
    : null;
  const rootStyle = {
    ["--font-geist-sans" as string]: sansVar,
    ["--font-cinzel" as string]: headingVar,
    ...(brandHsl ? { ["--brand" as string]: brandHsl } : {}),
    ...(brandForegroundHsl
      ? { ["--brand-foreground" as string]: brandForegroundHsl }
      : {}),
    ...(isAccount137()
      ? { ["--price" as string]: ACCOUNT_137_PRICE_COLOR }
      : {}),
  } as React.CSSProperties;

  // GA measurement ID is per-account data: prefer the value stored in the DB
  // (seo_props.gaMeasurementId, which survives regeneration) and fall back to
  // the build-time env var for backward compatibility.
  const gaMeasurementId =
    seoConfig.gaMeasurementId ?? env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="es" suppressHydrationWarning>
      {gaMeasurementId && <GoogleAnalytics gaId={gaMeasurementId} />}
      <body
        className={`${allFontVariables} font-sans antialiased`}
        style={rootStyle}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SiteNavigationJsonLd />
          <div className="relative flex min-h-screen flex-col overflow-x-hidden">
            <Navbar
              shortName={
                accountInfo?.shortName || accountInfo?.name || "Inmobiliaria"
              }
              logoUrl={logoUrl}
              socialLinks={socialLinks}
              primaryColor={colorProps?.primaryColor ?? null}
              promotionsEnabled={features.pages?.promociones === true}
              hasServiciosPage={hasServiciosPage}
              hasNosotrosPage={hasNosotrosPage}
              menuLabels={features.menuLabels}
              logoSize={features.logoSize}
              referenceSearch={features.referenceSearch !== false}
              navOrder={features.navOrder}
            />
            <HeaderStyleProvider
              minimal={features.headerStyle === "minimal"}
              descriptionAlign={features.descriptionAlign}
            >
              <main className="flex-1">{children}</main>
            </HeaderStyleProvider>
            <WhatsAppButton phoneNumber={whatsappPhone} />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
