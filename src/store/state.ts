import { writable, get } from 'svelte/store'
import type { Book, Event } from '../types'
import rescourceStore from './resource'

const store = writable<{
  books: Record<Book['id'], Book>
  events: Event[]
  isInitiated: boolean
}>({
  books: {},
  events: [],
  isInitiated: false
})

async function getFileContentWithDefault (
  resourceDir: FileSystemDirectoryHandle, fileName: string, defaultContent: string
): Promise<string> {
  const fileHandle = await resourceDir.getFileHandle(fileName, {
    create: true
  })
  const file = await fileHandle.getFile()
  const fileJson = await file.text()
  if (fileJson !== '') {
    return fileJson
  } else {
    await (await fileHandle.createWritable()).write(defaultContent)
    return defaultContent
  }
}

async function saveObjectToFile (resourceDir: FileSystemDirectoryHandle, fileName: string, obj: any): Promise<void> {
  const fileHandle = await resourceDir.getFileHandle(fileName, {
    create: true
  })
  const writable = await fileHandle.createWritable()
  await writable.write(JSON.stringify(obj))
  await writable.close()
}

async function getBookFromResourceDir (resourceDir: FileSystemDirectoryHandle): Promise<Record<Book['id'], Book>> {
  const booksJson = await getFileContentWithDefault(resourceDir, 'books.json', '{}')
  return JSON.parse(booksJson)
}

async function getEventsFromResourceDir (resourceDir: FileSystemDirectoryHandle): Promise<Event[]> {
  const eventsJson = await getFileContentWithDefault(resourceDir, 'events.json', '[]')
  return JSON.parse(eventsJson)
}
let task: Promise<void> | null = null
rescourceStore.subscribe((resource) => {
  task = (async () => {
    if (resource.resourceDir != null) {
      const resourceDir = resource.resourceDir
      const books = await getBookFromResourceDir(resourceDir)
      const events = await getEventsFromResourceDir(resourceDir)
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
  const resourceDir = get(rescourceStore).resourceDir
  if (resourceDir == null) {
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

  await saveObjectToFile(resourceDir, 'books.json', get(store).books)
  await saveObjectToFile(resourceDir, 'events.json', newEvents)
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
