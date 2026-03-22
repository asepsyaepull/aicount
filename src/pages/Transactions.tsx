import { useState } from 'react'
import { useCategories } from '../hooks/useCategories'
import { useWallets } from '../hooks/useWallets'
import { useTransactions } from '../hooks/useTransactions'
import { formatCurrency } from '../utils/currency'
import { SummaryStatCard } from '../components/ui/SummaryStatCard'
import { TransactionItem } from '../components/transaction/TransactionItem'
import { TransactionFilters, type TransactionFilterType } from '../components/transaction/TransactionFilters'
import { TransactionDetailsModal } from '../components/transaction/TransactionDetailsModal'
import { EditTransactionSheet } from '../components/transaction/EditTransactionSheet'
import type { Transaction } from '../hooks/useTransactions'

export function TransactionsPage() {
  const { allTransactions, totalIncome, totalExpense, refresh: refreshTransactions } = useTransactions()
  const [filter, setFilter] = useState<TransactionFilterType>('all')
  const [search, setSearch] = useState('')
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const { categories } = useCategories()
  const { wallets } = useWallets()

  const getCategoryName = (catId: string) => categories.find((c) => c.id === catId)?.name || ''
  const getCategoryIcon = (catId: string) => categories.find((c) => c.id === catId)?.icon || '📦'
  const getWalletName = (wId: string) => wallets.find((w) => w.id === wId)?.name || ''

  const filteredTransactions = allTransactions.filter((tx) => {
    const matchFilter = filter === 'all' || tx.type === filter
    const matchSearch =
      !search ||
      (tx.note && tx.note.toLowerCase().includes(search.toLowerCase())) ||
      getCategoryName(tx.categoryId).toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  // Group by date
  const grouped = filteredTransactions.reduce<Record<string, typeof filteredTransactions>>((acc, tx) => {
    const dateKey = tx.date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(tx)
    return acc
  }, {})

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="gradient-header px-5 pt-12 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6 h-11">
          <h1 className="text-2xl font-bold text-text">Transactions</h1>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl p-5 shadow-lg shadow-black/5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-text-secondary">Expected Balance</p>
          </div>
          <p className="text-3xl font-extrabold text-text mb-4">
            Rp {formatCurrency(totalIncome - totalExpense)}
          </p>

          <div className="mt-4">
            <SummaryStatCard
              leftTitle="Total Income"
              leftAmount={totalIncome}
              leftPrefix="+"
              leftColorClass="text-emerald-500"
              rightTitle="Total Expense"
              rightAmount={totalExpense}
              rightPrefix="-"
              rightColorClass="text-red-500"
            />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <TransactionFilters
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
      />

      {/* Transaction List */}
      <div className="px-5 mt-4 mb-4 space-y-5">
        {Object.entries(grouped).map(([date, txs]) => (
          <div key={date}>
            <p className="text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">{date}</p>
            <div className="space-y-2">
              {txs.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  categoryIcon={getCategoryIcon(tx.categoryId)}
                  categoryName={getCategoryName(tx.categoryId)}
                  walletName={getWalletName(tx.walletId)}
                  onClick={(t) => setSelectedTx(t)}
                />
              ))}
            </div>
          </div>
        ))}

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-2">🔍</p>
            <p className="text-sm text-text-muted">No transactions found</p>
          </div>
        )}
      </div>

      <TransactionDetailsModal
        isOpen={!!selectedTx && !isEditOpen}
        transaction={selectedTx}
        categoryName={selectedTx ? getCategoryName(selectedTx.categoryId) : ''}
        categoryIcon={selectedTx ? getCategoryIcon(selectedTx.categoryId) : ''}
        walletName={selectedTx ? getWalletName(selectedTx.walletId) : ''}
        onClose={() => setSelectedTx(null)}
        onEdit={() => setIsEditOpen(true)}
        onDelete={refreshTransactions}
      />

      <EditTransactionSheet
        transaction={selectedTx}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false)
          setSelectedTx(null)
        }}
        onSuccess={refreshTransactions}
      />
    </div>
  )
}
