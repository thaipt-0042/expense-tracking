/**
 * Format a number as currency with proper decimal places and thousands separators
 * @param amount - The numeric amount to format
 * @param currency - Currency code (default: USD)
 * @param locale - Locale for formatting (default: en-US)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Parse a currency string to a number
 * @param currencyString - String representation of currency
 * @returns Numeric value or null if invalid
 */
export function parseCurrency(currencyString: string): number | null {
  const cleaned = currencyString.replace(/[^0-9.-]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? null : parsed
}
