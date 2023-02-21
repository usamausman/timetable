const l = [
  "/timetable/_app/immutable/entry/app.9bcbee0d.mjs",
  "/timetable/_app/immutable/chunks/0.5985eb66.mjs",
  "/timetable/_app/immutable/chunks/1.eccc8971.mjs",
  "/timetable/_app/immutable/chunks/2.9d55a5f9.mjs",
  "/timetable/_app/immutable/chunks/_layout.79cb23d1.mjs",
  "/timetable/_app/immutable/chunks/index.5d639881.mjs",
  "/timetable/_app/immutable/chunks/index.cbc35c55.mjs",
  "/timetable/_app/immutable/chunks/paths.a045e744.mjs",
  "/timetable/_app/immutable/chunks/singletons.4346b068.mjs",
  "/timetable/_app/immutable/entry/start.b564c185.mjs",
  "/timetable/_app/immutable/entry/error.svelte.025fb3d8.mjs",
  "/timetable/_app/immutable/assets/_layout.c717f575.css",
  "/timetable/_app/immutable/entry/_layout.svelte.aa7b4b5b.mjs",
  "/timetable/_app/immutable/entry/_layout.ts.464e3015.mjs",
  "/timetable/_app/immutable/assets/_page.8bcc86e2.css",
  "/timetable/_app/immutable/entry/_page.svelte.26512953.mjs",
  "/timetable/_app/immutable/assets/alternative_time.b3b35b56.svg",
  "/timetable/_app/immutable/assets/link.85164be1.svg",
  "/timetable/_app/immutable/assets/location.05c954b2.svg",
  "/timetable/_app/immutable/assets/mode.ce93791e.svg",
  "/timetable/_app/immutable/assets/note.e51d504c.svg",
  "/timetable/_app/immutable/assets/person.7992d4b8.svg",
  "/timetable/_app/immutable/assets/settings.8846e3fe.svg",
  "/timetable/_app/immutable/assets/time.a67ef05d.svg",
  "/timetable/_app/immutable/assets/triangle.c270a8be.svg",
  "/timetable/_app/immutable/assets/two_triangles.1c6df425.svg",
  "/timetable/_app/immutable/assets/type.185fa51f.svg",
  "/timetable/_app/immutable/assets/x.3199f1f3.svg"
], n = [
  "/timetable/favicon.ico",
  "/timetable/icon/android-chrome-192x192.png",
  "/timetable/icon/android-chrome-512x512.png",
  "/timetable/icon/apple-touch-icon.png",
  "/timetable/icon/badge.png",
  "/timetable/icon/browserconfig.xml",
  "/timetable/icon/favicon-16x16.png",
  "/timetable/icon/favicon-32x32.png",
  "/timetable/icon/mstile-144x144.png",
  "/timetable/icon/mstile-150x150.png",
  "/timetable/icon/mstile-310x150.png",
  "/timetable/icon/mstile-310x310.png",
  "/timetable/icon/mstile-70x70.png",
  "/timetable/icon/safari-pinned-tab.svg",
  "/timetable/site.webmanifest"
], b = [
  "/timetable/"
], c = "1677021699156", s = `cache-${c}`, i = [...l, ...n, ...b];
self.addEventListener("install", (e) => {
  async function t() {
    await (await caches.open(s)).addAll(i);
  }
  e.waitUntil(t());
});
self.addEventListener("activate", (e) => {
  async function t() {
    for (const a of await caches.keys())
      a !== s && await caches.delete(a);
  }
  e.waitUntil(t());
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET")
    return;
  async function t() {
    const a = new URL(e.request.url), m = await caches.open(s);
    return i.includes(a.pathname) ? m.match(e.request) : await fetch(e.request);
  }
  e.respondWith(t());
});
