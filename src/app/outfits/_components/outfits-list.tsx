"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import Link from "next/link";
import { slugify } from "@/lib/utils/slug";
import type { Outfit } from "@/lib/schemas/outfit";

interface OutfitsListProps {
  outfits: Outfit[];
}

export function OutfitsList({ outfits }: OutfitsListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOutfits = outfits.filter((outfit) =>
    outfit.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Outfits</h1>
          <p className="text-muted-foreground">
            {outfits.length} total outfit{outfits.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          type="search"
          placeholder="Search outfits by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {filteredOutfits.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No outfits found</EmptyTitle>
            <EmptyDescription>
              {searchTerm
                ? `No outfits found matching "${searchTerm}". Try a different search term.`
                : "No outfits available."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOutfits.map((outfit) => (
            <Card
              key={outfit.name}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <CardTitle className="text-lg">
                  <Link
                    href={`/outfits/${slugify(outfit.name)}`}
                    className="hover:text-primary transition-colors"
                  >
                    {outfit.name}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {outfit.category && (
                      <Badge variant="secondary">{outfit.category}</Badge>
                    )}
                    {outfit.cost !== undefined && (
                      <span className="text-sm text-muted-foreground">
                        {outfit.cost.toLocaleString()} credits
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {outfit.mass !== undefined && (
                      <div>Mass: {outfit.mass}</div>
                    )}
                    {outfit["outfit space"] !== undefined && (
                      <div>Outfit Space: {outfit["outfit space"]}</div>
                    )}
                    {outfit.series && <div>Series: {outfit.series}</div>}
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Link href={`/outfits/${slugify(outfit.name)}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
