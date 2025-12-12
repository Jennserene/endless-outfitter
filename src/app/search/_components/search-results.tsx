"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { SearchIndexItem } from "@/lib/types/search-index";
import type { SearchResults } from "@/lib/utils/search";

interface SearchResultsClientProps {
  initialQuery: string;
  initialResults: SearchResults;
}

export function SearchResultsClient({
  initialQuery,
  initialResults,
}: SearchResultsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (newQuery.trim()) {
        params.set("query", newQuery.trim());
      } else {
        params.delete("query");
      }
      router.push(`/search?${params.toString()}`);
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = (formData.get("search") as string) || "";
    handleSearch(searchValue);
  };

  const hasResults =
    initialResults.ships.length > 0 || initialResults.outfits.length > 0;
  const hasQuery = query.trim().length > 0;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Input
            name="search"
            type="search"
            placeholder="Search for ships or outfits..."
            defaultValue={initialQuery}
            className="flex-1"
            disabled={isPending}
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? "Searching..." : "Search"}
          </Button>
        </div>
      </form>

      {!hasQuery && (
        <div className="text-center text-muted-foreground py-12">
          <p>Enter a search query to find ships and outfits.</p>
        </div>
      )}

      {hasQuery && !hasResults && (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No results found</EmptyTitle>
            <EmptyDescription>
              No ships or outfits found matching &quot;{query}&quot;. Try a
              different search term.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {hasQuery && hasResults && (
        <div className="space-y-8">
          {initialResults.ships.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                Ships ({initialResults.ships.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {initialResults.ships.map((item) => (
                  <ResultCard
                    key={`ship-${item.slug}`}
                    item={item}
                    type="ship"
                  />
                ))}
              </div>
            </section>
          )}

          {initialResults.outfits.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                Outfits ({initialResults.outfits.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {initialResults.outfits.map((item) => (
                  <ResultCard
                    key={`outfit-${item.slug}`}
                    item={item}
                    type="outfit"
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

interface ResultCardProps {
  item: SearchIndexItem;
  type: "ship" | "outfit";
}

function ResultCard({ item, type }: ResultCardProps) {
  const href = `/${type}s/${item.slug}`;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">
          <Link href={href} className="hover:text-primary transition-colors">
            {item.name}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Badge variant="secondary">{type}</Badge>
          <Button asChild variant="outline" size="sm">
            <Link href={href}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
