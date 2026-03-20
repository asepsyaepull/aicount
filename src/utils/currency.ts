/**
 * Format number to Indonesian currency format: 1.500.000
 */
export function formatCurrency(amount: number): string {
  const absAmount = Math.abs(amount)
  return absAmount.toLocaleString('id-ID')
}

/**
 * Format with Rp prefix
 */
export function formatRupiah(amount: number): string {
  const prefix = amount < 0 ? '- Rp ' : 'Rp '
  return prefix + formatCurrency(Math.abs(amount))
}

/**
 * Parse formatted currency string back to number
 */
export function parseCurrency(value: string): number {
  // Remove everything except digits
  const cleaned = value.replace(/[^\d]/g, '')
  return parseInt(cleaned, 10) || 0
}

/**
 * Format input value with thousand separators while typing
 */
export function formatInputCurrency(value: string): string {
  const num = parseCurrency(value)
  if (num === 0) return ''
  return num.toLocaleString('id-ID')
}

/**
 * Get short currency format (e.g., 1.5M, 500K)
 */
export function formatShortCurrency(amount: number): string {
  const abs = Math.abs(amount)
  if (abs >= 1_000_000_000) {
    return (amount / 1_000_000_000).toFixed(1).replace('.0', '') + 'B'
  }
  if (abs >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1).replace('.0', '') + 'M'
  }
  if (abs >= 1_000) {
    return (amount / 1_000).toFixed(0) + 'K'
  }
  return amount.toString()
}
