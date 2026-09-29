"use client";

/**
 * Cross-fading hero background over an ordered list of images and videos.
 *
 * Images hold for a fixed beat; videos hold until they finish. A single slide
 * behaves exactly like the old single-media hero: the video loops, nothing
 * rotates. Positioning is the caller's — the homepage hero pins the layers to
 * the viewport, the inner page banners keep them inside the section.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import type { HeroMediaItem } from "~/lib/hero-media";

const IMAGE_DURATION_MS = 6000;

interface HeroBackgroundProps {
  media: HeroMediaItem[];
  /** Positioning applied to both the media layer and the overlay layer. */
  layerClassName: string;
  /** Extra classes for the readability overlay (e.g. a tint). */
  overlayClassName?: string;
  overlayStyle?: CSSProperties;
}

export function HeroBackground({
  media,
  layerClassName,
  overlayClassName = "",
  overlayStyle,
}: HeroBackgroundProps) {
  const [active, setActive] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  // Slides whose file failed to load. Skipped rather than left on screen as a
  // black frame that never advances.
  const failed = useRef<Set<number>>(new Set());

  const count = media.length;
  const isSingle = count < 2;
  const current = media[active];

  // The config can change under us (the CRM preview pushes edits live).
  useEffect(() => {
    setActive((i) => (i < count ? i : 0));
  }, [count]);

  const advance = useCallback(() => {
    setActive((i) => {
      for (let step = 1; step <= count; step++) {
        const candidate = (i + step) % count;
        if (!failed.current.has(candidate)) return candidate;
      }
      return i; // everything failed — hold rather than spin
    });
  }, [count]);

  // Images advance on a timer. Videos advance from onEnded below.
  useEffect(() => {
    if (isSingle || current?.type !== "image") return;
    const id = setTimeout(advance, IMAGE_DURATION_MS);
    return () => clearTimeout(id);
  }, [active, current?.type, isSingle, advance]);

  // Only the active video plays; the others rewind so they restart clean.
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === active) {
        void video.play().catch(() => {
          // Autoplay can be blocked; the watchdog below retries.
        });
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [active]);

  // Keep the active video playing — recover from low-power mode, tab switches
  // and autoplay hiccups so the iOS play-button overlay never lingers. An
  // ended video is left alone: that pause is the cue to move to the next slide.
  useEffect(() => {
    const video = videoRefs.current[active];
    if (!video) return;

    const ensurePlaying = () => {
      if (document.hidden) return;
      if (video.ended) return;
      if (!video.paused) return;
      void video.play().catch(() => {
        // Autoplay can still be blocked; nothing useful to do here.
      });
    };

    video.addEventListener("pause", ensurePlaying);
    document.addEventListener("visibilitychange", ensurePlaying);
    window.addEventListener("pageshow", ensurePlaying);
    ensurePlaying();

    return () => {
      video.removeEventListener("pause", ensurePlaying);
      document.removeEventListener("visibilitychange", ensurePlaying);
      window.removeEventListener("pageshow", ensurePlaying);
    };
  }, [active]);

  if (count === 0) return null;

  const handleFailure = (index: number) => {
    failed.current.add(index);
    if (index === active) advance();
  };

  return (
    <>
      <div className={`${layerClassName} -z-20`}>
        {media.map((item, index) => {
          const isActive = index === active;
          // Only the current and next slides are worth fetching up front.
          const isNext = !isSingle && index === (active + 1) % count;

          return (
            <div
              key={item.url}
              aria-hidden={!isActive}
              className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
              style={{ opacity: isActive ? 1 : 0 }}
            >
              {item.type === "video" ? (
                <video
                  ref={(el) => {
                    videoRefs.current[index] = el;
                  }}
                  autoPlay={isActive}
                  loop={isSingle}
                  muted
                  playsInline
                  preload={isActive || isNext ? "auto" : "none"}
                  controls={false}
                  disablePictureInPicture
                  disableRemotePlayback
                  controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
                  className="hero-bg-video h-full w-full object-cover"
                  onEnded={() => {
                    if (!isSingle) advance();
                  }}
                  onError={() => handleFailure(index)}
                >
                  <source src={item.url} type="video/mp4" />
                </video>
              ) : (
                <Image
                  src={item.url}
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={index === 0}
                  onError={() => handleFailure(index)}
                />
              )}
            </div>
          );
        })}

        {/* Hide the iOS/Safari play-button overlay that flashes on autoplay hiccups. */}
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

      <div
        className={`${layerClassName} -z-10 ${overlayClassName}`}
        style={overlayStyle}
      />
    </>
  );
}
