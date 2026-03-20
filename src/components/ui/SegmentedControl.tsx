interface SegmentedControlProps {
  value: 'expense' | 'income' | 'transfer'
  onChange: (value: 'expense' | 'income' | 'transfer') => void
}

const segments = [
  { value: 'expense' as const, label: 'Expense', color: 'bg-red-500', textColor: 'text-red-500' },
  { value: 'income' as const, label: 'Income', color: 'bg-emerald-800', textColor: 'text-emerald-500' },
  { value: 'transfer' as const, label: 'Transfer', color: 'bg-blue-500', textColor: 'text-blue-500' },
]

export function SegmentedControl({ value, onChange }: SegmentedControlProps) {
  const activeIndex = segments.findIndex((s) => s.value === value)
  const activeSegment = segments[activeIndex]

  return (
    <div className="relative flex bg-gray-100 rounded-xl p-1">
      {/* Sliding Background */}
      <div
        className={`absolute top-1 bottom-1 left-1 rounded-lg shadow-sm transition-all duration-300 ease-out ${
          activeSegment?.color || 'bg-primary'
        }`}
        style={{
          width: 'calc((100% - 8px) / 3)',
          transform: `translateX(calc(${activeIndex * 100}%))`,
        }}
      />

      {/* Buttons */}
      {segments.map((seg) => {
        const isActive = value === seg.value
        return (
          <button
            key={seg.value}
            onClick={() => onChange(seg.value)}
            className={`relative z-10 flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-300 ${
              isActive ? 'text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {seg.label}
          </button>
        )
      })}
    </div>
  )
}
