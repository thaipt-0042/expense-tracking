import { z } from 'zod'

/**
 * Transaction validation schema
 */
export const transactionSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(999999999.99, 'Amount cannot exceed 999,999,999.99')
    .refine((val) => {
      // Check for exactly 2 decimal places
      const decimalPlaces = (val.toString().split('.')[1] || '').length
      return decimalPlaces <= 2
    }, 'Amount must have at most 2 decimal places'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description cannot exceed 500 characters'),
  date: z.string().datetime('Invalid date format'),
  type: z.enum(['income', 'expense'], {
    message: 'Type must be either income or expense',
  }),
  category_id: z.string().uuid('Invalid category ID').nullable().optional(),
})

export type TransactionInput = z.infer<typeof transactionSchema>

/**
 * Transaction update schema (all fields optional except at least one must be present)
 */
export const transactionUpdateSchema = transactionSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  'At least one field must be provided for update'
)

export type TransactionUpdateInput = z.infer<typeof transactionUpdateSchema>

/**
 * Category validation schema
 */
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(50, 'Category name cannot exceed 50 characters'),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex code (e.g., #10B981)'),
  icon_id: z.string().optional().nullable(),
})

export type CategoryInput = z.infer<typeof categorySchema>

/**
 * Category update schema (all fields optional)
 */
export const categoryUpdateSchema = categorySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  'At least one field must be provided for update'
)

export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>

/**
 * Dashboard stats query parameters
 */
export const dashboardQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month']).default('month'),
  date: z.string().datetime().optional(),
})

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>

/**
 * Pagination parameters
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type PaginationParams = z.infer<typeof paginationSchema>

/**
 * Transaction list query parameters
 */
export const transactionQuerySchema = paginationSchema.extend({
  type: z.enum(['income', 'expense']).optional(),
  category_id: z.string().uuid().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  search: z.string().optional(),
})

export type TransactionQuery = z.infer<typeof transactionQuerySchema>
