import { v4 as uuid } from 'uuid'
import type { Book, Event, EventRaw } from '../types'
import { state } from '../store'

export function genEvent (e: EventRaw): Event {
  return {
    ...e,
    timestamp: Date.now(),
    eid: uuid()
  }
}

export function addBook (id: string): void {
  state.update((state) => {
    state.events.push(genEvent({
      type: 'add',
      payload: {
        id
      }
    }))

    return state
  })
}

export function deleteBook (id: string): void {
  state.update((state) => {
    state.events.push(genEvent({
      type: 'del',
      payload: {
        id
      }
    }))

    return state
  })
}

// interface UpdateBook {
//   (id: string, prop: 'title', value: string): void
//   (id: string, prop: 'progress', value: number): void
//   (id: string, prop: 'state', value: Book['state']): void
// }

function updateBook (id: string, prop: 'title', value: string): void
function updateBook (id: string, prop: 'progress', value: number): void
function updateBook (id: string, prop: 'state', value: Book['state']): void
function updateBook (id: string, prop: string, value: any): void {
  state.update((state) => {
    state.events.push(genEvent({
      type: 'update',
      payload: {
        id,
        prop,
        value
      }
    }))

    return state
  })
}

export { updateBook }
