import { Search } from 'lucide-react'

export type TransactionFilterType = 'all' | 'income' | 'expense' | 'transfer'

interface TransactionFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  filter: TransactionFilterType
  onFilterChange: (value: TransactionFilterType) => void
}

export function TransactionFilters({
  search,
  onSearchChange,
  filter,
  onFilterChange,
}: TransactionFiltersProps) {
  const filterOptions: TransactionFilterType[] = ['all', 'income', 'expense', 'transfer']

  return (
    <>
      {/* Search */}
      <div className="px-5 mt-6">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl text-sm border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-text-muted"
          />
        </div>
      </div>

      {/* Filter pills */}
      <div className="px-5 mt-5 flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {filterOptions.map((f) => (
          <button
            key={f}
            onClick={() => onFilterChange(f)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filter === f
                ? 'gradient-primary text-white shadow-sm'
                : 'bg-white text-text-secondary border border-gray-200'
            }`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
    </>
  )
}
