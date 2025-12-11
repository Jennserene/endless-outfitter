import { redirect } from "next/navigation";
import { ROUTES } from "@/config/paths";

/**
 * Home page.
 * Redirects to the outfitting page.
 */
export default function HomePage() {
  redirect(ROUTES.OUTFITTING);
}
