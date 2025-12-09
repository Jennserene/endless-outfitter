# Endless Outfitter

A Next.js application for browsing and managing Endless Sky game data.

## Getting Started

First, install dependencies. The git submodule for game data will be automatically initialized for local development:

```bash
npm install
```

**Note:** The game data submodule is only initialized in local development environments. Production builds do not include the submodule.

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Game Data Integration

This project uses a git submodule to access game data from the [Endless Sky](https://github.com/endless-sky/endless-sky) repository for **local development only**. The game data is version-specific and pinned to release tags.

**⚠️ Important:** The game data submodule is **NOT** included in production builds. In production, game data should be provided through external APIs or data sources.

### Architecture

- **Git Submodule** - Game repository at `vendor/endless-sky` (pinned to release tag, **local development only**)
- **Version Configuration** - Current version tracked in `config/game-version.ts`
- **Game Data Utilities** - Server-side utilities in `src/lib/game-data.ts` for accessing game files

### Server-Side Data Handling

**Important:** Game data utilities use Node.js `fs` module, which means:

✅ **Data stays on the server** - Game files are never bundled into the client  
✅ **Use in Server Components** - Default in Next.js App Router (no "use client")  
✅ **Use in API Routes** - Perfect for filtering/parsing before sending to client  
✅ **Use in Server Actions** - For server-side mutations

❌ **Never use in Client Components** - Files with "use client" directive  
❌ **Never import in browser code** - Will cause build errors

### Recommended Usage Patterns

1. **API Routes** (Best for large datasets):

```typescript
// app/api/ships/route.ts
import { readGameDataFile, GameDataPaths } from "@/lib/game-data";
import { NextResponse } from "next/server";

export async function GET() {
  const data = readGameDataFile(GameDataPaths.SHIPS);
  // Parse, filter, and return only what's needed
  return NextResponse.json(filteredData);
}
```

2. **Server Components** (For initial page data):

```typescript
// app/ships/page.tsx (no "use client")
import { readGameDataFile, GameDataPaths } from "@/lib/game-data";

export default async function ShipsPage() {
  const data = readGameDataFile(GameDataPaths.SHIPS);
  // Parse and render server-side
}
```

3. **Client-side fetching** (For dynamic/interactive features):

```typescript
// Client Component
const response = await fetch("/api/ships");
const ships = await response.json();
```

### Updating Game Data Version

To update to a new game version:

1. Navigate to submodule: `cd vendor/endless-sky`
2. Fetch latest tags: `git fetch --tags`
3. Checkout new tag: `git checkout v0.10.17` (or desired version)
4. Update version config: Manually update `config/game-version.ts` with new version
5. Test application with new data
6. Commit changes:
   ```bash
   git add vendor/endless-sky config/game-version.ts
   git commit -m "chore: update game data to v0.10.17"
   ```

### CI/CD

**The game data submodule is for local development only and is NOT initialized in production builds.**

- **Local Development:** The `postinstall` script automatically initializes the submodule when `npm install` runs in development environments
- **Production Builds:** The submodule is NOT initialized (the `postinstall` script skips it when `NODE_ENV=production`)
- **Deployment:** Production deployments should not include the game data submodule. Game data should be provided through external APIs or data sources instead

The submodule reference remains in the repository for developers, but the actual content is never downloaded during production builds.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
