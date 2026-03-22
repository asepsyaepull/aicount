import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../stores/appStore'

// Your VAPID Public Key generated from the backend or web-push library
// Ensure you replace this later!
export const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  
  const currentUserId = useAppStore((s) => s.currentUserId)
  const currentFamilyId = useAppStore((s) => s.currentFamilyId)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (err) {
      console.error('Error checking push subscription:', err)
    }
  }

  const subscribe = async () => {
    if (!isSupported || !currentUserId || !currentFamilyId) return
    if (!VAPID_PUBLIC_KEY) {
      console.error('VAPID Public Key not set in environment.')
      alert('VAPID Public Key belum diatur.')
      return
    }

    setIsLoading(true)
    try {
      // 1. Request Permission
      const currentPermission = await Notification.requestPermission()
      setPermission(currentPermission)
      if (currentPermission !== 'granted') {
        throw new Error('Permission not granted for Notification')
      }

      // 2. Get Service Worker Registration
      const registration = await navigator.serviceWorker.ready

      // 3. Subscribe to Push Manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })

      // 4. Send subscription to Supabase
      const subJson = subscription.toJSON()

      const { error } = await supabase.from('push_subscriptions').upsert(
        {
          family_id: currentFamilyId,
          user_id: currentUserId,
          endpoint: subJson.endpoint!,
          p256dh: subJson.keys?.p256dh,
          auth: subJson.keys?.auth,
        },
        { onConflict: 'endpoint' }
      )

      if (error) throw error

      setIsSubscribed(true)
      return true
    } catch (err) {
      console.error('Failed to subscribe:', err)
      const msg = err instanceof Error ? err.message : String(err)
      alert(`Gagal mengaktifkan notifikasi: ${msg}`)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const unsubscribe = async () => {
    setIsLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        // Unsubscribe from browser
        await subscription.unsubscribe()
        
        // Remove from database
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', subscription.endpoint)
      }
      setIsSubscribed(false)
      setPermission(Notification.permission)
    } catch (err) {
      console.error('Failed to unsubscribe:', err)
      const msg = err instanceof Error ? err.message : String(err)
      alert(`Gagal mematikan notifikasi: ${msg}`)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe
  }
}
