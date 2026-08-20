/**
 * Shared decoding for the patches the CRM's website editor posts into the
 * preview iframe.
 *
 * Two shapes exist, and every receiver has to accept both. A section that
 * watches ONE form path sends that value bare; a section that watches several —
 * or that also carries a collection from a table of its own, like los
 * testimonios or los artículos del blog — sends an object keyed by name.
 *
 * Accepting both is not politeness: the CRM and these sites deploy
 * independently, so a newer editor routinely talks to a preview that has not
 * been redeployed yet, and the other way round. A receiver that understood only
 * its own generation would go silently inert — which is exactly the bug this
 * whole mechanism exists to fix.
 */

export interface PreviewMessage {
  type: "vesta:preview";
  section: string;
  patch?: unknown;
}

/** Narrow a window message to a patch for one section. */
export function readPreviewMessage(
  data: unknown,
  section: string,
): PreviewMessage | null {
  if (!data || typeof data !== "object") return null;
  const msg = data as Partial<PreviewMessage>;
  if (msg.type !== "vesta:preview" || msg.section !== section) return null;
  return msg as PreviewMessage;
}

/**
 * Does this patch carry named slices, or is it the bare value of a single
 * watched path? True when any of `keys` is present on the object.
 */
export function isKeyedPatch(
  patch: unknown,
  keys: readonly string[],
): patch is Record<string, unknown> {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) return false;
  return keys.some((key) => key in patch);
}

/**
 * Pull one named slice out of a patch, falling back to the whole patch when it
 * arrived in the bare single-path shape.
 *
 * ```
 * // new editor: { testimonialProps: {...}, testimonials: [...] }
 * // old editor: {...}                       ← the props themselves
 * const props = slice<TestimonialProps>(patch, "testimonialProps", KEYS);
 * ```
 */
export function slice<T>(
  patch: unknown,
  key: string,
  keys: readonly string[],
): T | undefined {
  if (isKeyedPatch(patch, keys)) return patch[key] as T | undefined;
  // Bare shape: it can only be the slice of the one path being watched.
  return keys[0] === key ? (patch as T | undefined) : undefined;
}

/** Announce to the editor that this frame is mounted and ready for patches. */
export function announceReady(): void {
  window.parent.postMessage({ type: "vesta:preview-ready" }, "*");
}
