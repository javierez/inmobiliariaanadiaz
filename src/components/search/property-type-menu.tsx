"use client";

import { Fragment } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";
import {
  PROPERTY_TYPE_LABEL,
  subtypeKey,
  type PropertyType,
  type SubtypeOption,
} from "~/lib/search-utils";

type SearchType = Exclude<PropertyType, "any">;

/** Etiqueta de un tipo del buscador. La misma para todas las cuentas. */
export function searchTypeLabel(type: string): string {
  return (
    PROPERTY_TYPE_LABEL[type as SearchType] ??
    type.charAt(0).toUpperCase() + type.slice(1)
  );
}

/** Subtipos que se ofrecen bajo un tipo: solo si hay al menos dos. */
function subtypesFor(type: string, options: SubtypeOption[]): SubtypeOption[] {
  const list = options.filter((o) => o.type === type);
  return list.length >= 2 ? list : [];
}

/** Texto del botón: "Piso", "Ático", "Piso (2)", "3 tipos"… */
export function propertyTypeSummary(
  selectedTypes: readonly string[],
  selectedSubtypes: readonly string[],
  options: SubtypeOption[],
  placeholder: string,
): string {
  if (selectedTypes.length === 0) return placeholder;
  if (selectedTypes.length > 1) return `${selectedTypes.length} tipos`;
  const type = selectedTypes[0]!;
  const chosen = options.filter(
    (o) =>
      o.type === type && selectedSubtypes.includes(subtypeKey(o.type, o.slug)),
  );
  if (chosen.length === 1) return chosen[0]!.label;
  if (chosen.length > 1) return `${searchTypeLabel(type)} (${chosen.length})`;
  return searchTypeLabel(type);
}

interface PropertyTypeMenuProps {
  id?: string;
  types: readonly string[];
  selectedTypes: SearchType[];
  onToggleType: (type: SearchType, checked: boolean) => void;
  subtypeOptions: SubtypeOption[];
  selectedSubtypes: string[];
  onToggleSubtype: (key: string, checked: boolean) => void;
  placeholder: string;
}

/**
 * Selector de tipo del buscador, compartido por el formulario de la home y la
 * barra de resultados. Al marcar un tipo aparecen debajo sus subtipos (Ático,
 * Dúplex, Chalet…); sin ninguno marcado, cuenta el tipo entero.
 */
export function PropertyTypeMenu({
  id,
  types,
  selectedTypes,
  onToggleType,
  subtypeOptions,
  selectedSubtypes,
  onToggleSubtype,
  placeholder,
}: PropertyTypeMenuProps) {
  const summary = propertyTypeSummary(
    selectedTypes,
    selectedSubtypes,
    subtypeOptions,
    placeholder,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className="flex h-10 w-full items-center justify-between px-3 font-normal"
        >
          <span
            className={cn(
              "truncate",
              selectedTypes.length === 0 && "text-muted-foreground",
            )}
          >
            {summary}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="max-h-80 w-[var(--radix-dropdown-menu-trigger-width)] min-w-48 overflow-y-auto"
        align="start"
      >
        {types.map((type) => {
          const value = type as SearchType;
          const checked = selectedTypes.includes(value);
          const subtypes = checked ? subtypesFor(value, subtypeOptions) : [];
          return (
            <Fragment key={type}>
              <DropdownMenuCheckboxItem
                checked={checked}
                onCheckedChange={(c) => onToggleType(value, c === true)}
                onSelect={(e) => e.preventDefault()}
              >
                {searchTypeLabel(type)}
              </DropdownMenuCheckboxItem>
              {subtypes.map((option) => {
                const key = subtypeKey(option.type, option.slug);
                return (
                  <DropdownMenuCheckboxItem
                    key={key}
                    className="pl-12 [&>span:first-child]:left-6"
                    checked={selectedSubtypes.includes(key)}
                    onCheckedChange={(c) => onToggleSubtype(key, c === true)}
                    onSelect={(e) => e.preventDefault()}
                  >
                    {option.label}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
