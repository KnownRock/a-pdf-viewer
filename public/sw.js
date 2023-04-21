/* eslint-disable no-undef */

importScripts('/workbox-sw.js')
importScripts('/files.js')
workbox.precaching.precacheAndRoute(files)

const handler = workbox.precaching.createHandlerBoundToURL('/index.html')
const navigationRoute = new workbox.routing.NavigationRoute(handler, {
  allowlist: [/^(\/[a-z0-9-]+)+$/]
})

workbox.routing.registerRoute(navigationRoute)
