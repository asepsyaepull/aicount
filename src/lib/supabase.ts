import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local')
}

// Initialize Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)

// Helper to get current user ID
export const getCurrentUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id
}

// Database typing helper forms
export type Tables = {
  families: {
    id: string
    invite_code: string
    created_at: string
  }
  users: {
    id: string
    family_id: string
    role: 'admin' | 'member'
    name: string
    email: string
    avatar_initials: string
    created_at: string
  }
  wallets: {
    id: string
    family_id: string
    name: string
    type: 'cash' | 'bank' | 'ewallet'
    balance: number
    color: string
    created_at: string
  }
  categories: {
    id: string
    family_id: string
    name: string
    type: 'income' | 'expense'
    icon: string
    is_default: boolean
  }
  transactions: {
    id: string
    family_id: string
    wallet_id: string
    category_id: string
    type: 'income' | 'expense' | 'transfer'
    amount: number
    date: string
    note: string
    created_by: string
    created_at: string
  }
  budgets: {
    id: string
    family_id: string
    category_id: string
    amount_limit: number
    month_year: string
    created_at: string
  }
}
