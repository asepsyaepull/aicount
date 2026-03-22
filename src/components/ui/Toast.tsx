import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import type { ToastMessage } from '../../stores/toastStore'
import { useToastStore } from '../../stores/toastStore'

interface ToastProps {
  toast: ToastMessage
}

const icons = {
  success: <CheckCircle2 size={18} className="text-green-600" />,
  error: <AlertCircle size={18} className="text-red-600" />,
  info: <Info size={18} className="text-blue-600" />
}

const backgroundColors = {
  success: 'bg-green-50',
  error: 'bg-red-50',
  info: 'bg-blue-50'
}

const borderColors = {
  success: 'border-green-600',
  error: 'border-red-600',
  info: 'border-blue-600'
}

export function Toast({ toast }: ToastProps) {
  const removeToast = useToastStore((s) => s.removeToast)
  const [isClosing, setIsClosing] = useState(false)

  // Wait a brief moment before removing from DOM to play exit animation
  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      removeToast(toast.id)
    }, 300) // matches animation duration
  }

  // Effect to automatically set closing state just before automatic removal
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClosing(true)
    }, 2700) // 3000ms total lifetime - 300ms animation

    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`pointer-events-auto flex items-center justify-between w-full p-3 rounded-xl shadow-lg shadow-black/10 transition-all duration-300 ${backgroundColors[toast.type]} ${
        isClosing ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'
      } ${borderColors[toast.type]} border-2`}
    >
      <div className="flex items-center gap-3">
        <div className="shrink-0">{icons[toast.type]}</div>
        <p className={`text-sm font-semibold ${toast.type === 'success' ? 'text-green-600' : toast.type === 'error' ? 'text-red-600' : 'text-blue-600'}`}>{toast.message}</p>
      </div>
      <button
        onClick={handleClose}
        className="shrink-0 ml-4 p-1 rounded-full hover:bg-white/20 active:bg-white/30 transition-colors text-text-muted hover:text-text"
        aria-label="Close message"
      >
        <X size={16} />
      </button>
    </div>
  )
}
