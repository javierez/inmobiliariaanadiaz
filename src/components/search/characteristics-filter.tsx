"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Checkbox } from "~/components/ui/checkbox";
import { CONDITION_FILTERS, EQUIPMENT_FILTERS } from "~/lib/search-utils";

interface CharacteristicsFilterProps {
  selected: string[];
  onToggle: (key: string, checked: boolean) => void;
  /** Abierto al cargar (la barra de resultados lo abre si ya hay alguna). */
  defaultOpen?: boolean;
}

/**
 * Características (ascensor, garaje, trastero…) y estado del inmueble.
 *
 * Compartido por la home y la barra de resultados. Antes vivía solo en la home,
 * detrás de un botón redondo sin texto, y la barra de resultados no tenía cómo
 * añadir ni quitar ninguna: arrastraba las de la home sin enseñarlas.
 */
export function CharacteristicsFilter({
  selected,
  onToggle,
  defaultOpen = false,
}: CharacteristicsFilterProps) {
  const [open, setOpen] = useState(defaultOpen);

  const grid = (items: typeof EQUIPMENT_FILTERS) => (
    <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {items.map((item) => (
        <label
          key={item.key}
          className="flex cursor-pointer items-center gap-2 text-sm"
        >
          <Checkbox
            checked={selected.includes(item.key)}
            onCheckedChange={(checked) => onToggle(item.key, checked === true)}
          />
          {item.label}
        </label>
      ))}
    </div>
  );

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1 text-sm font-medium text-foreground underline-offset-4 hover:underline"
      >
        Características
        {selected.length > 0 && ` (${selected.length})`}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="mt-3 w-full space-y-4">
          {grid(EQUIPMENT_FILTERS)}

          {/* El estado del inmueble no es un equipamiento: va aparte para que
              "Acondicionado" no se lea como "Aire acondicionado". */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Estado del inmueble
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>
          {grid(CONDITION_FILTERS)}
        </div>
      )}
    </div>
  );
}
