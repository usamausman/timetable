const cacheName = "timetable"

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll([
        "/timetable/",
        "index.html",
        "script.js",
        "style.css",
        "favicon.ico",
        "refresh.svg",
        "icons/android-chrome-192x192.png",
        "icons/android-chrome-512x512.png",
        "icons/apple-touch-icon.png",
        "icons/browserconfig.xml",
        "icons/favicon-16x16.png",
        "icons/favicon-32x32.png",
        "icons/mstile-70x70.png",
        "icons/mstile-144x144.png",
        "icons/mstile-150x150.png",
        "icons/mstile-310x150.png",
        "icons/mstile-310x310.png",
        "icons/safari-pinned-tab.svg",
        "icons/site.webmanifest"
      ])
    })
  )
})

self.addEventListener("fetch", (event) => {
  event.respondWith(fromCache(event.request))
  if (event.request.url.indexOf("heroku") === -1) {
    event.waitUntil(update(event.request))
  }
})

const fromCache = (request) => {
  return caches.open(cacheName).then((cache) => {
    return cache.match(request).then((matched) => {
      return matched || Promise.reject("no match")
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
