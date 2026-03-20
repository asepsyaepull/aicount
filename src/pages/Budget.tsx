import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'

import { useBudgets, useTotalBudget } from '../hooks/useBudgets'
import { ProgressBar } from '../components/ui/ProgressBar'
import { CategoryBudgetCard } from '../components/ui/CategoryBudgetCard'
import { SummaryStatCard } from '../components/ui/SummaryStatCard'
import { AddBudgetModal } from '../components/budget/AddBudgetModal'
import { formatCurrency } from '../utils/currency'
import { calcPercentage } from '../utils/budget'
import { MonthPicker } from '../components/ui/MonthPicker'

export function BudgetPage() {
  const budgets = useBudgets()
  const { totalLimit, totalSpent } = useTotalBudget()
  const percentage = totalLimit > 0 ? calcPercentage(totalSpent, totalLimit) : 0

  const categories = useCategories()
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="gradient-header px-5 pt-12 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6 h-11">
          <h1 className="text-2xl font-bold text-text">Budget</h1>
        </div>

        {/* Overall Budget Card */}
        <div className="bg-white rounded-2xl p-5 shadow-lg shadow-black/5">
          <div className="flex items-center justify-between mb-1">
            <MonthPicker colorVariant="gray" />
            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
              percentage >= 100 ? 'bg-red-50 text-red-500' :
              percentage >= 80 ? 'bg-yellow-50 text-yellow-600' :
              'bg-emerald-50 text-emerald-600'
            }`}>
              {percentage}% Used
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-3xl font-extrabold text-text">
              Rp {formatCurrency(totalLimit - totalSpent > 0 ? totalLimit - totalSpent : 0)}
            </p>
            <p className="text-xs text-text-muted">remaining</p>
          </div>

          <ProgressBar percentage={percentage} height="h-3" />

          <div className="grid grid-cols-2 gap-3 mt-4">
            <SummaryStatCard 
              title="Total Budget" 
              amount={totalLimit} 
              colorVariant="primary" 
            />
            <SummaryStatCard 
              title="Total Spent" 
              amount={totalSpent} 
              colorVariant="red" 
            />
          </div>
        </div>
      </div>

      {/* Budget List */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-text">Category Budgets</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary-50 px-3 py-1.5 rounded-lg"
          >
            <Plus size={14} />
            Add
          </button>
        </div>

        <div className="space-y-3 mb-6">
          {budgets.map((budget) => (
            <CategoryBudgetCard 
              key={budget.id} 
              categoryId={budget.categoryId}
              amountLimit={budget.amountLimit}
              category={categories.find(c => c.id === budget.categoryId) || null} 
              variant="list"
            />
          ))}

          {budgets.length === 0 && (
            <div className="text-center py-10">
              <p className="text-4xl mb-2">📊</p>
              <p className="text-sm text-text-muted">No budgets set</p>
              <p className="text-xs text-text-muted mt-1">Tap "Add" to create your first budget</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Budget Modal */}
      <AddBudgetModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  )
}
