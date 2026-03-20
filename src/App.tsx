import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { HomePage } from './pages/Home'
import { TransactionsPage } from './pages/Transactions'
import { BudgetPage } from './pages/Budget'
import { StatisticsPage } from './pages/Statistics'
import { ProfilePage } from './pages/Profile'
import { LoginPage } from './pages/Login'
import { RegisterPage } from './pages/Register'
import { useAppStore } from './stores/appStore'
import { supabase } from './lib/supabase'
import type { Session } from './types/supabase'

function App() {
  const [isReady, setIsReady] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const setCurrentUser = useAppStore((s) => s.setCurrentUser)

  useEffect(() => {
    async function fetchUserProfile(userId: string) {
      const { data } = await supabase.from('users').select('family_id').eq('id', userId).single()
      if (data) {
        setCurrentUser(userId, data.family_id)
      }
      setIsReady(true)
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setIsReady(true)
      }
    })

    // Listen to changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setIsReady(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [setCurrentUser])

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-dvh bg-bg">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
            <span className="text-white font-extrabold text-2xl">A</span>
          </div>
          <p className="text-sm font-semibold text-primary">Aicount</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={session ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/register" element={session ? <Navigate to="/" /> : <RegisterPage />} />
        
        <Route element={session ? <AppShell /> : <Navigate to="/login" />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
