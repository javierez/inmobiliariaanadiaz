import Image from "next/image";
import { YouTubeEmbed } from "~/components/ui/youtube-embed";
import { cn } from "~/lib/utils";
import { descriptionAlignClass } from "~/lib/description-align";
import { getFeaturesProps } from "~/server/queries/website-config";

interface OriginsSectionProps {
  title: string;
  content: string;
  content2?: string;
  image?: string;
  youtubeVideoId?: string;
  youtubeTitle?: string;
}

export async function OriginsSection({
  title,
  content,
  content2,
  image,
  youtubeVideoId,
  youtubeTitle,
}: OriginsSectionProps) {
  const alignClass = descriptionAlignClass(
    (await getFeaturesProps()).descriptionAlign,
  );
  return (
    <section className="py-20 sm:py-24" id="origenes">
      <div className="container mx-auto">
        {image && (
          <div className="mx-auto mb-12 max-w-5xl overflow-hidden rounded-2xl border border-border/60">
            <div className="relative aspect-[21/9] w-full">
              <Image
                src={image}
                alt={title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>
          </div>
        )}
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 block text-xs font-medium uppercase tracking-eyebrow text-muted-foreground">
            Nuestros Orígenes
          </span>
          <h2 className="mb-6 text-3xl font-medium leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {title}
          </h2>
          <p
            className={cn(
              "text-base leading-relaxed text-muted-foreground sm:text-lg",
              alignClass,
            )}
          >
            {content}
          </p>
          {content2 && (
            <p
              className={cn(
                "mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg",
                alignClass,
              )}
            >
              {content2}
            </p>
          )}
        </div>

        {youtubeVideoId && (
          <div className="mx-auto mt-12 max-w-4xl">
            <YouTubeEmbed videoId={youtubeVideoId} title={youtubeTitle} />
          </div>
        )}
      </div>
    </section>
  );
}
