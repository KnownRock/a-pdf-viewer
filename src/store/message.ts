import { writable } from 'svelte/store'

const store = writable({
  message: null as string | null,
  type: null as 'success' | 'warning' | 'error' | 'info' | null
})

export default store
