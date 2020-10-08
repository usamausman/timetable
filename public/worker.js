const CACHE = 'timetable'
const version = 0

const fromCache = (request) => {
  return caches.open(CACHE).then((cache) => {
    return cache.match(request).then((res) => {
      return res || Promise.reject('no match')
    })
  })
}

const update = (request) => {
  return caches.open(CACHE).then((cache) => {
    return fetch(request).then((res) => {
      return cache.put(request, res)
    })
  })
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        cache.addAll([
          './',
          './global.css',
          './build/bundle.css',
          './build/bundle.js',
          './site.webmanifest',
          './favicon.ico',
          './icon/android-chrome-192x192.png',
          './icon/android-chrome-512x512.png',
          './icon/apple-touch-icon.png',
          './icon/badge.png',
          './icon/browserconfig.xml',
          './icon/favicon-16x16.png',
          './icon/favicon-32x32.png',
          './icon/mstile-70x70.png',
          './icon/mstile-144x144.png',
          './icon/mstile-150x150.png',
          './icon/mstile-310x150.png',
          './icon/mstile-310x310.png',
          './icon/safari-pinned-tab.svg',
        ])
      )
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('cors-anywhere')) {
    event.respondWith(fetch(event.request))
  } else {
    event.respondWith(fromCache(event.request))
    event.waitUntil(update(event.request))
  }
})
