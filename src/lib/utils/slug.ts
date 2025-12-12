/**
 * Generate a URL-friendly slug from a name string.
 * Converts to lowercase, replaces spaces with hyphens, and removes special characters.
 *
 * This utility is used for creating URL-friendly slugs from item names.
 * The search index already contains slugs, but this may be needed for detail page lookups.
 *
 * @param name - The name to convert to a slug
 * @returns URL-friendly slug string
 */
export function slugify(name: string): string {
  if (!name || typeof name !== "string") {
    return "";
  }

  return (
    name
      .toLowerCase()
      .trim()
      // Replace multiple spaces with a single space
      .replace(/\s+/g, " ")
      // Replace spaces with hyphens
      .replace(/\s/g, "-")
      // Remove special characters except hyphens
      .replace(/[^a-z0-9-]/g, "")
      // Replace multiple consecutive hyphens with a single hyphen
      .replace(/-+/g, "-")
      // Remove leading and trailing hyphens
      .replace(/^-+|-+$/g, "")
  );
}
