"use client";

import { usePathname } from "next/navigation";
import { Navigation } from "./navigation";
import { ShipManagerButtons } from "./ship-manager-buttons";
import type { Ship as ShipType } from "@/lib/schemas/ship";

interface HeaderContentProps {
  ships: ShipType[];
}

/**
 * Client component for Header that conditionally shows ShipManagerButtons
 * on the outfitter page.
 */
export function HeaderContent({ ships }: HeaderContentProps) {
  const pathname = usePathname();
  const isOutfitterPage = pathname === "/outfitter";

  return (
    <header className="border-b w-full py-4 px-4 flex items-center justify-between gap-2">
      <Navigation />
      {isOutfitterPage ? (
        <ShipManagerButtons ships={ships} />
      ) : (
        <div className="h-9" />
      )}
    </header>
  );
}
