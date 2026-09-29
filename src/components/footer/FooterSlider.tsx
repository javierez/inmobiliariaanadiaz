"use client";

import { useState, useEffect, useCallback } from "react";
import { Mail, Phone } from "lucide-react";

interface OfficeLocation {
  name: string;
  address: string[];
  email: string;
  phone: string;
}

interface OfficeLocationsSliderProps {
  officeLocations: OfficeLocation[];
}

export function OfficeLocationsSlider({
  officeLocations,
}: OfficeLocationsSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [isAnimating, setIsAnimating] = useState(false);

  const totalOffices = officeLocations.length;

  const nextOffice = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection("right");
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalOffices);
    setTimeout(() => setIsAnimating(false), 800); // Match this with the transition duration
  }, [totalOffices, isAnimating]);

  // Auto-rotate every 3 seconds
  useEffect(() => {
    if (totalOffices <= 1 || isPaused || isAnimating) return;

    const interval = setInterval(() => {
      nextOffice();
    }, 3000);

    return () => clearInterval(interval);
  }, [nextOffice, totalOffices, isPaused, isAnimating]);

  // If there's only one office or no offices, don't show the slider
  if (totalOffices <= 1) {
    return (
      <div className="space-y-6">
        {officeLocations.map((office, index) => (
          <div key={index} className="text-muted-foreground">
            <p className="font-medium text-foreground">{office.name}</p>
            <address className="mt-1 not-italic">
              {office.address.map((line, i) => (
                <p key={i} className="text-sm">
                  {line}
                </p>
              ))}
              <a
                href={`mailto:${office.email}`}
                className="mt-2 flex items-center gap-2 transition-opacity hover:opacity-80"
              >
                <Mail className="h-3 w-3 flex-shrink-0 text-primary" />
                <p className="text-sm">{office.email}</p>
              </a>
              <a
                href={`tel:${office.phone}`}
                className="mt-1 flex items-center gap-2 transition-opacity hover:opacity-80"
              >
                <Phone className="h-3 w-3 flex-shrink-0 text-primary" />
                <p className="text-sm">{office.phone}</p>
              </a>
            </address>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="min-h-[200px]">
        {officeLocations.map((office, index) => (
          <div
            key={index}
            className={`duration-800 absolute w-full transition-all ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform ${
              index === currentIndex
                ? "translate-x-0 opacity-100"
                : direction === "right"
                  ? "translate-x-full opacity-0"
                  : "-translate-x-full opacity-0"
            }`}
            style={{
              transform: `translateX(${
                index === currentIndex
                  ? "0%"
                  : direction === "right"
                    ? "100%"
                    : "-100%"
              })`,
              transition:
                "transform 800ms cubic-bezier(0.4, 0, 0.2, 1), opacity 800ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div className="text-muted-foreground">
              <p className="font-medium text-foreground">{office.name}</p>
              <address className="mt-1 not-italic">
                {office.address.map((line, i) => (
                  <p key={i} className="text-sm">
                    {line}
                  </p>
                ))}
                <a
                  href={`mailto:${office.email}`}
                  className="mt-2 flex items-center gap-2 transition-opacity hover:opacity-80"
                >
                  <Mail className="h-3 w-3 flex-shrink-0 text-primary" />
                  <p className="text-sm">{office.email}</p>
                </a>
                <a
                  href={`tel:${office.phone}`}
                  className="mt-1 flex items-center gap-2 transition-opacity hover:opacity-80"
                >
                  <Phone className="h-3 w-3 flex-shrink-0 text-primary" />
                  <p className="text-sm">{office.phone}</p>
                </a>
              </address>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
