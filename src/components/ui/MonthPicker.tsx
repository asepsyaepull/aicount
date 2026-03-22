import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useAppStore } from '../../stores/appStore'
import { formatMonthYear } from '../../utils/budget'
import { ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react'

interface MonthPickerProps {
  className?: string
  colorVariant?: 'primary' | 'white' | 'gray'
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

export function MonthPicker({ className = '', colorVariant = 'primary' }: MonthPickerProps) {
  const selectedMonth = useAppStore((s) => s.selectedMonth)
  const setSelectedMonth = useAppStore((s) => s.setSelectedMonth)

  const [isOpen, setIsOpen] = useState(false)
  const [viewYear, setViewYear] = useState<number>(new Date().getFullYear())

  const handleOpen = () => {
    // Initialize view year to the currently selected year when opening
    const [, y] = selectedMonth.split('-')
    setViewYear(parseInt(y, 10))
    setIsOpen(true)
  }

  // Check if it's the current month
  const now = new Date()
  const currentMonthStr = `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`
  const isCurrentMonth = selectedMonth === currentMonthStr

  const displayLabel = isCurrentMonth ? 'This Month' : formatMonthYear(selectedMonth)

  // Styling variants
  const colorStyles = {
    primary: 'text-primary',
    white: 'text-white/90',
    gray: 'text-text-secondary',
  }

  const handleMonthSelect = (monthIndex: number) => {
    const mm = String(monthIndex + 1).padStart(2, '0')
    const yyyy = viewYear.toString()
    setSelectedMonth(`${mm}-${yyyy}`)
    setIsOpen(false)
  }

  // Parse currently selected to highlight active month
  const [selM, selY] = selectedMonth.split('-')
  const activeMonthIdx = parseInt(selM, 10) - 1
  const activeYear = parseInt(selY, 10)

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleOpen}
        className={`relative flex items-center gap-1 cursor-pointer transition-opacity hover:opacity-80 active:scale-95 ${colorStyles[colorVariant]} ${className}`}
      >
        {colorVariant === 'primary' && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
        <span className="text-xs font-semibold whitespace-nowrap">{displayLabel}</span>
        <ChevronDown size={14} />
      </button>

      {/* Modal Slide Up */}
      {isOpen && createPortal(
        <>
          <div className="fixed inset-0 z-50 overlay" onClick={() => setIsOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
            <div className="max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl max-h-[90dvh] overflow-y-auto pb-16">
              {/* Header */}
              <div className="flex items-center justify-between p-4 pb-2">
                <h3 className="text-lg font-bold text-text">Select Month</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-4 pb-6">
                {/* Year Selector */}
                <div className="flex items-center justify-between px-2 mb-6">
                  <button
                  onClick={() => setViewYear(y => y - 1)}
                  className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-text-secondary transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-lg font-bold text-text">{viewYear}</span>
                <button
                  onClick={() => setViewYear(y => y + 1)}
                  disabled={viewYear >= now.getFullYear()}
                  className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-text-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Month Grid */}
              <div className="grid grid-cols-4 gap-3">
                {MONTHS.map((monthName, idx) => {
                  const isSelected = activeMonthIdx === idx && activeYear === viewYear
                  // Highlight current actual month slightly different if needed
                  const isActualCurrentMonth = idx === now.getMonth() && viewYear === now.getFullYear()

                  const isDisabled = viewYear > now.getFullYear() || (viewYear === now.getFullYear() && idx > now.getMonth())

                  return (
                    <button
                      key={monthName}
                      onClick={() => handleMonthSelect(idx)}
                      disabled={isDisabled}
                      className={`py-3 rounded-2xl text-sm font-semibold transition-all ${
                        isDisabled
                          ? 'bg-gray-50 text-gray-300 border border-transparent cursor-not-allowed'
                          : isSelected
                            ? 'gradient-primary text-white shadow-md shadow-primary/30 border border-transparent active:scale-95'
                            : isActualCurrentMonth
                              ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 active:scale-95'
                              : 'bg-gray-50 text-text-secondary border border-gray-100 hover:bg-gray-100 active:scale-95'
                      }`}
                    >
                      {monthName}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </>,
      document.body
    )}
  </>
)
}
