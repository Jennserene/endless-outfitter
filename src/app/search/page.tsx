import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search - Endless Outfitter",
  description: "Search for ships, outfits, and other game data",
};

/**
 * Search page for data pages.
 *
 * This is a Server Component (default in Next.js App Router).
 * This page will eventually allow users to:
 * - Search for ships, outfits, and other game data
 * - Filter results by various criteria
 * - View detailed information about search results
 */
export default function SearchPage({
  searchParams,
}: {
  searchParams: { query?: string; type?: string };
}) {
  const query = searchParams.query || "";
  const type = searchParams.type || "all";

  return (
    <div className="container mx-auto px-4 py-8">
      <main>
        <h1 className="text-3xl font-bold mb-4">Search</h1>
        <p className="text-muted-foreground mb-4">
          Search for ships, outfits, and other game data. This functionality
          will be implemented soon.
        </p>
        {query && (
          <p className="text-sm text-muted-foreground">
            Search query: {query} (type: {type})
          </p>
        )}
      </main>
    </div>
  );
}
