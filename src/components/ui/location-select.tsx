"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export interface LocationOption {
  neighborhoodId: bigint;
  city: string;
  province: string;
  municipality: string;
  neighborhood: string;
}

interface LocationSelectProps {
  locations: LocationOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function LocationSelect({
  locations,
  value,
  onValueChange,
  placeholder = "Selecciona una ubicación...",
}: LocationSelectProps) {
  const formatLocationDisplay = (location: LocationOption) => {
    return `${location.neighborhood}, ${location.city}, ${location.province}`;
  };

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {locations.map((location) => (
          <SelectItem
            key={location.neighborhoodId.toString()}
            value={location.neighborhoodId.toString()}
          >
            {formatLocationDisplay(location)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
