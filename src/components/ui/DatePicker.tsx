import { useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, ChevronLeft, ChevronRight, X, Calendar as CalendarIcon } from 'lucide-react'

interface DatePickerProps {
  value: string // 'YYYY-MM-DD'
  onChange: (date: string) => void
  maxDate?: string // 'YYYY-MM-DD'
  className?: string
  colorVariant?: 'primary' | 'white' | 'gray'
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function DatePicker({ value, onChange, maxDate, className = '', colorVariant = 'gray' }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(new Date())

  // Parse YYYY-MM-DD safely
  const parseDateString = (dateStr: string) => {
    if (!dateStr) return new Date()
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d)
  }

  const selectedDateObj = parseDateString(value)

  const handleOpen = () => {
    setViewDate(parseDateString(value))
    setIsOpen(true)
  }

  const handleDaySelect = (day: number) => {
    const y = viewDate.getFullYear()
    const m = String(viewDate.getMonth() + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    onChange(`${y}-${m}-${d}`)
    setIsOpen(false)
  }

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
  }

  // Calendar logic
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()

  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Max Date logic
  const maxDateObj = maxDate ? parseDateString(maxDate) : null
  const isFutureMonth = maxDateObj && new Date(year, month, 1) > new Date(maxDateObj.getFullYear(), maxDateObj.getMonth(), 1)

  // Check if today
  const today = new Date()
  const formatDisplay = (dateObj: Date) => {
    const isToday =
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    
    if (isToday) return 'Today'
    
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  // Styling variants
  const colorStyles = {
    primary: 'text-primary bg-primary-50 border-primary-100',
    white: 'text-white/90 bg-white/10 border-white/20',
    gray: 'text-text-secondary bg-gray-50 border-gray-200 focus:ring-primary/30',
  }

  return (
    <>
      <button
        onClick={handleOpen}
        type="button"
        className={`w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 flex items-center justify-between transition-all active:scale-[0.98] ${colorStyles[colorVariant]} ${className}`}
      >
        <div className="flex items-center gap-2">
          <CalendarIcon size={16} className="text-text-muted opacity-70" />
          <span className="font-medium text-text">{formatDisplay(selectedDateObj)}</span>
        </div>
        <ChevronDown size={14} className="text-text-muted opacity-70" />
      </button>

      {/* Modal Slide Up */}
      {isOpen && createPortal(
        <>
          <div className="fixed inset-0 z-60 overlay" onClick={() => setIsOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 z-70 animate-slide-up">
            <div className="max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl p-5 pb-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-text">Select Date</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Month/Year Selector */}
              <div className="flex items-center justify-between px-1 mb-6">
                <button 
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-text-secondary transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="text-center">
                  <span className="text-base font-bold text-text block">{MONTHS[month]}</span>
                  <span className="text-xs font-semibold text-text-muted">{year}</span>
                </div>
                <button 
                  onClick={handleNextMonth}
                  disabled={!!isFutureMonth}
                  className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-text-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Weekdays */}
              <div className="grid grid-cols-7 mb-2">
                {WEEKDAYS.map(day => (
                  <div key={day} className="text-center text-[10px] font-bold text-text-muted uppercase">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-y-2 gap-x-1">
                {blanks.map(b => <div key={`blank-${b}`} />)}
                
                {days.map(day => {
                  const currentDate = new Date(year, month, day)
                  
                  const isSelected = 
                    selectedDateObj.getDate() === day && 
                    selectedDateObj.getMonth() === month && 
                    selectedDateObj.getFullYear() === year

                  const isToday = 
                    today.getDate() === day && 
                    today.getMonth() === month && 
                    today.getFullYear() === year

                  const isDisabled = maxDateObj ? currentDate > maxDateObj : false

                  return (
                    <button
                      key={day}
                      onClick={() => handleDaySelect(day)}
                      disabled={isDisabled}
                      className={`h-10 w-full flex items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                        isDisabled 
                          ? 'text-gray-300 cursor-not-allowed'
                          : isSelected
                            ? 'gradient-primary text-white shadow-md shadow-primary/30 active:scale-95'
                            : isToday
                              ? 'bg-primary/10 text-primary active:scale-95'
                              : 'text-text hover:bg-gray-100 active:scale-95'
                      }`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
              
              <div className="mt-8 flex justify-center">
                 <button 
                   onClick={() => handleDaySelect(today.getDate())} 
                   className="text-primary font-bold text-sm px-4 py-2 bg-primary/10 rounded-xl active:scale-95 transition-all"
                 >
                   Jump to Today
                 </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  )
}
