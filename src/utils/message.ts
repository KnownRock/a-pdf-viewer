import { message as store } from '../store'
import type { MessageType } from '../types'

export async function message (
  message: string,
  type: MessageType
): Promise<void> {
  store.set({
    message,
    type
  })
}
