import { writable, get } from 'svelte/store'
import type { Book, Event, SimpleFs } from '../types'
import { simpleFs as simpleFsStore } from '.'

const store = writable<{
  books: Record<Book['id'], Book>
  events: Event[]
  isInitiated: boolean
}>({
  books: {},
  events: [],
  isInitiated: false
})

async function saveObjectToFile (simpleFs: SimpleFs, fileName: string, obj: any): Promise<void> {
  await simpleFs.write(fileName, JSON.stringify(obj))
}
async function getBooksBySimpleFs (simpleFs: SimpleFs): Promise<Record<Book['id'], Book>> {
  const bookJson = await simpleFs.read('books.json', 'text')
  return bookJson !== undefined
    ? JSON.parse(bookJson as string)
    : {}
}

async function getEventsBySimpleFs (simpleFs: SimpleFs): Promise<Event[]> {
  const eventsJson = await simpleFs.read('events.json', 'text')
  return eventsJson === undefined
    ? []
    : JSON.parse(eventsJson as string)
}

let task: Promise<void> | null = null

simpleFsStore.subscribe((simpleFsStore) => {
  task = (async () => {
    if (simpleFsStore?.simpleFs !== null) {
      const simpleFs = simpleFsStore.simpleFs
      const books = await getBooksBySimpleFs(simpleFs)
      const events = await getEventsBySimpleFs(simpleFs)
      store.set({
        books,
        events,
        isInitiated: true
      })
    } else {
      store.set({
        books: {},
        events: [],
        isInitiated: false
      })
    }
  })()

  task.then(() => {
    task = null
  }).catch(console.error)
})

export default store

async function saveState (): Promise<void> {
  if (task != null) {
    await task
  }

  const simpleFs = get(simpleFsStore).simpleFs
  if (simpleFs == null) {
    console.error('simpleFs is null')
    return
  }

  const events = get(store).events
  const isDupEventsDict: Record<string, boolean> = {}
  const newEvents = [] as Event[]
  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i]
    const key = `${event.type}-${event.payload.id}-${event.type === 'update' ? event.payload.prop : ''}`
    if (isDupEventsDict[key]) {
      continue
    }
    isDupEventsDict[key] = true
    newEvents.push(event)
  }
  newEvents.sort((a, b) => a.timestamp - b.timestamp)

  store.update((state) => {
    state.events = newEvents
    return state
  })

  await saveObjectToFile(simpleFs, 'books.json', get(store).books)
  await saveObjectToFile(simpleFs, 'events.json', newEvents)
}

export async function updateBookProgress (id: Book['id'], progress: Book['progress']): Promise<void> {
  store.update((state) => {
    state.books[id].progress = progress
    state.books[id].updateAt = Date.now()

    state.events.push({
      type: 'update',
      payload: {
        id,
        prop: 'progress',
        progress
      },
      timestamp: Date.now()
    })

    return state
  })

  await saveState()
}

export async function updateBookTitle (id: Book['id'], title: Book['title']): Promise<void> {
  store.update((state) => {
    state.books[id].title = title
    state.books[id].updateAt = Date.now()

    state.events.push({
      type: 'update',
      payload: {
        id,
        prop: 'title',
        title
      },
      timestamp: Date.now()
    })

    return state
  })

  await saveState()
}

export async function updateBookState (id: Book['id'], bookState: Book['state']): Promise<void> {
  store.update((state) => {
    state.books[id].state = bookState
    state.books[id].updateAt = Date.now()

    state.events.push({
      type: 'update',
      payload: {
        id,
        prop: 'state',
        state: bookState
      },
      timestamp: Date.now()
    })

    return state
  })

  await saveState()
}

export async function deleteBook (id: string): Promise<void> {
  store.update((state) => {
    state.events.push({
      type: 'del',
      payload: {
        id
      },
      timestamp: Date.now()
    })
    return {
      ...state,
      books: Object.fromEntries(Object.entries(state.books).filter(([key]) => key !== id))
    }
  })

  await saveState()
}

export async function addBook (book: Book): Promise<void> {
  store.update((state) => {
    state.books[book.id] = book
    state.events.push({
      type: 'add',
      payload: {
        id: book.id
      },
      timestamp: Date.now()
    })
    return state
  })

  await saveState()
}
