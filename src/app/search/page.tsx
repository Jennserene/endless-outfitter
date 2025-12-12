import type { Metadata } from "next";
import { searchGameData } from "@/lib/utils/search";
import { SearchResultsClient } from "./_components/search-results";

export const metadata: Metadata = {
  title: "Search - Endless Outfitter",
  description: "Search for ships, outfits, and other game data",
};

/**
 * Search page for data pages.
 *
 * This is a Server Component (default in Next.js App Router).
 * It performs server-side search using the search index and Fuse.js.
 */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.query || "";
  const results = query ? searchGameData(query) : { ships: [], outfits: [] };

  return (
    <main className="w-full py-8">
      <h1 className="text-3xl font-bold mb-4">Search</h1>
      <p className="text-muted-foreground mb-6">
        Search for ships, outfits, and other game data by name.
      </p>
      <SearchResultsClient initialQuery={query} initialResults={results} />
    </main>
  );
}
