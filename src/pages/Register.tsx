import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        // Assume user might need email confirmation or direct login depending on Supabase settings.
        // For simplicity, we just redirect to login with a success param
        navigate('/login', { state: { message: 'Registration successful! Please sign in.' } })
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      })
      if (error) throw error
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google login failed'
      setError(message)
    }
  }

  return (
    <div className="flex flex-col min-h-dvh w-full max-w-md mx-auto bg-bg relative overflow-hidden sm:shadow-2xl sm:border-x sm:border-gray-50 animate-fade-in">
      {/* Header */}
      <div className="gradient-header px-5 pt-16 pb-24 rounded-b-3xl text-center shrink-0">
        <div className="w-16 h-16 backdrop-blur-md rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg border border-white/10">
          <img src="/icons/icon-192x192.png" alt="Google" className="w-16 h-16" />
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Create Account</h1>
        <p className="text-white/80 text-sm">Start managing your family wealth safely.</p>
      </div>

      {/* Form Container */}
      <div className="flex-1 px-5 -mt-12 pb-8">
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-black/5">

        {error && (
          <div className="p-3 mb-6 bg-red-50 text-red-500 text-sm rounded-xl border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 ml-1">Full Name</label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 rounded-2xl text-sm border border-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 ml-1">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@aicount.app"
                required
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 rounded-2xl text-sm border border-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 ml-1">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-11 pr-12 py-3.5 bg-gray-50 rounded-2xl text-sm border border-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-4 rounded-2xl gradient-primary text-white font-bold shadow-lg shadow-primary/30 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="relative my-8 flex items-center justify-center">
          <div className="absolute inset-x-0 h-px bg-gray-100" />
          <span className="relative bg-white px-4 text-xs font-medium text-text-muted">OR CONTINUE WITH</span>
        </div>

          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-white border border-gray-200 text-sm font-bold text-text hover:bg-gray-50 transition-colors shadow-sm"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Google
          </button>

          <p className="text-center text-sm text-text-muted mt-8">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
