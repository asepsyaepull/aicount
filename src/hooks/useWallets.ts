import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../stores/appStore'
import type { WalletRow } from '../types/supabase'

export interface Wallet {
  id: string
  familyId: string
  name: string
  type: 'cash' | 'bank' | 'ewallet'
  balance: number
  color: string
  createdAt: Date
}

function mapRow(w: WalletRow): Wallet {
  return {
    id: w.id,
    familyId: w.family_id,
    name: w.name,
    type: w.type,
    balance: Number(w.balance),
    color: w.color ?? '#2A9D8F',
    createdAt: new Date(w.created_at),
  }
}

export function useWallets() {
  const familyId = useAppStore((s) => s.currentFamilyId)
  const [wallets, setWallets] = useState<Wallet[]>([])

  const fetchWallets = useCallback(async () => {
    if (!familyId) return
    const { data } = await supabase.from('wallets').select('*').eq('family_id', familyId)
    if (data) {
      setWallets((data as WalletRow[]).map(mapRow))
    }
  }, [familyId])

  useEffect(() => {
    let ignore = false

    const initialize = async () => {
      if (!familyId) return
      await fetchWallets()
    }

    initialize()

    const channel = supabase.channel('wallets_changes')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'wallets', filter: `family_id=eq.${familyId}` }, 
        () => {
          if (!ignore) fetchWallets()
        }
      )
      .subscribe()

    return () => {
      ignore = true
      supabase.removeChannel(channel)
    }
  }, [familyId, fetchWallets])

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0)

  return { wallets, totalBalance, refresh: fetchWallets }
}

export async function addWallet(wallet: Omit<Wallet, 'id' | 'createdAt'>) {
  const { data, error } = await supabase.from('wallets').insert([{
    family_id: wallet.familyId,
    name: wallet.name,
    type: wallet.type,
    balance: wallet.balance,
    color: wallet.color
  }]).select().single()
  
  if (error) throw error
  return data.id
}

export async function updateWallet(id: string, updates: Partial<Wallet>) {
  const payload: Record<string, unknown> = {}
  if (updates.name !== undefined) payload.name = updates.name
  if (updates.balance !== undefined) payload.balance = updates.balance
  if (updates.color !== undefined) payload.color = updates.color
  if (updates.type !== undefined) payload.type = updates.type

  await supabase.from('wallets').update(payload).eq('id', id)
}

export async function deleteWallet(id: string) {
  await supabase.from('wallets').delete().eq('id', id)
}

