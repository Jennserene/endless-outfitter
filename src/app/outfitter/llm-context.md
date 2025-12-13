# Outfitter Panel - Ship Data Display Documentation

This document describes all ship data displayed in the Endless Sky outfitter panel and how each value is calculated. This information is based on the Endless Sky source code (`ShipInfoDisplay.cpp` and `ShopPanel.cpp`).

**Note**: This outfitter app does **not** take depreciation into account. All cost values use the full, undepreciated cost.

## Layout Structure

The outfitter panel displays ship information in the following order:

1. **Ship Image** - Visual representation of the ship
2. **Ship Header** - Model name and category
3. **Ship Cost** - Hull cost (full cost, no depreciation)
4. **Ship Stats** - Core attributes (shields, hull, mass, cargo, crew, fuel)
5. **Movement Stats** - Speed, acceleration, and turning (with cargo variations)
6. **Outfit Space** - Available space for outfits, weapons, engines, gun ports, turret mounts
7. **Bay Information** - Fighter bays and other bay types
8. **Energy and Heat Tables** - Consumption/generation in various states
9. **Outfits List** - All installed outfits organized by category

---

## 1. Ship Image

**Location**: Top of the panel

**Display**:

- Ship thumbnail (if available) or ship sprite
- Ship name below the image
- Background frame (selected/unselected state)

**Source**:

- `ship.Thumbnail()` - Preferred thumbnail image
- `ship.GetSprite()` - Fallback to full sprite if no thumbnail
- `ship.GivenName()` or `ship.DisplayModelName()` - Ship name

**Implementation Notes**:

- Thumbnail is drawn at center with 10px offset downward
- If using sprite, it's scaled to fit within `SHIP_SIZE - 60` pixels with 10px padding
- Swizzle (color scheme) is applied based on custom swizzle or player government

---

## 2. Ship Header

**Labels**: `model:`, `category:` (on scrolling panels)

**Values**:

- Model: `ship.DisplayModelName()`
- Category: `ship.BaseAttributes().Category()` (only shown on scrolling panels)

---

## 3. Ship Cost

**Label**: `cost:`

**Calculation**:

```cpp
int64_t fullCost = ship.Cost();
```

**Display**:

- Shows "cost:" with full value
- Value formatted as credits: `Format::Credits(fullCost)`

**Note**: This app does not use depreciation. Always displays the full, undepreciated cost.

---

## 4. Ship Stats

### 4.1 Shields

**Label**: `shields:` or `shields (charge):` (if regeneration > 0)

**Calculation**:

```cpp
double shieldRegen = (attributes.Get("shield generation")
    + attributes.Get("delayed shield generation"))
    * (1. + attributes.Get("shield generation multiplier"));
```

**Display**:

- If `shieldRegen > 0`: `"shields (charge):"` with value `ship.MaxShields()` and `"(" + Format::Number(60. * shieldRegen) + "/s)"`
- Otherwise: `"shields:"` with just `Format::Number(ship.MaxShields())`

**Units**: Shield points, regeneration in points per second

---

### 4.2 Hull

**Label**: `hull:` or `hull (repair):` (if repair rate > 0)

**Calculation**:

```cpp
double hullRepair = (attributes.Get("hull repair rate")
    + attributes.Get("delayed hull repair rate"))
    * (1. + attributes.Get("hull repair multiplier"));
```

**Display**:

- If `hullRepair > 0`: `"hull (repair):"` with value `ship.MaxHull()` and `"(" + Format::Number(60. * hullRepair) + "/s)"`
- Otherwise: `"hull:"` with just `Format::Number(ship.MaxHull())`

**Units**: Hull points, repair in points per second

---

### 4.3 Mass

**Label**: `mass:` or `mass with no cargo:` (for generic ships)

**Calculation**:

```cpp
double emptyMass = attributes.Mass();
double currentMass = ship.Mass();
```

**Display**:

- Generic ship (no given name or on planet): `"mass with no cargo:"` with `Format::Number(emptyMass) + " tons"`
- Named ship: `"mass:"` with `Format::Number(currentMass) + " tons"`

**Note**: Mass includes all installed outfits and cargo.

---

### 4.4 Cargo Space

**Label**: `cargo space:` or `cargo:` (for named ships)

**Calculation**:

```cpp
double cargoSpace = attributes.Get("cargo space");
double cargoUsed = ship.Cargo().Used();
```

**Display**:

- Generic ship: `"cargo space:"` with `Format::Number(cargoSpace) + " tons"`
- Named ship: `"cargo:"` with `Format::Number(cargoUsed) + " / " + Format::Number(cargoSpace) + " tons"`

---

### 4.5 Required Crew / Bunks

**Label**: `required crew / bunks:`

**Calculation**:

```cpp
int requiredCrew = ship.RequiredCrew();
double bunks = attributes.Get("bunks");
```

**Display**: `Format::Number(requiredCrew) + " / " + Format::Number(bunks)`

**Note**: Required crew is calculated from all installed outfits that have `"required crew"` attribute.

---

### 4.6 Fuel Capacity

**Label**: `fuel capacity:` or `fuel:` (for named ships)

**Calculation**:

```cpp
double fuelCapacity = attributes.Get("fuel capacity");
double currentFuel = ship.Fuel() * fuelCapacity;
```

**Display**:

- Generic ship: `"fuel capacity:"` with `Format::Number(fuelCapacity)`
- Named ship: `"fuel:"` with `Format::Number(currentFuel) + " / " + Format::Number(fuelCapacity)`

**Note**: `ship.Fuel()` returns a fraction (0.0 to 1.0), so multiply by capacity for display.

---

## 5. Movement Stats

**Label**: `movement:` or `movement (full - no cargo):` (for generic ships)

### 5.1 Max Speed

**Label**: `max speed:`

**Calculation**:

```cpp
double forwardThrust = attributes.Get("thrust")
    ? attributes.Get("thrust")
    : attributes.Get("afterburner thrust");
double maxSpeed = 60. * forwardThrust / ship.Drag();
```

**Display**: `Format::Number(maxSpeed)`

**Units**: Speed units (60 \* thrust / drag)

**Note**: Uses afterburner thrust if regular thrust is 0.

---

### 5.2 Acceleration

**Label**: `acceleration:`

**Calculation**:

```cpp
// Apply inertia reduction
double reduction = 1. + attributes.Get("inertia reduction");
double emptyMass = attributes.Mass() / reduction;
double fullMass = (emptyMass + attributes.Get("cargo space")) / reduction;
double currentMass = ship.Mass() / reduction;

double baseAccel = 3600. * forwardThrust
    * (1. + attributes.Get("acceleration multiplier"));
```

**Display**:

- Generic ship: `Format::Number(baseAccel / fullMass) + " - " + Format::Number(baseAccel / emptyMass)`
- Named ship: `Format::Number(baseAccel / currentMass)`

**Units**: Acceleration units (3600 _ thrust _ multiplier / mass)

**Note**: Inertia reduction reduces effective mass for movement calculations.

---

### 5.3 Turning

**Label**: `turning:`

**Calculation**:

```cpp
double baseTurn = 60. * attributes.Get("turn")
    * (1. + attributes.Get("turn multiplier"));
// Mass already reduced by inertia reduction above
```

**Display**:

- Generic ship: `Format::Number(baseTurn / fullMass) + " - " + Format::Number(baseTurn / emptyMass)`
- Named ship: `Format::Number(baseTurn / currentMass)`

**Units**: Degrees per second (60 _ turn _ multiplier / mass)

---

## 6. Outfit Space

### 6.1 Outfit Space Free

**Label**: `outfit space free:`

**Calculation**:

```cpp
// Start with chassis capacity
double chassisOutfitSpace = attributes.Get("outfit space");

// Subtract space used by installed outfits
for(const auto &outfit : ship.Outfits()) {
    double spaceUsed = outfit.second * outfit.first->Get("outfit space");
    if(spaceUsed < 0) { // Negative means it uses space
        chassisOutfitSpace -= spaceUsed;
    }
}
```

**Display**: `Format::Number(attributes.Get("outfit space")) + " / " + Format::Number(chassisOutfitSpace)`

**Format**: `"total / free"` where total is base capacity, free is remaining after outfits.

---

### 6.2 Weapon Capacity

**Label**: `    weapon capacity:` (indented)

**Calculation**: Same as outfit space, but uses `"weapon capacity"` attribute.

**Display**: `Format::Number(attributes.Get("weapon capacity")) + " / " + Format::Number(chassisWeaponCapacity)`

**Note**: Only part of outfit space can be used for weapons.

---

### 6.3 Engine Capacity

**Label**: `    engine capacity:` (indented)

**Calculation**: Same as outfit space, but uses `"engine capacity"` attribute.

**Display**: `Format::Number(attributes.Get("engine capacity")) + " / " + Format::Number(chassisEngineCapacity)`

**Note**: Only part of outfit space can be used for engines.

---

### 6.4 Gun Ports Free

**Label**: `gun ports free:`

**Calculation**:

```cpp
int chassisGunPorts = attributes.Get("gun ports");
// Subtract ports used by installed outfits
for(const auto &outfit : ship.Outfits()) {
    int portsUsed = outfit.second * outfit.first->Get("gun ports");
    if(portsUsed < 0) {
        chassisGunPorts -= portsUsed;
    }
}
```

**Display**: `Format::Number(attributes.Get("gun ports")) + " / " + Format::Number(chassisGunPorts)`

**Format**: `"total / free"` gun ports.

---

### 6.5 Turret Mounts Free

**Label**: `turret mounts free:`

**Calculation**: Same as gun ports, but uses `"turret mounts"` attribute.

**Display**: `Format::Number(attributes.Get("turret mounts")) + " / " + Format::Number(chassisTurretMounts)`

**Format**: `"total / free"` turret mounts.

---

## 7. Bay Information

**Label**: `{bayType} bays:` (e.g., "fighter bays:", "drone bays:")

**Calculation**:

```cpp
for(const auto &category : GameData::GetCategory(CategoryType::BAY)) {
    const string &bayType = category.Name();
    int totalBays = ship.BaysTotal(bayType);
    if(totalBays > 0) {
        // Display bay count
    }
}
```

**Display**: `to_string(totalBays)` (simple count)

**Note**: Only displayed if the ship has bays of that type. Label is converted to lowercase.

---

## 8. Energy and Heat Tables

The energy and heat table shows consumption/generation rates in different states.

### Table Structure

Two columns: "energy" and "heat", with rows for different states.

### 8.1 Idle

**Label**: `idle:`

**Energy Calculation**:

```cpp
double idleEnergyPerFrame = attributes.Get("energy generation")
    + attributes.Get("solar collection")
    + attributes.Get("fuel energy")
    - attributes.Get("energy consumption")
    - attributes.Get("cooling energy");
```

**Heat Calculation**:

```cpp
double idleHeatPerFrame = attributes.Get("heat generation")
    + attributes.Get("solar heat")
    + attributes.Get("fuel heat")
    - ship.CoolingEfficiency() * (attributes.Get("cooling")
        + attributes.Get("active cooling"));
```

**Display**:

- Energy: `Format::Number(60. * idleEnergyPerFrame)` (per second)
- Heat: `Format::Number(60. * idleHeatPerFrame)` (per second)

**Note**: Positive values mean generation, negative means consumption.

---

### 8.2 Moving

**Label**: `moving:`

**Energy Calculation**:

```cpp
double movingEnergyPerFrame = max(
    attributes.Get("thrusting energy"),
    attributes.Get("reverse thrusting energy")
) + attributes.Get("turning energy")
  + attributes.Get("afterburner energy");
```

**Heat Calculation**:

```cpp
double movingHeatPerFrame = max(
    attributes.Get("thrusting heat"),
    attributes.Get("reverse thrusting heat")
) + attributes.Get("turning heat")
  + attributes.Get("afterburner heat");
```

**Display**:

- Energy: `Format::Number(-60. * movingEnergyPerFrame)` (negative = consumption)
- Heat: `Format::Number(60. * movingHeatPerFrame)` (positive = generation)

**Note**: Uses maximum of forward/reverse thrusting values.

---

### 8.3 Firing

**Label**: `firing:`

**Energy Calculation**:

```cpp
double firingEnergy = 0.;
for(const auto &outfit : ship.Outfits()) {
    if(outfit.first->IsWeapon() && outfit.first->Reload()) {
        firingEnergy += outfit.second
            * outfit.first->FiringEnergy()
            / outfit.first->Reload();
    }
}
```

**Heat Calculation**:

```cpp
double firingHeat = 0.;
for(const auto &outfit : ship.Outfits()) {
    if(outfit.first->IsWeapon() && outfit.first->Reload()) {
        firingHeat += outfit.second
            * outfit.first->FiringHeat()
            / outfit.first->Reload();
    }
}
```

**Display**:

- Energy: `Format::Number(-60. * firingEnergy)` (negative = consumption)
- Heat: `Format::Number(60. * firingHeat)` (positive = generation)

**Note**: Calculated per weapon, averaged over reload time.

---

### 8.4 Shields / Hull (Repairing/Charging)

**Label**: `charging shields:`, `repairing hull:`, or `shields / hull:` (if both)

**Energy Calculation**:

```cpp
double shieldEnergy = (hasShieldRegen)
    ? (attributes.Get("shield energy")
        + attributes.Get("delayed shield energy"))
        * (1. + attributes.Get("shield energy multiplier"))
    : 0.;
double hullEnergy = (hasHullRepair)
    ? (attributes.Get("hull energy")
        + attributes.Get("delayed hull energy"))
        * (1. + attributes.Get("hull energy multiplier"))
    : 0.;
```

**Heat Calculation**:

```cpp
double shieldHeat = (hasShieldRegen)
    ? (attributes.Get("shield heat")
        + attributes.Get("delayed shield heat"))
        * (1. + attributes.Get("shield heat multiplier"))
    : 0.;
double hullHeat = (hasHullRepair)
    ? (attributes.Get("hull heat")
        + attributes.Get("delayed hull heat"))
        * (1. + attributes.Get("hull heat multiplier"))
    : 0.;
```

**Display**:

- Energy: `Format::Number(-60. * (shieldEnergy + hullEnergy))` (negative = consumption)
- Heat: `Format::Number(60. * (shieldHeat + hullHeat))` (positive = generation)

**Note**: Only shown if ship has shield regeneration or hull repair capabilities.

---

### 8.5 Net Change (Scrolling Panels Only)

**Label**: `net change:`

**Calculation**:

```cpp
const double overallEnergy = idleEnergyPerFrame
    - movingEnergyPerFrame
    - firingEnergy
    - shieldEnergy
    - hullEnergy;
const double overallHeat = idleHeatPerFrame
    + movingHeatPerFrame
    + firingHeat
    + shieldHeat
    + hullHeat;
```

**Display**:

- Energy: `Format::Number(60. * overallEnergy)`
- Heat: `Format::Number(60. * overallHeat)`

**Note**: Only displayed on scrolling panels (outfitter uses scrolling panel).

---

### 8.6 Maximum Values

**Label**: `max:`

**Energy Calculation**:

```cpp
double maxEnergy = attributes.Get("energy capacity");
```

**Heat Calculation**:

```cpp
double maxHeat = 60. * ship.HeatDissipation() * ship.MaximumHeat();
```

**Display**:

- Energy: `Format::Number(maxEnergy)` (total capacity)
- Heat: `Format::Number(maxHeat)` (maximum heat before overheating, per second)

---

## 9. Outfits List

**Organization**: Outfits are grouped by category, then listed alphabetically within each category.

**Calculation**:

```cpp
map<string, map<string, int>> listing;
for(const auto &outfit : ship.Outfits()) {
    if(outfit.first->IsDefined()
        && !outfit.first->Category().empty()
        && !outfit.first->DisplayName().empty()) {
        listing[outfit.first->Category()][outfit.first->DisplayName()]
            += outfit.second;
    }
}
```

**Display**:

- Category header: `"{category}:"` (e.g., "Weapons:", "Systems:")
- Outfit entry: `"{outfit name}"` with count `"{count}"` (if count > 1)

**Format**:

```
Weapons:
  Laser Cannon    2
  Plasma Cannon   1

Systems:
  Large Radar     1
```

**Note**: Only displays defined outfits with non-empty category and display name.

---

## 10. Sale Information (When Selling)

When in sale mode (shipyard, not outfitter), additional sale information is shown:

**Labels**:

- `"This ship will sell for:"`
- `"empty hull:"`
- `"  + outfits:"`

**Calculation**:

```cpp
int64_t totalCost = ship.Cost();
int64_t chassisCost = GameData::Ships().Get(ship.TrueModelName())->Cost();
```

**Display**:

- Empty hull: `Format::Credits(chassisCost)`
- - outfits: `Format::Credits(totalCost - chassisCost)`

**Note**: Only shown when `sale` parameter is `true` (shipyard panel). This app does not use depreciation, so all values are full cost.

---

## Key Implementation Details

### Attribute Access

All ship attributes are accessed via `ship.Attributes().Get("attribute name")`, which returns the cumulative value from the base ship plus all installed outfits.

### Generic vs Named Ships

- **Generic ships**: Ships without a given name or ships on a planet. Show base stats (no cargo, full fuel, etc.)
- **Named ships**: Player ships with custom names. Show current state (cargo used, current fuel, etc.)

### Mass Calculations

Mass affects movement stats. The effective mass for movement is reduced by inertia reduction:

```cpp
effectiveMass = baseMass / (1. + inertiaReduction)
```

### Energy/Heat Units

- All energy/heat values are calculated **per frame** in the game code
- Displayed values are converted to **per second** by multiplying by 60
- Positive energy = generation, negative = consumption
- Positive heat = generation, negative = dissipation

### Formatting Functions

- `Format::Number(value)` - Formats numbers with appropriate precision
- `Format::Credits(value)` - Formats currency values
- `Format::CargoString(value, "mass")` - Formats cargo/mass values with units

---

## Data Sources

All calculations are based on:

- `Ship` class attributes (`ship.Attributes()`)
- `Ship` instance methods (`ship.Mass()`, `ship.MaxShields()`, etc.)
- `Outfit` attributes from installed outfits

**Note**: This app does not use `PlayerInfo` for depreciation or date calculations. All cost values are full, undepreciated costs.

---

## References

- `vendor/endless-sky/source/ShipInfoDisplay.cpp` - Main display logic
- `vendor/endless-sky/source/ShopPanel.cpp` - Panel layout and ship drawing
- `vendor/endless-sky/source/OutfitterPanel.cpp` - Outfitter-specific logic
- `vendor/endless-sky/source/Ship.cpp` - Ship attribute calculations
- `vendor/endless-sky/source/Outfit.cpp` - Outfit attribute definitions
