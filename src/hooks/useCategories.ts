import { useEffect, useState } from 'react'
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

export function useCategories() {
  const familyId = useAppStore((s) => s.currentFamilyId)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    if (!familyId) return

    const fetchCats = async () => {
      const { data } = await supabase.from('categories').select('*').eq('family_id', familyId)
      if (data) {
        setCategories((data as CategoryRow[]).map(mapRow))
      }
    }

    fetchCats()

    const channel = supabase.channel('categories_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories', filter: `family_id=eq.${familyId}` }, fetchCats)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [familyId])

  return categories
}

