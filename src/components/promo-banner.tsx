import { getResolvedBanner } from "~/server/queries/banner";
import { BannerView } from "~/components/banner-view";

/**
 * Big homepage banner rendered as the first content element, below the hero and
 * search bar. Driven by `website_config.banner_props` (see getResolvedBanner).
 * Renders nothing when the account's banner is "none" (the default), so it is
 * inert for every account until explicitly configured.
 *
 * `accountId` is only passed by the CRM preview, which renders an arbitrary
 * account from this one deployment. On the public site it is omitted and the
 * query falls back to NEXT_PUBLIC_ACCOUNT_ID, exactly as before.
 *
 * The markup lives in `BannerView` so the preview can repaint it live from an
 * editor patch without keeping a second copy of the layout.
 */
export default async function PromoBanner({
  accountId,
}: { accountId?: bigint } = {}) {
  const banner = await getResolvedBanner(accountId);
  if (!banner) return null;
  return <BannerView banner={banner} />;
}
