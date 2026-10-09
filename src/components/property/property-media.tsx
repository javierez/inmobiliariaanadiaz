"use client";

import { Video, Play, Globe } from "lucide-react";

interface MediaItem {
  id: string;
  url: string;
}

interface PropertyMediaProps {
  videos: MediaItem[];
  youtubeLinks: MediaItem[];
  virtualTours: MediaItem[];
}

/**
 * Extract YouTube video ID from various URL formats:
 * - https://www.youtube.com/watch?v=ID
 * - https://youtu.be/ID
 * - https://www.youtube.com/embed/ID
 */
function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1).split("/")[0] || null;
    }
    if (u.hostname.includes("youtube.com")) {
      // /embed/ID or /v/ID
      const embedMatch = /\/(embed|v)\/([^/?]+)/.exec(u.pathname);
      if (embedMatch?.[2]) return embedMatch[2];
      // ?v=ID
      return u.searchParams.get("v");
    }
  } catch {
    // not a valid URL
  }
  return null;
}

function MediaSection({
  title,
  icon,
  children,
  id,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <div id={id} className="scroll-mt-24">
      <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
        {icon}
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function PropertyMedia({
  videos,
  youtubeLinks,
  virtualTours,
}: PropertyMediaProps) {
  const hasContent =
    videos.length > 0 || youtubeLinks.length > 0 || virtualTours.length > 0;

  if (!hasContent) return null;

  return (
    <div className="space-y-8">
      {videos.length > 0 && (
        <MediaSection
          title="Videos"
          icon={<Video className="h-6 w-6 text-primary" />}
        >
          {videos.map((v) => (
            <div
              key={v.id}
              className="aspect-video w-full overflow-hidden rounded-lg"
            >
              <video
                src={v.url}
                controls
                preload="metadata"
                className="h-full w-full bg-black object-contain"
              />
            </div>
          ))}
        </MediaSection>
      )}

      {youtubeLinks.length > 0 && (
        <MediaSection
          id="prop-video"
          title="YouTube"
          icon={<Play className="h-6 w-6 text-primary" />}
        >
          {youtubeLinks.map((yt) => {
            const videoId = extractYouTubeId(yt.url);
            if (!videoId) return null;
            return (
              <div
                key={yt.id}
                className="aspect-video w-full overflow-hidden rounded-lg"
              >
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            );
          })}
        </MediaSection>
      )}

      {virtualTours.length > 0 && (
        <MediaSection
          id="prop-3d"
          title="Tour Virtual"
          icon={<Globe className="h-6 w-6 text-primary" />}
        >
          {virtualTours.map((tour) => (
            <div
              key={tour.id}
              className="aspect-video w-full overflow-hidden rounded-lg"
            >
              <iframe
                src={tour.url}
                title="Tour virtual"
                allow="fullscreen; vr; xr"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          ))}
        </MediaSection>
      )}
    </div>
  );
}
