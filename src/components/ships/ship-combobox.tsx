"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import Fuse from "fuse.js";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useOutfitter } from "@/stores/outfitter";
import type { Ship as ShipType } from "@/lib/schemas/ship";
import { Ship } from "@/lib/models/ship";

interface ShipComboBoxProps {
  ships: ShipType[];
}

export function ShipComboBox({ ships }: ShipComboBoxProps) {
  const [open, setOpen] = React.useState(false);
  const { state, setSelectedShip } = useOutfitter();
  const selectedShip = state.selectedShip;

  // Helper to get ship slug for comparison
  const getSelectedShipSlug = React.useCallback((): string | undefined => {
    if (!selectedShip) return undefined;
    if (selectedShip instanceof Ship) {
      return selectedShip.shipData.slug;
    }
    // TypeScript should now know this is ShipType
    return (selectedShip as ShipType).slug;
  }, [selectedShip]);

  // Helper to get ship name for display
  const getSelectedShipName = React.useCallback((): string => {
    if (!selectedShip) return "Select a ship...";
    if (selectedShip instanceof Ship) {
      return selectedShip.shipData.name;
    }
    // TypeScript should now know this is ShipType
    return (selectedShip as ShipType).name;
  }, [selectedShip]);

  // Filter ships (ready for future filtering by species and category)
  // For now, we'll use all ships, but this can be extended
  const filteredShips = React.useMemo(() => {
    // TODO: Add filtering by species and category here
    // Example structure:
    // if (selectedSpecies) {
    //   return ships.filter(ship => ship.species === selectedSpecies);
    // }
    // if (selectedCategory) {
    //   return ships.filter(ship => ship.attributes.category === selectedCategory);
    // }
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

  const [searchQuery, setSearchQuery] = React.useState("");
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

  const handleSelect = (ship: ShipType | null) => {
    // setSelectedShip is async but we don't need to wait for it
    // The state will update when outfits are loaded
    void setSelectedShip(ship);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {getSelectedShipName()}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search ships..."
            className="h-9"
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No ship found.</CommandEmpty>
            <CommandGroup>
              {displayedShips.map((ship) => (
                <CommandItem
                  key={ship.slug}
                  value={ship.slug}
                  onSelect={() => {
                    const selectedSlug = getSelectedShipSlug();
                    handleSelect(selectedSlug === ship.slug ? null : ship);
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
                        getSelectedShipSlug() === ship.slug
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
