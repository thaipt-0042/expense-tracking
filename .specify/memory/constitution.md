<!--
═══════════════════════════════════════════════════════════════════════════
SYNC IMPACT REPORT - Constitution Initial Ratification
═══════════════════════════════════════════════════════════════════════════

Version Change: N/A → 1.0.0 (Initial Ratification)
Date: 2026-02-11

═══ PRINCIPLES ESTABLISHED ═══
✓ I. TypeScript-First & Type Safety (NEW)
✓ II. Full Test Coverage - Non-Negotiable (NEW)
✓ III. Full-Stack Next.js Architecture (NEW)
✓ IV. Supabase Integration Standard (NEW)
✓ V. Cloud-Ready Deployment (NEW)

═══ SECTIONS ADDED ═══
✓ Technology Stack Constraints (NEW)
✓ Development Workflow (NEW)
✓ Governance (NEW)

═══ TEMPLATES SYNC STATUS ═══
✅ plan-template.md - Compatible with constitution principles
   - Constitution Check section will enforce test-first, TypeScript standards
   - Technical Context section supports Next.js, Supabase, TypeScript stack

✅ spec-template.md - Compatible with constitution principles
   - User story structure supports independent testing (Principle II)
   - Functional requirements align with type safety and testing mandates

✅ tasks-template.md - Compatible with constitution principles
   - Phase structure supports test-first workflow (tests before implementation)
   - Parallel task markers support modular development
   - User story grouping enables incremental delivery

⚠  PENDING FOLLOW-UP ACTIONS ⚠
→ Verify .github/prompts/speckit.*.prompt.md files reference correct principles
→ Ensure any agent-specific guidance files mention TypeScript, Next.js standards
→ Create tsconfig.json with strict mode when project initializes
→ Setup test framework configuration (Jest/Vitest) with 100% coverage gates
→ Configure Supabase project and environment variables template

═══ DEFERRED ITEMS ═══
None - all placeholders filled with concrete values

═══════════════════════════════════════════════════════════════════════════
-->

# Expense Tracker Constitution

## Core Principles

### I. TypeScript-First & Type Safety

TypeScript MUST be used for all application code; strict mode required with no implicit any types; all data structures, API contracts, database schemas, and component props MUST have explicit type definitions; type inference is permitted only where types are unambiguous; any files requiring type assertions or suppressions MUST document justification in comments.

**Rationale**: Type safety prevents entire classes of runtime errors, enables superior IDE support and refactoring capabilities, serves as living documentation, and is essential for maintainable full-stack development in Next.js where code crosses server/client boundaries.

### II. Full Test Coverage (NON-NEGOTIABLE)

100% unit test coverage MUST be maintained for all application code; Test-Driven Development (TDD) cycle strictly enforced: write tests → tests fail (Red) → implement minimum code to pass (Green) → refactor while maintaining passing tests; every function, component, API route, utility, and business logic module MUST have corresponding test coverage; pull requests failing coverage gates MUST be rejected; coverage measured via line, branch, and statement metrics.

**Rationale**: 100% coverage ensures code reliability, enables fearless refactoring, serves as executable documentation, catches regressions immediately, and maintains quality as the codebase scales. In financial tracking applications, correctness is paramount.

### III. Full-Stack Next.js Architecture

Next.js 14+ App Router MUST be used for both frontend and backend; server components preferred by default, client components only when interactivity required; API routes implemented as Next.js Route Handlers (app/api structure); server actions used for mutations; clear separation between server-side and client-side code; shared utilities MUST be framework-agnostic and importable from both contexts; no Express or external HTTP servers permitted.

**Rationale**: Unified full-stack framework reduces context switching, enables type-safe end-to-end data flow, optimizes bundle size automatically, simplifies deployment, and leverages React Server Components for superior performance and developer experience.

### IV. Supabase Integration Standard

Supabase MUST be the single source of truth for data persistence and authentication; database access via Supabase client libraries only; Row Level Security (RLS) policies MUST be defined for all tables; authentication flows via Supabase Auth; real-time subscriptions preferred for live data updates; migration files required for all schema changes; no direct SQL manipulation in application code except within migrations; foreign key constraints and indexes defined at database level.

**Rationale**: Supabase provides production-ready PostgreSQL with built-in auth, real-time capabilities, and automatic API generation. RLS ensures data security at the database level, preventing authorization bugs. Centralized schema management prevents drift.

### V. Cloud-Ready Deployment

Application MUST be deployable to both Vercel and Cloudflare Workers without code changes; environment-specific configuration via environment variables only; no file system dependencies except during build; database connections via connection pooling (Supabase edge functions compatible); edge runtime compatibility required; serverless function constraints respected (<10s execution, stateless); build output optimized for edge deployment.

**Rationale**: Edge deployment ensures global low latency, automatic scaling, and cost efficiency. Dual-platform compatibility prevents vendor lock-in and provides deployment flexibility. Edge-first design enforces good architectural practices.

## Technology Stack Constraints

**Language**: TypeScript 5.3+ with strict mode enabled  
**Framework**: Next.js 14+ (App Router)  
**Database**: Supabase (PostgreSQL 15+)  
**Authentication**: Supabase Auth  
**Testing**: Jest 29+ or Vitest 1+ with React Testing Library  
**Deployment Targets**: Vercel (primary), Cloudflare Workers (secondary)  
**Package Manager**: npm 10+ or pnpm 8+  
**Node.js Version**: 20.x LTS  
**Linting**: ESLint 8+ with TypeScript parser  
**Formatting**: Prettier 3+

**Prohibited Dependencies**:

- Express.js or other HTTP servers (use Next.js API routes)
- Client-side only state management requiring SSR workarounds (use React Context or URL state)
- ORMs incompatible with Supabase's Postgres (use Supabase client)
- Testing frameworks without coverage reporting

## Development Workflow

**Pre-Implementation Phase**:

1. Specification created in `/specs/[###-feature-name]/spec.md` with testable user stories
2. Implementation plan generated in `/specs/[###-feature-name]/plan.md` with constitution check
3. Tests written first and verified to fail (Red phase)
4. User reviews and approves test scenarios before implementation begins

**Implementation Phase**:

1. Implement minimum code to pass tests (Green phase)
2. Refactor while maintaining passing tests
3. Run linter and type checker before commit
4. Verify 100% coverage maintained
5. Update documentation if public APIs changed

**Code Review Requirements**:

- All tests passing (coverage >= 100%)
- TypeScript strict mode compliance
- No type assertions without documented justification
- Supabase RLS policies reviewed for new tables
- Edge runtime compatibility verified for server code
- Constitution compliance checked per plan.md gates

**Quality Gates**:

- Unit tests: 100% coverage required
- Type checking: Zero TypeScript errors
- Linting: Zero ESLint errors
- Build: Successful production build
- Runtime: No console errors in test scenarios

## Governance

This constitution supersedes all other development practices, style guides, and conventions.

**Amendment Process**:

1. Proposed changes documented with rationale and impact analysis
2. Validation against existing specs, plans, and codebase required
3. Approval via project consensus or maintainer decision
4. Version bumping per semantic versioning:
   - **MAJOR**: Backward incompatible changes (e.g., removing principles, changing core stack)
   - **MINOR**: Additive changes (e.g., new principles, expanded guidance)
   - **PATCH**: Clarifications, typo fixes, non-semantic refinements
5. Migration plan required for breaking changes
6. All templates and documentation updated before amendment finalized

**Compliance Enforcement**:

- Every pull request MUST pass constitutional checks defined in plan.md
- Constitution violations require explicit justification and technical review
- Systematic violations trigger constitution amendment discussions
- New team members MUST review constitution during onboarding

**Runtime Development Guidance**:  
For detailed implementation patterns, coding standards, and framework-specific best practices, refer to project documentation in `/docs/` and `.github/prompts/` when created. This constitution defines non-negotiable principles; implementation guidance provides recommended patterns within these constraints.

**Version**: 1.0.0 | **Ratified**: 2026-02-11 | **Last Amended**: 2026-02-11
