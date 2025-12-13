"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { ROUTES } from "@/config/paths";
import { cn } from "@/lib/utils";

/**
 * Navigation component containing only the navigation links (Outfitter and Search).
 * Uses shadcn/ui NavigationMenu component with Next.js Link for client-side navigation.
 */
export function Navigation() {
  const pathname = usePathname();

  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href={ROUTES.OUTFITTER}
              data-active={pathname === ROUTES.OUTFITTER}
              className={cn(
                pathname === ROUTES.OUTFITTER &&
                  "bg-accent/50 text-accent-foreground"
              )}
            >
              Outfitter
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href={ROUTES.SEARCH}
              data-active={pathname === ROUTES.SEARCH}
              className={cn(
                pathname === ROUTES.SEARCH &&
                  "bg-accent/50 text-accent-foreground"
              )}
            >
              Search
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
