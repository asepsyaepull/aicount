import { createPortal } from 'react-dom'
import { X, Pencil, Trash2, Calendar, Wallet, FileText, Tag } from 'lucide-react'
import { formatCurrency } from '../../utils/currency'
import { deleteTransaction, type Transaction } from '../../hooks/useTransactions'
import { useState, useRef, useEffect } from 'react'
import { DestructiveModal } from '../ui/DestructiveModal'
import { useModalAnimation } from '../../hooks/useModalAnimation'

interface TransactionDetailsModalProps {
  isOpen: boolean
  transaction: Transaction | null
  categoryName: string
  categoryIcon: string
  walletName: string
  onClose: () => void
  onEdit: () => void
}

export function TransactionDetailsModal({
  isOpen,
  transaction,
  categoryName,
  categoryIcon,
  walletName,
  onClose,
  onEdit,
}: TransactionDetailsModalProps) {
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { shouldRender, isClosing } = useModalAnimation(isOpen)
  
  const prevTxRef = useRef(transaction)
  useEffect(() => {
    if (transaction) prevTxRef.current = transaction
  }, [transaction])
  
  const displayTx = transaction || prevTxRef.current

  if (!shouldRender || !displayTx) return null

  const isIncome = displayTx.type === 'income'

  const executeDelete = async () => {
    setDeleting(true)
    try {
      await deleteTransaction(displayTx.id)
      onClose()
    } catch (err) {
      console.error('Failed to delete transaction:', err)
      alert('Gagal menghapus transaksi')
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
      <div className={`fixed inset-0 z-50 overlay ${isClosing ? 'animate-fade-out' : ''}`} onClick={onClose} />
      <div className={`fixed inset-x-0 bottom-0 z-50 ${isClosing ? 'animate-slide-down' : 'animate-slide-up'}`}>
        <div className="max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl max-h-[90dvh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex justify-between items-start p-4 pb-2">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl shadow-sm border border-gray-100">
              {categoryIcon}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary hover:bg-primary-100 transition-colors"
                title="Edit Transaction"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-text-secondary hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="px-4 pb-6">
            <div className="text-center mb-8">
              <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-1">
              {isIncome ? 'Income' : displayTx.type === 'transfer' ? 'Transfer' : 'Expense'}
            </p>
            <h2 className={`text-4xl font-extrabold ${isIncome ? 'text-emerald-500' : displayTx.type === 'transfer' ? 'text-blue-500' : 'text-text'}`}>
              {isIncome ? '+' : '-'} Rp {formatCurrency(displayTx.amount)}
            </h2>
            <p className="text-lg font-medium text-text mt-2">{displayTx.note || categoryName}</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 space-y-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Tag size={14} className="text-text-secondary" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-text-muted">Category</p>
                <p className="text-sm font-semibold text-text">{categoryName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Wallet size={14} className="text-text-secondary" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-text-muted">Wallet</p>
                <p className="text-sm font-semibold text-text">{walletName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Calendar size={14} className="text-text-secondary" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-text-muted">Date & Time</p>
                <p className="text-sm font-semibold text-text">
                  {displayTx.date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {displayTx.note && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                  <FileText size={14} className="text-text-secondary" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-text-muted">Notes</p>
                  <p className="text-sm font-medium text-text leading-snug">{displayTx.note}</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full mt-6 py-3.5 rounded-xl bg-red-50 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <Trash2 size={18} />
            Hapus Transaksi
          </button>
          </div>
        </div>
      </div>
      <DestructiveModal
        isOpen={showDeleteConfirm}
        title="Hapus Transaksi"
        description="Apakah Anda yakin ingin menghapus transaksi ini? Data tidak dapat dikembalikan."
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={executeDelete}
        isLoading={deleting}
      />
    </>,
    document.body
  )
}
