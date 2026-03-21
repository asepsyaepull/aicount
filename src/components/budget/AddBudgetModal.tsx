import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useCategories } from '../../hooks/useCategories'
import { useAppStore } from '../../stores/appStore'
import { addBudget, useBudgets } from '../../hooks/useBudgets'
import { formatInputCurrency, parseCurrency } from '../../utils/currency'
import { AddCategoryModal } from '../category/AddCategoryModal'
import { Plus } from 'lucide-react'

interface AddBudgetModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AddBudgetModal({ isOpen, onClose, onSuccess }: AddBudgetModalProps) {
  const selectedMonth = useAppStore((s) => s.selectedMonth)
  const currentFamilyId = useAppStore((s) => s.currentFamilyId)
  const { budgets } = useBudgets()
  const { categories } = useCategories()

  const [newCategoryId, setNewCategoryId] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)

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
      onSuccess?.()
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
              <label className="text-xs font-medium text-text-secondary mb-2 block">Category</label>
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 -mx-1">
                {availableCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setNewCategoryId(cat.id)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all ${
                      newCategoryId === cat.id
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
                  onClick={() => setIsAddCategoryOpen(true)}
                  className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl border-2 border-dashed border-gray-300 bg-transparent hover:bg-gray-50 transition-all text-text-muted hover:text-primary active:scale-95"
                >
                  <Plus size={24} />
                  <span className="text-[10px] font-medium truncate w-full text-center">
                    Add New
                  </span>
                </button>
                
                {availableCategories.length === 0 && (
                  <div className="col-span-3 text-center py-4 text-xs text-text-muted">
                    No predefined categories left!
                  </div>
                )}
              </div>
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
      
      <AddCategoryModal 
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        defaultType="expense"
      />
    </>,
    document.body
  )
}
