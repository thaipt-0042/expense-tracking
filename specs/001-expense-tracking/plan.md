# Implementation Plan: Expense Tracking Application

**Branch**: `001-expense-tracking` | **Date**: 2026-02-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-expense-tracking/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a full-stack expense tracking application enabling users to record financial transactions (income/expense), categorize them, visualize spending through a dashboard with time-period filters, and export data to CSV. Core workflow: create transactions → assign categories → view insights on dashboard. Built with Next.js 14+ (App Router) for unified frontend/backend, TypeScript strict mode, Supabase for PostgreSQL database + authentication, following TDD with 100% test coverage mandate.

## Technical Context

**Language/Version**: TypeScript 5.3+ with strict mode enabled, no implicit any  
**Primary Dependencies**: Next.js 14+ (App Router), React 18+, Supabase client libraries (@supabase/supabase-js, @supabase/auth-helpers-nextjs)  
**Storage**: Supabase (PostgreSQL 15+) with Row Level Security policies, connection pooling for edge compatibility  
**Testing**: Vitest 1+ with React Testing Library for component tests, Playwright for E2E testing  
**Target Platform**: Web application deployed to Vercel (primary) and Cloudflare Workers (secondary) - edge runtime compatible  
**Project Type**: Web (full-stack Next.js - single codebase for frontend and backend)  
**Performance Goals**: Transaction creation <3s end-to-end, dashboard calculations <1s for 10k transactions, search/filter <500ms, CSV export <5s for 1k transactions, time filter changes <200ms  
**Constraints**: Edge runtime compatible (<10s serverless execution), stateless functions, RLS enforcement at database level, mobile-responsive (320px minimum width), 95% success rate for user operations  
**Scale/Scope**: Support up to 10,000 transactions per user, real-time dashboard updates, multi-device access with eventual consistency, amounts up to 999,999,999.99, timezone-aware date handling

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Principle I: TypeScript-First & Type Safety ✅

- **Status**: COMPLIANT
- **Evidence**: Technical context specifies TypeScript 5.3+ strict mode with no implicit any. All entities (Transaction, Category, User) require explicit type definitions. Supabase client provides generated types from database schema.
- **Action**: Database schema types will be generated via `supabase gen types typescript` and imported across codebase.

### Principle II: Full Test Coverage (NON-NEGOTIABLE) ✅

- **Status**: COMPLIANT
- **Evidence**: Testing framework selected (Vitest + React Testing Library). Feature spec includes testable acceptance scenarios for all 5 user stories with independent test verification. TDD workflow enforced: tests first (Red), implement (Green), refactor.
- **Action**: Test files will be created before implementation files in Phase 2. Coverage gates configured in vitest.config.ts with 100% threshold.

### Principle III: Full-Stack Next.js Architecture ✅

- **Status**: COMPLIANT
- **Evidence**: Technical context specifies Next.js 14+ App Router for both frontend and backend. API routes implemented as Route Handlers in app/api structure. Server components by default, client components only when interactivity needed.
- **Action**: Project structure will use app/ directory with route handlers for API endpoints. Server actions used for mutations (create/update/delete transactions).

### Principle IV: Supabase Integration Standard ✅

- **Status**: COMPLIANT
- **Evidence**: Technical context specifies Supabase as single data source with RLS policies required. Authentication via Supabase Auth (Google + GitHub social login per FR-019). Real-time subscriptions for dashboard updates.
- **Action**: RLS policies will be defined for transactions and categories tables isolating user data. Migration files created for all schema changes in supabase/migrations/.

### Principle V: Cloud-Ready Deployment ✅

- **Status**: COMPLIANT
- **Evidence**: Target platform includes both Vercel and Cloudflare Workers. Edge runtime compatibility specified with stateless functions, connection pooling, <10s execution constraint.
- **Action**: Environment variables for Supabase credentials. Build output optimized for edge deployment. No file system dependencies except during build.

### Overall Assessment: **APPROVED** - No constitutional violations. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/                          # Next.js 14+ App Router directory
├── api/                      # API Route Handlers
│   ├── transactions/         # Transaction CRUD endpoints
│   │   ├── route.ts          # GET (list), POST (create)
│   │   └── [id]/
│   │       └── route.ts      # GET, PATCH, DELETE (single transaction)
│   ├── categories/           # Category CRUD endpoints
│   │   ├── route.ts
│   │   └── [id]/
│   │       └── route.ts
│   ├── dashboard/
│   │   └── route.ts          # Dashboard aggregation endpoint
│   └── export/
│       └── route.ts          # CSV export endpoint
├── (auth)/                   # Auth route group
│   ├── login/
│   │   └── page.tsx          # Login page with Supabase Auth
│   └── callback/
│       └── route.ts          # OAuth callback handler
├── dashboard/
│   └── page.tsx              # Dashboard page (server component)
├── transactions/
│   ├── page.tsx              # Transaction list page (server component)
│   └── [id]/
│       └── page.tsx          # Transaction detail/edit page
├── categories/
│   └── page.tsx              # Category management page
├── layout.tsx                # Root layout with auth provider
├── page.tsx                  # Home/landing page
└── globals.css               # Global styles

components/                   # Reusable React components
├── transactions/
│   ├── TransactionForm.tsx   # Create/edit form (client component)
│   ├── TransactionList.tsx   # List view (client component)
│   └── TransactionItem.tsx   # Single transaction card
├── categories/
│   ├── CategoryForm.tsx
│   ├── CategoryList.tsx
│   └── CategoryBadge.tsx     # Visual category indicator
├── dashboard/
│   ├── DashboardStats.tsx    # Income/expense/balance summary
│   ├── TimePeriodFilter.tsx  # Day/week/month filter (client component)
│   └── CategoryBreakdown.tsx # Category spending chart
├── ui/                       # Generic UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   └── EmptyState.tsx
└── providers/
    └── SupabaseProvider.tsx  # Auth context provider

lib/                          # Shared utilities and configurations
├── supabase/
│   ├── client.ts             # Browser Supabase client
│   ├── server.ts             # Server Supabase client (with cookies)
│   └── types.ts              # Generated database types
├── utils/
│   ├── currency.ts           # Currency formatting utilities
│   ├── date.ts               # Date/timezone utilities
│   ├── csv.ts                # CSV generation/escaping
│   └── validation.ts         # Shared validation functions
└── constants.ts              # App-wide constants

supabase/                     # Supabase configuration
├── migrations/               # Database migrations
│   ├── 001_initial_schema.sql
│   ├── 002_rls_policies.sql
│   └── 003_indexes.sql
└── config.toml               # Supabase local config

tests/                        # Test files (mirrors app/ structure)
├── unit/
│   ├── lib/
│   │   ├── utils/           # Unit tests for utilities
│   │   └── validation.test.ts
│   └── components/          # Component unit tests
│       ├── TransactionForm.test.tsx
│       └── CategoryBadge.test.tsx
├── integration/
│   ├── api/                 # API route integration tests
│   │   ├── transactions.test.ts
│   │   └── dashboard.test.ts
│   └── pages/               # Page integration tests
│       └── dashboard.test.tsx
└── e2e/                     # Playwright E2E tests
    ├── transaction-flow.spec.ts
    ├── category-management.spec.ts
    └── dashboard-filters.spec.ts

public/                      # Static assets
└── icons/                   # Category icons

```

**Structure Decision**: Next.js 14+ App Router with unified frontend/backend. Server components used by default for pages, client components for interactive forms and filters. API routes implemented as Route Handlers in app/api/. Supabase client instantiation split between browser (lib/supabase/client.ts) and server (lib/supabase/server.ts with cookie handling for auth). Test directory mirrors app structure for easy navigation. Migrations stored in supabase/ following Supabase CLI conventions.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: No constitutional violations detected. All principles compliant. This section intentionally left empty.
