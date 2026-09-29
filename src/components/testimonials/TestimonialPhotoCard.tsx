"use client";

import Image from "next/image";
import { Star } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar?: string;
  rating?: number;
}

interface TestimonialPhotoCardProps {
  testimonial: Testimonial;
}

/**
 * The "foto de fondo" design: the client's photo fills the card, a dark
 * gradient carries the text, and everything sits in white on top.
 *
 * Only rendered when the testimonial actually has a photo — the carousel falls
 * back to the classic `TestimonialCard` when it doesn't, because this layout
 * with an empty grey rectangle looks broken rather than minimal.
 */
export function TestimonialPhotoCard({
  testimonial,
}: TestimonialPhotoCardProps) {
  const rating = testimonial.rating ?? 5;

  return (
    <div className="group relative flex h-full min-h-[420px] flex-col justify-end overflow-hidden rounded-3xl bg-gray-900 shadow-sm transition-all duration-300 hover:shadow-lg">
      {testimonial.avatar && (
        <Image
          src={testimonial.avatar}
          alt={testimonial.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}

      {/* Legibility gradient — dense at the bottom where the text sits */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/15" />

      <div className="relative z-10 flex flex-col gap-4 p-8">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < rating
                  ? "fill-amber-400 text-amber-400"
                  : "fill-white/25 text-white/25"
              }`}
            />
          ))}
        </div>

        <p className="text-[15px] leading-relaxed text-white">
          &ldquo;{testimonial.content}&rdquo;
        </p>

        <div>
          <h4 className="text-base font-semibold text-white">
            {testimonial.name}
          </h4>
          {testimonial.role && (
            <p className="text-sm font-medium text-white/70">
              {testimonial.role}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
