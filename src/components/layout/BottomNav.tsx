import { NavLink, useLocation } from 'react-router-dom'
import { Home, ArrowLeftRight, PieChart, User, Plus } from 'lucide-react'
import { useAppStore } from '../../stores/appStore'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transaction' },
  { to: '#fab', icon: Plus, label: 'Add', isFab: true },
  { to: '/budget', icon: PieChart, label: 'Budget' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export function BottomNav() {
  const location = useLocation()
  const openAddTransaction = useAppStore((s) => s.openAddTransaction)

  // Split items into left and right, ignoring the fab placeholder in the array
  const leftItems = navItems.slice(0, 2)
  const rightItems = navItems.slice(3, 5)

  const renderNavItem = (item: typeof navItems[0]) => {
    const isActive = location.pathname === item.to
    return (
      <NavLink
        key={item.to}
        to={item.to}
        className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors ${
          isActive ? 'text-primary' : 'text-text-muted'
        }`}
        id={`nav-${item.label.toLowerCase()}`}
      >
        <item.icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
        <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
          {item.label}
        </span>
      </NavLink>
    )
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-bottom">
      <div className="max-w-md mx-auto h-16 relative">
        <div className="flex items-center justify-center h-full">
          {/* Left Group */}
          <div className="flex items-center justify-evenly flex-1">
            {leftItems.map(renderNavItem)}
          </div>

          {/* Center Space for FAB */}
          <div className="w-8 shrink-0" />

          {/* Right Group */}
          <div className="flex items-center justify-evenly flex-1">
            {rightItems.map(renderNavItem)}
          </div>
        </div>

        {/* Floating Action Button - Mathematically Centered */}
        <button
          onClick={openAddTransaction}
          className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full gradient-primary shadow-lg shadow-primary/30 flex items-center justify-center text-white active:scale-95 transition-transform z-10"
          aria-label="Add Transaction"
          id="fab-add-transaction"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>
    </nav>
  )
}
