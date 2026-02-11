/**
 * Application-wide constants
 */

// Financial limits
export const MAX_TRANSACTION_AMOUNT = 999999999.99
export const MIN_TRANSACTION_AMOUNT = 0.01
export const DECIMAL_PLACES = 2

// Text length limits
export const MAX_DESCRIPTION_LENGTH = 500
export const MAX_CATEGORY_NAME_LENGTH = 50
export const MIN_CATEGORY_NAME_LENGTH = 1

// Pagination
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// Date formats
export const DATE_FORMAT_SHORT = 'MM/DD/YYYY'
export const DATE_FORMAT_MEDIUM = 'MMM DD, YYYY'
export const DATE_FORMAT_LONG = 'MMMM DD, YYYY'
export const DATE_FORMAT_INPUT = 'YYYY-MM-DD'

// Default colors for categories
export const DEFAULT_CATEGORY_COLOR = '#6B7280' // Gray
export const CATEGORY_COLORS = [
  '#10B981', // Green
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
] as const

// Transaction types
export const TRANSACTION_TYPES = ['income', 'expense'] as const
export type TransactionType = (typeof TRANSACTION_TYPES)[number]

// Period options for dashboard
export const PERIOD_OPTIONS = ['day', 'week', 'month'] as const
export type PeriodOption = (typeof PERIOD_OPTIONS)[number]

// Currency
export const DEFAULT_CURRENCY = 'USD'
export const DEFAULT_LOCALE = 'en-US'

// API endpoints (relative paths)
export const API_ENDPOINTS = {
  TRANSACTIONS: '/api/transactions',
  CATEGORIES: '/api/categories',
  DASHBOARD: '/api/dashboard',
  EXPORT: '/api/export',
} as const

// UI messages
export const UI_MESSAGES = {
  LOADING: 'Loading...',
  NO_DATA: 'No data available',
  ERROR_GENERIC: 'Something went wrong. Please try again.',
  SUCCESS_CREATE: 'Created successfully',
  SUCCESS_UPDATE: 'Updated successfully',
  SUCCESS_DELETE: 'Deleted successfully',
} as const

// Empty states
export const EMPTY_STATES = {
  TRANSACTIONS: {
    title: 'No transactions yet',
    description: 'Get started by creating your first transaction',
    action: 'Create Transaction',
  },
  CATEGORIES: {
    title: 'No categories yet',
    description: 'Create categories to organize your transactions',
    action: 'Create Category',
  },
  SEARCH: {
    title: 'No results found',
    description: 'Try adjusting your search or filters',
  },
} as const
