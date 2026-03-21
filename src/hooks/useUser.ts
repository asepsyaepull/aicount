import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../stores/appStore'

export interface UserProfile {
  id: string
  familyId: string
  role: 'admin' | 'member'
  name: string
  email: string
  avatarInitials: string
  createdAt: Date
}

export function useCurrentUser() {
  const userId = useAppStore((s) => s.currentUserId)
  const [user, setUser] = useState<UserProfile | null>(null)

  const fetchUser = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase.from('users').select('*').eq('id', userId).single()
    if (data) {
      setUser({
          id: data.id,
          familyId: data.family_id,
          role: data.role,
          name: data.name,
          email: data.email,
          avatarInitials: data.avatar_initials,
          createdAt: new Date(data.created_at),
        })
      }
  }, [userId])

  useEffect(() => {
    let ignore = false

    const initialize = async () => {
      if (!userId) return
      await fetchUser()
    }

    initialize()

    const channel = supabase.channel('user_changes')
      .on(
        'postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${userId}` }, 
        () => {
          if (!ignore) fetchUser()
        }
      )
      .subscribe()

    return () => {
      ignore = true
      supabase.removeChannel(channel)
    }
  }, [userId, fetchUser])

  return { user, refresh: fetchUser }
}

export async function updateProfile(id: string, updates: Partial<UserProfile>) {
  const payload: Partial<{
    name: string
    avatar_initials: string
  }> = {}

  if (updates.name !== undefined) payload.name = updates.name
  if (updates.avatarInitials !== undefined) payload.avatar_initials = updates.avatarInitials

  const { error } = await supabase.from('users').update(payload).eq('id', id)
  if (error) throw error
}
