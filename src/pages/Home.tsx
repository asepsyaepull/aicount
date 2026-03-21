import { Bell, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useCurrentUser } from '../hooks/useUser'
import { useCategories } from '../hooks/useCategories'

import { useTransactions, type Transaction } from '../hooks/useTransactions'
import { useBudgets, useTotalBudget } from '../hooks/useBudgets'
import { useWallets } from '../hooks/useWallets'

import { ProgressBar } from '../components/ui/ProgressBar'
import { SummaryStatCard } from '../components/ui/SummaryStatCard'
import { CategoryBudgetCard } from '../components/ui/CategoryBudgetCard'
import { TransactionItem } from '../components/transaction/TransactionItem'
import { formatCurrency } from '../utils/currency'
import { calcPercentage } from '../utils/budget'
import { AIAdvisor } from '../components/ai/AIAdvisor'
import { MonthPicker } from '../components/ui/MonthPicker'
import { TransactionDetailsModal } from '../components/transaction/TransactionDetailsModal'
import { EditTransactionSheet } from '../components/transaction/EditTransactionSheet'

export function HomePage() {
  const { user: currentUser } = useCurrentUser()
  const { transactions: recentTransactions, refresh: refreshTransactions } = useTransactions(5)
  const { totalLimit, totalSpent } = useTotalBudget()
  const { budgets, refresh: refreshBudgets } = useBudgets()
  const { categories } = useCategories()
  const { wallets } = useWallets()

  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const remaining = totalLimit - totalSpent
  const budgetPercentage = totalLimit > 0 ? calcPercentage(totalSpent, totalLimit) : 0

  // Greeting based on time
  const hours = new Date().getHours()
  const greeting = hours < 12 ? 'Good Morning' : hours < 18 ? 'Good Afternoon' : 'Good Evening'

  const getCategoryName = (catId: string) => categories.find((c) => c.id === catId)?.name || ''
  const getCategoryIcon = (catId: string) => categories.find((c) => c.id === catId)?.icon || '📦'

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="gradient-header px-5 pt-12 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm shadow-md">
              {currentUser?.avatarInitials || 'U'}
            </div>
            <div>
              <p className="text-xs text-text">{greeting},</p>
              <p className="text-base font-bold text-text">{currentUser?.name || 'User'} 👋</p>
            </div>
          </div>
          <button className="relative w-10 h-10 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-sm">
            <Bell size={20} className="text-text-secondary" />
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center border-2 border-white">
              9+
            </span>
          </button>
        </div>

        {/* Budget Summary Card */}
        <div className="bg-white rounded-2xl p-5 shadow-lg shadow-black/5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-text-secondary">Remaining Budget</p>
            <MonthPicker
              colorVariant="primary"
              className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors"
              />
          </div>
          <p className="text-3xl font-extrabold text-text mb-3">
            Rp {formatCurrency(remaining > 0 ? remaining : 0)}
          </p>

          <ProgressBar percentage={budgetPercentage} height="h-3" />
          <div className="flex items-center justify-end mt-1.5">
            <span className="text-xs font-medium text-text-muted">{budgetPercentage}% Used</span>
          </div>

          <div className="mt-4">
            <SummaryStatCard
              leftTitle="Monthly Limit"
              leftAmount={totalLimit}
              leftColorClass="text-text"
              rightTitle="Your Spending"
              rightAmount={totalSpent}
              rightPrefix="-"
              rightColorClass="text-red-500"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-text">Categories</h2>
          <button className="text-xs font-semibold text-primary">See all</button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {budgets.slice(0, 4).map((budget) => (
            <CategoryBudgetCard
              key={budget.id}
              categoryId={budget.categoryId}
              amountLimit={budget.amountLimit}
              category={categories.find(c => c.id === budget.categoryId) || null}
              variant="dashboard"
            />
          ))}
        </div>
      </div>

      {/* Spending Insight */}
      <div className="px-5 mt-5">
        <div
          onClick={() => setIsAdvisorOpen(true)}
          className="gradient-insight rounded-2xl p-4 flex items-center justify-between text-white shadow-lg shadow-primary/20 cursor-pointer hover:opacity-90 transition-opacity active:scale-[0.98]"
        >
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles size={14} />
              <span className="text-xs font-semibold opacity-90">Spending Insight</span>
            </div>
            <p className="text-sm font-medium leading-snug">
              You spent <span className="font-bold">{budgetPercentage}%</span> of your budget this month 💡
            </p>
          </div>
          <div className="text-4xl ml-3">📊</div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-5 mt-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-text">Recent Transaction</h2>
          <button className="text-xs font-semibold text-primary">See all</button>
        </div>

        <div className="space-y-2.5">
          {recentTransactions.map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              categoryIcon={getCategoryIcon(tx.categoryId)}
              categoryName={getCategoryName(tx.categoryId)}
              showDate={true}
              onClick={(t) => setSelectedTx(t)}
            />
          ))}

          {recentTransactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">📝</p>
              <p className="text-sm text-text-muted">No transactions yet</p>
              <p className="text-xs text-text-muted mt-1">Tap + to add your first transaction</p>
            </div>
          )}
        </div>
      </div>

      <AIAdvisor isOpen={isAdvisorOpen} onClose={() => setIsAdvisorOpen(false)} />

      <TransactionDetailsModal
        isOpen={!!selectedTx && !isEditOpen}
        transaction={selectedTx}
        categoryName={selectedTx ? getCategoryName(selectedTx.categoryId) : ''}
        categoryIcon={selectedTx ? getCategoryIcon(selectedTx.categoryId) : ''}
        walletName={selectedTx ? wallets.find(w => w.id === selectedTx.walletId)?.name || '' : ''}
        onClose={() => setSelectedTx(null)}
        onEdit={() => setIsEditOpen(true)}
      />

      <EditTransactionSheet
        transaction={selectedTx}
        isOpen={isEditOpen}
        onSuccess={() => {
          refreshTransactions()
          refreshBudgets()
        }}
        onClose={() => {
          setIsEditOpen(false)
          setSelectedTx(null)
        }}
      />
    </div>
  )
}
