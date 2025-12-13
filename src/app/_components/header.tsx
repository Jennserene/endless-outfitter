import { HeaderContent } from "./header-content";
import { getShips } from "@/lib/game-data";

/**
 * Header component that contains the site navigation and ship manager buttons.
 * Server component that fetches ships data and passes to client component.
 */
export function Header() {
  const ships = getShips();

  return <HeaderContent ships={ships} />;
}
