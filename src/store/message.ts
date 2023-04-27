import { writable } from 'svelte/store'

const store = writable<{
  message: string | null
  type: 'success' | 'warning' | 'error' | 'info' | null

  buttons?: Array<{
    text: string
    action: () => void | Promise<void>
  }>
}>({
        message: null,
        type: null
      })

export default store
