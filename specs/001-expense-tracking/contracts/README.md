# API Contracts

This directory contains OpenAPI 3.0 specifications for all HTTP API endpoints in the expense tracking application.

## Files

- **[transactions-api.yaml](transactions-api.yaml)** - CRUD operations for financial transactions
- **[categories-api.yaml](categories-api.yaml)** - CRUD operations for transaction categories
- **[dashboard-api.yaml](dashboard-api.yaml)** - Dashboard statistics and aggregations
- **[export-api.yaml](export-api.yaml)** - CSV export functionality

## Base URL

- **Local Development**: `http://localhost:3000/api`
- **Production**: `https://expense-tracker.vercel.app/api`

## Authentication

All endpoints require authentication via Supabase JWT token:

```http
Authorization: Bearer <supabase-jwt-token>
```

Obtain the token from Supabase Auth:

```typescript
const {
  data: { session },
} = await supabase.auth.getSession();
const token = session?.access_token;
```

## API Routes Implementation

These contracts map to Next.js 14+ App Router Route Handlers:

| Contract                    | Route Handler Path                   |
| --------------------------- | ------------------------------------ |
| `GET /transactions`         | `app/api/transactions/route.ts`      |
| `POST /transactions`        | `app/api/transactions/route.ts`      |
| `GET /transactions/{id}`    | `app/api/transactions/[id]/route.ts` |
| `PATCH /transactions/{id}`  | `app/api/transactions/[id]/route.ts` |
| `DELETE /transactions/{id}` | `app/api/transactions/[id]/route.ts` |
| `GET /categories`           | `app/api/categories/route.ts`        |
| `POST /categories`          | `app/api/categories/route.ts`        |
| `GET /categories/{id}`      | `app/api/categories/[id]/route.ts`   |
| `PATCH /categories/{id}`    | `app/api/categories/[id]/route.ts`   |
| `DELETE /categories/{id}`   | `app/api/categories/[id]/route.ts`   |
| `GET /dashboard`            | `app/api/dashboard/route.ts`         |
| `GET /export`               | `app/api/export/route.ts`            |

## Data Security

All endpoints enforce Row Level Security (RLS) at the database level:

- Users can only access their own transactions and categories
- RLS policies automatically filter queries by `auth.uid()` (authenticated user ID)
- No authorization logic needed in application code (handled by Supabase)

## Validation

Request validation uses Zod schemas matching these OpenAPI specs:

```typescript
// Example: Transaction creation validation
import { z } from "zod";

const transactionCreateSchema = z.object({
  amount: z
    .number()
    .positive()
    .max(999999999.99)
    .refine((val) => Number((val * 100).toFixed(0)) === val * 100, {
      message: "Amount must have at most 2 decimal places",
    }),
  description: z.string().min(1).max(500),
  date: z.string().datetime(),
  type: z.enum(["income", "expense"]),
  category_id: z.string().uuid().nullable().optional(),
});
```

## Error Responses

All endpoints return consistent error format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {
    "field_name": ["Validation error for this field"]
  }
}
```

Common error codes:

- `VALIDATION_ERROR` (400) - Invalid request data
- `UNAUTHORIZED` (401) - Missing or invalid authentication token
- `NOT_FOUND` (404) - Resource not found or user lacks access
- `CONFLICT` (409) - Duplicate resource (e.g., category name already exists)
- `INTERNAL_SERVER_ERROR` (500) - Unexpected server error

## Performance

- **Transaction List**: Paginated, default 20 per page, max 100
- **Dashboard Stats**: <1s for 10,000 transactions (aggregated in PostgreSQL)
- **CSV Export**: <5s for 1,000 transactions, max 10,000 rows
- **Filtering**: Indexed queries, <500ms typical response time

## Viewing and Testing

### View OpenAPI Specs

Use [Swagger Editor](https://editor.swagger.io/) to view and validate:

1. Open https://editor.swagger.io/
2. File → Import File → Select any `.yaml` file from this directory

### Test Endpoints (After Implementation)

```bash
# Set authentication token
export TOKEN="<your-supabase-jwt-token>"

# List transactions
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/transactions

# Create transaction
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 125.50,
    "description": "Grocery shopping",
    "date": "2026-02-11T10:30:00Z",
    "type": "expense",
    "category_id": null
  }' \
  http://localhost:3000/api/transactions

# Get dashboard stats for current month
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/dashboard?period=month"

# Export transactions to CSV
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/export > transactions.csv
```

## Next Steps

1. **Implement Route Handlers**: Create Next.js route handlers matching these contracts
2. **Add Zod Validation**: Implement request validation using Zod schemas
3. **Write Tests**: Unit tests for validation, integration tests for API routes
4. **Generate TypeScript Client**: Optionally generate type-safe API client from OpenAPI specs

## Related Documentation

- [data-model.md](../data-model.md) - Database schema and RLS policies
- [research.md](../research.md) - Architecture decisions and best practices
- [plan.md](../plan.md) - Implementation plan and project structure
