const cacheName = 'timetable'

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(cacheName)
      .then((cache) => {
        return cache.addAll([
          '/timetable/',
          'index.html',
          'js/script.js',
          'js/lib/ics.deps.min.js',
          'js/lib/ics.min.js',
          'css/style.css',
          'favicon.ico',
          'svg/location.svg',
          'svg/alternative.svg',
          'icons/badge.png',
          'images/big_light.png',
          'images/big_dark.png',
          'images/small_light.png',
          'images/small_dark.png',
          'icons/android-chrome-192x192.png',
          'icons/android-chrome-512x512.png',
          'icons/apple-touch-icon.png',
          'icons/browserconfig.xml',
          'icons/favicon-16x16.png',
          'icons/favicon-32x32.png',
          'icons/mstile-70x70.png',
          'icons/mstile-144x144.png',
          'icons/mstile-150x150.png',
          'icons/mstile-310x150.png',
          'icons/mstile-310x310.png',
          'icons/safari-pinned-tab.svg',
          'icons/site.webmanifest',
        ])
      })
      .catch((e) => console.error(e))
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.url.indexOf('cors') >= 0) {
    event.respondWith(
      fetch(event.request).then((response) => {
        return response
      })
    )
  } else {
    event.respondWith(fromCache(event.request))
    event.waitUntil(update(event.request))
  }
})

const fromCache = (request) => {
  return caches.open(cacheName).then((cache) => {
    return cache.match(request).then((matched) => {
      return matched || Promise.reject(new Error('no match'))
    })
  })
}

const update = (request) => {
  return caches.open(cacheName).then((cache) => {
    return fetch(request).then((response) => {
      return cache.put(request, response)
    })
  })
}

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  if (event.action) {
    if (event.action === 'location') {
      event.waitUntil(
        clients
          .matchAll({
            type: 'window',
          })
          .then(function(clientList) {
            if (clients.openWindow) {
              return clients.openWindow(event.notification.data.location)
            }
          })
      )
    }
  } else {
    event.waitUntil(
      clients
        .matchAll({
          type: 'window',
        })
        .then(function(clientList) {
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i]
            if (
              client.url == event.notification.data.url &&
              'focus' in client
            ) {
              return client.focus()
            }
          }
          if (clients.openWindow) {
            return clients.openWindow(event.notification.data.url)
          }
        })
    )
  }
})
