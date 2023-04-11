import './app.css'
import './i18n/index'
import './style.css'
import 'svelte-material-ui/bare.css'
import App from './App.svelte'

const App2 = App as unknown as new (options: any) => any

const app = new App2({
  target: document.getElementById('app')
})
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch((err) => {
    console.error(err)
  })
}

export default app
