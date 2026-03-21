import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useAppStore } from '../../stores/appStore'
import { addCategory } from '../../hooks/useCategories'
import { useToastStore } from '../../stores/toastStore'

interface AddCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void | Promise<void>
  defaultType?: 'income' | 'expense'
}

const COMMON_EMOJIS = [
  '🛒', '🚗', '🏠', '🎮', '👗', '💊', '🎓', '🎁', '🐶', '✈️',
  '💰', '🏦', '📈', '💼', '🍔', '☕', '🎫', '🔧', '📱', '💡'
]

export function AddCategoryModal({ isOpen, onClose, onSuccess, defaultType = 'expense' }: AddCategoryModalProps) {
  const currentFamilyId = useAppStore((s) => s.currentFamilyId)

  const [type, setType] = useState<'income' | 'expense'>(defaultType)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('📦')
  const [saving, setSaving] = useState(false)

  const addToast = useToastStore((s) => s.addToast)

  if (!isOpen) return null

  const handleSave = async () => {
    if (!name.trim() || !icon || !currentFamilyId) return
    setSaving(true)
    try {
      await addCategory({
        familyId: currentFamilyId,
        name: name.trim(),
        type,
        icon,
      })
      addToast('Kategori berhasil ditambahkan', 'success')
      onSuccess?.()
      onClose()
      setName('')
      setIcon('📦')
    } catch (err) {
      console.error('Failed to add category:', err)
      addToast('Gagal menambahkan kategori.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <>
      <div className="fixed inset-0 overlay" style={{ zIndex: 80 }} onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 animate-slide-up" style={{ zIndex: 90 }}>
        <div className="max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text">New Category</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Type Selection */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => setType('expense')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  type === 'expense' ? 'bg-white shadow-sm text-text' : 'text-text-secondary'
                }`}
              >
                Expense
              </button>
              <button
                onClick={() => setType('income')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  type === 'income' ? 'bg-white shadow-sm text-text' : 'text-text-secondary'
                }`}
              >
                Income
              </button>
            </div>

            {/* Name Input */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">Category Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Snack, Subscription..."
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Icon / Emoji Selection */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">Icon (Select or Type an Emoji)</label>
              <div className="flex gap-3 mb-3">
                <input
                  type="text"
                  maxLength={2}
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-16 h-14 text-center text-3xl bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="grid grid-cols-10 gap-2 overflow-x-auto pb-2">
                {COMMON_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setIcon(emoji)}
                    className={`w-8 h-8 flex items-center justify-center text-xl rounded-lg transition-all ${
                      icon === emoji ? 'bg-primary-50 border border-primary text-2xl' : 'hover:bg-gray-100 text-lg'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={!name.trim() || !icon || saving}
              className="w-full py-3.5 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-primary/25 disabled:opacity-50 mt-4 active:scale-[0.98]"
            >
              {saving ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
