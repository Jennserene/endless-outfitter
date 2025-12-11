# Scripts Test Utilities

This directory contains reusable test utilities, mocks, fixtures, and helpers for testing scripts.

## Structure

- `__mocks__/` - Shared Jest mocks
- `__fixtures__/` - Reusable test data and factory functions
- `__helpers__/` - Test utility functions

## Usage

### Mocks

#### Logger Mock

```typescript
import { mockLogger, createMockLogger } from "../__mocks__";

// Use default mock logger
jest.mock("@/lib/logger", () => ({
  logger: mockLogger,
}));

// Or create custom logger
const customLogger = createMockLogger({
  info: jest.fn(),
  success: jest.fn(),
});
```

#### FS Mock

```typescript
import { mockFs } from "../__mocks__/fs";

jest.mock("fs", () => mockFs);
```

#### Paths Mock

```typescript
import { TEST_PATHS } from "../__mocks__/paths";

jest.mock("@scripts/utils/paths", () => TEST_PATHS);
```

#### Config Mock

```typescript
import { TEST_CONFIG } from "../__mocks__/config";

jest.mock("@config/game-version", () => ({
  GAME_VERSION: TEST_CONFIG.GAME_VERSION,
}));
```

### Fixtures

#### Parse Nodes

```typescript
import {
  createMockShipNode,
  createMockOutfitNode,
  TEST_SPECIES,
} from "../__fixtures__";

const shipNode = createMockShipNode("Test Ship", { mass: "100", drag: "0.1" });
const outfitNode = createMockOutfitNode("Test Outfit", {
  mass: "10",
  cost: "1000",
});
```

#### Metadata

```typescript
import { createMockMetadata } from "../__fixtures__";

const metadata = createMockMetadata("human", 5);
```

### Helpers

#### Process Exit Mock

```typescript
import { setupProcessExitMock, restoreProcessExitMock } from "../__helpers__";

describe("my test", () => {
  const mockExit = setupProcessExitMock();

  afterAll(() => {
    restoreProcessExitMock();
  });
});
```

#### Test Utils

```typescript
import { createMockSpeciesMap, createMockGameDataFiles } from "../__helpers__";

const speciesMap = createMockSpeciesMap([
  { name: "human", content: "ship Test Ship" },
  { name: "pug", content: "ship Another Ship" },
]);
```

## Common Patterns

### Mocking Logger

Most tests need logger mocks. Use the shared mock:

```typescript
jest.mock("@/lib/logger", () => ({
  logger: mockLogger,
}));
```

### Mocking FS Operations

When testing file system operations:

```typescript
jest.mock("fs", () => mockFs);

// In tests
(mockFs.existsSync as jest.Mock).mockReturnValue(true);
```

### Creating Parse Nodes

For parser tests, use the factory functions:

```typescript
const nodes = [
  createMockShipNode("Ship1", { mass: "100" }),
  createMockShipNode("Ship2", { mass: "200" }),
];
```

## Test Coverage

### Overview

The scripts directory has comprehensive test coverage. Run coverage analysis with:

```bash
npm run test:coverage
```

### Coverage Summary

This summary is only concerned with files that do not have 100% coverage

- **Files with partial coverage (>90%)**: 6 files
- **Files with 0% coverage**: 9 files

### Files with 0% Coverage

#### Entry Point Scripts (2 files)

These executable scripts run at module level, making them difficult to test directly. The underlying logic is fully tested:

- `scripts/generate-data.ts` - Entry point for data generation pipeline (underlying `DataGenerationPipeline` is fully tested)
- `scripts/validate-data.ts` - Entry point for data validation (validation functions are tested indirectly)

#### Type Definition Files (7 files)

TypeScript type definitions contain no executable code, so coverage is not applicable:

- `scripts/types/converter.ts`
- `scripts/types/data-file.ts`
- `scripts/types/game-data.ts`
- `scripts/types/index.ts`
- `scripts/types/metadata.ts`
- `scripts/types/parser.ts`
- `scripts/types/transformer.ts`

### Files with Partial Coverage

These files have good coverage (>90%) with some uncovered lines:

- `scripts/utils/paths.ts` - 94.73%
- `scripts/utils/file-io.ts` - 95.5%
- `scripts/transformers/attributes-normalizer.ts` - 95.91%
- `scripts/transformers/outfit-transformer.ts` - 96.92%
- `scripts/parsers/line-parser.ts` - 90.74%
- `scripts/parsers/game-data-parser.ts` - 98.24%

### Notes

- Entry point scripts are intentionally difficult to test as they execute at module level. The underlying business logic is fully covered.
- Type definition files don't require test coverage as they contain no executable code.
- Files with partial coverage may benefit from additional edge case tests, but current coverage is considered acceptable.
