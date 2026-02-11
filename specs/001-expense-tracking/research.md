# Research: Expense Tracking Application

**Feature**: 001-expense-tracking  
**Date**: 2026-02-11  
**Phase**: Phase 0 - Architecture Research and Technology Decisions

## Overview

This document captures architectural decisions, best practices, and research findings for building a full-stack expense tracking application using Next.js 14+, TypeScript, and Supabase. All decisions align with constitutional mandates (TypeScript strict mode, 100% test coverage, Next.js full-stack architecture, Supabase integration, cloud-ready deployment).

---

## 1. Next.js 14+ App Router Architecture

### Decision: Use App Router with Server Components as Default

**Rationale**:

- **Performance**: Server components reduce JavaScript bundle size by rendering on the server. For expense tracking, transaction lists and dashboard stats can be server-rendered, shipping zero JavaScript for UI that doesn't need interactivity.
- **Data Fetching**: Collocate data fetching with components using async server components. Fetch transactions directly in `app/transactions/page.tsx` without client-side fetching or state management libraries.
- **Type Safety**: Server components enable direct database queries with full TypeScript inference without API serialization boundaries.
- **SEO/Initial Load**: Dashboard and transaction history benefit from server-side rendering for faster perceived performance.

**Client Components Required For**:

- Forms with input handling (`TransactionForm.tsx`, `CategoryForm.tsx`)
- Interactive filters (`TimePeriodFilter.tsx` with state for day/week/month)
- Modals and dropdowns requiring JavaScript events
- CSV export button with download trigger

**Best Practices**:

- Mark client components with `'use client'` directive only at the component boundary requiring interactivity
- Pass server-fetched data as props to client components (avoids prop serialization issues)
- Use React Server Actions for mutations (create/update/delete) instead of traditional API routes when feasible
- Leverage `loading.tsx` and `error.tsx` conventions for loading states and error boundaries

**Alternatives Considered**:

- **Pages Router**: Rejected due to lack of server component support, less optimal data fetching patterns, and being deprecated in favor of App Router.
- **Separate Backend Framework (Express)**: Rejected per Constitution Principle III - adds complexity, breaks type safety across frontend/backend boundary, requires deploying two separate services.

---

## 2. Supabase Integration Patterns

### Decision: Row Level Security (RLS) + Generated TypeScript Types

**Rationale**:

- **Security at Database Level**: RLS policies enforce data isolation (user can only see their own transactions) at PostgreSQL level, preventing authorization bugs in application code.
- **Type Safety**: `supabase gen types typescript` generates TypeScript definitions from database schema, ensuring compile-time type checking for queries.
- **Real-Time Updates**: Supabase real-time subscriptions enable live dashboard updates when transactions change without polling.
- **Edge Compatible**: Supabase connection pooling works with edge runtimes (Vercel Edge, Cloudflare Workers).

**RLS Policy Strategy**:

```sql
-- Transactions table RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);
```

**Client Instantiation Pattern**:

- **Server Components/API Routes**: Use `createServerClient` with cookies from `next/headers` for authenticated requests
- **Client Components**: Use `createClientComponentClient` for browser-side operations (forms, real-time subscriptions)
- **Middleware**: Use `createMiddlewareClient` for session refresh in Next.js middleware

**Best Practices**:

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client code (bypasses RLS)
- Use `supabase.auth.getSession()` in server components, never `getUser()` alone (session includes token)
- Store Supabase URL and anon key in environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Create database functions for complex aggregations (dashboard stats) to reduce data transfer

**Alternatives Considered**:

- **Application-Level Authorization**: Rejected because it's error-prone (easy to forget checks), doesn't protect against direct database access, and violates Constitution Principle IV.
- **Prisma ORM**: Rejected because Supabase client provides typed queries, real-time capabilities, and edge runtime compatibility out-of-the-box; Prisma adds unnecessary abstraction layer.

---

## 3. TypeScript Strict Mode Patterns

### Decision: Strict Mode with Explicit Database Types

**Rationale**:

- **Constitution Mandate**: Principle I requires strict mode with no implicit `any`
- **Prevent Runtime Errors**: Strict null checks catch undefined access at compile time (critical for financial calculations)
- **Refactoring Safety**: Type errors during refactoring prevent breaking changes from reaching production

**Type Definition Strategy**:

```typescript
// lib/supabase/types.ts (generated from database)
export type Database = {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number; // Stored as numeric(12,2) in Postgres
          description: string;
          date: string; // ISO 8601 timestamp
          type: "income" | "expense";
          category_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string; // UUID auto-generated
          user_id: string;
          amount: number;
          description: string;
          date: string;
          type: "income" | "expense";
          category_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          // All fields optional for PATCH operations
          amount?: number;
          description?: string;
          date?: string;
          type?: "income" | "expense";
          category_id?: string | null;
          updated_at?: string;
        };
      };
      categories: {
        /* ... */
      };
    };
  };
};

// Domain types
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type TransactionInsert =
  Database["public"]["Tables"]["transactions"]["Insert"];
export type TransactionUpdate =
  Database["public"]["Tables"]["transactions"]["Update"];
```

**Best Practices**:

- Enable all strict flags in `tsconfig.json`: `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`
- Use discriminated unions for API responses: `type ApiResponse<T> = { success: true; data: T } | { success: false; error: string }`
- Validate external data at boundaries with Zod schemas (API route inputs, form submissions)
- Regenerate database types after every migration: `supabase gen types typescript --local > lib/supabase/types.ts`

**Alternatives Considered**:

- **Loose Mode with Gradual Adoption**: Rejected per constitution mandate; financial application demands maximum type safety.
- **Manual Type Definitions**: Rejected because generated types stay in sync with database schema automatically, preventing drift.

---

## 4. Financial Data Handling

### Decision: PostgreSQL NUMERIC(12,2) with Server-Side Arithmetic

**Rationale**:

- **Precision**: JavaScript `number` (IEEE 754 float) has precision issues (e.g., `0.1 + 0.2 !== 0.3`). PostgreSQL NUMERIC type maintains exact decimal precision required for financial calculations.
- **Currency Constraints**: NUMERIC(12,2) supports amounts up to 999,999,999.99 (meets FR-002 spec requirement) with exactly 2 decimal places.
- **Server-Side Calculations**: Dashboard aggregations (SUM, balance calculations) performed in PostgreSQL queries to avoid JavaScript floating-point errors.

**Implementation Pattern**:

```typescript
// Database schema
CREATE TABLE transactions (
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0)
);

// Client-side formatting (display only, never calculations)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD', // TODO: Make configurable per user
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Validation (use Zod in API routes)
import { z } from 'zod';

const transactionSchema = z.object({
  amount: z.number()
    .positive('Amount must be positive')
    .max(999999999.99, 'Amount exceeds maximum')
    .refine(val => Number((val * 100).toFixed(0)) === val * 100,
      'Amount must have at most 2 decimal places'),
  // ... other fields
});
```

**Best Practices**:

- Never perform arithmetic in JavaScript client code for currency
- Use PostgreSQL aggregate functions for dashboard: `SELECT SUM(amount) FROM transactions WHERE type = 'income'`
- Display amounts with `Intl.NumberFormat` for locale-aware formatting (thousands separators)
- Store amounts as cents (multiply by 100) if using integer columns, but NUMERIC(12,2) is preferred for clarity

**Alternatives Considered**:

- **Integer Cents Storage**: Rejected because NUMERIC(12,2) is more readable and PostgreSQL handles it efficiently; converting to/from cents adds mental overhead.
- **JavaScript BigDecimal Libraries**: Rejected because calculations on server (PostgreSQL) avoid JavaScript precision issues entirely; adding a library is unnecessary complexity.

---

## 5. Testing Strategy

### Decision: Vitest + React Testing Library + Playwright (3-Layer Testing)

**Rationale**:

- **Unit Tests (Vitest)**: Fast execution, excellent TypeScript support, ESM-native (works with Next.js app directory imports), built-in coverage reporting.
- **Integration Tests (React Testing Library)**: Test components and API routes in isolation with realistic rendering (server/client component distinction).
- **E2E Tests (Playwright)**: Cover full user flows (login → create transaction → view dashboard) across real browsers.

**Coverage Strategy**:

```text
Unit Tests (60-70% of test suite):
- Utilities (currency formatting, date calculations, CSV escaping)
- Validation functions
- Pure components (CategoryBadge, EmptyState)
- API route handlers (mock Supabase client)

Integration Tests (20-30%):
- Component interactions (TransactionForm submission)
- Server component data fetching
- API route + database integration (using Supabase local instance)

E2E Tests (10%):
- Critical user flows (P1/P2 user stories)
- Cross-component workflows (create transaction → appears in dashboard)
- Authentication flows
```

**Test Configuration**:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["app/**", "components/**", "lib/**"],
      exclude: ["**/*.test.ts", "**/*.spec.ts", "**/types.ts"],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
    environment: "jsdom", // For React Testing Library
  },
});
```

**Best Practices**:

- Write tests before implementation (TDD Red-Green-Refactor)
- Test user-visible behavior, not implementation details (avoid testing state variables directly)
- Use `data-testid` sparingly; prefer accessible queries (`getByRole`, `getByLabelText`)
- Mock Supabase client in unit tests; use real local Supabase in integration tests
- Run E2E tests against deployed preview environments (not local dev)

**Alternatives Considered**:

- **Jest**: Rejected because Vitest is faster, has better ESM support, and simpler configuration for Next.js App Router.
- **Cypress**: Rejected in favor of Playwright due to better TypeScript support, faster execution, and built-in browser context isolation.

---

## 6. Dashboard Aggregation Strategy

### Decision: PostgreSQL Views + Caching with React Server Components

**Rationale**:

- **Performance**: Aggregating 10,000 transactions in PostgreSQL is faster than fetching all records and calculating in JavaScript
- **SQL Optimization**: Database indexes on `user_id`, `date`, `category_id` enable fast filtered aggregations
- **Caching**: Next.js automatic caching of server component fetches reduces database load for repeated dashboard views
- **Real-Time Updates**: Supabase real-time subscriptions can trigger client-side revalidation when transactions change

**Implementation Pattern**:

```typescript
// app/dashboard/page.tsx (Server Component)
export default async function DashboardPage({ searchParams }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const period = searchParams.period || 'month'; // day/week/month
  const { startDate, endDate } = getPeriodDates(period);

  // Aggregation query
  const { data: stats } = await supabase
    .rpc('get_dashboard_stats', {
      p_start_date: startDate,
      p_end_date: endDate
    });

  return <DashboardStats stats={stats} />;
}

// Database function (supabase/migrations/004_dashboard_functions.sql)
CREATE OR REPLACE FUNCTION get_dashboard_stats(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  total_income NUMERIC(12,2),
  total_expenses NUMERIC(12,2),
  net_balance NUMERIC(12,2),
  category_breakdown JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses,
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) AS net_balance,
    COALESCE(
      jsonb_agg(jsonb_build_object('category', c.name, 'amount', cat_totals.total))
      FILTER (WHERE cat_totals.total IS NOT NULL),
      '[]'::jsonb
    ) AS category_breakdown
  FROM transactions t
  LEFT JOIN categories c ON t.category_id = c.id
  WHERE t.user_id = auth.uid()
    AND t.date >= p_start_date
    AND t.date < p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Caching Strategy**:

- Next.js automatically caches server component fetches (default behavior)
- Use `revalidatePath('/dashboard')` after transaction mutations to invalidate cache
- Client-side real-time subscription triggers soft revalidation without full page reload

**Best Practices**:

- Create composite indexes: `CREATE INDEX idx_transactions_user_date ON transactions(user_id, date)`
- Use PostgreSQL aggregate functions (SUM, COUNT, GROUP BY) instead of fetching raw data
- Return pre-aggregated data from database functions (reduces data transfer)
- Test dashboard performance with 10k+ transaction datasets

**Alternatives Considered**:

- **Client-Side Aggregation**: Rejected due to poor performance and violates FR-003 performance goal (<1s for 10k transactions).
- **Materialized Views**: Rejected for initial version because real-time updates would require manual refresh triggers; can revisit if performance becomes issue at scale.

---

## 7. CSV Export Implementation

### Decision: Server-Side Generation with Streaming Response

**Rationale**:

- **Security**: Server-side generation ensures proper RLS enforcement (user can only export their own transactions)
- **Memory Efficiency**: Streaming response avoids loading all 1,000 transactions into memory simultaneously
- **Proper Escaping**: Server-side logic handles CSV special characters (commas, quotes, newlines) correctly

**Implementation Pattern**:

```typescript
// app/api/export/route.ts
import { createServerClient } from "@/lib/supabase/server";
import { escapeCSV } from "@/lib/utils/csv";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Apply filters from query params
  let query = supabase
    .from("transactions")
    .select("date, description, amount, type, categories(name)")
    .order("date", { ascending: false });

  // Apply filters (category, date range, type)
  // ... filter logic

  const { data: transactions } = await query;

  // Generate CSV
  const headers = ["Date", "Description", "Amount", "Type", "Category"];
  const csv = [
    headers.join(","),
    ...transactions.map((t) =>
      [
        t.date,
        escapeCSV(t.description),
        t.amount.toFixed(2),
        t.type,
        t.categories?.name || "Uncategorized",
      ].join(","),
    ),
  ].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="transactions-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}

// lib/utils/csv.ts
export function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
```

**Best Practices**:

- Use RFC 4180 CSV format (comma-separated, double-quote escaping)
- Include UTF-8 BOM (`\uFEFF`) for Excel compatibility if needed
- Generate filename with current date for user organization
- Respect active filters (export only visible transactions, not all)
- Limit export to reasonable size (e.g., 10,000 transactions max)

**Alternatives Considered**:

- **Client-Side CSV Generation**: Rejected due to security concerns (client could manipulate data) and FR-016 requirement for proper escaping.
- **Background Job + Download Link**: Rejected as overkill for initial version; useful if export times exceed 5s or file sizes exceed 5MB.

---

## 8. Authentication Flow

### Decision: Supabase Auth with Google + GitHub Social Login

**Rationale**:

- **Passwordless**: Social login reduces friction (no password creation/management)
- **Quick Onboarding**: Users authenticate in 1-2 clicks using existing accounts
- **Security**: OAuth providers handle credential security; Supabase manages session tokens
- **Constitution Compliance**: Supabase Auth per Principle IV

**Implementation Pattern**:

```typescript
// app/(auth)/login/page.tsx
'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
  const supabase = createClientComponentClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  const handleGitHubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div>
      <button onClick={handleGoogleLogin}>Sign in with Google</button>
      <button onClick={handleGitHubLogin}>Sign in with GitHub</button>
    </div>
  );
}

// app/auth/callback/route.ts (OAuth callback handler)
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}

// middleware.ts (Session refresh)
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  await supabase.auth.getSession(); // Refreshes expired sessions
  return res;
}
```

**Best Practices**:

- Configure OAuth apps in Google/GitHub consoles (add to Supabase dashboard)
- Use middleware to refresh sessions automatically (prevents unexpected logouts)
- Protect dashboard routes with auth checks in server components
- Handle OAuth errors gracefully (canceled login, invalid provider)
- Store user metadata (email, avatar URL) in Supabase auth.users table (auto-managed)

**Alternatives Considered**:

- **Email/Password Auth**: Rejected because social login provides better UX (faster onboarding, no password management) per FR-019 specification.
- **Magic Link Auth**: Considered as fallback but deferred to future iteration; social login covers majority use case.

---

## 9. Timezone Handling

### Decision: Store UTC, Display in User's Local Timezone

**Rationale**:

- **Consistency**: UTC storage eliminates DST ambiguities and ensures cross-timezone data integrity
- **User Experience**: Display dates in user's local timezone so transactions appear on correct calendar day
- **Date Boundaries**: Dashboard filters (day/week/month) calculated in user's timezone to match user expectations

**Implementation Pattern**:

```typescript
// Storage: Always UTC
const transaction = {
  date: new Date().toISOString(), // "2026-02-11T14:30:00.000Z"
};

// Display: User's timezone
export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Dashboard filter boundaries (day/week/month in user's timezone)
export function getPeriodDates(period: "day" | "week" | "month"): {
  startDate: string;
  endDate: string;
} {
  const now = new Date();
  let start: Date;

  switch (period) {
    case "day":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "week":
      const dayOfWeek = now.getDay();
      start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - dayOfWeek,
      );
      break;
    case "month":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }

  const end = new Date(start);
  end.setDate(
    end.getDate() + (period === "day" ? 1 : period === "week" ? 7 : 31),
  );

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}
```

**Best Practices**:

- Store all timestamps as `TIMESTAMPTZ` in PostgreSQL (includes timezone info)
- Never use local time in database queries (always convert to UTC for comparisons)
- Date picker component should submit ISO strings with timezone offset
- Test with users in different timezones (UTC, PST, JST) to verify correct date boundaries

**Alternatives Considered**:

- **Store User's Local Time**: Rejected because it breaks when user travels or changes timezone; UTC storage is industry standard.
- **Ignore Timezones**: Rejected per FR-022 requirement; financial data must appear on correct calendar day for user.

---

## 10. Mobile Responsiveness

### Decision: Mobile-First CSS with Tailwind Breakpoints

**Rationale**:

- **Accessibility**: 320px minimum width (FR-021) ensures usability on smallest modern smartphones (iPhone SE)
- **Performance**: Mobile-first CSS reduces initial bundle size (desktop styles loaded conditionally)
- **Consistency**: Tailwind utility classes provide consistent responsive behaviors

**Implementation Pattern**:

```typescript
// Tailwind breakpoints (tailwind.config.js)
module.exports = {
  theme: {
    screens: {
      'sm': '640px',  // Small tablets
      'md': '768px',  // Tablets
      'lg': '1024px', // Desktops
      'xl': '1280px', // Large desktops
    },
  },
};

// Mobile-first component example
export function TransactionList({ transactions }) {
  return (
    <div className="space-y-2 md:space-y-4">
      {transactions.map(t => (
        <div key={t.id} className="
          p-3 md:p-4
          flex flex-col md:flex-row md:items-center
          space-y-2 md:space-y-0 md:space-x-4
          border rounded
        ">
          <div className="flex-1">
            <p className="font-semibold text-sm md:text-base">{t.description}</p>
            <p className="text-xs md:text-sm text-gray-500">{formatDate(t.date)}</p>
          </div>
          <p className={`text-lg md:text-xl font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(t.amount)}
          </p>
        </div>
      ))}
    </div>
  );
}
```

**Best Practices**:

- Test on real devices (iPhone, Android) using responsive dev tools
- Use touch-friendly tap targets (min 44x44px per iOS HIG)
- Collapse navigation to hamburger menu on mobile (<768px)
- Stack form fields vertically on mobile, horizontal on tablet+
- Use `viewport` meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1" />`

**Alternatives Considered**:

- **Desktop-First Design**: Rejected because majority users access financial apps on mobile; mobile-first ensures best experience for primary use case.
- **Separate Mobile App**: Rejected as out of scope for initial version; responsive web app covers all devices per FR-021.

---

## Summary of Key Decisions

| Decision Area  | Choice                                            | Rationale                                               |
| -------------- | ------------------------------------------------- | ------------------------------------------------------- |
| Architecture   | Next.js 14+ App Router (Server Components)        | Type-safe full-stack, performance, constitution mandate |
| Database       | Supabase with RLS policies                        | Security at DB level, real-time, edge compatible        |
| Type Safety    | TypeScript strict mode + generated DB types       | Constitution mandate, prevents runtime errors           |
| Financial Data | PostgreSQL NUMERIC(12,2) + server-side arithmetic | Decimal precision, no floating-point errors             |
| Testing        | Vitest + RTL + Playwright (3-layer)               | Fast, TypeScript-native, 100% coverage enforcement      |
| Dashboard      | PostgreSQL views + React Server Components        | Performance (<1s for 10k transactions)                  |
| CSV Export     | Server-side generation with streaming             | Security, proper escaping, RLS enforcement              |
| Authentication | Supabase Auth (Google + GitHub social login)      | Passwordless, quick onboarding, constitution mandate    |
| Timezone       | Store UTC, display local                          | Data integrity, correct calendar day display            |
| Mobile         | Mobile-first responsive (320px min)               | Primary use case, FR-021 requirement                    |

---

## Next Steps

**Phase 1 Outputs**:

1. **data-model.md**: Define database schema with explicit foreign keys, indexes, RLS policies
2. **contracts/**: OpenAPI specs for API routes (`/api/transactions`, `/api/categories`, `/api/dashboard`, `/api/export`)
3. **quickstart.md**: Setup instructions (install Next.js, initialize Supabase, run migrations, configure OAuth)
4. **Agent Context Update**: Add Next.js, Supabase, Vitest to agent-specific context files

**Constitutional Re-Check After Phase 1**:

- Verify database schema includes RLS policies (Principle IV)
- Confirm API contracts have TypeScript types (Principle I)
- Ensure test scaffolding ready for TDD workflow (Principle II)
