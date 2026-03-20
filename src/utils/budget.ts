/**
 * Get budget progress color based on percentage
 */
export function getBudgetColor(percentage: number): string {
  if (percentage >= 100) return '#E76F51' // Red
  if (percentage >= 80) return '#E9C46A'  // Yellow
  return '#2A9D8F' // Green
}

/**
 * Get budget progress background color
 */
export function getBudgetBgColor(percentage: number): string {
  if (percentage >= 100) return '#FEF2F2'
  if (percentage >= 80) return '#FFFBEB'
  return '#F0FDFB'
}

/**
 * Get budget status text
 */
export function getBudgetStatus(percentage: number): string {
  if (percentage >= 100) return 'Over Budget!'
  if (percentage >= 80) return 'Almost Limit'
  return 'On Track'
}

/**
 * Calculate percentage
 */
export function calcPercentage(spent: number, limit: number): number {
  if (limit <= 0) return 0
  return Math.round((spent / limit) * 100)
}

/**
 * Format month-year string
 */
export function formatMonthYear(monthYear: string): string {
  const [month, year] = monthYear.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

/**
 * Get current month-year string
 */
export function getCurrentMonthYear(): string {
  const now = new Date()
  return `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`
}
