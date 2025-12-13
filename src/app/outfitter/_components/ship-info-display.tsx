"use client";

import { Span } from "@/components/ui/typography";
import { SectionDivider } from "@/components/ui/section-divider";
import { ShipImage } from "@/components/ships/ship-image";
import { Ship } from "@/lib/models/ship";
import { COST_STAT } from "@/lib/config/ship-stats";
import { renderStatIfDefined } from "@/lib/utils/ship-stats";
import { Accordion } from "@/components/ui/accordion";
import { CapacityAccordionItem } from "./ship-accordion/capacity-accordion-item";
import { ShieldsAccordionItem } from "./ship-accordion/shields-accordion-item";
import { HullAccordionItem } from "./ship-accordion/hull-accordion-item";
import { MassAccordionItem } from "./ship-accordion/mass-accordion-item";
import { CargoAccordionItem } from "./ship-accordion/cargo-accordion-item";
import { FuelAccordionItem } from "./ship-accordion/fuel-accordion-item";
import { CrewAccordionItem } from "./ship-accordion/crew-accordion-item";
import { MovementAccordionItem } from "./ship-accordion/movement-accordion-item";

interface ShipInfoDisplayProps {
  ship: Ship | null;
}

export function ShipInfoDisplay({ ship }: ShipInfoDisplayProps) {
  if (!ship) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No ship selected
      </div>
    );
  }

  const attrs = ship.outfittedAttributes;

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto">
      {/* Ship Image */}
      <ShipImage
        shipName={ship.shipData.name}
        thumbnail={ship.shipData.thumbnail}
      />

      {/* Ship Header */}
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <Span variant="muted">model:</Span>
          <Span variant="medium">{ship.shipData.name}</Span>
        </div>
        {attrs.category && (
          <div className="flex justify-between">
            <Span variant="muted">category:</Span>
            <Span variant="medium">{attrs.category}</Span>
          </div>
        )}
      </div>

      {/* Ship Cost */}
      {attrs.cost !== undefined && (
        <div className="space-y-1 text-sm">
          {renderStatIfDefined(COST_STAT, attrs)}
        </div>
      )}

      <SectionDivider />

      {/* Ship Stats */}
      <Accordion type="multiple" className="w-full">
        <ShieldsAccordionItem ship={ship} />
        <HullAccordionItem ship={ship} />
        <MassAccordionItem ship={ship} />
        <CargoAccordionItem ship={ship} />
        <FuelAccordionItem ship={ship} />
        <CrewAccordionItem ship={ship} />
      </Accordion>

      {/* Movement Stats */}
      {attrs.drag !== undefined && (
        <>
          <SectionDivider />
          <MovementAccordionItem ship={ship} />
        </>
      )}

      {/* Outfit Space */}
      {(() => {
        const outfitSpace = ship.getOutfitSpace();
        const weaponCapacity = ship.getWeaponCapacity();
        const engineCapacity = ship.getEngineCapacity();
        const gunPorts = ship.getGunPorts();
        const turretMounts = ship.getTurretMounts();

        const hasAnyCapacity =
          outfitSpace !== undefined ||
          weaponCapacity !== undefined ||
          engineCapacity !== undefined ||
          gunPorts !== undefined ||
          turretMounts !== undefined;

        if (!hasAnyCapacity) return null;

        const outfitSpaceUsage = ship.getOutfitSpaceUsage();
        const weaponCapacityUsage = ship.getWeaponCapacityUsage();
        const engineCapacityUsage = ship.getEngineCapacityUsage();
        const gunPortsUsage = ship.getGunPortsUsage();
        const turretMountsUsage = ship.getTurretMountsUsage();

        return (
          <>
            <SectionDivider />
            <Accordion type="multiple" className="w-full">
              {outfitSpace && (
                <CapacityAccordionItem
                  value="outfit-space"
                  label="outfit space free"
                  stats={`${outfitSpace.free} / ${outfitSpace.total}`}
                  usage={outfitSpaceUsage.map(
                    ({ outfit, quantity, space }) => ({
                      name: outfit.name,
                      slug: outfit.slug,
                      quantity,
                      value: space,
                    })
                  )}
                  emptyMessage="No outfits affecting outfit space"
                />
              )}

              {weaponCapacity && (
                <CapacityAccordionItem
                  value="weapon-capacity"
                  label="weapon capacity"
                  stats={`${weaponCapacity.free} / ${weaponCapacity.total}`}
                  className="pl-4"
                  usage={weaponCapacityUsage.map(
                    ({ outfit, quantity, capacity }) => ({
                      name: outfit.name,
                      slug: outfit.slug,
                      quantity,
                      value: capacity,
                    })
                  )}
                  emptyMessage="No outfits affecting weapon capacity"
                />
              )}

              {engineCapacity && (
                <CapacityAccordionItem
                  value="engine-capacity"
                  label="engine capacity"
                  stats={`${engineCapacity.free} / ${engineCapacity.total}`}
                  className="pl-4"
                  usage={engineCapacityUsage.map(
                    ({ outfit, quantity, capacity }) => ({
                      name: outfit.name,
                      slug: outfit.slug,
                      quantity,
                      value: capacity,
                    })
                  )}
                  emptyMessage="No outfits affecting engine capacity"
                />
              )}

              {gunPorts && (
                <CapacityAccordionItem
                  value="gun-ports"
                  label="gun ports free"
                  stats={`${gunPorts.free} / ${gunPorts.total}`}
                  usage={gunPortsUsage.map(({ outfit, quantity, ports }) => ({
                    name: outfit.name,
                    slug: outfit.slug,
                    quantity,
                    value: ports,
                  }))}
                  emptyMessage="No outfits affecting gun ports"
                  showEach={false}
                />
              )}

              {turretMounts && (
                <CapacityAccordionItem
                  value="turret-mounts"
                  label="turret mounts free"
                  stats={`${turretMounts.free} / ${turretMounts.total}`}
                  usage={turretMountsUsage.map(
                    ({ outfit, quantity, mounts }) => ({
                      name: outfit.name,
                      slug: outfit.slug,
                      quantity,
                      value: mounts,
                    })
                  )}
                  emptyMessage="No outfits affecting turret mounts"
                  showEach={false}
                />
              )}
            </Accordion>
          </>
        );
      })()}

      {/* Outfits List */}
      {ship.getOutfits().length > 0 &&
        (() => {
          // Group outfits by name and count them
          const outfitCounts = new Map<string, number>();
          for (const outfit of ship.getOutfits()) {
            const count = outfitCounts.get(outfit.name) || 0;
            outfitCounts.set(outfit.name, count + 1);
          }

          // Convert to array and sort by name
          const groupedOutfits = Array.from(outfitCounts.entries()).sort(
            ([nameA], [nameB]) => nameA.localeCompare(nameB)
          );

          return (
            <>
              <SectionDivider />
              <div className="space-y-2 text-sm">
                <div className="font-medium text-base">Outfits:</div>
                <div className="space-y-1 pl-2">
                  {groupedOutfits.map(([name, count]) => (
                    <div key={name} className="flex justify-between">
                      <Span>
                        {name}
                        {count > 1 && (
                          <span className="text-muted-foreground">
                            {" "}
                            x{count}
                          </span>
                        )}
                      </Span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          );
        })()}
    </div>
  );
}
