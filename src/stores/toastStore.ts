import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

interface ToastState {
  toasts: ToastMessage[]
  addToast: (message: string, type?: ToastType) => void
  removeToast: (id: string) => void
}

let toastIdCounter = 0

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = `toast-${Date.now()}-${++toastIdCounter}`
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }]
    }))

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }))
    }, 3000)
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }))
}))
