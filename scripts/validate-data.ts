import { logger } from "@/lib/logger";
import { loadShips, loadOutfits } from "@/lib/loaders/data-loader";
import { validateDataDirectories } from "./utils/directories";
import { handleScriptError } from "./utils/error-handling";

/**
 * Validate ships data
 */
function validateShips(): void {
  logger.info("Validating ships.json...");
  const ships = loadShips();
  logger.success(`Validated ${ships.length} ships`);
}

/**
 * Validate outfits data
 */
function validateOutfits(): void {
  logger.info("Validating outfits.json...");
  const outfits = loadOutfits();
  logger.success(`Validated ${outfits.length} outfits`);
}

/**
 * Main function
 */
function main(): void {
  try {
    logger.info("Starting data validation...\n");

    // Check files exist
    validateDataDirectories();

    // Validate data
    validateShips();
    validateOutfits();

    logger.success("Data validation completed successfully!");
  } catch (error) {
    handleScriptError(error, "Data validation");
  }
}

main();
