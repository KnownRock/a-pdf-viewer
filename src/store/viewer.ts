
import { writable } from 'svelte/store'

export default writable<{
  bookId: string | null
}>({
  bookId: null
})
