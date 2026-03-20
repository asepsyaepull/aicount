import { create } from 'zustand'

interface AppState {
  currentUserId: string | null
  currentFamilyId: string | null
  selectedMonth: string // 'MM-YYYY'
  isAddTransactionOpen: boolean
  editingTransactionId: string | null

  setCurrentUser: (userId: string, familyId: string) => void
  setSelectedMonth: (month: string) => void
  openAddTransaction: () => void
  closeAddTransaction: () => void
  openEditTransaction: (id: string) => void
}

const now = new Date()
const currentMonth = `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`

export const useAppStore = create<AppState>((set) => ({
  currentUserId: null,
  currentFamilyId: null,
  selectedMonth: currentMonth,
  isAddTransactionOpen: false,
  editingTransactionId: null,

  setCurrentUser: (userId, familyId) => set({ currentUserId: userId, currentFamilyId: familyId }),
  setSelectedMonth: (month) => set({ selectedMonth: month }),
  openAddTransaction: () => set({ isAddTransactionOpen: true, editingTransactionId: null }),
  closeAddTransaction: () => set({ isAddTransactionOpen: false, editingTransactionId: null }),
  openEditTransaction: (id) => set({ isAddTransactionOpen: true, editingTransactionId: id }),
}))
