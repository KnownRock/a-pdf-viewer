import { writable } from 'svelte/store'

const store = writable<{
  isPermissionGranted: boolean
}>

export default store
