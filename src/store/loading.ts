import { writable } from 'svelte/store'

const store = writable({
  isShow: false
})

export default store

export function show (): void {
  store.set({
    isShow: true
  })
}

export function hide (): void {
  store.set({
    isShow: false
  })
}
