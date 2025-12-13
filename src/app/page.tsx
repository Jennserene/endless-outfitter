import { redirect } from "next/navigation";
import { ROUTES } from "@/config/paths";

/**
 * Home page.
 * Redirects to the outfitter page.
 */
export default function HomePage() {
  redirect(ROUTES.OUTFITTER);
}
