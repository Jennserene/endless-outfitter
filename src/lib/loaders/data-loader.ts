import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { ShipSchema, type Ship } from "@/lib/schemas/ship";
import { OutfitSchema, type Outfit } from "@/lib/schemas/outfit";
import { z } from "zod";

const DATA_DIR = join(process.cwd(), "public/assets/data");
const SHIPS_DIR = join(DATA_DIR, "ships");
const OUTFITS_DIR = join(DATA_DIR, "outfits");

/**
 * Metadata schema for generated data files
 */
const DataFileMetadataSchema = z.object({
  version: z.string(),
  schemaVersion: z.string(),
  species: z.string().optional(),
  generatedAt: z.string(),
  itemCount: z.number(),
});

/**
 * Schema for ships.json file structure
 */
const ShipsDataFileSchema = z.object({
  metadata: DataFileMetadataSchema,
  data: z.array(ShipSchema),
});

/**
 * Schema for outfits.json file structure
 */
const OutfitsDataFileSchema = z.object({
  metadata: DataFileMetadataSchema,
  data: z.array(OutfitSchema),
});

/**
 * Load and validate ships data from all generated JSON files (all species)
 */
export function loadShips(): Ship[] {
  const allShips: Ship[] = [];

  try {
    if (!existsSync(SHIPS_DIR)) {
      throw new Error(`Ships directory not found: ${SHIPS_DIR}`);
    }

    const files = readdirSync(SHIPS_DIR);
    const shipFiles = files.filter((f) => f.endsWith(".json"));

    if (shipFiles.length === 0) {
      throw new Error(
        `No ships data files found in ${SHIPS_DIR}. Directory contains: ${files.length === 0 ? "no files" : files.join(", ")}`
      );
    }

    for (const filename of shipFiles) {
      const filePath = join(SHIPS_DIR, filename);
      const fileContent = readFileSync(filePath, "utf-8");

      try {
        const jsonData = JSON.parse(fileContent);
        const validated = ShipsDataFileSchema.parse(jsonData);
        allShips.push(...validated.data);
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(
            `Failed to validate ${filename}: ${error.issues.map((e) => e.message).join(", ")}`
          );
        }
        if (error instanceof SyntaxError) {
          throw new Error(`Failed to parse ${filename}: ${error.message}`);
        }
        throw error;
      }
    }

    if (allShips.length === 0) {
      throw new Error(
        `No valid ships data found in ${SHIPS_DIR}. Found ${shipFiles.length} file(s) but all were empty or invalid: ${shipFiles.join(", ")}`
      );
    }

    return allShips;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to load ships: ${String(error)}`);
  }
}

/**
 * Load and validate outfits data from all generated JSON files (all species)
 */
export function loadOutfits(): Outfit[] {
  const allOutfits: Outfit[] = [];

  try {
    if (!existsSync(OUTFITS_DIR)) {
      throw new Error(`Outfits directory not found: ${OUTFITS_DIR}`);
    }

    const files = readdirSync(OUTFITS_DIR);
    const outfitFiles = files.filter((f) => f.endsWith(".json"));

    if (outfitFiles.length === 0) {
      throw new Error(
        `No outfits data files found in ${OUTFITS_DIR}. Directory contains: ${files.length === 0 ? "no files" : files.join(", ")}`
      );
    }

    for (const filename of outfitFiles) {
      const filePath = join(OUTFITS_DIR, filename);
      const fileContent = readFileSync(filePath, "utf-8");

      try {
        const jsonData = JSON.parse(fileContent);
        const validated = OutfitsDataFileSchema.parse(jsonData);
        allOutfits.push(...validated.data);
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(
            `Failed to validate ${filename}: ${error.issues.map((e) => e.message).join(", ")}`
          );
        }
        if (error instanceof SyntaxError) {
          throw new Error(`Failed to parse ${filename}: ${error.message}`);
        }
        throw error;
      }
    }

    if (allOutfits.length === 0) {
      throw new Error(
        `No valid outfits data found in ${OUTFITS_DIR}. Found ${outfitFiles.length} file(s) but all were empty or invalid: ${outfitFiles.join(", ")}`
      );
    }

    return allOutfits;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to load outfits: ${String(error)}`);
  }
}

/**
 * Get metadata from all ships.json files
 */
export function getShipsMetadata(): Array<
  z.infer<typeof DataFileMetadataSchema>
> {
  const metadata: Array<z.infer<typeof DataFileMetadataSchema>> = [];

  try {
    if (!existsSync(SHIPS_DIR)) {
      throw new Error(`Ships directory not found: ${SHIPS_DIR}`);
    }

    const files = readdirSync(SHIPS_DIR);
    const shipFiles = files.filter((f) => f.endsWith(".json"));

    for (const filename of shipFiles) {
      const filePath = join(SHIPS_DIR, filename);
      const fileContent = readFileSync(filePath, "utf-8");
      const jsonData = JSON.parse(fileContent);
      metadata.push(DataFileMetadataSchema.parse(jsonData.metadata));
    }

    return metadata;
  } catch (error) {
    throw new Error(`Failed to get ships metadata: ${String(error)}`);
  }
}

/**
 * Get metadata from all outfits.json files
 */
export function getOutfitsMetadata(): Array<
  z.infer<typeof DataFileMetadataSchema>
> {
  const metadata: Array<z.infer<typeof DataFileMetadataSchema>> = [];

  try {
    if (!existsSync(OUTFITS_DIR)) {
      throw new Error(`Outfits directory not found: ${OUTFITS_DIR}`);
    }

    const files = readdirSync(OUTFITS_DIR);
    const outfitFiles = files.filter((f) => f.endsWith(".json"));

    for (const filename of outfitFiles) {
      const filePath = join(OUTFITS_DIR, filename);
      const fileContent = readFileSync(filePath, "utf-8");
      const jsonData = JSON.parse(fileContent);
      metadata.push(DataFileMetadataSchema.parse(jsonData.metadata));
    }

    return metadata;
  } catch (error) {
    throw new Error(`Failed to get outfits metadata: ${String(error)}`);
  }
}
