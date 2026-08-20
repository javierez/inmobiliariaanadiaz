export type HeroMediaItem = {
  url: string;
  type: "image" | "video";
};

/**
 * The hero background used to be a single image OR a single video, held in
 * three loose fields. It is now an ordered list (`backgroundMedia`) written by
 * the CRM's website editor, but the old fields are still read so an account
 * whose config predates the slideshow keeps rendering.
 *
 * Mirror of `src/lib/hero-media.ts` in the CRM repo — this is a separate
 * project and cannot import from it. Keep the two in step.
 */
export type HeroBackgroundFields = {
  backgroundMedia?: HeroMediaItem[] | null;
  backgroundImage?: string | null;
  backgroundVideo?: string | null;
  backgroundType?: "image" | "video" | null;
};

/** The ordered slides to render, legacy config included. */
export function resolveHeroMedia(
  hero: HeroBackgroundFields | null | undefined,
): HeroMediaItem[] {
  if (!hero) return [];

  const media = (hero.backgroundMedia ?? []).filter(
    (item): item is HeroMediaItem => Boolean(item?.url),
  );
  if (media.length > 0) return media;

  // Legacy single-media config. `backgroundType` decides which field wins when
  // both are somehow populated.
  if (hero.backgroundType === "video" && hero.backgroundVideo) {
    return [{ url: hero.backgroundVideo, type: "video" }];
  }
  if (hero.backgroundImage) {
    return [{ url: hero.backgroundImage, type: "image" }];
  }
  if (hero.backgroundVideo) {
    return [{ url: hero.backgroundVideo, type: "video" }];
  }
  return [];
}
