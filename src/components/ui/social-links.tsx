import Link from "next/link";
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { cn } from "~/lib/utils";

export interface SocialLink {
  platform: "facebook" | "twitter" | "instagram" | "linkedin" | "youtube";
  url: string;
}

interface SocialLinksProps {
  links: SocialLink[];
  size?: "sm" | "md" | "lg";
  className?: string;
  iconClassName?: string;
}

const platformIcons = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
};

export function SocialLinks({
  links,
  size = "md",
  className,
  iconClassName,
}: SocialLinksProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div className={cn("flex items-center gap-4", className)}>
      {links.map((link) => {
        const Icon = platformIcons[link.platform];
        return (
          <Link
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visítanos en ${link.platform}`}
            className="transition-colors hover:text-primary"
          >
            <Icon
              className={cn(
                sizeClasses[size],
                "text-muted-foreground hover:text-primary",
                iconClassName,
              )}
            />
          </Link>
        );
      })}
    </div>
  );
}
