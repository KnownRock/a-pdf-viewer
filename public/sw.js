/* eslint-disable no-undef */

importScripts('/workbox-sw.js')
importScripts('/files.js')
workbox.precaching.precacheAndRoute(files)

const handler = workbox.precaching.createHandlerBoundToURL('/index.html')
const navigationRoute = new workbox.routing.NavigationRoute(handler, {
  allowlist: [/^(\/[a-z0-9-]+)+$/]
})

workbox.routing.registerRoute(navigationRoute)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
