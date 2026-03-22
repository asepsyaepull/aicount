import { createPortal } from 'react-dom'
import { useToastStore } from '../../stores/toastStore'
import { Toast } from './Toast'

export function
ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)

  if (toasts.length === 0) return null

  return createPortal(
    <div className="fixed top-8 left-0 right-0 z-100 pointer-events-none sm:flex sm:justify-center">
      {/*
        This wrapper mimics the app's max-w-md layout constraints
        so toasts appear properly aligned and inset from the edges
      */}
      <div className="w-full max-w-md mx-auto p-4 flex flex-col gap-2 relative pointer-events-none mt-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </div>
    </div>,
    document.body
  )
}
