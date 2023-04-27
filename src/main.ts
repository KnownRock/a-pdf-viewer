import './app.css'
import './i18n/index'
import './style.css'
import 'svelte-material-ui/bare.css'
import App from './App.svelte'
import { Workbox } from 'workbox-window'
import { message } from './utils/message'

const App2 = App as unknown as new (options: any) => any

const app = new App2({
  target: document.getElementById('app')
})

// only register service worker in production
if (import.meta.env.PROD) {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/sw.js')

    wb.addEventListener('waiting', async () => {
      const messageText = 'message.sw.update-available'
      const buttonText = 'message.sw.update'

      await message(messageText, 'info', [{
        text: buttonText,
        action: async () => {
          await wb.messageSW({ type: 'SKIP_WAITING' })

          window.location.reload()
        }
      }])

      console.log('A new service worker has installed, but it can\'t activate until all tabs running the current version have fully unloaded.')
    })

    wb.register().catch((err) => {
      console.error(err)
    })
  }
}

export default app
