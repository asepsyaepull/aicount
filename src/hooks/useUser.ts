import { useEffect, useState } from 'react'
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

  useEffect(() => {
    if (!userId) return

    const fetchUser = async () => {
      const { data } = await supabase.from('users').select('*').eq('id', userId).single()
      if (data) {
        setUser({
          id: data.id,
          familyId: data.family_id,
          role: data.role,
          name: data.name,
          email: data.email,
          avatarInitials: data.avatar_initials,
          createdAt: new Date(data.created_at)
        })
      }
    }

    fetchUser()

    const channel = supabase.channel('user_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${userId}` }, fetchUser)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  return user
}
