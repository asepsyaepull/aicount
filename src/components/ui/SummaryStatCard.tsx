import type { ReactNode } from 'react'
import { formatCurrency } from '../../utils/currency'

interface SummaryStatCardProps {
  leftTitle: string
  leftAmount: number | string
  leftPrefix?: string
  leftColorClass?: string
  leftIcon?: ReactNode
  
  rightTitle: string
  rightAmount: number | string
  rightPrefix?: string
  rightColorClass?: string
  rightIcon?: ReactNode
}

export function SummaryStatCard({ 
  leftTitle, leftAmount, leftPrefix = '', leftColorClass = 'text-text', leftIcon,
  rightTitle, rightAmount, rightPrefix = '', rightColorClass = 'text-text', rightIcon
}: SummaryStatCardProps) {
  return (
    <div className="w-full py-3 rounded-xl border border-gray-100 bg-white/50 backdrop-blur-sm flex justify-center items-center shadow-sm">
      <div className="flex-1 flex flex-col justify-center items-center gap-1.5 px-2 text-center">
        <div className="text-text-muted text-[11px] font-medium flex items-center gap-1">
          {leftIcon} {leftTitle}
        </div>
        <div className={`text-sm font-bold ${leftColorClass}`}>
          {leftPrefix} Rp {typeof leftAmount === 'number' ? formatCurrency(leftAmount) : leftAmount}
        </div>
      </div>
      
      <div className="w-px h-8 bg-gray-100 shrink-0" />
      
      <div className="flex-1 flex flex-col justify-center items-center gap-1.5 px-2 text-center">
        <div className="text-text-muted text-[11px] font-medium flex items-center gap-1">
          {rightIcon} {rightTitle}
        </div>
        <div className={`text-sm font-bold ${rightColorClass}`}>
          {rightPrefix} Rp {typeof rightAmount === 'number' ? formatCurrency(rightAmount) : rightAmount}
        </div>
      </div>
    </div>
  )
}
