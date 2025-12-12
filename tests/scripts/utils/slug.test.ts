import { slugify } from "@scripts/utils/slug";

describe("slug", () => {
  describe("slugify", () => {
    it("When input is simple name, Then should convert to lowercase with hyphens", () => {
      // Act
      const result = slugify("Kestrel");

      // Assert
      expect(result).toBe("kestrel");
    });

    it("When input has spaces, Then should replace spaces with hyphens", () => {
      // Act
      const result = slugify("Heavy Laser Turret");

      // Assert
      expect(result).toBe("heavy-laser-turret");
    });

    it("When input has multiple spaces, Then should replace with single hyphen", () => {
      // Act
      const result = slugify("Heavy   Laser    Turret");

      // Assert
      expect(result).toBe("heavy-laser-turret");
    });

    it("When input has leading/trailing spaces, Then should trim them", () => {
      // Act
      const result = slugify("  Kestrel  ");

      // Assert
      expect(result).toBe("kestrel");
    });

    it("When input has special characters, Then should remove them", () => {
      // Act
      const result = slugify("R01 Skirmish Battery!");

      // Assert
      expect(result).toBe("r01-skirmish-battery");
    });

    it("When input has mixed case, Then should convert to lowercase", () => {
      // Act
      const result = slugify("HeAvY lAsEr TuRrEt");

      // Assert
      expect(result).toBe("heavy-laser-turret");
    });

    it("When input has consecutive hyphens, Then should collapse to single hyphen", () => {
      // Act
      const result = slugify("Heavy--Laser---Turret");

      // Assert
      expect(result).toBe("heavy-laser-turret");
    });

    it("When input has leading/trailing hyphens, Then should remove them", () => {
      // Act
      const result = slugify("-Kestrel-");

      // Assert
      expect(result).toBe("kestrel");
    });

    it("When input is empty string, Then should return empty string", () => {
      // Act
      const result = slugify("");

      // Assert
      expect(result).toBe("");
    });

    it("When input is only spaces, Then should return empty string", () => {
      // Act
      const result = slugify("   ");

      // Assert
      expect(result).toBe("");
    });

    it("When input is only special characters, Then should return empty string", () => {
      // Act
      const result = slugify("!@#$%^&*()");

      // Assert
      expect(result).toBe("");
    });

    it("When input has numbers, Then should preserve them", () => {
      // Act
      const result = slugify("R01 Skirmish Battery");

      // Assert
      expect(result).toBe("r01-skirmish-battery");
    });

    it("When input has hyphens already, Then should preserve them", () => {
      // Act
      const result = slugify("Heavy-Laser-Turret");

      // Assert
      expect(result).toBe("heavy-laser-turret");
    });

    it("When input is null, Then should return empty string", () => {
      // Act
      const result = slugify(null as unknown as string);

      // Assert
      expect(result).toBe("");
    });

    it("When input is undefined, Then should return empty string", () => {
      // Act
      const result = slugify(undefined as unknown as string);

      // Assert
      expect(result).toBe("");
    });

    it("When input is not a string, Then should return empty string", () => {
      // Act
      const result = slugify(123 as unknown as string);

      // Assert
      expect(result).toBe("");
    });

    it("When input has complex name with special characters, Then should handle correctly", () => {
      // Act
      const result = slugify("R01 Skirmish Battery (Advanced)!");

      // Assert
      expect(result).toBe("r01-skirmish-battery-advanced");
    });
  });
});
