import { formatCurrency } from '../../utils/currency'

interface SimpleBarChartItem {
  label: string
  value: number
  color: string
}

interface SimpleBarChartProps {
  data: SimpleBarChartItem[]
  maxValue: number
}

export function SimpleBarChart({ data, maxValue }: SimpleBarChartProps) {
  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((item, i) => {
        const heightPct = maxValue > 0 ? (item.value / maxValue) * 100 : 0
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[9px] font-medium text-text-muted whitespace-nowrap">
              {item.value > 0 ? formatCurrency(item.value) : '-'}
            </span>
            <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '120px' }}>
              <div
                className="absolute bottom-0 w-full rounded-t-lg transition-all duration-500"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: item.color,
                  minHeight: item.value > 0 ? '4px' : '0',
                }}
              />
            </div>
            <span className="text-[10px] font-medium text-text-muted">{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}
