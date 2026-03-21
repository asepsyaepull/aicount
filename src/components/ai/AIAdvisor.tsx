import { Loader2, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useCategories } from '../../hooks/useCategories'
import { useTransactions } from '../../hooks/useTransactions'
import { useWallets } from '../../hooks/useWallets'
import { getFinancialAdvice } from '../../lib/gemini'
import { formatCurrency } from '../../utils/currency'

interface AIAdvisorProps {
  isOpen: boolean
  onClose: () => void
}

export function AIAdvisor({ isOpen, onClose }: AIAdvisorProps) {
  const { allTransactions, totalIncome, totalExpense } = useTransactions()
  const { totalBalance } = useWallets()
  const { categories } = useCategories()

  const [advice, setAdvice] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)

  if (!isOpen) return null

  const fetchAdvice = async () => {
    setLoading(true)
    try {
      // Siapkan data riwayat
      const recentTxs = allTransactions.slice(0, 50).map((tx) => ({
        type: tx.type,
        amount: tx.amount,
        note: tx.note,
        category: categories.find(c => c.id === tx.categoryId)?.name || 'Other',
        date: tx.date.toISOString().slice(0, 10)
      }))

      const summary = {
        totalBalance,
        totalIncomeThisMonth: totalIncome,
        totalExpenseThisMonth: totalExpense,
        recentTransactions: recentTxs
      }

      const adviceResult = await getFinancialAdvice(JSON.stringify(summary))
      setAdvice(adviceResult)
      setHasFetched(true)
    } catch (err) {
      console.error(err)
      alert('Gagal mengambil saran dari AI. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <>
      <div className="fixed inset-0 z-50 overlay" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
        <div className="max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl max-h-[90dvh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-text">AI Financial Advisor</h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-4 pb-6 space-y-4">
            {!hasFetched && !loading && (
              <div className="flex flex-col items-center text-center py-10">
                <p className="text-4xl mb-3">🤖</p>
                <h4 className="text-base font-bold text-text mb-1">Butuh Saran Keuangan?</h4>
                <p className="text-sm text-text-muted mb-6">
                  Agent AI akan menganalisis tren pengeluaran dan pemasukan Anda bulan ini untuk memberikan insight personal.
                </p>
              </div>
            )}
            <button
              onClick={fetchAdvice}
              className="w-full py-3.5 rounded-xl gradient-primary text-white font-semibold text-sm shadow-lg shadow-primary/25"
            >
              Analisis Keuangan Saya
            </button>

            {loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 size={32} className="text-primary animate-spin mb-4" />
                <p className="text-sm font-medium text-text-secondary animate-pulse">
                  Aicount sedang menganalisis data Anda...
                </p>
              </div>
            )}

            {hasFetched && !loading && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Ringkasan AI</p>
                  <p className="text-sm text-text-secondary font-medium leading-relaxed">
                    Pemasukan Anda bulan ini sejumlah <span className="font-bold text-emerald-600">Rp {formatCurrency(totalIncome)}</span>,
                    dan pengeluaran <span className="font-bold text-red-500">Rp {formatCurrency(totalExpense)}</span>.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-text">3 Tips Teratas Untuk Anda:</h4>
                  {advice.map((item, i) => (
                    <div key={i} className="flex gap-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                        <span className="text-xs font-bold text-primary">{i + 1}</span>
                      </div>
                      <p className="text-sm text-text flex-1 leading-relaxed gap-2">{item}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-3 mt-6 rounded-xl gradient-primary text-white font-semibold text-sm shadow-lg shadow-primary/25"
                >
                  Selesai
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
