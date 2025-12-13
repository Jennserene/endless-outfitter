import { OutfitterLayoutContent } from "./_components/outfitter-layout-content";

/**
 * Layout for the outfitter route.
 * Includes the ship information panel that is always visible.
 * Responsive: panel on top for small screens, on right for larger screens.
 */
export default function OutfitterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OutfitterLayoutContent>{children}</OutfitterLayoutContent>;
}
