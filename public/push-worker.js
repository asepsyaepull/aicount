self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data?.json() || {}
  } catch (err) {
    console.error('Failed to parse push data', err)
    data = { title: 'Aicount Notification', body: event.data?.text() }
  }

  const title = data.title || 'Aicount'
  const options = {
    body: data.body || 'You have a new message.',
    icon: '/icons/pwa-192x192.png',
    badge: '/icons/pwa-192x192.png',
    data: data.data || { url: '/' }
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i]
        // If so, just focus it.
        if (client.url === new URL(urlToOpen, self.location.origin).href && 'focus' in client) {
          return client.focus()
        }
      }
      // If not, open a new window/tab.
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen)
      }
    })
  )
})
