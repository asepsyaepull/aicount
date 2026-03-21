import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../stores/appStore'
import type { CategoryRow } from '../types/supabase'

export interface Category {
  id: string
  familyId: string
  name: string
  type: 'income' | 'expense'
  icon: string
  isDefault: boolean
}

function mapRow(c: CategoryRow): Category {
  return {
    id: c.id,
    familyId: c.family_id,
    name: c.name,
    type: c.type,
    icon: c.icon ?? '📦',
    isDefault: c.is_default,
  }
}

interface InsertCategoryArgs {
  familyId: string
  name: string
  type: 'income' | 'expense'
  icon: string
}

export async function addCategory(args: InsertCategoryArgs) {
  const { error } = await supabase.from('categories').insert({
    family_id: args.familyId,
    name: args.name,
    type: args.type,
    icon: args.icon,
    is_default: false,
  })
  if (error) throw error
}

export function useCategories() {
  const familyId = useAppStore((s) => s.currentFamilyId)
  const [categories, setCategories] = useState<Category[]>([])

  const fetchCats = useCallback(async () => {
    if (!familyId) return
    const { data } = await supabase.from('categories').select('*').eq('family_id', familyId)
    if (data) {
      setCategories((data as CategoryRow[]).map(mapRow))
    }
  }, [familyId])

  useEffect(() => {
    let ignore = false

    const initialize = async () => {
      if (!familyId) return
      await fetchCats()
    }

    initialize()

    const channel = supabase.channel('categories_changes')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'categories', filter: `family_id=eq.${familyId}` }, 
        () => {
          if (!ignore) fetchCats()
        }
      )
      .subscribe()

    return () => {
      ignore = true
      supabase.removeChannel(channel)
    }
  }, [familyId, fetchCats])

  return { categories, refresh: fetchCats }
}

