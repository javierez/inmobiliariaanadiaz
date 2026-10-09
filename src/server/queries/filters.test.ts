// «Reservado» en la web: solo con una reserva viva. Sin framework: afirma,
// imprime un resumen y sale != 0, como el resto de tests.
//
//   pnpm tsx src/server/queries/filters.test.ts
import { PgDialect } from "drizzle-orm/pg-core";
import { listings } from "../db/schema";
import { reservadoCondition } from "./filters";

let failed = 0;

function ok(cond: boolean, what: string): void {
  if (cond) {
    console.log(`  ✓ ${what}`);
    return;
  }
  failed++;
  console.error(`  ✗ ${what}`);
}

const text = new PgDialect()
  .sqlToQuery(reservadoCondition(listings.status, listings.listingId))
  .sql.replace(/\s+/g, " ");

console.log("reservadoCondition");
ok(
  text.includes(`"listings"."status" IN ('En Venta', 'En Alquiler')`),
  "solo un anuncio que está en el mercado",
);
ok(
  text.includes("d.stage IN ('Arras Pending', 'UnderContract')"),
  "cuenta la operación en curso",
);
ok(
  !text.includes("Lost") && !text.includes("Closed"),
  "una operación cerrada o perdida no reserva (Doña Urraca 18)",
);
ok(
  text.includes("le.status = 'pending' AND le.room_id IS NULL"),
  "cuenta el contrato pendiente de propiedad completa, no el de una habitación",
);

console.log(failed === 0 ? "\nOK" : `\n${failed} fallo(s)`);
process.exit(failed === 0 ? 0 : 1);
