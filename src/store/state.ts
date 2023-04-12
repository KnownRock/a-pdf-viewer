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
  await saveObjectToFile(resourceDir, 'books.json', get(store).books)
  await saveObjectToFile(resourceDir, 'events.json', get(store).events)
}

export async function updateBook (id: Book['id'], prop: 'title', title: Book['title']): Promise<void> {
  store.update((state) => {
    state.books[id].title = title
    state.books[id].updateAt = Date.now()
    state.events.push({
      type: 'update',
      payload: {
        id,
        prop,
        title
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
