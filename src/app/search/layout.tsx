import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description: "Search for ships, outfits, and other game data",
};

/**
 * Layout for the search route.
 * Allows for search-specific UI customization if needed in the future.
 */
export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
