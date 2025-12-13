import type { Ship as ShipType } from "@/lib/schemas/ship";
import type { Outfit } from "@/lib/schemas/outfit";

/**
 * Extended ship attributes that may include movement-related attributes
 * not defined in the schema but calculated from outfits.
 */
export type ExtendedAttributes = ShipType["attributes"] & {
  thrust?: number;
  "reverse thrust"?: number;
  "afterburner thrust"?: number;
  turn?: number;
  "turn multiplier"?: number;
  "acceleration multiplier"?: number;
  "inertia reduction"?: number;
  [key: string]: unknown; // Allow any additional attributes
};

/**
 * Ship class that encapsulates ship data and outfit effect calculations.
 * Provides immutable methods for modifying outfits and getters for
 * hull (base) and outfitted (with outfits applied) attributes.
 */
export class Ship {
  private readonly _shipData: ShipType;
  private readonly _outfits: Outfit[];
  private _outfittedAttributesCache: ExtendedAttributes | null = null;

  /**
   * Creates a new Ship instance.
   *
   * @param shipData - The base ship data (hull attributes)
   * @param outfits - Array of outfits to apply to the ship (default: empty)
   */
  constructor(shipData: ShipType, outfits: Outfit[] = []) {
    this._shipData = shipData;
    this._outfits = [...outfits]; // Create copy for immutability
  }

  /**
   * Gets the base ship data (name, slug, etc.)
   */
  get shipData(): ShipType {
    return this._shipData;
  }

  /**
   * Gets the base ship attributes (hull attributes, without outfit effects).
   */
  get hullAttributes(): ShipType["attributes"] {
    return this._shipData.attributes;
  }

  /**
   * Gets the outfitted attributes (hull attributes + outfit effects).
   * Computed once and cached for performance.
   */
  get outfittedAttributes(): ExtendedAttributes {
    if (this._outfittedAttributesCache === null) {
      this._outfittedAttributesCache = this.applyOutfitEffects();
    }
    return this._outfittedAttributesCache;
  }

  /**
   * Gets the current outfits array (read-only).
   */
  getOutfits(): ReadonlyArray<Outfit> {
    return this._outfits;
  }

  /**
   * Adds an outfit to the ship. Returns a new Ship instance (immutable).
   *
   * @param outfit - The outfit to add
   * @param quantity - Number of times to add the outfit (default: 1)
   * @returns New Ship instance with outfit added
   */
  addOutfit(outfit: Outfit, quantity: number = 1): Ship {
    const newOutfits = [...this._outfits];
    for (let i = 0; i < quantity; i++) {
      newOutfits.push(outfit);
    }
    return new Ship(this._shipData, newOutfits);
  }

  /**
   * Removes an outfit from the ship. Returns a new Ship instance (immutable).
   *
   * @param outfitName - Name of the outfit to remove
   * @param quantity - Number of instances to remove (default: 1)
   * @returns New Ship instance with outfit removed
   */
  removeOutfit(outfitName: string, quantity: number = 1): Ship {
    const newOutfits = [...this._outfits];
    let removed = 0;
    for (let i = newOutfits.length - 1; i >= 0 && removed < quantity; i--) {
      if (newOutfits[i].name === outfitName) {
        newOutfits.splice(i, 1);
        removed++;
      }
    }
    return new Ship(this._shipData, newOutfits);
  }

  /**
   * Replaces all outfits on the ship. Returns a new Ship instance (immutable).
   *
   * @param outfits - New array of outfits
   * @returns New Ship instance with outfits replaced
   */
  setOutfits(outfits: Outfit[]): Ship {
    return new Ship(this._shipData, outfits);
  }

  /**
   * Checks if the ship has any thruster (thrust, reverse thrust, or afterburner thrust).
   *
   * @returns True if ship has any thruster
   */
  hasThruster(): boolean {
    const attrs = this.outfittedAttributes;
    const thrust = (attrs.thrust as number | undefined) ?? 0;
    const reverseThrust = (attrs["reverse thrust"] as number | undefined) ?? 0;
    const afterburnerThrust =
      (attrs["afterburner thrust"] as number | undefined) ?? 0;
    return thrust > 0 || reverseThrust > 0 || afterburnerThrust > 0;
  }

  /**
   * Checks if the ship has steering (turn > 0).
   *
   * @returns True if ship has steering
   */
  hasSteering(): boolean {
    const attrs = this.outfittedAttributes;
    const turn = (attrs.turn as number | undefined) ?? 0;
    return turn > 0;
  }

  /**
   * Gets an array of movement problems (e.g., "no thruster!", "no steering!").
   *
   * @returns Array of problem strings, empty if no problems
   */
  getMovementProblems(): string[] {
    const problems: string[] = [];
    if (!this.hasThruster()) {
      problems.push("no thruster!");
    }
    if (!this.hasSteering()) {
      problems.push("no steering!");
    }
    return problems;
  }

  /**
   * Calculates the total mass including outfit mass.
   * Outfit mass comes from the outfit's `mass` property (not attributes.mass).
   *
   * @returns Total mass in tons, or undefined if base mass is not defined
   */
  getOutfittedMass(): number | undefined {
    const baseMass = this.hullAttributes.mass;
    if (baseMass === undefined) {
      return undefined;
    }

    let outfitMass = 0;
    for (const outfit of this._outfits) {
      // Outfit mass is a direct property, not in attributes
      const mass = outfit.mass ?? 0;
      outfitMass += mass;
    }

    return baseMass + outfitMass;
  }

  /**
   * Calculates free outfit space after accounting for installed outfits.
   * Negative outfit space values mean the outfit uses space (subtract).
   * Positive outfit space values mean the outfit adds space (add).
   *
   * @returns Object with total and free outfit space, or undefined if base is not defined
   */
  getOutfitSpace(): { total: number; free: number } | undefined {
    // Total is the outfitted value (base + outfit attribute effects)
    const totalSpace = this.outfittedAttributes["outfit space"];
    if (totalSpace === undefined || typeof totalSpace !== "number") {
      return undefined;
    }

    // Start with total (which includes outfit attribute effects)
    let freeSpace = totalSpace;

    // Subtract space used by installed outfits themselves
    // Negative values mean the outfit uses space (reduce free)
    // Positive values mean the outfit adds space (increase free)
    for (const outfit of this._outfits) {
      // Outfit space can be in direct property or attributes
      const outfitSpace =
        outfit["outfit space"] ??
        (outfit.attributes?.["outfit space"] as number | undefined) ??
        0;

      // Simply add the value: negative subtracts, positive adds
      freeSpace += outfitSpace;
    }

    return {
      total: totalSpace,
      free: freeSpace,
    };
  }

  /**
   * Calculates free weapon capacity after accounting for installed outfits.
   * Same logic as outfit space but uses "weapon capacity" attribute.
   *
   * @returns Object with total and free weapon capacity, or undefined if base is not defined
   */
  getWeaponCapacity(): { total: number; free: number } | undefined {
    // Total should be the base capacity (hull), not including outfit attribute effects
    // because outfit capacity attributes indicate usage, not modifications to total
    const baseCapacity = this.hullAttributes["weapon capacity"];
    if (baseCapacity === undefined || typeof baseCapacity !== "number") {
      return undefined;
    }

    // Start with base capacity
    let freeCapacity = baseCapacity;

    // Add outfit attribute effects that modify capacity (positive values add capacity)
    // But subtract outfit usage (negative values use capacity)
    for (const outfit of this._outfits) {
      // Weapon capacity is in attributes
      const weaponCapacity =
        (outfit.attributes?.["weapon capacity"] as number | undefined) ?? 0;

      // Negative values mean the outfit uses capacity (reduce free)
      // Positive values mean the outfit adds capacity (increase free)
      freeCapacity += weaponCapacity;
    }

    return {
      total: baseCapacity,
      free: freeCapacity,
    };
  }

  /**
   * Calculates free engine capacity after accounting for installed outfits.
   * Same logic as outfit space but uses "engine capacity" attribute.
   *
   * @returns Object with total and free engine capacity, or undefined if base is not defined
   */
  getEngineCapacity(): { total: number; free: number } | undefined {
    // Total should be the base capacity (hull), not including outfit attribute effects
    // because outfit capacity attributes indicate usage, not modifications to total
    const baseCapacity = this.hullAttributes["engine capacity"];
    if (baseCapacity === undefined || typeof baseCapacity !== "number") {
      return undefined;
    }

    // Start with base capacity
    let freeCapacity = baseCapacity;

    // Add outfit attribute effects that modify capacity (positive values add capacity)
    // But subtract outfit usage (negative values use capacity)
    for (const outfit of this._outfits) {
      // Engine capacity is in attributes
      const engineCapacity =
        (outfit.attributes?.["engine capacity"] as number | undefined) ?? 0;

      // Negative values mean the outfit uses capacity (reduce free)
      // Positive values mean the outfit adds capacity (increase free)
      freeCapacity += engineCapacity;
    }

    return {
      total: baseCapacity,
      free: freeCapacity,
    };
  }

  /**
   * Gets outfits that use outfit space and how much each uses.
   * Groups outfits by name and sums their usage.
   *
   * @returns Array of objects with outfit name, quantity, and total space used
   */
  getOutfitSpaceUsage(): Array<{
    outfit: Outfit;
    quantity: number;
    space: number;
  }> {
    const usageMap = new Map<
      string,
      { outfit: Outfit; quantity: number; space: number }
    >();

    for (const outfit of this._outfits) {
      const outfitSpace =
        outfit["outfit space"] ??
        (outfit.attributes?.["outfit space"] as number | undefined) ??
        0;

      if (outfitSpace !== 0) {
        const existing = usageMap.get(outfit.name);
        if (existing) {
          existing.quantity += 1;
          existing.space += outfitSpace;
        } else {
          usageMap.set(outfit.name, {
            outfit,
            quantity: 1,
            space: outfitSpace,
          });
        }
      }
    }

    return Array.from(usageMap.values()).sort((a, b) =>
      a.outfit.name.localeCompare(b.outfit.name)
    );
  }

  /**
   * Gets outfits that use weapon capacity and how much each uses.
   * Groups outfits by name and sums their usage.
   *
   * @returns Array of objects with outfit name, quantity, and total capacity used
   */
  getWeaponCapacityUsage(): Array<{
    outfit: Outfit;
    quantity: number;
    capacity: number;
  }> {
    const usageMap = new Map<
      string,
      { outfit: Outfit; quantity: number; capacity: number }
    >();

    for (const outfit of this._outfits) {
      const weaponCapacity =
        (outfit.attributes?.["weapon capacity"] as number | undefined) ?? 0;

      if (weaponCapacity !== 0) {
        const existing = usageMap.get(outfit.name);
        if (existing) {
          existing.quantity += 1;
          existing.capacity += weaponCapacity;
        } else {
          usageMap.set(outfit.name, {
            outfit,
            quantity: 1,
            capacity: weaponCapacity,
          });
        }
      }
    }

    return Array.from(usageMap.values()).sort((a, b) =>
      a.outfit.name.localeCompare(b.outfit.name)
    );
  }

  /**
   * Gets outfits that use engine capacity and how much each uses.
   * Groups outfits by name and sums their usage.
   *
   * @returns Array of objects with outfit name, quantity, and total capacity used
   */
  getEngineCapacityUsage(): Array<{
    outfit: Outfit;
    quantity: number;
    capacity: number;
  }> {
    const usageMap = new Map<
      string,
      { outfit: Outfit; quantity: number; capacity: number }
    >();

    for (const outfit of this._outfits) {
      const engineCapacity =
        (outfit.attributes?.["engine capacity"] as number | undefined) ?? 0;

      if (engineCapacity !== 0) {
        const existing = usageMap.get(outfit.name);
        if (existing) {
          existing.quantity += 1;
          existing.capacity += engineCapacity;
        } else {
          usageMap.set(outfit.name, {
            outfit,
            quantity: 1,
            capacity: engineCapacity,
          });
        }
      }
    }

    return Array.from(usageMap.values()).sort((a, b) =>
      a.outfit.name.localeCompare(b.outfit.name)
    );
  }

  /**
   * Calculates free gun ports after accounting for installed outfits.
   * Gun ports are consumed by outfits with negative "gun ports" attribute values.
   *
   * @returns Object with total and free gun ports, or undefined if base is not defined
   */
  getGunPorts(): { total: number; free: number } | undefined {
    const basePorts = (this.hullAttributes as Record<string, unknown>)[
      "gun ports"
    ] as number | undefined;
    if (basePorts === undefined || typeof basePorts !== "number") {
      return undefined;
    }

    // Start with base ports
    let freePorts = basePorts;

    // Subtract ports used by installed outfits (negative values consume ports)
    for (const outfit of this._outfits) {
      const gunPorts =
        (outfit.attributes?.["gun ports"] as number | undefined) ?? 0;
      // Negative values mean the outfit uses ports (reduce free)
      if (gunPorts < 0) {
        freePorts += gunPorts; // Add negative = subtract positive
      }
    }

    return {
      total: basePorts,
      free: freePorts,
    };
  }

  /**
   * Gets outfits that use gun ports and how much each uses.
   * Groups outfits by name and sums their usage.
   *
   * @returns Array of objects with outfit name, quantity, and total ports used
   */
  getGunPortsUsage(): Array<{
    outfit: Outfit;
    quantity: number;
    ports: number;
  }> {
    const usageMap = new Map<
      string,
      { outfit: Outfit; quantity: number; ports: number }
    >();

    for (const outfit of this._outfits) {
      const gunPorts =
        (outfit.attributes?.["gun ports"] as number | undefined) ?? 0;

      // Only count negative values (outfits that use ports)
      if (gunPorts < 0) {
        const existing = usageMap.get(outfit.name);
        if (existing) {
          existing.quantity += 1;
          existing.ports += Math.abs(gunPorts); // Store as positive for display
        } else {
          usageMap.set(outfit.name, {
            outfit,
            quantity: 1,
            ports: Math.abs(gunPorts),
          });
        }
      }
    }

    return Array.from(usageMap.values()).sort((a, b) =>
      a.outfit.name.localeCompare(b.outfit.name)
    );
  }

  /**
   * Calculates free turret mounts after accounting for installed outfits.
   * Turret mounts are consumed by outfits with negative "turret mounts" attribute values.
   *
   * @returns Object with total and free turret mounts, or undefined if base is not defined
   */
  getTurretMounts(): { total: number; free: number } | undefined {
    const baseMounts = (this.hullAttributes as Record<string, unknown>)[
      "turret mounts"
    ] as number | undefined;
    if (baseMounts === undefined || typeof baseMounts !== "number") {
      return undefined;
    }

    // Start with base mounts
    let freeMounts = baseMounts;

    // Subtract mounts used by installed outfits (negative values consume mounts)
    for (const outfit of this._outfits) {
      const turretMounts =
        (outfit.attributes?.["turret mounts"] as number | undefined) ?? 0;
      // Negative values mean the outfit uses mounts (reduce free)
      if (turretMounts < 0) {
        freeMounts += turretMounts; // Add negative = subtract positive
      }
    }

    return {
      total: baseMounts,
      free: freeMounts,
    };
  }

  /**
   * Gets outfits that use turret mounts and how much each uses.
   * Groups outfits by name and sums their usage.
   *
   * @returns Array of objects with outfit name, quantity, and total mounts used
   */
  getTurretMountsUsage(): Array<{
    outfit: Outfit;
    quantity: number;
    mounts: number;
  }> {
    const usageMap = new Map<
      string,
      { outfit: Outfit; quantity: number; mounts: number }
    >();

    for (const outfit of this._outfits) {
      const turretMounts =
        (outfit.attributes?.["turret mounts"] as number | undefined) ?? 0;

      // Only count negative values (outfits that use mounts)
      if (turretMounts < 0) {
        const existing = usageMap.get(outfit.name);
        if (existing) {
          existing.quantity += 1;
          existing.mounts += Math.abs(turretMounts); // Store as positive for display
        } else {
          usageMap.set(outfit.name, {
            outfit,
            quantity: 1,
            mounts: Math.abs(turretMounts),
          });
        }
      }
    }

    return Array.from(usageMap.values()).sort((a, b) =>
      a.outfit.name.localeCompare(b.outfit.name)
    );
  }

  /**
   * Gets outfits that contribute to a specific stat attribute and how much each contributes.
   * Groups outfits by name and sums their contributions.
   *
   * @param statKey - The attribute key to get contributions for (e.g., "shields", "hull", "mass")
   * @returns Array of objects with outfit, quantity, and total value contributed
   */
  getStatContributions(statKey: string): Array<{
    outfit: Outfit;
    quantity: number;
    value: number;
  }> {
    const contributionMap = new Map<
      string,
      { outfit: Outfit; quantity: number; value: number }
    >();

    for (const outfit of this._outfits) {
      // Check both direct attribute and nested attributes object
      const statValue =
        (outfit.attributes?.[statKey] as number | undefined) ??
        (outfit[statKey as keyof Outfit] as number | undefined) ??
        0;

      if (statValue !== 0) {
        const existing = contributionMap.get(outfit.name);
        if (existing) {
          existing.quantity += 1;
          existing.value += statValue;
        } else {
          contributionMap.set(outfit.name, {
            outfit,
            quantity: 1,
            value: statValue,
          });
        }
      }
    }

    return Array.from(contributionMap.values()).sort((a, b) =>
      a.outfit.name.localeCompare(b.outfit.name)
    );
  }

  /**
   * Applies outfit effects to hull attributes.
   * Numeric attributes are added together, non-numeric attributes replace existing values.
   *
   * @returns Combined attributes with outfit effects applied
   */
  private applyOutfitEffects(): ExtendedAttributes {
    // Start with a deep copy of hull attributes
    const result: ExtendedAttributes = {
      ...this.hullAttributes,
    };

    // Apply each outfit's attributes
    for (const outfit of this._outfits) {
      const outfitAttrs = outfit.attributes || {};

      for (const [key, value] of Object.entries(outfitAttrs)) {
        const existingValue = result[key];

        // If both values are numbers, add them
        if (typeof value === "number" && typeof existingValue === "number") {
          result[key] = (existingValue as number) + value;
        }
        // If value is an array, replace (e.g., licenses)
        else if (Array.isArray(value)) {
          result[key] = value;
        }
        // If value is an object, replace (e.g., weapon object)
        else if (typeof value === "object" && value !== null) {
          result[key] = value;
        }
        // Otherwise, replace (strings, booleans, etc.)
        else {
          result[key] = value;
        }
      }
    }

    return result;
  }
}
