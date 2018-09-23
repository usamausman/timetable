self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("timetable").then((cache) => {
      return cache.addAll([
        "index.html",
        "script.js",
        "style.css",
        "favicon.ico",
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
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})