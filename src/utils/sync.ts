import { getSimpleFs } from '../utils/simple-fs'
import { SimpleFsName, type SimpleFs, type Book, type Event } from '../types'
import { getS3Config } from '../utils/config'
import { state } from '../store'
export async function getRemoteSimpleFs (): Promise<SimpleFs> {
  const s3Config = await getS3Config()
  if (s3Config.endpoint === '') {
    throw new Error('Invalid endpoint')
  }

  const s3 = await getSimpleFs(SimpleFsName.s3, s3Config)

  return s3
}

async function getBooksAndEvents (simpleFs: SimpleFs): Promise<{
  books: Record<Book['id'], Book>
  events: Event[]
}> {
  let books: Record<Book['id'], Book> = {}
  let events = [] as Event[]

  const booksJson = await simpleFs.read('books.json', 'text')
  if (booksJson !== undefined) {
    books = JSON.parse(booksJson as string) as Record<Book['id'], Book>
  }

  const eventsJson = await simpleFs.read('events.json', 'text')
  if (eventsJson !== undefined) {
    events = JSON.parse(eventsJson as string) as Event[]
  }

  return {
    books,
    events
  }
}

export async function syncTwoSimpleFs (
  source: SimpleFs,
  target: SimpleFs
): Promise<void> {
  const booksJsonPath = 'books.json'
  const eventsJsonPath = 'events.json'

  const { books: localBooks, events: localEvents } = await getBooksAndEvents(source)
  const { books: remoteBooks, events: remoteEvents } = await getBooksAndEvents(target)

  const eventByEidDict: Record<string, Event> = {}
  localEvents.forEach((event) => {
    eventByEidDict[event.eid] = event
  })
  remoteEvents.forEach((event) => {
    eventByEidDict[event.eid] = event
  })

  const sortedMergedEvents = Object.values(eventByEidDict).sort((a, b) => {
    return b.timestamp - a.timestamp
  })

  // books in local and remote as add event to make sure when event is lost, the latest one will be used
  const keyedEventDict: Record<string, Event> = {}
  Object.keys(localBooks).forEach((id) => {
    keyedEventDict[`ex-${id}`] = {
      type: 'add',
      eid: id,
      timestamp: 0,
      payload: {
        id
      }
    }
  })
  Object.keys(remoteBooks).forEach((id) => {
    keyedEventDict[`ex-${id}`] = {
      type: 'add',
      eid: id,
      timestamp: 0,
      payload: {
        id
      }
    }
  })

  sortedMergedEvents.forEach((event) => {
    if (event.type === 'add' || event.type === 'del') {
      const key = `ex-${event.payload.id}`

      if (keyedEventDict[key] === undefined) {
        keyedEventDict[key] = event
      } else if (keyedEventDict[key].timestamp < event.timestamp) {
        keyedEventDict[key] = event
      }
    } else {
      const key = `${event.type}-${event.payload.id}${event.type === 'update' ? `-${event.payload.prop}` : ''}`
      if (keyedEventDict[key] === undefined) {
        keyedEventDict[key] = event
      } else if (keyedEventDict[key].timestamp < event.timestamp) {
        keyedEventDict[key] = event
      }
    }
  })

  const nowBookIds: Array<Book['id']> = []
  const deletedBookIds: Array<Book['id']> = []
  Object.values(keyedEventDict).forEach((event) => {
    if (event.type === 'add') {
      nowBookIds.push(event.payload.id)
    } else if (event.type === 'del') {
      deletedBookIds.push(event.payload.id)
    }
  })

  const mergedBooks = new Map<string, Book>()
  nowBookIds.forEach((id) => {
    const book = localBooks[id] ?? remoteBooks[id]
    if (book !== undefined) {
      mergedBooks.set(id, book)
    } else {
      // throw new Error(`Book ${id} not found`)
      console.error(`Book ${id} not found`)
    }
  })
  deletedBookIds.forEach((id) => {
    mergedBooks.delete(id)
  })

  const needDownloadBookIds = nowBookIds.filter((id) => {
    return localBooks[id] === undefined && remoteBooks[id] !== undefined
  })

  const needUploadBookIds = nowBookIds.filter((id) => {
    return remoteBooks[id] === undefined && localBooks[id] !== undefined
  })

  // TODO: remove from merged books when file not exist
  for (const id of needDownloadBookIds) {
    const book = remoteBooks[id]
    if (book === undefined) {
      throw new Error(`Book ${id} not found`)
    }

    const bookBuffer = await target.read(`books/${id}.pdf`, 'arrayBuffer')
    if (bookBuffer === undefined) {
      console.error(`Book ${id} not found`)
      continue
    }
    await source.write(`books/${id}.pdf`, bookBuffer as ArrayBuffer)

    const bookPngBuffer = await target.read(`books/${id}.png`, 'arrayBuffer')
    if (bookPngBuffer === undefined) {
      console.error(`Book ${id} not found`)
      continue
    }
    await source.write(`books/${id}.png`, bookPngBuffer as ArrayBuffer)
  }

  for (const id of needUploadBookIds) {
    const book = localBooks[id]
    if (book === undefined) {
      throw new Error(`Book ${id} not found`)
    }

    const bookBuffer = await source.read(`books/${id}.pdf`, 'arrayBuffer')
    if (bookBuffer === undefined) {
      console.error(`Book ${id} not found`)
      continue
    }
    await target.write(`books/${id}.pdf`, bookBuffer as ArrayBuffer)

    const bookPngBuffer = await source.read(`books/${id}.png`, 'arrayBuffer')
    if (bookPngBuffer === undefined) {
      console.error(`Book ${id} not found`)
      continue
    }
    await target.write(`books/${id}.png`, bookPngBuffer as ArrayBuffer)
  }

  const latestBooks: Record<Book['id'], Book> = {}
  for (const [id, book] of mergedBooks) {
    latestBooks[id] = book
  }

  const latestEvents =
    Object.values(keyedEventDict).filter((event) => {
      // keep del event to make sure book is deleted when old client sync
      return latestBooks[event.payload.id] !== undefined || event.type === 'del'
    })

  latestEvents.forEach((event) => {
    if (event.type === 'update') {
      const book = latestBooks[event.payload.id]
      if (book === undefined) {
        throw new Error(`Book ${event.payload.id} not found`)
      }
      if (event.payload.prop === 'title') {
        book.title = event.payload.title
      }
      if (event.payload.prop === 'progress') {
        book.progress = event.payload.progress
      }
      if (event.payload.prop === 'state') {
        book.state = event.payload.state
      }

      // update updateat
      if (book.updateAt < event.timestamp) {
        book.updateAt = event.timestamp
      }
    }
  })

  await target.write(booksJsonPath, JSON.stringify(latestBooks))
  await target.write(eventsJsonPath, JSON.stringify(latestEvents))

  await source.write(booksJsonPath, JSON.stringify(latestBooks))
  await source.write(eventsJsonPath, JSON.stringify(latestEvents))

  const needDeleteLocalBookIds = Object.keys(localBooks).filter((id) => {
    return latestBooks[id] === undefined
  })

  const needDeleteRemoteBookIds = Object.keys(remoteBooks).filter((id) => {
    return latestBooks[id] === undefined
  })

  for (const id of needDeleteLocalBookIds) {
    await source.delete(`books/${id}.pdf`)
    await source.delete(`books/${id}.png`)
  }

  for (const id of needDeleteRemoteBookIds) {
    await target.delete(`books/${id}.pdf`)
    await target.delete(`books/${id}.png`)
  }

  state.update((state) => {
    state.books = latestBooks
    state.events = latestEvents
    return state
  })
}