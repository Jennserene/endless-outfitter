"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Outfit } from "@/lib/schemas/outfit";

interface OutfitDetailProps {
  outfit: Outfit;
}

export function OutfitDetail({ outfit }: OutfitDetailProps) {
  const attributes = outfit.attributes;

  return (
    <div className="w-full py-8 space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">{outfit.name}</h1>
        {outfit.plural && (
          <p className="text-muted-foreground">Plural: {outfit.plural}</p>
        )}
        <div className="flex gap-2 mt-2">
          {outfit.category && (
            <Badge variant="secondary">{outfit.category}</Badge>
          )}
          {outfit.series && (
            <Badge variant="outline">Series: {outfit.series}</Badge>
          )}
        </div>
      </div>

      {outfit.descriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {outfit.descriptions.map((desc, idx) => (
                <p key={idx} className="text-muted-foreground">
                  {desc}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Attributes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {outfit.cost !== undefined && (
              <div>
                <span className="font-semibold">Cost:</span>{" "}
                {outfit.cost.toLocaleString()} credits
              </div>
            )}
            {outfit.mass !== undefined && (
              <div>
                <span className="font-semibold">Mass:</span> {outfit.mass}
              </div>
            )}
            {outfit["outfit space"] !== undefined && (
              <div>
                <span className="font-semibold">Outfit Space:</span>{" "}
                {outfit["outfit space"]}
              </div>
            )}
            {outfit.index !== undefined && (
              <div>
                <span className="font-semibold">Index:</span> {outfit.index}
              </div>
            )}

            {/* Dynamic attributes from the attributes object */}
            {Object.entries(attributes).map(([key, value]) => {
              // Skip if already displayed above
              if (
                key === "category" ||
                key === "cost" ||
                key === "mass" ||
                key === "outfit space"
              ) {
                return null;
              }

              // Format the value based on type
              let displayValue: React.ReactNode;
              if (typeof value === "number") {
                displayValue = value.toLocaleString();
              } else if (typeof value === "boolean") {
                displayValue = value ? "Yes" : "No";
              } else if (Array.isArray(value)) {
                displayValue = value.join(", ");
              } else if (typeof value === "object" && value !== null) {
                displayValue = JSON.stringify(value, null, 2);
              } else {
                displayValue = String(value);
              }

              return (
                <div key={key}>
                  <span className="font-semibold capitalize">
                    {key.replace(/_/g, " ")}:
                  </span>{" "}
                  {displayValue}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
