import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Plus } from 'lucide-react'
import { useCategories } from '../../hooks/useCategories'
import { updateTransaction, type Transaction } from '../../hooks/useTransactions'
import { useWallets } from '../../hooks/useWallets'
import { formatInputCurrency, parseCurrency } from '../../utils/currency'
import { SegmentedControl } from '../ui/SegmentedControl'
import { DatePicker } from '../ui/DatePicker'
import { AddCategoryModal } from '../category/AddCategoryModal'

interface EditTransactionSheetProps {
  transaction: Transaction | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function EditTransactionSheet({ transaction, isOpen, onClose, onSuccess }: EditTransactionSheetProps) {
  const [type, setType] = useState<'expense' | 'income' | 'transfer'>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [walletId, setWalletId] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState('')
  
  const [saving, setSaving] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)

  const { wallets } = useWallets()
  const { categories: allCategories, refresh: refreshCategories } = useCategories()
  const categories = allCategories.filter((cat) => cat.type === (type === 'transfer' ? 'expense' : type))

  // Initialize state when transaction changes or modal opens
  useEffect(() => {
    if (transaction && isOpen) {
      setType(transaction.type)
      setAmount(formatInputCurrency(transaction.amount.toString()))
      setCategoryId(transaction.categoryId)
      setWalletId(transaction.walletId)
      setNote(transaction.note)
      // Transaction date comes in as a Date object including the time.
      // We must get the local YYYY-MM-DD.
      const localDate = new Date(transaction.date)
      localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset())
      setDate(localDate.toISOString().slice(0, 10))
    }
  }, [transaction, isOpen])

  // If user changes type during edit and the old category doesn't match the new type, reset it
  useEffect(() => {
    if (categoryId && !categories.find(c => c.id === categoryId)) {
      if (categories.length > 0) setCategoryId(categories[0].id)
    }
  }, [type, categories, categoryId])

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setAmount(formatInputCurrency(raw))
  }, [])

  const handleSave = async () => {
    if (!transaction || !amount || !walletId) return
    setSaving(true)

    try {
      await updateTransaction(transaction.id, {
        walletId,
        categoryId: categoryId || 'cat-other-expense',
        amount: parseCurrency(amount),
        type,
        date: new Date(date),
        note: note || '',
      })

      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Failed to update transaction:', err)
      alert('Gagal menyimpan perubahan transaksi')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen || !transaction) return null

  return createPortal(
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 overlay" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
        <div className="max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl max-h-[90dvh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 pb-2">
            <h2 className="text-lg font-bold text-text">Edit Transaction</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-4 pb-6 space-y-4">
            {/* Segmented Control */}
            <SegmentedControl value={type} onChange={setType} />

            {/* Amount */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-text-secondary">Rp</span>
                <input
                  inputMode="numeric"
                  type="text"
                  placeholder="0"
                  value={amount}
                  onChange={handleAmountChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl text-xl font-bold text-text border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block">Category</label>
              <div className="grid grid-cols-4 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all ${categoryId === cat.id
                        ? 'border-primary bg-primary-50 shadow-sm'
                        : 'border-transparent bg-gray-50 hover:bg-gray-100'
                      }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-[10px] font-medium text-text-secondary truncate w-full text-center">
                      {cat.name}
                    </span>
                  </button>
                ))}
                
                {/* Add New Category Button */}
                <button
                  onClick={() => setShowAddCategory(true)}
                  className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl border-2 border-dashed border-gray-300 bg-transparent hover:bg-gray-50 transition-all text-text-muted hover:text-primary active:scale-95"
                >
                  <Plus size={24} />
                  <span className="text-[10px] font-medium truncate w-full text-center">
                    Add New
                  </span>
                </button>
              </div>
            </div>

            {/* Wallet */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">Wallet</label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {wallets.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setWalletId(w.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 whitespace-nowrap transition-all ${walletId === w.id
                        ? 'border-primary bg-primary-50'
                        : 'border-transparent bg-gray-50'
                      }`}
                  >
                    <span className="text-sm font-medium">{w.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Note */}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Date</label>
                <DatePicker
                  value={date}
                  maxDate={new Date().toISOString().split('T')[0]} // Disable future dates
                  onChange={setDate}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Note</label>
                <textarea
                  rows={3}
                  placeholder="Add note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-text-muted"
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={!amount || saving}
              className="w-full py-3.5 rounded-xl gradient-primary text-white font-semibold text-base shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </div>

      <AddCategoryModal
        isOpen={showAddCategory}
        onClose={() => setShowAddCategory(false)}
        onSuccess={refreshCategories}
        defaultType={type === 'transfer' ? 'expense' : type}
      />
    </>,
    document.body
  )
}
