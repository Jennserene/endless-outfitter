"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Ship } from "@/lib/schemas/ship";

interface ShipDetailProps {
  ship: Ship;
}

export function ShipDetail({ ship }: ShipDetailProps) {
  const attributes = ship.attributes;

  return (
    <div className="w-full py-8 space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">{ship.name}</h1>
        {ship.plural && (
          <p className="text-muted-foreground">Plural: {ship.plural}</p>
        )}
        <Badge variant="secondary" className="mt-2">
          {attributes.category}
        </Badge>
      </div>

      {ship.descriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ship.descriptions.map((desc, idx) => (
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
            {attributes.cost !== undefined && (
              <div>
                <span className="font-semibold">Cost:</span>{" "}
                {attributes.cost.toLocaleString()} credits
              </div>
            )}
            {attributes.shields !== undefined && (
              <div>
                <span className="font-semibold">Shields:</span>{" "}
                {attributes.shields}
              </div>
            )}
            {attributes.hull !== undefined && (
              <div>
                <span className="font-semibold">Hull:</span> {attributes.hull}
              </div>
            )}
            {attributes.mass !== undefined && (
              <div>
                <span className="font-semibold">Mass:</span> {attributes.mass}
              </div>
            )}
            {attributes.drag !== undefined && (
              <div>
                <span className="font-semibold">Drag:</span> {attributes.drag}
              </div>
            )}
            {attributes["heat dissipation"] !== undefined && (
              <div>
                <span className="font-semibold">Heat Dissipation:</span>{" "}
                {attributes["heat dissipation"]}
              </div>
            )}
            {attributes["fuel capacity"] !== undefined && (
              <div>
                <span className="font-semibold">Fuel Capacity:</span>{" "}
                {attributes["fuel capacity"]}
              </div>
            )}
            {attributes["cargo space"] !== undefined && (
              <div>
                <span className="font-semibold">Cargo Space:</span>{" "}
                {attributes["cargo space"]}
              </div>
            )}
            {attributes["outfit space"] !== undefined && (
              <div>
                <span className="font-semibold">Outfit Space:</span>{" "}
                {attributes["outfit space"]}
              </div>
            )}
            {attributes["weapon capacity"] !== undefined && (
              <div>
                <span className="font-semibold">Weapon Capacity:</span>{" "}
                {attributes["weapon capacity"]}
              </div>
            )}
            {attributes["engine capacity"] !== undefined && (
              <div>
                <span className="font-semibold">Engine Capacity:</span>{" "}
                {attributes["engine capacity"]}
              </div>
            )}
            {attributes["required crew"] !== undefined && (
              <div>
                <span className="font-semibold">Required Crew:</span>{" "}
                {attributes["required crew"]}
              </div>
            )}
            {attributes.bunks !== undefined && (
              <div>
                <span className="font-semibold">Bunks:</span> {attributes.bunks}
              </div>
            )}
            {attributes.licenses && attributes.licenses.length > 0 && (
              <div className="md:col-span-2">
                <span className="font-semibold">Licenses:</span>{" "}
                <div className="flex flex-wrap gap-2 mt-2">
                  {attributes.licenses.map((license, idx) => (
                    <Badge key={idx} variant="outline">
                      {license}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {attributes.weapon && (
            <>
              <Separator className="my-4" />
              <div>
                <h3 className="font-semibold mb-2">Weapon Stats</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {attributes.weapon["blast radius"] !== undefined && (
                    <div>
                      <span className="font-semibold">Blast Radius:</span>{" "}
                      {attributes.weapon["blast radius"]}
                    </div>
                  )}
                  {attributes.weapon["shield damage"] !== undefined && (
                    <div>
                      <span className="font-semibold">Shield Damage:</span>{" "}
                      {attributes.weapon["shield damage"]}
                    </div>
                  )}
                  {attributes.weapon["hull damage"] !== undefined && (
                    <div>
                      <span className="font-semibold">Hull Damage:</span>{" "}
                      {attributes.weapon["hull damage"]}
                    </div>
                  )}
                  {attributes.weapon["hit force"] !== undefined && (
                    <div>
                      <span className="font-semibold">Hit Force:</span>{" "}
                      {attributes.weapon["hit force"]}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {ship.outfits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Default Outfits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ship.outfits.map((outfit, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span>{outfit.name}</span>
                  {outfit.quantity > 1 && (
                    <Badge variant="secondary">x{outfit.quantity}</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
