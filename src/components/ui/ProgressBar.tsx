import { getBudgetColor, getBudgetBgColor } from '../../utils/budget'

interface ProgressBarProps {
  percentage: number
  height?: string
  showLabel?: boolean
  className?: string
}

export function ProgressBar({ percentage, height = 'h-2.5', showLabel = false, className = '' }: ProgressBarProps) {
  const clampedPercentage = Math.min(percentage, 100)
  const color = getBudgetColor(percentage)
  const bgColor = getBudgetBgColor(percentage)

  return (
    <div className={className}>
      <div
        className={`w-full rounded-full ${height} overflow-hidden`}
        style={{ backgroundColor: bgColor }}
      >
        <div
          className={`${height} rounded-full progress-bar-fill`}
          style={{
            width: `${clampedPercentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium mt-1" style={{ color }}>
          {percentage}% Used
        </span>
      )}
    </div>
  )
}
