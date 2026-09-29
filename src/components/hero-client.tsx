"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { CITY_PLACEHOLDER, extractCityTemplate } from "~/lib/city-template";
import { isAccount137 } from "~/lib/account-overrides/137";
import { HeroBackground } from "~/components/hero-background";
import { resolveHeroMedia, type HeroMediaItem } from "~/lib/hero-media";

interface HeroClientProps {
  title: string;
  subtitle: string;
  findPropertyButton: string;
  contactButton: string;
  /** Ordered background slides. Falls back to the legacy fields when empty. */
  backgroundMedia?: HeroMediaItem[];
  backgroundType?: "image" | "video";
  backgroundVideo?: string;
  backgroundImage?: string;
  cities?: string[];
  /** Rendered centered inside the hero (account 137: the property search). */
  children?: React.ReactNode;
}

const ROTATION_INTERVAL_MS = 4000;

function useRotatingCity(cities: string[] | undefined) {
  const rotatableCities = useMemo(
    () => (cities ?? []).filter((c) => c && c.trim().length > 0),
    [cities],
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (rotatableCities.length < 2) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % rotatableCities.length);
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(id);
  }, [rotatableCities.length]);

  const safeIndex =
    rotatableCities.length > 0 ? index % rotatableCities.length : 0;
  return {
    currentCity: rotatableCities[safeIndex] ?? null,
    rotatableCities,
  };
}

function renderWithRotatingCity(
  text: string,
  knownCities: string[],
  currentCity: string | null,
) {
  const { template, foundCity } = extractCityTemplate(text, knownCities);
  if (!foundCity || !currentCity || knownCities.length < 2) {
    return <>{text}</>;
  }

  const segments = template.split(CITY_PLACEHOLDER);
  return (
    <>
      {segments.map((segment, i) => (
        <span key={`seg-${i}`}>
          {segment}
          {i < segments.length - 1 && (
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={currentCity}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                className="block sm:inline-block"
              >
                {currentCity}
              </motion.span>
            </AnimatePresence>
          )}
        </span>
      ))}
    </>
  );
}

export function HeroClient({
  title,
  subtitle,
  findPropertyButton,
  contactButton,
  backgroundMedia,
  backgroundType = "image",
  backgroundVideo,
  backgroundImage,
  cities = [],
  children,
}: HeroClientProps) {
  const { currentCity, rotatableCities } = useRotatingCity(cities);

  const media = useMemo(
    () =>
      resolveHeroMedia({
        backgroundMedia,
        backgroundType,
        backgroundVideo,
        backgroundImage,
      }),
    [backgroundMedia, backgroundType, backgroundVideo, backgroundImage],
  );

  const animatedTitle = renderWithRotatingCity(
    title,
    rotatableCities,
    currentCity,
  );
  const animatedSubtitle = renderWithRotatingCity(
    subtitle,
    rotatableCities,
    currentCity,
  );

  // Account 137 uses a light hero: a white wash over the video with dark text,
  // instead of the default dark overlay with white text.
  const account137 = isAccount137();

  return (
    <section className="relative mb-8 overflow-hidden sm:mb-12 md:mb-[60px] lg:mb-[70px]">
      {/* Video and image background. The overlay is for text readability:
          account 137 uses a white wash so the hero reads light with dark text;
          everyone else gets a dark overlay. */}
      <HeroBackground
        media={media}
        layerClassName="absolute inset-0"
        overlayClassName={account137 ? "bg-white/40" : "bg-black/40"}
      />

      {/* Decorative animated orbs */}
      <motion.div
        className="pointer-events-none absolute left-10 top-20 h-64 w-64 rounded-full bg-gradient-to-r from-amber-400/10 to-rose-400/10 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-10 right-10 h-48 w-48 rounded-full bg-gradient-to-r from-blue-400/10 to-purple-400/10 blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {account137 ? (
        // Account 137: no hero copy/CTAs — the property search sits centered
        // over the background image instead.
        <div className="relative z-10 mx-auto flex min-h-[52vh] w-full max-w-5xl items-center justify-center px-4 py-14 sm:min-h-[58vh] sm:px-6 lg:px-8">
          {children}
        </div>
      ) : (
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 sm:pb-32 sm:pt-10 md:pb-40 md:pt-8 lg:px-8 lg:pb-48 lg:pt-12">
          <div className="mx-auto max-w-5xl space-y-4 sm:space-y-5">
            {/* Animated title */}
            <motion.h1
              className="text-4xl font-bold leading-tight text-white sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {animatedTitle}
            </motion.h1>

            {/* Animated subtitle */}
            <motion.p
              className="max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg md:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {animatedSubtitle}
            </motion.p>

            {/* Animated buttons */}
            <motion.div
              className="flex max-w-md flex-col gap-3 pt-2 sm:flex-row sm:gap-4 sm:pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Button
                size="lg"
                className="w-full min-w-0 bg-white text-black transition-transform hover:scale-105 hover:bg-white/90 active:scale-95 sm:w-auto"
                asChild
              >
                <Link href="/venta-propiedades/todas-ubicaciones">
                  {findPropertyButton}
                </Link>
              </Button>

              {/* Screen-reader-only separator so text scrapers don't concatenate
                  the two CTA labels (e.g. "Encuentra tu casaPonte en contacto"). */}
              <span className="sr-only">. </span>

              <Button
                size="lg"
                className="w-full min-w-0 !bg-brand !text-brand-foreground transition-transform hover:scale-105 hover:!bg-brand/90 active:scale-95 sm:w-auto"
                asChild
              >
                <Link href="#contact">{contactButton}</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      )}
    </section>
  );
}
