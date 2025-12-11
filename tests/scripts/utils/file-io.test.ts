import {
  writeJsonFile,
  readExistingJsonFiles,
  type FileContentCache,
} from "@scripts/utils/file-io";
import { writeFileSync, mkdirSync, rmSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

describe("file-io", () => {
  let testDir: string;
  let testFilePath: string;

  beforeEach(() => {
    // Create a temporary directory for each test
    testDir = join(tmpdir(), `file-io-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
    testFilePath = join(testDir, "test.json");
  });

  afterEach(() => {
    // Clean up temporary directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("writeJsonFile", () => {
    it("When file does not exist, Then should write the file", () => {
      // Arrange
      const data = { test: "data" };

      // Act
      const result = writeJsonFile(testFilePath, data);

      // Assert
      expect(result).toBe(true);
      expect(existsSync(testFilePath)).toBe(true);
    });

    it("When file exists and content is identical (ignoring generatedAt), Then should skip writing", () => {
      // Arrange
      const existingData = {
        metadata: {
          version: "v1.0.0",
          schemaVersion: "1.0-v1.0.0",
          species: "human",
          generatedAt: "2024-01-01T00:00:00.000Z",
          itemCount: 5,
        },
        data: [{ id: 1, name: "test" }],
      };
      const newData = {
        metadata: {
          version: "v1.0.0",
          schemaVersion: "1.0-v1.0.0",
          species: "human",
          generatedAt: "2024-12-11T12:00:00.000Z", // Different timestamp
          itemCount: 5,
        },
        data: [{ id: 1, name: "test" }],
      };

      // Write existing file
      writeFileSync(
        testFilePath,
        JSON.stringify(existingData, null, 2) + "\n",
        "utf-8"
      );

      // Create cache with existing content
      const cache: FileContentCache = new Map();
      cache.set(testFilePath, existingData);

      // Act
      const result = writeJsonFile(testFilePath, newData, cache);

      // Assert
      expect(result).toBe(false); // File was not written
      const fileContent = JSON.parse(readFileSync(testFilePath, "utf-8"));
      expect(fileContent.metadata.generatedAt).toBe("2024-01-01T00:00:00.000Z"); // Original timestamp preserved
    });

    it("When file exists and data content differs, Then should write the file", () => {
      // Arrange
      const existingData = {
        metadata: {
          version: "v1.0.0",
          schemaVersion: "1.0-v1.0.0",
          species: "human",
          generatedAt: "2024-01-01T00:00:00.000Z",
          itemCount: 5,
        },
        data: [{ id: 1, name: "old" }],
      };
      const newData = {
        metadata: {
          version: "v1.0.0",
          schemaVersion: "1.0-v1.0.0",
          species: "human",
          generatedAt: "2024-12-11T12:00:00.000Z",
          itemCount: 5,
        },
        data: [{ id: 1, name: "new" }], // Different data
      };

      // Write existing file
      writeFileSync(
        testFilePath,
        JSON.stringify(existingData, null, 2) + "\n",
        "utf-8"
      );

      // Create cache with existing content
      const cache: FileContentCache = new Map();
      cache.set(testFilePath, existingData);

      // Act
      const result = writeJsonFile(testFilePath, newData, cache);

      // Assert
      expect(result).toBe(true); // File was written
      const fileContent = JSON.parse(readFileSync(testFilePath, "utf-8"));
      expect(fileContent.data[0].name).toBe("new");
    });

    it("When cache is not provided, Then should always write the file", () => {
      // Arrange
      const data = { test: "data" };

      // Act
      const result = writeJsonFile(testFilePath, data);

      // Assert
      expect(result).toBe(true);
      expect(existsSync(testFilePath)).toBe(true);
    });

    it("When file path not in cache, Then should write the file", () => {
      // Arrange
      const data = { test: "data" };
      const cache: FileContentCache = new Map();

      // Act
      const result = writeJsonFile(testFilePath, data, cache);

      // Assert
      expect(result).toBe(true);
      expect(existsSync(testFilePath)).toBe(true);
    });
  });

  describe("readExistingJsonFiles", () => {
    it("When directory does not exist, Then should return empty cache", () => {
      // Arrange
      const nonExistentDir = join(testDir, "nonexistent");

      // Act
      const result = readExistingJsonFiles(nonExistentDir);

      // Assert
      expect(result.size).toBe(0);
    });

    it("When directory exists with JSON files, Then should read and cache all files", () => {
      // Arrange
      const file1 = join(testDir, "file1.json");
      const file2 = join(testDir, "file2.json");
      const data1 = { test: "data1" };
      const data2 = { test: "data2" };

      writeFileSync(file1, JSON.stringify(data1, null, 2), "utf-8");
      writeFileSync(file2, JSON.stringify(data2, null, 2), "utf-8");

      // Act
      const result = readExistingJsonFiles(testDir);

      // Assert
      expect(result.size).toBe(2);
      expect(result.get(file1)).toEqual(data1);
      expect(result.get(file2)).toEqual(data2);
    });

    it("When directory contains non-JSON files, Then should ignore them", () => {
      // Arrange
      const jsonFile = join(testDir, "file.json");
      const txtFile = join(testDir, "file.txt");

      writeFileSync(jsonFile, JSON.stringify({ test: "data" }), "utf-8");
      writeFileSync(txtFile, "not json", "utf-8");

      // Act
      const result = readExistingJsonFiles(testDir);

      // Assert
      expect(result.size).toBe(1);
      expect(result.has(jsonFile)).toBe(true);
      expect(result.has(txtFile)).toBe(false);
    });

    it("When directory contains invalid JSON files, Then should skip them", () => {
      // Arrange
      const validFile = join(testDir, "valid.json");
      const invalidFile = join(testDir, "invalid.json");

      writeFileSync(validFile, JSON.stringify({ test: "data" }), "utf-8");
      writeFileSync(invalidFile, "not valid json {", "utf-8");

      // Act
      const result = readExistingJsonFiles(testDir);

      // Assert
      expect(result.size).toBe(1);
      expect(result.has(validFile)).toBe(true);
      expect(result.has(invalidFile)).toBe(false);
    });

    it("When reading files with GeneratedDataFile structure, Then should preserve structure", () => {
      // Arrange
      const file = join(testDir, "test.json");
      const data = {
        metadata: {
          version: "v1.0.0",
          schemaVersion: "1.0-v1.0.0",
          species: "human",
          generatedAt: "2024-01-01T00:00:00.000Z",
          itemCount: 2,
        },
        data: [{ id: 1 }, { id: 2 }],
      };

      writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");

      // Act
      const result = readExistingJsonFiles(testDir);

      // Assert
      expect(result.size).toBe(1);
      const cached = result.get(file);
      expect(cached).toEqual(data);
      expect((cached as typeof data).metadata.generatedAt).toBe(
        "2024-01-01T00:00:00.000Z"
      );
    });
  });
});
