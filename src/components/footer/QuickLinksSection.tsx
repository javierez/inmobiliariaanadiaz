"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface QuickLink {
  text: string;
  href: string;
}

interface QuickLinksSectionProps {
  links: QuickLink[];
  visibility: Record<string, boolean>;
}

export function QuickLinksSection({
  links,
  visibility,
}: QuickLinksSectionProps) {
  const [showAll, setShowAll] = useState(false);

  // Filter links based on visibility
  const visibleLinks = links.filter(
    (link) => visibility[link.text.toLowerCase()] !== false,
  );

  // Show only first 4 links initially
  const displayedLinks = showAll ? visibleLinks : visibleLinks.slice(0, 4);
  const hasMoreLinks = visibleLinks.length > 4;

  return (
    <div className="sm:pl-0 lg:pl-8">
      <h3 className="relative mb-4 inline-block text-lg font-bold text-foreground sm:mb-6 sm:text-xl lg:mb-8">
        Enlaces Rápidos
        <div className="absolute -bottom-2 left-0 h-0.5 w-full origin-left scale-x-100 transform rounded-full bg-primary/60 transition-transform duration-300 group-hover:scale-x-75"></div>
      </h3>
      <nav>
        <ul className="space-y-2 sm:space-y-3 lg:space-y-4">
          {displayedLinks.map((link, index) => (
            <li key={index}>
              <Link
                href={link.href}
                className="block py-1.5 text-base font-medium text-muted-foreground transition-all duration-300 hover:translate-x-2 hover:font-semibold hover:text-primary"
              >
                {link.text}
              </Link>
            </li>
          ))}
          {hasMoreLinks && (
            <li className="flex justify-start">
              <button
                onClick={() => setShowAll(!showAll)}
                className="flex w-12 items-center justify-center rounded-md bg-white/10 py-1.5 text-base font-medium text-muted-foreground shadow-md backdrop-blur-sm transition-all duration-300 hover:font-semibold hover:text-primary hover:shadow-lg"
              >
                {showAll ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
}
