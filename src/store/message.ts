import { writable } from 'svelte/store'
import type { MessageType } from '../types'

const store = writable<{
  message: string | null
  type: MessageType | null

  buttons?: Array<{
    text: string
    action: () => void | Promise<void>
  }>
}>({
        message: null,
        type: null
      })

export default store
