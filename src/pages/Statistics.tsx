import { useMemo } from 'react'
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import { useTransactions } from '../hooks/useTransactions'
import { formatCurrency } from '../utils/currency'
import { SummaryStatCard } from '../components/ui/SummaryStatCard'
import { SimpleBarChart } from '../components/ui/SimpleBarChart'

export function StatisticsPage() {
  const { totalIncome, totalExpense, allTransactions } = useTransactions()
  const { categories } = useCategories()

  const balance = totalIncome - totalExpense

  // Category breakdown for expenses
  const categoryBreakdown = useMemo(() => {
    const expenseTxs = allTransactions.filter((t) => t.type === 'expense')
    const byCategory: Record<string, number> = {}
    expenseTxs.forEach((tx) => {
      byCategory[tx.categoryId] = (byCategory[tx.categoryId] || 0) + tx.amount
    })

    return Object.entries(byCategory)
      .map(([catId, amount]) => {
        const cat = categories.find((c) => c.id === catId)
        return {
          categoryId: catId,
          name: cat?.name || 'Other',
          icon: cat?.icon || '📦',
          amount,
          percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
        }
      })
      .sort((a, b) => b.amount - a.amount)
  }, [allTransactions, categories, totalExpense])

  // Weekly chart data
  const weeklyData = useMemo(() => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
    const expenseByWeek = [0, 0, 0, 0]
    const incomeByWeek = [0, 0, 0, 0]

    allTransactions.forEach((tx) => {
      const day = tx.date.getDate()
      const weekIndex = Math.min(Math.floor((day - 1) / 7), 3)
      if (tx.type === 'expense') expenseByWeek[weekIndex] += tx.amount
      if (tx.type === 'income') incomeByWeek[weekIndex] += tx.amount
    })

    const maxVal = Math.max(...expenseByWeek, ...incomeByWeek, 1)
    return { weeks, expenseByWeek, incomeByWeek, maxVal }
  }, [allTransactions])

  const colors = ['#2A9D8F', '#48BFA0', '#E9C46A', '#E76F51', '#264653', '#F4A261', '#6C757D']

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="gradient-header px-5 pt-12 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6 h-11">
          <h1 className="text-2xl font-bold text-text">Statistics</h1>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl p-5 shadow-lg shadow-black/5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-text-secondary">Net Balance</p>
          </div>
          <p className={`text-3xl font-extrabold mb-4 ${balance >= 0 ? 'text-text' : 'text-red-500'}`}>
            Rp {formatCurrency(Math.abs(balance))}
          </p>

          <div className="mt-4">
            <SummaryStatCard 
              leftTitle="Income" 
              leftAmount={totalIncome} 
              leftColorClass="text-emerald-500"
              leftIcon={<ArrowDownLeft size={12} className="text-emerald-500" />}
              rightTitle="Expense" 
              rightAmount={totalExpense} 
              rightColorClass="text-red-500"
              rightIcon={<ArrowUpRight size={12} className="text-red-500" />}
            />
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="px-5 mt-5">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
          <h3 className="text-sm font-bold text-text mb-4">Weekly Overview</h3>

          <div className="flex gap-6">
            <div className="flex-1">
              <p className="text-[10px] text-text-muted mb-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400" /> Expenses
              </p>
              <SimpleBarChart
                data={weeklyData.weeks.map((w, i) => ({
                  label: w,
                  value: weeklyData.expenseByWeek[i],
                  color: '#E76F51',
                }))}
                maxValue={weeklyData.maxVal}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="px-5 mt-5 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
          <h3 className="text-sm font-bold text-text mb-4">Expense by Category</h3>

          {/* Donut-like bar visualization */}
          <div className="flex gap-1 h-4 rounded-full overflow-hidden mb-4">
            {categoryBreakdown.map((cat, i) => (
              <div
                key={cat.categoryId}
                className="h-full transition-all duration-500"
                style={{
                  width: `${cat.percentage}%`,
                  backgroundColor: colors[i % colors.length],
                  minWidth: cat.percentage > 0 ? '4px' : '0',
                }}
              />
            ))}
            {categoryBreakdown.length === 0 && (
              <div className="w-full h-full bg-gray-100 rounded-full" />
            )}
          </div>

          {/* Category list */}
          <div className="space-y-3">
            {categoryBreakdown.map((cat, i) => (
              <div key={cat.categoryId} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[i % colors.length] }}
                />
                <span className="text-lg">{cat.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text">{cat.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-text">Rp {formatCurrency(cat.amount)}</p>
                  <p className="text-[10px] text-text-muted">{cat.percentage}%</p>
                </div>
              </div>
            ))}

            {categoryBreakdown.length === 0 && (
              <p className="text-center text-sm text-text-muted py-4">No expenses recorded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
