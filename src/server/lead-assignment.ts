import { and, eq, sql } from "drizzle-orm";

import { db } from "./db";
import { accounts, listings, users } from "~/server/db/schema";

/**
 * Quién se queda el lead que entra por la web de la agencia.
 *
 * Réplica deliberada de `pickAutoAgent` + `assignByReparto` del CRM
 * (`vesta/src/server/queries/agent-reparto.ts`). Los dos repos escriben en la
 * MISMA tabla `contacts`, así que un lead de la web y uno de Fotocasa tienen
 * que acabar en el mismo sitio; el CRM no es importable desde aquí, de modo que
 * lo que se comparte es la configuración: `accounts.portal_settings.contactAssignment`.
 * Si allí cambian las reglas, hay que tocar los dos.
 *
 * Hasta ahora esto no existía: la web insertaba el contacto con
 * `assigned_to = NULL`, el único camino de entrada que no asignaba. En ECOGAR
 * (cuenta 122) eso eran 7 de 7 leads de web sin dueño frente a 1 de 123 de
 * portales — sin notificación y sin nadie que los atendiera.
 *
 * Modos, igual que en el CRM:
 *   - `fixed`         → el agente configurado, si sigue activo; si no, reparto.
 *   - `reparto`       → el agente activo con menos contactos.
 *   - `listing_agent` → el agente del anuncio, si sigue activo; si no, reparto.
 *
 * El reparto se restringe a `unlinkedFallbackAgentIds` cuando la cuenta lo
 * define, y siempre excluye `excludedAgentIds`.
 */

interface ContactAssignmentConfig {
  portalLeadMode: "listing_agent" | "reparto" | "fixed";
  fixedAgentId: string | null;
  excludedAgentIds: string[];
  unlinkedFallbackAgentIds: string[];
}

const DEFAULTS: ContactAssignmentConfig = {
  portalLeadMode: "listing_agent",
  fixedAgentId: null,
  excludedAgentIds: [],
  unlinkedFallbackAgentIds: [],
};

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : [];
}

async function readConfig(accountId: bigint): Promise<ContactAssignmentConfig> {
  const [row] = await db
    .select({ portalSettings: accounts.portalSettings })
    .from(accounts)
    .where(eq(accounts.accountId, accountId))
    .limit(1);

  const settings = row?.portalSettings as Record<string, unknown> | null;
  const raw = settings?.contactAssignment as Record<string, unknown> | undefined;
  if (!raw) return DEFAULTS;

  const mode = raw.portalLeadMode;
  return {
    portalLeadMode:
      mode === "reparto" || mode === "fixed" || mode === "listing_agent"
        ? mode
        : DEFAULTS.portalLeadMode,
    fixedAgentId:
      typeof raw.fixedAgentId === "string" ? raw.fixedAgentId : null,
    excludedAgentIds: stringArray(raw.excludedAgentIds),
    unlinkedFallbackAgentIds: stringArray(raw.unlinkedFallbackAgentIds),
  };
}

/** Un lead nunca puede caer en un asiento desactivado: su aviso se perdería. */
async function isActiveAgent(
  userId: string,
  accountId: bigint,
): Promise<boolean> {
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        eq(users.id, userId),
        eq(users.accountId, accountId),
        eq(users.isActive, true),
      ),
    )
    .limit(1);
  return Boolean(row);
}

/** Reparto equitativo: el agente activo con menos contactos vivos. */
async function assignByReparto(
  accountId: bigint,
  config: ContactAssignmentConfig,
): Promise<string | null> {
  const agents = await db
    .select({
      id: users.id,
      contactCount: sql<number>`COALESCE(
        (SELECT COUNT(*) FROM contacts c
         WHERE c.assigned_to = ${users.id}
           AND c.account_id = ${accountId}
           AND c.is_active = true),
        0
      )`.as("contact_count"),
    })
    .from(users)
    .where(and(eq(users.accountId, accountId), eq(users.isActive, true)))
    .orderBy(sql`contact_count ASC`);

  const afterExclusions = agents.filter(
    (a) => !config.excludedAgentIds.includes(a.id),
  );

  // El pool restringe, no filtra a cero: si ninguno de los designados sigue
  // activo, es mejor un agente cualquiera que un lead sin dueño.
  const pool = config.unlinkedFallbackAgentIds;
  const inPool = pool.length
    ? afterExclusions.filter((a) => pool.includes(a.id))
    : afterExclusions;

  return (inPool[0] ?? afterExclusions[0])?.id ?? null;
}

/**
 * Devuelve el agente al que asignar el lead, o null si la cuenta no tiene
 * ninguno activo. Nunca lanza: un fallo aquí no puede costar el contacto.
 */
export async function resolveWebLeadAgent(params: {
  accountId: bigint;
  /** El anuncio que estaba mirando, si la consulta era sobre uno. */
  listingId?: bigint | null;
}): Promise<string | null> {
  const { accountId, listingId } = params;
  try {
    const config = await readConfig(accountId);

    if (config.portalLeadMode === "fixed") {
      if (
        config.fixedAgentId &&
        (await isActiveAgent(config.fixedAgentId, accountId))
      ) {
        return config.fixedAgentId;
      }
      return assignByReparto(accountId, config);
    }

    if (config.portalLeadMode === "listing_agent" && listingId) {
      const [row] = await db
        .select({ agentId: listings.agentId })
        .from(listings)
        .where(eq(listings.listingId, listingId))
        .limit(1);
      if (row?.agentId && (await isActiveAgent(row.agentId, accountId))) {
        return row.agentId;
      }
    }

    return assignByReparto(accountId, config);
  } catch (error) {
    console.error("[lead-assignment] no se pudo resolver el agente:", error);
    return null;
  }
}
