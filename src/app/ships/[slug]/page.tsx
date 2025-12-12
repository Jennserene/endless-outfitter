import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getShipBySlug } from "@/lib/game-data";
import { ShipDetail } from "./_components/ship-detail";

interface ShipPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: ShipPageProps): Promise<Metadata> {
  const ship = getShipBySlug(params.slug);

  if (!ship) {
    return {
      title: "Ship Not Found",
    };
  }

  return {
    title: `${ship.name} - Endless Outfitter`,
    description: ship.descriptions[0] || `Details for ${ship.name}`,
  };
}

export default function ShipPage({ params }: ShipPageProps) {
  const ship = getShipBySlug(params.slug);

  if (!ship) {
    notFound();
  }

  return <ShipDetail ship={ship} />;
}
