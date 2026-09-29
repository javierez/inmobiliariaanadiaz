"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useMinimalHeaders } from "~/components/header-style-context";

interface PageHeroBannerProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  backgroundType: "image" | "video";
  backgroundImage?: string;
  backgroundVideo?: string;
}

export function PageHeroBanner({
  title,
  subtitle,
  eyebrow,
  backgroundType,
  backgroundImage,
  backgroundVideo,
}: PageHeroBannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const minimal = useMinimalHeaders();

  // Same playback-recovery loop as the homepage hero so iOS/Safari don't
  // leave a play-button overlay on autoplay hiccups.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const ensurePlaying = () => {
      if (document.hidden) return;
      if (!video.paused && !video.ended) return;
      void video.play().catch(() => {
        // Autoplay may be blocked; nothing useful to do.
      });
    };

    video.addEventListener("pause", ensurePlaying);
    document.addEventListener("visibilitychange", ensurePlaying);
    window.addEventListener("pageshow", ensurePlaying);
    void video.play().catch(() => {
      // Initial autoplay may be blocked; listeners above will retry.
    });

    return () => {
      video.removeEventListener("pause", ensurePlaying);
      document.removeEventListener("visibilitychange", ensurePlaying);
      window.removeEventListener("pageshow", ensurePlaying);
    };
  }, [backgroundType, backgroundVideo]);

  return (
    <section className="relative -mt-20 flex min-h-[70vh] items-center overflow-hidden sm:-mt-24 sm:min-h-[75vh]">
      {backgroundType === "video" && backgroundVideo ? (
        <>
          <div className="absolute inset-0 z-0 h-full w-full">
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              controls={false}
              disablePictureInPicture
              disableRemotePlayback
              controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
              className="hero-bg-video h-full w-full object-cover"
            >
              <source src={backgroundVideo} type="video/mp4" />
            </video>
            <style jsx>{`
              .hero-bg-video::-webkit-media-controls-start-playback-button {
                display: none !important;
                -webkit-appearance: none;
              }
              .hero-bg-video::-webkit-media-controls-overlay-play-button {
                display: none !important;
                -webkit-appearance: none;
              }
              .hero-bg-video::-webkit-media-controls {
                display: none !important;
              }
            `}</style>
          </div>
          <div className="absolute inset-0 z-[1] bg-black/45" />
        </>
      ) : backgroundImage ? (
        <>
          <div className="absolute inset-0 z-0 h-full w-full">
            <Image
              src={backgroundImage}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="100vw"
              unoptimized
            />
          </div>
          <div className="absolute inset-0 z-[1] bg-black/45" />
        </>
      ) : (
        <div className="absolute inset-0 z-0 bg-foreground/90" />
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-1/3 bg-gradient-to-t from-black/50 to-transparent" />

      <div className="container relative z-10 mx-auto w-full px-4 pb-16 pt-36 sm:px-6 sm:pb-20 sm:pt-44 md:pb-24 md:pt-52">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          {eyebrow && !minimal && (
            <motion.span
              className="mb-5 block text-xs font-medium uppercase tracking-eyebrow text-white/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {eyebrow}
            </motion.span>
          )}
          <motion.h1
            className="text-4xl font-medium leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {title}
          </motion.h1>
          {subtitle && !minimal && (
            <motion.p
              className="mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      </div>
    </section>
  );
}
