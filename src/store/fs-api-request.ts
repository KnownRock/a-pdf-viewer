import { writable } from 'svelte/store'

const store = writable({
  isShow: false,
  callback: null as (() => Promise<void>) | null
})

export default store
