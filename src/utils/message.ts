import { message as store } from '../store'
import type { MessageType } from '../types'

export async function message (
  message: string,
  type: MessageType,
  buttons?: Array<{
    text: string
    action: () => Promise<void> | void
  }>
): Promise<void> {
  store.set({
    message,
    type,
    buttons
  })
}
