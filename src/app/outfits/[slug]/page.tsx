import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getOutfitBySlug } from "@/lib/game-data";
import { OutfitDetail } from "./_components/outfit-detail";

interface OutfitPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: OutfitPageProps): Promise<Metadata> {
  const outfit = getOutfitBySlug(params.slug);

  if (!outfit) {
    return {
      title: "Outfit Not Found",
    };
  }

  return {
    title: `${outfit.name} - Endless Outfitter`,
    description: outfit.descriptions[0] || `Details for ${outfit.name}`,
  };
}

export default function OutfitPage({ params }: OutfitPageProps) {
  const outfit = getOutfitBySlug(params.slug);

  if (!outfit) {
    notFound();
  }

  return <OutfitDetail outfit={outfit} />;
}
