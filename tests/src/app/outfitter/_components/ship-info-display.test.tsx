/**
 * Tests for src/app/outfitter/_components/ship-info-display.tsx
 */

import { render, screen } from "../../../__helpers__/test-utils";
import { ShipInfoDisplay } from "@/app/outfitter/_components/ship-info-display";
import { Ship } from "@/lib/models/ship";
import type { Ship as ShipType } from "@/lib/schemas/ship";
import type { Outfit } from "@/lib/schemas/outfit";

const TEST_SHIP_NAME = "Test Ship";
const TEST_SHIP_SLUG = "test-ship";

function createTestShip(overrides?: Partial<ShipType>): Ship {
  const { attributes, ...restOverrides } = overrides || {};
  const shipData: ShipType = {
    name: TEST_SHIP_NAME,
    slug: TEST_SHIP_SLUG,
    attributes: {
      category: "Test Category",
      ...(attributes || {}),
    },
    outfits: [],
    descriptions: [],
    ...restOverrides,
  };
  return new Ship(shipData, []);
}

describe("ShipInfoDisplay", () => {
  it("renders 'No ship selected' when ship is null", () => {
    render(<ShipInfoDisplay ship={null} />);
    expect(screen.getByText("No ship selected")).toBeInTheDocument();
  });

  it("renders ship image and name", () => {
    const ship = createTestShip();
    render(<ShipInfoDisplay ship={ship} />);
    // Ship name appears in both ShipImage and model display
    expect(screen.getAllByText(TEST_SHIP_NAME).length).toBeGreaterThan(0);
  });

  it("renders model label", () => {
    const ship = createTestShip();
    render(<ShipInfoDisplay ship={ship} />);
    expect(screen.getByText("model:")).toBeInTheDocument();
  });

  it("renders category when present", () => {
    const ship = createTestShip({
      attributes: {
        category: "Heavy Warship",
      },
    });
    render(<ShipInfoDisplay ship={ship} />);
    expect(screen.getByText("category:")).toBeInTheDocument();
    expect(screen.getByText("Heavy Warship")).toBeInTheDocument();
  });

  it("does not render category when absent", () => {
    const ship = createTestShip({
      attributes: {
        category: "",
      },
    });
    render(<ShipInfoDisplay ship={ship} />);
    expect(screen.queryByText("category:")).not.toBeInTheDocument();
  });

  describe("Ship Stats", () => {
    it("renders cost when defined", () => {
      const ship = createTestShip({
        attributes: {
          category: "Test",
          cost: 1000000,
        },
      });
      render(<ShipInfoDisplay ship={ship} />);
      expect(screen.getByText("cost:")).toBeInTheDocument();
      // Value and unit are combined in the display
      expect(screen.getByText("1,000,000 credits")).toBeInTheDocument();
    });

    it("does not render cost when undefined", () => {
      const ship = createTestShip();
      render(<ShipInfoDisplay ship={ship} />);
      expect(screen.queryByText("cost:")).not.toBeInTheDocument();
    });

    it("renders shields when defined", () => {
      const ship = createTestShip({
        attributes: {
          category: "Test",
          shields: 5000,
        },
      });
      render(<ShipInfoDisplay ship={ship} />);
      // Accordion format uses "shields" without colon
      expect(screen.getByText("shields")).toBeInTheDocument();
      expect(screen.getByText("5,000")).toBeInTheDocument();
    });

    it("does not render shields when undefined", () => {
      const ship = createTestShip();
      render(<ShipInfoDisplay ship={ship} />);
      // Accordion format uses "shields" without colon
      expect(screen.queryByText("shields")).not.toBeInTheDocument();
    });

    it("renders hull when defined", () => {
      const ship = createTestShip({
        attributes: {
          category: "Test",
          hull: 3000,
        },
      });
      render(<ShipInfoDisplay ship={ship} />);
      // Accordion format uses "hull" without colon
      expect(screen.getByText("hull")).toBeInTheDocument();
      expect(screen.getByText("3,000")).toBeInTheDocument();
    });

    it("renders mass with unit when defined", () => {
      const ship = createTestShip({
        attributes: {
          category: "Test",
          mass: 1500,
        },
      });
      render(<ShipInfoDisplay ship={ship} />);
      // Accordion format uses "mass with no cargo" without colon
      expect(screen.getByText("mass with no cargo")).toBeInTheDocument();
      // Value and unit are combined in the display
      expect(screen.getByText("1,500 tons")).toBeInTheDocument();
    });

    it("renders cargo space with unit when defined", () => {
      const ship = createTestShip({
        attributes: {
          category: "Test",
          "cargo space": 200,
        },
      });
      render(<ShipInfoDisplay ship={ship} />);
      // Accordion format uses "cargo space" without colon
      expect(screen.getByText("cargo space")).toBeInTheDocument();
      // Value and unit are combined in the display
      expect(screen.getByText("200 tons")).toBeInTheDocument();
    });

    it("renders fuel capacity when defined", () => {
      const ship = createTestShip({
        attributes: {
          category: "Test",
          "fuel capacity": 500,
        },
      });
      render(<ShipInfoDisplay ship={ship} />);
      // Accordion format uses "fuel capacity" without colon
      expect(screen.getByText("fuel capacity")).toBeInTheDocument();
      expect(screen.getByText("500")).toBeInTheDocument();
    });

    it("renders crew/bunks when either is defined", () => {
      const ship = createTestShip({
        attributes: {
          category: "Test",
          "required crew": 10,
          bunks: 20,
        },
      });
      render(<ShipInfoDisplay ship={ship} />);
      // Accordion format uses "required crew / bunks" without colon
      expect(screen.getByText("required crew / bunks")).toBeInTheDocument();
      expect(screen.getByText("10 / 20")).toBeInTheDocument();
    });

    it("renders crew/bunks with zeros when one is missing", () => {
      const ship = createTestShip({
        attributes: {
          category: "Test",
          "required crew": 10,
        },
      });
      render(<ShipInfoDisplay ship={ship} />);
      // Accordion label doesn't have colon
      expect(screen.getByText("required crew / bunks")).toBeInTheDocument();
      expect(screen.getByText("10 / 0")).toBeInTheDocument();
    });

    it("does not render crew/bunks when both are undefined", () => {
      const ship = createTestShip();
      render(<ShipInfoDisplay ship={ship} />);
      expect(
        screen.queryByText("required crew / bunks")
      ).not.toBeInTheDocument();
    });
  });

  describe("Movement Stats", () => {
    it("renders movement section when drag is defined", () => {
      const shipData: ShipType = {
        name: TEST_SHIP_NAME,
        slug: TEST_SHIP_SLUG,
        attributes: {
          category: "Test",
          drag: 10.5,
        },
        outfits: [],
        descriptions: [],
      };

      // Create outfits that provide thrust and turn (movement attributes)
      const thrusterOutfit: Outfit = {
        name: "Test Thruster",
        slug: "test-thruster",
        attributes: {
          thrust: 100,
        },
        descriptions: [],
      };

      const steeringOutfit: Outfit = {
        name: "Test Steering",
        slug: "test-steering",
        attributes: {
          turn: 50,
        },
        descriptions: [],
      };

      const ship = new Ship(shipData, [thrusterOutfit, steeringOutfit]);

      render(<ShipInfoDisplay ship={ship} />);
      // Movement section now uses accordions with labels like "max speed", "acceleration", "turning"
      expect(screen.getByText("max speed")).toBeInTheDocument();
    });

    it("does not render movement section when drag is undefined", () => {
      const ship = createTestShip();
      render(<ShipInfoDisplay ship={ship} />);
      expect(screen.queryByText("max speed")).not.toBeInTheDocument();
    });
  });

  describe("Outfit Space", () => {
    it("renders outfit space section when any capacity is defined", () => {
      const ship = createTestShip({
        attributes: {
          category: "Test",
          "outfit space": 100,
        },
      });
      render(<ShipInfoDisplay ship={ship} />);
      expect(screen.getByText("outfit space free")).toBeInTheDocument();
      expect(screen.getByText("100 / 100")).toBeInTheDocument();
    });

    it("renders weapon capacity when defined", () => {
      const ship = createTestShip({
        attributes: {
          category: "Test",
          "weapon capacity": 50,
        },
      });
      render(<ShipInfoDisplay ship={ship} />);
      expect(screen.getByText("weapon capacity")).toBeInTheDocument();
      expect(screen.getByText("50 / 50")).toBeInTheDocument();
    });

    it("renders engine capacity when defined", () => {
      const ship = createTestShip({
        attributes: {
          category: "Test",
          "engine capacity": 30,
        },
      });
      render(<ShipInfoDisplay ship={ship} />);
      expect(screen.getByText("engine capacity")).toBeInTheDocument();
      expect(screen.getByText("30 / 30")).toBeInTheDocument();
    });

    it("does not render outfit space section when all are undefined", () => {
      const ship = createTestShip();
      render(<ShipInfoDisplay ship={ship} />);
      expect(screen.queryByText("outfit space free:")).not.toBeInTheDocument();
    });
  });

  describe("Outfits List", () => {
    it("renders outfits list when ship has outfits", () => {
      const ship = createTestShip();
      const outfit1 = {
        name: "Laser Cannon",
        slug: "laser-cannon",
        attributes: {},
        descriptions: [],
      };
      const outfit2 = {
        name: "Shield Generator",
        slug: "shield-generator",
        attributes: {},
        descriptions: [],
      };
      const shipWithOutfits = ship
        .addOutfit(outfit1)
        .addOutfit(outfit1)
        .addOutfit(outfit2);
      render(<ShipInfoDisplay ship={shipWithOutfits} />);
      expect(screen.getByText("Outfits:")).toBeInTheDocument();
      // Outfits should be grouped - Laser Cannon should show with x2
      expect(screen.getByText(/Laser Cannon/)).toBeInTheDocument();
      expect(screen.getByText(/x2/)).toBeInTheDocument();
      expect(screen.getByText("Shield Generator")).toBeInTheDocument();
    });

    it("displays quantity for multiple outfits", () => {
      const ship = createTestShip();
      const outfit = {
        name: "Torpedo",
        slug: "torpedo",
        attributes: {},
        descriptions: [],
      };
      // Add 60 torpedoes
      let shipWithOutfits = ship;
      for (let i = 0; i < 60; i++) {
        shipWithOutfits = shipWithOutfits.addOutfit(outfit);
      }
      render(<ShipInfoDisplay ship={shipWithOutfits} />);
      expect(screen.getByText(/Torpedo/)).toBeInTheDocument();
      expect(screen.getByText(/x60/)).toBeInTheDocument();
    });

    it("does not display quantity for single outfit", () => {
      const ship = createTestShip();
      const outfit = {
        name: "Laser Cannon",
        slug: "laser-cannon",
        attributes: {},
        descriptions: [],
      };
      const shipWithOutfits = ship.addOutfit(outfit);
      render(<ShipInfoDisplay ship={shipWithOutfits} />);
      expect(screen.getByText("Laser Cannon")).toBeInTheDocument();
      // Should not show x1
      expect(screen.queryByText(/x1/)).not.toBeInTheDocument();
    });

    it("does not render outfits section when ship has no outfits", () => {
      const ship = createTestShip();
      render(<ShipInfoDisplay ship={ship} />);
      expect(screen.queryByText("Outfits:")).not.toBeInTheDocument();
    });
  });

  describe("Multiple Stats", () => {
    it("renders all defined stats", () => {
      const ship = createTestShip({
        attributes: {
          category: "Heavy Warship",
          cost: 5000000,
          shields: 10000,
          hull: 5000,
          mass: 2000,
          "cargo space": 150,
          "fuel capacity": 600,
          "required crew": 20,
          bunks: 40,
        },
      });
      render(<ShipInfoDisplay ship={ship} />);

      expect(screen.getByText("cost:")).toBeInTheDocument();
      // Accordion format uses labels without colons
      expect(screen.getByText("shields")).toBeInTheDocument();
      expect(screen.getByText("hull")).toBeInTheDocument();
      expect(screen.getByText("mass with no cargo")).toBeInTheDocument();
      expect(screen.getByText("cargo space")).toBeInTheDocument();
      expect(screen.getByText("fuel capacity")).toBeInTheDocument();
      expect(screen.getByText("required crew / bunks")).toBeInTheDocument();
    });
  });
});
