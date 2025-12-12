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
import type { Ship } from "@/lib/schemas/ship";

interface ShipsListProps {
  ships: Ship[];
}

export function ShipsList({ ships }: ShipsListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredShips = ships.filter((ship) =>
    ship.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Ships</h1>
          <p className="text-muted-foreground">
            {ships.length} total ship{ships.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          type="search"
          placeholder="Search ships by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {filteredShips.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No ships found</EmptyTitle>
            <EmptyDescription>
              {searchTerm
                ? `No ships found matching "${searchTerm}". Try a different search term.`
                : "No ships available."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredShips.map((ship) => (
            <Card key={ship.name} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">
                  <Link
                    href={`/ships/${slugify(ship.name)}`}
                    className="hover:text-primary transition-colors"
                  >
                    {ship.name}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {ship.attributes.category}
                    </Badge>
                    {ship.attributes.cost !== undefined && (
                      <span className="text-sm text-muted-foreground">
                        {ship.attributes.cost.toLocaleString()} credits
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {ship.attributes.shields !== undefined && (
                      <div>Shields: {ship.attributes.shields}</div>
                    )}
                    {ship.attributes.hull !== undefined && (
                      <div>Hull: {ship.attributes.hull}</div>
                    )}
                    {ship.attributes["outfit space"] !== undefined && (
                      <div>Outfit Space: {ship.attributes["outfit space"]}</div>
                    )}
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Link href={`/ships/${slugify(ship.name)}`}>
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
