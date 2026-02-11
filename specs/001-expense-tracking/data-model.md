# Data Model: Expense Tracking Application

**Feature**: 001-expense-tracking  
**Date**: 2026-02-11  
**Phase**: Phase 1 - Database Schema Design

## Overview

This document defines the complete database schema for the expense tracking application. The schema uses PostgreSQL 15+ features via Supabase with Row Level Security (RLS) policies ensuring user data isolation. All tables use UUID primary keys, timestamp audit fields, and explicit foreign key constraints with proper indexing for query performance.

---

## Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ transactions : owns
    users ||--o{ categories : owns
    categories ||--o{ transactions : categorizes

    users {
        uuid id PK
        string email UK
        timestamptz created_at
        timestamptz last_sign_in_at
    }

    transactions {
        uuid id PK
        uuid user_id FK
        numeric(12,2) amount
        text description
        timestamptz date
        enum type
        uuid category_id FK_NULL
        timestamptz created_at
        timestamptz updated_at
    }

    categories {
        uuid id PK
        uuid user_id FK
        text name
        text color
        text icon_id
        timestamptz created_at
    }
```

---

## Table Definitions

### 1. users (Managed by Supabase Auth)

**Purpose**: Store authenticated user accounts. Managed entirely by Supabase Auth; application code references via `auth.uid()`.

**Schema**:

```sql
-- This table exists in auth.users (Supabase managed)
-- Reference only, do not modify directly
CREATE TABLE auth.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  encrypted_password TEXT,
  email_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sign_in_at TIMESTAMPTZ,
  -- ... other Supabase Auth fields
);
```

**Notes**:

- Supabase Auth manages this table automatically
- OAuth providers (Google, GitHub) populate `email` and user metadata
- Application references users via `auth.uid()` in RLS policies
- No direct INSERT/UPDATE/DELETE from application code

---

### 2. categories

**Purpose**: Store user-defined expense/income categories for transaction organization.

**Schema**:

```sql
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6B7280', -- Hex color code (e.g., #10B981 for green)
  icon_id TEXT, -- Icon identifier for UI (e.g., 'food', 'transport', 'salary')
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT categories_name_length CHECK (char_length(name) BETWEEN 1 AND 50),
  CONSTRAINT categories_color_format CHECK (color ~* '^#[0-9A-F]{6}$'),
  CONSTRAINT categories_user_name_unique UNIQUE (user_id, name) -- User cannot have duplicate category names
);

-- Indexes
CREATE INDEX idx_categories_user_id ON public.categories(user_id);

-- Comments
COMMENT ON TABLE public.categories IS 'User-defined categories for organizing transactions';
COMMENT ON COLUMN public.categories.icon_id IS 'Optional icon identifier for UI rendering (e.g., heroicons name)';
```

**Attributes**:

- `id`: UUID primary key (auto-generated)
- `user_id`: Foreign key to auth.users (CASCADE delete ensures categories removed when user deleted)
- `name`: Category name (e.g., "Food", "Rent", "Salary"), 1-50 characters
- `color`: Hex color code for visual distinction in UI (default gray #6B7280)
- `icon_id`: Optional icon identifier for rendering category icons (e.g., 'heroicons:shopping-cart')
- `created_at`: Timestamp of category creation

**Validation Rules**:

- Name must be 1-50 characters (FR-004)
- Color must be valid 6-character hex code (e.g., #10B981)
- User cannot create duplicate category names (enforced by unique constraint)

**Business Rules**:

- Categories are optional for transactions (transactions can be uncategorized)
- Deleting a category sets `category_id = NULL` on associated transactions (handled by ON DELETE SET NULL in transactions table)
- Users can only access their own categories (enforced by RLS)

---

### 3. transactions

**Purpose**: Store individual financial transactions (income or expense) with optional category assignment.

**Schema**:

```sql
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT transactions_amount_positive CHECK (amount > 0),
  CONSTRAINT transactions_amount_max CHECK (amount <= 999999999.99),
  CONSTRAINT transactions_type_valid CHECK (type IN ('income', 'expense')),
  CONSTRAINT transactions_description_length CHECK (char_length(description) BETWEEN 1 AND 500)
);

-- Indexes (critical for performance)
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, date DESC); -- For dashboard time filters
CREATE INDEX idx_transactions_user_category ON public.transactions(user_id, category_id); -- For category filtering
CREATE INDEX idx_transactions_user_type ON public.transactions(user_id, type); -- For income/expense filtering
CREATE INDEX idx_transactions_description_gin ON public.transactions USING gin(to_tsvector('english', description)); -- For search

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE public.transactions IS 'Financial transactions (income and expenses) with optional category assignment';
COMMENT ON COLUMN public.transactions.amount IS 'Transaction amount in currency units (max 999,999,999.99 with 2 decimal places)';
COMMENT ON COLUMN public.transactions.description IS 'User-provided description of the transaction';
COMMENT ON COLUMN public.transactions.date IS 'Transaction date in UTC (displayed in user timezone)';
COMMENT ON COLUMN public.transactions.type IS 'Transaction type: income or expense';
```

**Attributes**:

- `id`: UUID primary key (auto-generated)
- `user_id`: Foreign key to auth.users (CASCADE delete ensures transactions removed when user deleted)
- `amount`: NUMERIC(12,2) - exact decimal precision for currency (up to 999,999,999.99), always positive
- `description`: Text description (1-500 characters) - user-provided context about transaction
- `date`: TIMESTAMPTZ - transaction date with timezone (stored in UTC, displayed in user local time)
- `type`: Enum-style TEXT constraint - either 'income' or 'expense'
- `category_id`: Optional foreign key to categories (NULL for uncategorized transactions, CASCADE SET NULL on category deletion)
- `created_at`: Timestamp of transaction creation
- `updated_at`: Timestamp of last update (auto-updated via trigger)

**Validation Rules**:

- Amount must be positive (0.01 to 999,999,999.99) with exactly 2 decimal places (FR-002)
- Type must be exactly 'income' or 'expense' (case-sensitive)
- Description must be 1-500 characters (FR-001)
- Date cannot be null (user can set future dates with optional warning in UI)

**Business Rules**:

- Transactions are immutable after creation except via explicit edit action (audit trail via updated_at)
- Deleting a category does not delete transactions; they become uncategorized (category_id = NULL)
- Users can only access their own transactions (enforced by RLS)
- Date stored in UTC; UI responsible for timezone conversion (FR-022)

---

## Row Level Security (RLS) Policies

**Security Model**: All data access filtered by authenticated user ID. Users can only access their own categories and transactions. RLS enforced at database level prevents authorization bugs in application code.

### categories RLS Policies

```sql
-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- SELECT policy: Users can view only their own categories
CREATE POLICY "Users can view their own categories"
  ON public.categories
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT policy: Users can create categories for themselves
CREATE POLICY "Users can create their own categories"
  ON public.categories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE policy: Users can update only their own categories
CREATE POLICY "Users can update their own categories"
  ON public.categories
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE policy: Users can delete only their own categories
CREATE POLICY "Users can delete their own categories"
  ON public.categories
  FOR DELETE
  USING (auth.uid() = user_id);
```

### transactions RLS Policies

```sql
-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- SELECT policy: Users can view only their own transactions
CREATE POLICY "Users can view their own transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT policy: Users can create transactions for themselves
CREATE POLICY "Users can create their own transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE policy: Users can update only their own transactions
CREATE POLICY "Users can update their own transactions"
  ON public.transactions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE policy: Users can delete only their own transactions
CREATE POLICY "Users can delete their own transactions"
  ON public.transactions
  FOR DELETE
  USING (auth.uid() = user_id);
```

**RLS Testing**:

```sql
-- Test as authenticated user (should see only own data)
SET request.jwt.claims.sub = '[user-uuid]';
SELECT * FROM transactions; -- Returns only transactions where user_id = [user-uuid]

-- Test as anonymous user (should see nothing)
RESET request.jwt.claims.sub;
SELECT * FROM transactions; -- Returns empty set (no auth.uid())
```

---

## Database Functions

### get_dashboard_stats

**Purpose**: Aggregate transaction data for dashboard display with time period filtering.

**Signature**:

```sql
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  total_income NUMERIC(12,2),
  total_expenses NUMERIC(12,2),
  net_balance NUMERIC(12,2),
  category_breakdown JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) AS total_income,
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS total_expenses,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount WHEN t.type = 'expense' THEN -t.amount ELSE 0 END), 0) AS net_balance,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'category_id', COALESCE(c.id::TEXT, 'uncategorized'),
          'category_name', COALESCE(c.name, 'Uncategorized'),
          'category_color', COALESCE(c.color, '#6B7280'),
          'total_amount', cat_totals.total
        )
        ORDER BY cat_totals.total DESC
      ) FILTER (WHERE cat_totals.total IS NOT NULL),
      '[]'::jsonb
    ) AS category_breakdown
  FROM public.transactions t
  LEFT JOIN public.categories c ON t.category_id = c.id
  LEFT JOIN LATERAL (
    SELECT
      COALESCE(t.category_id, 'uncategorized'::TEXT)::TEXT AS cat_id,
      SUM(t.amount) AS total
    FROM public.transactions t
    WHERE t.user_id = auth.uid()
      AND t.date >= p_start_date
      AND t.date < p_end_date
    GROUP BY COALESCE(t.category_id, 'uncategorized'::TEXT)::TEXT
  ) cat_totals ON COALESCE(c.id::TEXT, 'uncategorized') = cat_totals.cat_id
  WHERE t.user_id = auth.uid()
    AND t.date >= p_start_date
    AND t.date < p_end_date;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats TO authenticated;

-- Comment
COMMENT ON FUNCTION public.get_dashboard_stats IS 'Aggregate transaction statistics for dashboard with time period filtering. Returns total income, expenses, net balance, and category breakdown.';
```

**Usage Example**:

```typescript
// app/dashboard/page.tsx
const { data: stats } = await supabase.rpc("get_dashboard_stats", {
  p_start_date: "2026-02-01T00:00:00Z",
  p_end_date: "2026-03-01T00:00:00Z",
});

// stats = {
//   total_income: 5000.00,
//   total_expenses: 3200.50,
//   net_balance: 1799.50,
//   category_breakdown: [
//     { category_id: 'uuid-1', category_name: 'Food', category_color: '#10B981', total_amount: 850.00 },
//     { category_id: 'uuid-2', category_name: 'Transport', category_color: '#3B82F6', total_amount: 450.00 },
//     { category_id: 'uncategorized', category_name: 'Uncategorized', category_color: '#6B7280', total_amount: 200.00 }
//   ]
// }
```

**Performance**:

- Utilizes composite index `idx_transactions_user_date` for fast filtering
- Returns pre-aggregated data (reduces data transfer)
- `SECURITY DEFINER` respects RLS policies (uses caller's auth.uid())
- Expected execution time: <100ms for 10,000 transactions

---

## TypeScript Type Definitions

**Generated via**: `supabase gen types typescript --local > lib/supabase/types.ts`

**Expected Output**:

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          icon_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          icon_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          icon_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          description: string;
          date: string;
          type: "income" | "expense";
          category_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
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
          id?: string;
          user_id?: string;
          amount?: number;
          description?: string;
          date?: string;
          type?: "income" | "expense";
          category_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      get_dashboard_stats: {
        Args: {
          p_start_date: string;
          p_end_date: string;
        };
        Returns: {
          total_income: number;
          total_expenses: number;
          net_balance: number;
          category_breakdown: Json;
        }[];
      };
    };
  };
}

// Helper types
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type CategoryInsert =
  Database["public"]["Tables"]["categories"]["Insert"];
export type CategoryUpdate =
  Database["public"]["Tables"]["categories"]["Update"];

export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type TransactionInsert =
  Database["public"]["Tables"]["transactions"]["Insert"];
export type TransactionUpdate =
  Database["public"]["Tables"]["transactions"]["Update"];

export type DashboardStats =
  Database["public"]["Functions"]["get_dashboard_stats"]["Returns"][0];
```

---

## Migration Files

**Location**: `supabase/migrations/`

### 001_initial_schema.sql

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6B7280',
  icon_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT categories_name_length CHECK (char_length(name) BETWEEN 1 AND 50),
  CONSTRAINT categories_color_format CHECK (color ~* '^#[0-9A-F]{6}$'),
  CONSTRAINT categories_user_name_unique UNIQUE (user_id, name)
);

CREATE INDEX idx_categories_user_id ON public.categories(user_id);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT transactions_amount_positive CHECK (amount > 0),
  CONSTRAINT transactions_amount_max CHECK (amount <= 999999999.99),
  CONSTRAINT transactions_type_valid CHECK (type IN ('income', 'expense')),
  CONSTRAINT transactions_description_length CHECK (char_length(description) BETWEEN 1 AND 500)
);

-- Indexes for performance
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX idx_transactions_user_category ON public.transactions(user_id, category_id);
CREATE INDEX idx_transactions_user_type ON public.transactions(user_id, type);
CREATE INDEX idx_transactions_description_gin ON public.transactions USING gin(to_tsvector('english', description));

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### 002_rls_policies.sql

```sql
-- Categories RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own categories"
  ON public.categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categories"
  ON public.categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON public.categories FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON public.categories FOR DELETE
  USING (auth.uid() = user_id);

-- Transactions RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);
```

### 003_dashboard_functions.sql

```sql
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  total_income NUMERIC(12,2),
  total_expenses NUMERIC(12,2),
  net_balance NUMERIC(12,2),
  category_breakdown JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) AS total_income,
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS total_expenses,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount WHEN t.type = 'expense' THEN -t.amount ELSE 0 END), 0) AS net_balance,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'category_id', COALESCE(c.id::TEXT, 'uncategorized'),
          'category_name', COALESCE(c.name, 'Uncategorized'),
          'category_color', COALESCE(c.color, '#6B7280'),
          'total_amount', cat_totals.total
        )
        ORDER BY cat_totals.total DESC
      ) FILTER (WHERE cat_totals.total IS NOT NULL),
      '[]'::jsonb
    ) AS category_breakdown
  FROM public.transactions t
  LEFT JOIN public.categories c ON t.category_id = c.id
  LEFT JOIN LATERAL (
    SELECT
      COALESCE(t.category_id, 'uncategorized'::TEXT)::TEXT AS cat_id,
      SUM(t.amount) AS total
    FROM public.transactions t
    WHERE t.user_id = auth.uid()
      AND t.date >= p_start_date
      AND t.date < p_end_date
    GROUP BY COALESCE(t.category_id, 'uncategorized'::TEXT)::TEXT
  ) cat_totals ON COALESCE(c.id::TEXT, 'uncategorized') = cat_totals.cat_id
  WHERE t.user_id = auth.uid()
    AND t.date >= p_start_date
    AND t.date < p_end_date;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_dashboard_stats TO authenticated;

COMMENT ON FUNCTION public.get_dashboard_stats IS 'Aggregate transaction statistics for dashboard with time period filtering';
```

---

## Data Validation Summary

| Field                      | Validation Rule                          | DB Constraint                                                           | Application Validation   |
| -------------------------- | ---------------------------------------- | ----------------------------------------------------------------------- | ------------------------ |
| `transactions.amount`      | Positive, max 999,999,999.99, 2 decimals | `CHECK (amount > 0 AND amount <= 999999999.99)`                         | Zod schema in API routes |
| `transactions.type`        | Must be 'income' or 'expense'            | `CHECK (type IN ('income', 'expense'))`                                 | TypeScript literal type  |
| `transactions.description` | 1-500 characters                         | `CHECK (char_length(description) BETWEEN 1 AND 500)`                    | Zod `.min(1).max(500)`   |
| `transactions.date`        | Valid timestamp                          | `TIMESTAMPTZ NOT NULL`                                                  | Date validation in forms |
| `categories.name`          | 1-50 characters, unique per user         | `CHECK (char_length(name) BETWEEN 1 AND 50)` + `UNIQUE (user_id, name)` | Zod + duplicate check    |
| `categories.color`         | Valid hex color (e.g., #10B981)          | `CHECK (color ~* '^#[0-9A-F]{6}$')`                                     | Color picker component   |

---

## Performance Considerations

**Index Strategy**:

- Composite index on `(user_id, date DESC)` enables fast dashboard queries with time filters
- GIN index on `description` tsvector enables full-text search (FR-012)
- Individual indexes on `user_id`, `category_id`, `type` support filtering operations

**Query Optimization**:

- Dashboard aggregation uses PostgreSQL `SUM()` and `GROUP BY` (sub-100ms for 10k rows)
- `SECURITY DEFINER` function reduces round trips (single RPC call instead of multiple queries)
- RLS policies use indexed `user_id` column for fast filtering

**Scalability**:

- Current design supports 10,000 transactions per user efficiently
- Beyond 100k transactions: consider partitioning by date range
- Real-time subscriptions use PostgreSQL LISTEN/NOTIFY (low overhead)

---

## Next Steps

1. **Create migration files** in `supabase/migrations/` directory
2. **Apply migrations** via Supabase CLI: `supabase migration up`
3. **Generate TypeScript types**: `supabase gen types typescript --local > lib/supabase/types.ts`
4. **Test RLS policies** with sample users at different permission levels
5. **Verify indexes** with `EXPLAIN ANALYZE` on dashboard queries
6. **Proceed to API contract definition** (Phase 1 next step)
