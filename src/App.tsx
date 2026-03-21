import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { supabase } from './lib/supabase'
import { BudgetPage } from './pages/Budget'
import { HomePage } from './pages/Home'
import { LoginPage } from './pages/Login'
import { OnboardingPage } from './pages/OnboardingPage'
import { ProfilePage } from './pages/Profile'
import { RegisterPage } from './pages/Register'
import { StatisticsPage } from './pages/Statistics'
import { TransactionsPage } from './pages/Transactions'
import { useAppStore } from './stores/appStore'
import type { Session } from './types/supabase'
import { ToastContainer } from './components/ui/ToastContainer'
import { useToastStore } from './stores/toastStore'

function App() {
  const [isReady, setIsReady] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const setCurrentUser = useAppStore((s) => s.setCurrentUser)
  const addToast = useToastStore((s) => s.addToast)

  // Handle Online/Offline Status for PWA
  useEffect(() => {
    const handleOnline = () => addToast('Kembali online! Anda sudah terhubung ke internet.', 'success')
    const handleOffline = () => addToast('Sedang offline. Sebagian fitur mungkin tidak tersedia.', 'error')

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [addToast])

  useEffect(() => {
    async function fetchUserProfile(userId: string) {
      const { data } = await supabase.from('users').select('family_id, created_at').eq('id', userId).single()
      if (data) {
        setCurrentUser(userId, data.family_id)

        // Check if user has completed onboarding
        const onboardedFlag = localStorage.getItem(`aicount_onboarded_${userId}`)
        if (onboardedFlag) {
          setNeedsOnboarding(false)
        } else {
          // If no flag in localStorage, check if they are a NEW user (created < 5 minutes ago)
          const isNewUser = data.created_at && (Date.now() - new Date(data.created_at).getTime() < 5 * 60 * 1000)

          if (isNewUser) {
            // New user must go through onboarding
            setNeedsOnboarding(true)
          } else {
            // Old user who registered before onboarding feature → auto-mark as onboarded
            localStorage.setItem(`aicount_onboarded_${userId}`, 'true')
            setNeedsOnboarding(false)
          }
        }
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
          <img src="/icons/icon-192x192.png" alt="Logo" className="w-16 h-16" />
          <p className="text-sm font-semibold text-primary">Aicount App</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={session ? <Navigate to={needsOnboarding ? '/onboarding' : '/'} /> : <LoginPage />} />
        <Route path="/register" element={session ? <Navigate to={needsOnboarding ? '/onboarding' : '/'} /> : <RegisterPage />} />
        <Route path="/onboarding" element={session ? <OnboardingPage /> : <Navigate to="/login" />} />

        <Route element={session ? (needsOnboarding ? <Navigate to="/onboarding" /> : <AppShell />) : <Navigate to="/login" />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  )
}

export default App
