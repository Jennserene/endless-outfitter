import Image from "next/image";
import { Heading2 } from "@/components/ui/typography";

interface ShipImageProps {
  shipName: string;
  thumbnail?: string;
  frameImage?: string;
}

export function ShipImage({
  shipName,
  thumbnail,
  frameImage = "/assets/images/ui/shipyard-selected.png",
}: ShipImageProps) {
  // Convert thumbnail path (e.g., "thumbnail/kestrel") to image path (e.g., "/assets/images/thumbnail/kestrel.png")
  const thumbnailImagePath = thumbnail
    ? `/assets/images/${thumbnail}.png`
    : null;

  return (
    <div className="relative flex flex-col items-center gap-2">
      <div className="relative w-full max-w-[200px] aspect-square">
        <Image
          src={frameImage}
          alt=""
          fill
          sizes="200px"
          className="object-contain"
          priority
        />
        {thumbnailImagePath && (
          <div className="absolute inset-0 flex items-center justify-center pt-2">
            <div className="relative w-[150px] h-[150px]">
              <Image
                src={thumbnailImagePath}
                alt={shipName}
                fill
                sizes="150px"
                className="object-contain"
              />
            </div>
          </div>
        )}
      </div>
      <Heading2 className="text-center">{shipName}</Heading2>
    </div>
  );
}
