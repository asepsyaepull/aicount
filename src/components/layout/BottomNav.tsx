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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2 relative">
        {navItems.map((item) => {
          if (item.isFab) {
            return (
              <button
                key="fab"
                onClick={openAddTransaction}
                className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full gradient-primary shadow-lg shadow-primary/30 flex items-center justify-center text-white active:scale-95 transition-transform"
                aria-label="Add Transaction"
                id="fab-add-transaction"
              >
                <Plus size={28} strokeWidth={2.5} />
              </button>
            )
          }

          const isActive = location.pathname === item.to
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
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
        })}
      </div>
    </nav>
  )
}
