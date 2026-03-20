import type { ReactNode } from 'react'
import { formatCurrency } from '../../utils/currency'

interface SummaryStatCardProps {
  title: string
  amount: number | string
  prefix?: string
  colorVariant: 'primary' | 'emerald' | 'red' | 'blue'
  icon?: ReactNode
}

export function SummaryStatCard({ title, amount, prefix = '', colorVariant, icon }: SummaryStatCardProps) {
  const variants = {
    primary: {
      bg: 'bg-primary-50',
      text: 'text-primary'
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600'
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-500'
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-500'
    }
  }

  const styles = variants[colorVariant]

  return (
    <div className={`${styles.bg} rounded-xl p-3 text-center flex flex-col items-center justify-center`}>
      {icon && (
        <div className="flex items-center gap-1 mb-0.5">
          {icon}
          <span className="text-[10px] text-text-muted font-medium">{title}</span>
        </div>
      )}
      {!icon && (
        <p className="text-[10px] text-text-muted font-medium mb-0.5">{title}</p>
      )}
      <p className={`text-sm font-bold ${styles.text}`}>
        {prefix} Rp {typeof amount === 'number' ? formatCurrency(amount) : amount}
      </p>
    </div>
  )
}
