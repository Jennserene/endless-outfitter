"use client";

import * as React from "react";
import { Check } from "lucide-react";
import Fuse from "fuse.js";

import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useOutfitter } from "@/stores/outfitter";
import type { Ship as ShipType } from "@/lib/schemas/ship";
import { Ship } from "@/lib/models/ship";

interface ShipSelectionContentProps {
  ships: ShipType[];
  onSelect: (ship: ShipType | null) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

/**
 * ShipSelectionContent - The dropdown content for ship selection.
 * Extracted from ShipComboBox for reuse in different contexts.
 */
export function ShipSelectionContent({
  ships,
  onSelect,
  searchQuery,
  onSearchQueryChange,
}: ShipSelectionContentProps) {
  const { state } = useOutfitter();
  const selectedShip = state.selectedShip;

  // Helper to get ship slug for comparison
  const getSelectedShipSlug = React.useCallback((): string | undefined => {
    if (!selectedShip) return undefined;
    if (selectedShip instanceof Ship) {
      return selectedShip.shipData.slug;
    }
    return (selectedShip as ShipType).slug;
  }, [selectedShip]);

  // Filter ships (ready for future filtering by species and category)
  const filteredShips = React.useMemo(() => {
    return ships;
  }, [ships]);

  // Create Fuse instance for fuzzy search
  const fuse = React.useMemo(
    () =>
      new Fuse<ShipType>(filteredShips, {
        keys: ["name"],
        threshold: 0.4,
        includeScore: true,
        minMatchCharLength: 2,
      }),
    [filteredShips]
  );

  // Search function using Fuse
  const searchShips = React.useCallback(
    (query: string): ShipType[] => {
      if (!query || query.trim().length === 0) {
        return filteredShips;
      }

      const results = fuse.search(query);
      return results.map((result) => result.item);
    },
    [fuse, filteredShips]
  );

  const [displayedShips, setDisplayedShips] =
    React.useState<ShipType[]>(filteredShips);

  // Update displayed ships when search query changes
  React.useEffect(() => {
    const results = searchShips(searchQuery);
    setDisplayedShips(results);
  }, [searchQuery, searchShips]);

  // Update displayed ships when filtered ships change
  React.useEffect(() => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setDisplayedShips(filteredShips);
    }
  }, [filteredShips, searchQuery]);

  return (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder="Search ships..."
        className="h-9"
        value={searchQuery}
        onValueChange={onSearchQueryChange}
      />
      <CommandList>
        <CommandEmpty>No ship found.</CommandEmpty>
        <CommandGroup>
          {displayedShips.map((ship) => {
            const selectedSlug = getSelectedShipSlug();
            return (
              <CommandItem
                key={ship.slug}
                value={ship.slug}
                onSelect={() => {
                  onSelect(selectedSlug === ship.slug ? null : ship);
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col">
                    <span>{ship.name}</span>
                    {ship.attributes.category && (
                      <span className="text-xs text-muted-foreground">
                        {ship.attributes.category}
                      </span>
                    )}
                  </div>
                  <Check
                    className={cn(
                      "ml-2 h-4 w-4 shrink-0",
                      selectedSlug === ship.slug ? "opacity-100" : "opacity-0"
                    )}
                  />
                </div>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
