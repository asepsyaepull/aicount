import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react'
import { formatCurrency } from '../../utils/currency'
import { type Transaction } from '../../hooks/useTransactions'

export interface TransactionItemProps {
  transaction: Transaction
  categoryIcon: string
  categoryName: string
  walletName?: string
  showDate?: boolean // Used to show date in compact list
  onClick?: (tx: Transaction) => void
}

export function TransactionItem({ 
  transaction: tx, 
  categoryIcon, 
  categoryName, 
  walletName,
  showDate,
  onClick
}: TransactionItemProps) {
  
  const renderTypeIcon = (type: string) => {
    if (type === 'income') return <ArrowDownLeft size={14} className="text-emerald-500" />
    if (type === 'transfer') return <ArrowLeftRight size={14} className="text-blue-500" />
    return <ArrowUpRight size={14} className="text-red-500" />
  }

  return (
    <div 
      onClick={() => onClick?.(tx)}
      className={`flex items-center gap-3 bg-white rounded-xl p-3.5 shadow-sm border border-gray-50 ${onClick ? 'cursor-pointer hover:bg-gray-50/50 active:scale-[0.98] transition-all' : ''}`}
    >
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg">
        {categoryIcon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text truncate">
          {tx.note || categoryName}
        </p>
        
        {walletName ? (
          <div className="flex items-center gap-1.5 mt-0.5">
            {renderTypeIcon(tx.type)}
            <span className="text-[11px] text-text-muted">
              {categoryName} · {walletName}
            </span>
          </div>
        ) : (
          <p className="text-[11px] text-text-muted">
            {categoryName} {showDate ? ` · ${tx.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
          </p>
        )}
      </div>
      <p
        className={`text-sm font-bold ${
          tx.type === 'income' ? 'text-emerald-500' : tx.type === 'transfer' ? 'text-blue-500' : 'text-red-500'
        }`}
      >
        {tx.type === 'income' ? '+' : '-'} Rp {formatCurrency(tx.amount)}
      </p>
    </div>
  )
}
