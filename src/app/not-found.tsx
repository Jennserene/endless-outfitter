import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/paths";

/**
 * Global 404 page.
 * Displays when a route is not found.
 */
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-muted-foreground mb-4">Page not found</p>
      <Button asChild>
        <Link href={ROUTES.OUTFITTING}>Go to Outfitting</Link>
      </Button>
    </div>
  );
}
