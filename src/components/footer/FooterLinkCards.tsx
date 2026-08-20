import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface QuickLink {
  text: string;
  href: string;
}

interface FooterLinkCardsProps {
  links: QuickLink[];
  visibility: Record<string, boolean>;
  className?: string;
}

/**
 * Footer navigation rendered as a grid of cards instead of a plain link list.
 * Used for accounts with `features_props.footerCards` enabled.
 */
export function FooterLinkCards({
  links,
  visibility,
  className,
}: FooterLinkCardsProps) {
  const visibleLinks = links.filter(
    (link) =>
      link.text.trim() !== "" && visibility[link.text.toLowerCase()] !== false,
  );

  if (visibleLinks.length === 0) return null;

  return (
    <div className={className}>
      {/* Invisible spacer matching the sibling column headings (e.g. "Nuestras
          Oficinas") so the cards align vertically as if they had a title. */}
      <h3
        aria-hidden
        className="mb-4 inline-block select-none text-lg font-bold text-transparent sm:mb-6 sm:text-xl lg:mb-8"
      >
        &nbsp;
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
        {visibleLinks.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className="group flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-background/40 px-4 py-3.5 text-base font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-primary"
          >
            <span>{link.text}</span>
            <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </div>
  );
}
