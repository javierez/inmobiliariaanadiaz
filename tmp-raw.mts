import { config } from "dotenv";
config();
import postgres from "postgres";
const sql = postgres(process.env.POSTGRES_URL!, { prepare: false });
const acct = process.env.NEXT_PUBLIC_ACCOUNT_ID!;
console.log("ACCOUNT_ID =", acct);

const PUNCT = ".,-'\"`()";
async function count(token: string) {
  const r = await sql`
    SELECT COUNT(*)::int AS n
    FROM listings l
    JOIN properties p ON l.property_id = p.property_id
    LEFT JOIN locations loc ON p.neighborhood_id = loc.neighborhood_id
    WHERE l.account_id = ${BigInt(acct)}
      AND l.is_active = true
      AND l.publish_to_website = true
      AND EXISTS (SELECT 1 FROM property_images pi WHERE pi.property_id = l.property_id AND pi.is_active = true)
      AND (l.status NOT IN ('Draft','Descartado','Vendido','Alquilado')
           OR (l.status IN ('Vendido','Alquilado') AND l.updated_at >= NOW() - INTERVAL '14 days'))
      AND TRANSLATE(LOWER(unaccent(
            COALESCE(l.publishable_title,'') || ' ' || COALESCE(p.title,'') || ' ' ||
            COALESCE(l.description,'') || ' ' || COALESCE(p.street,'') || ' ' ||
            COALESCE(p.reference_number,'') || ' ' || COALESCE(l.idealista_reference,'') || ' ' ||
            COALESCE(p.postal_code,'') || ' ' || COALESCE(loc.city,'') || ' ' ||
            COALESCE(loc.municipality,'') || ' ' || COALESCE(loc.neighborhood,'') || ' ' ||
            COALESCE(loc.province,'')
          )), ${PUNCT}, '') LIKE ${'%' + token + '%'}`;
  return r[0]!.n;
}
for (const t of ["leon","casa","p008807","padreisla"]) {
  console.log(`raw SQL token=${t} -> ${await count(t)}`);
}
// total published
const tot = await sql`SELECT COUNT(*)::int n FROM listings l WHERE l.account_id=${BigInt(acct)} AND l.is_active=true AND l.publish_to_website=true`;
console.log("total active+published (no photo gate):", tot[0]!.n);
await sql.end();
