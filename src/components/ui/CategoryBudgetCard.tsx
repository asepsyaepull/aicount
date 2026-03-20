import { TrendingUp, TrendingDown } from 'lucide-react'
import type { Category } from '../../hooks/useCategories'
import { useTransactionsByCategory } from '../../hooks/useTransactions'
import { ProgressBar } from './ProgressBar'
import { formatCurrency } from '../../utils/currency'
import { calcPercentage, getBudgetStatus } from '../../utils/budget'

export interface CategoryBudgetCardProps {
  categoryId: string
  amountLimit: number
  category: Category | null
  variant?: 'dashboard' | 'list'
}

export function CategoryBudgetCard({ categoryId, amountLimit, category, variant = 'list' }: CategoryBudgetCardProps) {
  const spent = useTransactionsByCategory(categoryId)
  const percentage = calcPercentage(spent, amountLimit)

  if (!category) return null

  if (variant === 'dashboard') {
    // Mock "vs last month" change - deterministic based on category ID
    const change = ((categoryId.charCodeAt(4) || 5) % 20) - 10
    const isUp = change > 0

    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 animate-fade-in">
        <div className="flex items-start justify-between mb-2">
          <span className="text-lg">{category.icon}</span>
          <span className="text-2xl">{category.icon}</span>
        </div>
        <p className="text-sm font-semibold text-text mb-0.5">{category.name}</p>
        <p className="text-xs text-text-secondary mb-3">
          <span className="font-semibold text-text">Rp {formatCurrency(spent)}</span> / Rp {formatCurrency(amountLimit)}
        </p>
        <ProgressBar percentage={percentage} height="h-2" />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-text-muted">{percentage}% Used</span>
          <span className={`text-[10px] font-medium flex items-center gap-0.5 ${isUp ? 'text-red-500' : 'text-emerald-500'}`}>
            {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {Math.abs(change)}% vs last month
          </span>
        </div>
      </div>
    )
  }

  // List Variant (used in Budget page)
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg">
            {category.icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-text">{category.name}</p>
            <p className="text-[11px] text-text-muted">{getBudgetStatus(percentage)}</p>
          </div>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
          percentage >= 100 ? 'bg-red-50 text-red-500' :
          percentage >= 80 ? 'bg-yellow-50 text-yellow-600' :
          'bg-emerald-50 text-emerald-600'
        }`}>
          {percentage}%
        </span>
      </div>

      <ProgressBar percentage={percentage} height="h-2.5" />

      <div className="flex items-center justify-between mt-2.5">
        <span className="text-xs text-text-secondary">
          Rp {formatCurrency(spent)} spent
        </span>
        <span className="text-xs text-text-muted">
          of Rp {formatCurrency(amountLimit)}
        </span>
      </div>
    </div>
  )
}
