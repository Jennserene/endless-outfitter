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
import { ThemeSelector } from "./theme-selector";
import { cn } from "@/lib/utils";

/**
 * Navigation component for site-wide navigation.
 * Uses shadcn/ui NavigationMenu component with Next.js Link for client-side navigation.
 */
export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b w-full py-4 flex items-center justify-between gap-2">
      <NavigationMenu viewport={false}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link
                href={ROUTES.OUTFITTING}
                data-active={pathname === ROUTES.OUTFITTING}
                className={cn(
                  pathname === ROUTES.OUTFITTING &&
                    "bg-accent/50 text-accent-foreground"
                )}
              >
                Outfitting
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
      <ThemeSelector />
    </nav>
  );
}
