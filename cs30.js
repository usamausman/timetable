const cacheName = "timetable"

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll([
        "/timetable/",
        "index.html",
        "js/script.js",
        "css/style.css",
        "favicon.ico",
        "svg/location.svg",
        "svg/alternate.svg",
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
  if (event.request.url.indexOf("heroku") === -1) {
    event.respondWith(fromCache(event.request))
    event.waitUntil(update(event.request))
  } else {
    event.respondWith(fetch(event.request).then((response) => {
      return response
    }))
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
