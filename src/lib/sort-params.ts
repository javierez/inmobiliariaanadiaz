/**
 * Regla única para meter (o no) `?sort=` en una URL del listado.
 *
 * El parámetro solo viaja cuando difiere del orden inicial de la cuenta, así
 * que la URL canónica sigue siendo la limpia para quien no cambia nada. Antes
 * cada componente comparaba contra el literal `"default"`, lo que en una cuenta
 * con otro orden configurado hacía imposible volver a "Destacados primero": el
 * enlace omitía el parámetro y la página caía otra vez en el orden de la
 * agencia.
 */
export function applySortParam(
  params: URLSearchParams,
  sort: string,
  defaultSort: string,
): void {
  if (sort !== defaultSort) params.set("sort", sort);
}
