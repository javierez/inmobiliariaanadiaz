"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Move, Maximize2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { isAccount137 } from "~/lib/account-overrides/137";
import type { PropertyImage } from "~/lib/data";

interface ImageGalleryProps {
  images: PropertyImage[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loaded, setLoaded] = useState<boolean[]>(
    () => Array(images.length).fill(false) as boolean[],
  );

  // AI comparison modal state
  const [comparisonModal, setComparisonModal] = useState<{
    isOpen: boolean;
    aiImage: PropertyImage | null;
    originalImage: PropertyImage | null;
  } | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const comparisonContainerRef = useRef<HTMLDivElement | null>(null);

  const validImages = images?.filter((img) => img.url && img.url !== "") || [];
  const defaultPlaceholder = "/suburban-dream.png";

  if (validImages.length === 0) {
    validImages.push({
      url: defaultPlaceholder,
      alt: title || "Property image",
    });
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleImageLoad = (index: number) => {
    setLoaded((prev) => {
      const newLoaded = [...prev];
      newLoaded[index] = true;
      return newLoaded;
    });
  };

  // When an image fails (403/404), fall back to the original URL.
  // Tracks both main images and thumbnails separately.
  const [urlOverrides, setUrlOverrides] = useState<Record<number, string>>({});
  const [thumbErrors, setThumbErrors] = useState<Record<number, boolean>>({});

  const handleImageError = (index: number) => {
    const image = validImages[index];
    if (image?.fallbackUrl && !urlOverrides[index]) {
      setUrlOverrides((prev) => ({ ...prev, [index]: image.fallbackUrl! }));
    }
  };

  const handleThumbError = (index: number) => {
    setThumbErrors((prev) => ({ ...prev, [index]: true }));
    // Also trigger main fallback if not already set
    handleImageError(index);
  };

  const getImageUrl = (image: PropertyImage, index: number): string =>
    urlOverrides[index] ?? image.url ?? "/placeholder.svg";

  /** Use the small thumbnail variant for the strip; fall back to the main URL */
  const getThumbUrl = (image: PropertyImage, index: number): string => {
    // If the thumbUrl already errored, skip it and use the main URL fallback
    if (thumbErrors[index]) return getImageUrl(image, index);
    return image.thumbUrl ?? getImageUrl(image, index);
  };

  // Transform image tags based on AI processing type
  const getDisplayLabel = (tag: string | undefined): string | undefined => {
    if (!tag) return undefined;
    if (tag.startsWith("ai_")) return undefined;
    return tag;
  };

  // Find original image by ID for AI comparison
  const findOriginalImage = (originId: string): PropertyImage | undefined => {
    return images.find((img) => img.id === originId);
  };

  const shouldShowAiComparison = (image: PropertyImage): boolean => {
    if (!image.originImageId) return false;
    return true;
  };

  const updateSliderPosition = useCallback((clientX: number) => {
    if (!comparisonContainerRef.current) return;
    const rect = comparisonContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.min(100, Math.max(0, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const openComparisonModal = (aiImage: PropertyImage) => {
    if (!aiImage.originImageId) return;
    const original = findOriginalImage(aiImage.originImageId);
    if (original) {
      setComparisonModal({ isOpen: true, aiImage, originalImage: original });
      setSliderPosition(50);
    }
  };

  // Fullscreen: ESC closes, arrows navigate, and body scroll is locked.
  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
      else if (e.key === "ArrowRight")
        setCurrentIndex((p) => (p === validImages.length - 1 ? 0 : p + 1));
      else if (e.key === "ArrowLeft")
        setCurrentIndex((p) => (p === 0 ? validImages.length - 1 : p - 1));
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isFullscreen, validImages.length]);

  // Lateral swipe (mobile): drag left → next, drag right → previous.
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || validImages.length <= 1) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const dx = endX - touchStartX.current;
    touchStartX.current = null;
    const THRESHOLD = 40;
    if (dx <= -THRESHOLD) handleNext();
    else if (dx >= THRESHOLD) handlePrevious();
  };

  return (
    <div className="space-y-4">
      <div
        className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-muted"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {validImages.map((image, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-opacity duration-500",
              index === currentIndex
                ? "opacity-100"
                : "pointer-events-none opacity-0",
            )}
          >
            {image.tag === "video" ? (
              <video
                src={image.url}
                controls
                preload="metadata"
                className="h-full w-full bg-black object-contain"
                onLoadedMetadata={() => handleImageLoad(index)}
              />
            ) : (
              <>
                <Image
                  src={getImageUrl(image, index)}
                  alt={image.alt || title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  className="cursor-zoom-in object-cover"
                  priority={index === 0}
                  loading={index === 0 ? undefined : "lazy"}
                  onLoad={() => handleImageLoad(index)}
                  onError={() => handleImageError(index)}
                  onClick={() => setIsFullscreen(true)}
                />
                {!loaded[index] && (
                  <div className="absolute inset-0 animate-pulse bg-muted" />
                )}
              </>
            )}

            {/* Regular tag badge (non-AI images only) */}
            {!shouldShowAiComparison(image) &&
              (() => {
                const displayLabel = getDisplayLabel(image.tag);
                return (
                  displayLabel && (
                    <Badge className="absolute bottom-4 left-4 bg-black/70 text-white">
                      {displayLabel}
                    </Badge>
                  )
                );
              })()}
            {/* Compare button for AI images - only when parent image is visible */}
            {shouldShowAiComparison(image) &&
              findOriginalImage(image.originImageId!) && (
                <Button
                  variant="default"
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-rose-600 sm:px-6 sm:py-3 sm:text-base"
                  onClick={() => openComparisonModal(image)}
                >
                  <Move className="mr-2 h-5 w-5" />
                  Comparar con original
                </Button>
              )}
          </div>
        ))}

        {validImages.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white"
              onClick={handlePrevious}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white"
              onClick={handleNext}
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Fullscreen toggle — available even for a single image. */}
        <Button
          variant="outline"
          size="icon"
          className="absolute right-4 top-4 h-10 w-10 rounded-full bg-white/80 hover:bg-white"
          onClick={() => setIsFullscreen(true)}
          aria-label="Ver en pantalla completa"
        >
          <Maximize2 className="h-5 w-5" />
        </Button>
      </div>

      {validImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {validImages.map((image, index) => (
            <button
              key={index}
              className={cn(
                "relative flex-shrink-0 overflow-hidden rounded-md border-2",
                // Account 137 uses larger thumbnails (144px); default is 80px.
                isAccount137() ? "h-36 w-36" : "h-20 w-20",
                index === currentIndex
                  ? "border-primary"
                  : "border-transparent",
              )}
              onClick={() => handleThumbnailClick(index)}
              aria-label={`View image ${index + 1}`}
            >
              {image.tag === "video" ? (
                <div className="relative h-full w-full bg-black">
                  {/* Use the video itself to grab a poster frame */}
                  <video
                    src={`${image.url}#t=0.5`}
                    preload="metadata"
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                  {/* Play icon overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white drop-shadow"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                </div>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={getThumbUrl(image, index)}
                  alt={image.alt || `${title} - Thumbnail ${index + 1}`}
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={() => handleThumbError(index)}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen viewer — the full image in its real format on a clean
          black backdrop. Swipe laterally on mobile to change photo. */}
      {isFullscreen &&
        (() => {
          const image = validImages[currentIndex];
          if (!image) return null;
          const url = getImageUrl(image, currentIndex);
          return (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {image.tag === "video" ? (
                <video
                  src={url}
                  controls
                  autoPlay
                  className="relative z-10 max-h-[92vh] max-w-[96vw] object-contain"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={url}
                  alt={image.alt || title}
                  className="relative z-10 max-h-[92vh] max-w-[96vw] object-contain"
                />
              )}

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 z-20 text-white hover:bg-white/20"
                onClick={() => setIsFullscreen(false)}
                aria-label="Cerrar pantalla completa"
              >
                <X className="h-6 w-6" />
              </Button>

              {validImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 z-20 h-11 w-11 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20"
                    onClick={handlePrevious}
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft className="h-7 w-7" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 z-20 h-11 w-11 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20"
                    onClick={handleNext}
                    aria-label="Imagen siguiente"
                  >
                    <ChevronRight className="h-7 w-7" />
                  </Button>
                  <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
                    {currentIndex + 1} / {validImages.length}
                  </div>
                </>
              )}
            </div>
          );
        })()}

      {/* AI Comparison Modal */}
      {comparisonModal?.isOpen &&
        comparisonModal.aiImage &&
        comparisonModal.originalImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="relative max-h-[90vh] max-w-[90vw]">
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-12 right-0 text-white hover:bg-white/20"
                onClick={() => setComparisonModal(null)}
              >
                <X className="h-6 w-6" />
              </Button>

              <div
                ref={comparisonContainerRef}
                className="relative aspect-[16/9] w-[90vw] max-w-6xl cursor-ew-resize overflow-hidden rounded-lg"
                onMouseMove={(e) =>
                  isDragging && updateSliderPosition(e.clientX)
                }
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                onTouchMove={(e) =>
                  isDragging &&
                  e.touches[0] &&
                  updateSliderPosition(e.touches[0].clientX)
                }
                onTouchEnd={() => setIsDragging(false)}
              >
                <Image
                  src={(() => {
                    const ai = comparisonModal.aiImage;
                    const idx = validImages.findIndex(
                      (img) => img.id === ai.id,
                    );
                    return idx >= 0 ? getImageUrl(ai, idx) : ai.url;
                  })()}
                  alt="AI Enhanced"
                  fill
                  className="object-contain"
                />
                <div
                  className="absolute inset-0"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <Image
                    src={(() => {
                      const orig = comparisonModal.originalImage;
                      const idx = validImages.findIndex(
                        (img) => img.id === orig.id,
                      );
                      return idx >= 0 ? getImageUrl(orig, idx) : orig.url;
                    })()}
                    alt="Original"
                    fill
                    className="object-contain"
                  />
                </div>
                <div
                  className="absolute bottom-0 top-0 w-1 bg-white shadow-lg transition-all duration-75 ease-out"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div
                    className={cn(
                      "absolute top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center rounded-full border-2 border-gray-200 bg-white shadow-xl transition-all duration-200",
                      isDragging &&
                        "scale-110 cursor-grabbing border-rose-400 shadow-2xl",
                    )}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    role="slider"
                    aria-valuenow={sliderPosition}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Arrastrar para comparar"
                  >
                    <Move className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 rounded bg-black/70 px-2 py-1 text-sm text-white">
                  Original
                </div>
                <div className="absolute bottom-4 right-4 rounded bg-rose-500 px-2 py-1 text-sm text-white">
                  Mejorado IA
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
