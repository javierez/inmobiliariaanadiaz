import { getProvinces, getPriceRange } from "~/server/actions/locations";
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
  const [provinces, priceRange, logoUrl] = await Promise.all([
    getProvinces(accountId),
    getPriceRange(accountId),
    getLogo(accountIdArg),
  ]);

  // Hardcoded property types. Account 137 (industrial agency) additionally gets
  // the "terreno-industrial" pseudo-type and shows "industrial" as "Nave".
  const propertyTypes = isAccount137()
    ? [
        "piso",
        "casa",
        "local",
        "solar",
        "garaje",
        "edificio",
        "oficina",
        "industrial",
        "terreno-industrial",
        "trastero",
      ]
    : ["piso", "casa", "local", "solar", "garaje", "industrial"];

  // Ensure priceRange has valid numbers
  const validPriceRange = {
    minPrice: typeof priceRange.minPrice === "number" ? priceRange.minPrice : 0,
    maxPrice:
      typeof priceRange.maxPrice === "number" ? priceRange.maxPrice : 2000000,
  };

  return (
    <PropertySearch
      provinces={provinces}
      propertyTypes={propertyTypes}
      priceRange={validPriceRange}
      accountId={accountId.toString()}
      logoUrl={logoUrl}
    />
  );
}
