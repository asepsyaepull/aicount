import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Trash2 } from 'lucide-react'
import { updateBudget, deleteBudget, type Budget } from '../../hooks/useBudgets'
import type { Category } from '../../hooks/useCategories'
import { formatCurrency, formatInputCurrency, parseCurrency } from '../../utils/currency'
import { DestructiveModal } from '../ui/DestructiveModal'

interface EditBudgetModalProps {
  budget: Budget | null
  category: Category | null
  onClose: () => void
  onSuccess?: () => void
}

export function EditBudgetModal({ budget, category, onClose, onSuccess }: EditBudgetModalProps) {
  const [amountLimit, setAmountLimit] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Initialize form when a budget is passed
  useEffect(() => {
    if (budget) {
      setAmountLimit(budget.amountLimit.toString())
    }
  }, [budget])

  if (!budget || !category) return null

  const handleUpdate = async () => {
    setSaving(true)
    try {
      await updateBudget(budget.id, { amountLimit: parseCurrency(amountLimit) })
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Failed to update budget:', err)
      alert('Gagal mengupdate budget')
    } finally {
      setSaving(false)
    }
  }

  const executeDelete = async () => {
    setDeleting(true)
    try {
      await deleteBudget(budget.id)
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Failed to delete budget:', err)
      alert('Gagal menghapus budget')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleDelete = () => {
    setShowDeleteConfirm(true)
  }

  return createPortal(
    <>
      <div className="fixed inset-0 z-60 overlay" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-70 animate-slide-up">
        <div className="max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text">Edit Budget</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3 border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl shrink-0">
                {category.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-text">{category.name}</p>
                <p className="text-[11px] font-medium text-text-muted">
                  Current Budget: Rp {formatCurrency(budget.amountLimit)}
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block ml-1">Limit Budget Baru</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-text-secondary">Rp</span>
                <input
                  inputMode="numeric"
                  type="text"
                  placeholder="0"
                  value={amountLimit}
                  onChange={(e) => setAmountLimit(formatInputCurrency(e.target.value))}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-lg font-bold border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleDelete}
                disabled={saving || deleting}
                className="w-12 h-12 shrink-0 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50"
                title="Hapus Budget"
              >
                <Trash2 size={20} />
              </button>
              <button
                onClick={handleUpdate}
                disabled={saving || deleting || !amountLimit}
                className="flex-1 h-12 rounded-xl gradient-primary text-white font-bold text-sm shadow-lg shadow-primary/25 disabled:opacity-50 hover:opacity-90 transition-all"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <DestructiveModal
        isOpen={showDeleteConfirm}
        title="Hapus Budget"
        description="Apakah Anda yakin ingin menghapus budget ini?"
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={executeDelete}
        isLoading={deleting}
      />
    </>,
    document.body
  )
}
