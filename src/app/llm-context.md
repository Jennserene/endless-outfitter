Best Practices summarized from Bulletproof-react
Last updated: Dec 11 2025

# 📱 App Folder Best Practices

This guide covers Next.js App Router specific patterns and best practices for organizing routes, pages, layouts, and route-specific components in the `app/` folder.

## Table of Contents

1. [Route Organization](#route-organization)
2. [Page Components](#page-components)
3. [Layout Components](#layout-components)
4. [Theme Management and Hydration](#theme-management-and-hydration)
5. [Route Groups](#route-groups)
6. [Dynamic Routes](#dynamic-routes)
7. [Metadata](#metadata)
8. [Loading States](#loading-states)
9. [Error Handling](#error-handling)
10. [API Routes](#api-routes)
11. [Page-Specific Components](#page-specific-components)
12. [Route Conventions](#route-conventions)

---

## Route Organization

The `app/` folder uses file-system based routing. Each folder represents a route segment, and special files like `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, and `not-found.tsx` have specific meanings.

### Basic Route Structure

```
app/
├── layout.tsx              # Root layout (wraps all routes)
├── page.tsx                # Home page (/)
├── provider.tsx            # Global providers wrapper (Client Component)
├── not-found.tsx           # Global 404 page
├── loading.tsx             # Global loading UI (optional)
├── error.tsx               # Global error boundary (optional)
│
├── ships/                  # /ships route
│   ├── layout.tsx          # Layout for /ships and nested routes
│   ├── page.tsx            # /ships page
│   ├── loading.tsx         # Loading UI for /ships
│   ├── error.tsx           # Error boundary for /ships
│   └── _components/        # Page-specific components
│       └── ships-list.tsx
│
└── api/                    # API routes
    └── ships/
        └── route.ts        # /api/ships endpoint
```

### Route Organization Principles

1. **One Route Per Folder**: Each route folder should contain only one `page.tsx`
2. **Colocation**: Keep route-specific components in `_components/` within the route folder
3. **Nested Layouts**: Use nested `layout.tsx` files to create shared UI for route groups
4. **Clear Hierarchy**: Organize routes to reflect the application's information architecture

---

## Page Components

Page components (`page.tsx`) are the UI for a route. They can be Server Components (default) or Client Components.

### Server Component Page Pattern

**Use Server Components for pages that:**

- Fetch data
- Don't need interactivity
- Should reduce client bundle size

```typescript
// app/ships/page.tsx
import { getShips } from '@/lib/game-data';
import { ShipsList } from './_components/ships-list';

export const metadata = {
  title: 'Ships',
  description: 'Browse all available ships',
};

export default async function ShipsPage() {
  // Server-side data fetching
  const ships = await getShips();

  return (
    <div>
      <h1>Ships</h1>
      <ShipsList ships={ships} />
    </div>
  );
}
```

### Client Component Page Pattern

**Use Client Components for pages that:**

- Need interactivity
- Use React hooks
- Access browser APIs

```typescript
// app/ships/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ShipsList } from './_components/ships-list';

export default function ShipsPage() {
  const [ships, setShips] = useState([]);

  useEffect(() => {
    // Client-side data fetching
    fetch('/api/ships')
      .then(res => res.json())
      .then(data => setShips(data));
  }, []);

  return (
    <div>
      <h1>Ships</h1>
      <ShipsList ships={ships} />
    </div>
  );
}
```

### Hybrid Pattern (Recommended)

**Best Practice**: Use Server Components for data fetching, then pass data to Client Components for interactivity.

```typescript
// app/ships/page.tsx (Server Component)
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
// app/ships/_components/ships-page-client.tsx (Client Component)
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

### Page Component Best Practices

1. **Default to Server Components**: Only use `'use client'` when necessary
2. **Export Metadata**: Always export `metadata` for SEO and social sharing
3. **Keep Pages Thin**: Pages should primarily compose components, not contain complex logic
4. **Handle Search Params**: Use `searchParams` prop for query string parameters

```typescript
// app/ships/page.tsx
export default async function ShipsPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  const search = searchParams.search || '';
  const page = Number(searchParams.page) || 1;

  const ships = await getShips({ search, page });

  return <ShipsList ships={ships} />;
}
```

---

## Layout Components

Layout components (`layout.tsx`) wrap pages and nested routes, creating shared UI and maintaining state across navigation.

### Root Layout

The root layout (`app/layout.tsx`) wraps all routes and should include:

- HTML structure (`<html>`, `<body>`)
- Global providers
- Global styles
- Fonts

```typescript
// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppProvider } from './provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Endless Outfitter',
  description: 'Ship outfitting tool for Endless Sky',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
```

### Nested Layouts

Nested layouts create shared UI for route groups without affecting the URL structure.

```typescript
// app/ships/layout.tsx
import { ContentLayout } from '@/components/layouts/content-layout';

export const metadata = {
  title: 'Ships',
  description: 'Browse and search ships',
};

export default function ShipsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ContentLayout title="Ships">
      {children}
    </ContentLayout>
  );
}
```

### Layout Best Practices

1. **Layouts are Shared**: Layouts persist across navigation, so don't reset state here
2. **Nested Layouts Stack**: Each layout wraps its children, creating a component tree
3. **Metadata Inheritance**: Child routes inherit parent layout metadata (can be overridden)
4. **Client Components in Layouts**: Use Client Components for interactive layout elements

```typescript
// app/ships/layout.tsx
'use client';

import { useState } from 'react';
import { ShipsSidebar } from './_components/ships-sidebar';

export default function ShipsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex">
      <ShipsSidebar open={sidebarOpen} onToggle={setSidebarOpen} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

---

## Theme Management and Hydration

The app uses `next-themes` for theme management (dark/light/system). When using the `useTheme` hook, you must handle hydration properly to avoid server/client mismatches.

### The Problem

The `theme` value from `useTheme` is `undefined` on the server because:

- `localStorage` is not available during SSR
- The theme preference is only known after the component mounts on the client
- Rendering theme-dependent UI before mounting causes hydration mismatches

### ❌ Incorrect: Direct Theme Usage

**This will cause hydration errors:**

```typescript
'use client';

import { useTheme } from 'next-themes';

// ❌ DO NOT DO THIS - Will throw hydration mismatch error
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      <option value="system">System</option>
      <option value="dark">Dark</option>
      <option value="light">Light</option>
    </select>
  );
}
```

### ✅ Correct: Wait for Mount

**Always wait for the component to mount before rendering theme-dependent UI:**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // Return null or a placeholder until mounted
  if (!mounted) {
    return null; // or return a skeleton/placeholder
  }

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      <option value="system">System</option>
      <option value="dark">Dark</option>
      <option value="light">Light</option>
    </select>
  );
}
```

### ✅ Alternative: Lazy Loading with next/dynamic

**Use dynamic imports to load theme-dependent components only on the client:**

```typescript
// app/_components/theme-toggle.tsx
'use client';

import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      <option value="system">System</option>
      <option value="dark">Dark</option>
      <option value="light">Light</option>
    </select>
  );
}
```

```typescript
// app/page.tsx (Server Component)
import dynamic from 'next/dynamic';

// Load ThemeToggle only on the client side
const ThemeToggle = dynamic(() => import('./_components/theme-toggle'), {
  ssr: false,
});

export default function HomePage() {
  return (
    <div>
      <ThemeToggle />
      {/* Rest of page */}
    </div>
  );
}
```

### Using resolvedTheme for Styling

When you need to apply styles based on the resolved theme (e.g., showing different images), use `resolvedTheme` instead of `theme`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';

export function ThemedImage() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder image to avoid layout shift
    return (
      <Image
        src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        width={400}
        height={400}
        alt="Loading"
      />
    );
  }

  const src = resolvedTheme === 'dark' ? '/dark.png' : '/light.png';

  return <Image src={src} width={400} height={400} alt="Themed image" />;
}
```

### CSS-Based Theme Handling

For simple show/hide scenarios, use CSS to avoid hydration issues entirely:

```typescript
// Component renders both versions
export function ThemedContent() {
  return (
    <>
      {/* Hidden when theme is dark */}
      <div data-hide-on-theme="dark">
        <Image src="/light.png" width={400} height={400} alt="Light" />
      </div>

      {/* Hidden when theme is light */}
      <div data-hide-on-theme="light">
        <Image src="/dark.png" width={400} height={400} alt="Dark" />
      </div>
    </>
  );
}
```

```css
/* In globals.css */
[data-theme="dark"] [data-hide-on-theme="dark"],
[data-theme="light"] [data-hide-on-theme="light"] {
  display: none;
}
```

### Theme Management Best Practices

1. **Always Check `mounted`**: Use `useState` + `useEffect` to detect client-side mounting
2. **Provide Placeholders**: Return a skeleton or placeholder to avoid layout shift
3. **Use `resolvedTheme` for Styling**: When you need the actual theme value (dark/light), not "system"
4. **Prefer CSS When Possible**: Use CSS selectors for simple show/hide scenarios
5. **Lazy Load When Appropriate**: Use `next/dynamic` with `ssr: false` for complex theme-dependent components
6. **Handle `undefined` Theme**: The theme will be `undefined` until mounted - always handle this case

### ThemeProvider Configuration

The `ThemeProvider` is configured in `app/provider.tsx` with:

- `attribute="class"` - Uses Tailwind's class-based dark mode
- `defaultTheme="system"` - Respects system preference by default
- `enableSystem` - Allows switching between system, dark, and light themes

The root layout includes `suppressHydrationWarning` on the `<html>` tag, which is required by next-themes to prevent hydration warnings when it updates the theme class.

---

## Route Groups

Route groups (folders wrapped in parentheses) organize routes without affecting the URL structure.

### Use Cases

1. **Organizing by Feature**: Group related routes together
2. **Different Layouts**: Apply different layouts to route groups
3. **Conditional Routes**: Use for feature flags or A/B testing

```
app/
├── (marketing)/           # Route group (not in URL)
│   ├── layout.tsx         # Marketing layout
│   ├── about/
│   │   └── page.tsx       # /about (not /(marketing)/about)
│   └── contact/
│       └── page.tsx       # /contact
│
└── (app)/                 # Route group
    ├── layout.tsx         # App layout (with sidebar, etc.)
    ├── dashboard/
    │   └── page.tsx       # /dashboard
    └── profile/
        └── page.tsx       # /profile
```

### Route Group Example

```typescript
// app/(app)/layout.tsx
import { DashboardLayout } from '@/components/layouts/dashboard-layout';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
```

---

## Dynamic Routes

Dynamic routes use square brackets to create parameterized routes.

### Single Dynamic Segment

```
app/
└── ships/
    └── [id]/
        └── page.tsx       # /ships/:id
```

```typescript
// app/ships/[id]/page.tsx
import { getShip } from '@/lib/game-data';
import { notFound } from 'next/navigation';

export default async function ShipPage({
  params,
}: {
  params: { id: string };
}) {
  const ship = await getShip(params.id);

  if (!ship) {
    notFound();
  }

  return (
    <div>
      <h1>{ship.name}</h1>
      {/* Ship details */}
    </div>
  );
}
```

### Multiple Dynamic Segments

```
app/
└── ships/
    └── [category]/
        └── [id]/
            └── page.tsx   # /ships/:category/:id
```

### Catch-All Routes

```
app/
└── docs/
    └── [...slug]/
        └── page.tsx       # /docs/* (matches /docs/a, /docs/a/b, etc.)
```

```typescript
// app/docs/[...slug]/page.tsx
export default function DocsPage({ params }: { params: { slug: string[] } }) {
  const path = params.slug.join("/");
  // Render docs based on path
}
```

### Optional Catch-All Routes

```
app/
└── shop/
    └── [[...slug]]/
        └── page.tsx       # /shop, /shop/category, /shop/category/item
```

### Dynamic Route Best Practices

1. **Validate Params**: Always validate and handle missing data
2. **Type Safety**: Use TypeScript to type params
3. **Generate Metadata**: Export `generateMetadata` for dynamic SEO

```typescript
// app/ships/[id]/page.tsx
import { getShip } from "@/lib/game-data";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const ship = await getShip(params.id);

  if (!ship) {
    return {
      title: "Ship Not Found",
    };
  }

  return {
    title: ship.name,
    description: `Details for ${ship.name}`,
  };
}

export default async function ShipPage({ params }: { params: { id: string } }) {
  const ship = await getShip(params.id);
  // ...
}
```

---

## Metadata

Metadata is exported from pages and layouts to control SEO, social sharing, and browser behavior.

### Static Metadata

```typescript
// app/ships/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ships",
  description: "Browse all available ships",
  keywords: ["ships", "endless sky", "outfitting"],
  openGraph: {
    title: "Ships - Endless Outfitter",
    description: "Browse all available ships",
    type: "website",
  },
};
```

### Dynamic Metadata

```typescript
// app/ships/[id]/page.tsx
import type { Metadata } from "next";
import { getShip } from "@/lib/game-data";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const ship = await getShip(params.id);

  return {
    title: ship?.name || "Ship Not Found",
    description: ship?.description,
  };
}
```

### Metadata Best Practices

1. **Always Export Metadata**: Every page should have metadata
2. **Inherit from Parent**: Child routes inherit parent layout metadata
3. **Override When Needed**: Pages can override parent metadata
4. **Include Open Graph**: Add Open Graph tags for social sharing
5. **Use generateMetadata**: For dynamic routes, use `generateMetadata` function

---

## Loading States

Loading UI (`loading.tsx`) shows while a route segment is loading.

### Route-Level Loading

```typescript
// app/ships/loading.tsx
export default function ShipsLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
    </div>
  );
}
```

### Loading Best Practices

1. **Instant Feedback**: Loading UI appears immediately while data loads
2. **Suspense Boundaries**: Loading UI works with React Suspense
3. **Nested Loading**: Child route loading UI takes precedence
4. **Reusable Components**: Use shared loading components from `components/ui/`

```typescript
// app/ships/loading.tsx
import { Spinner } from '@/components/ui/spinner';

export default function ShipsLoading() {
  return (
    <div className="flex items-center justify-center p-8">
      <Spinner size="lg" />
    </div>
  );
}
```

---

## Error Handling

Error boundaries (`error.tsx`) catch errors in route segments and display fallback UI.

### Route-Level Error Boundary

```typescript
// app/ships/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ShipsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Ships page error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

### Global Error Boundary

```typescript
// app/error.tsx
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2>Something went wrong!</h2>
          <button onClick={reset}>Try again</button>
        </div>
      </body>
    </html>
  );
}
```

### Not Found Pages

```typescript
// app/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-gray-600 mb-4">Page not found</p>
      <Link href="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
```

### Error Handling Best Practices

1. **Error Boundaries are Client Components**: Must use `'use client'`
2. **Reset Function**: Provide a way to retry failed operations
3. **Error Logging**: Log errors to monitoring service
4. **User-Friendly Messages**: Don't expose technical error details
5. **Specific Error Pages**: Create route-specific error boundaries when needed

---

## API Routes

API routes (`route.ts`) create HTTP endpoints in the `app/api/` directory.

### Basic API Route

```typescript
// app/api/ships/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getShips } from "@/lib/game-data";

export async function GET(request: NextRequest) {
  try {
    const ships = getShips();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let result = ships;
    if (search) {
      result = ships.filter((ship) =>
        ship.name.toLowerCase().includes(search.toLowerCase())
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

### HTTP Methods

```typescript
// app/api/ships/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Handle GET request
}

export async function POST(request: NextRequest) {
  // Handle POST request
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Handle PUT request
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Handle DELETE request
}
```

### API Route Best Practices

1. **Server-Only**: API routes run only on the server
2. **Error Handling**: Always handle errors and return appropriate status codes
3. **Request Validation**: Validate and sanitize input
4. **Type Safety**: Type request and response data
5. **Rate Limiting**: Consider rate limiting for public endpoints

---

## Page-Specific Components

Components that are only used by a specific page should live in a `_components/` folder within that route.

### When to Use `_components/`

- Components only used by one page
- Page-specific UI logic
- Components tightly coupled to a route

```
app/
└── ships/
    ├── page.tsx
    └── _components/          # Underscore indicates private/internal
        ├── ships-list.tsx
        ├── ship-card.tsx
        └── ships-filters.tsx
```

### Component Organization

```typescript
// app/ships/_components/ships-list.tsx
'use client';

import { ShipCard } from './ship-card';

export function ShipsList({ ships }: { ships: Ship[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {ships.map(ship => (
        <ShipCard key={ship.id} ship={ship} />
      ))}
    </div>
  );
}
```

### `_components/` Best Practices

1. **Underscore Prefix**: The `_` prefix indicates these are private/internal to the route
2. **Not Shared**: Don't import `_components/` from other routes
3. **Move to Features**: If a component is reused, move it to `features/` or `components/`
4. **Colocation**: Keep page-specific components close to the page

---

## Route Conventions

### File Naming

| File            | Purpose            | Required         |
| --------------- | ------------------ | ---------------- |
| `page.tsx`      | Route UI           | Yes (for routes) |
| `layout.tsx`    | Shared UI wrapper  | No               |
| `loading.tsx`   | Loading UI         | No               |
| `error.tsx`     | Error boundary     | No               |
| `not-found.tsx` | 404 page           | No               |
| `route.ts`      | API endpoint       | No               |
| `template.tsx`  | Re-rendered layout | No               |

### Special Files

- **`page.tsx`**: Defines the UI for a route (required for routes)
- **`layout.tsx`**: Wraps pages and nested routes
- **`loading.tsx`**: Shows while route segment loads
- **`error.tsx`**: Catches errors in route segment
- **`not-found.tsx`**: 404 page for route segment
- **`route.ts`**: API endpoint handler
- **`template.tsx`**: Similar to layout but re-renders on navigation

### Route Matching Rules

1. **Most Specific Wins**: More specific routes take precedence
2. **File System Order**: Routes are matched in file system order
3. **Dynamic Routes**: `[id]` matches any segment
4. **Catch-All**: `[...slug]` matches multiple segments
5. **Optional Catch-All**: `[[...slug]]` matches zero or more segments

### Route Organization Checklist

- [ ] Each route has a clear purpose
- [ ] Related routes are grouped logically
- [ ] Dynamic routes are properly typed
- [ ] Metadata is exported for all pages
- [ ] Loading states are provided where needed
- [ ] Error boundaries handle failures gracefully
- [ ] Page-specific components are in `_components/`
- [ ] Shared components are in `components/` or `features/`
- [ ] API routes follow RESTful conventions
- [ ] Routes are tested for accessibility

---

## Additional Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Next.js Routing](https://nextjs.org/docs/app/building-your-application/routing)
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [Next.js Loading UI](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)

---
