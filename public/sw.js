/* eslint-disable no-undef */


importScripts('/workbox-sw.js')

// workbox.routing.registerRoute(
//   new RegExp('https://jsonplaceholder.typicode.com/users'),
//   workbox.strategies.cacheFirst()
// )

// workbox.routing.registerRoute(
//   new RegExp('https://fonts.(?:googleapis|gstatic).com/(.*)'),
//   workbox.strategies.cacheFirst({
//     cacheName: 'google-fonts',
//     plugins: [
//       new workbox.expiration.Plugin({
//         maxEntries: 30
//       }),
//       new workbox.cacheableResponse.Plugin({
//         statuses: [0, 200]
//       })
//     ]
//   })
// )

// install


workbox.precaching.precacheAndRoute([{
  url: '/'

}])
