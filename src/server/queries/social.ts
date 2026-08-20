

export type SocialLink = {
  platform: "facebook" | "twitter" | "instagram" | "linkedin" | "youtube";
  url: string;
};

/**
 * One platform's stored value. Historically always the profile URL; the CRM
 * editor now writes `{ url, previewImage }` for a network whose homepage card
 * has a photo — a v2-only feature this template doesn't render.
 *
 * 🚨 Read the object form or lose every link. `.trim()` on an object throws,
 * the catch below swallows it and returns [], so ONE object value used to blank
 * the navbar, the footer and the contact page at once, with no error visible
 * anywhere. That can reach a v1 site without anyone editing it: the new-account
 * bootstrap copies `social_links` verbatim from a template account, and an
 * account can be moved between templates.
 */
type StoredSocialValue = string | { url?: string; previewImage?: string };

/** The URL out of either shape. `previewImage` is dropped: v1 has no cards. */
function urlOf(value: StoredSocialValue): string {
  if (typeof value === "string") return value.trim();
  return value?.url?.trim() ?? "";
}

export const getSocialLinks = (_accountIdArg?: bigint): SocialLink[] => {
  return [{
  "platform": "facebook",
  "url": "https://www.facebook.com/InmobiliariaAnaDiaz"
}, {
  "platform": "instagram",
  "url": "https://www.instagram.com/inmobiliariaanadiaz"
}];
}
