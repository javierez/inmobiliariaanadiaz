/**
 * Habitaciones / estancias: qué tipos las tienen y cómo se llaman.
 *
 * Fuente única para las tarjetas (lista, mapa, ficha relacionada) y para el
 * filtro del buscador. Antes cada tarjeta llevaba su propia lista de tipos sin
 * habitaciones y el mapa llamaba "Habs" a las estancias de un local que la
 * lista llamaba "Ests".
 *
 * Una nave se guarda casi siempre como `local` + subtipo "Nave industrial"
 * (muy pocas como `industrial`), así que el subtipo también cuenta.
 *
 * Pure + client-safe.
 */

/** Tipos (de propiedad y del buscador) en los que no hay habitaciones. */
const ROOMLESS_TYPES = new Set([
  "solar",
  "garaje",
  "edificio",
  "oficina",
  "industrial",
  "trastero",
  // Pseudo-tipo del buscador: solar con subtipo industrial.
  "terreno-industrial",
]);

export function isNave(
  propertyType?: string | null,
  propertySubtype?: string | null,
): boolean {
  const type = propertyType?.toLowerCase() ?? "";
  if (type === "industrial") return true;
  return type === "local" && /nave/i.test(propertySubtype ?? "");
}

/** ¿Tiene sentido enseñar habitaciones/baños para este inmueble? */
export function showsRooms(
  propertyType?: string | null,
  propertySubtype?: string | null,
): boolean {
  const type = propertyType?.toLowerCase() ?? "";
  if (ROOMLESS_TYPES.has(type)) return false;
  return !isNave(type, propertySubtype);
}

/** Un local cuenta estancias; una vivienda, habitaciones. */
export function usesEstancias(propertyType?: string | null): boolean {
  return propertyType?.toLowerCase() === "local";
}

/** Abreviatura de tarjeta: "1 Hab" / "3 Habs" / "1 Est" / "3 Ests". */
export function roomsShortLabel(
  count: number,
  propertyType?: string | null,
): string {
  const [one, many] = usesEstancias(propertyType)
    ? ["Est", "Ests"]
    : ["Hab", "Habs"];
  return count === 1 ? one : many;
}

/** Palabra completa, para frases: "3 habitaciones" / "2 estancias". */
export function roomsWord(propertyType?: string | null): string {
  return usesEstancias(propertyType) ? "estancias" : "habitaciones";
}

/** Palabra que acompaña al número: "habitación", "habitaciones", "estancias". */
export function roomsNoun(count: number, propertyType?: string | null): string {
  if (usesEstancias(propertyType)) {
    return count === 1 ? "estancia" : "estancias";
  }
  return count === 1 ? "habitación" : "habitaciones";
}

/** Frase completa: "1 habitación", "3 habitaciones", "2 estancias". */
export function roomsPhrase(
  count: number,
  propertyType?: string | null,
): string {
  return `${count} ${roomsNoun(count, propertyType)}`;
}

/**
 * ¿Aplica el filtro de habitaciones/baños a esta selección de tipos del
 * buscador? Sin tipo elegido, sí. Si todos los elegidos son tipos sin
 * habitaciones (garaje, terreno, nave…), no: `bedrooms >= N` los vaciaría.
 */
export function selectionHasRooms(types: readonly string[]): boolean {
  if (types.length === 0) return true;
  return types.some((t) => !ROOMLESS_TYPES.has(t.toLowerCase()));
}

/**
 * Etiqueta del filtro de habitaciones según los tipos elegidos: "Estancias" si
 * solo se buscan locales, "Habitaciones / estancias" si hay locales mezclados
 * con viviendas, "Habitaciones" en el resto.
 */
export function roomsFilterLabel(types: readonly string[]): string {
  const withRooms = types.filter((t) => !ROOMLESS_TYPES.has(t.toLowerCase()));
  const hasLocal = withRooms.some((t) => usesEstancias(t));
  if (!hasLocal) return "Habitaciones";
  return withRooms.every((t) => usesEstancias(t))
    ? "Estancias"
    : "Habitaciones / estancias";
}
