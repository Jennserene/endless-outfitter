"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/paths";

/**
 * Navigation component for site-wide navigation.
 * Uses shadcn/ui Button component with Next.js Link for client-side navigation.
 */
export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-2">
          <Button
            asChild
            variant={pathname === ROUTES.OUTFITTING ? "default" : "ghost"}
          >
            <Link href={ROUTES.OUTFITTING}>Outfitting</Link>
          </Button>
          <Button
            asChild
            variant={pathname === ROUTES.SEARCH ? "default" : "ghost"}
          >
            <Link href={ROUTES.SEARCH}>Search</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
