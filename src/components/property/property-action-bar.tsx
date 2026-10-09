"use client";

import { useState } from "react";
import {
  Camera,
  Box,
  MapPin,
  Video,
  Download,
  Share2,
  Check,
} from "lucide-react";

interface PropertyActionBarProps {
  /** Anchor id of the photo gallery section. */
  fotosAnchor: string;
  /** Anchor id of the location/map section. */
  mapaAnchor: string;
  /** Whether the property has a virtual tour (3D); enables the "3D" action. */
  hasTour: boolean;
  /** Anchor id of the virtual tour section. */
  tourAnchor: string;
  /** Whether the property has a video; enables the "Video" action. */
  hasVideo: boolean;
  /** Anchor id of the video section. */
  videoAnchor: string;
}

/**
 * Quick-action icon bar shown at the top of the property summary for account
 * 137, mirroring the reference site (gilmar.es): Foto · 3D · Mapa · Video ·
 * Descargar · Compartir. Each button smooth-scrolls to its section; "Descargar"
 * opens the browser print dialog (save-as-PDF brochure) and "Compartir" uses
 * the native share sheet with a clipboard fallback.
 *
 * Gated to account 137 by the caller — see lib/account-overrides/137.ts.
 */
export function PropertyActionBar({
  fotosAnchor,
  mapaAnchor,
  hasTour,
  tourAnchor,
  hasVideo,
  videoAnchor,
}: PropertyActionBarProps) {
  const [copied, setCopied] = useState(false);

  const scrollTo = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // user cancelled the share sheet or clipboard was blocked — ignore
    }
  };

  return (
    <div className="flex flex-wrap items-start justify-center gap-6 sm:gap-10 print:hidden">
      <ActionItem
        icon={<Camera className="h-6 w-6" />}
        label="Foto"
        onClick={() => scrollTo(fotosAnchor)}
      />
      {hasTour && (
        <ActionItem
          icon={<Box className="h-6 w-6" />}
          label="3D"
          onClick={() => scrollTo(tourAnchor)}
        />
      )}
      <ActionItem
        icon={<MapPin className="h-6 w-6" />}
        label="Mapa"
        onClick={() => scrollTo(mapaAnchor)}
      />
      {hasVideo && (
        <ActionItem
          icon={<Video className="h-6 w-6" />}
          label="Video"
          onClick={() => scrollTo(videoAnchor)}
        />
      )}
      <ActionItem
        icon={<Download className="h-6 w-6" />}
        label="Descargar"
        onClick={() => window.print()}
      />
      <ActionItem
        icon={
          copied ? (
            <Check className="h-6 w-6 text-green-600" />
          ) : (
            <Share2 className="h-6 w-6" />
          )
        }
        label="Compartir"
        onClick={handleShare}
      />
    </div>
  );
}

function ActionItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 text-primary transition-colors hover:text-primary/70"
    >
      {icon}
      <span className="text-sm font-medium text-foreground">{label}</span>
    </button>
  );
}
