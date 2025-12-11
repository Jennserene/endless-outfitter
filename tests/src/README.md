# React & Next.js Testing Best Practices

This guide outlines testing best practices for React components and Next.js applications, based on proven patterns from bulletproof-react.

## Testing Philosophy

**Focus on integration tests over unit tests.** While unit tests are useful for isolated components and complex logic, integration tests provide greater confidence that your application works correctly. Integration tests verify that different parts of your application work together, which is what matters most to users.

**Test like a user would use your app.** Use Testing Library's philosophy: test your app in a way it's being used by a real-world user, not by testing implementation details. For example:

- ✅ Test what renders on the screen
- ✅ Test user interactions (clicks, typing, etc.)
- ❌ Don't test internal state values
- ❌ Don't test implementation details

If you refactor your app (e.g., change state management), tests should still pass because the user-visible behavior shouldn't change.

## Types of Tests

### Unit Tests

Unit tests are the smallest tests you can write. They test individual parts of your application in isolation. Use them for:

- Shared components used throughout the application
- Complex logic in a single component
- Utility functions and hooks
- Pure functions

**Characteristics:**

- Fast to run
- Easy to write
- Test isolated functionality

**Example:** Testing a dialog component's open/close behavior, testing a custom hook's state management.

### Integration Tests

Integration tests check how different parts of your application work together. **Prioritize these for most of your testing** because they:

- Verify that components work together correctly
- Test complete user flows
- Provide high confidence in application reliability
- Catch issues that unit tests might miss

**Example:** Testing a complete flow of creating a discussion, viewing it, and deleting it.

### E2E Tests

End-to-End tests evaluate the application as a whole, simulating real user interactions across the entire system (frontend + backend). Use Playwright or similar tools for E2E testing.

## Recommended Tooling

### Jest

Jest is a powerful testing framework that works seamlessly with Next.js. It's the recommended testing framework for Next.js applications and provides excellent TypeScript support.

**Configuration:** See `jest.config.ts` in the project root for the complete Jest configuration.

### Testing Library

Testing Library provides utilities for testing React components. Key principles:

- Query by role, label, or text (accessible queries)
- Use `screen` for queries
- Use `userEvent` for interactions
- Use `waitFor` for async operations

**Key imports:**

```typescript
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
```

### MSW (Mock Service Worker)

MSW intercepts HTTP requests and returns mocked responses. Use it for:

- Testing API interactions without a real backend
- Creating consistent test data
- Testing error scenarios
- Prototyping frontend features

**Setup:**

```typescript
// src/testing/mocks/server.ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

**Note:** While bulletproof-react uses Vitest, this project uses Jest with Next.js. The testing patterns and best practices remain the same, but the configuration differs.

## Test Utilities

### Custom Render Function

Create a custom `renderApp` function that wraps your app providers:

```typescript
// src/testing/test-utils.tsx
import { render as rtlRender } from "@testing-library/react";
import { AppProvider } from "@/app/provider";

export const renderApp = async (
  ui: React.ReactElement,
  { user, ...renderOptions }: Record<string, any> = {}
) => {
  // Setup user authentication if needed
  const initializedUser = await initializeUser(user);

  return {
    ...rtlRender(ui, {
      wrapper: AppProvider,
      ...renderOptions,
    }),
    user: initializedUser,
  };
};

export * from "@testing-library/react";
export { userEvent };
```

### Helper Functions

Create reusable helper functions for common test operations:

```typescript
// Wait for loading states to finish
export const waitForLoadingToFinish = () =>
  waitForElementToBeRemoved(
    () => [
      ...screen.queryAllByTestId(/loading/i),
      ...screen.queryAllByText(/loading/i),
    ],
    { timeout: 4000 }
  );

// Create test data
export const createUser = async (userProperties?: any) => {
  const user = generateUser(userProperties);
  await db.user.create({ ...user, password: hash(user.password) });
  return user;
};
```

## Test Setup

### Setup File

Create a setup file that runs before all tests:

```typescript
// jest.setup.ts (or src/testing/setup-tests.ts)
import "@testing-library/jest-dom";
import { initializeDb, resetDb } from "@/testing/mocks/db";
import { server } from "@/testing/mocks/server";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/app",
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Setup MSW server
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterAll(() => {
  server.close();
});

beforeEach(() => {
  // Mock browser APIs
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  // Initialize test database
  initializeDb();
});

afterEach(() => {
  server.resetHandlers();
  resetDb();
  jest.clearAllMocks();
});
```

## Writing Tests

### Component Tests

**Simple component test (unit):**

```typescript
import { rtlRender, screen, userEvent, waitFor } from '@/testing/test-utils';
import { Dialog } from '../dialog';

test('should handle basic dialog flow', async () => {
  rtlRender(<Dialog />);

  expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Open' }));

  expect(await screen.findByText('Dialog Title')).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Close' }));

  await waitFor(() =>
    expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument(),
  );
});
```

**Integration test with app context:**

```typescript
import { renderApp, screen, userEvent, waitFor, waitForLoadingToFinish } from '@/testing/test-utils';
import { Discussions } from '../discussions';

test('should create, render and delete discussions', async () => {
  await renderApp(<Discussions />);

  await waitForLoadingToFinish();

  const newDiscussion = createDiscussion();

  // Create discussion
  await userEvent.click(
    screen.getByRole('button', { name: /create discussion/i }),
  );

  const drawer = await screen.findByRole('dialog', {
    name: /create discussion/i,
  });

  const titleField = within(drawer).getByLabelText(/title/i);
  await userEvent.type(titleField, newDiscussion.title);

  await userEvent.click(
    within(drawer).getByRole('button', { name: /submit/i }),
  );

  // Verify discussion appears
  const row = await screen.findByRole('row', {
    name: new RegExp(newDiscussion.title),
  });

  expect(
    within(row).getByRole('cell', { name: newDiscussion.title }),
  ).toBeInTheDocument();

  // Delete discussion
  await userEvent.click(
    within(row).getByRole('button', { name: /delete/i }),
  );

  const confirmationDialog = await screen.findByRole('dialog', {
    name: /delete/i,
  });

  await userEvent.click(
    within(confirmationDialog).getByRole('button', { name: /delete/i }),
  );

  await waitFor(() =>
    expect(
      within(row).queryByRole('cell', { name: newDiscussion.title }),
    ).not.toBeInTheDocument(),
  );
});
```

### Hook Tests

Use `renderHook` from Testing Library for custom hooks:

```typescript
import { renderHook, act } from "@testing-library/react";
import { useDisclosure } from "../use-disclosure";

test("should toggle the state", () => {
  const { result } = renderHook(() => useDisclosure());

  expect(result.current.isOpen).toBe(false);

  act(() => {
    result.current.toggle();
  });

  expect(result.current.isOpen).toBe(true);

  act(() => {
    result.current.toggle();
  });

  expect(result.current.isOpen).toBe(false);
});
```

### Function/Logic Tests

For pure functions and utility functions:

```typescript
import { canCreateDiscussion, canDeleteDiscussion } from "../authorization";

describe("Discussion Authorization", () => {
  const adminUser: User = {
    id: "1",
    role: "ADMIN",
  } as User;

  const regularUser: User = {
    id: "2",
    role: "USER",
  } as User;

  test("should allow admin to create discussions", () => {
    expect(canCreateDiscussion(adminUser)).toBe(true);
    expect(canCreateDiscussion(regularUser)).toBe(false);
    expect(canCreateDiscussion(null)).toBe(false);
    expect(canCreateDiscussion(undefined)).toBe(false);
  });
});
```

## Best Practices

### Query Priority

Use queries in this order (most preferred to least preferred):

1. **getByRole** - Most accessible, matches how users interact

   ```typescript
   screen.getByRole("button", { name: /submit/i });
   ```

2. **getByLabelText** - For form inputs

   ```typescript
   screen.getByLabelText(/email address/i);
   ```

3. **getByText** - For visible text content

   ```typescript
   screen.getByText(/welcome/i);
   ```

4. **getByTestId** - Last resort, only when necessary
   ```typescript
   screen.getByTestId("submit-button");
   ```

### User Interactions

Always use `userEvent` for interactions (not `fireEvent`):

```typescript
// ✅ Good
await userEvent.click(button);
await userEvent.type(input, "text");
await userEvent.selectOptions(select, "option");

// ❌ Avoid
fireEvent.click(button);
```

### Async Operations

Use `waitFor` for async operations and state changes:

```typescript
// Wait for element to appear
await waitFor(() => {
  expect(screen.getByText("Success")).toBeInTheDocument();
});

// Wait for element to disappear
await waitFor(() => {
  expect(screen.queryByText("Loading")).not.toBeInTheDocument();
});

// Use find queries (they automatically wait)
const element = await screen.findByText("Success");
```

### Scoping Queries

Use `within()` to scope queries to a specific container:

```typescript
const drawer = screen.getByRole("dialog");
const titleField = within(drawer).getByLabelText(/title/i);
const submitButton = within(drawer).getByRole("button", { name: /submit/i });
```

### Test Data

Use data generators for consistent test data:

```typescript
// src/testing/data-generators.ts
export const createUser = <T extends Partial<ReturnType<typeof generateUser>>>(
  overrides?: T
) => {
  return { ...generateUser(), ...overrides };
};

// In tests
const user = await createUser({ email: "test@example.com" });
```

### Mocking Next.js

Mock Next.js router and navigation hooks:

```typescript
// In jest.setup.ts or at the top of your test file
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/app",
  useSearchParams: () => ({
    get: jest.fn(),
    has: jest.fn(),
    getAll: jest.fn(),
  }),
}));
```

### API Mocking with MSW

Create handlers for API endpoints:

```typescript
// src/testing/mocks/handlers/auth.ts
import { http, HttpResponse } from "msw";
import { db } from "../db";

export const authHandlers = [
  http.post("/api/auth/login", async ({ request }) => {
    const { email, password } = await request.json();
    const user = db.user.findFirst({
      where: { email: { equals: email } },
    });

    if (user && user.password === hash(password)) {
      return HttpResponse.json({ user, token: "mock-token" });
    }

    return HttpResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }),
];
```

### Test Organization

- Place test files in `__tests__` directories next to the code they test
- Use descriptive test names: `should [expected behavior] when [condition]`
- Group related tests with `describe` blocks
- Keep tests focused on one behavior

```typescript
describe("LoginForm", () => {
  test("should login user with valid credentials", async () => {
    // ...
  });

  test("should show error with invalid credentials", async () => {
    // ...
  });

  test("should call onSuccess callback after successful login", async () => {
    // ...
  });
});
```

### Error Handling in Tests

Suppress expected console errors in tests:

```typescript
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});
```

## Common Patterns

### Testing Forms

```typescript
test("should submit form with valid data", async () => {
  await renderApp(<LoginForm />);

  await userEvent.type(
    screen.getByLabelText(/email/i),
    "user@example.com"
  );
  await userEvent.type(
    screen.getByLabelText(/password/i),
    "password123"
  );

  await userEvent.click(
    screen.getByRole("button", { name: /submit/i })
  );

  await waitFor(() => {
    expect(screen.getByText(/success/i)).toBeInTheDocument();
  });
});

// Testing with callbacks
test("should call onSuccess callback after successful login", async () => {
  const newUser = await createUser({ teamId: undefined });
  const onSuccess = jest.fn();

  await renderApp(<LoginForm onSuccess={onSuccess} />, { user: null });

  await userEvent.type(
    screen.getByLabelText(/email address/i),
    newUser.email
  );
  await userEvent.type(
    screen.getByLabelText(/password/i),
    newUser.password
  );

  await userEvent.click(
    screen.getByRole("button", { name: /log in/i })
  );

  await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
});
```

### Testing Authentication

```typescript
test("should require authentication", async () => {
  await renderApp(<ProtectedComponent />, { user: null });

  expect(screen.getByText(/please log in/i)).toBeInTheDocument();
});

test("should show content for authenticated user", async () => {
  const user = await createUser();
  await renderApp(<ProtectedComponent />, { user });

  expect(screen.getByText(/welcome/i)).toBeInTheDocument();
});
```

### Testing Loading States

```typescript
test("should show loading state then content", async () => {
  await renderApp(<DataComponent />);

  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  await waitForLoadingToFinish();

  expect(screen.getByText(/data loaded/i)).toBeInTheDocument();
});
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/test.tsx

# Run tests matching a pattern
npm test -- --testNamePattern="should login"
```

## References

- [Testing Library Documentation](https://testing-library.com/)
- [Jest Documentation](https://jestjs.io/)
- [Next.js Testing with Jest](https://nextjs.org/docs/pages/guides/testing/jest)
- [MSW Documentation](https://mswjs.io/)
- [Testing Library React Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
