import { createIntl } from 'react-intl'

export { cn } from 'cn'

// Single source of number formatting config, usable from React and plain modules.
export const intl = createIntl({ locale: 'id', messages: {} })

export function formatRupiah(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return 'Rp0'
  const num = typeof value === 'string' ? Number.parseInt(value, 10) : value
  if (Number.isNaN(num)) return 'Rp0'
  return intl.formatNumber(num, {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  })
}

export function formatDecimal(value: string | number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || value === '') return '0'
  const num = typeof value === 'string' ? Number.parseFloat(value) : value
  if (Number.isNaN(num)) return '0'
  return intl.formatNumber(num, {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  })
}
