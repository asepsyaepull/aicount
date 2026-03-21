import { createPortal } from 'react-dom'
import { Trash2 } from 'lucide-react'

interface DestructiveModalProps {
  isOpen: boolean
  title: string
  description: string
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
  confirmText?: string
  cancelText?: string
}

export function DestructiveModal({
  isOpen,
  title,
  description,
  onClose,
  onConfirm,
  isLoading = false,
  confirmText = 'Delete',
  cancelText = 'Cancel',
}: DestructiveModalProps) {
  if (!isOpen) return null

  return createPortal(
    <>
      <div className="fixed inset-0 z-60 overlay" onClick={onClose} />
      <div className="fixed inset-0 z-70 flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-white rounded-2xl shadow-2xl p-5 animate-fade-in">
          <div className="text-center mb-4">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-text">{title}</h3>
            <p className="text-sm text-text-muted mt-1">{description}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl bg-gray-100 text-text font-semibold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Menghapus...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
