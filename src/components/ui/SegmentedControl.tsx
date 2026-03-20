interface SegmentedControlProps {
  value: 'expense' | 'income' | 'transfer'
  onChange: (value: 'expense' | 'income' | 'transfer') => void
}

const segments = [
  { value: 'expense' as const, label: 'Expense', color: 'bg-red-500', textColor: 'text-red-500' },
  { value: 'income' as const, label: 'Income', color: 'bg-emerald-500', textColor: 'text-emerald-500' },
  { value: 'transfer' as const, label: 'Transfer', color: 'bg-blue-500', textColor: 'text-blue-500' },
]

export function SegmentedControl({ value, onChange }: SegmentedControlProps) {
  return (
    <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
      {segments.map((seg) => {
        const isActive = value === seg.value
        return (
          <button
            key={seg.value}
            onClick={() => onChange(seg.value)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              isActive
                ? `${seg.color} text-white shadow-sm`
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {seg.label}
          </button>
        )
      })}
    </div>
  )
}
