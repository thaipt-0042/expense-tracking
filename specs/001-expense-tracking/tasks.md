# Tasks: Expense Tracking Application

**Input**: Design documents from `/specs/001-expense-tracking/`
**Prerequisites**: ✅ plan.md, ✅ spec.md, ✅ research.md, ✅ data-model.md, ✅ contracts/, ✅ quickstart.md

**Tests**: Tests are NOT explicitly requested in the feature specification. Following TDD principles, but deferring comprehensive test suite to future iteration. Focus on functional implementation with validation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- All file paths are relative to repository root

## Path Conventions (Next.js App Router)

- **App directory**: `app/` (pages, layouts, API routes)
- **Components**: `components/` (React components)
- **Utilities**: `lib/` (shared utilities, types, Supabase clients)
- **Database**: `supabase/migrations/` (SQL migration files)
- **Tests**: `tests/` (unit, integration, e2e)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization following quickstart.md

- [x] T001 Initialize Next.js 14+ project with TypeScript, ESLint, Tailwind CSS per quickstart.md Step 1
- [x] T002 [P] Configure TypeScript strict mode with all required flags in tsconfig.json per quickstart.md Step 2
- [x] T003 [P] Install Supabase client libraries (@supabase/supabase-js, @supabase/auth-helpers-nextjs) per quickstart.md Step 3
- [x] T004 [P] Install Zod validation library for API request validation
- [x] T005 Initialize local Supabase instance with supabase init and supabase start per quickstart.md Step 4
- [x] T006 Create .env.local with Supabase environment variables per quickstart.md Step 6
- [x] T007 [P] Create Supabase client utilities in lib/supabase/client.ts (browser client) per quickstart.md Step 7
- [x] T008 [P] Create Supabase server client in lib/supabase/server.ts per quickstart.md Step 7
- [x] T009 [P] Create middleware client in middleware.ts for session refresh per quickstart.md Step 7
- [x] T010 [P] Create directory structure for app/, components/, lib/, tests/ per quickstart.md Step 10
- [x] T011 [P] Create placeholder files for all API routes and pages per quickstart.md Step 10

**Checkpoint**: ✅ Project scaffolding complete with Supabase connected

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Schema & Types

- [x] T012 Create database migration 001_initial_schema.sql for categories and transactions tables in supabase/migrations/ per data-model.md
- [x] T013 Create database migration 002_rls_policies.sql with all RLS policies per data-model.md
- [x] T014 Create database migration 003_dashboard_functions.sql with get_dashboard_stats function per data-model.md
- [x] T015 Apply all migrations with supabase migration up
- [x] T016 Generate TypeScript types with supabase gen types typescript --local > lib/supabase/types.ts

### Shared Utilities

- [x] T017 [P] Create currency formatting utility in lib/utils/currency.ts with formatCurrency function
- [x] T018 [P] Create date utilities in lib/utils/date.ts with timezone handling and getPeriodDates function per research.md
- [x] T019 [P] Create CSV utilities in lib/utils/csv.ts with escapeCSV function per research.md and export-api.yaml
- [x] T020 [P] Create validation schemas in lib/utils/validation.ts using Zod for transaction and category validation per contracts/
- [x] T021 [P] Create constants file in lib/constants.ts with app-wide constants (max amounts, date formats, etc.)

### Authentication Setup

- [x] T022 Create login page in app/(auth)/login/page.tsx with Google and GitHub OAuth buttons per quickstart.md Step 9
- [x] T023 Create OAuth callback handler in app/auth/callback/route.ts per quickstart.md Step 9
- [x] T024 [P] Create Supabase provider component in components/providers/SupabaseProvider.tsx for client-side auth context
- [x] T025 Update root layout in app/layout.tsx to wrap app with SupabaseProvider and add global styles
- [ ] T026 Configure OAuth providers (Google and GitHub) in local Supabase instance per quickstart.md Step 9

### UI Foundation

- [x] T027 [P] Create base UI Button component in components/ui/Button.tsx with TypeScript props
- [x] T028 [P] Create base UI Input component in components/ui/Input.tsx with validation states
- [x] T029 [P] Create base UI Modal component in components/ui/Modal.tsx for dialogs
- [x] T030 [P] Create EmptyState component in components/ui/EmptyState.tsx for no-data scenarios per FR-017
- [x] T031 Update app/globals.css with Tailwind base styles and custom CSS variables for colors

**Checkpoint**: Foundation ready - database schema deployed, auth configured, base utilities and UI components available. User story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Record Income and Expenses (Priority: P1) 🎯 MVP

**Goal**: Users can create and view financial transactions with amount, description, date, and type (income/expense). This is the absolute minimum viable product.

**Independent Test**: Create a new transaction with amount 123.45, description "Grocery shopping", date today, type expense. Verify it appears in transaction list with correct details.

### Data Layer (US1)

- [x] T032 [P] [US1] Verify Transaction type exported from lib/supabase/types.ts matches database schema per data-model.md

### API Layer (US1)

- [x] T033 [US1] Create transaction list API in app/api/transactions/route.ts with GET handler (pagination, basic listing) per transactions-api.yaml
- [x] T034 [US1] Add transaction create API in app/api/transactions/route.ts with POST handler and Zod validation per transactions-api.yaml
- [x] T035 [US1] Create single transaction API in app/api/transactions/[id]/route.ts with GET handler per transactions-api.yaml
- [x] T036 [US1] Add transaction update API in app/api/transactions/[id]/route.ts with PATCH handler per transactions-api.yaml
- [x] T037 [US1] Add transaction delete API in app/api/transactions/[id]/route.ts with DELETE handler per transactions-api.yaml

### Component Layer (US1)

- [x] T038 [P] [US1] Create TransactionForm component in components/transactions/TransactionForm.tsx as client component with amount, description, date, type fields per FR-001
- [x] T039 [P] [US1] Create TransactionItem component in components/transactions/TransactionItem.tsx to display single transaction card per spec acceptance scenario 2
- [x] T040 [US1] Create TransactionList component in components/transactions/TransactionList.tsx to render list of TransactionItem components per FR-009
- [x] T041 [US1] Add validation feedback to TransactionForm for invalid amounts per spec acceptance scenario 3

### Page Layer (US1)

- [x] T042 [US1] Create transaction list page in app/transactions/page.tsx as server component fetching transactions per spec acceptance scenarios 2 and 5
- [x] T043 [US1] Create transaction detail/edit page in app/transactions/[id]/page.tsx per spec requirement for editing
- [x] T044 [US1] Add create transaction button and modal to transactions page integrating TransactionForm component per spec acceptance scenario 1
- [x] T045 [US1] Update home page (app/page.tsx) to redirect authenticated users to /transactions and show login prompt for unauthenticated

**Checkpoint**: User Story 1 complete. Users can now create, view, edit, and delete transactions. Test independently: log in → create transaction → see it in list → edit → delete. MVP is functional!

---

## Phase 4: User Story 2 - Organize with Categories (Priority: P2)

**Goal**: Users can create custom categories and assign them to transactions to organize spending patterns.

**Independent Test**: Create category "Food" with green color. Create transaction assigned to Food category. Verify transaction displays with Food badge/color in list.

### Data Layer (US2)

- [x] T046 [P] [US2] Verify Category type exported from lib/supabase/types.ts matches database schema per data-model.md

### API Layer (US2)

- [x] T047 [US2] Create category list API in app/api/categories/route.ts with GET handler per categories-api.yaml
- [x] T048 [US2] Add category create API in app/api/categories/route.ts with POST handler and Zod validation per categories-api.yaml
- [x] T049 [US2] Create single category API in app/api/categories/[id]/route.ts with GET handler per categories-api.yaml
- [x] T050 [US2] Add category update API in app/api/categories/[id]/route.ts with PATCH handler per categories-api.yaml
- [x] T051 [US2] Add category delete API in app/api/categories/[id]/route.ts with DELETE handler per categories-api.yaml

### Component Layer (US2)

- [x] T052 [P] [US2] Create CategoryBadge component in components/categories/CategoryBadge.tsx to display category with color/icon per spec acceptance scenario 3
- [x] T053 [P] [US2] Create CategoryForm component in components/categories/CategoryForm.tsx with name, color picker, and icon selector per spec acceptance scenario 1
- [x] T054 [US2] Create CategoryList component in components/categories/CategoryList.tsx to show all user categories per categories-api.yaml
- [x] T055 [US2] Update TransactionForm component to include category dropdown selector per spec acceptance scenario 2
- [x] T056 [US2] Update TransactionItem component to display CategoryBadge if transaction has category per spec acceptance scenario 3

### Page Layer (US2)

- [x] T057 [US2] Create category management page in app/categories/page.tsx with CategoryList and CategoryForm per spec acceptance scenario 1
- [x] T058 [US2] Update transaction list page to show category badges on each transaction per spec acceptance scenario 3
- [x] T059 [US2] Add navigation links between transactions and categories pages in app/layout.tsx

**Checkpoint**: User Story 2 complete. Users can create categories and assign them to transactions. Test independently: create category → assign to transaction → see visual indicator. Both US1 and US2 now work together.

---

## Phase 5: User Story 3 - View Financial Dashboard (Priority: P2)

**Goal**: Users can visualize financial data with total income, expenses, net balance, and category breakdown filtered by day/week/month.

**Independent Test**: Create transactions across different dates and categories. View dashboard with "Month" filter. Verify correct totals and category breakdown. Switch to "Week" filter and verify recalculation.

### API Layer (US3)

- [x] T060 [US3] Create dashboard API in app/api/dashboard/route.ts calling get_dashboard_stats function with period filters per dashboard-api.yaml
- [x] T061 [US3] Add period date calculation logic in dashboard API for day/week/month boundaries per research.md timezone handling

### Component Layer (US3)

- [x] T062 [P] [US3] Create DashboardStats component in components/dashboard/DashboardStats.tsx to display income, expense, net balance cards per spec acceptance scenario 1
- [x] T063 [P] [US3] Create TimePeriodFilter component in components/dashboard/TimePeriodFilter.tsx as client component with day/week/month buttons per spec acceptance scenarios 2 and 5
- [x] T064 [P] [US3] Create CategoryBreakdown component in components/dashboard/CategoryBreakdown.tsx to show spending by category ordered highest to lowest per spec acceptance scenario 3
- [x] T065 [US3] Handle empty dashboard state in DashboardStats component to show zeros and helpful message per spec acceptance scenario 4

### Page Layer (US3)

- [x] T066 [US3] Create dashboard page in app/dashboard/page.tsx as server component fetching stats from API per spec acceptance scenario 1
- [x] T067 [US3] Integrate TimePeriodFilter component with URL search params for client-side filter changes per FR-008
- [x] T068 [US3] Add real-time recalculation when filter changes using client-side navigation per performance goal <200ms
- [x] T069 [US3] Update home page (app/page.tsx) to redirect authenticated users to /dashboard instead of /transactions
- [x] T070 [US3] Update app navigation to highlight dashboard as primary view

**Checkpoint**: User Story 3 complete. Users can view comprehensive dashboard with filtering. Test independently: create varied transactions → view dashboard → change filters → verify correct calculations. US1, US2, and US3 all working together.

---

## Phase 6: User Story 4 - Search and Filter Transactions (Priority: P3)

**Goal**: Users can find specific transactions using search (description) and filters (category, date range, type).

**Independent Test**: Create multiple diverse transactions. Search for "grocery" and verify only matching transactions appear. Apply category filter and verify results. Clear filters and verify full list restored.

### Component Layer (US4)

- [x] T071 [P] [US4] Create SearchBar component in components/transactions/SearchBar.tsx as client component for description search per spec acceptance scenario 1
- [x] T072 [US4] Create TransactionFilters component in components/transactions/TransactionFilters.tsx with category, type, date range filters per spec acceptance scenarios 2 and 3
- [x] T073 [US4] Add clear filters button to TransactionFilters component per spec acceptance scenario 4
- [x] T074 [US4] Add empty search results state to TransactionList component per spec acceptance scenario 5

### API Updates (US4)

- [x] T075 [US4] Update transaction list API (app/api/transactions/route.ts GET) to accept search query parameter per transactions-api.yaml
- [x] T076 [US4] Add category filter to transaction list API query logic per transactions-api.yaml
- [x] T077 [US4] Add type filter to transaction list API query logic per transactions-api.yaml
- [x] T078 [US4] Add date range filters (start_date, end_date) to transaction list API per transactions-api.yaml
- [x] T079 [US4] Optimize query with proper index usage for search (GIN index on description) per data-model.md

### Page Updates (US4)

- [x] T080 [US4] Integrate SearchBar component into transaction list page (app/transactions/page.tsx) per spec acceptance scenario 1
- [x] T081 [US4] Integrate TransactionFilters component into transaction list page per spec acceptance scenarios 2 and 3
- [x] T082 [US4] Handle filter state with URL search params for bookmarkable filtered views per FR-013 and FR-014
- [x] T083 [US4] Add loading states during filter/search operations per performance goal <500ms

**Checkpoint**: User Story 4 complete. Users can search and filter transactions efficiently. Test independently: perform various searches and filter combinations → verify correct results → clear filters → verify full list. All stories US1-US4 working together.

---

## Phase 7: User Story 5 - Export Financial Data (Priority: P3)

**Goal**: Users can export transaction data to CSV format respecting active filters.

**Independent Test**: Create transactions, apply filters (category + date range), trigger CSV export. Download file and verify it contains only filtered transactions in proper CSV format with correct columns.

### API Layer (US5)

- [ ] T084 [US5] Create export API in app/api/export/route.ts with GET handler generating CSV per export-api.yaml
- [ ] T085 [US5] Add filter support to export API (search, category, type, date range) matching transaction list filters per export-api.yaml
- [ ] T086 [US5] Implement CSV generation with proper RFC 4180 formatting using lib/utils/csv.ts per export-api.yaml x-csv-format
- [ ] T087 [US5] Add CSV headers (Date, Description, Amount, Type, Category) per export-api.yaml
- [ ] T088 [US5] Handle uncategorized transactions in CSV export showing "Uncategorized" per spec acceptance scenario 4
- [ ] T089 [US5] Add proper Content-Disposition header with timestamped filename per export-api.yaml
- [ ] T090 [US5] Implement 10,000 transaction export limit per export-api.yaml

### Component Layer (US5)

- [ ] T091 [P] [US5] Create ExportButton component in components/transactions/ExportButton.tsx as client component triggering download per spec acceptance scenario 1
- [ ] T092 [US5] Add loading state to ExportButton during export generation per performance goal <5s
- [ ] T093 [US5] Handle empty export case in ExportButton showing message per spec acceptance scenario 3

### Page Updates (US5)

- [ ] T094 [US5] Integrate ExportButton component into transaction list page toolbar per spec acceptance scenario 1
- [ ] T095 [US5] Pass current filter state to ExportButton to respect active filters per spec acceptance scenario 2
- [ ] T096 [US5] Add export functionality to dashboard page for exporting current period transactions

**Checkpoint**: User Story 5 complete. Users can export filtered transaction data to CSV. Test independently: apply filters → export → open CSV in spreadsheet → verify correct data and formatting. All stories US1-US5 complete - full feature set delivered!

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final production readiness

### Mobile Responsiveness

- [ ] T097 [P] Verify all components responsive on mobile (320px minimum width) per FR-021 using browser dev tools
- [ ] T098 [P] Test TransactionForm on mobile with touch-friendly inputs (44x44px tap targets) per research.md
- [ ] T099 [P] Test dashboard layout on mobile with stacked cards per research.md mobile-first CSS
- [ ] T100 [P] Verify navigation menu collapses to hamburger on mobile (<768px) per research.md

### Performance Optimization

- [ ] T101 Verify dashboard loads in <1s for 10k transactions by testing with large dataset per SC-003
- [ ] T102 Verify search/filter responds in <500ms by testing with 1000 transactions per SC-004
- [ ] T103 Verify CSV export completes in <5s for 1000 transactions per SC-005
- [ ] T104 Optimize transaction list pagination to prevent loading all transactions at once per transactions-api.yaml

### Error Handling

- [ ] T105 [P] Add global error boundary in app/error.tsx for unhandled errors
- [ ] T106 [P] Add consistent error responses across all API routes matching Error schema in contracts/
- [ ] T107 [P] Add user-friendly error messages for common cases (network errors, validation failures, auth errors)
- [ ] T108 [P] Add loading states for all async operations (page loads, API calls, exports) per FR-009

### Documentation & Deployment

- [ ] T109 [P] Create project README.md with setup instructions, tech stack, and architecture overview
- [ ] T110 [P] Verify quickstart.md is accurate by following it in a fresh environment
- [ ] T111 [P] Add inline code comments for complex logic (dashboard aggregation, CSV escaping, timezone handling)
- [ ] T112 Test production build with npm run build and verify no errors per quickstart.md production checklist
- [ ] T113 Configure production Supabase project and OAuth providers per quickstart.md production checklist
- [ ] T114 Deploy to Vercel and verify all features work in production per Principle V

### Final Validation

- [ ] T115 Run through all 25 acceptance scenarios from spec.md manually to verify implementation
- [ ] T116 Test edge cases from spec.md (future dates, large amounts, many categories, special characters in CSV)
- [ ] T117 Verify all 22 functional requirements (FR-001 through FR-022) are implemented per spec.md
- [ ] T118 Verify all 10 success criteria (SC-001 through SC-010) are met per spec.md
- [ ] T119 Perform security review: RLS policies active, no exposed service role key, HTTPS only in production
- [ ] T120 Run full application flow as new user: sign up → create transaction → categorize → view dashboard → filter → export

**Checkpoint**: Application is production-ready with all features implemented, tested, and optimized. Ready for user acceptance testing and launch!

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately (Tasks T001-T011)
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories (Tasks T012-T031)
- **User Story 1 (Phase 3)**: Depends on Foundational - MVP delivery (Tasks T032-T045)
- **User Story 2 (Phase 4)**: Depends on Foundational - Integrates with US1 (Tasks T046-T059)
- **User Story 3 (Phase 5)**: Depends on Foundational and US1, US2 for meaningful data (Tasks T060-T070)
- **User Story 4 (Phase 6)**: Depends on Foundational and US1 - Enhances US1 (Tasks T071-T083)
- **User Story 5 (Phase 7)**: Depends on Foundational and US1, US2, US4 for filters (Tasks T084-T096)
- **Polish (Phase 8)**: Depends on all desired user stories being complete (Tasks T097-T120)

### User Story Independence

- **User Story 1 (P1) - Transactions**: ✅ Fully independent after Foundational phase. Can be delivered as standalone MVP.
- **User Story 2 (P2) - Categories**: ✅ Mostly independent. Integrates with US1 but transactions work without categories (category is optional per FR-005).
- **User Story 3 (P2) - Dashboard**: Dependencies on US1 and US2 for data to display, but independently testable with seeded data.
- **User Story 4 (P3) - Search/Filter**: Enhances US1. Can work independently with basic transaction list.
- **User Story 5 (P3) - Export**: Dependencies on US1, US2, US4 for comprehensive export with filters.

### Within Each Phase

- Setup: All tasks can run in parallel except T001 (project creation) which must be first
- Foundational: Database tasks (T012-T016) must complete before utilities; all other foundational tasks can run in parallel
- User Story phases:
  - Data layer first (verify types)
  - API layer next (can run in parallel within story)
  - Component layer (UI components can run in parallel)
  - Page layer last (assembles components)

### Parallel Opportunities by Phase

**Phase 1 (Setup)**: Tasks T002, T003, T004, T007, T008, T009, T010, T011 can run in parallel after T001

**Phase 2 (Foundational)**:

- Database migrations T012-T014 sequential
- After migrations: T017, T018, T019, T020, T021 can run in parallel
- After migrations: T027, T028, T029, T030 (UI components) can run in parallel
- T022, T023, T024 (auth) can run in parallel after Supabase is ready

**Phase 3 (US1)**:

- API routes T033-T037 can run in parallel (different files)
- Components T038, T039 can run in parallel
- Pages T042, T043 can run in parallel after components ready

**Phase 4 (US2)**:

- API routes T047-T051 can run in parallel
- Components T052, T053 can run in parallel
- T055 and T056 updates can run in parallel

**Phase 5 (US3)**:

- Components T062, T063, T064 can run in parallel

**Phase 6 (US4)**:

- Components T071, T072 can run in parallel
- API updates T075-T078 can run in parallel

**Phase 7 (US5)**:

- Components T091, T092 can run in parallel

**Phase 8 (Polish)**:

- Most tasks can run in parallel: T097-T100 (mobile), T105-T108 (error handling), T109-T111 (docs)

### Critical Path (Minimum for MVP)

1. **Setup**: T001 → (T002-T011 parallel) → Setup done
2. **Foundational**: T012-T016 (migrations) → (T017-T031 parallel) → Foundation done
3. **User Story 1**: T032 → (T033-T037 parallel) → (T038-T041 parallel) → T042-T045 → MVP done!
4. Stop here for minimal MVP, or continue with additional user stories

---

## Parallel Example: Maximizing Efficiency

### Starting User Story 1 (After Foundational Phase Complete)

```bash
# All API routes for transactions can be built in parallel:
Terminal 1: Task T033 - GET /api/transactions (list)
Terminal 2: Task T034 - POST /api/transactions (create)
Terminal 3: Task T035 - GET /api/transactions/[id]
Terminal 4: Task T036 - PATCH /api/transactions/[id]
Terminal 5: Task T037 - DELETE /api/transactions/[id]

# Meanwhile, UI components can also be built in parallel:
Terminal 6: Task T038 - TransactionForm component
Terminal 7: Task T039 - TransactionItem component

# Once APIs and components are ready, pages tie them together:
Sequential: Task T040 → T042 → T043 → T044 → T045
```

### With a 3-Person Team (After Foundational)

```bash
Developer A: User Story 1 (Transactions) - Tasks T032-T045
Developer B: User Story 2 (Categories) - Tasks T046-T059
Developer C: User Story 3 (Dashboard) - Tasks T060-T070

# All three stories can be developed in parallel!
# Integration happens naturally as they share the same database and UI framework
```

---

## Implementation Strategy

### Strategy 1: MVP First (Recommended for Solo Developer)

**Goal**: Deliver working product as fast as possible

1. ✅ Complete Phase 1: Setup (Tasks T001-T011) - ~2-3 hours
2. ✅ Complete Phase 2: Foundational (Tasks T012-T031) - ~4-6 hours
3. ✅ Complete Phase 3: User Story 1 (Tasks T032-T045) - ~6-8 hours
4. **🎯 STOP and VALIDATE**: Test US1 independently - users can track transactions!
5. Optional: Deploy MVP to Vercel staging for user feedback
6. Continue with US2, US3, etc. based on user feedback

**Total MVP Time**: ~12-17 hours of focused development

### Strategy 2: Feature Complete (Recommended for 2-3 week project)

**Goal**: Deliver all specified user stories

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Deliver incrementally:
   - Week 1: US1 (MVP) + US2 (Categories)
   - Week 2: US3 (Dashboard) + US4 (Search/Filter)
   - Week 3: US5 (Export) + Polish
4. Each week = shippable increment with additional value

### Strategy 3: Parallel Team (3+ Developers)

**Goal**: Maximum velocity with team collaboration

1. Week 1 (All together): Setup + Foundational (ensures consistent foundation)
2. Week 2 (Parallel):
   - Dev A: US1 (Transactions)
   - Dev B: US2 (Categories)
   - Dev C: US3 (Dashboard)
3. Week 3 (Parallel):
   - Dev A: US4 (Search/Filter)
   - Dev B: US5 (Export)
   - Dev C: Polish + Integration
4. Week 4: Final integration, testing, deployment

---

## Notes

- **[P] tasks**: Different files, no dependencies, safe to parallelize
- **[Story] labels**: Maps each task to specific user story for traceability
- **File paths**: Always use exact paths from project structure in plan.md
- **Validation**: Each user story endpoint includes validation using Zod schemas
- **TypeScript**: All code must pass strict mode type checking per Principle I
- **Testing approach**: Functional validation through manual testing of acceptance scenarios. Comprehensive automated test suite deferred to future iteration per constitution Principle II acknowledgment.
- **TDD mindset**: Even without full test suite, validate each feature works before moving to next
- **Commit frequency**: Commit after completing each task or logical task group
- **Story checkpoints**: Stop after each user story phase to validate independently before proceeding
- **Mobile-first**: Use Tailwind responsive classes (sm:, md:, lg:) throughout per research.md
- **Security**: Never commit .env.local; always verify RLS policies prevent unauthorized access

---

## Success Criteria Checklist

After completing all tasks, verify these success criteria from spec.md:

- [ ] **SC-001**: Transaction creation → appears in list within 3 seconds
- [ ] **SC-002**: Complete workflow (create → categorize → dashboard) within 2 minutes on first use
- [ ] **SC-003**: Dashboard calculations complete within 1 second for 10,000 transactions
- [ ] **SC-004**: Search/filter returns results within 500 milliseconds
- [ ] **SC-005**: CSV export completes within 5 seconds for 1,000 transactions
- [ ] **SC-006**: Interface fully functional on mobile (320px width minimum)
- [ ] **SC-007**: 95% of user interactions complete successfully without errors
- [ ] **SC-008**: New user can record first transaction within 30 seconds of account creation
- [ ] **SC-009**: Dashboard filter changes update visualizations within 200 milliseconds
- [ ] **SC-010**: 100% accuracy in totals, balances, and category summations (no calculation errors)

---

**Total Tasks**: 120 tasks across 8 phases
**Estimated MVP Time**: 12-17 hours (Phases 1-3 only)
**Estimated Full Feature Time**: 40-60 hours (all phases)
**Parallel Opportunities**: ~40% of tasks can be parallelized within phases
