"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import {
  Menu,
  X,
  ChevronDown,
  Home,
  Building2,
  Store,
  LandPlot,
  Car,
  PlusCircle,
  Search,
  ExternalLink,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Fragment, useState, useCallback, memo, useEffect } from "react";
import { cn, hexToRgba } from "~/lib/utils";
import { applyNavOrder } from "~/lib/nav-order";
import { SocialLinks } from "~/components/ui/social-links";
import {
  isAccount137,
  ACCOUNT_137_NAV_LINK_COLOR,
} from "~/lib/account-overrides/137";
import { isAccount122 } from "~/lib/account-overrides/122";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

// Types
type SocialPlatform =
  | "facebook"
  | "twitter"
  | "instagram"
  | "linkedin"
  | "youtube";

interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

// `vender` and `alquilar` apply in the v1 template — it has no "Segunda mano"/
// "Inversión" menu items, so the other features_props.menuLabels fields are
// ignored here.
interface NavbarMenuLabels {
  vender?: string;
  alquilar?: string;
}

interface NavbarProps {
  socialLinks?: SocialLink[];
  shortName?: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  promotionsEnabled?: boolean;
  hasServiciosPage?: boolean;
  hasNosotrosPage?: boolean;
  menuLabels?: NavbarMenuLabels;
  logoSize?: "standard" | "large" | "xlarge";
  /** Show the navbar "Busca" search box. Default true. */
  referenceSearch?: boolean;
  /**
   * Order of the centre entries, as keys ("venta", "alquiler", …). Unset keeps
   * the order this template ships with; see `~/lib/nav-order`.
   */
  navOrder?: string[];
}

// What the two desktop dropdowns list. Same five property types each, and the
// same copy they had when this markup was written out item by item.
const BUY_ITEMS = [
  { text: "Pisos en venta", href: "/venta-pisos/todas-ubicaciones" },
  { text: "Casas en venta", href: "/venta-casas/todas-ubicaciones" },
  { text: "Locales en venta", href: "/venta-locales/todas-ubicaciones" },
  { text: "Terrenos en venta", href: "/venta-solares/todas-ubicaciones" },
  { text: "Garajes en venta", href: "/venta-garajes/todas-ubicaciones" },
];

const RENT_ITEMS = [
  { text: "Pisos en alquiler", href: "/alquiler-pisos/todas-ubicaciones" },
  { text: "Casas en alquiler", href: "/alquiler-casas/todas-ubicaciones" },
  { text: "Locales en alquiler", href: "/alquiler-locales/todas-ubicaciones" },
  { text: "Terrenos en alquiler", href: "/alquiler-solares/todas-ubicaciones" },
  { text: "Garajes en alquiler", href: "/alquiler-garajes/todas-ubicaciones" },
];

// Memoized Social Links Section
const MobileSocialLinks = memo(({ links }: { links: SocialLink[] }) => (
  <div className="border-t bg-muted/50 backdrop-blur-sm">
    <div className="px-4 py-4">
      <div className="mb-3 text-xs font-medium text-muted-foreground">
        Síguenos en redes sociales
      </div>
      <SocialLinks links={links} />
    </div>
  </div>
));

MobileSocialLinks.displayName = "MobileSocialLinks";

// Main Component
export default function Navbar({
  socialLinks,
  shortName,
  logoUrl,
  primaryColor,
  promotionsEnabled = false,
  hasServiciosPage = false,
  hasNosotrosPage = false,
  menuLabels,
  logoSize = "standard",
  referenceSearch = true,
  navOrder,
}: NavbarProps): React.ReactElement {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // /servicios and /nosotros pull their hero banner up under the sticky navbar,
  // so the translucent bar composites over a dark photo and reads as a
  // different colour than on every other page. Pre-compose the same 20% brand
  // tint over the page background and render it opaque: identical result to
  // /contacto, whatever is scrolling underneath.
  const overHeroBanner =
    pathname?.startsWith("/servicios") || pathname?.startsWith("/nosotros");

  // Account 137 (Ana Díaz): bold, dark-green desktop nav links. Scoped here so
  // no other generated site is affected. `font-bold` overrides the default
  // `font-medium`; the green colour is set on <nav> below and inherited.
  const acct137 = isAccount137();
  const navLinkWeight = acct137 ? "font-bold" : "font-medium";
  const navLinkSize = acct137 ? "text-base" : "text-sm";
  const navStyle = acct137 ? { color: ACCOUNT_137_NAV_LINK_COLOR } : undefined;

  // Account 122: minimal nav — only "Servicios" and "Contacto". Every other
  // entry (Comprar, Alquilar, Promociones, Vender, Nosotros, Enlaces) is hidden
  // in both the desktop bar and the mobile panel. "Servicios" is shown
  // unconditionally here, independent of the hasServiciosPage flag.
  const acct122 = isAccount122();

  // Config-driven (features_props); defaults preserve prior copy/size.
  const venderLabel = menuLabels?.vender ?? "Vender";
  const alquilarLabel = menuLabels?.alquilar ?? "Alquilar";
  const logoSizeClass =
    logoSize === "xlarge"
      ? "h-24 w-64"
      : logoSize === "large"
        ? "h-20 w-52"
        : "h-16 w-40";
  const showRefSearch = referenceSearch !== false;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoized handlers
  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const handleMenuClose = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        handleMenuClose();
      }
    },
    [handleMenuClose],
  );

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = searchQuery.trim();
      if (trimmed) {
        // "todo" = every listing type, so a reference finds sales AND rentals.
        // The results page short-circuits to the property detail page when the
        // query resolves to exactly one listing by reference.
        router.push(`/todo/todas-ubicaciones?q=${encodeURIComponent(trimmed)}`);
        setSearchQuery("");
        setIsMenuOpen(false);
      }
    },
    [searchQuery, router],
  );

  const navLinkClass = cn(
    "transition-colors hover:text-primary",
    navLinkSize,
    navLinkWeight,
  );

  // The centre of the bar as data rather than as the order of the JSX, so
  // `features_props.navOrder` (dragged from the CRM's Navegación tab) can
  // reorder it. Account 122's minimal bar is a separate hardcoded set and keeps
  // its own branch below.
  const comprarEntry = mounted ? (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn("flex items-center gap-1", navLinkClass)}
        aria-label="Comprar opciones"
      >
        Comprar <ChevronDown className="h-3.5 w-3.5 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        {BUY_ITEMS.map((item) => (
          <DropdownMenuItem key={item.href}>
            <Link href={item.href} className="w-full">
              {item.text}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <span className={cn("flex items-center gap-1", navLinkSize, navLinkWeight)}>
      Comprar <ChevronDown className="h-3.5 w-3.5 opacity-50" />
    </span>
  );

  const alquilarEntry = mounted ? (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn("flex items-center gap-1", navLinkClass)}
        aria-label={`${alquilarLabel} opciones`}
      >
        {alquilarLabel} <ChevronDown className="h-3.5 w-3.5 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        {RENT_ITEMS.map((item) => (
          <DropdownMenuItem key={item.href}>
            <Link href={item.href} className="w-full">
              {item.text}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <span className={cn("flex items-center gap-1", navLinkSize, navLinkWeight)}>
      {alquilarLabel} <ChevronDown className="h-3.5 w-3.5 opacity-50" />
    </span>
  );

  const navEntries = applyNavOrder(
    [
      { key: "venta" as const, show: true, node: comprarEntry },
      { key: "alquiler" as const, show: true, node: alquilarEntry },
      {
        key: "promociones" as const,
        show: promotionsEnabled,
        node: (
          <Link
            href="/promociones"
            className={navLinkClass}
            aria-label="Promociones"
          >
            Promociones
          </Link>
        ),
      },
      {
        key: "vender" as const,
        show: true,
        node: (
          <Link
            href="/vender"
            className={navLinkClass}
            aria-label="Vender propiedad"
          >
            {venderLabel}
          </Link>
        ),
      },
      {
        key: "servicios" as const,
        show: hasServiciosPage && !acct137,
        node: (
          <Link
            href="/servicios"
            className={navLinkClass}
            aria-label="Servicios"
          >
            Servicios
          </Link>
        ),
      },
      {
        key: "nosotros" as const,
        show: true,
        node: (
          <Link
            href={hasNosotrosPage ? "/nosotros" : "/#about"}
            className={navLinkClass}
            aria-label="Sobre nosotros"
          >
            Nosotros
          </Link>
        ),
      },
      {
        key: "contacto" as const,
        show: true,
        node: (
          <Link href="/#contact" className={navLinkClass} aria-label="Contacto">
            Contacto
          </Link>
        ),
      },
      {
        key: "enlaces" as const,
        show: true,
        node: (
          <Link
            href="/enlaces-de-interes"
            className={navLinkClass}
            aria-label="Enlaces de interés"
          >
            Enlaces de interés
          </Link>
        ),
      },
    ].filter((entry) => entry.show),
    navOrder,
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        !isMenuOpen && "border-b backdrop-blur",
        !isMenuOpen &&
          !primaryColor &&
          (overHeroBanner
            ? "bg-background"
            : "bg-background/95 supports-[backdrop-filter]:bg-background/60"),
      )}
      style={
        !isMenuOpen && primaryColor
          ? {
              backgroundColor: overHeroBanner
                ? `color-mix(in srgb, ${primaryColor} 20%, hsl(var(--background)))`
                : (hexToRgba(primaryColor, 0.2) ?? undefined),
            }
          : undefined
      }
      onKeyDown={handleKeyPress}
    >
      <div
        className={cn(
          "container mx-auto h-16 items-center justify-between px-4 sm:h-18 sm:px-6",
          isMenuOpen ? "hidden lg:flex" : "flex",
        )}
      >
        {/* Left section - Logo. Account 137 (Ana Díaz) hides it on mobile,
            keeping it from lg up. */}
        <div className={cn("flex-shrink-0", acct137 && "hidden lg:block")}>
          <Link href="/" className="flex items-center gap-2" aria-label="Home">
            <div className={cn("relative", logoSizeClass)}>
              <Image
                src={logoUrl ?? "/vestazoomin.jpeg"}
                alt={shortName || "Vesta CRM Logo"}
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Center section - Navigation */}
        {acct122 ? (
          <nav
            className="hidden gap-4 lg:flex xl:gap-6"
            aria-label="Main navigation"
            style={navStyle}
          >
            <Link
              href="/servicios"
              className={cn(
                "transition-colors hover:text-primary",
                navLinkSize,
                navLinkWeight,
              )}
              aria-label="Servicios"
            >
              Servicios
            </Link>
            <Link
              href="/#contact"
              className={cn(
                "transition-colors hover:text-primary",
                navLinkSize,
                navLinkWeight,
              )}
              aria-label="Contacto"
            >
              Contacto
            </Link>
          </nav>
        ) : (
          <nav
            className="hidden gap-4 lg:flex xl:gap-6"
            aria-label="Main navigation"
            style={navStyle}
          >
            {navEntries.map((entry) => (
              <Fragment key={entry.key}>{entry.node}</Fragment>
            ))}
          </nav>
        )}

        {/* Right section - Search, Social Links and Mobile Menu */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Reference Search */}
          {showRefSearch && (
            <form onSubmit={handleSearch} className="hidden sm:flex">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Busca"
                  className="h-8 w-44 rounded-md border border-input bg-white pl-7 pr-2 text-xs transition-all placeholder:text-muted-foreground focus:w-56 focus:outline-none focus:ring-1 focus:ring-ring"
                  aria-label="Buscar"
                />
              </div>
            </form>
          )}
          <div className="hidden lg:flex">
            {socialLinks && socialLinks.length > 0 && (
              <SocialLinks links={socialLinks} />
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={handleMenuToggle}
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-0 z-50 w-full bg-background shadow-2xl transition-transform duration-300 ease-in-out lg:hidden",
          isMenuOpen ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!isMenuOpen}
      >
        <div className="flex h-full flex-col">
          {/* Close button */}
          <div className="flex h-16 items-center justify-end px-4 sm:h-18 sm:px-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMenuClose}
              aria-label="Cerrar menú"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          {/* Main Navigation */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6 px-4 py-6">
              {/* Mobile Reference Search */}
              {showRefSearch && (
                <form onSubmit={handleSearch} className="sm:hidden">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Busca"
                      className="h-10 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      aria-label="Buscar"
                    />
                  </div>
                </form>
              )}

              {/* Account 122: minimal mobile menu — Servicios + Contacto only. */}
              {acct122 ? (
                <div className="space-y-1">
                  <Link
                    href="/servicios"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    Servicios
                  </Link>
                  <Link
                    href="/#contact"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={handleMenuClose}
                  >
                    Contacto
                  </Link>
                </div>
              ) : (
                <>
                  {/* Comprar Section */}
                  <div className="space-y-3">
                    <h3 className="px-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Comprar
                    </h3>
                    <div className="space-y-1">
                      <Link
                        href="/venta-pisos/todas-ubicaciones"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                        onClick={handleMenuClose}
                      >
                        <Home className="h-4 w-4" />
                        Pisos
                      </Link>
                      <Link
                        href="/venta-casas/todas-ubicaciones"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                        onClick={handleMenuClose}
                      >
                        <Building2 className="h-4 w-4" />
                        Casas
                      </Link>
                      <Link
                        href="/venta-locales/todas-ubicaciones"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                        onClick={handleMenuClose}
                      >
                        <Store className="h-4 w-4" />
                        Locales
                      </Link>
                      <Link
                        href="/venta-solares/todas-ubicaciones"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                        onClick={handleMenuClose}
                      >
                        <LandPlot className="h-4 w-4" />
                        Terrenos
                      </Link>
                      <Link
                        href="/venta-garajes/todas-ubicaciones"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                        onClick={handleMenuClose}
                      >
                        <Car className="h-4 w-4" />
                        Garajes
                      </Link>
                    </div>
                  </div>

                  {/* Alquilar Section */}
                  <div className="space-y-3">
                    <h3 className="px-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      {alquilarLabel}
                    </h3>
                    <div className="space-y-1">
                      <Link
                        href="/alquiler-pisos/todas-ubicaciones"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                        onClick={handleMenuClose}
                      >
                        <Home className="h-4 w-4" />
                        Pisos
                      </Link>
                      <Link
                        href="/alquiler-casas/todas-ubicaciones"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                        onClick={handleMenuClose}
                      >
                        <Building2 className="h-4 w-4" />
                        Casas
                      </Link>
                      <Link
                        href="/alquiler-locales/todas-ubicaciones"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                        onClick={handleMenuClose}
                      >
                        <Store className="h-4 w-4" />
                        Locales
                      </Link>
                      <Link
                        href="/alquiler-solares/todas-ubicaciones"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                        onClick={handleMenuClose}
                      >
                        <LandPlot className="h-4 w-4" />
                        Terrenos
                      </Link>
                      <Link
                        href="/alquiler-garajes/todas-ubicaciones"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                        onClick={handleMenuClose}
                      >
                        <Car className="h-4 w-4" />
                        Garajes
                      </Link>
                    </div>
                  </div>

                  {/* Other Links */}
                  <div className="space-y-3">
                    <h3 className="px-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Más
                    </h3>
                    <div className="space-y-1">
                      {promotionsEnabled && (
                        <Link
                          href="/promociones"
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                          onClick={handleMenuClose}
                        >
                          <Building2 className="h-4 w-4" />
                          Promociones
                        </Link>
                      )}
                      <Link
                        href="/vender"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                        onClick={handleMenuClose}
                      >
                        <PlusCircle className="h-4 w-4" />
                        {venderLabel}
                      </Link>
                      {hasServiciosPage && !acct137 && (
                        <Link
                          href="/servicios"
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                          onClick={handleMenuClose}
                        >
                          Servicios
                        </Link>
                      )}
                      <Link
                        href={hasNosotrosPage ? "/nosotros" : "/#about"}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                        onClick={handleMenuClose}
                      >
                        Nosotros
                      </Link>
                      <Link
                        href="/#contact"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                        onClick={handleMenuClose}
                      >
                        Contacto
                      </Link>
                      <Link
                        href="/enlaces-de-interes"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                        onClick={handleMenuClose}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Enlaces de interés
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Social Links Footer */}
          {socialLinks && socialLinks.length > 0 && (
            <MobileSocialLinks links={socialLinks} />
          )}
        </div>
      </div>
    </header>
  );
}
