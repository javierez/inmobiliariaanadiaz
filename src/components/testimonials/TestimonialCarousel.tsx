"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TestimonialCard } from "./TestimonialCard";
import { TestimonialPhotoCard } from "./TestimonialPhotoCard";
import { cn } from "~/lib/utils";
import type { TestimonialCardStyle } from "~/lib/data";
import { staggerContainer, staggerItem } from "~/lib/animations";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar?: string;
  rating?: number;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  /** Card design chosen in the CRM. Defaults to the classic avatar card. */
  cardStyle?: TestimonialCardStyle;
}

/**
 * One card, in the chosen design. `photo` needs a photo to be a design at all,
 * so a testimonial without one falls back to the classic card instead of
 * rendering an empty grey rectangle.
 */
function TestimonialItem({
  testimonial,
  cardStyle,
}: {
  testimonial: Testimonial;
  cardStyle: TestimonialCardStyle;
}) {
  if (cardStyle === "photo" && testimonial.avatar) {
    return <TestimonialPhotoCard testimonial={testimonial} />;
  }
  return <TestimonialCard testimonial={testimonial} />;
}

export function TestimonialCarousel({
  testimonials,
  cardStyle = "avatar",
}: TestimonialCarouselProps) {
  const needsCarousel = testimonials.length > 3;

  if (!needsCarousel) {
    return (
      <TestimonialGrid testimonials={testimonials} cardStyle={cardStyle} />
    );
  }

  return (
    <TestimonialScroller testimonials={testimonials} cardStyle={cardStyle} />
  );
}

/** Simple centered grid for 1-3 testimonials */
function TestimonialGrid({
  testimonials,
  cardStyle,
}: {
  testimonials: Testimonial[];
  cardStyle: TestimonialCardStyle;
}) {
  return (
    <motion.div
      className={cn(
        "grid gap-8",
        testimonials.length === 1 && "mx-auto max-w-md grid-cols-1",
        testimonials.length === 2 && "grid-cols-1 md:grid-cols-2",
        testimonials.length === 3 &&
          "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      )}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      {testimonials.map((testimonial) => (
        <motion.div
          key={testimonial.id}
          variants={staggerItem}
          whileHover={{
            y: -5,
            transition: { duration: 0.3 },
          }}
        >
          <TestimonialItem testimonial={testimonial} cardStyle={cardStyle} />
        </motion.div>
      ))}
    </motion.div>
  );
}

/** Scrollable carousel for 4+ testimonials */
function TestimonialScroller({
  testimonials,
  cardStyle,
}: {
  testimonials: Testimonial[];
  cardStyle: TestimonialCardStyle;
}) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10,
    );
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", checkScrollability);
    window.addEventListener("resize", checkScrollability);

    return () => {
      container.removeEventListener("scroll", checkScrollability);
      window.removeEventListener("resize", checkScrollability);
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth =
      container.querySelector(".testimonial-card")?.clientWidth || 400;
    const scrollAmount = cardWidth + 32;

    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {/* Gradient overlays */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-gray-50 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-gray-50 to-transparent" />

      {/* Navigation buttons */}
      <motion.button
        onClick={() => scroll("left")}
        disabled={!canScrollLeft}
        className={cn(
          "absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg transition-all duration-200",
          canScrollLeft
            ? "opacity-100 hover:scale-110 hover:shadow-xl"
            : "pointer-events-none opacity-0",
        )}
        aria-label="Previous testimonials"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: canScrollLeft ? 1 : 0 }}
        whileHover={{ scale: canScrollLeft ? 1.1 : 1 }}
        whileTap={{ scale: canScrollLeft ? 0.95 : 1 }}
      >
        <ChevronLeft className="h-5 w-5 text-gray-600" />
      </motion.button>

      <motion.button
        onClick={() => scroll("right")}
        disabled={!canScrollRight}
        className={cn(
          "absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg transition-all duration-200",
          canScrollRight
            ? "opacity-100 hover:scale-110 hover:shadow-xl"
            : "pointer-events-none opacity-0",
        )}
        aria-label="Next testimonials"
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: canScrollRight ? 1 : 0 }}
        whileHover={{ scale: canScrollRight ? 1.1 : 1 }}
        whileTap={{ scale: canScrollRight ? 0.95 : 1 }}
      >
        <ChevronRight className="h-5 w-5 text-gray-600" />
      </motion.button>

      {/* Scrollable container */}
      <motion.div
        ref={scrollContainerRef}
        className="scrollbar-hide flex gap-8 overflow-x-auto scroll-smooth pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {testimonials.map((testimonial) => (
          <motion.div
            key={testimonial.id}
            className="testimonial-card w-full flex-shrink-0 md:w-[calc(50%-16px)] lg:w-[calc(33.333%-21px)]"
            variants={staggerItem}
            whileHover={{
              y: -5,
              transition: { duration: 0.3 },
            }}
          >
            <TestimonialItem testimonial={testimonial} cardStyle={cardStyle} />
          </motion.div>
        ))}
      </motion.div>

      {/* Scroll indicators */}
      <motion.div
        className="mt-8 flex justify-center gap-2"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        {Array.from({ length: Math.ceil(testimonials.length / 3) }).map(
          (_, i) => (
            <motion.button
              key={i}
              onClick={() => {
                const container = scrollContainerRef.current;
                if (!container) return;
                const cardWidth =
                  container.querySelector(".testimonial-card")?.clientWidth ||
                  400;
                container.scrollTo({
                  left: i * (cardWidth + 32) * 3,
                  behavior: "smooth",
                });
              }}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === 0 ? "w-8 bg-brand" : "w-2 bg-gray-300 hover:bg-gray-400",
              )}
              aria-label={`Go to testimonial group ${i + 1}`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            />
          ),
        )}
      </motion.div>
    </motion.div>
  );
}
