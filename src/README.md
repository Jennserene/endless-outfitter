# 🏗️ Application Architecture Guide

This guide outlines the architectural patterns and best practices for the Endless Outfitter Next.js application. It follows modern React and Next.js best practices, emphasizing maintainability, scalability, and performance.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Server vs Client Components](#server-vs-client-components)
3. [Feature-Based Organization](#feature-based-organization)
4. [State Management](#state-management)
5. [Data Access Patterns](#data-access-patterns)
6. [Component Patterns](#component-patterns)
7. [Testing Patterns](#testing-patterns)
8. [File Naming Conventions](#file-naming-conventions)
9. [Import Rules](#import-rules)
10. [Best Practices](#best-practices)

---

## Project Structure

The application follows a feature-based architecture with clear separation of concerns. Here's the recommended folder structure:

```
src/
├── app/                    # Next.js App Router pages and layouts
│   ├── layout.tsx         # Root layout (Server Component)
│   ├── page.tsx           # Home page
│   ├── provider.tsx       # Global providers (Client Component wrapper)
│   └── [feature]/         # Feature-specific routes
│       ├── layout.tsx     # Feature layout (if needed)
│       ├── page.tsx       # Feature page (Server Component)
│       └── _components/   # Page-specific components (Client Components)
│
├── assets/                # Static assets and data files
│   ├── data/              # JSON data files (ships, outfits)
│   │   ├── ships/
│   │   └── outfits/
│   ├── images/            # Image files
│   └── fonts/             # Font files
│
├── components/            # Shared components used across the entire application
│   ├── ui/                # Reusable UI components (buttons, dialogs, etc.)
│   ├── layouts/           # Layout components
│   └── errors/            # Error boundary components
│
├── config/                # Global configurations
│   ├── env.ts             # Environment variables
│   └── paths.ts           # Route path constants
│
├── features/              # Feature-based modules (main application logic)
│   └── [feature-name]/    # Each feature is self-contained
│       ├── components/     # Feature-specific components
│       ├── hooks/         # Feature-specific hooks
│       ├── types/         # Feature-specific TypeScript types
│       └── utils/         # Feature-specific utilities
│
├── hooks/                 # Shared hooks used across the entire application
│
├── lib/                   # Reusable libraries preconfigured for the application
│   ├── game-data.ts       # Game data access utilities (SERVER-ONLY)
│   ├── loaders/           # Data loaders (SERVER-ONLY)
│   └── logger/            # Logging utilities
│
├── stores/                # Global state stores (React Context)
│   └── [store-name]/      # Individual context stores
│       ├── context.tsx     # Context definition
│       ├── provider.tsx   # Context provider
│       └── hooks.ts        # Custom hooks for consuming context
│
├── types/                 # Shared TypeScript types
│
├── utils/                 # Shared utility functions
│
└── testing/               # Test utilities and mocks
    ├── test-utils.tsx     # Testing utilities
    └── data-generators.ts  # Test data generators
```

### Key Principles

1. **Feature-Based Organization**: Most application logic lives in `features/` folders, keeping related code together
2. **Unidirectional Data Flow**: Code flows from shared → features → app (shared code can be used anywhere, features are independent, app composes features)
3. **Colocation**: Keep related code (components, hooks, types) as close as possible to where it's used
4. **Separation of Concerns**: Clear boundaries between server and client code, data access and UI

---

## Server vs Client Components

Next.js 14 uses React Server Components by default. Understanding when to use Server vs Client Components is crucial for performance and security.

### Server Components (Default)

**Use Server Components for:**

- Data fetching
- Accessing backend resources (file system, databases)
- Keeping sensitive information on the server (API keys, tokens)
- Large dependencies that should reduce client bundle size
- Static content

**Characteristics:**

- No `"use client"` directive
- Cannot use React hooks (`useState`, `useEffect`, etc.)
- Cannot use browser-only APIs
- Can directly import and use server-only modules

**Example:**

```typescript
// app/ships/page.tsx (Server Component)
import { getShips } from '@/lib/game-data';

export default async function ShipsPage() {
  // This runs on the server only
  const ships = await getShips();

  return (
    <div>
      <h1>Ships</h1>
      <ShipsList ships={ships} />
    </div>
  );
}
```

### Client Components

**Use Client Components for:**

- Interactivity and event listeners (`onClick`, `onChange`, etc.)
- State and lifecycle effects (`useState`, `useEffect`, `useReducer`)
- Browser-only APIs (`window`, `localStorage`, etc.)
- Custom hooks that depend on state or effects
- Third-party libraries that require client-side JavaScript

**Characteristics:**

- Must have `"use client"` directive at the top
- Can use all React hooks
- Can access browser APIs
- Cannot directly import server-only modules

**Example:**

```typescript
// components/ui/button.tsx (Client Component)
'use client';

import { useState } from 'react';

export function Button({ children, onClick }: ButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      onClick={() => {
        setIsPressed(true);
        onClick?.();
      }}
    >
      {children}
    </button>
  );
}
```

### Server-Only Modules

For files that should **never** run on the client (e.g., database access, file system operations), use the `server-only` package:

```typescript
// lib/game-data.ts
import "server-only";

import { loadShips } from "./loaders/data-loader";

export function getShips() {
  // This will throw an error if imported in a client component
  return loadShips();
}
```

**Installation:**

```bash
npm install server-only
```

### Component Composition Pattern

The recommended pattern is to have Server Components fetch data and pass it to Client Components:

```typescript
// app/ships/page.tsx (Server Component)
import { getShips } from '@/lib/game-data';
import { ShipsList } from './_components/ships-list';

export default async function ShipsPage() {
  const ships = await getShips(); // Server-side data fetching

  return <ShipsList ships={ships} />; // Pass data to client component
}
```

```typescript
// app/ships/_components/ships-list.tsx (Client Component)
'use client';

import { useState } from 'react';

export function ShipsList({ ships }: { ships: Ship[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Client-side interactivity
  const filteredShips = ships.filter(ship =>
    ship.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <ul>
        {filteredShips.map(ship => (
          <li key={ship.id}>{ship.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Feature-Based Organization

Features are self-contained modules that encapsulate all code related to a specific functionality. Each feature should be independent and not import from other features.

### Feature Structure

```
features/
└── ship-outfitting/          # Feature name (kebab-case)
    ├── components/           # Feature-specific components
    │   ├── outfit-selector.tsx
    │   └── ship-stats.tsx
    ├── hooks/                # Feature-specific hooks
    │   └── use-outfit-ship.ts
    ├── types/                # Feature-specific types
    │   └── index.ts
    └── utils/                # Feature-specific utilities
        └── calculate-stats.ts
```

### Feature Guidelines

1. **Self-Contained**: A feature should contain everything it needs to function
2. **No Cross-Feature Imports**: Features should not import from other features
3. **Shared Code**: Use `components/`, `hooks/`, `utils/`, `types/` for shared code
4. **Composition at App Level**: Compose features together in `app/` routes

### Example Feature

```typescript
// features/ship-outfitting/types/index.ts
export type OutfittedShip = {
  ship: Ship;
  outfits: Outfit[];
  stats: ShipStats;
};

// features/ship-outfitting/hooks/use-outfit-ship.ts
'use client';

import { useState } from 'react';
import type { OutfittedShip } from '../types';

export function useOutfitShip(initialShip: Ship) {
  const [outfits, setOutfits] = useState<Outfit[]>([]);

  const addOutfit = (outfit: Outfit) => {
    setOutfits(prev => [...prev, outfit]);
  };

  const removeOutfit = (outfitId: string) => {
    setOutfits(prev => prev.filter(o => o.id !== outfitId));
  };

  return {
    outfits,
    addOutfit,
    removeOutfit,
  };
}

// features/ship-outfitting/components/outfit-selector.tsx
'use client';

import { useOutfitShip } from '../hooks/use-outfit-ship';

export function OutfitSelector({ ship }: { ship: Ship }) {
  const { outfits, addOutfit, removeOutfit } = useOutfitShip(ship);

  return (
    <div>
      {/* Outfit selection UI */}
    </div>
  );
}
```

---

## State Management

This application uses React's built-in Context API for global state management. No external state management libraries are required.

### State Categories

1. **Component State**: Use `useState` or `useReducer` for component-local state
2. **Application State**: Use React Context for global state (theme, user preferences, etc.)
3. **URL State**: Use Next.js router for state in the URL (filters, search params)

### Global State Pattern

Create context stores in `stores/`:

```
stores/
└── app-state/
    ├── context.tsx         # Context definition
    ├── provider.tsx        # Context provider component
    └── hooks.ts            # Custom hooks for consuming context
```

**Example Global Store:**

```typescript
// stores/app-state/context.tsx
"use client";

import { createContext, useContext } from "react";

type AppState = {
  theme: "light" | "dark";
  savedShips: OutfittedShip[];
};

type AppStateContextValue = {
  state: AppState;
  setTheme: (theme: "light" | "dark") => void;
  saveShip: (ship: OutfittedShip) => void;
  removeShip: (shipId: string) => void;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export { AppStateContext };
export type { AppState, AppStateContextValue };
```

```typescript
// stores/app-state/provider.tsx
'use client';

import { useState, useCallback } from 'react';
import { AppStateContext, type AppState, type AppStateContextValue } from './context';

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    theme: 'light',
    savedShips: [],
  });

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    setState(prev => ({ ...prev, theme }));
  }, []);

  const saveShip = useCallback((ship: OutfittedShip) => {
    setState(prev => ({
      ...prev,
      savedShips: [...prev.savedShips, ship],
    }));
  }, []);

  const removeShip = useCallback((shipId: string) => {
    setState(prev => ({
      ...prev,
      savedShips: prev.savedShips.filter(s => s.id !== shipId),
    }));
  }, []);

  const value: AppStateContextValue = {
    state,
    setTheme,
    saveShip,
    removeShip,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}
```

```typescript
// stores/app-state/hooks.ts
"use client";

import { useContext } from "react";
import { AppStateContext, type AppStateContextValue } from "./context";

export function useAppState(): AppStateContextValue {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return context;
}
```

**Using the Store:**

```typescript
// app/provider.tsx (Client Component wrapper)
'use client';

import { AppStateProvider } from '@/stores/app-state/provider';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppStateProvider>
      {children}
    </AppStateProvider>
  );
}
```

```typescript
// app/layout.tsx (Server Component)
import { AppProvider } from './provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
```

```typescript
// Any component using the store
'use client';

import { useAppState } from '@/stores/app-state/hooks';

export function ThemeToggle() {
  const { state, setTheme } = useAppState();

  return (
    <button onClick={() => setTheme(state.theme === 'light' ? 'dark' : 'light')}>
      Toggle Theme
    </button>
  );
}
```

### Local Storage Integration

For persisting state to `localStorage`, use `useEffect` in the provider:

```typescript
// stores/app-state/provider.tsx
"use client";

import { useState, useEffect, useCallback } from "react";

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    // Initialize from localStorage if available
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("app-state");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Invalid JSON, use default
        }
      }
    }
    return { theme: "light", savedShips: [] };
  });

  // Persist to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("app-state", JSON.stringify(state));
    }
  }, [state]);

  // ... rest of provider
}
```

---

## Data Access Patterns

Since this application uses static JSON files (no database), data access is straightforward.

### Data File Organization

Move data files to `assets/data/` for better organization:

```
assets/
└── data/
    ├── ships/
    │   ├── ships-human.json
    │   ├── ships-hai.json
    │   └── ...
    └── outfits/
        ├── outfits-human.json
        ├── outfits-hai.json
        └── ...
```

### Server-Only Data Access

All data loading should happen in server-only modules:

```typescript
// lib/game-data.ts
import "server-only";

import { loadShips, loadOutfits } from "./loaders/data-loader";

/**
 * Get all ships from generated data files.
 * SERVER-ONLY: This function can only be called from Server Components or API routes.
 */
export function getShips(): Ship[] {
  return loadShips();
}

/**
 * Get all outfits from generated data files.
 * SERVER-ONLY: This function can only be called from Server Components or API routes.
 */
export function getOutfits(): Outfit[] {
  return loadOutfits();
}
```

### Using Data in Server Components

```typescript
// app/ships/page.tsx
import { getShips } from '@/lib/game-data';

export default async function ShipsPage() {
  const ships = await getShips(); // Server-side only

  return <ShipsList ships={ships} />;
}
```

### Using Data in Client Components

If client components need data, pass it as props from Server Components:

```typescript
// ✅ Good: Data passed from Server Component
// app/ships/page.tsx (Server Component)
import { getShips } from '@/lib/game-data';
import { ShipsList } from './_components/ships-list';

export default async function ShipsPage() {
  const ships = await getShips();
  return <ShipsList ships={ships} />;
}

// ❌ Bad: Direct data access in Client Component
// app/ships/_components/ships-list.tsx
'use client';
import { getShips } from '@/lib/game-data'; // ❌ ERROR: server-only module

export function ShipsList() {
  const ships = getShips(); // ❌ This will throw an error
  // ...
}
```

### API Routes (Optional)

If you need to expose data via API endpoints (for future use or external access):

```typescript
// app/api/ships/route.ts
import { getShips } from "@/lib/game-data";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const ships = getShips();
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    let result = ships;
    if (name) {
      result = ships.filter((ship) =>
        ship.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    return NextResponse.json({ count: result.length, ships: result });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load ships" },
      { status: 500 }
    );
  }
}
```

---

## Component Patterns

### Component Organization

1. **Shared Components** (`components/`): Reusable UI components used across features
2. **Feature Components** (`features/[feature]/components/`): Components specific to a feature
3. **Page Components** (`app/[route]/_components/`): Components specific to a page/route

### Component Best Practices

1. **Colocation**: Keep components close to where they're used
2. **Small Components**: Keep components focused and under 200 lines
3. **Composition**: Use composition over large prop lists
4. **Separation of Concerns**: Separate data fetching (Server) from interactivity (Client)

### Component Structure

```typescript
// components/ui/button/button.tsx
'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'base-button-styles',
          variant === 'primary' && 'primary-styles',
          variant === 'secondary' && 'secondary-styles',
          size === 'sm' && 'small-styles',
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
```

### Page Component Pattern

```typescript
// app/ships/page.tsx (Server Component - data fetching)
import { getShips } from '@/lib/game-data';
import { ShipsPageClient } from './_components/ships-page-client';

export const metadata = {
  title: 'Ships',
  description: 'Browse all available ships',
};

export default async function ShipsPage() {
  const ships = await getShips();

  return <ShipsPageClient ships={ships} />;
}
```

```typescript
// app/ships/_components/ships-page-client.tsx (Client Component - interactivity)
'use client';

import { useState } from 'react';
import { ShipsList } from '@/features/ships/components/ships-list';
import { ShipSearch } from '@/features/ships/components/ship-search';

export function ShipsPageClient({ ships }: { ships: Ship[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div>
      <ShipSearch value={searchTerm} onChange={setSearchTerm} />
      <ShipsList ships={ships} searchTerm={searchTerm} />
    </div>
  );
}
```

---

## Testing Patterns

This application focuses on **unit testing only** (no integration or e2e tests at this time).

### Testing Setup

Tests should be colocated with the code they test:

```
components/
└── ui/
    └── button/
        ├── button.tsx
        └── __tests__/
            └── button.test.tsx

features/
└── ship-outfitting/
    └── components/
        ├── outfit-selector.tsx
        └── __tests__/
            └── outfit-selector.test.tsx
```

### Unit Test Structure

```typescript
// components/ui/button/__tests__/button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../button';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByText('Click me'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant classes correctly', () => {
    const { container } = render(<Button variant="primary">Click me</Button>);
    expect(container.firstChild).toHaveClass('primary-styles');
  });
});
```

### Testing Hooks

```typescript
// features/ship-outfitting/hooks/__tests__/use-outfit-ship.test.ts
import { renderHook, act } from "@testing-library/react";
import { useOutfitShip } from "../use-outfit-ship";

describe("useOutfitShip", () => {
  const mockShip: Ship = {
    id: "1",
    name: "Test Ship",
    // ... other ship properties
  };

  it("initializes with empty outfits", () => {
    const { result } = renderHook(() => useOutfitShip(mockShip));
    expect(result.current.outfits).toEqual([]);
  });

  it("adds outfit correctly", () => {
    const { result } = renderHook(() => useOutfitShip(mockShip));
    const mockOutfit: Outfit = { id: "1", name: "Test Outfit" };

    act(() => {
      result.current.addOutfit(mockOutfit);
    });

    expect(result.current.outfits).toHaveLength(1);
    expect(result.current.outfits[0]).toEqual(mockOutfit);
  });

  it("removes outfit correctly", () => {
    const { result } = renderHook(() => useOutfitShip(mockShip));
    const mockOutfit: Outfit = { id: "1", name: "Test Outfit" };

    act(() => {
      result.current.addOutfit(mockOutfit);
      result.current.removeOutfit("1");
    });

    expect(result.current.outfits).toHaveLength(0);
  });
});
```

### Testing Utilities

Create reusable test utilities:

```typescript
// testing/test-utils.tsx
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AppProvider } from '@/app/provider';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <AppProvider>{children}</AppProvider>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

### Test Data Generators

Create factories for test data:

```typescript
// testing/data-generators.ts
import type { Ship, Outfit } from "@/types";

export function createMockShip(overrides?: Partial<Ship>): Ship {
  return {
    id: "1",
    name: "Test Ship",
    hull: 100,
    // ... default ship properties
    ...overrides,
  };
}

export function createMockOutfit(overrides?: Partial<Outfit>): Outfit {
  return {
    id: "1",
    name: "Test Outfit",
    cost: 1000,
    // ... default outfit properties
    ...overrides,
  };
}
```

---

## File Naming Conventions

| Artifact         | Format                      | Example                                  |
| ---------------- | --------------------------- | ---------------------------------------- |
| Files/Folders    | kebab-case                  | `ship-outfitting`, `outfit-selector.tsx` |
| Components       | PascalCase                  | `ShipSelector`, `OutfitList`             |
| Hooks            | camelCase with `use` prefix | `useOutfitShip`, `useShipStats`          |
| Utilities        | camelCase                   | `calculateStats`, `formatCurrency`       |
| Types/Interfaces | PascalCase                  | `Ship`, `OutfitProps`                    |
| Constants        | SCREAMING_SNAKE_CASE        | `MAX_OUTFITS`, `DEFAULT_THEME`           |
| Context files    | kebab-case                  | `app-state`, `theme-context.tsx`         |

### Special File Names

- `_components/`: Page-specific components (underscore prefix indicates private/internal)
- `__tests__/`: Test files directory
- `index.ts`: Barrel exports (use sparingly, prefer direct imports)

---

## Import Rules

### Import Order

1. External dependencies (React, Next.js, third-party)
2. Internal absolute imports (`@/components`, `@/lib`)
3. Relative imports (`./component`, `../utils`)
4. Type imports (use `import type` for types)

```typescript
// ✅ Good import order
import { useState, useEffect } from "react";
import { NextResponse } from "next/server";

import { Button } from "@/components/ui/button";
import { getShips } from "@/lib/game-data";

import { ShipCard } from "./ship-card";
import { formatShipName } from "../utils/format";

import type { Ship, Outfit } from "@/types";
```

### Import Restrictions

To maintain clean architecture, enforce these rules via ESLint:

```javascript
// .eslintrc.js (or eslint.config.mjs)
'import/no-restricted-paths': [
  'error',
  {
    zones: [
      // Prevent cross-feature imports
      {
        target: './src/features/ship-outfitting',
        from: './src/features',
        except: ['./ship-outfitting'],
      },
      // Enforce unidirectional flow: features cannot import from app
      {
        target: './src/features',
        from: './src/app',
      },
      // Shared modules cannot import from features or app
      {
        target: [
          './src/components',
          './src/hooks',
          './src/lib',
          './src/types',
          './src/utils',
        ],
        from: ['./src/features', './src/app'],
      },
    ],
  },
],
```

### Path Aliases

Use TypeScript path aliases for cleaner imports:

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/features/*": ["./src/features/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/stores/*": ["./src/stores/*"],
      "@/types/*": ["./src/types/*"],
      "@/utils/*": ["./src/utils/*"]
    }
  }
}
```

---

## Best Practices

### 1. Server Components First

Default to Server Components. Only add `"use client"` when you need:

- Interactivity (event handlers)
- React hooks
- Browser APIs

### 2. Keep Components Small

- Components should be under 200 lines
- Functions should be under 30 lines
- Extract complex logic into hooks or utilities

### 3. Type Safety

- Use TypeScript strictly
- Define types for all props
- Use `import type` for type-only imports

### 4. Error Handling

Use Error Boundaries for component-level errors:

```typescript
// components/errors/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong</div>;
    }

    return this.props.children;
  }
}
```

### 5. Performance

- Use Server Components to reduce JavaScript bundle size
- Lazy load heavy client components with `next/dynamic`
- Memoize expensive computations with `useMemo`

### 6. Security

- Use `server-only` for sensitive code
- Never expose API keys or secrets to client
- Validate and sanitize user input

### 7. Code Organization

- One feature per folder
- Colocate related code
- Avoid deep nesting (max 3-4 levels)

### 8. Documentation

- Document complex functions and components
- Use JSDoc for public APIs
- Keep README files updated

---

## Migration Checklist

When refactoring existing code to follow this architecture:

- [ ] Move data files to `assets/data/`
- [ ] Create feature folders in `features/`
- [ ] Separate Server and Client Components
- [ ] Add `server-only` to data access modules
- [ ] Set up global state stores in `stores/`
- [ ] Organize shared components in `components/ui/`
- [ ] Create path aliases in `tsconfig.json`
- [ ] Set up ESLint import restrictions
- [ ] Add unit tests for components and hooks
- [ ] Update imports to use path aliases

---

## Additional Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)

---

**Last Updated**: 2024
