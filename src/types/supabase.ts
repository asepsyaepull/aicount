import type { Session } from '@supabase/supabase-js'

// ──────────────────────────────────────────
// Supabase DB Row Types (snake_case columns)
// ──────────────────────────────────────────

export interface WalletRow {
  id: string
  family_id: string
  name: string
  type: 'cash' | 'bank' | 'ewallet'
  balance: number
  color: string | null
  created_at: string
}

export interface TransactionRow {
  id: string
  family_id: string
  wallet_id: string
  category_id: string
  type: 'income' | 'expense' | 'transfer'
  amount: number
  date: string
  note: string | null
  created_by: string | null
  created_at: string
}

export interface CategoryRow {
  id: string
  family_id: string
  name: string
  type: 'income' | 'expense'
  icon: string | null
  is_default: boolean
}

export interface BudgetRow {
  id: string
  family_id: string
  category_id: string
  amount_limit: number
  month_year: string
  created_at: string
}

export interface UserRow {
  id: string
  family_id: string
  role: 'admin' | 'member'
  name: string
  email: string
  avatar_initials: string | null
  created_at: string
}

// Re-export Session for convenience
export type { Session }

// Helper: generic Supabase error shape
export interface AuthError {
  message: string
}
