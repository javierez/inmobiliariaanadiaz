import {
  getProvinces,
  getPriceRange,
  getSubtypeOptions,
} from "~/server/actions/locations";
import { getSearchPropertyTypes } from "~/lib/search-utils";
import { PropertySearch } from "./property-search";
import { getLogo } from "~/server/queries/logo";
import { env } from "~/env";
import { isAccount137 } from "~/lib/account-overrides/137";

/**
 * `accountIdArg` is only passed by the CRM preview, which renders an arbitrary
 * account from this one deployment. Without it the provinces and the price
 * range would come from whichever account this site is pinned to — i.e. another
 * agency's data inside the preview. The public site omits it and behaves as
 * before.
 */
export async function PropertySearchWrapper({
  accountId: accountIdArg,
}: { accountId?: bigint } = {}) {
  // Validate NEXT_PUBLIC_ACCOUNT_ID exists before converting to BigInt
  if (!accountIdArg && !env.NEXT_PUBLIC_ACCOUNT_ID) {
    throw new Error(
      "NEXT_PUBLIC_ACCOUNT_ID is not defined in environment variables",
    );
  }
  const accountId = accountIdArg ?? BigInt(env.NEXT_PUBLIC_ACCOUNT_ID);
  const [provinces, salePrices, rentPrices, logoUrl, subtypeOptions] =
    await Promise.all([
      getProvinces(accountId),
      getPriceRange(accountId, "for-sale"),
      getPriceRange(accountId, "for-rent"),
      getLogo(accountIdArg),
      getSubtypeOptions(accountId),
    ]);

  // Misma lista que la barra de resultados (antes la home ofrecía 6 tipos y la
  // barra 9). Account 137 añade el pseudo-tipo "terreno-industrial".
  const propertyTypes = getSearchPropertyTypes(isAccount137());

  return (
    <PropertySearch
      provinces={provinces}
      propertyTypes={propertyTypes}
      subtypeOptions={subtypeOptions}
      priceRanges={{ "for-sale": salePrices, "for-rent": rentPrices }}
      accountId={accountId.toString()}
      logoUrl={logoUrl}
    />
  );
}
