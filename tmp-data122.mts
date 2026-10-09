import { config } from "dotenv";
config({ path: ".env" }); config({ path: ".env.local", override: true });
import postgres from "postgres";
const sql = postgres(process.env.POSTGRES_URL!, { prepare: false });
const acct = BigInt(process.env.NEXT_PUBLIC_ACCOUNT_ID!);
console.log("ACCOUNT =", acct.toString());
const rows = await sql`
  SELECT l.listing_id, l.idealista_reference, p.reference_number, p.title, p.street,
         loc.city, loc.province, l.listing_type, l.status
  FROM listings l
  JOIN properties p ON l.property_id=p.property_id
  LEFT JOIN locations loc ON p.neighborhood_id=loc.neighborhood_id
  WHERE l.account_id=${acct} AND l.is_active=true AND l.publish_to_website=true
    AND EXISTS (SELECT 1 FROM property_images pi WHERE pi.property_id=l.property_id AND pi.is_active=true)
  ORDER BY l.listing_id LIMIT 8`;
for (const r of rows) console.log(JSON.stringify(r));
const tot = await sql`SELECT COUNT(*)::int n FROM listings l WHERE l.account_id=${acct} AND l.is_active=true AND l.publish_to_website=true
  AND EXISTS (SELECT 1 FROM property_images pi WHERE pi.property_id=l.property_id AND pi.is_active=true)`;
console.log("total publicly visible:", tot[0]!.n);
const rent = await sql`SELECT l.listing_id, l.idealista_reference, l.listing_type FROM listings l
  WHERE l.account_id=${acct} AND l.is_active=true AND l.publish_to_website=true AND l.listing_type IN ('Rent','RentWithOption')
  AND EXISTS (SELECT 1 FROM property_images pi WHERE pi.property_id=l.property_id AND pi.is_active=true) LIMIT 3`;
console.log("rentals:", JSON.stringify(rent));
await sql.end();
