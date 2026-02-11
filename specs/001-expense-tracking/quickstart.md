# Quickstart Guide: Expense Tracking Application

**Feature**: 001-expense-tracking  
**Date**: 2026-02-11  
**Phase**: Phase 1 - Project Setup

## Overview

This guide walks through setting up the expense tracking application from scratch. You'll initialize a Next.js 14+ project with TypeScript, configure Supabase for database and authentication, set up the testing framework, and prepare the development environment.

**Time Estimate**: 30-45 minutes for complete setup

---

## Prerequisites

Ensure these tools are installed before starting:

| Tool                  | Version  | Installation                            |
| --------------------- | -------- | --------------------------------------- |
| Node.js               | 20.x LTS | https://nodejs.org/ or `nvm install 20` |
| npm                   | 10+      | Included with Node.js                   |
| Git                   | Latest   | https://git-scm.com/                    |
| Supabase CLI          | Latest   | `npm install -g supabase`               |
| VS Code (recommended) | Latest   | https://code.visualstudio.com/          |

**Optional but Recommended**:

- VS Code Extensions: ESLint, Prettier, Tailwind CSS IntelliSense, Supabase

---

## Step 1: Create Next.js Project

Initialize a new Next.js project with TypeScript and App Router:

```bash
# Create project directory
npx create-next-app@latest expense-tracker \
  --typescript \
  --app \
  --eslint \
  --tailwind \
  --no-src-dir \
  --import-alias "@/*"

cd expense-tracker
```

**Configuration prompts**:

- TypeScript: **Yes**
- ESLint: **Yes**
- Tailwind CSS: **Yes**
- `src/` directory: **No** (use `app/` directly)
- App Router: **Yes**
- Import alias: **@/\*** (default)

**Verify installation**:

```bash
npm run dev
# Open http://localhost:3000 - you should see Next.js welcome page
```

---

## Step 2: Configure TypeScript Strict Mode

Enable strict TypeScript settings per constitutional mandate:

**Update `tsconfig.json`**:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "checkJs": false,
    "noEmit": true,
    "incremental": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "skipLibCheck": true,

    // Strict mode settings (required by constitution)
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // Additional checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true,

    "paths": {
      "@/*": ["./*"]
    },
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Step 3: Install Project Dependencies

Install Supabase client libraries, validation, and testing tools:

```bash
# Supabase for database and authentication
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# Validation library
npm install zod

# Development dependencies
npm install -D @types/node @types/react @types/react-dom

# Testing dependencies
npm install -D vitest @vitest/ui @vitest/coverage-v8 \
  @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event jsdom

# E2E testing
npm install -D @playwright/test

# ESLint plugins for TypeScript
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

---

## Step 4: Initialize Supabase

Set up Supabase locally for development:

```bash
# Initialize Supabase in project
supabase init

# Start local Supabase instance (PostgreSQL + Auth + Studio)
supabase start
```

**Expected output**:

```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGc...
service_role key: eyJhbGc...
```

**Save these values** - you'll need them for environment variables.

---

## Step 5: Create Database Schema

Apply migrations to create tables, RLS policies, and functions:

**Create migration file**:

```bash
# Copy migration files from specs/001-expense-tracking/data-model.md
# to supabase/migrations/ directory

# Create migrations
touch supabase/migrations/20260211000001_initial_schema.sql
touch supabase/migrations/20260211000002_rls_policies.sql
touch supabase/migrations/20260211000003_dashboard_functions.sql
```

**Copy SQL from [data-model.md](data-model.md)** into respective migration files.

**Apply migrations**:

```bash
supabase migration up

# Verify tables created
supabase db diff
```

**Generate TypeScript types**:

```bash
# Create lib directory
mkdir -p lib/supabase

# Generate types from database schema
supabase gen types typescript --local > lib/supabase/types.ts
```

---

## Step 6: Configure Environment Variables

Create environment variable files for development:

**Create `.env.local`** (local development):

```bash
# Supabase connection (from Step 4 output)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key-from-supabase-start>

# For server-side operations only (never expose to client)
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

**Create `.env.example`** (template for other developers):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Add to `.gitignore`**:

```bash
echo ".env.local" >> .gitignore
```

---

## Step 7: Create Supabase Client Utilities

Set up Supabase client instances for server and client components:

**Create `lib/supabase/client.ts`** (browser client):

```typescript
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "./types";

export const createClient = () => {
  return createClientComponentClient<Database>();
};
```

**Create `lib/supabase/server.ts`** (server client):

```typescript
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "./types";

export const createServerClient = () => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  });
};
```

**Create `lib/supabase/middleware.ts`** (middleware client):

```typescript
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Database } from "./types";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });

  // Refresh session if expired
  await supabase.auth.getSession();

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
```

---

## Step 8: Configure Testing

Set up Vitest for unit and integration tests:

**Create `vitest.config.ts`**:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov", "json"],
      include: ["app/**", "components/**", "lib/**"],
      exclude: [
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
        "**/types.ts",
        "**/*.d.ts",
        "**/node_modules/**",
        "**/.next/**",
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
```

**Create `tests/setup.ts`**:

```typescript
import "@testing-library/jest-dom";
import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Supabase (tests will override with specific mocks)
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(),
}));
```

**Initialize Playwright**:

```bash
npx playwright install
```

**Create `playwright.config.ts`**:

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 13"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

**Update `package.json` scripts**:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "type-check": "tsc --noEmit",
    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop",
    "supabase:reset": "supabase db reset",
    "supabase:types": "supabase gen types typescript --local > lib/supabase/types.ts"
  }
}
```

---

## Step 9: Configure OAuth Providers

Set up Google and GitHub OAuth for authentication:

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing one
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth 2.0 Client ID**
5. Configure consent screen if prompted
6. Application type: **Web application**
7. Authorized redirect URIs:
   - `http://localhost:54321/auth/v1/callback` (local)
   - `https://<your-project>.supabase.co/auth/v1/callback` (production)
8. Copy **Client ID** and **Client Secret**

### GitHub OAuth Setup

1. Go to [GitHub Settings > Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - Application name: Expense Tracker
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:54321/auth/v1/callback`
4. Click **Register application**
5. Copy **Client ID** and generate **Client Secret**

### Configure in Supabase

```bash
# Open Supabase Studio
open http://localhost:54323

# Navigate to: Authentication > Providers
# Enable Google: paste Client ID and Secret
# Enable GitHub: paste Client ID and Secret
```

---

## Step 10: Create Project Structure

Set up directory structure from [plan.md](plan.md):

```bash
# Create directories
mkdir -p app/api/transactions/[id]
mkdir -p app/api/categories/[id]
mkdir -p app/api/dashboard
mkdir -p app/api/export
mkdir -p app/\(auth\)/login
mkdir -p app/\(auth\)/callback
mkdir -p app/dashboard
mkdir -p app/transactions/[id]
mkdir -p app/categories
mkdir -p components/transactions
mkdir -p components/categories
mkdir -p components/dashboard
mkdir -p components/ui
mkdir -p components/providers
mkdir -p lib/utils
mkdir -p tests/unit/lib/utils
mkdir -p tests/unit/components
mkdir -p tests/integration/api
mkdir -p tests/integration/pages
mkdir -p tests/e2e
mkdir -p public/icons
```

**Create placeholder files**:

```bash
# API routes
touch app/api/transactions/route.ts
touch app/api/transactions/[id]/route.ts
touch app/api/categories/route.ts
touch app/api/categories/[id]/route.ts
touch app/api/dashboard/route.ts
touch app/api/export/route.ts

# Auth routes
touch app/\(auth\)/login/page.tsx
touch app/auth/callback/route.ts

# Pages
touch app/dashboard/page.tsx
touch app/transactions/page.tsx
touch app/transactions/[id]/page.tsx
touch app/categories/page.tsx

# Utilities
touch lib/utils/currency.ts
touch lib/utils/date.ts
touch lib/utils/csv.ts
touch lib/utils/validation.ts
touch lib/constants.ts
```

---

## Step 11: Verify Setup

Run verification checks to ensure everything is configured correctly:

```bash
# Type check
npm run type-check
# Expected: No TypeScript errors

# Lint
npm run lint
# Expected: No linting errors (or fixable warnings)

# Start dev server
npm run dev
# Expected: Server starts on http://localhost:3000

# Check Supabase connection
curl http://localhost:54321/rest/v1/
# Expected: JSON response with API info

# Run tests (will fail initially - expected)
npm run test
# Expected: No tests found (yet)
```

---

## Step 12: First Test (Verify TDD Setup)

Create a simple utility and test to verify TDD workflow:

**Create `lib/utils/currency.ts`**:

```typescript
/**
 * Format a number as currency with proper thousands separators
 * and exactly 2 decimal places.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
```

**Create `tests/unit/lib/utils/currency.test.ts`**:

```typescript
import { describe, it, expect } from "vitest";
import { formatCurrency } from "@/lib/utils/currency";

describe("formatCurrency", () => {
  it("formats positive amounts with dollar sign and 2 decimals", () => {
    expect(formatCurrency(125.5)).toBe("$125.50");
    expect(formatCurrency(1000)).toBe("$1,000.00");
  });

  it("formats zero correctly", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("formats negative amounts", () => {
    expect(formatCurrency(-50.99)).toBe("-$50.99");
  });

  it("includes thousands separators", () => {
    expect(formatCurrency(1234567.89)).toBe("$1,234,567.89");
  });
});
```

**Run test**:

```bash
npm run test
# Expected: 4 passing tests
```

---

## Next Steps

**You're now ready to start implementation!**

1. **Phase 2**: Run `/speckit.tasks` command to generate detailed implementation tasks
2. **TDD Workflow**: For each task, write tests first (Red), implement (Green), refactor
3. **Commit Often**: Commit after each passing test suite
4. **Documentation**: Update README.md with project-specific setup instructions

---

## Troubleshooting

### Supabase won't start

```bash
# Stop all Supabase services
supabase stop --no-backup

# Restart
supabase start
```

### TypeScript errors in Supabase types

```bash
# Regenerate types after schema changes
npm run supabase:types
```

### Tests fail to import Next.js modules

Ensure `vitest.config.ts` has correct path alias matching `tsconfig.json`:

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './'),
  },
},
```

### OAuth redirect not working locally

- Verify callback URL matches exactly: `http://localhost:54321/auth/v1/callback`
- Check Supabase Studio > Authentication > URL Configuration
- Ensure no trailing slashes in URLs

---

## Production Deployment Checklist

Before deploying to production (Vercel):

- [ ] Create production Supabase project at https://supabase.com/
- [ ] Run migrations on production database: `supabase db push`
- [ ] Configure OAuth providers with production callback URLs
- [ ] Set environment variables in Vercel dashboard
- [ ] Enable RLS policies (verify with test accounts)
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring and error tracking
- [ ] Run production build locally: `npm run build`
- [ ] Verify all tests pass: `npm run test && npm run test:e2e`

---

## Reference

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Project Constitution](.specify/memory/constitution.md)
- [Implementation Plan](plan.md)
- [Data Model](data-model.md)
- [API Contracts](contracts/)
