/**
 * Escape a CSV field value according to RFC 4180
 * @param value - The value to escape
 * @returns Escaped CSV field
 */
export function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return ''
  }

  const stringValue = String(value)

  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

/**
 * Convert an array of objects to CSV string
 * @param data - Array of objects to convert
 * @param headers - Optional custom headers (defaults to object keys)
 * @returns CSV string
 */
export function arrayToCSV<T extends Record<string, unknown>>(
  data: T[],
  headers?: string[]
): string {
  if (data.length === 0) {
    return ''
  }

  const keys = headers || (Object.keys(data[0]!) as string[])
  const headerRow = keys.map(escapeCSV).join(',')

  const rows = data.map((row) => {
    return keys
      .map((key) => escapeCSV(row[key] as string | number | null))
      .join(',')
  })

  return [headerRow, ...rows].join('\n')
}

/**
 * Trigger a CSV download in the browser
 * @param csvContent - CSV string content
 * @param filename - Download filename
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
