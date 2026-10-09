import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ResolvedBanner } from "~/server/queries/banner";

/**
 * The homepage banner's markup, given an already-resolved banner.
 *
 * Split out of `PromoBanner` so the CRM preview can re-render it from a live
 * postMessage patch without a second copy of the layout drifting from this one.
 * No data fetching and no server-only imports, so it works from both a server
 * component (the real homepage) and a client one (the preview).
 */
export function BannerView({ banner }: { banner: ResolvedBanner }) {
  const {
    eyebrow,
    title,
    subtitle,
    backgroundImage,
    ctaLabel,
    ctaHref,
    overlay,
    align,
    fit,
    bare,
  } = banner;
  const centered = align === "center";

  // Directional gradient so the text side stays dark (and legible) while the
  // photo still shows through on the other side. A flat wash washes out over
  // busy/light images — a gradient guarantees contrast where the copy sits.
  const gradient = centered
    ? overlay
      ? "bg-gradient-to-t from-black/85 via-black/45 to-black/20"
      : "bg-gradient-to-t from-black/60 via-black/25 to-transparent"
    : overlay
      ? "bg-gradient-to-r from-black/85 via-black/55 to-black/10"
      : "bg-gradient-to-r from-black/65 via-black/30 to-transparent";

  const content = (
    <div
      className={`group relative h-[320px] w-full overflow-hidden rounded-2xl sm:h-[400px] md:h-[460px] ${
        bare ? "" : "shadow-xl ring-1 ring-black/5"
      }`}
    >
      {backgroundImage ? (
        fit === "contain" ? (
          <>
            {/* Blurred, zoomed copy fills the letterbox gaps so the whole
                image can be shown without empty bars. Skipped in "bare" mode,
                which keeps the background transparent. */}
            {!bare && (
              <Image
                src={backgroundImage}
                alt=""
                aria-hidden
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="scale-110 object-cover blur-2xl"
                priority
              />
            )}
            <Image
              src={backgroundImage}
              alt={title}
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-contain"
              priority
            />
          </>
        ) : (
          <Image
            src={backgroundImage}
            alt={title}
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            priority
          />
        )
      ) : (
        <div className="absolute inset-0 bg-brand" />
      )}

      {/* Legibility gradient over the photo. */}
      {backgroundImage && !bare && (
        <div className={`absolute inset-0 ${gradient}`} />
      )}

      <div
        className={`absolute inset-0 flex flex-col justify-center gap-5 p-8 sm:p-12 md:p-16 ${
          centered ? "items-center text-center" : "items-start text-left"
        }`}
      >
        {eyebrow && (
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-white ring-1 ring-inset ring-white/25 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            {eyebrow}
          </span>
        )}

        <h2 className="max-w-2xl text-3xl font-bold leading-[1.1] tracking-tight text-white [text-shadow:_0_2px_12px_rgb(0_0_0_/_60%)] sm:text-4xl md:text-5xl">
          {title}
        </h2>

        {subtitle && (
          <p className="max-w-xl text-base font-medium text-white/90 [text-shadow:_0_1px_8px_rgb(0_0_0_/_55%)] sm:text-lg">
            {subtitle}
          </p>
        )}

        {ctaLabel && ctaHref && (
          <span className="mt-1 inline-flex items-center gap-2 rounded-lg bg-brand px-7 py-3.5 text-sm font-semibold text-brand-foreground shadow-lg shadow-black/20 transition-all group-hover:gap-3 group-hover:shadow-xl sm:text-base">
            {ctaLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        )}
      </div>
    </div>
  );

  return (
    <section className="pt-8 sm:pt-10 md:pt-12">
      {ctaHref ? (
        <Link href={ctaHref} aria-label={title} className="block">
          {content}
        </Link>
      ) : (
        content
      )}
    </section>
  );
}
