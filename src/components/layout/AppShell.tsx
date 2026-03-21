import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { AddTransactionSheet } from '../transaction/AddTransactionSheet'
import { useAppStore } from '../../stores/appStore'

export function AppShell() {
  const isOpen = useAppStore((s) => s.isAddTransactionOpen)
  const onClose = useAppStore((s) => s.closeAddTransaction)

  return (
    <div className="flex flex-col h-dvh w-full max-w-md mx-auto relative bg-bg overflow-hidden sm:shadow-2xl sm:border-x sm:border-gray-50">
      <main className="flex-1 overflow-y-auto pb-24 w-full">
        <Outlet />
      </main>
      <BottomNav />
      <AddTransactionSheet 
        isOpen={isOpen} 
        onClose={onClose} 
      />
    </div>
  )
}
