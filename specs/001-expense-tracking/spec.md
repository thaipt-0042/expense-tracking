# Feature Specification: Expense Tracking Application

**Feature Branch**: `001-expense-tracking`  
**Created**: 2026-02-11  
**Status**: Draft  
**Input**: User description: "Xây dựng ứng dụng theo dõi thu/chi, phân loại và báo cáo chi tiêu hằng tháng. Người dùng tạo Transactions (thu/chi), gắn Category, xem Dashboard theo ngày/tuần/tháng. Hỗ trợ lọc, tìm kiếm, và export CSV đơn giản."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Record Income and Expenses (Priority: P1)

Users can quickly record their daily financial transactions with essential details including amount, description, date, and type (income or expense). This forms the foundation of the expense tracking system and provides immediate value by allowing users to maintain a digital record of their financial activities.

**Why this priority**: This is the core value proposition - without the ability to create and view transactions, the application has no purpose. Users must be able to record their financial activities as the absolute minimum viable product.

**Independent Test**: Can be fully tested by creating a new transaction with amount, description, date, and type, then verifying it appears in a transaction list. Delivers immediate value by enabling users to start tracking their finances.

**Acceptance Scenarios**:

1. **Given** a user is on the transaction creation screen, **When** they enter an amount (123.45), description ("Grocery shopping"), date (today), and select type (expense), **Then** the transaction is saved and appears in their transaction list
2. **Given** a user has created a transaction, **When** they view their transaction list, **Then** they see the transaction with correct amount, description, date, and type displayed
3. **Given** a user enters an invalid amount (negative number or non-numeric), **When** they attempt to save, **Then** they receive a clear validation error message
4. **Given** a user is creating an income transaction, **When** they save it with amount 5000, description "Salary", **Then** it appears in the list marked as income with positive indication
5. **Given** a user has no transactions, **When** they view the transaction list, **Then** they see a helpful empty state message prompting them to create their first transaction

---

### User Story 2 - Organize with Categories (Priority: P2)

Users can organize their transactions into meaningful categories (e.g., Food, Transport, Salary, Investment) to understand spending patterns. They can create custom categories and assign them to transactions during creation or edit existing transactions to change categories.

**Why this priority**: Categorization enables users to understand where their money goes, but the system is still functional without it. Users can track transactions (P1) before needing categorization insights.

**Independent Test**: Can be fully tested by creating categories, assigning them to transactions, and viewing transactions grouped or filtered by category. Delivers value by enabling spending pattern analysis.

**Acceptance Scenarios**:

1. **Given** a user is on the category management screen, **When** they create a new category with name "Food" and icon/color selection, **Then** the category is saved and available for transaction assignment
2. **Given** a user is creating a transaction, **When** they select a category from the dropdown, **Then** the transaction is saved with that category association
3. **Given** a user has transactions with categories, **When** they view the transaction list, **Then** each transaction displays its category with appropriate visual indicator (color/icon)
4. **Given** a user edits an existing transaction, **When** they change its category, **Then** the change is saved and reflected in all views
5. **Given** a user has no categories defined, **When** they create a transaction, **Then** they can still create it without a category (category is optional)

---

### User Story 3 - View Financial Dashboard (Priority: P2)

Users can visualize their financial data through a dashboard showing summary statistics and trends filtered by day, week, or month. The dashboard displays total income, total expenses, net balance, and category breakdowns for the selected time period.

**Why this priority**: Dashboard provides insights and motivation for users but requires existing transaction data (P1) to be meaningful. It enhances the tracking experience but isn't essential for basic recording.

**Independent Test**: Can be fully tested by creating transactions across different dates and categories, then viewing dashboard with different time filters (day/week/month) and verifying correct calculations and visualizations.

**Acceptance Scenarios**:

1. **Given** a user has transactions from the current month, **When** they view the dashboard with "Month" filter, **Then** they see total income, total expenses, net balance (income - expenses), and category breakdown for the month
2. **Given** a user switches the dashboard filter from "Month" to "Week", **When** the filter changes, **Then** all statistics recalculate to show only current week's data
3. **Given** a user has transactions in multiple categories, **When** they view the dashboard, **Then** they see a breakdown showing amount spent per category, ordered from highest to lowest
4. **Given** a user has no transactions in the selected time period, **When** they view the dashboard, **Then** they see zeros for all metrics with a message indicating no data for this period
5. **Given** a user views the dashboard on a specific day, **When** they select "Day" filter, **Then** they see only transactions from that calendar day

---

### User Story 4 - Search and Filter Transactions (Priority: P3)

Users can find specific transactions quickly using search (by description) and filters (by category, date range, type). This helps users locate past transactions for verification, analysis, or editing.

**Why this priority**: Search and filtering improve usability when transaction volume grows, but users can function with manual scrolling initially. This becomes valuable after accumulating many transactions.

**Independent Test**: Can be fully tested by creating multiple diverse transactions, then applying various search terms and filters to verify correct results are returned.

**Acceptance Scenarios**:

1. **Given** a user has many transactions, **When** they type "grocery" in the search box, **Then** only transactions with "grocery" in the description are displayed
2. **Given** a user wants to see only food expenses, **When** they apply category filter for "Food" and type filter for "Expense", **Then** only expense transactions in the Food category are shown
3. **Given** a user applies a date range filter from Jan 1 to Jan 31, **When** the filter is active, **Then** only transactions within that date range are displayed
4. **Given** a user has applied multiple filters, **When** they clear all filters, **Then** the full transaction list is restored
5. **Given** no transactions match the search criteria, **When** the search executes, **Then** an empty state message indicates no results found

---

### User Story 5 - Export Financial Data (Priority: P3)

Users can export their transaction data to CSV format for use in external tools like spreadsheets or accounting software. The export includes all visible transactions (respecting active filters) with key fields: date, description, amount, type, category.

**Why this priority**: Export enables power users and data portability but isn't required for core expense tracking functionality. Most users will primarily use in-app views.

**Independent Test**: Can be fully tested by creating transactions, triggering CSV export, and verifying the downloaded file contains correct data in proper CSV format.

**Acceptance Scenarios**:

1. **Given** a user has transactions displayed (with or without filters), **When** they click "Export to CSV", **Then** a CSV file downloads containing all visible transactions with columns: date, description, amount, type, category
2. **Given** a user has applied category and date filters, **When** they export to CSV, **Then** the exported file contains only the filtered transactions, not all transactions
3. **Given** a user has no transactions (or filtered to zero results), **When** they attempt to export, **Then** they receive a message indicating nothing to export
4. **Given** a transaction has no category assigned, **When** it's exported to CSV, **Then** the category field is empty or marked as "Uncategorized"
5. **Given** the exported CSV file is opened in spreadsheet software, **When** the user views it, **Then** all data is properly formatted with amounts as numbers and dates in standard format (YYYY-MM-DD)

---

### Edge Cases

- What happens when a user tries to create a transaction with a date in the future? (Allow with optional warning, user may be planning ahead)
- How does the system handle very large amounts (e.g., 1,000,000,000)? (Support up to 999,999,999.99 with proper number formatting)
- What if a user creates hundreds of categories? (UI should handle scrolling/search in category selector)
- How are transactions displayed when no category exists? (Show as "Uncategorized" with neutral styling)
- What happens if the CSV export contains special characters in descriptions? (Properly escape CSV special characters like commas and quotes)
- How does the dashboard behave during month transitions? (Month filter uses calendar month boundaries; recalculates at midnight)
- What if a user edits a transaction's date to move it outside the current filter view? (Transaction disappears from view; show success message confirming save)
- How is the net balance displayed when expenses exceed income? (Show negative value with clear visual indicator in red)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow users to create transactions with amount (decimal number), description (text), date (date picker defaulting to today), and type (income or expense selection)
- **FR-002**: System MUST validate transaction amounts to be positive numbers with up to 2 decimal places and maximum value of 999,999,999.99
- **FR-003**: System MUST persist all transaction data securely and retrieve it for display without data loss
- **FR-004**: System MUST allow users to create, edit, and delete categories with a name and optional color/icon selection
- **FR-005**: System MUST allow users to assign zero or one category to each transaction (category is optional)
- **FR-006**: System MUST display a dashboard showing total income, total expenses, net balance (income - expenses), and category breakdown
- **FR-007**: System MUST provide time period filters on the dashboard for day, week (Sunday-Saturday), and month (calendar month)
- **FR-008**: System MUST recalculate dashboard metrics in real-time when the time period filter changes
- **FR-009**: System MUST provide a transaction list view showing all transactions with date, description, amount, type, and category
- **FR-010**: System MUST allow users to edit existing transactions and change any field including category reassignment
- **FR-011**: System MUST allow users to delete transactions with confirmation prompt to prevent accidental deletion
- **FR-012**: System MUST provide search functionality filtering transactions by description text (case-insensitive, partial match)
- **FR-013**: System MUST provide filter functionality by category, transaction type (income/expense), and date range
- **FR-014**: System MUST support combining multiple filters simultaneously (e.g., category AND date range)
- **FR-015**: System MUST export visible transactions (respecting active filters) to CSV format with columns: date (YYYY-MM-DD), description, amount, type, category
- **FR-016**: System MUST properly escape special CSV characters (commas, quotes, newlines) in exported data
- **FR-017**: System MUST display clear empty states when no transactions exist or no results match current filters
- **FR-018**: System MUST format currency amounts with thousands separators and 2 decimal places in all UI displays
- **FR-019**: System MUST authenticate users using social login (Google and GitHub) via Supabase Auth for faster onboarding and passwordless experience
- **FR-020**: System MUST ensure each user can only access their own transaction data with proper data isolation
- **FR-021**: System MUST provide a mobile-responsive interface usable on phones, tablets, and desktop browsers
- **FR-022**: System MUST handle timezone-aware dates so transactions appear on the correct calendar day for the user's location

### Key Entities

- **Transaction**: Represents a single financial activity (income or expense). Attributes include unique identifier, amount (decimal), description (text), date (timestamp), type (enum: income/expense), category reference (optional), user owner reference, created timestamp, modified timestamp. Relationships: belongs to one User, optionally belongs to one Category.

- **Category**: Represents a classification for organizing transactions. Attributes include unique identifier, name (text), color (hex code), icon identifier (optional), user owner reference, created timestamp. Relationships: belongs to one User, has many Transactions.

- **User**: Represents an authenticated user of the application. Attributes include unique identifier, email, authentication credentials (managed by Supabase Auth), created timestamp, last login timestamp. Relationships: has many Transactions, has many Categories.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can create a transaction and see it in their list within 3 seconds from submission
- **SC-002**: Users can complete the full workflow (create transaction, assign category, view dashboard) within 2 minutes on first use without external instructions
- **SC-003**: Dashboard calculations (totals, category breakdowns) complete within 1 second for up to 10,000 transactions per user
- **SC-004**: Search and filter operations return results within 500 milliseconds for typical user data volumes (100-1000 transactions)
- **SC-005**: CSV export completes within 5 seconds for up to 1,000 transactions
- **SC-006**: Application interface remains fully functional and responsive on mobile devices (320px width minimum)
- **SC-007**: 95% of user interactions (create, edit, view) complete successfully without errors in typical usage scenarios
- **SC-008**: New users can record their first transaction within 30 seconds of account creation
- **SC-009**: Dashboard time period filter changes (day/week/month) update all visualizations within 200 milliseconds
- **SC-010**: System maintains 100% data accuracy with no calculation errors in totals, balances, or category summations

## Assumptions

- Users understand basic financial concepts (income, expense, categories)
- Users have access to a modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Users will primarily track personal finances, not complex business accounting
- Default currency is assumed to be a single currency per user (multi-currency support not in scope)
- Date format follows ISO standard (YYYY-MM-DD) for storage; display format can adapt to user locale
- Week boundaries follow Sunday-Saturday convention (can be adjusted based on regional preferences during implementation)
- Users will manage their own categories; no pre-defined category templates in initial version (can be added later)
- CSV export uses UTF-8 encoding for international character support
- Authentication session duration and security settings follow Supabase Auth defaults
- Real-time collaboration (multiple devices simultaneously editing) is not required; eventual consistency is acceptable with last-write-wins on conflicts
