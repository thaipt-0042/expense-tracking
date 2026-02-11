/**
 * Get the start and end dates for a given period
 * @param period - 'day', 'week', or 'month'
 * @param referenceDate - The reference date (default: now)
 * @returns Object with startDate and endDate as ISO strings
 */
export function getPeriodDates(
  period: 'day' | 'week' | 'month',
  referenceDate: Date = new Date()
): { startDate: string; endDate: string } {
  const start = new Date(referenceDate)
  const end = new Date(referenceDate)

  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)

  switch (period) {
    case 'day':
      // Already set to start and end of day
      break
    case 'week':
      const dayOfWeek = start.getDay()
      start.setDate(start.getDate() - dayOfWeek) // Go to Sunday
      end.setDate(start.getDate() + 6) // Go to Saturday
      end.setHours(23, 59, 59, 999)
      break
    case 'month':
      start.setDate(1) // First day of month
      end.setMonth(end.getMonth() + 1, 0) // Last day of month
      end.setHours(23, 59, 59, 999)
      break
  }

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  }
}

/**
 * Format a date for display in the user's timezone
 * @param date - Date string or Date object
 * @param format - Format type: 'short', 'medium', 'long'
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date,
  format: 'short' | 'medium' | 'long' = 'medium'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
    short: { year: 'numeric', month: '2-digit', day: '2-digit' },
    medium: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
  }

  return new Intl.DateTimeFormat('en-US', formatOptions[format]).format(dateObj)
}

/**
 * Format a date for input fields (YYYY-MM-DD)
 * @param date - Date object or ISO string
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateForInput(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toISOString().split('T')[0]!
}

/**
 * Parse a date input string to ISO format
 * @param dateString - Date string from input field
 * @returns ISO date string
 */
export function parseDateInput(dateString: string): string {
  const date = new Date(dateString)
  return date.toISOString()
}
