import Image from "next/image";
import { cn } from "~/lib/utils";
import {
  descriptionAlignClass,
  type DescriptionAlign,
} from "~/lib/description-align";
import { RichText } from "~/components/ui/rich-text";

interface ExtendedServicesGridProps {
  services: Array<{
    title: string;
    description: string;
    icon?: string;
    image?: string;
    bullets?: string[];
    ctaLabel?: string;
    ctaHref?: string;
  }>;
  /**
   * From `features_props`. Passed in rather than fetched here so this stays a
   * plain component: the CRM preview renders it from a client component that
   * repaints as the agency edits, and an async server component cannot be used
   * there at all.
   */
  descriptionAlign?: DescriptionAlign;
  /** "stacked" → one full-width card per row. Default is the 3-up grid. */
  serviciosLayout?: string;
}

export function ExtendedServicesGrid({
  services,
  descriptionAlign,
  serviciosLayout,
}: ExtendedServicesGridProps) {
  const alignClass = descriptionAlignClass(descriptionAlign);
  // "stacked" → one full-width card per row (image beside the copy), which
  // suits long-form service descriptions. Default stays the 3-up grid.
  const stacked = serviciosLayout === "stacked";

  return (
    <div
      className={cn(
        "mx-auto flex",
        stacked
          ? "max-w-4xl flex-col gap-10 sm:gap-12"
          : "max-w-6xl flex-wrap justify-center gap-8 sm:gap-10",
      )}
    >
      {services.map((service, i) => (
        <article
          key={i}
          className={cn(
            "group flex h-full overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
            stacked
              ? "w-full flex-col sm:flex-row"
              : "w-full flex-col sm:w-[calc(50%-1.25rem)] lg:w-[calc(33.333%-1.667rem)]",
          )}
        >
          <div
            className={cn(
              "relative overflow-hidden bg-muted",
              stacked
                ? "aspect-[4/3] w-full shrink-0 sm:aspect-auto sm:w-2/5"
                : "aspect-[4/3] w-full",
            )}
          >
            {service.image ? (
              <Image
                src={service.image}
                alt={service.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes={
                  stacked
                    ? "(max-width: 640px) 100vw, 40vw"
                    : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                }
              />
            ) : null}
          </div>

          <div
            className={cn(
              "flex flex-1 flex-col p-7",
              stacked ? "text-left sm:p-9" : "text-center",
            )}
          >
            <h3 className="mb-3 text-xl font-medium leading-tight tracking-tight text-foreground sm:text-2xl">
              {service.title}
            </h3>
            {/* Body copy is justified by default here — service descriptions are
                long-form prose. An explicit descriptionAlign still wins. */}
            <RichText
              text={service.description}
              className={cn(
                "text-sm leading-relaxed text-muted-foreground sm:text-base",
                alignClass || "text-justify",
              )}
            />
          </div>
        </article>
      ))}
    </div>
  );
}
