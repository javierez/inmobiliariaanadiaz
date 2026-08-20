"use client";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Star } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar?: string;
  rating?: number;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const rating = testimonial.rating || 5;

  return (
    <div className="group flex h-full flex-col rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:border-gray-200 hover:shadow-lg">
      {/* Header with Avatar and Name */}
      <div className="mb-6 flex items-start gap-4">
        <Avatar className="h-12 w-12 flex-shrink-0">
          {testimonial.avatar && (
            <AvatarImage
              src={testimonial.avatar}
              alt={testimonial.name}
              className="object-cover"
            />
          )}
          <AvatarFallback className="bg-primary/10 font-semibold text-primary">
            {testimonial.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <h4 className="truncate text-base font-semibold text-gray-900">
            {testimonial.name}
          </h4>
          <div className="mt-1 flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 transition-colors duration-200 ${
                  i < rating
                    ? "fill-amber-400 text-amber-400"
                    : "fill-gray-200 text-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Testimonial Content */}
      <p className="flex-1 text-[15px] leading-relaxed text-gray-700">
        {testimonial.content}
      </p>

      {/* Role/Title at bottom */}
      {testimonial.role && (
        <p className="mt-4 text-sm font-medium text-gray-500">
          {testimonial.role}
        </p>
      )}
    </div>
  );
}
