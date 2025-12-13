"use client";

import * as React from "react";
import { Save, Upload, ChevronsUpDown, Settings } from "lucide-react";

import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverAnchor,
} from "@/components/ui/popover";
import { ShipSelectionContent } from "@/components/ships/ship-selection-content";
import { ThemeSelector } from "./theme-selector";
import { useOutfitter } from "@/stores/outfitter";
import type { Ship as ShipType } from "@/lib/schemas/ship";
import { Ship } from "@/lib/models/ship";

interface ShipManagerButtonsProps {
  ships: ShipType[];
}

/**
 * ShipManagerButtons - ButtonGroup for ship management actions.
 * Contains Ship Selection, Save, Load, and Settings buttons.
 * Settings button opens a popover with ThemeSelector.
 */
export function ShipManagerButtons({ ships }: ShipManagerButtonsProps) {
  const [shipPopoverOpen, setShipPopoverOpen] = React.useState(false);
  const [settingsPopoverOpen, setSettingsPopoverOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const { state, setSelectedShip } = useOutfitter();
  const selectedShip = state.selectedShip;
  const buttonGroupRef = React.useRef<HTMLDivElement>(null);

  // Helper to get ship name for display
  const getSelectedShipName = React.useCallback((): string => {
    if (!selectedShip) return "Select a ship...";
    if (selectedShip instanceof Ship) {
      return selectedShip.shipData.name;
    }
    return (selectedShip as ShipType).name;
  }, [selectedShip]);

  const handleSelect = (ship: ShipType | null) => {
    void setSelectedShip(ship);
    setShipPopoverOpen(false);
    setSearchQuery("");
  };

  const handleSaveClick = () => {
    // Unimplemented - placeholder
    console.log("Save ship outfit - not yet implemented");
  };

  const handleLoadClick = () => {
    // Unimplemented - placeholder
    console.log("Load ship outfit - not yet implemented");
  };

  return (
    <div className="flex items-center gap-0">
      <Popover open={shipPopoverOpen} onOpenChange={setShipPopoverOpen}>
        <PopoverAnchor asChild>
          <div ref={buttonGroupRef} className="flex-1">
            <ButtonGroup className="w-full">
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={shipPopoverOpen}
                  className="flex-1 justify-between"
                >
                  {getSelectedShipName()}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <Button
                variant="outline"
                onClick={handleSaveClick}
                disabled={!selectedShip}
                title={
                  !selectedShip
                    ? "Select a ship first"
                    : "Save ship outfit (not yet implemented)"
                }
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={handleLoadClick}
                title="Load ship outfit (not yet implemented)"
              >
                <Upload className="h-4 w-4" />
              </Button>
            </ButtonGroup>
          </div>
        </PopoverAnchor>
        <PopoverContent
          className="w-[var(--radix-popover-anchor-width)] p-0"
          align="start"
          side="bottom"
        >
          <ShipSelectionContent
            ships={ships}
            onSelect={handleSelect}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
          />
        </PopoverContent>
      </Popover>
      <Popover open={settingsPopoverOpen} onOpenChange={setSettingsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            aria-expanded={settingsPopoverOpen}
            title="Settings"
            className="rounded-l-none -ml-px"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" side="bottom">
          <div className="p-2">
            <ThemeSelector />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
