import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../stores/appStore'
import type { TransactionRow } from '../types/supabase'

export interface Transaction {
  id: string
  familyId: string
  walletId: string
  categoryId: string
  type: 'income' | 'expense' | 'transfer'
  amount: number
  date: Date
  note: string
  createdBy: string
  createdAt: Date
}

function mapRow(t: TransactionRow): Transaction {
  return {
    id: t.id,
    familyId: t.family_id,
    walletId: t.wallet_id,
    categoryId: t.category_id,
    type: t.type,
    amount: Number(t.amount),
    date: new Date(t.date),
    note: t.note ?? '',
    createdBy: t.created_by ?? '',
    createdAt: new Date(t.created_at),
  }
}

export function useTransactions(limit?: number) {
  const familyId = useAppStore((s) => s.currentFamilyId)
  const selectedMonth = useAppStore((s) => s.selectedMonth)
  const refreshTrigger = useAppStore((s) => s.refreshTrigger)
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const fetchTransactions = useCallback(async () => {
    if (!familyId) return

    const [month, year] = selectedMonth.split('-').map(Number)
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('family_id', familyId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data } = await query
    
    if (data) {
      setTransactions((data as TransactionRow[]).map(mapRow))
    }
  }, [familyId, selectedMonth, limit])

  useEffect(() => {
    let ignore = false

    const initialize = async () => {
      if (!familyId) return
      await fetchTransactions()
    }

    initialize()

    const channel = supabase.channel('transactions_changes')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'transactions', filter: `family_id=eq.${familyId}` }, 
        () => {
          if (!ignore) fetchTransactions()
        }
      )
      .subscribe()

    return () => {
      ignore = true;
      supabase.removeChannel(channel)
    }
  }, [familyId, fetchTransactions, refreshTrigger])

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

  return {
    transactions,
    allTransactions: transactions,
    totalIncome,
    totalExpense,
    refresh: fetchTransactions
  }
}

export function useTransactionsByCategory(categoryId: string) {
  const familyId = useAppStore((s) => s.currentFamilyId)
  const selectedMonth = useAppStore((s) => s.selectedMonth)
  const refreshTrigger = useAppStore((s) => s.refreshTrigger)
  const [spent, setSpent] = useState(0)

  useEffect(() => {
    let ignore = false

    if (!familyId) return

    const [month, year] = selectedMonth.split('-').map(Number)
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    const fetchSpent = async () => {
      const { data } = await supabase
        .from('transactions')
        .select('amount')
        .eq('family_id', familyId)
        .eq('category_id', categoryId)
        .eq('type', 'expense')
        .gte('date', startDate)
        .lte('date', endDate)

      if (!ignore && data) {
        setSpent(data.reduce((sum: number, t: { amount: number }) => sum + Number(t.amount), 0))
      }
    }

    fetchSpent()

    const channel = supabase.channel(`tx_cat_${categoryId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `family_id=eq.${familyId}` }, () => {
        if (!ignore) fetchSpent()
      })
      .subscribe()

    return () => {
      ignore = true
      supabase.removeChannel(channel)
    }
  }, [familyId, categoryId, selectedMonth, refreshTrigger])

  return spent
}

export async function addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<string> {
  // Rely on PostgreSQL trigger to atomically update wallets
  const { data, error } = await supabase.from('transactions').insert([{
    family_id: transaction.familyId,
    wallet_id: transaction.walletId,
    category_id: transaction.categoryId,
    type: transaction.type,
    amount: transaction.amount,
    date: transaction.date.toISOString().split('T')[0],
    note: transaction.note,
    created_by: transaction.createdBy
  }]).select().single()

  if (error) throw error
  return data.id
}

export async function deleteTransaction(id: string) {
  // Trigger also handles reversal on DELETE
  await supabase.from('transactions').delete().eq('id', id)
}

export async function updateTransaction(id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt' | 'familyId' | 'createdBy'>>) {
  const payload: Partial<{
    wallet_id: string
    category_id: string
    type: 'income' | 'expense' | 'transfer'
    amount: number
    date: string
    note: string
  }> = {}
  if (updates.walletId) payload.wallet_id = updates.walletId
  if (updates.categoryId) payload.category_id = updates.categoryId
  if (updates.type) payload.type = updates.type
  if (updates.amount !== undefined) payload.amount = updates.amount
  if (updates.date) payload.date = updates.date.toISOString().split('T')[0]
  if (updates.note !== undefined) payload.note = updates.note

  const { error } = await supabase.from('transactions').update(payload).eq('id', id)
  if (error) throw error
}
