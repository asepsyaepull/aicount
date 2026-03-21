import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../stores/appStore'
import type { BudgetRow } from '../types/supabase'

export interface Budget {
  id: string
  familyId: string
  categoryId: string
  amountLimit: number
  monthYear: string
  createdAt: Date
}

function mapRow(b: BudgetRow): Budget {
  return {
    id: b.id,
    familyId: b.family_id,
    categoryId: b.category_id,
    amountLimit: Number(b.amount_limit),
    monthYear: b.month_year,
    createdAt: new Date(b.created_at),
  }
}

export function useBudgets() {
  const familyId = useAppStore((s) => s.currentFamilyId)
  const selectedMonth = useAppStore((s) => s.selectedMonth)
  const [budgets, setBudgets] = useState<Budget[]>([])

  const fetchBudgets = useCallback(async () => {
    if (!familyId) return
    const { data } = await supabase
      .from('budgets')
      .select('*')
      .eq('family_id', familyId)
      .eq('month_year', selectedMonth)

    if (data) {
      setBudgets((data as BudgetRow[]).map(mapRow))
    }
  }, [familyId, selectedMonth])

  useEffect(() => {
    let ignore = false

    const initialize = async () => {
      if (!familyId) return
      await fetchBudgets()
    }

    initialize()

    const channel = supabase.channel('budgets_changes')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'budgets', filter: `family_id=eq.${familyId}` }, 
        () => {
          if (!ignore) fetchBudgets()
        }
      )
      .subscribe()

    return () => {
      ignore = true
      supabase.removeChannel(channel)
    }
  }, [familyId, fetchBudgets])

  return { budgets, refresh: fetchBudgets }
}

export function useTotalBudget() {
  const familyId = useAppStore((s) => s.currentFamilyId)
  const selectedMonth = useAppStore((s) => s.selectedMonth)
  const [data, setData] = useState({ totalLimit: 0, totalSpent: 0 })

  useEffect(() => {
    let ignore = false
    if (!familyId) return

    const [month, year] = selectedMonth.split('-').map(Number)
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    const fetchData = async () => {
      const { data: limits } = await supabase
        .from('budgets')
        .select('amount_limit')
        .eq('family_id', familyId)
        .eq('month_year', selectedMonth)

      const totalLimit = limits?.reduce((sum: number, b: { amount_limit: number }) => sum + Number(b.amount_limit), 0) || 0

      const { data: expenses } = await supabase
        .from('transactions')
        .select('amount')
        .eq('family_id', familyId)
        .eq('type', 'expense')
        .gte('date', startDate)
        .lte('date', endDate)

      const totalSpent = expenses?.reduce((sum: number, t: { amount: number }) => sum + Number(t.amount), 0) || 0

      if (!ignore) {
        setData({ totalLimit, totalSpent })
      }
    }

    fetchData()

    const limitsChannel = supabase.channel('ttl_b_ch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budgets', filter: `family_id=eq.${familyId}` }, () => {
        if (!ignore) fetchData()
      })
      .subscribe()
      
    const spentChannel = supabase.channel('ttl_t_ch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `family_id=eq.${familyId}` }, () => {
        if (!ignore) fetchData()
      })
      .subscribe()

    return () => {
      ignore = true
      supabase.removeChannel(limitsChannel)
      supabase.removeChannel(spentChannel)
    }
  }, [familyId, selectedMonth])

  return data
}

export async function addBudget(budget: Omit<Budget, 'id' | 'createdAt'>): Promise<string> {
  const { data, error } = await supabase.from('budgets').insert([{
    family_id: budget.familyId,
    category_id: budget.categoryId,
    amount_limit: budget.amountLimit,
    month_year: budget.monthYear
  }]).select().single()

  if (error) throw error
  return data.id
}

export async function updateBudget(id: string, updates: Partial<Budget>) {
  const payload: Record<string, unknown> = {}
  if (updates.amountLimit !== undefined) payload.amount_limit = updates.amountLimit
  await supabase.from('budgets').update(payload).eq('id', id)
}

export async function deleteBudget(id: string) {
  await supabase.from('budgets').delete().eq('id', id)
}
