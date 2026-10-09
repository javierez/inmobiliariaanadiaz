import { config } from "dotenv";
config({ path: ".env" }); config({ path: ".env.local", override: true });
process.env.SKIP_ENV_VALIDATION = "true";
const { findListingByExactReference, countListings } = await import("./src/server/queries/listings");
console.log("ACCOUNT =", process.env.NEXT_PUBLIC_ACCOUNT_ID);
for (const q of ["CHA0170","cha0170","CHA-0170","CHA 0170","VESTA2026226831","1295575","PIS0055"]) {
  console.log(`exactRef(${JSON.stringify(q)}) ->`, await findListingByExactReference(q), "| textCount:", await countListings({ q }));
}
process.exit(0);
