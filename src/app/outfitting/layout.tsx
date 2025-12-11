import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ship Outfitting",
  description: "Modify and configure ship outfits for Endless Sky",
};

/**
 * Layout for the outfitting route.
 * Allows for outfitting-specific UI customization if needed in the future.
 */
export default function OutfittingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
