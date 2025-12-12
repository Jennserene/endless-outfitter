import { ShipTransformer } from "@scripts/transformers/ship-transformer";
import { AttributesNormalizer } from "@scripts/transformers/attributes-normalizer";
import { NumericNormalizer } from "@scripts/transformers/numeric-normalizer";
import { LicensesExtractor } from "@scripts/transformers/licenses-extractor";
import { OutfitsListTransformer } from "@scripts/transformers/outfits-list-transformer";
import { DescriptionsExtractor } from "@scripts/transformers/descriptions-extractor";
import { SpriteThumbnailExtractor } from "@scripts/transformers/sprite-thumbnail-extractor";

// Mock all transformer dependencies
jest.mock("@scripts/transformers/attributes-normalizer");
jest.mock("@scripts/transformers/numeric-normalizer");
jest.mock("@scripts/transformers/licenses-extractor");
jest.mock("@scripts/transformers/outfits-list-transformer");
jest.mock("@scripts/transformers/descriptions-extractor");
jest.mock("@scripts/transformers/sprite-thumbnail-extractor");

describe("ShipTransformer", () => {
  let transformer: ShipTransformer;
  let mockAttributesNormalizer: jest.Mocked<AttributesNormalizer>;
  let mockNumericNormalizer: jest.Mocked<NumericNormalizer>;
  let mockLicensesExtractor: jest.Mocked<LicensesExtractor>;
  let mockOutfitsListTransformer: jest.Mocked<OutfitsListTransformer>;
  let mockDescriptionsExtractor: jest.Mocked<DescriptionsExtractor>;
  let mockSpriteThumbnailExtractor: jest.Mocked<SpriteThumbnailExtractor>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAttributesNormalizer = {
      transform: jest.fn(),
    } as unknown as jest.Mocked<AttributesNormalizer>;
    mockNumericNormalizer = {
      transform: jest.fn(),
    } as unknown as jest.Mocked<NumericNormalizer>;
    mockLicensesExtractor = {
      transform: jest.fn(),
    } as unknown as jest.Mocked<LicensesExtractor>;
    mockOutfitsListTransformer = {
      transform: jest.fn(),
    } as unknown as jest.Mocked<OutfitsListTransformer>;
    mockDescriptionsExtractor = {
      transform: jest.fn(),
    } as unknown as jest.Mocked<DescriptionsExtractor>;
    mockSpriteThumbnailExtractor = {
      transform: jest.fn(),
    } as unknown as jest.Mocked<SpriteThumbnailExtractor>;

    (
      AttributesNormalizer as jest.MockedClass<typeof AttributesNormalizer>
    ).mockImplementation(() => mockAttributesNormalizer);
    (
      NumericNormalizer as jest.MockedClass<typeof NumericNormalizer>
    ).mockImplementation(() => mockNumericNormalizer);
    (
      LicensesExtractor as jest.MockedClass<typeof LicensesExtractor>
    ).mockImplementation(() => mockLicensesExtractor);
    (
      OutfitsListTransformer as jest.MockedClass<typeof OutfitsListTransformer>
    ).mockImplementation(() => mockOutfitsListTransformer);
    (
      DescriptionsExtractor as jest.MockedClass<typeof DescriptionsExtractor>
    ).mockImplementation(() => mockDescriptionsExtractor);
    (
      SpriteThumbnailExtractor as jest.MockedClass<
        typeof SpriteThumbnailExtractor
      >
    ).mockImplementation(() => mockSpriteThumbnailExtractor);

    transformer = new ShipTransformer();
  });

  describe("transform", () => {
    it("When transforming ship, Then should chain all transformers in order", () => {
      // Arrange
      const input = { name: "Test Ship" };
      const step1 = { name: "Test Ship", step1: true };
      const step2 = { name: "Test Ship", step2: true };
      const step3 = { name: "Test Ship", step3: true };
      const step4 = { name: "Test Ship", step4: true };
      const step5 = { name: "Test Ship", step5: true };
      const step6 = {
        name: "Test Ship",
        sprite: "sprite.png",
        thumbnail: "thumb.png",
        attributes: {},
        outfits: [],
        descriptions: [],
      };

      mockAttributesNormalizer.transform.mockReturnValue(step1);
      mockNumericNormalizer.transform.mockReturnValue(step2);
      mockLicensesExtractor.transform.mockReturnValue(step3);
      mockOutfitsListTransformer.transform.mockReturnValue(step4);
      mockDescriptionsExtractor.transform.mockReturnValue(step5);
      mockSpriteThumbnailExtractor.transform.mockReturnValue(step6);

      // Act
      transformer.transform(input);

      // Assert
      expect(mockAttributesNormalizer.transform).toHaveBeenCalledWith(input);
      expect(mockNumericNormalizer.transform).toHaveBeenCalledWith(step1);
      expect(mockLicensesExtractor.transform).toHaveBeenCalledWith(step2);
      expect(mockOutfitsListTransformer.transform).toHaveBeenCalledWith(step3);
      expect(mockDescriptionsExtractor.transform).toHaveBeenCalledWith(step4);
      expect(mockSpriteThumbnailExtractor.transform).toHaveBeenCalledWith(
        step5
      );
    });

    it("When final result has extra fields, Then should extract only schema fields", () => {
      // Arrange
      const finalTransformed = {
        name: "Test Ship",
        plural: "Test Ships",
        sprite: "sprite.png",
        thumbnail: "thumb.png",
        attributes: { mass: 100 },
        outfits: [{ name: "Engine", quantity: 1 }],
        descriptions: ["A test ship"],
        extraField: "should be removed",
      };

      mockAttributesNormalizer.transform.mockReturnValue({});
      mockNumericNormalizer.transform.mockReturnValue({});
      mockLicensesExtractor.transform.mockReturnValue({});
      mockOutfitsListTransformer.transform.mockReturnValue({});
      mockDescriptionsExtractor.transform.mockReturnValue({});
      mockSpriteThumbnailExtractor.transform.mockReturnValue(finalTransformed);

      // Act
      const result = transformer.transform({});

      // Assert
      expect(result).toEqual({
        name: "Test Ship",
        plural: "Test Ships",
        sprite: "sprite.png",
        thumbnail: "thumb.png",
        slug: "test-ship",
        attributes: { mass: 100 },
        outfits: [{ name: "Engine", quantity: 1 }],
        descriptions: ["A test ship"],
      });
      expect(result).not.toHaveProperty("extraField");
    });

    it("When fields are undefined, Then should handle gracefully", () => {
      // Arrange
      const finalTransformed = {
        name: "Test Ship",
      };

      mockAttributesNormalizer.transform.mockReturnValue({});
      mockNumericNormalizer.transform.mockReturnValue({});
      mockLicensesExtractor.transform.mockReturnValue({});
      mockOutfitsListTransformer.transform.mockReturnValue({});
      mockDescriptionsExtractor.transform.mockReturnValue({});
      mockSpriteThumbnailExtractor.transform.mockReturnValue(finalTransformed);

      // Act
      const result = transformer.transform({});

      // Assert
      expect(result).toEqual({
        name: "Test Ship",
        plural: undefined,
        sprite: undefined,
        thumbnail: undefined,
        slug: "test-ship",
        attributes: undefined,
        outfits: undefined,
        descriptions: undefined,
      });
    });
  });
});
