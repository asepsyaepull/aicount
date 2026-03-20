import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useCategories } from '../../hooks/useCategories'
import { useAppStore } from '../../stores/appStore'
import { addBudget, useBudgets } from '../../hooks/useBudgets'
import { formatInputCurrency, parseCurrency } from '../../utils/currency'

interface AddBudgetModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddBudgetModal({ isOpen, onClose }: AddBudgetModalProps) {
  const selectedMonth = useAppStore((s) => s.selectedMonth)
  const currentFamilyId = useAppStore((s) => s.currentFamilyId)
  const budgets = useBudgets()
  const categories = useCategories()

  const [newCategoryId, setNewCategoryId] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [saving, setSaving] = useState(false)

  if (!isOpen) return null

  const expenseCategories = categories.filter((c) => c.type === 'expense')
  const usedCategoryIds = budgets.map((b) => b.categoryId)
  const availableCategories = expenseCategories.filter((c) => !usedCategoryIds.includes(c.id))

  const handleAddBudget = async () => {
    if (!newCategoryId || !newAmount || !currentFamilyId) return
    setSaving(true)
    try {
      await addBudget({
        familyId: currentFamilyId,
        categoryId: newCategoryId,
        amountLimit: parseCurrency(newAmount),
        monthYear: selectedMonth,
      })
      onClose()
      setNewCategoryId('')
      setNewAmount('')
    } catch (err) {
      console.error('Failed to add budget:', err)
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <>
      <div className="fixed inset-0 z-60 overlay" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-70 animate-slide-up">
        <div className="max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text">Add Budget</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">Category</label>
              <select
                value={newCategoryId}
                onChange={(e) => setNewCategoryId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select category</option>
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">Monthly Limit</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-text-secondary">Rp</span>
                <input
                  inputMode="numeric"
                  type="text"
                  placeholder="0"
                  value={newAmount}
                  onChange={(e) => setNewAmount(formatInputCurrency(e.target.value))}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-lg font-bold border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <button
              onClick={handleAddBudget}
              disabled={!newCategoryId || !newAmount || saving}
              className="w-full py-3.5 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-primary/25 disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Budget'}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
